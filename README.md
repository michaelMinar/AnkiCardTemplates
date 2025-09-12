# AnkiCardTemplates

Source code for Javascript based Anki Card templates. I'm particularly interested in creating dynamic mathematics test cards. For instance, rather than giving me the same pair of 2 digit numbers to mulitpy together, we should generate random numbers each time. 


## Samples (new runtime templates)
- Print sample Q/A for the starter template:
  - `npm run samples` (runs `node scripts/render-samples.js topic/add_two_numbers 1 5`)
- Output shows front/back HTML for seeds 1–5 to aid review.
- Starter template lives at `src/templates/_starter/add_two_numbers.js` and uses a deterministic RNG.

## Template Contract (authoring quickstart)
- Implement `module.exports = { id, meta, generate, validate }` in `src/templates/<group>/<name>.js`.
- Determinism: derive all randomness from `mulberry32(seed)`. Avoid `Math.random()`.
- `generate({ seed, config, side })` returns `{ html, data? }`; same operands on front/back, reveal on `side: 'back'`.
- `meta` includes `title`, `skills`, `gradeBands`, and optional `defaults`.
- See `src/runtime/types.d.ts` for interface docs and the starter template for an example.

## Bundling & Anki Integration (Phase 3)
- Build bundle (creates both external JS and inline HTML):
  - `npm install` (to fetch esbuild)
  - `npm run bundle` → emits `dist/dynamic-math.bundle.js` and inline HTML files under `docs/anki-html/*.inline.html`
- Recommended usage (cross‑platform):
  - Use the inline HTML snippets (`dynamic-math-front.inline.html` and `.inline.html` back) for both desktop and iOS.
  - Alternatively on desktop only, you may reference the external file: add `dist/dynamic-math.bundle.js` to media and use `<script src="dynamic-math.bundle.js"></script>` in the non‑inline snippets.
- Create a note type with fields: `TemplateId`, `Seed`, `Config` and paste the Front/Back HTML (inline variants for iOS).
- Behavior:
  - If `Seed` is a number, the card is static and deterministic per seed.
  - If `Seed` is blank/non-numeric, per-review mode is used by default: the front picks a fresh seed and stores it; the back reads and clears it.

See also: `docs/anki-integration-guide.md` for a step-by-step walkthrough.

## AI Reviews

- Default reviewer: Anthropic Claude Opus 4.1 runs on all PRs to `main` via GitHub Actions.
- On-demand reviewers (comment on a PR):
  - `/codex-review` → OpenAI `gpt-5`
  - `/gemini-review` → Google `gemini-2.5-pro`
- Access: only repo Owner/Member/Collaborator comments are honored; forks don’t receive secrets.
- Secrets required: `ANTHROPIC_API_KEY` (default), and optionally `OPENAI_API_KEY` and `GEMINI_API_KEY` for the comment triggers.
- Exclusions: lockfiles, `node_modules/**`, `build/**`, `*.min.*`, and `*.md` are ignored to reduce noise.
- Configuration lives in `.github/workflows/ai-code-review.yml`. Future option: CodiumAI PR‑Agent (see `issues/enhancement-codiumai-pr-agent.md`).
