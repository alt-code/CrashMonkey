const assert = require('assert');
const fs = require("fs");
const _ = require("lodash");
var MochaRunner = require("../lib/test-engines/mocha.js");

describe('Mocha runner tests', function () {
    var output;
    before(function(done) {
        MochaRunner.executeTests("tests\\fixtures\\mocha\\mocha-test.js").then(function(out) {
            if (out) {
                output = out;
                done();
            }
            else
                done("Something went wrong running the test fixture");
        });
    });

    it('should run test fixture and get results', function () {
        assert.equal(4, output.tests.length);
        assert.equal(4, output.pass.length);
        assert.equal(0, output.fail.length);
    });

    it('should verify if tests have ids', function () {
        assert.ok(/::\d+::/.test(output.tests[0].name));
    });
});