## PR #2 — Phase 2: Template Contract + Per‑Review Seed Helper (2025‑09‑08)

### Summary
This PR finalizes the Template Contract introduced in Phase 1, adds a new deterministic template, and introduces a per‑review seed utility so dynamic cards can generate a fresh problem each review while maintaining front/back parity. Bundling and Anki HTML integration are intentionally deferred to a follow‑up PR.

### Scope
- Included
  - Contract documentation file, conformance tests, RNG guard.
  - New template: 2‑digit × 1‑digit multiplication.
  - Per‑review seed resolution helper exposed via the runtime.
  - Documentation touch‑ups and samples update.
- Excluded
  - JS bundling (esbuild/rollup) and Anki HTML that references the bundle.
  - Migrating legacy templates or altering `build.js` behavior.

### Key Changes
- Contract docs
  - `src/runtime/types.d.ts` — documentation‑only interfaces for `GenerateOptions`, `GenerateResult`, `TemplateMeta`, and `TemplateImpl`.

- Runtime
  - `src/runtime/index.js` — guard to ensure `impl.id` matches `id` on registration; exposes `util.resolveReviewSeed`.
  - `src/runtime/reviewSeed.js` — new per‑review seed helper:
    - `resolveReviewSeed({ templateId, seedField, side, perReview = true })`
    - Front (no numeric Seed): generates a fresh seed and stores it under `anki.seed.<TemplateId>` in `sessionStorage` (fallbacks: `localStorage`, in‑memory).
    - Back: reads the stored seed and clears it; honors explicit numeric Seed (static mode) on both sides.

- Templates
  - New: `src/templates/arithmetic/multiply_2d_by_1d.js` — deterministic 2d×1d multiplication with `{ id, meta, generate, validate }`.

- Tests (Jest)
  - `tests/templates/contract.test.js` — asserts shape (`id`, `generate`), determinism; scans for forbidden `Math.random` in `src/templates/**`.
  - `tests/templates/multiply_2d_by_1d.test.js` — determinism, front/back parity, simple invariant.
  - `tests/runtime/reviewSeed.test.js` — per‑review flow: front stores seed, back consumes and clears; static override via Seed field.

- Samples & Docs
  - `scripts/render-samples.js` registers both starter and the new template; usage lines for each.
  - `README.md` — “Template Contract (authoring quickstart)” section added.
  - `scratch.md` — appended “Phase 2 – Template Contract: Findings and Plan” and marked TODOs complete for this phase.

### How to Validate Locally
- Install + test
  - `npm ci`
  - `npm test` → all suites should pass.

- Samples (manual sanity checks)
  - `node scripts/render-samples.js topic/add_two_numbers 1 5`
  - `node scripts/render-samples.js arithmetic/multiply_2d_by_1d 10 12`

- Optional guards
  - `rg -n "\bMath\.random\(" src/templates || true` (should produce no lines; enforced by tests)

### Per‑Review Behavior (for upcoming Anki HTML)
- Default: perReview = true when Seed field is not a number.
- Front side
  - `seed = window.ANKI_TEMPLATES.util.resolveReviewSeed({ templateId: id, seedField: Seed, side: 'front' })`
  - Render with `generate({ seed, side: 'front' })`.
- Back side
  - `seed = window.ANKI_TEMPLATES.util.resolveReviewSeed({ templateId: id, seedField: Seed, side: 'back' })`
  - Render with `generate({ seed, side: 'back' })`.
- Static override
  - If the Seed field contains a number, that seed is used on both sides and storage is ignored.

### Impact & Compatibility
- Legacy pipeline unchanged: `build.js` and existing templates continue to work.
- New runtime/templates are additive; no breaking changes to current cards.

### Follow‑ups (Planned for PR #3)
- Bundling with esbuild: emit `dist/dynamic-math.bundle.js` registering runtime + templates.
- Minimal Anki Front/Back HTML that reads fields (TemplateId, Seed, Config), calls `resolveReviewSeed`, and invokes `generate({ side })`.
- Optional CI artifact upload for the bundle.

### Risks & Mitigations
- Seed leakage across cards — mitigated by clearing storage on the back side and namespacing keys by TemplateId.
- Storage unavailability — helper falls back to in‑memory store for the session.
- Determinism drift — guarded by unit tests and a `Math.random` scan.

