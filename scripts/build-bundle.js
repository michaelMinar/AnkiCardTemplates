#!/usr/bin/env node
"use strict";

// Bundles the runtime and registered templates into dist/dynamic-math.bundle.js
// Usage: npm run bundle

const path = require('path');

async function main() {
  let esbuild;
  try {
    esbuild = require('esbuild');
  } catch (e) {
    console.error('esbuild is not installed. Run: npm install --save-dev esbuild');
    process.exit(1);
  }

  const entry = path.join(__dirname, '../src/entry/bundle.js');
  const outdir = path.join(__dirname, '../dist');

  const result = await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2018'],
    outfile: path.join(outdir, 'dynamic-math.bundle.js'),
    sourcemap: false,
    minify: false,
    banner: {
      js: '// Dynamic Math bundle (runtime + templates)\n',
    },
    logLevel: 'info',
  });

  if (result && result.errors && result.errors.length) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});

