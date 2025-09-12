#!/usr/bin/env node
"use strict";

// Generate inline HTML variants for AnkiMobile, embedding the bundle
// Replaces <script src="dynamic-math.bundle.js"></script> with <script>...</script>

const fs = require('fs');
const path = require('path');

function inline(filePath, bundleText) {
  const html = fs.readFileSync(filePath, 'utf8');
  const replaced = html.replace(
    /<script\s+src=["']dynamic-math\.bundle\.js["']><\/script>/,
    `<script>\n${bundleText}\n</script>`
  );
  return replaced;
}

function main() {
  const bundlePath = path.join(__dirname, '../dist/dynamic-math.bundle.js');
  if (!fs.existsSync(bundlePath)) {
    console.error('Bundle not found at dist/dynamic-math.bundle.js. Run: npm run bundle');
    process.exit(1);
  }
  const bundleText = fs.readFileSync(bundlePath, 'utf8');

  const docsDir = path.join(__dirname, '../docs/anki-html');
  const front = path.join(docsDir, 'dynamic-math-front.html');
  const back = path.join(docsDir, 'dynamic-math-back.html');
  const outFront = path.join(docsDir, 'dynamic-math-front.inline.html');
  const outBack = path.join(docsDir, 'dynamic-math-back.inline.html');

  if (!fs.existsSync(front) || !fs.existsSync(back)) {
    console.error('Expected docs/anki-html/dynamic-math-front.html and back.html');
    process.exit(1);
  }

  fs.writeFileSync(outFront, inline(front, bundleText));
  fs.writeFileSync(outBack, inline(back, bundleText));
  console.log('Wrote inline HTML:');
  console.log(' -', path.relative(process.cwd(), outFront));
  console.log(' -', path.relative(process.cwd(), outBack));
}

if (require.main === module) {
  try { main(); } catch (e) { console.error(e && e.stack ? e.stack : e); process.exit(1); }
}

