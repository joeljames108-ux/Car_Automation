// ============================================================================
// HYBRID KERS, RACING CLUTCH, SWAN-NECK PYLONS & COCKPIT CONTROLS MESH
// ============================================================================
// Extreme detail Le Mans Hypercar / GT3 mechanical and aerodynamic assemblies:
// 1. Front-Axle Hybrid MGU-K & Inverter: Twin electric motors, SiC traction
//    inverter with cooling fins, shielded orange high-voltage copper busbars.
// 2. Twin-Plate Sintered Metallic Clutch & Flywheel: Lightweight flywheel with
//    120-tooth starter ring gear, multi-disc clutch pack, starter motor solenoid.
// 3. CNC Swan-Neck Wing Pylons: Skeletal milled aluminum pylons with lightening
//    pockets, double-shear pitch adjustment plates with 5 angle-of-attack holes.
// 4. Bumper Air Curtains & Caliper Bleeder Screws: High-velocity wheel wake air
//    curtain ducts, dual brass bleeder screws, rubber dust caps, and banjo bolts.
// 5. FIA Roll Cage Impact Padding & Rotary Dials: Energy-absorbing foam padding
//    with Velcro seams, center console 12-position rotary switches (ABS/TC/MAP).
// ============================================================================

import * as THREE from 'three';

export interface HybridClutchMaterials {
  carbonMat: THREE.Material;
  chromeMat: THREE.Material;
  anodizedRedMat: THREE.Material;
  anodizedBlueMat: THREE.Material;
  aluminumMat: THREE.Material;
  titaniumMat: THREE.Material;
  brassMat: THREE.Material;
  orangeHvMat: THREE.Material;
  foamMat: THREE.Material;
}

export function createDefaultHybridClutchMaterials(): HybridClutchMaterials {
  return {
    carbonMat: new THREE.MeshPhysicalMaterial({
      color: 0x090d16,
      roughness: 0.18,
      metalness: 0.88,
      clearcoat: 0.95,
      clearcoatRoughness: 0.03,
      name: 'Carbon_Twill_Structure',
    }),
    chromeMat: new THREE.MeshPhysicalMaterial({
      color: 0xf1f5f9,
      roughness: 0.04,
      metalness: 0.98,
      clearcoat: 1.0,
      name: 'Mirror_Polished_Metal',
    }),
    anodizedRedMat: new THREE.MeshPhysicalMaterial({
      color: 0xdc2626,
      roughness: 0.20,
      metalness: 0.85,
      clearcoat: 0.8,
      name: 'Anodized_Red_Hardware',
    }),
    anodizedBlueMat: new THREE.MeshPhysicalMaterial({
      color: 0x2563eb,
      roughness: 0.20,
      metalness: 0.85,
      clearcoat: 0.8,
      name: 'Anodized_Blue_Hardware',
    }),
    aluminumMat: new THREE.MeshStandardMaterial({
      color: 0xc8d0db,
      roughness: 0.30,
      metalness: 0.90,
      name: 'Billet_CNC_Aluminum',
    }),
    titaniumMat: new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.35,
      metalness: 0.80,
      name: 'Titanium_Grade5',
    }),
    brassMat: new THREE.MeshPhysicalMaterial({
      color: 0xd97706,
      roughness: 0.28,
      metalness: 0.88,
      name: 'Billet_Brass_Fitting',
    }),
    orangeHvMat: new THREE.MeshStandardMaterial({
      color: 0xf97316, // High-voltage orange
      roughness: 0.40,
      metalness: 0.20,
      name: 'High_Voltage_Busbar_Orange',
    }),
    foamMat: new THREE.MeshStandardMaterial({
      color: 0x1c1917, // SFI/FIA roll cage padding
      roughness: 0.95,
      metalness: 0.05,
      name: 'FIA_Roll_Cage_Foam_Padding',
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. FRONT-AXLE HYBRID MGU-K & SIC INVERTER SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
export function generateHybridKersAndInverterSystemMesh(
  mats: HybridClutchMaterials = createDefaultHybridClutchMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Hybrid_KERS_Inverter_Assembly';
  group.position.set(0, 0.30, -1.55);

  // Twin Electric Motor-Generator Units (MGU-K Left & Right on Front Axle)
  for (const sx of [-0.28, 0.28]) {
    const motorGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.22, 20);
    motorGeo.rotateZ(Math.PI / 2);
    const motor = new THREE.Mesh(motorGeo, mats.aluminumMat);
    motor.position.set(sx, 0, 0);
    group.add(motor);

    // Motor Endbell Bearing Caps
    const capGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.03, 16);
    capGeo.rotateZ(Math.PI / 2);
    const cap = new THREE.Mesh(capGeo, mats.anodizedBlueMat);
    cap.position.set(sx < 0 ? sx - 0.12 : sx + 0.12, 0, 0);
    group.add(cap);
  }

  // Silicon Carbide (SiC) Power Traction Inverter Housing
  const inverterGeo = new THREE.BoxGeometry(0.42, 0.14, 0.28);
  const inverter = new THREE.Mesh(inverterGeo, mats.aluminumMat);
  inverter.position.set(0, 0.16, -0.05);
  group.add(inverter);

  // Heat Dissipation Cooling Fins on Inverter Lid
  for (let f = -4; f <= 4; f++) {
    const finGeo = new THREE.BoxGeometry(0.008, 0.035, 0.26);
    const fin = new THREE.Mesh(finGeo, mats.aluminumMat);
    fin.position.set(f * 0.04, 0.24, -0.05);
    group.add(fin);
  }

  // High-Voltage Shielded Orange Copper Busbars (6 conduits feeding motors)
  for (const sx of [-1, 1]) {
    for (let p = 0; p < 3; p++) {
      const cableCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(sx * (0.06 + p * 0.03), 0.16, 0.09),
        new THREE.Vector3(sx * 0.18, 0.10, 0.06),
        new THREE.Vector3(sx * 0.26, 0.02, 0.0),
      ]);
      const cableGeo = new THREE.TubeGeometry(cableCurve, 10, 0.010, 8);
      const cable = new THREE.Mesh(cableGeo, mats.orangeHvMat);
      group.add(cable);
    }
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TWIN-PLATE SINTERED METALLIC CLUTCH & FLYWHEEL
// ─────────────────────────────────────────────────────────────────────────────
export function generateRacingClutchFlywheelAndStarterMesh(
  mats: HybridClutchMaterials = createDefaultHybridClutchMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Racing_Clutch_Flywheel_Assembly';
  group.position.set(0, 0.35, 0.38);

  // 1. Lightweight Billet Aluminum Flywheel
  const flywheelGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.025, 32);
  flywheelGeo.rotateX(Math.PI / 2);
  const flywheel = new THREE.Mesh(flywheelGeo, mats.aluminumMat);
  group.add(flywheel);

  // 2. Perimeter Starter Ring Gear Teeth
  const ringGeo = new THREE.TorusGeometry(0.162, 0.008, 8, 48);
  const ring = new THREE.Mesh(ringGeo, mats.titaniumMat);
  group.add(ring);

  // 3. Multi-Plate Sintered Metallic Clutch Pack Cover Housing
  const clutchCoverGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.06, 24);
  clutchCoverGeo.rotateX(Math.PI / 2);
  const clutchCover = new THREE.Mesh(clutchCoverGeo, mats.anodizedRedMat);
  clutchCover.position.set(0, 0, 0.045);
  group.add(clutchCover);

  // Diaphragm Belleville Spring Fingers
  for (let s = 0; s < 12; s++) {
    const angle = (s / 12) * Math.PI * 2;
    const springGeo = new THREE.BoxGeometry(0.008, 0.045, 0.004);
    const spring = new THREE.Mesh(springGeo, mats.chromeMat);
    spring.position.set(Math.cos(angle) * 0.06, Math.sin(angle) * 0.06, 0.076);
    spring.rotation.z = angle;
    group.add(spring);
  }

  // 4. High-Torque Starter Motor with Solenoid Cylinder
  const starterGroup = new THREE.Group();
  starterGroup.position.set(-0.16, -0.06, -0.05);

  const motorGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.14, 16);
  motorGeo.rotateX(Math.PI / 2);
  const motor = new THREE.Mesh(motorGeo, mats.aluminumMat);
  starterGroup.add(motor);

  const solGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.09, 12);
  solGeo.rotateX(Math.PI / 2);
  const sol = new THREE.Mesh(solGeo, mats.chromeMat);
  sol.position.set(0, 0.045, 0);
  starterGroup.add(sol);

  group.add(starterGroup);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. CNC SWAN-NECK WING PYLONS & PITCH ADJUSTMENT PLATES
// ─────────────────────────────────────────────────────────────────────────────
export function generateSwanNeckWingPylonsAndPitchPlatesMesh(
  mats: HybridClutchMaterials = createDefaultHybridClutchMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Swan_Neck_Pylons_Pitch_Plates_Assembly';
  group.position.set(0, 0.85, 2.05);

  // Left & Right CNC Swan-Neck Upright Pylons
  for (const sx of [-0.35, 0.35]) {
    // Elegant Gooseneck Curved Pylon Arm (top-mounted)
    const pylonCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx, -0.15, -0.18),
      new THREE.Vector3(sx, 0.18, -0.05),
      new THREE.Vector3(sx, 0.38, 0.12),
      new THREE.Vector3(sx, 0.32, 0.22), // Drops onto top of airfoil
    ]);
    const pylonGeo = new THREE.TubeGeometry(pylonCurve, 16, 0.016, 6);
    pylonGeo.scale(0.5, 2.2, 1.0);
    const pylon = new THREE.Mesh(pylonGeo, mats.aluminumMat);
    group.add(pylon);

    // Lightening Pocket Cutouts (3 recessed oval pockets)
    for (let p = 0; p < 3; p++) {
      const pocketGeo = new THREE.BoxGeometry(0.012, 0.06, 0.035);
      const pocket = new THREE.Mesh(pocketGeo, mats.carbonMat);
      pocket.position.set(sx, 0.02 + p * 0.11, 0.02 + p * 0.06);
      group.add(pocket);
    }

    // Double-Shear Angle-of-Attack Pitch Adjustment Plate
    const plateGeo = new THREE.BoxGeometry(0.012, 0.075, 0.08);
    const plate = new THREE.Mesh(plateGeo, mats.anodizedBlueMat);
    plate.position.set(sx, 0.30, 0.22);
    group.add(plate);

    // 5 Pitch Adjustment Pin Holes
    for (let h = -2; h <= 2; h++) {
      const pinGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.016, 8);
      pinGeo.rotateZ(Math.PI / 2);
      const pin = new THREE.Mesh(pinGeo, mats.chromeMat);
      pin.position.set(sx, 0.30 + h * 0.012, 0.22 + h * 0.008);
      group.add(pin);
    }
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. BUMPER WHEEL WAKE AIR CURTAINS & CALIPER BLEEDER SCREWS
// ─────────────────────────────────────────────────────────────────────────────
export function generateBumperAirCurtainsAndCaliperBleedersMesh(
  mats: HybridClutchMaterials = createDefaultHybridClutchMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Air_Curtains_Caliper_Bleeders_Assembly';

  // 1. Front Bumper Outboard Wheel Wake Air Curtains (Channels air around tires)
  for (const sx of [-1, 1]) {
    const curtainShape = new THREE.Shape();
    curtainShape.moveTo(0, 0);
    curtainShape.lineTo(0.04, 0.18);
    curtainShape.lineTo(0, 0.22);
    curtainShape.lineTo(-0.04, 0.04);
    curtainShape.closePath();

    const curtainGeo = new THREE.ExtrudeGeometry(curtainShape, {
      depth: 0.35,
      bevelEnabled: false,
    });
    const curtain = new THREE.Mesh(curtainGeo, mats.carbonMat);
    curtain.position.set(sx * 0.88, 0.22, -2.15);
    curtain.rotation.y = sx < 0 ? -0.15 : 0.15;
    group.add(curtain);
  }

  // 2. Caliper Dual Brass Bleeder Screws with Rubber Dust Caps (All 4 calipers)
  const caliperCorners = [
    { x: -0.84, z: -1.35, isLeft: true },
    { x: 0.84, z: -1.35, isLeft: false },
    { x: -0.86, z: 1.35, isLeft: true },
    { x: 0.86, z: 1.35, isLeft: false },
  ];

  for (const c of caliperCorners) {
    const cornerGroup = new THREE.Group();
    cornerGroup.position.set(c.x, 0.34, c.z);

    // Twin Bleeder Screws on Caliper Body Top
    for (const bz of [-0.06, 0.06]) {
      const bleederGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.025, 8);
      const bleeder = new THREE.Mesh(bleederGeo, mats.brassMat);
      bleeder.position.set(c.isLeft ? 0.05 : -0.05, 0.16, bz);
      cornerGroup.add(bleeder);

      // Rubber Dust Cap
      const capGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.010, 8);
      const cap = new THREE.Mesh(capGeo, mats.foamMat);
      cap.position.set(c.isLeft ? 0.05 : -0.05, 0.175, bz);
      cornerGroup.add(cap);
    }

    // Banjo Bolt & Fluid Line Connector
    const banjoGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.014, 12);
    banjoGeo.rotateZ(Math.PI / 2);
    const banjo = new THREE.Mesh(banjoGeo, mats.anodizedBlueMat);
    banjo.position.set(c.isLeft ? 0.05 : -0.05, 0.08, -0.09);
    cornerGroup.add(banjo);

    group.add(cornerGroup);
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. FIA ROLL CAGE IMPACT PADDING & CONSOLE ROTARY SWITCHES
// ─────────────────────────────────────────────────────────────────────────────
export function generateRollCagePaddingAndConsoleDialsMesh(
  mats: HybridClutchMaterials = createDefaultHybridClutchMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Roll_Cage_Padding_Console_Dials_Assembly';

  // 1. SFI/FIA High-Density Roll Cage Energy-Absorbing Foam Padding Sleeves
  // Padded along the driver's upper halo and A-pillar impact zones
  for (const pos of [
    { x: -0.42, y: 0.95, z: -0.05, rx: 0, rz: 0 },       // Upper halo bar
    { x: -0.44, y: 0.82, z: -0.35, rx: 0.65, rz: 0.15 }, // Front A-pillar tube
  ]) {
    const padGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.42, 16);
    const pad = new THREE.Mesh(padGeo, mats.foamMat);
    pad.position.set(pos.x, pos.y, pos.z);
    pad.rotation.x = pos.rx;
    pad.rotation.z = pos.rz;
    group.add(pad);

    // Velcro Wrap Seam Strip
    const seamGeo = new THREE.BoxGeometry(0.006, 0.40, 0.012);
    const seam = new THREE.Mesh(seamGeo, mats.carbonMat);
    seam.position.set(pos.x + 0.03, pos.y, pos.z);
    seam.rotation.x = pos.rx;
    seam.rotation.z = pos.rz;
    group.add(seam);
  }

  // 2. Center Console 12-Position Motorsport Rotary Switches (ABS, TC, MAP)
  const dialGroup = new THREE.Group();
  dialGroup.position.set(0, 0.46, -0.32);
  dialGroup.rotation.x = -0.42;

  const dialColors = [mats.anodizedBlueMat, mats.anodizedRedMat, mats.aluminumMat];
  for (let d = -1; d <= 1; d++) {
    // Knurled Rotary Dial Knob
    const dialGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.022, 16);
    const dial = new THREE.Mesh(dialGeo, dialColors[d + 1]);
    dial.position.set(d * 0.055, 0.02, 0);
    dialGroup.add(dial);

    // Indicator Pointer Needle
    const needleGeo = new THREE.BoxGeometry(0.003, 0.014, 0.014);
    const needle = new THREE.Mesh(needleGeo, mats.chromeMat);
    needle.position.set(d * 0.055, 0.032, 0.008);
    dialGroup.add(needle);
  }

  group.add(dialGroup);

  return group;
}
