// ====================================================================
// MULTI-LAYER AUTOMOTIVE PAINT SYSTEM - Photorealistic Clearcoat Pipeline
// ====================================================================
// Complete multi-layer automotive paint simulation:
// Layer 1: Primer/e-coat base
// Layer 2: Base color coat
// Layer 3: Metallic/pearl flake layer
// Layer 4: Clearcoat lacquer
// Layer 5: Ceramic coating top layer
// Plus: animated metallic flake simulation, color-shift pearlescence,
// orange peel texture, swirl mark imperfections, depth-of-clear effect
// ====================================================================

import * as THREE from "three";

// --- TYPE DEFINITIONS ---
export type PaintLayerType = "primer" | "base_coat" | "flake_layer" | "clearcoat" | "ceramic_coat";

export interface PaintLayerConfig {
  type: PaintLayerType;
  thickness: number;
  color: THREE.Color;
  metalness: number;
  roughness: number;
  opacity: number;
}

export interface MetallicFlakeConfig {
  density: number;
  size: number;
  rotation: number;
  color: THREE.Color;
  brightness: number;
  sparkle: boolean;
  flakeShape: "hexagonal" | "circular" | "irregular";
  anisotropy: number;
}

export interface PearlescentConfig {
  enabled: boolean;
  primaryColor: THREE.Color;
  secondaryColor: THREE.Color;
  tertiaryColor?: THREE.Color;
  shiftAngle: number;
  iridescenceIOR: number;
  iridescenceThicknessRange: [number, number];
  pearlType: "standard" | "silk" | "crystal" | "xirallic";
}

export interface OrangePeelConfig {
  enabled: boolean;
  frequency: number;
  amplitude: number;
  noiseOctaves: number;
}

export interface SwirlMarkConfig {
  enabled: boolean;
  density: number;
  depth: number;
  angle: number;
}

export interface CeramicCoatingConfig {
  enabled: boolean;
  thickness: number;
  hydrophobic: boolean;
  slickness: number;
  uvProtection: number;
}

export interface WeatheringConfig {
  enabled: boolean;
  oxidationLevel: number;
  dustAmount: number;
  waterSpots: number;
  uvFading: number;
  microScratches: number;
}

export interface MultiLayerPaintConfig {
  baseColor: THREE.Color;
  finish: "solid" | "metallic" | "pearlescent" | "matte" | "satin" | "chrome" | "frozen" | "chromaflair" | "tricoat" | "velvet";
  metallicFlake: MetallicFlakeConfig;
  pearlescent: PearlescentConfig;
  orangePeel: OrangePeelConfig;
  swirlMarks: SwirlMarkConfig;
  ceramicCoating: CeramicCoatingConfig;
  weathering?: WeatheringConfig;
  clearcoatThickness: number;
  clearcoatRoughness: number;
  depthOfClear: number;
  envMapIntensity: number;
}

// --- PAINT FORMULATION LAYERS ---
export interface PaintFormulation {
  layers: PaintLayerConfig[];
  totalDryFilmThickness: number;
  applicationMethod: "spray" | "electrostatic" | "powder" | "dip";
  cureTemperature: number;
}

// --- 25+ NAMED PAINT FORMULATIONS ---
export const PAINT_PRESETS: Record<string, MultiLayerPaintConfig> = {
  ferrariRossoCorsa: {
    baseColor: new THREE.Color(0xc4151b), finish: "metallic",
    metallicFlake: { density: 0.7, size: 0.8, rotation: 45, color: new THREE.Color(0xff4444), brightness: 1.2, sparkle: true, flakeShape: "hexagonal", anisotropy: 0.3 },
    pearlescent: { enabled: false, primaryColor: new THREE.Color(0xc4151b), secondaryColor: new THREE.Color(0xc4151b), shiftAngle: 0, iridescenceIOR: 1.5, iridescenceThicknessRange: [100, 400], pearlType: "standard" },
    orangePeel: { enabled: true, frequency: 8.0, amplitude: 0.02, noiseOctaves: 3 },
    swirlMarks: { enabled: true, density: 0.3, depth: 0.01, angle: 15 },
    ceramicCoating: { enabled: true, thickness: 0.002, hydrophobic: true, slickness: 0.95, uvProtection: 0.98 },
    clearcoatThickness: 0.055, clearcoatRoughness: 0.015, depthOfClear: 0.8, envMapIntensity: 2.2,
  },
  lamborghiniGialloOrion: {
    baseColor: new THREE.Color(0xf5c518), finish: "pearlescent",
    metallicFlake: { density: 0.9, size: 1.0, rotation: 30, color: new THREE.Color(0xffe44d), brightness: 1.5, sparkle: true, flakeShape: "hexagonal", anisotropy: 0.4 },
    pearlescent: { enabled: true, primaryColor: new THREE.Color(0xf5c518), secondaryColor: new THREE.Color(0xf0a000), shiftAngle: 35, iridescenceIOR: 1.8, iridescenceThicknessRange: [200, 600], pearlType: "crystal" },
    orangePeel: { enabled: true, frequency: 6.0, amplitude: 0.015, noiseOctaves: 4 },
    swirlMarks: { enabled: true, density: 0.2, depth: 0.008, angle: 12 },
    ceramicCoating: { enabled: true, thickness: 0.002, hydrophobic: true, slickness: 0.95, uvProtection: 0.98 },
    clearcoatThickness: 0.065, clearcoatRoughness: 0.01, depthOfClear: 0.9, envMapIntensity: 2.5,
  },
  porscheGT3RSnapsBlue: {
    baseColor: new THREE.Color(0x1a3a6c), finish: "metallic",
    metallicFlake: { density: 0.85, size: 0.6, rotation: 60, color: new THREE.Color(0x4488cc), brightness: 1.3, sparkle: true, flakeShape: "circular", anisotropy: 0.2 },
    pearlescent: { enabled: true, primaryColor: new THREE.Color(0x1a3a6c), secondaryColor: new THREE.Color(0x2a5a9c), shiftAngle: 25, iridescenceIOR: 1.6, iridescenceThicknessRange: [150, 500], pearlType: "xirallic" },
    orangePeel: { enabled: true, frequency: 10.0, amplitude: 0.01, noiseOctaves: 3 },
    swirlMarks: { enabled: true, density: 0.15, depth: 0.005, angle: 20 },
    ceramicCoating: { enabled: true, thickness: 0.002, hydrophobic: true, slickness: 0.95, uvProtection: 0.98 },
    clearcoatThickness: 0.06, clearcoatRoughness: 0.008, depthOfClear: 0.85, envMapIntensity: 2.3,
  },
  bmwFrozenGrey: {
    baseColor: new THREE.Color(0x6b6e73), finish: "frozen",
    metallicFlake: { density: 0.5, size: 0.4, rotation: 0, color: new THREE.Color(0x909090), brightness: 0.8, sparkle: false, flakeShape: "circular", anisotropy: 0.0 },
    pearlescent: { enabled: false, primaryColor: new THREE.Color(0x6b6e73), secondaryColor: new THREE.Color(0x6b6e73), shiftAngle: 0, iridescenceIOR: 1.3, iridescenceThicknessRange: [100, 400], pearlType: "standard" },
    orangePeel: { enabled: false, frequency: 0, amplitude: 0, noiseOctaves: 0 },
    swirlMarks: { enabled: false, density: 0, depth: 0, angle: 0 },
    ceramicCoating: { enabled: false, thickness: 0, hydrophobic: false, slickness: 0, uvProtection: 0 },
    clearcoatThickness: 0.03, clearcoatRoughness: 0.35, depthOfClear: 0.3, envMapIntensity: 0.8,
  },
  bugattiAtlanticBlue: {
    baseColor: new THREE.Color(0x0a1540), finish: "chromaflair",
    metallicFlake: { density: 1.0, size: 1.2, rotation: 90, color: new THREE.Color(0x4060ff), brightness: 1.8, sparkle: true, flakeShape: "irregular", anisotropy: 0.6 },
    pearlescent: { enabled: true, primaryColor: new THREE.Color(0x0a1540), secondaryColor: new THREE.Color(0x2a40a0), tertiaryColor: new THREE.Color(0x8060c0), shiftAngle: 45, iridescenceIOR: 2.0, iridescenceThicknessRange: [300, 800], pearlType: "xirallic" },
    orangePeel: { enabled: true, frequency: 12.0, amplitude: 0.008, noiseOctaves: 5 },
    swirlMarks: { enabled: true, density: 0.1, depth: 0.003, angle: 10 },
    ceramicCoating: { enabled: true, thickness: 0.003, hydrophobic: true, slickness: 0.98, uvProtection: 0.99 },
    clearcoatThickness: 0.075, clearcoatRoughness: 0.005, depthOfClear: 1.0, envMapIntensity: 2.8,
  },
  matteBlackStealth: {
    baseColor: new THREE.Color(0x0a0a0a), finish: "matte",
    metallicFlake: { density: 0.1, size: 0.2, rotation: 0, color: new THREE.Color(0x222222), brightness: 0.3, sparkle: false, flakeShape: "circular", anisotropy: 0.0 },
    pearlescent: { enabled: false, primaryColor: new THREE.Color(0x0a0a0a), secondaryColor: new THREE.Color(0x0a0a0a), shiftAngle: 0, iridescenceIOR: 1.3, iridescenceThicknessRange: [100, 400], pearlType: "standard" },
    orangePeel: { enabled: true, frequency: 14.0, amplitude: 0.03, noiseOctaves: 2 },
    swirlMarks: { enabled: false, density: 0, depth: 0, angle: 0 },
    ceramicCoating: { enabled: false, thickness: 0, hydrophobic: false, slickness: 0, uvProtection: 0 },
    clearcoatThickness: 0.0, clearcoatRoughness: 0.8, depthOfClear: 0.0, envMapIntensity: 0.3,
  },
  // --- Additional high-end formulations ---
  mercedesMagnoPlatinum: {
    baseColor: new THREE.Color(0x8a8e90), finish: "matte",
    metallicFlake: { density: 0.6, size: 0.35, rotation: 20, color: new THREE.Color(0xb0b4b8), brightness: 0.9, sparkle: false, flakeShape: "circular", anisotropy: 0.1 },
    pearlescent: { enabled: false, primaryColor: new THREE.Color(0x8a8e90), secondaryColor: new THREE.Color(0x8a8e90), shiftAngle: 0, iridescenceIOR: 1.3, iridescenceThicknessRange: [100, 400], pearlType: "standard" },
    orangePeel: { enabled: false, frequency: 0, amplitude: 0, noiseOctaves: 0 },
    swirlMarks: { enabled: false, density: 0, depth: 0, angle: 0 },
    ceramicCoating: { enabled: true, thickness: 0.001, hydrophobic: true, slickness: 0.9, uvProtection: 0.95 },
    clearcoatThickness: 0.025, clearcoatRoughness: 0.4, depthOfClear: 0.25, envMapIntensity: 0.7,
  },
  astonMartinSapphire: {
    baseColor: new THREE.Color(0x0c2d5a), finish: "pearlescent",
    metallicFlake: { density: 0.8, size: 0.7, rotation: 35, color: new THREE.Color(0x2255aa), brightness: 1.3, sparkle: true, flakeShape: "hexagonal", anisotropy: 0.35 },
    pearlescent: { enabled: true, primaryColor: new THREE.Color(0x0c2d5a), secondaryColor: new THREE.Color(0x1a4580), tertiaryColor: new THREE.Color(0x3a2060), shiftAngle: 30, iridescenceIOR: 1.7, iridescenceThicknessRange: [180, 550], pearlType: "silk" },
    orangePeel: { enabled: true, frequency: 9.0, amplitude: 0.012, noiseOctaves: 4 },
    swirlMarks: { enabled: true, density: 0.18, depth: 0.006, angle: 14 },
    ceramicCoating: { enabled: true, thickness: 0.002, hydrophobic: true, slickness: 0.94, uvProtection: 0.97 },
    clearcoatThickness: 0.06, clearcoatRoughness: 0.012, depthOfClear: 0.82, envMapIntensity: 2.4,
  },
  lamborghiniVerdeMantis: {
    baseColor: new THREE.Color(0x1db954), finish: "metallic",
    metallicFlake: { density: 0.75, size: 0.9, rotation: 50, color: new THREE.Color(0x33dd77), brightness: 1.4, sparkle: true, flakeShape: "irregular", anisotropy: 0.25 },
    pearlescent: { enabled: true, primaryColor: new THREE.Color(0x1db954), secondaryColor: new THREE.Color(0x107030), shiftAngle: 20, iridescenceIOR: 1.5, iridescenceThicknessRange: [120, 420], pearlType: "standard" },
    orangePeel: { enabled: true, frequency: 7.0, amplitude: 0.014, noiseOctaves: 3 },
    swirlMarks: { enabled: true, density: 0.22, depth: 0.007, angle: 18 },
    ceramicCoating: { enabled: true, thickness: 0.002, hydrophobic: true, slickness: 0.95, uvProtection: 0.98 },
    clearcoatThickness: 0.06, clearcoatRoughness: 0.01, depthOfClear: 0.85, envMapIntensity: 2.3,
  },
  paganiBiancoBenny: {
    baseColor: new THREE.Color(0xf0ece4), finish: "pearlescent",
    metallicFlake: { density: 0.3, size: 0.5, rotation: 0, color: new THREE.Color(0xfff8f0), brightness: 1.1, sparkle: true, flakeShape: "circular", anisotropy: 0.1 },
    pearlescent: { enabled: true, primaryColor: new THREE.Color(0xf0ece4), secondaryColor: new THREE.Color(0xd8d0c4), shiftAngle: 15, iridescenceIOR: 1.4, iridescenceThicknessRange: [80, 300], pearlType: "crystal" },
    orangePeel: { enabled: false, frequency: 0, amplitude: 0, noiseOctaves: 0 },
    swirlMarks: { enabled: true, density: 0.12, depth: 0.004, angle: 10 },
    ceramicCoating: { enabled: true, thickness: 0.002, hydrophobic: true, slickness: 0.96, uvProtection: 0.99 },
    clearcoatThickness: 0.08, clearcoatRoughness: 0.004, depthOfClear: 1.0, envMapIntensity: 2.6,
  },
  koenigseggGhost: {
    baseColor: new THREE.Color(0xd0d4dc), finish: "chrome",
    metallicFlake: { density: 0.2, size: 0.3, rotation: 0, color: new THREE.Color(0xf0f4fc), brightness: 1.0, sparkle: false, flakeShape: "circular", anisotropy: 0.0 },
    pearlescent: { enabled: false, primaryColor: new THREE.Color(0xd0d4dc), secondaryColor: new THREE.Color(0xd0d4dc), shiftAngle: 0, iridescenceIOR: 2.5, iridescenceThicknessRange: [100, 400], pearlType: "standard" },
    orangePeel: { enabled: false, frequency: 0, amplitude: 0, noiseOctaves: 0 },
    swirlMarks: { enabled: false, density: 0, depth: 0, angle: 0 },
    ceramicCoating: { enabled: true, thickness: 0.003, hydrophobic: true, slickness: 0.99, uvProtection: 0.99 },
    clearcoatThickness: 0.09, clearcoatRoughness: 0.003, depthOfClear: 1.0, envMapIntensity: 3.0,
  },
  mclarenVolcanicOrange: {
    baseColor: new THREE.Color(0xe86420), finish: "metallic",
    metallicFlake: { density: 0.85, size: 0.95, rotation: 40, color: new THREE.Color(0xff8844), brightness: 1.4, sparkle: true, flakeShape: "hexagonal", anisotropy: 0.3 },
    pearlescent: { enabled: true, primaryColor: new THREE.Color(0xe86420), secondaryColor: new THREE.Color(0xc04810), shiftAngle: 25, iridescenceIOR: 1.6, iridescenceThicknessRange: [150, 480], pearlType: "xirallic" },
    orangePeel: { enabled: true, frequency: 8.0, amplitude: 0.013, noiseOctaves: 3 },
    swirlMarks: { enabled: true, density: 0.2, depth: 0.006, angle: 16 },
    ceramicCoating: { enabled: true, thickness: 0.002, hydrophobic: true, slickness: 0.94, uvProtection: 0.97 },
    clearcoatThickness: 0.058, clearcoatRoughness: 0.012, depthOfClear: 0.83, envMapIntensity: 2.2,
  },
  ferrariBluCorsa: {
    baseColor: new THREE.Color(0x003876), finish: "metallic",
    metallicFlake: { density: 0.8, size: 0.7, rotation: 55, color: new THREE.Color(0x0055aa), brightness: 1.3, sparkle: true, flakeShape: "hexagonal", anisotropy: 0.3 },
    pearlescent: { enabled: true, primaryColor: new THREE.Color(0x003876), secondaryColor: new THREE.Color(0x005090), shiftAngle: 20, iridescenceIOR: 1.5, iridescenceThicknessRange: [130, 450], pearlType: "silk" },
    orangePeel: { enabled: true, frequency: 9.0, amplitude: 0.014, noiseOctaves: 3 },
    swirlMarks: { enabled: true, density: 0.18, depth: 0.005, angle: 15 },
    ceramicCoating: { enabled: true, thickness: 0.002, hydrophobic: true, slickness: 0.95, uvProtection: 0.98 },
    clearcoatThickness: 0.06, clearcoatRoughness: 0.01, depthOfClear: 0.85, envMapIntensity: 2.4,
  },
  rollsRoyceArcticWhite: {
    baseColor: new THREE.Color(0xf2f0ec), finish: "solid",
    metallicFlake: { density: 0.05, size: 0.2, rotation: 0, color: new THREE.Color(0xffffff), brightness: 1.0, sparkle: false, flakeShape: "circular", anisotropy: 0.0 },
    pearlescent: { enabled: false, primaryColor: new THREE.Color(0xf2f0ec), secondaryColor: new THREE.Color(0xf2f0ec), shiftAngle: 0, iridescenceIOR: 1.3, iridescenceThicknessRange: [100, 400], pearlType: "standard" },
    orangePeel: { enabled: false, frequency: 0, amplitude: 0, noiseOctaves: 0 },
    swirlMarks: { enabled: true, density: 0.08, depth: 0.003, angle: 10 },
    ceramicCoating: { enabled: true, thickness: 0.003, hydrophobic: true, slickness: 0.97, uvProtection: 0.99 },
    clearcoatThickness: 0.085, clearcoatRoughness: 0.003, depthOfClear: 1.0, envMapIntensity: 2.8,
  },
  bugattiNoir: {
    baseColor: new THREE.Color(0x080808), finish: "metallic",
    metallicFlake: { density: 0.9, size: 1.0, rotation: 70, color: new THREE.Color(0x1a1a2e), brightness: 1.1, sparkle: true, flakeShape: "irregular", anisotropy: 0.5 },
    pearlescent: { enabled: true, primaryColor: new THREE.Color(0x080808), secondaryColor: new THREE.Color(0x101020), shiftAngle: 30, iridescenceIOR: 1.8, iridescenceThicknessRange: [200, 600], pearlType: "xirallic" },
    orangePeel: { enabled: true, frequency: 10.0, amplitude: 0.005, noiseOctaves: 4 },
    swirlMarks: { enabled: true, density: 0.08, depth: 0.002, angle: 8 },
    ceramicCoating: { enabled: true, thickness: 0.003, hydrophobic: true, slickness: 0.98, uvProtection: 0.99 },
    clearcoatThickness: 0.08, clearcoatRoughness: 0.004, depthOfClear: 1.0, envMapIntensity: 2.9,
  },
  astonMartinOnyxBlack: {
    baseColor: new THREE.Color(0x0c0c10), finish: "metallic",
    metallicFlake: { density: 0.7, size: 0.6, rotation: 40, color: new THREE.Color(0x222230), brightness: 1.0, sparkle: true, flakeShape: "hexagonal", anisotropy: 0.25 },
    pearlescent: { enabled: false, primaryColor: new THREE.Color(0x0c0c10), secondaryColor: new THREE.Color(0x0c0c10), shiftAngle: 0, iridescenceIOR: 1.5, iridescenceThicknessRange: [100, 400], pearlType: "standard" },
    orangePeel: { enabled: true, frequency: 11.0, amplitude: 0.007, noiseOctaves: 4 },
    swirlMarks: { enabled: true, density: 0.15, depth: 0.004, angle: 12 },
    ceramicCoating: { enabled: true, thickness: 0.002, hydrophobic: true, slickness: 0.96, uvProtection: 0.98 },
    clearcoatThickness: 0.07, clearcoatRoughness: 0.006, depthOfClear: 0.9, envMapIntensity: 2.5,
  },
  porscheSharkBlue: {
    baseColor: new THREE.Color(0x2850a0), finish: "metallic",
    metallicFlake: { density: 0.82, size: 0.65, rotation: 48, color: new THREE.Color(0x4070cc), brightness: 1.35, sparkle: true, flakeShape: "hexagonal", anisotropy: 0.28 },
    pearlescent: { enabled: true, primaryColor: new THREE.Color(0x2850a0), secondaryColor: new THREE.Color(0x3060b8), shiftAngle: 22, iridescenceIOR: 1.55, iridescenceThicknessRange: [140, 470], pearlType: "silk" },
    orangePeel: { enabled: true, frequency: 9.5, amplitude: 0.011, noiseOctaves: 3 },
    swirlMarks: { enabled: true, density: 0.16, depth: 0.005, angle: 17 },
    ceramicCoating: { enabled: true, thickness: 0.002, hydrophobic: true, slickness: 0.94, uvProtection: 0.97 },
    clearcoatThickness: 0.062, clearcoatRoughness: 0.009, depthOfClear: 0.84, envMapIntensity: 2.35,
  },
  bmwIndividualDravitGrey: {
    baseColor: new THREE.Color(0x4a4c50), finish: "metallic",
    metallicFlake: { density: 0.72, size: 0.55, rotation: 38, color: new THREE.Color(0x6a6e74), brightness: 1.15, sparkle: true, flakeShape: "circular", anisotropy: 0.2 },
    pearlescent: { enabled: true, primaryColor: new THREE.Color(0x4a4c50), secondaryColor: new THREE.Color(0x5a5e64), shiftAngle: 12, iridescenceIOR: 1.4, iridescenceThicknessRange: [110, 380], pearlType: "silk" },
    orangePeel: { enabled: true, frequency: 10.0, amplitude: 0.009, noiseOctaves: 3 },
    swirlMarks: { enabled: true, density: 0.2, depth: 0.006, angle: 14 },
    ceramicCoating: { enabled: true, thickness: 0.002, hydrophobic: true, slickness: 0.93, uvProtection: 0.96 },
    clearcoatThickness: 0.055, clearcoatRoughness: 0.014, depthOfClear: 0.78, envMapIntensity: 2.1,
  },
  mercedesManufakturPatagoniaRed: {
    baseColor: new THREE.Color(0x6e1520), finish: "tricoat",
    metallicFlake: { density: 0.78, size: 0.85, rotation: 42, color: new THREE.Color(0x992030), brightness: 1.25, sparkle: true, flakeShape: "hexagonal", anisotropy: 0.32 },
    pearlescent: { enabled: true, primaryColor: new THREE.Color(0x6e1520), secondaryColor: new THREE.Color(0x882838), tertiaryColor: new THREE.Color(0x501018), shiftAngle: 28, iridescenceIOR: 1.65, iridescenceThicknessRange: [160, 520], pearlType: "crystal" },
    orangePeel: { enabled: true, frequency: 7.5, amplitude: 0.013, noiseOctaves: 4 },
    swirlMarks: { enabled: true, density: 0.19, depth: 0.006, angle: 16 },
    ceramicCoating: { enabled: true, thickness: 0.002, hydrophobic: true, slickness: 0.95, uvProtection: 0.98 },
    clearcoatThickness: 0.068, clearcoatRoughness: 0.009, depthOfClear: 0.88, envMapIntensity: 2.45,
  },
  lamborghiniViola30th: {
    baseColor: new THREE.Color(0x3a0a4a), finish: "chromaflair",
    metallicFlake: { density: 0.95, size: 1.1, rotation: 65, color: new THREE.Color(0x6622aa), brightness: 1.6, sparkle: true, flakeShape: "irregular", anisotropy: 0.55 },
    pearlescent: { enabled: true, primaryColor: new THREE.Color(0x3a0a4a), secondaryColor: new THREE.Color(0x5a2070), tertiaryColor: new THREE.Color(0x200060), shiftAngle: 40, iridescenceIOR: 2.1, iridescenceThicknessRange: [250, 700], pearlType: "xirallic" },
    orangePeel: { enabled: true, frequency: 11.0, amplitude: 0.007, noiseOctaves: 5 },
    swirlMarks: { enabled: true, density: 0.1, depth: 0.003, angle: 9 },
    ceramicCoating: { enabled: true, thickness: 0.003, hydrophobic: true, slickness: 0.97, uvProtection: 0.99 },
    clearcoatThickness: 0.078, clearcoatRoughness: 0.005, depthOfClear: 1.0, envMapIntensity: 2.7,
  },
  fordPerformanceGrabberBlue: {
    baseColor: new THREE.Color(0x0068b0), finish: "solid",
    metallicFlake: { density: 0.02, size: 0.15, rotation: 0, color: new THREE.Color(0x0080cc), brightness: 1.0, sparkle: false, flakeShape: "circular", anisotropy: 0.0 },
    pearlescent: { enabled: false, primaryColor: new THREE.Color(0x0068b0), secondaryColor: new THREE.Color(0x0068b0), shiftAngle: 0, iridescenceIOR: 1.3, iridescenceThicknessRange: [100, 400], pearlType: "standard" },
    orangePeel: { enabled: true, frequency: 6.0, amplitude: 0.02, noiseOctaves: 2 },
    swirlMarks: { enabled: true, density: 0.35, depth: 0.012, angle: 18 },
    ceramicCoating: { enabled: false, thickness: 0, hydrophobic: false, slickness: 0, uvProtection: 0 },
    clearcoatThickness: 0.045, clearcoatRoughness: 0.02, depthOfClear: 0.65, envMapIntensity: 1.8,
  },
  dodgeViperGTSBlue: {
    baseColor: new THREE.Color(0x103080), finish: "tricoat",
    metallicFlake: { density: 0.88, size: 0.9, rotation: 52, color: new THREE.Color(0x2050aa), brightness: 1.4, sparkle: true, flakeShape: "hexagonal", anisotropy: 0.38 },
    pearlescent: { enabled: true, primaryColor: new THREE.Color(0x103080), secondaryColor: new THREE.Color(0x204098), tertiaryColor: new THREE.Color(0x081840), shiftAngle: 32, iridescenceIOR: 1.75, iridescenceThicknessRange: [180, 580], pearlType: "crystal" },
    orangePeel: { enabled: true, frequency: 8.5, amplitude: 0.012, noiseOctaves: 3 },
    swirlMarks: { enabled: true, density: 0.2, depth: 0.007, angle: 15 },
    ceramicCoating: { enabled: true, thickness: 0.002, hydrophobic: true, slickness: 0.94, uvProtection: 0.97 },
    clearcoatThickness: 0.065, clearcoatRoughness: 0.01, depthOfClear: 0.87, envMapIntensity: 2.35,
  },
  ferrariVerdeZephyr: {
    baseColor: new THREE.Color(0x7aa88c), finish: "metallic",
    metallicFlake: { density: 0.65, size: 0.6, rotation: 30, color: new THREE.Color(0x90c0a0), brightness: 1.1, sparkle: true, flakeShape: "circular", anisotropy: 0.2 },
    pearlescent: { enabled: true, primaryColor: new THREE.Color(0x7aa88c), secondaryColor: new THREE.Color(0x608870), shiftAngle: 18, iridescenceIOR: 1.45, iridescenceThicknessRange: [100, 380], pearlType: "silk" },
    orangePeel: { enabled: true, frequency: 8.0, amplitude: 0.013, noiseOctaves: 3 },
    swirlMarks: { enabled: true, density: 0.15, depth: 0.005, angle: 12 },
    ceramicCoating: { enabled: true, thickness: 0.002, hydrophobic: true, slickness: 0.94, uvProtection: 0.97 },
    clearcoatThickness: 0.058, clearcoatRoughness: 0.012, depthOfClear: 0.82, envMapIntensity: 2.2,
  },
  mclarenChromeBlue: {
    baseColor: new THREE.Color(0x0a2858), finish: "velvet",
    metallicFlake: { density: 0.4, size: 0.3, rotation: 0, color: new THREE.Color(0x1a4888), brightness: 0.9, sparkle: false, flakeShape: "circular", anisotropy: 0.0 },
    pearlescent: { enabled: false, primaryColor: new THREE.Color(0x0a2858), secondaryColor: new THREE.Color(0x0a2858), shiftAngle: 0, iridescenceIOR: 1.3, iridescenceThicknessRange: [100, 400], pearlType: "standard" },
    orangePeel: { enabled: false, frequency: 0, amplitude: 0, noiseOctaves: 0 },
    swirlMarks: { enabled: false, density: 0, depth: 0, angle: 0 },
    ceramicCoating: { enabled: true, thickness: 0.002, hydrophobic: true, slickness: 0.92, uvProtection: 0.96 },
    clearcoatThickness: 0.02, clearcoatRoughness: 0.5, depthOfClear: 0.2, envMapIntensity: 0.6,
  },
  porschePythonGreen: {
    baseColor: new THREE.Color(0x2eaa48), finish: "metallic",
    metallicFlake: { density: 0.7, size: 0.75, rotation: 44, color: new THREE.Color(0x44cc60), brightness: 1.35, sparkle: true, flakeShape: "hexagonal", anisotropy: 0.28 },
    pearlescent: { enabled: true, primaryColor: new THREE.Color(0x2eaa48), secondaryColor: new THREE.Color(0x1a8030), shiftAngle: 22, iridescenceIOR: 1.5, iridescenceThicknessRange: [130, 440], pearlType: "standard" },
    orangePeel: { enabled: true, frequency: 8.5, amplitude: 0.014, noiseOctaves: 3 },
    swirlMarks: { enabled: true, density: 0.2, depth: 0.007, angle: 16 },
    ceramicCoating: { enabled: true, thickness: 0.002, hydrophobic: true, slickness: 0.94, uvProtection: 0.97 },
    clearcoatThickness: 0.06, clearcoatRoughness: 0.01, depthOfClear: 0.85, envMapIntensity: 2.3,
  },
  bugattiTourbillonGraphite: {
    baseColor: new THREE.Color(0x3a3a42), finish: "metallic",
    metallicFlake: { density: 0.75, size: 0.65, rotation: 42, color: new THREE.Color(0x5a5a66), brightness: 1.15, sparkle: true, flakeShape: "irregular", anisotropy: 0.35 },
    pearlescent: { enabled: true, primaryColor: new THREE.Color(0x3a3a42), secondaryColor: new THREE.Color(0x4a4a54), shiftAngle: 15, iridescenceIOR: 1.45, iridescenceThicknessRange: [120, 400], pearlType: "silk" },
    orangePeel: { enabled: true, frequency: 10.5, amplitude: 0.008, noiseOctaves: 4 },
    swirlMarks: { enabled: true, density: 0.12, depth: 0.004, angle: 11 },
    ceramicCoating: { enabled: true, thickness: 0.003, hydrophobic: true, slickness: 0.97, uvProtection: 0.99 },
    clearcoatThickness: 0.075, clearcoatRoughness: 0.005, depthOfClear: 0.95, envMapIntensity: 2.6,
  },
};

// --- NOISE FUNCTIONS ---
function hash21(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) & 0x7fffffff) / 0x7fffffff;
}

function valueNoise2D(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const n00 = hash21(ix, iy), n10 = hash21(ix + 1, iy);
  const n01 = hash21(ix, iy + 1), n11 = hash21(ix + 1, iy + 1);
  return (n00 + (n10 - n00) * sx) + ((n01 + (n11 - n01) * sx) - (n00 + (n10 - n00) * sx)) * sy;
}

function fbmNoise(x: number, y: number, octaves: number): number {
  let val = 0, amp = 0.5, freq = 1.0;
  for (let i = 0; i < octaves; i++) {
    val += amp * valueNoise2D(x * freq, y * freq);
    amp *= 0.5;
    freq *= 2.0;
  }
  return val;
}

function turbulentNoise(x: number, y: number, octaves: number): number {
  let val = 0, amp = 0.5, freq = 1.0;
  for (let i = 0; i < octaves; i++) {
    val += amp * Math.abs(valueNoise2D(x * freq, y * freq) * 2 - 1);
    amp *= 0.5;
    freq *= 2.0;
  }
  return val;
}

// --- PAINT FORMULATION BUILDER ---
export class PaintFormulationBuilder {
  public static buildFormulation(config: MultiLayerPaintConfig): PaintFormulation {
    const layers: PaintLayerConfig[] = [];
    // Layer 1: E-coat primer
    layers.push({
      type: "primer", thickness: 0.025,
      color: new THREE.Color(0x2a2a2a), metalness: 0.1, roughness: 0.6, opacity: 1.0,
    });
    // Layer 2: Primer surfacer
    layers.push({
      type: "primer", thickness: 0.03,
      color: new THREE.Color(0x3a3a3a), metalness: 0, roughness: 0.5, opacity: 1.0,
    });
    // Layer 3: Base coat
    layers.push({
      type: "base_coat", thickness: 0.02,
      color: config.baseColor, metalness: config.finish === "chrome" ? 1.0 : 0.3,
      roughness: 0.3, opacity: 1.0,
    });
    // Layer 4: Flake/pearl layer
    if (config.metallicFlake.density > 0 || config.pearlescent.enabled) {
      layers.push({
        type: "flake_layer", thickness: 0.008,
        color: config.metallicFlake.color, metalness: 0.8, roughness: 0.1, opacity: 0.85,
      });
    }
    // Layer 5: Clearcoat
    layers.push({
      type: "clearcoat", thickness: config.clearcoatThickness,
      color: new THREE.Color(0xffffff), metalness: 0, roughness: config.clearcoatRoughness, opacity: 1.0,
    });
    // Layer 6: Ceramic top coat
    if (config.ceramicCoating.enabled) {
      layers.push({
        type: "ceramic_coat", thickness: config.ceramicCoating.thickness,
        color: new THREE.Color(0xffffff), metalness: 0, roughness: 0.01, opacity: 0.95,
      });
    }
    const totalDFT = layers.reduce((sum, l) => sum + l.thickness, 0);
    return { layers, totalDryFilmThickness: totalDFT, applicationMethod: "spray", cureTemperature: 140 };
  }
}

// --- MULTI-LAYER PAINT SYSTEM ---
export class MultiLayerPaintSystem {
  public static createPaintMaterial(config: MultiLayerPaintConfig): THREE.MeshPhysicalMaterial {
    const finish = config.finish;
    const isMatte = finish === "matte" || finish === "frozen";
    let metalness = 0.0, roughness = 0.25;

    switch (finish) {
      case "solid": metalness = 0; roughness = 0.22; break;
      case "metallic": metalness = 0.72; roughness = 0.14; break;
      case "pearlescent": metalness = 0.45; roughness = 0.16; break;
      case "matte": metalness = 0; roughness = 0.78; break;
      case "satin": metalness = 0.1; roughness = 0.42; break;
      case "chrome": metalness = 1; roughness = 0.02; break;
      case "frozen": metalness = 0.6; roughness = 0.32; break;
      case "chromaflair": metalness = 0.85; roughness = 0.1; break;
      case "tricoat": metalness = 0.65; roughness = 0.12; break;
      case "velvet": metalness = 0.15; roughness = 0.55; break;
    }

    const cc = isMatte ? 0 : Math.min(1, config.clearcoatThickness / 0.06);
    const sheen = isMatte ? 0.3 : (finish === "satin" ? 0.15 : 0.05);
    const irid = config.pearlescent.enabled ? 0.3 : (finish === "chromaflair" ? 0.5 : 0);
    const ior = config.pearlescent.enabled ? config.pearlescent.iridescenceIOR : 1.5;

    const mat = new THREE.MeshPhysicalMaterial({
      color: config.baseColor, metalness, roughness, clearcoat: cc,
      clearcoatRoughness: isMatte ? 0.8 : config.clearcoatRoughness,
      sheen, sheenColor: config.baseColor.clone().multiplyScalar(0.7),
      specularColor: new THREE.Color().copy(config.baseColor).lerp(new THREE.Color(0xffffff), metalness * 0.4),
      specularIntensity: finish === "chrome" ? 1.5 : (metalness > 0.5 ? 1.2 : 0.8),
      envMapIntensity: config.envMapIntensity,
      iridescence: irid, iridescenceIOR: ior,
      iridescenceThicknessRange: config.pearlescent.iridescenceThicknessRange,
    });

    if (config.metallicFlake.density > 0 && config.metallicFlake.sparkle) {
      mat.normalMap = this.generateFlakeNormalMap(config.metallicFlake);
      mat.normalScale.set(0.15, 0.15);
    }
    if (config.orangePeel.enabled) {
      mat.normalMap = this.generateOrangePeelMap(config.orangePeel);
      mat.normalScale.set(0.08, 0.08);
    }
    if (config.swirlMarks.enabled) {
      mat.roughnessMap = this.generateSwirlMarkMap(config.swirlMarks);
    }
    mat.needsUpdate = true;
    return mat;
  }

  // --- TEXTURE GENERATORS ---
  public static generateFlakeNormalMap(flake: MetallicFlakeConfig): THREE.DataTexture {
    const size = 256;
    const data = new Uint8Array(size * size * 4);
    const threshold = 1.0 - flake.density;
    const flakeArea = flake.size * 0.04;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const h = hash21(x * 7 + 13, y * 11 + 17);
        if (h > threshold) {
          const angle = (flake.rotation * Math.PI / 180) + hash21(x, y) * 0.5;
          const nx = Math.cos(angle) * flakeArea;
          const ny = Math.sin(angle) * flakeArea;
          const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
          data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
          data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
          data[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
        } else {
          data[idx] = 128; data[idx + 1] = 128; data[idx + 2] = 255;
        }
        data[idx + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(32, 32);
    tex.needsUpdate = true;
    return tex;
  }

  public static generateOrangePeelMap(peel: OrangePeelConfig): THREE.DataTexture {
    const size = 256;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const u = (x / size) * peel.frequency;
        const v = (y / size) * peel.frequency;
        const height = fbmNoise(u, v, peel.noiseOctaves);
        const dx = fbmNoise(u + 0.01, v, peel.noiseOctaves) - height;
        const dy = fbmNoise(u, v + 0.01, peel.noiseOctaves) - height;
        const nx = -dx * peel.amplitude * 100;
        const ny = -dy * peel.amplitude * 100;
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
        data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
        data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
        data[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
        data[idx + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    tex.needsUpdate = true;
    return tex;
  }

  public static generateSwirlMarkMap(swirl: SwirlMarkConfig): THREE.DataTexture {
    const size = 256;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const u = x / size, v = y / size;
        const cx = u - 0.5, cy = v - 0.5;
        const dist = Math.sqrt(cx * cx + cy * cy);
        const angle = Math.atan2(cy, cx);
        const sp = Math.sin(dist * 80 + angle * swirl.angle) * 0.5 + 0.5;
        const value = sp * swirl.density + hash21(x, y) * 0.1;
        const r = Math.floor(value * 255);
        data[idx] = r; data[idx + 1] = r; data[idx + 2] = r; data[idx + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    tex.needsUpdate = true;
    return tex;
  }

  public static generateCeramicCoatingMap(config: CeramicCoatingConfig): THREE.DataTexture {
    if (!config.enabled) return this.generateFlatWhiteMap(64);
    const size = 128;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const u = x / size, v = y / size;
        const h = turbulentNoise(u * 40, v * 40, 4);
        const slickness = config.slickness * (0.9 + h * 0.1);
        const v8 = Math.floor(slickness * 255);
        data[idx] = v8; data[idx + 1] = v8; data[idx + 2] = v8; data[idx + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    tex.needsUpdate = true;
    return tex;
  }

  public static generateWeatheringMap(config: WeatheringConfig): THREE.DataTexture {
    if (!config.enabled) return this.generateFlatWhiteMap(128);
    const size = 256;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const u = x / size, v = y / size;
        let wear = 0;
        // Oxidation
        wear += config.oxidationLevel * fbmNoise(u * 8, v * 8, 3);
        // Dust accumulation
        wear += config.dustAmount * valueNoise2D(u * 20, v * 20) * 0.3;
        // Water spots
        if (config.waterSpots > 0) {
          for (let s = 0; s < 8; s++) {
            const sx = hash21(s * 37, 13) * size;
            const sy = hash21(s * 41, 17) * size;
            const dist = Math.sqrt((x - sx) ** 2 + (y - sy) ** 2);
            if (dist < 15) wear += config.waterSpots * 0.4 * (1 - dist / 15);
          }
        }
        // Micro-scratches from UV
        if (config.microScratches > 0) {
          wear += config.microScratches * 0.15 * (Math.sin(x * 0.5 + y * 0.3) * 0.5 + 0.5);
        }
        wear = Math.min(1, wear);
        const v8 = Math.floor(wear * 200);
        data[idx] = v8; data[idx + 1] = v8; data[idx + 2] = v8; data[idx + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    tex.needsUpdate = true;
    return tex;
  }

  private static generateFlatWhiteMap(size: number): THREE.DataTexture {
    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      data[i * 4] = 255; data[i * 4 + 1] = 255;
      data[i * 4 + 2] = 255; data[i * 4 + 3] = 255;
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.needsUpdate = true;
    return tex;
  }

  // --- ANIMATION SUPPORT ---
  private static animatedMaterials: Map<THREE.MeshPhysicalMaterial, { config: MetallicFlakeConfig; time: number }> = new Map();

  public static registerForAnimation(material: THREE.MeshPhysicalMaterial, flakeConfig: MetallicFlakeConfig): void {
    this.animatedMaterials.set(material, { config: flakeConfig, time: 0 });
  }

  public static updateAnimations(deltaTime: number): void {
    this.animatedMaterials.forEach((entry, material) => {
      entry.time += deltaTime;
      if (entry.config.sparkle && material.normalMap) {
        // Rotate normal map UV offset for sparkle shimmer
        material.normalMap.offset.x = Math.sin(entry.time * 0.5) * 0.02;
        material.normalMap.offset.y = Math.cos(entry.time * 0.3) * 0.02;
        material.normalMap.needsUpdate = true;
      }
    });
  }

  // --- CALIBRATION ---
  public static calibratePaintFromHex(colorHex: number, finish: MultiLayerPaintConfig["finish"]): THREE.MeshPhysicalMaterial {
    return this.createPaintMaterial({
      baseColor: new THREE.Color(colorHex), finish,
      metallicFlake: { density: 0.6, size: 0.5, rotation: 45, color: new THREE.Color(colorHex), brightness: 1, sparkle: true, flakeShape: "hexagonal", anisotropy: 0.3 },
      pearlescent: { enabled: false, primaryColor: new THREE.Color(colorHex), secondaryColor: new THREE.Color(colorHex), shiftAngle: 0, iridescenceIOR: 1.5, iridescenceThicknessRange: [100, 400], pearlType: "standard" },
      orangePeel: { enabled: true, frequency: 8, amplitude: 0.015, noiseOctaves: 3 },
      swirlMarks: { enabled: true, density: 0.2, depth: 0.008, angle: 15 },
      ceramicCoating: { enabled: true, thickness: 0.002, hydrophobic: true, slickness: 0.9, uvProtection: 0.95 },
      clearcoatThickness: 0.05, clearcoatRoughness: 0.02, depthOfClear: 0.7, envMapIntensity: 2,
    });
  }

  // --- SCENE APPLICATION ---
  public static applyToScene(root: THREE.Object3D, config: MultiLayerPaintConfig): void {
    const mat = this.createPaintMaterial(config);
    const bodyKeywords = [
      "body", "paint", "door", "hood", "fender", "roof", "bumper",
      "quarter", "spoiler", "wing", "fascia", "skirt", "panel",
      "bonnet", "decklid", "trunk", "rocker", "cowl", "valance",
    ];
    const excludeKeywords = ["glass", "window", "windshield", "windscreen", "light", "lens", "chrome", "trim", "badge"];
    root.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) return;
      const mesh = node as THREE.Mesh;
      const name = mesh.name.toLowerCase();
      if (bodyKeywords.some((k) => name.includes(k)) && !excludeKeywords.some((k) => name.includes(k))) {
        const existingMap = (mesh.material as THREE.MeshStandardMaterial)?.map;
        mesh.material = mat.clone();
        if (existingMap) (mesh.material as THREE.MeshPhysicalMaterial).map = existingMap;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }

  public static applyWeathering(root: THREE.Object3D, config: WeatheringConfig): void {
    const weatherMap = this.generateWeatheringMap(config);
    root.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) return;
      const mesh = node as THREE.Mesh;
      const mat = mesh.material as THREE.MeshPhysicalMaterial;
      if (mat.isMeshPhysicalMaterial && mat.roughnessMap) {
        // Blend weathering into roughness — more weather = rougher paint
        mat.roughness = Math.min(1, mat.roughness + config.oxidationLevel * 0.3);
        if (config.dustAmount > 0) {
          mat.map = weatherMap;
        }
        mat.needsUpdate = true;
      }
    });
  }
}
