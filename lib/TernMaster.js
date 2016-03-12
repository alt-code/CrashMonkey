const tern = require("tern");
const fs = require("fs");
const Promise = require("promise");
const _ = require("lodash");

var ternServer = new tern.Server({async: true});

function buildRequest(file, fileContents, offset) {
    var fileInfo = {"type":"full","name": file,"text": fileContents};
    query = {type: "type"};
    query.start = offset;
    query.end = offset;
    query.file = fileInfo.name;

    var request = {query: query, files: [], timeout: 5000};
    request.files.push(fileInfo);

    return request;
}

function makeRequestForFunc(file, func) {
    return new Promise(function(resolve, reject) {
        var loc = func.func.id.loc;
        var request = buildRequest(file.name, file.fileContentsNew, {ch: loc.end.column, line: loc.end.line-1});
        ternServer.request(request, function (err, data) {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}

function getTypesForFuncs(file, funcs) {
    return new Promise(function(resolve, reject) {
        if (funcs.length === 0) {
            resolve();
            return;
        }

        var funcsPromise = [];
        _.each(funcs, function(func) {
            funcsPromise.push(makeRequestForFunc(file, func));
        });
        Promise.all(funcsPromise).then(function(results) {
            resolve(results);
        });
    });
}

function getTypesForFuncsInFiles(files) {
    return new Promise(function(resolve, reject) {
        var filesPromise = [];
        _.each(files, function (file) {
             filesPromise.push(getTypesForFuncs(file, file.funcs));
        });
        Promise.all(filesPromise).then(function(results) {
            resolve(results);
        });
    });
}

function getParamTypes(funcStr) {
    var types = [];
    if(!funcStr.match(/^fn\(.*\)$/))
        return types;
    
    function getLastType(str) {
        if (str.match(/number$/i))
            return {type: "number", startPos: str.length-6};
        if (str.match(/string$/i))
            return {type: "string", startPos: str.length-5};
        if (str.match(/\?$/))
            return {type: "unknown", startPos: str.length-1};
        if (/([\}\]])$/.test(str)) {
            var clbracket = /([\}\]])$/.exec(str)[1];
            var opbracket = clbracket === "}" ? "{" : "[";
            var count = 1, pos = str.length-2;
            while(count !== 0) {
                var char = str.charAt(pos);
                if (char === clbracket)
                    count++;
                if (char === opbracket)
                    count--;
                pos--;
            }
            if (clbracket === "}")
                return {type: "object", startPos: pos};
            if (clbracket === "]")
                return {type: "array", startPos: pos};
        }
    }
    
    var tempStr = funcStr.substring(3,funcStr.length-1);
    while(true) {
        if(tempStr === "")
            break;
        var type = getLastType(tempStr);
        types.unshift(type.type);
        
        var comma = tempStr.lastIndexOf(",", type.startPos);
        tempStr = comma !== -1 ? tempStr.substring(0, comma) : "";
    }
    
    return types;
}

exports.getTypesForFuncsInFiles = getTypesForFuncsInFiles;
exports.getParamTypes = getParamTypes;