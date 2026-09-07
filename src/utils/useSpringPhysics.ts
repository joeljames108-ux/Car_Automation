import { useRef, useCallback, useEffect, useState } from 'react';

/**
 * ============================================================================
 * USE SPRING PHYSICS — Critically-damped spring interpolation
 * ============================================================================
 * Provides organic, overshooting transitions with mass/stiffness/damping tuning.
 * Used for stage cross-fades, scroll reveals, modal entrances, and more.
 *
 * API:
 *   useSpring(target, config?) → value
 *   useMultiSpring(targets[], config?) → values[]
 *   SPRING_PRESETS — ready-made configs for common motions
 * ============================================================================
 */

export interface SpringConfig {
  stiffness: number;   // k — higher = snappier
  damping: number;     // c — higher = less overshoot
  mass: number;        // m — higher = slower settle
  precision: number;   // stop threshold
}

export const SPRING_PRESETS: Record<string, SpringConfig> = {
  /** Gentle page transition — slight overshoot */
  gentle:       { stiffness: 120, damping: 14, mass: 1, precision: 0.001 },
  /** Stiff modal — fast snap with minimal overshoot */
  stiff:        { stiffness: 300, damping: 26, mass: 1, precision: 0.001 },
  /** Bouncy button press */
  bouncy:       { stiffness: 180, damping: 12, mass: 0.8, precision: 0.001 },
  /** Snappy dropdown */
  snappy:       { stiffness: 400, damping: 30, mass: 1, precision: 0.001 },
  /** Slow luxurious reveal */
  lazy:         { stiffness: 80,  damping: 12, mass: 1.2, precision: 0.001 },
  /** Wobbly playful */
  wobbly:       { stiffness: 150, damping: 10, mass: 0.8, precision: 0.001 },
  /** Stage cross-fade — smooth with slight overshoot */
  crossfade:    { stiffness: 200, damping: 22, mass: 1, precision: 0.001 },
  /** Slide in from side — carries momentum */
  slideIn:      { stiffness: 180, damping: 18, mass: 1, precision: 0.001 },
  /** Scroll reveal — gentle settle */
  scrollReveal: { stiffness: 100, damping: 16, mass: 1, precision: 0.001 },
  /** Counter tick — instant */
  counterTick:  { stiffness: 500, damping: 35, mass: 0.6, precision: 0.01 },
  /** Modal backdrop — quick fade */
  backdropFade: { stiffness: 250, damping: 24, mass: 0.8, precision: 0.001 },
  /** Elastic spring with overshoot */
  elastic:      { stiffness: 160, damping: 8,  mass: 0.6, precision: 0.001 },
};

const DEFAULT_SPRING: SpringConfig = SPRING_PRESETS.crossfade;

/**
 * Solve a critically-damped second-order spring ODE:
 *   mx'' + cx' + kx = 0
 * Returns a step function that advances one dt.
 */
function makeSpringSolver(config: SpringConfig) {
  const { stiffness: k, damping: c, mass: m } = config;
  const omega = Math.sqrt(k / m);           // natural frequency
  const zeta = c / (2 * Math.sqrt(k * m));  // damping ratio

  if (zeta < 1) {
    // Underdamped — oscillates
    const omegaD = omega * Math.sqrt(1 - zeta * zeta);
    const A = 1;
    const B = (zeta * omega) / omegaD;
    return (t: number) => {
      const decay = Math.exp(-zeta * omega * t);
      return 1 - decay * (A * Math.cos(omegaD * t) + B * Math.sin(omegaD * t));
    };
  } else if (zeta === 1) {
    // Critically damped
    return (t: number) => {
      const decay = Math.exp(-omega * t);
      return 1 - decay * (1 + omega * t);
    };
  } else {
    // Overdamped
    const s1 = -omega * (zeta + Math.sqrt(zeta * zeta - 1));
    const s2 = -omega * (zeta - Math.sqrt(zeta * zeta - 1));
    const A = s2 / (s2 - s1);
    const B = -s1 / (s2 - s1);
    return (t: number) => 1 - A * Math.exp(s1 * t) - B * Math.exp(s2 * t);
  }
}

/**
 * Estimate total spring duration (ms) — when value reaches precision of target.
 */
function estimateDuration(config: SpringConfig): number {
  const { stiffness: k, damping: c, mass: m } = config;
  const omega = Math.sqrt(k / m);
  const zeta = c / (2 * Math.sqrt(k * m));
  const freq = zeta < 1 ? omega * Math.sqrt(1 - zeta * zeta) : omega;
  const periods = zeta < 1 ? 4 : 2;
  return Math.min(2000, (periods / (freq / (2 * Math.PI))) * 1000 + 200);
}

/**
 * Hook: animates a single value toward a target using spring physics.
 * Returns the current interpolated value [0, 1].
 */
export function useSpring(
  target: number,
  config: Partial<SpringConfig> = {}
): number {
  const cfg = { ...DEFAULT_SPRING, ...config };
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const toRef = useRef(target);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const solverRef = useRef<ReturnType<typeof makeSpringSolver> | null>(null);
  const durationRef = useRef(400);

  const animate = useCallback(() => {
    if (!startRef.current || !solverRef.current) return;
    const now = performance.now();
    const elapsed = (now - startRef.current) / 1000;
    const progress = solverRef.current(Math.min(elapsed, durationRef.current / 1000));
    const current = fromRef.current + (toRef.current - fromRef.current) * progress;
    setValue(current);
    if (Math.abs(progress - 1) > cfg.precision && elapsed * 1000 < durationRef.current) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      setValue(toRef.current);
      startRef.current = null;
    }
  }, [cfg.precision]);

  useEffect(() => {
    if (Math.abs(target - toRef.current) < cfg.precision) return;
    fromRef.current = value;
    toRef.current = target;
    solverRef.current = makeSpringSolver(cfg);
    durationRef.current = estimateDuration(cfg);
    startRef.current = performance.now();
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps

  return value;
}

/**
 * Hook: animates multiple independent values toward targets using spring physics.
 */
export function useMultiSpring(
  targets: number[],
  config: Partial<SpringConfig> = {}
): number[] {
  return targets.map((t) => useSpring(t, config));
}

/**
 * Utility: clamp a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Utility: map a value from one range to another.
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/**
 * Utility: interpolate between two values using spring progress [0,1].
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
