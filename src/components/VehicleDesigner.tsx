import { Car, Disc, Settings, Cpu, Shield, Sparkles } from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { Section, Slider, Select, ChoiceGrid, Toggle, StatTile } from "./ui/Controls";
import { PLATFORMS, CHASSIS_TYPES, SUSPENSION_TYPES, TRANSMISSION_TYPES, BRAKE_TYPES, TIRE_COMPOUNDS } from "../sim/constants";
import { VEHICLE_PRESET_LIBRARY } from "../sim/vehiclePresets";
import type { PlatformType, ChassisType, SuspensionType, TransmissionType, BrakeType, TireCompound, VehicleConfig } from "../sim/types";

export function VehicleDesigner() {
  const { design, sim, setDesign, updateVehicle, updateElectronics } = useDesign();
  const v = design.vehicle;

  const handleSelectPreset = (presetId: string) => {
    const item = VEHICLE_PRESET_LIBRARY.find((p) => p.id === presetId);
    if (item) {
      setDesign(item.generator());
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 space-y-4 stagger">
        <Section title="Load Vehicle Preset (Price Tiers & Utility Classes)" icon={<Sparkles size={16} />}>
          <div className="p-3 bg-base-850 rounded-lg border border-base-800">
            <Select
              label="Preset Library (By Price Tier & Utility Class)"
              value=""
              options={[
                { value: "", label: "-- Select a Vehicle Class / Budget Preset --" },
                ...VEHICLE_PRESET_LIBRARY.map((item) => ({
                  value: item.id,
                  label: `[${item.groupLabel}] ${item.name} (${item.targetMSRP})`
                }))
              ]}
              onChange={(val) => handleSelectPreset(val)}
            />
            <p className="text-[11px] text-slate-500 mt-2">
              Select any vehicle preset to instantly load realistic specs, chassis, engine tuning, electronics, and budget pricing for that class.
            </p>
          </div>
        </Section>

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <Select<BrakeType> label="Brake Disc Material" value={v.brakeType || "cast_iron"} options={(Object.keys(BRAKE_TYPES) as BrakeType[]).map((b) => ({ value: b, label: BRAKE_TYPES[b].label }))} onChange={(val) => updateVehicle({ brakeType: val })} />
            <Select label="Caliper Pistons" value={String(v.brakePistonCount || 4)} options={[{ value: "2", label: "2-Piston Floating" }, { value: "4", label: "4-Piston Monobloc" }, { value: "6", label: "6-Piston High Performance" }, { value: "8", label: "8-Piston Endurance / Race" }]} onChange={(val) => updateVehicle({ brakePistonCount: Number(val) })} />
          </div>
          <p className="text-[11px] text-slate-500 mb-3">{BRAKE_TYPES[v.brakeType || "cast_iron"].description}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Slider label="Brake Disc" value={v.brakeDiscSize} min={200} max={440} unit="mm" onChange={(val) => updateVehicle({ brakeDiscSize: val })} />
            <Slider label="Brake Pad" value={v.brakePadCompound} min={0} max={1} step={0.05} format={(val) => `${(val * 100).toFixed(0)}%`} onChange={(val) => updateVehicle({ brakePadCompound: val })} />
            <Slider label="Brake Bias" value={v.brakeBias} min={0.3} max={0.8} step={0.01} format={(val) => `${(val * 100).toFixed(0)}%F`} onChange={(val) => updateVehicle({ brakeBias: val })} />
            <Slider label="Wheel Dia." value={v.wheelDiameter} min={13} max={22} unit='"' onChange={(val) => updateVehicle({ wheelDiameter: val })} />
            <Slider label="Wheel Width" value={v.wheelWidth} min={4.5} max={13} step={0.5} unit='"' onChange={(val) => updateVehicle({ wheelWidth: val })} />
            <Slider label="Tire Pressure" value={v.tirePressure} min={1.5} max={3.5} step={0.1} unit="bar" onChange={(val) => updateVehicle({ tirePressure: val })} />
            <Select<TireCompound> label="Tire Compound" value={v.tireCompound} options={(Object.keys(TIRE_COMPOUNDS) as TireCompound[]).map((t) => ({ value: t, label: TIRE_COMPOUNDS[t].label }))} onChange={(val) => updateVehicle({ tireCompound: val })} />
          </div>
        </Section>

        <Section title="Transmission" icon={<Cpu size={16} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
            <Select<TransmissionType> label="Gearbox Type" value={v.transmission} options={(Object.keys(TRANSMISSION_TYPES) as TransmissionType[]).map((t) => ({ value: t, label: TRANSMISSION_TYPES[t].label }))} onChange={(val) => updateVehicle({ transmission: val, gearCount: TRANSMISSION_TYPES[val].gearCount })} />
            <Slider label="Final Drive" value={v.finalDrive} min={2.5} max={5.5} step={0.1} onChange={(val) => updateVehicle({ finalDrive: val })} />
            <Select label="Differential" value={v.diffType} options={[{ value: "open", label: "Open" }, { value: "lsd", label: "LSD" }, { value: "torsen", label: "Torsen" }, { value: "active", label: "Active" }, { value: "locked", label: "Locked" }]} onChange={(val) => updateVehicle({ diffType: val as VehicleConfig["diffType"] })} />
            <Slider label="Diff Preload" value={v.diffPreload} min={0} max={1} step={0.05} format={(val) => `${(val * 100).toFixed(0)}%`} onChange={(val) => updateVehicle({ diffPreload: val })} />
          </div>
          <p className="text-[11px] text-slate-500">{TRANSMISSION_TYPES[v.transmission].description}</p>
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
