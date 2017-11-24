var Macros = function(send) {
    var exports = {};

    var macros_backup = {
         "Numpad0": "numpad0",
         "Numpad1": "sw",
         "Numpad2": "s",
         "Numpad3": "se",
        "Numpad4": "w",
        "Numpad5": "numpad5",
        "Numpad6": "e",
        "Numpad7": "nw",
        "Numpad8": "n",
        "Numpad9": "ne",
        "NumpadMultiply": "numpadMultiply",
        "NumpadAdd": "d",
        "NumpadSubtract": "u",
        "NumpadDecimal": "numpadDecimal",
        "NumpadDivide": "numpadDivide",
        "F1": "macroF1",
        "F2": "macroF2",
        "F3": "macroF3",
        "F4": "macroF4",
        "F5": "macroF5",
        "F6": "macroF6",
        "F7": "macroF7",
        "F8": "macroF8",
        "F9": "macroF9",
        "F10": "macroF10",
        "F11": "macroF11",
        "F12": "macroF12"
    }
    var macros = {};

    var reverse_mapping = {
        'sw': "Numpad1",
        's': "Numpad2",
        'se': "Numpad3",
        'w': "Numpad4",
        'e': "Numpad6",
        'nw': "Numpad7",
        'n': "Numpad8",
        'ne': "Numpad9",
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

    function run(code) {
        if (code in macros) {
            send(macros[code]);
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
