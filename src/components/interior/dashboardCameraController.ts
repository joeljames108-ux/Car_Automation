/**
 * ============================================================================
 * DASHBOARD CAMERA CONTROLLER (Three.js WebGL Engine)
 * ============================================================================
 * Manages smooth camera transitions between cockpit perspectives:
 * - Driver POV calibrated to Image 4 reference (-0.22, 0.76, 0.78)
 * - Close-up focus presets (Steering, Infotainment, Console, Passenger, Full Cockpit)
 * - Driver height calibration (Low, Normal, Tall)
 * - Orbit constraint boundary prevention (locks camera inside cabin)
 * ============================================================================
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CameraPose, DriverHeight } from "../../state/interiorDashboardConfigStore";

export interface CameraTargetDef {
  pos: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
}

export class DashboardCameraController {
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;

  private currentPose: CameraPose = "dashboard_center";
  private driverHeight: DriverHeight = "normal";

  // Target vectors for smooth lerping
  private targetPos: THREE.Vector3 = new THREE.Vector3(0.0, 0.82, 0.46);
  private targetLookAt: THREE.Vector3 = new THREE.Vector3(0.0, 0.63, -0.44);
  private targetFov: number = 60;

  private poses: Record<CameraPose, CameraTargetDef> = {
    dashboard_center: {
      pos: new THREE.Vector3(0.0, 0.82, 0.46),
      target: new THREE.Vector3(0.0, 0.63, -0.44),
      fov: 60,
    },
    driver: {
      pos: new THREE.Vector3(-0.38, 0.88, 0.16),
      target: new THREE.Vector3(-0.38, 0.68, -0.44),
      fov: 54,
    },
    driver_close: {
      pos: new THREE.Vector3(-0.38, 0.84, 0.02),
      target: new THREE.Vector3(-0.38, 0.70, -0.40),
      fov: 48,
    },
    steering: {
      pos: new THREE.Vector3(-0.38, 0.80, -0.04),
      target: new THREE.Vector3(-0.38, 0.68, -0.26),
      fov: 46,
    },
    cluster: {
      pos: new THREE.Vector3(-0.38, 0.76, -0.12),
      target: new THREE.Vector3(-0.38, 0.72, -0.44),
      fov: 42,
    },
    infotainment: {
      pos: new THREE.Vector3(-0.10, 0.72, -0.12),
      target: new THREE.Vector3(0.0, 0.64, -0.44),
      fov: 44,
    },
    console: {
      pos: new THREE.Vector3(-0.16, 0.82, 0.06),
      target: new THREE.Vector3(0.0, 0.44, -0.16),
      fov: 48,
    },
    seats: {
      pos: new THREE.Vector3(-0.05, 0.98, -0.30),
      target: new THREE.Vector3(-0.25, 0.65, 0.22),
      fov: 52,
    },
    doors: {
      pos: new THREE.Vector3(0.12, 0.75, 0.05),
      target: new THREE.Vector3(-0.78, 0.58, -0.10),
      fov: 52,
    },
    vents: {
      pos: new THREE.Vector3(-0.14, 0.74, -0.15),
      target: new THREE.Vector3(0.0, 0.66, -0.42),
      fov: 40,
    },
    passenger: {
      pos: new THREE.Vector3(0.38, 0.88, 0.16),
      target: new THREE.Vector3(-0.15, 0.65, -0.35),
      fov: 54,
    },
    full_cockpit: {
      pos: new THREE.Vector3(0.0, 1.05, 0.65),
      target: new THREE.Vector3(0.0, 0.58, -0.20),
      fov: 62,
    },
    orbit_360: {
      pos: new THREE.Vector3(-0.45, 0.85, 0.45),
      target: new THREE.Vector3(0.0, 0.55, -0.10),
      fov: 54,
    },
    exploded: {
      pos: new THREE.Vector3(-0.85, 1.15, 0.65),
      target: new THREE.Vector3(0.0, 0.55, -0.10),
      fov: 58,
    },
  };

  constructor(camera: THREE.PerspectiveCamera, controls: OrbitControls) {
    this.camera = camera;
    this.controls = controls;
    this.configureControls();
    this.setPose("dashboard_center");
  }

  private configureControls() {
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 0.25;
    this.controls.maxDistance = 1.65;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.15; // Don't dip beneath floor
  }

  public setPose(pose: CameraPose) {
    this.currentPose = pose;
    const def = this.poses[pose] || this.poses.dashboard_center;

    const heightOffset = this.driverHeight === "low" ? -0.04 : this.driverHeight === "tall" ? 0.04 : 0.0;

    this.targetPos.copy(def.pos);
    if (pose === "driver" || pose === "driver_close" || pose === "passenger" || pose === "seats" || pose === "dashboard_center") {
      this.targetPos.y += heightOffset;
    }
    this.targetLookAt.copy(def.target);
    this.targetFov = def.fov;
  }

  public setDriverHeight(height: DriverHeight) {
    this.driverHeight = height;
    this.setPose(this.currentPose);
  }

  public update(lerpFactor: number = 0.06) {
    // Smooth camera position lerp
    this.camera.position.lerp(this.targetPos, lerpFactor);

    // Smooth controls lookAt target lerp
    this.controls.target.lerp(this.targetLookAt, lerpFactor);

    // Smooth FOV update if changed
    if (Math.abs(this.camera.fov - this.targetFov) > 0.1) {
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, this.targetFov, lerpFactor);
      this.camera.updateProjectionMatrix();
    }

    this.controls.update();
  }
}
