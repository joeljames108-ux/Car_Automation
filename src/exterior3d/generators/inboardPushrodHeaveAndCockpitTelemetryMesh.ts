// ============================================================================
// INBOARD PUSHROD SUSPENSION, HEAVE DAMPER, ROTOR BOBBINS & TELEMETRY MESH
// ============================================================================
// Extreme detail racing assemblies for GLB vehicles:
// 1. Inboard Pushrod & Heave Damper: Diagonal carbon pushrods, CNC bellcrank
//    rockers, central 3rd-element heave damper/inerter with rubber bump stops.
// 2. Rotor Floating Drive Bobbins & TPMS: 12 titanium drive pins per rotor hat,
//    knurled valve stems, inner rim beadlock ridges, and TPMS transmitter blocks.
// 3. Cockpit 7" Motec Dash & Shift Light Bar: Digital telemetry screen, 16-LED
//    curved shift light bar, coiled radio communications PTT cable.
// 4. Rear Diffuser Serrated Strakes & FIA Rain Light: 6 curved carbon strakes
//    with aerodynamic serrations, triangular prism FIA rain light module.
// 5. Exhaust Thermal Heat Shields & Rear Aero: Embossed heat shields around
//    exhaust tips, rear corner dive planes, and diffuser vortex kick-ups.
// ============================================================================

import * as THREE from 'three';

export interface InboardTelemetryMaterials {
  carbonMat: THREE.Material;
  chromeMat: THREE.Material;
  anodizedRedMat: THREE.Material;
  anodizedBlueMat: THREE.Material;
  aluminumMat: THREE.Material;
  titaniumMat: THREE.Material;
  ledRedMat: THREE.Material;
  ledGreenMat: THREE.Material;
  ledBlueMat: THREE.Material;
  goldMat: THREE.Material;
  rubberMat: THREE.Material;
}

export function createDefaultInboardMaterials(): InboardTelemetryMaterials {
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
    ledRedMat: new THREE.MeshPhysicalMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 0.8,
      roughness: 0.10,
      clearcoat: 1.0,
      name: 'LED_Illuminated_Red',
    }),
    ledGreenMat: new THREE.MeshPhysicalMaterial({
      color: 0x22c55e,
      emissive: 0x16a34a,
      emissiveIntensity: 0.8,
      roughness: 0.10,
      clearcoat: 1.0,
      name: 'LED_Illuminated_Green',
    }),
    ledBlueMat: new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.10,
      clearcoat: 1.0,
      name: 'LED_Illuminated_Blue',
    }),
    goldMat: new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      roughness: 0.15,
      metalness: 0.92,
      clearcoat: 0.8,
      name: 'Gold_Reflective_Foil',
    }),
    rubberMat: new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.90,
      metalness: 0.05,
      name: 'Rubber_Gaiter_Boot',
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. INBOARD PUSHROD SUSPENSION & HEAVE DAMPER ASSEMBLY
// ─────────────────────────────────────────────────────────────────────────────
export function generateInboardPushrodAndHeaveDamperMesh(
  mats: InboardTelemetryMaterials = createDefaultInboardMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Inboard_Pushrod_Heave_Damper_Assembly';
  group.position.set(0, 0.48, -1.35);

  // Left & Right Inboard Bellcrank Rockers & Pushrods
  for (const sx of [-1, 1]) {
    // 1. Diagonal Carbon Pushrod (From wheel upright to bellcrank)
    const rodCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * 0.72, -0.15, 0),
      new THREE.Vector3(sx * 0.48, 0.04, 0.02),
      new THREE.Vector3(sx * 0.22, 0.16, 0.05),
    ]);
    const rodGeo = new THREE.TubeGeometry(rodCurve, 12, 0.014, 8);
    const rod = new THREE.Mesh(rodGeo, mats.carbonMat);
    group.add(rod);

    // Spherical Heim Joint at Rod Ends
    for (const pos of [new THREE.Vector3(sx * 0.72, -0.15, 0), new THREE.Vector3(sx * 0.22, 0.16, 0.05)]) {
      const jointGeo = new THREE.SphereGeometry(0.018, 12, 12);
      const joint = new THREE.Mesh(jointGeo, mats.titaniumMat);
      joint.position.copy(pos);
      group.add(joint);
    }

    // 2. CNC Machined Aluminum Bellcrank Rocker Arm
    const rockerGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.05, 16);
    rockerGeo.rotateX(Math.PI / 2);
    const rocker = new THREE.Mesh(rockerGeo, mats.anodizedRedMat);
    rocker.position.set(sx * 0.18, 0.15, 0.05);
    group.add(rocker);
  }

  // 3. Central 3rd-Element Heave Damper & Inerter Unit
  const heaveGroup = new THREE.Group();
  heaveGroup.position.set(0, 0.18, 0.05);

  // Central Damper Body Cylinder
  const heaveBodyGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.26, 16);
  heaveBodyGeo.rotateZ(Math.PI / 2);
  const heaveBody = new THREE.Mesh(heaveBodyGeo, mats.aluminumMat);
  heaveGroup.add(heaveBody);

  // Coaxial Progressive Rubber Bump Stop Cones
  for (const bx of [-0.08, 0.08]) {
    const bumpGeo = new THREE.ConeGeometry(0.022, 0.04, 12);
    bumpGeo.rotateZ(bx < 0 ? Math.PI / 2 : -Math.PI / 2);
    const bump = new THREE.Mesh(bumpGeo, mats.rubberMat);
    bump.position.set(bx, 0, 0);
    heaveGroup.add(bump);
  }

  // Linear Suspension Coil Spring wrapping the heave unit
  const springCurve = new THREE.CatmullRomCurve3(
    Array.from({ length: 30 }, (_, i) => {
      const angle = (i / 30) * Math.PI * 8;
      const x = -0.10 + (i / 30) * 0.20;
      return new THREE.Vector3(x, Math.cos(angle) * 0.035, Math.sin(angle) * 0.035);
    })
  );
  const springGeo = new THREE.TubeGeometry(springCurve, 40, 0.005, 6);
  const spring = new THREE.Mesh(springGeo, mats.anodizedBlueMat);
  heaveGroup.add(spring);

  group.add(heaveGroup);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ROTOR FLOATING DRIVE BOBBINS & WHEEL VALVE HARDWARE
// ─────────────────────────────────────────────────────────────────────────────
export function generateRotorFloatingBobbinsAndTireValvesMesh(
  mats: InboardTelemetryMaterials = createDefaultInboardMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Rotor_Bobbins_Tire_Valves_Assembly';

  const wheelCorners = [
    { x: -0.84, z: -1.35, isLeft: true },
    { x: 0.84, z: -1.35, isLeft: false },
    { x: -0.86, z: 1.35, isLeft: true },
    { x: 0.86, z: 1.35, isLeft: false },
  ];

  for (const c of wheelCorners) {
    const cornerGroup = new THREE.Group();
    cornerGroup.position.set(c.x, 0.34, c.z);

    // 1. 12 Floating Drive Bobbins / Drive Pins around the Rotor Hat
    for (let b = 0; b < 12; b++) {
      const angle = (b / 12) * Math.PI * 2;
      const bobbinGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.022, 10);
      bobbinGeo.rotateZ(Math.PI / 2);
      const bobbin = new THREE.Mesh(bobbinGeo, mats.titaniumMat);
      bobbin.position.set(
        c.isLeft ? 0.02 : -0.02,
        Math.sin(angle) * 0.12,
        Math.cos(angle) * 0.12
      );
      cornerGroup.add(bobbin);
    }

    // 2. Billet Knurled Tire Valve Stem & Cap
    const valveGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.035, 12);
    valveGeo.rotateX(Math.PI / 4);
    const valve = new THREE.Mesh(valveGeo, mats.anodizedBlueMat);
    valve.position.set(c.isLeft ? -0.12 : 0.12, 0.18, 0.18);
    cornerGroup.add(valve);

    // 3. TPMS Electronic Sensor Transmitter Module (Inside rim well)
    const tpmsGeo = new THREE.BoxGeometry(0.028, 0.016, 0.045);
    const tpms = new THREE.Mesh(tpmsGeo, mats.carbonMat);
    tpms.position.set(c.isLeft ? -0.04 : 0.04, 0.22, 0.22);
    cornerGroup.add(tpms);

    group.add(cornerGroup);
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. COCKPIT MOTEC 7" DASHBOARD & SHIFT LIGHTS BAR
// ─────────────────────────────────────────────────────────────────────────────
export function generateCockpitDashDisplayAndShiftLightsMesh(
  mats: InboardTelemetryMaterials = createDefaultInboardMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Cockpit_Dash_Shift_Lights_Assembly';
  group.position.set(-0.35, 0.68, -0.42);

  // 1. Motec 7" Digital Telemetry Display Case
  const dashCaseGeo = new THREE.BoxGeometry(0.18, 0.11, 0.025);
  const dashCase = new THREE.Mesh(dashCaseGeo, mats.aluminumMat);
  group.add(dashCase);

  // LCD Screen Panel
  const screenGeo = new THREE.PlaneGeometry(0.15, 0.08);
  const screen = new THREE.Mesh(screenGeo, mats.ledBlueMat);
  screen.position.set(0, 0, 0.013);
  group.add(screen);

  // 2. 16-Segment Curved LED Shift Light Bar
  for (let s = -7; s <= 8; s++) {
    const ledGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.006, 8);
    ledGeo.rotateX(Math.PI / 2);
    const ledMat = Math.abs(s) < 3 ? mats.ledGreenMat : Math.abs(s) < 6 ? mats.ledRedMat : mats.ledBlueMat;
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(s * 0.009, 0.046, 0.014);
    group.add(led);
  }

  // 3. Coiled Radio Communications PTT Cable
  const pttCurve = new THREE.CatmullRomCurve3(
    Array.from({ length: 24 }, (_, i) => {
      const angle = (i / 24) * Math.PI * 6;
      const y = -0.05 - (i / 24) * 0.12;
      return new THREE.Vector3(Math.cos(angle) * 0.012, y, Math.sin(angle) * 0.012);
    })
  );
  const pttGeo = new THREE.TubeGeometry(pttCurve, 24, 0.003, 6);
  const ptt = new THREE.Mesh(pttGeo, mats.rubberMat);
  group.add(ptt);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. REAR DIFFUSER SERRATED STRAKES & FIA RAIN LIGHT
// ─────────────────────────────────────────────────────────────────────────────
export function generateRearDiffuserStrakesAndRainLightMesh(
  mats: InboardTelemetryMaterials = createDefaultInboardMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Diffuser_Strakes_Rain_Light_Assembly';
  group.position.set(0, 0.22, 2.15);

  // 1. 6 Curved Carbon Diffuser Strakes with Serrated Trailing Edges
  for (let s = -3; s <= 3; s++) {
    if (s === 0) continue;
    const strakeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 0.14, -0.06, -0.55),
      new THREE.Vector3(s * 0.15, -0.02, -0.15),
      new THREE.Vector3(s * 0.16, 0.08, 0.15),
    ]);
    const strakeGeo = new THREE.TubeGeometry(strakeCurve, 12, 0.005, 4);
    strakeGeo.scale(1.0, 8.0, 1.0);
    const strake = new THREE.Mesh(strakeGeo, mats.carbonMat);
    group.add(strake);
  }

  // 2. Central Triangular FIA-Spec Ultra-Bright Rain Light
  const rainShape = new THREE.Shape();
  rainShape.moveTo(-0.045, 0);
  rainShape.lineTo(0.045, 0);
  rainShape.lineTo(0, 0.065);
  rainShape.closePath();

  const rainGeo = new THREE.ExtrudeGeometry(rainShape, {
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.004,
    bevelSegments: 2,
  });
  const rainLight = new THREE.Mesh(rainGeo, mats.ledRedMat);
  rainLight.position.set(0, 0.04, 0.12);
  group.add(rainLight);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. EXHAUST THERMAL HEAT SHIELDS & REAR AERO
// ─────────────────────────────────────────────────────────────────────────────
export function generateExhaustThermalShieldsAndRearAeroMesh(
  mats: InboardTelemetryMaterials = createDefaultInboardMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Exhaust_Thermal_Shields_Rear_Aero_Assembly';

  // 1. Embossed Titanium Exhaust Surround Heat Shields
  for (const sx of [-1, 1]) {
    const shieldGeo = new THREE.BoxGeometry(0.24, 0.14, 0.015);
    const shield = new THREE.Mesh(shieldGeo, mats.titaniumMat);
    shield.position.set(sx * 0.32, 0.34, 2.22);
    group.add(shield);

    // Rear Corner Aerodynamic Dive Planes (Diffuser kick-up flaps)
    const flapGeo = new THREE.BoxGeometry(0.18, 0.008, 0.12);
    const flap = new THREE.Mesh(flapGeo, mats.carbonMat);
    flap.position.set(sx * 0.78, 0.28, 2.12);
    flap.rotation.x = 0.25;
    flap.rotation.y = sx * 0.15;
    group.add(flap);
  }

  return group;
}
