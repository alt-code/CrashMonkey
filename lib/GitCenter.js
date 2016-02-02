/**

This module gets the changes in the diff of two commits of a repo

**/

const child_process = require("child_process");


/**
repo: Path to repo directory
branch: branch name
commitOld: identifier of the older commit (See commits)
commitNew: identifier of the newer commit (See commits)

commits: Commits can be identified either by their hash strings or integers 
        0 denoting the most recent commit, 1 denoting the 2nd most recent and so on
        
returns: a list of files containing list of line numbers changed

**/
function getChanges(repo, branch, commitOld, commitNew) {
    commitOld = absCommmit(branch, commitOld);
    commitNew = absCommmit(branch, commitNew);
    var diffProcess = child_process.execSync("git diff " + commitOld + " " + commitNew, {cwd: repo});
    console.log(diffProcess.toString());
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