/**
 * ═══════════════════════════════════════════════════════════════════════
 * RANK PYRAMID & WORKFORCE COMPOSITION STUDIO (SECTION 12)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 12 & 30:
 * - Two companies with 500 engineers perform completely differently based on rank:
 *   - Company A (Junior Academy): Low payroll, high mentorship growth, internal talent pipeline
 *   - Company B (Senior Elite): High payroll, immense technical authority, zero design defects
 * - Interactive rank breakdown from Apprentice (R1) to CEO (R9)
 * - Strategic batch hiring & promotion controls
 */

import React from "react";
import {
  Users, Award, TrendingUp, ShieldAlert, Zap,
  Briefcase, ChevronRight, CheckCircle2, ArrowUpRight
} from "lucide-react";
import { useWorkforceStore } from "../../state/workforceStore";
import { EmployeeRank, RANK_NAMES } from "../../sim/workforce/workforceTypes";

export const RankPyramidStudio: React.FC = () => {
  const { departments, hireAggregatedStaff, get12KeyMetrics } = useWorkforceStore();
  const metrics = get12KeyMetrics();

  const rawRanks = metrics.employeesByRank.raw;
  const total = Math.max(1, metrics.totalEmployees);

  // Groupings
  const juniorCount = metrics.employeesByRank.junior;
  const specialistCount = metrics.employeesByRank.specialist;
  const principalCount = metrics.employeesByRank.principal;
  const managementCount = metrics.employeesByRank.management;

  const juniorPct = Math.round((juniorCount / total) * 100);
  const specialistPct = Math.round((specialistCount / total) * 100);
  const principalPct = Math.round((principalCount / total) * 100);
  const managementPct = Math.round((managementCount / total) * 100);

  // Archetype diagnosis
  let currentPosture = "BALANCED_PYRAMID";
  let postureTitle = "Balanced Industry Pyramid";
  let postureDesc = "Standard corporate distribution balancing cost efficiency with experienced guidance.";

  if (juniorPct >= 45) {
    currentPosture = "JUNIOR_ACADEMY";
    postureTitle = "Junior-Heavy Engineering Academy (Company A Archetype)";
    postureDesc = "Low payroll footprint with massive organic talent development capacity (+18% junior growth rate). Requires senior leadership to avoid execution defects.";
  } else if (principalPct >= 10 || specialistPct >= 65) {
    currentPosture = "SENIOR_ELITE";
    postureTitle = "Senior Elite Engineering Core (Company B Archetype)";
    postureDesc = "Phenomenal technical authority and rapid breakthrough project velocity. Higher payroll run-rate with minimal design revisions.";
  }

  // Quick Action Handler
  const handleQuickRecruit = (rank: EmployeeRank, count: number) => {
    // Distribute into largest active technical department (Powertrain or Manufacturing)
    hireAggregatedStaff("POWERTRAIN", rank, count);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      
      {/* ─────────────────────────────────────────────────────────────
          1. ARCHETYPE COMPARISON BANNER
      ───────────────────────────────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-[#fdfbf7] border border-[#dad4c5] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#dad4c5]">
          <div>
            <span className="text-[10px] text-amber-800 font-bold uppercase tracking-widest block">
              SECTION 12 • STRATEGIC RANK COMPOSITION
            </span>
            <h2 className="text-lg font-black text-slate-900 mt-1">
              {postureTitle}
            </h2>
            <p className="text-xs text-slate-600 font-sans max-w-3xl mt-1">
              {postureDesc}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">MONTHLY TALENT RUN-RATE</span>
              <span className="text-base font-black text-slate-900">
                ₹{(metrics.estimatedMonthlyPayroll / 1000).toFixed(0)}k <span className="text-xs text-slate-400 font-normal">/ mo</span>
              </span>
            </div>
          </div>
        </div>

        {/* Visual Pyramid Bar */}
        <div className="mt-5 space-y-2">
          <div className="flex justify-between text-[11px] font-bold text-slate-700">
            <span>Rank Tier Distribution</span>
            <span>Total: {total} Personnel</span>
          </div>

          <div className="w-full h-7 rounded-2xl bg-slate-200 overflow-hidden flex shadow-inner border border-slate-300">
            <div
              style={{ width: `${juniorPct}%` }}
              className="h-full bg-blue-500 text-white flex items-center justify-center font-bold text-[10px] transition-all"
              title={`Juniors (R1-R2): ${juniorCount} (${juniorPct}%)`}
            >
              {juniorPct > 8 && `Junior ${juniorPct}%`}
            </div>
            <div
              style={{ width: `${specialistPct}%` }}
              className="h-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] transition-all"
              title={`Specialists (R3-R4): ${specialistCount} (${specialistPct}%)`}
            >
              {specialistPct > 8 && `Specialists ${specialistPct}%`}
            </div>
            <div
              style={{ width: `${principalPct}%` }}
              className="h-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px] transition-all"
              title={`Principals (R5): ${principalCount} (${principalPct}%)`}
            >
              {principalPct > 5 && `Principal ${principalPct}%`}
            </div>
            <div
              style={{ width: `${managementPct}%` }}
              className="h-full bg-amber-600 text-white flex items-center justify-center font-bold text-[10px] transition-all"
              title={`Management (R6-R9): ${managementCount} (${managementPct}%)`}
            >
              {managementPct > 5 && `Mgmt ${managementPct}%`}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[10px]">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-blue-800 font-bold block">JUNIOR ASSOCIATES</span>
              <span className="text-slate-900 font-bold text-sm block mt-0.5">{juniorCount}</span>
              <span className="text-slate-500 font-sans block">{juniorPct}% of company</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-800 font-bold block">SPECIALISTS & SENIORS</span>
              <span className="text-slate-900 font-bold text-sm block mt-0.5">{specialistCount}</span>
              <span className="text-slate-500 font-sans block">{specialistPct}% of company</span>
            </div>
            <div className="p-2 rounded-xl bg-purple-50 border border-purple-200">
              <span className="text-purple-800 font-bold block">PRINCIPALS & LEADS</span>
              <span className="text-slate-900 font-bold text-sm block mt-0.5">{principalCount}</span>
              <span className="text-slate-500 font-sans block">{principalPct}% of company</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-amber-800 font-bold block">MANAGERS & DIRECTORS</span>
              <span className="text-slate-900 font-bold text-sm block mt-0.5">{managementCount}</span>
              <span className="text-slate-500 font-sans block">{managementPct}% of company</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. DETAILED 9-RANK HIERARCHY TABLE
      ───────────────────────────────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-[#fdfbf7] border border-[#dad4c5] shadow-xs">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">
          AUTOMOTIVE ENTERPRISE RANK PYRAMID (RANKS 1 THROUGH 9)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#dad4c5] text-[10px] text-slate-400 uppercase">
                <th className="py-2.5 px-3">RANK & TITLE</th>
                <th className="py-2.5 px-3">HEADCOUNT</th>
                <th className="py-2.5 px-3">SHARE</th>
                <th className="py-2.5 px-3">PRODUCTIVITY FACTOR</th>
                <th className="py-2.5 px-3">PRIMARY RESPONSIBILITY</th>
                <th className="py-2.5 px-3 text-right">BENCHMARK SALARY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-sans">
              {[
                { r: 9, title: RANK_NAMES[9].title, prod: "0.05× (Strategic Only)", resp: "Corporate vision, capital allocation & ultimate executive authority", salary: "₹120,000" },
                { r: 8, title: RANK_NAMES[8].title, prod: "0.10× (Divisional)", resp: "Division leadership (CTO, Chief Designer, Chief Operating Officer)", salary: "₹80,000" },
                { r: 7, title: RANK_NAMES[7].title, prod: "0.20× (Governance)", resp: "Department head directing clay studio, wind tunnel or plant facility", salary: "₹52,000" },
                { r: 6, title: RANK_NAMES[6].title, prod: "0.50× (Supervisory)", resp: "Span-of-control supervisor maintaining worker discipline & timeline", salary: "₹36,000" },
                { r: 5, title: RANK_NAMES[5].title, prod: "1.60× (+Force Multiplier)", resp: "Chief technical authority (+8% to +25% productivity multiplier to team)", salary: "₹29,000" },
                { r: 4, title: RANK_NAMES[4].title, prod: "1.30× (High Autonomy)", resp: "Complex subsystem design (turbochargers, monocoques, clay modeling)", salary: "₹18,500" },
                { r: 3, title: RANK_NAMES[3].title, prod: "1.00× (Standard)", resp: "CAD drafting, component machining, bench testing & telemetry logging", salary: "₹12,000" },
                { r: 2, title: RANK_NAMES[2].title, prod: "0.60× (Learning)", resp: "Supervised junior calculations, tooling inspection, workshop assistance", salary: "₹7,000" },
                { r: 1, title: RANK_NAMES[1].title, prod: "0.35× (Apprentice)", resp: "Vocational apprentices absorbing mentorship from senior veterans", salary: "₹4,500" },
              ].map((row) => {
                const count = rawRanks[row.r as EmployeeRank] || 0;
                const pct = Math.round((count / total) * 100);
                return (
                  <tr key={row.r} className="hover:bg-slate-50 transition-colors font-mono text-xs">
                    <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
                        R{row.r}
                      </span>
                      {row.title}
                    </td>
                    <td className="py-2.5 px-3 font-black text-slate-900">{count}</td>
                    <td className="py-2.5 px-3 text-slate-500">{pct}%</td>
                    <td className="py-2.5 px-3 text-slate-700 font-sans text-[11px]">{row.prod}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-sans text-[11px]">{row.resp}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{row.salary}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. STRATEGIC RECRUITMENT PRESETS
      ───────────────────────────────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-[#fdfbf7] border border-[#dad4c5] shadow-xs">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">
          STRATEGIC RECRUITMENT & POSTURE SHIFTS
        </h3>
        <p className="text-xs text-slate-600 font-sans mb-4">
          Quickly adjust your organization's posture between the cost-efficient Junior Academy and the elite Senior Powerhouse.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#dad4c5] flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-blue-700 font-bold uppercase block">COMPANY A STRATEGY</span>
              <h4 className="font-bold text-slate-900 mt-1">Hire Junior Apprentices (+5)</h4>
              <p className="text-[11px] text-slate-500 font-sans mt-1">
                Recruits 5 apprentices into Powertrain. Minimal payroll increase, rapid internal skill growth.
              </p>
            </div>
            <button
              onClick={() => handleQuickRecruit(1, 5)}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Users size={13} />
              Enlist 5 Apprentices
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#dad4c5] flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">WORKHORSE BACKBONE</span>
              <h4 className="font-bold text-slate-900 mt-1">Hire Senior Specialists (+3)</h4>
              <p className="text-[11px] text-slate-500 font-sans mt-1">
                Adds 3 high-autonomy Senior Specialists (R4) to accelerate active vehicle and engine projects.
              </p>
            </div>
            <button
              onClick={() => handleQuickRecruit(4, 3)}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Zap size={13} />
              Hire 3 Seniors
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#dad4c5] flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-purple-700 font-bold uppercase block">COMPANY B STRATEGY</span>
              <h4 className="font-bold text-slate-900 mt-1">Recruit Principal Engineer (+1)</h4>
              <p className="text-[11px] text-slate-500 font-sans mt-1">
                Adds a Rank 5 technical authority providing an instant +8% to +25% force multiplier across all staff.
              </p>
            </div>
            <button
              onClick={() => handleQuickRecruit(5, 1)}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Award size={13} />
              Appoint 1 Principal
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
