// ============================================================================
// WINGLET GURNEY, COCKPIT MONITORS, CATCH TANKS & SPLITTER SKIDS MESH
// ============================================================================
// Precision endurance racing & hypercar mechanical detailing:
// 1. Wing Endplate Dive Winglets & Gurney Screws: Horizontal vortex winglets,
//    16 Torx screws securing the carbon Gurney flap along the wing span.
// 2. Cockpit Electronic Rearview & A-Pillar Monitors: Wide-aspect digital mirror,
//    dual A-pillar camera display pods with anti-glare sun visors.
// 3. Emergency Master Cutoff & FIA Fabric Tow Straps: Windshield cowl T-handle
//    pull rings, front/rear high-strength red embroidered fabric tow loops.
// 4. Billet Oil Catch Tanks & Breather Filters: Dual baffled catch reservoirs,
//    fluted cone breather filters, AN-16 crankcase ventilation lines.
// 5. Front Splitter Venturi Ramps & Titanium Skid Strips: Upward diffuser ramps,
//    6 sacrificial titanium wear plates with countersunk fasteners.
// ============================================================================

import * as THREE from 'three';

export interface EnduranceAeroMaterials {
  carbonMat: THREE.Material;
  chromeMat: THREE.Material;
  anodizedRedMat: THREE.Material;
  anodizedBlueMat: THREE.Material;
  aluminumMat: THREE.Material;
  titaniumMat: THREE.Material;
  screenGlowMat: THREE.Material;
  fabricStrapMat: THREE.Material;
  filterMat: THREE.Material;
}

export function createDefaultEnduranceMaterials(): EnduranceAeroMaterials {
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
    screenGlowMat: new THREE.MeshBasicMaterial({
      color: 0x38bdf8, // Active digital display glow
      name: 'Digital_Screen_Display',
    }),
    fabricStrapMat: new THREE.MeshStandardMaterial({
      color: 0xb91c1c, // Heavy-duty red nylon FIA strap
      roughness: 0.90,
      metalness: 0.05,
      name: 'FIA_Tow_Strap_Fabric',
    }),
    filterMat: new THREE.MeshStandardMaterial({
      color: 0x1e3a8a, // Blue cotton air/oil breather filter
      roughness: 0.80,
      metalness: 0.15,
      name: 'Breather_Filter_Element',
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. WING ENDPLATE DIVE WINGLETS & GURNEY SCREWS
// ─────────────────────────────────────────────────────────────────────────────
export function generateWingletGurneyAndFastenersMesh(
  mats: EnduranceAeroMaterials = createDefaultEnduranceMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Winglet_Gurney_Fasteners_Assembly';

  // 1. Dual Horizontal Dive Winglets on Rear Wing Endplates (Left & Right)
  for (const sx of [-0.965, 0.965]) {
    for (const wy of [0.96, 1.04]) {
      const wingletGeo = new THREE.BoxGeometry(0.12, 0.008, 0.16);
      const winglet = new THREE.Mesh(wingletGeo, mats.carbonMat);
      winglet.position.set(sx + (sx < 0 ? -0.06 : 0.06), wy, 2.12);
      winglet.rotation.x = -0.12;
      group.add(winglet);
    }
  }

  // 2. 16 Torx Retaining Screws securing the Rear Wing Gurney Flap along the span
  for (let s = -7; s <= 7; s++) {
    const screwGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.008, 6);
    screwGeo.rotateX(Math.PI / 2);
    const screw = new THREE.Mesh(screwGeo, mats.titaniumMat);
    screw.position.set(s * 0.11, 1.16, 2.22);
    group.add(screw);
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. COCKPIT DIGITAL REARVIEW & A-PILLAR CAMERA MONITORS
// ─────────────────────────────────────────────────────────────────────────────
export function generateCockpitDigitalCamerasAndMonitorsMesh(
  mats: EnduranceAeroMaterials = createDefaultEnduranceMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Digital_Cameras_Monitors_Assembly';

  // 1. Wide-Aspect Digital Rearview Camera Screen (Windshield Header)
  const mirrorGroup = new THREE.Group();
  mirrorGroup.position.set(0, 0.92, -0.28);
  mirrorGroup.rotation.x = 0.22;

  const mirrorBezelGeo = new THREE.BoxGeometry(0.22, 0.065, 0.015);
  const mirrorBezel = new THREE.Mesh(mirrorBezelGeo, mats.carbonMat);
  mirrorGroup.add(mirrorBezel);

  const mirrorScreenGeo = new THREE.PlaneGeometry(0.20, 0.052);
  const mirrorScreen = new THREE.Mesh(mirrorScreenGeo, mats.screenGlowMat);
  mirrorScreen.position.set(0, 0, 0.009);
  mirrorGroup.add(mirrorScreen);

  group.add(mirrorGroup);

  // 2. Dual A-Pillar Blindspot Display Monitors (Endurance Spec)
  for (const sx of [-0.46, 0.46]) {
    const podGroup = new THREE.Group();
    podGroup.position.set(sx, 0.72, -0.42);
    podGroup.rotation.y = sx < 0 ? 0.45 : -0.45;

    const podGeo = new THREE.BoxGeometry(0.09, 0.12, 0.02);
    const pod = new THREE.Mesh(podGeo, mats.carbonMat);
    podGroup.add(pod);

    const podScreenGeo = new THREE.PlaneGeometry(0.075, 0.10);
    const podScreen = new THREE.Mesh(podScreenGeo, mats.screenGlowMat);
    podScreen.position.set(0, 0, 0.011);
    podGroup.add(podScreen);

    group.add(podGroup);
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. EMERGENCY MASTER CUTOFF & FIA FABRIC TOW STRAPS
// ─────────────────────────────────────────────────────────────────────────────
export function generateEmergencyCutoffAndFabricTowStrapsMesh(
  mats: EnduranceAeroMaterials = createDefaultEnduranceMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Emergency_Cutoff_Tow_Straps_Assembly';

  // 1. Windshield Cowl Emergency Master Battery Cutoff & Fire Pull T-Handles
  const cowlGroup = new THREE.Group();
  cowlGroup.position.set(-0.35, 0.74, -1.05);

  for (const sx of [-0.035, 0.035]) {
    // Red Pull Ring Handle
    const ringGeo = new THREE.TorusGeometry(0.014, 0.003, 8, 16);
    const ring = new THREE.Mesh(ringGeo, mats.anodizedRedMat);
    ring.position.set(sx, 0.02, 0);
    ring.rotation.x = Math.PI / 4;
    cowlGroup.add(ring);

    // Cable Sleeve Conduit
    const sleeveGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.03, 8);
    const sleeve = new THREE.Mesh(sleeveGeo, mats.aluminumMat);
    sleeve.position.set(sx, 0.005, 0);
    cowlGroup.add(sleeve);
  }
  group.add(cowlGroup);

  // 2. Embroidered Red Fabric Tow Straps (Front & Rear Bumpers)
  for (const pos of [
    { x: -0.38, y: 0.26, z: -2.28, rz: 0.15 }, // Front bumper tow loop
    { x: 0.38, y: 0.28, z: 2.22, rz: -0.15 },  // Rear bumper tow loop
  ]) {
    const strapGeo = new THREE.BoxGeometry(0.042, 0.14, 0.005);
    const strap = new THREE.Mesh(strapGeo, mats.fabricStrapMat);
    strap.position.set(pos.x, pos.y, pos.z);
    strap.rotation.z = pos.rz;
    group.add(strap);

    // Steel Mounting Bracket Loop
    const brkGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.05, 8);
    brkGeo.rotateZ(Math.PI / 2);
    const brk = new THREE.Mesh(brkGeo, mats.titaniumMat);
    brk.position.set(pos.x, pos.y - 0.06, pos.z);
    group.add(brk);
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. BILLET ALUMINUM OIL CATCH TANK & CONE BREATHER FILTERS
// ─────────────────────────────────────────────────────────────────────────────
export function generateBilletOilCatchTankAndBreathersMesh(
  mats: EnduranceAeroMaterials = createDefaultEnduranceMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Catch_Tank_Breathers_Assembly';
  group.position.set(-0.38, 0.52, 0.45);

  // 1. Dual Billet Aluminum Catch Tank Cylinders
  for (const sx of [-0.045, 0.045]) {
    const canGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.14, 16);
    const can = new THREE.Mesh(canGeo, mats.aluminumMat);
    can.position.set(sx, 0, 0);
    group.add(can);

    // Top Conical Breather Filter
    const filterGeo = new THREE.ConeGeometry(0.028, 0.045, 12);
    const filter = new THREE.Mesh(filterGeo, mats.filterMat);
    filter.position.set(sx, 0.09, 0);
    group.add(filter);

    // Chrome Top Cap
    const capGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.008, 12);
    const cap = new THREE.Mesh(capGeo, mats.chromeMat);
    cap.position.set(sx, 0.115, 0);
    group.add(cap);
  }

  // 2. Braided AN-16 Vent Hoses connecting to Engine Cam Covers
  const hoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.02, 0),
    new THREE.Vector3(0.12, 0.04, 0.12),
    new THREE.Vector3(0.24, 0.02, 0.28),
  ]);
  const hoseGeo = new THREE.TubeGeometry(hoseCurve, 10, 0.010, 8);
  const hose = new THREE.Mesh(hoseGeo, mats.carbonMat);
  group.add(hose);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. FRONT SPLITTER VENTURI RAMPS & TITANIUM SKID STRIPS
// ─────────────────────────────────────────────────────────────────────────────
export function generateFrontSplitterRampsAndSkidPlatesMesh(
  mats: EnduranceAeroMaterials = createDefaultEnduranceMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Splitter_Ramps_Skids_Assembly';

  // 1. Dual Upward-Sloping Front Venturi Diffuser Ramps (Under Splitter)
  for (const sx of [-0.48, 0.48]) {
    const rampShape = new THREE.Shape();
    rampShape.moveTo(0, 0);
    rampShape.lineTo(0.24, 0);
    rampShape.lineTo(0.24, 0.038);
    rampShape.lineTo(0, 0);
    rampShape.closePath();

    const rampGeo = new THREE.ExtrudeGeometry(rampShape, {
      depth: 0.38,
      bevelEnabled: false,
    });
    rampGeo.translate(-0.12, 0, -0.19);
    const ramp = new THREE.Mesh(rampGeo, mats.carbonMat);
    ramp.position.set(sx, 0.065, -1.95);
    group.add(ramp);
  }

  // 2. 6 Sacrificial Titanium Skid Plates (Leading Edge Bottom)
  for (let p = -2; p <= 3; p++) {
    const plateGeo = new THREE.BoxGeometry(0.12, 0.005, 0.04);
    const plate = new THREE.Mesh(plateGeo, mats.titaniumMat);
    plate.position.set((p - 0.5) * 0.22, 0.045, -2.22);
    group.add(plate);

    // Countersunk Fastener Screws
    for (const bx of [-0.04, 0.04]) {
      const screwGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.006, 6);
      const screw = new THREE.Mesh(screwGeo, mats.chromeMat);
      screw.position.set((p - 0.5) * 0.22 + bx, 0.042, -2.22);
      group.add(screw);
    }
  }

  return group;
}
