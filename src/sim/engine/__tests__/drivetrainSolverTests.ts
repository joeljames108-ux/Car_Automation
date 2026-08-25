/**
 * ============================================================================
 * UNIFIED DRIVETRAIN SOLVER & POWERTRAIN FLOW CHAIN — UNIT TEST SUITE
 * ============================================================================
 * Tests wheel torque curves, shift point optimization, acceleration solvers,
 * ratio suggestions, BOM roll-up, and coupled state engine recomputation.
 * ============================================================================
 */

import { MasterEngineStateEngine } from "../masterEngineStateEngine";
import { DrivetrainSolver } from "../drivetrainSolver";
import { DrivetrainSubsystemState, GearRatioSet } from "../masterEngineTypes";

export function runDrivetrainSolverTests(): { passed: number; failed: number } {
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
  console.log("RUNNING DRIVETRAIN SOLVER & POWERTRAIN FLOW CHAIN TESTS");
  console.log("================================================================");

  const engine = MasterEngineStateEngine.getInstance();
  const state = engine.getState();

  // --------------------------------------------------------------------------
  // TEST 1: Drivetrain State Initialization & Presets
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 1: Drivetrain Subsystem State Initialization ---");
  assert(state.drivetrain !== undefined, "Drivetrain subsystem initialized on MasterEngineState");
  assert(state.drivetrain.architecture === "dct_7", "V8 preset initialized with 7-speed DCT");
  assert(state.drivetrain.activeGearCount === 7, "Active gear count is 7");
  assert(state.drivetrain.gearRatios.finalDrive > 2.0, `Final drive ratio valid (${state.drivetrain.gearRatios.finalDrive})`);
  assert(state.drivetrain.mechanicalEfficiencyPercent >= 90, `Mechanical efficiency valid (${state.drivetrain.mechanicalEfficiencyPercent}%)`);

  // --------------------------------------------------------------------------
  // TEST 2: Per-Gear Wheel Torque Curve Solver
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 2: Per-Gear Wheel Torque Curve Solver ---");
  const dynoCurve = state.performance.dynoCurve;
  assert(dynoCurve.length > 0, "Dyno curve is populated");

  const gear1Curves = DrivetrainSolver.solveWheelTorqueCurve(
    dynoCurve,
    state.drivetrain.gearRatios.gear1,
    state.drivetrain.gearRatios.finalDrive,
    state.drivetrain.mechanicalEfficiencyPercent,
  );
  assert(gear1Curves.length === dynoCurve.length, "Wheel torque curve has matching RPM points");

  const peakCrankTorque = state.performance.peakTorqueNm;
  const peakWheelTorqueG1 = Math.max(...gear1Curves.map((p) => p.wheelTorqueNm));
  const expectedMultiplier = state.drivetrain.gearRatios.gear1 * state.drivetrain.gearRatios.finalDrive * (state.drivetrain.mechanicalEfficiencyPercent / 100);
  assert(
    peakWheelTorqueG1 > peakCrankTorque * 5,
    `1st gear multiplies torque appropriately (>5x crank, got ${peakWheelTorqueG1} Nm from ${peakCrankTorque} Nm crank)`
  );

  const allGearCurves = DrivetrainSolver.solveAllGearCurves(dynoCurve, state.drivetrain);
  assert(Object.keys(allGearCurves).length === 7, "Generated curves for all 7 active gears");
  // Higher gears must have lower peak torque due to lower gear ratios
  const peakG1 = Math.max(...allGearCurves[1].map((p) => p.wheelTorqueNm));
  const peakG7 = Math.max(...allGearCurves[7].map((p) => p.wheelTorqueNm));
  assert(peakG1 > peakG7, `Gear 1 torque (${peakG1} Nm) > Gear 7 torque (${peakG7} Nm)`);

  // --------------------------------------------------------------------------
  // TEST 3: Optimal Shift Point Optimization
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 3: Optimal Shift Point Optimization ---");
  const shiftPoints = DrivetrainSolver.solveShiftPoints(dynoCurve, state.drivetrain);
  assert(shiftPoints.length === state.drivetrain.activeGearCount - 1, `Computed ${shiftPoints.length} shift points for 7 gears`);
  shiftPoints.forEach((rpm, idx) => {
    assert(rpm >= 4000 && rpm <= state.performance.redlineRpm, `Gear ${idx + 1} shift point (${rpm} RPM) is within valid RPM band`);
  });

  // --------------------------------------------------------------------------
  // TEST 4: Acceleration Step-Integration Physics
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 4: Acceleration Simulation ---");
  const accel = DrivetrainSolver.solveAccelerationProfile(dynoCurve, state.drivetrain, 1550);
  assert(accel.zeroTo60Sec > 1.5 && accel.zeroTo60Sec < 6.0, `Realistic 0-60 mph time computed (${accel.zeroTo60Sec} sec)`);
  assert(accel.zeroTo100Sec > accel.zeroTo60Sec, `0-100 mph time (${accel.zeroTo100Sec}s) > 0-60 time (${accel.zeroTo60Sec}s)`);
  assert(accel.quarterMileSec > 7.0 && accel.quarterMileSec < 15.0, `Realistic 1/4 mile time (${accel.quarterMileSec} sec @ ${accel.quarterMileSpeedMph} mph)`);

  // --------------------------------------------------------------------------
  // TEST 5: Gear Ratio Synthesis / Suggestion
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 5: Gear Ratio Synthesis ---");
  const naRatios = DrivetrainSolver.suggestGearRatios(6500, 9000, 6, true);
  const turboRatios = DrivetrainSolver.suggestGearRatios(3500, 7500, 7, false);
  assert(naRatios.gear1 < turboRatios.gear1 || naRatios.finalDrive > turboRatios.finalDrive, "NA ratios tailored differently from turbo");
  assert(naRatios.gear1 > naRatios.gear2 && naRatios.gear2 > naRatios.gear3, "Progression drops monotonically");

  // --------------------------------------------------------------------------
  // TEST 6: Coupled State Engine Recomputation & BOM Integration
  // --------------------------------------------------------------------------
  console.log("\n--- TEST 6: State Engine Recomputation & BOM Integration ---");
  assert(state.drivetrainPerformance !== undefined, "drivetrainPerformance computed automatically in state engine");
  assert(state.costAndBOM.drivetrainCostUSD > 0, `Drivetrain BOM cost tracked ($${state.costAndBOM.drivetrainCostUSD})`);
  assert(
    state.costAndBOM.totalPowertrainBOMCostUSD === state.costAndBOM.totalEngineBOMCostUSD + state.costAndBOM.drivetrainCostUSD,
    "Total Powertrain BOM = Engine BOM + Drivetrain BOM"
  );

  // Mutate drivetrain and verify reactive update
  const initialCost = state.costAndBOM.drivetrainCostUSD;
  engine.updateDrivetrain({ costUSD: 18000 });
  const updatedState = engine.getState();
  assert(updatedState.costAndBOM.drivetrainCostUSD === 18000, "updateDrivetrain reactively updates cost");
  assert(updatedState.costAndBOM.totalPowertrainBOMCostUSD > initialCost, "Powertrain total cost reflects update");

  console.log("\n================================================================");
  console.log(`DRIVETRAIN SOLVER TESTS: ${passed} passed, ${failed} failed.`);
  console.log("================================================================");

  return { passed, failed };
}

if (process.argv[1]?.includes("drivetrainSolverTests")) {
  const res = runDrivetrainSolverTests();
  if (res.failed > 0) process.exit(1);
}
