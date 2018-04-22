var readline = require('readline-sync');
console.log("Hello, World");
var myFunc = function() {
console.log("hey");
}
var thisFunc = function(x) {
console.log(x);
}
var a = "hello";
myFunc();
thisFunc(a);
var b = "four";
if (b==="three") {
console.log(3);
}
else {
console.log(4);
}
var sum = 0;
for (var i = 0; i<=10;i++) {
var sum = sum+i;
}
console.log(sum);
var nameVar = readline.question( "What's your name?\n")
console.log("Your name's "+nameVar);
