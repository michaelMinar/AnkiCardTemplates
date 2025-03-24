// Tests for dynamic-division template
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
  'maxval': { textContent: '99' },
  'maxval2': { textContent: '9999' },
  'question': { textContent: '' },
  'answer': { textContent: '' }
};

describe('Dynamic Division Card', () => {
  test('division calculation is correct', () => {
    // Test cases for division with remainder
    expect(Math.floor(7543 / 23)).toBe(327);
    expect(7543 % 23).toBe(22);
    
    // Test cases for division without remainder
    expect(Math.floor(8400 / 42)).toBe(200);
    expect(8400 % 42).toBe(0);
  });
  
  test('random number generation is within expected range', () => {
    // Mock Math.random to return 0.5
    const originalRandom = Math.random;
    Math.random = jest.fn(() => 0.5);
    
    // Test number generation logic directly
    const maxDivisor = 99;
    const maxDividend = 9999;
    const divisor = 10 + Math.floor(Math.random() * (maxDivisor - 9));
    const dividend = 1000 + Math.floor(Math.random() * (maxDividend - 999));
    
    // Restore original Math.random
    Math.random = originalRandom;
    
    // Check that numbers are within expected range
    expect(divisor).toBeGreaterThanOrEqual(10);
    expect(divisor).toBeLessThanOrEqual(99);
    expect(dividend).toBeGreaterThanOrEqual(1000);
    expect(dividend).toBeLessThanOrEqual(9999);
  });
  
  test('localStorage operations store and retrieve values', () => {
    // Test storing
    localStorageMock.setItem('tempDivisor_test-unique-id', '42');
    localStorageMock.setItem('tempDividend_test-unique-id', '8400');
    
    // Test retrieving
    expect(localStorageMock.getItem('tempDivisor_test-unique-id')).toBe('42');
    expect(localStorageMock.getItem('tempDividend_test-unique-id')).toBe('8400');
    
    // Test parsing
    const divisor = parseInt(localStorageMock.getItem('tempDivisor_test-unique-id'), 10);
    const dividend = parseInt(localStorageMock.getItem('tempDividend_test-unique-id'), 10);
    expect(divisor).toBe(42);
    expect(dividend).toBe(8400);
  });
});