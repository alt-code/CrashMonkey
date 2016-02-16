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
            var testCaseFiles = TCW.generateTestCases(funcs);
            assert.equal(2, testCaseFiles.length);
            assert.equal(16, testCaseFiles[0].testCases.length);

        });

        it('should return the common offenders for simple params', function() {
            var testCaseFiles = TCW.generateTestCases(funcs);
            assert.equal(1, _.countBy(testCaseFiles[0].testCases, val => val.inputs[0] === "null" && val.inputs[1] === 0)[true]);
            assert.equal(1, _.countBy(testCaseFiles[0].testCases, val => val.inputs[0] === "null" && val.inputs[1] === "undefined")[true]);
            assert.equal(1, _.countBy(testCaseFiles[0].testCases, val => val.inputs[0] === "undefined" && val.inputs[1] === "undefined")[true]);
            assert.equal(4, _.countBy(testCaseFiles[0].testCases, val => val.inputs[0] === "undefined")[true]);
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