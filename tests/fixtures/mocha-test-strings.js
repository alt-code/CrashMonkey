var CodeParser = require("../lib/CodeParser.js");
var codeparser = require("../lib/code-parser.js");
var code_parser = require("../lib/code_parser.js");

it("getFuncForLine test", function() {
CodeParser.getFuncForLine(0,0);
});

it("getFuncForLine test", function() {
CodeParser.getFuncForLine(0,undefined);
});

var CodeParser = require("undefined/lib/CodeParser.js");
it("getFuncForLine test", function() {
CodeParser.getFuncForLine(0,0);
});
it("getFuncForLine test", function() {
CodeParser.getFuncForLine(0,undefined);
});
it("getFuncForLine test", function() {
CodeParser.getFuncForLine(0,null);
});
it("getFuncForLine test", function() {
CodeParser.getFuncForLine(0,"");
});
it("getFuncForLine test", function() {
CodeParser.getFuncForLine(undefined,0);
});
it("getFuncForLine test", function() {
CodeParser.getFuncForLine(undefined,undefined);
});
it("getFuncForLine test", function() {
CodeParser.getFuncForLine(undefined,null);
});
it("getFuncForLine test", function() {
CodeParser.getFuncForLine(undefined,"");
});
it("getFuncForLine test", function() {
CodeParser.getFuncForLine(null,0);
});
it("getFuncForLine test", function() {
CodeParser.getFuncForLine(null,undefined);
});
it("getFuncForLine test", function() {
CodeParser.getFuncForLine(null,null);
});
it("getFuncForLine test", function() {
CodeParser.getFuncForLine(null,"");
});
it("getFuncForLine test", function() {
CodeParser.getFuncForLine("",0);
});
it("getFuncForLine test", function() {
CodeParser.getFuncForLine("",undefined);
});
it("getFuncForLine test", function() {
CodeParser.getFuncForLine("",null);
});
it("getFuncForLine test", function() {
CodeParser.getFuncForLine("","");
});