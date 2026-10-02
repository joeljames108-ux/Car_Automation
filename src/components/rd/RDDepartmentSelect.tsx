// ===================================================================
// R&D ECOSYSTEM SELECTOR & COMPANY DNA DASHBOARD
// 12 Divisions, 95 Subsystems, Mastery Tiers, and Emergent Archetypes
// ===================================================================
import React, { useMemo, useState } from "react";
import {
  Cog,
  Sliders,
  BatteryCharging,
  Layers,
  Activity,
  Disc,
  CircleDot,
  Car,
  Wind,
  Armchair,
  Sun,
  ShieldCheck,
  CircuitBoard,
  Code,
  Thermometer,
  Wrench,
  FlaskConical,
  CheckSquare,
  Trophy,
  Truck,
  Leaf,
  ChevronRight,
  Search,
  Sparkles,
  CheckCircle2,
  Lock,
  Award,
  Zap,
  Cpu,
  Feather,
  Eye,
  Shield,
  Clock,
  Radio,
  BarChart3,
  Users,
} from "lucide-react";
import {
  MASTER_DIVISIONS,
  RD_DEPARTMENTS,
  SUBSYSTEM_BRANCHES,
  BRANCHES_BY_DIVISION,
} from "../../sim/rdTreeData";
import {
  MasterDivisionId,
  RDDepartmentId,
  SubsystemBranchId,
  RDEra,
  MASTERY_TIERS,
} from "../../sim/rdTreeTypes";
import {
  getDepartmentStats,
  getDivisionStats,
  calculateBranchMastery,
} from "../../sim/rdTreeEngine";
import { useRDTreeStore } from "../../state/rdTreeStore";

const ICON_MAP: Record<string, React.ReactNode> = {
  Cog: <Cog size={20} className="text-amber-600" />,
  Sliders: <Sliders size={20} className="text-amber-600" />,
  BatteryCharging: <BatteryCharging size={20} className="text-yellow-600" />,
  Layers: <Layers size={20} className="text-cyan-600" />,
  Activity: <Activity size={20} className="text-cyan-600" />,
  Disc: <Disc size={20} className="text-cyan-600" />,
  CircleDot: <CircleDot size={20} className="text-cyan-600" />,
  Car: <Car size={20} className="text-emerald-600" />,
  Wind: <Wind size={20} className="text-emerald-600" />,
  Armchair: <Armchair size={20} className="text-emerald-600" />,
  Sun: <Sun size={20} className="text-emerald-600" />,
  ShieldCheck: <ShieldCheck size={20} className="text-purple-600" />,
  CircuitBoard: <CircuitBoard size={20} className="text-purple-600" />,
  Code: <Code size={20} className="text-purple-600" />,
  Thermometer: <Thermometer size={20} className="text-purple-600" />,
  Wrench: <Wrench size={20} className="text-blue-600" />,
  FlaskConical: <FlaskConical size={20} className="text-blue-600" />,
  CheckSquare: <CheckSquare size={20} className="text-blue-600" />,
  Trophy: <Trophy size={20} className="text-rose-600" />,
  Truck: <Truck size={20} className="text-slate-600" />,
  Leaf: <Leaf size={20} className="text-teal-600" />,
  Zap: <Zap size={20} className="text-yellow-600" />,
  Cpu: <Cpu size={20} className="text-purple-600" />,
  Feather: <Feather size={20} className="text-emerald-600" />,
  Eye: <Eye size={20} className="text-purple-600" />,
  Shield: <Shield size={20} className="text-red-600" />,
  Radio: <Radio size={20} className="text-indigo-600" />,
};

interface RDDepartmentSelectProps {
  onSelectDepartment: (depId: RDDepartmentId) => void;
}

export const RDDepartmentSelect: React.FC<RDDepartmentSelectProps> = ({
  onSelectDepartment,
}) => {
  const {
    activeDivisionId,
    setActiveDivision,
    unlockedTechs,
    activeProject,
    searchQuery,
    setSearchQuery,
    companyDNA,
    branchHours,
    totalEngineers,
    researchTeams,
  } = useRDTreeStore();

  const [activeTab, setActiveTab] = useState<"departments" | "subsystems">("departments");

  const unlockedSet = useMemo(() => new Set(unlockedTechs), [unlockedTechs]);

  // Filtered departments based on active division and search query
  const filteredDepartments = useMemo(() => {
    return RD_DEPARTMENTS.filter((dep) => {
      if (activeDivisionId && dep.divisionId !== activeDivisionId) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = dep.name.toLowerCase().includes(q);
        const matchesTag = dep.tagline.toLowerCase().includes(q);
        const matchesSub = dep.subsections.some((s) => s.toLowerCase().includes(q));
        return matchesName || matchesTag || matchesSub;
      }
      return true;
    });
  }, [activeDivisionId, searchQuery]);

  // Filtered 95 subsystems
  const filteredSubsystems = useMemo(() => {
    return SUBSYSTEM_BRANCHES.filter((branch) => {
      if (activeDivisionId && branch.divisionId !== activeDivisionId) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          branch.name.toLowerCase().includes(q) ||
          branch.tagline.toLowerCase().includes(q) ||
          branch.subsections.some((s) => s.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [activeDivisionId, searchQuery]);

  // Map subsystem to its closest legacy department for navigation
  const handleSelectSubsystem = (subsystemId: SubsystemBranchId) => {
    // If subsystem exists directly as department or mapped to one
    let targetDep: RDDepartmentId = "engine";
    if (subsystemId.includes("engine") || subsystemId.includes("fuel") || subsystemId.includes("hybrid")) targetDep = "engine";
    else if (subsystemId.includes("transmission") || subsystemId.includes("differential")) targetDep = "transmission";
    else if (subsystemId.includes("battery") || subsystemId.includes("charging") || subsystemId.includes("electric")) targetDep = "battery_ev";
    else if (subsystemId.includes("chassis")) targetDep = "chassis";
    else if (subsystemId.includes("suspension")) targetDep = "suspension";
    else if (subsystemId.includes("brake")) targetDep = "braking";
    else if (subsystemId.includes("tyres") || subsystemId.includes("wheels")) targetDep = "tyres_wheels";
    else if (subsystemId.includes("body") || subsystemId.includes("lightweight")) targetDep = "bodywork";
    else if (subsystemId.includes("aero") || subsystemId.includes("wind") || subsystemId.includes("cfd")) targetDep = "aero";
    else if (subsystemId.includes("interior") || subsystemId.includes("ergonomics") || subsystemId.includes("comfort")) targetDep = "interior";
    else if (subsystemId.includes("safety") || subsystemId.includes("crash") || subsystemId.includes("airbag") || subsystemId.includes("adas")) targetDep = "safety";
    else if (subsystemId.includes("electrical") || subsystemId.includes("sensor") || subsystemId.includes("ecu") || subsystemId.includes("network")) targetDep = "electronics";
    else if (subsystemId.includes("software") || subsystemId.includes("ai") || subsystemId.includes("autonomous")) targetDep = "software_control";
    else if (subsystemId.includes("thermal")) targetDep = "thermal_management";
    else if (subsystemId.includes("materials")) targetDep = "materials_science";
    else if (subsystemId.includes("casting") || subsystemId.includes("forging") || subsystemId.includes("machining") || subsystemId.includes("welding") || subsystemId.includes("robotics")) targetDep = "manufacturing_tech";
    else if (subsystemId.includes("durability") || subsystemId.includes("corrosion") || subsystemId.includes("diagnostic") || subsystemId.includes("maintenance")) targetDep = "service_reliability";
    else if (subsystemId.includes("race") || subsystemId.includes("telemetry") || subsystemId.includes("pit")) targetDep = "motorsport_tech";
    else if (subsystemId.includes("production") || subsystemId.includes("supply") || subsystemId.includes("logistics") || subsystemId.includes("rail")) targetDep = "production_supply";
    else if (subsystemId.includes("fuel_efficiency") || subsystemId.includes("emissions") || subsystemId.includes("recycling") || subsystemId.includes("sustainable")) targetDep = "environment_efficiency";

    onSelectDepartment(targetDep);
  };

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          1. COMPANY DNA & TELEMETRY BANNER (BREADTH VS DEPTH)
      ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 shadow-md border border-indigo-900/50">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: DNA Title & Archetype Badge */}
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5 uppercase">
                <Sparkles size={11} className="text-amber-400" />
                Automotive Technological DNA
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                1970–2026+ ECOSYSTEM
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white flex items-center gap-2">
              <Award className="text-amber-400" size={24} />
              {companyDNA.archetypeTitle}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              {companyDNA.archetypeDescription}
            </p>

            {/* Top 4 Specializations */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Core Trademark Disciplines:</span>
              {companyDNA.topSpecializations.slice(0, 4).map((spec, i) => {
                const tier = MASTERY_TIERS[spec.mastery];
                return (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-slate-200"
                  >
                    <span>{spec.branchName}</span>
                    <span className="font-bold text-amber-300">★ Lvl {tier.rank}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Right: Breadth vs. Depth Gauges & Capacity Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 w-full lg:w-auto">
            {/* Breadth Gauge */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between min-w-[130px]">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase">
                <span>Breadth</span>
                <span className="text-emerald-400 font-bold">{companyDNA.breadthScorePercent}%</span>
              </div>
              <div className="text-lg font-black font-mono text-white mt-1">
                {Math.round((companyDNA.breadthScorePercent * 95) / 100)} <span className="text-xs text-slate-400 font-normal">/ 95</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  style={{ width: `${companyDNA.breadthScorePercent}%` }}
                />
              </div>
              <div className="text-[9px] text-slate-400 font-mono mt-1">Disciplines Explored</div>
            </div>

            {/* Depth Gauge */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between min-w-[130px]">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase">
                <span>Depth</span>
                <span className="text-cyan-400 font-bold">{companyDNA.depthScorePercent}%</span>
              </div>
              <div className="text-lg font-black font-mono text-white mt-1">
                {(companyDNA.depthScorePercent * 0.06).toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 6.0</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-400"
                  style={{ width: `${companyDNA.depthScorePercent}%` }}
                />
              </div>
              <div className="text-[9px] text-slate-400 font-mono mt-1">Avg Mastery Tier</div>
            </div>

            {/* Headcount Capacity */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between min-w-[130px]">
              <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <Users size={11} className="text-indigo-400" /> Manpower
              </div>
              <div className="text-lg font-black font-mono text-white mt-1">
                {totalEngineers} <span className="text-xs text-slate-400 font-normal">Staff</span>
              </div>
              <div className="text-[9px] text-emerald-400 font-mono mt-1">
                {researchTeams.length} Active Teams
              </div>
            </div>

            {/* Cumulative Hours */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between min-w-[130px]">
              <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <Clock size={11} className="text-amber-400" /> Eng. Hours
              </div>
              <div className="text-lg font-black font-mono text-white mt-1">
                {(companyDNA.totalEngineeringHoursInvested / 1000).toFixed(1)}k
              </div>
              <div className="text-[9px] text-amber-300 font-mono mt-1">
                Institutional Memory
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. DIVISION SELECTOR & NAVIGATION TABS
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[#d8e2cb] pb-4">
        {/* Division Scrollable Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
          <button
            onClick={() => setActiveDivision("powertrain")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
              !activeDivisionId
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-[#d2dec0]"
            }`}
          >
            ALL DIVISIONS
          </button>
          {MASTER_DIVISIONS.map((div) => {
            const isSelected = activeDivisionId === div.id;
            return (
              <button
                key={div.id}
                onClick={() => setActiveDivision(div.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-white text-slate-700 hover:bg-emerald-50 border border-[#d2dec0]"
                }`}
              >
                <span>{div.name}</span>
                <span className="text-[10px] opacity-70">({div.branches?.length || 8})</span>
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle: 22 Major Departments vs. 95 Subsystems */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#d2dec0] self-start md:self-auto shrink-0 shadow-2xs">
          <button
            onClick={() => setActiveTab("departments")}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              activeTab === "departments"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            22 DEPARTMENTS
          </button>
          <button
            onClick={() => setActiveTab("subsystems")}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
              activeTab === "subsystems"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>95 SUBSYSTEMS</span>
            <span className="text-[9px] bg-amber-400 text-amber-950 font-black px-1 rounded-full">DEEP</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. SEARCH & ACTIVE PROJECT BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#d2dec0] shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all 95 engineering disciplines, architectures, materials, active aero, direct injection..."
            className="w-full pl-9 pr-4 py-1.5 text-xs font-mono bg-[#f4f7f0] border border-[#d6dfc8] rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Counter */}
        <div className="text-xs font-mono font-bold text-slate-600 px-2 flex items-center gap-2">
          <BarChart3 size={14} className="text-emerald-600" />
          <span>
            SHOWING {activeTab === "departments" ? filteredDepartments.length : filteredSubsystems.length}{" "}
            {activeTab === "departments" ? "DEPARTMENTS" : "OF 95 SUBSYSTEM DISCIPLINES"}
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. TAB CONTENT: 22 MAJOR DEPARTMENTS CARDS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "departments" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDepartments.map((dep) => {
            const stats = getDepartmentStats(dep.id, unlockedSet);
            const isResearchActive = activeProject?.departmentId === dep.id;

            return (
              <div
                key={dep.id}
                onClick={() => onSelectDepartment(dep.id)}
                className="group relative rounded-2xl bg-gradient-to-b from-white/95 to-[#fafcf8] border border-[#d2dec0] hover:border-emerald-500 p-5 shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between active:scale-[0.99]"
              >
                {/* Top row: Icon & Status Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#cddbbf] flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
                    {ICON_MAP[dep.icon] || <Cog size={20} className="text-amber-600" />}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isResearchActive && (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 animate-pulse flex items-center gap-1">
                        <FlaskConical size={10} /> IN RESEARCH
                      </span>
                    )}
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${dep.badgeBg} border ${dep.badgeText}`}>
                      {stats.percent}% UNLOCKED
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="mb-4">
                  <h4 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors font-mono uppercase tracking-wide">
                    {dep.name}
                  </h4>
                  <div className="text-[10px] font-mono font-bold text-slate-500 mt-0.5">
                    {dep.tagline}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                    {dep.description}
                  </p>
                </div>

                {/* Subsections tags */}
                <div className="pt-3 border-t border-[#e2ebd4]">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {dep.subsections.slice(0, 3).map((sub, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-mono font-semibold text-slate-600 bg-white border border-[#d6dfc8] px-1.5 py-0.5 rounded shadow-2xs"
                      >
                        {sub}
                      </span>
                    ))}
                    {dep.subsections.length > 3 && (
                      <span className="text-[9px] font-mono font-bold text-slate-400 px-1 py-0.5">
                        +{dep.subsections.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Progress bar and button */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500">
                      <span>{stats.unlocked} / {stats.total} Technologies</span>
                      <span>{stats.percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-400"
                        style={{ width: `${stats.percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs font-mono font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                    <span>OPEN DEPARTMENT TREE</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform text-emerald-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. TAB CONTENT: 95 DEEP SUBSYSTEM DISCIPLINES MATRIX
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "subsystems" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredSubsystems.map((branch) => {
            const hours = branchHours[branch.id] || 0;
            const masteryRank = calculateBranchMastery(branch.id, unlockedSet, hours);
            const tier = MASTERY_TIERS[masteryRank];

            return (
              <div
                key={branch.id}
                onClick={() => handleSelectSubsystem(branch.id)}
                className="group rounded-xl bg-white border border-[#d2dec0] hover:border-emerald-500 p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Icon, Testing Rig & Mastery Tier */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#f4f7f0] border border-[#d2dec0] flex items-center justify-center">
                      {ICON_MAP[branch.icon] || <Cog size={16} className="text-amber-600" />}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {branch.requiredTestingType !== "none" && (
                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                          {branch.requiredTestingType.replace(/_/g, " ")}
                        </span>
                      )}
                      <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full border ${tier.badgeBg} ${tier.badgeBorder} ${tier.badgeText}`}>
                        LVL {tier.rank} {tier.name.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <h5 className="text-xs font-black font-mono text-slate-900 group-hover:text-emerald-700 transition-colors uppercase">
                    {branch.name}
                  </h5>
                  <div className="text-[10px] font-mono text-slate-500 line-clamp-1 mt-0.5">
                    {branch.tagline}
                  </div>
                </div>

                {/* Subsections & Engineering Hours */}
                <div className="mt-3 pt-2.5 border-t border-[#edf2e6] flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>{branch.subsections.length} Disciplines</span>
                  <span className="font-bold text-slate-700">{hours > 0 ? `${(hours / 1000).toFixed(1)}k hrs` : "0 hrs"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
