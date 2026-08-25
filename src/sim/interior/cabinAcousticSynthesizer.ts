/**
 * ============================================================================
 * CABIN ACOUSTIC NVH & BESPOKE AUDIO SYNTHESIZER
 * ============================================================================
 * Real-time Web Audio API engine for realistic interior sound testing:
 * 1. Cabin NVH Soundproof Simulator (Road, wind, engine intake at speed with ANC)
 * 2. Solid Door Seal Acoustic "Thunk" Synthesizer
 * 3. Open-Gated Chrome Shifter Mechanical Gate Clack
 * 4. Spatial Dolby Atmos Soundstage Equalizer Sweep
 * ============================================================================
 */

export class CabinAcousticSynthesizer {
  private static instance: CabinAcousticSynthesizer | null = null;
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  // NVH Ambient Node Chain
  private isNvhRunning: boolean = false;
  private roadNoiseNode: AudioBufferSourceNode | null = null;
  private windFilterNode: BiquadFilterNode | null = null;
  private masterNvhGain: GainNode | null = null;

  public static getInstance(): CabinAcousticSynthesizer {
    if (!CabinAcousticSynthesizer.instance) {
      CabinAcousticSynthesizer.instance = new CabinAcousticSynthesizer();
    }
    return CabinAcousticSynthesizer.instance;
  }

  private initContext() {
    if (!this.audioCtx && typeof window !== "undefined") {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterNvhGain && this.audioCtx) {
      this.masterNvhGain.gain.setValueAtTime(muted ? 0 : 0.4, this.audioCtx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Play heavy damped luxury car door close "thunk" sound
   */
  public playDoorThunk() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // Heavy bass thump (45Hz -> 20Hz decay)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(85, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.18);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);

    // High frequency rubber seal latch click
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = "triangle";
    clickOsc.frequency.setValueAtTime(380, now);
    clickOsc.frequency.exponentialRampToValueAtTime(80, now + 0.04);

    clickGain.gain.setValueAtTime(0.35, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.06);
  }

  /**
   * Play metallic gated manual shifter gate engagement click
   */
  public playGatedShifterClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // Crisp metallic click (1800Hz resonant bandpass)
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2400, now);
    filter.Q.setValueAtTime(8.0, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  }

  /**
   * Play rotary switch haptic detent click
   */
  public playRotaryDialClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.02);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  /**
   * Play crisp magnetic tactile paddle shifter click
   */
  public playPaddleShiftSound(dir: "up" | "down" = "up") {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = dir === "up" ? "triangle" : "sine";
    osc.frequency.setValueAtTime(dir === "up" ? 1800 : 1200, now);
    osc.frequency.exponentialRampToValueAtTime(dir === "up" ? 600 : 350, now + 0.03);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * Spatial Dolby Atmos Audiophile Demo Sweep
   */
  public playDolbyAtmosSweep() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // Harmonic chord sweep (Spatial Soundstage)
    const freqs = [220, 330, 440, 660, 880];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now + idx * 0.08);

      const panVal = ((idx / (freqs.length - 1)) * 2 - 1) * 0.8;
      if (panner) panner.pan.setValueAtTime(panVal, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

      if (panner) {
        osc.connect(panner);
        panner.connect(gain);
      } else {
        osc.connect(gain);
      }
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.7);
    });
  }
}

