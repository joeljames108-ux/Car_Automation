// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — COMPLETE 3D VIEWPORT CONTAINER
// ============================================================================
// Unified modular 3D engine viewport embedding the WebGL R3F canvas,
// camera/lighting HUD, and seamless bidirectional bridge with primary options.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Engine3DScene } from './scene/Engine3DScene';
import { ComponentPicker3D } from './ui/ComponentPicker3D';
import { ComponentInspector3D } from './ui/ComponentInspector3D';
import { CascadeRemovalModal } from './ui/CascadeRemovalModal';
import { useEngine3DStore } from './store/useEngine3DStore';
import { scheduleIdleWork } from '../utils/performanceOptimizer';
import { useAssembly3DBridge } from './store/assemblyBridge';
import { globalAssetCache } from './assets/glbAssetLoader';
import { V12_COMPONENT_MANIFESTS } from './manifests/v12Manifest';
import type { ComponentId, MaterialGrade } from '../sim/assemblyTypes';
import type { ComponentInstance3D } from './types';
import type { EngineConfig } from '../sim/types';

import { EngineInitializationHUD } from './ui/EngineInitializationHUD';
import { PerformanceMonitorHUD } from './ui/PerformanceMonitorHUD';
import { ViewportPauseCanvas } from '../utils/ViewportPauseCanvas';

export interface ModularEngine3DViewportProps {
  className?: string;
  installedComponents2D?: ComponentId[];
  selectedVariants2D?: Partial<Record<ComponentId, MaterialGrade>>;
  isExploded2D?: boolean;
  engineConfig?: Partial<EngineConfig>;
  onSelectComponent2D?: (id: ComponentId | null) => void;
  showFloatingPanels?: boolean;
  /** When false, the runtime cockpit HUD overlays and the dev performance
   *  telemetry panel are omitted so the engine renders unobstructed. */
  showRuntimeHUD?: boolean;
}

export const ModularEngine3DViewport: React.FC<ModularEngine3DViewportProps> = ({
  className = 'w-full h-full min-h-[400px]',
  installedComponents2D = [],
  selectedVariants2D,
  isExploded2D,
  engineConfig,
  onSelectComponent2D,
  showFloatingPanels = false,
  showRuntimeHUD = true,
}) => {
  // Sync 2D primary options with 3D scene graph unconditionally (Rules of Hooks)
  useAssembly3DBridge({
    installedComponents2D,
    selectedVariants2D,
    isExploded2D,
    engineConfig,
    onSelectComponent2D,
  });

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    target: ComponentInstance3D | null;
    dependents: ComponentInstance3D[];
  }>({
    isOpen: false,
    target: null,
    dependents: [],
  });

  // Preload every V12 GLB asset (with its manifest configuration) so all
  // engine parts are interactive the instant they appear in the scene.
  // Deferred to browser idle time so it doesn't compete with first paint / stage mount.
  useEffect(() => {
    scheduleIdleWork(() => {
      globalAssetCache
        .preloadManifests(V12_COMPONENT_MANIFESTS, engineConfig)
        .catch(() => {
          // Individual failures fall back to procedural geometry inside the loader
        });
    }, 3000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeComponentCascade = useEngine3DStore((s) => s.removeComponentCascade);

  // Clean viewports (assembly builder diagrams) must always open in the plain
  // assembled state: clear any exploded / cutaway / anatomy / 360° mode that
  // may have been left on by another engine screen, so no scattered subsystems
  // read as stray component GLBs next to the engine block.
  const setViewMode = useEngine3DStore((s) => s.setViewMode);
  useEffect(() => {
    if (!showRuntimeHUD) {
      setViewMode('standard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRuntimeHUD]);

  const handleCascadeConfirm = async () => {
    if (modalState.target) {
      await removeComponentCascade(modalState.target.instanceId);
    }
    setModalState({ isOpen: false, target: null, dependents: [] });
  };

  return (
    <div className={`relative w-full h-full overflow-hidden select-none ${className}`}>
      {/* 3D WebGL Canvas Layer — paused when off-screen */}
      <ViewportPauseCanvas rootMargin="300px" style={{position: 'absolute', inset: 0}}>
        <Engine3DScene className="w-full h-full" showRuntimeHUD={showRuntimeHUD} />
      </ViewportPauseCanvas>

      {/* Staged Asset Initialization HUD */}
      <EngineInitializationHUD />

      {/* Development Performance Telemetry Monitor HUD (clean viewports omit it) */}
      {process.env.NODE_ENV === 'development' && showRuntimeHUD && <PerformanceMonitorHUD />}

      {/* Optional Standalone Floating Panels (only if explicitly enabled) */}
      {showFloatingPanels && (
        <>
          <ComponentPicker3D />
          <ComponentInspector3D />
        </>
      )}

      {/* Dependency Cascade Warning Modal */}
      <CascadeRemovalModal
        isOpen={modalState.isOpen}
        targetInstance={modalState.target}
        dependentInstances={modalState.dependents}
        onConfirm={handleCascadeConfirm}
        onCancel={() => setModalState({ isOpen: false, target: null, dependents: [] })}
      />
    </div>
  );
};

export default ModularEngine3DViewport;
