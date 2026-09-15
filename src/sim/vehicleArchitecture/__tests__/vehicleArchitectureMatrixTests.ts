// ============================================================================
// 24 × 7 VEHICLE ARCHITECTURE MATRIX UNIT TEST SUITE
// ============================================================================
// Verifies all 24 architectures, 7 eras, 168 unique reference vehicles,
// dimensional integrity, aerodynamic sanity, normalization, and compatibility.
// ============================================================================

import {
  VEHICLE_ERAS,
  VEHICLE_ARCHITECTURE_DEFINITIONS,
  VEHICLE_ARCHITECTURE_MATRIX,
  getAllArchitectures,
  getAllEras,
  getMatrixEntry,
  searchMatrix,
} from "../vehicleArchitectureMatrix";
import {
  CANONICAL_ARCHITECTURE_IDS,
  CANONICAL_ERA_IDS,
  normalizeArchitectureId,
  normalizeEraId,
  architectureToLegacyBodyTypeId,
} from "../architectureIdCompat";
import { BODY_TYPE_REGISTRY } from "../../modularVehicle/vehicleFamilyArchitecture";
import { BODY_TYPE_SEATING_MAP } from "../../modularVehicle/seatingConstraints";

export function runVehicleArchitectureMatrixTests(): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, msg: string) => {
    if (condition) {
      console.log(`  ✅ ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ ${msg}`);
      failed++;
    }
  };

  console.log("\n=======================================================");
  console.log("  24 × 7 VEHICLE ARCHITECTURE ERA MATRIX TESTS");
  console.log("=======================================================");

  // ── TEST 1: Architecture & Era Cardinality ──
  console.log("\n--- TEST 1: Matrix Dimensions & Cardinality ---");
  assert(CANONICAL_ARCHITECTURE_IDS.length === 24, "Exactly 24 Canonical Architectures defined");
  assert(CANONICAL_ERA_IDS.length === 7, "Exactly 7 Canonical Eras defined (1970s -> Future)");
  assert(Object.keys(VEHICLE_ARCHITECTURE_DEFINITIONS).length === 24, "All 24 Architecture Definitions exist");
  assert(Object.keys(VEHICLE_ERAS).length === 7, "All 7 Era Definitions exist");

  // ── TEST 2: Exactly 168 Slots & Zero Duplicates ──
  console.log("\n--- TEST 2: Reference Vehicle Uniqueness (168 Distinct Cars) ---");
  const referenceCars: string[] = [];
  let totalCellCount = 0;

  for (const archId of CANONICAL_ARCHITECTURE_IDS) {
    const archRow = VEHICLE_ARCHITECTURE_MATRIX[archId];
    assert(archRow !== undefined, `Architecture '${archId}' exists in matrix`);

    for (const eraId of CANONICAL_ERA_IDS) {
      totalCellCount++;
      const entry = archRow[eraId];
      assert(entry !== undefined, `Cell [${archId}][${eraId}] exists`);
      if (entry) {
        referenceCars.push(entry.referenceVehicle);
      }
    }
  }

  assert(totalCellCount === 168, `Matrix contains exactly 168 cells (got ${totalCellCount})`);
  const uniqueCars = new Set(referenceCars);
  assert(
    uniqueCars.size === 168,
    `Zero duplicate reference cars across all 168 cells (unique count: ${uniqueCars.size}/168)`
  );

  // ── TEST 3: Body-Only Architectural Contract ──
  console.log("\n--- TEST 3: Body-Only Architectural Contract ---");
  let bodyOnlyCount = 0;
  for (const archId of CANONICAL_ARCHITECTURE_IDS) {
    for (const eraId of CANONICAL_ERA_IDS) {
      const entry = VEHICLE_ARCHITECTURE_MATRIX[archId][eraId];
      if (entry.bodyOnly === true) {
        bodyOnlyCount++;
      }
    }
  }
  assert(bodyOnlyCount === 168, "All 168 cells enforce bodyOnly === true contract");

  // ── TEST 4: Physical Dimension Sanity Checks ──
  console.log("\n--- TEST 4: Physical Dimensions & Proportions Sanity ---");
  let dimensionErrors = 0;
  for (const archId of CANONICAL_ARCHITECTURE_IDS) {
    for (const eraId of CANONICAL_ERA_IDS) {
      const { defaultDimensions: d, referenceVehicle } = VEHICLE_ARCHITECTURE_MATRIX[archId][eraId];
      if (
        d.wheelbaseMm < 1800 ||
        d.overallLengthMm <= d.wheelbaseMm ||
        d.overallWidthMm < 1300 ||
        d.overallHeightMm < 850 ||
        d.groundClearanceMm < 20
      ) {
        dimensionErrors++;
        console.error(`Invalid dimensions for ${referenceVehicle}:`, d);
      }
    }
  }
  assert(dimensionErrors === 0, "All 168 cells have valid physical proportions (Length > WB, Width > 1.3m, etc.)");

  // ── TEST 5: Aerodynamics Range Validation ──
  console.log("\n--- TEST 5: Aerodynamic Profile Sanity ---");
  let aeroErrors = 0;
  for (const archId of CANONICAL_ARCHITECTURE_IDS) {
    for (const eraId of CANONICAL_ERA_IDS) {
      const { aerodynamics: aero, referenceVehicle } = VEHICLE_ARCHITECTURE_MATRIX[archId][eraId];
      if (aero.cd < 0.18 || aero.cd > 0.90 || aero.frontalAreaM2 < 1.1 || aero.frontalAreaM2 > 10.5) {
        aeroErrors++;
        console.error(`Invalid aerodynamics for ${referenceVehicle}:`, aero);
      }
    }
  }
  assert(aeroErrors === 0, "All 168 cells have realistic automotive aerodynamic figures (Cd 0.18–0.90)");

  // ── TEST 6: ID Normalization & Alias Support ──
  console.log("\n--- TEST 6: Normalization & Alias Bridge ---");
  assert(normalizeArchitectureId("SEDAN") === "sedan", "normalizeArchitectureId handles uppercase");
  assert(normalizeArchitectureId("luxury_sedan") === "luxury_car", "Alias 'luxury_sedan' maps to 'luxury_car'");
  assert(normalizeArchitectureId("station_wagon") === "wagon", "Alias 'station_wagon' maps to 'wagon'");
  assert(normalizeArchitectureId("truck_lorry") === "heavy_truck", "Alias 'truck_lorry' maps to 'heavy_truck'");
  assert(normalizeArchitectureId("cargo_van") === "van", "Alias 'cargo_van' maps to 'van'");
  assert(normalizeArchitectureId("bus_shuttle") === "bus", "Alias 'bus_shuttle' maps to 'bus'");
  assert(normalizeArchitectureId("f1") === "race_formula", "Alias 'f1' maps to 'race_formula'");
  assert(normalizeArchitectureId("gt3") === "gt3_racing", "Alias 'gt3' maps to 'gt3_racing'");
  assert(normalizeArchitectureId(undefined) === "sedan", "Undefined architecture safely falls back to 'sedan'");

  assert(normalizeEraId("70s") === "1970s", "normalizeEraId handles '70s'");
  assert(normalizeEraId("80s") === "1980s", "normalizeEraId handles '80s'");
  assert(normalizeEraId("2030+") === "future", "normalizeEraId handles '2030+'");
  assert(normalizeEraId(undefined) === "2020s", "Undefined era safely falls back to '2020s'");

  // ── TEST 7: Legacy Body Type Compatibility Bridge ──
  console.log("\n--- TEST 7: Downstream Compatibility with BODY_TYPE_REGISTRY & SEATING ---");
  let compatErrors = 0;
  for (const archId of CANONICAL_ARCHITECTURE_IDS) {
    const legacyBodyId = architectureToLegacyBodyTypeId(archId);
    if (!BODY_TYPE_REGISTRY[legacyBodyId]) {
      compatErrors++;
      console.error(`Missing BODY_TYPE_REGISTRY for mapped legacy ID: ${legacyBodyId} (from ${archId})`);
    }
    if (!BODY_TYPE_SEATING_MAP[legacyBodyId]) {
      compatErrors++;
      console.error(`Missing BODY_TYPE_SEATING_MAP for mapped legacy ID: ${legacyBodyId} (from ${archId})`);
    }
  }
  assert(
    compatErrors === 0,
    "All 24 Canonical Architectures safely map to valid records in BODY_TYPE_REGISTRY and BODY_TYPE_SEATING_MAP"
  );

  // ── TEST 8: Matrix Query and Search ──
  console.log("\n--- TEST 8: Query & Search Operations ---");
  const countach = getMatrixEntry("supercar", "1970s");
  assert(countach.referenceVehicle.includes("Countach"), "getMatrixEntry('supercar', '1970s') returns Countach");

  const cybertruck = getMatrixEntry("pickup_truck", "future");
  assert(cybertruck.referenceVehicle.includes("Cybertruck"), "getMatrixEntry('pickup_truck', 'future') returns Cybertruck");

  const searchResults1 = searchMatrix("McLaren F1");
  assert(searchResults1.length >= 1, "searchMatrix('McLaren F1') finds entry");

  const searchResults2 = searchMatrix("scudetto");
  assert(searchResults2.length >= 1, "searchMatrix('scudetto') finds Alfa Romeo Giulia Quadrifoglio");

  console.log(`\nVehicle Architecture Matrix Tests: ${passed} passed, ${failed} failed.`);
  return { passed, failed };
}
