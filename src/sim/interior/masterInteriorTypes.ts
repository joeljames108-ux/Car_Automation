/**
 * ============================================================================
 * MODULAR INTERIOR STUDIO — MASTER TYPES & COMPONENT TAXONOMY
 * ============================================================================
 * Defines single-source-of-truth types for modular automotive cabins:
 * - Packaging Zones & Fitment Interfaces
 * - 10 Modular Subassemblies (Seating, Dash, Steering, Console, Doors, etc.)
 * - Material Slot Architecture & Procedural Finishes
 * - Multi-Zone Ambient Lighting & Audio Systems
 * - Performance Metrics (Weight, CoG, Cost, Comfort, Sportiness, NVH dB)
 * ============================================================================
 */

import { VehicleBodyType } from "../../exterior3d/types/vehicleConstructionTypes";

// ============================================================================
// 1. MATERIAL SLOT ARCHITECTURE
// ============================================================================

export type InteriorMaterialType =
  | "nappa_leather"
  | "semi_aniline_leather"
  | "perforated_alcantara"
  | "technical_fabric"
  | "3k_twill_carbon_fiber"
  | "forged_carbon_composite"
  | "brushed_billet_aluminum"
  | "open_pore_walnut"
  | "piano_black_lacquer"
  | "titanium_satin_finish"
  | "soft_touch_polyurethane";

export interface MaterialSlotMapping {
  seatPrimaryMaterial: InteriorMaterialType;
  seatSecondaryMaterial: InteriorMaterialType;
  seatStitchingColorHex: string;
  dashboardPrimaryMaterial: InteriorMaterialType;
  dashboardTrimInsert: InteriorMaterialType;
  accentMetalFinish: InteriorMaterialType;
  centerConsolePrimary: InteriorMaterialType;
  doorCardInsert: InteriorMaterialType;
  headlinerMaterial: InteriorMaterialType;
  carpetColorHex: string;
}

// ============================================================================
// 2. SEATING CONFIGURATION
// ============================================================================

export type SeatingCategory = "comfort_executive" | "sport_bolstered" | "track_competition";

export type FrontSeatTypology =
  | "base_comfort_8way"
  | "executive_22way_massage_ottoman"
  | "sport_14way_adaptive_bolster"
  | "carbon_monocoque_fixed_bucket"
  | "fia_homologated_racing_bucket";

export type RearSeatingTypology =
  | "standard_3passenger_bench"
  | "executive_2passenger_lounge"
  | "lightweight_2passenger_sport"
  | "rear_seat_delete_carpeted"
  | "rear_seat_delete_roll_cage_x_brace";

export interface SeatingConfig {
  frontSeatType: FrontSeatTypology;
  rearSeatType: RearSeatingTypology;
  hasSeatHeating: boolean;
  hasSeatVentilation: boolean;
  hasPneumaticMassage: boolean;
  has6PointRacingHarness: boolean;
  harnessColorHex: string;
  lumbarAdjustAxes: number;
  frontSeatsMassKgTotal: number;
  rearSeatsMassKgTotal: number;
  costUSD: number;
}

// ============================================================================
// 3. DASHBOARD & INSTRUMENT CONFIGURATION
// ============================================================================

export type DashboardTypology =
  | "executive_dual_tier_leather"
  | "gt3_competition_dry_carbon"
  | "pillar_to_pillar_hyperscreen_blade"
  | "grand_tourer_handcrafted_cowl"
  | "classic_heritage_brushed_chrome";

export type InstrumentClusterStyle =
  | "classic_dual_analog_dials"
  | "semi_digital_7inch_tft"
  | "virtual_cockpit_12_3inch_oled"
  | "curved_hyper_oled_16inch"
  | "motec_track_racing_dash";

export type HvacVentStyle = "turbine_rotary" | "hidden_continuous_slits" | "aircraft_quad_nozzle";

export interface DashboardConfig {
  typology: DashboardTypology;
  instrumentClusterStyle: InstrumentClusterStyle;
  hvacVentStyle: HvacVentStyle;
  hasPassengerCoPilotDisplay: boolean;
  hasWindshieldHolographicHUD: boolean;
  hasAnalogChronoClock: boolean;
  massKg: number;
  costUSD: number;
}

// ============================================================================
// 4. STEERING WHEEL & COLUMN
// ============================================================================

export type SteeringWheelTypology =
  | "formula_gt3_carbon_yoke"
  | "flat_bottom_alcantara_sport"
  | "classic_heritage_3spoke_polished"
  | "executive_two_spoke_heated"
  | "pro_drift_deep_dish_suede"
  | "cyber_steer_retractable_yoke";

export interface SteeringConfig {
  typology: SteeringWheelTypology;
  diameterMm: number;
  hasMagneticPaddleShifters: boolean;
  hasRotaryDriveModeDial: boolean;
  hasIntegratedRpmShiftLights: boolean;
  hasElectricSteeringColumnAdjust: boolean;
  hasSteeringHeating: boolean;
  massKg: number;
  costUSD: number;
}

// ============================================================================
// 5. CENTER CONSOLE & TRANSMISSION TUNNEL
// ============================================================================

export type CenterConsoleTypology =
  | "open_gated_manual_tunnel"
  | "sequential_dog_ring_tower"
  | "crystal_glass_monostable_rotary"
  | "fighter_jet_start_flap_matrix"
  | "track_competition_fire_suppression"
  | "minimalist_ev_floating_bridge";

export interface CenterConsoleConfig {
  typology: CenterConsoleTypology;
  hasWirelessPhoneCharger: boolean;
  hasCoolerCompartment: boolean;
  hasMechanicalHandbrake: boolean;
  hasCarbonCupholders: boolean;
  massKg: number;
  costUSD: number;
}

// ============================================================================
// 6. DOOR PANELS & CLOSURES
// ============================================================================

export interface DoorPanelsConfig {
  hasIntegratedAudioGrilles: boolean;
  hasAmbientLightBars: boolean;
  hasSoftCloseActuators: boolean;
  doorReleaseType: "polished_aluminum_handle" | "nylon_pull_strap_race" | "electronic_push_button";
  massKgTotal: number;
  costUSD: number;
}

// ============================================================================
// 7. INFOTAINMENT, CONNECTIVITY & ELECTRONICS
// ============================================================================

export type InfotainmentDisplaySize = "compact_8_inch" | "standard_12_3_inch" | "ultrawide_15_6_inch" | "hyperscreen_56_inch";

export interface InfotainmentConfig {
  screenSize: InfotainmentDisplaySize;
  hasTrackTelemetryApp: boolean;
  hasAppleCarPlayAndroidAuto: boolean;
  has360SurroundViewCameras: boolean;
  hasRearSeatEntertainmentScreens: boolean;
  massKg: number;
  costUSD: number;
}

// ============================================================================
// 8. MULTI-ZONE AMBIENT LIGHTING
// ============================================================================

export type AmbientLightingTheme =
  | "cyberpunk_cyan"
  | "scuderia_crimson"
  | "amber_gold_lounge"
  | "ice_blue_calm"
  | "monochrome_white"
  | "gt_track_minimal_red";

export interface AmbientLightingConfig {
  enabled: boolean;
  theme: AmbientLightingTheme;
  colorHex: string;
  brightnessPercent: number;
  illuminatedZones: {
    footwells: boolean;
    doorStrips: boolean;
    dashboardStrip: boolean;
    centerConsole: boolean;
    starlightRoofHeadliner: boolean;
    seatBackBuckets: boolean;
  };
  massKg: number;
  costUSD: number;
}

// ============================================================================
// 9. AUDIO & ACOUSTIC SOUND SYSTEM
// ============================================================================

export type AudioSystemTier =
  | "base_6_speaker_sound"
  | "premium_12_speaker_surround"
  | "spatial_18_speaker_dolby_atmos"
  | "bespoke_24_speaker_diamond_2100w"
  | "audio_delete_track_spec";

export interface AudioSystemConfig {
  tier: AudioSystemTier;
  speakerCount: number;
  amplifierWatts: number;
  hasSubwooferUnderseat: boolean;
  hasActiveNoiseCancellation: boolean;
  massKg: number;
  costUSD: number;
}

// ============================================================================
// 10. SAFETY, ROLL CAGE & FIRE SUPPRESSION
// ============================================================================

export type RollCageOption =
  | "none_standard_chassis"
  | "clubsport_4_point_half_cage"
  | "fia_gt3_6_point_welded_cage"
  | "full_chromoly_spaceframe_reinforcement";

export interface InteriorSafetyConfig {
  rollCage: RollCageOption;
  airbagModuleCount: number;
  hasOnboardFireSuppressionSystem: boolean;
  hasEmergencyElectricalCutoffSwitch: boolean;
  massKg: number;
  costUSD: number;
}

// ============================================================================
// 11. SOLVED INTERIOR PERFORMANCE METRICS
// ============================================================================

export interface MasterInteriorPerformanceMetrics {
  totalInteriorMassKg: number;
  totalInteriorCostUSD: number;
  massDeltaAgainstBaseKg: number; // e.g. -45kg for track, +35kg for luxury
  centerOfGravityOffsetMm: { x: number; y: number; z: number };
  comfortIndexPercent: number;    // 0 to 100
  sportinessIndexPercent: number; // 0 to 100
  lateralSupportGThreshold: number; // Max driver G before sliding (e.g. 1.8G)
  cabinNoiseAt120KmhDbA: number;  // Interior sound level (e.g. 58 dB)
  driverVisibilityScorePercent: number; // 0 to 100
  driverErgonomicsScorePercent: number; // 0 to 100
  luxuryPrestigeIndex: number;    // 0 to 100
}

// ============================================================================
// 12. MASTER INTERIOR STATE (SINGLE-SOURCE-OF-TRUTH)
// ============================================================================

export interface MasterModularInteriorState {
  id: string;
  name: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  author: string;
  bodyType: VehicleBodyType;
  wheelbaseMm: number;
  trackWidthMm: number;
  hasTransmissionTunnel: boolean; // true for ICE longitudinal, false for flat EV floor

  seating: SeatingConfig;
  dashboard: DashboardConfig;
  steering: SteeringConfig;
  console: CenterConsoleConfig;
  doors: DoorPanelsConfig;
  infotainment: InfotainmentConfig;
  materials: MaterialSlotMapping;
  lighting: AmbientLightingConfig;
  audio: AudioSystemConfig;
  safety: InteriorSafetyConfig;

  metrics: MasterInteriorPerformanceMetrics;
}

// ============================================================================
// 13. SIDE-BY-SIDE CABIN COMPARISON DELTA
// ============================================================================

export interface InteriorComparisonDelta {
  cabinA: { id: string; name: string };
  cabinB: { id: string; name: string };
  massDiffKg: number;
  costDiffUSD: number;
  comfortDiffPercent: number;
  sportinessDiffPercent: number;
  noiseIsolationDiffDbA: number;
  lateralGSupportDiff: number;
}
