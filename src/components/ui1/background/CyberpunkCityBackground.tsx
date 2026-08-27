import React, { useEffect, useRef, useState } from "react";
import { NeonGridCanvas } from "./NeonGridCanvas";

export interface CyberpunkCityBackgroundProps {
  scene?: 1 | 2;
  particlesEnabled?: boolean;
  gridEnabled?: boolean;
  parallaxIntensity?: number;
}

export const CyberpunkCityBackground: React.FC<CyberpunkCityBackgroundProps> = ({
  scene = 1,
  particlesEnabled = true,
  gridEnabled = true,
  parallaxIntensity = 1,
}) => {
  const [bgLoaded, setBgLoaded] = useState(false);
  const bgRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const bgImageSrc = scene === 1 ? "/cyberpunk-city-bg-1.jpg" : "/cyberpunk-city-bg-2.jpg";

  // Preload background image
  useEffect(() => {
    const img = new Image();
    img.src = bgImageSrc;
    img.onload = () => setBgLoaded(true);
  }, [bgImageSrc]);

  // Smooth mouse-tracked 60/120FPS Lerp Parallax Effect with Idle Sleeping
  useEffect(() => {
    let animId: number | null = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isAnimating = false;

    const render = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      const diffX = Math.abs(targetX - currentX);
      const diffY = Math.abs(targetY - currentY);

      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(
          2
        )}px, 0) scale(1.04)`;
      }

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${(currentX * 1.6).toFixed(
          2
        )}px, ${(currentY * 1.6).toFixed(2)}px, 0)`;
      }

      if (diffX > 0.02 || diffY > 0.02) {
        animId = requestAnimationFrame(render);
      } else {
        isAnimating = false;
        animId = null;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      targetX = ((e.clientX - centerX) / centerX) * 16 * parallaxIntensity;
      targetY = ((e.clientY - centerY) / centerY) * 12 * parallaxIntensity;

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
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none bg-[#05080f]">
      {/* 1. City Panorama Image Layer (desaturated, quiet) */}
      <div
        ref={bgRef}
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 will-change-transform ${
 bgLoaded ? "opacity-45" : "opacity-0"
 }`}
        style={{
          backgroundImage: `url(${bgImageSrc})`,
          filter: "brightness(0.55) contrast(1.05) saturate(0.45)",
        }}
      />

      {/* 2. Cool Ambient Haze & Vignette Overlay */}
      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 75% 25%, rgba(127,181,216, 0.10), transparent 70%), radial-gradient(ellipse 60% 50% at 20% 75%, rgba(157,143,196, 0.07), transparent 65%), radial-gradient(circle at 50% 50%, transparent 40%, rgba(4, 7, 14, 0.90) 100%)",
        }}
      />

      {/* 3. Fine Engineering Grid Overlay */}
      {gridEnabled && <NeonGridCanvas />}

      {/* 4. Subtle Horizontal Scanline Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.12]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(255,255,255, 0.05) 50%, transparent 100%)",
          backgroundSize: "100% 8px",
        }}
      />

      {/* 5. Slow Ambient Sweep */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.07]">
        <div
          className="w-full h-32 bg-gradient-to-b from-transparent via-sky-200/25 to-transparent"
          style={{ animation: "nh-scan-line-sweep 14s linear infinite" }}
        />
      </div>
    </div>
  );
};
