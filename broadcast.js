"use strict";
// idea from https://stackoverflow.com/questions/28230845/communication-between-tabs-or-windows
//
// use local storage for messaging. Set message in local storage and clear it right away
// This is a safe way how to communicate with other tabs while not leaving any traces

function broadcast(localStorage, to, message) {
    localStorage.setItem('broadcast', JSON.stringify({"to": to, "send": message}));
    localStorage.removeItem('broadcast');
}

// receive message
function receive_broadcast(ev, me, send) {
    if (ev.key !== 'broadcast') {
        return; // ignore other keys
    }
    var blob = JSON.parse(ev.newValue);
    if (!blob) {
        return; // ignore empty msg or msg reset
    }

    if (!(blob.to === me || blob.to === 'all')) {
        return;
    }

    // can add different actions here
    if (blob.send !== undefined) {
        send(blob.send);
    }
}
