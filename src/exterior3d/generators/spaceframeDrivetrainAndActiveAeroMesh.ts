// ============================================================================
// SPACEFRAME, DRIVETRAIN & ACTIVE AERO HIGH-DENSITY MESH GENERATOR
// ============================================================================
// Ultra-high detail automotive engineering meshes:
// 1. Spaceframe Subframes & Crash Structures: Chromoly spaceframe front/rear
//    cradles, aluminum honeycomb crash box, rear impact attenuator.
// 2. Drivetrain Differential & Coolers: Finned LSD differential, rear transaxle
//    oil cooler with twin fans, AN-10 braided lines, adjustable sway bar blades.
// 3. Active Aero & Fender Louvers: Active front splitter flaps with stepper motors,
//    slotted fender extraction louvers, DRS double-element wing hydraulic actuators.
// 4. Cockpit Electronics & FIA Safety Net: Motorsport ECU/PDU, Raychem wiring looms,
//    carbon paddle shifters, FIA ribbon window net, and hydration bottle.
// ============================================================================

import * as THREE from 'three';

export interface SpaceframeMaterials {
  carbonMat: THREE.Material;
  chromeMat: THREE.Material;
  anodizedRedMat: THREE.Material;
  anodizedBlueMat: THREE.Material;
  aluminumMat: THREE.Material;
  steelTubingMat: THREE.Material;
  goldMat: THREE.Material;
  wiringMat: THREE.Material;
  netMat: THREE.Material;
}

export function createDefaultSpaceframeMaterials(): SpaceframeMaterials {
  return {
    carbonMat: new THREE.MeshPhysicalMaterial({
      color: 0x090d16,
      roughness: 0.18,
      metalness: 0.88,
      clearcoat: 0.95,
      clearcoatRoughness: 0.03,
      name: 'Carbon_Twill_Aero',
    }),
    chromeMat: new THREE.MeshPhysicalMaterial({
      color: 0xf1f5f9,
      roughness: 0.05,
      metalness: 0.98,
      clearcoat: 1.0,
      name: 'Mirror_Polished_Metal',
    }),
    anodizedRedMat: new THREE.MeshPhysicalMaterial({
      color: 0xdc2626,
      roughness: 0.20,
      metalness: 0.85,
      clearcoat: 0.8,
      name: 'Anodized_Red_Metal',
    }),
    anodizedBlueMat: new THREE.MeshPhysicalMaterial({
      color: 0x2563eb,
      roughness: 0.20,
      metalness: 0.85,
      clearcoat: 0.8,
      name: 'Anodized_Blue_Metal',
    }),
    aluminumMat: new THREE.MeshStandardMaterial({
      color: 0xc8d0db,
      roughness: 0.30,
      metalness: 0.90,
      name: 'Billet_CNC_Aluminum',
    }),
    steelTubingMat: new THREE.MeshStandardMaterial({
      color: 0x475569, // Chromoly 4130 steel tubing
      roughness: 0.40,
      metalness: 0.85,
      name: 'Chromoly_Steel_Tubing',
    }),
    goldMat: new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      roughness: 0.15,
      metalness: 0.92,
      clearcoat: 0.8,
      name: 'Gold_Foil_Insulation',
    }),
    wiringMat: new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.90,
      metalness: 0.10,
      name: 'Raychem_Wiring_Loom',
    }),
    netMat: new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.95,
      metalness: 0.05,
      wireframe: true,
      name: 'FIA_Safety_Net_Ribbon',
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SPACEFRAME SUBFRAMES & CRASH STRUCTURES
// ─────────────────────────────────────────────────────────────────────────────
export function generateSpaceframeSubframeAndCrashStructureMesh(
  mats: SpaceframeMaterials = createDefaultSpaceframeMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Spaceframe_Subframes_Crash_Structures_Assembly';

  // --- Front Chromoly Triangulated Spaceframe Cradle ---
  const frontCradle = new THREE.Group();
  frontCradle.name = 'Front_Chromoly_Subframe_Cradle';
  frontCradle.position.set(0, 0.28, -1.45);

  // Lower longitudinal rails (Left & Right)
  for (const sx of [-0.44, 0.44]) {
    const railGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.85, 12);
    railGeo.rotateX(Math.PI / 2);
    const rail = new THREE.Mesh(railGeo, mats.steelTubingMat);
    rail.position.set(sx, -0.08, -0.15);
    frontCradle.add(rail);

    // Diagonal triangulated brace tubes
    const diagCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx, -0.08, -0.50),
      new THREE.Vector3(sx * 0.7, 0.18, -0.15),
      new THREE.Vector3(sx, -0.08, 0.20),
    ]);
    const diagGeo = new THREE.TubeGeometry(diagCurve, 12, 0.015, 10);
    const diagMesh = new THREE.Mesh(diagGeo, mats.steelTubingMat);
    frontCradle.add(diagMesh);

    // Suspension Pick-Up Cleats (CNC machined brackets)
    for (const pz of [-0.35, 0.05]) {
      const cleatGeo = new THREE.BoxGeometry(0.035, 0.055, 0.045);
      const cleat = new THREE.Mesh(cleatGeo, mats.aluminumMat);
      cleat.position.set(sx, -0.02, pz);
      frontCradle.add(cleat);
    }
  }

  // Crossmember bridge
  const xMemberGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.88, 12);
  xMemberGeo.rotateZ(Math.PI / 2);
  const xMember = new THREE.Mesh(xMemberGeo, mats.steelTubingMat);
  xMember.position.set(0, -0.08, -0.15);
  frontCradle.add(xMember);

  // Front Aluminum Honeycomb Crash Attenuator Box
  const crashBoxGeo = new THREE.BoxGeometry(0.68, 0.22, 0.38);
  const crashBox = new THREE.Mesh(crashBoxGeo, mats.aluminumMat);
  crashBox.position.set(0, 0.02, -0.65);
  frontCradle.add(crashBox);

  // Crush Initiator Dimples (Ribs)
  for (let r = -2; r <= 2; r++) {
    const ribGeo = new THREE.BoxGeometry(0.70, 0.015, 0.015);
    const rib = new THREE.Mesh(ribGeo, mats.carbonMat);
    rib.position.set(0, 0.02, -0.52 + r * 0.06);
    frontCradle.add(rib);
  }

  group.add(frontCradle);

  // --- Rear Tubular Engine Cradle & Impact Attenuator ---
  const rearCradle = new THREE.Group();
  rearCradle.name = 'Rear_Engine_Cradle_Subframe';
  rearCradle.position.set(0, 0.32, 1.45);

  // Tubular trellis around differential and transmission
  for (const sx of [-0.48, 0.48]) {
    const rearRailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx, 0.32, -0.45),
      new THREE.Vector3(sx, 0.12, 0.10),
      new THREE.Vector3(sx * 0.6, -0.05, 0.55),
    ]);
    const rearRailGeo = new THREE.TubeGeometry(rearRailCurve, 16, 0.020, 10);
    const rearRail = new THREE.Mesh(rearRailGeo, mats.steelTubingMat);
    rearCradle.add(rearRail);
  }

  // FIA Rear Composite Impact Attenuator (Conical pyramid mounted to crash beam)
  const rearCrashGeo = new THREE.ConeGeometry(0.18, 0.42, 6);
  rearCrashGeo.rotateX(Math.PI / 2);
  const rearCrash = new THREE.Mesh(rearCrashGeo, mats.carbonMat);
  rearCrash.position.set(0, 0.05, 0.65);
  rearCradle.add(rearCrash);

  group.add(rearCradle);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DRIVETRAIN DIFFERENTIAL, OIL COOLER & SWAY BAR BLADES
// ─────────────────────────────────────────────────────────────────────────────
export function generateDrivetrainDifferentialAndCoolersMesh(
  mats: SpaceframeMaterials = createDefaultSpaceframeMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Drivetrain_Differential_Cooler_Assembly';

  // 1. Limited-Slip Differential (LSD) Casing
  const diffGroup = new THREE.Group();
  diffGroup.name = 'Limited_Slip_Differential_Casing';
  diffGroup.position.set(0, 0.34, 1.35);

  // Main differential pumpkin housing
  const diffGeo = new THREE.SphereGeometry(0.16, 20, 16);
  diffGeo.scale(1.2, 0.9, 1.1);
  const diffMesh = new THREE.Mesh(diffGeo, mats.steelTubingMat);
  diffGroup.add(diffMesh);

  // Heat Dissipation Cooling Fins on Differential Cover
  for (let f = -4; f <= 4; f++) {
    const finGeo = new THREE.BoxGeometry(0.008, 0.18, 0.08);
    const fin = new THREE.Mesh(finGeo, mats.aluminumMat);
    fin.position.set(f * 0.035, 0, 0.14);
    diffGroup.add(fin);
  }

  // Oil Sight Glass Tube
  const sightGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.09, 12);
  const sightMesh = new THREE.Mesh(sightGeo, mats.anodizedBlueMat);
  sightMesh.position.set(0.15, 0.02, 0.10);
  diffGroup.add(sightMesh);

  // Breather Vent Filter Canister
  const ventGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.04, 12);
  const vent = new THREE.Mesh(ventGeo, mats.anodizedRedMat);
  vent.position.set(0, 0.18, 0);
  diffGroup.add(vent);

  group.add(diffGroup);

  // 2. Rear Transaxle Oil Cooler Radiator with Twin Suction Fans
  const coolerGroup = new THREE.Group();
  coolerGroup.name = 'Transaxle_Oil_Cooler_Radiator';
  coolerGroup.position.set(0, 0.48, 1.85);

  // Bar-and-plate aluminum oil cooler core
  const coreGeo = new THREE.BoxGeometry(0.48, 0.18, 0.04);
  const coreMesh = new THREE.Mesh(coreGeo, mats.aluminumMat);
  coolerGroup.add(coreMesh);

  // Twin Brushless Suction Electric Fans
  for (const fx of [-0.13, 0.13]) {
    // Fan Shroud Ring
    const shroudGeo = new THREE.TorusGeometry(0.075, 0.008, 8, 20);
    const shroud = new THREE.Mesh(shroudGeo, mats.carbonMat);
    shroud.position.set(fx, 0, 0.025);
    coolerGroup.add(shroud);

    // Fan Blade Rotor (7 blades)
    const hubGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.015, 12);
    hubGeo.rotateX(Math.PI / 2);
    const hub = new THREE.Mesh(hubGeo, mats.carbonMat);
    hub.position.set(fx, 0, 0.03);
    coolerGroup.add(hub);
  }

  // AN-10 Braided Stainless Steel High-Pressure Oil Lines
  for (const sx of [-1, 1]) {
    const lineCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * 0.18, 0, 0),
      new THREE.Vector3(sx * 0.22, -0.08, -0.22),
      new THREE.Vector3(sx * 0.14, -0.14, -0.48),
    ]);
    const lineGeo = new THREE.TubeGeometry(lineCurve, 12, 0.014, 8);
    const lineMesh = new THREE.Mesh(lineGeo, mats.chromeMat);
    coolerGroup.add(lineMesh);

    // Anodized AN fitting nut
    const fitGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.03, 6);
    fitGeo.rotateX(Math.PI / 2);
    const fit = new THREE.Mesh(fitGeo, mats.anodizedBlueMat);
    fit.position.set(sx * 0.18, 0, 0.02);
    coolerGroup.add(fit);
  }

  group.add(coolerGroup);

  // 3. Front and Rear Adjustable Anti-Roll Sway Bar Blade Arms
  for (const axleZ of [-1.35, 1.35]) {
    const arbGroup = new THREE.Group();
    arbGroup.position.set(0, 0.24, axleZ);

    // Transverse torsion bar
    const barGeo = new THREE.CylinderGeometry(0.016, 0.016, 1.25, 16);
    barGeo.rotateZ(Math.PI / 2);
    const bar = new THREE.Mesh(barGeo, mats.anodizedRedMat);
    arbGroup.add(bar);

    // Billet aluminum blade lever arms (Left & Right)
    for (const sx of [-0.62, 0.62]) {
      const bladeGeo = new THREE.BoxGeometry(0.018, 0.032, 0.16);
      const blade = new THREE.Mesh(bladeGeo, mats.aluminumMat);
      blade.position.set(sx, 0.02, axleZ < 0 ? -0.06 : 0.06);
      arbGroup.add(blade);

      // Articulated drop link with spherical heim joint rod-ends
      const linkCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(sx, 0.02, axleZ < 0 ? -0.13 : 0.13),
        new THREE.Vector3(sx * 0.95, 0.10, axleZ < 0 ? -0.08 : 0.08),
      ]);
      const link = new THREE.Mesh(new THREE.TubeGeometry(linkCurve, 8, 0.009, 8), mats.chromeMat);
      arbGroup.add(link);
    }

    group.add(arbGroup);
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ACTIVE AERO, FENDER LOUVERS & DRS WING ACTUATOR
// ─────────────────────────────────────────────────────────────────────────────
export function generateActiveAeroAndFenderLouversMesh(
  mats: SpaceframeMaterials = createDefaultSpaceframeMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Active_Aero_Louvers_DRS_Assembly';

  // 1. Active Front Aero Flaps inside Splitter Tunnels
  for (const sx of [-1, 1]) {
    const flapGroup = new THREE.Group();
    flapGroup.name = `Active_Front_Splitter_Flap_${sx < 0 ? 'LH' : 'RH'}`;
    flapGroup.position.set(sx * 0.58, 0.12, -2.02);

    // Carbon Flap Blade (angled for downforce/drag modes)
    const flapGeo = new THREE.BoxGeometry(0.24, 0.012, 0.18);
    const flapMesh = new THREE.Mesh(flapGeo, mats.carbonMat);
    flapMesh.rotation.x = -0.22;
    flapGroup.add(flapMesh);

    // Miniature Electric Stepper Motor Actuator
    const actGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.06, 12);
    actGeo.rotateZ(Math.PI / 2);
    const actMesh = new THREE.Mesh(actGeo, mats.anodizedBlueMat);
    actMesh.position.set(sx * -0.12, 0.04, 0);
    flapGroup.add(actMesh);

    group.add(flapGroup);
  }

  // 2. High-Downforce Front Wheel Arch Slotted Louvers (5 slats per fender)
  for (const sx of [-1, 1]) {
    const louverGroup = new THREE.Group();
    louverGroup.name = `Wheel_Arch_Louver_Stack_${sx < 0 ? 'LH' : 'RH'}`;
    louverGroup.position.set(sx * 0.84, 0.72, -1.35);

    for (let s = 0; s < 5; s++) {
      const slatGeo = new THREE.BoxGeometry(0.16, 0.008, 0.05);
      const slatMesh = new THREE.Mesh(slatGeo, mats.carbonMat);
      slatMesh.position.set(0, s * 0.018, s * 0.06);
      slatMesh.rotation.x = -0.42;
      louverGroup.add(slatMesh);
    }

    group.add(louverGroup);
  }

  // 3. Double-Element Rear Wing DRS (Drag Reduction System) Hydraulic Ram Actuator
  const drsGroup = new THREE.Group();
  drsGroup.name = 'DRS_Rear_Wing_Actuator_Mechanism';
  drsGroup.position.set(0, 1.15, 2.12);

  // Central DRS Actuator Housing Body
  const drsBodyGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.12, 16);
  drsBodyGeo.rotateX(Math.PI / 2);
  const drsBody = new THREE.Mesh(drsBodyGeo, mats.carbonMat);
  drsGroup.add(drsBody);

  // Chrome Hydraulic Piston Ram Extension Shaft
  const pistonGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.08, 12);
  pistonGeo.rotateX(Math.PI / 2);
  const piston = new THREE.Mesh(pistonGeo, mats.chromeMat);
  piston.position.set(0, 0.03, -0.04);
  drsGroup.add(piston);

  // Articulating Wing Flap Clevis Hinge Brackets (Left & Right)
  for (const sx of [-0.08, 0.08]) {
    const clevisGeo = new THREE.BoxGeometry(0.012, 0.045, 0.06);
    const clevis = new THREE.Mesh(clevisGeo, mats.aluminumMat);
    clevis.position.set(sx, 0.02, 0);
    drsGroup.add(clevis);
  }

  // Carbon Trailing-Edge Gurney Flap (Wickerbill strip with Allen screws)
  const gurneyGeo = new THREE.BoxGeometry(1.88, 0.018, 0.006);
  const gurneyMesh = new THREE.Mesh(gurneyGeo, mats.carbonMat);
  gurneyMesh.position.set(0, 0.06, 0.18);
  drsGroup.add(gurneyMesh);

  group.add(drsGroup);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. COCKPIT MOTORSPORT ELECTRONICS & FIA SAFETY GEAR
// ─────────────────────────────────────────────────────────────────────────────
export function generateCockpitMotorsportElectronicsMesh(
  mats: SpaceframeMaterials = createDefaultSpaceframeMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Cockpit_Motorsport_Electronics_Assembly';

  // 1. Motorsport ECU / PDU Unit with Multi-Pin Deutsch Autosport Connectors
  const ecuGroup = new THREE.Group();
  ecuGroup.name = 'Motorsport_ECU_PDU_Unit';
  ecuGroup.position.set(-0.25, 0.45, -0.52);

  // Billet ECU Case with Cooling Heat Sinks
  const ecuGeo = new THREE.BoxGeometry(0.18, 0.06, 0.14);
  const ecu = new THREE.Mesh(ecuGeo, mats.aluminumMat);
  ecuGroup.add(ecu);

  // Deutsch Autosport Circular Connectors (Row of 3)
  for (let c = -1; c <= 1; c++) {
    const connGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.025, 12);
    connGeo.rotateX(Math.PI / 2);
    const conn = new THREE.Mesh(connGeo, mats.anodizedBlueMat);
    conn.position.set(c * 0.045, 0, 0.075);
    ecuGroup.add(conn);
  }

  group.add(ecuGroup);

  // 2. Bundled Automotive Raychem Wiring Loom with Yellow Markers
  for (const sx of [-0.22, 0.22]) {
    const loomCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx, 0.45, -0.55),
      new THREE.Vector3(sx * 1.1, 0.35, 0.0),
      new THREE.Vector3(sx * 0.9, 0.38, 0.45),
    ]);
    const loomGeo = new THREE.TubeGeometry(loomCurve, 16, 0.012, 8);
    const loomMesh = new THREE.Mesh(loomGeo, mats.wiringMat);
    group.add(loomMesh);

    // Yellow Identification Marker Band
    const markerGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.03, 12);
    const marker = new THREE.Mesh(markerGeo, mats.goldMat);
    marker.position.set(sx * 1.1, 0.35, 0.0);
    group.add(marker);
  }

  // 3. Carbon Fiber Steering Wheel Paddle Shifters (+ / -)
  const paddleGroup = new THREE.Group();
  paddleGroup.position.set(-0.32, 0.64, -0.29);

  for (const sx of [-1, 1]) {
    const paddleGeo = new THREE.BoxGeometry(0.025, 0.09, 0.006);
    const paddle = new THREE.Mesh(paddleGeo, mats.carbonMat);
    paddle.position.set(sx * 0.12, 0.04, 0);
    paddle.rotation.y = sx * -0.15;
    paddleGroup.add(paddle);
  }
  group.add(paddleGroup);

  // 4. Driver FIA Safety Window Net (Ribbon web net on driver side)
  const netGeo = new THREE.PlaneGeometry(0.68, 0.38, 8, 6);
  const net = new THREE.Mesh(netGeo, mats.netMat);
  net.position.set(-0.84, 0.88, 0.02);
  net.rotation.y = Math.PI / 2;
  group.add(net);

  // 5. Driver Hydration Drinks Bottle with Silicone Bite Valve Tube
  const bottleGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.18, 16);
  const bottle = new THREE.Mesh(bottleGeo, mats.aluminumMat);
  bottle.position.set(-0.54, 0.65, -0.15);
  group.add(bottle);

  const tubeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.54, 0.74, -0.15),
    new THREE.Vector3(-0.48, 0.85, -0.22),
    new THREE.Vector3(-0.35, 0.72, -0.28),
  ]);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(tubeCurve, 10, 0.005, 6), mats.chromeMat);
  group.add(tube);

  return group;
}
