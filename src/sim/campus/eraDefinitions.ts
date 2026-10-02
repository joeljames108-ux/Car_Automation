/**
 * AUTO TYCOON CAMPUS HQ - ERA DEFINITIONS & HISTORICAL REGISTRY (PHASE 211)
 * 
 * Defines the 6 evolutionary eras spanning 1970 to 2030s+:
 * - 1970s: Founding Mechanical Era
 * - 1980s: Turbo & Electronics Expansion Era
 * - 1990s: Digital CAD & Platform Era
 * - 2000s: Global Benchmark & Hybrid Era
 * - 2010s: Connected & EV Revolution Era
 * - 2020s+: Hypermodern Autonomous & Zero-Carbon Era
 * 
 * Provides architectural palette, materials, lighting presets, signage,
 * ambient vehicles, and audio atmosphere configurations.
 */

export type CampusEraId =
  | "ERA_1970S"
  | "ERA_1980S"
  | "ERA_1990S"
  | "ERA_2000S"
  | "ERA_2010S"
  | "ERA_2020S_PLUS";

export interface EraColorPalette {
  primaryWall: string;
  secondaryTrim: string;
  accentColor: string;
  glassTint: string;
  glassOpacity: number;
  roadSurface: string;
  roadMarking: string;
  pavementColor: string;
  vegetationTint: string;
}

export interface EraLightingPreset {
  keyLightColor: string;
  keyLightIntensity: number;
  ambientLightColor: string;
  ambientLightIntensity: number;
  hemisphereSky: string;
  hemisphereGround: string;
  fogColor: string;
  fogDensity: number;
  nightEmissiveColor: string;
  nightEmissiveIntensity: number;
}

export interface EraVisualDefinition {
  id: CampusEraId;
  name: string;
  decadeLabel: string;
  yearRange: [number, number];
  description: string;
  architecturalStyle: string;
  palette: EraColorPalette;
  lighting: EraLightingPreset;
  signageStyle: {
    type: "wood_enamel" | "neon_acrylic" | "stainless_pylon" | "led_totem" | "digital_screen" | "holographic";
    label: string;
    glowEffect: boolean;
  };
  ambientVehicles: {
    category: string;
    types: string[];
    isElectric: boolean;
  };
  audioAtmosphere: {
    primaryAmbience: string;
    mechanicalSounds: string[];
    backgroundHum: string;
  };
  keyMilestones: string[];
}

export const CAMPUS_ERAS: Record<CampusEraId, EraVisualDefinition> = {
  ERA_1970S: {
    id: "ERA_1970S",
    name: "Founding Mechanical Era",
    decadeLabel: "1970s",
    yearRange: [1970, 1979],
    description: "Modest brick workshops, drafting tables with sliding rulers, paper blueprints, and analog dynamometers.",
    architecturalStyle: "Industrial Brick, Corrugated Metal & Exposed Structural Steel",
    palette: {
      primaryWall: "#b45309",      // Warm 1970s red/orange terracotta brick
      secondaryTrim: "#475569",    // Dark slate exposed steel
      accentColor: "#f59e0b",      // Vintage amber badge
      glassTint: "#cbd5e1",        // Single-pane clear/pale zinc glass
      glassOpacity: 0.85,
      roadSurface: "#52525b",      // Weathered gravel asphalt
      roadMarking: "#fbbf24",      // Aged yellow paint
      pavementColor: "#d4d4d8",    // Precast concrete slabs
      vegetationTint: "#65a30d",   // Wild manicured lawn
    },
    lighting: {
      keyLightColor: "#fff8eb",    // Warm tungsten sunlight
      keyLightIntensity: 2.0,
      ambientLightColor: "#fef3c7",
      ambientLightIntensity: 0.8,
      hemisphereSky: "#fed7aa",
      hemisphereGround: "#d6d3d1",
      fogColor: "#f6f4ee",
      fogDensity: 0.0016,
      nightEmissiveColor: "#f59e0b",
      nightEmissiveIntensity: 1.2,
    },
    signageStyle: {
      type: "wood_enamel",
      label: "Hand-Painted Wood & Enamel Tin Signs",
      glowEffect: false,
    },
    ambientVehicles: {
      category: "Classic RWD Sedans & Pickups",
      types: ["Carbureted V8 Sedan", "Compact Inline-4 Coupe", "Utility Flatbed Pickup"],
      isElectric: false,
    },
    audioAtmosphere: {
      primaryAmbience: "Drafting pencil strokes and mechanical typewriter clatter",
      mechanicalSounds: ["Manual metal shear", "Engine dyno carbureted roar", "Hydraulic floor jack"],
      backgroundHum: "Low frequency mechanical transformer rumble",
    },
    keyMilestones: [
      "1:1 Clay Modeling Studio Established",
      "Manual Engine Dyno Test Cell Commissioned",
      "Drafting Hall Blueprints Standardized",
    ],
  },

  ERA_1980S: {
    id: "ERA_1980S",
    name: "Turbo & Electronics Expansion Era",
    decadeLabel: "1980s",
    yearRange: [1980, 1989],
    description: "Brutalist aggregate concrete, bronze reflective glass, early CRT computer terminals, and turbo test bays.",
    architecturalStyle: "Ribbed Aggregate Concrete, Bronze Tint & Angular Brutalism",
    palette: {
      primaryWall: "#78716c",      // Warm textured brutalist concrete
      secondaryTrim: "#1e293b",    // Dark iron mullions
      accentColor: "#0284c7",      // Electronic blue accent
      glassTint: "#78350f",        // Bronze architectural reflective glass
      glassOpacity: 0.78,
      roadSurface: "#3f3f46",      // Fresh asphalt paving
      roadMarking: "#ffffff",      // Crisp white road lines
      pavementColor: "#e4e4e7",    // Geometric plaza pavers
      vegetationTint: "#4d7c0f",   // Structured shrubs
    },
    lighting: {
      keyLightColor: "#fffdf5",
      keyLightIntensity: 2.1,
      ambientLightColor: "#f1f5f9",
      ambientLightIntensity: 0.85,
      hemisphereSky: "#e0f2fe",
      hemisphereGround: "#e2e8f0",
      fogColor: "#f8fafc",
      fogDensity: 0.0015,
      nightEmissiveColor: "#0284c7",
      nightEmissiveIntensity: 1.5,
    },
    signageStyle: {
      type: "neon_acrylic",
      label: "Backlit Acrylic & Neon Tube Channel Lettering",
      glowEffect: true,
    },
    ambientVehicles: {
      category: "Angular Notchback Coupes & Turbo Wagons",
      types: ["Turbocharged Intercooled Sedan", "Boxy Station Wagon", "Prototype Wedge Coupe"],
      isElectric: false,
    },
    audioAtmosphere: {
      primaryAmbience: "Dot-matrix printers and early computer cooling fans",
      mechanicalSounds: ["Turbocharger spool test", "Pneumatic impact wrenches", "Oscilloscope relay click"],
      backgroundHum: "CRT monitor high-pitch sweep and server fan murmur",
    },
    keyMilestones: [
      "2D CAD Workstations Installed",
      "Subsonic Wind Tunnel Scaled Model Rig Commissioned",
      "Electronic Fuel Injection Research Lab Opened",
    ],
  },

  ERA_1990S: {
    id: "ERA_1990S",
    name: "Digital CAD & Global Platform Era",
    decadeLabel: "1990s",
    yearRange: [1990, 1999],
    description: "White composite aluminum panels, blue reflective solar curtain walls, and Unix 3D modeling supercomputers.",
    architecturalStyle: "High-Tech Composite Panels, Space Frames & Blue Reflective Glass",
    palette: {
      primaryWall: "#e2e8f0",      // Clean silvery aluminum panels
      secondaryTrim: "#0284c7",    // Cyan/marine structural truss
      accentColor: "#06b6d4",      // High-tech cyan
      glassTint: "#0369a1",        // Deep blue reflective solar glazing
      glassOpacity: 0.72,
      roadSurface: "#27272a",      // Engineered smooth asphalt
      roadMarking: "#ffffff",      // Reflective thermoplastic stripes
      pavementColor: "#f1f5f9",    // Granite aggregate walkways
      vegetationTint: "#15803d",   // Lush corporate landscaping
    },
    lighting: {
      keyLightColor: "#ffffff",
      keyLightIntensity: 2.2,
      ambientLightColor: "#f8fafc",
      ambientLightIntensity: 0.9,
      hemisphereSky: "#bae6fd",
      hemisphereGround: "#cbd5e1",
      fogColor: "#f1f5f9",
      fogDensity: 0.0014,
      nightEmissiveColor: "#06b6d4",
      nightEmissiveIntensity: 1.8,
    },
    signageStyle: {
      type: "stainless_pylon",
      label: "Brushed Stainless Steel & Laser-Cut Monolith Pylons",
      glowEffect: true,
    },
    ambientVehicles: {
      category: "Aerodynamic Monocoque Sedans & Hatchbacks",
      types: ["Multi-Valve DOHC V6 Sedan", "Compact Aero Hatchback", "Composite Test Mule"],
      isElectric: false,
    },
    audioAtmosphere: {
      primaryAmbience: "Unix workstation blower fans and CAD plotter sweeps",
      mechanicalSounds: ["Cable-pull crash sled launch", "Multi-axis shaker rig", "Wind tunnel turbine roar"],
      backgroundHum: "Data room server rack hum and clean air filtration",
    },
    keyMilestones: [
      "Full 3D CAD Surface Modeling Standardized",
      "Linear 120m Cable-Pull Crash Hall Operational",
      "First Continuous Robotic Spot-Welding Line",
    ],
  },

  ERA_2000S: {
    id: "ERA_2000S",
    name: "Global Benchmark & Hybrid Era",
    decadeLabel: "2000s",
    yearRange: [2000, 2009],
    description: "Multi-story glass atriums, cantilevered sky bridges, titanium composite facades, and hybrid powertrain cleanrooms.",
    architecturalStyle: "Parametric Titanium Shingles, Cantilevered Bridges & Glass Atriums",
    palette: {
      primaryWall: "#cbd5e1",      // Sleek titanium and satin steel
      secondaryTrim: "#0f172a",    // Jet black obsidian mullions
      accentColor: "#10b981",      // Eco-efficiency emerald green
      glassTint: "#0f766e",        // Low-E acoustic solar glass
      glassOpacity: 0.65,
      roadSurface: "#18181b",      // High-density aggregate bitumen
      roadMarking: "#ffffff",      // Dual reflective thermo lines
      pavementColor: "#e2e8f0",    // Polished terrazzo and granite
      vegetationTint: "#16a34a",   // Sculpted evergreen trees
    },
    lighting: {
      keyLightColor: "#f8fafc",
      keyLightIntensity: 2.3,
      ambientLightColor: "#ffffff",
      ambientLightIntensity: 0.95,
      hemisphereSky: "#93c5fd",
      hemisphereGround: "#94a3b8",
      fogColor: "#eef2f6",
      fogDensity: 0.0013,
      nightEmissiveColor: "#10b981",
      nightEmissiveIntensity: 2.0,
    },
    signageStyle: {
      type: "led_totem",
      label: "Internal LED Matrix & Illuminated Corporate Totems",
      glowEffect: true,
    },
    ambientVehicles: {
      category: "Rounded SUVs, Executive Coupes & Early Hybrids",
      types: ["Parallel Hybrid Executive Sedan", "All-Wheel Drive Performance SUV", "Carbon Monocoque Prototype"],
      isElectric: false,
    },
    audioAtmosphere: {
      primaryAmbience: "Cleanroom laminar air handlers and robotic arm whirrs",
      mechanicalSounds: ["Inverter test bench whine", "CMM laser probe sweep", "Chassis dyno roller hum"],
      backgroundHum: "High-density data center cooling loops",
    },
    keyMilestones: [
      "Hybrid Battery Inverter Lab Commissioned",
      "Virtual Ergonomics CAVE Projection Suite",
      "Automated Stamping Press Line Commissioned",
    ],
  },

  ERA_2010S: {
    id: "ERA_2010S",
    name: "Connected & EV Revolution Era",
    decadeLabel: "2010s",
    yearRange: [2010, 2019],
    description: "Double-skin breathable facades, vertical living gardens, rooftop solar arrays, smart glass, and 800V EV battery labs.",
    architecturalStyle: "Living Green Walls, Integrated Photovoltaics & Floating Glass Cubes",
    palette: {
      primaryWall: "#f1f5f9",      // Alabaster architectural concrete & ceramic
      secondaryTrim: "#0284c7",    // Electric blue anodized structural ribbing
      accentColor: "#0ea5e9",      // Vibrant electric sky blue
      glassTint: "#0284c7",        // Electrochromic smart glass
      glassOpacity: 0.55,
      roadSurface: "#09090b",      // Permeable eco-asphalt
      roadMarking: "#38bdf8",      // Phosphorescent charging stall lines
      pavementColor: "#f8fafc",    // Porous drainage tiles
      vegetationTint: "#22c55e",   // Living bio-wall greenery
    },
    lighting: {
      keyLightColor: "#ffffff",
      keyLightIntensity: 2.4,
      ambientLightColor: "#f0f9ff",
      ambientLightIntensity: 1.0,
      hemisphereSky: "#7dd3fc",
      hemisphereGround: "#94a3b8",
      fogColor: "#f6f9fc",
      fogDensity: 0.0012,
      nightEmissiveColor: "#0ea5e9",
      nightEmissiveIntensity: 2.4,
    },
    signageStyle: {
      type: "digital_screen",
      label: "Edge-Lit Acrylic & Ultra-HD Digital Ribbon Screens",
      glowEffect: true,
    },
    ambientVehicles: {
      category: "Dual-Motor Electric Sedans & Autonomous Prototypes",
      types: ["Long-Range Dual Motor EV", "Connected Electric Crossover", "Autonomous Test Mule with Roof Lidar"],
      isElectric: true,
    },
    audioAtmosphere: {
      primaryAmbience: "Whisper-quiet electric drive motors and automated AGV chimes",
      mechanicalSounds: ["High-voltage battery cycler hum", "Robotic laser seam welder", "Aero aeroacoustic tunnel hiss"],
      backgroundHum: "Liquid-cooled supercomputer cluster whisper",
    },
    keyMilestones: [
      "Gigafactory Automated Battery Pack Line Installed",
      "Full Vehicle Autonomous Hardware-in-the-Loop Sim",
      "Zero-Landfill Eco-Campus Certification",
    ],
  },

  ERA_2020S_PLUS: {
    id: "ERA_2020S_PLUS",
    name: "Hypermodern Autonomous & Zero-Carbon Era",
    decadeLabel: "2020s+",
    yearRange: [2020, 2035],
    description: "Parametric AI-designed envelopes, quantum CFD cores, induction roadways, kinetic solar canopies, and drone sky-ports.",
    architecturalStyle: "Parametric Carbon-Neutral Shells, Kinetic Shading & Holographic Pavilions",
    palette: {
      primaryWall: "#ffffff",      // Pure self-cleaning titanium dioxide ceramic
      secondaryTrim: "#06b6d4",    // Quantum cyan light-pipes
      accentColor: "#8b5cf6",      // Deep quantum violet
      glassTint: "#0891b2",        // Photovoltaic transparent solar glass
      glassOpacity: 0.5,
      roadSurface: "#020617",      // Magnetic induction roadway with LED lanes
      roadMarking: "#06b6d4",      // Luminescent dynamic lane dividers
      pavementColor: "#f8fafc",    // Kinetic piezo-electric footpaths
      vegetationTint: "#10b981",   // Vertical hydroponic bio-domes
    },
    lighting: {
      keyLightColor: "#ffffff",
      keyLightIntensity: 2.5,
      ambientLightColor: "#f8fafc",
      ambientLightIntensity: 1.05,
      hemisphereSky: "#67e8f9",
      hemisphereGround: "#64748b",
      fogColor: "#f8fafc",
      fogDensity: 0.0011,
      nightEmissiveColor: "#06b6d4",
      nightEmissiveIntensity: 3.0,
    },
    signageStyle: {
      type: "holographic",
      label: "Volumetric Holographic Projections & Transparent OLEDs",
      glowEffect: true,
    },
    ambientVehicles: {
      category: "Autonomous Pods, Solid-State Hypercars & Drone Shuttles",
      types: ["Solid-State Battery Hypercar", "Bi-Directional Autonomous Pod", "Hydrogen Fuel Cell Long-Haul Hauler"],
      isElectric: true,
    },
    audioAtmosphere: {
      primaryAmbience: "Cryogenic quantum cooling whisper and resonant sonic pulses",
      mechanicalSounds: ["Inductive wireless fast-charger resonance", "3D laser metal sintering", "Drone propeller hum"],
      backgroundHum: "Harmonic quantum computing core resonance",
    },
    keyMilestones: [
      "Quantum CFD Shape Synthesis Engine Deployed",
      "Lights-Out 100% Autonomous Assembly Commissioned",
      "Net-Positive Clean Energy Campus Achieved",
    ],
  },
};

/**
 * Returns the matching EraVisualDefinition given a simulation calendar year.
 */
export function getCampusEraByYear(year: number): EraVisualDefinition {
  if (year < 1980) return CAMPUS_ERAS.ERA_1970S;
  if (year < 1990) return CAMPUS_ERAS.ERA_1980S;
  if (year < 2000) return CAMPUS_ERAS.ERA_1990S;
  if (year < 2010) return CAMPUS_ERAS.ERA_2000S;
  if (year < 2020) return CAMPUS_ERAS.ERA_2010S;
  return CAMPUS_ERAS.ERA_2020S_PLUS;
}

/**
 * Returns the matching EraVisualDefinition given a building level (0–7).
 */
export function getCampusEraByLevel(level: number): EraVisualDefinition {
  if (level <= 1) return CAMPUS_ERAS.ERA_1970S;
  if (level === 2) return CAMPUS_ERAS.ERA_1980S;
  if (level === 3) return CAMPUS_ERAS.ERA_1990S;
  if (level === 4) return CAMPUS_ERAS.ERA_2000S;
  if (level === 5) return CAMPUS_ERAS.ERA_2010S;
  return CAMPUS_ERAS.ERA_2020S_PLUS;
}
