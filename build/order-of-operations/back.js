{{FrontSide}}
<hr>
<div id="answer"></div>
<script>
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

// Front side script
(function() {
    // Check if we're in a browser environment
    if (typeof document === 'undefined') return;
    
    // Check if #answer exists to determine if we're on the back side
    var onBack = (document.getElementById("answer") !== null);

    // Get the unique ID so each card uses unique keys
    var uniquePart = "{{UniqueID}}".trim();
    var numTermsStr = document.getElementById("num_terms").textContent.trim();
    var includeExponentsStr = document.getElementById("include_exponents").textContent.trim().toLowerCase();
    
    // Parse NumTerms value; default to 4 if invalid
    var numTerms = parseInt(numTermsStr, 10);
    if (isNaN(numTerms) || numTerms <= 0) {
        numTerms = 4;
    }
    
    // Parse IncludeExponents value; default to true if invalid
    var includeExponents = includeExponentsStr === 'false' ? false : true;

    var storageKeyExpression = "tempExpression_" + uniquePart;

    var expression;
    if (!onBack) {
        // FRONT SIDE: Generate fresh expression and store it
        expression = generateMathExpression(numTerms, true, includeExponents);
        localStorage.setItem(storageKeyExpression, expression);
    } else {
        // BACK SIDE: Just read the existing expression
        expression = localStorage.getItem(storageKeyExpression);
        if (!expression) {
            // Fallback if something went wrong
            expression = "2 + 2";
        }

        try {
            // Convert ^ to ** for JavaScript's exponentiation operator
            const jsExpression = expression.replace(/\^/g, '**');
            
            // Handle parentheses and convert to valid JavaScript
            const normalizedExpression = jsExpression.replace(/\s+/g, '');
            
            // Use Function constructor to safely evaluate the expression
            const result = Function('"use strict"; return ' + normalizedExpression)();
            
            // Format the original expression with superscript for display
            const formattedExpression = formatExpressionWithSuperscript(expression);
            
            // Display the result, handling both integer and floating-point results
            const formattedResult = Number.isInteger(result) ? result : roundToPrecisionAndTrim(result, 5);
            document.getElementById("answer").innerHTML = 
                formattedExpression + " = " + formattedResult;
        } catch (error) {
            document.getElementById("answer").textContent = "Error evaluating expression: " + error.message;
        }
    }

    // Format expression with superscript for exponents before displaying
    if (!onBack) {
        const formattedExpression = formatExpressionWithSuperscript(expression);
        document.getElementById("question").innerHTML = "Evaluate the expression: " + formattedExpression;
    }
})();
</script>