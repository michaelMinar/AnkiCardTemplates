"use strict";

// Per-review seed resolution helper.
// Default policy: perReview = true when Seed field is absent or not a number.
// Storage: prefer sessionStorage, then localStorage, then in-memory fallback.

let seedCounter = 1;

function getStorage() {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) return window.sessionStorage;
  } catch (_) {}
  try {
    if (typeof sessionStorage !== "undefined") return sessionStorage;
  } catch (_) {}
  try {
    if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  } catch (_) {}
  try {
    if (typeof localStorage !== "undefined") return localStorage;
  } catch (_) {}
  // In-memory fallback
  const mem = new Map();
  return {
    getItem: (k) => (mem.has(k) ? String(mem.get(k)) : null),
    setItem: (k, v) => void mem.set(k, String(v)),
    removeItem: (k) => void mem.delete(k),
  };
}

function storageKey(templateId) {
  return `anki.seed.${templateId}`;
}

function coerceSeed(val) {
  if (typeof val === "number" && Number.isFinite(val)) return (val >>> 0);
  if (typeof val === "string" && val.trim() !== "") {
    const n = parseInt(val, 10);
    if (!Number.isNaN(n)) return (n >>> 0);
  }
  return null;
}

function freshSeed() {
  const now = (Date.now() >>> 0);
  const extra = (typeof performance !== "undefined" && typeof performance.now === "function")
    ? (Math.floor(performance.now()) >>> 0)
    : 0;
  let salt = 0;
  try {
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      salt = arr[0] >>> 0;
    }
  } catch (_) {}
  let s = (now ^ extra ^ (seedCounter++ >>> 0) ^ salt) >>> 0;
  if (s === 0) s = 1; // avoid zero seed
  return s;
}

// Resolve the seed for a given side (front/back) according to policy.
// Returns a number and performs storage set/remove as needed.
function resolveReviewSeed({ templateId, seedField, side = "front", perReview = true }) {
  if (!templateId || typeof templateId !== "string") {
    throw new Error("resolveReviewSeed: templateId is required");
  }
  const provided = coerceSeed(seedField);
  const key = storageKey(templateId);
  const store = getStorage();

  // If a valid numeric Seed is provided, honor it (static mode).
  if (typeof provided === "number") {
    // Ensure no leftover per-review seed leaks
    try { store.removeItem(key); } catch (_) {}
    return provided;
  }

  // Default perReview=true if no numeric seed provided.
  if (!perReview) {
    // Non-perReview but no valid seed: fall back to a fresh seed without storage.
    return freshSeed();
  }

  if (side === "front") {
    const s = freshSeed();
    try { store.setItem(key, String(s)); } catch (_) {}
    return s;
  }
  // back side
  try {
    const v = store.getItem(key);
    const s = coerceSeed(v);
    if (typeof s === "number") {
      try { store.removeItem(key); } catch (_) {}
      return s;
    }
  } catch (_) {}
  // Fallback: generate fresh if storage missing; back/front may mismatch.
  const s = freshSeed();
  return s;
}

module.exports = {
  resolveReviewSeed,
  _internal: { storageKey, getStorage, freshSeed, coerceSeed },
};
