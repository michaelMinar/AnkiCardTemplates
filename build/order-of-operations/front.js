<div id="uniqueid-wrapper" style="display:none;">{{UniqueID}}</div>
<div id="num_terms" style="display:none;">{{NumTerms}}</div>
<div id="include_exponents" style="display:none;">{{IncludeExponents}}</div>
<div id="question"></div>
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

logDebug('Starting front-side script');
// Shared functions
// Function to format the expression with superscript for exponents
function formatExpressionWithSuperscript(expr) {
  // Use regex to find patterns like "number ^ exponent" and replace with HTML superscript
  return expr.replace(/(\d+)\s*\^\s*(\d+)/g, function (match, base, exponent) {
    return base + '<sup>' + exponent + '</sup>';
  });
}

// Function to insert parentheses at valid positions in an expression

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

// Check if we're on the front side
var answerElement = document.getElementById("answer");
if (!answerElement) {
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

logDebug('Front-side script completed');
} catch (error) {
  console.error('Error in front-side script:', error);
  if (document.getElementById('question')) {
    document.getElementById('question').innerHTML = 'Error: ' + error.message;
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