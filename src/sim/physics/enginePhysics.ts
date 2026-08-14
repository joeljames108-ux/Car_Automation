// ===================================================================
// ENGINE PHYSICS — Torque curve generation, power delivery, hybrid overlay
// ===================================================================
// Phase 1: Reads from EngineConfig + constants, produces detailed torque/power curves
// with RPM-dependent behavior, turbo lag, and hybrid boost modeling.

import type { EngineConfig, EngineSim } from '../types';
import { calculateIMEP } from './combustionModel';
import { calculateBMEP } from './frictionModel';
import { evaluateKnock } from './knockModel';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface TorqueCurvePoint {
  rpm: number;
  torque: number;        // Nm at the crank
  power: number;         // kW
  powerHp: number;       // hp (metric)
  boostPressure: number; // bar (0 for NA)
  volumetricEff: number; // 0-1
}

export interface EnginePhysicsState {
  torqueCurve: TorqueCurvePoint[];
  peakTorque: number;          // Nm
  peakTorqueRpm: number;
  peakPower: number;           // kW
  peakPowerRpm: number;
  redline: number;
  idleRpm: number;
  displacement: number;        // cc
  cylinderCount: number;
  isElectric: boolean;
  isHybrid: boolean;
  hybridBoostTorque: number;   // Nm from electric motor(s)
  hybridBoostMaxRpm: number;   // RPM where electric assist fades
  turboLagRpm: number;         // RPM where full boost arrives (0 = NA)
  engineBrakeTorque: number;   // Nm of engine braking at redline
  rotationalInertia: number;   // kg·m² (flywheel + crank + accessories)
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HP_PER_KW = 1.341;
const RPM_STEP = 250;    // resolution of the curve

// Volumetric efficiency template (fraction of theoretical airflow achieved).
// Peaks around the cam-tuned RPM band.
function baseVolumetricEfficiency(
  rpmFraction: number, // 0-1 (rpm / redline)
  camDuration: number, // degrees
  camLift: number,     // mm
  valvetrainFactor: number, // from constants
  currentRpm: number = 4000,
  valvetrainType: string = "dohc"
): number {
  // Longer cam duration shifts peak VE higher in the rev range
  const peakFrac = 0.55 + ((camDuration - 220) / 400) * 0.25; // ~0.55-0.80
  const width = 0.30 + (camLift / 30) * 0.1;                   // wider lift = broader VE
  const gaussian = Math.exp(-((rpmFraction - peakFrac) ** 2) / (2 * width * width));
  // Base VE: street engines ~0.85 peak, race DOHC VVL ~0.98
  const peakVE = 0.78 + valvetrainFactor * 0.20;
  const lowRpmFloor = 0.60 + valvetrainFactor * 0.05;

  let ve = Math.max(lowRpmFloor, peakVE * gaussian);

  // Valvetrain Float RPM Threshold Mechanics (OHV ~6200, SOHC ~7200, DOHC ~8800, DOHC VVL ~9800)
  const floatRpmMap: Record<string, number> = {
    ohv_2v: 6000, ohv: 6400, sohc_2v: 7000, sohc: 7400, dohc: 8800, dohc_vvl: 9800
  };
  const valveFloatThreshold = floatRpmMap[valvetrainType] || 8500;

  if (currentRpm > valveFloatThreshold) {
    const floatRatio = (currentRpm - valveFloatThreshold) / 1000;
    ve *= Math.exp(-floatRatio * 1.8); // exponential loss of VE due to valve float
  }

  return Math.max(0.1, ve);
}

// Turbo boost ramp: spool-up modeled as sigmoid
function turboBoostFraction(
  rpm: number,
  turboSize: number,   // 0-1
  redline: number,
): number {
  if (turboSize <= 0.01) return 0; // NA engine
  // Larger turbo = later spool
  const spoolRpm = 1500 + turboSize * 3500; // 1500-5000 RPM spool point
  const sharpness = 8 / (1 + turboSize * 2);  // smaller turbo = sharper transition
  const x = (rpm - spoolRpm) / (redline * 0.15);
  return 1 / (1 + Math.exp(-sharpness * x));
}

// ---------------------------------------------------------------------------
// Core: generate torque curve from EngineConfig
// ---------------------------------------------------------------------------

const VALVETRAIN_VE: Record<string, number> = {
  ohv_2v: 0.30, ohv: 0.45, sohc_2v: 0.50, sohc: 0.60, dohc: 0.80, dohc_vvl: 1.0,
};
const INTAKE_BOOST: Record<string, number> = {
  na: 0, supercharger: 0.6, turbo_single: 1.0, twin_turbo: 1.0, bi_turbo: 1.0, compound_turbo: 1.0,
};
const FUEL_EFF: Record<string, number> = {
  carb_single: 0.80, carb: 0.82, tbi: 0.88, port: 0.93, direct: 0.97, dual_injection: 0.99,
};

export function generateTorqueCurve(engine: EngineConfig, engineSim: EngineSim): EnginePhysicsState {
  // --- Electric path ---
  if (engine.layout === 'electric') {
    return generateElectricCurve(engine, engineSim);
  }

  const cylinders = engineSim.cylinderCount;
  const boreM = engine.bore / 1000;
  const strokeM = engine.stroke / 1000;
  const dispCC = (Math.PI / 4) * boreM * boreM * strokeM * cylinders * 1e6;
  const dispL = dispCC / 1000;

  const redline = engine.redline || engine.rpmLimiter;
  const idleRpm = Math.max(600, redline * 0.08);

  const vtFactor = VALVETRAIN_VE[engine.valvetrain] ?? 0.60;
  const fuelEff = FUEL_EFF[engine.fuelSystem] ?? 0.90;
  const isTurbo = engine.turboSize > 0.01 && engine.intake !== 'na';
  const isSupercharged = engine.intake === 'supercharger';

  // Compression ratio torque multiplier (higher CR = more torque, diminishing returns)
  const crFactor = 1 + (engine.compressionRatio - 10) * 0.012;

  // Ignition timing effectiveness (optimal ~30° BTDC, too much = knock)
  const ignFactor = 1 + (Math.min(engine.ignitionTiming, 35) - 20) * 0.004;

  // AFR efficiency (stoich 14.7 = 1.0, richer = more power, leaner = less)
  const afrFactor = engine.afr < 12.5 ? 0.97 : engine.afr < 14.0 ? 1.02 : engine.afr < 15.0 ? 1.0 : 0.95;

  // Intercooler efficiency (for boosted only)
  const icEff = isTurbo ? 0.90 + engine.intercoolerEff * 0.10 : 1.0;

  // Build the curve
  const curve: TorqueCurvePoint[] = [];
  let peakT = 0, peakTRpm = 0, peakP = 0, peakPRpm = 0;

  for (let rpm = Math.round(idleRpm); rpm <= redline; rpm += RPM_STEP) {
    const frac = rpm / redline;

    // 1. Volumetric efficiency at this RPM
    const ve = baseVolumetricEfficiency(frac, engine.camDuration, engine.camLift, vtFactor);

    // 2. Forced induction boost & effective VE
    let boostBar = 0;
    if (isTurbo) {
      const boostFrac = turboBoostFraction(rpm, engine.turboSize, redline);
      boostBar = engine.boostPressure * boostFrac;
    } else if (isSupercharged) {
      boostBar = engine.boostPressure * Math.min(1, frac * 1.2);
    }
    const effectiveVe = ve * (1 + boostBar * 0.70 * icEff);

    // 3. Thermodynamic Indicated Mean Effective Pressure (IMEP)
    const combustionRes = calculateIMEP({
      compressionRatio: engine.compressionRatio,
      volumetricEfficiency: effectiveVe,
      fuelLHV: 44.0, // MJ/kg gasoline
      stoichAFR: 14.7,
      actualAFR: engine.afr || 13.0,
      combustionDurationDeg: 45,
      gamma: 1.32,
    });

    // 4. Mechanical Friction & Pumping Losses (FMEP + PMEP)
    const frictionRes = calculateBMEP(combustionRes.imepGross, {
      rpm,
      redline,
      boreMm: engine.bore,
      strokeMm: engine.stroke,
      cylinderCount: cylinders,
      valvetrainType: engine.valvetrain,
      peakCylinderPressureBar: combustionRes.cylinderPeakPressureEstimate,
      boostPressureBar: boostBar,
      isThrottled: true,
      throttlePosition: 1.0, // WOT torque curve
    });

    // 5. Torque from Brake Mean Effective Pressure: Torque (N·m) = (BMEP_bar * 100,000 * Disp_m³) / (4 * π)
    const dispM3 = dispL / 1000;
    let torque = (frictionRes.bmep * 100000 * dispM3) / (4 * Math.PI) * fuelEff * ignFactor * afrFactor;

    // 6. Exhaust tuning bonus (primary length resonance)
    const exhTuningRpm = 330000 / Math.max(engine.exhaustPrimaryLength, 200);
    const exhBonus = 1 + 0.03 * Math.exp(-(((rpm - exhTuningRpm) / 1500) ** 2));
    torque *= exhBonus;

    // Power in kW: P = T × ω = T × (2π × rpm / 60) / 1000
    const powerKw = (torque * 2 * Math.PI * rpm) / 60000;
    const powerHp = powerKw * HP_PER_KW;

    curve.push({ rpm, torque: Math.round(torque * 10) / 10, power: Math.round(powerKw * 10) / 10, powerHp: Math.round(powerHp * 10) / 10, boostPressure: Math.round(boostBar * 100) / 100, volumetricEff: Math.round(ve * 1000) / 1000 });

    if (torque > peakT) { peakT = torque; peakTRpm = rpm; }
    if (powerKw > peakP) { peakP = powerKw; peakPRpm = rpm; }
  }

  // Hybrid electric boost overlay
  let hybridBoostTorque = 0;
  let hybridBoostMaxRpm = 0;
  if (engine.hybridArchitecture !== 'none') {
    const totalMotorKw = (engine.hybridFrontMotorEnabled ? engine.hybridFrontMotorPower : 0) +
                         (engine.hybridRearMotorEnabled ? engine.hybridRearMotorPower : 0) +
                         engine.hybridMotorPower;
    // Electric motors produce peak torque from 0 RPM, fading at high RPM
    hybridBoostMaxRpm = redline * 0.5;
    // P = T × ω → T = P / ω  (at low RPM, torque is very high but limited by motor rating)
    hybridBoostTorque = totalMotorKw > 0 ? Math.min(totalMotorKw * 1000 / (hybridBoostMaxRpm * 2 * Math.PI / 60), totalMotorKw * 9.549) : 0;
  }

  // Engine braking torque (proportional to displacement and friction)
  const engineBrakeTorque = dispL * 15 + (redline / 1000) * 2;

  // Rotational inertia estimate (flywheel + crank + pulleys)
  // Light flywheel: ~0.05 kg·m², heavy: ~0.20 kg·m²
  const flywheelInertia = 0.08 + dispL * 0.015;
  const crankInertia = dispL * 0.005;
  const rotationalInertia = flywheelInertia + crankInertia;

  const turboLagRpm = isTurbo ? 1500 + engine.turboSize * 3500 : 0;

  return {
    torqueCurve: curve,
    peakTorque: Math.round(peakT * 10) / 10,
    peakTorqueRpm: peakTRpm,
    peakPower: Math.round(peakP * 10) / 10,
    peakPowerRpm: peakPRpm,
    redline,
    idleRpm: Math.round(idleRpm),
    displacement: Math.round(dispCC),
    cylinderCount: cylinders,
    isElectric: false,
    isHybrid: engine.hybridArchitecture !== 'none',
    hybridBoostTorque: Math.round(hybridBoostTorque * 10) / 10,
    hybridBoostMaxRpm,
    turboLagRpm: Math.round(turboLagRpm),
    engineBrakeTorque: Math.round(engineBrakeTorque * 10) / 10,
    rotationalInertia: Math.round(rotationalInertia * 1000) / 1000,
  };
}

// ---------------------------------------------------------------------------
// Electric motor curve
// ---------------------------------------------------------------------------

function generateElectricCurve(engine: EngineConfig, engineSim: EngineSim): EnginePhysicsState {
  const maxRpm = engine.rpmLimiter || 15000;
  const motorKw = engine.evMotorPower || engineSim.combinedPower / HP_PER_KW;
  // EV torque: flat from 0 to base speed, then constant-power falloff
  const baseSpeedRpm = maxRpm * 0.35;
  const peakTorque = motorKw > 0 ? (motorKw * 1000 * 60) / (2 * Math.PI * baseSpeedRpm) : 400;

  const curve: TorqueCurvePoint[] = [];
  let peakP = 0, peakPRpm = 0;

  for (let rpm = 500; rpm <= maxRpm; rpm += RPM_STEP) {
    let torque: number;
    if (rpm <= baseSpeedRpm) {
      torque = peakTorque; // flat torque region
    } else {
      // Constant power region: T = P / ω
      torque = (motorKw * 1000 * 60) / (2 * Math.PI * rpm);
    }
    const powerKw = (torque * 2 * Math.PI * rpm) / 60000;
    const powerHp = powerKw * HP_PER_KW;
    curve.push({ rpm, torque: Math.round(torque * 10) / 10, power: Math.round(powerKw * 10) / 10, powerHp: Math.round(powerHp * 10) / 10, boostPressure: 0, volumetricEff: 1 });
    if (powerKw > peakP) { peakP = powerKw; peakPRpm = rpm; }
  }

  return {
    torqueCurve: curve,
    peakTorque: Math.round(peakTorque * 10) / 10,
    peakTorqueRpm: 500,
    peakPower: Math.round(peakP * 10) / 10,
    peakPowerRpm: peakPRpm,
    redline: maxRpm,
    idleRpm: 0,
    displacement: 0,
    cylinderCount: 0,
    isElectric: true,
    isHybrid: false,
    hybridBoostTorque: 0,
    hybridBoostMaxRpm: 0,
    turboLagRpm: 0,
    engineBrakeTorque: 0,
    rotationalInertia: 0.02, // single reduction gear
  };
}

// ---------------------------------------------------------------------------
// Helpers used by other modules
// ---------------------------------------------------------------------------

/** Interpolate torque at any RPM from the pre-computed curve */
export function torqueAtRpm(curve: TorqueCurvePoint[], rpm: number): number {
  if (curve.length === 0) return 0;
  if (rpm <= curve[0].rpm) return curve[0].torque;
  if (rpm >= curve[curve.length - 1].rpm) return curve[curve.length - 1].torque;
  for (let i = 0; i < curve.length - 1; i++) {
    if (rpm >= curve[i].rpm && rpm <= curve[i + 1].rpm) {
      const t = (rpm - curve[i].rpm) / (curve[i + 1].rpm - curve[i].rpm);
      return curve[i].torque + t * (curve[i + 1].torque - curve[i].torque);
    }
  }
  return curve[curve.length - 1].torque;
}

/** Get the torque including hybrid electric overlay at given RPM */
export function totalTorqueAtRpm(
  curve: TorqueCurvePoint[], rpm: number,
  hybridBoostTorque: number, hybridBoostMaxRpm: number,
): number {
  let t = torqueAtRpm(curve, rpm);
  if (hybridBoostTorque > 0 && hybridBoostMaxRpm > 0) {
    // Electric motor torque fades linearly above base speed
    const eFrac = rpm < hybridBoostMaxRpm ? 1 : Math.max(0, 1 - (rpm - hybridBoostMaxRpm) / hybridBoostMaxRpm);
    t += hybridBoostTorque * eFrac;
  }
  return t;
}
