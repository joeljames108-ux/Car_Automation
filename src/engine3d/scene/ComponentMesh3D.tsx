// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — 3D COMPONENT MESH RENDERER (OPTIMIZED)
// ============================================================================
// Ultra-high performance reactive 3D component renderer with cached mesh
// traversal, zero-overhead material batching, GPU transform synchronization,
// and full preservation of authentic multi-material PBR fidelity.
// ============================================================================

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ComponentInstance3D } from '../types';
import { globalAssetCache, buildProceduralFallbackMesh } from '../assets/glbAssetLoader';
import { globalMaterialLibrary } from '../materials/pbrMaterialSystem';
import { useEngine3DStore } from '../store/useEngine3DStore';
import { useHoverPulse } from '../animations/useSnapAnimation';
import { solveParametricTransformForComponent } from '../physics/parametricTransformSolver';

export interface ComponentMesh3DProps {
  instance: ComponentInstance3D;
}

export const ComponentMesh3D: React.FC<ComponentMesh3DProps> = ({ instance }) => {
  const engineConfig = useEngine3DStore((s) => s.engineConfig);
  const groupRef = useRef<THREE.Group>(null);
  const [modelGroup, setModelGroup] = useState<THREE.Group | null>(() => {
    return buildProceduralFallbackMesh(instance.type, engineConfig || undefined);
  });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Cached mesh classification refs to avoid runtime traversals
  const primaryMeshesRef = useRef<THREE.Mesh[]>([]);
  const emissiveMeshesRef = useRef<THREE.Mesh[]>([]);

  const selectedId = useEngine3DStore((s) => s.selectedInstanceId);
  const showWireframe = useEngine3DStore((s) => s.showWireframe);
  const selectComponent = useEngine3DStore((s) => s.selectComponent);
  const hoverComponent = useEngine3DStore((s) => s.hoverComponent);

  const isSelected = selectedId === instance.instanceId;
  const hoverPulse = useHoverPulse(isHovered || instance.highlighted);

  // ── 1. Asynchronously Load Master GLB & Classify Meshes ──
  useEffect(() => {
    let isMounted = true;

    globalAssetCache
      .loadComponentGlb(instance.manifestRef.assetPath, instance.type, engineConfig || undefined)
      .then((loadedGroup) => {
        if (isMounted) {
          const primary: THREE.Mesh[] = [];
          const emissive: THREE.Mesh[] = [];

          loadedGroup.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;

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
                mesh.name.includes('Cap') ||
                mesh.name.includes('Isolator') ||
                mesh.name.includes('Sensor') ||
                mesh.name.includes('Petcock') ||
                mesh.name.includes('Flap') ||
                mesh.name.includes('Harness') ||
                mesh.name.includes('Grille') ||
                mesh.name.includes('Anodized') ||
                mesh.name.includes('Weld');

              if (!isProtectedAccent) {
                primary.push(mesh);
              }
              emissive.push(mesh);
            }
          });

          primaryMeshesRef.current = primary;
          emissiveMeshesRef.current = emissive;
          setModelGroup(loadedGroup);
        }
      });

    return () => {
      isMounted = false;
      globalAssetCache.releaseInstance(instance.manifestRef.assetPath, engineConfig?.layout);
    };
  }, [instance.manifestRef.assetPath, instance.type, engineConfig?.layout, instance.instanceId]);

  // ── 2. Reactive Material & Metallurgy Assignment (Zero 60FPS Traversal) ──
  useEffect(() => {
    if (!modelGroup) return;

    const matLib = globalMaterialLibrary;
    const variantMaterial = matLib.resolveMaterialForVariant(
      instance.variant?.id,
      instance.type,
      engineConfig || undefined
    );
    const ghostMaterial = matLib.getHighlightMaterial('ghost');

    const targetMat = showWireframe ? ghostMaterial : variantMaterial;
    for (let i = 0; i < primaryMeshesRef.current.length; i++) {
      primaryMeshesRef.current[i].material = targetMat;
    }
  }, [modelGroup, instance.variant?.id, instance.type, showWireframe, engineConfig]);

  // ── 3. Memoized Parametric Transform Offsets ──
  const parametric = useMemo(() => {
    return solveParametricTransformForComponent(instance.type, engineConfig || undefined);
  }, [instance.type, engineConfig?.bore, engineConfig?.stroke, engineConfig?.rodLength, engineConfig?.layout]);

  // ── 4. Lightweight Frame Loop (Only Transform & Dynamic Glow) ──
  useFrame(() => {
    if (!groupRef.current) return;

    const t = instance.transform;
    const offset = parametric.positionOffset || [0, 0, 0];

    groupRef.current.position.set(
      t.position.x + offset[0],
      t.position.y + offset[1],
      t.position.z + offset[2]
    );
    groupRef.current.rotation.set(t.rotation.x, t.rotation.y, t.rotation.z);
    groupRef.current.scale.set(
      t.scale.x * parametric.scale[0],
      t.scale.y * parametric.scale[1],
      t.scale.z * parametric.scale[2]
    );
    groupRef.current.visible = instance.visible && instance.opacity > 0.01;

    // Interactive hover & selection emissive glow without full traversal
    if (isHovered || isSelected) {
      const targetEmissive = isSelected ? 0x38bdf8 : 0x0284c7;
      const targetIntensity = isSelected ? 0.25 : hoverPulse * 0.5;

      for (let i = 0; i < emissiveMeshesRef.current.length; i++) {
        const mat = emissiveMeshesRef.current[i].material as THREE.MeshStandardMaterial;
        if (mat && mat.isMeshStandardMaterial && mat.emissive) {
          mat.emissive.setHex(targetEmissive);
          mat.emissiveIntensity = targetIntensity;
        }
      }
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

export default React.memo(ComponentMesh3D);
