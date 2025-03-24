{{FrontSide}}
<hr>
<div id="answer"></div>
<script>
(function() {
    // On the back side, #answer exists, so our front script knows it's on the back.
    var uniquePart = "{{UniqueID}}".trim();
    var storageKeyBase = "tempBase_" + uniquePart;
    var storageKeyExponent = "tempExponent_" + uniquePart;

    var base = parseInt(localStorage.getItem(storageKeyBase), 10);
    var exponent = parseInt(localStorage.getItem(storageKeyExponent), 10);

    if (isNaN(base) || isNaN(exponent)) {
        base = 0;
        exponent = 0;
    }

    // Create the product representation
    function createProductString(base, exponent) {
        if (exponent <= 0) return "1";
        if (exponent === 1) return base.toString();
        
        const factors = [];
        for (let i = 0; i < exponent; i++) {
            factors.push(base);
        }
        
        return factors.join(" × ");
    }

    document.getElementById("answer").innerHTML = base + "<sup>" + exponent + "</sup> = " + createProductString(base, exponent);

    // We do NOT remove items here, so if we return to the front in the same session,
    // the front will just overwrite them with fresh numbers.
})();
</script>