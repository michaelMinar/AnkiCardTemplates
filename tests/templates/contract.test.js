const fs = require('fs');
const path = require('path');
const { getTemplate } = require('../../src/runtime');
require('../../src/templates/_starter/add_two_numbers');
require('../../src/templates/arithmetic/multiply_2d_by_1d');

describe('template contract conformance', () => {
  const ids = [
    'topic/add_two_numbers',
    'arithmetic/multiply_2d_by_1d',
  ];

  test('each template exposes id and generate()', () => {
    for (const id of ids) {
      const tpl = getTemplate(id);
      expect(typeof tpl.id).toBe('string');
      expect(tpl.id).toBe(id);
      expect(typeof tpl.generate).toBe('function');
      // validate() is optional but if present must be a function
      if (tpl.validate) expect(typeof tpl.validate).toBe('function');
    }
  });

  test('deterministic HTML per seed on front', () => {
    for (const id of ids) {
      const tpl = getTemplate(id);
      const a = tpl.generate({ seed: 42, side: 'front' }).html;
      const b = tpl.generate({ seed: 42, side: 'front' }).html;
      expect(a).toBe(b);
      expect(typeof a).toBe('string');
    }
  });
});

describe('new templates must not use Math.random', () => {
  test('scan src/templates for Math.random', () => {
    const root = path.join(__dirname, '../../src/templates');
    const files = [];
    function walk(dir) {
      for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) walk(full);
        else if (entry.endsWith('.js')) files.push(full);
      }
    }
    walk(root);
    const offenders = [];
    for (const file of files) {
      const text = fs.readFileSync(file, 'utf8');
      if (/\bMath\.random\s*\(/.test(text)) {
        offenders.push(path.relative(path.join(__dirname, '../../'), file));
      }
    }
    expect(offenders).toEqual([]);
  });
});

