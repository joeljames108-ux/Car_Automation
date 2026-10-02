import React from "react";
import {
  X, CheckCircle2, AlertTriangle, AlertCircle, Info, TrendingUp,
  TrendingDown, DollarSign, Calendar, ShieldCheck, ArrowRight, Award,
  Sparkles, Layers
} from "lucide-react";
import { MonthlyTickResult } from "../../sim/economy/monthlyTickOrchestrator";
import { FinanceTabKey } from "./financeTabTypes";

const MONTH_NAMES = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];

interface MonthEndSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: MonthlyTickResult | null;
  onSelectTab?: (tab: FinanceTabKey) => void;
}

export const MonthEndSummaryModal: React.FC<MonthEndSummaryModalProps> = ({
  isOpen,
  onClose,
  result,
  onSelectTab,
}) => {
  if (!isOpen || !result) return null;

  const monthName = MONTH_NAMES[(result.month - 1) % 12];
  const isProfitable = result.operatingProfit >= 0;
  const isCashPositive = result.cashFlow >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-[#f6f4ee] border border-[#ded8cb] shadow-2xl overflow-hidden text-slate-800">
        
        {/* ── Modal Header ── */}
        <div className="px-6 py-4 border-b border-[#ded8cb] bg-white/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100/80 border border-amber-300/60 flex items-center justify-center text-amber-700 font-bold shadow-xs">
              <Calendar size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-widest text-amber-800 uppercase">
                  Monthly Financial Settlement
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  result.cashHealth.status === "HEALTHY"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : result.cashHealth.status === "STABLE"
                    ? "bg-sky-100 text-sky-800 border border-sky-300"
                    : "bg-rose-100 text-rose-800 border border-rose-300"
                }`}>
                  {result.cashHealth.status} SOLVENCY
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 font-serif">
                {monthName} {result.year} — Month-End Executive Audit
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

          {/* ── Top Metric Cards Strip ── */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                Total Revenue
              </span>
              <span className="text-lg font-mono font-bold text-slate-900 mt-1">
                ₹{(result.totalMonthlyRevenue / 1000000).toFixed(2)}M
              </span>
              <span className="text-[10px] text-emerald-700 font-mono flex items-center gap-1 mt-1">
                <TrendingUp size={10} /> Inflow
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                Total Expenses
              </span>
              <span className="text-lg font-mono font-bold text-slate-900 mt-1">
                ₹{(result.totalMonthlyExpenses / 1000000).toFixed(2)}M
              </span>
              <span className="text-[10px] text-rose-600 font-mono flex items-center gap-1 mt-1">
                <TrendingDown size={10} /> Operating Burn
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                Operating Profit
              </span>
              <span className={`text-lg font-mono font-bold mt-1 ${isProfitable ? "text-emerald-700" : "text-rose-700"}`}>
                {isProfitable ? "+" : ""}₹{(result.operatingProfit / 1000000).toFixed(2)}M
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-1">
                Operating Margin {result.totalMonthlyRevenue > 0 ? Math.round((result.operatingProfit / result.totalMonthlyRevenue) * 100) : 0}%
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                Net Cash Flow
              </span>
              <span className={`text-lg font-mono font-bold mt-1 ${isCashPositive ? "text-emerald-700" : "text-amber-700"}`}>
                {isCashPositive ? "+" : ""}₹{(result.cashFlow / 1000000).toFixed(2)}M
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-1">
                Incl. CapEx & Debt
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col col-span-2 md:col-span-1">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                Closing Cash
              </span>
              <span className="text-lg font-mono font-bold text-slate-900 mt-1">
                ₹{(result.closingCash / 1000000).toFixed(2)}M
              </span>
              <span className="text-[10px] text-slate-600 font-mono mt-1">
                Rating: {result.enterpriseValuation.creditRating}
              </span>
            </div>
          </div>

          {/* ── 2-Column Section: Operations vs Events/Reputation ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Left: Models Sold & Pipeline Highlights */}
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={14} className="text-amber-600" />
                    Vehicle Model Sales Performance
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {result.modelSalesDetails.length} Active Lines
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {result.modelSalesDetails.map((model) => (
                    <div
                      key={model.modelId}
                      className="p-3 rounded-xl bg-[#faf7f2] border border-[#ece6da] flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{model.modelName}</span>
                        <span className="px-2 py-0.5 rounded-md bg-white text-[10px] font-mono font-bold text-slate-700 border border-[#ded8cb]">
                          {model.segment}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs font-mono mt-1">
                        <div>
                          <span className="text-slate-600 block text-[10px]">Built / Sold</span>
                          <span className="font-bold text-slate-800">{model.unitsProduced} / {model.unitsSold} units</span>
                        </div>
                        <div>
                          <span className="text-slate-600 block text-[10px]">Realized Price</span>
                          <span className="font-bold text-slate-800">₹{Math.round(model.realizedPrice / 1000)}k</span>
                        </div>
                        <div>
                          <span className="text-slate-600 block text-[10px]">Gross Profit</span>
                          <span className={`font-bold ${model.grossProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                            ₹{Math.round(model.grossProfit / 1000)}k
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 14-Step Monthly Sequence Highlight */}
              <div className="p-4 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col gap-2">
                <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                  14-Step Monthly Tick Pipeline Executed
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {result.pipelineSteps.map((step) => (
                    <div
                      key={step.step}
                      className="px-2.5 py-1 rounded-lg bg-[#f6f4ee] border border-[#ded8cb] text-[10px] font-mono flex items-center gap-1.5"
                      title={step.description}
                    >
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[9px]">
                        {step.step}
                      </span>
                      <span className="font-bold text-slate-800">{step.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Motorsport & Ancillary Operations Breakdown */}
              <div className="p-4 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col gap-2.5 text-xs font-mono">
                <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Motorsport & Specialized Operations
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-[#faf7f2] border border-[#ece6da]">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Motorsport Net Cost</span>
                    <span className={`text-sm font-bold ${result.motorsportNetCost <= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                      {result.motorsportNetCost <= 0 ? "+" : "-"}₹{Math.round(Math.abs(result.motorsportNetCost) / 1000)}k
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      Prizes: ₹{Math.round(result.motorsportRevenue / 1000)}k • Burn: ₹{Math.round(result.motorsportExpense / 1000)}k
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#faf7f2] border border-[#ece6da]">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">B2B & Tech Licensing</span>
                    <span className="text-sm font-bold text-indigo-800">
                      {result.contractIncomeDetails.length} Contracts • {result.techLicenseDetails.length} Patents
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      Fulfillment: 100% on schedule
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Financial Events & Reputation Updates */}
            <div className="flex flex-col gap-4">

              {/* Generated Financial Events */}
              <div className="p-4 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col gap-3">
                <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  Monthly Financial Events & Bulletins
                </span>

                <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                  {result.eventsGenerated.length === 0 ? (
                    <span className="text-xs text-slate-500 italic p-2">Standard operational cycle without material anomalies.</span>
                  ) : (
                    result.eventsGenerated.map((ev) => (
                      <div
                        key={ev.id}
                        className={`p-2.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                          ev.severity === "CRITICAL"
                            ? "bg-rose-50 border-rose-200 text-rose-900"
                            : ev.severity === "WARNING"
                            ? "bg-amber-50 border-amber-200 text-amber-900"
                            : ev.severity === "SUCCESS"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                            : "bg-sky-50 border-sky-200 text-sky-900"
                        }`}
                      >
                        <div className="mt-0.5">
                          {ev.severity === "CRITICAL" && <AlertCircle size={15} className="text-rose-600" />}
                          {ev.severity === "WARNING" && <AlertTriangle size={15} className="text-amber-600" />}
                          {ev.severity === "SUCCESS" && <CheckCircle2 size={15} className="text-emerald-600" />}
                          {ev.severity === "INFO" && <Info size={15} className="text-sky-600" />}
                        </div>
                        <div className="flex-1">
                          <span className="font-bold block leading-tight">{ev.title}</span>
                          <span className="text-[11px] opacity-90 leading-tight block mt-0.5">{ev.description}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Reputation Adjustments */}
              <div className="p-4 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col gap-3">
                <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <Award size={14} className="text-indigo-600" />
                  Corporate Perception Feedback
                </span>

                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                  {result.reputationDeltas.length === 0 ? (
                    <span className="text-xs text-slate-500 italic p-2">All reputation tracks held steady this period.</span>
                  ) : (
                    result.reputationDeltas.map((rep, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-[#faf7f2] border border-[#ece6da] text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{rep.label}</span>
                          <span className="text-[10px] text-slate-500 block">{rep.reason}</span>
                        </div>
                        <div className="text-right font-mono">
                          <span className={`font-bold ${rep.delta >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                            {rep.delta >= 0 ? "+" : ""}{rep.delta}
                          </span>
                          <span className="text-[10px] text-slate-500 block">→ {rep.newScore}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* ── Forward Forecast Strip ── */}
          {result.forecast12Months.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#edf4f9] border border-[#cbdfe9] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-200/80 text-sky-800 flex items-center justify-center font-bold">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-sky-800 uppercase tracking-wider">
                    Next Month Projection Preview
                  </span>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    Month {result.forecast12Months[0].month}: Est. Revenue ₹{(result.forecast12Months[0].projectedRevenue / 1000000).toFixed(1)}M • Projected Profit ₹{(result.forecast12Months[0].projectedProfit / 1000000).toFixed(1)}M
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onSelectTab?.("FORECAST" as FinanceTabKey);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-[#cbdfe9] text-xs font-mono font-bold text-slate-800 transition-all shadow-2xs"
              >
                <span>View 12-Mo Forecast</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}

        </div>

        {/* ── Modal Footer ── */}
        <div className="px-6 py-4 border-t border-[#ded8cb] bg-white/70 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono">
            Annual Report: {result.annualReportCompiled ? "✓ Compiled (December)" : "Scheduled for Month 12"}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onSelectTab?.("OVERVIEW");
              }}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-[#ded8cb] text-xs font-mono font-bold text-slate-800 transition-all shadow-xs"
            >
              Open Full Finance Page
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold transition-all shadow-xs"
            >
              Continue Simulation
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
