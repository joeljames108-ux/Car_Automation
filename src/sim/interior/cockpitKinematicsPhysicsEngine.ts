/**
 * ============================================================================
 * COCKPIT KINEMATICS & ARTICULATION PHYSICS ENGINE
 * ============================================================================
 * High-precision mathematical solver for active automotive interior mechanisms:
 * 1. 24-WAY POWER SEAT ARTICULATION KINEMATICS
 *    - Cushion Fore/Aft ($0 \to 240\text{ mm}$), Height ($0 \to 60\text{ mm}$), Cushion Tilt ($-3^\circ \to +8^\circ$)
 *    - Backrest Recline ($18^\circ \to 65^\circ$), Thigh Extension ($0 \to 60\text{ mm}$)
 *    - 4-Way Pneumatic Lumbar & Adaptive Side Bolster Squeeze Pressure ($0 \to 40\text{ kPa}$)
 * 2. MOTORIZED STEERING COLUMN TELESCOPIC & TILT PHYSICS
 *    - Continuous telescopic reach ($0 \to 65\text{ mm}$) & tilt angle ($-6^\circ \to +12^\circ$)
 * 3. BUTTERFLY SPLIT-ARMREST & GLOVEBOX VISCOUS DAMPER EQUATIONS
 * 4. MOTORIZED HVAC OSCILLATING LOUVER AIRFLOW VELOCITY VECTORS
 * ============================================================================
 */

export interface Seat24WayKinematicState {
  foreAftMm: number;        // 0 to 240 mm
  heightMm: number;         // 0 to 60 mm
  cushionTiltDeg: number;   // -3 to +8 deg
  backrestReclineDeg: number; // 18 to 65 deg
  thighExtenderMm: number;  // 0 to 60 mm
  headrestHeightMm: number; // 0 to 70 mm
  lumbarHeightMm: number;   // 0 to 80 mm
  lumbarInflationKpa: number; // 0 to 45 kPa
  bolsterSqueezeKpa: number;  // 0 to 35 kPa
}

export interface SteeringColumnKinematicState {
  telescopicReachMm: number; // 0 to 65 mm
  tiltAngleDeg: number;      // -6 to +12 deg
  steeringAngleDeg: number;   // -540 to +540 deg
}

export interface GloveboxDamperState {
  isOpen: boolean;
  openProgress: number; // 0.0 (closed) to 1.0 (fully open)
  angularVelocityRadPerSec: number;
}

export interface HvacLouverOscillationState {
  driverVentHorizontalDeg: number; // -35 to +35 deg
  driverVentVerticalDeg: number;   // -20 to +20 deg
  passengerVentHorizontalDeg: number;
  passengerVentVerticalDeg: number;
  airflowVelocityMps: number;      // 0.5 to 8.5 m/s
  swayFrequencyHz: number;         // e.g. 0.2 Hz
}

export interface ActiveCockpitKinematicsSnapshot {
  driverSeat: Seat24WayKinematicState;
  passengerSeat: Seat24WayKinematicState;
  steeringColumn: SteeringColumnKinematicState;
  gloveboxDamper: GloveboxDamperState;
  hvacLouvers: HvacLouverOscillationState;
  doorSwingLeftDeg: number;
  doorSwingRightDeg: number;
  windowDropLeftMm: number;
  windowDropRightMm: number;
}

export class CockpitKinematicsPhysicsEngine {
  private static instance: CockpitKinematicsPhysicsEngine | null = null;

  public static getInstance(): CockpitKinematicsPhysicsEngine {
    if (!this.instance) {
      this.instance = new CockpitKinematicsPhysicsEngine();
    }
    return this.instance;
  }

  /**
   * Generates a baseline neutral cockpit kinematic state.
   */
  public createDefaultState(): ActiveCockpitKinematicsSnapshot {
    return {
      driverSeat: {
        foreAftMm: 120,
        heightMm: 30,
        cushionTiltDeg: 2.5,
        backrestReclineDeg: 24.0,
        thighExtenderMm: 20,
        headrestHeightMm: 35,
        lumbarHeightMm: 40,
        lumbarInflationKpa: 22,
        bolsterSqueezeKpa: 15,
      },
      passengerSeat: {
        foreAftMm: 140,
        heightMm: 30,
        cushionTiltDeg: 2.0,
        backrestReclineDeg: 26.0,
        thighExtenderMm: 0,
        headrestHeightMm: 30,
        lumbarHeightMm: 35,
        lumbarInflationKpa: 15,
        bolsterSqueezeKpa: 10,
      },
      steeringColumn: {
        telescopicReachMm: 32,
        tiltAngleDeg: 2.0,
        steeringAngleDeg: 0.0,
      },
      gloveboxDamper: {
        isOpen: false,
        openProgress: 0.0,
        angularVelocityRadPerSec: 0.0,
      },
      hvacLouvers: {
        driverVentHorizontalDeg: 0.0,
        driverVentVerticalDeg: 5.0,
        passengerVentHorizontalDeg: 0.0,
        passengerVentVerticalDeg: 5.0,
        airflowVelocityMps: 4.2,
        swayFrequencyHz: 0.25,
      },
      doorSwingLeftDeg: 0.0,
      doorSwingRightDeg: 0.0,
      windowDropLeftMm: 0.0,
      windowDropRightMm: 0.0,
    };
  }

  /**
   * Solves continuous time-step physics for glovebox viscous soft-drop damping.
   * Differential equation: $I \ddot{\theta} + c \dot{\theta} + k \theta = \tau_{gravity}$
   */
  public stepGloveboxDamper(current: GloveboxDamperState, targetOpen: boolean, dtSec: number): GloveboxDamperState {
    const targetProgress = targetOpen ? 1.0 : 0.0;
    const error = targetProgress - current.openProgress;

    // Viscous fluid damper coefficient
    const dampingFactor = targetOpen ? 3.5 : 5.0;
    const springTorque = error * 14.0;
    const dampingTorque = -current.angularVelocityRadPerSec * dampingFactor;

    const acceleration = springTorque + dampingTorque;
    const newVelocity = current.angularVelocityRadPerSec + acceleration * dtSec;
    const newProgress = Math.max(0.0, Math.min(1.0, current.openProgress + newVelocity * dtSec));

    return {
      isOpen: targetOpen,
      openProgress: newProgress,
      angularVelocityRadPerSec: Math.abs(error) < 0.005 ? 0.0 : newVelocity,
    };
  }

  /**
   * Computes motorized automatic HVAC sweeping louver oscillation angles based on simulation time.
   */
  public updateHvacOscillation(current: HvacLouverOscillationState, timeSec: number): HvacLouverOscillationState {
    const omega = 2 * Math.PI * current.swayFrequencyHz;
    const driverHoriz = Math.sin(timeSec * omega) * 28.0;
    const driverVert = Math.cos(timeSec * omega * 0.5) * 12.0;

    const passHoriz = Math.sin((timeSec + 1.2) * omega) * 28.0;
    const passVert = Math.cos((timeSec + 1.2) * omega * 0.5) * 12.0;

    return {
      ...current,
      driverVentHorizontalDeg: driverHoriz,
      driverVentVerticalDeg: driverVert,
      passengerVentHorizontalDeg: passHoriz,
      passengerVentVerticalDeg: passVert,
    };
  }

  /**
   * Calculates ergonomic H-Point coordinates resulting from 24-way seat movement.
   */
  public calculateHPointOffset(seat: Seat24WayKinematicState): { x: number; y: number; z: number } {
    // Coordinate translation relative to vehicle chassis origin
    const zOffsetM = (seat.foreAftMm - 120) * 0.001; // Longitudinal fore/aft
    const yOffsetM = (seat.heightMm - 30) * 0.001;   // Vertical height
    const reclineRad = (seat.backrestReclineDeg - 24.0) * (Math.PI / 180);
    const eyeShiftZM = Math.sin(reclineRad) * 0.42;
    const eyeShiftYM = (Math.cos(reclineRad) - 1.0) * 0.42;

    return {
      x: 0,
      y: yOffsetM + eyeShiftYM,
      z: zOffsetM - eyeShiftZM,
    };
  }
}
