// ============================================================================
// SPLITTER STRUTS, TURBO BLANKETS, SHIFTER LINKAGE & CALIPER BRIDGES MESH
// ============================================================================
// High-density race-grade automotive mechanical and aerodynamic detailing:
// 1. Splitter Turnbuckles & Keel: Adjustable titanium support turnbuckle struts,
//    central aerodynamic under-nose keel spine splitting front airflow.
// 2. Turbo Thermal Blankets & Water Lines: Titanium volcanic-fiber turbo beanies,
//    braided stainless water-cooling feed/return lines, AN fittings.
// 3. Sequential Shifter Linkage: Exposed CNC billet sequential shift gate,
//    return springs, microswitches, reverse lockout, passenger grooved heel plate.
// 4. Caliper Fluid Bridges & Pad Pins: External stainless steel crossover pipes,
//    pad retaining R-clips, anti-vibration pad damping shims on all 4 corners.
// 5. Wing Endplate Slotted Extractors: Multi-slot vortex diffuser fences,
//    rear bumper wheel wake exhaust cutouts with rock-guard wire mesh screens.
// ============================================================================

import * as THREE from 'three';

export interface DetailHardwareMaterials {
  carbonMat: THREE.Material;
  chromeMat: THREE.Material;
  anodizedRedMat: THREE.Material;
  anodizedBlueMat: THREE.Material;
  aluminumMat: THREE.Material;
  titaniumMat: THREE.Material;
  brassMat: THREE.Material;
  thermalBlanketMat: THREE.Material;
  wireScreenMat: THREE.Material;
}

export function createDefaultHardwareMaterials(): DetailHardwareMaterials {
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
    thermalBlanketMat: new THREE.MeshStandardMaterial({
      color: 0x78716c, // Titanium volcanic weave thermal insulation jacket
      roughness: 0.70,
      metalness: 0.45,
      name: 'Turbo_Thermal_Blanket',
    }),
    wireScreenMat: new THREE.MeshStandardMaterial({
      color: 0x334155,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
      name: 'Rock_Guard_Screen',
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SPLITTER TURNBUCKLE STRUTS & UNDER-NOSE AERODYNAMIC KEEL
// ─────────────────────────────────────────────────────────────────────────────
export function generateSplitterTurnbucklesAndKeelMesh(
  mats: DetailHardwareMaterials = createDefaultHardwareMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Splitter_Turnbuckles_Keel_Assembly';

  // Left & Right Adjustable Titanium Turnbuckle Support Struts
  for (const sx of [-0.38, 0.38]) {
    const strutCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx, 0.08, -2.18),  // Splitter leading edge anchor
      new THREE.Vector3(sx * 0.85, 0.22, -2.05), // Turnbuckle hex body
      new THREE.Vector3(sx * 0.70, 0.38, -1.95), // Front bumper beam clevis
    ]);
    const strutGeo = new THREE.TubeGeometry(strutCurve, 10, 0.007, 8);
    const strut = new THREE.Mesh(strutGeo, mats.titaniumMat);
    group.add(strut);

    // Turnbuckle Center Hex Adjuster Nut
    const nutGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.035, 6);
    nutGeo.rotateX(Math.PI / 4);
    const nut = new THREE.Mesh(nutGeo, mats.anodizedRedMat);
    nut.position.set(sx * 0.85, 0.22, -2.05);
    group.add(nut);

    // Clevis Brackets at Top and Bottom
    for (const pos of [new THREE.Vector3(sx, 0.08, -2.18), new THREE.Vector3(sx * 0.70, 0.38, -1.95)]) {
      const clevisGeo = new THREE.BoxGeometry(0.018, 0.024, 0.022);
      const clevis = new THREE.Mesh(clevisGeo, mats.aluminumMat);
      clevis.position.copy(pos);
      group.add(clevis);
    }
  }

  // Central Aerodynamic Under-Nose Keel Spine
  const keelCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.07, -2.18),
    new THREE.Vector3(0, 0.12, -1.85),
    new THREE.Vector3(0, 0.18, -1.55),
  ]);
  const keelGeo = new THREE.TubeGeometry(keelCurve, 12, 0.018, 4);
  keelGeo.scale(0.3, 2.5, 1.0);
  const keel = new THREE.Mesh(keelGeo, mats.carbonMat);
  group.add(keel);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TURBO THERMAL BLANKETS & WATER-COOLING LINES
// ─────────────────────────────────────────────────────────────────────────────
export function generateTurboThermalBlanketsAndWaterLinesMesh(
  mats: DetailHardwareMaterials = createDefaultHardwareMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Turbo_Blankets_Water_Lines_Assembly';

  // Left & Right Turbocharger Blanket Jackets & Water Cooling
  for (const sx of [-1, 1]) {
    const turboPos = new THREE.Vector3(sx * 0.42, 0.42, 0.82);

    // Volcanic Fiber Thermal Heat Blanket wrapping the turbine housing
    const blanketGeo = new THREE.TorusGeometry(0.082, 0.045, 12, 20, Math.PI * 1.5);
    blanketGeo.rotateY(sx * Math.PI / 2);
    const blanket = new THREE.Mesh(blanketGeo, mats.thermalBlanketMat);
    blanket.position.copy(turboPos);
    group.add(blanket);

    // Stainless Retaining Spring Lacing Wire
    const wireGeo = new THREE.TorusGeometry(0.088, 0.003, 6, 20);
    wireGeo.rotateY(sx * Math.PI / 2);
    const wire = new THREE.Mesh(wireGeo, mats.chromeMat);
    wire.position.copy(turboPos);
    group.add(wire);

    // Water-Cooling Feed and Return Lines (Braided stainless with blue/red AN fittings)
    for (let l = 0; l < 2; l++) {
      const lineCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(sx * 0.40, 0.48 + l * 0.03, 0.80),
        new THREE.Vector3(sx * 0.32, 0.52 + l * 0.02, 0.65),
        new THREE.Vector3(sx * 0.22, 0.45, 0.50), // Enters engine block coolant jacket
      ]);
      const lineGeo = new THREE.TubeGeometry(lineCurve, 10, 0.008, 8);
      const line = new THREE.Mesh(lineGeo, mats.chromeMat);
      group.add(line);

      // AN Fitting Hex Nut
      const anGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.02, 6);
      anGeo.rotateX(Math.PI / 2);
      const anNut = new THREE.Mesh(anGeo, l === 0 ? mats.anodizedBlueMat : mats.anodizedRedMat);
      anNut.position.set(sx * 0.40, 0.48 + l * 0.03, 0.80);
      group.add(anNut);
    }
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. EXPOSED SEQUENTIAL SHIFTER LINKAGE & PASSENGER HEEL PLATE
// ─────────────────────────────────────────────────────────────────────────────
export function generateSequentialShifterLinkageAndHeelPlateMesh(
  mats: DetailHardwareMaterials = createDefaultHardwareMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Shifter_Linkage_Heel_Plate_Assembly';

  // 1. Exposed CNC Billet Sequential Shift Gate Mechanism (Center Tunnel)
  const shiftGroup = new THREE.Group();
  shiftGroup.position.set(0, 0.45, -0.15);

  // Milled Aluminum Shift Base Plate
  const baseGeo = new THREE.BoxGeometry(0.09, 0.015, 0.22);
  const base = new THREE.Mesh(baseGeo, mats.aluminumMat);
  shiftGroup.add(base);

  // Shift Lever Pivot Clevis
  const pivotGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.045, 12);
  pivotGeo.rotateZ(Math.PI / 2);
  const pivot = new THREE.Mesh(pivotGeo, mats.anodizedRedMat);
  pivot.position.set(0, 0.03, 0);
  shiftGroup.add(pivot);

  // Sequential Centering Return Springs (Left & Right)
  for (const sx of [-0.025, 0.025]) {
    const springCurve = new THREE.CatmullRomCurve3(
      Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * Math.PI * 6;
        const z = -0.04 + (i / 20) * 0.08;
        return new THREE.Vector3(sx, Math.cos(angle) * 0.008 + 0.03, z);
      })
    );
    const spring = new THREE.Mesh(new THREE.TubeGeometry(springCurve, 20, 0.002, 6), mats.chromeMat);
    shiftGroup.add(spring);
  }

  // Reverse Lockout Collar
  const lockoutGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.025, 16);
  const lockout = new THREE.Mesh(lockoutGeo, mats.anodizedRedMat);
  lockout.position.set(0, 0.12, 0);
  shiftGroup.add(lockout);

  group.add(shiftGroup);

  // 2. Passenger Footwell CNC Aluminum Heel Plate with Grooved Tread
  const heelGroup = new THREE.Group();
  heelGroup.position.set(0.35, 0.23, -0.65);
  heelGroup.rotation.x = -0.22;

  const plateGeo = new THREE.BoxGeometry(0.28, 0.012, 0.32);
  const plate = new THREE.Mesh(plateGeo, mats.aluminumMat);
  heelGroup.add(plate);

  // Milled Traction Grooves
  for (let g = -3; g <= 3; g++) {
    const grooveGeo = new THREE.BoxGeometry(0.24, 0.004, 0.012);
    const groove = new THREE.Mesh(grooveGeo, mats.carbonMat);
    groove.position.set(0, 0.008, g * 0.04);
    heelGroup.add(groove);
  }

  group.add(heelGroup);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CALIPER STAINLESS CROSSOVER BRIDGES & PAD RETENTION PINS
// ─────────────────────────────────────────────────────────────────────────────
export function generateCaliperBridgesAndPadClipsMesh(
  mats: DetailHardwareMaterials = createDefaultHardwareMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Caliper_Bridges_Pad_Clips_Assembly';

  const caliperCorners = [
    { x: -0.84, z: -1.35, isLeft: true },
    { x: 0.84, z: -1.35, isLeft: false },
    { x: -0.86, z: 1.35, isLeft: true },
    { x: 0.86, z: 1.35, isLeft: false },
  ];

  for (const c of caliperCorners) {
    const cornerGroup = new THREE.Group();
    cornerGroup.position.set(c.x, 0.34, c.z);

    // 1. External Stainless Fluid Crossover Bridge Pipe (Connecting caliper halves)
    const bridgeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(c.isLeft ? 0.04 : -0.04, -0.08, -0.08),
      new THREE.Vector3(c.isLeft ? 0.06 : -0.06, -0.11, 0),
      new THREE.Vector3(c.isLeft ? 0.04 : -0.04, -0.08, 0.08),
    ]);
    const bridgeGeo = new THREE.TubeGeometry(bridgeCurve, 10, 0.004, 6);
    const bridge = new THREE.Mesh(bridgeGeo, mats.chromeMat);
    cornerGroup.add(bridge);

    // 2. Pad Retaining Cross-Pins with R-Clips (2 pins per caliper body)
    for (const pz of [-0.05, 0.05]) {
      const pinGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.08, 8);
      pinGeo.rotateZ(Math.PI / 2);
      const pin = new THREE.Mesh(pinGeo, mats.titaniumMat);
      pin.position.set(c.isLeft ? 0.02 : -0.02, 0.12, pz);
      cornerGroup.add(pin);

      // Spring-Steel R-Clip Pin Loop
      const clipGeo = new THREE.TorusGeometry(0.008, 0.002, 6, 12);
      const clip = new THREE.Mesh(clipGeo, mats.chromeMat);
      clip.position.set(c.isLeft ? 0.06 : -0.06, 0.12, pz);
      cornerGroup.add(clip);
    }

    group.add(cornerGroup);
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. REAR WING ENDPLATE SLOTTED AERO STRAKES & BUMPER WHEEL VENTS
// ─────────────────────────────────────────────────────────────────────────────
export function generateWingEndplateAeroStrakesAndTireVentsMesh(
  mats: DetailHardwareMaterials = createDefaultHardwareMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Wing_Endplate_Strakes_Tire_Vents_Assembly';

  // 1. Rear Wing Endplate Slotted Flow Extractors (Outer face of endplates)
  for (const sx of [-0.96, 0.96]) {
    for (let s = 0; s < 4; s++) {
      const strakeGeo = new THREE.BoxGeometry(0.006, 0.012, 0.18);
      const strake = new THREE.Mesh(strakeGeo, mats.carbonMat);
      strake.position.set(sx, 1.05 + s * 0.035, 2.15);
      strake.rotation.x = -0.15;
      group.add(strake);
    }
  }

  // 2. Rear Bumper Wheel Wake Tire Extraction Cutouts with Wire Mesh
  for (const sx of [-1, 1]) {
    const ventGroup = new THREE.Group();
    ventGroup.position.set(sx * 0.82, 0.42, 1.88);
    ventGroup.rotation.y = sx < 0 ? Math.PI / 4 : -Math.PI / 4;

    // Carbon Vent Bezel Frame
    const frameGeo = new THREE.BoxGeometry(0.18, 0.24, 0.02);
    const frame = new THREE.Mesh(frameGeo, mats.carbonMat);
    ventGroup.add(frame);

    // Protective Stainless Wire Mesh Screen
    const screenGeo = new THREE.PlaneGeometry(0.16, 0.22);
    const screen = new THREE.Mesh(screenGeo, mats.wireScreenMat);
    screen.position.set(0, 0, 0.012);
    ventGroup.add(screen);

    group.add(ventGroup);
  }

  return group;
}
