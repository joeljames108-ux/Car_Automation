// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — REACT THREE FIBER ANIMATION HOOKS
// ============================================================================
// Provides reactive React hooks integrating the SnapAnimationEngine with R3F
// useFrame rendering loop, smooth exploded view transitions, and hover pulses.
// ============================================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { globalAnimationEngine, EasingFunctions } from './snapAnimationEngine';
import { globalAssemblyEngine } from '../core/assemblyEngine';
import type { ComponentInstance3D } from '../types';

/**
 * Primary R3F frame ticker hook. Place once inside any `<Canvas>` child component
 * to drive all active component assembly, snapping, and removal animations.
 */
export function useSnapAnimationTicker(): void {
  useFrame(() => {
    globalAnimationEngine.update(performance.now());
  });
}

/**
 * Reactive hook for tracking the live animation state and progress of an instance.
 */
export function useComponentInstanceAnimation(instanceId: string): {
  isAnimating: boolean;
  progress: number;
  state: string;
  opacity: number;
} {
  const [animState, setAnimState] = useState({
    isAnimating: false,
    progress: 1.0,
    state: 'installed',
    opacity: 1.0,
  });

  const lastUpdateRef = useRef<number>(0);

  useFrame(() => {
    const instance = globalAssemblyEngine.getInstanceById(instanceId);
    if (!instance) return;

    // Only update React state when animating or state changed (throttle to 30fps for state)
    const now = performance.now();
    if (instance.isAnimating || now - lastUpdateRef.current > 33) {
      lastUpdateRef.current = now;
      setAnimState({
        isAnimating: instance.isAnimating,
        progress: instance.animationProgress,
        state: instance.state,
        opacity: instance.opacity,
      });
    }
  });

  return animState;
}

/**
 * Smoothly interpolates the exploded view slider amount over time.
 */
export function useSmoothExplodedTransition(): {
  currentAmount: number;
  animateTo: (targetAmount: number, durationMs?: number) => void;
  isTransitioning: boolean;
} {
  const [amount, setAmount] = useState<number>(globalAssemblyEngine.getExplodedAmount());
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const transitionRef = useRef<{
    startAmount: number;
    targetAmount: number;
    startTime: number;
    durationMs: number;
    active: boolean;
  }>({
    startAmount: 0,
    targetAmount: 0,
    startTime: 0,
    durationMs: 400,
    active: false,
  });

  const animateTo = useCallback((targetAmount: number, durationMs: number = 500) => {
    const current = globalAssemblyEngine.getExplodedAmount();
    transitionRef.current = {
      startAmount: current,
      targetAmount: Math.max(0, Math.min(1, targetAmount)),
      startTime: performance.now(),
      durationMs,
      active: true,
    };
    setIsTransitioning(true);
  }, []);

  useFrame(() => {
    const tData = transitionRef.current;
    if (!tData.active) return;

    const elapsed = performance.now() - tData.startTime;
    const rawT = Math.min(1.0, elapsed / tData.durationMs);
    const easeT = EasingFunctions.easeInOutCubic(rawT);

    const newAmount = tData.startAmount + (tData.targetAmount - tData.startAmount) * easeT;
    globalAssemblyEngine.setExplodedViewAmount(newAmount);
    setAmount(newAmount);

    if (rawT >= 1.0) {
      tData.active = false;
      setIsTransitioning(false);
    }
  });

  return {
    currentAmount: amount,
    animateTo,
    isTransitioning,
  };
}

/**
 * Hook for pulsing emissive highlight on hovered components.
 */
export function useHoverPulse(isHovered: boolean): number {
  const [intensity, setIntensity] = useState<number>(0);

  useFrame(() => {
    if (!isHovered) {
      if (intensity > 0) setIntensity(0);
      return;
    }

    const t = performance.now() * 0.005;
    const pulse = (Math.sin(t) + 1) * 0.5; // 0.0 to 1.0
    setIntensity(0.3 + pulse * 0.4);
  });

  return intensity;
}
