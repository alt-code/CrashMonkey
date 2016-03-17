const tern = require("tern");
const Infer = require("../node_modules/tern/lib/infer");
const fs = require("fs");
const _ = require("lodash");
const esprima = require("esprima");
const esprimaWalk = require("esprima-walk");

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
    
    var esast = esprima.parse(fileContents, {loc: true});
    esprimaWalk.walkAddParent(esast, function() {});
    
    Infer.withContext(new Infer.Context(defs, null), function() {
        file = ternServer.findFile(filename);
        Infer.analyze(file.ast);
        var expr = Infer.scopeAt(file.ast, 0);
        
        //Get variables in the module scope not inherited from ecma5 type defs
        var rootVars = _.pickBy(expr.props, x => x.origin !== "ecma5");
        retObj.rootVars = rootVars;
    });
    
    return retObj;
}

exports.analyzeTestCases = analyzeTestCases;