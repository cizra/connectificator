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
        function unHtml(str) {
            var parser = new DOMParser().parseFromString(mudstr, "text/html");
            return parser.documentElement.textContent;
        }

        for (i in triggers) {
            var str = unHtml(mudstr);
            console.debug("Trigger match", JSON.stringify(str), triggers[i][0]);
            var regex = triggers[i][0];
            var response = triggers[i][1];
            var result = regex.exec(str);
            if (result) {
                response = exports.substituteMatches(response, result);
                send(response) // TODO triggers executing code
                return
            }
        }
    }

    exports.substituteMatches = function(str, matches) {
        for (var i = 0; i < matches.length; ++i) {
            str = str.replace(RegExp("%" + i, "g"), matches[i]);
        }
        return str;
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
            try {
                if (id === undefined)
                    triggers.push([RegExp(match.value), action.value]);
                else
                    triggers[id] = [RegExp(match.value), action.value];
            } catch (e) {
                if (e instanceof SyntaxError) {
                    alert(e);
                    return;
                }
                throw e;
            }
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
 
