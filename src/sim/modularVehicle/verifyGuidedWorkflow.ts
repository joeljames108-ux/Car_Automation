import { useGuidedEngineeringStore } from "../../state/guidedEngineeringStore";
import { emptyDesign } from "../constants";
import { simulate } from "../engine";

console.log("===============================================================================");
console.log("RUNNING ZERO-STATE & MANDATORY SEQUENTIAL WORKFLOW VERIFICATION SUITE");
console.log("===============================================================================\n");

let passedCount = 0;
let totalCount = 0;

function assert(condition: boolean, testName: string) {
  totalCount++;
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    process.exitCode = 1;
  }
}

// -----------------------------------------------------------------------------
// TEST 1: Initial Launch Zero-State Requirements
// -----------------------------------------------------------------------------
console.log("--- 1. Testing Initial Launch Zero-State Defaults ---");
const initialDesign = emptyDesign();
assert(initialDesign.engine.layout === "unconfigured", "Default engine layout is 'unconfigured'");
assert(initialDesign.vehicle.platform === "unconfigured", "Default vehicle platform is 'unconfigured'");
assert(initialDesign.vehicle.exterior.bodyType === "unconfigured", "Default bodyType is 'unconfigured'");
assert(initialDesign.engine.bore === 0 && initialDesign.engine.stroke === 0, "Displacement parameters are 0");

const store = useGuidedEngineeringStore.getState();
store.resetAllStages();

assert(useGuidedEngineeringStore.getState().engineStatus === "unconfigured", "Engine stage status starts as 'unconfigured'");
assert(useGuidedEngineeringStore.getState().vehicleStatus === "unconfigured", "Vehicle stage status starts as 'unconfigured'");
assert(useGuidedEngineeringStore.getState().aeroStatus === "unconfigured", "Aero stage status starts as 'unconfigured'");
assert(useGuidedEngineeringStore.getState().interiorStatus === "unconfigured", "Interior stage status starts as 'unconfigured'");
assert(useGuidedEngineeringStore.getState().finalBuildStatus === "unconfigured", "Final build stage status starts as 'unconfigured'");

// -----------------------------------------------------------------------------
// TEST 2: Simulation Zero-State Handling (No NaN or fake preselected stats)
// -----------------------------------------------------------------------------
console.log("\n--- 2. Testing Simulation Zero-State Output ---");
const zeroSim = simulate(initialDesign);
assert(zeroSim.peakPower === 0, "Peak power is 0 for unconfigured engine");
assert(zeroSim.peakTorque === 0, "Peak torque is 0 for unconfigured engine");
assert(zeroSim.isConfigured === false, "Simulation correctly flags isConfigured: false");
assert(!isNaN(zeroSim.peakPower) && !isNaN(zeroSim.weight), "Simulation produces no NaNs in zero-state");

// -----------------------------------------------------------------------------
// TEST 3: Initial Stage Gating (Stage 1 unlocked, Stages 2-5 strictly locked)
// -----------------------------------------------------------------------------
console.log("\n--- 3. Testing Initial Stage Access Gating ---");
const gateEngine = store.canEnterStage("engine");
assert(gateEngine.allowed === true, "Stage 1 (Engine) is accessible from launch");

const gateVehicle = store.canEnterStage("vehicle");
assert(gateVehicle.allowed === false, "Stage 2 (Vehicle) is blocked when engine is unconfigured");
assert(gateVehicle.requiredStage === "engine", "Stage 2 rejection specifies 'engine' as required prerequisite");

const gateAero = store.canEnterStage("aero");
assert(gateAero.allowed === false, "Stage 3 (Aero) is blocked initially");

const gateInterior = store.canEnterStage("interior");
assert(gateInterior.allowed === false, "Stage 4 (Interior) is blocked initially");

const gateFinal = store.canEnterStage("final_build");
assert(gateFinal.allowed === false, "Stage 5 (Final Build) is blocked initially");

// -----------------------------------------------------------------------------
// TEST 4: Forward Tab Skipping Prevention
// -----------------------------------------------------------------------------
console.log("\n--- 4. Testing Forward Skipping Prevention ---");
// Trying to jump ahead directly
store.setActiveWorkflowStage("final_build");
assert(useGuidedEngineeringStore.getState().activeWorkflowStage === "engine", "Jumping to final_build when unconfigured was rejected");

store.setActiveWorkflowStage("aero");
assert(useGuidedEngineeringStore.getState().activeWorkflowStage === "engine", "Jumping to aero when unconfigured was rejected");

// -----------------------------------------------------------------------------
// TEST 5: Sequential Progression (Engine -> Vehicle -> Aero -> Interior -> Final)
// -----------------------------------------------------------------------------
console.log("\n--- 5. Testing Sequential Unlocking Flow ---");
// Mark Stage 1 complete
store.markStageComplete("engine");
assert(useGuidedEngineeringStore.getState().engineStatus === "configured", "Engine marked as 'configured'");
assert(store.canEnterStage("vehicle").allowed === true, "Vehicle is now unlocked after engine configuration");
assert(store.canEnterStage("aero").allowed === false, "Aero remains locked because vehicle is not yet configured");

// Mark Stage 2 complete
store.markStageComplete("vehicle");
assert(useGuidedEngineeringStore.getState().vehicleStatus === "configured", "Vehicle marked as 'configured'");
assert(store.canEnterStage("aero").allowed === true, "Aero is now unlocked after vehicle configuration");
assert(store.canEnterStage("interior").allowed === false, "Interior remains locked because aero is not yet configured");

// Mark Stage 3 complete
store.markStageComplete("aero");
assert(useGuidedEngineeringStore.getState().aeroStatus === "configured", "Aero marked as 'configured'");
assert(store.canEnterStage("interior").allowed === true, "Interior is now unlocked after aero configuration");
assert(store.canEnterStage("final_build").allowed === false, "Final Build remains locked because interior is not yet configured");

// Mark Stage 4 complete
store.markStageComplete("interior");
assert(useGuidedEngineeringStore.getState().interiorStatus === "configured", "Interior marked as 'configured'");
assert(store.canEnterStage("final_build").allowed === true, "Final Build is now unlocked after interior configuration");

// Mark Stage 5 complete
store.markStageComplete("final_build");
assert(useGuidedEngineeringStore.getState().finalBuildStatus === "configured", "Final Build marked as 'configured'");

// -----------------------------------------------------------------------------
// TEST 6: Backward Navigation Freedom
// -----------------------------------------------------------------------------
console.log("\n--- 6. Testing Backward Navigation Freedom ---");
assert(store.canEnterStage("engine").allowed === true, "Backward navigation to Stage 1 (Engine) is permitted");
assert(store.canEnterStage("vehicle").allowed === true, "Backward navigation to Stage 2 (Vehicle) is permitted");
assert(store.canEnterStage("aero").allowed === true, "Backward navigation to Stage 3 (Aero) is permitted");
assert(store.canEnterStage("interior").allowed === true, "Backward navigation to Stage 4 (Interior) is permitted");

// -----------------------------------------------------------------------------
// TEST 7: Upstream Invalidation & Recalculation Dependency Tracking
// -----------------------------------------------------------------------------
console.log("\n--- 7. Testing Upstream Invalidation Cascade ---");
store.notifyEngineModified();
assert(useGuidedEngineeringStore.getState().vehicleStatus === "invalidated", "Modifying engine marks vehicle as 'invalidated'");
assert(useGuidedEngineeringStore.getState().aeroStatus === "invalidated", "Modifying engine marks aero as 'invalidated'");
assert(useGuidedEngineeringStore.getState().finalBuildStatus === "invalidated", "Modifying engine marks final_build as 'invalidated'");
// Invalidation still allows navigation for re-tuning
assert(store.canEnterStage("vehicle").allowed === true, "Vehicle can still be entered to recalculate after engine modification");

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log("\n===============================================================================");
console.log(`WORKFLOW SUITE SUMMARY: ${passedCount}/${totalCount} TESTS PASSED`);
console.log("===============================================================================");
if (passedCount === totalCount) {
  console.log("🎉 ALL ZERO-STATE AND MANDATORY SEQUENTIAL WORKFLOW VERIFICATION TESTS PASSED!\n");
} else {
  process.exit(1);
}
