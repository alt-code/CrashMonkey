const assert = require('assert');
const fs = require("fs");
const _ = require("lodash");
const TernMaster = require("../lib/TernMaster.js");
const Orchestrator = require("../lib/Orchestrator.js");

describe("Tern basic tests", function() {
    it("should append type for basic function", function(done) {
        var files = Orchestrator.getFuncsChanged(".", "HEAD", "24c1e5", "a188fe");
        TernMaster.getTypesForFuncsInFiles(files).done(function () {
            assert.equal("unknown", files[0].funcs[0].func.params[0].inferredType);
            done();
        });
    });
    
    it("should append type for multiple params", function(done) {
        var files = Orchestrator.getFuncsChanged(".", "HEAD", "1510a1", "65c533");
        TernMaster.getTypesForFuncsInFiles(files).done(function () {
            assert.equal(2, files[2].funcs.length);
            assert.equal("unknown", files[2].funcs[1].func.params[0].inferredType);
            assert.equal("unknown", files[2].funcs[1].func.params[1].inferredType);
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
    
    describe("Combined get types and return type tests", function () {
        it ("should not return return type", function () {
            var types = TernMaster.getTypes("fn(def: ?)");
            assert.equal(1, types.params.length);
            assert.equal("unknown", types.return);
        });
        
        it("should return types for params and function return", function () {
            var types = TernMaster.getTypes("fn(def: ?): string");
            assert.equal(1, types.params.length);
            assert.equal("string", types.return);
        });
        
        it("should return types for params and complex function return", function () {
            var types = TernMaster.getTypes("fn(def: ?): {func, name}");
            assert.equal(1, types.params.length);
            assert.equal("object", types.return);
        });
        
        it("should return types for a arrow seperator example", function () {
            var types = TernMaster.getTypes("fn(fileContents: ?, lines: [?]): [?]");
            assert.equal(2, types.params.length);
            assert.equal("array", types.return);
        })
    });
})