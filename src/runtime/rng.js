"use strict";

// Deterministic PRNG (mulberry32)
function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Inclusive integer in [min, max]
function randInt(rng, min, max) {
  if (max < min) throw new Error("randInt: max < min");
  const r = rng();
  return Math.floor(r * (max - min + 1)) + min;
}

function choice(rng, arr) {
  if (!Array.isArray(arr) || arr.length === 0) throw new Error("choice: empty array");
  const idx = Math.floor(rng() * arr.length);
  return arr[idx];
}

function shuffle(rng, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

function gcd(a, b) {
  a = Math.abs(a | 0);
  b = Math.abs(b | 0);
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function lcm(a, b) {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a * b) / gcd(a, b));
}

module.exports = {
  mulberry32,
  randInt,
  choice,
  shuffle,
  gcd,
  lcm,
};

