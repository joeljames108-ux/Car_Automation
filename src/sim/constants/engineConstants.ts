import type {
  EngineLayout, CrankMaterial, PistonType, ValvetrainType, IntakeType, FuelSystemType,
} from "../types";

// ---------- Engine layouts ----------

export const ENGINE_LAYOUTS: Record<EngineLayout, {
  label: string;
  cylinders: number;
  weightBase: number;
  costFactor: number;
  balanceFactor: number;  // 0-1, higher = smoother
  rpmFactor: number;
  sizeFactor: number;
}> = {
  i3: { label: "Inline-3", cylinders: 3, weightBase: 90, costFactor: 0.7, balanceFactor: 0.3, rpmFactor: 1.1, sizeFactor: 0.7 },
  i4: { label: "Inline-4", cylinders: 4, weightBase: 120, costFactor: 0.8, balanceFactor: 0.4, rpmFactor: 1.05, sizeFactor: 0.8 },
  i6: { label: "Inline-6", cylinders: 6, weightBase: 170, costFactor: 1.0, balanceFactor: 0.9, rpmFactor: 1.0, sizeFactor: 1.1 },
  v6: { label: "V6", cylinders: 6, weightBase: 160, costFactor: 1.1, balanceFactor: 0.7, rpmFactor: 1.0, sizeFactor: 0.9 },
  v8: { label: "V8", cylinders: 8, weightBase: 220, costFactor: 1.3, balanceFactor: 0.8, rpmFactor: 0.95, sizeFactor: 1.0 },
  v10: { label: "V10", cylinders: 10, weightBase: 260, costFactor: 1.6, balanceFactor: 0.75, rpmFactor: 1.1, sizeFactor: 1.2 },
  v12: { label: "V12", cylinders: 12, weightBase: 300, costFactor: 2.0, balanceFactor: 1.0, rpmFactor: 1.0, sizeFactor: 1.4 },
  w12: { label: "W12", cylinders: 12, weightBase: 280, costFactor: 2.4, balanceFactor: 0.88, rpmFactor: 0.92, sizeFactor: 1.0 },
  w16: { label: "W16", cylinders: 16, weightBase: 400, costFactor: 4.5, balanceFactor: 0.82, rpmFactor: 0.85, sizeFactor: 1.15 },
  w18: { label: "W18", cylinders: 18, weightBase: 450, costFactor: 5.5, balanceFactor: 0.78, rpmFactor: 0.8, sizeFactor: 1.25 },
  boxer4: { label: "Boxer-4", cylinders: 4, weightBase: 130, costFactor: 1.1, balanceFactor: 0.85, rpmFactor: 1.0, sizeFactor: 1.0 },
  boxer6: { label: "Boxer-6", cylinders: 6, weightBase: 180, costFactor: 1.3, balanceFactor: 0.95, rpmFactor: 1.0, sizeFactor: 1.2 },
  rotary: { label: "Rotary", cylinders: 2, weightBase: 90, costFactor: 1.4, balanceFactor: 0.6, rpmFactor: 1.5, sizeFactor: 0.5 },
  hybrid: { label: "Hybrid (ICE+E)", cylinders: 6, weightBase: 200, costFactor: 1.8, balanceFactor: 0.85, rpmFactor: 1.0, sizeFactor: 1.1 },
  electric: { label: "Electric", cylinders: 0, weightBase: 0, costFactor: 1.0, balanceFactor: 1.0, rpmFactor: 0, sizeFactor: 0 },
};

export const CRANK_MATERIALS: Record<CrankMaterial, {
  label: string;
  weightFactor: number;
  strengthFactor: number;
  costFactor: number;
}> = {
  cast_iron: { label: "Cast Iron", weightFactor: 1.2, strengthFactor: 0.7, costFactor: 0.6 },
  forged_steel: { label: "Forged Steel", weightFactor: 1.0, strengthFactor: 0.85, costFactor: 1.0 },
  billet_steel: { label: "Billet Steel", weightFactor: 0.9, strengthFactor: 0.95, costFactor: 1.8 },
  titanium: { label: "Titanium", weightFactor: 0.6, strengthFactor: 1.0, costFactor: 4.0 },
};

export const PISTON_TYPES: Record<PistonType, {
  label: string;
  weightFactor: number;
  strengthFactor: number;
  costFactor: number;
  heatResistance: number;
}> = {
  cast: { label: "Cast", weightFactor: 1.0, strengthFactor: 0.7, costFactor: 0.5, heatResistance: 0.6 },
  forged: { label: "Forged", weightFactor: 0.9, strengthFactor: 0.85, costFactor: 1.0, heatResistance: 0.8 },
  billet: { label: "Billet", weightFactor: 0.85, strengthFactor: 0.95, costFactor: 2.0, heatResistance: 0.9 },
  ceramic: { label: "Ceramic", weightFactor: 0.6, strengthFactor: 1.0, costFactor: 5.0, heatResistance: 1.0 },
};

export const VALVETRAIN_TYPES: Record<ValvetrainType, {
  label: string;
  valvesPerCyl: number;
  weightFactor: number;
  costFactor: number;
  rpmFactor: number;
  efficiencyFactor: number;
}> = {
  ohv_2v: { label: "OHV 2V (Pushrod Economy)", valvesPerCyl: 2, weightFactor: 0.75, costFactor: 0.5, rpmFactor: 0.7, efficiencyFactor: 0.78 },
  ohv: { label: "OHV (Pushrod)", valvesPerCyl: 2, weightFactor: 0.8, costFactor: 0.7, rpmFactor: 0.75, efficiencyFactor: 0.8 },
  sohc_2v: { label: "SOHC 2V (Economy)", valvesPerCyl: 2, weightFactor: 0.9, costFactor: 0.75, rpmFactor: 0.85, efficiencyFactor: 0.82 },
  sohc: { label: "SOHC 4V", valvesPerCyl: 4, weightFactor: 1.0, costFactor: 1.0, rpmFactor: 0.9, efficiencyFactor: 0.85 },
  dohc: { label: "DOHC", valvesPerCyl: 4, weightFactor: 1.1, costFactor: 1.2, rpmFactor: 1.0, efficiencyFactor: 0.93 },
  dohc_vvl: { label: "DOHC + VVL", valvesPerCyl: 4, weightFactor: 1.15, costFactor: 1.6, rpmFactor: 1.15, efficiencyFactor: 0.98 },
};

export const INTAKE_TYPES: Record<IntakeType, {
  label: string;
  parasiticLoss: number;
  boostMax: number;
  weightFactor: number;
  costFactor: number;
  efficiencyFactor: number;
}> = {
  na: { label: "Naturally Aspirated", parasiticLoss: 0, boostMax: 0, weightFactor: 1.0, costFactor: 1.0, efficiencyFactor: 1.0 },
  supercharger: { label: "Supercharger", parasiticLoss: 0.15, boostMax: 1.5, weightFactor: 1.3, costFactor: 1.8, efficiencyFactor: 0.85 },
  turbo_single: { label: "Single Turbo", parasiticLoss: 0.05, boostMax: 2.5, weightFactor: 1.2, costFactor: 1.5, efficiencyFactor: 0.92 },
  twin_turbo: { label: "Twin Turbo", parasiticLoss: 0.04, boostMax: 3.0, weightFactor: 1.35, costFactor: 2.0, efficiencyFactor: 0.94 },
  bi_turbo: { label: "Bi-Turbo (Seq.)", parasiticLoss: 0.03, boostMax: 3.5, weightFactor: 1.4, costFactor: 2.5, efficiencyFactor: 0.96 },
  compound_turbo: { label: "Compound Turbo", parasiticLoss: 0.02, boostMax: 5.0, weightFactor: 1.5, costFactor: 3.0, efficiencyFactor: 0.98 },
};

export const FUEL_SYSTEMS: Record<FuelSystemType, {
  label: string;
  efficiencyFactor: number;
  costFactor: number;
  powerFactor: number;
  afrStoich: number;
}> = {
  carb_single: { label: "Single Carburetor", efficiencyFactor: 0.80, costFactor: 0.3, powerFactor: 0.85, afrStoich: 14.7 },
  carb: { label: "Dual Carburetor", efficiencyFactor: 0.85, costFactor: 0.4, powerFactor: 0.9, afrStoich: 14.7 },
  tbi: { label: "Throttle Body Inj (TBI)", efficiencyFactor: 0.88, costFactor: 0.55, powerFactor: 0.93, afrStoich: 14.7 },
  port: { label: "Port Injection (MPI)", efficiencyFactor: 0.92, costFactor: 1.0, powerFactor: 0.96, afrStoich: 14.7 },
  direct: { label: "Direct Injection (GDI)", efficiencyFactor: 0.96, costFactor: 1.4, powerFactor: 1.0, afrStoich: 14.7 },
  dual_injection: { label: "Dual Injection", efficiencyFactor: 0.98, costFactor: 1.8, powerFactor: 1.02, afrStoich: 14.7 },
};

// ---------- Turbo Mechanics ----------

export const TURBO_HOUSINGS: Record<string, {
  label: string;
  heatTolerance: number;  // 0-1 (higher = better at high EGT)
  weightFactor: number;
  costFactor: number;
  durability: number;     // 0-1
}> = {
  cast_iron: { label: "Cast Iron", heatTolerance: 0.65, weightFactor: 1.3, costFactor: 0.6, durability: 0.85 },
  inconel: { label: "Inconel 718", heatTolerance: 0.95, weightFactor: 1.0, costFactor: 3.0, durability: 0.95 },
  titanium: { label: "Titanium", heatTolerance: 0.80, weightFactor: 0.55, costFactor: 4.5, durability: 0.88 },
  ceramic_coated: { label: "Ceramic Coated", heatTolerance: 0.90, weightFactor: 1.1, costFactor: 2.0, durability: 0.78 },
};

export const INTERCOOLER_TYPES: Record<string, {
  label: string;
  coolingEff: number;     // 0-1 base cooling efficiency
  pressureDrop: number;   // 0-1 (lower = better flow)
  weightFactor: number;
  costFactor: number;
}> = {
  none: { label: "None", coolingEff: 0, pressureDrop: 0, weightFactor: 1.0, costFactor: 0 },
  air_to_air: { label: "Air-to-Air (FMIC)", coolingEff: 0.70, pressureDrop: 0.06, weightFactor: 1.15, costFactor: 1.0 },
  air_to_water: { label: "Air-to-Water", coolingEff: 0.85, pressureDrop: 0.04, weightFactor: 1.25, costFactor: 2.0 },
  water_spray: { label: "Water Spray IC", coolingEff: 0.92, pressureDrop: 0.05, weightFactor: 1.30, costFactor: 2.5 },
  cryogenic: { label: "Cryogenic (Race)", coolingEff: 0.98, pressureDrop: 0.02, weightFactor: 1.45, costFactor: 8.0 },
};

export const WASTEGATE_TYPES: Record<string, {
  label: string;
  flowCapacity: number;  // 0-1 (how much exhaust gas can bypass)
  responseTime: number;  // 0-1 (higher = faster response)
  costFactor: number;
  noiseFactor: number;   // 0-1 (higher = louder)
}> = {
  none: { label: "None", flowCapacity: 0, responseTime: 0, costFactor: 0, noiseFactor: 0 },
  internal: { label: "Internal Actuator", flowCapacity: 0.5, responseTime: 0.6, costFactor: 1.0, noiseFactor: 0.2 },
  external_38mm: { label: "External 38mm", flowCapacity: 0.65, responseTime: 0.75, costFactor: 1.8, noiseFactor: 0.5 },
  external_44mm: { label: "External 44mm", flowCapacity: 0.8, responseTime: 0.8, costFactor: 2.2, noiseFactor: 0.6 },
  external_60mm: { label: "External 60mm", flowCapacity: 0.95, responseTime: 0.85, costFactor: 3.0, noiseFactor: 0.7 },
  screamer_pipe: { label: "Screamer Pipe (Race)", flowCapacity: 1.0, responseTime: 0.95, costFactor: 3.5, noiseFactor: 1.0 },
};

export const BOV_TYPES: Record<string, {
  label: string;
  surgeProtection: number;  // 0-1 (higher = better compressor protection)
  spoolRetention: number;   // 0-1 (higher = turbo stays spooled on throttle lift)
  costFactor: number;
  noiseFactor: number;      // 0-1 (higher = louder)
}> = {
  none: { label: "None", surgeProtection: 0, spoolRetention: 0.5, costFactor: 0, noiseFactor: 0 },
  recirculating: { label: "Recirculating", surgeProtection: 0.85, spoolRetention: 0.9, costFactor: 1.0, noiseFactor: 0.1 },
  vent_to_atmosphere: { label: "Vent-to-Atmosphere", surgeProtection: 0.95, spoolRetention: 0.3, costFactor: 1.5, noiseFactor: 0.9 },
  hybrid_bov: { label: "Hybrid (Dual-Port)", surgeProtection: 0.92, spoolRetention: 0.7, costFactor: 2.2, noiseFactor: 0.5 },
  compressor_surge: { label: "Surge (No BOV)", surgeProtection: 0, spoolRetention: 1.0, costFactor: 0, noiseFactor: 0.7 },
};

export const BOOST_CONTROLLERS: Record<string, {
  label: string;
  accuracy: number;      // 0-1 (boost target accuracy)
  responseTime: number;  // 0-1 (higher = faster correction)
  costFactor: number;
  overboostProtection: number; // 0-1
}> = {
  none: { label: "None (Wastegate Only)", accuracy: 0.4, responseTime: 0.3, costFactor: 0, overboostProtection: 0.2 },
  manual: { label: "Manual Boost Controller", accuracy: 0.55, responseTime: 0.4, costFactor: 0.8, overboostProtection: 0.3 },
  electronic: { label: "Electronic (EBC)", accuracy: 0.8, responseTime: 0.75, costFactor: 1.5, overboostProtection: 0.7 },
  closed_loop: { label: "Closed-Loop PID", accuracy: 0.95, responseTime: 0.92, costFactor: 3.0, overboostProtection: 0.95 },
  map_switching: { label: "Map-Switch (Multi-Map)", accuracy: 0.9, responseTime: 0.88, costFactor: 4.0, overboostProtection: 0.9 },
};

export const HYBRID_ARCHITECTURES: Record<string, {
  label: string;
  minBattery: number; // kWh
  maxBattery: number; // kWh
  maxMotorPower: number; // kW
  costFactor: number;
  weightPenalty: number; // kg
  regenMultiplier: number; // 0-1
  efficiencyBonus: number; // factor on fuel consumption (lower is better, e.g. 0.8)
}> = {
  none: { label: "None", minBattery: 0, maxBattery: 0, maxMotorPower: 0, costFactor: 1.0, weightPenalty: 0, regenMultiplier: 0.0, efficiencyBonus: 1.0 },
  mhev: { label: "Mild (MHEV)", minBattery: 0.5, maxBattery: 2, maxMotorPower: 25, costFactor: 1.1, weightPenalty: 40, regenMultiplier: 0.4, efficiencyBonus: 0.88 },
  fhev: { label: "Full (FHEV)", minBattery: 1.0, maxBattery: 4, maxMotorPower: 120, costFactor: 1.25, weightPenalty: 90, regenMultiplier: 0.85, efficiencyBonus: 0.72 },
  phev: { label: "Plug-in (PHEV)", minBattery: 8.0, maxBattery: 30, maxMotorPower: 250, costFactor: 1.45, weightPenalty: 220, regenMultiplier: 0.9, efficiencyBonus: 0.55 },
  range_extender: { label: "Series (REx)", minBattery: 10.0, maxBattery: 40, maxMotorPower: 300, costFactor: 1.4, weightPenalty: 180, regenMultiplier: 0.9, efficiencyBonus: 0.6 },
};

export const MOTOR_PLACEMENTS: Record<string, {
  label: string;
  regenEfficiency: number; // 0-1
  weightFactor: number;
  costFactor: number;
  drivetrainImpact: string;
  packagingComplexity: number; // 0-1
}> = {
  p0: { label: "P0 (Belt-driven Starter Generator)", regenEfficiency: 0.45, weightFactor: 1.0, costFactor: 1.0, drivetrainImpact: "None", packagingComplexity: 0.1 },
  p1: { label: "P1 (Crankshaft Mounted Motor)", regenEfficiency: 0.7, weightFactor: 1.2, costFactor: 1.3, drivetrainImpact: "None", packagingComplexity: 0.3 },
  p2: { label: "P2 (Gearbox Input Shaft)", regenEfficiency: 0.85, weightFactor: 1.3, costFactor: 1.6, drivetrainImpact: "Allows EV Mode", packagingComplexity: 0.6 },
  p3: { label: "P3 (Gearbox Output Shaft)", regenEfficiency: 0.88, weightFactor: 1.35, costFactor: 1.7, drivetrainImpact: "Allows EV Mode", packagingComplexity: 0.7 },
  p4: { label: "P4 (Rear Axle / Electric AWD)", regenEfficiency: 0.95, weightFactor: 1.6, costFactor: 2.2, drivetrainImpact: "Forces e-AWD", packagingComplexity: 0.9 },
  p2_p4: { label: "P2+P4 (Dual Motor AWD)", regenEfficiency: 0.98, weightFactor: 2.2, costFactor: 3.2, drivetrainImpact: "Forces e-AWD", packagingComplexity: 1.0 },
};

// ---------- Battery & MGU ----------

export const BATTERY_CHEMISTRIES: Record<string, {
  label: string;
  energyDensity: number;  // kWh/kg
  weightPerKwh: number;   // kg/kWh
  costPerKwh: number;     // $/kWh
  cycleLife: number;
  dischargeRate: number;  // C-rating
  thermalStability: number; // 0-1
}> = {
  nimh: { label: "NiMH", energyDensity: 0.065, weightPerKwh: 15.4, costPerKwh: 200, cycleLife: 500, dischargeRate: 5, thermalStability: 0.7 },
  li_ion: { label: "Lithium-Ion", energyDensity: 0.16, weightPerKwh: 6.25, costPerKwh: 135, cycleLife: 1200, dischargeRate: 12, thermalStability: 0.8 },
  lfp: { label: "LiFePO4 (LFP)", energyDensity: 0.12, weightPerKwh: 8.3, costPerKwh: 110, cycleLife: 3500, dischargeRate: 10, thermalStability: 0.98 },
  nmc: { label: "NMC", energyDensity: 0.19, weightPerKwh: 5.2, costPerKwh: 140, cycleLife: 1800, dischargeRate: 15, thermalStability: 0.82 },
  nca: { label: "NCA", energyDensity: 0.22, weightPerKwh: 4.55, costPerKwh: 160, cycleLife: 1400, dischargeRate: 18, thermalStability: 0.78 },
  sodium_ion: { label: "Sodium-Ion", energyDensity: 0.10, weightPerKwh: 10.0, costPerKwh: 75, cycleLife: 4000, dischargeRate: 8, thermalStability: 0.95 },
  solid_state: { label: "Solid-State", energyDensity: 0.32, weightPerKwh: 3.1, costPerKwh: 350, cycleLife: 5000, dischargeRate: 25, thermalStability: 1.0 },
};

export const EV_MOTOR_TYPES: Record<string, {
  label: string;
  efficiency: number;     // 0-1
  powerDensity: number;   // kW/kg
  costFactor: number;
  torqueFactor: number;   // 0-1, higher = more low-end torque
  weight: number;         // kg per motor
}> = {
  pmac: { label: "PMAC", efficiency: 0.95, powerDensity: 5.0, costFactor: 1.2, torqueFactor: 0.95, weight: 45 },
  pmsm: { label: "PMSM (Permanent Magnet Synchronous)", efficiency: 0.97, powerDensity: 6.2, costFactor: 1.4, torqueFactor: 0.98, weight: 38 },
  induction: { label: "Induction Motor", efficiency: 0.90, powerDensity: 3.5, costFactor: 0.8, torqueFactor: 0.8, weight: 55 },
  bldc: { label: "Brushless DC (BLDC)", efficiency: 0.92, powerDensity: 4.2, costFactor: 1.0, torqueFactor: 0.88, weight: 48 },
  switched_reluctance: { label: "Switched Reluctance (SRM)", efficiency: 0.89, powerDensity: 3.8, costFactor: 0.7, torqueFactor: 0.82, weight: 52 },
  radial_flux: { label: "Radial Flux Motor", efficiency: 0.94, powerDensity: 5.2, costFactor: 1.1, torqueFactor: 0.92, weight: 42 },
  axial_flux: { label: "Axial Flux Motor", efficiency: 0.98, powerDensity: 9.5, costFactor: 2.8, torqueFactor: 1.0, weight: 22 },
};

export const MGU_H_MODES: Record<string, {
  label: string;
  recoveryFactor: number;  // 0-1
  spoolAssist: number;     // reduction in turbo lag 0-1
  cost: number;
}> = {
  off: { label: "Off", recoveryFactor: 0, spoolAssist: 0, cost: 0 },
  harvest_only: { label: "Harvest Only", recoveryFactor: 0.7, spoolAssist: 0, cost: 4000 },
  electric_spool: { label: "Electric Spool (Lag-Cancel)", recoveryFactor: 0.4, spoolAssist: 0.85, cost: 6500 },
  full_hybrid: { label: "Full MGU-H (F1-Style)", recoveryFactor: 0.9, spoolAssist: 0.95, cost: 12000 },
};
