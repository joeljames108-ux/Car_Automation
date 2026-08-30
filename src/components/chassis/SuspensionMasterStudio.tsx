import React, { useState } from "react";
import {
  Activity,
  Sliders,
  Box,
  Layers,
  Sparkles,
  ShieldCheck,
  Gauge,
  Disc,
  BarChart2,
  TrendingUp,
} from "lucide-react";
import { Suspension3DStudioViewport } from "./Suspension3DStudioViewport";
import { ChassisDynamicsSuspensionStudio } from "../vehicleAssembly/ChassisDynamicsSuspensionStudio";

export type SuspensionStudioSubTab =
  | "kinematics_3d"
  | "mr_dynamics"
  | "damper_analysis"
  | "split_view";

export const SuspensionMasterStudio: React.FC = () => {
  const [subTab, setSubTab] = useState<SuspensionStudioSubTab>("kinematics_3d");

  // Damper & ride height analysis state
  const [frontRideHeightSweep, setFrontRideHeightSweep] = useState(45);
  const [arbStiffness, setArbStiffness] = useState(140);

  return (
    <div className="flex flex-col w-full space-y-4 font-sans select-none animate-stage-transition-enter">
      {/* Studio Header & Subtab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-3xl bg-amber-900/40 dark:bg-amber-950/85 border border-white/15 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500/25 to-amber-600/25 border border-amber-500/40 text-amber-300 shadow-md shadow-cyan-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                3D SUSPENSION & CHASSIS DYNAMICS STUDIO
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                PRO KINEMATICS
              </span>
            </div>
            <p className="text-[11px] text-amber-100/80 dark:text-amber-200/60 font-mono">
              Real-Time Three.js Articulation • Skyhook Karnopp Active MR Damping • Damper Velocity Histograms
            </p>
          </div>
        </div>

        {/* Subtab Navigation Pills */}
        <div className="flex items-center bg-amber-950/60 p-1.5 rounded-2xl border border-white/10 gap-1.5 self-start sm:self-auto overflow-x-auto">
          <button
            onClick={() => setSubTab("kinematics_3d")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
              subTab === "kinematics_3d"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-cyan-500/30 font-extrabold"
                : "text-amber-100/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Box size={13} />
            <span>3D KINEMATICS</span>
          </button>

          <button
            onClick={() => setSubTab("mr_dynamics")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
              subTab === "mr_dynamics"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-cyan-500/30 font-extrabold"
                : "text-amber-100/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Sliders size={13} />
            <span>ACTIVE MR & FEA</span>
          </button>

          <button
            onClick={() => setSubTab("damper_analysis")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
              subTab === "damper_analysis"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-cyan-500/30 font-extrabold"
                : "text-amber-100/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <BarChart2 size={13} />
            <span>DAMPER & RIDE SWEEP</span>
          </button>

          <button
            onClick={() => setSubTab("split_view")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
              subTab === "split_view"
                ? "bg-gradient-to-r from-amber-400 to-indigo-500 text-slate-950 shadow-md shadow-cyan-500/30 font-extrabold"
                : "text-amber-100/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Layers size={13} />
            <span>DUAL SUITE</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Content */}
      {subTab === "kinematics_3d" && (
        <div className="w-full">
          <Suspension3DStudioViewport />
        </div>
      )}

      {subTab === "mr_dynamics" && (
        <div className="w-full rounded-3xl overflow-hidden border border-white/15 shadow-2xl backdrop-blur-xl">
          <ChassisDynamicsSuspensionStudio />
        </div>
      )}

      {subTab === "damper_analysis" && (
        <div className="w-full rounded-3xl bg-amber-900/40 dark:bg-amber-950/85 border border-white/15 p-6 space-y-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="text-amber-400" size={18} />
                Damper Velocity Histogram & Ride Height Aero Sensitivity
              </h3>
              <p className="text-xs text-amber-100/80 dark:text-amber-200/60">
                Analyze shock velocity distributions (low-speed vs high-speed damping) and ground-effect downforce vs ride height.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-amber-300 font-bold bg-amber-500/20 px-2.5 py-1 rounded-xl border border-amber-500/40">
                4-Way Adjustable Dampers
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Damper Velocity Histogram */}
            <div className="p-5 rounded-2xl bg-amber-950/70 border border-white/10 space-y-3 shadow-xl">
              <div className="flex items-center justify-between text-xs font-bold text-amber-50">
                <span>DAMPER VELOCITY SPECTRUM (HISTOGRAM)</span>
                <span className="text-amber-400 font-mono">100Hz Telemetry Data</span>
              </div>
              <div className="h-44 flex items-end gap-2 pt-4">
                {[
                  { range: "<-200", label: "Extreme Rebound", pct: 5, color: "bg-amber-500" },
                  { range: "-150", label: "High Speed R", pct: 14, color: "bg-amber-500" },
                  { range: "-50", label: "Low Speed R", pct: 32, color: "bg-amber-500" },
                  { range: "0", label: "Neutral", pct: 45, color: "bg-emerald-500" },
                  { range: "+50", label: "Low Speed C", pct: 30, color: "bg-amber-500" },
                  { range: "+150", label: "High Speed C", pct: 16, color: "bg-amber-500" },
                  { range: ">+200", label: "Kerb Strike C", pct: 8, color: "bg-amber-500" },
                ].map((b) => (
                  <div key={b.range} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="text-[9px] font-mono text-amber-100/80">{b.pct}%</div>
                    <div
                      style={{ height: `${(b.pct / 45) * 100}%` }}
                      className={`w-full rounded-t ${b.color} transition-all opacity-85 group-hover:opacity-100 shadow-md`}
                    />
                    <div className="text-[8px] font-mono text-amber-200/60 truncate max-w-full">{b.range}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-amber-200/60 font-mono pt-2 border-t border-white/10">
                <span>Rebound (mm/s)</span>
                <span>Compression (mm/s)</span>
              </div>
            </div>

            {/* Ride Height vs Downforce Sensitivity */}
            <div className="p-5 rounded-2xl bg-amber-950/70 border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center justify-between text-xs font-bold text-amber-50">
                <span>RIDE HEIGHT AERO SENSITIVITY CURVE</span>
                <span className="text-amber-400 font-mono">{frontRideHeightSweep} mm Front</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-amber-50">
                  <span>Front Ride Height Sweep</span>
                  <span className="text-amber-300 font-bold">{frontRideHeightSweep} mm</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="70"
                  step="1"
                  value={frontRideHeightSweep}
                  onChange={(e) => setFrontRideHeightSweep(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-2 bg-amber-800/35 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-amber-50">
                  <span>Anti-Roll Bar Stiffness</span>
                  <span className="text-amber-300 font-bold">{arbStiffness} N/mm</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="5"
                  value={arbStiffness}
                  onChange={(e) => setArbStiffness(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-2 bg-amber-800/35 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2">
                <div className="p-3 rounded-xl bg-amber-900/40 border border-white/10">
                  <span className="text-amber-200/60 block text-[9px] font-bold">PREDICTED DOWNFORCE</span>
                  <span className="font-extrabold text-amber-300 text-sm">
                    {Math.round(1200 * (1 - (frontRideHeightSweep - 30) * 0.012))} kg
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-amber-900/40 border border-white/10">
                  <span className="text-amber-200/60 block text-[9px] font-bold">ROLL GRADIENT</span>
                  <span className="font-extrabold text-amber-300 text-sm">
                    {(2.4 * (100 / arbStiffness)).toFixed(2)} °/g
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === "split_view" && (
        <div className="flex flex-col space-y-4">
          <div className="w-full">
            <Suspension3DStudioViewport />
          </div>
          <div className="w-full rounded-3xl overflow-hidden border border-white/15 shadow-2xl backdrop-blur-xl">
            <ChassisDynamicsSuspensionStudio />
          </div>
        </div>
      )}
    </div>
  );
};
