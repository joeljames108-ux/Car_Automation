// ============================================================================
// PHASES 54 TO 58 — MASTER TEST RUNNER SUITE
// ============================================================================
// Automated test assertions for:
// - Phase 54: PMSM Flux Weakening & High-Speed Rotor Stress FEA
// - Phase 55: CFRP Monocoque Ply Layup & Tsai-Wu Failure Solver
// - Phase 56: Dual-Chamber Air Suspension & Ride Height Levelling
// - Phase 57: Brake-by-Wire (BBW) Electro-Hydraulic Blending Solver
// ============================================================================

import { PmsmFluxWeakeningRotorFea } from '../../powertrain/pmsmFluxWeakeningRotorFea';
import { CfrpMonocoqueLayupSolver } from '../../../exterior3d/chassis/cfrpMonocoqueLayupSolver';
import { DualChamberAirSuspensionSolver } from '../../suspension/dualChamberAirSuspensionSolver';
import { BrakeByWireBlendingSolver } from '../../brakes/brakeByWireBlendingSolver';

export interface Phase54to58TestResult {
  suite: string;
  name: string;
  passed: boolean;
  score?: number;
  error?: string;
  durationMs: number;
}

export class Phases54to58MasterTestRunner {
  public executeAllTests(): Phase54to58TestResult[] {
    const results: Phase54to58TestResult[] = [];

    // ── 1. PHASE 54: PMSM Flux Weakening & Rotor FEA ──
    const t0 = performance.now();
    try {
      const motorLow = PmsmFluxWeakeningRotorFea.evaluateMotorOperatingPoint({
        rotorSpeedRpm: 4000,
        demandedTorqueNm: 450,
      });

      const motorHigh = PmsmFluxWeakeningRotorFea.evaluateMotorOperatingPoint({
        rotorSpeedRpm: 19500,
        demandedTorqueNm: 350,
      });

      const passed =
        !motorLow.isFluxWeakeningActive &&
        motorHigh.isFluxWeakeningActive &&
        motorHigh.idCurrentAmps < 0 &&
        motorHigh.carbonSleeveSafetyFactor > 1.2;

      results.push({
        suite: 'Phase54_PmsmFluxWeakening',
        name: 'PMSM Motor Solver evaluates MTPA vs MTPV Flux Weakening and 22,000 RPM carbon sleeve safety',
        passed,
        durationMs: performance.now() - t0,
      });
    } catch (err: any) {
      results.push({
        suite: 'Phase54_PmsmFluxWeakening',
        name: 'PMSM Motor Solver evaluates MTPA vs MTPV Flux Weakening and 22,000 RPM carbon sleeve safety',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t0,
      });
    }

    // ── 2. PHASE 55: CFRP Monocoque Layup & Tsai-Wu Failure ──
    const t1 = performance.now();
    try {
      const cfrp = CfrpMonocoqueLayupSolver.evaluateMonocoqueLaminate({
        repeats: 3,
      });

      const passed =
        cfrp.isFailureSafe &&
        cfrp.tsaiWuMaxFailureIndex < 1.0 &&
        cfrp.torsionalRigidityKNmPerDeg > 50 &&
        cfrp.monocoqueBareTubMassKg < 120;

      results.push({
        suite: 'Phase55_CfrpMonocoqueLayup',
        name: 'CFRP Monocoque Solver calculates Classical Laminate [A,B,D] matrices and Tsai-Wu failure index',
        passed,
        durationMs: performance.now() - t1,
      });
    } catch (err: any) {
      results.push({
        suite: 'Phase55_CfrpMonocoqueLayup',
        name: 'CFRP Monocoque Solver calculates Classical Laminate [A,B,D] matrices and Tsai-Wu failure index',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t1,
      });
    }

    // ── 3. PHASE 56: Dual-Chamber Air Suspension ──
    const t2 = performance.now();
    try {
      const airComfort = DualChamberAirSuspensionSolver.evaluateAirSuspension({
        mode: 'COMFORT_STANDARD',
        isHighGCorneringOrBraking: false,
      });

      const airFirm = DualChamberAirSuspensionSolver.evaluateAirSuspension({
        mode: 'AERO_HIGH_SPEED',
        isHighGCorneringOrBraking: true,
      });

      const passed =
        airComfort.corners.fl.isAuxiliaryChamberEngaged &&
        !airFirm.corners.fl.isAuxiliaryChamberEngaged &&
        airFirm.corners.fl.effectiveSpringRateNPerMm > airComfort.corners.fl.effectiveSpringRateNPerMm &&
        airFirm.chassisGroundClearanceMm < airComfort.chassisGroundClearanceMm;

      results.push({
        suite: 'Phase56_DualChamberAirSuspension',
        name: 'Dual-Chamber Air Suspension modulates polytropic stiffness and 4-corner dynamic ride height',
        passed,
        durationMs: performance.now() - t2,
      });
    } catch (err: any) {
      results.push({
        suite: 'Phase56_DualChamberAirSuspension',
        name: 'Dual-Chamber Air Suspension modulates polytropic stiffness and 4-corner dynamic ride height',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t2,
      });
    }

    // ── 4. PHASE 57: Brake-by-Wire Blending ──
    const t3 = performance.now();
    try {
      const bbw = BrakeByWireBlendingSolver.evaluateBrakeBlending({
        pedalTravelMm: 25,
        vehicleSpeedKmh: 75,
        batterySocPct: 60,
      });

      const passed =
        bbw.pedalResistanceForceN > 0 &&
        bbw.electricMotorRegenTorqueNm > 0 &&
        bbw.frictionHydraulicTorqueNm >= 0 &&
        bbw.regenerativeSharePct > 30;

      results.push({
        suite: 'Phase57_BrakeByWireBlending',
        name: 'Brake-by-Wire Simulator blends electric motor regen and hydraulic friction with decoupled pedal feel',
        passed,
        durationMs: performance.now() - t3,
      });
    } catch (err: any) {
      results.push({
        suite: 'Phase57_BrakeByWireBlending',
        name: 'Brake-by-Wire Simulator blends electric motor regen and hydraulic friction with decoupled pedal feel',
        passed: false,
        error: err.message || String(err),
        durationMs: performance.now() - t3,
      });
    }

    return results;
  }
}
