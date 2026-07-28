import { useState } from "react";
import { Activity, Gauge, TrendingUp, Map, Table, MapPin } from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { Section, StatTile } from "./ui/Controls";
import { LineChart } from "./ui/LineChart";
import { TRACKS } from "../sim/constants";
import { TrackDiagramModal } from "./TrackDiagramModal";
import type { TrackId } from "../sim/types";

export function SimulationDashboard() {
  const { design, sim } = useDesign();
  const [selectedTrack, setSelectedTrack] = useState<TrackId | null>(null);

  const sorted = [...sim.lapTimes].sort((a, b) => a.time - b.time);
  const fastest = sorted[0];
  const slowest = sorted[sorted.length - 1];

  const powerSeries = [
    { data: sim.powerCurve.map((p) => ({ x: p.rpm, y: p.power })), color: "#22d3ee", fill: true },
    { data: sim.powerCurve.map((p) => ({ x: p.rpm, y: p.torque })), color: "#f59e0b" },
  ];

  return (
    <div className="space-y-4 stagger">
      <TrackDiagramModal
        trackId={selectedTrack}
        design={design}
        sim={sim}
        onClose={() => setSelectedTrack(null)}
      />

      <Section title="Performance Summary" icon={<Gauge size={16} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 stagger">
          <StatTile label="Power" value={sim.peakPower} unit="hp" accent="accent" />
          <StatTile label="Torque" value={sim.peakTorque} unit="Nm" accent="accent" />
          <StatTile label="Weight" value={sim.weight} unit="kg" />
          <StatTile label="Top Speed" value={sim.topSpeed} unit="km/h" accent="accent" />
          <StatTile label="0-60 mph" value={sim.accel0_60} unit="s" accent="ok" />
          <StatTile label="0-100 km/h" value={sim.accel0_100} unit="s" />
          <StatTile label="0-200 km/h" value={(sim.accel0_100 + sim.accel100_200).toFixed(2)} unit="s" />
          <StatTile label="Quarter Mile" value={sim.quarterMile} unit="s" sub={`${sim.quarterMileSpeed} km/h`} />
          <StatTile label="Braking 100-0" value={sim.brakingDist} unit="m" />
          <StatTile label="Lateral G" value={sim.lateralG} unit="g" accent="accent" />
          <StatTile label="Power/Weight" value={(sim.peakPower / (sim.weight / 1000)).toFixed(0)} unit="hp/t" accent="accent" />
          <StatTile label="Cost" value={`$${(sim.totalCost / 1000).toFixed(0)}k`} accent="accent" />
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger">
        <Section title="Power & Torque Curve" icon={<Activity size={16} />}>
          <LineChart series={powerSeries} xLabel="RPM" yLabel="hp / Nm" height={220} />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span className="flex items-center gap-1"><span className="h-2 w-3 bg-accent-400 rounded-sm" />Power</span>
            <span className="flex items-center gap-1"><span className="h-2 w-3 bg-warn-500 rounded-sm" />Torque</span>
          </div>
        </Section>

        <Section title="Circuit Comparison" icon={<Map size={16} />}>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-400 border-b border-base-800 pb-1">
              <span>Fastest: <strong className="text-accent-400">{fastest?.trackName}</strong> ({formatLap(fastest?.time || 0)})</span>
              <span>Slowest: <strong className="text-slate-300">{slowest?.trackName}</strong> ({formatLap(slowest?.time || 0)})</span>
            </div>
            <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
              {sorted.map((lap) => {
                const ratio = fastest.time / lap.time;
                return (
                  <div
                    key={lap.trackId}
                    onClick={() => setSelectedTrack(lap.trackId)}
                    className="flex items-center gap-2 group cursor-pointer hover:bg-accent-500/10 p-1 rounded-lg transition-colors"
                  >
                    <span className="w-24 truncate text-slate-300 group-hover:text-accent-300 transition-colors flex items-center gap-1">
                      <MapPin size={10} className="text-accent-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {lap.trackName}
                    </span>
                    <div className="flex-1 bg-base-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-accent-500 h-full rounded-full transition-all duration-300" style={{ width: `${ratio * 100}%` }} />
                    </div>
                    <span className="font-mono text-slate-400 w-16 text-right">{formatLap(lap.time)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>
      </div>

      <Section title="Full Lap Time Table (Click track for Sector Diagram & Visual Layout)" icon={<Table size={16} />}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-base-800">
                <th className="text-left py-2 px-2 font-mono">#</th>
                <th className="text-left py-2 px-2">Track (Click for Map)</th>
                <th className="text-right py-2 px-2 font-mono">Lap Time</th>
                <th className="text-right py-2 px-2 font-mono">Delta</th>
                <th className="text-right py-2 px-2 font-mono">Top Speed</th>
                <th className="text-right py-2 px-2 font-mono">Avg Speed</th>
                <th className="text-right py-2 px-2 font-mono">Length</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((lap, idx) => (
                <tr
                  key={lap.trackId}
                  onClick={() => setSelectedTrack(lap.trackId)}
                  className="border-b border-base-850 transition-colors duration-200 hover:bg-accent-500/15 cursor-pointer group"
                >
                  <td className="py-2 px-2 font-mono text-slate-500">{idx + 1}</td>
                  <td className="py-2 px-2 text-slate-200 group-hover:text-accent-300 font-medium flex items-center gap-1.5">
                    <MapPin size={12} className="text-accent-400" />
                    {lap.trackName}
                  </td>
                  <td className="py-2 px-2 font-mono text-right text-accent-300 font-bold">{formatLap(lap.time)}</td>
                  <td className="py-2 px-2 font-mono text-right text-slate-500">{idx === 0 ? "—" : `+${(lap.time - fastest.time).toFixed(2)}`}</td>
                  <td className="py-2 px-2 font-mono text-right text-slate-400">{lap.topSpeed} km/h</td>
                  <td className="py-2 px-2 font-mono text-right text-slate-400">{lap.avgSpeed} km/h</td>
                  <td className="py-2 px-2 font-mono text-right text-slate-500">{TRACKS[lap.trackId].length.toFixed(2)} km</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function formatLap(seconds: number): string {
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toFixed(3).padStart(6, "0")}`;
  }
  return `${seconds.toFixed(3)}s`;
}
