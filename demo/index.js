counter = 0;
var myFunc = function() {
counter = counter+1;
document.getElementById("display").innerHTML = counter;
}
document.getElementById("button").addEventListener("click", myFunc);
