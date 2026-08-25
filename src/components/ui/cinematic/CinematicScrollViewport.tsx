// ============================================================================
// CINEMATIC SCROLL-DRIVEN CONTENT VIEWPORT ENGINE (ENHANCED)
// ============================================================================
// Full-screen automotive engineering console viewport orchestrating
// continuous, bidirectional 3D layered transitions between consecutive
// content states (Screen 1 → Screen 2) driven directly by mouse wheel,
// trackpad gestures, keyboard navigation, and touch swipe.
// ============================================================================

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
} from "lucide-react";

export interface CinematicSceneConfig {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  component: React.ReactNode;
}

export interface CinematicScrollViewportProps {
  scenes: CinematicSceneConfig[];
  activeSceneIndex?: number;
  onSceneChange?: (index: number) => void;
  persistentHeader?: React.ReactNode;
  persistentFooter?: React.ReactNode;
  className?: string;
  scrollSensitivity?: number;
  enableMagneticSnap?: boolean;
}

export function CinematicScrollViewport({
  scenes,
  activeSceneIndex: controlledIndex,
  onSceneChange,
  persistentHeader,
  persistentFooter,
  className = "",
  scrollSensitivity = 0.0018,
  enableMagneticSnap = true,
}: CinematicScrollViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Normalized scroll timeline progress: 0.0 to (scenes.length - 1)
  const [progress, setProgress] = useState<number>(controlledIndex ?? 0);
  const targetProgressRef = useRef<number>(controlledIndex ?? 0);
  const currentProgressRef = useRef<number>(controlledIndex ?? 0);
  const animFrameIdRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lastTouchYRef = useRef<number>(0);
  const isInteractingRef = useRef<boolean>(false);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const totalScenes = scenes.length;
  const maxProgress = Math.max(0, totalScenes - 1);

  // Sync controlled index if provided
  useEffect(() => {
    if (controlledIndex !== undefined && controlledIndex !== Math.round(targetProgressRef.current)) {
      targetProgressRef.current = controlledIndex;
      triggerPhysics();
    }
  }, [controlledIndex]);

  // ── 1. Physics Animation Loop (Spring Interpolation & Damping) ──
  const updatePhysics = useCallback(() => {
    const target = targetProgressRef.current;
    const current = currentProgressRef.current;
    const diff = target - current;

    // Damped spring interpolation (smooth approach)
    if (Math.abs(diff) > 0.0005) {
      const step = diff * 0.14;
      const nextProgress = current + step;
      currentProgressRef.current = nextProgress;
      setProgress(nextProgress);

      const roundedIndex = Math.round(nextProgress);
      if (Math.abs(nextProgress - roundedIndex) < 0.02 && onSceneChange) {
        onSceneChange(roundedIndex);
      }

      animFrameIdRef.current = requestAnimationFrame(updatePhysics);
    } else {
      currentProgressRef.current = target;
      setProgress(target);
      animFrameIdRef.current = null;
    }
  }, [onSceneChange]);

  const triggerPhysics = useCallback(() => {
    if (animFrameIdRef.current === null) {
      animFrameIdRef.current = requestAnimationFrame(updatePhysics);
    }
  }, [updatePhysics]);

  // ── 2. Magnetic Snap Settling ──
  const snapToNearest = useCallback(() => {
    if (!enableMagneticSnap) return;
    const nearest = Math.round(targetProgressRef.current);
    targetProgressRef.current = Math.max(0, Math.min(maxProgress, nearest));
    triggerPhysics();
  }, [enableMagneticSnap, maxProgress, triggerPhysics]);

  // ── 3. Native Non-Passive Wheel & Trackpad Interceptor ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Find parent scroll container (e.g. .vision-glass-content)
    const scrollParent = container.closest(".vision-glass-content") || container.parentElement || container;

    const onNativeWheel = (e: Event) => {
      const wheelEvent = e as WheelEvent;
      // Intercept wheel to drive normalized timeline without page scrolling
      wheelEvent.preventDefault();
      wheelEvent.stopPropagation();

      isInteractingRef.current = true;
      if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);

      const delta = wheelEvent.deltaY * scrollSensitivity;
      const nextTarget = Math.max(0, Math.min(maxProgress, targetProgressRef.current + delta));
      targetProgressRef.current = nextTarget;
      triggerPhysics();

      interactionTimeoutRef.current = setTimeout(() => {
        isInteractingRef.current = false;
        snapToNearest();
      }, 200);
    };

    container.addEventListener("wheel", onNativeWheel, { passive: false });
    scrollParent.addEventListener("wheel", onNativeWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", onNativeWheel);
      scrollParent.removeEventListener("wheel", onNativeWheel);
    };
  }, [maxProgress, scrollSensitivity, snapToNearest, triggerPhysics]);

  // ── 4. Touch & Drag Scrub Handlers ──
  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    lastTouchYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const touchY = e.touches[0].clientY;
    const deltaY = lastTouchYRef.current - touchY;
    lastTouchYRef.current = touchY;

    const delta = deltaY * scrollSensitivity * 1.6;
    const nextTarget = Math.max(0, Math.min(maxProgress, targetProgressRef.current + delta));
    targetProgressRef.current = nextTarget;
    triggerPhysics();
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    snapToNearest();
  };

  // ── 5. Keyboard Navigation (Arrows / PageUp / PageDown) ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        targetProgressRef.current = Math.min(maxProgress, Math.floor(targetProgressRef.current) + 1);
        triggerPhysics();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        targetProgressRef.current = Math.max(0, Math.ceil(targetProgressRef.current) - 1);
        triggerPhysics();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [maxProgress, triggerPhysics]);

  // Jump directly to specific scene
  const goToScene = (index: number) => {
    targetProgressRef.current = Math.max(0, Math.min(maxProgress, index));
    triggerPhysics();
    if (onSceneChange) onSceneChange(index);
  };

  const activeSceneIndex = Math.round(progress);
  const activeScene = scenes[activeSceneIndex] || scenes[0];

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full flex flex-col select-none ${className}`}
      style={{ minHeight: "calc(100vh - 160px)" }}
    >
      {/* ── PERSISTENT APPLICATION HEADER / BLUEPRINT BANNER ── */}
      {persistentHeader && <div className="w-full shrink-0 z-30 mb-3">{persistentHeader}</div>}

      {/* ── CINEMATIC TIMELINE HUD CONTROL BAR ── */}
      <div className="w-full flex items-center justify-between gap-3 px-4 py-2 mb-3 rounded-2xl bg-base-950/80 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] z-20">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
            <Layers size={14} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-extrabold text-cyan-400 uppercase tracking-widest">
                CINEMATIC VIEWPORT TIMELINE
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-mono font-bold border border-cyan-500/30">
                STATE 0{activeSceneIndex + 1} / 0{totalScenes}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              {activeScene?.icon}
              {activeScene?.title}
            </span>
          </div>
        </div>

        {/* Scene Switcher Beads & Timeline Progress Scrub */}
        <div className="flex items-center gap-3">
          {/* Quick Scene Jump Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10">
            {scenes.map((s, idx) => {
              const isActive = Math.abs(progress - idx) < 0.45;
              return (
                <button
                  key={s.id}
                  onClick={() => goToScene(idx)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.6)] font-extrabold scale-105"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <span className="text-[10px]">0{idx + 1}</span>
                  <span className="hidden sm:inline">{s.title}</span>
                </button>
              );
            })}
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToScene(Math.max(0, activeSceneIndex - 1))}
              disabled={activeSceneIndex === 0}
              className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                activeSceneIndex > 0
                  ? "bg-base-900 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
                  : "bg-base-950/40 border-white/5 text-slate-600 cursor-not-allowed"
              }`}
              title="Previous Content State (Scroll Up / PageUp)"
            >
              <ChevronUp size={14} />
            </button>
            <button
              onClick={() => goToScene(Math.min(maxProgress, activeSceneIndex + 1))}
              disabled={activeSceneIndex >= maxProgress}
              className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                activeSceneIndex < maxProgress
                  ? "bg-base-900 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
                  : "bg-base-950/40 border-white/5 text-slate-600 cursor-not-allowed"
              }`}
              title="Next Content State (Scroll Down / PageDown)"
            >
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN 3D MULTI-LAYER VIEWPORT CANVAS ── */}
      <div
        ref={viewportRef}
        className="relative w-full flex-1 perspective-[1200px]"
        style={{
          perspective: "1200px",
          minHeight: "680px",
        }}
      >
        {scenes.map((scene, index) => {
          const delta = progress - index;
          const absDelta = Math.abs(delta);

          const isVisible = absDelta < 1.4;
          if (!isVisible) return null;

          // ── Layered Cinematic Mathematical Transforms ──
          const scale = 1.0 - Math.min(0.04, absDelta * 0.04);
          const opacity = Math.max(0, Math.min(1, 1 - Math.pow(absDelta, 1.2)));
          const translateY = delta * -40; // Pixels
          const translateZ = -absDelta * 120; // Depth Pixels
          const rotateX = delta * 1.8; // Perspective tilt in degrees
          const blur = absDelta > 0.05 ? Math.min(3, absDelta * 3) : 0; // Micro transient blur

          const pointerEvents = absDelta < 0.25 ? "auto" : "none";
          const zIndex = Math.round(100 - absDelta * 50);

          return (
            <div
              key={scene.id}
              className="absolute inset-0 w-full h-full will-change-transform transition-none"
              style={{
                transform: `translate3d(0, ${translateY}px, ${translateZ}px) scale(${scale}) rotateX(${rotateX}deg)`,
                opacity,
                filter: blur > 0.1 ? `blur(${blur}px)` : "none",
                pointerEvents: pointerEvents as any,
                zIndex,
                transformStyle: "preserve-3d",
              }}
            >
              {/* Internal Parallax Container passing delta via CSS variable */}
              <div
                className="w-full h-full cinematic-scene-wrapper"
                style={
                  {
                    "--scene-delta": delta,
                    "--scene-abs-delta": absDelta,
                  } as React.CSSProperties
                }
              >
                {scene.component}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── PERSISTENT APPLICATION FOOTER / COMMAND CENTER ── */}
      {persistentFooter && <div className="w-full shrink-0 z-30 mt-4">{persistentFooter}</div>}
    </div>
  );
}
