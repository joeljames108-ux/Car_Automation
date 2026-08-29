import React, { useEffect, useRef } from "react";

export interface CyberpunkCityBackgroundProps {
  scene?: 1 | 2;
  particlesEnabled?: boolean;
  gridEnabled?: boolean;
  parallaxIntensity?: number;
}

/**
 * Aurora Borealis Background — Nordic Frost variant.
 * Replaces cyberpunk city with flowing aurora curtains, arctic gradients,
 * and subtle frost particle effects. Pure CSS animations, no images needed.
 */
export const CyberpunkCityBackground: React.FC<CyberpunkCityBackgroundProps> = ({
  scene = 1,
  particlesEnabled = true,
  parallaxIntensity = 1,
}) => {
  const bgRef = useRef<HTMLDivElement>(null);
  const auroraRef = useRef<HTMLDivElement>(null);

  // Smooth mouse-tracked parallax
  useEffect(() => {
    let animId: number | null = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isAnimating = false;

    const render = () => {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      const diffX = Math.abs(targetX - currentX);
      const diffY = Math.abs(targetY - currentY);

      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0) scale(1.03)`;
      }
      if (auroraRef.current) {
        auroraRef.current.style.transform = `translate3d(${(currentX * 1.4).toFixed(2)}px, ${(currentY * 1.4).toFixed(2)}px, 0)`;
      }

      if (diffX > 0.02 || diffY > 0.02) {
        animId = requestAnimationFrame(render);
      } else {
        isAnimating = false;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetX = ((e.clientX - cx) / cx) * 20 * parallaxIntensity;
      targetY = ((e.clientY - cy) / cy) * 15 * parallaxIntensity;
      if (!isAnimating) {
        isAnimating = true;
        animId = requestAnimationFrame(render);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [parallaxIntensity]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none" style={{ background: "#070b14" }}>
      {/* 1. Deep Arctic Gradient Base */}
      <div
        ref={bgRef}
        className="absolute inset-0 will-change-transform"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 30% 0%, rgba(8, 24, 48, 1) 0%, transparent 60%),
            radial-gradient(ellipse 100% 70% at 80% 10%, rgba(12, 18, 40, 0.95) 0%, transparent 55%),
            radial-gradient(ellipse 90% 60% at 50% 100%, rgba(6, 12, 28, 0.9) 0%, transparent 50%),
            linear-gradient(180deg, #060a14 0%, #0a1428 30%, #0c1830 60%, #081020 100%)
          `,
        }}
      />

      {/* 2. Aurora Borealis Curtains — flowing color bands */}
      <div
        ref={auroraRef}
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{ opacity: 0.55 }}
      >
        {/* Primary aurora band — teal/emerald */}
        <div
          className="absolute w-full h-full"
          style={{
            background: `
              radial-gradient(ellipse 60% 25% at 40% 15%, rgba(40, 160, 120, 0.18) 0%, transparent 70%),
              radial-gradient(ellipse 50% 20% at 65% 12%, rgba(50, 140, 180, 0.14) 0%, transparent 65%),
              radial-gradient(ellipse 40% 15% at 55% 18%, rgba(80, 120, 200, 0.10) 0%, transparent 60%)
            `,
            animation: "aurora-drift-1 25s ease-in-out infinite alternate",
          }}
        />
        {/* Secondary aurora band — violet/magenta */}
        <div
          className="absolute w-full h-full"
          style={{
            background: `
              radial-gradient(ellipse 45% 18% at 70% 20%, rgba(120, 80, 160, 0.12) 0%, transparent 65%),
              radial-gradient(ellipse 35% 12% at 30% 25%, rgba(160, 80, 140, 0.08) 0%, transparent 55%)
            `,
            animation: "aurora-drift-2 30s ease-in-out infinite alternate-reverse",
          }}
        />
        {/* Tertiary — faint gold shimmer at horizon */}
        <div
          className="absolute w-full h-full"
          style={{
            background: `
              radial-gradient(ellipse 80% 8% at 50% 35%, rgba(196, 168, 96, 0.06) 0%, transparent 70%)
            `,
            animation: "aurora-drift-3 20s ease-in-out infinite alternate",
          }}
        />
      </div>

      {/* 3. Frost Particle Field — tiny drifting dots */}
      {particlesEnabled && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.3 }}>
          {Array.from({ length: 40 }, (_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${1 + (i % 3) * 0.5}px`,
                height: `${1 + (i % 3) * 0.5}px`,
                background: `rgba(${180 + (i % 4) * 20}, ${210 + (i % 3) * 10}, ${240 + (i % 2) * 15}, ${0.15 + (i % 5) * 0.05})`,
                left: `${(i * 2.5) % 100}%`,
                top: `${(i * 3.7) % 100}%`,
                animation: `frost-drift-${i % 4} ${18 + (i % 6) * 4}s ease-in-out infinite`,
                animationDelay: `${(i * 0.7) % 8}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* 4. Subtle Frost Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 65% 55% at 50% 50%, transparent 30%, rgba(6, 10, 20, 0.65) 100%)
          `,
        }}
      />

      {/* 5. Very faint frost line at top */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent 10%, rgba(95, 168, 200, 0.12) 50%, transparent 90%)",
        }}
      />

      {/* CSS Keyframes injected once */}
      <style>{`
        @keyframes aurora-drift-1 {
          0% { transform: translateX(-3%) translateY(0) scaleY(1); opacity: 0.55; }
          50% { transform: translateX(2%) translateY(-1%) scaleY(1.1); opacity: 0.65; }
          100% { transform: translateX(4%) translateY(1%) scaleY(0.95); opacity: 0.50; }
        }
        @keyframes aurora-drift-2 {
          0% { transform: translateX(3%) translateY(1%) scaleY(1); opacity: 0.45; }
          50% { transform: translateX(-2%) translateY(-0.5%) scaleY(1.15); opacity: 0.55; }
          100% { transform: translateX(-4%) translateY(0.5%) scaleY(0.9); opacity: 0.40; }
        }
        @keyframes aurora-drift-3 {
          0% { transform: translateX(0) translateY(0); opacity: 0.35; }
          100% { transform: translateX(5%) translateY(-0.5%); opacity: 0.50; }
        }
        @keyframes frost-drift-0 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(8px, -12px) rotate(90deg); }
          50% { transform: translate(-5px, -20px) rotate(180deg); }
          75% { transform: translate(12px, -8px) rotate(270deg); }
        }
        @keyframes frost-drift-1 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(-10px, -15px); }
          66% { transform: translate(6px, -25px); }
        }
        @keyframes frost-drift-2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(14px, -18px); }
        }
        @keyframes frost-drift-3 {
          0%, 100% { transform: translate(0, 0); }
          40% { transform: translate(-8px, -10px); }
          80% { transform: translate(10px, -22px); }
        }
      `}</style>
    </div>
  );
};
