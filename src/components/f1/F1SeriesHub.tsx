// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — SERIES SELECTION & ENTRY WIZARD HUB
// ============================================================================

import React, { useState, memo } from "react";
import { Trophy, Zap, Shield, ChevronRight, Calendar, Users, Sliders, Play, Sparkles, DollarSign } from "lucide-react";
import { F1_OFFICIAL_CALENDAR } from "../../sim/f1/season/f1Calendar";
import { F1_RIVAL_TEAMS } from "../../sim/f1/season/f1RivalTeams";
import { useF1ConstructorStore } from "../../sim/f1/state/f1ConstructorStore";
import { playHMIClickSound } from "../../utils/hmiSoundSynth";

interface F1SeriesHubProps {
  onEnterWorkshop: () => void;
  onCancel?: () => void;
}

export const F1SeriesHub: React.FC<F1SeriesHubProps> = memo(function F1SeriesHub({ onEnterWorkshop, onCancel }) {
  const { car, updateLivery } = useF1ConstructorStore();
  const [teamName, setTeamName] = useState(car.name);
  const [budgetTier, setBudgetTier] = useState<number>(140);
  const [selectedDriverName, setSelectedDriverName] = useState("Player Lead Driver");

  const handleStartSeason = () => {
    playHMIClickSound();
    updateLivery({ titleSponsorName: "APEX HORIZON DYNAMICS" });
    onEnterWorkshop();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 animate-fade-in-up">
      {/* Hero Welcome Banner */}
      <div className="glass-panel p-8 border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900/95 to-cyan-950/40 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            <Sparkles size={14} /> FIA FORMULA 1 CONSTRUCTOR CHAMPIONSHIP
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
            Build Your Formula 1 Car From Scratch
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Enter the pinnacle of motorsport engineering. Design a 1,000+ HP V6 turbo-hybrid power unit, autoclave carbon fiber monocoque, ground-effect venturi aero floor, and 8-speed seamless shift gearbox to compete across a 24-race world championship.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={handleStartSeason}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all group cursor-pointer"
            >
              <span>ENTER F1 DESIGN WORKSHOP</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            {onCancel && (
              <button
                onClick={() => {
                  playHMIClickSound();
                  onCancel();
                }}
                className="px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all border border-slate-700 cursor-pointer"
              >
                Back to Motorsport Menu
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Season Setup Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Team & Entry Configuration */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
            <Users size={16} className="text-cyan-400" /> Team Entry Registration
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 uppercase">Constructor Team Name</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 uppercase">Season Cost Cap Budget</label>
              <select
                value={budgetTier}
                onChange={(e) => setBudgetTier(parseInt(e.target.value))}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value={140}>$140M Maximum FIA Cost Cap (Works Team)</option>
                <option value={115}>$115M Upper Midfield Budget</option>
                <option value={90}>$90M Independent Challenger Budget</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. 24-Race World Championship Calendar */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
              <Calendar size={16} className="text-amber-400" /> 24-Race World Tour
            </div>
            <span className="text-[10px] font-mono text-slate-400">Round 1: Bahrain</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {F1_OFFICIAL_CALENDAR.map((race, idx) => (
              <div key={race.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 text-[10px]">R{idx + 1}</span>
                  <span>{race.flagEmoji}</span>
                  <span className="text-slate-300 font-medium">{race.name}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-500">{race.downforceRequirement} DF</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. 10 Rival Constructor Grid */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
              <Trophy size={16} className="text-pink-400" /> 10 Rival Constructors
            </div>
            <span className="text-[10px] font-mono text-slate-400">20 Drivers</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {F1_RIVAL_TEAMS.map((rival) => (
              <div key={rival.teamId} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: rival.colorHex }} />
                  <span className="text-slate-300 font-medium truncate max-w-[120px]">{rival.teamName}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">{rival.driver1Name.split(" ")[1]} / {rival.driver2Name.split(" ")[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
