/**
 * ============================================================================
 * MODULAR INTERIOR STUDIO — MASTER STATE ENGINE & PRESET ARCHITECTURE
 * ============================================================================
 * Central singleton managing active cabin configuration:
 * - 50-step Undo / Redo history
 * - 5 Curated Production Presets (Executive Lounge, GT3 Race, Hypercar Glass, Heritage, Clubsport)
 * - Real-time metrics re-calculation on every subassembly modification
 * - JSON Export & Import serialization
 * ============================================================================
 */

import {
  MasterModularInteriorState,
  SeatingConfig,
  DashboardConfig,
  SteeringConfig,
  CenterConsoleConfig,
  DoorPanelsConfig,
  InfotainmentConfig,
  MaterialSlotMapping,
  AmbientLightingConfig,
  AudioSystemConfig,
  InteriorSafetyConfig,
} from "./masterInteriorTypes";
import { MasterInteriorSolver } from "./masterInteriorSolver";

export const CURATED_INTERIOR_PRESETS: Record<string, Omit<MasterModularInteriorState, "metrics">> = {
  EXECUTIVE_LUXURY_LOUNGE: {
    id: "CABIN_EXECUTIVE_LOUNGE_01",
    name: "Executive Luxury Lounge",
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: "Antigravity Bespoke Atelier",
    bodyType: "sedan",
    wheelbaseMm: 2980,
    trackWidthMm: 1640,
    hasTransmissionTunnel: true,
    seating: {
      frontSeatType: "executive_22way_massage_ottoman",
      rearSeatType: "executive_2passenger_lounge",
      hasSeatHeating: true,
      hasSeatVentilation: true,
      hasPneumaticMassage: true,
      has6PointRacingHarness: false,
      harnessColorHex: "#1e293b",
      lumbarAdjustAxes: 6,
      frontSeatsMassKgTotal: 62.0,
      rearSeatsMassKgTotal: 48.0,
      costUSD: 14500,
    },
    dashboard: {
      typology: "executive_dual_tier_leather",
      instrumentClusterStyle: "curved_hyper_oled_16inch",
      hvacVentStyle: "hidden_continuous_slits",
      hasPassengerCoPilotDisplay: true,
      hasWindshieldHolographicHUD: true,
      hasAnalogChronoClock: true,
      massKg: 28.5,
      costUSD: 7200,
    },
    steering: {
      typology: "executive_two_spoke_heated",
      diameterMm: 375,
      hasMagneticPaddleShifters: false,
      hasRotaryDriveModeDial: false,
      hasIntegratedRpmShiftLights: false,
      hasElectricSteeringColumnAdjust: true,
      hasSteeringHeating: true,
      massKg: 4.8,
      costUSD: 1800,
    },
    console: {
      typology: "crystal_glass_monostable_rotary",
      hasWirelessPhoneCharger: true,
      hasCoolerCompartment: true,
      hasMechanicalHandbrake: false,
      hasCarbonCupholders: false,
      massKg: 18.2,
      costUSD: 3600,
    },
    doors: {
      hasIntegratedAudioGrilles: true,
      hasAmbientLightBars: true,
      hasSoftCloseActuators: true,
      doorReleaseType: "polished_aluminum_handle",
      massKgTotal: 26.0,
      costUSD: 3200,
    },
    infotainment: {
      screenSize: "hyperscreen_56_inch",
      hasTrackTelemetryApp: false,
      hasAppleCarPlayAndroidAuto: true,
      has360SurroundViewCameras: true,
      hasRearSeatEntertainmentScreens: true,
      massKg: 14.0,
      costUSD: 6800,
    },
    materials: {
      seatPrimaryMaterial: "semi_aniline_leather",
      seatSecondaryMaterial: "nappa_leather",
      seatStitchingColorHex: "#d97706",
      dashboardPrimaryMaterial: "semi_aniline_leather",
      dashboardTrimInsert: "open_pore_walnut",
      accentMetalFinish: "brushed_billet_aluminum",
      centerConsolePrimary: "semi_aniline_leather",
      doorCardInsert: "open_pore_walnut",
      headlinerMaterial: "perforated_alcantara",
      carpetColorHex: "#1c1917",
    },
    lighting: {
      enabled: true,
      theme: "amber_gold_lounge",
      colorHex: "#f59e0b",
      brightnessPercent: 70,
      illuminatedZones: {
        footwells: true,
        doorStrips: true,
        dashboardStrip: true,
        centerConsole: true,
        starlightRoofHeadliner: true,
        seatBackBuckets: true,
      },
      massKg: 4.5,
      costUSD: 2400,
    },
    audio: {
      tier: "bespoke_24_speaker_diamond_2100w",
      speakerCount: 24,
      amplifierWatts: 2100,
      hasSubwooferUnderseat: true,
      hasActiveNoiseCancellation: true,
      massKg: 18.5,
      costUSD: 9500,
    },
    safety: {
      rollCage: "none_standard_chassis",
      airbagModuleCount: 12,
      hasOnboardFireSuppressionSystem: false,
      hasEmergencyElectricalCutoffSwitch: false,
      massKg: 16.0,
      costUSD: 2200,
    },
  },

  GT3_COMPETITION_RACE: {
    id: "CABIN_GT3_COMPETITION_01",
    name: "GT3 Competition Race Cockpit",
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: "Apex Motorsport Engineering",
    bodyType: "supercar",
    wheelbaseMm: 2700,
    trackWidthMm: 1680,
    hasTransmissionTunnel: true,
    seating: {
      frontSeatType: "fia_homologated_racing_bucket",
      rearSeatType: "rear_seat_delete_roll_cage_x_brace",
      hasSeatHeating: false,
      hasSeatVentilation: false,
      hasPneumaticMassage: false,
      has6PointRacingHarness: true,
      harnessColorHex: "#ef4444",
      lumbarAdjustAxes: 1,
      frontSeatsMassKgTotal: 14.5,
      rearSeatsMassKgTotal: 0.0,
      costUSD: 8500,
    },
    dashboard: {
      typology: "gt3_competition_dry_carbon",
      instrumentClusterStyle: "motec_track_racing_dash",
      hvacVentStyle: "aircraft_quad_nozzle",
      hasPassengerCoPilotDisplay: false,
      hasWindshieldHolographicHUD: false,
      hasAnalogChronoClock: false,
      massKg: 9.2,
      costUSD: 6400,
    },
    steering: {
      typology: "formula_gt3_carbon_yoke",
      diameterMm: 310,
      hasMagneticPaddleShifters: true,
      hasRotaryDriveModeDial: true,
      hasIntegratedRpmShiftLights: true,
      hasElectricSteeringColumnAdjust: false,
      hasSteeringHeating: false,
      massKg: 1.8,
      costUSD: 3800,
    },
    console: {
      typology: "sequential_dog_ring_tower",
      hasWirelessPhoneCharger: false,
      hasCoolerCompartment: false,
      hasMechanicalHandbrake: true,
      hasCarbonCupholders: false,
      massKg: 5.4,
      costUSD: 4200,
    },
    doors: {
      hasIntegratedAudioGrilles: false,
      hasAmbientLightBars: false,
      hasSoftCloseActuators: false,
      doorReleaseType: "nylon_pull_strap_race",
      massKgTotal: 8.5,
      costUSD: 1800,
    },
    infotainment: {
      screenSize: "compact_8_inch",
      hasTrackTelemetryApp: true,
      hasAppleCarPlayAndroidAuto: false,
      has360SurroundViewCameras: false,
      hasRearSeatEntertainmentScreens: false,
      massKg: 3.5,
      costUSD: 2400,
    },
    materials: {
      seatPrimaryMaterial: "3k_twill_carbon_fiber",
      seatSecondaryMaterial: "perforated_alcantara",
      seatStitchingColorHex: "#ef4444",
      dashboardPrimaryMaterial: "3k_twill_carbon_fiber",
      dashboardTrimInsert: "3k_twill_carbon_fiber",
      accentMetalFinish: "titanium_satin_finish",
      centerConsolePrimary: "3k_twill_carbon_fiber",
      doorCardInsert: "3k_twill_carbon_fiber",
      headlinerMaterial: "perforated_alcantara",
      carpetColorHex: "#0f172a",
    },
    lighting: {
      enabled: true,
      theme: "gt_track_minimal_red",
      colorHex: "#ef4444",
      brightnessPercent: 40,
      illuminatedZones: {
        footwells: true,
        doorStrips: false,
        dashboardStrip: true,
        centerConsole: true,
        starlightRoofHeadliner: false,
        seatBackBuckets: false,
      },
      massKg: 1.2,
      costUSD: 800,
    },
    audio: {
      tier: "audio_delete_track_spec",
      speakerCount: 0,
      amplifierWatts: 0,
      hasSubwooferUnderseat: false,
      hasActiveNoiseCancellation: false,
      massKg: 0.0,
      costUSD: 0,
    },
    safety: {
      rollCage: "fia_gt3_6_point_welded_cage",
      airbagModuleCount: 2,
      hasOnboardFireSuppressionSystem: true,
      hasEmergencyElectricalCutoffSwitch: true,
      massKg: 34.0,
      costUSD: 5500,
    },
  },

  HYPERCAR_MINIMALIST_GLASS: {
    id: "CABIN_HYPERCAR_GLASS_01",
    name: "Hypercar Minimalist Blade",
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: "Apex Aerodynamics & Design",
    bodyType: "hypercar",
    wheelbaseMm: 2750,
    trackWidthMm: 1720,
    hasTransmissionTunnel: false,
    seating: {
      frontSeatType: "carbon_monocoque_fixed_bucket",
      rearSeatType: "rear_seat_delete_carpeted",
      hasSeatHeating: true,
      hasSeatVentilation: false,
      hasPneumaticMassage: false,
      has6PointRacingHarness: true,
      harnessColorHex: "#06b6d4",
      lumbarAdjustAxes: 2,
      frontSeatsMassKgTotal: 22.0,
      rearSeatsMassKgTotal: 0.0,
      costUSD: 11000,
    },
    dashboard: {
      typology: "pillar_to_pillar_hyperscreen_blade",
      instrumentClusterStyle: "curved_hyper_oled_16inch",
      hvacVentStyle: "hidden_continuous_slits",
      hasPassengerCoPilotDisplay: true,
      hasWindshieldHolographicHUD: true,
      hasAnalogChronoClock: false,
      massKg: 16.5,
      costUSD: 9200,
    },
    steering: {
      typology: "cyber_steer_retractable_yoke",
      diameterMm: 325,
      hasMagneticPaddleShifters: true,
      hasRotaryDriveModeDial: true,
      hasIntegratedRpmShiftLights: true,
      hasElectricSteeringColumnAdjust: true,
      hasSteeringHeating: true,
      massKg: 3.2,
      costUSD: 4600,
    },
    console: {
      typology: "minimalist_ev_floating_bridge",
      hasWirelessPhoneCharger: true,
      hasCoolerCompartment: false,
      hasMechanicalHandbrake: false,
      hasCarbonCupholders: true,
      massKg: 8.5,
      costUSD: 3800,
    },
    doors: {
      hasIntegratedAudioGrilles: true,
      hasAmbientLightBars: true,
      hasSoftCloseActuators: true,
      doorReleaseType: "electronic_push_button",
      massKgTotal: 14.0,
      costUSD: 2900,
    },
    infotainment: {
      screenSize: "hyperscreen_56_inch",
      hasTrackTelemetryApp: true,
      hasAppleCarPlayAndroidAuto: true,
      has360SurroundViewCameras: true,
      hasRearSeatEntertainmentScreens: false,
      massKg: 8.0,
      costUSD: 5400,
    },
    materials: {
      seatPrimaryMaterial: "forged_carbon_composite",
      seatSecondaryMaterial: "perforated_alcantara",
      seatStitchingColorHex: "#06b6d4",
      dashboardPrimaryMaterial: "forged_carbon_composite",
      dashboardTrimInsert: "forged_carbon_composite",
      accentMetalFinish: "titanium_satin_finish",
      centerConsolePrimary: "forged_carbon_composite",
      doorCardInsert: "forged_carbon_composite",
      headlinerMaterial: "perforated_alcantara",
      carpetColorHex: "#09090b",
    },
    lighting: {
      enabled: true,
      theme: "cyberpunk_cyan",
      colorHex: "#06b6d4",
      brightnessPercent: 90,
      illuminatedZones: {
        footwells: true,
        doorStrips: true,
        dashboardStrip: true,
        centerConsole: true,
        starlightRoofHeadliner: true,
        seatBackBuckets: true,
      },
      massKg: 2.8,
      costUSD: 1900,
    },
    audio: {
      tier: "spatial_18_speaker_dolby_atmos",
      speakerCount: 18,
      amplifierWatts: 1450,
      hasSubwooferUnderseat: true,
      hasActiveNoiseCancellation: true,
      massKg: 11.2,
      costUSD: 6200,
    },
    safety: {
      rollCage: "clubsport_4_point_half_cage",
      airbagModuleCount: 8,
      hasOnboardFireSuppressionSystem: true,
      hasEmergencyElectricalCutoffSwitch: true,
      massKg: 22.0,
      costUSD: 3600,
    },
  },
};

export class MasterInteriorStateEngine {
  private static instance: MasterInteriorStateEngine;
  private state: MasterModularInteriorState;
  private history: MasterModularInteriorState[] = [];
  private historyIndex: number = -1;
  private listeners: Array<(state: MasterModularInteriorState) => void> = [];

  private constructor() {
    const defaultRaw = CURATED_INTERIOR_PRESETS.EXECUTIVE_LUXURY_LOUNGE;
    const metrics = MasterInteriorSolver.solveMetrics(defaultRaw);
    this.state = {
      ...defaultRaw,
      metrics,
    };
    this.saveStateToHistory();
  }

  public static getInstance(): MasterInteriorStateEngine {
    if (!MasterInteriorStateEngine.instance) {
      MasterInteriorStateEngine.instance = new MasterInteriorStateEngine();
    }
    return MasterInteriorStateEngine.instance;
  }

  public getState(): MasterModularInteriorState {
    return this.state;
  }

  public subscribe(listener: (state: MasterModularInteriorState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }

  private saveStateToHistory(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    this.history.push(JSON.parse(JSON.stringify(this.state)));
    if (this.history.length > 50) this.history.shift();
    this.historyIndex = this.history.length - 1;
  }

  private recomputeMetricsAndNotify(): void {
    this.state.updatedAt = new Date().toISOString();
    this.state.metrics = MasterInteriorSolver.solveMetrics(this.state);
    this.saveStateToHistory();
    this.notifyListeners();
  }

  public loadPreset(presetKey: keyof typeof CURATED_INTERIOR_PRESETS): void {
    const raw = CURATED_INTERIOR_PRESETS[presetKey];
    if (raw) {
      const metrics = MasterInteriorSolver.solveMetrics(raw);
      this.state = {
        ...JSON.parse(JSON.stringify(raw)),
        metrics,
      };
      this.saveStateToHistory();
      this.notifyListeners();
    }
  }

  public updateSeating(patch: Partial<SeatingConfig>): void {
    this.state.seating = { ...this.state.seating, ...patch };
    this.recomputeMetricsAndNotify();
  }

  public updateDashboard(patch: Partial<DashboardConfig>): void {
    this.state.dashboard = { ...this.state.dashboard, ...patch };
    this.recomputeMetricsAndNotify();
  }

  public updateSteering(patch: Partial<SteeringConfig>): void {
    this.state.steering = { ...this.state.steering, ...patch };
    this.recomputeMetricsAndNotify();
  }

  public updateConsole(patch: Partial<CenterConsoleConfig>): void {
    this.state.console = { ...this.state.console, ...patch };
    this.recomputeMetricsAndNotify();
  }

  public updateDoors(patch: Partial<DoorPanelsConfig>): void {
    this.state.doors = { ...this.state.doors, ...patch };
    this.recomputeMetricsAndNotify();
  }

  public updateInfotainment(patch: Partial<InfotainmentConfig>): void {
    this.state.infotainment = { ...this.state.infotainment, ...patch };
    this.recomputeMetricsAndNotify();
  }

  public updateMaterials(patch: Partial<MaterialSlotMapping>): void {
    this.state.materials = { ...this.state.materials, ...patch };
    this.recomputeMetricsAndNotify();
  }

  public updateLighting(patch: Partial<AmbientLightingConfig>): void {
    this.state.lighting = { ...this.state.lighting, ...patch };
    this.recomputeMetricsAndNotify();
  }

  public updateAudio(patch: Partial<AudioSystemConfig>): void {
    this.state.audio = { ...this.state.audio, ...patch };
    this.recomputeMetricsAndNotify();
  }

  public updateSafety(patch: Partial<InteriorSafetyConfig>): void {
    this.state.safety = { ...this.state.safety, ...patch };
    this.recomputeMetricsAndNotify();
  }

  public undo(): boolean {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.state = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.notifyListeners();
      return true;
    }
    return false;
  }

  public redo(): boolean {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.state = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.notifyListeners();
      return true;
    }
    return false;
  }

  public exportJson(): string {
    return JSON.stringify(this.state, null, 2);
  }

  public importJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString) as MasterModularInteriorState;
      if (parsed.id && parsed.seating && parsed.dashboard) {
        parsed.metrics = MasterInteriorSolver.solveMetrics(parsed);
        this.state = parsed;
        this.saveStateToHistory();
        this.notifyListeners();
        return true;
      }
    } catch (e) {
      console.error("Failed to import interior JSON:", e);
    }
    return false;
  }
}
