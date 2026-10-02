/**
 * AUTO TYCOON CAMPUS HQ - CAMPUS BONUS CALCULATION ENGINE (PHASE 25)
 * 
 * Aggregates systemic performance multipliers across R&D, Styling,
 * Safety, Quality, Manufacturing, and Motorsport.
 */

import { CampusUnitDefinition, CampusUnitId } from "./campusTypes";

export interface CampusBonusSummary {
  rndSpeedBonusPct: number; // +0% to +150%
  stylingPrestigeScore: number; // 0 to 100
  safetyComplianceRating: number; // 0 to 100 (NCAP Stars correlation)
  qualityAssuranceRating: number; // 50 to 99 (J.D. Power / Defect rate)
  manufacturingCostDiscountPct: number; // 0% to 35%
  motorsportPerformanceIndex: number; // 0 to 100
  prototypeTurnaroundDaysReductionPct: number; // 0% to 50%
  fleetCommercialCapabilityScore: number; // 0 to 100
  synergiesActive: string[];
}

/**
 * Pure function: Calculate all campus bonuses based on active units, levels, and operational statuses.
 */
export function calculateCampusBonuses(
  units: Record<CampusUnitId, CampusUnitDefinition>
): CampusBonusSummary {
  let rndSpeed = 0;
  let stylingPrestige = 20; // 1970 baseline
  let safetyRating = 30; // 1970 baseline (lap belts, rigid dashes)
  let qualityRating = 60; // 1970 baseline
  let mfgDiscount = 0;
  let motorsportIndex = 0;
  let protoTurnaround = 0;
  let fleetCapability = 0;
  const synergiesActive: string[] = [];

  const getOperationalLevel = (unitId: CampusUnitId): number => {
    const u = units[unitId];
    if (!u || u.status === "locked" || u.status === "under_construction") return 0;
    return u.level;
  };

  // 1. Corporate HQ (UNIT_01)
  const corpHqLvl = getOperationalLevel("CENTRAL_CORPORATE_HQ");
  if (corpHqLvl > 0) {
    protoTurnaround += corpHqLvl * 6; // -6% per level to prototype build times
  }

  // 2. Powertrain & EV HQ (UNIT_02)
  const pwrLvl = getOperationalLevel("POWERTRAIN_EV_HQ");
  if (pwrLvl > 0) {
    rndSpeed += pwrLvl * 8;
  }

  // 3. Aero HQ (UNIT_03)
  const aeroLvl = getOperationalLevel("AERO_HQ");
  if (aeroLvl > 0) {
    rndSpeed += aeroLvl * 9;
    stylingPrestige += aeroLvl * 3;
  }

  // 4. Vehicle Design HQ (UNIT_04)
  const dsgnLvl = getOperationalLevel("VEHICLE_DESIGN_HQ");
  if (dsgnLvl > 0) {
    stylingPrestige += dsgnLvl * 9;
    rndSpeed += dsgnLvl * 4;
  }

  // 5. Chassis & Dynamics HQ (UNIT_05)
  const chsLvl = getOperationalLevel("CHASSIS_DYNAMICS_HQ");
  if (chsLvl > 0) {
    rndSpeed += chsLvl * 7;
    safetyRating += chsLvl * 3;
  }

  // 6. Interior & HMI HQ (UNIT_06)
  const intLvl = getOperationalLevel("INTERIOR_HQ");
  if (intLvl > 0) {
    stylingPrestige += intLvl * 5;
    qualityRating += intLvl * 2;
  }

  // 7. Testing & Validation HQ (UNIT_07)
  const testLvl = getOperationalLevel("TESTING_VALIDATION_HQ");
  if (testLvl > 0) {
    rndSpeed += testLvl * 6;
    qualityRating += testLvl * 5;
    safetyRating += testLvl * 4;
  }

  // 8. Motorsport HQ (UNIT_08)
  const msportLvl = getOperationalLevel("MOTORSPORT_HQ");
  if (msportLvl > 0) {
    motorsportIndex += msportLvl * 14;
    stylingPrestige += msportLvl * 4;
    rndSpeed += msportLvl * 5;
  }

  // 9. Commercial Vehicles HQ (UNIT_09)
  const commLvl = getOperationalLevel("COMMERCIAL_VEHICLES_HQ");
  if (commLvl > 0) {
    fleetCapability += commLvl * 14;
  }

  // 10. Factory (UNIT_10)
  const factoryLvl = getOperationalLevel("FACTORY");
  if (factoryLvl > 0) {
    mfgDiscount += factoryLvl * 4;
    qualityRating += factoryLvl * 3;
  }

  // 11. Supplier & Procurement HQ (UNIT_11)
  const procLvl = getOperationalLevel("SUPPLIER_PROCUREMENT_HQ");
  if (procLvl > 0) {
    mfgDiscount += procLvl * 3;
  }

  // 12. Quality & Reliability HQ (UNIT_12)
  const qaLvl = getOperationalLevel("QUALITY_RELIABILITY_HQ");
  if (qaLvl > 0) {
    qualityRating += qaLvl * 7;
  }

  // 13. Safety & Crash HQ (UNIT_13)
  const safeLvl = getOperationalLevel("SAFETY_HQ");
  if (safeLvl > 0) {
    safetyRating += safeLvl * 10;
  }

  // 14. Marketing & Sales HQ (UNIT_14)
  const mktLvl = getOperationalLevel("MARKETING_SALES_HQ");
  if (mktLvl > 0) {
    stylingPrestige += mktLvl * 6;
  }

  // ── SPECIAL SYNERGIES ──
  // Synergy 1: High-Speed Aero & Motorsport (Aero HQ + Motorsport HQ)
  if (aeroLvl >= 2 && msportLvl >= 1) {
    motorsportIndex += 15;
    rndSpeed += 8;
    synergiesActive.push("Aero-Motorsport Wind Tunnel Telemetry Datalink (+15 Motorsport, +8% R&D)");
  }

  // Synergy 2: Class-A Stamping Synergy (Design HQ + Factory)
  if (dsgnLvl >= 3 && factoryLvl >= 2) {
    mfgDiscount += 6;
    synergiesActive.push("Direct-to-Tooling CAS Digital Transfer (-6% Tooling Cost)");
  }

  // Synergy 3: Zero-Defect Testing Pipeline (Testing HQ + Quality HQ)
  if (testLvl >= 2 && qaLvl >= 2) {
    qualityRating += 8;
    synergiesActive.push("Integrated Proving Ground Metrology Feedback (+8 Quality Assurance)");
  }

  return {
    rndSpeedBonusPct: Math.min(150, Math.round(rndSpeed)),
    stylingPrestigeScore: Math.min(100, Math.round(stylingPrestige)),
    safetyComplianceRating: Math.min(100, Math.round(safetyRating)),
    qualityAssuranceRating: Math.min(99, Math.round(qualityRating)),
    manufacturingCostDiscountPct: Math.min(35, Math.round(mfgDiscount)),
    motorsportPerformanceIndex: Math.min(100, Math.round(motorsportIndex)),
    prototypeTurnaroundDaysReductionPct: Math.min(50, Math.round(protoTurnaround)),
    fleetCommercialCapabilityScore: Math.min(100, Math.round(fleetCapability)),
    synergiesActive,
  };
}
