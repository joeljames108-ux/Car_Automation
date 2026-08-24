import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import * as fs from "fs";
import * as path from "path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, KHRMaterialsClearcoat, KHRMaterialsTransmission, KHRMaterialsIOR } from "@gltf-transform/extensions";

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
 * HIGH-FIDELITY HYPERCAR REAR ASSEMBLY 3D GLB MASTER GENERATOR
 * ════════════════════════════════════════════════════════════════════════════════
 *
 * Generates photorealistic glTF 2.0 binary (.glb) models for the Rear Section of
 * the car including:
 *  - Muscular Rear Fender Haunches & Fastback C-Pillar Decklid
 *  - Active Swan-Neck Aero Rear Wing with DRS Actuators
 *  - Venturi Underbody Diffuser with 5 Aerodynamic Strakes
 *  - Continuous 3D OLED Edge-Lit Taillight Bar & Central FIA Rain Light
 *  - Quad Heat-Tinted Titanium Exhaust Tailpipes & Muffler Box
 *  - Rear Subframe, Differential, CV Axles, Suspension & Forged Wheels
 */
export function buildRearCarScene(explodedAmount: number = 0): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = "Hypercar_Rear_Assembly_Master";

  // ─── 1. PBR MASTER MATERIALS PALETTE ───
  const matBodyPaint = new THREE.MeshStandardMaterial({
    name: "Clearcoat_Apex_Blue_Paint",
    color: 0x0284c7,
    metalness: 0.88,
    roughness: 0.18,
  });

  const matDryCarbon = new THREE.MeshStandardMaterial({
    name: "Autoclaved_2x2_Twill_Dry_Carbon",
    color: 0x111827,
    metalness: 0.45,
    roughness: 0.32,
  });

  const matTitaniumExhaust = new THREE.MeshStandardMaterial({
    name: "Billet_Titanium_Heat_Tinted",
    color: 0x93c5fd,
    metalness: 0.95,
    roughness: 0.22,
  });

  const matExhaustHeatBurn = new THREE.MeshStandardMaterial({
    name: "Titanium_Exhaust_Tip_Flame_Tint",
    color: 0x6366f1,
    metalness: 0.92,
    roughness: 0.20,
  });

  const matOledLightbar = new THREE.MeshStandardMaterial({
    name: "OLED_Taillight_Emissive_Red",
    color: 0xdc2626,
    emissive: 0xef4444,
    emissiveIntensity: 2.8,
    roughness: 0.1,
  });

  const matFiaRainLight = new THREE.MeshStandardMaterial({
    name: "FIA_Rain_Strobe_Amber_Emissive",
    color: 0xf59e0b,
    emissive: 0xfbbf24,
    emissiveIntensity: 3.5,
    roughness: 0.1,
  });

  const matSmokedGlass = new THREE.MeshPhysicalMaterial({
    name: "Smoked_Rear_Backlite_Glass",
    color: 0x0f172a,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.75,
    opacity: 0.85,
    transparent: true,
  });

  const matAluSubframe = new THREE.MeshStandardMaterial({
    name: "Cast_Aluminum_Rear_Subframe",
    color: 0x94a3b8,
    metalness: 0.82,
    roughness: 0.38,
  });

  const matMachinedSteel = new THREE.MeshStandardMaterial({
    name: "Machined_ChroMoly_Steel",
    color: 0xcbd5e1,
    metalness: 0.90,
    roughness: 0.20,
  });

  const matBrakeDisc = new THREE.MeshStandardMaterial({
    name: "Carbon_Ceramic_Brake_Matrix",
    color: 0x334155,
    metalness: 0.75,
    roughness: 0.45,
  });

  const matBrakeCaliper = new THREE.MeshStandardMaterial({
    name: "Red_Anodized_Brake_Caliper",
    color: 0xb91c1c,
    metalness: 0.80,
    roughness: 0.25,
  });

  const matTireRubber = new THREE.MeshStandardMaterial({
    name: "High_Grip_Comp_Tire_Rubber",
    color: 0x1e293b,
    metalness: 0.05,
    roughness: 0.92,
  });

  const matForgedWheel = new THREE.MeshStandardMaterial({
    name: "Forged_Satin_Black_Wheel",
    color: 0x0f172a,
    metalness: 0.85,
    roughness: 0.25,
  });

  // Master Rear Root Group
  const rearRoot = new THREE.Group();
  rearRoot.name = "Rear_Car_Master_Assembly";
  scene.add(rearRoot);

  const expZ = explodedAmount * 0.18; // Z offset
  const expY = explodedAmount * 0.12; // Y offset
  const expX = explodedAmount * 0.15; // X offset

  // ─── 2. REAR BODYWORK SHELL & FASTBACK DECKLID ───
  const bodyworkGroup = new THREE.Group();
  bodyworkGroup.name = "01_Rear_Bodywork_Shell";

  // LH Rear Quarter Fender Haunch
  const fenderGeoLH = new THREE.BoxGeometry(0.55, 0.48, 1.25);
  const fenderLH = new THREE.Mesh(fenderGeoLH, matBodyPaint);
  fenderLH.position.set(-0.78 - expX, 0.52 + expY, 0.60);
  fenderLH.rotation.z = -0.08;
  bodyworkGroup.add(fenderLH);

  // RH Rear Quarter Fender Haunch
  const fenderRH = new THREE.Mesh(fenderGeoLH, matBodyPaint);
  fenderRH.position.set(0.78 + expX, 0.52 + expY, 0.60);
  fenderRH.rotation.z = 0.08;
  bodyworkGroup.add(fenderRH);

  // Rear Trunk Decklid & Engine Cover Louvers
  const decklidGeo = new THREE.BoxGeometry(1.05, 0.08, 0.95);
  const decklidMesh = new THREE.Mesh(decklidGeo, matBodyPaint);
  decklidMesh.position.set(0, 0.72 + expY * 1.5, 0.45);
  bodyworkGroup.add(decklidMesh);

  // Engine Deck Cooling Louvers (5 slats)
  for (let i = 0; i < 5; i++) {
    const louverGeo = new THREE.BoxGeometry(0.75, 0.015, 0.08);
    const louverMesh = new THREE.Mesh(louverGeo, matDryCarbon);
    louverMesh.position.set(0, 0.76 + expY * 1.5, 0.20 + i * 0.12);
    louverMesh.rotation.x = -0.22;
    bodyworkGroup.add(louverMesh);
  }

  // Tinted Rear Backlite Window Glass
  const windowGeo = new THREE.BoxGeometry(0.92, 0.02, 0.55);
  const windowMesh = new THREE.Mesh(windowGeo, matSmokedGlass);
  windowMesh.position.set(0, 0.82 + expY * 1.8, -0.25);
  windowMesh.rotation.x = 0.45;
  bodyworkGroup.add(windowMesh);

  // Rear Bumper Fascia Shell
  const bumperGeo = new THREE.BoxGeometry(1.92, 0.45, 0.35);
  const bumperMesh = new THREE.Mesh(bumperGeo, matBodyPaint);
  bumperMesh.position.set(0, 0.38, 1.18 + expZ);
  bodyworkGroup.add(bumperMesh);

  rearRoot.add(bodyworkGroup);

  // ─── 3. ACTIVE SWAN-NECK GT3 REAR WING ASSEMBLY ───
  const wingGroup = new THREE.Group();
  wingGroup.name = "02_Active_SwanNeck_Rear_Wing";
  wingGroup.position.set(0, 0.95 + expY * 2, 1.15 + expZ * 1.8);

  const span = 1.72; // Wing span in meters
  const chord = 0.34; // Chord length in meters

  // Curved Main Airfoil Blade
  const bladeGeo = new THREE.BoxGeometry(span, 0.03, chord);
  const bladeMesh = new THREE.Mesh(bladeGeo, matDryCarbon);
  bladeMesh.rotation.x = 0.22; // 12.5 deg Angle of Attack
  bladeMesh.castShadow = true;
  wingGroup.add(bladeMesh);

  // Gurney Flap (Trailing edge lip)
  const gurneyGeo = new THREE.BoxGeometry(span - 0.04, 0.015, 0.015);
  const gurneyMesh = new THREE.Mesh(gurneyGeo, matDryCarbon);
  gurneyMesh.position.set(0, 0.02, chord / 2);
  wingGroup.add(gurneyMesh);

  // LH & RH Vertical Aero Endplates
  const endplateGeo = new THREE.BoxGeometry(0.015, 0.24, chord * 1.3);
  const endplateLH = new THREE.Mesh(endplateGeo, matDryCarbon);
  endplateLH.position.set(-span / 2, 0, 0);
  const endplateRH = new THREE.Mesh(endplateGeo, matDryCarbon);
  endplateRH.position.set(span / 2, 0, 0);
  wingGroup.add(endplateLH, endplateRH);

  // Dual CNC Billet Swan-Neck Mount Pylons
  [-0.42, 0.42].forEach((px) => {
    const pylonShape = new THREE.BoxGeometry(0.03, 0.38, 0.06);
    const pylonMesh = new THREE.Mesh(pylonShape, matDryCarbon);
    pylonMesh.position.set(px, -0.16, -0.05);
    pylonMesh.rotation.x = -0.30;
    wingGroup.add(pylonMesh);

    // DRS Actuator Hydraulic Cylinder
    const drsActuatorGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.12, 16);
    const drsMesh = new THREE.Mesh(drsActuatorGeo, matMachinedSteel);
    drsMesh.position.set(px, -0.05, 0.02);
    wingGroup.add(drsMesh);
  });

  rearRoot.add(wingGroup);

  // ─── 4. UNDERBODY VENTURI REAR DIFFUSER ───
  const diffuserGroup = new THREE.Group();
  diffuserGroup.name = "03_Underbody_Venturi_Diffuser";
  diffuserGroup.position.set(0, 0.12 - expY, 0.95 + expZ * 1.2);

  // Main Slanted Venturi Expansion Tray
  const trayGeo = new THREE.BoxGeometry(1.65, 0.025, 0.88);
  const trayMesh = new THREE.Mesh(trayGeo, matDryCarbon);
  trayMesh.rotation.x = -0.25; // 14° Venturi expansion angle
  trayMesh.castShadow = true;
  diffuserGroup.add(trayMesh);

  // 5 Vertical Aerodynamic Strakes / Fins
  const strakeCount = 5;
  const strakeStep = 1.35 / (strakeCount - 1);
  for (let i = 0; i < strakeCount; i++) {
    const sx = -0.675 + i * strakeStep;
    const strakeGeo = new THREE.BoxGeometry(0.015, 0.14, 0.82);
    const strakeMesh = new THREE.Mesh(strakeGeo, matDryCarbon);
    strakeMesh.position.set(sx, -0.06, 0);
    strakeMesh.rotation.x = -0.25;
    diffuserGroup.add(strakeMesh);
  }

  // LH & RH Side Skirt Aero Extension Wings
  [-0.92, 0.92].forEach((skx) => {
    const skirtGeo = new THREE.BoxGeometry(0.18, 0.02, 0.75);
    const skirtMesh = new THREE.Mesh(skirtGeo, matDryCarbon);
    skirtMesh.position.set(skx, -0.02, -0.10);
    diffuserGroup.add(skirtMesh);
  });

  rearRoot.add(diffuserGroup);

  // ─── 5. OLED 3D LIGHTBAR & TAILLIGHT ASSEMBLY ───
  const lightsGroup = new THREE.Group();
  lightsGroup.name = "04_OLED_Rear_Lighting_System";
  lightsGroup.position.set(0, 0.54 + expY, 1.22 + expZ * 1.5);

  // Full-Width Continuous 3D OLED Lightbar
  const lightbarGeo = new THREE.BoxGeometry(1.68, 0.045, 0.05);
  const lightbarMesh = new THREE.Mesh(lightbarGeo, matOledLightbar);
  lightsGroup.add(lightbarMesh);

  // LH & RH C-Shaped OLED Taillight Clusters
  [-0.75, 0.75].forEach((lx) => {
    const clusterGeo = new THREE.BoxGeometry(0.28, 0.14, 0.08);
    const clusterMesh = new THREE.Mesh(clusterGeo, matOledLightbar);
    clusterMesh.position.set(lx, 0.02, 0);
    lightsGroup.add(clusterMesh);
  });

  // Central FIA Rain Strobe Safety Light
  const fiaGeo = new THREE.BoxGeometry(0.12, 0.08, 0.04);
  const fiaMesh = new THREE.Mesh(fiaGeo, matFiaRainLight);
  fiaMesh.position.set(0, -0.28, -0.02);
  lightsGroup.add(fiaMesh);

  rearRoot.add(lightsGroup);

  // ─── 6. QUAD TITANIUM EXHAUST SYSTEM ───
  const exhaustGroup = new THREE.Group();
  exhaustGroup.name = "05_Quad_Titanium_Exhaust_System";
  exhaustGroup.position.set(0, 0.32, 1.25 + expZ * 1.4);

  // Transverse Titanium Muffler Silencer Box
  const mufflerGeo = new THREE.BoxGeometry(0.72, 0.22, 0.28);
  const mufflerMesh = new THREE.Mesh(mufflerGeo, matTitaniumExhaust);
  mufflerMesh.position.set(0, 0, -0.22);
  exhaustGroup.add(mufflerMesh);

  // Quad Heat-Tinted Titanium Tailpipes (2 LH, 2 RH)
  const pipeOffsets = [-0.28, -0.18, 0.18, 0.28];
  pipeOffsets.forEach((px) => {
    // Outer Pipe Ring
    const pipeGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.18, 24);
    pipeGeo.rotateX(Math.PI / 2);
    const pipeMesh = new THREE.Mesh(pipeGeo, matTitaniumExhaust);
    pipeMesh.position.set(px, 0, 0.02);
    exhaustGroup.add(pipeMesh);

    // Blue/Purple Flame Heat Burn Tip Ring
    const tipRingGeo = new THREE.TorusGeometry(0.045, 0.006, 16, 24);
    const tipRingMesh = new THREE.Mesh(tipRingGeo, matExhaustHeatBurn);
    tipRingMesh.position.set(px, 0, 0.11);
    exhaustGroup.add(tipRingMesh);
  });

  // Carbon Fiber Exhaust Surround Trim Aperture
  const surroundGeo = new THREE.BoxGeometry(0.76, 0.14, 0.02);
  const surroundMesh = new THREE.Mesh(surroundGeo, matDryCarbon);
  surroundMesh.position.set(0, 0, -0.02);
  exhaustGroup.add(surroundMesh);

  rearRoot.add(exhaustGroup);

  // ─── 7. REAR CHASSIS SUBFRAME, DIFFERENTIAL & SUSPENSION ───
  const chassisGroup = new THREE.Group();
  chassisGroup.name = "06_Rear_Chassis_Suspension_Drivetrain";

  // Tubular Rear Aluminum Subframe
  const subframeGeo = new THREE.BoxGeometry(1.22, 0.28, 0.78);
  const subframeMesh = new THREE.Mesh(subframeGeo, matAluSubframe);
  subframeMesh.position.set(0, 0.26 - expY, 0.45);
  chassisGroup.add(subframeMesh);

  // 7-Speed Rear Transaxle Differential Housing
  const diffGeo = new THREE.SphereGeometry(0.18, 20, 20);
  const diffMesh = new THREE.Mesh(diffGeo, matMachinedSteel);
  diffMesh.position.set(0, 0.26, 0.45);
  chassisGroup.add(diffMesh);

  // LH & RH CV Drive Axle Half-Shafts
  [-0.45, 0.45].forEach((ax) => {
    const axleGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.42, 16);
    axleGeo.rotateZ(Math.PI / 2);
    const axleMesh = new THREE.Mesh(axleGeo, matMachinedSteel);
    axleMesh.position.set(ax, 0.26, 0.45);
    chassisGroup.add(axleMesh);
  });

  // LH & RH Rear 335/30ZR21 Wheel & Carbon Brake Assemblies
  [-0.82, 0.82].forEach((wx) => {
    const isLH = wx < 0;
    const sideExp = isLH ? -expX : expX;

    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(wx + sideExp, 0.32, 0.45);

    // Performance Tire (335mm Width, 0.35m Radius)
    const tireGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.335, 32);
    tireGeo.rotateZ(Math.PI / 2);
    const tireMesh = new THREE.Mesh(tireGeo, matTireRubber);
    wheelGroup.add(tireMesh);

    // Forged Satin Black Wheel Rim
    const rimGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.34, 24);
    rimGeo.rotateZ(Math.PI / 2);
    const rimMesh = new THREE.Mesh(rimGeo, matForgedWheel);
    wheelGroup.add(rimMesh);

    // Carbon Ceramic Brake Rotor (Drilled)
    const discGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.032, 32);
    discGeo.rotateZ(Math.PI / 2);
    const discMesh = new THREE.Mesh(discGeo, matBrakeDisc);
    wheelGroup.add(discMesh);

    // 6-Piston Red Monobloc Brake Caliper
    const caliperGeo = new THREE.BoxGeometry(0.08, 0.16, 0.22);
    const caliperMesh = new THREE.Mesh(caliperGeo, matBrakeCaliper);
    caliperMesh.position.set(isLH ? 0.04 : -0.04, 0.10, 0.08);
    wheelGroup.add(caliperMesh);

    chassisGroup.add(wheelGroup);
  });

  rearRoot.add(chassisGroup);

  return scene;
}

/**
 * Optimizes a binary GLB buffer using @gltf-transform
 */
async function optimizeGlbBuffer(inputBuffer: Buffer): Promise<Buffer> {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const document = await io.readBinary(inputBuffer);

  // Add Khronos PBR Extensions
  document.createExtension(KHRMaterialsClearcoat).setRequired(false);
  document.createExtension(KHRMaterialsTransmission).setRequired(false);
  document.createExtension(KHRMaterialsIOR).setRequired(false);

  for (const material of document.getRoot().listMaterials()) {
    const name = material.getName();
    if (name.includes("Clearcoat") || name.includes("Paint") || name.includes("Dry_Carbon")) {
      const clearcoatExt = document.createExtension(KHRMaterialsClearcoat);
      const clearcoat = clearcoatExt.createClearcoat().setClearcoatFactor(0.92).setClearcoatRoughnessFactor(0.08);
      material.setExtension("KHR_materials_clearcoat", clearcoat);
    }
    if (name.includes("Smoked_Rear")) {
      const transExt = document.createExtension(KHRMaterialsTransmission);
      const transmission = transExt.createTransmission().setTransmissionFactor(0.85);
      material.setExtension("KHR_materials_transmission", transmission);

      const iorExt = document.createExtension(KHRMaterialsIOR);
      const ior = iorExt.createIOR().setIOR(1.52);
      material.setExtension("KHR_materials_ior", ior);
    }
  }

  const outputUint8 = await io.writeBinary(document);
  return Buffer.from(outputUint8);
}

/**
 * Main export function to generate and save rear car GLB assets
 */
export async function exportRearCarGlbFiles() {
  console.log("=================================================");
  console.log("  HYPERCAR REAR ASSEMBLY 3D GLB MASTER EXPORTER  ");
  console.log("=================================================");

  const exporter = new GLTFExporter();

  // 1. Generate Assembled Master Rear Car GLB Scene
  const assembledScene = buildRearCarScene(0);
  console.log("[1/5] Compiling Fully Assembled Hypercar Rear 3D Scene Graph...");

  const rawBuffer = await new Promise<Buffer>((resolve, reject) => {
    exporter.parse(
      assembledScene,
      (gltf) => resolve(Buffer.from(gltf as ArrayBuffer)),
      (err) => reject(err),
      { binary: true }
    );
  });

  console.log("[2/5] Optimizing with @gltf-transform & Khronos PBR Clearcoat Extensions...");
  const assembledBuffer = await optimizeGlbBuffer(rawBuffer);

  // Save to public/models/exterior/rear_car_assembly.glb
  const exteriorDir = path.resolve("public/models/exterior");
  if (!fs.existsSync(exteriorDir)) {
    fs.mkdirSync(exteriorDir, { recursive: true });
  }

  const mainPath = path.join(exteriorDir, "rear_car_assembly.glb");
  fs.writeFileSync(mainPath, assembledBuffer);
  console.log(`[3/5] ✅ Saved Master Web App Asset: ${mainPath} (${(assembledBuffer.byteLength / 1024).toFixed(1)} KB)`);

  // Save specific modular component GLBs (rear_bumper.glb, rear_diffuser.glb, rear_wing.glb, taillights.glb)
  const saveSubComponent = async (sceneName: string, subScene: THREE.Scene, fileName: string) => {
    const rawSub = await new Promise<Buffer>((res, rej) => {
      exporter.parse(subScene, (g) => res(Buffer.from(g as ArrayBuffer)), (e) => rej(e), { binary: true });
    });
    const optSub = await optimizeGlbBuffer(rawSub);
    const subPath = path.join(exteriorDir, fileName);
    fs.writeFileSync(subPath, optSub);
    console.log(`       -> Saved Modular Component (${sceneName}): ${subPath} (${(optSub.byteLength / 1024).toFixed(1)} KB)`);
  };

  // Build rear_bumper.glb
  const bumperScene = new THREE.Scene();
  bumperScene.add(buildRearCarScene(0).getObjectByName("01_Rear_Bodywork_Shell")?.clone() || new THREE.Group());
  await saveSubComponent("Rear Bumper Fascia", bumperScene, "rear_bumper.glb");

  // Build rear_diffuser.glb
  const diffuserScene = new THREE.Scene();
  diffuserScene.add(buildRearCarScene(0).getObjectByName("03_Underbody_Venturi_Diffuser")?.clone() || new THREE.Group());
  await saveSubComponent("Rear Diffuser", diffuserScene, "rear_diffuser.glb");

  // Build rear_wing.glb
  const wingScene = new THREE.Scene();
  wingScene.add(buildRearCarScene(0).getObjectByName("02_Active_SwanNeck_Rear_Wing")?.clone() || new THREE.Group());
  await saveSubComponent("Rear Wing", wingScene, "rear_wing.glb");

  // Build taillights.glb
  const lightScene = new THREE.Scene();
  lightScene.add(buildRearCarScene(0).getObjectByName("04_OLED_Rear_Lighting_System")?.clone() || new THREE.Group());
  await saveSubComponent("OLED Taillights", lightScene, "taillights.glb");

  // 4. Save to User Downloads folder for external viewing
  const userDownloadsDir = "C:\\Users\\joelj\\Downloads";
  const userDownloadPath = path.join(userDownloadsDir, "rear_car_assembly_complete.glb");
  try {
    fs.writeFileSync(userDownloadPath, assembledBuffer);
    console.log(`[4/5] ✅ Saved to Downloads: ${userDownloadPath} (${(assembledBuffer.byteLength / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.warn("Notice: Could not write to Downloads directory directly:", err);
  }

  // 5. Generate Exploded Disassembly View GLB
  const explodedScene = buildRearCarScene(0.5);
  const rawExploded = await new Promise<Buffer>((resolve, reject) => {
    exporter.parse(
      explodedScene,
      (gltf) => resolve(Buffer.from(gltf as ArrayBuffer)),
      (err) => reject(err),
      { binary: true }
    );
  });
  const explodedBuffer = await optimizeGlbBuffer(rawExploded);
  const explodedPath = path.join(userDownloadsDir, "rear_car_assembly_exploded.glb");
  try {
    fs.writeFileSync(explodedPath, explodedBuffer);
    console.log(`[5/5] ✅ Saved Exploded View to Downloads: ${explodedPath} (${(explodedBuffer.byteLength / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.warn("Notice: Could not write exploded view to Downloads:", err);
  }

  console.log("-------------------------------------------------");
  console.log("🎉 Rear Car GLB Generation Complete! Ready for 3D viewing!");
  console.log("=================================================");
}

// Execute export when invoked via CLI / node
exportRearCarGlbFiles()
  .then(() => {
    console.log("Export script finished successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Fatal export error:", err);
    process.exit(1);
  });
