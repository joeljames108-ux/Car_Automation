import React, { useState } from "react";
import { X, Plus, Layers, DollarSign, Clock, Users, CheckCircle2 } from "lucide-react";
import { LineType } from "../../sim/factory/factoryTypes";
import { useFactoryStore } from "../../state/factoryStore";
import { useCompanyFinanceStore } from "../../state/companyFinanceStore";

interface AddAssemblyLineModalProps {
  onClose: () => void;
}

export function AddAssemblyLineModal({ onClose }: AddAssemblyLineModalProps) {
  const { addAssemblyLine } = useFactoryStore();
  const { cash, recordTransaction } = useCompanyFinanceStore();

  const [lineType, setLineType] = useState<LineType>("FINAL_ASSEMBLY");
  const [lineName, setLineName] = useState("Final Assembly Line 2");
  const [shifts, setShifts] = useState<1 | 2 | 3>(2);
  const [daysPerWeek, setDaysPerWeek] = useState<5 | 6 | 7>(5);
  const [cycleTime, setCycleTime] = useState<number>(18);
  const [workers, setWorkers] = useState<number>(40);

  // Capital Commissioning Cost calculation
  const baseCost = lineType === "BODY_WELDING"
    ? 380000
    : lineType === "PAINT"
    ? 450000
    : lineType === "FINAL_ASSEMBLY"
    ? 420000
    : lineType === "QUALITY_INSPECTION"
    ? 220000
    : 300000;

  const totalInstallationCost = baseCost;
  const canAfford = cash >= totalInstallationCost;

  const handleCommission = () => {
    if (!canAfford) return;

    recordTransaction(
      1,
      1970,
      "TOOLING",
      totalInstallationCost,
      `Commission New Assembly Line: ${lineName} (${lineType.replace("_", " ")})`
    );
    useCompanyFinanceStore.setState((s) => ({ cash: s.cash - totalInstallationCost }));

    addAssemblyLine({
      name: lineName,
      type: lineType,
      level: 1,
      status: "IDLE",
      operatingHoursPerDay: 8,
      shiftsPerDay: shifts,
      operatingDaysPerWeek: daysPerWeek,
      efficiencyPct: 80,
      cycleTimeMinutes: cycleTime,
      maxVehicleWeightKg: 3000,
      supportedPlatforms: ["monocoque_sedan", "tubular_gt", "unibody_suv"],
      changeoverTimeDays: 2,
      lastMaintenanceDate: "1970-01-01",
      nextScheduledMaintenance: "1970-04-01",
      maintenanceIntervalDays: 90,
      breakdownRiskPct: 2,
      assignedWorkersCount: workers,
      minWorkersRequired: Math.round(workers * 0.75),
      monthlyOperatingCostUSD: Math.round(totalInstallationCost * 0.12),
      upgradeCostUSD: Math.round(totalInstallationCost * 0.8),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Commission Assembly Line</h3>
              <div className="text-xs text-slate-500">Expand manufacturing plant footprint</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 py-4 text-xs">
          {/* Line Type */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">Line Specialty Type</label>
            <select
              value={lineType}
              onChange={(e) => {
                const nextType = e.target.value as LineType;
                setLineType(nextType);
                if (nextType === "BODY_WELDING") setLineName("Body Framing Line 2");
                else if (nextType === "PAINT") setLineName("Cleanroom Paint Booth 2");
                else if (nextType === "FINAL_ASSEMBLY") setLineName("Final Assembly Line 2");
                else if (nextType === "QUALITY_INSPECTION") setLineName("Quality & Dyno Gate 2");
                else setLineName("Flexible Agility Cell 2");
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="BODY_WELDING">Body Welding & Structural Framing</option>
              <option value="PAINT">Cleanroom Primer & Clearcoat Booth</option>
              <option value="FINAL_ASSEMBLY">Final Powertrain & Interior Assembly</option>
              <option value="QUALITY_INSPECTION">Quality Dynamometer & Water Test Gate</option>
              <option value="FLEXIBLE">Flexible Multi-Stage Batch Cell</option>
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Line Name</label>
            <input
              type="text"
              value={lineName}
              onChange={(e) => setLineName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none"
            />
          </div>

          {/* Shifts & Days */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Operating Shifts</label>
              <select
                value={shifts}
                onChange={(e) => setShifts(parseInt(e.target.value) as 1 | 2 | 3)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              >
                <option value={1}>1 Shift (8h/day)</option>
                <option value={2}>2 Shifts (16h/day)</option>
                <option value={3}>3 Shifts (24h continuous)</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Days Per Week</label>
              <select
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(parseInt(e.target.value) as 5 | 6 | 7)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              >
                <option value={5}>5 Days / Week</option>
                <option value={6}>6 Days / Week</option>
                <option value={7}>7 Days / Week</option>
              </select>
            </div>
          </div>

          {/* Cost Summary Box */}
          <div className="bg-[#fcfbf9] border border-slate-200/80 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Capital Installation Fee:</span>
              <span className="font-bold text-slate-900">${totalInstallationCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Treasury Cash Available:</span>
              <span className={`font-semibold ${canAfford ? "text-emerald-700" : "text-rose-700"}`}>
                ${Math.round(cash).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCommission}
            disabled={!canAfford}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={14} /> Commission Line
          </button>
        </div>
      </div>
    </div>
  );
}
