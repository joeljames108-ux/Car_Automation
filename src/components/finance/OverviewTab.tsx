import React from "react";
import {
  TrendingUp, TrendingDown, DollarSign, Shield, AlertTriangle,
  Award, Building, Layers, Sparkles, CheckCircle2
} from "lucide-react";
import { useCompanyFinanceStore } from "../../state/companyFinanceStore";
import { useReputationStore } from "../../state/reputationStore";
import { calculateReputationFinancialModifiers } from "../../sim/economy/reputationEconomicBridge";
import { calculateCompanyValuation } from "../../sim/economy/companyValuation";

export const OverviewTab: React.FC = () => {
  const {
    cash,
    monthlyRevenue,
    monthlyExpenses,
    monthlyOperatingProfit,
    monthlyCashFlow,
    monthsOfRunway,
    cashHealth,
    balanceSheet,
    monthlySnapshots,
    rdBudget,
    assets,
  } = useCompanyFinanceStore();

  const { dimensions, overallReputation } = useReputationStore();

  const valuation = calculateCompanyValuation(
    balanceSheet,
    monthlyOperatingProfit * 12,
    overallReputation,
    dimensions.commercialTrust?.score ?? 30,
    rdBudget.activeProjects.filter((p) => p.status === "COMPLETED").length + 2
  );

  const repEffects = calculateReputationFinancialModifiers(dimensions, {
    annualPayrollEstimate: monthlyExpenses * 12 * 0.45,
    annualBOMSpendEstimate: monthlyExpenses * 12 * 0.35,
    activeConstructionBudget: 15000000,
    annualVehicleSalesRevenue: monthlyRevenue * 12,
  });

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

  const getHealthBadge = () => {
    switch (cashHealth) {
      case "HEALTHY":
        return {
          bg: "bg-emerald-100 text-emerald-800 border-emerald-300",
          icon: <CheckCircle2 size={13} className="text-emerald-700" />,
          label: "HEALTHY RUNWAY",
        };
      case "STABLE":
        return {
          bg: "bg-sky-100 text-sky-800 border-sky-300",
          icon: <Shield size={13} className="text-sky-700" />,
          label: "STABLE LIQUIDITY",
        };
      case "WARNING":
        return {
          bg: "bg-amber-100 text-amber-800 border-amber-300",
          icon: <AlertTriangle size={13} className="text-amber-700" />,
          label: "SAFETY WARNING",
        };
      case "CRITICAL":
        return {
          bg: "bg-rose-100 text-rose-800 border-rose-300",
          icon: <AlertTriangle size={13} className="text-rose-700" />,
          label: "CRITICAL BURN",
        };
      default:
        return {
          bg: "bg-red-200 text-red-900 border-red-400",
          icon: <AlertTriangle size={13} className="text-red-800" />,
          label: "INSOLVENT",
        };
    }
  };

  const healthBadge = getHealthBadge();

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* ── 1. Top Executive P&L KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Liquid Cash */}
        <div className="p-4 rounded-2xl bg-[#ffffff]/90 border border-[#e2ddd0] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-mono uppercase font-bold mb-1">
            <span className="flex items-center gap-1.5 text-slate-700">
              <DollarSign size={13} className="text-emerald-600" />
              Liquid Cash Reserves
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${healthBadge.bg}`}>
              {monthsOfRunway > 100 ? "> 10 Yrs" : `${monthsOfRunway} Mos`}
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatCurrency(cash)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
            <span>Operating balance available</span>
          </div>
        </div>

        {/* KPI 2: Monthly Revenue */}
        <div className="p-4 rounded-2xl bg-[#ffffff]/90 border border-[#e2ddd0] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-mono uppercase font-bold mb-1">
            <span className="flex items-center gap-1.5 text-slate-700">
              <TrendingUp size={13} className="text-sky-600" />
              Monthly Revenue
            </span>
            <span className="text-[10px] text-sky-700 font-semibold">6 Streams</span>
          </div>
          <div className="text-2xl font-black text-sky-800 font-mono">
            {formatCurrency(monthlyRevenue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Vehicles, B2B Parts & Contracts
          </div>
        </div>

        {/* KPI 3: Monthly Expenses */}
        <div className="p-4 rounded-2xl bg-[#ffffff]/90 border border-[#e2ddd0] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-mono uppercase font-bold mb-1">
            <span className="flex items-center gap-1.5 text-slate-700">
              <TrendingDown size={13} className="text-amber-600" />
              Monthly Operating Burn
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">Fixed + Var</span>
          </div>
          <div className="text-2xl font-black text-slate-800 font-mono">
            {formatCurrency(monthlyExpenses)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Payroll, Plant Upkeep & Materials
          </div>
        </div>

        {/* KPI 4: Operating Profit / Loss */}
        <div className="p-4 rounded-2xl bg-[#ffffff]/90 border border-[#e2ddd0] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-mono uppercase font-bold mb-1">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Award size={13} className="text-purple-600" />
              Operating Profit (P&L)
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">Net EBIT</span>
          </div>
          <div
            className={`text-2xl font-black font-mono ${
              monthlyOperatingProfit >= 0 ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            {formatCurrency(monthlyOperatingProfit)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            {monthlyOperatingProfit >= 0 ? "Profitable operations" : "Seed development phase"}
          </div>
        </div>
      </div>

      {/* ── 2. Corporate Enterprise Valuation & Solvency Banner ── */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#fefbf6] via-[#f7f4ed] to-[#eff3ee] border border-[#ded8cb] shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-md">
              <Award size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                  ENTERPRISE VALUATION (EV)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-100 text-purple-800 border border-purple-300">
                  CREDIT: {valuation.creditRating}
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                {formatCurrency(valuation.totalEnterpriseValue)}
                <span className="text-xs text-slate-500 font-normal font-sans ml-2">
                  (₹{valuation.impliedSharePrice} / share)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#ffffff]/90 border border-[#e2ddd0]">
              <span className="text-slate-500 block text-[10px]">TANGIBLE BOOK VALUE</span>
              <span className="font-bold text-slate-900">{formatCurrency(balanceSheet.netTangibleBookValue)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#ffffff]/90 border border-[#e2ddd0]">
              <span className="text-slate-500 block text-[10px]">INTANGIBLE IP & BRAND</span>
              <span className="font-bold text-purple-700">
                {formatCurrency(valuation.intellectualPropertyValuation + valuation.brandGoodwillValuation)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#ffffff]/90 border border-[#e2ddd0]">
              <span className="text-slate-500 block text-[10px]">DEBT / EQUITY RATIO</span>
              <span className="font-bold text-slate-900">{balanceSheet.debtToEquityRatio}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2B. Profit vs Cash Flow Separation & CapEx Impact (Phase 4B Spec) ── */}
      <div className="p-5 rounded-2xl bg-[#ffffff]/90 border border-[#ded8cb] shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 font-serif text-sm flex items-center gap-2">
              <Layers size={16} className="text-sky-600" />
              Accounting Profit vs Liquid Cash Flow
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Understanding the difference between operational profitability (P&L) and liquid cash burn
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-[#f6f4ee] px-2.5 py-1 rounded-lg border border-[#ded8cb]">
            {monthlyOperatingProfit > 0 && monthlyCashFlow < 0 ? "EXPANSION DIVERGENCE" : "BALANCED FLOW"}
          </span>
        </div>

        {monthlyOperatingProfit > 0 && monthlyCashFlow < 0 && (
          <div className="p-4 rounded-xl bg-[#fef6e9] border border-[#f4dfb8] flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-relaxed font-sans">
              <strong className="text-slate-900 block font-bold font-mono text-[11px] uppercase tracking-wider mb-0.5">
                Capital Expansion Cash Flow Divergence
              </strong>
              Your company is operationally profitable at <strong>{formatCurrency(monthlyOperatingProfit)}/month</strong>, but liquid cash is decreasing by <strong>{formatCurrency(Math.abs(monthlyCashFlow))}/month</strong> due to active CapEx construction, tooling amortization, and long-term R&D investments. This is healthy during factory ramp-up phases provided runway remains above 6 months.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-[#faf7f2] border border-[#ece6da]">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">1. Operating Profit (EBIT)</span>
            <span className={`text-lg font-bold ${monthlyOperatingProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
              {monthlyOperatingProfit >= 0 ? "+" : ""}{formatCurrency(monthlyOperatingProfit)}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">Revenue − Fixed/Variable OpEx</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#faf7f2] border border-[#ece6da]">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">2. Capital Outflows (CapEx & Debt)</span>
            <span className="text-lg font-bold text-purple-800">
              -{formatCurrency(rdBudget.totalMonthlyBudget)}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">R&D Burn + Tooling + Debt Service</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#faf7f2] border border-[#ece6da]">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">3. Net Liquid Cash Movement</span>
            <span className={`text-lg font-bold ${monthlyCashFlow >= 0 ? "text-emerald-700" : "text-amber-700"}`}>
              {monthlyCashFlow >= 0 ? "+" : ""}{formatCurrency(monthlyCashFlow)}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">Actual net change in company bank account</span>
          </div>
        </div>
      </div>

      {/* ── 3. Section 38 Cross-Reference: Reputation Compounding Advantage ── */}
      <div className="p-5 rounded-2xl bg-[#ffffff]/90 border border-[#e0dad0] shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#eee8dc]">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            <span className="text-xs font-black text-slate-900 font-mono uppercase tracking-wider">
              SECTION 38: REPUTATION ↔ FINANCIAL COMPOUNDING ADVANTAGES
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
            TOTAL ANNUAL ADVANTAGE: +{formatCurrency(repEffects.totalAnnualEconomicAdvantage)}
          </span>
        </div>

        <p className="text-xs text-slate-600 mb-4">
          Reputation is not just public popularity — it acts as an economic multiplier across hiring, supply chain, construction, and customer demand.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Item 1: Employer Rep */}
          <div className="p-3.5 rounded-xl bg-[#f8fbf8] border border-[#cde5d2]">
            <div className="text-[10px] font-mono text-emerald-800 font-bold uppercase mb-1">
              EMPLOYER REPUTATION: {dimensions.employer?.score ?? 30}
            </div>
            <div className="text-base font-black text-slate-900 font-mono">
              {repEffects.employerSalaryDiscountPct >= 0 ? `-${repEffects.employerSalaryDiscountPct}%` : `+${Math.abs(repEffects.employerSalaryDiscountPct)}%`}
              <span className="text-[11px] text-slate-600 font-normal ml-1">Salary Effect</span>
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-1">
              +{formatCurrency(repEffects.estimatedAnnualHiringSavings)} / yr talent savings
            </div>
          </div>

          {/* Item 2: Supplier Rep */}
          <div className="p-3.5 rounded-xl bg-[#f5f9fc] border border-[#cbe1f2]">
            <div className="text-[10px] font-mono text-sky-800 font-bold uppercase mb-1">
              SUPPLIER REPUTATION: {dimensions.supplier?.score ?? 30}
            </div>
            <div className="text-base font-black text-slate-900 font-mono">
              -{repEffects.supplierNegotiationAdvantagePct}%
              <span className="text-[11px] text-slate-600 font-normal ml-1">BOM Discount</span>
            </div>
            <div className="text-[10px] text-sky-700 font-medium mt-1">
              +{formatCurrency(repEffects.estimatedAnnualSupplySavings)} / yr procurement savings
            </div>
          </div>

          {/* Item 3: Industrial Rep */}
          <div className="p-3.5 rounded-xl bg-[#fcf9f2] border border-[#eddcb9]">
            <div className="text-[10px] font-mono text-amber-800 font-bold uppercase mb-1">
              INDUSTRIAL REPUTATION: {dimensions.industrial?.score ?? 30}
            </div>
            <div className="text-base font-black text-slate-900 font-mono">
              -{repEffects.constructionCostDiscountPct}%
              <span className="text-[11px] text-slate-600 font-normal ml-1">CapEx Bids</span>
            </div>
            <div className="text-[10px] text-amber-700 font-medium mt-1">
              +{formatCurrency(repEffects.estimatedAnnualConstructionSavings)} / yr construction savings
            </div>
          </div>

          {/* Item 4: Brand Demand */}
          <div className="p-3.5 rounded-xl bg-[#faf6fe] border border-[#e4d4f8]">
            <div className="text-[10px] font-mono text-purple-800 font-bold uppercase mb-1">
              BRAND EQUITY: {overallReputation}
            </div>
            <div className="text-base font-black text-slate-900 font-mono">
              {repEffects.brandSalesDemandMultiplier}x
              <span className="text-[11px] text-slate-600 font-normal ml-1">Demand Lift</span>
            </div>
            <div className="text-[10px] text-purple-700 font-medium mt-1">
              +{formatCurrency(repEffects.estimatedAnnualBrandRevenueBoost)} / yr brand revenue boost
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Historical Snapshots / Recent Months ── */}
      <div className="p-5 rounded-2xl bg-[#ffffff]/90 border border-[#e0dad0] shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#eee8dc]">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-slate-600" />
            <span className="text-xs font-black text-slate-900 font-mono uppercase tracking-wider">
              RECENT MONTHLY FINANCIAL SNAPSHOTS
            </span>
          </div>
          <span className="text-xs font-mono text-slate-500 font-bold">
            {monthlySnapshots.length} Months Recorded
          </span>
        </div>

        {monthlySnapshots.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs font-mono">
            No monthly snapshots recorded yet. Advance the game simulation clock to generate periodic P&L accounting.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#e2ddd0] text-slate-500 text-[10px]">
                  <th className="py-2">PERIOD</th>
                  <th className="py-2">REVENUE</th>
                  <th className="py-2">OPERATING EXPENSES</th>
                  <th className="py-2">OPERATING PROFIT</th>
                  <th className="py-2">CASH FLOW</th>
                  <th className="py-2 text-right">CLOSING CASH</th>
                </tr>
              </thead>
              <tbody>
                {monthlySnapshots.slice(-6).reverse().map((snap, idx) => (
                  <tr key={idx} className="border-b border-[#f2ede4] hover:bg-[#fbf9f4]">
                    <td className="py-2.5 font-bold text-slate-900">
                      M{snap.month} / {snap.year}
                    </td>
                    <td className="py-2.5 text-sky-800">{formatCurrency(snap.revenue)}</td>
                    <td className="py-2.5 text-slate-700">{formatCurrency(snap.operatingExpenses)}</td>
                    <td
                      className={`py-2.5 font-bold ${
                        snap.operatingProfit >= 0 ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      {formatCurrency(snap.operatingProfit)}
                    </td>
                    <td
                      className={`py-2.5 ${
                        snap.cashFlow >= 0 ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {formatCurrency(snap.cashFlow)}
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900">
                      {formatCurrency(snap.closingCash)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
