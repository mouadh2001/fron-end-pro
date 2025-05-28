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
    if (this.isDefending) {
      damage = Math.floor(damage * 0.5);
      this.isDefending = false;
    }

    this.hp -= damage;
    if (this.hp < 0) this.hp = 0;

    return damage;
  }

  useSpecial() {
    if (this.currentSpecialCooldown === 0) {
      this.currentSpecialCooldown = this.specialCooldown;
      return true;
    }
    return false;
  }

  endTurn() {
    console.log("hh");
    if (this.type === "ninja") {
      this.attack = 20;
    } else if (this.type === "knight") {
      this.attack = 25;
    }
    if (this.currentSpecialCooldown > 0) {
      this.currentSpecialCooldown--;
    }
    this.isDefending = false;
  }

  isAlive() {
    return this.hp > 0;
  }
}

class Knight extends Hero {
  constructor() {
    super("knight", "Player Knight", 120, 25, 15, 1, 1, 3, "Ai Knight");
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
    super("ninja", "Player Ninja", 80, 20, 8, 2, 1, 3, "Ai Ninja");
  }

  doubleAttack() {
    if (this.useSpecial()) {
      this.attack = this.attack * 2;
      return true;
    }
    return false;
  }

  attemptDodge() {
    return Math.random() < 0.6; // 60% chance to dodge
  }
}

class Wizard extends Hero {
  constructor() {
    super("wizard", "Player Wizard", 70, 30, 5, 1, 3, 3, "Ai Wizard");
  }

  magicStorm() {
    return this.useSpecial();
  }
}
