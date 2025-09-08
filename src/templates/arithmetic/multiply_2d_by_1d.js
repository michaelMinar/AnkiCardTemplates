"use strict";

const { mulberry32, randInt } = require("../../runtime/rng");
const { registerTemplate } = require("../../runtime");

const id = "arithmetic/multiply_2d_by_1d";

const meta = {
  title: "Multiply 2-digit by 1-digit",
  skills: ["multiplication"],
  gradeBands: [4, 5, 6],
  defaults: { twoDigitMin: 12, twoDigitMax: 99, oneDigitMin: 2, oneDigitMax: 9 },
};

function generate({ seed, config = {}, side = "front" }) {
  if (typeof seed !== "number") throw new Error("generate: seed (number) is required");
  const {
    twoDigitMin = meta.defaults.twoDigitMin,
    twoDigitMax = meta.defaults.twoDigitMax,
    oneDigitMin = meta.defaults.oneDigitMin,
    oneDigitMax = meta.defaults.oneDigitMax,
  } = config || {};

  const rng = mulberry32(seed);
  const a = randInt(rng, twoDigitMin, twoDigitMax);
  const b = randInt(rng, oneDigitMin, oneDigitMax);
  const answer = a * b;

  const front = `<div class="q">${a} × ${b} = ?</div>`;
  if (side !== "back") return { html: front, data: { a, b } };
  const back = `<div class="q">${a} × ${b} = <b>${answer}</b></div>`;
  return { html: back, data: { a, b, answer } };
}

function validate({ seed, config = {} }) {
  try {
    const {
      twoDigitMin = meta.defaults.twoDigitMin,
      twoDigitMax = meta.defaults.twoDigitMax,
      oneDigitMin = meta.defaults.oneDigitMin,
      oneDigitMax = meta.defaults.oneDigitMax,
    } = config || {};
    const rng = mulberry32(seed);
    const a = randInt(rng, twoDigitMin, twoDigitMax);
    const b = randInt(rng, oneDigitMin, oneDigitMax);
    const ans = a * b;
    const ok = a >= twoDigitMin && a <= twoDigitMax && b >= oneDigitMin && b <= oneDigitMax && ans > 0;
    return { ok, warnings: ok ? [] : ["operands out of range or non-positive answer"] };
  } catch (e) {
    return { ok: false, errors: [String(e && e.message ? e.message : e)] };
  }
}

registerTemplate(id, { id, meta, generate, validate });

module.exports = { id, meta, generate, validate };

