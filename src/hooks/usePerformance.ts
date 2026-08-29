// usePerformance.ts — Performance optimization utilities
import { useRef, useCallback, useEffect, useState } from "react";

// RAF-throttled callback
export function useRAFThrottle(callback: (...args: any[]) => void) {
  const rafRef = useRef(0);
  const lastArgs = useRef<any[]>([]);
  return useCallback((...args: any[]) => {
    lastArgs.current = args;
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        callback(...lastArgs.current);
        rafRef.current = 0;
      });
    }
  }, [callback]);
}

// Debounced value
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

// Lazy visible — only renders when near viewport
export function useLazyVisible(margin = "200px") {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin: margin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [margin]);
  return { ref, visible };
}
