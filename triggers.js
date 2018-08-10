Triggers = function(send, ui, onProfileAdded) {
    var exports = {};
    var profile = init();
    exports.getProfile = function() { return profile; };
    var triggers = [];  // ordered list of pairs (regex, action) -- current profile
    var defaultTriggers = [];  // ordered list of pairs (regex, action) -- these match across all profiles

    function deserialize(str) {
        str = str.substr(1, str.length - 2); // drop surrounding /
        return RegExp(str);
    }

    function init() {
      var hash = window.location.hash.substr(1);
      if (hash === '')
          return 'default';
      return hash;
    }

    function read() {
        var profiles = JSON.parse(window.localStorage.getItem('triggers') || "{}");
        if (!("default" in profiles))
            profiles["default"] = []
        if (!(profile in profiles))
            profiles[profile] = []
        return profiles;
    }

    function load() {
        var out = profile == 'default' ? defaultTriggers : triggers;
        out.length = 0;
        var profiles = read();
        profiles[profile].forEach(t => out.push([deserialize(t[0]), t[1]]))
        onProfileAdded(Object.keys(profiles));
    }
    load();

    function save() {
        var out = [];
        var trg = profile == 'default' ? defaultTriggers : triggers;
        trg.forEach(t => out.push([t[0].toString(), t[1]]));
        var profiles = read();
        profiles[profile] = out;
        window.localStorage.setItem('triggers', JSON.stringify(profiles))
        onProfileAdded(Object.keys(profiles));
    }

    exports.run = function(mudstr) {
        function unHtml(str) {
            var parser = new DOMParser().parseFromString(mudstr, "text/html");
            return parser.documentElement.textContent;
        }

        function match(trg) {
            for (i in trg) {
                var str = unHtml(mudstr);
                // console.debug("Trigger match", JSON.stringify(str), trg[i][0]);
                var regex = trg[i][0];
                var response = trg[i][1];
                var result = regex.exec(str);
                if (result) {
                    response = exports.substituteMatches(response, result);
                    send(response) // TODO triggers executing code
                    return true;
                }
            }
        }
        match(triggers) || match(defaultTriggers);
    }

    exports.substituteMatches = function(str, matches) {
        for (var i = 0; i < matches.length; ++i) {
            str = str.replace(RegExp("%" + i, "g"), matches[i]);
        }
        return str;
    }

    function trgEdit(id) {
        var trg = profile == 'default' ? defaultTriggers : triggers;
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
            match.value = toS(trg[id][0]);
            action.value = trg[id][1];
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
                    trg.push([RegExp(match.value), action.value]);
                else
                    trg[id] = [RegExp(match.value), action.value];
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
                trg.splice(id, 1);
                save();
                ui.dismissPopup();
            }
            elems.push(delBtn);
        }
        elems.push(helplink);
        ui.popup("Edit trigger", elems);
        match.focus();
    }

    function btn(label, cb) {
        var input = document.createElement('input');
        input.type = 'button';
        input.value = label;
        input.onclick = cb;
        return input;
    }

    exports.getProfiles = function() {
        var saved = read();
        return Object.keys(saved);
    }

    function populateProfiles(select) {
        select.innerHTML = "";
        var saved = read();
        var profiles = Object.keys(saved);
        profiles.forEach(function(p) {
            var option = document.createElement('option');
            option.selected = p === profile;
            option.text = p;
            if (p === 'default')
                select.add(option, 1);
            else
                select.add(option);
        });
    }

    function editProfiles() {
        ui.clearStuff();

        var newProfile = document.createElement('input')
        newProfile.type = 'text'
        var closeBtn = btn('Close', ui.dismissPopup);
        var select = document.createElement('select')
        select.style.display = 'inline';
        populateProfiles(select);
        var addBtn = btn('Add', function() {
            profile = newProfile.value;
            var trgs = profile == 'default' ? defaultTriggers : triggers;
            trgs.length = 0;
            var profiles = read();
            if (!(profile in profiles)) {
                profiles[profile] = [];
                var option = document.createElement('option');
                option.text = profile;
                select.add(option);
                save();
                populateProfiles(select);
            }
        });
        addBtn.style.display = 'inline';

        var deleteBtn = btn('Delete', function() {
            var saved = read();
            delete saved[select.value];
            profile = "default";
            load(); // in case we're deleting the active profile

            // save() merges
            var profiles = read();
            delete profiles[select.value];
            window.localStorage.setItem('triggers', JSON.stringify(profiles))

            populateProfiles(select);
        });
        deleteBtn.style.display = 'inline';
        select.onchange = function() {
            deleteBtn.disabled = select.value === 'default'
        }
        select.onchange();

        newProfile.oninput = function () {
            addBtn.disabled = !newProfile.value;
        }
        newProfile.oninput();
        newProfile.style.display = 'inline';

        var deleteRow = document.createElement('span');
        var addRow = document.createElement('span');
        addRow.appendChild(newProfile);
        addRow.appendChild(addBtn);
        addRow.style.display = 'block';
        deleteRow.appendChild(select);
        deleteRow.appendChild(deleteBtn);
        deleteRow.style.display = 'block';

        var elems = [deleteRow, addRow, closeBtn];
        ui.popup("Add/remove trigger profiles", elems);
    }

    function drawTriggerProfilesSelect() {
        var drawMe = [];

        var select = document.createElement('select');
        populateProfiles(select);

        var editOption = document.createElement('option');
        editOption.text = '<edit>';
        select.add(editOption, 0);

        select.onchange = function(e) {
            if (select.value == '<edit>') {
                editProfiles();
                return;
            }
            // previous profile got saved when last edited
            profile = select.value;
            load();
            exports.draw();
        }
        drawMe.push([["New", ()=>trgEdit()], [select]]);
        ui.toMenu(drawMe)
    }

    exports.draw = function() {
        drawTriggerProfilesSelect();
        var drawMe = [];
        var trgs = profile == 'default' ? defaultTriggers : triggers;
        for (i in trgs) {
            var j = i;
            function pushOneTrg(j) {
                var trg = trgs[j];
                function toS(r) {
                    var s = r.toString();
                    return s.substr(1, s.length - 2);
                }
                drawMe.push([[toS(trg[0]), ()=>trgEdit(j)], [trg[1], ()=>trgEdit(j)]])
            };
            pushOneTrg(i)
        }
        ui.toMenu(drawMe, true)
    }

    return exports
}
 
