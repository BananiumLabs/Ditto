#!/usr/bin/env node

/*
CLI Script
*/

var program = require("commander")
var ditto = require("../lib/index.js")

program
    .version("1.0.0")
    .command("compile <filepath>")
    .description("Compiles into JS")
    .option("-j, --js", "Compile only to Javascript")
    .action(function (filepath, cmd) {
        ditto.compile(filepath)
        if (cmd.js !== true) {
            ditto.JsToBinary()
        }
    })

program.parse(process.argv)