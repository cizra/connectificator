var DirectionPad = function(gmcp) {
    var pad = document.getElementById('directionPad');
    var [nw, n, ne, u, w, center, e, empty, sw, s, se, d] = pad.children;
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
        'empty': empty // TODO show something fun like presence of mobs or something
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
