// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — MODULAR INTERIOR TYPES
// ============================================================================
// Defines complete geometric & configuration types for the modular cabin
// interior subsystem: Dashboards (01 to 05), Instrument Clusters, Steering Wheels,
// Front/Rear Seating, Center Consoles, Door Cards, Ambient Lighting & Trims.
// ============================================================================

import { VehicleBodyType } from './vehicleConstructionTypes';
import { MaterialGrade } from '../../sim/assemblyTypes';

// ============================================================================
// 1. INTERIOR COMPONENT TAXONOMY
// ============================================================================

export type InteriorComponentCategory =
  | 'dashboard'
  | 'instrument_cluster'
  | 'infotainment_screen'
  | 'steering_wheel'
  | 'front_seats'
  | 'rear_seats'
  | 'center_console'
  | 'door_cards'
  | 'ambient_lighting'
  | 'headliner_carpet';

export type InteriorTrimGrade =
  | 'standard_cloth'
  | 'nappa_leather'
  | 'alcantara_race'
  | 'open_pore_wood'
  | 'forged_carbon'
  | 'brushed_aluminum';

// ============================================================================
// 2. MODULAR DASHBOARD SPECIFICATION
// ============================================================================

export interface ModularDashboardDef {
  id: string; // e.g. "DASHBOARD_SEDAN_01"
  name: string;
  bodyType: VehicleBodyType;
  compatibleChassisIds: string[];
  style: 'executive_luxury' | 'sport_cockpit' | 'minimalist_glass' | 'track_race' | 'classic_analog';
  description: string;
  massKg: number;
  costUSD: number;
  supportedClusters: string[];
  supportedScreens: string[];
  supportedSteeringWheels: string[];
  hasAmbientLightstrip: boolean;
  hvacVentStyle: 'turbine_rotary' | 'hidden_slits' | 'aircraft_nozzle';
  defaultTrimGrade: InteriorTrimGrade;
}

// ============================================================================
// 3. INSTRUMENT CLUSTER SPECIFICATION
// ============================================================================

export interface InstrumentClusterDef {
  id: string; // e.g. "CLUSTER_VIRTUAL_COCKPIT_12_3"
  name: string;
  type: 'analog_dials' | 'semi_digital_tft' | 'virtual_cockpit' | 'curved_hyper_oled';
  screenSizeInches?: number;
  resolution?: string;
  supportedRefreshRateHz: number;
  features: string[];
  massKg: number;
  costUSD: number;
  description: string;
}

// ============================================================================
// 4. STEERING WHEEL SPECIFICATION
// ============================================================================

export interface SteeringWheelDef {
  id: string; // e.g. "STEERING_GT3_YOKE"
  name: string;
  style: 'classic_round' | 'flat_bottom_sport' | 'luxury_wood_rim' | 'yoke_gt3_race';
  diameterMm: number;
  hasPaddleShifters: boolean;
  hasRotaryDriveModeDial: boolean;
  airbagModule: boolean;
  massKg: number;
  costUSD: number;
  availableMaterials: InteriorTrimGrade[];
  description: string;
}

// ============================================================================
// 5. SEATING SPECIFICATION
// ============================================================================

export interface SeatingDef {
  id: string; // e.g. "SEATS_CARBON_FIXED_BUCKET"
  name: string;
  seatClass: 'comfort_multi_way' | 'sport_bolstered' | 'executive_massaging' | 'carbon_race_shell';
  adjustmentAxes: number;
  heatingAndVentilation: boolean;
  harnessSlotType: '3_point_oem' | '4_point_club' | '6_point_fia';
  massKg: number; // pair
  costUSD: number;
  availableMaterials: InteriorTrimGrade[];
  description: string;
}

// ============================================================================
// 6. CENTER CONSOLE SPECIFICATION
// ============================================================================

export interface CenterConsoleDef {
  id: string;
  name: string;
  shifterType: 'gated_manual' | 'electronic_monostable' | 'rotary_dial' | 'push_button_race';
  hasWirelessCharging: boolean;
  hasCupholderCover: boolean;
  massKg: number;
  costUSD: number;
  description: string;
}

// ============================================================================
// 7. COMPLETE MODULAR INTERIOR CONFIGURATION
// ============================================================================

export interface ModularInteriorConfiguration {
  dashboardId: string;
  instrumentClusterId: string;
  infotainmentScreenId: string;
  steeringWheelId: string;
  frontSeatsId: string;
  rearSeatsId: string;
  centerConsoleId: string;
  doorCardsId: string;
  ambientLightingColorHex: string;
  ambientLightingBrightnessPct: number;
  primaryTrimGrade: InteriorTrimGrade;
  accentTrimGrade: InteriorTrimGrade;
  audioPackageId: string;
}
