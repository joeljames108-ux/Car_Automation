// ============================================================================
// DRY SUMP, INTERCOOLERS, PEDAL HYDRAULICS & ROOF SNORKEL MESH GENERATOR
// ============================================================================
// Ultra-high detail powertrain and aerodynamics assemblies for GLB vehicles:
// 1. Dry Sump Lubrication: Tall cylindrical reservoir tank, sight level glass,
//    breather catch can, multistage scavenge pump with toothed gilmer belt.
// 2. Dual Charge Coolers & Blow-Off Valves: Twin side-pod bar-and-plate intercoolers,
//    carbon air scoop funnels, dual billet atmospheric blow-off valves.
// 3. Pedal Box Master Cylinders: Triple Tilton-style cylinders (front/rear brake,
//    clutch) protruding through firewall, 3 translucent reservoirs with blue caps.
// 4. Dual-Tier Front Dive Planes & Splitter Venturi: Staggered carbon canards,
//    aerodynamic endplate fences, and under-splitter low-pressure ramps.
// 5. Roof Ram-Air Periscope Snorkel: LMP/GT3 style roof intake funneling ram-air
//    directly into the engine induction plenum, complete with debris mesh screen.
// ============================================================================

import * as THREE from 'three';

export interface DrySumpHydraulicsMaterials {
  carbonMat: THREE.Material;
  chromeMat: THREE.Material;
  anodizedRedMat: THREE.Material;
  anodizedBlueMat: THREE.Material;
  aluminumMat: THREE.Material;
  translucentFluidMat: THREE.Material;
  rubberMat: THREE.Material;
  goldMat: THREE.Material;
  wireScreenMat: THREE.Material;
}

export function createDefaultDrySumpMaterials(): DrySumpHydraulicsMaterials {
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
    translucentFluidMat: new THREE.MeshPhysicalMaterial({
      color: 0xfef08a, // Pale golden brake fluid / oil
      roughness: 0.10,
      transmission: 0.80,
      thickness: 0.04,
      transparent: true,
      opacity: 0.85,
      name: 'Translucent_Brake_Fluid',
    }),
    rubberMat: new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.90,
      metalness: 0.05,
      name: 'Toothed_Gilmer_Belt',
    }),
    goldMat: new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      roughness: 0.15,
      metalness: 0.92,
      clearcoat: 0.8,
      name: 'Gold_Reflective_Foil',
    }),
    wireScreenMat: new THREE.MeshStandardMaterial({
      color: 0x334155,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
      name: 'Snorkel_Debris_Screen',
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. DRY SUMP LUBRICATION TANK, CATCH CAN & SCAVENGE PUMP
// ─────────────────────────────────────────────────────────────────────────────
export function generateDrySumpLubricationAndCatchCanMesh(
  mats: DrySumpHydraulicsMaterials = createDefaultDrySumpMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Dry_Sump_Lubrication_Assembly';

  // 1. Cylindrical Aluminum Dry Sump Oil Tank (Right Rear Quarter of Engine Bay)
  const tankGroup = new THREE.Group();
  tankGroup.position.set(0.46, 0.58, 0.45);

  const tankGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.44, 24);
  const tankMesh = new THREE.Mesh(tankGeo, mats.aluminumMat);
  tankGroup.add(tankMesh);

  // Billet Baffled Cap
  const capGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.025, 16);
  const cap = new THREE.Mesh(capGeo, mats.anodizedBlueMat);
  cap.position.set(0, 0.23, 0);
  tankGroup.add(cap);

  // Oil Level Sight Tube
  const sightGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.32, 12);
  const sight = new THREE.Mesh(sightGeo, mats.translucentFluidMat);
  sight.position.set(0.095, 0, 0);
  tankGroup.add(sight);

  // 2. Breather Catch Can with Filter Breather Cone
  const catchCanGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.16, 16);
  const catchCan = new THREE.Mesh(catchCanGeo, mats.aluminumMat);
  catchCan.position.set(0.14, 0.08, 0);
  tankGroup.add(catchCan);

  const filterConeGeo = new THREE.ConeGeometry(0.035, 0.07, 16);
  const filterCone = new THREE.Mesh(filterConeGeo, mats.anodizedRedMat);
  filterCone.position.set(0.14, 0.20, 0);
  tankGroup.add(filterCone);

  group.add(tankGroup);

  // 3. Multistage Billet Scavenge Pump with Toothed Gilmer Belt
  const pumpGroup = new THREE.Group();
  pumpGroup.position.set(0.24, 0.25, 0.95);

  const pumpGeo = new THREE.BoxGeometry(0.14, 0.09, 0.22);
  const pump = new THREE.Mesh(pumpGeo, mats.aluminumMat);
  pumpGroup.add(pump);

  // Toothed Gilmer Drive Pulley
  const pulleyGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.025, 24);
  pulleyGeo.rotateX(Math.PI / 2);
  const pulley = new THREE.Mesh(pulleyGeo, mats.anodizedBlueMat);
  pulley.position.set(0, 0, 0.12);
  pumpGroup.add(pulley);

  // Gilmer Belt Loop
  const beltGeo = new THREE.TorusGeometry(0.052, 0.008, 8, 24);
  const belt = new THREE.Mesh(beltGeo, mats.rubberMat);
  belt.position.set(0, 0, 0.12);
  pumpGroup.add(belt);

  // AN-12 Stainless Braided Oil Return Line to Tank
  const returnCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.12, 0.15, -0.22),
    new THREE.Vector3(0.22, 0.33, -0.50),
  ]);
  const returnLine = new THREE.Mesh(new THREE.TubeGeometry(returnCurve, 12, 0.015, 8), mats.chromeMat);
  pumpGroup.add(returnLine);

  group.add(pumpGroup);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DUAL SIDE-POD INTERCOOLERS & BLOW-OFF VALVES
// ─────────────────────────────────────────────────────────────────────────────
export function generateTwinIntercoolersAndBlowOffValvesMesh(
  mats: DrySumpHydraulicsMaterials = createDefaultDrySumpMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Twin_Intercoolers_BlowOff_Valves_Assembly';

  // Left & Right Side-Pod Intercoolers
  for (const sx of [-1, 1]) {
    const icGroup = new THREE.Group();
    icGroup.name = `Intercooler_${sx < 0 ? 'LH' : 'RH'}`;
    icGroup.position.set(sx * 0.74, 0.38, 0.42);
    icGroup.rotation.y = sx * 0.18;

    // Bar-and-Plate Aluminum Intercooler Core
    const coreGeo = new THREE.BoxGeometry(0.14, 0.28, 0.46);
    const core = new THREE.Mesh(coreGeo, mats.aluminumMat);
    icGroup.add(core);

    // Cast End Tanks (Inlet and Outlet)
    for (const sz of [-0.25, 0.25]) {
      const endTankGeo = new THREE.ConeGeometry(0.10, 0.14, 16);
      endTankGeo.rotateZ(sx * Math.PI / 2);
      const endTank = new THREE.Mesh(endTankGeo, mats.aluminumMat);
      endTank.position.set(0, 0, sz);
      icGroup.add(endTank);
    }

    // Carbon Fiber Ram Air Inlet Funnel Scoop
    const scoopGeo = new THREE.BoxGeometry(0.08, 0.32, 0.52);
    const scoop = new THREE.Mesh(scoopGeo, mats.carbonMat);
    scoop.position.set(sx * 0.10, 0, 0);
    icGroup.add(scoop);

    // Atmospheric Blow-Off Valve (BOV) with Trumpet Horn
    const bovGroup = new THREE.Group();
    bovGroup.position.set(0, 0.18, 0.22);

    const bovBodyGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.06, 16);
    const bovBody = new THREE.Mesh(bovBodyGeo, mats.anodizedRedMat);
    bovGroup.add(bovBody);

    const trumpetGeo = new THREE.ConeGeometry(0.028, 0.04, 16, 1, true);
    trumpetGeo.rotateX(Math.PI / 2);
    const trumpet = new THREE.Mesh(trumpetGeo, mats.chromeMat);
    trumpet.position.set(0, 0.04, 0.02);
    bovGroup.add(trumpet);

    icGroup.add(bovGroup);

    group.add(icGroup);
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. COCKPIT BULKHEAD MASTER CYLINDERS & FLUID RESERVOIRS
// ─────────────────────────────────────────────────────────────────────────────
export function generatePedalBoxBulkheadMasterCylindersMesh(
  mats: DrySumpHydraulicsMaterials = createDefaultDrySumpMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Pedal_Bulkhead_Master_Cylinders_Assembly';
  group.position.set(-0.35, 0.54, -0.92);

  // Triple Tilton-Style Master Cylinders (Front Brake, Rear Brake, Clutch)
  for (let c = -1; c <= 1; c++) {
    const mcGroup = new THREE.Group();
    mcGroup.position.set(c * 0.065, 0, 0);

    // Master Cylinder Body
    const bodyGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.12, 12);
    bodyGeo.rotateX(Math.PI / 2);
    const body = new THREE.Mesh(bodyGeo, mats.aluminumMat);
    mcGroup.add(body);

    // Actuating Pushrod
    const rodGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.08, 8);
    rodGeo.rotateX(Math.PI / 2);
    const rod = new THREE.Mesh(rodGeo, mats.chromeMat);
    rod.position.set(0, 0, 0.08);
    mcGroup.add(rod);

    // Translucent Fluid Reservoir Bottle
    const resGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.075, 16);
    const res = new THREE.Mesh(resGeo, mats.translucentFluidMat);
    res.position.set(0, 0.08, -0.02);
    mcGroup.add(res);

    // Blue Anodized Cap
    const capGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.015, 16);
    const cap = new THREE.Mesh(capGeo, mats.anodizedBlueMat);
    cap.position.set(0, 0.125, -0.02);
    mcGroup.add(cap);

    group.add(mcGroup);
  }

  // Remote Cockpit Brake Bias Adjuster Cable & Yellow Dial Knob
  const cableCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.12, 0.08, 0.25),
    new THREE.Vector3(0.24, 0.12, 0.45), // Enters center dashboard
  ]);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(cableCurve, 10, 0.004, 6), mats.rubberMat);
  group.add(cable);

  const knobGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.02, 16);
  knobGeo.rotateX(Math.PI / 2);
  const knob = new THREE.Mesh(knobGeo, mats.goldMat);
  knob.position.set(0.24, 0.12, 0.46);
  group.add(knob);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. DUAL-TIER FRONT DIVE PLANES & SPLITTER VENTURI RAMPS
// ─────────────────────────────────────────────────────────────────────────────
export function generateDualTierDivePlanesAndFrontVenturiMesh(
  mats: DrySumpHydraulicsMaterials = createDefaultDrySumpMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Dual_Tier_Dive_Planes_Venturi_Assembly';

  // Dual-Tier Carbon Dive Planes (Canards) on Left & Right Front Bumper Shoulders
  for (const sx of [-1, 1]) {
    for (let tier = 0; tier < 2; tier++) {
      const planeShape = new THREE.Shape();
      planeShape.moveTo(0, 0);
      planeShape.lineTo(0.18, 0.05);
      planeShape.lineTo(0.14, 0.22);
      planeShape.lineTo(0, 0.16);
      planeShape.closePath();

      const planeGeo = new THREE.ExtrudeGeometry(planeShape, {
        depth: 0.006,
        bevelEnabled: false,
      });
      const plane = new THREE.Mesh(planeGeo, mats.carbonMat);
      plane.position.set(sx * 0.82, 0.32 + tier * 0.14, -1.85 + tier * 0.08);
      plane.rotation.y = sx < 0 ? -Math.PI / 2.2 : Math.PI / 2.2;
      plane.rotation.z = sx * 0.18;
      group.add(plane);

      // Vertical Vortex Fence Endplate
      const fenceGeo = new THREE.BoxGeometry(0.006, 0.045, 0.18);
      const fence = new THREE.Mesh(fenceGeo, mats.carbonMat);
      fence.position.set(sx * 0.94, 0.34 + tier * 0.14, -1.80 + tier * 0.08);
      group.add(fence);
    }

    // Splitter Under-Tunnels (Front Venturi Ramps)
    const rampCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * 0.45, 0.06, -2.10),
      new THREE.Vector3(sx * 0.52, 0.12, -1.75),
      new THREE.Vector3(sx * 0.65, 0.20, -1.45),
    ]);
    const rampGeo = new THREE.TubeGeometry(rampCurve, 12, 0.045, 8);
    rampGeo.scale(1.6, 0.3, 1.0);
    const ramp = new THREE.Mesh(rampGeo, mats.carbonMat);
    group.add(ramp);
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. ROOF RAM-AIR PERISCOPE SNORKEL INTAKE
// ─────────────────────────────────────────────────────────────────────────────
export function generateRoofRamAirSnorkelMesh(
  mats: DrySumpHydraulicsMaterials = createDefaultDrySumpMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Roof_Ram_Air_Snorkel_Assembly';
  group.position.set(0, 1.18, 0.15);

  // Aerodynamic Carbon Periscope Scoop Shroud
  const snorkelShape = new THREE.Shape();
  snorkelShape.moveTo(-0.16, 0);
  snorkelShape.quadraticCurveTo(0, 0.12, 0.16, 0);
  snorkelShape.lineTo(0.14, -0.06);
  snorkelShape.lineTo(-0.14, -0.06);
  snorkelShape.closePath();

  const snorkelGeo = new THREE.ExtrudeGeometry(snorkelShape, {
    depth: 0.65,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.008,
    bevelSegments: 4,
  });
  const snorkel = new THREE.Mesh(snorkelGeo, mats.carbonMat);
  snorkel.rotation.y = Math.PI;
  snorkel.position.set(0, 0, 0.32);
  group.add(snorkel);

  // Wire Mesh Debris Ingestion Screen
  const screenGeo = new THREE.PlaneGeometry(0.28, 0.14);
  const screen = new THREE.Mesh(screenGeo, mats.wireScreenMat);
  screen.position.set(0, 0.03, -0.32);
  group.add(screen);

  // Central Internal Air Divider Strake
  const strakeGeo = new THREE.BoxGeometry(0.008, 0.12, 0.45);
  const strake = new THREE.Mesh(strakeGeo, mats.carbonMat);
  strake.position.set(0, 0.02, -0.10);
  group.add(strake);

  return group;
}
