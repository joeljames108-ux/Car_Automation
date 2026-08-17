// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — COMPLETE 3D VIEWPORT CONTAINER
// ============================================================================
// Unified modular 3D engine viewport embedding the WebGL R3F canvas,
// camera/lighting HUD, and seamless bidirectional bridge with primary options.
// ============================================================================

import React, { useState } from 'react';
import { Engine3DScene } from './scene/Engine3DScene';
import { ComponentPicker3D } from './ui/ComponentPicker3D';
import { ComponentInspector3D } from './ui/ComponentInspector3D';
import { CascadeRemovalModal } from './ui/CascadeRemovalModal';
import { useEngine3DStore } from './store/useEngine3DStore';
import { useAssembly3DBridge } from './store/assemblyBridge';
import type { ComponentId, MaterialGrade } from '../sim/assemblyTypes';
import type { ComponentInstance3D } from './types';
import type { EngineConfig } from '../sim/types';

export interface ModularEngine3DViewportProps {
  className?: string;
  installedComponents2D?: ComponentId[];
  selectedVariants2D?: Partial<Record<ComponentId, MaterialGrade>>;
  isExploded2D?: boolean;
  engineConfig?: Partial<EngineConfig>;
  onSelectComponent2D?: (id: ComponentId | null) => void;
  showFloatingPanels?: boolean;
}

export const ModularEngine3DViewport: React.FC<ModularEngine3DViewportProps> = ({
  className = 'w-full h-full min-h-[400px]',
  installedComponents2D = [],
  selectedVariants2D,
  isExploded2D,
  engineConfig,
  onSelectComponent2D,
  showFloatingPanels = false,
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

  const removeComponentCascade = useEngine3DStore((s) => s.removeComponentCascade);

  const handleCascadeConfirm = async () => {
    if (modalState.target) {
      await removeComponentCascade(modalState.target.instanceId);
    }
    setModalState({ isOpen: false, target: null, dependents: [] });
  };

  return (
    <div className={`relative w-full h-full overflow-hidden select-none ${className}`}>
      {/* 3D WebGL Canvas Layer */}
      <Engine3DScene className="w-full h-full absolute inset-0" />

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
