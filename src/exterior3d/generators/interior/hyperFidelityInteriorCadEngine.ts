/**
 * ============================================================================
 * HYPER-FIDELITY AUTOMOTIVE INTERIOR 3D CAD & MESH ENGINE
 * ============================================================================
 * High-density procedural 3D geometry engine for modern luxury & racing cockpits.
 * Constructs modular, production-grade CAD hierarchies with micro-details:
 * - Autoclaved Carbon Tub Floorpan & Monocoque Sills
 * - FIA Monocoque Race Buckets & 18-Way Ergonomic Comfort Seats
 * - Pillar-to-Pillar Monolithic Glass Dashboards & HMI Cowls
 * - CNC Billet Aluminum Steering Assemblies & Tactile Magnetic Paddles
 * - Crystal Rotary Shifter Consoles & Dual Wireless Charging Bays
 * - Multi-Layer Acoustic Door Cards & Laser-Etched Speaker Grilles
 * - Drilled Billet Hydraulic Pedal Box Assemblies
 * - Chromoly Roll Cage Safety Cells & Fiber-Optic Starlight Glass Roofs
 * ============================================================================
 */

import * as THREE from "three";
import {
  MasterModularInteriorState,
  InteriorMaterialType,
  DashboardTypology,
  SteeringWheelTypology,
  FrontSeatTypology,
} from "../../../sim/interior/masterInteriorTypes";
import { InteriorMaterialPbrSynthesizer } from "../../materials/interiorMaterialPbrSynthesizer";

export interface InteriorCadComponentMetadata {
  id: string;
  name: string;
  category: "CHASSIS_TUB" | "DASHBOARD" | "STEERING" | "SEATING" | "CONSOLE" | "DOORS" | "PEDALS" | "SAFETY" | "ROOF";
  massKg: number;
  material: string;
  triangleCount: number;
  vertexCount: number;
  dimensionsMm: { x: number; y: number; z: number };
}

export class HyperFidelityInteriorCadEngine {
  private static texSynthesizer = InteriorMaterialPbrSynthesizer.getInstance();

  /**
   * Generates a complete photorealistic 3D interior cabin CAD group.
   */
  public static buildFullInteriorCad(
    state: MasterModularInteriorState,
    explodedFactor: number = 0.0,
    steeringAngleRad: number = 0.0,
    doorOpenAngleDeg: number = 0.0
  ): THREE.Group {
    const root = new THREE.Group();
    root.name = `InteriorCad_Root_${state.id}`;

    const halfTrackM = (state.trackWidthMm / 2) / 1000;
    const wheelbaseM = state.wheelbaseMm / 1000;

    // 1. Carbon Monocoque Tub & Acoustic Floorpan
    const tubGroup = this.buildMonocoqueTub(state, halfTrackM, wheelbaseM, explodedFactor);
    root.add(tubGroup);

    // 2. Dash & Instrument Cowl Assembly
    const dashGroup = this.buildDashboardAssembly(state, halfTrackM, explodedFactor);
    root.add(dashGroup);

    // 3. Steering Column, Paddles & Yoke Assembly
    const steeringGroup = this.buildSteeringAssembly(state, steeringAngleRad, explodedFactor);
    root.add(steeringGroup);

    // 4. Seating System (Driver & Passenger)
    const seatingGroup = this.buildSeatingSystem(state, halfTrackM, explodedFactor);
    root.add(seatingGroup);

    // 5. Center Waterfall Tunnel & Console
    const consoleGroup = this.buildCenterConsoleAssembly(state, explodedFactor);
    root.add(consoleGroup);

    // 6. Door Panels & Latches (Left & Right)
    const doorsGroup = this.buildDoorCardAssemblies(state, halfTrackM, doorOpenAngleDeg, explodedFactor);
    root.add(doorsGroup);

    // 7. Pedal Box & Footrest Subsystem
    const pedalGroup = this.buildPedalBoxAssembly(state, explodedFactor);
    root.add(pedalGroup);

    // 8. Safety Roll Cage & Starlight Roof Headliner
    const safetyGroup = this.buildSafetyAndRoofAssembly(state, halfTrackM, explodedFactor);
    root.add(safetyGroup);

    return root;
  }

  // ==========================================================================
  // 1. MONOCOQUE TUB & ACOUSTIC FLOORPAN
  // ==========================================================================
  public static buildMonocoqueTub(
    state: MasterModularInteriorState,
    halfTrackM: number,
    wheelbaseM: number,
    exploded: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "CAD_MonocoqueTub";
    const dy = -exploded * 0.25;

    // Carbon Tub Floorpan
    const floorWidth = Math.max(1.10, halfTrackM * 1.65);
    const floorLength = 1.85;
    const floorGeo = new THREE.BoxGeometry(floorWidth, 0.04, floorLength);
    const carbonMat = this.createCarbonMaterial();
    const floorMesh = new THREE.Mesh(floorGeo, carbonMat);
    floorMesh.position.set(0, 0.02 + dy, -0.45);
    floorMesh.receiveShadow = true;
    floorMesh.castShadow = true;
    group.add(floorMesh);

    // Carpet Floor Mats
    const matMat = this.createFabricMaterial(state.materials.carpetColorHex || "#111827");
    const leftMatGeo = new THREE.BoxGeometry(0.42, 0.012, 0.75);
    const leftMat = new THREE.Mesh(leftMatGeo, matMat);
    leftMat.position.set(-0.35, 0.045 + dy, -0.42);
    leftMat.receiveShadow = true;
    group.add(leftMat);

    const rightMat = leftMat.clone();
    rightMat.position.x = 0.35;
    group.add(rightMat);

    // Side Sills (Carbon Composite)
    const sillGeo = new THREE.BoxGeometry(0.18, 0.22, floorLength * 0.95);
    const leftSill = new THREE.Mesh(sillGeo, carbonMat);
    leftSill.position.set(-floorWidth / 2 - 0.08, 0.13 + dy, -0.45);
    leftSill.castShadow = true;
    group.add(leftSill);

    const rightSill = leftSill.clone();
    rightSill.position.x = floorWidth / 2 + 0.08;
    group.add(rightSill);

    // Anodized Aluminum Treadplates
    const treadMat = this.createAluminumMaterial();
    const treadGeo = new THREE.BoxGeometry(0.12, 0.008, 0.55);
    const leftTread = new THREE.Mesh(treadGeo, treadMat);
    leftTread.position.set(-floorWidth / 2 - 0.08, 0.245 + dy, -0.45);
    group.add(leftTread);

    const rightTread = leftTread.clone();
    rightTread.position.x = floorWidth / 2 + 0.08;
    group.add(rightTread);

    // Rear Firewall Bulkhead
    const bulkheadGeo = new THREE.BoxGeometry(floorWidth + 0.3, 0.75, 0.06);
    const bulkhead = new THREE.Mesh(bulkheadGeo, carbonMat);
    bulkhead.position.set(0, 0.40 + dy, -1.32);
    bulkhead.castShadow = true;
    group.add(bulkhead);

    this.tagComponent(group, "CHASSIS_TUB", "Carbon Monocoque Tub & Floor", 42.5);
    return group;
  }

  // ==========================================================================
  // 2. DASHBOARD & INSTRUMENT COWL ASSEMBLY
  // ==========================================================================
  public static buildDashboardAssembly(
    state: MasterModularInteriorState,
    halfTrackM: number,
    exploded: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "CAD_DashboardAssembly";
    const dz = -exploded * 0.35;
    const dy = exploded * 0.15;

    const dashWidth = Math.max(1.32, halfTrackM * 1.82);
    const primaryLeather = this.createLeatherMaterial(state.materials.seatPrimaryMaterial, "#1e293b");
    const secondaryLeather = this.createLeatherMaterial(state.materials.seatSecondaryMaterial, "#334155");
    const carbonMat = this.createCarbonMaterial();
    const glassMat = this.createDisplayGlassMaterial();
    const aluMat = this.createAluminumMaterial();

    // Main Upper Dashboard Crest
    const crestGeo = new THREE.BoxGeometry(dashWidth, 0.28, 0.52);
    const crest = new THREE.Mesh(crestGeo, primaryLeather);
    crest.position.set(0, 0.78 + dy, 0.32 + dz);
    crest.castShadow = true;
    crest.receiveShadow = true;
    group.add(crest);

    // Lower Knee Bolsters
    const kneeGeo = new THREE.BoxGeometry(dashWidth * 0.94, 0.22, 0.34);
    const kneeBolster = new THREE.Mesh(kneeGeo, secondaryLeather);
    kneeBolster.position.set(0, 0.55 + dy, 0.30 + dz);
    kneeBolster.receiveShadow = true;
    group.add(kneeBolster);

    // Pillar-to-Pillar Curved Glass Screen Blade
    const bladeWidth = dashWidth * 0.88;
    const screenBladeGeo = new THREE.BoxGeometry(bladeWidth, 0.19, 0.025);
    const screenBlade = new THREE.Mesh(screenBladeGeo, glassMat);
    screenBlade.position.set(0, 0.72 + dy, 0.52 + dz);
    screenBlade.rotation.x = -0.10;
    group.add(screenBlade);

    // Instrument Cluster Hood / Binnacle
    const binnacleGeo = new THREE.BoxGeometry(0.44, 0.16, 0.28);
    const binnacle = new THREE.Mesh(binnacleGeo, primaryLeather);
    binnacle.position.set(-0.36, 0.85 + dy, 0.42 + dz);
    binnacle.rotation.x = -0.05;
    binnacle.castShadow = true;
    group.add(binnacle);

    // Turbine HVAC Air Vents (4 Vents)
    const ventPositions = [-dashWidth * 0.4, -0.12, 0.12, dashWidth * 0.4];
    const ventRingGeo = new THREE.TorusGeometry(0.042, 0.008, 16, 32);
    const ventVanesGeo = new THREE.BoxGeometry(0.076, 0.004, 0.02);

    ventPositions.forEach((xPos) => {
      const ventRing = new THREE.Mesh(ventRingGeo, aluMat);
      ventRing.position.set(xPos, 0.68 + dy, 0.54 + dz);
      ventRing.rotation.x = Math.PI / 2;
      group.add(ventRing);

      // Inner vanes cross
      const vane1 = new THREE.Mesh(ventVanesGeo, aluMat);
      vane1.position.copy(ventRing.position);
      group.add(vane1);

      const vane2 = new THREE.Mesh(ventVanesGeo, aluMat);
      vane2.position.copy(ventRing.position);
      vane2.rotation.z = Math.PI / 2;
      group.add(vane2);
    });

    // Decorative Carbon / Wood Fascia Strip
    const fasciaGeo = new THREE.BoxGeometry(dashWidth * 0.92, 0.045, 0.015);
    const fascia = new THREE.Mesh(fasciaGeo, carbonMat);
    fascia.position.set(0, 0.63 + dy, 0.53 + dz);
    group.add(fascia);

    // Glovebox Assembly (Passenger Side)
    const gloveboxGeo = new THREE.BoxGeometry(0.48, 0.18, 0.04);
    const glovebox = new THREE.Mesh(gloveboxGeo, secondaryLeather);
    glovebox.position.set(0.38, 0.52 + dy, 0.51 + dz);
    group.add(glovebox);

    // Billet Glovebox Release Handle
    const handleGeo = new THREE.BoxGeometry(0.08, 0.018, 0.012);
    const handle = new THREE.Mesh(handleGeo, aluMat);
    handle.position.set(0.38, 0.58 + dy, 0.535 + dz);
    group.add(handle);

    this.tagComponent(group, "DASHBOARD", "Pillar-to-Pillar Monolithic Dashboard", 28.0);
    return group;
  }

  // ==========================================================================
  // 3. STEERING ASSEMBLY, PADDLES & YOKE
  // ==========================================================================
  public static buildSteeringAssembly(
    state: MasterModularInteriorState,
    steeringAngleRad: number,
    exploded: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "CAD_SteeringAssembly";
    const dz = exploded * 0.25;

    const aluMat = this.createAluminumMaterial();
    const carbonMat = this.createCarbonMaterial();
    const leatherMat = this.createLeatherMaterial("nappa_leather", "#1a1008");

    // Steering Column Tube
    const columnGeo = new THREE.CylinderGeometry(0.038, 0.048, 0.42, 24);
    const column = new THREE.Mesh(columnGeo, carbonMat);
    column.position.set(-0.36, 0.68, 0.25 - dz);
    column.rotation.x = 1.15; // Tilted toward driver
    group.add(column);

    // Steering Hub & Quick-Release Ring
    const hubGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.06, 24);
    const hub = new THREE.Mesh(hubGeo, aluMat);
    hub.position.set(-0.36, 0.77, 0.11 - dz);
    hub.rotation.x = 1.15;
    group.add(hub);

    // Rotating Wheel / Yoke Group
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(-0.36, 0.81, 0.06 - dz);
    wheelGroup.rotation.x = -0.42; // Match tilt
    wheelGroup.rotation.z = steeringAngleRad; // Dynamic steering turn

    if (state.steering.typology === "formula_gt3_carbon_yoke" || (state.steering.typology as any) === "gt3_race_yoke") {
      // GT3 Carbon Yoke Geometry
      const yokeRimGeo = new THREE.BoxGeometry(0.32, 0.032, 0.024);
      const yokeRim = new THREE.Mesh(yokeRimGeo, carbonMat);
      wheelGroup.add(yokeRim);

      // Alcantara Side Handgrips
      const gripGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.16, 16);
      const leftGrip = new THREE.Mesh(gripGeo, leatherMat);
      leftGrip.position.set(-0.15, 0, 0);
      leftGrip.rotation.x = Math.PI / 2;
      wheelGroup.add(leftGrip);

      const rightGrip = leftGrip.clone();
      rightGrip.position.x = 0.15;
      wheelGroup.add(rightGrip);

      // Center OLED Display Frame
      const oledGeo = new THREE.BoxGeometry(0.12, 0.065, 0.015);
      const oledMat = this.createDisplayGlassMaterial();
      const oledScreen = new THREE.Mesh(oledGeo, oledMat);
      oledScreen.position.set(0, 0.02, 0.012);
      wheelGroup.add(oledScreen);

      // Rotary Encoders (Manettino Dials)
      const dialGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.015, 16);
      const leftDial = new THREE.Mesh(dialGeo, aluMat);
      leftDial.position.set(-0.06, -0.04, 0.012);
      leftDial.rotation.x = Math.PI / 2;
      wheelGroup.add(leftDial);

      const rightDial = leftDial.clone();
      rightDial.position.x = 0.06;
      wheelGroup.add(rightDial);
    } else {
      // Sport GT Round / Flat-Bottom Steering Wheel
      const rimGeo = new THREE.TorusGeometry(0.17, 0.019, 20, 48);
      const rim = new THREE.Mesh(rimGeo, leatherMat);
      wheelGroup.add(rim);

      // 3 Spoke Structure
      const spokeGeo = new THREE.BoxGeometry(0.028, 0.14, 0.01);
      const centerSpoke = new THREE.Mesh(spokeGeo, aluMat);
      centerSpoke.position.set(0, -0.07, 0);
      wheelGroup.add(centerSpoke);

      const leftSpoke = new THREE.Mesh(spokeGeo, aluMat);
      leftSpoke.position.set(-0.08, 0.03, 0);
      leftSpoke.rotation.z = Math.PI / 3;
      wheelGroup.add(leftSpoke);

      const rightSpoke = new THREE.Mesh(spokeGeo, aluMat);
      rightSpoke.position.set(0.08, 0.03, 0);
      rightSpoke.rotation.z = -Math.PI / 3;
      wheelGroup.add(rightSpoke);

      // Horn Cap Badge
      const capGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.012, 24);
      const cap = new THREE.Mesh(capGeo, carbonMat);
      cap.position.set(0, 0, 0.008);
      cap.rotation.x = Math.PI / 2;
      wheelGroup.add(cap);
    }

    // Magnetic Tactile Paddle Shifters (Left (-) & Right (+))
    const paddleGeo = new THREE.BoxGeometry(0.035, 0.13, 0.006);
    const leftPaddle = new THREE.Mesh(paddleGeo, carbonMat);
    leftPaddle.position.set(-0.16, 0.02, -0.025);
    leftPaddle.rotation.z = -0.15;
    wheelGroup.add(leftPaddle);

    const rightPaddle = new THREE.Mesh(paddleGeo, carbonMat);
    rightPaddle.position.set(0.16, 0.02, -0.025);
    rightPaddle.rotation.z = 0.15;
    wheelGroup.add(rightPaddle);

    group.add(wheelGroup);

    this.tagComponent(group, "STEERING", "Carbon Racing Steering & Paddle Assembly", 5.8);
    return group;
  }

  // ==========================================================================
  // 4. SEATING SYSTEM (DRIVER & PASSENGER)
  // ==========================================================================
  public static buildSeatingSystem(
    state: MasterModularInteriorState,
    halfTrackM: number,
    exploded: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "CAD_SeatingSystem";

    const driverX = -Math.min(0.38, halfTrackM * 0.48);
    const passengerX = Math.min(0.38, halfTrackM * 0.48);

    const driverSeat = this.buildSingleSeat(state, true, exploded);
    driverSeat.position.set(driverX, 0, 0);
    group.add(driverSeat);

    const passengerSeat = this.buildSingleSeat(state, false, exploded);
    passengerSeat.position.set(passengerX, 0, 0);
    group.add(passengerSeat);

    this.tagComponent(group, "SEATING", "Driver & Passenger Sport Bucket Seats", 34.0);
    return group;
  }

  private static buildSingleSeat(
    state: MasterModularInteriorState,
    isDriver: boolean,
    exploded: number
  ): THREE.Group {
    const seatGroup = new THREE.Group();
    seatGroup.name = isDriver ? "DriverSeat" : "PassengerSeat";

    const dx = isDriver ? -exploded * 0.25 : exploded * 0.25;
    const dz = -exploded * 0.20;
    const seatColor = (state.materials as any).primaryColorHex || "#1e293b";
    const primaryLeather = this.createLeatherMaterial(state.materials.seatPrimaryMaterial, seatColor);
    const carbonMat = this.createCarbonMaterial();
    const metalMat = this.createAluminumMaterial();

    // 1. Seat Base Runners & Height Adjustment Rails
    const railGeo = new THREE.BoxGeometry(0.035, 0.028, 0.58);
    const leftRail = new THREE.Mesh(railGeo, metalMat);
    leftRail.position.set(-0.20 + dx, 0.08, -0.42 + dz);
    seatGroup.add(leftRail);

    const rightRail = leftRail.clone();
    rightRail.position.x = 0.20 + dx;
    seatGroup.add(rightRail);

    // 2. Lower Seat Cushion Base
    const cushionGeo = new THREE.BoxGeometry(0.52, 0.12, 0.54);
    const cushion = new THREE.Mesh(cushionGeo, primaryLeather);
    cushion.position.set(dx, 0.22, -0.42 + dz);
    cushion.castShadow = true;
    cushion.receiveShadow = true;
    seatGroup.add(cushion);

    // Thigh Support Extensions
    const bolsterGeo = new THREE.BoxGeometry(0.12, 0.15, 0.50);
    const leftBolster = new THREE.Mesh(bolsterGeo, primaryLeather);
    leftBolster.position.set(-0.22 + dx, 0.26, -0.42 + dz);
    seatGroup.add(leftBolster);

    const rightBolster = leftBolster.clone();
    rightBolster.position.x = 0.22 + dx;
    seatGroup.add(rightBolster);

    // 3. Ergonomic Backrest
    const backrestGeo = new THREE.BoxGeometry(0.48, 0.72, 0.10);
    const backrest = new THREE.Mesh(backrestGeo, primaryLeather);
    backrest.position.set(dx, 0.62, -0.66 + dz);
    backrest.rotation.x = -0.18; // Recline angle
    backrest.castShadow = true;
    seatGroup.add(backrest);

    // Carbon Fiber Rear Monocoque Shell Backing
    const shellGeo = new THREE.BoxGeometry(0.50, 0.74, 0.035);
    const shell = new THREE.Mesh(shellGeo, carbonMat);
    shell.position.set(dx, 0.62, -0.71 + dz);
    shell.rotation.x = -0.18;
    shell.castShadow = true;
    seatGroup.add(shell);

    // Integrated Headrest with Embossed Crest
    const headrestGeo = new THREE.BoxGeometry(0.28, 0.22, 0.08);
    const headrest = new THREE.Mesh(headrestGeo, primaryLeather);
    headrest.position.set(dx, 1.02, -0.74 + dz);
    headrest.rotation.x = -0.12;
    headrest.castShadow = true;
    seatGroup.add(headrest);

    // 6-Point FIA Racing Harness Belts & Buckles (Optional)
    if (state.seating.has6PointRacingHarness) {
      const beltMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(state.seating.harnessColorHex || "#dc2626"),
        roughness: 0.55,
        metalness: 0.1,
      });

      const beltGeo = new THREE.BoxGeometry(0.06, 0.78, 0.008);
      const leftBelt = new THREE.Mesh(beltGeo, beltMat);
      leftBelt.position.set(-0.12 + dx, 0.64, -0.63 + dz);
      leftBelt.rotation.x = -0.18;
      seatGroup.add(leftBelt);

      const rightBelt = leftBelt.clone();
      rightBelt.position.x = 0.12 + dx;
      seatGroup.add(rightBelt);

      // Anodized Camlock Latch Central Hub
      const buckleGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.024, 24);
      const buckle = new THREE.Mesh(buckleGeo, metalMat);
      buckle.position.set(dx, 0.28, -0.38 + dz);
      buckle.rotation.x = Math.PI / 2;
      seatGroup.add(buckle);
    }

    return seatGroup;
  }

  // ==========================================================================
  // 5. CENTER WATERFALL TUNNEL & CONSOLE
  // ==========================================================================
  public static buildCenterConsoleAssembly(
    state: MasterModularInteriorState,
    exploded: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "CAD_CenterConsole";
    const dy = -exploded * 0.15;

    const primaryLeather = this.createLeatherMaterial(state.materials.seatPrimaryMaterial, "#1e293b");
    const carbonMat = this.createCarbonMaterial();
    const aluMat = this.createAluminumMaterial();
    const glassMat = this.createDisplayGlassMaterial();

    // Central Tunnel Body
    const tunnelGeo = new THREE.BoxGeometry(0.28, 0.32, 0.95);
    const tunnel = new THREE.Mesh(tunnelGeo, primaryLeather);
    tunnel.position.set(0, 0.26 + dy, -0.22);
    tunnel.receiveShadow = true;
    group.add(tunnel);

    // Carbon Fiber Waterfall Deck Insert
    const deckGeo = new THREE.BoxGeometry(0.24, 0.02, 0.88);
    const deck = new THREE.Mesh(deckGeo, carbonMat);
    deck.position.set(0, 0.43 + dy, -0.22);
    group.add(deck);

    // Crystal Glass Rotary Transmission Dial (P-R-N-D-M)
    const dialGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.035, 32);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.02,
      ior: 1.54,
      thickness: 0.04,
    });
    const rotaryDial = new THREE.Mesh(dialGeo, crystalMat);
    rotaryDial.position.set(0, 0.46 + dy, 0.05);
    group.add(rotaryDial);

    // Anodized Dial Bezel
    const bezelGeo = new THREE.TorusGeometry(0.044, 0.005, 16, 32);
    const bezel = new THREE.Mesh(bezelGeo, aluMat);
    bezel.position.set(0, 0.445 + dy, 0.05);
    bezel.rotation.x = Math.PI / 2;
    group.add(bezel);

    // Dual Illuminated Halo Cup Holders
    const cupRingGeo = new THREE.TorusGeometry(0.038, 0.004, 16, 32);
    const cupLeft = new THREE.Mesh(cupRingGeo, aluMat);
    cupLeft.position.set(-0.06, 0.442 + dy, -0.22);
    cupLeft.rotation.x = Math.PI / 2;
    group.add(cupLeft);

    const cupRight = cupLeft.clone();
    cupRight.position.x = 0.06;
    group.add(cupRight);

    // Wireless Qi Charging Pad Bay
    const qiPadGeo = new THREE.BoxGeometry(0.12, 0.006, 0.18);
    const qiPad = new THREE.Mesh(qiPadGeo, glassMat);
    qiPad.position.set(0, 0.441 + dy, 0.22);
    group.add(qiPad);

    // Split Armrest Vault Lids
    const armrestGeo = new THREE.BoxGeometry(0.13, 0.08, 0.32);
    const leftArmrest = new THREE.Mesh(armrestGeo, primaryLeather);
    leftArmrest.position.set(-0.065, 0.48 + dy, -0.52);
    leftArmrest.castShadow = true;
    group.add(leftArmrest);

    const rightArmrest = leftArmrest.clone();
    rightArmrest.position.x = 0.065;
    group.add(rightArmrest);

    this.tagComponent(group, "CONSOLE", "Crystal Rotary Center Console & Armrest", 16.5);
    return group;
  }

  // ==========================================================================
  // 6. DOOR PANELS & LATCHES (LEFT & RIGHT)
  // ==========================================================================
  public static buildDoorCardAssemblies(
    state: MasterModularInteriorState,
    halfTrackM: number,
    doorOpenAngleDeg: number,
    exploded: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "CAD_DoorPanels";

    const doorRad = (doorOpenAngleDeg * Math.PI) / 180;
    const doorX = halfTrackM + exploded * 0.35;

    // Left Door Assembly
    const leftGroup = new THREE.Group();
    leftGroup.position.set(-0.35, 0, -doorX);
    leftGroup.rotation.y = -doorRad;

    const leftCard = this.buildSingleDoorCard(state, true);
    leftCard.position.set(-0.35, 0.45, 0);
    leftGroup.add(leftCard);
    group.add(leftGroup);

    // Right Door Assembly
    const rightGroup = new THREE.Group();
    rightGroup.position.set(-0.35, 0, doorX);
    rightGroup.rotation.y = doorRad;

    const rightCard = this.buildSingleDoorCard(state, false);
    rightCard.position.set(-0.35, 0.45, 0);
    rightGroup.add(rightCard);
    group.add(rightGroup);

    this.tagComponent(group, "DOORS", "Acoustic Multi-Layer Door Cards & Speaker Grilles", 22.0);
    return group;
  }

  private static buildSingleDoorCard(
    state: MasterModularInteriorState,
    isLeft: boolean
  ): THREE.Group {
    const cardGroup = new THREE.Group();

    const primaryLeather = this.createLeatherMaterial(state.materials.seatPrimaryMaterial, "#1e293b");
    const carbonMat = this.createCarbonMaterial();
    const aluMat = this.createAluminumMaterial();

    // Main Door Shell Card
    const shellGeo = new THREE.BoxGeometry(0.98, 0.58, 0.08);
    const shell = new THREE.Mesh(shellGeo, primaryLeather);
    shell.position.set(0, 0, 0);
    shell.receiveShadow = true;
    cardGroup.add(shell);

    // Inset Carbon Trim Insert Panel
    const insertGeo = new THREE.BoxGeometry(0.72, 0.22, 0.025);
    const insert = new THREE.Mesh(insertGeo, carbonMat);
    insert.position.set(0.04, 0.10, 0.042);
    cardGroup.add(insert);

    // Ergonomic Leather Armrest Shelf
    const armrestGeo = new THREE.BoxGeometry(0.55, 0.08, 0.12);
    const armrest = new THREE.Mesh(armrestGeo, primaryLeather);
    armrest.position.set(0.02, -0.06, 0.08);
    armrest.castShadow = true;
    cardGroup.add(armrest);

    // Laser-Etched Stainless Acoustic Speaker Grille
    const speakerGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.012, 32);
    const speakerGrille = new THREE.Mesh(speakerGeo, aluMat);
    speakerGrille.position.set(-0.25, -0.14, 0.045);
    speakerGrille.rotation.x = Math.PI / 2;
    cardGroup.add(speakerGrille);

    // Fabric Pull Strap or Billet Latch Lever
    const pullGeo = new THREE.BoxGeometry(0.12, 0.024, 0.008);
    const pullStrap = new THREE.Mesh(pullGeo, aluMat);
    pullStrap.position.set(0.28, 0.14, 0.05);
    cardGroup.add(pullStrap);

    return cardGroup;
  }

  // ==========================================================================
  // 7. PEDAL BOX & FOOTREST SUBSYSTEM
  // ==========================================================================
  public static buildPedalBoxAssembly(
    state: MasterModularInteriorState,
    exploded: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "CAD_PedalBox";
    const dz = exploded * 0.20;

    const aluMat = this.createAluminumMaterial();
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });

    // Mounting Base Frame
    const frameGeo = new THREE.BoxGeometry(0.36, 0.04, 0.28);
    const frame = new THREE.Mesh(frameGeo, aluMat);
    frame.position.set(-0.36, 0.10, 0.52 + dz);
    group.add(frame);

    // Accelerator, Brake & Clutch Pedals
    const pedalWidths = [0.045, 0.068, 0.045]; // Accelerator, Brake, Clutch
    const xOffsets = [-0.10, 0, 0.10];

    xOffsets.forEach((xOff, idx) => {
      const armGeo = new THREE.BoxGeometry(0.018, 0.18, 0.018);
      const arm = new THREE.Mesh(armGeo, aluMat);
      arm.position.set(-0.36 + xOff, 0.18, 0.48 + dz);
      arm.rotation.x = -0.45;
      group.add(arm);

      // Pad Faceplate with rubber studs
      const padGeo = new THREE.BoxGeometry(pedalWidths[idx], 0.09, 0.014);
      const pad = new THREE.Mesh(padGeo, aluMat);
      pad.position.set(-0.36 + xOff, 0.12, 0.42 + dz);
      pad.rotation.x = -0.25;
      group.add(pad);

      // Anti-slip studs grid
      const studGeo = new THREE.BoxGeometry(pedalWidths[idx] * 0.8, 0.07, 0.006);
      const stud = new THREE.Mesh(studGeo, rubberMat);
      stud.position.set(-0.36 + xOff, 0.12, 0.412 + dz);
      stud.rotation.x = -0.25;
      group.add(stud);
    });

    // Dead Pedal Footrest Plate (Far Left)
    const deadPedalGeo = new THREE.BoxGeometry(0.075, 0.20, 0.016);
    const deadPedal = new THREE.Mesh(deadPedalGeo, aluMat);
    deadPedal.position.set(-0.52, 0.16, 0.46 + dz);
    deadPedal.rotation.x = -0.40;
    group.add(deadPedal);

    this.tagComponent(group, "PEDALS", "Billet Aluminum Hydraulic Pedal Box Assembly", 4.2);
    return group;
  }

  // ==========================================================================
  // 8. SAFETY ROLL CAGE & STARLIGHT ROOF HEADLINER
  // ==========================================================================
  public static buildSafetyAndRoofAssembly(
    state: MasterModularInteriorState,
    halfTrackM: number,
    exploded: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "CAD_SafetyAndRoof";
    const dy = exploded * 0.35;

    const chromolyMat = new THREE.MeshPhysicalMaterial({
      color: 0xfbbf24,
      metalness: 0.95,
      roughness: 0.18,
      clearcoat: 0.6,
    });

    // FIA Chromoly Roll Cage Structure
    const pipeRadius = 0.022;
    const cageWidth = Math.max(1.15, halfTrackM * 1.62);

    // Main Hoop Arch Behind Driver
    const mainHoopGeo = new THREE.TorusGeometry(cageWidth / 2, pipeRadius, 16, 32, Math.PI);
    const mainHoop = new THREE.Mesh(mainHoopGeo, chromolyMat);
    mainHoop.position.set(0, 0.82 + dy, -1.25);
    group.add(mainHoop);

    // Diagonal Cross Brace
    const diagGeo = new THREE.CylinderGeometry(pipeRadius, pipeRadius, cageWidth * 1.1, 16);
    const diagBrace = new THREE.Mesh(diagGeo, chromolyMat);
    diagBrace.position.set(0, 0.75 + dy, -1.25);
    diagBrace.rotation.z = 0.68;
    group.add(diagBrace);

    // Panoramic Starlight Glass Roof Headliner
    const roofWidth = cageWidth + 0.12;
    const roofGeo = new THREE.BoxGeometry(roofWidth, 0.025, 1.65);
    const fabricMat = this.createFabricMaterial((state.materials as any).headlinerColorHex || "#1a1008");
    const roofMesh = new THREE.Mesh(roofGeo, fabricMat);
    roofMesh.position.set(0, 1.28 + dy, -0.40);
    roofMesh.receiveShadow = true;
    group.add(roofMesh);

    // 64 Fiber-Optic Starlight LED Nodes
    if (state.lighting.illuminatedZones.starlightRoofHeadliner) {
      const starGeo = new THREE.SphereGeometry(0.004, 8, 8);
      const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

      for (let i = 0; i < 64; i++) {
        const star = new THREE.Mesh(starGeo, starMat);
        const rx = (Math.random() - 0.5) * (roofWidth - 0.1);
        const rz = (Math.random() - 0.5) * 1.4 - 0.40;
        star.position.set(rx, 1.265 + dy, rz);
        group.add(star);
      }
    }

    this.tagComponent(group, "ROOF", "FIA Chromoly Cage & Starlight Roof", 18.5);
    return group;
  }

  // ==========================================================================
  // HELPER MATERIAL & METADATA GENERATORS
  // ==========================================================================
  private static createCarbonMaterial(): THREE.MeshPhysicalMaterial {
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.18,
      metalness: 0.65,
      clearcoat: 0.9,
      clearcoatRoughness: 0.04,
      envMapIntensity: 1.5,
    });
    const carbonNorm = this.texSynthesizer.getProceduralNormalMap("carbon_twill");
    if (carbonNorm) mat.normalMap = carbonNorm;
    return mat;
  }

  private static createLeatherMaterial(type: InteriorMaterialType, hexColor: string): THREE.MeshPhysicalMaterial {
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(hexColor),
      roughness: type === "nappa_leather" ? 0.62 : 0.74,
      metalness: 0.04,
      clearcoat: 0.15,
      clearcoatRoughness: 0.4,
      sheen: 0.35,
      sheenColor: new THREE.Color(hexColor).multiplyScalar(1.2),
      envMapIntensity: 0.4,
    });
    const leatherNorm = this.texSynthesizer.getProceduralNormalMap("leather_grain");
    if (leatherNorm) mat.normalMap = leatherNorm;
    return mat;
  }

  private static createAluminumMaterial(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: 0xe2e8f0,
      roughness: 0.22,
      metalness: 0.94,
      clearcoat: 0.4,
      envMapIntensity: 1.6,
    });
  }

  private static createDisplayGlassMaterial(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: 0x020617,
      roughness: 0.03,
      metalness: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      envMapIntensity: 1.8,
    });
  }

  private static createFabricMaterial(hexColor: string): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(hexColor),
      roughness: 0.88,
      metalness: 0.02,
    });
  }

  private static tagComponent(
    group: THREE.Object3D,
    category: InteriorCadComponentMetadata["category"],
    name: string,
    massKg: number
  ) {
    const box = new THREE.Box3().setFromObject(group);
    const size = new THREE.Vector3();
    box.getSize(size);

    let triangleCount = 0;
    let vertexCount = 0;

    group.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.geometry) {
        const geo = obj.geometry;
        if (geo.index) {
          triangleCount += geo.index.count / 3;
        } else if (geo.attributes.position) {
          triangleCount += geo.attributes.position.count / 3;
        }
        if (geo.attributes.position) {
          vertexCount += geo.attributes.position.count;
        }
      }
    });

    const meta: InteriorCadComponentMetadata = {
      id: group.name,
      name,
      category,
      massKg,
      material: "Composite CAD Assembly",
      triangleCount: Math.round(triangleCount),
      vertexCount: Math.round(vertexCount),
      dimensionsMm: {
        x: Math.round(size.x * 1000),
        y: Math.round(size.y * 1000),
        z: Math.round(size.z * 1000),
      },
    };

    group.userData = { ...group.userData, metadata: meta };
  }
}
