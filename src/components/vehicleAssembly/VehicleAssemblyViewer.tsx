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
  className = "",
}) => {
  const [isMuted, setIsMuted] = useState(false);

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
    <div className={`relative w-full h-full rounded-3xl bg-slate-950 dark:bg-base-950 border border-cyan-500/30 dark:border-base-800 backdrop-blur-2xl overflow-hidden shadow-2xl ${className}`}>
      {/* Dynamic Background Grid & Ambient Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(14,165,233,0.18),transparent_75%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.1),transparent_70%)] pointer-events-none" />

      {/* Top Header Control Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-auto">
        {/* Left: Powertrain Position & Drivetrain Selectors */}
        <div className="flex items-center gap-2 bg-white/90 dark:bg-base-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-1 px-2 text-[10px] font-mono text-slate-700 dark:text-slate-300 font-bold uppercase">
            <Cpu size={12} className="text-cyan-500 dark:text-cyan-400" />
            <span>Layout:</span>
          </div>

          {/* Engine Placement Options */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-base-950 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800">
            {(["front", "mid", "rear"] as EnginePosition[]).map((pos) => (
              <button
                key={pos}
                onClick={() => onSelectEnginePosition?.(pos)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                  enginePosition === pos
                    ? "bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* Drivetrain Options */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-base-950 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800">
            {(["fwd", "rwd", "awd"] as DriveType[]).map((drive) => (
              <button
                key={drive}
                onClick={() => onSelectDriveType?.(drive)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                  driveType === drive
                    ? "bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {drive}
              </button>
            ))}
          </div>
        </div>


      </div>

      {/* Main Vehicle SVG CAD Canvas */}
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

      {/* Hover Tooltip Overlay */}
      <AssemblyStatsSync
        hoveredComponentId={hoveredComponentId as any}
        installedComponents={installedComponents as any}
      />

      {/* Bottom Educational Advice Banner */}
      {activeMeta && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 max-w-lg w-full px-5 py-2.5 rounded-2xl bg-[#0b0f19]/90 border border-cyan-500/40 backdrop-blur-md text-center shadow-2xl">
          <span className="text-[10px] font-mono text-cyan-400 font-extrabold uppercase tracking-widest block">
            CHASSIS ENGINEERING INSIGHT
          </span>
          <p className="text-xs text-slate-200 font-medium mt-0.5 leading-relaxed">
            {activeMeta.tooltipAdvice}
          </p>
        </div>
      )}
    </div>
  );
};
