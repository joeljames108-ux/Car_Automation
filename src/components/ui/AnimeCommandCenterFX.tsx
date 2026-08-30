import React, { useEffect, useRef, useState } from "react";
import { animate, createTimeline, stagger } from "animejs";

/**
 * Animated number counter using Anime.js v4
 */
export function AnimeNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const valRef = useRef<{ current: number }>({ current: value });

  useEffect(() => {
    const el = nodeRef.current;
    if (!el) return;

    const anim = animate(valRef.current, {
      current: value,
      duration: 750,
      ease: "outExpo",
      onUpdate: () => {
        if (el) {
          el.textContent = `${prefix}${valRef.current.current.toFixed(decimals)}${suffix}`;
        }
      },
    });

    return () => {
      anim.pause();
    };
  }, [value, decimals, prefix, suffix]);

  return (
    <span ref={nodeRef} className={className}>
      {prefix}{value.toFixed(decimals)}{suffix}
    </span>
  );
}

/**
 * Animated SVG Circuit Radar & Telemetry Trace using Anime.js v4
 */
export function AnimeCircuitRadar({
  className = "",
  speedKmh = 280,
  lateralG = 1.45,
  downforceKg = 520,
}: {
  className?: string;
  speedKmh?: number;
  lateralG?: number;
  downforceKg?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const sweepRef = useRef<SVGGElement>(null);
  const pulseRef = useRef<SVGCircleElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // 1. Radar Sweep Infinite Rotation
    let sweepAnim: any;
    if (sweepRef.current) {
      sweepAnim = animate(sweepRef.current, {
        rotate: [0, 360],
        duration: 3500,
        loop: true,
        ease: "linear",
        transformOrigin: "120px 120px",
      });
    }

    // 2. Pulse concentric rings
    let pulseAnim: any;
    if (pulseRef.current) {
      pulseAnim = animate(pulseRef.current, {
        r: [15, 95],
        opacity: [0.8, 0],
        duration: 2200,
        loop: true,
        ease: "outQuad",
      });
    }

    // 3. Track Circuit Path Dash drawing
    let pathAnim: any;
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength?.() || 600;
      pathRef.current.style.strokeDasharray = `${length}`;
      pathRef.current.style.strokeDashoffset = `${length}`;

      pathAnim = animate(pathRef.current, {
        strokeDashoffset: [length, 0],
        duration: 2400,
        ease: "inOutSine",
        alternate: true,
        loop: true,
      });
    }

    // 4. Staggered node entrance
    animate(svgRef.current.querySelectorAll(".radar-node"), {
      scale: [0, 1],
      opacity: [0, 1],
      delay: stagger(100, { start: 200 }),
      ease: "outBack",
      duration: 600,
    });

    return () => {
      sweepAnim?.pause();
      pulseAnim?.pause();
      pathAnim?.pause();
    };
  }, []);

  return (
    <div className={`relative flex flex-col items-center justify-center p-3 rounded-2xl bg-base-950/80 border border-amber-500/20 backdrop-blur-md overflow-hidden ${className}`}>
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-emerald-500/5 pointer-events-none" />

      <div className="w-full flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-[10px] font-mono font-bold text-amber-400 tracking-wider uppercase">
            ANIME.JS RADAR SCANNER
          </span>
        </div>
        <span className="text-[9px] font-mono text-amber-200/60 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
          60Hz TELEMETRY
        </span>
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 240 240"
        className="w-48 h-48 sm:w-56 sm:h-56 relative z-10"
      >
        <defs>
          <radialGradient id="radarSweepGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
          </radialGradient>
          <linearGradient id="circuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>

        {/* Concentric grid rings */}
        <circle cx="120" cy="120" r="100" fill="none" stroke="rgba(245,158,11,0.15)" strokeWidth="1" />
        <circle cx="120" cy="120" r="70" fill="none" stroke="rgba(245,158,11,0.12)" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="120" cy="120" r="40" fill="none" stroke="rgba(245,158,11,0.12)" strokeWidth="1" />
        <circle cx="120" cy="120" r="10" fill="none" stroke="rgba(245,158,11,0.3)" strokeWidth="1.5" />

        {/* Crosshairs */}
        <line x1="120" y1="10" x2="120" y2="230" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="2 4" />
        <line x1="10" y1="120" x2="230" y2="120" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="2 4" />

        {/* Pulsing Concentric Ring */}
        <circle ref={pulseRef} cx="120" cy="120" r="15" fill="none" stroke="#f59e0b" strokeWidth="1.5" />

        {/* Sweeping Radar Beam */}
        <g ref={sweepRef}>
          <path
            d="M 120 120 L 220 120 A 100 100 0 0 0 190.7 49.3 Z"
            fill="url(#radarSweepGrad)"
          />
          <line x1="120" y1="120" x2="220" y2="120" stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.8" />
        </g>

        {/* Racing Circuit Layout Curve */}
        <path
          ref={pathRef}
          d="M 50 140 C 40 80, 80 40, 140 45 C 190 50, 200 100, 185 150 C 170 190, 120 200, 85 185 C 60 175, 55 160, 50 140 Z"
          fill="none"
          stroke="url(#circuitGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Telemetry Sensor Waypoints / Nodes */}
        <g className="radar-node" transform="translate(140, 45)">
          <circle r="4" fill="#fbbf24" />
          <circle r="7" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.6" />
        </g>
        <g className="radar-node" transform="translate(185, 150)">
          <circle r="4" fill="#34d399" />
          <circle r="7" fill="none" stroke="#34d399" strokeWidth="1" opacity="0.6" />
        </g>
        <g className="radar-node" transform="translate(85, 185)">
          <circle r="4" fill="#38bdf8" />
          <circle r="7" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
        </g>
        <g className="radar-node" transform="translate(50, 140)">
          <circle r="4" fill="#ec4899" />
          <circle r="7" fill="none" stroke="#ec4899" strokeWidth="1" opacity="0.6" />
        </g>
      </svg>

      {/* Real-time telemetry readout pill bar */}
      <div className="grid grid-cols-3 gap-2 w-full mt-2 relative z-10 pt-2 border-t border-white/5 text-center">
        <div className="bg-black/30 rounded-lg py-1 px-1.5 border border-white/5">
          <div className="text-[8.5px] text-amber-200/60 font-mono">VELOCITY</div>
          <div className="text-xs font-mono font-bold text-amber-300">
            <AnimeNumber value={speedKmh} decimals={0} suffix=" km/h" />
          </div>
        </div>
        <div className="bg-black/30 rounded-lg py-1 px-1.5 border border-white/5">
          <div className="text-[8.5px] text-amber-200/60 font-mono">LATERAL G</div>
          <div className="text-xs font-mono font-bold text-emerald-300">
            <AnimeNumber value={lateralG} decimals={2} suffix=" G" />
          </div>
        </div>
        <div className="bg-black/30 rounded-lg py-1 px-1.5 border border-white/5">
          <div className="text-[8.5px] text-amber-200/60 font-mono">DOWNFORCE</div>
          <div className="text-xs font-mono font-bold text-sky-300">
            <AnimeNumber value={downforceKg} decimals={0} suffix=" N" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Custom React Hook to execute Anime.js v4 entrance & concept transitions
 */
export function useCommandCenterAnime(triggerKey: string | number) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Stagger all panels and stat tiles on mount or state switch
    const panels = containerRef.current.querySelectorAll(".cmd-animate-tile");
    if (panels.length > 0) {
      animate(panels, {
        opacity: [0, 1],
        translateY: [16, 0],
        scale: [0.97, 1],
        delay: stagger(35, { start: 50 }),
        duration: 650,
        ease: "outExpo",
      });
    }

    // Gentle bounce for notification icon
    const icons = containerRef.current.querySelectorAll(".cmd-icon-pulse");
    if (icons.length > 0) {
      animate(icons, {
        scale: [0.92, 1.08, 1],
        duration: 900,
        delay: stagger(60),
        ease: "outElastic(1, .6)",
      });
    }
  }, [triggerKey]);

  return containerRef;
}
