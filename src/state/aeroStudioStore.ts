import { create } from 'zustand';
import {
  MasterAeroStudioConfig,
  AeroSurrogatePhysicsResult,
  AeroPackagePresetId,
  AeroVisualMode,
} from '../sim/aerodynamics/aeroStudioTypes';
import { SurrogateAeroPhysicsEngine } from '../sim/aerodynamics/surrogateAeroPhysicsEngine';
import { useModularVehicleBuilderStore, getCompleteVehicleGlbPath } from './modularVehicleBuilderStore';

export type AeroStudioSubTab =
  | 'frontAero'
  | 'rearAero'
  | 'sideAero'
  | 'underbody'
  | 'roofAero'
  | 'activeAero'
  | 'coolingAero'
  | 'wheelAero'
  | 'aeroSummary';

export type AeroComponentId =
  | 'frontSplitter'
  | 'canards'
  | 'airCurtains'
  | 'rearWing'
  | 'rearSpoiler'
  | 'diffuser'
  | 'underbodyFloor'
  | 'sideSkirts'
  | 'undertrayFloor'
  | 'activeAero'
  | 'activeWing'
  | 'activeAirbrake'
  | 'roofAero'
  | 'roofFin'
  | 'vortexGenerators'
  | 'coolingAero'
  | 'coolingLouvers'
  | 'brakeDucts'
  | 'wheelAero'
  | 'wheelDiscs'
  | 'wheelSpats';

export type AeroCameraPresetId =
  | AeroComponentId
  | 'vehicleOverview'
  | 'rearWingDefault'
  | 'rearWingAngleInspection'
  | 'rearWingProfile'
  | 'rearWingFullCar'
  | 'rearSpoilerDefault'
  | 'rearSpoilerDecklid'
  | 'frontSplitterDefault'
  | 'frontSplitterLowCenter'
  | 'canardsClose'
  | 'underbodyFloorDefault'
  | 'underbodyTunnels';

export type VehicleArchitecture =
  | 'sedan'
  | 'coupe'
  | 'suv'
  | 'hatchback'
  | 'crossover'
  | 'wagon'
  | 'shooting_brake'
  | 'pickup'
  | 'hypercar'
  | 'supercar'
  | 'offroad'
  | 'dune_buggy';

export interface VehicleArchitectureSpec {
  id: VehicleArchitecture;
  label: string;
  badge: string;
  compatibleComponents: AeroComponentId[];
  allowedSubTabs: AeroStudioSubTab[];
  defaultRearAero: 'rearWing' | 'rearSpoiler';
  activeAeroSupported: boolean;
}

export const VEHICLE_ARCHITECTURES: Record<VehicleArchitecture, VehicleArchitectureSpec> = {
  sedan: {
    id: 'sedan',
    label: 'Sport Touring Sedan',
    badge: 'Executive Touring • BTCC Spec',
    compatibleComponents: [
      'frontSplitter', 'canards', 'airCurtains', 'rearWing', 'rearSpoiler', 'diffuser',
      'underbodyFloor', 'sideSkirts', 'coolingLouvers', 'brakeDucts', 'wheelDiscs'
    ],
    allowedSubTabs: [
      'frontAero', 'rearAero', 'sideAero', 'underbody', 'coolingAero', 'wheelAero', 'aeroSummary'
    ],
    defaultRearAero: 'rearSpoiler',
    activeAeroSupported: false,
  },
  coupe: {
    id: 'coupe',
    label: 'GT Fastback Coupe',
    badge: 'FIA GT3 Homologation',
    compatibleComponents: [
      'frontSplitter', 'canards', 'airCurtains', 'rearWing', 'rearSpoiler', 'diffuser',
      'underbodyFloor', 'sideSkirts', 'activeWing', 'coolingLouvers', 'brakeDucts', 'wheelDiscs'
    ],
    allowedSubTabs: [
      'frontAero', 'rearAero', 'sideAero', 'underbody', 'activeAero', 'coolingAero', 'wheelAero', 'aeroSummary'
    ],
    defaultRearAero: 'rearWing',
    activeAeroSupported: true,
  },
  suv: {
    id: 'suv',
    label: 'High-Performance SUV',
    badge: 'Track Pack Aero CUV',
    compatibleComponents: [
      'frontSplitter', 'canards', 'rearSpoiler', 'diffuser', 'sideSkirts',
      'roofFin', 'brakeDucts', 'wheelDiscs'
    ],
    allowedSubTabs: [
      'frontAero', 'rearAero', 'sideAero', 'underbody', 'roofAero', 'coolingAero', 'wheelAero', 'aeroSummary'
    ],
    defaultRearAero: 'rearSpoiler',
    activeAeroSupported: false,
  },
  hatchback: {
    id: 'hatchback',
    label: 'Hot Hatch Clubsport',
    badge: 'TCR Cup Aero Spec',
    compatibleComponents: [
      'frontSplitter', 'canards', 'rearSpoiler', 'rearWing', 'diffuser', 'sideSkirts',
      'roofFin', 'brakeDucts', 'wheelDiscs'
    ],
    allowedSubTabs: [
      'frontAero', 'rearAero', 'sideAero', 'underbody', 'roofAero', 'coolingAero', 'wheelAero', 'aeroSummary'
    ],
    defaultRearAero: 'rearSpoiler',
    activeAeroSupported: false,
  },
  crossover: {
    id: 'crossover',
    label: 'Dynamic Multi-Purpose CUV',
    badge: 'Versatile CUV Aero',
    compatibleComponents: [
      'frontSplitter', 'rearSpoiler', 'diffuser', 'sideSkirts',
      'coolingLouvers', 'brakeDucts', 'wheelDiscs'
    ],
    allowedSubTabs: [
      'frontAero', 'rearAero', 'sideAero', 'underbody', 'coolingAero', 'wheelAero', 'aeroSummary'
    ],
    defaultRearAero: 'rearSpoiler',
    activeAeroSupported: false,
  },
  wagon: {
    id: 'wagon',
    label: 'Station Wagon Tourer',
    badge: 'Extended Aerodynamic Cargo',
    compatibleComponents: [
      'frontSplitter', 'rearSpoiler', 'diffuser', 'sideSkirts',
      'roofFin', 'coolingLouvers', 'brakeDucts', 'wheelDiscs'
    ],
    allowedSubTabs: [
      'frontAero', 'rearAero', 'sideAero', 'underbody', 'roofAero', 'coolingAero', 'wheelAero', 'aeroSummary'
    ],
    defaultRearAero: 'rearSpoiler',
    activeAeroSupported: false,
  },
  shooting_brake: {
    id: 'shooting_brake',
    label: 'Shooting Brake GT',
    badge: 'Sleek 2-Door Sport Tourer',
    compatibleComponents: [
      'frontSplitter', 'canards', 'rearSpoiler', 'diffuser', 'sideSkirts',
      'coolingLouvers', 'brakeDucts', 'wheelDiscs'
    ],
    allowedSubTabs: [
      'frontAero', 'rearAero', 'sideAero', 'underbody', 'coolingAero', 'wheelAero', 'aeroSummary'
    ],
    defaultRearAero: 'rearSpoiler',
    activeAeroSupported: false,
  },
  pickup: {
    id: 'pickup',
    label: 'Workhorse Pickup Truck',
    badge: 'Heavy-Duty Aero Bed',
    compatibleComponents: [
      'frontSplitter', 'rearSpoiler', 'diffuser', 'sideSkirts',
      'brakeDucts', 'wheelDiscs'
    ],
    allowedSubTabs: [
      'frontAero', 'rearAero', 'sideAero', 'underbody', 'coolingAero', 'wheelAero', 'aeroSummary'
    ],
    defaultRearAero: 'rearSpoiler',
    activeAeroSupported: false,
  },
  hypercar: {
    id: 'hypercar',
    label: 'Hypercar Monocoque',
    badge: 'Class-1 Le Mans LMH Spec',
    compatibleComponents: [
      'frontSplitter', 'canards', 'airCurtains', 'rearWing', 'rearSpoiler', 'diffuser',
      'underbodyFloor', 'undertrayFloor', 'sideSkirts', 'activeWing', 'activeAirbrake',
      'roofFin', 'vortexGenerators', 'coolingLouvers', 'brakeDucts', 'wheelDiscs', 'wheelSpats'
    ],
    allowedSubTabs: [
      'frontAero', 'rearAero', 'sideAero', 'underbody', 'roofAero',
      'activeAero', 'coolingAero', 'wheelAero', 'aeroSummary'
    ],
    defaultRearAero: 'rearWing',
    activeAeroSupported: true,
  },
  supercar: {
    id: 'supercar',
    label: 'Mid-Engine Supercar',
    badge: 'GT2 / Nürburgring Spec',
    compatibleComponents: [
      'frontSplitter', 'canards', 'airCurtains', 'rearWing', 'rearSpoiler', 'diffuser',
      'underbodyFloor', 'sideSkirts', 'activeWing', 'roofFin',
      'coolingLouvers', 'brakeDucts', 'wheelDiscs'
    ],
    allowedSubTabs: [
      'frontAero', 'rearAero', 'sideAero', 'underbody', 'roofAero',
      'activeAero', 'coolingAero', 'wheelAero', 'aeroSummary'
    ],
    defaultRearAero: 'rearWing',
    activeAeroSupported: true,
  },
  offroad: {
    id: 'offroad',
    label: 'Expedition 4x4',
    badge: 'Heavy Off-Road Rigid Frame',
    compatibleComponents: [
      'frontSplitter', 'rearSpoiler', 'diffuser', 'sideSkirts',
      'brakeDucts', 'wheelDiscs'
    ],
    allowedSubTabs: [
      'frontAero', 'rearAero', 'sideAero', 'underbody', 'coolingAero', 'wheelAero', 'aeroSummary'
    ],
    defaultRearAero: 'rearSpoiler',
    activeAeroSupported: false,
  },
  dune_buggy: {
    id: 'dune_buggy',
    label: 'Dune Buggy Spaceframe',
    badge: 'Tubular Frame Sand Runner',
    compatibleComponents: [
      'frontSplitter', 'rearWing', 'rearSpoiler', 'diffuser',
      'brakeDucts', 'wheelDiscs'
    ],
    allowedSubTabs: [
      'frontAero', 'rearAero', 'underbody', 'coolingAero', 'wheelAero', 'aeroSummary'
    ],
    defaultRearAero: 'rearWing',
    activeAeroSupported: false,
  },
};

/**
 * Resolves the genuine 3D binary GLB model corresponding to the vehicle produced/selected in Vehicle Studio
 */
export function resolveHostVehicleGlb(variant: string): string {
  return getCompleteVehicleGlbPath(variant);
}

export interface CameraViewDef {
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
}

export const AERO_CAMERA_VIEWS: Record<AeroCameraPresetId, CameraViewDef> = {
  vehicleOverview: {
    position: [3.4, 1.8, -2.8],
    target: [0.0, 0.5, 0.0],
    fov: 42,
  },
  // Front Aero Views (Front is -Z)
  frontSplitter: {
    position: [1.6, 0.45, -2.9],
    target: [0.0, 0.12, -2.30],
    fov: 38,
  },
  frontSplitterDefault: {
    position: [1.6, 0.45, -2.9],
    target: [0.0, 0.12, -2.30],
    fov: 38,
  },
  frontSplitterLowCenter: {
    position: [0.0, 0.32, -3.15],
    target: [0.0, 0.10, -2.30],
    fov: 36,
  },
  canards: {
    position: [1.55, 0.75, -2.5],
    target: [0.92, 0.52, -2.10],
    fov: 34,
  },
  canardsClose: {
    position: [1.35, 0.65, -2.35],
    target: [0.88, 0.50, -2.12],
    fov: 30,
  },
  airCurtains: {
    position: [1.65, 0.50, -2.4],
    target: [0.85, 0.35, -1.95],
    fov: 36,
  },
  // Rear Wing Multi-Angle Studio Cameras (Rear is +Z)
  rearWing: {
    position: [1.75, 1.65, 2.85],
    target: [0.0, 1.15, 2.15],
    fov: 35,
  },
  rearWingDefault: {
    position: [1.75, 1.65, 2.85],
    target: [0.0, 1.15, 2.15],
    fov: 35,
  },
  rearWingAngleInspection: {
    position: [2.15, 1.25, 2.40],
    target: [0.15, 1.10, 2.15],
    fov: 32,
  },
  rearWingProfile: {
    position: [2.55, 1.05, 2.15],
    target: [0.0, 1.10, 2.15],
    fov: 28,
  },
  rearWingFullCar: {
    position: [3.30, 1.85, 3.20],
    target: [0.0, 0.60, 0.40],
    fov: 42,
  },
  // Rear Spoiler Views (Section 9)
  rearSpoiler: {
    position: [1.40, 1.30, 2.55],
    target: [0.0, 0.95, 2.05],
    fov: 36,
  },
  rearSpoilerDefault: {
    position: [1.40, 1.30, 2.55],
    target: [0.0, 0.95, 2.05],
    fov: 36,
  },
  rearSpoilerDecklid: {
    position: [0.95, 1.25, 2.35],
    target: [0.0, 0.98, 2.00],
    fov: 32,
  },
  // Underbody Views (Section 11)
  diffuser: {
    position: [1.45, 0.12, 2.6],
    target: [0.0, 0.18, 1.95],
    fov: 38,
  },
  underbodyFloor: {
    position: [2.2, -0.25, 0.0],
    target: [0.0, 0.08, 0.0],
    fov: 42,
  },
  underbodyFloorDefault: {
    position: [2.2, -0.25, 0.0],
    target: [0.0, 0.08, 0.0],
    fov: 42,
  },
  underbodyTunnels: {
    position: [1.75, -0.32, 0.75],
    target: [0.42, 0.05, 0.55],
    fov: 36,
  },
  sideSkirts: {
    position: [2.3, 0.35, 0.1],
    target: [0.98, 0.14, 0.0],
    fov: 38,
  },
  undertrayFloor: {
    position: [2.2, -0.25, 0.0],
    target: [0.0, 0.08, 0.0],
    fov: 42,
  },
  activeAero: {
    position: [1.8, 1.45, 2.75],
    target: [0.0, 1.10, 2.12],
    fov: 36,
  },
  activeWing: {
    position: [1.8, 1.45, 2.75],
    target: [0.0, 1.10, 2.12],
    fov: 36,
  },
  activeAirbrake: {
    position: [1.8, 1.45, 2.75],
    target: [0.0, 1.10, 2.12],
    fov: 36,
  },
  roofAero: {
    position: [1.4, 1.85, 0.75],
    target: [0.0, 1.30, 0.70],
    fov: 35,
  },
  roofFin: {
    position: [1.4, 1.85, 0.75],
    target: [0.0, 1.30, 0.70],
    fov: 35,
  },
  vortexGenerators: {
    position: [1.2, 1.75, 1.25],
    target: [0.0, 1.28, 1.18],
    fov: 32,
  },
  coolingAero: {
    position: [1.2, 1.25, -1.75],
    target: [0.42, 0.72, -1.35],
    fov: 34,
  },
  coolingLouvers: {
    position: [1.2, 1.25, -1.75],
    target: [0.42, 0.72, -1.35],
    fov: 34,
  },
  brakeDucts: {
    position: [1.4, 0.45, -2.5],
    target: [0.65, 0.28, -2.18],
    fov: 34,
  },
  wheelAero: {
    position: [1.85, 0.45, 0.0],
    target: [0.95, 0.35, 0.0],
    fov: 34,
  },
  wheelDiscs: {
    position: [1.85, 0.45, 0.0],
    target: [0.95, 0.35, 0.0],
    fov: 34,
  },
  wheelSpats: {
    position: [1.75, 0.35, -1.65],
    target: [0.92, 0.25, -1.45],
    fov: 36,
  },
};

export interface AeroStudioState {
  // Navigation, Sub-Tabs & Cameras
  activeSubTab: AeroStudioSubTab;
  selectedComponent: AeroComponentId;
  activeCameraPreset: AeroCameraPresetId;
  vehicleVariant: VehicleArchitecture;
  visualMode: AeroVisualMode;
  inspectionExplodedPct: number; // 0.0 to 1.0

  // Central Aerodynamic Geometry Config (Single Source of Truth)
  config: MasterAeroStudioConfig;
  
  // Real-time Physics Results
  physics: AeroSurrogatePhysicsResult;

  // Additional fine-grained digital-twin parameters
  activeAeroDeploymentPct: number; // 0 to 100%
  rearWingPylonStyle: 'swan_neck' | 'bottom_mount';
  rearWingEndplateStyle: 'standard' | 'high_downforce' | 'low_drag';
  splitterTieRodsVisible: boolean;
  canardTierCount: 1 | 2 | 3;
  wheelAeroDiscsInstalled: boolean;
  isolatedComponentView: boolean;

  // Rear Spoiler dedicated controls
  rearSpoilerAngleDeg: number;
  rearSpoilerHeightMm: number;
  rearSpoilerWidthMm: number;
  rearSpoilerGurneyMm: number;

  // Underbody Floor dedicated controls
  underbodyTunnelDepthMm: number;
  underbodyFloorStrakeCount: number;

  // Actions
  setActiveSubTab: (subTab: AeroStudioSubTab) => void;
  setSelectedComponent: (componentId: AeroComponentId) => void;
  setActiveCameraPreset: (presetId: AeroCameraPresetId) => void;
  setVehicleVariant: (variant: VehicleArchitecture) => void;
  setVisualMode: (mode: AeroVisualMode) => void;
  setInspectionExplodedPct: (pct: number) => void;
  setPreset: (preset: AeroPackagePresetId) => void;
  setAirspeedKmh: (kmh: number) => void;
  setIsolatedComponentView: (isolated: boolean) => void;

  // Parametric updates
  updateRearWingAngle: (deg: number) => void;
  updateRearWingHeight: (mm: number) => void;
  updateRearWingWidth: (mm: number) => void;
  updateRearWingFlapAngle: (deg: number) => void;
  updateRearWingGurney: (mm: number) => void;

  updateRearSpoilerAngle: (deg: number) => void;
  updateRearSpoilerHeight: (mm: number) => void;
  updateRearSpoilerWidth: (mm: number) => void;
  updateRearSpoilerGurney: (mm: number) => void;

  updateFrontSplitterExtension: (mm: number) => void;
  updateFrontSplitterAngle: (deg: number) => void;
  updateFrontSplitterRideHeight: (mm: number) => void;

  updateCanardsAngle: (deg: number) => void;
  updateCanardTierCount: (tiers: 1 | 2 | 3) => void;

  updateSideSkirtsExtension: (mm: number) => void;
  updateSideSkirtsClearance: (mm: number) => void;

  updateDiffuserAngle: (deg: number) => void;
  updateDiffuserStrakeCount: (count: number) => void;
  updateDiffuserExpansionLength: (mm: number) => void;

  updateUnderbodyTunnelDepth: (mm: number) => void;
  updateUnderbodyFloorStrakeCount: (count: number) => void;

  updateActiveAeroDeployment: (pct: number) => void;
  updateActiveAeroEnabled: (enabled: boolean) => void;

  updateRoofSharkFinHeight: (mm: number) => void;
  updateCoolingLouversPct: (pct: number) => void;
  updateWheelAeroDiscs: (installed: boolean) => void;
}

const DEFAULT_PRESET: AeroPackagePresetId = 'balanced_gt';
const initialConfig = SurrogateAeroPhysicsEngine.getPresetConfig(DEFAULT_PRESET);
const initialPhysics = SurrogateAeroPhysicsEngine.solveAerodynamics(initialConfig);

export const useAeroStudioStore = create<AeroStudioState>((set, get) => ({
  activeSubTab: 'rearAero',
  selectedComponent: 'rearWing',
  visualMode: 'realistic',
  inspectionExplodedPct: 0.0,
  config: initialConfig,
  physics: initialPhysics,
  activeAeroDeploymentPct: 35,
  rearWingPylonStyle: 'swan_neck',
  rearWingEndplateStyle: 'high_downforce',
  splitterTieRodsVisible: true,
  canardTierCount: 2,
  wheelAeroDiscsInstalled: true,
  isolatedComponentView: false,

  rearSpoilerAngleDeg: 10,
  rearSpoilerHeightMm: 110,
  rearSpoilerWidthMm: 1350,
  rearSpoilerGurneyMm: 8,

  underbodyTunnelDepthMm: 35,
  underbodyFloorStrakeCount: 4,

  activeCameraPreset: 'rearWing',
  vehicleVariant: ((typeof useModularVehicleBuilderStore !== 'undefined' && useModularVehicleBuilderStore.getState?.().selectedModel) as VehicleArchitecture) || 'sedan',

  setActiveCameraPreset: (presetId) => {
    set({ activeCameraPreset: presetId });
  },

  setVehicleVariant: (variant) => {
    const spec = VEHICLE_ARCHITECTURES[variant] || VEHICLE_ARCHITECTURES.sedan;
    const { activeSubTab, selectedComponent } = get();
    let nextSubTab = activeSubTab;
    let nextComp = selectedComponent;
    if (!spec.allowedSubTabs.includes(nextSubTab)) {
      nextSubTab = spec.allowedSubTabs[0];
    }
    if (!spec.compatibleComponents.includes(nextComp)) {
      nextComp = spec.defaultRearAero;
    }

    // Bi-directional sync with modular vehicle builder if standard category
    if (['sedan', 'coupe', 'suv', 'hatchback', 'crossover'].includes(variant)) {
      try {
        useModularVehicleBuilderStore.getState().setSelectedModel(variant as any);
      } catch (e) {
        // ignore if not initialized
      }
    }

    set({
      vehicleVariant: variant,
      activeSubTab: nextSubTab,
      selectedComponent: nextComp,
      activeCameraPreset: nextComp,
    });
  },

  setActiveSubTab: (subTab) => {
    // Map subtab to default focus component
    let defaultComp: AeroComponentId = 'rearWing';
    if (subTab === 'frontAero') defaultComp = 'frontSplitter';
    else if (subTab === 'rearAero') defaultComp = 'rearWing';
    else if (subTab === 'sideAero') defaultComp = 'sideSkirts';
    else if (subTab === 'underbody') defaultComp = 'diffuser';
    else if (subTab === 'roofAero') defaultComp = 'roofFin';
    else if (subTab === 'activeAero') defaultComp = 'activeWing';
    else if (subTab === 'coolingAero') defaultComp = 'coolingLouvers';
    else if (subTab === 'wheelAero') defaultComp = 'wheelDiscs';
    else if (subTab === 'aeroSummary') defaultComp = 'rearWing';

    set({ activeSubTab: subTab, selectedComponent: defaultComp, activeCameraPreset: defaultComp });
  },

  setSelectedComponent: (componentId) => {
    set({ selectedComponent: componentId, activeCameraPreset: componentId });
  },

  setVisualMode: (visualMode) => {
    set({ visualMode });
  },

  setInspectionExplodedPct: (inspectionExplodedPct) => {
    set({ inspectionExplodedPct: Math.max(0, Math.min(1, inspectionExplodedPct)) });
  },

  setPreset: (preset) => {
    const newConfig = SurrogateAeroPhysicsEngine.getPresetConfig(preset);
    const newPhysics = SurrogateAeroPhysicsEngine.solveAerodynamics(newConfig);
    set({
      config: newConfig,
      physics: newPhysics,
      canardTierCount: newConfig.canards.tierCount || 2,
    });
  },

  setAirspeedKmh: (kmh) => {
    const { config } = get();
    const updated = { ...config, airspeedKmh: Math.max(20, Math.min(420, kmh)) };
    set({ config: updated, physics: SurrogateAeroPhysicsEngine.solveAerodynamics(updated) });
  },

  setIsolatedComponentView: (isolated) => {
    set({ isolatedComponentView: isolated });
  },

  updateRearWingAngle: (deg) => {
    const { config } = get();
    const angle = Math.max(0, Math.min(35, deg));
    const updated = {
      ...config,
      rearWing: { ...config.rearWing, angleOfAttackDeg: angle },
    };
    set({ config: updated, physics: SurrogateAeroPhysicsEngine.solveAerodynamics(updated) });
  },

  updateRearWingHeight: (mm) => {
    const { config } = get();
    const height = Math.max(100, Math.min(450, mm));
    const updated = {
      ...config,
      rearWing: { ...config.rearWing, heightMm: height },
    };
    set({ config: updated, physics: SurrogateAeroPhysicsEngine.solveAerodynamics(updated) });
  },

  updateRearWingWidth: (mm) => {
    const { config } = get();
    const span = Math.max(1200, Math.min(2000, mm));
    const updated = {
      ...config,
      rearWing: { ...config.rearWing, spanMm: span },
    };
    set({ config: updated, physics: SurrogateAeroPhysicsEngine.solveAerodynamics(updated) });
  },

  updateRearWingFlapAngle: (deg) => {
    const { config } = get();
    const flapAngle = Math.max(0, Math.min(30, deg));
    const updated = {
      ...config,
      rearWing: { ...config.rearWing, angleOfAttackDeg: Math.min(35, config.rearWing.angleOfAttackDeg + flapAngle * 0.2) },
    };
    set({ config: updated, physics: SurrogateAeroPhysicsEngine.solveAerodynamics(updated) });
  },

  updateRearWingGurney: (mm) => {
    const { config } = get();
    const g = Math.max(0, Math.min(25, mm));
    const updated = {
      ...config,
      rearWing: { ...config.rearWing, gurneyHeightMm: g },
    };
    set({ config: updated, physics: SurrogateAeroPhysicsEngine.solveAerodynamics(updated) });
  },

  updateFrontSplitterExtension: (mm) => {
    const { config } = get();
    const chord = Math.max(200, Math.min(500, 320 + (mm - 80)));
    const updated = {
      ...config,
      frontWing: { ...config.frontWing, mainChordMm: chord },
    };
    set({ config: updated, physics: SurrogateAeroPhysicsEngine.solveAerodynamics(updated) });
  },

  updateFrontSplitterAngle: (deg) => {
    const { config } = get();
    const angle = Math.max(-2, Math.min(10, deg));
    const updated = {
      ...config,
      frontWing: { ...config.frontWing, flapAngleDeg: Math.max(0, angle * 2) },
    };
    set({ config: updated, physics: SurrogateAeroPhysicsEngine.solveAerodynamics(updated) });
  },

  updateFrontSplitterRideHeight: (mm) => {
    const { config } = get();
    const rh = Math.max(30, Math.min(120, mm));
    const updated = {
      ...config,
      frontWing: { ...config.frontWing, rideHeightMm: rh },
    };
    set({ config: updated, physics: SurrogateAeroPhysicsEngine.solveAerodynamics(updated) });
  },

  updateCanardsAngle: (deg) => {
    const { config } = get();
    const angle = Math.max(5, Math.min(30, deg));
    const updated = {
      ...config,
      canards: { ...config.canards, incidenceDeg: angle },
    };
    set({ config: updated, physics: SurrogateAeroPhysicsEngine.solveAerodynamics(updated) });
  },

  updateCanardTierCount: (tiers) => {
    const { config } = get();
    const updated = {
      ...config,
      canards: { ...config.canards, tierCount: tiers },
    };
    set({
      canardTierCount: tiers,
      config: updated,
      physics: SurrogateAeroPhysicsEngine.solveAerodynamics(updated),
    });
  },

  updateSideSkirtsExtension: (mm) => {
    const { config } = get();
    const updated = {
      ...config,
      sidepod: { ...config.sidepod, widthMm: 480 + (mm - 45) },
    };
    set({ config: updated, physics: SurrogateAeroPhysicsEngine.solveAerodynamics(updated) });
  },

  updateSideSkirtsClearance: (mm) => {
    const { config } = get();
    const updated = {
      ...config,
      groundEffectFloor: { ...config.groundEffectFloor, tunnelThroatHeightMm: Math.max(15, mm * 0.5) },
    };
    set({ config: updated, physics: SurrogateAeroPhysicsEngine.solveAerodynamics(updated) });
  },

  updateDiffuserAngle: (deg) => {
    const { config } = get();
    const angle = Math.max(4, Math.min(26, deg));
    const updated = {
      ...config,
      diffuser: { ...config.diffuser, rampAngleDeg: angle },
    };
    set({ config: updated, physics: SurrogateAeroPhysicsEngine.solveAerodynamics(updated) });
  },

  updateDiffuserStrakeCount: (count) => {
    const { config } = get();
    const updated = {
      ...config,
      diffuser: { ...config.diffuser, strakeCount: Math.max(2, Math.min(8, count)) },
    };
    set({ config: updated, physics: SurrogateAeroPhysicsEngine.solveAerodynamics(updated) });
  },

  updateDiffuserExpansionLength: (mm) => {
    const { config } = get();
    const updated = {
      ...config,
      diffuser: { ...config.diffuser, lengthMm: Math.max(600, Math.min(1400, mm)) },
    };
    set({ config: updated, physics: SurrogateAeroPhysicsEngine.solveAerodynamics(updated) });
  },

  updateActiveAeroDeployment: (pct) => {
    const clamped = Math.max(0, Math.min(100, pct));
    const { config } = get();
    // 0% = low drag DRS (4°), 50% = cornering (16°), 100% = airbrake (45°)
    const equivalentAoA = 4 + (clamped / 100) * 41;
    const updated = {
      ...config,
      rearWing: { ...config.rearWing, angleOfAttackDeg: equivalentAoA },
    };
    set({
      activeAeroDeploymentPct: clamped,
      config: updated,
      physics: SurrogateAeroPhysicsEngine.solveAerodynamics(updated),
    });
  },

  updateActiveAeroEnabled: (enabled) => {
    const { config } = get();
    const updated = {
      ...config,
      activeAero: { ...config.activeAero, enabled },
    };
    set({ config: updated, physics: SurrogateAeroPhysicsEngine.solveAerodynamics(updated) });
  },

  updateRoofSharkFinHeight: (mm) => {
    set({});
  },

  updateCoolingLouversPct: (pct) => {
    const { config } = get();
    const updated = {
      ...config,
      sidepod: { ...config.sidepod, coolingOutletAreaM2: 0.05 + (pct / 100) * 0.15 },
    };
    set({ config: updated, physics: SurrogateAeroPhysicsEngine.solveAerodynamics(updated) });
  },

  updateRearSpoilerAngle: (deg) => {
    const angle = Math.max(0, Math.min(25, deg));
    set({ rearSpoilerAngleDeg: angle });
  },

  updateRearSpoilerHeight: (mm) => {
    const height = Math.max(50, Math.min(180, mm));
    set({ rearSpoilerHeightMm: height });
  },

  updateRearSpoilerWidth: (mm) => {
    const width = Math.max(1100, Math.min(1450, mm));
    set({ rearSpoilerWidthMm: width });
  },

  updateRearSpoilerGurney: (mm) => {
    const gurney = Math.max(0, Math.min(20, mm));
    set({ rearSpoilerGurneyMm: gurney });
  },

  updateUnderbodyTunnelDepth: (mm) => {
    const depth = Math.max(15, Math.min(65, mm));
    set({ underbodyTunnelDepthMm: depth });
  },

  updateUnderbodyFloorStrakeCount: (count) => {
    const strakes = Math.max(2, Math.min(6, count));
    set({ underbodyFloorStrakeCount: strakes });
  },

  updateWheelAeroDiscs: (installed) => {
    set({ wheelAeroDiscsInstalled: installed });
  },
}));
