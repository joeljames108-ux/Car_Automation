// ===================================================================
// TYPES — Apex Engineer vehicle design simulator
// ===================================================================

// ---------- Engine ----------

export type EngineLayout =
  | "i3" | "i4" | "i6" | "v6" | "v8" | "v10" | "v12"
  | "boxer4" | "boxer6" | "rotary" | "hybrid" | "electric";

export type CrankMaterial = "cast_iron" | "forged_steel" | "billet_steel" | "titanium";
export type PistonType = "cast" | "forged" | "billet" | "ceramic";
export type ValvetrainType = "ohv" | "sohc" | "dohc" | "dohc_vvl";
export type IntakeType = "na" | "supercharger" | "turbo_single" | "twin_turbo" | "bi_turbo" | "compound_turbo";
export type FuelSystemType = "carb" | "tbi" | "port" | "direct" | "dual_injection";

export interface EngineConfig {
  layout: EngineLayout;
  bore: number;            // mm
  stroke: number;          // mm
  rodLength: number;       // mm
  compressionRatio: number;
  crank: CrankMaterial;
  pistons: PistonType;
  valvetrain: ValvetrainType;
  camDuration: number;     // degrees
  camLift: number;         // mm
  camTiming: number;       // degrees advance/retard
  valveAngle: number;      // degrees
  valveSize: number;       // mm
  intake: IntakeType;
  turboSize: number;       // 0-1 (0 = NA)
  boostPressure: number;   // bar
  wastegateSize: number;   // mm
  intercoolerEff: number;  // 0-1
  fuelSystem: FuelSystemType;
  afr: number;
  ignitionTiming: number;  // degrees BTDC
  rpmLimiter: number;
  redline: number;
  coolingRadiator: number; // 0-1
  coolingOilCooler: number;
  coolingWaterPump: number;
  coolingFanSpeed: number;
  exhaustPrimaryLength: number; // mm
  exhaustCollectorDia: number;  // mm
  exhaustCat: boolean;
  exhaustValved: boolean;

  // ---- Hybrid / EV ----
  hasMguH: boolean;        // Motor Generator Unit - Heat (turbo compounding)
  mguHMode: "off" | "charge" | "deploy" | "auto";
  hasMguK: boolean;        // Motor Generator Unit - Kinetic (brake regen)
  mguKPower: number;       // kW (0-200)
  batteryCapacity: number; // kWh (0-10 for hybrid, 0-120 for EV)
  batteryChemistry: "nimh" | "lfp" | "nmc" | "solid_state";
  deployMode: "qualifying" | "race" | "save" | "attack" | "endurance";
  regenLevel: number;      // 0-1, braking regen aggressiveness
  motorLayout: "none" | "front" | "rear" | "both" | "axle_split";
  evMotorPower: number;    // kW (for pure EV)
  evMotorType: "pmac" | "induction" | "wound_rotor" | "axial_flux";
}

export interface EngineSim {
  displacement: number;     // cc
  cylinderCount: number;
  powerCurve: { rpm: number; power: number; torque: number }[];
  peakPower: number;        // hp
  peakTorque: number;       // Nm
  peakPowerRpm: number;
  peakTorqueRpm: number;
  redline: number;
  maxPistonSpeed: number;   // m/s
  thermalEfficiency: number;// 0-1
  knockRisk: number;        // 0-1
  octaneRequired: number;   // RON
  bsfc: number;             // g/kWh (brake specific fuel consumption)
  turboLag: number;         // seconds
  boostPressure: number;    // bar
  engineWeight: number;     // kg
  engineCost: number;       // $
  reliability: number;      // 0-1
  nvhEngine: number;        // 0-1 (higher = quieter)
  emissionsEngine: number;  // g/km CO2
  fuelEconomyEngine: number;// L/100km

  // ---- Hybrid / EV outputs ----
  mguHPower: number;        // kW (recovery or deployment)
  mguKPower: number;        // kW
  combinedPower: number;    // hp (ICE + electric)
  combinedTorque: number;   // Nm
  batteryWeight: number;    // kg
  batteryCost: number;      // $
  batteryEnergy: number;    // kWh usable
  electricRange: number;    // km (for EV / PHEV)
  regenEfficiency: number;  // 0-1
  energyRecoveryPerLap: number; // kWh per lap at typical track
  deployDuration: number;   // seconds of full electric boost per lap
  isElectric: boolean;
  isHybrid: boolean;
}

// ---------- Vehicle ----------

export type PlatformType = "street_sport" | "supercar" | "hypercar" | "gt" | "prototype" | "rally";

// ---------- Exterior ----------

export type BodyType =
  | "sedan" | "coupe" | "hatchback" | "wagon" | "fastback" | "roadster"
  | "targa" | "ttop" | "convertible" | "suv" | "crossover" | "pickup"
  | "van" | "shooting_brake" | "gt_coupe" | "spider" | "canopy" | "kammback";

export type RimDesign =
  | "mesh" | "multi_spoke" | "twin_spoke" | "y_spoke" | "turbine"
  | "deep_dish" | "split_5" | "split_6" | "slotted" | "solid_disc";

export type RimFinish = "silver" | "gloss_black" | "matte_black" | "bronze" | "gold" | "chrome" | "gunmetal" | "bronze_cut";

export type PaintFinish = "gloss" | "matte" | "satin" | "metallic" | "pearl" | "candy" | "chrome" | "colorshift";

export type HeadlightType =
  | "halogen_reflector" | "halogen_projector" | "bi_xenon" | "led" | "led_matrix"
  | "laser" | "oled_strip" | "pop_up";

export type TaillightType =
  | "bulb" | "led_bar" | "led_matrix" | "oled" | "sequential_led" | "laser_glow";

export type BodyKit =
  | "none" | "oem_plus" | "street" | "track" | "widebody" | "gt3" | "drift" | "rally";

export type SpoilerType =
  | "none" | "lip" | "ducktail" | "pedestal" | "swan_neck" | "gt_wing" | "active_wing";

export type RoofScoopType = "none" | "functional" | "decorative" | "naca_duct";

export interface ExteriorConfig {
  bodyType: BodyType;
  paintColor: string;        // hex
  paintFinish: PaintFinish;
  rimDesign: RimDesign;
  rimFinish: RimFinish;
  rimDiameter: number;       // inches
  rimWidth: number;          // inches
  headlightType: HeadlightType;
  taillightType: TaillightType;
  bodyKit: BodyKit;
  spoilerType: SpoilerType;
  roofScoop: RoofScoopType;
  hoodScoop: boolean;
  sideSkirts: boolean;
  frontLipExtension: number; // 0-1
  fenderVents: boolean;
  splitter: boolean;
  towHook: boolean;
  mirrorType: "standard" | "folding" | "carbon" | "camera" | "none";
  badgeColor: string;        // hex
}

export type ChassisType = "tube_frame" | "monocoque" | "carbon_tub" | "aluminum_spaceframe" | "steel_unibody";
export type SuspensionType = "macpherson" | "double_wishbone" | "multilink" | "torsion_bar" | "pushrod" | "pullrod";
export type TransmissionType = "manual_5" | "manual_6" | "seq_6" | "seq_7" | "dct_7" | "dct_8" | "cvt" | "single_speed";
export type TireCompound = "hard" | "medium" | "soft" | "supersoft" | "slick" | "wet" | "intermediate";

export interface VehicleConfig {
  platform: PlatformType;
  exterior: ExteriorConfig;
  chassis: ChassisType;
  suspensionFront: SuspensionType;
  suspensionRear: SuspensionType;
  springRateF: number;     // N/mm
  springRateR: number;
  damperF: number;         // 0-1
  damperR: number;
  rideHeight: number;      // mm
  camberF: number;         // degrees
  camberR: number;
  toeF: number;            // degrees
  toeR: number;
  antiRollBarF: number;    // 0-1
  antiRollBarR: number;
  brakeDiscSize: number;   // mm
  brakePadCompound: number;// 0-1
  brakeBias: number;       // 0-1 (0 = full rear, 1 = full front)
  wheelDiameter: number;   // inches
  wheelWidth: number;      // inches
  tireCompound: TireCompound;
  tirePressure: number;    // bar
  transmission: TransmissionType;
  gearCount: number;
  finalDrive: number;
  diffType: "open" | "lsd" | "torsen" | "active" | "locked";
  diffPreload: number;     // 0-1
  aero: AeroConfig;
  aeroResearch: AeroResearchConfig;
  electronics: ElectronicsConfig;
  interior: InteriorConfig;
  ballast: number;         // kg
  ballastPositionX: number;// -1 (rear) to 1 (front)
  ballastPositionY: number;// -1 (right) to 1 (left)
  ballastPositionZ: number;// -1 (low) to 1 (high)
}

export interface AeroConfig {
  bodyShape: number;       // 0-1 (0 = boxy, 1 = sleek)
  bodyWidth: number;       // mm
  roofHeight: number;      // mm
  rideHeight: number;      // mm
  splitterLength: number;  // mm
  splitterAngle: number;   // degrees
  wingWidth: number;       // mm
  wingAngle: number;       // degrees (AoA)
  wingHeight: number;      // mm
  diffuserAngle: number;   // degrees
  underbody: "flat" | "flat_floor" | "ground_effect" | "venturi" | "skirts";
  grilleOpening: number;   // 0-1
  coolingVents: number;    // 0-1
  canards: boolean;
  drs: boolean;
  sidePods: boolean;
}

// ---------- Aero Research Center ----------

export type FrontBumperShape = "standard" | "aggressive" | "splitter_integrated" | "gt3" | "rally";
export type UnderbodyFloorType = "flat" | "partial_flat" | "venturi_tunnels" | "ground_effect_tunnels";
export type WheelAeroType = "open" | "aero_discs" | "covers" | "arch_vents" | "deflectors";
export type MirrorAeroType = "traditional" | "slim" | "camera" | "hidden_camera";
export type CfdQuality = "basic" | "medium" | "high" | "ultra" | "research";
export type AeroMode = "eco" | "comfort" | "sport" | "track" | "auto";

export interface FrontAeroConfig {
  bumperShape: FrontBumperShape;
  airDam: number;             // 0-1
  splitterExtension: number;  // mm beyond base
  splitterAngle: number;      // degrees
  divePlanes: number;         // 0-4
  airCurtains: boolean;
  brakeDucts: number;         // 0-1
  hoodVents: number;          // 0-1
  activeGrilleShutters: boolean;
}

export interface SidepodConfig {
  width: number;              // 0-1
  height: number;             // 0-1
  inletSize: number;          // 0-1
  inletPosition: "low" | "mid" | "high";
  undercut: number;           // 0-1
  outletSize: number;         // 0-1
  cokeBottleTaper: number;    // 0-1
  curvature: number;          // 0-1
  floor: boolean;
}

export interface DiffuserConfig {
  length: number;             // mm
  angle: number;              // degrees
  exitHeight: number;         // mm
  exitWidth: number;          // mm
  tunnelWidth: number;        // mm
  tunnelDepth: number;        // mm
  channels: number;           // 2-8
  strakes: number;            // 0-6
  strakeAngle: number;        // degrees
  kickupAngle: number;        // degrees
  gurneyFlap: boolean;
}

export interface UnderbodyConfig {
  floorType: UnderbodyFloorType;
  skidBlocks: boolean;
  floorEdgeWings: boolean;
  floorFences: number;        // 0-4
  coolingChannels: number;    // 0-3
}

export interface ActiveAeroConfig {
  enabled: boolean;
  activeSplitter: boolean;
  adaptiveWing: boolean;
  deployableSpoiler: boolean;
  activeGrille: boolean;
  movableDiffuser: boolean;
  airBrake: boolean;
  rideHeightAdj: boolean;
  drs: boolean;
  drsOpeningAngle: number;    // degrees
  mode: AeroMode;
}

export interface RearWingConfig {
  elements: number;           // 1-3
  span: number;               // mm
  chord: number;              // mm
  endplateDesign: "none" | "standard" | "slotted" | "curved";
  angleOfAttack: number;      // degrees
  swanNeckMount: boolean;
  gurneyFlap: boolean;
  beamWing: boolean;
}

export interface CoolingAeroConfig {
  radiatorSize: number;       // 0-1
  oilCoolerPlacement: "front" | "side" | "rear";
  brakeDucts: number;         // 0-1
  batteryCooling: number;     // 0-1
  engineBayExtraction: number;// 0-1
  hoodVents: number;          // 0-1
  fenderVents: number;        // 0-1
  heatShields: number;        // 0-1
}

export interface WheelAeroConfig {
  wheelAero: WheelAeroType;
  spokePattern: number;       // 0-1
  archVents: number;          // 0-1
  tireDeflectors: boolean;
  mudguards: boolean;
}

export interface WindTunnelConfig {
  windSpeed: number;          // km/h
  yawAngle: number;           // degrees
  pitch: number;              // degrees
  rideHeight: number;         // mm
  crosswind: number;          // 0-1
  rollingRoad: boolean;
}

export interface CfdConfig {
  quality: CfdQuality;
}

export interface AeroResearchConfig {
  front: FrontAeroConfig;
  sidepod: SidepodConfig;
  diffuser: DiffuserConfig;
  underbody: UnderbodyConfig;
  active: ActiveAeroConfig;
  rearWing: RearWingConfig;
  cooling: CoolingAeroConfig;
  wheel: WheelAeroConfig;
  mirror: MirrorAeroType;
  windTunnel: WindTunnelConfig;
  cfd: CfdConfig;
}

export interface ElectronicsConfig {
  abs: boolean;
  tractionControl: number; // 0-1
  stabilityControl: number;// 0-1
  launchControl: boolean;
  ecuMap: "eco" | "sport" | "track" | "qualifying";
  dataLogging: boolean;
  telemetryLevel: number;  // 0-1
}

// ---------- Infotainment & AI ---------- (Infotainment & AI department)

export type InfoDisplayConfig =
  | "none" | "lcd_5" | "touch_7" | "hd_8" | "fhd_10" | "cockpit_12_3"
  | "oled_15" | "oled_17_curved" | "dual" | "triple" | "passenger" | "rear";

export type InfoDisplayTech =
  | "tft" | "ips" | "oled" | "amoled" | "mini_led" | "micro_led" | "flexible_oled";

export type InfoOsTier = "none" | "embedded" | "android_auto" | "linux" | "qnx" | "custom_ai";

export type InfoVoiceLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type InfoAssistantPersonality =
  | "professional" | "friendly" | "luxury_concierge" | "sporty_coach"
  | "family_helper" | "minimalist" | "humorous";

export type InfoNavTier = "none" | "offline" | "premium";

export type InfoConnectivityTier = "none" | "wifi_4g" | "wifi_5g" | "satellite";

// New Vehicle Electronics Studio types
export type ClusterLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type ConnectivityTier = "basic" | "advanced" | "premium";
export type AudioTier = "basic" | "economy" | "mid" | "premium" | "luxury" | "ultra_luxury";
export type ClimateTier = "manual" | "single" | "dual" | "tri" | "four" | "five";
export type SeatTier = "basic" | "mid" | "premium" | "luxury" | "executive" | "ultra_luxury";
export type LightingTier = "none" | "white" | "multi" | "color64" | "dynamic" | "music_sync" | "welcome";
export type AdasLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type KeyType = "mechanical" | "remote" | "smart" | "phone" | "face" | "fingerprint";
export type HudType = "none" | "basic" | "color" | "ar";
export type DashMaterial = "plastic" | "soft_touch" | "leatherette" | "leather" | "alcantara" | "carbon_fiber" | "wood" | "aluminum" | "titanium" | "crystal";
export type RoofType = "metal" | "sunroof" | "panoramic" | "electrochromic" | "solar" | "starry";

export interface InfotainmentConfig {
  // 1. Instrument Cluster
  clusterLevel: ClusterLevel;
  // 2. Infotainment Screen
  displayConfig: InfoDisplayConfig;
  displayTech: InfoDisplayTech;
  // 3. Operating System
  osTier: InfoOsTier;
  otaUpdates: boolean;
  appStore: boolean;
  multiUser: boolean;
  cloudBackup: boolean;
  splitScreen: boolean;
  // 3b. Voice assistant (0-7)
  voiceLevel: InfoVoiceLevel;
  // 3c. AI chatbot
  aiChatbot: boolean;
  // 4. Connectivity tier (new)
  connectivityTier: ConnectivityTier;
  // 4b. Connectivity extras
  connExtras: {
    bluetooth: boolean; wifi: boolean; wirelessCharging: boolean;
    nfc: boolean; usbC: boolean; hdmi: boolean;
  };
  // Old connectivity field (kept for backward compat)
  connectivity: InfoConnectivityTier;
  v2v: boolean;
  v2i: boolean;
  cloudSync: boolean;
  // 5. Audio system
  audioTier: AudioTier;
  // 6. Climate control
  climateTier: ClimateTier;
  climateExtras: {
    rearAc: boolean; airPurifier: boolean; fragrance: boolean;
    humidityControl: boolean; ionizer: boolean;
  };
  // 7. Seats
  seatTier: SeatTier;
  seatFeatures: {
    heated: boolean; ventilated: boolean; massage: boolean;
    memory: boolean; reclining: boolean; legRest: boolean; zeroGravity: boolean;
  };
  // 8. Interior lighting
  lightingTier: LightingTier;
  ambientLightColors: number;
  dynamicLighting: boolean;
  musicSyncLighting: boolean;
  welcomeShow: boolean;
  goodbyeAnimation: boolean;
  personalizedStartup: boolean;
  // 9. Driver assistance (ADAS)
  adasLevel: AdasLevel;
  // 10. Parking systems
  parking: {
    rearSensors: boolean; frontSensors: boolean; reverseCamera: boolean;
    camera360: boolean; autoParking: boolean; remoteParking: boolean; smartphoneParking: boolean;
  };
  // 11. Keys
  keyType: KeyType;
  // 12. HUD
  hudType: HudType;
  // 13. Interior materials (dashboard)
  dashMaterial: DashMaterial;
  // 14. Roof
  roofType: RoofType;
  // 15. Convenience features
  convenience: {
    rainSensing: boolean; autoHeadlights: boolean; autoDimming: boolean;
    powerTailgate: boolean; handsFreeTailgate: boolean; softClose: boolean;
    vacuumDoors: boolean; poweredFrunk: boolean; digitalRearView: boolean;
  };
  // 16. Luxury package
  luxuryPackage: {
    refrigerator: boolean; champagneCooler: boolean; coffeeMaker: boolean;
    foldOutTables: boolean; rearEntertainment: boolean; individualTablets: boolean;
    wirelessHeadphones: boolean; businessConference: boolean;
  };
  // 17. AI features (extras beyond existing aiPersonal)
  aiFeatures: {
    voiceAssistant: boolean; aiRoutePlanning: boolean; moodDetection: boolean;
    faceRecognition: boolean; healthMonitoring: boolean; fatigueDetection: boolean;
    gestureControl: boolean; cabinPersonalization: boolean;
  };
  // 18. Safety electronics
  safetyElectronics: {
    abs: boolean; ebd: boolean; esc: boolean; tractionControl: boolean;
    blindSpot: boolean; collisionWarning: boolean; aeb: boolean; crossTraffic: boolean;
    nightVision: boolean; thermalCamera: boolean; driverMonitoring: boolean;
  };
  // --- existing AI fields (preserved) ---
  aiPersonal: {
    driverRecognition: boolean;
    faceRecognition: boolean;
    voiceRecognition: boolean;
    moodDetection: boolean;
    calendarSync: boolean;
    emailSummary: boolean;
    smartReminders: boolean;
    predictiveNav: boolean;
    drivingCoach: boolean;
    vehicleDiagnostics: boolean;
    serviceAdvisor: boolean;
    chargingPlanner: boolean;
    fuelStopPlanner: boolean;
    smartParking: boolean;
  };
  smartCabin: boolean;
  navTier: InfoNavTier;
  musicStreaming: string[];
  videoStreaming: string[];
  gaming: string[];
  androidAuto: boolean;
  carPlay: boolean;
  wirelessCarPlay: boolean;
  wirelessAndroidAuto: boolean;
  nfcPairing: boolean;
  phoneKey: boolean;
  smartwatchControl: boolean;
  aiSafety: {
    fatigueMonitor: boolean;
    eyeTracking: boolean;
    cabinCamera: boolean;
    childDetection: boolean;
    petDetection: boolean;
    emergencyAssist: boolean;
    autoAccidentCall: boolean;
    healthEmergency: boolean;
  };
  drivingCoach: boolean;
  predictiveMaintenance: boolean;
  remoteApp: {
    lockUnlock: boolean;
    startEngine: boolean;
    climateControl: boolean;
    locateVehicle: boolean;
    openTrunk: boolean;
    windowControl: boolean;
    chargeScheduling: boolean;
    otaUpdates: boolean;
    digitalKeySharing: boolean;
  };
  aiSecurity: {
    faceUnlock: boolean;
    fingerprint: boolean;
    voiceAuth: boolean;
    pin: boolean;
    phoneKeyAuth: boolean;
    theftDetection: boolean;
    remoteImmobilizer: boolean;
    geofencing: boolean;
  };
  productivity: {
    videoConferencing: boolean;
    calendarIntegration: boolean;
    emailAssistant: boolean;
    voiceNotes: boolean;
    documentViewer: boolean;
    aiMeetingSummaries: boolean;
  };
  performanceAdvisor: boolean;
  assistantPersonality: InfoAssistantPersonality;
}

export interface InfotainmentSim {
  hardwareCost: number;
  softwareCost: number;       // software development cost (amortized per unit)
  totalCost: number;          // total infotainment cost added to vehicle
  weight: number;             // kg
  powerDraw: number;          // W continuous
  heatGeneration: number;     // 0-1 relative
  wiringComplexity: number;   // 0-1
  assemblyTime: number;       // hours added per unit
  reliability: number;        // 0-1 (more features = lower)
  luxuryScore: number;        // 0-1
  technologyScore: number;    // 0-1
  cybersecurityRisk: number;  // 0-1 (more connectivity = higher)
  customerSatisfaction: number; // 0-1
  bootTime: number;           // seconds
  voiceAccuracy: number;      // 0-1
  featureCount: number;
  // New detailed breakdown
  safetyBonus: number;        // 0-1 added to vehicle safety
  batterySizeRequired: number; // kWh extra battery needed for electronics
  maintenanceCost: number;    // annual $ per vehicle
  warrantyRisk: number;       // 0-1
  retailPriceImpact: number;  // $ added to retail price
  trimName: string;
  trimDescription: string;
  trimTier: string;
}

export interface InteriorConfig {
  seatType: "standard" | "sport" | "bucket" | "carbon_bucket" | "racing_shell";
  seatMaterial: "cloth" | "alcantara" | "leather" | "carbon_leather" | "suede";
  seatCount: number;
  dashboardMaterial: "plastic" | "soft_touch" | "carbon_fiber" | "alcantara" | "wood" | "aluminum";
  infotainmentSize: number; // inches
  hasNav: boolean;
  hasPremiumAudio: boolean;
  audioSpeakers: number;
  climateControl: boolean;
  ambientLighting: number;  // 0-1
  soundDeadening: number;   // 0-1
  steeringWheel: "standard" | "sport" | "flat_bottom" | "carbon" | "gt_wheel";
  steeringMaterial: "plastic" | "leather" | "alcantara" | "carbon";
  pedalSet: "standard" | "sport" | "aluminum" | "carbon";
  shiftKnob: "standard" | "leather" | "aluminum" | "carbon" | "titanium";
  rollCage: "none" | "half" | "full" | "welded" | "chrome_moly";
  fireExtinguisher: boolean;
  racingHarness: boolean;
  harnessPoints: number;    // 4, 5, or 6
  windowNet: boolean;
  interiorWeight: number;   // computed but user can override slightly
  interiorColor: string;    // hex
  accentColor: string;      // hex
  trimFinish: "matte" | "gloss" | "satin" | "brushed";
}

// ---------- Track ----------

export type TrackId =
  | "monza" | "spa" | "silverstone" | "suzuka" | "nurburgring" | "lemans"
  | "laguna" | "interlagos" | "monaco" | "bathurst" | "imola" | "redbullring"
  | "hungaroring" | "zandvoort" | "americas" | "miami" | "vegas" | "fuji"
  | "sebring" | "watkins" | "roadatlanta" | "dragstrip" | "nordschleife";

export interface TrackSegment {
  type: "straight" | "corner";
  length: number;  // m (straight) or radius (corner)
  arc: number;     // degrees (0 for straight)
}

export interface TrackInfo {
  id: TrackId;
  name: string;
  country: string;
  length: number;     // km
  highSpeed: boolean;
  altitudeChange: number; // m
  segments: TrackSegment[];
}

// ---------- Race ----------

export type WeatherType = "dry" | "cloudy" | "light_rain" | "heavy_rain" | "changing";
export type DriverSkill = "rookie" | "amateur" | "pro" | "expert" | "legend";
export type RaceType = "sprint" | "feature" | "endurance" | "timed" | "drag";
export type PitStrategy = "none" | "conservative" | "balanced" | "aggressive";
export type TireStrategy = "single" | "two" | "three";
export type FuelStrategy = "lean" | "balanced" | "rich" | "push";

export interface RaceConfig {
  trackId: TrackId;
  laps: number;
  weather: WeatherType;
  weatherChangeLap: number;
  weatherChangeTo: WeatherType;
  driverSkill: DriverSkill;
  aggression: number;
  fieldSize: number;
  pitStrategy: PitStrategy;
  fuelLoad: number;     // 0-1
  fuelStrategy: FuelStrategy;
  tireStrategy: TireStrategy;
  hybridDeployMode: "qualifying" | "race" | "save" | "attack" | "endurance" | "hotlap";
  startingTireTemp: number; // °C
  trackTemp: number;        // °C
  ambientTemp: number;      // °C
}

export interface LapRecord {
  lap: number;
  time: number;
  fuel: number;
  batterySOC: number;       // 0-1 state of charge
  tireWearFL: number;
  tireWearFR: number;
  tireWearRL: number;
  tireWearRR: number;
  tireTempFL: number;       // °C
  tireTempFR: number;
  tireTempRL: number;
  tireTempRR: number;
  brakeTemp: number;
  waterTemp: number;
  oilTemp: number;
  topSpeed: number;
  avgSpeed: number;
  pitted: boolean;
  position: number;
  energyRecovered: number;  // kWh this lap (MGU-H + MGU-K)
  energyDeployed: number;   // kWh this lap
  stintLap: number;         // laps since last pit
}

export interface CornerAnalysis {
  index: number;
  type: "straight" | "corner";
  entrySpeed: number;
  apexSpeed: number;
  exitSpeed: number;
  lateralG: number;
  brakingZone: number;
  duration: number;
}

export interface CompetitorResult {
  position: number;
  name: string;
  totalTime: number;
  bestLap: number;
  laps: number;
  pitted: boolean;
  retired: boolean;
  gapToLeader: number;
  carColor: string;
}

export interface StrategySuggestion {
  category: "tire" | "fuel" | "hybrid" | "setup" | "driver";
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  expectedGain: string;
}

export interface RaceResult {
  config: RaceConfig;
  trackId: TrackId;
  trackName: string;
  totalTime: number;
  laps: number;
  bestLap: number;
  bestLapNumber: number;
  avgLap: number;
  fuelUsed: number;
  fuelRemaining: number;
  pitStops: number;
  totalTimeLost: number;
  tireWearEnd: number;
  finalPosition: number;
  gridPosition: number;
  positionsGained: number;
  lapRecords: LapRecord[];
  corners: CornerAnalysis[];
  competitors: CompetitorResult[];
  weatherPerLap: WeatherType[];
  incidents: { lap: number; type: string; description: string }[];
  dnf: boolean;
  dnfReason: string | null;
  topSpeed: number;
  avgSpeed: number;
  score: number;
  suggestions: StrategySuggestion[];
  fuelEfficiency: number;    // L per lap
  energyRecoveredTotal: number; // kWh
  energyDeployedTotal: number;  // kWh
  tireTempStable: boolean;
  tireManagementScore: number;  // 0-100
  fuelManagementScore: number;  // 0-100
}

// ---------- Manufacturing ----------

export type FrameMaterial = "steel" | "aluminum" | "carbon_fiber" | "titanium" | "magnesium" | "composites";
export type ManufacturingProcess = "hand_built" | "semi_automated" | "automated" | "mass_production" | "3d_printed";
export type FactoryTier = "boutique" | "small_batch" | "mid_volume" | "high_volume" | "mega";
export type AutomationLevel = "manual" | "assisted" | "automated" | "lights_out";
export type QcLevel = "basic" | "standard" | "premium" | "aerospace";

export interface ManufacturingConfig {
  frameMaterial: FrameMaterial;
  bodyMaterial: FrameMaterial;
  process: ManufacturingProcess;
  factoryTier: FactoryTier;
  automation: AutomationLevel;
  assemblyLine: "cell" | "flow" | "flexible" | "lean";
  qcLevel: QcLevel;
  productionVolume: number;   // units/year
  shiftCount: number;        // 1-3
}

// ---------- Full design + sim ----------

export interface VehicleDesign {
  name: string;
  description: string;
  engine: EngineConfig;
  vehicle: VehicleConfig;
  manufacturing: ManufacturingConfig;
  infotainment: InfotainmentConfig;
  createdAt: string;
  updatedAt: string;
}

export interface SimResult {
  // Engine
  displacement: number;
  cylinderCount: number;
  powerCurve: { rpm: number; power: number; torque: number }[];
  peakPower: number;
  peakTorque: number;
  peakPowerRpm: number;
  peakTorqueRpm: number;
  redline: number;
  maxPistonSpeed: number;
  thermalEfficiency: number;
  knockRisk: number;
  octaneRequired: number;
  bsfc: number;
  turboLag: number;
  boostPressure: number;
  engineWeight: number;
  engineCost: number;
  reliability: number;
  nvh: number;
  noise: number;
  emissions: number;
  fuelEconomy: number;
  coolingMargin: number;

  // Hybrid / EV
  mguHPower: number;
  mguKPower: number;
  combinedPower: number;
  combinedTorque: number;
  batteryWeight: number;
  batteryCost: number;
  batteryEnergy: number;
  electricRange: number;
  regenEfficiency: number;
  isElectric: boolean;
  isHybrid: boolean;

  // Aero
  dragCoeff: number;
  frontalArea: number;
  downforce: number;
  liftCoeff: number;
  centerOfPressure: number;
  aeroBalance: number;
  dragVsSpeed: { speed: number; drag: number; downforce: number }[];
  aeroCost: number;
  aeroWeight: number;
  coolingEfficiency: number;
  frontDownforce: number;
  rearDownforce: number;
  groundEffect: number;
  separationRisk: number;
  brakeCooling: number;
  aeroNoise: number;

  // Performance
  weight: number;
  weightDistFront: number;
  cgHeight: number;
  topSpeed: number;
  accel0_60: number;
  accel0_100: number;
  accel100_200: number;
  quarterMile: number;
  quarterMileSpeed: number;
  halfMile: number;
  halfMileSpeed: number;
  brakingDist: number;
  lateralG: number;
  skidpad: number;
  slalomSpeed: number;

  // Cost & ratings
  vehicleCost: number;
  totalCost: number;
  targetPrice: number;
  profitMargin: number;
  safetyRating: number;
  marketRating: number;
  drivability: number;

  // Cost breakdown
  costBreakdown: {
    materials: number;
    labor: number;
    tooling: number;
    assembly: number;
    warranty: number;
    overhead: number;
  };

  // Manufacturing
  manufacturing: {
    productionTime: number;       // hours per unit
    productionTimePerYear: number; // total annual hours
    qualityScore: number;         // 0-100
    defectRate: number;           // defects per thousand
    automationScore: number;      // 0-100
    laborCost: number;
    toolingCost: number;
    materialCost: number;
    warrantyCost: number;
    assemblyCost: number;
    overheadCost: number;
    unitCost: number;
  };

  // Testing
  testing: {
    windTunnel: {
      liftDragRatio: number;
      aeroEfficiency: number;
      balanceScore: number;
      coolingFlow: number;
    };
    crashTest: {
      frontalScore: number;
      sideScore: number;
      rolloverScore: number;
      overall: number;
      starRating: number;
    };
    brakeTest: {
      stopDist60_0: number;
      stopDist100_0: number;
      fadeResistance: number;
      consistency: number;
    };
    skidpadTest: {
      maxLateralG: number;
      balance: number;
      gripScore: number;
    };
    slalomTest: {
      maxSpeed: number;
      transitionTime: number;
      stability: number;
    };
  };

  // Interior
  interiorWeight: number;
  interiorCost: number;
  comfortRating: number;
  luxuryRating: number;

  // Infotainment & AI
  infotainment: InfotainmentSim;

  // Lap times
  lapTimes: { trackId: TrackId; trackName: string; time: number; topSpeed: number; avgSpeed: number }[];
}

// ===================================================================
// VEHICLE GARAGE & LINEAGE
// ===================================================================

export type VehicleVariantType = "base" | "trim" | "facelift" | "generation" | "special_edition";

export interface GarageVehicle {
  id: string;
  name: string;
  modelName: string;           // e.g. "Falcon"
  variantName: string;         // e.g. "GT", "Sport", "Base"
  variantType: VehicleVariantType;
  generation: number;          // 1, 2, 3...
  design: VehicleDesign;
  sim: SimResult;
  parentId: string | null;     // lineage reference
  childIds: string[];
  createdAt: string;
  updatedAt: string;
  tags: string[];
  notes: string;
  // Lifecycle
  isLaunched: boolean;
  launchMonth: number | null;
  discontinuedMonth: number | null;
  totalUnitsSold: number;
  // Quick stats for grid display
  peakPower: number;
  weight: number;
  topSpeed: number;
  price: number;
  overallRating: number;       // 0-100 computed
}

export interface VehicleLineage {
  rootId: string;
  modelName: string;
  nodes: { id: string; name: string; generation: number; variantType: VehicleVariantType; parentId: string | null }[];
}

// ===================================================================
// DYNAMIC ECONOMY & MARKET
// ===================================================================

export type RegulationType = "emissions" | "safety" | "ev_mandate" | "fuel_economy" | "noise" | "recycling";
export type MarketEventType = "oil_crisis" | "ev_boom" | "material_shortage" | "tech_breakthrough" | "recession" | "luxury_boom" | "suv_craze" | "green_mandate";

export interface MarketSegmentDemand {
  segment: PlatformType;
  demand: number;              // 0-1 relative demand
  growthRate: number;          // -0.5 to 0.5 monthly
  averagePrice: number;       // $
  competitorCount: number;
}

export interface Regulation {
  id: string;
  type: RegulationType;
  name: string;
  description: string;
  effectiveMonth: number;
  severity: number;            // 0-1
  region: "global" | "na" | "eu" | "asia";
  penalty: number;             // $ per violation
}

export interface MarketEvent {
  id: string;
  type: MarketEventType;
  name: string;
  description: string;
  startMonth: number;
  durationMonths: number;
  effects: {
    fuelPriceMultiplier?: number;
    materialCostMultiplier?: number;
    evDemandBonus?: number;
    luxuryDemandBonus?: number;
    suvDemandBonus?: number;
  };
}

export interface EconomyState {
  month: number;
  fuelPrice: number;           // $/gallon
  fuelPriceHistory: { month: number; price: number }[];
  materialCosts: {
    steel: number; aluminum: number; carbon_fiber: number;
    titanium: number; lithium: number; copper: number;
    rare_earth: number; rubber: number;
  };
  materialCostHistory: { month: number; costs: Record<string, number> }[];
  segmentDemand: MarketSegmentDemand[];
  activeRegulations: Regulation[];
  upcomingRegulations: Regulation[];
  activeEvents: MarketEvent[];
  eventHistory: MarketEvent[];
  customerPreferences: {
    evAdoption: number;        // 0-1
    suvPreference: number;     // 0-1
    luxuryDemand: number;      // 0-1
    performanceDemand: number; // 0-1
    safetyPriority: number;    // 0-1
    techPriority: number;      // 0-1
    ecoFriendly: number;       // 0-1
  };
  inflation: number;           // annual %
  interestRate: number;        // annual %
  gdpGrowth: number;           // annual %
}

// ===================================================================
// MOTORSPORT DIVISION
// ===================================================================

export type MotorsportCategory = "gt" | "formula" | "hypercar" | "touring" | "rally" | "endurance";
export type TeamStatus = "inactive" | "developing" | "competing" | "champion";

export interface RaceDriver {
  id: string;
  name: string;
  nationality: string;
  skill: number;               // 0-100
  experience: number;          // 0-100
  consistency: number;         // 0-100
  wetSkill: number;            // 0-100
  aggression: number;          // 0-100
  salary: number;              // $ per season
  contractMonths: number;
}

export interface MotorsportTeam {
  id: string;
  name: string;
  category: MotorsportCategory;
  status: TeamStatus;
  baseVehicleId: string | null;// garage vehicle used as base
  drivers: RaceDriver[];
  budget: number;              // $ per season
  developmentPoints: number;   // earned from races
  techTransferPool: number;    // points to transfer to/from production
  seasonResults: SeasonResult[];
  currentSeason: number;
  wins: number;
  podiums: number;
  championships: number;
}

export interface SeasonResult {
  season: number;
  category: MotorsportCategory;
  position: number;            // championship position
  points: number;
  wins: number;
  podiums: number;
  dnfs: number;
  bestFinish: number;
  raceResults: { round: number; trackId: TrackId; position: number; points: number }[];
  techPointsEarned: number;
}

export interface MotorsportState {
  teams: MotorsportTeam[];
  currentSeason: number;
  techTransferHistory: {
    month: number;
    direction: "race_to_production" | "production_to_race";
    category: string;
    bonus: string;
    points: number;
  }[];
  totalTechTransferred: number;
}

// ===================================================================
// DIGITAL TWIN
// ===================================================================

export type TwinEventType =
  | "design_created" | "design_modified" | "test_completed" | "simulation_run"
  | "manufacturing_started" | "vehicle_launched" | "customer_feedback"
  | "warranty_claim" | "race_entry" | "race_result" | "facelift" | "generation"
  | "recall" | "award" | "review_published";

export interface TwinEvent {
  id: string;
  vehicleId: string;
  type: TwinEventType;
  month: number;
  title: string;
  description: string;
  data?: Record<string, number | string | boolean>;
  severity?: "info" | "success" | "warning" | "danger";
}

export interface DigitalTwinData {
  vehicleId: string;
  events: TwinEvent[];
  metricsOverTime: {
    month: number;
    unitsSold: number;
    customerSatisfaction: number;
    warrantyClaimRate: number;
    reliabilityScore: number;
    marketShare: number;
  }[];
  totalWarrantyClaims: number;
  totalUnitsProduced: number;
  totalRevenue: number;
  lifetimeRating: number;      // 0-100
}

// ===================================================================
// SAFETY CENTER
// ===================================================================

export type CrumpleZoneType = "none" | "basic" | "progressive" | "advanced" | "adaptive";
export type AirbagType = "none" | "front" | "front_side" | "full_curtain" | "full_360" | "external";
export type SafetyCageType = "none" | "reinforced_pillars" | "safety_cell" | "carbon_monocoque" | "full_cage";
export type SeatbeltType = "three_point" | "pretensioner" | "load_limiter" | "active_belt" | "four_point";
export type PedestrianSafetyType = "none" | "active_hood" | "bumper_airbag" | "full_pedestrian";

export interface SafetyConfig {
  frontCrumple: CrumpleZoneType;
  rearCrumple: CrumpleZoneType;
  sideCrumple: CrumpleZoneType;
  airbagType: AirbagType;
  airbagCount: number;         // 2-12
  safetyCage: SafetyCageType;
  seatbeltType: SeatbeltType;
  pedestrianSafety: PedestrianSafetyType;
  childSafetyAnchors: number;  // 0-4
  rolloverProtection: boolean;
  doorBeams: boolean;
  energyAbsorbingSteeringColumn: boolean;
  collapsiblePedals: boolean;
  fireSuppressionSystem: boolean;
  eCallSystem: boolean;
  postCrashBatteryDisconnect: boolean;
}

export interface SafetySimResult {
  frontalCrashScore: number;   // 0-100
  sideCrashScore: number;      // 0-100
  rearCrashScore: number;      // 0-100
  rolloverScore: number;       // 0-100
  pedestrianScore: number;     // 0-100
  childSafetyScore: number;    // 0-100
  overallScore: number;        // 0-100
  ncapStars: number;           // 1-5
  safetyWeight: number;        // kg added
  safetyCost: number;          // $ added
  activeFeatureBonus: number;  // 0-1 from ADAS
}

// ===================================================================
// ENGINEERING WORKFLOW PIPELINE
// ===================================================================

export type WorkflowStage =
  | "research" | "concept" | "design" | "simulation" | "prototype"
  | "testing" | "redesign" | "manufacturing" | "sales" | "feedback" | "next_gen";

export interface WorkflowStep {
  stage: WorkflowStage;
  status: "locked" | "available" | "in_progress" | "completed" | "skipped";
  startedMonth: number | null;
  completedMonth: number | null;
  qualityScore: number;        // 0-100 (higher = better execution)
  skipPenalty: number;          // 0-1 penalty for skipping
  monthsRequired: number;      // base months to complete
  monthsSpent: number;
}

export interface WorkflowPipeline {
  vehicleId: string;
  steps: WorkflowStep[];
  currentStage: WorkflowStage;
  overallProgress: number;     // 0-1
  qualityMultiplier: number;   // product of all step qualities
}

// ===================================================================
// CUSTOMER FEEDBACK & SALES
// ===================================================================

export interface CustomerFeedback {
  vehicleId: string;
  month: number;
  satisfaction: number;        // 0-100
  reliability: number;         // 0-100
  valueForMoney: number;       // 0-100
  performance: number;         // 0-100
  comfort: number;             // 0-100
  technology: number;          // 0-100
  design: number;              // 0-100
  complaints: string[];
  praises: string[];
  recommendRate: number;       // 0-1 (Net Promoter Score basis)
  warrantyClaims: number;
  totalReviews: number;
}

export type LaunchEventType = "auto_show" | "online_reveal" | "private_event" | "press_launch" | "dealer_launch";
export type PricingStrategy = "premium" | "competitive" | "value" | "penetration" | "skimming";
export type MarketSegmentTarget = "economy" | "mainstream" | "premium" | "luxury" | "ultra_luxury" | "hypercar";

export interface SalesConfig {
  vehicleId: string;
  targetPrice: number;
  pricingStrategy: PricingStrategy;
  marketSegment: MarketSegmentTarget;
  launchEvent: LaunchEventType;
  marketingBudget: number;     // $
  dealerMargin: number;        // 0-0.3
  targetVolume: number;        // units per year
  regions: ("na" | "eu" | "asia" | "middle_east" | "oceania")[];
  warrantyYears: number;
  warrantyMiles: number;
}

export interface SalesResult {
  vehicleId: string;
  month: number;
  unitsSold: number;
  revenue: number;
  profit: number;
  marketShare: number;         // 0-1
  customerAcquisitionCost: number;
  breakEvenMonth: number | null;
  cumulativeUnits: number;
  cumulativeRevenue: number;
  cumulativeProfit: number;
  regionBreakdown: Record<string, number>;
}

// ===================================================================
// LIVING AI COMPETITORS
// ===================================================================

export type CompetitorStrategy = "innovation" | "value" | "luxury" | "performance" | "balanced";

export interface AICompanyProfile {
  id: string;
  name: string;
  logo: string;                // emoji or icon key
  color: string;               // hex
  strategy: CompetitorStrategy;
  founded: number;             // month
  cash: number;
  brandValue: number;          // 0-100
  techLevel: number;           // 0-100
  marketShare: number;         // 0-1
  vehicles: AICompetitorVehicle[];
  patents: string[];
  specialties: string[];
  aggressiveness: number;      // 0-1
  reactionSpeed: number;       // 0-1 (how fast they respond to player)
}

export interface AICompetitorVehicle {
  id: string;
  name: string;
  segment: PlatformType;
  price: number;
  power: number;
  weight: number;
  topSpeed: number;
  accel0_100: number;
  safetyRating: number;
  techScore: number;
  customerRating: number;
  launchMonth: number;
  salesPerMonth: number;
  isActive: boolean;
}

export interface AICompetitorAction {
  month: number;
  companyId: string;
  companyName: string;
  type: "launch" | "patent" | "price_cut" | "recall" | "breakthrough" | "expansion" | "partnership" | "motorsport_win";
  title: string;
  description: string;
  impact: string;
}

export interface CompanyState {
  garage: GarageVehicle[];
  economy: EconomyState;
  motorsport: MotorsportState;
  digitalTwins: Record<string, DigitalTwinData>;
  aiCompetitors: AICompanyProfile[];
  competitorActions: AICompetitorAction[];
  salesData: Record<string, SalesResult[]>;
  customerFeedback: Record<string, CustomerFeedback[]>;
  workflows: Record<string, WorkflowPipeline>;
  companyName: string;
  companyFounded: number;      // month
  totalRevenue: number;
  totalProfit: number;
  reputation: number;          // 0-100
  employeeCount: number;
}
