import React, { useMemo, memo } from "react";
import {
  LayoutDashboard, Wind, Battery, Zap, Thermometer, Layers,
  CircleDot, Flag, DollarSign, ShieldCheck, Star,
  Bot, TrendingUp, AlertTriangle, Check, ArrowRight, Gauge,
  Activity, Car, Fuel, Trophy, Warehouse, Target, Cog, Factory, Sofa,
} from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { useCompany } from "../state/CompanyContext";
import { Section, StatTile } from "./ui/Controls";
import { LineChart } from "./ui/LineChart";
import { PowerTorqueCurveChart } from "./ui/PowerTorqueCurveChart";
import { formatLap } from "../sim/utils/formatLap";
import { computeScores, computeSummary } from "../sim/reviews";
import { ENGINE_LAYOUTS, CHASSIS_TYPES, TIRE_COMPOUNDS } from "../sim/constants";
import type { SimResult, VehicleDesign } from "../sim/types";
import { ChassisHotspotViewer } from "./ChassisHotspotViewer";
import { LiquidGlassCard, LiquidButton } from "./ui/LiquidGlass";
import { useCommandCenterAnime } from "./ui/AnimeCommandCenterFX";

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

interface CommandCenterProps {
  onSelectStage?: (stage: string) => void;
}

function CommandCenterComponent({ onSelectStage }: CommandCenterProps = {}) {
  const { design, sim, carConcept, setCarConcept, uiTheme, setUiTheme } = useDesign();
  const { company } = useCompany();
  const scores = useMemo(() => computeScores(design, sim), [design, sim]);
  const summary = useMemo(() => computeSummary(scores), [scores]);

  const recommendations = useMemo<Recommendation[]>(
    () => analyzeDesign(design, sim),
    [design, sim],
  );

  const dragSeries = useMemo(() => [
    { data: sim.dragVsSpeed.map((d) => ({ x: d.speed, y: d.drag })), color: "#fbbf24", fill: true },
    { data: sim.dragVsSpeed.map((d) => ({ x: d.speed, y: d.downforce })), color: "#22c55e" },
  ], [sim.dragVsSpeed]);

  const sortedLaps = useMemo(() => [...sim.lapTimes].sort((a, b) => a.time - b.time), [sim.lapTimes]);
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

  const containerRef = useCommandCenterAnime(`${carConcept}-${uiTheme}`);

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Interactive Telemetry Chassis Blueprint */}
      <div className="cmd-animate-tile">
        <ChassisHotspotViewer onSelectStage={onSelectStage} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Vehicle Concept Philosophy Selection Card */}
        <div className="cmd-animate-tile panel border border-amber-500/40 rounded-2xl p-5 shadow-[0_0_30px_rgba(34,211,238,0.15)] relative overflow-hidden">
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                <Target size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">VEHICLE CONCEPT INTENT</span>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full">AI TUNER ACTIVE</span>
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
                { id: "luxury", label: "Luxury Focused", desc: "Supreme NVH, leather & comfort score", color: "border-amber-500/40 text-amber-300 bg-amber-500/10" },
                { id: "balanced", label: "Balanced Build", desc: "All-round engineering harmony", color: "border-amber-500/40 text-amber-300 bg-amber-500/10" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCarConcept(c.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    carConcept === c.id
                      ? `${c.color} shadow-[0_0_15px_rgba(34,211,238,0.2)] ring-1 ring-amber-400`
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

        {/* Global UI Theme Selection Card */}
        <div className="cmd-animate-tile panel border border-amber-500/40 rounded-2xl p-5 shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden">
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <Wind size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">GLOBAL UI SETTINGS</span>
                </div>
                <h2 className="text-lg font-bold text-slate-100">Select Interface Theme</h2>
                <p className="text-xs text-slate-400">Personalize your workspace aesthetics. More themes are in development!</p>
              </div>
            </div>

            {/* Theme Option Cards */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "theme1", label: "UI 1", desc: "Kinetic Horizon — AnimMaster & HorizonX Design", color: "border-amber-500/40 text-amber-300 bg-amber-500/10", activeShadow: "shadow-[0_0_15px_rgba(34,211,238,0.2)] ring-1 ring-amber-400" },
                { id: "theme2", label: "Theme 2", desc: "Cosmic Nebula — Deep Purple Sci-Fi", color: "border-amber-500/40 text-amber-300 bg-amber-500/10", activeShadow: "shadow-[0_0_15px_rgba(168,85,247,0.25)] ring-1 ring-purple-400" },
                { id: "theme3", label: "Theme 3", desc: "Nordic Light Glass — Alabaster White", color: "border-sky-500/40 text-amber-400 bg-amber-500/15", activeShadow: "shadow-[0_0_15px_rgba(14,165,233,0.2)] ring-1 ring-sky-400" },
                { id: "theme4", label: "Vision Glass", desc: "Spatial Glass Lounge (Default)", color: "border-sky-300/40 text-sky-200 bg-amber-500/15", activeShadow: "shadow-[0_0_15px_rgba(147,197,253,0.15)] ring-1 ring-sky-300" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setUiTheme(t.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    uiTheme === t.id
                      ? `${t.color} ${t.activeShadow}`
                      : "bg-base-950/60 border-white/5 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div className="text-xs font-bold font-mono uppercase mb-0.5">{t.label}</div>
                  <div className="text-[10px] text-slate-500 leading-tight">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Company Status Strip */}
      <div className="cmd-animate-tile grid grid-cols-3 sm:grid-cols-6 gap-2">
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
          <Star size={12} className="mx-auto text-amber-400 mb-1" />
          <div className="font-mono text-sm text-amber-400">{company.reputation}</div>
          <div className="text-[9px] text-slate-600">Reputation</div>
        </div>
        <div className="bg-base-900 border border-base-800 rounded-xl p-3 text-center hover:border-base-700 transition-all">
          <Activity size={12} className="mx-auto text-amber-400 mb-1" />
          <div className="font-mono text-sm text-amber-400">Mo.{company.economy.month}</div>
          <div className="text-[9px] text-slate-600">Game Month</div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="cmd-animate-tile panel p-5 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top right, rgba(245,158,11,0.25), transparent 60%)" }} />
        <div className="relative flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <LayoutDashboard size={24} className="text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">REAL-TIME TELEMETRY</span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE STREAM
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-100">Central Engineering Dashboard</h2>
              <p className="text-xs text-slate-400">Real-time command center — updates instantly with every lab change</p>
            </div>
          </div>
          <div className="flex-1" />
          <HealthGauge value={overallHealth} />
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-mono text-[11px]">Apex Spatial Engine v2.4 • 60 FPS Physics Loop</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">Optimum Balance Index: {(overallHealth * 100).toFixed(0)}%</span>
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
      <div className="cmd-animate-tile">
        <Section title="Vehicle Specifications" icon={<Car size={16} />}>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            <StatTile label="Architecture" value={layout.label} icon={<Cog size={11} className="text-amber-400 shrink-0" />} />
            <StatTile label="Displacement" value={sim.displacement} unit="cc" icon={<Fuel size={11} className="text-amber-400 shrink-0" />} />
            <StatTile label="Chassis" value={chassis.label} icon={<Car size={11} className="text-amber-400 shrink-0" />} />
            <StatTile label="Tire" value={tire.label} icon={<CircleDot size={11} className="text-emerald-400 shrink-0" />} />
            <StatTile label="Weight" value={sim.weight} unit="kg" accent="accent" icon={<Zap size={11} className="text-amber-400 shrink-0" />} />
            <StatTile label="Power" value={sim.peakPower} unit="hp" accent="accent" icon={<Gauge size={11} className="text-amber-400 shrink-0" />} />
          </div>
        </Section>
      </div>

      {/* Performance + Curves */}
      <div className="cmd-animate-tile grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Power & Torque Curves" icon={<TrendingUp size={16} />}>
          <PowerTorqueCurveChart powerCurve={sim.powerCurve} height={220} />
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
      <div className="cmd-animate-tile grid grid-cols-1 lg:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            <StatTile label="Chassis" value={chassis.label} />
            <StatTile label="CG Height" value={sim.cgHeight} unit="mm" />
            <StatTile label="Aero Weight" value={sim.aeroWeight} unit="kg" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-base-800 border border-base-700/50 rounded-xl p-3 flex flex-col items-center">
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Rigidity</div>
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#1e293b" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none"
                    stroke={chassis.rigidityFactor > 0.85 ? "#10b981" : "#f59e0b"}
                    strokeWidth="3" strokeLinecap="round"
                    strokeDasharray="94.2" strokeDashoffset={94.2 * (1 - chassis.rigidityFactor)} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-sm font-bold text-slate-100">{(chassis.rigidityFactor * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
            <div className="bg-base-800 border border-base-700/50 rounded-xl p-3">
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Weight Distribution F/R</div>
              <div className="flex h-6 rounded-lg overflow-hidden border border-base-700/50">
                <div className="flex items-center justify-center text-[10px] font-mono font-bold text-white transition-all duration-500"
                  style={{ width: (sim.weightDistFront * 100) + "%", background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2)" }}>
                  {(sim.weightDistFront * 100).toFixed(0)}%
                </div>
                <div className="flex items-center justify-center text-[10px] font-mono font-bold text-white transition-all duration-500"
                  style={{ width: ((1 - sim.weightDistFront) * 100) + "%", background: "linear-gradient(135deg, #fbbf24, #0891b2)", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2)" }}>
                  {(100 - sim.weightDistFront * 100).toFixed(0)}%
                </div>
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-slate-500 font-mono"><span>Front</span><span>Rear</span></div>
            </div>
          </div>
          <div className="mt-3 bg-base-800 border border-base-700/50 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-300"><ShieldCheck size={12} className="text-emerald-400" />Safety Factor</span>
              <span className="font-mono text-sm font-bold text-emerald-400">{(chassis.safetyFactor * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2.5 bg-base-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: (chassis.safetyFactor * 100) + "%", background: "linear-gradient(90deg, #059669, #10b981)", boxShadow: "0 0 8px rgba(16,185,129,0.3)" }} />
            </div>
          </div>
        </Section>
        <Section title="Suspension Geometry" icon={<CircleDot size={16} />}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            <StatTile label="Ride Height" value={design.vehicle.rideHeight} unit="mm" />
            <StatTile label="Spring F/R" value={design.vehicle.springRateF + "/" + design.vehicle.springRateR} unit="N/mm" />
          </div>
          <div className="bg-base-800 border border-base-700/50 rounded-xl p-4">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">Wheel Alignment Overview</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-[10px] text-amber-400 font-semibold uppercase mb-2">Front Axle</div>
                <div className="flex justify-center gap-3">
                  <div className="flex flex-col items-center">
                    <svg width="28" height="60" viewBox="0 0 28 60">
                      <rect x="10" y="2" width="8" height="56" rx="3" fill="#334155" stroke="#475569" strokeWidth="1" />
                      <line x1="14" y1="0" x2={14 + Math.tan(design.vehicle.camberF * Math.PI / 180) * 56} y2="58" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                    </svg>
                    <div className="font-mono text-[10px] text-amber-300 mt-1">{design.vehicle.camberF}°</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <svg width="28" height="60" viewBox="0 0 28 60">
                      <rect x="10" y="2" width="8" height="56" rx="3" fill="#334155" stroke="#475569" strokeWidth="1" />
                      <line x1="14" y1="0" x2={14 - Math.tan(design.vehicle.camberF * Math.PI / 180) * 56} y2="58" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                    </svg>
                    <div className="font-mono text-[10px] text-amber-300 mt-1">{design.vehicle.camberF}°</div>
                  </div>
                </div>
                <div className="text-[9px] text-slate-500 mt-1">Toe: {design.vehicle.toeF}°</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-amber-400 font-semibold uppercase mb-2">Rear Axle</div>
                <div className="flex justify-center gap-3">
                  <div className="flex flex-col items-center">
                    <svg width="28" height="60" viewBox="0 0 28 60">
                      <rect x="10" y="2" width="8" height="56" rx="3" fill="#334155" stroke="#475569" strokeWidth="1" />
                      <line x1="14" y1="0" x2={14 + Math.tan(design.vehicle.camberR * Math.PI / 180) * 56} y2="58" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                    </svg>
                    <div className="font-mono text-[10px] text-amber-300 mt-1">{design.vehicle.camberR}°</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <svg width="28" height="60" viewBox="0 0 28 60">
                      <rect x="10" y="2" width="8" height="56" rx="3" fill="#334155" stroke="#475569" strokeWidth="1" />
                      <line x1="14" y1="0" x2={14 - Math.tan(design.vehicle.camberR * Math.PI / 180) * 56} y2="58" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                    </svg>
                    <div className="font-mono text-[10px] text-amber-300 mt-1">{design.vehicle.camberR}°</div>
                  </div>
                </div>
                <div className="text-[9px] text-slate-500 mt-1">Toe: {design.vehicle.toeR}°</div>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* Lap times + Cost */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Estimated Lap Times" icon={<Flag size={16} />}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            <StatTile label="Fastest" value={fastestLap ? formatLap(fastestLap.time) : "—"} sub={fastestLap?.trackName} accent="ok" />
            <StatTile label="Slowest" value={slowestLap ? formatLap(slowestLap.time) : "—"} sub={slowestLap?.trackName} />
            <StatTile label="Spread" value={fastestLap && slowestLap ? (slowestLap.time - fastestLap.time).toFixed(2) + "s" : "—"} />
            <StatTile label="Tracks" value={sortedLaps.length} />
          </div>
          <div className="space-y-1.5 max-h-52 overflow-y-auto">
            {sortedLaps.slice(0, 8).map((lap, i) => {
              const maxT = slowestLap?.time || 1;
              const minT = fastestLap?.time || 0;
              const range = maxT - minT || 1;
              const barPct = 40 + ((lap.time - minT) / range) * 60;
              const grads = ["linear-gradient(90deg,#f59e0b,#fbbf24)","linear-gradient(90deg,#94a3b8,#cbd5e1)","linear-gradient(90deg,#d97706,#f59e0b)","linear-gradient(90deg,#64748b,#94a3b8)","linear-gradient(90deg,#475569,#64748b)","linear-gradient(90deg,#334155,#475569)","linear-gradient(90deg,#1e293b,#334155)","linear-gradient(90deg,#1a1008,#1e293b)"];
              return (
                <div key={lap.trackId} className="group flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-base-800/80 transition-colors">
                  <span className="font-mono text-xs text-slate-500 w-4 text-right shrink-0">{i + 1}</span>
                  <Flag size={10} className={i === 0 ? "text-amber-400" : "text-slate-600"} />
                  <span className="text-xs text-slate-400 flex-1 truncate min-w-0">{lap.trackName}</span>
                  <div className="w-24 h-2 bg-base-800 rounded-full overflow-hidden shrink-0">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: barPct + "%", background: grads[i] || grads[7], boxShadow: i === 0 ? "0 0 8px rgba(245,158,11,0.4)" : "none" }} />
                  </div>
                  <span className={"font-mono text-xs font-bold shrink-0 " + (i === 0 ? "text-amber-300" : "text-slate-300")}>{formatLap(lap.time)}</span>
                </div>
              );
            })}
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
            <CostBar label="Engine" value={sim.engineCost} total={sim.totalCost} color="#fbbf24" icon={<Cog size={13} className="text-amber-400 shrink-0" />} />
            <CostBar label="Body/Chassis" value={sim.vehicleCost - sim.engineCost} total={sim.totalCost} color="#f59e0b" icon={<Car size={13} className="text-amber-400 shrink-0" />} />
            <CostBar label="Interior" value={sim.interiorCost} total={sim.totalCost} color="#22c55e" icon={<Sofa size={13} className="text-emerald-400 shrink-0" />} />
            <CostBar label="Manufacturing" value={sim.totalCost - sim.vehicleCost - sim.interiorCost} total={sim.totalCost} color="#a78bfa" icon={<Factory size={13} className="text-amber-400 shrink-0" />} />
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
      id: "defects", priority: "high", category: "Quality",
      title: "High defect rate",
      detail: `Defect rate at ${sim.manufacturing.defectRate.toFixed(1)}/1k. Upgrade factory automation or simplify tooling.`,
      metric: `${sim.manufacturing.defectRate.toFixed(1)}/1k`, target: "<2.0/1k",
    });
  }
  if (sim.manufacturing.qualityScore < 60) {
    recs.push({
      id: "quality", priority: "medium", category: "Quality",
      title: "Low quality score",
      detail: `Quality score ${sim.manufacturing.qualityScore.toFixed(0)}/100. Invest in QA or better components.`,
      metric: `${sim.manufacturing.qualityScore.toFixed(0)}/100`, target: ">75/100",
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
  const grad = isGood ? "linear-gradient(90deg, #059669, #10b981, #34d399)" : "linear-gradient(90deg, #d97706, #f59e0b, #fbbf24)";
  const glow = isGood ? "rgba(16,185,129,0.4)" : "rgba(245,158,11,0.4)";
  return (
    <div className="group">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="flex items-center gap-1.5 text-slate-300 font-medium">{icon}{label}</span>
        <span className={"font-mono font-bold text-sm " + (isGood ? "text-emerald-400" : "text-amber-400")}>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-3.5 bg-base-800 rounded-full overflow-hidden border border-base-700/50 shadow-inner relative">
        <div className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden group-hover:brightness-110"
          style={{ width: pct + "%", background: grad, boxShadow: "0 0 12px " + glow + ", inset 0 1px 1px rgba(255,255,255,0.2)" }}>
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
        </div>
      </div>
    </div>
  );
}

function CostBar({ label, value, total, color, icon }: { label: string; value: number; total: number; color: string; icon?: React.ReactNode }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="group">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="flex items-center gap-1.5 text-slate-300 font-medium">{icon}<span>{label}</span></span>
        <span className="font-mono text-slate-200 font-semibold">{"$" + (value/1000).toFixed(1) + "k"} <span className="text-slate-500 text-[10px]">({"(" + pct.toFixed(0) + "%"})</span></span>
      </div>
      <div className="h-3.5 bg-base-800 rounded-full overflow-hidden border border-base-700/50 shadow-inner">
        <div className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden group-hover:brightness-110"
          style={{ width: pct + "%", background: "linear-gradient(90deg, "+color+", "+color+"dd)", boxShadow: "0 0 10px "+color+"66, inset 0 1px 1px rgba(255,255,255,0.15)" }}>
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
        </div>
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

export const CommandCenter = memo(CommandCenterComponent);
export default CommandCenter;
