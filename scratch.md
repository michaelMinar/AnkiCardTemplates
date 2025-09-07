# End-to-End Anki Generation – Working Plan (Scratch)

This scratch document reconciles the new design docs with the current repo and proposes a pragmatic, incremental plan to reach a full Anki generation pipeline without breaking what works.

## Current State (Repo)
- Tests: Jest, Node 18 in CI, green suite for existing templates.
- Build: `build.js` assembles `templates/*/*.html` + `src/*/*.js` into `build/*/{front.js,back.js}` for Anki copy/paste.
- Templates: one modernized example (`order-of-operations`) with shared functions in `src/…/index.js`; legacy HTML+JS examples under top level dirs.
- No bundler or runtime registry; randomness uses `Math.random()` + `localStorage` to bridge front/back.

## Design Docs – Quick Assessment
Strong:
- Deterministic seed-based generation; shared runtime (rng + registry).
- Clear template contract (generate/validate, meta) and testing approach.
- Sample rendering script and bundle artifact are useful for reviewer UX.

Gaps vs repo:
- Assumes Vitest + esbuild and new directory layout; we have Jest + a custom builder.
- Switch to seed-driven determinism requires refactors (today we use localStorage across sides).
- Coverage gates and bundle artifact not yet present in CI.

Decision: adopt the architecture incrementally while keeping Jest/CI/build working. Avoid a big-bang rewrite.

## Target Architecture (Incremental)
- Runtime core (Phase 1):
  - `src/runtime/rng.js` (mulberry32 + helpers) and `src/runtime/index.js` (register/get, window.ANKI_TEMPLATES exposure).
  - Keep CommonJS compatibility so Jest works without config churn.
- Template contract (Phase 2):
  - New templates implement `{ id, meta, generate(opts), validate?(opts) }` and register with runtime.
  - Deterministic operands from `seed`; front/back pass `side`.
- Bundling (Phase 3):
  - Add esbuild (or rollup) to emit `dist/dynamic-math.bundle.js` (runtime + templates).
  - Provide example Anki front/back HTML that loads the bundle and calls `generate()`.
  - Keep `build.js` for existing templates until migrated.
- Migration (Phase 4+):
  - Gradually port templates to the new contract; replace `localStorage` handoff with seed.
  - Add sample seeds and invariants; deprecate legacy top-level template dirs.

## Proposed Plan of Record (POR)
- Keep Jest and current CI for now; introduce bundler later.
- Enforce deterministic RNG in new templates; allow legacy randomness temporarily.
- Add lightweight sample rendering script for reviewers.
- Defer coverage gates until after bundler + 1–2 template ports.

## One-PR Scope (right-sized)
Goal: introduce the runtime skeleton and a starter template without touching existing build/CI.

Deliverables:
- Add `src/runtime/rng.js` with mulberry32, randInt, choice, shuffle, gcd, lcm.
- Add `src/runtime/index.js` with `registerTemplate/getTemplate` and safe browser exposure (`window.ANKI_TEMPLATES`).
- Add `src/templates/_starter/add_two_numbers.js` implementing the contract and registering itself (deterministic by seed).
- Add `scripts/render-samples.js` to print N front/back samples for a given `TemplateId` and seed range.
- Tests (Jest):
  - `tests/runtime/rng.test.js` – determinism and helper invariants.
  - `tests/templates/starter.test.js` – determinism per seed and basic validate.
- Package scripts:
  - `"samples": "node scripts/render-samples.js topic/add_two_numbers 1 5"`.
- Docs:
  - Short section in README linking to the starter and how to run samples.

Out of scope for this PR:
- Replacing `build.js`, migrating existing templates, or switching to esbuild/Vitest.

## Risks & Mitigations
- Dual systems (legacy vs runtime): keep changes additive; do not change existing template behavior.
- Browser globals: scope exposure to `window.ANKI_TEMPLATES` only.
- Determinism drift: test seeds and invariants early; forbid `Math.random()` in new code paths.

## Open Questions
- Bundler choice: esbuild vs rollup (leaning esbuild for speed/simple config).
- Minimal Anki HTML API: field names and bundle invocation signature.
- Node version: keep CI on 18 or bump to 20 when bundler lands.

## Next Steps (If this plan looks good)
- I’ll implement the “One-PR Scope” above as an unstaged change set for review.
- After merge, follow up PR to add esbuild and a demo bundle + example Anki HTML without migrating existing templates.

## PR TODOs (tracking)
- [x] Add deterministic RNG helpers at `src/runtime/rng.js` (mulberry32, randInt, choice, shuffle, gcd, lcm).
- [x] Add runtime registry at `src/runtime/index.js` with `registerTemplate/getTemplate` and safe `window.ANKI_TEMPLATES` exposure.
- [x] Add starter template at `src/templates/_starter/add_two_numbers.js` implementing contract and registering itself.
- [x] Add sample renderer at `scripts/render-samples.js` and `npm run samples` script.
- [x] Add Jest tests: `tests/runtime/rng.test.js`, `tests/templates/starter.test.js`.
- [x] Update README with a minimal Samples section.
- [ ] Reviewer feedback: confirm contract naming, starter placement, and sample script UX.
- [ ] Decide bundler (esbuild vs rollup) and where to host minimal Anki HTML in repo.
