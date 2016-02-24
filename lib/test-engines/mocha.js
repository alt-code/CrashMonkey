const child_process = require("child_process");
const fs = require("fs");
const Readable = require("stream").Readable;
const tapOut = require('tap-out');
const Promise = require("promise");

function executeTests(path) {
    return new Promise(function(resolve, reject) {
        path = path.replace(/\\/, "/");
        child_process.exec(`mocha ${path} --reporter=tap`, function(err, stdout, stderr) {
            getTAPoutput(stdout.toString()).done(function(output) {
                console.log(output);
                resolve();
            });
        });
    });
}

function getTAPoutput(out, callback) {
    return new Promise(function(resolve, reject) {
        var t = tapOut();
        var rs = new Readable();

        t.on('output', function (output) {
            resolve(output);
        });

        rs.push(mochaTAPTransformer(out));
        rs.push(null);
        rs.pipe(t);
    });
}

function mochaTAPTransformer(out) {
    var lines = out.split(/\r?\n/);
    var okRegex = /^(?:not )?ok (.+)/;
    var TAPStr = [];
    for (var i = 0; i < lines.length; i++) {
        if (okRegex.test(lines[i])) {
            var testName = okRegex.exec(lines[i])[1];
            TAPStr.push(`# ${testName}`);
            TAPStr.push(lines[i]);
            continue;
        }
        i
        TAPStr.push(lines[i]);
    }

    return TAPStr.join("\n");
}

module.exports.executeTests = executeTests;