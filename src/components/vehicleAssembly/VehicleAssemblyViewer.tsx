// ===================================================================
// VEHICLE ASSEMBLY MASTER VIEWPORT COMPONENT (PURE 3D WEBGL)
// ===================================================================

import React, { useState } from "react";
import {
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Boxes,
  Maximize2,
} from "lucide-react";
import {
  VehicleComponentId,
  getVehicleAssemblyComponents,
  VehicleAssemblyComponentMeta,
} from "../../sim/vehicleAssemblyTypes";
import { AssemblyPhase } from "../../sim/assemblyTypes";
import { playAssemblySound, toggleAssemblyMute } from "../assembly/sounds";
import { EnginePosition, DriveType, VehicleConfig } from "../../sim/types";
import { Exterior3DWebGLViewer } from "./exterior/Exterior3DWebGLViewer";

interface VehicleAssemblyViewerProps {
  installedComponents: VehicleComponentId[];
  activeComponentId: VehicleComponentId | null;
  phase: AssemblyPhase;
  hoveredComponentId: VehicleComponentId | null;
  isExplodedView: boolean;
  isAssemblyComplete: boolean;
  enginePosition?: EnginePosition;
  driveType?: DriveType;
  vehicleConfig?: VehicleConfig;
  onAdvancePhase: (nextPhase: AssemblyPhase) => void;
  onCompleteInstall: () => void;
  onSkipAnimation: () => void;
  onHoverComponent?: (id: VehicleComponentId | null) => void;
  onSelectEnginePosition?: (pos: EnginePosition) => void;
  onSelectDriveType?: (drive: DriveType) => void;
  onToggleExplodedView?: () => void;
  className?: string;
}

export const VehicleAssemblyViewer: React.FC<VehicleAssemblyViewerProps> = ({
  installedComponents,
  activeComponentId,
  phase,
  hoveredComponentId,
  isExplodedView,
  isAssemblyComplete,
  enginePosition = "front",
  driveType = "rwd",
  vehicleConfig,
  onAdvancePhase,
  onCompleteInstall,
  onSkipAnimation,
  onHoverComponent,
  onSelectEnginePosition,
  onSelectDriveType,
  onToggleExplodedView,
  className = "",
}) => {
  const [isMuted, setIsMuted] = useState(false);

  const handleToggleMute = () => {
    const nextMute = toggleAssemblyMute();
    setIsMuted(nextMute);
  };

  const activeMeta = activeComponentId
    ? getVehicleAssemblyComponents().find((c) => c.id === activeComponentId)
    : null;

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden bg-slate-900/90 dark:bg-base-950/90 border border-slate-700/60 dark:border-base-800/80 shadow-2xl backdrop-blur-xl flex flex-col ${className}`}
    >
      {/* Top HUD Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-slate-200/50 dark:border-slate-800/60 bg-white/40 dark:bg-base-950/40 backdrop-blur-md z-20">
        {/* Left: Viewport Status & Active Stage */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Boxes size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-black tracking-wider uppercase text-slate-900 dark:text-slate-100">
                CHASSIS & VEHICLE 3D WORKSTATION
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
                3D WEBGL LIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Interactive 3D unibody chassis, double-wishbone suspension kinematics & subframe cradles
            </p>
          </div>
        </div>

        {/* Right: Sound & Exploded Toggle */}
        <div className="flex items-center gap-2">
          {onToggleExplodedView && (
            <button
              onClick={onToggleExplodedView}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all border ${
                isExplodedView
                  ? "bg-amber-500/20 border-amber-500 text-amber-300"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200"
              }`}
            >
              Exploded View
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-2xl bg-slate-100 dark:bg-base-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-all shadow-sm cursor-pointer"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* Main 3D Viewport Content Stage */}
      <div className="relative w-full h-[520px] flex items-center justify-center bg-[#070d18]">
        <Exterior3DWebGLViewer className="w-full h-full" />

        {/* Floating Active Stage Badge */}
        {activeComponentId && activeMeta && (
          <div className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-base-950/90 border border-amber-500/40 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.3)] text-xs font-mono text-slate-200">
            <Sparkles size={13} className="text-amber-400 animate-spin" />
            <span className="font-extrabold text-slate-100">{activeMeta.name}</span>
            <span className="text-slate-500">·</span>
            <span className="text-amber-400 font-extrabold uppercase">{phase}</span>
          </div>
        )}
      </div>
    </div>
  );
};
