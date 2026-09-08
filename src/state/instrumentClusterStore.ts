import { create } from "zustand";

export type ClusterTheme = "ice_blue" | "amber_classic" | "crimson_sport" | "arctic_white" | "neon_cyber";

export interface TelltaleDefinition {
  id: string;
  name: string;
  category: "green_blue" | "amber" | "red";
  iconSymbol: string;
  colorHex: string;
  description: string;
  systemAction: string;
  recommendedFix: string;
  dtcCode?: string;
  meshNodeName: string;
}

export const TELLTALE_DEFINITIONS: TelltaleDefinition[] = [
  // ── GREEN / BLUE (Operational / Informational) ──────────────────────────
  {
    id: "turnSignals",
    name: "Turn Signals",
    category: "green_blue",
    iconSymbol: "⬅️ ➡️",
    colorHex: "#22c55e",
    description: "Indicates directional turn indicator or hazard flasher relay operation.",
    systemAction: "Flashers pulsing at standard 85 cycles/min with audible clicking.",
    recommendedFix: "Normal operation. If flashing at double speed, check for blown exterior bulb.",
    meshNodeName: "TELLTALE_TURN_SIGNALS",
  },
  {
    id: "highBeam",
    name: "High Beam Light",
    category: "green_blue",
    iconSymbol: "🔵",
    colorHex: "#3b82f6",
    description: "Main headlight high beam projector shutters are fully open for maximum visibility.",
    systemAction: "Auto-dimming ADAS camera monitors oncoming traffic.",
    recommendedFix: "Normal operation. Toggle column stalk switch to dip beams for oncoming vehicles.",
    meshNodeName: "TELLTALE_HIGH_BEAM",
  },
  {
    id: "fogBeams",
    name: "Fog Beams Indicator",
    category: "green_blue",
    iconSymbol: "🌁",
    colorHex: "#22c55e",
    description: "Low-mounted wide-dispersion fog lamps active for adverse weather penetration.",
    systemAction: "Auxiliary bumper-mounted LED optics powered.",
    recommendedFix: "Normal operation in heavy fog, rain, or snow.",
    meshNodeName: "TELLTALE_FOG_BEAMS",
  },
  {
    id: "cruiseControl",
    name: "Cruise Control",
    category: "green_blue",
    iconSymbol: "🟢",
    colorHex: "#10b981",
    description: "Electronic speed regulator or radar Adaptive Cruise Control (ACC) engaged.",
    systemAction: "Throttle actuator or drive inverter modulates speed to setpoint.",
    recommendedFix: "Normal operation. Cancel via brake tap or steering wheel thumb cancel switch.",
    meshNodeName: "TELLTALE_CRUISE",
  },

  // ── YELLOW / AMBER (Caution / Fault / Advisory) ─────────────────────────
  {
    id: "abs",
    name: "Anti-Lock Brake Sys",
    category: "amber",
    iconSymbol: "🟡",
    colorHex: "#f59e0b",
    description: "ABS hydraulic modulator unit has detected a wheel speed or pressure sensor fault.",
    systemAction: "ABS pulsing disabled; standard hydraulic power brakes remain functional.",
    recommendedFix: "Inspect wheel speed tone rings, sensors, or ABS pump solenoid circuit.",
    dtcCode: "C0035",
    meshNodeName: "TELLTALE_ABS",
  },
  {
    id: "warningLight",
    name: "Warning Light",
    category: "amber",
    iconSymbol: "⚠️",
    colorHex: "#f59e0b",
    description: "Master warning indicator alerting driver to check center MID notification screen.",
    systemAction: "Chime sounded; secondary warning prompt logged in body control module (BCM).",
    recommendedFix: "Review center cluster text message (e.g. washer fluid, bulb failure, key battery).",
    meshNodeName: "TELLTALE_WARNING_LIGHT",
  },
  {
    id: "slipIndicator",
    name: "Slip Indicator",
    category: "amber",
    iconSymbol: "〰️",
    colorHex: "#f59e0b",
    description: "Traction Control System (TCS) actively mitigating tire slippage on low-friction road.",
    systemAction: "Electronic brake force applied to spinning wheel, engine torque modulated.",
    recommendedFix: "Reduce throttle input on snow/ice. If illuminated continuously, inspect yaw sensor.",
    meshNodeName: "TELLTALE_SLIP",
  },
  {
    id: "windshieldDefrost",
    name: "Windshield Defrost",
    category: "amber",
    iconSymbol: "💨",
    colorHex: "#f59e0b",
    description: "Max windshield defrost blower active with A/C compressor dehumidification.",
    systemAction: "Directs 100% warm air to windshield vents to clear frost and condensation.",
    recommendedFix: "Normal operation during cabin warm-up.",
    meshNodeName: "TELLTALE_DEFROST_FRONT",
  },
  {
    id: "childSafetyLocks",
    name: "Child Safety Locks",
    category: "amber",
    iconSymbol: "🔒",
    colorHex: "#f59e0b",
    description: "Electronic rear door interior handle disconnect is engaged.",
    systemAction: "Rear passengers cannot open rear doors from interior.",
    recommendedFix: "Toggle switch on driver door master window switch panel to disengage.",
    meshNodeName: "TELLTALE_CHILD_LOCKS",
  },
  {
    id: "glowPlug",
    name: "Glow Plug (Diesel)",
    category: "amber",
    iconSymbol: "➰",
    colorHex: "#f59e0b",
    description: "Combustion pre-heat glow plugs warming diesel cylinder chambers before cranking.",
    systemAction: "High-amperage heater coils active until ignition threshold reached.",
    recommendedFix: "Wait until light extinguishes before depressing start button. If flashing, circuit fault.",
    dtcCode: "P0380",
    meshNodeName: "TELLTALE_GLOW_PLUG",
  },
  {
    id: "awd",
    name: "AWD",
    category: "amber",
    iconSymbol: "🚙",
    colorHex: "#f59e0b",
    description: "All-Wheel-Drive electronic center clutch pack locked or high-torque split active.",
    systemAction: "50:50 torque split engaged for extreme mud, sand, or snow.",
    recommendedFix: "Normal in AWD Lock mode. Disengage on dry pavement to prevent driveline binding.",
    meshNodeName: "TELLTALE_AWD",
  },
  {
    id: "odOff",
    name: "Overdrive Indicator",
    category: "amber",
    iconSymbol: "⚙️",
    colorHex: "#f59e0b",
    description: "Automatic transmission top cruising gear (Overdrive) locked out.",
    systemAction: "Transmission holds lower ratios for engine braking on steep mountain descents.",
    recommendedFix: "Press O/D button on shift lever to restore top overdrive gear for fuel economy.",
    meshNodeName: "TELLTALE_OD_OFF",
  },
  {
    id: "checkEngine",
    name: "Engine Management",
    category: "amber",
    iconSymbol: "🛠️",
    colorHex: "#f59e0b",
    description: "Malfunction Indicator Lamp (MIL). ECU detected emissions or powertrain anomaly.",
    systemAction: "ECU enters closed-loop protection map; freeze-frame data stored in OBD-II memory.",
    recommendedFix: "Scan vehicle with OBD-II diagnostic reader (e.g. O2 sensor, misfire, EVAP purge valve).",
    dtcCode: "P0300",
    meshNodeName: "TELLTALE_CHECK_ENGINE",
  },
  {
    id: "tirePressure",
    name: "Tire pressure",
    category: "amber",
    iconSymbol: "🛞",
    colorHex: "#f59e0b",
    description: "Tire Pressure Monitoring System (TPMS) detected pressure drop > 25% below placard.",
    systemAction: "Direct RF wheel sensor reports pressure deficit in one or more tires.",
    recommendedFix: "Check tire pressures cold with digital gauge. Inflate to door jamb placard PSI.",
    dtcCode: "C0750",
    meshNodeName: "TELLTALE_TPMS",
  },
  {
    id: "rearDefrost",
    name: "Rear Window Defrost",
    category: "amber",
    iconSymbol: "🪟",
    colorHex: "#f59e0b",
    description: "Rear glass resistive ceramic heating grid and side mirror heaters energized.",
    systemAction: "High-current timer relay active (auto-cancels after 15 minutes).",
    recommendedFix: "Normal operation to evaporate rear window frost or dew.",
    meshNodeName: "TELLTALE_DEFROST_REAR",
  },
  {
    id: "powertrain",
    name: "Powertrain",
    category: "amber",
    iconSymbol: "⚙️!",
    colorHex: "#f59e0b",
    description: "Hybrid drive motor inverter, transmission valve body, or transfer case fault.",
    systemAction: "Powertrain control module limits torque to safeguard mechanical gears.",
    recommendedFix: "Inspect transmission fluid temperature and hybrid inverter coolant level.",
    dtcCode: "P0700",
    meshNodeName: "TELLTALE_POWERTRAIN",
  },
  {
    id: "electronicStability",
    name: "Electronic Stability",
    category: "amber",
    iconSymbol: "ESP",
    colorHex: "#f59e0b",
    description: "ESP / ESC / BAS active or temporarily disabled via console track mode button.",
    systemAction: "Vehicle dynamics yaw and lateral G sensors monitor vehicle trajectory.",
    recommendedFix: "Press ESP button to re-enable full electronic stability intervention.",
    meshNodeName: "TELLTALE_ESP",
  },
  {
    id: "lowFuel",
    name: "Low Fuel Notification",
    category: "amber",
    iconSymbol: "⛽",
    colorHex: "#f59e0b",
    description: "Fuel tank level sensor has fallen below 12% reserve capacity (< 35 miles range).",
    systemAction: "Navigation system offers nearby filling station or EV charger routing.",
    recommendedFix: "Refuel vehicle promptly to prevent submerged electric fuel pump overheating.",
    meshNodeName: "TELLTALE_LOW_FUEL",
  },

  // ── RED (Critical Safety / Immediate Action) ───────────────────────────
  {
    id: "brakeSystemAlert",
    name: "Brake System Alert",
    category: "red",
    iconSymbol: "🛑",
    colorHex: "#ef4444",
    description: "Parking brake engaged, low hydraulic brake fluid level, or hydraulic pressure loss.",
    systemAction: "High-pitch warning chime sounded.",
    recommendedFix: "Release emergency brake. If light persists, check master cylinder brake fluid level immediately.",
    dtcCode: "C0040",
    meshNodeName: "TELLTALE_BRAKE_ALERT",
  },
  {
    id: "frontAirbag",
    name: "Front Airbag",
    category: "red",
    iconSymbol: "💥",
    colorHex: "#ef4444",
    description: "Supplemental Restraint System (SRS) airbag squib or occupant sensor circuit fault.",
    systemAction: "Airbag deployment may be inhibited in event of a collision.",
    recommendedFix: "Inspect passenger seat weight sensor, steering clockspring, and harness connectors.",
    dtcCode: "B0001",
    meshNodeName: "TELLTALE_AIRBAG",
  },
  {
    id: "openDoors",
    name: "Open Doors",
    category: "red",
    iconSymbol: "🚪",
    colorHex: "#ef4444",
    description: "One or more doors, trunk tailgate, or hood latch sensor is not securely closed.",
    systemAction: "Interior cabin lights illuminate; audible alarm if vehicle moves.",
    recommendedFix: "Firmly shut all vehicle doors, trunk, and front hood.",
    meshNodeName: "TELLTALE_OPEN_DOORS",
  },
  {
    id: "oilPressure",
    name: "Oil Pressure Warning",
    category: "red",
    iconSymbol: "🛢️",
    colorHex: "#ef4444",
    description: "CRITICAL: Engine lubrication oil pressure dropped below minimum safety threshold (< 6 PSI).",
    systemAction: "Catastrophic engine bearing seizure risk within seconds.",
    recommendedFix: "PULL OVER IMMEDIATELY and SHUT OFF ENGINE. Check dipstick level; do NOT drive.",
    dtcCode: "P0524",
    meshNodeName: "TELLTALE_OIL_PRESSURE",
  },
  {
    id: "seatBelt",
    name: "Seat Belt Reminder",
    category: "red",
    iconSymbol: "💺",
    colorHex: "#ef4444",
    description: "Occupied front passenger or driver seat belt buckle switch unlatched.",
    systemAction: "Staged acoustic warning tone chimes repeatedly above 10 MPH.",
    recommendedFix: "Fasten driver and passenger three-point seat belts securely.",
    meshNodeName: "TELLTALE_SEAT_BELT",
  },
  {
    id: "temperatureWarning",
    name: "Temperature Warning",
    category: "red",
    iconSymbol: "🌡️",
    colorHex: "#ef4444",
    description: "CRITICAL: Engine coolant temperature exceeds 120°C (248°F) boiling threshold.",
    systemAction: "Risk of blown head gasket, cylinder head warpage, and coolant steam expulsion.",
    recommendedFix: "Pull over safely, turn heater to max to bleed heat, shut down engine after 1 min.",
    dtcCode: "P0217",
    meshNodeName: "TELLTALE_TEMP_WARNING",
  },
  {
    id: "batteryWarning",
    name: "Battery Warning",
    category: "red",
    iconSymbol: "🔋",
    colorHex: "#ef4444",
    description: "12V charging system failure; alternator regulator failed or serpentine belt snapped.",
    systemAction: "Vehicle running solely on battery reserve; power steering & electronics will fail soon.",
    recommendedFix: "Inspect alternator belt tension, battery terminal connections, and alternator diode pack.",
    dtcCode: "P0562",
    meshNodeName: "TELLTALE_BATTERY_WARNING",
  },
  {
    id: "hazardWarning",
    name: "Hazard Warning Lights",
    category: "red",
    iconSymbol: "🚨",
    colorHex: "#ef4444",
    description: "Dual four-way exterior emergency hazard flashers flashing simultaneously.",
    systemAction: "Alerts surrounding motorists to stationary or disabled vehicle.",
    recommendedFix: "Depress central hazard triangle button on dashboard to toggle.",
    meshNodeName: "TELLTALE_HAZARD",
  },
];

interface InstrumentClusterState {
  // 24 Warning Light Toggles
  warningLights: Record<string, boolean>;
  focusedLightId: string | null;

  // Live Gauges & Telemetry
  speedMph: number;
  engineRpm: number;
  fuelLevelPct: number;
  coolantTempC: number;
  batteryVolts: number;
  oilPressurePsi: number;
  odometerMiles: number;

  // Customization & Appearance
  theme: ClusterTheme;
  isBulbCheckRunning: boolean;
  activeDtcCode: string | null;
  hazardBlinkerActive: boolean;

  // Actions
  toggleWarningLight: (id: string) => void;
  setWarningLight: (id: string, active: boolean) => void;
  setAllWarningLights: (active: boolean) => void;
  setFocusedLightId: (id: string | null) => void;

  setSpeedMph: (v: number) => void;
  setEngineRpm: (v: number) => void;
  setFuelLevelPct: (v: number) => void;
  setCoolantTempC: (v: number) => void;
  setBatteryVolts: (v: number) => void;
  setOilPressurePsi: (v: number) => void;

  setTheme: (t: ClusterTheme) => void;
  injectDtcFault: (code: string) => void;
  clearDtcFaults: () => void;
  runIgnitionBulbCheck: () => void;
  toggleHazardBlinkers: () => void;
  resetAll: () => void;
}

const DEFAULT_WARNING_LIGHTS: Record<string, boolean> = {
  turnSignals: false,
  highBeam: false,
  fogBeams: false,
  cruiseControl: true, // cruising on highway by default
  abs: false,
  warningLight: false,
  slipIndicator: false,
  windshieldDefrost: false,
  childSafetyLocks: false,
  glowPlug: false,
  awd: false,
  odOff: false,
  checkEngine: false,
  tirePressure: false,
  rearDefrost: false,
  powertrain: false,
  electronicStability: false,
  lowFuel: false,
  brakeSystemAlert: false,
  frontAirbag: false,
  openDoors: false,
  oilPressure: false,
  seatBelt: true, // driver buckled or unbuckled reminder
  temperatureWarning: false,
  batteryWarning: false,
  hazardWarning: false,
};

export const useInstrumentClusterStore = create<InstrumentClusterState>((set, get) => ({
  warningLights: { ...DEFAULT_WARNING_LIGHTS },
  focusedLightId: "abs",

  speedMph: 68,
  engineRpm: 2450,
  fuelLevelPct: 72,
  coolantTempC: 88,
  batteryVolts: 14.2,
  oilPressurePsi: 44,
  odometerMiles: 24850,

  theme: "ice_blue",
  isBulbCheckRunning: false,
  activeDtcCode: null,
  hazardBlinkerActive: false,

  toggleWarningLight: (id) =>
    set((state) => ({
      warningLights: {
        ...state.warningLights,
        [id]: !state.warningLights[id],
      },
      focusedLightId: id,
    })),

  setWarningLight: (id, active) =>
    set((state) => ({
      warningLights: {
        ...state.warningLights,
        [id]: active,
      },
    })),

  setAllWarningLights: (active) =>
    set(() => {
      const updated: Record<string, boolean> = {};
      TELLTALE_DEFINITIONS.forEach((t) => {
        updated[t.id] = active;
      });
      return { warningLights: updated };
    }),

  setFocusedLightId: (id) => set({ focusedLightId: id }),

  setSpeedMph: (v) => set({ speedMph: Math.max(0, Math.min(160, v)) }),
  setEngineRpm: (v) => set({ engineRpm: Math.max(0, Math.min(8000, v)) }),
  setFuelLevelPct: (v) => set({ fuelLevelPct: Math.max(0, Math.min(100, v)) }),
  setCoolantTempC: (v) => set({ coolantTempC: Math.max(40, Math.min(130, v)) }),
  setBatteryVolts: (v) => set({ batteryVolts: Math.max(9, Math.min(19, v)) }),
  setOilPressurePsi: (v) => set({ oilPressurePsi: Math.max(0, Math.min(80, v)) }),

  setTheme: (t) => set({ theme: t }),

  injectDtcFault: (code) => {
    const s = get();
    const updated = { ...s.warningLights };

    if (code === "P0300") {
      // Random Misfire -> Check Engine + Master Warning
      updated.checkEngine = true;
      updated.warningLight = true;
    } else if (code === "C0035") {
      // ABS Wheel Speed -> ABS + Slip Indicator
      updated.abs = true;
      updated.slipIndicator = true;
    } else if (code === "B0001") {
      // Airbag Squib Circuit -> Front Airbag
      updated.frontAirbag = true;
    } else if (code === "P0524") {
      // Low Oil Pressure -> Oil Pressure + Warning
      updated.oilPressure = true;
      updated.warningLight = true;
    } else if (code === "P0217") {
      // Coolant Overheat -> Temp Warning + Check Engine
      updated.temperatureWarning = true;
      updated.checkEngine = true;
    } else if (code === "P0562") {
      // System Voltage Low -> Battery Warning
      updated.batteryWarning = true;
    } else if (code === "C0750") {
      // Low Tire Pressure -> TPMS
      updated.tirePressure = true;
    }

    set({
      activeDtcCode: code,
      warningLights: updated,
      focusedLightId:
        code === "P0300"
          ? "checkEngine"
          : code === "C0035"
          ? "abs"
          : code === "B0001"
          ? "frontAirbag"
          : code === "P0524"
          ? "oilPressure"
          : code === "P0217"
          ? "temperatureWarning"
          : code === "P0562"
          ? "batteryWarning"
          : "tirePressure",
    });
  },

  clearDtcFaults: () =>
    set({
      activeDtcCode: null,
      warningLights: { ...DEFAULT_WARNING_LIGHTS },
    }),

  runIgnitionBulbCheck: () => {
    const s = get();
    if (s.isBulbCheckRunning) return;

    // Phase 1: All lights on, needles sweep to max!
    const allOn: Record<string, boolean> = {};
    TELLTALE_DEFINITIONS.forEach((t) => {
      allOn[t.id] = true;
    });

    set({
      isBulbCheckRunning: true,
      warningLights: allOn,
      speedMph: 160,
      engineRpm: 8000,
      fuelLevelPct: 100,
      coolantTempC: 130,
      batteryVolts: 18,
      oilPressurePsi: 80,
    });

    // Phase 2: Needles return, normal lights extinguish after 2.4s
    setTimeout(() => {
      set({
        speedMph: 68,
        engineRpm: 2450,
        fuelLevelPct: 72,
        coolantTempC: 88,
        batteryVolts: 14.2,
        oilPressurePsi: 44,
      });
    }, 1400);

    setTimeout(() => {
      set({
        warningLights: { ...DEFAULT_WARNING_LIGHTS },
        isBulbCheckRunning: false,
      });
    }, 2400);
  },

  toggleHazardBlinkers: () =>
    set((state) => ({
      hazardBlinkerActive: !state.hazardBlinkerActive,
      warningLights: {
        ...state.warningLights,
        hazardWarning: !state.hazardBlinkerActive,
        turnSignals: !state.hazardBlinkerActive,
      },
    })),

  resetAll: () =>
    set({
      warningLights: { ...DEFAULT_WARNING_LIGHTS },
      focusedLightId: "abs",
      speedMph: 68,
      engineRpm: 2450,
      fuelLevelPct: 72,
      coolantTempC: 88,
      batteryVolts: 14.2,
      oilPressurePsi: 44,
      theme: "ice_blue",
      isBulbCheckRunning: false,
      activeDtcCode: null,
      hazardBlinkerActive: false,
    }),
}));
