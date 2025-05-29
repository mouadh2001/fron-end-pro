class Game {
  constructor() {
    this.arena = new Arena();
    this.ui = new UI(this);
    this.gameState = "hero-selection";
    this.selectedAction = null;
    // affichage de selection hero menu
    this.ui.showHeroSelection();
    this.playerPlayFirst = false;
    this.computerPlayFirst = false;
    this.diceRolled = false;
  }

  startGame(heroType) {
    let playerHero;
    switch (heroType) {
      case "knight":
        playerHero = new Knight();
        break;
      case "ninja":
        playerHero = new Ninja();
        break;
      case "wizard":
        playerHero = new Wizard();
        break;
      case "archer":
        playerHero = new Archer();
        break;
    }
    this.arena.addHero(playerHero, 0, 0);
    this.arena.addHero(new Knight(), 0, 6);
    // this.arena.addHero(new Archer(), 6, 0);
    // this.arena.addHero(new Wizard(), 6, 6);

    this.gameState = "playing";
    this.ui.hideHeroSelection();
    this.ui.updateUI();
    this.ui.addToLog(`Game started! You are ${playerHero.name}.`);
    this.rollDiceForFirstTurn();
  }

  rollDiceForFirstTurn() {
    let roll = 0;
    let playerTurn = true;
    let computerTurn = false;
    while (roll !== 6) {
      roll = Math.floor(Math.random() * 6) + 1;
      if (roll === 6 && playerTurn) {
        this.playerPlayFirst = true;
        this.ui.addToLog(`player got 6 will play first !`);
      } else if (roll === 6 && computerTurn) {
        this.computerPlayFirst = true;
        this.ui.addToLog(`computer got 6 will play first!`);
      }
      playerTurn = false;
      computerTurn = true;
      if (this.computerPlayFirst) {
        this.diceRolled = true;
        this.endTurn();
      } else if (this.playerPlayFirst) {
        this.diceRolled = true;
      }
    }
  }

  selectAction(action) {
    this.selectedAction = action;
    const currentHero = this.arena.heroes[this.arena.currentPlayerIndex];
    if (action === "special") {
      this.useSpecialAbility();
    } else if (action === "defend") {
      currentHero.isDefending = true;
      this.ui.addToLog(`${currentHero.name} is defending!`);
      this.endTurn();
    }
  }

  useSpecialAbility() {
    const hero = this.arena.heroes[this.arena.currentPlayerIndex];
    let success = false;
    let message = "";
    if (hero.type === "knight") {
      success = hero.warCry();
      if (success) {
        if (hero === this.arena.heroes[0])
          message = `${hero.name} uses War Cry! Attack increased!`;
        else {
          message = `${hero.nameAi} uses War Cry! Attack increased!`;
        }
      } else {
        message = "War Cry is not ready yet!";
      }
    } else if (hero.type === "ninja") {
      success = hero.doubleAttack();
      if (success) {
        if (hero === this.arena.heroes[0]) {
          message = `${hero.name} uses Double Attack! Attack Dublled!`;
        } else {
          message = `${hero.nameAi} uses Double Attack! Attack Dublled!`;
        }
      } else {
        message = "Double Attack is not ready yet!";
      }
    } else if (hero.type === "wizard") {
      success = hero.magicStorm();
      if (success) {
        this.castMagicStorm(hero);
      } else {
        message = "Magic Storm is not ready yet!";
      }
    } else if (hero.type === "archer") {
      success = hero.ArchWave();
      if (success) {
        this.castArchWave(hero);
      } else {
        message = "Arch Wave is not ready yet!";
      }
    }
    this.ui.addToLog(message);
  }
  handleCellClick(x, y) {
    let message = "";
    x = parseInt(x);
    y = parseInt(y);
    let correctMove = false;
    if (this.gameState !== "playing") return;
    const currentHero = this.arena.heroes[this.arena.currentPlayerIndex];
    this.arena.getPossibleMoves(currentHero).forEach((moves) => {
      if (x === moves.x && y === moves.y) {
        correctMove = true;
      }
    });
    if (this.selectedAction === "move" && correctMove) {
      const moved = this.arena.moveHero(currentHero, x, y);
      if (moved) {
        let message = "";
        message = `${currentHero.name} changes position`;
        this.ui.addToLog(message);
        this.endTurn();
      }
    } else if (this.selectedAction === "attack") {
      const target = this.arena.getHeroAt(x, y);
      if (target) {
        let canAttack = false;
        for (
          let i = 0;
          i < this.arena.getAttackableTargets(currentHero).length;
          i++
        ) {
          if (target === this.arena.getAttackableTargets(currentHero)[i]) {
            canAttack = true;
          }
        }
        if (canAttack) {
          this.attack(currentHero, target);
        } else {
          message = "not in range!";
          this.ui.addToLog(message);
          return;
        }
      }
    }
  }

  attack(attacker, defender) {
    let attackerName = "";
    let defenderName = "";
    if (attacker === this.arena.heroes[0]) {
      attackerName = attacker.name;
    } else {
      attackerName = attacker.nameAi;
    }
    if (defender === this.arena.heroes[0]) {
      defenderName = defender.name;
    } else {
      defenderName = defender.nameAi;
    }
    let damage = attacker.attack;
    let message = "";
    const roll = Math.floor(Math.random() * 6) + 1;
    if (roll === 6) {
      damage *= 2;
      message = `Critical hit! got ${roll} `;
    } else if (roll <= 2) {
      damage = 0;
      message = `${attackerName} missed! got ${roll} `;
    }
    if (defender.type === "ninja" && defender.attemptDodge()) {
      damage = 0;
      message = `${defenderName} dodged the attack of ${attackerName}!`;
    }
    if (damage > 0) {
      const actualDamage = defender.takeDamage(damage);
      message += `${attackerName} hits ${defenderName} for ${actualDamage} damage!`;
      if (!defender.isAlive()) {
        message += ` ${defenderName} has been defeated!`;
        if (defender === this.arena.heroes[0]) {
          this.gameState = "Game Over";
          this.showDefeatScreen();
          setTimeout(() => {
            document.getElementById("defeat-screen").style.display = "none";
          }, 3000);
        }
        this.arena.removeHero(defender);
      }
    }
    this.ui.addToLog(message);
    this.ui.updateUI();
    if (attacker.type === "ninja") {
      document.getElementById("btn-attack").style.display = "none";
      if (!attacker.useSpecial()) {
        document.getElementById("btn-special").style.display = "none";
      }
    } else {
      this.endTurn();
    }
    if (this.arena.checkGameOver()) {
      this.endGame();
    }
  }

  endTurn() {
    document.getElementById("btn-attack").style.display = "flex";
    document.getElementById("btn-special").style.display = "flex";
    if (this.arena.checkGameOver()) {
      this.endGame();
      return;
    }
    const nextHero = this.arena.nextTurn();
    this.selectedAction = null;
    this.ui.updateUI();
    if (nextHero !== this.arena.heroes[0]) {
      this.runAI(nextHero);
    }
  }

  castArchWave(archer) {
    let archerName = "";
    if (archer === this.arena.heroes[0]) {
      archerName = archer.name;
    } else {
      archerName = archer.nameAi;
    }
    const targets = this.arena.heroes.filter(
      (hero) =>
        hero !== archer &&
        hero.isAlive() &&
        Math.abs(hero.position.x - archer.position.x) <= 7 &&
        Math.abs(hero.position.y - archer.position.y) <= 7
    );

    this.ui.addToLog(`${archerName} casts Arch Wave!`);
    let targetName = "";

    targets.forEach((target) => {
      if (target === this.arena.heroes[0]) {
        targetName = target.name;
      } else {
        targetName = target.nameAi;
      }

      const damage = Math.floor(archer.attack * 1.2);
      const actualDamage = target.takeDamage(damage);
      let message = "";
      message = `${targetName} takes ${actualDamage} damage from the wave!`;
      if (!target.isAlive()) {
        message += ` ${targetName} has been defeated!`;
        if (target === this.arena.heroes[0]) {
          this.gameState = "Game Over";
          this.showDefeatScreen();
          setTimeout(() => {
            document.getElementById("defeat-screen").style.display = "none";
          }, 3000);
        }
        this.ui.addToLog(message);
        this.arena.removeHero(target);
      }
    });
    this.ui.updateUI();
  }

  castMagicStorm(wizard) {
    //--------------------------------------
    //utilise plyer ou ai
    let wizardName = "";
    if (wizard === this.arena.heroes[0]) {
      wizardName = wizard.name;
    } else {
      wizardName = wizard.nameAi;
    }
    // selon le range recupere les targets
    const targets = this.arena.heroes.filter(
      (hero) =>
        hero !== wizard &&
        hero.isAlive() &&
        Math.abs(hero.position.x - wizard.position.x) <= 3 &&
        Math.abs(hero.position.y - wizard.position.y) <= 3
    );
    this.ui.addToLog(`${wizardName} casts Magic Storm!`);
    let targetName = "";
    //applique le degt de spectial sur chaque hero
    targets.forEach((target) => {
      //on utilise player ou ai
      if (target === this.arena.heroes[0]) {
        targetName = target.name;
      } else {
        targetName = target.nameAi;
      }
      const damage = Math.floor(wizard.attack * 1.2);
      const actualDamage = target.takeDamage(damage);
      let message = "";
      message = `${targetName} takes ${actualDamage} damage from the storm!`;
      // si le spectial a tuer un hero
      if (!target.isAlive()) {
        message += ` ${targetName} has been defeated!`;
        //si le hero tuer est de player
        if (target === this.arena.heroes[0]) {
          //chenger le gemestate pour que le ai stop
          this.gameState = "Game Over";
          this.showDefeatScreen();
          setTimeout(() => {
            document.getElementById("defeat-screen").style.display = "none";
          }, 3000);
        }
        this.ui.addToLog(message);
        this.arena.removeHero(target);
      }
    });
    this.ui.updateUI();
    //----------------------------------------
  }

  runAI(aiHero) {
    //------------------------------------------
    //timout pour aplique un delai entre le turn de hero de ai
    setTimeout(() => {
      //la ai arrete si game over
      if (this.gameState === "playing") {
        //selection de enemies
        const enemies = this.arena.heroes.filter(
          (hero) => hero !== aiHero && hero.isAlive()
        );
        let closestEnemy = null;
        //trés grand nombre garentit que mindistence sera changer
        let minDistance = Infinity;
        //calcule le distence pour chaque enemys
        enemies.forEach((enemy) => {
          const distence =
            Math.abs(enemy.position.x - aiHero.position.x) +
            Math.abs(enemy.position.y - aiHero.position.y);
          if (distence < minDistance) {
            minDistance = distence;
            //la plus proche enemy
            closestEnemy = enemy;
          }
        });
        if (!closestEnemy) return;
        //selectionner les hero in range
        const attackable = this.arena.getAttackableTargets(aiHero);
        //slectionner ce qui in range est le plus proche
        const target = attackable.find((t) => t === closestEnemy);
        //si on a le trouver
        if (target) {
          //utilise le spetial si il possible
          if (aiHero.currentSpecialCooldown === 0) {
            this.useSpecialAbility();
          }
          //attaquer le
          this.attack(aiHero, target);
          return;
        }
        //definit les move possibles
        const moves = this.arena.getPossibleMoves(aiHero);
        if (moves.length > 0) {
          //le premier move est considirer comme une solution jusqu'a en le change par absurdre
          let bestMove = moves[0];
          let moveMinDist = Infinity;
          //parcour les movment possible
          for (let i = 0; i < moves.length; i++) {
            let move = moves[i];
            //calcule le distence a partir de cordonner de chaque move
            const distence =
              Math.abs(move.x - closestEnemy.position.x) +
              Math.abs(move.y - closestEnemy.position.y);
            //prondre la plus petit istence
            if (distence < moveMinDist) {
              moveMinDist = distence;
              bestMove = move;
            }
          }
          //deplacer le hero
          this.arena.moveHero(aiHero, bestMove.x, bestMove.y);
          let message = "";
          message = `${aiHero.nameAi} change position`;
          this.ui.addToLog(message);
        }
        this.endTurn();
      }
    }, 1000);
    //----------------------------------------
  }

  showVictoryScreen() {
    document.getElementById("victory-screen").style.display = "flex";
  }

  showDefeatScreen() {
    document.getElementById("defeat-screen").style.display = "flex";
  }

  endGame() {
    //--------------------------------------
    const winner = this.arena.getWinner();
    if (winner === this.arena.heroes[0]) {
      //si le winner est le player vicory
      this.showVictoryScreen();
    } else {
      // si le winner est le ai defeat
      this.showDefeatScreen();
    }
    //cacher le vic ou def scren apres 3 sec
    setTimeout(() => {
      document.getElementById("victory-screen").style.display = "none";
      document.getElementById("defeat-screen").style.display = "none";
    }, 3000);
    //---------------------------------------
  }
}

//istencier le jeu
document.addEventListener("DOMContentLoaded", () => {
  let game = new Game();
});

// //restart le jeu
// document.getElementById("reset").addEventListener("click", () => {
//   let game = new Game();
// });
function test() {
  console.log("test");
}
