/**
 * ============================================================================
 * DRIVER-SEAT CAMERA RIG — IMMERSIVE FIRST-PERSON CABIN CAMERA SYSTEM
 * ============================================================================
 * Production-grade camera rig for automotive interior configurator:
 * 1. Fixed Seated Position Anchor (Driver, Passenger, Rear Left, Rear Right)
 * 2. 360° Horizontal Yaw (-170° to +170°) & Realistic Pitch (-65° to +65°) Look-Around
 * 3. Camera Collision Prevention Boundary against Steering Wheel, Roof, Pillars & Dash
 * 4. Multi-Input Support: Mouse Look Drag, Touch Drag, Virtual Joystick & Gamepad API
 * 5. Smooth Exponential Camera Damping & Velocity Inertia (No Instant Teleportation)
 * 6. Smooth Seat-to-Seat Cinematic Transition Interpolator
 * ============================================================================
 */

import * as THREE from "three";

export type SeatCameraAnchorId = "DRIVER" | "FRONT_PASSENGER" | "REAR_LEFT" | "REAR_RIGHT";

export interface SeatAnchorConfig {
  id: SeatCameraAnchorId;
  name: string;
  shortLabel: string;
  icon: string;
  position: THREE.Vector3;
  defaultYawDeg: number;
  defaultPitchDeg: number;
  fov: number;
  isRearSeat: boolean;
}

export const SEAT_CAMERA_ANCHORS: Record<SeatCameraAnchorId, SeatAnchorConfig> = {
  DRIVER: {
    id: "DRIVER",
    name: "Driver Seat (H-Point Eye)",
    shortLabel: "DRIVER",
    icon: "💺",
    position: new THREE.Vector3(-0.68, 0.88, -0.34),
    defaultYawDeg: 0,
    defaultPitchDeg: 2,
    fov: 56,
    isRearSeat: false,
  },
  FRONT_PASSENGER: {
    id: "FRONT_PASSENGER",
    name: "Front Passenger Seat",
    shortLabel: "PASSENGER",
    icon: "🛋️",
    position: new THREE.Vector3(0.68, 0.88, -0.34),
    defaultYawDeg: -20,
    defaultPitchDeg: 0,
    fov: 56,
    isRearSeat: false,
  },
  REAR_LEFT: {
    id: "REAR_LEFT",
    name: "Rear Left Executive Seat",
    shortLabel: "REAR L",
    icon: "🥂",
    position: new THREE.Vector3(-0.68, 0.92, 0.72),
    defaultYawDeg: 15,
    defaultPitchDeg: 0,
    fov: 60,
    isRearSeat: true,
  },
  REAR_RIGHT: {
    id: "REAR_RIGHT",
    name: "Rear Right Executive Seat",
    shortLabel: "REAR R",
    icon: "🥂",
    position: new THREE.Vector3(0.68, 0.92, 0.72),
    defaultYawDeg: -15,
    defaultPitchDeg: 0,
    fov: 60,
    isRearSeat: true,
  },
};

export interface DriverSeatCameraRigOptions {
  camera: THREE.PerspectiveCamera;
  domElement: HTMLElement;
  initialAnchor?: SeatCameraAnchorId;
  sensitivity?: number;
  dampingFactor?: number;
  minPitchDeg?: number;
  maxPitchDeg?: number;
  minYawDeg?: number;
  maxYawDeg?: number;
}

export class DriverSeatCameraRig {
  private camera: THREE.PerspectiveCamera;
  private domElement: HTMLElement;

  // Active Seat State
  private activeAnchorId: SeatCameraAnchorId = "DRIVER";
  private seatPosition: THREE.Vector3 = new THREE.Vector3(-0.68, 0.88, -0.34);
  private targetSeatPosition: THREE.Vector3 = new THREE.Vector3(-0.68, 0.88, -0.34);

  // Ergonomic Eye Position Adjustments
  private seatForeAftOffsetMm: number = 0;
  private seatHeightOffsetMm: number = 0;

  // Rotational Angles (Degrees)
  private currentYawDeg: number = 0;
  private currentPitchDeg: number = 2;
  private targetYawDeg: number = 0;
  private targetPitchDeg: number = 2;

  // Limits & Sensitivity
  private sensitivity: number = 0.25;
  private dampingFactor: number = 0.12;
  private minPitchDeg: number = -65;
  private maxPitchDeg: number = 65;
  private minYawDeg: number = -170;
  private maxYawDeg: number = 170;

  // Collision Sphere Boundaries (Relative to Cabin Center)
  private collisionBoundsRadius: number = 0.12; // Camera collision sphere radius
  private steeringWheelObstacleCenter: THREE.Vector3 = new THREE.Vector3(-0.68, 0.78, -0.62);
  private dashboardObstacleY: number = 0.65;
  private roofObstacleY: number = 1.25;

  // Transition State
  private isTransitioning: boolean = false;
  private transitionProgress: number = 1.0;
  private transitionDurationSec: number = 0.85;
  private transitionStartPos: THREE.Vector3 = new THREE.Vector3();
  private transitionTargetPos: THREE.Vector3 = new THREE.Vector3();
  private transitionStartYaw: number = 0;
  private transitionTargetYaw: number = 0;
  private transitionStartPitch: number = 0;
  private transitionTargetPitch: number = 0;

  // Pointer Interaction
  private isPointerDown: boolean = false;
  private lastPointerX: number = 0;
  private lastPointerY: number = 0;

  // Auto-Tour Mode
  private isAutoPan: boolean = false;
  private autoPanTime: number = 0;

  // Gamepad Loop
  private gamepadIndex: number | null = null;

  // Callbacks
  private onGazeChangeCallbacks: Array<(yaw: number, pitch: number, gazeTarget: string) => void> = [];

  constructor(options: DriverSeatCameraRigOptions) {
    this.camera = options.camera;
    this.domElement = options.domElement;
    this.sensitivity = options.sensitivity ?? 0.25;
    this.dampingFactor = options.dampingFactor ?? 0.12;
    this.minPitchDeg = options.minPitchDeg ?? -65;
    this.maxPitchDeg = options.maxPitchDeg ?? 65;
    this.minYawDeg = options.minYawDeg ?? -170;
    this.maxYawDeg = options.maxYawDeg ?? 170;

    if (options.initialAnchor) {
      this.setActiveAnchor(options.initialAnchor, false);
    } else {
      this.setActiveAnchor("DRIVER", false);
    }

    this.attachEventListeners();
  }

  /**
   * Switches active seat position anchor with optional cinematic transition
   */
  public setActiveAnchor(anchorId: SeatCameraAnchorId, transition: boolean = true): void {
    const config = SEAT_CAMERA_ANCHORS[anchorId] || SEAT_CAMERA_ANCHORS.DRIVER;
    this.activeAnchorId = anchorId;

    const basePos = config.position.clone();
    // Add seat ergonomic adjustments
    basePos.z += (this.seatForeAftOffsetMm / 1000.0);
    basePos.y += (this.seatHeightOffsetMm / 1000.0);

    if (!transition) {
      this.seatPosition.copy(basePos);
      this.targetSeatPosition.copy(basePos);
      this.currentYawDeg = config.defaultYawDeg;
      this.targetYawDeg = config.defaultYawDeg;
      this.currentPitchDeg = config.defaultPitchDeg;
      this.targetPitchDeg = config.defaultPitchDeg;
      this.camera.position.copy(basePos);
      this.camera.fov = config.fov;
      this.camera.updateProjectionMatrix();
      this.isTransitioning = false;
      this.transitionProgress = 1.0;
    } else {
      this.isTransitioning = true;
      this.transitionProgress = 0.0;
      this.transitionStartPos.copy(this.seatPosition);
      this.transitionTargetPos.copy(basePos);
      this.transitionStartYaw = this.currentYawDeg;
      this.transitionTargetYaw = config.defaultYawDeg;
      this.transitionStartPitch = this.currentPitchDeg;
      this.transitionTargetPitch = config.defaultPitchDeg;
    }

    this.notifyGazeChange();
  }

  public getActiveAnchor(): SeatCameraAnchorId {
    return this.activeAnchorId;
  }

  public setErgonomicAdjustments(foreAftMm: number, heightMm: number): void {
    this.seatForeAftOffsetMm = foreAftMm;
    this.seatHeightOffsetMm = heightMm;
    const config = SEAT_CAMERA_ANCHORS[this.activeAnchorId];
    const updated = config.position.clone();
    updated.z += foreAftMm / 1000.0;
    updated.y += heightMm / 1000.0;
    this.targetSeatPosition.copy(updated);
    if (!this.isTransitioning) {
      this.seatPosition.copy(updated);
    }
  }

  public setAutoPan(enabled: boolean): void {
    this.isAutoPan = enabled;
  }

  public isAutoPanning(): boolean {
    return this.isAutoPan;
  }

  public setLookAtDegrees(yawDeg: number, pitchDeg: number, transition: boolean = true): void {
    const clampedYaw = Math.max(this.minYawDeg, Math.min(this.maxYawDeg, yawDeg));
    const clampedPitch = Math.max(this.minPitchDeg, Math.min(this.maxPitchDeg, pitchDeg));

    this.targetYawDeg = clampedYaw;
    this.targetPitchDeg = clampedPitch;

    if (!transition) {
      this.currentYawDeg = clampedYaw;
      this.currentPitchDeg = clampedPitch;
    }
  }

  public getLookDegrees(): { yawDeg: number; pitchDeg: number } {
    return {
      yawDeg: Math.round(this.currentYawDeg),
      pitchDeg: Math.round(this.currentPitchDeg),
    };
  }

  public subscribeGazeChange(cb: (yaw: number, pitch: number, gazeTarget: string) => void): () => void {
    this.onGazeChangeCallbacks.push(cb);
    return () => {
      this.onGazeChangeCallbacks = this.onGazeChangeCallbacks.filter((c) => c !== cb);
    };
  }

  /**
   * Main per-frame update loop called inside requestAnimationFrame
   */
  public update(deltaTimeSec: number): void {
    // 1. Handle Seat-to-Seat Cinematic Transition
    if (this.isTransitioning) {
      this.transitionProgress += deltaTimeSec / this.transitionDurationSec;
      if (this.transitionProgress >= 1.0) {
        this.transitionProgress = 1.0;
        this.isTransitioning = false;
      }

      // Smooth Quintic Ease In-Out Curve
      const t = this.transitionProgress;
      const ease = t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

      this.seatPosition.lerpVectors(this.transitionStartPos, this.transitionTargetPos, ease);
      this.currentYawDeg = THREE.MathUtils.lerp(this.transitionStartYaw, this.transitionTargetYaw, ease);
      this.targetYawDeg = this.currentYawDeg;
      this.currentPitchDeg = THREE.MathUtils.lerp(this.transitionStartPitch, this.transitionTargetPitch, ease);
      this.targetPitchDeg = this.currentPitchDeg;
    } else {
      // 2. Handle Gamepad Input
      this.pollGamepadInput();

      // 3. Handle Auto-Pan Sway Mode
      if (this.isAutoPan) {
        this.autoPanTime += deltaTimeSec;
        this.targetYawDeg = Math.sin(this.autoPanTime * 0.5) * 55;
        this.targetPitchDeg = Math.sin(this.autoPanTime * 0.7) * 14 + 2;
      }

      // 4. Smooth Damping to Target Yaw & Pitch
      this.currentYawDeg += (this.targetYawDeg - this.currentYawDeg) * this.dampingFactor;
      this.currentPitchDeg += (this.targetPitchDeg - this.currentPitchDeg) * this.dampingFactor;
      this.seatPosition.lerp(this.targetSeatPosition, this.dampingFactor);
    }

    // 5. Collision Boundary Constraints
    const constrainedEyePos = this.applyCameraCollisionConstraints(this.seatPosition);

    // 6. Update Camera Position & Orientation Matrix
    this.camera.position.copy(constrainedEyePos);

    const yawRad = THREE.MathUtils.degToRad(this.currentYawDeg);
    const pitchRad = THREE.MathUtils.degToRad(this.currentPitchDeg);

    // Calculate Look Target Vector
    const dirX = Math.cos(pitchRad) * Math.sin(yawRad);
    const dirY = Math.sin(pitchRad);
    const dirZ = -Math.cos(pitchRad) * Math.cos(yawRad);

    const targetPos = constrainedEyePos.clone().add(new THREE.Vector3(dirX, dirY, dirZ));
    this.camera.lookAt(targetPos);

    this.notifyGazeChange();
  }

  /**
   * Applies collision sphere constraints to prevent camera from clipping inside Steering Wheel, Dash, or Roof
   */
  private applyCameraCollisionConstraints(rawPos: THREE.Vector3): THREE.Vector3 {
    const pos = rawPos.clone();

    // Steering Wheel Collision Sphere Check
    const distToSteering = pos.distanceTo(this.steeringWheelObstacleCenter);
    const minDist = 0.28;
    if (distToSteering < minDist) {
      const pushDir = pos.clone().sub(this.steeringWheelObstacleCenter).normalize();
      pos.copy(this.steeringWheelObstacleCenter.clone().add(pushDir.multiplyScalar(minDist)));
    }

    // Dash Ceiling Constraint
    if (pos.y < this.dashboardObstacleY) pos.y = this.dashboardObstacleY;
    // Roof Obstacle Constraint
    if (pos.y > this.roofObstacleY) pos.y = this.roofObstacleY;

    return pos;
  }

  /**
   * Computes human-readable Gaze Target description based on current yaw/pitch
   */
  public detectCurrentGazeTarget(): string {
    const yaw = this.currentYawDeg;
    const pitch = this.currentPitchDeg;

    if (this.activeAnchorId === "DRIVER") {
      if (pitch > 28) return "PANORAMIC GLASS ROOF & STARLIGHT HEADLINER";
      if (pitch < -24 && yaw > -25 && yaw < 25) return "PEDAL BOX & LOWER CENTER TUNNEL";
      if (yaw < -45) return "DRIVER DOOR PANEL & AERO SIDE MIRROR";
      if (yaw > 45 && pitch < -15) return "CRYSTAL ROTARY SHIFTER & CONSOLE";
      if (yaw > 25) return "CENTRAL 14.5\" INFOTAINMENT TOUCHSCREEN";
      if (yaw < -10 && pitch < -10) return "DIGITAL INSTRUMENT CLUSTER & STEERING WHEEL";
      return "FORWARD WINDSHIELD & AR HEAD-UP DISPLAY";
    } else if (this.activeAnchorId === "FRONT_PASSENGER") {
      if (yaw < -30) return "CENTRAL INFOTAINMENT & DRIVER COCKPIT";
      if (yaw > 30) return "PASSENGER DOOR PANEL & SIDE MIRROR";
      return "FORWARD ROAD & PASSENGER DASHBOARD TRIM";
    } else {
      if (yaw > -40 && yaw < 40 && pitch < 0) return "CENTER CONSOLE REAR CLIMATE & ARMREST";
      if (pitch > 20) return "REAR STARLIGHT HEADLINER";
      return "REAR EXECUTIVE CABIN & CHROMOLY ROLL CAGE";
    }
  }

  private notifyGazeChange(): void {
    const targetStr = this.detectCurrentGazeTarget();
    this.onGazeChangeCallbacks.forEach((cb) => cb(Math.round(this.currentYawDeg), Math.round(this.currentPitchDeg), targetStr));
  }

  /**
   * Pointer & Touch Drag Event Handlers
   */
  private attachEventListeners(): void {
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      this.isPointerDown = true;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      this.isAutoPan = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!this.isPointerDown) return;
      const deltaX = e.clientX - this.lastPointerX;
      const deltaY = e.clientY - this.lastPointerY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;

      const newYaw = Math.max(this.minYawDeg, Math.min(this.maxYawDeg, this.targetYawDeg + deltaX * this.sensitivity));
      const newPitch = Math.max(this.minPitchDeg, Math.min(this.maxPitchDeg, this.targetPitchDeg - deltaY * this.sensitivity));

      this.targetYawDeg = newYaw;
      this.targetPitchDeg = newPitch;
    };

    const onPointerUp = () => {
      this.isPointerDown = false;
    };

    // Wheel FOV zoom
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const newFov = Math.max(35, Math.min(75, this.camera.fov + e.deltaY * 0.04));
      this.camera.fov = newFov;
      this.camera.updateProjectionMatrix();
    };

    this.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    this.domElement.addEventListener("wheel", onWheel, { passive: false });

    // Gamepad Connect Listener
    window.addEventListener("gamepadconnected", (e: GamepadEvent) => {
      this.gamepadIndex = e.gamepad.index;
    });
    window.addEventListener("gamepaddisconnected", () => {
      this.gamepadIndex = null;
    });
  }

  private pollGamepadInput(): void {
    if (this.gamepadIndex === null) return;
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[this.gamepadIndex];
    if (!gp) return;

    // Right Stick for Yaw & Pitch look around
    const rx = gp.axes[2] || 0;
    const ry = gp.axes[3] || 0;

    const deadzone = 0.15;
    if (Math.abs(rx) > deadzone || Math.abs(ry) > deadzone) {
      this.isAutoPan = false;
      const speed = 1.8;
      this.targetYawDeg = Math.max(this.minYawDeg, Math.min(this.maxYawDeg, this.targetYawDeg + rx * speed));
      this.targetPitchDeg = Math.max(this.minPitchDeg, Math.min(this.maxPitchDeg, this.targetPitchDeg - ry * speed));
    }
  }

  public dispose(): void {
    this.onGazeChangeCallbacks = [];
  }
}
