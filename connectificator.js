function addGmcpHandlers() {
    /*
    Gmcp.handle("room.info", function() {
        console.log("In room " + Gmcp.gmcp()['room']['info']['num']);
    });
    */
}

function changelog() {
    var changes = [
        "Triggers are now parametric. For example,\n^(.+) says, \"(.+)\"$\n'%2 %2 yourself, you %1\nNicodemus the old fisherman says, \"hi\"\nYou say, \"hi hi yourself, you Nicodemus the old fisherman\"",
        "Added option to clear command line.",
        "Triggers are here!",
        "Pathificator now displays favorite rooms",
        "Start typing anywhere and the input field gets focus.",
        "Pathificator now remembers favorite rooms and displays them on the top of the list.",
        "Keypad navigation! Use your numeric keypad, with NumLock \"on\", to walk the world. Plus and Minus go down and up. 5 issues the \"look\" command.",
        "Basic working client"
    ]
    var version = changes.length
    var oldVersion = parseInt(window.localStorage.getItem('version')) || 0
    console.assert(version >= oldVersion)
    var changelog = "Changelog:\n"
    for (i = 0; i < version - oldVersion; ++i)
        changelog += "\nv" + (version - i) + ":\n" + changes[i] + '\n'
    if (changelog != "Changelog:\n")
        alert(changelog)
    window.localStorage.setItem('version', version)
}

function loadOptions() {
    options = JSON.parse(window.localStorage.getItem('options') || "{}");
    function save() {
        window.localStorage.setItem('options', JSON.stringify(options));
    }

    var clearCommandBtn = document.getElementById('clearCommand');
    clearCommandBtn.value = 'clearCommand' in options ? (options['clearCommand'] ? 'On' : 'Off') : 'Off';
    clearCommandBtn.onclick = function() {
        if ('clearCommand' in options)
            options['clearCommand'] = !options['clearCommand'];
        else
            options['clearCommand'] = true; // the default being Off
        save();
        loadOptions();
    }
    return options;
}

// expose to console
var triggers = null;
var gmcp = null;
var pathificator = null;

function start() {
    var ui = null;
    var options = loadOptions();
    function send(text) {
        if (text[0] == ';')
            text = text.slice(1);
        else
            text = text.replace(/;/g, "\n");
        socket.send(text + "\n");
        text.split(/\n/).forEach(function(line) {
            ui.output('⇨' + line + '\n');
        });
        ui.blit();
    }
    gmcp = Gmcp();
    ui = Ui(options, send);
    /* var */ triggers = Triggers(send, ui);
    function onMudOutput(str) {
        ui.output(str, triggers.run)
    }
    var socket = Socket(onMudOutput, ui.blit, gmcp);
    pathificator = Pathificator(send, gmcp, ui);
    addGmcpHandlers();
    document.getElementById('triggersBtn').onclick = function() { triggers.draw() }
    window.onkeypress = function() {
        if (document.activeElement.tagName != "INPUT")
            ui.focusOnInput();
        return true;
    };

    changelog();
}
