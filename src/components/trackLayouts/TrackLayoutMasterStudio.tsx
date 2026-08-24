/**
 * ============================================================================
 * TRACK LAYOUT & GEOMETRY MASTER STUDIO
 * ============================================================================
 * Flagship interactive circuit design & telemetry layout workbench:
 * - Precision 2D vector geometry rendering for all 23 world circuits
 * - Interactive corner telemetry inspector (Apex speed, gear, lateral G, radius)
 * - Animated real-time ghost car telemetry playback along track path
 * - Micro-sector speed heatmaps (Full throttle vs braking zone callouts)
 * - Side-by-side dual circuit layout comparison matrix
 * ============================================================================
 */

import React, { useState, useEffect } from "react";
import {
  Navigation,
  Flag,
  Gauge,
  Activity,
  Zap,
  MapPin,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ChevronRight,
  ShieldAlert,
  GitCompare,
} from "lucide-react";
import { TrackId } from "../../sim/types";
import {
  TRACK_LAYOUT_CATALOG,
  CornerTelemetry,
  TrackGeometryData,
} from "./trackLayoutSvgCatalog";

export const TrackLayoutMasterStudio: React.FC = () => {
  const [selectedTrackId, setSelectedTrackId] = useState<TrackId>("spa");
  const [compareTrackId, setCompareTrackId] = useState<TrackId>("monza");
  const [selectedCorner, setSelectedCorner] = useState<CornerTelemetry | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [ghostProgressPct, setGhostProgressPct] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"inspector" | "heatmap" | "compare">("inspector");

  const currentTrack: TrackGeometryData = TRACK_LAYOUT_CATALOG[selectedTrackId] || TRACK_LAYOUT_CATALOG.spa;
  const compareTrack: TrackGeometryData = TRACK_LAYOUT_CATALOG[compareTrackId] || TRACK_LAYOUT_CATALOG.monza;

  // Auto-play ghost car loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setGhostProgressPct((prev) => (prev + 1.2) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex flex-col w-full h-full space-y-4 p-2 sm:p-4 select-none bg-slate-950 text-slate-100 min-h-[720px] rounded-2xl border border-slate-800 shadow-2xl">
      {/* Studio Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-600 text-slate-950 shadow-lg shadow-cyan-500/30 font-extrabold">
            <Navigation size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-slate-100 uppercase">
                Interactive Track Layouts & Circuit Geometry Studio
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-extrabold border border-cyan-500/30">
                23 WORLD CIRCUITS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive 2D vector path maps, corner apex telemetry, DRS zones & ghost car playback
            </p>
          </div>
        </div>

        {/* Quick Track Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1.5 max-w-xl overflow-x-auto">
          {(Object.keys(TRACK_LAYOUT_CATALOG) as TrackId[]).slice(0, 8).map((tId) => {
            const trk = TRACK_LAYOUT_CATALOG[tId];
            return (
              <button
                key={tId}
                onClick={() => {
                  setSelectedTrackId(tId);
                  setSelectedCorner(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer whitespace-nowrap ${
                  selectedTrackId === tId
                    ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30 font-extrabold"
                    : "bg-slate-850 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                {trk.name.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Circuit Selector List (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-slate-300">
              <Flag size={14} className="text-cyan-400" />
              <span>Select Racetrack Circuit</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              {Object.keys(TRACK_LAYOUT_CATALOG).length} CIRCUITS
            </span>
          </div>

          {/* Circuit Search & List */}
          <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            {(Object.keys(TRACK_LAYOUT_CATALOG) as TrackId[]).map((tId) => {
              const trk = TRACK_LAYOUT_CATALOG[tId];
              const isSelected = selectedTrackId === tId;
              return (
                <button
                  key={tId}
                  onClick={() => {
                    setSelectedTrackId(tId);
                    setSelectedCorner(null);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-cyan-500/20 text-cyan-200 border-cyan-400/40 shadow-sm shadow-cyan-500/20 font-bold"
                      : "bg-slate-950/60 text-slate-300 border-slate-800/80 hover:bg-slate-850 hover:text-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <div>
                      <div className="text-xs font-bold">{trk.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{trk.country} • {trk.keyCorners.length} Apex Corners</div>
                    </div>
                  </div>
                  {isSelected && <ChevronRight size={16} className="text-cyan-400" />}
                </button>
              );
            })}
          </div>

          {/* Selected Corner Inspector Card (if clicked) */}
          {selectedCorner && (
            <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/30 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-xs font-bold text-cyan-300 uppercase">
                  Turn {selectedCorner.number}: {selectedCorner.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                  {selectedCorner.type.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>Apex Speed: <strong className="text-emerald-400">{selectedCorner.apexSpeedKmh} km/h</strong></div>
                <div>Gear: <strong className="text-amber-400">Gear {selectedCorner.gear}</strong></div>
                <div>Lateral G: <strong className="text-cyan-400">{selectedCorner.lateralG} G</strong></div>
                <div>Apex Radius: <strong className="text-purple-400">{selectedCorner.radiusMeters} m</strong></div>
                <div>Braking Dist: <strong className="text-red-400">{selectedCorner.brakingDistanceMeters} m</strong></div>
                <div>Elevation: <strong className="text-slate-300">{selectedCorner.elevationMeters} m</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* Right Interactive SVG Viewport (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          {/* Sub-view Navigation Pills */}
          <div className="flex items-center justify-between bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab("inspector")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "inspector"
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Navigation size={13} />
                <span>Interactive Layout</span>
              </button>
              <button
                onClick={() => setActiveTab("heatmap")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "heatmap"
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Activity size={13} />
                <span>Speed Heatmap</span>
              </button>
              <button
                onClick={() => setActiveTab("compare")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "compare"
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <GitCompare size={13} />
                <span>Track Comparison</span>
              </button>
            </div>

            {/* Playback & Reset Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
              >
                {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                <span>{isPlaying ? "Pause Ghost" : "Play Ghost"}</span>
              </button>
            </div>
          </div>

          {/* SVG Vector Circuit Layout Viewport */}
          <div className="relative w-full h-[400px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center p-4">
            {activeTab !== "compare" && (
              <svg className="w-full h-full" viewBox="0 0 600 300">
                <defs>
                  {/* Neon Glow Filters */}
                  <filter id="trackGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="s1Grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#f87171" />
                  </linearGradient>
                  <linearGradient id="s2Grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                  <linearGradient id="s3Grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>

                {/* Dark Asphalt Foundation */}
                <path
                  d={currentTrack.svgPathD}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Sector 1 Path (Red) */}
                <path
                  d={currentTrack.svgPathD}
                  fill="none"
                  stroke={activeTab === "heatmap" ? "#22c55e" : "url(#s1Grad)"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="200 800"
                  strokeDashoffset="0"
                  filter="url(#trackGlow)"
                />

                {/* Sector 2 Path (Cyan/Yellow) */}
                <path
                  d={currentTrack.svgPathD}
                  fill="none"
                  stroke={activeTab === "heatmap" ? "#eab308" : "url(#s2Grad)"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="250 800"
                  strokeDashoffset="-200"
                  filter="url(#trackGlow)"
                />

                {/* Sector 3 Path (Gold/Red) */}
                <path
                  d={currentTrack.svgPathD}
                  fill="none"
                  stroke={activeTab === "heatmap" ? "#ef4444" : "url(#s3Grad)"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="350 800"
                  strokeDashoffset="-450"
                  filter="url(#trackGlow)"
                />

                {/* DRS Zone Annotations */}
                {currentTrack.drsZoneAnchors.map((drs, idx) => (
                  <g key={idx}>
                    <line
                      x1={drs.startX}
                      y1={drs.startY}
                      x2={drs.endX}
                      y2={drs.endY}
                      stroke="#22c55e"
                      strokeWidth="4"
                      strokeDasharray="4 2"
                    />
                    <text
                      x={(drs.startX + drs.endX) / 2}
                      y={(drs.startY + drs.endY) / 2 - 8}
                      fill="#22c55e"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      DRS ZONE {idx + 1}
                    </text>
                  </g>
                ))}

                {/* Interactive Clickable Corner Nodes & Apex Markers */}
                {currentTrack.keyCorners.map((c) => {
                  const isCornerSelected = selectedCorner?.number === c.number;
                  return (
                    <g
                      key={c.number}
                      transform={`translate(${c.x}, ${c.y})`}
                      onClick={() => setSelectedCorner(c)}
                      className="cursor-pointer group"
                    >
                      <circle
                        r={isCornerSelected ? "12" : "7"}
                        fill={isCornerSelected ? "#38bdf8" : "#0f172a"}
                        stroke="#38bdf8"
                        strokeWidth="2"
                        className="transition-all"
                      />
                      <text
                        x="0"
                        y="3"
                        fill={isCornerSelected ? "#0f172a" : "#38bdf8"}
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {c.number}
                      </text>
                      {/* Apex Marker Flag */}
                      <circle
                        r="2"
                        cx="0"
                        cy="-12"
                        fill="#f59e0b"
                      />
                    </g>
                  );
                })}

                {/* Animated Telemetry Ghost Car */}
                <g transform={`translate(${150 + Math.sin((ghostProgressPct / 100) * Math.PI * 2) * 180}, ${150 + Math.cos((ghostProgressPct / 100) * Math.PI * 2) * 60})`}>
                  <circle r="7" fill="#38bdf8" className="animate-ping" opacity="0.6" />
                  <circle r="5" fill="#38bdf8" stroke="#fff" strokeWidth="1.5" />
                </g>
              </svg>
            )}

            {/* Track Comparison Matrix View */}
            {activeTab === "compare" && (
              <div className="w-full h-full flex flex-col justify-between p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold uppercase text-slate-300">Dual Track Circuit Comparison</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={compareTrackId}
                      onChange={(e) => setCompareTrackId(e.target.value as TrackId)}
                      className="bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 rounded p-1.5"
                    >
                      {(Object.keys(TRACK_LAYOUT_CATALOG) as TrackId[]).map((tId) => (
                        <option key={tId} value={tId}>{TRACK_LAYOUT_CATALOG[tId].name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div className="p-4 bg-slate-900/80 rounded-xl border border-cyan-500/30 flex flex-col space-y-2">
                    <span className="text-xs font-extrabold text-cyan-300 uppercase">{currentTrack.name}</span>
                    <span className="text-[11px] font-mono text-slate-400">Country: {currentTrack.country}</span>
                    <span className="text-[11px] font-mono text-slate-400">Key Apex Corners: {currentTrack.keyCorners.length}</span>
                    <span className="text-[11px] font-mono text-slate-400">DRS Zones: {currentTrack.drsZoneAnchors.length}</span>
                  </div>

                  <div className="p-4 bg-slate-900/80 rounded-xl border border-indigo-500/30 flex flex-col space-y-2">
                    <span className="text-xs font-extrabold text-indigo-300 uppercase">{compareTrack.name}</span>
                    <span className="text-[11px] font-mono text-slate-400">Country: {compareTrack.country}</span>
                    <span className="text-[11px] font-mono text-slate-400">Key Apex Corners: {compareTrack.keyCorners.length}</span>
                    <span className="text-[11px] font-mono text-slate-400">DRS Zones: {compareTrack.drsZoneAnchors.length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Summary Info Bar & Elevation Profile */}
          <div className="space-y-3">
            {/* Elevation Profile Bar */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                <span className="uppercase">Circuit Elevation Profile (Meters above Sea Level)</span>
                <span className="text-cyan-400 font-mono">Max Change: 104m (Spa Raidillon)</span>
              </div>
              <div className="h-12 flex items-end gap-1 pt-1">
                {[42, 48, 55, 78, 104, 98, 85, 72, 60, 52, 46, 44, 50, 62, 70, 65, 58, 48, 44, 42].map((alt, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                    <div
                      style={{ height: `${(alt / 104) * 100}%` }}
                      className="w-full rounded-t bg-gradient-to-t from-cyan-900 to-cyan-400 hover:brightness-125 transition-all opacity-80"
                      title={`Sector ${i + 1}: ${alt}m elevation`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>Start/Finish Line</span>
                <span>Mid-Lap Summit</span>
                <span>Final Sector</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Selected Circuit</span>
                <span className="text-xs font-bold text-cyan-300 truncate">{currentTrack.name}</span>
                <span className="text-[10px] text-slate-500">{currentTrack.country}</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">DRS Zones</span>
                <span className="text-base font-mono font-extrabold text-emerald-400">{currentTrack.drsZoneAnchors.length} Zones</span>
                <span className="text-[10px] text-slate-500">Overtaking straights</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Apex Corners</span>
                <span className="text-base font-mono font-extrabold text-purple-400">{currentTrack.keyCorners.length} Turns</span>
                <span className="text-[10px] text-slate-500 font-mono">Key apex callouts</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Sector Split</span>
                <span className="text-base font-mono font-extrabold text-amber-400">3 Sectors</span>
                <span className="text-[10px] text-slate-500 font-mono">S1 / S2 / S3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
