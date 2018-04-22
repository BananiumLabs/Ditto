/*
Low level parsing and converting business
*/

var fs = require("fs")
var pathModule = require("path")
var webpack = require("webpack")

module.exports = function(ditto) {
    ditto.convert = {
        tokenize: function(data) {
            var tokens = []
            var current_token = ""
            var current_char = ""
            for (var i=0; i<data.length+1; i++) {
                current_char = data.substring(i, i+1)
                if (current_char != ' ') {
                    current_token = current_token + current_char
                    continue;
                }
                if (current_char === "\t") {
                    current_token = current_token + current_char
                    continue;
                }
                if (current_char === " " || current_char === "\n") {
                    tokens.push(current_token)
                    current_token = ""
                }
            }
            tokens.push(current_token)

            //gets rid of an "" that might exist in the tokens list
            while (tokens.indexOf("") !== -1) {
                tokens.splice(tokens.indexOf(""), 1)
            }
            return tokens
        },
        getJsPath: function(path) {
            //getting the js path for a given ditto file
            return pathModule.dirname(path) + "/" + pathModule.basename(path).substring(0, pathModule.basename(path).length-4) + ".js"
        },
        regexList: [
            { /*var def*/
                regex: /[A-z_]{1}\S{0,} is \S{1,}/g,
                command: function(path, line) {
                    var tokenized_line = ditto.convert.tokenize(line)
                    var line_to_write = "var " + tokenized_line[tokenized_line.length - 3] + " = " + tokenized_line[tokenized_line.length-1] + ";\n"
                    
                    //appending the content
                    fs.writeFileSync(ditto.convert.getJsPath(path), fs.readFileSync(ditto.convert.getJsPath(path), "utf8") + line_to_write)
                }
            },
            { /*function def*/
                regex: /[A-z_]{1}\S{0,} takes(.{1,}) then does:/g,
                command: function(path, line) {
                    var tokenized_line = ditto.convert.tokenize(line)
                    var line_to_write = "var " + tokenized_line[0] + " = function"
                    if (tokenized_line.length > 3) {
                        tokenized_line.shift()
                        tokenized_line.shift()
                        tokenized_line.pop()
                        tokenized_line.pop()
                        line_to_write = line_to_write + tokenized_line.join("") + " {\n"

                        //appending the content
                        fs.writeFileSync(ditto.convert.getJsPath(path), fs.readFileSync(ditto.convert.getJsPath(path), "utf8") + line_to_write)
                    }
                }
            },
            { /*function def 2*/
                regex: /[A-z_]{1}\S{0,} does:/g,
                command: function(path, line) {
                    var tokenized_line = ditto.convert.tokenize(line)
                    var line_to_write = "var " + tokenized_line[0] + " = function() {\n"
                    if (3 > tokenized_line.length) {
                        //appending the content
                        fs.writeFileSync(ditto.convert.getJsPath(path), fs.readFileSync(ditto.convert.getJsPath(path), "utf8") + line_to_write)
                    }
                }
            },
            { /*return*/
                regex: /return .{1,}/g,
                command: function(path, line) {
                    //appending the content
                    fs.writeFileSync(ditto.convert.getJsPath(path), fs.readFileSync(ditto.convert.getJsPath(path), "utf8") + line + ";\n")
                }
            },
            { /*write function (print)*/
                regex: /write (.*)/g,
                command: function(path, line) {
                    var tokenized_line = ditto.convert.tokenize(line)
                    tokenized_line.shift()
                    
                    var line_to_write = "console.log("
                    for (var i=0; i<tokenized_line.length; i++) {
                        line_to_write = line_to_write + tokenized_line[i]
                        if (i+1 != tokenized_line.length) {
                            line_to_write = line_to_write + " "
                        }
                    }
                    line_to_write = line_to_write + ");\n"

                    //appending the content
                    fs.writeFileSync(ditto.convert.getJsPath(path), fs.readFileSync(ditto.convert.getJsPath(path), "utf8") + line_to_write)
                }
            },
            { /*for expression*/
                regex: /for [A-z_]{1}.{0,} in \d+ through \d+ do:/g,
                command: function(path, line) {
                    var tokenized_line = ditto.convert.tokenize(line)
                    var line_to_write = "for (var " + tokenized_line[1] + " = " + tokenized_line[3] + "; " + tokenized_line[1] + "<" + tokenized_line[5] + ";" + tokenized_line[1] + "++) {\n"

                    //appending the content
                    fs.writeFileSync(ditto.convert.getJsPath(path), fs.readFileSync(ditto.convert.getJsPath(path), "utf8") + line_to_write)
                }
            },
            { /*call a function*/
                regex: /call \S.+\(.+\)/g,
                command: function(path, line) {
                    var tokenized_line = ditto.convert.tokenize(line)
                    var line_to_write = tokenized_line[1]

                    //appending the content
                    fs.writeFileSync(ditto.convert.getJsPath(path), fs.readFileSync(ditto.convert.getJsPath(path), "utf8") + line_to_write + ";\n")
                }
            },
            {/*if statement recognization*/
                regex: /if \S.{1,} do/g,
                command: function (path, line) {
                    var tokenized_line = ditto.convert.tokenize(line)
                    var line_to_write = tokenized_line[1]

                    fs.writeFileSync(ditto.convert.getJsPath(path), fs.readFileSync(ditto.convert.getJsPath(path), "utf8") + "if (" + line_to_write + ") {\n")

                }
            },
            {/*Else Do statement*/
                regex: /else do:/g,
                command: function (path, line) {
                    var tokenized_line = ditto.convert.tokenize(line)
                    var line_to_write = tokenized_line[1]

                    fs.writeFileSync(ditto.convert.getJsPath(path), fs.readFileSync(ditto.convert.getJsPath(path), "utf8") + "else {\n")

                }
            },
            { /*i use ~module*/
                regex: /I use ".{1,}" as .{1,}/g,
                command: function(path, line) {
                    var tokenized_line = ditto.convert.tokenize(line)

                    tokenized_line[2] = tokenized_line[2].slice(1, -1)

                    if (tokenized_line[2].endsWith(".js") || tokenized_line[2].endsWith(".dit")) {
                        var module_path_js = "./" + tokenized_line[2].slice(0, -4) + ".js"
                        var module_path_dit = "./" + tokenized_line[2].slice(0, -4) + ".dit"
                        var line_to_write = "var " + tokenized_line.pop() + " = require('" + module_path_js + "');\n"

                        ditto.convert.compile(module_path_dit)
                    } else {
                        var line_to_write = "var " + tokenized_line.pop() + " = require('" + tokenized_line[2].slice(1, -1) + "');\n"
                    }

                    //appending the content
                    fs.writeFileSync(ditto.convert.getJsPath(path), fs.readFileSync(ditto.convert.getJsPath(path), "utf8") + line_to_write)
                }
            },
            {/*Prompt for IO*/
                regex: /ask ".{0,}" for [A-z_]{0}\S.{0,}/g,
                command: function (path, line) {
                    var tokenized_line = ditto.convert.tokenize(line)
                    questionArray = tokenized_line.slice(1, tokenized_line.length - 2)
                    var variableName = tokenized_line[tokenized_line.length - 1]
                    var question = ""

                    //Parse for function by combining the array elements
                    for (i = 0; i < questionArray.length; i++) {
                        question = question + " " + questionArray[i]
                    }
                    console.log(variableName);
                    console.log(questionArray)
                    fs.writeFileSync(ditto.convert.getJsPath(path), fs.readFileSync(ditto.convert.getJsPath(path), "utf8") + "var " + variableName
                        + " = readline.question(" + question + ")\n")

                }
            }
        ],
        compile: function(path) {
            //this absolute joy writes an empty build file in the same directory that's js and the same base name as the .dit file
            fs.writeFileSync(ditto.convert.getJsPath(path), "")

            //getting the .dit file contents and splitting it into lines
            var data = fs.readFileSync(path, "utf8")

            //getting it's tab type before running anything else
            var tabtype
            if (data.indexOf("\t") !== -1) {
                tabtype = "\t"
            } else {
                tabtype = "\s\s\s\s"
            }

            var lines = data.split(/\n/)

            //fixes a mysterious regex bug
            var res = [], i=0;
            if (i < lines.length)
                res.push(lines[i++]);
            while (i < lines.length)
                res.push("", lines[i++]);
            lines = res

            var prev_indents = 0
            var current_indents = 0

            //running through each line and checking for regex, then using the proper regex

            //running through lines
            for (var i=0; i<lines.length; i++) {

                //running through regex objects per line
                for (var r=0; r<ditto.convert.regexList.length; r++) {
                    if (ditto.convert.regexList[r].regex.test(lines[i]) === true) {

                        //calculating whether or not a curly bracket is needed
                        prev_indents = current_indents
                        if (tabtype === "\s\s\s\s") {
                            current_indents = (lines[i].match(/    /g) || []).length
                        }
                        if (tabtype === "\t") {
                            current_indents = (lines[i].match(/\t/g) || []).length
                        }

                        if (prev_indents > current_indents) {
                            fs.writeFileSync(ditto.convert.getJsPath(path), fs.readFileSync(ditto.convert.getJsPath(path), "utf8") + "}\n")
                        }

                        //running the matched regex's command
                        ditto.convert.regexList[r].command(path, lines[i])
                    }
                }
            }

            //compiling all the js
            /*
            webpack({
                entry: ditto.convert.getJsPath(path),
                output: {
                    path: pathModule.resolve(pathModule.dirname(path)),
                    filename: "compiled.js"
                }
            }, (err, stats) => {
                //console.log(err)
                //console.log(stats)
            })*/
        }
    }
}

