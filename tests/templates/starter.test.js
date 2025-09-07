const { getTemplate } = require('../../src/runtime');
require('../../src/templates/_starter/add_two_numbers');

function strip(html) {
  return String(html).replace(/<[^>]+>/g, '').trim();
}

describe('topic/add_two_numbers', () => {
  const id = 'topic/add_two_numbers';

  test('deterministic per seed (front)', () => {
    const t = getTemplate(id);
    const a = t.generate({ seed: 123, side: 'front' }).html;
    const b = t.generate({ seed: 123, side: 'front' }).html;
    expect(a).toBe(b);
  });

  test('front/back parity', () => {
    const t = getTemplate(id);
    const front = strip(t.generate({ seed: 5, side: 'front' }).html);
    const back = strip(t.generate({ seed: 5, side: 'back' }).html);
    expect(front.endsWith('= ?')).toBe(true);
    expect(back).toMatch(/= \d+$/);
    expect(front).not.toBe(back);
  });

  test('validate invariants', () => {
    const t = getTemplate(id);
    const res = t.validate({ seed: 10, config: {} });
    expect(res && res.ok).toBe(true);
  });
});

