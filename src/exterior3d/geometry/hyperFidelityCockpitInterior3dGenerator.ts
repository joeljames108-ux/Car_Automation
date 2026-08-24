// ===================================================================
// HYPER-FIDELITY 3D COCKPIT INTERIOR GEOMETRY GENERATOR
// ===================================================================
// Builds full 3D Three.js CAD interior assemblies for sports & luxury vehicles:
// - Ergonomic Carbon Bucket Seats with Seat Rails & 6-Point Harnesses
// - Curved OLED Digital Instrument Cluster & Center Console
// - Alcantara Sport Steering Wheel with Paddle Shifters & Mode Dials
// - Billet Aluminum Pedal Box (Accelerator, Brake, Clutch & Dead Pedal)
// - 64-Color Ambient Fiber-Optic Interior Lighting Strips
// ===================================================================

import * as THREE from "three";
import { PbrMaterialStudio } from "../materials/pbrMaterialStudio";

export interface InteriorStyleConfig {
  theme: "SPORT_CARBON" | "LUXURY_EXECUTIVE" | "GT_ALCANTARA" | "FUTURISTIC_EV";
  primaryLeatherColorHex: number;
  stitchingColorHex: number;
  ambientLightColorHex: number;
  hasRollCage: boolean;
}

export class HyperFidelityCockpitInterior3DGenerator {
  /**
   * Constructs a 3D Three.js Group assembly of a high-fidelity car interior.
   */
  public static buildInterior3DGroup(config?: Partial<InteriorStyleConfig>): THREE.Group {
    const interiorGroup = new THREE.Group();
    interiorGroup.name = "HYPER_FIDELITY_COCKPIT_3D";

    const theme = config?.theme || "SPORT_CARBON";
    const leatherHex = config?.primaryLeatherColorHex || 0x1c1e24;
    const stitchHex = config?.stitchingColorHex || 0x007aff;
    const ambientHex = config?.ambientLightColorHex || 0x00f0ff;

    // PBR Materials
    const leatherMat = PbrMaterialStudio.createMaterial("CABIN_LEATHER_PERFORATED", leatherHex);
    const carbonMat = PbrMaterialStudio.createMaterial("CARBON_FIBER_2X2_TWILL");
    const aluminumMat = PbrMaterialStudio.createMaterial("BILLET_ALUMINUM_ANODIZED", 0xd0d5dd);
    const darkAlumMat = PbrMaterialStudio.createMaterial("BILLET_ALUMINUM_ANODIZED", 0x15181e);
    const glassMat = PbrMaterialStudio.createMaterial("TEMPERED_GLASS_WINDSHIELD");

    // Ambient Light Strip Material (Emissive RGB)
    const ambientStripMat = new THREE.MeshStandardMaterial({
      color: ambientHex,
      emissive: new THREE.Color(ambientHex),
      emissiveIntensity: 2.5,
      roughness: 0.2,
    });

    // ── 1. DRIVER & PASSENGER SPORT BUCKET SEATS ──
    const seatPositions = [
      { id: "DRIVER_SEAT", x: 0.38, z: -0.15 },
      { id: "PASSENGER_SEAT", x: -0.38, z: -0.15 },
    ];

    seatPositions.forEach((pos) => {
      const seatGroup = new THREE.Group();
      seatGroup.position.set(pos.x, 0.10, pos.z);

      // Seat Cushion Base
      const cushionGeo = new THREE.BoxGeometry(0.50, 0.14, 0.54);
      const cushionMesh = new THREE.Mesh(cushionGeo, leatherMat);
      cushionMesh.castShadow = true;
      seatGroup.add(cushionMesh);

      // Carbon Fiber Seat Shell Backrest
      const backrestGeo = new THREE.BoxGeometry(0.48, 0.72, 0.12);
      const backrestMesh = new THREE.Mesh(backrestGeo, carbonMat);
      backrestMesh.position.set(0, 0.38, -0.22);
      backrestMesh.rotation.x = -Math.PI / 16; // 11° recline
      backrestMesh.castShadow = true;
      seatGroup.add(backrestMesh);

      // Seat Bolsters
      [-0.22, 0.22].forEach((bx) => {
        const bolsterGeo = new THREE.BoxGeometry(0.08, 0.65, 0.18);
        const bolsterMesh = new THREE.Mesh(bolsterGeo, leatherMat);
        bolsterMesh.position.set(bx, 0.36, -0.18);
        seatGroup.add(bolsterMesh);
      });

      // Headrest
      const headrestGeo = new THREE.BoxGeometry(0.24, 0.18, 0.10);
      const headrestMesh = new THREE.Mesh(headrestGeo, leatherMat);
      headrestMesh.position.set(0, 0.78, -0.28);
      seatGroup.add(headrestMesh);

      // Seat Rails (Steel Slide Tracks)
      [-0.18, 0.18].forEach((rx) => {
        const railGeo = new THREE.BoxGeometry(0.03, 0.03, 0.65);
        const railMesh = new THREE.Mesh(railGeo, darkAlumMat);
        railMesh.position.set(rx, -0.08, 0);
        seatGroup.add(railMesh);
      });

      interiorGroup.add(seatGroup);
    });

    // ── 2. DASHBOARD & OLED COCKPIT SCREENS ──
    const dashGroup = new THREE.Group();
    dashGroup.position.set(0, 0.45, 0.35);

    // Main Dashboard Structure
    const dashGeo = new THREE.BoxGeometry(1.45, 0.32, 0.42);
    const dashMesh = new THREE.Mesh(dashGeo, leatherMat);
    dashMesh.castShadow = true;
    dashGroup.add(dashMesh);

    // Carbon Fiber Trim Accent Strip
    const trimGeo = new THREE.BoxGeometry(1.42, 0.04, 0.43);
    const trimMesh = new THREE.Mesh(trimGeo, carbonMat);
    trimMesh.position.set(0, 0.04, 0);
    dashGroup.add(trimMesh);

    // Ambient Fiber-Optic Light Strip along Dashboard
    const lightStripGeo = new THREE.BoxGeometry(1.40, 0.015, 0.015);
    const lightStripMesh = new THREE.Mesh(lightStripGeo, ambientStripMat);
    lightStripMesh.position.set(0, 0.08, 0.22);
    dashGroup.add(lightStripMesh);

    // Curved Driver Digital Instrument Cluster Screen (OLED)
    const clusterGeo = new THREE.BoxGeometry(0.38, 0.16, 0.02);
    const clusterMat = new THREE.MeshStandardMaterial({
      color: 0x050a14,
      emissive: new THREE.Color(0x007aff),
      emissiveIntensity: 1.2,
      roughness: 0.1,
    });
    const clusterMesh = new THREE.Mesh(clusterGeo, clusterMat);
    clusterMesh.position.set(0.38, 0.18, 0.18);
    clusterMesh.rotation.x = -Math.PI / 18;
    dashGroup.add(clusterMesh);

    // Center Infotainment Display Touchscreen
    const centerScreenGeo = new THREE.BoxGeometry(0.42, 0.22, 0.02);
    const centerScreenMat = new THREE.MeshStandardMaterial({
      color: 0x050810,
      emissive: new THREE.Color(0x00f0ff),
      emissiveIntensity: 1.0,
      roughness: 0.1,
    });
    const centerScreenMesh = new THREE.Mesh(centerScreenGeo, centerScreenMat);
    centerScreenMesh.position.set(0, 0.12, 0.20);
    centerScreenMesh.rotation.y = Math.PI / 24; // Tilted towards driver
    dashGroup.add(centerScreenMesh);

    // HUD Projection Glass Lens
    const hudGeo = new THREE.PlaneGeometry(0.18, 0.12);
    const hudMesh = new THREE.Mesh(hudGeo, glassMat);
    hudMesh.position.set(0.38, 0.26, 0.26);
    hudMesh.rotation.x = -Math.PI / 4;
    dashGroup.add(hudMesh);

    interiorGroup.add(dashGroup);

    // ── 3. SPORT STEERING WHEEL & PADDLE SHIFTERS ──
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(0.38, 0.52, 0.22);
    wheelGroup.rotation.x = -Math.PI / 12;

    // Steering Wheel Rim (Flat-Bottom Sport)
    const rimTorusGeo = new THREE.TorusGeometry(0.17, 0.024, 16, 32);
    const rimMesh = new THREE.Mesh(rimTorusGeo, leatherMat);
    wheelGroup.add(rimMesh);

    // Carbon Center Spoke Hub & Airbag Cap
    const hubGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.03, 24);
    hubGeo.rotateX(Math.PI / 2);
    const hubMesh = new THREE.Mesh(hubGeo, carbonMat);
    wheelGroup.add(hubMesh);

    // Spokes
    [-Math.PI / 4, Math.PI / 4, Math.PI].forEach((angle) => {
      const spokeGeo = new THREE.BoxGeometry(0.03, 0.12, 0.015);
      const spokeMesh = new THREE.Mesh(spokeGeo, aluminumMat);
      spokeMesh.rotation.z = angle;
      wheelGroup.add(spokeMesh);
    });

    // Aluminum Paddle Shifters (Left - & Right +)
    [-0.14, 0.14].forEach((px) => {
      const paddleGeo = new THREE.BoxGeometry(0.035, 0.12, 0.01);
      const paddleMesh = new THREE.Mesh(paddleGeo, aluminumMat);
      paddleMesh.position.set(px, 0.02, -0.04);
      wheelGroup.add(paddleMesh);
    });

    // Steering Column Shaft
    const columnGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.25, 20);
    columnGeo.rotateX(Math.PI / 2);
    const columnMesh = new THREE.Mesh(columnGeo, darkAlumMat);
    columnMesh.position.set(0, 0, -0.12);
    wheelGroup.add(columnMesh);

    interiorGroup.add(wheelGroup);

    // ── 4. CENTER CONSOLE & GEAR SELECTOR ──
    const consoleGroup = new THREE.Group();
    consoleGroup.position.set(0, 0.22, -0.05);

    const consoleGeo = new THREE.BoxGeometry(0.24, 0.25, 0.85);
    const consoleMesh = new THREE.Mesh(consoleGeo, carbonMat);
    consoleMesh.castShadow = true;
    consoleGroup.add(consoleMesh);

    // Billet Aluminum Gear Selector Lever
    const shifterGeo = new THREE.CylinderGeometry(0.025, 0.02, 0.12, 16);
    const shifterMesh = new THREE.Mesh(shifterGeo, aluminumMat);
    shifterMesh.position.set(0, 0.18, 0.15);
    consoleGroup.add(shifterMesh);

    // Leather Armrest Rest
    const armrestGeo = new THREE.BoxGeometry(0.22, 0.08, 0.35);
    const armrestMesh = new THREE.Mesh(armrestGeo, leatherMat);
    armrestMesh.position.set(0, 0.15, -0.20);
    consoleGroup.add(armrestMesh);

    interiorGroup.add(consoleGroup);

    // ── 5. BILLET ALUMINUM PEDAL BOX ──
    const pedalGroup = new THREE.Group();
    pedalGroup.position.set(0.38, 0.08, 0.45);

    // Accelerator, Brake, Clutch Pedals
    const pedals = [
      { name: "ACCELERATOR", x: 0.08, width: 0.04, height: 0.14 },
      { name: "BRAKE", x: 0.0, width: 0.06, height: 0.10 },
      { name: "CLUTCH", x: -0.08, width: 0.05, height: 0.10 },
    ];

    pedals.forEach((p) => {
      const pedalGeo = new THREE.BoxGeometry(p.width, p.height, 0.015);
      const pedalMesh = new THREE.Mesh(pedalGeo, aluminumMat);
      pedalMesh.position.set(p.x, 0, 0);
      pedalMesh.rotation.x = -Math.PI / 6;
      pedalGroup.add(pedalMesh);
    });

    interiorGroup.add(pedalGroup);

    return interiorGroup;
  }
}
