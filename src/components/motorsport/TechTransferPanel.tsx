// ===================================================================
// TECH TRANSFER PANEL — Transfer tech between race and production
// ===================================================================
import { useState, memo } from "react";
import { ArrowRightLeft, ArrowRight, ArrowLeft, Clock, Zap } from "lucide-react";
import { useCompany } from "../../state/CompanyContext";
import { playHMIClickSound } from "../../utils/hmiSoundSynth";
import type { MotorsportTeam } from "../../sim/types";

export const TechTransferPanel = memo(function TechTransferPanel({ selectedTeam }: { selectedTeam: MotorsportTeam | null }) {
  const { company, transferMotorsportTech } = useCompany();
  const [direction, setDirection] = useState<"race_to_production" | "production_to_race">("race_to_production");
  const [points, setPoints] = useState(10);

  if (!selectedTeam) {
    return (
      <div className="glass-panel p-10 text-center">
        <ArrowRightLeft size={36} className="mx-auto text-amber-500 mb-3" />
        <p className="text-amber-300/50 text-sm">Select a team to transfer technology.</p>
      </div>
    );
  }

  const pool = selectedTeam.techTransferPool;

  return (
    <div className="space-y-4">
      {/* Transfer controls */}
      <div className="glass-panel p-5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{ background: "radial-gradient(ellipse at center, rgba(168,85,247,0.2), transparent 70%)" }} />

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedTeam.liveryColor }} />
            <h3 className="text-sm font-semibold text-amber-50">{selectedTeam.name} · Tech Transfer</h3>
            <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/25">
              <Zap size={11} className="text-amber-400" />
              <span className="text-sm font-bold font-mono text-amber-300">{pool}</span>
              <span className="text-[10px] text-amber-400/60">pts</span>
            </div>
          </div>

          {/* Direction selector */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {([
              { dir: "race_to_production" as const, label: "Race → Production", icon: <ArrowRight size={14} />, desc: "Apply race tech to road cars" },
              { dir: "production_to_race" as const, label: "Production → Race", icon: <ArrowLeft size={14} />, desc: "Apply road car R&D to racing" },
            ]).map(d => (
              <button key={d.dir} onClick={() => {
                playHMIClickSound();
                setDirection(d.dir);
              }}
                className={`px-4 py-3 rounded-xl text-xs font-medium transition-all border cursor-pointer ${
                  direction === d.dir
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                    : "bg-base-850 border-base-800 text-amber-200/60 hover:border-base-700"
                }`}>
                <div className="flex items-center gap-1.5 mb-1">{d.icon} <span className="font-semibold">{d.label}</span></div>
                <div className="text-[10px] opacity-60">{d.desc}</div>
              </button>
            ))}
          </div>

          {/* Points slider */}
          <div className="mb-4">
            <label className="label-mono block mb-1.5">Transfer Amount</label>
            <div className="flex items-center gap-3">
              <input type="range" min={5} max={Math.max(5, pool)} step={5}
                value={Math.min(points, pool)} onChange={e => setPoints(+e.target.value)} className="flex-1" />
              <span className="text-lg font-bold font-mono text-amber-300 w-16 text-right">{Math.min(points, pool)}pts</span>
            </div>
          </div>

          <button onClick={() => {
            playHMIClickSound();
            transferMotorsportTech(selectedTeam.id, direction, Math.min(points, pool));
          }}
            disabled={pool < 5}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-semibold cursor-pointer">
            <ArrowRightLeft size={14} /> Transfer Technology
          </button>
        </div>
      </div>

      {/* Transfer History */}
      {company.motorsport.techTransferHistory.length > 0 && (
        <div className="glass-panel p-4">
          <h3 className="text-xs font-semibold text-amber-100/80 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Clock size={12} className="text-amber-400" /> Transfer History
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...company.motorsport.techTransferHistory].reverse().map((entry, i) => (
              <div key={i} className="flex items-start gap-3 bg-base-850/50 rounded-lg p-3 border border-base-800/50">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  entry.direction === "race_to_production"
                    ? "bg-accent-500/15 text-accent-300"
                    : "bg-amber-500/15 text-amber-300"
                }`}>
                  {entry.direction === "race_to_production" ? <ArrowRight size={12} /> : <ArrowLeft size={12} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-amber-50">
                    {entry.direction === "race_to_production" ? "Race → Production" : "Production → Race"} ·
                    <span className="text-amber-300 ml-1 font-mono">{entry.points}pts</span>
                  </div>
                  <div className="text-[10px] text-amber-300/50 mt-0.5">{entry.bonus}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] bg-base-800 rounded px-1.5 py-0.5 text-amber-300/50 capitalize">{entry.category}</span>
                    <span className="text-[9px] text-amber-400">Month {entry.month}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-base-800/50 text-center">
            <span className="text-xs text-amber-300/50">Total transferred: </span>
            <span className="text-sm font-bold font-mono text-amber-300">{company.motorsport.totalTechTransferred}pts</span>
          </div>
        </div>
      )}
    </div>
  );
});

