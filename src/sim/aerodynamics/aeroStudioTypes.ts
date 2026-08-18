// ============================================================================
// PHASES 111–125: PARAMETRIC 3D AERODYNAMICS STUDIO TYPES & METADATA SCHEMAS
// ============================================================================
// Complete type contracts for 3D parametric geometry generators, surrogate
// aerodynamic solvers, CFD pressure/streamline overlays, and lap-time models.
// ============================================================================

export type AeroSubsystemId =
  | 'frontWing'
  | 'sidepod'
  | 'groundEffectFloor'
  | 'diffuser'
  | 'rearWing'
  | 'canards'
  | 'activeAero'
  | 'presets';

export type AeroVisualMode =
  | 'realistic'
  | 'wireframe'
  | 'cfdPressure'
  | 'streamlines'
  | 'forceVectors'
  | 'smokeWindTunnel';

export type AeroPackagePresetId =
  | 'low_drag_speed'
  | 'balanced_gt'
  | 'high_downforce_sprint'
  | 'extreme_ground_effect';

// ----------------------------------------------------------------------------
// 1. Component Parametric Geometry Configurations
// ----------------------------------------------------------------------------

export interface FrontWingConfig {
  spanMm: number; // 1400 - 2000 mm
  mainChordMm: number; // 200 - 450 mm
  flapChordMm: number; // 80 - 220 mm
  flapAngleDeg: number; // 0 - 30 deg
  flapLengthPct: number; // 50 - 100% of span
  endplateHeightMm: number; // 100 - 350 mm
  endplateToeAngleDeg: number; // -5 to +10 deg
  elementCount: 1 | 2 | 3;
  rideHeightMm: number; // 30 - 120 mm
  slotGapMm: number; // 5 - 25 mm
  gurneyHeightMm: number; // 0 - 15 mm
  hasVortexGenerators: boolean;
}

export interface SidepodConfig {
  lengthMm: number; // 1200 - 2200 mm
  widthMm: number; // 300 - 650 mm
  heightMm: number; // 350 - 700 mm
  inletAreaM2: number; // 0.08 - 0.35 m2
  inletPositionXOffsetMm: number; // -100 to +200 mm
  undercutDepthMm: number; // 50 - 250 mm
  shoulderHeightMm: number; // 400 - 750 mm
  rearTaperDeg: number; // 5 - 28 deg
  coolingOutletAreaM2: number; // 0.05 - 0.25 m2
  vortexFencesCount: number; // 0 - 4 fences
  downwashRampAngleDeg: number; // 0 - 18 deg
}

export interface GroundEffectFloorConfig {
  floorLengthMm: number; // 2400 - 3600 mm
  floorWidthMm: number; // 1400 - 2000 mm
  tunnelThroatHeightMm: number; // 15 - 80 mm
  tunnelThroatPositionPct: number; // 20 - 50% from front
  tunnelExpansionRatio: number; // 1.2 - 4.5
  edgeWingHeightMm: number; // 10 - 60 mm
  floorEdgeSealAngleDeg: number; // -10 to +20 deg
  strakeCount: number; // 2 - 6 strakes
  rideHeightSensitivityFactor: number; // 0.5 - 2.0
  hasPorpoisingDamper: boolean;
}

export interface DiffuserConfig {
  lengthMm: number; // 600 - 1400 mm
  widthMm: number; // 800 - 1600 mm
  rampAngleDeg: number; // 4 - 24 deg
  throatHeightMm: number; // 20 - 90 mm
  strakeCount: number; // 2 - 8 strakes
  strakeHeightMm: number; // 40 - 180 mm
  strakeLengthMm: number; // 300 - 1200 mm
  exitHeightMm: number; // 150 - 450 mm
  hasGurneyFlap: boolean;
  gurneyHeightMm: number; // 0 - 20 mm
}

export interface RearWingConfig {
  spanMm: number; // 1200 - 2000 mm
  mainChordMm: number; // 220 - 500 mm
  heightMm: number; // 150 - 600 mm
  angleOfAttackDeg: number; // 0 - 35 deg
  flapChordMm: number; // 80 - 250 mm
  endplateHeightMm: number; // 180 - 450 mm
  endplateToeAngleDeg: number; // -4 to +8 deg
  gurneyHeightMm: number; // 0 - 22 mm
  pylonType: 'swan_neck' | 'bottom_mount' | 'endplate_integrated';
  elementCount: 1 | 2 | 3;
  hasDrsActuator: boolean;
}

export interface CanardArrayConfig {
  tierCount: 0 | 1 | 2 | 3;
  spanMm: number; // 120 - 350 mm
  chordMm: number; // 80 - 220 mm
  sweepDeg: number; // 15 - 45 deg
  incidenceDeg: number; // 5 - 25 deg
  hasEndplateFence: boolean;
}

export interface ActiveAeroConfig {
  enabled: boolean;
  drsMaxSpeedThresholdKmh: number; // e.g. 240 km/h
  airbrakeDecelThresholdG: number; // e.g. 0.8 G
  activeFrontFlapRangeDeg: [number, number]; // e.g. [2, 14]
  activeRearWingRangeDeg: [number, number]; // e.g. [4, 28]
  activeDiffuserFlapMm: number; // e.g. 35 mm
}

// ----------------------------------------------------------------------------
// 2. Master Aerodynamics Studio State
// ----------------------------------------------------------------------------

export interface MasterAeroStudioConfig {
  preset: AeroPackagePresetId;
  frontWing: FrontWingConfig;
  sidepod: SidepodConfig;
  groundEffectFloor: GroundEffectFloorConfig;
  diffuser: DiffuserConfig;
  rearWing: RearWingConfig;
  canards: CanardArrayConfig;
  activeAero: ActiveAeroConfig;
  airspeedKmh: number;
  airDensityKgPerM3: number; // Standard 1.225
  ambientTempC: number;
  yawAngleDeg: number;
}

// ----------------------------------------------------------------------------
// 3. Physics & Surrogate Aerodynamic State
// ----------------------------------------------------------------------------

export interface ComponentAeroBreakdown {
  name: string;
  downforceN: number;
  dragN: number;
  cl: number;
  cd: number;
  projectedAreaM2: number;
  copXM: number; // Center of pressure X relative to front axle (m)
  copZM: number; // Center of pressure Z height (m)
  massKg: number;
  costUSD: number;
}

export interface AeroSurrogatePhysicsResult {
  airspeedKmh: number;
  totalDownforceN: number;
  frontDownforceN: number;
  rearDownforceN: number;
  aeroBalanceFrontPct: number; // Target 40-55%
  aeroBalanceRearPct: number;
  centerOfPressureXM: number; // m from front axle
  totalDragN: number;
  totalCl: number;
  totalCd: number;
  inducedDragN: number;
  profileDragN: number;
  coolingDragN: number;
  liftToDragRatio: number; // L/D efficiency
  porpoisingRiskPct: number;
  isFrontWingStalled: boolean;
  isDiffuserStalled: boolean;
  isRearWingStalled: boolean;
  components: {
    frontWing: ComponentAeroBreakdown;
    sidepods: ComponentAeroBreakdown;
    floor: ComponentAeroBreakdown;
    diffuser: ComponentAeroBreakdown;
    rearWing: ComponentAeroBreakdown;
    canards: ComponentAeroBreakdown;
  };
  lapSimulation: {
    lateralGAt200Kmh: number;
    topSpeedKmh: number;
    lapTimeDeltaS: number; // Negative = faster lap
    brakingStabilityIndex: number; // 0.0 - 1.0
    highSpeedUndersteerGradient: number; // deg/G
  };
  totalAeroMassKg: number;
  totalAeroCostUSD: number;
}

// ----------------------------------------------------------------------------
// 4. Asset JSON Schema Metadata Spec
// ----------------------------------------------------------------------------

export interface AeroAssetMetadata {
  id: string;
  name: string;
  category: AeroSubsystemId;
  baseAssetGlb?: string;
  version: string;
  author: string;
  parameterBounds: Record<string, { min: number; max: number; step: number; default: number; unit: string }>;
  aeroModel: {
    baseCl: number;
    baseCd: number;
    areaReferenceM2: number;
    groundEffectCoefficient?: number;
    stallAngleDeg?: number;
    sensitivity: Record<string, number>;
  };
  chassisCompatibility: string[];
  materials: {
    primary: string;
    secondary: string;
  };
}
