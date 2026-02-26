const UPGRADES = [
  { id: 'damage', name: 'Fuerza Extra', icon: '💪', description: '+25% daño a tus ataques', apply: (stats) => { stats.damage *= 1.25; } },
  { id: 'speed', name: 'Velocidad', icon: '⚡', description: '+20% velocidad de movimiento', apply: (stats) => { stats.speed *= 1.2; } },
  { id: 'health', name: 'Salud Máxima', icon: '❤️', description: '+1 corazón adicional', apply: (stats) => { stats.maxHealth += 2; stats.health += 2; } },
  { id: 'fireRate', name: 'Fuego Rápido', icon: '🔥', description: '+30% velocidad de ataque', apply: (stats) => { stats.fireRate *= 0.7; } },
  { id: 'pierce', name: 'Perforador', icon: '🗡️', description: 'Los ataques atraviesan enemigos', apply: (stats) => { stats.pierce += 1; } },
  { id: 'regen', name: 'Regeneración', icon: '💚', description: 'Recuperas salud con el tiempo', apply: (stats) => { stats.regen += 0.5; } },
  { id: 'crit', name: 'Golpe Crítico', icon: '💥', description: '+15% probabilidad de crítico', apply: (stats) => { stats.crit += 15; } },
  { id: 'multishot', name: 'Multidisparo', icon: '🎯', description: 'Dispara proyectiles extra', apply: (stats) => { stats.projectiles += 1; } },
];

class RoguelikeGame {
  constructor(container, duration, savedUpgrades, onComplete, onUpgrade) {
    this.container = container;
    this.duration = duration;
    this.savedUpgrades = savedUpgrades || {};
    this.onComplete = onComplete;
    this.onUpgrade = onUpgrade;
    this.timeRemaining = duration;
    this.isRunning = false;
    this.isPaused = false;
    this.gameOver = false;
    this.score = 0;
    this.kills = 0;

    this.player = {
      x: 400,
      y: 300,
      width: 32,
      height: 32,
      speed: 200,
      health: this.savedUpgrades.health || 5,
      maxHealth: this.savedUpgrades.maxHealth || 5,
      damage: 1,
      fireRate: this.savedUpgrades.fireRate || 500,
      lastShot: 0,
      speedMultiplier: this.savedUpgrades.speedMultiplier || 1,
      damageMultiplier: this.savedUpgrades.damageMultiplier || 1,
      pierce: this.savedUpgrades.pierce || 0,
      regen: this.savedUpgrades.regen || 0,
      crit: this.savedUpgrades.crit || 0,
      projectiles: this.savedUpgrades.projectiles || 1,
    };

    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.pickups = [];
    this.lastEnemySpawn = 0;
    this.enemySpawnRate = 1500;

    this.keys = {};
    this.mouseX = 0;
    this.mouseY = 0;
  }

  getUpgrades() {
    return {
      damageMultiplier: this.player.damageMultiplier,
      speedMultiplier: this.player.speedMultiplier,
      maxHealth: this.player.maxHealth,
      health: this.player.health,
      fireRate: this.player.fireRate,
      pierce: this.player.pierce,
      regen: this.player.regen,
      crit: this.player.crit,
      projectiles: this.player.projectiles,
    };
  }

  start() {
    this.isRunning = false;
    this.createGameCanvas();
    this.setupInput();
    this.showUpgrades();
  }

  createGameCanvas() {
    this.container.innerHTML = '';

    const statsDiv = document.createElement('div');
    statsDiv.className = 'game-stats';
    statsDiv.innerHTML = `
      <div>Puntuación: <span id="gameScore">0</span></div>
      <div>Enemigos: <span id="gameKills">0</span></div>
      <div>Salud: <span id="gameHealth">${this.player.health}</span>/${this.player.maxHealth}</div>
    `;
    this.container.appendChild(statsDiv);

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
    this.container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');

    this.resizeHandler = () => {
      this.canvas.width = this.container.clientWidth;
      this.canvas.height = this.container.clientHeight;
    };
    window.addEventListener('resize', this.resizeHandler);
  }

  setupInput() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });
  }

  spawnTimer() {
    this.timerInterval = setInterval(() => {
      if (this.isPaused || this.gameOver) return;

      this.timeRemaining--;
      document.getElementById('restTimeDisplay').textContent = this.timeRemaining;

      if (this.timeRemaining <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  gameLoop() {
    if (this.gameOver) return;

    const loop = () => {
      if (!this.gameOver) {
        this.update();
        this.render();
        requestAnimationFrame(loop);
      }
    };
    requestAnimationFrame(loop);
  }

  update() {
    if (this.isPaused) return;

    this.updatePlayer();
    this.updateEnemies();
    this.updateProjectiles();
    this.updatePickups();
    this.updateParticles();
    this.spawnEnemies();
    this.checkCollisions();
    this.regenerateHealth();
  }

  updatePlayer() {
    const dx = this.mouseX - this.player.x;
    const dy = this.mouseY - this.player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 5) {
      const speed = this.player.speed * this.player.speedMultiplier;
      const moveX = (dx / dist) * speed * 0.016;
      const moveY = (dy / dist) * speed * 0.016;
      
      this.player.x += moveX;
      this.player.y += moveY;
    }

    this.player.x = Math.max(16, Math.min(this.canvas.width - 16, this.player.x));
    this.player.y = Math.max(16, Math.min(this.canvas.height - 16, this.player.y));
    
    if (this.isRunning && !this.gameOver) {
      const target = this.getNearestEnemy();
      if (target) {
        this.shoot(target.x, target.y);
      } else {
        this.shoot(this.mouseX, this.mouseY);
      }
    }
  }

  getNearestEnemy() {
    if (this.enemies.length === 0) return null;
    
    let nearest = null;
    let nearestDist = Infinity;
    
    for (const enemy of this.enemies) {
      const dist = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = enemy;
      }
    }
    
    return nearest;
  }

  shoot(targetX, targetY) {
    const now = Date.now();
    if (now - this.player.lastShot < this.player.fireRate) return;

    this.player.lastShot = now;

    const angle = Math.atan2(targetY - this.player.y, targetX - this.player.x);
    const numProjectiles = this.player.projectiles;

    for (let i = 0; i < numProjectiles; i++) {
      const spread = (i - (numProjectiles - 1) / 2) * 0.15;
      const finalAngle = angle + spread;

      this.projectiles.push({
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(finalAngle) * 400,
        vy: Math.sin(finalAngle) * 400,
        damage: this.player.damage * this.player.damageMultiplier,
        pierce: this.player.pierce,
        isCrit: Math.random() * 100 < this.player.crit,
      });
    }
  }

  updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * 0.016;
      p.y += p.vy * 0.016;

      if (p.x < 0 || p.x > this.canvas.width || p.y < 0 || p.y > this.canvas.height) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  spawnEnemies() {
    const now = Date.now();
    if (now - this.lastEnemySpawn < this.enemySpawnRate) return;

    this.lastEnemySpawn = now;
    this.enemySpawnRate = Math.max(300, this.enemySpawnRate - 10);

    const side = Math.floor(Math.random() * 4);
    let x, y;

    switch (side) {
      case 0: x = Math.random() * this.canvas.width; y = -30; break;
      case 1: x = this.canvas.width + 30; y = Math.random() * this.canvas.height; break;
      case 2: x = Math.random() * this.canvas.width; y = this.canvas.height + 30; break;
      case 3: x = -30; y = Math.random() * this.canvas.height; break;
    }

    const enemyTypes = [
      { type: 'basic', health: 2, speed: 80, size: 20, color: '#ff3366' },
      { type: 'fast', health: 1, speed: 140, size: 15, color: '#ffaa00' },
      { type: 'tank', health: 8, speed: 40, size: 30, color: '#aa00ff' },
    ];

    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

    this.enemies.push({
      x, y,
      ...type,
      maxHealth: type.health,
    });
  }

  updateEnemies() {
    for (const enemy of this.enemies) {
      const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
      enemy.x += Math.cos(angle) * enemy.speed * 0.016;
      enemy.y += Math.sin(angle) * enemy.speed * 0.016;
    }
  }

  updatePickups() {
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pickup = this.pickups[i];
      const dist = Math.hypot(this.player.x - pickup.x, this.player.y - pickup.y);

      if (dist < 30) {
        this.applyPickup(pickup);
        this.pickups.splice(i, 1);
      }
    }
  }

  applyPickup(pickup) {
    switch (pickup.type) {
      case 'health':
        this.player.health = Math.min(this.player.maxHealth, this.player.health + 1);
        break;
      case 'score':
        this.score += 100;
        break;
    }
    this.updateStats();
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * 0.016;
      p.y += p.vy * 0.016;
      p.life -= 0.016;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  checkCollisions() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];

      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        const dist = Math.hypot(p.x - e.x, p.y - e.y);

        if (dist < e.size + 5) {
          const damage = p.isCrit ? p.damage * 2 : p.damage;
          e.health -= damage;

          this.spawnParticles(e.x, e.y, p.isCrit ? '#ffff00' : '#ffffff', p.isCrit ? 10 : 5);

          if (e.health <= 0) {
            this.enemies.splice(j, 1);
            this.kills++;
            this.score += 10;

            if (Math.random() < 0.1) {
              this.pickups.push({
                x: e.x,
                y: e.y,
                type: Math.random() < 0.7 ? 'score' : 'health',
              });
            }
          }

          if (p.pierce > 0) {
            p.pierce--;
          } else {
            this.projectiles.splice(i, 1);
            break;
          }
        }
      }
    }

    for (const enemy of this.enemies) {
      const dist = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
      if (dist < 16 + enemy.size) {
        this.player.health -= 1;
        this.updateStats();
        this.spawnParticles(this.player.x, this.player.y, '#ff0000', 20);

        const angle = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
        enemy.x += Math.cos(angle) * 50;
        enemy.y += Math.sin(angle) * 50;

        if (this.player.health <= 0) {
          this.gameOver = true;
          this.onComplete({ score: this.score, kills: this.kills });
        }
      }
    }
  }

  regenerateHealth() {
    if (this.player.regen > 0) {
      this.player.health = Math.min(this.player.maxHealth, this.player.health + this.player.regen * 0.016);
      this.updateStats();
    }
  }

  spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 0.5 + Math.random() * 0.5,
      });
    }
  }

  updateStats() {
    document.getElementById('gameScore').textContent = this.score;
    document.getElementById('gameKills').textContent = this.kills;
    document.getElementById('gameHealth').textContent = Math.floor(this.player.health);
  }

  render() {
    const ctx = this.ctx;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawGrid(ctx);

    for (const pickup of this.pickups) {
      ctx.beginPath();
      ctx.arc(pickup.x, pickup.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = pickup.type === 'health' ? '#ff3366' : '#00ff88';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = '12px Rajdhani';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(pickup.type === 'health' ? '+' : '$', pickup.x, pickup.y + 4);
    }

    for (const p of this.projectiles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = p.isCrit ? '#ffff00' : '#00ff88';
      ctx.fill();
    }

    for (const e of this.enemies) {
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      ctx.fillStyle = e.color;
      ctx.fill();

      const healthPercent = e.health / e.maxHealth;
      ctx.fillStyle = '#333333';
      ctx.fillRect(e.x - e.size, e.y - e.size - 10, e.size * 2, 4);
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(e.x - e.size, e.y - e.size - 10, e.size * 2 * healthPercent, 4);
    }

    ctx.beginPath();
    ctx.arc(this.player.x, this.player.y, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff88';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  drawGrid(ctx) {
    ctx.strokeStyle = '#1a1a24';
    ctx.lineWidth = 1;
    const gridSize = 50;

    for (let x = 0; x < this.canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y < this.canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }
  }

  applyUpgrade(upgrade) {
    upgrade.apply(this.player);
    this.player.maxHealth = Math.max(5, this.player.maxHealth);
    this.player.health = Math.min(this.player.health, this.player.maxHealth);
    this.player.speed = Math.max(100, this.player.speed);
    this.player.fireRate = Math.max(100, this.player.fireRate);
    this.updateStats();
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  endGame() {
    this.isRunning = false;
    this.gameOver = true;
    clearInterval(this.timerInterval);
    this.onComplete({ score: this.score, kills: this.kills });
  }

  showUpgrades() {
    const upgradeModal = document.getElementById('upgradeModal');
    const upgradeCards = document.getElementById('upgradeCards');

    const shuffled = [...UPGRADES].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    upgradeCards.innerHTML = '';
    selected.forEach(upgrade => {
      const card = document.createElement('div');
      card.className = 'upgrade-card';
      card.innerHTML = `
        <div class="upgrade-icon">${upgrade.icon}</div>
        <div class="upgrade-name">${upgrade.name}</div>
        <div class="upgrade-description">${upgrade.description}</div>
      `;
      card.addEventListener('click', () => {
        this.applyUpgrade(upgrade);
        upgradeModal.classList.add('hidden');
        this.resumeGame();
      });
      upgradeCards.appendChild(card);
    });

    upgradeModal.classList.remove('hidden');
  }

  resumeGame() {
    this.isRunning = true;
    this.gameLoop();
    this.spawnTimer();
  }

  destroy() {
    this.isRunning = false;
    this.gameOver = true;
    clearInterval(this.timerInterval);
    window.removeEventListener('resize', this.resizeHandler);
  }
}

window.RoguelikeGame = RoguelikeGame;
