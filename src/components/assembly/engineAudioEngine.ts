import {
  TransmissionAudioSubsystem,
  ValvetrainAudioSubsystem,
  SuperchargerAudioSubsystem,
  calculateHelmholtzResonanceFreq,
  getExhaustAttenuationProfile,
  EngineAudioAnalyzer,
} from "./engineAudioSubsystems";

export type EngineLayoutId =
  | "i4"
  | "v6_60"
  | "v6_90"
  | "v8_crossplane"
  | "v8_flatplane"
  | "v10"
  | "v12"
  | "boxer4_uel"
  | "boxer4_el"
  | "boxer6"
  | "rotary_13b"
  | "rotary_20b"
  | "ev_dual_motor";

export type ExhaustSystemType =
  | "stock"
  | "catback_sport"
  | "straight_pipe"
  | "titanium_race"
  | "uel_headers";

export type ForcedInductionType =
  | "none"
  | "turbo_single"
  | "turbo_twin"
  | "supercharger_roots"
  | "supercharger_centrifugal";

export interface EngineAcousticConfig {
  layout: EngineLayoutId;
  rpm: number; // 600 - 11000 RPM
  throttle: number; // 0.0 - 1.0
  engineLoad: number; // 0.0 - 1.0
  idleRpm?: number;
  maxRpm?: number;
  forcedInduction?: ForcedInductionType;
  boostPressureBar?: number; // 0.0 - 3.5 bar
  exhaustType?: ExhaustSystemType;
  hasBackfirePops?: boolean;
  camProfile?: "street" | "sport" | "race_cam" | "drag_cam";
  spatialPosition?: { x: number; y: number; z: number };
}

export interface CylinderPulseConfig {
  cylinderId: number;
  crankAngleOffsetDeg: number;
  bankId: 0 | 1;
  exhaustPipeLengthM: number;
  boreMm: number;
  strokeMm: number;
}

export interface HarmonicComponent {
  orderMultiplier: number;
  baseGain: number;
  gainLoadScaling: number;
  waveType: OscillatorType;
  detuneCents: number;
  filterCutoffMultiplier: number;
}

// ===================================================================
// 1. PHYSICAL CYLINDER FIRING ORDER & CRANK ANGLE DATA
// ===================================================================

export const ENGINE_FIRING_ORDERS: Record<
  EngineLayoutId,
  {
    cylinders: number;
    firingSequence: number[];
    crankAngleIntervalDeg: number;
    bankSplit: Record<number, 0 | 1>;
    harmonicProfile: HarmonicComponent[];
    defaultRedlineRpm: number;
    description: string;
  }
> = {
  i4: {
    cylinders: 4,
    firingSequence: [1, 3, 4, 2],
    crankAngleIntervalDeg: 180,
    bankSplit: { 1: 0, 2: 0, 3: 0, 4: 0 },
    defaultRedlineRpm: 7500,
    description: "Inline-4: 180° firing interval, strong 2.0x fundamental and 4.0x secondary intake roar.",
    harmonicProfile: [
      { orderMultiplier: 2.0, baseGain: 0.45, gainLoadScaling: 0.35, waveType: "sawtooth", detuneCents: 0, filterCutoffMultiplier: 2.5 },
      { orderMultiplier: 4.0, baseGain: 0.30, gainLoadScaling: 0.40, waveType: "triangle", detuneCents: 3, filterCutoffMultiplier: 4.0 },
      { orderMultiplier: 6.0, baseGain: 0.15, gainLoadScaling: 0.25, waveType: "sine", detuneCents: -2, filterCutoffMultiplier: 6.0 },
      { orderMultiplier: 8.0, baseGain: 0.08, gainLoadScaling: 0.15, waveType: "square", detuneCents: 5, filterCutoffMultiplier: 8.0 },
    ],
  },

  v6_60: {
    cylinders: 6,
    firingSequence: [1, 2, 5, 6, 3, 4],
    crankAngleIntervalDeg: 120,
    bankSplit: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1, 6: 1 },
    defaultRedlineRpm: 7200,
    description: "60° V6: Even 120° firing, smooth 3.0x order fundamental with metallic VQ/VR38 resonance.",
    harmonicProfile: [
      { orderMultiplier: 3.0, baseGain: 0.48, gainLoadScaling: 0.38, waveType: "sawtooth", detuneCents: 0, filterCutoffMultiplier: 3.0 },
      { orderMultiplier: 6.0, baseGain: 0.32, gainLoadScaling: 0.32, waveType: "triangle", detuneCents: 4, filterCutoffMultiplier: 5.5 },
      { orderMultiplier: 9.0, baseGain: 0.18, gainLoadScaling: 0.22, waveType: "sine", detuneCents: -3, filterCutoffMultiplier: 8.0 },
      { orderMultiplier: 12.0, baseGain: 0.09, gainLoadScaling: 0.12, waveType: "sawtooth", detuneCents: 2, filterCutoffMultiplier: 10.0 },
    ],
  },

  v6_90: {
    cylinders: 6,
    firingSequence: [1, 6, 5, 4, 3, 2],
    crankAngleIntervalDeg: 120,
    bankSplit: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1, 6: 1 },
    defaultRedlineRpm: 7000,
    description: "90° V6: Throaty, asymmetric exhaust pulse overlap with aggressive mid-range rasp.",
    harmonicProfile: [
      { orderMultiplier: 3.0, baseGain: 0.50, gainLoadScaling: 0.40, waveType: "sawtooth", detuneCents: 8, filterCutoffMultiplier: 3.2 },
      { orderMultiplier: 4.5, baseGain: 0.22, gainLoadScaling: 0.28, waveType: "square", detuneCents: -6, filterCutoffMultiplier: 4.8 },
      { orderMultiplier: 6.0, baseGain: 0.28, gainLoadScaling: 0.30, waveType: "triangle", detuneCents: 3, filterCutoffMultiplier: 6.2 },
      { orderMultiplier: 9.0, baseGain: 0.15, gainLoadScaling: 0.18, waveType: "sine", detuneCents: -4, filterCutoffMultiplier: 9.0 },
    ],
  },

  v8_crossplane: {
    cylinders: 8,
    firingSequence: [1, 8, 4, 3, 6, 5, 7, 2],
    crankAngleIntervalDeg: 90,
    bankSplit: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1, 6: 1, 7: 1, 8: 1 },
    defaultRedlineRpm: 6800,
    description: "Crossplane V8: Uneven bank firing (L-R-L-L-R-L-R-R) creating deep 20Hz-80Hz muscle rumble.",
    harmonicProfile: [
      { orderMultiplier: 4.0, baseGain: 0.55, gainLoadScaling: 0.45, waveType: "sawtooth", detuneCents: -12, filterCutoffMultiplier: 2.2 },
      { orderMultiplier: 2.0, baseGain: 0.38, gainLoadScaling: 0.35, waveType: "triangle", detuneCents: 10, filterCutoffMultiplier: 1.8 },
      { orderMultiplier: 8.0, baseGain: 0.24, gainLoadScaling: 0.25, waveType: "sine", detuneCents: 5, filterCutoffMultiplier: 4.5 },
      { orderMultiplier: 1.0, baseGain: 0.20, gainLoadScaling: 0.15, waveType: "sine", detuneCents: -8, filterCutoffMultiplier: 1.2 },
    ],
  },

  v8_flatplane: {
    cylinders: 8,
    firingSequence: [1, 8, 2, 7, 4, 5, 3, 6],
    crankAngleIntervalDeg: 180,
    bankSplit: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1, 6: 1, 7: 1, 8: 1 },
    defaultRedlineRpm: 9000,
    description: "Flatplane V8: Even 180° firing interval, screaming 9,000 RPM exotic F1-style high-pitch howl.",
    harmonicProfile: [
      { orderMultiplier: 4.0, baseGain: 0.52, gainLoadScaling: 0.42, waveType: "sawtooth", detuneCents: 0, filterCutoffMultiplier: 4.5 },
      { orderMultiplier: 8.0, baseGain: 0.35, gainLoadScaling: 0.35, waveType: "triangle", detuneCents: 4, filterCutoffMultiplier: 7.5 },
      { orderMultiplier: 12.0, baseGain: 0.22, gainLoadScaling: 0.25, waveType: "sawtooth", detuneCents: -3, filterCutoffMultiplier: 11.0 },
      { orderMultiplier: 16.0, baseGain: 0.12, gainLoadScaling: 0.15, waveType: "sine", detuneCents: 6, filterCutoffMultiplier: 14.0 },
    ],
  },

  v10: {
    cylinders: 10,
    firingSequence: [1, 6, 5, 10, 2, 7, 3, 8, 4, 9],
    crankAngleIntervalDeg: 72,
    bankSplit: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1 },
    defaultRedlineRpm: 9200,
    description: "V10: 5.0x fundamental with 1.2kHz-2.4kHz acoustic equalizer manifold resonance (LFA/Huracán scream).",
    harmonicProfile: [
      { orderMultiplier: 5.0, baseGain: 0.56, gainLoadScaling: 0.44, waveType: "sawtooth", detuneCents: 0, filterCutoffMultiplier: 5.0 },
      { orderMultiplier: 10.0, baseGain: 0.38, gainLoadScaling: 0.36, waveType: "sine", detuneCents: 3, filterCutoffMultiplier: 9.0 },
      { orderMultiplier: 15.0, baseGain: 0.24, gainLoadScaling: 0.25, waveType: "triangle", detuneCents: -2, filterCutoffMultiplier: 13.0 },
      { orderMultiplier: 20.0, baseGain: 0.14, gainLoadScaling: 0.15, waveType: "sawtooth", detuneCents: 5, filterCutoffMultiplier: 16.0 },
    ],
  },

  v12: {
    cylinders: 12,
    firingSequence: [1, 12, 5, 8, 3, 10, 6, 7, 4, 9, 2, 11],
    crankAngleIntervalDeg: 60,
    bankSplit: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1, 12: 1 },
    defaultRedlineRpm: 9500,
    description: "V12: 6.0x fundamental + 12.0x/18.0x dense overtone stack for liquid-silk symphonic howl.",
    harmonicProfile: [
      { orderMultiplier: 6.0, baseGain: 0.58, gainLoadScaling: 0.42, waveType: "sawtooth", detuneCents: 0, filterCutoffMultiplier: 6.0 },
      { orderMultiplier: 12.0, baseGain: 0.40, gainLoadScaling: 0.38, waveType: "sine", detuneCents: 2, filterCutoffMultiplier: 11.0 },
      { orderMultiplier: 18.0, baseGain: 0.26, gainLoadScaling: 0.26, waveType: "triangle", detuneCents: -2, filterCutoffMultiplier: 15.0 },
      { orderMultiplier: 24.0, baseGain: 0.16, gainLoadScaling: 0.16, waveType: "sine", detuneCents: 4, filterCutoffMultiplier: 19.0 },
    ],
  },

  boxer4_uel: {
    cylinders: 4,
    firingSequence: [1, 3, 2, 4],
    crankAngleIntervalDeg: 180,
    bankSplit: { 1: 0, 2: 0, 3: 1, 4: 1 },
    defaultRedlineRpm: 7200,
    description: "Subaru Boxer-4 (UEL): Unequal length headers creating distinct off-beat thrum and beat frequency rumble.",
    harmonicProfile: [
      { orderMultiplier: 2.0, baseGain: 0.50, gainLoadScaling: 0.38, waveType: "sawtooth", detuneCents: -15, filterCutoffMultiplier: 2.2 },
      { orderMultiplier: 1.84, baseGain: 0.34, gainLoadScaling: 0.30, waveType: "triangle", detuneCents: 12, filterCutoffMultiplier: 2.0 },
      { orderMultiplier: 4.0, baseGain: 0.22, gainLoadScaling: 0.22, waveType: "sine", detuneCents: 6, filterCutoffMultiplier: 4.2 },
      { orderMultiplier: 6.0, baseGain: 0.10, gainLoadScaling: 0.12, waveType: "square", detuneCents: -5, filterCutoffMultiplier: 6.0 },
    ],
  },

  boxer4_el: {
    cylinders: 4,
    firingSequence: [1, 3, 2, 4],
    crankAngleIntervalDeg: 180,
    bankSplit: { 1: 0, 2: 0, 3: 1, 4: 1 },
    defaultRedlineRpm: 7600,
    description: "Equal Length Boxer-4: Crisp, balanced high-rpm Japanese tuner rasp with smooth gas flow.",
    harmonicProfile: [
      { orderMultiplier: 2.0, baseGain: 0.46, gainLoadScaling: 0.36, waveType: "sawtooth", detuneCents: 0, filterCutoffMultiplier: 2.6 },
      { orderMultiplier: 4.0, baseGain: 0.32, gainLoadScaling: 0.34, waveType: "triangle", detuneCents: 2, filterCutoffMultiplier: 4.6 },
      { orderMultiplier: 6.0, baseGain: 0.18, gainLoadScaling: 0.20, waveType: "sine", detuneCents: -2, filterCutoffMultiplier: 6.8 },
      { orderMultiplier: 8.0, baseGain: 0.09, gainLoadScaling: 0.10, waveType: "sawtooth", detuneCents: 4, filterCutoffMultiplier: 9.0 },
    ],
  },

  boxer6: {
    cylinders: 6,
    firingSequence: [1, 6, 2, 4, 3, 5],
    crankAngleIntervalDeg: 120,
    bankSplit: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1, 6: 1 },
    defaultRedlineRpm: 9000,
    description: "Porsche Flat-6 GT3: Mechanical valve clatter + high-revving 9,000 RPM metallic roar.",
    harmonicProfile: [
      { orderMultiplier: 3.0, baseGain: 0.52, gainLoadScaling: 0.40, waveType: "sawtooth", detuneCents: 0, filterCutoffMultiplier: 3.5 },
      { orderMultiplier: 6.0, baseGain: 0.36, gainLoadScaling: 0.36, waveType: "triangle", detuneCents: 3, filterCutoffMultiplier: 6.5 },
      { orderMultiplier: 9.0, baseGain: 0.22, gainLoadScaling: 0.24, waveType: "sawtooth", detuneCents: -2, filterCutoffMultiplier: 10.0 },
      { orderMultiplier: 12.0, baseGain: 0.12, gainLoadScaling: 0.14, waveType: "sine", detuneCents: 5, filterCutoffMultiplier: 13.0 },
    ],
  },

  rotary_13b: {
    cylinders: 2, // 2 rotors = 6 combustion chambers
    firingSequence: [1, 2],
    crankAngleIntervalDeg: 180,
    bankSplit: { 1: 0, 2: 1 },
    defaultRedlineRpm: 9000,
    description: "Mazda 13B Wankel: 3 power strokes per rotor revolution, idle brap-brap porting & buzzsaw high-rpm note.",
    harmonicProfile: [
      { orderMultiplier: 3.0, baseGain: 0.55, gainLoadScaling: 0.42, waveType: "sawtooth", detuneCents: -8, filterCutoffMultiplier: 4.0 },
      { orderMultiplier: 6.0, baseGain: 0.40, gainLoadScaling: 0.38, waveType: "square", detuneCents: 12, filterCutoffMultiplier: 7.5 },
      { orderMultiplier: 9.0, baseGain: 0.28, gainLoadScaling: 0.26, waveType: "sine", detuneCents: -5, filterCutoffMultiplier: 11.0 },
      { orderMultiplier: 12.0, baseGain: 0.18, gainLoadScaling: 0.16, waveType: "sawtooth", detuneCents: 8, filterCutoffMultiplier: 15.0 },
    ],
  },

  rotary_20b: {
    cylinders: 3, // 3 rotors = 9 combustion chambers
    firingSequence: [1, 2, 3],
    crankAngleIntervalDeg: 120,
    bankSplit: { 1: 0, 2: 0, 3: 1 },
    defaultRedlineRpm: 10000,
    description: "Mazda 20B 3-Rotor: Ethereal high-RPM jet turbine howl, screaming 10,000 RPM redline.",
    harmonicProfile: [
      { orderMultiplier: 4.5, baseGain: 0.58, gainLoadScaling: 0.44, waveType: "sawtooth", detuneCents: 0, filterCutoffMultiplier: 5.2 },
      { orderMultiplier: 9.0, baseGain: 0.42, gainLoadScaling: 0.40, waveType: "sine", detuneCents: 3, filterCutoffMultiplier: 9.8 },
      { orderMultiplier: 13.5, baseGain: 0.30, gainLoadScaling: 0.28, waveType: "triangle", detuneCents: -2, filterCutoffMultiplier: 14.5 },
      { orderMultiplier: 18.0, baseGain: 0.20, gainLoadScaling: 0.18, waveType: "sawtooth", detuneCents: 5, filterCutoffMultiplier: 18.0 },
    ],
  },

  ev_dual_motor: {
    cylinders: 0,
    firingSequence: [],
    crankAngleIntervalDeg: 0,
    bankSplit: {},
    defaultRedlineRpm: 18000,
    description: "Dual Electric AC Motors: High-frequency inverter PWM carrier whine + stator magnetic flux sweep.",
    harmonicProfile: [
      { orderMultiplier: 1.0, baseGain: 0.25, gainLoadScaling: 0.45, waveType: "sine", detuneCents: 0, filterCutoffMultiplier: 8.0 },
      { orderMultiplier: 2.0, baseGain: 0.15, gainLoadScaling: 0.35, waveType: "sine", detuneCents: 4, filterCutoffMultiplier: 12.0 },
      { orderMultiplier: 4.0, baseGain: 0.08, gainLoadScaling: 0.25, waveType: "triangle", detuneCents: -2, filterCutoffMultiplier: 16.0 },
    ],
  },
};

// ===================================================================
// 2. MASTER ACOUSTIC ENGINE CLASS (WEB AUDIO API SYNTHESIZER)
// ===================================================================

export class ApexEngineAudioEngine {
  private static instance: ApexEngineAudioEngine | null = null;

  private ctx: AudioContext | null = null;
  private masterCompressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;
  private pannerNode: StereoPannerNode | null = null;

  // Active Acoustic Nodes
  private harmonicOscillators: OscillatorNode[] = [];
  private harmonicGains: GainNode[] = [];
  private primaryFilter: BiquadFilterNode | null = null;

  // Subsystem Generators
  // Subsystem Generators
  private idleBrapLfo: OscillatorNode | null = null;
  private idleBrapGain: GainNode | null = null;
  private valvetrainSubsystem: ValvetrainAudioSubsystem | null = null;
  private transmissionSubsystem: TransmissionAudioSubsystem | null = null;
  private superchargerSubsystem: SuperchargerAudioSubsystem | null = null;
  private audioAnalyzer: EngineAudioAnalyzer | null = null;

  // Turbocharger Nodes
  private turboSpoolOsc: OscillatorNode | null = null;
  private turboSpoolGain: GainNode | null = null;

  // State Tracking
  private isMuted: boolean = false;
  private isRunning: boolean = false;
  private currentConfig: EngineAcousticConfig = {
    layout: "i4",
    rpm: 850,
    throttle: 0.0,
    engineLoad: 0.1,
  };

  private constructor() {
    // Lazy audio context initialization on user interaction
  }

  public static getInstance(): ApexEngineAudioEngine {
    if (!ApexEngineAudioEngine.instance) {
      ApexEngineAudioEngine.instance = new ApexEngineAudioEngine();
    }
    return ApexEngineAudioEngine.instance;
  }

  // Initialize Web Audio API Context and Master Dynamics Pipeline
  public initAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();

        // 1. Master Dynamics Compressor (Prevents distortion / clipping across complex stacks)
        this.masterCompressor = this.ctx.createDynamicsCompressor();
        this.masterCompressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
        this.masterCompressor.knee.setValueAtTime(30, this.ctx.currentTime);
        this.masterCompressor.ratio.setValueAtTime(12, this.ctx.currentTime);
        this.masterCompressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.masterCompressor.release.setValueAtTime(0.2, this.ctx.currentTime);

        // 2. Master Gain Control
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.45, this.ctx.currentTime);

        // 3. Stereo Panner Node
        if (this.ctx.createStereoPanner) {
          this.pannerNode = this.ctx.createStereoPanner();
          this.pannerNode.pan.setValueAtTime(0, this.ctx.currentTime);
          this.masterGain.connect(this.pannerNode);
          this.pannerNode.connect(this.masterCompressor);
        } else {
          this.masterGain.connect(this.masterCompressor);
        }

        this.masterCompressor.connect(this.ctx.destination);

        // 4. Acoustic Subsystems Initialization
        this.valvetrainSubsystem = new ValvetrainAudioSubsystem(this.ctx);
        this.transmissionSubsystem = new TransmissionAudioSubsystem(this.ctx);
        this.superchargerSubsystem = new SuperchargerAudioSubsystem(this.ctx);
        this.audioAnalyzer = new EngineAudioAnalyzer(this.ctx, this.masterGain);
      }
    }

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    return this.ctx;
  }

  // Get real-time FFT frequency spectrum for visualizer
  public getFrequencySpectrum(): Uint8Array {
    if (this.audioAnalyzer) {
      return this.audioAnalyzer.getFrequencyData();
    }
    return new Uint8Array(64);
  }

  // Toggle Mute State
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.45, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuteState(): boolean {
    return this.isMuted;
  }

  // ===================================================================
  // 3. REAL-TIME ENGINE AUDIO UPDATE & SYNTHESIS LOOP
  // ===================================================================

  public updateEngineAudio(config: EngineAcousticConfig) {
    this.currentConfig = { ...this.currentConfig, ...config };
    if (this.isMuted) return;

    const ctx = this.initAudioContext();
    if (!ctx || !this.masterGain) return;

    const profile = ENGINE_FIRING_ORDERS[config.layout] || ENGINE_FIRING_ORDERS.i4;
    const now = ctx.currentTime;
    const safeRpm = Math.max(500, Math.min(profile.defaultRedlineRpm + 1000, config.rpm));
    const rps = safeRpm / 60; // Revolutions per second

    // If engine audio loop is not running, start active oscillator graph
    if (!this.isRunning) {
      this.startEngineAudioGraph(profile, safeRpm, config);
    } else {
      this.updateActiveGraph(profile, safeRpm, config, rps, now);
    }
  }

  // Start initial oscillator graph for selected engine profile
  private startEngineAudioGraph(
    profile: typeof ENGINE_FIRING_ORDERS.i4,
    rpm: number,
    config: EngineAcousticConfig
  ) {
    if (!this.ctx || !this.masterGain) return;
    this.stopEngineAudioGraph();

    const now = this.ctx.currentTime;
    const rps = rpm / 60;

    // 1. Primary Low-pass Resonance Filter (simulates manifold & exhaust attenuation)
    this.primaryFilter = this.ctx.createBiquadFilter();
    this.primaryFilter.type = "lowpass";
    this.primaryFilter.Q.setValueAtTime(2.5, now);
    this.primaryFilter.connect(this.masterGain);

    // 2. Synthesize Harmonic Stack for this Engine Layout
    profile.harmonicProfile.forEach((harm) => {
      if (!this.ctx || !this.primaryFilter) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = rps * harm.orderMultiplier;
      osc.type = harm.waveType;
      osc.frequency.setValueAtTime(Math.max(10, freq), now);
      osc.detune.setValueAtTime(harm.detuneCents, now);

      const targetGain = harm.baseGain + config.throttle * harm.gainLoadScaling;
      gain.gain.setValueAtTime(Math.max(0.001, targetGain * 0.35), now);

      osc.connect(gain);
      gain.connect(this.primaryFilter);
      osc.start(now);

      this.harmonicOscillators.push(osc);
      this.harmonicGains.push(gain);
    });

    // 3. Rotary "Brap-Brap" Idle LFO modulation for 13B / 20B
    if (config.layout === "rotary_13b" || config.layout === "rotary_20b") {
      this.idleBrapLfo = this.ctx.createOscillator();
      this.idleBrapGain = this.ctx.createGain();

      this.idleBrapLfo.type = "sine";
      this.idleBrapLfo.frequency.setValueAtTime(6.5, now); // 6.5Hz brap pulsation

      this.idleBrapGain.gain.setValueAtTime(0.18 * (1.0 - config.throttle), now);
      this.idleBrapLfo.connect(this.idleBrapGain);

      if (this.harmonicGains[0]) {
        this.idleBrapGain.connect(this.harmonicGains[0].gain);
      }

      this.idleBrapLfo.start(now);
    }

    // 4. Turbocharger Spool Whistle & Blow-off Node
    if (config.forcedInduction?.startsWith("turbo")) {
      this.turboSpoolOsc = this.ctx.createOscillator();
      this.turboSpoolGain = this.ctx.createGain();

      this.turboSpoolOsc.type = "sine";
      const boostBar = config.boostPressureBar || 1.2;
      const spoolFreq = 800 + (rpm / 8000) * 1800 * boostBar;
      this.turboSpoolOsc.frequency.setValueAtTime(spoolFreq, now);

      const spoolVol = 0.01 + config.throttle * 0.18 * (boostBar / 1.5);
      this.turboSpoolGain.gain.setValueAtTime(spoolVol, now);

      this.turboSpoolOsc.connect(this.turboSpoolGain);
      this.turboSpoolGain.connect(this.masterGain);
      this.turboSpoolOsc.start(now);
    }

    this.isRunning = true;
  }

  // Dynamically update frequencies, gain, and filter cutoffs in real-time
  private updateActiveGraph(
    profile: typeof ENGINE_FIRING_ORDERS.i4,
    rpm: number,
    config: EngineAcousticConfig,
    rps: number,
    now: number
  ) {
    if (!this.ctx || !this.primaryFilter) return;

    // 1. Update Filter Cutoff Frequency based on RPM and Throttle Load
    const baseCutoff = 250 + (rpm / 8000) * 3200;
    const loadCutoffBoost = config.throttle * 2800;
    const finalCutoff = Math.min(18000, baseCutoff + loadCutoffBoost);
    this.primaryFilter.frequency.setTargetAtTime(finalCutoff, now, 0.03);

    // 2. Update Frequencies for Harmonic Stack
    profile.harmonicProfile.forEach((harm, idx) => {
      const osc = this.harmonicOscillators[idx];
      const gain = this.harmonicGains[idx];

      if (osc && gain) {
        const freq = Math.max(10, rps * harm.orderMultiplier);
        osc.frequency.setTargetAtTime(freq, now, 0.02);

        const targetGain = (harm.baseGain + config.throttle * harm.gainLoadScaling) * 0.35;
        gain.gain.setTargetAtTime(Math.max(0.001, targetGain), now, 0.03);
      }
    });

    // 3. Update Turbo Spool Whistle Pitch
    if (this.turboSpoolOsc && this.turboSpoolGain && config.forcedInduction?.startsWith("turbo")) {
      const boostBar = config.boostPressureBar || 1.2;
      const spoolFreq = 800 + (rpm / 8000) * 2200 * (boostBar / 1.5);
      const spoolVol = 0.01 + config.throttle * 0.22 * (boostBar / 1.5);

      this.turboSpoolOsc.frequency.setTargetAtTime(spoolFreq, now, 0.04);
      this.turboSpoolGain.gain.setTargetAtTime(spoolVol, now, 0.04);
    }

    // 4. Update Brap LFO gain (fades out above 2000 RPM or high throttle)
    if (this.idleBrapGain) {
      const brapIntensity = rpm < 2000 ? (1.0 - rpm / 2000) * (1.0 - config.throttle) * 0.25 : 0.001;
      this.idleBrapGain.gain.setTargetAtTime(brapIntensity, now, 0.05);
    }

    // 5. Update Valvetrain Noise Subsystem
    if (this.valvetrainSubsystem && this.masterGain) {
      this.valvetrainSubsystem.updateValvetrainAudio(
        {
          camType: config.camProfile === "race_cam" ? "race_cam" : "sport",
          rpm,
          valvesCount: profile.cylinders * 4,
        },
        this.masterGain
      );
    }

    // 6. Update Supercharger Rotor Whine Subsystem
    if (this.superchargerSubsystem && this.masterGain && config.forcedInduction?.startsWith("supercharger")) {
      this.superchargerSubsystem.updateSuperchargerAudio(rpm, config.throttle, this.masterGain);
    }
  }

  // Stop active engine audio synthesis graph
  public stopEngineAudioGraph() {
    if (this.ctx) {
      const now = this.ctx.currentTime;

      this.harmonicGains.forEach((g) => g.gain.setTargetAtTime(0.0001, now, 0.05));
      setTimeout(() => {
        this.harmonicOscillators.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // Silence disconnect errors
          }
        });
        this.harmonicOscillators = [];
        this.harmonicGains = [];
      }, 60);

      if (this.idleBrapLfo) {
        try {
          this.idleBrapLfo.stop();
          this.idleBrapLfo.disconnect();
        } catch {}
        this.idleBrapLfo = null;
      }

      if (this.turboSpoolOsc) {
        try {
          this.turboSpoolOsc.stop();
          this.turboSpoolOsc.disconnect();
        } catch {}
        this.turboSpoolOsc = null;
      }
    }

    this.isRunning = false;
  }

  // ===================================================================
  // 4. ONE-SHOT PROCEDURAL AUDIO TRANSIENT GENERATORS
  // ===================================================================

  // Play Turbocharger Blow-Off Valve (BOV) Atmospheric Dump
  public triggerBlowOffValve(boostBar: number = 1.4) {
    if (this.isMuted) return;
    const ctx = this.initAudioContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    // White Noise Burst
    const bufferSize = ctx.sampleRate * 0.35;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    // High-pass Filter for Atmospheric Pressure Hiss
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(2800, now);

    const gain = ctx.createGain();
    const peakGain = 0.25 * Math.min(2.0, boostBar / 1.2);
    gain.gain.setValueAtTime(peakGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.35);
  }

  // Play Exhaust Backfire Pop & Crackle Burst
  public triggerExhaustPop(intensity: "mild" | "heavy" | "flame_spit" = "heavy") {
    if (this.isMuted) return;
    const ctx = this.initAudioContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const popCount = intensity === "flame_spit" ? 4 : intensity === "heavy" ? 2 : 1;

    for (let i = 0; i < popCount; i++) {
      const popDelay = now + i * 0.07 + Math.random() * 0.03;

      // Sub-Bass Transient Impact
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();

      subOsc.type = "triangle";
      subOsc.frequency.setValueAtTime(180, popDelay);
      subOsc.frequency.exponentialRampToValueAtTime(35, popDelay + 0.06);

      subGain.gain.setValueAtTime(0.45, popDelay);
      subGain.gain.exponentialRampToValueAtTime(0.001, popDelay + 0.06);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);

      subOsc.start(popDelay);
      subOsc.stop(popDelay + 0.06);

      // High-Frequency Exhaust Crackle
      const crackleOsc = ctx.createOscillator();
      const crackleGain = ctx.createGain();

      crackleOsc.type = "square";
      crackleOsc.frequency.setValueAtTime(1400 + Math.random() * 600, popDelay);
      crackleOsc.frequency.exponentialRampToValueAtTime(300, popDelay + 0.03);

      crackleGain.gain.setValueAtTime(0.2, popDelay);
      crackleGain.gain.exponentialRampToValueAtTime(0.001, popDelay + 0.03);

      crackleOsc.connect(crackleGain);
      crackleGain.connect(this.masterGain);

      crackleOsc.start(popDelay);
      crackleOsc.stop(popDelay + 0.03);
    }
  }

  // Play Starter Motor Cranking & Test Rev Sequence
  public triggerTestFireSequence(layout: EngineLayoutId, redlineRpm: number = 7500) {
    if (this.isMuted) return;
    const ctx = this.initAudioContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    // Step 1: Starter Motor Cranking Chatter (0.0s -> 0.6s)
    for (let i = 0; i < 4; i++) {
      const starterOsc = ctx.createOscillator();
      const starterGain = ctx.createGain();

      starterOsc.type = "sawtooth";
      starterOsc.frequency.setValueAtTime(90 + i * 15, now + i * 0.12);
      starterOsc.frequency.linearRampToValueAtTime(140, now + i * 0.12 + 0.09);

      starterGain.gain.setValueAtTime(0.3, now + i * 0.12);
      starterGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.09);

      starterOsc.connect(starterGain);
      starterGain.connect(this.masterGain);

      starterOsc.start(now + i * 0.12);
      starterOsc.stop(now + i * 0.12 + 0.09);
    }

    // Step 2: Ignition Fire-up & Screaming Rev Flare (0.6s -> 2.2s)
    setTimeout(() => {
      let currentRpm = 1000;
      const targetRevRpm = Math.min(8500, redlineRpm * 0.85);

      const revInterval = setInterval(() => {
        if (currentRpm < targetRevRpm) {
          currentRpm += 450;
        } else {
          currentRpm -= 500;
        }

        this.updateEngineAudio({
          layout,
          rpm: currentRpm,
          engineLoad: 0.8,
          throttle: currentRpm > 2500 ? 0.9 : 0.15,
          forcedInduction: "turbo_single",
          boostPressureBar: 1.4,
        });

        if (currentRpm <= 900) {
          clearInterval(revInterval);
          this.triggerBlowOffValve(1.4);
          this.triggerExhaustPop("heavy");
          setTimeout(() => this.stopEngineAudioGraph(), 400);
        }
      }, 40);
    }, 600);
  }
}

// Export Singleton Helper Instance
export const apexAudio = ApexEngineAudioEngine.getInstance();

export type EngineAudioType = EngineLayoutId;

export function playEngineRevSound(params: {
  type: EngineLayoutId;
  rpm: number;
  throttle: number;
  isTurbo?: boolean;
  boostPressure?: number;
}) {
  apexAudio.triggerTestFireSequence(params.type, params.rpm);
}

export function calculateFiringFrequency(layout: EngineLayoutId, rpm: number): {
  fundamental: number;
  secondary: number;
} {
  const profile = ENGINE_FIRING_ORDERS[layout] || ENGINE_FIRING_ORDERS.i4;
  const rps = (rpm || 6000) / 60;
  const primaryHarm = profile.harmonicProfile[0]?.orderMultiplier || 2.0;
  const secondaryHarm = profile.harmonicProfile[1]?.orderMultiplier || 4.0;
  return {
    fundamental: rps * primaryHarm,
    secondary: rps * secondaryHarm,
  };
}
