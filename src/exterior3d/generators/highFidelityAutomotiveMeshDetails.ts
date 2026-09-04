// ============================================================================
// HIGH-FIDELITY AUTOMOTIVE MESH DETAILS GENERATOR
// ============================================================================
// Adds rich mechanical, aerodynamic, and ergonomic meshes to vehicle GLB models:
// 1. Powertrain Bay: Twin-turbo V8/V12 block, red cam covers, carbon intake plenum,
//    twin turbo snails, braided AN fuel lines, and carbon strut X-brace.
// 2. Cockpit Detailing: Aluminum drilled pedal box, 6-point racing harnesses,
//    toggle switch panel, sequential shifter, AC louvers, and rearview mirror.
// 3. Exterior Hardware: Competition tow loops, roof vortex generators, billet
//    fuel filler cap, front brake cooling duct hoses, and radiator fin cores.
// ============================================================================

import * as THREE from 'three';

export interface DetailMaterials {
  carbonMat: THREE.Material;
  chromeMat: THREE.Material;
  anodizedRedMat: THREE.Material;
  anodizedBlueMat: THREE.Material;
  aluminumMat: THREE.Material;
  engineBlockMat: THREE.Material;
  camCoverMat: THREE.Material;
  harnessMat: THREE.Material;
  siliconeHoseMat: THREE.Material;
  goldFoilMat: THREE.Material;
  inconelMat: THREE.Material;
  brassMat: THREE.Material;
  woodPlankMat: THREE.Material;
}

export function createDefaultDetailMaterials(): DetailMaterials {
  return {
    carbonMat: new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.20,
      metalness: 0.85,
      clearcoat: 0.95,
      clearcoatRoughness: 0.04,
      name: 'Carbon_Twill_Detail',
    }),
    chromeMat: new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.04,
      metalness: 0.98,
      clearcoat: 1.0,
      name: 'Polished_Chrome_Detail',
    }),
    anodizedRedMat: new THREE.MeshPhysicalMaterial({
      color: 0xdc2626,
      roughness: 0.18,
      metalness: 0.85,
      clearcoat: 0.8,
      name: 'Anodized_Red_Hardware',
    }),
    anodizedBlueMat: new THREE.MeshPhysicalMaterial({
      color: 0x2563eb,
      roughness: 0.18,
      metalness: 0.85,
      clearcoat: 0.8,
      name: 'Anodized_Blue_Hardware',
    }),
    aluminumMat: new THREE.MeshStandardMaterial({
      color: 0xc4cbd4,
      roughness: 0.28,
      metalness: 0.92,
      name: 'Billet_Aluminum_Detail',
    }),
    engineBlockMat: new THREE.MeshStandardMaterial({
      color: 0x262930,
      roughness: 0.45,
      metalness: 0.82,
      name: 'Cast_Aluminum_Engine_Block',
    }),
    camCoverMat: new THREE.MeshPhysicalMaterial({
      color: 0xb91c1c, // Rosso Corsa crinkle paint
      roughness: 0.35,
      metalness: 0.50,
      clearcoat: 0.4,
      name: 'Crinkle_Red_Cam_Covers',
    }),
    harnessMat: new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Red racing harness webbing
      roughness: 0.85,
      metalness: 0.05,
      name: 'Racing_Harness_Webbing',
    }),
    siliconeHoseMat: new THREE.MeshStandardMaterial({
      color: 0xf97316, // Orange heat-resistant silicone brake duct hose
      roughness: 0.55,
      metalness: 0.05,
      name: 'Silicone_Brake_Duct_Hose',
    }),
    goldFoilMat: new THREE.MeshPhysicalMaterial({
      color: 0xfbbf24,
      roughness: 0.12,
      metalness: 0.95,
      clearcoat: 0.8,
      clearcoatRoughness: 0.05,
      name: 'Reflective_Gold_Thermal_Foil',
    }),
    inconelMat: new THREE.MeshPhysicalMaterial({
      color: 0xd4d4d8,
      roughness: 0.25,
      metalness: 0.90,
      clearcoat: 0.5,
      name: 'Inconel_Exhaust_Headers',
    }),
    brassMat: new THREE.MeshPhysicalMaterial({
      color: 0xd97706,
      roughness: 0.28,
      metalness: 0.88,
      name: 'Billet_Brass_Valve',
    }),
    woodPlankMat: new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.80,
      metalness: 0.05,
      name: 'Underbody_Jabroc_Skid_Plank',
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. POWERTRAIN BAY GENERATOR (Mid-Engine V8/V12 Twin-Turbo Assembly)
// ─────────────────────────────────────────────────────────────────────────────
export function generatePowertrainBayMesh(
  mats: DetailMaterials = createDefaultDetailMaterials()
): THREE.Group {
  const bay = new THREE.Group();
  bay.name = 'Powertrain_Bay_Detailed_Assembly';

  // Engine Block (60-degree V-angle)
  const blockGeo = new THREE.BoxGeometry(0.52, 0.38, 0.65);
  const blockMesh = new THREE.Mesh(blockGeo, mats.engineBlockMat);
  blockMesh.position.set(0, 0.42, 0.72);
  bay.add(blockMesh);

  // Twin Red Crinkle Cam Covers (Left and Right Bank)
  for (const sx of [-1, 1]) {
    const camGeo = new THREE.BoxGeometry(0.18, 0.12, 0.62);
    const camMesh = new THREE.Mesh(camGeo, mats.camCoverMat);
    camMesh.position.set(sx * 0.22, 0.58, 0.72);
    camMesh.rotation.z = sx * -0.42;
    bay.add(camMesh);

    // Coil packs / spark plug boots along the bank (4 per side)
    for (let c = 0; c < 4; c++) {
      const coilGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.04, 12);
      const coilMesh = new THREE.Mesh(coilGeo, mats.carbonMat);
      coilMesh.position.set(sx * 0.22, 0.64, 0.48 + c * 0.16);
      bay.add(coilMesh);
    }
  }

  // Carbon Fiber Center Intake Manifold Plenum
  const plenumGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.58, 16);
  plenumGeo.rotateX(Math.PI / 2);
  const plenumMesh = new THREE.Mesh(plenumGeo, mats.carbonMat);
  plenumMesh.position.set(0, 0.68, 0.72);
  bay.add(plenumMesh);

  // Twin Turbocharger Compressor Housings (Snail turbines)
  for (const sx of [-1, 1]) {
    const turboGroup = new THREE.Group();
    turboGroup.position.set(sx * 0.36, 0.40, 0.98);

    // Snail scroll (torus)
    const snailGeo = new THREE.TorusGeometry(0.08, 0.038, 16, 24, Math.PI * 1.5);
    snailGeo.rotateY(Math.PI / 2);
    const snailMesh = new THREE.Mesh(snailGeo, mats.chromeMat);
    turboGroup.add(snailMesh);

    // Inlet bellmouth
    const inletGeo = new THREE.CylinderGeometry(0.048, 0.042, 0.06, 20);
    inletGeo.rotateX(Math.PI / 2);
    const inletMesh = new THREE.Mesh(inletGeo, mats.aluminumMat);
    inletMesh.position.set(0, 0, 0.04);
    turboGroup.add(inletMesh);

    // Wastegate actuator canister with blue anodized bracket
    const wgGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.06, 12);
    const wgMesh = new THREE.Mesh(wgGeo, mats.anodizedBlueMat);
    wgMesh.position.set(sx * 0.06, 0.08, 0);
    turboGroup.add(wgMesh);

    bay.add(turboGroup);
  }

  // Intercooler Charge Piping with blue silicone couplers
  for (const sx of [-1, 1]) {
    const pipeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * 0.36, 0.42, 0.92),
      new THREE.Vector3(sx * 0.48, 0.55, 0.78),
      new THREE.Vector3(sx * 0.22, 0.66, 0.62),
      new THREE.Vector3(0, 0.68, 0.58),
    ]);
    const pipeGeo = new THREE.TubeGeometry(pipeCurve, 16, 0.034, 12);
    const pipeMesh = new THREE.Mesh(pipeGeo, mats.aluminumMat);
    bay.add(pipeMesh);

    // Silicone coupler joint
    const couplerGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.05, 16);
    const couplerMesh = new THREE.Mesh(couplerGeo, mats.anodizedBlueMat);
    couplerMesh.position.set(sx * 0.26, 0.65, 0.64);
    bay.add(couplerMesh);
  }

  // Braided Stainless AN-8 Fuel Rails with Red/Blue fittings
  for (const sx of [-1, 1]) {
    const railGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.55, 12);
    railGeo.rotateX(Math.PI / 2);
    const railMesh = new THREE.Mesh(railGeo, mats.chromeMat);
    railMesh.position.set(sx * 0.16, 0.62, 0.72);
    bay.add(railMesh);

    // Anodized AN fitting end
    const fitGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.03, 6); // hexagonal
    const fitMesh = new THREE.Mesh(fitGeo, mats.anodizedRedMat);
    fitMesh.position.set(sx * 0.16, 0.62, 0.44);
    bay.add(fitMesh);
  }

  // Structural Carbon Fiber X-Brace (Strut Tower Stabilizer)
  const xBraceGroup = new THREE.Group();
  xBraceGroup.name = 'Engine_Bay_Carbon_X_Brace';
  const strutCurve1 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.58, 0.58, 0.45),
    new THREE.Vector3(0, 0.78, 0.72),
    new THREE.Vector3(0.58, 0.58, 0.98),
  ]);
  const strutCurve2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.58, 0.58, 0.45),
    new THREE.Vector3(0, 0.78, 0.72),
    new THREE.Vector3(-0.58, 0.58, 0.98),
  ]);
  const strutMesh1 = new THREE.Mesh(new THREE.TubeGeometry(strutCurve1, 16, 0.018, 12), mats.carbonMat);
  const strutMesh2 = new THREE.Mesh(new THREE.TubeGeometry(strutCurve2, 16, 0.018, 12), mats.carbonMat);
  xBraceGroup.add(strutMesh1, strutMesh2);
  bay.add(xBraceGroup);

  // Translucent Coolant Expansion Tank with Pressure Relief Cap
  const tankGeo = new THREE.BoxGeometry(0.18, 0.14, 0.16);
  const tankMat = new THREE.MeshPhysicalMaterial({
    color: 0xe2e8f0,
    metalness: 0.1,
    roughness: 0.2,
    transmission: 0.8,
    transparent: true,
    opacity: 0.85,
  });
  const tankMesh = new THREE.Mesh(tankGeo, tankMat);
  tankMesh.position.set(0.48, 0.64, 0.52);
  bay.add(tankMesh);

  const capGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.02, 16);
  const capMesh = new THREE.Mesh(capGeo, mats.anodizedBlueMat);
  capMesh.position.set(0.48, 0.72, 0.52);
  bay.add(capMesh);

  return bay;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DETAILED COCKPIT ERGONOMICS GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
export function generateDetailedCockpitMesh(
  type: 'hypercar' | 'gt',
  mats: DetailMaterials = createDefaultDetailMaterials()
): THREE.Group {
  const cockpit = new THREE.Group();
  cockpit.name = 'Cockpit_Ergonomics_Detailed_Assembly';

  // CNC Cross-Drilled Aluminum Racing Pedal Box (Throttle, Brake, Clutch)
  const pedalBox = new THREE.Group();
  pedalBox.name = 'Drilled_Aluminum_Pedal_Box';
  pedalBox.position.set(-0.32, 0.22, -0.68);

  const pedalOffsets = [-0.08, -0.01, 0.06]; // Clutch, Brake, Throttle
  const pedalHeights = [0.09, 0.09, 0.12];   // Throttle is longer
  pedalOffsets.forEach((px, idx) => {
    // Arm
    const armGeo = new THREE.BoxGeometry(0.014, 0.14, 0.014);
    const armMesh = new THREE.Mesh(armGeo, mats.aluminumMat);
    armMesh.position.set(px, 0.06, 0);
    armMesh.rotation.x = -0.3;
    pedalBox.add(armMesh);

    // Drilled Pad
    const padGeo = new THREE.BoxGeometry(0.045, pedalHeights[idx], 0.008);
    const padMesh = new THREE.Mesh(padGeo, mats.aluminumMat);
    padMesh.position.set(px, 0.03, 0.04);
    padMesh.rotation.x = -0.3;
    pedalBox.add(padMesh);
  });
  cockpit.add(pedalBox);

  // 6-Point Racing Harness Webbing & Rotary Camlock Buckle (for Driver & Passenger)
  for (const sx of [-0.34, 0.34]) {
    const harnessGroup = new THREE.Group();
    harnessGroup.name = `SixPoint_Harness_${sx < 0 ? 'Driver' : 'Passenger'}`;
    harnessGroup.position.set(sx, 0.42, 0.05);

    // Left and Right Shoulder Straps over seat back
    for (const hx of [-0.07, 0.07]) {
      const strapCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(hx, 0.62, -0.10),
        new THREE.Vector3(hx * 0.9, 0.48, 0.02),
        new THREE.Vector3(hx * 0.5, 0.26, 0.12),
        new THREE.Vector3(0, 0.18, 0.14), // Joins central buckle
      ]);
      const strapGeo = new THREE.TubeGeometry(strapCurve, 12, 0.012, 8);
      const strapMesh = new THREE.Mesh(strapGeo, mats.harnessMat);
      harnessGroup.add(strapMesh);
    }

    // Lap Belts
    for (const lx of [-0.18, 0.18]) {
      const lapCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(lx, 0.08, 0.08),
        new THREE.Vector3(0, 0.18, 0.14),
      ]);
      const lapMesh = new THREE.Mesh(new THREE.TubeGeometry(lapCurve, 8, 0.012, 8), mats.harnessMat);
      harnessGroup.add(lapMesh);
    }

    // Central Magnesium Camlock Rotary Buckle
    const buckleGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.016, 16);
    buckleGeo.rotateX(Math.PI / 4);
    const buckleMesh = new THREE.Mesh(buckleGeo, mats.chromeMat);
    buckleMesh.position.set(0, 0.18, 0.14);
    harnessGroup.add(buckleMesh);

    cockpit.add(harnessGroup);
  }

  // Center Tunnel Console with Toggle Switches & Sequential Shifter
  const consoleGroup = new THREE.Group();
  consoleGroup.name = 'Center_Tunnel_Switch_Console';
  consoleGroup.position.set(0, 0.38, -0.05);

  // Carbon Console Top Plate
  const plateGeo = new THREE.BoxGeometry(0.18, 0.02, 0.48);
  const plateMesh = new THREE.Mesh(plateGeo, mats.carbonMat);
  consoleGroup.add(plateMesh);

  // Sequential Billet Shifter Lever with Carbon Knob
  const shiftArmGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.16, 12);
  const shiftArm = new THREE.Mesh(shiftArmGeo, mats.aluminumMat);
  shiftArm.position.set(0, 0.08, -0.06);
  shiftArm.rotation.x = -0.15;
  consoleGroup.add(shiftArm);

  const knobGeo = new THREE.SphereGeometry(0.022, 16, 16);
  const knob = new THREE.Mesh(knobGeo, mats.carbonMat);
  knob.position.set(0, 0.16, -0.08);
  consoleGroup.add(knob);

  // Flip-Up Safety Guard Engine Start/Stop Button (Bright Red)
  const startGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.016, 16);
  const startBtn = new THREE.Mesh(startGeo, mats.anodizedRedMat);
  startBtn.position.set(0, 0.02, 0.08);
  consoleGroup.add(startBtn);

  // Aviation Style Toggle Switches (Row of 3)
  for (let t = -1; t <= 1; t++) {
    const toggleGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.025, 8);
    const toggleMesh = new THREE.Mesh(toggleGeo, mats.aluminumMat);
    toggleMesh.position.set(t * 0.04, 0.025, 0.15);
    toggleMesh.rotation.x = 0.4;
    consoleGroup.add(toggleMesh);
  }

  cockpit.add(consoleGroup);

  // Dashboard AC Vents (Circular with directional louvers)
  for (const vx of [-0.55, -0.15, 0.15, 0.55]) {
    const ventRingGeo = new THREE.TorusGeometry(0.032, 0.006, 12, 24);
    const ventRing = new THREE.Mesh(ventRingGeo, mats.aluminumMat);
    ventRing.position.set(vx, 0.72, -0.42);
    ventRing.rotation.x = -0.28;
    cockpit.add(ventRing);
  }

  // Frameless Aerodynamic Rearview Mirror
  const rvmGroup = new THREE.Group();
  rvmGroup.name = 'Frameless_Rearview_Mirror';
  rvmGroup.position.set(0, 0.94, -0.48);

  const rvmStemGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.05, 8);
  const rvmStem = new THREE.Mesh(rvmStemGeo, mats.aluminumMat);
  rvmStem.rotation.x = 0.4;
  rvmGroup.add(rvmStem);

  const rvmGlassGeo = new THREE.BoxGeometry(0.20, 0.06, 0.008);
  const rvmGlass = new THREE.Mesh(rvmGlassGeo, mats.chromeMat);
  rvmGlass.position.set(0, -0.03, 0.02);
  rvmGroup.add(rvmGlass);

  cockpit.add(rvmGroup);

  return cockpit;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. EXTERIOR RACING HARDWARE GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
export function generateExteriorRacingHardwareMesh(
  mats: DetailMaterials = createDefaultDetailMaterials()
): THREE.Group {
  const hw = new THREE.Group();
  hw.name = 'Exterior_Racing_Hardware_Assembly';

  // Front & Rear Anodized Red Competition Tow Hook Loops
  // Front Tow Hook (Poking through front splitter)
  const frontTowGeo = new THREE.TorusGeometry(0.032, 0.007, 16, 24);
  const frontTow = new THREE.Mesh(frontTowGeo, mats.anodizedRedMat);
  frontTow.position.set(0.38, 0.16, -2.18);
  frontTow.rotation.x = Math.PI / 2;
  hw.add(frontTow);

  // Rear Tow Hook (Poking through diffuser)
  const rearTowGeo = new THREE.TorusGeometry(0.032, 0.007, 16, 24);
  const rearTow = new THREE.Mesh(rearTowGeo, mats.anodizedRedMat);
  rearTow.position.set(-0.35, 0.22, 2.14);
  rearTow.rotation.x = Math.PI / 2;
  hw.add(rearTow);

  // Billet Aluminum Quick-Release Fuel Filler Cap on Right Rear Quarter
  const fuelCapGroup = new THREE.Group();
  fuelCapGroup.name = 'Billet_Fuel_Filler_Assembly';
  fuelCapGroup.position.set(0.82, 0.78, 0.95);
  fuelCapGroup.rotation.y = Math.PI / 4;

  const flapBezelGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.006, 24);
  flapBezelGeo.rotateZ(Math.PI / 2);
  const flapBezel = new THREE.Mesh(flapBezelGeo, mats.carbonMat);
  fuelCapGroup.add(flapBezel);

  const capCoreGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.012, 24);
  capCoreGeo.rotateZ(Math.PI / 2);
  const capCore = new THREE.Mesh(capCoreGeo, mats.aluminumMat);
  capCore.position.set(0.004, 0, 0);
  fuelCapGroup.add(capCore);

  // 6 Perimeter Allen Bolts
  for (let b = 0; b < 6; b++) {
    const angle = (b / 6) * Math.PI * 2;
    const boltGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.014, 8);
    boltGeo.rotateZ(Math.PI / 2);
    const bolt = new THREE.Mesh(boltGeo, mats.chromeMat);
    bolt.position.set(0.006, Math.sin(angle) * 0.030, Math.cos(angle) * 0.030);
    fuelCapGroup.add(bolt);
  }
  hw.add(fuelCapGroup);

  // Roof Delta Vortex Generator Fins (Row of 6 along rear roof edge)
  const vortexRow = new THREE.Group();
  vortexRow.name = 'Roof_Delta_Vortex_Generators';
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue; // Skip center spine
    const vx = i * 0.12;
    const finGeo = new THREE.ConeGeometry(0.015, 0.05, 3);
    finGeo.rotateX(Math.PI / 3);
    const finMesh = new THREE.Mesh(finGeo, mats.carbonMat);
    finMesh.position.set(vx, 1.05, 0.78);
    finMesh.scale.set(0.6, 1.0, 1.4);
    vortexRow.add(finMesh);
  }
  hw.add(vortexRow);

  // Front Brake Cooling Ducts & Orange Corrugated Silicone Hoses
  for (const sx of [-1, 1]) {
    const hoseCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * 0.52, 0.22, -1.95), // Front bumper intake duct
      new THREE.Vector3(sx * 0.62, 0.24, -1.65), // Fender well inner arch
      new THREE.Vector3(sx * 0.72, 0.32, -1.38), // Brake rotor backing plate
    ]);
    const hoseGeo = new THREE.TubeGeometry(hoseCurve, 16, 0.024, 12);
    const hoseMesh = new THREE.Mesh(hoseGeo, mats.siliconeHoseMat);
    hw.add(hoseMesh);

    // Front Bumper Carbon Inlet Funnel
    const funnelGeo = new THREE.ConeGeometry(0.045, 0.08, 16, 1, true);
    funnelGeo.rotateX(-Math.PI / 2);
    const funnelMesh = new THREE.Mesh(funnelGeo, mats.carbonMat);
    funnelMesh.position.set(sx * 0.52, 0.22, -1.95);
    hw.add(funnelMesh);
  }

  // Aluminum Radiator Core Matrix inside Front Grille (Finned Heat Exchanger)
  const radiatorGeo = new THREE.BoxGeometry(0.95, 0.24, 0.04);
  const radiatorMesh = new THREE.Mesh(radiatorGeo, mats.aluminumMat);
  radiatorMesh.position.set(0, 0.32, -2.12);
  hw.add(radiatorMesh);

  return hw;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. INCONEL TUBULAR EXHAUST HEADERS & GOLD FOIL HEAT SHIELD GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
export function generateInconelExhaustHeadersMesh(
  mats: DetailMaterials = createDefaultDetailMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Inconel_Exhaust_Headers_Assembly';

  // 1. Gold Foil Thermal Bulkhead Barrier
  const goldGeo = new THREE.BoxGeometry(1.24, 0.58, 0.015);
  const goldMesh = new THREE.Mesh(goldGeo, mats.goldFoilMat);
  goldMesh.position.set(0, 0.55, 0.38);
  group.add(goldMesh);

  // 2. Tubular Inconel Equal-Length Primary Runners (4 per cylinder bank)
  for (const sx of [-1, 1]) {
    for (let c = 0; c < 4; c++) {
      const pz = 0.52 + c * 0.13;
      const runnerCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(sx * 0.28, 0.48, pz),
        new THREE.Vector3(sx * 0.38, 0.44, pz + 0.04),
        new THREE.Vector3(sx * 0.35, 0.36, 0.90 - c * 0.02),
        new THREE.Vector3(sx * 0.36, 0.38, 0.98), // Enters merge collector
      ]);
      const runnerGeo = new THREE.TubeGeometry(runnerCurve, 16, 0.019, 10);
      const runnerMesh = new THREE.Mesh(runnerGeo, mats.inconelMat);
      group.add(runnerMesh);
    }

    // 4-into-1 Merge Collector Cone
    const collectorGeo = new THREE.ConeGeometry(0.052, 0.12, 16, 1, true);
    collectorGeo.rotateX(Math.PI / 2);
    const collectorMesh = new THREE.Mesh(collectorGeo, mats.inconelMat);
    collectorMesh.position.set(sx * 0.36, 0.38, 0.98);
    group.add(collectorMesh);

    // Wastegate Screamer Downpipe (Titanium dump tube venting toward underfloor)
    const screamerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * 0.38, 0.38, 1.02),
      new THREE.Vector3(sx * 0.42, 0.26, 1.15),
      new THREE.Vector3(sx * 0.38, 0.14, 1.35),
    ]);
    const screamerGeo = new THREE.TubeGeometry(screamerCurve, 12, 0.016, 8);
    const screamerMesh = new THREE.Mesh(screamerGeo, mats.chromeMat);
    group.add(screamerMesh);
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. UNDERBODY VENTURI GROUND EFFECT TUNNELS & TITANIUM SKID PUCK GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
export function generateUnderbodyAerodynamicsVenturiMesh(
  mats: DetailMaterials = createDefaultDetailMaterials()
): THREE.Group {
  const underbody = new THREE.Group();
  underbody.name = 'Underbody_Aerodynamics_Venturi_Assembly';

  // 1. Full-Length Stepped Carbon Aerodynamic Floor
  const floorGeo = new THREE.BoxGeometry(1.58, 0.024, 3.85);
  const floorMesh = new THREE.Mesh(floorGeo, mats.carbonMat);
  floorMesh.position.set(0, 0.09, 0.05);
  underbody.add(floorMesh);

  // 2. Central Wooden Jabroc Skid Plank
  const plankGeo = new THREE.BoxGeometry(0.38, 0.012, 3.40);
  const plankMesh = new THREE.Mesh(plankGeo, mats.woodPlankMat);
  plankMesh.position.set(0, 0.075, 0.05);
  underbody.add(plankMesh);

  // 3. Titanium Spark Skid Pucks (Circular wear plates along the plank)
  for (const pz of [-1.2, -0.6, 0.0, 0.6, 1.2, 1.6]) {
    const puckGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.016, 20);
    const puckMesh = new THREE.Mesh(puckGeo, mats.chromeMat);
    puckMesh.position.set(0, 0.068, pz);
    underbody.add(puckMesh);
  }

  // 4. Twin Underfloor Venturi Invert Tunnels (Left & Right)
  for (const sx of [-1, 1]) {
    const tunnelCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * 0.52, 0.10, -0.85),
      new THREE.Vector3(sx * 0.58, 0.08, 0.40),
      new THREE.Vector3(sx * 0.64, 0.16, 1.45),
      new THREE.Vector3(sx * 0.70, 0.28, 2.10),
    ]);
    const tunnelGeo = new THREE.TubeGeometry(tunnelCurve, 20, 0.065, 8);
    tunnelGeo.scale(1.8, 0.5, 1.0);
    const tunnelMesh = new THREE.Mesh(tunnelGeo, mats.carbonMat);
    underbody.add(tunnelMesh);

    // Underfloor Vortex Turning Vanes (Fences)
    for (let f = 0; f < 3; f++) {
      const fenceGeo = new THREE.BoxGeometry(0.008, 0.06, 0.65);
      const fenceMesh = new THREE.Mesh(fenceGeo, mats.carbonMat);
      fenceMesh.position.set(sx * (0.35 + f * 0.12), 0.07, 0.2 + f * 0.45);
      fenceMesh.rotation.y = sx * 0.08;
      underbody.add(fenceMesh);
    }
  }

  // 5. Differential & Gearbox Cooling NACA Duct
  const nacaGeo = new THREE.BoxGeometry(0.24, 0.06, 0.35);
  const nacaMesh = new THREE.Mesh(nacaGeo, mats.carbonMat);
  nacaMesh.position.set(0, 0.08, 1.42);
  nacaMesh.rotation.x = -0.22;
  underbody.add(nacaMesh);

  return underbody;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. CHASSIS DOOR SILLS, BUTTERFLY HINGES & SAFETY EXTINGUISHER GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
export function generateChassisDoorSillAndExtinguisherMesh(
  mats: DetailMaterials = createDefaultDetailMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Chassis_Sills_Doors_Extinguisher_Assembly';

  // 1. Carbon Fiber Monocoque Door Sills (Left & Right)
  for (const sx of [-1, 1]) {
    const sillGeo = new THREE.BoxGeometry(0.18, 0.22, 1.45);
    const sillMesh = new THREE.Mesh(sillGeo, mats.carbonMat);
    sillMesh.position.set(sx * 0.72, 0.32, 0.02);
    group.add(sillMesh);

    // Aluminum Sill Treadplate with Embossed Logo
    const plateGeo = new THREE.BoxGeometry(0.12, 0.006, 0.85);
    const plateMesh = new THREE.Mesh(plateGeo, mats.aluminumMat);
    plateMesh.position.set(sx * 0.72, 0.435, 0.02);
    group.add(plateMesh);

    // Billet Butterfly Door Hinge Pivot & Gas Strut
    const hingeGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.08, 12);
    const hingeMesh = new THREE.Mesh(hingeGeo, mats.aluminumMat);
    hingeMesh.position.set(sx * 0.78, 0.58, -0.55);
    hingeMesh.rotation.z = Math.PI / 2;
    group.add(hingeMesh);

    // Hydraulic Gas Strut Cylinder
    const strutBodyGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.28, 12);
    const strutBody = new THREE.Mesh(strutBodyGeo, mats.carbonMat);
    strutBody.position.set(sx * 0.76, 0.68, -0.42);
    strutBody.rotation.x = -0.45;
    group.add(strutBody);

    const strutRodGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.24, 12);
    const strutRod = new THREE.Mesh(strutRodGeo, mats.chromeMat);
    strutRod.position.set(sx * 0.76, 0.78, -0.32);
    strutRod.rotation.x = -0.45;
    group.add(strutRod);

    // Carbon Door Inner Card with Red Emergency Pull Strap
    const cardGeo = new THREE.BoxGeometry(0.035, 0.48, 1.10);
    const cardMesh = new THREE.Mesh(cardGeo, mats.carbonMat);
    cardMesh.position.set(sx * 0.82, 0.64, 0.05);
    group.add(cardMesh);

    // Red Door Release Fabric Pull Strap Loop
    const pullCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sx * 0.79, 0.68, -0.15),
      new THREE.Vector3(sx * 0.77, 0.64, -0.12),
      new THREE.Vector3(sx * 0.79, 0.60, -0.15),
    ]);
    const pullMesh = new THREE.Mesh(new THREE.TubeGeometry(pullCurve, 10, 0.008, 6), mats.harnessMat);
    group.add(pullMesh);
  }

  // 2. Cockpit FIA Fire Suppression Extinguisher System (Passenger Footwell)
  const fireGroup = new THREE.Group();
  fireGroup.name = 'FIA_Fire_Extinguisher_System';
  fireGroup.position.set(0.35, 0.26, -0.48);
  fireGroup.rotation.z = Math.PI / 2;
  fireGroup.rotation.y = 0.35;

  // Red Pressure Canister
  const bottleGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.28, 20);
  const bottleMesh = new THREE.Mesh(bottleGeo, mats.anodizedRedMat);
  fireGroup.add(bottleMesh);

  // Brass Discharge Head Valve
  const valveGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.06, 12);
  const valveMesh = new THREE.Mesh(valveGeo, mats.brassMat);
  valveMesh.position.set(0, 0.16, 0);
  fireGroup.add(valveMesh);

  // Analog Pressure Gauge with Chrome Bezel
  const gaugeGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.012, 16);
  gaugeGeo.rotateX(Math.PI / 2);
  const gaugeMesh = new THREE.Mesh(gaugeGeo, mats.chromeMat);
  gaugeMesh.position.set(0, 0.16, 0.028);
  fireGroup.add(gaugeMesh);

  // Stainless Mounting Clamp Brackets
  for (const by of [-0.08, 0.08]) {
    const clampGeo = new THREE.TorusGeometry(0.058, 0.005, 8, 20, Math.PI);
    clampGeo.rotateX(Math.PI / 2);
    const clampMesh = new THREE.Mesh(clampGeo, mats.aluminumMat);
    clampMesh.position.set(0, by, 0);
    fireGroup.add(clampMesh);
  }

  group.add(fireGroup);

  // 3. Passenger Angled Footrest Kick-Plate (Aluminum with grip perforations)
  const kickGeo = new THREE.BoxGeometry(0.32, 0.012, 0.36);
  const kickMesh = new THREE.Mesh(kickGeo, mats.aluminumMat);
  kickMesh.position.set(0.34, 0.22, -0.72);
  kickMesh.rotation.x = -0.42;
  group.add(kickMesh);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. WHEEL BALANCERS, ROTOR BACKING PLATES & CENTERLOCK WIRE CLIPS
// ─────────────────────────────────────────────────────────────────────────────
export function generateWheelBalancersAndHubDetailMesh(
  mats: DetailMaterials = createDefaultDetailMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Wheel_Balancers_Hub_Detail_Assembly';

  const wheelCorners = [
    { x: -0.84, z: -1.35, isLeft: true },
    { x: 0.84, z: -1.35, isLeft: false },
    { x: -0.86, z: 1.35, isLeft: true },
    { x: 0.86, z: 1.35, isLeft: false },
  ];

  for (const c of wheelCorners) {
    const cornerGroup = new THREE.Group();
    cornerGroup.position.set(c.x, 0.34, c.z);

    // 1. Carbon Fiber Rotor Dust Shield / Cooling Backplate
    const shieldGeo = new THREE.CylinderGeometry(0.20, 0.20, 0.012, 24, 1, false, 0, Math.PI * 1.6);
    shieldGeo.rotateZ(Math.PI / 2);
    const shieldMesh = new THREE.Mesh(shieldGeo, mats.carbonMat);
    shieldMesh.position.set(c.isLeft ? 0.04 : -0.04, 0, 0);
    cornerGroup.add(shieldMesh);

    // 2. Adhesive Wheel Balancing Lead Weights (Row of 6 small blocks along inner rim lip)
    const weightBlockGeo = new THREE.BoxGeometry(0.012, 0.008, 0.024);
    for (let w = 0; w < 6; w++) {
      const weightMesh = new THREE.Mesh(weightBlockGeo, mats.aluminumMat);
      weightMesh.position.set(
        c.isLeft ? -0.08 : 0.08,
        -0.21,
        -0.08 + w * 0.028
      );
      cornerGroup.add(weightMesh);
    }

    // 3. Centerlock Splined Drive Teeth Ring
    const teethRingGeo = new THREE.TorusGeometry(0.052, 0.006, 12, 24);
    teethRingGeo.rotateY(Math.PI / 2);
    const teethRing = new THREE.Mesh(teethRingGeo, mats.chromeMat);
    teethRing.position.set(c.isLeft ? -0.16 : 0.16, 0, 0);
    cornerGroup.add(teethRing);

    // 4. Safety Retaining Spring Clip Wire
    const clipGeo = new THREE.TorusGeometry(0.038, 0.003, 8, 16, Math.PI * 1.7);
    clipGeo.rotateY(Math.PI / 2);
    const clipMesh = new THREE.Mesh(clipGeo, mats.anodizedRedMat);
    clipMesh.position.set(c.isLeft ? -0.18 : 0.18, 0, 0);
    cornerGroup.add(clipMesh);

    group.add(cornerGroup);
  }

  return group;
}

