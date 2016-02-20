const assert = require('assert');
const fs = require("fs");
const _ = require("lodash");
const Orchestrator = require("../lib/Orchestrator.js");
const TCW = require("../lib/TestCaseWizard.js");
const MochaFormatter = require("../lib/formatters/mocha-formatter.js");

var testStrings = fs.readFileSync("./tests/fixtures/mocha-test-strings.js", {encoding: "utf8"}).split(/\r?\n/);

function getTestString(from, to) {
    var testStr = testStrings.slice(from-1, to).join("\n");
    testStr += "\n";
    return testStr;
}

describe('Mocha formatter tests', function() {
    var testCaseFiles;
    before(function() {
        var funcs = Orchestrator.getFuncsChanged(".", "HEAD", "2917ee", "568ada");
        testCaseFiles = TCW.generateTestCases(funcs);
    });

    it('should return test cases for files', function() {
        var tempName = testCaseFiles[0].name;

        var fileContent = MochaFormatter.formatFile(testCaseFiles[0], "..");
        assert.equal(getTestString(1,1), fileContent);
        testCaseFiles[0].name = "lib/code-parser.js";
        fileContent = MochaFormatter.formatFile(testCaseFiles[0], "..");
        assert.equal(getTestString(2,2), fileContent);
        testCaseFiles[0].name = "lib/code_parser.js";
        fileContent = MochaFormatter.formatFile(testCaseFiles[0], "..");
        assert.equal(getTestString(3,3), fileContent);

        testCaseFiles[0].name = tempName;
    });

    it('should return test cases', function() {
        var testCase = MochaFormatter.formatTestCase(testCaseFiles[0].testCases[0]);
        assert.equal(getTestString(5,7), testCase);
        testCase = MochaFormatter.formatTestCase(testCaseFiles[0].testCases[1]);
        assert.equal(getTestString(9,11), testCase);
    });

    it('should return all test cases for all files', function() {
        var fileContents = MochaFormatter.formatTestSuite(testCaseFiles);
        assert.equal(getTestString(13,61), fileContents[0].testFileContent);
    });

    it('should not return content for no test cases for a file', function() {
        var fileContents = MochaFormatter.formatTestSuite(testCaseFiles);
        assert.equal(undefined, fileContents[1].testFileContent);
    });
});

describe('Test case type tests', function () {
    it('should output a test case for exported function type', function () {
        var funcs = Orchestrator.getFuncsChanged(".", "HEAD", "2917ee", "568ada");
        var testCases = TCW.generateTestCases(funcs);
        var testCase = MochaFormatter.formatTestCase(testCases[0].testCases[0]);
        assert.equal(getTestString(5,7), testCase);
    });
    
    it('should output a test case for root function type', function () {
        var funcs = Orchestrator.getFuncsChanged(".", "HEAD", "b2b400", "2917ee");
        var testCases= TCW.generateTestCases(funcs);
        var testCase = MochaFormatter.formatTestCase(testCases[1].testCases[0]);
        assert.equal(getTestString(63,65), testCase);
    });
    
    it('should output a test case for constructor function type', function () {
        var funcs = Orchestrator.getFuncsChanged(".", "HEAD", "90be01", "b175b2");
        var testCases= TCW.generateTestCases(funcs);
        var testCase = MochaFormatter.formatTestCase(testCases[2].testCases[1]);
        assert.equal(getTestString(67,70), testCase);
    });
});