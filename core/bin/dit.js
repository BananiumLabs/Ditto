#!/usr/bin/env node

/*
CLI Script
*/

var program = require("commander")
var ditto = require("../lib/index.js")

program
    .version("1.0.0")
    .command("compile <file>")
    .description("Compiles into JS")
    .action(function (file) {
        ditto.compile(file)
    })

program.parse(process.argv)