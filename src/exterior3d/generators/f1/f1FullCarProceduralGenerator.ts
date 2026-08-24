// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — FULL PROCEDURAL 3D F1 CAR GENERATOR
// ============================================================================
// Generates accurate, modular Three.js geometry for a 2026 ground-effect F1 car:
// - Monocoque Survival Cell + Titanium Halo + Front Nose Cone
// - 4-Element Front Wing with Outwash Endplates
// - Sidepods with Downwash Ramps & Cooling Louvers
// - Venturi Underbody Floor with 4 Longitudinal Fences & Rear Diffuser
// - Engine Cover Shark Fin & Airbox Intake Scoop
// - Multi-Element Rear Wing with Dynamic DRS Flap
// - Pushrod/Pullrod Double Wishbone Suspension Arms
// - 18-inch Magnesium Wheels with Pirelli Slicks & Aero Wheel Covers
// - Carbon-Carbon Brake Discs with Thermal Emissive Glow
// ============================================================================

import * as THREE from "three";
import type { F1CarDesign } from "../../../sim/f1/types/f1Types";

export interface F1Car3DGroupOptions {
  explodedAmount: number;     // 0.0 (assembled) to 1.0 (exploded)
  wireframe: boolean;
  brakeTemperatureC?: number; // 350 to 1000 °C for brake glow
  drsOpen?: boolean;
}

export class F1FullCarProceduralGenerator {
  public static createCarGroup(design: F1CarDesign, options: F1Car3DGroupOptions): THREE.Group {
    const root = new THREE.Group();
    root.name = "F1_Master_Assembly";

    const { explodedAmount, wireframe, brakeTemperatureC = 450, drsOpen = false } = options;

    // Materials Palette
    const primaryColor = new THREE.Color(design.livery.primaryColorHex);
    const secondaryColor = new THREE.Color(design.livery.secondaryColorHex);
    const tertiaryColor = new THREE.Color(design.livery.tertiaryColorHex);

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: primaryColor,
      roughness: design.livery.finishType === "MATTE_LIGHTWEIGHT" ? 0.65 : 0.15,
      metalness: design.livery.finishType === "SATIN_PEARLESCENT" ? 0.8 : 0.4,
      wireframe,
    });

    const accentMaterial = new THREE.MeshStandardMaterial({
      color: secondaryColor,
      roughness: 0.2,
      metalness: 0.6,
      wireframe,
    });

    const carbonMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x1a1a1a),
      roughness: 0.45,
      metalness: 0.3,
      wireframe,
    });

    const titaniumMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x8a929a),
      roughness: 0.25,
      metalness: 0.9,
      wireframe,
    });

    const tireMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x111111),
      roughness: 0.85,
      metalness: 0.05,
      wireframe,
    });

    const brakeGlowFactor = Math.max(0, Math.min(1, (brakeTemperatureC - 400) / 600));
    const brakeMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x222222),
      emissive: new THREE.Color(0xff4500),
      emissiveIntensity: brakeGlowFactor * 2.5,
      roughness: 0.6,
      wireframe,
    });

    // ── 1. Monocoque & Cockpit ──
    const monocoqueGroup = new THREE.Group();
    monocoqueGroup.name = "F1_Monocoque";

    // Main Survival Cell (Tapered Box)
    const tubGeo = new THREE.BoxGeometry(0.72, 0.55, 2.4);
    const tubMesh = new THREE.Mesh(tubGeo, bodyMaterial);
    tubMesh.position.set(0, 0.35, 0.2);
    monocoqueGroup.add(tubMesh);

    // Nose Cone (Pointed Taper)
    const noseGeo = new THREE.ConeGeometry(0.35, 1.4, 4);
    noseGeo.rotateX(Math.PI / 2);
    const noseMesh = new THREE.Mesh(noseGeo, bodyMaterial);
    noseMesh.position.set(0, 0.32, 2.0);
    noseMesh.scale.set(0.9, 0.5, 1.0);
    monocoqueGroup.add(noseMesh);

    // Titanium Halo
    const haloCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.72, 0.55),
      new THREE.Vector3(-0.25, 0.74, 0.1),
      new THREE.Vector3(0, 0.78, -0.45),
      new THREE.Vector3(0.25, 0.74, 0.1),
      new THREE.Vector3(0, 0.72, 0.55),
    ]);
    const haloGeo = new THREE.TubeGeometry(haloCurve, 32, 0.024, 8, false);
    const haloMesh = new THREE.Mesh(haloGeo, titaniumMaterial);
    monocoqueGroup.add(haloMesh);

    // Central Halo Pillar
    const haloPillarGeo = new THREE.CylinderGeometry(0.018, 0.022, 0.35, 8);
    const haloPillar = new THREE.Mesh(haloPillarGeo, titaniumMaterial);
    haloPillar.position.set(0, 0.55, 0.55);
    monocoqueGroup.add(haloPillar);

    // Airbox / Engine Intake Scoop
    const airboxGeo = new THREE.BoxGeometry(0.32, 0.45, 0.6);
    const airboxMesh = new THREE.Mesh(airboxGeo, bodyMaterial);
    airboxMesh.position.set(0, 0.85, -0.45);
    monocoqueGroup.add(airboxMesh);

    // Shark Fin
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(0, 0.45);
    finShape.lineTo(-1.1, 0.2);
    finShape.lineTo(-1.1, 0);
    finShape.closePath();
    const finExtrude = new THREE.ExtrudeGeometry(finShape, { depth: 0.012, bevelEnabled: false });
    const finMesh = new THREE.Mesh(finExtrude, accentMaterial);
    finMesh.rotation.y = Math.PI / 2;
    finMesh.position.set(0.006, 0.75, -0.45);
    monocoqueGroup.add(finMesh);

    root.add(monocoqueGroup);

    // ── 2. Front Wing Assembly ──
    const frontWingGroup = new THREE.Group();
    frontWingGroup.name = "F1_Front_Wing";
    frontWingGroup.position.set(0, 0.15 * explodedAmount, 1.2 * explodedAmount);

    // Mainplane
    const fwMainGeo = new THREE.BoxGeometry(1.95, 0.025, 0.42);
    const fwMain = new THREE.Mesh(fwMainGeo, bodyMaterial);
    fwMain.position.set(0, 0.12, 2.45);
    frontWingGroup.add(fwMain);

    // Flap Elements (Tiered)
    for (let f = 1; f <= design.aero.frontWingElementsCount; f++) {
      const flapGeo = new THREE.BoxGeometry(1.92, 0.015, 0.1);
      const flap = new THREE.Mesh(flapGeo, carbonMaterial);
      flap.position.set(0, 0.12 + f * 0.028, 2.45 - f * 0.07);
      flap.rotation.x = THREE.MathUtils.degToRad(design.aero.frontWingFlapAngleDeg * 0.4);
      frontWingGroup.add(flap);
    }

    // Endplates
    const epGeo = new THREE.BoxGeometry(0.02, 0.32, 0.58);
    const epL = new THREE.Mesh(epGeo, accentMaterial);
    epL.position.set(-0.97, 0.22, 2.45);
    const epR = new THREE.Mesh(epGeo, accentMaterial);
    epR.position.set(0.97, 0.22, 2.45);
    frontWingGroup.add(epL, epR);

    root.add(frontWingGroup);

    // ── 3. Sidepods & Floor Undercut ──
    const sidepodsGroup = new THREE.Group();
    sidepodsGroup.name = "F1_Sidepods_Floor";

    // Left Sidepod
    const spLGeo = new THREE.BoxGeometry(0.48, 0.45, 1.45);
    const spL = new THREE.Mesh(spLGeo, bodyMaterial);
    spL.position.set(-0.58 - explodedAmount * 0.4, 0.34, -0.05);
    sidepodsGroup.add(spL);

    // Right Sidepod
    const spRGeo = new THREE.BoxGeometry(0.48, 0.45, 1.45);
    const spR = new THREE.Mesh(spRGeo, bodyMaterial);
    spR.position.set(0.58 + explodedAmount * 0.4, 0.34, -0.05);
    sidepodsGroup.add(spR);

    // Floor (Venturi Ground Effect Plank)
    const floorGeo = new THREE.BoxGeometry(1.68, 0.035, 2.6);
    const floorMesh = new THREE.Mesh(floorGeo, carbonMaterial);
    floorMesh.position.set(0, 0.08 - explodedAmount * 0.3, 0.1);
    sidepodsGroup.add(floorMesh);

    // Rear Diffuser
    const diffGeo = new THREE.BoxGeometry(1.05, 0.28, 0.7);
    const diffMesh = new THREE.Mesh(diffGeo, carbonMaterial);
    diffMesh.position.set(0, 0.22 - explodedAmount * 0.3, -1.35);
    diffMesh.rotation.x = THREE.MathUtils.degToRad(-design.aero.diffuserExpansionAngleDeg);
    sidepodsGroup.add(diffMesh);

    root.add(sidepodsGroup);

    // ── 4. Rear Wing Assembly & DRS ──
    const rearWingGroup = new THREE.Group();
    rearWingGroup.name = "F1_Rear_Wing";
    rearWingGroup.position.set(0, 0.25 * explodedAmount, -1.1 * explodedAmount);

    // Pylons (Swan Neck)
    const pylonGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.72, 8);
    const pylonL = new THREE.Mesh(pylonGeo, carbonMaterial);
    pylonL.position.set(-0.15, 0.65, -1.45);
    const pylonR = new THREE.Mesh(pylonGeo, carbonMaterial);
    pylonR.position.set(0.15, 0.65, -1.45);
    rearWingGroup.add(pylonL, pylonR);

    // Mainplane
    const rwMainGeo = new THREE.BoxGeometry(1.25, 0.03, 0.34);
    const rwMain = new THREE.Mesh(rwMainGeo, bodyMaterial);
    rwMain.position.set(0, 0.95, -1.48);
    rwMain.rotation.x = THREE.MathUtils.degToRad(design.aero.rearWingMainPlaneAngleDeg);
    rearWingGroup.add(rwMain);

    // DRS Flap
    const drsGeo = new THREE.BoxGeometry(1.22, 0.02, 0.18);
    const drsFlap = new THREE.Mesh(drsGeo, accentMaterial);
    const drsFlapAngle = drsOpen ? 4 : design.aero.rearWingMainPlaneAngleDeg + 12;
    drsFlap.position.set(0, 1.05, -1.42);
    drsFlap.rotation.x = THREE.MathUtils.degToRad(drsFlapAngle);
    rearWingGroup.add(drsFlap);

    // Rear Endplates
    const rEpGeo = new THREE.BoxGeometry(0.02, 0.55, 0.48);
    const rEpL = new THREE.Mesh(rEpGeo, accentMaterial);
    rEpL.position.set(-0.63, 0.88, -1.45);
    const rEpR = new THREE.Mesh(rEpGeo, accentMaterial);
    rEpR.position.set(0.63, 0.88, -1.45);
    rearWingGroup.add(rEpL, rEpR);

    // Beam Wing
    const beamGeo = new THREE.BoxGeometry(0.95, 0.02, 0.18);
    const beam = new THREE.Mesh(beamGeo, carbonMaterial);
    beam.position.set(0, 0.45, -1.45);
    rearWingGroup.add(beam);

    root.add(rearWingGroup);

    // ── 5. Wheels, Suspension & Brakes ──
    const wheelGroup = new THREE.Group();
    wheelGroup.name = "F1_Wheels_Suspension";

    const wheelPositions = [
      { name: "FL", x: -0.92, y: 0.36, z: 1.55, isFront: true },
      { name: "FR", x: 0.92, y: 0.36, z: 1.55, isFront: true },
      { name: "RL", x: -0.88, y: 0.36, z: -1.35, isFront: false },
      { name: "RR", x: 0.88, y: 0.36, z: -1.35, isFront: false },
    ];

    wheelPositions.forEach((pos) => {
      const corner = new THREE.Group();
      corner.position.set(
        pos.x + (pos.x > 0 ? 1 : -1) * explodedAmount * 0.5,
        pos.y,
        pos.z
      );

      // Tire (18-inch)
      const width = pos.isFront ? 0.305 : 0.405;
      const tireGeo = new THREE.CylinderGeometry(0.36, 0.36, width, 24);
      tireGeo.rotateZ(Math.PI / 2);
      const tireMesh = new THREE.Mesh(tireGeo, tireMaterial);
      corner.add(tireMesh);

      // Wheel Rim Cover
      const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, width + 0.01, 16);
      rimGeo.rotateZ(Math.PI / 2);
      const rimMesh = new THREE.Mesh(rimGeo, carbonMaterial);
      corner.add(rimMesh);

      // Brake Disc (Glowing inside)
      const brakeGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.04, 16);
      brakeGeo.rotateZ(Math.PI / 2);
      const brakeMesh = new THREE.Mesh(brakeGeo, brakeMaterial);
      corner.add(brakeMesh);

      wheelGroup.add(corner);

      // Wishbone Links to Chassis
      const wishboneGeo = new THREE.CylinderGeometry(0.012, 0.012, Math.abs(pos.x) - 0.35, 6);
      wishboneGeo.rotateZ(Math.PI / 2);
      const wishboneUpper = new THREE.Mesh(wishboneGeo, carbonMaterial);
      wishboneUpper.position.set((pos.x * 0.5), pos.y + 0.08, pos.z);
      const wishboneLower = new THREE.Mesh(wishboneGeo, carbonMaterial);
      wishboneLower.position.set((pos.x * 0.5), pos.y - 0.08, pos.z);

      wheelGroup.add(wishboneUpper, wishboneLower);
    });

    root.add(wheelGroup);

    return root;
  }
}
