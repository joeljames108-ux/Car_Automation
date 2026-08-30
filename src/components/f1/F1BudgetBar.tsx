import React, { memo } from "react";
import { Zap, Gauge, Wind, Shield, DollarSign, RotateCcw, Undo2, Redo2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useF1ConstructorStore } from "../../sim/f1/state/f1ConstructorStore";
import { playHMIClickSound } from "../../utils/hmiSoundSynth";

export const F1BudgetBar: React.FC = memo(function F1BudgetBar() {
  const {
    car,
    budgetCapMaxUsd,
    totalBudgetSpentUsd,
    undoStack,
    redoStack,
    undo,
    redo,
    resetToFactoryBaseline,
  } = useF1ConstructorStore();

  const spentMillions = (totalBudgetSpentUsd / 1_000_000).toFixed(1);
  const capMillions = (budgetCapMaxUsd / 1_000_000).toFixed(0);
  const budgetPercentage = Math.min(100, (totalBudgetSpentUsd / budgetCapMaxUsd) * 100);

  return (
    <div className="bg-amber-900/40 backdrop-blur-md border-b border-amber-800/30 p-3 sticky top-0 z-30 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Car Name & FIA Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/40 flex items-center justify-center font-mono font-black text-amber-400 text-sm shadow-inner">
            F1
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-amber-50">{car.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-800/35 text-amber-200/60 border border-amber-700/30">
                #{car.livery.carNumber}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-200/60">
              <span className="flex items-center gap-1 font-mono text-[11px]">
                {car.computedFiaHomologationScore === 100 ? (
                  <span className="text-ok-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 size={12} /> FIA Pass (100%)
                  </span>
                ) : (
                  <span className="text-warn-400 flex items-center gap-1 font-semibold">
                    <AlertTriangle size={12} /> Scrutineering: {car.computedFiaHomologationScore}%
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Technical KPIs */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {/* Power */}
          <div className="bg-amber-950/60 border border-amber-800/30 px-3 py-1.5 rounded-xl text-center">
            <div className="flex items-center gap-1 text-[10px] text-amber-300/50 uppercase tracking-wider justify-center">
              <Zap size={10} className="text-amber-400" /> Total Power
            </div>
            <div className="font-mono text-sm font-black text-amber-50">
              {car.computedTotalPeakHp} <span className="text-[10px] text-amber-300/50 font-normal">HP</span>
            </div>
          </div>

          {/* Weight */}
          <div className="bg-amber-950/60 border border-amber-800/30 px-3 py-1.5 rounded-xl text-center">
            <div className="flex items-center gap-1 text-[10px] text-amber-300/50 uppercase tracking-wider justify-center">
              <Gauge size={10} className="text-amber-200/60" /> Mass
            </div>
            <div className={`font-mono text-sm font-black ${car.computedTotalMassKg >= 798 ? "text-ok-400" : "text-danger-400"}`}>
              {car.computedTotalMassKg} <span className="text-[10px] text-amber-300/50 font-normal">kg</span>
            </div>
          </div>

          {/* Downforce */}
          <div className="bg-amber-950/60 border border-amber-800/30 px-3 py-1.5 rounded-xl text-center">
            <div className="flex items-center gap-1 text-[10px] text-amber-300/50 uppercase tracking-wider justify-center">
              <Wind size={10} className="text-amber-400" /> Downforce
            </div>
            <div className="font-mono text-sm font-black text-amber-300">
              {car.aero.totalDownforceAt250KmhKg} <span className="text-[10px] text-amber-300/50 font-normal">kg</span>
            </div>
          </div>

          {/* Budget Cap Usage */}
          <div className="bg-amber-950/60 border border-amber-800/30 px-3 py-1.5 rounded-xl text-left min-w-[130px]">
            <div className="flex items-center justify-between text-[10px] text-amber-300/50 uppercase tracking-wider mb-0.5">
              <span>Cost Cap</span>
              <span className="font-mono text-amber-100/80 font-bold">${spentMillions}M / ${capMillions}M</span>
            </div>
            <div className="w-full h-1.5 bg-amber-800/35 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  budgetPercentage > 95 ? "bg-danger-500" : budgetPercentage > 80 ? "bg-amber-500" : "bg-amber-500"
                }`}
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* History / Reset Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              playHMIClickSound();
              undo();
            }}
            disabled={undoStack.length === 0}
            title="Undo"
            className="p-2 rounded-lg bg-amber-800/35/80 hover:bg-amber-700/40 text-amber-100/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-amber-700/30 cursor-pointer"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={() => {
              playHMIClickSound();
              redo();
            }}
            disabled={redoStack.length === 0}
            title="Redo"
            className="p-2 rounded-lg bg-amber-800/35/80 hover:bg-amber-700/40 text-amber-100/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-amber-700/30 cursor-pointer"
          >
            <Redo2 size={14} />
          </button>
          <button
            onClick={() => {
              playHMIClickSound();
              resetToFactoryBaseline();
            }}
            title="Reset to Factory Spec"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-800/35/80 hover:bg-amber-700/40 text-xs text-amber-100/80 transition-all border border-amber-700/30 cursor-pointer"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
});
