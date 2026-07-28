// ===================================================================
// AERODYNAMIC PHYSICS — Speed-dependent downforce, drag, and aero map
// ===================================================================
// Phase 3: Reads from SimResult aero coefficients and produces
// instantaneous aerodynamic forces at any speed.

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface AeroPhysicsConfig {
  dragCoeff: number;           // Cd
  liftCoeff: number;           // Cl (negative = downforce)
  frontalArea: number;         // m²
  aeroBalance: number;         // 0-1 (fraction of downforce on rear)
  groundEffect: number;        // 0-1 multiplier for ground effect bonus
  drsReduction: number;        // fraction of drag removed when DRS open (0.15-0.20)
  activeAeroEnabled: boolean;
  rideHeight: number;          // mm
}

export interface AeroForces {
  dragForce: number;           // N (resistance)
  totalDownforce: number;      // N (pushes car into ground)
  frontDownforce: number;      // N
  rearDownforce: number;       // N
  liftDragRatio: number;       // efficiency metric (higher = better)
  dragPower: number;           // kW consumed overcoming drag
}

export interface AeroMapPoint {
  speed: number;               // km/h
  drag: number;                // N
  downforce: number;           // N
  frontDown: number;           // N
  rearDown: number;            // N
  dragPowerKw: number;         // kW
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RHO_SEA_LEVEL = 1.225; // kg/m³ at sea level, 15°C

// ---------------------------------------------------------------------------
// Air density adjustment for altitude
// ---------------------------------------------------------------------------

export function airDensityAtAltitude(altitudeM: number, tempC: number = 15): number {
  // Barometric formula + temperature correction
  // ρ = ρ₀ × exp(-altitude / 8500) × (288.15 / (273.15 + T))
  const tempFactor = 288.15 / (273.15 + tempC);
  return RHO_SEA_LEVEL * Math.exp(-altitudeM / 8500) * tempFactor;
}

// ---------------------------------------------------------------------------
// Core: instantaneous aero forces at given speed
// ---------------------------------------------------------------------------

export function calculateAeroForces(
  speedKmh: number,
  config: AeroPhysicsConfig,
  airDensity: number = RHO_SEA_LEVEL,
  drsActive: boolean = false,
): AeroForces {
  const speedMs = speedKmh / 3.6;
  const dynamicPressure = 0.5 * airDensity * speedMs * speedMs;

  // Drag
  let effectiveCd = config.dragCoeff;
  if (drsActive && config.activeAeroEnabled) {
    effectiveCd *= (1 - config.drsReduction);
  }
  const dragForce = effectiveCd * config.frontalArea * dynamicPressure;

  // Downforce (Cl is stored as positive in our system = downforce)
  let effectiveCl = Math.abs(config.liftCoeff);

  // Ground effect bonus at low ride heights
  if (config.groundEffect > 0 && config.rideHeight < 80) {
    const geBonus = 1 + config.groundEffect * 0.25 * (1 - config.rideHeight / 80);
    effectiveCl *= geBonus;
  }

  // DRS reduces downforce too (opens rear wing)
  if (drsActive && config.activeAeroEnabled) {
    effectiveCl *= 0.70; // ~30% downforce loss with DRS open
  }

  const totalDownforce = effectiveCl * config.frontalArea * dynamicPressure;
  const rearDownforce = totalDownforce * config.aeroBalance;
  const frontDownforce = totalDownforce * (1 - config.aeroBalance);

  // Lift/Drag ratio
  const liftDragRatio = dragForce > 0 ? totalDownforce / dragForce : 0;

  // Power consumed by drag: P = F × v
  const dragPower = (dragForce * speedMs) / 1000; // kW

  return {
    dragForce: Math.round(dragForce * 10) / 10,
    totalDownforce: Math.round(totalDownforce * 10) / 10,
    frontDownforce: Math.round(frontDownforce * 10) / 10,
    rearDownforce: Math.round(rearDownforce * 10) / 10,
    liftDragRatio: Math.round(liftDragRatio * 100) / 100,
    dragPower: Math.round(dragPower * 10) / 10,
  };
}

// ---------------------------------------------------------------------------
// Build pre-computed aero map (forces at discrete speeds)
// ---------------------------------------------------------------------------

export function buildAeroMap(
  config: AeroPhysicsConfig,
  airDensity: number = RHO_SEA_LEVEL,
  maxSpeedKmh: number = 350,
): AeroMapPoint[] {
  const map: AeroMapPoint[] = [];
  for (let speed = 0; speed <= maxSpeedKmh; speed += 10) {
    const forces = calculateAeroForces(speed, config, airDensity, false);
    map.push({
      speed,
      drag: forces.dragForce,
      downforce: forces.totalDownforce,
      frontDown: forces.frontDownforce,
      rearDown: forces.rearDownforce,
      dragPowerKw: forces.dragPower,
    });
  }
  return map;
}

// ---------------------------------------------------------------------------
// Dirty air model (following another car)
// ---------------------------------------------------------------------------

export interface DirtyAirEffect {
  downforceLoss: number;       // fraction lost (0-1)
  dragReduction: number;       // fraction of drag saved (0-1, slipstream)
}

export function dirtyAirEffect(gapSeconds: number): DirtyAirEffect {
  // Within 1 second: heavy downforce loss, significant drag reduction (slipstream)
  // Beyond 3 seconds: negligible
  if (gapSeconds > 3) return { downforceLoss: 0, dragReduction: 0 };

  const proximity = Math.max(0, 1 - gapSeconds / 3);
  return {
    downforceLoss: proximity * 0.40,         // up to 40% downforce loss
    dragReduction: proximity * 0.15,         // up to 15% drag reduction (slipstream)
  };
}

// ---------------------------------------------------------------------------
// Extract AeroPhysicsConfig from SimResult
// ---------------------------------------------------------------------------

export function aeroConfigFromSim(sim: {
  dragCoeff: number;
  liftCoeff: number;
  frontalArea: number;
  aeroBalance: number;
  groundEffect: number;
}): AeroPhysicsConfig {
  return {
    dragCoeff: sim.dragCoeff,
    liftCoeff: sim.liftCoeff,
    frontalArea: sim.frontalArea,
    aeroBalance: sim.aeroBalance,
    groundEffect: sim.groundEffect,
    drsReduction: 0.18,
    activeAeroEnabled: false, // set per-context
    rideHeight: 60,           // default, override from vehicle config
  };
}
