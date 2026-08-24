// ============================================================================
// RACE ENGINEERING SUITE — TIRE STRATEGY VIEW
// ============================================================================
// Visual tire strategy chart showing planned and actual tire stints across
// the race with compound colors, stint lengths, and pit stop markers.
// ============================================================================

import React, { useMemo } from 'react';
import { TIRE_COMPOUNDS, PacejkaTireModel } from '../../sim/tires/pacejkaTireModel';

interface TireStint {
  compound: string;
  startLap: number;
  endLap: number;
  actual?: boolean;
}

interface TireStrategyViewProps {
  totalLaps: number;
  stints: TireStint[];
  currentLap: number;
  tireStates?: { compound: string; wear: number; temp: number }[];
}

export const TireStrategyView: React.FC<TireStrategyViewProps> = ({
  totalLaps, stints, currentLap, tireStates = [],
}) => {
  const pitStops = useMemo(() =>
    stints.filter((s, i) => i > 0).map(s => s.startLap),
    [stints]
  );

  return (
    <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
      <h3 className="text-amber-300 text-sm font-bold mb-3">{'\u25CF'} TIRE STRATEGY MAP</h3>

      {/* Strategy visualization */}
      <div className="relative h-12 mb-4">
        {/* Lap grid */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: totalLaps }, (_, i) => (
            <div key={i} className={`h-full flex-1 border-r ${
              i === currentLap ? 'border-amber-400 bg-amber-400/10' : 'border-amber-900/20'
            }`} />
          ))}
        </div>

        {/* Tire stints */}
        {stints.map((stint, i) => {
          const compound = TIRE_COMPOUNDS[stint.compound];
          if (!compound) return null;
          const left = (stint.startLap / totalLaps) * 100;
          const width = ((stint.endLap - stint.startLap) / totalLaps) * 100;
          return (
            <div key={i} className="absolute top-0 h-full rounded-lg flex items-center justify-center text-xs font-bold text-white/80"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                backgroundColor: compound.color,
                opacity: stint.actual ? 0.9 : 0.5,
                borderRight: i < stints.length - 1 ? '2px solid white' : 'none',
              }}>
              {compound.emoji} {width > 8 && `${stint.endLap - stint.startLap}L`}
            </div>
          );
        })}

        {/* Current lap marker */}
        <div className="absolute top-0 h-full w-0.5 bg-amber-100 z-10"
          style={{ left: `${(currentLap / totalLaps) * 100}%` }} />
      </div>

      {/* Lap labels */}
      <div className="flex justify-between text-xs text-amber-500 mb-4">
        <span>LAP 1</span>
        <span>LAP {totalLaps}</span>
      </div>

      {/* Compound legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {Object.entries(TIRE_COMPOUNDS).map(([key, compound]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: compound.color }} />
            <span className="text-xs text-amber-300">{compound.name}</span>
          </div>
        ))}
      </div>

      {/* Current tire status */}
      {tireStates.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mt-3">
          {['FL', 'FR', 'RL', 'RR'].map((pos, i) => {
            const tire = tireStates[i];
            if (!tire) return null;
            const compound = TIRE_COMPOUNDS[tire.compound];
            return (
              <div key={pos} className="bg-amber-950/40 rounded-xl p-2 text-center">
                <span className="text-amber-500 text-xs block">{pos}</span>
                <div className="w-4 h-4 rounded-full mx-auto my-1" style={{ backgroundColor: compound?.color || '#888' }} />
                <span className="text-amber-100 text-xs block">{tire.wear.toFixed(1)}%</span>
                <span className="text-amber-400/60 text-xs block">{Math.round(tire.temp)}\u00B0C</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Pit stop markers */}
      {pitStops.length > 0 && (
        <div className="mt-3 text-xs text-amber-400">
          Pit stops: {pitStops.map(l => `Lap ${l}`).join(', ')}
        </div>
      )}
    </div>
  );
};
