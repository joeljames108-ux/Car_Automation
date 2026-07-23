// ===================================================================
// MOTORSPORT DIVISION — Teams, seasons, tech transfer, guides, strategy, analytics
// ===================================================================
import { useState, useMemo } from "react";
import {
  Trophy, Plus, Users, ArrowRightLeft,
  Medal, AlertTriangle, Zap, Gauge, Shield,
  Play, History, BookOpen, Target, BarChart3,
  Star, CheckCircle, XCircle, Info, ChevronRight,
  Search, TrendingUp, Award, Settings, Wrench, Radio, Calendar,
  Building2, Gavel,
} from "lucide-react";
import { useCompany } from "../state/CompanyContext";
import { useDesign } from "../state/DesignContext";
import { LineChart } from "./ui/LineChart";
import { CATEGORY_REGULATIONS, CATEGORY_GUIDES, evaluateCompliance, getFacilityUpgradeCost, getNextFacilityLevel, getSeasonCalendar } from "../sim/motorsportEngine";
import type { MotorsportCategory, MotorsportTeam, TireChoice, FacilityLevel } from "../sim/types";
import { TRACKS } from "../sim/constants";

const CATEGORY_LABELS: Record<MotorsportCategory, string> = {
  gt: "GT Series", formula: "Formula", hypercar: "Hypercar WEC",
  touring: "Touring Car", rally: "Rally", endurance: "Endurance",
};

const CATEGORY_COLORS: Record<MotorsportCategory, string> = {
  gt: "text-accent-300 bg-accent-500/15 border-accent-500/30",
  formula: "text-ok-400 bg-ok-500/15 border-ok-500/30",
  hypercar: "text-purple-400 bg-purple-500/15 border-purple-500/30",
  touring: "text-blue-400 bg-blue-500/15 border-blue-500/30",
  rally: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  endurance: "text-orange-400 bg-orange-500/15 border-orange-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  inactive: "text-slate-500", developing: "text-warn-400",
  competing: "text-ok-400", champion: "text-yellow-400",
};

const FACILITY_COLORS: Record<FacilityLevel, string> = {
  basic: "text-slate-500", standard: "text-blue-400",
  advanced: "text-purple-400", elite: "text-yellow-400",
};

const DIFFICULTY_LABELS = ["", "Beginner", "Easy", "Moderate", "Hard", "Expert"];

function DifficultyStars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={12} className={i <= value ? "text-yellow-400 fill-yellow-400" : "text-slate-700"} />
      ))}
    </div>
  );
}

function MoraleBar({ value }: { value: number }) {
  const color = value > 75 ? "bg-ok-400" : value > 45 ? "bg-warn-400" : "bg-danger-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-base-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] font-mono text-slate-400 w-8 text-right">{value}%</span>
    </div>
  );
}

// ---------- Team Card ----------

function TeamCard({ team, onSelect, isSelected }: {
  team: MotorsportTeam; onSelect: () => void; isSelected: boolean;
}) {
  const lastSeason = team.seasonResults[team.seasonResults.length - 1];
  return (
    <div
      onClick={onSelect}
      className={`panel p-4 cursor-pointer transition-all duration-200 relative overflow-hidden group hover:border-base-700 ${
        isSelected
          ? "border-accent-500/70 bg-accent-500/5 shadow-[0_0_15px_rgba(34,211,238,0.15)] ring-1 ring-accent-500/30"
          : "hover:bg-base-850/40"
      }`}
    >
      {/* Team Livery Color Stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-all group-hover:h-1.5"
        style={{ backgroundColor: team.liveryColor || "#38bdf8" }}
      />

      <div className="flex items-start justify-between mb-3 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shadow-sm ${CATEGORY_COLORS[team.category]}`}>
              {CATEGORY_LABELS[team.category]}
            </span>
            <span className={`text-[10px] font-medium capitalize px-2 py-0.5 rounded-full bg-base-850 border border-base-800 ${FACILITY_COLORS[team.facilityLevel]}`}>
              ★ {team.facilityLevel}
            </span>
          </div>
          <h3 className="font-bold text-slate-100 text-base tracking-tight flex items-center gap-2">
            {team.name}
            {isSelected && <span className="text-[10px] text-accent-400 font-mono font-normal bg-accent-500/10 px-1.5 py-0.2 rounded border border-accent-500/20">Selected</span>}
          </h3>
          <div className={`text-[10px] font-semibold capitalize mt-0.5 flex items-center gap-1.5 ${STATUS_COLORS[team.status]}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> {team.status}
          </div>
        </div>
        {team.championships > 0 && (
          <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/30 px-2 py-1 rounded-lg text-yellow-400">
            <Trophy size={14} className="text-yellow-400 fill-yellow-400/20" />
            <span className="text-xs font-bold font-mono">{team.championships}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-1.5 mb-3 text-center">
        <div className="bg-base-850/80 backdrop-blur-sm rounded-lg p-2 border border-base-800/80">
          <div className="text-base font-bold font-mono text-ok-400 leading-tight">{team.wins}</div>
          <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Wins</div>
        </div>
        <div className="bg-base-850/80 backdrop-blur-sm rounded-lg p-2 border border-base-800/80">
          <div className="text-base font-bold font-mono text-accent-300 leading-tight">{team.podiums}</div>
          <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Podiums</div>
        </div>
        <div className="bg-base-850/80 backdrop-blur-sm rounded-lg p-2 border border-base-800/80">
          <div className="text-base font-bold font-mono text-purple-400 leading-tight">{team.fastestLaps}</div>
          <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">FL</div>
        </div>
        <div className="bg-base-850/80 backdrop-blur-sm rounded-lg p-2 border border-base-800/80">
          <div className="text-base font-bold font-mono text-slate-300 leading-tight">{team.developmentPoints}</div>
          <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Dev</div>
        </div>
      </div>

      {/* Morale */}
      <div className="mb-3 bg-base-850/50 p-2 rounded-lg border border-base-800/50">
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
          <span>Team Morale</span>
          <span className="font-mono text-slate-300">{team.teamMorale}%</span>
        </div>
        <MoraleBar value={team.teamMorale} />
      </div>

      {/* Drivers Roster */}
      {team.drivers.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {team.drivers.map(d => {
            const latestDev = team.driverDevLogs.filter(l => l.driverId === d.id).slice(-1)[0];
            return (
              <div key={d.id} className="flex items-center justify-between bg-base-850/90 rounded-lg px-2.5 py-1.5 border border-base-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-200">{d.name}</span>
                  <span className="text-[9px] text-slate-500 bg-base-800 px-1 rounded font-mono">{d.nationality}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-accent-300 font-semibold">{d.skill} <span className="text-[9px] text-slate-500 font-normal">SKILL</span></span>
                  {latestDev && latestDev.skillAfter > latestDev.skillBefore && (
                    <span className="text-[9px] text-ok-400 font-bold bg-ok-500/10 px-1 rounded">▲{latestDev.skillAfter - latestDev.skillBefore}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Sponsors Badges */}
      {team.sponsors.length > 0 && (
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-base-800/60 overflow-x-auto no-scrollbar">
          <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider shrink-0">Sponsors:</span>
          {team.sponsors.map(s => (
            <span key={s.id} className="text-[10px] px-1.5 py-0.5 rounded bg-base-850 border border-base-800 text-slate-300 shrink-0 flex items-center gap-1">
              <span>{s.logoEmoji}</span> <span className="truncate max-w-[80px]">{s.name}</span>
            </span>
          ))}
        </div>
      )}

      {lastSeason && (
        <div className="mt-2 text-[10px] text-slate-500 pt-1.5 border-t border-base-800/40 flex items-center justify-between">
          <span>Last Season Result</span>
          <span className="font-mono text-slate-300 font-medium">P{lastSeason.position} · {lastSeason.points} pts</span>
        </div>
      )}
    </div>
  );
}

// ---------- Create Team Form ----------

function CreateTeamForm({ onClose }: { onClose: () => void }) {
  const { createMotorsportTeam, company } = useCompany();
  const [form, setForm] = useState({
    name: "", category: "gt" as MotorsportCategory,
    budget: 20_000_000, baseVehicleId: null as string | null,
  });

  function handleCreate() {
    if (!form.name.trim()) return;
    createMotorsportTeam(form.name, form.category, form.budget, form.baseVehicleId);
    onClose();
  }

  return (
    <div className="panel p-5 border-accent-500/30">
      <h3 className="text-sm font-semibold text-slate-100 mb-4 flex items-center gap-2">
        <Plus size={14} className="text-accent-400" /> Create Race Team
      </h3>
      <div className="space-y-3">
        <div>
          <label className="label-mono block mb-1">Team Name</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Apex Motorsport GT"
            className="w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-accent-500 focus:outline-none" />
        </div>
        <div>
          <label className="label-mono block mb-1">Category</label>
          <div className="grid grid-cols-3 gap-1.5">
            {(Object.keys(CATEGORY_LABELS) as MotorsportCategory[]).map(cat => (
              <button key={cat} onClick={() => setForm(f => ({ ...f, category: cat }))}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  form.category === cat ? `${CATEGORY_COLORS[cat]}` : "bg-base-850 border-base-800 text-slate-400 hover:border-base-700"
                }`}>
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label-mono block mb-1">Season Budget</label>
          <div className="flex items-center gap-2">
            <input type="range" min={5_000_000} max={100_000_000} step={1_000_000}
              value={form.budget} onChange={e => setForm(f => ({ ...f, budget: +e.target.value }))} className="flex-1" />
            <span className="text-sm font-mono text-accent-300 w-20 text-right">${(form.budget / 1_000_000).toFixed(0)}M</span>
          </div>
        </div>
        <div>
          <label className="label-mono block mb-1">Base Vehicle (optional)</label>
          <select value={form.baseVehicleId || ""} onChange={e => setForm(f => ({ ...f, baseVehicleId: e.target.value || null }))}
            className="w-full bg-base-850 border border-base-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-accent-500 focus:outline-none">
            <option value="">None (new design)</option>
            {company.garage.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCreate} className="flex-1 py-2 rounded-lg text-xs font-semibold bg-accent-500/20 border border-accent-500/40 text-accent-300 hover:bg-accent-500/30 transition-all">
            Create Team
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-base-800 transition-all">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Main Component ----------

export function MotorsportDivision() {
  const {
    company, assignMotorsportDriver, simulateMotorsportSeason,
    transferMotorsportTech, availableDrivers,
    scoutNewDriver, signScouted, upgradeFacility, updateStrategy,
    releaseMotorsportDriver, renewMotorsportContract,
    attractMotorsportSponsor, refreshSponsorMarket,
  } = useCompany();
  const { sim, design } = useDesign();
  const [activeTab, setActiveTab] = useState<"teams" | "guide" | "strategy" | "calendar" | "governing" | "season" | "analytics" | "transfer" | "history">("teams");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [transferPoints, setTransferPoints] = useState(10);
  const [transferDir, setTransferDir] = useState<"race_to_production" | "production_to_race">("race_to_production");
  const [guideCategory, setGuideCategory] = useState<MotorsportCategory>("gt");

  const [showLiveRaceModal, setShowLiveRaceModal] = useState(false);
  const [liveRaceState, setLiveRaceState] = useState<{
    round: number;
    totalRounds: number;
    trackName: string;
    lap: number;
    totalLaps: number;
    isPlaying: boolean;
    standings: { rank: number; name: string; gap: string; pts: number; isPlayer: boolean; pitStops: number }[];
    feed: { time: string; text: string; type: "overtake" | "pit" | "crash" | "fastest" | "info" }[];
  } | null>(null);

  const handleStartLiveRace = () => {
    setShowLiveRaceModal(true);
    const calendar = getSeasonCalendar(guideCategory);
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
      ]
    });
  };

  const selectedTeam = company.motorsport.teams.find(t => t.id === selectedTeamId) ?? null;

  // Compliance check
  const isHybrid = design.engine.layout === "hybrid" || design.engine.hybridArchitecture !== "none" || design.engine.hasMguH;
  const compliance = useMemo(
    () => evaluateCompliance(sim.peakPower, sim.weight, isHybrid, guideCategory),
    [sim.peakPower, sim.weight, isHybrid, guideCategory],
  );

  // Points progression chart data
  const pointsSeries = useMemo(() => {
    if (!selectedTeam || selectedTeam.seasonResults.length === 0) return [];
    return [{
      data: selectedTeam.seasonResults.map(r => ({ x: r.season, y: r.points })),
      color: "#22d3ee",
      fill: true,
    }];
  }, [selectedTeam]);

  const tabs = [
    { id: "teams" as const, label: "Teams" },
    { id: "guide" as const, label: "Guide" },
    { id: "strategy" as const, label: "Strategy" },
    { id: "calendar" as const, label: "Calendar" },
    { id: "governing" as const, label: "Governing Body" },
    { id: "season" as const, label: "Season" },
    { id: "analytics" as const, label: "Analytics" },
    { id: "transfer" as const, label: "Tech Transfer" },
    { id: "history" as const, label: "History" },
  ];

  return (
    <div className="space-y-4 stagger">
      {/* Header */}
      <div className="panel p-5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{ background: "radial-gradient(ellipse at top right, rgba(251,191,36,0.3), transparent 60%)" }} />
        <div className="relative flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
              <Trophy size={24} className="text-yellow-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Motorsport Division</h2>
              <p className="text-xs text-slate-500">Race teams, championships, strategy, and technology transfer</p>
            </div>
          </div>
          <div className="flex-1" />
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-xl font-bold font-mono text-accent-300">{company.motorsport.teams.length}</div>
              <div className="text-[10px] text-slate-600">Teams</div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-ok-400">{company.motorsport.teams.reduce((s, t) => s + t.wins, 0)}</div>
              <div className="text-[10px] text-slate-600">Wins</div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-yellow-400">{company.motorsport.teams.reduce((s, t) => s + t.championships, 0)}</div>
              <div className="text-[10px] text-slate-600">Titles</div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-purple-400">{company.motorsport.teams.reduce((s, t) => s + t.fastestLaps, 0)}</div>
              <div className="text-[10px] text-slate-600">FL</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-base-850 rounded-lg p-1 border border-base-800 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${activeTab === t.id ? "bg-accent-500/20 text-accent-300" : "text-slate-400 hover:text-slate-200"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ===================== TEAMS TAB ===================== */}
      {activeTab === "teams" && (
        <div className="space-y-4">
          {showCreateForm
            ? <CreateTeamForm onClose={() => setShowCreateForm(false)} />
            : (
              <button onClick={() => setShowCreateForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-base-700 text-slate-500 hover:border-accent-500/40 hover:text-accent-300 transition-all text-sm font-medium">
                <Plus size={14} /> Create New Race Team
              </button>
            )
          }

          {company.motorsport.teams.length === 0 && !showCreateForm && (
            <div className="panel p-10 text-center">
              <Trophy size={36} className="mx-auto text-slate-700 mb-3" />
              <p className="text-slate-500 text-sm">No race teams yet.</p>
              <p className="text-slate-600 text-xs mt-1">Create a team to start competing in motorsport.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {company.motorsport.teams.map(t => (
              <TeamCard key={t.id} team={t} isSelected={selectedTeamId === t.id}
                onSelect={() => setSelectedTeamId(id => id === t.id ? null : t.id)} />
            ))}
          </div>

          {/* Driver Management & Roster for Selected Team */}
          {selectedTeam && (
            <div className="panel p-4 space-y-4">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users size={12} className="text-accent-400" /> Driver Management — {selectedTeam.name}
              </h3>
              
              {selectedTeam.drivers.length === 0 ? (
                <div className="text-center py-4 bg-base-850 rounded-xl">
                  <p className="text-xs text-slate-500">No drivers signed to this team yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedTeam.drivers.map(d => {
                    const seasonsRemaining = Math.max(0, d.contractEndSeason - company.motorsport.currentSeason);
                    return (
                      <div key={d.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-base-850 rounded-xl p-3 gap-3 border border-base-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-100">{d.name}</span>
                            <span className="text-[10px] text-slate-500">({d.nationality})</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Skill: <span className="text-accent-300 font-mono">{d.skill}</span> · Consistency: <span className="text-ok-400 font-mono">{d.consistency}</span> · Wet: <span className="text-blue-400 font-mono">{d.wetSkill}</span> · Salary: <span className="text-slate-200 font-mono">${(d.salary / 1e6).toFixed(1)}M/yr</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Contract: {seasonsRemaining > 0 ? `${seasonsRemaining} season(s) left` : <span className="text-warn-400 font-medium">Expiring this season!</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => renewMotorsportContract(selectedTeam.id, d.id, 2)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-ok-500/15 border border-ok-500/30 text-ok-400 hover:bg-ok-500/25 transition-all"
                          >
                            Renew (+2 Yrs)
                          </button>
                          <button
                            onClick={() => releaseMotorsportDriver(selectedTeam.id, d.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-danger-500/15 border border-danger-500/30 text-danger-400 hover:bg-danger-500/25 transition-all"
                          >
                            Release
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Hire Available Drivers */}
              {availableDrivers.length > 0 && selectedTeam.drivers.length < 2 && (
                <div className="pt-2 border-t border-base-800">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Available Pro Drivers</div>
                  <div className="grid gap-2">
                    {availableDrivers.map((d, idx) => (
                      <div key={d.id} className="flex items-center gap-3 bg-base-850 rounded-xl px-3 py-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-200">{d.name}</div>
                          <div className="text-[10px] text-slate-500">{d.nationality} · Skill {d.skill}/100 · ${(d.salary / 1_000_000).toFixed(1)}M/season</div>
                        </div>
                        <div className="flex gap-2 text-[10px] text-slate-500">
                          <span>Con {d.consistency}</span>
                          <span>Wet {d.wetSkill}</span>
                        </div>
                        <button onClick={() => assignMotorsportDriver(selectedTeam.id, idx)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-500/15 border border-accent-500/30 text-accent-300 hover:bg-accent-500/25 transition-all">
                          Hire
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scouting & Young Talent */}
          {selectedTeam && (
            <div className="panel p-4">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Search size={12} className="text-purple-400" /> Driver Scouting
              </h3>
              <p className="text-[10px] text-slate-500 mb-3">Scout young talent from feeder series. Cheaper but less experienced.</p>
              <button onClick={scoutNewDriver}
                disabled={company.motorsport.scoutedDrivers.length >= 4}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all mb-3">
                <Search size={12} className="inline mr-1.5" /> Scout New Talent
              </button>
              {company.motorsport.scoutedDrivers.length > 0 && (
                <div className="space-y-2">
                  {company.motorsport.scoutedDrivers.map(d => (
                    <div key={d.id} className="flex items-center gap-3 bg-base-850 rounded-xl px-3 py-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-200">{d.name} <span className="text-[10px] text-purple-400">ROOKIE</span></div>
                        <div className="text-[10px] text-slate-500">{d.nationality} · Skill {d.skill} · Consistency {d.consistency} · Wet {d.wetSkill} · ${(d.salary / 1_000_000).toFixed(1)}M</div>
                      </div>
                      {selectedTeam.drivers.length < 2 && (
                        <button onClick={() => signScouted(d.id, selectedTeam.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-ok-500/15 border border-ok-500/30 text-ok-400 hover:bg-ok-500/25 transition-all">
                          Sign
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sponsors Section */}
          {selectedTeam && (
            <div className="panel p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={12} className="text-yellow-400" /> Team Sponsors — {selectedTeam.name}
                </h3>
                <button
                  onClick={refreshSponsorMarket}
                  className="text-[10px] px-2 py-1 rounded bg-base-800 text-slate-400 hover:text-slate-200 transition-all"
                >
                  Refresh Market
                </button>
              </div>

              {/* Active Sponsors */}
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Active Contracts</div>
                {selectedTeam.sponsors.length === 0 ? (
                  <p className="text-xs text-slate-600 italic">No active sponsors signed.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedTeam.sponsors.map(s => {
                      const seasonsLeft = s.startSeason + s.contractSeasons - company.motorsport.currentSeason;
                      return (
                        <div key={s.id} className="bg-base-850 rounded-xl p-2.5 flex items-center justify-between border border-base-800">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                              <span>{s.logoEmoji}</span> {s.name}
                            </div>
                            <div className="text-[10px] text-slate-500 capitalize">{s.tier} Sponsor · ${ (s.revenue / 1e6).toFixed(1) }M/yr</div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 bg-base-800 px-2 py-0.5 rounded">
                            {seasonsLeft} season(s) left
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sponsor Market Opportunities */}
              <div className="pt-2 border-t border-base-800">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Market Deals Available</div>
                {company.motorsport.sponsorMarket.length === 0 ? (
                  <p className="text-xs text-slate-600 italic">No open market deals currently.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {company.motorsport.sponsorMarket.map(s => {
                      const tierCount = selectedTeam.sponsors.filter(sp => sp.tier === s.tier).length;
                      const maxPerTier: Record<string, number> = { title: 1, major: 2, minor: 3, technical: 2 };
                      const isFull = tierCount >= (maxPerTier[s.tier] ?? 1);

                      return (
                        <div key={s.id} className="bg-base-850 rounded-xl p-2.5 flex items-center justify-between border border-base-800">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                              <span>{s.logoEmoji}</span> {s.name}
                            </div>
                            <div className="text-[10px] text-slate-400 capitalize">
                              {s.tier} · <span className="text-ok-400 font-mono">+${(s.revenue / 1e6).toFixed(1)}M</span> · {s.contractSeasons} yr(s)
                            </div>
                          </div>
                          <button
                            onClick={() => attractMotorsportSponsor(selectedTeam.id, s.id)}
                            disabled={isFull}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                          >
                            {isFull ? "Tier Full" : "Sign Deal"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Facility Upgrade */}
          {selectedTeam && (
            <div className="panel p-4">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Wrench size={12} className="text-blue-400" /> Team Facilities
              </h3>
              <div className="flex items-center justify-between bg-base-850 rounded-xl px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-slate-200">
                    Current: <span className={`capitalize font-semibold ${FACILITY_COLORS[selectedTeam.facilityLevel]}`}>{selectedTeam.facilityLevel}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Better facilities earn more dev points and improve driver development</div>
                </div>
                {getNextFacilityLevel(selectedTeam.facilityLevel) && (
                  <button onClick={() => upgradeFacility(selectedTeam.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 transition-all shrink-0">
                    Upgrade to {getNextFacilityLevel(selectedTeam.facilityLevel)} · ${(getFacilityUpgradeCost(selectedTeam.facilityLevel) / 1_000_000).toFixed(0)}M
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== GUIDE TAB ===================== */}
      {activeTab === "guide" && (
        <div className="space-y-4">
          {/* Category selector */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {(Object.keys(CATEGORY_LABELS) as MotorsportCategory[]).map(cat => (
              <button key={cat} onClick={() => setGuideCategory(cat)}
                className={`px-2 py-2 rounded-lg text-xs font-medium transition-all border ${
                  guideCategory === cat ? CATEGORY_COLORS[cat] : "bg-base-850 border-base-800 text-slate-400 hover:border-base-700"
                }`}>
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Guide content */}
          {(() => {
            const guide = CATEGORY_GUIDES[guideCategory];
            const reg = CATEGORY_REGULATIONS[guideCategory];
            return (
              <div className="space-y-4">
                {/* Overview card */}
                <div className="panel p-5 relative overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none opacity-10"
                    style={{ background: "radial-gradient(ellipse at top left, rgba(34,211,238,0.4), transparent 60%)" }} />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                          <BookOpen size={18} className="text-accent-400" /> {guide.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-500">Difficulty:</span>
                            <DifficultyStars value={guide.difficulty} />
                            <span className="text-[10px] text-slate-400 ml-0.5">{DIFFICULTY_LABELS[guide.difficulty]}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-500">Prestige:</span>
                            <DifficultyStars value={guide.prestigeTier} />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500">Budget Range</div>
                        <div className="text-sm font-mono text-accent-300">
                          ${(guide.budgetRange[0] / 1_000_000).toFixed(0)}M – ${(guide.budgetRange[1] / 1_000_000).toFixed(0)}M
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{guide.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Iconic Races */}
                  <div className="panel p-4">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Award size={12} className="text-yellow-400" /> Iconic Races
                    </h4>
                    <div className="space-y-1.5">
                      {guide.iconicRaces.map(r => (
                        <div key={r} className="flex items-center gap-2 text-xs text-slate-400">
                          <ChevronRight size={10} className="text-accent-400" /> {r}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-base-800">
                      <div className="text-[10px] text-slate-500 mb-1.5">Real-World Series</div>
                      <div className="flex flex-wrap gap-1">
                        {guide.realWorldSeries.map(s => (
                          <span key={s} className="text-[10px] px-1.5 py-0.5 bg-base-800 rounded text-slate-400">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recommended Specs */}
                  <div className="panel p-4">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Target size={12} className="text-accent-400" /> Recommended Specs
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Power</span>
                        <span className="text-slate-300 font-mono">{guide.recommendedSpecs.powerRange[0]}–{guide.recommendedSpecs.powerRange[1]} hp</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Weight</span>
                        <span className="text-slate-300 font-mono">{guide.recommendedSpecs.weightRange[0]}–{guide.recommendedSpecs.weightRange[1]} kg</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Aero Importance</span>
                        <span className={`capitalize font-medium ${
                          guide.recommendedSpecs.aeroImportance === "critical" ? "text-danger-400" :
                          guide.recommendedSpecs.aeroImportance === "high" ? "text-warn-400" :
                          guide.recommendedSpecs.aeroImportance === "medium" ? "text-accent-300" : "text-slate-400"
                        }`}>{guide.recommendedSpecs.aeroImportance}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Reliability</span>
                        <span className={`capitalize font-medium ${
                          guide.recommendedSpecs.reliabilityImportance === "critical" ? "text-danger-400" :
                          guide.recommendedSpecs.reliabilityImportance === "high" ? "text-warn-400" :
                          guide.recommendedSpecs.reliabilityImportance === "medium" ? "text-accent-300" : "text-slate-400"
                        }`}>{guide.recommendedSpecs.reliabilityImportance}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Regulations */}
                <div className="panel p-4">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Shield size={12} className="text-warn-400" /> Technical Regulations
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-base-850 rounded-lg p-2.5 text-center">
                      <div className="text-[10px] text-slate-500 mb-1">Min Weight</div>
                      <div className="font-mono text-sm text-slate-200">{reg.minWeightKg} kg</div>
                    </div>
                    <div className="bg-base-850 rounded-lg p-2.5 text-center">
                      <div className="text-[10px] text-slate-500 mb-1">Max Power</div>
                      <div className="font-mono text-sm text-slate-200">{reg.maxPowerHp} hp</div>
                    </div>
                    <div className="bg-base-850 rounded-lg p-2.5 text-center">
                      <div className="text-[10px] text-slate-500 mb-1">Pit Stops</div>
                      <div className="font-mono text-sm text-slate-200">{reg.mandatoryPitStops}+</div>
                    </div>
                    <div className="bg-base-850 rounded-lg p-2.5 text-center">
                      <div className="text-[10px] text-slate-500 mb-1">Fuel Cap</div>
                      <div className="font-mono text-sm text-slate-200">{reg.fuelCapacityLiters}L</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {reg.evRequirement && <span className="text-[10px] px-1.5 py-0.5 bg-ok-500/15 text-ok-400 rounded border border-ok-500/30">Hybrid/EV Required</span>}
                    {reg.bopEnabled && <span className="text-[10px] px-1.5 py-0.5 bg-warn-500/15 text-warn-400 rounded border border-warn-500/30">BoP Active</span>}
                    {reg.restrictorPlate && <span className="text-[10px] px-1.5 py-0.5 bg-danger-500/15 text-danger-400 rounded border border-danger-500/30">Restrictor Plate</span>}
                    {reg.maxBudgetCap > 0 && <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/15 text-purple-400 rounded border border-purple-500/30">Budget Cap ${(reg.maxBudgetCap/1e6).toFixed(0)}M</span>}
                    {reg.maxFuelFlowKgH > 0 && <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/15 text-blue-400 rounded border border-blue-500/30">Fuel Flow {reg.maxFuelFlowKgH} kg/h</span>}
                    <span className="text-[10px] px-1.5 py-0.5 bg-base-800 text-slate-400 rounded">Tires: {reg.tireCompoundsAllowed.join(", ")}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-base-800 text-slate-400 rounded">Drivers: {reg.minDriversPerTeam}–{reg.maxDriversPerTeam}</span>
                  </div>
                </div>

                {/* Compliance checker */}
                <div className="panel p-4">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    {compliance.passed
                      ? <CheckCircle size={12} className="text-ok-400" />
                      : <XCircle size={12} className="text-danger-400" />
                    }
                    Vehicle Compliance — {CATEGORY_LABELS[guideCategory]}
                  </h4>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`text-2xl font-bold font-mono ${compliance.passed ? "text-ok-400" : "text-danger-400"}`}>
                      {compliance.overallScore}%
                    </div>
                    <div className={`text-xs font-semibold ${compliance.passed ? "text-ok-400" : "text-danger-400"}`}>
                      {compliance.passed ? "COMPLIANT" : "NON-COMPLIANT"}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {compliance.checks.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {c.status === "pass" ? <CheckCircle size={12} className="text-ok-400 shrink-0" />
                          : c.status === "warning" ? <Info size={12} className="text-warn-400 shrink-0" />
                          : <XCircle size={12} className="text-danger-400 shrink-0" />}
                        <span className="text-slate-300 w-36 shrink-0">{c.label}</span>
                        <span className="text-slate-500 truncate">{c.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Considerations & Strategy Tips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="panel p-4">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <AlertTriangle size={12} className="text-warn-400" /> Key Considerations
                    </h4>
                    <div className="space-y-2">
                      {guide.keyConsiderations.map((c, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
                          <span className="text-warn-400 mt-0.5 shrink-0">•</span> {c}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="panel p-4">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Settings size={12} className="text-accent-400" /> Strategy Tips
                    </h4>
                    <div className="space-y-2">
                      {guide.strategyTips.map((t, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
                          <span className="text-accent-400 mt-0.5 shrink-0">→</span> {t}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Season Calendar */}
                <div className="panel p-4">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Gauge size={12} className="text-blue-400" /> Season Calendar — {guide.name}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {getSeasonCalendar(guideCategory).tracks.map((trackId, i) => (
                      <div key={i} className="bg-base-850 rounded-lg px-3 py-2 text-center min-w-[100px]">
                        <div className="text-[10px] text-slate-500 mb-0.5">R{i + 1}</div>
                        <div className="text-xs font-medium text-slate-300">{TRACKS[trackId]?.name ?? trackId}</div>
                        <div className="text-[10px] text-slate-600">{TRACKS[trackId]?.length?.toFixed(2) ?? "?"} km</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ===================== STRATEGY TAB ===================== */}
      {activeTab === "strategy" && (
        <div className="space-y-4">
          {company.motorsport.teams.length === 0 ? (
            <div className="panel p-10 text-center">
              <Settings size={36} className="mx-auto text-slate-700 mb-3" />
              <p className="text-slate-500 text-sm">Create a team first to configure race strategy.</p>
            </div>
          ) : (
            <>
              {/* Team selector */}
              <div className="flex gap-2 flex-wrap">
                {company.motorsport.teams.map(t => (
                  <button key={t.id} onClick={() => setSelectedTeamId(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      selectedTeamId === t.id ? CATEGORY_COLORS[t.category] : "bg-base-850 border-base-800 text-slate-400"
                    }`}>
                    {t.name}
                  </button>
                ))}
              </div>

              {selectedTeam && (
                <div className="panel p-5">
                  <h3 className="text-sm font-semibold text-slate-100 mb-4 flex items-center gap-2">
                    <Settings size={14} className="text-accent-400" /> Race Strategy — {selectedTeam.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Deploy Mode */}
                    <div>
                      <label className="label-mono block mb-1.5">Deploy Mode</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(["conservative", "balanced", "aggressive", "qualifying"] as const).map(m => (
                          <button key={m} onClick={() => updateStrategy(selectedTeam.id, { deployMode: m })}
                            className={`px-2 py-2 rounded-lg text-xs font-medium transition-all border capitalize ${
                              selectedTeam.strategy.deployMode === m
                                ? "bg-accent-500/20 border-accent-500/50 text-accent-300"
                                : "bg-base-850 border-base-800 text-slate-400 hover:border-base-700"
                            }`}>{m}</button>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-600 mt-1">
                        {selectedTeam.strategy.deployMode === "aggressive" ? "⚠ Higher DNF risk, but faster pace" :
                         selectedTeam.strategy.deployMode === "qualifying" ? "🏁 Maximum attack — high risk" :
                         selectedTeam.strategy.deployMode === "conservative" ? "🛡 Lower DNF risk, steady pace" :
                         "⚖ Balanced approach"}
                      </p>
                    </div>

                    {/* Pit Stops */}
                    <div>
                      <label className="label-mono block mb-1.5">Pit Stop Count</label>
                      <div className="flex items-center gap-2">
                        <input type="range" min={0} max={5} step={1}
                          value={selectedTeam.strategy.pitStopCount}
                          onChange={e => updateStrategy(selectedTeam.id, { pitStopCount: +e.target.value })}
                          className="flex-1" />
                        <span className="font-mono text-sm text-accent-300 w-8 text-right">{selectedTeam.strategy.pitStopCount}</span>
                      </div>
                    </div>

                    {/* Fuel Load */}
                    <div>
                      <label className="label-mono block mb-1.5">Fuel Load</label>
                      <div className="flex items-center gap-2">
                        <input type="range" min={0.3} max={1} step={0.05}
                          value={selectedTeam.strategy.fuelLoad}
                          onChange={e => updateStrategy(selectedTeam.id, { fuelLoad: +e.target.value })}
                          className="flex-1" />
                        <span className="font-mono text-sm text-accent-300 w-12 text-right">{Math.round(selectedTeam.strategy.fuelLoad * 100)}%</span>
                      </div>
                    </div>

                    {/* Wet strategy */}
                    <div>
                      <label className="label-mono block mb-1.5">Wet Weather Strategy</label>
                      <div className="grid grid-cols-3 gap-1">
                        {(["stay_out", "immediate_pit", "wait_one_lap"] as const).map(w => (
                          <button key={w} onClick={() => updateStrategy(selectedTeam.id, { wetStrategy: w })}
                            className={`px-1.5 py-1.5 rounded-lg text-[10px] font-medium transition-all border ${
                              selectedTeam.strategy.wetStrategy === w
                                ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                                : "bg-base-850 border-base-800 text-slate-400"
                            }`}>
                            {w === "stay_out" ? "Stay Out" : w === "immediate_pit" ? "Pit Now" : "Wait 1 Lap"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tire strategy */}
                    <div className="md:col-span-2">
                      <label className="label-mono block mb-1.5">Tire Strategy (per stint)</label>
                      <div className="flex gap-1.5 flex-wrap">
                        {selectedTeam.strategy.tireStrategy.map((tire, i) => (
                          <div key={i} className="flex items-center gap-1 bg-base-850 rounded-lg px-2.5 py-1.5 border border-base-800">
                            <span className="text-[10px] text-slate-500">S{i + 1}</span>
                            <select value={tire}
                              onChange={e => {
                                const newTires = [...selectedTeam.strategy.tireStrategy];
                                newTires[i] = e.target.value as TireChoice;
                                updateStrategy(selectedTeam.id, { tireStrategy: newTires });
                              }}
                              className="bg-transparent text-xs text-slate-200 focus:outline-none">
                              {(["soft", "medium", "hard", "intermediate", "wet"] as TireChoice[]).map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                        <button onClick={() => updateStrategy(selectedTeam.id, {
                          tireStrategy: [...selectedTeam.strategy.tireStrategy, "medium"]
                        })}
                          className="px-2 py-1 rounded-lg text-[10px] border border-dashed border-base-700 text-slate-500 hover:text-accent-300 hover:border-accent-500/30 transition-all">
                          + Add stint
                        </button>
                      </div>
                    </div>

                    {/* Undercut / Overcut toggles */}
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={selectedTeam.strategy.undercut}
                          onChange={e => updateStrategy(selectedTeam.id, { undercut: e.target.checked })}
                          className="rounded" />
                        <span className="text-xs text-slate-300">Undercut strategy</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={selectedTeam.strategy.overcut}
                          onChange={e => updateStrategy(selectedTeam.id, { overcut: e.target.checked })}
                          className="rounded" />
                        <span className="text-xs text-slate-300">Overcut strategy</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ===================== CALENDAR TAB ===================== */}
      {activeTab === "calendar" && (
        <div className="space-y-4">
          <div className="panel p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Calendar size={18} className="text-cyan-400" /> Season Championship Calendar
                </h3>
                <p className="text-xs text-slate-500">Official grand prix schedule, circuit characteristics, & weekend status</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Category:</span>
                <div className="flex gap-1 flex-wrap">
                  {(Object.keys(CATEGORY_LABELS) as MotorsportCategory[]).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setGuideCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                        guideCategory === cat ? CATEGORY_COLORS[cat] : "bg-base-850 border-base-800 text-slate-400 hover:border-base-700"
                      }`}
                    >
                      {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Circuit Grid (FC26 / F1 Style Weekend Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {getSeasonCalendar(guideCategory).tracks.map((trackId, idx) => {
                const track = TRACKS[trackId];
                if (!track) return null;
                const roundNum = idx + 1;
                return (
                  <div key={trackId} className="bg-base-950/80 rounded-xl p-4 border border-white/5 hover:border-cyan-400/40 transition-all card-hover flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10 font-mono font-black text-4xl text-slate-400 pointer-events-none">
                      R{roundNum}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                          ROUND {roundNum}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                          🏁 {track.country}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-100 mb-1">{track.name}</h4>
                      <p className="text-[11px] text-slate-400 mb-3">{track.length} km · {track.highSpeed ? "High Speed Circuit" : "Technical Circuit"}</p>

                      <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono bg-base-900/80 rounded-lg p-2 mb-3 border border-base-800">
                        <div>
                          <div className="text-slate-500 font-sans text-[9px]">Length</div>
                          <div className="text-slate-200 font-bold">{track.length} km</div>
                        </div>
                        <div>
                          <div className="text-slate-500 font-sans text-[9px]">Pace Type</div>
                          <div className="text-slate-200 font-bold">{track.highSpeed ? "Speed" : "Tech"}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 font-sans text-[9px]">Elevation</div>
                          <div className="text-slate-200 font-bold">{track.altitudeChange || 15}m</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                      <span className="text-slate-500 font-mono">STATUS:</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle size={12} /> CONFIRMED
                      </span>
                    </div>
                  </div>
                );
            </div>
          </div>
        </div>
      )}

      {/* ===================== GOVERNING BODY TAB ===================== */}
      {activeTab === "governing" && (
        <div className="space-y-4">
          <div className="panel p-6 border-cyan-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <Building2 size={140} className="text-cyan-400" />
            </div>

            <div className="relative z-10 flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <Building2 size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">WORLD MOTORSPORT COUNCIL</span>
                    <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full">OFFICIAL GOVERNING BODY</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-100">FIA International Motorsport Authority</h2>
                  <p className="text-xs text-slate-400">Regulating technical specifications, race calendars, budget caps & pit protocols</p>
                </div>
              </div>

              {/* Category selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Series:</span>
                <div className="flex gap-1 flex-wrap">
                  {(Object.keys(CATEGORY_LABELS) as MotorsportCategory[]).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setGuideCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                        guideCategory === cat ? CATEGORY_COLORS[cat] : "bg-base-850 border-base-800 text-slate-400 hover:border-base-700"
                      }`}
                    >
                      {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Official Directives & Regulations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <div className="bg-base-950/80 rounded-xl p-4 border border-white/5">
                <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Max Power Output</div>
                <div className="text-xl font-black font-mono text-cyan-300">{CATEGORY_REGULATIONS[guideCategory].maxPowerHp} HP</div>
                <div className="text-[10px] text-slate-500 mt-1">Enforced by fuel flow restrictors</div>
              </div>
              <div className="bg-base-950/80 rounded-xl p-4 border border-white/5">
                <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Minimum Car Weight</div>
                <div className="text-xl font-black font-mono text-slate-200">{CATEGORY_REGULATIONS[guideCategory].minWeightKg} kg</div>
                <div className="text-[10px] text-slate-500 mt-1">Post-race ballast scrutiny</div>
              </div>
              <div className="bg-base-950/80 rounded-xl p-4 border border-white/5">
                <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Budget Cap Mandate</div>
                <div className="text-xl font-black font-mono text-emerald-400">
                  {CATEGORY_REGULATIONS[guideCategory].maxBudgetCap > 0 ? `$${(CATEGORY_REGULATIONS[guideCategory].maxBudgetCap / 1e6).toFixed(0)}M` : "NO CAP"}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Financial fair play audit</div>
              </div>
              <div className="bg-base-950/80 rounded-xl p-4 border border-white/5">
                <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Mandatory Pit Stops</div>
                <div className="text-xl font-black font-mono text-purple-400">{CATEGORY_REGULATIONS[guideCategory].mandatoryPitStops} Stops</div>
                <div className="text-[10px] text-slate-500 mt-1">Multi-compound tire rules</div>
              </div>
            </div>

            {/* Official Regulation Mandates List */}
            <div className="bg-base-950/60 rounded-xl p-4 border border-white/5 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Gavel size={14} className="text-yellow-400" /> Active Technical Directives ({CATEGORY_LABELS[guideCategory]})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div className="bg-base-900/60 p-3 rounded-lg border border-base-800 flex items-center justify-between">
                  <span className="text-slate-300">Balance of Performance (BoP):</span>
                  <span className={`font-semibold ${CATEGORY_REGULATIONS[guideCategory].bopEnabled ? "text-emerald-400" : "text-slate-500"}`}>
                    {CATEGORY_REGULATIONS[guideCategory].bopEnabled ? "ACTIVE (STRICT)" : "DISABLED"}
                  </span>
                </div>
                <div className="bg-base-900/60 p-3 rounded-lg border border-base-800 flex items-center justify-between">
                  <span className="text-slate-300">Hybrid / EV Architecture:</span>
                  <span className={`font-semibold ${CATEGORY_REGULATIONS[guideCategory].evRequirement ? "text-cyan-400" : "text-slate-500"}`}>
                    {CATEGORY_REGULATIONS[guideCategory].evRequirement ? "MANDATORY" : "OPTIONAL"}
                  </span>
                </div>
                <div className="bg-base-900/60 p-3 rounded-lg border border-base-800 flex items-center justify-between">
                  <span className="text-slate-300">Tire Sets Per Race Weekend:</span>
                  <span className="font-semibold text-slate-200">{CATEGORY_REGULATIONS[guideCategory].maxTireSetsPerRace} Sets Max</span>
                </div>
                <div className="bg-base-900/60 p-3 rounded-lg border border-base-800 flex items-center justify-between">
                  <span className="text-slate-300">Air Intake Restrictor Plate:</span>
                  <span className={`font-semibold ${CATEGORY_REGULATIONS[guideCategory].restrictorPlate ? "text-amber-400" : "text-slate-500"}`}>
                    {CATEGORY_REGULATIONS[guideCategory].restrictorPlate ? "REQUIRED" : "NOT REQUIRED"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== SEASON TAB ===================== */}
      {activeTab === "season" && (
        <div className="space-y-4">
          <div className="panel p-5">
            <h3 className="text-sm font-semibold text-slate-100 mb-1">Simulate Championship Season</h3>
            <p className="text-xs text-slate-500 mb-4">Uses your current design's performance to simulate all team seasons.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              <div className="bg-base-850 rounded-lg p-2.5 text-center">
                <Zap size={12} className="mx-auto text-accent-400 mb-1" />
                <div className="font-mono text-sm text-slate-200">{Math.round(sim.peakPower)}</div>
                <div className="text-[9px] text-slate-600">hp</div>
              </div>
              <div className="bg-base-850 rounded-lg p-2.5 text-center">
                <Gauge size={12} className="mx-auto text-slate-400 mb-1" />
                <div className="font-mono text-sm text-slate-200">{Math.round(sim.weight)}</div>
                <div className="text-[9px] text-slate-600">kg</div>
              </div>
              <div className="bg-base-850 rounded-lg p-2.5 text-center">
                <TrendingUp size={12} className="mx-auto text-blue-400 mb-1" />
                <div className="font-mono text-sm text-slate-200">{sim.downforce.toFixed(0)}</div>
                <div className="text-[9px] text-slate-600">kg DnF</div>
              </div>
              <div className="bg-base-850 rounded-lg p-2.5 text-center">
                <Shield size={12} className="mx-auto text-ok-400 mb-1" />
                <div className="font-mono text-sm text-slate-200">{Math.round(sim.reliability * 100)}%</div>
                <div className="text-[9px] text-slate-600">reliability</div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="bg-base-850 rounded-xl p-3 border border-base-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-warn-400" />
                  <span className="text-slate-300">Technical Scrutiny Checks</span>
                </div>
                <span className="text-[10px] text-slate-500">Non-compliant designs risk pace penalties or DSQ</span>
              </div>
              {company.motorsport.teams.map(t => {
                const isHybrid = design.engine.layout === "hybrid" || design.engine.hybridArchitecture !== "none" || design.engine.hasMguH;
                const c = evaluateCompliance(sim.peakPower, sim.weight, isHybrid, t.category);
                return (
                  <div key={t.id} className="flex items-center justify-between bg-base-850/80 rounded-lg px-3 py-1.5 text-xs">
                    <span className="text-slate-300 font-medium">{t.name} ({CATEGORY_LABELS[t.category]})</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      c.passed ? "text-ok-400 bg-ok-500/10 border-ok-500/30" :
                      c.overallScore >= 50 ? "text-warn-400 bg-warn-500/10 border-warn-500/30" :
                      "text-danger-400 bg-danger-500/10 border-danger-500/30"
                    }`}>
                      {c.passed ? "PASSED (100%)" : c.overallScore >= 50 ? `PENALIZED (${c.overallScore}%)` : `DSQ RISK (${c.overallScore}%)`}
                    </span>
                  </div>
                );
              })}
            </div>
            {company.motorsport.teams.filter(t => t.status === "competing").length === 0 ? (
              <div className="text-center py-4">
                <AlertTriangle size={20} className="mx-auto text-warn-400 mb-2" />
                <p className="text-sm text-slate-500">No teams are ready to compete.</p>
                <p className="text-xs text-slate-600 mt-1">Hire at least 1 driver for a team to make them competing.</p>
              </div>
            ) : (
              <button
                onClick={() => handleStartLiveRace()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-sky-500/20 border border-cyan-400/50 text-cyan-200 hover:bg-cyan-500/30 transition-all text-sm font-bold shadow-[0_0_20px_rgba(34,211,238,0.2)]"
              >
                <Play size={16} className="text-cyan-400 fill-cyan-400" /> Start Live Season Simulation {company.motorsport.currentSeason}
              </button>
            )}
          </div>

          {/* Season results with expanded data */}
          {company.motorsport.teams.map(t => {
            const last = t.seasonResults[t.seasonResults.length - 1];
            if (!last) return null;
            return (
              <div key={t.id} className="panel p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-100">{t.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">P{last.position}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${CATEGORY_COLORS[t.category]}`}>
                      {CATEGORY_LABELS[t.category]}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-1.5 mb-3 text-center text-xs">
                  <div className="bg-base-850 rounded p-2"><div className="font-mono text-slate-200 font-bold">{last.points}</div><div className="text-slate-600 text-[9px]">Points</div></div>
                  <div className="bg-base-850 rounded p-2"><div className="font-mono text-ok-400 font-bold">{last.wins}</div><div className="text-slate-600 text-[9px]">Wins</div></div>
                  <div className="bg-base-850 rounded p-2"><div className="font-mono text-accent-300 font-bold">{last.podiums}</div><div className="text-slate-600 text-[9px]">Podiums</div></div>
                  <div className="bg-base-850 rounded p-2"><div className="font-mono text-purple-400 font-bold">{last.fastestLaps}</div><div className="text-slate-600 text-[9px]">FL</div></div>
                  <div className="bg-base-850 rounded p-2"><div className="font-mono text-blue-400 font-bold">{last.polePositions}</div><div className="text-slate-600 text-[9px]">Poles</div></div>
                  <div className="bg-base-850 rounded p-2"><div className="font-mono text-danger-400 font-bold">{last.dnfs}</div><div className="text-slate-600 text-[9px]">DNFs</div></div>
                </div>
                {last.penaltyPoints > 0 && (
                  <div className="text-[10px] text-warn-400 mb-2">⚠ {last.penaltyPoints} penalty points accumulated this season</div>
                )}
                <div className="flex flex-wrap gap-1">
                  {last.raceResults.map(r => (
                    <div key={r.round} className={`text-[10px] px-2 py-1 rounded font-mono ${
                      r.position === 1 ? "bg-yellow-500/20 text-yellow-400" :
                      r.position <= 3 ? "bg-accent-500/20 text-accent-300" :
                      r.position === 0 ? "bg-danger-500/20 text-danger-400" :
                      "bg-base-850 text-slate-500"
                    }`}>
                      R{r.round}: {r.position === 0 ? "DNF" : `P${r.position}`}
                      {r.fastestLap && " ⚡"}
                      {r.polePosition && " 🏁"}
                    </div>
                  ))}
                </div>
                {/* Championship Standings */}
                {last.standings.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-base-800">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Championship Standings</div>
                    <div className="space-y-1">
                      {last.standings.slice(0, 8).map(s => (
                        <div key={s.teamId} className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${s.isPlayer ? "bg-accent-500/10 border border-accent-500/20" : ""}`}>
                          <span className="w-6 font-mono text-slate-500">{s.position}.</span>
                          <span className={`flex-1 ${s.isPlayer ? "text-accent-300 font-semibold" : "text-slate-400"}`}>{s.teamName}</span>
                          <span className="font-mono text-slate-300 w-12 text-right">{s.points}pts</span>
                          <span className="text-[10px] text-slate-600 w-10 text-right">{s.wins}W</span>
                          {s.gapToLeader > 0 && <span className="text-[10px] text-slate-600 w-12 text-right">-{s.gapToLeader}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ===================== ANALYTICS TAB ===================== */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          {company.motorsport.teams.length === 0 ? (
            <div className="panel p-10 text-center">
              <BarChart3 size={36} className="mx-auto text-slate-700 mb-3" />
              <p className="text-slate-500 text-sm">No data yet. Create teams and simulate seasons.</p>
            </div>
          ) : (
            <>
              {/* Team selector */}
              <div className="flex gap-2 flex-wrap">
                {company.motorsport.teams.map(t => (
                  <button key={t.id} onClick={() => setSelectedTeamId(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      selectedTeamId === t.id ? CATEGORY_COLORS[t.category] : "bg-base-850 border-base-800 text-slate-400"
                    }`}>
                    {t.name}
                  </button>
                ))}
              </div>

              {selectedTeam && (
                <>
                  {/* Points Progression */}
                  {pointsSeries.length > 0 && (
                    <div className="panel p-4">
                      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <TrendingUp size={12} className="text-accent-400" /> Points Progression
                      </h3>
                      <LineChart series={pointsSeries} height={160} xLabel="Season" yLabel="Points" />
                    </div>
                  )}

                  {/* Driver Comparison */}
                  {selectedTeam.drivers.length > 0 && (
                    <div className="panel p-4">
                      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Users size={12} className="text-accent-400" /> Driver Stats Comparison
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedTeam.drivers.map(d => {
                          const devLogs = selectedTeam.driverDevLogs.filter(l => l.driverId === d.id);
                          const latestDev = devLogs[devLogs.length - 1];
                          const stats = [
                            { label: "Skill", value: d.skill, color: "bg-accent-400" },
                            { label: "Consistency", value: d.consistency, color: "bg-ok-400" },
                            { label: "Wet Skill", value: d.wetSkill, color: "bg-blue-400" },
                            { label: "Aggression", value: d.aggression, color: "bg-warn-400" },
                            { label: "Experience", value: d.experience, color: "bg-purple-400" },
                          ];
                          return (
                            <div key={d.id} className="bg-base-850 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <div className="text-sm font-semibold text-slate-200">{d.name}</div>
                                  <div className="text-[10px] text-slate-500">{d.nationality} · ${(d.salary / 1e6).toFixed(1)}M</div>
                                </div>
                                {latestDev && (
                                  <div className="text-right">
                                    <div className={`text-xs font-medium ${latestDev.formRating > 70 ? "text-ok-400" : latestDev.formRating > 40 ? "text-warn-400" : "text-danger-400"}`}>
                                      Form: {Math.round(latestDev.formRating)}
                                    </div>
                                    <div className={`text-[10px] ${latestDev.morale > 70 ? "text-ok-400" : "text-warn-400"}`}>
                                      Morale: {Math.round(latestDev.morale)}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="space-y-2">
                                {stats.map(s => (
                                  <div key={s.label}>
                                    <div className="flex justify-between text-[10px] mb-0.5">
                                      <span className="text-slate-500">{s.label}</span>
                                      <span className="text-slate-300 font-mono">{s.value}</span>
                                    </div>
                                    <div className="h-1.5 bg-base-800 rounded-full overflow-hidden">
                                      <div className={`h-full ${s.color} rounded-full transition-all`} style={{ width: `${s.value}%` }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {latestDev && (
                                <div className="mt-3 pt-2 border-t border-base-800 text-[10px] text-slate-500">
                                  {latestDev.seasonHighlight}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Team Budget & Facilities */}
                  <div className="panel p-4">
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <BarChart3 size={12} className="text-blue-400" /> Team Overview
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-base-850 rounded-lg p-3 text-center">
                        <div className="text-[10px] text-slate-500 mb-1">Budget</div>
                        <div className="font-mono text-sm font-bold text-accent-300">${(selectedTeam.budget / 1e6).toFixed(0)}M</div>
                      </div>
                      <div className="bg-base-850 rounded-lg p-3 text-center">
                        <div className="text-[10px] text-slate-500 mb-1">Facility</div>
                        <div className={`font-mono text-sm font-bold capitalize ${FACILITY_COLORS[selectedTeam.facilityLevel]}`}>{selectedTeam.facilityLevel}</div>
                      </div>
                      <div className="bg-base-850 rounded-lg p-3 text-center">
                        <div className="text-[10px] text-slate-500 mb-1">Tech Pool</div>
                        <div className="font-mono text-sm font-bold text-purple-400">{selectedTeam.techTransferPool}</div>
                      </div>
                      <div className="bg-base-850 rounded-lg p-3 text-center">
                        <div className="text-[10px] text-slate-500 mb-1">Penalty Pts</div>
                        <div className={`font-mono text-sm font-bold ${selectedTeam.penaltyPoints > 5 ? "text-danger-400" : "text-slate-300"}`}>{selectedTeam.penaltyPoints}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ===================== TECH TRANSFER TAB ===================== */}
      {activeTab === "transfer" && (
        <div className="space-y-4">
          <div className="panel p-5">
            <h3 className="text-sm font-semibold text-slate-100 mb-1 flex items-center gap-2">
              <ArrowRightLeft size={14} className="text-accent-400" /> Technology Transfer
            </h3>
            <p className="text-xs text-slate-500 mb-4">Transfer racing insights to your production cars, or vice versa.</p>
            <div className="space-y-3">
              <div>
                <label className="label-mono block mb-1">Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setTransferDir("race_to_production")}
                    className={`p-3 rounded-xl text-xs font-medium border transition-all ${transferDir === "race_to_production" ? "bg-ok-500/15 border-ok-500/30 text-ok-400" : "bg-base-850 border-base-800 text-slate-400"}`}>
                    🏁 Race → Production<br /><span className="text-[10px] opacity-70">Improve road cars with race data</span>
                  </button>
                  <button onClick={() => setTransferDir("production_to_race")}
                    className={`p-3 rounded-xl text-xs font-medium border transition-all ${transferDir === "production_to_race" ? "bg-blue-500/15 border-blue-500/30 text-blue-400" : "bg-base-850 border-base-800 text-slate-400"}`}>
                    🔬 Production → Race<br /><span className="text-[10px] opacity-70">Boost race performance with R&D</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="label-mono block mb-1">Tech Points to Transfer: {transferPoints}</label>
                <input type="range" min={5} max={50} step={5} value={transferPoints}
                  onChange={e => setTransferPoints(+e.target.value)} className="w-full" />
              </div>
              <div className="space-y-2">
                {company.motorsport.teams.filter(t => t.techTransferPool > 0).map(t => (
                  <div key={t.id} className="flex items-center gap-3 bg-base-850 rounded-xl px-3 py-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-200">{t.name}</div>
                      <div className="text-[10px] text-slate-500">{t.techTransferPool} tech points available</div>
                    </div>
                    <button
                      onClick={() => transferMotorsportTech(t.id, transferDir, transferPoints)}
                      disabled={t.techTransferPool < transferPoints}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-500/15 border border-accent-500/30 text-accent-300 hover:bg-accent-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Transfer {transferPoints}pts
                    </button>
                  </div>
                ))}
                {company.motorsport.teams.filter(t => t.techTransferPool > 0).length === 0 && (
                  <p className="text-slate-600 text-sm text-center py-4">No teams with tech points. Simulate seasons to earn points.</p>
                )}
              </div>
            </div>
          </div>

          {/* Transfer history */}
          {company.motorsport.techTransferHistory.length > 0 && (
            <div className="panel p-4">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Transfer History</h3>
              <div className="space-y-2">
                {company.motorsport.techTransferHistory.slice(-10).reverse().map((t, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span className="text-slate-600 font-mono w-14">Mo. {t.month}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${t.direction === "race_to_production" ? "bg-ok-500/15 text-ok-400" : "bg-blue-500/15 text-blue-400"}`}>
                      {t.direction === "race_to_production" ? "Race→Prod" : "Prod→Race"}
                    </span>
                    <span className="flex-1 text-slate-400">{t.bonus}</span>
                    <span className="text-accent-300 font-mono">{t.points}pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== HISTORY TAB ===================== */}
      {activeTab === "history" && (
        <div className="space-y-3">
          {company.motorsport.teams.length === 0 ? (
            <div className="panel p-10 text-center">
              <History size={36} className="mx-auto text-slate-700 mb-3" />
              <p className="text-slate-500 text-sm">No history yet. Create teams and simulate seasons.</p>
            </div>
          ) : (
            company.motorsport.teams.map(t => (
              <div key={t.id} className="panel p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-100">{t.name}</h3>
                  <div className="flex items-center gap-2">
                    {t.championships > 0 && <span className="flex items-center gap-1 text-yellow-400 text-xs"><Trophy size={11} />{t.championships} titles</span>}
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[t.category]}`}>{CATEGORY_LABELS[t.category]}</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-3 text-center text-xs">
                  <div className="bg-base-850 rounded p-2"><div className="font-mono text-ok-400 font-bold text-base">{t.wins}</div><div className="text-slate-600 text-[9px]">All-time Wins</div></div>
                  <div className="bg-base-850 rounded p-2"><div className="font-mono text-accent-300 font-bold text-base">{t.podiums}</div><div className="text-slate-600 text-[9px]">Podiums</div></div>
                  <div className="bg-base-850 rounded p-2"><div className="font-mono text-purple-400 font-bold text-base">{t.fastestLaps}</div><div className="text-slate-600 text-[9px]">Fastest Laps</div></div>
                  <div className="bg-base-850 rounded p-2"><div className="font-mono text-slate-200 font-bold text-base">{t.seasonResults.length}</div><div className="text-slate-600 text-[9px]">Seasons</div></div>
                </div>
                {t.seasonResults.length > 0 && (
                  <div className="space-y-1">
                    {t.seasonResults.map(r => (
                      <div key={r.season} className="flex items-center gap-3 text-xs bg-base-850/50 rounded px-2 py-1.5">
                        <span className="text-slate-500 w-16">Season {r.season}</span>
                        <span className="font-mono text-slate-400 w-8">P{r.position}</span>
                        <span className={`font-mono font-semibold ${r.wins > 0 ? "text-ok-400" : "text-slate-300"}`}>{r.points}pts</span>
                        <span className="text-slate-500">{r.wins}W / {r.podiums}P / {r.fastestLaps}FL / {r.dnfs}DNF</span>
                        {r.penaltyPoints > 0 && <span className="text-warn-400">{r.penaltyPoints}pen</span>}
                        {r.wins >= 3 && <span className="ml-auto text-yellow-400 flex items-center gap-1"><Medal size={10} /> Champion</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
      {/* ===================== LIVE RACE TELEMETRY MODAL ===================== */}
      {showLiveRaceModal && liveRaceState && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-4xl w-full p-6 shadow-[0_0_50px_rgba(34,211,238,0.2)] flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
                  <Radio size={20} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">LIVE TELEMETRY FEED</span>
                    <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">RACE ACTIVE</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-100">Round {liveRaceState.round}/{liveRaceState.totalRounds} — {liveRaceState.trackName}</h2>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowLiveRaceModal(false);
                  simulateMotorsportSeason(sim.peakPower, sim.weight, sim.downforce / 100, sim.reliability);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-all shadow-[0_0_12px_rgba(34,211,238,0.2)]"
              >
                Skip to Final Results ➔
              </button>
            </div>

            {/* Lap Counter & Control Bar */}
            <div className="bg-base-950/80 rounded-xl p-4 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <div className="label-mono">Current Lap</div>
                  <div className="font-mono text-2xl font-black text-cyan-300">{liveRaceState.lap} <span className="text-xs text-slate-500 font-normal">/ {liveRaceState.totalLaps}</span></div>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <div className="label-mono">Track Conditions</div>
                  <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">Dry · 24°C Track</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (liveRaceState.lap < liveRaceState.totalLaps) {
                      setLiveRaceState(prev => prev ? ({
                        ...prev,
                        lap: prev.lap + 1,
                        feed: [
                          {
                            time: `LAP ${prev.lap + 1}`,
                            text: prev.lap % 4 === 0 ? "Apex Racing sets personal best sector 2 time!" : "Drivers maintaining gap on main straight.",
                            type: prev.lap % 4 === 0 ? "fastest" : "info"
                          },
                          ...prev.feed
                        ]
                      }) : null);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-base-850 border border-base-700 text-slate-300 hover:bg-base-800"
                >
                  Step Lap ➔
                </button>
                <button
                  onClick={() => {
                    setShowLiveRaceModal(false);
                    simulateMotorsportSeason(sim.peakPower, sim.weight, sim.downforce / 100, sim.reliability);
                  }}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-ok-500/20 border border-ok-500/40 text-ok-300 hover:bg-ok-500/30"
                >
                  Finish Season
                </button>
              </div>
            </div>

            {/* Split Screen: Live Leaderboard + Radio Feed */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Live Standings */}
              <div className="bg-base-950/60 rounded-xl p-4 border border-white/5">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Trophy size={14} className="text-yellow-400" /> Live Race Leaderboard
                </h3>
                <div className="space-y-1.5">
                  {liveRaceState.standings.map((s) => (
                    <div
                      key={s.rank}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono border transition-all ${
                        s.isPlayer
                          ? "bg-cyan-500/15 border-cyan-400/40 text-cyan-200 font-bold shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                          : "bg-base-850/50 border-base-800 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 text-center font-bold ${s.rank === 1 ? "text-yellow-400" : s.rank <= 3 ? "text-slate-200" : "text-slate-500"}`}>P{s.rank}</span>
                        <span>{s.name}</span>
                        {s.isPlayer && <span className="text-[9px] bg-cyan-400/20 text-cyan-300 px-1 rounded">YOU</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-[11px]">{s.gap}</span>
                        <span className="text-slate-500 text-[10px]">{s.pitStops} PIT</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Race Radio & Event Ticker */}
              <div className="bg-base-950/60 rounded-xl p-4 border border-white/5 flex flex-col">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Radio size={14} className="text-cyan-400" /> Pit Wall Commentary Ticker
                </h3>
                <div className="space-y-2 flex-1 overflow-y-auto max-h-60 pr-1">
                  {liveRaceState.feed.map((f, i) => (
                    <div key={i} className="text-xs bg-base-850/60 rounded-lg p-2.5 border border-base-800/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">{f.time}</span>
                        <span className="text-[9px] text-slate-500 font-mono uppercase">{f.type}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{f.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
