// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — VEHICLE DIMENSIONAL FOUNDATION
// ============================================================================
// Canonical real-world dimensional reference structure and scale constants.
// Establishes a deterministic 1.0 unit = 1.0 meter (1000mm) world coordinate space.
//
// Coordinate System (ISO 8855 / Right-Handed Three.js):
//   +X : Forward (Front bumper & nose)
//   -X : Aft / Rearward (Rear bumper, wing & diffuser)
//   +Y : Upward (Ground clearance to roof crown)
//    Y = 0.0 : Ground Plane
//   +Z : Vehicle Right (Passenger side in LHD)
//   -Z : Vehicle Left (Driver side in LHD)
//    Z = 0.0 : Vehicle Centerline
// ============================================================================

export const VEHICLE_SCALE = 1.0; // 1 Three.js unit = 1.0 meter
export const MM_TO_M = 0.001;
export const M_TO_MM = 1000.0;

export interface VehicleDimensionalSpec {
  /** Overall vehicle length from front splitter tip to rear wing/diffuser trailing edge (mm) */
  overallLengthMm: number;
  /** Overall vehicle width across widest body haunches / mirrors (mm) */
  overallWidthMm: number;
  /** Overall vehicle height from ground plane to highest roof crown / wing apex (mm) */
  overallHeightMm: number;

  /** Distance between front axle center and rear axle center (mm) */
  wheelbaseMm: number;
  /** Distance between left and right front tire centerlines (mm) */
  frontTrackMm: number;
  /** Distance between left and right rear tire centerlines (mm) */
  rearTrackMm: number;

  /** Distance from front axle to forward-most splitter edge (mm) */
  frontOverhangMm: number;
  /** Distance from rear axle to aft-most diffuser / wing edge (mm) */
  rearOverhangMm: number;

  /** Ride clearance from ground plane to lowest flat undertray surface (mm) */
  groundClearanceMm: number;

  /** Nominal tire outer diameter (mm) */
  wheelDiameterMm: number;
  /** Front tire tread width (mm) */
  frontWheelWidthMm: number;
  /** Rear tire tread width (mm) */
  rearWheelWidthMm: number;

  /** Cockpit length from windshield cowl base to rear bulkhead (mm) */
  cockpitLengthMm: number;
  /** Height of cockpit roof apex above ground plane (mm) */
  roofApexHeightMm: number;
  /** Height of front hood surface above ground plane (mm) */
  hoodPeakHeightMm: number;
  /** Height of rear decklid surface above ground plane (mm) */
  rearDeckHeightMm: number;
}

/**
 * Benchmark GT3 Supercar Dimensional Reference (Phase 2 Calibrated)
 * Target Overall Length: 4,650 mm (880mm Front Overhang + 2,750mm Wheelbase + 1,020mm Rear Overhang)
 */
export const DEFAULT_VEHICLE_DIMENSIONS: VehicleDimensionalSpec = {
  overallLengthMm: 4650,
  overallWidthMm: 2050,
  overallHeightMm: 1180,
  wheelbaseMm: 2750,
  frontTrackMm: 1680,
  rearTrackMm: 1720,
  frontOverhangMm: 880,
  rearOverhangMm: 1020,
  groundClearanceMm: 100,
  wheelDiameterMm: 680,
  frontWheelWidthMm: 280,
  rearWheelWidthMm: 320,
  cockpitLengthMm: 1700,
  roofApexHeightMm: 1180,
  hoodPeakHeightMm: 580,
  rearDeckHeightMm: 880,
};

export interface VehicleCalculatedBounds {
  frontAxleX: number;
  rearAxleX: number;
  frontMostX: number;
  rearMostX: number;
  leftMostZ: number;
  rightMostZ: number;
  highestY: number;
  lowestY: number;
  centerlineZ: number;
  groundPlaneY: number;
  wheelCenterY: number;
  frontLeftWheel: { x: number; y: number; z: number };
  frontRightWheel: { x: number; y: number; z: number };
  rearLeftWheel: { x: number; y: number; z: number };
  rearRightWheel: { x: number; y: number; z: number };
}

/**
 * Computes exact 3D world bounding points from dynamic wheelbase and track parameters.
 */
export function calculateVehicleBounds(
  wheelbaseMm: number = DEFAULT_VEHICLE_DIMENSIONS.wheelbaseMm,
  trackFrontMm: number = DEFAULT_VEHICLE_DIMENSIONS.frontTrackMm,
  trackRearMm: number = DEFAULT_VEHICLE_DIMENSIONS.rearTrackMm,
  tireDiameterMm: number = DEFAULT_VEHICLE_DIMENSIONS.wheelDiameterMm
): VehicleCalculatedBounds {
  const wbM = wheelbaseMm * MM_TO_M;
  const halfTfM = (trackFrontMm / 2) * MM_TO_M;
  const halfTrM = (trackRearMm / 2) * MM_TO_M;
  const tireRadiusM = (tireDiameterMm / 2) * MM_TO_M; // 0.34m

  const frontAxleX = 0.45;
  const rearAxleX = frontAxleX - wbM;

  // Phase 2 Calibrated Longitudinal Bounds
  const frontMostX = frontAxleX + 0.88; // 880mm Front Overhang
  const rearMostX = rearAxleX - 1.02;   // 1020mm Rear Overhang (Diffuser & Wing)

  // Phase 3 Calibrated Lateral Bounds (2,050mm across rear haunches)
  const haunchWidthM = halfTrM + 0.165; // 1.025m (2,050mm width)
  const leftMostZ = -haunchWidthM;
  const rightMostZ = haunchWidthM;

  const lowestY = 0.10; // 100mm ground clearance
  const highestY = 1.18; // 1180mm roof / wing peak

  return {
    frontAxleX,
    rearAxleX,
    frontMostX,
    rearMostX,
    leftMostZ,
    rightMostZ,
    highestY,
    lowestY,
    centerlineZ: 0,
    groundPlaneY: 0,
    wheelCenterY: tireRadiusM,
    frontLeftWheel: { x: frontAxleX, y: tireRadiusM, z: -halfTfM },
    frontRightWheel: { x: frontAxleX, y: tireRadiusM, z: halfTfM },
    rearLeftWheel: { x: rearAxleX, y: tireRadiusM, z: -halfTrM },
    rearRightWheel: { x: rearAxleX, y: tireRadiusM, z: halfTrM },
  };
}
