// ===================================================================
// ENGINE ASSEMBLY SYSTEM — SYNTHESIZED WEB AUDIO API SOUND ENGINE (V2)
// Multi-Layer Composite Synthesis + Spatial Panning + Dynamics Compression
// ===================================================================

import { playEngineRevSound, EngineAudioType } from "./engineAudioEngine";

let audioCtx: AudioContext | null = null;
let masterCompressor: DynamicsCompressorNode | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      
      // Master Dynamics Compressor to prevent clipping
      masterCompressor = audioCtx.createDynamicsCompressor();
      masterCompressor.threshold.setValueAtTime(-12, audioCtx.currentTime);
      masterCompressor.knee.setValueAtTime(30, audioCtx.currentTime);
      masterCompressor.ratio.setValueAtTime(12, audioCtx.currentTime);
      masterCompressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
      masterCompressor.release.setValueAtTime(0.25, audioCtx.currentTime);
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

export function playAssemblySound(
  type: "heavy" | "click" | "slide" | "spool" | "metallic" | "pneumatic" | "starter" | "rev" | "completion" | "ratchet" | "gasket",
  panX: number = 0.5 // 0.0 (left) to 1.0 (right)
) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx || !masterCompressor) return;

  const now = ctx.currentTime;

  // Spatial Panner Node
  let panner: PannerNode | StereoPannerNode | null = null;
  if (ctx.createStereoPanner) {
    panner = ctx.createStereoPanner();
    (panner as StereoPannerNode).pan.setValueAtTime((panX - 0.5) * 1.6, now);
    panner.connect(masterCompressor);
  } else {
    // Fallback if StereoPanner is unavailable
  }

  const outputNode: AudioNode = panner ? panner : masterCompressor;

  switch (type) {
    case "click": {
      // Stacked metallic click with resonant tail (800Hz -> 150Hz + 2.4kHz transient)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(950, now);
      osc1.frequency.exponentialRampToValueAtTime(180, now + 0.08);

      osc2.type = "square";
      osc2.frequency.setValueAtTime(2400, now);
      osc2.frequency.exponentialRampToValueAtTime(600, now + 0.03);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(outputNode);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.09);
      osc2.stop(now + 0.09);
      break;
    }

    case "heavy": {
      // Multi-layer mechanical placement thud (140Hz sub + 440Hz body + noise impact)
      const subOsc = ctx.createOscillator();
      const bodyOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      const bodyGain = ctx.createGain();

      subOsc.type = "triangle";
      subOsc.frequency.setValueAtTime(140, now);
      subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.28);
      subGain.gain.setValueAtTime(0.6, now);
      subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      bodyOsc.type = "sawtooth";
      bodyOsc.frequency.setValueAtTime(440, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
      bodyGain.gain.setValueAtTime(0.25, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      subOsc.connect(subGain);
      bodyOsc.connect(bodyGain);
      subGain.connect(outputNode);
      bodyGain.connect(outputNode);

      subOsc.start(now);
      bodyOsc.start(now);
      subOsc.stop(now + 0.28);
      bodyOsc.stop(now + 0.28);
      break;
    }

    case "slide": {
      // Piston slide insertion (420Hz -> 160Hz smooth glide)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.linearRampToValueAtTime(160, now + 0.2);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(outputNode);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
    }

    case "metallic": {
      // Camshaft / rod metallic resonance (1400Hz -> 500Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.14);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

      osc.connect(gain);
      gain.connect(outputNode);
      osc.start(now);
      osc.stop(now + 0.14);
      break;
    }

    case "spool": {
      // Dual-harmonic Turbo spool turbine pitch rise (220Hz + 440Hz -> 1800Hz + 3600Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(1800, now + 0.45);

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.exponentialRampToValueAtTime(3600, now + 0.45);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(outputNode);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
      break;
    }

    case "completion": {
      // Celebratory 3-tone chime (C5 -> E5 -> G5)
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        gain.gain.setValueAtTime(0.3, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.4);

        osc.connect(gain);
        gain.connect(outputNode);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.4);
      });
      break;
    }

    case "pneumatic": {
      // 4-impact rapid air wrench chatter
      for (let i = 0; i < 4; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(950 - i * 80, now + i * 0.04);
        gain.gain.setValueAtTime(0.25, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.04 + 0.03);
        osc.connect(gain);
        gain.connect(outputNode);
        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.03);
      }
      break;
    }

    case "ratchet": {
      // 5-click torque wrench pattern with rising pitch per click
      for (let i = 0; i < 5; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(600 + i * 150, now + i * 0.05);
        gain.gain.setValueAtTime(0.2, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.03);
        osc.connect(gain);
        gain.connect(outputNode);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.03);
      }
      break;
    }

    case "gasket": {
      // Low compression hiss for gasket seating
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(outputNode);
      osc.start(now);
      osc.stop(now + 0.25);
      break;
    }

    case "starter": {
      // Starter motor cranking stutter
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.linearRampToValueAtTime(150, now + 0.5);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.connect(gain);
      gain.connect(outputNode);
      osc.start(now);
      osc.stop(now + 0.5);
      break;
    }

    case "rev": {
      // Photorealistic multi-harmonic engine audio flare with turbo spool & blow-off dump
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
