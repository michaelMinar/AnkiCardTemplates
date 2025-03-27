{{FrontSide}}
<hr>
<div id="answer"></div>
<script>
(function() {
try {
// Debug element for error logging
var debugElement = document.createElement('div');
debugElement.id = 'debug-output';
debugElement.style.display = 'none';
document.body.appendChild(debugElement);

function logDebug(message) {
  if (debugElement) {
    debugElement.textContent += message + '\n';
  }
  console.log(message);
}

logDebug('Starting back-side script');
// Shared functions
// Function to format the expression with superscript for exponents
function formatExpressionWithSuperscript((expr)) {
}
    // Use regex to find patterns like "number ^ exponent" and replace with HTML superscript
    return expr.replace(/(\d+)\s*\^\s*(\d+)/g, function (match, base, exponent) {
        return base + '<sup>' + exponent + '</sup>';
    });
}

// Function to insert parentheses at valid positions in an expression

// Helper function to round decimal numbers to a given precision
function roundToPrecisionAndTrim(num, precision) {
    const rounded = num.toFixed(precision);
    return parseFloat(rounded);
}

// Function to convert a decimal to a mixed fraction string

// Function to convert a decimal to a mixed fraction string
function decimalToMixedFraction(decimal) {
    if (Number.isInteger(decimal)) {
}

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
}

        return sign + wholePart.toString();
    }

    // Check for common fractions first
    const tolerance = 0.0001;
    const commonFractions = [{
        decimal: 1 / 3,
        numerator: 1,
        denominator: 3
    }, {
        decimal: 2 / 3,
        numerator: 2,
        denominator: 3
    }, {
        decimal: 1 / 4,
        numerator: 1,
        denominator: 4
    }, {
        decimal: 3 / 4,
        numerator: 3,
        denominator: 4
    }, {
        decimal: 1 / 5,
        numerator: 1,
        denominator: 5
    }, {
        decimal: 2 / 5,
        numerator: 2,
        denominator: 5
    }, {
        decimal: 3 / 5,
        numerator: 3,
        denominator: 5
    }, {
        decimal: 4 / 5,
        numerator: 4,
        denominator: 5
    }, {
        decimal: 1 / 6,
        numerator: 1,
        denominator: 6
    }, {
        decimal: 5 / 6,
        numerator: 5,
        denominator: 6
    }, {
        decimal: 1 / 8,
        numerator: 1,
        denominator: 8
    }, {
        decimal: 3 / 8,
        numerator: 3,
        denominator: 8
    }, {
        decimal: 5 / 8,
        numerator: 5,
        denominator: 8
    }, {
        decimal: 7 / 8,
        numerator: 7,
        denominator: 8
    }];
    for (const fraction of commonFractions) {
        if (Math.abs(fractionalPart - fraction.decimal) < tolerance) {
}

            if (wholePart === 0) {
}

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
}

        return sign + numerator + "/" + denominator;
    } else {
        return sign + wholePart + " " + numerator + "/" + denominator;
    }
}

// Export shared functions


// Back-side specific code
function evaluateExpression((expression)) {
        try {
}
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
    }
        } catch (error) {
                return {
                        error: error.message,
                        success: false
    }
        }
}


// Check if we're on the back side
var answerElement = document.getElementById("answer");
if (answerElement) {
                // Get the unique ID so each card uses unique keys
}

                var uniquePart = "{{UniqueID}}".trim();
                var storageKeyExpression = "tempExpression_" + uniquePart;

                // Get the stored expression
                var expression = localStorage.getItem(storageKeyExpression);
                if (!expression) {
                        // Fallback if something went wrong
}

                        expression = "2 + 2";
}


                // Evaluate and display the expression
                const result = evaluateExpression(expression);

                if (result.success) {
}

                        answerElement.innerHTML =
                                result.formattedExpression + " = " + result.formattedResult;
                } else {
                        answerElement.textContent =
                                "Error evaluating expression: " + result.error;
                }
        }

logDebug('Back-side script completed');
} catch (error) {
  console.error('Error in back-side script:', error);
  if (document.getElementById('answer')) {
    document.getElementById('answer').innerHTML = 'Error: ' + error.message;
  }
  // Create debug element if it doesn't exist
  if (!document.getElementById('debug-output')) {
    var debugElement = document.createElement('div');
    debugElement.id = 'debug-output';
    document.body.appendChild(debugElement);
  }
  document.getElementById('debug-output').style.display = 'block';
  document.getElementById('debug-output').innerHTML = 'Error details: ' + error.stack;
}
})();
</script>