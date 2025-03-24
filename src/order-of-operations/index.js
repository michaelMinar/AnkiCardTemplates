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
            // Randomly choose an operator or a number
            expression.push(operators[Math.floor(Math.random() * operators.length)]);
            expression.push(String(Math.floor(Math.random() * 10) + 1));
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

// Export all functions that should be testable
module.exports = {
    formatExpressionWithSuperscript,
    generateMathExpression,
    insertParentheses,
    roundToPrecisionAndTrim
};