import { useState, useMemo } from "react";
import { Activity, Gauge, TrendingUp, Disc, Layers, Wind, DollarSign, Cpu, Table, BarChart3, Battery, Car } from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { Section, StatTile } from "./ui/Controls";
import { LineChart } from "./ui/LineChart";
import { TRACKS, ENGINE_LAYOUTS, TIRE_COMPOUNDS, CHASSIS_TYPES, SEAT_TYPES, SEAT_MATERIALS, DASHBOARD_MATERIALS, ROLL_CAGES } from "../sim/constants";

export function DetailedStats() {
  const [tab, setTab] = useState<"overview" | "performance" | "aero" | "engine" | "interior" | "cost" | "tracks">("overview");

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: <Activity size={14} /> },
    { id: "performance" as const, label: "Performance", icon: <Gauge size={14} /> },
    { id: "aero" as const, label: "Aero", icon: <Wind size={14} /> },
    { id: "engine" as const, label: "Engine", icon: <Cpu size={14} /> },
    { id: "interior" as const, label: "Interior", icon: <Car size={14} /> },
    { id: "cost" as const, label: "Cost", icon: <DollarSign size={14} /> },
    { id: "tracks" as const, label: "All Tracks", icon: <Table size={14} /> },
  ];

  return (
    <div className="space-y-4">
      <Section title="Detailed Statistics" icon={<BarChart3 size={16} />}>
        <div className="flex flex-wrap gap-1 bg-base-850 rounded-lg p-1 border border-base-800">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${tab === t.id ? "bg-accent-500/20 text-accent-300" : "text-slate-400 hover:text-slate-200"}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </Section>
      {tab === "overview" && <OverviewTab />}
      {tab === "performance" && <PerformanceTab />}
      {tab === "aero" && <AeroTab />}
      {tab === "engine" && <EngineTab />}
      {tab === "interior" && <InteriorTab />}
      {tab === "cost" && <CostTab />}
      {tab === "tracks" && <TracksTab />}
    </div>
  );
}

function OverviewTab() {
  const { sim } = useDesign();
  const powerSeries = [
    { data: sim.powerCurve.map((p) => ({ x: p.rpm, y: p.power })), color: "#22d3ee", fill: true },
    { data: sim.powerCurve.map((p) => ({ x: p.rpm, y: p.torque })), color: "#f59e0b" },
  ];
  return (
    <div className="space-y-4">
      <Section title="Headline Performance" icon={<Activity size={16} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <StatTile label="Power" value={sim.peakPower} unit="hp" accent="accent" sub={`@ ${sim.peakPowerRpm} rpm`} />
          <StatTile label="Torque" value={sim.peakTorque} unit="Nm" accent="accent" sub={`@ ${sim.peakTorqueRpm} rpm`} />
          <StatTile label="Power/Weight" value={(sim.peakPower / (sim.weight / 1000)).toFixed(0)} unit="hp/t" accent="accent" />
          <StatTile label="Torque/Weight" value={(sim.peakTorque / (sim.weight / 1000)).toFixed(0)} unit="Nm/t" />
          <StatTile label="Weight" value={sim.weight} unit="kg" />
          <StatTile label="Top Speed" value={sim.topSpeed} unit="km/h" accent="accent" />
          <StatTile label="0-60 mph" value={sim.accel0_60} unit="s" accent={sim.accel0_60 < 3 ? "ok" : "default"} />
          <StatTile label="0-100 km/h" value={sim.accel0_100} unit="s" />
          <StatTile label="0-200 km/h" value={(sim.accel0_100 + sim.accel100_200).toFixed(2)} unit="s" />
          <StatTile label="100-200" value={sim.accel100_200} unit="s" />
          <StatTile label="Quarter Mile" value={sim.quarterMile} unit="s" sub={`${sim.quarterMileSpeed} km/h`} />
          <StatTile label="Braking" value={sim.brakingDist} unit="m" />
        </div>
      </Section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Power & Torque Curve" icon={<TrendingUp size={16} />}>
          <LineChart series={powerSeries} xLabel="RPM" yLabel="hp / Nm" height={240} />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span className="flex items-center gap-1"><span className="h-2 w-3 bg-accent-400 rounded-sm" />Power</span>
            <span className="flex items-center gap-1"><span className="h-2 w-3 bg-warn-500 rounded-sm" />Torque</span>
          </div>
        </Section>
        <Section title="Ratings Summary" icon={<Gauge size={16} />}>
          <div className="space-y-3">
            <RatingBar label="Reliability" value={sim.reliability} good={0.8} />
            <RatingBar label="Drivability" value={sim.drivability} good={0.7} />
            <RatingBar label="Cooling Margin" value={sim.coolingMargin} good={0.4} />
            <RatingBar label="Comfort" value={sim.comfortRating} good={0.7} />
            <RatingBar label="Luxury" value={sim.luxuryRating} good={0.7} />
            <div className="grid grid-cols-2 gap-2 pt-2">
              <StatTile label="Safety Rating" value={sim.safetyRating} unit="/5" accent={sim.safetyRating > 4 ? "ok" : "default"} />
              <StatTile label="Market Rating" value={sim.marketRating} unit="/5" />
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function PerformanceTab() {
  const { sim } = useDesign();
  const dragSeries = [
    { data: sim.dragVsSpeed.map((d) => ({ x: d.speed, y: d.drag })), color: "#22d3ee", fill: true },
    { data: sim.dragVsSpeed.map((d) => ({ x: d.speed, y: d.downforce })), color: "#22c55e" },
  ];
  return (
    <div className="space-y-4">
      <Section title="Acceleration & Speed" icon={<Gauge size={16} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <StatTile label="0-30 mph" value={(sim.accel0_60 * 0.35).toFixed(2)} unit="s" />
          <StatTile label="0-60 mph" value={sim.accel0_60} unit="s" accent="accent" />
          <StatTile label="0-100 km/h" value={sim.accel0_100} unit="s" accent="accent" />
          <StatTile label="0-200 km/h" value={(sim.accel0_100 + sim.accel100_200).toFixed(2)} unit="s" />
          <StatTile label="Quarter Mile" value={sim.quarterMile} unit="s" sub={`${sim.quarterMileSpeed} km/h`} />
          <StatTile label="Top Speed" value={sim.topSpeed} unit="km/h" accent="accent" />
          <StatTile label="Trap Speed" value={sim.quarterMileSpeed} unit="km/h" />
          <StatTile label="Lateral G" value={sim.lateralG} unit="g" accent="accent" />
          <StatTile label="Skidpad" value={sim.skidpad} unit="m" />
          <StatTile label="Braking 100-0" value={sim.brakingDist} unit="m" accent={sim.brakingDist < 34 ? "ok" : "default"} />
          <StatTile label="CG Height" value={sim.cgHeight} unit="mm" />
          <StatTile label="Weight Dist." value={`${(sim.weightDistFront * 100).toFixed(0)}/${(100 - sim.weightDistFront * 100).toFixed(0)}`} unit="F/R" />
        </div>
      </Section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Drag & Downforce vs Speed" icon={<Wind size={16} />}>
          <LineChart series={dragSeries} xLabel="Speed" xUnit="km/h" yLabel="Force" yUnit="N" height={220} />
        </Section>
        <Section title="Braking & Handling" icon={<Disc size={16} />}>
          <div className="grid grid-cols-2 gap-2">
            <StatTile label="Braking Distance" value={sim.brakingDist} unit="m" sub="100→0 km/h" />
            <StatTile label="Braking G" value={(100 / (sim.brakingDist * 0.0508)).toFixed(2)} unit="g" />
            <StatTile label="Lateral G" value={sim.lateralG} unit="g" />
            <StatTile label="Skidpad" value={sim.skidpad} unit="m" />
            <StatTile label="Aero Balance" value={`${(sim.aeroBalance * 100).toFixed(0)}%`} unit="front" />
            <StatTile label="Center of Pressure" value={`${(sim.centerOfPressure * 100).toFixed(0)}%`} unit="front" />
          </div>
        </Section>
      </div>
    </div>
  );
}

function AeroTab() {
  const { sim } = useDesign();
  const dragSeries = [
    { data: sim.dragVsSpeed.map((d) => ({ x: d.speed, y: d.drag })), color: "#22d3ee", fill: true },
    { data: sim.dragVsSpeed.map((d) => ({ x: d.speed, y: d.downforce })), color: "#22c55e" },
  ];
  const efficiencySeries = [{ data: sim.dragVsSpeed.map((d) => ({ x: d.speed, y: d.downforce > 0 && d.drag > 0 ? d.downforce / d.drag : 0 })), color: "#a78bfa", fill: true }];
  return (
    <div className="space-y-4">
      <Section title="Aerodynamic Summary" icon={<Wind size={16} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <StatTile label="Drag Coefficient" value={sim.dragCoeff.toFixed(3)} unit="Cd" accent="accent" />
          <StatTile label="Frontal Area" value={sim.frontalArea.toFixed(2)} unit="m²" />
          <StatTile label="Lift Coefficient" value={sim.liftCoeff.toFixed(3)} unit="Cl" accent={sim.liftCoeff < 0 ? "ok" : "warn"} />
          <StatTile label="Downforce @250" value={sim.downforce} unit="N" accent="accent" />
          <StatTile label="Aero Balance" value={`${(sim.aeroBalance * 100).toFixed(0)}%`} unit="front" />
          <StatTile label="Center of Pressure" value={`${(sim.centerOfPressure * 100).toFixed(0)}%`} unit="front" />
          <StatTile label="Drag Area (CdA)" value={(sim.dragCoeff * sim.frontalArea).toFixed(2)} unit="m²" />
          <StatTile label="DF/Weight" value={(sim.downforce / (sim.weight * 9.81)).toFixed(2)} accent={sim.downforce / (sim.weight * 9.81) > 1 ? "ok" : "default"} />
        </div>
      </Section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Forces vs Speed" icon={<TrendingUp size={16} />}>
          <LineChart series={dragSeries} xLabel="Speed" xUnit="km/h" yLabel="Force" yUnit="N" height={220} />
        </Section>
        <Section title="Aero Efficiency (DF/Drag)" icon={<Activity size={16} />}>
          <LineChart series={efficiencySeries} xLabel="Speed" xUnit="km/h" yLabel="Ratio" height={220} />
        </Section>
      </div>
    </div>
  );
}

function EngineTab() {
  const { sim, design } = useDesign();
  const eng = design.engine;
  const layout = ENGINE_LAYOUTS[eng.layout];
  const isElectric = eng.layout === "electric";
  const powerSeries = [
    { data: sim.powerCurve.map((p) => ({ x: p.rpm, y: p.power })), color: "#22d3ee", fill: true },
    { data: sim.powerCurve.map((p) => ({ x: p.rpm, y: p.torque })), color: "#f59e0b" },
  ];
  return (
    <div className="space-y-4">
      <Section title="Engine Specifications" icon={<Cpu size={16} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <StatTile label="Architecture" value={layout.label} />
          <StatTile label="Displacement" value={sim.displacement} unit="cc" accent="accent" />
          <StatTile label="Cylinders" value={sim.cylinderCount} />
          {!isElectric && <StatTile label="Bore × Stroke" value={`${eng.bore}×${eng.stroke}`} unit="mm" />}
          {!isElectric && <StatTile label="Compression Ratio" value={`${eng.compressionRatio}:1`} />}
          <StatTile label="Redline" value={sim.redline} unit="rpm" accent="accent" />
          <StatTile label="Peak Power" value={sim.peakPower} unit="hp" accent="accent" sub={`@ ${sim.peakPowerRpm}`} />
          <StatTile label="Peak Torque" value={sim.peakTorque} unit="Nm" accent="accent" sub={`@ ${sim.peakTorqueRpm}`} />
          {!isElectric && <StatTile label="Max Piston Speed" value={sim.maxPistonSpeed.toFixed(1)} unit="m/s" />}
          {!isElectric && <StatTile label="Thermal Efficiency" value={`${(sim.thermalEfficiency * 100).toFixed(1)}%`} accent="ok" />}
          {!isElectric && <StatTile label="BSFC" value={sim.bsfc} unit="g/kWh" />}
          {!isElectric && <StatTile label="Boost" value={sim.boostPressure.toFixed(1)} unit="bar" accent={sim.boostPressure > 0 ? "accent" : "default"} />}
        </div>
      </Section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Power & Torque Curve" icon={<TrendingUp size={16} />}>
          <LineChart series={powerSeries} xLabel="RPM" yLabel="hp / Nm" height={240} />
        </Section>
        <Section title="Engine Health" icon={<Gauge size={16} />}>
          <div className="space-y-3">
            <RatingBar label="Reliability" value={sim.reliability} good={0.8} />
            <div className="grid grid-cols-2 gap-2">
              {!isElectric && <StatTile label="Knock Risk" value={`${(sim.knockRisk * 100).toFixed(0)}%`} accent={sim.knockRisk > 0.5 ? "danger" : sim.knockRisk > 0.3 ? "warn" : "ok"} />}
              {!isElectric && <StatTile label="Octane Required" value={sim.octaneRequired} unit="RON" />}
              {!isElectric && <StatTile label="Turbo Lag" value={sim.turboLag.toFixed(2)} unit="s" accent={sim.turboLag > 0.6 ? "warn" : "default"} />}
              <StatTile label="Cooling Margin" value={`${(sim.coolingMargin * 100).toFixed(0)}%`} accent={sim.coolingMargin < 0.3 ? "danger" : "ok"} />
              {!isElectric && <StatTile label="Fuel Economy" value={sim.fuelEconomy} unit="L/100km" />}
              <StatTile label="Emissions" value={sim.emissions} unit="g/km" accent={sim.emissions > 250 ? "warn" : "default"} />
              <StatTile label="Noise" value={sim.noise} unit="dB" />
              <StatTile label="Engine Weight" value={sim.engineWeight} unit="kg" />
            </div>
          </div>
        </Section>
      </div>
      {(sim.isHybrid || sim.isElectric) && (
        <Section title="Hybrid / Electric Details" icon={<Battery size={16} />}>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {sim.mguHPower > 0 && <StatTile label="MGU-H Power" value={sim.mguHPower} unit="kW" accent="accent" />}
            {sim.mguKPower > 0 && <StatTile label="MGU-K Power" value={sim.mguKPower} unit="kW" accent="accent" />}
            <StatTile label="Combined Power" value={sim.peakPower} unit="hp" accent="accent" />
            <StatTile label="Combined Torque" value={sim.peakTorque} unit="Nm" />
            <StatTile label="Battery Energy" value={sim.batteryEnergy} unit="kWh" />
            <StatTile label="Battery Weight" value={sim.batteryWeight} unit="kg" />
            {isElectric && <StatTile label="Electric Range" value={sim.electricRange} unit="km" accent="ok" />}
            <StatTile label="Regen Efficiency" value={`${(sim.regenEfficiency * 100).toFixed(0)}%`} accent="ok" />
            <StatTile label="Battery Cost" value={`$${(sim.batteryCost / 1000).toFixed(1)}k`} />
          </div>
        </Section>
      )}
    </div>
  );
}

function InteriorTab() {
  const { sim, design } = useDesign();
  const i = design.vehicle.interior;
  return (
    <div className="space-y-4">
      <Section title="Interior Specifications" icon={<Car size={16} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <StatTile label="Seat Type" value={SEAT_TYPES[i.seatType].label} />
          <StatTile label="Seat Material" value={SEAT_MATERIALS[i.seatMaterial].label} />
          <StatTile label="Seats" value={i.seatCount} />
          <StatTile label="Dashboard" value={DASHBOARD_MATERIALS[i.dashboardMaterial].label} />
          <StatTile label="Roll Cage" value={ROLL_CAGES[i.rollCage].label} />
          <StatTile label="Screen Size" value={i.infotainmentSize} unit='"' />
        </div>
      </Section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Interior Weight & Cost" icon={<Layers size={16} />}>
          <div className="grid grid-cols-2 gap-2">
            <StatTile label="Interior Weight" value={sim.interiorWeight} unit="kg" accent="accent" />
            <StatTile label="Interior Cost" value={`$${sim.interiorCost.toLocaleString()}`} accent="accent" />
            <StatTile label="Seat Weight" value={(SEAT_TYPES[i.seatType].weight * SEAT_MATERIALS[i.seatMaterial].weightFactor * i.seatCount).toFixed(1)} unit="kg" />
            <StatTile label="Roll Cage Weight" value={ROLL_CAGES[i.rollCage].weight} unit="kg" />
            <StatTile label="Audio" value={i.audioSpeakers} unit="speakers" sub={i.hasPremiumAudio ? "Premium" : "Standard"} />
            <StatTile label="Sound Deadening" value={`${(i.soundDeadening * 100).toFixed(0)}%`} />
          </div>
        </Section>
        <Section title="Ratings" icon={<Gauge size={16} />}>
          <div className="space-y-3">
            <RatingBar label="Comfort" value={sim.comfortRating} good={0.7} />
            <RatingBar label="Luxury" value={sim.luxuryRating} good={0.7} />
            <RatingBar label="Safety (Cage)" value={ROLL_CAGES[i.rollCage].safetyFactor} good={0.8} />
            <RatingBar label="Seat Support" value={SEAT_TYPES[i.seatType].support} good={0.7} />
            <div className="grid grid-cols-2 gap-2 pt-2">
              <StatTile label="Drivability" value={`${(sim.drivability * 100).toFixed(0)}%`} />
              <StatTile label="Noise Level" value={sim.noise} unit="dB" accent={sim.noise < 70 ? "ok" : "warn"} />
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function CostTab() {
  const { sim, design } = useDesign();
  const chassis = CHASSIS_TYPES[design.vehicle.chassis];
  const costBreakdown = [
    { label: "Engine", value: sim.engineCost, color: "#22d3ee" },
    { label: "Vehicle Body", value: sim.vehicleCost - sim.engineCost, color: "#f59e0b" },
    { label: "Interior", value: sim.interiorCost, color: "#22c55e" },
  ];
  const maxCost = Math.max(...costBreakdown.map((c) => c.value));
  return (
    <div className="space-y-4">
      <Section title="Cost Breakdown" icon={<DollarSign size={16} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <StatTile label="Engine Cost" value={`$${(sim.engineCost / 1000).toFixed(1)}k`} accent="accent" />
          <StatTile label="Vehicle Cost" value={`$${(sim.vehicleCost / 1000).toFixed(1)}k`} />
          <StatTile label="Interior Cost" value={`$${(sim.interiorCost / 1000).toFixed(1)}k`} />
          <StatTile label="Total Cost" value={`$${(sim.totalCost / 1000).toFixed(1)}k`} accent="accent" />
          <StatTile label="Target Price" value={`$${(sim.targetPrice / 1000).toFixed(1)}k`} accent="accent" />
          <StatTile label="Profit Margin" value={`${(sim.profitMargin * 100).toFixed(0)}%`} accent={sim.profitMargin > 0.25 ? "ok" : "warn"} />
          <StatTile label="Profit/Unit" value={`$${((sim.targetPrice - sim.totalCost) / 1000).toFixed(1)}k`} accent="ok" />
        </div>
        <div className="space-y-3">
          {costBreakdown.map((c) => (
            <div key={c.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">{c.label}</span>
                <span className="font-mono text-slate-200">${(c.value / 1000).toFixed(1)}k</span>
              </div>
              <div className="h-3 bg-base-850 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${(c.value / maxCost) * 100}%`, background: c.color }} />
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Build Specifications" icon={<Layers size={16} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <StatTile label="Chassis" value={chassis.label} />
          <StatTile label="Rigidity" value={`${(chassis.rigidityFactor * 100).toFixed(0)}%`} />
          <StatTile label="Safety Factor" value={`${(chassis.safetyFactor * 100).toFixed(0)}%`} />
          <StatTile label="Tire" value={TIRE_COMPOUNDS[design.vehicle.tireCompound].label} />
          <StatTile label="Gears" value={design.vehicle.gearCount} />
          <StatTile label="Final Drive" value={design.vehicle.finalDrive.toFixed(1)} />
          <StatTile label="Wheel Size" value={`${design.vehicle.wheelDiameter}"×${design.vehicle.wheelWidth}"`} />
          <StatTile label="Aero Weight" value={sim.aeroWeight} unit="kg" />
        </div>
      </Section>
    </div>
  );
}

function TracksTab() {
  const { sim } = useDesign();
  const sorted = useMemo(() => [...sim.lapTimes].sort((a, b) => a.time - b.time), [sim.lapTimes]);
  const fastest = sorted[0];
  const slowest = sorted[sorted.length - 1];
  return (
    <div className="space-y-4">
      <Section title="Lap Times — All Circuits" icon={<Table size={16} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <StatTile label="Fastest Lap" value={formatLap(fastest.time)} sub={fastest.trackName} accent="ok" />
          <StatTile label="Slowest Lap" value={formatLap(slowest.time)} sub={slowest.trackName} />
          <StatTile label="Spread" value={`${(slowest.time - fastest.time).toFixed(2)}s`} />
          <StatTile label="Tracks" value={sorted.length} />
        </div>
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
                <th className="text-left py-2 px-2">Type</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((lap, i) => {
                const track = TRACKS[lap.trackId];
                return (
                  <tr key={lap.trackId} className="border-b border-base-850 hover:bg-base-850/50">
                    <td className="py-2 px-2 font-mono text-slate-500">{i + 1}</td>
                    <td className="py-2 px-2 text-slate-200">{lap.trackName}</td>
                    <td className="py-2 px-2 font-mono text-right text-accent-300">{formatLap(lap.time)}</td>
                    <td className="py-2 px-2 font-mono text-right text-slate-500">{i === 0 ? "—" : `+${(lap.time - fastest.time).toFixed(2)}`}</td>
                    <td className="py-2 px-2 font-mono text-right text-slate-400">{lap.topSpeed}</td>
                    <td className="py-2 px-2 font-mono text-right text-slate-400">{lap.avgSpeed}</td>
                    <td className="py-2 px-2 font-mono text-right text-slate-500">{track.length.toFixed(2)}</td>
                    <td className="py-2 px-2 text-slate-500">{track.highSpeed ? "High-speed" : "Technical"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function RatingBar({ label, value, good }: { label: string; value: number; good: number }) {
  const pct = Math.min(value * 100, 100);
  const isGood = value >= good;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className={`font-mono ${isGood ? "text-ok-400" : "text-warn-400"}`}>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-base-850 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${isGood ? "bg-ok-500" : "bg-warn-500"}`} style={{ width: `${pct}%` }} />
      </div>
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
