import React, { useState } from "react";
import {
  Scale,
  Car,
  TrendingUp,
  Zap,
  ShieldCheck,
  Download,
  Copy,
  CheckCircle2,
  GitCompare,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound, playHMITabSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";
import { EngineeringComparison } from "../../EngineeringComparison";
import { VehicleComparisonStudio } from "../../vehicleAssembly/VehicleComparisonStudio";

export function NeonComparisonStudio() {
  const { sim, design } = useDesign();

  const [activeTab, setActiveTab] = useState<"head_to_head" | "garage_compare" | "vehicle_matrix">("head_to_head");
  const [rival, setRival] = useState<string>("sf90");

  const benchmarks: Record<string, { name: string; power: number; weight: number; topSpeed: number; zeroSixty: number; downforce: number }> = {
    sf90: { name: "Ferrari SF90 Stradale", power: 986, weight: 1570, topSpeed: 340, zeroSixty: 2.5, downforce: 390 },
    p918: { name: "Porsche 918 Spyder", power: 887, weight: 1675, topSpeed: 345, zeroSixty: 2.6, downforce: 360 },
    jesko: { name: "Koenigsegg Jesko Attack", power: 1600, weight: 1420, topSpeed: 480, zeroSixty: 2.5, downforce: 1400 },
  };

  const selectedBenchmark = benchmarks[rival] || benchmarks.sf90;

  const powerDelta = sim.peakPower - selectedBenchmark.power;
  const weightDelta = sim.weight - selectedBenchmark.weight;
  const topSpeedDelta = sim.topSpeed - selectedBenchmark.topSpeed;
  const zeroSixtyDelta = Number(((sim.accel0_60 || 2.4) - selectedBenchmark.zeroSixty).toFixed(2));

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "HEAD-TO-HEAD SPECIFICATION COMPARISON & DIFFERENTIAL MATRIX",
          subtitle: "Side-by-side engineering telemetry deltas against world-class exotic benchmarks",
          icon: <Scale size={18} />,
          badge: <NeonHorizonBadge variant="live">HEAD-TO-HEAD ACTIVE</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="POWER DELTA" value={`${powerDelta > 0 ? "+" : ""}${powerDelta} HP`} accentColor={powerDelta >= 0 ? "emerald" : "coral"} />
          <NeonHorizonDataCard label="MASS DELTA" value={`${weightDelta > 0 ? "+" : ""}${weightDelta} kg`} accentColor={weightDelta <= 0 ? "emerald" : "coral"} />
          <NeonHorizonDataCard label="TOP SPEED DELTA" value={`${topSpeedDelta > 0 ? "+" : ""}${topSpeedDelta} km/h`} accentColor={topSpeedDelta >= 0 ? "emerald" : "gold"} />
          <NeonHorizonDataCard label="0-60 MPH DELTA" value={`${zeroSixtyDelta > 0 ? "+" : ""}${zeroSixtyDelta}s`} accentColor={zeroSixtyDelta <= 0 ? "emerald" : "coral"} />
        </div>
      </NeonHorizonGlassPanel>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
        {[
          { id: "head_to_head" as const, label: "Supercar Benchmark Duel", icon: <Scale size={14} /> },
          { id: "garage_compare" as const, label: "Garage Fleet Comparison", icon: <GitCompare size={14} /> },
          { id: "vehicle_matrix" as const, label: "Vehicle Assembly Matrix", icon: <Car size={14} /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playHMITabSound();
                setActiveTab(tab.id);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs nh-font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* View 1: Supercar Benchmark Duel */}
      {activeTab === "head_to_head" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Benchmark Selection (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <NeonHorizonGlassPanel
              variant="primary"
              corners="reticle"
              header={{
                title: "SELECT RIVAL BENCHMARK",
                icon: <Car size={16} />,
              }}
              className="p-6 flex flex-col gap-3"
            >
              {Object.entries(benchmarks).map(([id, b]) => {
                const isSelected = rival === id;
                return (
                  <div
                    key={id}
                    onClick={() => {
                      playHMIClickSound();
                      setRival(id);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? "bg-[#0a1838] border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                        : "bg-[#060e22] border-white/10 hover:border-cyan-500/30"
                    }`}
                  >
                    <span className="text-sm font-bold text-slate-100">{b.name}</span>
                    <div className="flex items-center justify-between text-xs nh-font-mono text-slate-400 pt-1">
                      <span>{b.power} HP</span>
                      <span>{b.weight} kg</span>
                      <span>{b.topSpeed} km/h</span>
                    </div>
                  </div>
                );
              })}
            </NeonHorizonGlassPanel>
          </div>

          {/* Right Comparison Matrix (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <NeonHorizonGlassPanel
              variant="primary"
              corners="reticle"
              header={{
                title: `DIRECT METRIC MATRIX: YOUR CAR VS ${selectedBenchmark.name.toUpperCase()}`,
                icon: <Scale size={16} />,
              }}
              className="p-6 flex flex-col gap-4"
            >
              <div className="flex flex-col gap-3">
                {[
                  { label: "PEAK POWER", current: `${sim.peakPower} HP`, rival: `${selectedBenchmark.power} HP`, delta: `${powerDelta > 0 ? "+" : ""}${powerDelta} HP`, win: powerDelta >= 0 },
                  { label: "TOTAL DRY MASS", current: `${sim.weight} kg`, rival: `${selectedBenchmark.weight} kg`, delta: `${weightDelta > 0 ? "+" : ""}${weightDelta} kg`, win: weightDelta <= 0 },
                  { label: "TOP SPEED", current: `${sim.topSpeed} km/h`, rival: `${selectedBenchmark.topSpeed} km/h`, delta: `${topSpeedDelta > 0 ? "+" : ""}${topSpeedDelta} km/h`, win: topSpeedDelta >= 0 },
                  { label: "0-60 MPH ACCELERATION", current: `${sim.accel0_60 || 2.4}s`, rival: `${selectedBenchmark.zeroSixty}s`, delta: `${zeroSixtyDelta > 0 ? "+" : ""}${zeroSixtyDelta}s`, win: zeroSixtyDelta <= 0 },
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/8">
                    <span className="text-xs font-bold text-slate-300 w-1/3">{row.label}</span>
                    <div className="flex items-center justify-between w-2/3 nh-font-mono text-xs">
                      <span className="font-bold text-cyan-300">{row.current}</span>
                      <span className="text-slate-500">vs</span>
                      <span className="text-slate-400">{row.rival}</span>
                      <span className={`font-bold px-2 py-0.5 rounded-full ${row.win ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-rose-500/20 text-rose-300 border border-rose-500/40"}`}>
                        {row.delta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </NeonHorizonGlassPanel>
          </div>
        </div>
      )}

      {/* View 2: Garage Fleet Comparison */}
      {activeTab === "garage_compare" && (
        <div className="w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#070e1c] p-4">
          <EngineeringComparison />
        </div>
      )}

      {/* View 3: Vehicle Assembly Matrix */}
      {activeTab === "vehicle_matrix" && (
        <div className="w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#070e1c]">
          <VehicleComparisonStudio />
        </div>
      )}
    </div>
  );
}
