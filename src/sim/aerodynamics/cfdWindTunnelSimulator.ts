// ============================================================================
// PHASE 14 — AERODYNAMIC CFD WIND TUNNEL & 3D STREAMLINE FLOW SIMULATOR
// ============================================================================
// Real-time aerodynamic simulation engine computing surface pressure (Cp),
// boundary layer separation, Venturi diffuser ground effect suction forces,
// and 3D particle streamline trajectories with velocity gradients.
// ============================================================================

import * as THREE from 'three';

export interface AerodynamicStreamlinePoint {
  position: THREE.Vector3;
  velocity: number; // m/s
  pressureCp: number; // Dimensionless pressure coefficient (-3.0 to +1.0)
  turbulenceIntensity: number; // 0.0 (laminar) to 1.0 (separated stall)
}

export interface AerodynamicStreamline {
  id: string;
  points: AerodynamicStreamlinePoint[];
  originZ: number;
  originY: number;
  originX: number;
}

export interface WindTunnelState {
  airspeedKmh: number;
  airDensityKgPerM3: number; // 1.225 kg/m3 at sea level
  ambientTempC: number;
  yawAngleDeg: number;
  rideHeightFrontMm: number;
  rideHeightRearMm: number;
  rearWingAngleDeg: number;
}

export interface AerodynamicForcesResult {
  totalDownforceN: number;
  frontDownforceN: number;
  rearDownforceN: number;
  totalDragN: number;
  aeroBalanceFrontPct: number; // % of downforce on front axle
  liftToDragRatio: number; // L/D efficiency
  groundEffectSuctionN: number;
  inducedDragN: number;
  streamlines: AerodynamicStreamline[];
}

export class CFDWindTunnelSimulator {
  /**
   * Solves vehicle aerodynamic performance, forces, and 3D flow streamlines.
   */
  public static solveAerodynamics(
    state: WindTunnelState,
    baseCd: number = 0.32,
    frontalAreaM2: number = 2.15,
    hasRearWing: boolean = true,
    hasFrontSplitter: boolean = true,
    hasUnderbodyDiffuser: boolean = true
  ): AerodynamicForcesResult {
    const vMs = (state.airspeedKmh * 1000) / 3600;
    const q = 0.5 * state.airDensityKgPerM3 * vMs * vMs; // Dynamic pressure 1/2 * rho * v^2

    // 1. Rear Wing Aerodynamics
    let rearWingCl = 0.0;
    let rearWingCd = 0.0;
    if (hasRearWing) {
      const alphaRad = (state.rearWingAngleDeg * Math.PI) / 180;
      // Airfoil lift & induced drag with stall above 16 degrees
      if (state.rearWingAngleDeg <= 16) {
        rearWingCl = 0.35 + 2 * Math.PI * 0.15 * alphaRad;
        rearWingCd = 0.02 + (rearWingCl * rearWingCl) / (Math.PI * 4.5); // Induced drag
      } else {
        // Stalled airfoil
        rearWingCl = 0.35 + 2 * Math.PI * 0.15 * (16 * Math.PI / 180) * Math.cos(alphaRad);
        rearWingCd = 0.12 + 0.4 * Math.sin(alphaRad);
      }
    }

    // 2. Front Splitter Downforce
    let frontSplitterCl = 0.0;
    let frontSplitterCd = 0.0;
    if (hasFrontSplitter) {
      const groundProximityFactor = Math.max(0.5, Math.min(2.5, 120 / Math.max(40, state.rideHeightFrontMm)));
      frontSplitterCl = 0.28 * groundProximityFactor;
      frontSplitterCd = 0.015;
    }

    // 3. Underbody Diffuser Ground Effect Suction
    let groundEffectSuctionN = 0.0;
    let diffuserCl = 0.0;
    if (hasUnderbodyDiffuser) {
      const hFront = state.rideHeightFrontMm / 1000;
      const hRear = state.rideHeightRearMm / 1000;
      const areaDiffuserM2 = 1.6;
      // Venturi expansion ratio (hRear / hFront)
      const expansionRatio = Math.max(1.0, Math.min(3.5, hRear / Math.max(0.04, hFront)));
      // Ground effect suction force
      groundEffectSuctionN = q * areaDiffuserM2 * (1 - 1 / (expansionRatio * expansionRatio));
      diffuserCl = groundEffectSuctionN / (q * frontalAreaM2);
    }

    // 4. Aggregate Lift & Drag Forces
    const totalCl = rearWingCl + frontSplitterCl + diffuserCl;
    const totalCd = baseCd + rearWingCd + frontSplitterCd;

    const totalDownforceN = totalCl * q * frontalAreaM2;
    const totalDragN = totalCd * q * frontalAreaM2;

    const frontDownforceN = frontSplitterCl * q * frontalAreaM2 + groundEffectSuctionN * 0.45;
    const rearDownforceN = rearWingCl * q * frontalAreaM2 + groundEffectSuctionN * 0.55;

    const aeroBalanceFrontPct = totalDownforceN > 0 ? (frontDownforceN / totalDownforceN) * 100 : 50.0;
    const liftToDragRatio = totalDragN > 0 ? totalDownforceN / totalDragN : 0.0;

    // 5. Generate 3D Flow Streamlines
    const streamlines = this.generateFlowStreamlines(vMs, state.rearWingAngleDeg, hasRearWing);

    return {
      totalDownforceN: Math.round(totalDownforceN),
      frontDownforceN: Math.round(frontDownforceN),
      rearDownforceN: Math.round(rearDownforceN),
      totalDragN: Math.round(totalDragN),
      aeroBalanceFrontPct: Math.round(aeroBalanceFrontPct * 10) / 10,
      liftToDragRatio: Math.round(liftToDragRatio * 100) / 100,
      groundEffectSuctionN: Math.round(groundEffectSuctionN),
      inducedDragN: Math.round(rearWingCd * q * frontalAreaM2),
      streamlines,
    };
  }

  /**
   * Generates 3D flow streamlines passing over vehicle body and rear wing.
   */
  private static generateFlowStreamlines(
    vFreeStreamMs: number,
    wingAngleDeg: number,
    hasWing: boolean
  ): AerodynamicStreamline[] {
    const lines: AerodynamicStreamline[] = [];
    const gridX = [-0.6, -0.3, 0.0, 0.3, 0.6];
    const gridY = [0.2, 0.5, 0.9, 1.3];

    let idCount = 0;
    for (const x of gridX) {
      for (const y of gridY) {
        idCount++;
        const points: AerodynamicStreamlinePoint[] = [];
        const startZ = 2.5; // upstream front
        const endZ = -4.0; // downstream wake
        const steps = 30;
        const dz = (endZ - startZ) / steps;

        for (let i = 0; i <= steps; i++) {
          const z = startZ + i * dz;
          let currentY = y;
          let vel = vFreeStreamMs;
          let cp = 0.0;
          let turb = 0.02;

          // Front nose stagnation point
          if (z > 0.8 && z < 1.8 && Math.abs(x) < 0.8 && y < 0.6) {
            cp = 0.85; // High positive pressure
            vel = vFreeStreamMs * 0.45; // Stagnation deceleration
            currentY = y + 0.15 * Math.sin(((z - 0.8) / 1.0) * Math.PI);
          }
          // Hood and windshield acceleration
          else if (z > 0.0 && z <= 0.8 && y < 1.2) {
            cp = -0.65; // Suction zone
            vel = vFreeStreamMs * 1.25; // Acceleration over hood
            currentY = y + 0.25;
          }
          // Roof contour
          else if (z <= 0.0 && z > -1.6 && y > 0.8) {
            cp = -0.4;
            vel = vFreeStreamMs * 1.15;
            currentY = y + 0.18;
          }
          // Rear wing interaction zone
          else if (z <= -1.8 && z > -2.6 && hasWing) {
            const downwashAngle = (wingAngleDeg * 0.6 * Math.PI) / 180;
            currentY = y - (Math.abs(z + 1.8) * Math.sin(downwashAngle));
            cp = -1.2; // High suction under wing
            vel = vFreeStreamMs * 1.35;
          }
          // Rear wake / separation vortex zone
          else if (z <= -2.6) {
            turb = Math.min(1.0, 0.1 + Math.abs(z + 2.6) * 0.25);
            vel = vFreeStreamMs * (1.0 - turb * 0.4);
            cp = -0.15;
          }

          points.push({
            position: new THREE.Vector3(x, Math.max(0.05, currentY), z),
            velocity: Math.round(vel * 10) / 10,
            pressureCp: Math.round(cp * 100) / 100,
            turbulenceIntensity: Math.round(turb * 100) / 100,
          });
        }

        lines.push({
          id: `STREAMLINE_${idCount}`,
          points,
          originX: x,
          originY: y,
          originZ: startZ,
        });
      }
    }

    return lines;
  }
}
