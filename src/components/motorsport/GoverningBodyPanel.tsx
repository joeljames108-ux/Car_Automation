// ===================================================================
// GOVERNING BODY PANEL — Technical Directives, BoP & Regulatory Rules
// ===================================================================
import { useState } from "react";
import { Building2, Gavel, Shield, Zap, Gauge, Scale, AlertCircle } from "lucide-react";
import { CATEGORY_REGULATIONS } from "../../sim/motorsportEngine";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "./TeamCard";
import type { MotorsportCategory } from "../../sim/types";

export function GoverningBodyPanel() {
  const [selectedCategory, setSelectedCategory] = useState<MotorsportCategory>("gt");
  const reg = CATEGORY_REGULATIONS[selectedCategory];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="glass-panel p-6 border-cyan-500/25 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Building2 size={140} className="text-cyan-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              <Building2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">WORLD MOTORSPORT COUNCIL</span>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full">OFFICIAL AUTHORITY</span>
              </div>
              <h2 className="text-xl font-bold text-slate-100">FIA International Motorsport Authority</h2>
              <p className="text-xs text-slate-400">Regulating technical specifications, race calendars, budget caps & pit protocols</p>
            </div>
          </div>

          {/* Category selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-400">Championship:</span>
            <div className="flex gap-1 flex-wrap">
              {(Object.keys(CATEGORY_LABELS) as MotorsportCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                    selectedCategory === cat ? CATEGORY_COLORS[cat] : "bg-base-850 border-base-800 text-slate-400 hover:border-base-700"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Official Directives & Regulations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-base-950/80 rounded-xl p-4 border border-white/5">
            <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Max Power Output</div>
            <div className="text-xl font-black font-mono text-cyan-300">{reg.maxPowerHp} HP</div>
            <div className="text-[10px] text-slate-500 mt-1">Enforced by fuel flow restrictors</div>
          </div>
          <div className="bg-base-950/80 rounded-xl p-4 border border-white/5">
            <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Minimum Car Weight</div>
            <div className="text-xl font-black font-mono text-slate-200">{reg.minWeightKg} kg</div>
            <div className="text-[10px] text-slate-500 mt-1">Post-race ballast scrutiny</div>
          </div>
          <div className="bg-base-950/80 rounded-xl p-4 border border-white/5">
            <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Budget Cap Mandate</div>
            <div className="text-xl font-black font-mono text-emerald-400">
              {reg.maxBudgetCap > 0 ? `$${(reg.maxBudgetCap / 1e6).toFixed(0)}M` : "NO CAP"}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Financial fair play audit</div>
          </div>
          <div className="bg-base-950/80 rounded-xl p-4 border border-white/5">
            <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Mandatory Pit Stops</div>
            <div className="text-xl font-black font-mono text-purple-400">{reg.mandatoryPitStops} Stops</div>
            <div className="text-[10px] text-slate-500 mt-1">Multi-compound tire rules</div>
          </div>
        </div>

        {/* Official Regulation Mandates List */}
        <div className="bg-base-950/60 rounded-xl p-4 border border-white/5 space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Gavel size={14} className="text-yellow-400" /> Active Technical Directives ({CATEGORY_LABELS[selectedCategory]})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="bg-base-900/60 p-3 rounded-lg border border-base-800 flex items-center justify-between">
              <span className="text-slate-300">Balance of Performance (BoP):</span>
              <span className={`font-semibold ${reg.bopEnabled ? "text-emerald-400" : "text-slate-500"}`}>
                {reg.bopEnabled ? "ACTIVE (STRICT)" : "DISABLED"}
              </span>
            </div>
            <div className="bg-base-900/60 p-3 rounded-lg border border-base-800 flex items-center justify-between">
              <span className="text-slate-300">Hybrid / EV Architecture:</span>
              <span className={`font-semibold ${reg.evRequirement ? "text-cyan-400" : "text-slate-500"}`}>
                {reg.evRequirement ? "MANDATORY" : "OPTIONAL"}
              </span>
            </div>
            <div className="bg-base-900/60 p-3 rounded-lg border border-base-800 flex items-center justify-between">
              <span className="text-slate-300">Tire Sets Per Race Weekend:</span>
              <span className="font-semibold text-slate-200">{reg.maxTireSetsPerRace} Sets Max</span>
            </div>
            <div className="bg-base-900/60 p-3 rounded-lg border border-base-800 flex items-center justify-between">
              <span className="text-slate-300">Air Intake Restrictor Plate:</span>
              <span className={`font-semibold ${reg.restrictorPlate ? "text-amber-400" : "text-slate-500"}`}>
                {reg.restrictorPlate ? "REQUIRED" : "NOT REQUIRED"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
