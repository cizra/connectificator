Triggers = function(send, ui) {
    var exports = {};

    // ordered list of pairs (regex, action)
    var triggers = function() {
        var out = [];
        var tmptrg = JSON.parse(window.localStorage.getItem('triggers') || "[]");
        function fix(str) {
            str = str.substr(1, str.length - 2) // get rid of the / in /search/
            return RegExp(str)
        }
        tmptrg.forEach(t => out.push([fix(t[0]), t[1]]))
        return out
    }()

    function save() {
        var out = [];
        triggers.forEach(t => out.push([t[0].toString(), t[1]]))
        console.log("Serializing", out)
        window.localStorage.setItem('triggers', JSON.stringify(out))
    }

    exports.add = function(index, regex, action) {
        triggers.splice(index, 0, [RegExp(regex), action])
        save()
    }

    exports.rm = function(index) {
        triggers.splice(index, 1)
        save()
    }

    exports.run = function(mudstr) {
        for (i in triggers) {
            if (mudstr.match(triggers[i][0])) {
                send(triggers[i][1]) // TODO triggers executing code
                return
            }
        }
    }

    exports.get = function() {
        return triggers
    }

    function trgEdit(id) {
        document.createElement('div')
        if (id === undefined) {
            console.log("add new trigger")
        } else {
            console.log("Change ", triggers[id])
        }
        ui.popup("Edit trigger", [])
    }

    exports.draw = function() {
        var drawMe = [];
        drawMe.push([["New", trgEdit]]);
        for (i in triggers) {
            var j = i;
            function pushOneTrg(j) {
                var trg = triggers[j];
                drawMe.push([[trg[0], ()=>trgEdit(j)], [trg[1], ()=>trgEdit(j)]])
            };
            pushOneTrg(i)
        }
        ui.toMenu(drawMe)
    }

    return exports
}
 
