// ============================================================================
// PHASE 42 — MULTI-ELEMENT WING & GROUND EFFECT STRAKES GEOMETRY CAD
// ============================================================================
// 3D CAD generator for dual-element high-downforce GT3 wings (NACA 6412 +
// Fowler slotted flap), Gurney flaps, endplate vortex fences, and Venturi strakes.
// ============================================================================

import * as THREE from 'three';

export interface MultiElementWingSpec {
  wingSpanMm: number;
  mainChordMm: number;
  flapChordMm: number;
  slotGapMm: number;
  flapAngleDeg: number;
  gurneyHeightMm: number;
  maxTheoreticalDownforceNAt200Kmh: number;
  liftToDragRatio: number;
}

export class MultiElementWingGeometryCad {
  /**
   * Calculates aerodynamic geometry coefficients and forces for a multi-element wing.
   */
  public static solveMultiElementWingSpec(params: {
    wingSpanMm?: number;
    mainChordMm?: number;
    flapAngleDeg?: number;
    gurneyHeightMm?: number;
  }): MultiElementWingSpec {
    const span = params.wingSpanMm || 1750;
    const cMain = params.mainChordMm || 320;
    const flapAngle = params.flapAngleDeg || 14.0;
    const gurneyH = params.gurneyHeightMm || 8.0;

    const cFlap = cMain * 0.42; // 42% chord slotted flap
    const slotGap = cMain * 0.025; // 2.5% chord boundary layer slot gap

    // Dual element Cl = Cl_main + Cl_flap * cos(theta) + deltaCl_gurney
    const clMain = 1.15;
    const clFlap = 1.45 * Math.sin((flapAngle + 12) * (Math.PI / 180));
    const deltaClGurney = (gurneyH / 10) * 0.22;
    const totalCl = clMain + clFlap + deltaClGurney;

    // Induced Drag: Cd = Cd0 + (Cl^2) / (pi * AR * e)
    const totalAreaM2 = (span * (cMain + cFlap * 0.85)) / 1e6;
    const aspectRatio = Math.pow(span / 1000, 2) / totalAreaM2;
    const cd = 0.045 + Math.pow(totalCl, 2) / (Math.PI * aspectRatio * 0.85);

    // Downforce at 200 km/h (55.55 m/s, rho = 1.225 kg/m^3)
    const q200 = 0.5 * 1.225 * Math.pow(55.55, 2);
    const downforceN = q200 * totalCl * totalAreaM2;

    const lOverD = totalCl / cd;

    return {
      wingSpanMm: span,
      mainChordMm: cMain,
      flapChordMm: Math.round(cFlap),
      slotGapMm: Math.round(slotGap * 10) / 10,
      flapAngleDeg: flapAngle,
      gurneyHeightMm: gurneyH,
      maxTheoreticalDownforceNAt200Kmh: Math.round(downforceN),
      liftToDragRatio: Math.round(lOverD * 100) / 100,
    };
  }

  /**
   * Generates a 3D Three.js Group of the Multi-Element GT3 Rear Wing.
   */
  public static buildMultiElementWing3D(spec: MultiElementWingSpec): THREE.Group {
    const group = new THREE.Group();

    const carbonMaterial = new THREE.MeshStandardMaterial({
      color: 0x111622,
      metalness: 0.35,
      roughness: 0.15,
    });

    const aluminumPylonMaterial = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.90,
      roughness: 0.20,
    });

    const spanM = spec.wingSpanMm / 1000;
    const mainChordM = spec.mainChordMm / 1000;
    const flapChordM = spec.flapChordMm / 1000;

    // 1. Main Wing Element (NACA 6412 Profile Box/Curved Approximation)
    const mainWingGeo = new THREE.BoxGeometry(spanM, 0.035, mainChordM);
    const mainWing = new THREE.Mesh(mainWingGeo, carbonMaterial);
    mainWing.position.set(0, 0.35, 0);
    group.add(mainWing);

    // 2. Slotted Secondary Flap (Rotated by flap angle)
    const flapGeo = new THREE.BoxGeometry(spanM, 0.022, flapChordM);
    const flap = new THREE.Mesh(flapGeo, carbonMaterial);
    flap.position.set(0, 0.38 + spec.slotGapMm / 1000, mainChordM * 0.45);
    flap.rotation.x = -spec.flapAngleDeg * (Math.PI / 180);
    group.add(flap);

    // 3. Gurney Flap (Vertical Tab at Flap Trailing Edge)
    const gurneyGeo = new THREE.BoxGeometry(spanM, spec.gurneyHeightMm / 1000, 0.004);
    const gurney = new THREE.Mesh(gurneyGeo, carbonMaterial);
    gurney.position.set(0, 0.40, mainChordM * 0.45 + flapChordM * 0.48);
    group.add(gurney);

    // 4. Endplates (Left & Right)
    const endplateGeo = new THREE.BoxGeometry(0.012, 0.28, (mainChordM + flapChordM) * 1.15);
    const endplateL = new THREE.Mesh(endplateGeo, carbonMaterial);
    endplateL.position.set(-spanM / 2, 0.35, mainChordM * 0.2);
    group.add(endplateL);

    const endplateR = new THREE.Mesh(endplateGeo, carbonMaterial);
    endplateR.position.set(spanM / 2, 0.35, mainChordM * 0.2);
    group.add(endplateR);

    // 5. Swan-Neck Top Mount Pylons (Dual Center)
    const pylonGeo = new THREE.BoxGeometry(0.02, 0.32, 0.06);
    const pylonL = new THREE.Mesh(pylonGeo, aluminumPylonMaterial);
    pylonL.position.set(-0.35, 0.20, -0.05);
    group.add(pylonL);

    const pylonR = new THREE.Mesh(pylonGeo, aluminumPylonMaterial);
    pylonR.position.set(0.35, 0.20, -0.05);
    group.add(pylonR);

    return group;
  }
}
