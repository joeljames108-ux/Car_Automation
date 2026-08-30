// ============================================================================
// RACE ENGINEERING SUITE — PIT STOP OPTIMIZER
// ============================================================================
// Interactive pit stop planning tool with tire compound selection, fuel
// load optimization, pit window visualization, and undercut/overcut analysis.
// ============================================================================

import React, { useState, useMemo, memo } from 'react';
import { TIRE_COMPOUNDS } from '../../sim/tires/pacejkaTireModel';
import { PitStopStrategyEngine, RaceStrategy, PitWindow } from '../../sim/racing/pitStopStrategy';
import { playHMIClickSound } from '../../utils/hmiSoundSynth';

interface PitStopOptimizerProps {
  totalLaps: number;
  trackLength: number;
  currentLap: number;
  currentCompound: string;
  currentTireWear: number;
  strategies: RaceStrategy[];
  onStrategySelect?: (strategy: RaceStrategy) => void;
}

export const PitStopOptimizer: React.FC<PitStopOptimizerProps> = memo(function PitStopOptimizer({
  totalLaps, trackLength, currentLap, currentCompound, currentTireWear, strategies, onStrategySelect,
}) {
  const [selectedStrategy, setSelectedStrategy] = useState<string>(strategies[0]?.id || '');
  const [customPitLap, setCustomPitLap] = useState(Math.floor(totalLaps / 2));
  const [customCompound, setCustomCompound] = useState('hard');

  const engine = useMemo(() => new PitStopStrategyEngine(trackLength, totalLaps, 22), [trackLength, totalLaps]);
  const pitWindow = useMemo(() => engine.calculatePitWindow(currentCompound, currentLap, currentTireWear), [engine, currentCompound, currentLap, currentTireWear]);

  const handleSelect = (strategy: RaceStrategy) => {
    playHMIClickSound();
    setSelectedStrategy(strategy.id);
    onStrategySelect?.(strategy);
  };

  return (
    <div className="space-y-4">
      {/* Pit Window */}
      <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50">
        <h3 className="text-amber-300 text-sm font-bold mb-3">PIT WINDOW — {currentCompound.toUpperCase()}</h3>
        <div className="relative h-8 bg-slate-900/80 rounded-full overflow-hidden mb-3">
          {/* Full race bar */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: totalLaps }, (_, i) => (
              <div key={i} className={`h-full flex-1 ${
                i < currentLap ? 'bg-amber-800/30' :
                i >= pitWindow.earliest && i <= pitWindow.latest ? 'bg-green-500/30' :
                i === pitWindow.optimal ? 'bg-green-500/70' :
                'bg-slate-900/60'
              } border-r border-slate-800/20`} />
            ))}
          </div>
          {/* Current position */}
          <div className="absolute top-0 h-full w-0.5 bg-amber-100"
            style={{ left: `${(currentLap / totalLaps) * 100}%` }} />
          {/* Optimal pit marker */}
          <div className="absolute top-0 h-full w-1 bg-green-400"
            style={{ left: `${(pitWindow.optimal / totalLaps) * 100}%` }} />
        </div>
        <div className="flex justify-between text-xs text-amber-500">
          <span>LAP {pitWindow.earliest}</span>
          <span className="text-green-400 font-bold">OPTIMAL: LAP {pitWindow.optimal}</span>
          <span>LAP {pitWindow.latest}</span>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="text-center">
            <span className="text-amber-500 text-xs">UNDERCUT</span>
            <p className={`font-bold text-sm ${pitWindow.undercutGain > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {pitWindow.undercutGain > 0 ? '+' : ''}{pitWindow.undercutGain.toFixed(2)}s
            </p>
          </div>
          <div className="text-center">
            <span className="text-amber-500 text-xs">OVERCUT</span>
            <p className={`font-bold text-sm ${pitWindow.overcutLoss < 0 ? 'text-green-400' : 'text-red-400'}`}>
              {pitWindow.overcutLoss > 0 ? '+' : ''}{pitWindow.overcutLoss.toFixed(2)}s
            </p>
          </div>
          <div className="text-center">
            <span className="text-amber-500 text-xs">NEXT TIRE</span>
            <p className="font-bold text-sm text-amber-100 flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TIRE_COMPOUNDS[pitWindow.compoundRecommendation]?.color }} />
              {pitWindow.compoundRecommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Strategy Comparison */}
      <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50">
        <h3 className="text-amber-300 text-sm font-bold mb-3">STRATEGY COMPARISON</h3>
        <div className="space-y-2">
          {strategies.slice(0, 6).map((s, i) => (
            <div key={s.id}
              onClick={() => handleSelect(s)}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                selectedStrategy === s.id
                  ? 'bg-amber-500/20 border border-amber-500/40'
                  : 'bg-slate-900/60 border border-slate-800 hover:bg-slate-800/40'
              }`}>
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-green-500 text-white' : 'bg-slate-800/60 text-amber-400'
                }`}>{i + 1}</span>
                <div>
                  <span className="text-amber-100 text-sm font-bold">{s.name}</span>
                  <div className="flex gap-1 mt-1">
                    {s.tireCompounds.map((t, j) => (
                      <span key={j} className="flex items-center gap-0.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TIRE_COMPOUNDS[t]?.color }} />
                        {j < s.tireCompounds.length - 1 && <span className="text-amber-700 text-xs">{'\u2192'}</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-amber-100 text-sm font-bold">{Math.floor(s.totalRaceTime / 60)}:{(s.totalRaceTime % 60).toFixed(1).padStart(4, '0')}</p>
                <p className="text-xs text-amber-500">{s.stops.length} stop{s.stops.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Pit Planner */}
      <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50">
        <h3 className="text-amber-300 text-sm font-bold mb-3">CUSTOM PIT PLANNER</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-amber-500 text-xs block mb-1">Pit Lap</label>
            <input type="range" min={currentLap + 1} max={totalLaps - 1} value={customPitLap}
              onChange={e => setCustomPitLap(parseInt(e.target.value))}
              className="w-full accent-amber-500" />
            <p className="text-amber-100 text-sm text-center mt-1">Lap {customPitLap}</p>
          </div>
          <div>
            <label className="text-amber-500 text-xs block mb-1">Tire Compound</label>
            <div className="flex gap-2">
              {Object.entries(TIRE_COMPOUNDS).filter(([k]) => !['intermediate', 'wet'].includes(k)).map(([key, compound]) => (
                <button
                  key={key}
                  onClick={() => {
                    playHMIClickSound();
                    setCustomCompound(key);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    customCompound === key ? 'ring-2 ring-amber-400' : ''
                  }`}
                  style={{ backgroundColor: compound.color + '33', color: compound.color }}
                >
                  {compound.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
