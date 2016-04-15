const assert = require('assert');
const fs = require("fs");
const _ = require("lodash");
const Orchestrator = require("../lib/Orchestrator.js");
const TCW = require("../lib/TestCaseWizard.js");

describe('TCW simple tests', function() {
    describe('Simple function changes', function() {
        var funcs;
        before(function() {
            funcs = Orchestrator.getFuncsChanged(".", "HEAD", "2917ee", "568ada");
        });
                
        it('should return test cases for files', function() {
            var testCaseFiles = TCW.generateTestCases(funcs, []);
            assert.equal(2, testCaseFiles.length);
            assert.equal(16, testCaseFiles[0].testCases.length);

        });

        it('should return the common offenders for simple params', function() {
            var testCaseFiles = TCW.generateTestCases(funcs, []);
            var params = _.map(testCaseFiles[0].testCases, tc => tc.callSequence[0].params);
            assert.equal(1, _.countBy(params, val => val[0] === "null" && val[1] === 0)[true]);
            assert.equal(1, _.countBy(params, val => val[0] === "null" && val[1] === "undefined")[true]);
            assert.equal(1, _.countBy(params, val => val[0] === "undefined" && val[1] === "undefined")[true]);
            assert.equal(4, _.countBy(params, val => val[0] === "undefined")[true]);
        });

        it('should return constructor test cases for constructor prototype function calls', function() {
            var funcs = Orchestrator.getFuncsChanged(".", "HEAD", "90be01", "b175b2");
            var testCaseFiles = TCW.generateTestCases(funcs, []);
            assert.equal(3, testCaseFiles.length);
            assert.equal(3, testCaseFiles[2].testCases.length);
            assert.equal(2, testCaseFiles[2].testCases[1].callSequence.length);
            assert.ok(testCaseFiles[2].testCases[1].type === TCW.TCTYPE_CONSTRPROTOFUNC);
        });
    });
});

describe('Permutation tests', function() {
    it('should do simple permutations', function() {
        var arr = TCW.permute([[1,2],[2,3],[4,5]]);
        assert.equal(8, arr.length);
        arr = TCW.permute([[1,2,3]]);
        assert.equal(3, arr.length);
        arr = TCW.permute([[1,2,3], [8,9,10]]);
        assert.equal(9, arr.length);
        assert.equal(1, _.countBy(arr, val => val[0] === 2 && val[1] === 10)[true]);
        arr = TCW.permute([[1,2,3], [8,9,10], [12, 14]]);
        assert.equal(18, arr.length);
        assert.equal(9, _.countBy(arr, val => val[2] === 12)[true]);
    });

    it('should work with other values', function() {
        var arr = TCW.permute([[0, undefined, {}], [null, -1]]);
        assert.equal(6, arr.length);
        assert.equal(1, _.countBy(arr, val => val[0] === undefined && val[1] === null)[true]);
        assert.equal(2, _.countBy(arr, val => val[0] === undefined)[true]);
        assert.equal(3, _.countBy(arr, val => val[1] === null)[true]);
    });
    
    it('should output single array values as array of possible values', function () {
        var arr = TCW.permute([[0, "undefined", "null", "\"\""]]);
        assert.equal(4, arr.length);
        assert.equal(1, arr[0].length);
        assert.equal(1, arr[3].length);
    });
});

describe('Make test case', function() {
    it('should output a simple test case for a function call', function() {
        var file = {name: 'tests/fixtures/module-exports.js'};
        var func = {name: 'abc', func: {}};
        var params = ["null"];
        var testCase = TCW.makeTestCase(file, func, params);
        assert.equal(file.name, testCase.filepath);
        assert.equal(func.name, testCase.function);
        assert.equal(TCW.TCTYPE_EXPORTEDFUNC, testCase.type);
        assert.equal(1, testCase.callSequence.length);
        assert.equal("{root}", testCase.callSequence[0].context);
        assert.equal(func.name, testCase.callSequence[0].function);
        assert.equal(params[0], testCase.callSequence[0].params[0]);
    });
    
    it('should output a test case for a root function call', function() {
        var file = {name: 'tests/fixtures/module-exports.js'};
        var func = {name: '.', func: {}};
        var params = ["undefined"];
        var testCase = TCW.makeTestCase(file, func, params);
        assert.equal(TCW.TCTYPE_ROOTFUNC, testCase.type);
        assert.equal(1, testCase.callSequence.length);
        assert.equal(params[0], testCase.callSequence[0].params[0]);
        assert.equal("{root}", testCase.callSequence[0].context);
        assert.equal("{root}", testCase.callSequence[0].function);
    });
    
    it('should output a test case for a constructor prototype function call', function() {
        var file = {name: 'tests/fixtures/module-exports.js'};
        var func = {
            name: 'abc', 
            func: { protoParent: { id: {name: '.'}}}
        };
        var params = ["undefined"];
        var testCase = TCW.makeTestCase(file, func, params);
        assert.equal(TCW.TCTYPE_CONSTRPROTOFUNC, testCase.type);
        assert.equal(2, testCase.callSequence.length);
        assert.equal("{root}", testCase.callSequence[0].context);
        assert.equal("{root}", testCase.callSequence[0].function);
        assert.equal("{0}", testCase.callSequence[1].context);
        assert.equal(func.name, testCase.callSequence[1].function);
        assert.equal(params[0], testCase.callSequence[1].params[0]);
    });
});