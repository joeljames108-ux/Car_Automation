import React, { useState } from "react";
import { Car, Disc, Settings, Cpu, Shield, Sparkles, Wrench, Play } from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { Section, Slider, Select, ChoiceGrid, Toggle, StatTile } from "./ui/Controls";
import { PLATFORMS, CHASSIS_TYPES, SUSPENSION_TYPES, BRAKE_TYPES, TIRE_COMPOUNDS, DRIVE_TYPES, ENGINE_POSITIONS } from "../sim/constants";
import { VEHICLE_PRESET_LIBRARY } from "../sim/vehiclePresets";
import { PresetQuickSelect } from "./PresetQuickSelect";
import type { PlatformType, ChassisType, SuspensionType, BrakeType, TireCompound, DriveType, EnginePosition, VehicleConfig } from "../sim/types";

import { useVehicleAssemblyStore } from "../state/useVehicleAssemblyStore";
import { VehicleAssemblyViewer } from "./vehicleAssembly/VehicleAssemblyViewer";
import { VehicleWorkshopPanel } from "./vehicleAssembly/VehicleWorkshopPanel";
import { VehicleCompletionModal } from "./vehicleAssembly/VehicleCompletionModal";
import { ExteriorDesignerIntegration } from "./vehicleAssembly/exterior/ExteriorDesignerIntegration";
import { VehicleConstructionStudio } from "./vehicleAssembly/VehicleConstructionStudio";

export function VehicleDesigner() {
  const { design, sim, setDesign, updateVehicle, updateElectronics } = useDesign();
  const v = design.vehicle;

  const [workspaceMode, setWorkspaceMode] = useState<"chassis_build" | "exterior_build" | "parameters">("chassis_build");
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
              <span>MODULAR glTF VEHICLE CONSTRUCTION SYSTEM</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                50 CHASSIS CAD
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              {workspaceMode === "chassis_build"
                ? "10 Body Types • 50 Unique Chassis Architectures • 12 Assembly Stages"
                : workspaceMode === "exterior_build"
                ? "3D/2D Exterior Body-in-White Assembly Workstation — Panels, Glass & Paint Booth"
                : "Standard Parameter Controls — Platform, Suspension, Brakes & Drivetrain"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Workspace Mode Switcher Buttons */}
          <button
            onClick={() => setWorkspaceMode("chassis_build")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-extrabold transition-all shadow-md ${
              workspaceMode === "chassis_build"
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                : "bg-slate-900 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400"
            }`}
          >
            <Wrench size={14} />
            <span>MODULAR CONSTRUCTION</span>
          </button>

          <button
            onClick={() => setWorkspaceMode("exterior_build")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-extrabold transition-all shadow-md ${
              workspaceMode === "exterior_build"
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                : "bg-slate-900 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400"
            }`}
          >
            <Sparkles size={14} />
            <span>EXTERIOR BODY-IN-WHITE</span>
          </button>

          <button
            onClick={() => setWorkspaceMode("parameters")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-extrabold transition-all shadow-md ${
              workspaceMode === "parameters"
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                : "bg-slate-900 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400"
            }`}
          >
            <Settings size={14} />
            <span>PARAMETERS</span>
          </button>
        </div>
      </div>

      <PresetQuickSelect />

      {/* ── 1. MODULAR glTF VEHICLE CONSTRUCTION SYSTEM ── */}
      {workspaceMode === "chassis_build" && (
        <div className="animate-stage-transition-enter">
          <VehicleConstructionStudio />
        </div>
      )}

      {/* ── 2. EXTERIOR BODY-IN-WHITE WORKSTATION ── */}
      {workspaceMode === "exterior_build" && (
        <div className="animate-stage-transition-enter">
          <ExteriorDesignerIntegration />
        </div>
      )}

      {/* ── 3. STANDARD FORM CONTROLS VIEW ── */}
      {workspaceMode === "parameters" && (
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
                      label: DRIVE_TYPES[dt].shortLabel,
                      description: DRIVE_TYPES[dt].label,
                    }))}
                    onChange={(dt) => updateVehicle({ driveType: dt })}
                  />
                  <p className="text-[11px] text-slate-400 mt-2">
                    {DRIVE_TYPES[v.driveType || "rwd"]?.description || "Select drive wheels configuration."}
                  </p>
                </div>

                <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-3">
                  <label className="label-mono mb-2 flex items-center justify-between font-bold text-purple-300">
                    <span>Engine Position</span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-mono">
                      {ENGINE_POSITIONS[v.enginePosition || "front"]?.label || "Front Engine"}
                    </span>
                  </label>
                  <ChoiceGrid<EnginePosition>
                    value={v.enginePosition || "front"}
                    options={(Object.keys(ENGINE_POSITIONS) as EnginePosition[]).map((ep) => ({
                      value: ep,
                      label: ENGINE_POSITIONS[ep].label.split(" ")[0],
                      description: ENGINE_POSITIONS[ep].label,
                    }))}
                    onChange={(ep) => updateVehicle({ enginePosition: ep })}
                  />
                  <p className="text-[11px] text-slate-400 mt-2">
                    {ENGINE_POSITIONS[v.enginePosition || "front"]?.description || "Select longitudinal engine placement."}
                  </p>
                </div>
              </div>
            </Section>

            {/* Platform & Frame Configuration */}
            <Section title="Chassis & Platform Type" icon={<Car size={16} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Platform Size Class"
                  value={v.platform}
                  options={Object.keys(PLATFORMS).map((k) => ({
                    value: k,
                    label: PLATFORMS[k as PlatformType].label,
                  }))}
                  onChange={(val) => updateVehicle({ platform: val as PlatformType })}
                />
                <Select
                  label="Chassis Construction Material"
                  value={v.chassis}
                  options={Object.keys(CHASSIS_TYPES).map((k) => ({
                    value: k,
                    label: CHASSIS_TYPES[k as ChassisType].label,
                  }))}
                  onChange={(val) => updateVehicle({ chassis: val as ChassisType })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <Slider
                  label="Ride Height"
                  value={v.rideHeight}
                  min={60}
                  max={250}
                  step={2}
                  unit="mm"
                  onChange={(val) => updateVehicle({ rideHeight: val })}
                />
                <Slider
                  label="Front Wheel Diameter"
                  value={v.wheelDiameter}
                  min={16}
                  max={22}
                  step={1}
                  unit="inch"
                  onChange={(val) => updateVehicle({ wheelDiameter: val })}
                />
              </div>
            </Section>

            {/* Suspension Geometry */}
            <Section title="Suspension Geometry & Springs" icon={<Disc size={16} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Front Suspension"
                  value={v.suspensionFront}
                  options={Object.keys(SUSPENSION_TYPES).map((k) => ({
                    value: k,
                    label: SUSPENSION_TYPES[k as SuspensionType].label,
                  }))}
                  onChange={(val) => updateVehicle({ suspensionFront: val as SuspensionType })}
                />
                <Select
                  label="Rear Suspension"
                  value={v.suspensionRear}
                  options={Object.keys(SUSPENSION_TYPES).map((k) => ({
                    value: k,
                    label: SUSPENSION_TYPES[k as SuspensionType].label,
                  }))}
                  onChange={(val) => updateVehicle({ suspensionRear: val as SuspensionType })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <Slider
                  label="Front Spring Rate"
                  value={v.springRateF}
                  min={20}
                  max={150}
                  step={2}
                  unit="N/mm"
                  onChange={(val) => updateVehicle({ springRateF: val })}
                />
                <Slider
                  label="Rear Spring Rate"
                  value={v.springRateR}
                  min={20}
                  max={150}
                  step={2}
                  unit="N/mm"
                  onChange={(val) => updateVehicle({ springRateR: val })}
                />
              </div>
            </Section>

            {/* Brakes & Tires */}
            <Section title="Braking Hardware & Tire Compound" icon={<Shield size={16} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Brake Type"
                  value={v.brakeType}
                  options={Object.keys(BRAKE_TYPES).map((k) => ({
                    value: k,
                    label: BRAKE_TYPES[k as BrakeType].label,
                  }))}
                  onChange={(val) => updateVehicle({ brakeType: val as BrakeType })}
                />
                <Select
                  label="Tire Compound"
                  value={v.tireCompound}
                  options={Object.keys(TIRE_COMPOUNDS).map((k) => ({
                    value: k,
                    label: TIRE_COMPOUNDS[k as TireCompound].label,
                  }))}
                  onChange={(val) => updateVehicle({ tireCompound: val as TireCompound })}
                />
              </div>
            </Section>
          </div>

          {/* Right Column: Live Vehicle Dynamics Summary */}
          <div className="space-y-4">
            <Section title="Vehicle Dynamics Performance" icon={<Car size={16} />}>
              <div className="grid grid-cols-2 gap-2">
                <StatTile label="Curb Weight" value={Math.round(sim.weight || 1480)} unit="kg" />
                <StatTile label="0-100 km/h" value={sim.accel0_100?.toFixed(1) || "3.8"} unit="s" accent="accent" />
                <StatTile label="Top Speed" value={Math.round(sim.topSpeed || 280)} unit="km/h" accent="accent" />
                <StatTile label="Lateral Grip" value={sim.lateralG.toFixed(2)} unit="G" />
                <StatTile label="Braking 100-0" value={sim.brakingDist?.toFixed(1) || "34.5"} unit="m" />
                <StatTile label="Weight Dist" value={(sim.weightDistFront * 100).toFixed(0)} unit="% F" />
              </div>
            </Section>

            {/* Dynamic Chassis & Weight Dynamics Panel */}
            <Section title="Chassis & Weight Dynamics" icon={<Sparkles size={16} />}>
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
                    <span>Lateral Grip Capacity</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{sim.lateralG.toFixed(2)} G</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Peak cornering load capacity based on chassis rigidity and suspension geometry.
                  </p>
                </div>
              </div>
            </Section>
          </div>
        </div>
      )}

      {/* Assembly Completion Celebration Modal */}
      <VehicleCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onReset={vehAssembly.resetAssembly}
        stats={vehAssembly.currentStats}
        vehicleConfig={v}
      />
    </div>
  );
}
