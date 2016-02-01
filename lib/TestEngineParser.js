"use strict";

const _ = require("lodash");
const PARSERS = ['mocha', 'tap'];

function TestEngineParser(parser) {
    if(!_.find(PARSERS, x => x === parser))
        throw new Error("Unrecognized parser!");
    this.parser = require(parser);
}

TestEngineParser.prototype.parseTestCases = function() {
    this.parser.parseTestCases();
}

TestEngineParser.prototype.runTestCases = function() {
    this.parser.runTestCases();
}

TestEngineParser.prototype.parseTestResults = function() {
    this.parser.parseTestResults();
}

module.exports = TestEngineParser;