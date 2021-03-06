const _ = require("lodash");
const esprima = require("esprima");

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
    testCaseString += formatCallSequence(module, test);
    testCaseString += `});\n`;
    return testCaseString;
}

/**

This function formats the call sequence for a test case

**/
function formatCallSequence(module, test) {
    var testCaseString = "";
    var numStep = 0;
    var context = module;
    for (var i = 0; i < test.callSequence.length; i++) {
        var callStep = test.callSequence[i];
        
        //Call step return value
        testCaseString += `var ret${numStep++} = `;
        
        //If constuctor step
        if (callStep.type === "constructor")
            testCaseString += "new ";
        
        //Call step context
        var contextIdentifier;
        if (callStep.context === "{root}")
            testCaseString += module;
        else if (contextIdentifier = callStep.context.match(/\{(\d+)\}/)) {
            contextIdentifier = parseInt(contextIdentifier[1]);
            testCaseString += `ret${contextIdentifier}`;
        }

        //call step function name
        if (callStep.function === "{root}") {
            
        }
        else {
            testCaseString += "." + callStep.function;
        }
        
        //Call step function call params
        testCaseString += `(${callStep.params.join(",")});\n`;
    }
    
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

/**

This function analyzes a string for mocha tests and returns the code location in the test bodies

**/
function getTestCasesText(ast) {
    
    var tests = recursSuiteParse(ast);
    return tests;
}

function recursSuiteParse(ast) {
    var retObj = {type: "suite", testcases: []};
    for (var i = 0; i < ast.body.length; i++) {
        var exp = ast.body[i];
        if (exp.type === "ExpressionStatement" && exp.expression.type === "CallExpression" && exp.expression.callee.name === "describe") {
            retObj.testcases.push(recursSuiteParse(exp.expression.arguments[1].body));
        }
        if (exp.type === "ExpressionStatement" && exp.expression.type === "CallExpression" && exp.expression.callee.name === "it") {
            retObj.testcases.push({type: "testcase", body: exp.expression.arguments[1].body});
        }
    }
    return retObj;
}

module.exports.formatTestSuite = formatTestSuite;
module.exports.formatFile = formatFile;
module.exports.formatTestCase = formatTestCase;
module.exports.getTestCasesText = getTestCasesText;