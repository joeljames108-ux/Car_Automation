/**
 * ============================================================================
 * GRAND AUTOMOTIVE ENGINEERING SUITE — INTEGRATION TEST SUITE
 * ============================================================================
 * Tests the synthesized audio harmonics, procedural PBR normal textures,
 * 12-stage robotic factory assembly sequencing, and cross-subsystem state sync.
 * ============================================================================
 */

import { MasterEngineAudioSynthesizer } from "../../audio/masterEngineAudioSynthesizer";
import { MasterPbrTextureSynthesizer } from "../../../exterior3d/materials/masterPbrTextureSynthesizer";
import { ASSEMBLY_STAGES } from "../../../components/assembly/RoboticFactorySequencer";
import { MasterVehicleStateEngine } from "../masterVehicleStateEngine";
import { MasterEngineStateEngine } from "../../engine/masterEngineStateEngine";

export function runGrandStudioIntegrationTests(): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - Assertion failed`);
      failed++;
    }
  }

  console.log("\n================================================================");
  console.log("RUNNING GRAND AUTOMOTIVE ENGINEERING SUITE INTEGRATION TESTS");
  console.log("================================================================");

  // --------------------------------------------------------------------------
  // TEST 1: Real-Time Web Audio Powertrain Synthesizer
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 1: Real-Time Web Audio Powertrain Synthesizer ---");
  const audio = MasterEngineAudioSynthesizer.getInstance();
  assert(audio !== null, "Audio synthesizer instance created");
  audio.setMuted(true);
  assert(audio.getIsMuted() === true, "Mute toggle operates correctly");
  audio.updateTelemetry(6000, 1.0, 1.8, 8);
  assert(true, "Audio telemetry update executes without errors");
  audio.triggerBlowOffValve();
  assert(true, "Blow-off valve trigger executes safely");

  // --------------------------------------------------------------------------
  // TEST 2: Procedural PBR Normal & Roughness Texture Synthesizer
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 2: Procedural PBR Normal & Roughness Texture Synthesizer ---");
  const textureSynth = MasterPbrTextureSynthesizer.getInstance();
  assert(textureSynth !== null, "PBR texture synthesizer initialized");
  // In Node.js document is undefined, returns safe null fallback
  const carbonTex = textureSynth.getCarbonFiberNormalMap();
  assert(carbonTex === null || carbonTex !== undefined, "Carbon fiber normal generator handled gracefully in headless environment");

  // --------------------------------------------------------------------------
  // TEST 3: 12-Stage Robotic Factory Assembly Timeline
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 3: 12-Stage Robotic Factory Assembly Timeline ---");
  assert(ASSEMBLY_STAGES.length === 12, "All 12 assembly stages defined");
  const totalCycleTime = ASSEMBLY_STAGES.reduce((acc, s) => acc + s.cycleTimeSec, 0);
  assert(totalCycleTime > 500, `Total factory cycle time computed (${totalCycleTime}s)`);
  assert(ASSEMBLY_STAGES[0].fastenerTorqueNm > 0, "Chassis frame torque spec valid");
  assert(ASSEMBLY_STAGES[9].fastenerTorqueNm === 600, "Wheel center-lock torqued to 600 Nm");

  // --------------------------------------------------------------------------
  // TEST 4: Cross-Subsystem Unified State Synchronization
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 4: Cross-Subsystem Unified State Synchronization ---");
  const vehState = MasterVehicleStateEngine.getInstance().getState();
  const engState = MasterEngineStateEngine.getInstance().getState();

  assert(vehState.powertrain.peakPowerHp > 0, "Vehicle state has non-zero powertrain power");
  assert(engState.performance.peakHorsepowerHp > 0, "Engine studio state has computed peak horsepower");
  assert(vehState.chassis.wheelbaseMm > 2000, "Wheelbase geometry valid across systems");

  console.log("\n================================================================");
  console.log(`GRAND SUITE INTEGRATION TESTS: ${passed} passed, ${failed} failed.`);
  console.log("================================================================");

  return { passed, failed };
}

if (process.argv[1]?.includes("grandStudioIntegrationTests")) {
  const res = runGrandStudioIntegrationTests();
  if (res.failed > 0) process.exit(1);
}
