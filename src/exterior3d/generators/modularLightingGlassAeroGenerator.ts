// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — LIGHTING, GLASS & AERO 3D GENERATOR
// ============================================================================
// Procedurally generates matrix LED headlights, OLED taillight bars, laminated
// optical windshield glass, side windows, carbon front splitter, rear diffuser,
// and active aerodynamics rear wing.
// ============================================================================

import * as THREE from 'three';
import { MaterialGrade } from '../../sim/assemblyTypes';

export class ModularLightingGlassAeroGenerator {
  // ── 1. LIGHTING GENERATOR ──
  public static buildLighting(wheelbaseMm: number, trackWidthMm: number): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Lighting_Group';

    const wbM = wheelbaseMm / 1000;
    const halfTrM = (trackWidthMm / 2) / 1000;

    // Headlight Lens Material (Bright Glowing Cyan/White LED)
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const taillightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    // Front Matrix LED Headlights (Left & Right)
    const headGeo = new THREE.BoxGeometry(0.12, 0.08, 0.28);
    const headL = new THREE.Mesh(headGeo, headlightMat);
    headL.position.set(0.85, 0.46, -halfTrM * 0.72);
    const headR = headL.clone();
    headR.position.z = halfTrM * 0.72;
    group.add(headL, headR);

    // Rear Full-Width OLED Taillight Bar
    const tailGeo = new THREE.BoxGeometry(0.08, 0.06, halfTrM * 1.6);
    const tailBar = new THREE.Mesh(tailGeo, taillightMat);
    tailBar.position.set(-wbM - 0.58, 0.58, 0);
    group.add(tailBar);

    return group;
  }

  // ── 2. GLASS & CANOPY GENERATOR ──
  public static buildGlass(wheelbaseMm: number, trackWidthMm: number): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Glass_Group';

    const wbM = wheelbaseMm / 1000;
    const halfTrM = (trackWidthMm / 2) / 1000;

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0284c7'),
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.92,
      thickness: 0.02,
      transparent: true,
      opacity: 0.45,
    });

    // 1. Windshield
    const windshieldGeo = new THREE.BoxGeometry(0.55, 0.02, halfTrM * 1.4);
    const windshield = new THREE.Mesh(windshieldGeo, glassMaterial);
    windshield.position.set(0.05, 0.78, 0);
    windshield.rotation.z = -0.55;
    group.add(windshield);

    // 2. Rear Screen Glass
    const rearGlassGeo = new THREE.BoxGeometry(0.58, 0.02, halfTrM * 1.35);
    const rearGlass = new THREE.Mesh(rearGlassGeo, glassMaterial);
    rearGlass.position.set(-wbM * 0.85, 0.8, 0);
    rearGlass.rotation.z = 0.45;
    group.add(rearGlass);

    // 3. Side Windows (Left & Right)
    const sideWindowGeo = new THREE.BoxGeometry(wbM * 0.48, 0.28, 0.02);
    const sideL = new THREE.Mesh(sideWindowGeo, glassMaterial);
    sideL.position.set(-wbM * 0.4, 0.82, -halfTrM * 0.84);
    const sideR = sideL.clone();
    sideR.position.z = halfTrM * 0.84;
    group.add(sideL, sideR);

    return group;
  }

  // ── 3. AERODYNAMICS GENERATOR ──
  public static buildAerodynamics(
    wheelbaseMm: number,
    trackWidthMm: number,
    materialGrade: MaterialGrade = 'titanium'
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Aerodynamics_Group';

    const wbM = wheelbaseMm / 1000;
    const halfTrM = (trackWidthMm / 2) / 1000;

    const carbonAeroMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#09090b'),
      roughness: 0.25,
      metalness: 0.7,
    });

    // 1. Front Carbon Splitter Blade
    const splitterGeo = new THREE.BoxGeometry(0.35, 0.03, halfTrM * 1.95);
    const splitter = new THREE.Mesh(splitterGeo, carbonAeroMat);
    splitter.position.set(0.98, 0.12, 0);
    group.add(splitter);

    // 2. Front Aero Dive Canards (Left & Right)
    const canardGeo = new THREE.BoxGeometry(0.12, 0.015, 0.22);
    const canardL = new THREE.Mesh(canardGeo, carbonAeroMat);
    canardL.position.set(0.88, 0.28, -halfTrM * 0.92);
    canardL.rotation.x = 0.25;
    const canardR = canardL.clone();
    canardR.position.z = halfTrM * 0.92;
    canardR.rotation.x = -0.25;
    group.add(canardL, canardR);

    // 3. Rear Venturi Diffuser with Vertical Strakes
    const diffuserGeo = new THREE.BoxGeometry(0.48, 0.04, halfTrM * 1.75);
    const diffuser = new THREE.Mesh(diffuserGeo, carbonAeroMat);
    diffuser.position.set(-wbM - 0.55, 0.16, 0);
    diffuser.rotation.z = -0.15;
    group.add(diffuser);

    // 4. Swan-Neck GT3 Rear Wing
    const wingBladeGeo = new THREE.BoxGeometry(0.24, 0.025, halfTrM * 1.8);
    const wingBlade = new THREE.Mesh(wingBladeGeo, carbonAeroMat);
    wingBlade.position.set(-wbM - 0.45, 1.05, 0);
    wingBlade.rotation.z = 0.06;

    // Wing Swan-Neck Uprights
    const uprightGeo = new THREE.BoxGeometry(0.04, 0.35, 0.02);
    const uprightL = new THREE.Mesh(uprightGeo, carbonAeroMat);
    uprightL.position.set(-wbM - 0.38, 0.88, -0.45);
    uprightL.rotation.z = -0.18;
    const uprightR = uprightL.clone();
    uprightR.position.z = 0.45;

    group.add(wingBlade, uprightL, uprightR);

    return group;
  }
}
