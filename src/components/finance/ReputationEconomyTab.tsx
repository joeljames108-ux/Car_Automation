import React from "react";
import {
  Award, TrendingUp, TrendingDown, ShieldCheck, DollarSign,
  Percent, Sparkles, Building2, Users, Wrench, Factory, FileCheck
} from "lucide-react";
import { useReputationStore } from "../../state/reputationStore";
import { useCompanyFinanceStore } from "../../state/companyFinanceStore";
import { calculateReputationFinancialModifiers } from "../../sim/economy/reputationEconomicBridge";

export const ReputationEconomyTab: React.FC = () => {
  const { dimensions, overallReputation, overallLevel } = useReputationStore();
  const { monthlyRevenue, monthlyExpenses, balanceSheet } = useCompanyFinanceStore();

  const repModifiers = calculateReputationFinancialModifiers(dimensions, {
    annualPayrollEstimate: monthlyExpenses * 12 * 0.45,
    annualBOMSpendEstimate: monthlyExpenses * 12 * 0.35,
    activeConstructionBudget: 15000000,
    annualVehicleSalesRevenue: monthlyRevenue * 12,
  });

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-150">
      
      {/* ── Top Corporate Perception Strip ── */}
      <div className="p-5 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold shadow-xs">
            <Award size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-800">
                Corporate Prestige & Level
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 font-mono text-xs font-bold">
                Tier {overallLevel.tier}: {overallLevel.label}
              </span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-slate-900 mt-1">
              Overall Reputation Index: {overallReputation}/100
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Compound economic advantages actively reducing operating costs and lifting sales realization.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#faf7f2] border border-[#ded8cb] text-right font-mono">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Annual Economic Advantage</span>
            <span className="text-lg font-bold text-emerald-700">
              ₹{(repModifiers.totalAnnualEconomicAdvantage / 1000000).toFixed(2)}M
            </span>
          </div>
        </div>
      </div>

      {/* ── 4 Primary Financial Advantage Pillars ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Employer Prestige */}
        <div className="p-4 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">Workforce Payroll</span>
            <Users size={16} className="text-sky-600" />
          </div>
          <span className="text-2xl font-mono font-bold text-slate-900 mt-2">
            {repModifiers.employerSalaryDiscountPct >= 0
              ? `-${repModifiers.employerSalaryDiscountPct}%`
              : `+${Math.abs(repModifiers.employerSalaryDiscountPct)}%`}
          </span>
          <span className="text-xs text-emerald-700 font-mono mt-1">
            ₹{(repModifiers.estimatedAnnualHiringSavings / 1000000).toFixed(2)}M annual savings
          </span>
          <span className="text-[11px] text-slate-500 mt-2 leading-tight">
            High corporate acclaim attracts elite engineering talent at competitive wage rates.
          </span>
        </div>

        {/* Supplier Negotiation */}
        <div className="p-4 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">Procurement BOM</span>
            <Wrench size={16} className="text-amber-600" />
          </div>
          <span className="text-2xl font-mono font-bold text-slate-900 mt-2">
            -{repModifiers.supplierNegotiationAdvantagePct}% Discount
          </span>
          <span className="text-xs text-emerald-700 font-mono mt-1">
            ₹{(repModifiers.estimatedAnnualSupplySavings / 1000000).toFixed(2)}M annual savings
          </span>
          <span className="text-[11px] text-slate-500 mt-2 leading-tight">
            Tier-1 component vendors and raw material mills grant volume credit terms.
          </span>
        </div>

        {/* Industrial CapEx */}
        <div className="p-4 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">Construction CapEx</span>
            <Factory size={16} className="text-emerald-600" />
          </div>
          <span className="text-2xl font-mono font-bold text-slate-900 mt-2">
            -{repModifiers.constructionCostDiscountPct}% Discount
          </span>
          <span className="text-xs text-emerald-700 font-mono mt-1">
            ₹{(repModifiers.estimatedAnnualConstructionSavings / 1000000).toFixed(2)}M CapEx relief
          </span>
          <span className="text-[11px] text-slate-500 mt-2 leading-tight">
            Regional infrastructure authorities and contractors grant expedited municipal terms.
          </span>
        </div>

        {/* Commercial Sales Demand */}
        <div className="p-4 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">Demand Premium</span>
            <TrendingUp size={16} className="text-indigo-600" />
          </div>
          <span className="text-2xl font-mono font-bold text-slate-900 mt-2">
            {repModifiers.brandSalesDemandMultiplier}x Demand
          </span>
          <span className="text-xs text-emerald-700 font-mono mt-1">
            ₹{(repModifiers.estimatedAnnualBrandRevenueBoost / 1000000).toFixed(2)}M revenue lift
          </span>
          <span className="text-[11px] text-slate-500 mt-2 leading-tight">
            Brand halo allows higher price realization and lower promotional discounting.
          </span>
        </div>

      </div>

      {/* ── All 17 Dimension Track Overview ── */}
      <div className="p-5 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 font-serif text-sm">
              17 Specialized Corporate Perception Tracks
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Individual domain scores influencing specific ledger and demand factors
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(dimensions).map(([key, data]) => {
            const score = data.score;
            return (
              <div
                key={key}
                className="p-3.5 rounded-xl bg-[#faf7f2] border border-[#ece6da] flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                  <span className="font-mono font-bold text-xs text-slate-900">{score}/100</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      score >= 70
                        ? "bg-emerald-600"
                        : score >= 45
                        ? "bg-sky-600"
                        : score >= 30
                        ? "bg-amber-600"
                        : "bg-rose-600"
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                  <span>Trend: {data.trendQuarterly >= 0 ? "+" : ""}{data.trendQuarterly}/qtr</span>
                  <span>Peak: {data.historicalPeak}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
