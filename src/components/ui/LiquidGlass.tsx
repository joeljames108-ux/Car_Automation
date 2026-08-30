"use client";

/**
 * @name: Liquid Glass System (Kokonut UI / Vision Pro Glass Refraction)
 * @description: Ultra-realistic refractive liquid glass cards, haptic buttons, dynamic SVG displacement filters, and audio/notification widget.
 * @license: MIT
 */

import React, { useState, useEffect, useRef, useId, memo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  Zap,
  Check,
  Disc3,
  Activity,
} from "lucide-react";

// ============================================================================
// CONSTANTS & MULTI-TIER SPECULAR INSET SHADOWS
// ============================================================================
export const GLASS_SHADOW_LIGHT =
  "shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)]";

export const GLASS_SHADOW_DARK =
  "dark:shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.09),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)]";

export const GLASS_SHADOW = `${GLASS_SHADOW_LIGHT} ${GLASS_SHADOW_DARK}`;

export const DEFAULT_GLASS_FILTER_SCALE = 30;
export const BUTTON_GLASS_FILTER_SCALE = 70;

// Helper to concatenate conditional class names
function cls(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ============================================================================
// 1. SVG REFRACTIVE DISPLACEMENT FILTER
// ============================================================================
export interface GlassFilterProps {
  id: string;
  scale?: number;
  baseFrequency?: string;
  numOctaves?: number;
}

export const GlassFilter = memo(
  ({
    id,
    scale = DEFAULT_GLASS_FILTER_SCALE,
    baseFrequency = "0.05 0.05",
    numOctaves = 1,
  }: GlassFilterProps) => (
    <svg aria-hidden="true" className="hidden" focusable={false}>
      <title>Liquid Glass Optical Refraction Filter</title>
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          height="200%"
          id={id}
          width="200%"
          x="-50%"
          y="-50%"
        >
          <feTurbulence
            baseFrequency={baseFrequency}
            numOctaves={numOctaves}
            result="turbulence"
            seed="1"
            type="fractalNoise"
          />
          <feGaussianBlur
            in="turbulence"
            result="blurredNoise"
            stdDeviation="2"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            result="displaced"
            scale={scale}
            xChannelSelector="R"
            yChannelSelector="B"
          />
          <feGaussianBlur in="displaced" result="finalBlur" stdDeviation="4" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  )
);
GlassFilter.displayName = "GlassFilter";

// ============================================================================
// 2. LIQUID BUTTON COMPONENT
// ============================================================================
export interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  liquidVariant?: "default" | "ghost" | "outline" | "pill" | "glow" | "none";
  size?: "sm" | "default" | "lg" | "icon";
  glassScale?: number;
}

export function LiquidButton({
  className = "",
  liquidVariant = "default",
  size = "default",
  glassScale = BUTTON_GLASS_FILTER_SCALE,
  children,
  ...props
}: LiquidButtonProps) {
  const filterId = useId();

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs min-h-[32px] gap-1.5",
    default: "px-4 py-2 text-sm min-h-[40px] gap-2",
    lg: "px-5 py-2.5 text-base min-h-[48px] gap-2.5",
    icon: "h-10 w-10 p-0 flex items-center justify-center",
  }[size];

  const variantClasses = {
    default:
      "bg-white/10 dark:bg-white/5 text-slate-800 dark:text-slate-100 hover:bg-white/20 dark:hover:bg-white/10 active:scale-[0.97] hover:scale-105 border border-white/20 dark:border-white/10",
    ghost:
      "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.97] hover:scale-105",
    outline:
      "bg-transparent border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-[0.97]",
    pill:
      "rounded-full bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-500/30 hover:border-amber-400 active:scale-[0.97]",
    glow:
      "bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] active:scale-[0.97]",
    none: "",
  }[liquidVariant];

  return (
    <>
      <button
        className={cls(
          "relative inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 motion-reduce:transition-none motion-reduce:active:scale-100 motion-reduce:hover:scale-100",
          sizeClasses,
          variantClasses,
          className
        )}
        {...props}
      >
        {/* Layered Inset Specular Glass Shadow */}
        <div
          className={cls(
            "pointer-events-none absolute inset-0 rounded-[inherit]",
            GLASS_SHADOW
          )}
        />
        {/* SVG Liquid Backdrop Refraction */}
        <div
          className="pointer-events-none absolute inset-0 isolate -z-10 overflow-hidden rounded-[inherit]"
          style={{ backdropFilter: `url("#${filterId}") blur(8px)` }}
        />
        {/* Content Container */}
        <span className="relative z-10 flex items-center justify-center gap-1.5">
          {children}
        </span>
      </button>
      <GlassFilter id={filterId} scale={glassScale} />
    </>
  );
}

// ============================================================================
// 3. LIQUID GLASS CARD CONTAINER
// ============================================================================
export interface LiquidGlassCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  glassSize?: "sm" | "default" | "lg" | "none";
  glassEffect?: boolean;
  specularSweep?: boolean;
  variant?: "warm" | "cool" | "dark" | "neutral";
  scale?: number;
}

export function LiquidGlassCard({
  className = "",
  glassSize = "default",
  glassEffect = true,
  specularSweep = true,
  variant = "warm",
  scale = DEFAULT_GLASS_FILTER_SCALE,
  children,
  ...props
}: LiquidGlassCardProps) {
  const filterId = useId();

  const paddingClasses = {
    sm: "p-3.5",
    default: "p-5",
    lg: "p-8",
    none: "p-0",
  }[glassSize];

  const variantStyles = {
    warm: "border-amber-200/40 dark:border-amber-500/20 bg-gradient-to-br from-amber-50/40 via-white/30 to-amber-100/20 dark:from-zinc-900/60 dark:via-zinc-900/40 dark:to-black/80",
    cool: "border-sky-200/40 dark:border-sky-500/20 bg-gradient-to-br from-sky-50/40 via-white/30 to-sky-100/20 dark:from-zinc-900/60 dark:via-zinc-900/40 dark:to-black/80",
    dark: "border-zinc-800/80 bg-zinc-950/70 text-slate-100 shadow-2xl",
    neutral: "border-white/30 dark:border-white/10 bg-white/20 dark:bg-black/30",
  }[variant];

  return (
    <div
      className={cls(
        "group relative overflow-hidden rounded-3xl backdrop-blur-xl transition-all duration-300",
        paddingClasses,
        variantStyles,
        className
      )}
      {...props}
    >
      {/* Specular Multi-Tier Inset Glass Shadows */}
      <div
        className={cls(
          "pointer-events-none absolute inset-0 rounded-[inherit]",
          GLASS_SHADOW
        )}
      />

      {/* Optical Displacement Refraction */}
      {glassEffect && (
        <>
          <div
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]"
            style={{
              backdropFilter: `url("#${filterId}") blur(20px) saturate(180%)`,
              WebkitBackdropFilter: `url("#${filterId}") blur(20px) saturate(180%)`,
            }}
          />
          <GlassFilter id={filterId} scale={scale} />
        </>
      )}

      {/* Primary Content */}
      <div className="relative z-10">{children}</div>

      {/* Dynamic Specular Light Sweep Sheen on Hover */}
      {specularSweep && (
        <div className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 motion-reduce:transition-none dark:via-white/5" />
      )}
    </div>
  );
}

// ============================================================================
// 4. ANIMATED VOLUME & TELEMETRY EQUALIZER BARS
// ============================================================================
const VOLUME_BAR_COUNT = 8;
const STATIC_BAR_HEIGHT = "6px";
const BAR_DELAY_INCREMENT = 0.08;

export interface VolumeBarsProps {
  isPlaying: boolean;
  barCount?: number;
  gradient?: string;
}

export const VolumeBars = memo(
  ({
    isPlaying,
    barCount = VOLUME_BAR_COUNT,
    gradient = "linear-gradient(to top, #FF2E55, #FF6B88)",
  }: VolumeBarsProps) => {
    const bars = Array.from({ length: barCount }, (_, i) => ({
      id: `volume-bar-${i}`,
      delay: (i % 4) * BAR_DELAY_INCREMENT,
    }));

    return (
      <div
        className="pointer-events-none flex h-8 w-11 items-end justify-center gap-0.5 shrink-0"
        aria-hidden="true"
      >
        {bars.map((bar) => (
          <div
            key={bar.id}
            className={cls(
              "w-[3px] rounded-full transition-all duration-300",
              isPlaying && "animate-bounce-music motion-reduce:animate-none"
            )}
            style={{
              height: isPlaying ? undefined : STATIC_BAR_HEIGHT,
              animationDelay: `${bar.delay}s`,
              background: gradient,
            }}
          />
        ))}
      </div>
    );
  }
);
VolumeBars.displayName = "VolumeBars";

// ============================================================================
// 5. INTERACTIVE TIMELINE PROGRESS SLIDER
// ============================================================================
const MIN_TIME = 0;
const SEEK_JUMP_SECONDS = 5;
const PROGRESS_PERCENTAGE_MULTIPLIER = 100;

export const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export interface ProgressBarProps {
  currentTime: number;
  totalDuration: number;
  onSeek: (newTime: number) => void;
  accentGradient?: string;
}

export const ProgressBar = memo(
  ({
    currentTime,
    totalDuration,
    onSeek,
    accentGradient = "from-[#FF2E55] to-[#FF6B88]",
  }: ProgressBarProps) => {
    const progress =
      totalDuration > 0
        ? (currentTime / totalDuration) * PROGRESS_PERCENTAGE_MULTIPLIER
        : 0;

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = e.currentTarget;
      const rect = bar.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const percent = x / rect.width;
      const newTime = Math.min(
        Math.max(MIN_TIME, percent * totalDuration),
        totalDuration
      );
      onSeek(newTime);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          onSeek(Math.min(currentTime + SEEK_JUMP_SECONDS, totalDuration));
          break;
        case "ArrowLeft":
          e.preventDefault();
          onSeek(Math.max(currentTime - SEEK_JUMP_SECONDS, MIN_TIME));
          break;
        case "Home":
          e.preventDefault();
          onSeek(MIN_TIME);
          break;
        case "End":
          e.preventDefault();
          onSeek(totalDuration);
          break;
        default:
          break;
      }
    };

    return (
      <div className="space-y-1.5 select-none">
        <div className="flex justify-between font-mono text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
          <span className="tabular-nums">{formatTime(currentTime)}</span>
          <span className="tabular-nums">{formatTime(totalDuration)}</span>
        </div>
        <div
          aria-label="Seek progress bar"
          aria-valuemax={totalDuration}
          aria-valuemin={MIN_TIME}
          aria-valuenow={currentTime}
          aria-valuetext={`${formatTime(currentTime)} of ${formatTime(totalDuration)}`}
          className="group relative z-10 h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-zinc-300/60 dark:bg-zinc-800/80 transition-all hover:h-2.5"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role="slider"
          tabIndex={0}
        >
          <div
            className={cls(
              "h-full rounded-full bg-gradient-to-r transition-all duration-150",
              accentGradient
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }
);
ProgressBar.displayName = "ProgressBar";

// ============================================================================
// 6. APEX NOTIFICATION & AUDIO MEDIA WIDGET
// ============================================================================
export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl: string;
  badge?: string;
  type: "music" | "telemetry" | "engine" | "radio";
  gradient?: string;
  accentGradient?: string;
}

const DEFAULT_TRACKS: AudioTrack[] = [
  {
    id: "glow",
    title: "Glow",
    artist: "Echo",
    album: "Vision Lounge",
    duration: 45,
    coverUrl:
      "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/portrait2-x5MjJSaQ9ed0HZrewEhH7TkZwjZ66K.jpeg",
    badge: "VISION AUDIO",
    type: "music",
    gradient: "linear-gradient(to top, #FF2E55, #FF6B88)",
    accentGradient: "from-[#FF2E55] to-[#FF6B88]",
  },
  {
    id: "v10_harmonic",
    title: "V10 Pure Acoustic Synth",
    artist: "Apex Dyno Lab",
    album: "Engine Harmonics 9,000 RPM",
    duration: 60,
    coverUrl: "",
    badge: "DYNO LAB",
    type: "engine",
    gradient: "linear-gradient(to top, #f59e0b, #fbbf24)",
    accentGradient: "from-amber-500 to-amber-400",
  },
  {
    id: "nordschleife_telemetry",
    title: "Nordschleife Track Radio",
    artist: "Apex Telemetry Stream",
    album: "Live Sector 3 Telemetry",
    duration: 90,
    coverUrl: "",
    badge: "CIRCUIT LIVE",
    type: "radio",
    gradient: "linear-gradient(to top, #0ea5e9, #38bdf8)",
    accentGradient: "from-sky-500 to-sky-400",
  },
];

export interface NotificationCenterProps {
  className?: string;
  tracks?: AudioTrack[];
  onTrackChange?: (track: AudioTrack) => void;
  titleOverride?: string;
}

export function NotificationCenter({
  className = "",
  tracks = DEFAULT_TRACKS,
  onTrackChange,
  titleOverride,
}: NotificationCenterProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // Pause interval when scrolled out of view to save CPU
  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "100px" }
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // Tick interval for simulated playback
  useEffect(() => {
    if (!isPlaying || !isVisible) return;

    const intervalId = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev + 1 >= currentTrack.duration) {
          return currentTrack.duration;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isPlaying, isVisible, currentTrack.duration]);

  // Stop when reaching track end
  useEffect(() => {
    if (currentTime >= currentTrack.duration) {
      setIsPlaying(false);
    }
  }, [currentTime, currentTrack.duration]);

  const handlePlayPause = () => {
    if (currentTime >= currentTrack.duration) {
      setCurrentTime(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((prev) => !prev);
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (newTime < currentTrack.duration && !isPlaying) {
      setIsPlaying(true);
    }
  };

  const handleNextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIndex);
    setCurrentTime(0);
    setIsPlaying(true);
    onTrackChange?.(tracks[nextIndex]);
  };

  const handlePrevTrack = () => {
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrackIndex(prevIndex);
    setCurrentTime(0);
    setIsPlaying(true);
    onTrackChange?.(tracks[prevIndex]);
  };

  return (
    <div className={cls("w-full max-w-sm", className)} ref={rootRef}>
      <LiquidGlassCard
        className="rounded-3xl border border-zinc-200/60 bg-gradient-to-br from-zinc-50/80 to-zinc-100/90 p-4 shadow-xl dark:border-zinc-700/60 dark:from-zinc-900/90 dark:to-black/95"
        variant="neutral"
      >
        {/* Track Header & Album Art */}
        <div className="flex items-center gap-3 mb-3.5">
          {/* Dynamic Cover / Waveform Art */}
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-pink-400 via-rose-300 to-amber-200 shadow-md ring-1 ring-black/5 dark:shadow-xl dark:ring-white/10 flex items-center justify-center">
            {currentTrack.coverUrl ? (
              <img
                alt={currentTrack.title}
                className="h-full w-full object-cover"
                height={64}
                src={currentTrack.coverUrl}
                width={64}
                loading="lazy"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-2 text-center">
                {currentTrack.type === "engine" ? (
                  <Zap size={24} className="text-amber-800 dark:text-amber-200 animate-pulse" />
                ) : (
                  <Radio size={24} className="text-sky-800 dark:text-sky-200 animate-pulse" />
                )}
                <span className="text-[8px] font-mono font-black uppercase text-amber-900 dark:text-amber-100 mt-1">
                  {currentTrack.badge || "AUDIO"}
                </span>
              </div>
            )}

            {/* Glowing active indicator */}
            {isPlaying && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
            )}
          </div>

          {/* Track Metadata */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                {currentTrack.badge || "STEREO"}
              </span>
            </div>
            <h3 className="overflow-hidden text-ellipsis whitespace-nowrap font-bold text-base text-zinc-900 dark:text-white leading-tight mt-0.5">
              {titleOverride || currentTrack.title}
            </h3>
            <p className="overflow-hidden text-ellipsis whitespace-nowrap text-xs text-zinc-600 dark:text-zinc-400">
              {currentTrack.artist} • {currentTrack.album}
            </p>
          </div>

          {/* Equalizer Waveform Bars */}
          <VolumeBars
            isPlaying={isPlaying}
            gradient={currentTrack.gradient}
          />
        </div>

        {/* Scrubbable Progress Bar */}
        <div className="flex flex-col gap-2">
          <ProgressBar
            accentGradient={currentTrack.accentGradient}
            currentTime={currentTime}
            onSeek={handleSeek}
            totalDuration={currentTrack.duration}
          />

          {/* Liquid Control Buttons Bar */}
          <div className="mt-1 flex items-center justify-between">
            <div className="flex items-center justify-center gap-1.5">
              {/* Previous Track */}
              <LiquidButton
                aria-label="Previous track"
                className="h-10 w-10 rounded-full bg-transparent text-zinc-700 hover:bg-zinc-200/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
                liquidVariant="ghost"
                onClick={handlePrevTrack}
                size="icon"
                title="Previous Track"
              >
                <ArrowLeft className="h-4 w-4" />
              </LiquidButton>

              {/* Play / Pause Primary Button */}
              <LiquidButton
                aria-label={isPlaying ? "Pause" : "Play"}
                className="h-11 w-11 rounded-full bg-white/40 dark:bg-white/10 text-zinc-900 dark:text-zinc-100 hover:bg-white/60 dark:hover:bg-white/20 shadow-md"
                liquidVariant="default"
                onClick={handlePlayPause}
                size="icon"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                )}
              </LiquidButton>

              {/* Next Track */}
              <LiquidButton
                aria-label="Next track"
                className="h-10 w-10 rounded-full bg-transparent text-zinc-700 hover:bg-zinc-200/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
                liquidVariant="ghost"
                onClick={handleNextTrack}
                size="icon"
                title="Next Track"
              >
                <ArrowRight className="h-4 w-4" />
              </LiquidButton>
            </div>

            {/* Mode / Preset Switcher */}
            <LiquidButton
              aria-label="Cycle Track Mode"
              className="h-10 w-10 rounded-full bg-transparent text-zinc-700 hover:bg-zinc-200/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
              liquidVariant="ghost"
              onClick={handleNextTrack}
              size="icon"
              title="Next Audio Channel"
            >
              <MoreHorizontal className="h-4 w-4" />
            </LiquidButton>
          </div>
        </div>
      </LiquidGlassCard>
    </div>
  );
}

export default NotificationCenter;
