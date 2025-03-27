// Function to format the expression with superscript for exponents
function formatExpressionWithSuperscript(expr) {
    // Use regex to find patterns like "number ^ exponent" and replace with HTML superscript
    return expr.replace(/(\d+)\s*\^\s*(\d+)/g, function(match, base, exponent) {
        return base + '<sup>' + exponent + '</sup>';
    });
}

// Function to insert parentheses at valid positions in an expression
function insertParentheses(expression, operators) {
    // Find valid positions for parentheses
    const validStartPositions = [];
    const validEndPositions = [];
    
    // Find positions after operators (excluding ^) for opening parenthesis
    for (let i = 0; i < expression.length; i++) {
        if (operators.includes(expression[i]) && expression[i] !== '^') {
            validStartPositions.push(i + 1);
        }
    }
    
    // Find positions after numbers for closing parenthesis
    for (let i = 0; i < expression.length; i++) {
        if (!isNaN(parseInt(expression[i], 10))) {
            validEndPositions.push(i + 1);
        }
    }
    
    // Only add parentheses if we have valid positions
    if (validStartPositions.length > 0 && validEndPositions.length > 0) {
        // Choose a random valid start position
        const startIdx = Math.floor(Math.random() * validStartPositions.length);
        const parenStart = validStartPositions[startIdx];
        
        // Choose a random valid end position that comes after the start position
        const validEnds = validEndPositions.filter(pos => pos > parenStart);
        if (validEnds.length > 0) {
            const endIdx = Math.floor(Math.random() * validEnds.length);
            const parenEnd = validEnds[endIdx];
            
            // Insert the parentheses
            expression.splice(parenStart, 0, "(");
            expression.splice(parenEnd + 1, 0, ")");
        }
    }
    
    return expression;
}

function generateMathExpression(numTerms = 3, includeParens = true, includeExponents = true) {
    const operators = ['+', '-', '*', '/'];
    if (includeExponents) {
        operators.push('^'); // Using ^ instead of ** for better readability
    }

    const expression = [];
    for (let i = 0; i < numTerms; i++) {
        if (i === 0) {
            // First term is always a number
            expression.push(String(Math.floor(Math.random() * 10) + 1));
        } else {
            // Randomly choose an operator
            const operator = operators[Math.floor(Math.random() * operators.length)];
            expression.push(operator);
            
            // Choose number based on operator
            if (operator === '^') {
                // For exponents, use a number between 2 and 4
                expression.push(String(Math.floor(Math.random() * 3) + 2));
            } else {
                // For other operators, use a number between 1 and 10
                expression.push(String(Math.floor(Math.random() * 10) + 1));
            }
        }
    }

    // Optionally add parentheses
    if (includeParens && Math.random() < 0.7) {
        insertParentheses(expression, operators);
    }

    return expression.join(" ");
}

// Helper function to round decimal numbers to a given precision
function roundToPrecisionAndTrim(num, precision) {
    const rounded = num.toFixed(precision);
    return parseFloat(rounded);
}

// Function to convert a decimal to a mixed fraction string
function decimalToMixedFraction(decimal) {
    if (Number.isInteger(decimal)) {
        return decimal.toString();
    }
    
    // Get the sign of the number
    const sign = decimal < 0 ? "-" : "";
    const absDecimal = Math.abs(decimal);
    
    // Get the whole number part
    const wholePart = Math.floor(absDecimal);
    
    // Get the fractional part
    let fractionalPart = absDecimal - wholePart;
    
    if (fractionalPart === 0) {
        return sign + wholePart.toString();
    }
    
    // Check for common fractions first
    const tolerance = 0.0001;
    const commonFractions = [
        { decimal: 1/3, numerator: 1, denominator: 3 },
        { decimal: 2/3, numerator: 2, denominator: 3 },
        { decimal: 1/4, numerator: 1, denominator: 4 },
        { decimal: 3/4, numerator: 3, denominator: 4 },
        { decimal: 1/5, numerator: 1, denominator: 5 },
        { decimal: 2/5, numerator: 2, denominator: 5 },
        { decimal: 3/5, numerator: 3, denominator: 5 },
        { decimal: 4/5, numerator: 4, denominator: 5 },
        { decimal: 1/6, numerator: 1, denominator: 6 },
        { decimal: 5/6, numerator: 5, denominator: 6 },
        { decimal: 1/8, numerator: 1, denominator: 8 },
        { decimal: 3/8, numerator: 3, denominator: 8 },
        { decimal: 5/8, numerator: 5, denominator: 8 },
        { decimal: 7/8, numerator: 7, denominator: 8 }
    ];
    
    for (const fraction of commonFractions) {
        if (Math.abs(fractionalPart - fraction.decimal) < tolerance) {
            if (wholePart === 0) {
                return sign + fraction.numerator + "/" + fraction.denominator;
            } else {
                return sign + wholePart + " " + fraction.numerator + "/" + fraction.denominator;
            }
        }
    }
    
    // Convert decimal to fraction using a precision factor
    const precision = 1000000;
    let numerator = Math.round(fractionalPart * precision);
    let denominator = precision;
    
    // Find the greatest common divisor (GCD)
    function gcd(a, b) {
        return b === 0 ? a : gcd(b, a % b);
    }
    
    const divisor = gcd(numerator, denominator);
    numerator = numerator / divisor;
    denominator = denominator / divisor;
    
    if (wholePart === 0) {
        return sign + numerator + "/" + denominator;
    } else {
        return sign + wholePart + " " + numerator + "/" + denominator;
    }
}

// Export shared functions
module.exports = {
    formatExpressionWithSuperscript,
    generateMathExpression,
    insertParentheses,
    roundToPrecisionAndTrim,
    decimalToMixedFraction
};