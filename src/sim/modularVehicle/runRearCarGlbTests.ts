// ===================================================================
// HYPERCAR REAR ASSEMBLY 3D GLB & AERO PHYSICS TEST SUITE
// ===================================================================

import * as fs from "fs";
import * as path from "path";
import { buildRearCarScene } from "./generateRearCarGlb";
import { Car3DGlbAssetRegistry } from "../../exterior3d/geometry/car3dGlbAssetRegistry";

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
    toBeTruthy() {
      if (!actual) throw new Error(`Expected truthy value but got ${actual}`);
    },
    toBeGreaterThan(expected: number) {
      if (actual <= expected) throw new Error(`Expected ${actual} to be > ${expected}`);
    },
  };
}

console.log("=================================================");
console.log("   HYPERCAR REAR GLB & AERO ASSEMBLY TESTS       ");
console.log("=================================================");

// ── 1. 3D SCENE GRAPH STRUCTURAL INTEGRITY ──
runTest("RearSceneGraph", "Validates presence of all 6 master rear subassemblies", () => {
  const scene = buildRearCarScene(0);
  expect(scene.name).toBe("Hypercar_Rear_Assembly_Master");

  const rearRoot = scene.getObjectByName("Rear_Car_Master_Assembly");
  expect(rearRoot).toBeTruthy();

  const expectedSubassemblies = [
    "01_Rear_Bodywork_Shell",
    "02_Active_SwanNeck_Rear_Wing",
    "03_Underbody_Venturi_Diffuser",
    "04_OLED_Rear_Lighting_System",
    "05_Quad_Titanium_Exhaust_System",
    "06_Rear_Chassis_Suspension_Drivetrain",
  ];

  expectedSubassemblies.forEach((subName) => {
    const subObj = scene.getObjectByName(subName);
    expect(subObj).toBeTruthy();
  });
});

// ── 2. EXPLODED KINEMATICS DISPLACEMENT ──
runTest("ExplodedKinematics", "Verifies Z/Y exploded view coordinate separation for rear wing and diffuser", () => {
  const assembledScene = buildRearCarScene(0);
  const explodedScene = buildRearCarScene(0.5);

  const assembledWing = assembledScene.getObjectByName("02_Active_SwanNeck_Rear_Wing");
  const explodedWing = explodedScene.getObjectByName("02_Active_SwanNeck_Rear_Wing");

  expect(assembledWing).toBeTruthy();
  expect(explodedWing).toBeTruthy();

  if (assembledWing && explodedWing) {
    expect(explodedWing.position.z).toBeGreaterThan(assembledWing.position.z);
    expect(explodedWing.position.y).toBeGreaterThan(assembledWing.position.y);
  }
});

// ── 3. ASSET REGISTRY INTEGRATION ──
runTest("AssetRegistry", "Confirms HYPERCAR_REAR_ASSEMBLY definition in Car3DGlbAssetRegistry", () => {
  const assetDef = Car3DGlbAssetRegistry.getAsset("HYPERCAR_REAR_ASSEMBLY");
  expect(assetDef.id).toBe("HYPERCAR_REAR_ASSEMBLY");
  expect(assetDef.assetPath).toBe("/models/exterior/rear_car_assembly.glb");
  expect(assetDef.category).toBe("SUPERCAR");
  expect(assetDef.suggestedCameraRadius).toBe(3.5);
});

// ── 4. GLB BINARY FILE PERSISTENCE ──
runTest("GlbFilePersistence", "Verifies exported .glb files exist on disk with valid byte sizes", () => {
  const exteriorDir = path.resolve("public/models/exterior");
  const requiredGlbFiles = [
    "rear_car_assembly.glb",
    "rear_bumper.glb",
    "rear_diffuser.glb",
    "rear_wing.glb",
    "taillights.glb",
  ];

  requiredGlbFiles.forEach((file) => {
    const filePath = path.join(exteriorDir, file);
    expect(fs.existsSync(filePath)).toBeTruthy();
    const stats = fs.statSync(filePath);
    expect(stats.size).toBeGreaterThan(1000); // Must be > 1KB
  });
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
