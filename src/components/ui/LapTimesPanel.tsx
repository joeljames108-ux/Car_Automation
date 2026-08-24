import React, { useState } from "react";
import { Map, MapPin, Table } from "lucide-react";
import { Section } from "./Controls";
import { TRACKS } from "../../sim/constants";
import { TrackDiagramModal } from "../TrackDiagramModal";
import { formatLap } from "../../sim/utils/formatLap";
import type { TrackId, VehicleDesign, SimResult } from "../../sim/types";

export interface LapTimeItem {
  trackId: TrackId;
  trackName: string;
  time: number;
  topSpeed: number;
  avgSpeed: number;
}

export interface LapTimesPanelProps {
  lapTimes: LapTimeItem[];
  design?: VehicleDesign;
  sim?: SimResult;
  mode?: "split" | "bars_only" | "table_only" | "full";
  className?: string;
}

export const LapTimesPanel: React.FC<LapTimesPanelProps> = ({
  lapTimes,
  design,
  sim,
  mode = "full",
  className = "",
}) => {
  const [selectedTrack, setSelectedTrack] = useState<TrackId | null>(null);

  const sorted = [...(lapTimes || [])].sort((a, b) => a.time - b.time);
  const fastest = sorted[0];
  const slowest = sorted[sorted.length - 1];

  const handleTrackClick = (trackId: TrackId) => {
    if (design && sim) {
      setSelectedTrack(trackId);
    }
  };

  const renderBars = () => (
    <Section title="Circuit Comparison" icon={<Map size={16} />}>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between text-slate-400 border-b border-base-800 pb-1">
          <span>
            Fastest: <strong className="text-accent-400">{fastest?.trackName}</strong> ({formatLap(fastest?.time)})
          </span>
          <span>
            Slowest: <strong className="text-slate-300">{slowest?.trackName}</strong> ({formatLap(slowest?.time)})
          </span>
        </div>
        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
          {sorted.map((lap) => {
            const ratio = fastest ? fastest.time / lap.time : 1;
            return (
              <div
                key={lap.trackId}
                onClick={() => handleTrackClick(lap.trackId)}
                className={`flex items-center gap-2 group p-1 rounded-lg transition-colors ${
                  design && sim ? "cursor-pointer hover:bg-accent-500/10" : ""
                }`}
              >
                <span className="w-24 truncate text-slate-300 group-hover:text-accent-300 transition-colors flex items-center gap-1">
                  <MapPin size={10} className="text-accent-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {lap.trackName}
                </span>
                <div className="flex-1 bg-base-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-accent-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(10, ratio * 100))}%` }}
                  />
                </div>
                <span className="font-mono text-slate-400 w-16 text-right">{formatLap(lap.time)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );

  const renderTable = () => (
    <Section
      title={design && sim ? "Full Lap Time Table (Click track for Sector Diagram & Visual Layout)" : "Full Lap Time Table"}
      icon={<Table size={16} />}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-base-800">
              <th className="text-left py-2 px-2 font-mono">#</th>
              <th className="text-left py-2 px-2">Track {design && sim ? "(Click for Map)" : ""}</th>
              <th className="text-right py-2 px-2 font-mono">Lap Time</th>
              <th className="text-right py-2 px-2 font-mono">Delta</th>
              <th className="text-right py-2 px-2 font-mono">Top Speed</th>
              <th className="text-right py-2 px-2 font-mono">Avg Speed</th>
              <th className="text-right py-2 px-2 font-mono">Length</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((lap, idx) => {
              const trackInfo = TRACKS[lap.trackId as TrackId];
              return (
                <tr
                  key={lap.trackId}
                  onClick={() => handleTrackClick(lap.trackId)}
                  className={`border-b border-base-850 transition-colors duration-200 ${
                    design && sim ? "hover:bg-accent-500/15 cursor-pointer group" : ""
                  }`}
                >
                  <td className="py-2 px-2 font-mono text-slate-500">{idx + 1}</td>
                  <td className="py-2 px-2 text-slate-200 group-hover:text-accent-300 font-medium flex items-center gap-1.5">
                    <MapPin size={12} className="text-accent-400" />
                    {lap.trackName}
                  </td>
                  <td className="py-2 px-2 font-mono text-right text-accent-300 font-bold">{formatLap(lap.time)}</td>
                  <td className="py-2 px-2 font-mono text-right text-slate-500">
                    {idx === 0 ? "—" : `+${(lap.time - (fastest?.time || 0)).toFixed(2)}`}
                  </td>
                  <td className="py-2 px-2 font-mono text-right text-slate-400">{lap.topSpeed} km/h</td>
                  <td className="py-2 px-2 font-mono text-right text-slate-400">{lap.avgSpeed} km/h</td>
                  <td className="py-2 px-2 font-mono text-right text-slate-500">
                    {trackInfo?.length ? `${trackInfo.length.toFixed(2)} km` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Section>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {design && sim && (
        <TrackDiagramModal
          trackId={selectedTrack}
          design={design}
          sim={sim}
          onClose={() => setSelectedTrack(null)}
        />
      )}

      {mode === "bars_only" && renderBars()}
      {mode === "table_only" && renderTable()}
      {mode === "split" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {renderBars()}
          {renderTable()}
        </div>
      )}
      {mode === "full" && (
        <>
          {renderBars()}
          {renderTable()}
        </>
      )}
    </div>
  );
};
