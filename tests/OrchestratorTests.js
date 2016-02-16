const assert = require('assert');
const fs = require("fs");
const _ = require("lodash");
const Orchestrator = require("../lib/Orchestrator.js");

describe('Orchestrator funcs changed tests', function() {
    it('should return functions for changes', function () {
        var files = Orchestrator.getFuncsChanged(".", "HEAD", "2917ee", "568ada");
        assert.equal(2, files.length);
        assert.equal(1, files[0].funcs.length);
        assert.equal("getFuncForLine", files[0].funcs[0].name);
    });

    it('should return functions for signature changes', function () {
        var files = Orchestrator.getFuncsChanged(".", "HEAD", "24c1e5", "a188fe");
        assert.equal(3, files.length);
        assert.equal(1, files[0].funcs.length);
        assert.equal("getAllExportedFunctions", files[0].funcs[0].name);
    });

    it('should return functions for added files', function () {
        var files = Orchestrator.getFuncsChanged(".", "HEAD", "34fc4f", "53630f");
        assert.equal(1, files.length);
        assert.equal(1, files[0].funcs.length);
        assert.equal("getChanges", files[0].funcs[0].name);
    });

    it.skip('should not return functions for deleted files', function () {
        var files = Orchestrator.getFuncsChanged(".", "HEAD", "24c1e5", "a188fe");
        assert.equal(1, files.length);
    });

    it('should return functions for changes in a constructor prototype function', function() {
        var files = Orchestrator.getFuncsChanged(".", "HEAD", "90be01", "b175b2");
        assert.equal(3, files.length);
        assert.equal(3, files[2].funcs.length);
        assert.ok(_.some(files[2].funcs, func => func.name === "anotherFunc"));
    });
});

describe('Orchestrator generate test case files tests', function () {
    it.only('should create test cases for simple change commit', function() {
        Orchestrator.generateTestCases(".", "HEAD", "24c1e5", "a188fe");
        assert.ok(fs.existsSync("./cmTests/CodeParser.js"));
    });
});