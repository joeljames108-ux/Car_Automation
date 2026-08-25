import React, { useState, useEffect } from "react";
import {
  Zap,
  Flame,
  Activity,
  Sliders,
  Thermometer,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  Gauge,
  Cpu,
  Box,
  Wrench,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound, playHMITabSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonSelect } from "../design/NeonHorizonSelect";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonToggle } from "../design/NeonHorizonToggle";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";
import type { EngineLayout, IntakeType, FuelSystemType } from "../../../sim/types";
import { ModularEngine3DViewport } from "../../../engine3d/ModularEngine3DViewport";
import { EngineBuilderFlow } from "../../assembly/EngineBuilderFlow";
import { ModularEngineStudio } from "../../engineStudio/ModularEngineStudio";
import { Transmission3DStudio } from "../../transmissionStudio/Transmission3DStudio";
import { UnifiedPowertrainStudio } from "../../powertrainStudio/UnifiedPowertrainStudio";

type EngineStudioTab =
  | "unified_powertrain"
  | "assembly_3d"
  | "engine_workbench"
  | "transmission_3d"
  | "block"
  | "valvetrain"
  | "forced_induction"
  | "fuel_ecu";

export function NeonEngineStudio() {
  const { design, sim, updateEngine, updateVehicle } = useDesign();
  const { engine } = design;

  const [activeTab, setActiveTab] = useState<EngineStudioTab>("assembly_3d");
  const [firingCylinder, setFiringCylinder] = useState(1);

  // Animated cylinder firing cycle (only when viewing telemetry panel)
  useEffect(() => {
    const isTuningTab = activeTab === "block" || activeTab === "valvetrain" || activeTab === "forced_induction" || activeTab === "fuel_ecu";
    if (!isTuningTab) return;

    const numCyls = engine.layout.startsWith("v12") ? 12 : engine.layout.startsWith("v10") ? 10 : 8;
    const interval = setInterval(() => {
      setFiringCylinder((prev) => (prev % numCyls) + 1);
    }, 150);
    return () => clearInterval(interval);
  }, [engine.layout, activeTab]);

  const displacementCc = Math.round(
    Math.PI * Math.pow(engine.bore / 20, 2) * (engine.stroke / 10) * (engine.layout.startsWith("v12") ? 12 : 8)
  );

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Engine Studio Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
        {[
          { id: "unified_powertrain" as const, label: "⚡ Unified Powertrain Studio", icon: <Flame size={14} className="text-cyan-400" /> },
          { id: "assembly_3d" as const, label: "3D Engine Assembly & Builder", icon: <Box size={14} /> },
          { id: "engine_workbench" as const, label: "Dyno & Master Workbench", icon: <Wrench size={14} /> },
          { id: "transmission_3d" as const, label: "3D Transmission Studio", icon: <Sliders size={14} /> },
          { id: "block" as const, label: "Block & Geometry", icon: <Cpu size={14} /> },
          { id: "valvetrain" as const, label: "Valvetrain & Cams", icon: <Sliders size={14} /> },
          { id: "forced_induction" as const, label: "Turbo & Boost", icon: <Flame size={14} /> },
          { id: "fuel_ecu" as const, label: "Fuel & ECU Calibration", icon: <Zap size={14} /> },
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
 : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
 }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* View 0: Unified Powertrain Studio */}
      {activeTab === "unified_powertrain" && (
        <div className="w-full rounded-3xl overflow-hidden border border-white/10 bg-[#0a111e] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <UnifiedPowertrainStudio />
        </div>
      )}

      {/* View 1: Unified 3D Engine Assembly & Builder Flow */}
      {activeTab === "assembly_3d" && (
        <div className="w-full">
          <EngineBuilderFlow
            engineConfig={engine}
            sim={sim}
            updateEngine={updateEngine}
            updateVehicle={updateVehicle}
          />
        </div>
      )}

      {/* View 2: Master Engine Workbench & Dyno */}
      {activeTab === "engine_workbench" && (
        <div className="w-full rounded-3xl overflow-hidden border border-white/10 bg-[#0a111e] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <ModularEngineStudio />
        </div>
      )}

      {/* View 2B: Master 3D Transmission Studio */}
      {activeTab === "transmission_3d" && (
        <div className="w-full rounded-3xl overflow-hidden border border-white/10 bg-[#0a111e] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <Transmission3DStudio />
        </div>
      )}

      {/* Views 3-6: Tuning Controls Grid */}
      {(activeTab === "block" || activeTab === "valvetrain" || activeTab === "forced_induction" || activeTab === "fuel_ecu") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Tuning Panel (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {activeTab === "block" && (
              <NeonHorizonGlassPanel
                variant="primary"
                corners="reticle"
                header={{
                  title: "ENGINE BLOCK & CYLINDER GEOMETRY",
                  subtitle: "Bore, stroke, compression ratio, and architectural layout",
                  icon: <Cpu size={16} />,
                }}
                className="p-6 flex flex-col gap-5"
              >
                <NeonHorizonSelect
                  label="ENGINE ARCHITECTURE LAYOUT"
                  value={engine.layout}
                  onChange={(val) => updateEngine({ layout: val as EngineLayout })}
                  options={[
                    { value: "v8", label: "90° V8 Flat-Plane Crank", sublabel: "High RPM screaming exotic acoustics" },
                    { value: "v10", label: "72° V10 Odd-Fire Naturally Aspirated", sublabel: "F1 Heritage high power density" },
                    { value: "v12", label: "60° V12 Quad-Cam Monoblock", sublabel: "Perfect primary & secondary balance" },
                    { value: "w16", label: "W16 Quad-Turbocharged", sublabel: "Maximum sheer torque yield" },
                    { value: "i6", label: "Inline-6 Twin-Scroll", sublabel: "Smooth linear torque delivery" },
                  ]}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <NeonHorizonSlider
                    label="CYLINDER BORE"
                    value={engine.bore}
                    min={70}
                    max={105}
                    unit="mm"
                    onChange={(val) => updateEngine({ bore: val })}
                    color="cyan"
                  />
                  <NeonHorizonSlider
                    label="PISTON STROKE"
                    value={engine.stroke}
                    min={65}
                    max={110}
                    unit="mm"
                    onChange={(val) => updateEngine({ stroke: val })}
                    color="cyan"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <NeonHorizonSlider
                    label="STATIC COMPRESSION RATIO"
                    value={engine.compressionRatio}
                    min={8.0}
                    max={14.5}
                    step={0.1}
                    unit=":1"
                    onChange={(val) => updateEngine({ compressionRatio: val })}
                    color="gold"
                  />
                  <NeonHorizonSlider
                    label="MAX ENGINE REDLINE LIMIT"
                    value={engine.redline}
                    min={6000}
                    max={11500}
                    step={250}
                    unit="RPM"
                    onChange={(val) => updateEngine({ redline: val })}
                    color="magenta"
                  />
                </div>
              </NeonHorizonGlassPanel>
            )}

            {activeTab === "valvetrain" && (
              <NeonHorizonGlassPanel
                variant="primary"
                corners="reticle"
                header={{
                  title: "CYLINDER HEAD & VALVETRAIN KINEMATICS",
                  subtitle: "Cam duration, variable valve timing, and intake port flow dynamics",
                  icon: <Sliders size={16} />,
                }}
                className="p-6 flex flex-col gap-5"
              >
                <NeonHorizonSlider
                  label="CAMSHAFT INTAKE DURATION"
                  value={engine.camDuration}
                  min={230}
                  max={330}
                  unit="°"
                  onChange={(val) => updateEngine({ camDuration: val })}
                  color="gold"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <NeonHorizonSlider
                    label="CAM TIMING ADVANCE"
                    value={engine.camTiming}
                    min={-15}
                    max={15}
                    unit="°"
                    onChange={(val) => updateEngine({ camTiming: val })}
                    color="cyan"
                  />
                  <NeonHorizonSlider
                    label="CAM LIFT"
                    value={engine.camLift}
                    min={8}
                    max={16}
                    step={0.5}
                    unit="mm"
                    onChange={(val) => updateEngine({ camLift: val })}
                    color="magenta"
                  />
                </div>
              </NeonHorizonGlassPanel>
            )}

            {activeTab === "forced_induction" && (
              <NeonHorizonGlassPanel
                variant="primary"
                corners="reticle"
                header={{
                  title: "TURBOCHARGING & FORCED INDUCTION",
                  subtitle: "Intercooler sizing, boost pressure map, and spool thresholds",
                  icon: <Flame size={16} />,
                }}
                className="p-6 flex flex-col gap-5"
              >
                <NeonHorizonSelect
                  label="ASPIRATION TYPE"
                  value={engine.intake}
                  onChange={(val) => updateEngine({ intake: val as IntakeType })}
                  options={[
                    { value: "na", label: "Naturally Aspirated (High-Rev NA)", sublabel: "Instant linear throttle response" },
                    { value: "twin_turbo", label: "Twin-Scroll Parallel Turbochargers", sublabel: "Massive mid-range boost torque" },
                    { value: "supercharger", label: "Twin-Screw Positive Displacement Blower", sublabel: "Instant off-idle low end power" },
                    { value: "compound_turbo", label: "Compound Twin-Charged (Turbo + Supercharger)", sublabel: "Zero lag across entire power band" },
                  ]}
                />

                {engine.intake !== "na" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <NeonHorizonSlider
                      label="TARGET BOOST PRESSURE"
                      value={engine.boostPressure}
                      min={0.2}
                      max={2.8}
                      step={0.05}
                      unit="BAR"
                      onChange={(val) => updateEngine({ boostPressure: val })}
                      color="magenta"
                    />
                    <NeonHorizonSlider
                      label="INTERCOOLER THERMAL CAPACITY"
                      value={engine.intercoolerEff * 100}
                      min={50}
                      max={98}
                      unit="%"
                      onChange={(val) => updateEngine({ intercoolerEff: val / 100 })}
                      color="cyan"
                    />
                  </div>
                )}
              </NeonHorizonGlassPanel>
            )}

            {activeTab === "fuel_ecu" && (
              <NeonHorizonGlassPanel
                variant="primary"
                corners="reticle"
                header={{
                  title: "FUEL INJECTION & ECU IGNITION CALIBRATION",
                  subtitle: "Direct injection pulse width, AFR target map, and ignition advance",
                  icon: <Zap size={16} />,
                }}
                className="p-6 flex flex-col gap-5"
              >
                <NeonHorizonSelect
                  label="FUEL DELIVERY SYSTEM"
                  value={engine.fuelSystem}
                  onChange={(val) => updateEngine({ fuelSystem: val as FuelSystemType })}
                  options={[
                    { value: "direct", label: "350-Bar Common-Rail Direct Injection", sublabel: "Ultra-fine atomization & knock resistance" },
                    { value: "port", label: "Multi-Point Sequential Port Injection", sublabel: "Valve cooling and high mass flow" },
                    { value: "dual_injection", label: "Dual Direct + Port Staged Injection", sublabel: "Zero carbon buildup + maximum top end" },
                  ]}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <NeonHorizonSlider
                    label="IGNITION TIMING ADVANCE"
                    value={engine.ignitionTiming || 28}
                    min={10}
                    max={42}
                    unit="° BTDC"
                    onChange={(val) => updateEngine({ ignitionTiming: val })}
                    color="gold"
                  />
                  <NeonHorizonSlider
                    label="TARGET AIR-FUEL RATIO (AFR)"
                    value={engine.afr || 12.4}
                    min={10.5}
                    max={14.7}
                    step={0.1}
                    unit="AFR"
                    onChange={(val) => updateEngine({ afr: val })}
                    color="emerald"
                  />
                </div>
              </NeonHorizonGlassPanel>
            )}
          </div>

          {/* Right Live Telemetry & Dyno Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <NeonHorizonGlassPanel
              variant="window"
              glow="cyan"
              corners="reticle"
              header={{
                title: "DYNAMOMETER PERFORMANCE",
                subtitle: `${engine.layout.toUpperCase()} · ${displacementCc} cc · ${engine.intake.toUpperCase()}`,
                icon: <Activity size={16} />,
                badge: <NeonHorizonBadge variant="live">LIVE CALC</NeonHorizonBadge>,
              }}
              className="p-6 flex flex-col gap-5"
            >
              <div className="grid grid-cols-2 gap-3">
                <NeonHorizonDataCard label="PEAK POWER" value={sim.peakPower} unit="HP" accentColor="cyan" />
                <NeonHorizonDataCard label="PEAK TORQUE" value={sim.peakTorque} unit="Nm" accentColor="gold" />
                <NeonHorizonDataCard label="DISPLACEMENT" value={(displacementCc / 1000).toFixed(1)} unit="L" accentColor="emerald" />
                <NeonHorizonDataCard label="REDLINE" value={engine.redline} unit="RPM" accentColor="magenta" />
              </div>

              {/* Firing Cylinder Indicator */}
              <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-black/40 border border-white/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  CYLINDER FIRING SEQUENCE
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {Array.from({ length: engine.layout.startsWith("v12") ? 12 : 8 }).map((_, idx) => {
                    const cylNum = idx + 1;
                    const isFiring = firingCylinder === cylNum;
                    return (
                      <div
                        key={cylNum}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono transition-all ${
 isFiring
 ? "bg-sky-300 text-slate-950 scale-110"
 : "bg-white/[0.04] text-slate-400 border border-white/6"
 }`}
                      >
                        {cylNum}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Thermal Safety Gauge */}
              <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    THERMAL KNOCK SAFETY MARGIN
                  </span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">94% SAFE</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-rose-500 w-[94%]" />
                </div>
              </div>
            </NeonHorizonGlassPanel>
          </div>
        </div>
      )}
    </div>
  );
}
