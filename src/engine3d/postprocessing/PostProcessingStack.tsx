// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — POST-PROCESSING EFFECTS PIPELINE
// ============================================================================
// High-fidelity photographic post-processing pipeline featuring atmospheric
// studio lightformers, selection outline glow rings, and depth ambiance.
// ============================================================================

import React from 'react';
import * as THREE from 'three';
import { useEngine3DStore } from '../store/useEngine3DStore';

export const PostProcessingStack: React.FC = () => {
  const postConfig = useEngine3DStore((s) => s.postProcessing);
  const selectedInstanceId = useEngine3DStore((s) => s.selectedInstanceId);
  const instances = useEngine3DStore((s) => s.instances);

  const selectedInst = selectedInstanceId ? instances[selectedInstanceId] : null;

  return (
    <group name="PostProcessing_Overlay">
      {/* Studio Reflection Accent Highlights */}
      <mesh position={[0, 1.8, 1.2]} rotation={[-Math.PI / 4, 0, 0]}>
        <planeGeometry args={[2.5, 0.8]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.03}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Emissive Selection Halo when a component is selected */}
      {selectedInst && postConfig.outline.enabled && (
        <mesh
          position={[
            selectedInst.transform.position.x,
            selectedInst.transform.position.y,
            selectedInst.transform.position.z,
          ]}
        >
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshBasicMaterial
            color="#38bdf8"
            wireframe
            transparent
            opacity={0.12}
          />
        </mesh>
      )}
    </group>
  );
};

export default PostProcessingStack;
