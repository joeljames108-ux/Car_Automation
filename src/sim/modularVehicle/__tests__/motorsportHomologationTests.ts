// ============================================================================
// MOTORSPORT HOMOLOGATION & BOP TEST SUITE (Vision Section 13)
// ============================================================================
// Validates:
// 1. FIA GT3 & Hypercar technical regulation compliance checks
// 2. Road car production quota enforcement
// 3. Dynamic Balance of Performance (BoP) air restrictor and ballast calculation
// 4. Success ballast penalty for championship podium leaders
// ============================================================================

import {
  HomologationAndBopEngine,
  type HomologationResult,
  type BalanceOfPerformanceAdjustment,
} from '../../motorsport/homologationAndBopEngine';

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  score?: number;
  error?: string;
  durationMs: number;
}

export class MotorsportHomologationTestRunner {
  public executeAllTests(): TestResult[] {
    const results: TestResult[] = [];

    // ── 1. FIA GT3 Homologation Compliance ──
    const t0 = performance.now();
    try {
      const result: HomologationResult = HomologationAndBopEngine.checkHomologation({
        series: 'FIA_GT3',
        curbWeightKg: 1280, // >= 1250 kg min
        peakPowerHp: 560,   // <= 580 hp cap
        displacementLiters: 4.0, // <= 6.2 L cap
        annualProductionUnits: 450, // >= 300 quota
        hasTurbo: true,
        isAwd: false,
        hasAbs: true,       // Allowed in GT3
        hasTractionControl: true,
        rideHeightMm: 55,
      });

      const passed =
        result.isCompliant === true &&
        result.overallStatus === 'APPROVED' &&
        result.remedyCostEstimateUsd === 0;

      results.push({
        suite: 'Motorsport_HomologationCompliance',
        name: 'Compliant GT3 vehicle receives full FIA technical homologation approval',
        passed,
        durationMs: performance.now() - t0,
      });
    } catch (err: unknown) {
      results.push({
        suite: 'Motorsport_HomologationCompliance',
        name: 'Compliant GT3 vehicle receives full FIA technical homologation approval',
        passed: false,
        error: err instanceof Error ? err.message : String(err),
        durationMs: performance.now() - t0,
      });
    }

    // ── 2. Underweight & Power Violation with Remedy Estimation ──
    const t1 = performance.now();
    try {
      const result = HomologationAndBopEngine.checkHomologation({
        series: 'FIA_GT3',
        curbWeightKg: 1180, // Underweight by 70 kg
        peakPowerHp: 640,   // Over power cap by 60 hp
        displacementLiters: 4.0,
        annualProductionUnits: 450,
        hasTurbo: true,
        isAwd: false,
        hasAbs: true,
        hasTractionControl: true,
        rideHeightMm: 55,
      });

      const passed =
        result.isCompliant === false &&
        result.overallStatus === 'REJECTED_WITH_REMEDIES' &&
        result.remedyCostEstimateUsd > 5000 &&
        result.checks.some((c) => !c.passed && c.ruleName.includes('Weight')) &&
        result.checks.some((c) => !c.passed && c.ruleName.includes('Power'));

      results.push({
        suite: 'Motorsport_HomologationRemedies',
        name: 'Underweight & overpowered race car generates actionable compliance remedy plan',
        passed,
        durationMs: performance.now() - t1,
      });
    } catch (err: unknown) {
      results.push({
        suite: 'Motorsport_HomologationRemedies',
        name: 'Underweight & overpowered race car generates actionable compliance remedy plan',
        passed: false,
        error: err instanceof Error ? err.message : String(err),
        durationMs: performance.now() - t1,
      });
    }

    // ── 3. Dynamic Balance of Performance (BoP) & Success Ballast ──
    const t2 = performance.now();
    try {
      const bopLeading: BalanceOfPerformanceAdjustment = HomologationAndBopEngine.calculateBoPAdjustment({
        series: 'FIA_GT3',
        vehicleName: 'Apex GT3 EVO',
        curbWeightKg: 1250,
        peakPowerHp: 620, // Requires restrictor plate down to ~580
        hasTurbo: true,
        championshipStandingPosition: 1, // 1st gets 35kg success ballast
      });

      const passed =
        bopLeading.intakeAirRestrictorMm < 42.0 &&
        bopLeading.successBallastWeightKg === 35 &&
        bopLeading.calibratedPowerHp <= 580 &&
        bopLeading.calibratedWeightKg === 1285;

      results.push({
        suite: 'Motorsport_BalanceOfPerformance',
        name: 'BoP calculates air restrictor size and imposes success ballast on championship leader',
        passed,
        durationMs: performance.now() - t2,
      });
    } catch (err: unknown) {
      results.push({
        suite: 'Motorsport_BalanceOfPerformance',
        name: 'BoP calculates air restrictor size and imposes success ballast on championship leader',
        passed: false,
        error: err instanceof Error ? err.message : String(err),
        durationMs: performance.now() - t2,
      });
    }

    return results;
  }
}
