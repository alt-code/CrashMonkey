const assert = require('assert');
const fs = require("fs");
const _ = require("lodash");
const TestCaseAnalyzer = require("../lib/TestCaseAnalyzer.js");

describe("Test Case Analyzer tests", function () {
    var file, fileContents, testCase;
    before(function () {
        file = "./tests/fixtures/test-case.js";
        fileContents = fs.readFileSync(file, {encoding: "utf8"});
        testCase = TestCaseAnalyzer.analyzeTestCases(file, fileContents);
    });

    it("should get rootVars for a test case file", function () {
        assert.ok(testCase.rootVars);
        assert.ok(testCase.rootVars.$);
        assert.ok(testCase.rootVars.expect === undefined);
        assert.ok(testCase.rootVars._ === undefined);
    });
    
    it.only("should return function calls for global variables", function () {
        var describeTests = testCase.tests.testcases[0];
        assert.equal("testcase", describeTests.testcases[0].type);
        assert.ok(describeTests.testcases[1].varUses.$);
        assert.equal(1, describeTests.testcases[1].varUses.$.functioncalls[0].arguments.length);
    });
});