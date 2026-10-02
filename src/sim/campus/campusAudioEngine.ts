/**
 * AUTO TYCOON CAMPUS HQ - ERA-ADAPTIVE PROCEDURAL AUDIO ENGINE (PHASE 225)
 * 
 * Provides procedural Web Audio API synthesis for campus atmosphere,
 * historical era ambiance beds, and tactile UI feedback.
 * 
 * Complies with the skill-for-audio-haptic-binding standard:
 * - 100% zero-dependency Web Audio API procedural synthesis (no external assets).
 * - Lazy AudioContext initialization on first user interaction.
 * - Era-specific ambient drone & filter parameters (1970s analog -> 2020s+ quiet laminar cleanroom).
 * - Tactile sound effects for facility selection, upgrades, plot unlocks, and notifications.
 */

import { CampusEraId } from "./eraDefinitions";

export class CampusAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.5;

  // Active ambient nodes
  private currentEra: CampusEraId = "ERA_1970S";
  private isAmbiancePlaying: boolean = false;
  private ambientGain: GainNode | null = null;
  private ambientOscillators: (OscillatorNode | AudioBufferSourceNode)[] = [];

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
    } else if (!muted && this.ambientGain && this.ctx && this.isAmbiancePlaying) {
      this.ambientGain.gain.setValueAtTime(0.08 * this.masterVolume, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.ambientGain && this.ctx && !this.isMuted) {
      this.ambientGain.gain.setValueAtTime(0.08 * this.masterVolume, this.ctx.currentTime);
    }
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // UI & TACTILE SOUND EFFECTS
  // ══════════════════════════════════════════════════════════════════════════

  /** Crisp tactile mechanical facility selection click */
  public playSelectUnit() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);

      gain.gain.setValueAtTime(0.12 * this.masterVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /** Construction / Upgrade Purchase: Pneumatic impact torque + ascending chime */
  public playUpgradeFacility() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // 1. Pneumatic Air Release Burst
      const bufferSize = Math.floor(ctx.sampleRate * 0.12);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(500, now + 0.12);
      filter.Q.setValueAtTime(2.0, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15 * this.masterVolume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);

      // 2. Ascending Dual-Tone Completion Chime
      const pitches = [523.25, 659.25, 783.99]; // C5, E5, G5 triad
      pitches.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const chimeGain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + 0.06 + idx * 0.05);

        const startTime = now + 0.06 + idx * 0.05;
        chimeGain.gain.setValueAtTime(0.1 * this.masterVolume, startTime);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

        osc.connect(chimeGain);
        chimeGain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.22);
      });
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /** Plot Expansion Unlock: Grand resonant bass impact & sparkle */
  public playUnlockPlot() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Resonant bass impact
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = "sine";
      sub.frequency.setValueAtTime(140, now);
      sub.frequency.exponentialRampToValueAtTime(45, now + 0.4);

      subGain.gain.setValueAtTime(0.25 * this.masterVolume, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start(now);
      sub.stop(now + 0.4);

      // Shimmer chord (A4, C#5, E5)
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + 0.04 * idx);

        gain.gain.setValueAtTime(0.06 * this.masterVolume, now + 0.04 * idx);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + 0.04 * idx);
        osc.stop(now + 0.5);
      });
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /** Alert / Notification chime */
  public playNotification(severity: "info" | "success" | "warning" | "error" = "info") {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (severity === "error") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(180, now + 0.08);
      } else if (severity === "warning") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(392, now + 0.08);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.06); // A5
      }

      gain.gain.setValueAtTime(0.09 * this.masterVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ERA AMBIANCE SYNTHESIZER
  // ══════════════════════════════════════════════════════════════════════════

  /** Start or update the procedural ambient audio bed according to era */
  public setEra(eraId: CampusEraId) {
    this.currentEra = eraId;
    if (this.isAmbiancePlaying) {
      this.stopEraAmbiance();
      this.startEraAmbiance(eraId);
    }
  }

  public startEraAmbiance(eraId: CampusEraId = this.currentEra) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      this.stopEraAmbiance();
      this.currentEra = eraId;
      this.isAmbiancePlaying = true;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.06 * this.masterVolume, ctx.currentTime + 1.5);
      masterGain.connect(ctx.destination);
      this.ambientGain = masterGain;

      switch (eraId) {
        case "ERA_1970S":
          this.build1970sAmbiance(ctx, masterGain);
          break;
        case "ERA_1980S":
          this.build1980sAmbiance(ctx, masterGain);
          break;
        case "ERA_1990S":
          this.build1990sAmbiance(ctx, masterGain);
          break;
        case "ERA_2000S":
          this.build2000sAmbiance(ctx, masterGain);
          break;
        case "ERA_2010S":
          this.build2010sAmbiance(ctx, masterGain);
          break;
        case "ERA_2020S_PLUS":
          this.build2020sAmbiance(ctx, masterGain);
          break;
        default:
          this.build1970sAmbiance(ctx, masterGain);
          break;
      }
    } catch {
      // Audio policy
    }
  }

  public stopEraAmbiance() {
    if (!this.ctx) return;
    try {
      if (this.ambientGain) {
        this.ambientGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      }
      this.ambientOscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
      this.ambientOscillators = [];
      this.ambientGain = null;
      this.isAmbiancePlaying = false;
    } catch {
      // ignore
    }
  }

  // ── ERA SPECIFIC PROCEDURAL GENERATORS ──

  private build1970sAmbiance(ctx: AudioContext, destination: GainNode) {
    // 1970s: Heavy analog 60Hz transformer electrical hum + warm mechanical drone
    const osc60 = ctx.createOscillator();
    osc60.type = "sawtooth";
    osc60.frequency.value = 60; // 60Hz mains hum

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 180;

    const gain = ctx.createGain();
    gain.gain.value = 0.4;

    osc60.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(destination);

    osc60.start();
    this.ambientOscillators.push(osc60);
  }

  private build1980sAmbiance(ctx: AudioContext, destination: GainNode) {
    // 1980s: CRT monitor flyback whine harmonic + analog synthesizer warm sub-pad
    const oscCrt = ctx.createOscillator();
    oscCrt.type = "sine";
    oscCrt.frequency.value = 110;

    const oscHigh = ctx.createOscillator();
    oscHigh.type = "sine";
    oscHigh.frequency.value = 440; // Soft melodic hum

    const gainHigh = ctx.createGain();
    gainHigh.gain.value = 0.15;

    oscHigh.connect(gainHigh);
    gainHigh.connect(destination);
    oscCrt.connect(destination);

    oscCrt.start();
    oscHigh.start();
    this.ambientOscillators.push(oscCrt, oscHigh);
  }

  private build1990sAmbiance(ctx: AudioContext, destination: GainNode) {
    // 1990s: Server rack fan drone (filtered noise around 500Hz)
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 650;
    bandpass.Q.value = 1.5;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.25;

    noise.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(destination);

    noise.start();
    this.ambientOscillators.push(noise);
  }

  private build2000sAmbiance(ctx: AudioContext, destination: GainNode) {
    // 2000s: Clean HVAC airflow + smooth dual resonant drone
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();

    osc1.type = "sine";
    osc1.frequency.value = 130.81; // C3
    osc2.type = "triangle";
    osc2.frequency.value = 196.0; // G3

    const subGain = ctx.createGain();
    subGain.gain.value = 0.2;

    osc1.connect(subGain);
    osc2.connect(subGain);
    subGain.connect(destination);

    osc1.start();
    osc2.start();
    this.ambientOscillators.push(osc1, osc2);
  }

  private build2010sAmbiance(ctx: AudioContext, destination: GainNode) {
    // 2010s: Electric motor inverter subtle pulse + quiet high-tech data center
    const oscInverter = ctx.createOscillator();
    oscInverter.type = "sine";
    oscInverter.frequency.value = 320;

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.3; // Gentle 0.3 Hz undulating breathe
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 15;

    lfo.connect(lfoGain);
    lfoGain.connect(oscInverter.frequency);

    const gain = ctx.createGain();
    gain.gain.value = 0.18;

    oscInverter.connect(gain);
    gain.connect(destination);

    lfo.start();
    oscInverter.start();
    this.ambientOscillators.push(lfo, oscInverter);
  }

  private build2020sAmbiance(ctx: AudioContext, destination: GainNode) {
    // 2020s+: Whisper-quiet cleanroom laminar airflow + harmonic crystal resonance
    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();

    oscA.type = "sine";
    oscA.frequency.value = 216; // Harmonic resonance 432 / 2
    oscB.type = "sine";
    oscB.frequency.value = 324; // Perfect fifth harmonic

    const gainA = ctx.createGain();
    gainA.gain.value = 0.12;

    oscA.connect(gainA);
    oscB.connect(gainA);
    gainA.connect(destination);

    oscA.start();
    oscB.start();
    this.ambientOscillators.push(oscA, oscB);
  }
}

// Global Singleton Export
export const campusAudio = new CampusAudioEngine();
