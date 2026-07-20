// ===================================================================
// MOTORSPORT DIVISION — Teams, seasons, tech transfer
// ===================================================================
import { useState } from "react";
import {
  Trophy, Plus, Users, ArrowRightLeft,
  Medal, AlertTriangle, Zap, Weight, Gauge, Shield,
  Play, History,
} from "lucide-react";
import { useCompany } from "../state/CompanyContext";
import { useDesign } from "../state/DesignContext";
import type { MotorsportCategory, MotorsportTeam } from "../sim/types";

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

function TeamCard({ team, onSelect, isSelected }: {
  team: MotorsportTeam; onSelect: () => void; isSelected: boolean;
}) {
  const lastSeason = team.seasonResults[team.seasonResults.length - 1];
  return (
    <div
      onClick={onSelect}
      className={`panel p-4 cursor-pointer transition-all hover:border-base-700 ${isSelected ? "border-accent-500/50" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[team.category]}`}>
              {CATEGORY_LABELS[team.category]}
            </span>
          </div>
          <h3 className="font-semibold text-slate-100 text-sm">{team.name}</h3>
          <div className={`text-[10px] font-medium capitalize mt-0.5 ${STATUS_COLORS[team.status]}`}>
            ● {team.status}
          </div>
        </div>
        {team.championships > 0 && (
          <div className="flex items-center gap-1 text-yellow-400">
            <Trophy size={14} />
            <span className="text-sm font-bold">{team.championships}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="bg-base-850 rounded-lg p-2">
          <div className="text-lg font-bold font-mono text-ok-400">{team.wins}</div>
          <div className="text-[9px] text-slate-600">Wins</div>
        </div>
        <div className="bg-base-850 rounded-lg p-2">
          <div className="text-lg font-bold font-mono text-accent-300">{team.podiums}</div>
          <div className="text-[9px] text-slate-600">Podiums</div>
        </div>
        <div className="bg-base-850 rounded-lg p-2">
          <div className="text-lg font-bold font-mono text-slate-300">{team.developmentPoints}</div>
          <div className="text-[9px] text-slate-600">Dev Pts</div>
        </div>
      </div>

      {team.drivers.length > 0 && (
        <div className="space-y-1">
          {team.drivers.map(d => (
            <div key={d.id} className="flex items-center justify-between bg-base-850 rounded px-2 py-1">
              <span className="text-xs text-slate-300">{d.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">{d.nationality}</span>
                <span className="text-[10px] font-mono text-accent-300">{d.skill}/100</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {lastSeason && (
        <div className="mt-2 text-[10px] text-slate-600">
          Last season: P{lastSeason.position} · {lastSeason.points}pts · {lastSeason.wins}W {lastSeason.podiums}P {lastSeason.dnfs}DNF
        </div>
      )}
    </div>
  );
}

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

export function MotorsportDivision() {
  const {
    company, assignMotorsportDriver, simulateMotorsportSeason,
    transferMotorsportTech, availableDrivers,
  } = useCompany();
  const { sim } = useDesign();
  const [activeTab, setActiveTab] = useState<"teams" | "season" | "transfer" | "history">("teams");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [transferPoints, setTransferPoints] = useState(10);
  const [transferDir, setTransferDir] = useState<"race_to_production" | "production_to_race">("race_to_production");

  const selectedTeam = company.motorsport.teams.find(t => t.id === selectedTeamId) ?? null;

  const tabs = [
    { id: "teams" as const, label: "Teams" },
    { id: "season" as const, label: "Season" },
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
              <p className="text-xs text-slate-500">Race teams, championships, and technology transfer between track and production</p>
            </div>
          </div>
          <div className="flex-1" />
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xl font-bold font-mono text-accent-300">{company.motorsport.teams.length}</div>
              <div className="text-[10px] text-slate-600">Teams</div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-ok-400">{company.motorsport.teams.reduce((s, t) => s + t.wins, 0)}</div>
              <div className="text-[10px] text-slate-600">Total Wins</div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-yellow-400">{company.motorsport.teams.reduce((s, t) => s + t.championships, 0)}</div>
              <div className="text-[10px] text-slate-600">Championships</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-base-850 rounded-lg p-1 border border-base-800">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === t.id ? "bg-accent-500/20 text-accent-300" : "text-slate-400 hover:text-slate-200"}`}>
            {t.label}
          </button>
        ))}
      </div>

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

          {/* Driver assignment panel */}
          {selectedTeam && availableDrivers.length > 0 && selectedTeam.drivers.length < 2 && (
            <div className="panel p-4">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Users size={12} className="text-accent-400" /> Hire Driver for {selectedTeam.name}
              </h3>
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
                <Weight size={12} className="mx-auto text-slate-400 mb-1" />
                <div className="font-mono text-sm text-slate-200">{Math.round(sim.weight)}</div>
                <div className="text-[9px] text-slate-600">kg</div>
              </div>
              <div className="bg-base-850 rounded-lg p-2.5 text-center">
                <Gauge size={12} className="mx-auto text-blue-400 mb-1" />
                <div className="font-mono text-sm text-slate-200">{sim.downforce.toFixed(0)}</div>
                <div className="text-[9px] text-slate-600">kg DnF</div>
              </div>
              <div className="bg-base-850 rounded-lg p-2.5 text-center">
                <Shield size={12} className="mx-auto text-ok-400 mb-1" />
                <div className="font-mono text-sm text-slate-200">{Math.round(sim.reliability * 100)}%</div>
                <div className="text-[9px] text-slate-600">reliability</div>
              </div>
            </div>
            {company.motorsport.teams.filter(t => t.status === "competing").length === 0 ? (
              <div className="text-center py-4">
                <AlertTriangle size={20} className="mx-auto text-warn-400 mb-2" />
                <p className="text-sm text-slate-500">No teams are ready to compete.</p>
                <p className="text-xs text-slate-600 mt-1">Hire at least 1 driver for a team to make them competing.</p>
              </div>
            ) : (
              <button
                onClick={() => simulateMotorsportSeason(sim.peakPower, sim.weight, sim.downforce / 100, sim.reliability)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-500/15 border border-accent-500/40 text-accent-300 hover:bg-accent-500/25 transition-all text-sm font-semibold"
              >
                <Play size={14} /> Simulate Season {company.motorsport.currentSeason}
              </button>
            )}
          </div>

          {/* Current season results */}
          {company.motorsport.teams.map(t => {
            const last = t.seasonResults[t.seasonResults.length - 1];
            if (!last) return null;
            return (
              <div key={t.id} className="panel p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-100">{t.name}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${CATEGORY_COLORS[t.category]}`}>
                    {CATEGORY_LABELS[t.category]}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-3 text-center text-xs">
                  <div className="bg-base-850 rounded p-2"><div className="font-mono text-slate-200 font-bold">{last.points}</div><div className="text-slate-600 text-[9px]">Points</div></div>
                  <div className="bg-base-850 rounded p-2"><div className="font-mono text-ok-400 font-bold">{last.wins}</div><div className="text-slate-600 text-[9px]">Wins</div></div>
                  <div className="bg-base-850 rounded p-2"><div className="font-mono text-accent-300 font-bold">{last.podiums}</div><div className="text-slate-600 text-[9px]">Podiums</div></div>
                  <div className="bg-base-850 rounded p-2"><div className="font-mono text-danger-400 font-bold">{last.dnfs}</div><div className="text-slate-600 text-[9px]">DNFs</div></div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {last.raceResults.map(r => (
                    <div key={r.round} className={`text-[10px] px-2 py-1 rounded font-mono ${
                      r.position === 1 ? "bg-yellow-500/20 text-yellow-400" :
                      r.position <= 3 ? "bg-accent-500/20 text-accent-300" :
                      r.position === 0 ? "bg-danger-500/20 text-danger-400" :
                      "bg-base-850 text-slate-500"
                    }`}>
                      R{r.round}: {r.position === 0 ? "DNF" : `P${r.position}`}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
                <div className="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
                  <div className="bg-base-850 rounded p-2"><div className="font-mono text-ok-400 font-bold text-base">{t.wins}</div><div className="text-slate-600 text-[9px]">All-time Wins</div></div>
                  <div className="bg-base-850 rounded p-2"><div className="font-mono text-accent-300 font-bold text-base">{t.podiums}</div><div className="text-slate-600 text-[9px]">All-time Podiums</div></div>
                  <div className="bg-base-850 rounded p-2"><div className="font-mono text-slate-200 font-bold text-base">{t.seasonResults.length}</div><div className="text-slate-600 text-[9px]">Seasons</div></div>
                </div>
                {t.seasonResults.length > 0 && (
                  <div className="space-y-1">
                    {t.seasonResults.map(r => (
                      <div key={r.season} className="flex items-center gap-3 text-xs bg-base-850/50 rounded px-2 py-1.5">
                        <span className="text-slate-500 w-16">Season {r.season}</span>
                        <span className={`font-mono font-semibold ${r.wins > 0 ? "text-ok-400" : "text-slate-300"}`}>{r.points}pts</span>
                        <span className="text-slate-500">{r.wins}W / {r.podiums}P / {r.dnfs}DNF</span>
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
    </div>
  );
}
