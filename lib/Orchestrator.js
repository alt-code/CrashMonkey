const fs = require("fs");
const _ = require("lodash");
const esprima = require("esprima");
const esprimaWalk = require("esprima-walk");
const Promise = require("promise");
const Deferred = require("promise-deferred");

const GitCenter = require("./GitCenter.js");
const CodeParser = require("./CodeParser.js");
const TCW = require("./TestCaseWizard.js");
const MochaFormatter = require("./formatters/mocha-formatter.js");
const Util = require("./Util.js");
const TernMaster = require("./TernMaster.js");
const MochaRunner = require("./test-engines/mocha.js");
const TestCaseAnalyzer = require("./TestCaseAnalyzer.js");

/**

This function returns the functions that changed between two commits on a per file basis

repo: Path to repo directory
branch: branch name
file: Path to file
commit: identifier of the commit (See GitCenter.js for commit descriptors)

returns funcs changed per file

**/
function getFuncsChanged(repo, branch, commitOld, commitNew) {
    branch = branch || "HEAD";
    commitOld = commitOld || 1;
    commitNew = commitNew || 0;
    var changes = GitCenter.getChanges(repo, branch, commitOld, commitNew);
    changes = _.filter(changes, (change) => {
        return !change.deleted && /\.js$/.test(change.name);
    });

    _.each(changes, (change) => {
        var fileContentsOld, astOld, fileContentsNew;
        change.funcs = [];
        if(!change.added) {
            fileContentsOld = GitCenter.getFileCommit(repo, branch, commitOld, change.name);
            try {
                astOld = esprima.parse(fileContentsOld, {loc: true});
            }
            catch (e) {
                console.log("There was a problem trying to parse " + change.name);
                return;
            }
            esprimaWalk.walkAddParent(astOld, function() {});
        }
        fileContentsNew = GitCenter.getFileCommit(repo, branch, commitNew, change.name);
        var astNew;
        try {
            astNew = esprima.parse(fileContentsNew, {loc: true});
        }
        catch (e) {
            console.log("There was a problem trying to parse " + change.name);
            return;
        }
        esprimaWalk.walkAddParent(astNew, function() {});

        var deletedLines = _.filter(change.lines, line => line.type === "deleted");
        var addedLines = _.filter(change.lines, line => line.type === "added");

        var funcsOld = [], funcsNew = [];
        if(!change.added)
            funcsOld = CodeParser.getFuncsForLines(astOld, _.map(deletedLines, line => line.ln1));
        var funcsNew = CodeParser.getFuncsForLines(astNew, _.map(addedLines, line => line.ln1), repo, change.name);
        
        //Only functions that are in the new version, function names might have changed
        var exportedFuncs = CodeParser.getAllExportedFunctions(astNew);
        funcsOld = _.intersectionWith(funcsOld, exportedFuncs, (f1, f2) => f1.name === f2.name);

        var common = _.unionWith(funcsNew, funcsOld, (f1, f2) => f1.name === f2.name);
        change.funcs = common;
        change.fileContentsNew = fileContentsNew;
        change.astNew = astNew;
        change.fileContentsOld = fileContentsOld;
    });

    return changes;
}

function getAllFuncs(repo, files) {
    var deferred = new Deferred();
    var filesArr = [];
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var fileObj = {name: file, funcs: []};
        var fileContents = GitCenter.getFileCommit(repo, "HEAD", 0, file);
        fileObj.fileContentsNew = fileContents;
        var ast = esprima.parse(fileContents);
        fileObj.funcs = CodeParser.getAllExportedFunctions(ast, repo, file);
        filesArr.push(fileObj);
    }
    
    return filesArr;
}

function generateTestCases(repo, opts) {
    var deferred = new Deferred();
    var TEST_DIR = repo;
    var files;
    TEST_DIR = /\/$/.test(TEST_DIR) ? TEST_DIR + "cmTests/" : TEST_DIR + "/cmTests/";
    Util.createDirIfNotExists(TEST_DIR);
    
    if (opts.commit) {
        var branch = opts.commit.branch, commitOld = opts.commit.commitOld, commitNew = opts.commit.commitNew;
        files = getFuncsChanged(repo, branch, commitOld, commitNew);
    }
    else {
        files = getAllFuncs(repo, opts.files);
    }
    
    var testcases = [];
    if (opts.tests) {
        for (var i = 0; i < opts.tests.length; i++) {
            var file = opts.tests[0], fileContents = fs.readFileSync(repo + "/" + file);
            var tc = TestCaseAnalyzer.analyzeTestCases(file, fileContents);
            var tcFile = {name: file, tests: {}};
            tcFile.tests = tc.tests;
            testcases.push(tcFile);
        }
    }
    
    TernMaster.getTypesForFuncsInFiles(files).then(function() {
        var testCaseFiles = TCW.generateTestCases(files, testcases);
        var fileContents = MochaFormatter.formatTestSuite(testCaseFiles, "..");

        _.each(fileContents, function(file) {
            if (file.testCases.length === 0)
                return;
            fs.writeFileSync(TEST_DIR + Util.fileNameFromPath(file.name), file.testFileContent, {encoding: 'utf8'});
        });
        deferred.resolve();
    });
    
    return deferred.promise;
}

function executeTestCases(path) {
    return new Promise(function(resolve, reject){
        MochaRunner.executeTests(path).done(function(results) {
            var resultStr = `### Test Results : Ran ${results.results[0].count} tests \n`;
            resultStr += `${results.results[1].count} passed  \n`;
            resultStr += `${results.results[2].count} failed  \n`;
            if (results.results[2].count > 0) {
                resultStr += "##### Test Failures  \n";
                var failures = _.filter(results.tests, x => !x.result.ok);
                _.each(failures, function(test) {
                    resultStr += `**${test.name}** (${test.file})  \n`;
                    resultStr += `*${test.failure}*  \n`;
                    resultStr += `\`\`\`${test.stacktrace}  \`\`\`\n`;
                });
            }
            else {
                resultStr += `**Monkey approves** <img src="https://raw.githubusercontent.com/alt-code/CrashMonkey/master/docs/monkey.jpg" height="50px">`;
            }
            fs.writeFileSync("test.results.md", resultStr, {encoding: 'utf8'});
            resolve();
        });
    });
}

module.exports.getFuncsChanged = getFuncsChanged;
module.exports.generateTestCases = generateTestCases;
module.exports.executeTestCases = executeTestCases;
module.exports.getAllFuncs = getAllFuncs;