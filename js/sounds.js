// Sound effects using Web Audio API
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.thrustOscillator = null;
        this.thrustGain = null;
        this.isThrusting = false;
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    }

    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopThrust();
        }
        return this.enabled;
    }

    // Thrust sound - continuous whooshing
    startThrust() {
        if (!this.enabled || !this.audioContext || this.isThrusting) return;

        this.isThrusting = true;

        // Create noise for thrust
        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.audioContext.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Filter to make it more "whooshy"
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;

        // Gain control
        this.thrustGain = this.audioContext.createGain();
        this.thrustGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        this.thrustGain.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.1);

        // Connect nodes
        whiteNoise.connect(filter);
        filter.connect(this.thrustGain);
        this.thrustGain.connect(this.audioContext.destination);

        whiteNoise.start();
        this.thrustOscillator = whiteNoise;
    }

    stopThrust() {
        if (this.thrustOscillator && this.thrustGain) {
            this.thrustGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);
            setTimeout(() => {
                if (this.thrustOscillator) {
                    this.thrustOscillator.stop();
                    this.thrustOscillator = null;
                }
            }, 150);
        }
        this.isThrusting = false;
    }

    // Landing success sound - happy chime
    playLanding() {
        if (!this.enabled || !this.audioContext) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const duration = 0.15;

        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, duration, 0.2, 'sine');
            }, i * 150);
        });

        // Add sparkle sound
        setTimeout(() => {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    this.playTone(1500 + Math.random() * 1000, 0.1, 0.05, 'sine');
                }, i * 50);
            }
        }, 600);
    }

    // Crash sound - soft bonk
    playCrash() {
        if (!this.enabled || !this.audioContext) return;

        // Low thud
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);

        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.3);

        // Soft boing
        setTimeout(() => {
            this.playTone(200, 0.2, 0.1, 'triangle');
        }, 100);
    }

    // Button click sound
    playClick() {
        if (!this.enabled || !this.audioContext) return;
        this.playTone(600, 0.05, 0.1, 'sine');
    }

    // Level complete fanfare
    playFanfare() {
        if (!this.enabled || !this.audioContext) return;

        const melody = [
            { freq: 392, dur: 0.15 },   // G4
            { freq: 440, dur: 0.15 },   // A4
            { freq: 494, dur: 0.15 },   // B4
            { freq: 523, dur: 0.3 },    // C5
            { freq: 659, dur: 0.15 },   // E5
            { freq: 784, dur: 0.4 }     // G5
        ];

        let time = 0;
        melody.forEach(note => {
            setTimeout(() => {
                this.playTone(note.freq, note.dur, 0.2, 'sine');
            }, time * 1000);
            time += note.dur;
        });
    }

    // Helper to play a simple tone
    playTone(frequency, duration, volume = 0.1, type = 'sine') {
        if (!this.audioContext) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = type;
        osc.frequency.value = frequency;

        gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + duration);
    }
}

// Create global sound manager
window.soundManager = new SoundManager();
