import { useMemo } from "react";
import {
  LayoutDashboard, Wind, Battery, Zap, Thermometer, Layers,
  CircleDot, Flag, DollarSign, ShieldCheck, Star,
  Bot, TrendingUp, AlertTriangle, Check, ArrowRight, Gauge,
  Activity, Car, Fuel, Trophy, Warehouse, Target,
} from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { useCompany } from "../state/CompanyContext";
import { Section, StatTile } from "./ui/Controls";
import { LineChart } from "./ui/LineChart";
import { computeScores, computeSummary } from "../sim/reviews";
import { ENGINE_LAYOUTS, CHASSIS_TYPES, TIRE_COMPOUNDS } from "../sim/constants";
import type { SimResult, VehicleDesign } from "../sim/types";

interface Recommendation {
  id: string;
  priority: "critical" | "high" | "medium" | "low";
  category: string;
  title: string;
  detail: string;
  metric: string;
  target: string;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function formatLap(seconds: number): string {
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toFixed(3).padStart(6, "0")}`;
  }
  return `${seconds.toFixed(3)}s`;
}

export function CommandCenter() {
  const { design, sim, carConcept, setCarConcept } = useDesign();
  const { company } = useCompany();
  const scores = useMemo(() => computeScores(design, sim), [design, sim]);
  const summary = useMemo(() => computeSummary(scores), [scores]);

  const recommendations = useMemo<Recommendation[]>(
    () => analyzeDesign(design, sim),
    [design, sim],
  );

  const powerSeries = [
    { data: sim.powerCurve.map((p) => ({ x: p.rpm, y: p.power })), color: "#22d3ee", fill: true },
    { data: sim.powerCurve.map((p) => ({ x: p.rpm, y: p.torque })), color: "#f59e0b" },
  ];

  const dragSeries = [
    { data: sim.dragVsSpeed.map((d) => ({ x: d.speed, y: d.drag })), color: "#22d3ee", fill: true },
    { data: sim.dragVsSpeed.map((d) => ({ x: d.speed, y: d.downforce })), color: "#22c55e" },
  ];

  const sortedLaps = [...sim.lapTimes].sort((a, b) => a.time - b.time);
  const fastestLap = sortedLaps[0];
  const slowestLap = sortedLaps[sortedLaps.length - 1];

  const layout = ENGINE_LAYOUTS[design.engine.layout];
  const chassis = CHASSIS_TYPES[design.vehicle.chassis];
  const tire = TIRE_COMPOUNDS[design.vehicle.tireCompound];

  const overallHealth = computeOverallHealth(sim, summary.overall);
  const totalMsWins = company.motorsport.teams.reduce((s, t) => s + t.wins, 0);

  function fmtMoney(n: number) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
    return `$${n.toFixed(0)}`;
  }

  return (
    <div className="space-y-4 stagger">
      {/* Vehicle Concept Philosophy Selection Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-base-950 border border-cyan-500/40 rounded-2xl p-5 shadow-[0_0_30px_rgba(34,211,238,0.15)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <Target size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">VEHICLE CONCEPT INTENT</span>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full">AI TUNER ACTIVE</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100">Select Design Goal & AI Philosophy</h2>
              <p className="text-xs text-slate-400">Tunes Apex AI Assistant to guide engineering decisions based on your target build concept</p>
            </div>
          </div>

          {/* Philosophy Concept Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "budget", label: "Budget Focused", desc: "Max ROI, low cost & high reliability", color: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10" },
              { id: "track", label: "Track Focused", desc: "Peak lateral G, low weight & high aero", color: "border-amber-500/40 text-amber-300 bg-amber-500/10" },
              { id: "luxury", label: "Luxury Focused", desc: "Supreme NVH, leather & comfort score", color: "border-purple-500/40 text-purple-300 bg-purple-500/10" },
              { id: "balanced", label: "Balanced Build", desc: "All-round engineering harmony", color: "border-cyan-500/40 text-cyan-300 bg-cyan-500/10" },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setCarConcept(c.id as any)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  carConcept === c.id
                    ? `${c.color} shadow-[0_0_15px_rgba(34,211,238,0.2)] ring-1 ring-cyan-400`
                    : "bg-base-950/60 border-white/5 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <div className="text-xs font-bold font-mono uppercase mb-0.5">{c.label}</div>
                <div className="text-[10px] text-slate-500 leading-tight">{c.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Company Status Strip */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        <div className="bg-base-900 border border-base-800 rounded-xl p-3 text-center hover:border-base-700 transition-all">
          <Fuel size={12} className="mx-auto text-warn-400 mb-1" />
          <div className="font-mono text-sm text-warn-400">${company.economy.fuelPrice.toFixed(2)}</div>
          <div className="text-[9px] text-slate-600">Fuel $/gal</div>
        </div>
        <div className="bg-base-900 border border-base-800 rounded-xl p-3 text-center hover:border-base-700 transition-all">
          <Warehouse size={12} className="mx-auto text-accent-400 mb-1" />
          <div className="font-mono text-sm text-accent-300">{company.garage.length}</div>
          <div className="text-[9px] text-slate-600">Garage</div>
        </div>
        <div className="bg-base-900 border border-base-800 rounded-xl p-3 text-center hover:border-base-700 transition-all">
          <Trophy size={12} className="mx-auto text-yellow-400 mb-1" />
          <div className="font-mono text-sm text-yellow-400">{totalMsWins}</div>
          <div className="text-[9px] text-slate-600">Race Wins</div>
        </div>
        <div className="bg-base-900 border border-base-800 rounded-xl p-3 text-center hover:border-base-700 transition-all">
          <DollarSign size={12} className="mx-auto text-ok-400 mb-1" />
          <div className="font-mono text-sm text-ok-400">{fmtMoney(company.totalRevenue)}</div>
          <div className="text-[9px] text-slate-600">Revenue</div>
        </div>
        <div className="bg-base-900 border border-base-800 rounded-xl p-3 text-center hover:border-base-700 transition-all">
          <Star size={12} className="mx-auto text-purple-400 mb-1" />
          <div className="font-mono text-sm text-purple-400">{company.reputation}</div>
          <div className="text-[9px] text-slate-600">Reputation</div>
        </div>
        <div className="bg-base-900 border border-base-800 rounded-xl p-3 text-center hover:border-base-700 transition-all">
          <Activity size={12} className="mx-auto text-blue-400 mb-1" />
          <div className="font-mono text-sm text-blue-400">Mo.{company.economy.month}</div>
          <div className="text-[9px] text-slate-600">Game Month</div>
        </div>
      </div>
      {/* Hero banner */}
      <div className="panel p-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top right, rgba(34,211,238,0.3), transparent 60%)" }} />
        <div className="relative flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent-500/20 border border-accent-500/30">
              <LayoutDashboard size={24} className="text-accent-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Central Engineering Dashboard</h2>
              <p className="text-xs text-slate-500">Real-time command center — updates instantly with every lab change</p>
            </div>
          </div>
          <div className="flex-1" />
          <HealthGauge value={overallHealth} />
        </div>
      </div>

      {/* Critical alerts strip */}
      {recommendations.filter((r) => r.priority === "critical").length > 0 && (
        <div className="panel p-3 border-danger-500/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-danger-400" />
            <span className="text-xs font-semibold text-danger-300 uppercase tracking-wider">Critical Alerts</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {recommendations.filter((r) => r.priority === "critical").map((r) => (
              <AlertCard key={r.id} rec={r} />
            ))}
          </div>
        </div>
      )}

      {/* Vehicle specs */}
      <Section title="Vehicle Specifications" icon={<Car size={16} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <StatTile label="Architecture" value={layout.label} />
          <StatTile label="Displacement" value={sim.displacement} unit="cc" />
          <StatTile label="Chassis" value={chassis.label} />
          <StatTile label="Tire" value={tire.label} />
          <StatTile label="Weight" value={sim.weight} unit="kg" accent="accent" />
          <StatTile label="Power" value={sim.peakPower} unit="hp" accent="accent" />
        </div>
      </Section>

      {/* Performance + Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Power & Torque Curves" icon={<TrendingUp size={16} />}>
          <LineChart series={powerSeries} xLabel="RPM" yLabel="hp / Nm" height={220} />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span className="flex items-center gap-1"><span className="h-2 w-3 bg-accent-400 rounded-sm" />Power</span>
            <span className="flex items-center gap-1"><span className="h-2 w-3 bg-warn-500 rounded-sm" />Torque</span>
          </div>
        </Section>
        <Section title="Performance Metrics" icon={<Gauge size={16} />}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <StatTile label="0-60 mph" value={sim.accel0_60} unit="s" accent={sim.accel0_60 < 3 ? "ok" : "default"} />
            <StatTile label="Top Speed" value={sim.topSpeed} unit="km/h" accent="accent" />
            <StatTile label="Quarter Mile" value={sim.quarterMile} unit="s" sub={`${sim.quarterMileSpeed} km/h`} />
            <StatTile label="Lateral G" value={sim.lateralG} unit="g" accent="accent" />
            <StatTile label="Braking" value={sim.brakingDist} unit="m" accent={sim.brakingDist < 34 ? "ok" : "default"} />
            <StatTile label="PWR" value={(sim.peakPower / (sim.weight / 1000)).toFixed(0)} unit="hp/t" accent="accent" />
          </div>
        </Section>
      </div>

      {/* Aero + Thermal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Aerodynamics" icon={<Wind size={16} />}>
          <LineChart series={dragSeries} xLabel="Speed" xUnit="km/h" yLabel="Force" yUnit="N" height={180} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            <StatTile label="Drag Cd" value={sim.dragCoeff.toFixed(3)} accent="accent" />
            <StatTile label="Lift Cl" value={sim.liftCoeff.toFixed(3)} accent={sim.liftCoeff < 0 ? "ok" : "warn"} />
            <StatTile label="Downforce" value={sim.downforce} unit="N" accent="accent" />
            <StatTile label="Aero Balance" value={`${(sim.aeroBalance * 100).toFixed(0)}%`} unit="F" />
          </div>
        </Section>
        <Section title="Thermal & Electrical" icon={<Thermometer size={16} />}>
          <div className="space-y-3">
            <SystemBar label="Cooling Margin" value={sim.coolingMargin} good={0.5} icon={<Thermometer size={12} />} />
            <SystemBar label="Brake Cooling" value={sim.brakeCooling} good={0.5} icon={<Activity size={12} />} />
            <SystemBar label="Cooling Efficiency" value={sim.coolingEfficiency} good={0.7} icon={<Wind size={12} />} />
            {sim.isElectric || sim.isHybrid ? (
              <>
                <SystemBar label="Battery Health" value={0.85} good={0.7} icon={<Battery size={12} />} />
                <SystemBar label="Regen Efficiency" value={sim.regenEfficiency} good={0.7} icon={<Zap size={12} />} />
              </>
            ) : null}
            <SystemBar label="Electrical Load" value={clamp(sim.infotainment.powerDraw / 200, 0, 1)} good={0.4} invert icon={<Zap size={12} />} />
          </div>
        </Section>
      </div>

      {/* Chassis + Suspension */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Chassis & Structure" icon={<Layers size={16} />}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <StatTile label="Chassis" value={chassis.label} />
            <StatTile label="Rigidity" value={`${(chassis.rigidityFactor * 100).toFixed(0)}%`} accent={chassis.rigidityFactor > 0.85 ? "ok" : "default"} />
            <StatTile label="CG Height" value={sim.cgHeight} unit="mm" />
            <StatTile label="Weight Dist." value={`${(sim.weightDistFront * 100).toFixed(0)}/${(100 - sim.weightDistFront * 100).toFixed(0)}`} unit="F/R" accent={Math.abs(sim.weightDistFront - 0.5) < 0.1 ? "ok" : "warn"} />
            <StatTile label="Safety Factor" value={`${(chassis.safetyFactor * 100).toFixed(0)}%`} accent="ok" />
            <StatTile label="Aero Weight" value={sim.aeroWeight} unit="kg" />
          </div>
        </Section>
        <Section title="Suspension Geometry" icon={<CircleDot size={16} />}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <StatTile label="Front Camber" value={design.vehicle.camberF} unit="°" />
            <StatTile label="Rear Camber" value={design.vehicle.camberR} unit="°" />
            <StatTile label="Front Toe" value={design.vehicle.toeF} unit="°" />
            <StatTile label="Rear Toe" value={design.vehicle.toeR} unit="°" />
            <StatTile label="Ride Height" value={design.vehicle.rideHeight} unit="mm" />
            <StatTile label="Spring F/R" value={`${design.vehicle.springRateF}/${design.vehicle.springRateR}`} unit="N/mm" />
          </div>
        </Section>
      </div>

      {/* Lap times + Cost */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Estimated Lap Times" icon={<Flag size={16} />}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            <StatTile label="Fastest" value={fastestLap ? formatLap(fastestLap.time) : "—"} sub={fastestLap?.trackName} accent="ok" />
            <StatTile label="Slowest" value={slowestLap ? formatLap(slowestLap.time) : "—"} sub={slowestLap?.trackName} />
            <StatTile label="Spread" value={fastestLap && slowestLap ? `${(slowestLap.time - fastestLap.time).toFixed(2)}s` : "—"} />
            <StatTile label="Tracks" value={sortedLaps.length} />
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {sortedLaps.slice(0, 6).map((lap, i) => (
              <div key={lap.trackId} className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-base-850/50">
                <span className="text-slate-400">{i + 1}. {lap.trackName}</span>
                <span className="font-mono text-accent-300">{formatLap(lap.time)}</span>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Production Cost & Manufacturing" icon={<DollarSign size={16} />}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            <StatTile label="Total Cost" value={`$${(sim.totalCost / 1000).toFixed(1)}k`} accent="accent" />
            <StatTile label="Target Price" value={`$${(sim.targetPrice / 1000).toFixed(1)}k`} />
            <StatTile label="Profit Margin" value={`${(sim.profitMargin * 100).toFixed(0)}%`} accent={sim.profitMargin > 0.25 ? "ok" : "warn"} />
            <StatTile label="Production Time" value={sim.manufacturing.productionTime.toFixed(1)} unit="hrs" />
            <StatTile label="Defect Rate" value={sim.manufacturing.defectRate.toFixed(1)} unit="/1k" accent={sim.manufacturing.defectRate < 2 ? "ok" : "warn"} />
            <StatTile label="Quality Score" value={sim.manufacturing.qualityScore.toFixed(0)} unit="/100" accent="ok" />
          </div>
          <div className="space-y-2">
            <CostBar label="Engine" value={sim.engineCost} total={sim.totalCost} color="#22d3ee" />
            <CostBar label="Body/Chassis" value={sim.vehicleCost - sim.engineCost} total={sim.totalCost} color="#f59e0b" />
            <CostBar label="Interior" value={sim.interiorCost} total={sim.totalCost} color="#22c55e" />
            <CostBar label="Manufacturing" value={sim.totalCost - sim.vehicleCost - sim.interiorCost} total={sim.totalCost} color="#a78bfa" />
          </div>
        </Section>
      </div>

      {/* Reliability + Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Reliability & Safety" icon={<ShieldCheck size={16} />}>
          <div className="space-y-3">
            <SystemBar label="Reliability" value={sim.reliability} good={0.8} icon={<ShieldCheck size={12} />} />
            <SystemBar label="Drivability" value={sim.drivability} good={0.7} icon={<Gauge size={12} />} />
            <SystemBar label="Crash Safety" value={sim.testing.crashTest.overall / 100} good={0.8} icon={<ShieldCheck size={12} />} />
            <div className="grid grid-cols-3 gap-2 pt-1">
              <StatTile label="Frontal" value={`${sim.testing.crashTest.frontalScore.toFixed(0)}`} unit="/100" accent={sim.testing.crashTest.frontalScore > 80 ? "ok" : "warn"} />
              <StatTile label="Side" value={`${sim.testing.crashTest.sideScore.toFixed(0)}`} unit="/100" accent={sim.testing.crashTest.sideScore > 80 ? "ok" : "warn"} />
              <StatTile label="Stars" value={sim.testing.crashTest.starRating} unit="★" accent="ok" />
            </div>
          </div>
        </Section>
        <Section title="Customer Satisfaction & Reviews" icon={<Star size={16} />}>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-base-850 border border-base-800">
              <div className="text-3xl font-bold text-accent-300 font-mono">{summary.overall.toFixed(1)}</div>
              <div className="flex-1">
                <div className="text-xs text-slate-400">Overall Review Score</div>
                <div className="flex gap-0.5 mt-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={12} className={s <= Math.round(summary.overall / 2) ? "text-warn-400 fill-warn-400" : "text-base-700"} />
                  ))}
                </div>
              </div>
              {summary.editorsChoice && (
                <span className="text-[10px] font-bold text-ok-400 bg-ok-500/10 border border-ok-500/30 px-2 py-1 rounded">EDITOR'S CHOICE</span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <ScoreTile label="Performance" value={summary.performance} />
              <ScoreTile label="Comfort" value={summary.comfort} />
              <ScoreTile label="Technology" value={summary.technology} />
              <ScoreTile label="Value" value={summary.value} />
            </div>
          </div>
        </Section>
      </div>

      {/* AI Recommendations */}
      <Section title="AI Recommendations — Next Steps" icon={<Bot size={16} />}>
        <div className="space-y-2">
          {recommendations.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-ok-400 py-3">
              <Check size={16} /> All systems nominal — no critical actions needed.
            </div>
          ) : (
            recommendations.map((r) => <RecommendationRow key={r.id} rec={r} />)
          )}
        </div>
      </Section>
    </div>
  );
}

// ---------- Analysis engine ----------

function analyzeDesign(design: VehicleDesign, sim: SimResult): Recommendation[] {
  const recs: Recommendation[] = [];
  const e = design.engine;

  // Engine
  if (sim.knockRisk > 0.6) {
    recs.push({
      id: "knock", priority: "critical", category: "Engine",
      title: "Reduce knock risk",
      detail: `Knock risk at ${(sim.knockRisk * 100).toFixed(0)}%. Lower compression ratio or boost pressure to protect the engine.`,
      metric: `${(sim.knockRisk * 100).toFixed(0)}%`, target: "<40%",
    });
  }
  if (sim.coolingMargin < 0.4) {
    recs.push({
      id: "cooling", priority: "high", category: "Engine",
      title: "Improve cooling capacity",
      detail: `Cooling margin is ${(sim.coolingMargin * 100).toFixed(0)}%. Increase radiator size or add oil cooler.`,
      metric: `${(sim.coolingMargin * 100).toFixed(0)}%`, target: ">50%",
    });
  }
  if (sim.turboLag > 0.6 && e.intake !== "na") {
    recs.push({
      id: "lag", priority: "medium", category: "Engine",
      title: "Reduce turbo lag",
      detail: `Turbo lag is ${sim.turboLag.toFixed(2)}s. Consider bi-turbo or compound turbo for better response.`,
      metric: `${sim.turboLag.toFixed(2)}s`, target: "<0.4s",
    });
  }
  if (sim.maxPistonSpeed > 24) {
    recs.push({
      id: "piston", priority: "high", category: "Engine",
      title: "High piston speed",
      detail: `Max piston speed ${sim.maxPistonSpeed.toFixed(1)} m/s threatens reliability. Reduce stroke or lower redline.`,
      metric: `${sim.maxPistonSpeed.toFixed(1)} m/s`, target: "<24 m/s",
    });
  }

  // Aero
  if (sim.dragCoeff > 0.42) {
    recs.push({
      id: "drag", priority: "high", category: "Aero",
      title: "Reduce drag coefficient",
      detail: `Cd of ${sim.dragCoeff.toFixed(3)} is limiting top speed. Smooth body shape, add wheel covers, or reduce wing angle.`,
      metric: `${sim.dragCoeff.toFixed(3)}`, target: "<0.38",
    });
  }
  if (sim.separationRisk > 0.55) {
    recs.push({
      id: "separation", priority: "critical", category: "Aero",
      title: "Flow separation risk",
      detail: `Separation risk at ${(sim.separationRisk * 100).toFixed(0)}%. Reduce diffuser angle or wing AoA.`,
      metric: `${(sim.separationRisk * 100).toFixed(0)}%`, target: "<45%",
    });
  }
  if (sim.aeroBalance < 0.42 || sim.aeroBalance > 0.62) {
    recs.push({
      id: "balance", priority: "high", category: "Aero",
      title: sim.aeroBalance < 0.42 ? "Add front downforce" : "Add rear downforce",
      detail: `Aero balance at ${(sim.aeroBalance * 100).toFixed(0)}% front. ${sim.aeroBalance < 0.42 ? "Increase splitter or front wing." : "Increase rear wing angle."}`,
      metric: `${(sim.aeroBalance * 100).toFixed(0)}% F`, target: "45-55% F",
    });
  }

  // Weight & Chassis
  if (sim.weight > 1800) {
    recs.push({
      id: "weight", priority: "high", category: "Chassis",
      title: "Reduce vehicle weight",
      detail: `Weight of ${sim.weight} kg hurts acceleration and handling. Consider lighter chassis or strip interior.`,
      metric: `${sim.weight} kg`, target: "<1600 kg",
    });
  }
  if (Math.abs(sim.weightDistFront - 0.5) > 0.1) {
    recs.push({
      id: "dist", priority: "medium", category: "Chassis",
      title: "Balance weight distribution",
      detail: `Weight distribution is ${(sim.weightDistFront * 100).toFixed(0)}% front. Use ballast to approach 50/50.`,
      metric: `${(sim.weightDistFront * 100).toFixed(0)}% F`, target: "~50% F",
    });
  }

  // Cost
  if (sim.totalCost > 90000) {
    recs.push({
      id: "cost", priority: sim.profitMargin < 0.15 ? "critical" : "high", category: "Cost",
      title: "Reduce production cost",
      detail: `Total cost $${(sim.totalCost / 1000).toFixed(1)}k is high. Simplify manufacturing or reduce exotic materials.`,
      metric: `$${(sim.totalCost / 1000).toFixed(0)}k`, target: "<$80k",
    });
  }
  if (sim.profitMargin < 0.15 && sim.profitMargin > 0) {
    recs.push({
      id: "margin", priority: "high", category: "Cost",
      title: "Improve profit margin",
      detail: `Margin at ${(sim.profitMargin * 100).toFixed(0)}%. Raise target price or cut costs.`,
      metric: `${(sim.profitMargin * 100).toFixed(0)}%`, target: ">25%",
    });
  }

  // Manufacturing
  if (sim.manufacturing.defectRate > 5) {
    recs.push({
      id: "defects", priority: "medium", category: "Manufacturing",
      title: "Reduce defect rate",
      detail: `Defect rate ${sim.manufacturing.defectRate.toFixed(1)}/1000. Increase automation or QC level.`,
      metric: `${sim.manufacturing.defectRate.toFixed(1)}/1k`, target: "<2/1k",
    });
  }

  // Reliability
  if (sim.reliability < 0.65) {
    recs.push({
      id: "reliability", priority: "high", category: "Reliability",
      title: "Improve reliability",
      detail: `Reliability at ${(sim.reliability * 100).toFixed(0)}%. Reduce boost, improve cooling, or upgrade internals.`,
      metric: `${(sim.reliability * 100).toFixed(0)}%`, target: ">80%",
    });
  }

  // Performance
  if (sim.accel0_60 > 5) {
    recs.push({
      id: "accel", priority: "medium", category: "Performance",
      title: "Improve acceleration",
      detail: `0-60 in ${sim.accel0_60.toFixed(1)}s. Increase power, reduce weight, or improve launch control.`,
      metric: `${sim.accel0_60.toFixed(1)}s`, target: "<4s",
    });
  }
  if (sim.brakingDist > 40) {
    recs.push({
      id: "braking", priority: "medium", category: "Performance",
      title: "Improve braking distance",
      detail: `100-0 in ${sim.brakingDist.toFixed(0)}m. Larger discs, better pads, or stickier tires.`,
      metric: `${sim.brakingDist.toFixed(0)}m`, target: "<35m",
    });
  }

  // Sort by priority
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  recs.sort((a, b) => order[a.priority] - order[b.priority]);
  return recs;
}

function computeOverallHealth(sim: SimResult, reviewScore: number): number {
  const factors = [
    sim.reliability,
    sim.coolingMargin > 0.5 ? 1 : sim.coolingMargin * 2,
    1 - clamp(sim.knockRisk, 0, 1),
    1 - clamp(sim.separationRisk, 0, 1),
    sim.profitMargin > 0.25 ? 1 : clamp(sim.profitMargin / 0.25, 0, 1),
    clamp(1 - (sim.weight - 1000) / 1500, 0, 1),
    clamp(reviewScore / 10, 0, 1),
    sim.manufacturing.qualityScore / 100,
  ];
  return Math.round((factors.reduce((a, b) => a + b, 0) / factors.length) * 100);
}

// ---------- Sub-components ----------

function HealthGauge({ value }: { value: number }) {
  const color = value >= 75 ? "#22c55e" : value >= 50 ? "#f59e0b" : "#ef4444";
  const label = value >= 75 ? "Healthy" : value >= 50 ? "Needs Attention" : "Critical";
  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Vehicle Health</div>
        <div className="text-sm font-semibold" style={{ color }}>{label}</div>
      </div>
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="#1e2839" strokeWidth="3" />
          <circle cx="18" cy="18" r="15" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${(value / 100) * 94.2} 94.2`} strokeLinecap="round"
            className="transition-all duration-500" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold font-mono" style={{ color }}>{value}</span>
        </div>
      </div>
    </div>
  );
}

function SystemBar({ label, value, good, icon, invert }: {
  label: string; value: number; good: number; icon: React.ReactNode; invert?: boolean;
}) {
  const pct = Math.min(value * 100, 100);
  const isGood = invert ? value < good : value >= good;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="flex items-center gap-1.5 text-slate-400">{icon}{label}</span>
        <span className={`font-mono ${isGood ? "text-ok-400" : "text-warn-400"}`}>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-base-850 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${isGood ? "bg-ok-500" : "bg-warn-500"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function CostBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono text-slate-200">${(value / 1000).toFixed(1)}k <span className="text-slate-600">({pct.toFixed(0)}%)</span></span>
      </div>
      <div className="h-2.5 bg-base-850 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function ScoreTile({ label, value }: { label: string; value: number }) {
  const accent = value >= 8 ? "ok" : value >= 6 ? "accent" : value >= 4 ? "warn" : "danger";
  const colorMap = { ok: "text-ok-400", accent: "text-accent-300", warn: "text-warn-400", danger: "text-danger-400" };
  return (
    <div className="bg-base-850 border border-base-800 rounded-lg px-3 py-2 text-center">
      <div className="label-mono mb-0.5">{label}</div>
      <div className={`font-mono text-lg font-bold ${colorMap[accent]}`}>{value.toFixed(1)}</div>
    </div>
  );
}

function AlertCard({ rec }: { rec: Recommendation }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-lg border border-danger-500/30 bg-danger-500/10">
      <AlertTriangle size={14} className="text-danger-400 mt-0.5 shrink-0" />
      <div className="flex-1">
        <div className="text-xs font-semibold text-danger-300">{rec.title}</div>
        <div className="text-[11px] text-slate-400 mt-0.5">{rec.detail}</div>
      </div>
    </div>
  );
}

function RecommendationRow({ rec }: { rec: Recommendation }) {
  const priorityConfig = {
    critical: { color: "text-danger-300 bg-danger-500/10 border-danger-500/30", dot: "bg-danger-500" },
    high: { color: "text-warn-300 bg-warn-500/10 border-warn-500/30", dot: "bg-warn-500" },
    medium: { color: "text-accent-300 bg-accent-500/10 border-accent-500/30", dot: "bg-accent-500" },
    low: { color: "text-slate-300 bg-base-800 border-base-700", dot: "bg-slate-500" },
  };
  const cfg = priorityConfig[rec.priority];
  return (
    <div className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border ${cfg.color}`}>
      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-200">{rec.title}</span>
          <span className="text-[10px] uppercase tracking-wider opacity-70">{rec.category}</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5">{rec.detail}</div>
      </div>
      <div className="flex items-center gap-2 shrink-0 text-right">
        <div>
          <div className="text-[10px] text-slate-600 uppercase">Current</div>
          <div className="font-mono text-xs text-slate-300">{rec.metric}</div>
        </div>
        <ArrowRight size={12} className="text-slate-600" />
        <div>
          <div className="text-[10px] text-slate-600 uppercase">Target</div>
          <div className="font-mono text-xs text-ok-400">{rec.target}</div>
        </div>
      </div>
    </div>
  );
}
