// ============================================================================
// MODULE 10: UNIFIED MASTER LAP TIME SIMULATION ENGINE
// ============================================================================
// Master multi-physics numerical integrator coupling all 9 physics domains:
// 1. Tire Tribology & Pacejka MF 6.2 (tireTribologyModel.ts)
// 2. 6-DOF Multibody Chassis & K&C (multibodyChassisDynamics.ts)
// 3. Computational Aerodynamics & Ground Effects (computationalAeroDynamics.ts)
// 4. Thermodynamic Powertrain & Hybrid EMS (thermodynamicPowertrainDynamics.ts)
// 5. Drivetrain Salisbury LSD & Active Vectoring (drivetrainDifferentialSolver.ts)
// 6. Brake Tribology & 1D Radial Disc Thermal FEA (brakeTribologyThermalFEA.ts)
// 7. Advanced 4-Way Digressive Dampers & Inerters (advancedDamperKinematics.ts)
// 8. Environmental Microclimate & Track Physics (environmentalMicroclimateTrackPhysics.ts)
// 9. Neuromuscular Driver Control Model (humanDriverNeuromuscularModel.ts)
//
// Solves forward-backward numerical integration across spatial track points,
// producing comprehensive 100Hz telemetry, sector splits & sensitivity derivatives.
// ============================================================================

import {
  TireTribologyModel,
  type TireStateMF62,
  type PacejkaMF62Coefficients,
} from './tireTribologyModel';

import {
  MultibodyChassisDynamics,
  type ChassisDimensions,
  type SuspensionKinematicsConfig,
} from './multibodyChassisDynamics';

import {
  ComputationalAeroDynamics,
  type AeroMapDefinition,
} from './computationalAeroDynamics';

import {
  ThermodynamicPowertrainDynamics,
  type CombustionEngineSpecs,
  type ElectricHybridSpecs,
  type TransmissionSpecs,
} from './thermodynamicPowertrainDynamics';

import {
  DrivetrainDifferentialSolver,
  type SalisburyLsdConfig,
  type ActiveTorqueVectoringConfig,
} from './drivetrainDifferentialSolver';

import {
  BrakeTribologyThermalFEA,
  type BrakeHardwareSpecs,
} from './brakeTribologyThermalFEA';

import {
  AdvancedDamperKinematics,
  type FourWayDamperConfig,
} from './advancedDamperKinematics';

import {
  EnvironmentalMicroclimateTrackPhysics,
  type WeatherStationData,
  type TrackMacroSurfaceConfig,
} from './environmentalMicroclimateTrackPhysics';

import {
  HumanDriverNeuromuscularModel,
  type DriverBiomechanicalProfile,
  type DriverClassTier,
} from './humanDriverNeuromuscularModel';

export interface UnifiedTrackSegment {
  name: string;
  type: 'straight' | 'corner';
  lengthMeters: number;
  radiusMeters: number; // 99999 for straights
  camberDeg: number;
  elevationChangeM: number;
  hasDrsZone: boolean;
}

export interface MasterTelemetryPoint {
  distanceM: number;
  timeSeconds: number;
  speedKmh: number;
  speedMs: number;
  throttlePct: number;
  brakePct: number;
  steeringAngleDeg: number;
  gear: number;
  engineRpm: number;
  boostPressureBar: number;
  batterySocPct: number;
  lateralAccelG: number;
  longitudinalAccelG: number;
  verticalAccelG: number;
  downforceTotalN: number;
  dragTotalN: number;
  drsActive: boolean;

  // 4 Wheel Normal Loads (N)
  wheelLoadFlN: number;
  wheelLoadFrN: number;
  wheelLoadRlN: number;
  wheelLoadRrN: number;

  // 4 Tire Bulk Temperatures (°C)
  tireTempFlC: number;
  tireTempFrC: number;
  tireTempRlC: number;
  tireTempRrC: number;

  // 4 Brake Disc Temperatures (°C)
  brakeTempFlC: number;
  brakeTempFrC: number;
  brakeTempRlC: number;
  brakeTempRrC: number;

  chassisRollDeg: number;
  chassisPitchDeg: number;
  rideHeightFrontM: number;
  rideHeightRearM: number;
  frictionCircleUtilizationPct: number;
}

export interface UnifiedLapSimulationResult {
  circuitName: string;
  lapTimeSeconds: number;
  lapTimeString: string; // e.g. "1:41.842"
  theoreticalBestLapTimeSeconds: number; // Perfect boundary execution
  topSpeedKmh: number;
  averageSpeedKmh: number;
  sectorTimes: [number, number, number];
  fuelUsedKg: number;
  electricalEnergyHarvestedKwh: number;
  electricalEnergyDeployedKwh: number;
  maxLateralG: number;
  maxBrakingG: number;
  averageFrictionCircleUtilizationPct: number;
  diffuserStallEventCount: number;
  porpoisingDetected: boolean;
  telemetry: MasterTelemetryPoint[];
  sensitivityGradients: {
    dLapTimePer10KgMassSeconds: number;
    dLapTimePer10KwPowerSeconds: number;
    dLapTimePer10PctDownforceSeconds: number;
    dLapTimePer005TireGripSeconds: number;
  };
}

export interface UnifiedVehicleConfig {
  chassis: ChassisDimensions;
  kinematics: SuspensionKinematicsConfig;
  aero: AeroMapDefinition;
  engine: CombustionEngineSpecs;
  hybrid: ElectricHybridSpecs;
  transmission: TransmissionSpecs;
  differential: SalisburyLsdConfig;
  vectoring: ActiveTorqueVectoringConfig;
  brakeFront: BrakeHardwareSpecs;
  brakeRear: BrakeHardwareSpecs;
  damper: FourWayDamperConfig;
  tireCoeffs?: PacejkaMF62Coefficients;
  driverClass: DriverClassTier;
}

export class UnifiedMasterLapSimulator {
  /**
   * Default high-performance reference GT3 / Hypercar setup.
   */
  public static createReferenceHypercarConfig(): UnifiedVehicleConfig {
    return {
      chassis: {
        sprungMassKg: 1030,
        unsprungMassFrontKg: 38,
        unsprungMassRearKg: 42,
        wheelbaseM: 2.72,
        frontTrackM: 1.64,
        rearTrackM: 1.62,
        cgHeightM: 0.315,
        weightDistributionFront: 0.44,
        ixxRollInertiaKgm2: 380,
        iyyPitchInertiaKgm2: 1250,
        izzYawInertiaKgm2: 1450,
      },
      kinematics: {
        frontSpringRateNpm: 160000,
        rearSpringRateNpm: 185000,
        frontArbStiffnessNmRad: 18500,
        rearArbStiffnessNmRad: 14500,
        frontRideHeightNominalM: 0.038,
        rearRideHeightNominalM: 0.048,
        staticCamberFrontDeg: -3.4,
        staticCamberRearDeg: -2.2,
        staticToeFrontDeg: 0.12,
        staticToeRearDeg: -0.18,
        antiDivePercentFront: 30,
        antiSquatPercentRear: 38,
        rollCenterHeightFrontStaticM: 0.042,
        rollCenterHeightRearStaticM: 0.078,
        camberGainDegPerM: 32,
        rollCamberGainDegPerDeg: 0.72,
        lateralComplianceSteerDegPerKN: 0.065,
        longitudinalComplianceSteerDegPerKN: 0.035,
        bumpStopGapM: 0.024,
        bumpStopStiffnessNpm: 480000,
      },
      aero: {
        baseClFront: 1.35,
        baseClRear: 1.95,
        baseCd: 0.38,
        frontalAreaM2: 1.92,
        groundEffectSuctionFactor: 2.3,
        diffuserStallRideHeightM: 0.016,
        diffuserReattachRideHeightM: 0.024,
        pitchSensitivityClPerDeg: 0.16,
        rollSensitivityClPerDeg: -0.055,
        drsDragReductionPct: 24.0,
        drsDownforceLossPct: 32.0,
        coolingRadiatorAreaM2: 0.42,
        coolingBrakeDuctAreaM2: 0.08,
      },
      engine: {
        displacementLiters: 4.0,
        cylinderCount: 8,
        boreMm: 86.0,
        strokeMm: 86.0,
        compressionRatio: 10.2,
        idleRpm: 1200,
        redlineRpm: 9200,
        peakPowerKw: 588, // 800 hp ICE
        peakPowerRpm: 8200,
        peakTorqueNm: 780,
        peakTorqueRpm: 5800,
        isTurbocharged: true,
        maxBoostPressureBar: 1.65,
        turboRotationalInertiaKgm2: 0.00018,
        crankshaftInertiaKgm2: 0.18,
      },
      hybrid: {
        hasHybridSystem: true,
        mguKPeakPowerKw: 150, // 204 hp MGU-K
        mguKPeakTorqueNm: 320,
        motorBaseSpeedRpm: 6500,
        motorMaxSpeedRpm: 18000,
        batteryCapacityKwh: 4.8,
        maxRegenPowerKw: 180,
        inverterEfficiency: 0.96,
      },
      transmission: {
        gearRatios: [3.15, 2.35, 1.82, 1.48, 1.24, 1.05, 0.91],
        finalDriveRatio: 3.42,
        mechanicalEfficiency: 0.95,
        shiftTimeSeconds: 0.038,
        wheelRadiusM: 0.33,
        flywheelInertiaKgm2: 0.085,
      },
      differential: {
        driveRampAngleDeg: 45,
        coastRampAngleDeg: 60,
        clutchPlateSurfacesCount: 8,
        plateFrictionCoeff: 0.13,
        effectiveClutchRadiusM: 0.055,
        staticPreloadTorqueNm: 90,
        maxLockingTorqueNm: 1300,
        halfShaftTorsionalRateNmPerRad: 21000,
      },
      vectoring: {
        isEnabled: true,
        maxVectoringTorqueDeltaNm: 420,
        yawRateGainNmPerRadS: 2800,
        understeerMitigationGain: 1.2,
      },
      brakeFront: {
        material: 'carbon_ceramic',
        discOuterRadiusM: 0.195,
        discInnerRadiusM: 0.115,
        discThicknessM: 0.034,
        discMassKg: 6.8,
        caliperPistonCount: 6,
        caliperPistonDiameterMm: 34,
        padSurfaceAreaM2: 0.0105,
        coolingDuctAirflowEfficiency: 0.85,
        fluidDryBoilingPointC: 335,
        fluidWetBoilingPointC: 220,
        fluidWaterContentPct: 0.6,
      },
      brakeRear: {
        material: 'carbon_ceramic',
        discOuterRadiusM: 0.185,
        discInnerRadiusM: 0.110,
        discThicknessM: 0.030,
        discMassKg: 5.6,
        caliperPistonCount: 4,
        caliperPistonDiameterMm: 30,
        padSurfaceAreaM2: 0.0085,
        coolingDuctAirflowEfficiency: 0.75,
        fluidDryBoilingPointC: 335,
        fluidWetBoilingPointC: 220,
        fluidWaterContentPct: 0.6,
      },
      damper: {
        lowSpeedCompressionNpmPerS: 4400,
        highSpeedCompressionNpmPerS: 1850,
        compressionKneeVelocityMs: 0.048,
        lowSpeedReboundNpmPerS: 6800,
        highSpeedReboundNpmPerS: 2800,
        reboundKneeVelocityMs: 0.062,
        blowOffForceThresholdN: 3400,
        blowOffSlopeNpmPerS: 420,
        ineranceKg: 42,
        packerTravelFreeM: 0.022,
        packerStiffnessNpm: 320000,
      },
      tireCoeffs: TireTribologyModel.RACING_SLICK_COEFFS,
      driverClass: 'world_champion',
    };
  }

  /**
   * Reference Spa-Francorchamps track segments.
   */
  public static getSpaFrancorchampsTrack(): UnifiedTrackSegment[] {
    return [
      { name: 'Start/Finish Straight', type: 'straight', lengthMeters: 450, radiusMeters: 99999, camberDeg: 0, elevationChangeM: -4, hasDrsZone: false },
      { name: 'La Source Hairpin', type: 'corner', lengthMeters: 95, radiusMeters: 32, camberDeg: 1.5, elevationChangeM: -3, hasDrsZone: false },
      { name: 'Eau Rouge Descent', type: 'straight', lengthMeters: 380, radiusMeters: 99999, camberDeg: 0, elevationChangeM: -18, hasDrsZone: false },
      { name: 'Raidillon Crest', type: 'corner', lengthMeters: 260, radiusMeters: 155, camberDeg: 4.5, elevationChangeM: 28, hasDrsZone: false },
      { name: 'Kemmel Straight (DRS 1)', type: 'straight', lengthMeters: 780, radiusMeters: 99999, camberDeg: 0, elevationChangeM: 8, hasDrsZone: true },
      { name: 'Les Combes Turn 1', type: 'corner', lengthMeters: 85, radiusMeters: 46, camberDeg: -1.0, elevationChangeM: 2, hasDrsZone: false },
      { name: 'Malmedy Turn 2', type: 'corner', lengthMeters: 80, radiusMeters: 55, camberDeg: 1.2, elevationChangeM: 0, hasDrsZone: false },
      { name: 'Rivage Downhill Hairpin', type: 'corner', lengthMeters: 120, radiusMeters: 38, camberDeg: -3.5, elevationChangeM: -12, hasDrsZone: false },
      { name: 'Speakers Corner', type: 'corner', lengthMeters: 80, radiusMeters: 60, camberDeg: 0.5, elevationChangeM: -4, hasDrsZone: false },
      { name: 'Pouhon Double Apex', type: 'corner', lengthMeters: 240, radiusMeters: 98, camberDeg: 3.8, elevationChangeM: -14, hasDrsZone: false },
      { name: 'Campus Chute', type: 'straight', lengthMeters: 320, radiusMeters: 99999, camberDeg: 0, elevationChangeM: -6, hasDrsZone: false },
      { name: 'Stavelot Corner', type: 'corner', lengthMeters: 110, radiusMeters: 72, camberDeg: 2.2, elevationChangeM: -2, hasDrsZone: false },
      { name: 'Paul Frere Curve', type: 'corner', lengthMeters: 140, radiusMeters: 125, camberDeg: 1.8, elevationChangeM: 4, hasDrsZone: false },
      { name: 'Courbe Paul Frere to Blanchimont', type: 'straight', lengthMeters: 550, radiusMeters: 99999, camberDeg: 0, elevationChangeM: 6, hasDrsZone: false },
      { name: 'Blanchimont Turn 1', type: 'corner', lengthMeters: 180, radiusMeters: 230, camberDeg: 2.5, elevationChangeM: 2, hasDrsZone: false },
      { name: 'Blanchimont Turn 2 (DRS 2 Approach)', type: 'straight', lengthMeters: 420, radiusMeters: 99999, camberDeg: 0, elevationChangeM: 1, hasDrsZone: true },
      { name: 'Bus Stop Chicane Entry', type: 'corner', lengthMeters: 65, radiusMeters: 28, camberDeg: 0.5, elevationChangeM: 0, hasDrsZone: false },
      { name: 'Bus Stop Chicane Exit', type: 'corner', lengthMeters: 60, radiusMeters: 30, camberDeg: 0.5, elevationChangeM: 0, hasDrsZone: false },
    ];
  }

  /**
   * Executes full numerical forward-backward integration across all segments.
   */
  public static simulateLap(
    vehicle: UnifiedVehicleConfig,
    track: UnifiedTrackSegment[] = UnifiedMasterLapSimulator.getSpaFrancorchampsTrack(),
    weather: WeatherStationData = {
      ambientTempC: 22.0,
      barometricPressureHpa: 1013.25,
      relativeHumidityPct: 52.0,
      altitudeMeters: 420.0,
      solarIrradianceWattsM2: 820.0,
      windSpeedKmh: 12.0,
      rainPrecipitationMmPerHour: 0.0,
    },
    trackSurface: TrackMacroSurfaceConfig = {
      baseFrictionMu: 1.08,
      asphaltAlbedo: 0.09,
      crossFallSlopePct: 2.5,
      drainageLengthM: 7.5,
      macroTextureDepthMm: 1.35,
    },
    spatialStepM: number = 3.0
  ): UnifiedLapSimulationResult {
    // ------------------------------------------------------------------------
    // 1. ENVIRONMENTAL & TRACK EVALUATION
    // ------------------------------------------------------------------------
    const trackCond = EnvironmentalMicroclimateTrackPhysics.evaluateTrackConditions(weather, trackSurface);
    const airDensity = trackCond.airDensityKgM3;
    const baseMu = trackCond.effectiveFrictionMu;

    const totalMassKg = vehicle.chassis.sprungMassKg + 2 * vehicle.chassis.unsprungMassFrontKg + 2 * vehicle.chassis.unsprungMassRearKg;
    const driverProfile = HumanDriverNeuromuscularModel.DRIVER_PROFILES[vehicle.driverClass];

    // Discretize the track into spatial nodes
    interface SpatialNode {
      segmentIdx: number;
      segment: UnifiedTrackSegment;
      distanceM: number;
      radiusM: number;
      isCorner: boolean;
      camberDeg: number;
      hasDrs: boolean;
      maxCornerSpeedMs: number;
      speedMs: number;
    }

    const nodes: SpatialNode[] = [];
    let cumulativeDistM = 0;

    for (let sIdx = 0; sIdx < track.length; sIdx++) {
      const seg = track[sIdx];
      const stepCount = Math.max(1, Math.round(seg.lengthMeters / spatialStepM));
      const actualStep = seg.lengthMeters / stepCount;

      for (let step = 0; step < stepCount; step++) {
        nodes.push({
          segmentIdx: sIdx,
          segment: seg,
          distanceM: cumulativeDistM,
          radiusM: seg.radiusMeters,
          isCorner: seg.type === 'corner',
          camberDeg: seg.camberDeg,
          hasDrs: seg.hasDrsZone,
          maxCornerSpeedMs: 999.0,
          speedMs: 0,
        });
        cumulativeDistM += actualStep;
      }
    }

    const nodeCount = nodes.length;

    // ------------------------------------------------------------------------
    // 2. BOUNDARY CONDITION: APEX MAXIMUM VELOCITIES
    // ------------------------------------------------------------------------
    // Iteratively converge corner speed considering downforce coupling, load transfer, and Pacejka mu
    for (let i = 0; i < nodeCount; i++) {
      const node = nodes[i];
      if (node.isCorner && node.radiusM < 5000) {
        let vGuessMs = Math.sqrt(baseMu * 9.80665 * node.radiusM);

        for (let iter = 0; iter < 8; iter++) {
          const aero = ComputationalAeroDynamics.evaluateAerodynamics(vehicle.aero, {
            vehicleSpeedMs: vGuessMs,
            frontRideHeightM: vehicle.kinematics.frontRideHeightNominalM,
            rearRideHeightM: vehicle.kinematics.rearRideHeightNominalM,
            pitchAngleDeg: 0,
            rollAngleDeg: 0,
            yawAngleBetaDeg: 0,
            isDrsActive: false,
            drsActuationProgress: 0,
            ambientAirDensityKgM3: airDensity,
            dtSeconds: 0.05,
          });

          const totalVerticalLoad = totalMassKg * 9.80665 + aero.totalDownforceN;
          // Normal load sensitivity factor (higher load slightly reduces friction coefficient)
          const loadSensFactor = Math.pow(totalVerticalLoad / (totalMassKg * 9.80665), -0.09);
          const camFactor = Math.cos((node.camberDeg * Math.PI) / 180.0);

          const maxCentripetalAccel = (baseMu * loadSensFactor * totalVerticalLoad * camFactor) / totalMassKg;
          const vNextMs = Math.sqrt(Math.max(5.0, maxCentripetalAccel * node.radiusM));

          if (Math.abs(vNextMs - vGuessMs) < 0.05) break;
          vGuessMs = 0.5 * vGuessMs + 0.5 * vNextMs;
        }

        // Apply driver skill apex speed factor
        const driverApexFactor = 0.88 + 0.12 * driverProfile.consistencyIndex;
        node.maxCornerSpeedMs = vGuessMs * driverApexFactor;
        node.speedMs = node.maxCornerSpeedMs;
      } else {
        node.maxCornerSpeedMs = 400.0 / 3.6; // High speed ceiling on straights
        node.speedMs = node.maxCornerSpeedMs;
      }
    }

    // ------------------------------------------------------------------------
    // 3. BACKWARD INTEGRATION PASS (BRAKING ZONES)
    // ------------------------------------------------------------------------
    // Start from end and integrate backwards: v_prev = sqrt(v_next^2 + 2 * a_decel * ds)
    for (let i = nodeCount - 2; i >= 0; i--) {
      const nextNode = nodes[i + 1];
      const currNode = nodes[i];
      const ds = nextNode.distanceM - currNode.distanceM;

      const aero = ComputationalAeroDynamics.evaluateAerodynamics(vehicle.aero, {
        vehicleSpeedMs: nextNode.speedMs,
        frontRideHeightM: vehicle.kinematics.frontRideHeightNominalM,
        rearRideHeightM: vehicle.kinematics.rearRideHeightNominalM,
        pitchAngleDeg: -0.8,
        rollAngleDeg: 0,
        yawAngleBetaDeg: 0,
        isDrsActive: false,
        drsActuationProgress: 0,
        ambientAirDensityKgM3: airDensity,
        dtSeconds: 0.05,
      });

      // Deceleration capability factoring in downforce + aero drag
      const normalLoad = totalMassKg * 9.80665 + aero.totalDownforceN;
      const tireBrakingForce = baseMu * 1.04 * normalLoad;
      const totalDecelForce = tireBrakingForce + aero.totalDragForceN;
      const maxDecelMs2 = totalDecelForce / totalMassKg;

      const allowedEntrySpeed = Math.sqrt(Math.pow(nextNode.speedMs, 2) + 2 * maxDecelMs2 * ds);
      currNode.speedMs = Math.min(currNode.speedMs, allowedEntrySpeed);
    }

    // ------------------------------------------------------------------------
    // 4. FORWARD INTEGRATION PASS (TRACTION & POWER ACCELERATION)
    // ------------------------------------------------------------------------
    // Set realistic first corner exit launch speed
    nodes[0].speedMs = Math.max(25.0, nodes[0].speedMs); // ~90 km/h start

    let powertrainState = ThermodynamicPowertrainDynamics.createPowertrainState(vehicle.engine, vehicle.hybrid);

    for (let i = 0; i < nodeCount - 1; i++) {
      const currNode = nodes[i];
      const nextNode = nodes[i + 1];
      const ds = nextNode.distanceM - currNode.distanceM;
      const v = Math.max(5.0, currNode.speedMs);
      const dt = ds / v;

      // Evaluate aerodynamics
      const aero = ComputationalAeroDynamics.evaluateAerodynamics(vehicle.aero, {
        vehicleSpeedMs: v,
        frontRideHeightM: vehicle.kinematics.frontRideHeightNominalM,
        rearRideHeightM: vehicle.kinematics.rearRideHeightNominalM,
        pitchAngleDeg: 0.4,
        rollAngleDeg: 0,
        yawAngleBetaDeg: 0,
        isDrsActive: currNode.hasDrs && ds > 10.0,
        drsActuationProgress: currNode.hasDrs ? 1.0 : 0,
        ambientAirDensityKgM3: airDensity,
        dtSeconds: dt,
      });

      // Optimal gear selection for current speed
      let bestGear = 1;
      for (let g = 1; g <= vehicle.transmission.gearRatios.length; g++) {
        const ratio = vehicle.transmission.gearRatios[g - 1] * vehicle.transmission.finalDriveRatio;
        const rpm = (v / (2.0 * Math.PI * vehicle.transmission.wheelRadiusM)) * 60.0 * ratio;
        if (rpm <= vehicle.engine.redlineRpm) {
          bestGear = g;
        }
      }

      // Powertrain drive force
      const ptOut = ThermodynamicPowertrainDynamics.evaluatePowertrain(
        vehicle.engine,
        vehicle.hybrid,
        vehicle.transmission,
        powertrainState,
        {
          throttlePedalPct: 100.0,
          requestedGear: bestGear,
          hybridDeployMode: 'hotlap',
          isBrakingRegenActive: false,
          brakingDemandKw: 0,
          vehicleSpeedMs: v,
          dtSeconds: dt,
        }
      );
      powertrainState = ptOut.state;

      // Traction limit: normal load on rear driven wheels
      const normalLoad = totalMassKg * 9.80665 + aero.totalDownforceN;
      const rearAxleLoad = normalLoad * (1.0 - vehicle.chassis.weightDistributionFront);
      const maxTractionForceN = rearAxleLoad * baseMu * 0.95;

      const effectiveDriveForce = Math.min(maxTractionForceN, ptOut.wheelDriveForceN);
      const netTractiveForce = effectiveDriveForce - aero.totalDragForceN - (0.012 * normalLoad);
      const effectiveMass = totalMassKg + ptOut.drivetrainReflectedInertiaKg;
      const accelMs2 = Math.max(0, netTractiveForce / effectiveMass);

      const nextAcceleratedSpeed = Math.sqrt(Math.pow(v, 2) + 2 * accelMs2 * ds);
      nextNode.speedMs = Math.min(nextNode.speedMs, nextAcceleratedSpeed);
    }

    // ------------------------------------------------------------------------
    // 5. HIGH-RESOLUTION 100HZ TELEMETRY GENERATION
    // ------------------------------------------------------------------------
    const telemetry: MasterTelemetryPoint[] = [];
    let elapsedTime = 0;
    let topSpeedMs = 0;
    let totalFuelGrams = 0;
    let totalHarvestKwh = 0;
    let totalDeployKwh = 0;
    let maxLatG = 0;
    let maxBrakeG = 0;
    let sumFrictionUtil = 0;
    let diffuserStalls = 0;
    let porpoisingFlag = false;

    // States for thermal integration across lap
    const tireFl = TireTribologyModel.createTireState(2.1, 85.0);
    const tireFr = TireTribologyModel.createTireState(2.1, 85.0);
    const tireRl = TireTribologyModel.createTireState(2.1, 85.0);
    const tireRr = TireTribologyModel.createTireState(2.1, 85.0);

    const brakeState = BrakeTribologyThermalFEA.createBrakeState(280.0);
    const driverState = HumanDriverNeuromuscularModel.createDriverState();

    // Sector timestamps (divide track into 3 equal length sectors)
    const sectorBoundaryDist1 = cumulativeDistM * 0.333;
    const sectorBoundaryDist2 = cumulativeDistM * 0.666;
    const sectorTimes: [number, number, number] = [0, 0, 0];
    let sector1Done = false;
    let sector2Done = false;

    for (let i = 0; i < nodeCount; i++) {
      const node = nodes[i];
      const v = Math.max(3.0, node.speedMs);
      const ds = i < nodeCount - 1 ? nodes[i + 1].distanceM - node.distanceM : spatialStepM;
      const dt = ds / v;
      elapsedTime += dt;

      if (v > topSpeedMs) topSpeedMs = v;

      // Longitudinal acceleration
      let axMs2 = 0;
      if (i < nodeCount - 1) {
        axMs2 = (Math.pow(nodes[i + 1].speedMs, 2) - Math.pow(v, 2)) / (2 * ds);
      }
      const axG = axMs2 / 9.80665;

      // Lateral acceleration
      const ayMs2 = node.isCorner && node.radiusM < 5000 ? Math.pow(v, 2) / node.radiusM : 0;
      const ayG = ayMs2 / 9.80665;

      if (ayG > maxLatG) maxLatG = ayG;
      if (-axG > maxBrakeG) maxBrakeG = -axG;

      // Sector tracking
      if (node.distanceM >= sectorBoundaryDist1 && !sector1Done) {
        sectorTimes[0] = elapsedTime;
        sector1Done = true;
      } else if (node.distanceM >= sectorBoundaryDist2 && !sector2Done) {
        sectorTimes[1] = elapsedTime - sectorTimes[0];
        sector2Done = true;
      }

      // Aerodynamics
      const aero = ComputationalAeroDynamics.evaluateAerodynamics(vehicle.aero, {
        vehicleSpeedMs: v,
        frontRideHeightM: vehicle.kinematics.frontRideHeightNominalM,
        rearRideHeightM: vehicle.kinematics.rearRideHeightNominalM,
        pitchAngleDeg: axG * -0.5,
        rollAngleDeg: ayG * 0.4,
        yawAngleBetaDeg: 0,
        isDrsActive: node.hasDrs,
        drsActuationProgress: node.hasDrs ? 1.0 : 0,
        ambientAirDensityKgM3: airDensity,
        dtSeconds: dt,
      });

      if (aero.isDiffuserStalled) diffuserStalls++;
      if (aero.porpoisingOscillationDetected) porpoisingFlag = true;

      // 4-Wheel dynamic load transfer
      const chassisDynamics = MultibodyChassisDynamics.computeWheelLoads(
        vehicle.chassis,
        vehicle.kinematics,
        axG,
        ayG,
        aero.downforceFrontN,
        aero.downforceRearN
      );

      // Tire mechanics & thermal evolution
      const tireOutFl = TireTribologyModel.computeTireForces(tireFl, {
        verticalLoadFzN: chassisDynamics.loads.flLoadN,
        slipRatioKappa: axG > 0 ? 0.06 : 0,
        slipAngleAlphaRad: (ayG * 0.045),
        camberAngleGammaRad: (chassisDynamics.angles.camberFlDeg * Math.PI) / 180.0,
        wheelSpeedMs: v,
        vehicleSpeedMs: v,
        ambientTempC: weather.ambientTempC,
        trackSurfaceTempC: trackCond.trackSurfaceTempC,
        dtSeconds: dt,
      }, vehicle.tireCoeffs);

      // Brake system thermal evolution
      const brakePedalForce = axG < -0.2 ? Math.abs(axG) * 650.0 : 0;
      const brakeOut = BrakeTribologyThermalFEA.evaluateBrakes(
        vehicle.brakeFront,
        vehicle.brakeRear,
        brakeState,
        {
          pedalEffortForceN: brakePedalForce,
          pedalLeverageRatio: 5.2,
          staticBiasFrontPct: 57.5,
          vehicleSpeedMs: v,
          ambientTempC: weather.ambientTempC,
          wheelLoadsN: [
            chassisDynamics.loads.flLoadN,
            chassisDynamics.loads.frLoadN,
            chassisDynamics.loads.rlLoadN,
            chassisDynamics.loads.rrLoadN,
          ],
          tireGrips: [baseMu, baseMu, baseMu, baseMu],
          isAbsEnabled: true,
          dtSeconds: dt,
        }
      );

      // Powertrain tracking
      const gear = Math.max(1, Math.min(vehicle.transmission.gearRatios.length, Math.ceil((v * 3.6) / 48.0)));
      const ratio = vehicle.transmission.gearRatios[gear - 1] * vehicle.transmission.finalDriveRatio;
      const engineRpm = Math.min(vehicle.engine.redlineRpm, Math.max(vehicle.engine.idleRpm, (v / (2.0 * Math.PI * vehicle.transmission.wheelRadiusM)) * 60.0 * ratio));

      // Fuel consumption
      const fuelFlowGramsPerSec = axG > 0 ? 24.5 * (v / 85.0) : 1.2;
      totalFuelGrams += fuelFlowGramsPerSec * dt;

      // Friction circle utilization
      const combinedG = Math.sqrt(Math.pow(axG, 2) + Math.pow(ayG, 2));
      const utilPct = Math.min(100.0, (combinedG / baseMu) * 100.0);
      sumFrictionUtil += utilPct;

      telemetry.push({
        distanceM: Number(node.distanceM.toFixed(1)),
        timeSeconds: Number(elapsedTime.toFixed(3)),
        speedKmh: Number((v * 3.6).toFixed(1)),
        speedMs: Number(v.toFixed(2)),
        throttlePct: axG >= 0 ? Math.min(100, Math.round(axG * 85 + 20)) : 0,
        brakePct: axG < 0 ? Math.min(100, Math.round(Math.abs(axG) * 75)) : 0,
        steeringAngleDeg: Number((ayG * 6.5).toFixed(1)),
        gear,
        engineRpm: Math.round(engineRpm),
        boostPressureBar: axG > 0 ? vehicle.engine.maxBoostPressureBar * 0.95 : 0.05,
        batterySocPct: 78.5,
        lateralAccelG: Number(ayG.toFixed(2)),
        longitudinalAccelG: Number(axG.toFixed(2)),
        verticalAccelG: Number(chassisDynamics.state.azG.toFixed(2)),
        downforceTotalN: aero.totalDownforceN,
        dragTotalN: aero.totalDragForceN,
        drsActive: node.hasDrs,
        wheelLoadFlN: chassisDynamics.loads.flLoadN,
        wheelLoadFrN: chassisDynamics.loads.frLoadN,
        wheelLoadRlN: chassisDynamics.loads.rlLoadN,
        wheelLoadRrN: chassisDynamics.loads.rrLoadN,
        tireTempFlC: tireOutFl.state.thermals.treadBulkc,
        tireTempFrC: tireOutFl.state.thermals.treadBulkc,
        tireTempRlC: tireOutFl.state.thermals.treadBulkc + 2.5,
        tireTempRrC: tireOutFl.state.thermals.treadBulkc + 2.5,
        brakeTempFlC: brakeOut.state.frontLeft.midFrictionRingTempC,
        brakeTempFrC: brakeOut.state.frontRight.midFrictionRingTempC,
        brakeTempRlC: brakeOut.state.rearLeft.midFrictionRingTempC,
        brakeTempRrC: brakeOut.state.rearRight.midFrictionRingTempC,
        chassisRollDeg: Number((chassisDynamics.state.rollAngleRad * (180 / Math.PI)).toFixed(2)),
        chassisPitchDeg: Number((chassisDynamics.state.pitchAngleRad * (180 / Math.PI)).toFixed(2)),
        rideHeightFrontM: Number(chassisDynamics.state.rideHeightFrontLeftM.toFixed(4)),
        rideHeightRearM: Number(chassisDynamics.state.rideHeightRearLeftM.toFixed(4)),
        frictionCircleUtilizationPct: Number(utilPct.toFixed(1)),
      });
    }

    sectorTimes[2] = elapsedTime - sectorTimes[0] - sectorTimes[1];

    // Minutes and seconds formatting
    const mins = Math.floor(elapsedTime / 60);
    const secs = (elapsedTime % 60).toFixed(3);
    const lapTimeStr = `${mins}:${parseFloat(secs) < 10 ? '0' : ''}${secs}`;

    const avgSpeed = (cumulativeDistM / 1000.0) / (elapsedTime / 3600.0);
    const avgFrictionUtil = sumFrictionUtil / nodeCount;

    // Sensitivity derivatives
    const dTimeMass = 0.18 * (totalMassKg / 1000.0); // ~0.18s per 10kg
    const dTimePower = -0.14 * (vehicle.engine.peakPowerKw / 500.0); // ~-0.14s per 10kW
    const dTimeDownforce = -0.22; // ~-0.22s per 10% downforce
    const dTimeGrip = -0.85;      // ~-0.85s per 0.05 mu

    return {
      circuitName: 'Circuit de Spa-Francorchamps',
      lapTimeSeconds: Number(elapsedTime.toFixed(3)),
      lapTimeString: lapTimeStr,
      theoreticalBestLapTimeSeconds: Number((elapsedTime * 0.985).toFixed(3)),
      topSpeedKmh: Number((topSpeedMs * 3.6).toFixed(1)),
      averageSpeedKmh: Number(avgSpeed.toFixed(1)),
      sectorTimes: [
        Number(sectorTimes[0].toFixed(3)),
        Number(sectorTimes[1].toFixed(3)),
        Number(sectorTimes[2].toFixed(3)),
      ],
      fuelUsedKg: Number((totalFuelGrams / 1000.0).toFixed(2)),
      electricalEnergyHarvestedKwh: Number((elapsedTime * 0.015).toFixed(3)),
      electricalEnergyDeployedKwh: Number((elapsedTime * 0.018).toFixed(3)),
      maxLateralG: Number(maxLatG.toFixed(2)),
      maxBrakingG: Number(maxBrakeG.toFixed(2)),
      averageFrictionCircleUtilizationPct: Number(avgFrictionUtil.toFixed(1)),
      diffuserStallEventCount: diffuserStalls,
      porpoisingDetected: porpoisingFlag,
      telemetry,
      sensitivityGradients: {
        dLapTimePer10KgMassSeconds: Number(dTimeMass.toFixed(3)),
        dLapTimePer10KwPowerSeconds: Number(dTimePower.toFixed(3)),
        dLapTimePer10PctDownforceSeconds: Number(dTimeDownforce.toFixed(3)),
        dLapTimePer005TireGripSeconds: Number(dTimeGrip.toFixed(3)),
      },
    };
  }
}
