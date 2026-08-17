// ============================================================================
// PHASE 92 — BRAKE FLUID VAPOR LOCK & DYNAMIC PAD KNOCKBACK SOLVER
// ============================================================================
// Multi-physics model for brake caliper hydraulic fluid boiling, two-phase
// compressibility vapor lock, lateral wheel hub deflection pad knockback,
// and electro-hydraulic active ABS pre-fill compensation pulses.
//
// Reference Equations:
//   - Boiling Point Derating: T_boil(water_pct) = T_dry_boil * exp(-0.065 * water_pct)
//   - Vapor Lock Volume Fraction: α_vapor = (V_gas / (V_liquid + V_gas))
//   - Effective Bulk Modulus (Two-Phase): 1/β_eff = (1 - α)/β_liq + α/(γ * P)
//   - Spongy Pedal Stroke Loss: Δx_pedal = (ΔV_vapor + 4 * A_piston * x_knockback) * (i_pedal / A_mc)
//   - Hub Deflection Knockback: x_knockback = (F_lateral * L_spindle³ / (3 * E_hub * I_hub)) + θ_bearing * R_disc
// ============================================================================

export type BrakeFluidGrade = 'DOT_4_STANDARD' | 'DOT_5_1_HIGH_TEMP' | 'RACING_DOT_4_SRF';

export interface CaliperPistonKnockbackCornerState {
  wheelCorner: 'FRONT_LEFT' | 'FRONT_RIGHT' | 'REAR_LEFT' | 'REAR_RIGHT';
  caliperFluidTempCelsius: number;
  fluidBoilingPointCelsius: number;
  vaporVolumeFractionPct: number;
  isFluidBoilingVaporLock: boolean;
  hubDeflectionKnockbackMm: number;
  pistonRetractionLossMm: number;
  preFillCompensated: boolean;
  residualClampTorqueLossNm: number;
}

export interface BrakeHydraulicSystemState {
  fluidGrade: BrakeFluidGrade;
  moistureContentPct: number;
  dryBoilingPointCelsius: number;
  wetBoilingPointCelsius: number;
  currentBoilingPointCelsius: number;
  masterCylinderPressureBar: number;
  effectiveBulkModulusMpa: number;
  pureFluidBulkModulusMpa: number;
  pedalTravelMm: number;
  deadTravelElongationMm: number;
  isPedalSpongyOrFloored: boolean;
  corners: CaliperPistonKnockbackCornerState[];
  activePreFillPulseActive: boolean;
  preFillPressurePulseBar: number;
  safetyMarginToBoilingCelsius: number;
}

export interface VaporLockSolverParams {
  fluidGrade?: BrakeFluidGrade;
  moistureContentPct?: number;
  frontCaliperTempCelsius?: number;
  rearCaliperTempCelsius?: number;
  lateralGForce?: number;
  kerbStrikeEvent?: boolean;
  masterCylinderDemandPressureBar?: number;
}

export class HydraulicVaporLockPadKnockbackSolver {
  // ── Brake Fluid Chemical & Thermal Specifications ─────────────────────────
  private static readonly FLUID_SPECS = {
    DOT_4_STANDARD: { dryBoilC: 230.0, wetBoilC: 155.0, bulkModulusMpa: 1450.0 },
    DOT_5_1_HIGH_TEMP: { dryBoilC: 265.0, wetBoilC: 180.0, bulkModulusMpa: 1650.0 },
    RACING_DOT_4_SRF: { dryBoilC: 320.0, wetBoilC: 270.0, bulkModulusMpa: 1850.0 },
  };

  private static readonly PISTON_COUNT_PER_FRONT_CALIPER = 6; // 6-piston monobloc
  private static readonly PISTON_COUNT_PER_REAR_CALIPER = 4;
  private static readonly FRONT_PISTON_TOTAL_AREA_CM2 = 54.0;
  private static readonly MASTER_CYLINDER_AREA_CM2 = 4.2;
  private static readonly BRAKE_PEDAL_RATIO = 4.5;

  /**
   * Solves fluid boiling vapor lock volume fractions, two-phase spongy pedal
   * travel elongation, lateral kerb hub deflection pad knockback, and ABS pre-fill.
   */
  public static solveHydraulicSystem(params: VaporLockSolverParams = {}): BrakeHydraulicSystemState {
    const grade = params.fluidGrade ?? 'DOT_5_1_HIGH_TEMP';
    const moisture = Math.max(0.1, Math.min(6.0, params.moistureContentPct ?? 1.5));
    const tFrontC = Math.max(20.0, Math.min(360.0, params.frontCaliperTempCelsius ?? 175.0));
    const tRearC = Math.max(20.0, Math.min(300.0, params.rearCaliperTempCelsius ?? 125.0));
    const latG = Math.max(0.0, Math.min(2.5, params.lateralGForce ?? 1.6));
    const kerbHit = params.kerbStrikeEvent ?? true;
    const pDemandBar = Math.max(0.0, Math.min(160.0, params.masterCylinderDemandPressureBar ?? 45.0));

    const spec = this.FLUID_SPECS[grade];

    // ────────────────────────────────────────────────────────────────────────
    // 1. Moisture-Derated Fluid Boiling Point
    // ────────────────────────────────────────────────────────────────────────
    // Empirical exponential decay of boiling point with moisture absorption
    const tBoilC = spec.dryBoilC * Math.exp(-0.065 * moisture);
    const safetyMarginC = tBoilC - tFrontC;

    // ────────────────────────────────────────────────────────────────────────
    // 2. Caliper Fluid Boiling & Vapor Volume Fraction Model
    // ────────────────────────────────────────────────────────────────────────
    const evaluateVaporFraction = (tCaliper: number): { alphaVapor: number; isBoiling: boolean } => {
      if (tCaliper < tBoilC) {
        return { alphaVapor: 0.0, isBoiling: false };
      }
      // Superheated liquid flash evaporation
      const superheatDeltaT = tCaliper - tBoilC;
      const alpha = Math.min(0.85, (superheatDeltaT / 35.0) * 0.45);
      return { alphaVapor: alpha, isBoiling: true };
    };

    const frontBoil = evaluateVaporFraction(tFrontC);
    const rearBoil = evaluateVaporFraction(tRearC);

    // ────────────────────────────────────────────────────────────────────────
    // 3. Dynamic Hub Deflection & Pad Knockback on Kerb Strike
    // ────────────────────────────────────────────────────────────────────────
    // Lateral force deflecting wheel bearing & upright pushes brake pads away from disc
    const baseKnockbackMm = latG * 0.28; // Upright compliance
    const kerbKnockbackMm = kerbHit ? 0.65 : 0.0; // High-frequency kerb impulse shock
    const totalKnockbackFrontMm = Math.min(1.4, baseKnockbackMm + kerbKnockbackMm);
    const totalKnockbackRearMm = Math.min(0.9, baseKnockbackMm * 0.75 + kerbKnockbackMm * 0.6);

    // Active Pre-fill Pulse: Modern ABS/ESC fires 15 bar pre-fill to reset pistons
    const preFillActive = kerbHit || latG > 1.4;
    const preFillBar = preFillActive ? 12.5 : 0.0;
    const residualKnockbackFrontMm = preFillActive ? totalKnockbackFrontMm * 0.12 : totalKnockbackFrontMm;
    const residualKnockbackRearMm = preFillActive ? totalKnockbackRearMm * 0.12 : totalKnockbackRearMm;

    // ────────────────────────────────────────────────────────────────────────
    // 4. Two-Phase Fluid Bulk Modulus & Spongy Pedal Stroke Loss
    // ────────────────────────────────────────────────────────────────────────
    // 1/β_eff = (1 - α)/β_pure + α/(γ * P) where γ=1.35, P = pDemandBar
    const pPa = Math.max(101325.0, pDemandBar * 1e5);
    const betaPurePa = spec.bulkModulusMpa * 1e6;
    const avgAlpha = (frontBoil.alphaVapor * 0.7 + rearBoil.alphaVapor * 0.3);

    let betaEffMpa = spec.bulkModulusMpa;
    if (avgAlpha > 0.001) {
      const invBetaEff = ((1.0 - avgAlpha) / betaPurePa) + (avgAlpha / (1.35 * pPa));
      betaEffMpa = (1.0 / invBetaEff) / 1e6;
    }

    // Dead Travel Elongation:
    // Volume lost = (Pistons knockback volume) + (Vapor compression volume)
    const knockbackVolCm3 = (2.0 * this.FRONT_PISTON_TOTAL_AREA_CM2 * (residualKnockbackFrontMm * 0.1)) +
      (2.0 * (this.FRONT_PISTON_TOTAL_AREA_CM2 * 0.65) * (residualKnockbackRearMm * 0.1));
    const vaporCompVolCm3 = avgAlpha * 65.0; // 65 cm³ total caliper fluid volume

    const totalDeadVolCm3 = knockbackVolCm3 + vaporCompVolCm3;
    const deadTravelMm = (totalDeadVolCm3 / this.MASTER_CYLINDER_AREA_CM2) * this.BRAKE_PEDAL_RATIO * 10.0;

    const basePedalTravelMm = 28.0 + (pDemandBar / 100.0) * 18.0;
    const totalPedalTravelMm = basePedalTravelMm + deadTravelMm;
    const isPedalSpongy = deadTravelMm > 25.0 || frontBoil.isBoiling;

    // Build 4 corners state
    const corners: CaliperPistonKnockbackCornerState[] = [
      {
        wheelCorner: 'FRONT_LEFT',
        caliperFluidTempCelsius: Math.round(tFrontC * 10) / 10,
        fluidBoilingPointCelsius: Math.round(tBoilC * 10) / 10,
        vaporVolumeFractionPct: Math.round(frontBoil.alphaVapor * 1000) / 10,
        isFluidBoilingVaporLock: frontBoil.isBoiling,
        hubDeflectionKnockbackMm: Math.round(totalKnockbackFrontMm * 100) / 100,
        pistonRetractionLossMm: Math.round(residualKnockbackFrontMm * 100) / 100,
        preFillCompensated: preFillActive,
        residualClampTorqueLossNm: Math.round(residualKnockbackFrontMm * 240.0),
      },
      {
        wheelCorner: 'FRONT_RIGHT',
        caliperFluidTempCelsius: Math.round(tFrontC * 10) / 10,
        fluidBoilingPointCelsius: Math.round(tBoilC * 10) / 10,
        vaporVolumeFractionPct: Math.round(frontBoil.alphaVapor * 1000) / 10,
        isFluidBoilingVaporLock: frontBoil.isBoiling,
        hubDeflectionKnockbackMm: Math.round(totalKnockbackFrontMm * 100) / 100,
        pistonRetractionLossMm: Math.round(residualKnockbackFrontMm * 100) / 100,
        preFillCompensated: preFillActive,
        residualClampTorqueLossNm: Math.round(residualKnockbackFrontMm * 240.0),
      },
      {
        wheelCorner: 'REAR_LEFT',
        caliperFluidTempCelsius: Math.round(tRearC * 10) / 10,
        fluidBoilingPointCelsius: Math.round(tBoilC * 10) / 10,
        vaporVolumeFractionPct: Math.round(rearBoil.alphaVapor * 1000) / 10,
        isFluidBoilingVaporLock: rearBoil.isBoiling,
        hubDeflectionKnockbackMm: Math.round(totalKnockbackRearMm * 100) / 100,
        pistonRetractionLossMm: Math.round(residualKnockbackRearMm * 100) / 100,
        preFillCompensated: preFillActive,
        residualClampTorqueLossNm: Math.round(residualKnockbackRearMm * 150.0),
      },
      {
        wheelCorner: 'REAR_RIGHT',
        caliperFluidTempCelsius: Math.round(tRearC * 10) / 10,
        fluidBoilingPointCelsius: Math.round(tBoilC * 10) / 10,
        vaporVolumeFractionPct: Math.round(rearBoil.alphaVapor * 1000) / 10,
        isFluidBoilingVaporLock: rearBoil.isBoiling,
        hubDeflectionKnockbackMm: Math.round(totalKnockbackRearMm * 100) / 100,
        pistonRetractionLossMm: Math.round(residualKnockbackRearMm * 100) / 100,
        preFillCompensated: preFillActive,
        residualClampTorqueLossNm: Math.round(residualKnockbackRearMm * 150.0),
      },
    ];

    return {
      fluidGrade: grade,
      moistureContentPct: moisture,
      dryBoilingPointCelsius: spec.dryBoilC,
      wetBoilingPointCelsius: spec.wetBoilC,
      currentBoilingPointCelsius: Math.round(tBoilC * 10) / 10,
      masterCylinderPressureBar: pDemandBar,
      effectiveBulkModulusMpa: Math.round(betaEffMpa * 10) / 10,
      pureFluidBulkModulusMpa: spec.bulkModulusMpa,
      pedalTravelMm: Math.round(totalPedalTravelMm * 10) / 10,
      deadTravelElongationMm: Math.round(deadTravelMm * 10) / 10,
      isPedalSpongyOrFloored: isPedalSpongy,
      corners,
      activePreFillPulseActive: preFillActive,
      preFillPressurePulseBar: preFillBar,
      safetyMarginToBoilingCelsius: Math.round(safetyMarginC * 10) / 10,
    };
  }
}
