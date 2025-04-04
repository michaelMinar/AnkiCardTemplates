const { 
  formatExpressionWithSuperscript, 
  generateMathExpression, 
  insertParentheses,
  roundToPrecisionAndTrim,
  decimalToMixedFraction
} = require('../../src/order-of-operations/index.js');

const { initFrontSide } = require('../../src/order-of-operations/front.js');
const { evaluateExpression } = require('../../src/order-of-operations/back.js');

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

    test('should use numbers 2-4 for exponent operands', () => {
      // Mock Math.random to control the behavior
      const originalRandom = Math.random;
      
      // Mock to force ^ operator and control the operand value
      Math.random = jest.fn()
        .mockReturnValueOnce(0.1) // First number (any value 1-10)
        .mockReturnValueOnce(0.9) // Choose ^ operator (high value to ensure ^ is selected)
        .mockReturnValueOnce(0.0); // Low value for exponent operand (should result in 2)
      
      let result = generateMathExpression(2, false, true);
      expect(result.split(' ')).toContain('2'); // Check the exponent is 2
      
      // Reset mocks for the next test
      jest.clearAllMocks();
      
      // Mock to force ^ operator and a different operand value
      Math.random = jest.fn()
        .mockReturnValueOnce(0.1) // First number
        .mockReturnValueOnce(0.9) // Choose ^ operator
        .mockReturnValueOnce(0.667); // Middle value for exponent operand (should result in 4)
      
      result = generateMathExpression(2, false, true);
      
      // Log what was generated to debug
      console.log("Generated result:", result);
      console.log("Split result:", result.split(' '));
      
      // The Math.random() implementation generates values between 2-4 for exponents
      // Could be any of those values based on the mock
      const exponentValues = ['2', '3', '4'];
      expect(exponentValues).toContain(result.split(' ')[2]); // Check the exponent is one of 2, 3, or 4
      
      // Restore Math.random
      Math.random = originalRandom;
    });
  });

  describe('roundToPrecisionAndTrim', () => {
    test('should round to the specified precision', () => {
      expect(roundToPrecisionAndTrim(3.14159, 2)).toBe(3.14);
      expect(roundToPrecisionAndTrim(1.999, 1)).toBe(2);
      expect(roundToPrecisionAndTrim(10.5555, 3)).toBe(10.556);
    });
  });
  
  describe('decimalToMixedFraction', () => {
    test('should convert integers without change', () => {
      expect(decimalToMixedFraction(5)).toBe('5');
      expect(decimalToMixedFraction(-8)).toBe('-8');
      expect(decimalToMixedFraction(0)).toBe('0');
    });
    
    test('should convert simple decimals to fractions', () => {
      expect(decimalToMixedFraction(0.5)).toBe('1/2');
      expect(decimalToMixedFraction(0.25)).toBe('1/4');
      expect(decimalToMixedFraction(0.75)).toBe('3/4');
    });
    
    test('should convert mixed numbers', () => {
      expect(decimalToMixedFraction(1.5)).toBe('1 1/2');
      expect(decimalToMixedFraction(2.25)).toBe('2 1/4');
      expect(decimalToMixedFraction(3.75)).toBe('3 3/4');
    });
    
    test('should handle negative values', () => {
      expect(decimalToMixedFraction(-1.5)).toBe('-1 1/2');
      expect(decimalToMixedFraction(-0.25)).toBe('-1/4');
    });
    
    test('should handle complex fractions with simplification', () => {
      expect(decimalToMixedFraction(1.3333333333)).toBe('1 1/3'); // Approximately 1 1/3
      expect(decimalToMixedFraction(2.6666666667)).toBe('2 2/3'); // Approximately 2 2/3
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
      expect(result.formattedResult).toBe('5');
      expect(result.formattedExpression).toBe('2 + 3');
    });
    
    test('should evaluate an expression with exponents', () => {
      const result = evaluateExpression('2 ^ 3 + 1');
      
      expect(result.success).toBe(true);
      expect(result.formattedResult).toBe('9');
      expect(result.formattedExpression).toBe('2<sup>3</sup> + 1');
    });
    
    test('should convert decimal results to mixed fractions', () => {
      const result = evaluateExpression('10 / 4');
      
      expect(result.success).toBe(true);
      expect(result.formattedResult).toBe('2 1/2');
      expect(result.formattedExpression).toBe('10 / 4');
    });
    
    test('should handle complex expressions with decimal results', () => {
      const result = evaluateExpression('1 + 2 * 3 / 4');
      
      expect(result.success).toBe(true);
      expect(result.formattedResult).toBe('2 1/2');
      expect(result.formattedExpression).toBe('1 + 2 * 3 / 4');
    });
    
    test('should handle expression evaluation errors', () => {
      const result = evaluateExpression('2 +');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});