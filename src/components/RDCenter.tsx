import { useState } from "react";
import {
  Building2, Cog, Wind, Layers, CircuitBoard, BatteryCharging, Factory, ShieldCheck,
  BrainCircuit, Volume2, FlaskConical, Plus, Pause, Play, X,
  TrendingUp, DollarSign, Brain, Users, Lightbulb, Lock, Award, Zap, Calendar,
  ChevronRight, CheckCircle2, AlertTriangle, XCircle, Clock, Sparkles, Briefcase,
} from "lucide-react";
import { useRD } from "../state/RDContext";
import { RadialGauge } from "./ui/Charts";
import { Section } from "./ui/Controls";
import {
  BUILDINGS, TECHNOLOGIES, TECH_BY_ID, TREE_LABELS,
  SKUNKWORKS_TEMPLATES, BUDGET_TREES,
} from "../sim/rdData";
import { canResearchTech, projectProgress, monthlySalaryTotal } from "../sim/rdEngine";
import type { TechTreeId, TechnologyId, Engineer } from "../sim/rdTypes";

const ICONS: Record<string, React.ComponentType<{ size?: number | string; className?: string }>> = {
  Cog: Cog as React.ComponentType<{ size?: number | string; className?: string }>,
  Wind: Wind as React.ComponentType<{ size?: number | string; className?: string }>,
  Layers: Layers as React.ComponentType<{ size?: number | string; className?: string }>,
  CircuitBoard: CircuitBoard as React.ComponentType<{ size?: number | string; className?: string }>,
  BatteryCharging: BatteryCharging as React.ComponentType<{ size?: number | string; className?: string }>,
  Factory: Factory as React.ComponentType<{ size?: number | string; className?: string }>,
  ShieldCheck: ShieldCheck as React.ComponentType<{ size?: number | string; className?: string }>,
  BrainCircuit: BrainCircuit as React.ComponentType<{ size?: number | string; className?: string }>,
  Volume2: Volume2 as React.ComponentType<{ size?: number | string; className?: string }>,
  FlaskConical: FlaskConical as React.ComponentType<{ size?: number | string; className?: string }>,
};

type View = "overview" | "campus" | "techtree" | "projects" | "team" | "strategy";

function fmtMoney(n: number): string {
  if (Math.abs(n) >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (Math.abs(n) >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
  if (Math.abs(n) >= 1e3) return "$" + (n / 1e3).toFixed(0) + "K";
  return "$" + n.toFixed(0);
}

/* ---------- Top bar ---------- */

function TopBar({ state, view, setView }: { state: ReturnType<typeof useRD>["state"]; view: View; setView: (v: View) => void }) {
  const tabs: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <TrendingUp size={14} /> },
    { id: "campus", label: "Campus", icon: <Building2 size={14} /> },
    { id: "techtree", label: "Tech Tree", icon: <Lightbulb size={14} /> },
    { id: "projects", label: "Projects", icon: <FlaskConical size={14} /> },
    { id: "team", label: "Engineers", icon: <Users size={14} /> },
    { id: "strategy", label: "Strategy", icon: <Briefcase size={14} /> },
  ];
  return (
    <div className="panel p-3">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <FlaskConical size={18} className="text-accent-400" />
          <h2 className="text-sm font-semibold text-slate-200">R&D Center</h2>
          <span className="text-xs text-slate-500">— Research Campus & Technology Development</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5"><DollarSign size={12} className="text-ok-400" /><span className="font-mono text-slate-200">{fmtMoney(state.cash)}</span></span>
          <span className="flex items-center gap-1.5"><Brain size={12} className="text-accent-400" /><span className="font-mono text-slate-200">{state.engineeringKnowledge} EK</span></span>
          <span className="flex items-center gap-1.5"><Sparkles size={12} className="text-amber-400" /><span className="font-mono text-slate-200">Innov {state.innovationScore}</span></span>
          <span className="flex items-center gap-1.5"><Award size={12} className="text-purple-400" /><span className="font-mono text-slate-200">Brand {state.brandValue}</span></span>
          <span className="flex items-center gap-1.5"><Calendar size={12} className="text-slate-500" /><span className="font-mono text-slate-400">Mo {state.month}</span></span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              view === t.id ? "bg-accent-500/20 text-accent-300 border border-accent-500/40" : "text-slate-400 hover:text-slate-200 hover:bg-base-850 border border-transparent"
            }`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Month controls ---------- */

function MonthControls() {
  const { advanceOneMonth, advanceSixMonths, saving } = useRD();
  return (
    <div className="flex items-center gap-2">
      <button onClick={advanceOneMonth} className="btn-primary text-xs flex items-center gap-1.5 px-3 py-1.5">
        <ChevronRight size={14} /> Advance 1 Month
      </button>
      <button onClick={advanceSixMonths} className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5">
        <ChevronRight size={14} /><ChevronRight size={14} className="-ml-2" /> Advance 6 Months
      </button>
      {saving && <span className="text-[10px] text-slate-600">saving…</span>}
    </div>
  );
}

/* ---------- Overview ---------- */

function Overview() {
  const { state, bonuses } = useRD();
  const activeProjects = state.projects.filter((p) => p.status === "active").length;
  const completedTechs = Object.values(state.technologies).filter((t) => t.unlocked).length;
  const breakthroughs = state.skunkworks.filter((s) => s.status === "breakthrough").length;
  const salary = monthlySalaryTotal(state);
  const netMonthly = state.monthlyRevenue + state.patents.reduce((s, p) => s + p.royaltyPerMonth, 0) - salary;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger">
        <div className="panel p-4 flex flex-col items-center">
          <RadialGauge value={state.innovationScore} max={100} label="Innovation" size={140} />
          <p className="text-[11px] text-slate-500 mt-2 text-center">Higher innovation unlocks tech sooner, attracts better engineers, enables premium pricing.</p>
        </div>
        <div className="panel p-4 space-y-2.5">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"><TrendingUp size={14} className="text-accent-400" />Key Metrics</h3>
          {[
            { l: "Cash", v: fmtMoney(state.cash), c: "text-ok-400" },
            { l: "Engineering Knowledge", v: state.engineeringKnowledge + " EK", c: "text-accent-300" },
            { l: "Brand Value", v: state.brandValue + " / 100", c: "text-purple-300" },
            { l: "Technologies Unlocked", v: `${completedTechs} / ${TECHNOLOGIES.length}`, c: "text-slate-200" },
            { l: "Active Projects", v: String(activeProjects), c: "text-slate-200" },
            { l: "Patents", v: String(state.patents.length), c: "text-slate-200" },
            { l: "Skunkworks Breakthroughs", v: String(breakthroughs), c: "text-amber-300" },
          ].map((r) => (
            <div key={r.l} className="flex justify-between text-xs"><span className="text-slate-500">{r.l}</span><span className={"font-mono " + r.c}>{r.v}</span></div>
          ))}
        </div>
        <div className="panel p-4 space-y-2.5">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"><DollarSign size={14} className="text-ok-400" />Monthly Finances</h3>
          {[
            { l: "Company Revenue", v: "+" + fmtMoney(state.monthlyRevenue), c: "text-ok-400" },
            { l: "Patent Royalties", v: "+" + fmtMoney(state.patents.reduce((s, p) => s + p.royaltyPerMonth, 0)), c: "text-ok-400" },
            { l: "Engineer Salaries", v: "-" + fmtMoney(salary), c: "text-danger-400" },
            { l: "Net per Month", v: (netMonthly >= 0 ? "+" : "") + fmtMoney(netMonthly), c: netMonthly >= 0 ? "text-ok-400" : "text-danger-400" },
          ].map((r) => (
            <div key={r.l} className="flex justify-between text-xs"><span className="text-slate-500">{r.l}</span><span className={"font-mono " + r.c}>{r.v}</span></div>
          ))}
          <div className="pt-2 border-t border-base-800">
            <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Zap size={10} />Active Bonuses to Vehicle</h4>
            <div className="flex flex-wrap gap-1">
              {bonuses.unlockedTechs.length === 0 ? (
                <span className="text-[10px] text-slate-600">No tech unlocked yet — research to improve your vehicles.</span>
              ) : (
                <>
                  {bonuses.powerMultiplier > 1.01 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-ok-500/15 text-ok-300">+{((bonuses.powerMultiplier - 1) * 100).toFixed(0)}% power</span>}
                  {bonuses.weightReductionPct > 0.01 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-ok-500/15 text-ok-300">-{(bonuses.weightReductionPct * 100).toFixed(0)}% weight</span>}
                  {bonuses.costReductionPct < -0.01 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-ok-500/15 text-ok-300">{(bonuses.costReductionPct * 100).toFixed(0)}% mfg cost</span>}
                  {bonuses.safetyBonus > 0.01 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-ok-500/15 text-ok-300">+{(bonuses.safetyBonus * 100).toFixed(0)}% safety</span>}
                  {bonuses.downforceBonus > 0.01 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-ok-500/15 text-ok-300">+{(bonuses.downforceBonus * 100).toFixed(0)}% downforce</span>}
                  {bonuses.techScoreBonus > 0.01 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-ok-500/15 text-ok-300">+{(bonuses.techScoreBonus * 100).toFixed(0)}% tech</span>}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Event log */}
      <Section title="Recent Events" icon={<Clock size={16} />}>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {[...state.log].reverse().slice(0, 20).map((e, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="text-slate-600 font-mono shrink-0">M{e.month}</span>
              {e.kind === "success" && <CheckCircle2 size={12} className="text-ok-400 shrink-0 mt-0.5" />}
              {e.kind === "warn" && <AlertTriangle size={12} className="text-warn-400 shrink-0 mt-0.5" />}
              {e.kind === "danger" && <XCircle size={12} className="text-danger-400 shrink-0 mt-0.5" />}
              {e.kind === "info" && <ChevronRight size={12} className="text-slate-600 shrink-0 mt-0.5" />}
              <span className="text-slate-400">{e.text}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ---------- Campus ---------- */

function Campus() {
  const { state, upgrade } = useRD();
  return (
    <div className="space-y-4">
      <Section title="Research Campus — Buildings" icon={<Building2 size={16} />}>
        <p className="text-xs text-slate-500 mb-3">Each building supports a technology tree. Upgrade buildings (Lv.1–10) to unlock more advanced research. Higher levels cost more and take longer.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger">
          {BUILDINGS.map((b) => {
            const s = state.buildings[b.id];
            const Icon = ICONS[b.icon] ?? Building2;
            const upgrading = s.upgradeMonthsLeft > 0;
            const maxed = s.level >= 10;
            return (
              <div key={b.id} className="panel p-3.5 transition-all duration-300 hover:border-accent-500/30 hover:shadow-[0_8px_24px_-12px_rgba(34,211,238,0.15)]">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-accent-400"><Icon size={18} /></span>
                    <div>
                      <div className="text-sm font-semibold text-slate-200">{b.name}</div>
                      <div className="text-[11px] text-slate-500">{b.description}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-600 uppercase">Level</div>
                    <div className="font-mono text-lg text-accent-300">{s.level}<span className="text-slate-600 text-xs">/10</span></div>
                  </div>
                </div>
                {/* Level pips */}
                <div className="flex gap-0.5 mb-2.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full ${i < s.level ? "bg-accent-500" : "bg-base-800"}`} />
                  ))}
                </div>
                {upgrading ? (
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Upgrading to Lv.{s.level + 1}</span><span className="font-mono">{s.upgradeMonthsLeft} mo left</span>
                    </div>
                    <div className="h-1.5 bg-base-800 rounded-full overflow-hidden">
                      <div className="bg-accent-500" style={{ width: `${((s.upgradeMonths - s.upgradeMonthsLeft) / s.upgradeMonths) * 100}%`, transition: "width 0.4s" }} />
                    </div>
                  </div>
                ) : maxed ? (
                  <div className="text-xs text-center text-amber-400 py-1.5 border border-amber-500/20 rounded-lg bg-amber-500/5">Max Level Reached</div>
                ) : (
                  <button
                    onClick={() => upgrade(b.id)}
                    disabled={state.cash < s.upgradeCost}
                    className="w-full text-xs py-1.5 rounded-lg border transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed bg-base-850 border-base-700 text-slate-300 hover:border-accent-500/50 hover:text-accent-300"
                  >
                    <Plus size={12} /> Upgrade to Lv.{s.level + 1} — {fmtMoney(s.upgradeCost)} · {s.upgradeMonths} mo
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

/* ---------- Tech Tree ---------- */

function TechTree() {
  const { state, startResearch } = useRD();
  const [selectedTree, setSelectedTree] = useState<TechTreeId>("engine");
  const [scientistInput, setScientistInput] = useState<Record<TechnologyId, number>>({});

  const trees: TechTreeId[] = ["engine", "materials", "aerodynamics", "electronics", "manufacturing", "battery", "safety", "ai"];
  const techs = TECHNOLOGIES.filter((t) => t.tree === selectedTree && t.cost > 0);

  return (
    <div className="space-y-4">
      <Section title="Technology Tree" icon={<Lightbulb size={16} />}>
        <p className="text-xs text-slate-500 mb-3">Unlock technologies through research projects. Each tech widens your engineering possibilities and applies bonuses to vehicle simulations.</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {trees.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTree(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedTree === t ? "bg-accent-500/20 text-accent-300 border border-accent-500/40" : "bg-base-850 text-slate-400 border border-base-800 hover:border-base-700"
              }`}
            >
              {TREE_LABELS[t]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {techs.map((tech) => {
            const st = state.technologies[tech.id];
            const check = canResearchTech(state, tech.id);
            const activeProj = state.projects.find((p) => p.techId === tech.id && p.status === "active");
            const sci = scientistInput[tech.id] ?? tech.scientists;
            return (
              <div key={tech.id} className={`panel p-3 border transition-all duration-300 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.3)] ${st?.unlocked ? "border-ok-500/30" : activeProj ? "border-accent-500/30" : "border-base-800"}`}>
                <div className="flex items-start justify-between mb-1.5">
                  <div className="min-w-0 pr-2">
                    <div className="text-sm font-semibold text-slate-200">{tech.name}</div>
                    <div className="text-[11px] text-slate-500">{tech.description}</div>
                  </div>
                  {st?.unlocked ? (
                    <CheckCircle2 size={16} className="text-ok-400 shrink-0" />
                  ) : st?.patented ? (
                    <Lock size={14} className="text-purple-400 shrink-0" />
                  ) : activeProj ? (
                    <FlaskConical size={16} className="text-accent-400 shrink-0 animate-pulse" />
                  ) : null}
                </div>

                {/* Effects */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {tech.effect.map((e, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-base-850 text-slate-400 border border-base-800">{e.label}</span>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-1.5 text-center mb-2">
                  <div><div className="text-[9px] text-slate-600 uppercase">Cost</div><div className="font-mono text-[11px] text-accent-300">{fmtMoney(tech.cost)}</div></div>
                  <div><div className="text-[9px] text-slate-600 uppercase">Time</div><div className="font-mono text-[11px] text-slate-300">{tech.months}mo</div></div>
                  <div><div className="text-[9px] text-slate-600 uppercase">Sci</div><div className="font-mono text-[11px] text-slate-300">{tech.scientists}</div></div>
                  <div><div className="text-[9px] text-slate-600 uppercase">EK</div><div className="font-mono text-[11px] text-slate-300">{tech.ekCost}</div></div>
                </div>

                {/* Prerequisites */}
                {tech.requires.length > 0 && (
                  <div className="text-[10px] text-slate-600 mb-2">
                    Requires: {tech.requires.map((r) => {
                      const met = state.technologies[r]?.unlocked;
                      return <span key={r} className={met ? "text-ok-400" : "text-warn-400"}>{TECH_BY_ID[r]?.name ?? r} </span>;
                    })}
                  </div>
                )}

                {/* Active project progress */}
                {activeProj && (
                  <div className="mb-2">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span className="capitalize">{activeProj.phase.replace("_", " ")}</span>
                      <span className="font-mono">{(projectProgress(activeProj) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-base-800 rounded-full overflow-hidden">
                      <div className="bg-accent-500" style={{ width: `${projectProgress(activeProj) * 100}%`, transition: "width 0.4s" }} />
                    </div>
                  </div>
                )}

                {/* Action */}
                {!st?.unlocked && !activeProj && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min={1} max={50} value={sci}
                      onChange={(e) => setScientistInput((p) => ({ ...p, [tech.id]: parseInt(e.target.value) || 1 }))}
                      className="w-14 bg-base-850 border border-base-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                    />
                    <button
                      onClick={() => startResearch(tech.id, sci)}
                      disabled={!check.ok}
                      className="flex-1 text-xs py-1.5 rounded-lg border transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed bg-accent-500/10 border-accent-500/30 text-accent-300 hover:bg-accent-500/20"
                    >
                      <Plus size={12} /> Start Research
                    </button>
                  </div>
                )}
                {!check.ok && !st?.unlocked && !activeProj && (
                  <div className="text-[10px] text-warn-400 mt-1">{check.reasons[0]}</div>
                )}
                {st?.unlocked && <div className="text-xs text-ok-400 text-center font-medium">Unlocked</div>}
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

/* ---------- Projects ---------- */

function Projects() {
  const { state, pauseResearch, resumeResearch, cancelResearch, patent, startSkunkworks } = useRD();
  const active = state.projects.filter((p) => p.status === "active" || p.status === "paused");
  const completed = state.projects.filter((p) => p.status === "complete" || p.status === "failed");

  return (
    <div className="space-y-4">
      {/* Active research */}
      <Section title="Active Research Projects" icon={<FlaskConical size={16} />}>
        {active.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No active research. Go to the Tech Tree to start projects.</p>
        ) : (
          <div className="space-y-2.5">
            {active.map((p) => {
              const prog = projectProgress(p);
              const phaseSteps = ["concept", "simulation", "prototype", "bench_testing", "vehicle_testing", "production_ready"];
              const phaseIdx = phaseSteps.indexOf(p.phase);
              return (
                <div key={p.id} className="panel p-3.5 border border-accent-500/20">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm font-semibold text-slate-200">{p.name}</div>
                      <div className="text-[11px] text-slate-500">{TREE_LABELS[p.tree]} · {p.scientistsAssigned} scientists · {(p.failureRisk * 100).toFixed(0)}% risk</div>
                    </div>
                    <div className="flex gap-1">
                      {p.status === "active" ? (
                        <button onClick={() => pauseResearch(p.id)} className="p-1.5 rounded-lg bg-base-850 border border-base-700 text-slate-400 hover:text-warn-400" title="Pause"><Pause size={14} /></button>
                      ) : (
                        <button onClick={() => resumeResearch(p.id)} className="p-1.5 rounded-lg bg-base-850 border border-base-700 text-slate-400 hover:text-ok-400" title="Resume"><Play size={14} /></button>
                      )}
                      <button onClick={() => cancelResearch(p.id)} className="p-1.5 rounded-lg bg-base-850 border border-base-700 text-slate-400 hover:text-danger-400" title="Cancel"><X size={14} /></button>
                    </div>
                  </div>
                  {/* Phase pipeline */}
                  <div className="flex items-center gap-1 mb-2">
                    {phaseSteps.map((ph, i) => (
                      <div key={ph} className="flex items-center gap-1 flex-1">
                        <div className={`h-1.5 flex-1 rounded-full ${i <= phaseIdx ? "bg-accent-500" : "bg-base-800"}`} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span className="capitalize">{p.phase.replace("_", " ")}</span>
                    <span className="font-mono">{p.monthsElapsed.toFixed(1)} / {p.monthsTotal} months ({(prog * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-base-800 rounded-full overflow-hidden">
                    <div className="bg-accent-500" style={{ width: `${prog * 100}%`, transition: "width 0.4s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Completed */}
      {completed.length > 0 && (
        <Section title="Completed Research" icon={<CheckCircle2 size={16} />}>
          <div className="space-y-1.5">
            {completed.slice(-10).reverse().map((p) => (
              <div key={p.id} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-base-850 border border-base-800">
                <div className="flex items-center gap-2">
                  {p.status === "complete" ? <CheckCircle2 size={14} className="text-ok-400" /> : <XCircle size={14} className="text-danger-400" />}
                  <span className="text-slate-300">{p.name}</span>
                  {p.status === "complete" && !state.technologies[p.techId]?.patented && (
                    <button
                      onClick={() => patent(p.techId)}
                      className="text-[10px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 flex items-center gap-1"
                    >
                      <Lock size={10} /> Patent
                    </button>
                  )}
                  {state.technologies[p.techId]?.patented && <span className="text-[10px] text-purple-400 flex items-center gap-1"><Lock size={10} /> Patented</span>}
                </div>
                <span className="text-slate-600 font-mono">M{p.completedAtMonth}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Skunkworks */}
      <Section title="Skunkworks — Secret Projects" icon={<BrainCircuit size={16} />}>
        <p className="text-xs text-slate-500 mb-3">High-risk, high-reward confidential breakthroughs. These take years and can fail, but a success can transform your company.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {SKUNKWORKS_TEMPLATES.map((tmpl, i) => {
            const existing = state.skunkworks.find((s) => s.name === tmpl.name);
            return (
              <div key={i} className="panel p-3 border border-purple-500/20">
                <div className="flex items-start justify-between mb-1.5">
                  <div className="text-sm font-semibold text-slate-200">{tmpl.name}</div>
                  {existing && <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${existing.status === "breakthrough" ? "bg-ok-500/15 text-ok-300" : existing.status === "failed" ? "bg-danger-500/15 text-danger-300" : "bg-accent-500/15 text-accent-300"}`}>{existing.status}</span>}
                </div>
                <div className="text-[11px] text-slate-500 mb-2">{tmpl.description}</div>
                <div className="grid grid-cols-3 gap-1.5 text-center mb-2">
                  <div><div className="text-[9px] text-slate-600 uppercase">Cost</div><div className="font-mono text-[11px] text-accent-300">{fmtMoney(tmpl.cost)}</div></div>
                  <div><div className="text-[9px] text-slate-600 uppercase">Time</div><div className="font-mono text-[11px] text-slate-300">{tmpl.monthsTotal}mo</div></div>
                  <div><div className="text-[9px] text-slate-600 uppercase">Risk</div><div className="font-mono text-[11px] text-danger-400">{(tmpl.failureRisk * 100).toFixed(0)}%</div></div>
                </div>
                <div className="text-[10px] text-amber-300 mb-2 flex items-center gap-1"><Sparkles size={10} />{tmpl.resultDescription}</div>
                {existing && existing.status === "active" && (
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1"><span>Progress</span><span className="font-mono">{((existing.monthsElapsed / existing.monthsTotal) * 100).toFixed(0)}%</span></div>
                    <div className="h-1.5 bg-base-800 rounded-full overflow-hidden"><div className="bg-purple-500" style={{ width: `${(existing.monthsElapsed / existing.monthsTotal) * 100}%` }} /></div>
                  </div>
                )}
                {!existing && (
                  <button
                    onClick={() => startSkunkworks(i, 30)}
                    disabled={state.cash < tmpl.cost}
                    className="w-full text-xs py-1.5 rounded-lg border bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <Plus size={12} /> Launch Project — {fmtMoney(tmpl.cost)}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

/* ---------- Team ---------- */

function Team() {
  const { state, hire, fire } = useRD();
  const hired = state.engineers.filter((e) => e.hired);
  const available = state.engineers.filter((e) => !e.hired);

  const roleLabels: Record<string, string> = {
    chief_engine: "Chief Engine Engineer", aero_expert: "Aerodynamics Expert",
    battery_scientist: "Battery Scientist", materials_scientist: "Materials Scientist",
    software_engineer: "Software Engineer", manufacturing_engineer: "Manufacturing Engineer",
    test_driver: "Test Driver", data_analyst: "Data Analyst",
  };

  function EngCard({ e, action }: { e: Engineer; action: React.ReactNode }) {
    return (
      <div className="panel p-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-200">{e.name}</div>
          <div className="text-[11px] text-accent-400">{roleLabels[e.role]}</div>
          <div className="text-[10px] text-slate-500">{TREE_LABELS[e.specialty]}</div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div><div className="text-[9px] text-slate-600 uppercase">Exp</div><div className="font-mono text-xs text-slate-300">{e.experience}</div></div>
            <div><div className="text-[9px] text-slate-600 uppercase">Create</div><div className="font-mono text-xs text-slate-300">{e.creativity}</div></div>
            <div><div className="text-[9px] text-slate-600 uppercase">Prod</div><div className="font-mono text-xs text-slate-300">{e.productivity}</div></div>
          </div>
          <div className="text-[10px] text-ok-400 mt-1.5 font-mono">{fmtMoney(e.salary)}/mo</div>
        </div>
        <div className="shrink-0">{action}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Section title="Engineering Team" icon={<Users size={16} />}>
        <p className="text-xs text-slate-500 mb-3">Hire specialists to boost research productivity. Each has experience, creativity, productivity, and a salary. Salaries are paid monthly.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {hired.map((e) => (
            <EngCard key={e.id} e={e} action={
              <button onClick={() => fire(e.id)} className="text-xs px-2.5 py-1 rounded-lg bg-danger-500/10 border border-danger-500/30 text-danger-300 hover:bg-danger-500/20">Release</button>
            } />
          ))}
        </div>
      </Section>
      <Section title="Available Recruits" icon={<Plus size={16} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {available.map((e) => (
            <EngCard key={e.id} e={e} action={
              <button onClick={() => hire(e.id)} className="text-xs px-2.5 py-1 rounded-lg bg-ok-500/10 border border-ok-500/30 text-ok-300 hover:bg-ok-500/20">Hire</button>
            } />
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ---------- Strategy (Budget + Patents) ---------- */

function Strategy() {
  const { state, updateBudget, patent } = useRD();
  const [budget, setBudget] = useState(state.budget);

  const total = BUDGET_TREES.reduce((s, t) => s + budget[t], 0);

  function setTree(t: TechTreeId, val: number) {
    const next = { ...budget, [t]: Math.max(0, Math.min(100, val)) };
    setBudget(next);
    updateBudget(next);
  }

  const patentable = Object.entries(state.technologies)
    .filter(([, t]) => t.unlocked && !t.patented)
    .map(([id]) => id);

  return (
    <div className="space-y-4">
      {/* Budget */}
      <Section title="Research Budget Allocation" icon={<TrendingUp size={16} />}>
        <p className="text-xs text-slate-500 mb-3">Allocate your annual R&D budget across departments. Higher allocation speeds up research in that area. Target: 100% total.</p>
        <div className={`text-xs mb-3 font-mono ${Math.abs(total - 100) < 1 ? "text-ok-400" : "text-warn-400"}`}>Total: {total}% {Math.abs(total - 100) < 1 ? "✓" : "(aim for 100%)"}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BUDGET_TREES.map((t) => (
            <div key={t}>
              <div className="flex justify-between items-baseline mb-1">
                <label className="label-mono">{TREE_LABELS[t]}</label>
                <span className="font-mono text-xs text-accent-300">{budget[t]}%</span>
              </div>
              <input type="range" min={0} max={50} value={budget[t]} onChange={(e) => setTree(t, parseInt(e.target.value))} className="w-full" />
            </div>
          ))}
        </div>
      </Section>

      {/* Patents */}
      <Section title="Patents" icon={<Lock size={16} />}>
        <p className="text-xs text-slate-500 mb-3">Patenting a technology costs 15% of its research cost but generates monthly royalty income and boosts brand value. Competitors can't use patented tech.</p>
        {state.patents.length > 0 && (
          <div className="mb-3 space-y-1.5">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Active Patents</div>
            {state.patents.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <span className="text-slate-300 flex items-center gap-1.5"><Lock size={12} className="text-purple-400" />{p.techName}</span>
                <span className="font-mono text-ok-400">+{fmtMoney(p.royaltyPerMonth)}/mo</span>
              </div>
            ))}
          </div>
        )}
        {patentable.length === 0 ? (
          <p className="text-xs text-slate-600 py-2 text-center">No unlocked technologies available to patent.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {patentable.map((id) => {
              const tech = TECH_BY_ID[id];
              if (!tech) return null;
              const cost = Math.round(tech.cost * 0.15);
              return (
                <div key={id} className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-base-850 border border-base-800">
                  <span className="text-slate-300">{tech.name}</span>
                  <button
                    onClick={() => patent(id)}
                    disabled={state.cash < cost}
                    className="text-[10px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 disabled:opacity-40"
                  >
                    Patent — {fmtMoney(cost)}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}

/* ---------- Main ---------- */

export function RDCenter() {
  const { state, loading } = useRD();
  const [view, setView] = useState<View>("overview");

  if (loading) {
    return <div className="panel p-8 text-center text-slate-500 text-sm">Loading R&D Center…</div>;
  }

  return (
    <div className="space-y-4">
      <TopBar state={state} view={view} setView={setView} />
      <MonthControls />
      {view === "overview" && <Overview />}
      {view === "campus" && <Campus />}
      {view === "techtree" && <TechTree />}
      {view === "projects" && <Projects />}
      {view === "team" && <Team />}
      {view === "strategy" && <Strategy />}
    </div>
  );
}
