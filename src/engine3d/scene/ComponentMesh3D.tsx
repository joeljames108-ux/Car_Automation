// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — 3D COMPONENT MESH RENDERER
// ============================================================================
// Individual reactive 3D component renderer handling asynchronous GLB loading,
// real-time transform updates, physical multi-material preservation (Nikasil bores,
// machined decks, ARP studs, brass plugs), dynamic variant styling, and hover pulsing.
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ComponentInstance3D } from '../types';
import { globalAssetCache } from '../assets/glbAssetLoader';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';
import { useEngine3DStore } from '../store/useEngine3DStore';
import { useHoverPulse } from '../animations/useSnapAnimation';
import { solveParametricTransformForComponent } from '../physics/parametricTransformSolver';

export interface ComponentMesh3DProps {
  instance: ComponentInstance3D;
}

export const ComponentMesh3D: React.FC<ComponentMesh3DProps> = ({ instance }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [modelGroup, setModelGroup] = useState<THREE.Group | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const selectedId = useEngine3DStore((s) => s.selectedInstanceId);
  const showWireframe = useEngine3DStore((s) => s.showWireframe);
  const engineConfig = useEngine3DStore((s) => s.engineConfig);
  const selectComponent = useEngine3DStore((s) => s.selectComponent);
  const hoverComponent = useEngine3DStore((s) => s.hoverComponent);

  const isSelected = selectedId === instance.instanceId;
  const hoverPulse = useHoverPulse(isHovered || instance.highlighted);

  // ── 1. Asynchronously Load Master GLB ──
  useEffect(() => {
    let isMounted = true;

    globalAssetCache
      .loadComponentGlb(instance.manifestRef.assetPath, instance.type)
      .then((loadedGroup) => {
        if (isMounted) {
          // Enable shadow casting and receiving for all child meshes
          loadedGroup.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          setModelGroup(loadedGroup);
        }
      });

    return () => {
      isMounted = false;
      globalAssetCache.releaseInstance(instance.manifestRef.assetPath);
    };
  }, [instance.manifestRef.assetPath, instance.type]);

  // ── 2. Real-Time Transform, Parametric Sizing & Metallurgy Updates ──
  useFrame(() => {
    if (!groupRef.current) return;

    // Synchronize 3D transform and live parametric scaling from engine specifications
    const t = instance.transform;
    const parametric = solveParametricTransformForComponent(instance.type, engineConfig || undefined);

    groupRef.current.position.set(t.position.x, t.position.y, t.position.z);
    groupRef.current.rotation.set(t.rotation.x, t.rotation.y, t.rotation.z);
    groupRef.current.scale.set(
      t.scale.x * parametric.scale[0],
      t.scale.y * parametric.scale[1],
      t.scale.z * parametric.scale[2]
    );
    groupRef.current.visible = instance.visible && instance.opacity > 0.01;

    // Apply authentic metallurgy PBR material shaders, highlights, and wireframes
    if (modelGroup) {
      const matLib = globalMaterialLibrary;
      const variantMaterial = matLib.resolveMaterialForVariant(instance.variant?.id, instance.type);

      modelGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const currentMat = mesh.material as THREE.MeshStandardMaterial;

          if (showWireframe) {
            mesh.material = matLib.getHighlightMaterial('ghost');
          } else {
            // Apply dynamic metallurgy material to primary structural components
            // while preserving specialized functional accent parts (liners, bolts, quartz glass, silicone)
            const isProtectedAccent =
              mesh.name.includes('Liner') ||
              mesh.name.includes('Bore') ||
              mesh.name.includes('Bolt') ||
              mesh.name.includes('Stud') ||
              mesh.name.includes('Plug') ||
              mesh.name.includes('Glass') ||
              mesh.name.includes('Window') ||
              mesh.name.includes('Hose') ||
              mesh.name.includes('Silicone') ||
              mesh.name.includes('Blade') ||
              mesh.name.includes('Cap');

            if (!isProtectedAccent && mesh.material !== variantMaterial) {
              mesh.material = variantMaterial;
            }

            // Apply interactive hover & selection emissive glows
            const activeMat = mesh.material as THREE.MeshStandardMaterial;
            if (activeMat && activeMat.isMeshStandardMaterial) {
              if (isHovered && !isSelected) {
                activeMat.emissive?.setHex(0x0284c7);
                if (activeMat.emissiveIntensity !== undefined) activeMat.emissiveIntensity = hoverPulse * 0.5;
              } else if (isSelected) {
                activeMat.emissive?.setHex(0x38bdf8);
                if (activeMat.emissiveIntensity !== undefined) activeMat.emissiveIntensity = 0.25;
              } else {
                if (activeMat.emissive && activeMat.emissive.getHex() !== 0x000000 && !mesh.name.includes('Emissive')) {
                  activeMat.emissive.setHex(0x000000);
                  if (activeMat.emissiveIntensity !== undefined) activeMat.emissiveIntensity = 0;
                }
              }
            }
          }
        }
      });
    }
  });

  return (
    <group
      ref={groupRef}
      name={`Instance_${instance.instanceId}`}
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(isSelected ? null : instance.instanceId);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setIsHovered(true);
        hoverComponent(instance.instanceId);
      }}
      onPointerOut={() => {
        setIsHovered(false);
        hoverComponent(null);
      }}
    >
      {modelGroup && <primitive object={modelGroup} />}
    </group>
  );
};

export default ComponentMesh3D;
