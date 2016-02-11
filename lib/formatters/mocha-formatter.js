/**

This function returns the strings for any file headers the test needs like requires

**/
function formatFile(file, rootPath) {
    var requireString = "";
    var module = moduleName(file.name);
    requireString += `var ${module} = require("${rootPath}/${file.name}")\n`;
    return requireString;
}

function moduleName(filePath) {
    var module = /([^\/]+)\.js$/.exec(filePath)[1];
    module = module.replace(/[\-]/, "");
    return module;
}

module.exports.formatFile = formatFile;