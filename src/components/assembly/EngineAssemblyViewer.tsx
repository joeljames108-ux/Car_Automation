import React, { useState, useMemo, useCallback, useRef, useEffect, Suspense } from "react";
import {
  SkipForward,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Eye,
  Camera,
} from "lucide-react";
import {
  ComponentId,
  AssemblyPhase,
  getAssemblyComponents,
} from "../../sim/assemblyTypes";
import { ModularEngine3DViewport } from "../../engine3d/ModularEngine3DViewport";
import { useInstallAnimation } from "./useInstallAnimation";
import { playAssemblySound, toggleAssemblyMute } from "./sounds";
import { AssemblyStatsSync } from "./AssemblyStatsSync";
import { ParticleEffects } from "./ParticleEffects";
import { EngineConfig } from "../../sim/types";

// Lazy-load heavy audio synthesizer & frequency visualizer
const EngineAudioVisualizer = React.lazy(() =>
  import("./EngineAudioVisualizer").then((m) => ({ default: m.EngineAudioVisualizer }))
);

interface EngineAssemblyViewerProps {
  installedComponents: ComponentId[];
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  hoveredComponentId: ComponentId | null;
  isExplodedView: boolean;
  isAssemblyComplete: boolean;
  engineConfig?: Partial<EngineConfig>;
  selectedVariants?: Record<string, any>;
  onAdvancePhase: (nextPhase: AssemblyPhase) => void;
  onCompleteInstall: () => void;
  onSkipAnimation: () => void;
  onHoverComponent?: (id: ComponentId | null) => void;
  onSelectLayout?: (layout: string) => void;
  className?: string;
}

export function EngineAssemblyViewer({
  installedComponents,
  activeComponentId,
  phase,
  hoveredComponentId,
  isExplodedView,
  isAssemblyComplete,
  engineConfig,
  selectedVariants,
  onAdvancePhase,
  onCompleteInstall,
  onSkipAnimation,
  onHoverComponent,
  onSelectLayout,
  className = "",
}: EngineAssemblyViewerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [lastInstalledId, setLastInstalledId] = useState<ComponentId | null>(null);

  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);
  const hoverRafRef = useRef<number | null>(null);

  // Monitor browser tab visibility to pause animations and audio synthesis when hidden
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (hoverRafRef.current) cancelAnimationFrame(hoverRafRef.current);
    };
  }, []);

  // Throttled hover handler using requestAnimationFrame to prevent re-render thrashing
  const handleHoverThrottled = useCallback(
    (id: ComponentId | null) => {
      if (!onHoverComponent) return;
      if (hoverRafRef.current) {
        cancelAnimationFrame(hoverRafRef.current);
      }
      hoverRafRef.current = requestAnimationFrame(() => {
        onHoverComponent(id);
      });
    },
    [onHoverComponent]
  );

  // Hook driving animation transitions
  useInstallAnimation({
    activeComponentId: isTabVisible ? activeComponentId : null,
    phase,
    onAdvancePhase,
    onCompleteInstall: () => {
      if (activeComponentId) setLastInstalledId(activeComponentId);
      onCompleteInstall();
      playAssemblySound("click");
    },
    onPlaySound: (type) => playAssemblySound(type),
    engineConfig,
  });

  const handleToggleMute = () => {
    const muted = toggleAssemblyMute();
    setIsMuted(muted);
  };

  const activeMeta = useMemo(() => getAssemblyComponents(engineConfig).find((c) => c.id === activeComponentId), [engineConfig, activeComponentId]);

  // Compute camera zoom and focus pan coordinates based on active component slot
  const cameraTransform = useMemo(() => {
    if (!activeComponentId || phase === "idle") {
      return "scale(1) translate(0px, 0px)";
    }
    if (!activeMeta) return "scale(1) translate(0px, 0px)";

    const slot = activeMeta.slotPosition;
    // Calculate camera target center offset relative to SVG 250,225 center
    const panX = (250 - slot.x) * 0.55;
    const panY = (225 - slot.y) * 0.55;
    return `scale(1.22) translate(${panX}px, ${panY}px)`;
  }, [activeComponentId, phase, activeMeta]);

  // Determine camera shake state on lock/confirm phase for heavy parts
  const isCameraShaking = (phase === "locking" || phase === "confirming") && 
    (activeComponentId === "block" || activeComponentId === "cylinder_head" || activeComponentId === "crankshaft" || activeComponentId === "turbocharger");

  return (
    <div className={`w-full flex flex-col gap-4 ${className}`}>
      {/* ── ROBOTIC ASSEMBLY VIEWER STAGE ── */}
      <div
        className="relative w-full h-[520px] bg-gradient-to-b from-[#070a12] via-[#0b0f19] to-[#0f172a] border border-amber-500/30 rounded-3xl p-4 overflow-hidden backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col items-center justify-center select-none"
      >
        {/* Studio Lighting Ambient Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(56,189,248,0.12),transparent_65%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(15,23,42,0.6),transparent_70%)] pointer-events-none" />

        {/* Particle Effects Canvas Overlay */}
        <ParticleEffects
          activeComponentId={activeComponentId}
          phase={phase}
          slotPosition={activeMeta ? activeMeta.slotPosition : { x: 250, y: 225 }}
        />

        <div className="w-full h-full flex items-center justify-center">
          <ModularEngine3DViewport
            className="w-full h-full"
            engineConfig={engineConfig}
          />
        </div>

        {/* Floating Active Phase Banner on Top Left */}
        {activeComponentId && activeMeta && (
          <div className="absolute top-5 left-5 z-30 flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0b0f19]/90 border border-amber-500/40 backdrop-blur-md shadow-[0_0_20px_rgba(56,189,248,0.25)] text-xs font-mono text-amber-50">
            <Sparkles size={14} className="text-amber-400 animate-spin" />
            <span className="font-extrabold text-amber-50">{activeMeta.name}</span>
            <span className="text-amber-300/50">·</span>
            <span className="text-amber-400 font-extrabold uppercase tracking-widest">{phase}</span>
          </div>
        )}

        {/* Floating Action Controls on Top Right */}
        <div className="absolute top-5 right-5 z-30 flex items-center gap-2">
          {/* Skip Animation Button */}
          {activeComponentId && (
            <button
              onClick={onSkipAnimation}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0b0f19]/90 hover:bg-[#161e31] text-amber-300 border border-amber-500/30 text-xs font-mono font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <SkipForward size={13} /> Skip
            </button>
          )}
        </div>

        {/* Stat Delta Notification Overlay - ONLY shown on hover! */}
        <AssemblyStatsSync hoveredComponentId={hoveredComponentId} installedComponents={installedComponents} engineConfig={engineConfig} />

        {/* Bottom Educational Advice Banner */}
        {activeMeta && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 max-w-lg w-full px-5 py-2.5 rounded-2xl bg-white/85 border border-white/70 backdrop-blur-md shadow-lg text-center">
            <span className="text-[10px] font-mono text-amber-800 font-extrabold uppercase tracking-widest block">
              ENGINEERING INSIGHT
            </span>
            <p className="text-[11.5px] text-amber-500 font-semibold truncate mt-0.5">
              {activeMeta.tooltipAdvice}
            </p>
          </div>
        )}
      </div>

      {/* ── REAL-TIME ENGINE AUDIO SYNTHESIZER & LAYOUT SELECTOR (Lazy Loaded) ── */}
      <div className="w-full">
        <Suspense
          fallback={
            <div className="w-full h-32 rounded-3xl bg-[#0b0f19]/50 border border-amber-800/30 flex items-center justify-center text-amber-300/50 font-mono text-xs animate-pulse">
              Loading Audio Synthesizer Engine...
            </div>
          }
        >
          <EngineAudioVisualizer
            currentLayout={engineConfig?.layout || "v12"}
            rpm={6500}
            onSelectLayout={onSelectLayout}
          />
        </Suspense>
      </div>
    </div>
  );
}
