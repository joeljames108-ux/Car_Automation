/**
 * AUTO TYCOON CAMPUS HQ - CAMERA CONTROLLER & NAVIGATION (PHASE 38)
 * 
 * Provides smooth, animated camera transitions and framing across:
 * - 45° Isometric Campus Master Overview
 * - Focused orbit around selected building or plot
 * - Focused framing on specific campus zones (A, B, C, D)
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CampusZone } from "../../sim/campus/campusTypes";

export interface CameraViewPreset {
  target: THREE.Vector3;
  position: THREE.Vector3;
  description: string;
}

export const CAMPUS_VIEW_PRESETS: Record<CampusZone | "MASTER_OVERVIEW", CameraViewPreset> = {
  MASTER_OVERVIEW: {
    target: new THREE.Vector3(0, 0, 0),
    position: new THREE.Vector3(185, 185 * Math.SQRT2, 185),
    description: "45° Isometric Campus Master Diorama Overview",
  },
  ZONE_A: {
    target: new THREE.Vector3(-120, 0, -50),
    position: new THREE.Vector3(-120 + 80, 80 * Math.SQRT2, -50 + 80),
    description: "Zone A: Logistics & Production Complex",
  },
  ZONE_B: {
    target: new THREE.Vector3(-45, 0, -45),
    position: new THREE.Vector3(-45 + 80, 80 * Math.SQRT2, -45 + 80),
    description: "Zone B: Engineering & Validation Labs",
  },
  ZONE_C: {
    target: new THREE.Vector3(60, 0, 0),
    position: new THREE.Vector3(60 + 80, 80 * Math.SQRT2, 80),
    description: "Zone C: Core Styling & Corporate Plaza",
  },
  ZONE_D: {
    target: new THREE.Vector3(40, 0, 60),
    position: new THREE.Vector3(40 + 90, 90 * Math.SQRT2, 60 + 90),
    description: "Zone D: Special Operations & Track Perimeter",
  },
};

export class CampusCameraController {
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private isTransitioning: boolean = false;
  private animFrameId: number | null = null;

  constructor(camera: THREE.PerspectiveCamera, controls: OrbitControls) {
    this.camera = camera;
    this.controls = controls;
  }

  /**
   * Smoothly transitions the camera and orbit controls to focus on a 3D target coordinate
   */
  public flyTo(
    targetX: number,
    targetY: number,
    targetZ: number,
    distanceOffset: number = 65,
    onComplete?: () => void
  ): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    const startTarget = this.controls.target.clone();
    const endTarget = new THREE.Vector3(targetX, targetY, targetZ);

    const startPos = this.camera.position.clone();
    const endPos = new THREE.Vector3(
      targetX + distanceOffset,
      targetY + distanceOffset * Math.SQRT2,
      targetZ + distanceOffset
    );

    let progress = 0;
    this.isTransitioning = true;

    const animateTransition = () => {
      // Ease out cubic
      progress += 0.045;
      const t = Math.min(1, progress);
      const ease = 1 - Math.pow(1 - t, 3);

      this.controls.target.lerpVectors(startTarget, endTarget, ease);
      this.camera.position.lerpVectors(startPos, endPos, ease);
      this.controls.update();

      if (t < 1) {
        this.animFrameId = requestAnimationFrame(animateTransition);
      } else {
        this.controls.target.copy(endTarget);
        this.camera.position.copy(endPos);
        this.controls.update();
        this.isTransitioning = false;
        this.animFrameId = null;
        if (onComplete) onComplete();
      }
    };

    animateTransition();
  }

  /**
   * Transitions to predefined zone preset view
   */
  public flyToZone(zone: CampusZone | "MASTER_OVERVIEW"): void {
    const preset = CAMPUS_VIEW_PRESETS[zone];
    if (preset) {
      this.flyTo(preset.target.x, preset.target.y, preset.target.z, 75);
    }
  }

  /**
   * Reset to master 45° isometric diorama overview
   */
  public resetToOverview(): void {
    const preset = CAMPUS_VIEW_PRESETS.MASTER_OVERVIEW;
    this.flyTo(preset.target.x, preset.target.y, preset.target.z, 185);
  }

  public dispose(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
}
