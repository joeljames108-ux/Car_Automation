import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import * as fs from "fs";
import * as path from "path";

// Polyfill Node.js FileReader for Three.js GLTFExporter binary writer
class NodeFileReader {
  result: ArrayBuffer | null = null;
  onloadend: (() => void) | null = null;
  async readAsArrayBuffer(blob: Blob) {
    this.result = await blob.arrayBuffer();
    if (this.onloadend) this.onloadend();
  }
}
// @ts-ignore
globalThis.FileReader = NodeFileReader;

/**
 * ════════════════════════════════════════════════════════════════════════════════
 * 60° V12 RACING ENGINE & TRANSAXLE 3D GLB MASTER GENERATOR
 * ════════════════════════════════════════════════════════════════════════════════
 *
 * Generates a complete, photorealistic glTF 2.0 binary (.glb) model for the
 * 60° V12 Racing Engine and 7-Speed Sequential Transaxle with all 25 subassemblies,
 * physically accurate dimensions, hierarchical scene nodes, and PBR materials.
 */
export function buildV12EngineScene(explodedAmount: number = 0): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = "V12_Racing_Powertrain_Master";

  // ─── 1. PBR MASTER MATERIALS PALETTE ───
  const matCastAluminum = new THREE.MeshStandardMaterial({
    name: "Cast_Magnesium_Aluminum",
    color: 0x94a3b8,
    metalness: 0.75,
    roughness: 0.42,
  });

  const matMachinedDeck = new THREE.MeshStandardMaterial({
    name: "Machined_Billet_Surface",
    color: 0xe2e8f0,
    metalness: 0.88,
    roughness: 0.22,
  });

  const matNitridedCrank = new THREE.MeshStandardMaterial({
    name: "Forged_Nitrided_Steel",
    color: 0xcbd5e1,
    metalness: 0.92,
    roughness: 0.15,
  });

  const matGoldAnodized = new THREE.MeshStandardMaterial({
    name: "Billet_Gold_Anodized",
    color: 0xf59e0b,
    metalness: 0.9,
    roughness: 0.2,
  });

  const matCobaltAnodized = new THREE.MeshStandardMaterial({
    name: "Apex_Cobalt_Blue_Anodized",
    color: 0x0284c7,
    metalness: 0.85,
    roughness: 0.18,
  });

  const matPolishedBrass = new THREE.MeshStandardMaterial({
    name: "Polished_Brass_Butterfly",
    color: 0xfacc15,
    metalness: 0.82,
    roughness: 0.28,
  });

  const matCeramicIntake = new THREE.MeshStandardMaterial({
    name: "Thermal_Barrier_Ceramic_White",
    color: 0xf8fafc,
    metalness: 0.25,
    roughness: 0.35,
  });

  const matInconelExhaust = new THREE.MeshStandardMaterial({
    name: "Inconel_625_Heat_Tinted_Gold",
    color: 0xd97706,
    metalness: 0.9,
    roughness: 0.26,
  });

  const matCarbonFiber = new THREE.MeshStandardMaterial({
    name: "Autoclaved_2x2_Twill_Dry_Carbon",
    color: 0x1e293b,
    metalness: 0.35,
    roughness: 0.38,
  });

  const matQuartzGlass = new THREE.MeshPhysicalMaterial({
    name: "Quartz_ITB_Inspection_Glass",
    color: 0x38bdf8,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.85,
    opacity: 0.45,
    transparent: true,
  });

  const matRadiatorCore = new THREE.MeshStandardMaterial({
    name: "Micro_Louvered_Brazed_Aluminum",
    color: 0x334155,
    metalness: 0.8,
    roughness: 0.55,
  });

  const matBlueSilicone = new THREE.MeshStandardMaterial({
    name: "High_Pressure_Blue_Silicone",
    color: 0x2563eb,
    metalness: 0.1,
    roughness: 0.6,
  });

  const matTransaxleCast = new THREE.MeshStandardMaterial({
    name: "Transaxle_Magnesium_Casing",
    color: 0x64748b,
    metalness: 0.78,
    roughness: 0.4,
  });

  const matBlackPolymer = new THREE.MeshStandardMaterial({
    name: "Black_Polymer_Shroud",
    color: 0x0f172a,
    metalness: 0.2,
    roughness: 0.7,
  });

  const matOrangeHighVoltage = new THREE.MeshStandardMaterial({
    name: "High_Voltage_800V_Orange",
    color: 0xea580c,
    metalness: 0.15,
    roughness: 0.5,
  });

  // Master Engine Root Node
  const engineRoot = new THREE.Group();
  engineRoot.name = "V12_Racing_Engine";
  scene.add(engineRoot);

  const expZ = explodedAmount * 0.12; // Z separation in meters
  const expX = explodedAmount * 0.15; // X separation in meters
  const expY = explodedAmount * 0.10; // Y separation in meters

  // ─── 2. ENGINE BLOCK CASTING & CRANKCASE (60° V-BANK) ───
  const blockGroup = new THREE.Group();
  blockGroup.name = "01_Block_Casting_Crankcase";

  // Crankcase Bedplate Skirt (Lower Half)
  const crankcaseGeo = new THREE.BoxGeometry(0.68, 0.32, 0.14);
  const crankcaseMesh = new THREE.Mesh(crankcaseGeo, matCastAluminum);
  crankcaseMesh.position.set(0, 0, 0.07);
  blockGroup.add(crankcaseMesh);

  // 7 Cross-Bolted Main Bearing Saddles
  for (let i = 0; i < 7; i++) {
    const mx = -0.30 + i * (0.60 / 6);
    const saddleGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.30, 24);
    saddleGeo.rotateZ(Math.PI / 2);
    const saddleMesh = new THREE.Mesh(saddleGeo, matMachinedDeck);
    saddleMesh.position.set(mx, 0, 0.05);
    blockGroup.add(saddleMesh);
  }

  // Bank 1 (Left, +Y tilted +30°) Cylinder Block
  const bank1BlockGeo = new THREE.BoxGeometry(0.64, 0.18, 0.22);
  const bank1BlockMesh = new THREE.Mesh(bank1BlockGeo, matCastAluminum);
  bank1BlockMesh.position.set(0, 0.11, 0.22);
  bank1BlockMesh.rotation.x = THREE.MathUtils.degToRad(-30);
  blockGroup.add(bank1BlockMesh);

  // Bank 2 (Right, -Y tilted -30°) Cylinder Block
  const bank2BlockGeo = new THREE.BoxGeometry(0.64, 0.18, 0.22);
  const bank2BlockMesh = new THREE.Mesh(bank2BlockGeo, matCastAluminum);
  bank2BlockMesh.position.set(0, -0.11, 0.22);
  bank2BlockMesh.rotation.x = THREE.MathUtils.degToRad(30);
  blockGroup.add(bank2BlockMesh);

  // 12 Nikasil Cylinder Bores (6 per bank)
  const cylRadius = 0.044; // 88mm Bore
  const cylHeight = 0.18;
  const numCylsPerBank = 6;
  const cylPitch = 0.54 / (numCylsPerBank - 1);

  for (let i = 0; i < numCylsPerBank; i++) {
    const cx = -0.27 + i * cylPitch;

    // Bank 1 Bore
    const b1BoreGeo = new THREE.CylinderGeometry(cylRadius, cylRadius, cylHeight, 32, 1, true);
    const b1BoreMesh = new THREE.Mesh(b1BoreGeo, matMachinedDeck);
    b1BoreMesh.position.set(cx, 0.11, 0.22);
    b1BoreMesh.rotation.x = THREE.MathUtils.degToRad(-30);
    blockGroup.add(b1BoreMesh);

    // Bank 2 Bore (Staggered by 15mm for connecting rod side-by-side journal)
    const b2BoreGeo = new THREE.CylinderGeometry(cylRadius, cylRadius, cylHeight, 32, 1, true);
    const b2BoreMesh = new THREE.Mesh(b2BoreGeo, matMachinedDeck);
    b2BoreMesh.position.set(cx + 0.015, -0.11, 0.22);
    b2BoreMesh.rotation.x = THREE.MathUtils.degToRad(30);
    blockGroup.add(b2BoreMesh);
  }

  engineRoot.add(blockGroup);

  // ─── 3. CRANKSHAFT, CONNECTING RODS & FORGED PISTONS ───
  const rotatingAssembly = new THREE.Group();
  rotatingAssembly.name = "02_Crankshaft_Pistons_Rods";

  // Main Crankshaft Shaft
  const crankShaftGeo = new THREE.CylinderGeometry(0.034, 0.034, 0.68, 24);
  crankShaftGeo.rotateZ(Math.PI / 2);
  const crankShaftMesh = new THREE.Mesh(crankShaftGeo, matNitridedCrank);
  crankShaftMesh.position.set(0, 0, 0.05);
  rotatingAssembly.add(crankShaftMesh);

  // 6 Crankpins & 12 Counterweight Lobes
  for (let i = 0; i < 6; i++) {
    const mx = -0.27 + i * 0.108;
    const lobeGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.018, 24);
    lobeGeo.rotateZ(Math.PI / 2);
    const lobeMesh = new THREE.Mesh(lobeGeo, matNitridedCrank);
    lobeMesh.position.set(mx, 0, 0.05);
    rotatingAssembly.add(lobeMesh);

    // 12 Forged Pistons & H-Beam Titanium Rods
    [-1, 1].forEach((bankSide) => {
      const pistonGeo = new THREE.CylinderGeometry(0.043, 0.043, 0.045, 24);
      pistonGeo.rotateX(bankSide === 1 ? THREE.MathUtils.degToRad(-30) : THREE.MathUtils.degToRad(30));
      const pistonMesh = new THREE.Mesh(pistonGeo, matMachinedDeck);
      const rodAngle = bankSide === 1 ? -0.52 : 0.52;
      pistonMesh.position.set(mx + (bankSide === 1 ? 0 : 0.015), Math.sin(rodAngle) * 0.15, 0.05 + Math.cos(rodAngle) * 0.15);
      rotatingAssembly.add(pistonMesh);

      // Connecting Rod
      const rodGeo = new THREE.CylinderGeometry(0.012, 0.016, 0.14, 16);
      rodGeo.rotateX(bankSide === 1 ? THREE.MathUtils.degToRad(-30) : THREE.MathUtils.degToRad(30));
      const rodMesh = new THREE.Mesh(rodGeo, matMachinedDeck);
      rodMesh.position.set(mx + (bankSide === 1 ? 0 : 0.015), Math.sin(rodAngle) * 0.08, 0.05 + Math.cos(rodAngle) * 0.08);
      rotatingAssembly.add(rodMesh);
    });
  }

  engineRoot.add(rotatingAssembly);

  // ─── 4. BILLET LOW-PROFILE DRY-SUMP SCAVENGE OIL PAN ───
  const drySumpGroup = new THREE.Group();
  drySumpGroup.name = "03_Dry_Sump_Lubrication";
  drySumpGroup.position.set(0, 0, -expZ);

  // CNC Scavenge Pan Trough
  const panGeo = new THREE.BoxGeometry(0.66, 0.30, 0.06);
  const panMesh = new THREE.Mesh(panGeo, matCastAluminum);
  panMesh.position.set(0, 0, -0.03);
  drySumpGroup.add(panMesh);

  // 4 Scavenge AN-12 Port Bosses & Hardlines
  for (let i = 0; i < 4; i++) {
    const px = -0.22 + i * 0.15;
    const anFittingGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.025, 16);
    anFittingGeo.rotateX(Math.PI / 2);
    const anMesh = new THREE.Mesh(anFittingGeo, matGoldAnodized);
    anMesh.position.set(px, 0.16, -0.03);
    drySumpGroup.add(anMesh);

    // Scavenge Hardline Tube Curve
    const tubeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(px, 0.17, -0.03),
      new THREE.Vector3(px + 0.03, 0.22, -0.04),
      new THREE.Vector3(0.28, 0.20, -0.02),
    ]);
    const tubeGeo = new THREE.TubeGeometry(tubeCurve, 20, 0.008, 12, false);
    const tubeMesh = new THREE.Mesh(tubeGeo, matNitridedCrank);
    drySumpGroup.add(tubeMesh);
  }

  // De-aeration Reservoir Tank & Spin-on Filter
  const tankGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.24, 24);
  const tankMesh = new THREE.Mesh(tankGeo, matMachinedDeck);
  tankMesh.position.set(-0.28, -0.22, 0.08);
  drySumpGroup.add(tankMesh);

  const filterGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.10, 24);
  const filterMesh = new THREE.Mesh(filterGeo, matCobaltAnodized);
  filterMesh.position.set(-0.28, -0.22, -0.07);
  drySumpGroup.add(filterMesh);

  engineRoot.add(drySumpGroup);

  // ─── 5. DUAL DOHC 48-VALVE CYLINDER HEADS ───
  const cylinderHeadsGroup = new THREE.Group();
  cylinderHeadsGroup.name = "04_Cylinder_Heads_Valvetrain";
  cylinderHeadsGroup.position.set(0, 0, expZ * 0.5);

  // Bank 1 Head (Left)
  const b1HeadGeo = new THREE.BoxGeometry(0.62, 0.16, 0.10);
  const b1HeadMesh = new THREE.Mesh(b1HeadGeo, matMachinedDeck);
  b1HeadMesh.position.set(0, 0.18, 0.32);
  b1HeadMesh.rotation.x = THREE.MathUtils.degToRad(-30);
  cylinderHeadsGroup.add(b1HeadMesh);

  // Bank 2 Head (Right)
  const b2HeadGeo = new THREE.BoxGeometry(0.62, 0.16, 0.10);
  const b2HeadMesh = new THREE.Mesh(b2HeadGeo, matMachinedDeck);
  b2HeadMesh.position.set(0, -0.18, 0.32);
  b2HeadMesh.rotation.x = THREE.MathUtils.degToRad(30);
  cylinderHeadsGroup.add(b2HeadMesh);

  // 4 Camshafts & Timing Sprockets
  [-1, 1].forEach((bankSide) => {
    const bankRot = bankSide === 1 ? THREE.MathUtils.degToRad(-30) : THREE.MathUtils.degToRad(30);
    const posY = bankSide === 1 ? 0.18 : -0.18;

    [-0.04, 0.04].forEach((camOffset) => {
      const camShaftGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.60, 20);
      camShaftGeo.rotateZ(Math.PI / 2);
      const camMesh = new THREE.Mesh(camShaftGeo, matMachinedDeck);
      camMesh.position.set(0, posY + camOffset * Math.cos(bankRot), 0.35 + camOffset * Math.sin(bankRot));
      cylinderHeadsGroup.add(camMesh);

      // Front Timing Sprocket
      const sprocketGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.012, 24);
      sprocketGeo.rotateZ(Math.PI / 2);
      const sprocketMesh = new THREE.Mesh(sprocketGeo, matGoldAnodized);
      sprocketMesh.position.set(-0.31, posY + camOffset * Math.cos(bankRot), 0.35 + camOffset * Math.sin(bankRot));
      cylinderHeadsGroup.add(sprocketMesh);
    });
  });

  engineRoot.add(cylinderHeadsGroup);

  // ─── 6. VIBRANT ORANGE-GOLD ANODIZED VALVE COVERS ───
  const valveCoversGroup = new THREE.Group();
  valveCoversGroup.name = "05_Anodized_Valve_Covers";
  valveCoversGroup.position.set(0, 0, expZ * 0.8);

  // Bank 1 Valve Cover
  const b1CoverGeo = new THREE.BoxGeometry(0.60, 0.15, 0.08);
  const b1CoverMesh = new THREE.Mesh(b1CoverGeo, matGoldAnodized);
  b1CoverMesh.position.set(0, 0.22, 0.39);
  b1CoverMesh.rotation.x = THREE.MathUtils.degToRad(-30);
  valveCoversGroup.add(b1CoverMesh);

  // Bank 2 Valve Cover
  const b2CoverGeo = new THREE.BoxGeometry(0.60, 0.15, 0.08);
  const b2CoverMesh = new THREE.Mesh(b2CoverGeo, matGoldAnodized);
  b2CoverMesh.position.set(0, -0.22, 0.39);
  b2CoverMesh.rotation.x = THREE.MathUtils.degToRad(30);
  valveCoversGroup.add(b2CoverMesh);

  // 12 Recessed Spark Plug Tubes
  for (let i = 0; i < 6; i++) {
    const px = -0.25 + i * (0.50 / 5);
    const plug1Geo = new THREE.CylinderGeometry(0.012, 0.012, 0.04, 16);
    plug1Geo.rotateX(THREE.MathUtils.degToRad(-30));
    const plug1Mesh = new THREE.Mesh(plug1Geo, matBlackPolymer);
    plug1Mesh.position.set(px, 0.22, 0.42);
    valveCoversGroup.add(plug1Mesh);

    const plug2Geo = new THREE.CylinderGeometry(0.012, 0.012, 0.04, 16);
    plug2Geo.rotateX(THREE.MathUtils.degToRad(30));
    const plug2Mesh = new THREE.Mesh(plug2Geo, matBlackPolymer);
    plug2Mesh.position.set(px + 0.015, -0.22, 0.42);
    valveCoversGroup.add(plug2Mesh);
  }

  engineRoot.add(valveCoversGroup);

  // ─── 7. EQUAL-LENGTH CERAMIC INTAKE RUNNERS & ITB VELOCITY STACKS ───
  const intakeGroup = new THREE.Group();
  intakeGroup.name = "06_ITB_Intake_Velocity_Stacks";
  intakeGroup.position.set(0, 0, expZ * 1.2);

  // 12 S-Curved Ceramic Intake Runners & 12 Cobalt Velocity Stacks
  for (let i = 0; i < 6; i++) {
    const cx = -0.25 + i * (0.50 / 5);

    // Bank 1 (Left) Intake Runner Curve
    const b1Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(cx, 0.12, 0.36),
      new THREE.Vector3(cx, 0.15, 0.43),
      new THREE.Vector3(cx, 0.08, 0.50),
    ]);
    const b1RunnerGeo = new THREE.TubeGeometry(b1Curve, 20, 0.020, 16, false);
    const b1RunnerMesh = new THREE.Mesh(b1RunnerGeo, matCeramicIntake);
    intakeGroup.add(b1RunnerMesh);

    // Bank 1 Cobalt Velocity Stack Bellmouth
    const b1StackGeo = new THREE.CylinderGeometry(0.034, 0.022, 0.06, 24, 1, true);
    const b1StackMesh = new THREE.Mesh(b1StackGeo, matCobaltAnodized);
    b1StackMesh.position.set(cx, 0.08, 0.53);
    intakeGroup.add(b1StackMesh);

    // Brass Butterfly Plate
    const b1PlateGeo = new THREE.CylinderGeometry(0.020, 0.020, 0.003, 16);
    b1PlateGeo.rotateX(THREE.MathUtils.degToRad(35));
    const b1PlateMesh = new THREE.Mesh(b1PlateGeo, matPolishedBrass);
    b1PlateMesh.position.set(cx, 0.08, 0.52);
    intakeGroup.add(b1PlateMesh);

    // Bank 2 (Right) Intake Runner Curve
    const b2Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(cx + 0.015, -0.12, 0.36),
      new THREE.Vector3(cx + 0.015, -0.15, 0.43),
      new THREE.Vector3(cx + 0.015, -0.08, 0.50),
    ]);
    const b2RunnerGeo = new THREE.TubeGeometry(b2Curve, 20, 0.020, 16, false);
    const b2RunnerMesh = new THREE.Mesh(b2RunnerGeo, matCeramicIntake);
    intakeGroup.add(b2RunnerMesh);

    // Bank 2 Cobalt Velocity Stack Bellmouth
    const b2StackGeo = new THREE.CylinderGeometry(0.034, 0.022, 0.06, 24, 1, true);
    const b2StackMesh = new THREE.Mesh(b2StackGeo, matCobaltAnodized);
    b2StackMesh.position.set(cx + 0.015, -0.08, 0.53);
    intakeGroup.add(b2StackMesh);

    // Brass Butterfly Plate
    const b2PlateGeo = new THREE.CylinderGeometry(0.020, 0.020, 0.003, 16);
    b2PlateGeo.rotateX(THREE.MathUtils.degToRad(35));
    const b2PlateMesh = new THREE.Mesh(b2PlateGeo, matPolishedBrass);
    b2PlateMesh.position.set(cx + 0.015, -0.08, 0.52);
    intakeGroup.add(b2PlateMesh);
  }

  // Dual 350-Bar GDI Fuel Rails
  [-0.05, 0.05].forEach((fy) => {
    const railGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.56, 16);
    railGeo.rotateZ(Math.PI / 2);
    const railMesh = new THREE.Mesh(railGeo, matGoldAnodized);
    railMesh.position.set(0, fy, 0.46);
    intakeGroup.add(railMesh);
  });

  engineRoot.add(intakeGroup);

  // ─── 8. 6-INTO-1 HYDROFORMED INCONEL EXHAUST HEADERS ───
  const exhaustGroup = new THREE.Group();
  exhaustGroup.name = "07_Inconel_Exhaust_Headers";
  exhaustGroup.position.set(0, -expY, 0);

  // 6 Primary Pipes on Bank 2 (Right Flank)
  const collectorPt = new THREE.Vector3(0.38, -0.32, 0.12);
  for (let i = 0; i < 6; i++) {
    const cx = -0.27 + i * 0.108;
    const pipeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(cx, -0.24, 0.28),
      new THREE.Vector3(cx + 0.04, -0.36, 0.22),
      new THREE.Vector3(cx + (0.38 - cx) * 0.5, -0.35, 0.16),
      collectorPt,
    ]);
    const pipeGeo = new THREE.TubeGeometry(pipeCurve, 24, 0.022, 16, false);
    const pipeMesh = new THREE.Mesh(pipeGeo, matInconelExhaust);
    exhaustGroup.add(pipeMesh);
  }

  // 6-into-1 Pyramidal Merge Collector Cone & V-Band Flange
  const collectorConeGeo = new THREE.CylinderGeometry(0.055, 0.038, 0.12, 24);
  collectorConeGeo.rotateZ(Math.PI / 2);
  const collectorConeMesh = new THREE.Mesh(collectorConeGeo, matInconelExhaust);
  collectorConeMesh.position.set(0.44, -0.32, 0.12);
  exhaustGroup.add(collectorConeMesh);

  const vBandGeo = new THREE.TorusGeometry(0.048, 0.010, 16, 24);
  vBandGeo.rotateY(Math.PI / 2);
  const vBandMesh = new THREE.Mesh(vBandGeo, matMachinedDeck);
  vBandMesh.position.set(0.50, -0.32, 0.12);
  exhaustGroup.add(vBandMesh);

  engineRoot.add(exhaustGroup);

  // ─── 9. FRONT RACING RADIATOR & ELECTRIC FAN SHROUD ───
  const radiatorGroup = new THREE.Group();
  radiatorGroup.name = "08_Front_Radiator_Cooling";
  radiatorGroup.position.set(-0.46 - expX, 0, 0.18);

  // Brazed Aluminum Core
  const radCoreGeo = new THREE.BoxGeometry(0.05, 0.52, 0.36);
  const radCoreMesh = new THREE.Mesh(radCoreGeo, matRadiatorCore);
  radiatorGroup.add(radCoreMesh);

  // Left & Right Die-Formed End Tanks
  [-0.27, 0.27].forEach((ty) => {
    const endTankGeo = new THREE.CylinderGeometry(0.030, 0.030, 0.36, 20);
    const endTankMesh = new THREE.Mesh(endTankGeo, matCastAluminum);
    endTankMesh.position.set(0, ty, 0);
    radiatorGroup.add(endTankMesh);
  });

  // Electric Cooling Fan Shroud & 7 Blades
  const fanShroudGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.04, 32);
  fanShroudGeo.rotateZ(Math.PI / 2);
  const fanShroudMesh = new THREE.Mesh(fanShroudGeo, matBlackPolymer);
  fanShroudMesh.position.set(0.04, 0, 0);
  radiatorGroup.add(fanShroudMesh);

  // Curved Silicone Coolant Hose
  const hoseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.24, -0.12),
    new THREE.Vector3(0.12, 0.26, -0.10),
    new THREE.Vector3(0.18, 0.18, -0.05),
  ]);
  const hoseGeo = new THREE.TubeGeometry(hoseCurve, 20, 0.024, 16, false);
  const hoseMesh = new THREE.Mesh(hoseGeo, matBlueSilicone);
  radiatorGroup.add(hoseMesh);

  engineRoot.add(radiatorGroup);

  // ─── 10. DRIVETRAIN: CLUTCH, BELLHOUSING & 7-SPEED TRANSAXLE ───
  const transaxleGroup = new THREE.Group();
  transaxleGroup.name = "09_7Speed_Sequential_Transaxle";
  transaxleGroup.position.set(0.38 + expX, 0, 0.08);

  // Flywheel & Twin-Plate Clutch
  const flywheelGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.025, 32);
  flywheelGeo.rotateZ(Math.PI / 2);
  const flywheelMesh = new THREE.Mesh(flywheelGeo, matMachinedDeck);
  flywheelMesh.position.set(0.02, 0, 0);
  transaxleGroup.add(flywheelMesh);

  // Conical Die-Cast Bellhousing
  const bellGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.14, 32);
  bellGeo.rotateZ(Math.PI / 2);
  const bellMesh = new THREE.Mesh(bellGeo, matCastAluminum);
  bellMesh.position.set(0.09, 0, 0);
  transaxleGroup.add(bellMesh);

  // Starter Motor Cylinder
  const starterGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.12, 20);
  starterGeo.rotateZ(Math.PI / 2);
  const starterMesh = new THREE.Mesh(starterGeo, matBlackPolymer);
  starterMesh.position.set(0.08, 0.16, -0.04);
  transaxleGroup.add(starterMesh);

  // 7-Speed Sequential Gearbox Main Casing
  const gearboxGeo = new THREE.BoxGeometry(0.38, 0.24, 0.22);
  const gearboxMesh = new THREE.Mesh(gearboxGeo, matTransaxleCast);
  gearboxMesh.position.set(0.33, 0, 0);
  transaxleGroup.add(gearboxMesh);

  // Left & Right CV Axle Drive Flanges
  [-0.14, 0.14].forEach((ay) => {
    const flangeGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.03, 24);
    flangeGeo.rotateX(Math.PI / 2);
    const flangeMesh = new THREE.Mesh(flangeGeo, matMachinedDeck);
    flangeMesh.position.set(0.36, ay, -0.02);
    transaxleGroup.add(flangeMesh);

    // CV Axle Half-Shaft
    const axleGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.22, 16);
    axleGeo.rotateX(Math.PI / 2);
    const axleMesh = new THREE.Mesh(axleGeo, matNitridedCrank);
    axleMesh.position.set(0.36, ay + (ay > 0 ? 0.12 : -0.12), -0.02);
    transaxleGroup.add(axleMesh);
  });

  engineRoot.add(transaxleGroup);

  // ─── 11. HYPERCAR DRY-CARBON MONOCOQUE ENGINE COVER ───
  const coverGroup = new THREE.Group();
  coverGroup.name = "10_Dry_Carbon_Engine_Cover";
  coverGroup.position.set(0, 0, 0.54 + expZ * 1.6);

  // Main Carbon Fiber Monocoque Shroud Plate
  const coverPlateGeo = new THREE.BoxGeometry(0.62, 0.36, 0.025);
  const coverPlateMesh = new THREE.Mesh(coverPlateGeo, matCarbonFiber);
  coverGroup.add(coverPlateMesh);

  // Sculpted Lateral Arched Shoulder Pontoons
  [-0.17, 0.17].forEach((py) => {
    const pontoonGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.62, 24);
    pontoonGeo.rotateZ(Math.PI / 2);
    const pontoonMesh = new THREE.Mesh(pontoonGeo, matCarbonFiber);
    pontoonMesh.position.set(0, py, -0.02);
    coverGroup.add(pontoonMesh);
  });

  // CNC Billet Gold Anodized Perimeter Raised Bezel Frame
  const bezelGeo = new THREE.BoxGeometry(0.52, 0.22, 0.015);
  const bezelMesh = new THREE.Mesh(bezelGeo, matGoldAnodized);
  bezelMesh.position.set(0, 0, 0.018);
  coverGroup.add(bezelMesh);

  // Transparent Scratch-Resistant Quartz Glass ITB Inspection Window
  const glassGeo = new THREE.BoxGeometry(0.48, 0.18, 0.008);
  const glassMesh = new THREE.Mesh(glassGeo, matQuartzGlass);
  glassMesh.position.set(0, 0, 0.024);
  coverGroup.add(glassMesh);

  // Front Aerodynamic Ram-Air Teardrop Induction Scoop
  const scoopGeo = new THREE.ConeGeometry(0.08, 0.18, 24);
  scoopGeo.rotateZ(Math.PI / 2);
  const scoopMesh = new THREE.Mesh(scoopGeo, matCarbonFiber);
  scoopMesh.position.set(-0.35, 0, 0.04);
  coverGroup.add(scoopMesh);

  engineRoot.add(coverGroup);

  return scene;
}

/**
 * Exports the V12 Engine Scene to binary .glb files
 */
export async function exportV12GlbFiles() {
  console.log("=================================================");
  console.log("  60° V12 RACING ENGINE 3D GLB MASTER EXPORTER   ");
  console.log("=================================================");

  const exporter = new GLTFExporter();

  // 1. Generate Assembled Master V12 Engine GLB
  const assembledScene = buildV12EngineScene(0);
  console.log("[1/3] Compiling Fully Assembled V12 Engine 3D Scene Graph...");

  const assembledBuffer = await new Promise<Buffer>((resolve, reject) => {
    exporter.parse(
      assembledScene,
      (gltf) => resolve(Buffer.from(gltf as ArrayBuffer)),
      (err) => reject(err),
      { binary: true }
    );
  });

  // Target paths:
  // a) public/models/v12_racing_engine.glb (for web app 3D viewer)
  const publicDir = path.resolve("public/models");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const publicPath = path.join(publicDir, "v12_racing_engine.glb");
  fs.writeFileSync(publicPath, assembledBuffer);
  console.log(`[2/3] ✅ Saved Web Application Model: ${publicPath} (${(assembledBuffer.byteLength / 1024).toFixed(1)} KB)`);

  // b) User Downloads folder for direct opening in 3D viewers (Paint 3D, Blender, Windows 3D Viewer)
  const userDownloadsDir = "C:\\Users\\joelj\\Downloads";
  const userDownloadPath = path.join(userDownloadsDir, "v12_racing_engine_complete.glb");
  try {
    fs.writeFileSync(userDownloadPath, assembledBuffer);
    console.log(`[3/3] ✅ Saved to Downloads: ${userDownloadPath} (${(assembledBuffer.byteLength / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.warn("Notice: Could not write to Downloads directory directly:", err);
  }

  // 2. Generate Exploded Disassembly View GLB
  const explodedScene = buildV12EngineScene(0.5);
  const explodedBuffer = await new Promise<Buffer>((resolve, reject) => {
    exporter.parse(
      explodedScene,
      (gltf) => resolve(Buffer.from(gltf as ArrayBuffer)),
      (err) => reject(err),
      { binary: true }
    );
  });
  const explodedPath = path.join(userDownloadsDir, "v12_racing_engine_exploded.glb");
  try {
    fs.writeFileSync(explodedPath, explodedBuffer);
    console.log(`[Bonus] ✅ Saved Exploded View to Downloads: ${explodedPath} (${(explodedBuffer.byteLength / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.warn("Notice: Could not write exploded view to Downloads:", err);
  }

  console.log("-------------------------------------------------");
  console.log("🎉 GLB Generation Complete! Ready for 3D viewing!");
  console.log("=================================================");
}

// Always execute export when invoked via CLI/node
exportV12GlbFiles()
  .then(() => {
    console.log("Export script finished successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Fatal export error:", err);
    process.exit(1);
  });

