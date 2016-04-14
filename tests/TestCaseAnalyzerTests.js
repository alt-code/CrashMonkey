const assert = require('assert');
const fs = require("fs");
const _ = require("lodash");
const child_process = require("child_process");
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
    
    it("should return function calls for global variables", function () {
        var describeTests = testCase.tests.testcases[0];
        assert.equal("testcase", describeTests.testcases[0].type);
        assert.ok(describeTests.testcases[1].varUses.$);
        assert.equal(1, describeTests.testcases[1].varUses.$.functioncalls[0].arguments.length);
    });
    
    it("should infer param types for function calls", function () {
        var describeTests = testCase.tests.testcases[0];
        assert.equal("null", describeTests.testcases[1].varUses.$.functioncalls[0].arguments[0].inferredType);
        assert.equal("undefined", describeTests.testcases[2].varUses.$.functioncalls[0].arguments[0].inferredType);
        assert.equal("string", describeTests.testcases[3].varUses.$.functioncalls[0].arguments[0].inferredType);
        assert.equal("string", describeTests.testcases[4].varUses.$.functioncalls[0].arguments[0].inferredType);
        assert.equal("string", describeTests.testcases[4].varUses.$.functioncalls[1].arguments[0].inferredType);
    });
});

describe("node-dateformat tests", function () {
    var testCase;
    before(function () {
        if (!fs.existsSync("./repos/node-dateformat"))
            child_process.execSync("git clone https://github.com/felixge/node-dateformat.git", {cwd: "./repos"});
        child_process.execSync("git reset 17364d --hard", {cwd: "./repos/node-dateformat"});
        
        var file = "./repos/node-dateformat/test/test_formats.js";
        var fileContents = fs.readFileSync(file, {encoding: "utf8"});
        testCase = TestCaseAnalyzer.analyzeTestCases(file, fileContents);
    });
    
    it.skip("should get inner test cases (like in a loop)", function () {
        assert.equal(2, testCase.tests.testcases[0].testcases.length);
    });
    
    it("should analyze node-dateformat tests", function () {
        assert.equal(1, testCase.tests.testcases[0].testcases[0].varUses.dateFormat.functioncalls[0].arguments.length);
        assert.equal("date", testCase.tests.testcases[0].testcases[0].varUses.dateFormat.functioncalls[0].arguments[0].inferredType);
    });
});