// ============================================================================
// HYPERCAR MOTORSPORT PACKAGE — CORE TYPES & REGULATION TAXONOMY
// ============================================================================
// Defines specifications for FIA World Endurance Championship (WEC)
// Le Mans Hypercars (LMH) and LMDh prototypes: enclosed carbon monocoque,
// front-axle electric motor generator unit (MGU), 900V battery, twin-turbo ICE,
// full-width bodywork, roof scoop, dorsal fin, and endurance reliability.
// ============================================================================

export type HypercarChassisMaterial = "T800_CARBON_NOMEX" | "M55J_PITCH_COMPOSITE" | "REINFORCED_KEVLAR_CARBON";
export type HypercarEngineLayout = "V6_TWIN_TURBO_3500CC" | "V8_TWIN_TURBO_4000CC" | "V8_NATURALLY_ASPIRATED_4500CC" | "INLINE4_TURBO_HYBRID";
export type HypercarHybridArchitecture = "FRONT_AXLE_MGU_200KW" | "REAR_CRANK_MGU_150KW" | "DUAL_AXLE_E_AWD_250KW";
export type HypercarAeroPhilosophy = "HIGH_DOWNFORCE_SPA" | "LOW_DRAG_LE_MANS_SPECIAL" | "BALANCED_SPRINT";
export type HypercarCoolingPhilosophy = "MAXIMUM_ENDURANCE_HIGH_AMBIENT" | "STREAMLINED_LOW_DRAG" | "BALANCED_TWIN_HEAT_EXCHANGERS";

export interface HypercarChassisSpec {
  material: HypercarChassisMaterial;
  monocoqueWeightKg: number;
  torsionalRigidityKNmDeg: number;
  frontalCrashAttenuatorScore: number;
  gullwingDoorType: "TOP_HINGED_GULLWING" | "FORWARD_DIHEDRAL_SWAN_WING";
  cockpitDriverVisibilityRating: number; // 0-100
}

export interface HypercarPowertrainSpec {
  iceLayout: HypercarEngineLayout;
  displacementCc: number;
  iceMaxHorsepower: number;
  iceMaxRpm: number;
  twinTurboBoostBar: number;
  thermalEfficiencyPercent: number;
  hybridArchitecture: HypercarHybridArchitecture;
  frontMguPowerKw: number; // 200 kW standard
  frontMguActivationSpeedKmh: number; // 120 km/h FIA minimum dry deployment
  batteryCapacityKwh: number; // ~2.5 kWh to 8.0 kWh
  batteryVoltageV: number; // 800V - 900V
  exhaustRouting: "TOP_EXIT_BLOW_DIFFUSER" | "SIDE_EXIT_AERO_SCULPTED";
}

export interface HypercarAerodynamicsSpec {
  philosophy: HypercarAeroPhilosophy;
  frontSplitterLengthMm: number;
  frontCanardsCount: number;
  roofScoopType: "PERISCOPE_RAM_AIR" | "LOW_PROFILE_TWIN_NACA";
  dorsalFinHeightMm: number; // FIA mandatory shark fin
  rearWingWidthMm: number;
  rearWingAngleDeg: number;
  rearDiffuserTunnelLengthMm: number;
  downforceKgAt250Kmh: number;
  dragKgAt250Kmh: number;
  liftToDragRatio: number; // Must be between 4.0 and 4.8 for FIA WEC BoP
  frontAeroSharePercent: number;
}

export interface HypercarEnduranceSpec {
  coolingCapacityKw: number;
  maxContinuousAmbientTempC: number;
  brakePadLifeStints: number; // e.g. 4 to 8 stints (6-12 hours without replacement)
  tireWearResistanceRating: number; // 1-100
  mechanicalReliabilityRating: number; // 1-100
  fuelTankCapacityLiters: number; // 90L FIA baseline
}

export interface HypercarDesign {
  id: string;
  name: string;
  manufacturer: string;
  class: "LMH" | "LMDh";
  chassis: HypercarChassisSpec;
  powertrain: HypercarPowertrainSpec;
  aerodynamics: HypercarAerodynamicsSpec;
  endurance: HypercarEnduranceSpec;
  totalMassKg: number;
  peakSystemHorsepower: number; // Total capped to 500 kW (680 HP) under FIA BoP
  isHomologated: boolean;
  homologationPassportId?: string;
}
