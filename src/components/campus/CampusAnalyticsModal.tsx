import React, { useState } from "react";
import {
  X,
  DollarSign,
  TrendingUp,
  BarChart3,
  Users,
  Building2,
  PieChart,
  Calendar,
  Award,
  Factory,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Shield,
  Zap,
  Clock,
  Wrench,
  Crown,
  Landmark,
  Trees,
  History,
  Train,
  Truck,
} from "lucide-react";
import { useCampusStore } from "../../state/campusStore";
import { useSimulationClockStore } from "../../state/simulationClockStore";
import { useCompanyFinanceStore } from "../../state/companyFinanceStore";
import { useReputationStore } from "../../state/reputationStore";
import { FactoryProgressionEngine } from "../../sim/campus/factoryProgressionEngine";
import { CAMPUS_PLOTS } from "../../sim/campus/campusPlotCoordinates";
import { calculateCampusBonuses } from "../../sim/campus/campusBonusEngine";
import {
  BEAUTIFICATION_ASSET_REGISTRY,
  BEAUTIFICATION_TIER_CONFIG,
} from "../../sim/campus/campusBeautificationEngine";
import {
  RAILWAY_LEVEL_SPECS,
  SPECIALIZED_SIDINGS,
  NETWORK_CONNECTIONS,
} from "../../sim/campus/railwayTerminalEngine";

interface CampusAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "budget" | "statistics" | "workforce" | "beautification" | "railway";
}

export const CampusAnalyticsModal: React.FC<CampusAnalyticsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = "budget",
}) => {
  const [activeTab, setActiveTab] = useState<"budget" | "statistics" | "workforce" | "beautification" | "railway">(defaultTab);

  const {
    units,
    factoryState,
    getTelemetrySummary,
    constructionJobs,
    selectUnit,
    beautificationState,
    railwayTerminalState,
    getRailwayDailyDispatch,
    getRailwayEconomics,
  } = useCampusStore();

  const { overallReputation, dimensions } = useReputationStore();
  const { cash } = useCompanyFinanceStore();
  const { year, month } = useSimulationClockStore();
  const telemetry = getTelemetrySummary();
  const factoryEcon = FactoryProgressionEngine.getEconomicsSummary(factoryState);
  const bonuses = calculateCampusBonuses(units);
  const railDispatch = getRailwayDailyDispatch();
  const railEcon = getRailwayEconomics();

  if (!isOpen) return null;

  // Budget calculations
  const totalMaintenance = Object.values(units).reduce(
    (acc, u) => acc + (u.status !== "locked" ? u.monthlyMaintenanceCost : 0),
    0
  );
  const totalStaff = telemetry.totalCurrentStaff;
  const estimatedPayroll = totalStaff * 4500; // ~$4.5k per engineer monthly
  const monthlyConstructionDraw = factoryState.ownershipStatus === "under_construction" ? 1750000 : 0;
  const totalMonthlyBurn = totalMaintenance + estimatedPayroll + monthlyConstructionDraw;

  // Prestige score
  const avgLevel = Object.values(units).reduce((acc, u) => acc + u.level, 0) / 14;
  const prestigeScore = Math.min(100, Math.round((avgLevel / 7) * 70 + (totalStaff / telemetry.totalStaffCapacity) * 30));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#f8f6f0] border border-[#dad4c5] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-900 font-sans">
        {/* Header */}
        <div className="p-4 border-b border-[#dad4c5] bg-[#f1eee4]/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-800 font-bold">
              <BarChart3 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-900 font-mono tracking-wider">
                  CAMPUS FINANCIAL & ANALYTICS INTELLIGENCE
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-300">
                  {year} Q{Math.ceil(month / 3)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Resource Allocation, Operating Expenses & Expansion Analytics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-black/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#dad4c5] bg-[#ece7da]/70 px-4 pt-1 font-mono text-xs overflow-x-auto">
          {[
            { id: "budget", label: "Budget & Cash Flow (P193)", icon: DollarSign },
            { id: "statistics", label: "Campus Metrics (P197)", icon: TrendingUp },
            { id: "workforce", label: "Workforce Allocation (P194)", icon: Users },
            { id: "beautification", label: "Prestige & Beautification", icon: Sparkles },
            { id: "railway", label: "Rail Logistics (P200)", icon: Train },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 py-2.5 px-4 border-b-2 font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "border-cyan-700 text-cyan-900 bg-white/70 rounded-t-xl shadow-xs"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/30"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 1: BUDGET & CASH FLOW (Phase 193)                          */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === "budget" && (
            <div className="space-y-4">
              {/* Financial Snapshot Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Available Liquid Capital</span>
                  <span className="text-lg font-mono font-bold text-emerald-700 block">
                    ${(cash / 1e6).toFixed(2)}M
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">Sim Treasury</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Total Monthly Facility Burn</span>
                  <span className="text-lg font-mono font-bold text-rose-700 block">
                    -${(totalMonthlyBurn / 1e3).toFixed(0)}k/mo
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">Maintenance + Payroll + Civil</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Runway at Current Burn</span>
                  <span className="text-lg font-mono font-bold text-cyan-800 block">
                    {totalMonthlyBurn > 0 ? Math.floor(cash / totalMonthlyBurn) : "∞"} Months
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">Operating Sustainability</span>
                </div>
              </div>

              {/* Monthly Expense Breakdown */}
              <div className="p-4 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-3 font-mono">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-[#dad4c5] pb-2">
                  <span>Operating Expense Category</span>
                  <span>Monthly Rate</span>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Building2 size={13} className="text-cyan-700" />
                      Physical Campus Facilities Maintenance (14 Units):
                    </span>
                    <span className="font-bold text-slate-900">${(totalMaintenance / 1e3).toFixed(1)}k</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Users size={13} className="text-blue-700" />
                      Engineering & Technical Staff Payroll ({totalStaff} staff):
                    </span>
                    <span className="font-bold text-slate-900">${(estimatedPayroll / 1e3).toFixed(1)}k</span>
                  </div>

                  {monthlyConstructionDraw > 0 && (
                    <div className="flex justify-between items-center text-amber-700">
                      <span className="flex items-center gap-1.5">
                        <Factory size={13} className="text-amber-700" />
                        Active Factory Plant Construction Draw:
                      </span>
                      <span className="font-bold">${(monthlyConstructionDraw / 1e3).toFixed(0)}k</span>
                    </div>
                  )}

                  {factoryEcon && factoryEcon.isOutsourced && (
                    <div className="flex justify-between items-center text-emerald-700 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                      <span className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 size={13} />
                        Potential Owned Plant Savings (Target L1+):
                      </span>
                      <span className="font-bold">+${factoryEcon.costBreakdown.unitSavingsWithOwnedPlant.toLocaleString()} / car</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Per-Facility Cost Table */}
              <div className="p-4 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-2">
                <h4 className="font-bold text-xs text-slate-900 font-mono uppercase tracking-wider">
                  Per-Facility Maintenance Allocations
                </h4>
                <div className="max-h-48 overflow-y-auto divide-y divide-[#eee9dc] font-mono text-[10px]">
                  {Object.values(units).map((u) => (
                    <div
                      key={u.id}
                      onClick={() => {
                        selectUnit(u.id);
                        onClose();
                      }}
                      className="py-1.5 px-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer rounded"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-5 font-bold text-slate-500">#{u.unitNumber}</span>
                        <span className="font-medium text-slate-900 truncate">{u.name}</span>
                        <span className="text-slate-400">({u.code})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500">L{u.level}</span>
                        <span className="font-bold text-amber-800">
                          ${(u.monthlyMaintenanceCost / 1e3).toFixed(1)}k/mo
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 2: CAMPUS METRICS & STATISTICS (Phase 197)                 */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === "statistics" && (
            <div className="space-y-4">
              {/* Prestige & Level Distribution */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-indigo-700">
                    <Award size={16} />
                    <span className="font-bold font-mono text-xs uppercase">Campus Prestige Score</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-extrabold text-indigo-900">{prestigeScore}</span>
                    <span className="text-xs font-mono text-slate-500">/ 100 PTS</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Affects brand authority, press test scores, driver recruitment, and dealership franchise appeal.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <TrendingUp size={16} />
                    <span className="font-bold font-mono text-xs uppercase">R&D Speed Multiplier</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-extrabold text-emerald-800">
                      +{telemetry.rndSpeedBonusPct}%
                    </span>
                    <span className="text-xs font-mono text-slate-500">ACCELERATION</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Derived from specialized CAD/CAE compute clusters, wind tunnel calibration, and testing center telemetry.
                  </p>
                </div>
              </div>

              {/* Systemic Performance Multipliers (Phase 249) */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-white border border-[#dad4c5] shadow-2xs font-mono space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-700 text-[10px] font-bold">
                    <Shield size={13} />
                    <span>QUALITY ASSURANCE</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">{bonuses.qualityAssuranceRating}</span>
                    <span className="text-[10px] text-slate-400">/ 99 PTS</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block leading-tight">Assembly defect mitigation</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#dad4c5] shadow-2xs font-mono space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-700 text-[10px] font-bold">
                    <CheckCircle2 size={13} />
                    <span>SAFETY COMPLIANCE</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">{bonuses.safetyComplianceRating}</span>
                    <span className="text-[10px] text-slate-400">/ 100 PTS</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block leading-tight">Crashworthiness & NCAP index</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#dad4c5] shadow-2xs font-mono space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-bold">
                    <Wrench size={13} />
                    <span>TOOLING DISCOUNT</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-emerald-800">-{bonuses.manufacturingCostDiscountPct}%</span>
                    <span className="text-[10px] text-slate-400">CAPEX</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block leading-tight">Procurement & plant tooling</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#dad4c5] shadow-2xs font-mono space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-700 text-[10px] font-bold">
                    <Clock size={13} />
                    <span>MULE TURNAROUND</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-purple-800">-{bonuses.prototypeTurnaroundDaysReductionPct}%</span>
                    <span className="text-[10px] text-slate-400">TIME</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block leading-tight">Rapid engineering turnaround</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#dad4c5] shadow-2xs font-mono space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-700 text-[10px] font-bold">
                    <Zap size={13} />
                    <span>MOTORSPORT INDEX</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">{bonuses.motorsportPerformanceIndex}</span>
                    <span className="text-[10px] text-slate-400">/ 100</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block leading-tight">Telemetry & track prowess</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#dad4c5] shadow-2xs font-mono space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-700 text-[10px] font-bold">
                    <Building2 size={13} />
                    <span>FLEET CAPABILITY</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">{bonuses.fleetCommercialCapabilityScore}</span>
                    <span className="text-[10px] text-slate-400">/ 100</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block leading-tight">Heavy commercial chassis</span>
                </div>
              </div>

              {/* Active Cross-Facility Synergies */}
              <div className="p-4 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-[#dad4c5] pb-2">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Sparkles size={15} />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                      Cross-Facility Compound Synergies
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    {bonuses.synergiesActive.length} Active
                  </span>
                </div>

                {bonuses.synergiesActive.length > 0 ? (
                  <div className="space-y-2">
                    {bonuses.synergiesActive.map((synergy, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-950"
                      >
                        <Sparkles size={14} className="text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-bold block">{synergy.split(" (")[0]}</span>
                          <span className="text-[10px] text-amber-800 block">
                            {synergy.includes("(") ? "(" + synergy.split(" (")[1] : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-[#dad4c5] text-center space-y-1">
                    <span className="text-xs text-slate-600 font-bold block">No Synergies Active Yet</span>
                    <p className="text-[10px] text-slate-500 leading-relaxed max-w-md mx-auto">
                      Upgrade complementary units to unlock compound bonuses (e.g. Aero HQ L2+ & Motorsport HQ L1+, Design HQ L3+ & Factory L2+, or Testing HQ L2+ & Quality HQ L2+).
                    </p>
                  </div>
                )}
              </div>

              {/* Facility Progression Status Overview */}
              <div className="p-4 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-2 font-mono">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Campus Facilities Status
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-[#f8f6f0] border border-[#dad4c5]">
                    <span className="text-slate-500 block text-[10px]">OPERATIONAL UNITS:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {Object.values(units).filter(u => u.status === "operational").length} / 14 Facilities
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#f8f6f0] border border-[#dad4c5]">
                    <span className="text-slate-500 block text-[10px]">RESERVED EXPANSION PLOTS:</span>
                    <span className="font-bold text-amber-700 text-sm">
                      {Object.values(units).filter(u => u.status === "locked").length} Plots
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#f8f6f0] border border-[#dad4c5]">
                    <span className="text-slate-500 block text-[10px]">PROTOTYPE MULE BAYS:</span>
                    <span className="font-bold text-cyan-800 text-sm">
                      {telemetry.activePrototypesCount} Active / {telemetry.prototypeCapacityTotal} Capacity
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#f8f6f0] border border-[#dad4c5]">
                    <span className="text-slate-500 block text-[10px]">PLANT ASSEMBLY STATUS:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {factoryState.ownershipStatus.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 3: WORKFORCE ALLOCATION & CAPACITY (Phase 194)            */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === "workforce" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-2 font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Total Campus Staff Utilization
                  </span>
                  <span className="text-cyan-800 font-bold text-sm">
                    {totalStaff} / {telemetry.totalStaffCapacity} Engineers ({Math.round((totalStaff / telemetry.totalStaffCapacity) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-cyan-600 transition-all duration-300"
                    style={{ width: `${(totalStaff / telemetry.totalStaffCapacity) * 100}%` }}
                  />
                </div>
              </div>

              {/* Workforce Heatmap by Sector */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { sector: "ENGINEERING_RND", label: "Engineering R&D (6 Units)", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
                  { sector: "MANUFACTURING_SUPPLY_CHAIN", label: "Production & Supply (4 Units)", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
                  { sector: "MOTORSPORT_COMMERCIAL", label: "Motorsport & Heavy (2 Units)", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
                  { sector: "CORPORATE_MANAGEMENT", label: "Executive & Admin (1 Unit)", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
                ].map(sec => {
                  const secUnits = Object.values(units).filter(u => u.sector === sec.sector);
                  const staff = secUnits.reduce((acc, u) => acc + u.currentStaff, 0);
                  const cap = secUnits.reduce((acc, u) => acc + u.staffCapacity, 0);
                  const pct = cap > 0 ? Math.round((staff / cap) * 100) : 0;

                  return (
                    <div key={sec.sector} className={`p-3.5 rounded-2xl border ${sec.bg} space-y-2 shadow-2xs font-mono`}>
                      <span className={`text-xs font-bold ${sec.color} block`}>{sec.label}</span>
                      <div className="flex justify-between text-[11px] text-slate-700">
                        <span>Staff Assigned:</span>
                        <span className="font-bold">{staff} / {cap}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
                        <div className="h-full bg-slate-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 4: HQ PRESTIGE & BEAUTIFICATION (Phase 281)              */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === "beautification" && beautificationState && (
            <div className="space-y-4">
              {/* Architecture Core Decoupling Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 shadow-xs">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-900 border border-amber-500/20 shrink-0">
                  <Sparkles size={18} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-amber-950 font-mono uppercase tracking-wider">
                      Dynamic HQ Evolution Law
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200/60 text-amber-900 font-bold">
                      Reputation-Driven
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900/90 leading-relaxed">
                    <strong>HQ Level = Functional Capability</strong> (engineering labs, staff capacity, test rigs) while{" "}
                    <strong>Company Reputation = Visual Prestige & Presentation</strong> (promenades, grand portals, sculptures, monuments).
                    As company reputation changes, the campus automatically upgrades its presentation without player micro-management.
                  </p>
                </div>
              </div>

              {/* Status Header Cards */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">
                    Corporate Reputation
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-mono font-extrabold text-slate-900">
                      {overallReputation ?? beautificationState.lastReputationScore}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">/ 100 PTS</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Overall market authority</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">
                    Prestige Tier
                  </span>
                  <span className="text-sm font-mono font-bold text-indigo-900 block truncate">
                    {beautificationState.tier}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 block truncate">
                    {beautificationState.tierLabel}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">
                    Beautification Budget
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-mono font-extrabold text-cyan-800">
                      {beautificationState.budgetSpent}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">/ {beautificationState.totalBudget} PTS</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    {Math.round((beautificationState.budgetSpent / beautificationState.totalBudget) * 100)}% budget utilized
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">
                    Specialization
                  </span>
                  <span className="text-sm font-mono font-bold text-purple-900 block uppercase truncate">
                    {beautificationState.dominantSpecialization ?? "Balanced Aesthetic"}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {beautificationState.heritageAssets.length} Heritage Monuments
                  </span>
                </div>
              </div>

              {/* Specialization Domain Bars */}
              <div className="p-4 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-3 font-mono">
                <span className="font-bold text-xs text-slate-900 uppercase tracking-wider block">
                  Aesthetic Specialization Influence (Perception Drives Decor)
                </span>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { key: "engineering", label: "Engineering", color: "bg-amber-500", text: "text-amber-800" },
                    { key: "motorsport", label: "Motorsport", color: "bg-emerald-600", text: "text-emerald-800" },
                    { key: "safety", label: "Safety NCAP", color: "bg-blue-600", text: "text-blue-800" },
                    { key: "luxury", label: "Luxury Styling", color: "bg-purple-600", text: "text-purple-800" },
                    { key: "environmental", label: "Eco / Green", color: "bg-teal-600", text: "text-teal-800" },
                  ].map((s) => {
                    const score = beautificationState.specializationScores[s.key as keyof typeof beautificationState.specializationScores] ?? 0;
                    return (
                      <div key={s.key} className="space-y-1 text-[10px]">
                        <div className="flex justify-between">
                          <span className={`font-bold ${s.text}`}>{s.label}</span>
                          <span className="font-bold text-slate-700">{score}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className={`h-full ${s.color}`} style={{ width: `${score}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Beautification Assets Grid */}
              <div className="p-4 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Landmark size={15} className="text-cyan-800" />
                    <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                      Active Campus Beautification Modules ({beautificationState.activeAssets.length})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Layered zero-offset GLB modules</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {beautificationState.activeAssets.map((inst) => {
                    const def = BEAUTIFICATION_ASSET_REGISTRY[inst.assetId];
                    if (!def) return null;
                    return (
                      <div
                        key={inst.assetId}
                        className="p-2.5 rounded-xl border border-slate-200/80 bg-[#faf8f4] hover:bg-white transition-colors flex items-start justify-between gap-2 shadow-2xs"
                      >
                        <div className="space-y-0.5 truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[11px] text-slate-900 truncate">{def.name}</span>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold bg-slate-200 text-slate-700">
                              {def.category}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-sans truncate">{def.description}</p>
                          <div className="flex items-center gap-2 text-[9px] text-slate-400">
                            <span>Zone: {def.placementZone}</span>
                            <span>•</span>
                            <span>Placed: Month {inst.placedAtGameMonth}</span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-[10px] font-bold text-cyan-800 px-1.5 py-0.5 rounded bg-cyan-50 border border-cyan-200 block">
                            {def.budgetCost} pts
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Historical Heritage Archive (Non-Destructive) */}
              <div className="p-4 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History size={15} className="text-amber-800" />
                    <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                      Historical Heritage Preservation ({beautificationState.heritageAssets.length} Landmarks)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Never Deleted • Visual Company Timeline
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-sans">
                  The campus serves as a permanent physical archive of corporate milestones. Past monuments, cornerstones, and replaced early entrances are preserved as heritage installations rather than being discarded.
                </p>

                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  {beautificationState.heritageAssets.map((inst) => {
                    const def = BEAUTIFICATION_ASSET_REGISTRY[inst.assetId];
                    if (!def) return null;
                    return (
                      <div
                        key={inst.assetId}
                        className={`p-2 rounded-xl border flex flex-col justify-between ${
                          inst.active
                            ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                            : "bg-slate-50/80 border-slate-200 text-slate-600"
                        }`}
                      >
                        <div className="truncate">
                          <span className="font-bold truncate block">{def.name}</span>
                          <span className="text-[9px] opacity-75">{def.category} • {def.placementZone}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[9px] pt-1 border-t border-black/5">
                          <span>Month {inst.placedAtGameMonth}</span>
                          <span className={`font-bold ${inst.active ? "text-emerald-700" : "text-amber-700"}`}>
                            {inst.active ? "ACTIVE" : inst.isOverridden ? "HERITAGE" : "WEATHERED"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 5: RAILWAY LOGISTICS & FREIGHT (Phase 200)                 */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === "railway" && (
            <div className="space-y-4">
              {/* Terminal Tier & Network Corridor Banner */}
              {(() => {
                const currentSpec = RAILWAY_LEVEL_SPECS[railwayTerminalState.level];
                const netSpec = NETWORK_CONNECTIONS[railwayTerminalState.networkTier];
                const isUnderCon = railwayTerminalState.operationalStatus === "under_construction";

                return (
                  <div className="p-4 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-cyan-700/10 border border-cyan-500/30 flex items-center justify-center text-cyan-900 font-bold">
                          <Train size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900 uppercase">
                              Level {railwayTerminalState.level}: {currentSpec.name}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                isUnderCon
                                  ? "bg-amber-100 text-amber-900 border-amber-300"
                                  : railwayTerminalState.level > 0
                                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                  : "bg-slate-100 text-slate-600 border-slate-300"
                              }`}
                            >
                              {isUnderCon
                                ? `CIVIL WORKS (Month ${railwayTerminalState.constructionProgressMonths}/${currentSpec.constructionMonths})`
                                : railwayTerminalState.level > 0
                                ? "OPERATIONAL TERMINAL"
                                : "UNDEVELOPED GRASS EMBANKMENT"}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            Connected Corridor: <strong className="text-slate-700">{netSpec.name}</strong> ({netSpec.speedKmh} km/h trunk transit)
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase">Monthly Terminal Upkeep</span>
                        <span className="text-sm font-bold text-slate-800">
                          ${(railEcon.totalFacilityExpenseUSD / 1e3).toFixed(1)}k/mo
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
                      {currentSpec.description}
                    </p>
                  </div>
                );
              })()}

              {/* 4 Core Logistics KPI Cards */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Monthly Freight Savings</span>
                  <span className="text-lg font-mono font-bold text-emerald-700 block">
                    ${(railEcon.estimatedFreightSavingsUSD / 1e3).toFixed(1)}k
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    Lifetime: ${(railwayTerminalState.accumulatedSavingsUSD / 1e6).toFixed(2)}M
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Daily Rail Throughput</span>
                  <span className="text-lg font-mono font-bold text-cyan-800 block">
                    {railDispatch.railCarriedTonnes.toLocaleString()} <span className="text-xs font-normal text-slate-500">t/d</span>
                  </span>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full ${
                        railDispatch.capacityUtilizationPct > 90 ? "bg-rose-500" : "bg-cyan-600"
                      }`}
                      style={{ width: `${Math.min(100, railDispatch.capacityUtilizationPct)}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {railDispatch.capacityUtilizationPct.toFixed(1)}% of {railDispatch.railCapacityTonnes.toLocaleString()} t cap
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Transit Time</span>
                  <span className="text-lg font-mono font-bold text-indigo-700 block">
                    {railDispatch.effectiveTransitDays.toFixed(1)} <span className="text-xs font-normal text-slate-500">days</span>
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    Risk of Delay: {railDispatch.delayRiskPct.toFixed(0)}%
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">3rd-Party Rail Leasing</span>
                  <span className="text-lg font-mono font-bold text-amber-700 block">
                    +${(railEcon.thirdPartyLeaseIncomeUSD / 1e3).toFixed(1)}k
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    Net P&L: {railEcon.netTerminalProfitLossUSD >= 0 ? "+" : ""}${(railEcon.netTerminalProfitLossUSD / 1e3).toFixed(1)}k/mo
                  </span>
                </div>
              </div>

              {/* Modal Split (Rail vs Truck Overflow) */}
              <div className="p-4 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Train size={14} className="text-cyan-700" />
                    Freight Modal Split: Rail vs. Road Truck Overflow
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Total Demand: <strong className="text-slate-800">{railDispatch.totalDemandTonnes.toLocaleString()} tonnes/day</strong>
                  </span>
                </div>

                {/* Split Bar */}
                {(() => {
                  const railPct =
                    railDispatch.totalDemandTonnes > 0
                      ? Math.min(100, (railDispatch.railCarriedTonnes / railDispatch.totalDemandTonnes) * 100)
                      : 100;
                  const truckPct = Math.max(0, 100 - railPct);

                  return (
                    <div className="space-y-1.5">
                      <div className="w-full bg-slate-100 rounded-lg h-3 overflow-hidden flex">
                        <div
                          className="bg-cyan-600 transition-all duration-300 flex items-center justify-center text-[8px] font-bold text-white overflow-hidden"
                          style={{ width: `${railPct}%` }}
                        >
                          {railPct > 15 && `Rail ${railPct.toFixed(0)}%`}
                        </div>
                        <div
                          className="bg-amber-500 transition-all duration-300 flex items-center justify-center text-[8px] font-bold text-white overflow-hidden"
                          style={{ width: `${truckPct}%` }}
                        >
                          {truckPct > 15 && `Truck ${truckPct.toFixed(0)}%`}
                        </div>
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-500">
                        <div className="flex items-center gap-1.5 text-cyan-800 font-bold">
                          <Train size={12} />
                          <span>Rail: {railDispatch.railCarriedTonnes.toLocaleString()} t/d ({railDispatch.railCarriedVehicles} cars)</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                          <Truck size={12} />
                          <span>Truck Overflow: {railDispatch.truckOverflowTonnes.toLocaleString()} t/d ({railDispatch.truckOverflowVehicles} cars)</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Bottleneck Alerts */}
                {railDispatch.bottleneckAlerts.length > 0 ? (
                  <div className="space-y-1.5 pt-2 border-t border-[#dad4c5]/50">
                    {railDispatch.bottleneckAlerts.map((alert, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-amber-900 text-[11px] font-sans"
                      >
                        <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                        <span>{alert}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-900 text-[11px] font-sans">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span>No freight bottlenecks detected. Campus rail capacity cleanly accommodates current manufacturing demand.</span>
                  </div>
                )}
              </div>

              {/* Installed Specialized Sidings Matrix */}
              <div className="p-4 rounded-2xl bg-white border border-[#dad4c5] shadow-xs space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Wrench size={14} className="text-slate-700" />
                    Specialized Sidings & Manufacturing Multipliers ({railwayTerminalState.installedSidings.length}/4 Active)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Direct Plant-Floor Material Ingestion
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {Object.values(SPECIALIZED_SIDINGS).map((siding) => {
                    const isInstalled = railwayTerminalState.installedSidings.includes(siding.id);
                    return (
                      <div
                        key={siding.id}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                          isInstalled
                            ? "bg-emerald-50/70 border-emerald-300 text-slate-900"
                            : "bg-slate-50 border-slate-200 text-slate-400"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[11px] block text-slate-800">
                              {siding.name}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                isInstalled
                                  ? "bg-emerald-200 text-emerald-900"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {isInstalled ? "INSTALLED" : `REQ L${siding.minTerminalLevel}`}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 font-sans leading-tight">
                            {siding.description}
                          </p>
                        </div>

                        <div className="mt-2 pt-1.5 border-t border-black/5 flex items-center justify-between font-mono text-[9px]">
                          <span className="text-emerald-700 font-bold">
                            {siding.procurementDiscountPct > 0 && `-${(siding.procurementDiscountPct * 100).toFixed(0)}% Procurement Cost `}
                            {siding.defectReductionPpm > 0 && `-${siding.defectReductionPpm} PPM Damage `}
                            {siding.deliveryReliabilityBonusPct > 0 && `+${(siding.deliveryReliabilityBonusPct * 100).toFixed(0)}% Reliability`}
                          </span>
                          <span className="text-slate-400">
                            ${(siding.monthlyUpkeepUSD / 1e3).toFixed(0)}k/mo
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
