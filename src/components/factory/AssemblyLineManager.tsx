import React, { useState } from "react";
import {
  Layers,
  Plus,
  Wrench,
  Clock,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  Cpu,
  Users,
} from "lucide-react";
import { useFactoryStore } from "../../state/factoryStore";
import { AssemblyLine, LineType } from "../../sim/factory/factoryTypes";
import { AssemblyLineDetailPanel } from "./AssemblyLineDetailPanel";
import { AddAssemblyLineModal } from "./AddAssemblyLineModal";

export function AssemblyLineManager() {
  const {
    assemblyLines,
    activeFilterType,
    setActiveFilterType,
    performMaintenance,
  } = useFactoryStore();

  const [selectedLine, setSelectedLine] = useState<AssemblyLine | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredLines = assemblyLines.filter((line) => {
    if (activeFilterType === "ALL") return true;
    return line.type === activeFilterType;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Assembly Lines & Tooling</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure shifts, cycle takt times, preventive maintenance, and plant robotics
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus size={14} /> Commission New Line
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200/70 text-xs">
        {[
          { id: "ALL", label: "All Lines" },
          { id: "BODY_WELDING", label: "Body Framing" },
          { id: "PAINT", label: "Paint Booths" },
          { id: "FINAL_ASSEMBLY", label: "Final Assembly" },
          { id: "QUALITY_INSPECTION", label: "Quality Gates" },
          { id: "FLEXIBLE", label: "Flexible Cells" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilterType(tab.id as "ALL" | LineType)}
            className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeFilterType === tab.id
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Lines */}
      {filteredLines.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-dashed border-slate-200">
          <Layers size={32} className="mx-auto text-slate-400 mb-2" />
          <h4 className="text-sm font-semibold text-slate-800">No Assembly Lines in this Category</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Expand your manufacturing operations by commissioning an assembly line for this specialization.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
          >
            <Plus size={13} /> Commission Line
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLines.map((line) => {
            const isProducing = line.status === "PRODUCING";
            const isMaintenance = line.status === "MAINTENANCE";
            const activeSlot = (line.reservedSlots || []).find((s) => s.status === "IN_PROGRESS");

            return (
              <div
                key={line.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top line badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                        {line.type.replace("_", " ")}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60">
                        Tier {line.level}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isProducing
                          ? "bg-emerald-100 text-emerald-800"
                          : isMaintenance
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isProducing ? "bg-emerald-600 animate-pulse" : isMaintenance ? "bg-amber-600" : "bg-slate-400"
                        }`}
                      />
                      {line.status}
                    </span>
                  </div>

                  {/* Title & Schedule */}
                  <h3 className="text-base font-bold text-slate-900 mt-2.5">{line.name}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {line.shiftsPerDay} Shift{line.shiftsPerDay > 1 ? "s" : ""} ({line.shiftsPerDay * 8}h/day) • {line.operatingDaysPerWeek} Days/Week
                  </div>

                  {/* Active Job Box (if producing) */}
                  {activeSlot ? (
                    <div className="mt-3.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-xs">
                      <div className="flex justify-between items-center text-emerald-900 font-semibold mb-1">
                        <span>Active: {activeSlot.vehicleModelName}</span>
                        <span>{Math.round((activeSlot.producedUnits / Math.max(1, activeSlot.targetUnits)) * 100)}%</span>
                      </div>
                      <div className="w-full bg-emerald-200/60 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{
                            width: `${Math.round((activeSlot.producedUnits / Math.max(1, activeSlot.targetUnits)) * 100)}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-emerald-700/80 mt-1">
                        <span>{activeSlot.producedUnits} / {activeSlot.targetUnits} units</span>
                        <span>{activeSlot.dailyRate} units/day</span>
                      </div>
                    </div>
                  ) : null}

                  {/* Specs & Metrics Grid */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#fcfbf9] p-2.5 rounded-xl border border-slate-200/60">
                      <div className="text-[10px] text-slate-500 font-medium">Monthly Output</div>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {line.monthlyCapacityUnits.toLocaleString()}{" "}
                        <span className="text-[10px] font-normal text-slate-500">units</span>
                      </div>
                    </div>
                    <div className="bg-[#fcfbf9] p-2.5 rounded-xl border border-slate-200/60">
                      <div className="text-[10px] text-slate-500 font-medium">Cycle Takt Time</div>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {line.cycleTimeMinutes}{" "}
                        <span className="text-[10px] font-normal text-slate-500">min/car</span>
                      </div>
                    </div>
                    <div className="bg-[#fcfbf9] p-2.5 rounded-xl border border-slate-200/60">
                      <div className="text-[10px] text-slate-500 font-medium">Line Utilization</div>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {line.utilizationPct}%
                      </div>
                    </div>
                    <div className="bg-[#fcfbf9] p-2.5 rounded-xl border border-slate-200/60">
                      <div className="text-[10px] text-slate-500 font-medium">Breakdown Risk</div>
                      <div className={`font-bold mt-0.5 ${line.breakdownRiskPct > 20 ? "text-amber-700" : "text-emerald-700"}`}>
                        {line.breakdownRiskPct}%
                      </div>
                    </div>
                  </div>

                  {/* Workforce Staffing line */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600 px-1">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Users size={13} /> Assigned Workers:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {line.assignedWorkersCount} / {line.minWorkersRequired} min
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => performMaintenance(line.id)}
                    disabled={isMaintenance}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 disabled:opacity-40 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Wrench size={13} />
                    {isMaintenance ? "In Maintenance" : "Overhaul"}
                  </button>

                  <button
                    onClick={() => setSelectedLine(line)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1"
                  >
                    Configure <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-out configuration drawer */}
      {selectedLine ? (
        <AssemblyLineDetailPanel
          line={selectedLine}
          onClose={() => setSelectedLine(null)}
        />
      ) : null}

      {/* Add Assembly Line Modal */}
      {isAddModalOpen ? (
        <AddAssemblyLineModal onClose={() => setIsAddModalOpen(false)} />
      ) : null}
    </div>
  );
}
