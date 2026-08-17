// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — GLOBAL ZUSTAND STORE
// ============================================================================
// Central reactive state management for vehicle body type, 50-chassis selection,
// 12-stage component assembly pipeline, material metallurgy, exploded view,
// and real-time physics dynamics computation.
// ============================================================================

import { create } from 'zustand';
import {
  VehicleBodyType,
  VehicleSubsystemStage,
  Assembly3DViewMode,
  CameraPreset,
  ModularVehicleConfiguration,
} from '../exterior3d/types/vehicleConstructionTypes';
import {
  ModularInteriorConfiguration,
  InteriorTrimGrade,
} from '../exterior3d/types/modularInteriorTypes';
import { BODY_TYPE_REGISTRY } from '../exterior3d/manifests/bodyTypeManifest';
import { CHASSIS_50_MAP, getChassisForBodyType } from '../exterior3d/manifests/chassis50Manifest';
import { MODULAR_COMPONENTS } from '../exterior3d/manifests/modularComponentManifest';
import { MaterialGrade } from '../sim/assemblyTypes';

interface VehicleConstructionState {
  // Master Selections
  activeBodyType: VehicleBodyType;
  activeChassisId: string;
  activeStage: VehicleSubsystemStage;
  installedStages: VehicleSubsystemStage[];
  
  // Component Selections per Stage
  componentSelections: Record<VehicleSubsystemStage, string>;
  materialGrades: Record<VehicleSubsystemStage, MaterialGrade>;

  // Modular Interior Subsystem State
  interiorConfig: ModularInteriorConfiguration;

  // Custom Parametric Dimensions
  wheelbaseMm: number;
  trackWidthFrontMm: number;
  trackWidthRearMm: number;
  rideHeightMm: number;

  // Viewport & Inspection State
  viewMode: Assembly3DViewMode;
  cameraPreset: CameraPreset;
  explodedViewProgress: number; // 0.0 (assembled) to 1.0 (fully exploded)
  isXRayActive: boolean;
  isWireframeActive: boolean;
  isRotating: boolean;

  // Actions
  setBodyType: (bodyType: VehicleBodyType) => void;
  setChassisId: (chassisId: string) => void;
  setActiveStage: (stage: VehicleSubsystemStage) => void;
  installStage: (stage: VehicleSubsystemStage) => void;
  removeStage: (stage: VehicleSubsystemStage) => void;
  setComponentForStage: (stage: VehicleSubsystemStage, componentId: string) => void;
  setMaterialGrade: (stage: VehicleSubsystemStage, grade: MaterialGrade) => void;
  updateInteriorConfig: (partial: Partial<VehicleConstructionState['interiorConfig']>) => void;
  setWheelbase: (mm: number) => void;
  setTrackWidthFront: (mm: number) => void;
  setTrackWidthRear: (mm: number) => void;
  setRideHeight: (mm: number) => void;
  setViewMode: (mode: Assembly3DViewMode) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  setExplodedViewProgress: (val: number) => void;
  toggleXRay: () => void;
  toggleWireframe: () => void;
  toggleRotating: () => void;
  resetToDefaults: () => void;

  // Computed Vehicle Performance
  getComputedMetrics: () => {
    totalMassKg: number;
    torsionalRigidityKNmPerDeg: number;
    estimated0to100Kph: number;
    estimatedTopSpeedKph: number;
    lateralG: number;
    brakingDist100to0M: number;
    totalBOMCostUSD: number;
    completionPercentage: number;
  };
}

export const useVehicleConstructionStore = create<VehicleConstructionState>((set, get) => ({
  // Default: Executive Sedan Chassis 01
  activeBodyType: 'sedan',
  activeChassisId: 'SEDAN_CHASSIS_01',
  activeStage: 'architecture',
  installedStages: ['architecture', 'chassis_platform'],

  componentSelections: {
    architecture: 'ARCH_SEDAN_RWD',
    chassis_platform: 'SEDAN_CHASSIS_01',
    powertrain_engine: 'ENGINE_MODULAR_V8_TWIN_TURBO',
    transmission: 'TRANS_7_SPEED_DCT',
    suspension: 'SUSP_DOUBLE_WISHBONE_RACE',
    wheels_brakes: 'BRAKES_CARBON_CERAMIC_420',
    body_structure: 'BODY_SEDAN_SAFETY_CELL',
    exterior_panels: 'PANELS_SEDAN_OEM',
    lighting_glass: 'LIGHTING_MATRIX_LED',
    aerodynamics: 'AERO_GT_PACKAGE_FULL',
    interior_cabin: 'CABIN_CARBON_SPORT_BUCKETS',
    electronics: 'ELEC_VIRTUAL_COCKPIT_PRO',
  },

  materialGrades: {
    architecture: 'forged',
    chassis_platform: 'forged',
    powertrain_engine: 'forged',
    transmission: 'forged',
    suspension: 'forged',
    wheels_brakes: 'titanium',
    body_structure: 'forged',
    exterior_panels: 'forged',
    lighting_glass: 'billet',
    aerodynamics: 'titanium',
    interior_cabin: 'forged',
    electronics: 'billet',
  },

  interiorConfig: {
    dashboardId: 'DASHBOARD_01_EXECUTIVE',
    instrumentClusterId: 'CLUSTER_VIRTUAL_COCKPIT_12_3',
    infotainmentScreenId: 'SCREEN_12_3_TOUCH',
    steeringWheelId: 'STEERING_FLAT_BOTTOM_SPORT',
    frontSeatsId: 'SEATS_SPORT_BOLSTERED',
    rearSeatsId: 'REAR_SEATS_COMFORT',
    centerConsoleId: 'CONSOLE_SPORT_GATED',
    doorCardsId: 'DOOR_CARDS_NAPPA',
    ambientLightingColorHex: '#06b6d4',
    ambientLightingBrightnessPct: 80,
    primaryTrimGrade: 'nappa_leather',
    accentTrimGrade: 'forged_carbon',
    audioPackageId: 'AUDIO_16_SPEAKER_3D',
  },

  wheelbaseMm: 2880,
  trackWidthFrontMm: 1610,
  trackWidthRearMm: 1620,
  rideHeightMm: 130,

  viewMode: '3d_glb',
  cameraPreset: 'front_3_4',
  explodedViewProgress: 0,
  isXRayActive: false,
  isWireframeActive: false,
  isRotating: false,

  updateInteriorConfig: (partial) =>
    set((state) => ({
      interiorConfig: { ...state.interiorConfig, ...partial },
    })),

  setBodyType: (bodyType) => {
    const availableChassis = getChassisForBodyType(bodyType);
    const firstChassis = availableChassis[0] || CHASSIS_50_MAP['SEDAN_CHASSIS_01'];
    const bodyMeta = BODY_TYPE_REGISTRY[bodyType];

    set({
      activeBodyType: bodyType,
      activeChassisId: firstChassis.id,
      wheelbaseMm: bodyMeta.typicalWheelbaseMm.default,
      trackWidthFrontMm: bodyMeta.typicalTrackWidthMm.default,
      trackWidthRearMm: bodyMeta.typicalTrackWidthMm.default + 10,
      rideHeightMm: firstChassis.rideHeightMm,
    });
  },

  setChassisId: (chassisId) => {
    const chassis = CHASSIS_50_MAP[chassisId];
    if (chassis) {
      set({
        activeChassisId: chassisId,
        wheelbaseMm: chassis.wheelbaseMm,
        trackWidthFrontMm: chassis.trackWidthFrontMm,
        trackWidthRearMm: chassis.trackWidthRearMm,
        rideHeightMm: chassis.rideHeightMm,
      });
    }
  },

  setActiveStage: (stage) => set({ activeStage: stage }),

  installStage: (stage) =>
    set((state) => {
      if (!state.installedStages.includes(stage)) {
        return { installedStages: [...state.installedStages, stage] };
      }
      return state;
    }),

  removeStage: (stage) =>
    set((state) => ({
      installedStages: state.installedStages.filter((s) => s !== stage),
    })),

  setComponentForStage: (stage, componentId) =>
    set((state) => ({
      componentSelections: { ...state.componentSelections, [stage]: componentId },
    })),

  setMaterialGrade: (stage, grade) =>
    set((state) => ({
      materialGrades: { ...state.materialGrades, [stage]: grade },
    })),

  setWheelbase: (mm) => set({ wheelbaseMm: mm }),
  setTrackWidthFront: (mm) => set({ trackWidthFrontMm: mm }),
  setTrackWidthRear: (mm) => set({ trackWidthRearMm: mm }),
  setRideHeight: (mm) => set({ rideHeightMm: mm }),

  setViewMode: (mode) => set({ viewMode: mode }),
  setCameraPreset: (preset) => set({ cameraPreset: preset }),
  setExplodedViewProgress: (val) => set({ explodedViewProgress: Math.max(0, Math.min(1, val)) }),
  toggleXRay: () => set((state) => ({ isXRayActive: !state.isXRayActive })),
  toggleWireframe: () => set((state) => ({ isWireframeActive: !state.isWireframeActive })),
  toggleRotating: () => set((state) => ({ isRotating: !state.isRotating })),

  resetToDefaults: () =>
    set({
      activeBodyType: 'sedan',
      activeChassisId: 'SEDAN_CHASSIS_01',
      activeStage: 'architecture',
      installedStages: ['architecture', 'chassis_platform'],
      explodedViewProgress: 0,
      isXRayActive: false,
      viewMode: '3d_glb',
    }),

  getComputedMetrics: () => {
    const state = get();
    const chassis = CHASSIS_50_MAP[state.activeChassisId] || CHASSIS_50_MAP['SEDAN_CHASSIS_01'];

    // Base chassis mass & cost
    let totalMass = chassis.baseMassKg;
    let totalCost = chassis.manufacturingCostBOM;
    let totalRigidity = chassis.torsionalRigidityKNmPerDeg;

    // Metallurgy multipliers
    const gradeMultipliers: Record<MaterialGrade, { mass: number; cost: number; rigidityAdd: number }> = {
      cast: { mass: 1.0, cost: 1.0, rigidityAdd: 0 },
      forged: { mass: 0.85, cost: 1.4, rigidityAdd: 6.0 },
      billet: { mass: 0.75, cost: 1.9, rigidityAdd: 14.0 },
      titanium: { mass: 0.60, cost: 3.8, rigidityAdd: 24.0 },
      ceramic: { mass: 0.55, cost: 4.2, rigidityAdd: 28.0 },
    };

    const chassisGrade = state.materialGrades.chassis_platform || 'forged';
    const mult = gradeMultipliers[chassisGrade];
    totalMass *= mult.mass;
    totalCost *= mult.cost;
    totalRigidity += mult.rigidityAdd;

    // Add installed component masses and costs
    for (const stage of state.installedStages) {
      if (stage === 'chassis_platform' || stage === 'architecture') continue;
      const compId = state.componentSelections[stage];
      const comp = MODULAR_COMPONENTS.find((c) => c.id === compId);
      if (comp) {
        const stageGrade = state.materialGrades[stage] || 'forged';
        const sMult = gradeMultipliers[stageGrade];
        totalMass += comp.massKg * sMult.mass;
        totalCost += comp.costUSD * sMult.cost;
        totalRigidity += comp.torsionalStiffnessDeltaKNm;
      }
    }

    // Add nominal cabin shell mass if body installed
    totalMass += 650; // Engine, cabin, wiring baseline

    // Performance calculations
    const hp = 650; // Base engine hp
    const powerToWeight = hp / (totalMass / 1000);
    const estimated0to100 = Math.max(1.8, parseFloat((11.5 / Math.sqrt(powerToWeight)).toFixed(2)));
    const estimatedTopSpeed = Math.min(395, Math.round(180 + Math.sqrt(hp) * 4.8));
    const lateralG = parseFloat((1.05 + (totalRigidity / 120)).toFixed(2));
    const brakingDist = parseFloat((42 - (lateralG * 6.5)).toFixed(1));
    const completionPct = Math.round((state.installedStages.length / 12) * 100);

    return {
      totalMassKg: Math.round(totalMass),
      torsionalRigidityKNmPerDeg: parseFloat(totalRigidity.toFixed(1)),
      estimated0to100Kph: estimated0to100,
      estimatedTopSpeedKph: estimatedTopSpeed,
      lateralG: lateralG,
      brakingDist100to0M: brakingDist,
      totalBOMCostUSD: Math.round(totalCost),
      completionPercentage: completionPct,
    };
  },
}));
