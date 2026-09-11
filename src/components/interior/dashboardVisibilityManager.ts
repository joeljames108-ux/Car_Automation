/**
 * ============================================================================
 * DASHBOARD VISIBILITY MANAGER (Three.js WebGL Engine)
 * ============================================================================
 * Manages discrete object visibility swaps and exploded inspection offsets:
 * - 7 Modular Steering Wheel typologies
 * - 7 Modular Center Console Shifter mechanisms
 * - Paddle shifters and Drive Mode dials
 * - HUD virtual projection plane
 * - Radial Exploded View offset transformations
 * ============================================================================
 */

import * as THREE from "three";
import { DashboardAssetManager } from "./dashboardAssetManager";
import {
  SteeringWheelStyle,
  ShifterStyle,
  PaddleShifterStyle,
  HUDMode,
  ClusterStyle,
  SeatingCapacity,
  Row2SeatingType,
  RearEntertainment,
} from "../../state/interiorDashboardConfigStore";

export class DashboardVisibilityManager {
  private assetManager: DashboardAssetManager;

  // Stored base transforms for exploded view lerping
  private initialPositions: Map<string, THREE.Vector3> = new Map();

  constructor(assetManager: DashboardAssetManager) {
    this.assetManager = assetManager;
  }

  public registerInitialTransforms() {
    const trackedKeys = [
      "DASH_UPPER_PAD",
      "DASH_UPPER_COWL_BINNACLE",
      "DASH_UPPER_PASS_SWEEP",
      "DASH_TRIM_SPEAR",
      "INFOTAINMENT_BEZEL",
      "INFOTAINMENT_SCREEN",
      "CLUSTER_HOOD",
      "CLUSTER_SCREEN",
      "STEERING",
      "CONSOLE_ROOT",
      "CABIN_SEATS",
    ];

    trackedKeys.forEach((key) => {
      const node = this.assetManager.getNode(key);
      if (node) {
        this.initialPositions.set(key, node.position.clone());
      }
    });
  }

  // 1. Steering Wheel Swapping
  public updateSteeringWheel(style: SteeringWheelStyle) {
    const wheelMap: Record<SteeringWheelStyle, string> = {
      sport: "STEERING_SPORT_3SPOKE",
      gt_3spoke: "STEERING_GT_3SPOKE",
      yoke: "STEERING_GT3_YOKE",
      formula: "STEERING_FORMULA",
      luxury_2spoke: "STEERING_LUXURY_2SPOKE",
      classic_4spoke: "STEERING_CLASSIC_4SPOKE",
      performance_4spoke: "STEERING_PERFORMANCE_4SPOKE",
    };

    Object.entries(wheelMap).forEach(([st, nodeName]) => {
      const node = this.assetManager.getNode(nodeName);
      if (node) {
        node.visible = st === style;
      }
    });
  }

  // 2. Shifter Mechanism Swapping
  public updateShifter(style: ShifterStyle) {
    const shifterMap: Record<ShifterStyle, string> = {
      auto: "CONSOLE_SHIFTER_AUTO",
      manual_gated: "CONSOLE_SHIFTER_MANUAL_GATED",
      manual_h: "CONSOLE_SHIFTER_MANUAL_H",
      toggle: "CONSOLE_SHIFTER_TOGGLE",
      rotary: "CONSOLE_SHIFTER_ROTARY",
      crystal: "CONSOLE_SHIFTER_CRYSTAL",
      performance: "CONSOLE_SHIFTER_PERFORMANCE",
    };

    Object.entries(shifterMap).forEach(([st, nodeName]) => {
      const node = this.assetManager.getNode(nodeName);
      if (node) {
        node.visible = st === style;
      }
    });
  }

  // 3. Paddle Shifters Visibility
  public updatePaddleShifters(style: PaddleShifterStyle) {
    const padL = this.assetManager.getNode("STEERING_PADDLE_SHIFTERS");
    const padR = this.assetManager.getNode("STEER_PADDLE_R");
    const isVis = style !== "none";
    if (padL) padL.visible = isVis;
    if (padR) padR.visible = isVis;
  }

  // 4. Head-Up Display (HUD) Visibility
  public updateHUD(mode: HUDMode) {
    const hud = this.assetManager.getNode("HUD_PROJECTION_PLANE");
    if (hud) {
      hud.visible = mode !== "off";
    }
  }

  // 4b. Cluster Style Swapping (Physical analog dials vs Digital screen display)
  public updateClusterStyle(style: ClusterStyle) {
    const isAnalog = style === "analog";
    const analogNodes = [
      "CLUSTER_BEZEL_SPEEDO",
      "CLUSTER_BEZEL_TACHO",
      "CLUSTER_DIAL_SPEEDO",
      "CLUSTER_DIAL_TACHO",
      "CLUSTER_NEEDLE_SPEEDO",
      "CLUSTER_NEEDLE_TACHO",
    ];
    analogNodes.forEach((name) => {
      const node = this.assetManager.getNode(name);
      if (node) {
        node.visible = isAnalog;
      }
    });
  }

  // 5. Exploded View Radial Displacements
  public updateExplodedView(progress: number) {
    const t = Math.max(0, Math.min(1, progress));

    const offsets: Record<string, THREE.Vector3> = {
      DASH_UPPER_PAD: new THREE.Vector3(0, 0.08 * t, 0.14 * t),
      DASH_UPPER_COWL_BINNACLE: new THREE.Vector3(0, 0.08 * t, 0.16 * t),
      DASH_UPPER_PASS_SWEEP: new THREE.Vector3(0, 0.08 * t, 0.14 * t),
      DASH_TRIM_SPEAR: new THREE.Vector3(0, -0.06 * t, 0.04 * t),
      INFOTAINMENT_BEZEL: new THREE.Vector3(0, -0.10 * t, 0),
      INFOTAINMENT_SCREEN: new THREE.Vector3(0, -0.12 * t, 0),
      CLUSTER_HOOD: new THREE.Vector3(0, -0.05 * t, 0.08 * t),
      CLUSTER_SCREEN: new THREE.Vector3(0, -0.07 * t, 0.08 * t),
      STEERING: new THREE.Vector3(0, -0.18 * t, 0.05 * t),
      CONSOLE_ROOT: new THREE.Vector3(0, 0, -0.12 * t),
      CABIN_SEATS: new THREE.Vector3(0, -0.15 * t, -0.05 * t),
    };

    Object.entries(offsets).forEach(([key, offset]) => {
      const node = this.assetManager.getNode(key);
      const basePos = this.initialPositions.get(key);
      if (node && basePos) {
        node.position.copy(basePos).add(offset);
      }
    });
  }

  // ── 6. Rear Cabin Seating Capacity Visibility ──
  public updateSeatingCapacity(capacity: SeatingCapacity) {
    // Row 2 seats (always visible for all capacities)
    const row2Nodes = [
      "SEAT_ROW2_L", "SEAT_ROW2_R", "SEAT_ROW2_C",
      "SEATBELT_ROW2_L", "SEATBELT_ROW2_R", "SEATBELT_ROW2_C",
      "SEAT_ROW2_ARMREST_CONSOLE",
    ];
    row2Nodes.forEach((name) => {
      const node = this.assetManager.getNode(name);
      if (node) node.visible = true;
    });

    // Row 3 seats — only visible for 7 and 8 seater
    const row3OutboardNodes = [
      "SEAT_ROW3_L", "SEAT_ROW3_R",
      "ROW3_ARMREST_L", "ROW3_ARMREST_R",
      "SEATBELT_ROW3_L", "SEATBELT_ROW3_R",
    ];
    const row3CenterNodes = ["SEAT_ROW3_C", "SEATBELT_ROW3_C"];
    const showRow3 = capacity === "7_seater" || capacity === "8_seater";
    const showRow3Center = capacity === "8_seater";

    row3OutboardNodes.forEach((name) => {
      const node = this.assetManager.getNode(name);
      if (node) node.visible = showRow3;
    });
    row3CenterNodes.forEach((name) => {
      const node = this.assetManager.getNode(name);
      if (node) node.visible = showRow3Center;
    });
  }

  // ── 7. Row 2 Seating Style Toggle (Bench vs Captain vs Lounge) ──
  public updateRow2Style(style: Row2SeatingType) {
    // Center seat visible only in bench modes
    const centerSeat = this.assetManager.getNode("SEAT_ROW2_C");
    if (centerSeat) {
      centerSeat.visible = style === "split_bench_40_20_40";
    }

    // Captain console visible only for executive captain chairs
    const captainConsole = this.assetManager.getNode("SEAT_ROW2_CAPTAIN_CONSOLE");
    if (captainConsole) {
      captainConsole.visible = style === "executive_captain_chairs";
    }

    // Armrest console visible for bench and lounge
    const armrestConsole = this.assetManager.getNode("SEAT_ROW2_ARMREST_CONSOLE");
    if (armrestConsole) {
      armrestConsole.visible = style !== "executive_captain_chairs";
    }
  }

  // ── 8. Rear Entertainment & Amenities Visibility ──
  public updateRearAmenities(
    entertainment: RearEntertainment,
    foldingTables: boolean,
  ) {
    // Seatback OLED screens
    const screenL = this.assetManager.getNode("REAR_SEATBACK_SCREEN_L");
    const screenR = this.assetManager.getNode("REAR_SEATBACK_SCREEN_R");
    const showSeatbackScreens = entertainment === "dual_11in_oled" || entertainment === "executive_bundle";
    if (screenL) screenL.visible = showSeatbackScreens;
    if (screenR) screenR.visible = showSeatbackScreens;

    // 31" Theater screen
    const theaterScreen = this.assetManager.getNode("REAR_THEATER_SCREEN_31IN");
    const showTheater = entertainment === "overhead_theater_31in" || entertainment === "executive_bundle";
    if (theaterScreen) theaterScreen.visible = showTheater;

    // Rear HVAC console (always visible when rear cabin exists)
    const rearHvac = this.assetManager.getNode("REAR_CONSOLE_HVAC");
    if (rearHvac) rearHvac.visible = true;

    // Folding tables
    const tableL = this.assetManager.getNode("REAR_FOLDING_TABLE_L");
    const tableR = this.assetManager.getNode("REAR_FOLDING_TABLE_R");
    if (tableL) tableL.visible = foldingTables;
    if (tableR) tableR.visible = foldingTables;
  }
}

