const _ = require("lodash");
const GitCenter = require("./GitCenter.js");
const CodeParser = require("./CodeParser.js");

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
        var fileContentsOld = GitCenter.getFileCommit(repo, branch, commitOld, change.name);
        var fileContentsNew = GitCenter.getFileCommit(repo, branch, commitNew, change.name);
        var deletedLines = _.filter(change.lines, line => line.type === "deleted");
        var addedLines = _.filter(change.lines, line => line.type === "added");

        var funcsOld = CodeParser.getFuncsForLines(fileContentsOld, _.map(deletedLines, line => line.ln1));
        var funcsNew = CodeParser.getFuncsForLines(fileContentsNew, _.map(addedLines, line => line.ln1));
        //        console.log(funcsOld);
        //        console.log(funcsNew);
        var common = _.intersectionWith(funcsOld, funcsNew, (f1, f2) => f1.name === f2.name);
        change.funcs = common;
    });

    return changes;
}

module.exports.getFuncsChanged = getFuncsChanged;