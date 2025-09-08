const { getTemplate } = require('../../src/runtime');
require('../../src/templates/arithmetic/multiply_2d_by_1d');

function strip(html) {
  return String(html).replace(/<[^>]+>/g, '').trim();
}

describe('arithmetic/multiply_2d_by_1d', () => {
  const id = 'arithmetic/multiply_2d_by_1d';

  test('deterministic per seed (front)', () => {
    const t = getTemplate(id);
    const a = t.generate({ seed: 321, side: 'front' }).html;
    const b = t.generate({ seed: 321, side: 'front' }).html;
    expect(a).toBe(b);
  });

  test('front/back parity and formatting', () => {
    const t = getTemplate(id);
    const front = strip(t.generate({ seed: 8, side: 'front' }).html);
    const back = strip(t.generate({ seed: 8, side: 'back' }).html);
    expect(front).toMatch(/^\d+ × \d+ = \?$/);
    expect(back).toMatch(/^\d+ × \d+ = \d+$/);
    expect(front).not.toBe(back);
  });

  test('validate operands and answer range', () => {
    const t = getTemplate(id);
    const res = t.validate({ seed: 15, config: {} });
    expect(res && res.ok).toBe(true);
  });
});

