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
  function formatExpressionWithSuperscript(expr) {
    // Use regex to find patterns like "number ^ exponent" and replace with HTML superscript
    return expr.replace(/(\d+)\s*\^\s*(\d+)/g, function (match, base, exponent) {
      return base + '<sup>' + exponent + '</sup>';
    });
  }

  // Helper function to round decimal numbers to a given precision
  function roundToPrecisionAndTrim(num, precision) {
    const rounded = num.toFixed(precision);
    return parseFloat(rounded);
  }

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
      
      // Display the result, handling both integer and floating-point results
      const formattedResult = Number.isInteger(result) ? result : roundToPrecisionAndTrim(result, 5);
      
      return {
        formattedExpression,
        formattedResult,
        success: true
      };
    } catch (error) {
      logDebug('Error evaluating expression: ' + error.message);
      return {
        error: error.message,
        success: false
      };
    }
  }

  // Check if we're on the back side
  var answerElement = document.getElementById("answer");
  if (answerElement) {
    // Get the unique ID so each card uses unique keys
    var uniquePart = "{{UniqueID}}".trim();
    var storageKeyExpression = "tempExpression_" + uniquePart;
    
    // Get the stored expression
    var expression = localStorage.getItem(storageKeyExpression);
    logDebug('Retrieved expression: ' + expression);
    
    if (!expression) {
      // Fallback if something went wrong
      logDebug('Expression not found in localStorage, using fallback');
      expression = "2 + 2";
    }
    
    // Evaluate and display the expression
    const result = evaluateExpression(expression);
    
    if (result.success) {
      answerElement.innerHTML = result.formattedExpression + " = " + result.formattedResult;
      logDebug('Successfully evaluated expression');
    } else {
      answerElement.textContent = "Error evaluating expression: " + result.error;
      logDebug('Failed to evaluate expression');
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