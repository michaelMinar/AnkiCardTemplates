const { getTemplate } = require('../../src/runtime');
require('../../src/templates/number_theory/gcf_basic');

function strip(html) { return String(html).replace(/<[^>]+>/g, '').trim(); }

describe('number_theory/gcf_basic', () => {
  const id = 'number_theory/gcf_basic';

  test('deterministic per seed (front)', () => {
    const t = getTemplate(id);
    const a = t.generate({ seed: 12345, side: 'front' }).html;
    const b = t.generate({ seed: 12345, side: 'front' }).html;
    expect(a).toBe(b);
  });

  test('front/back parity and divides invariant', () => {
    const t = getTemplate(id);
    const front = t.generate({ seed: 7, side: 'front' });
    const back = t.generate({ seed: 7, side: 'back' });
    expect(strip(front.html)).toMatch(/^GCF\(\d+, \d+\) = \?$/);
    expect(strip(back.html)).toMatch(/^GCF\(\d+, \d+\) = \d+$/);
    const a = back.data.a, b = back.data.b, g = back.data.answer;
    expect(a % g).toBe(0);
    expect(b % g).toBe(0);
  });

  test('ensureNonTrivial bias yields some nontrivial GCF across seeds', () => {
    const t = getTemplate(id);
    let found = false;
    for (let s = 1; s <= 50; s++) {
      const res = t.generate({ seed: s, side: 'back' });
      if (res.data.answer > 1) { found = true; break; }
    }
    expect(found).toBe(true);
  });

  test('operands are distinct (a != b)', () => {
    const t = getTemplate(id);
    for (let s = 1; s <= 30; s++) {
      const back = t.generate({ seed: s, side: 'back' });
      const { a, b } = back.data;
      expect(a).not.toBe(b);
    }
  });
});
