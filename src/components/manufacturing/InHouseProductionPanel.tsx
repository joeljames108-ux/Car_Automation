import React, { useState } from "react";
import {
  Factory,
  Boxes,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Cpu,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  InHouseConstraintsResult,
  MaterialRequirementDetail,
} from "../../sim/manufacturing/manufacturingSystemEngine";
import {
  FactoryTier,
  FrameMaterial,
  ManufacturingProcess,
  AutomationLevel,
  QcLevel,
  ManufacturingConfig,
} from "../../sim/types";
import {
  FRAME_MATERIALS,
  MANUFACTURING_PROCESSES,
  FACTORY_TIERS,
  AUTOMATION_LEVELS,
  QC_LEVELS,
  ASSEMBLY_LINES,
} from "../../sim/constants";
import { fmtCurrency } from "../../state/DesignContext";

interface InHouseProductionPanelProps {
  constraints: InHouseConstraintsResult;
  config: ManufacturingConfig;
  targetPriceUSD: number;
  onUpdateConfig: (patch: Partial<ManufacturingConfig>) => void;
  onSnapToMaxFeasible: () => void;
  onQuickReplenishMaterial: (itemType: string, amount: number) => void;
  onHireAssemblyWorkers: (count: number) => void;
  onLaunchProductionRun: (units: number, totalCost: number) => void;
  isLaunching: boolean;
  lastRunSummary: { units: number; totalCost: number; date: string } | null;
}

export function InHouseProductionPanel({
  constraints,
  config,
  targetPriceUSD,
  onUpdateConfig,
  onSnapToMaxFeasible,
  onQuickReplenishMaterial,
  onHireAssemblyWorkers,
  onLaunchProductionRun,
  isLaunching,
  lastRunSummary,
}: InHouseProductionPanelProps) {
  const [replenishingType, setReplenishingType] = useState<string | null>(null);

  const c = constraints;
  const isConstrained = c.requestedUnits > c.maxFeasibleUnits;

  const handleReplenish = (itemType: string, amount: number) => {
    setReplenishingType(itemType);
    onQuickReplenishMaterial(itemType, amount);
    setTimeout(() => setReplenishingType(null), 600);
  };

  return (
    <div className="space-y-6">
      {/* ── BOTTLENECK ALERT BANNER (If requested volume exceeds feasible limit) ── */}
      {isConstrained ? (
        <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-[#fef9ec] to-amber-50/80 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 shrink-0 mt-0.5">
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase bg-amber-200 text-amber-900">
                  CRITICAL BOTTLENECK: {c.primaryBottleneck}
                </span>
                <span className="text-xs text-amber-700 font-medium">
                  Requested: {c.requestedUnits.toLocaleString()} units · Feasible: {c.maxFeasibleUnits.toLocaleString()} units
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-1">{c.bottleneckTitle}</h4>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">{c.bottleneckMessage}</p>
              <div className="text-[11px] text-amber-800 font-medium mt-1">
                💡 <strong>Action:</strong> {c.recommendedAction}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onSnapToMaxFeasible}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-mono text-xs font-bold shadow-sm transition-all"
          >
            <span>Snap to Max Feasible ({c.maxFeasibleUnits.toLocaleString()})</span>
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/70 via-[#f4f8f4] to-emerald-50/40 p-3.5 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">
                Production Batch Cleared: {c.requestedUnits.toLocaleString()} Vehicles
              </div>
              <div className="text-[11px] text-slate-500">
                All 4 factory constraints (Capacity, Materials, Workforce, Working Capital) are fully satisfied.
              </div>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-[11px] font-mono text-emerald-800 font-bold">
              Factory Utilization: {c.capacityDetails.lineUtilizationPct}%
            </div>
            <div className="text-[10px] text-slate-500">
              {c.workforceDetails.utilizationPct}% Workforce Shift Load
            </div>
          </div>
        </div>
      )}

      {/* ── 4 MULTI-CONSTRAINT PILLARS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* PILLAR 1: FACTORY CAPACITY */}
        <div className={`rounded-2xl p-4 border transition-all ${
          c.primaryBottleneck === "CAPACITY" && isConstrained
            ? "border-amber-400 bg-amber-50/40 shadow-sm"
            : "border-slate-200/80 bg-[#fbf9f5]/80"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                <Factory size={16} />
              </div>
              <h3 className="text-xs font-bold text-slate-900">1. Factory Capacity</h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
              {FACTORY_TIERS[config.factoryTier]?.label || "Plant"}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-500">Monthly Capacity:</span>
              <span className="font-mono font-bold text-slate-900">
                {c.maxByCapacity.toLocaleString()} <span className="text-[10px] text-slate-500">units/mo</span>
              </span>
            </div>

            {/* Shift Selector */}
            <div className="pt-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] text-slate-600 font-medium">Daily Operating Shifts:</span>
                <span className="font-mono font-bold text-indigo-700">{config.shiftCount} Shifts</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[1, 2, 3].map((shift) => (
                  <button
                    key={shift}
                    type="button"
                    onClick={() => onUpdateConfig({ shiftCount: shift })}
                    className={`py-1 rounded-md text-[11px] font-mono font-bold transition-all border ${
                      config.shiftCount === shift
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {shift} {shift === 1 ? "Shift" : "Shifts"}
                  </button>
                ))}
              </div>
            </div>

            {/* Utilization Bar */}
            <div className="pt-2">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-500">Line Load:</span>
                <span className="font-mono font-bold text-slate-700">{c.capacityDetails.lineUtilizationPct}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    c.capacityDetails.lineUtilizationPct > 95
                      ? "bg-amber-500"
                      : "bg-indigo-600"
                  }`}
                  style={{ width: `${Math.min(100, c.capacityDetails.lineUtilizationPct)}%` }}
                />
              </div>
            </div>

            <div className="text-[10px] text-slate-500 pt-1">
              Annual Base: {c.capacityDetails.annualPlantCapacity.toLocaleString()} units/yr
            </div>
          </div>
        </div>

        {/* PILLAR 2: RAW MATERIALS STOCKPILE */}
        <div className={`rounded-2xl p-4 border transition-all ${
          c.primaryBottleneck === "RAW_MATERIALS" && isConstrained
            ? "border-amber-400 bg-amber-50/40 shadow-sm"
            : "border-slate-200/80 bg-[#fbf9f5]/80"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <Boxes size={16} />
              </div>
              <h3 className="text-xs font-bold text-slate-900">2. Raw Materials</h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
              Stock Limit: {c.maxByMaterials.toLocaleString()}
            </span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {c.materialDetails.map((mat) => {
              const needed = c.requestedUnits * mat.requiredPerVehicle;
              const hasDeficit = mat.unitsOnHand < needed;
              return (
                <div
                  key={mat.itemType}
                  className={`p-1.5 rounded-lg border text-[11px] ${
                    mat.isBottleneck && isConstrained
                      ? "bg-rose-50/90 border-rose-200 text-rose-900"
                      : "bg-white/70 border-slate-200/70 text-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate max-w-[120px]">{mat.name}</span>
                    <span className="font-mono text-[10px]">
                      {mat.unitsOnHand.toLocaleString()} / {needed.toFixed(1)} {mat.unit}
                    </span>
                  </div>
                  {hasDeficit && (
                    <div className="mt-1 flex items-center justify-between gap-1 pt-1 border-t border-rose-200/60">
                      <span className="text-[10px] text-rose-600 font-medium">Deficit: {(needed - mat.unitsOnHand).toFixed(1)}</span>
                      <button
                        type="button"
                        onClick={() => handleReplenish(mat.itemType, Math.ceil(needed - mat.unitsOnHand + 10))}
                        disabled={replenishingType === mat.itemType}
                        className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                      >
                        <RefreshCw size={10} className={replenishingType === mat.itemType ? "animate-spin" : ""} />
                        <span>Procure</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-500 pt-2 flex items-center justify-between">
            <span>Liebig's Minimum Law</span>
            <span className="font-mono font-bold text-slate-700">
              Scarcest: {c.limitingMaterial?.name?.slice(0, 15) || "Balanced"}
            </span>
          </div>
        </div>

        {/* PILLAR 3: WORKFORCE & LABOR */}
        <div className={`rounded-2xl p-4 border transition-all ${
          c.primaryBottleneck === "WORKFORCE" && isConstrained
            ? "border-amber-400 bg-amber-50/40 shadow-sm"
            : "border-slate-200/80 bg-[#fbf9f5]/80"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
                <Users size={16} />
              </div>
              <h3 className="text-xs font-bold text-slate-900">3. Assembly Workforce</h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
              {c.workforceDetails.assemblyWorkersAvailable} Workers
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-500">Takt Time / Unit:</span>
              <span className="font-mono font-bold text-slate-800">{c.workforceDetails.hoursPerVehicle}h labor</span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-slate-500">Labor Hours Avail:</span>
              <span className="font-mono font-bold text-slate-800">
                {Math.round(c.workforceDetails.monthlyLaborHoursAvailable).toLocaleString()}h
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-slate-500">Max by Labor:</span>
              <span className="font-mono font-bold text-sky-800">{c.maxByWorkforce.toLocaleString()} units</span>
            </div>

            {/* Quick Staffing Action */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => onHireAssemblyWorkers(10)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-[11px] font-bold font-mono transition-all"
              >
                <PlusCircle size={12} />
                <span>Hire +10 Assembly Techs ($25k)</span>
              </button>
            </div>

            {/* Workforce Utilization */}
            <div className="pt-1">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-500">Staff Shift Load:</span>
                <span className="font-mono font-bold text-slate-700">{c.workforceDetails.utilizationPct}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    c.workforceDetails.utilizationPct > 100
                      ? "bg-rose-500"
                      : c.workforceDetails.utilizationPct > 80
                      ? "bg-amber-500"
                      : "bg-sky-600"
                  }`}
                  style={{ width: `${Math.min(100, c.workforceDetails.utilizationPct)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* PILLAR 4: PRODUCTION COSTS & WORKING CAPITAL */}
        <div className={`rounded-2xl p-4 border transition-all ${
          c.primaryBottleneck === "FINANCES" && isConstrained
            ? "border-amber-400 bg-amber-50/40 shadow-sm"
            : "border-slate-200/80 bg-[#fbf9f5]/80"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <DollarSign size={16} />
              </div>
              <h3 className="text-xs font-bold text-slate-900">4. Working Capital</h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
              Cash: ${Math.round(c.costDetails.playerCashAvailable).toLocaleString()}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-500">Unit BOM Materials:</span>
              <span className="font-mono font-bold text-slate-800">${Math.round(c.costDetails.unitBOMCostUSD).toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-slate-500">Direct Labor Wage:</span>
              <span className="font-mono font-bold text-slate-800">${Math.round(c.costDetails.unitLaborCostUSD).toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-slate-500">Tooling & Overhead:</span>
              <span className="font-mono font-bold text-slate-800">
                ${Math.round(c.costDetails.unitToolingCostUSD + c.costDetails.unitOverheadCostUSD).toLocaleString()}
              </span>
            </div>

            <div className="pt-1 border-t border-slate-200/70 flex justify-between items-baseline">
              <span className="font-bold text-slate-900">Total Unit Cost:</span>
              <span className="font-mono font-black text-amber-800 text-sm">
                ${Math.round(c.costDetails.unitTotalCostUSD).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-slate-500">Run Batch Total:</span>
              <span className="font-mono font-bold text-slate-900">
                ${Math.round(c.costDetails.totalBatchCostUSD).toLocaleString()}
              </span>
            </div>

            <div className="text-[10px] text-slate-500 pt-1">
              Affordable with Cash: <strong className="font-mono text-slate-700">{c.maxByCapital.toLocaleString()} units</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── BATCH VOLUME SLIDER & TOOLING CONFIGURATION ── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Production Run Volume & Line Tuning</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 font-mono font-bold text-slate-600">
                In-House Series
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify the monthly manufacturing quota to assemble in your company plant
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 font-mono mr-1">Presets:</span>
            {[100, 250, 500, 1000, 2500].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onUpdateConfig({ productionVolume: preset })}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                  config.productionVolume === preset
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {preset.toLocaleString()}
              </button>
            ))}
            <button
              type="button"
              onClick={onSnapToMaxFeasible}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100"
            >
              MAX ({c.maxFeasibleUnits.toLocaleString()})
            </button>
          </div>
        </div>

        {/* Volume Slider */}
        <div className="py-4">
          <div className="flex justify-between items-baseline mb-2">
            <label className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider">
              Batch Volume (Units to Produce)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black font-mono text-slate-900">
                {config.productionVolume.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-medium">units</span>
            </div>
          </div>

          <input
            type="range"
            min={10}
            max={Math.max(5000, c.maxByCapacity * 2)}
            step={10}
            value={config.productionVolume}
            onChange={(e) => onUpdateConfig({ productionVolume: parseInt(e.target.value, 10) || 10 })}
            className="w-full accent-slate-900 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />

          <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
            <span>Min: 10 units</span>
            <span className="text-amber-700 font-bold">
              Constraint Ceiling: {c.maxFeasibleUnits.toLocaleString()} units
            </span>
            <span>Max Range: {Math.max(5000, c.maxByCapacity * 2).toLocaleString()}</span>
          </div>
        </div>

        {/* Tooling Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold font-mono text-slate-600 mb-1">
              Factory Tier & Facility
            </label>
            <select
              value={config.factoryTier}
              onChange={(e) => onUpdateConfig({ factoryTier: e.target.value as FactoryTier })}
              className="w-full text-xs font-medium bg-[#fcfbf9] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {Object.entries(FACTORY_TIERS).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label} (Max {item.capacity.toLocaleString()}/yr)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold font-mono text-slate-600 mb-1">
              Manufacturing Process
            </label>
            <select
              value={config.process}
              onChange={(e) => onUpdateConfig({ process: e.target.value as ManufacturingProcess })}
              className="w-full text-xs font-medium bg-[#fcfbf9] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {Object.entries(MANUFACTURING_PROCESSES).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label} ({item.laborHours}h labor/unit)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold font-mono text-slate-600 mb-1">
              Automation & Robotics
            </label>
            <select
              value={config.automation}
              onChange={(e) => onUpdateConfig({ automation: e.target.value as AutomationLevel })}
              className="w-full text-xs font-medium bg-[#fcfbf9] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {Object.entries(AUTOMATION_LEVELS).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label} ({item.robotCount} robots)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── PRODUCTION LAUNCH ACTION BAR ── */}
      <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 shadow-xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
              IN-HOUSE LINE AUTHORIZATION
            </span>
            {lastRunSummary && (
              <span className="text-[10px] font-mono text-slate-400">
                Last Run: {lastRunSummary.units.toLocaleString()} units
              </span>
            )}
          </div>
          <div className="text-sm font-bold text-slate-100 flex items-center gap-3">
            <span>Quota: {c.requestedUnits.toLocaleString()} Vehicles</span>
            <span className="text-slate-400">·</span>
            <span>Batch Cost: {fmtCurrency(c.costDetails.totalBatchCostUSD)}</span>
            <span className="text-slate-400">·</span>
            <span className="text-emerald-400 font-mono">
              Margin: {(c.costDetails.profitMarginAtTargetMSRP * 100).toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Finished vehicles enter company garage and digital twin fleet ready for dealership sales
          </p>
        </div>

        <button
          type="button"
          disabled={isLaunching || isConstrained || c.requestedUnits <= 0}
          onClick={() => onLaunchProductionRun(c.requestedUnits, c.costDetails.totalBatchCostUSD)}
          className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-mono font-black text-xs tracking-wider uppercase shadow-lg transition-all ${
            isConstrained
              ? "bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600"
              : isLaunching
              ? "bg-emerald-700 text-white animate-pulse"
              : "bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.4)] cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          {isLaunching ? (
            <>
              <RefreshCw size={15} className="animate-spin" />
              <span>STAMPING & ASSEMBLING...</span>
            </>
          ) : isConstrained ? (
            <>
              <AlertTriangle size={15} />
              <span>RESOLVE BOTTLENECK TO LAUNCH</span>
            </>
          ) : (
            <>
              <Sparkles size={15} />
              <span>COMMENCE IN-HOUSE PRODUCTION RUN →</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
