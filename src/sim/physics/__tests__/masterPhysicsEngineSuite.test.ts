// ============================================================================
// VITEST SUITE: UNIFIED MASTER VEHICLE PHYSICS & LAP TIME ENGINE
// ============================================================================

import { describe, it, expect } from 'vitest';

import {
  TireTribologyModel,
  MultibodyChassisDynamics,
  ComputationalAeroDynamics,
  ThermodynamicPowertrainDynamics,
  DrivetrainDifferentialSolver,
  BrakeTribologyThermalFEA,
  AdvancedDamperKinematics,
  EnvironmentalMicroclimateTrackPhysics,
  HumanDriverNeuromuscularModel,
  UnifiedMasterLapSimulator,
  CircuitGeometryTopographyDatabase,
  KinematicsDoubleWishboneMultilink,
  TireStintStrategyWearEngine,
  AeroWakeSlipstreamEngine,
  ActiveAeroWingFlexDynamics,
  TelemetryDataExportAnalyzer,
  ActiveTorqueVectoringDynamics,
  ChassisTorsionalFlexDynamics,
  InternalFlowRadiatorAeroThermalFEA,
  BenchmarkLapTelemetryComparator,
  WeatherStationData,
  TrackMacroSurfaceConfig,
  TorqueVectoringVehicleState,
  TorqueVectoringParameters,
  TelemetryPointCompact,
} from '../index';

describe('Unified Master Vehicle Physics & Lap Time Simulation Suite', () => {

  // --------------------------------------------------------------------------
  // 1. TIRE TRIBOLOGY & PACEJKA MF 6.2 TESTS
  // --------------------------------------------------------------------------
  describe('Module 1: Tire Tribology & Dynamics (Pacejka MF 6.2)', () => {
    it('computes realistic pure lateral cornering force with load sensitivity', () => {
      const tireState = TireTribologyModel.createTireState(2.1, 95.0);

      // Evaluate at 4000N vertical load and 6 degrees slip angle
      const result = TireTribologyModel.computeTireForces(tireState, {
        verticalLoadFzN: 4000,
        slipRatioKappa: 0,
        slipAngleAlphaRad: (6.0 * Math.PI) / 180.0,
        camberAngleGammaRad: (-2.5 * Math.PI) / 180.0,
        wheelSpeedMs: 45.0,
        vehicleSpeedMs: 45.0,
        ambientTempC: 22.0,
        trackSurfaceTempC: 35.0,
        dtSeconds: 0.05,
      });

      expect(Math.abs(result.forces.fyLateralN)).toBeGreaterThan(4500); // Racing slick grip mu > 1.1
      expect(result.forces.dynamicMuY).toBeGreaterThan(1.1);
      expect(result.forces.pneumaticTrailM).toBeGreaterThan(0.001);
      expect(result.forces.standingWaveCriticalSpeedKmh).toBeGreaterThan(320);
    });

    it('attenuates lateral force under combined longitudinal braking slip (friction ellipse)', () => {
      const tireState = TireTribologyModel.createTireState(2.1, 95.0);

      // Pure cornering
      const pureLat = TireTribologyModel.computeTireForces(tireState, {
        verticalLoadFzN: 4000,
        slipRatioKappa: 0,
        slipAngleAlphaRad: (5.0 * Math.PI) / 180.0,
        camberAngleGammaRad: 0,
        wheelSpeedMs: 40.0,
        vehicleSpeedMs: 40.0,
        ambientTempC: 22.0,
        trackSurfaceTempC: 30.0,
        dtSeconds: 0.05,
      });

      // Combined cornering + heavy longitudinal braking slip (-15%)
      const combined = TireTribologyModel.computeTireForces(tireState, {
        verticalLoadFzN: 4000,
        slipRatioKappa: -0.15,
        slipAngleAlphaRad: (5.0 * Math.PI) / 180.0,
        camberAngleGammaRad: 0,
        wheelSpeedMs: 34.0,
        vehicleSpeedMs: 40.0,
        ambientTempC: 22.0,
        trackSurfaceTempC: 30.0,
        dtSeconds: 0.05,
      });

      // Lateral force must decrease when tire traction is used for braking
      expect(Math.abs(combined.forces.fyLateralN)).toBeLessThan(Math.abs(pureLat.forces.fyLateralN));
      expect(combined.forces.fxLongitudinalN).toBeLessThan(-1200); // Strong braking force
    });

    it('models multi-node thermal dissipation and flash surface heating', () => {
      const tireState = TireTribologyModel.createTireState(2.1, 85.0);

      const res = TireTribologyModel.computeTireForces(tireState, {
        verticalLoadFzN: 5000,
        slipRatioKappa: 0.08,
        slipAngleAlphaRad: (7.0 * Math.PI) / 180.0,
        camberAngleGammaRad: 0,
        wheelSpeedMs: 52.0,
        vehicleSpeedMs: 50.0,
        ambientTempC: 25.0,
        trackSurfaceTempC: 38.0,
        dtSeconds: 0.1,
      });

      // Flash temperature must be higher than bulk rubber core temperature
      expect(res.state.thermals.treadSurfaceC).toBeGreaterThan(res.state.thermals.treadBulkc);
      expect(res.forces.thermalDissipationKw).toBeGreaterThan(5.0);
    });
  });

  // --------------------------------------------------------------------------
  // 2. 6-DOF CHASSIS & K&C DYNAMICS TESTS
  // --------------------------------------------------------------------------
  describe('Module 2: 6-DOF Multibody Chassis & K&C Engine', () => {
    it('accurately divides static wheel loads according to weight distribution', () => {
      const ref = UnifiedMasterLapSimulator.createReferenceHypercarConfig();
      const loads = MultibodyChassisDynamics.computeWheelLoads(ref.chassis, ref.kinematics, 0, 0, 0, 0);

      const totalLoad = loads.loads.totalVerticalLoadN;
      const frontLoad = loads.loads.frontAxleLoadN;
      const frontRatio = frontLoad / totalLoad;

      expect(frontRatio).toBeCloseTo(ref.chassis.weightDistributionFront, 2);
      expect(loads.loads.crossWeightPercent).toBeCloseTo(50.0, 1);
    });

    it('transfers load longitudinally during -1.8G threshold braking with anti-dive', () => {
      const ref = UnifiedMasterLapSimulator.createReferenceHypercarConfig();
      const brakingLoads = MultibodyChassisDynamics.computeWheelLoads(ref.chassis, ref.kinematics, -1.8, 0, 2000, 3000);

      // Front axle should carry significantly more load than rear during hard braking
      expect(brakingLoads.loads.frontAxleLoadN).toBeGreaterThan(brakingLoads.loads.rearAxleLoadN);
      expect(Math.abs(brakingLoads.loads.geometricLongTransferN)).toBeGreaterThan(0);
      expect(brakingLoads.state.pitchAngleRad).toBeLessThan(0); // Nose dive
    });

    it('transfers lateral load during +2.2G high-speed cornering and calculates roll angle', () => {
      const ref = UnifiedMasterLapSimulator.createReferenceHypercarConfig();
      const cornerLoads = MultibodyChassisDynamics.computeWheelLoads(ref.chassis, ref.kinematics, 0, 2.2, 3500, 5000);

      // Right side load must be much greater than left side during left-hand turn (positive ay)
      expect(cornerLoads.loads.rightSideLoadN).toBeGreaterThan(cornerLoads.loads.leftSideLoadN);
      expect(cornerLoads.state.rollAngleRad).toBeGreaterThan(0);
      expect(cornerLoads.angles.camberFlDeg).toBeLessThan(cornerLoads.angles.camberFrDeg);
    });
  });

  // --------------------------------------------------------------------------
  // 3. COMPUTATIONAL AERODYNAMICS & PORPOISING TESTS
  // --------------------------------------------------------------------------
  describe('Module 3: Computational Aerodynamics & Ground Effect Porpoising', () => {
    it('scales downforce with speed squared and captures ground effect venturi suction', () => {
      const ref = UnifiedMasterLapSimulator.createReferenceHypercarConfig();

      const aero100 = ComputationalAeroDynamics.evaluateAerodynamics(ref.aero, {
        vehicleSpeedMs: 100.0 / 3.6,
        frontRideHeightM: 0.035,
        rearRideHeightM: 0.045,
        pitchAngleDeg: 0,
        rollAngleDeg: 0,
        yawAngleBetaDeg: 0,
        isDrsActive: false,
        drsActuationProgress: 0,
        ambientAirDensityKgM3: 1.225,
        dtSeconds: 0.05,
      });

      const aero200 = ComputationalAeroDynamics.evaluateAerodynamics(ref.aero, {
        vehicleSpeedMs: 200.0 / 3.6,
        frontRideHeightM: 0.035,
        rearRideHeightM: 0.045,
        pitchAngleDeg: 0,
        rollAngleDeg: 0,
        yawAngleBetaDeg: 0,
        isDrsActive: false,
        drsActuationProgress: 0,
        ambientAirDensityKgM3: 1.225,
        dtSeconds: 0.05,
      });

      // 2x speed -> ~4x downforce
      expect(aero200.totalDownforceN).toBeGreaterThan(aero100.totalDownforceN * 3.6);
      expect(aero200.liftToDragRatio).toBeGreaterThan(2.5);
    });

    it('triggers diffuser stall when ride height is compressed below critical threshold', () => {
      const ref = UnifiedMasterLapSimulator.createReferenceHypercarConfig();
      ComputationalAeroDynamics.resetAeroState();

      // Normal ride height (35mm)
      const aeroNormal = ComputationalAeroDynamics.evaluateAerodynamics(ref.aero, {
        vehicleSpeedMs: 65.0,
        frontRideHeightM: 0.035,
        rearRideHeightM: 0.045,
        pitchAngleDeg: 0,
        rollAngleDeg: 0,
        yawAngleBetaDeg: 0,
        isDrsActive: false,
        drsActuationProgress: 0,
        ambientAirDensityKgM3: 1.225,
        dtSeconds: 0.05,
      });

      // Severe bottoming out (12mm)
      const aeroStalled = ComputationalAeroDynamics.evaluateAerodynamics(ref.aero, {
        vehicleSpeedMs: 65.0,
        frontRideHeightM: 0.012,
        rearRideHeightM: 0.014,
        pitchAngleDeg: 0,
        rollAngleDeg: 0,
        yawAngleBetaDeg: 0,
        isDrsActive: false,
        drsActuationProgress: 0,
        ambientAirDensityKgM3: 1.225,
        dtSeconds: 0.05,
      });

      expect(aeroStalled.isDiffuserStalled).toBe(true);
      expect(aeroStalled.totalDownforceN).toBeLessThan(aeroNormal.totalDownforceN);
    });

    it('reduces drag and rear downforce when DRS is actuated', () => {
      const ref = UnifiedMasterLapSimulator.createReferenceHypercarConfig();
      ComputationalAeroDynamics.resetAeroState();

      const aeroDrsClosed = ComputationalAeroDynamics.evaluateAerodynamics(ref.aero, {
        vehicleSpeedMs: 75.0,
        frontRideHeightM: 0.035,
        rearRideHeightM: 0.045,
        pitchAngleDeg: 0,
        rollAngleDeg: 0,
        yawAngleBetaDeg: 0,
        isDrsActive: false,
        drsActuationProgress: 0,
        ambientAirDensityKgM3: 1.225,
        dtSeconds: 0.05,
      });

      const aeroDrsOpen = ComputationalAeroDynamics.evaluateAerodynamics(ref.aero, {
        vehicleSpeedMs: 75.0,
        frontRideHeightM: 0.035,
        rearRideHeightM: 0.045,
        pitchAngleDeg: 0,
        rollAngleDeg: 0,
        yawAngleBetaDeg: 0,
        isDrsActive: true,
        drsActuationProgress: 1.0,
        ambientAirDensityKgM3: 1.225,
        dtSeconds: 0.05,
      });

      expect(aeroDrsOpen.totalDragForceN).toBeLessThan(aeroDrsClosed.totalDragForceN * 0.85);
      expect(aeroDrsOpen.downforceRearN).toBeLessThan(aeroDrsClosed.downforceRearN * 0.75);
    });
  });

  // --------------------------------------------------------------------------
  // 4. THERMODYNAMIC POWERTRAIN & HYBRID DYNAMICS TESTS
  // --------------------------------------------------------------------------
  describe('Module 4: Thermodynamic Powertrain & Hybrid EMS', () => {
    it('computes in-cylinder IMEP, Chen-Flynn FMEP and brake torque', () => {
      const ref = UnifiedMasterLapSimulator.createReferenceHypercarConfig();
      const ptState = ThermodynamicPowertrainDynamics.createPowertrainState(ref.engine, ref.hybrid);

      const ptOut = ThermodynamicPowertrainDynamics.evaluatePowertrain(
        ref.engine,
        ref.hybrid,
        ref.transmission,
        ptState,
        {
          throttlePedalPct: 100.0,
          requestedGear: 3,
          hybridDeployMode: 'hotlap',
          isBrakingRegenActive: false,
          brakingDemandKw: 0,
          vehicleSpeedMs: 38.0,
          dtSeconds: 0.05,
        }
      );

      expect(ptOut.indicatedMeanEffectivePressureBar).toBeGreaterThan(12.0);
      expect(ptOut.frictionMeanEffectivePressureBar).toBeGreaterThan(1.0);
      expect(ptOut.brakeMeanEffectivePressureBar).toBeLessThan(ptOut.indicatedMeanEffectivePressureBar);
      expect(ptOut.wheelDriveForceN).toBeGreaterThan(3000);
      expect(ptOut.combinedPowerKw).toBeGreaterThan(400);
    });

    it('harvests energy into battery under regenerative braking', () => {
      const ref = UnifiedMasterLapSimulator.createReferenceHypercarConfig();
      const ptState = ThermodynamicPowertrainDynamics.createPowertrainState(ref.engine, ref.hybrid);
      ptState.batterySocPct = 50.0;

      const ptOut = ThermodynamicPowertrainDynamics.evaluatePowertrain(
        ref.engine,
        ref.hybrid,
        ref.transmission,
        ptState,
        {
          throttlePedalPct: 0,
          requestedGear: 4,
          hybridDeployMode: 'balanced',
          isBrakingRegenActive: true,
          brakingDemandKw: 120.0,
          vehicleSpeedMs: 55.0,
          dtSeconds: 0.1,
        }
      );

      expect(ptOut.regeneratedEnergyHarvestedKwh).toBeGreaterThan(0);
      expect(ptOut.state.batterySocPct).toBeGreaterThan(50.0);
    });
  });

  // --------------------------------------------------------------------------
  // 5. DRIVETRAIN SALISBURY LSD & TORQUE VECTORING TESTS
  // --------------------------------------------------------------------------
  describe('Module 5: Drivetrain Salisbury LSD & Active Torque Vectoring', () => {
    it('generates asymmetric locking torque between drive ramp and coast ramp', () => {
      const ref = UnifiedMasterLapSimulator.createReferenceHypercarConfig();

      // Driving under acceleration (Tin = +800 Nm)
      const driveRes = DrivetrainDifferentialSolver.evaluateDifferential(
        ref.differential,
        ref.vectoring,
        {
          inputDriveshaftTorqueNm: 800,
          leftWheelSpeedRadS: 90,
          rightWheelSpeedRadS: 95,
          vehicleSpeedMs: 30,
          steeringAngleDeg: 12,
          actualYawRateRadS: 0.45,
          dtSeconds: 0.05,
        }
      );

      // Coasting / engine braking (Tin = -400 Nm)
      const coastRes = DrivetrainDifferentialSolver.evaluateDifferential(
        ref.differential,
        ref.vectoring,
        {
          inputDriveshaftTorqueNm: -400,
          leftWheelSpeedRadS: 90,
          rightWheelSpeedRadS: 95,
          vehicleSpeedMs: 30,
          steeringAngleDeg: 12,
          actualYawRateRadS: 0.45,
          dtSeconds: 0.05,
        }
      );

      expect(driveRes.lockingTorqueNm).toBeGreaterThan(ref.differential.staticPreloadTorqueNm);
      expect(coastRes.lockingTorqueNm).toBeGreaterThan(ref.differential.staticPreloadTorqueNm);
      expect(driveRes.torqueBiasRatio).toBeGreaterThan(1.0);
    });
  });

  // --------------------------------------------------------------------------
  // 6. BRAKE TRIBOLOGY & THERMAL FEA TESTS
  // --------------------------------------------------------------------------
  describe('Module 6: Brake Tribology & 1D Radial Disc Thermal FEA', () => {
    it('calculates hydraulic line pressure, braking forces, and pad friction plateau', () => {
      const ref = UnifiedMasterLapSimulator.createReferenceHypercarConfig();
      const brakeState = BrakeTribologyThermalFEA.createBrakeState(350.0);

      const brakeOut = BrakeTribologyThermalFEA.evaluateBrakes(
        ref.brakeFront,
        ref.brakeRear,
        brakeState,
        {
          pedalEffortForceN: 750,
          pedalLeverageRatio: 5.2,
          staticBiasFrontPct: 58.0,
          vehicleSpeedMs: 50.0,
          ambientTempC: 22.0,
          wheelLoadsN: [4500, 4500, 2200, 2200],
          tireGrips: [1.3, 1.3, 1.3, 1.3],
          isAbsEnabled: true,
          dtSeconds: 0.05,
        }
      );

      expect(brakeOut.totalBrakingForceN).toBeGreaterThan(8000);
      expect(brakeOut.decelerationG).toBeGreaterThan(1.0);
      expect(brakeOut.padFrictionCoeffFl).toBeGreaterThan(0.45);
      expect(brakeOut.thermalDissipationKw).toBeGreaterThan(150.0);
    });
  });

  // --------------------------------------------------------------------------
  // 7. ADVANCED DAMPER KINEMATICS TESTS
  // --------------------------------------------------------------------------
  describe('Module 7: Advanced 4-Way Digressive Dampers & Inerters', () => {
    it('produces digressive force curves in compression and rebound with blow-off relief', () => {
      const ref = UnifiedMasterLapSimulator.createReferenceHypercarConfig();

      // Low speed compression
      const dLow = AdvancedDamperKinematics.computeDamperForces(ref.damper, {
        suspensionVelocityMs: 0.030,
        chassisBodyAccelZMs2: 2.0,
        wheelHubAccelZMs2: 1.5,
        suspensionDisplacementM: 0.010,
        dtSeconds: 0.01,
      });

      // High speed severe curb compression
      const dHigh = AdvancedDamperKinematics.computeDamperForces(ref.damper, {
        suspensionVelocityMs: 2.20,
        chassisBodyAccelZMs2: 8.0,
        wheelHubAccelZMs2: 18.0,
        suspensionDisplacementM: 0.028,
        dtSeconds: 0.01,
      });

      expect(dLow.dampingPhase).toBe('low_speed_bump');
      expect(dHigh.dampingPhase).toBe('high_speed_bump');
      expect(dHigh.isBlowOffValveOpen).toBe(true);
      expect(dHigh.isPackerEngaged).toBe(true);
      expect(Math.abs(dHigh.inerterForceN)).toBeGreaterThan(0);
    });
  });

  // --------------------------------------------------------------------------
  // 8. ENVIRONMENTAL & TRACK TRIBOLOGY TESTS
  // --------------------------------------------------------------------------
  describe('Module 8: Environmental Microclimate & Track Tribology', () => {
    it('computes moist air density with altitude lapse rate', () => {
      const seaLevelWeather: WeatherStationData = {
        ambientTempC: 15.0,
        barometricPressureHpa: 1013.25,
        relativeHumidityPct: 50.0,
        altitudeMeters: 0,
        solarIrradianceWattsM2: 700,
        windSpeedKmh: 10,
        rainPrecipitationMmPerHour: 0,
      };

      const highAltitudeWeather: WeatherStationData = {
        ...seaLevelWeather,
        altitudeMeters: 2285, // Mexico City
      };

      const rhoSeaLevel = EnvironmentalMicroclimateTrackPhysics.computeMoistAirDensity(seaLevelWeather);
      const rhoHighAlt = EnvironmentalMicroclimateTrackPhysics.computeMoistAirDensity(highAltitudeWeather);

      expect(rhoSeaLevel).toBeCloseTo(1.225, 1);
      expect(rhoHighAlt).toBeLessThan(rhoSeaLevel * 0.82); // ~20% thinner air
    });

    it('predicts water film thickness and hydroplaning threshold in wet weather', () => {
      const rainyWeather: WeatherStationData = {
        ambientTempC: 16.0,
        barometricPressureHpa: 1008.0,
        relativeHumidityPct: 95.0,
        altitudeMeters: 400,
        solarIrradianceWattsM2: 120,
        windSpeedKmh: 18,
        rainPrecipitationMmPerHour: 12.0, // Heavy rain
      };

      const trackSurface: TrackMacroSurfaceConfig = {
        baseFrictionMu: 1.05,
        asphaltAlbedo: 0.09,
        crossFallSlopePct: 2.0,
        drainageLengthM: 7.0,
        macroTextureDepthMm: 1.2,
      };

      const wetConditions = EnvironmentalMicroclimateTrackPhysics.evaluateTrackConditions(rainyWeather, trackSurface);

      expect(wetConditions.isWetTrack).toBe(true);
      expect(wetConditions.waterFilmThicknessMm).toBeGreaterThan(0.5);
      expect(wetConditions.aquaplaningSpeedKmh).toBeLessThan(260);
      expect(wetConditions.effectiveFrictionMu).toBeLessThan(1.0);
    });
  });

  // --------------------------------------------------------------------------
  // 9. HUMAN DRIVER NEUROMUSCULAR TESTS
  // --------------------------------------------------------------------------
  describe('Module 9: Human Driver Neuromuscular Model', () => {
    it('applies trail-braking friction budget modulation and counter-steer reflexes', () => {
      const profile = HumanDriverNeuromuscularModel.DRIVER_PROFILES.world_champion;
      const dState = HumanDriverNeuromuscularModel.createDriverState();

      const cmd = HumanDriverNeuromuscularModel.evaluateDriverControls(profile, dState, {
        vehicleSpeedMs: 40.0,
        targetCornerRadiusM: 45.0,
        distanceToApexM: 35.0,
        currentLateralG: 1.6,
        currentLongitudinalG: -1.2,
        chassisYawRateRadS: 0.42,
        targetYawRateRadS: 0.38,
        availableTireGripMu: 1.8,
        lapNumber: 5,
        dtSeconds: 0.05,
      });

      expect(cmd.isTrailBraking).toBe(true);
      expect(cmd.commandedBrakeEffortN).toBeGreaterThan(100);
      expect(cmd.frictionCircleUtilizationPct).toBeGreaterThan(80.0);
    });
  });

  // --------------------------------------------------------------------------
  // 10. UNIFIED MASTER LAP SIMULATOR COMPLETE RACE RUN
  // --------------------------------------------------------------------------
  describe('Module 10: Unified Master Lap Simulator', () => {
    it('executes full multi-physics simulation of Circuit de Spa-Francorchamps with 100Hz telemetry integrity', () => {
      const ref = UnifiedMasterLapSimulator.createReferenceHypercarConfig();
      const result = UnifiedMasterLapSimulator.simulateLap(ref);

      // Validate Spa lap time (LMH / F1 hypercar baseline ~1:25 - 2:05)
      expect(result.circuitName).toBe('Circuit de Spa-Francorchamps');
      expect(result.lapTimeSeconds).toBeGreaterThan(80.0);
      expect(result.lapTimeSeconds).toBeLessThan(140.0);
      expect(result.topSpeedKmh).toBeGreaterThan(290.0);
      expect(result.averageSpeedKmh).toBeGreaterThan(160.0);

      // Validate 3 Sectors
      expect(result.sectorTimes[0]).toBeGreaterThan(15.0);
      expect(result.sectorTimes[1]).toBeGreaterThan(25.0);
      expect(result.sectorTimes[2]).toBeGreaterThan(15.0);
      expect(result.sectorTimes[0] + result.sectorTimes[1] + result.sectorTimes[2]).toBeCloseTo(result.lapTimeSeconds, 1);

      // Validate Telemetry integrity
      expect(result.telemetry.length).toBeGreaterThan(500);
      const sample = result.telemetry[150];
      expect(sample.speedKmh).toBeGreaterThan(0);
      expect(Number.isNaN(sample.speedKmh)).toBe(false);
      expect(sample.wheelLoadFlN).toBeGreaterThan(0);
      expect(sample.tireTempFlC).toBeGreaterThan(50.0);
      expect(sample.brakeTempFlC).toBeGreaterThan(100.0);

      // Validate Sensitivity derivatives
      expect(result.sensitivityGradients.dLapTimePer10KgMassSeconds).toBeGreaterThan(0); // More mass = slower
      expect(result.sensitivityGradients.dLapTimePer10KwPowerSeconds).toBeLessThan(0);    // More power = faster
      expect(result.sensitivityGradients.dLapTimePer10PctDownforceSeconds).toBeLessThan(0); // More aero = faster
      expect(result.sensitivityGradients.dLapTimePer005TireGripSeconds).toBeLessThan(0); // More grip = faster
    });
  });

  // --------------------------------------------------------------------------
  // 11. CIRCUIT GEOMETRY & 3D TOPOGRAPHY TESTS
  // --------------------------------------------------------------------------
  describe('Module 11: Circuit Geometry & 3D Topography Database', () => {
    it('validates 3D banking, elevation, and kerb profiles of world circuits', () => {
      const circuits = CircuitGeometryTopographyDatabase.CIRCUITS;

      expect(circuits.SPA_FRANCORCHAMPS).toBeDefined();
      expect(circuits.NURBURGRING_NORDSCHLEIFE).toBeDefined();
      expect(circuits.SILVERSTONE_GP).toBeDefined();
      expect(circuits.MONZA).toBeDefined();

      // Nordschleife Karussell must feature ~33° concrete banking
      const nordschleife = circuits.NURBURGRING_NORDSCHLEIFE;
      const karussell = nordschleife.corners.find(c => c.name.includes('Karussell'));
      expect(karussell).toBeDefined();
      expect(karussell!.bankingDeg).toBeGreaterThanOrEqual(30.0);

      // Spa Raidillon must feature severe uphill gradient (>15%)
      const spa = circuits.SPA_FRANCORCHAMPS;
      const raidillon = spa.corners.find(c => c.name.includes('Raidillon'));
      expect(raidillon).toBeDefined();
      expect(raidillon!.gradientSlopePct).toBeGreaterThan(15.0);
    });
  });

  // --------------------------------------------------------------------------
  // 12. 3D WISHBONE & MULTI-LINK SUSPENSION KINEMATICS TESTS
  // --------------------------------------------------------------------------
  describe('Module 12: Suspension Kinematics & 3D Multi-Link / Wishbone Geometry', () => {
    it('solves front view & side view instant centers, roll center height, and anti-dive', () => {
      const hardpoints = KinematicsDoubleWishboneMultilink.REFERENCE_LMH_FRONT_HARDPOINTS;
      const ic = KinematicsDoubleWishboneMultilink.solveInstantCenters(hardpoints);

      expect(Math.abs(ic.fvicY)).toBeGreaterThan(1.0); // Outboard/inboard virtual swing arm
      expect(ic.rollCenterHeightM).toBeGreaterThan(0.01);
      expect(ic.rollCenterHeightM).toBeLessThan(0.12);
      expect(ic.antiDivePercent).toBeGreaterThan(15.0);
      expect(ic.casterAngleDeg).toBeGreaterThan(3.0);
      expect(ic.kingpinInclinationDeg).toBeGreaterThan(4.0);
      expect(ic.mechanicalTrailMm).toBeGreaterThan(10.0);
    });

    it('computes non-linear bellcrank motion ratio sweep and camber gain curve', () => {
      const hardpoints = KinematicsDoubleWishboneMultilink.REFERENCE_LMH_FRONT_HARDPOINTS;
      const sweep = KinematicsDoubleWishboneMultilink.computeMotionRatioSweep(hardpoints, 30.0, 7);

      expect(sweep.length).toBe(7);
      // In bump, camber must become more negative (camber recovery)
      const fullBump = sweep[sweep.length - 1];
      const fullDroop = sweep[0];
      expect(fullBump.camberDeg).toBeLessThan(fullDroop.camberDeg);
      expect(fullBump.instantMotionRatio).toBeGreaterThan(0.7);
    });
  });

  // --------------------------------------------------------------------------
  // 13. TIRE STINT THERMAL DEGRADATION & STRATEGY TESTS
  // --------------------------------------------------------------------------
  describe('Module 13: Tire Stint Thermal Degradation & Race Strategy', () => {
    it('evaluates multi-compound wear rates, cliff drops, and 3-zone thermal maps', () => {
      const stintSoft = TireStintStrategyWearEngine.simulateStint('C5_Soft', 25, 102.5);
      const stintHard = TireStintStrategyWearEngine.simulateStint('C1_Hard', 45, 105.0);

      // Soft compound must degrade faster than Hard compound
      expect(stintSoft.optimalPitStopLap).toBeLessThan(stintHard.optimalPitStopLap);
      expect(stintSoft.undercutPaceDeltaSeconds).toBeGreaterThan(1.0);

      // Verify 3-Zone thermal diagnostics
      const thermalMap = TireStintStrategyWearEngine.evaluateThreeZoneThermalMap(105.0, -3.8, 2.15, 2.5);
      expect(thermalMap.innerShoulderTempC).toBeGreaterThan(thermalMap.outerShoulderTempC);
    });
  });

  // --------------------------------------------------------------------------
  // 14. AERODYNAMIC WAKE & SLIPSTREAM TESTS
  // --------------------------------------------------------------------------
  describe('Module 14: Multi-Car Aerodynamic Slipstream, Wake & Dirty Air', () => {
    it('computes straight-line slipstream drag reduction and dirty air downforce loss', () => {
      const leadSignature = {
        leadCarSpeedMs: 85.0,
        leadCarDownforceN: 18000,
        leadCarDragN: 4500,
        leadCarFrontalAreaM2: 1.95,
        leadCarThermalRejectionKw: 420,
      };

      // Close follower (8 meters gap)
      const closeFollower = AeroWakeSlipstreamEngine.evaluateWakeAerodynamics(leadSignature, {
        gapDistanceM: 8.0,
        lateralOffsetM: 0.2,
        followerBaseClFront: 1.45,
        followerBaseClRear: 2.10,
        followerBaseCd: 0.38,
        ambientAirTempC: 22.0,
      });

      // Far follower (80 meters gap)
      const farFollower = AeroWakeSlipstreamEngine.evaluateWakeAerodynamics(leadSignature, {
        gapDistanceM: 80.0,
        lateralOffsetM: 0.0,
        followerBaseClFront: 1.45,
        followerBaseClRear: 2.10,
        followerBaseCd: 0.38,
        ambientAirTempC: 22.0,
      });

      expect(closeFollower.dragReductionPct).toBeGreaterThan(20.0);
      expect(closeFollower.totalDownforceLossPct).toBeGreaterThan(20.0);
      expect(closeFollower.ingestedCoolingAirTempC).toBeGreaterThan(25.0); // Heated wake plume
      expect(closeFollower.dragReductionPct).toBeGreaterThan(farFollower.dragReductionPct);
    });
  });

  // --------------------------------------------------------------------------
  // 15. AEROELASTIC WING FLEX & ACTIVE AERO TESTS
  // --------------------------------------------------------------------------
  describe('Module 15: Aeroelastic Wing Flex & Dynamic Active Aero Control', () => {
    it('deploys emergency airbrake under threshold braking and calculates aero flex', () => {
      const specs = {
        hasActiveFrontFlaps: true,
        hasActiveRearWing: true,
        hasAirbrakeFunction: true,
        maxAirbrakeAngleDeg: 72,
        airbrakeDeploymentRateDegPerS: 360,
        wingFlexComplianceDegPerKN: 0.85,
        maxAeroRollTrimMomentNm: 850,
        drsActuatorTimeConstantS: 0.12,
      };

      const aeroState = ActiveAeroWingFlexDynamics.createActiveAeroState();

      // High-speed threshold braking at 260 km/h (-1.8G)
      const brakingOut = ActiveAeroWingFlexDynamics.evaluateActiveAero(specs, aeroState, {
        vehicleSpeedMs: 72.0,
        longitudinalAccelG: -1.8,
        lateralAccelG: 0,
        chassisRollAngleDeg: 0,
        isBrakingZone: true,
        isDrsRequested: false,
        dtSeconds: 0.15,
      });

      expect(brakingOut.isAirbrakeDeployed).toBe(true);
      expect(brakingOut.airbrakeDragForceN).toBeGreaterThan(1500);
      expect(brakingOut.passiveFlexDragReductionPct).toBeGreaterThan(0);
    });
  });

  // --------------------------------------------------------------------------
  // 16. TELEMETRY ANALYZER & MOTEC EXPORT TESTS
  // --------------------------------------------------------------------------
  describe('Module 16: Motorsport Telemetry Analyzer & MoTeC Data Export', () => {
    it('generates 36-bin G-G diagram polar envelope, phase breakdown, and MoTeC CSV string', () => {
      const ref = UnifiedMasterLapSimulator.createReferenceHypercarConfig();
      const lapResult = UnifiedMasterLapSimulator.simulateLap(ref);

      const report = TelemetryDataExportAnalyzer.analyzeTelemetry(lapResult.telemetry);

      expect(report.ggDiagramEnvelope.length).toBe(36);
      expect(report.peakLateralGLat).toBeGreaterThan(2.0);
      expect(report.phaseBreakdown.totalLapTimeS).toBeCloseTo(lapResult.lapTimeSeconds, 1);
      expect(report.phaseBreakdown.fullThrottleStraightTimeS).toBeGreaterThan(10.0);

      // Generate MoTeC CSV
      const csv = TelemetryDataExportAnalyzer.generateMoTecCsv(lapResult.telemetry.slice(0, 10));
      expect(csv).toContain('Time,Distance,Speed,Throttle');
      expect(csv.split('\n').length).toBe(11);
    });
  });

  // --------------------------------------------------------------------------
  // 17. ACTIVE TORQUE VECTORING & DYC TESTS
  // --------------------------------------------------------------------------
  describe('Module 17: Active Torque Vectoring & Direct Yaw Moment Control', () => {
    it('applies corrective yaw moment and asymmetric wheel torque under understeer', () => {
      ActiveTorqueVectoringDynamics.resetIntegrator();

      const state: TorqueVectoringVehicleState = {
        speedMs: 45.0,
        steeringWheelAngleRad: 0.18, // Driver steering left
        actualYawRateRadS: 0.03,     // Vehicle turning slower than demanded (understeer)
        actualYawAccelRadS2: 0.0,
        lateralAccelMs2: 12.0,
        wheelbaseM: 2.75,
        frontTrackWidthM: 1.62,
        rearTrackWidthM: 1.60,
        tireRadiusM: 0.33,
        steerRatio: 14.5,
        totalDriveTorqueNm: 800,
        totalBrakeTorqueNm: 0,
        wheelSlipRatioFL: 0.02,
        wheelSlipRatioFR: 0.02,
        wheelSlipRatioRL: 0.05,
        wheelSlipRatioRR: 0.05,
        tireGripCoeff: 1.65,
      };

      const params: TorqueVectoringParameters = {
        understeerGradientRadPerG: 0.02,
        kpYawMoment: 4500.0,
        kdYawMoment: 650.0,
        kiYawMoment: 400.0,
        maxYawMomentNm: 2200.0,
        targetSlipRatio: 0.11,
        maxRegenTorqueNm: 900.0,
        frontBrakeBias: 0.58,
      };

      const result = ActiveTorqueVectoringDynamics.evaluate(state, params, 0.01);

      expect(result.vehicleHandlingState).toBe('UNDERSTEER_CORRECTION');
      expect(result.directYawMomentDemandNm).toBeGreaterThan(0);
      // Outer right wheel must receive more torque than inner left wheel
      expect(result.rearRightWheelTorqueNm).toBeGreaterThan(result.rearLeftWheelTorqueNm);
      expect(result.tractionControlActive).toBe(false);
    });

    it('triggers sliding mode traction control cut under excessive wheelspin', () => {
      ActiveTorqueVectoringDynamics.resetIntegrator();

      const spinState: TorqueVectoringVehicleState = {
        speedMs: 25.0,
        steeringWheelAngleRad: 0.0,
        actualYawRateRadS: 0.0,
        actualYawAccelRadS2: 0.0,
        lateralAccelMs2: 0.0,
        wheelbaseM: 2.75,
        frontTrackWidthM: 1.62,
        rearTrackWidthM: 1.60,
        tireRadiusM: 0.33,
        steerRatio: 14.5,
        totalDriveTorqueNm: 1200,
        totalBrakeTorqueNm: 0,
        wheelSlipRatioFL: 0.01,
        wheelSlipRatioFR: 0.01,
        wheelSlipRatioRL: 0.28, // Heavy wheelspin
        wheelSlipRatioRR: 0.26,
        tireGripCoeff: 1.65,
      };

      const params: TorqueVectoringParameters = {
        understeerGradientRadPerG: 0.02,
        kpYawMoment: 4500.0,
        kdYawMoment: 650.0,
        kiYawMoment: 400.0,
        maxYawMomentNm: 2200.0,
        targetSlipRatio: 0.11,
        maxRegenTorqueNm: 900.0,
        frontBrakeBias: 0.58,
      };

      const result = ActiveTorqueVectoringDynamics.evaluate(spinState, params, 0.01);

      expect(result.tractionControlActive).toBe(true);
      expect(result.tractionControlTorqueCutNm).toBeGreaterThan(300);
      expect(result.rearLeftWheelTorqueNm + result.rearRightWheelTorqueNm).toBeLessThan(1200);
    });
  });

  // --------------------------------------------------------------------------
  // 18. CHASSIS TORSIONAL STIFFNESS & MONOCOQUE FLEX TESTS
  // --------------------------------------------------------------------------
  describe('Module 18: Chassis Torsional Stiffness & Monocoque Compliance', () => {
    it('calculates series roll stiffness redistribution, tub twist angle, and aero sag', () => {
      const struct = {
        torsionalStiffnessNmPerDeg: 45000,
        bendingStiffnessNmM2: 1.2e7,
        wheelbaseM: 2.75,
        trackWidthFrontM: 1.62,
        trackWidthRearM: 1.60,
        chassisMassKg: 165,
      };

      const inputs = {
        frontSuspensionRollStiffnessNmPerDeg: 2800,
        rearSuspensionRollStiffnessNmPerDeg: 1900,
        lateralAccelG: 2.8,
        totalSprungMassKg: 950,
        rollCenterHeightM: 0.045,
        cgHeightM: 0.285,
        aeroDownforceTotalN: 16500,
        curbDisplacementFLMm: 35.0,
        curbDisplacementFRMm: 0.0,
      };

      const flex = ChassisTorsionalFlexDynamics.evaluate(struct, inputs);

      expect(flex.chassisTwistAngleDeg).toBeGreaterThan(0);
      expect(flex.frontRollAngleDeg).toBeGreaterThan(flex.rearRollAngleDeg);
      expect(flex.curbStrikeWarpTorqueNm).toBeGreaterThan(500);
      expect(flex.diagonalLoadTransferN).toBeGreaterThan(300);
      expect(flex.aeroSuctionBeamDeflectionMm).toBeGreaterThan(0.25);
    });
  });

  // --------------------------------------------------------------------------
  // 19. INTERNAL FLOW RADIATOR & AEROTHERMAL FEA TESTS
  // --------------------------------------------------------------------------
  describe('Module 19: Radiator & Duct Internal Flow AeroThermal FEA', () => {
    it('computes Darcy-Forchheimer core pressure drop, epsilon-NTU heat rejection, and cooling drag', () => {
      const geom = {
        coreAreaM2: 0.22,
        coreThicknessM: 0.05,
        inletAreaM2: 0.08,
        exitAreaM2: 0.12,
        darcyPermeabilityM2: 2.5e-8,
        inertialLossFactorMInv: 185.0,
        heatTransferCoeffUA: 3800,
        coolantMassFlowKgS: 2.4,
        coolantSpecificHeatJPkgK: 3850,
      };

      const inlet = {
        vehicleSpeedMs: 65.0,
        ambientAirTempC: 24.0,
        airDensityKgM3: 1.205,
        airDynamicViscosityPaS: 1.81e-5,
        coolantInletTempC: 105.0,
        carFrontalAreaM2: 1.95,
      };

      const result = InternalFlowRadiatorAeroThermalFEA.evaluate(geom, inlet);

      expect(result.corePressureDropPa).toBeGreaterThan(100);
      expect(result.heatRejectionRateKw).toBeGreaterThan(80); // Substantial thermal dissipation
      expect(result.coolantOutletTempC).toBeLessThan(inlet.coolantInletTempC);
      expect(result.airOutletTempC).toBeGreaterThan(inlet.ambientAirTempC);
      expect(result.internalCoolingDragN).toBeGreaterThan(30);
      expect(result.internalCoolingCd).toBeGreaterThan(0.005);
    });
  });

  // --------------------------------------------------------------------------
  // 20. BENCHMARK LAP TELEMETRY COMPARATOR TESTS
  // --------------------------------------------------------------------------
  describe('Module 20: Benchmark Lap Telemetry Comparator & Coaching Analyzer', () => {
    it('compares two complete laps, generates micro-sector deltas, and coaching insights', () => {
      // Create synthetic Lap A and Lap B traces
      const lapA: TelemetryPointCompact[] = [];
      const lapB: TelemetryPointCompact[] = [];

      let dist = 0;
      let timeA = 0;
      let timeB = 0;

      while (dist <= 1000) {
        const spdA = 180.0 + Math.sin(dist / 100.0) * 40.0;
        const spdB = 185.0 + Math.sin(dist / 100.0) * 42.0; // B slightly faster

        const dtA = 10.0 / (spdA / 3.6);
        const dtB = 10.0 / (spdB / 3.6);

        timeA += dtA;
        timeB += dtB;

        lapA.push({
          distanceM: dist,
          timeSeconds: timeA,
          speedKmh: spdA,
          lateralAccelG: Math.abs(Math.cos(dist / 150.0)) * 2.2,
          longitudinalAccelG: Math.cos(dist / 100.0) * 0.8,
          throttlePct: spdA > 180 ? 100 : 30,
          brakePct: spdA <= 150 ? 80 : 0,
        });

        lapB.push({
          distanceM: dist,
          timeSeconds: timeB,
          speedKmh: spdB,
          lateralAccelG: Math.abs(Math.cos(dist / 150.0)) * 2.3,
          longitudinalAccelG: Math.cos(dist / 100.0) * 0.85,
          throttlePct: spdB > 180 ? 100 : 30,
          brakePct: spdB <= 150 ? 80 : 0,
        });

        dist += 10.0;
      }

      const summary = BenchmarkLapTelemetryComparator.compareLaps(lapA, lapB, 100.0, 2.5);

      expect(summary.fasterLap).toBe('LAP_B');
      expect(summary.lapTimeDeltaSeconds).toBeLessThan(0);
      expect(summary.microSectors.length).toBeGreaterThan(5);
      expect(summary.coachingInsights.length).toBeGreaterThan(0);
      expect(summary.lapBAvgFrictionCircleUtilizationPct).toBeGreaterThan(0);
    });
  });
});

