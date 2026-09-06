// ============================================================================
// VEHICLE OUTLINER HIERARCHY & NAMING CONVENTIONS — UNIT TEST SUITE
// ============================================================================

import {
  OUTLINER_COLLECTIONS,
  OUTLINER_NODE_CATALOG,
  getVehicleOutlinerHierarchy,
  parseOutlinerNodeName,
  validateOutlinerNodeName,
  formatOutlinerNodeName,
  GLB_EXPORT_FILTER_RULES,
  OutlinerCollectionId,
} from "../vehicleOutlinerSchema";
import { VehicleCategory } from "../vehicleArchitectureTypes";

export function runVehicleOutlinerTests(): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, msg: string) => {
    if (condition) {
      console.log(`  [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${msg}`);
      failed++;
    }
  };

  console.log("\n=======================================================");
  console.log("  3D VEHICLE OUTLINER HIERARCHY & NAMING TESTS");
  console.log("=======================================================");

  // ── TEST 1: 7 Outliner Collections Integrity ──
  console.log("\n--- TEST 1: 7-Collection Hierarchy Structure ---");
  const expectedColIds: OutlinerCollectionId[] = [
    "00_Reference",
    "01_Body_Main",
    "02_Bumpers_Aero",
    "03_Glass_Greenhouse",
    "04_Lighting",
    "05_Exterior_Hardware",
    "06_Running_Gear",
  ];

  expectedColIds.forEach((id, idx) => {
    const colDef = OUTLINER_COLLECTIONS[id];
    assert(colDef !== undefined, `Collection '${id}' is registered`);
    assert(colDef.order === idx, `Collection '${id}' has correct sort order index ${idx}`);
    assert(colDef.name.length > 0, `Collection '${id}' has display name: "${colDef.name}"`);
  });

  // Test special collection traits
  assert(
    !OUTLINER_COLLECTIONS["00_Reference"].isRenderable &&
    !OUTLINER_COLLECTIONS["00_Reference"].isGlbExportable,
    "00_Reference collection is non-renderable and non-exportable in GLB visual passes"
  );
  assert(
    OUTLINER_COLLECTIONS["03_Glass_Greenhouse"].shaderPass === "glass_transmission",
    "03_Glass_Greenhouse uses glass_transmission transparent shader pass"
  );
  assert(
    OUTLINER_COLLECTIONS["04_Lighting"].shaderPass === "lighting_emissive",
    "04_Lighting uses lighting_emissive shader pass"
  );

  // ── TEST 2: Platform Master Roots across Categories ──
  console.log("\n--- TEST 2: Platform Master Roots across Categories ---");
  const categories: VehicleCategory[] = ["sedan", "hatchback", "crossover", "suv"];
  const expectedRoots: Partial<Record<VehicleCategory, string>> = {
    sedan: "Car_Sedan_Master",
    hatchback: "Car_Hatchback_Master",
    crossover: "Car_Crossover_Master",
    suv: "Car_SUV_Master",
  };

  categories.forEach((cat) => {
    const scene = getVehicleOutlinerHierarchy(cat);
    assert(scene.category === cat, `Scene category matches '${cat}'`);
    const expRoot = expectedRoots[cat] || "";
    assert(
      scene.masterRootCollection === expRoot || scene.masterRootCollection.toLowerCase() === expRoot.toLowerCase(),
      `Category '${cat}' root collection is "${scene.masterRootCollection}"`
    );
    assert(scene.collections.length === 7, `Category '${cat}' has all 7 sub-collections`);
    assert(scene.summary.totalNodes > 30, `Category '${cat}' generated ${scene.summary.totalNodes} outliner nodes`);
    assert(scene.summary.symmetricalNodesCount > 15, `Category '${cat}' has ${scene.summary.symmetricalNodesCount} symmetrical nodes`);
    assert(scene.summary.mirrorModifierCount > 10, `Category '${cat}' has ${scene.summary.mirrorModifierCount} mirror-modifier meshes`);
  });

  // ── TEST 3: Node Name Parsing & Symmetry Suffixes ──
  console.log("\n--- TEST 3: Node Name Parser & Symmetry Suffixes ---");

  // Dot notation (.L / .R)
  const leftFender = parseOutlinerNodeName("GEO_Fender_Front.L");
  assert(leftFender !== null, "GEO_Fender_Front.L parsed successfully");
  assert(leftFender?.side === "L", "GEO_Fender_Front.L side is 'L'");
  assert(leftFender?.symmetryNotation === "dot", "GEO_Fender_Front.L symmetry notation is 'dot'");
  assert(leftFender?.prefix === "GEO", "GEO_Fender_Front.L prefix is 'GEO'");
  assert(leftFender?.collectionId === "01_Body_Main", "GEO_Fender_Front.L mapped to 01_Body_Main");
  assert(leftFender?.mirrorTarget === "REF_Origin_Empty", "GEO_Fender_Front.L targets REF_Origin_Empty for mirror modifier");

  const rightDoor = parseOutlinerNodeName("GEO_Door_Front.R");
  assert(rightDoor !== null && rightDoor.side === "R", "GEO_Door_Front.R parsed with side='R'");

  // Underscore notation (_L / _R)
  const leftDoorUnderscore = parseOutlinerNodeName("SM_Door_Rear_L");
  assert(leftDoorUnderscore !== null, "SM_Door_Rear_L parsed successfully");
  assert(leftDoorUnderscore?.side === "L", "SM_Door_Rear_L side is 'L'");
  assert(leftDoorUnderscore?.symmetryNotation === "underscore", "SM_Door_Rear_L symmetry notation is 'underscore'");
  assert(leftDoorUnderscore?.prefix === "SM", "SM_Door_Rear_L prefix is 'SM'");

  // Centerline components
  const hood = parseOutlinerNodeName("GEO_Hood");
  assert(hood !== null && hood.side === "CENTER", "GEO_Hood is side='CENTER'");
  assert(hood?.symmetryNotation === "none", "GEO_Hood has symmetryNotation='none'");

  const windshield = parseOutlinerNodeName("GEO_Windshield");
  assert(windshield !== null && windshield.collectionId === "03_Glass_Greenhouse", "GEO_Windshield mapped to 03_Glass_Greenhouse");
  assert(windshield?.shaderPass === "glass_transmission", "GEO_Windshield has glass_transmission shader pass");

  // Reference blueprints & empties
  const bpTop = parseOutlinerNodeName("REF_Blueprint_Top");
  assert(bpTop !== null && bpTop.collectionId === "00_Reference", "REF_Blueprint_Top mapped to 00_Reference");
  assert(bpTop?.prefix === "REF", "REF_Blueprint_Top prefix is 'REF'");
  assert(bpTop?.isGlbExportable === false, "REF_Blueprint_Top is non-exportable");

  // Collision meshes
  const colBumper = parseOutlinerNodeName("COL_Bumper_Front");
  assert(colBumper !== null && colBumper.prefix === "COL", "COL_Bumper_Front parsed with prefix='COL'");
  assert(colBumper?.isGlbExportable === false, "COL_Bumper_Front is non-exportable in visual passes");

  // ── TEST 4: Panel Seam Vertex Group Alignment ──
  console.log("\n--- TEST 4: Panel Seam Vertex Group Continuity ---");
  const hoodParsed = parseOutlinerNodeName("GEO_Hood");
  const fenderParsed = parseOutlinerNodeName("GEO_Fender_Front.L");
  const doorFrontParsed = parseOutlinerNodeName("GEO_Door_Front.L");

  assert(
    hoodParsed?.panelSeamGroups.includes("VG_PanelSeam_Front") === true,
    "GEO_Hood includes 'VG_PanelSeam_Front'"
  );
  assert(
    fenderParsed?.panelSeamGroups.includes("VG_PanelSeam_Front") === true,
    "GEO_Fender_Front.L includes 'VG_PanelSeam_Front' (shared edge seam with Hood)"
  );
  assert(
    fenderParsed?.panelSeamGroups.includes("VG_PanelSeam_Door_Front") === true,
    "GEO_Fender_Front.L includes 'VG_PanelSeam_Door_Front' (shared edge seam with Door Front)"
  );
  assert(
    doorFrontParsed?.panelSeamGroups.includes("VG_PanelSeam_Door_Front") === true,
    "GEO_Door_Front.L includes 'VG_PanelSeam_Door_Front' (shared edge seam with Front Fender)"
  );

  // ── TEST 5: Strict Validator Diagnostic Output ──
  console.log("\n--- TEST 5: Strict Validator Diagnostic Output ---");
  const validReport = validateOutlinerNodeName("GEO_Fender_Front.L");
  assert(validReport.isValid === true, "Valid node name returns isValid=true");
  assert(validReport.errors.length === 0, "Valid node name returns 0 errors");

  const emptyReport = validateOutlinerNodeName("");
  assert(emptyReport.isValid === false, "Empty string returns isValid=false");
  assert(emptyReport.errors.length > 0, "Empty string returns descriptive error");

  const warningReport = validateOutlinerNodeName("RandomLooseMesh");
  assert(warningReport.warnings.length > 0, "Non-standard name produces diagnostic warning");

  // ── TEST 6: GLB Export Filtering Rules ──
  console.log("\n--- TEST 6: GLB Export Filtering Pipeline Rules ---");
  assert(GLB_EXPORT_FILTER_RULES.length >= 3, "At least 3 GLB export filtering rules configured");

  const excludeRefRule = GLB_EXPORT_FILTER_RULES.find((r) => r.filterName === "Exclude References");
  assert(excludeRefRule !== undefined, "Exclude References rule exists");
  if (excludeRefRule && bpTop) {
    assert(excludeRefRule.predicate(bpTop) === true, "REF_Blueprint_Top matched for exclusion");
  }

  const excludeColRule = GLB_EXPORT_FILTER_RULES.find((r) => r.filterName === "Exclude Collision Meshes");
  assert(excludeColRule !== undefined, "Exclude Collision Meshes rule exists");
  if (excludeColRule && colBumper) {
    assert(excludeColRule.predicate(colBumper) === true, "COL_Bumper_Front matched for exclusion");
  }

  const includeVisualRule = GLB_EXPORT_FILTER_RULES.find((r) => r.filterName === "Include Visual Geometry");
  assert(includeVisualRule !== undefined, "Include Visual Geometry rule exists");
  if (includeVisualRule && leftFender) {
    assert(includeVisualRule.predicate(leftFender) === true, "GEO_Fender_Front.L matched for inclusion in visual GLB");
  }

  console.log("-------------------------------------------------------");
  console.log(`Outliner Tests: ${passed} passed, ${failed} failed.`);
  console.log("=======================================================");

  return { passed, failed };
}
