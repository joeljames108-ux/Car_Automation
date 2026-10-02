import React from "react";
import { Factory, Handshake, GitFork, DollarSign, Warehouse, ShieldAlert } from "lucide-react";
import { ProductionRoutingMode, ConstraintType } from "../../sim/manufacturing/manufacturingSystemEngine";

interface ManufacturingModeTabsProps {
  mode: ProductionRoutingMode;
  onSelectMode: (mode: ProductionRoutingMode) => void;
  treasuryCashUSD: number;
  inHouseBottleneck: ConstraintType;
  inHouseMaxFeasible: number;
  activeContractOrdersCount: number;
}

export function ManufacturingModeTabs({
  mode,
  onSelectMode,
  treasuryCashUSD,
  inHouseBottleneck,
  inHouseMaxFeasible,
  activeContractOrdersCount,
}: ManufacturingModeTabsProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-[#fbf9f5]/90 backdrop-blur-md p-3 shadow-sm">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Mode Selector Tabs */}
        <div className="inline-flex p-1.5 rounded-xl bg-[#eee9df] border border-slate-200/70 shadow-inner">
          <button
            type="button"
            onClick={() => onSelectMode("in_house")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
              mode === "in_house"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/90 font-black"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            <Factory size={15} className={mode === "in_house" ? "text-emerald-600" : "text-slate-500"} />
            <span>🏢 Company Factory (In-House)</span>
            {inHouseBottleneck !== "NONE" && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 border border-amber-300 font-mono font-semibold">
                Capped
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectMode("outsourced")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
              mode === "outsourced"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/90 font-black"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            <Handshake size={15} className={mode === "outsourced" ? "text-blue-600" : "text-slate-500"} />
            <span>🤝 Contract Orders (Rivals & Foundries)</span>
            {activeContractOrdersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 border border-blue-300 font-mono font-semibold">
                {activeContractOrdersCount} Active
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectMode("hybrid")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
              mode === "hybrid"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/90 font-black"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            <GitFork size={15} className={mode === "hybrid" ? "text-purple-600" : "text-slate-500"} />
            <span>⚖️ Hybrid Allocation (Split)</span>
          </button>
        </div>

        {/* Global Treasury & Capacity Quick Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs">
            <div className="p-1 rounded-md bg-emerald-100/70 text-emerald-700">
              <DollarSign size={14} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold">
                Treasury Cash
              </div>
              <div className="text-xs font-black font-mono text-slate-900">
                ${Math.round(treasuryCashUSD).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs">
            <div className="p-1 rounded-md bg-amber-100/70 text-amber-700">
              <Warehouse size={14} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold">
                Max In-House Output
              </div>
              <div className="text-xs font-black font-mono text-slate-900">
                {inHouseMaxFeasible.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">units/mo</span>
              </div>
            </div>
          </div>

          {inHouseBottleneck !== "NONE" && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
              <ShieldAlert size={14} className="text-amber-600 shrink-0" />
              <span>Limited by <strong>{inHouseBottleneck.replace("_", " ")}</strong></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
