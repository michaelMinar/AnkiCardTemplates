{{FrontSide}}
<hr>
<div id="answer"></div>
<script>
(function() {
    // On the back side, #answer exists, so our front script knows it's on the back.
    var uniquePart = "{{UniqueID}}".trim();
    var storageKeyNum1 = "tempNum1_" + uniquePart;
    var storageKeyNum2 = "tempNum2_" + uniquePart;

    var n1 = parseFloat(localStorage.getItem(storageKeyNum1));
    var n2 = parseFloat(localStorage.getItem(storageKeyNum2));

    if (isNaN(n1) || isNaN(n2)) {
        n1 = 0;
        n2 = 0;
    }

    document.getElementById("answer").textContent = "The answer is: " + roundToPrecisionAndTrim(n1 * n2, 5);

    // We do NOT remove items here, so if we return to the front in the same session,
    // the front will just overwrite them with fresh numbers.

function roundToPrecisionAndTrim(num, precision) {
  const rounded = num.toFixed(precision);
  return parseFloat(rounded);
}
})();
</script>
