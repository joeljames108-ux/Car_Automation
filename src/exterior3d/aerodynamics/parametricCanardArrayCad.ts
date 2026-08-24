// ============================================================================
// PHASE 117: PARAMETRIC DIVE PLANES & CANARDS 3D CAD GENERATOR
// ============================================================================
// Procedural Three.js generator for front bumper canards / dive planes array
// controlling front axle downforce and vortex upwash around front wheels.
// ============================================================================

import * as THREE from 'three';
import type { CanardArrayConfig } from '../../sim/aerodynamics/aeroStudioTypes';

export class ParametricCanardArrayCad {
  /**
   * Builds the complete 3D Three.js Group for the parametric Canards / Dive Planes.
   */
  public static buildCanards3D(
    config: CanardArrayConfig,
    visualMode: 'realistic' | 'wireframe' | 'cfdPressure' = 'realistic'
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Parametric_Canards_Assembly';

    if (config.tierCount === 0) return group;

    const spanM = config.spanMm / 1000;
    const chordM = config.chordMm / 1000;
    const sweepRad = (config.sweepDeg * Math.PI) / 180;
    const incidenceRad = (config.incidenceDeg * Math.PI) / 180;

    const carbonMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0a0e17,
      metalness: 0.35,
      roughness: 0.18,
      clearcoat: 0.95,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.3,
    });

    const fenceMaterial = new THREE.MeshStandardMaterial({
      color: visualMode === 'cfdPressure' ? 0x38bdf8 : 0x1e293b,
      metalness: 0.85,
      roughness: 0.20,
      wireframe: visualMode === 'wireframe',
    });

    for (let tier = 0; tier < config.tierCount; tier++) {
      const tierHeightM = 0.22 + tier * 0.14;
      const tierChordM = chordM * (1 - tier * 0.12);
      const tierSpanM = spanM * (1 - tier * 0.08);

      // Left Canard
      const leftCanardGeo = new THREE.BoxGeometry(tierSpanM, 0.008, tierChordM);
      const leftCanard = new THREE.Mesh(leftCanardGeo, carbonMaterial);
      leftCanard.position.set(-0.88 - tierSpanM / 2, tierHeightM, -1.82 - tier * 0.06);
      leftCanard.rotation.x = -incidenceRad;
      leftCanard.rotation.y = sweepRad;
      leftCanard.castShadow = true;
      group.add(leftCanard);

      // Right Canard
      const rightCanardGeo = new THREE.BoxGeometry(tierSpanM, 0.008, tierChordM);
      const rightCanard = new THREE.Mesh(rightCanardGeo, carbonMaterial);
      rightCanard.position.set(0.88 + tierSpanM / 2, tierHeightM, -1.82 - tier * 0.06);
      rightCanard.rotation.x = -incidenceRad;
      rightCanard.rotation.y = -sweepRad;
      rightCanard.castShadow = true;
      group.add(rightCanard);

      // Endplate Vortex Fences
      if (config.hasEndplateFence) {
        const fenceGeo = new THREE.BoxGeometry(0.006, 0.06, tierChordM * 1.1);
        const fenceL = new THREE.Mesh(fenceGeo, fenceMaterial);
        fenceL.position.set(-0.88 - tierSpanM, tierHeightM + 0.015, -1.82 - tier * 0.06);
        fenceL.rotation.x = -incidenceRad;
        group.add(fenceL);

        const fenceR = new THREE.Mesh(fenceGeo, fenceMaterial);
        fenceR.position.set(0.88 + tierSpanM, tierHeightM + 0.015, -1.82 - tier * 0.06);
        fenceR.rotation.x = -incidenceRad;
        group.add(fenceR);
      }
    }

    return group;
  }
}
