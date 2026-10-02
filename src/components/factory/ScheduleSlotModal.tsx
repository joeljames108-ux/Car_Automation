import React, { useState, useMemo } from "react";
import {
  X,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Clock,
  Layers,
  Car,
} from "lucide-react";
import { useFactoryStore } from "../../state/factoryStore";
import { useSimulationClockStore } from "../../state/simulationClockStore";
import { useCompanyFinanceStore } from "../../state/companyFinanceStore";
import {
  calculateCompletionDate,
  validateAndCreateSlot,
} from "../../sim/factory/factorySchedulerEngine";
import { computeLineCapacity } from "../../sim/factory/factoryCapacityEngine";

interface ScheduleSlotModalProps {
  onClose: () => void;
  preselectedLineId?: string;
}

export function ScheduleSlotModal({ onClose, preselectedLineId }: ScheduleSlotModalProps) {
  const { assemblyLines, reserveProductionSlot } = useFactoryStore();
  const { year, month, day } = useSimulationClockStore();
  const { cash } = useCompanyFinanceStore();

  const todayStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const [selectedLineId, setSelectedLineId] = useState<string>(
    preselectedLineId || assemblyLines[0]?.id || ""
  );
  const [vehicleModelName, setVehicleModelName] = useState("Vanguard GT Coupé");
  const [targetUnits, setTargetUnits] = useState<number>(250);
  const [startDateStr, setStartDateStr] = useState<string>(todayStr);
  const [unitBOMCost, setUnitBOMCost] = useState<number>(1450);
  const [unitLaborCost, setUnitLaborCost] = useState<number>(450);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedLine = useMemo(() => {
    return assemblyLines.find((l) => l.id === selectedLineId) || assemblyLines[0];
  }, [assemblyLines, selectedLineId]);

  // Projected metrics
  const projection = useMemo(() => {
    if (!selectedLine) return null;
    const cap = computeLineCapacity(selectedLine);
    const dailyRate = Math.max(1, cap.dailyCapacity);
    const daysRequired = Math.ceil(targetUnits / dailyRate);
    const endDate = calculateCompletionDate(
      startDateStr,
      daysRequired,
      selectedLine.operatingDaysPerWeek
    );
    const totalCost = (unitBOMCost + unitLaborCost) * targetUnits;

    return {
      dailyRate,
      daysRequired,
      endDate,
      totalCost,
      canAfford: cash >= totalCost,
    };
  }, [selectedLine, targetUnits, startDateStr, unitBOMCost, unitLaborCost, cash]);

  const handleConfirm = () => {
    if (!selectedLine || !projection) return;
    setErrorMessage(null);

    // Validate using scheduler engine
    const validation = validateAndCreateSlot(selectedLine, {
      lineId: selectedLine.id,
      vehicleModelId: `model_${Date.now()}`,
      vehicleModelName,
      startDateStr,
      targetUnits,
      unitBOMCostUSD: unitBOMCost,
      unitLaborCostUSD: unitLaborCost,
    });

    if (!validation.success) {
      setErrorMessage(validation.conflictReason || "Schedule conflict detected");
      return;
    }

    if (validation.slot) {
      reserveProductionSlot(selectedLine.id, {
        vehicleModelId: validation.slot.vehicleModelId,
        vehicleModelName: validation.slot.vehicleModelName,
        startDate: validation.slot.startDate,
        endDate: validation.slot.endDate,
        totalProductionDays: validation.slot.totalProductionDays,
        targetUnits: validation.slot.targetUnits,
        dailyRate: validation.slot.dailyRate,
        unitCycleTimeMinutes: validation.slot.unitCycleTimeMinutes,
        unitBOMCostUSD: validation.slot.unitBOMCostUSD,
        unitLaborCostUSD: validation.slot.unitLaborCostUSD,
        totalCostUSD: validation.slot.totalCostUSD,
        priority: 2,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Schedule Production Batch</h3>
              <div className="text-xs text-slate-500">Allocate assembly line capacity & takt time</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>

        {errorMessage ? (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertTriangle size={15} className="mt-0.5 shrink-0 text-rose-600" />
            <div>
              <div className="font-semibold">Scheduling Error</div>
              <div>{errorMessage}</div>
            </div>
          </div>
        ) : null}

        <div className="space-y-4 py-4 text-xs">
          {/* Vehicle Model Name */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Vehicle Model Name</label>
            <input
              type="text"
              value={vehicleModelName}
              onChange={(e) => setVehicleModelName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none"
            />
          </div>

          {/* Assembly Line Selector */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Target Assembly Line</label>
            <select
              value={selectedLineId}
              onChange={(e) => setSelectedLineId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none"
            >
              {assemblyLines.map((line) => (
                <option key={line.id} value={line.id}>
                  {line.name} ({line.type.replace("_", " ")}) — Rate: {line.dailyCapacityUnits}/day • Util: {line.utilizationPct}%
                </option>
              ))}
            </select>
          </div>

          {/* Target Units & Start Date Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Target Quantity</label>
              <input
                type="number"
                min={10}
                max={50000}
                step={10}
                value={targetUnits}
                onChange={(e) => setTargetUnits(parseInt(e.target.value) || 10)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Production Start Date</label>
              <input
                type="date"
                value={startDateStr}
                onChange={(e) => setStartDateStr(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Unit Cost Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Unit BOM Materials ($)</label>
              <input
                type="number"
                min={100}
                value={unitBOMCost}
                onChange={(e) => setUnitBOMCost(parseInt(e.target.value) || 500)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Unit Labor ($)</label>
              <input
                type="number"
                min={50}
                value={unitLaborCost}
                onChange={(e) => setUnitLaborCost(parseInt(e.target.value) || 200)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Live Projection Card */}
          {projection ? (
            <div className="bg-[#fcfbf9] border border-slate-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between items-center text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock size={13} className="text-slate-500" /> Projected Completion:
                </span>
                <span className="font-bold text-slate-900">{projection.endDate} ({projection.daysRequired} days)</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <TrendingUp size={13} className="text-slate-500" /> Line Output Rate:
                </span>
                <span className="font-bold text-slate-900">{projection.dailyRate} units / operational day</span>
              </div>
              <div className="flex justify-between items-center text-slate-700 pt-2 border-t border-slate-200/60">
                <span className="flex items-center gap-1.5 font-medium">
                  <DollarSign size={13} className="text-slate-500" /> Total Capital Cost:
                </span>
                <span className="font-bold text-slate-900">
                  ${projection.totalCost.toLocaleString()}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle2 size={14} /> Confirm Reservation
          </button>
        </div>
      </div>
    </div>
  );
}
