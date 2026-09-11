import {
  PLATFORM_FAMILIES,
  BODY_TYPE_REGISTRY,
  DETERMINISTIC_NODE_MAP,
  BLENDER_ASSET_HIERARCHY,
  calculatePlatformHardpoints,
  getMorphDeltas,
  getAllBodyTypeIds,
  getAllPlatformFamilyIds,
  calculateHypercarActiveAero,
  calculateConvertibleRoof,
  calculateVanInteriorVolume,
  calculateOffRoadClearance,
  COMMERCIAL_BODY_REGISTRY,
} from "../vehicleFamilyArchitecture";
import {
  VehicleBodyTypeId,
  PlatformFamilyId,
  BlenderBranchCategory,
  VanSeatConfig,
  CommercialBodyType,
} from "../types";

export interface TestResult {
  passed: number;
  failed: number;
  errors: string[];
}

export function runVehicleFamilyArchitectureTests(): TestResult {
  console.log("-------------------------------------------------");
  console.log("  24-BODY TYPE & 3-LAYER VEHICLE ARCHITECTURE TESTS");
  console.log("-------------------------------------------------");

  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      passed++;
      console.log(`  ✅ ${testName}`);
    } else {
      failed++;
      const err = `FAIL: ${testName} ${detail ? "- " + detail : ""}`;
      errors.push(err);
      console.error(`  ❌ ${err}`);
    }
  }

  // 1. Verify Platform Families (8 foundational architectures)
  const familyIds = getAllPlatformFamilyIds();
  assert(familyIds.length === 8, "Platform Family Count", `Expected 8 families, got ${familyIds.length}`);

  const expectedFamilies: PlatformFamilyId[] = [
    "unibody_passenger",
    "unibody_compact",
    "utility_suv_crossover",
    "body_on_frame_truck",
    "commercial_van_bus",
    "high_downforce_supercar",
    "open_top_gt",
    "tubular_specialty",
  ];

  expectedFamilies.forEach((fId) => {
    const fam = PLATFORM_FAMILIES[fId];
    assert(!!fam, `Platform Family '${fId}' Registered`);
    if (fam) {
      assert(fam.allowedBodyTypes.length > 0, `Family '${fId}' has compatible body types`);
      assert(fam.baselineTorsionalRigidityNmPerDeg > 0, `Family '${fId}' has positive torsional rigidity`);
    }
  });

  // 2. Verify 24 Vehicle Body Types
  const bodyTypeIds = getAllBodyTypeIds();
  assert(bodyTypeIds.length === 24, "Body Type Count", `Expected exactly 24 body types, got ${bodyTypeIds.length}`);

  bodyTypeIds.forEach((bId) => {
    const body = BODY_TYPE_REGISTRY[bId];
    assert(!!body, `Body Type '${bId}' Registered`);
    if (body) {
      // Dimensions
      const dims = body.defaultDimensions;
      assert(
        dims.wheelbaseMm >= 1800 && dims.wheelbaseMm <= 6500,
        `Body '${bId}' Wheelbase [1800-6500mm]`,
        `${dims.wheelbaseMm}mm`
      );
      assert(
        dims.overallLengthMm >= 2400 && dims.overallLengthMm <= 12500,
        `Body '${bId}' Overall Length [2400-12500mm]`,
        `${dims.overallLengthMm}mm`
      );
      assert(
        dims.overallWidthMm >= 1400 && dims.overallWidthMm <= 2600,
        `Body '${bId}' Overall Width [1400-2600mm]`,
        `${dims.overallWidthMm}mm`
      );
      assert(
        dims.groundClearanceMm >= 60 && dims.groundClearanceMm <= 400,
        `Body '${bId}' Ground Clearance [60-400mm]`,
        `${dims.groundClearanceMm}mm`
      );

      // Aerodynamic baseline
      assert(
        body.aerodynamicBaseline.cd >= 0.18 && body.aerodynamicBaseline.cd <= 0.85,
        `Body '${bId}' Drag Cd [0.18-0.85]`,
        `Cd=${body.aerodynamicBaseline.cd}`
      );
      assert(
        body.aerodynamicBaseline.frontalAreaM2 >= 1.2 && body.aerodynamicBaseline.frontalAreaM2 <= 6.5,
        `Body '${bId}' Frontal Area [1.2-6.5m2]`,
        `${body.aerodynamicBaseline.frontalAreaM2}m2`
      );

      // Seating capacity
      assert(body.seatingCapacity >= 1 && body.seatingCapacity <= 60, `Body '${bId}' Seating Capacity [1-60]`);

      // Key asset groups
      assert(body.keyBlenderAssets.length >= 3, `Body '${bId}' has at least 3 key asset groups`);
    }
  });

  // 3. Platform Hardpoints Calculation (Three.js coordinates: +X Right, +Y Up, -Z Forward, +Z Rear)
  const sedanHardpoints = calculatePlatformHardpoints(BODY_TYPE_REGISTRY["sedan"].defaultDimensions);
  assert(sedanHardpoints.wheelCenters.fl[2] < 0, "Sedan Front Wheel Center Z < 0 (Forward in Three.js)");
  assert(sedanHardpoints.wheelCenters.rl[2] > 0, "Sedan Rear Wheel Center Z > 0 (Rear in Three.js)");
  assert(sedanHardpoints.wheelCenters.fl[1] > 0, "Sedan Front Wheel Center Y > 0 (Ground offset)");
  assert(sedanHardpoints.powertrainEnvelope.origin[2] < 0, "Sedan Front-Engine Powertrain Mount is Forward (Z < 0)");

  const supercarHardpoints = calculatePlatformHardpoints(BODY_TYPE_REGISTRY["supercar"].defaultDimensions);
  assert(
    supercarHardpoints.powertrainEnvelope.origin[2] > 0,
    "Supercar Mid-Engine Powertrain Mount is behind center (Z > 0)",
    `Z=${supercarHardpoints.powertrainEnvelope.origin[2]}`
  );
  assert(
    supercarHardpoints.chassisRails.leftRailStart[1] < sedanHardpoints.chassisRails.leftRailStart[1],
    "Supercar Chassis is lower to ground than Sedan"
  );

  const pickupHardpoints = calculatePlatformHardpoints(BODY_TYPE_REGISTRY["pickup_truck"].defaultDimensions);
  assert(
    pickupHardpoints.wheelCenters.fl[0] > sedanHardpoints.wheelCenters.fl[0],
    "Pickup Track Width is wider than Sedan"
  );
  assert(
    pickupHardpoints.chassisRails.leftRailStart[1] > sedanHardpoints.chassisRails.leftRailStart[1],
    "Pickup Ladder Frame Ground Clearance is higher than Sedan"
  );

  // 4. Master Body Cage Morphing Deltas
  const sedanToCoupeMorph = getMorphDeltas("sedan", "coupe");
  assert(
    sedanToCoupeMorph.roofHeightDeltaMm < 0,
    "Sedan -> Coupe Morph: Roof Height Decreases",
    `${sedanToCoupeMorph.roofHeightDeltaMm}mm`
  );
  assert(
    sedanToCoupeMorph.doorLengthDeltaMm > 0,
    "Sedan -> Coupe Morph: Door Length Increases for 2-door coupe",
    `+${sedanToCoupeMorph.doorLengthDeltaMm}mm`
  );

  const sedanToWagonMorph = getMorphDeltas("sedan", "station_wagon");
  assert(
    sedanToWagonMorph.roofLengthDeltaMm > 0,
    "Sedan -> Wagon Morph: Roof Length Extends Rearward",
    `+${sedanToWagonMorph.roofLengthDeltaMm}mm`
  );
  assert(
    sedanToWagonMorph.cargoExtensionMm > 0,
    "Sedan -> Wagon Morph: Cargo Extension Increases",
    `+${sedanToWagonMorph.cargoExtensionMm}mm`
  );

  const coupeToShootingBrakeMorph = getMorphDeltas("coupe", "shooting_brake");
  assert(
    coupeToShootingBrakeMorph.roofLengthDeltaMm > 0,
    "Coupe -> Shooting Brake Morph: Roof Extends to form sport wagon",
    `+${coupeToShootingBrakeMorph.roofLengthDeltaMm}mm`
  );

  // 5. Deterministic Blender Naming Standard
  const nodes = [
    DETERMINISTIC_NODE_MAP.chassis,
    DETERMINISTIC_NODE_MAP.cabin,
    DETERMINISTIC_NODE_MAP.diffuser,
    DETERMINISTIC_NODE_MAP.suspensionFL,
    DETERMINISTIC_NODE_MAP.wheelFL,
    DETERMINISTIC_NODE_MAP.glassWindshield,
    DETERMINISTIC_NODE_MAP.headlampL,
    DETERMINISTIC_NODE_MAP.dashboard,
  ];

  nodes.forEach((nodeName) => {
    assert(!nodeName.includes("Cube"), `Node name '${nodeName}' does not contain 'Cube'`);
    assert(!nodeName.includes("Plane"), `Node name '${nodeName}' does not contain 'Plane'`);
    assert(!nodeName.includes("Mesh"), `Node name '${nodeName}' does not contain 'Mesh'`);
    assert(nodeName.includes("_"), `Node name '${nodeName}' follows deterministic UPPER_SNAKE convention`);
  });

  // 6. 6-Branch Blender Asset Architecture Hierarchy
  const branches: BlenderBranchCategory[] = ["PLATFORM", "BODY", "AERO", "WHEELS", "GLASS", "INTERIOR"];
  branches.forEach((b) => {
    const branchNodes = BLENDER_ASSET_HIERARCHY[b];
    assert(Array.isArray(branchNodes) && branchNodes.length >= 4, `Branch '${b}' has at least 4 discrete nodes`);
    branchNodes.forEach((node) => {
      assert(!node.includes("Cube"), `Branch node '${node}' has no generic Cube`);
      assert(!node.includes("Plane"), `Branch node '${node}' has no generic Plane`);
    });
  });

  // 7. Specialized CAD Calculators
  // 7a. Hypercar Active Aero
  const aeroNeutral = calculateHypercarActiveAero(0, false);
  const aeroMax = calculateHypercarActiveAero(35, false);
  const aeroDRS = calculateHypercarActiveAero(35, true);
  assert(aeroMax.downforceKgAt250Kmh > aeroNeutral.downforceKgAt250Kmh, "Active Aero: +35° Wing increases downforce vs 0°");
  assert(aeroMax.dragCdDelta > aeroNeutral.dragCdDelta, "Active Aero: +35° Wing increases drag vs 0°");
  assert(aeroDRS.dragCdDelta < aeroMax.dragCdDelta, "Active Aero: DRS flap open significantly reduces drag");
  assert(aeroDRS.downforceKgAt250Kmh < aeroMax.downforceKgAt250Kmh, "Active Aero: DRS flap open sheds rear downforce");

  // 7b. Convertible Structural Roof
  const roofUp = calculateConvertibleRoof(0.0);
  const roofDown = calculateConvertibleRoof(1.0);
  assert(roofUp.state === "roof_up", "Convertible Roof: Position 0.0 is roof_up");
  assert(roofDown.state === "roof_down", "Convertible Roof: Position 1.0 is roof_down");
  assert(roofDown.structuralRigidityPenaltyPct > roofUp.structuralRigidityPenaltyPct, "Roof DOWN incurs structural rigidity penalty");
  assert(roofDown.cdDelta > roofUp.cdDelta, "Roof DOWN has higher aerodynamic drag");

  // 7c. Van / MPV Modular Seating
  const van2Seat = calculateVanInteriorVolume("2_seat_cargo");
  const van9Seat = calculateVanInteriorVolume("9_seat");
  assert(van2Seat.cargoVolumeL > van9Seat.cargoVolumeL, "Van: 2-Seat cargo layout has more cargo volume than 9-seat");
  assert(van2Seat.passengerCount === 2, "Van: 2-Seat layout seats 2 passengers");
  assert(van9Seat.passengerCount === 9, "Van: 9-Seat layout seats 9 passengers");

  // 7d. Off-Road Clearance & Articulation
  const offRoadLow = calculateOffRoadClearance(200, 31);
  const offRoadHigh = calculateOffRoadClearance(340, 37);
  assert(offRoadHigh.effectiveGroundClearanceMm > offRoadLow.effectiveGroundClearanceMm, "Off-Road: Increased ride height increases ground clearance");
  assert(offRoadHigh.suspensionTravelMm >= offRoadLow.suspensionTravelMm, "Off-Road: Increased travel provides positive travel");
  assert(offRoadHigh.fenderClearanceMm > 0, "Off-Road: Positive fender clearance maintained");

  // 7e. Commercial Master Frame Rear Bodies
  const commTypes: CommercialBodyType[] = [
    "flatbed",
    "cargo_box",
    "refrigerated_box",
    "tipper",
    "service_body",
    "passenger_body",
  ];
  commTypes.forEach((cType) => {
    const spec = COMMERCIAL_BODY_REGISTRY[cType];
    assert(!!spec, `Commercial Body '${cType}' is registered`);
    assert(spec.payloadCapacityKg >= 1000, `Commercial Body '${cType}' has at least 1000kg payload rating`);
  });

  console.log(`Results: ${passed} passed, ${failed} failed.`);
  return { passed, failed, errors };
}
