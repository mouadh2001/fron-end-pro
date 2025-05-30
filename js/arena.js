class Arena {
  constructor(size = 7) {
    this.size = size;
    this.grid = [];
    this.heroes = [];
    this.currentPlayerIndex = 0;
    this.initializeGrid();
  }

  restarena() {
    this.heroes = [];
    this.grid = [];
    this.currentPlayerIndex = 0;
    this.initializeGrid();
  }

  initializeGrid() {
    for (let y = 0; y < this.size; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.size; x++) {
        //---------------------------------
        if (y == 0 || y == this.size - 1) {
          this.grid[y][x] = {
            hero: null,
            obstacle: false,
            // pour ne pas avoir des obstacle dans le premier et le dernier lignes
            //-----------------------------
          };
        } else {
          //-------------------------------
          if (Math.random() < 0.1) {
            this.grid[y][x] = {
              hero: null,
              obstacle: true,
            };
          } else {
            this.grid[y][x] = {
              hero: null,
              obstacle: false,
            };
            // identifier chaque cellule si elle vas étre un obstacle ou floor
            //----------------------------------
          }
        }
      }
    }
  }

  removeHero(hero) {
    this.grid[hero.position.y][hero.position.x].hero = null;
    return;
  }

  addHero(hero, x, y) {
    if (
      this.isValidPosition(x, y) &&
      !this.grid[y][x].hero &&
      !this.grid[y][x].obstacle
    ) {
      hero.position = { x, y };
      this.grid[y][x].hero = hero;
      this.heroes.push(hero);
      return true;
    }
    return false;
  }

  isValidPosition(x, y) {
    return x >= 0 && x < this.size && y >= 0 && y < this.size;
  }

  isCellEmpty(x, y) {
    return (
      //--------------------------
      this.isValidPosition(x, y) &&
      !this.grid[y][x].hero &&
      !this.grid[y][x].obstacle
    );
    // si le pos xy est a l'interieur de grille et n'est pas ni obstacel ni hero returne true
    //-------------------------------
  }

  getHeroAt(x, y) {
    if (this.isValidPosition(x, y)) {
      return this.grid[y][x].hero;
    }
    return null;
  }

  moveHero(hero, newX, newY) {
    const { x: oldX, y: oldY } = hero.position;
    //---------------------------------
    if (this.isCellEmpty(newX, newY)) {
      this.grid[oldY][oldX].hero = null;
      hero.move({ x: newX, y: newY });
      //hero.move vas faire le remplacement de cordonner de position
      this.grid[newY][newX].hero = hero;
      return true;
      //------------------------------
    }
    return false;
  }

  getPossibleMoves(hero) {
    const moves = [];
    const { x, y } = hero.position;
    const range = hero.moveRange;
    //------------------------------
    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        if ((dx === 0 && dy === 0) || Math.abs(dx) + Math.abs(dy) > range)
          continue;
        // on ignore le position de hero 0.0
        // on ignore les cas ou la somme de dxdy est a l'exterieur de range
        const newX = x + dx;
        const newY = y + dy;
        if (this.isCellEmpty(newX, newY)) {
          moves.push({ x: newX, y: newY });
        }
      }
    }
    return moves;
    //---------------------------------
  }

  getAttackableTargets(hero) {
    const targets = [];
    const { x, y } = hero.position;
    const range = hero.attackRange;
    //---------------------------------
    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        // on ignore la posion de hero
        if (dx === 0 && dy === 0) continue;
        const newX = x + dx;
        const newY = y + dy;
        if (this.isValidPosition(newX, newY)) {
          const target = this.getHeroAt(newX, newY);
          //si target !null on l'ignore si il est le hero actuel et si le hero est mort
          if (target && target !== hero && target.maxHp > 0) {
            targets.push(target);
          }
        }
      }
    }
    return targets;
    //--------------------------------
  }

  nextTurn() {
    //-----------------------------------------
    // le purson pour garentir si on passe nb heros en retour a 0
    this.currentPlayerIndex =
      (this.currentPlayerIndex + 1) % this.heroes.length;
    //ignor les hhero mort
    while (!this.heroes[this.currentPlayerIndex].isAlive()) {
      this.currentPlayerIndex =
        (this.currentPlayerIndex + 1) % this.heroes.length;
    }
    //appele au endturn de class hero pour rinsialise le defence attack pour N et K
    this.heroes[this.currentPlayerIndex].endTurn();
    return this.heroes[this.currentPlayerIndex];
    //--------------------------------------------
  }

  checkGameOver() {
    //----------------------------
    const aliveHeroes = this.heroes.filter((hero) => hero.isAlive());
    return aliveHeroes.length <= 1;
    //-------------------------------
  }

  getWinner() {
    const aliveHeroes = this.heroes.filter((hero) => hero.isAlive());
    if (aliveHeroes.length === 1) {
      return aliveHeroes[0];
    } else {
      return null;
    }
  }
}
