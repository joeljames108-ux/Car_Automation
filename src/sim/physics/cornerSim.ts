// ===================================================================
// CORNER SIMULATION — Corner speed, braking zones, acceleration zones
// ===================================================================
// Phase 5: Iteratively calculates maximum corner speed accounting for
// speed-dependent downforce, then computes braking and exit zones.

import { calculateAeroForces, type AeroPhysicsConfig } from './aeroPhysics';
import { calculateWeightTransfer, calculateRollState, suspensionGripModifier, type SuspensionConfig } from './suspensionModel';
import { brakingZoneDistance, brakingZoneTime } from './brakeModel';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface CornerParams {
  radius: number;                // m (corner radius)
  arcDeg: number;                // degrees of arc
  elevation: number;             // m change (positive = uphill)
  banking: number;               // degrees of banking
  surfaceGrip: number;           // 0.85-1.0
  approachSpeed: number;         // km/h (speed coming from previous segment)
}

export interface CornerSimResult {
  cornerName: string;
  approachSpeed: number;         // km/h entering braking zone
  brakingDistance: number;       // metres
  brakingDuration: number;       // seconds
  turnInSpeed: number;           // km/h at corner entry
  apexSpeed: number;             // km/h minimum speed (at apex)
  exitSpeed: number;             // km/h leaving corner
  maxLateralG: number;           // peak lateral acceleration
  maxBrakingG: number;           // peak braking deceleration
  cornerDuration: number;        // seconds in the corner arc itself
  totalDuration: number;         // braking + corner + exit accel
  distance: number;              // total metres for this segment
  gearAtApex: number;            // gear number at apex
  tyreLoadFront: number;         // N (at apex)
  tyreLoadRear: number;          // N (at apex)
  tyreWearContribution: number;  // wear fraction this corner adds
  tyreEnergyInput: number;       // thermal energy into tyres (arbitrary units)
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GRAVITY = 9.81;

// ---------------------------------------------------------------------------
// Core: calculate maximum corner speed (iterative)
// ---------------------------------------------------------------------------

/**
 * Maximum corner speed where centripetal force = available grip.
 * 
 * F_centripetal = m × v² / R
 * F_grip = μ × (m×g + Downforce(v))
 * 
 * Since downforce depends on v², this is solved iteratively.
 */
export function maxCornerSpeed(
  radius: number,
  mass: number,
  tyreGrip: number,                // effective μ (already includes temp/wear/load)
  aeroConfig: AeroPhysicsConfig,
  airDensity: number,
  banking: number = 0,             // degrees
  suspGripMod: number = 1.0,       // suspension grip modifier
): number {
  // Start with no-aero estimate
  let v = Math.sqrt(tyreGrip * GRAVITY * radius);
  
  // Banking adds effective grip: tan(banking) component supports centripetal force
  const bankingRad = banking * Math.PI / 180;
  const bankingBoost = Math.tan(bankingRad) * GRAVITY * radius;

  // Iterate to find v where grip = centripetal demand (converges in 5-8 iterations)
  for (let i = 0; i < 12; i++) {
    const speedKmh = v * 3.6;
    const aero = calculateAeroForces(speedKmh, aeroConfig, airDensity);
    const totalNormalForce = mass * GRAVITY + aero.totalDownforce;
    const gripForce = tyreGrip * totalNormalForce * suspGripMod;
    const centripetalNeeded = mass * v * v / radius;
    const bankingForce = mass * Math.tan(bankingRad) * GRAVITY;

    const availableForce = gripForce + bankingForce;

    if (centripetalNeeded > availableForce) {
      v *= 0.98; // too fast, slow down
    } else if (centripetalNeeded < availableForce * 0.98) {
      v *= 1.01; // can go faster
    } else {
      break; // converged
    }
  }

  return Math.max(5, v); // minimum 5 m/s (18 km/h)
}

// ---------------------------------------------------------------------------
// Simulate a complete corner (braking → apex → exit)
// ---------------------------------------------------------------------------

export function simulateCorner(
  params: CornerParams,
  mass: number,
  tyreGrip: number,
  brakingG: number,
  accelerationG: number,          // available acceleration G at corner exit
  aeroConfig: AeroPhysicsConfig,
  airDensity: number,
  suspConfig: SuspensionConfig,
  gearAtApex: number = 3,
  cornerName: string = '',
): CornerSimResult {
  const { radius, arcDeg, elevation, banking, surfaceGrip, approachSpeed } = params;

  // 1. Calculate roll state and suspension grip modifier at estimated corner speed
  const estCornerSpeed = Math.sqrt(tyreGrip * GRAVITY * radius) * 3.6; // rough estimate
  const estLateralG = tyreGrip * 0.9;
  const rollState = calculateRollState(suspConfig, estLateralG, 0);
  const suspMod = suspensionGripModifier(suspConfig, rollState);
  const avgSuspGrip = (suspMod.frontGripMod + suspMod.rearGripMod) / 2;

  // 2. Calculate maximum corner speed (iterative with aero)
  const effectiveGrip = tyreGrip * surfaceGrip;
  const vMaxMs = maxCornerSpeed(radius, mass, effectiveGrip, aeroConfig, airDensity, banking, avgSuspGrip);
  const apexSpeedKmh = vMaxMs * 3.6;

  // 3. Actual lateral G at apex
  const actualLateralG = (vMaxMs * vMaxMs) / (radius * GRAVITY);

  // 4. Braking zone (if approach speed > apex speed)
  let brakingDist = 0;
  let brakingDur = 0;
  if (approachSpeed > apexSpeedKmh) {
    brakingDist = brakingZoneDistance(approachSpeed, apexSpeedKmh, brakingG);
    brakingDur = brakingZoneTime(approachSpeed, apexSpeedKmh, brakingG);
  }

  // 5. Turn-in speed (slightly above apex due to trail-braking)
  const turnInSpeed = Math.min(approachSpeed, apexSpeedKmh * 1.05);

  // 6. Corner arc distance and time
  const arcDist = (arcDeg / 360) * 2 * Math.PI * radius;
  const cornerDur = arcDist / vMaxMs;

  // 7. Exit speed (limited by available traction)
  // Cars accelerate out of corners using remaining grip after cornering force
  const remainingGripFraction = Math.max(0, 1 - (actualLateralG / (effectiveGrip * avgSuspGrip * 1.1)) ** 2);
  const exitAccelG = accelerationG * Math.sqrt(remainingGripFraction) * 0.7;
  const exitAccelMs2 = exitAccelG * GRAVITY;
  const exitSpeedMs = Math.sqrt(vMaxMs * vMaxMs + 2 * exitAccelMs2 * arcDist * 0.3);
  const exitSpeedKmh = Math.min(exitSpeedMs * 3.6, approachSpeed * 1.1); // can't exceed approach speed by much

  // 8. Weight transfer at apex
  const apexWeightTransfer = calculateWeightTransfer(suspConfig, 0, actualLateralG, 0, 0);

  // 9. Tyre energy and wear contribution
  const lateralForce = mass * actualLateralG * GRAVITY;
  const tyreEnergyInput = lateralForce * arcDist * 0.001;
  const tyreWearContribution = effectiveGrip * arcDist * 0.000002 * (1 + actualLateralG * 0.3);

  // 10. Gradient effect on time
  const gradientAngle = Math.atan2(elevation, arcDist);
  const gradientTimePenalty = elevation > 0 ? elevation * 0.02 : elevation * -0.01;

  const totalDuration = brakingDur + cornerDur + gradientTimePenalty;

  return {
    cornerName,
    approachSpeed: Math.round(approachSpeed * 10) / 10,
    brakingDistance: Math.round(brakingDist * 10) / 10,
    brakingDuration: Math.round(brakingDur * 1000) / 1000,
    turnInSpeed: Math.round(turnInSpeed * 10) / 10,
    apexSpeed: Math.round(apexSpeedKmh * 10) / 10,
    exitSpeed: Math.round(exitSpeedKmh * 10) / 10,
    maxLateralG: Math.round(actualLateralG * 100) / 100,
    maxBrakingG: brakingDist > 0 ? brakingG : 0,
    cornerDuration: Math.round(cornerDur * 1000) / 1000,
    totalDuration: Math.round(totalDuration * 1000) / 1000,
    distance: Math.round((brakingDist + arcDist) * 10) / 10,
    gearAtApex: gearAtApex,
    tyreLoadFront: Math.round(apexWeightTransfer.totalFront),
    tyreLoadRear: Math.round(apexWeightTransfer.totalRear),
    tyreWearContribution: Math.round(tyreWearContribution * 100000) / 100000,
    tyreEnergyInput: Math.round(tyreEnergyInput * 10) / 10,
  };
}

// ---------------------------------------------------------------------------
// Calculate the friction circle utilization
// ---------------------------------------------------------------------------

/** 
 * Friction circle: combined longitudinal + lateral force must stay within μ × N.
 * Returns 0-1 where 1 = at the limit.
 */
export function frictionCircleUtilization(
  lateralG: number,
  longitudinalG: number,
  maxGrip: number,
): number {
  const combined = Math.sqrt(lateralG * lateralG + longitudinalG * longitudinalG);
  return Math.min(1, combined / maxGrip);
}
