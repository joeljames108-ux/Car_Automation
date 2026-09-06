// ============================================================================
// VEHICLE ARCHITECTURE SYSTEM — UNIT TEST SUITE
// ============================================================================

import {
  VEHICLE_ARCHITECTURE_REGISTRY,
  getVehicleArchitecture,
  getAllVehicleArchitectures,
} from "../vehicleArchitectureRegistry";
import { VehicleAssetValidator } from "../vehicleAssetValidator";
import { VehicleCategory, VehicleArchitectureConfig } from "../vehicleArchitectureTypes";
import * as fs from "fs";
import * as path from "path";

export function runVehicleArchitectureTests(): { passed: number; failed: number } {
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
  console.log("  VEHICLE ARCHITECTURE & ENGINEERING PLATFORM TESTS");
  console.log("=======================================================");

  const categories: VehicleCategory[] = ["sedan", "hatchback", "crossover", "suv"];

  // ── TEST 1: Registry Completeness ──
  console.log("\n--- TEST 1: Vehicle Platform Registry Completeness ---");
  categories.forEach((cat) => {
    const arch = getVehicleArchitecture(cat);
    assert(arch !== undefined && arch.id === cat, `Category '${cat}' correctly registered with id='${cat}'`);
    assert(arch.name.length > 0, `Category '${cat}' has descriptive name: "${arch.name}"`);
    assert(arch.architectureClass.length > 0, `Category '${cat}' has distinct architecture class: "${arch.architectureClass}"`);
  });

  // ── TEST 2: Distinct Non-Uniform Dimensions ──
  console.log("\n--- TEST 2: Distinct Non-Uniform Proportions & Dimensions ---");
  const sedan = getVehicleArchitecture("sedan");
  const hatch = getVehicleArchitecture("hatchback");
  const crossover = getVehicleArchitecture("crossover");
  const suv = getVehicleArchitecture("suv");

  // Wheelbase differentiation
  assert(hatch.wheelbaseMm < crossover.wheelbaseMm, `Hatchback WB (${hatch.wheelbaseMm}mm) < Crossover WB (${crossover.wheelbaseMm}mm)`);
  assert(crossover.wheelbaseMm < sedan.wheelbaseMm, `Crossover WB (${crossover.wheelbaseMm}mm) < Sedan WB (${sedan.wheelbaseMm}mm)`);
  assert(sedan.wheelbaseMm < suv.wheelbaseMm, `Sedan WB (${sedan.wheelbaseMm}mm) < SUV WB (${suv.wheelbaseMm}mm)`);

  // Ride height & clearance differentiation
  assert(hatch.rideHeightMm < crossover.rideHeightMm, `Hatchback clearance (${hatch.rideHeightMm}mm) < Crossover clearance (${crossover.rideHeightMm}mm)`);
  assert(crossover.rideHeightMm < suv.rideHeightMm, `Crossover clearance (${crossover.rideHeightMm}mm) < SUV clearance (${suv.rideHeightMm}mm)`);
  assert(suv.rideHeightMm >= 230, `SUV has heavy-duty ground clearance (>= 230mm, got ${suv.rideHeightMm}mm)`);

  // Overall height differentiation
  assert(sedan.overallHeightMm < hatch.overallHeightMm, `Sedan height (${sedan.overallHeightMm}mm) < Hatchback height (${hatch.overallHeightMm}mm)`);
  assert(hatch.overallHeightMm < crossover.overallHeightMm, `Hatchback height (${hatch.overallHeightMm}mm) < Crossover height (${crossover.overallHeightMm}mm)`);
  assert(crossover.overallHeightMm < suv.overallHeightMm, `Crossover height (${crossover.overallHeightMm}mm) < SUV height (${suv.overallHeightMm}mm)`);

  // Rear overhang differentiation (Hatchback short vs Sedan long trunk)
  assert(hatch.rearOverhangMm < sedan.rearOverhangMm, `Hatchback rear overhang (${hatch.rearOverhangMm}mm) < Sedan rear overhang (${sedan.rearOverhangMm}mm)`);
  assert(sedan.compatibleExteriorComponents.rearClosureType === "trunk_decklid", "Sedan uses 3-box trunk decklid closure");
  assert(hatch.compatibleExteriorComponents.rearClosureType === "rear_hatch", "Hatchback uses 2-box rear hatch closure");
  assert(crossover.compatibleExteriorComponents.rearClosureType === "crossover_tailgate", "Crossover uses tailgate closure");
  assert(suv.compatibleExteriorComponents.rearClosureType === "heavy_duty_liftgate", "SUV uses heavy-duty liftgate closure");

  // ── TEST 3: Physical GLB Asset Existence on Disk (All 24 Files) ──
  console.log("\n--- TEST 3: Dedicated 24 GLB Assets Verification on Disk ---");
  const projectRoot = process.cwd();
  const publicDir = path.join(projectRoot, "public");

  categories.forEach((cat) => {
    const arch = getVehicleArchitecture(cat);
    const assetKeys: (keyof typeof arch.assets)[] = [
      "chassisAsset",
      "bodyFrameworkAsset",
      "floorAsset",
      "wheelArchAsset",
      "hardpointAsset",
      "envelopeAsset",
    ];

    assetKeys.forEach((key) => {
      const relPath = arch.assets[key];
      const fullPath = path.join(publicDir, relPath.replace(/^\//, ""));
      const exists = fs.existsSync(fullPath);
      const sizeBytes = exists ? fs.statSync(fullPath).size : 0;
      assert(exists && sizeBytes > 500, `Category '${cat}' asset '${key}' exists (${(sizeBytes/1024).toFixed(1)} KB)`);
    });
  });

  // ── TEST 4: Wheel Center Alignment with Chassis Symmetry ──
  console.log("\n--- TEST 4: Wheel Center Mathematical Alignment ---");
  categories.forEach((cat) => {
    const arch = getVehicleArchitecture(cat);
    const halfWb = arch.wheelbaseMm / 2.0;
    const halfTf = arch.trackFrontMm / 2.0;
    const halfTr = arch.trackRearMm / 2.0;

    assert(Math.abs(arch.wheelCenters.frontLeft.x - halfWb) < 1.0, `${cat}: Front Left X aligns with +WB/2 (${halfWb}mm)`);
    assert(Math.abs(arch.wheelCenters.frontRight.x - halfWb) < 1.0, `${cat}: Front Right X aligns with +WB/2 (${halfWb}mm)`);
    assert(Math.abs(arch.wheelCenters.rearLeft.x - (-halfWb)) < 1.0, `${cat}: Rear Left X aligns with -WB/2 (${-halfWb}mm)`);
    assert(Math.abs(arch.wheelCenters.rearRight.x - (-halfWb)) < 1.0, `${cat}: Rear Right X aligns with -WB/2 (${-halfWb}mm)`);

    assert(Math.abs(arch.wheelCenters.frontLeft.y - halfTf) < 1.0, `${cat}: Front Left Y aligns with +TrackFront/2 (${halfTf}mm)`);
    assert(Math.abs(arch.wheelCenters.frontRight.y - (-halfTf)) < 1.0, `${cat}: Front Right Y aligns with -TrackFront/2 (${-halfTf}mm)`);
    assert(Math.abs(arch.wheelCenters.rearLeft.y - halfTr) < 1.0, `${cat}: Rear Left Y aligns with +TrackRear/2 (${halfTr}mm)`);
    assert(Math.abs(arch.wheelCenters.rearRight.y - (-halfTr)) < 1.0, `${cat}: Rear Right Y aligns with -TrackRear/2 (${-halfTr}mm)`);
  });

  // ── TEST 5: Packaging Envelopes Integrity ──
  console.log("\n--- TEST 5: Packaging Envelopes (Engine Bay, Cabin, Cargo) ---");
  categories.forEach((cat) => {
    const arch = getVehicleArchitecture(cat);
    const engVol = (arch.engineBayEnvelope.lengthMm * arch.engineBayEnvelope.widthMm * arch.engineBayEnvelope.heightMm) / 1e6;
    const cabVol = (arch.cabinEnvelope.lengthMm * arch.cabinEnvelope.widthMm * arch.cabinEnvelope.heightMm) / 1e6;
    const crgVol = (arch.cargoEnvelope.lengthMm * arch.cargoEnvelope.widthMm * arch.cargoEnvelope.heightMm) / 1e6;

    assert(engVol >= 500, `${cat}: Engine bay volume (${Math.round(engVol)}L) accommodates ICE/Hybrid packaging`);
    assert(cabVol >= 2500, `${cat}: Cabin volume (${Math.round(cabVol)}L) provides required passenger envelope`);
    assert(crgVol >= 300, `${cat}: Cargo envelope (${Math.round(crgVol)}L) meets category utility standards`);
  });

  // ── TEST 6: Pre-Design Studio Validation Engine ──
  console.log("\n--- TEST 6: Pre-Design Studio Asset Validator Quality Gate ---");
  categories.forEach((cat) => {
    const arch = getVehicleArchitecture(cat);
    const validation = VehicleAssetValidator.validateConfigContracts(arch);
    assert(validation.isValid === true, `${cat}: Pre-Design Studio validation passed without blocking errors`);
    assert(validation.issues.filter(i => i.severity === "error").length === 0, `${cat}: Zero error-level validation issues detected`);
    assert(validation.validatedNodes.length >= 6, `${cat}: Verified ${validation.validatedNodes.length} required semantic nodes`);
  });

  // Catch deliberate corruptions
  console.log("\n--- TEST 7: Validation Engine Negative Detection ---");
  const corruptedArch: VehicleArchitectureConfig = {
    ...sedan,
    wheelbaseMm: 1200, // Deliberately invalid
    overallLengthMm: 1000, // Length < wheelbase
  };
  const corruptValidation = VehicleAssetValidator.validateConfigContracts(corruptedArch);
  assert(corruptValidation.isValid === false, "Validator correctly flags invalid wheelbase & length");
  assert(corruptValidation.issues.some(i => i.type === "scale_error"), "Validator isolates scale_error issue type");

  // ── TEST 8: Metadata Persistence Contract ──
  console.log("\n--- TEST 8: Architecture Metadata Persistence Contract ---");
  categories.forEach((cat) => {
    const arch = getVehicleArchitecture(cat);
    const meta = arch.metadata;
    assert(meta.platformType.length > 0, `${cat}: Valid platformType '${meta.platformType}'`);
    assert(meta.chassisVersion.length > 0, `${cat}: Valid chassisVersion '${meta.chassisVersion}'`);
    assert(meta.bodyFrameworkVersion.length > 0, `${cat}: Valid bodyFrameworkVersion '${meta.bodyFrameworkVersion}'`);
    assert(meta.designVersion.length > 0, `${cat}: Valid designVersion '${meta.designVersion}'`);
  });

  console.log(`\nVehicle Architecture Tests: ${passed} passed, ${failed} failed.`);
  return { passed, failed };
}
