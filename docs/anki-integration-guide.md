# Anki Integration Guide (Dynamic Math Bundle)

This guide walks through building the bundle, adding it to Anki on desktop, creating a note type with fields, pasting the Front/Back HTML, and syncing to mobile.

## 1) Build the bundle
- Prerequisites: Node 18.x
- Install and build (generates external JS + inline HTML):
  - `npm install`
  - `npm run bundle` → outputs `dist/dynamic-math.bundle.js` and `docs/anki-html/dynamic-math-*.inline.html`

## 2) Add the bundle to Anki media
- Method A (recommended, no paths):
  - Open Anki Desktop → Add (A) to open the note editor.
  - Click the paperclip (Attach) icon or use Insert → Media, select `dist/dynamic-math.bundle.js`.
  - Anki copies the file into your media folder and inserts a token like `[sound:dynamic-math.bundle.js]` into the field.
  - Remove that token from the field (the file stays in media).
  - Your card HTML can now reference `<script src="dynamic-math.bundle.js"></script>`.
- Method B (manual copy):
  - Copy `dist/dynamic-math.bundle.js` into your collection’s media folder:
    - macOS: `~/Library/Application Support/Anki2/<YourProfile>/collection.media`
    - Windows: `%APPDATA%\Anki2\<YourProfile>\collection.media`
    - Linux: `~/.local/share/Anki2/<YourProfile>/collection.media`
  - Ensure the filename is exactly `dynamic-math.bundle.js` and matches your `<script src>`.
- Tip: Tools → Check Media… often provides an “Open Media Folder” button to jump to the right folder.

## 3) Create a note type and fields
- Tools → Manage Note Types → Add → “Dynamic Math (JS Bundle)” (or a name you prefer).
- Fields → Add three fields:
  - `TemplateId` (text)
  - `Seed` (text; leave blank to enable per-review behavior)
  - `Config` (text; optional JSON)

## 4) Paste the Front/Back HTML
- In the note type’s Cards… dialog:
  - Recommended (works on desktop + iOS): use inline variants
    - Front Template: `docs/anki-html/dynamic-math-front.inline.html`
    - Back Template: `docs/anki-html/dynamic-math-back.inline.html`
  - Optional (desktop only): use external bundle references
    - Front Template: `docs/anki-html/dynamic-math-front.html`
    - Back Template: `docs/anki-html/dynamic-math-back.html`
 - Inline variants embed the bundle directly and don’t rely on external script loading.

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
  - Ensure `dynamic-math.bundle.js` is present in media and the `<script src>` path exactly matches the filename (including any auto-renames).
  - Check `Config` is valid JSON (or leave it blank). Invalid JSON is silently ignored in the example HTML.
  - Verify `TemplateId` matches a registered template (see the ids above or code under `src/templates/…`).
- Per-review not changing each time:
  - Confirm `Seed` field is blank.
  - Make sure the Front/Back HTML snippets were pasted fully and unchanged, especially the calls to `resolveReviewSeed` and `generate`.
- Updated bundle not taking effect:
  - Rebuild (`npm run bundle`), then replace the file in your collection.media folder (or re-attach via the note editor), and resync desktop ↔ AnkiWeb ↔ mobile.

## 9) Updating/Adding templates to the bundle
- Add a `require` line in `src/entry/bundle.js` for any new templates you want included in the bundle.
- Re-run `npm run bundle` and re-add the bundle to Anki media.
