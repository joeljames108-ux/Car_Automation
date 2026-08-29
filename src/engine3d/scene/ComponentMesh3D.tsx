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

  // ── 2. Reactive Material & Metallurgy Assignment (Preserve Multi-Material Colors) ──
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

    // Named meshes that already have distinct materials from procedural generators
    // should NOT be overwritten with the variant material
    const preserveMaterialNames = new Set([
      'Tungsten', 'Brass', 'Brass_', 'Brass Freeze',
      'Coolant', 'Coolant Passage', 'Oil Gallery', 'Oil Gallery Passage',
      'Nikasil', 'Bore', 'Fire Ring', 'ARP', 'Elastomer', 'Rubber',
      'Silicone', 'Hose', 'Sensor', 'Gold', 'Anodized',
      'CNC', 'Machined', 'Plated', 'Chrome', 'Polish',
    ]);

    for (let i = 0; i < primaryMeshesRef.current.length; i++) {
      const mesh = primaryMeshesRef.current[i];
      const meshMat = mesh.material as THREE.MeshStandardMaterial;
      const meshName = mesh.name || '';

      // Check if this mesh has a distinctly named material that should be preserved
      let shouldPreserve = false;
      if (meshMat && meshMat.name && meshMat.name !== 'default' && meshMat.name !== '') {
        for (const preserve of preserveMaterialNames) {
          if (meshMat.name.includes(preserve) || meshName.includes(preserve)) {
            shouldPreserve = true;
            break;
          }
        }
      }

      // Also preserve meshes that have distinct non-gray colors (brass, blue, etc.)
      if (meshMat && meshMat.color && !showWireframe) {
        const hex = meshMat.color.getHex();
        const isDistinctColor =
          (hex > 0x000000 && hex < 0x333333) || // Very dark (oil, carbon)
          (hex > 0xf50000) || // Gold/brass range
          (hex > 0x001080 && hex < 0x0090ff) || // Blue (coolant)
          (hex > 0x600000 && hex < 0xffffff && Math.abs(((hex >> 16) & 0xff) - ((hex >> 8) & 0xff)) > 30); // Distinct hue
        if (isDistinctColor) shouldPreserve = true;
      }

      if (!shouldPreserve) {
        mesh.material = targetMat;
      }
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
      const targetEmissive = isSelected ? 0xfbbf24 : 0x0284c7;
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
