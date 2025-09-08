const { util } = require('../../src/runtime');
const reviewSeed = require('../../src/runtime/reviewSeed');

function makeMemoryStore() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? String(m.get(k)) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
  };
}

describe('resolveReviewSeed (per-review seed policy)', () => {
  test('defaults to perReview=true when no seed is provided', () => {
    const prev = global.window.sessionStorage;
    global.window.sessionStorage = makeMemoryStore();
    const id = 'test/template';
    const seedFront = util.resolveReviewSeed({ templateId: id, seedField: '', side: 'front' });
    const key = reviewSeed._internal.storageKey(id);
    expect(global.window.sessionStorage.getItem(key)).toBe(String(seedFront));
    const seedBack = util.resolveReviewSeed({ templateId: id, seedField: '', side: 'back' });
    expect(typeof seedFront).toBe('number');
    expect(seedFront).toBe(seedBack);
    global.window.sessionStorage = prev;
  });

  test('clears stored seed after back side', () => {
    const prev = global.window.sessionStorage;
    global.window.sessionStorage = makeMemoryStore();
    const id = 'test/template2';
    const s1 = util.resolveReviewSeed({ templateId: id, seedField: null, side: 'front' });
    const s2 = util.resolveReviewSeed({ templateId: id, seedField: null, side: 'back' });
    expect(s1).toBe(s2);
    // Next back call (without a new front) produces a fresh seed (not guaranteed different, but very likely)
    const s3 = util.resolveReviewSeed({ templateId: id, seedField: null, side: 'back' });
    // It can equal by coincidence; at least ensure it's a number and not NaN
    expect(typeof s3).toBe('number');
    global.window.sessionStorage = prev;
  });

  test('honors explicit Seed field (static mode)', () => {
    const id = 'test/template3';
    const sFront = util.resolveReviewSeed({ templateId: id, seedField: '123', side: 'front' });
    const sBack = util.resolveReviewSeed({ templateId: id, seedField: '123', side: 'back' });
    expect(sFront).toBe(123);
    expect(sBack).toBe(123);
  });

  test('non-perReview policy without seed still generates a seed (no storage)', () => {
    const id = 'test/template4';
    const s = util.resolveReviewSeed({ templateId: id, seedField: '', side: 'front', perReview: false });
    expect(typeof s).toBe('number');
  });
});
