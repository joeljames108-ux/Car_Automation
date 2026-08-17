// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — ASSET CONTRACT SPECIFICATION
// ============================================================================
// Strict contracts ensuring all 3D assets comply with real-world automotive
// proportions, structural mounting interfaces, PBR materials, LOD budgets,
// normal map channel requirements, and deterministic assembly constraints.
// ============================================================================

import { VehicleBodyType, VehicleSubsystemStage } from '../types/vehicleConstructionTypes';
import { MaterialGrade } from '../../sim/assemblyTypes';

// ============================================================================
// 1. FASTENER & STRUCTURAL SOCKET DEFINITIONS
// ============================================================================

export type FastenerClass =
  | 'M8_GRADE_8_8'
  | 'M10_GRADE_10_9'
  | 'M12_GRADE_12_9'
  | 'M14_TITANIUM_MOTORSPORT'
  | 'CENTERLOCK_NUT_AEROSPACE'
  | 'STRUCTURAL_ADHESIVE_BOND'
  | 'LASER_SEAM_WELD';

export interface AttachmentSocketSpec {
  socketId: string;
  name: string;
  allowedSubsystems: VehicleSubsystemStage[];
  relativePositionM: [number, number, number]; // [X lateral, Y vertical, Z longitudinal]
  normalVector: [number, number, number]; // Outward normal vector
  upVector: [number, number, number]; // Alignment vector
  fastenerClass: FastenerClass;
  boltCount: number;
  torqueRatingNm: number;
  isLoadBearing: boolean;
  maxTensileLoadKN: number;
  maxShearLoadKN: number;
}

// ============================================================================
// 2. LEVEL OF DETAIL & TEXTURE BUDGETS
// ============================================================================

export type DetailLODLevel = 'LOD0_HERO' | 'LOD1_FUNCTIONAL' | 'LOD2_BACKGROUND';

export interface LODBudgetSpec {
  lodLevel: DetailLODLevel;
  maxTriangles: number;
  minTriangles: number;
  maxDrawCalls: number;
  requiredTextureMaps: Array<'diffuse_albedo' | 'normal_tangent' | 'roughness' | 'metallic' | 'ambient_occlusion' | 'clearcoat' | 'emissive'>;
  maxTextureResolution: 512 | 1024 | 2048 | 4096;
}

// ============================================================================
// 3. MASTER ASSET CONTRACT INTERFACE
// ============================================================================

export interface BaseAutomotiveAssetContract {
  assetId: string;
  name: string;
  subsystem: VehicleSubsystemStage;
  compatibleBodyTypes: VehicleBodyType[];
  compatibleChassisIds: string[];
  
  // Physical & Kinematic Dimensions
  massKg: number;
  centerOfMassOffsetM: [number, number, number]; // [X, Y, Z]
  boundingDimensionsM: {
    lengthM: number;
    widthM: number;
    heightM: number;
  };
  
  // Structural Properties
  torsionalStiffnessContributionNmPerDeg: number;
  materialGrade: MaterialGrade;
  
  // Sockets & Mountings
  parentSocketTargetId: string;
  providedSockets: AttachmentSocketSpec[];
  
  // Budgets & Shader Pipeline
  lodBudget: LODBudgetSpec;
  requiredMaterialSlots: string[];
  
  // Quality Gate Certification Metadata
  homologationStatus: 'unverified' | 'passed_quality_gate' | 'rejected';
  qualityGateScorePct: number;
}

// ============================================================================
// 4. SUBSYSTEM-SPECIFIC CONTRACTS
// ============================================================================

export interface ChassisAssetContract extends BaseAutomotiveAssetContract {
  subsystem: 'chassis_platform';
  wheelbaseRangeMm: [number, number];
  trackWidthFrontRangeMm: [number, number];
  trackWidthRearRangeMm: [number, number];
  groundClearanceNominalMm: number;
  engineBayVolumeLiters: number;
  tunnelWidthMm: number;
  firewallPositionZM: number;
  frontAxlePositionZM: number;
  rearAxlePositionZM: number;
  hasIntegratedRollCage: boolean;
  suspensionPickupsType: 'double_wishbone' | 'macpherson_strut' | 'multi_link_5' | 'pushrod_bellcrank';
}

export interface PowertrainAssetContract extends BaseAutomotiveAssetContract {
  subsystem: 'powertrain_engine';
  engineDisplacementCC: number;
  cylinderConfiguration: 'V12' | 'V8' | 'V6' | 'I6' | 'I4' | 'DUAL_EV_MOTOR';
  peakPowerHP: number;
  peakTorqueNm: number;
  bellhousingStandard: 'SAE_3' | 'BELLHOUSING_LONGITUDINAL_SPORT' | 'TRANSAXLE_INTEGRATED';
  exhaustPortCount: number;
  engineMountSpacingMm: number;
}

export interface SuspensionAssetContract extends BaseAutomotiveAssetContract {
  subsystem: 'suspension';
  suspensionLayout: 'double_wishbone' | 'multi_link' | 'macpherson' | 'pushrod';
  maxTravelJounceMm: number;
  maxTravelReboundMm: number;
  springRateNPerMm: number;
  antiRollBarStiffnessNmPerDeg: number;
  camberAdjustmentRangeDeg: [number, number];
  casterAngleDeg: number;
}

export interface BrakeAssetContract extends BaseAutomotiveAssetContract {
  subsystem: 'wheels_brakes';
  rotorDiameterMm: number;
  rotorThicknessMm: number;
  rotorMaterial: 'grey_cast_iron' | 'carbon_ceramic' | 'drilled_slotted_steel';
  caliperPistonCount: 2 | 4 | 6 | 8 | 10;
  caliperConstruction: 'cast_sliding' | 'forged_monobloc' | 'billet_titanium';
  clampingForceKN: number;
}

export interface WheelAssetContract extends BaseAutomotiveAssetContract {
  subsystem: 'wheels_brakes';
  rimDiameterInches: number;
  rimWidthInches: number;
  tireSectionWidthMm: number;
  aspectRatio: number;
  tireTreadWearRating: number;
  wheelOffsetETMm: number;
  boltPattern: '5x114.3' | '5x120' | '5x130' | 'CENTERLOCK';
}

export interface ClosuresAeroAssetContract extends BaseAutomotiveAssetContract {
  subsystem: 'exterior_panels' | 'aerodynamics';
  shutLineToleranceMm: number;
  dragCoefficientDeltaCd: number;
  downforceDeltaKgAt200Kmh: number;
  panelThicknessMm: number;
  hingeType?: 'conventional_forward' | 'swan_neck_dihedral' | 'scissor' | 'gullwing';
}

export interface InteriorAssetContract extends BaseAutomotiveAssetContract {
  subsystem: 'interior_cabin';
  cabinVolumeLiters: number;
  seatingCapacity: 1 | 2 | 4 | 5 | 7;
  airbagModuleCount: number;
  hvacZoneCount: 1 | 2 | 4;
  infotainmentDisplaySizeInches: number;
}
