var StatBars = function(gmcp) {
    gmcp.handle("char.vitals", onVitals);

    let bars = {};
    bars.hp = document.getElementById('hpBar');
    bars.mana = document.getElementById('manaBar');
    bars.move = document.getElementById('moveBar');
    bars.piety = document.getElementById('pietyBar');
    bars.lifeforce = document.getElementById('lifeforceBar');
    bars.tnl = document.getElementById('tnlBar');
    bars.enemy = document.getElementById('enemyBar');
    bars.tankHp = document.getElementById('tankHpBar');

    let prev = {};
    prev.hp = 0;
    prev.mana = 0;
    prev.move = 0;
    prev.piety = 0;
    prev.lifeforce = 0;
    prev.tnl = 0;
    prev.enemy = 0;
    prev.tankHp = 0;

    function onVitals(val) {
        if (val.hp != prev.hp) {
            bars.hp.style.height = val.hp * 100 / gmcp.gmcp().char.maxstats.maxhp + "%";
            prev.hp = val.hp;
        }
        if (val.mana != prev.mana) {
            bars.mana.style.height = val.mana * 100 / gmcp.gmcp().char.maxstats.maxmana + "%";
            prev.mana = val.mana;
        }
        if (val.moves != prev.move) {
            bars.move.style.height = val.moves * 100 / gmcp.gmcp().char.maxstats.maxmoves + "%";
            prev.move = val.moves;
        }
        if (Math.abs(val.piety - prev.piety) < 0.1) {
            bars.piety.style.height = val.piety; // already scaled to 100
            prev.piety = val.piety;
        }
        /*
        if (val.tnl != prev.tnl) {
            bars.tnl.style.height = val.tnl * 100 / gmcp.gmcp().char.maxstats.expperlevel + "%";
            prev.tnl = val.tnl;
        }
        if (val.enemy != prev.enemy) {
            bars.enemy.style.height = val.enemy * 100 / ??? + "%";
            prev.enemy = val.enemy;
        }
        */
    }
}
let statbars = StatBars(gmcp);
