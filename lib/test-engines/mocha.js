const child_process = require("child_process");
const fs = require("fs");
const Readable = require("stream").Readable;
const tapOut = require('tap-out');
const Promise = require("promise");
const _ = require("lodash");

function executeTests(path) {
    path = path.replace(/\\/g, "/");
    var testIdFile = parsePathForTests(path);
    
    return new Promise(function(resolve, reject) {
        child_process.exec(`mocha ${path} --reporter=tap`, function(err, stdout, stderr) {
            getTAPoutput(stdout.toString()).done(function(output) {
                processOutput(output, testIdFile);
                resolve(output);
            });
        });
    });
}

function parsePathForTests(path) {
    var testpaths = [];
    var pathStat = fs.statSync(path);
    if (pathStat.isDirectory()) {
        var files = fs.readdirSync(path);
        _.each(_.filter(files, x => x.match(/\.js$/)), function(file) {
            var filePath = path + file;
            var fileContents = fs.readFileSync(filePath, {encoding: 'utf8'});
            var testids = getTests(fileContents);
            _.each(testids, (x) => {testpaths[x] = filePath});
        });
    }
    else {
        var fileContents = fs.readFileSync(path, {encoding: 'utf8'});
        var testids = getTests(fileContents);
        _.each(testids, (x) => {testpaths[x] = path});
    }
    return testpaths;
}

function getTests(fileContents) {
    var tests = [];
    var idRegx = /::(\d+)::/g;
    var match;
    while(match = idRegx.exec(fileContents))
        tests.push(match[1]);
    return tests;
}

function processOutput(output, testIdFile) {
    var results = output.pass.concat(output.fail);
    _.each(output.tests, function(test) {
        test.result = _.find(results, x => x.test === test.number);
        test.file = testIdFile[test.number];
    });
    
    
    if (output.comments.length > 0) {
        var comments = _.groupBy(output.comments, x => x.test);
        for (var a in comments) {
            if (!comments.hasOwnProperty(a))
                continue;
            var test = _.find(output.tests, x => x.number === parseInt(a));
            test.failure = comments[a][0].raw.trim();
            test.stacktrace = comments[a].slice(1).map(x => x.raw.trim()).join("\n");
        }
    }
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