// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — MODULAR INTERIOR ASSET MANIFEST
// ============================================================================
// Catalog of all modular interior components: Dashboards, Clusters, Wheels,
// Seats, Consoles, Door Cards, Ambient Lighting, and Trim Grades.
// ============================================================================

import {
  ModularDashboardDef,
  InstrumentClusterDef,
  SteeringWheelDef,
  SeatingDef,
  CenterConsoleDef,
} from '../types/modularInteriorTypes';

// ============================================================================
// 1. DASHBOARD CATALOG
// ============================================================================

export const DASHBOARD_CATALOG: ModularDashboardDef[] = [
  {
    id: 'DASHBOARD_01_EXECUTIVE',
    name: 'Executive Luxury Wing Dashboard',
    bodyType: 'sedan',
    compatibleChassisIds: ['SEDAN_CHASSIS_01', 'SEDAN_CHASSIS_03', 'WAGON_CHASSIS_01', 'SUV_CHASSIS_03'],
    style: 'executive_luxury',
    description: 'Sweeping horizontal dual-tier dashboard upholstered in double-stitched Nappa leather with concealed motorized turbine HVAC vents.',
    massKg: 18.5,
    costUSD: 3400,
    supportedClusters: ['CLUSTER_VIRTUAL_COCKPIT_12_3', 'CLUSTER_CURVED_HYPER_OLED'],
    supportedScreens: ['SCREEN_12_3_TOUCH', 'SCREEN_15_0_FLOATING'],
    supportedSteeringWheels: ['STEERING_CLASSIC_ROUND', 'STEERING_LUXURY_WOOD'],
    hasAmbientLightstrip: true,
    hvacVentStyle: 'turbine_rotary',
    defaultTrimGrade: 'nappa_leather',
  },
  {
    id: 'DASHBOARD_02_SPORT_COCKPIT',
    name: 'Driver-Focused Sport Binnacle',
    bodyType: 'coupe',
    compatibleChassisIds: ['SEDAN_CHASSIS_02', 'COUPE_CHASSIS_01', 'COUPE_CHASSIS_02', 'SPORTS_CAR_CHASSIS_01'],
    style: 'sport_cockpit',
    description: 'Driver-canted center stack angled 12 degrees toward the driver with analog boost/oil gauges and Alcantara upper cowl.',
    massKg: 14.2,
    costUSD: 2800,
    supportedClusters: ['CLUSTER_SEMI_DIGITAL_TFT', 'CLUSTER_VIRTUAL_COCKPIT_12_3'],
    supportedScreens: ['SCREEN_10_0_EMBEDDED', 'SCREEN_12_3_TOUCH'],
    supportedSteeringWheels: ['STEERING_FLAT_BOTTOM_SPORT', 'STEERING_GT3_YOKE'],
    hasAmbientLightstrip: true,
    hvacVentStyle: 'aircraft_nozzle',
    defaultTrimGrade: 'alcantara_race',
  },
  {
    id: 'DASHBOARD_03_MINIMALIST_GLASS',
    name: 'Seamless Floating Glass Monolith',
    bodyType: 'sedan',
    compatibleChassisIds: ['SEDAN_CHASSIS_01', 'SEDAN_CHASSIS_04', 'SUV_CHASSIS_05', 'HATCHBACK_CHASSIS_03'],
    style: 'minimalist_glass',
    description: 'Ultra-clean architectural dashboard with full-width continuous glass surface and hidden haptic air diffusion slits.',
    massKg: 12.8,
    costUSD: 4100,
    supportedClusters: ['CLUSTER_CURVED_HYPER_OLED'],
    supportedScreens: ['SCREEN_15_0_FLOATING'],
    supportedSteeringWheels: ['STEERING_FLAT_BOTTOM_SPORT', 'STEERING_CLASSIC_ROUND'],
    hasAmbientLightstrip: true,
    hvacVentStyle: 'hidden_slits',
    defaultTrimGrade: 'open_pore_wood',
  },
  {
    id: 'DASHBOARD_04_TRACK_CARBON',
    name: 'Featherweight Carbon Race Fascia',
    bodyType: 'sports_car',
    compatibleChassisIds: ['SEDAN_CHASSIS_05', 'COUPE_CHASSIS_05', 'SPORTS_CAR_CHASSIS_05', 'SUPERCAR_CHASSIS_01', 'HYPERCAR_CHASSIS_01'],
    style: 'track_race',
    description: 'Autoclave structural carbon fiber dashboard beam with integrated rollcage pass-throughs and FIA kill-switch binnacle.',
    massKg: 6.8,
    costUSD: 5600,
    supportedClusters: ['CLUSTER_VIRTUAL_COCKPIT_12_3'],
    supportedScreens: ['SCREEN_10_0_EMBEDDED'],
    supportedSteeringWheels: ['STEERING_GT3_YOKE'],
    hasAmbientLightstrip: false,
    hvacVentStyle: 'hidden_slits',
    defaultTrimGrade: 'forged_carbon',
  },
  {
    id: 'DASHBOARD_05_HERITAGE_ANALOG',
    name: 'Heritage Classic Analog Console',
    bodyType: 'convertible',
    compatibleChassisIds: ['CONVERTIBLE_CHASSIS_01', 'CONVERTIBLE_CHASSIS_03', 'SPORTS_CAR_CHASSIS_01'],
    style: 'classic_analog',
    description: 'Hand-formed aluminum dashboard with machined knurled toggle switches, mechanical chronometer, and saddle leather.',
    massKg: 16.0,
    costUSD: 3900,
    supportedClusters: ['CLUSTER_ANALOG_DUAL_DIALS'],
    supportedScreens: ['SCREEN_10_0_EMBEDDED'],
    supportedSteeringWheels: ['STEERING_CLASSIC_ROUND', 'STEERING_LUXURY_WOOD'],
    hasAmbientLightstrip: true,
    hvacVentStyle: 'turbine_rotary',
    defaultTrimGrade: 'brushed_aluminum',
  },
];

// ============================================================================
// 2. INSTRUMENT CLUSTER CATALOG
// ============================================================================

export const INSTRUMENT_CLUSTER_CATALOG: InstrumentClusterDef[] = [
  {
    id: 'CLUSTER_ANALOG_DUAL_DIALS',
    name: 'Precision Mechanical Dual-Dials',
    type: 'analog_dials',
    supportedRefreshRateHz: 60,
    features: ['Physical machined needles', 'Swiss-movement stepper motors', 'Illuminated redline dial', 'Center trip LCD'],
    massKg: 2.1,
    costUSD: 950,
    description: 'High-contrast white-on-black mechanical tachometer and speedometer with polished aluminum bezel rings.',
  },
  {
    id: 'CLUSTER_SEMI_DIGITAL_TFT',
    name: '7.0" High-Res TFT Hybrid Cluster',
    type: 'semi_digital_tft',
    screenSizeInches: 7.0,
    resolution: '1920x1080',
    supportedRefreshRateHz: 60,
    features: ['Analog side gauges', 'Center color TFT screen', 'G-force meter', 'Tire pressure telemetry'],
    massKg: 1.8,
    costUSD: 1400,
    description: 'Hybrid layout combining physical tachometer needle with central customizable color display.',
  },
  {
    id: 'CLUSTER_VIRTUAL_COCKPIT_12_3',
    name: '12.3" Full HD Virtual Cockpit Display',
    type: 'virtual_cockpit',
    screenSizeInches: 12.3,
    resolution: '2880x1080',
    supportedRefreshRateHz: 120,
    features: ['Full-screen 3D satellite map', 'Sport dial view with central shift-light', 'Brake thermal telemetry', 'Lap timer'],
    massKg: 2.4,
    costUSD: 2400,
    description: 'Anti-glare 120Hz high-definition virtual cockpit displaying real-time engine telemetry and navigation.',
  },
  {
    id: 'CLUSTER_CURVED_HYPER_OLED',
    name: '16.0" Curved Ultra-HD Hyper-OLED',
    type: 'curved_hyper_oled',
    screenSizeInches: 16.0,
    resolution: '3840x1440',
    supportedRefreshRateHz: 144,
    features: ['Pure black 1,000,000:1 contrast ratio', 'Curved glass immersion', 'Real-time telemetry raytracing', 'Track HUD link'],
    massKg: 3.2,
    costUSD: 3900,
    description: 'Continuous curved OLED display enveloping the driver with deep blacks and vibrant 1,000-nit peak brightness.',
  },
];

// ============================================================================
// 3. STEERING WHEEL CATALOG
// ============================================================================

export const STEERING_WHEEL_CATALOG: SteeringWheelDef[] = [
  {
    id: 'STEERING_CLASSIC_ROUND',
    name: 'Classic 3-Spoke Round Wheel',
    style: 'classic_round',
    diameterMm: 375,
    hasPaddleShifters: false,
    hasRotaryDriveModeDial: false,
    airbagModule: true,
    massKg: 2.6,
    costUSD: 650,
    availableMaterials: ['nappa_leather', 'standard_cloth'],
    description: 'Traditional round steering wheel with comfortable hand bolsters and ergonomic thumb rests.',
  },
  {
    id: 'STEERING_FLAT_BOTTOM_SPORT',
    name: 'Flat-Bottom Sport Wheel with Carbon Paddles',
    style: 'flat_bottom_sport',
    diameterMm: 360,
    hasPaddleShifters: true,
    hasRotaryDriveModeDial: true,
    airbagModule: true,
    massKg: 2.2,
    costUSD: 1650,
    availableMaterials: ['nappa_leather', 'alcantara_race', 'forged_carbon'],
    description: 'Race-inspired flat-bottom design providing legroom with magnetic tactile carbon-fiber paddle shifters.',
  },
  {
    id: 'STEERING_LUXURY_WOOD',
    name: 'Prestige Wood-Rim Heated Wheel',
    style: 'luxury_wood_rim',
    diameterMm: 380,
    hasPaddleShifters: false,
    hasRotaryDriveModeDial: false,
    airbagModule: true,
    massKg: 3.0,
    costUSD: 1950,
    availableMaterials: ['open_pore_wood', 'nappa_leather'],
    description: 'Hand-finished walnut wood veneer rim seamlessly joined with heated semi-aniline leather grip zones.',
  },
  {
    id: 'STEERING_GT3_YOKE',
    name: 'Formula GT3 Motorsport Yoke with LED Shift-Lights',
    style: 'yoke_gt3_race',
    diameterMm: 310,
    hasPaddleShifters: true,
    hasRotaryDriveModeDial: true,
    airbagModule: false,
    massKg: 1.4,
    costUSD: 3200,
    availableMaterials: ['forged_carbon', 'alcantara_race'],
    description: 'Formula-1 style yoke wheel with 15-LED RPM shift light cascade, pit-limiter button, and rotary ABS dials.',
  },
];

// ============================================================================
// 4. SEATING CATALOG
// ============================================================================

export const SEATING_CATALOG: SeatingDef[] = [
  {
    id: 'SEATS_COMFORT_MULTI_WAY',
    name: '18-Way Power Comfort Executive Seats',
    seatClass: 'comfort_multi_way',
    adjustmentAxes: 18,
    heatingAndVentilation: true,
    harnessSlotType: '3_point_oem',
    massKg: 46.0,
    costUSD: 2800,
    availableMaterials: ['nappa_leather', 'standard_cloth'],
    description: 'Supreme multi-contour seating with pneumatic lumbar bolsters and active ventilation cooling fans.',
  },
  {
    id: 'SEATS_SPORT_BOLSTERED',
    name: 'Adaptive Sport Bolstered Bucket Seats',
    seatClass: 'sport_bolstered',
    adjustmentAxes: 14,
    heatingAndVentilation: true,
    harnessSlotType: '4_point_club',
    massKg: 38.0,
    costUSD: 3600,
    availableMaterials: ['nappa_leather', 'alcantara_race'],
    description: 'Dynamic side bolsters that automatically inflate in corners to hold occupants firmly in place.',
  },
  {
    id: 'SEATS_EXECUTIVE_MASSAGING',
    name: 'First-Class Massaging Lounge Chairs',
    seatClass: 'executive_massaging',
    adjustmentAxes: 22,
    heatingAndVentilation: true,
    harnessSlotType: '3_point_oem',
    massKg: 52.0,
    costUSD: 5200,
    availableMaterials: ['nappa_leather'],
    description: 'Hot-stone massage programs, motorized leg rests, and pillow headrests for effortless long-distance travel.',
  },
  {
    id: 'SEATS_CARBON_FIXED_BUCKET',
    name: 'FIA-Homologated Carbon Fixed-Back Racing Shells',
    seatClass: 'carbon_race_shell',
    adjustmentAxes: 2,
    heatingAndVentilation: false,
    harnessSlotType: '6_point_fia',
    massKg: 14.5,
    costUSD: 6800,
    availableMaterials: ['forged_carbon', 'alcantara_race'],
    description: 'Pure pre-preg carbon fiber shell saving 32 kg over standard seats with 6-point racing harness pass-throughs.',
  },
];

// ============================================================================
// 5. CENTER CONSOLE CATALOG
// ============================================================================

export const CENTER_CONSOLE_CATALOG: CenterConsoleDef[] = [
  {
    id: 'CONSOLE_SPORT_GATED',
    name: 'Machined Gated Shifter Console',
    shifterType: 'gated_manual',
    hasWirelessCharging: false,
    hasCupholderCover: false,
    massKg: 5.5,
    costUSD: 1450,
    description: 'Polished open-gate aluminum shift slot producing an iconic metallic click on every gear change.',
  },
  {
    id: 'CONSOLE_LUXURY_TOUCH',
    name: 'Prestige Piano-Glass Touch Console',
    shifterType: 'electronic_monostable',
    hasWirelessCharging: true,
    hasCupholderCover: true,
    massKg: 8.2,
    costUSD: 2400,
    description: 'Motorized soft-close cupholder covers, dual 15W Qi wireless charging pads, and haptic climate toggles.',
  },
  {
    id: 'CONSOLE_MINIMALIST_ROTARY',
    name: 'Minimalist Rotary Monostable Dial',
    shifterType: 'rotary_dial',
    hasWirelessCharging: true,
    hasCupholderCover: true,
    massKg: 6.0,
    costUSD: 1800,
    description: 'Jeweled knurled rotary gear selector that rises smoothly from the console upon vehicle start.',
  },
  {
    id: 'CONSOLE_TRACK_PUSH_BUTTON',
    name: 'Carbon Lightweight Track Console',
    shifterType: 'push_button_race',
    hasWirelessCharging: false,
    hasCupholderCover: false,
    massKg: 2.8,
    costUSD: 3100,
    description: 'Slimline carbon-fiber spine housing transmission pushbuttons, fire extinguisher toggle, and brake bias dial.',
  },
];
