import { useEffect, useRef, useState, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════
   NeonEntrance Hook — IntersectionObserver-based staggered reveal
   Returns a ref and visibility flag. Apply the entrance CSS class
   conditionally based on the isVisible state.
   ═══════════════════════════════════════════════════════════════════ */

export type NeonEntranceType =
  | "fade-up"
  | "glow-burst"
  | "scale-pop"
  | "slide-right"
  | "scan-reveal"
  | "glitch"
  | "line-draw"
  | "number-glow";

interface UseNeonEntranceOptions {
  /** CSS entrance animation type */
  type?: NeonEntranceType;
  /** Stagger delay index (0-based) — adds 80ms per index */
  stagger?: number;
  /** Root margin for IntersectionObserver */
  rootMargin?: string;
  /** Threshold for IntersectionObserver */
  threshold?: number;
  /** If true, animates every time it enters viewport (not just first) */
  repeat?: boolean;
  /** Delay in ms before animation starts */
  delay?: number;
}

const ANIM_MAP: Record<NeonEntranceType, string> = {
  "fade-up": "animate-nh-entrance-fade-up",
  "glow-burst": "animate-nh-entrance-glow-burst",
  "scale-pop": "animate-nh-entrance-scale-pop",
  "slide-right": "animate-nh-entrance-slide-right",
  "scan-reveal": "animate-nh-entrance-scan-reveal",
  "glitch": "animate-nh-entrance-glitch",
  "line-draw": "animate-nh-entrance-line-draw",
  "number-glow": "animate-nh-entrance-number-glow",
};

export function useNeonEntrance<T extends HTMLElement = HTMLDivElement>(
  options: UseNeonEntranceOptions = {}
) {
  const { type = "fade-up", stagger = 0, rootMargin = "0px 0px -40px 0px", threshold = 0.1, repeat = false, delay = 0 } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (repeat || !hasAnimated.current) {
            const totalDelay = delay + stagger * 80;
            if (totalDelay > 0) {
              setTimeout(() => setIsVisible(true), totalDelay);
            } else {
              setIsVisible(true);
            }
            hasAnimated.current = true;
          }
        } else if (repeat) {
          setIsVisible(false);
          hasAnimated.current = false;
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold, repeat, delay, stagger]);

  const animClass = isVisible ? ANIM_MAP[type] : "nh-entrance-hidden";
  const staggerClass = stagger > 0 ? "nh-stagger-" + Math.min(stagger, 8) : "";

  return { ref, isVisible, animClass, staggerClass };
}

/* ═══════════════════════════════════════════════════════════════════
   NeonEntrance Wrapper Component — drop-in animated container
   ═══════════════════════════════════════════════════════════════════ */

export function NeonEntrance({
  children,
  type = "fade-up",
  stagger = 0,
  delay = 0,
  className = "",
  as: Tag = "div",
  ...rest
}: {
  children: React.ReactNode;
  type?: NeonEntranceType;
  stagger?: number;
  delay?: number;
  className?: string;
  as?: React.ElementType;
} & React.HTMLAttributes<HTMLElement>) {
  const { ref, isVisible, animClass, staggerClass } = useNeonEntrance({ type, stagger, delay });
  return (
    <Tag
      ref={ref as any}
      className={[animClass, staggerClass, className].filter(Boolean).join(" ")}>
      {children}
    </Tag>
  );
}