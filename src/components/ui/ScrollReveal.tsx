// ScrollReveal.tsx - Scroll-triggered animation wrapper component
import React, { memo } from "react";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { useParallax, useMouseParallax } from "../../hooks/useParallax";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "scale" | "fade";
  distance?: number;
  duration?: number;
  delay?: number;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  parallax?: boolean;
  parallaxSpeed?: number;
  mouseParallax?: boolean;
  mouseStrength?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = memo(({
  children, className = "", direction = "up", distance = 24, duration,
  delay, threshold, rootMargin, triggerOnce = true,
  parallax, parallaxSpeed = 0.15, mouseParallax, mouseStrength = 0.015,
}) => {
  const { ref, isVisible } = useScrollReveal({ threshold, rootMargin, triggerOnce, delay });
  const { transform: pTransform } = useParallax({ speed: parallaxSpeed, smooth: true });
  const mouse = useMouseParallax(mouseStrength);

  var transformVal = "none";
  var opacityVal = 1;
  if (!isVisible) {
    opacityVal = 0;
    if (direction === "up") transformVal = "translateY(" + distance + "px)";
    else if (direction === "down") transformVal = "translateY(-" + distance + "px)";
    else if (direction === "left") transformVal = "translateX(" + distance + "px)";
    else if (direction === "right") transformVal = "translateX(-" + distance + "px)";
    else if (direction === "scale") transformVal = "scale(0.95)";
  }

  var finalTransform = transformVal;
  if (parallax) finalTransform = pTransform;
  if (mouseParallax && mouse.x !== 0) finalTransform = "translate(" + mouse.x + "px, " + mouse.y + "px)";

  var dur = (duration || 500) + (delay || 0);
  var style: React.CSSProperties = {
    transform: finalTransform,
    opacity: opacityVal,
    transition: "all " + dur + "ms cubic-bezier(0.16, 1, 0.3, 1)",
    willChange: isVisible ? "auto" : "transform, opacity",
  };

  return React.createElement("div", { ref: ref as any, className: className, style: style }, children);
});

ScrollReveal.displayName = "ScrollReveal";

// GlassCardPro - Enhanced glass card with scroll reveal
interface GlassCardProProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const GlassCardPro: React.FC<GlassCardProProps> = memo(({
  children, className = "", delay = 0
}) => {
  const { ref, isVisible } = useScrollReveal({ delay, triggerOnce: true });
  var style: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateY(0)" : "translateY(20px)",
    transition: "all " + (500 + delay) + "ms cubic-bezier(0.16, 1, 0.3, 1)",
    willChange: isVisible ? "auto" : "transform, opacity",
  };
  return (
    <div
      ref={ref}
      className={"relative overflow-hidden rounded-2xl border border-white/[0.08] " +
        "bg-gradient-to-br from-amber-900/60/65 to-slate-950/75 " +
        "backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] " +
        "transition-all duration-300 hover:border-white/[0.14] " + className}
      style={style}
    >
      {children}
    </div>
  );
});

GlassCardPro.displayName = "GlassCardPro";

// ParallaxSection - Section with parallax background
interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  bgClassName?: string;
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = memo(({
  children, className = "", speed = 0.2, bgClassName = ""
}) => {
  const { ref, transform } = useParallax({ speed, smooth: true, smoothFactor: 0.06 });
  return (
    <div ref={ref} className={"relative overflow-hidden " + className}>
      <div
        className={"absolute inset-0 will-change-transform " + bgClassName}
        style={{ transform: transform }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
});

ParallaxSection.displayName = "ParallaxSection";
