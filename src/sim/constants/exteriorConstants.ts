// ===================================================================
// EXTERIOR VEHICLE ASSEMBLY CONSTANTS & AUTOMOTIVE STANDARDS
// ===================================================================
// Engineering databases for sheet metal, composites, paint chemistry,
// aero coefficients, glass optical properties, and default factory presets.
// ===================================================================

import type {
  ExteriorEngineeringConfig,
  PaintSystemConfig,
  AeroSurfaceConfig,
  LightingConfig,
  GlassConfig,
  ExteriorWheelConfig,
  ExteriorTireConfig,
  ExteriorBrakeVisualConfig,
} from "../types/exterior";

// ===================================================================
// 1. MATERIAL GRADE ENGINEERING DATABASE
// ===================================================================

export interface ExteriorMaterialSpec {
  id: string;
  name: string;
  category: "Steel" | "Aluminum" | "Composite" | "Polymer" | "Exotic";
  densityKgM3: number;              // Material density
  yieldStrengthMPa: number;         // 0.2% offset yield
  tensileStrengthMPa: number;       // Ultimate tensile strength
  elasticModulusGPa: number;        // Young's Modulus
  elongationAtBreakPercent: number; // Ductility metric
  formabilityIndex: number;         // 0.0 - 1.0 (Deep drawing capability)
  corrosionResistanceScore: number; // 0 - 100 (Salt spray hours resistance)
  paintAdhesionScore: number;       // 0 - 100 (Cross-hatch test rating)
  rawCostPerKgUSD: number;          // Material acquisition cost
  embodiedCarbonKgCO2PerKg: number; // Environmental impact
  repairabilityScore: number;       // 0 - 100 (PDR / panel beating rating)
}

export const EXTERIOR_MATERIAL_DATABASE: Record<string, ExteriorMaterialSpec> = {
  mild_steel_cr4: {
    id: "mild_steel_cr4",
    name: "Deep-Drawing Cold Rolled Mild Steel (CR4)",
    category: "Steel",
    densityKgM3: 7850,
    yieldStrengthMPa: 170,
    tensileStrengthMPa: 310,
    elasticModulusGPa: 210,
    elongationAtBreakPercent: 40,
    formabilityIndex: 0.98,
    corrosionResistanceScore: 45,
    paintAdhesionScore: 98,
    rawCostPerKgUSD: 1.40,
    embodiedCarbonKgCO2PerKg: 2.1,
    repairabilityScore: 95,
  },
  hsla_steel_350: {
    id: "hsla_steel_350",
    name: "High-Strength Low-Alloy Steel (HSLA 350)",
    category: "Steel",
    densityKgM3: 7850,
    yieldStrengthMPa: 350,
    tensileStrengthMPa: 480,
    elasticModulusGPa: 210,
    elongationAtBreakPercent: 24,
    formabilityIndex: 0.82,
    corrosionResistanceScore: 55,
    paintAdhesionScore: 95,
    rawCostPerKgUSD: 2.10,
    embodiedCarbonKgCO2PerKg: 2.4,
    repairabilityScore: 85,
  },
  uhss_boron_22mnb5: {
    id: "uhss_boron_22mnb5",
    name: "Hot-Stamped Boron Ultra-High-Strength Steel (22MnB5)",
    category: "Steel",
    densityKgM3: 7850,
    yieldStrengthMPa: 1200,
    tensileStrengthMPa: 1550,
    elasticModulusGPa: 210,
    elongationAtBreakPercent: 8,
    formabilityIndex: 0.35,
    corrosionResistanceScore: 70,
    paintAdhesionScore: 92,
    rawCostPerKgUSD: 4.80,
    embodiedCarbonKgCO2PerKg: 3.2,
    repairabilityScore: 25,
  },
  aluminum_6016_t4: {
    id: "aluminum_6016_t4",
    name: "Automotive Body Sheet Aluminum (AA6016-T4)",
    category: "Aluminum",
    densityKgM3: 2700,
    yieldStrengthMPa: 130,
    tensileStrengthMPa: 240,
    elasticModulusGPa: 70,
    elongationAtBreakPercent: 28,
    formabilityIndex: 0.88,
    corrosionResistanceScore: 90,
    paintAdhesionScore: 88,
    rawCostPerKgUSD: 5.50,
    embodiedCarbonKgCO2PerKg: 8.5,
    repairabilityScore: 70,
  },
  aluminum_7075_t6: {
    id: "aluminum_7075_t6",
    name: "Aerospace Structural Billet Aluminum (AA7075-T6)",
    category: "Aluminum",
    densityKgM3: 2810,
    yieldStrengthMPa: 505,
    tensileStrengthMPa: 570,
    elasticModulusGPa: 72,
    elongationAtBreakPercent: 11,
    formabilityIndex: 0.40,
    corrosionResistanceScore: 82,
    paintAdhesionScore: 85,
    rawCostPerKgUSD: 14.00,
    embodiedCarbonKgCO2PerKg: 12.0,
    repairabilityScore: 50,
  },
  carbon_fiber_wet_layup: {
    id: "carbon_fiber_wet_layup",
    name: "Hand-Laid Epoxy Carbon Composite (Wet Layup)",
    category: "Composite",
    densityKgM3: 1550,
    yieldStrengthMPa: 600,
    tensileStrengthMPa: 850,
    elasticModulusGPa: 65,
    elongationAtBreakPercent: 1.8,
    formabilityIndex: 0.65,
    corrosionResistanceScore: 100,
    paintAdhesionScore: 80,
    rawCostPerKgUSD: 38.00,
    embodiedCarbonKgCO2PerKg: 22.0,
    repairabilityScore: 40,
  },
  carbon_fiber_prepreg_autoclave: {
    id: "carbon_fiber_prepreg_autoclave",
    name: "Toray T1000G Pre-Preg Autoclaved Carbon (Race Spec)",
    category: "Composite",
    densityKgM3: 1490,
    yieldStrengthMPa: 1850,
    tensileStrengthMPa: 2400,
    elasticModulusGPa: 145,
    elongationAtBreakPercent: 1.5,
    formabilityIndex: 0.50,
    corrosionResistanceScore: 100,
    paintAdhesionScore: 85,
    rawCostPerKgUSD: 110.00,
    embodiedCarbonKgCO2PerKg: 35.0,
    repairabilityScore: 20,
  },
  forged_carbon_smc: {
    id: "forged_carbon_smc",
    name: "Compression-Molded Forged Carbon Sheet Composite",
    category: "Composite",
    densityKgM3: 1400,
    yieldStrengthMPa: 420,
    tensileStrengthMPa: 680,
    elasticModulusGPa: 52,
    elongationAtBreakPercent: 2.2,
    formabilityIndex: 0.92,
    corrosionResistanceScore: 100,
    paintAdhesionScore: 90,
    rawCostPerKgUSD: 65.00,
    embodiedCarbonKgCO2PerKg: 26.0,
    repairabilityScore: 35,
  },
  polycarbonate_lexan: {
    id: "polycarbonate_lexan",
    name: "Optical Grade Hard-Coated Polycarbonate (Lexan)",
    category: "Polymer",
    densityKgM3: 1200,
    yieldStrengthMPa: 65,
    tensileStrengthMPa: 75,
    elasticModulusGPa: 2.4,
    elongationAtBreakPercent: 110,
    formabilityIndex: 0.95,
    corrosionResistanceScore: 100,
    paintAdhesionScore: 75,
    rawCostPerKgUSD: 9.50,
    embodiedCarbonKgCO2PerKg: 6.0,
    repairabilityScore: 60,
  },
  titanium_gr5_ti6al4v: {
    id: "titanium_gr5_ti6al4v",
    name: "Aerospace Grade 5 Titanium (Ti-6Al-4V)",
    category: "Exotic",
    densityKgM3: 4430,
    yieldStrengthMPa: 880,
    tensileStrengthMPa: 950,
    elasticModulusGPa: 114,
    elongationAtBreakPercent: 14,
    formabilityIndex: 0.45,
    corrosionResistanceScore: 100,
    paintAdhesionScore: 90,
    rawCostPerKgUSD: 85.00,
    embodiedCarbonKgCO2PerKg: 45.0,
    repairabilityScore: 30,
  },
  magnesium_az91d: {
    id: "magnesium_az91d",
    name: "Die-Cast Ultra-Light Magnesium Alloy (AZ91D)",
    category: "Exotic",
    densityKgM3: 1810,
    yieldStrengthMPa: 150,
    tensileStrengthMPa: 230,
    elasticModulusGPa: 45,
    elongationAtBreakPercent: 3.5,
    formabilityIndex: 0.55,
    corrosionResistanceScore: 60,
    paintAdhesionScore: 82,
    rawCostPerKgUSD: 18.00,
    embodiedCarbonKgCO2PerKg: 28.0,
    repairabilityScore: 20,
  },
};

// ===================================================================
// 2. NOMINAL AUTOMOTIVE PANEL THICKNESSES (mm)
// ===================================================================

export const NOMINAL_PANEL_THICKNESS_MM: Record<string, { steel: number; aluminum: number; carbon: number }> = {
  hood_outer: { steel: 0.75, aluminum: 0.90, carbon: 1.10 },
  hood_inner_skeleton: { steel: 0.65, aluminum: 0.85, carbon: 1.20 },
  front_fender: { steel: 0.70, aluminum: 0.90, carbon: 1.00 },
  door_outer_skin: { steel: 0.70, aluminum: 0.95, carbon: 1.15 },
  door_anti_intrusion_beam: { steel: 1.80, aluminum: 3.20, carbon: 3.50 },
  roof_panel: { steel: 0.65, aluminum: 0.85, carbon: 0.95 },
  rear_quarter_panel: { steel: 0.75, aluminum: 1.00, carbon: 1.20 },
  trunk_lid: { steel: 0.70, aluminum: 0.90, carbon: 1.10 },
  floor_pan_stamp: { steel: 1.00, aluminum: 1.60, carbon: 2.20 },
  firewall_bulkhead: { steel: 1.20, aluminum: 1.80, carbon: 2.40 },
  a_pillar_reinforcement: { steel: 1.80, aluminum: 2.60, carbon: 3.20 },
  b_pillar_reinforcement: { steel: 2.20, aluminum: 3.40, carbon: 4.00 },
  front_splitter: { steel: 1.20, aluminum: 2.00, carbon: 2.80 },
  rear_diffuser: { steel: 1.00, aluminum: 1.80, carbon: 2.20 },
  rear_wing_blade: { steel: 0.80, aluminum: 1.50, carbon: 1.80 },
};

// ===================================================================
// 3. SHUT-LINE & FLUSHNESS MANUFACTURING STANDARDS
// ===================================================================

export interface ShutLineToleranceRule {
  panelPairLabel: string;
  nominalGapMm: number;
  toleranceMinusMm: number;
  tolerancePlusMm: number;
  nominalFlushMm: number;
  flushToleranceMm: number;
}

export const SHUT_LINE_SPECIFICATION_STANDARDS: Record<string, ShutLineToleranceRule> = {
  hood_to_front_fender_left: {
    panelPairLabel: "Hood / Front Fender (LH)",
    nominalGapMm: 3.5,
    toleranceMinusMm: 0.4,
    tolerancePlusMm: 0.5,
    nominalFlushMm: 0.0,
    flushToleranceMm: 0.3,
  },
  hood_to_front_fender_right: {
    panelPairLabel: "Hood / Front Fender (RH)",
    nominalGapMm: 3.5,
    toleranceMinusMm: 0.4,
    tolerancePlusMm: 0.5,
    nominalFlushMm: 0.0,
    flushToleranceMm: 0.3,
  },
  hood_to_front_bumper: {
    panelPairLabel: "Hood / Front Bumper Fascia",
    nominalGapMm: 4.0,
    toleranceMinusMm: 0.5,
    tolerancePlusMm: 0.6,
    nominalFlushMm: -0.5, // Bumper slightly recessed for aero seal
    flushToleranceMm: 0.4,
  },
  front_fender_to_front_door_left: {
    panelPairLabel: "Front Fender / Door (LH)",
    nominalGapMm: 3.2,
    toleranceMinusMm: 0.3,
    tolerancePlusMm: 0.4,
    nominalFlushMm: 0.0,
    flushToleranceMm: 0.25,
  },
  front_door_to_rear_quarter_left: {
    panelPairLabel: "Door / Rear Quarter (LH)",
    nominalGapMm: 3.2,
    toleranceMinusMm: 0.3,
    tolerancePlusMm: 0.4,
    nominalFlushMm: 0.0,
    flushToleranceMm: 0.25,
  },
  trunk_to_rear_quarter_left: {
    panelPairLabel: "Trunk Lid / Rear Quarter (LH)",
    nominalGapMm: 3.8,
    toleranceMinusMm: 0.5,
    tolerancePlusMm: 0.5,
    nominalFlushMm: 0.0,
    flushToleranceMm: 0.35,
  },
  trunk_to_rear_bumper: {
    panelPairLabel: "Trunk Lid / Rear Bumper Fascia",
    nominalGapMm: 4.5,
    toleranceMinusMm: 0.6,
    tolerancePlusMm: 0.7,
    nominalFlushMm: -0.8,
    flushToleranceMm: 0.5,
  },
  windshield_to_roof_flushness: {
    panelPairLabel: "Windshield Glass / Roof Header",
    nominalGapMm: 2.0,
    toleranceMinusMm: 0.3,
    tolerancePlusMm: 0.3,
    nominalFlushMm: 0.0,
    flushToleranceMm: 0.2,
  },
};

// ===================================================================
// 4. PRESET COLOR PALETTE DATABASE
// ===================================================================

export interface AutomotivePaintSwatch {
  id: string;
  name: string;
  brandInspiration: string;
  hex: string;
  metallicDensity: number;
  pearlShift: number;
  candyDepth: number;
  finishRecommended: PaintSystemConfig["finishType"];
}

export const APEX_HERITAGE_PAINT_SWATCHES: AutomotivePaintSwatch[] = [
  {
    id: "rosso_corsa_apex",
    name: "Apex Rosso Corsa",
    brandInspiration: "Scuderia Italian Racing",
    hex: "#d40000",
    metallicDensity: 0.15,
    pearlShift: 0.0,
    candyDepth: 0.45,
    finishRecommended: "high_gloss_mirror",
  },
  {
    id: "silverstone_titanium_grey",
    name: "Silverstone Billet Metallic",
    brandInspiration: "British GT Endurance",
    hex: "#8e9297",
    metallicDensity: 0.85,
    pearlShift: 0.1,
    candyDepth: 0.1,
    finishRecommended: "liquid_metallic",
  },
  {
    id: "giallo_modena_pearl",
    name: "Modena Solar Pearl",
    brandInspiration: "Emilian Supercar V12",
    hex: "#facc15",
    metallicDensity: 0.40,
    pearlShift: 0.65,
    candyDepth: 0.3,
    finishRecommended: "tri_coat_pearl_iridescent",
  },
  {
    id: "blu_nart_racing",
    name: "NART North American Blue",
    brandInspiration: "Classic Sebring / Daytona",
    hex: "#1d4ed8",
    metallicDensity: 0.60,
    pearlShift: 0.25,
    candyDepth: 0.5,
    finishRecommended: "liquid_metallic",
  },
  {
    id: "british_racing_emerald",
    name: "Goodwood Dark Emerald",
    brandInspiration: "Historic Le Mans Classic",
    hex: "#064e3b",
    metallicDensity: 0.70,
    pearlShift: 0.35,
    candyDepth: 0.6,
    finishRecommended: "liquid_metallic",
  },
  {
    id: "midnight_purple_iii",
    name: "Midnight Chroma Prism",
    brandInspiration: "JDM Legend Chameleon",
    hex: "#581c87",
    metallicDensity: 0.90,
    pearlShift: 0.95,
    candyDepth: 0.7,
    finishRecommended: "chameleon_colorshift",
  },
  {
    id: "stealth_matte_nero",
    name: "Nero Nemesis Satin Carbon",
    brandInspiration: "Bespoke Hypercar Prototype",
    hex: "#18181b",
    metallicDensity: 0.0,
    pearlShift: 0.0,
    candyDepth: 0.0,
    finishRecommended: "deep_satin_matte",
  },
  {
    id: "gulf_heritage_light_blue",
    name: "Heritage Gulf Azure",
    brandInspiration: "1969 Le Mans Winner",
    hex: "#38bdf8",
    metallicDensity: 0.05,
    pearlShift: 0.0,
    candyDepth: 0.2,
    finishRecommended: "high_gloss_mirror",
  },
  {
    id: "papaya_orange_speed",
    name: "Papaya Can-Am Orange",
    brandInspiration: "McLaren Bruce Heritage",
    hex: "#ea580c",
    metallicDensity: 0.30,
    pearlShift: 0.40,
    candyDepth: 0.6,
    finishRecommended: "tri_coat_pearl_iridescent",
  },
  {
    id: "liquid_liquid_chrome",
    name: "Vapor-Deposited Chrome",
    brandInspiration: "Silver Arrows F1",
    hex: "#e2e8f0",
    metallicDensity: 1.0,
    pearlShift: 0.0,
    candyDepth: 0.0,
    finishRecommended: "full_mirror_chrome",
  },
];

// ===================================================================
// 5. DEFAULT FACTORY PRESET GENERATORS
// ===================================================================

export function createDefaultExteriorConfig(): ExteriorEngineeringConfig {
  return {
    bodyStyle: "hypercar_coupe",
    doorOpening: "butterfly_mclaren",
    roofStyle: "solid_carbon_double_bubble",
    frontFascia: "aggressive_shark_nose",
    rearFascia: "integrated_diffuser_tunnel",

    wheelbase: 2700,
    trackWidthFront: 1680,
    trackWidthRear: 1710,
    overallLength: 4680,
    overallWidth: 2020,
    overallHeight: 1160,
    groundClearance: 85,
    frontOverhang: 920,
    rearOverhang: 1060,

    cowlHeight: 710,
    beltlineHeight: 820,
    roofApexHeight: 1160,
    hipPointHeight: 310,
    decklidHeight: 900,

    sideTumblehomeAngle: 24,
    windshieldRakeAngle: 29,
    rearWindowRakeAngle: 22,
    hoodSlopeAngle: 14,

    targetPanelGap: 3.5,
    targetFlushness: 0.0,
    hemmingRadius: 1.2,
    characterLineSharpness: 2.5,

    activeAeroEquipped: true,
    flatUnderfloor: true,
    vortexGenerators: true,
    brakeDuctsFunctional: true,
    widebodyFlareFrontMm: 25,
    widebodyFlareRearMm: 45,
  };
}

export function createDefaultPaintConfig(): PaintSystemConfig {
  return {
    finishType: "liquid_metallic",
    primaryColorHex: "#0284c7", // Apex Electric Cyan Blue
    secondaryColorHex: "#0f172a", // Contrast Gloss Carbon / Slate
    tertiaryColorHex: "#f59e0b", // Racing Amber Caliper Accent

    liveryStyle: "two_tone_roof",
    stripeWidthMm: 160,
    accentSplitterColor: "#f59e0b",
    mirrorsContrastColor: true,
    roofContrastColor: true,

    eCoatPrimerMicrons: 22,
    primerSurfacerMicrons: 32,
    baseCoatMicrons: 16,
    clearCoatMicrons: 50,
    clearCoatGrade: "ceramic_quartz_nanocoat",

    metallicFlakeSizeMicrons: 25,
    metallicFlakeDensity: 0.75,
    pearlMicaChromaShift: 0.35,
    candyDepthTranslucency: 0.40,
    orangePeelTextureIndex: 0.08, // Hand wet-sanded mirror finish
    distinctnessOfImageDOI: 94,
    uvProtectionHalfLifeYears: 18,
  };
}

export function createDefaultAeroConfig(): AeroSurfaceConfig {
  return {
    frontSplitterProfile: "gt3_stepped_endplate",
    splitterExtensionMm: 110,
    splitterGroundClearanceMm: 65,
    splitterSupportRods: true,
    frontDivePlanesCanardsCount: 2,
    frontCanardAngleDeg: 18,
    hoodVentAreaCm2: 1200,

    underbodyFloorType: "venturi_dual_tunnel",
    venturiThroatHeightMm: 32,
    diffuserProfile: "gt3_race_high_kick_7",
    diffuserExpansionAngleDeg: 14,
    diffuserFinCount: 7,
    diffuserStrakeExtensionMm: 95,

    rearWingType: "swan_neck_carbon_pylon",
    wingSpanMm: 1680,
    wingChordMm: 320,
    wingAngleOfAttackDeg: 14,
    wingEndplateHeightMm: 220,
    wingGurneyFlapHeightMm: 8,
    hasActiveDRS: true,
    airbrakeMaxAngleDeg: 72,

    frontCenterGrilleAreaCm2: 1800,
    sidePodIntakeAreaCm2: 950,
    fenderArchPressureReliefLouvers: true,
    rearDeckHeatExtractionSlots: true,
  };
}

export function createDefaultLightingConfig(): LightingConfig {
  return {
    headlightTech: "full_matrix_led_84_pixel",
    taillightTech: "flexible_3d_oled_surface",
    drlSignature: "sharp_c_clamp",
    lensTint: "crystal_clear",
    sequentialTurnSignals: true,
    hasWelcomeStartupSequence: true,
    corneringAdaptiveIllumination: true,
    underbodyAmbientGlow: true,
    ambientGlowColorHex: "#00f0ff",
    projectorBezelFinish: "exposed_carbon",
    thirdBrakeLightStyle: "integrated_roof_spoiler",
  };
}

export function createDefaultGlassConfig(): GlassConfig {
  return {
    windshieldGlass: "dual_laminated_acoustic",
    sideDoorGlass: "dual_laminated_acoustic",
    rearQuarterGlass: "polycarbonate_lexan_race",
    rearBackliteGlass: "gorilla_glass_thin_film",
    roofGlass: "electrochromic_smart_tint",

    windshieldTintVLT: 80,
    sideFrontTintVLT: 50,
    sideRearTintVLT: 20,
    rearWindowTintVLT: 15,
    uvInfraredRejectionPercent: 95,
    hasAcousticPVBInterlayer: true,
    hasHeatedDefrostGridTungsten: true,
    hasHydrophobicNanoCoat: true,
    ceramicBorderFritDotMatrix: true,
  };
}

export function createDefaultWheelConfig(): ExteriorWheelConfig {
  return {
    spokePattern: "centerlock_f1_monobloc",
    construction: "6061_t6_forged_monoblock",
    diameterFrontInches: 20,
    diameterRearInches: 21,
    widthFrontInches: 9.5,
    widthRearInches: 12.5,
    offsetFrontMm: +32,
    offsetRearMm: +22,
    centerLockNut: true,
    finish: "satin_bronze",
    centerCapLogo: "APEX",
  };
}

export function createDefaultTireConfig(): ExteriorTireConfig {
  return {
    frontWidthMm: 265,
    frontAspectRatio: 35,
    rearWidthMm: 335,
    rearAspectRatio: 30,
    tireCompound: "track_r_compound",
    sidewallLettering: "yellow_pirelli_f1",
    treadDepthRemainingMm: 6.5,
  };
}

export function createDefaultBrakeVisualConfig(): ExteriorBrakeVisualConfig {
  return {
    caliperColorHex: "#f59e0b",
    caliperLogo: "CERAMIC_CARBON",
    pistonCountFront: 8,
    pistonCountRear: 4,
    rotorType: "carbon_ceramic_matrix",
    rotorDiameterFrontMm: 410,
    rotorDiameterRearMm: 390,
    hasTitaniumHeatShields: true,
  };
}
