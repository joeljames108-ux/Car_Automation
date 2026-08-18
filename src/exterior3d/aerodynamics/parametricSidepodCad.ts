// ============================================================================
// PHASE 115: PARAMETRIC & MORPHING SIDEPOD 3D CAD GENERATOR
// ============================================================================
// Procedural Three.js generator for aerodynamic sidepods with parameterized
// radiator cooling inlets, deep undercut channels, downwash ramps, and rear
// boat-tail taper.
// ============================================================================

import * as THREE from 'three';
import type { SidepodConfig } from '../../sim/aerodynamics/aeroStudioTypes';

export class ParametricSidepodCad {
  /**
   * Builds the complete 3D Three.js Group for the parametric Sidepods (Left + Right).
   */
  public static buildSidepods3D(
    config: SidepodConfig,
    visualMode: 'realistic' | 'wireframe' | 'cfdPressure' = 'realistic'
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Parametric_Sidepods_Assembly';

    const lengthM = config.lengthMm / 1000;
    const widthM = config.widthMm / 1000;
    const heightM = config.heightMm / 1000;
    const undercutDepthM = config.undercutDepthMm / 1000;
    const taperRad = (config.rearTaperDeg * Math.PI) / 180;
    const downwashRad = (config.downwashRampAngleDeg * Math.PI) / 180;

    // Materials
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: visualMode === 'cfdPressure' ? 0xe0f2fe : 0x1e293b,
      metalness: 0.85,
      roughness: 0.20,
      wireframe: visualMode === 'wireframe',
    });

    const inletMeshMaterial = new THREE.MeshStandardMaterial({
      color: visualMode === 'cfdPressure' ? 0xf97316 : 0x020617, // High stagnation pressure at inlet
      metalness: 0.90,
      roughness: 0.35,
      wireframe: visualMode === 'wireframe',
    });

    const fenceMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.90,
      roughness: 0.15,
      wireframe: visualMode === 'wireframe',
    });

    // Helper to generate one sidepod half
    const buildSidepodHalf = (isLeft: boolean): THREE.Group => {
      const halfGroup = new THREE.Group();
      const sign = isLeft ? -1 : 1;
      const posX = sign * (0.55 + widthM / 2);

      // 1. Main Sidepod Body (Upper Bulkhead + Downwash Ramp)
      const mainGeo = new THREE.BoxGeometry(widthM, heightM * 0.75, lengthM * 0.85);
      const mainMesh = new THREE.Mesh(mainGeo, bodyMaterial);
      mainMesh.position.set(posX, heightM * 0.55, 0);
      mainMesh.rotation.y = -sign * taperRad * 0.4;
      mainMesh.rotation.x = -downwashRad;
      mainMesh.castShadow = true;
      halfGroup.add(mainMesh);

      // 2. Undercut Airflow Channel (Sculpted lower inward indent)
      const undercutGeo = new THREE.BoxGeometry(widthM * 0.85, heightM * 0.45, lengthM * 0.9);
      const undercutMesh = new THREE.Mesh(undercutGeo, bodyMaterial);
      undercutMesh.position.set(
        posX + sign * (-undercutDepthM * 0.5),
        heightM * 0.22,
        0
      );
      halfGroup.add(undercutMesh);

      // 3. Radiator Cooling Inlet Scoop (Forward Face)
      const inletGeo = new THREE.BoxGeometry(widthM * 0.88, heightM * 0.5, 0.08);
      const inletMesh = new THREE.Mesh(inletGeo, inletMeshMaterial);
      inletMesh.position.set(posX, heightM * 0.58, -lengthM * 0.42 + config.inletPositionXOffsetMm / 1000);
      inletMesh.rotation.x = 0.15;
      halfGroup.add(inletMesh);

      // 4. Rear Cooling Outlet Louvres
      const outletGeo = new THREE.BoxGeometry(widthM * 0.65, heightM * 0.35, 0.12);
      const outletMesh = new THREE.Mesh(outletGeo, inletMeshMaterial);
      outletMesh.position.set(posX - sign * 0.06, heightM * 0.45, lengthM * 0.42);
      halfGroup.add(outletMesh);

      // 5. Bargeboard / Floor Edge Vortex Fences
      const fenceCount = Math.min(4, config.vortexFencesCount);
      for (let f = 0; f < fenceCount; f++) {
        const fenceGeo = new THREE.BoxGeometry(0.008, heightM * 0.4, 0.22);
        const fenceMesh = new THREE.Mesh(fenceGeo, fenceMaterial);
        fenceMesh.position.set(
          posX + sign * (widthM * 0.45),
          heightM * 0.28,
          -lengthM * 0.35 + f * 0.16
        );
        fenceMesh.rotation.y = sign * (0.2 + f * 0.08);
        halfGroup.add(fenceMesh);
      }

      return halfGroup;
    };

    // Add Left & Right Sidepods
    group.add(buildSidepodHalf(true));
    group.add(buildSidepodHalf(false));

    return group;
  }
}
