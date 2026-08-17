// ===================================================================
// VEHICLE ASSEMBLY MASTER VIEWPORT COMPONENT
// ===================================================================
// Master CAD / WebGL Viewport matching the Engine Designer layout:
// - Top Header: Subsystem Title, description & [2D / 3D Iso / 3D GLB] switches
// - Center Canvas: Multi-mode 2D Blueprint, 3D Isometric SVG, or 3D WebGL (Three.js)
// - Overlays: Live dynamic telemetry HUD and interactive component tooltips
// ===================================================================

import React, { useState, useMemo } from "react";
import {
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Eye,
  Camera,
  Layers,
  Cpu,
  Maximize2,
  Boxes,
} from "lucide-react";
import {
  VehicleComponentId,
  getVehicleAssemblyComponents,
  VehicleAssemblyComponentMeta,
} from "../../sim/vehicleAssemblyTypes";
import { AssemblyPhase } from "../../sim/assemblyTypes";
import { VehicleSVG } from "./VehicleSVG";
import { useInstallAnimation } from "../assembly/useInstallAnimation";
import { playAssemblySound, toggleAssemblyMute } from "../assembly/sounds";
import { AssemblyStatsSync } from "../assembly/AssemblyStatsSync";
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
  vehicleConfig?: Partial<VehicleConfig>;
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
  const [viewMode, setViewMode] = useState<"2d" | "3d_iso" | "3d_glb">("3d_iso");

  useInstallAnimation({
    activeComponentId: activeComponentId as any,
    phase,
    onAdvancePhase,
    onCompleteInstall: () => {
      onCompleteInstall();
      playAssemblySound("click");
    },
    onPlaySound: (type) => playAssemblySound(type),
  });

  const handleToggleMute = () => {
    const muted = toggleAssemblyMute();
    setIsMuted(muted);
  };

  const activeMeta = useMemo(
    () => getVehicleAssemblyComponents(vehicleConfig).find((c) => c.id === activeComponentId),
    [vehicleConfig, activeComponentId]
  );

  return (
    <div className={`relative w-full rounded-3xl bg-slate-950 dark:bg-base-950 border border-slate-200 dark:border-slate-800 backdrop-blur-2xl overflow-hidden shadow-2xl ${className}`}>
      {/* Dynamic Background Grid & Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(14,165,233,0.12),transparent_75%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.08),transparent_70%)] pointer-events-none" />

      {/* Top Header Control Toolbar */}
      <div className="p-4 flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/40 z-30 relative bg-white/40 dark:bg-base-900/40 backdrop-blur-md">
        {/* Left: Viewport Title & Description */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>Chassis & Unibody Assembly Architecture</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-bold uppercase">
                CAD Studio
              </span>
            </h2>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Interactive 3D unibody chassis, double-wishbone suspension kinematics & subframe cradles
            </p>
          </div>
        </div>

        {/* Right: View Mode Toggle Switches (2D / 3D Iso / 3D GLB) & Sound */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-base-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold">
            <button
              onClick={() => setViewMode("2d")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                viewMode === "2d"
                  ? "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              2D
            </button>

            <button
              onClick={() => setViewMode("3d_iso")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                viewMode === "3d_iso"
                  ? "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              3D Iso
            </button>

            <button
              onClick={() => setViewMode("3d_glb")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                viewMode === "3d_glb"
                  ? "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Boxes size={13} />
              <span>3D GLB</span>
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-2xl bg-slate-100 dark:bg-base-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-all shadow-sm"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* Main Viewport Content Stage */}
      <div className="relative w-full h-[460px] flex items-center justify-center">
        {viewMode === "3d_glb" ? (
          <div className="w-full h-full">
            <Exterior3DWebGLViewer className="w-full h-full" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center p-6">
            <VehicleSVG
              installedComponents={installedComponents}
              activeComponentId={activeComponentId}
              phase={phase}
              hoveredComponentId={hoveredComponentId}
              isExplodedView={isExplodedView}
              enginePosition={enginePosition}
              driveType={driveType}
              vehicleConfig={vehicleConfig}
              onHoverComponent={onHoverComponent}
            />
          </div>
        )}

        {/* Hover Tooltip Overlay */}
        {viewMode !== "3d_glb" && (
          <AssemblyStatsSync
            hoveredComponentId={hoveredComponentId as any}
            installedComponents={installedComponents as any}
          />
        )}
      </div>

      {/* Bottom Educational Advice Banner */}
      {activeMeta && (
        <div className="p-3 bg-[#0b0f19]/90 border-t border-cyan-500/20 text-center">
          <span className="text-[10px] font-mono text-cyan-400 font-extrabold uppercase tracking-widest block">
            CHASSIS ENGINEERING INSIGHT
          </span>
          <p className="text-xs text-slate-300 font-mono mt-0.5 leading-relaxed">
            {activeMeta.tooltipAdvice}
          </p>
        </div>
      )}
    </div>
  );
};
