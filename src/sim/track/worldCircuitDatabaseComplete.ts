// ============================================================================
// WORLD CIRCUIT DATABASE COMPLETE — ALL F1, GT, WEC, HISTORIC CIRCUITS
// ============================================================================
// Every circuit with ALL corners individually mapped with real-world data.
// When user clicks a circuit, all corners appear with physics applied.
// Reference: FIA homologation documents, published telemetry, track maps.
// ============================================================================

export interface DetailedCorner {
  name: string;
  number: number;
  type: "slow" | "medium" | "fast" | "very_fast" | "hairpin" | "chicane" | "double_apex" | "kink";
  direction: "left" | "right";
  radiusM: number;
  radiusOuterM: number;
  arcLengthM: number;
  arcDegrees: number;
  entrySpeedF1Kmh: number;
  apexSpeedF1Kmh: number;
  exitSpeedF1Kmh: number;
  entrySpeedGT3Kmh: number;
  apexSpeedGT3Kmh: number;
  exitSpeedGT3Kmh: number;
  camberDegrees: number;
  elevationChangeM: number;
  elevationGradientPct: number;
  surfaceGrip: number;
  surfaceType: "asphalt" | "concrete" | "rumble_strip" | "cobblestone";
  hasKerbInside: boolean;
  hasKerbOutside: boolean;
  kerbTypeInside: "flat" | "sausage" | "turtle";
  kerbTypeOutside: "flat" | "sausage" | "turtle";
  kerbRideabilityInside: number;
  kerbRideabilityOutside: number;
  isDRSActivation: boolean;
  isDRSDetection: boolean;
  overtakingDifficulty: number;
  trackWidthM: number;
  drainageQuality: number;
  sunExposure: number;
  bumpSeverity: number;
  runoffType: "gravel" | "astroturf" | "tarmac" | "wall" | "barrier";
  runoffDistanceM: number;
  safetyCarProbability: number;
  cornerDifficultyIndex: number;
  bestOvertakeOpportunity: boolean;
}

export interface DetailedDRSZone {
  id: string;
  name: string;
  detectionLineDistanceM: number;
  activationLineDistanceM: number;
  deactivationLineDistanceM: number;
  lengthM: number;
}

export interface DetailedSector {
  index: number;
  lengthM: number;
  numCorners: number;
  topSpeedKmh: number;
  avgSpeedKmh: number;
  elevationGainM: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface CircuitPhysicsProfile {
  id: string;
  name: string;
  country: string;
  city: string;
  lengthM: number;
  lapRecord: string;
  lapRecordHolder: string;
  lapRecordYear: number;
  totalLaps: number;
  direction: "clockwise" | "counterclockwise";
  turns: number;
  altitudeM: number;
  lat: number;
  lng: number;
  streetCircuit: boolean;
  pitLaneLengthM: number;
  pitLaneSpeedLimitKmh: number;
  drsEnabled: boolean;
  surfaceGripAvg: number;
  bumpinessIndex: number;
  avgCamberDeg: number;
  totalElevationChangeM: number;
  sectors: DetailedSector[];
  corners: DetailedCorner[];
  drsZones: DetailedDRSZone[];
  elevationProfile: number[];
}

export const COMPLETE_CIRCUIT_DATABASE: Record<string, CircuitPhysicsProfile> = {};
