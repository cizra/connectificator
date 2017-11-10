var Pathificator = function(send, gmcp, focusOnInput) {
    var exports = {}

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

    var _li_ = document.createElement('li');
    var _div_ = document.createElement('div');

    function buildRoomList(input, out, rooms) {
        for (var id in rooms) {
            var row = _li_.cloneNode(false);
            row.onclick = function(id) { return function() {
                out.innerHTML = "";
                pathfind(id, input);
            }}(id)
            var cellId = _div_.cloneNode(false);
            cellId.appendChild(document.createTextNode(id)); /* escapes any possible HTML */
            var cellName = _div_.cloneNode(false);
            cellName.appendChild(document.createTextNode(rooms[id]));
            row.appendChild(cellId);
            row.appendChild(cellName);
            out.appendChild(row);
        }
    }
    return exports;
}
