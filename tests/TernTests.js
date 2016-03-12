const assert = require('assert');
const fs = require("fs");
const _ = require("lodash");
const TernMaster = require("../lib/TernMaster.js");
const Orchestrator = require("../lib/Orchestrator.js");

describe("Tern basic tests", function() {
    var files;
    before(function() {
        files = Orchestrator.getFuncsChanged(".", "HEAD", "24c1e5", "a188fe");
    });
    
    it("should type for basic function", function(done) {
        TernMaster.getTypesForFuncsInFiles(files).done(function () {
            done();
        });
    });
});