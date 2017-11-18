var Ui = function(options, send) {
    var exports = {};
    var outS = []; // line-split view of screen, bounded by vertical size
    var inputf = document.getElementById('inputfield');
    var outputf = document.getElementById('output');
    var stuffList = document.getElementById('stuffList');
    var ansi_up = new AnsiUp;
    winHeight = parseInt(document.defaultView.getComputedStyle(document.body)['height'].replace("px", ""));
    lineHeight = parseInt(document.defaultView.getComputedStyle(outputf, null)['line-height'].replace("px", ""));
    var page = Math.floor(winHeight / lineHeight) + 1;
    var maxlen = page * 10;
    var commandHistory = [];
    var commandHistoryIdx = 0;

    exports.blit = function() {
        outputf.innerHTML = outS.join('');
        // Only scroll if the user isn't reading backlog
        if (inputf === document.activeElement)
            output.scrollTop = output.scrollHeight;
    };

    function capOutput() {
        outS = outS.slice(Math.max(0, outS.length - maxlen));
    };

    exports.output = function(mudstr, runTriggers) {
        mudstr = mudstr.replace(/\r/g, "");
        mudstr = ansi_up.ansi_to_html(mudstr);
        var split = mudstr.split(/\n/);
        var line = split.shift();
        outS.push(line);
        if (runTriggers)
            runTriggers(line);
        split.forEach(function(line){
            outS.push('\n' + line);
            if (runTriggers)
                runTriggers(line);
        });
        capOutput();
    };

    exports.macros = {
         96: function() {send("d")},
         97: function() {send("sw")},
         98: function() {send("s")},
         99: function() {send("se")},
        100: function() {send("w")},
        101: function() {send("u")},
        102: function() {send("e")},
        103: function() {send("nw")},
        104: function() {send("n")},
        105: function() {send("ne")},
        107: function() {send("d")},
        109: function() {send("u")}
    }

    inputf.onkeydown = function(e) {
        if (e.key == "Enter") {
            onEnter();
        } else if (e.key == "ArrowUp") {
            onArrowUp();
        } else if (e.key == "ArrowDown") {
            onArrowDown();
        } else if (e.keyCode in exports.macros) {
            exports.macros[e.keyCode]();
        } else { // not handled, pass control to the control
            return;
        }
        e.preventDefault();
    }

    function onEnter() {
        commandHistory.push(inputf.value);
        commandHistoryIdx = 0;
        send(inputf.value);
        if ('clearCommand' in options && options['clearCommand'])
            inputf.value = '';
        else
            inputf.select();
    }

    function onArrowUp() {
        if (window.getSelection().type == 'Caret') { // the user typed a partial command
            for (var i = commandHistory.length; i --> 0;) {
                if (commandHistory[i].substr(0, inputf.value.length) == inputf.value) {
                    commandHistoryIdx = commandHistory.length - i - 1;
                    inputf.value = commandHistory[i];
                    inputf.select();
                    return;
                }
            }
        }
        commandHistoryIdx = Math.min(commandHistoryIdx + 1, commandHistory.length - 1);
        inputf.value = commandHistory[commandHistory.length - commandHistoryIdx - 1];
        inputf.select();
    }

    function onArrowDown() {
        commandHistoryIdx = Math.max(commandHistoryIdx - 1, 0);
        inputf.value = commandHistory[commandHistory.length - commandHistoryIdx - 1];
        inputf.select();
    }

    exports.focusOnInput = function() {
        inputf.focus();
    }

    exports.popup = function(title, elems) {
        var h1 = document.createElement('h1');
        h1.appendChild(document.createTextNode(title));
        var p = document.getElementById('popup');
        p.innerHTML = "";
        p.appendChild(h1);
        elems.forEach(e => p.appendChild(e))
        p.style.display = 'block'
    }

    exports.dismissPopup = function() {
        document.getElementById('popup').style.display = 'none'
    }

    // Takes an array of rows, where a row consists of items: [text, (optional callback)]
    exports.toMenu = function(array) {
        exports.clearStuff();
        var _li_ = document.createElement('li');
        var _div_ = document.createElement('div');

        for (var i in array) {
            var rowIn = array[i];
            var rowOut = _li_.cloneNode(false);
            for (var item in array[i]) {
                var cellOut = _div_.cloneNode(false);
                cellOut.appendChild(document.createTextNode(array[i][item][0])); /* escapes any possible HTML */
                if (array[i][item].length == 2)
                    cellOut.onclick = array[i][item][1];
                rowOut.appendChild(cellOut);
            }
            stuffList.appendChild(rowOut);
        }
    }

    exports.clearStuff = () => stuffList.innerHTML = "";

    inputf.select();
    return exports;
};
