const assert = require('assert');
const fs = require("fs");
const _ = require("lodash");
const Orchestrator = require("../lib/Orchestrator.js");
const TCW = require("../lib/TestCaseWizard.js");
const MochaFormatter = require("../lib/formatters/mocha-formatter.js");

describe('Mocha formatter tests', function() {
    var testCaseFiles;
    before(function() {
        var funcs = Orchestrator.getFuncsChanged(".", "HEAD", "2917ee", "568ada");
        testCaseFiles = TCW.generateTestCases(funcs);
    });

    it('should return test cases for files', function() {
        var tempName = testCaseFiles[0].name;
        
        var fileContent = MochaFormatter.formatFile(testCaseFiles[0], "..");
        assert.equal("var CodeParser = require(\"../lib/CodeParser.js\")\n", fileContent);
        testCaseFiles[0].name = "lib/code-parser.js";
        fileContent = MochaFormatter.formatFile(testCaseFiles[0], "..");
        assert.equal("var codeparser = require(\"../lib/code-parser.js\")\n", fileContent);
        testCaseFiles[0].name = "lib/code_parser.js";
        fileContent = MochaFormatter.formatFile(testCaseFiles[0], "..");
        assert.equal("var code_parser = require(\"../lib/code_parser.js\")\n", fileContent);
        
        testCaseFiles[0].name = tempName;
    });
});