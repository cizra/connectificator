var Killificator = function(send, gmcp) {
    var exports = {};
    exports.go = function() {
        var room = gmcp.gmcp()['room'];
        if (!('mobs' in room))
            return;
        var mobs = room['mobs'];
        // TODO: pick the nearest mob by level
        if (mobs.length == 0)
            return;
        // the MUD already sorts by nearest level
        // mobs.sort((a, b) => b['level'] - a['level']);
        send("k " + mobs[0].name);
    }
    return exports;
}
