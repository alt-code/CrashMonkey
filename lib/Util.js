exports.repoNamefromURL = function(URL) {
    return /\/([^\/]+).git$/.exec(URL)[1];
}

exports.joinArrays = function (arr1, arr2) {
    var results = [];
    if(arr1.length <= 0)
        return arr2;
    if(arr2.length <= 0)
        return arr1;
    for(var i = 0; i < arr1.length; i++) {
        for(var j = 0; j < arr2.length; j++)
            results.push([arr1[i]].concat(arr2[j]));
    }
    return results;
}