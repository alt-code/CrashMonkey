const assert = require('assert');
const CodeParser = require("../lib/CodeParser.js");
const esprima = require("esprima");
const esquery = require("esquery");
const esprimaWalk = require("esprima-walk");
const fs = require("fs");
const _ = require("lodash");

describe('Get Exported Functions', function() {
    var ast;
    before(function() {
        var fileContents = fs.readFileSync("./tests/fixtures/module-exports.js", {encoding: "utf8"});
        ast = esprima.parse(fileContents);
        esprimaWalk.walkAddParent(ast, function() {});
    });
    
    it('should should find all exported functions', function () {
        var funcs = CodeParser.getAllExportedFunctions(ast);
        assert.equal(5, funcs.length);
        assert.ok(_.some(funcs, func => func.name === "."));
        assert.ok(_.some(funcs, func => func.name === "abc"));
    });

    it('should return function params', function () {
        var funcs = CodeParser.getAllExportedFunctions(ast);
        funcs = _.map(funcs, func => func["func"]);
        assert.equal(1, funcs[0].params.length);
        assert.equal(2, funcs[2].params.length);
        assert.equal("mno", funcs[2].params[1].name);
    });
    
    it('should return functions for export variants', function() {
        var funcs = CodeParser.getAllExportedFunctions(ast);
        assert.ok(_.some(funcs, func => func.name === "someFunc"));
    });
    
    it('should return the exported functions (prototype) for a constructor function', function() {
        var funcsFound = CodeParser.getAllExportedFunctions(ast);
        var constrFunc = _.filter(funcsFound, func => func.name === ".")[1].func;
        assert.ok(constrFunc);
        assert.equal("constructor", constrFunc.cmType);
        assert.ok(constrFunc.proto.someFunc);
    });
});

describe('Get function for line number', function() {
    var ast;
    before(function() {
        var fileContents = fs.readFileSync("./tests/fixtures/module-exports.js", {encoding: "utf8"});
        ast = esprima.parse(fileContents, {loc: true});
        esprimaWalk.walkAddParent(ast, function() {});
    });
    
    it('should return outermost function for normal global functions', function () {
        var funcsFound = CodeParser.getFuncsForLines(ast, 1);
        assert.equal("abc", funcsFound[0].func.id.name);
    });
    
    it('should return function for anonymous exported function', function () {
        var funcsFound = CodeParser.getFuncsForLines(ast, 7);
        assert.equal("foo", funcsFound[0].name);
    });
    
    it('should return null if line number not within any function', function () {
        var funcsFound = CodeParser.getFuncsForLines(ast, 5);
        assert.equal(0, funcsFound.length);
    });
    
    it('should return list of functions for list of line numbers', function() {
        var funcsFound = CodeParser.getFuncsForLines(ast, [1]);
        assert.equal(2, funcsFound.length);
        funcsFound = CodeParser.getFuncsForLines(ast, [1, 5, 7]);
        assert.equal(3, funcsFound.length);
    });
});

describe('Get variable uses in block tests', function(){
    var ast;
    before(function() {
        var fileContents = fs.readFileSync("./tests/fixtures/test-case.js", {encoding: "utf8"});
        ast = esprima.parse(fileContents, {loc: true});
        esprimaWalk.walkAddParent(ast, function() {});
    });

    it('should return function call on a global var', function() {
        var testcases = esquery(ast, "CallExpression [callee.name=\"it\"]");
        var tc1 = testcases[3].arguments[1].body;
        var uses = CodeParser.getVariableUses(tc1, ["$"]);
        assert.equal(1, uses.$.functioncalls.length);
        assert.equal(0, uses.$.functioncalls[0].property.length);
        assert.equal("Literal", uses.$.functioncalls[0].arguments[0].type);
    });
    
    it('should return function call on a property of a global var', function() {
        var testcases = esquery(ast, "CallExpression [callee.name=\"it\"]");
        var tc1 = testcases[5].arguments[1].body;
        var uses = CodeParser.getVariableUses(tc1, ["$"]);
        assert.equal(1, uses.$.functioncalls.length);
        assert.equal("load", uses.$.functioncalls[0].property[0]);
        assert.equal("Literal", uses.$.functioncalls[0].arguments[0].type);
    });
});