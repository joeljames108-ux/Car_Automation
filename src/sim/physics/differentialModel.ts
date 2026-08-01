// ===================================================================
// ACTIVE DIFFERENTIAL & TORQUE VECTORING MODEL
// ===================================================================
// Phase 7: Models open, LSD, Torsen, active electronic differentials,
// and torque vectoring distribution across inner and outer wheels.

export type DifferentialType = 'open' | 'lsd' | 'torsen' | 'active' | 'locked';

export interface DifferentialParams {
  type: DifferentialType;
  preloadNm: number; // e.g. 50-150 Nm
  rampAngleAccelDeg: number; // e.g. 30°-60°
  rampAngleDecelDeg: number; // e.g. 45°-90°
  torqueBiasRatio: number; // For Torsen (e.g. 3.0 to 5.0)
  hasTorqueVectoring: boolean;
}

export interface DifferentialResult {
  torqueLeftNm: number;
  torqueRightNm: number;
  lockFraction: number; // 0.0 (open) to 1.0 (fully locked)
  yawMomentAssistNm: number; // Positive = helps turn into corner
}

/**
 * Calculates torque distribution between left and right wheels
 */
export function calculateDifferentialTorque(
  inputTorqueNm: number,
  speedLeftKmh: number,
  speedRightKmh: number,
  lateralG: number,
  steeringAngleDeg: number,
  params: DifferentialParams
): DifferentialResult {
  const { type, preloadNm, rampAngleAccelDeg, torqueBiasRatio, hasTorqueVectoring } = params;

  const halfTorque = inputTorqueNm * 0.5;
  const speedDiff = Math.abs(speedLeftKmh - speedRightKmh);
  const fastWheel = speedLeftKmh > speedRightKmh ? 'left' : 'right';

  let lockFraction = 0.0;
  let transferTorqueNm = 0.0;

  switch (type) {
    case 'open':
      lockFraction = 0.0;
      transferTorqueNm = 0.0;
      break;

    case 'lsd': {
      // Clutch-type LSD lock rises with input torque via ramp angles
      const rampFactor = Math.cos((rampAngleAccelDeg * Math.PI) / 180);
      const dynamicLock = (inputTorqueNm * 0.002 * rampFactor);
      lockFraction = Math.min(0.85, (preloadNm / 200) + dynamicLock);
      transferTorqueNm = halfTorque * lockFraction;
      break;
    }

    case 'torsen': {
      // Torsen sends up to TBR times more torque to the slower/higher-grip wheel
      const tbr = Math.max(1.5, torqueBiasRatio);
      lockFraction = Math.min(0.75, (tbr - 1) / (tbr + 1));
      transferTorqueNm = halfTorque * (lockFraction * 0.8);
      break;
    }

    case 'active': {
      // ECU electronically controls clutch pack bias
      const yawDemand = Math.abs(steeringAngleDeg) * 0.02;
      lockFraction = Math.min(0.95, 0.2 + yawDemand + Math.abs(lateralG) * 0.3);
      transferTorqueNm = halfTorque * lockFraction;
      break;
    }

    case 'locked':
      lockFraction = 1.0;
      transferTorqueNm = halfTorque;
      break;
  }

  // Determine left / right torque split
  let torqueLeftNm = halfTorque;
  let torqueRightNm = halfTorque;

  if (fastWheel === 'left') {
    torqueLeftNm -= transferTorqueNm;
    torqueRightNm += transferTorqueNm;
  } else if (fastWheel === 'right') {
    torqueLeftNm += transferTorqueNm;
    torqueRightNm -= transferTorqueNm;
  }

  // Active torque vectoring yaw assist
  let yawMomentAssistNm = 0.0;
  if (hasTorqueVectoring && Math.abs(steeringAngleDeg) > 2) {
    // Over-torque outside wheel to generate turning yaw moment
    const vectoringAmount = Math.min(250, inputTorqueNm * 0.25);
    if (steeringAngleDeg > 0) {
      // Turning right: increase left (outside) torque
      torqueLeftNm += vectoringAmount;
      torqueRightNm -= vectoringAmount;
      yawMomentAssistNm = vectoringAmount * 1.6; // N*m yaw moment
    } else {
      // Turning left: increase right (outside) torque
      torqueRightNm += vectoringAmount;
      torqueLeftNm -= vectoringAmount;
      yawMomentAssistNm = vectoringAmount * 1.6;
    }
  }

  return {
    torqueLeftNm: Math.round(Math.max(0, torqueLeftNm)),
    torqueRightNm: Math.round(Math.max(0, torqueRightNm)),
    lockFraction: Math.round(lockFraction * 100) / 100,
    yawMomentAssistNm: Math.round(yawMomentAssistNm),
  };
}
