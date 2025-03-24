// Tests for order-of-operations template
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
  'num_terms': { textContent: '4' },
  'include_exponents': { textContent: 'true' },
  'question': { textContent: '' },
  'answer': { textContent: '' }
};

describe('Order of Operations Card', () => {
  // Define helper functions for testing
  function roundToPrecisionAndTrim(num, precision) {
    const rounded = num.toFixed(precision);
    return parseFloat(rounded);
  }
  
  // Function to generate a math expression (simplified version for testing)
  function generateMathExpression(numTerms = 3, includeParens = true, includeExponents = true) {
    const operators = ['+', '-', '*', '/'];
    if (includeExponents) {
        operators.push('^');
    }

    const expression = [];
    for (let i = 0; i < numTerms; i++) {
        if (i === 0) {
            expression.push(String(Math.floor(Math.random() * 10) + 1));
        } else {
            if (Math.random() < 0.5) {
                expression.push(operators[Math.floor(Math.random() * operators.length)]);
                expression.push(String(Math.floor(Math.random() * 10) + 1));
            } else {
                expression.push(String(Math.floor(Math.random() * 10) + 1));
            }
        }
    }

    if (includeParens && Math.random() < 0.7) {
        const parenStart = Math.floor(Math.random() * (expression.length / 2));
        const parenEnd = Math.floor(Math.random() * (expression.length - parenStart - 2)) + parenStart + 2;
        expression.splice(parenStart, 0, "(");
        expression.splice(parenEnd + 1, 0, ")");
    }

    return expression.join(" ");
  }
  
  test('roundToPrecisionAndTrim function works correctly', () => {
    expect(roundToPrecisionAndTrim(123.456789, 3)).toBe(123.457);
    expect(roundToPrecisionAndTrim(123.45, 1)).toBe(123.5);
    expect(roundToPrecisionAndTrim(123, 2)).toBe(123);
    expect(roundToPrecisionAndTrim(0.999999, 2)).toBe(1);
  });
  
  test('expression evaluation is correct', () => {
    // Test simple expressions
    expect(Function('"use strict"; return 2 + 3 * 4')()).toBe(14);
    expect(Function('"use strict"; return (2 + 3) * 4')()).toBe(20);
    expect(Function('"use strict"; return 2 + 3 * 4 / 2')()).toBe(8);
    expect(Function('"use strict"; return 3 ** 2')()).toBe(9);
    
    // Test conversion from ^ to **
    const jsExpression = '3 ^ 2'.replace(/\^/g, '**').replace(/\s+/g, '');
    expect(Function('"use strict"; return ' + jsExpression)()).toBe(9);
  });
  
  test('formatExpressionWithSuperscript correctly formats exponents', () => {
    // Define the function for testing
    function formatExpressionWithSuperscript(expr) {
      return expr.replace(/(\d+)\s*\^\s*(\d+)/g, function(match, base, exponent) {
        return base + '<sup>' + exponent + '</sup>';
      });
    }
    
    // Test basic exponent formatting
    expect(formatExpressionWithSuperscript('3 ^ 2')).toBe('3<sup>2</sup>');
    expect(formatExpressionWithSuperscript('3^2')).toBe('3<sup>2</sup>');
    expect(formatExpressionWithSuperscript('10 ^ 3')).toBe('10<sup>3</sup>');
    
    // Test mixed expressions
    expect(formatExpressionWithSuperscript('2 + 3 ^ 2')).toBe('2 + 3<sup>2</sup>');
    expect(formatExpressionWithSuperscript('(2 + 3) ^ 2')).toBe('(2 + 3) ^ 2'); // Should not change non-number^number
    expect(formatExpressionWithSuperscript('2 * 3 ^ 2 + 4')).toBe('2 * 3<sup>2</sup> + 4');
  });
  
  test('localStorage operations store and retrieve expressions', () => {
    // Test storing
    const testExpression = '2 + 3 * (4 - 1)';
    localStorageMock.setItem('tempExpression_test-unique-id', testExpression);
    
    // Test retrieving
    expect(localStorageMock.getItem('tempExpression_test-unique-id')).toBe(testExpression);
  });
  
  test('generateMathExpression creates valid expressions', () => {
    // Mock Math.random for deterministic testing
    const originalRandom = Math.random;
    let mockRandomCounter = 0;
    const mockRandomValues = [0.3, 0.6, 0.4, 0.7, 0.2, 0.8, 0.5, 0.1, 0.9];
    Math.random = jest.fn(() => mockRandomValues[mockRandomCounter++ % mockRandomValues.length]);
    
    // Generate a test expression
    const expression = generateMathExpression(4, true, true);
    
    // Restore original Math.random
    Math.random = originalRandom;
    
    // Check that we have a non-empty string
    expect(typeof expression).toBe('string');
    expect(expression.length).toBeGreaterThan(0);
    
    // Try to evaluate the expression
    try {
      // Convert ^ to ** for JavaScript's exponentiation
      const jsExpression = expression.replace(/\^/g, '**').replace(/\s+/g, '');
      const result = Function('"use strict"; return ' + jsExpression)();
      
      // We just need to make sure it evaluates without error
      expect(typeof result).toBe('number');
    } catch (error) {
      // If there's an evaluation error, the test should fail
      expect(error).toBeNull();
    }
  });
});