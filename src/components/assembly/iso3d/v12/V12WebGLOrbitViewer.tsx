// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — V12 WEBGL 3D ORBIT VIEWER
// ============================================================================
// Embeds the full modular 3D engine viewport with real-time assembly state,
// individual component inspection, variant swapping, and cinematic camera modes.
// ============================================================================

import React from 'react';
import { ModularEngine3DViewport } from '../../../../engine3d/ModularEngine3DViewport';
import type { ComponentId, MaterialGrade } from '../../../../sim/assemblyTypes';
import type { EngineConfig } from '../../../../sim/types';

export interface V12WebGLOrbitViewerProps {
  modelUrl?: string;
  className?: string;
  installedComponents2D?: ComponentId[];
  selectedVariants2D?: Partial<Record<ComponentId, MaterialGrade>>;
  isExploded2D?: boolean;
  engineConfig?: Partial<EngineConfig>;
  onSelectComponent2D?: (id: ComponentId | null) => void;
}

export const V12WebGLOrbitViewer: React.FC<V12WebGLOrbitViewerProps> = ({
  className = 'w-full h-[450px] md:h-[550px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl',
  installedComponents2D,
  selectedVariants2D,
  isExploded2D,
  engineConfig,
  onSelectComponent2D,
}) => {
  return (
    <div className={className}>
      <ModularEngine3DViewport
        installedComponents2D={installedComponents2D}
        selectedVariants2D={selectedVariants2D}
        isExploded2D={isExploded2D}
        engineConfig={engineConfig}
        onSelectComponent2D={onSelectComponent2D}
      />
    </div>
  );
};

export default V12WebGLOrbitViewer;
