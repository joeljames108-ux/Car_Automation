import React, { useState } from "react";
import {
  Trophy,
  Medal,
  Timer,
  Flag,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Award,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonLeaderboardStudio() {
  const { sim } = useDesign();

  const [selectedCircuit, setSelectedCircuit] = useState("nurburgring");

  const records: Record<string, { circuitName: string; topRecord: string; holder: string; userEst: string; delta: string; rank: number; entries: { rank: number; car: string; time: string; driver: string; power: string }[] }> = {
    nurburgring: {
      circuitName: "Nürburgring Nordschleife",
      topRecord: "6:35.183",
      holder: "Mercedes-AMG ONE (Factory)",
      userEst: "6:42.850",
      delta: "+7.667s",
      rank: 4,
      entries: [
        { rank: 1, car: "Mercedes-AMG ONE", time: "6:35.183", driver: "Maro Engel", power: "1,063 HP" },
        { rank: 2, car: "Porsche 911 GT2 RS MR", time: "6:38.835", driver: "Lars Kern", power: "700 HP" },
        { rank: 3, car: "Mercedes-AMG GT Black", time: "6:43.616", driver: "Maro Engel", power: "730 HP" },
        { rank: 4, car: "Apex Horizon GT-X (Your Build)", time: "6:42.850", driver: "Apex AI / Sim", power: `${sim.peakPower} HP` },
        { rank: 5, car: "Lamborghini Aventador SVJ", time: "6:44.970", driver: "Marco Mapelli", power: "770 HP" },
      ],
    },
    spa: {
      circuitName: "Circuit de Spa-Francorchamps",
      topRecord: "2:11.350",
      holder: "Koenigsegg One:1",
      userEst: "2:13.400",
      delta: "+2.050s",
      rank: 2,
      entries: [
        { rank: 1, car: "Koenigsegg One:1", time: "2:11.350", driver: "Robert Serwanski", power: "1,360 HP" },
        { rank: 2, car: "Apex Horizon GT-X (Your Build)", time: "2:13.400", driver: "Apex AI / Sim", power: `${sim.peakPower} HP` },
        { rank: 3, car: "McLaren Senna LM", time: "2:14.280", driver: "Factory Pilot", power: "800 HP" },
        { rank: 4, car: "Porsche 911 GT3 RS", time: "2:16.800", driver: "Jörg Bergmeister", power: "525 HP" },
      ],
    },
    lemans: {
      circuitName: "Circuit de la Sarthe (Le Mans)",
      topRecord: "3:17.297",
      holder: "Toyota TS050 Hybrid",
      userEst: "3:24.100",
      delta: "+6.803s",
      rank: 3,
      entries: [
        { rank: 1, car: "Toyota TS050 Hybrid", time: "3:17.297", driver: "Kamui Kobayashi", power: "1,000 HP" },
        { rank: 2, car: "Porsche 919 Hybrid Evo", time: "3:19.400", driver: "Neel Jani", power: "1,160 HP" },
        { rank: 3, car: "Apex Horizon GT-X (Your Build)", time: "3:24.100", driver: "Apex AI / Sim", power: `${sim.peakPower} HP` },
        { rank: 4, car: "Aston Martin Valkyrie", time: "3:28.450", driver: "Darren Turner", power: "1,160 HP" },
      ],
    },
  };

  const activeRecord = records[selectedCircuit] || records.nurburgring;

  return (
    <div className="w-full flex flex-col gap-6 text-amber-50 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="gold"
        corners="reticle"
        header={{
          title: "WORLD CIRCUIT LAP RECORD HALL OF FAME & LEADERBOARD",
          subtitle: "Global lap time telemetry rankings, official FIA track records, and live ghost delta comparison",
          icon: <Trophy size={18} />,
          badge: <NeonHorizonBadge variant="gold">GLOBAL RANK #{activeRecord.rank}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="CIRCUIT" value={activeRecord.circuitName.split(" ")[0]} accentColor="gold" />
          <NeonHorizonDataCard label="WORLD RECORD" value={activeRecord.topRecord} accentColor="cyan" />
          <NeonHorizonDataCard label="YOUR ESTIMATE" value={activeRecord.userEst} accentColor="emerald" />
          <NeonHorizonDataCard label="GHOST DELTA" value={activeRecord.delta} accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Circuit Selector (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {[
            { id: "nurburgring", name: "Nürburgring Nordschleife" },
            { id: "spa", name: "Spa-Francorchamps" },
            { id: "lemans", name: "Circuit de la Sarthe" },
          ].map((c) => {
            const isSelected = selectedCircuit === c.id;
            return (
              <div
                key={c.id}
                onClick={() => {
                  playHMIClickSound();
                  setSelectedCircuit(c.id);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
 isSelected
 ? "bg-sky-400/10 border-sky-400/30 text-sky-200"
 : "bg-[#0a111e] border-white/10 hover:border-sky-400/25"
 }`}
              >
                <div className="flex items-center gap-3">
                  <Flag size={16} className={isSelected ? "text-sky-400" : "text-amber-200/60"} />
                  <span className="text-xs font-bold text-amber-50">{c.name}</span>
                </div>
                <ChevronRight size={14} className={isSelected ? "text-sky-400" : "text-amber-300/50"} />
              </div>
            );
          })}
        </div>

        {/* Right Leaderboard Entries (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: `OFFICIAL LEADERBOARD · ${activeRecord.circuitName.toUpperCase()}`,
              icon: <Award size={16} />,
            }}
            className="p-6 flex flex-col gap-3"
          >
            {activeRecord.entries.map((entry) => {
              const isUser = entry.car.includes("Your Build");
              return (
                <div
                  key={entry.rank}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
 isUser
 ? "bg-sky-400/10 border-sky-400/30 text-sky-200"
 : "bg-[#0a111e] border-white/10"
 }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
 entry.rank === 1 ? "bg-amber-400 text-slate-950" : entry.rank === 2 ? "bg-slate-300 text-slate-950" : entry.rank === 3 ? "bg-amber-700 text-amber-50" : "bg-sky-400/12 text-sky-300"
 }`}>
                      #{entry.rank}
                    </span>
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold ${isUser ? "text-sky-300" : "text-amber-50"}`}>
                        {entry.car}
                      </span>
                      <span className="text-[10px] text-amber-200/60 font-mono">
                        {entry.driver} · {entry.power}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold font-mono ${isUser ? "text-sky-300" : "text-amber-50"}`}>
                    {entry.time}
                  </span>
                </div>
              );
            })}
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
