import React from "react";
import {
  TrendingDown, Users, Building, Factory, Shield,
  Layers, Package, Zap, Truck, Hammer, CheckCircle2,
  DollarSign, Sparkles, Megaphone, Store, CreditCard
} from "lucide-react";
import { useCompanyFinanceStore } from "../../state/companyFinanceStore";
import { useSimulationClockStore } from "../../state/simulationClockStore";
import { getAllCommodityPrices } from "../../sim/economy/commodityMarketEngine";
import { useDealershipStore } from "../../sim/economy/dealershipNetworkEngine";
import { useMarketingStore } from "../../sim/economy/marketingEngine";

export const ExpensesTab: React.FC = () => {
  const { monthlyExpenses, monthlySnapshots, assets, rdBudget, activeLoans, lastTickResult } = useCompanyFinanceStore();
  const { month, year } = useSimulationClockStore();
  const { getNetworkSummary } = useDealershipStore();
  const { budgetPlan, currentAwareness } = useMarketingStore();

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

  const latestSnapshot = monthlySnapshots.length > 0 ? monthlySnapshots[monthlySnapshots.length - 1] : null;
  const expenseByCategory = latestSnapshot?.expenseByCategory ?? {};

  const fixedTotal = latestSnapshot?.fixedExpenses ?? 210000;
  const variableTotal = latestSnapshot?.variableExpenses ?? 0;
  const investmentTotal = latestSnapshot?.investments ?? rdBudget.totalMonthlyBudget;

  const commodityPrices = getAllCommodityPrices(year, month, "STEADY_GROWTH", 0);
  const dealerSummary = getNetworkSummary(30);

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* ── 1. Top Three-Tier Expense Header ── */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#fdf7f4] via-[#fbf5f2] to-[#faf3ee] border border-[#ecd5c5] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-amber-900 uppercase block mb-1">
              THREE-TIER EXPENSE ARCHITECTURE (FIXED • VARIABLE • CAPEX)
            </span>
            <div className="text-3xl font-black text-slate-900 font-mono">
              {formatCurrency(monthlyExpenses)}
              <span className="text-xs text-slate-500 font-normal font-sans ml-2">/ month operating burn</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Strict accounting separation between fixed overhead (regardless of volume), direct production variable costs, and future capacity investments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#ffffff]/90 border border-[#e2ddd0]">
              <span className="text-slate-500 block text-[10px]">FIXED OVERHEAD</span>
              <span className="font-bold text-slate-900">{formatCurrency(fixedTotal)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#ffffff]/90 border border-[#e2ddd0]">
              <span className="text-slate-500 block text-[10px]">VARIABLE PRODUCTION</span>
              <span className="font-bold text-sky-800">{formatCurrency(variableTotal)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#ffffff]/90 border border-[#e2ddd0]">
              <span className="text-slate-500 block text-[10px]">CAPEX & R&D INVEST</span>
              <span className="font-bold text-purple-800">{formatCurrency(investmentTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Detailed Three-Tier Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tier 1: Fixed Overhead */}
        <div className="p-5 rounded-2xl bg-[#ffffff]/90 border border-[#e0dad0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#eee8dc]">
              <div className="flex items-center gap-2">
                <Building size={16} className="text-amber-700" />
                <span className="text-xs font-black text-slate-900 font-mono uppercase tracking-wider">
                  1. FIXED CORPORATE OVERHEAD
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                RECURRING MONTHLY
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Incurred every month regardless of whether 0 or 10,000 vehicles roll off the line.
            </p>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center p-2 rounded-lg bg-[#fbf9f4]">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Users size={13} className="text-slate-500" /> Corporate Salaries
                </span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(expenseByCategory["EMPLOYEE_SALARIES"] ?? 110000)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-[#fbf9f4]">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Building size={13} className="text-slate-500" /> HQ Facilities Maintenance
                </span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(expenseByCategory["HQ_MAINTENANCE"] ?? 45000)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-[#fbf9f4]">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Factory size={13} className="text-slate-500" /> Plant Baseload Upkeep
                </span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(expenseByCategory["FACTORY_MAINTENANCE"] ?? 40000)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-[#fbf9f4]">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Shield size={13} className="text-slate-500" /> Corporate Insurance
                </span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(expenseByCategory["INSURANCE"] ?? 15000)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-[#fbf9f4]">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Store size={13} className="text-slate-500" /> Retail Showroom Overhead
                </span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(expenseByCategory["DEALER_OVERHEAD"] ?? dealerSummary.totalMonthlyOverhead)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#eee8dc] flex justify-between items-center text-xs font-mono">
            <span className="text-slate-500 font-bold">TOTAL FIXED BASELOAD:</span>
            <span className="text-base font-black text-amber-800">{formatCurrency(fixedTotal)}</span>
          </div>
        </div>

        {/* Tier 2: Variable Production Costs */}
        <div className="p-5 rounded-2xl bg-[#ffffff]/90 border border-[#e0dad0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#eee8dc]">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-sky-700" />
                <span className="text-xs font-black text-slate-900 font-mono uppercase tracking-wider">
                  2. VARIABLE PRODUCTION (BOM)
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                SCALES WITH VOLUME
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Direct materials, assembly worker takt labor, factory process energy, and outbound distribution.
            </p>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center p-2 rounded-lg bg-[#f6f9fc]">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Layers size={13} className="text-slate-500" /> Raw Materials (Steel/Alum)
                </span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(expenseByCategory["RAW_MATERIALS"] ?? 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-[#f6f9fc]">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Package size={13} className="text-slate-500" /> Tier-1 Components & Wiring
                </span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(expenseByCategory["COMPONENT_PURCHASES"] ?? 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-[#f6f9fc]">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Zap size={13} className="text-slate-500" /> Assembly Labor & Power
                </span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(expenseByCategory["ASSEMBLY_LABOR"] ?? 0)}
                </span>
              </div>
              <div className="flex flex-col p-2 rounded-lg bg-[#f6f9fc] gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <Truck size={13} className="text-slate-500" /> Outbound Carrier Logistics
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(expenseByCategory["LOGISTICS"] ?? 0)}
                  </span>
                </div>
                {lastTickResult?.logisticsModeBreakdown && (
                  <div className="pt-1 border-t border-sky-100 flex flex-wrap gap-2 text-[10px] text-slate-500">
                    {lastTickResult.logisticsModeBreakdown.map((m) => (
                      <span key={m.mode} className="bg-white/80 px-1.5 py-0.5 rounded border border-slate-200">
                        {m.mode.replace("_", " ")}: {m.vehiclesShipped} units ({formatCurrency(m.totalCost)})
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-[#f6f9fc]">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <DollarSign size={13} className="text-slate-500" /> Dealer Network Commissions
                </span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(expenseByCategory["DEALER_COMMISSION"] ?? 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#eee8dc] flex justify-between items-center text-xs font-mono">
            <span className="text-slate-500 font-bold">TOTAL VARIABLE COGS:</span>
            <span className="text-base font-black text-sky-800">{formatCurrency(variableTotal)}</span>
          </div>
        </div>

        {/* Tier 3: Capital Investments & Discretionary */}
        <div className="p-5 rounded-2xl bg-[#ffffff]/90 border border-[#e0dad0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#eee8dc]">
              <div className="flex items-center gap-2">
                <Hammer size={16} className="text-purple-700" />
                <span className="text-xs font-black text-slate-900 font-mono uppercase tracking-wider">
                  3. CAPITAL & DISCRETIONARY
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                STRATEGIC BUILD
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Active R&D development burn, marketing campaigns, and loan debt service.
            </p>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center p-2 rounded-lg bg-[#faf6fe]">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Hammer size={13} className="text-slate-500" /> Active R&D Development
                </span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(expenseByCategory["RD_INVESTMENT"] ?? rdBudget.totalMonthlyBudget)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-[#faf6fe]">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Megaphone size={13} className="text-slate-500" /> Marketing & Campaigns
                </span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(expenseByCategory["MARKETING"] ?? budgetPlan.totalMonthlySpend)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-[#faf6fe]">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <CreditCard size={13} className="text-slate-500" /> Debt Principal & Service
                </span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(expenseByCategory["LOAN_PAYMENT"] ?? 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#eee8dc] flex justify-between items-center text-xs font-mono">
            <span className="text-slate-500 font-bold">TOTAL CAPITAL INVESTMENT:</span>
            <span className="text-base font-black text-purple-800">{formatCurrency(investmentTotal)}</span>
          </div>
        </div>
      </div>

      {/* ── 3. Dynamic Commodity Market Prices Feed (Section 2C Spec) ── */}
      <div className="p-5 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h4 className="font-bold text-slate-900 font-serif text-sm flex items-center gap-2">
              <Layers size={16} className="text-amber-600" />
              Global Commodity Raw Material Spot Rates ({year})
            </h4>
            <span className="text-xs text-slate-500 font-mono">
              Live market indices affecting per-vehicle Bill of Materials procurement costs
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          {Object.values(commodityPrices).slice(0, 4).map((com) => (
            <div key={com.type} className="p-3 rounded-xl bg-[#faf7f2] border border-[#ece6da] flex flex-col">
              <span className="text-slate-500 text-[10px] uppercase font-bold">{com.name}</span>
              <span className="text-base font-bold text-slate-900 mt-0.5">
                ₹{com.currentMarketPrice} <span className="text-[10px] font-normal text-slate-500">{com.unit}</span>
              </span>
              <span className={`text-[10px] mt-1 font-bold ${com.monthlyTrendPct >= 0 ? "text-amber-700" : "text-emerald-700"}`}>
                {com.monthlyTrendPct >= 0 ? "+" : ""}{com.monthlyTrendPct}% this cycle
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Itemized Manufacturing Facilities & Baseload Maintenance Breakdown (Section 11 Spec) ── */}
      <div className="p-5 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h4 className="font-bold text-slate-900 font-serif text-sm flex items-center gap-2">
              <Building size={16} className="text-emerald-700" />
              Itemized Facility Upkeep & Plant Baseload Breakdown
            </h4>
            <span className="text-xs text-slate-500 font-mono">
              Fixed physical site maintenance, climate systems, and facility preservation
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600">
            {assets.length} Registered Properties
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#fcfaf6] border-b border-[#ece6da] text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Facility Name</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Integrity</th>
                <th className="py-2.5 px-3 text-right">Book Value</th>
                <th className="py-2.5 px-3 text-right">Monthly Upkeep Burn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-[#faf7f2] transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{asset.name}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-700 border border-slate-200">
                      {asset.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-emerald-700 font-bold">{asset.conditionPct}%</span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-800">{formatCurrency(asset.currentValue)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-amber-800">
                    {formatCurrency(asset.monthlyMaintenanceCost)} / mo
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
