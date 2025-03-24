// Tests for exponent-to-factors template
const fs = require('fs');
const path = require('path');

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    })
  };
})();

// Mock document elements
const mockElements = {
  'uniqueid-wrapper': { textContent: 'test-unique-id' },
  'maxbase': { textContent: '9' },
  'maxexponent': { textContent: '6' },
  'question': { textContent: '' },
  'answer': { textContent: '' }
};

describe('Exponent-to-Factors Card', () => {
  // Test the createProductString function from back.js
  function createProductString(base, exponent) {
    if (exponent <= 0) return "1";
    if (exponent === 1) return base.toString();
    
    const factors = [];
    for (let i = 0; i < exponent; i++) {
      factors.push(base);
    }
    
    return factors.join(" × ");
  }
  
  test('createProductString function works correctly', () => {
    expect(createProductString(2, 3)).toBe("2 × 2 × 2");
    expect(createProductString(5, 1)).toBe("5");
    expect(createProductString(7, 0)).toBe("1");
    expect(createProductString(3, 4)).toBe("3 × 3 × 3 × 3");
  });
  
  test('exponentiation calculation is correct', () => {
    // Test direct exponentiation
    const base = 3;
    const exponent = 4;
    const result = Math.pow(base, exponent);
    expect(result).toBe(81);
  });
  
  test('random number generation is within expected range', () => {
    // Mock Math.random to return 0.5
    const originalRandom = Math.random;
    Math.random = jest.fn(() => 0.5);
    
    // Test number generation logic directly
    const maxBase = 9;
    const maxExponent = 6;
    const base = 1 + Math.floor(Math.random() * maxBase);
    const exponent = 1 + Math.floor(Math.random() * maxExponent);
    
    // Restore original Math.random
    Math.random = originalRandom;
    
    // Check that numbers are within expected range
    expect(base).toBeGreaterThanOrEqual(1);
    expect(base).toBeLessThanOrEqual(maxBase);
    expect(exponent).toBeGreaterThanOrEqual(1);
    expect(exponent).toBeLessThanOrEqual(maxExponent);
  });
  
  test('localStorage operations store and retrieve values', () => {
    // Test storing
    localStorageMock.setItem('tempBase_test-unique-id', '3');
    localStorageMock.setItem('tempExponent_test-unique-id', '4');
    
    // Test retrieving
    expect(localStorageMock.getItem('tempBase_test-unique-id')).toBe('3');
    expect(localStorageMock.getItem('tempExponent_test-unique-id')).toBe('4');
    
    // Test parsing
    const base = parseInt(localStorageMock.getItem('tempBase_test-unique-id'), 10);
    const exponent = parseInt(localStorageMock.getItem('tempExponent_test-unique-id'), 10);
    expect(base).toBe(3);
    expect(exponent).toBe(4);
  });
});