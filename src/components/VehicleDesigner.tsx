import { Car, Wind, Disc, Settings, Cpu, Shield } from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { Section, Slider, Select, ChoiceGrid, Toggle, StatTile } from "./ui/Controls";
import { LineChart } from "./ui/LineChart";
import { CFDView } from "./ui/CFDView";
import { PLATFORMS, CHASSIS_TYPES, SUSPENSION_TYPES, TRANSMISSION_TYPES, TIRE_COMPOUNDS } from "../sim/constants";
import type { PlatformType, ChassisType, SuspensionType, TransmissionType, TireCompound, VehicleConfig } from "../sim/types";

export function VehicleDesigner() {
  const { design, sim, updateVehicle, updateAero, updateElectronics } = useDesign();
  const v = design.vehicle;
  const a = v.aero;

  const dragSeries = [
    { data: sim.dragVsSpeed.map((d) => ({ x: d.speed, y: d.drag })), color: "#22d3ee", fill: true },
    { data: sim.dragVsSpeed.map((d) => ({ x: d.speed, y: d.downforce })), color: "#22c55e" },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 space-y-4 stagger">
        <Section title="Platform & Chassis" icon={<Car size={16} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label-mono mb-1.5 block">Platform</label>
              <ChoiceGrid<PlatformType>
                value={v.platform}
                options={(Object.keys(PLATFORMS) as PlatformType[]).map((p) => ({ value: p, label: PLATFORMS[p].label }))}
                onChange={(val) => updateVehicle({ platform: val })}
                columns={3}
              />
            </div>
            <Select<ChassisType> label="Chassis" value={v.chassis} options={(Object.keys(CHASSIS_TYPES) as ChassisType[]).map((c) => ({ value: c, label: CHASSIS_TYPES[c].label }))} onChange={(val) => updateVehicle({ chassis: val })} />
          </div>
        </Section>

        <Section title="Suspension" icon={<Settings size={16} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select<SuspensionType> label="Front Suspension" value={v.suspensionFront} options={(Object.keys(SUSPENSION_TYPES) as SuspensionType[]).map((s) => ({ value: s, label: SUSPENSION_TYPES[s].label }))} onChange={(val) => updateVehicle({ suspensionFront: val })} />
            <Select<SuspensionType> label="Rear Suspension" value={v.suspensionRear} options={(Object.keys(SUSPENSION_TYPES) as SuspensionType[]).map((s) => ({ value: s, label: SUSPENSION_TYPES[s].label }))} onChange={(val) => updateVehicle({ suspensionRear: val })} />
            <Slider label="Spring Rate F" value={v.springRateF} min={40} max={300} unit="N/mm" onChange={(val) => updateVehicle({ springRateF: val })} />
            <Slider label="Spring Rate R" value={v.springRateR} min={40} max={300} unit="N/mm" onChange={(val) => updateVehicle({ springRateR: val })} />
            <Slider label="Damper F" value={v.damperF} min={0} max={1} step={0.05} format={(val) => `${(val * 100).toFixed(0)}%`} onChange={(val) => updateVehicle({ damperF: val })} />
            <Slider label="Damper R" value={v.damperR} min={0} max={1} step={0.05} format={(val) => `${(val * 100).toFixed(0)}%`} onChange={(val) => updateVehicle({ damperR: val })} />
            <Slider label="Ride Height" value={v.rideHeight} min={40} max={200} unit="mm" onChange={(val) => updateVehicle({ rideHeight: val })} />
            <Slider label="Camber F" value={v.camberF} min={-5} max={0} step={0.1} unit="°" onChange={(val) => updateVehicle({ camberF: val })} />
            <Slider label="Camber R" value={v.camberR} min={-5} max={0} step={0.1} unit="°" onChange={(val) => updateVehicle({ camberR: val })} />
            <Slider label="Anti-Roll Bar F" value={v.antiRollBarF} min={0} max={1} step={0.05} format={(val) => `${(val * 100).toFixed(0)}%`} onChange={(val) => updateVehicle({ antiRollBarF: val })} />
            <Slider label="Anti-Roll Bar R" value={v.antiRollBarR} min={0} max={1} step={0.05} format={(val) => `${(val * 100).toFixed(0)}%`} onChange={(val) => updateVehicle({ antiRollBarR: val })} />
          </div>
        </Section>

        <Section title="Brakes & Wheels" icon={<Disc size={16} />}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Slider label="Brake Disc" value={v.brakeDiscSize} min={280} max={420} unit="mm" onChange={(val) => updateVehicle({ brakeDiscSize: val })} />
            <Slider label="Brake Pad" value={v.brakePadCompound} min={0} max={1} step={0.05} format={(val) => `${(val * 100).toFixed(0)}%`} onChange={(val) => updateVehicle({ brakePadCompound: val })} />
            <Slider label="Brake Bias" value={v.brakeBias} min={0.3} max={0.8} step={0.01} format={(val) => `${(val * 100).toFixed(0)}%F`} onChange={(val) => updateVehicle({ brakeBias: val })} />
            <Slider label="Wheel Dia." value={v.wheelDiameter} min={15} max={22} unit='"' onChange={(val) => updateVehicle({ wheelDiameter: val })} />
            <Slider label="Wheel Width" value={v.wheelWidth} min={7} max={13} step={0.5} unit='"' onChange={(val) => updateVehicle({ wheelWidth: val })} />
            <Slider label="Tire Pressure" value={v.tirePressure} min={1.5} max={3.5} step={0.1} unit="bar" onChange={(val) => updateVehicle({ tirePressure: val })} />
            <Select<TireCompound> label="Tire Compound" value={v.tireCompound} options={(Object.keys(TIRE_COMPOUNDS) as TireCompound[]).map((t) => ({ value: t, label: TIRE_COMPOUNDS[t].label }))} onChange={(val) => updateVehicle({ tireCompound: val })} />
          </div>
        </Section>

        <Section title="Transmission" icon={<Cpu size={16} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select<TransmissionType> label="Gearbox" value={v.transmission} options={(Object.keys(TRANSMISSION_TYPES) as TransmissionType[]).map((t) => ({ value: t, label: TRANSMISSION_TYPES[t].label }))} onChange={(val) => updateVehicle({ transmission: val })} />
            <Slider label="Final Drive" value={v.finalDrive} min={2.5} max={5.5} step={0.1} onChange={(val) => updateVehicle({ finalDrive: val })} />
            <Select label="Differential" value={v.diffType} options={[{ value: "open", label: "Open" }, { value: "lsd", label: "LSD" }, { value: "torsen", label: "Torsen" }, { value: "active", label: "Active" }, { value: "locked", label: "Locked" }]} onChange={(val) => updateVehicle({ diffType: val as VehicleConfig["diffType"] })} />
            <Slider label="Diff Preload" value={v.diffPreload} min={0} max={1} step={0.05} format={(val) => `${(val * 100).toFixed(0)}%`} onChange={(val) => updateVehicle({ diffPreload: val })} />
          </div>
        </Section>

        <Section title="Aerodynamics" icon={<Wind size={16} />}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Slider label="Body Shape" value={a.bodyShape} min={0} max={1} step={0.05} format={(val) => `${(val * 100).toFixed(0)}%`} onChange={(val) => updateAero({ bodyShape: val })} />
            <Slider label="Body Width" value={a.bodyWidth} min={1700} max={2100} unit="mm" onChange={(val) => updateAero({ bodyWidth: val })} />
            <Slider label="Roof Height" value={a.roofHeight} min={1000} max={1400} unit="mm" onChange={(val) => updateAero({ roofHeight: val })} />
            <Slider label="Ride Height" value={a.rideHeight} min={40} max={200} unit="mm" onChange={(val) => updateAero({ rideHeight: val })} />
            <Slider label="Splitter Length" value={a.splitterLength} min={0} max={400} unit="mm" onChange={(val) => updateAero({ splitterLength: val })} />
            <Slider label="Wing Width" value={a.wingWidth} min={0} max={1800} unit="mm" onChange={(val) => updateAero({ wingWidth: val })} />
            <Slider label="Wing Angle" value={a.wingAngle} min={0} max={30} step={0.5} unit="°" onChange={(val) => updateAero({ wingAngle: val })} />
            <Slider label="Wing Height" value={a.wingHeight} min={0} max={400} unit="mm" onChange={(val) => updateAero({ wingHeight: val })} />
            <Slider label="Diffuser Angle" value={a.diffuserAngle} min={0} max={25} step={0.5} unit="°" onChange={(val) => updateAero({ diffuserAngle: val })} />
            <Select label="Underbody" value={a.underbody} options={[{ value: "flat", label: "Flat" }, { value: "flat_floor", label: "Flat Floor" }, { value: "ground_effect", label: "Ground Effect" }, { value: "venturi", label: "Venturi" }, { value: "skirts", label: "Skirts" }]} onChange={(val) => updateAero({ underbody: val as VehicleConfig["aero"]["underbody"] })} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
            <Toggle label="Canards" value={a.canards} onChange={(val) => updateAero({ canards: val })} />
            <Toggle label="DRS" value={a.drs} onChange={(val) => updateAero({ drs: val })} />
            <Toggle label="Side Pods" value={a.sidePods} onChange={(val) => updateAero({ sidePods: val })} />
          </div>
        </Section>

        <Section title="Electronics" icon={<Shield size={16} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Toggle label="ABS" value={v.electronics.abs} onChange={(val) => updateElectronics({ abs: val })} />
            <Toggle label="Launch Control" value={v.electronics.launchControl} onChange={(val) => updateElectronics({ launchControl: val })} />
            <Slider label="Traction Control" value={v.electronics.tractionControl} min={0} max={1} step={0.05} format={(val) => `${(val * 100).toFixed(0)}%`} onChange={(val) => updateElectronics({ tractionControl: val })} />
            <Slider label="Stability Control" value={v.electronics.stabilityControl} min={0} max={1} step={0.05} format={(val) => `${(val * 100).toFixed(0)}%`} onChange={(val) => updateElectronics({ stabilityControl: val })} />
            <Select label="ECU Map" value={v.electronics.ecuMap} options={[{ value: "eco", label: "Eco" }, { value: "sport", label: "Sport" }, { value: "track", label: "Track" }, { value: "qualifying", label: "Qualifying" }]} onChange={(val) => updateElectronics({ ecuMap: val as VehicleConfig["electronics"]["ecuMap"] })} />
          </div>
        </Section>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        <CFDView aero={a} dragCoeff={sim.dragCoeff} liftCoeff={sim.liftCoeff} downforce={sim.downforce} />

        <Section title="Aero Forces" icon={<Wind size={16} />}>
          <LineChart series={dragSeries} xLabel="Speed" xUnit="km/h" yLabel="Force" yUnit="N" height={180} />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span className="flex items-center gap-1"><span className="h-2 w-3 bg-accent-400 rounded-sm" />Drag</span>
            <span className="flex items-center gap-1"><span className="h-2 w-3 bg-ok-500 rounded-sm" />Downforce</span>
          </div>
        </Section>

        <Section title="Vehicle Stats" icon={<Car size={16} />}>
          <div className="grid grid-cols-2 gap-2">
            <StatTile label="Total Weight" value={sim.weight} unit="kg" accent="accent" />
            <StatTile label="Power/Weight" value={(sim.peakPower / (sim.weight / 1000)).toFixed(0)} unit="hp/t" accent="accent" />
            <StatTile label="Top Speed" value={sim.topSpeed} unit="km/h" accent="accent" />
            <StatTile label="0-60 mph" value={sim.accel0_60} unit="s" accent="ok" />
            <StatTile label="Quarter Mile" value={sim.quarterMile} unit="s" />
            <StatTile label="Braking 100-0" value={sim.brakingDist} unit="m" />
            <StatTile label="Lateral G" value={sim.lateralG} unit="g" accent="accent" />
            <StatTile label="Skidpad" value={sim.skidpad} unit="m" />
            <StatTile label="Drag Cd" value={sim.dragCoeff.toFixed(3)} accent="accent" />
            <StatTile label="Downforce" value={sim.downforce} unit="N" accent="ok" />
          </div>
        </Section>
      </div>
    </div>
  );
}
