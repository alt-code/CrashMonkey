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

describe("Tern type parsing tests", function () {
    describe("Basic types", function () {
        it("should return no types for no params", function () {
            var types = TernMaster.getParamTypes("fn()");
            assert.equal(0, types.length);
        });
        
        it("should return type for a single param", function () {
            var types = TernMaster.getParamTypes("fn(def: ?)");
            assert.equal(1, types.length);
            assert.equal("unknown", types[0]);
        });
        
        it("should return types for multiple params", function () {
            var types = TernMaster.getParamTypes("fn(def: ?, xyz: number)");
            assert.equal(2, types.length);
            assert.equal("unknown", types[0]);
            assert.equal("number", types[1]);
            var types = TernMaster.getParamTypes("fn(def: ?, xyz: number, mmA: String)");
            assert.equal(3, types.length);
            assert.equal("unknown", types[0]);
            assert.equal("number", types[1]);
            assert.equal("string", types[2]);
        });
    });
    
    describe("Complex types", function () {
        it("should return array types", function () {
            var types = TernMaster.getParamTypes("fn(def: [?])");
            assert.equal(1, types.length);
            assert.equal("array", types[0]);
        });
        
        it("should return object types", function () {
            var types = TernMaster.getParamTypes("fn(def: {something})");
            assert.equal(1, types.length);
            assert.equal("object", types[0]);
        });
        
        it("should return complex types for multiple params", function() {
            var types = TernMaster.getParamTypes("fn(file: ?, fileContents: ?, offset: {ch, line})");
            assert.equal(3, types.length);
            assert.equal("unknown", types[0]);
            assert.equal("unknown", types[1]);
            assert.equal("object", types[2]);
        });
    });
})