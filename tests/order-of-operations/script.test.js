const { 
  formatExpressionWithSuperscript, 
  generateMathExpression, 
  insertParentheses,
  roundToPrecisionAndTrim
} = require('../../src/order-of-operations');

const { initFrontSide } = require('../../src/order-of-operations/front');
const { evaluateExpression } = require('../../src/order-of-operations/back');

describe('Order of Operations template', () => {
  // Set up mocks for browser environment
  beforeEach(() => {
    global.localStorage = {
      setItem: jest.fn(),
      getItem: jest.fn()
    };
  });

  describe('formatExpressionWithSuperscript', () => {
    test('should format exponents as superscript', () => {
      const input = '2 ^ 3 + 4';
      const expected = '2<sup>3</sup> + 4';
      expect(formatExpressionWithSuperscript(input)).toBe(expected);
    });

    test('should handle multiple exponents', () => {
      const input = '2 ^ 3 + 4 ^ 2';
      const expected = '2<sup>3</sup> + 4<sup>2</sup>';
      expect(formatExpressionWithSuperscript(input)).toBe(expected);
    });
    
    test('should not modify expressions without exponents', () => {
      const input = '2 + 3 * 4';
      expect(formatExpressionWithSuperscript(input)).toBe(input);
    });
  });

  describe('insertParentheses', () => {
    test('should insert parentheses at valid positions', () => {
      const expression = ['2', '+', '3', '*', '4'];
      const operators = ['+', '-', '*', '/'];
      const result = insertParentheses([...expression], operators);
      
      // Check that parentheses were added
      expect(result.length).toBeGreaterThan(expression.length);
      expect(result.includes('(')).toBe(true);
      expect(result.includes(')')).toBe(true);
      
      // Check that the parentheses are balanced
      const openCount = result.filter(item => item === '(').length;
      const closeCount = result.filter(item => item === ')').length;
      expect(openCount).toBe(closeCount);
    });
  });

  describe('generateMathExpression', () => {
    test('should generate an expression with the specified number of terms', () => {
      const result = generateMathExpression(3, false, false);
      const terms = result.split(' ').filter(term => term !== '');
      
      // With 3 terms, we should have 5 parts: number, operator, number, operator, number
      expect(terms.length).toBe(5);
    });
    
    test('should include exponents when specified', () => {
      // Mock Math.random to ensure we get exponents
      const originalRandom = Math.random;
      Math.random = jest.fn()
        .mockReturnValueOnce(0.1) // First number
        .mockReturnValueOnce(0.9) // Choose ^ operator
        .mockReturnValueOnce(0.2); // Second number
      
      const result = generateMathExpression(2, false, true);
      
      // Restore Math.random
      Math.random = originalRandom;
      
      expect(result).toContain('^');
    });
    
    test('should not include exponents when not specified', () => {
      // Run multiple times to ensure we don't get ^ by chance
      for (let i = 0; i < 10; i++) {
        const result = generateMathExpression(3, false, false);
        expect(result).not.toContain('^');
      }
    });
  });

  describe('roundToPrecisionAndTrim', () => {
    test('should round to the specified precision', () => {
      expect(roundToPrecisionAndTrim(3.14159, 2)).toBe(3.14);
      expect(roundToPrecisionAndTrim(1.999, 1)).toBe(2);
      expect(roundToPrecisionAndTrim(10.5555, 3)).toBe(10.556);
    });
  });

  describe('initFrontSide', () => {
    test('should generate and format an expression', () => {
      const result = initFrontSide(3, true, 'test123');
      
      expect(result.expression).toBeDefined();
      expect(result.formattedExpression).toBeDefined();
      expect(global.localStorage.setItem).toHaveBeenCalledWith('tempExpression_test123', result.expression);
    });
  });

  describe('evaluateExpression', () => {
    test('should evaluate a simple expression correctly', () => {
      const result = evaluateExpression('2 + 3');
      
      expect(result.success).toBe(true);
      expect(result.formattedResult).toBe(5);
      expect(result.formattedExpression).toBe('2 + 3');
    });
    
    test('should evaluate an expression with exponents', () => {
      const result = evaluateExpression('2 ^ 3 + 1');
      
      expect(result.success).toBe(true);
      expect(result.formattedResult).toBe(9);
      expect(result.formattedExpression).toBe('2<sup>3</sup> + 1');
    });
    
    test('should handle expression evaluation errors', () => {
      const result = evaluateExpression('2 +');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});