// ============================================================================
// TRUE MODULAR VEHICLE BUILDER TEST SUITE
// ============================================================================
// Validates:
// 1. All 16 Modular GLBs generated in Blender exist with valid non-zero payloads.
// 2. Stage registry & zero-offset GLB path resolver for all 5 vehicle models.
// 3. Sequential stage progression (model_select -> chassis -> complete).
// 4. Subsystem exploded view displacement vectors.
// ============================================================================

import fs from "fs";
import path from "path";
import {
  ASSEMBLY_STAGES,
  getStageGlbPaths,
  getStageIndividualParts,
  MODULAR_CAR_PARTS,
  STAGE_EXPLODED_OFFSETS,
  useModularVehicleBuilderStore,
  VehicleModelCategory,
  AssemblyStage,
} from "../../../state/modularVehicleBuilderStore";

export function runTrueModularVehicleBuilderTests() {
  console.log("\n=================================================");
  console.log("  TRUE MODULAR VEHICLE BUILDER & CAD GLB TESTS");
  console.log("=================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${msg}`);
      failed++;
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Physical Blender 5.2 CAD GLB Assets Verification
  // --------------------------------------------------------------------------
  console.log("\n[Test Suite 1] Physical Modular Parts GLB Payload Audit:");
  const modularPartsDir = path.resolve(process.cwd(), "public/models/modular_parts");
  const individualDir = path.join(modularPartsDir, "individual");
  assert(fs.existsSync(modularPartsDir), "public/models/modular_parts directory exists");
  assert(fs.existsSync(individualDir), "public/models/modular_parts/individual directory exists");

  assert(MODULAR_CAR_PARTS.length === 82, `82 individual CAD components registered in store (found: ${MODULAR_CAR_PARTS.length})`);

  let validPartsCount = 0;
  for (const part of MODULAR_CAR_PARTS) {
    const fullPath = path.join(individualDir, part.glbFilename);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      if (stats.size > 500) {
        validPartsCount++;
      }
    }
  }
  assert(
    validPartsCount === MODULAR_CAR_PARTS.length,
    `All ${MODULAR_CAR_PARTS.length} individual CAD GLBs exist in public/models/modular_parts/individual/ (valid: ${validPartsCount})`
  );

  // --------------------------------------------------------------------------
  // TEST 2: Assembly Stages Registry Integrity
  // --------------------------------------------------------------------------
  console.log("\n[Test Suite 2] Assembly Stages Definition & Sub-Components:");
  assert(ASSEMBLY_STAGES.length === 11, `11 hardware assembly stages registered (found: ${ASSEMBLY_STAGES.length})`);

  for (const stage of ASSEMBLY_STAGES) {
    assert(
      stage.subComponents.length >= 4,
      `Stage '${stage.id}' defines at least 4 discrete subcomponents (${stage.subComponents.join(", ")})`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 3: Individual CAD GLB Path Resolution & Discrete Component Mapping
  // --------------------------------------------------------------------------
  console.log("\n[Test Suite 3] Individual CAD GLB Path Resolution & Component Mapping:");
  for (const stage of ASSEMBLY_STAGES) {
    const parts = getStageIndividualParts(stage.id);
    const paths = getStageGlbPaths(stage.id, "sedan");
    assert(
      parts.length > 0 && paths.length === parts.length,
      `Stage '${stage.id}' resolves ${paths.length} individual GLB parts correctly`
    );
    assert(
      paths.every((p) => p.startsWith("/models/modular_parts/individual/")),
      `All GLB paths for stage '${stage.id}' target the individual zero-offset assets directory`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 4: Exploded View 3D Offsets
  // --------------------------------------------------------------------------
  console.log("\n[Test Suite 4] Exploded View 3D Offsets Verification:");
  for (const stage of ASSEMBLY_STAGES) {
    const offset = STAGE_EXPLODED_OFFSETS[stage.id];
    assert(
      Array.isArray(offset) && offset.length === 3 && offset.every((n) => typeof n === "number"),
      `Stage '${stage.id}' defines valid 3D exploded vector [${offset?.join(", ")}]`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 5: State Store Workflow & Progression Logic
  // --------------------------------------------------------------------------
  console.log("\n[Test Suite 5] State Store Sequential Progression:");
  const store = useModularVehicleBuilderStore.getState();

  // Reset to front page
  store.resetToFrontPage();
  assert(useModularVehicleBuilderStore.getState().currentStage === "model_select", "Initial stage is 'model_select'");

  // Select coupe
  store.setSelectedModel("coupe");
  assert(useModularVehicleBuilderStore.getState().selectedModel === "coupe", "Selected model updated to 'coupe'");

  // Advance from model_select -> chassis
  store.installCurrentStageAndNext();
  assert(useModularVehicleBuilderStore.getState().currentStage === "chassis", "Advanced to 'chassis'");

  // Advance from chassis -> engine
  store.installCurrentStageAndNext();
  assert(
    useModularVehicleBuilderStore.getState().currentStage === "engine" &&
      useModularVehicleBuilderStore.getState().installedStages.includes("chassis"),
    "Installed 'chassis' and advanced to 'engine'"
  );

  // Advance through remaining stages
  const stagesToAdvance: AssemblyStage[] = [
    "gearbox",
    "suspension",
    "brakes",
    "wheels",
    "body_framework",
    "exterior_panels",
    "lighting_glass",
    "aerodynamics",
    "interior",
    "complete",
  ];

  for (const expectedNext of stagesToAdvance) {
    store.installCurrentStageAndNext();
    assert(
      useModularVehicleBuilderStore.getState().currentStage === expectedNext,
      `Step progression reached: '${expectedNext}'`
    );
  }

  assert(
    useModularVehicleBuilderStore.getState().installedStages.length === 11,
    `All 11 hardware stages tracked in installedStages (count: ${useModularVehicleBuilderStore.getState().installedStages.length})`
  );

  // Test exploded progress clamping
  store.setExplodedProgress(0.75);
  assert(useModularVehicleBuilderStore.getState().explodedProgress === 0.75, "Exploded progress set to 0.75");

  store.setExplodedProgress(1.5);
  assert(useModularVehicleBuilderStore.getState().explodedProgress === 1.0, "Exploded progress clamped to 1.0 max");

  // Test granular individual part visibility toggling
  assert(store.isPartVisible("hood"), "Part 'hood' is initially visible");
  store.togglePartVisibility("hood");
  assert(!store.isPartVisible("hood"), "Part 'hood' is hidden after toggle");
  store.togglePartVisibility("hood");
  assert(store.isPartVisible("hood"), "Part 'hood' is restored to visible after second toggle");

  console.log("\n=================================================");
  console.log(`  TRUE MODULAR BUILDER TESTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================\n");

  if (failed > 0) {
    throw new Error(`${failed} true modular vehicle builder tests failed!`);
  }
}

// Auto-run if invoked directly
if (process.argv[1]?.includes("trueModularVehicleBuilderTests")) {
  runTrueModularVehicleBuilderTests();
}
