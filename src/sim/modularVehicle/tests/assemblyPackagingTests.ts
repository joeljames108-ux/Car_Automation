/**
 * ============================================================================
 * ASSEMBLY PACKAGING & CAD ENGINEERING UNIT TESTS
 * ============================================================================
 */

import {
  computeAssemblyPhysicalState,
  COMPONENT_MANIFEST_CATALOG,
} from "../AssemblyRegistryEngine";
import {
  validateAssemblyPackaging,
} from "../AssemblyPackagingValidator";
import { InstalledSubsystemsState } from "../../../components/vehicleAssembly/scene/ModularAssemblySceneGraph";
import { defaultEngine } from "../../constants";

export function runAssemblyPackagingTests(): { passed: number; failed: number } {
  console.log("\n================================================================");
  console.log("RUNNING ASSEMBLY PACKAGING & CAD ENGINEERING TESTS");
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

  // TEST 1: Physical State Calculation
  const testManifests = [
    COMPONENT_MANIFEST_CATALOG["chassis_gt3"],
    COMPONENT_MANIFEST_CATALOG["engine_v8_mid"],
    COMPONENT_MANIFEST_CATALOG["trans_dct_7"],
    COMPONENT_MANIFEST_CATALOG["susp_pushrod_gt3"],
    COMPONENT_MANIFEST_CATALOG["brakes_ccm"],
    COMPONENT_MANIFEST_CATALOG["wheels_gt3_centerlock"],
    COMPONENT_MANIFEST_CATALOG["body_gt3_widebody"],
  ];

  const physicalState = computeAssemblyPhysicalState(testManifests, 2700);

  assert(physicalState.totalCurbWeightKg > 700, "Calculates positive total vehicle mass (> 700 kg)");
  assert(physicalState.unsprungMassKg > 50, "Calculates unsprung mass from wheels and brakes");
  assert(
    physicalState.weightDistributionFrontPct >= 35 && physicalState.weightDistributionFrontPct <= 65,
    "Calculates realistic Front/Rear weight bias distribution"
  );
  assert(physicalState.momentOfInertiaYawKgm2 > 0, "Calculates yaw moment of inertia");

  // TEST 2: Packaging Health Validation
  const mockState: InstalledSubsystemsState = {
    installedStages: new Set(["chassis", "engine", "transmission", "suspension", "brakes", "wheels", "body_structure"]),
    chassis: {
      type: "gt3",
      architecture: "spaceframe",
      wheelbaseMm: 2700,
      frontTrackMm: 1620,
      rearTrackMm: 1640,
      rideHeightMm: 95,
    },
    engine: defaultEngine(),
    enginePosition: "mid",
    transmissionType: "dct_7",
    suspensionType: "double_wishbone",
    brakeType: "carbon_ceramic",
    caliperColor: "#ef4444",
    wheelStyle: "centerlock_gt3",
    tireCompound: "semi_slick",
    bodyKit: "gt3_aero",
    paintColor: "#dc2626",
    paintFinish: "gloss",
    glassType: "race_polycarbonate",
    interiorType: "carbon_bucket_gt3",
    electronicsType: "motorsport_ecu_telemetry",
    exhaustType: "quad_titanium",
    aero: {
      frontSplitterEnabled: true,
      frontSplitterLengthMm: 120,
      frontSplitterAngleDeg: 1.5,
      rearWingEnabled: true,
      rearWingType: "swan_neck",
      rearWingAngleDeg: 12,
      rearWingHeightMm: 340,
      rearWingWidthMm: 1650,
      gurneyFlap: true,
      endplateSize: "swan_neck",
      diffuserEnabled: true,
      diffuserAngleDeg: 10,
      diffuserStrakes: 4,
      diffuserExitWidthMm: 1050,
      sideSkirtsEnabled: true,
      sideSkirtExtensionMm: 60,
      vortexFins: true,
      underbodyVenturiTunnels: true,
      frontCanards: true,
      frontCanardAngleDeg: 14,
    },
  };

  const healthReport = validateAssemblyPackaging(mockState);
  assert(healthReport.score >= 80, "Generates high Assembly Health Score for optimal GT3 packaging");
  assert(healthReport.issues.length >= 4, "Generates multi-point clearance diagnostic checks");

  // TEST 3: Extreme Ground Clearance Scraping Conflict Detection
  const lowState = {
    ...mockState,
    chassis: { ...mockState.chassis, rideHeightMm: 40 },
    aero: { ...mockState.aero, diffuserAngleDeg: 22 },
  };
  const conflictReport = validateAssemblyPackaging(lowState);
  const diffuserIssue = conflictReport.issues.find((i) => i.id === "diffuser_ground_scrape");
  assert(diffuserIssue !== undefined && diffuserIssue.severity === "CONFLICT", "Detects extreme ground scraping clearance conflict");

  console.log(`\nASSEMBLY PACKAGING TESTS: ${passed} passed, ${failed} failed.\n`);
  return { passed, failed };
}
