class UI {
  constructor(game) {
    this.game = game;
    this.arenaElement = document.getElementById("arena");
    this.heroNameElement = document.getElementById("hero-name");
    this.heroHpElement = document.getElementById("hero-hp");
    this.heroMaxHpElement = document.getElementById("hero-max-hp");
    this.heroSpecialElement = document.getElementById("hero-special");
    this.healthFillElement = document.querySelector(".health-fill");
    this.heroPortraitElement = document.querySelector(".hero-portrait");
    this.gameLogElement = document.getElementById("game-log");
    this.heroSelectionElement = document.getElementById("hero-selection");
    this.setupEventListeners();
    this.renderArena();
  }

  setupEventListeners() {
    //------------------------------
    // création des events listeners
    document.getElementById("btn-move").addEventListener("click", () => {
      this.game.selectAction("move");
    });
    
    document.getElementById("btn-attack").addEventListener("click", () => {
      this.game.selectAction("attack");
    });

    document.getElementById("btn-special").addEventListener("click", () => {
      this.game.selectAction("special");
    });

    document.getElementById("btn-defend").addEventListener("click", () => {
      this.game.selectAction("defend");
    });

    document.getElementById("btn-end").addEventListener("click", () => {
      this.game.endTurn();
    });

    // selection de hhero
    document.querySelectorAll(".hero-option").forEach((option) => {
      option.addEventListener("click", () => {
        const heroType = option.getAttribute("data-hero");
        this.game.startGame(heroType);
        // hherotype peut etre : ninja kngiht wisard ou archer seleon l'attribut data-hero dans le div
      });
    });
    //-----------------------------------
  }

  renderArena() {
    //-----------------------------------
    const table = this.arenaElement;
    table.innerHTML = "";

    for (let y = 0; y < this.game.arena.size; y++) {
      const row = document.createElement("tr");
      for (let x = 0; x < this.game.arena.size; x++) {
        const cell = document.createElement("td");
        if (this.game.arena.grid[y][x].obstacle) {
          // si le cell est un obstacle applique le style de obstacle
          cell.className = "obstacle";
        } else {
          cell.className = "floor";
          // si le cell est une floor applique le style de floor
        }
        cell.dataset.x = x;
        cell.dataset.y = y;
          // identifier une indices au cellule de grille

        if (this.game.arena.grid[y][x].hero) {
          const hero = this.game.arena.grid[y][x].hero;
          if (hero === this.game.arena.heroes[0]) {
            const heroElement = document.createElement("div");
            heroElement.className = `hero ${hero.type}`;
            heroElement.title = `${hero.name} (HP: ${hero.hp}/${hero.maxHp})`;
            // affichage de info dans le grid
            cell.appendChild(heroElement);
            // si le hero de player utilise nom
          } else {
            const heroElement = document.createElement("div");
            heroElement.className = `hero ${hero.type}`;
            heroElement.title = `${hero.nameAi} (HP: ${hero.hp}/${hero.maxHp})`;
            cell.appendChild(heroElement);
            // si ai utilise le ai nom
          }
        }

        cell.addEventListener("click", () => {
          this.game.handleCellClick(x, y);
        });
        // pour suivre les clicks sur le grid
        row.appendChild(cell);
      }
      table.appendChild(row);
    }
    //---------------------------------
  }

  updateUI() {
    //----------------------------------
    if (this.game.arena.heroes.length === 0) return;
    const currentHero =
      this.game.arena.heroes[this.game.arena.currentPlayerIndex];
    // Update hero info panel
    if (currentHero === this.game.arena.heroes[0]) {
      this.heroNameElement.textContent = currentHero.name;
    } else {
      this.heroNameElement.textContent = currentHero.nameAi;
    }
    this.heroHpElement.textContent = currentHero.hp;
    this.heroMaxHpElement.textContent = currentHero.maxHp;
    const healthPercent = (currentHero.hp / currentHero.maxHp) * 100;
    this.healthFillElement.style.width = `${healthPercent}%`;
    if (currentHero.currentSpecialCooldown === 0) {
      this.heroSpecialElement.textContent = "Ready";
      this.heroSpecialElement.style.color = "#0f0";
    } else {
      this.heroSpecialElement.textContent = `Cooldown: ${currentHero.currentSpecialCooldown}`;
      this.heroSpecialElement.style.color = "#f00";
    }
    this.heroPortraitElement.style.backgroundImage = `url(assets/heroes/${currentHero.type}.png)`;
    this.renderArena();
    //sincroniser les info du panel et le grille
    //----------------------------------------
  }

  addToLog(message) {
    const entry = document.createElement("p");
    entry.textContent = message;
    this.gameLogElement.appendChild(entry);
    this.gameLogElement.scrollTop = this.gameLogElement.scrollHeight;
  }

  showHeroSelection() {
    this.heroSelectionElement.style.display = "flex";
  }

  hideHeroSelection() {
    this.heroSelectionElement.style.display = "none";
  }
}
