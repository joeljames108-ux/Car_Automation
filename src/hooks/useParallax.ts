// useParallax.ts - Smooth parallax scrolling hook
import { useEffect, useRef, useState } from "react";

interface ParallaxOptions {
  speed?: number;
  direction?: "up" | "down" | "left" | "right";
  offset?: number;
  smooth?: boolean;
  smoothFactor?: number;
}

export function useParallax(options: ParallaxOptions = {}) {
  const { speed = 0.3, direction = "up", offset = 0, smooth = true, smoothFactor = 0.08 } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [offsetY, setOffsetY] = useState(0);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const animate = () => {
      if (smooth) {
        currentRef.current += (targetRef.current - currentRef.current) * smoothFactor;
        setOffsetY(currentRef.current);
        if (Math.abs(targetRef.current - currentRef.current) > 0.01) {
          rafRef.current = requestAnimationFrame(animate);
        }
      }
    };
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const delta = (elementCenter - viewportCenter) * speed + offset;
      targetRef.current = direction === "up" || direction === "left" ? -delta : delta;
      if (smooth) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setOffsetY(targetRef.current);
      }
    };
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => { onScroll(); ticking = false; });
        ticking = true;
      }
    };
    window.addEventListener("scroll", throttledScroll, { passive: true });
    window.addEventListener("resize", throttledScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", throttledScroll);
      window.removeEventListener("resize", throttledScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [speed, direction, offset, smooth, smoothFactor]);

  const transform = direction === "up" || direction === "down"
    ? "translateY(" + offsetY + "px)"
    : "translateX(" + offsetY + "px)";

  return { ref, transform, offsetY };
}

export function useMouseParallax(strength = 0.02) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    let raf = 0;
    const handler = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const cx = (e.clientX / window.innerWidth - 0.5) * 2;
        const cy = (e.clientY / window.innerHeight - 0.5) * 2;
        setPos({ x: cx * strength * 100, y: cy * strength * 100 });
      });
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => { window.removeEventListener("mousemove", handler); cancelAnimationFrame(raf); };
  }, [strength]);
  return pos;
}
