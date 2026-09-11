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
  private driverFillLight: THREE.PointLight;
  private consoleFillLight: THREE.PointLight;
  private cabinDomeLight: THREE.PointLight;
  private screenBounceLight: THREE.PointLight;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.38);
    this.scene.add(this.ambientLight);

    // 1. Directional Sun Key Light through windshield (matching Blender SunKey)
    this.sunLight = new THREE.DirectionalLight(0xfff8ed, 1.35);
    this.sunLight.position.set(1.8, 3.2, 1.8);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.bias = -0.0001;
    this.scene.add(this.sunLight);

    // 2. Driver Shoulder Fill Light (illuminates wheel, cluster hood, and driver door trim)
    this.driverFillLight = new THREE.PointLight(0xfff8ee, 0.75, 2.5);
    this.driverFillLight.position.set(-0.28, 0.82, 0.65);
    this.scene.add(this.driverFillLight);

    // 3. Center Console Soft Fill Light (highlights walnut top plate, shifter, and leather armrest)
    this.consoleFillLight = new THREE.PointLight(0xebf2fa, 0.65, 2.2);
    this.consoleFillLight.position.set(0.0, 0.66, 0.20);
    this.scene.add(this.consoleFillLight);

    // 4. Overhead Cabin Dome Area Fill (ambient interior roof glow)
    this.cabinDomeLight = new THREE.PointLight(0xf1f5f9, 0.45, 3.0);
    this.cabinDomeLight.position.set(0.0, 1.18, 0.30);
    this.scene.add(this.cabinDomeLight);

    // 5. Dynamic Screen Bounce Light (positioned directly on INFOTAINMENT_SCREEN)
    this.screenBounceLight = new THREE.PointLight(0x0284c7, 0.25, 1.2);
    this.screenBounceLight.position.set(0.01, 0.58, 0.08);
    this.scene.add(this.screenBounceLight);

    this.setLightingMode("day");
  }

  public setLightingMode(mode: LightingMode) {
    switch (mode) {
      case "sunset":
        this.ambientLight.color.setHex(0xfed7aa);
        this.ambientLight.intensity = 0.32;
        this.sunLight.color.setHex(0xf97316);
        this.sunLight.intensity = 1.45;
        this.sunLight.position.set(2.5, 1.4, 2.0);
        this.driverFillLight.color.setHex(0xfba04b);
        this.driverFillLight.intensity = 0.55;
        this.consoleFillLight.color.setHex(0xfed7aa);
        this.consoleFillLight.intensity = 0.45;
        this.cabinDomeLight.color.setHex(0xf97316);
        this.cabinDomeLight.intensity = 0.30;
        this.screenBounceLight.intensity = 0.45;
        break;

      case "night":
      case "track_night":
        this.ambientLight.color.setHex(0x0f172a);
        this.ambientLight.intensity = 0.10;
        this.sunLight.color.setHex(0x1e293b);
        this.sunLight.intensity = 0.12;
        this.driverFillLight.color.setHex(0x0369a1);
        this.driverFillLight.intensity = 0.18;
        this.consoleFillLight.color.setHex(0x0284c7);
        this.consoleFillLight.intensity = 0.15;
        this.cabinDomeLight.intensity = 0.08;
        this.screenBounceLight.color.setHex(mode === "track_night" ? 0xef4444 : 0x06b6d4);
        this.screenBounceLight.intensity = 1.6;
        break;

      case "day":
      default:
        this.ambientLight.color.setHex(0xffffff);
        this.ambientLight.intensity = 0.38;
        this.sunLight.color.setHex(0xfff8ed);
        this.sunLight.intensity = 1.35;
        this.sunLight.position.set(1.8, 3.2, 1.8);
        this.driverFillLight.color.setHex(0xfff8ee);
        this.driverFillLight.intensity = 0.75;
        this.consoleFillLight.color.setHex(0xebf2fa);
        this.consoleFillLight.intensity = 0.65;
        this.cabinDomeLight.color.setHex(0xf1f5f9);
        this.cabinDomeLight.intensity = 0.45;
        this.screenBounceLight.intensity = 0.25;
        break;
    }
  }
}
