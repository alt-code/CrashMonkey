const assert = require('assert');
const fs = require("fs");
const _ = require("lodash");
const GitCenter = require("../lib/GitCenter.js");

describe('Git diff tests', function() {
    it('should return files and line numbers that changed', function () {
        var files = GitCenter.getChanges(".", "master", "a00521", "34fc4f");
        assert.equal(2, files.length);
        assert.equal("package.json", files[1].name);
        assert.equal(12, files[0].lines.length);
        assert.equal("deleted", files[0].lines[1].type);
    });
    
    it('should return files that were added', function() {
        var files = GitCenter.getChanges(".", "master", "34fc4f", "53630f");
        assert.equal(1, files.length);
        assert.ok(files[0].added);
    });
});