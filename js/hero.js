class Hero {
  constructor(
    type,
    name,
    maxHp,
    attack,
    defense,
    moveRange,
    attackRange,
    specialCooldown,
    nameAi
  ) {
    this.type = type;
    this.name = name;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.attack = attack;
    this.defense = defense;
    this.moveRange = moveRange;
    this.attackRange = attackRange;
    this.specialCooldown = specialCooldown;
    this.nameAi = nameAi;
    this.currentSpecialCooldown = 0;
    this.isDefending = false;
    this.position = { x: 0, y: 0 };
  }

  move(newPosition) {
    this.position = newPosition;
  }

  takeDamage(damage) {
    //---------------------------------------
    //si is defending le dégat decrice l edégat
    if (this.isDefending) {
      damage = damage - this.defense;
      // le degat ne peut pas etre negatif
      if (damage < 0) damage = 0;
    }
    this.hp -= damage;
    if (this.hp < 0) this.hp = 0;
    return damage;
    //------------------------------------------
  }

  useSpecial() {
    //------------------------------------------
    if (this.currentSpecialCooldown === 0) {
      this.currentSpecialCooldown = this.specialCooldown;
      return true;
    }
    return false;
    //si le coul down = 0 oui le hero peut utiliser son special
    //-------------------------------------------
  }

  endTurn() {
    //-----------------------------------
    if (this.type === "ninja") {
      this.attack = 25;
    } else if (this.type === "knight") {
      this.attack = 30;
    }
    if (this.currentSpecialCooldown > 0) {
      this.currentSpecialCooldown--;
    }
    this.isDefending = false;
    //reinitiaise le defence , l'attack pour ninja et knight , decrise le couldown
    //------------------------------------
  }

  isAlive() {
    return this.hp > 0;
  }
}

class Knight extends Hero {
  constructor() {
    super("knight", "Player Knight", 120, 30, 15, 1, 1, 3, "Ai Knight");
  }

  warCry() {
    if (this.useSpecial()) {
      this.attack += 10;
      return true;
    }
    return false;
  }
}

class Archer extends Hero {
  constructor() {
    super("archer", "Player Archer", 60, 10, 5, 2, 7, 3, "Ai Archer");
  }

  ArchWave() {
    return this.useSpecial();
  }
}

class Ninja extends Hero {
  constructor() {
    super("ninja", "Player Ninja", 90, 25, 10, 2, 1, 3, "Ai Ninja");
  }

  doubleAttack() {
    if (this.useSpecial()) {
      this.attack = this.attack * 2;
      return true;
    }
    return false;
  }

  attemptDodge() {
    //------------------------------
    return Math.random() < 0.6; // 60% chance de dodge
  }
  //------------------------------
}

class Wizard extends Hero {
  constructor() {
    super("wizard", "Player Wizard", 60, 20, 5, 1, 3, 3, "Ai Wizard");
  }

  magicStorm() {
    return this.useSpecial();
  }
}
