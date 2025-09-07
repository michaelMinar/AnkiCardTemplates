docs/DESIGN_SPEC.md

Purpose: Explain the architecture, contracts, and conventions for JavaScript‑driven Anki math templates. Includes key interfaces and starter skeletons so a junior dev can implement new templates with confidence.

1) Goals & Non‑Goals

Goals
	•	Deterministic per‑card generation using a seed; identical front/back rendering across iPad/desktop Anki.
	•	Small, shared browser runtime with a simple template registry.
	•	Clear, testable template contract with metadata (skills, grade bands, difficulty).
	•	Fast local dev loop (Node/Vitest) + CI (lint, tests, bundle artifact).
	•	Easy Anki integration via three fields: TemplateId, Seed, Config.

Non‑Goals
	•	Heavy client frameworks or UI libraries inside Anki.
	•	Non‑deterministic logic or remote calls at review time.

2) Architecture Overview

+-------------------------+
|   Anki (Front/Back)     |
|  fields: TemplateId,    |
|          Seed, Config   |
+-----------+-------------+
            |
            v
+-------------------------+        +---------------------------+
|  dist/dynamic-math.js   | -----> |  Template Registry        |
|  (runtime + templates)  |        |  register/get             |
+------------+------------+        +--------------+------------+
             |                                 |
             v                                 v
      RNG (mulberry32)                    Template modules
    helpers: randInt, gcd,                (e.g., fractions/add_unlike)
    lcm, choice, shuffle

Render flow
	1.	Anki passes TemplateId, Seed, and Config (JSON) into the page.
	2.	Front HTML calls generate({ side: "front" }); Back calls with the same seed and side: "back".
	3.	Templates must compute the same operands/structure from the seed; back reveals the answer and (optionally) work steps.

3) Template Contract (Key Interfaces)

Project is plain JS; we describe interfaces in TS for clarity.

// src/runtime/types.d.ts (documentation-only, optional to add)
export interface GenerateOptions {
  seed: number;                 // required, deterministic driver
  config?: Record<string, any>; // optional, template-specific knobs
  side?: 'front' | 'back';      // default 'front'
}

export interface GenerateResult {
  html: string;                 // HTML to inject into card body
  data?: unknown;               // optional debug/QA info (not used by Anki)
}

export interface TemplateMeta {
  title: string;                // human-friendly name
  skills: string[];             // e.g., ['fractions', 'lcm']
  gradeBands: number[];         // e.g., [4,5,6]
  defaults?: Record<string, any>; // default config values
}

export interface TemplateImpl {
  id: string;                   // stable path-like id (e.g., 'fractions/add_unlike')
  meta?: TemplateMeta;
  generate(opts: GenerateOptions): GenerateResult;
  validate?(opts: GenerateOptions): { ok: boolean; errors?: string[]; warnings?: string[] };
}

Runtime registry API (already implemented):

// src/runtime/index.js
registerTemplate(id, impl);        // throws if impl missing generate()
getTemplate(id);                   // throws if unknown id
// window.ANKI_TEMPLATES = { register, get, util: { mulberry32, randInt, choice, shuffle, gcd, lcm } }

4) Randomness & Determinism Policy
	•	Use mulberry32(seed) only; no Math.random().
	•	All random choices must derive from the same rng closure.
	•	Avoid degenerate items (e.g., divide by 0, zero multipliers) unless explicitly intended.
	•	For difficulty bands, prefer pick ranges rather than branching logic that changes structure on the back.

5) HTML/CSS Conventions
	•	Return minimal semantic HTML; rely on deck style.css for look.
	•	Avoid inline styles unless necessary for math rendering (e.g., simple fractions).
	•	Keep content self-contained: no external URLs, fonts, or images.

6) Error Handling
	•	If generation fails, return a simple <div class="q">Template error (see Seed/Config)</div>; never throw to the page.
	•	Keep validate() optional to run in tests/CI for deeper checks (range, divisibility, simplification).

7) Authoring a New Template (Starter Skeleton)

// src/templates/_starter/your_template.js
import { mulberry32, randInt } from "../../runtime/rng.js";
import { registerTemplate } from "../../runtime/index.js";

export const id = "topic/your_template";
export const meta = {
  title: "Your Template Title",
  skills: ["topic"],
  gradeBands: [4,5,6],
  defaults: { difficulty: "A" },
};

export function generate({ seed, config = {}, side = "front" }) {
  const rng = mulberry32(seed);
  // 1) derive operands deterministically
  const a = randInt(rng, 2, 12);
  const b = randInt(rng, 2, 12);
  const answer = a + b; // example

  const front = `<div class="q">${a} + ${b} = ?</div>`;
  if (side === "front") return { html: front };
  return { html: front.replace("?", `<b>${answer}</b>`), data: { a, b, answer } };
}

export function validate({ seed, config }) {
  // optional: run invariants for CI (e.g., answer range)
  const rng = mulberry32(seed);
  const a = randInt(rng, 2, 12), b = randInt(rng, 2, 12);
  const ans = a + b;
  const ok = ans >= 4 && ans <= 24;
  return { ok, warnings: ok ? [] : ["answer out of expected range"] };
}

registerTemplate(id, { id, meta, generate, validate });

Test Skeleton

// tests/your_template.test.js
import { getTemplate } from "../src/runtime/index.js";
import "../src/templates/_starter/your_template.js";

function strip(html){ return html.replace(/<[^>]+>/g, "").trim(); }

describe("topic/your_template", () => {
  test("deterministic per seed", () => {
    const t = getTemplate("topic/your_template");
    const a = strip(t.generate({ seed: 123, side: "front" }).html);
    const b = strip(t.generate({ seed: 123, side: "front" }).html);
    expect(a).toBe(b);
  });
  test("validate invariants", () => {
    const t = getTemplate("topic/your_template");
    const res = t.validate?.({ seed: 5, config: {} });
    expect(res?.ok ?? true).toBe(true);
  });
});

8) Template Catalog (Initial Waves)
	•	Wave 1 (implemented): 2d×1d multiply; 2d÷1d (remainders/exact); add unlike fractions (simplify); PEMDAS basic; rounding to place.
	•	Wave 2 (next): multi‑digit subtraction (regrouping); LCM/GCD recognition; decimals (×10/÷10, add/sub); percents of friendly numbers; area/perimeter of rectangles; elapsed time; prime/composite; ratios/unit rate.

9) Testing Strategy
	•	Unit: PRNG determinism, ranges, properties (e.g., gcd/lcm), template invariants, back answers.
	•	Samples: scripts/render-samples.mjs prints N Q/A per template; reviewers skim for sanity.
	•	Coverage: target ≥ 85% statements on src/runtime and ≥ 70% on templates.

10) Build & Packaging
	•	Single esbuild bundle at dist/dynamic-math.bundle.js.
	•	Include bundle as media in the deck; HTML templates already reference it.
	•	Optional Python genanki tool builds .apkg from a JSON manifest.

11) Versioning & Release
	•	SemVer: bump minor when adding templates; patch for fixes; major for breaking contract changes.
	•	Keep a CHANGELOG.md with added templates and behavior tweaks.

⸻
