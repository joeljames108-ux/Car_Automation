import React, { useState } from "react";
import {
  X, Sliders, PieChart, AlertTriangle, CheckCircle2,
  DollarSign, Sparkles, ShieldAlert, RotateCcw, ArrowRight,
  FlaskConical, Megaphone, Flag, Wrench, GraduationCap, PiggyBank
} from "lucide-react";
import {
  useBudgetStore,
  BudgetItemKey,
  evaluateBudgetCompliance,
} from "../../sim/economy/budgetAllocationEngine";
import { useCompanyFinanceStore } from "../../state/companyFinanceStore";

interface BudgetAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<BudgetItemKey, React.ReactNode> = {
  RD: <FlaskConical size={16} className="text-purple-600" />,
  MARKETING: <Megaphone size={16} className="text-sky-600" />,
  MOTORSPORT: <Flag size={16} className="text-rose-600" />,
  CAPEX_RESERVE: <Wrench size={16} className="text-amber-600" />,
  EMPLOYEE_TRAINING: <GraduationCap size={16} className="text-emerald-600" />,
  CASH_RESERVE: <PiggyBank size={16} className="text-slate-600" />,
};

const CATEGORY_DESCRIPTIONS: Record<BudgetItemKey, string> = {
  RD: "Engineering research domains, powertrain dyno tests, aerodynamic wind tunnel hours",
  MARKETING: "Brand campaigns, dealer co-op advertising, launch awareness, showroom merchandising",
  MOTORSPORT: "Factory racing team operations, competition chassis development, telemetry testing",
  CAPEX_RESERVE: "Factory machine tooling, stamping die replacement, assembly line expansion fund",
  EMPLOYEE_TRAINING: "Craftsmanship apprentice school, automated QA quality certification, Six-Sigma training",
  CASH_RESERVE: "Unallocated liquid liquidity buffer kept in treasury for safety against demand shocks",
};

export const BudgetAllocationModal: React.FC<BudgetAllocationModalProps> = ({ isOpen, onClose }) => {
  const { plan, setTotalBudget, setItemPercentage, setCashThreshold, resetTo1970 } = useBudgetStore();
  const { cash, monthlyExpenses, lastTickResult } = useCompanyFinanceStore();

  const [localTotal, setLocalTotal] = useState<string>(
    plan.totalMonthlyDiscretionaryBudget.toString()
  );

  if (!isOpen) return null;

  const formatCurrency = (val: number) => {
    const isNegative = val < 0;
    const abs = Math.abs(val);
    if (abs >= 10000000) {
      return (isNegative ? "-" : "") + "₹" + (abs / 10000000).toFixed(2) + " Cr";
    }
    if (abs >= 100000) {
      return (isNegative ? "-" : "") + "₹" + (abs / 100000).toFixed(1) + " L";
    }
    return (isNegative ? "-" : "") + "₹" + Math.round(abs).toLocaleString("en-IN");
  };

  const totalPercentage = Object.values(plan.items).reduce(
    (sum, item) => sum + item.percentageOfBudget,
    0
  );

  // Derive last month actuals from lastTickResult if available
  const actuals: Partial<Record<BudgetItemKey, number>> = {
    RD: lastTickResult?.pipelineSteps.find((s) => s.step === 2)?.netImpact
      ? Math.abs(lastTickResult.pipelineSteps.find((s) => s.step === 2)!.netImpact)
      : 450000,
    MARKETING: 60000,
    MOTORSPORT: lastTickResult?.motorsportExpense ?? 0,
    CAPEX_RESERVE: 60000,
    EMPLOYEE_TRAINING: 30000,
    CASH_RESERVE: 0,
  };

  const compliance = evaluateBudgetCompliance(plan, actuals);

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setLocalTotal(valStr);
    const num = parseFloat(valStr);
    if (!isNaN(num) && num >= 10000) {
      setTotalBudget(num);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#faf9f5] border border-[#d8d2c4] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* ── Modal Header ── */}
        <div className="px-6 py-4 bg-white border-b border-[#e2ddd2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700">
              <Sliders size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black font-sans text-slate-900 tracking-tight">
                  MONTHLY BUDGET ALLOCATION PLANNER
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                  Concept 29
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Distribute company discretionary cash flow across R&D, Marketing, Motorsport, CapEx and Training reserves.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetTo1970}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Reset to 1970 Default Allocation"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Modal Body (Scrollable) ── */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Top Controls Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#ded8cb] shadow-2xs">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Total Monthly Discretionary Pool
              </label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  value={localTotal}
                  onChange={handleTotalChange}
                  step={50000}
                  className="w-full pl-7 pr-3 py-2 bg-[#f6f4ee] border border-[#d8d2c4] rounded-xl font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                {formatCurrency(plan.totalMonthlyDiscretionaryBudget)} / month
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#ded8cb] shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  Total Allocated (%)
                </label>
                <span
                  className={`text-xs font-mono font-bold ${
                    totalPercentage === 100
                      ? "text-emerald-700"
                      : totalPercentage > 100
                      ? "text-rose-700"
                      : "text-amber-700"
                  }`}
                >
                  {totalPercentage}% / 100%
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200 mt-2">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    totalPercentage === 100
                      ? "bg-emerald-600"
                      : totalPercentage > 100
                      ? "bg-rose-600"
                      : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.min(100, totalPercentage)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-2 block">
                {totalPercentage === 100
                  ? "✓ 100% fully balanced"
                  : totalPercentage > 100
                  ? `⚠️ Over-budget by ${totalPercentage - 100}%`
                  : `⚠️ ${100 - totalPercentage}% unallocated`}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#ded8cb] shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Cash Protection Buffer
                </span>
                <span className="text-base font-mono font-bold text-slate-900">
                  ₹{(cash / 1000000).toFixed(1)}M
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-1">
                Runway: <span className="font-bold text-slate-800">{(cash / Math.max(1, monthlyExpenses)).toFixed(1)} months</span>
              </div>
            </div>
          </div>

          {/* Allocation Sliders */}
          <div className="p-5 rounded-2xl bg-white border border-[#ded8cb] shadow-2xs">
            <h3 className="text-xs font-black font-mono uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-slate-100">
              DISCRETIONARY ALLOCATION PER STRATEGIC PILLAR
            </h3>

            <div className="space-y-5">
              {(Object.keys(plan.items) as BudgetItemKey[]).map((key) => {
                const item = plan.items[key];
                return (
                  <div key={key} className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#e5e0d4] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {CATEGORY_ICONS[key]}
                        <span className="text-xs font-bold text-slate-900 font-sans">
                          {item.label}
                        </span>
                        {item.isPriority && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                            PRIORITY
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-slate-900">
                          {formatCurrency(item.targetMonthlyAmount)} / mo
                        </span>
                        <span className="w-12 text-right text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {item.percentageOfBudget}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={item.percentageOfBudget}
                        onChange={(e) => setItemPercentage(key, parseInt(e.target.value) || 0)}
                        className="flex-1 accent-amber-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 font-sans">
                      {CATEGORY_DESCRIPTIONS[key]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Variance & Actual Spend Audit */}
          <div className="p-5 rounded-2xl bg-white border border-[#ded8cb] shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black font-mono uppercase tracking-wider text-slate-900">
                LAST MONTH VARIANCE & COMPLIANCE AUDIT
              </h3>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                  compliance.isOverallOverBudget
                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}
              >
                {compliance.isOverallOverBudget ? "⚠️ BUDGET OVERRUN" : "✓ COMPLIANT"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] text-slate-500 uppercase">
                    <th className="pb-2 font-bold">Category</th>
                    <th className="pb-2 font-bold text-right">Planned (Target)</th>
                    <th className="pb-2 font-bold text-right">Actual Incurred</th>
                    <th className="pb-2 font-bold text-right">Variance (₹)</th>
                    <th className="pb-2 font-bold text-right">Variance (%)</th>
                    <th className="pb-2 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {compliance.reports.map((rep) => (
                    <tr key={rep.key} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 font-sans font-medium text-slate-800">
                        {rep.label}
                      </td>
                      <td className="py-2.5 text-right text-slate-600">
                        {formatCurrency(rep.plannedAmount)}
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-900">
                        {formatCurrency(rep.actualAmount)}
                      </td>
                      <td
                        className={`py-2.5 text-right font-bold ${
                          rep.varianceAmount > 0 ? "text-rose-700" : "text-emerald-700"
                        }`}
                      >
                        {rep.varianceAmount > 0 ? "+" : ""}
                        {formatCurrency(rep.varianceAmount)}
                      </td>
                      <td
                        className={`py-2.5 text-right ${
                          rep.variancePct > 0 ? "text-rose-700" : "text-emerald-700"
                        }`}
                      >
                        {rep.variancePct > 0 ? "+" : ""}
                        {rep.variancePct}%
                      </td>
                      <td className="py-2.5 text-center">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                            rep.isOverBudget
                              ? "bg-rose-50 text-rose-800 border-rose-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          {rep.isOverBudget ? "OVER" : "OK"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Modal Footer ── */}
        <div className="px-6 py-4 bg-white border-t border-[#e2ddd2] flex items-center justify-between">
          <div className="text-xs text-slate-500 font-sans">
            Budget settings are persisted in memory and guide the double-entry monthly tick.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-mono font-bold shadow-xs transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
