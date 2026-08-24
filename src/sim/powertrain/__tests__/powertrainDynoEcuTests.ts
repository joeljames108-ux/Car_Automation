/**
 * ============================================================================
 * POWERTRAIN DYNO & ECU PHYSICS TEST SUITE
 * ============================================================================
 */

import { PowertrainDynoEcuEngine, EcuMapState } from "../powertrainDynoEcuEngine";

export function runPowertrainDynoEcuTests(): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      console.log(`[PASS] Powertrain Dyno ECU Test: ${testName}`);
    } else {
      failed++;
      console.error(`[FAIL] Powertrain Dyno ECU Test: ${testName}`);
    }
  }

  const baselineState: EcuMapState = {
    engineName: "4.0L V8 Twin Turbo",
    displacementL: 4.0,
    cylinderCount: 8,
    fuelType: "octane98",
    boostBar: 1.2,
    ignitionTimingBtdcDeg: 20,
    targetAfr: 11.8,
    camDurationDeg: 270,
    revLimitRpm: 8000,
    hasWaterMethanolInjection: false,
  };

  const baselineRes = PowertrainDynoEcuEngine.solve(baselineState);

  // Test 1: Peak Power & Torque Generation
  assert(baselineRes.peakPowerHp > 400, "Generates realistic peak horsepower (> 400 HP)");
  assert(baselineRes.peakTorqueNm > 500, "Generates realistic peak torque (> 500 Nm)");
  assert(baselineRes.dynoCurve.length > 20, "Generates complete Dyno sweep curve data");

  // Test 2: Turbo Boost Power Scaling
  const highBoostState = { ...baselineState, boostBar: 2.2 };
  const highBoostRes = PowertrainDynoEcuEngine.solve(highBoostState);
  assert(highBoostRes.peakPowerHp > baselineRes.peakPowerHp, "Higher turbo boost increases peak horsepower");

  // Test 3: E85 Ethanol Anti-Knock Safety
  const e85State = { ...baselineState, boostBar: 2.2, fuelType: "e85" as const };
  const e85Res = PowertrainDynoEcuEngine.solve(e85State);
  assert(e85Res.knockMarginSafetyScore >= highBoostRes.knockMarginSafetyScore, "E85 fuel improves knock safety margin");

  // Test 4: EGT Overheat & Knock Danger Detection
  const dangerousState: EcuMapState = {
    ...baselineState,
    boostBar: 3.2,
    ignitionTimingBtdcDeg: 40,
    targetAfr: 14.5, // Lean + high boost + over-advanced timing
    fuelType: "octane91",
  };
  const dangerousRes = PowertrainDynoEcuEngine.solve(dangerousState);
  assert(dangerousRes.hasKnockDanger, "Flags knock danger on extreme timing and low octane");

  return { passed, failed };
}
