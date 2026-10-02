import React, { useState } from "react";
import {
  Trophy,
  Award,
  TrendingUp,
  ShieldCheck,
  Shield,
  Zap,
  Cog,
  Sparkles,
  DollarSign,
  Lightbulb,
  Flag,
  Factory,
  HeartHandshake,
  Briefcase,
  Users,
  ChevronRight,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Newspaper,
  Car,
  Layers,
  Palette,
  FileCheck,
  GraduationCap,
  Building2,
  Truck,
  Percent,
  Calculator,
  Lock,
  Unlock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Clock,
  Sparkle,
} from "lucide-react";
import { SubPageLayout } from "../SubPageLayout";
import { useReputationStore } from "../../../state/reputationStore";
import {
  REPUTATION_DIMENSIONS_META,
  ReputationDimensionKey,
  getReputationLevel,
} from "../../../state/reputationEngine";
import { useSimulationClockStore, formatSimDate } from "../../../state/simulationClockStore";
import { useDeveloperModeStore } from "../../../state/developerModeStore";
import type { Stage } from "../../StageSwitcher";

interface ReputationPageProps {
  onSelectStage: (stage: Stage) => void;
}

export const ReputationPage: React.FC<ReputationPageProps> = ({ onSelectStage }) => {
  const {
    dimensions,
    overallReputation,
    overallLevel,
    audiences,
    contractTiers,
    designLanguage,
    components,
    vehicles,
    identity,
    opportunities,
    events,
    getHiringModel,
    getConstructionModel,
    getSupplierModel,
    modifyDimension,
    triggerReputationShock,
    resolveCrisis,
  } = useReputationStore();

  const { year, month, day } = useSimulationClockStore();
  const { devMode } = useDeveloperModeStore();

  // Active top-level tab
  const [activeMainSection, setActiveMainSection] = useState<
    "overview" | "specialized" | "economics" | "audiences" | "contracts" | "heritage"
  >("overview");

  // Specialized track category filter
  const [trackCategoryFilter, setTrackCategoryFilter] = useState<
    "all" | "capability" | "operations" | "market" | "legacy"
  >("all");

  // Selected dimension for deep dive drawer
  const [selectedDimension, setSelectedDimension] = useState<ReputationDimensionKey>("engineering");

  // Interactive Economic Calculator State
  const [selectedRole, setSelectedRole] = useState("Powertrain Development Engineer");
  const [selectedTier, setSelectedTier] = useState<"Junior" | "Senior" | "Lead" | "Principal" | "Chief Specialist">("Lead");
  const [constructionProjectQuote, setConstructionProjectQuote] = useState(100000000); // $100M

  const hiringModel = getHiringModel(selectedRole, selectedTier);
  const constructionModel = getConstructionModel(constructionProjectQuote);
  const supplierModel = getSupplierModel();

  // Helper icon renderer
  const renderDimensionIcon = (iconName: string, className: string = "w-5 h-5") => {
    switch (iconName) {
      case "Cog": return <Cog className={className} />;
      case "Zap": return <Zap className={className} />;
      case "ShieldCheck": return <ShieldCheck className={className} />;
      case "Shield": return <Shield className={className} />;
      case "Sparkles": return <Sparkles className={className} />;
      case "DollarSign": return <DollarSign className={className} />;
      case "Lightbulb": return <Lightbulb className={className} />;
      case "Flag": return <Flag className={className} />;
      case "Factory": return <Factory className={className} />;
      case "HeartHandshake": return <HeartHandshake className={className} />;
      case "Briefcase": return <Briefcase className={className} />;
      case "Palette": return <Palette className={className} />;
      case "FileCheck": return <FileCheck className={className} />;
      case "GraduationCap": return <GraduationCap className={className} />;
      case "Building2": return <Building2 className={className} />;
      case "Truck": return <Truck className={className} />;
      case "Trophy":
      default:
        return <Trophy className={className} />;
    }
  };

  const selectedMeta = REPUTATION_DIMENSIONS_META[selectedDimension] || REPUTATION_DIMENSIONS_META.engineering;
  const selectedData = dimensions[selectedDimension] || { score: 35, trendQuarterly: 0.5, historicalPeak: 35 };
  const selectedLevel = getReputationLevel(selectedData.score);

  // Filter specialized tracks
  const filteredDimensionKeys = (Object.keys(REPUTATION_DIMENSIONS_META) as ReputationDimensionKey[]).filter(
    (key) => {
      if (trackCategoryFilter === "all") return true;
      return REPUTATION_DIMENSIONS_META[key].category === trackCategoryFilter;
    }
  );

  return (
    <SubPageLayout
      title="Corporate Reputation & Economic Engine"
      category="Multi-Dimensional Perception • Economic Discounts • Contract Tiers • Design DNA"
      icon={<Trophy size={18} className="text-amber-400" />}
      onSelectStage={onSelectStage}
      rightAction={
        <div className="flex items-center gap-2">
          {/* Overall Company Level Badge */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl ${overallLevel.badgeBg} border ${overallLevel.borderColor} shadow-lg`}>
            <Award size={15} className={overallLevel.textColor} />
            <div className="text-left leading-none">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Corporate Status</div>
              <div className={`text-xs font-black font-mono uppercase ${overallLevel.textColor}`}>
                {overallLevel.label} ({overallReputation}/100)
              </div>
            </div>
          </div>

          {/* Pricing Power Tolerance Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-400/50 shadow-md">
            <DollarSign size={14} className="text-purple-300" />
            <span className="text-xs font-mono font-bold text-purple-200">
              Pricing Tolerance: {identity.priceToleranceMultiplier}x
            </span>
          </div>
        </div>
      }
    >
      <div className="w-full flex flex-col gap-5 text-slate-100 font-sans pb-10">
        {/* ─────────────────────────────────────────────────────────────
            1. NAVIGATION SUB-TABS
        ───────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          {[
            { id: "overview", label: "Executive Dashboard", icon: <Award size={14} /> },
            { id: "economics", label: "Economic Impact Station", icon: <Calculator size={14} /> },
            { id: "contracts", label: "Contract Tiers Ladder (1–6)", icon: <FileCheck size={14} /> },
            { id: "audiences", label: "10 Key Audiences", icon: <Users size={14} /> },
            { id: "specialized", label: "17 Specialized Tracks", icon: <Layers size={14} /> },
            { id: "heritage", label: "Heritage & Crisis Room", icon: <ShieldCheck size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveMainSection(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all whitespace-nowrap ${
                activeMainSection === tab.id
                  ? "bg-amber-500/20 text-amber-300 border border-amber-400/60 shadow-lg shadow-amber-500/10"
                  : "bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. EXECUTIVE DASHBOARD (OVERVIEW)
        ───────────────────────────────────────────────────────────── */}
        {activeMainSection === "overview" && (
          <div className="flex flex-col gap-5">
            {/* Top Row: Corporate Identity & Emergent Design Language Hero */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Card 1: Master Brand Archetype & Overall Status */}
              <div className="lg:col-span-2 relative rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-slate-700/70 p-5 shadow-2xl overflow-hidden flex flex-col justify-between">
                <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-extrabold bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30">
                        Emergent Identity
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Founded 1970 • Timeline Era
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded ${overallLevel.badgeBg} border ${overallLevel.borderColor} ${overallLevel.textColor}`}>
                        {overallLevel.label} Tier
                      </span>
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white mb-2">
                    {identity.primaryArchetype}
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-3xl mb-4">
                    {identity.publicPerceptionSummary}
                  </p>

                  {/* Dynamic Taglines */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {identity.taglines.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono font-semibold px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200"
                      >
                        “{tag}”
                      </span>
                    ))}
                    <span className="text-xs font-mono font-semibold px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                      Secondary: {identity.secondaryArchetype}
                    </span>
                  </div>
                </div>

                {/* Score meters summary bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Overall Reputation</div>
                    <div className="text-lg font-black font-mono text-white flex items-center gap-1.5">
                      {overallReputation}
                      <span className="text-[10px] text-amber-400 font-normal">/ 100</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Brand Prestige</div>
                    <div className="text-lg font-black font-mono text-purple-300 flex items-center gap-1.5">
                      {identity.brandPrestigeIndex}
                      <span className="text-[10px] text-purple-400 font-normal">/ 100</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Price Markup Power</div>
                    <div className="text-lg font-black font-mono text-emerald-400 flex items-center gap-1.5">
                      {identity.priceToleranceMultiplier}x
                      <span className="text-[10px] text-emerald-500 font-normal">Tolerance</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Contract Eligibility</div>
                    <div className="text-lg font-black font-mono text-cyan-300 flex items-center gap-1.5">
                      Tier {contractTiers.filter(t => t.isUnlocked).length}
                      <span className="text-[10px] text-slate-500 font-normal">of 6 Active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Emergent Design Language Studio */}
              <div className="rounded-2xl bg-slate-900/85 border border-slate-700/70 p-5 shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-pink-400">
                      <Palette size={16} />
                      <span className="text-xs font-black font-mono uppercase tracking-wider">
                        Design Language DNA
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/30 text-pink-300">
                      {dimensions.design?.score || 30} / 100
                    </span>
                  </div>

                  <div className="text-lg font-black font-mono text-white mb-1.5">
                    {designLanguage.title}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {designLanguage.aestheticSignature}
                  </p>

                  <div className="space-y-1.5 mb-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Signature Styling Elements:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {designLanguage.definingTraits.map((trait, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300"
                        >
                          • {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-pink-950/30 border border-pink-500/30">
                  <div className="text-[10px] font-bold text-pink-300 uppercase tracking-wide">
                    Styling Market Effect
                  </div>
                  <div className="text-xs text-slate-200 font-medium">
                    {designLanguage.stylingBonusDescription}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Teaser Grid: 4 Key Economic Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
              {/* Pillar 1: Talent Attraction */}
              <div
                onClick={() => setActiveMainSection("economics")}
                className="cursor-pointer p-4 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 transition-all shadow-md group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
                    <GraduationCap size={16} />
                  </div>
                  <ChevronRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employer Reputation</div>
                <div className="text-base font-black font-mono text-white mt-0.5">
                  -{hiringModel.reputationDiscountPercent}% Salary Discount
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  Engineers accept career prestige over inflated cash.
                </div>
              </div>

              {/* Pillar 2: Construction Economics */}
              <div
                onClick={() => setActiveMainSection("economics")}
                className="cursor-pointer p-4 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 transition-all shadow-md group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                    <Building2 size={16} />
                  </div>
                  <ChevronRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Industrial Trust</div>
                <div className="text-base font-black font-mono text-white mt-0.5">
                  -{constructionModel.discountPercent}% Building Cost
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  Civil contractors offer lower bids with zero risk markups.
                </div>
              </div>

              {/* Pillar 3: Supplier Terms */}
              <div
                onClick={() => setActiveMainSection("economics")}
                className="cursor-pointer p-4 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 transition-all shadow-md group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                    <Truck size={16} />
                  </div>
                  <ChevronRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Supplier Relationship</div>
                <div className="text-base font-black font-mono text-white mt-0.5">
                  {supplierModel.creditTerms}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  -{supplierModel.componentDiscountPercent}% Parts Cost & 0-day backlog queue.
                </div>
              </div>

              {/* Pillar 4: Contract Tiers */}
              <div
                onClick={() => setActiveMainSection("contracts")}
                className="cursor-pointer p-4 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 transition-all shadow-md group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                    <FileCheck size={16} />
                  </div>
                  <ChevronRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">B2B Contract Authority</div>
                <div className="text-base font-black font-mono text-white mt-0.5">
                  {contractTiers.filter(t => t.isUnlocked).length} of 6 Tiers Open
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  From local privateers to Works F1 & OEM powertrains.
                </div>
              </div>
            </div>

            {/* Quick 10 Audiences Snapshot preview */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black font-mono tracking-wider text-white uppercase flex items-center gap-2">
                    <Users size={16} className="text-amber-400" />
                    Key Audiences Perception Snapshot
                  </h3>
                  <p className="text-xs text-slate-400">
                    Different groups judge your company independently according to their strategic priorities.
                  </p>
                </div>
                <button
                  onClick={() => setActiveMainSection("audiences")}
                  className="text-xs font-mono font-bold text-amber-400 hover:underline flex items-center gap-1"
                >
                  View All 10 Audiences <ChevronRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {audiences.slice(0, 5).map((aud) => (
                  <div key={aud.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-white truncate">{aud.name}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${aud.level.badgeBg} ${aud.level.textColor}`}>
                          {aud.level.label}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400">Score</span>
                        <span className="font-extrabold text-white">{aud.score} / 100</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 rounded-full"
                          style={{ width: `${aud.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            3. ECONOMIC IMPACT STATION (CALCULATORS)
        ───────────────────────────────────────────────────────────── */}
        {activeMainSection === "economics" && (
          <div className="flex flex-col gap-5">
            <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 flex items-start gap-3">
              <Calculator size={22} className="text-blue-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold font-mono text-white">
                  Real Economic Mechanics: Reputation As Corporate Leverage
                </div>
                <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Reputation is an active economic engine in your company. High corporate prestige reduces hiring salaries,
                  lowers civil construction bids for factories and wind tunnels, and secures favorable payment credit from suppliers.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Station 1: Talent Attraction & Salary Economics */}
              <div className="rounded-2xl bg-slate-900/85 border border-slate-700/70 p-5 shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-blue-400">
                      <GraduationCap size={18} />
                      <span className="text-sm font-black font-mono uppercase tracking-wider">
                        1. Talent Acquisition & Salary Economics
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/40">
                      Employer Score: {dimensions.employer?.score || 25} / 100
                    </span>
                  </div>

                  {/* Interactive Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Select Specialized Role:
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-400"
                      >
                        <option value="Powertrain Development Engineer">Powertrain Development Engineer</option>
                        <option value="F1 Aerodynamicist & CFD Modeler">F1 Aerodynamicist & CFD Modeler</option>
                        <option value="Chassis Kinematics Specialist">Chassis Kinematics Specialist</option>
                        <option value="Chief Vehicle Designer">Chief Vehicle Designer</option>
                        <option value="Dyno Engine Calibration Master">Dyno Engine Calibration Master</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Seniority / Talent Tier:
                      </label>
                      <select
                        value={selectedTier}
                        onChange={(e) => setSelectedTier(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-400"
                      >
                        <option value="Junior">Junior Graduate</option>
                        <option value="Senior">Senior Specialist</option>
                        <option value="Lead">Lead Engineer</option>
                        <option value="Principal">Principal Architect</option>
                        <option value="Chief Specialist">Chief Technical Officer</option>
                      </select>
                    </div>
                  </div>

                  {/* Formula Breakdown */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 mb-4 font-mono text-xs">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Base Industry Benchmark Salary:</span>
                      <span className="text-white">${hiringModel.baseSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-amber-400">
                      <span>Talent Rarity Premium (+{hiringModel.talentPremiumPercent}%):</span>
                      <span>+${Math.round(hiringModel.baseSalary * (hiringModel.talentPremiumPercent / 100)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800">
                      <span>Market Comp (Unknown Startup):</span>
                      <span className="line-through text-slate-500">${hiringModel.marketSalaryWithoutReputation.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-400 font-bold">
                      <span>Company Prestige Discount (-{hiringModel.reputationDiscountPercent}%):</span>
                      <span>-${hiringModel.annualSavingsPerHire.toLocaleString()} / yr</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Result Box */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-950/40 to-slate-950 border border-blue-500/40">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">Actual Offer Accepted</div>
                      <div className="text-xl font-black font-mono text-white">
                        ${hiringModel.actualSalaryWithReputation.toLocaleString()}
                        <span className="text-xs text-slate-400 font-normal"> / year</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase text-emerald-400">Annual Payroll Savings</div>
                      <div className="text-base font-black font-mono text-emerald-300">
                        +${hiringModel.annualSavingsPerHire.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-blue-300 mt-2 font-mono">
                    Talent Pool Quality: <span className="font-bold text-white">{hiringModel.talentPoolQuality}</span>
                  </div>
                </div>
              </div>

              {/* Station 2: Industrial Construction & Facility Expansion */}
              <div className="rounded-2xl bg-slate-900/85 border border-slate-700/70 p-5 shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-amber-400">
                      <Building2 size={18} />
                      <span className="text-sm font-black font-mono uppercase tracking-wider">
                        2. HQ & Factory Civil Construction Cost
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
                      Industrial Trust: {dimensions.industrial?.score || 22} / 100
                    </span>
                  </div>

                  {/* Project Selector */}
                  <div className="mb-4">
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Target Construction Program:
                    </label>
                    <select
                      value={constructionProjectQuote}
                      onChange={(e) => setConstructionProjectQuote(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value={100000000}>Master Automotive Assembly Plant ($100,000,000)</option>
                      <option value={45000000}>Full-Scale 1:1 Wind Tunnel Complex ($45,000,000)</option>
                      <option value={25000000}>Advanced Powertrain Dyno Facility ($25,000,000)</option>
                      <option value={15000000}>Global Headquarters Campus Expansion ($15,000,000)</option>
                    </select>
                  </div>

                  {/* Breakdown */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 mb-4 font-mono text-xs">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Standard Contractor Market Quote:</span>
                      <span className="text-white">${constructionModel.baseQuote.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-cyan-400">
                      <span>Competitive Contractor Bids:</span>
                      <span>{constructionModel.contractorBidsCount} Prime Civil Engineering Firms</span>
                    </div>
                    <div className="flex justify-between items-center text-amber-300">
                      <span>Construction Execution Speed:</span>
                      <span>{constructionModel.speedMultiplier}x Priority Delivery</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-400 font-bold pt-1 border-t border-slate-800">
                      <span>Industrial Trust Discount (-{constructionModel.discountPercent}%):</span>
                      <span>-${constructionModel.costSavings.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Result Box */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-950 border border-amber-500/40">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">Final Approved Construction Cost</div>
                      <div className="text-xl font-black font-mono text-white">
                        ${constructionModel.finalCost.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase text-emerald-400">Direct Capital Savings</div>
                      <div className="text-base font-black font-mono text-emerald-300">
                        +${constructionModel.costSavings.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-amber-300 mt-2 font-mono">
                    Result: Contractors waive delay insurance surcharges due to proven corporate credit.
                  </div>
                </div>
              </div>

              {/* Station 3: Supplier Economics & Parts Allocation */}
              <div className="rounded-2xl bg-slate-900/85 border border-slate-700/70 p-5 shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Truck size={18} />
                      <span className="text-sm font-black font-mono uppercase tracking-wider">
                        3. Supplier Terms & Component Pricing
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                      Supplier Trust: {dimensions.supplier?.score || 30} / 100
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Tier-1 component suppliers (transmissions, ECUs, turbochargers, brake calipers) prioritize reliable clients.
                    A trusted company enjoys wholesale discounts, generous deferred payment terms, and zero backlog during supply shocks.
                  </p>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400">Component Unit Cost Discount:</span>
                      <span className="font-extrabold text-emerald-400">
                        -{supplierModel.componentDiscountPercent}% across all catalog orders
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400">Payment Invoicing Credit Terms:</span>
                      <span className="font-extrabold text-cyan-300">
                        {supplierModel.creditTerms}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400">Supply Shortage Allocation Status:</span>
                      <span className="font-extrabold text-amber-300">
                        {supplierModel.shortagePriority}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-slate-300 font-mono">
                  Benefit: Smooth continuous assembly line uptime with no factory halts for missing parts.
                </div>
              </div>

              {/* Station 4: Commercial Trust & Financial Credit */}
              <div className="rounded-2xl bg-slate-900/85 border border-slate-700/70 p-5 shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Briefcase size={18} />
                      <span className="text-sm font-black font-mono uppercase tracking-wider">
                        4. Commercial Trust & Financing Rates
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                      Commercial Trust: {dimensions.commercialTrust?.score || 30} / 100
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Banks, bondholders, and commercial partners evaluate balance sheet integrity and contract fulfillment.
                  </p>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400">Corporate Debt Interest Rate:</span>
                      <span className="font-extrabold text-emerald-400">
                        {(8.5 - ((dimensions.commercialTrust?.score || 30) / 100) * 4.5).toFixed(2)}% APR
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400">Institutional Credit Rating:</span>
                      <span className="font-extrabold text-amber-300">
                        {(dimensions.commercialTrust?.score || 30) >= 80 ? "AAA (Prime)" : (dimensions.commercialTrust?.score || 30) >= 60 ? "A+ (Investment Grade)" : "BBB- (Moderate Risk)"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400">Contract Default Deposit Requirement:</span>
                      <span className="font-extrabold text-cyan-300">
                        {(dimensions.contracts?.score || 28) >= 65 ? "Waived (0% Deposit Required)" : "35% Upfront Cash Escrow"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-slate-300 font-mono">
                  Enables rapid debt-funded capital expansion into new vehicle segments without dilution.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            4. CONTRACT TIERS LADDER (TIERS 1–6)
        ───────────────────────────────────────────────────────────── */}
        {activeMainSection === "contracts" && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
              <FileCheck size={22} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold font-mono text-white">
                  6-Tier Contract Progression Hierarchy
                </div>
                <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Contracts are not randomly granted. As your company proves its reliability, engineering depth, and manufacturing consistency,
                  you unlock progressively more lucrative and demanding enterprise contract tiers.
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {contractTiers.map((tier) => (
                <div
                  key={tier.tierNumber}
                  className={`rounded-2xl p-5 border transition-all ${
                    tier.isUnlocked
                      ? "bg-slate-900/85 border-emerald-500/50 shadow-xl shadow-emerald-500/5"
                      : "bg-slate-950/70 border-slate-800 opacity-70"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        tier.isUnlocked
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/50"
                          : "bg-slate-800 text-slate-500 border border-slate-700"
                      }`}>
                        {tier.tierNumber}
                      </div>
                      <div>
                        <div className="text-base font-black font-mono text-white flex items-center gap-2">
                          {tier.name}
                          {tier.isUnlocked ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                              Unlocked
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                              <Lock size={10} /> Locked
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {tier.description}
                        </div>
                      </div>
                    </div>

                    {/* Requirements checklist */}
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      {Object.entries(tier.requiredScores).map(([dim, reqScore]) => {
                        const currentVal = dim === "overall" ? overallReputation : (dimensions[dim as ReputationDimensionKey]?.score || 0);
                        const passed = currentVal >= (reqScore || 0);
                        return (
                          <span
                            key={dim}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] ${
                              passed
                                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                                : "bg-rose-950/40 border-rose-500/40 text-rose-300"
                            }`}
                          >
                            {dim.toUpperCase()}: {currentVal} / {reqScore}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Opportunities granted */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Unlocked B2B Contract Opportunities:
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {tier.unlockedOpportunities.map((opp, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800/90 text-xs text-slate-300 font-mono flex items-center gap-2"
                        >
                          <CheckCircle2 size={13} className={tier.isUnlocked ? "text-emerald-400" : "text-slate-600"} />
                          <span className="truncate">{opp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            5. 10 KEY AUDIENCES VIEW
        ───────────────────────────────────────────────────────────── */}
        {activeMainSection === "audiences" && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
              <Users size={22} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold font-mono text-white">
                  Segment-Specific Audience Trust Breakdown
                </div>
                <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  No company has a single universal opinion. Car enthusiasts admire track lap times, fleet operators obsess over downtime,
                  and suppliers look at payment history. Your company's decisions naturally attract certain audiences while leaving others neutral.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {audiences.map((aud) => (
                <div
                  key={aud.id}
                  className="rounded-2xl bg-slate-900/85 border border-slate-800 p-5 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-base font-black font-mono text-white">{aud.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{aud.description}</div>
                      </div>
                      <span className={`text-xs font-mono font-black uppercase px-2.5 py-1 rounded-lg ${aud.level.badgeBg} border ${aud.level.borderColor} ${aud.level.textColor}`}>
                        {aud.level.label}
                      </span>
                    </div>

                    <div className="my-4">
                      <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                        <span className="text-slate-400">Trust & Approval Score:</span>
                        <span className="text-lg font-black text-white">{aud.score} / 100</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-700"
                          style={{ width: `${aud.score}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Primary Strategic Drivers:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {aud.primaryDrivers.map((driver, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300"
                        >
                          {driver}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            6. 17 SPECIALIZED TRACKS MATRIX
        ───────────────────────────────────────────────────────────── */}
        {activeMainSection === "specialized" && (
          <div className="flex flex-col gap-4">
            {/* Category Filter Pills */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {[
                  { id: "all", label: "All 17 Tracks" },
                  { id: "capability", label: "Engineering & Dynamics (6)" },
                  { id: "operations", label: "Operations & Business (4)" },
                  { id: "market", label: "Market & Ownership (4)" },
                  { id: "legacy", label: "Legacy & Lore (3)" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTrackCategoryFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                      trackCategoryFilter === f.id
                        ? "bg-amber-500/20 text-amber-300 border border-amber-400/60"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {devMode && (
                <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                  <Sparkle size={12} /> Dev Overrides Enabled
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDimensionKeys.map((key) => {
                const meta = REPUTATION_DIMENSIONS_META[key];
                const data = dimensions[key] || { score: 30, trendQuarterly: 0.2, historicalPeak: 30 };
                const level = getReputationLevel(data.score);

                return (
                  <div
                    key={key}
                    onClick={() => setSelectedDimension(key)}
                    className={`cursor-pointer rounded-2xl p-4.5 border transition-all shadow-lg flex flex-col justify-between group ${
                      selectedDimension === key
                        ? "bg-slate-900 border-amber-400 shadow-amber-500/10"
                        : "bg-slate-900/75 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-xl bg-slate-950 border border-slate-800 ${meta.accentColor}`}>
                            {renderDimensionIcon(meta.iconName, "w-4 h-4")}
                          </div>
                          <div>
                            <div className="text-sm font-black font-mono text-white group-hover:text-amber-300 transition-colors">
                              {meta.label}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono capitalize">
                              {meta.category} • {meta.decaySpeed} decay
                            </div>
                          </div>
                        </div>

                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${level.badgeBg} ${level.textColor} border ${level.borderColor}`}>
                          {level.label}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 my-2 leading-relaxed">
                        {meta.description}
                      </p>

                      <div className="my-3">
                        <div className="flex justify-between items-center text-xs font-mono mb-1">
                          <span className="text-slate-400">Reputation Score</span>
                          <span className="text-base font-black text-white">{data.score} / 100</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                            style={{ width: `${data.score}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                      <div className="flex items-center gap-1 text-slate-400">
                        <TrendingUp size={12} className={data.trendQuarterly >= 0 ? "text-emerald-400" : "text-rose-400"} />
                        <span>Trend: {data.trendQuarterly >= 0 ? `+${data.trendQuarterly}` : data.trendQuarterly}/qtr</span>
                      </div>
                      <div className="text-slate-500">
                        Peak: <span className="text-slate-300 font-bold">{data.historicalPeak}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Deep-Dive Drawer for Selected Dimension */}
            <div className="mt-4 p-5 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-slate-950 border border-slate-800 ${selectedMeta.accentColor}`}>
                    {renderDimensionIcon(selectedMeta.iconName, "w-6 h-6")}
                  </div>
                  <div>
                    <h3 className="text-lg font-black font-mono text-white">
                      {selectedMeta.label} Detailed Telemetry & Gameplay Link
                    </h3>
                    <p className="text-xs text-slate-400">
                      {selectedMeta.description}
                    </p>
                  </div>
                </div>

                {devMode && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => modifyDimension(selectedDimension, -5, "Dev Penalty")}
                      className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => modifyDimension(selectedDimension, +5, "Dev Boost")}
                      className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold"
                    >
                      +5
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-800 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">What Generates This:</div>
                  <div className="text-slate-200 mt-1 leading-relaxed">{selectedMeta.whatCreatesIt}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Economic System Impact:</div>
                  <div className="text-emerald-300 mt-1 leading-relaxed font-semibold">{selectedMeta.economicImpact}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Decay Characteristics:</div>
                  <div className="text-slate-200 mt-1 leading-relaxed">
                    Decay Speed: <span className="font-bold uppercase text-amber-400">{selectedMeta.decaySpeed}</span>. Requires continuous activity to sustain.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            7. HERITAGE HALL OF FAME & CRISIS MITIGATION ROOM
        ───────────────────────────────────────────────────────────── */}
        {activeMainSection === "heritage" && (
          <div className="flex flex-col gap-6">
            {/* Strategic Shocks & Crisis Mitigation Boardroom */}
            <div className="rounded-2xl bg-gradient-to-br from-rose-950/30 via-slate-900/90 to-slate-950 border border-rose-500/40 p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5 text-rose-400">
                  <AlertTriangle size={18} />
                  <span className="text-sm font-black font-mono uppercase tracking-wider">
                    Executive Crisis Mitigation Boardroom
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Protecting Brand Equity During Industrial Shocks
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl mb-4">
                When component failures, quality recalls, or press controversies occur, an established company survives through swift executive action.
                Execute one of the pre-authorized corporate mitigation playbooks below to restore trust.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => resolveCrisis("recall_and_warranty")}
                  className="p-3.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-700/80 hover:border-emerald-400 text-left transition-all group"
                >
                  <div className="text-xs font-bold font-mono text-white group-hover:text-emerald-300 transition-colors">
                    1. 100% Free Recall & 10-Yr Warranty
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Institutes transparent customer recall. Restores Reliability (+12) & Customer Service (+15).
                  </div>
                </button>

                <button
                  onClick={() => resolveCrisis("quality_taskforce")}
                  className="p-3.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-700/80 hover:border-cyan-400 text-left transition-all group"
                >
                  <div className="text-xs font-bold font-mono text-white group-hover:text-cyan-300 transition-colors">
                    2. Emergency QA Factory Taskforce
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Overhauls robotic tooling and calibration. Restores Manufacturing Quality (+10) & Industrial Trust (+6).
                  </div>
                </button>

                <button
                  onClick={() => resolveCrisis("press_rebuttal")}
                  className="p-3.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-700/80 hover:border-amber-400 text-left transition-all group"
                >
                  <div className="text-xs font-bold font-mono text-white group-hover:text-amber-300 transition-colors">
                    3. Public Dyno Telemetry Briefing
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Releases raw benchmark telemetry to media. Restores Engineering (+6) & Press Sentiment.
                  </div>
                </button>
              </div>
            </div>

            {/* Level 1 & Level 2 Heritage Hall of Fame */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Level 1: Acclaimed Components */}
              <div className="rounded-2xl bg-slate-900/85 border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-amber-400">
                      <Cog size={16} />
                      <span className="text-sm font-black font-mono uppercase tracking-wider">
                        Level 1: Acclaimed Proprietary Technologies
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{components.length} Acclaimed</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Individual powertrain units, spaceframes, and aerodynamics develop legendary status over decades of proven competition.
                  </p>

                  <div className="space-y-3">
                    {components.map((comp) => (
                      <div key={comp.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-start">
                        <div>
                          <div className="text-xs font-bold text-white font-mono flex items-center gap-2">
                            {comp.name}
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {comp.tier}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {comp.subsystem} • Year {comp.unlockedYear}
                          </div>
                          <div className="text-[11px] text-slate-300 mt-1">
                            {comp.acclaimDescription}
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-3">
                          <div className="text-xs font-mono font-bold text-amber-400">
                            {comp.score} / 100
                          </div>
                          <div className="text-[9px] text-slate-500 uppercase font-mono">Fame Index</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Level 2: Historical Vehicle Legacies */}
              <div className="rounded-2xl bg-slate-900/85 border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Car size={16} />
                      <span className="text-sm font-black font-mono uppercase tracking-wider">
                        Level 2: Historic Vehicle Legacies
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{vehicles.length} Models Recorded</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Every production model forms a permanent chapter in brand mythology, feeding long-term prestige.
                  </p>

                  <div className="space-y-3">
                    {vehicles.map((veh) => (
                      <div key={veh.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-start">
                        <div>
                          <div className="text-xs font-bold text-white font-mono flex items-center gap-2">
                            {veh.modelName}
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              {veh.tier}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Launched {veh.launchYear} • {veh.productionUnits.toLocaleString()} Units Built
                          </div>
                          <div className="text-[11px] text-slate-300 mt-1">
                            {veh.summary}
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-3">
                          <div className="text-xs font-mono font-bold text-cyan-300">
                            {veh.overallScore} / 100
                          </div>
                          <div className="text-[9px] text-slate-500 uppercase font-mono">Legacy Rating</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Press Headlines Ticker */}
            <div className="rounded-2xl bg-slate-900/85 border border-slate-800 p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <Newspaper size={16} />
                  <span className="text-xs font-black font-mono uppercase tracking-wider">
                    Automotive Wire & Press Archives
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{events.length} Historical Dispatches</span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {events.map((evt) => (
                  <div key={evt.id} className="py-2.5 flex items-start justify-between gap-4 text-xs font-mono">
                    <div>
                      <div className="text-slate-200 font-bold">{evt.pressHeadline}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {evt.mediaOutlet} • {evt.timestamp}
                      </div>
                    </div>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded shrink-0 ${
                      evt.impactType === "positive"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : evt.impactType === "negative"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    }`}>
                      {evt.impactType}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </SubPageLayout>
  );
};
