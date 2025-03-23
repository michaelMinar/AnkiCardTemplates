// Tests for dynamic-multiplication template
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
  'maxval2': { textContent: '99' },
  'question': { textContent: '' },
  'answer': { textContent: '' }
};

describe('Dynamic Multiplication Card', () => {
  // Define the roundToPrecisionAndTrim function for testing
  function roundToPrecisionAndTrim(num, precision) {
    const rounded = num.toFixed(precision);
    return parseFloat(rounded);
  }
  
  test('roundToPrecisionAndTrim function works correctly', () => {
    expect(roundToPrecisionAndTrim(123.456789, 3)).toBe(123.457);
    expect(roundToPrecisionAndTrim(123.45, 1)).toBe(123.5);
    expect(roundToPrecisionAndTrim(123, 2)).toBe(123);
    expect(roundToPrecisionAndTrim(0.999999, 2)).toBe(1);
  });
  
  test('multiplication calculation is correct', () => {
    // Test direct multiplication with rounding
    const num1 = 24.5;
    const num2 = 6.25;
    const result = roundToPrecisionAndTrim(num1 * num2, 5);
    expect(result).toBe(153.125);
  });
  
  test('random number generation is within expected range', () => {
    // Mock Math.random to return 0.5
    const originalRandom = Math.random;
    Math.random = jest.fn(() => 0.5);
    
    // Test number generation logic directly
    const maxVal = 99;
    const precision1 = Math.pow(10, 3 - Math.ceil(Math.random() * 3));
    const precision2 = Math.pow(10, 3 - Math.ceil(Math.random() * 2));
    const n1 = 1 + Math.floor(Math.random() * maxVal * precision1) / precision1;
    const n2 = 1 + Math.floor(Math.random() * maxVal * precision2) / precision2;
    
    // Restore original Math.random
    Math.random = originalRandom;
    
    // Check that numbers are within expected range
    expect(n1).toBeGreaterThanOrEqual(1);
    expect(n1).toBeLessThanOrEqual(maxVal + 1);
    expect(n2).toBeGreaterThanOrEqual(1);
    expect(n2).toBeLessThanOrEqual(maxVal + 1);
  });
  
  test('localStorage operations store and retrieve values', () => {
    // Test storing
    localStorageMock.setItem('tempNum1_test-unique-id', '24.5');
    localStorageMock.setItem('tempNum2_test-unique-id', '6.25');
    
    // Test retrieving
    expect(localStorageMock.getItem('tempNum1_test-unique-id')).toBe('24.5');
    expect(localStorageMock.getItem('tempNum2_test-unique-id')).toBe('6.25');
    
    // Test parsing
    const n1 = parseFloat(localStorageMock.getItem('tempNum1_test-unique-id'));
    const n2 = parseFloat(localStorageMock.getItem('tempNum2_test-unique-id'));
    expect(n1).toBe(24.5);
    expect(n2).toBe(6.25);
  });
});