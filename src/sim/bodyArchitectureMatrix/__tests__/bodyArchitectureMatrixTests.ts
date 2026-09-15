// ============================================================================
// BODY ARCHITECTURE MATRIX — COMPREHENSIVE VERIFICATION TESTS
// ============================================================================
// Validates:
// 1. Exactly 168 cells (24 architectures × 7 eras)
// 2. Uniqueness of all 168 (arch, era) pairs
// 3. Absolute uniqueness of all 168 referenceVehicle names (no duplicates)
// 4. Resolution of Ferrari Purosangue (Crossover 2020s) vs BMW XM (SUV 2020s)
// 5. Strict absence of 'fastback' or 'liftback' architecture IDs
// 6. Completeness of all 8 Design DNA fields per cell
// 7. getCell, getErasForArchitecture, and getBodyGlbUrl API correctness
// ============================================================================

import {
  ARCHITECTURES,
  ERAS,
  BODY_ARCHITECTURE_MATRIX,
  getCell,
  getErasForArchitecture,
  listArchitectures,
  listEras,
  getBodyGlbUrl,
  registerAvailableBodyGlb,
  isBodyGlbAvailable,
  BodyArchitectureId,
  VehicleEraId,
} from "../index";

export function runBodyArchitectureMatrixTests(): void {
  console.log("\n========================================================");
  console.log("🚗 RUNNING 24 × 7 BODY ARCHITECTURE MATRIX VERIFICATION");
  console.log("========================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      passed++;
      console.log(`  ✓ ${testName}`);
    } else {
      failed++;
      console.error(`  ✗ FAIL: ${testName} ${detail ? "— " + detail : ""}`);
    }
  }

  // 1. Architecture Count & IDs
  assert(
    ARCHITECTURES.length === 24,
    "Architecture Registry has exactly 24 architectures",
    `Found ${ARCHITECTURES.length}`
  );

  const EXPECTED_ARCH_IDS: BodyArchitectureId[] = [
    "sedan",
    "hatchback",
    "coupe",
    "convertible",
    "roadster",
    "sports_car",
    "supercar",
    "hypercar",
    "grand_tourer",
    "muscle_car",
    "luxury_car",
    "limousine",
    "shooting_brake",
    "wagon",
    "crossover",
    "suv",
    "offroad_4x4",
    "pickup",
    "heavy_truck",
    "van",
    "mpv",
    "bus",
    "formula",
    "gt3",
  ];

  const actualArchIds = ARCHITECTURES.map((a) => a.id);
  assert(
    EXPECTED_ARCH_IDS.every((id) => actualArchIds.includes(id)),
    "All 24 canonical architecture IDs match specification exactly"
  );

  // 2. Strict Prohibition of Fastback & Liftback
  assert(
    !actualArchIds.includes("fastback" as any) &&
      !actualArchIds.includes("liftback" as any),
    "No fastback or liftback architecture IDs exist in registry"
  );

  // 3. Era Count & IDs
  assert(ERAS.length === 7, "Era Registry has exactly 7 eras", `Found ${ERAS.length}`);

  const EXPECTED_ERA_IDS: VehicleEraId[] = [
    "1970s",
    "1980s",
    "1990s",
    "2000s",
    "2010s",
    "2020s",
    "future",
  ];
  const actualEraIds = ERAS.map((e) => e.id);
  assert(
    EXPECTED_ERA_IDS.every((id) => actualEraIds.includes(id)),
    "All 7 canonical era IDs match specification exactly"
  );

  // 4. Exactly 168 Cells & Uniqueness of (Architecture, Era)
  let cellCount = 0;
  const pairKeys = new Set<string>();
  const referenceVehicles: string[] = [];

  for (const arch of ARCHITECTURES) {
    const eraRow = BODY_ARCHITECTURE_MATRIX[arch.id];
    assert(
      !!eraRow,
      `Matrix has row for architecture '${arch.id}'`
    );

    for (const era of ERAS) {
      const cell = eraRow?.[era.id];
      if (cell) {
        cellCount++;
        pairKeys.add(`${arch.id}::${era.id}`);
        referenceVehicles.push(cell.referenceVehicle);

        // Check glb path convention
        const expectedGlb = `/models/vehicles/${arch.id}/${era.id}/vehicle.glb`;
        if (cell.glb !== expectedGlb) {
          assert(false, `GLB path adheres to convention for ${arch.id} ${era.id}`, `Got ${cell.glb}`);
        }

        // Check Design DNA
        const dna = cell.designDNA;
        const hasAllDna =
          !!dna.proportions &&
          !!dna.silhouette &&
          !!dna.greenhouse &&
          !!dna.hoodCabin &&
          !!dna.surfacing &&
          !!dna.aeroPhilosophy &&
          !!dna.wheels &&
          !!dna.engineering;
        if (!hasAllDna) {
          assert(false, `Complete Design DNA for ${arch.id} ${era.id}`);
        }
      }
    }
  }

  assert(cellCount === 168, "Matrix contains exactly 168 cells", `Counted ${cellCount}`);
  assert(pairKeys.size === 168, "All 168 (architecture, era) pairs are strictly unique");

  // 5. Uniqueness of referenceVehicles (no duplicates across all 168 cells)
  const uniqueRefs = new Set(referenceVehicles);
  const duplicateRefs = referenceVehicles.filter(
    (item, index) => referenceVehicles.indexOf(item) !== index
  );
  assert(
    uniqueRefs.size === 168,
    "Every referenceVehicle across all 168 cells is strictly unique (no collisions)",
    `Duplicates found: ${duplicateRefs.join(", ")}`
  );

  // 6. Verify Collision Fix: Ferrari Purosangue (Crossover 2020s) vs BMW XM (SUV 2020s)
  const crossover2020s = getCell("crossover", "2020s");
  const suv2020s = getCell("suv", "2020s");
  assert(
    crossover2020s?.referenceVehicle === "Ferrari Purosangue",
    "Crossover 2020s reference vehicle is Ferrari Purosangue",
    `Got: ${crossover2020s?.referenceVehicle}`
  );
  assert(
    suv2020s?.referenceVehicle === "BMW XM",
    "SUV 2020s reference vehicle is resolved to BMW XM (no duplicate)",
    `Got: ${suv2020s?.referenceVehicle}`
  );
  assert(
    crossover2020s?.referenceVehicle !== suv2020s?.referenceVehicle,
    "Crossover 2020s and SUV 2020s references are distinct"
  );

  // 7. Query APIs
  const sedanEras = getErasForArchitecture("sedan");
  assert(
    sedanEras.length === 7,
    "getErasForArchitecture('sedan') returns all 7 era cells"
  );

  const fallbackUrl = getBodyGlbUrl("sedan", "1970s");
  assert(
    fallbackUrl.includes(".glb"),
    "getBodyGlbUrl returns valid fallback GLB path when not yet registered as generated"
  );

  // Test GLB registration
  registerAvailableBodyGlb("sedan", "2020s");
  assert(
    isBodyGlbAvailable("sedan", "2020s"),
    "isBodyGlbAvailable returns true after registration"
  );
  const registeredUrl = getBodyGlbUrl("sedan", "2020s");
  assert(
    registeredUrl === "/models/vehicles/sedan/2020s/vehicle.glb",
    "getBodyGlbUrl returns generated GLB path when available",
    `Got: ${registeredUrl}`
  );

  console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    throw new Error(`${failed} matrix verification tests failed.`);
  }
}

// Auto-run if executed directly via CLI
if (
  typeof process !== "undefined" &&
  process.argv &&
  process.argv[1] &&
  process.argv[1].includes("bodyArchitectureMatrixTests")
) {
  try {
    runBodyArchitectureMatrixTests();
    console.log("✅ 24x7 BODY ARCHITECTURE MATRIX TESTS PASSED 100%");
  } catch (err) {
    console.error("❌ MATRIX TESTS FAILED:", err);
    process.exit(1);
  }
}
