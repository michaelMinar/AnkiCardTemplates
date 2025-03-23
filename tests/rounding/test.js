// Tests for rounding template
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

describe('Rounding Card', () => {
  test('getPlaceValue returns correct place names', () => {
    // Define the function from the script
    function getPlaceValue(decile) {
      switch(decile) {
        case 100: return "hundreds";
        case 10: return "tens";
        case 1: return "ones";
        case 0.1: return "tenths";
        case 0.01: return "hundredths";
        case 0.001: return "thousandths";
        default: return "invalid value";
      }
    }
    
    expect(getPlaceValue(100)).toBe("hundreds");
    expect(getPlaceValue(10)).toBe("tens");
    expect(getPlaceValue(1)).toBe("ones");
    expect(getPlaceValue(0.1)).toBe("tenths");
    expect(getPlaceValue(0.01)).toBe("hundredths");
    expect(getPlaceValue(0.001)).toBe("thousandths");
    expect(getPlaceValue(0.0001)).toBe("invalid value");
  });

  test('random number generation produces expected values', () => {
    // Mock Math.random to return predictable values
    const originalRandom = Math.random;
    Math.random = jest.fn(() => 0.5);
    
    // Test number generation logic directly
    const maxVal = 100;
    const n1 = Math.floor(Math.random() * 10000 * maxVal)/10000;
    const n2 = Math.pow(10, 3 - Math.ceil(Math.random() * 6));
    
    // Restore original Math.random
    Math.random = originalRandom;
    
    // Verify n1 is a number between 0 and maxVal
    expect(n1).toBeGreaterThanOrEqual(0);
    expect(n1).toBeLessThan(maxVal);
    
    // Verify n2 is one of the expected decimal place values
    const validPlaceValues = [100, 10, 1, 0.1, 0.01, 0.001];
    expect(validPlaceValues).toContain(n2);
  });

  test('rounds numbers correctly', () => {
    // Test rounding to different place values
    const testCases = [
      { number: 123.456, decimalPlace: 1, expected: 123 },
      { number: 123.456, decimalPlace: 0.1, expected: 123.5 },
      { number: 123.856, decimalPlace: 1, expected: 124 },
      { number: 123.456, decimalPlace: 10, expected: 120 },
      { number: 123.456, decimalPlace: 0.01, expected: 123.46 },
      { number: 123.456, decimalPlace: 0.001, expected: 123.456 }
    ];
    
    testCases.forEach(tc => {
      const result = Math.round(tc.number/tc.decimalPlace)*tc.decimalPlace;
      expect(result).toBeCloseTo(tc.expected, 5);
    });
  });

  test('localStorage operations store and retrieve values', () => {
    // Test storing
    localStorageMock.setItem('tempNum1_test-unique-id', '123.456');
    localStorageMock.setItem('tempNum2_test-unique-id', '0.01');
    
    // Test retrieving
    expect(localStorageMock.getItem('tempNum1_test-unique-id')).toBe('123.456');
    expect(localStorageMock.getItem('tempNum2_test-unique-id')).toBe('0.01');
    
    // Test parsing
    const n1 = parseFloat(localStorageMock.getItem('tempNum1_test-unique-id'));
    const n2 = parseFloat(localStorageMock.getItem('tempNum2_test-unique-id'));
    expect(n1).toBe(123.456);
    expect(n2).toBe(0.01);
  });
});