import React, { useState } from "react";
import {
  Car,
  Disc,
  Activity,
  Sliders,
  Box,
  Wrench,
  Paintbrush,
  Wind,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound, playHMITabSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonSelect } from "../design/NeonHorizonSelect";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";
import { NeonPerformanceKPIGrid } from "../design/NeonPerformanceKPIGrid";
import type { DriveType, BrakeType, ChassisType } from "../../../sim/types";
import { ModularExterior3DViewport } from "../../../exterior3d/ModularExterior3DViewport";
import { MasterVehicleStudio } from "../../vehicleAssembly/MasterVehicleStudio";
import { NeonExteriorStudio } from "./NeonExteriorStudio";
import { NeonAeroLab } from "./NeonAeroLab";

type ChassisStudioTab =
  | "chassis"
  | "exterior_styling"
  | "aero_lab"
  | "suspension"
  | "brakes"
  | "exterior_3d"
  | "master_vehicle_studio";

export function NeonChassisStudio() {
  const { design, sim, updateVehicle } = useDesign();
  const { vehicle } = design;

  const [activeTab, setActiveTab] = useState<ChassisStudioTab>("chassis");

  const vehicleWeight = (vehicle as any).mass || sim.weight || 1280;
  const weightDistribution = (vehicle as any).weightDist || 0.52;

  return (
    <div className="w-full flex flex-col gap-6 text-amber-50 animate-nh-materialize">
      {/* Sub-Tab Switcher */}
      <div className="flex items-center gap-2 p-2 bg-base-900/60 dark:bg-base-950/60 rounded-2xl border border-base-800 overflow-x-auto no-scrollbar shadow-sm">
        {[
          { id: "chassis" as const, label: "Chassis & Drivetrain", icon: <Car size={14} /> },
          { id: "exterior_styling" as const, label: "Exterior & Paint", icon: <Paintbrush size={14} /> },
          { id: "aero_lab" as const, label: "Aero & Wind Tunnel", icon: <Wind size={14} /> },
          { id: "suspension" as const, label: "Suspension Kinematics", icon: <Sliders size={14} /> },
          { id: "brakes" as const, label: "Brakes & Hydraulics", icon: <Disc size={14} /> },
          { id: "exterior_3d" as const, label: "3D Exterior & Chassis", icon: <Box size={14} /> },
          { id: "master_vehicle_studio" as const, label: "Master Vehicle Studio", icon: <Wrench size={14} /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playHMITabSound();
                setActiveTab(tab.id);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs nh-font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
 isActive
 ? "bg-sky-400/20 text-sky-200 border border-sky-400/30"
 : "text-amber-400 dark:text-amber-200/60 hover:text-slate-900 dark:hover:text-amber-50 hover:bg-base-800/40"
 }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* View 1: 3D Exterior & Chassis Viewport */}
      {activeTab === "exterior_3d" && (
        <div className="w-full min-h-[600px] h-[650px] rounded-3xl overflow-hidden border border-base-800 shadow-[0_20px_50px_rgba(0,0,0,0.25)] relative bg-base-950">
          <ModularExterior3DViewport
            className="w-full h-full"
          />
        </div>
      )}

      {/* View 2: Master Vehicle Studio */}
      {activeTab === "master_vehicle_studio" && (
        <div className="w-full rounded-3xl overflow-hidden border border-base-800 bg-base-950 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
          <MasterVehicleStudio />
        </div>
      )}

      {/* View 2B: Exterior Styling & Paint */}
      {activeTab === "exterior_styling" && (
        <div className="w-full">
          <NeonExteriorStudio />
        </div>
      )}

      {/* View 2C: Aero & Wind Tunnel */}
      {activeTab === "aero_lab" && (
        <div className="w-full">
          <NeonAeroLab />
        </div>
      )}

      {/* Views 3-5: Tuning Controls Grid */}
      {(activeTab === "chassis" || activeTab === "suspension" || activeTab === "brakes") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Controls (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {activeTab === "chassis" && (
              <NeonHorizonGlassPanel
                variant="primary"
                corners="reticle"
                header={{
                  title: "CHASSIS MONOCOQUE & DRIVETRAIN PLATFORM",
                  subtitle: "Torsional stiffness, curb weight distribution, and differential torque split",
                  icon: <Car size={16} />,
                }}
                className="p-6 flex flex-col gap-5"
              >
                <NeonHorizonSelect
                  label="CHASSIS STRUCTURAL ARCHITECTURE"
                  value={vehicle.chassis}
                  onChange={(val) => updateVehicle({ chassis: val as ChassisType })}
                  options={[
                    { value: "carbon_monocoque", label: "Autoclave Pre-Preg Carbon Fiber Monocoque", sublabel: "74.0 kNm/deg torsional rigidity" },
                    { value: "aluminum_spaceframe", label: "Extruded Aluminum Alloy Spaceframe", sublabel: "Lightweight modular crash structure" },
                    { value: "tubular_chromoly", label: "Tubular 4130 Chrome-Moly Spaceframe", sublabel: "FIA GT3 homologation compliant" },
                    { value: "hybrid_composite", label: "Carbon-Titanium Composite Tub (Carbo-Titanium)", sublabel: "Ultimate ballistic energy dissipation" },
                  ]}
                />

                <NeonHorizonSelect
                  label="DRIVETRAIN TORQUE DISTRIBUTION"
                  value={vehicle.driveType}
                  onChange={(val) => updateVehicle({ driveType: val as DriveType })}
                  options={[
                    { value: "awd", label: "Active Torque-Vectoring AWD", sublabel: "Variable 30:70 to 50:50 electro-hydraulic split" },
                    { value: "rwd", label: "Rear-Wheel Drive (RWD) with e-LSD", sublabel: "Purist oversteer dynamics & mechanical grip" },
                    { value: "fwd", label: "Front-Wheel Drive with Mechanical Torsen LSD", sublabel: "Direct steering axis feedback" },
                  ]}
                />
              </NeonHorizonGlassPanel>
            )}

            {activeTab === "suspension" && (
              <NeonHorizonGlassPanel
                variant="primary"
                corners="reticle"
                header={{
                  title: "SUSPENSION GEOMETRY & SPRING RATES",
                  subtitle: "Inboard pushrod bellcranks, active magneto dampers, and anti-roll bars",
                  icon: <Sliders size={16} />,
                }}
                className="p-6 flex flex-col gap-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <NeonHorizonSlider
                    label="FRONT SPRING RATE"
                    value={vehicle.springRateF || 85}
                    min={40}
                    max={180}
                    unit="N/mm"
                    onChange={(val) => updateVehicle({ springRateF: val })}
                    color="cyan"
                  />
                  <NeonHorizonSlider
                    label="REAR SPRING RATE"
                    value={vehicle.springRateR || 105}
                    min={40}
                    max={200}
                    unit="N/mm"
                    onChange={(val) => updateVehicle({ springRateR: val })}
                    color="cyan"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <NeonHorizonSlider
                    label="RIDE HEIGHT (GROUND CLEARANCE)"
                    value={vehicle.rideHeight}
                    min={45}
                    max={160}
                    unit="mm"
                    onChange={(val) => updateVehicle({ rideHeight: val })}
                    color="gold"
                  />
                  <NeonHorizonSlider
                    label="TIRE COMPOUND GRIP"
                    value={(vehicle as any).tireGrip || 1.15}
                    min={0.85}
                    max={1.65}
                    step={0.02}
                    unit="μ"
                    onChange={(val) => updateVehicle({ tireGrip: val } as any)}
                    color="magenta"
                  />
                </div>
              </NeonHorizonGlassPanel>
            )}

            {activeTab === "brakes" && (
              <NeonHorizonGlassPanel
                variant="primary"
                corners="reticle"
                header={{
                  title: "BRAKING SYSTEM & HYDRAULIC BALANCE",
                  subtitle: "Carbon-ceramic rotor diameter, multi-piston monoblock calipers, and bias",
                  icon: <Disc size={16} />,
                }}
                className="p-6 flex flex-col gap-5"
              >
                <NeonHorizonSelect
                  label="BRAKE ROTOR MATERIAL & CALIPER SPEC"
                  value={vehicle.brakeType || "carbon_ceramic"}
                  onChange={(val) => updateVehicle({ brakeType: val as BrakeType })}
                  options={[
                    { value: "carbon_ceramic", label: "420mm Carbon-Silicon-Carbide (CSiC) Rotors", sublabel: "Zero fade at 1000°C with 10-piston calipers" },
                    { value: "steel_slotted", label: "380mm Floating Two-Piece Slotted Steel Discs", sublabel: "High initial bite with progressive pedal feel" },
                    { value: "carbon_carbon", label: "Formula 1 Spec Carbon-Carbon Rotors & Pads", sublabel: "Maximum thermal deceleration rate" },
                  ]}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <NeonHorizonSlider
                    label="FRONT/REAR BRAKE BIAS"
                    value={Math.round((vehicle.brakeBias || 0.62) * 100)}
                    min={45}
                    max={75}
                    unit="% F"
                    onChange={(val) => updateVehicle({ brakeBias: val / 100 })}
                    color="gold"
                  />
                  <NeonHorizonSlider
                    label="BRAKE PRESSURE BOOST"
                    value={(vehicle as any).brakeForce || 1400}
                    min={800}
                    max={2400}
                    step={50}
                    unit="Nm"
                    onChange={(val) => updateVehicle({ brakeForce: val } as any)}
                    color="cyan"
                  />
                </div>
              </NeonHorizonGlassPanel>
            )}
          </div>

          {/* Right Live Dynamics (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <NeonHorizonGlassPanel
              variant="window"
              glow="cyan"
              corners="reticle"
              header={{
                title: "VEHICLE CHASSIS DYNAMICS",
                subtitle: `${vehicle.driveType.toUpperCase()} · ${vehicleWeight} kg · ${vehicle.chassis}`,
                icon: <Activity size={16} />,
                badge: <NeonHorizonBadge variant="live">LIVE CALC</NeonHorizonBadge>,
              }}
              className="p-6 flex flex-col gap-5"
            >
              <NeonPerformanceKPIGrid sim={sim} metrics={["power", "weight", "lateralG", "accel0_100"]} />
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-white/[0.04] border border-white/6 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-200/60">FL CORNER</span>
                  <span className="text-xs font-mono font-bold text-sky-300">
                    {Math.round((vehicleWeight * weightDistribution) / 2)} kg
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.04] border border-white/6 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-200/60">FR CORNER</span>
                  <span className="text-xs font-mono font-bold text-sky-300">
                    {Math.round((vehicleWeight * weightDistribution) / 2)} kg
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.04] border border-white/6 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-200/60">RL CORNER</span>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {Math.round((vehicleWeight * (1 - weightDistribution)) / 2)} kg
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.04] border border-white/6 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-200/60">RR CORNER</span>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {Math.round((vehicleWeight * (1 - weightDistribution)) / 2)} kg
                  </span>
                </div>
              </div>
            </NeonHorizonGlassPanel>
          </div>
        </div>
      )}
    </div>
  );
}
