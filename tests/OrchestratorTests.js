const assert = require('assert');
const fs = require("fs");
const _ = require("lodash");
const Orchestrator = require("../lib/Orchestrator.js");

describe('Orchestrator funcs changed tests', function() {
    it('should return functions for changes', function () {
        var files = Orchestrator.getFuncsChanged(".", "HEAD", "2917ee", "568ada");
        assert.equal(2, files.length);
        assert.equal(1, files[0].funcs.length);
        assert.equal("getFuncForLine", files[0].funcs[0].name);
    });
    
    it('should return functions for signature changes', function () {
        var files = Orchestrator.getFuncsChanged(".", "HEAD", "24c1e5", "a188fe");
        assert.equal(3, files.length);
        assert.equal(1, files[0].funcs.length);
        assert.equal("getAllExportedFunctions", files[0].funcs[0].name);
    });
    
    it('should return functions for added files', function () {
        var files = Orchestrator.getFuncsChanged(".", "HEAD", "34fc4f", "53630f");
        assert.equal(1, files.length);
        assert.equal(1, files[0].funcs.length);
        assert.equal("getChanges", files[0].funcs[0].name);
    });
    
    it('should not return functions for deleted files', function () {
        var files = Orchestrator.getFuncsChanged(".", "HEAD", "24c1e5", "a188fe");
        assert.equal(1, files.length);
    });
});