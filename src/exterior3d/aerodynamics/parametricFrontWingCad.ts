// ============================================================================
// PHASE 112: PARAMETRIC FRONT WING 3D CAD GENERATOR
// ============================================================================
// Procedural Three.js 3D mesh generator for high-downforce front wings with
// variable span, mainplane chord, Fowler slotted flaps, endplate vortex fences,
// ride height ground-proximity effect, and PBR carbon fiber materials.
// ============================================================================

import * as THREE from 'three';
import type { FrontWingConfig } from '../../sim/aerodynamics/aeroStudioTypes';

export class ParametricFrontWingCad {
  /**
   * Builds the complete 3D Three.js Group for the parametric Front Wing.
   */
  public static buildFrontWing3D(
    config: FrontWingConfig,
    visualMode: 'realistic' | 'wireframe' | 'cfdPressure' = 'realistic'
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Parametric_Front_Wing_Assembly';

    const spanM = config.spanMm / 1000;
    const mainChordM = config.mainChordMm / 1000;
    const flapChordM = config.flapChordMm / 1000;
    const rideHeightM = config.rideHeightMm / 1000;
    const endplateHM = config.endplateHeightMm / 1000;
    const flapLengthM = (spanM * config.flapLengthPct) / 100;

    // Materials
    const carbonMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0a0e17,
      metalness: 0.35,
      roughness: 0.18,
      clearcoat: 0.95,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.3,
    });

    const flapMaterial = new THREE.MeshStandardMaterial({
      color: visualMode === 'cfdPressure' ? 0x38bdf8 : 0x1e293b,
      metalness: 0.80,
      roughness: 0.22,
      wireframe: visualMode === 'wireframe',
    });

    const pylonMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.15,
      wireframe: visualMode === 'wireframe',
    });

    // 1. Mainplane Airfoil (Curved NACA approximation box + leading edge radius)
    const mainplaneGeo = new THREE.BoxGeometry(spanM, 0.024, mainChordM);
    const mainplaneMesh = new THREE.Mesh(mainplaneGeo, carbonMaterial);
    mainplaneMesh.position.set(0, rideHeightM + 0.012, 0);
    mainplaneMesh.castShadow = true;
    mainplaneMesh.receiveShadow = true;
    group.add(mainplaneMesh);

    // 2. Fowler Slotted Flap 1 (Rotated and translated)
    const flapRad = (-config.flapAngleDeg * Math.PI) / 180;
    const slotGapM = config.slotGapMm / 1000;
    const flap1Geo = new THREE.BoxGeometry(flapLengthM, 0.018, flapChordM);
    const flap1Mesh = new THREE.Mesh(flap1Geo, flapMaterial);
    flap1Mesh.position.set(
      0,
      rideHeightM + 0.024 + slotGapM + Math.sin(Math.abs(flapRad)) * 0.03,
      mainChordM * 0.42 + (flapChordM / 2) * Math.cos(flapRad)
    );
    flap1Mesh.rotation.x = flapRad;
    flap1Mesh.castShadow = true;
    group.add(flap1Mesh);

    // 3. Optional Multi-Element Upper Flap (3-element configuration)
    if (config.elementCount >= 2) {
      const upperFlapChordM = flapChordM * 0.65;
      const upperFlapGeo = new THREE.BoxGeometry(flapLengthM * 0.92, 0.014, upperFlapChordM);
      const upperFlapMesh = new THREE.Mesh(upperFlapGeo, flapMaterial);
      const upperFlapRad = ((-config.flapAngleDeg * 1.25) * Math.PI) / 180;
      upperFlapMesh.position.set(
        0,
        flap1Mesh.position.y + 0.035,
        flap1Mesh.position.z + upperFlapChordM * 0.5
      );
      upperFlapMesh.rotation.x = upperFlapRad;
      upperFlapMesh.castShadow = true;
      group.add(upperFlapMesh);
    }

    // 4. Vertical Endplates (Left & Right with Toe-Out)
    const toeRad = (config.endplateToeAngleDeg * Math.PI) / 180;
    const totalChordM = mainChordM + flapChordM * 1.1;
    const endplateGeo = new THREE.BoxGeometry(0.014, endplateHM, totalChordM);

    const leftEndplate = new THREE.Mesh(endplateGeo, carbonMaterial);
    leftEndplate.position.set(-spanM / 2, rideHeightM + endplateHM / 2 - 0.02, totalChordM * 0.15);
    leftEndplate.rotation.y = -toeRad;
    group.add(leftEndplate);

    const rightEndplate = new THREE.Mesh(endplateGeo, carbonMaterial);
    rightEndplate.position.set(spanM / 2, rideHeightM + endplateHM / 2 - 0.02, totalChordM * 0.15);
    rightEndplate.rotation.y = toeRad;
    group.add(rightEndplate);

    // 5. Gurney Flap on Primary Flap Trailing Edge
    if (config.gurneyHeightMm > 0) {
      const gurneyHM = config.gurneyHeightMm / 1000;
      const gurneyGeo = new THREE.BoxGeometry(flapLengthM, gurneyHM, 0.005);
      const gurneyMesh = new THREE.Mesh(gurneyGeo, carbonMaterial);
      gurneyMesh.position.set(
        0,
        flap1Mesh.position.y + gurneyHM / 2 + 0.008,
        flap1Mesh.position.z + (flapChordM / 2) * Math.cos(flapRad)
      );
      group.add(gurneyMesh);
    }

    // 6. Dual Nose Mounting Pylons
    const pylonGeo = new THREE.BoxGeometry(0.025, 0.16, 0.09);
    const pylonL = new THREE.Mesh(pylonGeo, pylonMaterial);
    pylonL.position.set(-0.22, rideHeightM + 0.09, -0.04);
    group.add(pylonL);

    const pylonR = new THREE.Mesh(pylonGeo, pylonMaterial);
    pylonR.position.set(0.22, rideHeightM + 0.09, -0.04);
    group.add(pylonR);

    // 7. Outer Footplate / Vortex Shedding Fences
    if (config.hasVortexGenerators) {
      const footplateGeo = new THREE.BoxGeometry(0.08, 0.008, totalChordM * 0.9);
      const footplateL = new THREE.Mesh(footplateGeo, carbonMaterial);
      footplateL.position.set(-spanM / 2 - 0.035, rideHeightM, totalChordM * 0.15);
      group.add(footplateL);

      const footplateR = new THREE.Mesh(footplateGeo, carbonMaterial);
      footplateR.position.set(spanM / 2 + 0.035, rideHeightM, totalChordM * 0.15);
      group.add(footplateR);
    }

    return group;
  }
}
