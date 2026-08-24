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

  // Smooth mouse-tracked 60FPS Lerp Parallax Effect
  useEffect(() => {
    let animId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      targetX = ((e.clientX - centerX) / centerX) * 16 * parallaxIntensity;
      targetY = ((e.clientY - centerY) / centerY) * 12 * parallaxIntensity;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const render = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

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

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [parallaxIntensity]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none bg-[#03060f]">
      {/* 1. Cyberpunk City Panorama Image Layer */}
      <div
        ref={bgRef}
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 will-change-transform ${
          bgLoaded ? "opacity-60" : "opacity-0"
        }`}
        style={{
          backgroundImage: `url(${bgImageSrc})`,
          filter: "brightness(0.75) contrast(1.1) saturate(1.25)",
        }}
      />

      {/* 2. Cyberpunk Volumetric Light Leaks & Vignette Overlay */}
      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 75% 25%, rgba(0, 229, 255, 0.18), transparent 70%), radial-gradient(ellipse 60% 50% at 20% 75%, rgba(224, 64, 251, 0.15), transparent 65%), radial-gradient(circle at 50% 50%, transparent 40%, rgba(3, 6, 15, 0.85) 100%)",
        }}
      />

      {/* 3. Sci-Fi Cyber Grid Overlay */}
      {gridEnabled && <NeonGridCanvas />}

      {/* 4. Horizontal Laser Scanline Sweep */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(0, 229, 255, 0.04) 50%, rgba(224, 64, 251, 0.06) 51%, transparent 100%)",
          backgroundSize: "100% 8px",
        }}
      />

      {/* 5. Moving Holographic Sweep Beam */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-15">
        <div
          className="w-full h-32 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent"
          style={{ animation: "nh-scan-line-sweep 12s linear infinite" }}
        />
      </div>
    </div>
  );
};
