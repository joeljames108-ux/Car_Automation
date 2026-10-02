import React, { useState } from "react";
import {
  GitFork,
  Factory,
  Handshake,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Boxes,
} from "lucide-react";
import {
  InHouseConstraintsResult,
  ContractManufacturer,
  ContractOrderQuote,
  CONTRACT_MANUFACTURERS_CATALOG,
  calculateContractManufacturerQuote,
} from "../../sim/manufacturing/manufacturingSystemEngine";
import { fmtCurrency } from "../../state/DesignContext";

interface HybridProductionPanelProps {
  inHouseConstraints: InHouseConstraintsResult;
  baseMaterialsUSD: number;
  playerCashUSD: number;
  targetPriceUSD: number;
  modelName: string;
  onLaunchHybridRun: (
    inHouseUnits: number,
    inHouseCost: number,
    outsourcedUnits: number,
    outsourcedCost: number,
    partnerId: string
  ) => void;
  isLaunching: boolean;
}

export function HybridProductionPanel({
  inHouseConstraints,
  baseMaterialsUSD,
  playerCashUSD,
  targetPriceUSD,
  modelName,
  onLaunchHybridRun,
  isLaunching,
}: HybridProductionPanelProps) {
  const maxInHouse = inHouseConstraints.maxFeasibleUnits;

  const [inHouseTarget, setInHouseTarget] = useState<number>(Math.max(10, Math.min(maxInHouse, 500)));
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("magna_steyr");
  const [outsourcedTarget, setOutsourcedTarget] = useState<number>(300);

  const selectedPartner =
    CONTRACT_MANUFACTURERS_CATALOG.find((p) => p.id === selectedPartnerId) ||
    CONTRACT_MANUFACTURERS_CATALOG[0];

  const contractQuote: ContractOrderQuote = calculateContractManufacturerQuote(
    selectedPartner,
    outsourcedTarget,
    baseMaterialsUSD,
    playerCashUSD
  );

  // Financial calculations
  const inHouseUnitCost = inHouseConstraints.costDetails.unitTotalCostUSD;
  const inHouseTotalCost = Math.round(inHouseTarget * inHouseUnitCost);

  const outsourcedUnitCost = contractQuote.totalQuotedUnitCostUSD;
  const outsourcedTotalCost = contractQuote.totalContractCostUSD;

  const totalVolume = inHouseTarget + outsourcedTarget;
  const totalCombinedCost = inHouseTotalCost + outsourcedTotalCost;
  const blendedUnitCost = totalVolume > 0 ? totalCombinedCost / totalVolume : 0;

  const blendedProfitPerUnit = targetPriceUSD - blendedUnitCost;
  const blendedMarginPct = targetPriceUSD > 0 ? (blendedProfitPerUnit / targetPriceUSD) * 100 : 0;

  const canAfford = playerCashUSD >= totalCombinedCost;
  const meetsMOQ = outsourcedTarget >= selectedPartner.moqUnits;
  const withinCapacity = outsourcedTarget <= selectedPartner.monthlyAvailableCapacity;

  return (
    <div className="space-y-6">
      {/* ── BANNER ── */}
      <div className="rounded-2xl border border-purple-200/80 bg-gradient-to-r from-purple-50/70 via-[#f9f5fb] to-indigo-50/50 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
              <GitFork size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Hybrid Split Production Strategy
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Maximize in-house factory margins up to your physical bottleneck ceiling, then farm out excess market demand to a contract partner.
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
              In-House Ceiling
            </span>
            <span className="text-sm font-black font-mono text-purple-800">
              {maxInHouse.toLocaleString()} units max
            </span>
          </div>
        </div>
      </div>

      {/* ── TWO-COLUMN ALLOCATION CONTROLS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* IN-HOUSE ALLOCATION */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <Factory size={16} />
              </div>
              <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                1. In-House Factory Allocation
              </h4>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
              ${Math.round(inHouseUnitCost).toLocaleString()} / unit
            </span>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs text-slate-600 font-medium">In-House Volume:</span>
              <span className="text-xl font-black font-mono text-slate-900">
                {inHouseTarget.toLocaleString()} <span className="text-xs font-normal text-slate-400">units</span>
              </span>
            </div>

            <input
              type="range"
              min={10}
              max={Math.max(10, maxInHouse)}
              step={10}
              value={inHouseTarget}
              onChange={(e) => setInHouseTarget(parseInt(e.target.value, 10) || 10)}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>Min: 10</span>
              <button
                type="button"
                onClick={() => setInHouseTarget(maxInHouse)}
                className="text-emerald-700 font-bold hover:underline"
              >
                Snap to Max Feasible ({maxInHouse.toLocaleString()})
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#fbf9f5] border border-slate-200/80 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">In-House Production Cost:</span>
              <span className="font-mono font-bold text-slate-800">${inHouseTotalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Limiting Factor:</span>
              <span className="font-mono text-slate-700">{inHouseConstraints.primaryBottleneck}</span>
            </div>
          </div>
        </div>

        {/* OUTSOURCED ALLOCATION */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                <Handshake size={16} />
              </div>
              <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                2. Contract Overflow Partner
              </h4>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
              ${Math.round(outsourcedUnitCost).toLocaleString()} / unit
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold font-mono text-slate-600 mb-1">
              Select External Partner
            </label>
            <select
              value={selectedPartnerId}
              onChange={(e) => {
                setSelectedPartnerId(e.target.value);
                const p = CONTRACT_MANUFACTURERS_CATALOG.find((x) => x.id === e.target.value);
                if (p && outsourcedTarget < p.moqUnits) {
                  setOutsourcedTarget(p.moqUnits);
                }
              }}
              className="w-full text-xs font-medium bg-[#fcfbf9] border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
            >
              {CONTRACT_MANUFACTURERS_CATALOG.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.countryFlag} {p.name} {p.isRival ? `(Rival +${p.rivalMarkupPct}%)` : ""} · MOQ: {p.moqUnits}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs text-slate-600 font-medium">Outsourced Overflow Volume:</span>
              <span className="text-xl font-black font-mono text-blue-700">
                {outsourcedTarget.toLocaleString()} <span className="text-xs font-normal text-slate-400">units</span>
              </span>
            </div>

            <input
              type="range"
              min={selectedPartner.moqUnits}
              max={selectedPartner.monthlyAvailableCapacity}
              step={25}
              value={outsourcedTarget}
              onChange={(e) => setOutsourcedTarget(parseInt(e.target.value, 10) || selectedPartner.moqUnits)}
              className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>MOQ: {selectedPartner.moqUnits}</span>
              <span>Partner Cap: {selectedPartner.monthlyAvailableCapacity.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#fbf9f5] border border-slate-200/80 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Contract Order Price:</span>
              <span className="font-mono font-bold text-slate-800">${outsourcedTotalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">QA Rating & Defect Buffer:</span>
              <span className="font-mono text-emerald-700">{selectedPartner.qualityRatingScore}/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BLENDED ECONOMICS CARD ── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-purple-600" />
          <span>Combined Hybrid Production Economics</span>
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">
              Total Fleet Output
            </span>
            <span className="text-xl font-black font-mono text-slate-900">
              {totalVolume.toLocaleString()} <span className="text-xs font-normal text-slate-500">cars</span>
            </span>
            <span className="text-[10px] text-slate-500 block">
              {Math.round((inHouseTarget / totalVolume) * 100)}% In-House / {Math.round((outsourcedTarget / totalVolume) * 100)}% Outsourced
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">
              Blended Unit Cost
            </span>
            <span className="text-xl font-black font-mono text-purple-700">
              ${Math.round(blendedUnitCost).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 block">weighted average</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">
              Total Capital Needed
            </span>
            <span className="text-xl font-black font-mono text-slate-900">
              ${totalCombinedCost.toLocaleString()}
            </span>
            <span className={`text-[10px] font-mono font-semibold ${canAfford ? "text-emerald-700" : "text-rose-600"}`}>
              {canAfford ? "Treasury Solvency OK" : "Capital Deficit"}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">
              Blended Profit Margin
            </span>
            <span className="text-xl font-black font-mono text-emerald-700">
              {blendedMarginPct.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-500 block">
              +${Math.round(blendedProfitPerUnit).toLocaleString()} profit / unit
            </span>
          </div>
        </div>

        {/* Validation Errors */}
        {!canAfford && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-600 shrink-0" />
            <span>
              Total hybrid production requires ${totalCombinedCost.toLocaleString()}, which exceeds treasury cash of ${Math.round(playerCashUSD).toLocaleString()}.
            </span>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            disabled={!canAfford || !meetsMOQ || !withinCapacity || isLaunching || totalVolume <= 0}
            onClick={() =>
              onLaunchHybridRun(
                inHouseTarget,
                inHouseTotalCost,
                outsourcedTarget,
                outsourcedTotalCost,
                selectedPartner.id
              )
            }
            className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-mono font-black text-xs tracking-wider uppercase shadow-md transition-all ${
              !canAfford || !meetsMOQ || !withinCapacity
                ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                : isLaunching
                ? "bg-purple-700 text-white animate-pulse"
                : "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            <Sparkles size={16} />
            <span>AUTHORIZE HYBRID FLEET PRODUCTION ({totalVolume.toLocaleString()} CARS) →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
