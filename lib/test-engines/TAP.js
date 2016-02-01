/**

This module implements the contract specified by lib/TestEngineParser for TAP related tests

**/

const child_process = require("child_process");

function TAPParser() {
    
}

TAPParser.prototype.parseTestCases = function() {
    
}

TAPParser.prototype.runTestCases = function(repoPath) {
    child_process.exec("tap test/*.js --reporter=json", {
        cwd: repoPath
    }, (err, stdout, stderr) => {
        if(err)
            console.log(err);
        console.log(stdout.toString());
    });
}

TAPParser.prototype.parseTestResults = function() {
    
}

module.exports = TAPParser;