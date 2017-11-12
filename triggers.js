Triggers = function(send, ui) {
    var exports = {};

    function deserialize(str) {
        str = str.substr(1, str.length - 2); // drop surrounding /
        return RegExp(str);
    }

    // ordered list of pairs (regex, action)
    var triggers = function() {
        var out = [];
        var tmptrg = JSON.parse(window.localStorage.getItem('triggers') || "[]");
        tmptrg.forEach(t => out.push([deserialize(t[0]), t[1]]))
        return out
    }()

    function save() {
        var out = [];
        triggers.forEach(t => out.push([t[0].toString(), t[1]]));
        window.localStorage.setItem('triggers', JSON.stringify(out))
    }

    exports.run = function(mudstr) {
        for (i in triggers) {
            console.debug("Trigger match", JSON.stringify([mudstr, triggers[i][0].toString()]))
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
        ui.clearStuff();
        var helplink = document.createElement('a')
        var helptext = document.createTextNode("Help")
        helplink.href = 'https://www.regextester.com/jssyntax.html'
        helplink.appendChild(helptext)
        var match = document.createElement('input')
        var action = document.createElement('input')
        if (!(id === undefined)) {
            function toS(r) {
                var s = r.toString();
                return s.substr(1, s.length - 2);
            }
            match.value = toS(triggers[id][0]);
            action.value = triggers[id][1];
        }
        var saveBtn = document.createElement('input')
        var cancelBtn = document.createElement('input')
        match.type = 'text'
        action.type = 'text'
        match.oninput = action.oninput = function () {
            saveBtn.disabled = !(match.value && action.value);
        }
        action.oninput();
        action.type = 'text'
        saveBtn.type = 'submit'
        cancelBtn.type = 'submit'
        saveBtn.value = 'Save'
        cancelBtn.value = 'Cancel'
        cancelBtn.onclick = ui.dismissPopup
        saveBtn.onclick = function() {
            if (id === undefined)
                triggers.push([RegExp(match.value), action.value]);
            else
                triggers[id] = [RegExp(match.value), action.value];
            save();
            ui.dismissPopup();
        }
        function txt(s) {
            return document.createTextNode(s)
        }

        var elems = [txt("Match:"), match, txt("Action:"), action, saveBtn, cancelBtn];
        if (!(id === undefined)) {
            var delBtn = document.createElement('input');
            delBtn.type = 'submit';
            delBtn.value = 'Delete';
            delBtn.onclick = function() {
                triggers.splice(id, 1);
                save();
                ui.dismissPopup();
            }
            elems.push(delBtn);
        }
        elems.push(helplink);
        ui.popup("Edit trigger", elems);
        match.focus();
    }

    exports.draw = function() {
        var drawMe = [];
        drawMe.push([["New", ()=>trgEdit()]]); // lose the mouseevent
        for (i in triggers) {
            var j = i;
            function pushOneTrg(j) {
                var trg = triggers[j];
                function toS(r) {
                    var s = r.toString();
                    return s.substr(1, s.length - 2);
                }
                drawMe.push([[toS(trg[0]), ()=>trgEdit(j)], [trg[1], ()=>trgEdit(j)]])
            };
            pushOneTrg(i)
        }
        ui.toMenu(drawMe)
    }

    return exports
}
 
