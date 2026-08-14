import React, { useState } from "react";
import { Car, Disc, Settings, Cpu, Shield, Sparkles, Wrench, Play } from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { Section, Slider, Select, ChoiceGrid, Toggle, StatTile } from "./ui/Controls";
import { PLATFORMS, CHASSIS_TYPES, SUSPENSION_TYPES, TRANSMISSION_TYPES, BRAKE_TYPES, TIRE_COMPOUNDS, DRIVE_TYPES, ENGINE_POSITIONS } from "../sim/constants";
import { VEHICLE_PRESET_LIBRARY } from "../sim/vehiclePresets";
import { PresetQuickSelect } from "./PresetQuickSelect";
import type { PlatformType, ChassisType, SuspensionType, TransmissionType, BrakeType, TireCompound, DriveType, EnginePosition, VehicleConfig } from "../sim/types";

import { useVehicleAssemblyStore } from "../state/useVehicleAssemblyStore";
import { VehicleAssemblyViewer } from "./vehicleAssembly/VehicleAssemblyViewer";
import { VehicleAssemblyTabSwitcher } from "./vehicleAssembly/VehicleAssemblyTabSwitcher";
import { VehicleCompletionModal } from "./vehicleAssembly/VehicleCompletionModal";

export function VehicleDesigner() {
  const { design, sim, setDesign, updateVehicle, updateElectronics } = useDesign();
  const v = design.vehicle;

  const [vehicleBuildMode, setVehicleBuildMode] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const vehAssembly = useVehicleAssemblyStore(v);

  const handleSelectPreset = (presetId: string) => {
    const item = VEHICLE_PRESET_LIBRARY.find((p) => p.id === presetId);
    if (item) {
      setDesign(item.generator());
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Navigation & Workspace Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0b0f19]/90 border border-cyan-500/30 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            <Car size={20} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
              <span>VEHICLE CHASSIS & DRIVETRAIN STUDIO</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                APEX CAD
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              {vehicleBuildMode
                ? "3D Robotic Vehicle Assembly Line — Progressive Subsystem Building"
                : "Standard Parameter Controls — Platform, Suspension, Brakes & Drivetrain"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setVehicleBuildMode((prev) => !prev)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-extrabold transition-all shadow-md ${
              vehicleBuildMode
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                : "bg-slate-900 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-500/10"
            }`}
          >
            <Wrench size={14} />
            <span>{vehicleBuildMode ? "EXIT BUILD STUDIO" : "🔧 VEHICLE BUILD STUDIO"}</span>
          </button>
        </div>
      </div>

      <PresetQuickSelect />

      {/* Assembly Mode Viewport */}
      {vehicleBuildMode ? (
        <div className="space-y-4 animate-stage-transition-enter">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start min-h-[480px]">
            {/* Left Column: Vehicle SVG Assembly Canvas Viewport */}
            <div className="xl:col-span-7 h-[calc(100vh-170px)] max-h-[660px] overflow-hidden sticky top-4 z-20">
              <VehicleAssemblyViewer
                installedComponents={vehAssembly.installedComponents}
                activeComponentId={vehAssembly.activeComponentId}
                phase={vehAssembly.phase}
                hoveredComponentId={vehAssembly.hoveredComponentId}
                isExplodedView={vehAssembly.isExplodedView}
                isAssemblyComplete={vehAssembly.isAssemblyComplete}
                enginePosition={vehAssembly.enginePosition}
                driveType={vehAssembly.driveType}
                vehicleConfig={v}
                onAdvancePhase={vehAssembly.advancePhase}
                onHoverComponent={vehAssembly.setHoveredComponentId}
                onSelectEnginePosition={(pos) => {
                  vehAssembly.setEnginePosition(pos);
                  updateVehicle({ enginePosition: pos });
                }}
                onSelectDriveType={(drive) => {
                  vehAssembly.setDriveType(drive);
                  updateVehicle({ driveType: drive });
                }}
                onCompleteInstall={() => {
                  const completedId = vehAssembly.activeComponentId;
                  vehAssembly.completeInstall();
                  
                  if (completedId === "chassis_frame") updateVehicle({ chassis: "monocoque" });
                  if (completedId === "suspension_front") updateVehicle({ suspensionFront: "double_wishbone" });
                  if (completedId === "suspension_rear") updateVehicle({ suspensionRear: "multilink" });
                  if (completedId === "brakes") updateVehicle({ brakeType: "carbon_ceramic" });
                  if (completedId === "transmission") updateVehicle({ transmission: "dct_7" });
                  if (completedId === "wheels_tires") updateVehicle({ tireCompound: "slick" });
                  
                  if (vehAssembly.installedComponents.length + 1 === 10) {
                    setShowCompletionModal(true);
                  }
                }}
                onSkipAnimation={vehAssembly.skipCurrentAnimation}
              />
            </div>

            {/* Right Column: Tabbed Subsystem Catalog & Dashboard Console */}
            <div className="xl:col-span-5 h-[calc(100vh-170px)] max-h-[660px] overflow-hidden">
              <VehicleAssemblyTabSwitcher
                installedComponents={vehAssembly.installedComponents}
                activeComponentId={vehAssembly.activeComponentId}
                phase={vehAssembly.phase}
                hoveredComponentId={vehAssembly.hoveredComponentId}
                progressPercentage={vehAssembly.progressPercentage}
                currentStats={vehAssembly.currentStats}
                nextRecommendedComponent={vehAssembly.nextRecommendedComponent}
                isAutoAssembling={vehAssembly.isAutoAssembling}
                canInstall={vehAssembly.canInstall}
                onStartInstall={vehAssembly.startInstall}
                onHoverComponent={vehAssembly.setHoveredComponentId}
                onResetAssembly={vehAssembly.resetAssembly}
                onToggleAutoAssemble={() => {
                  if (vehAssembly.isAutoAssembling) {
                    vehAssembly.setIsAutoAssembling(false);
                  } else {
                    vehAssembly.setIsAutoAssembling(true);
                    if (vehAssembly.nextRecommendedComponent) {
                      vehAssembly.startInstall(vehAssembly.nextRecommendedComponent.id);
                    }
                  }
                }}
                selectedVariants={vehAssembly.selectedVariants}
                onSelectVariant={vehAssembly.setSelectedVariant}
                vehicleConfig={v}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Standard Form Controls View */
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

        {/* Dedicated Top Section: Drivetrain Layout (FWD / RWD / AWD) & Engine Placement */}
        <Section title="Drivetrain Layout & Engine Placement" icon={<Cpu size={16} className="text-cyan-400" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-xl p-3">
              <label className="label-mono mb-2 flex items-center justify-between font-bold text-cyan-300">
                <span>Drivetrain (Drive Type)</span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono">
                  {DRIVE_TYPES[v.driveType || "rwd"]?.shortLabel || "RWD"}
                </span>
              </label>
              <ChoiceGrid<DriveType>
                value={v.driveType || "rwd"}
                options={(Object.keys(DRIVE_TYPES) as DriveType[]).map((dt) => ({
                  value: dt,
                  label: DRIVE_TYPES[dt].label
                }))}
                onChange={(val) => updateVehicle({ driveType: val })}
                columns={1}
              />
              <p className="text-[11px] text-slate-300 mt-2 bg-base-900/80 p-2 rounded-lg border border-base-700/60 leading-relaxed">
                {DRIVE_TYPES[v.driveType || "rwd"]?.description}
              </p>
            </div>

            <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-3">
              <label className="label-mono mb-2 flex items-center justify-between font-bold text-purple-300">
                <span>Engine Placement (Position)</span>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-mono">
                  {ENGINE_POSITIONS[v.enginePosition || "front"]?.shortLabel || "Front-Engine"}
                </span>
              </label>
              <ChoiceGrid<EnginePosition>
                value={v.enginePosition || "front"}
                options={(Object.keys(ENGINE_POSITIONS) as EnginePosition[]).map((ep) => ({
                  value: ep,
                  label: ENGINE_POSITIONS[ep].label
                }))}
                onChange={(val) => updateVehicle({ enginePosition: val })}
                columns={1}
              />
              <p className="text-[11px] text-slate-300 mt-2 bg-base-900/80 p-2 rounded-lg border border-base-700/60 leading-relaxed">
                {ENGINE_POSITIONS[v.enginePosition || "front"]?.description}
              </p>
            </div>
          </div>

          {/* Live Physics Summary Tiles for Drivetrain & Engine Placement */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-base-800">
            <StatTile
              label="Weight Balance"
              value={`${(sim.weightDistFront * 100).toFixed(0)} / ${(100 - sim.weightDistFront * 100).toFixed(0)}`}
              unit="% F/R"
              accent="accent"
              sub={v.enginePosition === "mid" ? "Neutral Balance" : v.enginePosition === "rear" ? "Rear Heavy" : "Nose Heavy"}
            />
            <StatTile
              label="Drive Efficiency"
              value={`${((DRIVE_TYPES[v.driveType || "rwd"]?.efficiency || 0.85) * 100).toFixed(0)}%`}
              accent="ok"
              sub={v.driveType === "fwd" ? "High Efficiency" : v.driveType === "awd" ? "Driveline Loss" : "Standard RWD"}
            />
            <StatTile
              label="Launch Traction"
              value={`${((DRIVE_TYPES[v.driveType || "rwd"]?.launchTractionMultiplier || 1.0) * 100).toFixed(0)}%`}
              accent="accent"
              sub={v.driveType === "awd" ? "All 4 Wheels" : v.driveType === "fwd" ? "Front Unloads" : "Rear Load Transfer"}
            />
            <StatTile
              label="Turn-in Agility"
              value={`${((1 / (ENGINE_POSITIONS[v.enginePosition || "front"]?.polarInertiaFactor || 1.0)) * 100).toFixed(0)}%`}
              accent="ok"
              sub={v.enginePosition === "mid" ? "Fast Yaw Response" : v.enginePosition === "rear" ? "Pendulum Effect" : "Understeer Bias"}
            />
          </div>
        </Section>

        <Section title="Platform & Chassis" icon={<Car size={16} />}>
          <div className="space-y-3">
            <div>
              <label className="label-mono mb-1.5 flex items-center justify-between font-bold">
                <span>Vehicle Platform Tier & Class</span>
                <span className="text-cyan-500 font-bold font-mono text-xs">{PLATFORMS[v.platform]?.label}</span>
              </label>
              <ChoiceGrid<PlatformType>
                value={v.platform}
                options={(Object.keys(PLATFORMS) as PlatformType[]).map((p) => ({ value: p, label: PLATFORMS[p].label }))}
                onChange={(val) => updateVehicle({ platform: val })}
                columns={4}
              />
            </div>
            <div className="pt-2 border-t border-slate-200/50 dark:border-base-800">
              <Select<ChassisType> label="Chassis Architecture" value={v.chassis} options={(Object.keys(CHASSIS_TYPES) as ChassisType[]).map((c) => ({ value: c, label: CHASSIS_TYPES[c].label }))} onChange={(val) => updateVehicle({ chassis: val })} />
            </div>
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
          <p className="text-[11px] text-slate-500 mb-3 font-mono">{BRAKE_TYPES[v.brakeType || "cast_iron"].description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Slider label="Brake Disc" value={v.brakeDiscSize} min={200} max={440} unit="mm" onChange={(val) => updateVehicle({ brakeDiscSize: val })} />
            <Slider label="Brake Pad" value={v.brakePadCompound} min={0} max={1} step={0.05} format={(val) => `${(val * 100).toFixed(0)}%`} onChange={(val) => updateVehicle({ brakePadCompound: val })} />
            <Slider label="Brake Bias" value={v.brakeBias} min={0.3} max={0.8} step={0.01} format={(val) => `${(val * 100).toFixed(0)}%F`} onChange={(val) => updateVehicle({ brakeBias: val })} />
            <Slider label="Wheel Dia." value={v.wheelDiameter} min={13} max={22} unit='"' onChange={(val) => updateVehicle({ wheelDiameter: val })} />
            <Slider label="Wheel Width" value={v.wheelWidth} min={4.5} max={13} step={0.5} unit='"' onChange={(val) => updateVehicle({ wheelWidth: val })} />
            <Slider label="Tire Pressure" value={v.tirePressure} min={1.5} max={3.5} step={0.1} unit="bar" onChange={(val) => updateVehicle({ tirePressure: val })} />
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-base-800">
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
          <p className="text-[11px] text-slate-500 font-mono mt-1">{TRANSMISSION_TYPES[v.transmission].description}</p>
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

        {/* Dynamic Chassis & Aero Telemetry Panel */}
        <Section title="Chassis & Aero Telemetry" icon={<Sparkles size={16} />}>
          <div className="space-y-2.5 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-white/40 dark:bg-base-950/60 border border-white/60 dark:border-base-800 space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-slate-400 font-bold">
                <span>Front/Rear Weight Bias</span>
                <span className="text-cyan-600 dark:text-cyan-400">{(sim.weightDistFront * 100).toFixed(0)}% F / {(100 - sim.weightDistFront * 100).toFixed(0)}% R</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-base-800 overflow-hidden flex">
                <div style={{ width: `${sim.weightDistFront * 100}%` }} className="bg-cyan-500 h-full transition-all" />
                <div style={{ width: `${(1 - sim.weightDistFront) * 100}%` }} className="bg-purple-500 h-full transition-all" />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/40 dark:bg-base-950/60 border border-white/60 dark:border-base-800 space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-slate-400 font-bold">
                <span>Aerodynamic Efficiency</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{(sim.downforce / (sim.dragCoeff * 1000 + 1)).toFixed(2)} L/D</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                High downforce to drag ratio for cornering stability.
              </p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  )}

  {/* Vehicle Completion Modal */}
  <VehicleCompletionModal
    isOpen={showCompletionModal}
    onClose={() => setShowCompletionModal(false)}
    onReset={() => {
      vehAssembly.resetAssembly();
      setShowCompletionModal(false);
    }}
    stats={vehAssembly.currentStats}
    enginePosition={vehAssembly.enginePosition}
    driveType={vehAssembly.driveType}
    vehicleConfig={v}
  />
</div>
  );
}
