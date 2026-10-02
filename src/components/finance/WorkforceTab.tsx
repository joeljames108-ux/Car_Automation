import React from "react";
import {
  Users, Award, TrendingUp, DollarSign, CheckCircle2,
  Sparkles, Shield, Wrench, Briefcase
} from "lucide-react";
import { useReputationStore } from "../../state/reputationStore";
import { calculateWorkforceEconomics, INITIAL_1970_WORKFORCE, EmployeeDepartment } from "../../sim/economy/employeeEconomicsEngine";

export const WorkforceTab: React.FC = () => {
  const { dimensions } = useReputationStore();

  const employerScore = dimensions.employer?.score ?? 30;
  const engineeringScore = dimensions.engineering?.score ?? 30;

  const workforce = calculateWorkforceEconomics(
    INITIAL_1970_WORKFORCE,
    employerScore,
    engineeringScore
  );

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

  const deptLabels: Record<EmployeeDepartment, { name: string; desc: string }> = {
    ENGINEERING: { name: "Powertrain & Mechanical Engineering", desc: "CAD designers, dynamometer engineers, CAE analysts" },
    MANUFACTURING: { name: "Tooling & Plant Assembly", desc: "Machinists, panel beaters, robotic line operators" },
    RD: { name: "Advanced R&D Laboratory", desc: "Metallurgists, aerodynamicists, research scientists" },
    MOTORSPORT: { name: "Works Racing Division", desc: "Trackside race mechanics, telemetry engineers, drivers" },
    DESIGN: { name: "Aesthetic Styling & Clay Studio", desc: "Industrial designers, clay sculptors, interior trim stylists" },
    MANAGEMENT: { name: "Corporate Executive & Finance", desc: "Plant directors, controllers, legal counsel, HR" },
    SALES: { name: "Commercial & Dealer Liaison", desc: "Fleet accounts, regional distributor managers" },
    SERVICE: { name: "After-Sales & Warranty Technicians", desc: "Master field diagnostics techs, customer relations" },
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* ── 1. Workforce Economics Header ── */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#f5f8f6] via-[#f7faf8] to-[#f2f7f4] border border-[#d2e5d7] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-emerald-900 uppercase block mb-1">
              SECTIONS 13 & 14: WORKFORCE ECONOMICS & TALENT ACQUISITION
            </span>
            <div className="text-3xl font-black text-slate-900 font-mono">
              {formatCurrency(workforce.totalMonthlyPayroll)}
              <span className="text-xs text-slate-500 font-normal font-sans ml-2">
                / month ({workforce.totalHeadcount} employees)
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Salaries across 8 core operational divisions adjusted by corporate Employer Reputation and engineering prestige.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#ffffff]/90 border border-[#e2ddd0]">
              <span className="text-slate-500 block text-[10px]">AVG COMPANY SKILL</span>
              <span className="font-bold text-slate-900">{workforce.averageSkillAcrossCompany} / 100</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#ffffff]/90 border border-[#e2ddd0]">
              <span className="text-slate-500 block text-[10px]">PRODUCTIVITY FACTOR</span>
              <span className="font-bold text-emerald-800">{workforce.overallProductivityMultiplier}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Section 14 Employer Reputation Recruitment Mechanics ── */}
      <div className="p-5 rounded-2xl bg-[#ffffff]/90 border border-[#e0dad0] shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#eee8dc]">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-amber-500" />
            <span className="text-xs font-black text-slate-900 font-mono uppercase tracking-wider">
              SECTION 14: EMPLOYER REPUTATION TALENT EFFECTS
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700">
            Employer Score: {employerScore} / 100
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-[#faf9f5] border border-[#e5dfd2]">
            <span className="text-slate-500 block text-[10px]">HIRING DIFFICULTY</span>
            <span className="text-sm font-bold text-slate-900 block mt-0.5">{workforce.hiringDifficulty}</span>
            <span className="text-[10px] text-slate-500 font-sans mt-1 block">
              {workforce.hiringDifficulty === "LOW" ? "Top talent actively submits resumes." : "Must actively recruit via agencies."}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#faf9f5] border border-[#e5dfd2]">
            <span className="text-slate-500 block text-[10px]">TALENT POOL TIER</span>
            <span className="text-sm font-bold text-purple-900 block mt-0.5">{workforce.talentAvailabilityTier}</span>
            <span className="text-[10px] text-slate-500 font-sans mt-1 block">
              Candidate caliber available in regional market.
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#faf9f5] border border-[#e5dfd2]">
            <span className="text-slate-500 block text-[10px]">SALARY PRESTIGE EFFECT</span>
            <span className="text-sm font-bold text-emerald-800 block mt-0.5">
              {workforce.hiringPremiumPct <= 0 ? `${workforce.hiringPremiumPct}% (Discount)` : `+${workforce.hiringPremiumPct}% (Risk Premium)`}
            </span>
            <span className="text-[10px] text-slate-500 font-sans mt-1 block">
              {workforce.hiringPremiumPct <= 0 ? "Engineers accept lower salary for brand prestige." : "Obscurity risk premium required."}
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. Department Headcount & Payroll Table ── */}
      <div className="p-5 rounded-2xl bg-[#ffffff]/90 border border-[#e0dad0] shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#eee8dc]">
          <span className="text-xs font-black text-slate-900 font-mono uppercase tracking-wider">
            DEPARTMENTAL HEADCOUNT & PAYROLL ALLOCATION
          </span>
          <span className="text-xs font-mono text-slate-500">
            8 Operating Divisions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#e2ddd0] text-slate-500 text-[10px]">
                <th className="py-2">DEPARTMENT</th>
                <th className="py-2">HEADCOUNT</th>
                <th className="py-2">AVG SKILL</th>
                <th className="py-2">BENCHMARK SALARY</th>
                <th className="py-2">ACTUAL SALARY (ADJ.)</th>
                <th className="py-2 text-right">MONTHLY PAYROLL</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(workforce.departments) as EmployeeDepartment[]).map((deptKey) => {
                const dept = workforce.departments[deptKey];
                const meta = deptLabels[deptKey];
                return (
                  <tr key={deptKey} className="border-b border-[#f2ede4] hover:bg-[#fbf9f4]">
                    <td className="py-2.5 font-sans">
                      <div className="font-bold text-slate-900 text-xs">{meta.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{meta.desc}</div>
                    </td>
                    <td className="py-2.5 font-bold text-slate-900">{dept.headcount} staff</td>
                    <td className="py-2.5 text-purple-800 font-bold">{dept.averageSkillScore} / 100</td>
                    <td className="py-2.5 text-slate-500">{formatCurrency(dept.baseMarketSalaryMonthly)}</td>
                    <td className="py-2.5 font-bold text-slate-800">{formatCurrency(dept.actualSalaryMonthly)}</td>
                    <td className="py-2.5 text-right font-bold text-emerald-800">
                      {formatCurrency(dept.monthlyPayroll)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
