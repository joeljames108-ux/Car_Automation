// ============================================================================
// EXTERIOR 3D — REAL GLB CAR MODEL LOADER WITH PBR PAINT
// ============================================================================
// Loads the actual BMW i8 GLB model with custom metallic clearcoat paint,
// glass transmission, brake caliper coloring, and emissive LED lights.
// ============================================================================

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { PbrMaterialStudio } from '../materials/pbrMaterialStudio';

interface GlbCarModelProps {
  paintColorHex?: number;
  caliperColorHex?: string;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

export const GlbCarModel: React.FC<GlbCarModelProps> = ({
  paintColorHex = 0x0044cc,
  caliperColorHex = '#dc2626',
  autoRotate = false,
  autoRotateSpeed = 0.3,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/exterior/sports_car_bmw_i8.glb');

  // Clone scene to avoid shared geometry issues
  const clonedScene = useMemo(() => {
    const cloned = scene.clone(true);
    return cloned;
  }, [scene]);

  // Auto-rotate
  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * autoRotateSpeed;
    }
  });

  // Apply PBR materials to the cloned GLB
  useEffect(() => {
    if (!clonedScene) return;

    const paintColor = new THREE.Color(paintColorHex);

    // High-quality metallic clearcoat paint
    const paintMaterial = new THREE.MeshPhysicalMaterial({
      color: paintColor,
      metalness: 0.88,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      reflectivity: 1.0,
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xffffff),
      envMapIntensity: 1.8,
      sheen: 0.3,
      sheenColor: paintColor.clone().multiplyScalar(0.7),
      sheenRoughness: 0.2,
      side: THREE.DoubleSide,
    });

    // Glass material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#c8ddf0'),
      metalness: 0.0,
      roughness: 0.01,
      transmission: 0.92,
      transparent: true,
      opacity: 0.45,
      ior: 1.52,
      thickness: 0.005,
      depthWrite: false,
      side: THREE.DoubleSide,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      envMapIntensity: 2.5,
    });

    // Brake caliper
    const caliperMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(caliperColorHex),
      metalness: 0.85,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.6,
    });

    // Carbon fiber
    const carbonMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x111622,
      metalness: 0.40,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 0.9,
      envMapIntensity: 1.6,
      side: THREE.DoubleSide,
    });

    // Emissive OLED red taillight
    const oledRedEmissive = new THREE.MeshStandardMaterial({
      color: 0xff1122,
      emissive: 0xff0022,
      emissiveIntensity: 2.8,
      roughness: 0.1,
      metalness: 0.1,
    });

    // Emissive headlight
    const headlightEmissive = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xfbbf24,
      emissiveIntensity: 2.5,
      roughness: 0.05,
      metalness: 0.1,
    });

    // Apply materials by mesh name
    clonedScene.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) return;
      const mesh = node as THREE.Mesh;
      const name = mesh.name.toLowerCase();

      // Paint panels
      const isPaint = name.includes('body') || name.includes('paint') || name.includes('door')
        || name.includes('hood') || name.includes('fender') || name.includes('roof')
        || name.includes('bumper') || name.includes('quarter') || name.includes('fascia')
        || name.includes('skirt') || name.includes('panel') || name.includes('skin')
        || name.includes('arch') || name.includes('cover') || name.includes('shell')
        || name.includes('cowl') || name.includes('deck') || name.includes('spine');

      // Glass / windows
      const isGlass = name.includes('glass') || name.includes('window') || name.includes('windshield')
        || name.includes('windscreen') || name.includes('backlite') || name.includes('canopy');

      // Caliper / brake
      const isCaliper = name.includes('caliper') || name.includes('calliper') || name.includes('brake_pad');

      // Carbon fiber parts
      const isCarbon = name.includes('carbon') || name.includes('monocoque') || name.includes('weave')
        || name.includes('tub') || name.includes('strake') || name.includes('diffuser')
        || name.includes('splitter') || name.includes('wing') || name.includes('spoiler');

      // Tail / rear lights
      const isTailLight = name.includes('taillight') || name.includes('lightbar')
        || (name.includes('light') && name.includes('rear'));

      // Head / front lights
      const isHeadLight = name.includes('headlight') || name.includes('drl')
        || (name.includes('light') && name.includes('front'));

      if (isCaliper) {
        mesh.material = caliperMat;
      } else if (isTailLight) {
        mesh.material = oledRedEmissive;
      } else if (isHeadLight) {
        mesh.material = headlightEmissive;
      } else if (isGlass) {
        mesh.material = glassMaterial;
      } else if (isCarbon) {
        mesh.material = carbonMaterial;
      } else if (isPaint) {
        // Preserve original texture maps if present
        if (mesh.material instanceof THREE.MeshStandardMaterial && mesh.material.map) {
          paintMaterial.map = mesh.material.map;
        }
        mesh.material = paintMaterial;
      }

      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });

    // Recompute normals for smooth shading
    clonedScene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        if (mesh.geometry) {
          try {
            mesh.geometry.computeVertexNormals();
          } catch { /* ignore */ }
        }
      }
    });
  }, [clonedScene, paintColorHex, caliperColorHex]);

  return (
    <group ref={groupRef} name="GLB_Car_Model_BMW_i8">
      <primitive object={clonedScene} />
    </group>
  );
};

// Preload the GLB
useGLTF.preload('/models/exterior/sports_car_bmw_i8.glb');
