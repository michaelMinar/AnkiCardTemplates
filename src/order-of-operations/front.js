// Import shared functions from index.js
const { formatExpressionWithSuperscript, generateMathExpression } = 
  typeof require !== 'undefined' ? require('./index') : {};

// Front-side specific code
function initFrontSide(numTerms, includeExponents, uniquePart) {
    // Generate fresh expression and store it
    const expression = generateMathExpression(numTerms, true, includeExponents);
    const storageKeyExpression = "tempExpression_" + uniquePart;
    
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(storageKeyExpression, expression);
    }
    
    // Format expression with superscript for exponents before displaying
    const formattedExpression = formatExpressionWithSuperscript(expression);
    
    return {
        expression,
        formattedExpression
    };
}

// Browser execution function
var browserInit = function() {
    // Check if #answer exists to determine if we're on the back side
    var answerElement = document.getElementById("answer");
    var onBack = answerElement !== null;
    
    if (!onBack) {
        // Get the question element
        var questionElement = document.getElementById("question");
        if (!questionElement) {
            return;
        }
        
        // Get the unique ID so each card uses unique keys
        var uniquePart = "{{UniqueID}}".trim();
        var numTermsEl = document.getElementById("num_terms");
        var includeExponentsEl = document.getElementById("include_exponents");
        
        if (!numTermsEl || !includeExponentsEl) {
            return;
        }
        
        var numTermsStr = numTermsEl.textContent.trim();
        var includeExponentsStr = includeExponentsEl.textContent.trim().toLowerCase();
        
        // Parse NumTerms value; default to 4 if invalid
        var numTerms = parseInt(numTermsStr, 10);
        if (isNaN(numTerms) || numTerms <= 0) {
            numTerms = 4;
        }
        
        // Parse IncludeExponents value; default to true if invalid
        var includeExponents = includeExponentsStr === 'false' ? false : true;

        // Initialize front side
        const result = initFrontSide(numTerms, includeExponents, uniquePart);
        
        // Display expression
        questionElement.innerHTML = "Evaluate the expression: " + result.formattedExpression;
    }
};

// Export front-side specific functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initFrontSide
    };
} else if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Execute browser init code
    browserInit();
}