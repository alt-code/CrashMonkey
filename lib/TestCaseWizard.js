/**

This module is the heart of the test case generation intelligence and related hocus pocus

**/
const _ = require("lodash");
const Util = require("./Util.js");

const commonOffenders = [0, "undefined", "null", "\"\""];

function TestCase() {
    this.id = 0;
    this.function = "";
    this.filepath = "";
    this.description = "";
    this.inputs = [];
    this.assertions = [];
    this.output = {};
}

/**

This function generates test cases for a function definition.
For now it only creates test cases for pre-set inputs like empty strings or the value 0

This documentation to be updated as the intelligence evolves.

returns [Test Case] (See /docs/Objects.md)

**/

function generateTestCases(files) {
    files = files.length ? files : [files];
    var testCaseId = 0;
    _.each(files, function(file) {
        var testCases = [];
        _.each(file.funcs, function (func) {
            var funcObject = func.func;

            //This is where parameter inference logic will go
            var paramValues = _.map(funcObject.params, () => commonOffenders);
            var paramPermutations = permute(paramValues);

            _.each(paramPermutations, function(params) {
                var testCase = makeTestCase(file, func, params, testCaseId++);
                testCases.push(testCase);
            });
        });
        file.testCases = testCases;
    });
    return files;
}

function makeTestCase(file, func, params, testCaseId) {
    var testCase = new TestCase();
    testCase.function = func.name;
    testCase.filepath = file.name;
    testCase.id = testCaseId;
    testCase.inputs = params;
    return testCase;
}

function permute(arr) {
    if(arr.length <= 0)
        return [];
    var temp = permute(arr.slice(1));
    return Util.joinArrays(arr[0], temp);
}

exports.generateTestCases = generateTestCases;
exports.permute = permute;
exports.makeTestCase = makeTestCase;