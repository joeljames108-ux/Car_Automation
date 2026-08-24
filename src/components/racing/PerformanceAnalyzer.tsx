// ============================================================================
// RACE ENGINEERING SUITE — PERFORMANCE ANALYZER
// ============================================================================
// Lap-by-lap comparison tool with sector delta visualization, pace analysis,
// tire degradation curves, and improvement opportunity identification.
// ============================================================================

import React, { useState, useMemo } from 'react';
import { PacejkaTireModel, TIRE_COMPOUNDS } from '../../sim/tires/pacejkaTireModel';

interface LapData {
  lap: number;
  time: number;
  s1: number;
  s2: number;
  s3: number;
  tireCompound: string;
  tireWear: number;
  fuelLoad: number;
  weather: string;
}

interface PerformanceAnalyzerProps {
  laps: LapData[];
  bestLapIndex?: number;
}

export const PerformanceAnalyzer: React.FC<PerformanceAnalyzerProps> = ({
  laps, bestLapIndex,
}) => {
  const [selectedLap, setSelectedLap] = useState<number>(0);
  const [compareLap, setCompareLap] = useState<number>(-1);

  const bestLap = useMemo(() => {
    if (bestLapIndex !== undefined) return bestLapIndex;
    return laps.reduce((best, l, i) => l.time < laps[best].time ? i : best, 0);
  }, [laps, bestLapIndex]);

  const stats = useMemo(() => {
    if (laps.length === 0) return null;
    const times = laps.map(l => l.time);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const best = Math.min(...times);
    const worst = Math.max(...times);
    const consistency = worst - best;
    const trend = laps.length > 3
      ? (laps[laps.length - 1].time - laps[laps.length - 3].time) / 2
      : 0;
    return { avg, best, worst, consistency, trend, count: laps.length };
  }, [laps]);

  const deltaToBest = useMemo(() => {
    if (selectedLap < 0 || selectedLap >= laps.length) return null;
    const lap = laps[selectedLap];
    const bestLapData = laps[bestLap];
    if (!bestLapData) return null;
    return {
      total: lap.time - bestLapData.time,
      s1: lap.s1 - bestLapData.s1,
      s2: lap.s2 - bestLapData.s2,
      s3: lap.s3 - bestLapData.s3,
    };
  }, [selectedLap, bestLap, laps]);

  if (laps.length === 0) {
    return (
      <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
        <p className="text-amber-400/50 text-sm text-center py-8">No lap data available. Start a race simulation.</p>
      </div>
    );
  }

  const maxTime = Math.max(...laps.map(l => l.time));
  const minTime = Math.min(...laps.map(l => l.time));
  const range = maxTime - minTime || 1;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
        <h3 className="text-amber-300 text-sm font-bold mb-3">PERFORMANCE SUMMARY</h3>
        {stats && (
          <div className="grid grid-cols-5 gap-4 text-center">
            <div><span className="text-amber-500 text-xs">BEST</span><p className="text-amber-100 font-bold">{stats.best.toFixed(3)}s</p></div>
            <div><span className="text-amber-500 text-xs">AVERAGE</span><p className="text-amber-100 font-bold">{stats.avg.toFixed(3)}s</p></div>
            <div><span className="text-amber-500 text-xs">WORST</span><p className="text-amber-100 font-bold">{stats.worst.toFixed(3)}s</p></div>
            <div><span className="text-amber-500 text-xs">SPREAD</span><p className="text-amber-100 font-bold">{stats.consistency.toFixed(3)}s</p></div>
            <div><span className="text-amber-500 text-xs">TREND</span>
              <p className={`font-bold ${stats.trend < 0 ? 'text-green-400' : stats.trend > 0 ? 'text-red-400' : 'text-amber-100'}`}>
                {stats.trend > 0 ? '+' : ''}{stats.trend.toFixed(3)}s
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Lap Time Chart */}
      <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
        <h3 className="text-amber-300 text-sm font-bold mb-3">LAP TIME TREND</h3>
        <div className="h-32">
          <svg viewBox={`0 0 ${Math.max(1, laps.length * 30)} 120`} className="w-full h-full" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map(f => (
              <line key={f} x1="0" y1={f * 120} x2={laps.length * 30} y2={f * 120} stroke="#3d2e18" strokeWidth="0.5" />
            ))}
            {/* Lap time bars */}
            {laps.map((lap, i) => {
              const barHeight = ((lap.time - minTime) / range) * 100 + 5;
              const isSelected = i === selectedLap;
              const isBest = i === bestLap;
              return (
                <g key={i} onClick={() => setSelectedLap(i)} style={{ cursor: 'pointer' }}>
                  <rect x={i * 30 + 2} y={115 - barHeight} width="26" height={barHeight} rx="2"
                    fill={isBest ? '#22c55e' : isSelected ? '#d4a843' : '#6b5a3e'}
                    opacity={isSelected || isBest ? 1 : 0.6} />
                  <text x={i * 30 + 15} y={112 - barHeight} textAnchor="middle" fill="#d4a843" fontSize="6">
                    {lap.time.toFixed(1)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="flex justify-between text-xs text-amber-500 mt-1">
          <span>LAP 1</span>
          <span>LAP {laps.length}</span>
        </div>
      </div>

      {/* Selected Lap Detail */}
      {deltaToBest && (
        <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
          <h3 className="text-amber-300 text-sm font-bold mb-3">
            LAP {selectedLap + 1} DETAIL
            <span className="text-amber-500 text-xs ml-2">
              ({TIRE_COMPOUNDS[laps[selectedLap]?.tireCompound]?.emoji || ''} {laps[selectedLap]?.tireCompound})
            </span>
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'TOTAL', value: laps[selectedLap]?.time, delta: deltaToBest.total },
              { label: 'SECTOR 1', value: laps[selectedLap]?.s1, delta: deltaToBest.s1 },
              { label: 'SECTOR 2', value: laps[selectedLap]?.s2, delta: deltaToBest.s2 },
              { label: 'SECTOR 3', value: laps[selectedLap]?.s3, delta: deltaToBest.s3 },
            ].map(s => (
              <div key={s.label} className="text-center">
                <span className="text-amber-500 text-xs">{s.label}</span>
                <p className="text-amber-100 font-bold">{s.value?.toFixed(3)}s</p>
                <p className={`text-xs ${s.delta < 0 ? 'text-green-400' : s.delta > 0 ? 'text-red-400' : 'text-amber-400'}`}>
                  {s.delta > 0 ? '+' : ''}{s.delta.toFixed(3)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tire Degradation */}
      <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
        <h3 className="text-amber-300 text-sm font-bold mb-3">TIRE DEGRADATION CURVE</h3>
        <div className="h-24">
          <svg viewBox={`0 0 ${Math.max(1, laps.length * 30)} 90`} className="w-full h-full" preserveAspectRatio="none">
            {laps.length > 1 && (
              <polyline
                fill="none" stroke="#ef4444" strokeWidth="2"
                points={laps.map((l, i) => `${i * 30 + 15},${85 - (l.tireWear / 100) * 80}`).join(' ')}
              />
            )}
            <text x="5" y="10" fill="#d4a843" fontSize="7">100%</text>
            <text x="5" y="85" fill="#d4a843" fontSize="7">0%</text>
          </svg>
        </div>
        <div className="flex justify-between text-xs text-amber-500 mt-1">
          <span>Wear %</span>
          <span>{laps[selectedLap]?.tireWear?.toFixed(1)}% on lap {selectedLap + 1}</span>
        </div>
      </div>
    </div>
  );
};
