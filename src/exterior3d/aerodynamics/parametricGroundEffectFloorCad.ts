// ============================================================================
// PHASE 114: PARAMETRIC GROUND EFFECT VENTURI FLOOR 3D CAD GENERATOR
// ============================================================================
// Procedural Three.js generator for underbody Venturi tunnels, ground effect
// suction floors, longitudinal strakes, and flexible edge wings.
// ============================================================================

import * as THREE from 'three';
import type { GroundEffectFloorConfig } from '../../sim/aerodynamics/aeroStudioTypes';

export class ParametricGroundEffectFloorCad {
  /**
   * Builds the complete 3D Three.js Group for the parametric Ground Effect Floor.
   */
  public static buildFloor3D(
    config: GroundEffectFloorConfig,
    visualMode: 'realistic' | 'wireframe' | 'cfdPressure' = 'realistic'
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Parametric_Ground_Effect_Floor_Assembly';

    const lengthM = config.floorLengthMm / 1000;
    const widthM = config.floorWidthMm / 1000;
    const throatHM = config.tunnelThroatHeightMm / 1000;
    const edgeHM = config.edgeWingHeightMm / 1000;

    // Materials
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: visualMode === 'cfdPressure' ? 0x0284c7 : 0x111827,
      metalness: 0.70,
      roughness: 0.30,
      wireframe: visualMode === 'wireframe',
    });

    const strakeMaterial = new THREE.MeshStandardMaterial({
      color: visualMode === 'cfdPressure' ? 0xfbbf24 : 0x1f2937,
      metalness: 0.85,
      roughness: 0.20,
      wireframe: visualMode === 'wireframe',
    });

    const edgeSkirtMaterial = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.60,
      roughness: 0.40,
      wireframe: visualMode === 'wireframe',
    });

    // 1. Flat Undertray Base Plank
    const baseGeo = new THREE.BoxGeometry(widthM * 0.82, 0.015, lengthM * 0.95);
    const baseMesh = new THREE.Mesh(baseGeo, floorMaterial);
    baseMesh.position.set(0, throatHM + 0.008, 0);
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // 2. Venturi Tunnels (Left and Right Underfloor Channels)
    const tunnelWidthM = (widthM * 0.38);
    const throatPosM = (config.tunnelThroatPositionPct / 100 - 0.5) * lengthM;
    const expansionRatio = config.tunnelExpansionRatio;

    // Left Venturi channel profile
    const tunnelGeoL = new THREE.BoxGeometry(tunnelWidthM, 0.02, lengthM * 0.6);
    const tunnelMeshL = new THREE.Mesh(tunnelGeoL, floorMaterial);
    tunnelMeshL.position.set(-widthM * 0.26, throatHM + 0.015 * expansionRatio, throatPosM + lengthM * 0.15);
    tunnelMeshL.rotation.x = -0.04 * expansionRatio;
    group.add(tunnelMeshL);

    // Right Venturi channel profile
    const tunnelMeshR = tunnelMeshL.clone();
    tunnelMeshR.position.x = widthM * 0.26;
    group.add(tunnelMeshR);

    // 3. Longitudinal Strakes Array (Partitioning Venturi Channels)
    const strakeCount = Math.max(2, Math.min(6, config.strakeCount));
    const strakeLengthM = lengthM * 0.55;
    const strakeHeightM = throatHM * 1.8;

    for (let i = 0; i < strakeCount; i++) {
      const frac = (i / (strakeCount - 1)) * 2 - 1; // -1 to +1
      const posX = frac * (widthM * 0.42);

      const strakeGeo = new THREE.BoxGeometry(0.008, strakeHeightM, strakeLengthM);
      const strakeMesh = new THREE.Mesh(strakeGeo, strakeMaterial);
      strakeMesh.position.set(posX, throatHM + strakeHeightM / 2, throatPosM + lengthM * 0.1);
      group.add(strakeMesh);
    }

    // 4. Flexible Outer Edge Wings / Sealing Skirts (Left & Right)
    const skirtGeo = new THREE.BoxGeometry(0.012, edgeHM, lengthM * 0.85);
    const skirtRad = (config.floorEdgeSealAngleDeg * Math.PI) / 180;

    const skirtL = new THREE.Mesh(skirtGeo, edgeSkirtMaterial);
    skirtL.position.set(-widthM / 2, throatHM + edgeHM / 2, 0);
    skirtL.rotation.z = -skirtRad;
    group.add(skirtL);

    const skirtR = new THREE.Mesh(skirtGeo, edgeSkirtMaterial);
    skirtR.position.set(widthM / 2, throatHM + edgeHM / 2, 0);
    skirtR.rotation.z = skirtRad;
    group.add(skirtR);

    // 5. Front T-Tray / Splitter Keel Transition
    const keelGeo = new THREE.ConeGeometry(0.12, 0.35, 4);
    const keelMesh = new THREE.Mesh(keelGeo, floorMaterial);
    keelMesh.rotation.x = Math.PI / 2;
    keelMesh.position.set(0, throatHM + 0.05, -lengthM * 0.45);
    group.add(keelMesh);

    return group;
  }
}
