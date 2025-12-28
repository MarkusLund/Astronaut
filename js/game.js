// Main game logic
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.spaceship = null;
        this.currentLevel = null;
        this.currentLevelId = 1;
        this.gameState = 'menu'; // menu, ready, playing, paused, won, lost
        this.stars = [];
        this.clouds = [];
        this.craters = [];

        this.keys = {
            up: false,
            left: false,
            right: false
        };

        // Mobile detection
        this.isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        this.hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.isPortrait = window.innerHeight > window.innerWidth;
        this.scaleFactor = 1;
        this.tiltEnabled = false;
        this.currentTilt = 0;
        this.touchActive = false;

        this.landingPad = {
            x: 0,
            y: 0,
            width: 100,
            height: 15,
            baseX: 0,          // For moving platforms
            moveSpeed: 0,
            moveRange: 0
        };

        this.groundHeight = 100;

        // Explosion particles
        this.explosionParticles = [];
        this.isExploding = false;

        // Progress tracking
        this.highestLevelUnlocked = this.loadProgress();

        this.init();
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('rocketGameProgress');
            return saved ? parseInt(saved, 10) : 1;
        } catch (e) {
            return 1;
        }
    }

    saveProgress() {
        try {
            localStorage.setItem('rocketGameProgress', this.highestLevelUnlocked.toString());
        } catch (e) {
            // localStorage not available
        }
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Initialize sound on first interaction
        document.addEventListener('click', () => {
            soundManager.init();
            soundManager.resume();
        }, { once: true });

        document.addEventListener('keydown', () => {
            soundManager.init();
            soundManager.resume();
        }, { once: true });

        // Keyboard controls
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Button handlers
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.getElementById('restart-button').addEventListener('click', () => this.restartGame());
        document.getElementById('sound-toggle').addEventListener('click', () => this.toggleSound());
        document.getElementById('message-button').addEventListener('click', () => this.handleMessageButton());

        // Generate stars
        this.generateStars();

        // Populate start menu level selector
        this.updateStartMenuLevelSelect();

        // Initialize touch controls on any touch-capable device
        if (this.hasTouch) {
            this.initTouchControls();
            // Update instructions for touch-capable devices
            this.setupTouchUI();
        }

        // Initialize mobile-specific controls (tilt, UI)
        if (this.isMobile) {
            this.initTiltControls();
            this.setupMobileUI();
        }

        // Start animation loop
        this.animate();
    }

    initTouchControls() {
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchActive = true;
            this.keys.up = true;

            // Start game if in 'ready' state
            if (this.gameState === 'ready') {
                this.gameState = 'playing';
                soundManager.startThrust();
            }

            // Retry level if crashed
            if (this.gameState === 'lost') {
                this.retryCurrentLevel();
            }
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchActive = false;
            this.keys.up = false;
            soundManager.stopThrust();
        }, { passive: false });

        this.canvas.addEventListener('touchcancel', (e) => {
            this.touchActive = false;
            this.keys.up = false;
            soundManager.stopThrust();
        });
    }

    initTiltControls() {
        window.addEventListener('deviceorientation', (e) => {
            if (!this.tiltEnabled) return;
            if (this.gameState !== 'playing' && this.gameState !== 'ready') return;

            // gamma = left/right tilt (-90 to 90 degrees)
            this.currentTilt = e.gamma || 0;

            // Dead zone to avoid unintended movement
            const deadZone = 5;

            if (Math.abs(this.currentTilt) < deadZone) {
                this.keys.left = false;
                this.keys.right = false;
            } else if (this.currentTilt < -deadZone) {
                this.keys.left = true;
                this.keys.right = false;
            } else if (this.currentTilt > deadZone) {
                this.keys.left = false;
                this.keys.right = true;
            }
        });
    }

    async requestMotionPermission() {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                return permission === 'granted';
            } catch (e) {
                console.error('Motion permission denied:', e);
                return false;
            }
        }
        // Android / older iOS - no permission needed
        return true;
    }

    setupMobileUI() {
        // Show mobile elements, hide desktop elements
        document.querySelectorAll('.desktop-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.mobile-only').forEach(el => el.style.display = 'block');

        // Setup motion permission button
        const motionBtn = document.getElementById('enable-motion-btn');
        if (motionBtn) {
            motionBtn.style.display = 'block';

            motionBtn.addEventListener('click', async () => {
                const granted = await this.requestMotionPermission();
                if (granted) {
                    this.tiltEnabled = true;
                    motionBtn.textContent = 'Styring aktivert! ✓';
                    motionBtn.disabled = true;
                    motionBtn.classList.add('enabled');
                } else {
                    motionBtn.textContent = 'Ikke tilgjengelig';
                    motionBtn.disabled = true;
                }
            });
        }
    }

    setupTouchUI() {
        // Hide desktop-only instructions (arrow keys) for touch devices
        document.querySelectorAll('.desktop-only').forEach(el => el.style.display = 'none');
        // Show touch instructions (but not motion button - that's for isMobile only)
        document.querySelectorAll('.mobile-only').forEach(el => {
            if (!el.classList.contains('motion-btn')) {
                el.style.display = 'block';
            }
        });
    }

    updateStartMenuLevelSelect() {
        const container = document.getElementById('start-level-select');
        if (!container) return;

        let html = '';
        const totalLevels = LEVELS.length;

        for (let i = 1; i <= totalLevels; i++) {
            const level = getLevel(i);
            const isUnlocked = i <= this.highestLevelUnlocked;
            const className = `level-btn ${isUnlocked ? 'unlocked' : 'locked'}`;

            if (isUnlocked) {
                html += `<button class="${className}" onclick="game.startAtLevel(${i})">${i}<br><small>${level.nameNorwegian}</small></button>`;
            } else {
                html += `<button class="${className}" disabled>🔒<br><small>???</small></button>`;
            }
        }

        container.innerHTML = html;
    }

    startAtLevel(levelId) {
        soundManager.playClick();
        this.currentLevelId = levelId;
        this.loadLevel(levelId);
        this.showScreen('game-screen');
        this.gameState = 'ready';
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.isPortrait = window.innerHeight > window.innerWidth;

        // Calculate scale factor based on screen width
        const baseWidth = 800;  // Reference width (desktop)
        this.scaleFactor = Math.min(1, this.canvas.width / baseWidth);

        // Mobile portrait: scale down further
        if (this.isMobile && this.isPortrait) {
            this.scaleFactor *= 0.7;
        }

        this.groundHeight = Math.min(120, this.canvas.height * 0.15);

        // Update spaceship scale if exists
        if (this.spaceship) {
            this.spaceship.setScale(this.scaleFactor);
        }
    }

    generateStars() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.canvas.height - this.groundHeight),
                size: Math.random() * 2 + 1,
                twinkle: Math.random() * Math.PI * 2
            });
        }
    }

    generateLevelFeatures() {
        if (!this.currentLevel) return;

        // Generate clouds for Earth
        this.clouds = [];
        if (this.currentLevel.features.clouds) {
            for (let i = 0; i < 5; i++) {
                this.clouds.push({
                    x: Math.random() * this.canvas.width,
                    y: 50 + Math.random() * 150,
                    width: 80 + Math.random() * 60,
                    speed: 0.2 + Math.random() * 0.3
                });
            }
        }

        // Generate craters for Moon/Mars
        this.craters = [];
        if (this.currentLevel.features.craters) {
            for (let i = 0; i < 8; i++) {
                this.craters.push({
                    x: Math.random() * this.canvas.width,
                    radius: 15 + Math.random() * 25
                });
            }
        }
    }

    handleKeyDown(e) {
        // Start game when pressing up arrow in ready state
        if (this.gameState === 'ready') {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                this.gameState = 'playing';
                this.keys.up = true;
                soundManager.startThrust();
                return;
            }
        }

        // Retry level when pressing up arrow after crash
        if (this.gameState === 'lost') {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                this.retryCurrentLevel();
                return;
            }
        }

        if (this.gameState !== 'playing') return;

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                if (!this.keys.up) {
                    this.keys.up = true;
                    soundManager.startThrust();
                }
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                this.keys.left = true;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                this.keys.right = true;
                break;
        }
    }

    handleKeyUp(e) {
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                this.keys.up = false;
                soundManager.stopThrust();
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.keys.left = false;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.keys.right = false;
                break;
        }
    }

    startGame() {
        soundManager.playClick();
        this.currentLevelId = 1;
        this.loadLevel(this.currentLevelId);
        this.showScreen('game-screen');
        this.gameState = 'ready';
    }

    restartGame() {
        soundManager.playClick();
        this.currentLevelId = 1;
        this.loadLevel(this.currentLevelId);
        this.showScreen('game-screen');
        this.gameState = 'ready';
    }

    loadLevel(levelId) {
        this.currentLevel = getLevel(levelId);
        this.generateLevelFeatures();
        this.generateStars();

        // Set landing pad width - scale for mobile portrait
        let padWidth = this.currentLevel.landingPadWidth;
        if (this.isMobile && this.isPortrait) {
            // Make platform relative to screen width (28-35%)
            padWidth = Math.max(80, this.canvas.width * 0.30);
        }
        this.landingPad.width = padWidth;

        // Set landing pad position (use level's position or default to center)
        const padPosition = this.currentLevel.landingPadPosition !== undefined
            ? this.currentLevel.landingPadPosition
            : 0.5;
        // Calculate x position with padding from edges
        const padding = this.isMobile ? 30 : 50;
        const availableWidth = this.canvas.width - padding * 2 - this.landingPad.width;
        this.landingPad.x = padding + (availableWidth * padPosition);
        this.landingPad.baseX = this.landingPad.x;  // Store base position for moving platforms
        this.landingPad.y = this.canvas.height - this.groundHeight;

        // Moving platform settings - reduce range on mobile portrait
        this.landingPad.moveSpeed = this.currentLevel.movingPlatform?.speed || 0;
        let moveRange = this.currentLevel.movingPlatform?.range || 0;
        if (this.isMobile && this.isPortrait && moveRange > 0) {
            moveRange = Math.min(moveRange, (this.canvas.width - this.landingPad.width - padding * 2) / 2);
        }
        this.landingPad.moveRange = moveRange;

        // Clear explosion
        this.isExploding = false;
        this.explosionParticles = [];

        // Create spaceship
        this.spaceship = new Spaceship(
            this.canvas.width / 2,
            80
        );
        this.spaceship.fuel = this.currentLevel.startFuel;
        this.spaceship.setScale(this.scaleFactor);

        // Update UI
        const levelNameEl = document.getElementById('level-name');
        levelNameEl.textContent = this.currentLevel.nameNorwegian;
        levelNameEl.setAttribute('data-level', this.currentLevelId);

        // Reset keys
        this.keys = { up: false, left: false, right: false };
        soundManager.stopThrust();
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
        document.getElementById('message-overlay').classList.add('hidden');
    }

    showMessage(title, text, buttonText, isSuccess = false) {
        const box = document.getElementById('message-box');

        // Restore original structure (in case it was replaced by level selector)
        box.innerHTML = `
            <h2 id="message-title"></h2>
            <p id="message-text"></p>
            <button id="message-button" class="big-button"></button>
        `;

        document.getElementById('message-title').textContent = title;
        document.getElementById('message-text').textContent = text;
        document.getElementById('message-button').textContent = buttonText;
        document.getElementById('message-button').onclick = () => this.handleMessageButton();
        document.getElementById('message-overlay').classList.remove('hidden');

        if (isSuccess) {
            this.createConfetti();
        }
    }

    createConfetti() {
        const container = document.getElementById('confetti-container');
        container.innerHTML = '';

        const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#1dd1a1'];

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';

            if (Math.random() > 0.5) {
                confetti.style.borderRadius = '50%';
            }

            container.appendChild(confetti);
        }
    }

    handleMessageButton() {
        soundManager.playClick();
        document.getElementById('message-overlay').classList.add('hidden');
        document.getElementById('confetti-container').innerHTML = '';

        if (this.gameState === 'won') {
            // Check if there's a next level
            if (isLastLevel(this.currentLevelId)) {
                // Show win screen
                soundManager.playFanfare();
                this.showScreen('win-screen');
                this.gameState = 'complete';
            } else {
                // Load next level
                this.currentLevelId++;
                this.loadLevel(this.currentLevelId);
                this.gameState = 'ready';
            }
        } else if (this.gameState === 'lost') {
            // Retry current level
            this.loadLevel(this.currentLevelId);
            this.gameState = 'ready';
        }
    }

    toggleSound() {
        const enabled = soundManager.toggle();
        document.getElementById('sound-toggle').textContent = enabled ? '🔊' : '🔇';
    }

    update() {
        // Always update explosion even when not playing
        this.updateExplosion();

        // Update moving platform
        if (this.currentLevel && this.landingPad.moveSpeed > 0) {
            const time = Date.now() / 1000;
            this.landingPad.x = this.landingPad.baseX +
                Math.sin(time * this.landingPad.moveSpeed) * this.landingPad.moveRange;
        }

        if (this.gameState !== 'playing' || !this.spaceship) return;

        // Update spaceship
        this.spaceship.update(
            this.currentLevel.gravity,
            this.currentLevel.thrustPower,
            this.keys
        );

        // Check boundaries (allow flying high up, but not off sides)
        if (this.spaceship.x < 30) {
            this.spaceship.x = 30;
            this.spaceship.velocityX = Math.abs(this.spaceship.velocityX) * 0.5;
        }
        if (this.spaceship.x > this.canvas.width - 30) {
            this.spaceship.x = this.canvas.width - 30;
            this.spaceship.velocityX = -Math.abs(this.spaceship.velocityX) * 0.5;
        }
        // Allow flying very high (up to 2000 pixels above screen)
        const maxHeight = -2000;
        if (this.spaceship.y < maxHeight) {
            this.spaceship.y = maxHeight;
            this.spaceship.velocityY = Math.abs(this.spaceship.velocityY) * 0.3;
        }

        // Check landing/crash
        const bounds = this.spaceship.getBounds();
        const groundY = this.canvas.height - this.groundHeight;

        if (bounds.bottom >= groundY) {
            this.checkLanding();
        }

        // Update UI
        this.updateUI();

        // Update clouds
        this.clouds.forEach(cloud => {
            cloud.x += cloud.speed;
            if (cloud.x > this.canvas.width + cloud.width) {
                cloud.x = -cloud.width;
            }
        });
    }

    checkLanding() {
        const speed = this.spaceship.getSpeed();
        const angle = Math.abs(this.spaceship.angle);
        const onPad = this.spaceship.x >= this.landingPad.x &&
                      this.spaceship.x <= this.landingPad.x + this.landingPad.width;

        const goodSpeed = speed <= this.currentLevel.maxLandingSpeed;
        const goodAngle = angle <= this.currentLevel.maxLandingAngle;

        // Stop spaceship
        this.spaceship.velocityX = 0;
        this.spaceship.velocityY = 0;
        this.spaceship.y = this.canvas.height - this.groundHeight - this.spaceship.height / 2;

        soundManager.stopThrust();
        this.keys = { up: false, left: false, right: false };

        if (onPad && goodSpeed && goodAngle) {
            // Successful landing!
            this.gameState = 'won';
            soundManager.playLanding();

            // Update progress
            if (this.currentLevelId >= this.highestLevelUnlocked) {
                this.highestLevelUnlocked = this.currentLevelId + 1;
                this.saveProgress();
            }

            const nextLevel = getNextLevel(this.currentLevelId);
            const buttonText = nextLevel ? `Neste: ${nextLevel.nameNorwegian}!` : 'Fortsett';

            setTimeout(() => {
                this.showMessage(
                    'HURRA!',
                    this.currentLevel.successMessage,
                    buttonText,
                    true
                );
            }, 500);
        } else {
            // Failed landing
            this.gameState = 'lost';
            soundManager.playCrash();

            let reason = '';
            let showExplosion = false;

            if (!goodSpeed) {
                // Too fast = explosion!
                reason = 'Du kom for fort ned!';
                showExplosion = true;
            } else if (!onPad) {
                // Missed platform = sad spaceship
                reason = 'Du bommet på landingsplattformen!';
                this.spaceship.isSad = true;
            } else if (!goodAngle) {
                // Wrong angle = sad spaceship
                reason = 'Romskipet var for skjevt!';
                this.spaceship.isSad = true;
            }

            if (showExplosion) {
                this.createExplosion(this.spaceship.x, this.spaceship.y);
            }

            setTimeout(() => {
                this.showLevelSelect(reason);
            }, showExplosion ? 1200 : 1500);
        }
    }

    createExplosion(x, y) {
        this.isExploding = true;
        this.explosionParticles = [];

        // Create explosion particles
        const colors = ['#ff6b6b', '#feca57', '#ff9f43', '#ee5a24', '#f8c291', '#ffffff'];
        for (let i = 0; i < 40; i++) {
            const angle = (Math.PI * 2 * i) / 40 + Math.random() * 0.5;
            const speed = 2 + Math.random() * 6;
            this.explosionParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                size: 4 + Math.random() * 8,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1.0,
                decay: 0.015 + Math.random() * 0.01
            });
        }

        // Add some debris pieces
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 4;
            this.explosionParticles.push({
                x: x + (Math.random() - 0.5) * 30,
                y: y + (Math.random() - 0.5) * 30,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 3,
                size: 6 + Math.random() * 10,
                color: '#636e72',
                life: 1.0,
                decay: 0.01,
                isDebris: true
            });
        }
    }

    updateExplosion() {
        if (!this.isExploding) return;

        let allDead = true;
        this.explosionParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.15; // gravity
            p.life -= p.decay;
            if (p.life > 0) allDead = false;
        });

        if (allDead) {
            this.isExploding = false;
            this.explosionParticles = [];
        }
    }

    drawExplosion() {
        if (!this.isExploding) return;

        this.explosionParticles.forEach(p => {
            if (p.life <= 0) return;

            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;

            if (p.isDebris) {
                // Draw debris as rectangles
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.x * 0.1);
                this.ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2);
                this.ctx.restore();
            } else {
                // Draw particles as circles
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        this.ctx.globalAlpha = 1;
    }

    showLevelSelect(reason) {
        const overlay = document.getElementById('message-overlay');
        const box = document.getElementById('message-box');

        // Build level selector HTML
        let levelsHtml = '<div class="level-select-grid">';
        const totalLevels = LEVELS.length;

        for (let i = 1; i <= totalLevels; i++) {
            const level = getLevel(i);
            const isUnlocked = i <= this.highestLevelUnlocked;
            const isCurrent = i === this.currentLevelId;
            const className = `level-btn ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`;

            if (isUnlocked) {
                levelsHtml += `<button class="${className}" onclick="game.selectLevel(${i})">${i}<br><small>${level.nameNorwegian}</small></button>`;
            } else {
                levelsHtml += `<button class="${className}" disabled>🔒<br><small>???</small></button>`;
            }
        }
        levelsHtml += '</div>';

        const retryHint = this.hasTouch
            ? 'Trykk på skjermen for å prøve igjen!'
            : 'Trykk ↑ for å prøve igjen raskt!';

        box.innerHTML = `
            <h2 id="message-title" style="color: #ff6b6b;">Oj!</h2>
            <p id="message-text">${reason}</p>
            <p style="margin: 15px 0; color: #dfe6e9;">Velg nivå:</p>
            ${levelsHtml}
            <button class="big-button" onclick="game.retryCurrentLevel()" style="margin-top: 20px;">Prøv igjen</button>
            <p style="margin-top: 15px; color: #74b9ff; font-size: 0.9rem;">${retryHint}</p>
        `;

        overlay.classList.remove('hidden');
    }

    selectLevel(levelId) {
        soundManager.playClick();
        document.getElementById('message-overlay').classList.add('hidden');
        this.currentLevelId = levelId;
        this.loadLevel(levelId);
        this.gameState = 'ready';
    }

    retryCurrentLevel() {
        soundManager.playClick();
        document.getElementById('message-overlay').classList.add('hidden');
        this.loadLevel(this.currentLevelId);
        this.gameState = 'ready';
    }

    updateUI() {
        // Speed display
        const speed = Math.round(this.spaceship.getSpeed() * 10);
        const speedEl = document.getElementById('speed-value');
        speedEl.textContent = speed;

        // Color code speed
        speedEl.className = 'stat-value';
        if (speed > this.currentLevel.maxLandingSpeed * 15) {
            speedEl.classList.add('danger');
        } else if (speed > this.currentLevel.maxLandingSpeed * 10) {
            speedEl.classList.add('warning');
        }

        // Fuel display (scale to percentage of starting fuel)
        const fuelFill = document.getElementById('fuel-fill');
        const fuelPercent = (this.spaceship.fuel / this.currentLevel.startFuel) * 100;
        fuelFill.style.width = Math.min(100, fuelPercent) + '%';

        fuelFill.className = '';
        if (fuelPercent < 20) {
            fuelFill.classList.add('critical');
        } else if (fuelPercent < 40) {
            fuelFill.classList.add('low');
        }
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.gameState === 'menu') return;
        if (!this.currentLevel) return;

        // Draw sky gradient
        this.drawSky();

        // Draw stars
        this.drawStars();

        // Draw clouds (Earth only)
        if (this.currentLevel.features.clouds) {
            this.drawClouds();
        }

        // Draw ground
        this.drawGround();

        // Draw craters (Moon/Mars)
        if (this.currentLevel.features.craters) {
            this.drawCraters();
        }

        // Draw mountains (Mars)
        if (this.currentLevel.features.mountains) {
            this.drawMountains();
        }

        // Draw landing pad
        this.drawLandingPad();

        // Draw spaceship (hide when exploding)
        if (this.spaceship && !this.isExploding) {
            this.spaceship.draw(this.ctx);
        }

        // Draw explosion
        this.drawExplosion();

        // Draw landing guide
        if (this.gameState === 'playing' || this.gameState === 'ready') {
            this.drawLandingGuide();
        }

        // Draw "Press up to start" message in ready state
        if (this.gameState === 'ready') {
            this.drawReadyMessage();
        }

        // Draw altitude indicator
        if (this.gameState === 'playing' || this.gameState === 'ready') {
            this.drawAltitudeIndicator();
        }

        // Draw off-screen arrow if spaceship is above view
        if (this.spaceship && this.spaceship.y < 0) {
            this.drawOffScreenArrow();
        }
    }

    drawReadyMessage() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Pulsing animation
        const pulse = 0.8 + 0.2 * Math.sin(Date.now() / 300);

        // Different text for touch vs keyboard, size for mobile
        const message = this.hasTouch ? 'Trykk for å starte!' : 'Trykk ↑ for å starte!';
        const boxWidth = this.hasTouch ? 280 : 360;
        const fontSize = this.hasTouch ? 24 : 28;

        // Background box
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.beginPath();
        this.ctx.roundRect(centerX - boxWidth/2, centerY - 50, boxWidth, 100, 20);
        this.ctx.fill();

        // Border
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();

        // Text
        this.ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
        this.ctx.font = `bold ${fontSize}px "Comic Sans MS", sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(message, centerX, centerY);
    }

    drawAltitudeIndicator() {
        if (!this.spaceship) return;

        const barX = 25;
        const barY = 80;
        const barWidth = 20;
        const barHeight = this.canvas.height - 160;
        const groundY = this.canvas.height - this.groundHeight;

        // Calculate altitude (0 = ground, maxHeight = top)
        const maxAltitude = 2000 + groundY; // Total possible height
        const currentAltitude = groundY - this.spaceship.y;
        const altitudePercent = Math.max(0, Math.min(1, currentAltitude / maxAltitude));

        // Background bar
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.beginPath();
        this.ctx.roundRect(barX, barY, barWidth, barHeight, 10);
        this.ctx.fill();

        // Border
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Ground zone (bottom part - green)
        const groundZoneHeight = 40;
        this.ctx.fillStyle = this.currentLevel.groundGradient[0];
        this.ctx.beginPath();
        this.ctx.roundRect(barX + 2, barY + barHeight - groundZoneHeight, barWidth - 4, groundZoneHeight - 2, [0, 0, 8, 8]);
        this.ctx.fill();

        // Landing pad marker
        const padY = barY + barHeight - 25;
        this.ctx.fillStyle = this.currentLevel.colors.platform;
        this.ctx.fillRect(barX + 2, padY, barWidth - 4, 6);

        // Sky gradient in bar
        const skyGradient = this.ctx.createLinearGradient(0, barY, 0, barY + barHeight - groundZoneHeight);
        skyGradient.addColorStop(0, 'rgba(10, 10, 40, 0.8)');
        skyGradient.addColorStop(0.5, 'rgba(30, 30, 80, 0.6)');
        skyGradient.addColorStop(1, this.currentLevel.skyGradient[2]);
        this.ctx.fillStyle = skyGradient;
        this.ctx.beginPath();
        this.ctx.roundRect(barX + 2, barY + 2, barWidth - 4, barHeight - groundZoneHeight - 4, [8, 8, 0, 0]);
        this.ctx.fill();

        // Small stars in the bar
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 8; i++) {
            const starY = barY + 20 + i * 35;
            const starX = barX + 5 + (i % 3) * 5;
            this.ctx.beginPath();
            this.ctx.arc(starX, starY, 1, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Spaceship position indicator
        const shipIndicatorY = barY + barHeight - (altitudePercent * barHeight) - 5;
        const clampedShipY = Math.max(barY + 10, Math.min(barY + barHeight - 15, shipIndicatorY));

        // Rocket icon
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.moveTo(barX + barWidth + 8, clampedShipY);
        this.ctx.lineTo(barX + barWidth + 18, clampedShipY - 6);
        this.ctx.lineTo(barX + barWidth + 18, clampedShipY + 6);
        this.ctx.closePath();
        this.ctx.fill();

        // Rocket body circle
        this.ctx.beginPath();
        this.ctx.arc(barX + barWidth + 22, clampedShipY, 6, 0, Math.PI * 2);
        this.ctx.fill();

        // Altitude label
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 11px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('HØYDE', barX + barWidth / 2, barY - 8);

        // Altitude number
        const altitudeMeters = Math.round(currentAltitude / 2); // Scale to "meters"
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(altitudeMeters + 'm', barX + barWidth + 10, barY + barHeight + 20);
    }

    drawOffScreenArrow() {
        if (!this.spaceship) return;

        const arrowX = this.spaceship.x;
        const arrowY = 60;

        // Pulsing effect
        const pulse = 0.7 + 0.3 * Math.sin(Date.now() / 200);

        // Arrow background
        this.ctx.fillStyle = `rgba(255, 107, 107, ${pulse})`;
        this.ctx.beginPath();
        this.ctx.moveTo(arrowX, arrowY - 20);
        this.ctx.lineTo(arrowX - 20, arrowY + 10);
        this.ctx.lineTo(arrowX - 8, arrowY + 10);
        this.ctx.lineTo(arrowX - 8, arrowY + 25);
        this.ctx.lineTo(arrowX + 8, arrowY + 25);
        this.ctx.lineTo(arrowX + 8, arrowY + 10);
        this.ctx.lineTo(arrowX + 20, arrowY + 10);
        this.ctx.closePath();
        this.ctx.fill();

        // Arrow border
        this.ctx.strokeStyle = '#c0392b';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Small rocket icon in arrow
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🚀', arrowX, arrowY + 20);

        // Distance text
        const distance = Math.abs(Math.round(this.spaceship.y / 2));
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillText(distance + 'm', arrowX, arrowY + 45);
    }

    drawSky() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        const colors = this.currentLevel.skyGradient;
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(0.5, colors[1]);
        gradient.addColorStop(1, colors[2]);

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawStars() {
        const time = Date.now() / 1000;

        this.stars.forEach(star => {
            const twinkle = 0.5 + 0.5 * Math.sin(time * 2 + star.twinkle);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

        this.clouds.forEach(cloud => {
            // Simple cloud shape
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.width / 4, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.width / 3, cloud.y - 10, cloud.width / 3, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.width / 1.5, cloud.y, cloud.width / 4, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawGround() {
        const groundY = this.canvas.height - this.groundHeight;
        const colors = this.currentLevel.groundGradient;

        // Ground gradient
        const gradient = this.ctx.createLinearGradient(0, groundY, 0, this.canvas.height);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(0.5, colors[1]);
        gradient.addColorStop(1, colors[2]);

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, groundY, this.canvas.width, this.groundHeight);

        // Ground edge highlight
        this.ctx.strokeStyle = colors[0];
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, groundY);
        this.ctx.lineTo(this.canvas.width, groundY);
        this.ctx.stroke();
    }

    drawCraters() {
        const groundY = this.canvas.height - this.groundHeight;

        this.craters.forEach(crater => {
            // Crater shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.beginPath();
            this.ctx.ellipse(crater.x, groundY + 15, crater.radius, crater.radius / 3, 0, 0, Math.PI * 2);
            this.ctx.fill();

            // Crater rim
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.beginPath();
            this.ctx.ellipse(crater.x, groundY + 10, crater.radius + 5, crater.radius / 3 + 2, 0, 0, Math.PI);
            this.ctx.fill();
        });
    }

    drawMountains() {
        const groundY = this.canvas.height - this.groundHeight;

        // Background mountains
        this.ctx.fillStyle = this.currentLevel.groundGradient[2];

        const mountainPoints = [
            { x: 0, peak: 60 },
            { x: this.canvas.width * 0.2, peak: 100 },
            { x: this.canvas.width * 0.4, peak: 70 },
            { x: this.canvas.width * 0.6, peak: 120 },
            { x: this.canvas.width * 0.8, peak: 80 },
            { x: this.canvas.width, peak: 50 }
        ];

        this.ctx.beginPath();
        this.ctx.moveTo(0, groundY);

        mountainPoints.forEach((point, i) => {
            this.ctx.lineTo(point.x, groundY - point.peak);
            if (i < mountainPoints.length - 1) {
                const nextPoint = mountainPoints[i + 1];
                const midX = (point.x + nextPoint.x) / 2;
                const midY = groundY - Math.min(point.peak, nextPoint.peak) * 0.7;
                this.ctx.lineTo(midX, midY);
            }
        });

        this.ctx.lineTo(this.canvas.width, groundY);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawLandingPad() {
        const colors = this.currentLevel.colors;

        // Platform shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(
            this.landingPad.x + 5,
            this.landingPad.y + 5,
            this.landingPad.width,
            this.landingPad.height
        );

        // Platform
        this.ctx.fillStyle = colors.platform;
        this.ctx.strokeStyle = colors.platformBorder;
        this.ctx.lineWidth = 4;
        this.ctx.fillRect(
            this.landingPad.x,
            this.landingPad.y,
            this.landingPad.width,
            this.landingPad.height
        );
        this.ctx.strokeRect(
            this.landingPad.x,
            this.landingPad.y,
            this.landingPad.width,
            this.landingPad.height
        );

        // Landing stripes
        this.ctx.fillStyle = colors.platformBorder;
        const stripeCount = 5;
        const stripeWidth = 4;
        const gap = (this.landingPad.width - stripeCount * stripeWidth) / (stripeCount + 1);

        for (let i = 0; i < stripeCount; i++) {
            const x = this.landingPad.x + gap + i * (stripeWidth + gap);
            this.ctx.fillRect(x, this.landingPad.y + 3, stripeWidth, this.landingPad.height - 6);
        }

        // "H" marking
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('H', this.landingPad.x + this.landingPad.width / 2, this.landingPad.y - 5);
    }

    drawLandingGuide() {
        if (!this.spaceship) return;

        // Draw a subtle guide line from spaceship to landing pad
        const padCenterX = this.landingPad.x + this.landingPad.width / 2;

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.spaceship.x, this.spaceship.y + 40);
        this.ctx.lineTo(padCenterX, this.landingPad.y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    window.game = new Game();
});
