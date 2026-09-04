// ============================================================================
// DRS ACTUATOR, HOOD NACA DUCTS, DRINK SYSTEM & ROTOR WEAR SENSORS MESH
// ============================================================================
// Extreme detail Le Mans Hypercar & GT3 motorsport subassemblies:
// 1. DRS Actuator Ram & Wing Flap Bearings: Hydraulic DRS ram actuator cylinder,
//    dual sealed spherical bearing pivot brackets on rear wing flap.
// 2. Driver Drink Bottle & Carbon Footboard: Insulated aluminum drink canister,
//    miniature electric pump, clear silicone hose, slotted carbon footboard.
// 3. Hood NACA Ducts & Radiator Debris Wire Screens: Recessed carbon NACA ducts,
//    woven stainless wire mesh screens across front bumper radiator inlets.
// 4. Rotor Wear Sensor Pins & Infrared Hub Sensors: Ceramic disc wear pins,
//    infrared brake rotor surface temperature sensor brackets on all 4 hubs.
// 5. Exhaust Slip-Joint Tension Springs & Lambda Plugs: Swivel retention springs
//    securing exhaust slip-joints, pre/post cat hexagonal sealing bungs.
// ============================================================================

import * as THREE from 'three';

export interface AeroDrsMaterials {
  carbonMat: THREE.Material;
  chromeMat: THREE.Material;
  anodizedRedMat: THREE.Material;
  anodizedBlueMat: THREE.Material;
  aluminumMat: THREE.Material;
  titaniumMat: THREE.Material;
  drinkBottleMat: THREE.Material;
  siliconeTubeMat: THREE.Material;
  wireScreenMat: THREE.Material;
}

export function createDefaultAeroDrsMaterials(): AeroDrsMaterials {
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
    drinkBottleMat: new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Insulated thermal blue bottle
      roughness: 0.40,
      metalness: 0.60,
      name: 'Driver_Drink_Canister',
    }),
    siliconeTubeMat: new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transmission: 0.85,
      opacity: 0.90,
      transparent: true,
      roughness: 0.15,
      name: 'Clear_Silicone_Drink_Tube',
    }),
    wireScreenMat: new THREE.MeshStandardMaterial({
      color: 0x475569,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
      name: 'Radiator_Wire_Screen',
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ACTIVE DRS ACTUATOR RAM & WING FLAP PIVOT BEARINGS
// ─────────────────────────────────────────────────────────────────────────────
export function generateDrsActuatorAndFlapBearingsMesh(
  mats: AeroDrsMaterials = createDefaultAeroDrsMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'DRS_Actuator_Flap_Bearings_Assembly';
  group.position.set(0, 1.15, 2.12);

  // 1. Central Hydraulic DRS Actuation Cylinder Ram
  const cylinderGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.09, 16);
  cylinderGeo.rotateX(Math.PI / 2);
  const cylinder = new THREE.Mesh(cylinderGeo, mats.aluminumMat);
  group.add(cylinder);

  const ramShaftGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.06, 12);
  ramShaftGeo.rotateX(Math.PI / 2);
  const ramShaft = new THREE.Mesh(ramShaftGeo, mats.chromeMat);
  ramShaft.position.set(0, 0, 0.05);
  group.add(ramShaft);

  // Hydraulic Fluid Lines feeding the ram
  for (const sx of [-0.018, 0.018]) {
    const lineGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.045, 6);
    const line = new THREE.Mesh(lineGeo, mats.anodizedBlueMat);
    line.position.set(sx, -0.015, -0.01);
    group.add(line);
  }

  // 2. Dual Sealed Spherical Bearing Pivot Brackets on Wing Flap Ends
  for (const sx of [-0.88, 0.88]) {
    const bracketGeo = new THREE.BoxGeometry(0.018, 0.035, 0.045);
    const bracket = new THREE.Mesh(bracketGeo, mats.anodizedRedMat);
    bracket.position.set(sx, 0.02, 0.04);
    group.add(bracket);

    const bearingGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.024, 12);
    bearingGeo.rotateZ(Math.PI / 2);
    const bearing = new THREE.Mesh(bearingGeo, mats.chromeMat);
    bearing.position.set(sx, 0.02, 0.04);
    group.add(bearing);
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DRIVER DRINK BOTTLE & CARBON FOOTBOARD
// ─────────────────────────────────────────────────────────────────────────────
export function generateDriverDrinkBottleAndFootboardMesh(
  mats: AeroDrsMaterials = createDefaultAeroDrsMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Drink_Bottle_Footboard_Assembly';

  // 1. Insulated Driver Drink Canister (Mounted to Roll Cage Center Bar)
  const bottleGroup = new THREE.Group();
  bottleGroup.position.set(0.18, 0.72, -0.15);

  const bottleGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.22, 16);
  const bottle = new THREE.Mesh(bottleGeo, mats.drinkBottleMat);
  bottleGroup.add(bottle);

  // Billet Top Cap & Quick-Connect Fitting
  const capGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.03, 12);
  const cap = new THREE.Mesh(capGeo, mats.anodizedRedMat);
  cap.position.set(0, 0.12, 0);
  bottleGroup.add(cap);

  // Clear Silicone Drink Tube routing to Steering Column
  const tubeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.13, 0),
    new THREE.Vector3(-0.10, 0.10, -0.15),
    new THREE.Vector3(-0.25, 0.05, -0.28),
  ]);
  const tubeGeo = new THREE.TubeGeometry(tubeCurve, 12, 0.005, 8);
  const tube = new THREE.Mesh(tubeGeo, mats.siliconeTubeMat);
  bottleGroup.add(tube);

  group.add(bottleGroup);

  // 2. Slotted Carbon Fiber Driver Heel Rest Footboard
  const footboardGroup = new THREE.Group();
  footboardGroup.position.set(-0.35, 0.22, -0.75);
  footboardGroup.rotation.x = -0.25;

  const boardGeo = new THREE.BoxGeometry(0.28, 0.010, 0.26);
  const board = new THREE.Mesh(boardGeo, mats.carbonMat);
  footboardGroup.add(board);

  // Aluminum Corner Mounting Stand-offs
  for (const bx of [-0.12, 0.12]) {
    for (const bz of [-0.11, 0.11]) {
      const standoffGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.025, 8);
      const standoff = new THREE.Mesh(standoffGeo, mats.aluminumMat);
      standoff.position.set(bx, -0.015, bz);
      footboardGroup.add(standoff);
    }
  }

  group.add(footboardGroup);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. HOOD NACA DUCTS & RADIATOR DEBRIS SCREENS
// ─────────────────────────────────────────────────────────────────────────────
export function generateHoodNacaDuctsAndRadiatorScreensMesh(
  mats: AeroDrsMaterials = createDefaultAeroDrsMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Hood_Naca_Radiator_Screens_Assembly';

  // 1. Dual Flush-Molded Carbon NACA Ducts on Front Hood
  for (const sx of [-0.22, 0.22]) {
    const nacaShape = new THREE.Shape();
    nacaShape.moveTo(0, 0);
    nacaShape.lineTo(0.035, 0.16);
    nacaShape.lineTo(-0.035, 0.16);
    nacaShape.closePath();

    const nacaGeo = new THREE.ExtrudeGeometry(nacaShape, {
      depth: 0.025,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.004,
      bevelThickness: 0.004,
    });
    nacaGeo.rotateX(Math.PI / 2 + 0.18);
    const naca = new THREE.Mesh(nacaGeo, mats.carbonMat);
    naca.position.set(sx, 0.65, -1.45);
    group.add(naca);
  }

  // 2. Protective Stainless Wire Mesh Screens across Front Radiator Inlets
  const screenGeo = new THREE.PlaneGeometry(1.05, 0.22);
  const screen = new THREE.Mesh(screenGeo, mats.wireScreenMat);
  screen.position.set(0, 0.35, -2.25);
  group.add(screen);

  // Left & Right Cheek Brake Duct Screens
  for (const sx of [-0.75, 0.75]) {
    const cheekScreenGeo = new THREE.PlaneGeometry(0.25, 0.16);
    const cheekScreen = new THREE.Mesh(cheekScreenGeo, mats.wireScreenMat);
    cheekScreen.position.set(sx, 0.30, -2.18);
    cheekScreen.rotation.y = sx < 0 ? 0.35 : -0.35;
    group.add(cheekScreen);
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. BRAKE ROTOR WEAR PINS & INFRARED HUB SENSORS
// ─────────────────────────────────────────────────────────────────────────────
export function generateRotorWearSensorsAndHubInfraredMesh(
  mats: AeroDrsMaterials = createDefaultAeroDrsMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Rotor_Wear_Infrared_Assembly';

  const wheelCorners = [
    { x: -0.84, z: -1.35, isLeft: true },
    { x: 0.84, z: -1.35, isLeft: false },
    { x: -0.86, z: 1.35, isLeft: true },
    { x: 0.86, z: 1.35, isLeft: false },
  ];

  for (const w of wheelCorners) {
    const hubGroup = new THREE.Group();
    hubGroup.position.set(w.x, 0.34, w.z);

    // 1. Infrared Brake Rotor Surface Temperature Sensor Bracket
    const sensorGeo = new THREE.BoxGeometry(0.024, 0.016, 0.035);
    const sensor = new THREE.Mesh(sensorGeo, mats.anodizedBlueMat);
    sensor.position.set(w.isLeft ? 0.03 : -0.03, 0.22, 0);
    hubGroup.add(sensor);

    // Sensor Optical Eye pointing down onto the disc track
    const eyeGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.008, 8);
    const eye = new THREE.Mesh(eyeGeo, mats.chromeMat);
    eye.position.set(w.isLeft ? 0.03 : -0.03, 0.21, 0);
    hubGroup.add(eye);

    // 2. Ceramic Disc Minimum Thickness Wear Sensor Pin Cavity
    const pinGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.018, 6);
    pinGeo.rotateZ(Math.PI / 2);
    const pin = new THREE.Mesh(pinGeo, mats.titaniumMat);
    pin.position.set(w.isLeft ? 0.04 : -0.04, 0.16, -0.08);
    hubGroup.add(pin);

    group.add(hubGroup);
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. EXHAUST SLIP-JOINT SPRINGS & PRE/POST CAT LAMBDA BUNGS
// ─────────────────────────────────────────────────────────────────────────────
export function generateExhaustSlipSpringsAndLambdaPlugsMesh(
  mats: AeroDrsMaterials = createDefaultAeroDrsMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Exhaust_Slip_Springs_Bungs_Assembly';

  // Left & Right Exhaust Mid-Pipes Slip Joints
  for (const sx of [-0.22, 0.22]) {
    // 1. Dual Swivel Retention Tension Springs holding slip-joints tight
    for (const sy of [-0.035, 0.035]) {
      const springCurve = new THREE.CatmullRomCurve3(
        Array.from({ length: 16 }, (_, i) => {
          const angle = (i / 16) * Math.PI * 6;
          const z = 1.15 + (i / 16) * 0.08;
          return new THREE.Vector3(sx + Math.cos(angle) * 0.005, 0.28 + sy, z);
        })
      );
      const spring = new THREE.Mesh(new THREE.TubeGeometry(springCurve, 16, 0.002, 6), mats.chromeMat);
      group.add(spring);

      // Spring Retention Hooks on Pipe
      for (const hz of [1.15, 1.23]) {
        const hookGeo = new THREE.TorusGeometry(0.004, 0.0015, 6, 8, Math.PI);
        const hook = new THREE.Mesh(hookGeo, mats.titaniumMat);
        hook.position.set(sx, 0.28 + sy, hz);
        group.add(hook);
      }
    }

    // 2. Pre-Cat & Post-Cat Hexagonal Sealing Bungs
    for (const bz of [1.05, 1.62]) {
      const bungGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.012, 6);
      const bung = new THREE.Mesh(bungGeo, mats.titaniumMat);
      bung.position.set(sx, 0.33, bz);
      group.add(bung);
    }
  }

  return group;
}
