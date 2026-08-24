import React from "react";
import { User, Flag, Wind, Cpu, Gauge, Zap, Weight, Timer, Compass } from "lucide-react";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { AnimatedCounter } from "../../ui/AnimatedCounter";

export interface SimulationProgressPanelProps {
  power: number;
  torque: number;
  weight: number;
  zeroToSixty: number;
  userName?: string;
  avatarUrl?: string;
  className?: string;
}

export const SimulationProgressPanel: React.FC<SimulationProgressPanelProps> = ({
  power,
  torque,
  weight,
  zeroToSixty,
  userName = "Chief Aerodynamicist",
  avatarUrl,
  className = "",
}) => {
  return (
    <NeonHorizonGlassPanel
      variant="primary"
      glow="none"
      corners="reticle"
      header={{
        title: "SIMULATION PROGRESS",
        icon: <Compass size={14} />,
      }}
      className={`p-4 flex flex-col gap-4 ${className}`}
    >
      {/* User Engineer Avatar & Role */}
      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/25">
        <div className="relative w-12 h-12 rounded-full border-2 border-cyan-400 p-0.5 shadow-[0_0_15px_rgba(0,229,255,0.4)] shrink-0 overflow-hidden bg-black/40">
          {avatarUrl ? (
            <img src={avatarUrl} alt={userName} className="w-full h-full object-cover rounded-full" />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold">
              <User size={20} />
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#060c1c] animate-nh-pulse-dot" />
        </div>
        <div className="min-w-0">
          <span className="text-xs font-bold nh-font-headline text-cyan-100 block truncate">
            {userName}
          </span>
          <span className="text-[10px] nh-font-mono text-cyan-400/80 block uppercase tracking-wider">
            Active Telemetry Link
          </span>
        </div>
      </div>

      {/* Subsystem Quick-Status Nodes */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 rounded-xl bg-black/30 border border-cyan-500/20 flex flex-col items-center justify-center text-center">
          <Flag size={15} className="text-cyan-400 mb-1" />
          <span className="text-[9px] nh-label-caps text-slate-400">Track</span>
          <span className="text-[10px] nh-font-mono font-bold text-emerald-300">Ready</span>
        </div>
        <div className="p-2 rounded-xl bg-black/30 border border-cyan-500/20 flex flex-col items-center justify-center text-center">
          <Wind size={15} className="text-cyan-400 mb-1" />
          <span className="text-[9px] nh-label-caps text-slate-400">Aero</span>
          <span className="text-[10px] nh-font-mono font-bold text-cyan-300">Active</span>
        </div>
        <div className="p-2 rounded-xl bg-black/30 border border-cyan-500/20 flex flex-col items-center justify-center text-center">
          <Cpu size={15} className="text-cyan-400 mb-1" />
          <span className="text-[9px] nh-label-caps text-slate-400">ECU</span>
          <span className="text-[10px] nh-font-mono font-bold text-fuchsia-300">Mapped</span>
        </div>
      </div>

      {/* Stat Readouts */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#09152e]/60 border border-cyan-500/15">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-cyan-400" />
            <span className="nh-label-caps text-slate-400 text-[10px]">POWER</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold nh-font-headline text-cyan-100">
              <AnimatedCounter value={power} />
            </span>
            <span className="text-[10px] nh-font-mono text-slate-400">hp</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-[#09152e]/60 border border-cyan-500/15">
          <div className="flex items-center gap-2">
            <Gauge size={14} className="text-amber-400" />
            <span className="nh-label-caps text-slate-400 text-[10px]">TORQUE</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold nh-font-headline text-amber-200">
              <AnimatedCounter value={torque} />
            </span>
            <span className="text-[10px] nh-font-mono text-slate-400">Nm</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-[#09152e]/60 border border-cyan-500/15">
          <div className="flex items-center gap-2">
            <Weight size={14} className="text-sky-400" />
            <span className="nh-label-caps text-slate-400 text-[10px]">WEIGHT</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold nh-font-headline text-sky-100">
              <AnimatedCounter value={weight} />
            </span>
            <span className="text-[10px] nh-font-mono text-slate-400">kg</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-[#09152e]/60 border border-cyan-500/15">
          <div className="flex items-center gap-2">
            <Timer size={14} className="text-emerald-400" />
            <span className="nh-label-caps text-slate-400 text-[10px]">0-60 MPH</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold nh-font-headline text-emerald-200">
              {zeroToSixty.toFixed(2)}
            </span>
            <span className="text-[10px] nh-font-mono text-slate-400">s</span>
          </div>
        </div>
      </div>
    </NeonHorizonGlassPanel>
  );
};
