const { 
  formatExpressionWithSuperscript, 
  generateMathExpression, 
  insertParentheses 
} = require('../../src/order-of-operations/index.js');

describe('Order of Operations Card', () => {
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
});