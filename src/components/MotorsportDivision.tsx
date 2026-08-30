// ===================================================================
// MOTORSPORT DIVISION — Master Motorsport Hub & Multi-Category Racing
// ===================================================================
import React, { useState, useMemo, lazy, Suspense, memo } from "react";
import {
  Trophy, Plus, Users, ArrowRightLeft,
  Medal, AlertTriangle, Zap, Gauge, Shield,
  Play, History, BookOpen, Target, BarChart3,
  Star, CheckCircle, XCircle, Info, ChevronRight,
  Search, TrendingUp, Award, Settings, Wrench, Radio, Calendar,
  Building2, Gavel, Flag, Flame, Layers, Filter, ChevronDown
} from "lucide-react";
import { useCompany } from "../state/CompanyContext";
import { useDesign } from "../state/DesignContext";
import { getSeasonCalendar } from "../sim/motorsportEngine";
import { TRACKS } from "../sim/constants";
import type { MotorsportCategory, MotorsportTeam } from "../sim/types";
import { playHMIClickSound, playHMITabSound } from "../utils/hmiSoundSynth";

// Fast-loaded core components
import { TeamCard, CATEGORY_LABELS, CATEGORY_COLORS } from "./motorsport/TeamCard";

// Code-split lazy loaded secondary panels for instant 60fps performance
const CreateTeamForm = lazy(() => import("./motorsport/CreateTeamForm").then(m => ({ default: m.CreateTeamForm })));
const DriverMarket = lazy(() => import("./motorsport/DriverMarket").then(m => ({ default: m.DriverMarket })));
const StrategyPanel = lazy(() => import("./motorsport/StrategyPanel").then(m => ({ default: m.StrategyPanel })));
const SeasonSimulator = lazy(() => import("./motorsport/SeasonSimulator").then(m => ({ default: m.SeasonSimulator })));
const AnalyticsPanel = lazy(() => import("./motorsport/AnalyticsPanel").then(m => ({ default: m.AnalyticsPanel })));
const TechTransferPanel = lazy(() => import("./motorsport/TechTransferPanel").then(m => ({ default: m.TechTransferPanel })));
const HistoryTimeline = lazy(() => import("./motorsport/HistoryTimeline").then(m => ({ default: m.HistoryTimeline })));
const HQInfrastructurePanel = lazy(() => import("./motorsport/HQInfrastructurePanel").then(m => ({ default: m.HQInfrastructurePanel })));
const StaffPitCrewPanel = lazy(() => import("./motorsport/StaffPitCrewPanel").then(m => ({ default: m.StaffPitCrewPanel })));
const PartsRAndDPanel = lazy(() => import("./motorsport/PartsRAndDPanel").then(m => ({ default: m.PartsRAndDPanel })));
const PoliticalVotingPanel = lazy(() => import("./motorsport/PoliticalVotingPanel").then(m => ({ default: m.PoliticalVotingPanel })));
const GoverningBodyPanel = lazy(() => import("./motorsport/GoverningBodyPanel").then(m => ({ default: m.GoverningBodyPanel })));
const CalendarViewPanel = lazy(() => import("./motorsport/CalendarViewPanel").then(m => ({ default: m.CalendarViewPanel })));
const RegulationGuidePanel = lazy(() => import("./motorsport/RegulationGuidePanel").then(m => ({ default: m.RegulationGuidePanel })));
const SeasonSummaryPanel = lazy(() => import("./motorsport/SeasonSummaryPanel").then(m => ({ default: m.SeasonSummaryPanel })));
const LiveRaceModal = lazy(() => import("./motorsport/LiveRaceModal").then(m => ({ default: m.LiveRaceModal })));
const F1EntryWizardModal = lazy(() => import("./f1/F1EntryWizardModal").then(m => ({ default: m.F1EntryWizardModal })));
const HypercarEntryWizardModal = lazy(() => import("./hypercar/HypercarEntryWizardModal").then(m => ({ default: m.HypercarEntryWizardModal })));

// Heavy 3D constructor studios
const F1ConstructorMasterApp = lazy(() =>
  import("./f1/F1ConstructorMasterApp").then(m => ({ default: m.F1ConstructorMasterApp }))
);
const HypercarConstructorMasterApp = lazy(() =>
  import("./hypercar/HypercarConstructorMasterApp").then(m => ({ default: m.HypercarConstructorMasterApp }))
);
const FiaHomologationPanel = lazy(() =>
  import("./motorsport/FiaHomologationPanel").then(m => ({ default: m.FiaHomologationPanel }))
);
const LivePitWallPanel = lazy(() =>
  import("./motorsport/LivePitWallPanel").then(m => ({ default: m.LivePitWallPanel }))
);

export type MotorsportTabId =
  | "teams"
  | "f1_workshop"
  | "hypercar_workshop"
  | "summary"
  | "hq"
  | "staff"
  | "parts"
  | "votes"
  | "guide"
  | "strategy"
  | "calendar"
  | "governing"
  | "season"
  | "analytics"
  | "transfer"
  | "history"
  | "homologation"
  | "pitwall";

interface HubCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  tabs: { id: MotorsportTabId; label: string; badge?: string }[];
}

const HUB_CATEGORIES: HubCategory[] = [
  {
    id: "race_ops",
    name: "Race Operations",
    icon: <Flag size={14} className="text-amber-400" />,
    tabs: [
      { id: "teams", label: "Teams & Drivers" },
      { id: "pitwall", label: "Live 3D Pit Wall", badge: "LIVE" },
      { id: "season", label: "Season Simulator" },
      { id: "calendar", label: "Race Calendar" },
    ],
  },
  {
    id: "constructors",
    name: "Elite Constructors",
    icon: <Flame size={14} className="text-amber-400" />,
    tabs: [
      { id: "f1_workshop", label: "🏎️ F1 Constructor Studio", badge: "FIA" },
      { id: "hypercar_workshop", label: "🏆 Hypercar WEC Studio", badge: "24H" },
      { id: "homologation", label: "FIA Homologation & BoP" },
    ],
  },
  {
    id: "engineering",
    name: "Factory HQ & Engineering",
    icon: <Building2 size={14} className="text-amber-400" />,
    tabs: [
      { id: "hq", label: "HQ Infrastructure" },
      { id: "staff", label: "Staff & Pit Crew" },
      { id: "parts", label: "Parts R&D" },
      { id: "strategy", label: "Race Strategy" },
      { id: "transfer", label: "Tech Transfer" },
    ],
  },
  {
    id: "governance",
    name: "Governance & Analytics",
    icon: <Gavel size={14} className="text-yellow-400" />,
    tabs: [
      { id: "governing", label: "Governing Authority" },
      { id: "votes", label: "Political Voting" },
      { id: "summary", label: "Season Summary" },
      { id: "analytics", label: "Analytics Lab" },
      { id: "guide", label: "Regulations & Guides" },
      { id: "history", label: "Trophy History" },
    ],
  },
];

const SERIES_FILTERS: { id: "all" | MotorsportCategory | "works"; label: string }[] = [
  { id: "all", label: "All Series" },
  { id: "formula", label: "Formula 1" },
  { id: "hypercar", label: "Hypercar WEC" },
  { id: "gt", label: "GT Series" },
  { id: "touring", label: "Touring Car" },
  { id: "rally", label: "Rally" },
  { id: "endurance", label: "Endurance" },
];

function MotorsportDivisionComponent() {
  const {
    company, releaseMotorsportDriver, renewMotorsportContract,
    simulateMotorsportSeason,
  } = useCompany();
  const { sim } = useDesign();

  const [activeTab, setActiveTab] = useState<MotorsportTabId>("teams");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showF1EntryWizard, setShowF1EntryWizard] = useState(false);
  const [f1InitialMode, setF1InitialMode] = useState<"CONSTRUCTION_CAD" | "RD_LABS" | "GARAGE_SETUP">("CONSTRUCTION_CAD");
  const [showHypercarEntryWizard, setShowHypercarEntryWizard] = useState(false);
  const [hypercarInitialMode, setHypercarInitialMode] = useState<"assembly" | "rd_labs" | "garage" | "racing">("assembly");
  const [showLiveRaceModal, setShowLiveRaceModal] = useState(false);
  const [liveRaceState, setLiveRaceState] = useState<any | null>(null);

  // Performance Filters for Team Roster
  const [seriesFilter, setSeriesFilter] = useState<"all" | MotorsportCategory | "works">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleTeamCount, setVisibleTeamCount] = useState(8);

  const selectedTeam = useMemo(() => {
    return company.motorsport.teams.find(t => t.id === selectedTeamId) ?? company.motorsport.teams[0] ?? null;
  }, [company.motorsport.teams, selectedTeamId]);

  const activeCategory = useMemo(() => {
    return HUB_CATEGORIES.find(cat => cat.tabs.some(t => t.id === activeTab)) || HUB_CATEGORIES[0];
  }, [activeTab]);

  const filteredTeams = useMemo(() => {
    let list = company.motorsport.teams;
    if (seriesFilter !== "all") {
      list = list.filter(t => t.category === seriesFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q));
    }
    return list;
  }, [company.motorsport.teams, seriesFilter, searchQuery]);

  const visibleTeams = useMemo(() => {
    return filteredTeams.slice(0, visibleTeamCount);
  }, [filteredTeams, visibleTeamCount]);

  const handleStepLap = () => {
    setLiveRaceState((prev: any) => {
      if (!prev) return null;
      const nextLap = prev.lap + 1;
      return {
        ...prev,
        lap: Math.min(prev.totalLaps, nextLap),
        feed: [
          {
            time: `LAP ${nextLap}`,
            text: nextLap % 4 === 0 ? "Apex Racing sets personal best sector 2 time!" : "Cars running in high slipstream train down straight.",
            type: nextLap % 4 === 0 ? "fastest" : "info",
          },
          ...prev.feed,
        ],
      };
    });
  };

  const handleFinishLiveRace = () => {
    setShowLiveRaceModal(false);
    simulateMotorsportSeason(sim.peakPower, sim.weight, sim.downforce / 100, sim.reliability);
  };

  const { totalWins, totalTitles, totalFastestLaps } = useMemo(() => {
    let wins = 0, titles = 0, fl = 0;
    for (const t of company.motorsport.teams) {
      wins += t.wins;
      titles += t.championships;
      fl += t.fastestLaps;
    }
    return { totalWins: wins, totalTitles: titles, totalFastestLaps: fl };
  }, [company.motorsport.teams]);

  return (
    <div className="space-y-4 animate-fade-in text-white">
      {/* Header Dashboard Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/50 border border-yellow-500/30 shadow-2xl relative overflow-hidden text-white">
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{ background: "radial-gradient(ellipse at top right, rgba(251,191,36,0.45), transparent 60%)" }}
        />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500/30 to-amber-600/30 border border-yellow-400/50 shadow-[0_0_20px_rgba(234,179,8,0.3)] shrink-0">
              <Trophy size={24} className="text-yellow-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black text-yellow-400 uppercase tracking-widest">WORLD MOTORSPORT DIVISION</span>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/25 border border-amber-400/50 text-amber-300">
                  Season {company.motorsport.currentSeason}
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-0.5 tracking-wide">Grand Prix Racing Operations & Engineering</h2>
              <p className="text-xs text-amber-100/80">Manage race teams, elite constructor championships, factory HQ & technical BoP regulations.</p>
            </div>
          </div>

          {/* Key Championship Statistics */}
          <div className="grid grid-cols-4 gap-2 text-center bg-black/70 p-3 rounded-2xl border border-white/10 shrink-0 shadow-lg">
            <div className="px-2.5">
              <div className="text-xl font-black font-mono text-amber-300">{company.motorsport.teams.length}</div>
              <div className="text-[9px] text-amber-200/60 uppercase font-bold tracking-wider">Teams</div>
            </div>
            <div className="px-2.5 border-l border-white/10">
              <div className="text-xl font-black font-mono text-emerald-400">{totalWins}</div>
              <div className="text-[9px] text-amber-200/60 uppercase font-bold tracking-wider">Wins</div>
            </div>
            <div className="px-2.5 border-l border-white/10">
              <div className="text-xl font-black font-mono text-yellow-400">{totalTitles}</div>
              <div className="text-[9px] text-amber-200/60 uppercase font-bold tracking-wider">Titles</div>
            </div>
            <div className="px-2.5 border-l border-white/10">
              <div className="text-xl font-black font-mono text-amber-400">{totalFastestLaps}</div>
              <div className="text-[9px] text-amber-200/60 uppercase font-bold tracking-wider">FL</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Banners (Only displayed when outside full-screen constructor studios) */}
      {activeTab !== "f1_workshop" && activeTab !== "hypercar_workshop" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* F1 Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-cyan-950/70 to-amber-950/80 border border-amber-500/40 shadow-xl flex items-center justify-between gap-4 hover:border-amber-400/70 transition-all text-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/25 border border-amber-400/60 flex items-center justify-center font-mono font-black text-amber-300 text-sm shadow-[0_0_15px_rgba(34,211,238,0.3)] shrink-0">
                F1
              </div>
              <div>
                <div className="text-sm font-black text-white flex items-center gap-2">
                  <span>Formula 1 Constructor Studio</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-400/50 font-bold">
                    FIA Master
                  </span>
                </div>
                <p className="text-xs text-amber-100/80 mt-0.5">Open-wheel monocoque, V6 turbo-hybrid, MGU-K & aero floor.</p>
              </div>
            </div>

            <button
              onClick={() => {
                playHMIClickSound();
                setShowF1EntryWizard(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-400/30 hover:shadow-cyan-400/50 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Enter F1</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Hypercar Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-amber-950/70 to-orange-950/80 border border-amber-500/40 shadow-xl flex items-center justify-between gap-4 hover:border-amber-400/70 transition-all text-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/25 border border-amber-400/60 flex items-center justify-center font-mono font-black text-amber-300 text-sm shadow-[0_0_15px_rgba(251,191,36,0.3)] shrink-0">
                LMH
              </div>
              <div>
                <div className="text-sm font-black text-white flex items-center gap-2">
                  <span>Hypercar WEC Championship</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-400/50 font-bold">
                    24H Le Mans
                  </span>
                </div>
                <p className="text-xs text-amber-100/80 mt-0.5">Enclosed carbon cockpit, e-AWD MGU, cooling & endurance setup.</p>
              </div>
            </div>

            <button
              onClick={() => {
                playHMIClickSound();
                setShowHypercarEntryWizard(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-400/30 hover:shadow-amber-400/50 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Enter Hypercar</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Categorized 4-Tier Master Motorsport Navigation Bar */}
      <div className="space-y-2.5 bg-amber-900/40 p-3 rounded-2xl border border-white/15 shadow-xl backdrop-blur-2xl text-white">
        {/* Category Header Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {HUB_CATEGORIES.map((cat) => {
            const isSelected = activeCategory.id === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  playHMITabSound();
                  setActiveTab(cat.tabs[0].id);
                }}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                  isSelected
                    ? "bg-amber-500 text-black border-amber-400 shadow-lg shadow-cyan-500/30 font-black"
                    : "bg-amber-800/35/80 border-white/10 text-amber-50 hover:bg-amber-700/40 hover:text-white"
                }`}
              >
                {cat.icon}
                <span className="truncate">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-tabs for the Active Category */}
        <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
          {activeCategory.tabs.map((tab) => {
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playHMIClickSound();
                  setActiveTab(tab.id);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border cursor-pointer ${
                  isTabActive
                    ? "bg-amber-500/25 border-amber-400 text-amber-300 shadow-md shadow-cyan-500/20 font-extrabold"
                    : "bg-amber-800/35/60 border-white/10 text-amber-100/80 hover:text-white hover:bg-amber-700/40/60"
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================== SUSPENSE LAZY-LOADED CHANNELS ===================== */}

      {/* F1 CONSTRUCTOR MASTER STUDIO */}
      {activeTab === "f1_workshop" && (
        <Suspense fallback={<div className="p-12 text-center text-xs text-amber-400 animate-pulse bg-amber-900/40 rounded-2xl">Loading F1 Constructor Studio...</div>}>
          <F1ConstructorMasterApp initialMode={f1InitialMode} onBackToMainMotorsport={() => setActiveTab("teams")} />
        </Suspense>
      )}

      {/* HYPERCAR CONSTRUCTOR MASTER STUDIO */}
      {activeTab === "hypercar_workshop" && (
        <Suspense fallback={<div className="p-12 text-center text-xs text-amber-400 animate-pulse bg-amber-900/40 rounded-2xl">Loading Hypercar Constructor Studio...</div>}>
          <HypercarConstructorMasterApp initialMode={hypercarInitialMode} onBackToMainMotorsport={() => setActiveTab("teams")} />
        </Suspense>
      )}

      {/* FIA HOMOLOGATION & BOP */}
      {activeTab === "homologation" && (
        <Suspense fallback={<div className="p-12 text-center text-xs text-amber-400 animate-pulse bg-amber-900/40 rounded-2xl">Loading FIA Scrutineering Matrix...</div>}>
          <FiaHomologationPanel />
        </Suspense>
      )}

      {/* LIVE 3D PIT WALL */}
      {activeTab === "pitwall" && (
        <Suspense fallback={<div className="p-12 text-center text-xs text-amber-400 animate-pulse bg-amber-900/40 rounded-2xl">Loading Live Pit Wall Telemetry...</div>}>
          <LivePitWallPanel />
        </Suspense>
      )}

      {/* ===================== FAST-SWITCH TEAMS & DRIVERS ===================== */}

      {/* TEAMS & ROSTER */}
      {activeTab === "teams" && (
        <div className="space-y-4 animate-fade-in">
          {showCreateForm ? (
            <Suspense fallback={<div className="p-6 text-center text-xs text-amber-400 animate-pulse">Loading Team Creator...</div>}>
              <CreateTeamForm onClose={() => setShowCreateForm(false)} />
            </Suspense>
          ) : (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-amber-500/30 hover:border-amber-400 text-amber-50 hover:text-amber-300 transition-all text-sm font-bold bg-amber-900/40 hover:bg-amber-800/35 shadow-md cursor-pointer"
            >
              <Plus size={16} /> Create New Championship Race Team
            </button>
          )}

          {company.motorsport.teams.length === 0 && !showCreateForm && (
            <div className="p-10 text-center rounded-2xl bg-amber-900/40 border border-white/10">
              <Trophy size={36} className="mx-auto text-amber-400 mb-3" />
              <p className="text-amber-100/80 text-sm font-semibold">No race teams formed yet.</p>
              <p className="text-amber-300/50 text-xs mt-1">Create a team or enter F1/Hypercar to start competing in motorsport.</p>
            </div>
          )}

          {/* Series Filtering & Search Bar */}
          {company.motorsport.teams.length > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-amber-900/40 p-3 rounded-2xl border border-white/10">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto">
                <Filter size={14} className="text-amber-400 ml-1 mr-1 shrink-0" />
                {SERIES_FILTERS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => {
                      playHMIClickSound();
                      setSeriesFilter(f.id);
                      setVisibleTeamCount(8);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      seriesFilter === f.id
                        ? "bg-amber-500 text-black font-extrabold shadow-sm"
                        : "bg-amber-800/35/80 text-amber-100/80 hover:text-white border border-white/5"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-200/60 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search constructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-amber-950/80 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Team Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {visibleTeams.map(t => (
              <TeamCard
                key={t.id}
                team={t}
                isSelected={selectedTeamId === t.id}
                onSelect={() => setSelectedTeamId(id => id === t.id ? null : t.id)}
              />
            ))}
          </div>

          {/* Load More Button if teams exceed visible count */}
          {filteredTeams.length > visibleTeamCount && (
            <div className="text-center pt-2">
              <button
                onClick={() => setVisibleTeamCount(prev => prev + 8)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-900/50 border border-amber-500/30 text-amber-300 hover:bg-amber-850/40 hover:border-amber-400 transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5"
              >
                <span>Show More Constructors ({filteredTeams.length - visibleTeamCount} remaining)</span>
                <ChevronDown size={14} />
              </button>
            </div>
          )}

          {/* Driver Management & Talent Market for Selected Team */}
          {selectedTeam && (
            <div className="space-y-4 mt-6">
              <div className="p-5 rounded-2xl bg-amber-900/40 border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users size={16} className="text-amber-400" /> Active Driver Lineup — {selectedTeam.name}
                  </h3>
                  <span className="text-[10px] font-mono text-amber-100/80 bg-black/60 px-2.5 py-1 rounded-lg border border-white/10">
                    {selectedTeam.drivers.length}/2 Drivers Contracted
                  </span>
                </div>

                {selectedTeam.drivers.length === 0 ? (
                  <div className="text-center py-6 bg-black/40 rounded-xl border border-white/5">
                    <p className="text-xs text-amber-200/60">No active drivers signed to this team yet.</p>
                    <p className="text-[10px] text-amber-300/50 mt-1">Hire free agents or scout rookies below.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedTeam.drivers.map(d => {
                      const seasonsRemaining = Math.max(0, d.contractEndSeason - company.motorsport.currentSeason);
                      return (
                        <div key={d.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-black/60 rounded-xl p-3.5 gap-3 border border-white/5 hover:border-amber-500/40 transition-all">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{d.name}</span>
                              <span className="text-[10px] text-amber-100/80 font-mono bg-amber-800/35 px-1.5 py-0.5 rounded">{d.nationality}</span>
                            </div>
                            <div className="text-[11px] text-amber-100/80 mt-1 flex items-center gap-3 flex-wrap">
                              <span>Skill: <strong className="text-amber-300 font-mono">{d.skill}</strong></span>
                              <span>Consistency: <strong className="text-emerald-400 font-mono">{d.consistency}</strong></span>
                              <span>Wet Pace: <strong className="text-amber-400 font-mono">{d.wetSkill}</strong></span>
                              <span>Salary: <strong className="text-amber-50 font-mono">${(d.salary / 1e6).toFixed(1)}M/yr</strong></span>
                            </div>
                            <div className="text-[10px] text-amber-200/60 mt-1">
                              Contract: {seasonsRemaining > 0 ? `${seasonsRemaining} season(s) left` : <span className="text-amber-400 font-medium">Expiring this season!</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => renewMotorsportContract(selectedTeam.id, d.id, 2)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition-all cursor-pointer"
                            >
                              Renew (+2 Yrs)
                            </button>
                            <button
                              onClick={() => releaseMotorsportDriver(selectedTeam.id, d.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 transition-all cursor-pointer"
                            >
                              Release
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Driver Market component */}
              <Suspense fallback={<div className="p-6 text-center text-xs text-amber-400 animate-pulse">Loading Driver Market...</div>}>
                <DriverMarket selectedTeam={selectedTeam} />
              </Suspense>
            </div>
          )}
        </div>
      )}

      {/* ===================== OTHER LAZY LOADED TABS ===================== */}

      {/* HQ INFRASTRUCTURE */}
      {activeTab === "hq" && (
        <Suspense fallback={<div className="p-8 text-center text-xs text-amber-400 animate-pulse">Loading HQ Infrastructure...</div>}>
          <HQInfrastructurePanel selectedTeam={selectedTeam} />
        </Suspense>
      )}

      {/* STAFF & PIT CREW */}
      {activeTab === "staff" && (
        <Suspense fallback={<div className="p-8 text-center text-xs text-amber-400 animate-pulse">Loading Staff & Pit Crew...</div>}>
          <StaffPitCrewPanel selectedTeam={selectedTeam} />
        </Suspense>
      )}

      {/* PARTS R&D */}
      {activeTab === "parts" && (
        <Suspense fallback={<div className="p-8 text-center text-xs text-amber-400 animate-pulse">Loading Parts R&D...</div>}>
          <PartsRAndDPanel selectedTeam={selectedTeam} />
        </Suspense>
      )}

      {/* RACE STRATEGY */}
      {activeTab === "strategy" && (
        <Suspense fallback={<div className="p-8 text-center text-xs text-amber-400 animate-pulse">Loading Strategy Panel...</div>}>
          <StrategyPanel selectedTeam={selectedTeam} />
        </Suspense>
      )}

      {/* TECH TRANSFER */}
      {activeTab === "transfer" && (
        <Suspense fallback={<div className="p-8 text-center text-xs text-amber-400 animate-pulse">Loading Tech Transfer...</div>}>
          <TechTransferPanel selectedTeam={selectedTeam} />
        </Suspense>
      )}

      {/* SEASON SIMULATOR */}
      {activeTab === "season" && (
        <Suspense fallback={<div className="p-8 text-center text-xs text-amber-400 animate-pulse">Loading Season Simulator...</div>}>
          <SeasonSimulator />
        </Suspense>
      )}

      {/* RACE CALENDAR */}
      {activeTab === "calendar" && (
        <Suspense fallback={<div className="p-8 text-center text-xs text-amber-400 animate-pulse">Loading Race Calendar...</div>}>
          <CalendarViewPanel />
        </Suspense>
      )}

      {/* GOVERNING AUTHORITY */}
      {activeTab === "governing" && (
        <Suspense fallback={<div className="p-8 text-center text-xs text-amber-400 animate-pulse">Loading Governing Authority...</div>}>
          <GoverningBodyPanel />
        </Suspense>
      )}

      {/* POLITICAL VOTING */}
      {activeTab === "votes" && (
        <Suspense fallback={<div className="p-8 text-center text-xs text-amber-400 animate-pulse">Loading Political Voting...</div>}>
          <PoliticalVotingPanel />
        </Suspense>
      )}

      {/* SEASON SUMMARY */}
      {activeTab === "summary" && (
        <Suspense fallback={<div className="p-8 text-center text-xs text-amber-400 animate-pulse">Loading Season Summary...</div>}>
          <SeasonSummaryPanel />
        </Suspense>
      )}

      {/* ANALYTICS */}
      {activeTab === "analytics" && (
        <Suspense fallback={<div className="p-8 text-center text-xs text-amber-400 animate-pulse">Loading Analytics Lab...</div>}>
          <AnalyticsPanel selectedTeam={selectedTeam} />
        </Suspense>
      )}

      {/* REGULATIONS & GUIDES */}
      {activeTab === "guide" && (
        <Suspense fallback={<div className="p-8 text-center text-xs text-amber-400 animate-pulse">Loading Regulation Guide...</div>}>
          <RegulationGuidePanel />
        </Suspense>
      )}

      {/* TROPHY HISTORY */}
      {activeTab === "history" && (
        <Suspense fallback={<div className="p-8 text-center text-xs text-amber-400 animate-pulse">Loading History Timeline...</div>}>
          <HistoryTimeline selectedTeam={selectedTeam} />
        </Suspense>
      )}

      {/* ===================== CONDITIONALLY MOUNTED MODALS ===================== */}

      {/* F1 Entry Requirements Modal */}
      {showF1EntryWizard && (
        <Suspense fallback={null}>
          <F1EntryWizardModal
            isOpen={showF1EntryWizard}
            onClose={() => setShowF1EntryWizard(false)}
            onEnterConstructionStudio={() => {
              setF1InitialMode("CONSTRUCTION_CAD");
              setShowF1EntryWizard(false);
              setActiveTab("f1_workshop");
            }}
            onEnterGarageAndRace={() => {
              setF1InitialMode("GARAGE_SETUP");
              setShowF1EntryWizard(false);
              setActiveTab("f1_workshop");
            }}
          />
        </Suspense>
      )}

      {/* Hypercar Entry Requirements Modal */}
      {showHypercarEntryWizard && (
        <Suspense fallback={null}>
          <HypercarEntryWizardModal
            isOpen={showHypercarEntryWizard}
            onClose={() => setShowHypercarEntryWizard(false)}
            onEnterStudio={() => {
              setShowHypercarEntryWizard(false);
              setActiveTab("hypercar_workshop");
            }}
            onProceedToRace={() => {
              setShowHypercarEntryWizard(false);
              setActiveTab("hypercar_workshop");
            }}
          />
        </Suspense>
      )}

      {/* Live Race Telemetry Modal */}
      {showLiveRaceModal && (
        <Suspense fallback={null}>
          <LiveRaceModal
            isOpen={showLiveRaceModal}
            state={liveRaceState}
            sim={sim}
            onStepLap={handleStepLap}
            onFinishRace={handleFinishLiveRace}
            onClose={() => setShowLiveRaceModal(false)}
          />
        </Suspense>
      )}
    </div>
  );
}

export const MotorsportDivision = memo(MotorsportDivisionComponent);
export default MotorsportDivision;
