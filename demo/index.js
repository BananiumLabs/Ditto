counter = 2;
var myFunc = function() {
counter = counter*counter;
document.getElementById("display").innerHTML = counter;
}
document.getElementById("button").addEventListener("click", myFunc);
