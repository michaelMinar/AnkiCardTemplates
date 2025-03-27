// Import shared functions from index.js
const { formatExpressionWithSuperscript, roundToPrecisionAndTrim, decimalToMixedFraction } = 
  typeof require !== 'undefined' ? require('./index') : {};

// Back-side specific code
function evaluateExpression(expression) {
    try {
        // Convert ^ to ** for JavaScript's exponentiation operator
        const jsExpression = expression.replace(/\^/g, '**');
        
        // Handle parentheses and convert to valid JavaScript
        const normalizedExpression = jsExpression.replace(/\s+/g, '');
        
        // Use Function constructor to safely evaluate the expression
        const result = Function('"use strict"; return ' + normalizedExpression)();
        
        // Format the original expression with superscript for display
        const formattedExpression = formatExpressionWithSuperscript(expression);
        
        // Display the result as a mixed fraction
        const formattedResult = decimalToMixedFraction(result);
        
        return {
            formattedExpression,
            formattedResult,
            success: true
        };
    } catch (error) {
        return {
            error: error.message,
            success: false
        };
    }
}

// Browser execution variables and functions
var browserInit = function() {
    // Check if #answer exists to determine if we're on the back side
    var answerElement = document.getElementById("answer");
    var onBack = answerElement !== null;
    
    if (onBack) {
        // Get the unique ID so each card uses unique keys
        var uniquePart = "{{UniqueID}}".trim();
        var storageKeyExpression = "tempExpression_" + uniquePart;
        
        // Get the stored expression
        var expression = localStorage.getItem(storageKeyExpression);
        if (!expression) {
            // Fallback if something went wrong
            expression = "2 + 2";
        }
        
        // Evaluate and display the expression
        const result = evaluateExpression(expression);
        
        if (result.success) {
            answerElement.innerHTML = 
                result.formattedExpression + " = " + result.formattedResult;
        } else {
            answerElement.textContent = 
                "Error evaluating expression: " + result.error;
        }
    }
};

// Export back-side specific functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        evaluateExpression
    };
} else if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Execute browser init code
    browserInit();
}