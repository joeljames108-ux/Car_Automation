import React, { useEffect, useState, useRef, useCallback } from "react";

export interface AnimatedCounterProps {
  value: number; duration?: number; prefix?: string; suffix?: string;
  decimals?: number; className?: string; style?: React.CSSProperties;
  easing?: "linear" | "easeOut" | "easeInOut" | "spring"; separator?: boolean;
}

function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }
function easeSpring(t: number) { const c4 = (2 * Math.PI) / 3; return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1; }

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value, duration = 600, prefix = "", suffix = "", decimals = 0,
  className = "", style, easing = "easeOut", separator = true,
}) => {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0); const startTime = useRef(0); const rafRef = useRef<number>(0);
  const formatNumber = useCallback((n: number) => {
    const fixed = n.toFixed(decimals);
    if (!separator) return fixed;
    const parts = fixed.split(".");
    parts[0] = parts[0].replace(/B(?=(d{3})+(?!d))/g, ",");
    return parts.join(".");
  }, [decimals, separator]);
  useEffect(() => {
    fromRef.current = display; startTime.current = performance.now();
    const easeFn = easing === "spring" ? easeSpring : easing === "easeOut" ? easeOutCubic : (t: number) => t;
    const animate = (now: number) => {
      const progress = Math.min((now - startTime.current) / duration, 1);
      setDisplay(fromRef.current + (value - fromRef.current) * easeFn(progress));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration, easing]);
  return <span className={className} style={style} aria-live="polite">{prefix}{formatNumber(display)}{suffix}</span>;
};