/**
 * ============================================================================
 * VIP EXECUTIVE REAR LOUNGE, PRIVACY PARTITION & 8K THEATER SCREEN GENERATOR
 * ============================================================================
 * Ultra-Luxury 3D rear cabin CAD subassembly generator featuring:
 * 1. MOTORIZED 31.3" 8K THEATER CINEMA SCREEN
 *    - Power deployable ceiling hinge arm mechanism & ambient backlighting
 * 2. CHAUFFEUR ELECTROCHROMIC PRIVACY GLASS PARTITION
 *    - Smart glass divider window with integrated champagne chiller & crystal flutes
 * 3. DUAL 24-WAY FIRST-CLASS REAR CAPTAIN'S CHAIRS
 *    - Power calf ottomans, diamond quilted lumbar massage zones & surround headrests
 * 4. SOLID BILLET ALUMINUM FOLDING EXECUTIVE WRITING TABLES
 *    - Dual scissor-linkage folding tray tables stored inside waterfall armrest
 * 5. REAR CENTER CONSOLE TOUCH COMMAND TABLET & REFRIGERATED BAR
 * ============================================================================
 */

import * as THREE from "three";
import { InteriorPbrMaterialSynthesizer } from "../../materials/interiorPbrMaterialSynthesizer";
import { InteriorMaterialType } from "../../../sim/interior/masterInteriorTypes";

export interface ExecutiveRearLoungeOptions {
  primaryMaterial?: InteriorMaterialType;
  secondaryMaterial?: InteriorMaterialType;
  woodTrimMaterial?: "open_pore_walnut" | "piano_black_lacquer" | "forged_carbon_composite";
  theaterScreenDeployed?: boolean;
  privacyPartitionClosed?: boolean;
  ambientColorHex?: string;
  cabinWidthM?: number;
  cabinLengthM?: number;
}

export class ExecutiveRearLoungeGlbGenerator {
  /**
   * Builds the complete ultra-luxury executive rear lounge subassembly.
   */
  public static buildExecutiveLoungeGroup(options: ExecutiveRearLoungeOptions): THREE.Group {
    const root = new THREE.Group();
    root.name = "Executive_RearLounge_Subassembly_Root";

    const width = options.cabinWidthM || 1.62;
    const synth = InteriorPbrMaterialSynthesizer.getInstance();

    // 1. Resolve Materials
    const priMat = synth.createPhysicalMaterial({
      id: `lounge_pri_${options.primaryMaterial || "semi_aniline_leather"}`,
      name: "Executive Nappa Upholstery",
      materialType: options.primaryMaterial || "semi_aniline_leather",
      baseColorHex: options.primaryMaterial === "semi_aniline_leather" ? "#af6e3d" : "#1a1b20",
      roughness: 0.5,
      metalness: 0.02,
      sheen: 0.85,
      sheenColorHex: "#9b552b",
      normalMapType: "nappa_leather_grain",
      bumpScale: 0.45,
    });

    const quiltMat = synth.createPhysicalMaterial({
      id: "lounge_quilted_insert",
      name: "Executive Diamond Quilted Leather",
      materialType: "semi_aniline_leather",
      baseColorHex: "#af6e3d",
      roughness: 0.48,
      metalness: 0.02,
      sheen: 0.9,
      normalMapType: "diamond_french_double_stitch",
      bumpScale: 0.85,
      uvRepeatU: 4,
      uvRepeatV: 4,
    });

    const woodMat = InteriorPbrMaterialSynthesizer.getPresetMaterial(
      options.woodTrimMaterial === "piano_black_lacquer"
        ? "piano_black"
        : options.woodTrimMaterial === "forged_carbon_composite"
        ? "forged_carbon"
        : "santos_rosewood"
    );

    const aluMat = InteriorPbrMaterialSynthesizer.getPresetMaterial("brushed_aluminum");
    const titaniumMat = InteriorPbrMaterialSynthesizer.getPresetMaterial("knurled_titanium");
    const crystalGlassMat = InteriorPbrMaterialSynthesizer.getPresetMaterial("crystal_glass");
    const oledMat = InteriorPbrMaterialSynthesizer.getPresetMaterial("oled_screen");

    const ambColor = options.ambientColorHex || "#00f0ff";
    const ambientMat = synth.createPhysicalMaterial({
      id: `lounge_amb_${ambColor}`,
      name: "Executive Ambient Lightguide",
      materialType: "piano_black_lacquer",
      baseColorHex: ambColor,
      roughness: 0.1,
      metalness: 0.0,
      emissiveHex: ambColor,
      emissiveIntensity: 3.2,
    });

    // ========================================================================
    // 1. CHAUFFEUR PRIVACY PARTITION & CHAMPAGNE CHILLER
    // ========================================================================
    const partitionGroup = new THREE.Group();
    partitionGroup.name = "Chauffeur_PrivacyPartition_Wall";
    partitionGroup.position.set(0, 0.65, -0.05);

    // Partition Wall Lower Bulkhead with Wood Trim
    const bulkheadGeo = new THREE.BoxGeometry(width * 0.94, 0.62, 0.14);
    const bulkheadMesh = new THREE.Mesh(bulkheadGeo, woodMat);
    bulkheadMesh.position.set(0, -0.15, 0);
    partitionGroup.add(bulkheadMesh);

    // Electrochromic Privacy Glass Divider Screen
    const partitionGlassGeo = new THREE.BoxGeometry(width * 0.88, 0.44, 0.015);
    const partitionGlassMesh = new THREE.Mesh(partitionGlassGeo, crystalGlassMat);
    partitionGlassMesh.position.set(0, 0.38, 0);
    partitionGroup.add(partitionGlassMesh);

    // Brushed Aluminum Surround Frame
    const frameGeo = new THREE.BoxGeometry(width * 0.90, 0.46, 0.035);
    const frameMesh = new THREE.Mesh(frameGeo, aluMat);
    frameMesh.position.set(0, 0.38, 0);
    partitionGroup.add(frameMesh);

    // Central Champagne Chiller Compartment
    const chillerWellGeo = new THREE.BoxGeometry(0.32, 0.38, 0.18);
    const chillerWellMesh = new THREE.Mesh(chillerWellGeo, titaniumMat);
    chillerWellMesh.position.set(0, -0.12, 0.02);
    partitionGroup.add(chillerWellMesh);

    // Champagne Bottle Mesh (Green Optical Glass + Gold Foil Neck)
    const bottleGeo = new THREE.CylinderGeometry(0.042, 0.048, 0.28, 24);
    const bottleMat = synth.createPhysicalMaterial({
      id: "champagne_bottle_glass",
      name: "Champagne Bottle Dark Glass",
      materialType: "piano_black_lacquer",
      baseColorHex: "#0c2810",
      roughness: 0.05,
      metalness: 0.1,
      clearcoat: 1.0,
    });
    const bottleMesh = new THREE.Mesh(bottleGeo, bottleMat);
    bottleMesh.position.set(-0.06, -0.1, 0.02);
    partitionGroup.add(bottleMesh);

    // Dual Crystal Flutes
    const fluteGeo = new THREE.CylinderGeometry(0.024, 0.008, 0.18, 16);
    const flute1 = new THREE.Mesh(fluteGeo, crystalGlassMat);
    flute1.position.set(0.06, -0.12, 0.02);
    partitionGroup.add(flute1);

    root.add(partitionGroup);

    // ========================================================================
    // 2. MOTORIZED 31.3" 8K THEATER SCREEN
    // ========================================================================
    const theaterGroup = new THREE.Group();
    theaterGroup.name = "Motorized_TheaterScreen_Assembly";

    const isDeployed = options.theaterScreenDeployed !== false;
    theaterGroup.position.set(0, isDeployed ? 0.95 : 1.18, 0.18);
    theaterGroup.rotation.x = isDeployed ? 0 : -Math.PI * 0.45; // Stowed vs Deployed angle

    // Screen Bezel Shell
    const screenBezelGeo = new THREE.BoxGeometry(0.86, 0.38, 0.024);
    const screenBezelMesh = new THREE.Mesh(screenBezelGeo, synth.createPhysicalMaterial({
      id: "theater_bezel_dark",
      name: "Theater Screen Bezel",
      materialType: "piano_black_lacquer",
      baseColorHex: "#0a0a0c",
      roughness: 0.2,
      metalness: 0.5,
    }));
    theaterGroup.add(screenBezelMesh);

    // 8K Active OLED Display Surface
    const displayGeo = new THREE.PlaneGeometry(0.82, 0.34);
    const displayMesh = new THREE.Mesh(displayGeo, oledMat);
    displayMesh.position.set(0, 0, 0.013);
    theaterGroup.add(displayMesh);

    // Ambient Halo Backlighting Glow Strip behind screen
    const haloGeo = new THREE.PlaneGeometry(0.88, 0.40);
    const haloMesh = new THREE.Mesh(haloGeo, ambientMat);
    haloMesh.position.set(0, 0, -0.013);
    theaterGroup.add(haloMesh);

    // Motorized Hinge Linkage Arms
    const leftArmGeo = new THREE.BoxGeometry(0.022, 0.14, 0.018);
    const leftArmMesh = new THREE.Mesh(leftArmGeo, aluMat);
    leftArmMesh.position.set(-0.38, 0.22, 0);
    theaterGroup.add(leftArmMesh);

    const rightArmMesh = leftArmMesh.clone();
    rightArmMesh.position.set(0.38, 0.22, 0);
    theaterGroup.add(rightArmMesh);

    root.add(theaterGroup);

    // ========================================================================
    // 3. DUAL 24-WAY FIRST-CLASS REAR CAPTAIN'S CHAIRS & OTTOMANS
    // ========================================================================
    const leftSeat = this.buildSingleCaptainChair("RearSeat_Left", priMat, quiltMat, woodMat, aluMat, false);
    leftSeat.position.set(-width * 0.26, 0.36, 0.72);
    root.add(leftSeat);

    const rightSeat = this.buildSingleCaptainChair("RearSeat_Right", priMat, quiltMat, woodMat, aluMat, true);
    rightSeat.position.set(width * 0.26, 0.36, 0.72);
    root.add(rightSeat);

    // ========================================================================
    // 4. CENTER WATERFALL CONSOLE, COMMAND TABLET & FOLDING TABLES
    // ========================================================================
    const centerWaterfall = new THREE.Group();
    centerWaterfall.name = "Executive_CenterWaterfall_Console";
    centerWaterfall.position.set(0, 0.35, 0.72);

    // Waterfall Wood / Leather Bridge Spine
    const bridgeGeo = new THREE.BoxGeometry(0.28, 0.42, 0.88);
    const bridgeMesh = new THREE.Mesh(bridgeGeo, woodMat);
    bridgeMesh.position.set(0, 0.02, 0);
    centerWaterfall.add(bridgeMesh);

    // Leather Top Padded Armrest Surface
    const topPadGeo = new THREE.BoxGeometry(0.26, 0.045, 0.52);
    const topPadMesh = new THREE.Mesh(topPadGeo, priMat);
    topPadMesh.position.set(0, 0.24, 0.1);
    centerWaterfall.add(topPadMesh);

    // Integrated Touch Command Tablet (7.0" OLED)
    const tabletGeo = new THREE.BoxGeometry(0.16, 0.008, 0.12);
    const tabletMesh = new THREE.Mesh(tabletGeo, oledMat);
    tabletMesh.position.set(0, 0.25, -0.22);
    tabletMesh.rotation.x = Math.PI * 0.15; // Angled toward rear occupants
    centerWaterfall.add(tabletMesh);

    // Dual Deployable Aluminum Folding Writing Tables
    const tableLeftGeo = new THREE.BoxGeometry(0.24, 0.012, 0.32);
    const tableLeftMesh = new THREE.Mesh(tableLeftGeo, aluMat);
    tableLeftMesh.position.set(-0.16, 0.22, -0.05);
    centerWaterfall.add(tableLeftMesh);

    const tableRightMesh = tableLeftMesh.clone();
    tableRightMesh.position.set(0.16, 0.22, -0.05);
    centerWaterfall.add(tableRightMesh);

    root.add(centerWaterfall);

    return root;
  }

  private static buildSingleCaptainChair(
    name: string,
    priMat: THREE.Material,
    quiltMat: THREE.Material,
    woodMat: THREE.Material,
    aluMat: THREE.Material,
    isRight: boolean
  ): THREE.Group {
    const seatGroup = new THREE.Group();
    seatGroup.name = name;

    // 1. Lower Base Cushion
    const cushionGeo = new THREE.BoxGeometry(0.52, 0.14, 0.54);
    const cushionMesh = new THREE.Mesh(cushionGeo, priMat);
    cushionMesh.position.set(0, 0.07, 0);
    seatGroup.add(cushionMesh);

    // Quilted Center Cushion Insert
    const quiltCushionGeo = new THREE.BoxGeometry(0.32, 0.02, 0.48);
    const quiltCushionMesh = new THREE.Mesh(quiltCushionGeo, quiltMat);
    quiltCushionMesh.position.set(0, 0.145, 0);
    seatGroup.add(quiltCushionMesh);

    // 2. Reclined Backrest with Rear Wood Backing Shell
    const backrestGeo = new THREE.BoxGeometry(0.52, 0.68, 0.14);
    const backrestMesh = new THREE.Mesh(backrestGeo, priMat);
    backrestMesh.position.set(0, 0.45, 0.24);
    backrestMesh.rotation.x = -Math.PI * 0.08;
    seatGroup.add(backrestMesh);

    // Wood Veneer Rear Backing Shell
    const woodBackGeo = new THREE.BoxGeometry(0.53, 0.69, 0.015);
    const woodBackMesh = new THREE.Mesh(woodBackGeo, woodMat);
    woodBackMesh.position.set(0, 0.45, 0.315);
    woodBackMesh.rotation.x = -Math.PI * 0.08;
    seatGroup.add(woodBackMesh);

    // Quilted Lumbar Pad
    const lumbarGeo = new THREE.BoxGeometry(0.32, 0.38, 0.035);
    const lumbarMesh = new THREE.Mesh(lumbarGeo, quiltMat);
    lumbarMesh.position.set(0, 0.38, 0.16);
    lumbarMesh.rotation.x = -Math.PI * 0.08;
    seatGroup.add(lumbarMesh);

    // 3. Ergonomic Headrest with Acoustic Micro-Speakers
    const headrestGeo = new THREE.BoxGeometry(0.28, 0.22, 0.12);
    const headrestMesh = new THREE.Mesh(headrestGeo, priMat);
    headrestMesh.position.set(0, 0.88, 0.32);
    seatGroup.add(headrestMesh);

    // 4. Power Deployable Calf Ottoman
    const ottomanGeo = new THREE.BoxGeometry(0.44, 0.08, 0.28);
    const ottomanMesh = new THREE.Mesh(ottomanGeo, priMat);
    ottomanMesh.position.set(0, 0.02, -0.32);
    ottomanMesh.rotation.x = Math.PI * 0.18; // Extended resting angle
    seatGroup.add(ottomanMesh);

    return seatGroup;
  }
}
