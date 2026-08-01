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
  ENGINE_ASSEMBLY_COMPONENTS,
} from "../../sim/assemblyTypes";
import { EngineSVG } from "./EngineSVG";
import { useInstallAnimation } from "./useInstallAnimation";
import { playAssemblySound, toggleAssemblyMute } from "./sounds";
import { AssemblyStatsSync } from "./AssemblyStatsSync";
import { EngineConfig } from "../../sim/types";

interface EngineAssemblyViewerProps {
  installedComponents: ComponentId[];
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  hoveredComponentId: ComponentId | null;
  isExplodedView: boolean;
  isAssemblyComplete: boolean;
  engineConfig?: Partial<EngineConfig>;
  onAdvancePhase: (nextPhase: AssemblyPhase) => void;
  onCompleteInstall: () => void;
  onSkipAnimation: () => void;
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
  onAdvancePhase,
  onCompleteInstall,
  onSkipAnimation,
  className = "",
}: EngineAssemblyViewerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [lastInstalledId, setLastInstalledId] = useState<ComponentId | null>(null);

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
  });

  const handleToggleMute = () => {
    const muted = toggleAssemblyMute();
    setIsMuted(muted);
  };

  const activeMeta = ENGINE_ASSEMBLY_COMPONENTS.find((c) => c.id === activeComponentId);

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
    <div
      className={`relative w-full h-full bg-gradient-to-b from-[#f6ebe0] via-[#eedecf] to-[#e5d3c2] border border-[#e2cfbe] rounded-3xl p-4 overflow-hidden backdrop-blur-2xl shadow-[0_20px_60px_rgba(120,80,60,0.20)] flex flex-col items-center justify-center select-none ${className}`}
    >
      {/* Studio Lighting Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.6),transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(210,170,140,0.3),transparent_70%)] pointer-events-none" />

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
        />
      </div>

      {/* Floating Active Phase Banner on Top Left */}
      {activeComponentId && activeMeta && (
        <div className="absolute top-5 left-5 z-30 flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/85 border border-white/70 backdrop-blur-md shadow-md text-xs font-mono text-slate-800">
          <Sparkles size={14} className="text-amber-500 animate-spin" />
          <span className="font-extrabold text-slate-900">{activeMeta.name}</span>
          <span className="text-slate-400">·</span>
          <span className="text-cyan-700 font-extrabold uppercase tracking-widest">{phase}</span>
        </div>
      )}

      {/* Floating Action Controls on Top Right */}
      <div className="absolute top-5 right-5 z-30 flex items-center gap-2">
        {/* Skip Animation Button */}
        {activeComponentId && (
          <button
            onClick={onSkipAnimation}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-slate-800 border border-white/80 text-xs font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <SkipForward size={13} /> Skip
          </button>
        )}

        {/* Audio Mute Toggle Button */}
        <button
          onClick={handleToggleMute}
          className={`p-2 rounded-full border transition-all cursor-pointer ${
            isMuted
              ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
              : "bg-white/80 text-slate-700 border-white/80 hover:bg-white"
          }`}
          title={isMuted ? "Unmute Assembly Audio" : "Mute Assembly Audio"}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </div>

      {/* Stat Delta Notification Overlay */}
      <AssemblyStatsSync lastInstalledId={lastInstalledId} />

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
  );
}
