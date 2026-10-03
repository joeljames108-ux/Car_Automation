import React, { useState, useMemo } from "react";
import {
  History,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldAlert,
  Boxes,
  Calendar,
  Sparkles,
  Info,
  DollarSign,
  ChevronRight,
  Flame,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { useSimulationClockStore } from "../../state/simulationClockStore";
import { useTradeStore } from "../../state/tradeStore";
import { useCompanyFinanceStore } from "../../state/companyFinanceStore";
import { useReputationStore } from "../../state/reputationStore";
import {
  getInflationRecordForDate,
  getDaysUntilNextRevision,
  getAllHistoricalRecords,
  HistoricalInflationRecord,
} from "../../sim/economy/historicalInflationData";
import {
  executeSemiAnnualPriceRevision,
  getRevisionHistory,
  getLatestExecutedRevision,
  BASE_1970_PROCESSED_MATERIALS_USD,
  BASE_1970_SALARIES_MONTHLY_USD,
  BASE_1970_VEHICLE_BENCHMARKS_USD,
} from "../../sim/economy/semiAnnualPriceRevisionEngine";
import {
  calculateOptimalStockpileHedge,
  MaterialHedgeItem,
} from "../../sim/trade/warehouseHedgeEngine";
import { getForecastHistory } from "../../sim/economy/economicForecastEngine";

export const InflationTrendsTab: React.FC = () => {
  const { year, month, day } = useSimulationClockStore();
  const reputation = useReputationStore((s) => s.overallReputation);
  const tradeStore = useTradeStore();
  const financeStore = useCompanyFinanceStore();

  const [catalogSubTab, setCatalogSubTab] = useState<"MATERIALS" | "VEHICLES" | "SALARIES" | "FACILITIES">("MATERIALS");

  // Current active inflation record and revision countdown
  const currentRecord: HistoricalInflationRecord = useMemo(() => {
    return getInflationRecordForDate(year, month, day);
  }, [year, month, day]);

  const countdown = useMemo(() => {
    return getDaysUntilNextRevision(year, month, day);
  }, [year, month, day]);

  // Current active revision summary
  const currentRevision = useMemo(() => {
    const period = month < 7 ? "H1_JAN" : "H2_JUL";
    return executeSemiAnnualPriceRevision(year, period);
  }, [year, month]);

  // Warehouse summary and hedging plan based on remaining warehouse capacity
  const warehouseSummary = useMemo(() => {
    return tradeStore.getWarehouseUI(year, reputation, financeStore.cash);
  }, [tradeStore, year, reputation, financeStore.cash]);

  const availableWarehouseCapacity = useMemo(() => {
    const hqCap = warehouseSummary.capacityTonnes;
    const hqUsed = warehouseSummary.usedTonnes;
    return Math.max(0, hqCap - hqUsed);
  }, [warehouseSummary.capacityTonnes, warehouseSummary.usedTonnes]);

  const hedgePlan = useMemo(() => {
    return calculateOptimalStockpileHedge(availableWarehouseCapacity, year, month);
  }, [availableWarehouseCapacity, year, month]);

  // Historical timeline data
  const allHistoricalRecords = useMemo(() => {
    return getAllHistoricalRecords().filter((r) => r.year <= year);
  }, [year]);

  const forecastBulletins = useMemo(() => {
    return getForecastHistory();
  }, []);

  const revisionLedger = useMemo(() => {
    return getRevisionHistory();
  }, []);

  const formatUSD = (val: number) => {
    return "$" + val.toLocaleString("en-US");
  };

  const [stockpileToast, setStockpileToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleExecuteStockpile = (mat: MaterialHedgeItem) => {
    const requiredCash = mat.currentSpotPriceUSD * mat.recommendedStockpileTonnes;
    if (financeStore.cash < requiredCash) {
      setStockpileToast({
        message: `Insufficient capital: You need ${formatUSD(requiredCash)} to stockpile ${mat.recommendedStockpileTonnes}t of ${mat.name}.`,
        type: "error",
      });
      return;
    }

    if (availableWarehouseCapacity < mat.recommendedStockpileTonnes) {
      setStockpileToast({
        message: `Insufficient warehouse storage: Only ${availableWarehouseCapacity.toFixed(1)}t available for ${mat.recommendedStockpileTonnes}t order. Upgrade warehouse in Trade Hub!`,
        type: "error",
      });
      return;
    }

    const success = tradeStore.placeSpotPurchase(
      mat.materialKey,
      mat.recommendedStockpileTonnes,
      "atlas_steel_co",
      mat.currentSpotPriceUSD
    );

    if (success) {
      setStockpileToast({
        message: `Strategic Hedge Complete: Purchased ${mat.recommendedStockpileTonnes} tonnes of ${mat.name} for ${formatUSD(requiredCash)}. Estimated savings: +${formatUSD(mat.netProjectedSavingsUSD)}!`,
        type: "success",
      });
    } else {
      setStockpileToast({
        message: "Failed to place stockpile order. Check funds and try again.",
        type: "error",
      });
    }
  };

  const handleBulkHedgeAll = () => {
    let successCount = 0;
    let totalSpent = 0;
    let totalSaved = 0;

    for (const mat of hedgePlan.recommendedMaterials) {
      const requiredCash = mat.currentSpotPriceUSD * mat.recommendedStockpileTonnes;
      if (financeStore.cash >= requiredCash && availableWarehouseCapacity >= mat.recommendedStockpileTonnes) {
        const ok = tradeStore.placeSpotPurchase(
          mat.materialKey,
          mat.recommendedStockpileTonnes,
          "atlas_steel_co",
          mat.currentSpotPriceUSD
        );
        if (ok) {
          successCount++;
          totalSpent += requiredCash;
          totalSaved += mat.netProjectedSavingsUSD;
        }
      }
    }

    if (successCount > 0) {
      setStockpileToast({
        message: `Bulk Strategic Hedge Complete! Stockpiled ${successCount} materials for ${formatUSD(totalSpent)}, locking in +${formatUSD(totalSaved)} in projected savings!`,
        type: "success",
      });
    } else {
      setStockpileToast({
        message: "Unable to execute bulk stockpile: Please verify available warehouse capacity and cash balances.",
        type: "error",
      });
    }
  };

  const getRiskBadgeColor = (risk: HistoricalInflationRecord["inflationRiskLevel"]) => {
    switch (risk) {
      case "SEVERE":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "HIGH":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "MODERATE":
        return "bg-sky-100 text-sky-800 border-sky-300";
      case "DEFLATIONARY":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "STABLE":
      default:
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-sans text-slate-800">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER COUNTDOWN & STATUS BANNER
      ───────────────────────────────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-[#fdfcfa] border border-[#dad4c5] shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/8 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#ede7d8]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#fef6e9] border border-[#fbd38d] text-amber-900 flex items-center justify-center text-xl shadow-xs">
              <History size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 uppercase font-mono tracking-wider">
                  Biannual Economic Price Revision System
                </h2>
                <span
                  className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${getRiskBadgeColor(
                    currentRecord.inflationRiskLevel
                  )}`}
                >
                  {currentRecord.inflationRiskLevel} RISK
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Active Cycle: <span className="font-bold text-slate-900">{currentRecord.displayDate}</span> • Prices revised every 6 months (1st Jan & 1st Jul)
              </p>
            </div>
          </div>

          {/* Countdown Clock Widget */}
          <div className="flex items-center gap-3 bg-[#faf8f2] px-4 py-2.5 rounded-xl border border-[#e2dcd0]">
            <Clock size={16} className="text-amber-700 animate-pulse" />
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Next Price Revision</div>
              <div className="text-sm font-black text-slate-900 font-mono">
                {countdown.targetDateStr} — <span className="text-amber-800">{countdown.daysRemaining} Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Macro Headline & Intelligence Guidance */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-[#fbf9f4] border border-[#e8e2d4]">
            <div className="text-[10px] font-mono uppercase text-slate-500 font-bold flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-700" /> Historical Context
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1 leading-relaxed">
              {currentRecord.headlineEvent}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#fbf9f4] border border-[#e8e2d4]">
            <div className="text-[10px] font-mono uppercase text-slate-500 font-bold flex items-center gap-1.5">
              <Info size={12} className="text-sky-700" /> Economic Guidance
            </div>
            <div className="text-xs text-slate-700 mt-1 leading-relaxed">
              {currentRecord.economicGuidance}
            </div>
          </div>
        </div>

        {/* Macro Indices Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl bg-[#faf8f2] border border-[#e5dfd2]">
            <div className="text-[10px] font-mono text-slate-500 uppercase">General CPI</div>
            <div className="text-sm font-black text-slate-900 font-mono mt-0.5">
              {currentRecord.generalCPI.toFixed(2)}x
            </div>
            <div className="text-[10px] text-slate-500">Base 1970 = 1.0x</div>
          </div>
          <div className="p-3 rounded-xl bg-[#faf8f2] border border-[#e5dfd2]">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Automotive PPI</div>
            <div className="text-sm font-black text-slate-900 font-mono mt-0.5">
              {currentRecord.automotivePPI.toFixed(2)}x
            </div>
            <div className="text-[10px] text-slate-500">Vehicles & Parts</div>
          </div>
          <div className="p-3 rounded-xl bg-[#faf8f2] border border-[#e5dfd2]">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Metals Index</div>
            <div className="text-sm font-black text-slate-900 font-mono mt-0.5">
              {currentRecord.metalsIndex.toFixed(2)}x
            </div>
            <div className="text-[10px] text-slate-500">Steel & Aluminum</div>
          </div>
          <div className="p-3 rounded-xl bg-[#faf8f2] border border-[#e5dfd2]">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Energy Index</div>
            <div className="text-sm font-black text-slate-900 font-mono mt-0.5">
              {currentRecord.energyPetrochemIndex.toFixed(2)}x
            </div>
            <div className="text-[10px] text-slate-500">Crude & Polymers</div>
          </div>
          <div className="p-3 rounded-xl bg-[#faf8f2] border border-[#e5dfd2]">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Labor Wage Index</div>
            <div className="text-sm font-black text-slate-900 font-mono mt-0.5">
              {currentRecord.laborWageIndex.toFixed(2)}x
            </div>
            <div className="text-[10px] text-slate-500">Assembler & Tech</div>
          </div>
          <div className="p-3 rounded-xl bg-[#faf8f2] border border-[#e5dfd2]">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Electronics</div>
            <div className="text-sm font-black text-emerald-800 font-mono mt-0.5">
              {currentRecord.electronicsIndex.toFixed(2)}x
            </div>
            <div className="text-[10px] text-emerald-700">Tech Deflation</div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. STRATEGIC WAREHOUSE STOCKPILE HEDGING ADVISOR
      ───────────────────────────────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#fdfbf7] to-[#f7f3e8] border border-[#dad3c2] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fef6e9] border border-[#fbd38d] text-amber-900 flex items-center justify-center">
              <Boxes size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 uppercase font-mono tracking-wider">
                  Strategic Warehouse Stockpile Hedging Advisor
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-[#ffffff] border border-[#d8d2c2] text-slate-800">
                  {hedgePlan.strategicVerdict.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Protect vehicle profit margins by pre-buying raw materials before the {countdown.targetDateStr} revision
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Available Storage Capacity</div>
              <div className="text-sm font-black text-slate-900 font-mono">
                {availableWarehouseCapacity.toFixed(1)} Tonnes Remaining
              </div>
            </div>

            {hedgePlan.recommendedMaterials.length > 0 && (
              <button
                onClick={handleBulkHedgeAll}
                disabled={availableWarehouseCapacity <= 0}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <Zap size={14} className="fill-current" />
                <span>Bulk Hedge All</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {stockpileToast && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-mono flex items-center justify-between gap-3 ${
              stockpileToast.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-rose-50 text-rose-800 border-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {stockpileToast.type === "success" ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle size={16} className="text-rose-600 shrink-0" />
              )}
              <span>{stockpileToast.message}</span>
            </div>
            <button
              onClick={() => setStockpileToast(null)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-[#ffffff]/80 border border-[#dfd8c8] text-xs text-slate-700 flex items-start gap-2.5">
          <Info size={16} className="text-amber-800 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-slate-900">Procurement Strategy: </span>
            {hedgePlan.advisoryNote}
          </div>
        </div>

        {/* Recommended Stockpile Candidates */}
        {hedgePlan.recommendedMaterials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {hedgePlan.recommendedMaterials.map((mat) => {
              const acquisitionCost = mat.currentSpotPriceUSD * mat.recommendedStockpileTonnes;
              const canAfford = financeStore.cash >= acquisitionCost && availableWarehouseCapacity >= mat.recommendedStockpileTonnes;

              return (
                <div key={mat.materialKey} className="p-3.5 rounded-xl bg-[#ffffff] border border-[#ded7c7] shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{mat.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        +{mat.projectedHikePct}% Next Cycle
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-[11px] font-mono">
                      <div className="flex justify-between text-slate-500">
                        <span>Current Spot:</span>
                        <span className="text-slate-900 font-bold">{formatUSD(mat.currentSpotPriceUSD)}/t</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Projected Spot:</span>
                        <span className="text-rose-800 font-bold">{formatUSD(mat.projectedNextPriceUSD)}/t</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Stockpile Rec:</span>
                        <span className="text-slate-900 font-bold">{mat.recommendedStockpileTonnes} t</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-slate-100">
                        <span>Net Savings:</span>
                        <span>+{formatUSD(mat.netProjectedSavingsUSD)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleExecuteStockpile(mat)}
                    disabled={!canAfford}
                    className="mt-3 w-full py-1.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-mono font-bold flex items-center justify-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Zap size={12} className="fill-current text-amber-600" />
                    <span>Stockpile {mat.recommendedStockpileTonnes}t ({formatUSD(acquisitionCost)})</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#ffffff] border border-[#ded7c7] text-center text-xs text-slate-500 font-mono">
            No imminent high-inflation surges detected for the next cycle. Buffer stock is sufficient.
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. PRICE CATALOG & BENCHMARKS (CURRENT VS PROJECTED)
      ───────────────────────────────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-[#fdfcfa] border border-[#dad4c5] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ede7d8]">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase font-mono tracking-wider">
              Revised Game Economic Catalog & Benchmarks
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live pricing calibrated against the {currentRecord.displayDate} semi-annual revision
            </p>
          </div>

          {/* Sub-tab Navigation */}
          <div className="flex items-center gap-1.5 bg-[#f4f0e6] p-1 rounded-xl border border-[#dad3c2]">
            {(
              [
                { key: "MATERIALS", label: "Raw Materials" },
                { key: "VEHICLES", label: "Vehicle MSRPs" },
                { key: "SALARIES", label: "Workforce Payroll" },
                { key: "FACILITIES", label: "Overhead & Freight" },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => setCatalogSubTab(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  catalogSubTab === t.key
                    ? "bg-[#ffffff] text-slate-900 shadow-2xs border border-[#d2ccc0]"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Raw Materials & Commodities */}
        {catalogSubTab === "MATERIALS" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                  <th className="pb-2.5">Material Specification</th>
                  <th className="pb-2.5">1970 Baseline</th>
                  <th className="pb-2.5">Current Spot Price</th>
                  <th className="pb-2.5">Delta vs Last Cycle</th>
                  <th className="pb-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Object.keys(currentRevision.processedMaterials) as (keyof typeof currentRevision.processedMaterials)[]).map(
                  (matKey) => {
                    const item = currentRevision.processedMaterials[matKey];
                    const base1970 = BASE_1970_PROCESSED_MATERIALS_USD[matKey];
                    return (
                      <tr key={matKey} className="hover:bg-slate-50/50">
                        <td className="py-2.5 font-bold text-slate-900">{matKey.replace(/_/g, " ")}</td>
                        <td className="py-2.5 text-slate-500">{formatUSD(base1970)}/t</td>
                        <td className="py-2.5 font-bold text-slate-900">{formatUSD(item.priceUSD)}/t</td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              item.deltaPct > 0
                                ? "bg-rose-50 text-rose-700"
                                : item.deltaPct < 0
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {item.deltaPct > 0 ? `+${item.deltaPct}%` : `${item.deltaPct}%`}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-500 text-[11px]">
                          {item.deltaPct >= 8 ? (
                            <span className="text-rose-700 font-bold flex items-center gap-1">
                              <Flame size={12} /> Inflation Spike
                            </span>
                          ) : (
                            "Standard Quote"
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Vehicle MSRP Benchmarks */}
        {catalogSubTab === "VEHICLES" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                  <th className="pb-2.5">Segment Line</th>
                  <th className="pb-2.5">1970 Baseline MSRP</th>
                  <th className="pb-2.5">Current Market Benchmark</th>
                  <th className="pb-2.5">Delta vs Last Cycle</th>
                  <th className="pb-2.5">Price Competitiveness Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.keys(currentRevision.vehicleBenchmarks).map((segKey) => {
                  const item = currentRevision.vehicleBenchmarks[segKey];
                  const base1970 = BASE_1970_VEHICLE_BENCHMARKS_USD[segKey];
                  return (
                    <tr key={segKey} className="hover:bg-slate-50/50">
                      <td className="py-2.5 font-bold text-slate-900">{segKey}</td>
                      <td className="py-2.5 text-slate-500">{formatUSD(base1970)}</td>
                      <td className="py-2.5 font-bold text-slate-900">{formatUSD(item.benchmarkMSRPUSD)}</td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            item.deltaPct > 0
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          +{item.deltaPct}%
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-600 text-[11px]">
                        List price within ±8% maintains optimal sales demand elasticity.
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Workforce Payroll */}
        {catalogSubTab === "SALARIES" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                  <th className="pb-2.5">Department</th>
                  <th className="pb-2.5">1970 Base Monthly</th>
                  <th className="pb-2.5">Current Monthly Benchmark</th>
                  <th className="pb-2.5">Delta vs Last Cycle</th>
                  <th className="pb-2.5">Union & Labor Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Object.keys(currentRevision.salaries) as (keyof typeof currentRevision.salaries)[]).map(
                  (deptKey) => {
                    const item = currentRevision.salaries[deptKey];
                    const base1970 = BASE_1970_SALARIES_MONTHLY_USD[deptKey];
                    return (
                      <tr key={deptKey} className="hover:bg-slate-50/50">
                        <td className="py-2.5 font-bold text-slate-900">{deptKey}</td>
                        <td className="py-2.5 text-slate-500">{formatUSD(base1970)}/mo</td>
                        <td className="py-2.5 font-bold text-slate-900">{formatUSD(item.monthlySalaryUSD)}/mo</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-sky-50 text-sky-800">
                            +{item.deltaPct}%
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-500 text-[11px]">
                          UAW master agreement & technical specialization scaling
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Facilities & Logistics */}
        {catalogSubTab === "FACILITIES" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#faf8f2] border border-[#e5dfd2] space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase font-mono">Fixed Facilities Overhead</h4>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Factory Baseload Maintenance:</span>
                  <span className="font-bold text-slate-900">{formatUSD(currentRevision.facilities.factoryUSD)}/mo</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>HQ Facilities & Utilities:</span>
                  <span className="font-bold text-slate-900">{formatUSD(currentRevision.facilities.hqUSD)}/mo</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>R&D Laboratory Readiness:</span>
                  <span className="font-bold text-slate-900">{formatUSD(currentRevision.facilities.rdUSD)}/mo</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Testing Grounds Baseload:</span>
                  <span className="font-bold text-slate-900">{formatUSD(currentRevision.facilities.testingUSD)}/mo</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Corporate Insurance:</span>
                  <span className="font-bold text-slate-900">{formatUSD(currentRevision.facilities.insuranceUSD)}/mo</span>
                </div>
                <div className="flex justify-between text-amber-900 font-bold pt-2 border-t border-slate-200">
                  <span>Total Monthly Overhead:</span>
                  <span>{formatUSD(currentRevision.facilities.totalMonthlyOverheadUSD)}/mo</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#faf8f2] border border-[#e5dfd2] space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase font-mono">Freight Logistics Tariffs</h4>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Truck Freight (Fuel Sensitive):</span>
                  <span className="font-bold text-slate-900">${currentRevision.freightRates.truckUSD.toFixed(3)} / ton-km</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Heavy Rail (Spur Connected):</span>
                  <span className="font-bold text-slate-900">${currentRevision.freightRates.railUSD.toFixed(3)} / ton-km</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Maritime RoRo & Container:</span>
                  <span className="font-bold text-slate-900">${currentRevision.freightRates.maritimeUSD.toFixed(3)} / ton-km</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Air Cargo Expedited:</span>
                  <span className="font-bold text-slate-900">${currentRevision.freightRates.airUSD.toFixed(3)} / ton-km</span>
                </div>
                <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-200">
                  Trucking and air freight rates fluctuate directly with crude oil refinery tariffs.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. HISTORICAL REVISION AUDIT LEDGER & RECENT BULLETINS
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Advance Bulletins */}
        <div className="p-5 rounded-2xl bg-[#fdfcfa] border border-[#dad4c5] shadow-xs space-y-3">
          <h3 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-amber-700" /> Economic Forecast Intelligence Feed
          </h3>
          {forecastBulletins.length > 0 ? (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {forecastBulletins.map((b) => (
                <div key={b.id} className="p-3 rounded-xl bg-[#faf8f2] border border-[#e5dfd2] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{b.title}</span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        b.severity === "CRITICAL"
                          ? "bg-rose-100 text-rose-800"
                          : b.severity === "WARNING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {b.severity}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">{b.summaryMessage}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 font-mono">
              Advance bulletins trigger on 1 May, 1 Jun, 1 Nov, and 1 Dec ahead of semi-annual revisions.
            </div>
          )}
        </div>

        {/* Executed Revisions History */}
        <div className="p-5 rounded-2xl bg-[#fdfcfa] border border-[#dad4c5] shadow-xs space-y-3">
          <h3 className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
            <History size={14} className="text-slate-700" /> Executed Revision History Ledger
          </h3>
          {revisionLedger.length > 0 ? (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {revisionLedger.map((r) => (
                <div key={r.revisionId} className="p-3 rounded-xl bg-[#faf8f2] border border-[#e5dfd2] text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{r.dateStr} Revision</span>
                    <span className="text-[10px] text-slate-500">CPI {r.macroIndices.cpi.toFixed(2)}x</span>
                  </div>
                  <p className="text-slate-600 mt-1 text-[11px] font-sans">{r.headline}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 font-mono">
              Executed revisions are recorded into the ledger every 1st January and 1st July.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
