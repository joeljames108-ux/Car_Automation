import React, { useState, useMemo } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Play,
  Pause,
  XCircle,
  Clock,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useFactoryStore } from "../../state/factoryStore";
import { useSimulationClockStore } from "../../state/simulationClockStore";
import { generateMonthlyGanttView } from "../../sim/factory/factorySchedulerEngine";
import { ScheduleSlotModal } from "./ScheduleSlotModal";
import { ProductionSlot } from "../../sim/factory/factoryTypes";

export function ProductionScheduler() {
  const {
    assemblyLines,
    pauseProductionSlot,
    resumeProductionSlot,
    cancelProductionSlot,
  } = useFactoryStore();

  const { year: simYear, month: simMonth, day: simDay } = useSimulationClockStore();

  const [viewYear, setViewYear] = useState<number>(simYear || 1970);
  const [viewMonth, setViewMonth] = useState<number>(simMonth || 1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ProductionSlot | null>(null);

  // Generate monthly Gantt matrix
  const gantt = useMemo(() => {
    return generateMonthlyGanttView(assemblyLines, viewYear, viewMonth);
  }, [assemblyLines, viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleJumpToCurrent = () => {
    setViewYear(simYear || 1970);
    setViewMonth(simMonth || 1);
  };

  // Aggregate all slots across lines
  const allSlots: { slot: ProductionSlot; lineName: string }[] = [];
  assemblyLines.forEach((l) => {
    (l.reservedSlots || []).forEach((s) => {
      allSlots.push({ slot: s, lineName: l.name });
    });
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Calendar Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Production Scheduler</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visual takt calendar. Every assembly line has finite hours and physical time slots.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Month Stepper */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-xs font-bold text-slate-900 min-w-[130px] text-center">
              {gantt.monthName} {viewYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={handleJumpToCurrent}
            className="px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            Today
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus size={14} /> Schedule Run
          </button>
        </div>
      </div>

      {/* Gantt Calendar View */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs select-none">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500">
                <th className="p-3 text-left font-semibold sticky left-0 bg-slate-50/95 z-20 min-w-[200px] border-r border-slate-200">
                  Assembly Line
                </th>
                {Array.from({ length: gantt.daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const isCurrentDay =
                    viewYear === simYear && viewMonth === simMonth && dayNum === simDay;
                  return (
                    <th
                      key={dayNum}
                      className={`p-2 text-center font-semibold min-w-[34px] border-r border-slate-100 text-[11px] ${
                        isCurrentDay ? "bg-emerald-100/70 text-emerald-900 font-bold" : ""
                      }`}
                    >
                      {dayNum}
                    </th>
                  );
                })}
                <th className="p-3 text-right font-semibold min-w-[100px]">Util / Cap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gantt.rows.map((row) => (
                <tr key={row.lineId} className="hover:bg-slate-50/50 transition-colors">
                  {/* Line Header Column (Sticky) */}
                  <td className="p-3 text-left font-semibold sticky left-0 bg-white z-10 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    <div className="text-slate-900 font-bold text-xs">{row.lineName}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-medium mt-0.5">
                      {row.lineType.replace("_", " ")}
                    </div>
                  </td>

                  {/* Day Cells with Visual Gantt Slot Blocks */}
                  {row.days.map((dayCell) => {
                    const hasActiveSlot = dayCell.slots.length > 0;
                    const slotData = dayCell.slots[0];
                    const isCurrentDay =
                      viewYear === simYear && viewMonth === simMonth && dayCell.dayNumber === simDay;

                    return (
                      <td
                        key={dayCell.dayNumber}
                        className={`p-0 relative text-center border-r border-slate-100 h-14 ${
                          !dayCell.isOperatingDay ? "bg-slate-100/40" : ""
                        } ${isCurrentDay ? "ring-1 ring-emerald-500/40" : ""}`}
                      >
                        {hasActiveSlot && slotData ? (
                          <div
                            title={`${slotData.vehicleModelName} (${slotData.status})`}
                            className={`absolute inset-y-2 inset-x-0.5 rounded-lg flex items-center justify-center text-[10px] font-semibold text-white shadow-sm overflow-hidden transition-all ${
                              slotData.status === "IN_PROGRESS"
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : slotData.status === "PAUSED"
                                ? "bg-amber-600 hover:bg-amber-700"
                                : "bg-indigo-600 hover:bg-indigo-700"
                            }`}
                          >
                            {slotData.isStart ? (
                              <span className="truncate px-1.5">{slotData.vehicleModelName}</span>
                            ) : null}
                          </div>
                        ) : null}
                      </td>
                    );
                  })}

                  {/* Monthly Output & Utilization */}
                  <td className="p-3 text-right">
                    <div className="text-xs font-bold text-slate-900">{row.utilizationPct}%</div>
                    <div className="text-[10px] text-slate-500">
                      {row.scheduledUnitsThisMonth} / {row.monthlyCapacityUnits} u
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend & Help Notes */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 px-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-600 inline-block shadow-sm" />
            <span>In Production</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-indigo-600 inline-block shadow-sm" />
            <span>Scheduled Batch</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-600 inline-block shadow-sm" />
            <span>Paused</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-300 inline-block" />
            <span>Non-Operating Day (Weekend)</span>
          </div>
        </div>

        <div className="text-slate-400">
          * Drag and drop slot reallocation available in active calendar mode
        </div>
      </div>

      {/* Master List of Scheduled & Active Slots */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">All Reserved Production Slots</h3>

        {allSlots.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-50/70 border border-dashed border-slate-200">
            <Calendar size={28} className="mx-auto text-slate-400 mb-2" />
            <div className="text-xs text-slate-500">No production slots currently scheduled on any line.</div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 font-semibold border-b border-slate-200/60 pb-2">
                  <th className="py-2.5">Vehicle Model</th>
                  <th className="py-2.5">Assembly Line</th>
                  <th className="py-2.5">Schedule Dates</th>
                  <th className="py-2.5">Quota Units</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allSlots.map(({ slot, lineName }) => (
                  <tr key={slot.id} className="hover:bg-slate-50/60">
                    <td className="py-3 pr-4 font-bold text-slate-900">{slot.vehicleModelName}</td>
                    <td className="py-3 pr-4 text-slate-700">{lineName}</td>
                    <td className="py-3 pr-4 text-slate-600 font-mono text-[11px]">
                      {slot.startDate} → {slot.endDate} ({slot.totalProductionDays}d)
                    </td>
                    <td className="py-3 pr-4 font-semibold text-slate-800">
                      {slot.producedUnits} / {slot.targetUnits}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          slot.status === "IN_PROGRESS"
                            ? "bg-emerald-100 text-emerald-800"
                            : slot.status === "PAUSED"
                            ? "bg-amber-100 text-amber-800"
                            : slot.status === "COMPLETED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {slot.status}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-1">
                      {slot.status === "IN_PROGRESS" ? (
                        <button
                          onClick={() => pauseProductionSlot(slot.id, "Paused via schedule")}
                          className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Pause"
                        >
                          <Pause size={14} />
                        </button>
                      ) : slot.status === "PAUSED" ? (
                        <button
                          onClick={() => resumeProductionSlot(slot.id)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Resume"
                        >
                          <Play size={14} />
                        </button>
                      ) : null}
                      <button
                        onClick={() => cancelProductionSlot(slot.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Cancel"
                      >
                        <XCircle size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Slot Modal */}
      {isModalOpen ? <ScheduleSlotModal onClose={() => setIsModalOpen(false)} /> : null}
    </div>
  );
}
