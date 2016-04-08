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
function getFuncsForLines(ast, lines, repo, path) {
    lines = lines.length ? lines : [lines];
    var funcs = getAllExportedFunctions(ast, repo, path);
    var allFuncs = [];
    
    //Flatten all prototype functions into the list of functions
    _.map(funcs, function(func) {
        allFuncs.push(func);
        if (func["func"].cmType === "constructor") {
            for (var pfunc in func["func"].proto) {
                if (!func["func"].proto.hasOwnProperty(pfunc))
                    continue;
                allFuncs.push({name: pfunc, func: func["func"].proto[pfunc]});
            }
        }
    });
    
    var funcResults = [];
    for (let i = 0; i < allFuncs.length; i++) {
        let func = allFuncs[i]["func"];
        for(var j = 0; j < lines.length; j++) {
            var line = lines[j];
            if (line >= func.loc.start.line && line <= func.loc.end.line) {
                funcResults.push(allFuncs[i]);
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

    var allFuncs = globalFuncs.concat(globalVarFuncs);
    var prototypeAssignments = esquery(ast, "Program > ExpressionStatement > AssignmentExpression [property.name=\"prototype\"]");
    _.each(allFuncs, function(func) {
        _.each(prototypeAssignments, function (pra) {
            if (func.id.name === pra.object.name) {
                var funcDef = pra.parent.parent.right;
                funcDef.id = pra.parent.property;
                funcDef.protoParent = func;
                func.cmType = "constructor";
                func.proto = func.proto || {};
                func.proto[pra.parent.property.name] = funcDef;
            }
        })
    });

    return allFuncs;
}

/**
This function returns all of the files outermost (or actually callable) functions

ast: ast root of the file

returns: [ast node]
**/
function getAllExportedFunctions(ast, repo, path) {
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
    
    if (results.length === 0 && repo && path) {
        return dynamicParse(repo, path);
    }

    return results;
}

/**

Dynamic parsing by executing the function and looking for the function definitions

**/
function dynamicParse(repo, file) {
    var module;
    try {
        //executing code here, it's all in God's hands now
        module = require("../" + repo + "/" + file);
    }
    catch (e) {
        console.log("There was a problem dynamic parsing " + file);
        return [];
    }
    var fileContents = fs.readFileSync(repo + "/" + file, {encoding: "utf8"});
    var ast = esprima.parse(fileContents, {range: true, loc: true});
    var funcs = [];
    if (typeof module === "function") {
        var func = getFuncDef(module.toString(), fileContents, ast);
        funcs.push({name: ".", func: func[0]});
        for (var f in module.prototype) {
            if (module.prototype.hasOwnProperty(f)) {
                break;
            }
        }
    }
    for (var obj in module) {
        if (!module.hasOwnProperty(obj))
            continue;
        if (typeof module[obj] === "function") {
            var func = getFuncDef(module[obj].toString(), fileContents, ast);
            if (func.length > 0)
                funcs.push({name: obj, func: func[0]});
        }
    }
    return funcs;
}

function getFuncDef(func, fileContents, ast) {
    func = func.replace(/function (\w+)?\([^)]*\) /, "");
    var pos = fileContents.indexOf(func);
    
    var start = pos, end = pos + func.length;
    
    //curr = esquery(ast, `*[range.0=${start}][range.1=${end}]`);
    var funcs = esquery(ast, `FunctionExpression[body.range.0=${start}][body.range.1=${end}]`);
    if (funcs.length > 0)
        return funcs;
    
    funcs = esquery(ast, `FunctionDeclaration[body.range.0=${start}][body.range.1=${end}]`);
    return funcs;
}

/**

Returns the member access from the member expression ast

**/
function getMemberExpression(memberexp) {
    var members = [];
    var curr = memberexp;
    
    while (curr.type === "MemberExpression") {
        members.unshift(curr.property.name);
        curr = curr.object;
    }
    
    return members;
}

/**

This function traverses a code block ast and gets variable uses in it

**/
function getVariableUses(ast, vars) {
    var results = {};
    for (var i = 0; i < vars.length; i++) {
        var varName = vars[i];

        var directCalls = esquery(ast, `CallExpression[callee.name="${varName}"]`);

        var memberCalls = esquery(ast, "CallExpression");
        memberCalls = _.filter(memberCalls, function (call) {
            var calls = esquery(call.callee, `MemberExpression[object.name="${varName}"]`);
            if (calls.length > 0)
                return true;
            return false;
        });
        _.each(memberCalls, function (call) {
            call.property = getMemberExpression(call.callee);
        });

        var functionCalls = [];

        for (var j = 0; j < directCalls.length; j++) {
            functionCalls.push({arguments: directCalls[j].arguments, property: []});
        }
        
        for (var j = 0; j < memberCalls.length; j++) {
            functionCalls.push({arguments: memberCalls[j].arguments, property: memberCalls[j].property});
        }
        
        results[varName] = {};
        results[varName].functioncalls = functionCalls;
    }
    return results;
}

/**

This function parses a code text for global requires

**/
function getGlobalReqs(fileContents) {
    var reqRegx = /(\S+)\s*=\s*require\(['"][^.].*['"]\)/g;
    var curr, reqs = [];
    
    while ((curr = reqRegx.exec(fileContents)) !== null) {
        reqs.push(curr[1]);
    }
    
    return reqs; 
}

module.exports.getFuncsForLines = getFuncsForLines;
module.exports.getAllExportedFunctions = getAllExportedFunctions;
module.exports.dynamicParse = dynamicParse;
module.exports.getVariableUses = getVariableUses;
module.exports.getGlobalReqs = getGlobalReqs;