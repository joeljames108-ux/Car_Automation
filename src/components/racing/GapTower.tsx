// ============================================================================
// RACE ENGINEERING SUITE — GAP TOWER (TIMING TOWER)
// ============================================================================
// Real-time position tower showing driver order, gaps, intervals, tire
// compounds, pit stops, and lap times with color-coded sector information.
// ============================================================================

import React, { useState, memo } from 'react';
import { TIRE_COMPOUNDS } from '../../sim/tires/pacejkaTireModel';

interface TimingEntry {
  position: number;
  number: number;
  name: string;
  team: string;
  gap: string;
  interval: string;
  lastLap: string;
  bestLap: string;
  sector1: string;
  sector2: string;
  sector3: string;
  sector1Color: 'purple' | 'green' | 'yellow' | null;
  sector2Color: 'purple' | 'green' | 'yellow' | null;
  sector3Color: 'purple' | 'green' | 'yellow' | null;
  tireCompound: string;
  tireAge: number;
  pitStops: number;
  isOnLeadLap: boolean;
  isDRS: boolean;
  status: 'running' | 'pit' | 'retired';
}

interface GapTowerProps {
  entries: TimingEntry[];
  highlightDriver?: string;
  showSectors?: boolean;
}

const SECTOR_COLORS = {
  purple: 'text-purple-400 bg-purple-500/20',
  green: 'text-green-400 bg-green-500/20',
  yellow: 'text-yellow-400 bg-yellow-500/10',
};

export const GapTower: React.FC<GapTowerProps> = memo(function GapTower({
  entries, highlightDriver, showSectors = true,
}) {
  const [sortMode, setSortMode] = useState<'position' | 'gap' | 'lastLap'>('position');

  const sorted = [...entries].sort((a, b) => {
    if (sortMode === 'position') return a.position - b.position;
    if (sortMode === 'gap') return parseFloat(a.gap || '0') - parseFloat(b.gap || '0');
    return parseFloat(a.lastLap || '999') - parseFloat(b.lastLap || '999');
  });

  const getTeamColor = (team: string): string => {
    const colors: Record<string, string> = {
      'Red Bull Racing': '#3671C6', 'Ferrari': '#E8002D', 'McLaren': '#FF8000',
      'Mercedes': '#27F4D2', 'Aston Martin': '#229971', 'Alpine': '#FF87BC',
      'Williams': '#64C4FF', 'AlphaTauri': '#5E8FAA', 'Alfa Romeo': '#C92D4B',
      'Haas': '#B6BABD',
    };
    return colors[team] || '#d4a843';
  };

  return (
    <div className="bg-amber-950/80 rounded-2xl border border-amber-800/30 overflow-hidden">
      {/* Header */}
      <div className="bg-amber-900/50 px-3 py-2 flex items-center text-xs font-bold text-amber-400 border-b border-amber-800/30">
        <span className="w-8 text-center">#</span>
        <span className="w-7 text-center">N</span>
        <span className="w-28 ml-1">DRIVER</span>
        <span className="w-16 text-right">GAP</span>
        <span className="w-16 text-right">INT</span>
        {showSectors && (
          <>
            <span className="w-14 text-center">S1</span>
            <span className="w-14 text-center">S2</span>
            <span className="w-14 text-center">S3</span>
          </>
        )}
        <span className="w-20 text-right">LAST</span>
        <span className="w-5" />
        <span className="w-6" />
        <span className="w-10 text-center">PIT</span>
      </div>

      {/* Entries */}
      <div className="divide-y divide-amber-900/20">
        {sorted.map(entry => {
          const isHighlighted = highlightDriver === entry.name;
          const tire = TIRE_COMPOUNDS[entry.tireCompound];

          return (
            <div key={entry.number}
              className={`px-3 py-1.5 flex items-center text-xs transition-colors ${
                isHighlighted ? 'bg-amber-500/15' :
                entry.status === 'retired' ? 'opacity-40' : 'hover:bg-amber-900/20'
              }`}>
              {/* Position */}
              <span className={`w-8 text-center font-bold ${
                entry.position === 1 ? 'text-yellow-400 text-sm' :
                entry.position <= 3 ? 'text-amber-300' : 'text-amber-400/70'
              }`}>
                {entry.position}
              </span>

              {/* Number */}
              <span className="w-7 text-center font-bold" style={{ color: getTeamColor(entry.team) }}>
                {entry.number}
              </span>

              {/* Name + Team */}
              <span className="w-28 ml-1 truncate">
                <span className={`font-bold ${isHighlighted ? 'text-amber-100' : 'text-amber-200'}`}>{entry.name}</span>
              </span>

              {/* Gap */}
              <span className={`w-16 text-right font-mono ${
                entry.gap === 'LEADER' ? 'text-amber-400 font-bold' : 'text-amber-300'
              }`}>
                {entry.gap}
              </span>

              {/* Interval */}
              <span className={`w-16 text-right font-mono ${entry.isDRS ? 'text-green-400' : 'text-amber-400/70'}`}>
                {entry.interval}
                {entry.isDRS && <span className="text-green-500 ml-0.5">D</span>}
              </span>

              {/* Sectors */}
              {showSectors && (
                <>
                  <span className={`w-14 text-center font-mono rounded px-1 ${
                    entry.sector1Color ? SECTOR_COLORS[entry.sector1Color] : 'text-amber-500'
                  }`}>{entry.sector1}</span>
                  <span className={`w-14 text-center font-mono rounded px-1 ${
                    entry.sector2Color ? SECTOR_COLORS[entry.sector2Color] : 'text-amber-500'
                  }`}>{entry.sector2}</span>
                  <span className={`w-14 text-center font-mono rounded px-1 ${
                    entry.sector3Color ? SECTOR_COLORS[entry.sector3Color] : 'text-amber-500'
                  }`}>{entry.sector3}</span>
                </>
              )}

              {/* Last Lap */}
              <span className="w-20 text-right font-mono text-amber-200">{entry.lastLap}</span>

              {/* Tire Compound */}
              <span className="w-5 flex justify-center">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tire?.color || '#888' }} />
              </span>

              {/* Tire Age */}
              <span className={`w-6 text-center ${
                entry.tireAge > 25 ? 'text-red-400' : entry.tireAge > 15 ? 'text-yellow-400' : 'text-amber-400/60'
              }`}>{entry.tireAge}</span>

              {/* Pit Stops */}
              <span className="w-10 text-center text-amber-400/70">{entry.pitStops}</span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-amber-900/30 px-3 py-1.5 flex items-center gap-4 text-xs text-amber-500 border-t border-amber-800/20">
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Purple</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Green</div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Yellow</div>
        <span className="ml-auto">D = DRS</span>
      </div>
    </div>
  );
});
