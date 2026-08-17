// ===================================================================
// EXTERIOR ENGINEERING & AUTOMOTIVE STYLING TYPES
// ===================================================================
// Comprehensive type system for vehicle body-in-white, exterior styling,
// multi-layer paint chemistry, aerodynamic surfaces, and lighting.
// ===================================================================

import type { MaterialGrade } from "../assemblyTypes";

export type BodyStyle =
  | "hypercar_coupe"
  | "supercar_spyder"
  | "gt_fastback"
  | "berlina_sedan"
  | "sport_wagon"
  | "targa_speedster"
  | "shooting_brake"
  | "prototype_lmdh"
  | "gt3_homologation"
  | "widebody_drift";

export type DoorOpeningMechanism =
  | "conventional"
  | "scissor_lambo"
  | "gullwing_sl"
  | "butterfly_mclaren"
  | "dihedral_synchro"
  | "suicide_coach"
  | "frameless_coupe"
  | "canopy_fighter";

export type RoofStyle =
  | "fixed_coupe"
  | "targa_carbon"
  | "t_top_glass"
  | "spider_retractable"
  | "soft_top_fabric"
  | "panoramic_electrochromic"
  | "solid_carbon_double_bubble"
  | "active_chute_roof";

export type FrontEndFasciaStyle =
  | "aggressive_shark_nose"
  | "clean_minimalist"
  | "open_mouth_race_inlet"
  | "split_grille_twin_nostril"
  | "gt3_hood_vented"
  | "prototype_closed_cowl"
  | "active_shutter_matrix";

export type RearEndFasciaStyle =
  | "longtail_speedtail"
  | "short_kammback"
  | "open_mesh_race_exit"
  | "integrated_diffuser_tunnel"
  | "stealth_fighter_faceted"
  | "retractable_spoiler_deck"
  | "twin_stacked_exhaust_pod";

// ===================================================================
// 1. EXTERIOR BODY DIMENSIONS & STYLING SPECIFICATION
// ===================================================================

export interface ExteriorEngineeringConfig {
  bodyStyle: BodyStyle;
  doorOpening: DoorOpeningMechanism;
  roofStyle: RoofStyle;
  frontFascia: FrontEndFasciaStyle;
  rearFascia: RearEndFasciaStyle;

  // Master Dimensional Hardpoints (mm)
  wheelbase: number;          // 2400mm - 3100mm
  trackWidthFront: number;    // 1500mm - 1800mm
  trackWidthRear: number;     // 1520mm - 1850mm
  overallLength: number;      // 4200mm - 5200mm
  overallWidth: number;       // 1850mm - 2150mm
  overallHeight: number;      // 1080mm - 1450mm
  groundClearance: number;    // 60mm - 180mm
  frontOverhang: number;      // 700mm - 1100mm
  rearOverhang: number;       // 600mm - 1150mm

  // Styling Datum Heights (mm above ground)
  cowlHeight: number;         // 650mm - 850mm
  beltlineHeight: number;     // 750mm - 950mm
  roofApexHeight: number;     // 1100mm - 1380mm
  hipPointHeight: number;     // 250mm - 450mm
  decklidHeight: number;      // 800mm - 1050mm

  // Tumblehome & Body Surface Curvatures (degrees)
  sideTumblehomeAngle: number; // 15° - 35° (inward roof slant)
  windshieldRakeAngle: number; // 24° - 42° from horizontal
  rearWindowRakeAngle: number; // 18° - 55° from horizontal
  hoodSlopeAngle: number;      // 8° - 22° downward rake

  // Precision Manufacturing Tolerances (mm)
  targetPanelGap: number;     // Nominal 3.5mm ± 0.5mm
  targetFlushness: number;    // Nominal 0.0mm ± 0.4mm
  hemmingRadius: number;      // 0.8mm - 2.5mm
  characterLineSharpness: number; // 1.0 (razor crease) - 8.0 (soft radius)

  // Lightweight Aero Features
  activeAeroEquipped: boolean;
  flatUnderfloor: boolean;
  vortexGenerators: boolean;
  brakeDuctsFunctional: boolean;
  widebodyFlareFrontMm: number; // 0 - 65mm
  widebodyFlareRearMm: number;  // 0 - 85mm
}

// ===================================================================
// 2. MULTI-LAYER AUTOMOTIVE PAINT & SURFACE COATING SYSTEM
// ===================================================================

export type PaintFinishType =
  | "high_gloss_mirror"
  | "deep_satin_matte"
  | "raw_matte_frost"
  | "liquid_metallic"
  | "tri_coat_pearl_iridescent"
  | "candy_translucent_tint"
  | "full_mirror_chrome"
  | "chameleon_colorshift"
  | "exposed_tinted_carbon"
  | "anodized_billet_luster";

export type ClearCoatGrade =
  | "ultra_high_solid_uhs"
  | "self_healing_polyurethane"
  | "ceramic_quartz_nanocoat"
  | "satin_matte_anti_glare"
  | "race_spec_thin_dft";

export interface PaintSystemConfig {
  finishType: PaintFinishType;
  primaryColorHex: string;     // Basecoat RGB hex
  secondaryColorHex: string;   // Accent / Roof / Stripe hex
  tertiaryColorHex: string;    // Brake / Caliper / Tow hook accent

  // Two-Tone & Livery Partitioning
  liveryStyle: "monotone" | "two_tone_roof" | "centre_racing_stripe" | "gulf_heritage" | "f1_camo_livery" | "accent_splitter_pack";
  stripeWidthMm: number;       // 80mm - 320mm
  accentSplitterColor: string;
  mirrorsContrastColor: boolean;
  roofContrastColor: boolean;

  // Physical Paint Layer Physics & Optical Parameters
  eCoatPrimerMicrons: number;  // 18 - 25 µm (cathodic electrodeposition)
  primerSurfacerMicrons: number; // 25 - 40 µm (stone chip barrier)
  baseCoatMicrons: number;     // 12 - 20 µm (pigment / flake carrier)
  clearCoatMicrons: number;    // 35 - 65 µm (UV / scratch defense)
  clearCoatGrade: ClearCoatGrade;

  // Optical Scattering & Reflection Parameters
  metallicFlakeSizeMicrons: number; // 0 (solid) to 45 µm (coarse sparkle)
  metallicFlakeDensity: number;     // 0.0 - 1.0
  pearlMicaChromaShift: number;     // 0.0 - 1.0 (angular color rotation)
  candyDepthTranslucency: number;   // 0.0 - 1.0 (deep fluid refraction)
  orangePeelTextureIndex: number;   // 0.0 (mirror wet-sanded) to 1.0 (OEM factory ripple)
  distinctnessOfImageDOI: number;   // 0 - 100% (specular sharpness)
  uvProtectionHalfLifeYears: number;// 5 - 25 years
}

// ===================================================================
// 3. AERODYNAMIC WING, DIFFUSER & GROUND EFFECT SURFACES
// ===================================================================

export type FrontSplitterProfile =
  | "oem_integrated_chin"
  | "track_extended_carbon"
  | "gt3_stepped_endplate"
  | "time_attack_full_tunnel"
  | "active_deploying_lip";

export type RearDiffuserProfile =
  | "subtle_street_fins_3"
  | "sport_venturi_5_channel"
  | "gt3_race_high_kick_7"
  | "hypercar_full_underbody_9"
  | "active_blown_diffuser";

export type RearWingType =
  | "clean_ducktail_lip"
  | "active_flush_airbrake"
  | "pedestal_sport_spoiler"
  | "swan_neck_carbon_pylon"
  | "gt3_dual_element_airfoil"
  | "prototype_shark_fin_wing"
  | "drs_hydraulic_twin_plane";

export interface AeroSurfaceConfig {
  // Front Aero Geometry
  frontSplitterProfile: FrontSplitterProfile;
  splitterExtensionMm: number;    // 25mm - 220mm
  splitterGroundClearanceMm: number; // 45mm - 110mm
  splitterSupportRods: boolean;
  frontDivePlanesCanardsCount: number; // 0, 2, 4
  frontCanardAngleDeg: number;    // 10° - 35°
  hoodVentAreaCm2: number;        // 0 - 2500 cm²

  // Underbody Ground Effect Tunnels
  underbodyFloorType: "flat_pan" | "stepped_keel" | "venturi_dual_tunnel" | "ground_effect_suction_skirts";
  venturiThroatHeightMm: number;  // 18mm - 65mm
  diffuserProfile: RearDiffuserProfile;
  diffuserExpansionAngleDeg: number; // 6° - 22°
  diffuserFinCount: number;       // 3, 5, 7, 9
  diffuserStrakeExtensionMm: number; // 40mm - 160mm

  // Rear Downforce Aerofoils
  rearWingType: RearWingType;
  wingSpanMm: number;             // 900mm - 1950mm
  wingChordMm: number;            // 180mm - 420mm
  wingAngleOfAttackDeg: number;   // 0° - 32°
  wingEndplateHeightMm: number;   // 80mm - 320mm
  wingGurneyFlapHeightMm: number; // 0mm - 20mm
  hasActiveDRS: boolean;
  airbrakeMaxAngleDeg: number;    // 45° - 82°

  // Cooling & Radiator Flow Ducts
  frontCenterGrilleAreaCm2: number; // 400 - 3500 cm²
  sidePodIntakeAreaCm2: number;    // 200 - 1800 cm²
  fenderArchPressureReliefLouvers: boolean;
  rearDeckHeatExtractionSlots: boolean;
}

// ===================================================================
// 4. LIGHTING, OPTICAL ARRAYS & SENSOR INTEGRATION
// ===================================================================

export type HeadlightTechnology =
  | "halogen_h7_reflector"
  | "bi_xenon_hid_projector"
  | "full_matrix_led_84_pixel"
  | "laser_high_beam_phosphor"
  | "digital_micromirror_dmd"
  | "oled_crystal_faceted";

export type TaillightTechnology =
  | "standard_incandescent_bulb"
  | "high_output_led_cluster"
  | "continuous_neon_glow_strip"
  | "flexible_3d_oled_surface"
  | "laser_crystal_blade"
  | "kinetic_animated_lightbar";

export type DRLSignaturePattern =
  | "sharp_c_clamp"
  | "quad_ice_cube_matrix"
  | "full_width_horizon_bar"
  | "slash_feline_fang"
  | "halo_angel_rings"
  | "stealth_l_bracket";

export interface LightingConfig {
  headlightTech: HeadlightTechnology;
  taillightTech: TaillightTechnology;
  drlSignature: DRLSignaturePattern;
  lensTint: "crystal_clear" | "mild_smoked" | "dark_stealth_tint" | "amber_endurance_yellow";
  sequentialTurnSignals: boolean;
  hasWelcomeStartupSequence: boolean;
  corneringAdaptiveIllumination: boolean;
  underbodyAmbientGlow: boolean;
  ambientGlowColorHex: string;
  projectorBezelFinish: "polished_chrome" | "satin_black" | "anodized_copper" | "exposed_carbon";
  thirdBrakeLightStyle: "integrated_roof_spoiler" | "f1_flashing_rain_light" | "diffuser_center_beacon";
}

// ===================================================================
// 5. GLAZING, GLASS & ACOUSTIC SEALING SPECIFICATION
// ===================================================================

export type GlassComposition =
  | "float_tempered_safety"
  | "dual_laminated_acoustic"
  | "polycarbonate_lexan_race"
  | "gorilla_glass_thin_film"
  | "electrochromic_smart_tint";

export interface GlassConfig {
  windshieldGlass: GlassComposition;
  sideDoorGlass: GlassComposition;
  rearQuarterGlass: GlassComposition;
  rearBackliteGlass: GlassComposition;
  roofGlass: GlassComposition;

  // Optical & Thermal Transmission
  windshieldTintVLT: number;      // 70% - 90% (Visible Light Transmission)
  sideFrontTintVLT: number;       // 35% - 85%
  sideRearTintVLT: number;        // 5% - 70% (Privacy Glass)
  rearWindowTintVLT: number;      // 5% - 70%
  uvInfraredRejectionPercent: number; // 40% - 99%
  hasAcousticPVBInterlayer: boolean;
  hasHeatedDefrostGridTungsten: boolean;
  hasHydrophobicNanoCoat: boolean;
  ceramicBorderFritDotMatrix: boolean;
}

// ===================================================================
// 6. WHEELS, TIRES & BRAKE SYSTEM COMPATIBILITY
// ===================================================================

export type WheelSpokePattern =
  | "monoblock_5_spoke"
  | "twin_5_spoke_split"
  | "gt_multi_spoke_10"
  | "classic_mesh_cross_lace"
  | "turbofan_aero_disc"
  | "carbon_hollow_barrel_5"
  | "centerlock_f1_monobloc"
  | "directional_vortex_blade";

export type WheelConstruction =
  | "low_pressure_cast_alloy"
  | "rotary_forged_flow_form"
  | "6061_t6_forged_monoblock"
  | "forged_magnesium_az91"
  | "full_autoclaved_carbon_fiber";

export interface ExteriorWheelConfig {
  spokePattern: WheelSpokePattern;
  construction: WheelConstruction;
  diameterFrontInches: number;    // 18 - 23 inches
  diameterRearInches: number;     // 18 - 24 inches
  widthFrontInches: number;       // 8.5 - 12.0 inches
  widthRearInches: number;        // 9.5 - 14.0 inches
  offsetFrontMm: number;          // +15mm to +55mm
  offsetRearMm: number;           // +0mm to +50mm
  centerLockNut: boolean;
  finish: "hyper_silver" | "gloss_jet_black" | "satin_bronze" | "rose_gold" | "diamond_cut_face" | "matte_magnesium" | "raw_gloss_carbon";
  centerCapLogo: string;
}

export interface ExteriorTireConfig {
  frontWidthMm: number;           // 225 - 335 mm
  frontAspectRatio: number;       // 25 - 45 %
  rearWidthMm: number;            // 265 - 385 mm
  rearAspectRatio: number;        // 20 - 40 %
  tireCompound: "street_comfort" | "sport_uhp" | "track_r_compound" | "full_race_slick" | "wet_weather_grooved";
  sidewallLettering: "none" | "white_stencil_michelin" | "yellow_pirelli_f1" | "red_apex_motorsport";
  treadDepthRemainingMm: number;  // 0.0 - 8.0 mm
}

export interface ExteriorBrakeVisualConfig {
  caliperColorHex: string;
  caliperLogo: "APEX_RACING" | "BREMBO_PBR" | "CERAMIC_CARBON" | "TITANIUM_SPEC_R";
  pistonCountFront: 4 | 6 | 8 | 10;
  pistonCountRear: 2 | 4 | 6;
  rotorType: "vented_slotted_steel" | "cross_drilled_iron" | "carbon_ceramic_matrix" | "carbon_carbon_race";
  rotorDiameterFrontMm: number;   // 340 - 440 mm
  rotorDiameterRearMm: number;    // 320 - 410 mm
  hasTitaniumHeatShields: boolean;
}
