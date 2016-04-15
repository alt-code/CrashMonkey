const assert = require('assert');
const fs = require("fs");
const _ = require("lodash");
const child_process = require("child_process");
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
    
    it('should return functions for changes in a anonymous function', function() {
        var files = Orchestrator.getFuncsChanged(".", "HEAD", "1510a1", "65c533");
        assert.equal(3, files.length);
        assert.equal(2, files[2].funcs.length);
        assert.ok(_.some(files[2].funcs, func => func.name === "foo"));
        assert.equal(2, files[2].funcs[0].func.params.length);
    });
});

describe('Orchestrator generate test case files tests', function () {
    var TEST_DIR = "./cmTests";
    beforeEach(function() {
        if (fs.existsSync(TEST_DIR)) {
            var dir = fs.readdirSync("./cmTests");
            for (var i = 0; i < dir.length; i++)
                fs.unlinkSync(`${TEST_DIR}/${dir[i]}`);
        }
    });

    it('should create test cases for simple change commit', function(done) {
        var opts = {commit: {branch: "HEAD", commitOld: "24c1e5", commitNew: "a188fe"}};
        Orchestrator.generateTestCases(".", opts).then(function() {
            assert.ok(fs.existsSync(TEST_DIR + "/CodeParser.js"));
            done();
        });
    });
    
    it('should create test cases for simple change commit 2', function (done) {
        var opts = {commit: {branch: "HEAD", commitOld: "b2b400", commitNew: "2917ee"}};
        Orchestrator.generateTestCases(".", opts).then(function() {
            assert.ok(fs.existsSync(TEST_DIR + "/module-exports.js"));
            done();
        });
    })

    it('should create test cases for constructor prototype function change commit', function (done) {
        var opts = {commit: {branch: "HEAD", commitOld: "90be01", commitNew: "b175b2"}};
        Orchestrator.generateTestCases(".", opts).then(function() {
            assert.ok(fs.existsSync(TEST_DIR + "/module-exports.js"));
            done();
        });
    });
    
    it('should generate test cases for types', function (done) {
        var opts = {commit: {branch: "HEAD", commitOld: "b175b2", commitNew: "aa49d1"}};
        Orchestrator.generateTestCases(".", opts).then(function() {
            assert.ok(fs.existsSync(TEST_DIR + "/Orchestrator.js"));
            done();
        });
    });
});

describe('node-dateformat tests', function () {
    var files;
    before (function () {
        if (!fs.existsSync("./repos/node-dateformat"))
            child_process.execSync("git clone https://github.com/felixge/node-dateformat.git", {cwd: "./repos"});
        child_process.execSync("git reset efa4fe --hard", {cwd: "./repos/node-dateformat"});
        
        files = Orchestrator.getFuncsChanged("./repos/node-dateformat");
    });
    
    it ('should be able to get functions that changed', function () {
        assert.equal(2, files.length);
        assert.equal(1, files[1].funcs.length);
        assert.equal(".", files[1].funcs[0].name);  
    })
});

describe('node-dateformat all tests', function () {
    before (function () {
        if (!fs.existsSync("./repos/node-dateformat"))
            child_process.execSync("git clone https://github.com/felixge/node-dateformat.git", {cwd: "./repos"});
        child_process.execSync("git reset 17364d --hard", {cwd: "./repos/node-dateformat"});
    });
    
    it ("should parse the dateformat file for funcs", function () {
        var files = Orchestrator.getAllFuncs("./repos/node-dateformat", ["lib/dateformat.js"]);
        assert.equal(1, files.length);
        assert.equal(1, files[0].funcs.length);
    });
    
    it("should generate test cases based on test case analysed types", function (done) {
        var opts = {files: ["lib/dateformat.js"], tests: ["test/test_formats.js"]}
        Orchestrator.generateTestCases("./repos/node-dateformat", opts).then(function () {
           done(); 
        });
    });
});

describe('Orchestrator runs test cases', function() {
    it('should run test cases and print results to file', function(done) {
        Orchestrator.executeTestCases("tests/fixtures/mocha").done(function() {
            done();
        })
    })
})