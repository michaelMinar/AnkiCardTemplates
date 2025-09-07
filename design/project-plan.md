docs/PROJECT_PLAN.md

Purpose: Task‑oriented plan that a junior dev can execute step‑by‑step. Includes onboarding, milestones, checklists, and acceptance criteria.

0) Onboarding (Day 0)
	•	Install Node ≥ 20: node -v
	•	npm ci
	•	Run tests: npm test → should pass.
	•	Build bundle: npm run build → dist/dynamic-math.bundle.js exists.
	•	Generate samples: npm run samples → scan console output.

Acceptance: Bundle built; tests pass; samples show plausible math.

1) Runtime Hardening (Day 1)
	•	Add src/runtime/types.d.ts (docs) to repo.
	•	Ensure window.ANKI_TEMPLATES.util exports: mulberry32, randInt, choice, shuffle, gcd, lcm.
	•	Add basic runtime unit tests (determinism, bounds, gcd/lcm).

Acceptance: Tests green; types file present; util functions exported.

2) Template Authoring Guide (Day 1)
	•	Create src/templates/_starter/your_template.js from Design Spec.
	•	Add tests/your_template.test.js skeleton.

Acceptance: npm test passes with the new tests (even if trivial).

3) Wave 1 Audit & Polish (Days 2–3)
	•	Review current templates for edge cases (zeroes, trivials).
	•	Ensure each has meta with title/skills/gradeBands/defaults.
	•	Add validate() where quick invariants help (e.g., no improper setup).
	•	Add 5–10 sample seeds per template to scripts/render-samples.mjs.

Acceptance: Samples look good; no crashes on side:"back" across 50 random seeds/template.

4) CI Enhancements (Day 3)
	•	Enforce coverage thresholds in vitest.config.mjs (e.g., branches 70%).
	•	Upload artifact dist/dynamic-math.bundle.js (already configured).
	•	(Optional) Cache npm in CI to speed runs.

Acceptance: CI fails when coverage drops below thresholds; artifact is downloadable.

5) Anki Integration QA (Day 4)
	•	Create an Anki note type with fields: TemplateId, Seed, Config.
	•	Paste the provided Front/Back HTML + style.css.
	•	Add bundle to deck media; create 5 notes per template with seeds 1–5.
	•	Verify identical cards on iPad and desktop.

Acceptance: Review renders; back answers correct; no rendering glitches.

6) Wave 2 Templates (Days 5–10)

For each template below, follow the Definition of Done checklist.
	•	Subtraction with regrouping (arithmetic/subtract_multi) – difficulty toggles # of borrows.
	•	LCM/GCD recognition (number_theory/lcm_gcd) – multiple choice or fill‑in.
	•	Decimals ×/÷ powers of 10 (decimals/scale_pow10).
	•	Add/Sub decimals (decimals/add_sub).
	•	Percents of a quantity (percent/of_quantity) – friendly numbers.
	•	Area & perimeter (rectangles) (geometry/rect_area_perim).
	•	Elapsed time (time/elapsed_basic).
	•	Prime vs composite (number_theory/prime_composite).
	•	Ratios & unit rates (ratios/unit_rate).

Definition of Done (per template)
	•	Stable id and meta provided; defaults documented.
	•	Deterministic operands from seed; front/back parity.
	•	Handles edge cases (no divide by zero; no negative unexpected unless intended).
	•	Unit tests: determinism + at least one invariant.
	•	Added to build entrypoints and samples script.
	•	Updated catalog in README or docs.

7) Optional: Word Problem Engine (Days 11–14)
	•	Create src/templates/word/engine.js that parameterizes story shells, e.g.:

// Pseudocode idea
const shells = [
  ({n1,n2,item}) => `Sam has ${n1} ${item}. He buys ${n2} more. How many now?`,
];
// A numeric generator chooses n1,n2 from seed and maps to a shell.

	•	Ensure answers can be validated (e.g., n1+n2) and shown as work.

Acceptance: 3 story types implemented; seeds 1–1000 produce coherent questions.

8) Optional: Deck Builder Tool Polish (Day 15)
	•	Add CLI flags to tools/build_deck.py for --count and --template defaults.
	•	Validate manifest JSON before build.

Acceptance: Running the tool outputs .apkg that imports cleanly.

9) Dev Workflow & Reviews (ongoing)
	•	Use Conventional Commits (feat:, fix:, docs:, refactor:, test:).
	•	Open a PR per template; include screenshots of front/back render (from sample HTML if needed).
	•	Reviewer verifies: tests, samples, style, determinism.

10) Risk & Mitigation
	•	Platform diffs (iOS vs desktop) → keep DOM/CSS minimal; avoid layout hacks.
	•	Entropy bugs → forbid Math.random() via ESLint rule; use seed only.
	•	Over‑complex configs → ship defaults; hide complexity until needed.

11) Checklists

PR Checklist
	•	Lint/test pass locally
	•	Coverage unchanged or improved
	•	Added to build and samples
	•	README/docs updated

Release Checklist
	•	Tag version
	•	Upload bundle artifact from CI
	•	Post CHANGELOG

⸻
