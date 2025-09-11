# Anki Integration Guide (Dynamic Math Bundle)

This guide walks through building the bundle, adding it to Anki on desktop, creating a note type with fields, pasting the Front/Back HTML, and syncing to mobile.

## 1) Build the bundle
- Prerequisites: Node 18.x
- Install and build:
  - `npm install`
  - `npm run bundle` → outputs `dist/dynamic-math.bundle.js`

## 2) Add the bundle to Anki media
- Open Anki Desktop.
- Tools → Manage Media → Add… → select `dist/dynamic-math.bundle.js`.
- Confirm the file now exists in your collection’s media under the exact name `dynamic-math.bundle.js`.

## 3) Create a note type and fields
- Tools → Manage Note Types → Add → “Dynamic Math (JS Bundle)” (or a name you prefer).
- Fields → Add three fields:
  - `TemplateId` (text)
  - `Seed` (text; leave blank to enable per-review behavior)
  - `Config` (text; optional JSON)

## 4) Paste the Front/Back HTML
- In the note type’s Cards… dialog:
  - Front Template: copy the contents of `docs/anki-html/dynamic-math-front.html`.
  - Back Template: copy the contents of `docs/anki-html/dynamic-math-back.html`.
- Important: both files reference the bundle with `<script src="dynamic-math.bundle.js"></script>` — this must match the media filename exactly.

## 5) Create notes
- Add a new note with the “Dynamic Math (JS Bundle)” type.
- Populate fields:
  - `TemplateId`: choose a registered template id, e.g.:
    - `topic/add_two_numbers`
    - `arithmetic/multiply_2d_by_1d`
    - `number_theory/gcf_basic`
    - `number_theory/lcm_basic`
  - `Seed`:
    - Leave blank for per-review mode (fresh problem each time you review the card; front stores the seed, back reads and clears it).
    - Or set a number (e.g., `17`) for a static problem (deterministic per seed).
  - `Config` (optional JSON):
    - Example for 2d×1d multiply: `{ "twoDigitMin": 12, "twoDigitMax": 99, "oneDigitMin": 2, "oneDigitMax": 9 }`

## 6) Review behavior
- Per-Review (default when `Seed` is blank or non-numeric):
  - Front uses `window.ANKI_TEMPLATES.util.resolveReviewSeed` to generate a seed and store it in `sessionStorage` under a key scoped by `TemplateId`.
  - Back reads the stored seed, regenerates the same operands deterministically, reveals the answer, and clears the stored seed so the next review generates a fresh problem.
- Static (opt-in):
  - If `Seed` is a number, that seed is used on both front/back; no storage is used; the problem is stable across reviews and across devices.

## 7) Sync to mobile
- Sync the desktop collection to AnkiWeb.
- On mobile (iOS/Android), sync to pull the latest media and templates.
- Open a note with the dynamic template; the bundle runs locally on the device (no network required during review).

## 8) Troubleshooting
- “Template error …” in the card body:
  - Ensure `dynamic-math.bundle.js` is present in media and the `<script src>` path exactly matches the filename.
  - Check `Config` is valid JSON (or leave it blank). Invalid JSON is silently ignored in the example HTML.
  - Verify `TemplateId` matches a registered template (see the ids above or code under `src/templates/…`).
- Per-review not changing each time:
  - Confirm `Seed` field is blank.
  - Make sure the Front/Back HTML snippets were pasted fully and unchanged, especially the calls to `resolveReviewSeed` and `generate`.
- Updated bundle not taking effect:
  - Rebuild (`npm run bundle`), re-add the file to Manage Media (replacing the old one), and resync.

## 9) Updating/Adding templates to the bundle
- Add a `require` line in `src/entry/bundle.js` for any new templates you want included in the bundle.
- Re-run `npm run bundle` and re-add the bundle to Anki media.
