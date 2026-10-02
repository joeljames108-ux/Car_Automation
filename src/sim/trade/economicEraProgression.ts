/**
 * ═══════════════════════════════════════════════════════════════════════
 * ECONOMIC ERA PROGRESSION FOR MATERIALS & AUTOMOTIVE SUPPLY CHAIN
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Connects the 1970 → 2025+ automotive timeline with raw materials,
 * components, and supplier market availability:
 *
 * 1. Material Tech Gates:
 *    - 1970: Carbon Steel, Cast Iron, Vulcanized Rubber, Float Glass, Copper Wire
 *    - 1975: Impact Engineering Plastics & Polymers
 *    - 1980: High-Strength Low-Alloy (HSLA) Steel
 *    - 1985: Extruded 6000-Series Aluminum
 *    - 1990: Pre-preg Carbon Fiber (Autoclave motorsport/supercar)
 *    - 1995: Hot-Stamped Ultra-High-Strength Boron Steel (UHSS)
 *    - 2000: Aerospace Titanium Alloys
 *
 * 2. Technological Learning Curve Deflation:
 *    - Advanced materials (Carbon fiber, Titanium, Aluminum) drop in relative
 *      cost as industrial scale increases over the decades.
 *
 * 3. General Automotive Inflation Index:
 *    - Anchored to 1970 baseline (1.0x → 1.45x in 1985 → 2.15x in 2000 → 3.20x in 2015+).
 */

import { ProcessedMaterialType, ComponentCategory } from "./tradeTypes";
import { getEraForYear, AutomotiveEraType } from "../economy/eraProgressionEngine";

// ═══════════════════════════════════════════════════════════════════════
// 1. MATERIAL UNLOCK SCHEDULE BY YEAR
// ═══════════════════════════════════════════════════════════════════════

export interface MaterialUnlockSpec {
  materialKey: ProcessedMaterialType;
  name: string;
  unlockYear: number;
  initialProductionCostINR: number;
  matureProductionCostINR: number;     // Cost after global scale economies
  maturityYear: number;                // Year when economies of scale mature
  eraIntroduced: AutomotiveEraType;
  historicalMilestone: string;
}

export const MATERIAL_ERA_TIMELINE: Record<ProcessedMaterialType, MaterialUnlockSpec> = {
  BASIC_CARBON_STEEL: {
    materialKey: "BASIC_CARBON_STEEL",
    name: "Standard Deep-Drawing Sheet Steel",
    unlockYear: 1970,
    initialProductionCostINR: 52_000,
    matureProductionCostINR: 52_000,
    maturityYear: 1970,
    eraIntroduced: "ERA_1970_STARTUP",
    historicalMilestone: "Standard baseline for unibody stampings and coachwork since the early 20th century.",
  },

  DUCTILE_CAST_IRON: {
    materialKey: "DUCTILE_CAST_IRON",
    name: "Ductile Cast Iron",
    unlockYear: 1970,
    initialProductionCostINR: 38_000,
    matureProductionCostINR: 38_000,
    maturityYear: 1970,
    eraIntroduced: "ERA_1970_STARTUP",
    historicalMilestone: "Sand-cast heavy engine blocks, exhaust manifolds, and solid disc brake rotors.",
  },

  VULCANIZED_RUBBER: {
    materialKey: "VULCANIZED_RUBBER",
    name: "Synthetic & Natural Vulcanized Rubber",
    unlockYear: 1970,
    initialProductionCostINR: 95_000,
    matureProductionCostINR: 95_000,
    maturityYear: 1970,
    eraIntroduced: "ERA_1970_STARTUP",
    historicalMilestone: "Essential for radial tires, suspension bushings, and coolant hoses.",
  },

  AUTOMOTIVE_FLOAT_GLASS: {
    materialKey: "AUTOMOTIVE_FLOAT_GLASS",
    name: "Laminated & Tempered Safety Glass",
    unlockYear: 1970,
    initialProductionCostINR: 75_000,
    matureProductionCostINR: 75_000,
    maturityYear: 1970,
    eraIntroduced: "ERA_1970_STARTUP",
    historicalMilestone: "Laminated front windscreens with anti-shatter PVB interlayers.",
  },

  ELECTROLYTIC_COPPER: {
    materialKey: "ELECTROLYTIC_COPPER",
    name: "High-Purity Electrolytic Copper",
    unlockYear: 1970,
    initialProductionCostINR: 420_000,
    matureProductionCostINR: 420_000,
    maturityYear: 1970,
    eraIntroduced: "ERA_1970_STARTUP",
    historicalMilestone: "Wiring looms, motor armatures, alternators, and ignition coils.",
  },

  ENGINEERING_POLYMERS: {
    materialKey: "ENGINEERING_POLYMERS",
    name: "Impact Polypropylene & Polycarbonate",
    unlockYear: 1974,
    initialProductionCostINR: 160_000,
    matureProductionCostINR: 125_000,
    maturityYear: 1985,
    eraIntroduced: "ERA_1970_STARTUP",
    historicalMilestone: "Replaced chrome bumpers with molded impact-absorbing polymer fascia.",
  },

  HIGH_STRENGTH_STEEL: {
    materialKey: "HIGH_STRENGTH_STEEL",
    name: "High-Strength Low-Alloy (HSLA) Steel",
    unlockYear: 1980,
    initialProductionCostINR: 115_000,
    matureProductionCostINR: 78_000,
    maturityYear: 1992,
    eraIntroduced: "ERA_1970_STARTUP",
    historicalMilestone: "Higher yield strength allowed thinner gauges for significant weight reduction.",
  },

  ALUMINUM_SHEET_6000: {
    materialKey: "ALUMINUM_SHEET_6000",
    name: "Extruded 6000-Series Structural Aluminum",
    unlockYear: 1985,
    initialProductionCostINR: 220_000,
    matureProductionCostINR: 145_000,
    maturityYear: 2000,
    eraIntroduced: "ERA_1985_ESTABLISHED",
    historicalMilestone: "Pioneered in spaceframe chassis (Audi ASF) and lightweight suspension control arms.",
  },

  ALUMINUM_FORGING_7000: {
    materialKey: "ALUMINUM_FORGING_7000",
    name: "High-Yield 7000-Series Forged Aluminum",
    unlockYear: 1988,
    initialProductionCostINR: 280_000,
    matureProductionCostINR: 190_000,
    maturityYear: 2002,
    eraIntroduced: "ERA_1985_ESTABLISHED",
    historicalMilestone: "Aerospace alloy for high-stress suspension knuckles and forged wheel rims.",
  },

  CARBON_FIBER_PREPREG: {
    materialKey: "CARBON_FIBER_PREPREG",
    name: "Pre-Preg Toray T700 Carbon Fiber",
    unlockYear: 1990,
    initialProductionCostINR: 650_000,
    matureProductionCostINR: 320_000,
    maturityYear: 2012,
    eraIntroduced: "ERA_1985_ESTABLISHED",
    historicalMilestone: "Adopted from aerospace for Formula 1 monocoques and McLaren F1 road car tub.",
  },

  MAGNESIUM_ALLOY_CAST: {
    materialKey: "MAGNESIUM_ALLOY_CAST",
    name: "High-Pressure Die-Cast Magnesium",
    unlockYear: 1994,
    initialProductionCostINR: 380_000,
    matureProductionCostINR: 260_000,
    maturityYear: 2006,
    eraIntroduced: "ERA_1985_ESTABLISHED",
    historicalMilestone: "Ultra-lightweight steering wheel cores, instrument panel crossmembers, and gearbox cases.",
  },

  ADVANCED_UHSS_STEEL: {
    materialKey: "ADVANCED_UHSS_STEEL",
    name: "Hot-Stamped Boron UHSS (Usibor 1500)",
    unlockYear: 1996,
    initialProductionCostINR: 180_000,
    matureProductionCostINR: 110_000,
    maturityYear: 2008,
    eraIntroduced: "ERA_1985_ESTABLISHED",
    historicalMilestone: "Die-quenched boron steel creating rigid passenger safety cages and B-pillars.",
  },

  SEMICONDUCTOR_SILICON: {
    materialKey: "SEMICONDUCTOR_SILICON",
    name: "Automotive-Grade Electronic Silicon",
    unlockYear: 1986,
    initialProductionCostINR: 850_000,
    matureProductionCostINR: 420_000,
    maturityYear: 2004,
    eraIntroduced: "ERA_1985_ESTABLISHED",
    historicalMilestone: "Fuel injection microcontrollers, ABS chips, and multi-sensor digital engine management.",
  },

  TITANIUM_GRADE_5: {
    materialKey: "TITANIUM_GRADE_5",
    name: "Ti-6Al-4V Aerospace Grade 5 Titanium",
    unlockYear: 2000,
    initialProductionCostINR: 950_000,
    matureProductionCostINR: 520_000,
    maturityYear: 2018,
    eraIntroduced: "ERA_2000_MULTINATIONAL",
    historicalMilestone: "Titanium valve springs, connecting rods, and Inconel/Titanium exhaust systems.",
  },

  BATTERY_CATHODE_NMC: {
    materialKey: "BATTERY_CATHODE_NMC",
    name: "Lithium Nickel-Manganese-Cobalt Cathode",
    unlockYear: 2008,
    initialProductionCostINR: 1_250_000,
    matureProductionCostINR: 580_000,
    maturityYear: 2022,
    eraIntroduced: "ERA_2000_MULTINATIONAL",
    historicalMilestone: "High energy density cathode active material for EV battery traction packs.",
  },

  BATTERY_ANODE_GRAPHITE: {
    materialKey: "BATTERY_ANODE_GRAPHITE",
    name: "Synthetic Coated Spherical Graphite",
    unlockYear: 2008,
    initialProductionCostINR: 340_000,
    matureProductionCostINR: 180_000,
    maturityYear: 2020,
    eraIntroduced: "ERA_2000_MULTINATIONAL",
    historicalMilestone: "Intercalation anode substrate for lithium-ion battery cells.",
  },
};

// ═══════════════════════════════════════════════════════════════════════
// 2. COMPONENT GATES BY YEAR
// ═══════════════════════════════════════════════════════════════════════

export const COMPONENT_ERA_GATES: Record<string, number> = {
  STAMPED_BODY_PANELS: 1970,
  CAST_BRAKE_DISCS: 1970,
  FORGED_SUSPENSION_ARMS: 1970,
  MACHINED_ENGINE_BLOCK: 1970,
  GEARBOX_HOUSINGS: 1970,
  SEAT_FRAMES_FOAM: 1972,
  EXHAUST_MANIFOLDS: 1970,
  ALLOY_WHEELS_SET: 1978,
  ELECTRONIC_FUEL_INJECTION: 1981,
  TURBOCHARGER_ASSEMBLIES: 1982,
  ABS_HYDRAULIC_MODULES: 1986,
  AIRBAG_SAFETY_SYSTEMS: 1992,
  CANBUS_WIRING_LOOMS: 1996,
  DUAL_CLUTCH_TRANSMISSION: 2003,
  LITHIUM_BATTERY_PACK: 2008,
  PERMANENT_MAGNET_MOTOR: 2010,
  AUTONOMOUS_LIDAR_PODS: 2018,
};

// ═══════════════════════════════════════════════════════════════════════
// 3. QUERY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

/** Checks if a material is unlocked for industrial purchasing in given year */
export function isMaterialUnlockedInYear(
  materialKey: ProcessedMaterialType,
  year: number
): boolean {
  const spec = MATERIAL_ERA_TIMELINE[materialKey];
  if (!spec) return true;
  return year >= spec.unlockYear;
}

/** Returns list of all materials currently unlocked in given year */
export function getUnlockedMaterialsForYear(year: number): ProcessedMaterialType[] {
  return (Object.keys(MATERIAL_ERA_TIMELINE) as ProcessedMaterialType[]).filter(
    (mat) => isMaterialUnlockedInYear(mat, year)
  );
}

/**
 * Calculates current price for a material in given year, accounting for:
 * 1. Macroeconomic inflation across decades (1970 baseline).
 * 2. Technological learning curve deflation (new tech gets cheaper over time).
 */
export function getEraAdjustedMaterialPrice(
  materialKey: ProcessedMaterialType,
  year: number
): {
  unitPriceINR: number;
  isUnlocked: boolean;
  unlockYear: number;
  learningCurveSavingsPct: number;
} {
  const spec = MATERIAL_ERA_TIMELINE[materialKey];
  if (!spec) {
    return {
      unitPriceINR: 50_000,
      isUnlocked: true,
      unlockYear: 1970,
      learningCurveSavingsPct: 0,
    };
  }

  const isUnlocked = year >= spec.unlockYear;
  if (!isUnlocked) {
    return {
      unitPriceINR: spec.initialProductionCostINR,
      isUnlocked: false,
      unlockYear: spec.unlockYear,
      learningCurveSavingsPct: 0,
    };
  }

  // 1. Learning curve interpolation between unlockYear and maturityYear
  const maturitySpan = Math.max(1, spec.maturityYear - spec.unlockYear);
  const yearsElapsed = Math.min(maturitySpan, Math.max(0, year - spec.unlockYear));
  const progressRatio = yearsElapsed / maturitySpan; // 0.0 at launch -> 1.0 at maturity

  const baseDeflatedPrice =
    spec.initialProductionCostINR -
    (spec.initialProductionCostINR - spec.matureProductionCostINR) * progressRatio;

  const savingsPct = Math.round(
    ((spec.initialProductionCostINR - baseDeflatedPrice) / spec.initialProductionCostINR) * 100
  );

  // 2. Macro Inflation scaling
  const era = getEraForYear(year);
  const inflatedPrice = Math.round(baseDeflatedPrice * era.macroInflationFactor);

  return {
    unitPriceINR: inflatedPrice,
    isUnlocked: true,
    unlockYear: spec.unlockYear,
    learningCurveSavingsPct: savingsPct,
  };
}
