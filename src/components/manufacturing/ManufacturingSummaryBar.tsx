import React from "react";
import { ShieldCheck, TrendingUp, DollarSign, ArrowRight, ArrowLeft, Warehouse } from "lucide-react";
import { fmtCurrency } from "../../state/DesignContext";

interface ManufacturingSummaryBarProps {
  targetPriceUSD: number;
  unitCostUSD: number;
  profitPerUnitUSD: number;
  safetyRating: number;
  totalFleetProduced: number;
  onSelectStage?: (stage: string) => void;
}

export function ManufacturingSummaryBar({
  targetPriceUSD,
  unitCostUSD,
  profitPerUnitUSD,
  safetyRating,
  totalFleetProduced,
  onSelectStage,
}: ManufacturingSummaryBarProps) {
  const marginPct = targetPriceUSD > 0 ? (profitPerUnitUSD / targetPriceUSD) * 100 : 0;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-[#fbf9f5]/95 backdrop-blur-md p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left: Summary Metrics */}
        <div className="flex flex-wrap items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase bg-emerald-100 text-emerald-900 border border-emerald-200">
                  PRODUCTION PIPELINE READY
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  Safety: {safetyRating}/5 ★
                </span>
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                Target MSRP: <strong className="text-slate-900 font-mono">{fmtCurrency(targetPriceUSD)}</strong> · Unit Cost: <strong className="text-slate-900 font-mono">{fmtCurrency(unitCostUSD)}</strong>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200">
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">
                Net Margin / Unit
              </div>
              <div className="text-sm font-black font-mono text-emerald-700">
                +{fmtCurrency(profitPerUnitUSD)} ({marginPct.toFixed(1)}%)
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">
                Total Fleet Produced
              </div>
              <div className="text-sm font-black font-mono text-slate-900">
                {totalFleetProduced.toLocaleString()} units
              </div>
            </div>
          </div>
        </div>

        {/* Right: Stage Navigation Buttons */}
        {onSelectStage && (
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onSelectStage("create_vehicle_hub")}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-mono text-xs font-bold transition-all shadow-xs"
            >
              <ArrowLeft size={14} />
              <span>VEHICLE HUB</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectStage("garage")}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-black text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Warehouse size={15} />
              <span>VIEW FLEET IN GARAGE →</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
