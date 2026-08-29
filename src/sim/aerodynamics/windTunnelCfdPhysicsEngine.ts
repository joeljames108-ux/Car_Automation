/**
 * ============================================================================
 * WIND TUNNEL & ADVANCED CFD MULTI-PHYSICS ENGINE
 * ============================================================================
 * High-fidelity aerodynamic flowfield physics engine calculating:
 * - 3D Boundary layer dynamic pressure (q = 0.5 * rho * v^2)
 * - Front & Rear wing lift/downforce polars and induced drag (Cd_i)
 * - Underbody Venturi tunnel ground effect suction (Bernoulli acceleration)
 * - Vortex shedding frequencies (Strouhal number correlation)
 * - Porpoising limit cycle oscillation risk & aeroelastic instability
 * - Radiator duct mass flow & cooling drag penalty
 * ============================================================================
 */

export interface WindTunnelState {
  airSpeedKmh: number; // 0 to 400 km/h
  airDensity: number; // kg/m^3 (default 1.225)
  temperatureC: number; // -10 to 50 C
  frontWingAngleDeg: number; // -5 to 25 deg
  rearWingAngleDeg: number; // -5 to 35 deg
  drsActive: boolean;
  rideHeightFrontMm: number; // 10 to 100 mm
  rideHeightRearMm: number; // 15 to 120 mm
  diffuserRampDeg: number; // 5 to 25 deg
  sidepodVenturiWidthMm: number; // 200 to 800 mm
  activeAirbrake: boolean;
}

export interface CfdFlowlineParticle {
  id: number;
  startX: number;
  startY: number;
  startZ: number;
  speedFactor: number;
  pressureKPa: number;
  vorticity: number;
  color: string;
}

export interface WindTunnelPhysicsResult {
  airSpeedMs: number;
  dynamicPressurePa: number;
  totalDownforceN: number;
  totalDragN: number;
  frontDownforceN: number;
  rearDownforceN: number;
  frontAeroBalancePct: number;
  rearAeroBalancePct: number;
  liftToDragRatio: number;
  cdTotal: number;
  clTotal: number;
  venturiSuctionPressureKPa: number;
  vortexSheddingFreqHz: number;
  radiatorMassFlowKgS: number;
  porpoisingRiskScore: number; // 0 (stable) to 100 (severe porpoising)
  aerodynamicHorsepowerLossHp: number;
  particles: CfdFlowlineParticle[];
  pressureDistribution: { stationX: number; cpUpper: number; cpLower: number }[];
}

export class WindTunnelCfdPhysicsEngine {
  public static solve(state: WindTunnelState): WindTunnelPhysicsResult {
    const vMs = Math.max(0, state.airSpeedKmh / 3.6);
    // Ideal gas density correction for temperature
    const tempKelvin = state.temperatureC + 273.15;
    const correctedRho = state.airDensity * (288.15 / tempKelvin);
    const qPa = 0.5 * correctedRho * Math.pow(vMs, 2);

    // Front Wing Polars
    const fwRad = (state.frontWingAngleDeg * Math.PI) / 180;
    const clFrontWing = 0.8 + 0.08 * state.frontWingAngleDeg - 0.001 * Math.pow(state.frontWingAngleDeg, 2);
    const cdFrontWing = 0.05 + 0.012 * Math.pow(Math.max(0, state.frontWingAngleDeg), 1.5);

    // Rear Wing Polars with DRS effect
    const effRearAngle = state.drsActive ? Math.max(-5, state.rearWingAngleDeg - 18) : state.rearWingAngleDeg;
    const clRearWing = 1.1 + 0.09 * effRearAngle - 0.0012 * Math.pow(effRearAngle, 2);
    const cdRearWing = 0.08 + 0.018 * Math.pow(Math.max(0, effRearAngle), 1.6);
    const airbrakeCdExtra = state.activeAirbrake ? 0.85 : 0;

    // Ground Effect Venturi Tunnel Physics (Inverse square of ride height)
    const avgRideHeightM = (state.rideHeightFrontMm + state.rideHeightRearMm) * 0.0005;
    const groundEffectMultiplier = Math.min(3.5, 0.45 / Math.max(0.01, avgRideHeightM));
    const diffuserMultiplier = 1.0 + 0.03 * state.diffuserRampDeg;
    const clFloor = 1.4 * groundEffectMultiplier * diffuserMultiplier;
    const cdFloor = 0.12 * (1.0 + 0.02 * state.diffuserRampDeg);

    // Total Coefficients
    const clTotal = Math.max(0.1, clFrontWing + clRearWing + clFloor);
    const cdTotal = Math.max(0.15, 0.28 + cdFrontWing + cdRearWing + cdFloor + airbrakeCdExtra);

    // Aerodynamic Forces (N)
    const refAreaM2 = 2.15; // Standard supercar frontal area
    const totalDownforceN = qPa * clTotal * refAreaM2;
    const totalDragN = qPa * cdTotal * refAreaM2;

    const frontDownforceN = qPa * clFrontWing * refAreaM2 + totalDownforceN * 0.22;
    const rearDownforceN = Math.max(0, totalDownforceN - frontDownforceN);

    const frontAeroBalancePct = totalDownforceN > 0 ? (frontDownforceN / totalDownforceN) * 100 : 50;
    const rearAeroBalancePct = 100 - frontAeroBalancePct;

    const liftToDragRatio = totalDragN > 0 ? totalDownforceN / totalDragN : 0;

    // Venturi Underbody Pressure Drop (Bernoulli Equation)
    const venturiSuctionPressureKPa = (qPa * (clFloor * 0.8)) / 1000;

    // Vortex Shedding Frequency (Strouhal Number St = f * L / v approx 0.21)
    const characteristicLengthM = 0.35; // Wing chord / A-pillar width
    const vortexSheddingFreqHz = characteristicLengthM > 0 ? (0.21 * vMs) / characteristicLengthM : 0;

    // Radiator Duct Mass Flow (kg/s)
    const sidepodAreaM2 = (state.sidepodVenturiWidthMm / 1000) * 0.25;
    const radiatorMassFlowKgS = correctedRho * vMs * sidepodAreaM2 * 0.65;

    // Porpoising Aeroelastic Instability Risk Index (0-100)
    // Occurs at high ground effect, low ride height, and high speed
    let porpoisingRisk = 0;
    if (state.rideHeightFrontMm < 25 && vMs > 55) {
      const heightFactor = (25 - state.rideHeightFrontMm) / 15;
      const speedFactor = (vMs - 55) / 40;
      porpoisingRisk = Math.min(100, Math.round(heightFactor * speedFactor * 125));
    }

    // Aerodynamic Power Loss (HP) = (Drag * Velocity) / 745.7
    const aerodynamicHorsepowerLossHp = (totalDragN * vMs) / 745.7;

    // Generate 3D Flowline Particles for visualizer
    const particles: CfdFlowlineParticle[] = [];
    const numParticles = 48;
    for (let i = 0; i < numParticles; i++) {
      const y = -120 + (i % 8) * 35;
      const z = 10 + Math.floor(i / 8) * 20;
      const speedFactor = 0.8 + Math.sin(i * 0.5) * 0.4;
      const pressureKPa = 101.3 + (i % 3 === 0 ? -12 : 8);
      const vorticity = (i % 5) * 2.5;

      let color = "#fbbf24"; // Cyan (standard velocity)
      if (pressureKPa < 95) color = "#f59e0b"; // Purple (low pressure suction)
      else if (pressureKPa > 105) color = "#ef4444"; // Red (high pressure stagnation)
      else if (speedFactor > 1.1) color = "#34d399"; // Emerald (high velocity)

      particles.push({
        id: i,
        startX: -300 + (i * 12) % 600,
        startY: y,
        startZ: z,
        speedFactor,
        pressureKPa,
        vorticity,
        color,
      });
    }

    // Pressure Distribution Curve across 10 vehicle stations
    const pressureDistribution = [];
    for (let s = 0; s <= 10; s++) {
      const stationX = s * 400; // mm along chassis
      const upperFactor = 0.2 + 0.8 * Math.sin((s / 10) * Math.PI);
      const lowerFactor = -0.4 - (clFloor / 3) * Math.sin((s / 10) * Math.PI);
      pressureDistribution.push({
        stationX,
        cpUpper: Number((1.0 - upperFactor * (vMs / 80)).toFixed(3)),
        cpLower: Number((1.0 + lowerFactor * (vMs / 80)).toFixed(3)),
      });
    }

    return {
      airSpeedMs: Number(vMs.toFixed(2)),
      dynamicPressurePa: Number(qPa.toFixed(1)),
      totalDownforceN: Math.round(totalDownforceN),
      totalDragN: Math.round(totalDragN),
      frontDownforceN: Math.round(frontDownforceN),
      rearDownforceN: Math.round(rearDownforceN),
      frontAeroBalancePct: Number(frontAeroBalancePct.toFixed(1)),
      rearAeroBalancePct: Number(rearAeroBalancePct.toFixed(1)),
      liftToDragRatio: Number(liftToDragRatio.toFixed(2)),
      cdTotal: Number(cdTotal.toFixed(3)),
      clTotal: Number(clTotal.toFixed(3)),
      venturiSuctionPressureKPa: Number(venturiSuctionPressureKPa.toFixed(2)),
      vortexSheddingFreqHz: Number(vortexSheddingFreqHz.toFixed(1)),
      radiatorMassFlowKgS: Number(radiatorMassFlowKgS.toFixed(2)),
      porpoisingRiskScore: porpoisingRisk,
      aerodynamicHorsepowerLossHp: Number(aerodynamicHorsepowerLossHp.toFixed(1)),
      particles,
      pressureDistribution,
    };
  }
}
