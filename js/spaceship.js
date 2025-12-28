// Spaceship class with physics
class Spaceship {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.angle = 0;          // Rotation in degrees
        this.width = 40;
        this.height = 60;
        this.fuel = 100;
        this.isThrusting = false;
        this.flameSize = 0;
        this.eyeOffset = 0;      // For cute eye animation

        // New movement system constants
        this.horizontalPower = 0.08;      // Horizontal acceleration
        this.tiltAmount = 0.8;            // How much the ship tilts when moving
        this.stabilizationSpeed = 0.5;    // How fast the ship rights itself
        this.maxTilt = 25;                // Maximum tilt angle

        // Sad state (when missing platform)
        this.isSad = false;
    }

    reset(x, y, fuel = 100) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.angle = 0;
        this.fuel = fuel;
        this.isThrusting = false;
        this.flameSize = 0;
        this.isSad = false;
    }

    update(gravity, thrustPower, keys) {
        // Apply gravity
        this.velocityY += gravity;

        // Horizontal movement with tilt
        if (keys.left) {
            this.velocityX -= this.horizontalPower;
            if (this.angle > -this.maxTilt) {
                this.angle -= this.tiltAmount;
            }
        }
        if (keys.right) {
            this.velocityX += this.horizontalPower;
            if (this.angle < this.maxTilt) {
                this.angle += this.tiltAmount;
            }
        }

        // Auto-stabilization back to vertical when no keys pressed
        if (!keys.left && !keys.right) {
            if (this.angle > 0.5) {
                this.angle -= this.stabilizationSpeed;
            } else if (this.angle < -0.5) {
                this.angle += this.stabilizationSpeed;
            } else {
                this.angle = 0;
            }
        }

        // Clamp angle to -180 to 180
        if (this.angle > 180) this.angle -= 360;
        if (this.angle < -180) this.angle += 360;

        // Handle thrust
        this.isThrusting = keys.up && this.fuel > 0;

        if (this.isThrusting) {
            // Convert angle to radians
            const radians = (this.angle - 90) * Math.PI / 180;

            // Apply thrust in the direction the ship is pointing
            this.velocityX += Math.cos(radians) * thrustPower;
            this.velocityY += Math.sin(radians) * thrustPower;

            // Use fuel
            this.fuel -= 0.3;
            if (this.fuel < 0) this.fuel = 0;

            // Animate flame
            this.flameSize = 15 + Math.random() * 10;
        } else {
            this.flameSize = Math.max(0, this.flameSize - 3);
        }

        // Apply velocity
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Animate eyes (look in direction of movement)
        this.eyeOffset = Math.min(2, Math.max(-2, this.velocityX * 0.5));

        // Apply some drag to horizontal movement
        this.velocityX *= 0.995;
    }

    getSpeed() {
        return Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle * Math.PI / 180);

        // Draw flame if thrusting
        if (this.flameSize > 0) {
            this.drawFlame(ctx);
        }

        // Rocket body
        ctx.fillStyle = '#ff6b6b';
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 3;

        // Main body (rounded rectangle shape)
        ctx.beginPath();
        ctx.moveTo(-this.width/2, this.height/3);
        ctx.quadraticCurveTo(-this.width/2, -this.height/3, 0, -this.height/2);
        ctx.quadraticCurveTo(this.width/2, -this.height/3, this.width/2, this.height/3);
        ctx.lineTo(this.width/2, this.height/3);
        ctx.lineTo(-this.width/2, this.height/3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Nose cone
        ctx.fillStyle = '#ee5a5a';
        ctx.beginPath();
        ctx.moveTo(-this.width/4, -this.height/3);
        ctx.quadraticCurveTo(0, -this.height/2 - 10, this.width/4, -this.height/3);
        ctx.closePath();
        ctx.fill();

        // Left fin
        ctx.fillStyle = '#fdcb6e';
        ctx.strokeStyle = '#e67e22';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-this.width/2, this.height/4);
        ctx.lineTo(-this.width/2 - 12, this.height/2 + 5);
        ctx.lineTo(-this.width/4, this.height/3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Right fin
        ctx.beginPath();
        ctx.moveTo(this.width/2, this.height/4);
        ctx.lineTo(this.width/2 + 12, this.height/2 + 5);
        ctx.lineTo(this.width/4, this.height/3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Window (with cute eyes)
        this.drawWindow(ctx);

        ctx.restore();
    }

    drawWindow(ctx) {
        // Window background
        ctx.fillStyle = '#74b9ff';
        ctx.strokeStyle = '#2d3436';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(0, -5, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Window shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(-4, -8, 5, 0, Math.PI * 2);
        ctx.fill();

        if (this.isSad) {
            // Sad eyes - looking down
            ctx.fillStyle = '#2d3436';
            ctx.beginPath();
            ctx.ellipse(-5, -3, 3, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(5, -3, 3, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Sad eyebrows
            ctx.strokeStyle = '#2d3436';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-8, -8);
            ctx.lineTo(-2, -6);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(8, -8);
            ctx.lineTo(2, -6);
            ctx.stroke();

            // Sad mouth
            ctx.beginPath();
            ctx.arc(0, 3, 4, 0.2 * Math.PI, 0.8 * Math.PI, true);
            ctx.stroke();

            // Tear drops
            ctx.fillStyle = '#74b9ff';
            ctx.beginPath();
            ctx.ellipse(-6, 2, 2, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(6, 4, 2, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Normal happy eyes
            ctx.fillStyle = '#2d3436';
            ctx.beginPath();
            ctx.ellipse(-5 + this.eyeOffset, -5, 3, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.ellipse(5 + this.eyeOffset, -5, 3, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Eye shine
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(-4 + this.eyeOffset, -6, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(6 + this.eyeOffset, -6, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawFlame(ctx) {
        const flameHeight = this.flameSize + 15;

        // Outer flame (orange/red)
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(-12, this.height/3);
        ctx.quadraticCurveTo(-8, this.height/3 + flameHeight/2, 0, this.height/3 + flameHeight);
        ctx.quadraticCurveTo(8, this.height/3 + flameHeight/2, 12, this.height/3);
        ctx.closePath();
        ctx.fill();

        // Inner flame (yellow)
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.moveTo(-8, this.height/3);
        ctx.quadraticCurveTo(-4, this.height/3 + flameHeight/2 - 5, 0, this.height/3 + flameHeight - 10);
        ctx.quadraticCurveTo(4, this.height/3 + flameHeight/2 - 5, 8, this.height/3);
        ctx.closePath();
        ctx.fill();

        // Core flame (white/yellow)
        ctx.fillStyle = '#ffeaa7';
        ctx.beginPath();
        ctx.moveTo(-4, this.height/3);
        ctx.quadraticCurveTo(-2, this.height/3 + flameHeight/3, 0, this.height/3 + flameHeight/2);
        ctx.quadraticCurveTo(2, this.height/3 + flameHeight/3, 4, this.height/3);
        ctx.closePath();
        ctx.fill();
    }

    // Get bounding box for collision detection
    getBounds() {
        // Simplified rectangular bounds
        const radians = this.angle * Math.PI / 180;
        const cos = Math.abs(Math.cos(radians));
        const sin = Math.abs(Math.sin(radians));

        const width = this.width * cos + this.height * sin;
        const height = this.width * sin + this.height * cos;

        return {
            left: this.x - width / 2,
            right: this.x + width / 2,
            top: this.y - height / 2,
            bottom: this.y + height / 2
        };
    }
}

// Export
window.Spaceship = Spaceship;
