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
import {
  isRow2Available,
  isRow3Available,
  getInteriorVariantForBodyType,
} from "../../sim/modularVehicle/seatingConstraints";

export class DashboardVisibilityManager {
  private assetManager: DashboardAssetManager;

  // Stored base transforms for exploded view lerping and spatial stretching
  private initialPositions: Map<string, THREE.Vector3> = new Map();

  constructor(assetManager: DashboardAssetManager) {
    this.assetManager = assetManager;
  }

  public registerInitialTransforms() {
    this.initialPositions.clear();
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
      "SEAT_ROW2_L",
      "SEAT_ROW2_R",
      "SEAT_ROW2_C",
      "SEATBELT_ROW2_L",
      "SEATBELT_ROW2_R",
      "SEATBELT_ROW2_C",
      "SEAT_ROW2_ARMREST_CONSOLE",
      "SEAT_ROW2_CAPTAIN_CONSOLE",
      "REAR_CONSOLE_HVAC",
      "REAR_FOLDING_TABLE_L",
      "REAR_FOLDING_TABLE_R",
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

  // ── 6. Rear Cabin Seating Capacity & Architecture Visibility ──
  public updateSeatingCapacity(capacity: SeatingCapacity, bodyType: string = "sedan") {
    const numSeats = typeof capacity === "number" ? capacity : parseInt(String(capacity), 10) || 5;
    const isRow2 = isRow2Available(bodyType, numSeats);
    const isRow3 = isRow3Available(bodyType, numSeats);
    const variant = getInteriorVariantForBodyType(bodyType);

    // 6a. Single-Seat Monoposto (Track Special) passenger seat handling
    const passSeat = this.assetManager.getNode("SEAT_PASSENGER") || this.assetManager.getNode("CABIN_SEAT_PASSENGER");
    if (passSeat) {
      passSeat.visible = numSeats > 1;
    }

    // 6b. Row 2 Visibility & Spatial Layout
    const row2Nodes = [
      "SEAT_ROW2_L",
      "SEAT_ROW2_R",
      "SEAT_ROW2_C",
      "SEATBELT_ROW2_L",
      "SEATBELT_ROW2_R",
      "SEATBELT_ROW2_C",
      "SEAT_ROW2_ARMREST_CONSOLE",
      "SEAT_ROW2_CAPTAIN_CONSOLE",
    ];

    // Spatial legroom adjustment: for luxury sedan and limousine, shift Row 2 rearward (-0.28m Z)
    const isExecutiveLwb = variant === "executive_long_wheelbase";
    const lwbOffsetZ = isExecutiveLwb ? -0.28 : 0.0;

    row2Nodes.forEach((name) => {
      const node = this.assetManager.getNode(name);
      if (node) {
        node.visible = isRow2;
        const basePos = this.initialPositions.get(name);
        if (basePos) {
          node.position.set(basePos.x, basePos.y, basePos.z + lwbOffsetZ);
        }
      }
    });

    // Also shift rear amenities if executive LWB
    const rearAmenityNodes = ["REAR_CONSOLE_HVAC", "REAR_FOLDING_TABLE_L", "REAR_FOLDING_TABLE_R"];
    rearAmenityNodes.forEach((name) => {
      const node = this.assetManager.getNode(name);
      const basePos = this.initialPositions.get(name);
      if (node && basePos) {
        node.position.set(basePos.x, basePos.y, basePos.z + lwbOffsetZ);
      }
    });

    // 6c. Row 3 Visibility
    const row3OutboardNodes = [
      "SEAT_ROW3_L",
      "SEAT_ROW3_R",
      "ROW3_ARMREST_L",
      "ROW3_ARMREST_R",
      "SEATBELT_ROW3_L",
      "SEATBELT_ROW3_R",
    ];
    const row3CenterNodes = ["SEAT_ROW3_C", "SEATBELT_ROW3_C"];
    const showRow3 = isRow3 && numSeats >= 6;
    const showRow3Center = isRow3 && numSeats >= 8;

    row3OutboardNodes.forEach((name) => {
      const node = this.assetManager.getNode(name);
      if (node) node.visible = showRow3;
    });
    row3CenterNodes.forEach((name) => {
      const node = this.assetManager.getNode(name);
      if (node) node.visible = showRow3Center;
    });

    // 6d. Architecture-Specific Nodes (Luxury Lounge, Truck Workstation, Bus Transit Cabin)
    const luxuryLoungeGroup = this.assetManager.getNode("LUXURY_REAR_LOUNGE");
    if (luxuryLoungeGroup) {
      luxuryLoungeGroup.visible = variant === "executive_long_wheelbase";
    }

    const truckWorkstationGroup = this.assetManager.getNode("TRUCK_WORKSTATION");
    if (truckWorkstationGroup) {
      truckWorkstationGroup.visible = variant === "heavy_duty_truck";
    }

    const busTransitGroup = this.assetManager.getNode("BUS_TRANSIT_CABIN");
    if (busTransitGroup) {
      busTransitGroup.visible = variant === "transit_bus";
    }

    const truck4WdDial = this.assetManager.getNode("CONSOLE_4WD_DIAL") || this.assetManager.getNode("TRUCK_4WD_SELECTOR_DIAL");
    if (truck4WdDial) {
      truck4WdDial.visible = variant === "heavy_duty_truck";
    }

    const busFareBox = this.assetManager.getNode("INTERIOR_FareBox_Smartcard_Terminal") || this.assetManager.getNode("BUS_FAREBOX");
    if (busFareBox) {
      busFareBox.visible = variant === "transit_bus";
    }

    const busStanchions = this.assetManager.getNode("BUS_STANCHIONS") || this.assetManager.getNode("INTERIOR_Stanchion_Poles");
    if (busStanchions) {
      busStanchions.visible = variant === "transit_bus";
    }
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

  // ── 9. Bespoke Architecture Toggles ──
  public updateLuxuryLoungeAmenities(ottomans: boolean, chiller: boolean, theater: boolean) {
    const ottL = this.assetManager.getNode("LUXURY_OTTOMAN_L");
    const ottR = this.assetManager.getNode("LUXURY_OTTOMAN_R");
    if (ottL) ottL.visible = ottomans;
    if (ottR) ottR.visible = ottomans;

    const chillerObj = this.assetManager.getNode("LUXURY_CHAMPAGNE_CHILLER");
    const flute1 = this.assetManager.getNode("CHAMPAGNE_FLUTE_1");
    const flute2 = this.assetManager.getNode("CHAMPAGNE_FLUTE_2");
    if (chillerObj) chillerObj.visible = chiller;
    if (flute1) flute1.visible = chiller;
    if (flute2) flute2.visible = chiller;

    const theaterObj = this.assetManager.getNode("REAR_THEATER_SCREEN_31IN");
    if (theaterObj && theater) theaterObj.visible = true;
  }

  public updateTruckWorkstationAmenities(auxSwitches: boolean, storageVault: boolean) {
    const swPod = this.assetManager.getNode("TRUCK_AUX_SWITCHPOD");
    if (swPod) swPod.visible = auxSwitches;

    const vault = this.assetManager.getNode("TRUCK_UNDERSEAT_STORAGE");
    if (vault) vault.visible = storageVault;
  }

  public updateTransitBusAmenities(farebox: boolean, stanchions: boolean) {
    const fb = this.assetManager.getNode("BUS_FAREBOX") || this.assetManager.getNode("INTERIOR_FareBox_Smartcard_Terminal");
    if (fb) fb.visible = farebox;

    const st = this.assetManager.getNode("BUS_STANCHIONS") || this.assetManager.getNode("INTERIOR_Stanchion_Poles");
    if (st) st.visible = stanchions;
  }
}

