// ===================================================================
// PARTS R&D PANEL — Component Engineering & High-Risk Breakthroughs
// ===================================================================
import { useState, memo } from "react";
import { Wrench, Zap, Shield, AlertTriangle, CheckCircle, Clock, Flame } from "lucide-react";
import { useCompany } from "../../state/CompanyContext";
import { playHMIClickSound } from "../../utils/hmiSoundSynth";
import type { MotorsportTeam } from "../../sim/types";

interface MotorsportPart {
  id: string;
  name: string;
  category: "Aerodynamics" | "Chassis" | "Powertrain" | "Brakes" | "Suspension";
  paceGain: number;
  reliabilityDelta: number;
  cost: number;
  riskPenalty: string;
  isIllegal: boolean;
  status: "Installed" | "In Development" | "Available";
}

const DEFAULT_PARTS: MotorsportPart[] = [
  { id: "p1", name: "Ultra-High Downforce Rear Wing", category: "Aerodynamics", paceGain: 18, reliabilityDelta: 5, cost: 4_200_000, riskPenalty: "Legal (0% Risk)", isIllegal: false, status: "Installed" },
  { id: "p2", name: "Experimental Flexible Floor", category: "Chassis", paceGain: 25, reliabilityDelta: -10, cost: 6_500_000, riskPenalty: "HIGH ILLEGAL RISK (35% Scrutineering Penalty)", isIllegal: true, status: "In Development" },
  { id: "p3", name: "Ceramic Composite 6-Piston Brakes", category: "Brakes", paceGain: 12, reliabilityDelta: 15, cost: 2_800_000, riskPenalty: "Legal (0% Risk)", isIllegal: false, status: "Installed" },
  { id: "p4", name: "High-Compression MGU Turbo Overdrive", category: "Powertrain", paceGain: 22, reliabilityDelta: -8, cost: 5_100_000, riskPenalty: "MODERATE RISK (15% Fuel Flow Scrutiny)", isIllegal: true, status: "Available" },
  { id: "p5", name: "Active Inerter Dampers", category: "Suspension", paceGain: 16, reliabilityDelta: 8, cost: 3_900_000, riskPenalty: "Legal (0% Risk)", isIllegal: false, status: "Available" },
  { id: "p6", name: "Titanium Matrix Exhaust Blown Diffuser", category: "Aerodynamics", paceGain: 28, reliabilityDelta: -12, cost: 7_800_000, riskPenalty: "HIGH RISK (45% FIA Ban Warning)", isIllegal: true, status: "Available" },
];

export const PartsRAndDPanel = memo(function PartsRAndDPanel({ selectedTeam }: { selectedTeam: MotorsportTeam | null }) {
  const { company } = useCompany();
  const [parts, setParts] = useState<MotorsportPart[]>(DEFAULT_PARTS);

  const availableFunds = selectedTeam ? selectedTeam.budget : (company.totalRevenue || 50_000_000);

  const handleDevelop = (id: string) => {
    playHMIClickSound();
    setParts(prev => prev.map(p => p.id === id ? { ...p, status: "In Development" } : p));
    setTimeout(() => {
      setParts(prev => prev.map(p => p.id === id ? { ...p, status: "Installed" } : p));
    }, 2500);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="glass-panel p-5 border-amber-500/20 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">COMPONENT WORKSHOP</span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full">PARTS R&D</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-1">
              <Wrench size={20} className="text-amber-400" /> Motorsport Component Development
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Develop high-performance engine mappings, aero floors, light gearboxes, and brakes. Risk developing illegal breakthrough components for massive pace gains!
            </p>
          </div>

          {selectedTeam && (
            <div className="bg-base-950/80 px-3.5 py-2 rounded-xl border border-white/10 text-right shrink-0">
              <div className="text-[10px] text-slate-400">Target Vehicle</div>
              <div className="text-sm font-bold text-amber-300">{selectedTeam.name}</div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {parts.map((p) => {
            const isInstalled = p.status === "Installed";
            const isInDev = p.status === "In Development";
            const canAfford = availableFunds >= p.cost;

            return (
              <div
                key={p.id}
                className="bg-base-950/70 p-4 rounded-xl border border-white/5 hover:border-amber-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-100">{p.name}</h4>
                    <span className="text-[10px] font-mono bg-base-900 border border-base-800 text-slate-300 px-2 py-0.5 rounded">
                      {p.category}
                    </span>
                    {p.isIllegal && (
                      <span className="text-[10px] font-mono font-bold bg-danger-500/15 border border-danger-500/30 text-danger-400 px-2 py-0.5 rounded flex items-center gap-1">
                        <Flame size={10} /> ILLEGAL SPEC
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 mt-2 flex items-center gap-4 flex-wrap">
                    <span>Pace: <strong className="text-emerald-400 font-mono font-bold">+{p.paceGain} pts</strong></span>
                    <span>Reliability: <strong className={p.reliabilityDelta >= 0 ? "text-cyan-300 font-mono font-bold" : "text-danger-400 font-mono font-bold"}>
                      {p.reliabilityDelta >= 0 ? `+${p.reliabilityDelta}%` : `${p.reliabilityDelta}%`}
                    </strong></span>
                    <span>Cost: <strong className="text-slate-200 font-mono font-bold">${(p.cost / 1e6).toFixed(1)}M</strong></span>
                  </div>

                  <div className={`text-[10px] font-semibold mt-1.5 flex items-center gap-1 ${p.isIllegal ? "text-amber-400" : "text-slate-500"}`}>
                    {p.isIllegal ? <AlertTriangle size={12} className="text-amber-400" /> : <Shield size={12} className="text-slate-500" />}
                    {p.riskPenalty}
                  </div>
                </div>

                <div className="shrink-0">
                  {isInstalled ? (
                    <span className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                      <CheckCircle size={14} /> Installed
                    </span>
                  ) : isInDev ? (
                    <span className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 animate-pulse">
                      <Clock size={14} /> Fabricating...
                    </span>
                  ) : (
                    <button
                      onClick={() => handleDevelop(p.id)}
                      disabled={!canAfford}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 text-amber-300 hover:bg-amber-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Wrench size={12} /> Commission Part
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

