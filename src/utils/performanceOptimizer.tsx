// ====================================================================
// PERFORMANCE OPTIMIZER — Viewport Guards, Web Vitals, Reduced Motion
// ====================================================================
// Utilities to keep the app fast and responsive:
// - ViewportIntersectionObserver: pause off-screen 3D renders
// - WebVitals: track LCP, FID, CLS for performance monitoring
// - ReducedMotion: detect user preference and disable animations
// - IdleScheduler: defer non-critical work to idle periods
// - MemoryMonitor: warn on high VRAM usage
// ====================================================================

import { useEffect, useRef, useCallback, useState } from "react";

// --- VIEWPORT INTERSECTION OBSERVER ---
// Pauses expensive 3D renders when viewport is off-screen
export function useViewportVisibility(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold, rootMargin: "100px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// --- REDUCED MOTION DETECTION ---
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}

// --- IDLE SCHEDULER ---
// Defers non-critical work to browser idle periods
export function scheduleIdleWork(fn: () => void, timeout = 2000): void {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    (window as any).requestIdleCallback(fn, { timeout });
  } else {
    setTimeout(fn, 100);
  }
}

// --- VIEWPORT SIZE GUARD ---
// Returns false if viewport is too small for heavy 3D rendering
export function useIsSmallViewport(breakpoint = 768): boolean {
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const check = () => setIsSmall(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isSmall;
}

// --- FRAME BUDGET MONITOR ---
// Tracks if frames are exceeding budget (>16.67ms for 60fps)
export function useFrameBudgetMonitor(callback?: (fps: number) => void) {
  const frameRef = useRef({ lastTime: 0, frames: 0 });

  useEffect(() => {
    let rafId: number;
    const monitor = (time: number) => {
      const state = frameRef.current;
      state.frames++;

      if (time - state.lastTime >= 1000) {
        const fps = Math.round((state.frames * 1000) / (time - state.lastTime));
        callback?.(fps);
        state.frames = 0;
        state.lastTime = time;
      }

      rafId = requestAnimationFrame(monitor);
    };

    rafId = requestAnimationFrame(monitor);
    return () => cancelAnimationFrame(rafId);
  }, [callback]);
}

// --- MEMORY PRESSURE DETECTION ---
// Warns when available memory is low (useful for 3D apps)
export function useMemoryPressure(): { isLowMemory: boolean; usedMB: number } {
  const [state, setState] = useState({ isLowMemory: false, usedMB: 0 });

  useEffect(() => {
    const check = () => {
      if ("memory" in performance) {
        const mem = (performance as any).memory;
        const usedMB = Math.round(mem.usedJSHeapSize / (1024 * 1024));
        const totalMB = Math.round(mem.totalJSHeapSize / (1024 * 1024));
        setState({
          isLowMemory: usedMB > totalMB * 0.85,
          usedMB,
        });
      }
    };

    const interval = setInterval(check, 5000);
    check();
    return () => clearInterval(interval);
  }, []);

  return state;
}

// --- DEBOUNCED RESIZE ---
export function useDebouncedResize(delay = 150) {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const handler = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setSize({ width: window.innerWidth, height: window.innerHeight });
      }, delay);
    };
    window.addEventListener("resize", handler);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handler);
    };
  }, [delay]);

  return size;
}

// --- LAZY COMPONENT LOADER ---
// Wraps a lazy component to only load when visible in viewport
export function createLazyViewportComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = React.lazy(importFn);

  return function ViewportLazy(props: React.ComponentProps<T>) {
    const { ref, isVisible } = useViewportVisibility(0.05);
    const [hasBeenVisible, setHasBeenVisible] = useState(false);

    useEffect(() => {
      if (isVisible) setHasBeenVisible(true);
    }, [isVisible]);

    return (
      <div ref={ref} style={{ minHeight: hasBeenVisible ? undefined : 100 }}>
        {hasBeenVisible ? (
          <React.Suspense fallback={fallback || null}>
            <LazyComponent {...props} />
          </React.Suspense>
        ) : null}
      </div>
    );
  };
}

// --- PERFORMANCE METRICS COLLECTOR ---
export interface PerformanceMetrics {
  fps: number;
  memoryMB: number;
  domNodes: number;
  longTasks: number;
}

export function collectPerformanceMetrics(): PerformanceMetrics {
  return {
    fps: 0,
    memoryMB: "memory" in performance ? Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024)) : 0,
    domNodes: document.querySelectorAll("*").length,
    longTasks: 0,
  };
}

import React from "react";
