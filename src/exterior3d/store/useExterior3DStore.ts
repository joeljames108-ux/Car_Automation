// ===================================================================
// EXTERIOR 3D SCENE GRAPH STORE (ZUSTAND)
// ===================================================================
// Manages 3D component instances, PBR material overrides, exploded transforms,
// camera animations, and parametric mesh deformation state.
// ===================================================================

import { create } from "zustand";
import type {
  ExteriorComponent3DType,
  ExteriorComponentInstance3D,
  Transform3D,
  ExteriorVariant3D,
  Exterior3DSceneConfig,
} from "../types";
import { EXTERIOR_3D_MANIFEST } from "../manifests/exteriorManifest";
import { DEFAULT_HOOD_GLB_ID } from "../assets/hoodGlbAssetRegistry";
import type { MaterialGrade } from "../../sim/assemblyTypes";
import type {
  ExteriorEngineeringConfig,
  PaintSystemConfig,
  AeroSurfaceConfig,
} from "../../sim/types/exterior";
import {
  createDefaultExteriorConfig,
  createDefaultPaintConfig,
  createDefaultAeroConfig,
} from "../../sim/constants/exteriorConstants";

export interface Exterior3DStoreState {
  instances: Record<string, ExteriorComponentInstance3D>;
  installedTypes: ExteriorComponent3DType[];
  selectedInstanceId: string | null;
  hoveredInstanceId: string | null;

  sceneConfig: Exterior3DSceneConfig;
  exteriorConfig: ExteriorEngineeringConfig;
  paintConfig: PaintSystemConfig;
  aeroConfig: AeroSurfaceConfig;

  hoodGlbPresetId: string;
  hoodGlbOpen: boolean;

  // Actions
  addComponent3D: (type: ExteriorComponent3DType, variantGrade?: MaterialGrade) => void;
  removeComponent3D: (type: ExteriorComponent3DType) => void;
  replaceVariant3D: (type: ExteriorComponent3DType, grade: MaterialGrade) => void;
  selectInstance3D: (instanceId: string | null) => void;
  hoverInstance3D: (instanceId: string | null) => void;
  setHoodGlbPreset: (presetId: string) => void;
  setHoodGlbOpen: (open: boolean) => void;

  setExplodedAmount: (amount: number) => void;
  toggleWireframe: () => void;
  togglePaintZones: () => void;
  togglePanelGaps: () => void;
  toggleAeroFlow: () => void;
  setCameraPreset: (preset: Exterior3DSceneConfig["cameraPreset"]) => void;
  setEnvironmentHdri: (hdri: Exterior3DSceneConfig["environmentHdri"]) => void;

  syncWith2DStore: (
    installedList: ExteriorComponent3DType[],
    variantMap: Record<ExteriorComponent3DType, MaterialGrade>,
    extConfig: ExteriorEngineeringConfig,
    pntConfig: PaintSystemConfig,
    arConfig: AeroSurfaceConfig
  ) => void;
}

export const useExterior3DStore = create<Exterior3DStoreState>((set, get) => ({
  instances: {},
  installedTypes: ["chassis_frame"],
  selectedInstanceId: "chassis_frame",
  hoveredInstanceId: null,

  sceneConfig: {
    showWireframe: false,
    showPaintZones: false,
    showPanelGaps: false,
    showAeroFlow: false,
    explodedAmount: 0.0,
    cameraPreset: "front_three_quarter",
    autoRotate: false,
    environmentHdri: "studio_neutral",
  },

  exteriorConfig: createDefaultExteriorConfig(),
  paintConfig: createDefaultPaintConfig(),
  aeroConfig: createDefaultAeroConfig(),

  hoodGlbPresetId: DEFAULT_HOOD_GLB_ID,
  hoodGlbOpen: false,

  addComponent3D: (type: ExteriorComponent3DType, variantGrade: MaterialGrade = "forged") => {
    const manifest = EXTERIOR_3D_MANIFEST[type];
    if (!manifest) return;

    const instance: ExteriorComponentInstance3D = {
      instanceId: type,
      type,
      manifestRef: manifest,
      transform: { ...manifest.defaultTransform },
      variant: {
        id: variantGrade,
        materialGrade: variantGrade,
        color: 0x0284c7,
        finish: "metallic",
        label: variantGrade.toUpperCase(),
      },
      visible: true,
      opacity: 1.0,
      selected: false,
      highlighted: false,
      paintZone: manifest.paintZone,
    };

    set((state) => ({
      instances: { ...state.instances, [type]: instance },
      installedTypes: [...new Set([...state.installedTypes, type])],
    }));
  },

  removeComponent3D: (type: ExteriorComponent3DType) => {
    set((state) => {
      const nextInstances = { ...state.instances };
      delete nextInstances[type];
      return {
        instances: nextInstances,
        installedTypes: state.installedTypes.filter((t) => t !== type),
        selectedInstanceId: state.selectedInstanceId === type ? null : state.selectedInstanceId,
      };
    });
  },

  replaceVariant3D: (type: ExteriorComponent3DType, grade: MaterialGrade) => {
    set((state) => {
      const target = state.instances[type];
      if (!target) return state;

      return {
        instances: {
          ...state.instances,
          [type]: {
            ...target,
            variant: {
              ...target.variant,
              id: grade,
              materialGrade: grade,
              label: grade.toUpperCase(),
            },
          },
        },
      };
    });
  },

  selectInstance3D: (instanceId: string | null) => {
    set({ selectedInstanceId: instanceId });
  },

  hoverInstance3D: (instanceId: string | null) => {
    set({ hoveredInstanceId: instanceId });
  },

  setHoodGlbPreset: (presetId: string) => {
    set({ hoodGlbPresetId: presetId });
  },

  setHoodGlbOpen: (open: boolean) => {
    set({ hoodGlbOpen: open });
  },

  setExplodedAmount: (amount: number) => {
    set((state) => ({
      sceneConfig: {
        ...state.sceneConfig,
        explodedAmount: Math.max(0, Math.min(1, amount)),
      },
    }));
  },

  toggleWireframe: () => {
    set((state) => ({
      sceneConfig: {
        ...state.sceneConfig,
        showWireframe: !state.sceneConfig.showWireframe,
      },
    }));
  },

  togglePaintZones: () => {
    set((state) => ({
      sceneConfig: {
        ...state.sceneConfig,
        showPaintZones: !state.sceneConfig.showPaintZones,
      },
    }));
  },

  togglePanelGaps: () => {
    set((state) => ({
      sceneConfig: {
        ...state.sceneConfig,
        showPanelGaps: !state.sceneConfig.showPanelGaps,
      },
    }));
  },

  toggleAeroFlow: () => {
    set((state) => ({
      sceneConfig: {
        ...state.sceneConfig,
        showAeroFlow: !state.sceneConfig.showAeroFlow,
      },
    }));
  },

  setCameraPreset: (preset) => {
    set((state) => ({
      sceneConfig: { ...state.sceneConfig, cameraPreset: preset },
    }));
  },

  setEnvironmentHdri: (hdri) => {
    set((state) => ({
      sceneConfig: { ...state.sceneConfig, environmentHdri: hdri },
    }));
  },

  syncWith2DStore: (installedList, variantMap, extConfig, pntConfig, arConfig) => {
    const nextInstances: Record<string, ExteriorComponentInstance3D> = {};

    installedList.forEach((type) => {
      const manifest = EXTERIOR_3D_MANIFEST[type];
      if (!manifest) return;
      const grade = variantMap[type] || "forged";

      nextInstances[type] = {
        instanceId: type,
        type,
        manifestRef: manifest,
        transform: { ...manifest.defaultTransform },
        variant: {
          id: grade,
          materialGrade: grade,
          color: 0x0284c7,
          finish: "metallic",
          label: grade.toUpperCase(),
        },
        visible: true,
        opacity: 1.0,
        selected: get().selectedInstanceId === type,
        highlighted: get().hoveredInstanceId === type,
        paintZone: manifest.paintZone,
      };
    });

    set({
      instances: nextInstances,
      installedTypes: [...installedList],
      exteriorConfig: { ...extConfig },
      paintConfig: { ...pntConfig },
      aeroConfig: { ...arConfig },
    });
  },
}));
