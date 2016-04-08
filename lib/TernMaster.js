const tern = require("tern");
const fs = require("fs");
const Promise = require("promise");
const _ = require("lodash");

var ternServer = new tern.Server({async: true});

/**

This function constructs a request for type query as Tern expects it

**/
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

/**

This function initiates a type request for a single function

**/
function makeRequestForFunc(file, func) {
    return new Promise(function(resolve, reject) {
        var loc;
        if (func.func.id)
            loc = func.func.id.loc.end;
        else
            loc = func.func.loc.start;

        var request = buildRequest(file.name, file.fileContentsNew, {ch: loc.column, line: loc.line-1});
        ternServer.request(request, function (err, data) {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }
            var type = getTypes(data.type);
            for (var i = 0; i < type.params.length; i++) {
                func.func.params[i].inferredType = type.params[i];
            }
            func.func.inferredReturnType = type.return;
            resolve(data);
        });
    });
}

/**

This function marshalls tern request calls for a single file, multiple funcs

**/
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
        Promise.all(funcsPromise).done(function(results) {
            resolve(results);
        });
    });
}

/**

This function marshalls tern request calls for multiples files

**/
function getTypesForFuncsInFiles(files) {
    return new Promise(function(resolve, reject) {
        var filesPromise = [];
        _.each(files, function (file) {
             filesPromise.push(getTypesForFuncs(file, file.funcs));
        });
        Promise.all(filesPromise).done(function(results) {
            resolve(results);
        });
    });
}

/**

This function parses a function definition type returned by tern and returns the inferred types

**/
function getLastType(str) {
    if (str.match(/number$/i))
        return {type: "number", startPos: str.length-6};
    if (str.match(/string$/i))
        return {type: "string", startPos: str.length-5};
    if (str.match(/\?$/))
        return {type: "unknown", startPos: str.length-1};
    if (str.match(/bool$/))
        return {type: "bool", startPos: str.length-4};
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

/**

This function parses the function definition for param types

**/
function getParamTypes(funcStr) {
    var types = [];
    if(!funcStr.match(/^fn\(.*\)$/))
        return types;
    
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

/**

This function parses a tern function definition for param types and return type

**/
function getTypes(funcStr) {
    var opbracket = "(", clbracket = ")";
    var count = 1, pos = 3;
    
    while(count !== 0) {
        var char = funcStr.charAt(pos);
        if (char === opbracket)
            count++;
        if (char === clbracket)
            count--;
        pos++;
    }
    
    var paramStr = funcStr.substring(0, pos);
    var retObj = {};
    retObj.params = getParamTypes(paramStr);
    
    funcStr = funcStr.replace(" ->", ":");
    var colSepPos = funcStr.indexOf(":", pos);
    if (colSepPos !== -1) {
        var returnStr = funcStr.substr(pos+2);
        retObj.return = getLastType(returnStr).type;
    }
    else {
        retObj.return = "unknown";
    }
    
    return retObj;
}

exports.getTypesForFuncsInFiles = getTypesForFuncsInFiles;
exports.getParamTypes = getParamTypes;
exports.getTypes = getTypes;