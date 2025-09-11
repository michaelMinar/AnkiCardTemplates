"use strict";

const { mulberry32, randInt, choice, gcd } = require("../../runtime/rng");
const { registerTemplate } = require("../../runtime");

const id = "number_theory/gcf_basic";

const meta = {
    title: "Greatest Common Factor (2 numbers)",
    skills: ["number-theory", "gcf", "factors"],
    gradeBands: [5, 6],
    defaults: {
        digits: [2, 3],     // choose 2- or 3-digit operands
        ensureNonTrivial: true, // bias toward GCF > 1
    },
};

function normalizeDigitsCfg(cfgDigits) {
    if (Array.isArray(cfgDigits) && cfgDigits.length > 0) {
        return cfgDigits.filter((d) => d === 2 || d === 3);
    }
    if (cfgDigits === 2 || cfgDigits === 3) return [cfgDigits];
    return [2, 3];
}

function rangeFromDigits(d) {
    if (d === 2) return { min: 10, max: 99 };
    if (d === 3) return { min: 100, max: 999 };
    return { min: 10, max: 99 };
}

function pickMultipleOf(rng, prime, min, max) {
    const first = Math.ceil(min / prime) * prime;
    if (first > max) return null;
    const count = Math.floor((max - first) / prime) + 1;
    const offset = randInt(rng, 0, count - 1);
    return first + offset * prime;
}

function generatePair(rng, config) {
    const digitsList = normalizeDigitsCfg(config.digits ?? meta.defaults.digits);
    const d = choice(rng, digitsList);
    const { min, max } = config.range && typeof config.range === 'object'
        ? { min: Math.max(2, config.range.min | 0 || 2), max: config.range.max | 0 || (d === 3 ? 999 : 99) }
        : rangeFromDigits(d);
    const ensureNonTrivial = config.ensureNonTrivial !== false;

    const smallPrimes = [2, 3, 5, 7];
    const attempts = 20;
    let lastA = 12, lastB = 18; // defaults for safety

    for (let i = 0; i < attempts; i++) {
        let a, b;
        if (ensureNonTrivial && rng() < 0.7) {
            const p = choice(rng, smallPrimes);
            a = pickMultipleOf(rng, p, min, max) ?? randInt(rng, min, max);
            b = pickMultipleOf(rng, p, min, max) ?? randInt(rng, min, max);
        } else {
            a = randInt(rng, min, max);
            b = randInt(rng, min, max);
        }
        if (a < 2) a = 2;
        if (b < 2) b = 2;
        const g = gcd(a, b);
        lastA = a; lastB = b;
        if (!ensureNonTrivial || g > 1) {
            return { a, b, g };
        }
    }
    return { a: lastA, b: lastB, g: gcd(lastA, lastB) };
}

function generate({ seed, config = {}, side = "front" }) {
    if (typeof seed !== "number") throw new Error("generate: seed (number) is required");
    const rng = mulberry32(seed);
    const { a, b, g } = generatePair(rng, config);
    const front = `<div class="q">GCF(${a}, ${b}) = ?</div>`;
    if (side !== "back") return { html: front, data: { a, b, answer: g } };
    const back = `<div class="q">GCF(${a}, ${b}) = <b>${g}</b></div>`;
    return { html: back, data: { a, b, answer: g } };
}

function validate({ seed, config = {} }) {
    try {
        const rng = mulberry32(seed);
        const { a, b, g } = generatePair(rng, config);
        const ok = (a % g === 0) && (b % g === 0) && g >= 1;
        const warnings = [];
        if ((config.ensureNonTrivial !== false) && g === 1) {
            warnings.push("gcf is 1 despite ensureNonTrivial bias");
        }
        return { ok, warnings };
    } catch (e) {
        return { ok: false, errors: [String(e && e.message ? e.message : e)] };
    }
}

registerTemplate(id, { id, meta, generate, validate });

module.exports = { id, meta, generate, validate };

