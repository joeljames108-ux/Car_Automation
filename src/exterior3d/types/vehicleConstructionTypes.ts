// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — MASTER TYPE DEFINITIONS
// ============================================================================
// Defines complete geometric data structures, 10 body types, 50 base chassis
// platforms, 12 assembly subsystem stages, universal 3D attachment points,
// component metadata, variant metallurgy grades, and vehicle configuration schema.
// ============================================================================

import { MaterialGrade } from '../../sim/assemblyTypes';

// ============================================================================
// 1. 10 BODY TYPES TAXONOMY
// ============================================================================

export type VehicleBodyType =
  | 'sedan'
  | 'coupe'
  | 'hatchback'
  | 'suv'
  | 'wagon'
  | 'convertible'
  | 'sports_car'
  | 'supercar'
  | 'hypercar'
  | 'pickup';

export interface BodyTypeMetadata {
  id: VehicleBodyType;
  name: string;
  category: 'Passenger' | 'Utility' | 'Performance' | 'Exotic';
  description: string;
  typicalWheelbaseMm: { min: number; max: number; default: number };
  typicalTrackWidthMm: { min: number; max: number; default: number };
  typicalLengthMm: number;
  typicalWidthMm: number;
  typicalHeightMm: number;
  baseDragCoefficientCd: number;
  frontalAreaSqM: number;
  compatibleChassisIds: string[];
  icon: string;
  badge: string;
}

// ============================================================================
// 2. 50 CHASSIS ARCHITECTURES (10 BODY TYPES × 5 CHASSIS)
// ============================================================================

export type ChassisArchitectureClass =
  | 'aluminum_monocoque'
  | 'steel_unibody'
  | 'carbon_composite_monocell'
  | 'hydroformed_spaceframe'
  | 'tubular_spaceframe'
  | 'heavy_duty_ladder_frame'
  | 'skateboard_ev_platform'
  | 'hybrid_cast_extruded'
  | 'transaxle_backbone'
  | 'f1_prepreg_monocoque';

export interface ChassisHardpointSpec {
  nodeId: string;
  relativePosMm: [number, number, number]; // [X=forward, Y=up, Z=right]
  normalAxis: [number, number, number];
  allowedComponentTypes: VehicleSubsystemStage[];
  maxPayloadKg: number;
  description: string;
}

export interface Chassis50Definition {
  id: string; // e.g. "SEDAN_CHASSIS_01"
  bodyType: VehicleBodyType;
  chassisIndex: 1 | 2 | 3 | 4 | 5;
  name: string;
  architectureClass: ChassisArchitectureClass;
  tagline: string;
  description: string;
  baseMassKg: number;
  torsionalRigidityKNmPerDeg: number;
  wheelbaseMm: number;
  trackWidthFrontMm: number;
  trackWidthRearMm: number;
  rideHeightMm: number;
  groundClearanceMm: number;
  engineBayVolumeLitres: number;
  supportedEngineLayouts: ('I4' | 'V6' | 'V8' | 'V10' | 'V12' | 'BOXER_4' | 'BOXER_6' | 'EV_DUAL' | 'EV_QUAD')[];
  supportedDriveTypes: ('fwd' | 'rwd' | 'awd')[];
  manufacturingCostBOM: number;
  hardpoints: ChassisHardpointSpec[];
  keyAdvantages: string[];
  materialGradeDefault: MaterialGrade;
}

// ============================================================================
// 3. 12 ASSEMBLY SUBSYSTEM STAGES
// ============================================================================

export type VehicleSubsystemStage =
  | 'architecture'       // #0 Core platform & powertrain layout
  | 'chassis_platform'   // #1 Base chassis monocoque / frame
  | 'powertrain_engine'  // #2 Engine block, cylinder heads & intake
  | 'transmission'       // #3 Gearbox, prop-shaft & differentials
  | 'suspension'         // #4 Front & rear subframes, control arms & coilovers
  | 'wheels_brakes'      // #5 Rotors, calipers, wheel rims & tires
  | 'body_structure'     // #6 Firewall, cowl tray, A/B/C pillars & roof bows
  | 'exterior_panels'    // #7 Doors, hood, trunk, fenders & bumpers
  | 'lighting_glass'     // #8 Headlights, taillights & laminated optical glass
  | 'aerodynamics'       // #9 Splitter, diffuser, canards & rear wing
  | 'interior_cabin'     // #10 Dashboard, steering wheel, seats & console
  | 'electronics';       // #11 Virtual cockpit, ADAS cameras & HV battery

export interface SubsystemStageMeta {
  stage: VehicleSubsystemStage;
  stageNumber: number;
  title: string;
  shortName: string;
  category: 'Foundation' | 'Mechanical' | 'Structural' | 'Exterior' | 'Cabin & Systems';
  icon: string;
  requiredParentStages: VehicleSubsystemStage[];
  description: string;
}

// ============================================================================
// 4. UNIVERSAL 3D ATTACHMENT POINT SYSTEM
// ============================================================================

export interface AttachmentPoint3D {
  id: string;
  parentNodeId?: string;
  localPosition: [number, number, number]; // in meters for Three.js
  localRotation: [number, number, number]; // Euler angles in radians
  scale: [number, number, number];
  subsystem: VehicleSubsystemStage;
  isOccupied: boolean;
  attachedComponentId?: string;
  torqueSpecNm?: number;
}

export interface AttachmentTransformResult {
  worldPosition: [number, number, number];
  worldRotation: [number, number, number, number]; // Quaternion [x, y, z, w]
  worldScale: [number, number, number];
  isValid: boolean;
  errorMessage?: string;
}

// ============================================================================
// 5. MODULAR glTF COMPONENT REGISTRY & METADATA
// ============================================================================

export interface ModularComponentMeta {
  id: string;
  name: string;
  subsystem: VehicleSubsystemStage;
  compatibleBodyTypes: VehicleBodyType[];
  compatibleChassisIds: string[];
  parentAttachmentNodeId: string;
  localOffsetMeters: [number, number, number];
  localRotationEuler: [number, number, number];
  massKg: number;
  dragDeltaCd: number;
  downforceKgAt200Kph: number;
  torsionalStiffnessDeltaKNm: number;
  costUSD: number;
  availableMaterials: MaterialGrade[];
  defaultMaterial: MaterialGrade;
  description: string;
  lodAssetUrls?: {
    lod0: string;
    lod1: string;
    lod2: string;
    lod3: string;
  };
}

// ============================================================================
// 6. MASTER VEHICLE CONFIGURATION OBJECT SCHEMA
// ============================================================================

export interface ModularVehicleConfiguration {
  version: string;
  timestamp: number;
  name: string;
  bodyType: VehicleBodyType;
  chassisId: string;
  
  // Subsystem Component Selections
  subsystems: {
    architecture: {
      driveType: 'fwd' | 'rwd' | 'awd';
      enginePosition: 'front' | 'mid' | 'rear';
      wheelbaseMm: number;
      trackWidthMm: number;
      rideHeightMm: number;
    };
    chassis_platform: {
      componentId: string;
      materialGrade: MaterialGrade;
    };
    powertrain_engine: {
      engineConfigId: string;
      engineType: 'I4' | 'V6' | 'V8' | 'V10' | 'V12' | 'BOXER_6' | 'EV_DUAL';
      displacementLitres: number;
      forcedInduction: 'na' | 'turbo' | 'twin_turbo' | 'supercharged';
      peakHorsepower: number;
      peakTorqueNm: number;
      materialGrade: MaterialGrade;
    };
    transmission: {
      componentId: string;
      transmissionType: 'manual_6' | 'dct_7' | 'dct_8' | 'seq_6' | 'single_speed';
      gearCount: number;
      finalDriveRatio: number;
      materialGrade: MaterialGrade;
    };
    suspension: {
      frontType: 'double_wishbone' | 'macpherson' | 'pushrod';
      rearType: 'multilink' | 'double_wishbone' | 'pushrod';
      springRateFrontNmm: number;
      springRateRearNmm: number;
      damperStiffnessPct: number;
      antiRollBarF: number;
      antiRollBarR: number;
      materialGrade: MaterialGrade;
    };
    wheels_brakes: {
      wheelDiameterInch: number;
      wheelWidthInch: number;
      tireCompound: 'hard' | 'medium' | 'soft' | 'supersoft' | 'slick';
      brakeType: 'slotted_steel' | 'cast_iron' | 'carbon_ceramic';
      rotorDiameterMm: number;
      pistonCount: number;
      materialGrade: MaterialGrade;
    };
    body_structure: {
      componentId: string;
      materialGrade: MaterialGrade;
      rollCageInstalled: boolean;
    };
    exterior_panels: {
      hoodStyle: 'oem' | 'vented_carbon' | 'power_bulge';
      fenderStyle: 'oem' | 'widebody' | 'louvered';
      doorStyle: 'oem' | 'carbon_lightweight' | 'dihedral';
      roofStyle: 'solid' | 'panoramic_glass' | 'carbon_fiber';
      paintFinish: 'gloss' | 'matte' | 'metallic' | 'carbon_weave';
      paintColorHex: string;
      materialGrade: MaterialGrade;
    };
    lighting_glass: {
      headlightTech: 'matrix_led' | 'laser_beam' | 'bi_xenon';
      taillightTech: 'oled_bar' | 'sequential_led';
      glassTintPct: number;
      electrochromicGlass: boolean;
      materialGrade: MaterialGrade;
    };
    aerodynamics: {
      frontSplitterInstalled: boolean;
      canardsInstalled: boolean;
      rearDiffuserInstalled: boolean;
      rearWingType: 'none' | 'ducktail' | 'gt_wing' | 'active_drs';
      wingAngleOfAttackDeg: number;
      materialGrade: MaterialGrade;
    };
    interior_cabin: {
      seatType: 'comfort_leather' | 'sport_bucket' | 'carbon_race_shell';
      steeringWheelType: 'sport_round' | 'flat_bottom' | 'yoke_gt3';
      trimMaterial: 'leather' | 'alcantara' | 'carbon_inlay' | 'aluminum';
      materialGrade: MaterialGrade;
    };
    electronics: {
      cockpitDisplay: 'analog_digital' | 'virtual_cockpit' | 'curved_oled';
      adasLevel: 'none' | 'level_2_assist' | 'track_telemetry_pro';
      batteryPackKwh?: number;
      materialGrade: MaterialGrade;
    };
  };

  // Live Computed Engineering Aggregates
  computedMetrics: {
    totalCurbWeightKg: number;
    weightDistributionFrontPct: number;
    overallTorsionalRigidityKNmPerDeg: number;
    centerOfGravityHeightMm: number;
    aerodynamicDragCd: number;
    downforceKgAt200Kph: number;
    estimated0to100KphSeconds: number;
    estimatedTopSpeedKph: number;
    skidpadLateralG: number;
    braking100to0DistanceMeters: number;
    totalBOMCostUSD: number;
  };
}

// ============================================================================
// 7. ASSEMBLY VIEW MODES & UI STATE
// ============================================================================

export type Assembly3DViewMode = '2d_blueprint' | '3d_isometric' | '3d_glb' | 'xray_structural';

export type CameraPreset = 'front_3_4' | 'rear_3_4' | 'side_profile' | 'top_chassis' | 'undercarriage' | 'cockpit';
