const { mulberry32, randInt, choice, shuffle, gcd, lcm } = require('../../src/runtime/rng');

describe('rng helpers', () => {
  test('mulberry32 is deterministic per seed', () => {
    const a = mulberry32(123);
    const b = mulberry32(123);
    const c = mulberry32(456);
    for (let i = 0; i < 5; i++) {
      expect(a()).toBe(b());
    }
    expect(a()).not.toBe(c());
  });

  test('randInt respects inclusive bounds', () => {
    const r = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const n = randInt(r, 2, 5);
      expect(n).toBeGreaterThanOrEqual(2);
      expect(n).toBeLessThanOrEqual(5);
    }
  });

  test('choice returns an element from array', () => {
    const r = mulberry32(7);
    const v = choice(r, ['a', 'b', 'c']);
    expect(['a', 'b', 'c']).toContain(v);
  });

  test('shuffle is deterministic for same seed', () => {
    const arr = [1, 2, 3, 4, 5, 6];
    const r1 = mulberry32(99);
    const r2 = mulberry32(99);
    const s1 = shuffle(r1, arr);
    const s2 = shuffle(r2, arr);
    expect(s1).toEqual(s2);
    expect(s1.sort()).toEqual(arr.slice().sort());
  });

  test('gcd and lcm basic properties', () => {
    expect(gcd(54, 24)).toBe(6);
    expect(lcm(6, 8)).toBe(24);
    expect(lcm(0, 5)).toBe(0);
  });
});

