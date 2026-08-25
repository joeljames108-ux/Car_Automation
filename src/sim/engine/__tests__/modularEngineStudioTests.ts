/**
 * ============================================================================
 * MODULAR ENGINE STUDIO — UNIT TEST SUITE
 * ============================================================================
 * Tests schema completeness, dyno solvers, compatibility engine, mounting
 * sockets, slider-crank kinematics, and side-by-side A/B comparison deltas.
 * ============================================================================
 */

import { MasterEngineStateEngine } from "../masterEngineStateEngine";
import { EngineDynoSolver } from "../engineDynoSolver";
import { EngineCompatibilityEngine } from "../engineCompatibilityEngine";
import { EngineMountingGraph } from "../../../exterior3d/sockets/engineMountingGraph";
import { EngineKinematicsAnimator } from "../../../exterior3d/animation/engineKinematicsAnimator";

export function runModularEngineStudioTests(): { passed: number; failed: number } {
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
  console.log("RUNNING MODULAR ENGINE STUDIO TEST SUITE (PHASES 1-25)");
  console.log("================================================================");

  const engine = MasterEngineStateEngine.getInstance();
  const state = engine.getState();

  // --------------------------------------------------------------------------
  // TEST 1: Master State Schema & 14 Subsystems Completeness
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 1: Master State Schema & 14 Subsystems Completeness ---");
  assert(Boolean(state.id && state.name), "Engine ID and Name initialized");
  assert(state.architecture.cylinderCount === 8, "V8 architecture initialized with 8 cylinders");
  assert(state.block.boreMm > 70 && state.block.strokeMm > 60, "Bore & stroke dimensions valid");
  assert(state.crankshaft.planeType === "flat_plane_180", "Crankshaft flat-plane plane type defined");
  assert(state.connectingRods.style !== undefined, "Connecting rods subassembly present");
  assert(state.pistons.materialClass !== undefined, "Pistons subassembly present");
  assert(state.cylinderHeads.valvetrain === "dohc_4v_roller_rocker", "DOHC valvetrain present");
  assert(state.camshafts.intakeDurationAdvDeg > 240, "Cam duration valid");
  assert(state.valvesAndSprings.springType !== undefined, "Valve springs defined");
  assert(state.intake.style !== undefined, "Air intake manifold defined");
  assert(state.fuelSystem.injectionType !== undefined, "Fuel injection system defined");
  assert(state.ignition.type !== undefined, "Ignition system defined");
  assert(state.turboSystem.type === "hot_v_twin_turbo", "Forced induction twin-turbo defined");
  assert(state.exhaust.headerStyle !== undefined, "Exhaust headers defined");
  assert(state.lubrication.systemType === "dry_sump_3_stage", "Dry sump lubrication defined");
  assert(state.tuning.revLimiterRpm >= 7000, "Rev limiter tuning defined");
  assert(state.drivetrain !== undefined, "15th Subsystem: Drivetrain defined on MasterEngineState");
  assert(state.drivetrainPerformance !== undefined, "Coupled Drivetrain Performance computed");

  // --------------------------------------------------------------------------
  // TEST 2: Multi-Physics Dyno Solver & Continuous Power Curves
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 2: Multi-Physics Dyno Solver & Power Curves ---");
  const dyno = state.performance;
  assert(dyno.displacementLiters > 3.0 && dyno.displacementLiters < 5.0, `Displacement computed correctly (${dyno.displacementLiters}L)`);
  assert(dyno.peakHorsepowerHp > 600, `Peak Horsepower computed (>600 HP, got ${dyno.peakHorsepowerHp} HP)`);
  assert(dyno.peakTorqueNm > 700, `Peak Torque computed (>700 Nm, got ${dyno.peakTorqueNm} Nm)`);
  assert(dyno.specificOutputHpPerLiter > 120, `Specific Output computed (${dyno.specificOutputHpPerLiter} HP/L)`);
  assert(dyno.dynoCurve.length > 20, `Continuous Dyno Curve generated (${dyno.dynoCurve.length} RPM data points)`);
  assert(state.costAndBOM.totalEngineBOMCostUSD > 10000, `BOM Cost computed ($${state.costAndBOM.totalEngineBOMCostUSD})`);

  // --------------------------------------------------------------------------
  // TEST 3: Multi-Physics Compatibility & Safety Engine
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 3: Multi-Physics Compatibility & Safety Engine ---");
  assert(state.compatibility.isMechanicallySafe === true, "Baseline Apex V8 is mechanically safe");
  assert(state.compatibility.valveFloatRpm > state.tuning.revLimiterRpm, "Valve float threshold exceeds rev limiter");

  // Test Hazard Injection: Unsafe high rev limiter on weak single valve springs
  const hazardousState = JSON.parse(JSON.stringify(state));
  hazardousState.valvesAndSprings.springType = "single_ovate_beehive";
  hazardousState.tuning.revLimiterRpm = 10500;
  const hazardReport = EngineCompatibilityEngine.evaluate(hazardousState);
  assert(hazardReport.isMechanicallySafe === false, "Correctly detects catastrophic valve float hazard");
  assert(hazardReport.violations.some(v => v.id === "RULE_VALVE_FLOAT_HAZARD"), "Flags RULE_VALVE_FLOAT_HAZARD violation");

  // --------------------------------------------------------------------------
  // TEST 4: Parametric Mounting Sockets & Exploded View Transforms
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 4: Parametric Mounting Sockets & Exploded View ---");
  const graph = new EngineMountingGraph(state);
  const crankSocket = graph.getSocket("ENGINE_CRANKSHAFT_MAIN");
  assert(crankSocket !== undefined, "Crankshaft socket registered");
  assert(graph.getSocket("ENGINE_CYLINDER_BORE_01") !== undefined, "Cylinder Bore 01 socket registered");
  assert(graph.getSocket("ENGINE_HEAD_BANK_L") !== undefined, "Left Cylinder Head socket registered");
  assert(graph.getSocket("ENGINE_INTAKE_MANIFOLD") !== undefined, "Intake Manifold socket registered");

  graph.setExplodedFactor(0.8);
  assert(graph.getExplodedFactor() === 0.8, "Exploded factor successfully set to 80%");

  // --------------------------------------------------------------------------
  // TEST 5: Slider-Crank Kinematics & 4-Stroke Phase Transitions
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 5: Slider-Crank Kinematics & 4-Stroke Cycle ---");
  const kinematics = new EngineKinematicsAnimator(state);
  kinematics.setRpm(3000);
  assert(kinematics.getRpm() === 3000, "Kinematic RPM set to 3000");

  // Advance time by 0.01 sec and check cylinder kinematics
  kinematics.update(0.01);
  const cyl0 = kinematics.solveCylinder(0);
  assert(cyl0.pistonNormalized01 >= 0 && cyl0.pistonNormalized01 <= 1, "Piston normalized displacement is in [0, 1]");
  assert(["intake", "compression", "power", "exhaust"].includes(cyl0.cyclePhase), `Valid 4-stroke cycle phase: ${cyl0.cyclePhase}`);

  // --------------------------------------------------------------------------
  // TEST 6: Engine Comparison Studio (Engine A vs Engine B)
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 6: Engine Comparison Studio (A vs B) ---");
  const engineB = engine.createPresetV12NA();
  const comparison = engine.compareWith(engineB);
  assert(comparison.displacementDiffL !== 0, `Displacement delta computed (${comparison.displacementDiffL}L)`);
  assert(comparison.powerDiffHp !== undefined, `Horsepower delta computed (${comparison.powerDiffHp} HP)`);
  assert(comparison.powerCurveA.length > 0 && comparison.powerCurveB.length > 0, "Superimposed power curves generated");

  console.log("\n================================================================");
  console.log(`MODULAR ENGINE STUDIO TESTS: ${passed} passed, ${failed} failed.`);
  console.log("================================================================");

  return { passed, failed };
}

if (process.argv[1]?.includes("modularEngineStudioTests")) {
  const res = runModularEngineStudioTests();
  if (res.failed > 0) process.exit(1);
}
