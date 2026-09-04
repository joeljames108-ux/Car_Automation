// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — ZUSTAND 3D ENGINE STORE
// ============================================================================
// Central reactive state management for active 3D component instances,
// selection state, camera presets, studio lighting modes, post-processing,
// continuous exploded view amounts, auto-assembly sequencing, and persistence.
// ============================================================================

import { create } from 'zustand';
import type {
  ComponentCategory3D,
  ComponentInstance3D,
  Engine3DComponentType,
  CameraPreset3D,
  LightingPreset,
  PostProcessingConfig,
} from '../types';
import { createDefaultPostProcessingConfig } from '../types';
import type { EngineConfig } from '../../sim/types';
import { globalAssemblyEngine } from '../core/assemblyEngine';
import { globalAnimationEngine } from '../animations/snapAnimationEngine';
import { getAllV12Manifests } from '../manifests/v12Manifest';

export interface Engine3DStoreState {
  // ── Live Engine Specifications ──
  engineConfig: Partial<EngineConfig> | null;

  // ── Component Instances Map ──
  instances: Record<string, ComponentInstance3D>;
  installedTypes: Engine3DComponentType[];

  // ── Selection & Interaction State ──
  selectedInstanceId: string | null;
  hoveredInstanceId: string | null;
  activeCategory: ComponentCategory3D | 'all';

  // ── Viewport & Diagnostics ──
  explodedAmount: number;
  showWireframe: boolean;
  showAttachmentPoints: boolean;
  showLabels: boolean;
  showDependencies: boolean;
  showGhostPreview: boolean;
  ghostPreviewType: Engine3DComponentType | null;

  // ── Engine Spatial Orientation & Rotation ──
  engineRotation: [number, number, number];

  // ── Camera & Ambiance Presets ──
  cameraPreset: CameraPreset3D;
  lightingPreset: LightingPreset;
  postProcessing: PostProcessingConfig;
  animationSpeed: number;

  // ── Assembly State & Progress ──
  progress: { installedCount: number; totalCount: number; percentage: number };
  isAssemblyComplete: boolean;
  isAutoAssembling: boolean;

  // ── 4-Stroke Engine Animation & View Controls ──
  cutawayMode: boolean;
  slowMotionScale: number; // 1.0, 0.5, 0.25, 0.1


  // ── Actions ──
  setEngineConfig: (cfg: Partial<EngineConfig>) => void;
  setEngineRotation: (rot: [number, number, number]) => void;
  rotateEngine90: (axis: 'x' | 'y' | 'z', dir?: 1 | -1) => void;
  resetEngineRotation: () => void;
  addComponent: (type: Engine3DComponentType, variantId?: string) => Promise<string[]>;
  removeComponent: (instanceId: string) => Promise<void>;
  removeComponentCascade: (instanceId: string) => Promise<string[]>;
  replaceVariant: (instanceId: string, variantId: string) => void;
  selectComponent: (instanceId: string | null) => void;
  hoverComponent: (instanceId: string | null) => void;
  setGhostPreview: (type: Engine3DComponentType | null) => void;
  setActiveCategory: (category: ComponentCategory3D | 'all') => void;
  setExplodedAmount: (amount: number) => void;
  setCameraPreset: (preset: CameraPreset3D) => void;
  setLightingPreset: (preset: LightingPreset) => void;
  setAnimationSpeed: (speed: number) => void;
  toggleWireframe: () => void;
  toggleAttachmentPoints: () => void;
  toggleLabels: () => void;
  toggleDependencies: () => void;
  setCutawayMode: (enabled: boolean) => void;
  toggleCutawayMode: () => void;
  setSlowMotionScale: (scale: number) => void;
  resetAssembly: () => void;
  autoAssembleAll: () => Promise<void>;
  syncFromEngine: () => void;
}

export const useEngine3DStore = create<Engine3DStoreState>((set, get) => {
  // Subscribe to AssemblyEngine domain events for real-time synchronization
  globalAssemblyEngine.subscribe((event) => {
    get().syncFromEngine();
  });

  return {
    engineConfig: null,
    instances: {},
    installedTypes: [],
    selectedInstanceId: null,
    hoveredInstanceId: null,
    activeCategory: 'all',
    explodedAmount: 0,
    showWireframe: false,
    showAttachmentPoints: false,
    showLabels: true,
    showDependencies: false,
    showGhostPreview: false,
    ghostPreviewType: null,
    // Rotated 90 degrees from Z axis to Y axis (Euler: [-Math.PI / 2, 0, 0])
    engineRotation: [-Math.PI / 2, 0, 0],
    cameraPreset: 'iso-front-left',
    lightingPreset: 'studio',
    postProcessing: createDefaultPostProcessingConfig(),
    animationSpeed: 1.0,
    progress: { installedCount: 0, totalCount: getAllV12Manifests().length, percentage: 0 },
    isAssemblyComplete: false,
    isAutoAssembling: false,
    cutawayMode: false,
    slowMotionScale: 1.0,

    setCutawayMode: (enabled) => set({ cutawayMode: enabled }),
    toggleCutawayMode: () => set((s) => ({ cutawayMode: !s.cutawayMode })),
    setSlowMotionScale: (scale) => set({ slowMotionScale: scale }),

    setEngineRotation: (rot) => set({ engineRotation: rot }),

    rotateEngine90: (axis, dir = 1) => {
      const step = (Math.PI / 2) * dir;
      const [rx, ry, rz] = get().engineRotation;
      if (axis === 'x') set({ engineRotation: [rx + step, ry, rz] });
      else if (axis === 'y') set({ engineRotation: [rx, ry + step, rz] });
      else if (axis === 'z') set({ engineRotation: [rx, ry, rz + step] });
    },

    resetEngineRotation: () => set({ engineRotation: [-Math.PI / 2, 0, 0] }),

    setEngineConfig: (cfg) => {
      globalAssemblyEngine.setEngineConfig(cfg);
      set({ engineConfig: cfg });
    },

    syncFromEngine: () => {
      const list = globalAssemblyEngine.getInstalledInstances();
      const map: Record<string, ComponentInstance3D> = {};
      const typesSet = new Set<Engine3DComponentType>();

      for (const inst of list) {
        map[inst.instanceId] = inst;
        typesSet.add(inst.type);
      }

      const prog = globalAssemblyEngine.getProgress();
      set({
        instances: map,
        installedTypes: Array.from(typesSet),
        progress: prog,
        isAssemblyComplete: prog.percentage >= 100,
        explodedAmount: globalAssemblyEngine.getExplodedAmount(),
      });
    },

    addComponent: async (type: Engine3DComponentType, variantId?: string) => {
      const added = await globalAssemblyEngine.addComponent(type, variantId);

      // Trigger staggered entrance animations for all newly created instances (instant for root block)
      added.forEach((inst, idx) => {
        if (inst.type === 'engine-block') {
          inst.state = 'installed';
          inst.opacity = 1.0;
          inst.isAnimating = false;
          inst.transform = { ...inst.assembledTransform };
        } else {
          globalAnimationEngine.startInstallAnimation(inst, idx * 70);
        }
      });

      get().syncFromEngine();
      return added.map((i) => i.instanceId);
    },

    removeComponent: async (instanceId: string) => {
      const inst = globalAssemblyEngine.getInstanceById(instanceId);
      if (!inst) return;

      globalAnimationEngine.startRemoveAnimation(inst, 0, async () => {
        await globalAssemblyEngine.removeComponentCascade(instanceId);
        get().syncFromEngine();
      });
    },

    removeComponentCascade: async (instanceId: string) => {
      const dependents = globalAssemblyEngine.getDependentsOfInstance(instanceId);
      const target = globalAssemblyEngine.getInstanceById(instanceId);
      const allToRemove = target ? [...dependents, target] : dependents;

      // Staggered reverse fly-away animation
      allToRemove.forEach((inst, idx) => {
        globalAnimationEngine.startRemoveAnimation(inst, idx * 50);
      });

      const res = await globalAssemblyEngine.removeComponentCascade(instanceId);
      if (get().selectedInstanceId === instanceId) {
        set({ selectedInstanceId: null });
      }
      get().syncFromEngine();
      return res.removedInstanceIds;
    },

    replaceVariant: (instanceId: string, variantId: string) => {
      globalAssemblyEngine.replaceVariant(instanceId, variantId);
      get().syncFromEngine();
    },

    selectComponent: (instanceId: string | null) => {
      const instances = get().instances;
      // Clear previous selection highlight
      Object.values(instances).forEach((inst) => {
        inst.selected = inst.instanceId === instanceId;
      });
      set({ selectedInstanceId: instanceId });
    },

    hoverComponent: (instanceId: string | null) => {
      const instances = get().instances;
      Object.values(instances).forEach((inst) => {
        inst.highlighted = inst.instanceId === instanceId;
      });
      set({ hoveredInstanceId: instanceId });
    },

    setGhostPreview: (type: Engine3DComponentType | null) => {
      set({
        showGhostPreview: type !== null,
        ghostPreviewType: type,
      });
    },

    setActiveCategory: (category: ComponentCategory3D | 'all') => {
      set({ activeCategory: category });
    },

    setExplodedAmount: (amount: number) => {
      globalAssemblyEngine.setExplodedViewAmount(amount);
      set({ explodedAmount: amount });
    },

    setCameraPreset: (preset: CameraPreset3D) => {
      set({ cameraPreset: preset });
    },

    setLightingPreset: (preset: LightingPreset) => {
      set({ lightingPreset: preset });
    },

    setAnimationSpeed: (speed: number) => {
      globalAnimationEngine.setSpeedMultiplier(speed);
      set({ animationSpeed: speed });
    },

    toggleWireframe: () => {
      set((s) => ({ showWireframe: !s.showWireframe }));
    },

    toggleAttachmentPoints: () => {
      set((s) => ({ showAttachmentPoints: !s.showAttachmentPoints }));
    },

    toggleLabels: () => {
      set((s) => ({ showLabels: !s.showLabels }));
    },

    toggleDependencies: () => {
      set((s) => ({ showDependencies: !s.showDependencies }));
    },

    resetAssembly: () => {
      globalAssemblyEngine.reset();
      set({
        instances: {},
        installedTypes: [],
        selectedInstanceId: null,
        hoveredInstanceId: null,
        explodedAmount: 0,
        progress: { installedCount: 0, totalCount: getAllV12Manifests().length, percentage: 0 },
        isAssemblyComplete: false,
        isAutoAssembling: false,
      });
    },

    autoAssembleAll: async () => {
      set({ isAutoAssembling: true });

      const manifests = getAllV12Manifests();
      for (const manifest of manifests) {
        if (globalAssemblyEngine.canInstall(manifest.type).allowed) {
          await get().addComponent(manifest.type);
          await new Promise((r) => setTimeout(r, 450));
        }
      }

      set({ isAutoAssembling: false });
    },
  };
});

// Pre-initialize foundational base engine block on startup
if (typeof window !== 'undefined') {
  setTimeout(() => {
    const store = useEngine3DStore.getState();
    if (!store.installedTypes.includes('engine-block')) {
      store.addComponent('engine-block', 'cast_iron').catch(() => {});
    }
  }, 0);
}

