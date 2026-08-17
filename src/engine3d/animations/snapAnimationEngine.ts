// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — 3D SNAP ANIMATION ENGINE
// ============================================================================
// Multi-phase parametric assembly animation pipeline featuring cubic Bezier
// trajectories, damped harmonic spring physics, quaternion slerp alignment,
// staggered multi-instance cascades, and impact audio event triggers.
// ============================================================================

import type { ComponentInstance3D, Vector3D, Euler3D, Transform3D } from '../types';
import { VectorMath, EulerMath, QuaternionMath, TransformMath } from '../types';

// ============================================================================
// 1. EASING & SPRING PHYSICS MATHEMATICAL FUNCTIONS
// ============================================================================

export const EasingFunctions = {
  linear: (t: number): number => t,

  easeOutQuad: (t: number): number => 1 - (1 - t) * (1 - t),

  easeOutCubic: (t: number): number => 1 - Math.pow(1 - t, 3),

  easeInOutCubic: (t: number): number =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

  easeOutQuart: (t: number): number => 1 - Math.pow(1 - t, 4),

  easeInOutQuart: (t: number): number =>
    t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,

  easeOutBack: (t: number, overshoot: number = 1.4): number => {
    const c1 = overshoot;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },

  dampedSpring: (t: number, frequency: number = 18, damping: number = 6): number => {
    if (t >= 1) return 1;
    return 1 - Math.exp(-damping * t) * Math.cos(frequency * t);
  },
};

// ============================================================================
// 2. ACTIVE ANIMATION TRACK INTERFACE
// ============================================================================

export interface ActiveAnimationTrack {
  instanceId: string;
  instance: ComponentInstance3D;
  type: 'install' | 'remove' | 'variant_swap' | 'explode';
  startTime: number;
  durationMs: number;
  progress: number;
  startTransform: Transform3D;
  targetTransform: Transform3D;
  approachTransform: Transform3D;
  onComplete?: () => void;
  onSoundTrigger?: (soundType: string) => void;
  soundTriggered: boolean;
}

// ============================================================================
// 3. MASTER SNAP ANIMATION CONTROLLER
// ============================================================================

export class SnapAnimationEngine {
  private activeTracks: Map<string, ActiveAnimationTrack> = new Map();
  private speedMultiplier: number = 1.0;

  constructor() {}

  public setSpeedMultiplier(multiplier: number): void {
    this.speedMultiplier = Math.max(0.1, Math.min(5.0, multiplier));
  }

  public getSpeedMultiplier(): number {
    return this.speedMultiplier;
  }

  /**
   * Enqueues a full 5-phase parametric snap-in assembly animation for an instance.
   */
  public startInstallAnimation(
    instance: ComponentInstance3D,
    delayMs: number = 0,
    onComplete?: () => void,
    onSoundTrigger?: (soundType: string) => void
  ): void {
    const duration = (instance.manifestRef.installAnimationDurationMs || 1000) / this.speedMultiplier;
    const startTransform = TransformMath.clone(instance.spawnTransform);
    const targetTransform = TransformMath.clone(instance.assembledTransform);

    // Compute intermediate approach point (above socket before final snap)
    const approachPos: Vector3D = {
      x: targetTransform.position.x,
      y: targetTransform.position.y,
      z: targetTransform.position.z + 0.08,
    };

    const approachTransform: Transform3D = {
      position: approachPos,
      rotation: { ...targetTransform.rotation },
      scale: VectorMath.one(),
    };

    instance.isAnimating = true;
    instance.state = 'spawning';
    instance.opacity = 0;

    const track: ActiveAnimationTrack = {
      instanceId: instance.instanceId,
      instance,
      type: 'install',
      startTime: performance.now() + delayMs,
      durationMs: duration,
      progress: 0,
      startTransform,
      targetTransform,
      approachTransform,
      onComplete,
      onSoundTrigger,
      soundTriggered: false,
    };

    this.activeTracks.set(instance.instanceId, track);
  }

  /**
   * Enqueues a reverse uninstallation fly-away animation.
   */
  public startRemoveAnimation(
    instance: ComponentInstance3D,
    delayMs: number = 0,
    onComplete?: () => void
  ): void {
    const duration = 600 / this.speedMultiplier;
    const startTransform = TransformMath.clone(instance.transform);
    const targetTransform = TransformMath.clone(instance.spawnTransform);

    instance.isAnimating = true;
    instance.state = 'removing';

    const track: ActiveAnimationTrack = {
      instanceId: instance.instanceId,
      instance,
      type: 'remove',
      startTime: performance.now() + delayMs,
      durationMs: duration,
      progress: 0,
      startTransform,
      targetTransform,
      approachTransform: startTransform,
      onComplete,
      soundTriggered: true,
    };

    this.activeTracks.set(instance.instanceId, track);
  }

  /**
   * Frame-by-frame ticker to advance all active animation tracks.
   * Call inside requestAnimationFrame or R3F useFrame.
   */
  public update(currentTime: number = performance.now()): void {
    const completedTrackIds: string[] = [];

    for (const [id, track] of this.activeTracks) {
      if (currentTime < track.startTime) {
        // Delayed track waiting to start
        continue;
      }

      const elapsed = currentTime - track.startTime;
      const rawProgress = Math.min(1.0, elapsed / track.durationMs);
      track.progress = rawProgress;
      track.instance.animationProgress = rawProgress;

      if (track.type === 'install') {
        this.evaluateInstallTrack(track, rawProgress);
      } else if (track.type === 'remove') {
        this.evaluateRemoveTrack(track, rawProgress);
      }

      if (rawProgress >= 1.0) {
        completedTrackIds.push(id);
      }
    }

    // Cleanup finished tracks
    for (const id of completedTrackIds) {
      const track = this.activeTracks.get(id);
      if (track) {
        track.instance.isAnimating = false;
        track.instance.state = track.type === 'install' ? 'installed' : 'removed';
        track.instance.opacity = track.type === 'install' ? 1.0 : 0.0;
        track.instance.transform = TransformMath.clone(track.targetTransform);

        if (track.onComplete) {
          track.onComplete();
        }
      }
      this.activeTracks.delete(id);
    }
  }

  private evaluateInstallTrack(track: ActiveAnimationTrack, t: number): void {
    const { instance, startTransform, approachTransform, targetTransform } = track;

    // ── PHASE 1: SPAWN (0.0 to 0.15) ──
    if (t < 0.15) {
      instance.state = 'spawning';
      const subT = t / 0.15;
      instance.opacity = subT;
      instance.transform.scale = VectorMath.lerp(
        startTransform.scale,
        VectorMath.one(),
        EasingFunctions.easeOutCubic(subT)
      );
      instance.transform.position = VectorMath.clone(startTransform.position);
    }
    // ── PHASE 2: TRAVELING (0.15 to 0.60) ──
    else if (t < 0.60) {
      instance.state = 'traveling';
      instance.opacity = 1.0;
      instance.transform.scale = VectorMath.one();

      const subT = (t - 0.15) / 0.45;
      const easeT = EasingFunctions.easeInOutCubic(subT);

      instance.transform.position = VectorMath.lerp(
        startTransform.position,
        approachTransform.position,
        easeT
      );
    }
    // ── PHASE 3: ALIGNING (0.60 to 0.80) ──
    else if (t < 0.80) {
      instance.state = 'aligning';
      const subT = (t - 0.60) / 0.20;
      const easeT = EasingFunctions.easeInOutQuart(subT);

      const qStart = QuaternionMath.fromEuler(startTransform.rotation);
      const qTarget = QuaternionMath.fromEuler(targetTransform.rotation);
      const qInterp = QuaternionMath.slerp(qStart, qTarget, easeT);

      instance.transform.rotation = QuaternionMath.toEuler(qInterp);
      instance.transform.position = VectorMath.clone(approachTransform.position);
    }
    // ── PHASE 4: SNAPPING (0.80 to 0.92) ──
    else if (t < 0.92) {
      instance.state = 'snapping';
      const subT = (t - 0.80) / 0.12;
      const easeT = EasingFunctions.easeOutCubic(subT);

      instance.transform.position = VectorMath.lerp(
        approachTransform.position,
        targetTransform.position,
        easeT
      );
      instance.transform.rotation = { ...targetTransform.rotation };

      // Trigger impact sound effect at moment of contact (t >= 0.88)
      if (!track.soundTriggered && subT >= 0.7) {
        track.soundTriggered = true;
        if (track.onSoundTrigger) {
          track.onSoundTrigger(instance.manifestRef.soundOnInstall);
        }
      }
    }
    // ── PHASE 5: SETTLING SPRING BOUNCE (0.92 to 1.0) ──
    else {
      instance.state = 'settling';
      const subT = (t - 0.92) / 0.08;
      const springFactor = EasingFunctions.dampedSpring(subT, 22, 8);

      // Micro vertical oscillation
      const bounceZ = (1 - springFactor) * 0.004;
      instance.transform.position = {
        x: targetTransform.position.x,
        y: targetTransform.position.y,
        z: targetTransform.position.z + bounceZ,
      };
      instance.transform.rotation = { ...targetTransform.rotation };
    }
  }

  private evaluateRemoveTrack(track: ActiveAnimationTrack, t: number): void {
    const { instance, startTransform, targetTransform } = track;
    const easeT = EasingFunctions.easeInOutCubic(t);

    instance.transform.position = VectorMath.lerp(startTransform.position, targetTransform.position, easeT);
    instance.opacity = 1.0 - t;
    instance.transform.scale = VectorMath.lerp(VectorMath.one(), { x: 0.1, y: 0.1, z: 0.1 }, t);
  }

  public skipAll(): void {
    for (const track of this.activeTracks.values()) {
      track.instance.isAnimating = false;
      track.instance.state = track.type === 'install' ? 'installed' : 'removed';
      track.instance.opacity = track.type === 'install' ? 1.0 : 0.0;
      track.instance.transform = TransformMath.clone(track.targetTransform);
      if (track.onComplete) track.onComplete();
    }
    this.activeTracks.clear();
  }
}

/** Global singleton instance */
export const globalAnimationEngine = new SnapAnimationEngine();
