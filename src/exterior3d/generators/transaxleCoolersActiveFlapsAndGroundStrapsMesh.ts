// ============================================================================
// TRANSAXLE COOLERS, ROTOR INTERNAL VANES, CENTER NET & CHASSIS GROUND STRAPS
// ============================================================================
// Precision Le Mans Hypercar & GT3 powertrain, chassis & cockpit assemblies:
// 1. Transaxle Dual Coolers & Carbon Scoops: Twin differential oil radiators,
//    underfloor carbon scoop ducts, AN-10 stainless lines with anodized fittings.
// 2. Brake Rotor Internal Vanes & Billet Hats: 36 directional curved vanes per
//    rotor disc, engraved center hats with lock-wire holes on all 4 corners.
// 3. Cockpit Center Safety Net & Hydration Quick-Release: FIA Kevlar triangle
//    driver containment net, ratchet buckle, steering column drink bite valve.
// 4. Active Splitter Flap Stepper Motors & Linkages: High-torque digital servo
//    actuators in front ducts, carbon pushrods, titanium variable aero flaps.
// 5. Chassis Ground Straps & Wheel Speed Reluctor Rings: Braided copper ground
//    straps, 48-tooth CNC reluctor rings, Hall-effect magnetic pickup sensors.
// ============================================================================

import * as THREE from 'three';

export interface PowertrainChassisMaterials {
  carbonMat: THREE.Material;
  chromeMat: THREE.Material;
  anodizedRedMat: THREE.Material;
  anodizedBlueMat: THREE.Material;
  aluminumMat: THREE.Material;
  titaniumMat: THREE.Material;
  copperBraidMat: THREE.Material;
  netWebbingMat: THREE.Material;
  coolerCoreMat: THREE.Material;
}

export function createDefaultPowertrainChassisMaterials(): PowertrainChassisMaterials {
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
    copperBraidMat: new THREE.MeshStandardMaterial({
      color: 0xd97706, // Braided tinned copper strap
      roughness: 0.65,
      metalness: 0.85,
      name: 'Braided_Copper_Ground',
    }),
    netWebbingMat: new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Heavy-duty Kevlar net
      roughness: 0.88,
      metalness: 0.05,
      name: 'FIA_Center_Net_Kevlar',
    }),
    coolerCoreMat: new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.40,
      metalness: 0.70,
      wireframe: true,
      name: 'Oil_Cooler_Finned_Core',
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. TRANSAXLE DUAL OIL COOLERS & UNDERFLOOR CARBON SCOOPS
// ─────────────────────────────────────────────────────────────────────────────
export function generateTransaxleDualCoolersAndScoopsMesh(
  mats: PowertrainChassisMaterials = createDefaultPowertrainChassisMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Transaxle_Coolers_Scoops_Assembly';

  // Left & Right Differential / Transaxle Oil Cooler Packs
  for (const sx of [-0.34, 0.34]) {
    const coolerGroup = new THREE.Group();
    coolerGroup.position.set(sx, 0.32, 1.88);

    // 1. Finned Oil Cooler Radiator Matrix
    const coreGeo = new THREE.BoxGeometry(0.18, 0.09, 0.045);
    const core = new THREE.Mesh(coreGeo, mats.coolerCoreMat);
    coolerGroup.add(core);

    // End Tanks with AN-10 Union Fittings
    for (const ex of [-0.10, 0.10]) {
      const tankGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.09, 12);
      const tank = new THREE.Mesh(tankGeo, mats.aluminumMat);
      tank.position.set(ex, 0, 0);
      coolerGroup.add(tank);

      // AN-10 Fitting Nut
      const nutGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.016, 6);
      nutGeo.rotateX(Math.PI / 2);
      const nut = new THREE.Mesh(nutGeo, ex < 0 ? mats.anodizedRedMat : mats.anodizedBlueMat);
      nut.position.set(ex, 0.035, -0.025);
      coolerGroup.add(nut);
    }

    // 2. Underfloor Carbon Intake Air Scoop Duct
    const scoopGeo = new THREE.BoxGeometry(0.20, 0.04, 0.14);
    const scoop = new THREE.Mesh(scoopGeo, mats.carbonMat);
    scoop.position.set(0, -0.05, -0.06);
    scoop.rotation.x = 0.22;
    coolerGroup.add(scoop);

    group.add(coolerGroup);
  }

  // Braided Stainless Steel Transaxle Cross-Lines
  const lineCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.24, 0.35, 1.86),
    new THREE.Vector3(0, 0.38, 1.78),
    new THREE.Vector3(0.24, 0.35, 1.86),
  ]);
  const lineGeo = new THREE.TubeGeometry(lineCurve, 12, 0.006, 8);
  const line = new THREE.Mesh(lineGeo, mats.titaniumMat);
  group.add(line);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. BRAKE ROTOR INTERNAL CURVED COOLING VANES & BILLET HATS
// ─────────────────────────────────────────────────────────────────────────────
export function generateBrakeRotorInternalVanesAndHatsMesh(
  mats: PowertrainChassisMaterials = createDefaultPowertrainChassisMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Rotor_Vanes_Billet_Hats_Assembly';

  const wheelPositions = [
    { x: -0.84, z: -1.35, isLeft: true },
    { x: 0.84, z: -1.35, isLeft: false },
    { x: -0.86, z: 1.35, isLeft: true },
    { x: 0.86, z: 1.35, isLeft: false },
  ];

  for (const w of wheelPositions) {
    const rotorGroup = new THREE.Group();
    rotorGroup.position.set(w.x, 0.34, w.z);

    // 1. 24 Internal Directional Curved Cooling Vanes inside Disc Rotor Core
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const vaneGeo = new THREE.BoxGeometry(0.003, 0.024, 0.055);
      const vane = new THREE.Mesh(vaneGeo, mats.titaniumMat);
      const r = 0.125;
      vane.position.set(
        w.isLeft ? 0.025 : -0.025,
        Math.sin(angle) * r,
        Math.cos(angle) * r
      );
      vane.rotation.x = angle + 0.28; // Curved vane camber
      rotorGroup.add(vane);
    }

    // 2. Billet Aluminum Rotor Hat with Safety Lock-Wire Holes
    const hatGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.028, 24);
    hatGeo.rotateZ(Math.PI / 2);
    const hat = new THREE.Mesh(hatGeo, mats.aluminumMat);
    hat.position.set(w.isLeft ? 0.015 : -0.015, 0, 0);
    rotorGroup.add(hat);

    // 6 Safety Lock-Wire Eyelets on Hat Periphery
    for (let j = 0; j < 6; j++) {
      const eyeAngle = (j / 6) * Math.PI * 2;
      const eyeGeo = new THREE.TorusGeometry(0.003, 0.001, 6, 8);
      eyeGeo.rotateY(Math.PI / 2);
      const eye = new THREE.Mesh(eyeGeo, mats.chromeMat);
      eye.position.set(
        w.isLeft ? 0.03 : -0.03,
        Math.sin(eyeAngle) * 0.065,
        Math.cos(eyeAngle) * 0.065
      );
      rotorGroup.add(eye);
    }

    group.add(rotorGroup);
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. COCKPIT FIA SAFETY CENTER NET & HYDRATION QUICK-DISCONNECT
// ─────────────────────────────────────────────────────────────────────────────
export function generateCockpitCenterNetAndHydrationMesh(
  mats: PowertrainChassisMaterials = createDefaultPowertrainChassisMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Cockpit_Center_Net_Hydration_Assembly';

  // 1. Triangular FIA Safety Driver Containment Net (Between Seats)
  const netGroup = new THREE.Group();
  netGroup.position.set(0, 0.65, 0.10);

  // Triangular Webbing Outline
  const netShape = new THREE.Shape();
  netShape.moveTo(0, 0.32);
  netShape.lineTo(0.55, 0.02);
  netShape.lineTo(0, -0.22);
  netShape.closePath();

  const netGeo = new THREE.ExtrudeGeometry(netShape, {
    depth: 0.006,
    bevelEnabled: false,
  });
  netGeo.rotateY(Math.PI / 2);
  const net = new THREE.Mesh(netGeo, mats.netWebbingMat);
  netGroup.add(net);

  // Quick-Release Ratchet Buckle & Red Tensioner Strap
  const buckleGeo = new THREE.BoxGeometry(0.018, 0.045, 0.035);
  const buckle = new THREE.Mesh(buckleGeo, mats.aluminumMat);
  buckle.position.set(0, -0.20, 0);
  netGroup.add(buckle);

  const latchGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.025, 8);
  latchGeo.rotateZ(Math.PI / 2);
  const latch = new THREE.Mesh(latchGeo, mats.anodizedRedMat);
  latch.position.set(0, -0.20, 0.018);
  netGroup.add(latch);

  group.add(netGroup);

  // 2. Steering Column Hydration Bite Valve with 90° Swivel Coupler
  const valveGroup = new THREE.Group();
  valveGroup.position.set(-0.35, 0.68, -0.42);

  const couplerGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.022, 10);
  const coupler = new THREE.Mesh(couplerGeo, mats.anodizedRedMat);
  valveGroup.add(coupler);

  const biteValveGeo = new THREE.CylinderGeometry(0.005, 0.008, 0.018, 8);
  biteValveGeo.rotateX(Math.PI / 2);
  const biteValve = new THREE.Mesh(biteValveGeo, mats.aluminumMat);
  biteValve.position.set(0, 0.012, 0.012);
  valveGroup.add(biteValve);

  group.add(valveGroup);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ACTIVE SPLITTER FLAP STEPPER MOTORS & CARBON LINKAGES
// ─────────────────────────────────────────────────────────────────────────────
export function generateActiveSplitterFlapMotorsMesh(
  mats: PowertrainChassisMaterials = createDefaultPowertrainChassisMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Active_Splitter_Motors_Assembly';

  // Left & Right Front Splitter Internal Tunnel Actuators
  for (const sx of [-0.42, 0.42]) {
    const motorGroup = new THREE.Group();
    motorGroup.position.set(sx, 0.18, -1.82);

    // 1. Digital Stepper Motor Billet Housing
    const motorGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.065, 16);
    motorGeo.rotateZ(Math.PI / 2);
    const motor = new THREE.Mesh(motorGeo, mats.aluminumMat);
    motorGroup.add(motor);

    // Stepper Encoder Rear Cap
    const capGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.015, 12);
    capGeo.rotateZ(Math.PI / 2);
    const cap = new THREE.Mesh(capGeo, mats.anodizedBlueMat);
    cap.position.set(sx < 0 ? -0.04 : 0.04, 0, 0);
    motorGroup.add(cap);

    // 2. Carbon Fiber Pushrod Linkage with Titanium Clevises
    const pushrodGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.09, 8);
    pushrodGeo.rotateX(0.45);
    const pushrod = new THREE.Mesh(pushrodGeo, mats.carbonMat);
    pushrod.position.set(0, -0.03, -0.04);
    motorGroup.add(pushrod);

    const clevisGeo = new THREE.BoxGeometry(0.012, 0.012, 0.02);
    const clevis = new THREE.Mesh(clevisGeo, mats.titaniumMat);
    clevis.position.set(0, -0.065, -0.075);
    motorGroup.add(clevis);

    group.add(motorGroup);
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. CHASSIS BRAIDED GROUND STRAPS & 48-TOOTH RELUCTOR RINGS
// ─────────────────────────────────────────────────────────────────────────────
export function generateChassisGroundStrapsAndReluctorRingsMesh(
  mats: PowertrainChassisMaterials = createDefaultPowertrainChassisMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Ground_Straps_Reluctor_Rings_Assembly';

  // 1. Engine Block to Chassis Monocoque Braided Copper Ground Straps
  for (const sx of [-0.28, 0.28]) {
    const strapCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx, 0.32, 0.55),
      new THREE.Vector3(sx * 1.25, 0.28, 0.68),
      new THREE.Vector3(sx * 1.10, 0.24, 0.82),
    ]);
    const strapGeo = new THREE.TubeGeometry(strapCurve, 10, 0.005, 6);
    const strap = new THREE.Mesh(strapGeo, mats.copperBraidMat);
    group.add(strap);

    // Tinned Copper Terminal Lugs on Ends
    for (const p of [new THREE.Vector3(sx, 0.32, 0.55), new THREE.Vector3(sx * 1.10, 0.24, 0.82)]) {
      const lugGeo = new THREE.BoxGeometry(0.016, 0.004, 0.024);
      const lug = new THREE.Mesh(lugGeo, mats.chromeMat);
      lug.position.copy(p);
      group.add(lug);
    }
  }

  // 2. 48-Tooth Wheel Speed Reluctor Rings & Hall-Effect Magnetic Pickups (All 4 Corners)
  const hubs = [
    { x: -0.84, z: -1.35, isLeft: true },
    { x: 0.84, z: -1.35, isLeft: false },
    { x: -0.86, z: 1.35, isLeft: true },
    { x: 0.86, z: 1.35, isLeft: false },
  ];

  for (const h of hubs) {
    const ringGroup = new THREE.Group();
    ringGroup.position.set(h.x, 0.34, h.z);

    // 48-Tooth Toothed Reluctor Disc
    const ringGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.008, 48);
    ringGeo.rotateZ(Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, mats.titaniumMat);
    ring.position.set(h.isLeft ? 0.01 : -0.01, 0, 0);
    ringGroup.add(ring);

    // Hall-Effect Magnetic Pickup Sensor Probe
    const probeGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.022, 8);
    probeGeo.rotateX(Math.PI / 2);
    const probe = new THREE.Mesh(probeGeo, mats.anodizedRedMat);
    probe.position.set(h.isLeft ? 0.01 : -0.01, 0.06, 0);
    ringGroup.add(probe);

    group.add(ringGroup);
  }

  return group;
}
