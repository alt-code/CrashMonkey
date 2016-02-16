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
function getFuncsForLines(ast, lines) {
    lines = lines.length ? lines : [lines];
    var funcs = getAllExportedFunctions(ast);
    var funcResults = [];
    for (let i = 0; i < funcs.length; i++) {
        let func = funcs[i]["func"];
        for(var j = 0; j < lines.length; j++) {
            var line = lines[j];
            if (line >= func.loc.start.line && line <= func.loc.end.line) {
                funcResults.push(funcs[i]);
                break;
            }
        }
    }
    return funcResults;
}

function getGlobalFunctions(ast) {
    //function x() {}
    var globalFuncs = esquery(ast, "Program > FunctionDeclaration");
    
    //var someVar = function(){}
    var globalVarFuncs = esquery(ast, "Program > VariableDeclaration");
    globalVarFuncs = _.filter(globalVarFuncs, function(varFunc) {
        var initType;
        try { initType = varFunc.declarations[0].init.type; }
        catch (e){}
        return initType === "FunctionExpression";
    });
    globalVarFuncs = _.map(globalVarFuncs, function(declaration) {
        declaration.declarations[0].init.id = declaration.declarations[0].id;
        return declaration.declarations[0].init;
    });
    
    return globalFuncs.concat(globalVarFuncs);
}

/**
This function returns all of the files outermost (or actually callable) functions

ast: ast root of the file

returns: [ast node]
**/
function getAllExportedFunctions(ast) {
    var globalFuncs = getGlobalFunctions(ast);

    var assignments = esquery(ast, "Program > ExpressionStatement > AssignmentExpression");
    var exportsAssigns = _.filter(assignments, (ase) => {
        var resultsME = esquery(ase, "[object.name=\"module\"][property.name=\"exports\"]");
        var resultsE = esquery(ase, "[object.name=\"exports\"]");
        return resultsME.length > 0 || resultsE.length > 0;
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

module.exports.getFuncsForLines = getFuncsForLines;
module.exports.getAllExportedFunctions = getAllExportedFunctions;