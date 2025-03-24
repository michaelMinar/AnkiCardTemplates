{{FrontSide}}
<hr>
<div id="answer"></div>
<script>
(function() {
    // On the back side, #answer exists, so our front script knows it's on the back.
    var uniquePart = "{{UniqueID}}".trim();
    var storageKeyDivisor = "tempDivisor_" + uniquePart;
    var storageKeyDividend = "tempDividend_" + uniquePart;

    var divisor = parseInt(localStorage.getItem(storageKeyDivisor), 10);
    var dividend = parseInt(localStorage.getItem(storageKeyDividend), 10);

    if (isNaN(divisor) || isNaN(dividend)) {
        divisor = 10;
        dividend = 1000;
    }

    // Calculate quotient and remainder
    var quotient = Math.floor(dividend / divisor);
    var remainder = dividend % divisor;

    // Display the answer
    var answerElement = document.getElementById("answer");
    if (remainder === 0) {
        answerElement.textContent = "The answer is: " + quotient;
    } else {
        answerElement.textContent = "The answer is: " + quotient + " with remainder " + remainder;
    }

    // We do NOT remove items here, so if we return to the front in the same session,
    // the front will just overwrite them with fresh numbers.
})();
</script>