// ============================================================================
// DORSAL SHARK FIN, PNEUMATIC SHIFT, SEAT HALO & HUB DRIVE PINS MESH
// ============================================================================
// Advanced Le Mans Hypercar & GT3 high-fidelity mechanical & aero hardware:
// 1. Carbon Dorsal Shark Fin & Pitot Probe: High-speed yaw stabilization fin,
//    dual telemetry whip antennae, brass airspeed pitot tube with static ports.
// 2. Transaxle Pneumatic Shift Actuator & Gas Bottle: High-pressure carbon bottle,
//    pressure regulator dial gauge, bellhousing shift actuator cylinder.
// 3. FIA Racing Seat Head Halo Restraints & Brackets: Lateral head protection
//    wings, ventilated seat back slots, CNC aluminum side mount runners.
// 4. Center-Lock Wheel Drive Pins & Castellated Locknut: 5 drive pegs per hub,
//    slotted castellated spindle locknut with stainless cotter pin.
// 5. Exhaust Resonator Canisters & O2 Lambda Sensors: Expansion chambers with
//    stiffening ribs, wideband lambda sensors with threaded weld bungs.
// ============================================================================

import * as THREE from 'three';

export interface AeroShiftMaterials {
  carbonMat: THREE.Material;
  chromeMat: THREE.Material;
  anodizedRedMat: THREE.Material;
  anodizedBlueMat: THREE.Material;
  aluminumMat: THREE.Material;
  titaniumMat: THREE.Material;
  brassMat: THREE.Material;
  seatFoamMat: THREE.Material;
}

export function createDefaultAeroShiftMaterials(): AeroShiftMaterials {
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
    seatFoamMat: new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.92,
      metalness: 0.08,
      name: 'Seat_Upholstery_Fabric',
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CARBON DORSAL SHARK FIN, PITOT PROBE & TELEMETRY ANTENNAE
// ─────────────────────────────────────────────────────────────────────────────
export function generateDorsalSharkFinAndPitotMesh(
  mats: AeroShiftMaterials = createDefaultAeroShiftMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Dorsal_Shark_Fin_Pitot_Assembly';

  // 1. Carbon Fiber Dorsal Shark Fin (Spans from roof trailing edge to rear wing)
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0);
  finShape.lineTo(0, 0.22);
  finShape.lineTo(1.15, 0.18);
  finShape.lineTo(1.20, 0);
  finShape.closePath();

  const finGeo = new THREE.ExtrudeGeometry(finShape, {
    depth: 0.014,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.003,
    bevelThickness: 0.003,
  });
  finGeo.rotateY(Math.PI / 2);
  finGeo.translate(0.007, 0, 0);

  const fin = new THREE.Mesh(finGeo, mats.carbonMat);
  fin.position.set(0, 0.98, 0.72);
  group.add(fin);

  // 2. Brass Airspeed Pitot-Static Tube
  const pitotGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.08, 8);
  pitotGeo.rotateX(Math.PI / 2);
  const pitot = new THREE.Mesh(pitotGeo, mats.brassMat);
  pitot.position.set(0, 1.22, 0.68);
  group.add(pitot);

  // 3. Dual Telemetry Whip Antennae (GPS & Radio)
  for (const sz of [0.85, 1.15]) {
    const antBaseGeo = new THREE.CylinderGeometry(0.008, 0.012, 0.018, 8);
    const antBase = new THREE.Mesh(antBaseGeo, mats.aluminumMat);
    antBase.position.set(0, 1.19, sz);
    group.add(antBase);

    const whipGeo = new THREE.CylinderGeometry(0.002, 0.003, 0.16, 6);
    const whip = new THREE.Mesh(whipGeo, mats.carbonMat);
    whip.position.set(0, 1.28, sz);
    whip.rotation.x = -0.15;
    group.add(whip);
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TRANSAXLE PNEUMATIC SHIFT ACTUATOR & COMPOSITE GAS BOTTLE
// ─────────────────────────────────────────────────────────────────────────────
export function generatePneumaticShiftActuatorAndGasBottleMesh(
  mats: AeroShiftMaterials = createDefaultAeroShiftMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Pneumatic_Shift_Gas_Bottle_Assembly';

  // 1. Carbon-Wrapped Nitrogen Gas Bottle (Mounted on Passenger Floor Rear)
  const bottleGroup = new THREE.Group();
  bottleGroup.position.set(0.38, 0.32, 0.22);
  bottleGroup.rotation.z = Math.PI / 6;

  const cylinderGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.26, 16);
  cylinderGeo.rotateX(Math.PI / 2);
  const cylinder = new THREE.Mesh(cylinderGeo, mats.carbonMat);
  bottleGroup.add(cylinder);

  // Pressure Regulator Valve & Dial Gauge
  const regGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.04, 12);
  const reg = new THREE.Mesh(regGeo, mats.anodizedBlueMat);
  reg.position.set(0, 0, -0.15);
  bottleGroup.add(reg);

  const gaugeGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.012, 16);
  gaugeGeo.rotateX(Math.PI / 2);
  const gauge = new THREE.Mesh(gaugeGeo, mats.chromeMat);
  gauge.position.set(0, 0.03, -0.15);
  bottleGroup.add(gauge);

  group.add(bottleGroup);

  // 2. Pneumatic Shift Actuator Cylinder on Transaxle Bellhousing
  const actuatorGroup = new THREE.Group();
  actuatorGroup.position.set(0.08, 0.42, 1.35);

  const bodyGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.12, 16);
  bodyGeo.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, mats.aluminumMat);
  actuatorGroup.add(body);

  const shaftGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.08, 8);
  shaftGeo.rotateX(Math.PI / 2);
  const shaft = new THREE.Mesh(shaftGeo, mats.chromeMat);
  shaft.position.set(0, 0, 0.07);
  actuatorGroup.add(shaft);

  // Air Feed Hose (Braided blue)
  const hoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.08, 0.42, 1.35),
    new THREE.Vector3(0.22, 0.38, 0.85),
    new THREE.Vector3(0.38, 0.32, 0.22),
  ]);
  const hoseGeo = new THREE.TubeGeometry(hoseCurve, 12, 0.006, 6);
  const hose = new THREE.Mesh(hoseGeo, mats.anodizedBlueMat);
  group.add(hose);

  group.add(actuatorGroup);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. FIA SEAT HEAD HALO RESTRAINTS & CNC ALUMINUM RUNNERS
// ─────────────────────────────────────────────────────────────────────────────
export function generateSeatHaloRestraintsAndBracketsMesh(
  mats: AeroShiftMaterials = createDefaultAeroShiftMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Seat_Halo_Brackets_Assembly';

  // Driver Seat Position
  const seatCenter = new THREE.Vector3(-0.35, 0.65, -0.10);

  // 1. Winged Lateral Head Protection Restraints ("Halo Ears")
  for (const sx of [-0.18, 0.18]) {
    const haloGeo = new THREE.BoxGeometry(0.035, 0.14, 0.16);
    const halo = new THREE.Mesh(haloGeo, mats.seatFoamMat);
    halo.position.set(seatCenter.x + sx, seatCenter.y + 0.24, seatCenter.z - 0.06);
    halo.rotation.y = sx < 0 ? 0.25 : -0.25;
    group.add(halo);

    // Carbon Outer Shell Reinforcement
    const shellGeo = new THREE.BoxGeometry(0.008, 0.15, 0.17);
    const shell = new THREE.Mesh(shellGeo, mats.carbonMat);
    shell.position.set(seatCenter.x + (sx < 0 ? sx - 0.015 : sx + 0.015), seatCenter.y + 0.24, seatCenter.z - 0.06);
    shell.rotation.y = sx < 0 ? 0.25 : -0.25;
    group.add(shell);
  }

  // 2. CNC Billet Aluminum Side Seat Mount Runners (Floor anchoring brackets)
  for (const sx of [-0.22, 0.22]) {
    const runnerGeo = new THREE.BoxGeometry(0.012, 0.09, 0.36);
    const runner = new THREE.Mesh(runnerGeo, mats.anodizedRedMat);
    runner.position.set(seatCenter.x + sx, 0.26, seatCenter.z);
    group.add(runner);

    // Lightening / Height Adjustment Holes
    for (let h = -2; h <= 2; h++) {
      const holeGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.016, 8);
      holeGeo.rotateZ(Math.PI / 2);
      const hole = new THREE.Mesh(holeGeo, mats.chromeMat);
      hole.position.set(seatCenter.x + sx, 0.26, seatCenter.z + h * 0.06);
      group.add(hole);
    }
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. WHEEL CENTER-LOCK DRIVE PINS & CASTELLATED LOCKNUT
// ─────────────────────────────────────────────────────────────────────────────
export function generateHubDrivePinsAndLocknutMesh(
  mats: AeroShiftMaterials = createDefaultAeroShiftMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Hub_Drive_Pins_Locknut_Assembly';

  const wheelCorners = [
    { x: -0.84, z: -1.35, isLeft: true },
    { x: 0.84, z: -1.35, isLeft: false },
    { x: -0.86, z: 1.35, isLeft: true },
    { x: 0.86, z: 1.35, isLeft: false },
  ];

  for (const w of wheelCorners) {
    const hubGroup = new THREE.Group();
    hubGroup.position.set(w.x, 0.34, w.z);

    // 1. 5 Radial Drive Pins / Drive Pegs (Pitch Circle Diameter)
    for (let p = 0; p < 5; p++) {
      const angle = (p / 5) * Math.PI * 2;
      const pinGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.024, 8);
      pinGeo.rotateZ(Math.PI / 2);
      const pin = new THREE.Mesh(pinGeo, mats.titaniumMat);
      pin.position.set(
        w.isLeft ? -0.05 : 0.05,
        Math.sin(angle) * 0.045,
        Math.cos(angle) * 0.045
      );
      hubGroup.add(pin);
    }

    // 2. Castellated Spindle Locknut with Cotter Pin
    const nutGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.016, 6);
    nutGeo.rotateZ(Math.PI / 2);
    const nut = new THREE.Mesh(nutGeo, mats.anodizedRedMat);
    nut.position.set(w.isLeft ? -0.065 : 0.065, 0, 0);
    hubGroup.add(nut);

    // Stainless Cotter Pin through spindle end
    const cotterGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.045, 6);
    const cotter = new THREE.Mesh(cotterGeo, mats.chromeMat);
    cotter.position.set(w.isLeft ? -0.075 : 0.075, 0, 0);
    hubGroup.add(cotter);

    group.add(hubGroup);
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. EXHAUST RESONATORS & O2 LAMBDA SENSORS
// ─────────────────────────────────────────────────────────────────────────────
export function generateExhaustResonatorsAndO2SensorsMesh(
  mats: AeroShiftMaterials = createDefaultAeroShiftMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Exhaust_Resonators_O2_Sensors_Assembly';

  // Left & Right Exhaust Mid-Pipes
  for (const sx of [-0.22, 0.22]) {
    // 1. Titanium Resonator Expansion Canisters with Stiffening Ribs
    const resGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.28, 16);
    resGeo.rotateX(Math.PI / 2);
    const res = new THREE.Mesh(resGeo, mats.titaniumMat);
    res.position.set(sx, 0.28, 1.45);
    group.add(res);

    // External Circumferential Stiffening Rings
    for (const rz of [-0.08, 0, 0.08]) {
      const ringGeo = new THREE.TorusGeometry(0.057, 0.004, 8, 16);
      const ring = new THREE.Mesh(ringGeo, mats.chromeMat);
      ring.position.set(sx, 0.28, 1.45 + rz);
      group.add(ring);
    }

    // 2. Wideband Oxygen (Lambda) Sensor with Threaded Weld Bung
    const bungGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.014, 8);
    const bung = new THREE.Mesh(bungGeo, mats.titaniumMat);
    bung.position.set(sx, 0.34, 1.30);
    group.add(bung);

    const o2Geo = new THREE.CylinderGeometry(0.007, 0.007, 0.035, 8);
    const o2 = new THREE.Mesh(o2Geo, mats.brassMat);
    o2.position.set(sx, 0.36, 1.30);
    group.add(o2);
  }

  return group;
}
