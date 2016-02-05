"use strict";
/**

This module implements Code parsing using Esprima ASTs

**/

const esprima = require("esprima");
const esquery = require("esquery");
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
function getAllExportedFunctions(ast) {
    var body = ast.body;
    var globalFuncs = esquery(ast, "Program > [type=\"FunctionDeclaration\"]");
    
    var assignments = esquery(ast, "Program > ExpressionStatement > AssignmentExpression");
    var exportsAssigns = _.filter(assignments, (ase) => {
        var results = esquery(ase, "[object.name=\"module\"][property.name=\"exports\"]");
        return results.length > 0;
    });
    
    var results = [];
    
    _.each(exportsAssigns, (ea) => {
        var func;
        if(!ea.right)
            return;
        
        //Function declaration
        if (ea.right.type === "FunctionExpression")
            func = ea.right;
        //identifier which is a function
        if (ea.right.type === "Identifier" && _.find(globalFuncs, func => func.id.name === ea.right.name)) 
            func = _.find(globalFuncs, func => func.id.name === ea.right.name);
        
        if (func){
            var name = "";
            //Direct assignment to exports
            if (ea.left.object.name === "module")
                name = ".";
            else
                name = ea.left.property.name;
            results.push({name: name, func: func});
        }
    });
    
    return results;
}

module.exports.getFuncForLine = getFuncForLine;
module.exports.getAllExportedFunctions = getAllExportedFunctions;