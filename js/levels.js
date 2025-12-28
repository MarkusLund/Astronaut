// Level configurations with real gravity values
// Ordered by difficulty: Moon (easiest) -> Mars -> Earth (hardest)
// Scaled for kid-friendly gameplay (based on arcade game physics research)
// Reference: ~0.05-0.1 pixels/frame² is typical for arcade games at 60fps

const LEVELS = [
    {
        id: 1,
        name: 'MÅNEN',
        nameNorwegian: 'MÅNEN',
        gravity: 0.01,           // Moon's gravity (very low, easiest level)
        realGravity: 1.62,
        backgroundColor: '#0d0d0d',
        groundColor: '#9e9e9e',
        groundGradient: ['#bdbdbd', '#9e9e9e', '#757575'],
        skyGradient: ['#0d0d0d', '#1a1a2e', '#16213e'],
        landingPadWidth: 180,
        landingPadPosition: 0.5,  // 0.0 = left edge, 0.5 = center, 1.0 = right edge
        maxLandingSpeed: 2.5,
        maxLandingAngle: 35,
        startFuel: 200,
        thrustPower: 0.12,
        description: 'Velkommen til Månen! Her er det nesten ingen tyngdekraft.',
        successMessage: 'Fantastisk! Du landet på Månen!',
        features: {
            clouds: false,
            trees: false,
            mountains: false,
            craters: true
        },
        colors: {
            accent: '#e0e0e0',
            platform: '#64b5f6',
            platformBorder: '#1976d2'
        }
    },
    {
        id: 2,
        name: 'MARS',
        nameNorwegian: 'MARS',
        gravity: 0.025,          // Mars gravity (medium difficulty)
        realGravity: 3.71,
        backgroundColor: '#1a0a0a',
        groundColor: '#bf360c',
        groundGradient: ['#e64a19', '#bf360c', '#8d2c0a'],
        skyGradient: ['#1a0a0a', '#2d1b1b', '#3e1f1f'],
        landingPadWidth: 160,
        landingPadPosition: 0.5,
        maxLandingSpeed: 2.2,
        maxLandingAngle: 30,
        startFuel: 200,
        thrustPower: 0.15,
        description: 'Mars - den røde planeten! Litt mer tyngdekraft her.',
        successMessage: 'Utrolig! Du er en ekte Mars-astronaut!',
        features: {
            clouds: false,
            trees: false,
            mountains: true,
            craters: true
        },
        colors: {
            accent: '#ff7043',
            platform: '#ffcc02',
            platformBorder: '#ff9800'
        }
    },
    {
        id: 3,
        name: 'JORDEN',
        nameNorwegian: 'JORDEN',
        gravity: 0.06,           // Earth's gravity (hardest level)
        realGravity: 9.81,
        backgroundColor: '#1a237e',
        groundColor: '#4caf50',
        groundGradient: ['#4caf50', '#2e7d32', '#1b5e20'],
        skyGradient: ['#1a237e', '#283593', '#3949ab'],
        landingPadWidth: 150,
        landingPadPosition: 0.5,
        maxLandingSpeed: 2.0,
        maxLandingAngle: 25,
        startFuel: 200,
        thrustPower: 0.18,
        description: 'Jorden har sterkest tyngdekraft. Dette er vanskeligst!',
        successMessage: 'Flott landing på Jorden!',
        features: {
            clouds: true,
            trees: true,
            mountains: false,
            craters: false
        },
        colors: {
            accent: '#81c784',
            platform: '#ffeb3b',
            platformBorder: '#fbc02d'
        }
    },
    // === NIVÅ 4-6: Plattform på forskjellige steder ===
    {
        id: 4,
        name: 'MÅNEN 2',
        nameNorwegian: 'MÅNEN 2',
        gravity: 0.012,
        realGravity: 1.62,
        backgroundColor: '#0d0d0d',
        groundColor: '#9e9e9e',
        groundGradient: ['#bdbdbd', '#9e9e9e', '#757575'],
        skyGradient: ['#0d0d0d', '#1a1a2e', '#16213e'],
        landingPadWidth: 150,
        landingPadPosition: 0.2,  // Plattform til venstre!
        maxLandingSpeed: 2.5,
        maxLandingAngle: 35,
        startFuel: 250,
        thrustPower: 0.12,
        description: 'Fly til venstre for å finne plattformen!',
        successMessage: 'Bra jobbet! Du fant plattformen!',
        features: {
            clouds: false,
            trees: false,
            mountains: false,
            craters: true
        },
        colors: {
            accent: '#e0e0e0',
            platform: '#81d4fa',
            platformBorder: '#0288d1'
        }
    },
    {
        id: 5,
        name: 'MARS 2',
        nameNorwegian: 'MARS 2',
        gravity: 0.028,
        realGravity: 3.71,
        backgroundColor: '#1a0a0a',
        groundColor: '#bf360c',
        groundGradient: ['#e64a19', '#bf360c', '#8d2c0a'],
        skyGradient: ['#1a0a0a', '#2d1b1b', '#3e1f1f'],
        landingPadWidth: 140,
        landingPadPosition: 0.8,  // Plattform til høyre!
        maxLandingSpeed: 2.2,
        maxLandingAngle: 30,
        startFuel: 250,
        thrustPower: 0.15,
        description: 'Plattformen er langt til høyre!',
        successMessage: 'Fantastisk navigering!',
        features: {
            clouds: false,
            trees: false,
            mountains: true,
            craters: true
        },
        colors: {
            accent: '#ff7043',
            platform: '#ffe082',
            platformBorder: '#ffa000'
        }
    },
    {
        id: 6,
        name: 'JORDEN 2',
        nameNorwegian: 'JORDEN 2',
        gravity: 0.055,
        realGravity: 9.81,
        backgroundColor: '#1a237e',
        groundColor: '#4caf50',
        groundGradient: ['#4caf50', '#2e7d32', '#1b5e20'],
        skyGradient: ['#1a237e', '#283593', '#3949ab'],
        landingPadWidth: 130,
        landingPadPosition: 0.25,  // Plattform til venstre
        maxLandingSpeed: 2.0,
        maxLandingAngle: 25,
        startFuel: 280,
        thrustPower: 0.18,
        description: 'Sterk tyngdekraft + plattform til venstre. Lykke til!',
        successMessage: 'UTROLIG! Du er en mester-pilot!',
        features: {
            clouds: true,
            trees: true,
            mountains: false,
            craters: false
        },
        colors: {
            accent: '#81c784',
            platform: '#aed581',
            platformBorder: '#689f38'
        }
    },
    // === NIVÅ 7-9: Bevegelige plattformer ===
    {
        id: 7,
        name: 'MÅNEN 3',
        nameNorwegian: 'MÅNEN 3',
        gravity: 0.015,
        realGravity: 1.62,
        backgroundColor: '#0d0d0d',
        groundColor: '#9e9e9e',
        groundGradient: ['#bdbdbd', '#9e9e9e', '#757575'],
        skyGradient: ['#0d0d0d', '#1a1a2e', '#16213e'],
        landingPadWidth: 140,
        landingPadPosition: 0.5,
        movingPlatform: { speed: 0.4, range: 180 },  // Sakte, lang bevegelse
        maxLandingSpeed: 2.5,
        maxLandingAngle: 35,
        startFuel: 300,
        thrustPower: 0.12,
        description: 'Plattformen glir sakte frem og tilbake!',
        successMessage: 'Wow! Du traff en bevegelig plattform!',
        features: {
            clouds: false,
            trees: false,
            mountains: false,
            craters: true
        },
        colors: {
            accent: '#e0e0e0',
            platform: '#ce93d8',
            platformBorder: '#8e24aa'
        }
    },
    {
        id: 8,
        name: 'MARS 3',
        nameNorwegian: 'MARS 3',
        gravity: 0.03,
        realGravity: 3.71,
        backgroundColor: '#1a0a0a',
        groundColor: '#bf360c',
        groundGradient: ['#e64a19', '#bf360c', '#8d2c0a'],
        skyGradient: ['#1a0a0a', '#2d1b1b', '#3e1f1f'],
        landingPadWidth: 120,
        landingPadPosition: 0.5,
        movingPlatform: { speed: 0.5, range: 220 },  // Litt raskere, enda lengre
        maxLandingSpeed: 2.2,
        maxLandingAngle: 30,
        startFuel: 300,
        thrustPower: 0.15,
        description: 'Plattformen beveger seg langt! Pass på!',
        successMessage: 'Fantastisk presisjon!',
        features: {
            clouds: false,
            trees: false,
            mountains: true,
            craters: true
        },
        colors: {
            accent: '#ff7043',
            platform: '#ffab91',
            platformBorder: '#e64a19'
        }
    },
    {
        id: 9,
        name: 'JORDEN 3',
        nameNorwegian: 'JORDEN 3',
        gravity: 0.055,
        realGravity: 9.81,
        backgroundColor: '#1a237e',
        groundColor: '#4caf50',
        groundGradient: ['#4caf50', '#2e7d32', '#1b5e20'],
        skyGradient: ['#1a237e', '#283593', '#3949ab'],
        landingPadWidth: 110,
        landingPadPosition: 0.5,
        movingPlatform: { speed: 0.6, range: 260 },  // Raskest + lengst!
        maxLandingSpeed: 2.0,
        maxLandingAngle: 25,
        startFuel: 350,
        thrustPower: 0.18,
        description: 'ULTIMAT! Lang plattform-bevegelse + sterk gravitasjon!',
        successMessage: 'DU ER EN LEGENDE! Alle nivåer fullført!',
        features: {
            clouds: true,
            trees: true,
            mountains: false,
            craters: false
        },
        colors: {
            accent: '#81c784',
            platform: '#fff59d',
            platformBorder: '#f9a825'
        }
    }
];

// Get level by ID
function getLevel(id) {
    return LEVELS.find(level => level.id === id) || LEVELS[0];
}

// Get next level
function getNextLevel(currentId) {
    const nextId = currentId + 1;
    return LEVELS.find(level => level.id === nextId) || null;
}

// Check if this is the last level
function isLastLevel(id) {
    return id === LEVELS.length;
}

// Export for use in other files
window.LEVELS = LEVELS;
window.getLevel = getLevel;
window.getNextLevel = getNextLevel;
window.isLastLevel = isLastLevel;
