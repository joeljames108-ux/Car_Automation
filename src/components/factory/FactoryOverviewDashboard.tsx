import React from "react";
import {
  Factory,
  Wrench,
  Boxes,
  DollarSign,
  TrendingUp,
  Cpu,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Users,
  ShieldAlert,
  Calendar,
  Layers,
  ArrowUpRight,
  Activity,
  Play,
  Pause,
  XCircle,
} from "lucide-react";
import { useFactoryStore } from "../../state/factoryStore";
import { useCampusStore } from "../../state/campusStore";
import { useCompanyFinanceStore } from "../../state/companyFinanceStore";
import { useTradeStore } from "../../state/tradeStore";
import { AssemblyLine, ProductionSlot } from "../../sim/factory/factoryTypes";
import { FactoryHeroCards } from "./FactoryHeroCards";

interface FactoryOverviewDashboardProps {
  onNavigateTab: (tab: "overview" | "lines" | "scheduler" | "materials" | "workforce" | "quality") => void;
  onOpenScheduleModal?: () => void;
}

export function FactoryOverviewDashboard({
  onNavigateTab,
  onOpenScheduleModal,
}: FactoryOverviewDashboardProps) {
  const {
    assemblyLines,
    factoryFloorSummary,
    pauseProductionSlot,
    resumeProductionSlot,
    cancelProductionSlot,
    performMaintenance,
  } = useFactoryStore();

  const { factoryState } = useCampusStore();
  const { cash } = useCompanyFinanceStore();
  const { warehouseInventory } = useTradeStore();

  // Extract all active or scheduled slots across all lines
  const allActiveJobs: { slot: ProductionSlot; line: AssemblyLine }[] = [];
  assemblyLines.forEach((line) => {
    (line.reservedSlots || []).forEach((slot) => {
      if (slot.status === "IN_PROGRESS" || slot.status === "PAUSED") {
        allActiveJobs.push({ slot, line });
      }
    });
  });

  const isOutsourced = factoryState.ownershipStatus === "no_factory_outsourced";

  return (
    <div className="space-y-6">
      {/* Top Banner / Ownership Status */}
      <div className="bg-gradient-to-r from-[#f6f4ee] via-[#eef3ec] to-[#edf4f9] border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-emerald-700/10 text-emerald-800 rounded-xl border border-emerald-600/20 shadow-inner">
              <Factory size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {factoryFloorSummary.factoryName}
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/60 uppercase">
                  {isOutsourced ? "Contract Partner Foundry" : `Owned Tier ${factoryFloorSummary.factoryLevel}`}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Physical assembly lines and real-time takt schedules. Production output is strictly governed by operating hours, line capability, tooling shift allocation, and continuous parts delivery.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => onNavigateTab("scheduler")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Calendar size={14} />
              Open Production Calendar
            </button>
            <button
              onClick={() => onNavigateTab("lines")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold shadow-sm transition-colors"
            >
              <Layers size={14} />
              Manage Lines ({assemblyLines.length})
            </button>
          </div>
        </div>
      </div>

      {/* 5 Factory Operational Sub-Studios (Hero Cards) */}
      <FactoryHeroCards onNavigateTab={onNavigateTab} />

      {/* 10 Core Telemetry KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Factory Level & Tier */}
        <div className="bg-[#fcfbf9] border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Facility Level</span>
            <Factory size={15} className="text-emerald-700" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            Tier {factoryFloorSummary.factoryLevel}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {isOutsourced ? "Outsourced Network" : "Permanent Owned Facility"}
          </div>
        </div>

        {/* KPI 2: Total Monthly Capacity */}
        <div className="bg-[#fcfbf9] border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Max Capacity</span>
            <TrendingUp size={15} className="text-blue-700" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {factoryFloorSummary.totalMonthlyCapacityUnits.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-500">units/mo</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {factoryFloorSummary.totalMonthlyOperatingHours} total working hrs
          </div>
        </div>

        {/* KPI 3: Capacity Used vs Free */}
        <div className="bg-[#fcfbf9] border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Load & Free</span>
            <Cpu size={15} className="text-indigo-700" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {factoryFloorSummary.usedMonthlyCapacityUnits.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-500">
              ({factoryFloorSummary.overallUtilizationPct}%)
            </span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            {factoryFloorSummary.availableMonthlyCapacityUnits.toLocaleString()} units free
          </div>
        </div>

        {/* KPI 4: Assembly Lines Breakdown */}
        <div className="bg-[#fcfbf9] border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Assembly Lines</span>
            <Layers size={15} className="text-slate-700" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {assemblyLines.length}{" "}
            <span className="text-xs font-normal text-slate-500">lines</span>
          </div>
          <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-700 font-semibold">{factoryFloorSummary.activeLinesCount} active</span>
            <span>•</span>
            <span className="text-slate-500">{factoryFloorSummary.idleLinesCount} idle</span>
          </div>
        </div>

        {/* KPI 5: Active Jobs in Production */}
        <div className="bg-[#fcfbf9] border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Active Batches</span>
            <Activity size={15} className="text-amber-700" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {factoryFloorSummary.activeJobsCount}{" "}
            <span className="text-xs font-normal text-slate-500">runs</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {factoryFloorSummary.totalUnitsInProduction.toLocaleString()} units in progress
          </div>
        </div>

        {/* KPI 6: Workforce Headcount & Health */}
        <div className="bg-[#fcfbf9] border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Floor Workers</span>
            <Users size={15} className="text-sky-700" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {factoryFloorSummary.totalFactoryWorkersAssigned}{" "}
            <span className="text-xs font-normal text-slate-500">staff</span>
          </div>
          <div className={`text-[11px] font-medium mt-1 ${factoryFloorSummary.staffingHealthPct >= 95 ? 'text-emerald-700' : 'text-amber-700'}`}>
            {factoryFloorSummary.staffingHealthPct}% staffing health
          </div>
        </div>

        {/* KPI 7: Material Availability */}
        <div className="bg-[#fcfbf9] border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Stockpile</span>
            <Boxes size={15} className="text-teal-700" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            Ready
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            Steel, alloy & components in stock
          </div>
        </div>

        {/* KPI 8: Monthly Operating Expenses */}
        <div className="bg-[#fcfbf9] border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Monthly Overhead</span>
            <DollarSign size={15} className="text-rose-700" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            ${Math.round(factoryFloorSummary.totalMonthlyCostUSD / 1000)}k
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Overhead + line tooling costs
          </div>
        </div>

        {/* KPI 9: Overall Floor Efficiency */}
        <div className="bg-[#fcfbf9] border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Efficiency</span>
            <Sparkles size={15} className="text-purple-700" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {Math.round(
              assemblyLines.reduce((acc, l) => acc + l.efficiencyPct, 0) /
                Math.max(1, assemblyLines.length)
            )}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Takt & automation compliance
          </div>
        </div>

        {/* KPI 10: Fleet Maintenance Status */}
        <div className="bg-[#fcfbf9] border border-slate-200/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Reliability</span>
            <Wrench size={15} className="text-amber-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {Math.round(
              100 -
                assemblyLines.reduce((acc, l) => acc + l.breakdownRiskPct, 0) /
                  Math.max(1, assemblyLines.length)
            )}%
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            All equipment certified
          </div>
        </div>
      </div>

      {/* Active Production Batches Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Active Assembly Runs</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live manufacturing jobs currently occupying assembly slots on the physical floor
            </p>
          </div>
          <button
            onClick={() => onNavigateTab("scheduler")}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
          >
            Full Schedule View <ArrowUpRight size={13} />
          </button>
        </div>

        {allActiveJobs.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-50/70 border border-dashed border-slate-200">
            <Factory size={32} className="mx-auto text-slate-400 mb-2" />
            <h4 className="text-sm font-semibold text-slate-800">No Batches Currently in Production</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Your assembly lines are currently idle and ready for new production allocation. Schedule a vehicle build from the production calendar or contracts page.
            </p>
            <button
              onClick={() => onNavigateTab("scheduler")}
              className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
            >
              <Calendar size={13} /> Schedule New Run
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500 font-medium border-b border-slate-200/60 pb-2">
                  <th className="py-2.5 font-semibold">Vehicle Model</th>
                  <th className="py-2.5 font-semibold">Assigned Line</th>
                  <th className="py-2.5 font-semibold">Progress</th>
                  <th className="py-2.5 font-semibold">Daily Rate</th>
                  <th className="py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allActiveJobs.map(({ slot, line }) => {
                  const progressPct = Math.round(
                    (slot.producedUnits / Math.max(1, slot.targetUnits)) * 100
                  );
                  return (
                    <tr key={slot.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="font-bold text-slate-900">{slot.vehicleModelName}</div>
                        <div className="text-[11px] text-slate-400">ID: {slot.id.slice(0, 12)}</div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="font-semibold text-slate-800">{line.name}</div>
                        <div className="text-[11px] text-slate-500">{line.type.replace("_", " ")}</div>
                      </td>
                      <td className="py-3 pr-4 min-w-[140px]">
                        <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                          <span>{slot.producedUnits.toLocaleString()} / {slot.targetUnits.toLocaleString()}</span>
                          <span className="font-semibold">{progressPct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-medium text-slate-800">
                        {slot.dailyRate} units/day
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            slot.status === "IN_PROGRESS"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {slot.status}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-1.5">
                        {slot.status === "IN_PROGRESS" ? (
                          <button
                            onClick={() => pauseProductionSlot(slot.id, "Paused by user")}
                            title="Pause production"
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Pause size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => resumeProductionSlot(slot.id)}
                            title="Resume production"
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Play size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => cancelProductionSlot(slot.id)}
                          title="Cancel run"
                          className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <XCircle size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assembly Lines Mini-Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-bold text-slate-900">Physical Assembly Lines Status</h3>
          <button
            onClick={() => onNavigateTab("lines")}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
          >
            Detailed Line Manager <ArrowUpRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {assemblyLines.map((line) => (
            <div
              key={line.id}
              className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                    {line.type.replace("_", " ")}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      line.status === "PRODUCING"
                        ? "bg-emerald-100 text-emerald-800"
                        : line.status === "MAINTENANCE"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {line.status}
                  </span>
                </div>
                <div className="font-bold text-sm text-slate-900 mt-2">{line.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {line.shiftsPerDay} Shift{line.shiftsPerDay > 1 ? "s" : ""} • {line.operatingDaysPerWeek} Days/Wk
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Monthly Output:</span>
                    <span className="font-semibold text-slate-800">{line.monthlyCapacityUnits.toLocaleString()} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cycle Time:</span>
                    <span className="font-semibold text-slate-800">{line.cycleTimeMinutes} min/unit</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilization:</span>
                    <span className="font-semibold text-slate-800">{line.utilizationPct}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Risk: <strong className={line.breakdownRiskPct > 20 ? "text-amber-700" : "text-slate-700"}>{line.breakdownRiskPct}%</strong>
                </span>
                <button
                  onClick={() => performMaintenance(line.id)}
                  disabled={line.status === "MAINTENANCE"}
                  className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors disabled:opacity-50"
                >
                  Maintenance
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
