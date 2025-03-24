<div id="uniqueid-wrapper" style="display:none;">{{UniqueID}}</div>
<div id="maxbase" style="display:none;">{{MaxBase}}</div>
<div id="maxexponent" style="display:none;">{{MaxExponent}}</div>
<div id="question"></div>

<script>
(function() {
    // Check if #answer exists to determine if we're on the back side
    var onBack = (document.getElementById("answer") !== null);

    // Get the unique ID so each card uses unique keys
    var uniquePart = "{{UniqueID}}".trim();
    var maxBaseStr = document.getElementById("maxbase").textContent.trim();
    var maxExponentStr = document.getElementById("maxexponent").textContent.trim();
    
    // Parse MaxBase value; default to 9 if invalid
    var maxBase = parseInt(maxBaseStr, 10);
    if (isNaN(maxBase) || maxBase <= 0) {
        maxBase = 9;
    }
    
    // Parse MaxExponent value; default to 6 if invalid
    var maxExponent = parseInt(maxExponentStr, 10);
    if (isNaN(maxExponent) || maxExponent <= 0) {
        maxExponent = 6;
    }

    // Make sure this is a real field and is not empty
    var storageKeyBase = "tempBase_" + uniquePart;
    var storageKeyExponent = "tempExponent_" + uniquePart;

    var base, exponent;
    if (!onBack) {
        // FRONT SIDE: Generate fresh random numbers and store them
        // Generate random base between 1 and maxBase (inclusive)
        base = 1 + Math.floor(Math.random() * maxBase);
        
        // Generate random exponent between 1 and maxExponent (inclusive)
        exponent = 1 + Math.floor(Math.random() * maxExponent);
        
        localStorage.setItem(storageKeyBase, base.toString());
        localStorage.setItem(storageKeyExponent, exponent.toString());
    } else {
        // BACK SIDE: Just read the existing numbers
        base = parseInt(localStorage.getItem(storageKeyBase), 10);
        exponent = parseInt(localStorage.getItem(storageKeyExponent), 10);
        if (isNaN(base) || isNaN(exponent)) {
            // Fallback if something went wrong
            base = 0;
            exponent = 0;
        }
    }

    document.getElementById("question").innerHTML = "What is " + base + "<sup>" + exponent + "</sup> as a product of factors?";
})();
</script>