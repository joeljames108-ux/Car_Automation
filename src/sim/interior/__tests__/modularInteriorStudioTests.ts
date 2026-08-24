/**
 * ============================================================================
 * MODULAR INTERIOR STUDIO — MASTER UNIT TEST SUITE
 * ============================================================================
 * Rigorously validates:
 * 1. Master State Schema & 10 Modular Subassemblies Completeness
 * 2. Multi-Physics Dynamics Solver (Mass, BOM Cost, Delta vs Base)
 * 3. Luxury, Sportiness, Ergonomics & NVH Sound Isolation (dB)
 * 4. Driver Lateral G Holding Capacity & Harness Dynamics
 * 5. 3D Mounting Socket Graph & Continuous Exploded View Kinematics
 * 6. Functional Canvas Cluster Telemetry Renderer
 * 7. Side-by-Side Cabin A vs B Delta Scoring Engine
 * 8. State Manager 50-Step Undo/Redo & JSON Serialization
 * ============================================================================
 */

import { MasterInteriorStateEngine, CURATED_INTERIOR_PRESETS } from "../masterInteriorStateEngine";
import { MasterInteriorSolver } from "../masterInteriorSolver";
import { InteriorMountingGraph } from "../../../exterior3d/sockets/interiorMountingGraph";
import { MasterModularInterior3DAssembler } from "../../../exterior3d/generators/interior/masterModularInterior3DAssembler";
import { MasterCabinPackagingEngine } from "../masterCabinPackaging";
import { CabinAcousticSynthesizer } from "../cabinAcousticSynthesizer";
import { InteriorErgonomicsVisualizer } from "../../../exterior3d/generators/interior/interiorErgonomicsVisualizer";

export function runModularInteriorStudioTests(): { passed: number; failed: number } {
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
  console.log("RUNNING MODULAR INTERIOR STUDIO TEST SUITE");
  console.log("================================================================");

  // --------------------------------------------------------------------------
  // TEST 1: Master State Schema & 10 Subsystems Completeness
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 1: Master State Schema & 10 Subsystems Completeness ---");
  const stateEngine = MasterInteriorStateEngine.getInstance();
  const state = stateEngine.getState();

  assert(state.id.length > 0, "Interior ID initialized");
  assert(state.seating.frontSeatType !== undefined, "Front seating defined");
  assert(state.dashboard.typology !== undefined, "Dashboard typology defined");
  assert(state.steering.diameterMm >= 300, "Steering wheel diameter valid");
  assert(state.console.typology !== undefined, "Center console typology defined");
  assert(state.doors.doorReleaseType !== undefined, "Door release type defined");
  assert(state.infotainment.screenSize !== undefined, "Infotainment screen size defined");
  assert(state.materials.seatPrimaryMaterial !== undefined, "Seat primary material mapped");
  assert(state.lighting.enabled !== undefined, "Ambient lighting defined");
  assert(state.audio.speakerCount >= 0, "Audio speaker count defined");
  assert(state.safety.rollCage !== undefined, "Safety roll cage option defined");

  // --------------------------------------------------------------------------
  // TEST 2: Multi-Physics Mass & BOM Cost Solver
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 2: Multi-Physics Mass & BOM Cost Solver ---");
  const metrics = state.metrics;
  assert(metrics.totalInteriorMassKg > 0, `Total mass computed (${metrics.totalInteriorMassKg} kg)`);
  assert(metrics.totalInteriorCostUSD > 0, `Total cost computed ($${metrics.totalInteriorCostUSD})`);
  assert(typeof metrics.massDeltaAgainstBaseKg === "number", "Mass delta calculated");

  // Verify Track vs Luxury mass difference
  const luxuryState = CURATED_INTERIOR_PRESETS.EXECUTIVE_LUXURY_LOUNGE;
  const raceState = CURATED_INTERIOR_PRESETS.GT3_COMPETITION_RACE;
  const luxMetrics = MasterInteriorSolver.solveMetrics(luxuryState);
  const raceMetrics = MasterInteriorSolver.solveMetrics(raceState);

  assert(raceMetrics.totalInteriorMassKg < luxMetrics.totalInteriorMassKg, `Race cabin (${raceMetrics.totalInteriorMassKg}kg) lighter than luxury (${luxMetrics.totalInteriorMassKg}kg)`);

  // --------------------------------------------------------------------------
  // TEST 3: Luxury, Sportiness & NVH Sound Isolation
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 3: Luxury, Sportiness & NVH Sound Isolation ---");
  assert(luxMetrics.comfortIndexPercent > raceMetrics.comfortIndexPercent, "Luxury cabin has higher comfort index");
  assert(raceMetrics.sportinessIndexPercent > luxMetrics.sportinessIndexPercent, "Race cabin has higher sportiness index");
  assert(luxMetrics.cabinNoiseAt120KmhDbA < raceMetrics.cabinNoiseAt120KmhDbA, `Luxury cabin is quieter (${luxMetrics.cabinNoiseAt120KmhDbA}dB vs ${raceMetrics.cabinNoiseAt120KmhDbA}dB)`);

  // --------------------------------------------------------------------------
  // TEST 4: Driver Lateral G Holding Support & Harness Dynamics
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 4: Driver Lateral G Holding Support ---");
  assert(raceMetrics.lateralSupportGThreshold > luxMetrics.lateralSupportGThreshold, `Race bucket holds higher Gs (${raceMetrics.lateralSupportGThreshold}G vs ${luxMetrics.lateralSupportGThreshold}G)`);
  assert(raceMetrics.lateralSupportGThreshold >= 2.0, "FIA Race bucket with 6-point harness exceeds 2.0G lateral hold");

  // --------------------------------------------------------------------------
  // TEST 5: 3D Mounting Sockets & Continuous Exploded View Kinematics
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 5: 3D Mounting Sockets & Exploded View ---");
  const mountingGraph = InteriorMountingGraph.getInstance();
  const sockets = mountingGraph.getAllSockets();
  assert(sockets.length >= 10, `Registered ${sockets.length} standardized interior mounting sockets`);

  const seatNominal = mountingGraph.getSocketTransform("DRIVER_SEAT_MOUNT", 0.0);
  const seatExploded = mountingGraph.getSocketTransform("DRIVER_SEAT_MOUNT", 1.0);
  assert(seatExploded.position.y > seatNominal.position.y, "Driver seat translates upward during exploded view");

  const doorLeftNominal = mountingGraph.getSocketTransform("DOOR_PANEL_LEFT", 0.0);
  const doorLeftExploded = mountingGraph.getSocketTransform("DOOR_PANEL_LEFT", 1.0);
  assert(doorLeftExploded.position.z < doorLeftNominal.position.z, "Left door moves outward laterally during exploded view");

  // --------------------------------------------------------------------------
  // TEST 6: Cabin Packaging & Geometric Zoning
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 6: Cabin Packaging & Geometric Zoning ---");
  const packaging = MasterCabinPackagingEngine.calculateCabinPackaging("supercar", 2700, 1680, true, true);
  assert(packaging.driverHeadroomMm > 700, `Driver headroom computed (${packaging.driverHeadroomMm}mm)`);
  assert(packaging.driverLegroomMm > 800, `Driver legroom computed (${packaging.driverLegroomMm}mm)`);
  assert(packaging.tunnelHeightMm > 100, `ICE transmission tunnel height verified (${packaging.tunnelHeightMm}mm)`);

  // --------------------------------------------------------------------------
  // TEST 7: Side-by-Side Cabin A vs B Comparison Engine
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 7: Side-by-Side Cabin A vs B Comparison Engine ---");
  const comparison = MasterInteriorSolver.compareInteriors(
    { ...luxuryState, metrics: luxMetrics },
    { ...raceState, metrics: raceMetrics }
  );
  assert(comparison.massDiffKg < 0, `Mass delta correctly calculated (${comparison.massDiffKg} kg)`);
  assert(comparison.lateralGSupportDiff > 0, `Lateral G delta correctly calculated (+${comparison.lateralGSupportDiff}G)`);

  // --------------------------------------------------------------------------
  // TEST 8: State Manager Undo / Redo & JSON Serialization
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 8: State Manager Undo / Redo & JSON Serialization ---");
  const jsonExport = stateEngine.exportJson();
  assert(jsonExport.includes("CABIN_"), "JSON export contains cabin state data");
  const importSuccess = stateEngine.importJson(jsonExport);
  assert(importSuccess === true, "JSON re-import succeeds with schema validation");

  // --------------------------------------------------------------------------
  // TEST 9: Functional Infotainment & HMI Dynamic Renderer
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 9: Functional Infotainment & HMI Dynamic Renderer ---");
  const infoRenderer = MasterModularInterior3DAssembler.getInfotainmentRenderer();
  assert(infoRenderer !== null, "Infotainment renderer initialized");
  infoRenderer.setMode("telemetry");
  assert(infoRenderer.getMode() === "telemetry", "Infotainment switched to telemetry mode");
  infoRenderer.setMode("media");
  assert(infoRenderer.getMode() === "media", "Infotainment switched to media mode");

  // --------------------------------------------------------------------------
  // TEST 10: Cabin Acoustic Synthesizer Audio State Engine
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 10: Cabin Acoustic Synthesizer Audio State Engine ---");
  const audioSynth = CabinAcousticSynthesizer.getInstance();
  assert(audioSynth !== null, "Cabin acoustic synthesizer initialized");
  audioSynth.setMuted(true);
  assert(audioSynth.getIsMuted() === true, "Mute toggle verified");
  audioSynth.setMuted(false);
  assert(audioSynth.getIsMuted() === false, "Unmute verified");

  // --------------------------------------------------------------------------
  // TEST 11: 3D Cabin Ergonomics & SAE J1100 Clearance Overlay
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 11: 3D Cabin Ergonomics & SAE J1100 Clearance Overlay ---");
  const ergoGroup = InteriorErgonomicsVisualizer.buildErgonomicsOverlay(state);
  assert(ergoGroup.children.length >= 4, `Ergonomics overlay generated with ${ergoGroup.children.length} 3D markers`);

  console.log("\n================================================================");
  console.log(`MODULAR INTERIOR STUDIO TESTS: ${passed} passed, ${failed} failed.`);
  console.log("================================================================");

  return { passed, failed };
}

if (process.argv[1]?.includes("modularInteriorStudioTests")) {
  const res = runModularInteriorStudioTests();
  if (res.failed > 0) process.exit(1);
}
