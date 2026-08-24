// ============================================================================
// ULTRA-FIDELITY 3D INTERIOR & COCKPIT STUDIO — TYPE ARCHITECTURE & TAXONOMY
// ============================================================================
// Comprehensive type definitions for modular car interior configurations,
// 3D procedural geometries, live HMI canvas screens, ergonomics, and acoustic NVH.
// ============================================================================

import { VehicleBodyType } from './vehicleConstructionTypes';

// ============================================================================
// 1. DASHBOARD ARCHITECTURES
// ============================================================================

export type DashboardArchitectureClass =
  | 'executive_monolith'    // Sweeping dual-pane glass, open-pore wood waterfall, hidden micro-louvres
  | 'gt3_track_cockpit'     // Ultra-lightweight dry carbon cowl, exposed roll-cage brackets, MoTeC shift lights
  | 'hyper_minimalist_glass'// Floating monolithic curved OLED glass blade, flush capacitive haptic controls
  | 'luxury_grand_tourer'   // Hand-stitched dual-tone Nappa leather dash cap, knurled aluminum rotary vents
  | 'classic_heritage_sport';// Deep-set round brushed chrome bezels, retro toggle switches, analog dials

export interface DashboardSpecification {
  id: string;
  name: string;
  architectureClass: DashboardArchitectureClass;
  compatibleBodyTypes: VehicleBodyType[];
  massKg: number;
  costUSD: number;
  widthM: number;
  depthM: number;
  heightM: number;
  hvacVentStyle: 'turbine_rotary' | 'hidden_slits' | 'aircraft_nozzle' | 'classic_mesh' | 'linear_slot';
  hasGloveboxChiller: boolean;
  hasHeadsUpDisplaySlot: boolean;
  hasAmbientLightbar: boolean;
  hasPassengerDisplaySlot: boolean;
  trimPanelLocations: string[];
  description: string;
}

// ============================================================================
// 2. STEERING WHEEL & CONTROL COLUMN TYPOLOGIES
// ============================================================================

export type SteeringWheelTypology =
  | 'gt3_race_yoke'         // Open-top carbon yoke, dual rotary thumb dials, 16-LED shift light bar, titanium magnetic paddles
  | 'flat_bottom_sport'     // Perforated leather/Alcantara rim, 12 o'clock stripe, aluminum paddles, drive mode manettino
  | 'classic_3_spoke_round' // Polished aluminum spokes, wood/leather rim, classic horn button
  | 'executive_2_spoke'     // Heated leather two-spoke with capacitive touch sensor pads and haptic scroll wheels
  | 'drift_deep_dish'       // Suede-wrapped 90mm dish with lightweight cutout spokes and quick-release boss hub
  | 'autonomous_retractable';// Futuristic folding yoke that stows flush into the dashboard in autonomous mode

export interface SteeringWheelSpecification {
  id: string;
  name: string;
  typology: SteeringWheelTypology;
  diameterMm: number;
  gripThicknessMm: number;
  dishOffsetMm: number;
  hasPaddleShifters: boolean;
  paddleMaterial: 'billet_aluminum' | 'carbon_fiber' | 'titanium_magnetic' | 'forged_composite';
  hasRotaryManettino: boolean;
  hasRpmLedBar: boolean;
  hasCapacitiveHandsOnDetection: boolean;
  massKg: number;
  costUSD: number;
  description: string;
}

// ============================================================================
// 3. SEATING ARCHITECTURES & HARNESSES
// ============================================================================

export type SeatingArchitectureClass =
  | 'carbon_fixed_bucket'   // Ultra-thin high-modulus carbon shell, memory foam pads, 6-point racing harness slot
  | 'sport_bolstered_recaro'// Power-adjustable side and thigh bolsters, integrated headrest with illuminated emblem
  | 'executive_vip_ottoman' // 18-way pneumatic massaging seats, extendable power calf-rest, motorized winged headrests
  | 'classic_fluted_leather'// Horizontal fluted retro leather pleats, chrome recliner levers, low-profile cushions
  | 'active_dynamic_matrix';// Adaptive air-bladder bolsters that inflate dynamically in corners

export type RacingHarnessType =
  | 'standard_3_point'      // Retractable 3-point inertia reel belt with pretensioner
  | 'clubman_4_point'       // 4-point snap-hook harness for track day safety
  | 'sabelt_6_point_f1'     // 6-point 2-inch HANS-compatible competition harness with rotary cam-lock latch
  | 'schroth_enduro_pro';   // Lightweight 6-point harness with zip-adjust pull-down lap straps

export interface SeatingSpecification {
  id: string;
  name: string;
  architectureClass: SeatingArchitectureClass;
  seatCount: 1 | 2 | 4 | 5;
  seatMassKgPerUnit: number;
  costUSDPerUnit: number;
  adjustmentAxes: number;
  lateralGSupportPercent: number;
  comfortRatingPercent: number;
  hasActiveVentilation: boolean;
  hasPneumaticMassage: boolean;
  hasHeatedSeatBase: boolean;
  hasNearfieldHeadrestSpeakers: boolean;
  harnessType: RacingHarnessType;
  seatbackShellMaterial: 'matte_carbon' | 'gloss_forged_carbon' | 'brushed_aluminum' | 'leather_wrapped' | 'piano_black';
  description: string;
}

// ============================================================================
// 4. CENTER CONSOLES & TRANSMISSION SHIFTERS
// ============================================================================

export type CenterConsoleStyle =
  | 'gated_manual_h_pattern' // Polished steel shift gate plate, spherical billet shift knob, exposed mechanical linkage
  | 'sequential_dog_box'    // Tall billet aluminum sequential lever with reverse lockout collar
  | 'crystal_rotary_dial'   // Crystal glass rotary dial with park button and wireless charging pad
  | 'aircraft_start_flap'   // Red flip-up fighter-jet safety cover with illuminated push-button & toggle rack
  | 'track_carbon_stack';   // Integrated fire extinguisher bottle, battery master kill switch, brake bias knob

export interface CenterConsoleSpecification {
  id: string;
  name: string;
  style: CenterConsoleStyle;
  hasWirelessPhoneCharger: boolean;
  hasCupholderCover: boolean;
  hasCoolerCompartment: boolean;
  armrestStyle: 'split_butterfly' | 'single_sliding' | 'leather_pad' | 'carbon_cantilever';
  massKg: number;
  costUSD: number;
  description: string;
}

// ============================================================================
// 5. DIGITAL DISPLAYS & HMI ARCHITECTURES
// ============================================================================

export type DisplayLayoutType =
  | 'pillar_to_pillar_hyperscreen' // 56-inch curved one-piece glass spanning driver cluster, center, and passenger
  | 'dual_screen_cockpit'          // 12.3" virtual cluster + 14.5" central OLED infotainment
  | 'driver_centric_track_cluster' // 10.25" high-brightness anti-glare MoTeC-style race telemetry display
  | 'classic_analog_hybrid'        // Physical chrome-ringed speedometer/tachometer with central high-res TFT
  | 'minimalist_central_tablet';   // 15.6" floating central screen with integrated HUD for driver

export type HmiUiTheme =
  | 'cyberpunk_neon_cyan'   // Luminous cyan & magenta telemetry graphs, vector wireframes
  | 'motorsport_track_telemetry' // High-contrast amber/red tachometer, G-force circle, live tire thermal map
  | 'luxury_gold_elegance'  // Brushed champagne gold dials, serif typography, soft ambient glows
  | 'dark_stealth_minimal'  // Monochromatic dark slate, clean typography, high-efficiency OLED
  | 'heritage_classic_analog'; // Cream gauge faces, orange indicator needles, classic odometer font

export interface DigitalCockpitConfig {
  layoutType: DisplayLayoutType;
  uiTheme: HmiUiTheme;
  virtualClusterSizeInches: number;
  infotainmentSizeInches: number;
  passengerScreenSizeInches: number;
  hasHolographicHUD: boolean;
  hudProjectionDistanceM: number;
  hudFieldOfViewDeg: number;
  touchscreenHapticFeedback: boolean;
  glassAntiReflectiveCoating: boolean;
  ambientLightSync: boolean;
}

// ============================================================================
// 6. UPHOLSTERY, METALLURGY & INTERIOR MATERIALS
// ============================================================================

export type UpholsteryMaterialType =
  | 'nappa_leather'         // Ultra-soft full-grain smooth Nappa leather
  | 'semi_aniline_leather'  // Natural grain breathable luxury leather
  | 'alcantara_suede'       // High-grip synthetic micro-suede for motorsport
  | 'perforated_sport_leather' // Micro-perforated cooling leather with contrast under-mesh
  | 'wool_heritage_tartan'  // Classic motorsport woven houndstooth / tartan textile
  | 'vegan_bamboo_silk'     // Eco-luxury sustainable plant-based leather alternative
  | 'ballistic_cordura'     // Extreme-durability motorsport technical fabric
  | 'matte_dry_carbon';     // Bare pre-preg carbon fiber finish

export type StitchingPattern =
  | 'single_french_seam'
  | 'double_contrast_stitch'
  | 'diamond_quilted'
  | 'hexagonal_honeycomb'
  | 'chevron_perforation'
  | 'piped_edge_accent';

export type TrimAccentsMaterial =
  | 'twill_gloss_carbon'
  | 'forged_matte_carbon'
  | 'open_pore_walnut'
  | 'satin_brushed_aluminum'
  | 'anodized_dark_titanium'
  | 'piano_black_lacquer'
  | 'machined_magnesium';

export interface InteriorMaterialTheme {
  primaryUpholstery: UpholsteryMaterialType;
  secondaryUpholstery: UpholsteryMaterialType;
  primaryColorHex: string;
  secondaryColorHex: string;
  stitchingPattern: StitchingPattern;
  stitchingColorHex: string;
  trimAccents: TrimAccentsMaterial;
  seatBeltColorHex: string;
  carpetColorHex: string;
  headlinerMaterial: 'alcantara_suede' | 'woven_fabric' | 'starlight_fiber_optic' | 'panoramic_electrochromic_glass';
  headlinerColorHex: string;
}

// ============================================================================
// 7. AMBIENT LIGHTING ARCHITECTURE
// ============================================================================

export type AmbientLightingZone =
  | 'dashboard_contour'
  | 'center_console_halo'
  | 'door_spear_accents'
  | 'footwell_mood'
  | 'air_vent_turbine_glow'
  | 'speaker_grille_halo'
  | 'seatback_crest'
  | 'skylight_perimeter';

export interface AmbientLightingConfig {
  enabled: boolean;
  brightnessPercent: number; // 0 - 100
  primaryColorHex: string;
  secondaryColorHex: string;
  colorMode: 'single_tone' | 'dual_zone_gradient' | 'drive_mode_dynamic' | 'breathing_pulse' | 'rpm_shift_reactive';
  activeZones: AmbientLightingZone[];
  fiberOpticDiffuserDiffusion: number; // 0.1 - 1.0
}

// ============================================================================
// 8. CABIN SOUND STAGE & ACOUSTIC ENGINEERING
// ============================================================================

export type AudioSystemClass =
  | 'base_studio_8_speaker'   // 8-speaker 240W standard stereo
  | 'premium_surround_16'    // 16-speaker 720W surround with dual subwoofers
  | 'ultra_3d_spatial_24'    // 24-speaker 1450W Dolby Atmos 3D with headrest speakers
  | 'bespoke_audiophile_32'; // 32-speaker 2100W beryllium tweeters, seat shakers, active noise cancellation

export interface AudioSystemSpecification {
  id: string;
  name: string;
  systemClass: AudioSystemClass;
  speakerCount: number;
  totalAmplifierWattsRMS: number;
  hasDolbyAtmos3D: boolean;
  hasActiveNoiseCancellation: boolean;
  hasNearfieldHeadrestArray: boolean;
  hasUnderseatTactileTransducers: boolean;
  grilleFinish: 'laser_cut_aluminum' | 'matte_black_mesh' | 'illuminated_crystal';
  massKg: number;
  costUSD: number;
  description: string;
}

// ============================================================================
// 9. ROLL CAGES & SAFETY CELLS
// ============================================================================

export type RollCageType =
  | 'none'
  | 'clubman_harness_bar'     // B-pillar cross-bar for 4-point harness attachment
  | 'rear_4_point_half_cage' // Seamless cold-drawn steel/titanium 4-point roll hoop with X-brace
  | 'full_6_point_bolt_in'   // 6-point bolt-in cage with front A-pillar down-tubes and door intrusion bars
  | 'fia_welded_monocell';   // FIA Appendix J compliant TIG-welded 25CrMo4 tubular spaceframe cage

export interface RollCageSpecification {
  type: RollCageType;
  tubeDiameterMm: number;
  tubeMaterial: 'drawn_steel_cds' | 'chromoly_4130' | 'grade_5_titanium' | 'carbon_composite';
  massKg: number;
  torsionalStiffnessBoostPercent: number;
  colorHex: string;
}

// ============================================================================
// 10. ERGONOMIC & COMFORT TELEMETRY
// ============================================================================

export interface InteriorErgonomicsTelemetry {
  driverHPointMm: { x: number; y: number; z: number };
  headroomClearanceMm: number;
  legroomClearanceMm: number;
  shoulderRoomMm: number;
  visibilityForwardDeg: number;
  blindspotAngleDeg: number;
  driverReachScore: number; // 0 - 100
  ingressEgressEaseScore: number; // 0 - 100
  cabinDecibelAt120Kmh: number; // dB(A)
  nvhIsolationIndex: number; // 0 - 100
  overallLuxuryScore: number; // 0 - 100
  totalInteriorMassKg: number;
  totalInteriorCostUSD: number;
}

// ============================================================================
// 11. COMPLETE INTERIOR CONFIGURATION OBJECT
// ============================================================================

export interface MasterInteriorConfiguration {
  dashboardId: string;
  dashboardClass: DashboardArchitectureClass;
  steeringWheelId: string;
  steeringTypology: SteeringWheelTypology;
  frontSeatsId: string;
  seatingClass: SeatingArchitectureClass;
  seatCount: 1 | 2 | 4 | 5;
  harnessType: RacingHarnessType;
  centerConsoleId: string;
  centerConsoleStyle: CenterConsoleStyle;
  digitalCockpit: DigitalCockpitConfig;
  materials: InteriorMaterialTheme;
  ambientLighting: AmbientLightingConfig;
  audioSystemId: string;
  rollCage: RollCageSpecification;
  soundDeadeningLevel: number; // 0.0 (stripped race) to 1.0 (ultra quiet luxury)
  hasClimateDualZone: boolean;
  hasFragranceDiffuser: boolean;
  hasWirelessPhoneChargers: boolean;
}
