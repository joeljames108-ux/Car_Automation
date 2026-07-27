import { useState, useMemo } from "react";
import { Cog, Zap, Gauge, Thermometer, DollarSign, Battery, Activity, Bot, AlertTriangle, Lightbulb, Check, Info, X, Flame, Wrench, Target, Leaf, TrendingUp } from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { Section, Slider, Select, Toggle, StatTile } from "./ui/Controls";
import { LineChart } from "./ui/LineChart";
import { ENGINE_LAYOUTS, CRANK_MATERIALS, PISTON_TYPES, VALVETRAIN_TYPES, INTAKE_TYPES, FUEL_SYSTEMS, BATTERY_CHEMISTRIES, EV_MOTOR_TYPES, HYBRID_DEPLOY_MODES, MGU_H_MODES, HYBRID_ARCHITECTURES, MOTOR_PLACEMENTS } from "../sim/constants";
import type { EngineLayout, CrankMaterial, PistonType, ValvetrainType, IntakeType, FuelSystemType, EngineConfig } from "../sim/types";

// Engine layout → icon mapping
const LAYOUT_ICONS: Record<string, React.ReactNode> = {
  i3: <Cog size={11} />,
  i4: <Cog size={11} />,
  i6: <Cog size={11} />,
  v6: <Cog size={11} />,
  v8: <Cog size={11} />,
  v10: <Cog size={11} />,
  v12: <Cog size={11} />,
  boxer4: <Cog size={11} />,
  boxer6: <Cog size={11} />,
  rotary: <Flame size={11} />,
  hybrid: <Zap size={11} />,
  electric: <Zap size={11} />,
};

type Philosophy = "track" | "budget" | "luxury" | "balanced";
type SkillLevel = "beginner" | "intermediate" | "expert";
type OptimizeGoal = "performance" | "cost" | "reliability" | "efficiency" | "luxury";

export function EngineDesigner() {
  const { design, sim, updateEngine } = useDesign();
  const eng = design.engine;
  const isElectric = eng.layout === "electric";
  const isHybrid = eng.layout === "hybrid" || eng.hybridArchitecture !== "none" || eng.hasMguH;
  const isForced = eng.intake !== "na";

  const [philosophy, setPhilosophy] = useState<Philosophy>("balanced");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("intermediate");
  const [optimizeGoal, setOptimizeGoal] = useState<OptimizeGoal>("performance");
  const [dismissedWarnings, setDismissedWarnings] = useState<string[]>([]);

  // Power & Torque chart — pink/magenta torque + teal power with dual fill
  const powerSeries = [
    { data: sim.powerCurve.map((p) => ({ x: p.rpm, y: p.power })), color: "#22d3ee", fill: true },
    { data: sim.powerCurve.map((p) => ({ x: p.rpm, y: p.torque })), color: "#e879a0", fill: true },
  ];

  // Generate live warnings based on sim
  const warnings = useMemo(() => {
    const w: { id: string; category: string; text: string }[] = [];
    if (sim.knockRisk > 0.5) w.push({ id: "knock", category: "Engine", text: "Knock risk is critically high — reduce compression or timing" });
    if (sim.thermalEfficiency < 0.25 && !isElectric) w.push({ id: "thermal", category: "Engine", text: "Thermal efficiency below 25% — consider optimizing AFR or timing" });
    if (sim.engineCost > 150000) w.push({ id: "cost", category: "Manufacturing", text: "Cost too high for target market" });
    if (sim.reliability < 0.6) w.push({ id: "reliability", category: "Engine", text: "Reliability below 60% — engine may not pass durability tests" });
    if (sim.noise > 95) w.push({ id: "noise", category: "Engine", text: "Noise exceeds 95dB — may fail regulatory requirements" });
    return w.filter(w => !dismissedWarnings.includes(w.id));
  }, [sim, isElectric, dismissedWarnings]);

  // AI Suggestion based on current state
  const suggestion = useMemo(() => {
    if (sim.engineCost > 100000 && !isElectric) {
      return {
        title: "Reduce wheel diameter by 1 inch",
        detail: "Smaller wheels lower tire and rim cost with minimal performance impact.",
        impacts: [
          { label: "Cost", delta: "-$500", tone: "good" as const },
          { label: "Ride comfort", delta: "+5%", tone: "caution" as const },
        ],
      };
    }
    if (sim.knockRisk > 0.3) {
      return {
        title: "Lower compression ratio by 0.5",
        detail: "Reducing compression will decrease knock risk without significant power loss.",
        impacts: [
          { label: "Knock Risk", delta: "-15%", tone: "good" as const },
          { label: "Power", delta: "-3hp", tone: "caution" as const },
        ],
      };
    }
    return {
      title: "Enable start-stop system",
      detail: "Automatic start-stop saves fuel in city driving with minimal added cost.",
      impacts: [
        { label: "Fuel Economy", delta: "-0.6 L/100km", tone: "good" as const },
        { label: "Cost", delta: "+$200", tone: "caution" as const },
      ],
    };
  }, [sim, isElectric]);

  const engineLayouts = Object.keys(ENGINE_LAYOUTS) as EngineLayout[];

  return (
    <div className="engine-theme">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4 stagger">
          {/* Architecture Section */}
          <Section title="Architecture" icon={<Cog size={16} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label-mono mb-1.5 block">Engine Type</label>
                {/* Custom Engine Choice Grid with Icons */}
                <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                  {engineLayouts.map((layout) => (
                    <button
                      key={layout}
                      onClick={() => updateEngine({ layout })}
                      className={`engine-choice-btn ${eng.layout === layout ? "active" : ""}`}
                    >
                      <span className="engine-choice-icon">
                        {LAYOUT_ICONS[layout] || <Cog size={11} />}
                      </span>
                      {ENGINE_LAYOUTS[layout].label}
                    </button>
                  ))}
                </div>
              </div>
              {!isElectric && (
                <>
                  <Slider label="Bore" value={eng.bore} min={60} max={110} unit="mm" onChange={(v) => updateEngine({ bore: v })} />
                  <Slider label="Stroke" value={eng.stroke} min={60} max={110} unit="mm" onChange={(v) => updateEngine({ stroke: v })} />
                  <Slider label="Rod Length" value={eng.rodLength} min={100} max={220} unit="mm" onChange={(v) => updateEngine({ rodLength: v })} />
                  <Slider label="Compression Ratio" value={eng.compressionRatio} min={8} max={16} step={0.1} format={(v) => `${v}:1`} onChange={(v) => updateEngine({ compressionRatio: v })} />
                </>
              )}
            </div>
          </Section>

          {!isElectric && (
            <>
              {/* Internals with AI Engineer Card */}
              <Section title="Internals" icon={<Cog size={16} />}>
                {/* AI Engineer Persona */}
                <div className="ai-engineer-card mb-3">
                  <div className="ai-engineer-avatar">
                    <Bot size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-purple-200">Apex AI Engineer</div>
                    <div className="text-[10px] text-purple-400/70">Chief Engineer · Intermediate</div>
                  </div>
                  {/* Philosophy toggles */}
                  <div className="ml-auto flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-1">
                      <span className="text-[9px] text-purple-400/60 uppercase tracking-wider mr-1">Philosophy:</span>
                      <div className="engine-toggle-bar">
                        {(["budget", "track", "luxury", "balanced"] as Philosophy[]).map((p) => (
                          <button
                            key={p}
                            onClick={() => setPhilosophy(p)}
                            className={`engine-toggle-btn ${philosophy === p ? "active" : ""}`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Tool icons */}
                    <div className="flex items-center gap-1">
                      {[Wrench, Target, Cog, Flame].map((Icon, i) => (
                        <button key={i} className="p-1.5 rounded-lg text-purple-400/50 hover:text-purple-300 hover:bg-purple-500/10 transition-all">
                          <Icon size={13} />
                        </button>
                      ))}
                    </div>
                    {/* Skill level */}
                    <div className="engine-toggle-bar">
                      {(["beginner", "intermediate", "expert"] as SkillLevel[]).map((l) => (
                        <button
                          key={l}
                          onClick={() => setSkillLevel(l)}
                          className={`engine-toggle-btn ${skillLevel === l ? "active" : ""}`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                    <button className="p-1 text-purple-400/40 hover:text-purple-300 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Select<CrankMaterial> label="Crankshaft" value={eng.crank} options={(Object.keys(CRANK_MATERIALS) as CrankMaterial[]).map((c) => ({ value: c, label: CRANK_MATERIALS[c].label }))} onChange={(v) => updateEngine({ crank: v })} />
                  <Select<PistonType> label="Pistons" value={eng.pistons} options={(Object.keys(PISTON_TYPES) as PistonType[]).map((p) => ({ value: p, label: PISTON_TYPES[p].label }))} onChange={(v) => updateEngine({ pistons: v })} />
                  <Select<ValvetrainType> label="Valvetrain" value={eng.valvetrain} options={(Object.keys(VALVETRAIN_TYPES) as ValvetrainType[]).map((v) => ({ value: v, label: VALVETRAIN_TYPES[v].label }))} onChange={(v) => updateEngine({ valvetrain: v })} />
                  <Slider label="Cam Duration" value={eng.camDuration} min={240} max={340} unit="°" onChange={(v) => updateEngine({ camDuration: v })} />
                  <Slider label="Cam Lift" value={eng.camLift} min={6} max={16} step={0.5} unit="mm" onChange={(v) => updateEngine({ camLift: v })} />
                  <Slider label="Cam Timing" value={eng.camTiming} min={-10} max={10} step={0.5} unit="°" onChange={(v) => updateEngine({ camTiming: v })} />
                </div>
              </Section>

              {/* Live Warnings */}
              {warnings.length > 0 && (
                <div className="panel p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} className="text-amber-400" />
                    <span className="label-mono text-amber-300">Live Warnings</span>
                    <span className="text-[10px] text-purple-400/60 ml-1">{warnings.length} active</span>
                  </div>
                  <div className="space-y-1.5">
                    {warnings.map((w) => (
                      <div key={w.id} className="engine-warning-bar">
                        <span className="warning-dot" />
                        <span className="font-mono text-[10px] text-amber-400/70 uppercase tracking-wider">{w.category}</span>
                        <span className="flex-1 text-[11px]">{w.text}</span>
                        <button onClick={() => setDismissedWarnings(prev => [...prev, w.id])} className="text-red-400/50 hover:text-red-300 transition-colors">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Section title="Induction & Fuel" icon={<Zap size={16} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Select<IntakeType> label="Intake" value={eng.intake} options={(Object.keys(INTAKE_TYPES) as IntakeType[]).map((i) => ({ value: i, label: INTAKE_TYPES[i].label }))} onChange={(v) => updateEngine({ intake: v })} />
                  <Select<FuelSystemType> label="Fuel System" value={eng.fuelSystem} options={(Object.keys(FUEL_SYSTEMS) as FuelSystemType[]).map((f) => ({ value: f, label: FUEL_SYSTEMS[f].label }))} onChange={(v) => updateEngine({ fuelSystem: v })} />
                  {isForced && (
                    <>
                      <Slider label="Boost Pressure" value={eng.boostPressure} min={0} max={5} step={0.1} unit="bar" onChange={(v) => updateEngine({ boostPressure: v })} />
                      <Slider label="Intercooler Eff." value={eng.intercoolerEff} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => updateEngine({ intercoolerEff: v })} />
                    </>
                  )}
                  <Slider label="AFR" value={eng.afr} min={10} max={16} step={0.1} onChange={(v) => updateEngine({ afr: v })} />
                  <Slider label="Ignition Timing" value={eng.ignitionTiming} min={10} max={40} unit="°BTDC" onChange={(v) => updateEngine({ ignitionTiming: v })} />
                </div>
              </Section>

              <Section title="Cooling & Exhaust" icon={<Thermometer size={16} />}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Slider label="Radiator" value={eng.coolingRadiator} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => updateEngine({ coolingRadiator: v })} />
                  <Slider label="Oil Cooler" value={eng.coolingOilCooler} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => updateEngine({ coolingOilCooler: v })} />
                  <Slider label="Water Pump" value={eng.coolingWaterPump} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => updateEngine({ coolingWaterPump: v })} />
                  <Slider label="Fan Speed" value={eng.coolingFanSpeed} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => updateEngine({ coolingFanSpeed: v })} />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Slider label="Exhaust Primary" value={eng.exhaustPrimaryLength} min={400} max={1400} unit="mm" onChange={(v) => updateEngine({ exhaustPrimaryLength: v })} />
                  <Slider label="Collector Dia." value={eng.exhaustCollectorDia} min={40} max={100} unit="mm" onChange={(v) => updateEngine({ exhaustCollectorDia: v })} />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Toggle label="Catalytic Converter" value={eng.exhaustCat} onChange={(v) => updateEngine({ exhaustCat: v })} />
                  <Toggle label="Valved Exhaust" value={eng.exhaustValved} onChange={(v) => updateEngine({ exhaustValved: v })} />
                </div>
              </Section>
            </>
          )}

          {/* Electric / Hybrid section */}
          {(isElectric || isHybrid) && (
            <Section title={isElectric ? "Electric Powertrain" : "Hybrid System & MGU"} icon={<Battery size={16} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {isElectric && (
                  <>
                    <Select label="Motor Type" value={eng.evMotorType} options={(Object.keys(EV_MOTOR_TYPES) as string[]).map((m) => ({ value: m, label: EV_MOTOR_TYPES[m].label }))} onChange={(v) => updateEngine({ evMotorType: v as EngineConfig["evMotorType"] })} />
                    <Slider label="Motor Power" value={eng.evMotorPower} min={50} max={1500} step={10} unit="kW" onChange={(v) => updateEngine({ evMotorPower: v })} />
                    <Select label="Motor Layout" value={eng.motorLayout} options={[{ value: "none", label: "Single" }, { value: "front", label: "Front" }, { value: "rear", label: "Rear" }, { value: "both", label: "Dual Motor" }]} onChange={(v) => updateEngine({ motorLayout: v as EngineConfig["motorLayout"] })} />
                  </>
                )}

                {!isElectric && (
                  <Select
                    label="Hybrid Architecture"
                    value={eng.hybridArchitecture}
                    options={(Object.keys(HYBRID_ARCHITECTURES) as string[]).map((arch) => ({
                      value: arch,
                      label: HYBRID_ARCHITECTURES[arch].label,
                    }))}
                    onChange={(v) => {
                      const newArch = v as EngineConfig["hybridArchitecture"];
                      const caps = HYBRID_ARCHITECTURES[newArch];
                      updateEngine({
                        hybridArchitecture: newArch,
                        batteryCapacity: caps.minBattery,
                        hybridMotorPower: newArch === "none" ? 0 : Math.max(60, Math.min(eng.hybridMotorPower || 60, caps.maxMotorPower)),
                      });
                    }}
                  />
                )}

                {isHybrid && !isElectric && eng.hybridArchitecture !== "none" && (
                  <>
                    <Select
                      label="Motor Placement"
                      value={eng.motorPlacement}
                      options={(Object.keys(MOTOR_PLACEMENTS) as string[]).map((p) => ({
                        value: p,
                        label: MOTOR_PLACEMENTS[p].label,
                      }))}
                      onChange={(v) => updateEngine({ motorPlacement: v as EngineConfig["motorPlacement"] })}
                    />
                    <Slider
                      label="Electric Motor Power"
                      value={eng.hybridMotorPower}
                      min={5}
                      max={HYBRID_ARCHITECTURES[eng.hybridArchitecture]?.maxMotorPower || 200}
                      step={5}
                      unit="kW"
                      onChange={(v) => updateEngine({ hybridMotorPower: v })}
                    />
                  </>
                )}

                <Select label="Battery Chemistry" value={eng.batteryChemistry} options={(Object.keys(BATTERY_CHEMISTRIES) as string[]).map((b) => ({ value: b, label: BATTERY_CHEMISTRIES[b].label }))} onChange={(v) => updateEngine({ batteryChemistry: v as EngineConfig["batteryChemistry"] })} />
                
                <Slider
                  label="Battery Capacity"
                  value={eng.batteryCapacity}
                  min={isElectric ? 20 : (HYBRID_ARCHITECTURES[eng.hybridArchitecture]?.minBattery || 0.5)}
                  max={isElectric ? 120 : (HYBRID_ARCHITECTURES[eng.hybridArchitecture]?.maxBattery || 10)}
                  step={0.5}
                  unit="kWh"
                  onChange={(v) => updateEngine({ batteryCapacity: v })}
                />

                {isHybrid && !isElectric && (
                  <>
                    <Toggle label="MGU-H (Heat Recovery)" value={eng.hasMguH} onChange={(v) => updateEngine({ hasMguH: v })} />
                    {eng.hasMguH && (
                      <Select label="MGU-H Mode" value={eng.mguHMode} options={(Object.keys(MGU_H_MODES) as string[]).map((m) => ({ value: m, label: MGU_H_MODES[m].label }))} onChange={(v) => updateEngine({ mguHMode: v as EngineConfig["mguHMode"] })} />
                    )}
                    <Select label="Deploy Mode" value={eng.deployMode} options={(Object.keys(HYBRID_DEPLOY_MODES) as string[]).map((d) => ({ value: d, label: HYBRID_DEPLOY_MODES[d].label }))} onChange={(v) => updateEngine({ deployMode: v as EngineConfig["deployMode"] })} />
                  </>
                )}
                <Slider label="Regen Level" value={eng.regenLevel} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => updateEngine({ regenLevel: v })} />
              </div>
              {(isHybrid || isElectric) && (
                <div className="mt-3 p-3 bg-base-900 rounded-xl border border-base-800 space-y-1 font-mono text-xs">
                  {isElectric ? (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Pure EV Range:</span>
                      <strong className="text-ok-400 font-bold">{sim.electricRange} km</strong>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">ICE Combustion Power:</span>
                        <span className="text-slate-200">{sim.peakPower} hp ({sim.displacement}cc V12)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Electric Assist Power:</span>
                        <span className="text-accent-300">+{Math.round(sim.mguKPower * 1.341)} hp ({sim.mguKPower} kW)</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-base-800">
                        <span className="text-slate-300 font-bold">Total Hybrid Output:</span>
                        <strong className="text-ok-400 font-bold text-sm">{sim.combinedPower} hp / {sim.combinedTorque} Nm</strong>
                      </div>
                      {sim.electricRange > 0 && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Pure EV Mode Range:</span>
                          <span className="text-cyan-400">{sim.electricRange} km</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </Section>
          )}

          <Section title="ECU & Eco Technology" icon={<Activity size={16} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <Select
                label="ECU Calibration Map"
                value={eng.ecuMapMode || "balanced"}
                options={[
                  { value: "economy", label: "🍃 Eco Lean-Burn (-0.8 L/100km)" },
                  { value: "balanced", label: "⚖️ Balanced Daily" },
                  { value: "sport", label: "🏎️ Sport (+0.5 L/100km)" },
                  { value: "race", label: "🏁 Race Track (+1.2 L/100km)" },
                ]}
                onChange={(v) => updateEngine({ ecuMapMode: v as EngineConfig["ecuMapMode"] })}
              />
              <div className="pt-5">
                <Toggle label="Automatic Start-Stop System (-0.6 L/100km)" value={eng.hasStartStop || false} onChange={(v) => updateEngine({ hasStartStop: v })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Slider label="RPM Limiter" value={eng.rpmLimiter} min={4000} max={20000} step={100} unit="rpm" onChange={(v) => updateEngine({ rpmLimiter: v })} />
              <Slider label="Redline" value={eng.redline} min={3500} max={18000} step={100} unit="rpm" onChange={(v) => updateEngine({ redline: v })} />
            </div>
          </Section>

          {/* Auto-Optimize Bar */}
          <div className="optimize-bar">
            <span className="label-mono">Auto Optimize</span>
            {([
              { id: "performance" as OptimizeGoal, icon: <TrendingUp size={12} />, label: "Max Performance" },
              { id: "cost" as OptimizeGoal, icon: <DollarSign size={12} />, label: "Lowest Cost" },
              { id: "reliability" as OptimizeGoal, icon: <Wrench size={12} />, label: "Max Reliability" },
              { id: "efficiency" as OptimizeGoal, icon: <Leaf size={12} />, label: "Best Efficiency" },
              { id: "luxury" as OptimizeGoal, icon: <Flame size={12} />, label: "Luxury Focus" },
            ]).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setOptimizeGoal(opt.id)}
                className={`optimize-btn ${optimizeGoal === opt.id ? "active" : ""}`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right column — stats */}
        <div className="space-y-4">
          <Section title="Power & Torque" icon={<Zap size={16} />}>
            <LineChart series={powerSeries} xLabel="RPM" yLabel="hp / Nm" height={200} />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span className="flex items-center gap-1"><span className="h-2 w-3 bg-accent-400 rounded-sm" />Power</span>
              <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: "#e879a0" }} />Torque</span>
            </div>
          </Section>

          <Section title="Engine Vitals" icon={<Gauge size={16} />}>
            <div className="grid grid-cols-2 gap-2">
              <StatTile label="Displacement" value={sim.displacement} unit="cc" accent="accent" />
              <StatTile label="Cylinders" value={sim.cylinderCount} />
              <StatTile label="Peak Power" value={sim.peakPower} unit="hp" accent="accent" sub={`@ ${sim.peakPowerRpm} rpm`} />
              <StatTile label="Peak Torque" value={sim.peakTorque} unit="Nm" accent="accent" sub={`@ ${sim.peakTorqueRpm} rpm`} />
              {!isElectric && <StatTile label="Thermal Eff." value={`${(sim.thermalEfficiency * 100).toFixed(1)}%`} accent="ok" />}
              <StatTile label="Redline" value={sim.redline} unit="rpm" />
              {!isElectric && <StatTile label="Knock Risk" value={`${(sim.knockRisk * 100).toFixed(0)}%`} accent={sim.knockRisk > 0.5 ? "danger" : sim.knockRisk > 0.3 ? "warn" : "ok"} />}
              {!isElectric && <StatTile label="Octane Req." value={sim.octaneRequired} unit="RON" />}
              {!isElectric && <StatTile label="BSFC" value={sim.bsfc} unit="g/kWh" />}
              {!isElectric && <StatTile label="Turbo Lag" value={sim.turboLag.toFixed(2)} unit="s" accent={sim.turboLag > 0.6 ? "warn" : "default"} />}
              <StatTile label="Engine Weight" value={sim.engineWeight} unit="kg" />
              <StatTile label="Reliability" value={`${(sim.reliability * 100).toFixed(0)}%`} accent={sim.reliability > 0.85 ? "ok" : "warn"} />
            </div>
          </Section>

          {(isHybrid || isElectric) && (
            <Section title="Hybrid / Electric" icon={<Battery size={16} />}>
              <div className="grid grid-cols-2 gap-2">
                {sim.mguHPower > 0 && <StatTile label="MGU-H Power" value={sim.mguHPower} unit="kW" accent="accent" />}
                {sim.mguKPower > 0 && <StatTile label="MGU-K Power" value={sim.mguKPower} unit="kW" accent="accent" />}
                <StatTile label="Combined Power" value={sim.peakPower} unit="hp" accent="accent" />
                <StatTile label="Combined Torque" value={sim.peakTorque} unit="Nm" />
                <StatTile label="Battery" value={sim.batteryEnergy} unit="kWh" />
                <StatTile label="Battery Weight" value={sim.batteryWeight} unit="kg" />
                {isElectric && <StatTile label="Range" value={sim.electricRange} unit="km" accent="ok" />}
                <StatTile label="Regen Eff." value={`${(sim.regenEfficiency * 100).toFixed(0)}%`} accent="ok" />
              </div>
            </Section>
          )}

          {/* AI Suggestion Card */}
          <Section title="AI Suggestion" icon={<Lightbulb size={16} />}>
            <div className="ai-suggestion-card">
              <div className="text-sm font-semibold text-purple-200 mb-1">{suggestion.title}</div>
              <div className="text-[11px] text-purple-300/70 leading-relaxed">{suggestion.detail}</div>
              <div className="suggestion-impacts">
                {suggestion.impacts.map((impact, i) => (
                  <span key={i} className={`impact-badge ${impact.tone === "good" ? "good" : "caution"}`}>
                    → {impact.label} : {impact.delta}
                  </span>
                ))}
              </div>
              <div className="ai-suggestion-actions">
                <button className="btn-apply">
                  <Check size={11} /> Apply
                </button>
                <button className="btn-explain">
                  <Info size={11} /> Explain
                </button>
                <button className="btn-ignore">
                  Ignore
                </button>
              </div>
            </div>
          </Section>

          <Section title="Cost & Environment" icon={<DollarSign size={16} />}>
            <div className="grid grid-cols-2 gap-2">
              <StatTile label="Engine Cost" value={`$${(sim.engineCost / 1000).toFixed(1)}k`} accent="accent" />
              {!isElectric && <StatTile label="Fuel Economy" value={sim.fuelEconomy} unit="L/100km" />}
              <StatTile label="Emissions" value={sim.emissions} unit="g/km" accent={sim.emissions > 250 ? "warn" : "default"} />
              <StatTile label="Noise" value={sim.noise} unit="dB" />
            </div>
          </Section>

          {/* Decorative sparkle */}
          <div className="relative overflow-hidden rounded-xl" style={{ height: 0 }}>
            <div className="engine-sparkle" />
          </div>
        </div>
      </div>
    </div>
  );
}
