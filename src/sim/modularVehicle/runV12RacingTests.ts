// ===================================================================
// RACING-SPEC 60° V12 ENGINE & POWERTRAIN PHYSICS TEST SUITE
// ===================================================================

declare const process: { exit: (code: number) => void };

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
  } catch (err: any) {
    results.push({ suite, name, passed: false, durationMs: performance.now() - start, error: err.message });
  }
}

function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) throw new Error(`Expected ${expected} but got ${actual}`);
    },
    toBeCloseTo(expected: number, delta: number = 0.05) {
      if (Math.abs(actual - expected) > delta) {
        throw new Error(`Expected ${actual} to be close to ${expected} within ${delta}`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (actual <= expected) throw new Error(`Expected ${actual} to be > ${expected}`);
    },
    toBeLessThan(expected: number) {
      if (actual >= expected) throw new Error(`Expected ${actual} to be < ${expected}`);
    },
  };
}

console.log("=================================================");
console.log("  RACING-SPEC 60° V12 & DRY-SUMP PHYSICS TESTS   ");
console.log("=================================================");

// ── 1. 60° V12 FIRING INTERVAL & INERTIAL HARMONIC BALANCE ──
runTest("V12Kinematics", "Validates 60-degree even firing interval across 12 cylinders", () => {
  const numCyls = 12;
  const fourStrokeDegrees = 720;
  const firingInterval = fourStrokeDegrees / numCyls;

  expect(firingInterval).toBe(60); // Exactly 60° crank rotation per power pulse

  // 1-12-5-8-3-10-6-7-2-11-4-9 Standard 60° V12 Firing Order
  const firingOrder = [1, 12, 5, 8, 3, 10, 6, 7, 2, 11, 4, 9];
  expect(firingOrder.length).toBe(12);
  const uniqueCyls = new Set(firingOrder);
  expect(uniqueCyls.size).toBe(12);
});

runTest("V12Kinematics", "Evaluates mean piston speed at 11,000 RPM redline", () => {
  const strokeM = 0.075; // 75.0mm stroke for 6.5L V12 (88mm bore x 75mm stroke)
  const maxRpm = 11000;

  // Mean Piston Speed Up = 2 * Stroke * RPM / 60 (m/s)
  const meanPistonSpeedMs = (2 * strokeM * maxRpm) / 60;

  expect(meanPistonSpeedMs).toBeCloseTo(27.5, 0.1); // ~27.5 m/s (Formula 1 level piston speed)
  expect(meanPistonSpeedMs).toBeLessThan(30.0); // Below titanium fatigue limit
});

// ── 2. DRY-SUMP MULTI-STAGE OIL SYSTEM DEPRESSION ──
runTest("DrySumpDynamics", "Calculates 4-stage scavenge pump flow ratio vs pressure feed", () => {
  const pressurePumpFlowLpm = 45; // 45 Liters/min engine feed
  const scavengeStage1 = 38;
  const scavengeStage2 = 38;
  const scavengeStage3 = 38;
  const scavengeStage4 = 38;

  const totalScavengeFlowLpm = scavengeStage1 + scavengeStage2 + scavengeStage3 + scavengeStage4;
  const scavengeRatio = totalScavengeFlowLpm / pressurePumpFlowLpm;

  expect(scavengeRatio).toBeGreaterThan(3.0); // >3.0x scavenge over-capacity pulls crankcase vacuum
  expect(totalScavengeFlowLpm).toBe(152);
});

// ── 3. 12 ITB INDIVIDUAL THROTTLE BODY RAM-AIR RESONANCE ──
runTest("ITBGasDynamics", "Computes Helmholtz intake ram acoustic resonant peak frequency", () => {
  const speedOfSound = 343; // m/s at 20°C
  const runnerLengthM = 0.24; // 240mm runner
  const runnerAreaM2 = Math.PI * Math.pow(0.026, 2); // 52mm diameter
  const cylDisplacementM3 = 0.0065 / 12; // 541.6 cc per cylinder

  // Fundamental Helmholtz Frequency f = (c / 2pi) * sqrt(A / (L * V))
  const resonantFreqHz = (speedOfSound / (2 * Math.PI)) * Math.sqrt(runnerAreaM2 / (runnerLengthM * cylDisplacementM3));

  // At 11,000 RPM, intake valve pulse frequency is 91.67 Hz (11,000 / 120)
  // Tuned 2nd-order acoustic harmonic ram peak occurs at 180 - 260 Hz
  expect(resonantFreqHz).toBeGreaterThan(180);
  expect(resonantFreqHz).toBeLessThan(260);
});

// ── 4. 7-SPEED SEQUENTIAL TRANSAXLE TRACTIVE EFFORT ──
runTest("TransaxleDynamics", "Calculates peak 1st gear wheel torque and tractive thrust", () => {
  const peakEngineTorqueNm = 750; // 750 Nm
  const firstGearRatio = 3.65;
  const finalDriveRatio = 3.44;
  const efficiency = 0.94;
  const wheelRadiusM = 0.33;

  // Wheel Torque = T_eng * R_1 * R_fd * eta
  const wheelTorqueNm = peakEngineTorqueNm * firstGearRatio * finalDriveRatio * efficiency;
  // Tractive Force = Wheel Torque / Wheel Radius (Newtons)
  const tractiveForceN = wheelTorqueNm / wheelRadiusM;

  expect(wheelTorqueNm).toBeGreaterThan(8000); // >8,000 Nm axle torque in 1st gear
  expect(tractiveForceN).toBeGreaterThan(25000); // >25 kN thrust launches car >1.4G
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
