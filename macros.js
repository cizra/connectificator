var Macros = function(send) {
    var exports = {};

    var macros = {
         96: function() {send("d")},
         97: function() {send("sw")},
         98: function() {send("s")},
         99: function() {send("se")},
        100: function() {send("w")},
        101: function() {send("u")},
        102: function() {send("e")},
        103: function() {send("nw")},
        104: function() {send("n")},
        105: function() {send("ne")},
        107: function() {send("d")},
        109: function() {send("u")}
    }

    exports.run = function(keyCode) {
        if (keyCode in macros) {
            macros[keyCode]();
            return true;
        }
        return false;
    }

    return exports;
}
