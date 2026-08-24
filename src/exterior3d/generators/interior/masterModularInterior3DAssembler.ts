/**
 * ============================================================================
 * MASTER MODULAR INTERIOR 3D PROCEDURAL ASSEMBLER
 * ============================================================================
 * Procedural Three.js generator for modular automotive cockpits:
 * 1. 10 Independent Subassemblies mapped to standardized 3D sockets
 * 2. Real-time Functional Cluster Canvas Texture (Speed, RPM, Gear, G-Force)
 * 3. Real-time Central Infotainment HMI Touchscreen Texture (Telemetry, Audio, Dynamics)
 * 4. Drilled Billet Aluminum Pedal Box with Rubber Grip Studs
 * 5. Interactive Door Swing Kinematics (0° to 65° open angle)
 * 6. Dynamic Steering Angle & Continuous Exploded View Kinematics
 * 7. Optional 3D Ergonomics & SAE J1100 Clearance Overlay
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
import { InteriorMountingGraph } from "../../sockets/interiorMountingGraph";
import { MasterPbrTextureSynthesizer } from "../../materials/masterPbrTextureSynthesizer";
import { FunctionalInstrumentClusterRenderer } from "./functionalInstrumentClusterRenderer";
import { FunctionalInfotainmentRenderer } from "./functionalInfotainmentRenderer";
import { InteriorErgonomicsVisualizer } from "./interiorErgonomicsVisualizer";

export class MasterModularInterior3DAssembler {
  private static clusterRendererInstance: FunctionalInstrumentClusterRenderer | null = null;
  private static infotainmentRendererInstance: FunctionalInfotainmentRenderer | null = null;

  public static getClusterRenderer(): FunctionalInstrumentClusterRenderer {
    if (!this.clusterRendererInstance) {
      this.clusterRendererInstance = new FunctionalInstrumentClusterRenderer(512, 256);
    }
    return this.clusterRendererInstance;
  }

  public static getInfotainmentRenderer(): FunctionalInfotainmentRenderer {
    if (!this.infotainmentRendererInstance) {
      this.infotainmentRendererInstance = new FunctionalInfotainmentRenderer(1024, 512);
    }
    return this.infotainmentRendererInstance;
  }

  /**
   * Assemble the complete 3D interior cabin graph
   */
  public static assembleInterior3D(
    state: MasterModularInteriorState,
    explodedFactor: number = 0.0,
    steeringAngleRad: number = 0.0,
    doorOpenAngleDeg: number = 0.0,
    showErgonomicsOverlay: boolean = false
  ): THREE.Group {
    const root = new THREE.Group();
    root.name = `ModularInterior_${state.id}`;

    const mountingGraph = InteriorMountingGraph.getInstance();
    const halfTrackM = (state.trackWidthMm / 2) / 1000;

    // 1. Cabin Floor & Monocoque Shell
    const shellGroup = this.buildCabinFloorShell(state);
    this.tagGroupComponent(shellGroup, "cabin_floor", "CABIN FLOOR & MONOCOQUE");
    root.add(shellGroup);

    // 2. Driver & Passenger Seats
    const driverSeatXform = mountingGraph.getSocketTransform("DRIVER_SEAT_MOUNT", explodedFactor, halfTrackM);
    const driverSeat = this.buildSeatMesh(
      state.seating.frontSeatType,
      state.materials.seatPrimaryMaterial,
      state.seating.has6PointRacingHarness,
      state.seating.harnessColorHex,
      true
    );
    driverSeat.position.copy(driverSeatXform.position);
    driverSeat.rotation.copy(driverSeatXform.rotation);
    this.tagGroupComponent(driverSeat, "seats", "DRIVER SPORT SEAT");
    root.add(driverSeat);

    const passSeatXform = mountingGraph.getSocketTransform("PASSENGER_SEAT_MOUNT", explodedFactor, halfTrackM);
    const passSeat = this.buildSeatMesh(
      state.seating.frontSeatType,
      state.materials.seatPrimaryMaterial,
      state.seating.has6PointRacingHarness,
      state.seating.harnessColorHex,
      false
    );
    passSeat.position.copy(passSeatXform.position);
    passSeat.rotation.copy(passSeatXform.rotation);
    this.tagGroupComponent(passSeat, "seats", "PASSENGER SEAT");
    root.add(passSeat);

    // 3. Rear Seating / Roll Cage
    const rearGroup = this.buildRearSeatingOrCage(state, explodedFactor, halfTrackM);
    this.tagGroupComponent(rearGroup, "seats", "REAR SEATING & CAGE");
    root.add(rearGroup);

    // 4. Modular Dashboard & Central Touchscreen
    const dashXform = mountingGraph.getSocketTransform("DASHBOARD_MOUNT", explodedFactor, halfTrackM);
    const dashMesh = this.buildDashboardMesh(state);
    dashMesh.position.copy(dashXform.position);
    dashMesh.rotation.copy(dashXform.rotation);
    this.tagGroupComponent(dashMesh, "dashboard", "MODULAR DASHBOARD");
    root.add(dashMesh);

    // 5. Functional Instrument Cluster (Directly in front of driver)
    const clusterRenderer = this.getClusterRenderer();
    const clusterTex = clusterRenderer.getTexture();
    const clusterMesh = this.buildClusterScreenMesh(clusterTex, state.dashboard.instrumentClusterStyle);
    clusterMesh.position.set(dashXform.position.x - 0.12, dashXform.position.y + 0.10, -0.32);
    this.tagGroupComponent(clusterMesh, "dashboard", "DIGITAL COCKPIT CLUSTER");
    root.add(clusterMesh);

    // 6. Functional Central Touchscreen HMI (Center stack)
    const infotainmentRenderer = this.getInfotainmentRenderer();
    const infoTex = infotainmentRenderer.getTexture();
    const centerScreenMesh = this.buildCenterTouchscreenMesh(infoTex, state.infotainment.screenSize);
    centerScreenMesh.position.set(dashXform.position.x - 0.08, dashXform.position.y + 0.04, 0);
    this.tagGroupComponent(centerScreenMesh, "dashboard", "CENTRAL INFOTAINMENT DISPLAY");
    root.add(centerScreenMesh);

    // 7. Steering Wheel with dynamic rotation
    const steerXform = mountingGraph.getSocketTransform("STEERING_MOUNT", explodedFactor, halfTrackM);
    const steerMesh = this.buildSteeringWheelMesh(state.steering.typology, state.materials.accentMetalFinish);
    steerMesh.position.copy(steerXform.position);
    steerMesh.rotation.copy(steerXform.rotation);
    steerMesh.rotation.x = steeringAngleRad; // Dynamic steering rotation
    this.tagGroupComponent(steerMesh, "steering", "STEERING WHEEL & COLUMN");
    root.add(steerMesh);

    // 8. Center Console
    const consoleXform = mountingGraph.getSocketTransform("CENTER_CONSOLE_MOUNT", explodedFactor, halfTrackM);
    const consoleMesh = this.buildCenterConsoleMesh(state);
    consoleMesh.position.copy(consoleXform.position);
    consoleMesh.rotation.copy(consoleXform.rotation);
    this.tagGroupComponent(consoleMesh, "center_console", "CENTER CONSOLE");
    root.add(consoleMesh);

    // 9. Drilled Billet Aluminum Pedal Box
    const pedalXform = mountingGraph.getSocketTransform("PEDAL_BOX_MOUNT", explodedFactor, halfTrackM);
    const pedalBox = this.buildPedalBoxMesh(state.materials.accentMetalFinish);
    pedalBox.position.copy(pedalXform.position);
    pedalBox.rotation.copy(pedalXform.rotation);
    this.tagGroupComponent(pedalBox, "steering", "BILLET ALUMINUM PEDAL BOX");
    root.add(pedalBox);

    // 10. Door Panels (Left & Right with Door Swing Kinematics)
    const doorRad = (doorOpenAngleDeg * Math.PI) / 180;

    const leftDoorXform = mountingGraph.getSocketTransform("DOOR_PANEL_LEFT", explodedFactor, halfTrackM);
    const leftDoorGroup = new THREE.Group();
    leftDoorGroup.position.set(-0.35, 0, -halfTrackM); // Hinge at A-pillar base
    leftDoorGroup.rotation.y = -doorRad; // Swing outward

    const leftDoor = this.buildDoorCardMesh(state, true);
    leftDoor.position.set(-0.35, leftDoorXform.position.y, 0);
    leftDoorGroup.add(leftDoor);
    this.tagGroupComponent(leftDoorGroup, "doors", "LEFT DOOR PANEL");
    root.add(leftDoorGroup);

    const rightDoorXform = mountingGraph.getSocketTransform("DOOR_PANEL_RIGHT", explodedFactor, halfTrackM);
    const rightDoorGroup = new THREE.Group();
    rightDoorGroup.position.set(-0.35, 0, halfTrackM); // Hinge at A-pillar base
    rightDoorGroup.rotation.y = doorRad; // Swing outward

    const rightDoor = this.buildDoorCardMesh(state, false);
    rightDoor.position.set(-0.35, rightDoorXform.position.y, 0);
    rightDoorGroup.add(rightDoor);
    this.tagGroupComponent(rightDoorGroup, "doors", "RIGHT DOOR PANEL");
    root.add(rightDoorGroup);

    // 11. Multi-Zone Ambient Light Strips
    if (state.lighting.enabled) {
      const ambientGroup = this.buildAmbientLightingStrips(state, explodedFactor, halfTrackM);
      this.tagGroupComponent(ambientGroup, "lighting", "MULTI-ZONE AMBIENT LEDS");
      root.add(ambientGroup);
    }

    // 12. Roof & Starlight Headliner
    if (state.lighting.illuminatedZones.starlightRoofHeadliner) {
      const roofXform = mountingGraph.getSocketTransform("ROOF_MOUNT", explodedFactor, halfTrackM);
      const starlightRoof = this.buildStarlightHeadliner(halfTrackM);
      starlightRoof.position.copy(roofXform.position);
      starlightRoof.rotation.copy(roofXform.rotation);
      this.tagGroupComponent(starlightRoof, "lighting", "STARLIGHT ROOF HEADLINER");
      root.add(starlightRoof);
    }

    // 13. Optional 3D Ergonomics & SAE J1100 Clearance Overlay
    if (showErgonomicsOverlay) {
      const ergoGroup = InteriorErgonomicsVisualizer.buildErgonomicsOverlay(state);
      this.tagGroupComponent(ergoGroup, "ergonomics", "SAE J1100 ERGONOMICS OVERLAY");
      root.add(ergoGroup);
    }

    return root;
  }

  private static tagGroupComponent(group: THREE.Object3D, componentId: string, componentName: string) {
    group.userData = { componentId, componentName };
    group.traverse((child) => {
      child.userData = { componentId, componentName };
    });
  }  private static getMaterial(type: InteriorMaterialType): THREE.Material {
    const texSynth = MasterPbrTextureSynthesizer.getInstance();
    switch (type) {
      case "3k_twill_carbon_fiber":
      case "forged_carbon_composite": {
        const mat = new THREE.MeshPhysicalMaterial({
          color: 0x18181b,
          roughness: 0.15,
          metalness: 0.7,
          clearcoat: 1.0,
          clearcoatRoughness: 0.03,
          envMapIntensity: 1.4,
          sheen: 0.2,
          sheenColor: new THREE.Color(0x1a1a2e),
          sheenRoughness: 0.3,
        });
        const carbonNorm = texSynth.getCarbonFiberNormalMap();
        if (carbonNorm) mat.normalMap = carbonNorm;
        return mat;
      }
      case "semi_aniline_leather":
      case "nappa_leather":
        return new THREE.MeshPhysicalMaterial({
          color: 0x854d0e,
          roughness: 0.55,
          metalness: 0.05,
          clearcoat: 0.15,
          clearcoatRoughness: 0.4,
          envMapIntensity: 0.5,
          sheen: 0.25,
          sheenColor: new THREE.Color(0x854d0e),
          sheenRoughness: 0.6,
        });
      case "perforated_alcantara":
        return new THREE.MeshPhysicalMaterial({
          color: 0x27272a,
          roughness: 0.75,
          metalness: 0.02,
          clearcoat: 0.08,
          envMapIntensity: 0.3,
          sheen: 0.4,
          sheenColor: new THREE.Color(0x3a3a3a),
          sheenRoughness: 0.8,
        });
      case "open_pore_walnut":
        return new THREE.MeshPhysicalMaterial({
          color: 0x451a03,
          roughness: 0.45,
          metalness: 0.0,
          clearcoat: 0.3,
          clearcoatRoughness: 0.15,
          envMapIntensity: 0.6,
        });
      case "brushed_billet_aluminum":
      case "titanium_satin_finish": {
        const mat = new THREE.MeshPhysicalMaterial({
          color: 0xd4d4d8,
          roughness: 0.22,
          metalness: 0.92,
          clearcoat: 0.5,
          clearcoatRoughness: 0.06,
          envMapIntensity: 1.5,
        });
        const aluNorm = texSynth.getBrushedAluminumNormalMap();
        if (aluNorm) mat.normalMap = aluNorm;
        return mat;
      }
      default:
        return new THREE.MeshPhysicalMaterial({
          color: 0x1e293b,
          roughness: 0.6,
          metalness: 0.08,
          clearcoat: 0.1,
          envMapIntensity: 0.4,
        });
    }
  }

  private static buildCabinFloorShell(state: MasterModularInteriorState): THREE.Group {
    const group = new THREE.Group();
    group.name = "CabinFloorShell";

    const floorMat = new THREE.MeshPhysicalMaterial({ color: 0x09090b, roughness: 0.82, metalness: 0.02, clearcoat: 0.05, envMapIntensity: 0.2 });
    const floorGeo = new THREE.BoxGeometry(1.6, 0.04, 1.4);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(-0.75, 0.08, 0);
    floor.receiveShadow = true;
    group.add(floor);

    return group;
  }

  private static buildSeatMesh(
    seatType: string,
    matType: InteriorMaterialType,
    hasHarness: boolean,
    harnessColorHex: string,
    isDriver: boolean
  ): THREE.Group {
    const seat = new THREE.Group();
    seat.name = isDriver ? "DriverSeat" : "PassengerSeat";

    const primaryMat = this.getMaterial(matType);
    const shellMat = new THREE.MeshPhysicalMaterial({ color: 0x18181b, metalness: 0.85, roughness: 0.12, clearcoat: 0.9, clearcoatRoughness: 0.03, envMapIntensity: 1.2 });

    // Base Cushion
    const baseGeo = new THREE.BoxGeometry(0.48, 0.12, 0.46);
    const base = new THREE.Mesh(baseGeo, primaryMat);
    base.position.set(0, 0.06, 0);
    base.castShadow = true;
    seat.add(base);

    // Bolsters Left & Right
    const bolsterGeo = new THREE.BoxGeometry(0.44, 0.09, 0.07);
    const leftBolster = new THREE.Mesh(bolsterGeo, primaryMat);
    leftBolster.position.set(0, 0.12, -0.22);
    const rightBolster = new THREE.Mesh(bolsterGeo, primaryMat);
    rightBolster.position.set(0, 0.12, 0.22);
    seat.add(leftBolster, rightBolster);

    // Backrest Cushion
    const backGeo = new THREE.BoxGeometry(0.10, 0.62, 0.44);
    const back = new THREE.Mesh(backGeo, primaryMat);
    back.position.set(-0.20, 0.40, 0);
    back.rotation.z = -0.18; // Reclined
    back.castShadow = true;
    seat.add(back);

    // Carbon Monocoque Back Shell
    const shellGeo = new THREE.BoxGeometry(0.04, 0.66, 0.46);
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.position.set(-0.25, 0.41, 0);
    shell.rotation.z = -0.18;
    seat.add(shell);

    // Headrest
    const headGeo = new THREE.BoxGeometry(0.08, 0.18, 0.22);
    const head = new THREE.Mesh(headGeo, primaryMat);
    head.position.set(-0.28, 0.78, 0);
    head.rotation.z = -0.18;
    seat.add(head);

    // 6-Point Racing Harness Straps
    if (hasHarness) {
      const harnessColor = new THREE.Color(harnessColorHex || 0xef4444);
      const harnessMat = new THREE.MeshStandardMaterial({ color: harnessColor, roughness: 0.5 });

      const strapLeft = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.48, 0.05), harnessMat);
      strapLeft.position.set(-0.16, 0.42, -0.10);
      strapLeft.rotation.z = -0.18;

      const strapRight = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.48, 0.05), harnessMat);
      strapRight.position.set(-0.16, 0.42, 0.10);
      strapRight.rotation.z = -0.18;

      const buckle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16),
        new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9 })
      );
      buckle.rotation.x = Math.PI / 2;
      buckle.position.set(-0.10, 0.22, 0);

      seat.add(strapLeft, strapRight, buckle);
    }

    return seat;
  }

  private static buildRearSeatingOrCage(
    state: MasterModularInteriorState,
    explodedFactor: number,
    halfTrackM: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = "RearCabinModule";

    const isDelete = state.seating.rearSeatType.includes("rear_seat_delete");
    const hasCage = state.safety.rollCage !== "none_standard_chassis";

    if (isDelete || hasCage) {
      // Roll Cage Tubular Structure (FIA / Clubsport)
      const cageMat = new THREE.MeshPhysicalMaterial({
        color: 0xef4444,
        metalness: 0.88,
        roughness: 0.14,
        clearcoat: 0.85,
        clearcoatRoughness: 0.04,
        envMapIntensity: 1.4,
      });

      const mainHoopGeo = new THREE.TorusGeometry(0.55, 0.022, 8, 24, Math.PI);
      const mainHoop = new THREE.Mesh(mainHoopGeo, cageMat);
      mainHoop.position.set(-1.10, 0.65, 0);
      mainHoop.rotation.y = Math.PI / 2;
      group.add(mainHoop);

      if (state.safety.rollCage.includes("6_point") || state.safety.rollCage.includes("spaceframe")) {
        // X-Brace
        const barGeo = new THREE.CylinderGeometry(0.018, 0.018, 1.1, 8);
        const bar1 = new THREE.Mesh(barGeo, cageMat);
        bar1.position.set(-1.35, 0.60, 0);
        bar1.rotation.z = -Math.PI / 4;
        bar1.rotation.x = Math.PI / 4;

        const bar2 = new THREE.Mesh(barGeo, cageMat);
        bar2.position.set(-1.35, 0.60, 0);
        bar2.rotation.z = -Math.PI / 4;
        bar2.rotation.x = -Math.PI / 4;

        group.add(bar1, bar2);
      }
    } else {
      // Rear passenger seats bench
      const rearMat = this.getMaterial(state.materials.seatPrimaryMaterial);
      const rearBench = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 1.1), rearMat);
      rearBench.position.set(-1.35, 0.22, 0);

      const rearBack = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 1.1), rearMat);
      rearBack.position.set(-1.55, 0.52, 0);
      rearBack.rotation.z = -0.15;

      group.add(rearBench, rearBack);
    }

    return group;
  }

  private static buildDashboardMesh(state: MasterModularInteriorState): THREE.Group {
    const dash = new THREE.Group();
    dash.name = "ModularDashboard";

    const dashMat = this.getMaterial(state.materials.dashboardPrimaryMaterial);
    const trimMat = this.getMaterial(state.materials.dashboardTrimInsert);

    // Main dashboard body
    const bodyGeo = new THREE.BoxGeometry(0.38, 0.28, 1.36);
    const body = new THREE.Mesh(bodyGeo, dashMat);
    body.position.set(0, 0, 0);
    body.castShadow = true;
    dash.add(body);

    // Trim Insert Blade
    const trimGeo = new THREE.BoxGeometry(0.04, 0.08, 1.28);
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(-0.18, -0.04, 0);
    dash.add(trim);

    // HVAC Turbine Vents (4 circular vents across dash)
    const ventMat = new THREE.MeshPhysicalMaterial({ color: 0xd4d4d8, metalness: 0.92, roughness: 0.12, clearcoat: 0.7, clearcoatRoughness: 0.04, envMapIntensity: 1.3 });
    const ventGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.02, 16);
    [-0.52, -0.18, 0.18, 0.52].forEach((zPos) => {
      const vent = new THREE.Mesh(ventGeo, ventMat);
      vent.rotation.z = Math.PI / 2;
      vent.position.set(-0.19, -0.04, zPos);
      dash.add(vent);
    });

    return dash;
  }

  private static buildClusterScreenMesh(tex: THREE.CanvasTexture | null, style: string): THREE.Mesh {
    const scrMat = new THREE.MeshBasicMaterial({
      map: tex || undefined,
      color: tex ? 0xffffff : 0x06b6d4,
    });
    const scrGeo = new THREE.PlaneGeometry(0.32, 0.16);
    const scr = new THREE.Mesh(scrGeo, scrMat);
    scr.rotation.y = Math.PI / 2; // Facing the driver
    scr.rotation.x = -0.10;       // Tilted upward toward driver eyes
    return scr;
  }

  private static buildCenterTouchscreenMesh(tex: THREE.CanvasTexture | null, size: string): THREE.Mesh {
    const scrMat = new THREE.MeshBasicMaterial({
      map: tex || undefined,
      color: tex ? 0xffffff : 0x06b6d4,
    });
    const scrGeo = new THREE.PlaneGeometry(0.38, 0.20);
    const scr = new THREE.Mesh(scrGeo, scrMat);
    scr.rotation.y = Math.PI / 2; // Facing cockpit center
    scr.rotation.x = -0.12;       // Angled slightly upward
    return scr;
  }

  private static buildSteeringWheelMesh(style: string, metalFinish: InteriorMaterialType): THREE.Group {
    const wheel = new THREE.Group();
    wheel.name = "SteeringWheel";
    const metalMat = this.getMaterial(metalFinish);
    const gripMat = new THREE.MeshPhysicalMaterial({ color: 0x18181b, roughness: 0.75, metalness: 0.02, clearcoat: 0.1, envMapIntensity: 0.2, sheen: 0.3, sheenColor: new THREE.Color(0x2a2a2a), sheenRoughness: 0.7 });

    if (style.includes("yoke")) {
      // GT3 / Formula Yoke Rim
      const leftGrip = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.18, 12), gripMat);
      leftGrip.position.set(0, 0, -0.15);
      const rightGrip = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.18, 12), gripMat);
      rightGrip.position.set(0, 0, 0.15);

      const crossSpoke = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.32), metalMat);
      crossSpoke.position.set(0, 0, 0);

      wheel.add(leftGrip, rightGrip, crossSpoke);
    } else {
      // Circular / Flat bottom Rim
      const rimGeo = new THREE.TorusGeometry(0.17, 0.015, 12, 32);
      const rim = new THREE.Mesh(rimGeo, gripMat);
      rim.rotation.y = Math.PI / 2;
      wheel.add(rim);

      const centerSpoke = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16), metalMat);
      centerSpoke.rotation.z = Math.PI / 2;
      wheel.add(centerSpoke);
    }

    // Paddle Shifters (+ & - in anodized aluminum)
    const paddleMat = new THREE.MeshPhysicalMaterial({ color: 0xd9a64e, metalness: 0.92, roughness: 0.12, clearcoat: 0.85, clearcoatRoughness: 0.03, envMapIntensity: 1.3 });
    const paddleGeo = new THREE.BoxGeometry(0.01, 0.10, 0.035);
    const leftPaddle = new THREE.Mesh(paddleGeo, paddleMat);
    leftPaddle.position.set(0.04, 0.03, -0.12);
    const rightPaddle = new THREE.Mesh(paddleGeo, paddleMat);
    rightPaddle.position.set(0.04, 0.03, 0.12);
    wheel.add(leftPaddle, rightPaddle);

    return wheel;
  }

  private static buildPedalBoxMesh(metalFinish: InteriorMaterialType): THREE.Group {
    const group = new THREE.Group();
    group.name = "PedalBox";
    const pedalMat = new THREE.MeshPhysicalMaterial({ color: 0xd4d4d8, metalness: 0.95, roughness: 0.18, clearcoat: 0.5, clearcoatRoughness: 0.05, envMapIntensity: 1.3 });
    const rubberMat = new THREE.MeshPhysicalMaterial({ color: 0x09090b, roughness: 0.85, metalness: 0.02, clearcoat: 0.1, envMapIntensity: 0.15 });

    // Throttle (Right), Brake (Center), Clutch/Footrest (Left)
    const pedalPositions = [
      { z: -0.22, w: 0.045, h: 0.11, label: "Throttle" },
      { z: -0.32, w: 0.065, h: 0.08, label: "Brake" },
      { z: -0.42, w: 0.055, h: 0.12, label: "DeadPedal" },
    ];

    pedalPositions.forEach((p) => {
      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.015, p.h, p.w), pedalMat);
      pad.rotation.z = -0.35; // Angled toward driver feet
      pad.position.set(0, 0.06, p.z);

      // Rubber grip studs
      const stud = new THREE.Mesh(new THREE.BoxGeometry(0.018, p.h * 0.7, p.w * 0.6), rubberMat);
      stud.rotation.z = -0.35;
      stud.position.set(0, 0.06, p.z);

      group.add(pad, stud);
    });

    return group;
  }

  private static buildCenterConsoleMesh(state: MasterModularInteriorState): THREE.Group {
    const group = new THREE.Group();
    group.name = "CenterConsole";
    const consoleMat = this.getMaterial(state.materials.centerConsolePrimary);

    const spineGeo = new THREE.BoxGeometry(0.65, 0.22, 0.26);
    const spine = new THREE.Mesh(spineGeo, consoleMat);
    spine.position.set(0, 0, 0);
    group.add(spine);

    // Gated Manual Shift Gate or Sequential Tower
    const shifterMat = new THREE.MeshPhysicalMaterial({ color: 0xd4d4d8, metalness: 0.95, roughness: 0.08, clearcoat: 0.8, clearcoatRoughness: 0.02, envMapIntensity: 1.5 });

    if (state.console.typology === "open_gated_manual_tunnel") {
      // Chrome Open Gate Plate
      const plateGeo = new THREE.BoxGeometry(0.12, 0.01, 0.12);
      const plate = new THREE.Mesh(plateGeo, shifterMat);
      plate.position.set(0.12, 0.115, 0);
      group.add(plate);

      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 12), shifterMat);
      stick.position.set(0.12, 0.18, 0);
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.024, 16, 16), shifterMat);
      knob.position.set(0.12, 0.25, 0);
      group.add(stick, knob);
    } else {
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.12, 12), shifterMat);
      stick.position.set(0.12, 0.16, 0);
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 16), shifterMat);
      knob.position.set(0.12, 0.22, 0);
      group.add(stick, knob);
    }

    // Dual Cup Holders
    const cupMat = new THREE.MeshPhysicalMaterial({ color: 0x09090b, roughness: 0.7, metalness: 0.05, clearcoat: 0.2, envMapIntensity: 0.3 });
    const cup1 = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.05, 16), cupMat);
    cup1.position.set(-0.10, 0.10, 0);
    group.add(cup1);

    return group;
  }

  private static buildDoorCardMesh(state: MasterModularInteriorState, isLeft: boolean): THREE.Group {
    const door = new THREE.Group();
    door.name = isLeft ? "LeftDoorCard" : "RightDoorCard";
    const doorMat = this.getMaterial(state.materials.dashboardPrimaryMaterial);
    const insertMat = this.getMaterial(state.materials.doorCardInsert);

    const cardGeo = new THREE.BoxGeometry(0.95, 0.52, 0.06);
    const card = new THREE.Mesh(cardGeo, doorMat);
    card.position.set(0, 0, 0);
    door.add(card);

    const insertGeo = new THREE.BoxGeometry(0.60, 0.20, 0.03);
    const insert = new THREE.Mesh(insertGeo, insertMat);
    insert.position.set(0, 0.04, isLeft ? 0.03 : -0.03);
    door.add(insert);

    // High-End Perforated Audio Speaker Grille (Burmester/Bowers style)
    const speakerMat = new THREE.MeshPhysicalMaterial({ color: 0xd4d4d8, metalness: 0.92, roughness: 0.18, clearcoat: 0.6, clearcoatRoughness: 0.04, envMapIntensity: 1.2 });
    const speakerGeo = new THREE.CircleGeometry(0.065, 24);
    const speaker = new THREE.Mesh(speakerGeo, speakerMat);
    speaker.rotation.y = isLeft ? Math.PI / 2 : -Math.PI / 2;
    speaker.position.set(0.20, -0.10, isLeft ? 0.035 : -0.035);
    door.add(speaker);

    return door;
  }

  private static buildAmbientLightingStrips(
    state: MasterModularInteriorState,
    explodedFactor: number,
    halfTrackM: number
  ): THREE.Group {
    const lightGroup = new THREE.Group();
    lightGroup.name = "AmbientLightingStrips";

    const lightColor = new THREE.Color(state.lighting.colorHex);
    const emissiveMat = new THREE.MeshBasicMaterial({ color: lightColor });

    const intensity = (state.lighting.brightnessPercent / 100) * 2.2;

    // Dashboard light strip
    if (state.lighting.illuminatedZones.dashboardStrip) {
      const dashStrip = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.015, 1.2), emissiveMat);
      dashStrip.position.set(-0.35 + (explodedFactor * 0.20), 0.68 + (explodedFactor * 0.34), 0);
      lightGroup.add(dashStrip);

      const pLight = new THREE.PointLight(lightColor, intensity, 1.8);
      pLight.position.set(-0.35, 0.68, 0);
      lightGroup.add(pLight);
    }

    // Door spearlights (Left & Right)
    if (state.lighting.illuminatedZones.doorStrips) {
      const leftDoorStrip = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.012, 0.015), emissiveMat);
      leftDoorStrip.position.set(-0.65, 0.48, -0.64 - (explodedFactor * 0.35));
      lightGroup.add(leftDoorStrip);

      const rightDoorStrip = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.012, 0.015), emissiveMat);
      rightDoorStrip.position.set(-0.65, 0.48, 0.64 + (explodedFactor * 0.35));
      lightGroup.add(rightDoorStrip);

      const doorLightLeft = new THREE.PointLight(lightColor, intensity * 0.7, 1.4);
      doorLightLeft.position.set(-0.65, 0.48, -0.60);
      const doorLightRight = new THREE.PointLight(lightColor, intensity * 0.7, 1.4);
      doorLightRight.position.set(-0.65, 0.48, 0.60);
      lightGroup.add(doorLightLeft, doorLightRight);
    }

    // Center Console Halo
    if (state.lighting.illuminatedZones.centerConsole) {
      const haloMesh = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.008, 8, 24), emissiveMat);
      haloMesh.rotation.x = Math.PI / 2;
      haloMesh.position.set(-0.55, 0.32, 0);
      lightGroup.add(haloMesh);

      const consoleLight = new THREE.PointLight(lightColor, intensity * 0.8, 1.2);
      consoleLight.position.set(-0.55, 0.35, 0);
      lightGroup.add(consoleLight);
    }

    // Footwell Ambient Light
    if (state.lighting.illuminatedZones.footwells) {
      const footwellLightLeft = new THREE.PointLight(lightColor, intensity * 0.6, 1.2);
      footwellLightLeft.position.set(-0.30, 0.15, -0.32);
      const footwellLightRight = new THREE.PointLight(lightColor, intensity * 0.6, 1.2);
      footwellLightRight.position.set(-0.30, 0.15, 0.32);
      lightGroup.add(footwellLightLeft, footwellLightRight);
    }

    return lightGroup;
  }

  private static buildStarlightHeadliner(halfTrackM: number): THREE.Group {
    const roof = new THREE.Group();
    roof.name = "StarlightHeadliner";

    const roofMat = new THREE.MeshPhysicalMaterial({ color: 0x09090b, roughness: 0.85, metalness: 0.02, clearcoat: 0.05, envMapIntensity: 0.15 });
    const panel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.02, 1.2), roofMat);
    panel.position.set(0, 0, 0);
    roof.add(panel);

    // Starlight glowing fiber optic points
    const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const starGeo = new THREE.SphereGeometry(0.006, 6, 6);
    for (let i = 0; i < 40; i++) {
      const star = new THREE.Mesh(starGeo, starMat);
      const rx = (Math.random() - 0.5) * 1.0;
      const rz = (Math.random() - 0.5) * 1.0;
      star.position.set(rx, -0.015, rz);
      roof.add(star);
    }

    return roof;
  }
}
