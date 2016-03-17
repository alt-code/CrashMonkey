const assert = require('assert');
const fs = require("fs");
const _ = require("lodash");
const TestCaseAnalyzer = require("../lib/TestCaseAnalyzer.js");

describe("Test Case Analyzer tests", function () {
    var file, fileContents;
    before(function () {
        file = "./tests/fixtures/test-case.js";
        fileContents = fs.readFileSync(file, {encoding: "utf8"});
    });

    it("should get rootVars for a test case file", function () {
        var testCase = TestCaseAnalyzer.analyzeTestCases(file, fileContents);
        assert.ok(testCase.rootVars);
        assert.ok(testCase.rootVars.$);
    });
});