(function () {
    module.exports = function () {
        something();
    };
    
    module.exports.abc = function (abc) {
        def();
    };
    
    function someFunc() {
        doThis();
        if (yes)
            doThat();
    }
    
    module.exports.someFunc = someFunc;
})();