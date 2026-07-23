// ===================================================================
// STRATEGY PANEL — Race strategy configurator
// ===================================================================
import { Settings, Fuel, Droplets } from "lucide-react";
import { useCompany } from "../../state/CompanyContext";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "./TeamCard";
import type { MotorsportTeam, TireChoice } from "../../sim/types";

const TIRE_COLORS: Record<TireChoice, string> = {
  soft: "bg-red-500", medium: "bg-yellow-500", hard: "bg-slate-200",
  intermediate: "bg-green-500", wet: "bg-blue-500",
};
const TIRE_LABELS: Record<TireChoice, string> = {
  soft: "S", medium: "M", hard: "H", intermediate: "I", wet: "W",
};

function TireBadge({ tire, active, onClick }: { tire: TireChoice; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border-2 ${
        active ? `${TIRE_COLORS[tire]} border-white/40 text-slate-900 shadow-lg scale-110` :
        "bg-base-800 border-base-700 text-slate-500 hover:border-base-600"
      }`}>
      {TIRE_LABELS[tire]}
    </button>
  );
}

export function StrategyPanel({ selectedTeam }: { selectedTeam: MotorsportTeam | null }) {
  const { company, updateStrategy } = useCompany();

  if (company.motorsport.teams.length === 0) {
    return (
      <div className="glass-panel p-10 text-center">
        <Settings size={36} className="mx-auto text-slate-700 mb-3" />
        <p className="text-slate-500 text-sm">Create a team first to configure race strategy.</p>
      </div>
    );
  }

  if (!selectedTeam) {
    return (
      <div className="glass-panel p-10 text-center">
        <Settings size={36} className="mx-auto text-slate-700 mb-3" />
        <p className="text-slate-500 text-sm">Select a team from the Teams tab to configure strategy.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Team indicator */}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedTeam.liveryColor }} />
        <span className="text-sm font-semibold text-slate-200">{selectedTeam.name}</span>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[selectedTeam.category]}`}>
          {CATEGORY_LABELS[selectedTeam.category]}
        </span>
      </div>

      <div className="glass-panel p-5 racing-stripes relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{ background: "radial-gradient(ellipse at top left, rgba(34,211,238,0.3), transparent 60%)" }} />

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Deploy Mode */}
          <div>
            <label className="label-mono block mb-2">Deploy Mode</label>
            <div className="grid grid-cols-2 gap-1.5">
              {([
                { mode: "conservative" as const, label: "Conservative", desc: "🛡 Steady pace, low risk", color: "bg-blue-500/20 border-blue-500/40 text-blue-300" },
                { mode: "balanced" as const, label: "Balanced", desc: "⚖ Balanced approach", color: "bg-accent-500/20 border-accent-500/40 text-accent-300" },
                { mode: "aggressive" as const, label: "Aggressive", desc: "⚠ Fast but risky", color: "bg-warn-500/20 border-warn-500/40 text-warn-300" },
                { mode: "qualifying" as const, label: "Qualifying", desc: "🏁 Max attack!", color: "bg-danger-500/20 border-danger-500/40 text-danger-300" },
              ]).map(m => (
                <button key={m.mode} onClick={() => updateStrategy(selectedTeam.id, { deployMode: m.mode })}
                  className={`px-2 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                    selectedTeam.strategy.deployMode === m.mode ? m.color : "bg-base-850 border-base-800 text-slate-400 hover:border-base-700"
                  }`}>
                  <div className="font-semibold">{m.label}</div>
                  <div className="text-[10px] opacity-60 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Fuel Load */}
          <div>
            <label className="label-mono flex items-center gap-1.5 mb-2"><Fuel size={10} /> Fuel Load</label>
            <div className="relative mb-2">
              {/* Circular fuel gauge */}
              <div className="flex items-center gap-4">
                <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#1e2839" strokeWidth="6" />
                  <circle cx="40" cy="40" r="32" fill="none" stroke={
                    selectedTeam.strategy.fuelLoad > 0.8 ? "#22d3ee" : selectedTeam.strategy.fuelLoad > 0.5 ? "#eab308" : "#ef4444"
                  } strokeWidth="6"
                    strokeDasharray={`${selectedTeam.strategy.fuelLoad * 201} 201`}
                    strokeLinecap="round"
                    transform="rotate(-90 40 40)"
                    className="transition-all duration-500" />
                  <text x="40" y="40" textAnchor="middle" dominantBaseline="central"
                    fill="#e2e8f0" fontSize="14" fontWeight="bold" fontFamily="monospace">
                    {Math.round(selectedTeam.strategy.fuelLoad * 100)}%
                  </text>
                </svg>
                <div className="flex-1">
                  <input type="range" min={0.3} max={1} step={0.05}
                    value={selectedTeam.strategy.fuelLoad}
                    onChange={e => updateStrategy(selectedTeam.id, { fuelLoad: +e.target.value })}
                    className="w-full" />
                  <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                    <span>Light (fast)</span>
                    <span>Full (safe)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pit Stops */}
          <div>
            <label className="label-mono block mb-2">Planned Pit Stops</label>
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => updateStrategy(selectedTeam.id, { pitStopCount: n })}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-all border ${
                    selectedTeam.strategy.pitStopCount === n
                      ? "bg-accent-500/25 border-accent-500/50 text-accent-300"
                      : "bg-base-850 border-base-800 text-slate-500 hover:border-base-700"
                  }`}>{n}</button>
              ))}
            </div>
          </div>

          {/* Wet Weather */}
          <div>
            <label className="label-mono flex items-center gap-1.5 mb-2"><Droplets size={10} /> Wet Strategy</label>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { id: "stay_out" as const, label: "Stay Out", desc: "Gamble on drying" },
                { id: "immediate_pit" as const, label: "Pit Now", desc: "Immediate change" },
                { id: "wait_one_lap" as const, label: "Wait 1 Lap", desc: "Assess conditions" },
              ]).map(w => (
                <button key={w.id} onClick={() => updateStrategy(selectedTeam.id, { wetStrategy: w.id })}
                  className={`px-2 py-2 rounded-lg text-[10px] font-medium transition-all border ${
                    selectedTeam.strategy.wetStrategy === w.id
                      ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                      : "bg-base-850 border-base-800 text-slate-400"
                  }`}>
                  <div className="font-semibold text-xs">{w.label}</div>
                  <div className="opacity-60">{w.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tire Strategy */}
          <div className="md:col-span-2">
            <label className="label-mono block mb-2">Tire Strategy (per stint)</label>
            <div className="flex gap-2 flex-wrap items-center">
              {selectedTeam.strategy.tireStrategy.map((tire, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-base-850/50 rounded-xl px-3 py-2 border border-base-800">
                  <span className="text-[10px] text-slate-500 font-mono">S{i + 1}</span>
                  <div className="flex gap-1">
                    {(["soft", "medium", "hard", "intermediate", "wet"] as TireChoice[]).map(t => (
                      <TireBadge key={t} tire={t} active={tire === t}
                        onClick={() => {
                          const newTires = [...selectedTeam.strategy.tireStrategy];
                          newTires[i] = t;
                          updateStrategy(selectedTeam.id, { tireStrategy: newTires });
                        }} />
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={() => updateStrategy(selectedTeam.id, {
                tireStrategy: [...selectedTeam.strategy.tireStrategy, "medium"]
              })}
                className="px-3 py-2 rounded-xl text-[10px] border border-dashed border-base-700 text-slate-500 hover:text-accent-300 hover:border-accent-500/30 transition-all">
                + Stint
              </button>
            </div>
          </div>

          {/* Undercut / Overcut */}
          <div className="md:col-span-2 flex gap-6">
            {[
              { key: "undercut" as const, label: "Undercut Strategy", desc: "Pit earlier than rivals for track position" },
              { key: "overcut" as const, label: "Overcut Strategy", desc: "Pit later to gain time on clear track" },
            ].map(opt => (
              <label key={opt.key} className="flex items-start gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all mt-0.5 ${
                  selectedTeam.strategy[opt.key]
                    ? "bg-accent-500/30 border-accent-500/50"
                    : "bg-base-850 border-base-700 group-hover:border-base-600"
                }`}>
                  {selectedTeam.strategy[opt.key] && <span className="text-accent-300 text-xs">✓</span>}
                </div>
                <input type="checkbox" className="hidden" checked={selectedTeam.strategy[opt.key]}
                  onChange={e => updateStrategy(selectedTeam.id, { [opt.key]: e.target.checked })} />
                <div>
                  <span className="text-xs text-slate-300 font-medium">{opt.label}</span>
                  <div className="text-[10px] text-slate-500">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
