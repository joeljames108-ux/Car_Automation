/**
 * ============================================================================
 * MODULAR ENGINE STUDIO — KINEMATIC SLIDER-CRANK & 4-STROKE ANIMATOR
 * ============================================================================
 * Solves exact mathematical slider-crank kinematics synchronizing:
 * - Crankshaft angular rotation \theta(t)
 * - Piston vertical reciprocation y(\theta)
 * - Connecting rod angular swing \beta(\theta)
 * - 4-Stroke half-speed camshaft rotation \phi(\theta)
 * - Valve open/close lift curves h(\theta)
 * - 4-Stroke combustion phase color glow (Intake, Compression, Power, Exhaust)
 * ============================================================================
 */

import * as THREE from "three";
import { MasterEngineState } from "../../sim/engine/masterEngineTypes";

export type FourStrokePhase = "intake" | "compression" | "power" | "exhaust";

export interface CylinderKinematicState {
  cylinderIndex: number;
  crankAngleDeg: number;       // 0 to 720 deg (4-stroke cycle)
  pistonDisplacementMm: number;// 0 at BDC, strokeMm at TDC
  pistonNormalized01: number;  // 0.0 at BDC, 1.0 at TDC
  conrodAngleDeg: number;      // lateral swing angle
  intakeValveLiftMm: number;
  exhaustValveLiftMm: number;
  cyclePhase: FourStrokePhase;
  combustionGlowColor: THREE.Color;
  combustionIntensity: number; // 0.0 to 1.0
}

export class EngineKinematicsAnimator {
  private currentCrankAngleRad: number = 0;
  private simRpm: number = 1800;
  private isRunning: boolean = true;
  private is4StrokeCombustionGlowEnabled: boolean = true;

  // Crank radius r = stroke / 2, Conrod length l
  private crankRadiusMm: number = 43; // default for 86mm stroke
  private conrodLengthMm: number = 148;
  private strokeMm: number = 86;
  private cylinderCount: number = 8;
  private firingOffsetsDeg: number[] = [];

  constructor(state?: MasterEngineState) {
    if (state) {
      this.updateParameters(state);
    }
  }

  public updateParameters(state: MasterEngineState): void {
    this.strokeMm = state.block.strokeMm;
    this.crankRadiusMm = this.strokeMm / 2;
    this.conrodLengthMm = state.connectingRods.rodLengthMm;
    this.cylinderCount = state.architecture.cylinderCount;

    // Distribute 4-stroke 720 degree firing intervals
    const intervalDeg = 720 / this.cylinderCount;
    this.firingOffsetsDeg = [];
    for (let i = 0; i < this.cylinderCount; i++) {
      this.firingOffsetsDeg.push((i * intervalDeg) % 720);
    }
  }

  public setRpm(rpm: number): void {
    this.simRpm = Math.max(0, Math.min(12500, rpm));
  }

  public getRpm(): number {
    return this.simRpm;
  }

  public setRunning(running: boolean): void {
    this.isRunning = running;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public setCombustionGlowEnabled(enabled: boolean): void {
    this.is4StrokeCombustionGlowEnabled = enabled;
  }

  public getCombustionGlowEnabled(): boolean {
    return this.is4StrokeCombustionGlowEnabled;
  }

  /**
   * Advances the engine crankshaft rotation by deltaTime seconds.
   */
  public update(deltaSeconds: number): void {
    if (!this.isRunning || this.simRpm <= 0) return;
    // Omega = RPM * 2 * PI / 60 (rad/s)
    const omega = (this.simRpm * 2 * Math.PI) / 60;
    this.currentCrankAngleRad = (this.currentCrankAngleRad + omega * deltaSeconds) % (4 * Math.PI); // 720 deg in radians
  }

  public getCrankAngleDeg(): number {
    return THREE.MathUtils.radToDeg(this.currentCrankAngleRad) % 720;
  }

  private static COLOR_INTAKE = new THREE.Color(0x00e5ff);
  private static COLOR_COMPRESSION = new THREE.Color(0xfbbf24);
  private static COLOR_POWER = new THREE.Color(0xff3d00);
  private static COLOR_EXHAUST = new THREE.Color(0xd97706);
  private static COLOR_OFF = new THREE.Color(0x000000);

  /**
   * Calculates the exact kinematic and combustion state for a given cylinder.
   */
  public solveCylinder(cylinderIndex: number): CylinderKinematicState {
    const offsetDeg = this.firingOffsetsDeg[cylinderIndex % this.firingOffsetsDeg.length] || 0;
    const totalAngleDeg = (this.getCrankAngleDeg() + offsetDeg) % 720;
    const thetaRad = THREE.MathUtils.degToRad(totalAngleDeg);

    const r = this.crankRadiusMm;
    const l = this.conrodLengthMm;

    // Exact Slider-Crank equation:
    // y(\theta) = r * cos(\theta) + sqrt(l^2 - r^2 * sin^2(\theta))
    // Height above crankshaft centerline:
    const heightFromCrankMm = r * Math.cos(thetaRad) + Math.sqrt(Math.max(0, Math.pow(l, 2) - Math.pow(r * Math.sin(thetaRad), 2)));
    const minHeightMm = l - r; // at BDC (\theta = 180)
    const maxHeightMm = l + r; // at TDC (\theta = 0)

    const pistonDisplacementMm = heightFromCrankMm - minHeightMm;
    const pistonNormalized01 = Math.max(0, Math.min(1, (heightFromCrankMm - minHeightMm) / (maxHeightMm - minHeightMm)));

    // Conrod angular tilt: \beta = arcsin((r * sin\theta) / l)
    const conrodAngleRad = Math.asin(Math.max(-1, Math.min(1, (r * Math.sin(thetaRad)) / l)));
    const conrodAngleDeg = THREE.MathUtils.radToDeg(conrodAngleRad);

    let cyclePhase: FourStrokePhase = "intake";
    let intakeLift = 0;
    let exhaustLift = 0;
    let glowColor = EngineKinematicsAnimator.COLOR_OFF;
    let intensity = 0.0;

    if (totalAngleDeg >= 0 && totalAngleDeg < 180) {
      cyclePhase = "intake";
      const phaseNorm = totalAngleDeg / 180;
      intakeLift = Math.sin(phaseNorm * Math.PI) * 12.5; // mm
      glowColor = EngineKinematicsAnimator.COLOR_INTAKE; // Cyan incoming air/fuel charge
      intensity = Math.sin(phaseNorm * Math.PI) * 0.65;
    } else if (totalAngleDeg >= 180 && totalAngleDeg < 360) {
      cyclePhase = "compression";
      const phaseNorm = (totalAngleDeg - 180) / 180;
      glowColor = EngineKinematicsAnimator.COLOR_COMPRESSION; // Warm yellow compression
      intensity = Math.pow(phaseNorm, 2) * 0.8;
    } else if (totalAngleDeg >= 360 && totalAngleDeg < 540) {
      cyclePhase = "power";
      const phaseNorm = (totalAngleDeg - 360) / 180;
      intensity = Math.exp(-phaseNorm * 3.2);
      glowColor = EngineKinematicsAnimator.COLOR_POWER; // Fierce flame red-orange
    } else {
      cyclePhase = "exhaust";
      const phaseNorm = (totalAngleDeg - 540) / 180;
      exhaustLift = Math.sin(phaseNorm * Math.PI) * 12.0; // mm
      glowColor = EngineKinematicsAnimator.COLOR_EXHAUST; // Amber burning exhaust gases
      intensity = Math.sin(phaseNorm * Math.PI) * 0.55;
    }

    return {
      cylinderIndex,
      crankAngleDeg: totalAngleDeg,
      pistonDisplacementMm,
      pistonNormalized01,
      conrodAngleDeg,
      intakeValveLiftMm: intakeLift,
      exhaustValveLiftMm: exhaustLift,
      cyclePhase,
      combustionGlowColor: glowColor,
      combustionIntensity: this.is4StrokeCombustionGlowEnabled ? intensity : 0,
    };
  }
}
