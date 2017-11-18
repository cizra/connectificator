var Pathificator = function(send, gmcp, ui) {
    var exports = {}
    var input = document.getElementById('pInput')
    var favorites = JSON.parse(window.localStorage.getItem('favoriteRooms') || "{}"); // a map of roomId -> usage count
    var map = JSON.parse(window.localStorage.getItem('map') || "{}");
    if (!('rooms' in map))
        map['rooms'] = {}

    function save() {
        window.localStorage.setItem('map', JSON.stringify(map))
    }
    gmcp.handle("room.info", function(ri) {
        var id = ri.num;
        var copy = {};
        if (!(id in map['rooms'])) {
            for (var key in ri) {
                if (key != 'num')
                    copy[key] = ri[key];
            }
            map['rooms'][id] = copy;
            save()
        }
    });

    input.onclick = function() {
        var idToName = {};
        for (var id in favorites) {
            if (id in map['rooms'])
                idToName[id] = map['rooms'][id]['name']
        }
        buildRoomList(idToName)
        input.select()
    };
    input.oninput = function() { exports.findRoom() };

    var url = function() {
        var parser = document.createElement('a');
        parser.href = window.location.href;
        var port = "";
        if (parser.port)
            port = ":" + parser.port;
        // console.log(parser.protocol + "//" + parser.hostname + port + "/");
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

    exports.findRoom = function() {
        if (input.value.length >= 3) {
            getRooms(input.value, function(rooms) {
                ui.clearStuff()
                buildRoomList(rooms);
            });
        }
    }

    function pathfind(targetRoom) {
        var xhttp = new XMLHttpRequest();
        var start_time = new Date().getTime();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                ui.focusOnInput();
                send(this.responseText);
                input.value = "Found in " + (new Date().getTime() - start_time) + "ms";
            }
        };

        if (targetRoom in favorites)
            favorites[targetRoom] += 1;
        else
            favorites[targetRoom] = 1;
        window.localStorage.setItem('favoriteRooms', JSON.stringify(favorites));

        xhttp.open("GET", url + "pathFind/" + gmcp.rnum() + "/" + targetRoom, true);
        xhttp.send();
    }

    // rooms is a dict of roomID to roomname
    function buildRoomList(rooms) {
        // preprocess rooms into an array sorted by count of visits
        var roomsA = [];
        for (var id in rooms)
            roomsA.push([
                    id,
                    rooms[id],
                    id in favorites ? favorites[id] : 0,  // first, for easy sorting
            ]); // name
        roomsA.sort((a, b) => 
                a[2] - b[2] ? b[2] - a[2]
                : (a[0] - b[0] ? a[0] - b[0]
                    : a[1] - b[1])
        );

        var items = [];
        items.push([["Cancel", ui.clearStuff]]);
        roomsA.forEach(room => {
            var roomId = room[0];
            var roomName = room[1];
            var visitCount = "" + (room[2] == 0 ? "" : room[2]);
            var item = [];
            var onclickPathfind = function(roomid) { return function() {
                    ui.clearStuff();
                    pathfind(roomid);
                }}(roomId);
            item.push([roomId, onclickPathfind]);
            item.push([roomName, onclickPathfind]);
            item.push([visitCount, onclickPathfind]);
            items.push(item);
        })
        ui.toMenu(items);
    }

    return exports;
}
