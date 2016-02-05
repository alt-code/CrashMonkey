/**

This module gets the changes in the diff of two commits of a repo

commits: Commits can be identified either by their hash strings or integers 
        0 denoting the most recent commit, 1 denoting the 2nd most recent and so on
**/

const child_process = require("child_process");
const diffParser = require("git-diff-parser");
const _ = require("lodash");

/**
repo: Path to repo directory
branch: branch name
commitOld: identifier of the older commit (See above for commit descriptors)
commitNew: identifier of the newer commit (See above for commit descriptors)
        
returns: a list of files containing list of line numbers changed

**/
function getChanges(repo, branch, commitOld, commitNew) {
    commitOld = absCommmit(branch, commitOld);
    commitNew = absCommmit(branch, commitNew);
    
    var diffProcess = child_process.execSync("git diff " + commitOld + " " + commitNew, {cwd: repo});
    
    var parsed = diffParser(diffProcess);
    _.each(parsed.commits[0].files, (file) => {
        file.lines = _.filter(file.lines, line => line.type !== "normal");
    });
    
    return parsed.commits[0].files;
}

/**

This function returns the file contents for a commit id

repo: Path to repo directory
branch: branch name
file: Path to file
commit: identifier of the commit (See above for commit descriptors)

returns file contents

**/
function getFileCommit(repo, branch, commit, file) {
    commit = absCommmit(branch, commit);
    
    var showProcess = child_process.execSync("git show " + commit + ":" + file, {cwd: repo});
    
    return showProcess.toString();
}

function absCommmit(branch, commit) {
    if(typeof commit === "number") {
        if(commit === 0)
            return branch;
        else
            return branch + "~" + commit;
    }
    return commit;
}

module.exports.getChanges = getChanges;
module.exports.getFileCommit = getFileCommit;