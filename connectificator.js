function addGmcpHandlers() {
  /*
    Gmcp.handle("room.info", function() {
        console.log("In room " + Gmcp.gmcp()['room']['info']['num']);
    });
    */
}

function changelog() {
  var migrations = {};
  migrations[13] = function() {
    var trgJs = window.localStorage.getItem('triggers');
    var trg = [];
    if (trgJs !== null) {
      var trg = JSON.parse(trgJs);
    }
    window.localStorage.setItem('triggers', JSON.stringify({"default": trg}));
  }
  var changes = [
    "Added stat bars",
    "Added time to comm log",
    "Triggers can now be saved mudside. The save is encrypted in browser.",
    "Added a pause button",
    "Trigger profiles can how be autoloaded through hash: bookmark https://sneezymud.org#mage for `mage` profile",
    "Added sending commands to other characters: `#cleric h` executes `h` in all profiles named `cleric`",
    "Added command repeat: #5 'hi executes 'hi five times",
    "Triggers in the default trigger profile now match for all profiles.",
    "Added Killificator -- press / on Numpad or tap the number for great fun.",
    "Added trigger profiles.",
    "Direction pad and numpad automagically open doors now.",
    "Direction pad is clicable, for playing on phones",
    "Direction pad",
    "Comm log subwindow",
    "Added command history.\nType a command. Type lots of other commands. Then type the beginning of an old command and smash ArrowUp key -- it'll find and complete it.",
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
  for (i = oldVersion; i < version; ++i) {
    if (i in migrations)
      migrations[i]();
    changelog += "\nv" + i + ":\n" + changes[changes.length - i - 1] + '\n'
  }
  if (oldVersion > 0 && changelog != "Changelog:\n")
    alert(changelog)
  window.localStorage.setItem('version', version)
}

var ui = null;

function loadOptions() {
  var options = JSON.parse(window.localStorage.getItem('options') || "{}");
  options.save = function() {
    window.localStorage.setItem('options', JSON.stringify(options));
  }

  let toggles = {"clearCommand": false, "statBarsOn": true};
  function loadToggle(toggle, defaultSetting) {
    options[toggle] = options[toggle] !== undefined ? options[toggle] : defaultSetting;
    var toggleButton = document.getElementById(toggle);
    toggleButton.value = toggle in options ? (options[toggle] ? 'On' : 'Off') : defaultSetting ? 'On' : 'Off';
    toggleButton.onclick = function() {
      if (toggle in options)
        options[toggle] = !options[toggle];
      else
        options[toggle] = defaultSetting;
      options.save();
      location.reload(); // force reread everything. Easier than cleaning up. Running start() might initialize something twice.
    }
  };
  for (key in toggles)
    loadToggle(key, toggles[key]);

  var commLogOptions = document.getElementById('commLogOptions');
  commLogOptions.onclick = function() {
    ui.commLogOptions();
  };
  return options;
}

function handleCmd(text, send, profiles) {
  console.assert(text[0] == '#');
  var cmd = text.substr(1, text.indexOf(' ') - 1);
  var arg = text.substr(text.indexOf(' ') + 1);

  if (!isNaN(cmd)) {
    for (var i = parseInt(cmd); i --> 0;)
      send(arg);
  } else if (cmd == 'all' || profiles.indexOf(cmd) != -1) {
    broadcast(window.localStorage, cmd, arg);
    if (cmd == 'all')
      send(arg);
  } else {
    ui.output('⇨' + text + '\n');
    ui.output('⇨' + "Unknown command. Supported commands are:\n#5 to repeat commands\n#profile to send commands across windows\n");
    ui.blit();
  }
}

// expose to console
var triggers = null;
var gmcp = null;
var pathificator = null;
let options = null;

function start() {
  options = loadOptions();
  var profiles = [];
  function send(text) {
    if (text[0] == ';') {
      text = text.slice(1);
    } else {
      texts = text.split(';')
      if (texts.length > 1) {
        texts.forEach((s) => send(s));
        return;
      }
    }

    if (text.startsWith('#')) {
      handleCmd(text, send, profiles);
      return;
    }

    socket.send(text + "\n");
    text.split(/\n/).forEach(function(line) {
      ui.output('⇨' + line + '\n');
    });
    ui.blit();
  }

  // start modlules
  gmcp = Gmcp();
  var killificator = Killificator(send, gmcp);
  var macros = Macros(send, killificator);
  ui = Ui(options, send, gmcp, macros);
  function onProfileAdded(newProfiles) {
    profiles.length = 0;
    newProfiles.forEach((p) => profiles.push(p));
  }
  function onMudOutput(str) {
    ui.output(str, triggers.run)
  }
  var socket = Socket(onMudOutput, ui.blit, gmcp);
  var triggers = Triggers(send, ui, onProfileAdded, gmcp.handle, socket.gmcpSend);
  let statbars = StatBars(gmcp, options);
  pathificator = Pathificator(send, gmcp, ui);
  directionPad = DirectionPad(gmcp, send, macros, killificator);
  addGmcpHandlers();
  document.getElementById('triggersBtn').onclick = function() { triggers.draw() }

  window.onstorage = (ev) => receive_broadcast(ev, triggers.getProfile(), send);

  changelog();
}

window.onload = start;
