// useScrollReveal.ts — IntersectionObserver-based scroll animation hook
import { useEffect, useRef, useState, useCallback } from "react";

export interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "scale" | "fade";
  distance?: number;
}

interface ScrollRevealResult {
  ref: React.RefObject<HTMLDivElement>;
  isVisible: boolean;
  progress: number;
}

export function useScrollReveal(options: ScrollRevealOptions = {}): ScrollRevealResult {
  const { threshold = 0.15, rootMargin = "0px 0px -50px 0px", triggerOnce = true, delay = 0 } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          setProgress(Math.min(entry.intersectionRatio / threshold, 1));
          if (triggerOnce) observer.unobserve(el);
        } else {
          if (!triggerOnce) setIsVisible(false);
        }
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.5, 0.7, 1.0], rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce, delay]);

  return { ref, isVisible, progress };
}

export function useScrollRevealGroup(count: number, staggerMs = 80, options: ScrollRevealOptions = {}) {
  const refs = Array.from({ length: count }, () => useRef<HTMLDivElement>(null));
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set());

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    refs.forEach((ref, i) => {
      if (!ref.current) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => setVisibleSet(prev => new Set(prev).add(i)), i * staggerMs);
            obs.unobserve(entry.target);
          }
        },
        { threshold: options.threshold || 0.1, rootMargin: options.rootMargin || "0px 0px -30px 0px" }
      );
      obs.observe(ref.current);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [count, staggerMs]);

  return { refs, visibleSet };
}
