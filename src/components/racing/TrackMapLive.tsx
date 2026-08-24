// ============================================================================
// RACE ENGINEERING SUITE — LIVE TRACK MAP
// ============================================================================
// Interactive SVG track map showing real-time car positions, sector splits,
// DRS zones, incident markers, and safety car visualization.
// ============================================================================

import React, { useMemo } from 'react';
import { CIRCUIT_DATABASE, TrackLayout } from '../../sim/track/circuitDatabase';

interface TrackMapLiveProps {
  trackId: string;
  carPositions: { distance: number; label: string; color: string }[];
  currentLap: number;
  sectorHighlights?: number;
  safetyCarActive?: boolean;
  incidents?: { distance: number; severity: string }[];
}

// Generate SVG path from circuit corners
function generateTrackPath(track: TrackLayout): string {
  const w = 400, h = 250;
  const cx = w / 2, cy = h / 2;
  const scale = Math.min(w, h) / (track.length * 0.55);
  const points: [number, number][] = [];

  let angle = 0;
  let x = cx - track.length * scale * 0.4;
  let y = cy;

  points.push([x, y]);

  const angleStep = (Math.PI * 2) / track.corners.length;
  for (let i = 0; i < track.corners.length; i++) {
    const corner = track.corners[i];
    const dist = (track.length / track.corners.length) * scale;
    angle += angleStep * (0.8 + Math.random() * 0.4);
    const turnFactor = corner.type === 'hairpin' ? 0.5 : corner.type === 'chicane' ? 0.7 : 1.0;
    x += Math.cos(angle) * dist * turnFactor;
    y += Math.sin(angle) * dist * turnFactor;
    x = Math.max(30, Math.min(w - 30, x));
    y = Math.max(20, Math.min(h - 20, y));
    points.push([x, y]);
  }
  points.push([points[0][0], points[0][1]]);

  if (points.length < 3) return '';

  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    const cpx = curr[0];
    const cpy = curr[1];
    const epx = (curr[0] + next[0]) / 2;
    const epy = (curr[1] + next[1]) / 2;
    d += ` Q ${cpx} ${cpy} ${epx} ${epy}`;
  }
  d += ' Z';
  return d;
}

export const TrackMapLive: React.FC<TrackMapLiveProps> = ({
  trackId, carPositions, currentLap, safetyCarActive = false, incidents = [],
}) => {
  const track = CIRCUIT_DATABASE[trackId];
  if (!track) return <div className="text-amber-500 text-sm">Track not found</div>;

  const trackPath = useMemo(() => generateTrackPath(track), [track]);
  const w = 400, h = 250;

  const getPointOnTrack = (distance: number): [number, number] => {
    const progress = (distance % track.length) / track.length;
    const angle = progress * Math.PI * 2 - Math.PI / 2;
    const rx = w * 0.35, ry = h * 0.35;
    return [w / 2 + Math.cos(angle) * rx, h / 2 + Math.sin(angle) * ry];
  };

  return (
    <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-amber-300 text-sm font-bold">{'\u2316'} TRACK MAP — {track.name.toUpperCase()}</h3>
        {safetyCarActive && <span className="text-yellow-400 text-xs font-bold animate-pulse">{'\u26A0'} SAFETY CAR</span>}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: '250px' }}>
        {/* Track surface */}
        <path d={trackPath} fill="none" stroke="#3d2e18" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
        <path d={trackPath} fill="none" stroke="#2a1f10" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />

        {/* Sector boundaries */}
        {[0.33, 0.66].map((frac, i) => {
          const pos = getPointOnTrack(track.length * frac);
          return <circle key={i} cx={pos[0]} cy={pos[1]} r="3" fill="#d4a843" opacity="0.6" />;
        })}

        {/* DRS zones */}
        {track.drsZones.map(zone => {
          const startPos = getPointOnTrack(zone.activationLineDistance * 1000);
          const endPos = getPointOnTrack(zone.deactivationLineDistance * 1000);
          return (
            <line key={zone.id} x1={startPos[0]} y1={startPos[1]} x2={endPos[0]} y2={endPos[1]}
              stroke="#22c55e" strokeWidth="4" opacity="0.4" strokeDasharray="4 2" />
          );
        })}

        {/* Corner markers */}
        {track.corners.slice(0, 8).map((corner, i) => {
          const pos = getPointOnTrack(track.length * (i / track.corners.length));
          return (
            <g key={i}>
              <circle cx={pos[0]} cy={pos[1]} r="2" fill={
                corner.type === 'hairpin' || corner.type === 'slow' ? '#ef4444' :
                corner.type === 'very_fast' ? '#22c55e' : '#facc15'
              } />
            </g>
          );
        })}

        {/* Incident markers */}
        {incidents.map((inc, i) => {
          const pos = getPointOnTrack(inc.distance);
          return (
            <g key={i}>
              <circle cx={pos[0]} cy={pos[1]} r="6" fill={inc.severity === 'critical' ? '#ef4444' : '#f59e0b'} opacity="0.7" />
              <text x={pos[0]} y={pos[1] + 3} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">!</text>
            </g>
          );
        })}

        {/* Car positions */}
        {carPositions.map((car, i) => {
          const pos = getPointOnTrack(car.distance);
          return (
            <g key={i}>
              <circle cx={pos[0]} cy={pos[1]} r="5" fill={car.color} stroke="white" strokeWidth="1.5" />
              <text x={pos[0]} y={pos[1] + 10} textAnchor="middle" fill="#d4a843" fontSize="7" fontWeight="bold">
                {car.label}
              </text>
            </g>
          );
        })}

        {/* Start/Finish */}
        {(() => {
          const sfPos = getPointOnTrack(0);
          return (
            <g>
              <rect x={sfPos[0] - 8} y={sfPos[1] - 2} width="16" height="4" fill="#d4a843" rx="1" />
              <text x={sfPos[0]} y={sfPos[1] - 8} textAnchor="middle" fill="#d4a843" fontSize="7" fontWeight="bold">S/F</text>
            </g>
          );
        })()}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 text-xs">
        <span className="text-amber-500">{'\u25CF'} Slow</span>
        <span className="text-yellow-400">{'\u25CF'} Medium</span>
        <span className="text-green-400">{'\u25CF'} Fast</span>
        <span className="text-green-500">{'\u2500\u2500'} DRS Zone</span>
        <span className="text-amber-400">{'\u2500'} Sector Split</span>
      </div>
    </div>
  );
};
