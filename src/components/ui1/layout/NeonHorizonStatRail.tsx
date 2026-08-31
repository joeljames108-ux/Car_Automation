import React, { useState } from "react";
import { Flag, Wind, Cpu, Gauge, Weight, Timer, Terminal } from "lucide-react";
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

  const zeroToSixty = sim.accel0_60 || 4.19;
  const power = sim.peakPower || 410;
  const torque = sim.peakTorque || 578;
  const weight = sim.weight || 1713;

  return (
    <div className="hidden xl:flex flex-col gap-4 w-72 shrink-0 select-none">
      <div className="sticky top-28 flex flex-col gap-4">
        {/* SIMULATION PROGRESS Panel */}
        <div className="p-5 rounded-3xl bg-amber-950/80/85 backdrop-blur-3xl border border-white/12 shadow-[0_25px_60px_rgba(0,0,0,0.60),inset_0_1px_0_rgba(255,255,255,0.10)] flex flex-col items-center gap-5 nh-edge-top">
          {/* Header Bar with Engineering Log Toggle Button */}
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest text-amber-200/70 uppercase">
              SIMULATION PROGRESS
            </span>
            <button
              onClick={() => {
                playHMIClickSound();
                setShowLog((prev) => !prev);
              }}
              title="Toggle Engineering Terminal Log"
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer ${
 showLog
 ? "bg-amber-500/25 text-amber-300 border border-sky-400/35"
 : "bg-white/5 text-amber-300/60 hover:text-amber-100 border border-white/10"
 }`}
            >
              <Terminal size={13} />
            </button>
          </div>

          {/* Circular Engineer Avatar with Glowing Cyan Progress Ring */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="#7fb5d8"
                strokeWidth="4"
                strokeDasharray="276"
                strokeDashoffset="65"
                strokeLinecap="round"
              />
            </svg>

            {/* Engineer Avatar Photo */}
            <div className="absolute inset-2.5 rounded-full overflow-hidden border-2 border-amber-500/30">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop"
                alt="Lead Aerodynamicist"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%2338bdf8' stroke-width='1.5'><path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/></svg>";
                }}
              />
            </div>
          </div>

          {/* 3 Circular Quick-Action Mode Buttons */}
          <div className="flex items-center gap-3">
            {/* Race / Checkered Flag */}
            <button
              onClick={() => {
                playHMIClickSound();
                setActiveMode("race");
              }}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
 activeMode === "race"
 ? "bg-amber-500/25 text-sky-100 border border-sky-300/40"
 : "bg-white/[0.06] text-amber-200/70 hover:bg-white/[0.12] border border-white/8"
 }`}
            >
              <Flag size={18} />
            </button>

            {/* Aero / Wind Cone */}
            <button
              onClick={() => {
                playHMIClickSound();
                setActiveMode("aero");
              }}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
 activeMode === "aero"
 ? "bg-amber-500/25 text-sky-100 border border-sky-300/40"
 : "bg-white/[0.06] text-amber-200/70 hover:bg-white/[0.12] border border-white/8"
 }`}
            >
              <Wind size={18} />
            </button>

            {/* Chip / Electronics */}
            <button
              onClick={() => {
                playHMIClickSound();
                setActiveMode("chip");
              }}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
 activeMode === "chip"
 ? "bg-amber-500/25 text-sky-100 border border-sky-300/40"
 : "bg-white/[0.06] text-amber-200/70 hover:bg-white/[0.12] border border-white/8"
 }`}
            >
              <Cpu size={18} />
            </button>
          </div>

          {/* Telemetry Rows */}
          <div className="w-full flex flex-col gap-2.5 pt-2 border-t border-white/10">
            {/* POWER */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-950/80/70 border border-white/6 hover:border-amber-500/30 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Flag size={15} />
                </div>
                <span className="text-xs font-bold text-amber-300/60 uppercase tracking-wider">
                  POWER
                </span>
              </div>
              <span className="text-base font-extrabold text-slate-100">
                <AnimatedCounter value={power} /> <span className="text-xs font-medium text-amber-300/60">hp</span>
              </span>
            </div>

            {/* TORQUE */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-950/80/70 border border-white/6 hover:border-amber-500/30 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Gauge size={15} />
                </div>
                <span className="text-xs font-bold text-amber-300/60 uppercase tracking-wider">
                  TORQUE
                </span>
              </div>
              <span className="text-base font-extrabold text-slate-100">
                <AnimatedCounter value={torque} /> <span className="text-xs font-medium text-amber-300/60">Nm</span>
              </span>
            </div>

            {/* WEIGHT */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-950/80/70 border border-white/6 hover:border-amber-500/30 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Weight size={15} />
                </div>
                <span className="text-xs font-bold text-amber-300/60 uppercase tracking-wider">
                  WEIGHT
                </span>
              </div>
              <span className="text-base font-extrabold text-slate-100">
                <AnimatedCounter value={weight} /> <span className="text-xs font-medium text-amber-300/60">kg</span>
              </span>
            </div>

            {/* 0-60 */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-950/80/70 border border-white/6 hover:border-amber-500/30 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Timer size={15} />
                </div>
                <span className="text-xs font-bold text-amber-300/60 uppercase tracking-wider">
                  0-60
                </span>
              </div>
              <span className="text-base font-extrabold text-slate-100">
                {zeroToSixty.toFixed(2)} <span className="text-xs font-medium text-amber-300/60">s</span>
              </span>
            </div>
          </div>
        </div>

        {/* Optional Engineering Log Panel (Vision Glass Right Drawer) */}
        {showLog && (
          <div className="animate-nh-materialize">
            <EngineeringLog />
          </div>
        )}
      </div>
    </div>
  );
};
