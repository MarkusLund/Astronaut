// Solar system tour. Visual styling researched per body:
// - Moon: gray cratered, black sky, stars
// - Mercury: gray-brown, cratered, scarps, harsh black sky (no atmosphere)
// - Venus: sulfur-yellow clouds, orange haze, volcanoes, dim
// - Earth: blue sky, white clouds, green ground, trees
// - Mars: rust-red ground, pinkish sky, dust haze, mountains, craters
// - Jupiter: orange-brown bands, Great Red Spot (gas giant)
// - Saturn: pale butterscotch, rings, faint bands
// - Uranus: pale cyan-green, methane haze
// - Neptune: deep blue, white methane streaks, dark spot
// - Pluto: dark brown-red ground with bright nitrogen-ice "heart" (Tombaugh Regio)
// - Sun: orange-yellow plasma, sunspots, prominences, corona
// Earth gravity 9.81 m/s² ≈ 0.06 px/frame² in game

const LEVELS = [
    // === TRENING ===
    {
        id: 1,
        name: 'MÅNEN',
        nameNorwegian: 'MÅNEN (TRENING)',
        gravity: 0.01,
        realGravity: 1.62,
        backgroundColor: '#000000',
        groundColor: '#9e9e9e',
        groundGradient: ['#bdbdbd', '#9e9e9e', '#5a5a5a'],
        skyGradient: ['#000000', '#050510', '#0a0a18'],
        landingPadWidth: 200,
        landingPadPosition: 0.5,
        maxLandingSpeed: 2.8,
        maxLandingAngle: 40,
        startFuel: 150,
        thrustPower: 0.12,
        description: 'Treningsbane på Månen. Ingen atmosfære, full stjernehimmel!',
        successMessage: 'Bra! Du er klar for solsystemet!',
        features: { stars: true, craters: true },
        colors: { accent: '#e0e0e0', platform: '#64b5f6', platformBorder: '#1976d2' }
    },

    // === DE 3 FØRSTE PLANETENE: SENTRERT ===
    {
        id: 2,
        name: 'MERKUR',
        nameNorwegian: 'MERKUR',
        gravity: 0.022,
        realGravity: 3.7,
        backgroundColor: '#000000',
        groundColor: '#7a6650',
        groundGradient: ['#a89274', '#7a6650', '#3d3225'],
        skyGradient: ['#000000', '#030308', '#080812'],
        landingPadWidth: 170,
        landingPadPosition: 0.5,
        maxLandingSpeed: 2.5,
        maxLandingAngle: 32,
        startFuel: 140,
        thrustPower: 0.14,
        description: 'Merkur - nærmest sola. Ingen atmosfære, skarpe skygger og kratere!',
        successMessage: 'Perfekt landing på Merkur!',
        features: { stars: true, craters: true, scarps: true },
        colors: { accent: '#d4a574', platform: '#ffd54f', platformBorder: '#ff8f00' }
    },
    {
        id: 3,
        name: 'VENUS',
        nameNorwegian: 'VENUS',
        gravity: 0.052,
        realGravity: 8.87,
        backgroundColor: '#3d2410',
        groundColor: '#a8651f',
        groundGradient: ['#d89548', '#a8651f', '#5a3008'],
        skyGradient: ['#3d1f08', '#9e5a18', '#d89548'],
        landingPadWidth: 160,
        landingPadPosition: 0.5,
        maxLandingSpeed: 2.2,
        maxLandingAngle: 28,
        startFuel: 160,
        thrustPower: 0.17,
        hazeColor: 'rgba(255,180,60,0.28)',
        description: 'Venus - tykke svovelgule skyer og vulkaner overalt!',
        successMessage: 'Du klarte den hete Venus!',
        features: { stars: false, clouds: true, haze: true, volcanoes: true },
        colors: { accent: '#ffca28', platform: '#fff176', platformBorder: '#f9a825' }
    },
    {
        id: 4,
        name: 'JORDEN',
        nameNorwegian: 'JORDEN',
        gravity: 0.06,
        realGravity: 9.81,
        backgroundColor: '#1a237e',
        groundColor: '#4caf50',
        groundGradient: ['#66bb6a', '#388e3c', '#1b5e20'],
        skyGradient: ['#1a237e', '#3949ab', '#5c8fd6'],
        landingPadWidth: 150,
        landingPadPosition: 0.5,
        maxLandingSpeed: 2.0,
        maxLandingAngle: 25,
        startFuel: 170,
        thrustPower: 0.18,
        description: 'Jorden - vårt hjem! Skyer, trær og blå himmel.',
        successMessage: 'Velkommen hjem til Jorden!',
        features: { stars: false, clouds: true, trees: true },
        colors: { accent: '#81c784', platform: '#ffeb3b', platformBorder: '#fbc02d' }
    },

    // === DE 3 NESTE: TILFELDIG PLASSERT ===
    {
        id: 5,
        name: 'MARS',
        nameNorwegian: 'MARS',
        gravity: 0.025,
        realGravity: 3.71,
        backgroundColor: '#3a1810',
        groundColor: '#a8412a',
        groundGradient: ['#d65a3a', '#a8412a', '#5d2010'],
        skyGradient: ['#3a1810', '#7a3818', '#c87858'],
        landingPadWidth: 150,
        randomPosition: true,
        maxLandingSpeed: 2.3,
        maxLandingAngle: 30,
        startFuel: 190,
        thrustPower: 0.15,
        hazeColor: 'rgba(220,140,90,0.18)',
        description: 'Mars - rustrød ørken og rosa himmel. Finn plattformen!',
        successMessage: 'Fantastisk Mars-landing!',
        features: { stars: false, craters: true, mountains: true, haze: true },
        colors: { accent: '#ff7043', platform: '#ffcc02', platformBorder: '#ff9800' }
    },
    {
        id: 6,
        name: 'JUPITER',
        nameNorwegian: 'JUPITER',
        gravity: 0.085,
        realGravity: 24.79,
        backgroundColor: '#3d2818',
        groundColor: '#a06030',
        groundGradient: ['#e8b878', '#a06030', '#5a3010'],
        skyGradient: ['#3d2818', '#7a4828', '#c98850'],
        landingPadWidth: 150,
        randomPosition: true,
        maxLandingSpeed: 2.0,
        maxLandingAngle: 25,
        startFuel: 220,
        thrustPower: 0.22,
        bandColors: ['#f5d8a8', '#a06840', '#e8b878', '#5d3818', '#d8a06a', '#7a4828', '#f0c890'],
        description: 'Jupiter - bånd av storm og Den Store Røde Flekken!',
        successMessage: 'Mektig! Du tamte Jupiter!',
        features: { stars: false, bands: true, redSpot: true },
        colors: { accent: '#d4a574', platform: '#ffab40', platformBorder: '#e65100' }
    },
    {
        id: 7,
        name: 'SATURN',
        nameNorwegian: 'SATURN',
        gravity: 0.065,
        realGravity: 10.44,
        backgroundColor: '#2a2010',
        groundColor: '#c9b078',
        groundGradient: ['#f5e1a4', '#c9b078', '#7a5d28'],
        skyGradient: ['#2a2010', '#7a5828', '#d8b870'],
        landingPadWidth: 145,
        randomPosition: true,
        maxLandingSpeed: 2.1,
        maxLandingAngle: 27,
        startFuel: 200,
        thrustPower: 0.19,
        bandColors: ['#f5e1a4', '#d8b870', '#f5e8b8', '#b89858'],
        description: 'Saturn - blekgul karamellfarge med ringer!',
        successMessage: 'Du fløy gjennom Saturns ringer!',
        features: { stars: false, bands: true, rings: true },
        colors: { accent: '#ffe082', platform: '#fff8e1', platformBorder: '#c9a227' }
    },

    // === DE 3 SISTE: BEVEGELIG PLATTFORM (inkl. PLUTO) ===
    {
        id: 8,
        name: 'URANUS',
        nameNorwegian: 'URANUS',
        gravity: 0.052,
        realGravity: 8.87,
        backgroundColor: '#0a3848',
        groundColor: '#9ad8d0',
        groundGradient: ['#c8eee8', '#9ad8d0', '#5a9890'],
        skyGradient: ['#0a3848', '#3a8898', '#a8e0d8'],
        landingPadWidth: 140,
        landingPadPosition: 0.5,
        movingPlatform: { speed: 0.4, range: 200 },
        maxLandingSpeed: 2.2,
        maxLandingAngle: 28,
        startFuel: 220,
        thrustPower: 0.17,
        hazeColor: 'rgba(180,230,220,0.22)',
        description: 'Uranus - blekgrønn av metan og iskald tåke!',
        successMessage: 'Iskald presisjon på Uranus!',
        features: { stars: false, haze: true },
        colors: { accent: '#80deea', platform: '#b2ebf2', platformBorder: '#00838f' }
    },
    {
        id: 9,
        name: 'NEPTUN',
        nameNorwegian: 'NEPTUN',
        gravity: 0.07,
        realGravity: 11.15,
        backgroundColor: '#0a1850',
        groundColor: '#2848a8',
        groundGradient: ['#4870c8', '#2848a8', '#0a1860'],
        skyGradient: ['#0a1450', '#1838a0', '#3868d0'],
        landingPadWidth: 130,
        landingPadPosition: 0.5,
        movingPlatform: { speed: 0.55, range: 240 },
        maxLandingSpeed: 2.0,
        maxLandingAngle: 25,
        startFuel: 230,
        thrustPower: 0.20,
        description: 'Neptun - dypblå og solsystemets vindigste planet!',
        successMessage: 'Utrolig! Du temmet Neptun!',
        features: { stars: false, streaks: true, darkSpot: true },
        colors: { accent: '#5c6bc0', platform: '#9fa8da', platformBorder: '#283593' }
    },
    {
        id: 10,
        name: 'PLUTO',
        nameNorwegian: 'PLUTO',
        gravity: 0.005,
        realGravity: 0.62,
        backgroundColor: '#000000',
        groundColor: '#8a6858',
        groundGradient: ['#c0a090', '#8a6858', '#3d2818'],
        skyGradient: ['#000000', '#080510', '#100818'],
        landingPadWidth: 130,
        landingPadPosition: 0.5,
        movingPlatform: { speed: 0.7, range: 280 },
        maxLandingSpeed: 2.8,
        maxLandingAngle: 35,
        startFuel: 240,
        thrustPower: 0.10,
        description: 'Pluto - frossen dvergplanet med hvitt nitrogen-hjerte!',
        successMessage: 'Du nådde solsystemets ytterkant!',
        features: { stars: true, craters: true, mountains: true, iceHeart: true },
        colors: { accent: '#bcaaa4', platform: '#d7ccc8', platformBorder: '#5d4037' }
    },

    // === FINALE: SOLA ===
    {
        id: 11,
        name: 'SOLA',
        nameNorwegian: 'SOLA',
        gravity: 0.13,
        realGravity: 274,
        backgroundColor: '#5a1800',
        groundColor: '#ff8800',
        groundGradient: ['#fff59d', '#ff8800', '#c43000'],
        skyGradient: ['#5a1800', '#c44800', '#ff9c20'],
        landingPadWidth: 130,
        landingPadPosition: 0.5,
        movingPlatform: { speed: 0.8, range: 260 },
        maxLandingSpeed: 2.0,
        maxLandingAngle: 22,
        startFuel: 300,
        thrustPower: 0.28,
        description: 'SOLA! Korona, protuberanser og solflekker. Siste utfordring!',
        successMessage: 'DU ER EN LEGENDE! Hele solsystemet er erobret!',
        features: { stars: false, corona: true, prominences: true, sunspots: true },
        colors: { accent: '#ffd54f', platform: '#fff59d', platformBorder: '#ff6f00' }
    }
];

function getLevel(id) {
    return LEVELS.find(level => level.id === id) || LEVELS[0];
}

function getNextLevel(currentId) {
    const nextId = currentId + 1;
    return LEVELS.find(level => level.id === nextId) || null;
}

function isLastLevel(id) {
    return id === LEVELS.length;
}

window.LEVELS = LEVELS;
window.getLevel = getLevel;
window.getNextLevel = getNextLevel;
window.isLastLevel = isLastLevel;
