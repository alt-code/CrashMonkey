const fs = require("fs");
const _ = require("lodash");
const esprima = require("esprima");
const esprimaWalk = require("esprima-walk");

const GitCenter = require("./GitCenter.js");
const CodeParser = require("./CodeParser.js");
const TCW = require("./TestCaseWizard.js");
const MochaFormatter = require("./formatters/mocha-formatter.js");
const Util = require("./Util.js");

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
        if(!change.added) {
            fileContentsOld = GitCenter.getFileCommit(repo, branch, commitOld, change.name);
            astOld = esprima.parse(fileContentsOld, {loc: true});
            esprimaWalk.walkAddParent(astOld, function() {});
        }
        fileContentsNew = GitCenter.getFileCommit(repo, branch, commitNew, change.name);
        var astNew = esprima.parse(fileContentsNew, {loc: true});
        esprimaWalk.walkAddParent(astNew, function() {});

        var deletedLines = _.filter(change.lines, line => line.type === "deleted");
        var addedLines = _.filter(change.lines, line => line.type === "added");

        var funcsOld = [], funcsNew = [];
        if(!change.added)
            funcsOld = CodeParser.getFuncsForLines(astOld, _.map(deletedLines, line => line.ln1));
        var funcsNew = CodeParser.getFuncsForLines(astNew, _.map(addedLines, line => line.ln1));

        //Only functions that are in the new version, function names might have changed
        var exportedFuncs = CodeParser.getAllExportedFunctions(astNew);
        funcsOld = _.intersectionWith(funcsOld, exportedFuncs, (f1, f2) => f1.name === f2.name);

        var common = _.unionWith(funcsOld, funcsNew, (f1, f2) => f1.name === f2.name);
        change.funcs = common;
    });

    return changes;
}

function generateTestCases(repo, branch, commitOld, commitNew) {
    var TEST_DIR = repo;
    TEST_DIR = /\/$/.test(TEST_DIR) ? TEST_DIR + "/cmTests/" : TEST_DIR + "/cmTests/";
    Util.createDirIfNotExists(TEST_DIR);

    var files = getFuncsChanged(repo, branch, commitOld, commitNew);
    var testCaseFiles = TCW.generateTestCases(files);
    var fileContents = MochaFormatter.formatTestSuite(testCaseFiles, "..");

    _.each(fileContents, function(file) {
        if (file.testCases.length === 0)
            return;
        fs.writeFileSync(TEST_DIR + Util.fileNameFromPath(file.name), file.testFileContent, {encoding: 'utf8'});
    });
}

module.exports.getFuncsChanged = getFuncsChanged;
module.exports.generateTestCases = generateTestCases;