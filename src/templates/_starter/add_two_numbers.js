"use strict";

const { mulberry32, randInt } = require("../../runtime/rng");
const { registerTemplate } = require("../../runtime");

const id = "topic/add_two_numbers";

const meta = {
  title: "Add Two Numbers",
  skills: ["addition"],
  gradeBands: [2, 3],
  defaults: { min: 2, max: 12 },
};

function generate({ seed, config = {}, side = "front" }) {
  if (typeof seed !== "number") {
    throw new Error("generate: seed (number) is required");
  }
  const { min = meta.defaults.min, max = meta.defaults.max } = config || {};
  const rng = mulberry32(seed);
  const a = randInt(rng, min, max);
  const b = randInt(rng, min, max);
  const answer = a + b;

  const htmlFront = `<div class="q">${a} + ${b} = ?</div>`;
  if (side !== "back") {
    return { html: htmlFront, data: { a, b } };
  }
  const htmlBack = `<div class="q">${a} + ${b} = <b>${answer}</b></div>`;
  return { html: htmlBack, data: { a, b, answer } };
}

function validate({ seed, config = {} }) {
  try {
    const { min = meta.defaults.min, max = meta.defaults.max } = config || {};
    const rng = mulberry32(seed);
    const a = randInt(rng, min, max);
    const b = randInt(rng, min, max);
    const ans = a + b;
    const ok = ans >= min * 2 && ans <= max * 2;
    return { ok, warnings: ok ? [] : ["answer out of expected range"] };
  } catch (e) {
    return { ok: false, errors: [String(e && e.message ? e.message : e)] };
  }
}

registerTemplate(id, { id, meta, generate, validate });

module.exports = { id, meta, generate, validate };

