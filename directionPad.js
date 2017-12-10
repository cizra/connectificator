var DirectionPad = function(gmcp, send, macros, killificator) {
    var pad = document.getElementById('directionPad');
    var [nw, n, ne, u, w, center, e, mobs, sw, s, se, d] = pad.children;
    var dirs = {
        'nw': nw,
        'ne': ne,
        'se': se,
        'sw': sw,
        'n': n,
        'e': e,
        's': s,
        'w': w,
        'u': u,
        'd': d,
        'center': center,
        'mobs': mobs
    }

    for (var d in dirs)
        dirs[d].onclick = function(cmd) {
            return function() { send(macros.openDoorAndGo(cmd)) }
        }(d);
    dirs['mobs'].onclick = function(cmd) {
        killificator.go();
    }

    gmcp.handle("room.mobs", function(rm) {
        dirs['mobs'].innerText = rm.length <= 9 ? rm.length : '∞';
        if (rm.length > 0)
            dirs['mobs'].classList.add('active');
        else
            dirs['mobs'].classList.remove('active');
    });

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

        var exits = ri['exits'];
        for (var e in exits)
            present[e] = true;

        for (var e in present) {
            if (present[e])
                dirs[e].classList.add('active');
            else
                dirs[e].classList.remove('active');
        }
    })
}
