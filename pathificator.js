var Pathificator = function(send, gmcp, focusOnInput, toMenu) {
    var exports = {}
    var favorites = JSON.parse(window.localStorage.getItem('favoriteRooms') || "[]");

    var url = function() {
        var parser = document.createElement('a');
        parser.href = window.location.href;
        // replace port with 8000, if it's unset
        var port = ":8000";
        if (parser.port)
            port = ":" + parser.port;
        console.log(parser.protocol + "//" + parser.hostname + port + "/");
        return parser.protocol + "//" + parser.hostname + port + "/";
    }()

    function getRooms(name, callback) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                // { roomid: roomname }
                callback(JSON.parse(this.responseText));
            }
        };
        xhttp.open("GET", url + "findRoom/" + name, true);
        xhttp.send();
    }

    exports.findRoom = function(input, roomView) {
        getRooms(input.value, function(rooms) {
            roomView.innerHTML = "";
            buildRoomList(input, roomView, rooms);
        });
    }

    function pathfind(targetRoom, input) {
        var xhttp = new XMLHttpRequest();
        var start_time = new Date().getTime();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                focusOnInput();
                send(this.responseText);
                input.value = "Found in " + (new Date().getTime() - start_time) + "ms";
            }
        };
        xhttp.open("GET", url + "pathFind/" + gmcp.rnum() + "/" + targetRoom, true);
        xhttp.send();
    }

    // rooms is a dict of roomID to roomname
    function buildRoomList(input, out, rooms) {
        var items = [];
        for (var id in rooms) {
            var item = [];
            var onclick = function(roomid) { return function() {
                    out.innerHTML = "";
                    pathfind(roomid, input);
                }}(id);
            item.push([id, onclick]);
            item.push([rooms[id], onclick]);
            items.push(item);
        }
        toMenu(out, items);
    }
    return exports;
}
