const esprima = require("esprima");
const escodegen = require("escodegen");
const fs = require("fs");

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