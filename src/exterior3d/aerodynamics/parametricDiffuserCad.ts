// ============================================================================
// PHASE 116: PARAMETRIC REAR DIFFUSER 3D CAD GENERATOR
// ============================================================================
// Procedural Three.js generator for multi-channel rear diffusers with parameterized
// ramp expansion angle (4-24 deg), throat height, vertical strakes array,
// and trailing edge Gurney trip strip.
// ============================================================================

import * as THREE from 'three';
import type { DiffuserConfig } from '../../sim/aerodynamics/aeroStudioTypes';

export class ParametricDiffuserCad {
  /**
   * Builds the complete 3D Three.js Group for the parametric Rear Diffuser.
   */
  public static buildDiffuser3D(
    config: DiffuserConfig,
    visualMode: 'realistic' | 'wireframe' | 'cfdPressure' = 'realistic'
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Parametric_Diffuser_Assembly';

    const lengthM = config.lengthMm / 1000;
    const widthM = config.widthMm / 1000;
    const throatHM = config.throatHeightMm / 1000;
    const rampAngleRad = (config.rampAngleDeg * Math.PI) / 180;
    const exitHM = config.exitHeightMm / 1000;

    // Materials
    const carbonMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0a0e17,
      metalness: 0.35,
      roughness: 0.18,
      clearcoat: 0.95,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.3,
    });

    const strakeMaterial = new THREE.MeshStandardMaterial({
      color: visualMode === 'cfdPressure' ? 0x38bdf8 : 0x1e293b,
      metalness: 0.90,
      roughness: 0.20,
      wireframe: visualMode === 'wireframe',
    });

    // 1. Inclined Diffuser Expansion Ramp (Floor Kick-Up)
    const rampLengthM = lengthM / Math.cos(rampAngleRad);
    const rampGeo = new THREE.BoxGeometry(widthM, 0.016, rampLengthM);
    const rampMesh = new THREE.Mesh(rampGeo, carbonMaterial);
    rampMesh.position.set(
      0,
      throatHM + (exitHM - throatHM) * 0.45,
      lengthM * 0.45
    );
    rampMesh.rotation.x = -rampAngleRad;
    rampMesh.castShadow = true;
    group.add(rampMesh);

    // 2. Vertical Strakes Array (Partitioning Flow Channels)
    const strakeCount = Math.max(2, Math.min(8, config.strakeCount));
    const strakeHM = (config.strakeHeightMm / 1000);
    const strakeLengthM = (config.strakeLengthMm / 1000);

    for (let s = 0; s < strakeCount; s++) {
      const frac = (s / (strakeCount - 1)) * 2 - 1; // -1 to +1
      const posX = frac * (widthM * 0.44);

      const strakeGeo = new THREE.BoxGeometry(0.008, strakeHM, strakeLengthM);
      const strakeMesh = new THREE.Mesh(strakeGeo, strakeMaterial);
      strakeMesh.position.set(
        posX,
        throatHM + strakeHM * 0.4 + (exitHM - throatHM) * 0.35,
        lengthM * 0.45
      );
      strakeMesh.rotation.x = -rampAngleRad * 0.95;
      group.add(strakeMesh);
    }

    // 3. Trailing Edge Gurney Flap / Lip
    if (config.hasGurneyFlap && config.gurneyHeightMm > 0) {
      const gurneyHM = config.gurneyHeightMm / 1000;
      const gurneyGeo = new THREE.BoxGeometry(widthM * 0.98, gurneyHM, 0.006);
      const gurneyMesh = new THREE.Mesh(gurneyGeo, carbonMaterial);
      gurneyMesh.position.set(
        0,
        throatHM + (exitHM - throatHM) * 0.9 + gurneyHM / 2,
        lengthM * 0.92
      );
      group.add(gurneyMesh);
    }

    // 4. Outer Tunnel Side Endplates
    const sidePlateGeo = new THREE.BoxGeometry(0.012, exitHM, lengthM);
    const sidePlateL = new THREE.Mesh(sidePlateGeo, carbonMaterial);
    sidePlateL.position.set(-widthM / 2, throatHM + exitHM / 2, lengthM * 0.45);
    group.add(sidePlateL);

    const sidePlateR = new THREE.Mesh(sidePlateGeo, carbonMaterial);
    sidePlateR.position.set(widthM / 2, throatHM + exitHM / 2, lengthM * 0.45);
    group.add(sidePlateR);

    return group;
  }
}
