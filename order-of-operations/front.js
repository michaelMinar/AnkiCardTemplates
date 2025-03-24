<div id="uniqueid-wrapper" style="display:none;">{{UniqueID}}</div>
<div id="num_terms" style="display:none;">{{NumTerms}}</div>
<div id="include_exponents" style="display:none;">{{IncludeExponents}}</div>
<div id="question"></div>

<script>
(function() {
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
    }

    // Format expression with superscript for exponents before displaying
    const formattedExpression = formatExpressionWithSuperscript(expression);
    document.getElementById("question").innerHTML = "Evaluate the expression: " + formattedExpression;

    // Function to format the expression with superscript for exponents
    function formatExpressionWithSuperscript(expr) {
        // Use regex to find patterns like "number ^ exponent" and replace with HTML superscript
        return expr.replace(/(\d+)\s*\^\s*(\d+)/g, function(match, base, exponent) {
            return base + '<sup>' + exponent + '</sup>';
        });
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
                if (Math.random() < 0.5) {
                    expression.push(operators[Math.floor(Math.random() * operators.length)]);
                    expression.push(String(Math.floor(Math.random() * 10) + 1));
                } else {
                    // Add a number
                    expression.push(String(Math.floor(Math.random() * 10) + 1));
                }
            }
        }

        // Optionally add parentheses
        if (includeParens && Math.random() < 0.7) {
            // Find a suitable place to add parentheses
            const parenStart = Math.floor(Math.random() * (expression.length / 2));
            const parenEnd = Math.floor(Math.random() * (expression.length - parenStart - 2)) + parenStart + 2;
            expression.splice(parenStart, 0, "(");
            expression.splice(parenEnd + 1, 0, ")");
        }

        return expression.join(" ");
    }
})();
</script>