// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — UNIT TEST SUITE (PHASES 1 - 5)
// ============================================================================

import { F1PhysicsEngine } from "../physics/f1PhysicsEngine";
import { DEFAULT_F1_CAR } from "../chassis/defaultF1Car";
import { F1_OFFICIAL_CALENDAR } from "../season/f1Calendar";
import { F1_RIVAL_TEAMS } from "../season/f1RivalTeams";
import { F1ChampionshipEngine } from "../season/f1Championship";
import { F1ProgressTracker } from "../state/f1ProgressTracker";
import type { F1CarDesign } from "../types/f1Types";

console.log("\n================================================================");
console.log("RUNNING FORMULA 1 CONSTRUCTOR PHYSICS & CHAMPIONSHIP TEST SUITE");
console.log("================================================================");

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

// --- TEST 1: Baseline F1 Car Physics & Homologation ---
console.log("\n--- TEST 1: Baseline F1 Car Physics & Homologation ---");
const evaluatedBaseline = F1PhysicsEngine.evaluateCar(DEFAULT_F1_CAR);

assert(evaluatedBaseline.computedTotalMassKg >= 798, `Minimum vehicle mass meets FIA limit (got ${evaluatedBaseline.computedTotalMassKg} kg)`);
assert(evaluatedBaseline.computedTotalPeakHp >= 1000, `Total peak power exceeds 1,000 HP (got ${evaluatedBaseline.computedTotalPeakHp} HP)`);
assert(evaluatedBaseline.computedIcePeakHp >= 800, `ICE power exceeds 800 HP (got ${evaluatedBaseline.computedIcePeakHp} HP)`);
assert(evaluatedBaseline.computedErsPeakHp <= 161, `ERS output complies with 120 kW ceiling (got ${evaluatedBaseline.computedErsPeakHp} HP)`);
assert(evaluatedBaseline.computedTopSpeedKmh >= 340, `Top speed exceeds 340 km/h (got ${evaluatedBaseline.computedTopSpeedKmh} km/h)`);
assert(evaluatedBaseline.computedZeroToHundredSec <= 2.6, `0-100 km/h acceleration under 2.6s (got ${evaluatedBaseline.computedZeroToHundredSec}s)`);
assert(evaluatedBaseline.computedMaxCorneringGLat >= 5.0, `Peak cornering G exceeds 5.0G (got ${evaluatedBaseline.computedMaxCorneringGLat}G)`);
assert(evaluatedBaseline.computedMaxBrakingGLong >= 5.0, `Peak braking deceleration exceeds 5.0G (got ${evaluatedBaseline.computedMaxBrakingGLong}G)`);
assert(evaluatedBaseline.computedFiaHomologationScore === 100, `Baseline car passes 100% of FIA Scrutineering Checks`);

// --- TEST 2: Scrutineering Rule Enforcement ---
console.log("\n--- TEST 2: Scrutineering Rule Enforcement ---");
const illegalCar: F1CarDesign = {
  ...DEFAULT_F1_CAR,
  monocoque: { ...DEFAULT_F1_CAR.monocoque, totalMonocoqueMassKg: 70, ballastTungstenKg: 0 },
  powerUnit: { ...DEFAULT_F1_CAR.powerUnit, mguKPowerKw: 150 }, // Illegal >120 kW
  aero: { ...DEFAULT_F1_CAR.aero, rearWingDrsFlapGapOpenMm: 110 }, // Illegal >85mm
};
const illegalEvaluated = F1PhysicsEngine.evaluateCar(illegalCar);
assert(illegalEvaluated.computedTotalMassKg < 798, `Detected underweight car (${illegalEvaluated.computedTotalMassKg} kg)`);
assert(illegalEvaluated.computedFiaHomologationScore < 100, `Correctly penalized non-compliant car (score: ${illegalEvaluated.computedFiaHomologationScore}%)`);

const report = F1PhysicsEngine.runScrutineering(illegalEvaluated);
assert(!report.passedHomologation, `Scrutineering report flags failed homologation`);
assert(report.failedCount >= 2, `Report flags at least 2 critical failures (got ${report.failedCount})`);

// --- TEST 3: Subsystem Progress Tracker ---
console.log("\n--- TEST 3: Subsystem Progress Tracker ---");
const completionMap = F1ProgressTracker.calculateSubsystemProgress(evaluatedBaseline);
assert(completionMap.monocoque.isCompliant, `Monocoque studio status is compliant`);
assert(completionMap.powerunit.isCompliant, `Power unit studio status is compliant`);
assert(completionMap.aerodynamics.isCompliant, `Aero studio status is compliant`);
assert(completionMap.scrutineering.percentage === 100, `Scrutineering studio reports 100% completion`);

// --- TEST 4: 24-Race Calendar & Rival Grid Validation ---
console.log("\n--- TEST 4: 24-Race Calendar & Rival Grid Validation ---");
assert(F1_OFFICIAL_CALENDAR.length === 24, `Complete 24-Race World Championship calendar loaded`);
assert(F1_OFFICIAL_CALENDAR[0].id === "bahrain_sakhir", `Round 1 is Bahrain Grand Prix`);
assert(F1_OFFICIAL_CALENDAR[23].id === "uae_abudhabi", `Round 24 is Abu Dhabi Grand Prix`);
assert(F1_RIVAL_TEAMS.length === 10, `All 10 rival constructor teams defined with drivers`);

// --- TEST 5: Race Weekend Simulation Engine ---
console.log("\n--- TEST 5: Race Weekend Simulation Engine ---");
const simResult = F1ChampionshipEngine.simulateRaceWeekend(F1_OFFICIAL_CALENDAR[0], evaluatedBaseline, 98);
assert(simResult.results.length === 21, `Full grid of 21 drivers simulated (20 AI + 1 Player)`);
assert(simResult.results[0].position === 1, `Winner assigned P1`);
assert(simResult.results[0].pointsEarned === 25, `Winner awarded 25 championship points`);
assert(simResult.results[20].position === 21, `Last place assigned P21`);
assert(simResult.poleLapTimeSec > 60 && simResult.poleLapTimeSec < 120, `Realistic pole lap time (${simResult.poleLapTimeSec}s)`);

console.log("\n================================================================");
console.log(`FORMULA 1 CONSTRUCTOR TESTS: ${passed} passed, ${failed} failed.`);
console.log("================================================================\n");

if (failed > 0) {
  process.exit(1);
}
