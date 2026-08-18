// ===================================================================
// LAP SIMULATOR — Master orchestrator combining all physics modules
// ===================================================================
// Phase 10: Walks every track segment, calling engine, transmission,
// aero, tyre, suspension, braking, corner, and driver modules to
// produce a complete physics-based lap time with full telemetry.

import type { VehicleDesign, SimResult, TrackId, TrackSegment, TrackInfo, DriverSkill } from '../types';
import { TRACKS, TIRE_COMPOUNDS, SUSPENSION_TYPES } from '../constants';

// Physics modules
import { generateTorqueCurve, totalTorqueAtRpm, type EnginePhysicsState } from './enginePhysics';
import { buildTransmissionState, selectGear, rpmFromSpeed, drivingForce, type TransmissionState } from './transmissionPhysics';
import { calculateAeroForces, aeroConfigFromSim, airDensityAtAltitude, type AeroPhysicsConfig } from './aeroPhysics';
import { simulateStraight, type VehiclePhysics, type EnginePhysicsParams } from './longitudinalDynamics';
import { createTyreState, calculateTyreGrip, updateTyreTemperature, updateTyreWear, avgTyreGrip, type TyreState } from './tyreModel';
import { maxCornerSpeed, simulateCorner, type CornerSimResult } from './cornerSim';
import { suspensionConfigFromVehicle, calculateWeightTransfer, staticWheelLoads, type SuspensionConfig } from './suspensionModel';
import { calculateBrakeForce, createBrakeState, updateBrakeTemperature, brakingZoneDistance, brakingZoneTime, type BrakePhysicsConfig, type BrakeState } from './brakeModel';
import { buildDriverProfile, calculateDriverEffect, simulateDriverError, applyLapVariation, type DriverProfile } from './driverModel';
import { MultiPhysicsCouplingBus } from './multiPhysicsCouplingBus';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface TelemetryPoint {
  distance: number;              // metres from start
  time: number;                  // seconds from start
  speed: number;                 // km/h
  throttle: number;              // 0-1
  brake: number;                 // 0-1
  gear: number;
  rpm: number;
  lateralG: number;
  longitudinalG: number;
  tyreTemp: [number, number, number, number];
  tyreWear: [number, number, number, number];
  drs: boolean;
  segmentIndex: number;
}

export interface SegmentResult {
  index: number;
  name: string;
  type: 'straight' | 'corner';
  entrySpeed: number;            // km/h
  exitSpeed: number;             // km/h
  apexSpeed: number;             // km/h (same as exitSpeed for straights)
  time: number;                  // seconds
  distance: number;              // metres
  maxLateralG: number;
  maxLongG: number;
  gear: number;
  sector: number;
}

export interface LapSimulationResult {
  totalTime: number;
  sectorTimes: number[];
  segmentResults: SegmentResult[];
  topSpeed: number;
  averageSpeed: number;
  cornerSpeeds: { index: number; name: string; apexSpeed: number; lateralG: number }[];
  tyreState: TyreState;
  brakeState: BrakeState;
  fuelUsed: number;
  telemetry: TelemetryPoint[];
  driverErrors: { segment: number; type: string; timeLost: number }[];
}

export interface LapSimConfig {
  trackId: TrackId;
  driverSkill: DriverSkill;
  ambientTemp: number;           // °C
  trackTemp: number;             // °C
  weatherGrip: number;           // 0-1 (1 = dry, 0.55 = heavy rain)
  fuelLoad: number;              // kg
  startingTyreState?: TyreState;
  startingBrakeState?: BrakeState;
  lapNumber: number;             // for driver consistency/fatigue
}

// ---------------------------------------------------------------------------
// Core: simulate one complete lap
// ---------------------------------------------------------------------------

export function simulateLap(
  design: VehicleDesign,
  sim: SimResult,
  config: LapSimConfig,
): LapSimulationResult {
  const track = TRACKS[config.trackId];
  if (!track) {
    return emptyResult();
  }

  // --- Build physics state from design + sim ---
  const engineState = generateTorqueCurve(design.engine, {
    displacement: sim.displacement,
    cylinderCount: sim.cylinderCount,
    powerCurve: sim.powerCurve,
    peakPower: sim.peakPower,
    peakTorque: sim.peakTorque,
    peakPowerRpm: sim.peakPowerRpm,
    peakTorqueRpm: sim.peakTorqueRpm,
    redline: sim.redline,
    maxPistonSpeed: sim.maxPistonSpeed,
    thermalEfficiency: sim.thermalEfficiency,
    knockRisk: sim.knockRisk,
    octaneRequired: sim.octaneRequired,
    bsfc: sim.bsfc,
    turboLag: sim.turboLag,
    boostPressure: sim.boostPressure,
    engineWeight: sim.engineWeight,
    engineCost: sim.engineCost,
    reliability: sim.reliability,
    nvhEngine: sim.nvh,
    emissionsEngine: sim.emissions,
    fuelEconomyEngine: sim.fuelEconomy,
    mguHPower: sim.mguHPower,
    mguKPower: sim.mguKPower,
    combinedPower: sim.combinedPower,
    combinedTorque: sim.combinedTorque,
    batteryWeight: sim.batteryWeight,
    batteryCost: sim.batteryCost,
    batteryEnergy: sim.batteryEnergy,
    electricRange: sim.electricRange,
    regenEfficiency: sim.regenEfficiency,
    energyRecoveryPerLap: 0,
    deployDuration: 0,
    isElectric: sim.isElectric,
    isHybrid: sim.isHybrid,
  });

  const transState = buildTransmissionState(
    design.vehicle,
    engineState.redline,
    engineState.idleRpm,
  );

  const aeroConfig = aeroConfigFromSim(sim);
  aeroConfig.activeAeroEnabled = design.vehicle.aeroResearch.active.enabled;
  aeroConfig.drsReduction = design.vehicle.aeroResearch.active.drs ? 0.18 : 0;
  aeroConfig.rideHeight = design.vehicle.rideHeight;

  // Closed-loop multi-physics aero-thermal cooling drag coupling
  const couplingBus = MultiPhysicsCouplingBus.getInstance();
  const aeroThermal = couplingBus.computeAeroThermalCoupling({
    baseCd: aeroConfig.dragCoeff,
    radiatorAreaM2: 0.35 + (design.vehicle.aeroResearch?.cooling?.radiatorSize ?? 0.5) * 0.2,
    coolingDemandKw: sim.peakPower * Math.max(0.1, 1 - (sim.thermalEfficiency || 0.35)),
    vehicleSpeedKmh: 160,
    activeGrilleShutterClosedPct: design.vehicle.aeroResearch?.active?.enabled ? 50 : 0,
  });
  aeroConfig.dragCoeff = aeroThermal.totalCoupledCd;

  // Air density adjusted for track altitude
  const altitude = track.altitudeChange / 2; // rough average altitude
  const airDensity = airDensityAtAltitude(altitude, config.ambientTemp);

  // Vehicle physics
  const vehicleMass = sim.weight + config.fuelLoad;
  const vehiclePhysics: VehiclePhysics = {
    mass: vehicleMass,
    weightDistFront: sim.weightDistFront,
    cgHeight: sim.cgHeight / 1000, // mm to m
    wheelbase: 2.6, // m estimate
    rollingResistanceCoeff: 0.012,
  };

  // Suspension config
  const suspConfig = suspensionConfigFromVehicle(
    design.vehicle, vehicleMass, sim.weightDistFront, sim.cgHeight,
  );

  // Brake config
  const brakeConfig: BrakePhysicsConfig = {
    brakeType: design.vehicle.brakeType,
    discSizeMm: design.vehicle.brakeDiscSize,
    pistonCount: design.vehicle.brakePistonCount,
    padCompound: design.vehicle.brakePadCompound,
    brakeBias: design.vehicle.brakeBias,
    hasAbs: design.vehicle.electronics.abs,
    hasBrakeCooling: design.vehicle.aeroResearch.cooling.brakeDucts,
  };

  // Engine physics params for longitudinal dynamics
  const engineParams: EnginePhysicsParams = {
    torqueCurve: engineState.torqueCurve,
    redline: engineState.redline,
    hybridBoostTorque: engineState.hybridBoostTorque,
    hybridBoostMaxRpm: engineState.hybridBoostMaxRpm,
    rotationalInertia: engineState.rotationalInertia,
  };

  // Tyre state
  let tyreState = config.startingTyreState || createTyreState(
    design.vehicle.tireCompound,
    config.trackTemp,
    design.vehicle.tirePressure,
  );

  // Brake state
  let brakeState = config.startingBrakeState || createBrakeState();

  // Driver
  const driver = buildDriverProfile(config.driverSkill);
  const driverEffect = calculateDriverEffect(driver, config.weatherGrip < 0.9);

  // --- Walk through every segment ---
  const segmentResults: SegmentResult[] = [];
  const cornerSpeeds: LapSimulationResult['cornerSpeeds'] = [];
  const telemetry: TelemetryPoint[] = [];
  const driverErrors: LapSimulationResult['driverErrors'] = [];

  let totalTime = 0;
  let totalDistance = 0;
  let topSpeed = 0;
  let currentSpeed = 80; // km/h starting speed (approximate first corner exit)
  let fuelUsed = 0;

  // Sector tracking (divide segments into 3 equal sectors)
  const segCount = track.segments.length;
  const sectorSize = Math.ceil(segCount / 3);
  const sectorTimes = [0, 0, 0];

  for (let i = 0; i < track.segments.length; i++) {
    const seg = track.segments[i];
    const sector = Math.min(2, Math.floor(i / sectorSize));
    const segName = `Seg ${i + 1}`;

    // Get current tyre grip
    const tyreGrip = avgTyreGrip(tyreState, 1.0, config.weatherGrip);

    // Calculate braking capability
    const brakeResult = calculateBrakeForce(
      brakeConfig, brakeState, vehicleMass, tyreGrip,
      currentSpeed, design.vehicle.electronics.abs,
    );

    if (seg.type === 'straight') {
      // --- STRAIGHT SEGMENT ---

      // Look ahead: what speed does the next corner require?
      const nextCornerSpeed = lookAheadCornerSpeed(
        track.segments, i, vehicleMass, tyreGrip, aeroConfig, airDensity, suspConfig, driverEffect,
      );

      const straightResult = simulateStraight({
        length: seg.length,
        entrySpeed: currentSpeed,
        maxExitSpeed: nextCornerSpeed,
        gradient: 0,
        airDensity,
        vehicle: vehiclePhysics,
        engine: engineParams,
        trans: transState,
        aeroConfig,
        tyreGrip,
        drsActive: design.vehicle.aeroResearch.active.drs && seg.length > 300,
      });

      const segTime = straightResult.time;
      totalTime += segTime;
      totalDistance += straightResult.distance;
      sectorTimes[sector] += segTime;

      if (straightResult.peakSpeed > topSpeed) topSpeed = straightResult.peakSpeed;
      currentSpeed = straightResult.exitSpeed;

      // Fuel consumption on straight
      const fuelThisSegment = estimateFuelConsumption(sim, straightResult.time, straightResult.avgThrottle);
      fuelUsed += fuelThisSegment;

      // Update tyre temps (straights cool tyres slightly)
      tyreState = updateTyreTemperature(tyreState, {
        lateralForce: [500, 500, 500, 500],
        speed: currentSpeed,
        ambientTemp: config.ambientTemp,
        trackTemp: config.trackTemp,
        dt: segTime,
      });

      // Update brake temps (cooling on straight)
      brakeState = updateBrakeTemperature(brakeState, brakeConfig, 0, currentSpeed, config.ambientTemp, segTime);

      segmentResults.push({
        index: i, name: segName, type: 'straight',
        entrySpeed: Math.round(straightResult.exitSpeed * 0.7 * 10) / 10,
        exitSpeed: straightResult.exitSpeed,
        apexSpeed: straightResult.peakSpeed,
        time: segTime, distance: straightResult.distance,
        maxLateralG: 0,
        maxLongG: Math.round(straightResult.avgThrottle * tyreGrip * 10) / 10,
        gear: straightResult.finalGear, sector,
      });

      // Telemetry point
      telemetry.push({
        distance: totalDistance, time: totalTime,
        speed: currentSpeed, throttle: straightResult.avgThrottle, brake: 0,
        gear: straightResult.finalGear, rpm: rpmFromSpeed(currentSpeed, straightResult.finalGear, transState),
        lateralG: 0, longitudinalG: 0,
        tyreTemp: [...tyreState.temperature], tyreWear: [...tyreState.wear],
        drs: seg.length > 300, segmentIndex: i,
      });

    } else {
      // --- CORNER SEGMENT ---
      const radius = seg.length;
      const arcDeg = seg.arc;

      // Acceleration G available at corner exit
      const gear = selectGear(currentSpeed * 0.7, transState, engineState.redline, engineState.torqueCurve);
      const rpm = rpmFromSpeed(currentSpeed * 0.7, gear, transState);
      const engineTorque = totalTorqueAtRpm(engineState.torqueCurve, rpm, engineState.hybridBoostTorque, engineState.hybridBoostMaxRpm);
      const driveF = drivingForce(engineTorque, gear, transState);
      const accelG = driveF / (vehicleMass * 9.81);

      const cornerResult = simulateCorner(
        {
          radius, arcDeg,
          elevation: 0,
          banking: 0,
          surfaceGrip: 1.0,
          approachSpeed: currentSpeed,
        },
        vehicleMass,
        tyreGrip,
        brakeResult.brakingG,
        accelG,
        aeroConfig,
        airDensity,
        suspConfig,
        gear,
        segName,
      );

      // Apply driver skill modifiers
      let adjustedApex = cornerResult.apexSpeed * driverEffect.apexSpeedFraction;
      let adjustedTime = cornerResult.totalDuration;

      // Driver braking point offset adds time
      if (cornerResult.brakingDistance > 0) {
        adjustedTime += driverEffect.brakingPointOffset / Math.max(currentSpeed / 3.6, 5);
      }

      // Exit throttle delay
      adjustedTime += driverEffect.exitThrottleDelay;

      // Driver errors
      const cornerDifficulty = Math.min(1, (1 / Math.max(radius, 10)) * 80);
      const error = simulateDriverError(driver, cornerDifficulty, tyreState.wear[0], config.lapNumber);
      if (error.occurred) {
        adjustedTime += error.timePenalty;
        driverErrors.push({ segment: i, type: error.type, timeLost: error.timePenalty });
      }

      totalTime += adjustedTime;
      totalDistance += cornerResult.distance;
      sectorTimes[sector] += adjustedTime;

      currentSpeed = cornerResult.exitSpeed;

      // Update tyre state (corners heat tyres significantly)
      const lateralForce = vehicleMass * cornerResult.maxLateralG * 9.81;
      tyreState = updateTyreTemperature(tyreState, {
        lateralForce: [lateralForce * 0.45, lateralForce * 0.45, lateralForce * 0.55, lateralForce * 0.55],
        speed: adjustedApex,
        ambientTemp: config.ambientTemp,
        trackTemp: config.trackTemp,
        dt: adjustedTime,
      });

      // Tyre wear from cornering
      const tyreWearMul = 1 - driverEffect.tyreWearReduction;
      tyreState = updateTyreWear(tyreState, {
        lateralForce: [lateralForce * 0.45, lateralForce * 0.45, lateralForce * 0.55, lateralForce * 0.55],
        longitudinalForce: [0, 0, 0, 0],
      }, adjustedApex, adjustedTime * tyreWearMul, driver.tyreManagement);

      // Update brake temps (braking into corner heats brakes)
      if (cornerResult.brakingDistance > 0) {
        brakeState = updateBrakeTemperature(
          brakeState, brakeConfig,
          brakeResult.maxBrakeForce * 0.7,
          (currentSpeed + cornerResult.apexSpeed) / 2,
          config.ambientTemp,
          cornerResult.brakingDuration,
        );
      }

      // Fuel consumption in corner
      fuelUsed += estimateFuelConsumption(sim, adjustedTime, 0.4);

      cornerSpeeds.push({
        index: i, name: segName,
        apexSpeed: Math.round(adjustedApex * 10) / 10,
        lateralG: cornerResult.maxLateralG,
      });

      segmentResults.push({
        index: i, name: segName, type: 'corner',
        entrySpeed: cornerResult.approachSpeed,
        exitSpeed: cornerResult.exitSpeed,
        apexSpeed: Math.round(adjustedApex * 10) / 10,
        time: adjustedTime, distance: cornerResult.distance,
        maxLateralG: cornerResult.maxLateralG,
        maxLongG: cornerResult.maxBrakingG,
        gear, sector,
      });

      // Telemetry point
      telemetry.push({
        distance: totalDistance, time: totalTime,
        speed: adjustedApex, throttle: 0.3, brake: cornerResult.brakingDistance > 0 ? 0.8 : 0,
        gear, rpm: rpmFromSpeed(adjustedApex, gear, transState),
        lateralG: cornerResult.maxLateralG, longitudinalG: -cornerResult.maxBrakingG,
        tyreTemp: [...tyreState.temperature], tyreWear: [...tyreState.wear],
        drs: false, segmentIndex: i,
      });
    }
  }

  // Average speed
  const avgSpeed = totalDistance > 0 ? (totalDistance / totalTime) * 3.6 : 0;

  return {
    totalTime: Math.round(totalTime * 1000) / 1000,
    sectorTimes: sectorTimes.map(t => Math.round(t * 1000) / 1000),
    segmentResults,
    topSpeed: Math.round(topSpeed * 10) / 10,
    averageSpeed: Math.round(avgSpeed * 10) / 10,
    cornerSpeeds,
    tyreState,
    brakeState,
    fuelUsed: Math.round(fuelUsed * 100) / 100,
    telemetry,
    driverErrors,
  };
}

// ---------------------------------------------------------------------------
// Look ahead: calculate corner speed for the next corner segment
// ---------------------------------------------------------------------------

function lookAheadCornerSpeed(
  segments: TrackSegment[],
  currentIdx: number,
  mass: number,
  tyreGrip: number,
  aeroConfig: AeroPhysicsConfig,
  airDensity: number,
  suspConfig: SuspensionConfig,
  driverEffect: ReturnType<typeof calculateDriverEffect>,
): number {
  // Find the next corner
  for (let j = currentIdx + 1; j < segments.length; j++) {
    if (segments[j].type === 'corner') {
      const vMax = maxCornerSpeed(segments[j].length, mass, tyreGrip, aeroConfig, airDensity);
      return vMax * 3.6 * driverEffect.apexSpeedFraction;
    }
  }
  // No more corners — can go flat out (use 350 km/h as upper limit)
  return 350;
}

// ---------------------------------------------------------------------------
// Fuel consumption estimate
// ---------------------------------------------------------------------------

function estimateFuelConsumption(sim: SimResult, duration: number, throttle: number): number {
  if (sim.isElectric || sim.fuelEconomy === 0) return 0;
  // L/100km at cruise → L/s at given throttle
  const baseLPerHour = sim.fuelEconomy * 0.5; // rough conversion
  return baseLPerHour * (duration / 3600) * (0.3 + throttle * 0.7);
}

// ---------------------------------------------------------------------------
// Empty result fallback
// ---------------------------------------------------------------------------

function emptyResult(): LapSimulationResult {
  return {
    totalTime: 0,
    sectorTimes: [0, 0, 0],
    segmentResults: [],
    topSpeed: 0,
    averageSpeed: 0,
    cornerSpeeds: [],
    tyreState: createTyreState('medium', 25),
    brakeState: createBrakeState(),
    fuelUsed: 0,
    telemetry: [],
    driverErrors: [],
  };
}

// ---------------------------------------------------------------------------
// Convenience: simulate all tracks and return lap times array
// (drop-in replacement for the old simulateLapTimes)
// ---------------------------------------------------------------------------

export function simulateAllTrackLapTimes(
  design: VehicleDesign,
  sim: SimResult,
): { lapTimes: { trackId: TrackId; trackName: string; time: number; topSpeed: number; avgSpeed: number; sectorTimes: number[] }[]; bestLapTrack: TrackId; bestLapTime: number } {

  const trackIds = Object.keys(TRACKS) as TrackId[];

  const lapTimes = trackIds.map((id) => {
    const track = TRACKS[id];
    const result = simulateLap(design, sim, {
      trackId: id,
      driverSkill: 'pro',
      ambientTemp: 22,
      trackTemp: 30,
      weatherGrip: 1.0,
      fuelLoad: 20,
      lapNumber: 1,
    });

    return {
      trackId: id,
      trackName: track.name,
      time: result.totalTime,
      topSpeed: result.topSpeed,
      avgSpeed: result.averageSpeed,
      sectorTimes: result.sectorTimes,
    };
  });

  const best = lapTimes.reduce((a, b) => a.time < b.time ? a : b);

  return {
    lapTimes,
    bestLapTrack: best.trackId,
    bestLapTime: best.time,
  };
}
