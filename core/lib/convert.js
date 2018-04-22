/*
Low level parsing and converting business
*/

var fs = require("fs");
var pathModule = require("path");

module.exports = function(ditto) {
    ditto.convert = {
        stripWhitespace: function(data) {
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
                    var tokenized_line = ditto.convert.stripWhitespace(line)
                    var line_to_write = "var " + tokenized_line[0] + " = " + tokenized_line[2] + ";\n"
                    
                    //appending the content
                    fs.writeFileSync(ditto.convert.getJsPath(path), fs.readFileSync(ditto.convert.getJsPath(path), "utf8") + line_to_write)
                }
            },
            { /*function def*/
                regex: /[A-z_]{1}\S{0,} takes(.{1,}) then does:/g,
                command: function(path, line) {
                    var tokenized_line = ditto.convert.stripWhitespace(line)
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
                    var tokenized_line = ditto.convert.stripWhitespace(line)
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
        }
    }
}

