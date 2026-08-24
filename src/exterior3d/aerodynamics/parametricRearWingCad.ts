// ============================================================================
// PHASE 113: PARAMETRIC REAR WING 3D CAD GENERATOR
// ============================================================================
// Procedural Three.js generator for GT/LMP/Formula rear wings with parameterized
// span, chord, AoA (0-35 deg), swan-neck pylons, DRS actuator, Gurney flap, and
// contoured endplates with boundary layer cutouts.
// ============================================================================

import * as THREE from 'three';
import type { RearWingConfig } from '../../sim/aerodynamics/aeroStudioTypes';

export class ParametricRearWingCad {
  /**
   * Builds the complete 3D Three.js Group for the parametric Rear Wing.
   */
  public static buildRearWing3D(
    config: RearWingConfig,
    visualMode: 'realistic' | 'wireframe' | 'cfdPressure' = 'realistic'
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Parametric_Rear_Wing_Assembly';

    const spanM = config.spanMm / 1000;
    const mainChordM = config.mainChordMm / 1000;
    const flapChordM = config.flapChordMm / 1000;
    const heightM = config.heightMm / 1000;
    const aoaRad = (config.angleOfAttackDeg * Math.PI) / 180;
    const endplateHM = config.endplateHeightMm / 1000;

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
      color: visualMode === 'cfdPressure' ? 0x0284c7 : 0x1e293b,
      metalness: 0.85,
      roughness: 0.20,
      wireframe: visualMode === 'wireframe',
    });

    const pylonMaterial = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.92,
      roughness: 0.22,
      wireframe: visualMode === 'wireframe',
    });

    // 1. Primary Airfoil Mainplane (Fixed Element)
    const mainplaneGeo = new THREE.BoxGeometry(spanM, 0.028, mainChordM);
    const mainplaneMesh = new THREE.Mesh(mainplaneGeo, carbonMaterial);
    mainplaneMesh.position.set(0, heightM, 0);
    mainplaneMesh.rotation.x = aoaRad * 0.45;
    mainplaneMesh.castShadow = true;
    group.add(mainplaneMesh);

    // 2. Active DRS / Adjustable Upper Slotted Flap
    const flapGeo = new THREE.BoxGeometry(spanM * 0.98, 0.020, flapChordM);
    const flapMesh = new THREE.Mesh(flapGeo, flapMaterial);
    flapMesh.position.set(
      0,
      heightM + 0.035 + (flapChordM / 2) * Math.sin(aoaRad),
      mainChordM * 0.45 + (flapChordM / 2) * Math.cos(aoaRad)
    );
    flapMesh.rotation.x = aoaRad;
    flapMesh.castShadow = true;
    group.add(flapMesh);

    // 3. Gurney Flap on Upper Airfoil
    if (config.gurneyHeightMm > 0) {
      const gurneyHM = config.gurneyHeightMm / 1000;
      const gurneyGeo = new THREE.BoxGeometry(spanM * 0.98, gurneyHM, 0.006);
      const gurneyMesh = new THREE.Mesh(gurneyGeo, carbonMaterial);
      gurneyMesh.position.set(
        0,
        flapMesh.position.y + gurneyHM / 2 + 0.01,
        flapMesh.position.z + (flapChordM / 2) * Math.cos(aoaRad)
      );
      group.add(gurneyMesh);
    }

    // 4. Endplates (Left & Right)
    const toeRad = (config.endplateToeAngleDeg * Math.PI) / 180;
    const totalChordM = mainChordM + flapChordM * 1.25;
    const endplateGeo = new THREE.BoxGeometry(0.016, endplateHM, totalChordM);

    const leftEndplate = new THREE.Mesh(endplateGeo, carbonMaterial);
    leftEndplate.position.set(-spanM / 2, heightM + 0.02, totalChordM * 0.2);
    leftEndplate.rotation.y = -toeRad;
    group.add(leftEndplate);

    const rightEndplate = new THREE.Mesh(endplateGeo, carbonMaterial);
    rightEndplate.position.set(spanM / 2, heightM + 0.02, totalChordM * 0.2);
    rightEndplate.rotation.y = toeRad;
    group.add(rightEndplate);

    // 5. Swan-Neck Top-Mount Pylons or Bottom Mounts
    if (config.pylonType === 'swan_neck') {
      // Swan neck arch (upper hang over airfoil to maximize suction surface)
      const pylonGeo = new THREE.BoxGeometry(0.03, heightM + 0.08, 0.09);
      const pylonL = new THREE.Mesh(pylonGeo, pylonMaterial);
      pylonL.position.set(-spanM * 0.22, heightM * 0.52, -0.06);
      pylonL.rotation.x = -0.15;
      group.add(pylonL);

      const pylonR = new THREE.Mesh(pylonGeo, pylonMaterial);
      pylonR.position.set(spanM * 0.22, heightM * 0.52, -0.06);
      pylonR.rotation.x = -0.15;
      group.add(pylonR);
    } else {
      // Bottom mount struts
      const pylonGeo = new THREE.BoxGeometry(0.025, heightM, 0.06);
      const pylonL = new THREE.Mesh(pylonGeo, pylonMaterial);
      pylonL.position.set(-spanM * 0.28, heightM * 0.5, 0);
      group.add(pylonL);

      const pylonR = new THREE.Mesh(pylonGeo, pylonMaterial);
      pylonR.position.set(spanM * 0.28, heightM * 0.5, 0);
      group.add(pylonR);
    }

    // 6. DRS Actuator Pod (Center Housing)
    if (config.hasDrsActuator) {
      const drsGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.12, 16);
      const drsMesh = new THREE.Mesh(drsGeo, pylonMaterial);
      drsMesh.rotation.x = Math.PI / 2;
      drsMesh.position.set(0, heightM + 0.04, mainChordM * 0.25);
      group.add(drsMesh);
    }

    return group;
  }
}
