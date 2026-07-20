import { useState, useMemo } from "react";
import { Flag, Timer, CloudRain, Users, Gauge, TrendingUp, Loader2, Trophy, AlertTriangle, Wrench, Fuel, Battery, Thermometer, Lightbulb, Disc, Zap } from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { Section, Slider, Select, ChoiceGrid, StatTile } from "./ui/Controls";
import { LineChart } from "./ui/LineChart";
import { TRACKS, DRIVER_SKILLS, WEATHER_TYPES, HYBRID_DEPLOY_MODES } from "../sim/constants";
import { simulateRace, defaultRaceConfig } from "../sim/race";
import type { RaceConfig, RaceResult, TrackId, WeatherType, DriverSkill, RaceType, StrategySuggestion } from "../sim/types";

const RACE_TYPES: Record<RaceType, { label: string; laps: number }> = {
  sprint: { label: "Sprint", laps: 10 },
  feature: { label: "Feature", laps: 30 },
  endurance: { label: "Endurance", laps: 100 },
  timed: { label: "Timed", laps: 45 },
  drag: { label: "Drag", laps: 1 },
};

export function RaceSimulator() {
  const { design, sim } = useDesign();
  const [config, setConfig] = useState<RaceConfig>(() => defaultRaceConfig("monza"));
  const [result, setResult] = useState<RaceResult | null>(null);
  const [running, setRunning] = useState(false);

  function update(patch: Partial<RaceConfig>) {
    setConfig((c) => ({ ...c, ...patch }));
    setResult(null);
  }

  function runRace() {
    setRunning(true);
    setResult(null);
    setTimeout(() => {
      const res = simulateRace(design, sim, config);
      setResult(res);
      setRunning(false);
    }, 50);
  }

  const trackOptions = useMemo(() => (Object.keys(TRACKS) as TrackId[]).map((id) => ({ value: id, label: TRACKS[id].name })), []);
  const currentRaceType = useMemo(() => {
    const match = (Object.entries(RACE_TYPES) as [RaceType, { laps: number }][]).find(([, v]) => v.laps === config.laps);
    return match ? match[0] : "sprint";
  }, [config.laps]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-1 space-y-4">
        <Section title="Race Configuration" icon={<Flag size={16} />}>
          <div className="space-y-3">
            <div>
              <label className="label-mono mb-1.5 block">Race Format</label>
              <ChoiceGrid<RaceType>
                value={currentRaceType}
                options={(Object.keys(RACE_TYPES) as RaceType[]).map((rt) => ({ value: rt, label: RACE_TYPES[rt].label }))}
                onChange={(rt) => update({ laps: RACE_TYPES[rt].laps })}
                columns={3}
              />
            </div>
            <Select<TrackId> label="Circuit" value={config.trackId} options={trackOptions} onChange={(v) => update({ trackId: v })} />
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
              <div><span className="text-slate-400">Length:</span> {TRACKS[config.trackId].length.toFixed(2)} km</div>
              <div><span className="text-slate-400">Type:</span> {TRACKS[config.trackId].highSpeed ? "High-speed" : "Technical"}</div>
            </div>
            <Slider label="Laps" value={config.laps} min={1} max={100} onChange={(v) => update({ laps: v })} />
          </div>
        </Section>

        <Section title="Conditions" icon={<CloudRain size={16} />}>
          <div className="space-y-3">
            <Select<WeatherType> label="Weather" value={config.weather} options={(Object.keys(WEATHER_TYPES) as WeatherType[]).map((w) => ({ value: w, label: WEATHER_TYPES[w].label }))} onChange={(v) => update({ weather: v })} />
            {config.weather === "changing" && (
              <div className="grid grid-cols-2 gap-3">
                <Slider label="Change Lap" value={config.weatherChangeLap} min={2} max={Math.max(3, config.laps - 1)} onChange={(v) => update({ weatherChangeLap: v })} />
                <Select<WeatherType> label="Changes To" value={config.weatherChangeTo} options={(["dry", "light_rain", "heavy_rain"] as WeatherType[]).map((w) => ({ value: w, label: WEATHER_TYPES[w].label }))} onChange={(v) => update({ weatherChangeTo: v })} />
              </div>
            )}
            <Slider label="Ambient Temp" value={config.ambientTemp} min={0} max={45} unit="°C" onChange={(v) => update({ ambientTemp: v })} />
            <Slider label="Starting Tire Temp" value={config.startingTireTemp} min={20} max={100} unit="°C" onChange={(v) => update({ startingTireTemp: v })} hint="Cold tires have less grip until they warm up" />
          </div>
        </Section>

        <Section title="Driver & Field" icon={<Users size={16} />}>
          <div className="space-y-3">
            <Select<DriverSkill> label="Driver Skill" value={config.driverSkill} options={(Object.keys(DRIVER_SKILLS) as DriverSkill[]).map((s) => ({ value: s, label: DRIVER_SKILLS[s].label }))} onChange={(v) => update({ driverSkill: v })} />
            <Slider label="AI Aggression" value={config.aggression} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => update({ aggression: v })} hint="Higher = AI pushes harder, more incidents" />
            <Slider label="Field Size" value={config.fieldSize} min={4} max={20} onChange={(v) => update({ fieldSize: v })} />
          </div>
        </Section>

        <Section title="Strategy" icon={<Wrench size={16} />}>
          <div className="space-y-3">
            <Select label="Pit Strategy" value={config.pitStrategy} options={[{ value: "none", label: "No Stops" }, { value: "conservative", label: "Conservative" }, { value: "balanced", label: "Balanced" }, { value: "aggressive", label: "Aggressive" }]} onChange={(v) => update({ pitStrategy: v as RaceConfig["pitStrategy"] })} />
            <Select label="Fuel Strategy" value={config.fuelStrategy} options={[{ value: "lean", label: "Lean — Save Fuel" }, { value: "balanced", label: "Balanced" }, { value: "rich", label: "Rich — More Power" }, { value: "push", label: "Push — Max Power" }]} onChange={(v) => update({ fuelStrategy: v as RaceConfig["fuelStrategy"] })} />
            <Slider label="Fuel Load" value={config.fuelLoad} min={0.3} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => update({ fuelLoad: v })} />
            {(sim.isHybrid || sim.isElectric) && (
              <Select label="Hybrid Deploy Mode" value={config.hybridDeployMode} options={(Object.keys(HYBRID_DEPLOY_MODES) as string[]).map((d) => ({ value: d, label: HYBRID_DEPLOY_MODES[d].label }))} onChange={(v) => update({ hybridDeployMode: v as RaceConfig["hybridDeployMode"] })} />
            )}
          </div>
        </Section>

        <button onClick={runRace} disabled={running} className="w-full bg-accent-500 hover:bg-accent-400 disabled:opacity-50 text-base-950 font-semibold text-sm px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-glow">
          {running ? <Loader2 size={16} className="animate-spin" /> : <Flag size={16} />}
          {running ? "Simulating..." : "Start Race"}
        </button>
      </div>

      <div className="xl:col-span-2 space-y-4">
        {!result && !running && (
          <div className="panel p-12 flex flex-col items-center justify-center text-center">
            <Trophy size={40} className="text-base-700 mb-3" />
            <h3 className="text-sm font-semibold text-slate-400">No race run yet</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-xs">Configure your race and click Start Race to simulate with tire heating, fuel strategy, hybrid energy management, and AI competitors.</p>
          </div>
        )}
        {running && (
          <div className="panel p-12 flex flex-col items-center justify-center text-center">
            <Loader2 size={32} className="text-accent-400 animate-spin mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">Simulating race...</h3>
          </div>
        )}
        {result && <RaceResultView result={result} />}
      </div>
    </div>
  );
}

function RaceResultView({ result }: { result: RaceResult }) {
  const lapSeries = [{ data: result.lapRecords.map((l) => ({ x: l.lap, y: l.time })), color: "#22d3ee", fill: true, label: "Lap Time" }];
  const tireTempSeries = [
    { data: result.lapRecords.map((l) => ({ x: l.lap, y: l.tireTempFL })), color: "#ef4444", label: "FL" },
    { data: result.lapRecords.map((l) => ({ x: l.lap, y: l.tireTempFR })), color: "#f87171", label: "FR" },
    { data: result.lapRecords.map((l) => ({ x: l.lap, y: l.tireTempRL })), color: "#fbbf24", label: "RL" },
    { data: result.lapRecords.map((l) => ({ x: l.lap, y: l.tireTempRR })), color: "#f59e0b", label: "RR" },
  ];
  const fuelTireSeries = [
    { data: result.lapRecords.map((l) => ({ x: l.lap, y: l.fuel })), color: "#f59e0b", fill: true, label: "Fuel" },
    { data: result.lapRecords.map((l) => ({ x: l.lap, y: l.tireWearFL * 100 })), color: "#ef4444", label: "Tire Wear" },
  ];
  const tempSeries = [
    { data: result.lapRecords.map((l) => ({ x: l.lap, y: l.brakeTemp })), color: "#f59e0b", label: "Brake" },
    { data: result.lapRecords.map((l) => ({ x: l.lap, y: l.waterTemp })), color: "#22d3ee", label: "Water" },
    { data: result.lapRecords.map((l) => ({ x: l.lap, y: l.oilTemp })), color: "#a78bfa", label: "Oil" },
  ];
  const posSeries = [{ data: result.lapRecords.map((l) => ({ x: l.lap, y: l.position })), color: "#22c55e", label: "Position" }];
  const batterySeries = result.lapRecords.some((l) => l.batterySOC > 0)
    ? [{ data: result.lapRecords.map((l) => ({ x: l.lap, y: l.batterySOC * 100 })), color: "#a78bfa", fill: true, label: "Battery SOC" }]
    : [];
  const energySeries = result.lapRecords.some((l) => l.energyRecovered > 0)
    ? [
        { data: result.lapRecords.map((l) => ({ x: l.lap, y: l.energyDeployed })), color: "#22d3ee", label: "Deployed" },
        { data: result.lapRecords.map((l) => ({ x: l.lap, y: l.energyRecovered })), color: "#22c55e", label: "Recovered" },
      ]
    : [];

  return (
    <div className="space-y-4 stagger">
      <Section title="Race Result" icon={<Trophy size={16} />}>
        {result.dnf ? (
          <div className="bg-danger-500/10 border border-danger-500/30 rounded-lg px-4 py-3 mb-3">
            <div className="flex items-center gap-2 text-danger-400 text-sm font-semibold"><AlertTriangle size={16} />DNF — {result.dnfReason}</div>
            <p className="text-xs text-slate-500 mt-1">Retired on lap {result.laps} of {result.config.laps}</p>
          </div>
        ) : (
          <div className="bg-accent-500/10 border border-accent-500/30 rounded-lg px-4 py-3 mb-3">
            <div className="flex items-center gap-2 text-accent-300 text-sm font-semibold"><Trophy size={16} />P{result.finalPosition} — {result.trackName}</div>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 stagger">
          <StatTile label="Final Position" value={`P${result.finalPosition}`} accent="accent" sub={`from P${result.gridPosition} (${result.positionsGained > 0 ? "+" : ""}${result.positionsGained})`} />
          <StatTile label="Total Time" value={formatTime(result.totalTime)} />
          <StatTile label="Best Lap" value={formatLap(result.bestLap)} accent="ok" sub={`lap ${result.bestLapNumber}`} />
          <StatTile label="Avg Lap" value={formatLap(result.avgLap)} />
          <StatTile label="Laps" value={result.laps} unit={`/${result.config.laps}`} />
          <StatTile label="Pit Stops" value={result.pitStops} sub={`${result.totalTimeLost}s lost`} />
          <StatTile label="Top Speed" value={result.topSpeed} unit="km/h" />
          <StatTile label="Race Score" value={result.score} unit="/100" accent={result.score > 70 ? "ok" : result.score > 40 ? "warn" : "danger"} />
          <StatTile label="Fuel Used" value={result.fuelUsed} unit="L" sub={`${result.fuelRemaining}L remaining`} />
          <StatTile label="Fuel/Lap" value={result.fuelEfficiency.toFixed(2)} unit="L" accent="accent" />
          <StatTile label="Tire Wear" value={`${(result.tireWearEnd * 100).toFixed(0)}%`} accent={result.tireWearEnd > 0.8 ? "danger" : "warn"} />
          <StatTile label="Tire Mgmt" value={result.tireManagementScore} unit="/100" accent={result.tireManagementScore > 70 ? "ok" : "warn"} />
          {(result.energyRecoveredTotal > 0 || result.energyDeployedTotal > 0) && (
            <>
              <StatTile label="Energy Recovered" value={result.energyRecoveredTotal} unit="kWh" accent="ok" />
              <StatTile label="Energy Deployed" value={result.energyDeployedTotal} unit="kWh" accent="accent" />
              <StatTile label="Fuel Mgmt" value={result.fuelManagementScore} unit="/100" accent={result.fuelManagementScore > 70 ? "ok" : "warn"} />
            </>
          )}
        </div>
      </Section>

      {/* Strategy suggestions */}
      {result.suggestions.length > 0 && (
        <Section title="Strategy Suggestions" icon={<Lightbulb size={16} />}>
          <div className="space-y-2">
            {result.suggestions.map((s, i) => <SuggestionCard key={i} suggestion={s} />)}
          </div>
        </Section>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
        <Section title="Lap Times" icon={<Timer size={16} />}>
          <LineChart series={lapSeries} xLabel="Lap" yLabel="Time" yUnit="s" height={200} />
        </Section>
        <Section title="Position" icon={<TrendingUp size={16} />}>
          <LineChart series={posSeries} xLabel="Lap" yLabel="Pos" yMin={1} yMax={result.competitors.length} height={200} />
        </Section>
        <Section title="Tire Temperatures (Per Corner)" icon={<Thermometer size={16} />}>
          <LineChart series={tireTempSeries} xLabel="Lap" yLabel="Temp" yUnit="°C" height={200} />
          <div className="flex gap-3 text-[9px] text-slate-500 mt-1">
            <span className="flex items-center gap-1"><span className="h-2 w-2 bg-danger-500 rounded-sm" />FL</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 bg-red-400 rounded-sm" />FR</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 bg-warn-400 rounded-sm" />RL</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 bg-warn-500 rounded-sm" />RR</span>
          </div>
        </Section>
        <Section title="Fuel & Tire Wear" icon={<Fuel size={16} />}>
          <LineChart series={fuelTireSeries} xLabel="Lap" yLabel="Fuel (L) / Wear (%)" height={200} />
        </Section>
        <Section title="Fluid Temperatures" icon={<Gauge size={16} />}>
          <LineChart series={tempSeries} xLabel="Lap" yLabel="Temp" yUnit="°C" height={200} />
        </Section>
        {batterySeries.length > 0 && (
          <Section title="Battery State of Charge" icon={<Battery size={16} />}>
            <LineChart series={batterySeries} xLabel="Lap" yLabel="SOC" yUnit="%" height={200} />
          </Section>
        )}
        {energySeries.length > 0 && (
          <Section title="Hybrid Energy Management" icon={<Zap size={16} />}>
            <LineChart series={energySeries} xLabel="Lap" yLabel="Energy" yUnit="kWh" height={200} />
          </Section>
        )}
      </div>

      {/* Final classification */}
      <Section title="Final Classification" icon={<Users size={16} />}>
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {result.competitors.map((c) => (
            <div key={c.name} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${c.name === "You" ? "bg-accent-500/15 border border-accent-500/30" : "bg-base-850 border border-base-800 hover:border-base-700"}`}>
              <span className="font-mono text-xs text-slate-500 w-6">P{c.position}</span>
              <span className="h-3 w-3 rounded-sm" style={{ background: c.carColor }} />
              <span className="text-sm text-slate-200 flex-1 truncate">{c.name}</span>
              {c.retired && <span className="text-[10px] text-danger-400 font-mono">DNF</span>}
              <span className="font-mono text-xs text-slate-400">{formatTime(c.totalTime)}</span>
              {c.gapToLeader > 0 && <span className="font-mono text-[10px] text-slate-600 w-16 text-right">+{c.gapToLeader.toFixed(1)}s</span>}
            </div>
          ))}
        </div>
      </Section>

      {/* Incidents */}
      {result.incidents.length > 0 && (
        <Section title="Race Incidents" icon={<AlertTriangle size={16} />}>
          <div className="space-y-1.5">
            {result.incidents.map((inc, i) => (
              <div key={i} className="flex items-start gap-2 text-xs bg-base-850 rounded-lg px-3 py-2">
                <span className="font-mono text-slate-500 shrink-0">L{inc.lap}</span>
                <span className="text-warn-400 shrink-0">{inc.type}</span>
                <span className="text-slate-400">{inc.description}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Lap table */}
      <Section title="Lap-by-Lap Data" icon={<Disc size={16} />}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-base-800">
                <th className="text-left py-2 px-2 font-mono">Lap</th>
                <th className="text-right py-2 px-2 font-mono">Time</th>
                <th className="text-right py-2 px-2 font-mono">Fuel</th>
                <th className="text-right py-2 px-2 font-mono">Wear</th>
                <th className="text-right py-2 px-2 font-mono">Tire°</th>
                <th className="text-right py-2 px-2 font-mono">Brake°</th>
                <th className="text-right py-2 px-2 font-mono">Pos</th>
                {result.lapRecords.some((l) => l.batterySOC > 0) && <th className="text-right py-2 px-2 font-mono">SOC</th>}
                <th className="text-center py-2 px-2 font-mono">Pit</th>
              </tr>
            </thead>
            <tbody>
              {result.lapRecords.map((l) => (
                <tr key={l.lap} className={`border-b border-base-850 transition-colors duration-200 hover:bg-base-850/60 ${l.pitted ? "bg-warn-500/5" : ""}`}>
                  <td className="py-1.5 px-2 font-mono text-slate-400">{l.lap}</td>
                  <td className="py-1.5 px-2 font-mono text-right text-slate-200">{formatLap(l.time)}</td>
                  <td className="py-1.5 px-2 font-mono text-right text-warn-400">{l.fuel}L</td>
                  <td className="py-1.5 px-2 font-mono text-right text-danger-400">{(l.tireWearFL * 100).toFixed(0)}%</td>
                  <td className="py-1.5 px-2 font-mono text-right text-slate-400">{Math.round((l.tireTempFL + l.tireTempFR + l.tireTempRL + l.tireTempRR) / 4)}°</td>
                  <td className="py-1.5 px-2 font-mono text-right text-slate-400">{l.brakeTemp}°</td>
                  <td className="py-1.5 px-2 font-mono text-right text-accent-300">P{l.position}</td>
                  {result.lapRecords.some((l2) => l2.batterySOC > 0) && <td className="py-1.5 px-2 font-mono text-right text-slate-500">{(l.batterySOC * 100).toFixed(0)}%</td>}
                  <td className="py-1.5 px-2 text-center">{l.pitted && <span className="text-warn-400">●</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function SuggestionCard({ suggestion }: { suggestion: StrategySuggestion }) {
  const priorityColors = {
    critical: "border-danger-500/40 bg-danger-500/10",
    high: "border-warn-500/40 bg-warn-500/10",
    medium: "border-accent-500/30 bg-accent-500/5",
    low: "border-base-700 bg-base-850",
  };
  const priorityText = {
    critical: "text-danger-400",
    high: "text-warn-400",
    medium: "text-accent-300",
    low: "text-slate-400",
  };
  const categoryIcons = {
    tire: <Disc size={14} />,
    fuel: <Fuel size={14} />,
    hybrid: <Battery size={14} />,
    setup: <Wrench size={14} />,
    driver: <Users size={14} />,
  };

  return (
    <div className={`rounded-lg px-3 py-2.5 border ${priorityColors[suggestion.priority]}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={priorityText[suggestion.priority]}>{categoryIcons[suggestion.category]}</span>
        <span className="text-sm font-semibold text-slate-200">{suggestion.title}</span>
        <span className={`text-[9px] uppercase font-mono ml-auto ${priorityText[suggestion.priority]}`}>{suggestion.priority}</span>
      </div>
      <p className="text-xs text-slate-400">{suggestion.description}</p>
      <p className="text-[10px] text-ok-400 mt-1 font-mono">Expected gain: {suggestion.expectedGain}</p>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toFixed(3).padStart(6, "0")}`;
  }
  return `${seconds.toFixed(3)}s`;
}

function formatLap(seconds: number): string {
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toFixed(3).padStart(6, "0")}`;
  }
  return `${seconds.toFixed(3)}s`;
}
