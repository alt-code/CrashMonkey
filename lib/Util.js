var fs = require("fs");

exports.repoNamefromURL = function(URL) {
    return /\/([^\/]+).git$/.exec(URL)[1];
}

exports.fileNameFromPath = function(path) {
    return /\/([^\/]+)$/.exec(path)[1];
}

exports.joinArrays = function (arr1, arr2) {
    var results = [];
    if(arr1.length <= 0)
        return arr2.map(function(x) {return [x]});
    if(arr2.length <= 0)
        return arr1.map(function(x) {return [x]});
    for(var i = 0; i < arr1.length; i++) {
        for(var j = 0; j < arr2.length; j++)
            results.push([arr1[i]].concat(arr2[j]));
    }
    return results;
}

exports.createDirIfNotExists = function(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
}