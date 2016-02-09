/**

This module is the heart of the test case generation intelligence and related hocus pocus

**/
const Util = require("./Util.js");
function permute(arr) {
    if(arr.length <= 0)
        return [];
    var temp = permute(arr.slice(1));
    return Util.joinArrays(arr[0], temp);
}

exports.permute = permute;