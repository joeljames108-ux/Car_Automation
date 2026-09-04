// ============================================================================
// HOOD AEROCATCH, HELMET BLOWER, CLUTCH SLAVE & GROUND LASERS MESH
// ============================================================================
// Precision Le Mans Hypercar & GT3 engineering details:
// 1. Aerocatch Hood Latches & Folding Tow Hook: Flush-mount carbon Aerocatch
//    latches with shear pins, front CNC billet red anodized folding recovery hook.
// 2. Helmet Blower & Cockpit Ventilation: Driver forced-air helmet blower unit,
//    corrugated air hose, floor NACA extraction louvers.
// 3. Bellhousing Inspection & Slave Line: Milled aluminum clutch inspection
//    window with socket screws, braided concentric slave cylinder hydraulic line.
// 4. Ride Height Optical Lasers & Underfloor Strakes: Downward-facing ride-height
//    laser sensors with quartz lenses, longitudinal floor vortex strakes.
// 5. Exhaust Flame Dispersers & Hangers: Perforated internal anti-lag flame
//    cones inside exhaust tips, high-temp silicone vibration hangers.
// ============================================================================

import * as THREE from 'three';

export interface AerocatchLaserMaterials {
  carbonMat: THREE.Material;
  chromeMat: THREE.Material;
  anodizedRedMat: THREE.Material;
  anodizedBlueMat: THREE.Material;
  aluminumMat: THREE.Material;
  titaniumMat: THREE.Material;
  brassMat: THREE.Material;
  laserLensMat: THREE.Material;
  siliconeHangerMat: THREE.Material;
}

export function createDefaultAerocatchLaserMaterials(): AerocatchLaserMaterials {
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
    laserLensMat: new THREE.MeshPhysicalMaterial({
      color: 0xef4444, // Red optical laser emission window
      transmission: 0.90,
      opacity: 0.95,
      transparent: true,
      roughness: 0.05,
      name: 'Ride_Height_Laser_Lens',
    }),
    siliconeHangerMat: new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.85,
      metalness: 0.10,
      name: 'Silicone_Rubber_Exhaust_Hanger',
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. FLUSH AEROCATCH HOOD LATCHES & FOLDING FRONT RECOVERY HOOK
// ─────────────────────────────────────────────────────────────────────────────
export function generateAerocatchLatchesAndTowHookMesh(
  mats: AerocatchLaserMaterials = createDefaultAerocatchLaserMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Aerocatch_Tow_Hook_Assembly';

  // 1. Flush-Mounted Aerocatch Carbon Hood Pin Latches (Left & Right Front Hood)
  for (const sx of [-0.48, 0.48]) {
    const latchGroup = new THREE.Group();
    latchGroup.position.set(sx, 0.63, -1.65);
    latchGroup.rotation.x = -0.18;

    // Recessed Carbon Bezel Housing
    const bezelGeo = new THREE.BoxGeometry(0.065, 0.008, 0.14);
    const bezel = new THREE.Mesh(bezelGeo, mats.carbonMat);
    latchGroup.add(bezel);

    // Aluminum Release Handle Flap
    const flapGeo = new THREE.BoxGeometry(0.038, 0.006, 0.09);
    const flap = new THREE.Mesh(flapGeo, mats.aluminumMat);
    flap.position.set(0, 0.005, -0.01);
    latchGroup.add(flap);

    // Red Locking Shear Pin
    const pinGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.024, 8);
    const pin = new THREE.Mesh(pinGeo, mats.anodizedRedMat);
    pin.position.set(0, 0.008, 0.045);
    latchGroup.add(pin);

    group.add(latchGroup);
  }

  // 2. Heavy-Duty CNC Billet Red Folding Front Recovery Tow Hook
  const towGroup = new THREE.Group();
  towGroup.position.set(0.42, 0.28, -2.26);

  // Mounting Receiver Boss in Front Bumper
  const bossGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.05, 12);
  bossGeo.rotateX(Math.PI / 2);
  const boss = new THREE.Mesh(bossGeo, mats.titaniumMat);
  towGroup.add(boss);

  // Folding Teardrop Hook Ring
  const ringGeo = new THREE.TorusGeometry(0.042, 0.010, 8, 20);
  const ring = new THREE.Mesh(ringGeo, mats.anodizedRedMat);
  ring.position.set(0, 0, -0.04);
  ring.rotation.x = 0.25;
  towGroup.add(ring);

  group.add(towGroup);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. COCKPIT HELMET VENTILATION BLOWER & FLOOR EXTRACTION DUCT
// ─────────────────────────────────────────────────────────────────────────────
export function generateHelmetBlowerAndVentilationMesh(
  mats: AerocatchLaserMaterials = createDefaultAerocatchLaserMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Helmet_Blower_Ventilation_Assembly';

  // 1. Fresh-Air Forced Helmet Blower Unit (Mounted to Roll Cage Crossbar)
  const blowerGroup = new THREE.Group();
  blowerGroup.position.set(-0.25, 0.88, 0.15);

  const blowerGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.09, 16);
  const blower = new THREE.Mesh(blowerGeo, mats.carbonMat);
  blowerGroup.add(blower);

  // Electric Blower Motor Casing
  const motorGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.06, 12);
  motorGeo.rotateZ(Math.PI / 2);
  const motor = new THREE.Mesh(motorGeo, mats.aluminumMat);
  motor.position.set(0.04, 0, 0);
  blowerGroup.add(motor);

  // Corrugated Flexible Air Hose routing to Driver Helmet
  const hoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.04, 0),
    new THREE.Vector3(-0.06, 0.02, -0.12),
    new THREE.Vector3(-0.08, -0.08, -0.22),
  ]);
  const hoseGeo = new THREE.TubeGeometry(hoseCurve, 14, 0.016, 8);
  const hose = new THREE.Mesh(hoseGeo, mats.siliconeHangerMat);
  blowerGroup.add(hose);

  group.add(blowerGroup);

  // 2. Cockpit Floor NACA Air Extraction Louvers (Passenger floor footwell)
  const louverGroup = new THREE.Group();
  louverGroup.position.set(0.32, 0.23, -0.15);

  const louverFrameGeo = new THREE.BoxGeometry(0.12, 0.010, 0.18);
  const louverFrame = new THREE.Mesh(louverFrameGeo, mats.carbonMat);
  louverGroup.add(louverFrame);

  for (let l = -2; l <= 2; l++) {
    const slatGeo = new THREE.BoxGeometry(0.09, 0.004, 0.016);
    const slat = new THREE.Mesh(slatGeo, mats.aluminumMat);
    slat.position.set(0, 0.008, l * 0.028);
    slat.rotation.x = 0.35;
    louverGroup.add(slat);
  }

  group.add(louverGroup);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. BELLHOUSING INSPECTION WINDOW & CONCENTRIC SLAVE CYLINDER LINE
// ─────────────────────────────────────────────────────────────────────────────
export function generateClutchInspectionAndSlaveLineMesh(
  mats: AerocatchLaserMaterials = createDefaultAerocatchLaserMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Clutch_Inspection_Slave_Line_Assembly';
  group.position.set(0, 0.36, 0.45);

  // 1. Milled Aluminum Clutch Inspection Window Cover
  const windowGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.012, 16);
  windowGeo.rotateX(Math.PI / 2);
  const windowCover = new THREE.Mesh(windowGeo, mats.aluminumMat);
  windowCover.position.set(0.12, 0.08, 0);
  group.add(windowCover);

  // Perimeter Allen Screws
  for (let s = 0; s < 6; s++) {
    const angle = (s / 6) * Math.PI * 2;
    const screwGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.016, 6);
    screwGeo.rotateX(Math.PI / 2);
    const screw = new THREE.Mesh(screwGeo, mats.chromeMat);
    screw.position.set(
      0.12 + Math.cos(angle) * 0.042,
      0.08 + Math.sin(angle) * 0.042,
      0.006
    );
    group.add(screw);
  }

  // 2. Braided Stainless Concentric Clutch Slave Line
  const slaveCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.04, -0.02, 0.02),
    new THREE.Vector3(0.12, -0.06, -0.08),
    new THREE.Vector3(0.18, 0.02, -0.22), // Routes toward firewall
  ]);
  const slaveGeo = new THREE.TubeGeometry(slaveCurve, 10, 0.005, 8);
  const slaveLine = new THREE.Mesh(slaveGeo, mats.chromeMat);
  group.add(slaveLine);

  // Dry-Break Quick Disconnect Coupling
  const dryBreakGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.025, 8);
  dryBreakGeo.rotateX(Math.PI / 2);
  const dryBreak = new THREE.Mesh(dryBreakGeo, mats.anodizedRedMat);
  dryBreak.position.set(0.12, -0.06, -0.08);
  group.add(dryBreak);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. RIDE-HEIGHT OPTICAL LASER SENSORS & UNDERFLOOR VORTEX STRAKES
// ─────────────────────────────────────────────────────────────────────────────
export function generateRideHeightLasersAndFloorStrakesMesh(
  mats: AerocatchLaserMaterials = createDefaultAerocatchLaserMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Ride_Height_Lasers_Floor_Strakes_Assembly';

  // 1. Dual Downward-Facing Optical Ride-Height Laser Telemetry Sensors
  // (Mounted at front axle center and rear diffuser throat)
  for (const pos of [
    new THREE.Vector3(0, 0.12, -1.45), // Front ride height laser
    new THREE.Vector3(0, 0.16, 1.25),  // Rear ride height laser
  ]) {
    const laserCasingGeo = new THREE.BoxGeometry(0.045, 0.028, 0.065);
    const laserCasing = new THREE.Mesh(laserCasingGeo, mats.aluminumMat);
    laserCasing.position.copy(pos);
    group.add(laserCasing);

    // Red Optical Quartz Lens (Faces road surface)
    const lensGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.005, 12);
    const lens = new THREE.Mesh(lensGeo, mats.laserLensMat);
    lens.position.set(pos.x, pos.y - 0.015, pos.z);
    group.add(lens);
  }

  // 2. Underfloor Longitudinal Venturi Vortex Strakes (Left & Right Floor Pan)
  for (const sx of [-0.55, 0.55]) {
    const strakeShape = new THREE.Shape();
    strakeShape.moveTo(0, 0);
    strakeShape.lineTo(0.006, 0);
    strakeShape.lineTo(0.006, -0.045);
    strakeShape.lineTo(0, -0.045);
    strakeShape.closePath();

    const strakeGeo = new THREE.ExtrudeGeometry(strakeShape, {
      depth: 1.45,
      bevelEnabled: false,
    });
    strakeGeo.translate(0, 0, -0.725);
    const strake = new THREE.Mesh(strakeGeo, mats.carbonMat);
    strake.position.set(sx, 0.10, 0.15);
    group.add(strake);
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. EXHAUST FLAME DISPERSER CONES & VIBRATION-ISOLATION HANGERS
// ─────────────────────────────────────────────────────────────────────────────
export function generateExhaustFlameDispersersAndHangersMesh(
  mats: AerocatchLaserMaterials = createDefaultAerocatchLaserMaterials()
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Exhaust_Dispersers_Hangers_Assembly';

  // Left & Right Exhaust Tips Detailing
  for (const sx of [-0.18, 0.18]) {
    const tipPos = new THREE.Vector3(sx, 0.38, 2.18);

    // 1. Internal Anti-Lag Flame Disperser Cone (Perforated Core)
    const coneGeo = new THREE.ConeGeometry(0.038, 0.075, 16, 2, true);
    coneGeo.rotateX(-Math.PI / 2);
    const cone = new THREE.Mesh(coneGeo, mats.titaniumMat);
    cone.position.set(tipPos.x, tipPos.y, tipPos.z - 0.04);
    group.add(cone);

    // Center Flame Bleed Nozzle
    const nozzleGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.04, 8);
    nozzleGeo.rotateX(Math.PI / 2);
    const nozzle = new THREE.Mesh(nozzleGeo, mats.chromeMat);
    nozzle.position.set(tipPos.x, tipPos.y, tipPos.z - 0.02);
    group.add(nozzle);

    // 2. High-Temp Silicone Rubber Vibration Exhaust Hanger Bushing
    const hangerGeo = new THREE.BoxGeometry(0.035, 0.065, 0.028);
    const hanger = new THREE.Mesh(hangerGeo, mats.siliconeHangerMat);
    hanger.position.set(tipPos.x, tipPos.y + 0.10, tipPos.z - 0.12);
    group.add(hanger);

    // Titanium Support Mounting Prongs
    const prongGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.055, 8);
    prongGeo.rotateX(Math.PI / 2);
    const prong = new THREE.Mesh(prongGeo, mats.titaniumMat);
    prong.position.set(tipPos.x, tipPos.y + 0.10, tipPos.z - 0.12);
    group.add(prong);
  }

  return group;
}
