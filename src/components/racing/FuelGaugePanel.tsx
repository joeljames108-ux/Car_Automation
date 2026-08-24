// ============================================================================
// RACE ENGINEERING SUITE — FUEL GAUGE PANEL
// ============================================================================
// Detailed fuel management display with real-time consumption tracking,
// mixture modes, fuel delta visualization, and race fuel target analysis.
// ============================================================================

import React, { useMemo } from 'react';
import { FuelModel } from '../../sim/racing/fuelModel';

interface FuelGaugePanelProps {
  fuelModel: FuelModel;
  currentLap: number;
  totalLaps: number;
  onMixtureChange?: (mixture: string) => void;
}

export const FuelGaugePanel: React.FC<FuelGaugePanelProps> = ({
  fuelModel, currentLap, totalLaps, onMixtureChange,
}) => {
  const state = fuelModel.getState();
  const strategy = useMemo(() => fuelModel.getStrategy(totalLaps, currentLap), [fuelModel, totalLaps, currentLap]);
  const percentage = fuelModel.getFuelPercentage();
  const remainingLaps = fuelModel.getRemainingLaps();
  const lapsRemaining = totalLaps - currentLap;
  const fuelDelta = remainingLaps - lapsRemaining;
  const isOverFueled = fuelDelta > 1;
  const isUnderFueled = fuelDelta < -1;

  const mixtures = [
    { id: 'lean', label: 'LEAN', desc: 'Save fuel', color: '#22c55e', icon: '\u{1F7E2}' },
    { id: 'standard', label: 'STD', desc: 'Balanced', color: '#facc15', icon: '\u{1F7E1}' },
    { id: 'rich', label: 'RICH', desc: 'Push mode', color: '#f97316', icon: '\u{1F7E0}' },
    { id: 'qualifying', label: 'QUAL', desc: 'Maximum', color: '#ef4444', icon: '\u{1F534}' },
  ];

  return (
    <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
      <h3 className="text-amber-300 text-sm font-bold mb-3">{'\u26FD'} FUEL MANAGEMENT</h3>

      {/* Main fuel gauge */}
      <div className="mb-4">
        <div className="flex justify-between items-end mb-2">
          <div>
            <span className="text-amber-500 text-xs">FUEL LOAD</span>
            <p className="text-amber-100 text-3xl font-bold">{state.currentLoad.toFixed(1)}<span className="text-sm text-amber-400">kg</span></p>
          </div>
          <div className="text-right">
            <span className="text-amber-500 text-xs">CAPACITY</span>
            <p className="text-amber-300 text-sm">{state.maxCapacity}kg</p>
          </div>
        </div>

        {/* Fuel bar */}
        <div className="relative h-6 bg-amber-950/60 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percentage}%`,
              background: isUnderFueled ? 'linear-gradient(90deg, #ef4444, #dc2626)' :
                isOverFueled ? 'linear-gradient(90deg, #22c55e, #16a34a)' :
                'linear-gradient(90deg, #d4a843, #b8922e)',
            }} />
          {/* Target line */}
          <div className="absolute top-0 h-full w-0.5 bg-white/50"
            style={{ left: `${(lapsRemaining * (state.totalConsumed / Math.max(1, state.lapCount)) / state.maxCapacity) * 100}%` }} />
        </div>
        <div className="flex justify-between text-xs text-amber-500 mt-1">
          <span>0kg</span>
          <span>{state.maxCapacity}kg</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <span className="text-amber-500 text-xs">CONSUMPTION/LAP</span>
          <p className="text-amber-100 font-bold">{state.consumption.toFixed(3)} kg</p>
        </div>
        <div className="text-center">
          <span className="text-amber-500 text-xs">LAPS FUEL LEFT</span>
          <p className={`font-bold ${remainingLaps < lapsRemaining ? 'text-red-400' : 'text-green-400'}`}>
            {remainingLaps}
          </p>
        </div>
        <div className="text-center">
          <span className="text-amber-500 text-xs">FUEL DELTA</span>
          <p className={`font-bold ${isUnderFueled ? 'text-red-400' : isOverFueled ? 'text-amber-400' : 'text-green-400'}`}>
            {fuelDelta > 0 ? '+' : ''}{fuelDelta.toFixed(1)} laps
          </p>
        </div>
      </div>

      {/* Fuel delta indicator */}
      <div className="bg-amber-950/40 rounded-xl p-3 mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-amber-500 text-xs">FUEL TARGET STATUS</span>
          <span className={`text-xs font-bold ${isUnderFueled ? 'text-red-400' : isOverFueled ? 'text-green-400' : 'text-amber-300'}`}>
            {isUnderFueled ? '\u26A0 UNDERFUELED' : isOverFueled ? '\u2714 OVERFUELED' : '\u2022 ON TARGET'}
          </span>
        </div>
        <p className="text-amber-200 text-sm">
          {isUnderFueled
            ? `We are ${(fuelDelta * -1).toFixed(1)} laps short. Switch to lean mixture to save fuel.`
            : isOverFueled
            ? `+${fuelDelta.toFixed(1)} laps spare. You can push in rich mode.`
            : 'Fuel is exactly on target. Maintain standard mixture.'
          }
        </p>
      </div>

      {/* Mixture selector */}
      <div>
        <span className="text-amber-500 text-xs block mb-2">ENGINE MIXTURE</span>
        <div className="grid grid-cols-4 gap-2">
          {mixtures.map(mix => (
            <button key={mix.id}
              onClick={() => onMixtureChange?.(mix.id)}
              className={`p-2 rounded-xl text-center transition-all cursor-pointer ${
                state.mixture === mix.id
                  ? 'ring-2 ring-amber-400 bg-amber-500/20'
                  : 'bg-amber-950/30 hover:bg-amber-900/40'
              }`}>
              <span className="text-lg">{mix.icon}</span>
              <p className="text-xs text-amber-100 font-bold mt-0.5">{mix.label}</p>
              <p className="text-xs text-amber-500">{mix.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Fuel flow gauge */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-amber-500 mb-1">
          <span>FUEL CONSUMPTION</span>
          <span>{state.consumption.toFixed(1)} kg/lap</span>
        </div>
        <div className="h-2 bg-amber-950/60 rounded-full">
          <div className="h-full bg-amber-400 rounded-full transition-all"
            style={{ width: `${Math.min(100, (state.consumption / 5) * 100)}%` }} />
        </div>
      </div>
    </div>
  );
};
