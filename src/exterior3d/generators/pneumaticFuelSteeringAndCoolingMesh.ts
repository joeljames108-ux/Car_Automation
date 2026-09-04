// ============================================================================
// PNEUMATIC AIR JACKS, FUEL CELL, STEERING RACK & TELEMETRY MESH GENERATOR
// ============================================================================
// Ultra-detailed mechanical, pneumatic, and steering assemblies for GLB cars:
// 1. FIA FT3 Fuel Cell: Kevlar safety bladder, dual quick-fill Krontec valves,
//    billet fuel pump top hat with manifold pressure regulator.
// 2. Onboard Pneumatic Air Jacks: 4 Krontec lifting cylinders with chrome rams,
//    cowl quick-connect lance valve, rigid pneumatic distribution lines.
// 3. Rack & Pinion Steering System: CNC steering rack, rubber accordion gaiters,
//    twin U-joint steering shaft, and tie-rods with jam nuts.
// 4. Auxiliary Cheek Coolers & Carbon Shrouds: Twin angled oil/water coolers,
//    sealed carbon radiator ducting box, and stainless rock-guard mesh screens.
// 5. Telemetry Sensors & Floor Curls: Damper travel linear potentiometers,
//    infrared brake rotor temp sensors, and hypercar slotted floor edge curls.
// ============================================================================

import * as THREE from 'three';

export interface PneumaticFuelMaterials {
  carbonMat: THREE.Material;
  chromeMat: THREE.Material;
  anodizedRedMat: THREE.Material;
  anodizedBlueMat: THREE.Material;
  aluminumMat: THREE.Material;
  kevlarMat: THREE.Material;
  rubberMat: THREE.Material;
  brassMat: THREE.Material;
  meshScreenMat: THREE.Material;
}

export function createDefaultPneumaticFuelMaterials(): PneumaticFuelMaterials {
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
      name: 'Mirror_Polished_Ram',
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
    kevlarMat: new THREE.MeshPhysicalMaterial({
      color: 0xca8a04, // Yellow-gold Kevlar weave
      roughness: 0.45,
      metalness: 0.25,
      clearcoat: 0.6,
      name: 'Kevlar_Aramid_Fuel_Cell',
    }),
    rubberMat: new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.85,
      metalness: 0.05,
      name: 'Rubber_Gaiter_Boot',
    }),
    brassMat: new THREE.MeshPhysicalMaterial({
      color: 0xd97706,
      roughness: 0.28,
      metalness: 0.88,
      name: 'Billet_Brass_Fitting',
    }),
    meshScreenMat: new THREE.MeshStandardMaterial({
      color: 0x334155,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
      name: 'Cooler_Rock_Guard_Mesh',
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. FIA FT3 SAFETY FUEL CELL & QUICK-CONNECT VALVES
// ─────────────────────────────────────────────────────────────────────────────
export function generateFuelCellAndRefuelingSystemMesh(
  mats: PneumaticFuelMaterials = createDefaultPneumaticFuelMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Fuel_Cell_Refueling_System_Assembly';

  // 1. Kevlar-Aramid Safety Bladder (Mounted centrally behind the cockpit)
  const bladderGeo = new THREE.BoxGeometry(0.72, 0.42, 0.48);
  const bladder = new THREE.Mesh(bladderGeo, mats.kevlarMat);
  bladder.position.set(0, 0.52, 0.22);
  group.add(bladder);

  // Billet Aluminum Top Hat Pump Flange
  const flangeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.02, 24);
  const flange = new THREE.Mesh(flangeGeo, mats.aluminumMat);
  flange.position.set(0, 0.74, 0.22);
  group.add(flange);

  // Twin In-Tank Fuel Pressure Regulators
  for (const sx of [-0.04, 0.04]) {
    const regGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.05, 12);
    const reg = new THREE.Mesh(regGeo, mats.anodizedBlueMat);
    reg.position.set(sx, 0.77, 0.22);
    group.add(reg);
  }

  // 2. Dual Krontec Dry-Break Quick-Fill Receptacle Valves (C-pillars)
  for (const sx of [-0.78, 0.78]) {
    const valveGroup = new THREE.Group();
    valveGroup.position.set(sx, 0.88, 0.85);
    valveGroup.rotation.y = sx < 0 ? -Math.PI / 2.8 : Math.PI / 2.8;

    // Outer Billet Bezel Ring
    const bezelGeo = new THREE.TorusGeometry(0.048, 0.008, 8, 24);
    const bezel = new THREE.Mesh(bezelGeo, mats.aluminumMat);
    valveGroup.add(bezel);

    // Stäubli Dry-Break Spring-Loaded Poppet Valve
    const poppetGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.04, 20);
    const poppet = new THREE.Mesh(poppetGeo, mats.anodizedRedMat);
    valveGroup.add(poppet);

    // Fuel Filler Funnel Tube to Bladder
    const fillTubeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(sx < 0 ? 0.12 : -0.12, -0.15, -0.22),
      new THREE.Vector3(sx < 0 ? 0.35 : -0.35, -0.28, -0.45),
    ]);
    const fillTubeGeo = new THREE.TubeGeometry(fillTubeCurve, 12, 0.035, 12);
    const fillTube = new THREE.Mesh(fillTubeGeo, mats.carbonMat);
    valveGroup.add(fillTube);

    group.add(valveGroup);
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ONBOARD PNEUMATIC AIR JACKS LIFT SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
export function generatePneumaticAirJacksSystemMesh(
  mats: PneumaticFuelMaterials = createDefaultPneumaticFuelMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Pneumatic_Air_Jacks_System_Assembly';

  // 4 Krontec Air Jack Cylinders (2 Front, 2 Rear)
  const jackLocations = [
    { x: -0.48, z: -1.05 },
    { x: 0.48, z: -1.05 },
    { x: -0.48, z: 1.05 },
    { x: 0.48, z: 1.05 },
  ];

  for (const loc of jackLocations) {
    const jackGroup = new THREE.Group();
    jackGroup.position.set(loc.x, 0.32, loc.z);

    // Anodized Cylinder Body
    const bodyGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.32, 16);
    const body = new THREE.Mesh(bodyGeo, mats.anodizedRedMat);
    jackGroup.add(body);

    // Chrome Lift Piston Ram (Retracted with foot pad)
    const ramGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.28, 16);
    const ram = new THREE.Mesh(ramGeo, mats.chromeMat);
    ram.position.set(0, -0.08, 0);
    jackGroup.add(ram);

    // Circular Jack Foot Pad
    const footGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.015, 20);
    const foot = new THREE.Mesh(footGeo, mats.aluminumMat);
    foot.position.set(0, -0.22, 0);
    jackGroup.add(foot);

    // Top Air Line Fitting
    const fitGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.03, 6);
    const fit = new THREE.Mesh(fitGeo, mats.anodizedBlueMat);
    fit.position.set(0, 0.17, 0);
    jackGroup.add(fit);

    group.add(jackGroup);
  }

  // Cowl Lance Coupling Quick-Connect Valve (Front windshield cowl area)
  const lanceGroup = new THREE.Group();
  lanceGroup.position.set(0.42, 0.72, -0.85);

  const lanceBezelGeo = new THREE.TorusGeometry(0.025, 0.005, 8, 16);
  const lanceBezel = new THREE.Mesh(lanceBezelGeo, mats.aluminumMat);
  lanceGroup.add(lanceBezel);

  const lanceCouplerGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.04, 12);
  const lanceCoupler = new THREE.Mesh(lanceCouplerGeo, mats.brassMat);
  lanceGroup.add(lanceCoupler);

  group.add(lanceGroup);

  // Rigid Aluminum Distribution Air Lines (Front to Rear Chassis Line)
  for (const sx of [-0.46, 0.46]) {
    const pipeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx, 0.48, -1.05),
      new THREE.Vector3(sx * 0.9, 0.28, 0.0),
      new THREE.Vector3(sx, 0.48, 1.05),
    ]);
    const pipeGeo = new THREE.TubeGeometry(pipeCurve, 16, 0.007, 8);
    const pipe = new THREE.Mesh(pipeGeo, mats.aluminumMat);
    group.add(pipe);
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. RACK & PINION MECHANICAL STEERING SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
export function generateSteeringRackAndShaftAssemblyMesh(
  mats: PneumaticFuelMaterials = createDefaultPneumaticFuelMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Steering_Rack_Shaft_Assembly';
  group.position.set(0, 0.26, -1.28);

  // 1. CNC Billet Aluminum Steering Rack Housing
  const rackGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.72, 16);
  rackGeo.rotateZ(Math.PI / 2);
  const rack = new THREE.Mesh(rackGeo, mats.aluminumMat);
  group.add(rack);

  // Central Pinion Gear Housing Tower
  const towerGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.12, 16);
  const tower = new THREE.Mesh(towerGeo, mats.aluminumMat);
  tower.position.set(-0.15, 0.06, 0);
  tower.rotation.x = -0.35;
  group.add(tower);

  // 2. Flexible Rubber Accordion Gaiter Boots (Left & Right)
  for (const sx of [-0.34, 0.34]) {
    const gaiterGeo = new THREE.CylinderGeometry(0.028, 0.022, 0.10, 16);
    gaiterGeo.rotateZ(Math.PI / 2);
    const gaiter = new THREE.Mesh(gaiterGeo, mats.rubberMat);
    gaiter.position.set(sx, 0, 0);
    group.add(gaiter);
  }

  // 3. Tubular Steering Tie Rods with Threaded Adjuster Jam Nuts
  for (const sx of [-1, 1]) {
    const rodCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * 0.39, 0, 0),
      new THREE.Vector3(sx * 0.58, 0.02, -0.02),
      new THREE.Vector3(sx * 0.74, 0.06, -0.05), // Connects to steering arm
    ]);
    const rodGeo = new THREE.TubeGeometry(rodCurve, 10, 0.012, 8);
    const rod = new THREE.Mesh(rodGeo, mats.chromeMat);
    group.add(rod);

    // Hexagon Jam Nut
    const nutGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.018, 6);
    nutGeo.rotateZ(Math.PI / 2);
    const nut = new THREE.Mesh(nutGeo, mats.anodizedRedMat);
    nut.position.set(sx * 0.58, 0.02, -0.02);
    group.add(nut);
  }

  // 4. Articulated Intermediate Steering Shaft with Dual Cardan U-Joints
  const shaftGroup = new THREE.Group();
  shaftGroup.position.set(-0.15, 0.12, 0);

  // Lower U-Joint
  const uJoint1Geo = new THREE.TorusGeometry(0.022, 0.007, 8, 16);
  const uJoint1 = new THREE.Mesh(uJoint1Geo, mats.chromeMat);
  shaftGroup.add(uJoint1);

  // Splined Steering Column Shaft
  const shaftCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-0.06, 0.22, 0.32),
    new THREE.Vector3(-0.12, 0.36, 0.65), // Enters cockpit firewall
  ]);
  const shaftGeo = new THREE.TubeGeometry(shaftCurve, 12, 0.014, 8);
  const shaft = new THREE.Mesh(shaftGeo, mats.chromeMat);
  shaftGroup.add(shaft);

  // Upper U-Joint
  const uJoint2Geo = new THREE.TorusGeometry(0.022, 0.007, 8, 16);
  const uJoint2 = new THREE.Mesh(uJoint2Geo, mats.chromeMat);
  uJoint2.position.set(-0.12, 0.36, 0.65);
  shaftGroup.add(uJoint2);

  group.add(shaftGroup);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. AUXILIARY CHEEK RADIATORS & CARBON AIR DUCTING BOX
// ─────────────────────────────────────────────────────────────────────────────
export function generateAuxiliaryCoolersAndDuctingMesh(
  mats: PneumaticFuelMaterials = createDefaultPneumaticFuelMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Auxiliary_Coolers_Ducting_Assembly';

  // 1. Dual Angled Cheek Radiator Heat Exchangers (Left & Right front bumper)
  for (const sx of [-1, 1]) {
    const cheekGroup = new THREE.Group();
    cheekGroup.name = `Aux_Cheek_Cooler_${sx < 0 ? 'LH' : 'RH'}`;
    cheekGroup.position.set(sx * 0.65, 0.28, -1.82);
    cheekGroup.rotation.y = sx * -0.38;

    // Finned Radiator Core Matrix
    const coreGeo = new THREE.BoxGeometry(0.32, 0.22, 0.045);
    const core = new THREE.Mesh(coreGeo, mats.aluminumMat);
    cheekGroup.add(core);

    // Protective Stainless Rock Guard Mesh Screen
    const screenGeo = new THREE.PlaneGeometry(0.32, 0.22);
    const screen = new THREE.Mesh(screenGeo, mats.meshScreenMat);
    screen.position.set(0, 0, -0.025);
    cheekGroup.add(screen);

    // Carbon Fiber Funnel Intake Shroud
    const shroudGeo = new THREE.ConeGeometry(0.18, 0.16, 4, 1, true);
    shroudGeo.rotateX(-Math.PI / 2);
    const shroud = new THREE.Mesh(shroudGeo, mats.carbonMat);
    shroud.position.set(0, 0, -0.09);
    cheekGroup.add(shroud);

    group.add(cheekGroup);
  }

  // 2. Central Radiator Sealed Carbon Ducting Box (Traps air through front intake)
  const ductBoxGeo = new THREE.BoxGeometry(0.98, 0.26, 0.32);
  const ductBox = new THREE.Mesh(ductBoxGeo, mats.carbonMat);
  ductBox.position.set(0, 0.32, -1.95);
  group.add(ductBox);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. TELEMETRY SENSORS & HYPERCAR FLOOR EDGE SCROLL WINGS
// ─────────────────────────────────────────────────────────────────────────────
export function generateTelemetrySensorsAndAeroCurlsMesh(
  mats: PneumaticFuelMaterials = createDefaultPneumaticFuelMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Telemetry_Sensors_Aero_Curls_Assembly';

  // 1. Shock Damper Linear Travel Potentiometer Sensors (All 4 corners)
  const damperCorners = [
    { x: -0.62, z: -1.35 },
    { x: 0.62, z: -1.35 },
    { x: -0.64, z: 1.35 },
    { x: 0.64, z: 1.35 },
  ];

  for (const c of damperCorners) {
    const potGroup = new THREE.Group();
    potGroup.position.set(c.x, 0.42, c.z);

    // Sensor Body Cylinder
    const potBodyGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.14, 12);
    const potBody = new THREE.Mesh(potBodyGeo, mats.carbonMat);
    potGroup.add(potBody);

    // Sensor Extension Rod
    const potRodGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.12, 8);
    const potRod = new THREE.Mesh(potRodGeo, mats.chromeMat);
    potRod.position.set(0, -0.06, 0);
    potGroup.add(potRod);

    // Signal Wire Pigtail to Chassis Harness
    const wireCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.07, 0),
      new THREE.Vector3(c.x < 0 ? 0.04 : -0.04, 0.10, 0.04),
    ]);
    const wire = new THREE.Mesh(new THREE.TubeGeometry(wireCurve, 6, 0.003, 6), mats.rubberMat);
    potGroup.add(wire);

    // 2. Infrared Non-Contact Brake Rotor Temperature Sensor
    const irSensorGeo = new THREE.BoxGeometry(0.016, 0.022, 0.035);
    const irSensor = new THREE.Mesh(irSensorGeo, mats.anodizedRedMat);
    irSensor.position.set(c.x < 0 ? -0.16 : 0.16, -0.06, 0);
    potGroup.add(irSensor);

    group.add(potGroup);
  }

  // 3. Hypercar Slotted Floor Edge Scroll Wings (Side Aerodynamic Vortex Curls)
  for (const sx of [-1, 1]) {
    const scrollCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * 0.94, 0.08, -0.65),
      new THREE.Vector3(sx * 0.96, 0.12, 0.0),
      new THREE.Vector3(sx * 0.94, 0.10, 0.65),
    ]);
    const scrollGeo = new THREE.TubeGeometry(scrollCurve, 16, 0.018, 8);
    scrollGeo.scale(1.0, 0.3, 1.0);
    const scrollMesh = new THREE.Mesh(scrollGeo, mats.carbonMat);
    group.add(scrollMesh);

    // Aero Bleed Slots (Serrated edge fins)
    for (let s = -3; s <= 3; s++) {
      const slotGeo = new THREE.BoxGeometry(0.025, 0.025, 0.006);
      const slotMesh = new THREE.Mesh(slotGeo, mats.carbonMat);
      slotMesh.position.set(sx * 0.96, 0.11, s * 0.15);
      slotMesh.rotation.y = sx * 0.25;
      group.add(slotMesh);
    }
  }

  return group;
}
