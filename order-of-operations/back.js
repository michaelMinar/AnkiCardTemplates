{{FrontSide}}
<hr>
<div id="answer"></div>
<script>
(function() {
    // On the back side, #answer exists, so our front script knows it's on the back.
    var uniquePart = "{{UniqueID}}".trim();
    var storageKeyExpression = "tempExpression_" + uniquePart;

    var expression = localStorage.getItem(storageKeyExpression);

    if (!expression) {
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
    
    // Function to format the expression with superscript for exponents
    function formatExpressionWithSuperscript(expr) {
        // Use regex to find patterns like "number ^ exponent" and replace with HTML superscript
        return expr.replace(/(\d+)\s*\^\s*(\d+)/g, function(match, base, exponent) {
            return base + '<sup>' + exponent + '</sup>';
        });
    }

    // Helper function to round decimal numbers to a given precision
    function roundToPrecisionAndTrim(num, precision) {
        const rounded = num.toFixed(precision);
        return parseFloat(rounded);
    }
})();
</script>