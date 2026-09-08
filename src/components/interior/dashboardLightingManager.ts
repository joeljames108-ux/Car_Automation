/**
 * ============================================================================
 * DASHBOARD LIGHTING MANAGER (Three.js WebGL Engine)
 * ============================================================================
 * Manages 3-point automotive studio lighting & night-mode screen glow:
 * - Day Mode: Crisp neutral daylight, sharp sun reflections
 * - Sunset Mode: Warm golden hour key lighting
 * - Night Mode: Moody dark cabin, intense neon lightguides, subtle screen bounce
 * - Track Night: Darkened cockpit with red tactical cluster glow
 * ============================================================================
 */

import * as THREE from "three";
import { LightingMode } from "../../state/interiorDashboardConfigStore";

export class DashboardLightingManager {
  private scene: THREE.Scene;

  // Lights
  private ambientLight: THREE.AmbientLight;
  private sunLight: THREE.DirectionalLight;
  private cabinFillLight: THREE.PointLight;
  private screenBounceLight: THREE.PointLight;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.32);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xfff8ed, 1.15);
    this.sunLight.position.set(1.8, 3.2, 1.8);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.bias = -0.0001;
    this.scene.add(this.sunLight);

    this.cabinFillLight = new THREE.PointLight(0xdbeafe, 0.35, 3.5);
    this.cabinFillLight.position.set(0.0, 0.95, 0.15);
    this.scene.add(this.cabinFillLight);

    this.screenBounceLight = new THREE.PointLight(0x06b6d4, 0.25, 1.4);
    this.screenBounceLight.position.set(0.0, 0.62, -0.2);
    this.scene.add(this.screenBounceLight);

    this.setLightingMode("day");
  }

  public setLightingMode(mode: LightingMode) {
    switch (mode) {
      case "sunset":
        this.ambientLight.color.setHex(0xfed7aa);
        this.ambientLight.intensity = 0.30;
        this.sunLight.color.setHex(0xf97316);
        this.sunLight.intensity = 1.35;
        this.sunLight.position.set(2.5, 1.4, 2.0);
        this.cabinFillLight.color.setHex(0xfb923c);
        this.cabinFillLight.intensity = 0.25;
        this.screenBounceLight.intensity = 0.45;
        break;

      case "night":
      case "track_night":
        this.ambientLight.color.setHex(0x0f172a);
        this.ambientLight.intensity = 0.12;
        this.sunLight.color.setHex(0x1e293b);
        this.sunLight.intensity = 0.15;
        this.cabinFillLight.color.setHex(0x0284c7);
        this.cabinFillLight.intensity = 0.12;
        this.screenBounceLight.color.setHex(mode === "track_night" ? 0xef4444 : 0x06b6d4);
        this.screenBounceLight.intensity = 1.6; // Screen casts noticeable reflection at night
        break;

      case "day":
      default:
        this.ambientLight.color.setHex(0xffffff);
        this.ambientLight.intensity = 0.32;
        this.sunLight.color.setHex(0xfff8ed);
        this.sunLight.intensity = 1.15;
        this.sunLight.position.set(1.8, 3.2, 1.8);
        this.cabinFillLight.color.setHex(0xdbeafe);
        this.cabinFillLight.intensity = 0.35;
        this.screenBounceLight.intensity = 0.15;
        break;
    }
  }
}
