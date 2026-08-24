// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — FIA TECHNICAL REGULATION VIEWER
// ============================================================================

import React, { useState } from "react";
import { BookOpen, CheckCircle2, AlertTriangle, Shield, Zap, Wind, Scale, Search, Sliders } from "lucide-react";
import { useF1ConstructorStore } from "../../sim/f1/state/f1ConstructorStore";
import { F1PhysicsEngine } from "../../sim/f1/physics/f1PhysicsEngine";

export const F1RegulationViewer: React.FC = () => {
  const { car } = useF1ConstructorStore();
  const report = F1PhysicsEngine.runScrutineering(car);
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const filteredItems = report.items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.articleCode.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Banner */}
      <div className="glass-panel p-6 border-ok-500/20 bg-gradient-to-r from-slate-900 via-slate-900/90 to-ok-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="text-ok-400" size={24} />
            <h2 className="text-xl font-bold text-slate-100 tracking-wide">
              FIA Formula 1 Technical Regulations (2026 Edition)
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Official Technical Working Group rulebook governing aerodynamic dimensions, power unit limits, minimum mass, and driver safety structures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-black font-mono text-ok-400">{report.overallScore}%</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Homologation Score</div>
          </div>
          <div className={`p-3 rounded-xl border ${report.passedHomologation ? 'bg-ok-500/20 border-ok-500/40 text-ok-300' : 'bg-danger-500/20 border-danger-500/40 text-danger-300'}`}>
            {report.passedHomologation ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
          <input
            type="text"
            placeholder="Search regulations (e.g. Art 3.5)..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-ok-500/50"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {["ALL", "WEIGHT", "POWER_UNIT", "AERO", "CHASSIS", "SAFETY"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                categoryFilter === cat
                  ? "bg-ok-500/20 text-ok-300 border border-ok-500/40 shadow-sm"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scrutineering Checks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.articleCode}
            className={`p-4 rounded-xl border transition-all ${
              item.status === "PASS"
                ? "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                : "bg-danger-950/20 border-danger-500/40 shadow-lg shadow-danger-950/20"
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {item.articleCode}
                </span>
                <span className="text-xs font-semibold text-slate-200">{item.title}</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  item.status === "PASS"
                    ? "bg-ok-500/15 text-ok-400 border border-ok-500/30"
                    : "bg-danger-500/15 text-danger-400 border border-danger-500/30"
                }`}
              >
                {item.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2 text-xs bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Requirement</div>
                <div className="font-mono text-slate-300 font-semibold">{item.regulatoryRequirement}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Current Car Value</div>
                <div className={`font-mono font-bold ${item.status === "PASS" ? "text-ok-400" : "text-danger-400"}`}>
                  {item.currentValue}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50">
              <span>{item.remediationAdvice}</span>
              <span className="font-mono text-slate-500">{item.deltaToLimit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
