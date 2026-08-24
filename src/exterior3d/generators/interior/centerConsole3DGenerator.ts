// ============================================================================
// ULTRA-FIDELITY 3D INTERIOR STUDIO — PROCEDURAL CENTER CONSOLE 3D GENERATOR
// ============================================================================
// Constructs 5 distinct automotive center console architectures in Three.js:
// 1. Open-Gated Manual: Mirror-polished steel 6-speed gate, billet shift ball, cupholders
// 2. Sequential Race Lever: CNC aluminum sequential dog-box shifter with reverse lockout
// 3. Crystal Rotary Selector: Faceted crystal glass rotary dial, dual wireless chargers
// 4. Fighter-Jet Start Flap: Red flip-up aircraft start cover, anodized toggle rack
// 5. Track Carbon Bridge: Plumbed fire bottle, master kill switch, brake bias dial
// ============================================================================

import * as THREE from 'three';
import {
  CenterConsoleStyle,
  InteriorMaterialTheme,
} from '../../types/interiorStudioTypes';

export class CenterConsole3DGenerator {
  /**
   * Builds the complete center console tunnel assembly.
   */
  public static buildCenterConsole(
    style: CenterConsoleStyle,
    materials: InteriorMaterialTheme,
    wheelbaseM: number,
    ambientColorHex: string = '#06b6d4'
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = `CenterConsole_${style}`;

    const consoleLength = Math.max(0.75, Math.min(1.15, wheelbaseM * 0.38));
    const consoleWidth = 0.28;

    // Common PBR Materials
    const leatherMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(materials.primaryColorHex),
      roughness: 0.68,
      metalness: 0.05,
      clearcoat: 0.12,
      sheen: 0.3,
      sheenColor: new THREE.Color(materials.primaryColorHex).multiplyScalar(1.2),
      envMapIntensity: 0.4,
    });

    const carbonMat = new THREE.MeshPhysicalMaterial({
      color: 0x090c13,
      roughness: 0.18,
      metalness: 0.4,
      clearcoat: 0.9,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.3,
    });

    const polishedSteelMat = new THREE.MeshStandardMaterial({
      color: 0xe5e7eb,
      roughness: 0.10,
      metalness: 0.98,
      envMapIntensity: 2.0,
    });

    const aluMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      roughness: 0.25,
      metalness: 0.94,
      envMapIntensity: 1.4,
    });

    const crystalGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.02,
      metalness: 0.1,
      transmission: 0.88,
      ior: 1.58,
      thickness: 0.05,
      clearcoat: 1.0,
      envMapIntensity: 2.2,
    });

    const ambientLightMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(ambientColorHex),
    });

    // 1. Base Tunnel Structure (Runs along car centerline)
    const baseGeo = new THREE.BoxGeometry(consoleLength, 0.22, consoleWidth);
    const baseMesh = new THREE.Mesh(baseGeo, style === 'track_carbon_stack' ? carbonMat : leatherMat);
    baseMesh.position.set(-consoleLength * 0.45, 0.11, 0);
    group.add(baseMesh);

    // 2. Center Tunnel Ambient Fiber-Optic Halo
    const haloGeo = new THREE.BoxGeometry(consoleLength * 0.96, 0.006, consoleWidth * 1.04);
    const haloMesh = new THREE.Mesh(haloGeo, ambientLightMat);
    haloMesh.position.set(-consoleLength * 0.45, 0.225, 0);
    group.add(haloMesh);

    // 3. Rear Armrest Cushion
    const armrestGeo = new THREE.BoxGeometry(consoleLength * 0.38, 0.08, consoleWidth * 0.92);
    const armrestMesh = new THREE.Mesh(armrestGeo, leatherMat);
    armrestMesh.position.set(-consoleLength * 0.68, 0.26, 0);
    group.add(armrestMesh);

    // 4. Style-Specific Shifter & Switchgear Control Deck
    switch (style) {
      case 'gated_manual_h_pattern':
        this.buildGatedManual(group, polishedSteelMat, aluMat, leatherMat);
        break;

      case 'sequential_dog_box':
        this.buildSequentialDogBox(group, aluMat, carbonMat);
        break;

      case 'crystal_rotary_dial':
        this.buildCrystalRotary(group, crystalGlassMat, aluMat, ambientLightMat);
        break;

      case 'aircraft_start_flap':
        this.buildAircraftStartFlap(group, aluMat, ambientLightMat);
        break;

      case 'track_carbon_stack':
      default:
        this.buildTrackCarbonStack(group, carbonMat, aluMat);
        break;
    }

    return group;
  }

  // ==========================================================================
  // 1. OPEN-GATED MANUAL SHIFTER
  // ==========================================================================
  private static buildGatedManual(
    root: THREE.Group,
    steelMat: THREE.Material,
    aluMat: THREE.Material,
    leatherMat: THREE.Material
  ): void {
    // Polished Stainless Steel Gate Plate
    const gatePlateGeo = new THREE.BoxGeometry(0.18, 0.012, 0.16);
    const gatePlate = new THREE.Mesh(gatePlateGeo, steelMat);
    gatePlate.position.set(-0.20, 0.23, 0);
    root.add(gatePlate);

    // Slotted H-Pattern Gate Grooves
    const slotGeo = new THREE.BoxGeometry(0.12, 0.016, 0.012);
    const slot1 = new THREE.Mesh(slotGeo, new THREE.MeshBasicMaterial({ color: 0x05070a }));
    slot1.position.set(-0.20, 0.235, -0.04);
    const slot2 = new THREE.Mesh(slotGeo, new THREE.MeshBasicMaterial({ color: 0x05070a }));
    slot2.position.set(-0.20, 0.235, 0);
    const slot3 = new THREE.Mesh(slotGeo, new THREE.MeshBasicMaterial({ color: 0x05070a }));
    slot3.position.set(-0.20, 0.235, 0.04);
    root.add(slot1, slot2, slot3);

    // Shift Lever Stem
    const leverGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.16, 16);
    const lever = new THREE.Mesh(leverGeo, steelMat);
    lever.position.set(-0.20, 0.31, 0);
    root.add(lever);

    // Spherical Billet Aluminum Shift Knob
    const knobGeo = new THREE.SphereGeometry(0.024, 24, 24);
    const knob = new THREE.Mesh(knobGeo, aluMat);
    knob.position.set(-0.20, 0.39, 0);
    root.add(knob);

    // Dual Integrated Cupholders with Chrome Rim
    for (const z of [-0.06, 0.06]) {
      const cupGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.045, 24);
      const cup = new THREE.Mesh(cupGeo, new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 }));
      cup.position.set(-0.36, 0.21, z);
      root.add(cup);

      const cupRimGeo = new THREE.TorusGeometry(0.038, 0.004, 12, 24);
      const cupRim = new THREE.Mesh(cupRimGeo, steelMat);
      cupRim.position.set(-0.36, 0.23, z);
      cupRim.rotation.x = Math.PI / 2;
      root.add(cupRim);
    }
  }

  // ==========================================================================
  // 2. SEQUENTIAL DOG-BOX RACE LEVER
  // ==========================================================================
  private static buildSequentialDogBox(
    root: THREE.Group,
    aluMat: THREE.Material,
    carbonMat: THREE.Material
  ): void {
    // Tall Billet Sequential Shift Tower
    const towerGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const tower = new THREE.Mesh(towerGeo, carbonMat);
    tower.position.set(-0.20, 0.26, 0);
    root.add(tower);

    // Long Lever Shaft
    const leverGeo = new THREE.CylinderGeometry(0.010, 0.012, 0.32, 16);
    const lever = new THREE.Mesh(leverGeo, aluMat);
    lever.position.set(-0.20, 0.42, 0);
    lever.rotation.z = -0.10; // Slightly angled toward driver
    root.add(lever);

    // Reverse Lockout Collar
    const collarGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.035, 16);
    const collarMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.9, roughness: 0.2 });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.position.set(-0.20, 0.46, 0);
    root.add(collar);

    // Knurled Billet Grip Handle
    const gripGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.09, 20);
    const grip = new THREE.Mesh(gripGeo, aluMat);
    grip.position.set(-0.21, 0.54, 0);
    root.add(grip);
  }

  // ==========================================================================
  // 3. CRYSTAL ROTARY GEAR SELECTOR & WIRELESS DOCKS
  // ==========================================================================
  private static buildCrystalRotary(
    root: THREE.Group,
    crystalMat: THREE.Material,
    aluMat: THREE.Material,
    ambientMat: THREE.Material
  ): void {
    // Faceted Crystal Rotary Shifter Dial
    const dialGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.028, 12);
    const dial = new THREE.Mesh(dialGeo, crystalMat);
    dial.position.set(-0.20, 0.24, 0);
    root.add(dial);

    // Illuminated Center P (Park) Push-Button
    const pBtnGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.030, 16);
    const pBtn = new THREE.Mesh(pBtnGeo, aluMat);
    pBtn.position.set(-0.20, 0.245, 0);
    root.add(pBtn);

    // Dual 50W Fast Wireless Phone Charging Pads
    const padGeo = new THREE.BoxGeometry(0.18, 0.008, 0.10);
    const padMat = new THREE.MeshStandardMaterial({ color: 0x181e29, roughness: 0.9 });
    const padL = new THREE.Mesh(padGeo, padMat);
    padL.position.set(-0.06, 0.23, -0.06);
    const padR = new THREE.Mesh(padGeo, padMat);
    padR.position.set(-0.06, 0.23, 0.06);
    root.add(padL, padR);

    // Subtle Cyan LED Charging Indicators
    const ledGeo = new THREE.BoxGeometry(0.014, 0.004, 0.014);
    const ledL = new THREE.Mesh(ledGeo, ambientMat);
    ledL.position.set(-0.06, 0.235, -0.06);
    const ledR = new THREE.Mesh(ledGeo, ambientMat);
    ledR.position.set(-0.06, 0.235, 0.06);
    root.add(ledL, ledR);
  }

  // ==========================================================================
  // 4. FIGHTER-JET AIRCRAFT START FLAP & TOGGLE MATRIX
  // ==========================================================================
  private static buildAircraftStartFlap(
    root: THREE.Group,
    aluMat: THREE.Material,
    ambientMat: THREE.Material
  ): void {
    // Red Anodized Flip-Up Safety Guard Flap
    const flapGeo = new THREE.BoxGeometry(0.06, 0.012, 0.05);
    const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.9, roughness: 0.2 });
    const flap = new THREE.Mesh(flapGeo, redMat);
    flap.position.set(-0.16, 0.26, 0);
    flap.rotation.z = -Math.PI / 4; // Flipped open
    root.add(flap);

    // Illuminated Engine Start/Stop Button
    const btnGeo = new THREE.CylinderGeometry(0.020, 0.020, 0.018, 24);
    const btn = new THREE.Mesh(btnGeo, ambientMat);
    btn.position.set(-0.16, 0.23, 0);
    root.add(btn);

    // Drive Mode Anodized Toggle Bank (ESC OFF, LAUNCH CONTROL, AERO DRS)
    for (let i = 0; i < 3; i++) {
      const togGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.024, 12);
      const tog = new THREE.Mesh(togGeo, aluMat);
      tog.position.set(-0.28, 0.24, -0.06 + i * 0.06);
      tog.rotation.x = Math.PI / 3;
      root.add(tog);
    }
  }

  // ==========================================================================
  // 5. TRACK COMPETITION CARBON STACK WITH FIRE SUPPRESSION
  // ==========================================================================
  private static buildTrackCarbonStack(
    root: THREE.Group,
    carbonMat: THREE.Material,
    aluMat: THREE.Material
  ): void {
    // Plumbed Aluminum Fire Extinguisher Bottle (Secured in tunnel cradle)
    const bottleGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.26, 20);
    const bottleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8, roughness: 0.3 });
    const bottle = new THREE.Mesh(bottleGeo, bottleMat);
    bottle.position.set(-0.48, 0.16, 0);
    bottle.rotation.x = Math.PI / 2;
    root.add(bottle);

    // Quick-Release Securing Clamps
    const clampGeo = new THREE.TorusGeometry(0.046, 0.006, 12, 24);
    const clamp1 = new THREE.Mesh(clampGeo, aluMat);
    clamp1.position.set(-0.48, 0.16, -0.06);
    clamp1.rotation.y = Math.PI / 2;
    const clamp2 = new THREE.Mesh(clampGeo, aluMat);
    clamp2.position.set(-0.48, 0.16, 0.06);
    clamp2.rotation.y = Math.PI / 2;
    root.add(clamp1, clamp2);

    // Brake Bias Dial & Master Electrical Cutoff Knob
    const biasDialGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.020, 16);
    const biasDial = new THREE.Mesh(biasDialGeo, aluMat);
    biasDial.position.set(-0.22, 0.24, -0.05);
    root.add(biasDial);

    const killKnobGeo = new THREE.BoxGeometry(0.038, 0.024, 0.038);
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.5, roughness: 0.4 });
    const killKnob = new THREE.Mesh(killKnobGeo, yellowMat);
    killKnob.position.set(-0.22, 0.24, 0.05);
    root.add(killKnob);
  }
}
