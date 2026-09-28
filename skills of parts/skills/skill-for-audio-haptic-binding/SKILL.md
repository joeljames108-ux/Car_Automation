---
name: skill-for-audio-haptic-binding
description: Architectural standard, glTF extras metadata schema, Web Audio API procedural sound synthesis, spatial PositionalAudio binding, and mobile touch haptics for interactive automotive GLBs.
---

# Skill: Audio-Haptic Binding for Interactive Automotive GLBs

## 1. Architectural Philosophy & Physical Sound Design

An interactive Class-A automotive digital twin is only half complete if visual articulation lacks tactile acoustic feedback. Real high-performance automobiles are defined by mechanical resonance:
- The crisp **titanium snap** of a CNC magnetic paddle shifter ($18\text{ms}$ rise, high-frequency $3.2\text{kHz}$ metallic transient).
- The weighty **spring-loaded thud** of a double-shear door latch sealing against triple rubber weatherstrips ($65\text{Hz}$ sub-bass air displacement).
- The high-torque **planetary gear whine** of an electric seat recline actuator ($850\text{Hz}$ harmonic hum with subtle pulse-width modulation).
- The sharp **bistable toggle snap** of an aerospace ignition safety switch ($4.5\text{kHz}$ latching transient).
- The high-pressure **pneumatic hiss** of an active aerodynamic DRS wing actuator releasing air ($12\text{kHz}$ band-pass white noise).

### The Zero-Asset Procedural Audio Principle
Rather than bloating GLB models or web applications with 50+ megabytes of uncompressed WAV/MP3 files, **all basic mechanical sounds can be synthesized procedurally in real-time via the browser's Web Audio API** or linked to high-definition spatial audio buffers through standardized `node.extras.sound_fx` and `node.extras.haptic` metadata embedded in the GLB.

---

## 2. Standardized glTF Extras Schema for Audio & Haptics

Every interactive node or hitbox in the 3D asset embeds this JSON dictionary in its glTF `extras` (accessible in Three.js via `node.userData`):

```json
{
  "interactive": true,
  "option_id": "INTERIOR_PADDLE_SHIFT_UP",
  "control_type": "momentary_trigger",
  "action_name": "Action_Paddle_Shift_R_Click",
  "sound_fx": {
    "type": "mechanical_click",
    "preset": "magnetic_paddle",
    "frequency": 3200,
    "decay_ms": 28,
    "volume": 0.85,
    "spatial": true,
    "rolloff_factor": 1.5,
    "ref_distance": 0.4
  },
  "haptic": {
    "supported": true,
    "pattern": [22],
    "intensity": "sharp"
  }
}
```

### Supported Sound FX Types & Parameters
| Sound FX Type | Representative Automotive Component | Typical Frequency / Params | Haptic Vibration Pattern (`ms`) |
|:---|:---|:---|:---|
| `mechanical_click` | Paddle shifters, steering multifunction buttons | $2800\text{Hz} - 3800\text{Hz}$, decay $18-35\text{ms}$ | `[18]` (single sharp pulse) |
| `heavy_relay` | Ignition start button, drive mode Manettino dial | $800\text{Hz} \rightarrow 140\text{Hz}$ chirp, decay $55\text{ms}$ | `[35]` (firm tactile click) |
| `motor_hum` | Power window descent, seat recline / slider | $420\text{Hz} + 840\text{Hz}$ dual sine, duration dynamic | `[15, 30, 15, 30]` (continuous micro-vibration) |
| `door_thud` | Door slam, hood clamshell closure, trunk latch | $75\text{Hz}$ sine burst + $1.2\text{kHz}$ latch click | `[60, 20, 40]` (double acoustic impact) |
| `pneumatic_vent` | Active DRS rear wing actuation, suspension lift | $8\text{kHz} - 12\text{kHz}$ bandpass noise, decay $180\text{ms}$ | `[40]` (air pressure burst) |
| `ceramic_squeak`| Carbon ceramic brake bed-in, friction bite | $4.8\text{kHz}$ resonance sweep | `[10, 15, 10]` (fine gravel texture) |

---

## 3. Web Audio API Procedural Synthesizer (Zero-Dependency)

This production TypeScript / JavaScript module synthesizes authentic automotive tactile acoustic transients in real-time with zero external audio files:

```typescript
/**
 * Automotive Procedural Audio & Haptic Engine
 * Synthesizes mechanical clicks, motor hums, relay snaps, and door thuds on-the-fly.
 */
export class AutomotiveAudioHapticEngine {
  private ctx: AudioContext | null = null;
  private activeMotors = new Map<string, { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode }>();

  public init(): void {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  /**
   * Trigger sound and haptics based on GLB node metadata
   */
  public triggerFromExtras(extras: { sound_fx?: any; haptic?: any }, sourcePosition?: [number, number, number]): void {
    this.init();
    if (!this.ctx) return;

    // 1. Mobile touch haptic feedback
    if (extras.haptic?.supported && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(extras.haptic.pattern || [20]);
      } catch (e) {
        // Haptics not allowed or unsupported
      }
    }

    // 2. Procedural Sound Generation
    const sfx = extras.sound_fx;
    if (!sfx) return;

    const t = this.ctx.currentTime;
    const vol = sfx.volume ?? 0.8;

    switch (sfx.type) {
      case 'mechanical_click': {
        // High transient burst + bandpass noise
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const freq = sfx.frequency ?? 3200;
        const decay = (sfx.decay_ms ?? 25) / 1000;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.4, t + decay);

        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + decay);
        break;
      }

      case 'heavy_relay': {
        // Heavy mechanical bistable snap
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const decay = (sfx.decay_ms ?? 45) / 1000;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(950, t);
        osc.frequency.exponentialRampToValueAtTime(120, t + decay);

        gain.gain.setValueAtTime(vol * 0.9, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + decay);
        break;
      }

      case 'door_thud': {
        // Dual component: High-frequency latch click + sub-bass chassis impulse
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(80, t);
        subOsc.frequency.exponentialRampToValueAtTime(35, t + 0.12);

        subGain.gain.setValueAtTime(vol * 1.2, t);
        subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

        subOsc.connect(subGain);
        subGain.connect(this.ctx.destination);
        subOsc.start(t);
        subOsc.stop(t + 0.14);

        // Metal latch ping
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        clickOsc.type = 'triangle';
        clickOsc.frequency.setValueAtTime(2400, t);
        clickOsc.frequency.exponentialRampToValueAtTime(600, t + 0.03);

        clickGain.gain.setValueAtTime(vol * 0.7, t);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);

        clickOsc.connect(clickGain);
        clickGain.connect(this.ctx.destination);
        clickOsc.start(t);
        clickOsc.stop(t + 0.03);
        break;
      }

      case 'motor_start': {
        const id = extras.option_id ?? 'default_motor';
        if (this.activeMotors.has(id)) return;

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(420, t);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(840, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(vol * 0.4, t + 0.05);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(t);
        osc2.start(t);
        this.activeMotors.set(id, { osc1, osc2, gain });
        break;
      }

      case 'motor_stop': {
        const id = extras.option_id ?? 'default_motor';
        const motor = this.activeMotors.get(id);
        if (motor) {
          motor.gain.gain.setValueAtTime(motor.gain.gain.value, t);
          motor.gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
          motor.osc1.stop(t + 0.06);
          motor.osc2.stop(t + 0.06);
          this.activeMotors.delete(id);
        }
        break;
      }
    }
  }
}
```

---

## 4. Three.js Runtime Positional 3D Audio Binding

When high-fidelity pre-recorded audio stems (e.g. real twin-turbo exhaust revs or Bowers & Wilkins sound system audio) are desired, use `THREE.PositionalAudio` anchored directly to the 3D model hierarchy:

```typescript
import * as THREE from 'three';

export function setupVehicleSpatialAudio(
  scene: THREE.Group,
  camera: THREE.Camera,
  audioLoader: THREE.AudioLoader
): void {
  // 1. Exactly one listener on the active camera
  const listener = new THREE.AudioListener();
  camera.add(listener);

  // 2. Traverse scene and find nodes tagged with sound_fx
  scene.traverse((child) => {
    const extras = child.userData;
    if (extras && extras.sound_fx && extras.sound_fx.spatial) {
      const positionalSound = new THREE.PositionalAudio(listener);
      positionalSound.setRefDistance(extras.sound_fx.ref_distance ?? 0.5);
      positionalSound.setRolloffFactor(extras.sound_fx.rolloff_factor ?? 1.2);
      positionalSound.setMaxDistance(15.0);
      positionalSound.setDistanceModel('exponential');

      // Set directional cone for directed sources (exhaust tips, speakers)
      if (extras.sound_fx.cone) {
        positionalSound.setDirectionalCone(
          extras.sound_fx.cone.innerAngle ?? 90,
          extras.sound_fx.cone.outerAngle ?? 180,
          extras.sound_fx.cone.outerGain ?? 0.2
        );
      }

      child.add(positionalSound);
      child.userData.spatialAudioInstance = positionalSound;
    }
  });
}
```

---

## 5. Blender Python Scripting Snippet for Audio-Haptic Tagging

To embed audio-haptic metadata automatically into exported GLB models, attach custom properties in Blender before export:

```python
import bpy

def tag_audio_haptics(obj, option_id, action_name, sfx_type, freq=3200, decay_ms=25, haptic_ms=20):
    """Embeds standardized interactive audio-haptic metadata into glTF node extras."""
    obj["interactive"] = True
    obj["option_id"] = option_id
    obj["action_name"] = action_name
    obj["sound_fx"] = {
        "type": sfx_type,
        "frequency": freq,
        "decay_ms": decay_ms,
        "volume": 0.85,
        "spatial": True,
        "ref_distance": 0.5
    }
    obj["haptic"] = {
        "supported": True,
        "pattern": [haptic_ms],
        "intensity": "sharp"
    }

# Example Usage on Paddle Shifter and Door Hitbox
paddle_r = bpy.data.objects.get("HITBOX_Paddle_Shift_R")
if paddle_r:
    tag_audio_haptics(paddle_r, "STEERING_PADDLE_UP", "Action_Paddle_Shift_R_Click", "mechanical_click", 3400, 22, 18)

door_l = bpy.data.objects.get("HITBOX_Door_FL")
if door_l:
    tag_audio_haptics(door_l, "DOOR_FL_OPEN", "Action_Door_FL_Swing", "door_thud", freq=80, decay_ms=120, haptic_ms=45)
```

---

## 6. Validation Checklist for Audio-Haptic Conformance
- [ ] Every interactive element has `node.extras.sound_fx` defined.
- [ ] Mobile touch haptic duration pattern specified in `node.extras.haptic.pattern`.
- [ ] Procedural audio engine fallback runs seamlessly without external MP3/WAV dependencies.
- [ ] Spatial audio nodes inherit camera `AudioListener` without duplicate listener errors.
- [ ] User gesture unlocks `AudioContext` on first interaction.
