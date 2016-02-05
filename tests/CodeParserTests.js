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
});