// ===================================================================
// SUPPLY CHAIN & PROCUREMENT WORKSHOP UI PANEL
// ===================================================================
// Interactive Vision Glass dashboard for global Tier-1 suppliers,
// raw commodity spot market quotes, inventory EOQ, and disruption alerts.
// ===================================================================

import React, { useState } from "react";
import { GLOBAL_SUPPLIER_CATALOG, GlobalSupplier } from "../sim/supplyChain/supplierRegistry";
import { RawMaterialsMarketEngine, CommodityType } from "../sim/supplyChain/rawMaterialsMarket";
import { SupplyChainSimulator } from "../sim/supplyChain/supplyChainSimulator";
import { Truck, ShieldAlert, DollarSign, Package, Activity, Play } from "lucide-react";

export const SupplyChainWorkshop: React.FC = () => {
  const [simulator] = useState(() => new SupplyChainSimulator());
  const [lastTickResult, setLastTickResult] = useState(() => simulator.stepSimulationTick());
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const handleAdvanceDay = () => {
    const res = simulator.stepSimulationTick();
    setLastTickResult(res);
  };

  const commodities: CommodityType[] = [
    "ALUMINUM_6061_T6",
    "CARBON_FIBER_T800",
    "TITANIUM_6AL_4V",
    "LITHIUM_HYDROXIDE",
    "NEODYMIUM_N52_RE",
    "COPPER_C11000",
  ];

  const filteredSuppliers =
    selectedCategory === "ALL"
      ? GLOBAL_SUPPLIER_CATALOG
      : GLOBAL_SUPPLIER_CATALOG.filter((s) => s.category === selectedCategory);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner & Advance Tick Controls */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 flex items-center justify-between shadow-xl">
        <div>
          <h2 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            GLOBAL SUPPLY CHAIN & PROCUREMENT WORKSHOP
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate multi-echelon factory replenishment, Tier-1 supplier contracts, raw commodity spot markets, and JIT logistics.
          </p>
        </div>

        <button
          onClick={handleAdvanceDay}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition-all active:scale-95"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>ADVANCE SIMULATION DAY ({lastTickResult.simulationDay})</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>FACTORY LINE STATUS</span>
          </div>
          <div className={`text-base font-black mt-2 ${lastTickResult.factoryStatus.assemblyLineStatus === "RUNNING_NOMINAL" ? "text-emerald-400" : "text-rose-400"}`}>
            {lastTickResult.factoryStatus.assemblyLineStatus}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {lastTickResult.factoryStatus.dailyTargetVehicles} vehicles/day target
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold flex items-center space-x-2">
            <Truck className="w-4 h-4 text-blue-400" />
            <span>ACTIVE SHIPMENTS IN TRANSIT</span>
          </div>
          <div className="text-xl font-black text-white mt-2">{lastTickResult.totalActiveShipments}</div>
          <div className="text-[11px] text-slate-500 mt-1">Daily Freight: ${lastTickResult.dailyLogisticsCostUSD.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>DAILY PROCUREMENT COST</span>
          </div>
          <div className="text-xl font-black text-emerald-400 mt-2">${lastTickResult.dailyProcurementCostUSD.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 mt-1">PPM Defect Chargebacks: ${lastTickResult.warrantyChargebackUSD}</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>STOCKOUT ALERTS</span>
          </div>
          <div className="text-xl font-black text-amber-400 mt-2">{lastTickResult.totalStockoutCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">{lastTickResult.activeAlerts.length} active alerts logged</div>
        </div>
      </div>

      {/* Raw Materials Market Spot Quotes */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
          <Package className="w-4 h-4 text-cyan-400" />
          <span>RAW COMMODITIES SPOT MARKET</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {commodities.map((cKey) => {
            const quote = RawMaterialsMarketEngine.getQuote(cKey);
            const isPos = quote.dailyChangePct >= 0;
            return (
              <div key={cKey} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold truncate">{quote.name}</div>
                <div className="text-sm font-mono font-black text-white mt-1">
                  ${quote.spotPriceUSD.toFixed(2)} <span className="text-[10px] text-slate-500">/{quote.unitOfMeasure}</span>
                </div>
                <div className={`text-[10px] font-mono font-bold mt-1 ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                  {isPos ? "+" : ""}{quote.dailyChangePct}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Tier-1 Supplier Catalog */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200">TIER-1 & TIER-2 SUPPLIER DIRECTORY</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Category Filter:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 text-xs text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="COMPOSITES_CARBON">Composites & Carbon</option>
              <option value="BRAKES_FRICTION">Brakes & Friction</option>
              <option value="TIRES_RUBBER">Tires & Rubber</option>
              <option value="ECU_SEMICONDUCTORS">ECU & Semiconductors</option>
              <option value="BATTERY_CELLS">Battery Cells</option>
              <option value="TURBO_SUPERCHARGERS">Turbochargers</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((s) => (
            <div key={s.id} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{s.name}</h4>
                  <div className="text-[10px] text-slate-400">{s.country} • {s.category}</div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  {s.costMultiplier}x Cost
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">{s.specialtyDescription}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800 font-mono">
                <div>Quality: <span className="text-emerald-400 font-bold">{s.reputationScorePct}%</span> ({s.qualityDefectPpm} PPM)</div>
                <div>Lead Time: <span className="text-amber-400 font-bold">{s.leadTimeWeeks} wks</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
