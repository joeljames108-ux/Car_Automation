// ===================================================================
// TRANSMISSION & DRIVETRAIN ENGINEERING TEST SUITE
// ===================================================================

declare const process: { exit: (code: number) => void };
import {
  evaluateClutchSlip,
  computeShiftTransient,
  calculateEDiffTorqueSplit,
  analyzeGearRatioProgression,
  drivingForce,
  wheelTorque,
  rpmFromSpeed,
  speedFromRpm,
} from "../physics/transmissionPhysics";

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
}

const results: TestResult[] = [];

function runTest(suite: string, name: string, fn: () => void) {
  const start = performance.now();
  try {
    fn();
    results.push({ suite, name, passed: true, durationMs: performance.now() - start });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    results.push({ suite, name, passed: false, durationMs: performance.now() - start, error: errorMsg });
  }
}

function expect<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) throw new Error(`Expected ${String(expected)} but got ${String(actual)}`);
    },
    toBeCloseTo(expected: number, delta: number = 0.05) {
      const numActual = typeof actual === 'number' ? actual : Number(actual);
      if (Math.abs(numActual - expected) > delta) {
        throw new Error(`Expected ${numActual} to be close to ${expected} within ${delta}`);
      }
    },
    toBeGreaterThan(expected: number) {
      const numActual = typeof actual === 'number' ? actual : Number(actual);
      if (numActual <= expected) throw new Error(`Expected ${numActual} to be > ${expected}`);
    },
    toBeLessThan(expected: number) {
      const numActual = typeof actual === 'number' ? actual : Number(actual);
      if (numActual >= expected) throw new Error(`Expected ${numActual} to be < ${expected}`);
    },
  };
}

console.log("=================================================");
console.log("  TRANSMISSION & DRIVETRAIN PHYSICS TESTS        ");
console.log("=================================================");

// ── 1. GEAR RATIO & SPEED CONVERSION TESTS ──
runTest("TransmissionRatios", "Computes speed from RPM and RPM from speed accurately", () => {
  const transState: any = {
    gearRatios: [
      { gear: 1, ratio: 3.82, minSpeed: 10, maxSpeed: 65 },
      { gear: 2, ratio: 2.36, minSpeed: 15, maxSpeed: 105 },
    ],
    finalDrive: 3.44,
    wheelRadiusM: 0.33,
    drivetrainEfficiency: 0.90,
  };

  const speedAt6000Rpm = speedFromRpm(6000, 1, transState);
  const rpmAtSpeed = rpmFromSpeed(speedAt6000Rpm, 1, transState);

  expect(speedAt6000Rpm).toBeGreaterThan(45);
  expect(speedAt6000Rpm).toBeLessThan(65);
  expect(rpmAtSpeed).toBeCloseTo(6000, 1.0);
});

runTest("TransmissionRatios", "Analyzes 8-speed gear progression and monotonic step ratio decay", () => {
  const ratios = [4.05, 2.62, 1.88, 1.45, 1.18, 0.96, 0.80, 0.67];
  const finalDrive = 3.44;
  const redline = 8500;

  const analysis = analyzeGearRatioProgression(ratios, finalDrive, redline);
  expect(analysis.length).toBe(8);
  expect(analysis[0].maxSpeedKmh).toBeGreaterThan(60);
  expect(analysis[7].maxSpeedKmh).toBeGreaterThan(320); // Hypercar top speed capability

  // 1st to 2nd step ratio should be larger than 6th to 7th step
  expect(analysis[0].stepRatioToNext).toBeGreaterThan(analysis[5].stepRatioToNext);
});

// ── 2. MULTI-PLATE WET CLUTCH THERMAL TESTS ──
runTest("ClutchThermal", "Calculates launch control slip energy and thermal rise", () => {
  const engineTorque = 650; // Nm
  const deltaOmega = 450; // rad/s (~4300 RPM slip)
  const slipDuration = 0.40; // 400ms launch slip

  const result = evaluateClutchSlip(engineTorque, deltaOmega, slipDuration, "wet_multiplate", 60);
  expect(result.slipEnergyJoules).toBeGreaterThan(50000); // >50 kJ slip energy
  expect(result.clutchTempC).toBeGreaterThan(80);
  expect(result.torqueCapacityNm).toBeGreaterThan(1000); // 12-plate wet clutch holds >1000 Nm
});

runTest("ClutchThermal", "Detects carbon-carbon cold friction and high-temp capacity", () => {
  const coldClutch = evaluateClutchSlip(700, 200, 0.2, "carbon_carbon", 40);
  const hotClutch = evaluateClutchSlip(700, 200, 0.2, "carbon_carbon", 350);

  expect(hotClutch.torqueCapacityNm).toBeGreaterThan(coldClutch.torqueCapacityNm);
});

// ── 3. SYNCHROMESH & SHIFT TRANSIENT TESTS ──
runTest("ShiftDynamics", "Computes sequential dog-ring instant shift vs synchromesh smooth shift", () => {
  const dogShift = computeShiftTransient(3.82, 2.36, 8000, 1000, true);
  const synchroShift = computeShiftTransient(3.82, 2.36, 8000, 250, false);

  expect(dogShift.synchronizationTimeSec).toBeLessThan(0.08); // <80ms sequential
  expect(synchroShift.synchronizationTimeSec).toBeGreaterThan(0.12); // >120ms synchro
  expect(dogShift.shiftShockJerkGPerSec).toBeGreaterThan(synchroShift.shiftShockJerkGPerSec); // Higher jerk in dog box
});

// ── 4. E-DIFF & LIMITED SLIP TORQUE VECTORING TESTS ──
runTest("DifferentialPhysics", "Vectors torque dynamically to outer wheel during cornering", () => {
  const inputTorque = 2400; // Nm at axle
  const steeringAngle = 20; // 20 deg right turn
  const latG = 1.3;

  const result = calculateEDiffTorqueSplit(inputTorque, steeringAngle, latG, 0.05, "active_ediff");
  expect(result.rightWheelTorqueNm).toBeGreaterThan(result.leftWheelTorqueNm); // Outside wheel gets more torque
  expect(result.lockupPercentage).toBeGreaterThan(50);
  expect(result.vectoringYawMomentNm).toBeGreaterThan(200);
});

runTest("DifferentialPhysics", "Applies 1.5-way LSD locking ratio on acceleration vs coast", () => {
  const accelLsd = calculateEDiffTorqueSplit(1500, 15, 0.8, 0, "1.5_way");
  const coastLsd = calculateEDiffTorqueSplit(-500, 15, 0.8, 0, "1.5_way");

  expect(accelLsd.lockupPercentage).toBe(60);
  expect(coastLsd.lockupPercentage).toBe(25); // Lower lock on coast prevents turn-in understeer
});

// ── Print Results ──
let passedCount = 0;
results.forEach((r, idx) => {
  if (r.passed) {
    passedCount++;
    console.log(`[${idx + 1}/${results.length}] ✅ PASS [${r.suite}] ${r.name} (${r.durationMs.toFixed(2)}ms)`);
  } else {
    console.log(`[${idx + 1}/${results.length}] ❌ FAIL [${r.suite}] ${r.name}: ${r.error}`);
  }
});

console.log("-------------------------------------------------");
console.log(`Results: ${passedCount} passed, ${results.length - passedCount} failed of ${results.length} tests.`);
console.log("=================================================");

if (passedCount !== results.length) {
  process.exit(1);
}
