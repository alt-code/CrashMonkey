const tern = require("tern");
const Infer = require("../node_modules/tern/lib/infer");
const esprima = require("esprima");
const fs = require("fs");
const _ = require("lodash");

const MochaFormatter = require("./formatters/mocha-formatter.js");
const CodeParser = require("./CodeParser.js");

function buildRequest(fileInfo, query, offset) {
    query = {type: query};
    query.start = offset;
    query.end = offset;
    query.file = fileInfo;

    var request = {query: query, files: [], offset: offset, timeout: 5000};

    return request;
}
var defs = [JSON.parse(fs.readFileSync("./node_modules/tern/defs/ecma5.json", {encoding: 'utf8'}))];
var ternServer = new tern.Server({async: true});

function parseSuite(suite, rootVars, filename) {
    var testcases = suite.testcases;
    for (var i = 0; i < testcases.length; i++) {
        if (testcases[i].type === "suite")
            parseSuite(testcases[i], rootVars, filename);
        else {
            var testcase = testcases[i];
            var varUses = CodeParser.getVariableUses(testcase.body, rootVars);
            
            testcase.varUses = varUses;
            
            //Infer types of params for every function call for every varUse
            for (var variable in testcase.varUses) {
                if (!testcase.varUses.hasOwnProperty(variable))
                    continue;

                var functioncalls = testcase.varUses[variable].functioncalls;
                for (var j = 0; j < functioncalls.length; j++) {
                    for (var k = 0; k < functioncalls[j].arguments.length; k++) {
                        functioncalls[j].arguments[k].inferredType = inferParamType(functioncalls[j].arguments[k], filename);
                    }
                }
            }
        }
    }
}

function inferParamType(param, filename) {
    if (param.type === "Literal") {
        if (param.value === null)
            return "null";
        if (typeof param.value === "string")
            return "string";
    }
    if (param.type === "Identifier") {
        if (param.name === "undefined")
            return "undefined";
        else {
            var file = ternServer.findFile(filename);
            var request = buildRequest(filename, "type", {ch: param.loc.start.column, line: param.loc.start.line-1});
            var expr = tern.findQueryExpr(file, request.query);
            var type = Infer.expressionType(expr);
            if (type.types.length > 0)
                return type.types[0].name.toLowerCase();
        }
    }
}

function analyzeTestCases(file, fileContents) {
    var filename = /\/([^/]+)$/.exec(file)[0];
    ternServer.addFile(filename, fileContents);
    
    var retObj = {};
    
    var ast = esprima.parse(fileContents, {loc: true});
    var tests = MochaFormatter.getTestCasesText(ast);
    var globalReqs = CodeParser.getGlobalReqs(fileContents);
    
    Infer.withContext(new Infer.Context(defs, null), function() {
        file = ternServer.findFile(filename);
        Infer.analyze(file.ast);
        var expr = Infer.scopeAt(file.ast, 0);
        
        //Get variables in the module scope not inherited from ecma5 type defs
        var rootVars = _.pickBy(expr.props, x => x.origin !== "ecma5" && !_.some(globalReqs, g => g === x.propertyName));
        retObj.rootVars = rootVars;
        
        parseSuite(tests, _.keys(rootVars), filename, fileContents);
        retObj.tests = tests;
    });
    
    return retObj;
}

exports.analyzeTestCases = analyzeTestCases;