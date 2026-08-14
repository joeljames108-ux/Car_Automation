// ===================================================================
// ENGINE ASSEMBLY SYSTEM — SYNTHESIZED WEB AUDIO API SOUND ENGINE (V3)
// Multi-Layer Composite Synthesis + Noise Transients + Dynamics Compression
// ===================================================================

import { playEngineRevSound, EngineAudioType } from "./engineAudioEngine";

let audioCtx: AudioContext | null = null;
let masterCompressor: DynamicsCompressorNode | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();

      // Master Dynamics Compressor to prevent audio clipping & enhance punch
      masterCompressor = audioCtx.createDynamicsCompressor();
      masterCompressor.threshold.setValueAtTime(-14, audioCtx.currentTime);
      masterCompressor.knee.setValueAtTime(24, audioCtx.currentTime);
      masterCompressor.ratio.setValueAtTime(8, audioCtx.currentTime);
      masterCompressor.attack.setValueAtTime(0.002, audioCtx.currentTime);
      masterCompressor.release.setValueAtTime(0.20, audioCtx.currentTime);
      masterCompressor.connect(audioCtx.destination);
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function toggleAssemblyMute(): boolean {
  isMuted = !isMuted;
  return isMuted;
}

export function getAssemblyMuteState(): boolean {
  return isMuted;
}

// Cached Noise Buffer for realistic mechanical impacts & air exhaust hiss
let cachedNoiseBuffer: AudioBuffer | null = null;
function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (!cachedNoiseBuffer || cachedNoiseBuffer.sampleRate !== ctx.sampleRate) {
    const bufferSize = ctx.sampleRate * 0.5; // 0.5 seconds of noise
    cachedNoiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = cachedNoiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }
  return cachedNoiseBuffer;
}

export function playAssemblySound(
  type:
    | "heavy"
    | "click"
    | "slide"
    | "spool"
    | "metallic"
    | "pneumatic"
    | "starter"
    | "rev"
    | "completion"
    | "ratchet"
    | "gasket",
  panX: number = 0.5 // 0.0 (left) to 1.0 (right)
) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx || !masterCompressor) return;

  const now = ctx.currentTime;

  // Spatial Panner Node for 3D Left-Right Engine Bay Localization
  let panner: PannerNode | StereoPannerNode | null = null;
  if (ctx.createStereoPanner) {
    panner = ctx.createStereoPanner();
    (panner as StereoPannerNode).pan.setValueAtTime((panX - 0.5) * 1.6, now);
    panner.connect(masterCompressor);
  }

  const outputNode: AudioNode = panner ? panner : masterCompressor;

  switch (type) {
    case "click": {
      // 3-Layer Snap-On Precision Torque Wrench Snap (Metallic transient + Body resonance + Socket detent)
      
      // Layer 1: High-Frequency Socket Detent Transient Snap (3200Hz -> 800Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "square";
      osc1.frequency.setValueAtTime(3200, now);
      osc1.frequency.exponentialRampToValueAtTime(800, now + 0.025);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
      osc1.connect(gain1);
      gain1.connect(outputNode);
      osc1.start(now);
      osc1.stop(now + 0.025);

      // Layer 2: Resonant Bolt Body Ring Tail (1450Hz -> 320Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1450, now);
      osc2.frequency.exponentialRampToValueAtTime(320, now + 0.07);
      gain2.gain.setValueAtTime(0.30, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc2.connect(gain2);
      gain2.connect(outputNode);
      osc2.start(now);
      osc2.stop(now + 0.07);

      // Layer 3: High-Pass Filtered Socket Metallic Click Transient
      const noise = ctx.createBufferSource();
      const noiseFilter = ctx.createBiquadFilter();
      const noiseGain = ctx.createGain();
      noise.buffer = getNoiseBuffer(ctx);
      noiseFilter.type = "highpass";
      noiseFilter.frequency.setValueAtTime(2800, now);
      noiseGain.gain.setValueAtTime(0.20, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(outputNode);
      noise.start(now);
      noise.stop(now + 0.02);
      break;
    }

    case "heavy": {
      // 3-Layer Mechanical Placement Thud (Sub-bass impact + Cast iron resonance + Metallic pin strike)

      // Layer 1: Sub-bass 50Hz Structural Impact
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = "triangle";
      subOsc.frequency.setValueAtTime(150, now);
      subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.32);
      subGain.gain.setValueAtTime(0.65, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      subOsc.connect(subGain);
      subGain.connect(outputNode);
      subOsc.start(now);
      subOsc.stop(now + 0.32);

      // Layer 2: Cast Iron Casing Body Ring
      const bodyOsc = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      bodyOsc.type = "sawtooth";
      bodyOsc.frequency.setValueAtTime(380, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(90, now + 0.16);
      bodyGain.gain.setValueAtTime(0.28, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      bodyOsc.connect(bodyGain);
      bodyGain.connect(outputNode);
      bodyOsc.start(now);
      bodyOsc.stop(now + 0.16);

      // Layer 3: Steel Dowel Pin Impact Noise Transient
      const noise = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const noiseGain = ctx.createGain();
      noise.buffer = getNoiseBuffer(ctx);
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2200, now);
      filter.Q.setValueAtTime(3, now);
      noiseGain.gain.setValueAtTime(0.25, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(outputNode);
      noise.start(now);
      noise.stop(now + 0.04);
      break;
    }

    case "pneumatic": {
      // 5-Impact Rapid Air Wrench Chatter with High-Pressure Air Exhaust Release
      for (let i = 0; i < 5; i++) {
        const impactTime = now + i * 0.038;

        // Hammer Strike
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(1100 - i * 70, impactTime);
        osc.frequency.exponentialRampToValueAtTime(220, impactTime + 0.028);
        gain.gain.setValueAtTime(0.28, impactTime);
        gain.gain.exponentialRampToValueAtTime(0.001, impactTime + 0.028);
        osc.connect(gain);
        gain.connect(outputNode);
        osc.start(impactTime);
        osc.stop(impactTime + 0.028);

        // Air Exhaust Hiss Burst
        const noise = ctx.createBufferSource();
        const filter = ctx.createBiquadFilter();
        const noiseGain = ctx.createGain();
        noise.buffer = getNoiseBuffer(ctx);
        filter.type = "highpass";
        filter.frequency.setValueAtTime(4500, impactTime);
        noiseGain.gain.setValueAtTime(0.18, impactTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, impactTime + 0.022);
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(outputNode);
        noise.start(impactTime);
        noise.stop(impactTime + 0.022);
      }
      break;
    }

    case "slide": {
      // Lubricated Piston Insertion Glide (Frequency slide + Oil film friction texture)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(460, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);
      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(outputNode);
      osc.start(now);
      osc.stop(now + 0.22);

      // Oil Film Friction Hiss Texture
      const noise = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const noiseGain = ctx.createGain();
      noise.buffer = getNoiseBuffer(ctx);
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1600, now);
      filter.Q.setValueAtTime(2, now);
      noiseGain.gain.setValueAtTime(0.12, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.20);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(outputNode);
      noise.start(now);
      noise.stop(now + 0.20);
      break;
    }

    case "metallic": {
      // Camshaft / Rod Precision Metallic Ring Resonance (1800Hz + 3200Hz dual harmonics)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "square";
      osc1.frequency.setValueAtTime(1800, now);
      osc1.frequency.exponentialRampToValueAtTime(480, now + 0.24);

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(3200, now);
      osc2.frequency.exponentialRampToValueAtTime(960, now + 0.24);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(outputNode);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.24);
      osc2.stop(now + 0.24);
      break;
    }

    case "spool": {
      // Dual-Harmonic Turbochargers Spool Pitch Rise + High-Pressure Blow-Off Wastegate Dump
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(2400, now + 0.42);

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.exponentialRampToValueAtTime(4800, now + 0.42);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(outputNode);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.42);
      osc2.stop(now + 0.42);

      // Wastegate Blow-Off Dump Hiss at End of Spool
      const noise = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const noiseGain = ctx.createGain();
      noise.buffer = getNoiseBuffer(ctx);
      filter.type = "highpass";
      filter.frequency.setValueAtTime(3200, now + 0.38);
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.setValueAtTime(0.25, now + 0.38);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(outputNode);
      noise.start(now + 0.38);
      noise.stop(now + 0.52);
      break;
    }

    case "ratchet": {
      // 5-Click Torque Wrench Tightening Pattern with Rising Torque Resistance Pitch
      for (let i = 0; i < 5; i++) {
        const clickTime = now + i * 0.045;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(650 + i * 180, clickTime);
        gain.gain.setValueAtTime(0.25, clickTime);
        gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.03);
        osc.connect(gain);
        gain.connect(outputNode);
        osc.start(clickTime);
        osc.stop(clickTime + 0.03);
      }
      break;
    }

    case "gasket": {
      // MLS Head Gasket Compression Sealing Hiss
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.28);
      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(outputNode);
      osc.start(now);
      osc.stop(now + 0.28);
      break;
    }

    case "completion": {
      // Celebratory 4-Tone Motorsport Victory Fanfare (C5 -> E5 -> G5 -> C6) with Decay
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.11);

        gain.gain.setValueAtTime(0.32, now + i * 0.11);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.11 + 0.45);

        osc.connect(gain);
        gain.connect(outputNode);
        osc.start(now + i * 0.11);
        osc.stop(now + i * 0.11 + 0.45);
      });
      break;
    }

    case "starter": {
      // Starter Motor Cranking Stutter
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.linearRampToValueAtTime(160, now + 0.45);
      gain.gain.setValueAtTime(0.38, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(outputNode);
      osc.start(now);
      osc.stop(now + 0.45);
      break;
    }

    case "rev": {
      playEngineRevSound({
        type: "i4",
        rpm: 6500,
        throttle: 0.9,
        isTurbo: true,
        boostPressure: 1.4,
      });
      break;
    }
  }
}

export function playLayoutEngineSound(
  type: EngineAudioType,
  rpm: number = 7200,
  isTurbo: boolean = true
) {
  playEngineRevSound({
    type,
    rpm,
    throttle: 0.95,
    isTurbo,
    boostPressure: 1.5,
  });
}
