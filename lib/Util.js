exports.repoNamefromURL = function(URL) {
    return /\/([^\/]+).git$/.exec(URL)[1];
}