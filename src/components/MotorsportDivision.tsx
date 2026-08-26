// ===================================================================
// MOTORSPORT DIVISION — Master Motorsport Hub & Multi-Category Racing
// ===================================================================
import { useState, useMemo, lazy, Suspense, memo } from "react";
import {
  Trophy, Plus, Users, ArrowRightLeft,
  Medal, AlertTriangle, Zap, Gauge, Shield,
  Play, History, BookOpen, Target, BarChart3,
  Star, CheckCircle, XCircle, Info, ChevronRight,
  Search, TrendingUp, Award, Settings, Wrench, Radio, Calendar,
  Building2, Gavel, Flag, Flame, Layers
} from "lucide-react";
import { useCompany } from "../state/CompanyContext";
import { useDesign } from "../state/DesignContext";
import { getSeasonCalendar } from "../sim/motorsportEngine";
import { TRACKS } from "../sim/constants";
import type { MotorsportCategory, MotorsportTeam } from "../sim/types";

// Modular sub-components from motorsport package
import { TeamCard, CATEGORY_LABELS, CATEGORY_COLORS } from "./motorsport/TeamCard";
import { CreateTeamForm } from "./motorsport/CreateTeamForm";
import { DriverMarket } from "./motorsport/DriverMarket";
import { StrategyPanel } from "./motorsport/StrategyPanel";
import { SeasonSimulator } from "./motorsport/SeasonSimulator";
import { AnalyticsPanel } from "./motorsport/AnalyticsPanel";
import { TechTransferPanel } from "./motorsport/TechTransferPanel";
import { HistoryTimeline } from "./motorsport/HistoryTimeline";
import { HQInfrastructurePanel } from "./motorsport/HQInfrastructurePanel";
import { StaffPitCrewPanel } from "./motorsport/StaffPitCrewPanel";
import { PartsRAndDPanel } from "./motorsport/PartsRAndDPanel";
import { PoliticalVotingPanel } from "./motorsport/PoliticalVotingPanel";
import { GoverningBodyPanel } from "./motorsport/GoverningBodyPanel";
import { CalendarViewPanel } from "./motorsport/CalendarViewPanel";
import { RegulationGuidePanel } from "./motorsport/RegulationGuidePanel";
import { SeasonSummaryPanel } from "./motorsport/SeasonSummaryPanel";
import { LiveRaceModal, type LiveRaceState } from "./motorsport/LiveRaceModal";
import { F1EntryWizardModal } from "./f1/F1EntryWizardModal";
import { HypercarEntryWizardModal } from "./hypercar/HypercarEntryWizardModal";

// Lazy-load heavy 3D constructor studios & panels for maximum performance
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
    icon: <Flag size={14} className="text-cyan-400" />,
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
    icon: <Building2 size={14} className="text-purple-400" />,
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

function MotorsportDivisionComponent() {
  const {
    company, assignMotorsportDriver, simulateMotorsportSeason,
    scoutNewDriver, signScouted, releaseMotorsportDriver, renewMotorsportContract,
    attractMotorsportSponsor, refreshSponsorMarket,
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
  const [liveRaceState, setLiveRaceState] = useState<LiveRaceState | null>(null);

  const selectedTeam = useMemo(() => {
    return company.motorsport.teams.find(t => t.id === selectedTeamId) ?? company.motorsport.teams[0] ?? null;
  }, [company.motorsport.teams, selectedTeamId]);

  const activeCategory = useMemo(() => {
    return HUB_CATEGORIES.find(cat => cat.tabs.some(t => t.id === activeTab)) || HUB_CATEGORIES[0];
  }, [activeTab]);

  const handleStartLiveRace = () => {
    const calendar = getSeasonCalendar("gt");
    setShowLiveRaceModal(true);
    setLiveRaceState({
      round: 1,
      totalRounds: calendar.rounds,
      trackName: TRACKS[calendar.tracks[0]]?.name || "Monza Circuit",
      lap: 1,
      totalLaps: 30,
      isPlaying: true,
      standings: [
        { rank: 1, name: company.motorsport.teams[0]?.name || "Apex Racing", gap: "LEADER", pts: 25, isPlayer: true, pitStops: 0 },
        { rank: 2, name: "Veloce Scuderia", gap: "+0.842s", pts: 18, isPlayer: false, pitStops: 0 },
        { rank: 3, name: "Nordic Motorsport", gap: "+2.150s", pts: 15, isPlayer: false, pitStops: 0 },
        { rank: 4, name: "Bavaria Sport", gap: "+3.910s", pts: 12, isPlayer: false, pitStops: 0 },
        { rank: 5, name: "Kurogane Racing", gap: "+5.420s", pts: 10, isPlayer: false, pitStops: 0 },
        { rank: 6, name: "Silverstone Dynamics", gap: "+7.100s", pts: 8, isPlayer: false, pitStops: 0 },
      ],
      feed: [
        { time: "LAP 1", text: "GREEN FLAG! Cars launch into Turn 1 with heavy braking.", type: "info" },
        { time: "LAP 1", text: "Apex Racing holds P1 into the chicane after a strong start!", type: "overtake" },
      ],
    });
  };

  const handleStepLap = () => {
    setLiveRaceState(prev => {
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
    <div className="space-y-4 animate-fade-in">
      {/* Header Dashboard Banner */}
      <div className="glass-panel p-5 relative overflow-hidden border-yellow-500/20">
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{ background: "radial-gradient(ellipse at top right, rgba(251,191,36,0.35), transparent 60%)" }}
        />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500/25 to-amber-600/20 border border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
              <Trophy size={24} className="text-yellow-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-yellow-400 uppercase tracking-widest">WORLD MOTORSPORT DIVISION</span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                  Season {company.motorsport.currentSeason}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-100 mt-0.5">Grand Prix Racing Operations & Engineering</h2>
              <p className="text-xs text-slate-400">Manage race teams, elite constructor championships, factory HQ & technical BoP regulations.</p>
            </div>
          </div>

          {/* Key Championship Statistics */}
          <div className="grid grid-cols-4 gap-2 text-center bg-base-950/70 p-2.5 rounded-xl border border-white/5 shrink-0">
            <div className="px-2">
              <div className="text-lg font-black font-mono text-cyan-300">{company.motorsport.teams.length}</div>
              <div className="text-[9px] text-slate-500 uppercase font-semibold">Teams</div>
            </div>
            <div className="px-2 border-l border-white/5">
              <div className="text-lg font-black font-mono text-emerald-400">{totalWins}</div>
              <div className="text-[9px] text-slate-500 uppercase font-semibold">Wins</div>
            </div>
            <div className="px-2 border-l border-white/5">
              <div className="text-lg font-black font-mono text-yellow-400">{totalTitles}</div>
              <div className="text-[9px] text-slate-500 uppercase font-semibold">Titles</div>
            </div>
            <div className="px-2 border-l border-white/5">
              <div className="text-lg font-black font-mono text-purple-400">{totalFastestLaps}</div>
              <div className="text-[9px] text-slate-500 uppercase font-semibold">FL</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Banners (Only displayed when outside full-screen constructor studios) */}
      {activeTab !== "f1_workshop" && activeTab !== "hypercar_workshop" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* F1 Banner */}
          <div className="glass-panel p-4 border-cyan-500/30 bg-gradient-to-r from-slate-900 via-cyan-950/30 to-blue-950/40 rounded-2xl flex items-center justify-between gap-4 shadow-lg hover:border-cyan-400/50 transition-all card-hover">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-mono font-black text-cyan-400 text-sm shadow-[0_0_12px_rgba(34,211,238,0.2)]">
                F1
              </div>
              <div>
                <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>Formula 1 Constructor Studio</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                    FIA Master
                  </span>
                </div>
                <p className="text-xs text-slate-400">Open-wheel monocoque, V6 turbo-hybrid, MGU-K & aero floor.</p>
              </div>
            </div>

            <button
              onClick={() => setShowF1EntryWizard(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide shadow-md shadow-cyan-500/25 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
            >
              <span>Enter F1</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Hypercar Banner */}
          <div className="glass-panel p-4 border-amber-500/30 bg-gradient-to-r from-slate-900 via-amber-950/30 to-orange-950/40 rounded-2xl flex items-center justify-between gap-4 shadow-lg hover:border-amber-400/50 transition-all card-hover">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-mono font-black text-amber-400 text-sm shadow-[0_0_12px_rgba(251,191,36,0.2)]">
                LMH
              </div>
              <div>
                <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>Hypercar WEC Championship</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    24H Le Mans
                  </span>
                </div>
                <p className="text-xs text-slate-400">Enclosed carbon cockpit, e-AWD MGU, cooling & endurance setup.</p>
              </div>
            </div>

            <button
              onClick={() => setShowHypercarEntryWizard(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide shadow-md shadow-amber-500/25 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
            >
              <span>Enter Hypercar</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Categorized 4-Tier Master Motorsport Navigation Bar */}
      <div className="space-y-2 bg-base-950/80 p-2.5 rounded-2xl border border-white/10">
        {/* Category Header Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {HUB_CATEGORIES.map((cat) => {
            const isSelected = activeCategory.id === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.tabs[0].id)}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  isSelected
                    ? "bg-cyan-500/15 border-cyan-400/40 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                    : "bg-base-900/60 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10"
                }`}
              >
                {cat.icon}
                <span className="truncate">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-tabs for the Active Category */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
          {activeCategory.tabs.map((tab) => {
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                  isTabActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/50 text-cyan-200 shadow-sm"
                    : "bg-base-900/40 border-transparent text-slate-400 hover:text-slate-200 hover:border-white/5"
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-400/20 text-cyan-300 font-bold">
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
        <Suspense fallback={<div className="panel p-12 text-center text-xs text-cyan-400 animate-pulse">Loading F1 Constructor Studio...</div>}>
          <F1ConstructorMasterApp initialMode={f1InitialMode} onBackToMainMotorsport={() => setActiveTab("teams")} />
        </Suspense>
      )}

      {/* HYPERCAR CONSTRUCTOR MASTER STUDIO */}
      {activeTab === "hypercar_workshop" && (
        <Suspense fallback={<div className="panel p-12 text-center text-xs text-amber-400 animate-pulse">Loading Hypercar Constructor Studio...</div>}>
          <HypercarConstructorMasterApp initialMode={hypercarInitialMode} onBackToMainMotorsport={() => setActiveTab("teams")} />
        </Suspense>
      )}

      {/* FIA HOMOLOGATION & BOP */}
      {activeTab === "homologation" && (
        <Suspense fallback={<div className="panel p-12 text-center text-xs text-cyan-400 animate-pulse">Loading FIA Scrutineering Matrix...</div>}>
          <FiaHomologationPanel />
        </Suspense>
      )}

      {/* LIVE 3D PIT WALL */}
      {activeTab === "pitwall" && (
        <Suspense fallback={<div className="panel p-12 text-center text-xs text-cyan-400 animate-pulse">Loading Live Pit Wall Telemetry...</div>}>
          <LivePitWallPanel />
        </Suspense>
      )}

      {/* ===================== STANDARD FAST-SWITCH TAB PANELS ===================== */}

      {/* TEAMS & ROSTER */}
      {activeTab === "teams" && (
        <div className="space-y-4 animate-fade-in">
          {showCreateForm ? (
            <CreateTeamForm onClose={() => setShowCreateForm(false)} />
          ) : (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed border-white/10 text-slate-400 hover:border-cyan-500/40 hover:text-cyan-300 transition-all text-sm font-semibold bg-base-950/40 hover:bg-base-950/80"
            >
              <Plus size={16} /> Create New Championship Race Team
            </button>
          )}

          {company.motorsport.teams.length === 0 && !showCreateForm && (
            <div className="panel p-10 text-center">
              <Trophy size={36} className="mx-auto text-slate-700 mb-3" />
              <p className="text-slate-400 text-sm font-semibold">No race teams formed yet.</p>
              <p className="text-slate-600 text-xs mt-1">Create a team or enter F1/Hypercar to start competing in motorsport.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {company.motorsport.teams.map(t => (
              <TeamCard
                key={t.id}
                team={t}
                isSelected={selectedTeamId === t.id}
                onSelect={() => setSelectedTeamId(id => id === t.id ? null : t.id)}
              />
            ))}
          </div>

          {/* Driver Management & Talent Market */}
          {selectedTeam && (
            <div className="space-y-4">
              <div className="glass-panel p-5 border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Users size={16} className="text-cyan-400" /> Active Driver Lineup — {selectedTeam.name}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 bg-base-900 px-2 py-0.5 rounded border border-white/5">
                    {selectedTeam.drivers.length}/2 Drivers Contracted
                  </span>
                </div>

                {selectedTeam.drivers.length === 0 ? (
                  <div className="text-center py-6 bg-base-950/60 rounded-xl border border-white/5">
                    <p className="text-xs text-slate-500">No active drivers signed to this team yet.</p>
                    <p className="text-[10px] text-slate-600 mt-1">Hire free agents or scout rookies below.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedTeam.drivers.map(d => {
                      const seasonsRemaining = Math.max(0, d.contractEndSeason - company.motorsport.currentSeason);
                      return (
                        <div key={d.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-base-950/80 rounded-xl p-3.5 gap-3 border border-white/5 hover:border-cyan-500/30 transition-all">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-100">{d.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono bg-base-900 px-1.5 py-0.5 rounded">{d.nationality}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                              <span>Skill: <strong className="text-cyan-300 font-mono">{d.skill}</strong></span>
                              <span>Consistency: <strong className="text-emerald-400 font-mono">{d.consistency}</strong></span>
                              <span>Wet Pace: <strong className="text-blue-400 font-mono">{d.wetSkill}</strong></span>
                              <span>Salary: <strong className="text-slate-200 font-mono">${(d.salary / 1e6).toFixed(1)}M/yr</strong></span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1">
                              Contract: {seasonsRemaining > 0 ? `${seasonsRemaining} season(s) left` : <span className="text-amber-400 font-medium">Expiring this season!</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => renewMotorsportContract(selectedTeam.id, d.id, 2)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all"
                            >
                              Renew (+2 Yrs)
                            </button>
                            <button
                              onClick={() => releaseMotorsportDriver(selectedTeam.id, d.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 transition-all"
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
              <DriverMarket selectedTeam={selectedTeam} />
            </div>
          )}
        </div>
      )}

      {/* HQ INFRASTRUCTURE */}
      {activeTab === "hq" && <HQInfrastructurePanel selectedTeam={selectedTeam} />}

      {/* STAFF & PIT CREW */}
      {activeTab === "staff" && <StaffPitCrewPanel selectedTeam={selectedTeam} />}

      {/* PARTS R&D */}
      {activeTab === "parts" && <PartsRAndDPanel selectedTeam={selectedTeam} />}

      {/* RACE STRATEGY */}
      {activeTab === "strategy" && <StrategyPanel selectedTeam={selectedTeam} />}

      {/* TECH TRANSFER */}
      {activeTab === "transfer" && <TechTransferPanel selectedTeam={selectedTeam} />}

      {/* SEASON SIMULATOR */}
      {activeTab === "season" && <SeasonSimulator />}

      {/* RACE CALENDAR */}
      {activeTab === "calendar" && <CalendarViewPanel />}

      {/* GOVERNING AUTHORITY */}
      {activeTab === "governing" && <GoverningBodyPanel />}

      {/* POLITICAL VOTING */}
      {activeTab === "votes" && <PoliticalVotingPanel />}

      {/* SEASON SUMMARY */}
      {activeTab === "summary" && <SeasonSummaryPanel />}

      {/* ANALYTICS */}
      {activeTab === "analytics" && <AnalyticsPanel selectedTeam={selectedTeam} />}

      {/* REGULATIONS & GUIDES */}
      {activeTab === "guide" && <RegulationGuidePanel />}

      {/* TROPHY HISTORY */}
      {activeTab === "history" && <HistoryTimeline selectedTeam={selectedTeam} />}

      {/* F1 Entry Requirements Modal */}
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

      {/* Hypercar Entry Requirements Modal */}
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

      {/* Live Race Telemetry Modal */}
      <LiveRaceModal
        isOpen={showLiveRaceModal}
        state={liveRaceState}
        sim={sim}
        onStepLap={handleStepLap}
        onFinishRace={handleFinishLiveRace}
        onClose={() => setShowLiveRaceModal(false)}
      />
    </div>
  );
}

export const MotorsportDivision = memo(MotorsportDivisionComponent);
export default MotorsportDivision;

