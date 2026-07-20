import { Cog, Zap, Gauge, Thermometer, DollarSign, Battery, Activity } from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { Section, Slider, Select, ChoiceGrid, Toggle, StatTile } from "./ui/Controls";
import { LineChart } from "./ui/LineChart";
import { ENGINE_LAYOUTS, CRANK_MATERIALS, PISTON_TYPES, VALVETRAIN_TYPES, INTAKE_TYPES, FUEL_SYSTEMS, BATTERY_CHEMISTRIES, EV_MOTOR_TYPES, HYBRID_DEPLOY_MODES, MGU_H_MODES } from "../sim/constants";
import type { EngineLayout, CrankMaterial, PistonType, ValvetrainType, IntakeType, FuelSystemType, EngineConfig } from "../sim/types";

export function EngineDesigner() {
  const { design, sim, updateEngine } = useDesign();
  const eng = design.engine;
  const isElectric = eng.layout === "electric";
  const isHybrid = eng.layout === "hybrid" || eng.hasMguH || eng.hasMguK;
  const isForced = eng.intake !== "na";

  const powerSeries = [
    { data: sim.powerCurve.map((p) => ({ x: p.rpm, y: p.power })), color: "#22d3ee", fill: true },
    { data: sim.powerCurve.map((p) => ({ x: p.rpm, y: p.torque })), color: "#f59e0b" },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 space-y-4 stagger">
        <Section title="Architecture" icon={<Cog size={16} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label-mono mb-1.5 block">Engine Type</label>
              <ChoiceGrid<EngineLayout>
                value={eng.layout}
                options={(Object.keys(ENGINE_LAYOUTS) as EngineLayout[]).map((l) => ({ value: l, label: ENGINE_LAYOUTS[l].label }))}
                onChange={(v) => updateEngine({ layout: v })}
                columns={3}
              />
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
            <Section title="Internals" icon={<Cog size={16} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Select<CrankMaterial> label="Crankshaft" value={eng.crank} options={(Object.keys(CRANK_MATERIALS) as CrankMaterial[]).map((c) => ({ value: c, label: CRANK_MATERIALS[c].label }))} onChange={(v) => updateEngine({ crank: v })} />
                <Select<PistonType> label="Pistons" value={eng.pistons} options={(Object.keys(PISTON_TYPES) as PistonType[]).map((p) => ({ value: p, label: PISTON_TYPES[p].label }))} onChange={(v) => updateEngine({ pistons: v })} />
                <Select<ValvetrainType> label="Valvetrain" value={eng.valvetrain} options={(Object.keys(VALVETRAIN_TYPES) as ValvetrainType[]).map((v) => ({ value: v, label: VALVETRAIN_TYPES[v].label }))} onChange={(v) => updateEngine({ valvetrain: v })} />
                <Slider label="Cam Duration" value={eng.camDuration} min={240} max={340} unit="°" onChange={(v) => updateEngine({ camDuration: v })} />
                <Slider label="Cam Lift" value={eng.camLift} min={6} max={16} step={0.5} unit="mm" onChange={(v) => updateEngine({ camLift: v })} />
                <Slider label="Cam Timing" value={eng.camTiming} min={-10} max={10} step={0.5} unit="°" onChange={(v) => updateEngine({ camTiming: v })} />
              </div>
            </Section>

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
              <Select label="Battery Chemistry" value={eng.batteryChemistry} options={(Object.keys(BATTERY_CHEMISTRIES) as string[]).map((b) => ({ value: b, label: BATTERY_CHEMISTRIES[b].label }))} onChange={(v) => updateEngine({ batteryChemistry: v as EngineConfig["batteryChemistry"] })} />
              <Slider label="Battery Capacity" value={eng.batteryCapacity} min={isElectric ? 20 : 0.5} max={isElectric ? 120 : 10} step={0.5} unit="kWh" onChange={(v) => updateEngine({ batteryCapacity: v })} />
              {isHybrid && !isElectric && (
                <>
                  <Toggle label="MGU-H (Heat Recovery)" value={eng.hasMguH} onChange={(v) => updateEngine({ hasMguH: v })} />
                  {eng.hasMguH && (
                    <Select label="MGU-H Mode" value={eng.mguHMode} options={(Object.keys(MGU_H_MODES) as string[]).map((m) => ({ value: m, label: MGU_H_MODES[m].label }))} onChange={(v) => updateEngine({ mguHMode: v as EngineConfig["mguHMode"] })} />
                  )}
                  <Toggle label="MGU-K (Kinetic Recovery)" value={eng.hasMguK} onChange={(v) => updateEngine({ hasMguK: v })} />
                  {eng.hasMguK && (
                    <Slider label="MGU-K Power" value={eng.mguKPower} min={20} max={200} step={5} unit="kW" onChange={(v) => updateEngine({ mguKPower: v })} />
                  )}
                  <Select label="Deploy Mode" value={eng.deployMode} options={(Object.keys(HYBRID_DEPLOY_MODES) as string[]).map((d) => ({ value: d, label: HYBRID_DEPLOY_MODES[d].label }))} onChange={(v) => updateEngine({ deployMode: v as EngineConfig["deployMode"] })} />
                </>
              )}
              <Slider label="Regen Level" value={eng.regenLevel} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => updateEngine({ regenLevel: v })} />
            </div>
            {(isHybrid || isElectric) && (
              <p className="text-[10px] text-slate-600 mt-3">
                {isElectric
                  ? `Range: ${sim.electricRange} km · Efficiency: ${(sim.regenEfficiency * 100).toFixed(0)}% regen`
                  : `MGU-H: ${sim.mguHPower} kW · MGU-K: ${sim.mguKPower} kW · Battery: ${sim.batteryEnergy} kWh`}
              </p>
            )}
          </Section>
        )}

        <Section title="ECU" icon={<Activity size={16} />}>
          <div className="grid grid-cols-2 gap-3">
            <Slider label="RPM Limiter" value={eng.rpmLimiter} min={4000} max={20000} step={100} unit="rpm" onChange={(v) => updateEngine({ rpmLimiter: v })} />
            <Slider label="Redline" value={eng.redline} min={3500} max={18000} step={100} unit="rpm" onChange={(v) => updateEngine({ redline: v })} />
          </div>
        </Section>
      </div>

      {/* Right column — stats */}
      <div className="space-y-4">
        <Section title="Power & Torque" icon={<Zap size={16} />}>
          <LineChart series={powerSeries} xLabel="RPM" yLabel="hp / Nm" height={200} />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span className="flex items-center gap-1"><span className="h-2 w-3 bg-accent-400 rounded-sm" />Power</span>
            <span className="flex items-center gap-1"><span className="h-2 w-3 bg-warn-500 rounded-sm" />Torque</span>
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

        <Section title="Cost & Environment" icon={<DollarSign size={16} />}>
          <div className="grid grid-cols-2 gap-2">
            <StatTile label="Engine Cost" value={`$${(sim.engineCost / 1000).toFixed(1)}k`} accent="accent" />
            {!isElectric && <StatTile label="Fuel Economy" value={sim.fuelEconomy} unit="L/100km" />}
            <StatTile label="Emissions" value={sim.emissions} unit="g/km" accent={sim.emissions > 250 ? "warn" : "default"} />
            <StatTile label="Noise" value={sim.noise} unit="dB" />
          </div>
        </Section>
      </div>
    </div>
  );
}
