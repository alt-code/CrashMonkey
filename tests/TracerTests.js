const assert = require('assert');
const fs = require("fs");
const _ = require("lodash");
const child_process = require("child_process");
const del = require("del");

const Tracer = require("../lib/Tracer.js");
const Orchestrator = require("../lib/Orchestrator.js");

describe("Tracer tests", function () {
    before (function () {
        if (!fs.existsSync("./repos/CrashMonkey"))
            child_process.execSync("git clone https://github.com/alt-code/CrashMonkey.git", {cwd: "./repos"});
        child_process.execSync("git reset 1510a1 --hard", {cwd: "./repos/CrashMonkey"});
        
        var files = Orchestrator.getFuncsChanged("./repos/CrashMonkey");
        //console.log(files.map(x => x.funcs));
        Tracer.modifyFiles("./repos/CrashMonkey", files, ["tests/GitCenterTests.js"]);
    });

    it ("should augment function in file", function () {
        var file = fs.readFileSync("./repos/CrashMonkey/lib/GitCenter.js", {encoding: "utf8"});
        var lines = file.split(/\r?\n/);
        var functionLine = _.findIndex(lines, x => x.indexOf("function getFileCommit") !== -1);
        assert.ok(lines[functionLine+1].indexOf("console.log('trace')") !== -1);
    });
    
    it ("should augment all test files", function () {
        var file = fs.readFileSync("./repos/CrashMonkey/tests/GitCenterTests.js", {encoding: "utf8"});
        var lines = file.split(/\r?\n/);
        var itLines = [];
        _.each(lines, function(x, index) {
            if (x.indexOf("it('should") !== -1)
                 itLines.push(index);
        });
        assert.ok(_.every(itLines, x => /console\.log\('testcase \d+'\)/.test(lines[x+1])));
    });
    
    it("should run the tracer tests", function (done) {
        Tracer.runTraceTests("./repos/CrashMonkey", "tests\\GitCenterTests.js").then(function (testcases) {
            assert.equal(2, testcases.length);
            assert.equal('2', testcases[0]);
            assert.equal('3', testcases[1]);
            done();
        });
    });
});