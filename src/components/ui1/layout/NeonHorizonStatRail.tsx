import React, { useState } from "react";
import { Flag, Wind, Cpu, Gauge, Weight, Timer, Terminal, Zap, Activity } from "lucide-react";
import { AnimatedCounter } from "../../ui/AnimatedCounter";
import { EngineeringLog } from "../../EngineeringLog";
import type { SimResult, VehicleDesign } from "../../../sim/types";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

export interface NeonHorizonStatRailProps {
  sim: SimResult;
  design?: VehicleDesign;
}

export const NeonHorizonStatRail: React.FC<NeonHorizonStatRailProps> = ({ sim }) => {
  const [activeMode, setActiveMode] = useState<"race" | "aero" | "chip">("aero");
  const [showLog, setShowLog] = useState(false);

  const zeroToSixty = sim.accel0_60 || 2.85;
  const power = sim.peakPower || 780;
  const torque = sim.peakTorque || 920;
  const weight = sim.weight || 1350;
  const downforce = sim.downforce || 620;
  const topSpeed = sim.topSpeed || 365;

  return (
    <div className="hidden xl:flex flex-col gap-4 w-72 shrink-0 select-none">
      <div className="sticky top-24 flex flex-col gap-4">
        {/* Telemetry Progress Panel */}
        <div
          className="p-5 rounded-3xl border flex flex-col items-center gap-4 transition-colors"
          style={{
            background: "rgba(8, 12, 22, 0.88)",
            backdropFilter: "blur(30px) saturate(200%)",
            borderColor: "rgba(255, 255, 255, 0.08)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* Header Bar */}
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-1.5">
              <Zap size={13} className="text-[#00F5D4]" />
              CHASSIS TELEMETRY
            </span>
            <button
              onClick={() => {
                playHMIClickSound();
                setShowLog((prev) => !prev);
              }}
              title="Toggle Engineering Terminal Log"
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer ${
                showLog
                  ? "bg-[#00F5D4]/20 text-[#00F5D4] border border-[#00F5D4]/40"
                  : "bg-white/5 text-zinc-400 hover:text-white border border-white/10"
              }`}
            >
              <Terminal size={13} />
            </button>
          </div>

          {/* Glowing Circular Progress Ring */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="#00F5D4"
                strokeWidth="4"
                strokeDasharray="276"
                strokeDashoffset="65"
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>

            {/* Center Status Emblem */}
            <div className="absolute inset-2.5 rounded-full overflow-hidden border border-[#00F5D4]/30 bg-zinc-950 flex flex-col items-center justify-center">
              <Activity size={22} className="text-[#00F5D4] animate-pulse" />
              <span className="text-[9px] font-mono font-bold text-white uppercase mt-0.5">OPTIMAL</span>
            </div>
          </div>

          {/* Quick-Action Mode Buttons */}
          <div className="flex items-center gap-2">
            {[
              { id: "race" as const, icon: <Flag size={15} />, label: "RACE" },
              { id: "aero" as const, icon: <Wind size={15} />, label: "AERO" },
              { id: "chip" as const, icon: <Cpu size={15} />, label: "ECU" },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => {
                  playHMIClickSound();
                  setActiveMode(btn.id);
                }}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-mono font-bold transition-all cursor-pointer border ${
                  activeMode === btn.id
                    ? "bg-[#00F5D4]/20 text-[#00F5D4] border-[#00F5D4]/50 shadow-[0_0_12px_rgba(0,245,212,0.3)]"
                    : "bg-white/[0.04] text-zinc-400 hover:text-white border-white/5 hover:bg-white/10"
                }`}
              >
                {btn.icon}
                <span>{btn.label}</span>
              </button>
            ))}
          </div>

          {/* High-Density Telemetry Metric Rows */}
          <div className="w-full flex flex-col gap-2 pt-2 border-t border-white/8">
            {/* POWER */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#FFB703]/20 flex items-center justify-center text-[#FFB703]">
                  <Zap size={13} />
                </div>
                <span className="text-[11px] font-mono font-bold text-zinc-400">POWER</span>
              </div>
              <span className="text-sm font-black text-white font-mono">
                <AnimatedCounter value={power} /> <span className="text-[10px] text-zinc-500 font-normal">hp</span>
              </span>
            </div>

            {/* TORQUE */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#00F5D4]/20 flex items-center justify-center text-[#00F5D4]">
                  <Gauge size={13} />
                </div>
                <span className="text-[11px] font-mono font-bold text-zinc-400">TORQUE</span>
              </div>
              <span className="text-sm font-black text-white font-mono">
                <AnimatedCounter value={torque} /> <span className="text-[10px] text-zinc-500 font-normal">Nm</span>
              </span>
            </div>

            {/* WEIGHT */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
                  <Weight size={13} />
                </div>
                <span className="text-[11px] font-mono font-bold text-zinc-400">CURB WEIGHT</span>
              </div>
              <span className="text-sm font-black text-white font-mono">
                <AnimatedCounter value={weight} /> <span className="text-[10px] text-zinc-500 font-normal">kg</span>
              </span>
            </div>

            {/* 0-100 KM/H */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#10B981]/20 flex items-center justify-center text-[#10B981]">
                  <Timer size={13} />
                </div>
                <span className="text-[11px] font-mono font-bold text-zinc-400">0-100 KM/H</span>
              </div>
              <span className="text-sm font-black text-[#10B981] font-mono">
                {zeroToSixty.toFixed(2)}s
              </span>
            </div>

            {/* DOWNFORCE */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#00F5D4]/20 flex items-center justify-center text-[#00F5D4]">
                  <Wind size={13} />
                </div>
                <span className="text-[11px] font-mono font-bold text-zinc-400">DOWNFORCE</span>
              </div>
              <span className="text-sm font-black text-[#00F5D4] font-mono">
                <AnimatedCounter value={downforce} /> <span className="text-[10px] text-zinc-500 font-normal">kg</span>
              </span>
            </div>

            {/* TOP SPEED */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#FFB703]/20 flex items-center justify-center text-[#FFB703]">
                  <Gauge size={13} />
                </div>
                <span className="text-[11px] font-mono font-bold text-zinc-400">TOP SPEED</span>
              </div>
              <span className="text-sm font-black text-[#FFB703] font-mono">
                <AnimatedCounter value={topSpeed} /> <span className="text-[10px] text-zinc-500 font-normal">km/h</span>
              </span>
            </div>
          </div>
        </div>

        {/* Slide-out Terminal Log */}
        {showLog && (
          <div className="p-4 rounded-3xl bg-zinc-950/95 border border-white/10 shadow-2xl animate-nh-materialize">
            <EngineeringLog />
          </div>
        )}
      </div>
    </div>
  );
};
