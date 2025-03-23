<div id="uniqueid-wrapper" style="display:none;">{{UniqueID}}</div>
<div id="maxval" style="display:none;">{{Max}}</div>
<div id="maxval2" style="display:none;">{{Max2}}</div>
<div id="question"></div>
<div id="question"></div>

<script>
(function() {
    // Check if #answer exists to determine if we're on the back side
    var onBack = (document.getElementById("answer") !== null);

    // Get the unique ID so each card uses unique keys
    var uniquePart = "{{UniqueID}}".trim();
    var maxValStr = document.getElementById("maxval").textContent.trim();
    var maxValStr2 = document.getElementById("maxval2").textContent.trim();
    // Parse Max value; default to 30 if invalid
    var maxVal = parseInt(maxValStr, 10);
    if (isNaN(maxVal) || maxVal <= 0) {
        maxVal = 30;
    }
    // Parse Max2 value; default to 30 if invalid
    var maxVal2 = parseInt(maxValStr2, 10);
    if (isNaN(maxVal2) || maxVal2 <= 0) {
        maxVal2 = 30;
    }

    // Make sure this is a real field and is not empty
    var storageKeyNum1 = "tempNum1_" + uniquePart;
    var storageKeyNum2 = "tempNum2_" + uniquePart;

    var n1, n2;
    if (!onBack) {
        // FRONT SIDE: Generate fresh random numbers and store them
			 precision1 = Math.pow(10, 3 - Math.ceil(Math.random() * 3));
			 precision2 = Math.pow(10, 3 - Math.ceil(Math.random() * 2));
        n1 = 1 + Math.floor(Math.random() * maxVal * precision1) / precision1;
        n2 = 1 + Math.floor(Math.random() * maxVal2 * precision2) / precision2;
        localStorage.setItem(storageKeyNum1, n1.toString());
        localStorage.setItem(storageKeyNum2, n2.toString());
    } else {
        // BACK SIDE: Just read the existing numbers
        n1 = parseFloat(localStorage.getItem(storageKeyNum1));
        n2 = parseFloat(localStorage.getItem(storageKeyNum2));
        if (isNaN(n1) || isNaN(n2)) {
            // Fallback if something went wrong
            n1 = 0;
            n2 = 0;
        }
    }

    document.getElementById("question").textContent = "What is " + n1 + " x " + n2 + "?";
})();
</script>
