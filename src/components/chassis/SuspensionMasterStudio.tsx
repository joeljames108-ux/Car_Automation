import React, { useState } from "react";
import { Activity, Sliders, Box, Layers, Sparkles, ShieldCheck, Gauge, Disc, BarChart2, TrendingUp } from "lucide-react";
import { Suspension3DStudioViewport } from "./Suspension3DStudioViewport";
import { ChassisDynamicsSuspensionStudio } from "../vehicleAssembly/ChassisDynamicsSuspensionStudio";

export type SuspensionStudioSubTab = "kinematics_3d" | "mr_dynamics" | "damper_analysis" | "split_view";

export const SuspensionMasterStudio: React.FC = () => {
  const [subTab, setSubTab] = useState<SuspensionStudioSubTab>("kinematics_3d");

  // Damper & ride height analysis state
  const [frontRideHeightSweep, setFrontRideHeightSweep] = useState(45);
  const [arbStiffness, setArbStiffness] = useState(140);

  return (
    <div className="flex flex-col w-full space-y-4 font-sans select-none animate-stage-transition-enter">
      {/* Studio Header & Subtab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/85 border border-cyan-500/30 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                3D SUSPENSION & CHASSIS DYNAMICS STUDIO
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                PRO KINEMATICS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Real-Time Three.js Articulation • Skyhook Karnopp Active MR Damping • Damper Velocity Histograms
            </p>
          </div>
        </div>

        {/* Subtab Navigation Pills */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 gap-1 self-start sm:self-auto overflow-x-auto">
          <button
            onClick={() => setSubTab("kinematics_3d")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
              subTab === "kinematics_3d"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-extrabold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Box size={13} />
            <span>3D KINEMATICS</span>
          </button>

          <button
            onClick={() => setSubTab("mr_dynamics")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
              subTab === "mr_dynamics"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-extrabold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Sliders size={13} />
            <span>ACTIVE MR & FEA</span>
          </button>

          <button
            onClick={() => setSubTab("damper_analysis")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
              subTab === "damper_analysis"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-extrabold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <BarChart2 size={13} />
            <span>DAMPER & RIDE SWEEP</span>
          </button>

          <button
            onClick={() => setSubTab("split_view")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
              subTab === "split_view"
                ? "bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 shadow-md shadow-cyan-500/30 font-extrabold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
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
        <div className="w-full rounded-2xl overflow-hidden border border-slate-800">
          <ChassisDynamicsSuspensionStudio />
        </div>
      )}

      {subTab === "damper_analysis" && (
        <div className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="text-cyan-400" size={18} />
                Damper Velocity Histogram & Ride Height Aero Sensitivity
              </h3>
              <p className="text-xs text-slate-400">
                Analyze shock velocity distributions (low-speed vs high-speed damping) and ground-effect downforce vs ride height.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-cyan-400 font-bold">4-Way Adjustable Dampers</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Damper Velocity Histogram */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>DAMPER VELOCITY SPECTRUM (HISTOGRAM)</span>
                <span className="text-cyan-400 font-mono">100Hz Telemetry Data</span>
              </div>
              <div className="h-44 flex items-end gap-2 pt-4">
                {[
                  { range: "<-200", label: "Extreme Rebound", pct: 5, color: "bg-purple-500" },
                  { range: "-150", label: "High Speed R", pct: 14, color: "bg-indigo-500" },
                  { range: "-50", label: "Low Speed R", pct: 32, color: "bg-cyan-500" },
                  { range: "0", label: "Neutral", pct: 45, color: "bg-emerald-500" },
                  { range: "+50", label: "Low Speed C", pct: 30, color: "bg-cyan-500" },
                  { range: "+150", label: "High Speed C", pct: 16, color: "bg-indigo-500" },
                  { range: ">+200", label: "Kerb Strike C", pct: 8, color: "bg-amber-500" },
                ].map((b) => (
                  <div key={b.range} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="text-[9px] font-mono text-slate-400">{b.pct}%</div>
                    <div
                      style={{ height: `${(b.pct / 45) * 100}%` }}
                      className={`w-full rounded-t ${b.color} transition-all opacity-80 group-hover:opacity-100`}
                    />
                    <div className="text-[8px] font-mono text-slate-500 truncate max-w-full">{b.range}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800">
                <span>Rebound (mm/s)</span>
                <span>Compression (mm/s)</span>
              </div>
            </div>

            {/* Ride Height vs Downforce Sensitivity */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>RIDE HEIGHT AERO SENSITIVITY CURVE</span>
                <span className="text-amber-400 font-mono">{frontRideHeightSweep} mm Front</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>Front Ride Height Sweep</span>
                  <span className="text-cyan-400 font-bold">{frontRideHeightSweep} mm</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="70"
                  step="1"
                  value={frontRideHeightSweep}
                  onChange={(e) => setFrontRideHeightSweep(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>Anti-Roll Bar Stiffness</span>
                  <span className="text-amber-400 font-bold">{arbStiffness} N/mm</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="5"
                  value={arbStiffness}
                  onChange={(e) => setArbStiffness(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">PREDICTED DOWNFORCE</span>
                  <span className="font-bold text-cyan-300 text-sm">
                    {Math.round(1200 * (1 - (frontRideHeightSweep - 30) * 0.012))} kg
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">ROLL GRADIENT</span>
                  <span className="font-bold text-amber-300 text-sm">
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
          <div className="w-full rounded-2xl overflow-hidden border border-slate-800">
            <ChassisDynamicsSuspensionStudio />
          </div>
        </div>
      )}
    </div>
  );
};
