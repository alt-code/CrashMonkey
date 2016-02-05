const assert = require('assert');
const CodeParser = require("../lib/CodeParser.js");
const esprima = require("esprima");
const fs = require("fs");
const _ = require("lodash");

describe('Get Exported Functions', function() {
    it('should should find all exported functions', function () {
        var fileContents = fs.readFileSync("./tests/fixtures/module-exports.js", {encoding: "utf8"});
        var funcs = CodeParser.getAllExportedFunctions(esprima.parse(fileContents));
        assert.equal(3, funcs.length);
        assert.ok(_.some(funcs, func => func.name === "."));
        assert.ok(_.some(funcs, func => func.name === "abc"));
    });

    it('should return function params', function () {
        var fileContents = fs.readFileSync("./tests/fixtures/module-exports.js", {encoding: "utf8"});
        var funcs = CodeParser.getAllExportedFunctions(esprima.parse(fileContents));
        funcs = _.map(funcs, func => func["func"]);
        assert.equal(1, funcs[0].params.length);
        assert.equal(2, funcs[2].params.length);
        assert.equal("mno", funcs[2].params[1].name);
    });
});

describe('Get function for line number', function() {
    it('should return outermost function for normal global functions', function () {
        var fileContents = fs.readFileSync("./tests/fixtures/module-exports.js", {encoding: "utf8"});
        var funcsFound = CodeParser.getFuncsForLines(fileContents, 1);
        assert.equal("abc", funcsFound[0].func.id.name);
    });
    
    it('should return function for anonymous exported function', function () {
        var fileContents = fs.readFileSync("./tests/fixtures/module-exports.js", {encoding: "utf8"});
        var funcsFound = CodeParser.getFuncsForLines(fileContents, 7);
        assert.equal("foo", funcsFound[0].name);
    });
    
    it('should return null if line number not within any function', function () {
        var fileContents = fs.readFileSync("./tests/fixtures/module-exports.js", {encoding: "utf8"});
        var funcsFound = CodeParser.getFuncsForLines(fileContents, 5);
        assert.equal(0, funcsFound.length);
    });
    
    it('should return list of functions for list of line numbers', function() {
        var fileContents = fs.readFileSync("./tests/fixtures/module-exports.js", {encoding: "utf8"});
        var funcsFound = CodeParser.getFuncsForLines(fileContents, [1]);
        assert.equal(2, funcsFound.length);
        funcsFound = CodeParser.getFuncsForLines(fileContents, [1, 5, 7]);
        assert.equal(3, funcsFound.length);
    });
});