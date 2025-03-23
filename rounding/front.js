
<div id="uniqueid-wrapper" style="display:none;">{{UniqueID}}</div>
<div id="maxval" style="display:none;">{{Max}}</div>
<div id="minRound" style="display:none;">{{minRound}}</div>
<div id="question"></div>
<div id="question"></div>

<script>
(function() {
    // Check if #answer exists to determine if we're on the back side
    var onBack = (document.getElementById("answer") !== null);

    // Get the unique ID so each card uses unique keys
    var uniquePart = "{{UniqueID}}".trim();
    var maxValStr = document.getElementById("maxval").textContent.trim();
    var minRoundStr = document.getElementById("minRound").textContent.trim();
    // Parse Max value; default to 100 if invalid
    var maxVal = parseInt(maxValStr, 10);
    var minRound = parseInt(minRoundStr, 10);
    if (isNaN(maxVal) || maxVal <= 0) {
        maxVal = 3000;
    }
    if (isNaN(minRound) || minRound <= 0.001) {
        minRound = 0.001;
    }

    // Make sure this is a real field and is not empty
    var storageKeyNum1 = "tempNum1_" + uniquePart;
    var storageKeyNum2 = "tempNum2_" + uniquePart;

    var n1, n2;
    if (!onBack) {
        // FRONT SIDE: Generate fresh random numbers and store them
        n1 = Math.floor(Math.random() * 10000 * maxVal)/10000;
        rand = Math.random();
			 n2 = Math.pow(10, 3 - Math.ceil(rand * 6));

        localStorage.setItem(storageKeyNum1, n1.toFixed(20));
        localStorage.setItem(storageKeyNum2, n2.toFixed(20));
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

    document.getElementById("question").textContent = "What is " + n1 + " rounded to the nearest " + getPlaceValue(n2) + "?";

function getPlaceValue(decile) {
  switch(decile) {
    case 100: return "hundreds";
    case 10: return "tens";
    case 1: return "ones";
    case 0.1: return "tenths";
    case 0.01: return "hundredths";
    case 0.001: return "thousandths";
    default: return "invalid value";
  }
}

})();
</script>
