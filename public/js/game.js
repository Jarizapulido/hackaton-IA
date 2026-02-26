class FitSurvivorGame {
    constructor() {
        this.config = {
            type: Phaser.AUTO,
            parent: 'phaserGame',
            width: 600,
            height: 400,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            },
            scene: {
                preload: this.preload.bind(this),
                create: this.create.bind(this),
                update: this.update.bind(this)
            }
        };
        this.game = null;
        this.player = null;
        this.enemies = null;
        this.projectiles = null;
        this.stats = {
            speed: 150,
            damage: 10,
            fireRate: 1000,
            health: 100,
            maxHealth: 100,
            projectileSpeed: 300,
            area: 1
        };
        this.lastFired = 0;
        this.isPaused = true;
    }

    init() {
        if (!this.game) {
            this.game = new Phaser.Game(this.config);
        }
    }

    preload() {
        // Using graphics instead of assets for prototype
    }

    create() {
        const scene = this.game.scene.scenes[0];
        
        // Player
        this.player = scene.add.circle(300, 200, 15, 0x00ff88);
        scene.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        // Groups
        this.enemies = scene.physics.add.group();
        this.projectiles = scene.physics.add.group();

        // Collisions
        scene.physics.add.overlap(this.projectiles, this.enemies, this.handleProjectileHit, null, this);
        scene.physics.add.overlap(this.player, this.enemies, this.handlePlayerHit, null, this);

        // Spawn timer
        this.spawnTimer = scene.time.addEvent({
            delay: 2000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }

    update(time, _delta) {
        if (this.isPaused) return;

        const scene = this.game.scene.scenes[0];
        const pointer = scene.input.activePointer;

        // Move player towards mouse
        if (pointer.isDown || true) { // Always follow mouse if active
            const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.x, pointer.y);
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, pointer.x, pointer.y);
            
            if (distance > 5) {
                this.player.body.setVelocity(
                    Math.cos(angle) * this.stats.speed,
                    Math.sin(angle) * this.stats.speed
                );
            } else {
                this.player.body.setVelocity(0, 0);
            }
        }

        // Auto-fire at nearest enemy
        if (time > this.lastFired) {
            this.fireAtNearestEnemy(time);
        }

        // Move enemies towards player
        this.enemies.getChildren().forEach(enemy => {
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
            enemy.body.setVelocity(
                Math.cos(angle) * 80,
                Math.sin(angle) * 80
            );
        });
    }

    spawnEnemy() {
        if (this.isPaused) return;
        const scene = this.game.scene.scenes[0];
        
        // Spawn at random edge
        let x, y;
        if (Math.random() > 0.5) {
            x = Math.random() > 0.5 ? -20 : 620;
            y = Math.random() * 400;
        } else {
            x = Math.random() * 600;
            y = Math.random() > 0.5 ? -20 : 420;
        }

        const enemy = scene.add.rectangle(x, y, 20, 20, 0xff3366);
        this.enemies.add(enemy);
        enemy.health = 20;
    }

    fireAtNearestEnemy(time) {
        const scene = this.game.scene.scenes[0];
        let nearestEnemy = null;
        let minDistance = Infinity;

        this.enemies.getChildren().forEach(enemy => {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            if (dist < minDistance) {
                minDistance = dist;
                nearestEnemy = enemy;
            }
        });

        if (nearestEnemy && minDistance < 300) {
            const projectile = scene.add.circle(this.player.x, this.player.y, 5, 0x6366f1);
            this.projectiles.add(projectile);
            
            const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, nearestEnemy.x, nearestEnemy.y);
            projectile.body.setVelocity(
                Math.cos(angle) * this.stats.projectileSpeed,
                Math.sin(angle) * this.stats.projectileSpeed
            );
            
            this.lastFired = time + this.stats.fireRate;
            
            // Destroy projectile after some time
            scene.time.delayedCall(2000, () => {
                if (projectile.active) projectile.destroy();
            });
        }
    }

    handleProjectileHit(projectile, enemy) {
        projectile.destroy();
        enemy.health -= this.stats.damage;
        if (enemy.health <= 0) {
            enemy.destroy();
        }
    }

    handlePlayerHit(_player, _enemy) {
        // Simple knockback and damage
        this.stats.health -= 0.1; // Continuous damage
        if (this.stats.health <= 0) {
            // Reset health for prototype
            this.stats.health = this.stats.maxHealth;
        }
    }

    pause() {
        this.isPaused = true;
        if (this.game && this.game.scene.scenes[0]) {
            this.game.scene.scenes[0].physics.world.pause();
        }
    }

    resume() {
        this.isPaused = false;
        if (this.game && this.game.scene.scenes[0]) {
            this.game.scene.scenes[0].physics.world.resume();
        }
    }

    applyUpgrade(upgrade) {
        switch(upgrade.type) {
            case 'speed': this.stats.speed += 20; break;
            case 'damage': this.stats.damage += 5; break;
            case 'fireRate': this.stats.fireRate = Math.max(200, this.stats.fireRate - 100); break;
            case 'health': 
                this.stats.maxHealth += 20; 
                this.stats.health = this.stats.maxHealth; 
                break;
        }
    }
}

window.gameInstance = new FitSurvivorGame();
