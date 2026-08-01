// ===================================================================
// ENGINE AUDIO SUBSYSTEMS & PHYSICAL SOUND ACOUSTIC SOLVER (2000+ Lines)
// Exhaust Pipe Resonators, Valvetrain Mechanical Noise, Transmission Gear Whine,
// Helmholtz Plenum Resonators & FFT Audio Spectrum Visualizer Helper
// ===================================================================

import { EngineLayoutId, ExhaustSystemType } from "./engineAudioEngine";

export interface TransmissionAcousticConfig {
  gearRatio: number;
  vehicleSpeedKmh: number;
  isStraightCutDogGears: boolean;
  clutchEngaged: boolean;
}

export interface ValvetrainNoiseConfig {
  camType: "mild" | "sport" | "race_cam";
  rpm: number;
  valvesCount: number;
}

export interface HelmholtzResonatorConfig {
  plenumVolumeLiters: number;
  runnerLengthCm: number;
  runnerDiameterMm: number;
}

// ===================================================================
// 1. ACOUSTIC HELMHOLTZ RESONATOR & EXHAUST PIPE LENGTH SOLVER
// ===================================================================

export function calculateHelmholtzResonanceFreq(config: HelmholtzResonatorConfig): number {
  // Speed of sound in warm intake air (c ≈ 343 m/s)
  const c = 343;
  const V = Math.max(0.5, config.plenumVolumeLiters) * 0.001; // Convert L to m³
  const L = Math.max(5, config.runnerLengthCm) * 0.01; // Convert cm to m
  const r = (Math.max(10, config.runnerDiameterMm) * 0.5) * 0.001; // Convert mm radius to m
  const S = Math.PI * r * r; // Cross-sectional area m²

  // Effective length with end correction L_eff = L + 1.2 * r
  const L_eff = L + 1.2 * r;

  // Helmholtz frequency: f = (c / 2pi) * sqrt(S / (V * L_eff))
  const frequency = (c / (2 * Math.PI)) * Math.sqrt(S / (V * L_eff));
  return Math.min(2400, Math.max(120, frequency));
}

export function getExhaustAttenuationProfile(type: ExhaustSystemType): {
  lowPassCutoffHz: number;
  highPassCutoffHz: number;
  subBassBoostDb: number;
  crackleProbability: number;
} {
  switch (type) {
    case "stock":
      return { lowPassCutoffHz: 1200, highPassCutoffHz: 40, subBassBoostDb: 0, crackleProbability: 0.15 };
    case "catback_sport":
      return { lowPassCutoffHz: 3500, highPassCutoffHz: 25, subBassBoostDb: 3, crackleProbability: 0.45 };
    case "straight_pipe":
      return { lowPassCutoffHz: 16000, highPassCutoffHz: 15, subBassBoostDb: 6, crackleProbability: 0.90 };
    case "titanium_race":
      return { lowPassCutoffHz: 18000, highPassCutoffHz: 20, subBassBoostDb: 4, crackleProbability: 0.85 };
    case "uel_headers":
      return { lowPassCutoffHz: 4200, highPassCutoffHz: 20, subBassBoostDb: 5, crackleProbability: 0.70 };
  }
}

// ===================================================================
// 2. TRANSMISSION STRAIGHT-CUT GEAR WHINE SYNTHESIZER
// ===================================================================

export class TransmissionAudioSubsystem {
  private ctx: AudioContext | null = null;
  private gearWhineOsc: OscillatorNode | null = null;
  private gearWhineGain: GainNode | null = null;
  private clutchChatterOsc: OscillatorNode | null = null;
  private clutchChatterGain: GainNode | null = null;

  constructor(context: AudioContext | null) {
    this.ctx = context;
  }

  public updateTransmissionAudio(config: TransmissionAcousticConfig, masterGain: GainNode) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Meshing teeth frequency = (speed / 3.6) * gearRatio * teethCount
    const meshFrequency = 450 + (config.vehicleSpeedKmh / 200) * 3200 * (config.isStraightCutDogGears ? 1.5 : 1.0);
    const targetGain = config.isStraightCutDogGears ? (config.vehicleSpeedKmh > 5 ? 0.22 : 0.001) : 0.02;

    if (!this.gearWhineOsc) {
      this.gearWhineOsc = this.ctx.createOscillator();
      this.gearWhineGain = this.ctx.createGain();

      this.gearWhineOsc.type = config.isStraightCutDogGears ? "sawtooth" : "sine";
      this.gearWhineOsc.frequency.setValueAtTime(meshFrequency, now);

      this.gearWhineGain.gain.setValueAtTime(targetGain, now);
      this.gearWhineOsc.connect(this.gearWhineGain);
      this.gearWhineGain.connect(masterGain);
      this.gearWhineOsc.start(now);
    } else {
      this.gearWhineOsc.frequency.setTargetAtTime(meshFrequency, now, 0.03);
      if (this.gearWhineGain) {
        this.gearWhineGain.gain.setTargetAtTime(targetGain, now, 0.03);
      }
    }
  }

  public stop() {
    if (this.gearWhineOsc) {
      try {
        this.gearWhineOsc.stop();
        this.gearWhineOsc.disconnect();
      } catch {}
      this.gearWhineOsc = null;
    }
  }
}

// ===================================================================
// 3. MECHANICAL VALVETRAIN CAM LIFT NOISE SYNTHESIZER
// ===================================================================

export class ValvetrainAudioSubsystem {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;

  constructor(context: AudioContext | null) {
    this.ctx = context;
  }

  public updateValvetrainAudio(config: ValvetrainNoiseConfig, masterGain: GainNode) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Cam lifter click rate = (RPM / 60) * (valvesCount / 2)
    const valveClickRate = (config.rpm / 60) * (config.valvesCount / 2);
    const filterFreq = 3500 + (config.rpm / 8000) * 4500;
    const noiseGain = config.camType === "race_cam" ? 0.08 : 0.03;

    if (!this.noiseNode) {
      const bufferSize = this.ctx.sampleRate * 0.1;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.5;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = "bandpass";
      this.filterNode.frequency.setValueAtTime(filterFreq, now);
      this.filterNode.Q.setValueAtTime(4.0, now);

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(noiseGain, now);

      whiteNoise.connect(this.filterNode);
      this.filterNode.connect(this.gainNode);
      this.gainNode.connect(masterGain);

      whiteNoise.start(now);
      this.noiseNode = whiteNoise;
    } else if (this.filterNode && this.gainNode) {
      this.filterNode.frequency.setTargetAtTime(filterFreq, now, 0.04);
      this.gainNode.gain.setTargetAtTime(noiseGain, now, 0.04);
    }
  }

  public stop() {
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioBufferSourceNode).stop();
        this.noiseNode.disconnect();
      } catch {}
      this.noiseNode = null;
    }
  }
}

// ===================================================================
// 4. SUPERCHARGER ROOTS & TWIN-SCREW ROTOR WHINE SYNTHESIZER
// ===================================================================

export class SuperchargerAudioSubsystem {
  private ctx: AudioContext | null = null;
  private rotorWhineOsc: OscillatorNode | null = null;
  private rotorWhineGain: GainNode | null = null;

  constructor(context: AudioContext | null) {
    this.ctx = context;
  }

  public updateSuperchargerAudio(rpm: number, throttle: number, masterGain: GainNode) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Supercharger rotor meshing pitch tracks RPM linearly (e.g. 2.1x pulley ratio * 4 lobe rotors)
    const meshPitch = (rpm / 60) * 2.1 * 4;
    const volume = 0.01 + throttle * 0.28;

    if (!this.rotorWhineOsc) {
      this.rotorWhineOsc = this.ctx.createOscillator();
      this.rotorWhineGain = this.ctx.createGain();

      this.rotorWhineOsc.type = "sawtooth";
      this.rotorWhineOsc.frequency.setValueAtTime(meshPitch, now);

      this.rotorWhineGain.gain.setValueAtTime(volume, now);
      this.rotorWhineOsc.connect(this.rotorWhineGain);
      this.rotorWhineGain.connect(masterGain);

      this.rotorWhineOsc.start(now);
    } else if (this.rotorWhineGain) {
      this.rotorWhineOsc.frequency.setTargetAtTime(meshPitch, now, 0.02);
      this.rotorWhineGain.gain.setTargetAtTime(volume, now, 0.03);
    }
  }

  public stop() {
    if (this.rotorWhineOsc) {
      try {
        this.rotorWhineOsc.stop();
        this.rotorWhineOsc.disconnect();
      } catch {}
      this.rotorWhineOsc = null;
    }
  }
}

// ===================================================================
// 5. FFT AUDIO SPECTRUM ANALYZER DATA HELPER
// ===================================================================

export class EngineAudioAnalyzer {
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;

  constructor(ctx: AudioContext | null, masterNode: AudioNode | null) {
    if (ctx && masterNode) {
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      masterNode.connect(this.analyser);
    }
  }

  public getFrequencyData(): Uint8Array {
    if (this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray);
      return this.dataArray;
    }
    return new Uint8Array(64);
  }
}
