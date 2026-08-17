// ============================================================================
// PHASE 10 — EXPLODED VIEW KINEMATICS & LINEAR DISPLACEMENT SOLVER
// ============================================================================
// Solves collision-free multi-stage exploded view vector trajectories,
// hierarchical component nesting, staggered timeline delays, and easing curves.
// ============================================================================

import * as THREE from 'three';
import { VehicleSubsystemStage } from '../types/vehicleConstructionTypes';

export interface ExplodedTrajectorySpec {
  componentId: string;
  subsystem: VehicleSubsystemStage;
  restPosition: THREE.Vector3;
  explodedDirection: THREE.Vector3; // Unit vector of displacement
  maxDisplacementMeters: number;
  staggerDelayRatio: number; // 0.0 to 0.5 timeline delay offset
  easingType: 'EASE_OUT_CUBIC' | 'EASE_OUT_EXPO' | 'EASE_IN_OUT_QUAD';
}

export class ExplodedViewKinematicsSolver {
  /**
   * Solves the animated 3D position of a component at a given progress [0.0, 1.0].
   */
  public static computeComponentDisplacement(
    spec: ExplodedTrajectorySpec,
    progressNormalized: number
  ): THREE.Vector3 {
    // 1. Calculate effective staggered progress
    const startT = spec.staggerDelayRatio;
    const endT = 1.0;
    let localT = (progressNormalized - startT) / (endT - startT);
    localT = Math.max(0.0, Math.min(1.0, localT));

    // 2. Apply Easing Curve
    const easedT = this.applyEasing(localT, spec.easingType);

    // 3. Compute 3D Translation
    const displacement = new THREE.Vector3()
      .copy(spec.explodedDirection)
      .multiplyScalar(spec.maxDisplacementMeters * easedT);

    return new THREE.Vector3().copy(spec.restPosition).add(displacement);
  }

  /**
   * Generates default non-colliding trajectory specifications for vehicle subsystems.
   */
  public static generateSubsystemTrajectory(
    componentId: string,
    subsystem: VehicleSubsystemStage,
    restPos: THREE.Vector3
  ): ExplodedTrajectorySpec {
    let dir = new THREE.Vector3(0, 1, 0);
    let maxDist = 0.8;
    let delay = 0.0;

    switch (subsystem) {
      case 'chassis_platform':
        // Chassis remains stationary at center as reference datum
        dir.set(0, 0, 0);
        maxDist = 0.0;
        delay = 0.0;
        break;

      case 'suspension':
        // Suspension extends slightly downward and outward laterally
        dir.set(restPos.x >= 0 ? 0.6 : -0.6, -0.4, 0).normalize();
        maxDist = 0.65;
        delay = 0.05;
        break;

      case 'wheels_brakes':
        // Wheels and brake rotors explode outwards laterally along X
        dir.set(restPos.x >= 0 ? 1 : -1, 0, 0).normalize();
        maxDist = 1.2;
        delay = 0.15;
        break;

      case 'powertrain_engine':
        // Engine block drops slightly down or lifts up depending on packaging
        dir.set(0, 0.7, 0.4).normalize();
        maxDist = 0.95;
        delay = 0.1;
        break;

      case 'transmission':
        // Gearbox slides aft down the transmission tunnel
        dir.set(0, -0.3, -0.9).normalize();
        maxDist = 0.85;
        delay = 0.12;
        break;

      case 'exterior_panels':
        // Outer body panels (hood, doors, fenders) explode upwards and outwards
        if (restPos.z > 0.5) {
          // Hood / Front bumper moves up and forward
          dir.set(0, 0.8, 0.6).normalize();
        } else if (restPos.z < -1.5) {
          // Trunk / Rear bumper moves up and rearward
          dir.set(0, 0.7, -0.7).normalize();
        } else {
          // Doors move laterally outward
          dir.set(restPos.x >= 0 ? 0.9 : -0.9, 0.2, 0).normalize();
        }
        maxDist = 1.4;
        delay = 0.2;
        break;

      case 'lighting_glass':
        // Glass and optical lenses move straight up
        dir.set(0, 1, 0).normalize();
        maxDist = 1.1;
        delay = 0.25;
        break;

      case 'aerodynamics':
        // Front splitter slides down-forward, rear wing slides up-rearward
        if (restPos.z > 0) {
          dir.set(0, -0.5, 0.85).normalize();
        } else {
          dir.set(0, 0.85, -0.5).normalize();
        }
        maxDist = 1.35;
        delay = 0.18;
        break;

      case 'interior_cabin':
        // Dashboard and seats lift vertically through the roof opening
        dir.set(0, 1.0, 0).normalize();
        maxDist = 1.5;
        delay = 0.3;
        break;

      default:
        dir.set(0, 1, 0);
        maxDist = 0.8;
        delay = 0.1;
        break;
    }

    return {
      componentId,
      subsystem,
      restPosition: restPos.clone(),
      explodedDirection: dir,
      maxDisplacementMeters: maxDist,
      staggerDelayRatio: delay,
      easingType: 'EASE_OUT_CUBIC',
    };
  }

  private static applyEasing(t: number, type: ExplodedTrajectorySpec['easingType']): number {
    switch (type) {
      case 'EASE_OUT_EXPO':
        return t === 1.0 ? 1.0 : 1.0 - Math.pow(2, -10 * t);
      case 'EASE_IN_OUT_QUAD':
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      case 'EASE_OUT_CUBIC':
      default:
        return 1.0 - Math.pow(1.0 - t, 3);
    }
  }
}
