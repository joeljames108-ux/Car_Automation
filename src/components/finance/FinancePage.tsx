import React, { useState } from "react";
import {
  DollarSign, PieChart, TrendingUp, TrendingDown, FlaskConical,
  Building, FileText, Users, Car, Play, RotateCcw, Sparkles,
  ShieldCheck, AlertTriangle, AlertCircle, BarChart3, Award, Calendar,
  Sliders, History
} from "lucide-react";
import { SubPageLayout } from "../mainMenu/SubPageLayout";
import { OverviewTab } from "./OverviewTab";
import { IncomeTab } from "./IncomeTab";
import { ExpensesTab } from "./ExpensesTab";
import { RDSpendingTab } from "./RDSpendingTab";
import { AssetsTab } from "./AssetsTab";
import { ContractsTab } from "./ContractsTab";
import { WorkforceTab } from "./WorkforceTab";
import { CostPerVehicleTab } from "./CostPerVehicleTab";
import { ForecastTab } from "./ForecastTab";
import { ReputationEconomyTab } from "./ReputationEconomyTab";
import { InflationTrendsTab } from "./InflationTrendsTab";
import { MonthEndSummaryModal } from "./MonthEndSummaryModal";
import { BudgetAllocationModal } from "./BudgetAllocationModal";
import { useCompanyFinanceStore } from "../../state/companyFinanceStore";
import { useSimulationClockStore } from "../../state/simulationClockStore";
import type { MonthlyTickResult } from "../../sim/economy/monthlyTickOrchestrator";
import { getEraForYear } from "../../sim/economy/eraProgressionEngine";
import type { Stage } from "../StageSwitcher";

import { FinanceTabKey } from "./financeTabTypes";
export type { FinanceTabKey };

const MONTH_NAMES = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];

interface FinancePageProps {
  onSelectStage: (stage: Stage) => void;
}

export const FinancePage: React.FC<FinancePageProps> = ({ onSelectStage }) => {
  const [activeTab, setActiveTab] = useState<FinanceTabKey>("OVERVIEW");
  const [lastTickResult, setLastTickResult] = useState<MonthlyTickResult | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  const { month, year } = useSimulationClockStore();
  const {
    cash,
    monthlyRevenue,
    monthlyExpenses,
    monthlyOperatingProfit,
    monthlyCashFlow,
    monthsOfRunway,
    cashHealth,
    monthlySnapshots,
    resetTo1970,
  } = useCompanyFinanceStore();

  const handleSimulateMonth = () => {
    // Advance the master clock by 1 month — dispatches sequential monthly cadence to all game subsystems
    useSimulationClockStore.getState().advanceMonths(1);
    const result = useCompanyFinanceStore.getState().lastTickResult;
    if (result) {
      setLastTickResult(result);
      setIsSummaryModalOpen(true);
    }
  };

  const currentMonthName = MONTH_NAMES[(month - 1) % 12];
  const currentEra = getEraForYear(year);
  const lastSnapshot = monthlySnapshots[monthlySnapshots.length - 1];
  const lastMonthProfit = lastSnapshot ? lastSnapshot.operatingProfit : monthlyOperatingProfit;

  const isProfitable = monthlyOperatingProfit >= 0;
  const isCashPositive = monthlyCashFlow >= 0;

  // Runway health color coding
  const getRunwayColor = () => {
    if (cashHealth === "HEALTHY") return "bg-emerald-600 text-emerald-800 border-emerald-300";
    if (cashHealth === "STABLE") return "bg-sky-600 text-sky-800 border-sky-300";
    if (cashHealth === "WARNING") return "bg-amber-600 text-amber-800 border-amber-300";
    return "bg-rose-600 text-rose-800 border-rose-300";
  };

  const tabs: Array<{ key: FinanceTabKey; label: string; icon: React.ReactNode }> = [
    { key: "OVERVIEW", label: "Executive Overview", icon: <PieChart size={14} /> },
    { key: "INCOME", label: "Income & Revenue", icon: <TrendingUp size={14} /> },
    { key: "EXPENSES", label: "Expenses & Burn", icon: <TrendingDown size={14} /> },
    { key: "INFLATION_REVISION", label: "Inflation & Price Revisions", icon: <History size={14} /> },
    { key: "RD_SPENDING", label: "R&D Allocation", icon: <FlaskConical size={14} /> },
    { key: "ASSETS", label: "Balance Sheet & Assets", icon: <Building size={14} /> },
    { key: "CONTRACTS", label: "B2B Contracts", icon: <FileText size={14} /> },
    { key: "WORKFORCE", label: "Workforce & Salaries", icon: <Users size={14} /> },
    { key: "COST_PER_VEHICLE", label: "Cost Per Vehicle", icon: <Car size={14} /> },
    { key: "FORECAST", label: "12-Month Forecast", icon: <BarChart3 size={14} /> },
    { key: "REPUTATION", label: "Reputation ↔ Economy", icon: <Award size={14} /> },
  ];

  return (
    <SubPageLayout
      title={`FINANCE — ${currentMonthName} ${year}`}
      category="Double-Entry Ledger • 6 Revenue Streams • Multi-Model Sales • R&D Allocation • Balance Sheet"
      icon={<DollarSign size={20} className="text-amber-500" />}
      onSelectStage={onSelectStage}
      rightAction={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBudgetModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-[#ded8cb] text-slate-800 text-xs font-mono font-bold shadow-xs transition-all"
            title="Open strategic monthly budget allocation planner (Concept 29)"
          >
            <Sliders size={13} className="text-amber-600" />
            <span>Budget Plan</span>
          </button>
          {lastTickResult && (
            <button
              onClick={() => setIsSummaryModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-[#ded8cb] text-slate-800 text-xs font-mono font-bold shadow-xs transition-all"
              title="View last month summary report"
            >
              <Calendar size={13} className="text-amber-600" />
              <span>Report</span>
            </button>
          )}
          <button
            onClick={handleSimulateMonth}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-mono font-bold shadow-xs active:scale-95 transition-all"
            title="Advance simulation by 1 month and process corporate ledger"
          >
            <Play size={13} fill="currentColor" />
            <span>Process Month (Tick)</span>
          </button>
          <button
            onClick={resetTo1970}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 border border-[#d2ccc0] text-slate-700 hover:text-slate-900 transition-all shadow-xs"
            title="Reset finances to 1970 founding era"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col gap-5 select-none font-sans pb-12">
        
        {/* ── Prominent Monthly Finance Banner (Section 2 Spec) ── */}
        <div className="p-4 rounded-2xl bg-white border border-[#ded8cb] shadow-xs flex flex-col gap-3">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Cash Balance
              </span>
              <span className="text-xl font-mono font-bold text-slate-900 mt-0.5">
                ₹{(cash / 1000000).toFixed(1)}M
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                This Month Income
              </span>
              <span className="text-xl font-mono font-bold text-slate-900 mt-0.5">
                ₹{(monthlyRevenue / 1000000).toFixed(1)}M
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                This Month Expenses
              </span>
              <span className="text-xl font-mono font-bold text-slate-900 mt-0.5">
                ₹{(monthlyExpenses / 1000000).toFixed(1)}M
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Net Profit
              </span>
              <span className={`text-xl font-mono font-bold mt-0.5 ${isProfitable ? "text-emerald-700" : "text-rose-700"}`}>
                {isProfitable ? "+" : ""}₹{(monthlyOperatingProfit / 1000000).toFixed(1)}M
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Cash Flow
              </span>
              <span className={`text-xl font-mono font-bold mt-0.5 ${isCashPositive ? "text-emerald-700" : "text-amber-700"}`}>
                {isCashPositive ? "+" : ""}₹{(monthlyCashFlow / 1000000).toFixed(1)}M
              </span>
            </div>
          </div>

          {/* Monthly Comparison Strip & Active Era Badge (Concept 28) */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs font-mono text-slate-600 gap-2">
            <div>
              Last Month: <span className="font-bold text-slate-900">₹{(lastMonthProfit / 1000000).toFixed(1)}M</span> profit • 
              {" "}This Month: <span className="font-bold text-slate-900">₹{(monthlyOperatingProfit / 1000000).toFixed(1)}M</span> profit • 
              {" "}Forecast Next: <span className="font-bold text-slate-900">₹{((monthlyOperatingProfit * 1.05) / 1000000).toFixed(1)}M</span> projected
            </div>
            
            <div className="flex items-center gap-3">
              {/* Concept 28: Era Progressive Badge */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px]"
                title={`${currentEra.description} • Macro Inflation: ${currentEra.macroInflationFactor}x • Unlocked Streams: ${currentEra.unlockedRevenueStreams.join(", ")}`}
              >
                <History size={12} className="text-amber-600" />
                <span className="font-bold">{currentEra.title}</span>
                <span className="text-amber-700/80 hidden lg:inline">({currentEra.suggestedHeadcount})</span>
              </div>

              <div className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Double-entry active</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Cash Safety Runway Indicator (Always Visible — Section 30 Spec) ── */}
        <div className="px-4 py-3 rounded-2xl bg-[#faf7f2] border border-[#ded8cb] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-slate-700 shrink-0" />
            <div>
              <span className="font-bold text-slate-900">CASH RESERVE: ₹{(cash / 1000000).toFixed(1)}M</span>
              <span className="text-slate-500 ml-2">• Monthly Operating Burn: ₹{(monthlyExpenses / 1000000).toFixed(1)}M</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span>Cash Runway: <strong className="text-slate-900">{monthsOfRunway > 120 ? ">10 years" : `${monthsOfRunway.toFixed(1)} months`}</strong></span>
            
            <div className="w-28 h-2.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  cashHealth === "HEALTHY"
                    ? "bg-emerald-600"
                    : cashHealth === "STABLE"
                    ? "bg-sky-600"
                    : cashHealth === "WARNING"
                    ? "bg-amber-600"
                    : "bg-rose-600"
                }`}
                style={{ width: `${Math.min(100, (monthsOfRunway / 24) * 100)}%` }}
              />
            </div>

            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase border ${
              cashHealth === "HEALTHY"
                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                : cashHealth === "STABLE"
                ? "bg-sky-100 text-sky-800 border-sky-300"
                : "bg-rose-100 text-rose-800 border-rose-300"
            }`}>
              {cashHealth}
            </span>
          </div>
        </div>

        {/* ── 10-Tab Navigation Bar ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-[#ffffff]/90 border border-[#ded8cb] shadow-xs scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-950 hover:bg-[#f5f1e8]"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Active Tab Viewport ── */}
        <div className="w-full flex-1">
          {activeTab === "OVERVIEW" && <OverviewTab />}
          {activeTab === "INCOME" && <IncomeTab />}
          {activeTab === "EXPENSES" && <ExpensesTab />}
          {activeTab === "INFLATION_REVISION" && <InflationTrendsTab />}
          {activeTab === "RD_SPENDING" && <RDSpendingTab />}
          {activeTab === "ASSETS" && <AssetsTab />}
          {activeTab === "CONTRACTS" && <ContractsTab />}
          {activeTab === "WORKFORCE" && <WorkforceTab />}
          {activeTab === "COST_PER_VEHICLE" && <CostPerVehicleTab />}
          {activeTab === "FORECAST" && <ForecastTab />}
          {activeTab === "REPUTATION" && <ReputationEconomyTab />}
        </div>

        {/* ── Month-End Summary Modal ── */}
        <MonthEndSummaryModal
          isOpen={isSummaryModalOpen}
          onClose={() => setIsSummaryModalOpen(false)}
          result={lastTickResult}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsSummaryModalOpen(false);
          }}
        />

        {/* ── Monthly Budget Allocation Modal (Concept 29) ── */}
        <BudgetAllocationModal
          isOpen={isBudgetModalOpen}
          onClose={() => setIsBudgetModalOpen(false)}
        />

      </div>
    </SubPageLayout>
  );
};
