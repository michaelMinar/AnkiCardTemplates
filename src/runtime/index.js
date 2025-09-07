"use strict";

const rng = require("./rng");

const REGISTRY = Object.create(null);

function registerTemplate(id, impl) {
  if (!id || typeof id !== "string") {
    throw new Error("registerTemplate: id must be a non-empty string");
  }
  if (!impl || typeof impl.generate !== "function") {
    throw new Error("registerTemplate: impl must include generate(opts)");
  }
  REGISTRY[id] = impl;
  return impl;
}

function getTemplate(id) {
  const t = REGISTRY[id];
  if (!t) throw new Error(`Unknown template: ${id}`);
  return t;
}

// Safe browser exposure for Anki usage
if (typeof window !== "undefined") {
  // Expose a minimal, stable API
  window.ANKI_TEMPLATES = {
    register: registerTemplate,
    get: getTemplate,
    util: {
      mulberry32: rng.mulberry32,
      randInt: rng.randInt,
      choice: rng.choice,
      shuffle: rng.shuffle,
      gcd: rng.gcd,
      lcm: rng.lcm,
    },
  };
}

module.exports = {
  registerTemplate,
  getTemplate,
  util: rng,
};

