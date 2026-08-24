import React, { useState } from "react";
import {
  Car,
  Disc,
  Activity,
  Sliders,
  Box,
  Wrench,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound, playHMITabSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonSelect } from "../design/NeonHorizonSelect";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";
import type { DriveType, BrakeType, ChassisType } from "../../../sim/types";
import { ModularExterior3DViewport } from "../../../exterior3d/ModularExterior3DViewport";
import { MasterVehicleStudio } from "../../vehicleAssembly/MasterVehicleStudio";

type ChassisStudioTab =
  | "chassis"
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
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Sub-Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
        {[
          { id: "chassis" as const, label: "Chassis & Drivetrain", icon: <Car size={14} /> },
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
                  ? "bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
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
        <div className="w-full min-h-[600px] h-[650px] rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative bg-[#0b1220]">
          <ModularExterior3DViewport
            className="w-full h-full"
          />
        </div>
      )}

      {/* View 2: Master Vehicle Studio */}
      {activeTab === "master_vehicle_studio" && (
        <div className="w-full rounded-3xl overflow-hidden border border-white/10 bg-[#070e1c] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <MasterVehicleStudio />
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
              <div className="grid grid-cols-2 gap-3">
                <NeonHorizonDataCard label="TOTAL MASS" value={vehicleWeight} unit="KG" accentColor="cyan" />
                <NeonHorizonDataCard label="WEIGHT SPLIT" value={`${Math.round(weightDistribution * 100)}/${Math.round((1 - weightDistribution) * 100)}`} unit="F/R %" accentColor="gold" />
                <NeonHorizonDataCard label="MAX LATERAL G" value={sim.lateralG.toFixed(2)} unit="G" accentColor="magenta" />
                <NeonHorizonDataCard label="0-100 KM/H" value={sim.accel0_100.toFixed(2)} unit="SEC" accentColor="emerald" />
              </div>

              {/* 4-Corner Scale Weight Matrix */}
              <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-black/40 border border-white/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  4-CORNER CORNER-WEIGHT SCALE MATRIX
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-xl bg-white/[0.04] border border-white/6 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">FL CORNER</span>
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {Math.round((vehicleWeight * weightDistribution) / 2)} kg
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.04] border border-white/6 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">FR CORNER</span>
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {Math.round((vehicleWeight * weightDistribution) / 2)} kg
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.04] border border-white/6 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">RL CORNER</span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {Math.round((vehicleWeight * (1 - weightDistribution)) / 2)} kg
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.04] border border-white/6 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">RR CORNER</span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {Math.round((vehicleWeight * (1 - weightDistribution)) / 2)} kg
                    </span>
                  </div>
                </div>
              </div>
            </NeonHorizonGlassPanel>
          </div>
        </div>
      )}
    </div>
  );
}
