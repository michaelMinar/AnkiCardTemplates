"use strict";

const { mulberry32, randInt, choice, gcd, lcm } = require("../../runtime/rng");
const { registerTemplate } = require("../../runtime");

const id = "number_theory/lcm_basic";

const meta = {
    title: "Least Common Multiple (2–3 numbers)",
    skills: ["number-theory", "lcm", "multiples"],
    gradeBands: [5, 6],
    defaults: {
        count: 2,            // operands: 2 or 3
        digits: [1, 2],      // 1- or 2-digit by default
        ensureNonTrivial: true,
        lcmCap: 5000,
    },
};

function normalizeDigitsCfg(cfgDigits) {
    if (Array.isArray(cfgDigits) && cfgDigits.length > 0) {
        return cfgDigits.filter((d) => d === 1 || d === 2 || d === 3);
    }
    if (cfgDigits === 1 || cfgDigits === 2 || cfgDigits === 3) return [cfgDigits];
    return [1, 2];
}

function rangeFromDigits(d) {
    if (d === 1) return { min: 2, max: 9 };
    if (d === 2) return { min: 10, max: 99 };
    if (d === 3) return { min: 100, max: 999 };
    return { min: 2, max: 9 };
}

function pickMultipleOf(rng, prime, min, max) {
    const first = Math.ceil(min / prime) * prime;
    if (first > max) return null;
    const count = Math.floor((max - first) / prime) + 1;
    const offset = randInt(rng, 0, count - 1);
    return first + offset * prime;
}

function genOperands(rng, config) {
    const digitsList = normalizeDigitsCfg(config.digits ?? meta.defaults.digits);
    const d = choice(rng, digitsList);
    const baseRange = rangeFromDigits(d);
    const min = config.range && typeof config.range === 'object' && typeof config.range.min === 'number'
        ? Math.max(2, config.range.min | 0)
        : baseRange.min;
    const max = config.range && typeof config.range === 'object' && typeof config.range.max === 'number'
        ? (config.range.max | 0)
        : baseRange.max;
    const ensureNonTrivial = config.ensureNonTrivial !== false;
    const smallPrimes = [2, 3, 5, 7];
    const count = (config.count === 3 ? 3 : 2);
    const attempts = 40;
    const cap = typeof config.lcmCap === 'number' ? Math.max(1, config.lcmCap | 0) : meta.defaults.lcmCap;

    let lastOps = [2, 4];
    for (let i = 0; i < attempts; i++) {
        let ops = new Array(count);
        if (ensureNonTrivial && rng() < 0.7) {
            const p = choice(rng, smallPrimes);
            // Ensure at least two operands share p
            ops[0] = pickMultipleOf(rng, p, min, max) ?? randInt(rng, min, max);
            ops[1] = pickMultipleOf(rng, p, min, max) ?? randInt(rng, min, max);
            if (count === 3) {
                // 50% chance to share p; otherwise uniform
                if (rng() < 0.5) ops[2] = pickMultipleOf(rng, p, min, max) ?? randInt(rng, min, max);
                else ops[2] = randInt(rng, min, max);
            }
        } else {
            for (let k = 0; k < count; k++) ops[k] = randInt(rng, min, max);
        }
        ops = ops.map((n) => (n < 2 ? 2 : n));
        lastOps = ops;
        // Compute lcm and evaluate constraints
        let ans = ops[0];
        for (let k = 1; k < ops.length; k++) ans = lcm(ans, ops[k]);
        if (ans <= cap) {
            // If ensureNonTrivial, prefer sets with some shared factor among at least two
            const g01 = gcd(ops[0], ops[1]);
            const nonTrivial = (g01 > 1) || (ops.length === 3 && (gcd(ops[0], ops[2]) > 1 || gcd(ops[1], ops[2]) > 1));
            if (!ensureNonTrivial || nonTrivial) {
                return { ops, ans };
            }
        }
    }
    // Fallback to lastOps even if cap not met; compute ans
    let ans = lastOps[0];
    for (let k = 1; k < lastOps.length; k++) ans = lcm(ans, lastOps[k]);
    return { ops: lastOps, ans };
}

function generate({ seed, config = {}, side = "front" }) {
    if (typeof seed !== "number") throw new Error("generate: seed (number) is required");
    const rng = mulberry32(seed);
    const { ops, ans } = genOperands(rng, config);
    const disp = ops.join(", ");
    const front = `<div class=\"q\">LCM(${disp}) = ?</div>`;
    if (side !== "back") return { html: front, data: { operands: ops.slice(), answer: ans } };
    const back = `<div class=\"q\">LCM(${disp}) = <b>${ans}</b></div>`;
    return { html: back, data: { operands: ops.slice(), answer: ans } };
}

function validate({ seed, config = {} }) {
    try {
        const rng = mulberry32(seed);
        const { ops, ans } = genOperands(rng, config);
        let ok = true;
        for (const n of ops) {
            if (ans % n !== 0) ok = false;
        }
        if ((config.count | 0) !== 3) {
            // Pairwise property for count=2
            const a = ops[0], b = ops[1];
            if (a > 0 && b > 0) {
                const g = gcd(a, b);
                if (ans * g !== a * b) {
                    ok = false;
                }
            }
        }
        const cap = typeof config.lcmCap === 'number' ? Math.max(1, config.lcmCap | 0) : meta.defaults.lcmCap;
        const warnings = [];
        if (ans > cap) warnings.push("LCM exceeded cap; generation fell back to last sample");
        if ((config.ensureNonTrivial !== false)) {
            const nonTrivial = (gcd(ops[0], ops[1]) > 1) || (ops.length === 3 && (gcd(ops[0], ops[2]) > 1 || gcd(ops[1], ops[2]) > 1));
            if (!nonTrivial) warnings.push("operands likely coprime; LCM equals product for pairs");
        }
        return { ok, warnings };
    } catch (e) {
        return { ok: false, errors: [String(e && e.message ? e.message : e)] };
    }
}

registerTemplate(id, { id, meta, generate, validate });

module.exports = { id, meta, generate, validate };

