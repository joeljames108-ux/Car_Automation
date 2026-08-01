import { useState, useMemo } from "react";
import {
  SkipForward,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
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

interface EngineAssemblyViewerProps {
  installedComponents: ComponentId[];
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  hoveredComponentId: ComponentId | null;
  isExplodedView: boolean;
  isAssemblyComplete: boolean;
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

  // Compute camera zoom and focus pan coordinates based on active component slot
  const cameraTransform = useMemo(() => {
    if (!activeComponentId || phase === "idle") {
      return "scale(1) translate(0px, 0px)";
    }
    const meta = ENGINE_ASSEMBLY_COMPONENTS.find((c) => c.id === activeComponentId);
    if (!meta) return "scale(1) translate(0px, 0px)";

    const slot = meta.slotPosition;
    // Calculate camera target center offset relative to SVG 250,225 center
    const panX = (250 - slot.x) * 0.45;
    const panY = (225 - slot.y) * 0.45;
    return `scale(1.15) translate(${panX}px, ${panY}px)`;
  }, [activeComponentId, phase]);

  const activeMeta = ENGINE_ASSEMBLY_COMPONENTS.find((c) => c.id === activeComponentId);

  return (
    <div
      className={`relative w-full h-full min-h-[420px] bg-base-950/80 border border-base-800 rounded-3xl p-6 overflow-hidden backdrop-blur-2xl shadow-2xl flex flex-col items-center justify-center select-none ${className}`}
    >
      {/* Dynamic Ambient Glow Backing */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,0.08),transparent_70%)] pointer-events-none" />

      {/* Camera Viewport Canvas */}
      <div
        className="w-full h-full flex items-center justify-center transition-transform duration-700 ease-out"
        style={{ transform: cameraTransform }}
      >
        <EngineSVG
          installedComponents={installedComponents}
          activeComponentId={activeComponentId}
          phase={phase}
          hoveredComponentId={hoveredComponentId}
          isExplodedView={isExplodedView}
          isAssemblyComplete={isAssemblyComplete}
        />
      </div>

      {/* Floating Status Banner on Top Left */}
      {activeComponentId && activeMeta && (
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-400/50 backdrop-blur-md shadow-lg text-xs font-mono text-cyan-200 animate-pulse">
          <Sparkles size={13} className="text-cyan-300 animate-spin" />
          <span className="font-bold">{activeMeta.name}</span>
          <span className="text-slate-400">·</span>
          <span className="text-cyan-400 font-bold uppercase">{phase}</span>
        </div>
      )}

      {/* Floating Action Controls on Top Right */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        {/* Skip Animation Button */}
        {activeComponentId && (
          <button
            onClick={onSkipAnimation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-mono font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <SkipForward size={12} /> Skip
          </button>
        )}

        {/* Audio Mute Toggle Button */}
        <button
          onClick={handleToggleMute}
          className={`p-2 rounded-full border transition-all cursor-pointer ${
            isMuted
              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
              : "bg-base-800/80 text-cyan-400 border-base-700 hover:bg-base-750"
          }`}
          title={isMuted ? "Unmute Assembly Audio" : "Mute Assembly Audio"}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>

      {/* Stat Delta Notification Overlay */}
      <AssemblyStatsSync lastInstalledId={lastInstalledId} />

      {/* Bottom Educational Advice Banner */}
      {activeMeta && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-lg w-full px-4 py-2 rounded-2xl bg-base-900/90 border border-cyan-500/30 backdrop-blur-md shadow-xl text-center">
          <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
            ENGINEERING INSIGHT
          </span>
          <p className="text-[11px] text-slate-200 font-medium truncate">
            {activeMeta.tooltipAdvice}
          </p>
        </div>
      )}
    </div>
  );
}
