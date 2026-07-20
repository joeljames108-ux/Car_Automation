import { Activity, Gauge, TrendingUp, Map, Table } from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { Section, StatTile } from "./ui/Controls";
import { LineChart } from "./ui/LineChart";
import { TRACKS } from "../sim/constants";

export function SimulationDashboard() {
  const { sim } = useDesign();
  const sorted = [...sim.lapTimes].sort((a, b) => a.time - b.time);
  const fastest = sorted[0];
  const slowest = sorted[sorted.length - 1];

  const powerSeries = [
    { data: sim.powerCurve.map((p) => ({ x: p.rpm, y: p.power })), color: "#22d3ee", fill: true },
    { data: sim.powerCurve.map((p) => ({ x: p.rpm, y: p.torque })), color: "#f59e0b" },
  ];

  return (
    <div className="space-y-4 stagger">
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

        <Section title="Ratings" icon={<TrendingUp size={16} />}>
          <div className="grid grid-cols-2 gap-2">
            <StatTile label="Reliability" value={`${(sim.reliability * 100).toFixed(0)}%`} accent={sim.reliability > 0.85 ? "ok" : "warn"} />
            <StatTile label="Drivability" value={`${(sim.drivability * 100).toFixed(0)}%`} />
            <StatTile label="Safety" value={`${sim.safetyRating}/5`} accent="ok" />
            <StatTile label="Market" value={`${sim.marketRating}/5`} />
            <StatTile label="Comfort" value={`${(sim.comfortRating * 100).toFixed(0)}%`} />
            <StatTile label="Luxury" value={`${(sim.luxuryRating * 100).toFixed(0)}%`} />
            <StatTile label="Profit Margin" value={`${(sim.profitMargin * 100).toFixed(0)}%`} accent="ok" />
            <StatTile label="Target Price" value={`$${(sim.targetPrice / 1000).toFixed(0)}k`} />
          </div>
        </Section>
      </div>

      <Section title="Lap Times — All Circuits" icon={<Map size={16} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 stagger">
          <StatTile label="Fastest Lap" value={formatLap(fastest.time)} sub={fastest.trackName} accent="ok" />
          <StatTile label="Slowest Lap" value={formatLap(slowest.time)} sub={slowest.trackName} />
          <StatTile label="Spread" value={`${(slowest.time - fastest.time).toFixed(2)}s`} />
          <StatTile label="Tracks" value={sorted.length} />
        </div>
        <LineChart
          series={[{ data: sorted.map((l, idx) => ({ x: idx + 1, y: l.time })), color: "#22d3ee", fill: true }]}
          xLabel="Track Rank" yLabel="Lap Time" yUnit="s" height={180}
        />
      </Section>

      <Section title="Full Lap Time Table" icon={<Table size={16} />}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-base-800">
                <th className="text-left py-2 px-2 font-mono">#</th>
                <th className="text-left py-2 px-2">Track</th>
                <th className="text-right py-2 px-2 font-mono">Lap Time</th>
                <th className="text-right py-2 px-2 font-mono">Delta</th>
                <th className="text-right py-2 px-2 font-mono">Top Speed</th>
                <th className="text-right py-2 px-2 font-mono">Avg Speed</th>
                <th className="text-right py-2 px-2 font-mono">Length</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((lap, idx) => (
                <tr key={lap.trackId} className="border-b border-base-850 transition-colors duration-200 hover:bg-accent-500/5">
                  <td className="py-2 px-2 font-mono text-slate-500">{idx + 1}</td>
                  <td className="py-2 px-2 text-slate-200">{lap.trackName}</td>
                  <td className="py-2 px-2 font-mono text-right text-accent-300">{formatLap(lap.time)}</td>
                  <td className="py-2 px-2 font-mono text-right text-slate-500">{idx === 0 ? "—" : `+${(lap.time - fastest.time).toFixed(2)}`}</td>
                  <td className="py-2 px-2 font-mono text-right text-slate-400">{lap.topSpeed}</td>
                  <td className="py-2 px-2 font-mono text-right text-slate-400">{lap.avgSpeed}</td>
                  <td className="py-2 px-2 font-mono text-right text-slate-500">{TRACKS[lap.trackId].length.toFixed(2)}</td>
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
