/*
Low level parsing and converting business
*/

var fs = require("fs")
var pathModule = require("path")

module.exports = function(ditto) {
    ditto.convert = {
        stripWhitespace: function(data) {
            var tokens = []
            var current_token = ""
            var current_char = ""
            for (var i=0; i<data.length+1; i++) {
                current_char = data.substring(i, i+1)
                if (current_char != " ") {
                    current_token = current_token + current_char
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
            {
                regex: /[A-z_]{1}\S{0,} is \S{1,}/g,
                command: function(path, line) {
                    var tokenized_line = ditto.convert.stripWhitespace(line)
                    var line_to_write = "var " + tokenized_line[0] + " = " + tokenized_line[2] + ";"
                    
                    //appending the content
                    fs.writeFileSync(ditto.convert.getJsPath(path), fs.readFileSync(ditto.convert.getJsPath(path), "utf8") + line_to_write)
                }
            },
            {
                regex: /[A-z_]{1}\S{0,} takes(.{1,}) does:/g,
                command: function(path, line) {
                    var tokenized_line = ditto.convert.stripWhitespace(line)
                    var line_to_write = "var " + tokenized_line[0] + " = function("
                    tokenized_line.shift()
                    tokenized_line.shift()
                    tokenized_line.pop()
                    line_to_write = line_to_write + tokenized_line.join("") + ") {"

                    //appending the content
                    fs.writeFileSync(ditto.convert.getJsPath(path), fs.readFileSync(ditto.convert.getJsPath(path), "utf8") + line_to_write)
                }
            }
        ],
        compile: function(path) {
            //this absolute joy writes an empty build file in the same directory that's js and the same base name as the .dit file
            fs.writeFileSync(ditto.convert.getJsPath(path), "")

            //getting the .dit file contents and splitting it into lines
            var data = fs.readFileSync(path, "utf8")
            var lines = data.split(/\n/)

            //running through each line and checking for regex, then using the proper regex
            for (var i=0; i<lines.length; i++) {
                for (var r=0; r<ditto.convert.regexList.length; r++) {
                    if (ditto.convert.regexList[r].regex.test(lines[i]) === true) {
                        ditto.convert.regexList[r].command(path, lines[i])
                    }
                }
            }
        }
    }
}

