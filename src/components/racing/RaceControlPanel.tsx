// ============================================================================
// RACE ENGINEERING SUITE — RACE CONTROL PANEL
// ============================================================================
// Displays race flags, safety car status, DRS zones, incident reports,
// and timing tower with real-time position tracking.
// ============================================================================

import React from 'react';
import { RaceControlSystem, FlagColor, RaceIncident } from '../../sim/racing/raceControlSystem';

interface RaceControlPanelProps {
  raceControl: RaceControlSystem;
  currentLap: number;
  totalLaps: number;
}

const FLAG_COLORS: Record<FlagColor, { bg: string; text: string; label: string; icon: string }> = {
  green: { bg: 'bg-green-500', text: 'text-green-100', label: 'GREEN FLAG', icon: '\🟢' },
  yellow: { bg: 'bg-yellow-400', text: 'text-yellow-900', label: 'YELLOW FLAG', icon: '\🟡' },
  double_yellow: { bg: 'bg-yellow-400', text: 'text-yellow-900', label: 'DOUBLE YELLOW', icon: '\🟡\🟡' },
  red: { bg: 'bg-red-600', text: 'text-red-100', label: 'RED FLAG', icon: '\🔴' },
  chequered: { bg: 'bg-black', text: 'text-white', label: 'CHEQUERED FLAG', icon: '\🏁' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-100', label: 'BLUE FLAG', icon: '\🔵' },
  white: { bg: 'bg-white', text: 'text-black', label: 'WHITE FLAG', icon: '\u26AA' },
  black: { bg: 'bg-gray-900', text: 'text-white', label: 'BLACK FLAG', icon: '\u26AB' },
  black_orange: { bg: 'bg-orange-600', text: 'text-orange-100', label: 'BLACK-ORANGE', icon: '\🟠' },
};

export const RaceControlPanel: React.FC<RaceControlPanelProps> = ({
  raceControl, currentLap, totalLaps,
}) => {
  const state = raceControl.getState();
  const flag = raceControl.getFlagForZone(0);
  const flagInfo = FLAG_COLORS[flag];
  const incidents = raceControl.getIncidents();
  const safetyCar = raceControl.getSafetyCar();

  return (
    <div className="space-y-4">
      {/* Current Flag */}
      <div className={`${flagInfo.bg} rounded-2xl p-4 shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{flagInfo.icon}</span>
            <div>
              <h3 className={`${flagInfo.text} text-lg font-bold`}>{flagInfo.label}</h3>
              <p className={`${flagInfo.text} text-xs opacity-80`}>Lap {currentLap}/{totalLaps}</p>
            </div>
          </div>
          <div className={`${flagInfo.text} text-4xl font-bold`}>{currentLap}</div>
        </div>
      </div>

      {/* Race Status */}
      <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
        <h3 className="text-amber-300 text-sm font-bold mb-3">RACE STATUS</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <span className="text-amber-500 text-xs">STATUS</span>
            <p className={`text-sm font-bold capitalize ${
              state.status === 'racing' ? 'text-green-400' :
              state.status === 'safety_car' ? 'text-yellow-400' :
              state.status === 'red_flag' ? 'text-red-400' :
              'text-amber-100'
            }`}>{state.status.replace('_', ' ')}</p>
          </div>
          <div className="text-center">
            <span className="text-amber-500 text-xs">DRS</span>
            <p className={`text-sm font-bold ${state.drsEnabled ? 'text-green-400' : 'text-red-400'}`}>
              {state.drsEnabled ? 'ENABLED' : 'DISABLED'}
            </p>
          </div>
        </div>
      </div>

      {/* Safety Car */}
      {safetyCar && (
        <div className="bg-yellow-500/20 rounded-2xl p-4 border border-yellow-500/40">
          <h3 className="text-yellow-400 text-sm font-bold mb-2">\🚨 SAFETY CAR DEPLOYED</h3>
          <div className="text-xs text-yellow-300 space-y-1">
            <p>Type: {safetyCar.type.replace('_', ' ').toUpperCase()}</p>
            <p>Deployed: Lap {safetyCar.startLap}</p>
            <p>Pit this lap: {safetyCar.endLap}</p>
            <p>Reason: {safetyCar.reason}</p>
          </div>
        </div>
      )}

      {/* DRS Zones */}
      {state.drsZones.length > 0 && (
        <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
          <h3 className="text-amber-300 text-sm font-bold mb-3">DRS ZONES</h3>
          <div className="space-y-2">
            {state.drsZones.map(zone => (
              <div key={zone.id} className="flex justify-between items-center">
                <span className="text-amber-200 text-sm">{zone.id}</span>
                <span className={`text-xs font-bold ${zone.active ? 'text-green-400' : 'text-red-400'}`}>
                  {zone.active ? '\u2714 ACTIVE' : '\u2716 INACTIVE'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Incidents */}
      <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
        <h3 className="text-amber-300 text-sm font-bold mb-3">INCIDENTS ({incidents.length})</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {incidents.length === 0 ? (
            <p className="text-amber-400/50 text-sm text-center py-4">No incidents reported</p>
          ) : (
            incidents.map(inc => (
              <div key={inc.id} className={`p-2 rounded-xl text-xs ${
                inc.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                inc.severity === 'major' ? 'bg-orange-500/15 text-orange-300' :
                'bg-amber-950/30 text-amber-200'
              }`}>
                <div className="flex justify-between">
                  <span className="font-bold">{inc.type.replace('_', ' ').toUpperCase()}</span>
                  <span className="text-amber-500">Lap {inc.lap}</span>
                </div>
                <p className="mt-0.5">{inc.description}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Flag History */}
      <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
        <h3 className="text-amber-300 text-sm font-bold mb-3">FLAG HISTORY</h3>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {state.flags.slice(-10).reverse().map((f, i) => {
            const info = FLAG_COLORS[f.color];
            return (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className={`w-3 h-3 rounded ${info.bg}`} />
                <span className="text-amber-200">{info.label}</span>
                <span className="text-amber-500 ml-auto">{f.reason}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
