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

export const DASHBOARD_CAMERA_POSES: Record<CameraPose, CameraTargetDef> = {
  studio_sport: {
    pos: new THREE.Vector3(-0.08, 1.00, 0.82),
    target: new THREE.Vector3(0.05, 0.58, -0.10),
    fov: 64,
  },
  dashboard_center: {
    pos: new THREE.Vector3(0.0, 0.92, 0.92),
    target: new THREE.Vector3(0.0, 0.60, -0.30),
    fov: 64,
  },
  driver: {
    pos: new THREE.Vector3(-0.38, 0.88, 0.72),
    target: new THREE.Vector3(-0.38, 0.68, -0.25),
    fov: 56,
  },
  driver_close: {
    pos: new THREE.Vector3(-0.38, 0.80, 0.54),
    target: new THREE.Vector3(-0.38, 0.66, 0.05),
    fov: 48,
  },
  steering: {
    pos: new THREE.Vector3(-0.38, 0.80, 0.64),
    target: new THREE.Vector3(-0.38, 0.66, 0.246),
    fov: 48,
  },
  cluster: {
    pos: new THREE.Vector3(-0.38, 0.81, 0.42),
    target: new THREE.Vector3(-0.38, 0.735, 0.078),
    fov: 38,
  },
  infotainment: {
    pos: new THREE.Vector3(0.01, 0.80, 0.40),
    target: new THREE.Vector3(0.01, 0.60, 0.08),
    fov: 46,
  },
  console: {
    pos: new THREE.Vector3(-0.18, 0.78, 0.46),
    target: new THREE.Vector3(0.0, 0.52, 0.14),
    fov: 46,
  },
  seats: {
    pos: new THREE.Vector3(0.0, 0.96, -0.10),
    target: new THREE.Vector3(-0.38, 0.65, 0.65),
    fov: 54,
  },
  doors: {
    pos: new THREE.Vector3(-0.05, 0.76, 0.48),
    target: new THREE.Vector3(-0.74, 0.52, 0.30),
    fov: 52,
  },
  vents: {
    pos: new THREE.Vector3(-0.20, 0.75, 0.45),
    target: new THREE.Vector3(0.0, 0.64, 0.08),
    fov: 42,
  },
  passenger: {
    pos: new THREE.Vector3(0.38, 0.88, 0.72),
    target: new THREE.Vector3(-0.20, 0.64, 0.15),
    fov: 56,
  },
  full_cockpit: {
    pos: new THREE.Vector3(0.0, 1.05, 0.95),
    target: new THREE.Vector3(0.0, 0.58, 0.10),
    fov: 64,
  },
  orbit_360: {
    pos: new THREE.Vector3(-0.55, 0.90, 0.70),
    target: new THREE.Vector3(-0.15, 0.60, 0.15),
    fov: 56,
  },
  exploded: {
    pos: new THREE.Vector3(-0.95, 1.10, 0.80),
    target: new THREE.Vector3(-0.10, 0.55, 0.10),
    fov: 58,
  },
  // ── Rear Cabin Camera Poses ──
  rear_cabin: {
    pos: new THREE.Vector3(0.0, 0.95, -0.40),
    target: new THREE.Vector3(0.0, 0.62, -1.35),
    fov: 62,
  },
  rear_row2: {
    pos: new THREE.Vector3(-0.30, 0.88, -0.60),
    target: new THREE.Vector3(0.0, 0.58, -1.35),
    fov: 52,
  },
  rear_row3: {
    pos: new THREE.Vector3(0.0, 0.92, -1.40),
    target: new THREE.Vector3(0.0, 0.60, -2.18),
    fov: 50,
  },
  summary: {
    pos: new THREE.Vector3(-0.15, 1.15, 1.10),
    target: new THREE.Vector3(0.0, 0.60, 0.15),
    fov: 64,
  },
};

/**
 * Dedicated ergonomic camera target definitions calibrated specifically for
 * the Transit Bus cabin architecture (wide flat dash, air-ride suspension seat,
 * curbside bi-fold entrance, fare collection box, and rear passenger rows).
 */
export const BUS_CABIN_CAMERA_POSES: Partial<Record<CameraPose, CameraTargetDef>> = {
  studio_sport: {
    pos: new THREE.Vector3(0.18, 1.10, 1.05),
    target: new THREE.Vector3(-0.18, 0.65, 0.12),
    fov: 60,
  },
  dashboard_center: {
    pos: new THREE.Vector3(0.18, 0.98, 0.85),
    target: new THREE.Vector3(-0.18, 0.66, 0.10),
    fov: 60,
  },
  driver: {
    pos: new THREE.Vector3(-0.38, 0.92, 0.65),
    target: new THREE.Vector3(-0.38, 0.66, 0.05),
    fov: 54,
  },
  driver_close: {
    pos: new THREE.Vector3(-0.38, 0.85, 0.50),
    target: new THREE.Vector3(-0.38, 0.68, 0.08),
    fov: 48,
  },
  steering: {
    pos: new THREE.Vector3(-0.38, 0.90, 0.62),
    target: new THREE.Vector3(-0.38, 0.66, 0.24),
    fov: 54,
  },
  cluster: {
    pos: new THREE.Vector3(-0.38, 0.78, 0.36),
    target: new THREE.Vector3(-0.38, 0.735, 0.075),
    fov: 38,
  },
  infotainment: {
    pos: new THREE.Vector3(-0.12, 0.78, 0.45),
    target: new THREE.Vector3(0.01, 0.61, 0.06),
    fov: 46,
  },
  console: {
    pos: new THREE.Vector3(-0.15, 0.88, 0.42),
    target: new THREE.Vector3(0.08, 0.58, 0.10),
    fov: 50,
  },
  seats: {
    pos: new THREE.Vector3(0.25, 0.98, 0.25),
    target: new THREE.Vector3(-0.38, 0.55, 0.48),
    fov: 52,
  },
  doors: {
    pos: new THREE.Vector3(-0.15, 0.98, 0.65),
    target: new THREE.Vector3(0.70, 0.72, 0.25),
    fov: 56,
  },
  rear_cabin: {
    pos: new THREE.Vector3(-0.05, 1.05, 0.20),
    target: new THREE.Vector3(0.00, 0.75, 1.80),
    fov: 64,
  },
  summary: {
    pos: new THREE.Vector3(0.10, 1.25, 1.15),
    target: new THREE.Vector3(-0.05, 0.68, 0.35),
    fov: 64,
  },
  full_cockpit: {
    pos: new THREE.Vector3(0.12, 1.18, 1.40),
    target: new THREE.Vector3(-0.10, 0.65, 0.15),
    fov: 65,
  },
  orbit_360: {
    pos: new THREE.Vector3(0.25, 1.10, 1.05),
    target: new THREE.Vector3(-0.15, 0.62, 0.10),
    fov: 58,
  },
  exploded: {
    pos: new THREE.Vector3(-0.85, 1.20, 0.90),
    target: new THREE.Vector3(0.0, 0.60, 0.20),
    fov: 60,
  },
};

export class DashboardCameraController {
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;

  private currentPose: CameraPose = "dashboard_center";
  private driverHeight: DriverHeight = "normal";
  private variant: string = "standard_cabin";

  // Target vectors for smooth lerping
  private targetPos: THREE.Vector3 = new THREE.Vector3(0.0, 0.92, 0.92);
  private targetLookAt: THREE.Vector3 = new THREE.Vector3(0.0, 0.60, -0.30);
  private targetFov: number = 64;

  constructor(camera: THREE.PerspectiveCamera, controls: OrbitControls) {
    this.camera = camera;
    this.controls = controls;
    this.configureControls();
    this.setPose("dashboard_center");
    // Immediately initialize camera and controls to default pose without initial lerp jump
    this.camera.position.copy(this.targetPos);
    this.controls.target.copy(this.targetLookAt);
    this.camera.fov = this.targetFov;
    this.camera.updateProjectionMatrix();
    this.controls.update();
  }

  private configureControls() {
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 0.20;
    this.controls.maxDistance = 2.40;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.15; // Don't dip beneath floor
  }

  public setVariant(variant: string) {
    this.variant = variant;
    this.setPose(this.currentPose);
  }

  public getPoseDef(pose: CameraPose): CameraTargetDef {
    if (this.variant === "transit_bus" && BUS_CABIN_CAMERA_POSES[pose]) {
      return BUS_CABIN_CAMERA_POSES[pose]!;
    }
    return DASHBOARD_CAMERA_POSES[pose] || DASHBOARD_CAMERA_POSES.dashboard_center;
  }

  public setPose(pose: CameraPose) {
    this.currentPose = pose;
    const def = this.getPoseDef(pose);

    const heightOffset = this.driverHeight === "low" ? -0.04 : this.driverHeight === "tall" ? 0.04 : 0.0;

    this.targetPos.copy(def.pos);
    if (pose === "studio_sport" || pose === "driver" || pose === "driver_close" || pose === "steering" || pose === "cluster" || pose === "passenger" || pose === "seats" || pose === "dashboard_center") {
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
