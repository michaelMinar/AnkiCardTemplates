# Number Theory Templates: GCF and LCM — Design & Plan

Purpose: Define and scope two new dynamic templates — Greatest Common Factor (GCF) and Least Common Multiple (LCM) — using the seed‑driven runtime. Provide config knobs, generation logic, validation, tests, and a delivery plan.

## Goals
- Add two new template types with deterministic generation and per‑review behavior by default.
- Keep front/back parity via the shared seed; reveal the answer and optional work steps on the back.
- Provide sensible defaults for 6th grade practice with room to tune difficulty.

## Non‑Goals
- No UI frameworks or heavy math rendering; stick to simple HTML.
- No external network calls or remote factorization.

## Template Overview
- GCF (two numbers, 2–3 digits each by default)
  - id: `number_theory/gcf_basic`
  - Given two integers A and B (range 2‑digit or 3‑digit), ask for GCF(A, B).

- LCM (two or three numbers, 1–3 digits each by default)
  - id: `number_theory/lcm_basic`
  - Given 2 or 3 integers (1‑ to 3‑digit), ask for LCM.

Both templates use `mulberry32(seed)` for determinism. Per‑review seeding is handled by the HTML with `resolveReviewSeed`.

## Config (GenerateOptions.config)

Shared conventions
- All config keys optional; fall back to sensible defaults.
- Provide defaults in `meta.defaults` for discoverability.

GCF (`number_theory/gcf_basic`)
- `digits`: 2 | 3 | [2,3] (default: [2,3])
- `count`: 2 (default; optional 3 as stretch)
- `ensureNonTrivial`: boolean (default: true)
  - If true, bias generation so GCF > 1 most of the time (without being always trivial), while still allowing occasional coprime pairs.
- `range`: { min?: number, max?: number } (optional override; must yield 10–99 or 100–999 if specified)

LCM (`number_theory/lcm_basic`)
- `count`: 2 | 3 (default: 2)
- `digits`: 1 | 2 | 3 | [1,2,3] (default: [1,2])
- `ensureNonTrivial`: boolean (default: true)
  - If true, bias generation so operands share factors to avoid purely coprime sets.
- `lcmCap`: number (default: 5000) — avoid overly large answers for 3 operands; regenerate if exceeded.
- `range`: { min?: number, max?: number } (optional override)

## HTML Content
- Front (both):
  - GCF: `<div class="q">GCF(${A}, ${B}) = ?</div>`
  - LCM: `<div class="q">LCM(${a}, ${b}[, ${c}]) = ?</div>`
- Back (both):
  - Reveal numeric answer.
  - Optionally show factorization steps when helpful, e.g., `84 = 2^2 · 3 · 7` and highlight overlapping primes for GCF or union for LCM.

## Generation Logic

Helpers available
- `gcd(a, b)`, `lcm(a, b)` from `src/runtime/rng.js`.
- `randInt(rng, min, max)` for range picks.

Proposed additional helper (optional)
- `primeFactors(n): Array<[prime, exponent]>` (trial division up to √n). Reusable across both templates.
  - Location: `src/runtime/rng.js` or separate `src/runtime/numberTheory.js`.
  - If we defer adding this to runtime, each template can implement a local `primeFactors` within the file.

GCF generation (two operands)
1. Choose digit length per config → derive [min, max].
2. Sample A from range.
3. If `ensureNonTrivial`, generate B by:
   - With some probability p≈0.7, pick B = A × r / s with small r,s to share factors (clamp to range); otherwise uniform pick.
   - Ensure B within range and B ≠ A fallback to uniform.
4. Compute `ans = gcd(A, B)`; if `ensureNonTrivial` and `ans === 1`, allow a limited number of retries.
5. Return front/back HTML and `data: { A, B, ans }`.

LCM generation (2 or 3 operands)
1. Resolve `count` ∈ {2,3}.
2. Choose digit lengths per config to derive [min, max].
3. Sample operands; if `ensureNonTrivial`, bias to include shared small primes (2, 3, 5, 7) among at least two operands.
4. Compute `ans` via fold: `ans = operands.reduce((acc, n) => lcm(acc, n))`.
5. If `ans > lcmCap`, resample (cap attempts; reduce range or relax ensureNonTrivial as needed).
6. Return front/back HTML and `data: { operands, ans }`.

Edge handling
- Avoid zeros or negatives; enforce operand ≥ 2.
- Enforce count within bounds; clamp digits to [1..3].
- Prevent infinite loops by limiting regeneration attempts (e.g., ≤ 10).

## Validation (`validate(opts)`)
- GCF
  - Recompute `g = gcd(A, B)` from the same seed; ensure `g >= 1` and divides both A and B; report warning if `g === 1` and `ensureNonTrivial`.
- LCM
  - Recompute operands; ensure `ans % n === 0` for all operands.
  - For pairs, verify `lcm(a,b) * gcd(a,b) === a*b` (property check) when `count === 2`.
  - Ensure `ans <= lcmCap` if configured.

## Testing Plan (Jest)
- Determinism: same seed yields identical front HTML per template.
- Parity: back differs from front and contains the numeric answer.
- GCF invariants: divides both; equals 1 rarely when `ensureNonTrivial`.
- LCM invariants: divisible by each operand; property check for pairs; `ans <= lcmCap`.
- RNG guard: extend existing `Math.random` scan to cover new files.

## Template Metadata (`meta`)
GCF defaults
```js
defaults: { digits: [2,3], count: 2, ensureNonTrivial: true }
```

LCM defaults
```js
defaults: { digits: [1,2], count: 2, ensureNonTrivial: true, lcmCap: 100000 }
```

## IDs & Files
- `src/templates/number_theory/gcf_basic.js` (id: `number_theory/gcf_basic`)
- `src/templates/number_theory/lcm_basic.js` (id: `number_theory/lcm_basic`)
- Register both in `src/entry/bundle.js` and `scripts/render-samples.js` for sampling.

## Samples
- Add `scripts/render-samples.js` entries and show examples:
  - `node scripts/render-samples.js number_theory/gcf_basic 1 5`
  - `node scripts/render-samples.js number_theory/lcm_basic 10 12`

## Delivery Plan & Tasks

Milestone A — GCF template
1) Implement `gcf_basic.js` with config + generation + validate.
2) Tests: determinism, divides property, non‑trivial bias warning check.
3) Add to bundle entry and samples script.

Milestone B — LCM template
1) Implement `lcm_basic.js` with config + generation + validate.
2) Tests: determinism, divisibility property; pairwise property for count=2; lcmCap respected.
3) Add to bundle entry and samples script.

Milestone C — (Optional) Shared factorization utility
1) Add `primeFactors(n)` helper (runtime or local per template).
2) Add optional back‑side factorization display.
3) Tests: correctness on selected values; performance acceptable for ≤ 3‑digit inputs.

Docs & Polish
- README: add to template catalog with IDs and example configs.
- `docs/anki-integration-guide.md`: add TemplateId examples.
- `scratch.md`: log milestones and decisions.

Acceptance Criteria
- `npm test` passes; new suites cover invariants and determinism.
- Samples print plausible front/back HTML for seeds across a range.
- Bundle builds; Anki HTML renders and per‑review behavior works (Seed blank) while static seeds behave deterministically.

## Risks & Mitigations
- Large LCM values when `count=3` → cap via `lcmCap` and resample.
- Overly trivial GCF/LCM (coprime sets) → `ensureNonTrivial` bias + limited retries.
- Factorization overhead → keep to trial division with cutoff; 3‑digit worst‑case is fast.

## Open Questions
- Do we want a separate template for 3‑operand GCF (e.g., `gcf_three`), or keep `count` config and limit UI to 2 by default?
- Should back always show factorization steps, or hide behind a config flag (e.g., `showWork: true`)?

