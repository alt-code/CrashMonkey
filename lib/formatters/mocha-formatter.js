const _ = require("lodash");

function formatTestSuite(testCaseFiles, rootPath) {
    _.each(testCaseFiles, function(file) {
        if(file.testCases.length === 0)
            return;
        var fileHeader = formatFile(file, rootPath);
        var testStrings = "";
        for (var i = 0; i < file.testCases.length; i++) {
            testStrings += formatTestCase(file.testCases[i]);
        }
        file.testFileContent = fileHeader + testStrings;
    });
    return testCaseFiles;
}

/**

This function returns the strings for a mocha test case

**/
function formatTestCase(test) {
    var testCaseString = "";
    var module = moduleName(test.filepath);
    testCaseString += `it("${test.function} test", function() {\n`;
    testCaseString += `${module}.${test.function}`;
    testCaseString += `(${test.inputs.join(",")});\n`;
    testCaseString += `});\n`;
    return testCaseString;
}

/**

This function returns the strings for any file headers the test needs like requires

**/
function formatFile(file, rootPath) {
    var requireString = "";
    var module = moduleName(file.name);
    requireString += `var ${module} = require("${rootPath}/${file.name}");\n`;
    return requireString;
}

function moduleName(filePath) {
    var module = /([^\/]+)\.js$/.exec(filePath)[1];
    module = module.replace(/[\-]/, "");
    return module;
}

module.exports.formatTestSuite = formatTestSuite;
module.exports.formatFile = formatFile;
module.exports.formatTestCase = formatTestCase;