// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — OVERVIEW COMMAND STUDIO
// ============================================================================

import React from "react";
import { Zap, Gauge, Wind, Activity, Layers, Shield, Trophy, CheckCircle2, ChevronRight, Sliders } from "lucide-react";
import { useF1ConstructorStore } from "../../../sim/f1/state/f1ConstructorStore";
import { F1Car3DViewport } from "../3d/F1Car3DViewport";
import { F1_RIVAL_TEAMS } from "../../../sim/f1/season/f1RivalTeams";

export const F1OverviewStudio: React.FC = () => {
  const { car, setActiveStep } = useF1ConstructorStore();

  const kpis = [
    { label: "Total Peak Power", value: `${car.computedTotalPeakHp} HP`, subtext: `${car.computedIcePeakHp} ICE + ${car.computedErsPeakHp} ERS` },
    { label: "Vehicle Mass", value: `${car.computedTotalMassKg} kg`, subtext: `${car.computedFrontWeightDistPercent}% Front Bias (FIA 798kg min)` },
    { label: "Downforce @ 250 km/h", value: `${car.aero.totalDownforceAt250KmhKg} kg`, subtext: `${car.aero.frontAeroBalancePercent}% Front Aero Bias` },
    { label: "Top Speed (Drag Limited)", value: `${car.computedTopSpeedKmh} km/h`, subtext: `0-100: ${car.computedZeroToHundredSec}s | 0-200: ${car.computedZeroToTwoHundredSec}s` },
    { label: "Max Cornering G-Force", value: `${car.computedMaxCorneringGLat} G`, subtext: `Braking: ${car.computedMaxBrakingGLong} G` },
    { label: "FIA Homologation Score", value: `${car.computedFiaHomologationScore}%`, subtext: car.computedFiaHomologationScore === 100 ? "100% Legal" : "Scrutineering Failures" },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* 3D WebGL CAD Viewport */}
      <F1Car3DViewport />

      {/* KPI Performance Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 shadow-md text-left">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold truncate">{kpi.label}</div>
            <div className="font-mono text-base sm:text-lg font-black text-slate-100 mt-0.5">{kpi.value}</div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">{kpi.subtext}</div>
          </div>
        ))}
      </div>

      {/* Department Quick Jump Grid & Rival Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Subsystem Quick Access */}
        <div className="lg:col-span-2 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Department Engineering Workbenches
            </h3>
            <span className="text-xs text-slate-400">Click to enter specialized studio</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: "monocoque", title: "Carbon Monocoque", desc: "Layups, crash structures & ballast", icon: <Shield size={16} className="text-cyan-400" /> },
              { id: "powerunit", title: "V6 Turbo Hybrid", desc: "ICE, MGU-K, MGU-H & 4MJ Battery", icon: <Zap size={16} className="text-amber-400" /> },
              { id: "aerodynamics", title: "Ground Effect Aero", desc: "Venturi tunnels & 85mm DRS", icon: <Wind size={16} className="text-cyan-400" /> },
              { id: "suspension", title: "Suspension Kinematics", desc: "Pushrod/pullrod & ride heights", icon: <Activity size={16} className="text-purple-400" /> },
              { id: "drivetrain", title: "8-Speed Gearbox", desc: "14ms seamless shifts & differential", icon: <Layers size={16} className="text-blue-400" /> },
              { id: "brakes", title: "Carbon Brakes", desc: "1050-hole discs & BBW regen", icon: <Gauge size={16} className="text-red-400" /> },
            ].map((dept) => (
              <button
                key={dept.id}
                onClick={() => setActiveStep(dept.id as any)}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/40 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">{dept.icon}</div>
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">{dept.title}</div>
                    <div className="text-[11px] text-slate-400">{dept.desc}</div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Col: Rival Constructor Pace Radar */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Trophy size={14} className="text-amber-400" /> Rival Pace Benchmark
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Qualifying Delta</span>
          </div>

          <div className="space-y-2 max-h-[290px] overflow-y-auto custom-scrollbar pr-1">
            {/* Player's Car */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-bold text-cyan-300">{car.name} (You)</span>
              </div>
              <span className="font-mono font-bold text-cyan-400">Baseline</span>
            </div>

            {/* Top 6 Rivals */}
            {F1_RIVAL_TEAMS.slice(0, 6).map((rival) => (
              <div key={rival.teamId} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: rival.colorHex }} />
                  <span className="font-medium text-slate-300 truncate max-w-[130px]">{rival.teamName}</span>
                </div>
                <span className="font-mono text-slate-400">
                  {rival.estimatedLapTimeOffsetSec === 0 ? "Pole Ref" : `+${rival.estimatedLapTimeOffsetSec.toFixed(2)}s`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
