/**
 * ═══════════════════════════════════════════════════════════════════════
 * MATERIAL QUALITY & DEFECT PHYSICS ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 4 & 25 of the Raw Materials & Trade Specification:
 * - Material Quality is a multi-dimensional physical vector:
 *   [Strength, Weight, Consistency, Purity, Corrosion, Heat, Manufacturability]
 * - Downstream Engineering & Economic Reactions:
 *   1. Low consistency / purity (<70) -> Stamping cracks, casting porosity -> Higher reject PPM.
 *   2. Rejects increase scrap loss and trigger production line micro-stoppages.
 *   3. Substandard parts installed into vehicles increase long-term warranty claim rates.
 *   4. Ultra-high quality materials (>85) reduce curb weight and improve chassis torsional rigidity.
 */

import { MaterialQualityVector, ProcessedMaterialType } from "./tradeTypes";
export type { MaterialQualityVector };

export const DEFAULT_MATERIAL_QUALITIES: Record<ProcessedMaterialType, MaterialQualityVector> = {
  BASIC_CARBON_STEEL: {
    strength: 55,
    weightIndex: 85,
    consistency: 68,
    purity: 72,
    corrosionResistance: 40,
    heatResistance: 60,
    manufacturability: 88,
  },
  HIGH_STRENGTH_STEEL: {
    strength: 78,
    weightIndex: 72,
    consistency: 84,
    purity: 86,
    corrosionResistance: 65,
    heatResistance: 75,
    manufacturability: 74,
  },
  ADVANCED_UHSS_STEEL: {
    strength: 94,
    weightIndex: 62,
    consistency: 92,
    purity: 94,
    corrosionResistance: 78,
    heatResistance: 82,
    manufacturability: 58,
  },
  DUCTILE_CAST_IRON: {
    strength: 65,
    weightIndex: 90,
    consistency: 76,
    purity: 74,
    corrosionResistance: 50,
    heatResistance: 85,
    manufacturability: 82,
  },
  ALUMINUM_SHEET_6000: {
    strength: 70,
    weightIndex: 45,
    consistency: 85,
    purity: 88,
    corrosionResistance: 85,
    heatResistance: 55,
    manufacturability: 72,
  },
  ALUMINUM_FORGING_7000: {
    strength: 88,
    weightIndex: 42,
    consistency: 90,
    purity: 92,
    corrosionResistance: 80,
    heatResistance: 60,
    manufacturability: 62,
  },
  MAGNESIUM_ALLOY_CAST: {
    strength: 68,
    weightIndex: 32,
    consistency: 80,
    purity: 82,
    corrosionResistance: 45,
    heatResistance: 50,
    manufacturability: 60,
  },
  TITANIUM_GRADE_5: {
    strength: 96,
    weightIndex: 48,
    consistency: 95,
    purity: 98,
    corrosionResistance: 98,
    heatResistance: 96,
    manufacturability: 35,
  },
  ENGINEERING_POLYMERS: {
    strength: 48,
    weightIndex: 28,
    consistency: 82,
    purity: 80,
    corrosionResistance: 95,
    heatResistance: 45,
    manufacturability: 92,
  },
  VULCANIZED_RUBBER: {
    strength: 52,
    weightIndex: 35,
    consistency: 78,
    purity: 76,
    corrosionResistance: 90,
    heatResistance: 65,
    manufacturability: 80,
  },
  AUTOMOTIVE_FLOAT_GLASS: {
    strength: 50,
    weightIndex: 55,
    consistency: 88,
    purity: 92,
    corrosionResistance: 98,
    heatResistance: 70,
    manufacturability: 78,
  },
  CARBON_FIBER_PREPREG: {
    strength: 98,
    weightIndex: 22,
    consistency: 94,
    purity: 96,
    corrosionResistance: 98,
    heatResistance: 88,
    manufacturability: 42,
  },
  ELECTROLYTIC_COPPER: {
    strength: 58,
    weightIndex: 78,
    consistency: 92,
    purity: 99,
    corrosionResistance: 72,
    heatResistance: 70,
    manufacturability: 85,
  },
  SEMICONDUCTOR_SILICON: {
    strength: 40,
    weightIndex: 25,
    consistency: 98,
    purity: 99,
    corrosionResistance: 90,
    heatResistance: 85,
    manufacturability: 50,
  },
  BATTERY_CATHODE_NMC: {
    strength: 45,
    weightIndex: 65,
    consistency: 90,
    purity: 95,
    corrosionResistance: 75,
    heatResistance: 68,
    manufacturability: 60,
  },
  BATTERY_ANODE_GRAPHITE: {
    strength: 42,
    weightIndex: 50,
    consistency: 88,
    purity: 94,
    corrosionResistance: 80,
    heatResistance: 72,
    manufacturability: 65,
  },
};

/** Compute aggregate 0-100 quality score weighted by industrial utility */
export function computeMaterialQualityComposite(v: MaterialQualityVector): number {
  return Math.round(
    v.strength * 0.25 +
    (100 - v.weightIndex) * 0.15 +
    v.consistency * 0.20 +
    v.purity * 0.15 +
    v.corrosionResistance * 0.10 +
    v.manufacturability * 0.15
  );
}

export interface ManufacturingDefectEvaluation {
  scrapRejectPPM: number;          // Parts per million rejected during stamping/machining
  rejectRatePct: number;           // % of raw stock wasted due to quality defects
  reworkCostMultiplier: number;    // Additional assembly labor surcharge
  lineStoppageRiskPct: number;     // Probability of assembly line halts
}

/**
 * Calculates scrap reject PPM and production loss during stamping / CNC machining.
 * Inconsistent materials (low consistency) or contaminated stock (low purity) cause
 * micro-cracks, tool breakage, and high reject rates.
 */
export function evaluateManufacturingDefectRate(
  quality: MaterialQualityVector,
  toolingAutomationLevel: number = 75 // 0-100
): ManufacturingDefectEvaluation {
  // Base PPM starts at 2,000 for average quality (70)
  // Low consistency is the #1 cause of stamping tears and weld splatter
  const consistencyDeficit = Math.max(0, 85 - quality.consistency);
  const purityDeficit = Math.max(0, 85 - quality.purity);
  const manufacturabilityBonus = (quality.manufacturability - 70) * 20;

  let scrapPPM = 1200 + consistencyDeficit * 150 + purityDeficit * 95 - manufacturabilityBonus;
  
  // High automation tool dies reduce manual defects, but are unforgiving of bad raw stock
  if (quality.consistency < 65 && toolingAutomationLevel > 80) {
    scrapPPM *= 1.4; // High speed stamping dies jam on irregular coils
  }

  scrapPPM = Math.max(250, Math.min(25000, Math.round(scrapPPM)));
  const rejectRatePct = parseFloat(((scrapPPM / 1000000) * 100).toFixed(2));
  const reworkCostMultiplier = 1.0 + (scrapPPM / 100000);
  const lineStoppageRiskPct = parseFloat(Math.min(15, (scrapPPM / 2000)).toFixed(1));

  return {
    scrapRejectPPM: scrapPPM,
    rejectRatePct,
    reworkCostMultiplier,
    lineStoppageRiskPct,
  };
}

export interface VehicleQualityImpact {
  reliabilityScoreDelta: number;        // e.g. -5 to +8 points on vehicle reliability
  warrantyClaimRateChangePct: number;   // e.g. +14% warranty claims on cheap steel
  curbWeightDeltaKg: number;            // Weight penalty or reduction
  chassisTorsionalRigidityDelta: number;// kNm/deg modifier
  recallProbabilityPct: number;         // Risk of a safety-critical defect recall
}

/**
 * Translates the weighted bill of materials quality into downstream vehicle performance,
 * warranty liability, and customer satisfaction metrics.
 */
export function evaluateVehicleMaterialImpact(
  materials: Array<{ materialType: ProcessedMaterialType; massKg: number; quality: MaterialQualityVector }>,
  baseVehicleMassKg: number = 1350
): VehicleQualityImpact {
  if (materials.length === 0) {
    return {
      reliabilityScoreDelta: 0,
      warrantyClaimRateChangePct: 0,
      curbWeightDeltaKg: 0,
      chassisTorsionalRigidityDelta: 0,
      recallProbabilityPct: 0.5,
    };
  }

  let totalMass = 0;
  let weightedConsistency = 0;
  let weightedStrength = 0;
  let weightedWeightIndex = 0;
  let weightedCorrosion = 0;

  for (const m of materials) {
    totalMass += m.massKg;
    weightedConsistency += m.quality.consistency * m.massKg;
    weightedStrength += m.quality.strength * m.massKg;
    weightedWeightIndex += m.quality.weightIndex * m.massKg;
    weightedCorrosion += m.quality.corrosionResistance * m.massKg;
  }

  const avgConsistency = weightedConsistency / totalMass;
  const avgStrength = weightedStrength / totalMass;
  const avgWeightIndex = weightedWeightIndex / totalMass;
  const avgCorrosion = weightedCorrosion / totalMass;

  // Reliability delta: benchmark average is 75
  const reliabilityScoreDelta = Math.round((avgConsistency - 75) * 0.35 + (avgCorrosion - 70) * 0.15);

  // Warranty claims rise exponentially when consistency drops below 70
  let warrantyDeltaPct = 0;
  if (avgConsistency < 75) {
    warrantyDeltaPct = Math.round((75 - avgConsistency) * 1.8);
  } else {
    warrantyDeltaPct = -Math.round((avgConsistency - 75) * 0.8);
  }

  // Weight impact: Weight index 75 = 0 delta. Lower index saves weight.
  const weightDeltaKg = Math.round(((avgWeightIndex - 72) / 100) * (baseVehicleMassKg * 0.3));

  // Torsional rigidity: stronger alloys increase chassis stiffness
  const chassisTorsionalRigidityDelta = parseFloat(((avgStrength - 70) * 0.18).toFixed(1));

  // Severe recall risk if consistency < 60
  const recallProbabilityPct = avgConsistency < 60 ? 8.5 : avgConsistency < 68 ? 2.8 : 0.4;

  return {
    reliabilityScoreDelta,
    warrantyClaimRateChangePct: warrantyDeltaPct,
    curbWeightDeltaKg: weightDeltaKg,
    chassisTorsionalRigidityDelta,
    recallProbabilityPct,
  };
}
