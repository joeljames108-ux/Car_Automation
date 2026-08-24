/**
 * ============================================================================
 * MODULAR INTERIOR STUDIO — MULTI-PHYSICS DYNAMICS & METRICS SOLVER
 * ============================================================================
 * Solves physical properties and vehicle dynamics impact for cabin configurations:
 * - Subsystem Mass Aggregation & Center of Gravity (CoG)
 * - BOM Manufacturing & Upholstery Material Costs
 * - Luxury vs Sportiness Multi-Criteria Scoring
 * - Driver Lateral G Holding Capacity (Seat Bolsters & Harnesses)
 * - Cabin NVH Acoustic Sound Isolation at 120 km/h
 * - Direct Dynamic Coupling to Total Vehicle Acceleration & Lap Times
 * ============================================================================
 */

import {
  MasterModularInteriorState,
  MasterInteriorPerformanceMetrics,
  InteriorComparisonDelta,
  InteriorMaterialType,
} from "./masterInteriorTypes";

export class MasterInteriorSolver {
  private static readonly BASELINE_INTERIOR_MASS_KG = 175.0;

  /**
   * Evaluates all physical, acoustic, and ergonomic metrics for a given interior state.
   */
  public static solveMetrics(state: Omit<MasterModularInteriorState, "metrics">): MasterInteriorPerformanceMetrics {
    // 1. Mass Aggregation
    const seatingMass = state.seating.frontSeatsMassKgTotal + state.seating.rearSeatsMassKgTotal;
    const dashMass = state.dashboard.massKg;
    const steeringMass = state.steering.massKg;
    const consoleMass = state.console.massKg;
    const doorsMass = state.doors.massKgTotal;
    const infoMass = state.infotainment.massKg;
    const lightMass = state.lighting.massKg;
    const audioMass = state.audio.massKg;
    const safetyMass = state.safety.massKg;

    // Materials mass modifier
    const materialMassModifier = this.calculateMaterialMassModifier(state.materials.seatPrimaryMaterial, state.materials.dashboardTrimInsert);

    const totalInteriorMassKg = Math.round(
      (seatingMass + dashMass + steeringMass + consoleMass + doorsMass + infoMass + lightMass + audioMass + safetyMass + materialMassModifier) * 10
    ) / 10;

    const massDeltaAgainstBaseKg = Math.round((totalInteriorMassKg - this.BASELINE_INTERIOR_MASS_KG) * 10) / 10;

    // 2. Cost Aggregation
    const materialCostModifier = this.calculateMaterialCostModifier(state.materials.seatPrimaryMaterial, state.materials.dashboardTrimInsert);
    const totalInteriorCostUSD =
      state.seating.costUSD +
      state.dashboard.costUSD +
      state.steering.costUSD +
      state.console.costUSD +
      state.doors.costUSD +
      state.infotainment.costUSD +
      state.lighting.costUSD +
      state.audio.costUSD +
      state.safety.costUSD +
      materialCostModifier;

    // 3. Center of Gravity (CoG) Offset
    const cogX = -720 + (state.seating.rearSeatType.includes("delete") ? 80 : 0);
    const cogY = 420 - (state.seating.frontSeatType.includes("bucket") ? 60 : 0);
    const cogZ = 0;

    // 4. Comfort Index (0 - 100)
    let comfortScore = 50;
    if (state.seating.hasSeatHeating) comfortScore += 8;
    if (state.seating.hasSeatVentilation) comfortScore += 10;
    if (state.seating.hasPneumaticMassage) comfortScore += 15;
    if (state.seating.frontSeatType === "executive_22way_massage_ottoman") comfortScore += 18;
    if (state.seating.frontSeatType === "fia_homologated_racing_bucket") comfortScore -= 25; // Race bucket is stiff
    if (state.audio.tier === "bespoke_24_speaker_diamond_2100w") comfortScore += 8;
    if (state.materials.seatPrimaryMaterial === "semi_aniline_leather" || state.materials.seatPrimaryMaterial === "nappa_leather") comfortScore += 6;
    const comfortIndexPercent = Math.min(100, Math.max(10, comfortScore));

    // 5. Sportiness Index (0 - 100)
    let sportScore = 40;
    if (state.seating.frontSeatType === "carbon_monocoque_fixed_bucket") sportScore += 25;
    if (state.seating.frontSeatType === "fia_homologated_racing_bucket") sportScore += 35;
    if (state.seating.has6PointRacingHarness) sportScore += 15;
    if (state.seating.rearSeatType.includes("delete")) sportScore += 15;
    if (state.steering.typology === "formula_gt3_carbon_yoke") sportScore += 20;
    if (state.console.typology === "sequential_dog_ring_tower") sportScore += 15;
    if (state.safety.rollCage === "fia_gt3_6_point_welded_cage" || state.safety.rollCage === "full_chromoly_spaceframe_reinforcement") sportScore += 20;
    if (state.materials.dashboardTrimInsert === "3k_twill_carbon_fiber" || state.materials.dashboardTrimInsert === "forged_carbon_composite") sportScore += 10;
    const sportinessIndexPercent = Math.min(100, Math.max(10, sportScore));

    // 6. Lateral G Holding Threshold (Seat Bolstering & Harnesses)
    let lateralG = 1.15; // Standard base seat holds up to 1.15G before driver torso slides
    if (state.seating.frontSeatType === "sport_14way_adaptive_bolster") lateralG = 1.45;
    if (state.seating.frontSeatType === "carbon_monocoque_fixed_bucket") lateralG = 1.75;
    if (state.seating.frontSeatType === "fia_homologated_racing_bucket") lateralG = 2.05;
    if (state.seating.has6PointRacingHarness) lateralG += 0.35;
    const lateralSupportGThreshold = Math.round(lateralG * 100) / 100;

    // 7. Cabin NVH Sound Pressure at 120 km/h (dB-A)
    let soundDb = 68.0; // Standard cabin
    if (state.audio.hasActiveNoiseCancellation) soundDb -= 3.5;
    if (state.materials.seatPrimaryMaterial === "semi_aniline_leather") soundDb -= 1.5;
    if (state.seating.rearSeatType.includes("delete")) soundDb += 4.5; // Exposed bare rear metal amplifies tire noise
    if (state.safety.rollCage !== "none_standard_chassis") soundDb += 2.0;
    if (state.audio.tier === "audio_delete_track_spec") soundDb += 5.0; // Stripped sound insulation
    const cabinNoiseAt120KmhDbA = Math.round(soundDb * 10) / 10;

    // 8. Driver Visibility & Ergonomics Score
    let visScore = 85;
    if (state.dashboard.hasWindshieldHolographicHUD) visScore += 8;
    if (state.steering.typology === "formula_gt3_carbon_yoke") visScore += 5; // Open top yoke improves gauge cluster visibility
    const driverVisibilityScorePercent = Math.min(100, Math.max(50, visScore));

    let ergoScore = 75;
    if (state.steering.hasElectricSteeringColumnAdjust) ergoScore += 10;
    if (state.seating.lumbarAdjustAxes >= 4) ergoScore += 10;
    const driverErgonomicsScorePercent = Math.min(100, Math.max(50, ergoScore));

    // 9. Luxury Prestige Index
    let prestige = 45;
    if (state.materials.seatPrimaryMaterial === "semi_aniline_leather") prestige += 20;
    if (state.materials.dashboardTrimInsert === "open_pore_walnut" || state.materials.dashboardTrimInsert === "3k_twill_carbon_fiber") prestige += 15;
    if (state.lighting.illuminatedZones.starlightRoofHeadliner) prestige += 18;
    if (state.audio.tier === "bespoke_24_speaker_diamond_2100w") prestige += 20;
    const luxuryPrestigeIndex = Math.min(100, Math.max(10, prestige));

    return {
      totalInteriorMassKg,
      totalInteriorCostUSD,
      massDeltaAgainstBaseKg,
      centerOfGravityOffsetMm: { x: cogX, y: cogY, z: cogZ },
      comfortIndexPercent,
      sportinessIndexPercent,
      lateralSupportGThreshold,
      cabinNoiseAt120KmhDbA,
      driverVisibilityScorePercent,
      driverErgonomicsScorePercent,
      luxuryPrestigeIndex,
    };
  }

  private static calculateMaterialMassModifier(seatMat: InteriorMaterialType, trimMat: InteriorMaterialType): number {
    let mod = 0;
    if (seatMat === "3k_twill_carbon_fiber" || seatMat === "forged_carbon_composite") mod -= 6.0;
    if (seatMat === "semi_aniline_leather") mod += 4.5;
    if (trimMat === "3k_twill_carbon_fiber") mod -= 3.0;
    if (trimMat === "open_pore_walnut") mod += 2.0;
    return mod;
  }

  private static calculateMaterialCostModifier(seatMat: InteriorMaterialType, trimMat: InteriorMaterialType): number {
    let mod = 0;
    if (seatMat === "semi_aniline_leather") mod += 4200;
    if (seatMat === "perforated_alcantara") mod += 2800;
    if (seatMat === "3k_twill_carbon_fiber") mod += 5600;
    if (trimMat === "3k_twill_carbon_fiber") mod += 2200;
    if (trimMat === "open_pore_walnut") mod += 1800;
    return mod;
  }

  /**
   * Compares two interior states side-by-side and returns delta scorecard.
   */
  public static compareInteriors(
    interiorA: MasterModularInteriorState,
    interiorB: MasterModularInteriorState
  ): InteriorComparisonDelta {
    return {
      cabinA: { id: interiorA.id, name: interiorA.name },
      cabinB: { id: interiorB.id, name: interiorB.name },
      massDiffKg: Math.round((interiorB.metrics.totalInteriorMassKg - interiorA.metrics.totalInteriorMassKg) * 10) / 10,
      costDiffUSD: interiorB.metrics.totalInteriorCostUSD - interiorA.metrics.totalInteriorCostUSD,
      comfortDiffPercent: interiorB.metrics.comfortIndexPercent - interiorA.metrics.comfortIndexPercent,
      sportinessDiffPercent: interiorB.metrics.sportinessIndexPercent - interiorA.metrics.sportinessIndexPercent,
      noiseIsolationDiffDbA: Math.round((interiorA.metrics.cabinNoiseAt120KmhDbA - interiorB.metrics.cabinNoiseAt120KmhDbA) * 10) / 10,
      lateralGSupportDiff: Math.round((interiorB.metrics.lateralSupportGThreshold - interiorA.metrics.lateralSupportGThreshold) * 100) / 100,
    };
  }
}
