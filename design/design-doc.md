Anki Math Template Pack

This drop-in pack adds a small runtime, several example JS-driven math templates, unit tests, and CI, plus an optional Python deck builder. Files below are ready to copy into your repo.

⸻

📁 Proposed repo structure

/ (repo root)
├─ package.json
├─ .eslintrc.json
├─ .prettierrc.json
├─ jest.config.js                      # if you prefer jest; below uses Vitest by default
├─ vitest.config.mjs                   # Vitest config
├─ /src
│  ├─ /runtime
│  │  ├─ rng.js
│  │  └─ index.js
│  └─ /templates
│     ├─ /arithmetic
│     │  └─ multiply_2d_by_1d.js      # example (mirrors your existing idea)
│     ├─ /division
│     │  └─ division_2d_by_1d.js      # NEW working template (with remainders)
│     ├─ /fractions
│     │  └─ add_unlike.js             # NEW working template
│     ├─ /order_of_operations
│     │  └─ pemdas_basic.js           # working template
│     └─ /rounding
│        └─ round_to_place.js         # working template
├─ /anki                                # concrete Anki template examples
│  ├─ front.html
│  ├─ back.html
│  └─ style.css
├─ /scripts
│  ├─ build.mjs                        # bundles runtime+templates → dist/dynamic-math.bundle.js
│  └─ render-samples.mjs               # prints sample Q/A pairs for quick visual QA
├─ /dist
│  └─ dynamic-math.bundle.js           # built output (artifact)
├─ /tests
│  ├─ rng.test.js
│  ├─ fractions.test.js
│  └─ templates.test.js
├─ /docs
│  ├─ DESIGN.md
│  ├─ TEMPLATE_STANDARD.md
│  └─ TESTING_CI.md
├─ /tools (optional)
│  ├─ build_deck.py                    # optional: build .apkg via genanki
│  └─ /decks
│     └─ sample_dynamic_math.json
└─ .github/workflows/ci.yml


⸻

📄 package.json

{
  "name": "anki-math-templates",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "node scripts/build.mjs",
    "samples": "node scripts/render-samples.mjs",
    "test": "vitest run",
    "lint": "eslint .",
    "format": "prettier -w ."
  },
  "devDependencies": {
    "esbuild": "^0.23.0",
    "eslint": "^9.9.0",
    "prettier": "^3.3.3",
    "vitest": "^2.0.5"
  }
}


⸻

📄 vitest.config.mjs

/** @type {import('vitest').UserConfig} */
export default {
  test: {
    globals: true,
    include: ["tests/**/*.test.js"],
    coverage: {
      reporter: ["text", "lcov"],
    },
  },
};


⸻

📄 .eslintrc.json

{
  "env": { "es2023": true, "node": true, "browser": true },
  "extends": ["eslint:recommended"],
  "parserOptions": { "ecmaVersion": 2023, "sourceType": "module" },
  "rules": {
    "no-unused-vars": ["warn", { "args": "none" }],
    "no-constant-binary-expression": "off"
  },
  "ignorePatterns": ["dist/**"]
}


⸻

📄 .prettierrc.json

{ "printWidth": 90, "singleQuote": false, "trailingComma": "es5" }


⸻

📄 docs/DESIGN.md

# Design Overview

## Goals
- Deterministic, parameterized problem generation per card (stable across reviews)
- One small browser runtime shared by all templates
- Testable in Node (same generation code) + lightweight CI
- Copy/paste-friendly Anki HTML templates that work offline on iPad

## Determinism
Each note includes a numeric `Seed` field (or a JSON `Config` field that contains
`seed`). All templates derive randomness solely from this seed via our `rng()`.
The back template re-generates from the same seed to render the solution.

> Why not the card GUID? Anki’s template vars aren’t consistent across platforms;
> a dedicated `Seed` field keeps behavior portable and explicit.

## Template Contract
A template module exports `id` and `generate(opts)` where `opts` includes:

```ts
{
  seed: number,              // required
  config?: object,           // optional template-specific config
  side?: "front" | "back"    // which side is rendering
}

generate() returns:

{
  html: string,              // HTML to insert into the card body
  data?: object              // any useful debug info (ignored by Anki)
}

Runtime
	•	rng.js provides mulberry32, randInt(min, max), choice(arr), shuffle(arr)
	•	index.js exposes registerTemplate(id, impl) and getTemplate(id) and
attaches window.ANKI_TEMPLATES

Build
	•	esbuild bundles runtime + selected templates into
dist/dynamic-math.bundle.js which can be added to Anki media and referenced
from the card template via <script src="dynamic-math.bundle.js"></script>.

Testing
	•	Unit tests assert determinism, range constraints, and solution correctness
	•	render-samples.mjs produces quick human-readable samples for manual QA

Optional Deck Builder
	•	tools/build_deck.py uses genanki to compile a deck from a JSON manifest,
auto-populating Seed, Config and TemplateId fields for N notes




⸻

📄 docs/TEMPLATE_STANDARD.md

# Template Standard

- **id**: stable string path (e.g., `division/2d_by_1d`)
- **gradeBands**: array of suggested grades (e.g., `[4, 5, 6]`)
- **skills**: tags like `{"division": true, "remainders": true}`
- **config defaults**: `{ difficulty: "A" | "B" | "C", ... }`

### Guidelines
- Keep numbers appropriate to difficulty bands
- Avoid trivial or degenerate cases (0 divisors, improper denominators without note)
- Show working on the back when helpful (e.g., long division steps)
- Return minimal, semantic HTML (no external CSS; rely on Anki styling)


⸻

📄 docs/TESTING_CI.md

# Testing & CI

## Local
- `npm i`
- `npm test` to run unit tests (Vitest)
- `npm run build` to generate the Anki bundle under `/dist`
- `npm run samples` to print 10 example Q/A per template

## CI
- GitHub Action runs on PR and `main` pushes:
  - install, lint, test, build
  - uploads `/dist` as an artifact for quick download into Anki


⸻

📄 src/runtime/rng.js

// Deterministic PRNG (mulberry32) + helpers
export function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function randInt(rng, min, max) {
  // inclusive min/max
  const r = rng();
  return Math.floor(r * (max - min + 1)) + min;
}

export function choice(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

export function shuffle(rng, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function lcm(a, b) {
  return Math.abs((a * b) / gcd(a, b));
}


⸻

📄 src/runtime/index.js

import { mulberry32, randInt, choice, shuffle, gcd, lcm } from "./rng.js";

const REGISTRY = {};

export function registerTemplate(id, impl) {
  if (!id || typeof impl?.generate !== "function") {
    throw new Error("Template must have id and generate(opts)");
  }
  REGISTRY[id] = impl;
}

export function getTemplate(id) {
  const t = REGISTRY[id];
  if (!t) throw new Error(`Unknown template: ${id}`);
  return t;
}

// Expose minimal API for browser (Anki)
if (typeof window !== "undefined") {
  window.ANKI_TEMPLATES = {
    register: registerTemplate,
    get: getTemplate,
    util: { mulberry32, randInt, choice, shuffle, gcd, lcm },
  };
}


⸻

📄 src/templates/arithmetic/multiply_2d_by_1d.js

import { mulberry32, randInt } from "../../runtime/rng.js";
import { registerTemplate } from "../../runtime/index.js";

export const id = "arithmetic/multiply_2d_by_1d";

export function generate({ seed, config = {}, side = "front" }) {
  const rng = mulberry32(seed);
  const min2 = config.min2 ?? 12;
  const max2 = config.max2 ?? 98;
  const min1 = config.min1 ?? 2;
  const max1 = config.max1 ?? 9;

  const a = randInt(rng, min2, max2);
  const b = randInt(rng, min1, max1);
  const product = a * b;

  if (side === "front") {
    return { html: `<div class="q">${a} × ${b} = ?</div>` };
  }

  return {
    html: `<div class="q">${a} × ${b} = <b>${product}</b></div>`,
    data: { a, b, product },
  };
}

registerTemplate(id, { id, generate });


⸻

📄 src/templates/division/division_2d_by_1d.js (NEW)

import { mulberry32, randInt } from "../../runtime/rng.js";
import { registerTemplate } from "../../runtime/index.js";

export const id = "division/2d_by_1d";

// difficulty A: dividends 10–99, divisors 2–9; allow remainders
// difficulty B: target exact division  (no remainder)
export function generate({ seed, config = {}, side = "front" }) {
  const rng = mulberry32(seed);
  const divisor = randInt(rng, config.minDiv ?? 2, config.maxDiv ?? 9);

  let dividend;
  let quotient;
  let remainder;

  if ((config.difficulty ?? "A") === "B") {
    // exact division: pick quotient first
    quotient = randInt(rng, 2, 12);
    dividend = divisor * quotient;
    remainder = 0;
  } else {
    dividend = randInt(rng, config.minDividend ?? 10, config.maxDividend ?? 99);
    quotient = Math.floor(dividend / divisor);
    remainder = dividend % divisor;
    if (quotient === 0) {
      // avoid trivial case (e.g., 5 ÷ 9)
      dividend += divisor;
      quotient = Math.floor(dividend / divisor);
      remainder = dividend % divisor;
    }
  }

  if (side === "front") {
    return { html: `<div class="q">${dividend} ÷ ${divisor} = ?  (q r)</div>` };
  }

  return {
    html: `<div class="q">${dividend} ÷ ${divisor} = <b>${quotient}</b> r <b>${remainder}</b></div>`,
    data: { dividend, divisor, quotient, remainder },
  };
}

registerTemplate(id, { id, generate });


⸻

📄 src/templates/fractions/add_unlike.js (NEW)

import { mulberry32, randInt, gcd, lcm } from "../../runtime/rng.js";
import { registerTemplate } from "../../runtime/index.js";

export const id = "fractions/add_unlike";

function simplify(n, d) {
  const g = gcd(n, d);
  return [n / g, d / g];
}

export function generate({ seed, config = {}, side = "front" }) {
  const rng = mulberry32(seed);
  const minD = config.minDen ?? 3;
  const maxD = config.maxDen ?? 12;

  let d1 = randInt(rng, minD, maxD);
  let d2 = randInt(rng, minD, maxD);
  if (d1 === d2) d2 = d1 + 1; // encourage unlike denominators

  const n1 = randInt(rng, 1, d1 - 1);
  const n2 = randInt(rng, 1, d2 - 1);

  const L = lcm(d1, d2);
  const sNum = n1 * (L / d1) + n2 * (L / d2);
  const [sn, sd] = simplify(sNum, L);

  const front = `<div class="q">\n  <span class="frac"><span class="num">${n1}</span>/<span class="den">${d1}</span></span>
  +
  <span class="frac"><span class="num">${n2}</span>/<span class="den">${d2}</span></span>
  = ?
</div>`;

  if (side === "front") return { html: front };

  return {
    html: `${front.replace("= ?", `= <b>${sn}</b>/<b>${sd}</b>`)}\n<div class="work">LCM(${d1}, ${d2}) = ${L}</div>`,
    data: { n1, d1, n2, d2, sn, sd, L },
  };
}

registerTemplate(id, { id, generate });


⸻

📄 src/templates/order_of_operations/pemdas_basic.js

import { mulberry32, randInt, choice } from "../../runtime/rng.js";
import { registerTemplate } from "../../runtime/index.js";

export const id = "order_of_operations/pemdas_basic";

const OPS = [
  { sym: "+", fn: (a, b) => a + b },
  { sym: "-", fn: (a, b) => a - b },
  { sym: "×", fn: (a, b) => a * b },
  { sym: "÷", fn: (a, b) => Math.floor(a / b) },
];

function evalExpr(a, op1, b, op2, c) {
  // respect × ÷ precedence
  const multDiv = (op) => op.sym === "×" || op.sym === "÷";
  if (multDiv(op2) && !multDiv(op1)) {
    const mid = op2.fn(b, c);
    return op1.fn(a, mid);
  }
  const mid = op1.fn(a, b);
  return op2.fn(mid, c);
}

export function generate({ seed, config = {}, side = "front" }) {
  const rng = mulberry32(seed);
  const a = randInt(rng, 2, 20);
  const b = randInt(rng, 2, 12);
  const c = randInt(rng, 2, 12);
  const op1 = choice(rng, OPS);
  const op2 = choice(rng, OPS);

  const val = evalExpr(a, op1, b, op2, c);
  const expr = `${a} ${op1.sym} ${b} ${op2.sym} ${c}`;

  if (side === "front") return { html: `<div class="q">${expr} = ?</div>` };
  return { html: `<div class="q">${expr} = <b>${val}</b></div>`, data: { expr, val } };
}

registerTemplate(id, { id, generate });


⸻

📄 src/templates/rounding/round_to_place.js

import { mulberry32, randInt, choice } from "../../runtime/rng.js";
import { registerTemplate } from "../../runtime/index.js";

export const id = "rounding/round_to_place";

export function generate({ seed, config = {}, side = "front" }) {
  const rng = mulberry32(seed);
  const places = config.places ?? [1, 10, 100, 1000];
  const place = choice(rng, places);
  const n = randInt(rng, 10, 9999);

  const front = `<div class="q">Round ${n} to the nearest ${place}</div>`;

  function roundTo(num, p) {
    return Math.round(num / p) * p;
  }
  const ans = roundTo(n, place);

  if (side === "front") return { html: front };
  return { html: `${front.replace("?</div>", `</div><div class=\"a\"><b>${ans}</b></div>`)}`, data: { n, place, ans } };
}

registerTemplate(id, { id, generate });


⸻

📄 anki/front.html (paste into Anki card Front Template)

<div id="prompt" class="prompt"></div>
<script>
  // Pull seed + config from fields (create these fields in your note type)
  const Seed = parseInt("{{Seed}}".trim()) || 1;
  let Config = {};
  try { Config = JSON.parse(`{{Config}}`); } catch (e) { Config = {}; }
  const TemplateId = "{{TemplateId}}".trim() || "arithmetic/multiply_2d_by_1d";
</script>
<!-- Add dynamic-math.bundle.js to your deck media, then reference: -->
<script src="dynamic-math.bundle.js"></script>
<script>
  const t = window.ANKI_TEMPLATES.get(TemplateId);
  const out = t.generate({ seed: Seed, config: Config, side: "front" });
  document.getElementById("prompt").innerHTML = out.html;
</script>


⸻

📄 anki/back.html (paste into Anki card Back Template)

<div id="answer" class="answer"></div>
<script>
  const Seed = parseInt("{{Seed}}".trim()) || 1;
  let Config = {};
  try { Config = JSON.parse(`{{Config}}`); } catch (e) { Config = {}; }
  const TemplateId = "{{TemplateId}}".trim() || "arithmetic/multiply_2d_by_1d";
</script>
<script src="dynamic-math.bundle.js"></script>
<script>
  const t = window.ANKI_TEMPLATES.get(TemplateId);
  const out = t.generate({ seed: Seed, config: Config, side: "back" });
  document.getElementById("answer").innerHTML = out.html;
</script>


⸻

📄 anki/style.css

.card { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
.q { font-size: 2.2rem; text-align: center; margin: 12px 0; }
.a, .work { font-size: 1.4rem; text-align: center; margin-top: 8px; }
.frac { display: inline-block; padding: 0 4px; }
.num { border-bottom: 2px solid currentColor; display: inline-block; padding: 0 2px; }
.den { display: inline-block; padding: 0 2px; }


⸻

📄 scripts/build.mjs

import esbuild from "esbuild";

await esbuild.build({
  entryPoints: [
    "src/runtime/index.js",
    "src/templates/arithmetic/multiply_2d_by_1d.js",
    "src/templates/division/division_2d_by_1d.js",
    "src/templates/fractions/add_unlike.js",
    "src/templates/order_of_operations/pemdas_basic.js",
    "src/templates/rounding/round_to_place.js",
  ],
  bundle: true,
  format: "iife",
  globalName: "__ignored__",
  outfile: "dist/dynamic-math.bundle.js",
  logLevel: "info",
});


⸻

📄 scripts/render-samples.mjs

import { getTemplate } from "../src/runtime/index.js";
import "../src/templates/arithmetic/multiply_2d_by_1d.js";
import "../src/templates/division/division_2d_by_1d.js";
import "../src/templates/fractions/add_unlike.js";
import "../src/templates/order_of_operations/pemdas_basic.js";
import "../src/templates/rounding/round_to_place.js";

function show(id, seeds = [1, 2, 3, 4, 5]) {
  const t = getTemplate(id);
  console.log(`\n== ${id} ==`);
  for (const s of seeds) {
    const q = t.generate({ seed: s, side: "front" }).html;
    const a = t.generate({ seed: s, side: "back" }).html;
    console.log(`seed ${s}:`);
    console.log(q.replace(/<[^>]+>/g, ""), "|", a.replace(/<[^>]+>/g, ""));
  }
}

["arithmetic/multiply_2d_by_1d",
 "division/2d_by_1d",
 "fractions/add_unlike",
 "order_of_operations/pemdas_basic",
 "rounding/round_to_place"].forEach((id) => show(id));


⸻

🧪 tests/rng.test.js

import { mulberry32, randInt } from "../src/runtime/rng.js";

test("mulberry32 determinism", () => {
  const r1 = mulberry32(42);
  const r2 = mulberry32(42);
  for (let i = 0; i < 10; i++) {
    expect(r1()).toBeCloseTo(r2());
  }
});

test("randInt inclusive bounds", () => {
  const r = mulberry32(7);
  for (let i = 0; i < 1000; i++) {
    const v = randInt(r, 3, 9);
    expect(v).toBeGreaterThanOrEqual(3);
    expect(v).toBeLessThanOrEqual(9);
  }
});


⸻

🧪 tests/fractions.test.js

import { gcd, lcm } from "../src/runtime/rng.js";

test("gcd", () => {
  expect(gcd(6, 9)).toBe(3);
  expect(gcd(12, 18)).toBe(6);
  expect(gcd(7, 13)).toBe(1);
});

test("lcm", () => {
  expect(lcm(3, 4)).toBe(12);
  expect(lcm(6, 8)).toBe(24);
});


⸻

🧪 tests/templates.test.js

import { getTemplate } from "../src/runtime/index.js";
import "../src/templates/division/division_2d_by_1d.js";
import "../src/templates/fractions/add_unlike.js";

function strip(html) { return html.replace(/<[^>]+>/g, "").trim(); }

describe("division/2d_by_1d", () => {
  test("deterministic per seed", () => {
    const t = getTemplate("division/2d_by_1d");
    const a = t.generate({ seed: 55, side: "front" }).html;
    const b = t.generate({ seed: 55, side: "front" }).html;
    expect(strip(a)).toBe(strip(b));
  });
});

describe("fractions/add_unlike", () => {
  test("proper simplification", () => {
    const t = getTemplate("fractions/add_unlike");
    const { data } = t.generate({ seed: 101, side: "back" });
    const g = (n, d) => { const r = (a,b)=>b? r(b, a%b):a; return r(n,d); };
    expect(g(data.sn, data.sd)).toBe(1);
  });
});


⸻

📄 .github/workflows/ci.yml

name: ci

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
      - name: Upload bundle artifact
        uses: actions/upload-artifact@v4
        with:
          name: anki-bundle
          path: dist/dynamic-math.bundle.js


⸻

🐍 (optional) tools/build_deck.py + tools/decks/sample_dynamic_math.json

# tools/build_deck.py
# Requires: pip install genanki
import json, sys, time
import genanki

MODEL_ID = 1607392319  # random but fixed

def load_manifest(path):
    with open(path) as f:
        return json.load(f)

# Minimal model with three fields we use in templates
model = genanki.Model(
    MODEL_ID,
    'JS Dynamic Math v1',
    fields=[
      {'name': 'TemplateId'},
      {'name': 'Seed'},
      {'name': 'Config'},
    ],
    templates=[
      {
        'name': 'Card 1',
        'qfmt': open('anki/front.html').read(),
        'afmt': open('anki/back.html').read(),
      }
    ],
    css=open('anki/style.css').read()
)

def main():
    if len(sys.argv) < 2:
        print('Usage: build_deck.py tools/decks/sample_dynamic_math.json')
        sys.exit(1)
    m = load_manifest(sys.argv[1])
    deck = genanki.Deck(int(m['deckId']), m['deckName'])

    for note_spec in m['notes']:
        note = genanki.Note(model=model, fields=[
            note_spec['TemplateId'],
            str(note_spec['Seed']),
            json.dumps(note_spec.get('Config', {})),
        ])
        deck.add_note(note)

    pkg = genanki.Package(deck)
    # include JS bundle as media
    pkg.media_files = ['dist/dynamic-math.bundle.js']
    pkg.write_to_file(m['output'] or f"out_{int(time.time())}.apkg")

if __name__ == '__main__':
    main()

// tools/decks/sample_dynamic_math.json
{
  "deckId": 987654321,
  "deckName": "Dynamic Math – Samples",
  "output": "out_dynamic_math.apkg",
  "notes": [
    { "TemplateId": "arithmetic/multiply_2d_by_1d", "Seed": 11, "Config": {} },
    { "TemplateId": "division/2d_by_1d", "Seed": 22, "Config": { "difficulty": "B" } },
    { "TemplateId": "fractions/add_unlike", "Seed": 33, "Config": {} },
    { "TemplateId": "order_of_operations/pemdas_basic", "Seed": 44, "Config": {} },
    { "TemplateId": "rounding/round_to_place", "Seed": 55, "Config": { "places": [10, 100] } }
  ]
}


⸻

✅ How to use (quick start)
	1.	Add fields to a note type in Anki: TemplateId (text), Seed (number), Config (text).
	2.	Paste anki/front.html, anki/back.html, and anki/style.css into the model.
	3.	Add dist/dynamic-math.bundle.js to your deck media (via Anki → Tools → Manage Note Types → … or by adding as media file).
	4.	Create notes (one per seed), setting TemplateId (e.g., fractions/add_unlike) and a numeric Seed.
	5.	(Optional) Use tools/build_deck.py tools/decks/sample_dynamic_math.json to generate an .apkg with seeds pre-filled.

⸻

🗺️ Next template ideas (4th–6th grade)
	•	Place value comparisons & expanded form
	•	Multi-digit subtraction with/without regrouping
	•	LCM/GCD identification problems
	•	Unit rates & ratios word problems
	•	Elapsed time
	•	Area/perimeter rectangles & composite shapes
	•	Decimals: add/subtract/multiply by powers of 10
	•	Percent of a quantity (friendly numbers)
	•	Prime/composite recognition

⸻

