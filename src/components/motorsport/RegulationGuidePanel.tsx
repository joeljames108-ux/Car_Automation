// ===================================================================
// REGULATION GUIDE PANEL — Guides, Series Rules, Technical Compliance
// ===================================================================
import { useState, useMemo, memo } from "react";
import { BookOpen, Star, Target, Shield, CheckCircle, XCircle, Info, ChevronRight, Award, AlertTriangle, Settings } from "lucide-react";
import { CATEGORY_REGULATIONS, CATEGORY_GUIDES, evaluateCompliance } from "../../sim/motorsportEngine";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "./TeamCard";
import { useDesign } from "../../state/DesignContext";
import type { MotorsportCategory } from "../../sim/types";

const DIFFICULTY_LABELS = ["", "Beginner", "Easy", "Moderate", "Hard", "Expert"];

const DifficultyStars = memo(function DifficultyStars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={12} className={i <= value ? "text-yellow-400 fill-yellow-400" : "text-slate-700"} />
      ))}
    </div>
  );
});

export const RegulationGuidePanel = memo(function RegulationGuidePanel() {
  const { sim, design } = useDesign();
  const [guideCategory, setGuideCategory] = useState<MotorsportCategory>("gt");

  const isHybrid = design.engine.layout === "hybrid" || design.engine.hybridArchitecture !== "none" || design.engine.hasMguH;
  const compliance = useMemo(
    () => evaluateCompliance(sim.peakPower, sim.weight, isHybrid, guideCategory),
    [sim.peakPower, sim.weight, isHybrid, guideCategory],
  );

  const guide = CATEGORY_GUIDES[guideCategory];
  const reg = CATEGORY_REGULATIONS[guideCategory];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Category selector */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
        {(Object.keys(CATEGORY_LABELS) as MotorsportCategory[]).map(cat => (
          <button
            key={cat}
            onClick={() => setGuideCategory(cat)}
            className={`px-2 py-2 rounded-xl text-xs font-semibold transition-all border ${
              guideCategory === cat ? CATEGORY_COLORS[cat] : "bg-base-850 border-base-800 text-slate-400 hover:border-base-700"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Overview card */}
      <div className="glass-panel p-5 relative overflow-hidden border-cyan-500/20">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <BookOpen size={20} className="text-cyan-400" /> {guide.name}
            </h3>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">Difficulty:</span>
                <DifficultyStars value={guide.difficulty} />
                <span className="text-[10px] text-slate-300 font-medium">({DIFFICULTY_LABELS[guide.difficulty]})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">Prestige:</span>
                <DifficultyStars value={guide.prestigeTier} />
              </div>
            </div>
          </div>
          <div className="bg-base-950/80 p-3 rounded-xl border border-white/10 text-right shrink-0">
            <div className="text-[10px] text-slate-400">Estimated Budget</div>
            <div className="text-sm font-mono font-bold text-cyan-300">
              ${(guide.budgetRange[0] / 1_000_000).toFixed(0)}M – ${(guide.budgetRange[1] / 1_000_000).toFixed(0)}M
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">{guide.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Iconic Races */}
        <div className="glass-panel p-4 border-white/5">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Award size={14} className="text-yellow-400" /> Iconic Races & Circuits
          </h4>
          <div className="space-y-1.5">
            {guide.iconicRaces.map(r => (
              <div key={r} className="flex items-center gap-2 text-xs text-slate-300 bg-base-900/50 px-2.5 py-1.5 rounded-lg">
                <ChevronRight size={12} className="text-cyan-400" /> {r}
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="text-[10px] text-slate-500 mb-1.5">Real-World Inspiration</div>
            <div className="flex flex-wrap gap-1">
              {guide.realWorldSeries.map(s => (
                <span key={s} className="text-[10px] px-2 py-0.5 bg-base-850 border border-base-800 rounded-full text-slate-300">{s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended Specs */}
        <div className="glass-panel p-4 border-white/5">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Target size={14} className="text-cyan-400" /> Recommended Performance Targets
          </h4>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between bg-base-900/50 p-2 rounded-lg">
              <span className="text-slate-400">Power Window</span>
              <span className="text-slate-100 font-mono font-bold">{guide.recommendedSpecs.powerRange[0]}–{guide.recommendedSpecs.powerRange[1]} HP</span>
            </div>
            <div className="flex justify-between bg-base-900/50 p-2 rounded-lg">
              <span className="text-slate-400">Target Weight</span>
              <span className="text-slate-100 font-mono font-bold">{guide.recommendedSpecs.weightRange[0]}–{guide.recommendedSpecs.weightRange[1]} kg</span>
            </div>
            <div className="flex justify-between bg-base-900/50 p-2 rounded-lg">
              <span className="text-slate-400">Aero Importance</span>
              <span className={`capitalize font-bold ${
                guide.recommendedSpecs.aeroImportance === "critical" ? "text-danger-400" :
                guide.recommendedSpecs.aeroImportance === "high" ? "text-amber-400" : "text-cyan-300"
              }`}>{guide.recommendedSpecs.aeroImportance}</span>
            </div>
            <div className="flex justify-between bg-base-900/50 p-2 rounded-lg">
              <span className="text-slate-400">Reliability Priority</span>
              <span className={`capitalize font-bold ${
                guide.recommendedSpecs.reliabilityImportance === "critical" ? "text-danger-400" :
                guide.recommendedSpecs.reliabilityImportance === "high" ? "text-amber-400" : "text-cyan-300"
              }`}>{guide.recommendedSpecs.reliabilityImportance}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Regulations & Compliance */}
      <div className="glass-panel p-5 border-white/5">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Shield size={14} className="text-amber-400" /> Technical Scrutineering Checks
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <div className="bg-base-950 rounded-lg p-2.5 text-center border border-white/5">
            <div className="text-[10px] text-slate-500 mb-1">Min Weight</div>
            <div className="font-mono text-sm font-bold text-slate-100">{reg.minWeightKg} kg</div>
          </div>
          <div className="bg-base-950 rounded-lg p-2.5 text-center border border-white/5">
            <div className="text-[10px] text-slate-500 mb-1">Max Power</div>
            <div className="font-mono text-sm font-bold text-slate-100">{reg.maxPowerHp} HP</div>
          </div>
          <div className="bg-base-950 rounded-lg p-2.5 text-center border border-white/5">
            <div className="text-[10px] text-slate-500 mb-1">Pit Stops</div>
            <div className="font-mono text-sm font-bold text-slate-100">{reg.mandatoryPitStops}+</div>
          </div>
          <div className="bg-base-950 rounded-lg p-2.5 text-center border border-white/5">
            <div className="text-[10px] text-slate-500 mb-1">Fuel Cap</div>
            <div className="font-mono text-sm font-bold text-slate-100">{reg.fuelCapacityLiters}L</div>
          </div>
        </div>

        {/* Live Vehicle Compliance Result */}
        <div className="bg-base-950/80 p-4 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {compliance.passed
                ? <CheckCircle size={16} className="text-emerald-400" />
                : <XCircle size={16} className="text-danger-400" />
              }
              <span className="text-sm font-bold text-slate-200">Current Design Compliance: {CATEGORY_LABELS[guideCategory]}</span>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              compliance.passed ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" : "text-danger-400 bg-danger-500/15 border-danger-500/30"
            }`}>
              {compliance.passed ? "COMPLIANT (100%)" : `NON-COMPLIANT (${compliance.overallScore}%)`}
            </span>
          </div>

          <div className="space-y-1.5">
            {compliance.checks.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-base-900/60 p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  {c.status === "pass" ? <CheckCircle size={12} className="text-emerald-400 shrink-0" />
                    : c.status === "warning" ? <Info size={12} className="text-amber-400 shrink-0" />
                    : <XCircle size={12} className="text-danger-400 shrink-0" />}
                  <span className="text-slate-300">{c.label}</span>
                </div>
                <span className="text-slate-400 text-[11px] font-mono">{c.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

