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
}
