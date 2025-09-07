# AnkiCardTemplates

Source code for Javascript based Anki Card templates. I'm particularly interested in creating dynamic mathematics test cards. For instance, rather than giving me the same pair of 2 digit numbers to mulitpy together, we should generate random numbers each time. 

## Samples (new runtime templates)
- Print sample Q/A for the starter template:
  - `npm run samples` (runs `node scripts/render-samples.js topic/add_two_numbers 1 5`)
- Output shows front/back HTML for seeds 1–5 to aid review.
- Starter template lives at `src/templates/_starter/add_two_numbers.js` and uses a deterministic RNG.
