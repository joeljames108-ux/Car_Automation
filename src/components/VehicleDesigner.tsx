import React, { useState, useEffect } from "react";
import {
  Car,
  Disc,
  Settings,
  Cpu,
  Shield,
  Sparkles,
  Wrench,
  Activity,
  Wind,
  Paintbrush,
  Palette,
  Lightbulb,
  Layers,
  Gauge,
  Box,
  GitCompare,
  Crown,
  CarFront,
  Layers3,
  Combine,
  Zap,
  Plane,
  Thermometer,
  Disc3,
  Video,
  BarChart3,
  Check,
  ChevronRight,
  TrendingUp,
  Scale,
} from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { Section, Slider, Select, ChoiceGrid, Toggle, StatTile } from "./ui/Controls";
import {
  FRONT_BUMPER_SHAPES,
  SIDEPOD_INLET_POSITIONS,
  UNDERBODY_FLOOR_TYPES,
  WHEEL_AERO_TYPES,
  MIRROR_AERO_TYPES,
  AERO_MODES,
  ENDPLATE_DESIGNS,
  OIL_COOLER_PLACEMENTS,
} from "../sim/constants";
import { VEHICLE_PRESET_LIBRARY } from "../sim/vehiclePresets";
import type {
  AeroResearchConfig,
  FrontBumperShape,
  UnderbodyFloorType,
  WheelAeroType,
  MirrorAeroType,
  AeroMode,
} from "../sim/types";
import { playHMIClickSound, playHMITabSound } from "../utils/hmiSoundSynth";
import { useVehicleAssemblyStore } from "../state/useVehicleAssemblyStore";
import { VehicleCompletionModal } from "./vehicleAssembly/VehicleCompletionModal";
import { VehicleComparisonStudio } from "./vehicleAssembly/VehicleComparisonStudio";
import { AerodynamicsStudio } from "./aerodynamics/AerodynamicsStudio";
import { WindTunnelAeroStudio } from "./aerodynamics/WindTunnelAeroStudio";
import { CFDView } from "./ui/CFDView";
import { LineChart } from "./ui/LineChart";
import { ModularLinearAssemblyStudio } from "./vehicleAssembly/ModularLinearAssemblyStudio";
import { VehicleArchitectureStudio } from "./vehicleAssembly/VehicleArchitectureStudio";

export type VehicleStudioSubTab =
  | "architecture"
  | "linear_assembly"
  | "aero"
  | "benchmark";

type AeroDept =
  | "front"
  | "sidepod"
  | "diffuser"
  | "underbody"
  | "rearwing"
  | "active"
  | "cooling"
  | "wheel"
  | "mirror"
  | "dashboard";

const AERO_DEPTS: { id: AeroDept; label: string; icon: React.ReactNode }[] = [
  { id: "front", label: "Front Aero", icon: <CarFront size={13} /> },
  { id: "sidepod", label: "Sidepods", icon: <Layers3 size={13} /> },
  { id: "diffuser", label: "Diffuser", icon: <Combine size={13} /> },
  { id: "underbody", label: "Underbody", icon: <Layers3 size={13} /> },
  { id: "rearwing", label: "Rear Wing", icon: <Plane size={13} /> },
  { id: "active", label: "Active Aero", icon: <Zap size={13} /> },
  { id: "cooling", label: "Brake Cooling", icon: <Thermometer size={13} /> },
  { id: "wheel", label: "Wheel Aero", icon: <Disc3 size={13} /> },
  { id: "mirror", label: "Mirrors", icon: <Video size={13} /> },
  { id: "dashboard", label: "CFD Analytics", icon: <BarChart3 size={13} /> },
];

interface VehicleDesignerProps {
  initialSubTab?: VehicleStudioSubTab;
  onSelectStage?: (stage: string) => void;
}

export function VehicleDesigner({ initialSubTab = "architecture", onSelectStage }: VehicleDesignerProps) {
  const { design, sim, setDesign, updateVehicle, updateAeroResearch } = useDesign();
  const v = design.vehicle;
  const ar = v.aeroResearch;

  const [activeTab, setActiveTab] = useState<VehicleStudioSubTab>(initialSubTab);

  // Sub-view selectors for consolidated studios
  const [aeroViewMode, setAeroViewMode] = useState<"studio_3d" | "cfd_windtunnel" | "research_depts">("studio_3d");
  const [aeroDept, setAeroDept] = useState<AeroDept>("dashboard");
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const vehAssembly = useVehicleAssemblyStore(v);

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleTabChange = (tab: VehicleStudioSubTab) => {
    playHMITabSound();
    setActiveTab(tab);
  };

  const handleSelectPreset = (presetId: string) => {
    const item = VEHICLE_PRESET_LIBRARY.find((p) => p.id === presetId);
    if (item) {
      playHMIClickSound();
      setDesign(item.generator());
    }
  };

  const updateAeroDept = <K extends keyof AeroResearchConfig>(key: K, patch: Partial<AeroResearchConfig[K]>) => {
    updateAeroResearch({
      [key]: typeof ar[key] === "object" ? { ...(ar[key] as object), ...patch } : patch,
    } as Partial<AeroResearchConfig>);
  };

  const tabsConfig = [
    {
      id: "architecture" as const,
      label: "VEHICLE ARCHITECTURE",
      icon: <Shield size={14} />,
      badge: "SEDAN • HATCH • CROSS • SUV",
    },
    {
      id: "linear_assembly" as const,
      label: "UNIFIED LINEAR ASSEMBLY",
      icon: <Wrench size={14} />,
      badge: "12 STAGES • KINEMATICS",
    },
    {
      id: "aero" as const,
      label: "AERO & WIND TUNNEL LAB",
      icon: <Wind size={14} />,
      badge: "CFD • ACTIVE DRS",
    },
    {
      id: "benchmark" as const,
      label: "A/B BENCHMARK LAB",
      icon: <GitCompare size={14} />,
      badge: "A/B BATTLE",
    },
  ];

  return (
    <div className="space-y-4">
      {/* =========================================================================
          TOP UNIFIED VEHICLE STUDIO NAVIGATION RIBBON
          ========================================================================= */}
      <div className="panel p-4 rounded-3xl flex flex-col gap-3.5 shadow-xl transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Header Title & Subsystem Status */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 flex items-center justify-center">
              <Car size={22} className="text-amber-500 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-extrabold tracking-wider uppercase font-mono text-slate-900 dark:text-slate-100">
                  UNIFIED VEHICLE ARCHITECTURE & ENGINEERING SUITE
                </h2>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  UNIFIED MASTER CHAIN
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-0.5">
                {activeTab === "architecture" && "Modular Engineering Platform • Sedan, Hatchback, Crossover & SUV • Discrete GLB Foundation"}
                {activeTab === "linear_assembly" && "Flagship End-to-End Vehicle Engineering • 12-Stage Linear Assembly • 3D Kinematics • Packaging Diagnostics"}
                {activeTab === "aero" && "3D Parametric Aero Studio • CFD Wind Tunnel Streamlines • 10-Dept Aero Research & Active DRS"}
                {activeTab === "benchmark" && "A/B Car Benchmark & Circuit Lap Time Battles • Multi-Car Head-to-Head Comparison"}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2 flex-wrap bg-base-800/40 p-1.5 rounded-2xl border border-base-700/40 font-mono text-[11px]">
            <div className="px-2.5 py-1 rounded-xl bg-base-850 border border-base-800 flex items-center">
              <span className="text-slate-500 dark:text-slate-400 mr-1.5">WEIGHT</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{Math.round(sim.weight || 1480)} kg</span>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-base-850 border border-base-800 flex items-center">
              <span className="text-slate-500 dark:text-slate-400 mr-1.5">DRAG</span>
              <span className="font-bold text-amber-600 dark:text-amber-300">Cd {sim.dragCoeff.toFixed(3)}</span>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-base-850 border border-base-800 flex items-center">
              <span className="text-slate-500 dark:text-slate-400 mr-1.5">DOWNFORCE</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-300">{sim.downforce} N</span>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-base-850 border border-base-800 flex items-center">
              <span className="text-slate-500 dark:text-slate-400 mr-1.5">0-100</span>
              <span className="font-bold text-amber-600 dark:text-amber-300">{sim.accel0_100?.toFixed(1) || "3.8"}s</span>
            </div>
          </div>
        </div>

        {/* Studio Sub-Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-base-800/50 select-none">
          {tabsConfig.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-200 border border-amber-500/50 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-base-800/40 border border-transparent"
                }`}
              >
                <span className={isActive ? "text-amber-600 dark:text-amber-300" : "text-slate-500 dark:text-slate-400"}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                      isActive
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40"
                        : "bg-base-800/80 text-slate-500 dark:text-slate-400 border border-base-700/40"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          STAGE 0: VEHICLE ARCHITECTURE & ENGINEERING PLATFORM
          ========================================================================= */}
      {activeTab === "architecture" && (
        <div className="animate-stage-transition-enter">
          <VehicleArchitectureStudio
            onEnterDesignStudio={() => {
              if (onSelectStage) {
                onSelectStage("exterior");
              } else {
                setActiveTab("linear_assembly");
              }
            }}
          />
        </div>
      )}

      {/* =========================================================================
          FLAGSHIP: UNIFIED LINEAR ASSEMBLY & VEHICLE ENGINEERING SUITE
          ========================================================================= */}
      {activeTab === "linear_assembly" && (
        <div className="animate-stage-transition-enter">
          <ModularLinearAssemblyStudio />
        </div>
      )}

      {/* =========================================================================
          STUDIO 4: UNIFIED AERODYNAMICS & WIND TUNNEL LAB
          ========================================================================= */}
      {activeTab === "aero" && (
        <div className="space-y-4 animate-stage-transition-enter">
          {/* Aero Sub-Studio Switcher */}
          <div className="panel p-3.5 rounded-2xl flex items-center justify-between flex-wrap gap-2 shadow-md">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  playHMIClickSound();
                  setAeroViewMode("studio_3d");
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                  aeroViewMode === "studio_3d"
                    ? "bg-accent-500/20 border-accent-500/60 text-accent-700 dark:text-accent-300 shadow-sm"
                    : "bg-base-850/80 border-base-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <Box size={14} className={aeroViewMode === "studio_3d" ? "text-accent-600 dark:text-accent-400" : ""} />
                🔬 PARAMETRIC 3D AERO STUDIO
              </button>
              <button
                onClick={() => {
                  playHMIClickSound();
                  setAeroViewMode("cfd_windtunnel");
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                  aeroViewMode === "cfd_windtunnel"
                    ? "bg-amber-500/20 border-amber-400/60 text-amber-700 dark:text-amber-200 shadow-sm"
                    : "bg-base-850/80 border-base-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <Wind size={14} className={aeroViewMode === "cfd_windtunnel" ? "text-amber-600 dark:text-amber-400" : ""} />
                🌪️ CFD WIND TUNNEL & FLOWFIELD
              </button>
              <button
                onClick={() => {
                  playHMIClickSound();
                  setAeroViewMode("research_depts");
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                  aeroViewMode === "research_depts"
                    ? "bg-amber-500/20 border-amber-400/60 text-amber-700 dark:text-amber-200 shadow-sm"
                    : "bg-base-850/80 border-base-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <BarChart3 size={14} className={aeroViewMode === "research_depts" ? "text-amber-600 dark:text-amber-400" : ""} />
                📊 10-DEPT AERO RESEARCH & DRS
              </button>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span>CFD State:</span>
              <span className="text-emerald-400 font-semibold">Active Navier-Stokes Mesh</span>
            </div>
          </div>

          {aeroViewMode === "studio_3d" ? (
            <AerodynamicsStudio />
          ) : aeroViewMode === "cfd_windtunnel" ? (
            <WindTunnelAeroStudio />
          ) : (
            <div className="space-y-4">
              {/* Quick Auto-Balance Presets */}
              <div className="panel p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Wind size={20} className="text-amber-400" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Aerodynamics Research Center</h3>
                    <p className="text-[11px] text-slate-500">Fine-tune downforce distribution, ground effects & active aero</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-mono font-semibold">AUTO BALANCE:</span>
                  <button
                    onClick={() => {
                      playHMIClickSound();
                      updateAeroDept("rearWing", { angleOfAttack: 12, elements: 2, gurneyFlap: true });
                      updateAeroDept("front", { splitterExtension: 120, splitterAngle: 4 });
                      updateAeroDept("diffuser", { angle: 12 });
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all shadow-sm"
                  >
                    ⚖️ 50/50 Neutral
                  </button>
                  <button
                    onClick={() => {
                      playHMIClickSound();
                      updateAeroDept("rearWing", { angleOfAttack: 22, elements: 3, gurneyFlap: true });
                      updateAeroDept("front", { splitterExtension: 220, splitterAngle: 8, divePlanes: 2 });
                      updateAeroDept("diffuser", { angle: 18, gurneyFlap: true });
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-all shadow-sm"
                  >
                    🏎️ High Downforce
                  </button>
                  <button
                    onClick={() => {
                      playHMIClickSound();
                      updateAeroDept("rearWing", { angleOfAttack: 2, elements: 1, gurneyFlap: false });
                      updateAeroDept("front", { splitterExtension: 40, splitterAngle: 1, divePlanes: 0 });
                      updateAeroDept("diffuser", { angle: 6, gurneyFlap: false });
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-all shadow-sm"
                  >
                    🚀 Low Drag
                  </button>
                </div>
              </div>

              {/* Aero Department Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 bg-base-900 rounded-xl border border-base-800">
                {AERO_DEPTS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      playHMIClickSound();
                      setAeroDept(d.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
                      aeroDept === d.id
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    {d.icon}
                    <span>{d.label}</span>
                  </button>
                ))}
              </div>

              {/* Department Tuning Controls */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2 space-y-4">
                  {aeroDept === "front" && (
                    <Section title="Front Aerodynamics & Splitter" icon={<CarFront size={16} />}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                          label="Front Bumper Shape"
                          value={ar.front.bumperShape}
                          options={Object.keys(FRONT_BUMPER_SHAPES).map((k) => ({
                            value: k,
                            label: FRONT_BUMPER_SHAPES[k as FrontBumperShape].label,
                          }))}
                          onChange={(val) => updateAeroDept("front", { bumperShape: val as FrontBumperShape })}
                        />
                        <Slider
                          label="Splitter Extension (mm)"
                          value={ar.front.splitterExtension}
                          min={0}
                          max={300}
                          unit="mm"
                          onChange={(val) => updateAeroDept("front", { splitterExtension: val })}
                        />
                        <Slider
                          label="Splitter Angle"
                          value={ar.front.splitterAngle}
                          min={0}
                          max={12}
                          unit="°"
                          onChange={(val) => updateAeroDept("front", { splitterAngle: val })}
                        />
                        <Slider
                          label="Canards / Dive Planes"
                          value={ar.front.divePlanes}
                          min={0}
                          max={4}
                          step={1}
                          onChange={(val) => updateAeroDept("front", { divePlanes: val })}
                        />
                      </div>
                    </Section>
                  )}

                  {aeroDept === "rearwing" && (
                    <Section title="Rear Wing Aerofoil & Gurney" icon={<Plane size={16} />}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Slider
                          label="Wing Span (Width)"
                          value={ar.rearWing.span}
                          min={800}
                          max={2000}
                          unit="mm"
                          onChange={(val) => updateAeroDept("rearWing", { span: val })}
                        />
                        <Slider
                          label="Angle of Attack"
                          value={ar.rearWing.angleOfAttack}
                          min={0}
                          max={35}
                          unit="°"
                          onChange={(val) => updateAeroDept("rearWing", { angleOfAttack: val })}
                        />
                        <Slider
                          label="Aerofoil Elements"
                          value={ar.rearWing.elements}
                          min={1}
                          max={3}
                          step={1}
                          onChange={(val) => updateAeroDept("rearWing", { elements: val })}
                        />
                        <Select
                          label="Endplate Design"
                          value={ar.rearWing.endplateDesign}
                          options={ENDPLATE_DESIGNS.map((item) => ({
                            value: item.value,
                            label: item.label,
                          }))}
                          onChange={(val) => updateAeroDept("rearWing", { endplateDesign: val as any })}
                        />
                      </div>
                      <div className="mt-3">
                        <Toggle
                          label="Gurney Flap (Trailing Edge Flap)"
                          value={ar.rearWing.gurneyFlap}
                          onChange={(val) => updateAeroDept("rearWing", { gurneyFlap: val })}
                        />
                      </div>
                    </Section>
                  )}

                  {aeroDept === "diffuser" && (
                    <Section title="Underfloor Diffuser & Venturi Tunnels" icon={<Combine size={16} />}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Slider
                          label="Diffuser Expansion Angle"
                          value={ar.diffuser.angle}
                          min={0}
                          max={25}
                          unit="°"
                          onChange={(val) => updateAeroDept("diffuser", { angle: val })}
                        />
                        <Slider
                          label="Diffuser Strakes (Channels)"
                          value={ar.diffuser.strakes}
                          min={0}
                          max={6}
                          step={1}
                          onChange={(val) => updateAeroDept("diffuser", { strakes: val })}
                        />
                        <Slider
                          label="Diffuser Exit Width"
                          value={ar.diffuser.exitWidth}
                          min={600}
                          max={1600}
                          unit="mm"
                          onChange={(val) => updateAeroDept("diffuser", { exitWidth: val })}
                        />
                        <Toggle
                          label="Diffuser Gurney Edge"
                          value={ar.diffuser.gurneyFlap}
                          onChange={(val) => updateAeroDept("diffuser", { gurneyFlap: val })}
                        />
                      </div>
                    </Section>
                  )}

                  {aeroDept === "active" && (
                    <Section title="Active Aerodynamic Actuation (DRS)" icon={<Zap size={16} />}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                          label="Active Aero Mode"
                          value={ar.active.mode}
                          options={Object.keys(AERO_MODES).map((k) => ({
                            value: k,
                            label: AERO_MODES[k as AeroMode].label,
                          }))}
                          onChange={(val) => updateAeroDept("active", { mode: val as AeroMode })}
                        />
                        <Slider
                          label="DRS Opening Angle"
                          value={ar.active.drsOpeningAngle}
                          min={0}
                          max={35}
                          unit="°"
                          onChange={(val) => updateAeroDept("active", { drsOpeningAngle: val })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <Toggle
                          label="Active Drag Reduction System (DRS)"
                          value={ar.active.drs}
                          onChange={(val) => updateAeroDept("active", { drs: val })}
                        />
                        <Toggle
                          label="Active Airbrake on Heavy Deceleration"
                          value={ar.active.airBrake}
                          onChange={(val) => updateAeroDept("active", { airBrake: val })}
                        />
                        <Toggle
                          label="Active Variable Front Splitter"
                          value={ar.active.activeSplitter}
                          onChange={(val) => updateAeroDept("active", { activeSplitter: val })}
                        />
                        <Toggle
                          label="Adaptive High-Downforce Wing"
                          value={ar.active.adaptiveWing}
                          onChange={(val) => updateAeroDept("active", { adaptiveWing: val })}
                        />
                      </div>
                    </Section>
                  )}

                  {aeroDept === "dashboard" && (
                    <div className="space-y-4">
                      <Section title="CFD Flowfield Streamlines & Pressure Map" icon={<Wind size={16} />}>
                        <div className="h-[280px] rounded-xl overflow-hidden border border-base-800">
                          <CFDView
                            aero={design.vehicle.aero}
                            dragCoeff={sim.dragCoeff}
                            liftCoeff={sim.liftCoeff}
                            downforce={sim.downforce}
                          />
                        </div>
                      </Section>
                      <Section title="Aerodynamic Downforce vs Velocity Curve" icon={<TrendingUp size={16} />}>
                        <div className="h-[220px]">
                          <LineChart
                            series={[
                              { data: sim.dragVsSpeed.map((d: { speed: number; downforce: number }) => ({ x: d.speed, y: d.downforce })), color: "#10b981", label: "Downforce (N)" },
                              { data: sim.dragVsSpeed.map((d: { speed: number; drag: number }) => ({ x: d.speed, y: d.drag })), color: "#f59e0b", label: "Drag Force (N)" },
                            ]}
                            xLabel="Speed (km/h)"
                            yLabel="Force (N)"
                          />
                        </div>
                      </Section>
                    </div>
                  )}

                  {aeroDept !== "front" && aeroDept !== "rearwing" && aeroDept !== "diffuser" && aeroDept !== "active" && aeroDept !== "dashboard" && (
                    <Section title={`Aerodynamic Parameters: ${aeroDept.toUpperCase()}`} icon={<Wind size={16} />}>
                      <p className="text-xs text-slate-400 font-mono mb-4">
                        Adjust micro-aero components to optimize boundary layer flow, reduce turbulence, and maximize cooling airflow efficiency.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Slider
                          label="Efficiency Factor"
                          value={85}
                          min={50}
                          max={100}
                          unit="%"
                          onChange={() => {}}
                        />
                        <Slider
                          label="Flow Separation Margin"
                          value={92}
                          min={60}
                          max={100}
                          unit="%"
                          onChange={() => {}}
                        />
                      </div>
                    </Section>
                  )}
                </div>

                {/* Right Column: Live Aero Telemetry Stats */}
                <div className="space-y-4">
                  <Section title="Aero Telemetry Loads" icon={<Gauge size={16} />}>
                    <div className="grid grid-cols-2 gap-2">
                      <StatTile label="Drag Coeff Cd" value={sim.dragCoeff.toFixed(3)} accent="accent" />
                      <StatTile label="Downforce @ 200" value={sim.downforce} unit="N" accent="ok" />
                      <StatTile label="Front Aero Bias" value={`${Math.round((1 - sim.aeroBalance) * 100)}%`} accent="accent" />
                      <StatTile label="Rear Aero Bias" value={`${Math.round(sim.aeroBalance * 100)}%`} />
                      <StatTile label="L/D Ratio" value={(sim.downforce / Math.max(1, sim.dragCoeff * 1000)).toFixed(2)} />
                      <StatTile label="Top Speed" value={sim.topSpeed} unit="km/h" accent="accent" />
                    </div>
                  </Section>

                  <Section title="Downforce Distribution Balance" icon={<Scale size={16} />}>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-slate-400 font-bold">
                        <span>Front Axle Downforce</span>
                        <span className="text-amber-400">{Math.round(sim.downforce * (1 - sim.aeroBalance))} N</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-base-800 overflow-hidden flex">
                        <div style={{ width: `${(1 - sim.aeroBalance) * 100}%` }} className="bg-amber-500 h-full transition-all" />
                        <div style={{ width: `${sim.aeroBalance * 100}%` }} className="bg-amber-500 h-full transition-all" />
                      </div>
                      <div className="flex justify-between text-slate-400 font-bold pt-1">
                        <span>Rear Axle Downforce</span>
                        <span className="text-amber-400">{Math.round(sim.downforce * sim.aeroBalance)} N</span>
                      </div>
                    </div>
                  </Section>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          STUDIO 4: A/B VEHICLE BENCHMARK & TRACK BATTLE
          ========================================================================= */}
      {activeTab === "benchmark" && (
        <div className="space-y-4 animate-stage-transition-enter">
          <VehicleComparisonStudio />
        </div>
      )}

      {/* Assembly Completion Modal */}
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
