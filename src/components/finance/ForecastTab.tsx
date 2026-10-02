import React from "react";
import {
  TrendingUp, TrendingDown, DollarSign, Calendar, ShieldCheck,
  AlertTriangle, CheckCircle, Info, Sparkles, HelpCircle, Layers
} from "lucide-react";
import { useCompanyFinanceStore } from "../../state/companyFinanceStore";
import { useSimulationClockStore } from "../../state/simulationClockStore";
import { useVehicleProductionStore } from "../../sim/economy/vehicleProductionRegistry";
import { useContractsStore } from "../../state/contractsStore";
import { useMarketingStore } from "../../sim/economy/marketingEngine";
import { generate12MonthFinancialForecast } from "../../sim/economy/financialForecastEngine";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const ForecastTab: React.FC = () => {
  const { cash, monthlySnapshots, activeLoans, rdBudget } = useCompanyFinanceStore();
  const { month, year } = useSimulationClockStore();
  const { lines } = useVehicleProductionStore();
  const { contracts } = useContractsStore();
  const { budgetPlan } = useMarketingStore();

  const activeContractCashflow = contracts
    .filter((c) => c.status === "ACTIVE")
    .reduce((sum, c) => sum + c.monthlyCashflow, 0);

  const forecast = generate12MonthFinancialForecast({
    currentCash: cash,
    currentYear: year,
    currentMonth: month,
    recentSnapshots: monthlySnapshots,
    productionLines: lines,
    activeContractsCashflowTotal: activeContractCashflow,
    activeLoans,
    monthlyRDBudget: rdBudget.totalMonthlyBudget,
    monthlyMarketingSpend: budgetPlan.totalMonthlySpend,
  });

  const total12MonthRev = forecast.reduce((sum, m) => sum + m.projectedRevenue, 0);
  const total12MonthExp = forecast.reduce((sum, m) => sum + m.projectedExpenses, 0);
  const total12MonthProfit = total12MonthRev - total12MonthExp;
  const endingCash12Month = forecast[forecast.length - 1]?.projectedClosingCash ?? cash;

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-150">
      
      {/* ── Top Summary Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
            12-Month Projected Revenue
          </span>
          <span className="text-2xl font-mono font-bold text-slate-900 mt-1">
            ₹{(total12MonthRev / 1000000).toFixed(1)}M
          </span>
          <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1 mt-1">
            <TrendingUp size={12} /> Avg ₹{(total12MonthRev / 12 / 1000000).toFixed(1)}M/mo
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
            12-Month Projected Expenses
          </span>
          <span className="text-2xl font-mono font-bold text-slate-900 mt-1">
            ₹{(total12MonthExp / 1000000).toFixed(1)}M
          </span>
          <span className="text-[11px] font-mono text-rose-700 flex items-center gap-1 mt-1">
            <TrendingDown size={12} /> OpEx & Discretionary Burn
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
            12-Month Net Operating Profit
          </span>
          <span className={`text-2xl font-mono font-bold mt-1 ${total12MonthProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {total12MonthProfit >= 0 ? "+" : ""}₹{(total12MonthProfit / 1000000).toFixed(1)}M
          </span>
          <span className="text-[11px] font-mono text-slate-500 mt-1">
            Projected Margin: {Math.round((total12MonthProfit / Math.max(1, total12MonthRev)) * 100)}%
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
            Projected Year-End Cash
          </span>
          <span className="text-2xl font-mono font-bold text-slate-900 mt-1">
            ₹{(endingCash12Month / 1000000).toFixed(1)}M
          </span>
          <span className="text-[11px] font-mono text-slate-600 mt-1">
            Current: ₹{(cash / 1000000).toFixed(1)}M ({endingCash12Month >= cash ? "Growing" : "Declining"})
          </span>
        </div>
      </div>

      {/* ── Guidance Banner ── */}
      <div className="p-4 rounded-2xl bg-[#fef6e9] border border-[#f5dfb8] flex items-start gap-3.5">
        <Sparkles size={20} className="text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <span className="font-bold text-slate-900 block font-serif text-sm">
            Forward Planning Horizon (12-Month Projections)
          </span>
          Forecast models extrapolate active model demand, committed B2B customer contracts, scheduled loan amortization, and planned R&D budgets.
          Confidence is highest in the near term (Months 1–3) and wider further out due to macroeconomic cycles and market competition.
        </div>
      </div>

      {/* ── 12-Month Forecast Table ── */}
      <div className="w-full rounded-2xl bg-white border border-[#ded8cb] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm font-serif">
              Month-by-Month Financial Projection Model
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Starting from next calendar month ({MONTH_NAMES[month % 12]} {month === 12 ? year + 1 : year})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold">
              ● High Confidence
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-mono font-bold">
              ● Medium
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-mono font-bold">
              ● Low
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#fcfaf6] border-b border-[#ece6da] text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4 text-right">Proj. Revenue</th>
                <th className="py-3 px-4 text-right">Proj. Expenses</th>
                <th className="py-3 px-4 text-right">Operating Profit</th>
                <th className="py-3 px-4 text-right">Cash Flow</th>
                <th className="py-3 px-4 text-right">Closing Cash</th>
                <th className="py-3 px-4 text-center">Confidence</th>
                <th className="py-3 px-4">Risks & Factors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {forecast.map((item, idx) => {
                const monthLabel = MONTH_NAMES[(item.month - 1) % 12];
                const isProf = item.projectedProfit >= 0;
                const isCf = item.projectedCashFlow >= 0;

                return (
                  <tr key={idx} className="hover:bg-[#faf7f2] transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {monthLabel} {item.year}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-800 font-bold">
                      ₹{(item.projectedRevenue / 1000000).toFixed(2)}M
                    </td>
                    <td className="py-3 px-4 text-right text-slate-800">
                      ₹{(item.projectedExpenses / 1000000).toFixed(2)}M
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${isProf ? "text-emerald-700" : "text-rose-700"}`}>
                      {isProf ? "+" : ""}₹{(item.projectedProfit / 1000000).toFixed(2)}M
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${isCf ? "text-emerald-700" : "text-amber-700"}`}>
                      {isCf ? "+" : ""}₹{(item.projectedCashFlow / 1000000).toFixed(2)}M
                    </td>
                    <td className="py-3 px-4 text-right text-slate-900 font-bold">
                      ₹{(item.projectedClosingCash / 1000000).toFixed(2)}M
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.confidence === "HIGH"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : item.confidence === "MEDIUM"
                          ? "bg-sky-100 text-sky-800 border border-sky-300"
                          : "bg-amber-100 text-amber-800 border border-amber-300"
                      }`}>
                        {item.confidence}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {item.keyOpportunities.map((op, oi) => (
                          <span key={oi} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px]">
                            {op}
                          </span>
                        ))}
                        {item.keyRisks.map((rk, ri) => (
                          <span key={ri} className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 text-[10px]">
                            {rk}
                          </span>
                        ))}
                        {item.keyOpportunities.length === 0 && item.keyRisks.length === 0 && (
                          <span className="text-slate-400 text-[10px]">Baseline trend</span>
                        )}
                      </div>
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
