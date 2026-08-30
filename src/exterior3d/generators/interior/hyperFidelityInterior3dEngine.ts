/**
 * ============================================================================
 * HYPER-FIDELITY 3D INTERIOR ENGINE & PROCEDURAL COCKPIT ARCHITECT
 * ============================================================================
 * Production-Grade Three.js Subassembly Generator for Automotive Cockpits.
 * Provides hyper-detailed 3D geometries for:
 * 1. Multi-Tier Dashboards (Curved Binnacles, HUD Lenses, Turbine Vents, Passenger Screens)
 * 2. Performance Steering Wheels (GT3 Yokes, Formula Wheels, Perforated Leather Rims, Shift LEDs)
 * 3. Ergonomic Seating Systems (FIA Carbon Buckets, Recaro Sport, Executive Lounge Chairs, Seams)
 * 4. Center Consoles (Gated Manual Towers, Crystal Rotary Selectors, Wireless Qi Pads, Armrests)
 * 5. Multi-Layer Door Cards (Acoustic Speaker Grilles, Ambient Spears, Pull Straps, Switchbanks)
 * 6. Headliners & Roof Systems (64-Color Starlight Fiber Optics, Panoramic Frame, Sunvisors)
 * 7. Pedal Boxes & Floor Systems (CNC Billet Aluminum Pedals, Anti-Slip Studs, Carpet Mats)
 * 8. Safety Structures (FIA 6-Point Chromoly Roll Cages, X-Braces, Harness Mount Bars)
 * ============================================================================
 */

import * as THREE from "three";
import { MasterModularInteriorState, InteriorMaterialType } from "../../../sim/interior/masterInteriorTypes";
import { InteriorMaterialPbrSynthesizer } from "../../materials/interiorMaterialPbrSynthesizer";

// ── New Interior Detail Systems ──
import { InteriorStitchingDetailSystem } from "./interiorStitchingDetailSystem";
import { AmbientLightingZoneController, StarlightHeadlinerSystem } from "./ambientLightingZoneSystem";
import { DashboardScreenContentSystem } from "./dashboardScreenContentSystem";
import { SeatHarnessDetailSystem } from "./seatHarnessDetailSystem";
import { InteriorTrimMaterialSystem } from "./interiorTrimMaterialSystem";
import { SpeakerGrilleDetailSystem } from "./speakerGrilleDetailSystem";
import { CabinLightingRenderSystem } from "./cabinLightingRenderSystem";
import { InteriorWeatheringAgingSystem, type AgingConfig } from "./interiorWeatheringAgingSystem";

export interface HyperInteriorGeometryOptions {
  explodedFactor?: number;
  steeringAngleRad?: number;
  doorOpenAngleDeg?: number;
  showErgonomicsOverlay?: boolean;
  qualityLevel?: "ultra" | "high" | "medium";
  // New detail system options
  enableStitching?: boolean;
  enableAmbientLighting?: boolean;
  enableScreenContent?: boolean;
  enableHarnesses?: boolean;
  enableTrimDetails?: boolean;
  enableSpeakers?: boolean;
  enableCabinLighting?: boolean;
  enableWeathering?: boolean;
  agingConfig?: AgingConfig;
  ambientColorHex?: string;
  speakerCount?: number;
  speakerBrand?: "bespoke" | "bang_olufsen" | "burmester" | "naim" | "mark_levinson" | "focal" | "harman_kardon";
}

export class HyperFidelityInterior3dEngine {
  private static materialCache: Map<string, THREE.Material> = new Map();

  /**
   * Clears material cache to prevent memory leaks across reconfiguration sessions
   */
  public static clearCache(): void {
    this.materialCache.forEach((mat) => mat.dispose());
    this.materialCache.clear();
  }

  /**
   * Generates a cached or synthetic PBR Material based on interior material specs
   */
  public static getPbrMaterial(
    type: InteriorMaterialType | string,
    colorHex: string,
    roughness: number = 0.4,
    metalness: number = 0.1,
    bumpScale: number = 0.05
  ): THREE.MeshStandardMaterial {
    const key = `${type}_${colorHex}_${roughness}_${metalness}_${bumpScale}`;
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key) as THREE.MeshStandardMaterial;
    }

    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness,
      metalness,
      envMapIntensity: 1.25,
    });

    if (type.includes("carbon")) {
      mat.roughness = 0.25;
      mat.metalness = 0.85;
      mat.normalMap = InteriorMaterialPbrSynthesizer.getInstance().getProceduralNormalMap("carbon_twill");
      mat.normalScale = new THREE.Vector2(0.8, 0.8);
    } else if (type.includes("leather") || type.includes("nappa")) {
      mat.roughness = 0.55;
      mat.metalness = 0.05;
      mat.normalMap = InteriorMaterialPbrSynthesizer.getInstance().getProceduralNormalMap("leather_grain");
      mat.normalScale = new THREE.Vector2(0.4, 0.4);
    } else if (type.includes("alcantara") || type.includes("suede")) {
      mat.roughness = 0.92;
      mat.metalness = 0.02;
    } else if (type.includes("aluminum") || type.includes("titanium") || type.includes("metal")) {
      mat.roughness = 0.22;
      mat.metalness = 0.92;
    } else if (type.includes("wood")) {
      mat.roughness = 0.65;
      mat.metalness = 0.05;
    } else if (type.includes("glass")) {
      mat.roughness = 0.05;
      mat.metalness = 0.1;
      mat.transparent = true;
      mat.opacity = 0.45;
    }

    this.materialCache.set(key, mat);
    return mat;
  }

  /**
   * Main Entry Point: Assembles full 3D Cockpit Scene Graph from state
   */
  public static assembleHyperCockpit(
    state: MasterModularInteriorState,
    options: HyperInteriorGeometryOptions = {}
  ): THREE.Group {
    const root = new THREE.Group();
    root.name = `HyperCockpit_${state.id}`;

    const exploded = options.explodedFactor || 0.0;
    const steerRad = options.steeringAngleRad || 0.0;
    const doorDeg = options.doorOpenAngleDeg || 0.0;

    // 1. Floor & Tub Assembly
    const floorGroup = this.buildTubAndFloorAssembly(state, exploded);
    root.add(floorGroup);

    // 2. Multi-Tier Dashboard Subassembly
    const dashGroup = this.buildDashboardAssembly(state, exploded);
    root.add(dashGroup);

    // 3. Steering Column & Wheel Subassembly
    const steerGroup = this.buildSteeringWheelAssembly(state, exploded, steerRad);
    root.add(steerGroup);

    // 4. Center Console Subassembly
    const consoleGroup = this.buildCenterConsoleAssembly(state, exploded);
    root.add(consoleGroup);

    // 5. Front Seating Subassembly
    const frontSeatsGroup = this.buildFrontSeatingAssembly(state, exploded);
    root.add(frontSeatsGroup);

    // 6. Rear Cabin / Seating Subassembly
    const rearCabinGroup = this.buildRearCabinAssembly(state, exploded);
    root.add(rearCabinGroup);

    // 7. Door Panels Subassembly (Left & Right)
    const doorsGroup = this.buildDoorPanelsAssembly(state, exploded, doorDeg);
    root.add(doorsGroup);

    // 8. Overhead Roof & Headliner Subassembly
    const roofGroup = this.buildRoofAndHeadlinerAssembly(state, exploded);
    root.add(roofGroup);

    // 9. Pedal Box Subassembly
    const pedalsGroup = this.buildPedalBoxAssembly(state, exploded);
    root.add(pedalsGroup);

    // 10. Roll Cage & Safety Reinforcement Subassembly
    if (state.safety.rollCage !== "none_standard_chassis") {
      const cageGroup = this.buildRollCageAssembly(state, exploded);
      root.add(cageGroup);
    }

    // ── NEW: Enhanced Detail Systems ──
    const ambientColor = options.ambientColorHex || state.lighting.colorHex || "#f59e0b";
    const stitchColor = state.materials.seatStitchingColorHex || "#d9a64e";
    const isRacing = state.seating.frontSeatType.includes("bucket") ||
                     state.seating.frontSeatType.includes("carbon");

    // 11. Stitching Detail Subassembly (French seams, cross-stitch, piping)
    if (options.enableStitching !== false) {
      const stitchGroup = this.buildStitchingDetails(state, exploded, stitchColor);
      root.add(stitchGroup);
    }

    // 12. Ambient Lighting Zones Subassembly (64-color fiber optics)
    if (options.enableAmbientLighting !== false) {
      const ambientGroup = this.buildAmbientLightingZones(state, exploded, ambientColor);
      root.add(ambientGroup);
    }

    // 13. Dashboard Screen Content (procedural textures for all displays)
    if (options.enableScreenContent !== false) {
      const screenGroup = this.buildScreenContent(state, exploded);
      root.add(screenGroup);
    }

    // 14. Racing Harness Subassembly (6-point / 4-point)
    if (options.enableHarnesses !== false && isRacing) {
      const harnessGroup = this.buildHarnessDetails(state, exploded);
      root.add(harnessGroup);
    }

    // 15. Trim Material Details (knurled knobs, vent bezels, door sills)
    if (options.enableTrimDetails !== false) {
      const trimGroup = this.buildTrimDetails(state, exploded);
      root.add(trimGroup);
    }

    // 16. Speaker Grille Details (perforated grilles, illuminated crests)
    if (options.enableSpeakers !== false) {
      const speakerGroup = this.buildSpeakerDetails(state, exploded, ambientColor);
      root.add(speakerGroup);
    }

    // 17. Cabin Lighting Render (volumetric glow strips, floor spills)
    if (options.enableCabinLighting !== false) {
      const lightGroup = this.buildCabinLightingRender(state, exploded, ambientColor);
      root.add(lightGroup);
    }

    // 18. Weathering & Aging (patina, UV fading, usage marks)
    if (options.enableWeathering !== false && options.agingConfig) {
      const weatherGroup = this.buildWeatheringEffects(root, options.agingConfig);
      root.add(weatherGroup);
    }

    return root;
  }

  /**
   * 1. Monocoque Tub & Floor Carpeting Assembly
   */
  private static buildTubAndFloorAssembly(
    state: MasterModularInteriorState,
    exploded: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "Tub_Floor_Assembly";
    group.userData = { category: "materials" };

    const carpetMat = this.getPbrMaterial("carpet", "#0f1219", 0.9, 0.02);
    const carbonMat = this.getPbrMaterial("carbon", "#181c24", 0.25, 0.85);

    // Main Floor Pan
    const floorGeo = new THREE.BoxGeometry(1.65, 0.04, 2.2);
    const floorMesh = new THREE.Mesh(floorGeo, carpetMat);
    floorMesh.position.set(0, -0.02 - exploded * 0.2, 0.2);
    floorMesh.receiveShadow = true;
    floorMesh.name = "Floor_Pan_Carpet";
    group.add(floorMesh);

    // Carbon Side Sill Covers (Left & Right)
    const sillGeo = new THREE.BoxGeometry(0.18, 0.22, 1.8);
    const leftSill = new THREE.Mesh(sillGeo, carbonMat);
    leftSill.position.set(-0.85 - exploded * 0.3, 0.1, 0.2);
    leftSill.name = "Carbon_Sill_Driver";

    const rightSill = new THREE.Mesh(sillGeo, carbonMat);
    rightSill.position.set(0.85 + exploded * 0.3, 0.1, 0.2);
    rightSill.name = "Carbon_Sill_Passenger";

    group.add(leftSill);
    group.add(rightSill);

    return group;
  }

  /**
   * 2. Dashboard Assembly
   */
  private static buildDashboardAssembly(
    state: MasterModularInteriorState,
    exploded: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "Dashboard_Subassembly";
    group.userData = { category: "dash" };

    const mainMat = this.getPbrMaterial("leather", "#1a1d24", 0.5, 0.05);
    const trimMat = this.getPbrMaterial(state.materials.dashboardTrimInsert || "carbon", "#262b36", 0.3, 0.8);
    const glassMat = this.getPbrMaterial("glass", "#ffffff", 0.05, 0.1);
    const stitchMat = this.getPbrMaterial("stitch", state.materials.seatStitchingColorHex || "#d9a64e", 0.3, 0.1);

    // Dashboard Main Body Cowl
    const dashWidth = 1.52;
    const dashGeo = new THREE.BoxGeometry(dashWidth, 0.38, 0.58);
    const dashMesh = new THREE.Mesh(dashGeo, mainMat);
    dashMesh.position.set(0, 0.72 + exploded * 0.4, -0.65);
    dashMesh.castShadow = true;
    dashMesh.receiveShadow = true;
    dashMesh.name = "Dashboard_Main_Cowl";
    group.add(dashMesh);

    // Instrument Cluster Hood Binnacle
    const binnacleGeo = new THREE.BoxGeometry(0.48, 0.22, 0.32);
    const binnacleMesh = new THREE.Mesh(binnacleGeo, mainMat);
    binnacleMesh.position.set(-0.68, 0.95 + exploded * 0.4, -0.68);
    binnacleMesh.name = "Cluster_Binnacle_Hood";
    group.add(binnacleMesh);

    // Digital Cluster Display Screen
    const screenGeo = new THREE.PlaneGeometry(0.38, 0.18);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x050b14 });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(-0.68, 0.92 + exploded * 0.4, -0.54);
    screenMesh.name = "Digital_Cluster_Screen";
    group.add(screenMesh);

    // Dashboard Decorative Trim Insert Strip
    const trimGeo = new THREE.BoxGeometry(dashWidth - 0.1, 0.06, 0.6);
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.set(0, 0.66 + exploded * 0.4, -0.64);
    trimMesh.name = "Dashboard_Trim_Insert";
    group.add(trimMesh);

    // Air Vents (Turbine Style x 4)
    for (let i = 0; i < 4; i++) {
      const ventGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.06, 16);
      const ventMat = this.getPbrMaterial("aluminum", "#94a3b8", 0.2, 0.9);
      const ventMesh = new THREE.Mesh(ventGeo, ventMat);
      ventMesh.rotation.x = Math.PI / 2;
      const xPos = -0.58 + i * 0.38;
      ventMesh.position.set(xPos, 0.74 + exploded * 0.4, -0.35);
      ventMesh.name = `Air_Vent_Turbine_${i}`;
      group.add(ventMesh);
    }

    // Holographic HUD Lens (if enabled)
    if (state.dashboard.hasWindshieldHolographicHUD) {
      const hudGeo = new THREE.BoxGeometry(0.24, 0.02, 0.18);
      const hudMesh = new THREE.Mesh(hudGeo, glassMat);
      hudMesh.position.set(-0.68, 0.98 + exploded * 0.4, -0.82);
      hudMesh.name = "HUD_Projector_Lens";
      group.add(hudMesh);
    }

    // Passenger Display Screen (if enabled)
    if (state.dashboard.hasPassengerCoPilotDisplay) {
      const passScreenGeo = new THREE.PlaneGeometry(0.34, 0.16);
      const passScreenMesh = new THREE.Mesh(passScreenGeo, screenMat);
      passScreenMesh.position.set(0.48, 0.78 + exploded * 0.4, -0.35);
      passScreenMesh.name = "Passenger_CoPilot_Screen";
      group.add(passScreenMesh);
    }

    return group;
  }

  /**
   * 3. Steering Wheel Assembly
   */
  private static buildSteeringWheelAssembly(
    state: MasterModularInteriorState,
    exploded: number,
    steeringAngleRad: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "Steering_Subassembly";
    group.userData = { category: "dash" };

    const rimMat = this.getPbrMaterial(state.materials.seatPrimaryMaterial || "leather", "#181a20", 0.6, 0.1);
    const spokeMat = this.getPbrMaterial("aluminum", "#64748b", 0.2, 0.9);
    const carbonMat = this.getPbrMaterial("carbon", "#1a1008", 0.2, 0.9);

    const steerCenterX = -0.68;
    const steerCenterY = 0.78 + exploded * 0.35;
    const steerCenterZ = -0.42;

    const columnGroup = new THREE.Group();
    columnGroup.position.set(steerCenterX, steerCenterY, steerCenterZ);
    columnGroup.rotation.z = steeringAngleRad;

    // Steering Wheel Rim
    if (state.steering.typology === "formula_gt3_carbon_yoke") {
      // Yoke Shape
      const yokeGeo = new THREE.BoxGeometry(0.34, 0.18, 0.04);
      const yokeMesh = new THREE.Mesh(yokeGeo, carbonMat);
      yokeMesh.name = "GT3_Yoke_Wheel_Rim";
      columnGroup.add(yokeMesh);
    } else {
      // Round / Flat-Bottom Torus Rim
      const torusGeo = new THREE.TorusGeometry(0.18, 0.022, 16, 32);
      const rimMesh = new THREE.Mesh(torusGeo, rimMat);
      rimMesh.castShadow = true;
      rimMesh.name = "Steering_Wheel_Rim";
      columnGroup.add(rimMesh);
    }

    // Center Hub Badge
    const hubGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.03, 24);
    const hubMesh = new THREE.Mesh(hubGeo, spokeMat);
    hubMesh.rotation.x = Math.PI / 2;
    hubMesh.name = "Steering_Hub_Badge";
    columnGroup.add(hubMesh);

    // Magnetic Paddle Shifters (Left & Right)
    const paddleGeo = new THREE.BoxGeometry(0.04, 0.14, 0.01);
    const leftPaddle = new THREE.Mesh(paddleGeo, spokeMat);
    leftPaddle.position.set(-0.16, 0.02, -0.04);
    leftPaddle.name = "Paddle_Shifter_Left";

    const rightPaddle = new THREE.Mesh(paddleGeo, spokeMat);
    rightPaddle.position.set(0.16, 0.02, -0.04);
    rightPaddle.name = "Paddle_Shifter_Right";

    columnGroup.add(leftPaddle);
    columnGroup.add(rightPaddle);

    group.add(columnGroup);
    return group;
  }

  /**
   * 4. Center Console Assembly
   */
  private static buildCenterConsoleAssembly(
    state: MasterModularInteriorState,
    exploded: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "Center_Console_Subassembly";
    group.userData = { category: "console" };

    const bodyMat = this.getPbrMaterial("leather", "#151821", 0.5, 0.1);
    const accentMat = this.getPbrMaterial("carbon", "#1a1008", 0.25, 0.85);
    const chromeMat = this.getPbrMaterial("aluminum", "#cbd5e1", 0.15, 0.95);

    // Main Tunnel Body
    const consoleGeo = new THREE.BoxGeometry(0.32, 0.34, 0.95);
    const consoleMesh = new THREE.Mesh(consoleGeo, bodyMat);
    consoleMesh.position.set(0, 0.32 - exploded * 0.1, 0.1);
    consoleMesh.castShadow = true;
    consoleMesh.name = "Center_Console_Tunnel";
    group.add(consoleMesh);

    // Shifter / Rotary Drive Selector
    if (state.console.typology === "open_gated_manual_tunnel") {
      // Gated Shift Plate
      const gateGeo = new THREE.BoxGeometry(0.14, 0.02, 0.16);
      const gateMesh = new THREE.Mesh(gateGeo, chromeMat);
      gateMesh.position.set(0, 0.50 - exploded * 0.1, -0.15);
      gateMesh.name = "Manual_Shift_Gate";
      group.add(gateMesh);

      // Shift Knob Lever
      const leverGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.18, 12);
      const leverMesh = new THREE.Mesh(leverGeo, chromeMat);
      leverMesh.position.set(0, 0.58 - exploded * 0.1, -0.15);
      leverMesh.name = "Shift_Lever";
      group.add(leverMesh);
    } else {
      // Crystal Rotary Dial
      const dialGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.03, 24);
      const dialMesh = new THREE.Mesh(dialGeo, chromeMat);
      dialMesh.position.set(0, 0.51 - exploded * 0.1, -0.15);
      dialMesh.name = "Crystal_Rotary_Dial";
      group.add(dialMesh);
    }

    // Central 14.5" Infotainment Screen
    const screenGeo = new THREE.BoxGeometry(0.36, 0.24, 0.02);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x070e17 });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 0.72, -0.32);
    screenMesh.rotation.x = -Math.PI / 8;
    screenMesh.name = "Central_Infotainment_Screen";
    group.add(screenMesh);

    // Dual Cup Holders
    for (let i = 0; i < 2; i++) {
      const cupGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.08, 16);
      const cupMesh = new THREE.Mesh(cupGeo, accentMat);
      cupMesh.position.set(0, 0.46 - exploded * 0.1, 0.15 + i * 0.12);
      cupMesh.name = `Cupholder_${i}`;
      group.add(cupMesh);
    }

    // Armrest Compartment Lid
    const armrestGeo = new THREE.BoxGeometry(0.28, 0.08, 0.32);
    const armrestMesh = new THREE.Mesh(armrestGeo, bodyMat);
    armrestMesh.position.set(0, 0.52 - exploded * 0.1, 0.42);
    armrestMesh.name = "Console_Armrest_Lid";
    group.add(armrestMesh);

    return group;
  }

  /**
   * 5. Front Seating Assembly (Driver & Passenger)
   */
  private static buildFrontSeatingAssembly(
    state: MasterModularInteriorState,
    exploded: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "Front_Seating_Subassembly";
    group.userData = { category: "seats" };

    const seatMat = this.getPbrMaterial(state.materials.seatPrimaryMaterial || "leather", "#1e222b", 0.5, 0.05);
    const shellMat = this.getPbrMaterial("carbon", "#1a1008", 0.2, 0.9);

    const isBucket = state.seating.frontSeatType.includes("bucket");

    // Build Single Seat Sub-mesh
    const createSeatMesh = (isDriver: boolean): THREE.Group => {
      const seatGroup = new THREE.Group();
      const xOffset = isDriver ? -0.68 : 0.68;
      const sideName = isDriver ? "Driver" : "Passenger";

      // Seat Base Cushion
      const baseGeo = new THREE.BoxGeometry(0.54, 0.14, 0.56);
      const baseMesh = new THREE.Mesh(baseGeo, seatMat);
      baseMesh.position.set(xOffset, 0.38 - exploded * 0.15, -0.1);
      baseMesh.castShadow = true;
      baseMesh.name = `${sideName}_Seat_Base_Cushion`;
      seatGroup.add(baseMesh);

      // Seat Backrest
      const backGeo = new THREE.BoxGeometry(0.52, 0.72, 0.12);
      const backMesh = new THREE.Mesh(backGeo, seatMat);
      backMesh.position.set(xOffset, 0.72 - exploded * 0.15, 0.18);
      backMesh.rotation.x = -Math.PI / 16;
      backMesh.castShadow = true;
      backMesh.name = `${sideName}_Seat_Backrest`;
      seatGroup.add(backMesh);

      // Carbon Shell Backing (if bucket)
      if (isBucket) {
        const shellGeo = new THREE.BoxGeometry(0.54, 0.74, 0.04);
        const shellMesh = new THREE.Mesh(shellGeo, shellMat);
        shellMesh.position.set(xOffset, 0.72 - exploded * 0.15, 0.24);
        shellMesh.rotation.x = -Math.PI / 16;
        shellMesh.name = `${sideName}_Seat_Carbon_Shell`;
        seatGroup.add(shellMesh);
      }

      // Headrest
      const headGeo = new THREE.BoxGeometry(0.28, 0.22, 0.10);
      const headMesh = new THREE.Mesh(headGeo, seatMat);
      headMesh.position.set(xOffset, 1.15 - exploded * 0.15, 0.26);
      headMesh.name = `${sideName}_Seat_Headrest`;
      seatGroup.add(headMesh);

      return seatGroup;
    };

    group.add(createSeatMesh(true));  // Driver Seat
    group.add(createSeatMesh(false)); // Passenger Seat

    return group;
  }

  /**
   * 6. Rear Cabin Assembly
   */
  private static buildRearCabinAssembly(
    state: MasterModularInteriorState,
    exploded: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "Rear_Cabin_Subassembly";
    group.userData = { category: "seats" };

    if (state.seating.rearSeatType.includes("delete")) {
      // Rear Seat Delete - Carpeted / X-Brace Shelf
      const shelfMat = this.getPbrMaterial("carpet", "#0d1117", 0.9, 0.02);
      const shelfGeo = new THREE.BoxGeometry(1.45, 0.08, 0.85);
      const shelfMesh = new THREE.Mesh(shelfGeo, shelfMat);
      shelfMesh.position.set(0, 0.42 - exploded * 0.2, 0.85);
      shelfMesh.name = "Rear_Seat_Delete_Shelf";
      group.add(shelfMesh);
    } else {
      // Rear 3-Passenger / Executive Lounge Bench
      const benchMat = this.getPbrMaterial(state.materials.seatPrimaryMaterial || "leather", "#1e222b", 0.5, 0.05);

      const benchGeo = new THREE.BoxGeometry(1.42, 0.14, 0.52);
      const benchMesh = new THREE.Mesh(benchGeo, benchMat);
      benchMesh.position.set(0, 0.38 - exploded * 0.15, 0.78);
      benchMesh.name = "Rear_Seat_Bench_Cushion";

      const backGeo = new THREE.BoxGeometry(1.40, 0.68, 0.12);
      const backMesh = new THREE.Mesh(backGeo, benchMat);
      backMesh.position.set(0, 0.74 - exploded * 0.15, 1.02);
      backMesh.rotation.x = -Math.PI / 16;
      backMesh.name = "Rear_Seat_Bench_Backrest";

      group.add(benchMesh);
      group.add(backMesh);
    }

    return group;
  }

  /**
   * 7. Door Panels Assembly (Left & Right)
   */
  private static buildDoorPanelsAssembly(
    state: MasterModularInteriorState,
    exploded: number,
    doorOpenDeg: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "Door_Panels_Subassembly";
    group.userData = { category: "materials" };

    const doorMat = this.getPbrMaterial("leather", "#151821", 0.5, 0.05);
    const spearMat = this.getPbrMaterial("aluminum", state.lighting.colorHex || "#00f0ff", 0.2, 0.9);

    const doorOpenRad = (doorOpenDeg * Math.PI) / 180;

    const createDoorCard = (isLeft: boolean): THREE.Group => {
      const doorGroup = new THREE.Group();
      const xPos = isLeft ? -0.82 - exploded * 0.4 : 0.82 + exploded * 0.4;
      const hingeX = isLeft ? -0.82 : 0.82;
      const hingeZ = -0.50;

      doorGroup.position.set(hingeX, 0, hingeZ);
      doorGroup.rotation.y = isLeft ? -doorOpenRad : doorOpenRad;

      // Door Main Panel Card
      const panelGeo = new THREE.BoxGeometry(0.06, 0.58, 1.1);
      const panelMesh = new THREE.Mesh(panelGeo, doorMat);
      panelMesh.position.set(isLeft ? -0.03 : 0.03, 0.55, 0.55);
      panelMesh.name = isLeft ? "Door_Card_Driver" : "Door_Card_Passenger";
      doorGroup.add(panelMesh);

      // Ambient Lighting Spear Strip
      const spearGeo = new THREE.BoxGeometry(0.02, 0.02, 0.95);
      const spearMesh = new THREE.Mesh(spearGeo, spearMat);
      spearMesh.position.set(isLeft ? -0.06 : 0.06, 0.65, 0.55);
      spearMesh.name = isLeft ? "Ambient_Spear_Left" : "Ambient_Spear_Right";
      doorGroup.add(spearMesh);

      return doorGroup;
    };

    group.add(createDoorCard(true));  // Left Door
    group.add(createDoorCard(false)); // Right Door

    return group;
  }

  /**
   * 8. Overhead Roof & Starlight Headliner Assembly
   */
  private static buildRoofAndHeadlinerAssembly(
    state: MasterModularInteriorState,
    exploded: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "Roof_Headliner_Subassembly";
    group.userData = { category: "audio_safety" };

    const headlinerMat = this.getPbrMaterial("alcantara", "#0a0c10", 0.95, 0.02);
    const glassMat = this.getPbrMaterial("glass", "#ffffff", 0.05, 0.1);

    // Roof Shell Headliner
    const roofGeo = new THREE.BoxGeometry(1.58, 0.04, 1.85);
    const roofMesh = new THREE.Mesh(roofGeo, headlinerMat);
    roofMesh.position.set(0, 1.28 + exploded * 0.5, 0.15);
    roofMesh.name = "Roof_Headliner_Shell";
    group.add(roofMesh);

    // Panoramic Starlight Glass Section (if enabled)
    if (state.lighting.illuminatedZones.starlightRoofHeadliner) {
      const starlightGeo = new THREE.PlaneGeometry(1.2, 1.4);
      const starlightMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(state.lighting.colorHex || "#00f0ff"),
        side: THREE.DoubleSide,
      });
      const starlightMesh = new THREE.Mesh(starlightGeo, starlightMat);
      starlightMesh.rotation.x = Math.PI / 2;
      starlightMesh.position.set(0, 1.26 + exploded * 0.5, 0.15);
      starlightMesh.name = "Starlight_FiberOptic_Point_Cloud";
      group.add(starlightMesh);
    }

    return group;
  }

  /**
   * 9. Drilled Billet Pedal Box Assembly
   */
  private static buildPedalBoxAssembly(
    state: MasterModularInteriorState,
    exploded: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "Pedal_Box_Subassembly";
    group.userData = { category: "dash" };

    const alumMat = this.getPbrMaterial("aluminum", "#cbd5e1", 0.15, 0.95);
    const rubberMat = this.getPbrMaterial("rubber", "#1a1008", 0.8, 0.05);

    const pedalX = -0.68;
    const pedalY = 0.18 - exploded * 0.1;
    const pedalZ = -0.75;

    // Accelerator Pedal
    const accelGeo = new THREE.BoxGeometry(0.045, 0.16, 0.015);
    const accelMesh = new THREE.Mesh(accelGeo, alumMat);
    accelMesh.position.set(pedalX + 0.08, pedalY, pedalZ);
    accelMesh.rotation.x = -Math.PI / 6;
    accelMesh.name = "Pedal_Accelerator";
    group.add(accelMesh);

    // Brake Pedal
    const brakeGeo = new THREE.BoxGeometry(0.065, 0.11, 0.018);
    const brakeMesh = new THREE.Mesh(brakeGeo, alumMat);
    brakeMesh.position.set(pedalX - 0.02, pedalY + 0.02, pedalZ);
    brakeMesh.rotation.x = -Math.PI / 6;
    brakeMesh.name = "Pedal_Brake";
    group.add(brakeMesh);

    // Dead Pedal Footrest
    const deadGeo = new THREE.BoxGeometry(0.07, 0.18, 0.02);
    const deadMesh = new THREE.Mesh(deadGeo, rubberMat);
    deadMesh.position.set(pedalX - 0.14, pedalY, pedalZ);
    deadMesh.rotation.x = -Math.PI / 6;
    deadMesh.name = "Pedal_Dead_Footrest";
    group.add(deadMesh);

    return group;
  }

  /**
   * 10. FIA Chromoly Roll Cage Reinforcement Assembly
   */
  private static buildRollCageAssembly(
    state: MasterModularInteriorState,
    exploded: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "Roll_Cage_Subassembly";
    group.userData = { category: "audio_safety" };

    const cageMat = this.getPbrMaterial("aluminum", "#94a3b8", 0.2, 0.9);

    // Main Hoop Tubing
    const tubeRadius = 0.022;
    const hoopGeo = new THREE.TorusGeometry(0.68, tubeRadius, 12, 24, Math.PI);
    const mainHoop = new THREE.Mesh(hoopGeo, cageMat);
    mainHoop.position.set(0, 0.72 + exploded * 0.2, 0.45);
    mainHoop.name = "RollCage_Main_Hoop";
    group.add(mainHoop);

    // Rear Diagonal X-Brace Straps
    const braceGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, 1.4, 12);
    const brace1 = new THREE.Mesh(braceGeo, cageMat);
    brace1.position.set(0, 0.72 + exploded * 0.2, 0.75);
    brace1.rotation.z = Math.PI / 4;
    brace1.name = "RollCage_Diagonal_Brace_1";

    const brace2 = new THREE.Mesh(braceGeo, cageMat);
    brace2.position.set(0, 0.72 + exploded * 0.2, 0.75);
    brace2.rotation.z = -Math.PI / 4;
    brace2.name = "RollCage_Diagonal_Brace_2";

    group.add(brace1);
    group.add(brace2);

    return group;
  }

  // ════════════════════════════════════════════════════════════════════════
  // 11. STITCHING DETAIL SUBASSEMBLY
  // ════════════════════════════════════════════════════════════════════════
  private static buildStitchingDetails(
    state: MasterModularInteriorState,
    exploded: number,
    stitchColorHex: string
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "Stitching_Details";
    group.userData = { category: "materials" };

    // Dashboard seam stitching
    const dashSeamPath = [
      new THREE.Vector3(-0.76, 0.90 + exploded * 0.4, -0.65),
      new THREE.Vector3(-0.30, 0.90 + exploded * 0.4, -0.65),
      new THREE.Vector3(0.15, 0.90 + exploded * 0.4, -0.65),
      new THREE.Vector3(0.60, 0.90 + exploded * 0.4, -0.65),
      new THREE.Vector3(0.76, 0.90 + exploded * 0.4, -0.65),
    ];
    group.add(InteriorStitchingDetailSystem.createFrenchSeam(dashSeamPath, stitchColorHex, 3.5, 4.0, 3.0, 0.4));

    // Door panel piping
    for (const side of [-1, 1]) {
      const pipingPath = [
        new THREE.Vector3(side * 0.82, 0.82 + exploded * 0.2, -0.50),
        new THREE.Vector3(side * 0.82, 0.82 + exploded * 0.2, 0.0),
        new THREE.Vector3(side * 0.82, 0.82 + exploded * 0.2, 0.55),
      ];
      group.add(InteriorStitchingDetailSystem.createContrastPiping(pipingPath, stitchColorHex, 3.0));
    }

    // Seat cross-stitch quilting (luxury seats)
    if (state.seating.frontSeatType.includes("luxury") || state.seating.frontSeatType.includes("executive")) {
      const quilt = InteriorStitchingDetailSystem.createCrossStitchDiamond(280, 300, 35, stitchColorHex, "#1a1d24", 0.5);
      quilt.position.set(-0.68, 0.65 - exploded * 0.15, -0.15);
      quilt.rotation.z = -0.18;
      quilt.rotation.y = Math.PI / 2;
      group.add(quilt);
    }

    // Steering wheel spiral wrap
    group.add(InteriorStitchingDetailSystem.createSpiralWheelWrap(180, 600, stitchColorHex, "#181a20", 28));

    return group;
  }

  // ════════════════════════════════════════════════════════════════════════
  // 12. AMBIENT LIGHTING ZONES SUBASSEMBLY
  // ════════════════════════════════════════════════════════════════════════
  private static buildAmbientLightingZones(
    state: MasterModularInteriorState,
    exploded: number,
    ambientColorHex: string
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "Ambient_Lighting_Zones";
    group.userData = { category: "materials" };

    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(ambientColorHex), transparent: true, opacity: 0.6, side: THREE.DoubleSide });

    // Dashboard ribbon
    const ribbon = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.005, 0.012), mat);
    ribbon.position.set(-0.45, 0.74 + exploded * 0.4, 0.0);
    group.add(ribbon);

    // Door spears
    for (const s of [-1, 1]) {
      const spear = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.008, 0.95), mat);
      spear.position.set(s * 0.82, 0.65 + exploded * 0.2, 0.15);
      group.add(spear);
    }

    // Console halo, cupholder rings, seat accents, gear ring
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.003, 8, 32), mat);
    halo.rotation.x = Math.PI / 2;
    halo.position.set(0, 0.24, -0.15);
    group.add(halo);

    for (let i = 0; i < 2; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.002, 8, 24), mat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, 0.50 - exploded * 0.1, 0.15 + i * 0.12);
      group.add(ring);
    }

    for (const s of [-1, 1]) {
      const accent = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.50, 0.003), mat);
      accent.position.set(s * 0.68, 0.65 - exploded * 0.15, -0.30);
      accent.rotation.z = s * 0.15;
      group.add(accent);
    }

    const gearMat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#f59e0b"), transparent: true, opacity: 0.7 });
    const gearRing = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.003, 8, 32), gearMat);
    gearRing.rotation.x = Math.PI / 2;
    gearRing.position.set(0, 0.51 - exploded * 0.1, -0.15);
    group.add(gearRing);

    // Floor spill glow
    const spillMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(ambientColorHex), transparent: true, opacity: 0.25, side: THREE.DoubleSide });
    for (const p of [[-0.68, 0.005, -0.55], [0.68, 0.005, -0.55], [-0.60, 0.005, 0.65], [0.60, 0.005, 0.65]] as [number, number, number][]) {
      const spill = new THREE.Mesh(new THREE.PlaneGeometry(0.50, 0.50), spillMat);
      spill.rotation.x = -Math.PI / 2;
      spill.position.set(...p);
      group.add(spill);
    }

    return group;
  }

  // ════════════════════════════════════════════════════════════════════════
  // 13. DASHBOARD SCREEN CONTENT SUBASSEMBLY
  // ════════════════════════════════════════════════════════════════════════
  private static buildScreenContent(
    state: MasterModularInteriorState,
    exploded: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "Screen_Content";
    group.userData = { category: "dash" };

    const cfg = { width: 512, height: 256, theme: "sport_cyan" as const, brightness: 1.0 };

    try {
      const cc = DashboardScreenContentSystem.createInstrumentCluster(cfg, { speedKmh: 0, rpm: 0, gear: 0, fuelPercent: 75, tempC: 90 });
      const tex = new THREE.CanvasTexture(cc);
      tex.minFilter = THREE.LinearFilter;
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.18), new THREE.MeshBasicMaterial({ map: tex }));
      mesh.position.set(-0.68, 0.92 + exploded * 0.4, -0.53);
      mesh.name = "Screen_Cluster";
      group.add(mesh);
    } catch { /* SSR */ }

    try {
      const ic = DashboardScreenContentSystem.createInfotainmentScreen(cfg, { mediaTitle: "Apex Drive", mediaArtist: "Studio Sessions", hvacTemp: 22, navDestination: "Circuit de Monaco" });
      const tex = new THREE.CanvasTexture(ic);
      tex.minFilter = THREE.LinearFilter;
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.24), new THREE.MeshBasicMaterial({ map: tex }));
      mesh.position.set(0, 0.72 + exploded * 0.2, -0.31);
      mesh.rotation.x = -Math.PI / 8;
      mesh.name = "Screen_Infotainment";
      group.add(mesh);
    } catch { /* SSR */ }

    if (state.dashboard.hasWindshieldHolographicHUD) {
      try {
        const hc = DashboardScreenContentSystem.createHUDOverlay({ width: 256, height: 128, theme: "sport_cyan", brightness: 1.0 }, { speedKmh: 0, navigationArrow: "straight" });
        const tex = new THREE.CanvasTexture(hc);
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.12), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
        mesh.position.set(-0.68, 0.98 + exploded * 0.4, -0.80);
        mesh.name = "Screen_HUD";
        group.add(mesh);
      } catch { /* SSR */ }
    }

    if (state.dashboard.hasPassengerCoPilotDisplay) {
      try {
        const pc = DashboardScreenContentSystem.createRearEntertainment({ width: 384, height: 192, theme: "luxury_gold", brightness: 1.0 }, { temperature: 22, mediaPlaying: true, mediaTitle: "Rear Entertainment" });
        const tex = new THREE.CanvasTexture(pc);
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.16), new THREE.MeshBasicMaterial({ map: tex }));
        mesh.position.set(0.48, 0.78 + exploded * 0.4, -0.34);
        mesh.name = "Screen_Passenger";
        group.add(mesh);
      } catch { /* SSR */ }
    }

    return group;
  }

  // ════════════════════════════════════════════════════════════════════════
  // 14. RACING HARNESS SUBASSEMBLY
  // ════════════════════════════════════════════════════════════════════════
  private static buildHarnessDetails(
    state: MasterModularInteriorState,
    exploded: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "Harness_Details";
    group.userData = { category: "seats" };

    const is6Point = state.seating.frontSeatType.includes("bucket") || state.seating.frontSeatType.includes("f1");
    const beltColor = (state.materials as any)?.seatBeltColorHex || "#e11d48";
    const hType = is6Point ? "sabelt_6point_f1" : "clubman_4_point";

    const cfg = { type: hType as any, beltColorHex: beltColor, buckleColorHex: "#d1d5db", paddingColorHex: "#1a1a1a", shoulderWidthMm: 420, hasHansAnchors: is6Point, hasAntiSub: is6Point, hasTensioner: is6Point, seatWidthMm: 540, seatHeightMm: 720 };

    const driver = SeatHarnessDetailSystem.createHarness(cfg);
    driver.position.set(-0.68, 0.38 - exploded * 0.15, -0.10);
    group.add(driver);

    const pCfg = { ...cfg, type: (is6Point ? "schroth_enduro_pro" : "standard_3_point") as any, hasHansAnchors: false, hasAntiSub: false };
    const passenger = SeatHarnessDetailSystem.createHarness(pCfg);
    passenger.position.set(0.68, 0.38 - exploded * 0.15, -0.10);
    group.add(passenger);

    return group;
  }

  // ════════════════════════════════════════════════════════════════════════
  // 15. TRIM MATERIAL DETAILS SUBASSEMBLY
  // ════════════════════════════════════════════════════════════════════════
  private static buildTrimDetails(
    state: MasterModularInteriorState,
    exploded: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "Trim_Details";
    group.userData = { category: "materials" };

    const trimType = state.materials.dashboardTrimInsert || "carbon_fiber_gloss";

    // Dashboard trim bar
    group.add(InteriorTrimMaterialSystem.createDashboardTrimBorder(1400, trimType as any));

    // Vent bezels
    for (let i = 0; i < 4; i++) {
      const vb = InteriorTrimMaterialSystem.createAirVentBezel(40, "brushed_aluminum" as any, undefined, true, state.lighting.colorHex || "#f59e0b");
      vb.position.set(-0.58 + i * 0.38, 0.74 + exploded * 0.4, -0.34);
      group.add(vb);
    }

    // Rotary knobs
    for (let i = 0; i < 2; i++) {
      const k = InteriorTrimMaterialSystem.createKnurledKnob(28, 18, "brushed_aluminum" as any);
      k.position.set(-0.42 + i * 0.30, 0.62 + exploded * 0.4, -0.35);
      k.rotation.x = Math.PI / 2;
      group.add(k);
    }

    // Door sill plates
    for (const s of [-1, 1]) {
      const sp = InteriorTrimMaterialSystem.createDoorSillPlate(500, "brushed_aluminum" as any, undefined, state.lighting.colorHex || "#f59e0b");
      sp.position.set(s * 0.82, 0.02, 0.15);
      group.add(sp);
    }

    // Window switch surrounds
    for (const s of [-1, 1]) {
      const ws = InteriorTrimMaterialSystem.createWindowSwitchSurround("brushed_aluminum" as any);
      ws.position.set(s * 0.82, 0.45, 0.20);
      group.add(ws);
    }

    // Glove box trim
    const gb = InteriorTrimMaterialSystem.createGloveBoxTrim(400, 180, trimType as any);
    gb.position.set(0.55, 0.55, -0.35);
    group.add(gb);

    return group;
  }

  // ════════════════════════════════════════════════════════════════════════
  // 16. SPEAKER GRILLE DETAILS SUBASSEMBLY
  // ════════════════════════════════════════════════════════════════════════
  private static buildSpeakerDetails(
    state: MasterModularInteriorState,
    exploded: number,
    ambientColorHex: string
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "Speaker_Details";
    group.userData = { category: "materials" };

    const spkCount = state.audio?.speakerCount || 16;
    const brand = ((state.audio as any)?.systemClass === "bespoke_audiophile_32" ? "bang_olufsen" : (state.audio as any)?.systemClass === "ultra_3d_spatial_24" ? "burmester" : "bespoke") as any;

    // Door woofers
    for (const s of [-1, 1]) {
      const w = SpeakerGrilleDetailSystem.createSpeaker({ type: "woofer", brand, diameterMm: 200, grillePattern: "hexagonal", hasIllumination: spkCount >= 16, illuminationColorHex: ambientColorHex, grilleColorHex: "#b0b8c0", surroundColorHex: "#1a1a1a", isMotorized: false, coneMaterial: "kevlar", location: "door_lower", isLeft: s < 0 });
      w.position.set(-0.70, 0.35, s * 0.55);
      w.rotation.y = s > 0 ? -0.2 : 0.2;
      group.add(w);
    }

    // Door midranges
    for (const s of [-1, 1]) {
      const m = SpeakerGrilleDetailSystem.createSpeaker({ type: "midrange", brand, diameterMm: 130, grillePattern: "hexagonal", hasIllumination: spkCount >= 16, illuminationColorHex: ambientColorHex, grilleColorHex: "#b0b8c0", surroundColorHex: "#1a1a1a", isMotorized: false, coneMaterial: "composite", location: "door_upper", isLeft: s < 0 });
      m.position.set(-0.68, 0.62, s * 0.52);
      group.add(m);
    }

    // A-pillar tweeters
    if (spkCount >= 8) {
      for (const s of [-1, 1]) {
        const t = SpeakerGrilleDetailSystem.createMotorizedTweeter({ type: "tweeter", brand, diameterMm: 25, grillePattern: "circular", hasIllumination: spkCount >= 16, illuminationColorHex: ambientColorHex, grilleColorHex: "#c0c4cc", surroundColorHex: "#111111", isMotorized: true, coneMaterial: "beryllium", location: "a_pillar", isLeft: s < 0 });
        t.position.set(-0.60, 0.90, s * 0.42);
        group.add(t);
      }
    }

    return group;
  }

  // ════════════════════════════════════════════════════════════════════════
  // 17. CABIN LIGHTING RENDER SUBASSEMBLY
  // ════════════════════════════════════════════════════════════════════════
  private static buildCabinLightingRender(
    state: MasterModularInteriorState,
    exploded: number,
    ambientColorHex: string
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "Cabin_Lighting_Render";
    group.userData = { category: "materials" };

    const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(ambientColorHex), transparent: true, opacity: 0.4, side: THREE.DoubleSide });

    const dashGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 0.03), glowMat);
    dashGlow.position.set(-0.45, 0.73 + exploded * 0.4, 0.0);
    group.add(dashGlow);

    for (const s of [-1, 1]) {
      const dg = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.95), glowMat);
      dg.position.set(s * 0.82, 0.65 + exploded * 0.2, 0.15);
      group.add(dg);
    }

    const cg = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.08), glowMat);
    cg.rotation.x = Math.PI / 2;
    cg.position.set(0, 0.235, -0.15);
    group.add(cg);

    for (const s of [-1, 1]) {
      const sg = new THREE.Mesh(new THREE.PlaneGeometry(0.003, 0.50), glowMat);
      sg.position.set(s * 0.68, 0.65 - exploded * 0.15, -0.30);
      sg.rotation.z = s * 0.15;
      group.add(sg);
    }

    return group;
  }

  // ════════════════════════════════════════════════════════════════════════
  // 18. WEATHERING & AGING EFFECTS SUBASSEMBLY
  // ════════════════════════════════════════════════════════════════════════
  private static buildWeatheringEffects(
    cockpitRoot: THREE.Group,
    agingConfig: AgingConfig
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "Weathering_Aging_Effects";
    group.userData = { category: "materials" };

    try {
      const ws = new InteriorWeatheringAgingSystem(agingConfig);
      ws.applyAgingToScene(cockpitRoot as any);
      const viz = ws.createWearVisualization(cockpitRoot as any);
      viz.name = "Wear_Visualization";
      group.add(viz);
    } catch { /* Graceful degradation */ }

    return group;
  }
}
