const esprima = require("esprima");
const escodegen = require("escodegen");
const fs = require("fs");
const child_process = require("child_process");
const Promise = require("promise");
const Deferred = require("promise-deferred");
const _ = require("lodash");

const MochaFormatter = require("./formatters/mocha-formatter.js");

function modifyFiles(repo, files, testFiles) {
    repo = repo + "/";

    for (var i = 0; i < files.length; i++) {
        if (files[i].funcs.length === 0)
            continue;
        var file = files[i];
        var ast = file.astNew;
        
        for (var j = 0; j < file.funcs.length; j++) {
            var func = file.funcs[j].func;
            
            var body = func.body.body;
            body.unshift(esprima.parse("console.log('trace')"));
        }
        
        fs.writeFileSync(repo+file.name,escodegen.generate(file.astNew), {encoding: "utf8"});
    }
    
    for (var i = 0; i < testFiles.length; i++) {
        var file = fs.readFileSync(repo + testFiles[i], {encoding: "utf8"});
        var ast = esprima.parse(file, {loc: true});
        var testcases = MochaFormatter.getTestCasesText(ast);
        recursSuite(testcases);
        fs.writeFileSync(repo + testFiles[i], escodegen.generate(ast), {encoding: "utf8"});
    }
}

function runTraceTests(repo, testPath) {
    var deferred = new Deferred();
    var mocha = child_process.exec(`mocha ${testPath}`, {cwd: repo}, function(err, stdout, stderr) {
        var lines = stdout.split(/\r?\n/);
        var testcases = {};
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].match(/^trace/)) {
                var tmp = i-1;
                while (true) {
                    if (lines[tmp].match(/^testcase/)) {
                        var num = /^testcase (\d+)/.exec(lines[tmp])[1];
                        testcases[num] = true;
                        break;
                    }
                    tmp++;
                }
            }
        }
        deferred.resolve(_.keys(testcases));
    });
    return deferred.promise;
}

function recursSuite(suite) {
    var num = 0;
    
    var recFunc = function (suite) {
        for (var i = 0; i < suite.testcases.length; i++) {
            if (suite.testcases[i].type === "suite") {
                recFunc(suite.testcases[i]);
            }
            else {
                var body = suite.testcases[i].body.body;
                body.unshift(esprima.parse(`console.log('testcase ${num}')`));
                body.push(esprima.parse(`console.log('testcase ${num}')`));
                num++;
            }
        }
    };
    
    recFunc(suite);
}

exports.modifyFiles = modifyFiles;
exports.runTraceTests = runTraceTests;