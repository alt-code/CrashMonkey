const esprima = require("esprima");
const escodegen = require("escodegen");
const fs = require("fs");

function traceTestsForFilesFuncs(repo, files, testFiles) {
    repo = repo + "/";

    for (var i = 0; i < files.length; i++) {
        if (files[i].funcs.length === 0)
            continue;
        var file = files[i];
        var ast = file.astNew;
        
        for (var j = 0; j < file.funcs.length; j++) {
            var func = file.funcs[j].func;
            
            var body = func.body.body;
            body.unshift(esprima.parse("console.log('trace')"));
        }
        
        fs.writeFileSync(repo+file.name,escodegen.generate(file.astNew), {encoding: "utf8"});
    }
}

exports.traceTestsForFilesFuncs = traceTestsForFilesFuncs;