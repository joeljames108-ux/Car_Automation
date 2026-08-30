// ============================================================================
// CINEMATIC SCROLL-DRIVEN CONTENT VIEWPORT ENGINE
// ============================================================================
// Full-screen automotive engineering console viewport orchestrating
// continuous, bidirectional 3D layered transitions between consecutive
// content states (Screen 1 → Screen 2 → Screen N) driven directly by
// mouse wheel, trackpad gestures, keyboard navigation, and touch scrub.
// ============================================================================

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  Compass,
  Activity,
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
  persistentSidebar?: React.ReactNode;
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
  persistentSidebar,
  className = "",
  scrollSensitivity = 0.0016,
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

  // Sync controlled index if provided externally
  useEffect(() => {
    if (controlledIndex !== undefined && controlledIndex !== Math.round(targetProgressRef.current)) {
      targetProgressRef.current = controlledIndex;
      triggerPhysics();
    }
  }, [controlledIndex]);

  // ── 1. Physics Animation Loop (120Hz Spring Interpolation & Damping) ──
  const updatePhysics = useCallback(() => {
    const target = targetProgressRef.current;
    const current = currentProgressRef.current;
    const diff = target - current;

    // High-precision damped spring interpolation (seamless continuous approach)
    if (Math.abs(diff) > 0.0004) {
      const step = diff * 0.12;
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

  // ── 2. Magnetic Snap Settling (Controlled Mechanical Lock) ──
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

    // Find parent scroll container (e.g. .vision-glass-content or parentElement)
    const scrollParent = container.closest(".vision-glass-content") || container.parentElement || container;

    const onNativeWheel = (e: Event) => {
      const wheelEvent = e as WheelEvent;
      // Intercept wheel to drive normalized timeline without jumpy page scrolling
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
      }, 180);
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

    const delta = deltaY * scrollSensitivity * 1.5;
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
      // Don't intercept if user is typing in an input
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

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
      <div className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 mb-3 rounded-2xl bg-base-950/85 border border-amber-500/30 backdrop-blur-xl shadow-[0_0_25px_rgba(0,0,0,0.5)] z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/25 to-amber-600/25 border border-amber-400/40 text-amber-300 shadow-[0_0_12px_rgba(34,211,238,0.3)]">
            <Layers size={16} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-extrabold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                AUTOMOTIVE OS CONSOLE TIMELINE
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-mono font-extrabold border border-amber-500/30">
                STATE 0{activeSceneIndex + 1} / 0{totalScenes}
              </span>
            </div>
            <div className="text-xs font-bold text-amber-50 flex items-center gap-1.5 mt-0.5">
              {activeScene?.icon}
              <span>{activeScene?.title}</span>
              {activeScene?.subtitle && (
                <span className="hidden md:inline text-[11px] font-normal text-amber-200/60 ml-1.5 pl-2 border-l border-white/10">
                  {activeScene.subtitle}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scene Switcher Beads & Timeline Progress Scrub */}
        <div className="flex items-center gap-3">
          {/* Quick Scene Jump Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/50 border border-white/10">
            {scenes.map((s, idx) => {
              const isActive = Math.abs(progress - idx) < 0.45;
              return (
                <button
                  key={s.id}
                  onClick={() => goToScene(idx)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500 to-sky-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.6)] font-black scale-105"
                      : "text-amber-200/60 hover:text-amber-50 hover:bg-white/5"
                  }`}
                >
                  <span className="text-[10px]">0{idx + 1}</span>
                  <span className="hidden sm:inline">{s.title.split("/")[0].trim()}</span>
                </button>
              );
            })}
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToScene(Math.max(0, activeSceneIndex - 1))}
              disabled={activeSceneIndex === 0}
              className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                activeSceneIndex > 0
                  ? "bg-base-900 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 hover:scale-105 shadow-sm"
                  : "bg-base-950/40 border-white/5 text-amber-400 cursor-not-allowed"
              }`}
              title="Previous Content State (Scroll Up / PageUp)"
            >
              <ChevronUp size={15} />
            </button>
            <button
              onClick={() => goToScene(Math.min(maxProgress, activeSceneIndex + 1))}
              disabled={activeSceneIndex >= maxProgress}
              className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                activeSceneIndex < maxProgress
                  ? "bg-base-900 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 hover:scale-105 shadow-sm"
                  : "bg-base-950/40 border-white/5 text-amber-400 cursor-not-allowed"
              }`}
              title="Next Content State (Scroll Down / PageDown)"
            >
              <ChevronDown size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT WORKSPACE (OPTIONAL PERSISTENT SIDEBAR + 3D VIEWPORT) ── */}
      <div className="w-full flex-1 flex gap-4 min-h-[640px]">
        {/* Main 3D Multi-Layer Viewport Canvas */}
        <div
          ref={viewportRef}
          className="relative flex-1 min-w-0"
          style={{
            perspective: "1400px",
            minHeight: "640px",
          }}
        >
          {scenes.map((scene, index) => {
            const delta = progress - index;
            const absDelta = Math.abs(delta);

            const isVisible = absDelta < 1.4;
            if (!isVisible) return null;

            // ── Layered Cinematic Mathematical Transforms ──
            // Scale: 1.00 -> 0.96
            const scale = 1.0 - Math.min(0.04, absDelta * 0.04);
            // Opacity: 1.00 -> 0.00 with smooth cubic power curve
            const opacity = Math.max(0, Math.min(1, 1 - Math.pow(absDelta, 1.25)));
            // TranslateY: 0 -> -40px (leaving) or +40px -> 0 (entering)
            const translateY = delta * -40;
            // TranslateZ: 0 -> -120px depth
            const translateZ = -absDelta * 120;
            // Subtle 3D perspective tilt
            const rotateX = delta * 1.5;
            // Micro transient blur only during motion
            const blur = absDelta > 0.04 ? Math.min(2.5, absDelta * 2.8) : 0;

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

        {/* Persistent Right-Side Contextual Telemetry Sidebar (if provided) */}
        {persistentSidebar && (
          <div className="hidden xl:block w-80 shrink-0 z-10">
            <div className="sticky top-20">{persistentSidebar}</div>
          </div>
        )}
      </div>

      {/* ── PERSISTENT APPLICATION FOOTER / COMMAND BAR ── */}
      {persistentFooter && <div className="w-full shrink-0 z-30 mt-4">{persistentFooter}</div>}
    </div>
  );
}

export default CinematicScrollViewport;
