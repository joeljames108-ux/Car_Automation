/**
 * ============================================================================
 * MASTER VEHICLE STATE & MODULAR 3D ARCHITECTURE TEST SUITE
 * ============================================================================
 * Unit test assertions validating single-source-of-truth state transitions,
 * multi-physics delta calculations, packaging compatibility rules,
 * attachment graph snapping, and comparison deltas.
 */

import { MasterVehicleStateEngine } from "../masterVehicleStateEngine";
import { PackagingCompatibilityEngine } from "../compatibilityEngine";
import { MasterAttachmentGraph } from "../../../exterior3d/sockets/masterAttachmentGraph";
import * as THREE from "three";

export function runMasterVehicleStateTests(): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  console.log("\n================================================================");
  console.log("RUNNING MASTER VEHICLE STATE & 3D ARCHITECTURE TEST SUITE");
  console.log("================================================================");

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      passed++;
      console.log(`[PASS] ${testName}`);
    } else {
      failed++;
      console.error(`[FAIL] ${testName} - ${details || "Assertion failed"}`);
    }
  }

  const engine = MasterVehicleStateEngine.getInstance();
  const state = engine.getState();

  // --------------------------------------------------------------------------
  // TEST 1: Master State Schema & 12 Subsystems
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 1: Master State Schema & Subsystem Completeness ---");
  assert(!!state.id && state.id === "VEHICLE_MASTER_GT3_APEX", "Master Vehicle ID is initialized");
  assert(!!state.chassis && state.chassis.wheelbaseMm === 2720, "Chassis wheelbase is defined (2720mm)");
  assert(!!state.powertrain && state.powertrain.peakPowerHp > 0, "Powertrain peak power is calculated");
  assert(!!state.transmission && state.transmission.gearCount === 8, "Transmission gear count is valid (8sp)");
  assert(!!state.suspension && state.suspension.frontSpringRateNmm > 0, "Suspension spring rates defined");
  assert(!!state.wheelsBrakes && state.wheelsBrakes.frontDiscDiameterMm === 410, "Brakes disc diameter defined (410mm)");
  assert(!!state.aero && state.aero.rearWingSpanMm === 1680, "Aero rear wing span defined (1680mm)");
  assert(!!state.bodyPanels && !!state.bodyPanels.paintColorHex, "Body panels paint color defined");
  assert(!!state.interior && !!state.interior.dashboardId, "Interior cockpit subassembly defined");
  assert(!!state.metrics && state.metrics.totalCurbMassKg > 0, "Total curb mass is computed (>0 kg)");
  assert(state.metrics.topSpeedKmh > 200, "Top speed is realistically computed (>200 km/h)");
  assert(state.metrics.zeroToHundredKmhSec < 4.0, "0-100 km/h acceleration is calculated (<4.0s)");
  assert(state.costAndBOM.totalManufacturingCostUSD > 20000, "BOM & CapEx cost calculated");

  // --------------------------------------------------------------------------
  // TEST 2: Real-Time Parameter Deltas (Wing Angle -> Downforce / Drag / Lap)
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 2: Real-Time Parameter Delta Computations ---");
  const prevDownforce = state.metrics.downforceAt160KmhN;
  const prevDrag = state.metrics.dragAt160KmhN;

  engine.updateAero({ rearWingAngleDeg: 24 }); // Increase wing angle
  const delta = engine.getLastDelta();

  assert(delta !== null, "Parameter delta is emitted upon aero modification");
  if (delta) {
    assert(delta.deltaDownforceN > 0, `Downforce increased on higher wing angle (+${delta.deltaDownforceN} N)`);
    assert(delta.deltaDragN > 0, `Drag increased on higher wing angle (+${delta.deltaDragN} N)`);
    assert(delta.deltaTopSpeedKmh <= 0, `Top speed decreased slightly due to higher aero drag (${delta.deltaTopSpeedKmh} km/h)`);
  }

  // --------------------------------------------------------------------------
  // TEST 3: Packaging & Compatibility Engine
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 3: Packaging & Compatibility Engine ---");
  const compatGood = PackagingCompatibilityEngine.evaluate(engine.getState());
  assert(compatGood.isPhysicallyFeasible === true, "Baseline GT3 Apex passes packaging checks with 0 critical errors");
  assert(compatGood.transmissionTorqueSafetyFactor >= 1.0, `Transmission torque safety factor is safe (${compatGood.transmissionTorqueSafetyFactor}x)`);

  // Simulate an extreme conflict (Low torque rating gearbox with twin-turbo V8)
  const modifiedState = JSON.parse(JSON.stringify(engine.getState()));
  modifiedState.transmission.maxTorqueRatingNm = 250; // Too low for 850 Nm engine
  const compatBad = PackagingCompatibilityEngine.evaluate(modifiedState);
  assert(compatBad.isPhysicallyFeasible === false, "Correctly detects catastrophic transmission torque overload");
  assert(compatBad.criticalErrorsCount > 0, "Flags critical error for transmission torque exceedance");

  // --------------------------------------------------------------------------
  // TEST 4: Attachment Graph Snapping & Exploded View
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 4: Attachment Graph Snapping & Hierarchy ---");
  const graph = new MasterAttachmentGraph();
  const dummyMesh = new THREE.Group();

  const attached = graph.attachComponent(
    "TEST_SPLITTER",
    "aero",
    "AERO_FRONT_SPLITTER_SOCKET",
    dummyMesh,
    { x: 0, y: -200, z: -400 }
  );
  assert(attached === true, "Successfully attached 3D component to designated parent socket");

  graph.setExplodedFactor(0.5);
  assert(dummyMesh.position.z === (-2150 + -400 * 0.5) / 1000, "Exploded offset correctly calculated (mm -> meters)");

  graph.setXRayMode(true);
  assert(graph.getAttachedNodes().length === 1, "Graph maintains attached nodes registry");

  // --------------------------------------------------------------------------
  // TEST 5: Vehicle Comparison Studio A/B
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 5: Vehicle Comparison Studio A/B ---");
  const carB = JSON.parse(JSON.stringify(engine.getState()));
  carB.powertrain.displacementL = 6.5;
  carB.powertrain.boostBar = 2.2;
  carB.powertrain.peakPowerHp = 1650;
  carB.aero.rearWingAngleDeg = 28;

  const comparison = engine.compareWith(carB);
  assert(comparison.powerDiffHp !== 0, "Comparison correctly computes horsepower delta");
  assert(comparison.sectorDeltas.sector1DiffSec !== undefined, "Comparison computes multi-sector track time breakdown");

  console.log("\n================================================================");
  console.log(`MASTER VEHICLE STATE TESTS: ${passed} passed, ${failed} failed.`);
  console.log("================================================================");

  return { passed, failed };
}

if (process.argv[1]?.includes("masterVehicleStateTests")) {
  const res = runMasterVehicleStateTests();
  if (res.failed > 0) process.exit(1);
}
