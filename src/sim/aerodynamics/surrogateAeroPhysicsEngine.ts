// ============================================================================
// PHASE 119: SURROGATE AERODYNAMICS PHYSICS & LAP-TIME SIMULATION ENGINE
// ============================================================================
// Real-time CFD surrogate aerodynamic model computing local component forces,
// induced & profile drag, front/rear aero balance %, tire load lateral grip,
// top speed equilibrium, lap time deltas, mass, and tooling cost.
// ============================================================================

import type {
  MasterAeroStudioConfig,
  AeroSurrogatePhysicsResult,
  ComponentAeroBreakdown,
  AeroPackagePresetId,
} from './aeroStudioTypes';

export class SurrogateAeroPhysicsEngine {
  /**
   * Default baseline configurations for hot-swappable Aero Packages
   */
  public static getPresetConfig(preset: AeroPackagePresetId): MasterAeroStudioConfig {
    const base: MasterAeroStudioConfig = {
      preset,
      airspeedKmh: 200,
      airDensityKgPerM3: 1.225,
      ambientTempC: 22,
      yawAngleDeg: 0,
      frontWing: {
        spanMm: 1720,
        mainChordMm: 320,
        flapChordMm: 140,
        flapAngleDeg: 12,
        flapLengthPct: 85,
        endplateHeightMm: 220,
        endplateToeAngleDeg: 2,
        elementCount: 2,
        rideHeightMm: 65,
        slotGapMm: 12,
        gurneyHeightMm: 6,
        hasVortexGenerators: true,
      },
      sidepod: {
        lengthMm: 1650,
        widthMm: 480,
        heightMm: 520,
        inletAreaM2: 0.18,
        inletPositionXOffsetMm: 20,
        undercutDepthMm: 140,
        shoulderHeightMm: 560,
        rearTaperDeg: 14,
        coolingOutletAreaM2: 0.12,
        vortexFencesCount: 2,
        downwashRampAngleDeg: 8,
      },
      groundEffectFloor: {
        floorLengthMm: 2950,
        floorWidthMm: 1750,
        tunnelThroatHeightMm: 38,
        tunnelThroatPositionPct: 35,
        tunnelExpansionRatio: 2.6,
        edgeWingHeightMm: 28,
        floorEdgeSealAngleDeg: 5,
        strakeCount: 4,
        rideHeightSensitivityFactor: 1.2,
        hasPorpoisingDamper: true,
      },
      diffuser: {
        lengthMm: 980,
        widthMm: 1240,
        rampAngleDeg: 13,
        throatHeightMm: 42,
        strakeCount: 4,
        strakeHeightMm: 95,
        strakeLengthMm: 680,
        exitHeightMm: 260,
        hasGurneyFlap: true,
        gurneyHeightMm: 8,
      },
      rearWing: {
        spanMm: 1680,
        mainChordMm: 340,
        heightMm: 380,
        angleOfAttackDeg: 14,
        flapChordMm: 150,
        endplateHeightMm: 290,
        endplateToeAngleDeg: 1,
        gurneyHeightMm: 10,
        pylonType: 'swan_neck',
        elementCount: 2,
        hasDrsActuator: true,
      },
      canards: {
        tierCount: 2,
        spanMm: 220,
        chordMm: 130,
        sweepDeg: 28,
        incidenceDeg: 12,
        hasEndplateFence: true,
      },
      activeAero: {
        enabled: true,
        drsMaxSpeedThresholdKmh: 240,
        airbrakeDecelThresholdG: 0.8,
        activeFrontFlapRangeDeg: [2, 14],
        activeRearWingRangeDeg: [4, 28],
        activeDiffuserFlapMm: 35,
      },
    };

    switch (preset) {
      case 'low_drag_speed':
        base.frontWing.flapAngleDeg = 4;
        base.frontWing.elementCount = 1;
        base.frontWing.gurneyHeightMm = 0;
        base.rearWing.angleOfAttackDeg = 4;
        base.rearWing.gurneyHeightMm = 0;
        base.diffuser.rampAngleDeg = 8;
        base.canards.tierCount = 0;
        base.sidepod.undercutDepthMm = 90;
        break;

      case 'high_downforce_sprint':
        base.frontWing.flapAngleDeg = 24;
        base.frontWing.elementCount = 3;
        base.frontWing.gurneyHeightMm = 12;
        base.rearWing.angleOfAttackDeg = 26;
        base.rearWing.gurneyHeightMm = 18;
        base.diffuser.rampAngleDeg = 17;
        base.canards.tierCount = 3;
        base.canards.incidenceDeg = 18;
        base.sidepod.undercutDepthMm = 190;
        break;

      case 'extreme_ground_effect':
        base.groundEffectFloor.tunnelThroatHeightMm = 22;
        base.groundEffectFloor.tunnelExpansionRatio = 3.8;
        base.groundEffectFloor.strakeCount = 6;
        base.groundEffectFloor.edgeWingHeightMm = 45;
        base.diffuser.rampAngleDeg = 16;
        base.diffuser.strakeCount = 6;
        base.frontWing.rideHeightMm = 40;
        base.frontWing.flapAngleDeg = 16;
        base.rearWing.angleOfAttackDeg = 16;
        break;

      case 'balanced_gt':
      default:
        // Default balanced values
        break;
    }

    return base;
  }

  /**
   * Solves vehicle aerodynamic performance, force distributions, and lap time impact.
   */
  public static solveAerodynamics(config: MasterAeroStudioConfig): AeroSurrogatePhysicsResult {
    const vMs = (Math.max(10, config.airspeedKmh) * 1000) / 3600;
    const rho = config.airDensityKgPerM3;
    const q = 0.5 * rho * vMs * vMs; // Dynamic pressure N/m2

    // ------------------------------------------------------------------------
    // 1. Front Wing Aerodynamics
    // ------------------------------------------------------------------------
    const fwSpanM = config.frontWing.spanMm / 1000;
    const fwMainChordM = config.frontWing.mainChordMm / 1000;
    const fwFlapChordM = config.frontWing.flapChordMm / 1000;
    const fwAreaM2 = (fwSpanM * (fwMainChordM + fwFlapChordM * (config.frontWing.flapLengthPct / 100)));
    const fwFlapRad = (config.frontWing.flapAngleDeg * Math.PI) / 180;

    // Ground proximity factor (ride height sensitivity)
    const groundProximity = Math.max(0.7, Math.min(2.2, 90 / Math.max(30, config.frontWing.rideHeightMm)));
    const isFrontStalled = config.frontWing.flapAngleDeg > (config.frontWing.elementCount >= 2 ? 28 : 18);

    let fwCl = (0.75 + (config.frontWing.elementCount * 0.45) * Math.sin(fwFlapRad + 0.1) + (config.frontWing.gurneyHeightMm / 10) * 0.25) * groundProximity;
    if (isFrontStalled) fwCl *= 0.65;

    const fwAR = Math.pow(fwSpanM, 2) / Math.max(0.1, fwAreaM2);
    const fwCd = (0.035 + Math.pow(fwCl, 2) / (Math.PI * fwAR * 0.88) + (isFrontStalled ? 0.14 : 0.0)) * (config.frontWing.hasVortexGenerators ? 1.04 : 1.0);
    const fwDownforceN = q * fwAreaM2 * fwCl;
    const fwDragN = q * fwAreaM2 * fwCd;

    const frontWingBreakdown: ComponentAeroBreakdown = {
      name: 'Front Wing Assembly',
      downforceN: Math.round(fwDownforceN),
      dragN: Math.round(fwDragN),
      cl: Math.round(fwCl * 100) / 100,
      cd: Math.round(fwCd * 1000) / 1000,
      projectedAreaM2: Math.round(fwAreaM2 * 100) / 100,
      copXM: -2.25,
      copZM: config.frontWing.rideHeightMm / 1000,
      massKg: Math.round((fwAreaM2 * 7.2 + config.frontWing.elementCount * 2.1) * 10) / 10,
      costUSD: Math.round(fwAreaM2 * 3400 + config.frontWing.elementCount * 1200),
    };

    // ------------------------------------------------------------------------
    // 2. Canards / Dive Planes
    // ------------------------------------------------------------------------
    const canardCount = config.canards.tierCount;
    const canardAreaM2 = canardCount * 2 * ((config.canards.spanMm * config.canards.chordMm) / 1e6);
    const canardIncidenceRad = (config.canards.incidenceDeg * Math.PI) / 180;
    const canardCl = canardCount > 0 ? 0.85 * Math.sin(canardIncidenceRad * 1.8) * (config.canards.hasEndplateFence ? 1.25 : 1.0) : 0;
    const canardCd = canardCount > 0 ? 0.08 + Math.pow(canardCl, 2) / 3.0 : 0;
    const canardDownforceN = q * canardAreaM2 * canardCl;
    const canardDragN = q * canardAreaM2 * canardCd;

    const canardsBreakdown: ComponentAeroBreakdown = {
      name: 'Bumper Canard Array',
      downforceN: Math.round(canardDownforceN),
      dragN: Math.round(canardDragN),
      cl: Math.round(canardCl * 100) / 100,
      cd: Math.round(canardCd * 1000) / 1000,
      projectedAreaM2: Math.round(canardAreaM2 * 100) / 100,
      copXM: -1.95,
      copZM: 0.35,
      massKg: Math.round(canardCount * 1.4 * 10) / 10,
      costUSD: canardCount * 650,
    };

    // ------------------------------------------------------------------------
    // 3. Ground Effect Venturi Floor
    // ------------------------------------------------------------------------
    const floorLengthM = config.groundEffectFloor.floorLengthMm / 1000;
    const floorWidthM = config.groundEffectFloor.floorWidthMm / 1000;
    const floorAreaM2 = floorLengthM * floorWidthM;
    const throatHMm = config.groundEffectFloor.tunnelThroatHeightMm;
    const expRatio = config.groundEffectFloor.tunnelExpansionRatio;

    // Suction suction factor: 1 - 1/ER^2
    const idealSuctionCoeff = 1.0 - 1.0 / Math.pow(expRatio, 2);
    const sealFactor = 1.0 + (config.groundEffectFloor.edgeWingHeightMm / 50.0) * 0.35 + (config.groundEffectFloor.strakeCount * 0.06);
    const rideProximityGain = Math.max(0.6, Math.min(2.8, 48 / Math.max(15, throatHMm)));

    // Porpoising instability check
    const porpoisingRisk = throatHMm < 22 ? Math.min(95, (22 - throatHMm) * 12 + (config.groundEffectFloor.hasPorpoisingDamper ? 0 : 25)) : Math.max(5, (30 - throatHMm) * 2);

    let floorCl = idealSuctionCoeff * sealFactor * rideProximityGain * 0.95;
    if (porpoisingRisk > 60) floorCl *= 0.85; // Unsteady aerodynamic loss

    const floorCd = 0.042 + (floorCl * 0.045);
    const floorDownforceN = q * floorAreaM2 * floorCl;
    const floorDragN = q * floorAreaM2 * floorCd;

    const floorBreakdown: ComponentAeroBreakdown = {
      name: 'Venturi Underbody Floor',
      downforceN: Math.round(floorDownforceN),
      dragN: Math.round(floorDragN),
      cl: Math.round(floorCl * 100) / 100,
      cd: Math.round(floorCd * 1000) / 1000,
      projectedAreaM2: Math.round(floorAreaM2 * 100) / 100,
      copXM: -0.15,
      copZM: throatHMm / 1000,
      massKg: Math.round((floorAreaM2 * 5.4 + config.groundEffectFloor.strakeCount * 1.2) * 10) / 10,
      costUSD: Math.round(floorAreaM2 * 2200 + config.groundEffectFloor.strakeCount * 450),
    };

    // ------------------------------------------------------------------------
    // 4. Sidepods & Cooling Flow
    // ------------------------------------------------------------------------
    const spLengthM = config.sidepod.lengthMm / 1000;
    const spWidthM = config.sidepod.widthMm / 1000;
    const spAreaM2 = spLengthM * spWidthM * 2;
    const undercutGain = (config.sidepod.undercutDepthMm / 150) * 0.22;
    const downwashRad = (config.sidepod.downwashRampAngleDeg * Math.PI) / 180;

    const spCl = 0.18 + undercutGain + Math.sin(downwashRad) * 0.35;
    const coolingDragPenalty = (config.sidepod.inletAreaM2 / 0.2) * 0.038;
    const spCd = 0.055 + coolingDragPenalty + (config.sidepod.vortexFencesCount * 0.008);

    const spDownforceN = q * spAreaM2 * spCl;
    const spDragN = q * spAreaM2 * spCd;

    const sidepodsBreakdown: ComponentAeroBreakdown = {
      name: 'Sculpted Sidepod Aero Body',
      downforceN: Math.round(spDownforceN),
      dragN: Math.round(spDragN),
      cl: Math.round(spCl * 100) / 100,
      cd: Math.round(spCd * 1000) / 1000,
      projectedAreaM2: Math.round(spAreaM2 * 100) / 100,
      copXM: 0.10,
      copZM: 0.35,
      massKg: Math.round((spAreaM2 * 4.8 + config.sidepod.vortexFencesCount * 0.8) * 10) / 10,
      costUSD: Math.round(spAreaM2 * 1900 + config.sidepod.vortexFencesCount * 300),
    };

    // ------------------------------------------------------------------------
    // 5. Rear Diffuser
    // ------------------------------------------------------------------------
    const diffLengthM = config.diffuser.lengthMm / 1000;
    const diffWidthM = config.diffuser.widthMm / 1000;
    const diffAreaM2 = diffLengthM * diffWidthM;
    const diffRampRad = (config.diffuser.rampAngleDeg * Math.PI) / 180;

    // Boundary layer separation stall above 16.5 deg (or 19 deg with 4+ strakes)
    const stallLimitDeg = 15.0 + config.diffuser.strakeCount * 0.8;
    const isDiffStalled = config.diffuser.rampAngleDeg > stallLimitDeg;

    let diffCl = Math.sin(diffRampRad * 1.8) * (1.1 + config.diffuser.strakeCount * 0.08) + (config.diffuser.gurneyHeightMm / 10) * 0.18;
    if (isDiffStalled) {
      diffCl *= Math.max(0.45, 1.0 - (config.diffuser.rampAngleDeg - stallLimitDeg) * 0.08);
    }

    const diffCd = 0.038 + (isDiffStalled ? 0.16 : Math.pow(diffCl, 2) * 0.06);
    const diffDownforceN = q * diffAreaM2 * diffCl;
    const diffDragN = q * diffAreaM2 * diffCd;

    const diffuserBreakdown: ComponentAeroBreakdown = {
      name: 'Multi-Strake Rear Diffuser',
      downforceN: Math.round(diffDownforceN),
      dragN: Math.round(diffDragN),
      cl: Math.round(diffCl * 100) / 100,
      cd: Math.round(diffCd * 1000) / 1000,
      projectedAreaM2: Math.round(diffAreaM2 * 100) / 100,
      copXM: 1.45,
      copZM: 0.18,
      massKg: Math.round((diffAreaM2 * 6.2 + config.diffuser.strakeCount * 0.9) * 10) / 10,
      costUSD: Math.round(diffAreaM2 * 2600 + config.diffuser.strakeCount * 380),
    };

    // ------------------------------------------------------------------------
    // 6. Rear Wing Assembly
    // ------------------------------------------------------------------------
    const rwSpanM = config.rearWing.spanMm / 1000;
    const rwMainChordM = config.rearWing.mainChordMm / 1000;
    const rwFlapChordM = config.rearWing.flapChordMm / 1000;
    const rwAreaM2 = rwSpanM * (rwMainChordM + rwFlapChordM * 0.85);
    const rwAoaRad = (config.rearWing.angleOfAttackDeg * Math.PI) / 180;

    const isRearStalled = config.rearWing.angleOfAttackDeg > (config.rearWing.elementCount >= 2 ? 30 : 18);
    let rwCl = (0.95 + 2 * Math.PI * 0.16 * rwAoaRad + (config.rearWing.gurneyHeightMm / 10) * 0.28) * (config.rearWing.pylonType === 'swan_neck' ? 1.08 : 1.0);
    if (isRearStalled) rwCl *= 0.58;

    const rwAR = Math.pow(rwSpanM, 2) / Math.max(0.1, rwAreaM2);
    const rwInducedCd = Math.pow(rwCl, 2) / (Math.PI * rwAR * 0.85);
    const rwCd = 0.045 + rwInducedCd + (isRearStalled ? 0.22 : 0.0);

    const rwDownforceN = q * rwAreaM2 * rwCl;
    const rwDragN = q * rwAreaM2 * rwCd;

    const rearWingBreakdown: ComponentAeroBreakdown = {
      name: 'GT3 Multi-Element Rear Wing',
      downforceN: Math.round(rwDownforceN),
      dragN: Math.round(rwDragN),
      cl: Math.round(rwCl * 100) / 100,
      cd: Math.round(rwCd * 1000) / 1000,
      projectedAreaM2: Math.round(rwAreaM2 * 100) / 100,
      copXM: 1.85,
      copZM: config.rearWing.heightMm / 1000,
      massKg: Math.round((rwAreaM2 * 8.5 + (config.rearWing.pylonType === 'swan_neck' ? 3.8 : 2.5)) * 10) / 10,
      costUSD: Math.round(rwAreaM2 * 4500 + 1800),
    };

    // ------------------------------------------------------------------------
    // 7. Global Vehicle Aerodynamic Aggregation & Moments
    // ------------------------------------------------------------------------
    const components = [frontWingBreakdown, canardsBreakdown, floorBreakdown, sidepodsBreakdown, diffuserBreakdown, rearWingBreakdown];
    const totalDownforceN = components.reduce((acc, c) => acc + c.downforceN, 0);
    const totalDragN = components.reduce((acc, c) => acc + c.dragN, 0);

    // Front vs Rear distribution (Front axle is at X = -1.4m, Rear axle is at X = +1.4m; Wheelbase = 2.8m)
    const wheelbaseM = 2.8;
    const frontAxleXM = -1.4;
    const rearAxleXM = 1.4;

    let momentFrontSum = 0;
    components.forEach((c) => {
      // Fraction of force acting on front axle: (rearAxleXM - copXM) / wheelbaseM
      const frontLever = (rearAxleXM - c.copXM) / wheelbaseM;
      momentFrontSum += c.downforceN * frontLever;
    });

    const frontDownforceN = Math.max(0, Math.round(momentFrontSum));
    const rearDownforceN = Math.max(0, Math.round(totalDownforceN - frontDownforceN));
    const aeroBalanceFrontPct = totalDownforceN > 0 ? Math.round((frontDownforceN / totalDownforceN) * 1000) / 10 : 50.0;
    const aeroBalanceRearPct = Math.round((100 - aeroBalanceFrontPct) * 10) / 10;

    // Center of Pressure X relative to vehicle center (m)
    let copWeightedSum = 0;
    components.forEach((c) => {
      copWeightedSum += c.copXM * c.downforceN;
    });
    const copXM = totalDownforceN > 0 ? Math.round((copWeightedSum / totalDownforceN) * 100) / 100 : 0.0;

    const totalFrontalAreaM2 = 2.18;
    const totalCl = Math.round((totalDownforceN / (q * totalFrontalAreaM2)) * 100) / 100;
    const totalCd = Math.round((totalDragN / (q * totalFrontalAreaM2)) * 1000) / 1000;
    const lOverD = totalDragN > 0 ? Math.round((totalDownforceN / totalDragN) * 100) / 100 : 0.0;

    // ------------------------------------------------------------------------
    // 8. Vehicle Dynamics & Lap Simulation Coupling
    // ------------------------------------------------------------------------
    const vehicleMassKg = 1380 + components.reduce((acc, c) => acc + c.massKg, 0);
    const g = 9.81;
    const staticNormalForceN = vehicleMassKg * g;
    const totalNormalForceN = staticNormalForceN + totalDownforceN;

    // Tire load sensitivity friction coefficient: mu = mu0 * (1 - k * deltaFz / Fz0)
    const baseMu = 1.35;
    const tireLoadCoeff = Math.max(1.15, baseMu * (1 - 0.08 * (totalDownforceN / staticNormalForceN)));
    const lateralGAt200Kmh = Math.round(((totalNormalForceN * tireLoadCoeff) / (vehicleMassKg * g)) * 100) / 100;

    // Top Speed on 1.2km straight: Power equilibrium P = 0.5 * rho * Cd * A * v^3 + Crr * M * g * v
    const enginePowerWatts = 560000; // ~750 hp GT3 powertrain
    // Approximate top speed inversion
    const topSpeedMs = Math.pow(enginePowerWatts / (0.5 * rho * totalCd * totalFrontalAreaM2 + 0.015 * vehicleMassKg * g / 50), 1 / 3);
    const topSpeedKmh = Math.round((topSpeedMs * 3.6) * 10) / 10;

    // Lap Time Delta relative to baseline 100s reference circuit (e.g. 5.8km GP track)
    // Cornering grip savings: -2.8s per +0.1G lateral; Straight speed penalty: +0.45s per -10km/h
    const gripDelta = lateralGAt200Kmh - 1.45;
    const speedDelta = topSpeedKmh - 315.0;
    const lapTimeDeltaS = Math.round((-gripDelta * 2.8 - (speedDelta / 10.0) * 0.42) * 100) / 100;

    // Aero balance high-speed understeer gradient (deg / G)
    const understeerGradient = Math.round((50.0 - aeroBalanceFrontPct) * 0.12 * 100) / 100;
    const brakingStability = aeroBalanceFrontPct >= 42 && aeroBalanceFrontPct <= 54 ? 0.95 : 0.72;

    const totalAeroMassKg = Math.round(components.reduce((acc, c) => acc + c.massKg, 0) * 10) / 10;
    const totalAeroCostUSD = components.reduce((acc, c) => acc + c.costUSD, 0);

    return {
      airspeedKmh: config.airspeedKmh,
      totalDownforceN,
      frontDownforceN,
      rearDownforceN,
      aeroBalanceFrontPct,
      aeroBalanceRearPct,
      centerOfPressureXM: copXM,
      totalDragN,
      totalCl,
      totalCd,
      inducedDragN: Math.round(totalDragN * 0.48),
      profileDragN: Math.round(totalDragN * 0.38),
      coolingDragN: Math.round(totalDragN * 0.14),
      liftToDragRatio: lOverD,
      porpoisingRiskPct: Math.round(porpoisingRisk),
      isFrontWingStalled: isFrontStalled,
      isDiffuserStalled: isDiffStalled,
      isRearWingStalled: isRearStalled,
      components: {
        frontWing: frontWingBreakdown,
        canards: canardsBreakdown,
        floor: floorBreakdown,
        sidepods: sidepodsBreakdown,
        diffuser: diffuserBreakdown,
        rearWing: rearWingBreakdown,
      },
      lapSimulation: {
        lateralGAt200Kmh,
        topSpeedKmh,
        lapTimeDeltaS,
        brakingStabilityIndex: brakingStability,
        highSpeedUndersteerGradient: understeerGradient,
      },
      totalAeroMassKg,
      totalAeroCostUSD,
    };
  }
}
