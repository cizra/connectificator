var StatBars = function(gmcp) {
  gmcp.handle("char.vitals", onVitals);
  document.getElementById('statBars').style.display = 'block';

  let bars = {};
  bars.hp = document.getElementById('hpBar');
  bars.mana = document.getElementById('manaBar');
  bars.moves = document.getElementById('movesBar');
  bars.piety = document.getElementById('pietyBar');
  bars.lifeforce = document.getElementById('lifeforceBar');
  bars.tnl = document.getElementById('tnlBar');
  bars.enemy = document.getElementById('enemyBar');
  bars.tankHp = document.getElementById('tankHpBar');

  let prev = {};
  prev.hp = null;
  prev.mana = null;
  prev.moves = null;
  prev.piety = null;
  prev.lifeforce = null;
  prev.tnl = null;
  prev.enemy = null;
  prev.tankHp = null;

  let fixedMax = {};
  fixedMax.piety = 100.0;
  fixedMax.lifeforce = 5000;

  function onVitals(val) {
    let barnames = ["hp", "mana", "moves", "piety", "tnl", "lifeforce"];
    for (i in barnames) {
      let bar = barnames[i];

      if (val[bar] != prev[bar]) {
        if (prev[bar] === null)
          bars[bar].style.display = 'inline-block';

        let max = fixedMax[bar] || gmcp.gmcp().char.maxstats["max" + bar];

        console.log(`${bar}: ${val[bar]} / ${max}`);
        bars[bar].style.height = val[bar] * 100 / max + "%";
        prev[bar] = val[bar];
      }
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
