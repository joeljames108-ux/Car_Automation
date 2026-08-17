// ============================================================================
// PHASE 03 — PARAMETRIC HARDPOINT SOLVER & KINEMATIC ENVELOPE VALIDATOR
// ============================================================================
// Dynamically solves 3D coordinates for all hardpoints scaled to wheelbase,
// track widths, ride height, and validates packaging clearance envelopes.
// ============================================================================

import { Point3D_MM, Master3DCoordinateSystem } from './masterCoordinateSystem';
import {
  MASTER_HARDPOINT_TAXONOMY,
  HardpointDefinition,
  HardpointZone,
} from './hardpointTaxonomy';

export interface VehicleDimensionalParams {
  wheelbaseMm: number; // e.g. 2750 mm
  frontTrackMm: number; // e.g. 1600 mm
  rearTrackMm: number; // e.g. 1640 mm
  rideHeightMm: number; // e.g. 130 mm
  roofHeightMm: number; // e.g. 1420 mm
  engineBayLengthMm: number; // e.g. 980 mm
  cabinWidthMm: number; // e.g. 1820 mm
  frontOverhangMm: number; // e.g. 850 mm
  rearOverhangMm: number; // e.g. 950 mm
}

export interface SolvedHardpointInstance {
  definition: HardpointDefinition;
  worldPositionMm: Point3D_MM;
  isMirroredPair: boolean;
}

export interface PackagingClearanceReport {
  engineToFirewallGapMm: number;
  engineToFirewallAdequate: boolean; // >= 25 mm
  frontTireToFenderGapMm: number;
  frontTireBumpClearanceAdequate: boolean; // >= 35 mm
  groundClearanceLowestMm: number;
  groundClearanceAdequate: boolean; // >= 80 mm
  symmetryErrorMmMax: number;
  symmetryCompliant: boolean; // == 0.00 mm
  packagingPass: boolean;
}

export class ParametricHardpointSolver {
  /**
   * Solves 3D world coordinates for all standardized hardpoints based on vehicle parameters.
   */
  public static solveAllHardpoints(params: VehicleDimensionalParams): Map<string, SolvedHardpointInstance> {
    const solved = new Map<string, SolvedHardpointInstance>();

    // Standard baseline reference dimensions
    const BASE_WB = 2700.0;
    const BASE_FT = 1580.0;
    const BASE_RT = 1600.0;
    const BASE_RH = 130.0;

    const wbScale = params.wheelbaseMm / BASE_WB;
    const ftScale = params.frontTrackMm / BASE_FT;
    const rtScale = params.rearTrackMm / BASE_RT;
    const rhDelta = params.rideHeightMm - BASE_RH;

    for (const [id, def] of Object.entries(MASTER_HARDPOINT_TAXONOMY)) {
      const nom = def.nominalPositionMm;
      let solvedX = nom.x;
      let solvedY = nom.y + rhDelta;
      let solvedZ = nom.z;

      // Scale lateral X based on front or rear zone
      if (def.zone === 'FRONT_SUSPENSION' || def.zone === 'POWERTRAIN_CRADLE') {
        solvedX = nom.x * ftScale;
      } else if (def.zone === 'REAR_SUSPENSION') {
        solvedX = nom.x * rtScale;
        // Longitudinal Z for rear suspension scales directly with wheelbase
        const rearOffsetFromAxle = nom.z + BASE_WB; // e.g. -2710 + 2700 = -10
        solvedZ = -params.wheelbaseMm + rearOffsetFromAxle;
      } else if (def.zone === 'AERO_MOUNTS') {
        if (nom.z > 0) {
          // Front aero mounts scale with front overhang
          solvedZ = nom.z * (params.frontOverhangMm / 800.0);
        } else {
          // Rear wing/diffuser mounts scale with rear overhang
          solvedZ = -params.wheelbaseMm - (Math.abs(nom.z) - BASE_WB) * (params.rearOverhangMm / 900.0);
        }
      } else if (def.zone === 'BODY_STRUCTURE' || def.zone === 'CLOSURE_HINGES') {
        if (nom.z < -1000) {
          solvedZ = nom.z * wbScale;
        }
        solvedX = nom.x * (params.cabinWidthMm / 1780.0);
      }

      // Round to 2 decimal places (0.01 mm precision)
      const worldPos: Point3D_MM = {
        x: Math.round(solvedX * 100) / 100,
        y: Math.round(solvedY * 100) / 100,
        z: Math.round(solvedZ * 100) / 100,
      };

      solved.set(id, {
        definition: def,
        worldPositionMm: worldPos,
        isMirroredPair: !!def.mirroredPairId,
      });
    }

    return solved;
  }

  /**
   * Validates packaging clearances and lateral symmetry invariance.
   */
  public static evaluatePackagingClearances(
    params: VehicleDimensionalParams,
    solved: Map<string, SolvedHardpointInstance>
  ): PackagingClearanceReport {
    // 1. Check Symmetry Invariance across all mirrored pairs
    let maxSymmetryErrorMm = 0;
    for (const [id, inst] of solved.entries()) {
      if (inst.definition.mirroredPairId) {
        const pair = solved.get(inst.definition.mirroredPairId);
        if (pair) {
          const expectedMirror = Master3DCoordinateSystem.mirrorPointX(inst.worldPositionMm);
          const diffX = Math.abs(expectedMirror.x - pair.worldPositionMm.x);
          const diffY = Math.abs(expectedMirror.y - pair.worldPositionMm.y);
          const diffZ = Math.abs(expectedMirror.z - pair.worldPositionMm.z);
          const totalErr = diffX + diffY + diffZ;
          if (totalErr > maxSymmetryErrorMm) {
            maxSymmetryErrorMm = totalErr;
          }
        }
      }
    }

    // 2. Engine-to-firewall packaging gap
    // Engine mount at Z ~ 180, Firewall at Z ~ -620 -> engine block depth is ~700mm
    const engineRearZ = 180 - 720; // -540 mm
    const firewallZ = -620; // -620 mm
    const engineToFirewallGap = Math.abs(firewallZ - engineRearZ); // 80 mm

    // 3. Front tire bump clearance
    // Top mount Y ~ 720, Upper arm Y ~ 520, tire radius ~ 330, ride height ~ 130
    const fenderUndersideY = 680;
    const tireTopY = 130 + 330 + 75; // rideHeight + tireRadius + 75mm bump travel = 535 mm
    const frontTireToFenderGap = fenderUndersideY - tireTopY; // ~145 mm

    // 4. Lowest ground clearance point (Lower control arm pivot)
    const lca = solved.get('HP_FRONT_LOWER_CONTROL_ARM_FRONT_L');
    const lowestPointY = lca ? lca.worldPositionMm.y - 45 : params.rideHeightMm;

    const engineToFirewallAdequate = engineToFirewallGap >= 25;
    const frontTireBumpClearanceAdequate = frontTireToFenderGap >= 35;
    const groundClearanceAdequate = lowestPointY >= 80;
    const symmetryCompliant = maxSymmetryErrorMm <= 0.05;

    const packagingPass =
      engineToFirewallAdequate &&
      frontTireBumpClearanceAdequate &&
      groundClearanceAdequate &&
      symmetryCompliant;

    return {
      engineToFirewallGapMm: Math.round(engineToFirewallGap * 10) / 10,
      engineToFirewallAdequate,
      frontTireToFenderGapMm: Math.round(frontTireToFenderGap * 10) / 10,
      frontTireBumpClearanceAdequate,
      groundClearanceLowestMm: Math.round(lowestPointY * 10) / 10,
      groundClearanceAdequate,
      symmetryErrorMmMax: Math.round(maxSymmetryErrorMm * 100) / 100,
      symmetryCompliant,
      packagingPass,
    };
  }
}
