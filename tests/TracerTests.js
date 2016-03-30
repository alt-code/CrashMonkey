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
        child_process.execSync("git checkout 1510a1", {cwd: "./repos/CrashMonkey"});
    });

    it ("should augment function in file", function () {
        var files = Orchestrator.getFuncsChanged("./repos/CrashMonkey");
        //console.log(files.map(x => x.funcs));
        Tracer.traceTestsForFilesFuncs("./repos/CrashMonkey", files, ["./repos/CrashMonkey/tests/GitCenterTests.js"]);
        var file = fs.readFileSync("./repos/CrashMonkey/lib/GitCenter.js", {encoding: "utf8"});
        var lines = file.split(/\r?\n/);
        var functionLine = _.findIndex(lines, x => x.indexOf("function getFileCommit") !== -1);
        assert.ok(lines[functionLine+1].indexOf("console.log('trace')") !== -1);
    });
});