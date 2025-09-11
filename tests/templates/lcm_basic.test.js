const { getTemplate } = require('../../src/runtime');
require('../../src/templates/number_theory/lcm_basic');

function strip(html) { return String(html).replace(/<[^>]+>/g, '').trim(); }

describe('number_theory/lcm_basic', () => {
  const id = 'number_theory/lcm_basic';

  test('deterministic per seed (front)', () => {
    const t = getTemplate(id);
    const a = t.generate({ seed: 6789, side: 'front' }).html;
    const b = t.generate({ seed: 6789, side: 'front' }).html;
    expect(a).toBe(b);
  });

  test('front/back parity and divisibility', () => {
    const t = getTemplate(id);
    const back = t.generate({ seed: 15, side: 'back' });
    const ops = back.data.operands;
    const ans = back.data.answer;
    expect(strip(back.html)).toMatch(/^LCM\(\d+(, \d+){1,2}\) = \d+$/);
    for (const n of ops) expect(ans % n).toBe(0);
  });

  test('pairwise property for count=2 and cap respected for small digits', () => {
    const t = getTemplate(id);
    const back = t.generate({ seed: 21, config: { count: 2, digits: 1, lcmCap: 72 }, side: 'back' });
    const [a, b] = back.data.operands;
    const ans = back.data.answer;
    // gcd via Euclid
    const gcd = (x, y) => { while (y !== 0) { const t = y; y = x % y; x = t; } return x; };
    expect(ans * gcd(a, b)).toBe(a * b);
    expect(ans).toBeLessThanOrEqual(72);
  });
});

