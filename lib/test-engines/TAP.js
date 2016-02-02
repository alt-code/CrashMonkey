/**

This module implements the contract specified by lib/TestEngineParser for TAP related tests

**/

const child_process = require("child_process");
const parser = require("tap-parser");

function TAPParser() {
    
}

TAPParser.prototype.parseTestCases = function() {
    
}

TAPParser.prototype.runTestCases = function(repoPath) {
    var cp = child_process.exec("tap test/num.js --reporter=json", {
        cwd: repoPath
    }, (err, stdout, stderr) => {
        /*if(err)
            console.log(err);*/
    });
    var p = parser(result => {
        console.log(result/*.failures[0].diag*/);
    });
    cp.stdout.pipe(p);
}

TAPParser.prototype.parseTestResults = function() {
    
}

module.exports = TAPParser;