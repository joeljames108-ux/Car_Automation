import React, { useState } from "react";
import {
  X,
  ArrowLeftRight,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Shield,
  Sparkles,
  Layers,
  Award,
  ExternalLink,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { useCampusStore } from "../../state/campusStore";
import { CampusUnitId, CampusUnitDefinition } from "../../sim/campus/campusTypes";

interface BuildingComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUnitAId?: CampusUnitId;
  initialUnitBId?: CampusUnitId;
}

export const BuildingComparisonModal: React.FC<BuildingComparisonModalProps> = ({
  isOpen,
  onClose,
  initialUnitAId = "CENTRAL_CORPORATE_HQ",
  initialUnitBId = "POWERTRAIN_EV_HQ",
}) => {
  const { units, selectUnit } = useCampusStore();

  const [unitAId, setUnitAId] = useState<CampusUnitId>(initialUnitAId);
  const [unitBId, setUnitBId] = useState<CampusUnitId>(initialUnitBId);

  if (!isOpen) return null;

  const unitA: CampusUnitDefinition | undefined = units[unitAId];
  const unitB: CampusUnitDefinition | undefined = units[unitBId];

  const handleSwap = () => {
    const temp = unitAId;
    setUnitAId(unitBId);
    setUnitBId(temp);
  };

  const handleInspect = (id: CampusUnitId) => {
    selectUnit(id);
    onClose();
  };

  const allUnitsList = Object.values(units);

  const getUnitMetrics = (u: CampusUnitDefinition) => {
    let rndSpeed = 0;
    let styling = 0;
    let quality = 0;
    let safety = 0;

    if (u.id === "POWERTRAIN_EV_HQ") rndSpeed += u.level * 8;
    else if (u.id === "AERO_HQ") rndSpeed += u.level * 6;
    else if (u.id === "TESTING_VALIDATION_HQ") {
      rndSpeed += u.level * 7;
      quality += u.level * 4;
    } else if (u.id === "VEHICLE_DESIGN_HQ") styling += u.level * 8;
    else if (u.id === "SAFETY_HQ") safety += u.level * 10;
    else if (u.id === "QUALITY_RELIABILITY_HQ") quality += u.level * 6;
    else if (u.id === "CHASSIS_DYNAMICS_HQ") rndSpeed += u.level * 6;
    else if (u.id === "INTERIOR_HQ") styling += u.level * 5;
    else if (u.id === "MOTORSPORT_HQ") rndSpeed += u.level * 5;
    else if (u.id === "MARKETING_SALES_HQ") styling += u.level * 4;
    else if (u.id === "CENTRAL_CORPORATE_HQ") rndSpeed += u.level * 3;

    return { rndSpeed, styling, quality, safety };
  };

  const metricsA = unitA ? getUnitMetrics(unitA) : null;
  const metricsB = unitB ? getUnitMetrics(unitB) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-[#f8f6f0] border border-[#dad4c5] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#dad4c5] bg-white/70 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-700">
              <ArrowLeftRight size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-mono tracking-wide">
                CAMPUS FACILITY COMPARISON
              </h3>
              <p className="text-xs text-slate-500">
                Side-by-side engineering, economic & operational metrics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Unit Selector Row with Swap */}
        <div className="px-6 py-4 bg-[#f1ede2]/80 border-b border-[#dad4c5] flex items-center justify-between gap-4">
          <div className="flex-1">
            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1">
              PRIMARY FACILITY (UNIT A)
            </label>
            <select
              value={unitAId}
              onChange={(e) => setUnitAId(e.target.value as CampusUnitId)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#dad4c5] text-xs font-bold text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {allUnitsList.map((u) => (
                <option key={u.id} value={u.id}>
                  UNIT {u.unitNumber.toString().padStart(2, "0")} — {u.name} (Lvl {u.level})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSwap}
            className="p-2.5 rounded-xl bg-white border border-[#dad4c5] text-slate-600 hover:text-cyan-700 hover:border-cyan-400 transition-all self-end shadow-xs"
            title="Swap facilities"
          >
            <ArrowLeftRight size={16} />
          </button>

          <div className="flex-1">
            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1">
              BENCHMARK FACILITY (UNIT B)
            </label>
            <select
              value={unitBId}
              onChange={(e) => setUnitBId(e.target.value as CampusUnitId)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#dad4c5] text-xs font-bold text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {allUnitsList.map((u) => (
                <option key={u.id} value={u.id}>
                  UNIT {u.unitNumber.toString().padStart(2, "0")} — {u.name} (Lvl {u.level})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparative Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {unitA && unitB && metricsA && metricsB ? (
            <>
              {/* Unit Card Heads */}
              <div className="grid grid-cols-2 gap-4">
                {/* Unit A Card */}
                <div className="p-4 rounded-2xl bg-white border border-[#dad4c5] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-100 text-cyan-800 border border-cyan-300">
                      UNIT {unitA.unitNumber.toString().padStart(2, "0")}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      Zone {unitA.zone} • {unitA.sectorLabel}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 truncate">{unitA.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{unitA.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Tier {unitA.level} / 7</span>
                    <button
                      onClick={() => handleInspect(unitA.id)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition-colors flex items-center gap-1"
                    >
                      <span>Inspect</span>
                      <ExternalLink size={11} />
                    </button>
                  </div>
                </div>

                {/* Unit B Card */}
                <div className="p-4 rounded-2xl bg-white border border-[#dad4c5] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                      UNIT {unitB.unitNumber.toString().padStart(2, "0")}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      Zone {unitB.zone} • {unitB.sectorLabel}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 truncate">{unitB.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{unitB.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Tier {unitB.level} / 7</span>
                    <button
                      onClick={() => handleInspect(unitB.id)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1"
                    >
                      <span>Inspect</span>
                      <ExternalLink size={11} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Metric Comparison Table */}
              <div className="rounded-2xl border border-[#dad4c5] bg-white overflow-hidden shadow-xs">
                <div className="p-3 bg-[#f4f0e6]/70 border-b border-[#dad4c5]">
                  <h4 className="text-xs font-extrabold text-slate-800 font-mono uppercase tracking-wide">
                    KEY PERFORMANCE INDICATORS (KPIs)
                  </h4>
                </div>

                <div className="divide-y divide-slate-100">
                  {/* Metric 1: Headcount */}
                  <div className="grid grid-cols-3 p-3 text-xs items-center">
                    <div className="font-mono font-bold text-slate-900 text-left">
                      {unitA.currentStaff} / {unitA.staffCapacity} Staff
                    </div>
                    <div className="text-center text-slate-500 font-bold uppercase text-[10px] font-mono flex items-center justify-center gap-1">
                      <Users size={12} className="text-cyan-600" />
                      <span>Headcount Capacity</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-right">
                      {unitB.currentStaff} / {unitB.staffCapacity} Staff
                    </div>
                  </div>

                  {/* Metric 2: Monthly Maintenance */}
                  <div className="grid grid-cols-3 p-3 text-xs items-center bg-slate-50/50">
                    <div className="font-mono font-bold text-amber-700 text-left">
                      ${(unitA.monthlyMaintenanceCost / 1e3).toFixed(1)}k / mo
                    </div>
                    <div className="text-center text-slate-500 font-bold uppercase text-[10px] font-mono flex items-center justify-center gap-1">
                      <DollarSign size={12} className="text-amber-600" />
                      <span>Monthly Burn Rate</span>
                    </div>
                    <div className="font-mono font-bold text-amber-700 text-right">
                      ${(unitB.monthlyMaintenanceCost / 1e3).toFixed(1)}k / mo
                    </div>
                  </div>

                  {/* Metric 3: R&D Speed Bonus */}
                  <div className="grid grid-cols-3 p-3 text-xs items-center">
                    <div className="font-mono font-bold text-emerald-700 text-left">
                      +{metricsA.rndSpeed}%
                    </div>
                    <div className="text-center text-slate-500 font-bold uppercase text-[10px] font-mono flex items-center justify-center gap-1">
                      <TrendingUp size={12} className="text-emerald-600" />
                      <span>R&D Velocity Bonus</span>
                    </div>
                    <div className="font-mono font-bold text-emerald-700 text-right">
                      +{metricsB.rndSpeed}%
                    </div>
                  </div>

                  {/* Metric 4: Styling & Aesthetic Appeal */}
                  <div className="grid grid-cols-3 p-3 text-xs items-center bg-slate-50/50">
                    <div className="font-mono font-bold text-indigo-700 text-left">
                      +{metricsA.styling}%
                    </div>
                    <div className="text-center text-slate-500 font-bold uppercase text-[10px] font-mono flex items-center justify-center gap-1">
                      <Sparkles size={12} className="text-indigo-600" />
                      <span>Design Appeal Bonus</span>
                    </div>
                    <div className="font-mono font-bold text-indigo-700 text-right">
                      +{metricsB.styling}%
                    </div>
                  </div>

                  {/* Metric 5: Structural Rigidity / Safety */}
                  <div className="grid grid-cols-3 p-3 text-xs items-center">
                    <div className="font-mono font-bold text-cyan-700 text-left">
                      +{metricsA.safety || metricsA.quality}%
                    </div>
                    <div className="text-center text-slate-500 font-bold uppercase text-[10px] font-mono flex items-center justify-center gap-1">
                      <Shield size={12} className="text-cyan-600" />
                      <span>Safety & Reliability</span>
                    </div>
                    <div className="font-mono font-bold text-cyan-700 text-right">
                      +{metricsB.safety || metricsB.quality}%
                    </div>
                  </div>

                  {/* Metric 6: Sub-Departments count */}
                  <div className="grid grid-cols-3 p-3 text-xs items-center bg-slate-50/50">
                    <div className="font-mono font-bold text-slate-800 text-left">
                      {unitA.subDepartments.length} Departments
                    </div>
                    <div className="text-center text-slate-500 font-bold uppercase text-[10px] font-mono flex items-center justify-center gap-1">
                      <Layers size={12} className="text-slate-600" />
                      <span>Sub-Departments</span>
                    </div>
                    <div className="font-mono font-bold text-slate-800 text-right">
                      {unitB.subDepartments.length} Departments
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Perks Comparison */}
              <div className="grid grid-cols-2 gap-4">
                {/* Unit A Perks */}
                <div className="p-4 rounded-2xl bg-white border border-[#dad4c5]">
                  <h5 className="text-xs font-bold text-slate-800 font-mono mb-2">
                    {unitA.shortName} Core Perks:
                  </h5>
                  <div className="space-y-1.5">
                    {unitA.corePerks.map((perk, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2"
                      >
                        <CheckCircle2 size={13} className="text-cyan-600 shrink-0" />
                        <span className="text-slate-800">{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Unit B Perks */}
                <div className="p-4 rounded-2xl bg-white border border-[#dad4c5]">
                  <h5 className="text-xs font-bold text-slate-800 font-mono mb-2">
                    {unitB.shortName} Core Perks:
                  </h5>
                  <div className="space-y-1.5">
                    {unitB.corePerks.map((perk, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2"
                      >
                        <CheckCircle2 size={13} className="text-indigo-600 shrink-0" />
                        <span className="text-slate-800">{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#dad4c5] bg-white/70 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Phase 196 • Comparative Analysis Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold transition-all shadow-xs"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
