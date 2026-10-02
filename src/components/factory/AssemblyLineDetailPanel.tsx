import React, { useState } from "react";
import {
  X,
  Wrench,
  TrendingUp,
  Layers,
  Clock,
  Users,
  ShieldCheck,
  AlertTriangle,
  ArrowUpCircle,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { AssemblyLine } from "../../sim/factory/factoryTypes";
import { useFactoryStore } from "../../state/factoryStore";
import { useCompanyFinanceStore } from "../../state/companyFinanceStore";

interface AssemblyLineDetailPanelProps {
  line: AssemblyLine;
  onClose: () => void;
}

export function AssemblyLineDetailPanel({ line, onClose }: AssemblyLineDetailPanelProps) {
  const { updateAssemblyLineConfig, upgradeAssemblyLine, performMaintenance } = useFactoryStore();
  const { cash } = useCompanyFinanceStore();

  const [shifts, setShifts] = useState<1 | 2 | 3>(line.shiftsPerDay);
  const [operatingDays, setOperatingDays] = useState<5 | 6 | 7>(line.operatingDaysPerWeek);
  const [cycleTime, setCycleTime] = useState<number>(line.cycleTimeMinutes);
  const [assignedWorkers, setAssignedWorkers] = useState<number>(line.assignedWorkersCount);
  const [isSaved, setIsSaved] = useState(false);

  const canAffordUpgrade = cash >= line.upgradeCostUSD && line.level < 5;

  const handleSaveConfig = () => {
    updateAssemblyLineConfig(line.id, {
      shiftsPerDay: shifts,
      operatingDaysPerWeek: operatingDays,
      cycleTimeMinutes: Math.max(1, cycleTime),
      assignedWorkersCount: Math.max(1, assignedWorkers),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-200">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {line.type.replace("_", " ")}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{line.name}</h3>
              <div className="text-xs text-slate-500">Tier {line.level} Assembly Facility</div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Status & Health Box */}
          <div className="grid grid-cols-2 gap-3 bg-[#fcfbf9] border border-slate-200/80 rounded-xl p-3.5">
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Current Status</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    line.status === "PRODUCING"
                      ? "bg-emerald-500"
                      : line.status === "MAINTENANCE"
                      ? "bg-amber-500"
                      : "bg-slate-400"
                  }`}
                />
                {line.status}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Breakdown Risk</div>
              <div className={`text-sm font-bold mt-0.5 ${line.breakdownRiskPct > 20 ? "text-amber-700" : "text-emerald-700"}`}>
                {line.breakdownRiskPct}% Probability
              </div>
            </div>
          </div>

          {/* Shift & Time Configuration Form */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Shift & Operating Parameters
            </h4>

            {/* Shifts per day */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Shifts Per Day ({shifts * 8} Operating Hours/Day)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setShifts(val as 1 | 2 | 3)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      shifts === val
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {val} Shift{val > 1 ? "s" : ""} ({val * 8}h)
                  </button>
                ))}
              </div>
            </div>

            {/* Operating days per week */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Operating Days Per Week
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 6, 7].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setOperatingDays(val as 5 | 6 | 7)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      operatingDays === val
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {val} Days / Wk
                  </button>
                ))}
              </div>
            </div>

            {/* Cycle Time Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Target Cycle Time (Minutes per Unit)
                </label>
                <span className="text-xs font-bold text-slate-900">{cycleTime} min</span>
              </div>
              <input
                type="range"
                min={3}
                max={60}
                value={cycleTime}
                onChange={(e) => setCycleTime(parseInt(e.target.value) || 10)}
                className="w-full accent-slate-900"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>3 min (High-Speed Automated)</span>
                <span>60 min (Coachbuilt)</span>
              </div>
            </div>

            {/* Workers Assigned */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Dedicated Assembly Workforce
                </label>
                <span className="text-xs font-bold text-slate-900">{assignedWorkers} workers</span>
              </div>
              <input
                type="range"
                min={line.minWorkersRequired}
                max={line.minWorkersRequired * 3}
                value={assignedWorkers}
                onChange={(e) => setAssignedWorkers(parseInt(e.target.value) || 20)}
                className="w-full accent-slate-900"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>Min: {line.minWorkersRequired} staff</span>
                <span>Max: {line.minWorkersRequired * 3} staff</span>
              </div>
            </div>

            <button
              onClick={handleSaveConfig}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              {isSaved ? <CheckCircle2 size={14} className="text-emerald-400" /> : null}
              {isSaved ? "Configuration Updated!" : "Save Shift Configuration"}
            </button>
          </div>

          {/* Upgrades & Maintenance Section */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Tooling Upgrades & Reliability
            </h4>

            {/* Upgrade Card */}
            <div className="bg-[#fcfbf9] border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ArrowUpCircle size={15} className="text-purple-700" />
                  Upgrade to Tier {line.level + 1}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Increases speed +18%, efficiency +4%, and reduces cycle time
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-1">
                  Cost: ${line.upgradeCostUSD.toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => upgradeAssemblyLine(line.id)}
                disabled={!canAffordUpgrade}
                className="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white text-xs font-semibold transition-colors"
              >
                Upgrade
              </button>
            </div>

            {/* Preventive Maintenance Card */}
            <div className="bg-[#fcfbf9] border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Wrench size={15} className="text-amber-700" />
                  Preventive Maintenance Overhaul
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Takes line offline for 2 days, resets breakdown risk to 2%
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-1">
                  Cost: ${Math.round(line.monthlyOperatingCostUSD * 0.15).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => performMaintenance(line.id)}
                disabled={line.status === "MAINTENANCE"}
                className="px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:opacity-40 text-white text-xs font-semibold transition-colors"
              >
                Overhaul
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
