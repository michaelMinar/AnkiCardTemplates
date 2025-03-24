<div id="uniqueid-wrapper" style="display:none;">{{UniqueID}}</div>
<div id="maxval" style="display:none;">{{Max}}</div>
<div id="maxval2" style="display:none;">{{Max2}}</div>
<div id="question"></div>

<script>
(function() {
    // Check if #answer exists to determine if we're on the back side
    var onBack = (document.getElementById("answer") !== null);

    // Get the unique ID so each card uses unique keys
    var uniquePart = "{{UniqueID}}".trim();
    var maxValStr = document.getElementById("maxval").textContent.trim();
    var maxValStr2 = document.getElementById("maxval2").textContent.trim();
    
    // Parse Max value for divisor; default to 99 if invalid
    var maxDivisor = parseInt(maxValStr, 10);
    if (isNaN(maxDivisor) || maxDivisor <= 0) {
        maxDivisor = 99;
    }
    
    // Parse Max2 value for dividend; default to 9999 if invalid
    var maxDividend = parseInt(maxValStr2, 10);
    if (isNaN(maxDividend) || maxDividend <= 0) {
        maxDividend = 9999;
    }

    // Make sure this is a real field and is not empty
    var storageKeyDivisor = "tempDivisor_" + uniquePart;
    var storageKeyDividend = "tempDividend_" + uniquePart;

    var divisor, dividend;
    if (!onBack) {
        // FRONT SIDE: Generate fresh random numbers and store them
        // Divisor: random number between 10 and 99
        divisor = 10 + Math.floor(Math.random() * (maxDivisor - 9));
        // Dividend: random number between 1000 and 9999
        dividend = 1000 + Math.floor(Math.random() * (maxDividend - 999));
        
        localStorage.setItem(storageKeyDivisor, divisor.toString());
        localStorage.setItem(storageKeyDividend, dividend.toString());
    } else {
        // BACK SIDE: Just read the existing numbers
        divisor = parseInt(localStorage.getItem(storageKeyDivisor), 10);
        dividend = parseInt(localStorage.getItem(storageKeyDividend), 10);
        if (isNaN(divisor) || isNaN(dividend)) {
            // Fallback if something went wrong
            divisor = 10;
            dividend = 1000;
        }
    }

    // Display the division problem
    document.getElementById("question").textContent = dividend + " ÷ " + divisor;
})();
</script>