/**
 * ============================================================================
 * MODULAR ENGINE STUDIO — REAL-TIME WEB AUDIO POWERTRAIN SYNTHESIZER
 * ============================================================================
 * Pure procedural Web Audio API acoustic synthesis engine.
 * Generates authentic combustion engine audio including:
 * - Fundamental cylinder firing harmonics
 * - Intake plenum induction roar
 * - Turbocharger compressor spool whine
 * - Wastegate & blow-off valve (BOV) atmospheric whoosh
 * - Exhaust overrun crackles, burble, and rev-limiter spark cuts
 * ============================================================================
 */

import { MasterEngineState } from "../engine/masterEngineTypes";

export class MasterEngineAudioSynthesizer {
  private static instance: MasterEngineAudioSynthesizer | null = null;
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  // Synthesis Nodes
  private fundamentalOsc: OscillatorNode | null = null;
  private fundamentalGain: GainNode | null = null;
  private harmonicOsc: OscillatorNode | null = null;
  private harmonicGain: GainNode | null = null;
  private turboOsc: OscillatorNode | null = null;
  private turboGain: GainNode | null = null;
  private intakeFilter: BiquadFilterNode | null = null;
  private intakeGain: GainNode | null = null;
  private exhaustGain: GainNode | null = null;

  // Runtime State
  private currentRpm: number = 950;
  private throttle01: number = 0.2;
  private boostBar: number = 0.0;
  private isRunning: boolean = false;

  private constructor() {
    // Lazy initialize on user gesture
  }

  public static getInstance(): MasterEngineAudioSynthesizer {
    if (!MasterEngineAudioSynthesizer.instance) {
      MasterEngineAudioSynthesizer.instance = new MasterEngineAudioSynthesizer();
    }
    return MasterEngineAudioSynthesizer.instance;
  }

  public initAudioContext(): boolean {
    if (typeof window === "undefined") return false;
    if (this.audioCtx) return true;

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return false;
      this.audioCtx = new AudioCtxClass();

      // Master Gain
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(0.35, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);

      // 1. Fundamental Combustion Pulse Oscillator
      this.fundamentalOsc = this.audioCtx.createOscillator();
      this.fundamentalOsc.type = "sawtooth";
      this.fundamentalGain = this.audioCtx.createGain();
      this.fundamentalGain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);

      // Lowpass Filter for exhaust muffler/timbre
      const exhaustFilter = this.audioCtx.createBiquadFilter();
      exhaustFilter.type = "lowpass";
      exhaustFilter.frequency.setValueAtTime(450, this.audioCtx.currentTime);

      this.fundamentalOsc.connect(this.fundamentalGain);
      this.fundamentalGain.connect(exhaustFilter);
      exhaustFilter.connect(this.masterGain);
      this.fundamentalOsc.start();

      // 2. Harmonic Engine Resonance Oscillator
      this.harmonicOsc = this.audioCtx.createOscillator();
      this.harmonicOsc.type = "triangle";
      this.harmonicGain = this.audioCtx.createGain();
      this.harmonicGain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);

      this.harmonicOsc.connect(this.harmonicGain);
      this.harmonicGain.connect(this.masterGain);
      this.harmonicOsc.start();

      // 3. Turbocharger Compressor Whine
      this.turboOsc = this.audioCtx.createOscillator();
      this.turboOsc.type = "sine";
      this.turboGain = this.audioCtx.createGain();
      this.turboGain.gain.setValueAtTime(0.0, this.audioCtx.currentTime);

      this.turboOsc.connect(this.turboGain);
      this.turboGain.connect(this.masterGain);
      this.turboOsc.start();

      // 4. Intake Induction Noise Generator
      this.intakeFilter = this.audioCtx.createBiquadFilter();
      this.intakeFilter.type = "bandpass";
      this.intakeFilter.frequency.setValueAtTime(250, this.audioCtx.currentTime);
      this.intakeFilter.Q.setValueAtTime(3.0, this.audioCtx.currentTime);

      this.intakeGain = this.audioCtx.createGain();
      this.intakeGain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
      this.intakeFilter.connect(this.intakeGain);
      this.intakeGain.connect(this.masterGain);

      this.isRunning = true;
      return true;
    } catch (e) {
      console.warn("Web Audio API not supported or blocked by browser policy:", e);
      return false;
    }
  }

  public updateTelemetry(rpm: number, throttle01: number = 0.5, boostBar: number = 0.0, cylCount: number = 8): void {
    this.currentRpm = Math.max(0, rpm);
    this.throttle01 = Math.max(0, Math.min(1, throttle01));
    this.boostBar = Math.max(0, boostBar);

    if (!this.audioCtx || !this.isRunning) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // Firing frequency f0 = (RPM / 60) * (Cylinders / 2) for 4-stroke engine
    const firingFreqHz = Math.max(12, ((this.currentRpm / 60) * cylCount) / 2);

    if (this.fundamentalOsc && this.fundamentalGain) {
      this.fundamentalOsc.frequency.setTargetAtTime(firingFreqHz, now, 0.04);
      const loadGain = 0.15 + this.throttle01 * 0.35 + (this.currentRpm / 10000) * 0.2;
      this.fundamentalGain.gain.setTargetAtTime(this.isMuted ? 0 : loadGain, now, 0.05);
    }

    if (this.harmonicOsc && this.harmonicGain) {
      this.harmonicOsc.frequency.setTargetAtTime(firingFreqHz * 2.0, now, 0.04);
      const harmGain = 0.05 + this.throttle01 * 0.2;
      this.harmonicGain.gain.setTargetAtTime(this.isMuted ? 0 : harmGain, now, 0.05);
    }

    // Turbo compressor whistle frequency (1.2 kHz -> 4.5 kHz based on boost & RPM)
    if (this.turboOsc && this.turboGain) {
      if (this.boostBar > 0.05) {
        const turboFreq = 1400 + (this.boostBar * 1200) + (this.currentRpm * 0.15);
        this.turboOsc.frequency.setTargetAtTime(turboFreq, now, 0.08);
        const turboVol = Math.min(0.25, this.boostBar * 0.12);
        this.turboGain.gain.setTargetAtTime(this.isMuted ? 0 : turboVol, now, 0.06);
      } else {
        this.turboGain.gain.setTargetAtTime(0, now, 0.1);
      }
    }
  }

  /**
   * Triggers a wastegate blow-off atmospheric whoosh
   */
  public triggerBlowOffValve(): void {
    if (!this.audioCtx || this.isMuted) return;
    try {
      const bufferSize = this.audioCtx.sampleRate * 0.35; // 350ms
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(2200, this.audioCtx.currentTime);

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.32);

      whiteNoise.connect(filter);
      filter.connect(gain);
      if (this.masterGain) gain.connect(this.masterGain);

      whiteNoise.start();
    } catch (e) {
      // Audio trigger fallback
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.35, this.audioCtx.currentTime, 0.05);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public stop(): void {
    if (this.audioCtx && this.audioCtx.state !== "closed") {
      this.audioCtx.suspend();
    }
    this.isRunning = false;
  }
}
