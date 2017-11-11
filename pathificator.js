var Pathificator = function(send, gmcp, focusOnInput, toMenu) {
    var exports = {}
    var favorites = JSON.parse(window.localStorage.getItem('favoriteRooms') || "{}"); // a map of roomId -> usage count

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
        if (input.value.length >= 3) {
            getRooms(input.value, function(rooms) {
                roomView.innerHTML = "";
                buildRoomList(input, roomView, rooms);
            });
        }
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

        if (targetRoom in favorites)
            favorites[targetRoom] += 1;
        else
            favorites[targetRoom] = 1;
        window.localStorage.setItem('favoriteRooms', JSON.stringify(favorites));

        xhttp.open("GET", url + "pathFind/" + gmcp.rnum() + "/" + targetRoom, true);
        xhttp.send();
    }

    // rooms is a dict of roomID to roomname
    function buildRoomList(input, out, rooms) {
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
        roomsA.forEach(room => {
            var roomId = room[0];
            var roomName = room[1];
            var visitCount = "" + (room[2] == 0 ? "" : room[2]);
            var item = [];
            var onclickPathfind = function(roomid) { return function() {
                    out.innerHTML = "";
                    pathfind(roomid, input);
                }}(roomId);
            item.push([roomId, onclickPathfind]);
            item.push([roomName, onclickPathfind]);
            item.push([visitCount, onclickPathfind]);
            items.push(item);
        })
        toMenu(out, items);
    }
    return exports;
}
