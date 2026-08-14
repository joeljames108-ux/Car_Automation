import { useState, useMemo } from "react";
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
import { EngineSVG } from "./EngineSVG";
import { useInstallAnimation } from "./useInstallAnimation";
import { playAssemblySound, toggleAssemblyMute } from "./sounds";
import { AssemblyStatsSync } from "./AssemblyStatsSync";
import { ParticleEffects } from "./ParticleEffects";
import { EngineConfig } from "../../sim/types";

import { EngineAudioVisualizer } from "./EngineAudioVisualizer";

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
  const [viewMode, setViewMode] = useState<"3d_iso" | "2d">("3d_iso");

  // Hook driving animation transitions
  useInstallAnimation({
    activeComponentId,
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
        className="relative w-full h-[520px] bg-gradient-to-b from-[#070a12] via-[#0b0f19] to-[#0f172a] border border-cyan-500/30 rounded-3xl p-4 overflow-hidden backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col items-center justify-center select-none"
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

        {/* Camera Viewport Canvas */}
        <div
          className={`w-full h-full flex items-center justify-center transition-transform duration-700 ease-out ${
            isCameraShaking ? "animate-camera-shake" : ""
          } ${!activeComponentId && !isAssemblyComplete ? "animate-ken-burns" : ""}`}
          style={{ transform: cameraTransform }}
        >
          <EngineSVG
            installedComponents={installedComponents}
            activeComponentId={activeComponentId}
            phase={phase}
            hoveredComponentId={hoveredComponentId}
            isExplodedView={isExplodedView}
            isAssemblyComplete={isAssemblyComplete}
            engineConfig={engineConfig}
            selectedVariants={selectedVariants}
            viewMode={viewMode}
            onHoverComponent={onHoverComponent}
          />
        </div>

        {/* Floating Active Phase Banner on Top Left */}
        {activeComponentId && activeMeta && (
          <div className="absolute top-5 left-5 z-30 flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0b0f19]/90 border border-cyan-500/40 backdrop-blur-md shadow-[0_0_20px_rgba(56,189,248,0.25)] text-xs font-mono text-slate-200">
            <Sparkles size={14} className="text-cyan-400 animate-spin" />
            <span className="font-extrabold text-slate-100">{activeMeta.name}</span>
            <span className="text-slate-500">·</span>
            <span className="text-cyan-400 font-extrabold uppercase tracking-widest">{phase}</span>
          </div>
        )}

        {/* Floating Action Controls on Top Right */}
        <div className="absolute top-5 right-5 z-30 flex items-center gap-2">
          {/* 3D Isometric View Mode Toggle */}
          <button
            onClick={() => setViewMode((prev) => (prev === "3d_iso" ? "2d" : "3d_iso"))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono font-bold transition-all cursor-pointer ${
              viewMode === "3d_iso"
                ? "bg-cyan-500/20 text-cyan-200 border-cyan-500/50 shadow-[0_0_12px_rgba(34,211,238,0.3)]"
                : "bg-[#0b0f19]/90 text-slate-400 border-slate-700 hover:text-slate-200"
            }`}
            title="Toggle between 3D Isometric View and 2D Orthographic View"
          >
            <Camera size={13} /> {viewMode === "3d_iso" ? "3D Isometric View" : "2D View"}
          </button>

          {/* Skip Animation Button */}
          {activeComponentId && (
            <button
              onClick={onSkipAnimation}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0b0f19]/90 hover:bg-[#161e31] text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <SkipForward size={13} /> Skip
            </button>
          )}

          {/* Audio Mute Toggle Button */}
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              isMuted
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                : "bg-[#0b0f19]/90 text-cyan-300 border-cyan-500/30 hover:bg-[#161e31]"
            }`}
            title={isMuted ? "Unmute Assembly Sound Effects" : "Mute Assembly Sound Effects"}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>

        {/* Stat Delta Notification Overlay - ONLY shown on hover! */}
        <AssemblyStatsSync hoveredComponentId={hoveredComponentId} installedComponents={installedComponents} engineConfig={engineConfig} />

        {/* Bottom Educational Advice Banner */}
        {activeMeta && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 max-w-lg w-full px-5 py-2.5 rounded-2xl bg-white/85 border border-white/70 backdrop-blur-md shadow-lg text-center">
            <span className="text-[10px] font-mono text-cyan-800 font-extrabold uppercase tracking-widest block">
              ENGINEERING INSIGHT
            </span>
            <p className="text-[11.5px] text-slate-700 font-semibold truncate mt-0.5">
              {activeMeta.tooltipAdvice}
            </p>
          </div>
        )}
      </div>

      {/* ── REAL-TIME ENGINE AUDIO SYNTHESIZER & LAYOUT SELECTOR AT END OF ROBOTIC ASSEMBLY ── */}
      <div className="w-full">
        <EngineAudioVisualizer
          currentLayout={engineConfig?.layout || "v12"}
          rpm={6500}
          onSelectLayout={onSelectLayout}
        />
      </div>
    </div>
  );
}
