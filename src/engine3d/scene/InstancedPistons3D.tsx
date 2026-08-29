// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — INSTANCED PISTON MESH OPTIMIZER
// ============================================================================
// High-performance single draw-call GPU instanced renderer for 12 independent
// racing pistons with per-instance dynamic transform matrices and material variants.
// ============================================================================

import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEngine3DStore } from '../store/useEngine3DStore';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';
import { solveParametricTransformForComponent } from '../physics/parametricTransformSolver';

const dummy = new THREE.Object3D();
const tempColor = new THREE.Color();

export const InstancedPistons3D: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const instances = useEngine3DStore((s) => s.instances);
  const engineConfig = useEngine3DStore((s) => s.engineConfig);
  const selectComponent = useEngine3DStore((s) => s.selectComponent);

  // Extract all 12 piston instances
  const pistonInstances = Object.values(instances).filter((i) => i.type === 'piston');

  useFrame(() => {
    if (!meshRef.current) return;

    const parametric = solveParametricTransformForComponent('piston', engineConfig || undefined);
    const offset = parametric.positionOffset || [0, 0, 0];

    pistonInstances.forEach((piston, idx) => {
      const t = piston.transform;
      dummy.position.set(
        t.position.x + offset[0],
        t.position.y + offset[1],
        t.position.z + offset[2]
      );
      dummy.rotation.set(t.rotation.x, t.rotation.y, t.rotation.z);
      dummy.scale.set(
        t.scale.x * parametric.scale[0],
        t.scale.y * parametric.scale[1],
        t.scale.z * parametric.scale[2]
      );
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(idx, dummy.matrix);

      // Color coding per material variant or selection
      if (piston.selected) {
        tempColor.setHex(0x06b6d4);
      } else if (piston.highlighted) {
        tempColor.setHex(0xfbbf24);
      } else {
        tempColor.setHex(piston.variant.color);
      }

      meshRef.current!.setColorAt(idx, tempColor);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  if (pistonInstances.length === 0) return null;

  const matPiston = globalMaterialLibrary.getMachinedBillet();

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, 12]}
      name="Instanced_Pistons_12x"
      castShadow
      receiveShadow
      onClick={(e) => {
        e.stopPropagation();
        if (e.instanceId !== undefined && pistonInstances[e.instanceId]) {
          selectComponent(pistonInstances[e.instanceId].instanceId);
        }
      }}
    >
      <cylinderGeometry args={[0.043, 0.043, 0.045, 24]} />
      <primitive object={matPiston} attach="material" />
    </instancedMesh>
  );
};
