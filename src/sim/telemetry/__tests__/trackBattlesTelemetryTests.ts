/**
 * ============================================================================
 * TRACK BATTLES & TELEMETRY TEST SUITE
 * ============================================================================
 */

import {
  TrackBattlesTelemetryEngine,
  VehicleTelemetrySpecs,
  CIRCUITS_CATALOG,
} from "../trackBattlesTelemetryEngine";

export function runTrackBattlesTelemetryTests(): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      console.log(`[PASS] Track Battle Telemetry Test: ${testName}`);
    } else {
      failed++;
      console.error(`[FAIL] Track Battle Telemetry Test: ${testName}`);
    }
  }

  const carA: VehicleTelemetrySpecs = {
    name: "Apex Spec-R Hypercar",
    horsepowerHp: 900,
    massKg: 1200,
    downforceNAt200: 7000,
    cdDrag: 0.32,
    tireGripCoeff: 1.6,
  };

  const carB: VehicleTelemetrySpecs = {
    name: "Rival GT3 Machine",
    horsepowerHp: 600,
    massKg: 1300,
    downforceNAt200: 4500,
    cdDrag: 0.38,
    tireGripCoeff: 1.4,
  };

  // Test 1: Nürburgring Battle Simulation
  const nurbRes = TrackBattlesTelemetryEngine.solveBattle("nurburgring", carA, carB);
  assert(nurbRes.winner === "A", "Hypercar Car A wins battle against lower spec Car B");
  assert(nurbRes.timeDeltaSec > 0, "Computes positive winning time delta");
  assert(nurbRes.sectors.length === 3, "Generates 3 sector time split breakdowns");

  // Test 2: Telemetry Replay Frame Generation
  assert(nurbRes.telemetryFrames.length > 15, "Generates telemetry playback frames across circuit");
  assert(nurbRes.topSpeedKmhA > nurbRes.topSpeedKmhB, "Higher power Car A achieves higher top speed");

  // Test 3: All Circuits Verification
  for (const cId of Object.keys(CIRCUITS_CATALOG) as Array<keyof typeof CIRCUITS_CATALOG>) {
    const res = TrackBattlesTelemetryEngine.solveBattle(cId, carA, carB);
    assert(res.lapTimeSecA > 0 && res.lapTimeSecB > 0, `Valid lap times computed for ${cId}`);
  }

  return { passed, failed };
}
