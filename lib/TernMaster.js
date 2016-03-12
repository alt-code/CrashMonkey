const tern = require("tern");
const fs = require("fs");
const Promise = require("promise");
const _ = require("lodash");

var ternServer = new tern.Server({async: true, getFile: function(name, cb) {
    var fileContents = fs.readFileSync(name, {encoding: 'utf8'});
    cb(fileContents);
    return fileContents;
}});

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

function getTypesForFuncs(file, funcs) {
    if (funcs.length === 0)
        return;
    
    var fileContents = fs.readFileSync(file, {encoding: 'utf8'});
    _.each(funcs, function(func) {
        var loc = func.func.id.loc;
        var request = buildRequest(file, fileContents, {ch: loc.end.column, line: loc.end.line-1});
        ternServer.request(request, function (err, data) {
            if (err)
               console.log(err);
            console.log(data);
        });
    });
}

function getTypesForFuncsInFiles(files) {
    return new Promise(function(resolve, reject) {
        _.each(files, function (file) {
             getTypesForFuncs(file.name, file.funcs);
        });
    });
}

exports.getTypesForFuncsInFiles = getTypesForFuncsInFiles;