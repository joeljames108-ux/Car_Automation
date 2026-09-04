// =============================================================================
// useSpringPhysics — Advanced Spring Animation Engine
// Realistic spring dynamics: mass, stiffness, damping, precision
// =============================================================================

import { useRef, useCallback, useEffect, useState } from "react";

export interface SpringConfig {
  mass: number;
  stiffness: number;
  damping: number;
  precision: number;
  velocity: number;
  restSpeed: number;
  restDelta: number;
}

export interface SpringState {
  value: number;
  velocity: number;
  isAnimating: boolean;
  isAtRest: boolean;
  progress: number;
  timestamp: number;
}

export type SpringPreset = "gentle" | "stiff" | "bouncy" | "snappy" | "slow" | "wobbly" | "elastic" | "smooth" | "precise" | "default";

const SPRING_PRESETS: Record<SpringPreset, Partial<SpringConfig>> = {
  gentle:   { mass: 1.0, stiffness: 120, damping: 14 },
  stiff:    { mass: 1.0, stiffness: 300, damping: 24 },
  bouncy:   { mass: 1.0, stiffness: 180, damping: 12 },
  snappy:   { mass: 0.8, stiffness: 400, damping: 28 },
  slow:     { mass: 1.2, stiffness: 80,  damping: 10 },
  wobbly:   { mass: 1.0, stiffness: 150, damping: 6  },
  elastic:  { mass: 0.6, stiffness: 200, damping: 8  },
  smooth:   { mass: 1.0, stiffness: 100, damping: 20 },
  precise:  { mass: 0.5, stiffness: 500, damping: 35 },
  default:  { mass: 1.0, stiffness: 170, damping: 26 },
};

const DEFAULT_SPRING_CONFIG: SpringConfig = {
  mass: 1.0, stiffness: 170, damping: 26,
  precision: 0.01, velocity: 0,
  restSpeed: 0.5, restDelta: 0.01,
};

function solveSpring(current: number, target: number, config: SpringConfig, velocity: number, deltaTime: number): { value: number; velocity: number; atRest: boolean } {
  const { mass, stiffness, damping, restSpeed, restDelta } = config;
  const springForce = -stiffness * (current - target);
  const dampingForce = -damping * velocity;
  const acceleration = (springForce + dampingForce) / mass;
  const newVelocity = velocity + acceleration * deltaTime;
  const newValue = current + newVelocity * deltaTime;
  const displacement = Math.abs(newValue - target);
  const speed = Math.abs(newVelocity);
  const atRest = displacement < restDelta && speed < restSpeed;
  return { value: atRest ? target : newValue, velocity: atRest ? 0 : newVelocity, atRest };
}

export function createSpringConfig(preset: SpringPreset, overrides?: Partial<SpringConfig>): SpringConfig {
  return { ...DEFAULT_SPRING_CONFIG, ...SPRING_PRESETS[preset], ...overrides };
}

export interface UseSpringReturn {
  value: number;
  velocity: number;
  isAnimating: boolean;
  set: (target: number, config?: Partial<SpringConfig>) => void;
  setImmediate: (value: number) => void;
  reset: () => void;
  stop: () => void;
}

export function useSpring(initialValue: number = 0, preset: SpringPreset = "default"): UseSpringReturn {
  const [state, setState] = useState<SpringState>({ value: initialValue, velocity: 0, isAnimating: false, isAtRest: true, progress: 0, timestamp: Date.now() });
  const stateRef = useRef(state);
  const targetRef = useRef(initialValue);
  const configRef = useRef<SpringConfig>({ ...DEFAULT_SPRING_CONFIG, ...SPRING_PRESETS[preset] });
  const rafRef = useRef<number | null>(null);
  const startValueRef = useRef(initialValue);

  const animate = useCallback(() => {
    const now = Date.now();
    const dt = Math.min((now - stateRef.current.timestamp) / 1000, 0.064);
    const result = solveSpring(stateRef.current.value, targetRef.current, configRef.current, stateRef.current.velocity, dt);
    const totalDist = Math.abs(targetRef.current - startValueRef.current);
    const currentDist = Math.abs(result.value - targetRef.current);
    const progress = totalDist > 0 ? Math.max(0, Math.min(1, 1 - currentDist / totalDist)) : 1;
    const newState: SpringState = { value: result.value, velocity: result.velocity, isAnimating: !result.atRest, isAtRest: result.atRest, progress, timestamp: now };
    stateRef.current = newState;
    setState(newState);
    if (!result.atRest) rafRef.current = requestAnimationFrame(animate);
  }, []);

  const set = useCallback((target: number, config?: Partial<SpringConfig>) => {
    targetRef.current = target;
    startValueRef.current = stateRef.current.value;
    if (config) configRef.current = { ...configRef.current, ...config };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const setImmediate = useCallback((value: number) => {
    targetRef.current = value; startValueRef.current = value;
    const s: SpringState = { value, velocity: 0, isAnimating: false, isAtRest: true, progress: 1, timestamp: Date.now() };
    stateRef.current = s; setState(s);
  }, []);

  const reset = useCallback(() => setImmediate(initialValue), [initialValue, setImmediate]);
  const stop = useCallback(() => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } setState(prev => ({ ...prev, isAnimating: false })); }, []);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);
  return { value: state.value, velocity: state.velocity, isAnimating: state.isAnimating, set, setImmediate, reset, stop };
}