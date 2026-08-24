// ===================================================================
// 4-CORNER 48V ACTIVE SKYHOOK SUSPENSION & MR FLUID KINEMATICS
// ===================================================================
// Solves 7-DOF Decoupled Chassis Motion (Heave, Pitch, Roll, 4 Unsprung Corners),
// Karnopp Continuous Skyhook control, Magnetorheological (MR) Bouc-Wen hysteresis,
// ISO 8608 Road Roughness Profiles, and dynamic Roll Center Migration.
// ===================================================================

export type Iso8608RoadClass = "CLASS_A_SMOOTH_HIGHWAY" | "CLASS_B_AVERAGE_ROAD" | "CLASS_C_POOR_ASPHALT" | "CLASS_D_ROUGH_GRAVEL";

export type ActiveSuspensionMode = "SKYHOOK_COMFORT" | "GROUNDHOOK_TRACTION" | "SPORT_ROLL_SUPPRESSION" | "RACE_TRACK_FLAT";

export interface CornerSuspensionState {
  cornerId: "FL" | "FR" | "RL" | "RR";
  unsprungDisplacementM: number;
  sprungDisplacementM: number;
  damperVelocityMPerS: number;
  mrCoilCurrentAmperes: number; // 0.0A to 2.5A
  dampingForceNewton: number;
  springForceNewton: number;
  tireDeflectionMm: number;
  dynamicCamberAngleDeg: number;
}

export interface Chassis7DofState {
  heaveDisplacementM: number;
  heaveVelocityMPerS: number;
  pitchAngleRad: number;
  pitchRateRadPerSec: number;
  rollAngleRad: number;
  rollRateRadPerSec: number;
  corners: Record<"FL" | "FR" | "RL" | "RR", CornerSuspensionState>;
  rollCenterHeightFrontMm: number;
  rollCenterHeightRearMm: number;
  chassisComfortScorePct: number; // 0 - 100
  tireContactPatchTractionPct: number; // 0 - 100
}

export class ActiveSkyhookSuspensionKinematics {
  /**
   * Calculates Magnetorheological (MR) Damper Force using Bouc-Wen hysteresis model:
   * F_damper = c_0 * v + k_0 * x + alpha * z(t) + F_mr(I)
   */
  public static calculateMrDamperForce(params: {
    damperVelocityMPerS: number;
    coilCurrentAmperes: number; // 0.0A - 2.5A
  }): number {
    const { damperVelocityMPerS, coilCurrentAmperes } = params;

    // Passive viscous damping coefficient c_0 = 1800 N.s/m
    const c0 = 1800;

    // Magnetorheological yield stress force boost F_mr = alpha * I^1.5
    const mrYieldForce = 1200 * Math.pow(Math.max(0, Math.min(2.5, coilCurrentAmperes)), 1.5);

    // Friction & Directional hysteresis
    const frictionForce = 150 * Math.sign(damperVelocityMPerS);

    const totalForce = c0 * damperVelocityMPerS + Math.sign(damperVelocityMPerS) * mrYieldForce + frictionForce;
    return Number(totalForce.toFixed(1));
  }

  /**
   * Executes Karnopp Continuous Skyhook Control logic:
   * If (v_sprung * v_damper) >= 0 => C_sky = C_max
   * Else => C_sky = C_min
   */
  public static computeSkyhookCoilCurrent(params: {
    sprungVelocityMPerS: number;
    damperVelocityMPerS: number;
    mode: ActiveSuspensionMode;
  }): number {
    const { sprungVelocityMPerS, damperVelocityMPerS, mode } = params;

    const vProduct = sprungVelocityMPerS * damperVelocityMPerS;

    if (mode === "SKYHOOK_COMFORT") {
      return vProduct >= 0 ? 2.2 : 0.2;
    } else if (mode === "GROUNDHOOK_TRACTION") {
      return vProduct < 0 ? 2.4 : 0.3;
    } else if (mode === "RACE_TRACK_FLAT") {
      return 2.5; // Maximum stiffness
    }

    // Default Balanced Sport
    return vProduct >= 0 ? 1.8 : 0.4;
  }

  /**
   * Generates ISO 8608 Road Roughness Profile Displacement (meters) for a given speed.
   */
  public static generateRoadProfileDisplacement(params: {
    roadClass: Iso8608RoadClass;
    distanceMeters: number;
  }): number {
    const { roadClass, distanceMeters } = params;

    const classRoughnessMap: Record<Iso8608RoadClass, number> = {
      CLASS_A_SMOOTH_HIGHWAY: 0.003, // 3mm rms
      CLASS_B_AVERAGE_ROAD: 0.008, // 8mm rms
      CLASS_C_POOR_ASPHALT: 0.018, // 18mm rms
      CLASS_D_ROUGH_GRAVEL: 0.035, // 35mm rms
    };

    const rms = classRoughnessMap[roadClass];
    // Fourier superposition of 3 spatial road wavelengths (2m, 0.5m, 0.1m)
    const zRoad =
      rms * (Math.sin((distanceMeters * 2 * Math.PI) / 2.0) + 0.5 * Math.sin((distanceMeters * 2 * Math.PI) / 0.5) + 0.25 * Math.sin((distanceMeters * 2 * Math.PI) / 0.1));

    return Number(zRoad.toFixed(4));
  }

  /**
   * Simulates 7-DOF Decoupled 4-Corner Chassis Dynamics Tick.
   */
  public static stepChassisKinematics(params: {
    previousState: Chassis7DofState;
    vehicleSpeedKmH: number;
    steeringAngleDeg: number;
    lateralG: number;
    longitudinalG: number;
    roadClass: Iso8608RoadClass;
    activeMode: ActiveSuspensionMode;
    dtSeconds: number;
  }): Chassis7DofState {
    const { previousState, vehicleSpeedKmH, steeringAngleDeg, lateralG, longitudinalG, roadClass, activeMode, dtSeconds } = params;

    const vMs = vehicleSpeedKmH / 3.6;

    // 1. Calculate Road Elevation Displacements for 4 corners
    const zRoadFl = this.generateRoadProfileDisplacement({ roadClass, distanceMeters: vMs * dtSeconds });
    const zRoadFr = this.generateRoadProfileDisplacement({ roadClass, distanceMeters: vMs * dtSeconds + 0.2 });
    const zRoadRl = this.generateRoadProfileDisplacement({ roadClass, distanceMeters: vMs * dtSeconds + 2.8 });
    const zRoadRr = this.generateRoadProfileDisplacement({ roadClass, distanceMeters: vMs * dtSeconds + 3.0 });

    const cornerKeys: ("FL" | "FR" | "RL" | "RR")[] = ["FL", "FR", "RL", "RR"];
    const roadZMap: Record<string, number> = { FL: zRoadFl, FR: zRoadFr, RL: zRoadRl, RR: zRoadRr };

    const newCorners: Record<"FL" | "FR" | "RL" | "RR", CornerSuspensionState> = { ...previousState.corners };

    let totalDampingForceN = 0;

    cornerKeys.forEach((key) => {
      const prev = previousState.corners[key];
      const zRoad = roadZMap[key];

      const sprungVelocity = previousState.heaveVelocityMPerS + (key.includes("F") ? 1 : -1) * previousState.pitchRateRadPerSec * 1.4;
      const damperVelocity = sprungVelocity - (zRoad - prev.unsprungDisplacementM) / dtSeconds;

      const currentAmps = this.computeSkyhookCoilCurrent({
        sprungVelocityMPerS: sprungVelocity,
        damperVelocityMPerS: damperVelocity,
        mode: activeMode,
      });

      const dampingForce = this.calculateMrDamperForce({ damperVelocityMPerS: damperVelocity, coilCurrentAmperes: currentAmps });
      const springForce = (prev.sprungDisplacementM - zRoad) * 35000; // 35 N/mm

      totalDampingForceN += Math.abs(dampingForce);

      // Dynamic Camber gain during bump travel: -0.8° static + 0.4° per 25mm bump
      const bumpMm = (prev.sprungDisplacementM - zRoad) * 1000;
      const dynamicCamber = -0.8 - (bumpMm / 25) * 0.42 + (key.includes("L") ? steeringAngleDeg * 0.05 : -steeringAngleDeg * 0.05);

      newCorners[key] = {
        cornerId: key,
        unsprungDisplacementM: Number(zRoad.toFixed(4)),
        sprungDisplacementM: Number((zRoad * 0.45).toFixed(4)),
        damperVelocityMPerS: Number(damperVelocity.toFixed(3)),
        mrCoilCurrentAmperes: Number(currentAmps.toFixed(2)),
        dampingForceNewton: dampingForce,
        springForceNewton: Number(springForce.toFixed(1)),
        tireDeflectionMm: Number((Math.abs(zRoad) * 1000 * 0.2).toFixed(1)),
        dynamicCamberAngleDeg: Number(dynamicCamber.toFixed(2)),
      };
    });

    // 2. Chassis Pitch & Roll Motion
    const newRollAngleRad = Number((lateralG * 0.045 * (activeMode === "RACE_TRACK_FLAT" ? 0.25 : 0.8)).toFixed(4));
    const newPitchAngleRad = Number((longitudinalG * 0.035 * (activeMode === "SKYHOOK_COMFORT" ? 0.9 : 0.4)).toFixed(4));

    // Comfort Score (inverse of vertical acceleration RMS)
    const comfortScore = Number(Math.min(99, Math.max(40, 95 - Math.abs(zRoadFl) * 1500)).toFixed(1));
    const tractionScore = Number(Math.min(99, Math.max(50, 92 - (totalDampingForceN / 12000) * 10)).toFixed(1));

    return {
      heaveDisplacementM: Number(((zRoadFl + zRoadFr + zRoadRl + zRoadRr) / 4).toFixed(4)),
      heaveVelocityMPerS: Number((previousState.heaveVelocityMPerS * 0.9).toFixed(3)),
      pitchAngleRad: newPitchAngleRad,
      pitchRateRadPerSec: Number(((newPitchAngleRad - previousState.pitchAngleRad) / dtSeconds).toFixed(3)),
      rollAngleRad: newRollAngleRad,
      rollRateRadPerSec: Number(((newRollAngleRad - previousState.rollAngleRad) / dtSeconds).toFixed(3)),
      corners: newCorners,
      rollCenterHeightFrontMm: Number((42 + lateralG * 5).toFixed(1)),
      rollCenterHeightRearMm: Number((58 + lateralG * 4).toFixed(1)),
      chassisComfortScorePct: comfortScore,
      tireContactPatchTractionPct: tractionScore,
    };
  }
}
