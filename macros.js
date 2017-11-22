var Macros = function(send) {
    var exports = {};

    var macros = {
         96: function() {send("numpad0")},
         97: function() {send("sw")},
         98: function() {send("s")},
         99: function() {send("se")},
        100: function() {send("w")},
        101: function() {send("numpad5")},
        102: function() {send("e")},
        103: function() {send("nw")},
        104: function() {send("n")},
        105: function() {send("ne")},
        106: function() {send("numpadMultiply")},
        107: function() {send("numpadAdd")},
        109: function() {send("numpadSubtract")},
        110: function() {send("numpadDecimal")},
        111: function() {send("numpadDivide")},
        112: function() {send("macroF1")},
        113: function() {send("macroF2")},
        114: function() {send("macroF3")},
        115: function() {send("macroF4")},
        116: function() {send("macroF5")},
        117: function() {send("macroF6")},
        118: function() {send("macroF7")},
        119: function() {send("macroF8")},
        120: function() {send("macroF9")},
        121: function() {send("macroF10")},
        122: function() {send("macroF11")},
        123: function() {send("macroF12")}
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
