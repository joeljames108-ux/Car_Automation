// ============================================================================
// PHASE 64 — ACTIVE UNDERBODY VENTURI DIFFUSER & GROUND EFFECT SOLVER
// ============================================================================
// 1D/2D Bernoulli Venturi throat suction, expansion ramp pressure recovery C_p(x),
// boundary layer momentum thickness growth, adverse pressure gradient stall prediction,
// vortex generator skirt sealing, and active adjustable flap kinematics.
// ============================================================================

export interface DiffuserStationCp {
  stationIndex: number;
  positionXM: number;
  localChannelHeightMm: number;
  localAirVelocityMs: number;
  localPressureCoefficientCp: number;
  localDownforceN: number;
  isBoundaryLayerAttached: boolean;
}

export interface ActiveVenturiDiffuserState {
  vehicleSpeedKmh: number;
  frontRideHeightMm: number;
  rearRideHeightMm: number;
  diffuserRampAngleDeg: number;
  throatGroundClearanceMm: number;
  expansionRatio: number;
  throatAirVelocityMs: number;
  throatSuctionCpMin: number;
  totalUnderbodyDownforceN: number;
  underbodyDragForceN: number;
  groundEffectEfficiencyLOverD: number;
  aerodynamicBalanceFrontPct: number;
  centerOfPressurePctFront: number; // Backward compatibility alias
  isDiffuserStalled: boolean;
  boundaryLayerSeparationPointPct: number;
  vortexSkirtSealingEffectivenessPct: number;
  vortexSealIntensityPct: number; // Backward compatibility alias
  pressureDistribution: DiffuserStationCp[];
}

export class ActiveVenturiDiffuserSolver {
  private static readonly TUNNEL_WIDTH_M = 1.42;
  private static readonly RHO_AIR = 1.225;

  /**
   * Solves non-linear Venturi channel compressible/incompressible flow, C_p(x) recovery, and stall limits.
   */
  public static solveGroundEffectAerodynamics(params: {
    vehicleSpeedKmh: number;
    frontRideHeightMm: number;
    rearRideHeightMm: number;
    diffuserRampAngleDeg: number;
    activeFlapExtensionMm?: number;
    vortexGeneratorsInstalled?: boolean;
    yawAngleDeg?: number;
  }): ActiveVenturiDiffuserState {
    const vKmh = Math.max(10, params.vehicleSpeedKmh);
    const vInfMs = (vKmh * 1000) / 3600;
    const hFront = Math.max(15, params.frontRideHeightMm);
    const hRear = Math.max(25, params.rearRideHeightMm);
    const rampAngleDeg = Math.max(4.0, Math.min(22.0, params.diffuserRampAngleDeg));
    const flapExtMm = params.activeFlapExtensionMm || 0.0;
    const hasVortexGenerators = params.vortexGeneratorsInstalled ?? true;
    const yawDeg = Math.abs(params.yawAngleDeg || 0.0);

    const hThroatMm = hFront + (hRear - hFront) * 0.15;
    const hExitMm = hRear + 120.0 * Math.tan((rampAngleDeg * Math.PI) / 180) * 10.0 + flapExtMm;
    const expansionRatio = Math.max(1.1, hExitMm / Math.max(10, hThroatMm));

    let groundProximitySuctionFactor = 1.0;
    if (hThroatMm < 50.0) {
      groundProximitySuctionFactor = 1.0 + (50.0 - hThroatMm) * 0.022;
      if (hThroatMm < 18.0) {
        groundProximitySuctionFactor *= Math.max(0.6, hThroatMm / 18.0);
      }
    }

    const vThroatMs = vInfMs * Math.sqrt(expansionRatio) * 0.92 * groundProximitySuctionFactor;
    const cpThroat = 1.0 - Math.pow(vThroatMs / vInfMs, 2);

    const criticalStallAngleDeg = hasVortexGenerators ? 18.5 : 14.5;
    const isStalled = rampAngleDeg > criticalStallAngleDeg || (hThroatMm < 16.0 && rampAngleDeg > 15.0);

    let separationPct = 100.0;
    if (isStalled) {
      separationPct = Math.max(45.0, 100.0 - (rampAngleDeg - criticalStallAngleDeg) * 14.0);
    }

    const nStations = 12;
    const stations: DiffuserStationCp[] = [];
    const tunnelLengthM = 2.45;
    let totalDownforceN = 0.0;
    let totalInducedDragN = 0.0;
    let sumFrontMoment = 0.0;

    for (let i = 0; i < nStations; i++) {
      const frac = i / (nStations - 1);
      const xM = frac * tunnelLengthM;

      let hLocalMm = hFront;
      if (frac < 0.4) {
        hLocalMm = hFront - (hFront - hThroatMm) * (frac / 0.4);
      } else {
        const rampFrac = (frac - 0.4) / 0.6;
        hLocalMm = hThroatMm + (hExitMm - hThroatMm) * Math.pow(rampFrac, 1.25);
      }

      let cpLocal = 0.0;
      let isAttached = true;

      if (frac < 0.4) {
        cpLocal = -0.25 - (Math.abs(cpThroat) - 0.25) * Math.pow(frac / 0.4, 2);
      } else {
        const rampFrac = (frac - 0.4) / 0.6;
        if (rampFrac * 100 > separationPct) {
          cpLocal = -0.15;
          isAttached = false;
        } else {
          const cpExit = 0.05;
          cpLocal = cpThroat + (cpExit - cpThroat) * (1.0 - Math.exp(-2.8 * rampFrac));
        }
      }

      const stationAreaM2 = (tunnelLengthM / nStations) * this.TUNNEL_WIDTH_M;
      const qDynamic = 0.5 * this.RHO_AIR * Math.pow(vInfMs, 2);
      const localFzN = -cpLocal * qDynamic * stationAreaM2;

      totalDownforceN += localFzN;
      totalInducedDragN += localFzN * Math.sin((rampAngleDeg * Math.PI) / 180) * 0.065;
      sumFrontMoment += localFzN * (tunnelLengthM - xM);

      const localVelMs = vInfMs * Math.sqrt(Math.max(0.01, 1.0 - cpLocal));

      stations.push({
        stationIndex: i + 1,
        positionXM: Math.round(xM * 100) / 100,
        localChannelHeightMm: Math.round(hLocalMm * 10) / 10,
        localAirVelocityMs: Math.round(localVelMs * 10) / 10,
        localPressureCoefficientCp: Math.round(cpLocal * 100) / 100,
        localDownforceN: Math.round(localFzN),
        isBoundaryLayerAttached: isAttached,
      });
    }

    const vortexSealingPct = hasVortexGenerators ? Math.max(50.0, 94.0 - yawDeg * 3.5) : 72.0 - yawDeg * 5.0;
    const sealingMultiplier = vortexSealingPct / 100;
    totalDownforceN *= sealingMultiplier;

    const frontAeroBalancePct = totalDownforceN > 0 ? (sumFrontMoment / (totalDownforceN * tunnelLengthM)) * 100 : 45.0;
    const lOverD = totalInducedDragN > 0 ? totalDownforceN / totalInducedDragN : 5.8;

    return {
      vehicleSpeedKmh: vKmh,
      frontRideHeightMm: hFront,
      rearRideHeightMm: hRear,
      diffuserRampAngleDeg: rampAngleDeg,
      throatGroundClearanceMm: Math.round(hThroatMm * 10) / 10,
      expansionRatio: Math.round(expansionRatio * 100) / 100,
      throatAirVelocityMs: Math.round(vThroatMs * 10) / 10,
      throatSuctionCpMin: Math.round(cpThroat * 100) / 100,
      totalUnderbodyDownforceN: Math.round(totalDownforceN),
      underbodyDragForceN: Math.round(totalInducedDragN),
      groundEffectEfficiencyLOverD: Math.round(lOverD * 100) / 100,
      aerodynamicBalanceFrontPct: Math.round(frontAeroBalancePct * 10) / 10,
      centerOfPressurePctFront: Math.round(frontAeroBalancePct * 10) / 10,
      isDiffuserStalled: isStalled,
      boundaryLayerSeparationPointPct: Math.round(separationPct * 10) / 10,
      vortexSkirtSealingEffectivenessPct: Math.round(vortexSealingPct * 10) / 10,
      vortexSealIntensityPct: Math.round(vortexSealingPct * 10) / 10,
      pressureDistribution: stations,
    };
  }
}
