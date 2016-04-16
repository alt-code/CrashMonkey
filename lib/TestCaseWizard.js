/**

This module is the heart of the test case generation intelligence and related hocus pocus

**/
const _ = require("lodash");
const Util = require("./Util.js");
const TestCaseAnalyzer = require("./TestCaseAnalyzer.js");

const commonOffenders = [0, "undefined", "null", "\"\""];

const TCTYPE_ROOTFUNC = Symbol('Root function');
const TCTYPE_EXPORTEDFUNC = Symbol('Exported function');
const TCTYPE_CONSTRPROTOFUNC = Symbol('Constructor protoype function');

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
        var fileAnalysis = TestCaseAnalyzer.analyzeTestCases(file.name, file.fileContentsNew);
        
        var testCases = [];
        _.each(file.funcs, function (func) {
            var funcObject = func.func;
            
            if (funcObject.params.length === 0) {
                testCases.push(makeTestCase(file, func, [], testCaseId++));
                return;
            }

            //Test analysis found some function calls
            if (func.tcanalysis && func.tcanalysis.functioncalls.length > 0) {
                var type = func.tcanalysis.functioncalls[0].arguments[0].inferredType;
                //date
                var paramValues = [getInstancesForType(type)];
                var paramPermutations = permute(paramValues);
                paramValues = _.map(funcObject.params, () => commonOffenders);
                paramPermutations = paramPermutations.concat(permute(paramValues));
            }
            else {
                var paramValues = _.map(funcObject.params, () => commonOffenders);
                var paramPermutations = permute(paramValues);
            }
            
            _.each(paramPermutations, function(params) {
                var testCase = makeTestCase(file, func, params, testCaseId++);
                testCases.push(testCase);
            });
        });
        file.testCases = testCases;
    });
    return files;
}

function getInstancesForType(type) {
    if (type === "date") {
        return [`"${(new Date()).toString()}"`];
    }
}

function makeTestCase(file, func, params, testCaseId) {
    var testCase = new TestCase();
    testCase.function = func.name;
    if (func.name === ".") {
        testCase.type = TCTYPE_ROOTFUNC;
        testCase.function = "root function";
    }
    else if (func.func.protoParent)
        testCase.type = TCTYPE_CONSTRPROTOFUNC;
    else
        testCase.type = TCTYPE_EXPORTEDFUNC;
    testCase.filepath = file.name;
    testCase.id = testCaseId;
    testCase.callSequence = makeCallSequence(func, params, testCase);
    return testCase;
}

function makeCallSequence(func, params, testCase) {
    var sequence = [];
    if (testCase.type === TCTYPE_ROOTFUNC) {
        sequence.push({context: "{root}", function: "{root}", params: params});
    }
    else if (testCase.type === TCTYPE_EXPORTEDFUNC){
        sequence.push({context: "{root}", function: func.name, params: params});
    }
    else {
        sequence.push({context: "{root}", function: "{root}", params: [], type: "constructor"});
        sequence.push({context: "{0}", function: func.name, params: params});
    }
    
    return sequence;
}

function permute(arr) {
    if(arr.length <= 0)
        return [];
    var temp = permute(arr.slice(1));
    return Util.joinArrays(arr[0], temp);
}

exports.TCTYPE_ROOTFUNC = TCTYPE_ROOTFUNC;
exports.TCTYPE_EXPORTEDFUNC = TCTYPE_EXPORTEDFUNC;
exports.TCTYPE_CONSTRPROTOFUNC = TCTYPE_CONSTRPROTOFUNC;

exports.generateTestCases = generateTestCases;
exports.permute = permute;
exports.makeTestCase = makeTestCase;