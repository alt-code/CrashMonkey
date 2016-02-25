var CodeParser = require("../../../lib/CodeParser.js");
it("::1:: getAllExportedFunctions test", function() {
var ret0 = CodeParser.getAllExportedFunctions(0);
});
it("::2:: getAllExportedFunctions test", function() {
var ret0 = CodeParser.getAllExportedFunctions(undefined);
});
it("::3:: getAllExportedFunctions test", function() {
var ret0 = CodeParser.getAllExportedFunctions(null);
});
it("::4:: getAllExportedFunctions test", function() {
var ret0 = CodeParser.getAllExportedFunctions("");
});