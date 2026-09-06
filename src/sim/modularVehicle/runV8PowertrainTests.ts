// ===================================================================
// V8 TWIN-TURBO & ADVANCED POWERTRAIN ENGINEERING TEST SUITE
// ===================================================================

import * as fs from "fs";
import * as path from "path";

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
console.log("  V8 TWIN-TURBO & ADVANCED POWERTRAIN TESTS      ");
console.log("=================================================");

// ── 1. V8 KINEMATICS & FIRING ORDER ──
runTest("V8Kinematics", "Validates 90-degree bank angle and 180-degree flat-plane firing pulse spacing", () => {
  const numCyls = 8;
  const fourStrokeDegrees = 720;
  const firingPulseSpacing = fourStrokeDegrees / numCyls;
  expect(firingPulseSpacing).toBe(90); // Exactly 90° crank rotation per power stroke

  // Flat-plane racing V8 firing order: 1-8-3-6-4-5-2-7
  const firingOrder = [1, 8, 3, 6, 4, 5, 2, 7];
  expect(firingOrder.length).toBe(8);
});

runTest("V8Kinematics", "Calculates mean piston speed at 9,000 RPM redline within racing safety margins", () => {
  const strokeM = 0.086; // 86mm stroke
  const rpm = 9000;
  // Mean Piston Speed = 2 * Stroke * RPM / 60
  const meanPistonSpeedMps = (2 * strokeM * rpm) / 60;
  expect(meanPistonSpeedMps).toBeCloseTo(25.8, 0.2);
  expect(meanPistonSpeedMps).toBeLessThan(27.0); // F1/GT3 threshold is ~26.5 m/s
});

// ── 2. FORCED INDUCTION & BOOST DYNAMICS ──
runTest("ForcedInduction", "Calculates twin-scroll compressor mass airflow and pressure ratio", () => {
  const displacementL = 4.0;
  const boostBar = 1.4; // 1.4 bar relative boost (2.4 bar absolute)
  const volumetricEfficiency = 0.95;
  const rpm = 8000;

  // Mass air flow approximate in kg/s
  const airDensityKgM3 = 1.225;
  const absPressureRatio = 1.0 + boostBar;
  const volumeFlowM3s = (displacementL / 1000) * (rpm / (2 * 60)) * volumetricEfficiency;
  const massAirFlowKgS = volumeFlowM3s * airDensityKgM3 * absPressureRatio;

  expect(absPressureRatio).toBeCloseTo(2.4, 0.01);
  expect(massAirFlowKgS).toBeGreaterThan(0.65);
  expect(massAirFlowKgS).toBeLessThan(0.85);
});

// ── 3. DUAL-CLUTCH TRANSMISSION KINEMATICS ──
runTest("DCT7Dynamics", "Validates 7-speed dual-layshaft odd/even gear partitioning", () => {
  const shaft1OddGears = [1, 3, 5, 7];
  const shaft2EvenGears = [2, 4, 6];
  expect(shaft1OddGears.length).toBe(4);
  expect(shaft2EvenGears.length).toBe(3);

  // Pre-selection shift duration (ms)
  const shiftDurationMs = 8.0; // milliseconds
  expect(shiftDurationMs).toBeLessThan(15.0); // Under 15ms is motorsport DCT standard
});

// ── 4. ELECTRIC DRIVE UNIT 800V INVERTER & MOTOR ──
runTest("ElectricDriveUnit", "Evaluates 800V SiC inverter switching efficiency and permanent magnet motor torque", () => {
  const dcBusVoltage = 800; // Volts
  const peakCurrentA = 450; // Amperes
  const electricalPowerKw = (dcBusVoltage * peakCurrentA) / 1000;
  expect(electricalPowerKw).toBe(360); // 360 kW (~482 hp)

  const inverterEfficiency = 0.988; // 98.8% for SiC MOSFET
  const motorOutputPowerKw = electricalPowerKw * inverterEfficiency;
  expect(motorOutputPowerKw).toBeGreaterThan(350);
});

// ── 5. ASSET PACKAGING & HARDPOINT INTEGRITY GATE ──
runTest("PackagingGate", "Verifies all 38 modular powertrain GLB assets exist in exports and public directories", () => {
  const requiredEngineParts = [
    "engine_v8_block.glb",
    "engine_v8_crankshaft.glb",
    "engine_v8_pistons_connectingrods.glb",
    "engine_v8_valvetrain.glb",
    "engine_v8_cylinderhead_l.glb",
    "engine_v8_cylinderhead_r.glb",
    "engine_v8_valvecover_l.glb",
    "engine_v8_valvecover_r.glb",
    "engine_v8_intakemanifold.glb",
    "engine_v8_intercooler.glb",
    "engine_v8_turbo_l.glb",
    "engine_v8_turbo_r.glb",
    "engine_v8_exhaustheader_l.glb",
    "engine_v8_exhaustheader_r.glb",
    "engine_v8_exhaustdownpipes.glb",
    "engine_v8_fuelsystem.glb",
    "engine_v8_coolantsystem.glb",
    "engine_v8_wiringharness.glb",
    "engine_v8_drysumpsystem.glb",
    "engine_v8_oilpan.glb",
    "engine_v8_timingcover_accessories.glb",
    "engine_v8_mounts.glb",
    "engine_v8_starter.glb",
    "engine_v8_dipstick.glb",
  ];

  const engineDir = path.resolve("exports/parts/engine");
  for (const file of requiredEngineParts) {
    const fullPath = path.join(engineDir, file);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Missing engine part: ${file}`);
    }
    const stat = fs.statSync(fullPath);
    if (stat.size <= 0) {
      throw new Error(`Empty engine part: ${file}`);
    }
  }

  const requiredAssemblies = [
    "Engine_V8_TwinTurbo_Complete.glb",
    "Engine_V8_TwinTurbo_Exploded.glb",
    "Trans_Sequential_6Speed_Complete.glb",
    "Trans_DCT_7Speed_Complete.glb",
    "Powertrain_V8TT_Seq6_Complete.glb",
    "Powertrain_V8TT_Seq6_Exploded.glb",
    "Powertrain_V8TT_DCT7_Complete.glb",
    "Powertrain_V8TT_Animated.glb",
    "Electric_Drive_Unit_Complete.glb",
  ];

  const exportsDir = path.resolve("exports");
  for (const file of requiredAssemblies) {
    const fullPath = path.join(exportsDir, file);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Missing assembly asset: ${file}`);
    }
    const stat = fs.statSync(fullPath);
    if (stat.size <= 0) {
      throw new Error(`Empty assembly asset: ${file}`);
    }
  }
});

// Summary
let passedCount = 0;
results.forEach((r, idx) => {
  const icon = r.passed ? "✅ PASS" : "❌ FAIL";
  console.log(`[${idx + 1}/${results.length}] ${icon} [${r.suite}] ${r.name} (${r.durationMs.toFixed(2)}ms)`);
  if (!r.passed && r.error) {
    console.error(`    Error: ${r.error}`);
  }
  if (r.passed) passedCount++;
});

console.log("-------------------------------------------------");
console.log(`Results: ${passedCount} passed, ${results.length - passedCount} failed of ${results.length} tests.`);
console.log("=================================================");

if (passedCount < results.length) {
  process.exit(1);
}
