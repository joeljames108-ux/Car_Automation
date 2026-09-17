// =============================================================================
// DEDICATED ARCHITECTURE GLB VIEWER (REACT THREE FIBER)
// =============================================================================
// Dynamically loads the specific vehicle platform's discrete GLB assets:
// 1. Chassis GLB (/vehicles/{category}/chassis.glb)
// 2. Body Framework GLB (/vehicles/{category}/body-framework.glb)
// 3. Floor Pan GLB (/vehicles/{category}/floor.glb)
// 4. Wheel Arches GLB (/vehicles/{category}/wheel-arches.glb)
// 5. Hardpoints GLB (/vehicles/{category}/hardpoints.glb)
// 6. Packaging Envelopes GLB (/vehicles/{category}/envelopes.glb)
//
// Supports:
// - Real-time PBR material customization (paint color & finish on framework)
// - Exploded view kinematics offset
// - X-Ray / translucent wireframe mode
// - Individual layer visibility toggles
// =============================================================================

import React, { useMemo, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

if (typeof window !== "undefined") {
  try {
    useGLTF.setDecoderPath("/draco/");
  } catch {
    // Fallback if unavailable
  }
}
import { VehicleCategory } from "../../sim/vehicleArchitecture/vehicleArchitectureTypes";
import { getVehicleArchitecture } from "../../sim/vehicleArchitecture/vehicleArchitectureRegistry";
import { PaintFinishType } from "./GlbCarModel";

export interface ArchitectureLayerToggles {
  chassis: boolean;
  bodyFramework: boolean;
  floor: boolean;
  wheelArches: boolean;
  hardpoints: boolean;
  envelopes: boolean;
}

export interface DedicatedArchitectureGlbViewerProps {
  category: VehicleCategory;
  paintColorHex?: number;
  paintFinish?: PaintFinishType;
  layers?: ArchitectureLayerToggles;
  explodedProgress?: number; // 0.0 to 1.0
  isXRay?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  showDimensions?: boolean;
}

// Sub-component to load and render an individual GLB asset layer
const GlbLayerMesh: React.FC<{
  assetPath: string;
  visible: boolean;
  offset?: [number, number, number];
  materialOverride?: THREE.Material;
  isWireframe?: boolean;
  opacity?: number;
}> = ({ assetPath, visible, offset = [0, 0, 0], materialOverride, isWireframe = false, opacity = 1.0 }) => {
  const { scene } = useGLTF(assetPath);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    if (!clonedScene) return;

    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (materialOverride) {
          mesh.material = materialOverride;
        } else if (opacity < 1.0) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => {
              m.transparent = true;
              m.opacity = opacity;
              m.depthWrite = opacity > 0.5;
              m.needsUpdate = true;
            });
          } else if (mesh.material) {
            mesh.material.transparent = true;
            mesh.material.opacity = opacity;
            mesh.material.depthWrite = opacity > 0.5;
            mesh.material.needsUpdate = true;
          }
        }
      }
    });
  }, [clonedScene, materialOverride, opacity, isWireframe]);

  if (!visible) return null;

  return (
    <group position={offset}>
      <primitive object={clonedScene} />
    </group>
  );
};

export const DedicatedArchitectureGlbViewer: React.FC<DedicatedArchitectureGlbViewerProps> = ({
  category,
  paintColorHex = 0xd97706, // High-visibility amber gold
  paintFinish = "metallic",
  layers = {
    chassis: true,
    bodyFramework: true,
    floor: true,
    wheelArches: true,
    hardpoints: true,
    envelopes: false,
  },
  explodedProgress = 0,
  isXRay = false,
  autoRotate = false,
  autoRotateSpeed = 0.5,
  showDimensions = false,
}) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const arch = useMemo(() => getVehicleArchitecture(category), [category]);

  useFrame((_, delta) => {
    if (autoRotate && rootGroupRef.current) {
      rootGroupRef.current.rotation.y += delta * autoRotateSpeed;
    }
  });

  // Dedicated PBR Chassis Material (Machined Titanium & Forged Alloy)
  const chassisMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.92,
      roughness: 0.18,
      envMapIntensity: 1.6,
      side: THREE.DoubleSide,
    });
  }, []);

  // Dedicated PBR Body Framework Cage Material (Customized Paint Color & Finish)
  const frameworkMaterial = useMemo(() => {
    const pc = new THREE.Color(paintColorHex);
    const baseParams: THREE.MeshPhysicalMaterialParameters = {
      color: pc,
      side: THREE.DoubleSide,
      envMapIntensity: 2.0,
      transparent: isXRay,
      opacity: isXRay ? 0.32 : 1.0,
      depthWrite: !isXRay,
    };

    switch (paintFinish) {
      case "gloss":
        return new THREE.MeshPhysicalMaterial({
          ...baseParams,
          metalness: 0.9,
          roughness: 0.08,
          clearcoat: 1.0,
          clearcoatRoughness: 0.01,
          reflectivity: 1.0,
        });
      case "matte":
        return new THREE.MeshPhysicalMaterial({
          ...baseParams,
          metalness: 0.35,
          roughness: 0.65,
          clearcoat: 0.1,
        });
      case "satin":
        return new THREE.MeshPhysicalMaterial({
          ...baseParams,
          metalness: 0.75,
          roughness: 0.3,
          clearcoat: 0.5,
        });
      case "chameleon":
        return new THREE.MeshPhysicalMaterial({
          ...baseParams,
          metalness: 0.85,
          roughness: 0.15,
          clearcoat: 1.0,
          iridescence: 1.0,
          iridescenceIOR: 1.8,
        });
      case "metallic":
      default:
        return new THREE.MeshPhysicalMaterial({
          ...baseParams,
          metalness: 0.88,
          roughness: 0.14,
          clearcoat: 1.0,
          clearcoatRoughness: 0.02,
        });
    }
  }, [paintColorHex, paintFinish, isXRay]);

  // Floor Pan Carbon Composite Material
  const floorMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.45,
      roughness: 0.4,
      envMapIntensity: 1.2,
      side: THREE.DoubleSide,
    });
  }, []);

  // Wheel Arch Composite Material
  const wheelArchMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.25,
      roughness: 0.7,
      envMapIntensity: 0.9,
      side: THREE.DoubleSide,
    });
  }, []);

  // Hardpoint Holographic Glowing Material
  const hardpointMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      metalness: 0.6,
      roughness: 0.2,
    });
  }, []);

  // Exploded View Trajectory Offsets
  // As explodedProgress increases:
  // - Body Framework rises in +Y
  // - Floor pan lowers in -Y
  // - Wheel arches separate slightly in vertical Y
  const frameworkOffset: [number, number, number] = useMemo(() => {
    return [0, explodedProgress * 0.95, 0];
  }, [explodedProgress]);

  const floorOffset: [number, number, number] = useMemo(() => {
    return [0, -explodedProgress * 0.35, 0];
  }, [explodedProgress]);

  const wheelArchOffset: [number, number, number] = useMemo(() => {
    return [0, explodedProgress * 0.45, 0];
  }, [explodedProgress]);

  return (
    <group ref={rootGroupRef} position={[0, -0.05, 0]}>
      {/* 1. Dedicated Vehicle Chassis GLB */}
      <GlbLayerMesh
        assetPath={arch.assets.chassisAsset}
        visible={layers.chassis}
        materialOverride={chassisMaterial}
      />

      {/* 2. Dedicated Vehicle Body Framework GLB */}
      <GlbLayerMesh
        assetPath={arch.assets.bodyFrameworkAsset}
        visible={layers.bodyFramework}
        offset={frameworkOffset}
        materialOverride={frameworkMaterial}
        opacity={isXRay ? 0.32 : 1.0}
      />

      {/* 3. Floor Pan GLB */}
      <GlbLayerMesh
        assetPath={arch.assets.floorAsset}
        visible={layers.floor}
        offset={floorOffset}
        materialOverride={floorMaterial}
      />

      {/* 4. Wheel Arches GLB */}
      <GlbLayerMesh
        assetPath={arch.assets.wheelArchAsset}
        visible={layers.wheelArches}
        offset={wheelArchOffset}
        materialOverride={wheelArchMaterial}
      />

      {/* 5. Hardpoints GLB */}
      <GlbLayerMesh
        assetPath={arch.assets.hardpointAsset}
        visible={layers.hardpoints}
        materialOverride={hardpointMaterial}
      />

      {/* 6. Packaging Envelopes GLB */}
      <GlbLayerMesh
        assetPath={arch.assets.envelopeAsset}
        visible={layers.envelopes}
      />

      {/* 7. Interactive 3D Dimension Calipers & Visual Datum Lines */}
      {showDimensions && (
        <group position={[0, 0, 0]}>
          {/* Wheelbase Caliper (Along Z axis) */}
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  arch.trackFrontMm / 2000 + 0.15, 0.05, -arch.wheelbaseMm / 2000,
                  arch.trackFrontMm / 2000 + 0.15, 0.05, arch.wheelbaseMm / 2000,
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#38bdf8" linewidth={2} />
          </lineSegments>

          {/* Width Caliper (Along X axis) */}
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  -arch.overallWidthMm / 2000, 0.05, arch.overallLengthMm / 2000 + 0.15,
                  arch.overallWidthMm / 2000, 0.05, arch.overallLengthMm / 2000 + 0.15,
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#f59e0b" linewidth={2} />
          </lineSegments>

          {/* Height Caliper (Along Y axis) */}
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  arch.overallWidthMm / 2000 + 0.15, 0, 0,
                  arch.overallWidthMm / 2000 + 0.15, arch.overallHeightMm / 1000, 0,
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#10b981" linewidth={2} />
          </lineSegments>
        </group>
      )}

      {/* Ground Shadow Datum Disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[2.6, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>
    </group>
  );
};
