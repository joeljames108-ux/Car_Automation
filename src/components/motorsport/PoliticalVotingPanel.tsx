// ===================================================================
// POLITICAL VOTING PANEL — World Motorsport Council Votes
// ===================================================================
import { useState } from "react";
import { Gavel, Check, X, ThumbsUp, ThumbsDown, Vote } from "lucide-react";

interface PoliticalMotion {
  id: string;
  title: string;
  desc: string;
  effect: string;
  votesFor: number;
  votesAgainst: number;
  userVote: "for" | "against" | null;
}

const DEFAULT_MOTIONS: PoliticalMotion[] = [
  { id: "v1", title: "Standardized Front Wing Aerodynamics", desc: "Mandate uniform front wing aerodynamics across all teams to cut development costs and tighten the field.", effect: "Reduces top team aero advantage by 15%, budget cap lowered by $10M.", votesFor: 6, votesAgainst: 4, userVote: null },
  { id: "v2", title: "Sprint Race Saturday Qualifying Format", desc: "Introduce a Saturday 100km sprint race for extra championship points and expanded TV viewership.", effect: "Increases season points potential by 10%, increases engine component wear.", votesFor: 8, votesAgainst: 2, userVote: null },
  { id: "v3", title: "Relax Inspection Penalty for Experimental Parts", desc: "Relax strict scrutineering penalties for experimental engine mappings and active aero prototypes.", effect: "Increases performance ceiling by 8%, increases risk of disqualification.", votesFor: 3, votesAgainst: 7, userVote: null },
  { id: "v4", title: "Compulsory Sustainable E-Fuel 100%", desc: "Mandate 100% synthetic advanced biofuels, requiring complete combustion chamber redesigns.", effect: "Reduces engine emissions footprint to zero, thermal efficiency delta +5%.", votesFor: 7, votesAgainst: 3, userVote: null },
];

export function PoliticalVotingPanel() {
  const [motions, setMotions] = useState<PoliticalMotion[]>(DEFAULT_MOTIONS);

  const handleVote = (id: string, choice: "for" | "against") => {
    setMotions(prev => prev.map(m => {
      if (m.id !== id) return m;
      const prevVote = m.userVote;
      let newFor = m.votesFor;
      let newAgainst = m.votesAgainst;
      if (prevVote === "for") newFor--;
      if (prevVote === "against") newAgainst--;
      if (choice === "for") newFor++;
      if (choice === "against") newAgainst++;
      return { ...m, votesFor: newFor, votesAgainst: newAgainst, userVote: choice };
    }));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="glass-panel p-5 border-yellow-500/20 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-yellow-400 uppercase tracking-widest">WORLD MOTORSPORT COUNCIL</span>
              <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full">POLITICAL INFLUENCE</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-1">
              <Gavel size={20} className="text-yellow-400" /> Governing Body Political Rule Voting
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cast your team's vote on proposed regulation changes. Sway political decisions to favor your engineering strengths or handicap rival constructors.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {motions.map((m) => {
            const total = m.votesFor + m.votesAgainst;
            const pctFor = total > 0 ? (m.votesFor / total) * 100 : 50;

            return (
              <div key={m.id} className="bg-base-950/70 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Vote size={14} className="text-yellow-400" /> {m.title}
                  </h4>
                  <span className="text-xs font-mono text-yellow-300 bg-yellow-500/10 border border-yellow-500/30 px-2.5 py-0.5 rounded-full font-bold">
                    {m.votesFor} FOR / {m.votesAgainst} AGAINST
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>

                {/* Visual voting bar */}
                <div className="space-y-1">
                  <div className="h-2 bg-base-900 rounded-full overflow-hidden flex border border-white/5">
                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${pctFor}%` }} />
                    <div className="bg-rose-500 h-full transition-all" style={{ width: `${100 - pctFor}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span className="text-emerald-400">{pctFor.toFixed(0)}% Support</span>
                    <span className="text-rose-400">{(100 - pctFor).toFixed(0)}% Oppose</span>
                  </div>
                </div>

                <div className="text-xs font-mono text-cyan-300 bg-cyan-500/10 p-2.5 rounded-lg border border-cyan-500/20">
                  ⚡ Impact: {m.effect}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleVote(m.id, "for")}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      m.userVote === "for"
                        ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                        : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25"
                    }`}
                  >
                    <ThumbsUp size={12} /> Vote FOR {m.userVote === "for" && "✓"}
                  </button>
                  <button
                    onClick={() => handleVote(m.id, "against")}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      m.userVote === "against"
                        ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                        : "bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25"
                    }`}
                  >
                    <ThumbsDown size={12} /> Vote AGAINST {m.userVote === "against" && "✓"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
