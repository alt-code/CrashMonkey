const tern = require("tern");
const Infer = require("../node_modules/tern/lib/infer");
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

function analyzeTestCases(file, fileContents) {
    var filename = /\/([^/]+)$/.exec(file)[0];
    ternServer.addFile(filename, fileContents);
    
    var retObj = {};
    
    var tests = MochaFormatter.getTestCasesText(fileContents);
    var globalReqs = CodeParser.getGlobalReqs(fileContents);
    
    Infer.withContext(new Infer.Context(defs, null), function() {
        file = ternServer.findFile(filename);
        Infer.analyze(file.ast);
        var expr = Infer.scopeAt(file.ast, 0);
        
        //Get variables in the module scope not inherited from ecma5 type defs
        var rootVars = _.pickBy(expr.props, x => x.origin !== "ecma5" && !_.some(globalReqs, g => g === x.propertyName));
        retObj.rootVars = rootVars;
    });
    
    return retObj;
}

exports.analyzeTestCases = analyzeTestCases;