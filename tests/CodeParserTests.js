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