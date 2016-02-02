"use strict";
/**

This module implements Code parsing using Esprima ASTs

**/

const esprima = require("esprima");
const fs = require("fs");
const _ = require("lodash");

/**
This function returns the outermost function for a line number

file: file contents
line: line number

returns ast node or null if line number not in a function
**/
function getFuncForLine(fileContents, line) {
    var ast = esprima.parse(fileContents, {loc: true});
    var funcs = getAllFunctions(ast.body);
    for (let i = 0; i < funcs.length; i++) {
        let func = funcs[i];
        if (line >= func.loc.start.line && line <= func.loc.end.line)
            return func;
    }
    return null;
}

/**
This function returns all of the files outermost (or actually callable) functions

body: ast node for the body of the file

returns: [ast node]
**/
function getAllFunctions(body) {
    return _.filter(body, node => node.type === "FunctionDeclaration");
}

module.exports.getFuncForLine = getFuncForLine;
module.exports.getAllFunctions = getAllFunctions;