"use strict";

const _ = require("lodash");
const PARSERS = ['mocha', 'TAP'];

function TestEngineParser(parser, config) {
    if(!_.find(PARSERS, x => x === parser))
        throw new Error("Unrecognized parser!");
    var Parser = require("./test-engines/"+parser+".js");
    this.parser = new Parser();
    this.repoPath = config.repoPath;
}

TestEngineParser.prototype.parseTestCases = function() {
    this.parser.parseTestCases();
}

TestEngineParser.prototype.runTestCases = function() {
    this.parser.runTestCases(this.repoPath);
}

TestEngineParser.prototype.parseTestResults = function() {
    this.parser.parseTestResults();
}

module.exports = TestEngineParser;