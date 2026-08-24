// ============================================================================
// RACE ENGINEERING SUITE — WEATHER PANEL
// ============================================================================
// Detailed weather display with real-time conditions, rain radar visualization,
// wind direction compass, forecast timeline, and tire recommendation engine.
// ============================================================================

import React, { useMemo } from 'react';
import { RaceWeatherSystem, WeatherState, WeatherForecast } from '../../sim/weather/raceWeatherSystem';
import { TIRE_COMPOUNDS } from '../../sim/tires/pacejkaTireModel';

interface WeatherPanelProps {
  weather: RaceWeatherSystem;
  currentLap: number;
}

export const WeatherPanel: React.FC<WeatherPanelProps> = ({ weather, currentLap }) => {
  const state = weather.getState();
  const forecast = useMemo(() => weather.getForecast().slice(0, 30), [weather]);
  const recommendedTire = weather.getRecommendedTire();
  const isWet = weather.isWet();

  const windDir = (deg: number): string => {
    const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return dirs[Math.round(deg / 22.5) % 16];
  };

  const conditionIcon = (condition: string): string => {
    const icons: Record<string, string> = {
      clear: '\u2600\uFE0F', partly_cloudy: '\u26C5', overcast: '\u2601\uFE0F',
      light_rain: '\u{1F327}\uFE0F', heavy_rain: '\u{1F329}\uFE0F', storm: '\u26C8\uFE0F', fog: '\u{1F32B}\uFE0F',
    };
    return icons[condition] || '\u2601\uFE0F';
  };

  return (
    <div className="space-y-4">
      {/* Current Conditions */}
      <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-amber-300 text-sm font-bold">{'\u2601'} CURRENT CONDITIONS</h3>
          <span className="text-2xl">{conditionIcon(state.condition)}</span>
        </div>

        <div className="text-center mb-4">
          <p className="text-amber-100 text-2xl font-bold capitalize">{state.condition.replace('_', ' ')}</p>
          <p className="text-amber-400/70 text-sm">Lap {currentLap}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <span className="text-amber-500 text-xs">AIR</span>
            <p className="text-amber-100 text-xl font-bold">{Math.round(state.airTemperature)}\u00B0</p>
          </div>
          <div>
            <span className="text-amber-500 text-xs">TRACK</span>
            <p className="text-amber-100 text-xl font-bold">{Math.round(state.trackTemperature)}\u00B0</p>
          </div>
          <div>
            <span className="text-amber-500 text-xs">HUMIDITY</span>
            <p className="text-amber-100 text-xl font-bold">{Math.round(state.humidity)}%</p>
          </div>
        </div>
      </div>

      {/* Wind Compass */}
      <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
        <h3 className="text-amber-300 text-sm font-bold mb-3">WIND</h3>
        <div className="flex items-center justify-between">
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 80 80" className="w-full h-full">
              <circle cx="40" cy="40" r="35" fill="none" stroke="#3d2e18" strokeWidth="1" />
              <circle cx="40" cy="40" r="25" fill="none" stroke="#3d2e18" strokeWidth="0.5" />
              <text x="40" y="10" textAnchor="middle" fill="#d4a843" fontSize="8" fontWeight="bold">N</text>
              <text x="72" y="43" textAnchor="middle" fill="#d4a843" fontSize="7">E</text>
              <text x="40" y="76" textAnchor="middle" fill="#d4a843" fontSize="7">S</text>
              <text x="8" y="43" textAnchor="middle" fill="#d4a843" fontSize="7">W</text>
              {/* Wind arrow */}
              <line x1="40" y1="40"
                x2={40 + Math.sin(state.windDirection * Math.PI / 180) * 28}
                y2={40 - Math.cos(state.windDirection * Math.PI / 180) * 28}
                stroke="#d4a843" strokeWidth="2" />
              <circle cx="40" cy="40" r="3" fill="#d4a843" />
            </svg>
          </div>
          <div className="text-right">
            <p className="text-amber-100 text-2xl font-bold">{Math.round(state.windSpeed)}<span className="text-sm"> km/h</span></p>
            <p className="text-amber-400/70 text-sm">{windDir(state.windDirection)} ({Math.round(state.windDirection)}\u00B0)</p>
            <p className="text-amber-500 text-xs mt-1">Gusts: {Math.round(state.windGust)} km/h</p>
          </div>
        </div>
      </div>

      {/* Rain Radar */}
      <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
        <h3 className="text-amber-300 text-sm font-bold mb-3">RAIN PROBABILITY</h3>
        <div className="relative h-24">
          <svg viewBox="0 0 300 90" className="w-full h-full">
            {/* Grid */}
            {[0, 25, 50, 75, 100].map(v => (
              <g key={v}>
                <line x1="0" y1={90 - v * 0.85} x2="300" y2={90 - v * 0.85} stroke="#3d2e18" strokeWidth="0.5" />
                <text x="3" y={88 - v * 0.85} fill="#d4a843" fontSize="6">{v}%</text>
              </g>
            ))}
            {/* Forecast line */}
            {forecast.length > 1 && (
              <polyline
                fill="none" stroke="#3b82f6" strokeWidth="2"
                points={forecast.map((f, i) =>
                  `${(i / Math.max(1, forecast.length - 1)) * 290 + 5},${90 - f.state.rainProbability * 0.85}`
                ).join(' ')}
              />
            )}
            {/* Rain intensity fill */}
            {forecast.length > 1 && (
              <polyline
                fill="rgba(59, 130, 246, 0.1)" stroke="none"
                points={`5,90 ${forecast.map((f, i) =>
                  `${(i / Math.max(1, forecast.length - 1)) * 290 + 5},${90 - f.state.rainProbability * 0.85}`
                ).join(' ')} 295,90`}
              />
            )}
          </svg>
        </div>
        <div className="flex justify-between text-xs text-amber-500 mt-1">
          <span>NOW</span>
          <span>+30 min</span>
        </div>
        <div className="mt-2 text-center">
          <span className={`text-sm font-bold ${state.rainProbability > 60 ? 'text-blue-400' : state.rainProbability > 30 ? 'text-yellow-400' : 'text-green-400'}`}>
            {state.rainProbability > 60 ? '\u26A1 HIGH RAIN RISK' :
             state.rainProbability > 30 ? '\u26A0\uFE0F POSSIBLE RAIN' : '\u2714 DRY CONDITIONS'}
          </span>
        </div>
      </div>

      {/* Tire Recommendation */}
      <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
        <h3 className="text-amber-300 text-sm font-bold mb-3">TIRE RECOMMENDATION</h3>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
            style={{ backgroundColor: TIRE_COMPOUNDS[recommendedTire]?.color || '#888' }}>
            {TIRE_COMPOUNDS[recommendedTire]?.emoji || '?'}
          </div>
          <div>
            <p className="text-amber-100 font-bold">{TIRE_COMPOUNDS[recommendedTire]?.name || 'Unknown'}</p>
            <p className="text-amber-400/70 text-xs">
              {isWet ? 'Wet track conditions - prioritize grip' : `Track temp ${Math.round(state.trackTemperature)}\u00B0C - ${state.trackTemperature > 90 ? 'thermal management critical' : 'optimal window'}`}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2 mt-3">
          {Object.entries(TIRE_COMPOUNDS).map(([key, compound]) => (
            <div key={key} className={`text-center p-1 rounded-lg ${key === recommendedTire ? 'bg-amber-500/20 ring-1 ring-amber-500' : ''}`}>
              <div className="w-4 h-4 rounded-full mx-auto" style={{ backgroundColor: compound.color }} />
              <span className="text-xs text-amber-400/70 block mt-0.5">{key.charAt(0).toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Data */}
      <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
        <h3 className="text-amber-300 text-sm font-bold mb-3">ADDITIONAL DATA</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex justify-between"><span className="text-amber-500">Pressure</span><span className="text-amber-100">{Math.round(state.pressure)} hPa</span></div>
          <div className="flex justify-between"><span className="text-amber-500">Visibility</span><span className="text-amber-100">{Math.round(state.visibility)}m</span></div>
          <div className="flex justify-between"><span className="text-amber-500">Cloud Cover</span><span className="text-amber-100">{Math.round(state.cloudCover)}%</span></div>
          <div className="flex justify-between"><span className="text-amber-500">UV Index</span><span className="text-amber-100">{state.uvIndex}</span></div>
        </div>
      </div>
    </div>
  );
};
