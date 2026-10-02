import React from "react";
import {
  FlaskConical, Sparkles, CheckCircle2, Clock, Users, Building,
  ArrowRight, ShieldCheck, Zap
} from "lucide-react";
import { useCompanyFinanceStore, RDCategory } from "../../state/companyFinanceStore";

export const RDSpendingTab: React.FC = () => {
  const { rdBudget, setRDBudget } = useCompanyFinanceStore();

  const formatCurrency = (val: number) => {
    const isNegative = val < 0;
    const abs = Math.abs(val);
    if (abs >= 10000000) {
      return (isNegative ? "-" : "") + "₹" + (abs / 10000000).toFixed(2) + " Cr";
    }
    if (abs >= 100000) {
      return (isNegative ? "-" : "") + "₹" + (abs / 100000).toFixed(1) + " L";
    }
    return (isNegative ? "-" : "") + "₹" + abs.toLocaleString("en-IN");
  };

  const categories: Array<{ key: RDCategory; label: string; color: string; desc: string }> = [
    { key: "PERFORMANCE", label: "Performance & Powertrain", color: "text-rose-700 bg-rose-50 border-rose-200", desc: "Engine compression, forced induction, valvetrain" },
    { key: "RELIABILITY", label: "Durability & Thermal", color: "text-emerald-700 bg-emerald-50 border-emerald-200", desc: "Forged tolerances, cooling capacity, cycle life" },
    { key: "DESIGN", label: "Chassis & Dynamics", color: "text-sky-700 bg-sky-50 border-sky-200", desc: "Suspension geometry, steering kinematics, weight balance" },
    { key: "MANUFACTURING", label: "Tooling & Automation", color: "text-amber-700 bg-amber-50 border-amber-200", desc: "Precision stamping, weld robots, takt speed" },
    { key: "SAFETY", label: "Crash & Structural", color: "text-indigo-700 bg-indigo-50 border-indigo-200", desc: "Crumple zones, cabin rigid cell, braking assist" },
    { key: "ELECTRONICS", label: "ECUs & Telemetry", color: "text-purple-700 bg-purple-50 border-purple-200", desc: "Solid-state ignition, injection mapping, sensors" },
    { key: "LUXURY", label: "Acoustics & NVH", color: "text-stone-700 bg-stone-100 border-stone-200", desc: "Cabin soundproofing, viscoelastic dampening, trim" },
    { key: "MOTORSPORT", label: "Racing Aero & Downforce", color: "text-red-700 bg-red-50 border-red-200", desc: "Ground-effect tunnels, wing profiles, aero balance" },
  ];

  const handleAllocationChange = (cat: RDCategory, val: number) => {
    const updated = { ...rdBudget.allocations, [cat]: val };
    setRDBudget({ allocations: updated });
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* ── 1. Top Philosophy Banner ── */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#f5f3fa] via-[#f7f5fb] to-[#f2eff8] border border-[#dcd3eb] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FlaskConical size={16} className="text-purple-700" />
              <span className="text-xs font-mono font-bold text-purple-900 uppercase">
                SECTIONS 10–12: RESEARCH & DEVELOPMENT BUDGETING
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono">
              {formatCurrency(rdBudget.totalMonthlyBudget)}
              <span className="text-xs text-slate-500 font-normal font-sans ml-2">/ month research burn</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl italic font-serif">
              "Money alone does NOT automatically create reputation. It creates technical development. Successful technology becomes reputation later when cars win races or prove bulletproof in customer hands."
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-purple-900 bg-purple-100 border border-purple-300 px-3 py-1.5 rounded-xl">
              {rdBudget.activeProjects.filter((p) => p.status === "ACTIVE").length} Active Research Programs
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Active Engineering Programs List ── */}
      <div className="p-5 rounded-2xl bg-[#ffffff]/90 border border-[#e0dad0] shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#eee8dc]">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-amber-500" />
            <span className="text-xs font-black text-slate-900 font-mono uppercase tracking-wider">
              ACTIVE ENGINEERING RESEARCH PROGRAMS
            </span>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Funded by Monthly Allocation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rdBudget.activeProjects.map((project) => {
            const progressPct = Math.round((project.spent / project.totalBudget) * 100);
            return (
              <div
                key={project.projectId}
                className="p-4 rounded-xl bg-[#faf9f6] border border-[#e2ddd2] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 font-sans">
                      {project.name}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md uppercase border ${
                        project.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-sky-100 text-sky-800 border-sky-300"
                      }`}
                    >
                      {project.status === "COMPLETED" ? "PATENT READY" : `${project.monthsRemaining} Mos Left`}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] font-mono text-slate-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Users size={12} className="text-slate-500" />
                      {project.requiredEmployees} Engineers
                    </span>
                    <span className="flex items-center gap-1">
                      <Building size={12} className="text-slate-500" />
                      {project.requiredFacilities.length} Facilities
                    </span>
                    <span className="text-purple-800 font-bold">
                      {formatCurrency(project.monthlyCost)} / mo
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-[#e8e4d8] overflow-hidden border border-[#ded8c8] mb-1.5">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-2 border-t border-[#eee8dc]">
                  <span>
                    Spent: {formatCurrency(project.spent)} / {formatCurrency(project.totalBudget)}
                  </span>
                  <span className="font-bold text-slate-800">{progressPct}% Complete</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. Category Sliders ── */}
      <div className="p-5 rounded-2xl bg-[#ffffff]/90 border border-[#e0dad0] shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#eee8dc]">
          <span className="text-xs font-black text-slate-900 font-mono uppercase tracking-wider">
            RESEARCH DOMAIN CAPITAL ALLOCATION (%)
          </span>
          <span className="text-xs font-mono font-bold text-slate-600">
            Total Allocated: {Object.values(rdBudget.allocations).reduce((a, b) => a + b, 0)}%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const val = rdBudget.allocations[cat.key] || 0;
            const monthlyShare = (rdBudget.totalMonthlyBudget * val) / 100;
            return (
              <div key={cat.key} className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#e2ddd2]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">{cat.label}</span>
                  <span className="text-xs font-black font-mono text-purple-900">{val}%</span>
                </div>
                <div className="text-[10px] text-slate-500 mb-2 font-mono">
                  {formatCurrency(monthlyShare)} / month
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={val}
                  onChange={(e) => handleAllocationChange(cat.key, parseInt(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <div className="text-[10px] text-slate-500 mt-1 leading-tight">{cat.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
