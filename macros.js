var Macros = function(send) {
    var exports = {};

    var macros_backup = {
         96: "numpad0",
         97: "sw",
         98: "s",
         99: "se",
        100: "w",
        101: "numpad5",
        102: "e",
        103: "nw",
        104: "n",
        105: "ne",
        106: "numpadMultiply",
        107: "d",
        109: "u",
        110: "numpadDecimal",
        111: "numpadDivide",
        112: "macroF1",
        113: "macroF2",
        114: "macroF3",
        115: "macroF4",
        116: "macroF5",
        117: "macroF6",
        118: "macroF7",
        119: "macroF8",
        120: "macroF9",
        121: "macroF10",
        122: "macroF11",
        123: "macroF12"
    }
    var macros = {};

    var reverse_mapping = {
        'sw': 97,
        's': 98,
        'se': 99,
        'w': 100,
        'e': 102,
        'nw': 103,
        'n': 104,
        'ne': 105,
        'd': 107,
        'u': 109
    }

    for (var k in macros_backup)
        macros[k] = macros_backup[k];

    function openDoorAndGo(dir) {
        return macros[reverse_mapping[dir]];
    }

    gmcp.handle("room.info", function(ri) {
        var present = {
            'nw': false,
            'ne': false,
            'se': false,
            'sw': false,
            'n': false,
            'e': false,
            's': false,
            'w': false,
            'u': false,
            'd': false
        }

        for (var e in ri['exit_kw'])
            present[e] = true;

        for (var e in present) {
            if (present[e])
                macros[reverse_mapping[e]] = 'open ' + ri['exit_kw'][e] + ' ' + e + ';' + e;
            else
                macros[reverse_mapping[e]] = macros_backup[reverse_mapping[e]];
        }
    });

    function run(keyCode) {
        if (keyCode in macros) {
            send(macros[keyCode]);
            return true;
        }
        return false;
    }

    exports.run = run;
    exports.macros = macros;
    exports.reverse_mapping = reverse_mapping
    exports.openDoorAndGo = openDoorAndGo
    return exports;
}
