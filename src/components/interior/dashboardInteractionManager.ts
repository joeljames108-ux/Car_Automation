/**
 * ============================================================================
 * DASHBOARD INTERACTION MANAGER (Three.js WebGL Engine)
 * ============================================================================
 * Handles 3D raycasting, click-to-configure mapping, and hover feedback:
 * - Clicking Steering Wheel -> Activates 'steering' configuration panel
 * - Clicking Infotainment Screen / HVAC -> Activates 'dashboard' panel
 * - Clicking Center Console / Shifter -> Activates 'other' panel
 * - Emits HMI audio feedback synth sound on click
 * ============================================================================
 */

import * as THREE from "three";
import { DashboardAssetManager } from "./dashboardAssetManager";
import { playHMIClickSound } from "../../utils/hmiSoundSynth";
import { ActiveConfigPanel } from "../../state/interiorDashboardConfigStore";

export class DashboardInteractionManager {
  private camera: THREE.PerspectiveCamera;
  private assetManager: DashboardAssetManager;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;

  private onSelectPanel?: (panel: ActiveConfigPanel) => void;

  constructor(
    camera: THREE.PerspectiveCamera,
    assetManager: DashboardAssetManager,
    onSelectPanel?: (panel: ActiveConfigPanel) => void
  ) {
    this.camera = camera;
    this.assetManager = assetManager;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.onSelectPanel = onSelectPanel;
  }

  public handleClick(event: MouseEvent, container: HTMLElement) {
    const rect = container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const root = this.assetManager.getRoot();
    if (!root) return;

    const intersects = this.raycaster.intersectObjects(root.children, true);
    if (intersects.length === 0) return;

    // Find the first hit mesh and check its hierarchy
    let current: THREE.Object3D | null = intersects[0].object;
    let targetPanel: ActiveConfigPanel | null = null;

    while (current && current !== root) {
      const name = current.name || "";
      if (name.includes("SEAT")) {
        targetPanel = "seats";
        break;
      }
      if (name.includes("CONSOLE") || name.includes("SHIFTER")) {
        targetPanel = "console";
        break;
      }
      if (name.includes("DOOR")) {
        targetPanel = "doors";
        break;
      }
      if (name.includes("STEERING") || name.includes("STEER")) {
        targetPanel = "steering";
        break;
      }
      if (
        name.includes("INFOTAINMENT") ||
        name.includes("DASH") ||
        name.includes("CLUSTER") ||
        name.includes("HVAC")
      ) {
        targetPanel = "dashboard";
        break;
      }
      current = current.parent;
    }

    if (targetPanel) {
      playHMIClickSound();
      if (this.onSelectPanel) {
        this.onSelectPanel(targetPanel);
      }
    }
  }
}
