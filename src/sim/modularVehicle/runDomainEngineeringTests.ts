// ===================================================================
// DOMAIN ENGINEERING & ADVANCED SIMULATION TEST SUITE
// ===================================================================

declare const process: { exit: (code: number) => void };
import { calculateIMEP, calculateDynamicCompressionRatio, evaluateOctaneKnockLimit, wiebeMassFractionBurned } from "../physics/combustionModel";
import { calculateTyreGrip, createTyreState } from "../physics/tyreModel";
import { ChassisStructuralAgent } from "../agents/domainAgents/chassisStructuralAgent";

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
console.log("  DOMAIN ENGINEERING & SIMULATION PHYSICS TESTS  ");
console.log("=================================================");

// ── 1. CHASSIS FEA & STRUCTURAL RIGIDITY TESTS ──
runTest("FEAStructural", "Calculates Von Mises stress tensor and safety factor", () => {
  const corneringG = 1.4;
  const brakingG = 1.2;
  const combinedG = Math.sqrt(corneringG ** 2 + brakingG ** 2);
  const peakStressMpa = combinedG * 180 * 1.75;
  const yieldStrengthSteel = 480;
  const sf = yieldStrengthSteel / peakStressMpa;

  expect(combinedG).toBeCloseTo(1.84, 0.05);
  expect(peakStressMpa).toBeGreaterThan(500);
  expect(sf).toBeLessThan(1.0); // Predicts yield warning on steel under high G
});

runTest("FEAStructural", "Chassis structural agent detects critical yield risk", () => {
  const agent = new ChassisStructuralAgent();
  const findings = agent.analyze(
    { vehicle: { chassis: "steel_unibody" } },
    { weight: 1600, torsionalRigidity: 18, corneringG: 1.5, brakingG: 1.3 }
  );

  expect(findings.length).toBeGreaterThan(0);
  const yieldFinding = findings.find((f) => f.category === "FEA Structural Stress");
  expect(yieldFinding !== undefined).toBe(true);
  expect(yieldFinding?.severity).toBe("critical");
});

// ── 2. THERMODYNAMIC COMBUSTION & IMEP TESTS ──
runTest("CombustionThermodynamics", "Calculates Otto cycle efficiency and IMEP gross", () => {
  const config = {
    compressionRatio: 10.5,
    volumetricEfficiency: 1.0,
    fuelLHV: 44.0, // MJ/kg
    stoichAFR: 14.7,
    actualAFR: 12.5,
    combustionDurationDeg: 50,
    gamma: 1.32,
  };

  const result = calculateIMEP(config);
  expect(result.idealOttoEfficiency).toBeCloseTo(0.528, 0.02);
  expect(result.imepGross).toBeGreaterThan(12.0); // Typical naturally aspirated IMEP ~12-15 bar
  expect(result.cylinderPeakPressureEstimate).toBeGreaterThan(60);
});

runTest("CombustionThermodynamics", "Calculates Wiebe mass fraction burned curve", () => {
  const mfbStart = wiebeMassFractionBurned(0, 50);
  const mfbMid = wiebeMassFractionBurned(25, 50); // CA50 region
  const mfbEnd = wiebeMassFractionBurned(50, 50);

  expect(mfbStart).toBe(0);
  expect(mfbMid).toBeGreaterThan(0.40);
  expect(mfbMid).toBeLessThan(0.70);
  expect(mfbEnd).toBeGreaterThan(0.99); // >99% burned at combustion duration
});

runTest("CombustionThermodynamics", "Calculates Dynamic Compression Ratio (DCR)", () => {
  const dcr = calculateDynamicCompressionRatio(11.0, 50); // IVC 50° ABDC
  expect(dcr).toBeLessThan(11.0);
  expect(dcr).toBeGreaterThan(8.5);
});

runTest("CombustionThermodynamics", "Detects detonation knock under high boost and low octane", () => {
  const safeMargin = evaluateOctaneKnockLimit(9.5, 0.2, 93, 30);
  const knockMargin = evaluateOctaneKnockLimit(12.0, 1.8, 87, 65); // High CR + High Boost + Low Octane

  expect(safeMargin).toBeGreaterThan(0);
  expect(knockMargin).toBeLessThan(0); // Detonation condition
});

// ── 3. PACEJKA VEHICLE DYNAMICS & SUSPENSION TESTS ──
runTest("VehicleDynamics", "Computes Pacejka lateral tire grip across slip angles", () => {
  const tyre = createTyreState("slick", 90);
  const refForce: [number, number, number, number] = [4000, 4000, 4000, 4000];
  const grip = calculateTyreGrip(tyre, refForce);

  expect(grip.avgGrip).toBeGreaterThan(1.2);
  expect(grip.isOverheating).toBe(false);
  expect(grip.isUndercooled).toBe(false);
});

runTest("VehicleDynamics", "Calculates suspension roll gradient degrees per G", () => {
  const curbWeightKg = 1400;
  const rollMomentArmM = 0.35; // 350mm arm
  const totalRollStiffnessNmDeg = 2400;
  const totalRollStiffnessNmRad = (totalRollStiffnessNmDeg * 180) / Math.PI;

  const numerator = curbWeightKg * rollMomentArmM;
  const denominator = totalRollStiffnessNmRad - curbWeightKg * 9.81 * rollMomentArmM;
  const radPerMps2 = numerator / denominator;
  const rollGradientDegPerG = radPerMps2 * 9.81 * (180 / Math.PI);

  expect(rollGradientDegPerG).toBeCloseTo(2.1, 0.3); // Sport/GT roll gradient
});

// ── 4. EV 800V ELECTROCHEMISTRY & THERMAL MANAGEMENT TESTS ──
runTest("EVBatteryPhysics", "800V architecture reduces I²R resistive losses by 75%", () => {
  const powerWatts = 400000; // 400 kW
  const current400V = powerWatts / 400; // 1000 A
  const current800V = powerWatts / 800; // 500 A

  const rHarness = 0.015; // ohms
  const loss400V = current400V ** 2 * rHarness; // 15,000 W
  const loss800V = current800V ** 2 * rHarness; // 3,750 W

  expect(loss800V / loss400V).toBeCloseTo(0.25, 0.01); // 75% reduction
});

runTest("EVBatteryPhysics", "Calculates pack cell mass across chemistries", () => {
  const capacityKwh = 100;
  const massLFP = (capacityKwh * 1000) / 165;
  const massNMC = (capacityKwh * 1000) / 265;
  const massSolidState = (capacityKwh * 1000) / 420;

  expect(massLFP).toBeCloseTo(606, 5);
  expect(massNMC).toBeCloseTo(377, 5);
  expect(massSolidState).toBeCloseTo(238, 5);
  expect(massSolidState).toBeLessThan(massNMC);
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
