import React, { ReactNode } from "react";
import { useScrollReveal } from "./hooks/useScrollAnimations";
import { useSpring, SPRING_PRESETS } from "./useSpringPhysics";

/**
 * ============================================================================
 * SCROLL REVEAL CARD — Spring-animated scroll entrance wrapper
 * ============================================================================
 * Wraps any content with IntersectionObserver-driven scroll reveal.
 * When the element enters the viewport, it springs into view with
 * configurable delay for staggered card sequences.
 *
 * Props:
 *   delay   — stagger delay in ms (0, 80, 160, etc.)
 *   spring  — spring preset name from SPRING_PRESETS
 *   direction — slide origin: "up" | "left" | "right" | "none"
 *   className — additional CSS classes
 *   children — content to animate
 * ============================================================================
 */

export interface ScrollRevealCardProps {
  children: ReactNode;
  delay?: number;
  spring?: keyof typeof SPRING_PRESETS;
  direction?: "up" | "left" | "right" | "none";
  className?: string;
}

export const ScrollRevealCard: React.FC<ScrollRevealCardProps> = ({
  children,
  delay = 0,
  spring = "scrollReveal",
  direction = "up",
  className = "",
}) => {
  const { ref, hasEntered } = useScrollReveal({ threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
  const progress = useSpring(hasEntered ? 1 : 0, SPRING_PRESETS[spring]);

  const offsets = {
    up:    { x: 0, y: 30 },
    left:  { x: -30, y: 0 },
    right: { x: 30, y: 0 },
    none:  { x: 0, y: 0 },
  };
  const { x: ox, y: oy } = offsets[direction];

  const style: React.CSSProperties = {
    opacity: progress,
    transform: "translateY(" + (oy * (1 - progress)) + "px) translateX(" + (ox * (1 - progress)) + "px) scale(" + (0.97 + 0.03 * progress) + ")",
    filter: "blur(" + ((1 - progress) * 4) + "px)",
    willChange: "transform, opacity, filter",
    transitionDelay: delay + "ms",
  };

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
};