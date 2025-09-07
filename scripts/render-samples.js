#!/usr/bin/env node
"use strict";

const path = require("path");
const { getTemplate } = require("../src/runtime");

// Ensure starter template is registered (add more requires as templates grow)
require("../src/templates/_starter/add_two_numbers");

function usage() {
  console.log("Usage: node scripts/render-samples.js <TemplateId> [startSeed] [endSeed]");
  console.log("Example: node scripts/render-samples.js topic/add_two_numbers 1 5");
}

function main() {
  const [templateId, startArg, endArg] = process.argv.slice(2);
  if (!templateId) {
    usage();
    process.exit(1);
  }
  const startSeed = startArg ? parseInt(startArg, 10) : 1;
  const endSeed = endArg ? parseInt(endArg, 10) : startSeed + 4;
  if (Number.isNaN(startSeed) || Number.isNaN(endSeed)) {
    console.error("Seeds must be numbers");
    process.exit(1);
  }
  const t = getTemplate(templateId);
  for (let seed = startSeed; seed <= endSeed; seed++) {
    const front = t.generate({ seed, side: "front" });
    const back = t.generate({ seed, side: "back" });
    console.log(`\nSeed ${seed}`);
    console.log("Front:");
    console.log(front.html);
    console.log("Back:");
    console.log(back.html);
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error("Error:", err && err.stack ? err.stack : err);
    process.exit(1);
  }
}

