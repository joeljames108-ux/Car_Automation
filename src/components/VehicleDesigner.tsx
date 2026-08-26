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
  PLATFORMS,
  CHASSIS_TYPES,
  SUSPENSION_TYPES,
  BRAKE_TYPES,
  TIRE_COMPOUNDS,
  DRIVE_TYPES,
  ENGINE_POSITIONS,
  BODY_TYPES,
  RIM_DESIGNS,
  RIM_FINISHES,
  PAINT_FINISHES,
  HEADLIGHT_TYPES,
  TAILLIGHT_TYPES,
  BODY_KITS,
  SPOILER_TYPES,
  ROOF_SCOOPS,
  MIRROR_TYPES,
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
  PlatformType,
  ChassisType,
  SuspensionType,
  BrakeType,
  TireCompound,
  DriveType,
  EnginePosition,
  BodyType,
  RimDesign,
  RimFinish,
  PaintFinish,
  HeadlightType,
  TaillightType,
  BodyKit,
  SpoilerType,
  RoofScoopType,
  ExteriorConfig,
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
import { ExteriorDesignerIntegration } from "./vehicleAssembly/exterior/ExteriorDesignerIntegration";
import { MasterVehicleStudio } from "./vehicleAssembly/MasterVehicleStudio";
import { VehicleComparisonStudio } from "./vehicleAssembly/VehicleComparisonStudio";
import { GrandAutomotiveStudioHub } from "./GrandAutomotiveStudioHub";
import { AerodynamicsStudio } from "./aerodynamics/AerodynamicsStudio";
import { WindTunnelAeroStudio } from "./aerodynamics/WindTunnelAeroStudio";
import { CFDView } from "./ui/CFDView";
import { LineChart } from "./ui/LineChart";
import { ModularLinearAssemblyStudio } from "./vehicleAssembly/ModularLinearAssemblyStudio";

export type VehicleStudioSubTab =
  | "linear_assembly"
  | "exterior"
  | "aero"
  | "suite_and_benchmark";

const PAINT_SWATCHES = [
  "#e11d48", "#dc2626", "#ea580c", "#f59e0b", "#facc15", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#3b82f6", "#2563eb",
  "#1e40af", "#7c3aed", "#a855f7", "#ec4899", "#f43f5e", "#0f172a",
  "#1e293b", "#475569", "#94a3b8", "#e2e8f0", "#f8fafc", "#92400e",
];

const BADGE_SWATCHES = ["#e11d48", "#facc15", "#22d3ee", "#e2e8f0", "#0f172a", "#84cc16"];

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

function BodyPreview({ bodyType, finish }: { bodyType: BodyType; finish: PaintFinish }) {
  return (
    <div className="relative bg-gradient-to-b from-base-900 to-base-950 rounded-xl overflow-hidden border border-base-800 shadow-inner">
      <img src="/agera.png" alt="Car Preview" loading="lazy" decoding="async" className="w-full h-auto block object-cover" />
      <div className="absolute top-2 left-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
        {BODY_TYPES[bodyType]?.label || "Coupe"} · {PAINT_FINISHES[finish]?.label || "Gloss"}
      </div>
    </div>
  );
}

interface VehicleDesignerProps {
  initialSubTab?: VehicleStudioSubTab;
}

export function VehicleDesigner({ initialSubTab = "linear_assembly" }: VehicleDesignerProps) {
  const { design, sim, setDesign, updateVehicle, updateExterior, updateAeroResearch } = useDesign();
  const v = design.vehicle;
  const ext = v.exterior;
  const ar = v.aeroResearch;

  const [activeTab, setActiveTab] = useState<VehicleStudioSubTab>(initialSubTab);

  // Sub-view selectors for consolidated studios
  const [exteriorViewMode, setExteriorViewMode] = useState<"paint_and_styling" | "biw_assembly">("paint_and_styling");
  const [aeroViewMode, setAeroViewMode] = useState<"studio_3d" | "cfd_windtunnel" | "research_depts">("studio_3d");
  const [suiteViewMode, setSuiteViewMode] = useState<"benchmark_ab" | "grand_suite">("benchmark_ab");
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
      id: "linear_assembly" as const,
      label: "UNIFIED LINEAR ASSEMBLY & VEHICLE ENGINEERING",
      icon: <Wrench size={14} />,
      badge: "12 STAGES • 50 TYPES • KINEMATICS",
    },
    {
      id: "exterior" as const,
      label: "EXTERIOR STYLING & PAINT",
      icon: <Paintbrush size={14} />,
      badge: "PAINT • RIMS • BIW",
    },
    {
      id: "aero" as const,
      label: "AERO & WIND TUNNEL LAB",
      icon: <Wind size={14} />,
      badge: "CFD • ACTIVE DRS",
    },
    {
      id: "suite_and_benchmark" as const,
      label: "BENCHMARK & GRAND SUITE",
      icon: <Crown size={14} />,
      badge: "A/B • FLEET",
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
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 flex items-center justify-center">
              <Car size={22} className="text-cyan-500 animate-pulse" />
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
                {activeTab === "linear_assembly" && "Flagship End-to-End Vehicle Engineering • 12-Stage Linear Assembly • 3D Kinematics • Packaging Diagnostics"}
                {activeTab === "exterior" && "Paint Booth & Finishes • Custom Rims & Calipers • Widebody Kits • 3D Body-in-White Assembly"}
                {activeTab === "aero" && "3D Parametric Aero Studio • CFD Wind Tunnel Streamlines • 10-Dept Aero Research & Active DRS"}
                {activeTab === "suite_and_benchmark" && "A/B Car Benchmark & Circuit Lap Time Battles • Grand Automotive Fleet Hub"}
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
              <span className="font-bold text-cyan-600 dark:text-cyan-300">Cd {sim.dragCoeff.toFixed(3)}</span>
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
                    ? "bg-cyan-500/20 text-cyan-700 dark:text-cyan-200 border border-cyan-500/50 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-base-800/40 border border-transparent"
                }`}
              >
                <span className={isActive ? "text-cyan-600 dark:text-cyan-300" : "text-slate-500 dark:text-slate-400"}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                      isActive
                        ? "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40"
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
          FLAGSHIP: UNIFIED LINEAR ASSEMBLY & VEHICLE ENGINEERING SUITE
          ========================================================================= */}
      {activeTab === "linear_assembly" && (
        <div className="animate-stage-transition-enter">
          <ModularLinearAssemblyStudio />
        </div>
      )}

      {/* =========================================================================
          STUDIO 3: UNIFIED EXTERIOR STYLING & PAINT BOOTH
          ========================================================================= */}
      {activeTab === "exterior" && (
        <div className="space-y-4 animate-stage-transition-enter">
          {/* Sub-Studio Mode Switcher */}
          <div className="panel p-3.5 rounded-2xl flex items-center justify-between flex-wrap gap-2 shadow-md">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  playHMIClickSound();
                  setExteriorViewMode("paint_and_styling");
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                  exteriorViewMode === "paint_and_styling"
                    ? "bg-cyan-500/20 border-cyan-500/60 text-cyan-700 dark:text-cyan-200 shadow-sm"
                    : "bg-base-850/80 border-base-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <Palette size={14} className={exteriorViewMode === "paint_and_styling" ? "text-cyan-600 dark:text-cyan-400" : ""} />
                🎨 PAINT BOOTH, RIMS & STYLING
              </button>
              <button
                onClick={() => {
                  playHMIClickSound();
                  setExteriorViewMode("biw_assembly");
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                  exteriorViewMode === "biw_assembly"
                    ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-700 dark:text-emerald-200 shadow-sm"
                    : "bg-base-850/80 border-base-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <Layers size={14} className={exteriorViewMode === "biw_assembly" ? "text-emerald-600 dark:text-emerald-400" : ""} />
                🧩 3D BODY-IN-WHITE (BIW) WORKSTATION
              </button>
            </div>
            <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
              Active Color: <span className="font-bold text-slate-900 dark:text-slate-200">{ext.paintColor}</span> ({PAINT_FINISHES[ext.paintFinish]?.label || "Gloss"})
            </div>
          </div>

          {exteriorViewMode === "biw_assembly" ? (
            <ExteriorDesignerIntegration />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="xl:col-span-2 space-y-4 stagger">
                {/* Body Type Selection */}
                <Section title="Body Type & Aerodynamic Silhouette" icon={<Car size={16} />}>
                  <div className="mb-3">
                    <ChoiceGrid<BodyType>
                      value={ext.bodyType}
                      options={(Object.keys(BODY_TYPES) as BodyType[]).map((b) => ({
                        value: b,
                        label: BODY_TYPES[b].label,
                      }))}
                      onChange={(val) => updateExterior({ bodyType: val })}
                      columns={6}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-base-850 rounded-lg p-2.5 border border-base-800">
                      <div className="label-mono text-slate-500">Design Origin</div>
                      <div className="text-slate-300 font-semibold">{BODY_TYPES[ext.bodyType].origin}</div>
                    </div>
                    <div className="bg-base-850 rounded-lg p-2.5 border border-base-800">
                      <div className="label-mono text-slate-500">Aerodynamic Impact</div>
                      <div className="text-cyan-300 font-mono">
                        Cd {BODY_TYPES[ext.bodyType].dragDelta >= 0 ? "+" : ""}
                        {BODY_TYPES[ext.bodyType].dragDelta.toFixed(3)} · Cl{" "}
                        {BODY_TYPES[ext.bodyType].liftDelta >= 0 ? "+" : ""}
                        {BODY_TYPES[ext.bodyType].liftDelta.toFixed(3)}
                      </div>
                    </div>
                    <div className="bg-base-850 rounded-lg p-2.5 border border-base-800">
                      <div className="label-mono text-slate-500">Weight Δ</div>
                      <div className="text-amber-300 font-mono">
                        {BODY_TYPES[ext.bodyType].weightDelta > 0 ? "+" : ""}
                        {BODY_TYPES[ext.bodyType].weightDelta} kg
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 font-mono">{BODY_TYPES[ext.bodyType].description}</p>
                </Section>

                {/* Paint & Finish */}
                <Section title="Paint Booth & Surface Finish" icon={<Palette size={16} />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label-mono mb-2 block text-xs font-semibold text-slate-300">
                        Bodywork Paint Swatches
                      </label>
                      <div className="grid grid-cols-8 gap-1.5">
                        {PAINT_SWATCHES.map((c) => (
                          <button
                            key={c}
                            onClick={() => updateExterior({ paintColor: c })}
                            className={`h-7 rounded-md border-2 transition-all cursor-pointer ${
                              ext.paintColor === c
                                ? "border-cyan-400 scale-110 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                : "border-base-800 hover:border-base-600 hover:scale-105"
                            }`}
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-3 mt-3 p-2 bg-base-850 rounded-lg border border-base-800">
                        <input
                          type="color"
                          value={ext.paintColor}
                          onChange={(e) => updateExterior({ paintColor: e.target.value })}
                          className="h-8 w-12 bg-transparent border border-base-800 rounded cursor-pointer"
                        />
                        <span className="font-mono text-xs text-cyan-300 font-bold">{ext.paintColor}</span>
                        <span className="text-[10px] text-slate-500 font-mono">(Custom Hex Code)</span>
                      </div>
                    </div>

                    <div>
                      <Select<PaintFinish>
                        label="Surface Paint Finish"
                        value={ext.paintFinish}
                        options={(Object.keys(PAINT_FINISHES) as PaintFinish[]).map((f) => ({
                          value: f,
                          label: PAINT_FINISHES[f].label,
                        }))}
                        onChange={(val) => updateExterior({ paintFinish: val })}
                      />
                      <div className="mt-4">
                        <label className="label-mono mb-2 block text-xs font-semibold text-slate-300">
                          Badge & Accent Color
                        </label>
                        <div className="flex gap-2">
                          {BADGE_SWATCHES.map((c) => (
                            <button
                              key={c}
                              onClick={() => updateExterior({ badgeColor: c })}
                              className={`h-8 w-8 rounded-full border-2 transition-all cursor-pointer ${
                                ext.badgeColor === c
                                  ? "border-cyan-400 scale-110 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                  : "border-base-800 hover:border-base-600"
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Section>

                {/* Wheels & Rims */}
                <Section title="Wheels & Custom Rims Studio" icon={<Disc size={16} />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select<RimDesign>
                      label="Rim Spoke Architecture"
                      value={ext.rimDesign}
                      options={(Object.keys(RIM_DESIGNS) as RimDesign[]).map((r) => ({
                        value: r,
                        label: RIM_DESIGNS[r].label,
                      }))}
                      onChange={(val) => updateExterior({ rimDesign: val })}
                    />
                    <Select<RimFinish>
                      label="Rim Finish & Coating"
                      value={ext.rimFinish}
                      options={(Object.keys(RIM_FINISHES) as RimFinish[]).map((r) => ({
                        value: r,
                        label: RIM_FINISHES[r].label,
                      }))}
                      onChange={(val) => updateExterior({ rimFinish: val })}
                    />
                    <Slider
                      label="Rim Diameter"
                      value={ext.rimDiameter}
                      min={15}
                      max={22}
                      unit='"'
                      onChange={(val) => updateExterior({ rimDiameter: val })}
                    />
                    <Slider
                      label="Rim Width"
                      value={ext.rimWidth}
                      min={7}
                      max={13}
                      step={0.5}
                      unit='"'
                      onChange={(val) => updateExterior({ rimWidth: val })}
                    />
                  </div>
                </Section>

                {/* Lighting Architecture */}
                <Section title="Optics & Lighting Technology" icon={<Lightbulb size={16} />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select<HeadlightType>
                      label="Headlights Architecture"
                      value={ext.headlightType}
                      options={(Object.keys(HEADLIGHT_TYPES) as HeadlightType[]).map((h) => ({
                        value: h,
                        label: HEADLIGHT_TYPES[h].label,
                      }))}
                      onChange={(val) => updateExterior({ headlightType: val })}
                    />
                    <Select<TaillightType>
                      label="Taillights & Lightbar"
                      value={ext.taillightType}
                      options={(Object.keys(TAILLIGHT_TYPES) as TaillightType[]).map((t) => ({
                        value: t,
                        label: TAILLIGHT_TYPES[t].label,
                      }))}
                      onChange={(val) => updateExterior({ taillightType: val })}
                    />
                  </div>
                </Section>

                {/* Body Kit & Aero Add-ons */}
                <Section title="Body Kit & Aerodynamic Appendages" icon={<Layers size={16} />}>
                  <div className="mb-3">
                    <label className="label-mono mb-1.5 block text-xs font-semibold text-slate-300">Aerodynamic Body Kit</label>
                    <ChoiceGrid<BodyKit>
                      value={ext.bodyKit}
                      options={(Object.keys(BODY_KITS) as BodyKit[]).map((k) => ({
                        value: k,
                        label: BODY_KITS[k].label,
                      }))}
                      onChange={(val) => updateExterior({ bodyKit: val })}
                      columns={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select<SpoilerType>
                      label="Rear Wing / Spoiler"
                      value={ext.spoilerType}
                      options={(Object.keys(SPOILER_TYPES) as SpoilerType[]).map((s) => ({
                        value: s,
                        label: SPOILER_TYPES[s].label,
                      }))}
                      onChange={(val) => updateExterior({ spoilerType: val })}
                    />
                    <Select<RoofScoopType>
                      label="Roof Air Scoop"
                      value={ext.roofScoop}
                      options={(Object.keys(ROOF_SCOOPS) as RoofScoopType[]).map((r) => ({
                        value: r,
                        label: ROOF_SCOOPS[r].label,
                      }))}
                      onChange={(val) => updateExterior({ roofScoop: val })}
                    />
                    <Select
                      label="Aerodynamic Mirrors"
                      value={ext.mirrorType}
                      options={(Object.keys(MIRROR_TYPES) as string[]).map((m) => ({
                        value: m,
                        label: MIRROR_TYPES[m].label,
                      }))}
                      onChange={(val) => updateExterior({ mirrorType: val as ExteriorConfig["mirrorType"] })}
                    />
                    <Slider
                      label="Front Lip Extension"
                      value={ext.frontLipExtension}
                      min={0}
                      max={1}
                      step={0.05}
                      format={(v) => `${(v * 100).toFixed(0)}%`}
                      onChange={(val) => updateExterior({ frontLipExtension: val })}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                    <Toggle label="Hood Air Scoop" value={ext.hoodScoop} onChange={(val) => updateExterior({ hoodScoop: val })} />
                    <Toggle label="Ground Skirts" value={ext.sideSkirts} onChange={(val) => updateExterior({ sideSkirts: val })} />
                    <Toggle label="Fender Louvers" value={ext.fenderVents} onChange={(val) => updateExterior({ fenderVents: val })} />
                    <Toggle label="Carbon Splitter" value={ext.splitter} onChange={(val) => updateExterior({ splitter: val })} />
                    <Toggle label="Motorsport Tow Hook" value={ext.towHook} onChange={(val) => updateExterior({ towHook: val })} />
                  </div>
                </Section>
              </div>

              {/* Right column: Live Body Preview */}
              <div className="space-y-4">
                <Section title="Live 2.5D Bodywork Preview" icon={<Car size={16} />}>
                  <BodyPreview bodyType={ext.bodyType} finish={ext.paintFinish} />
                </Section>

                <Section title="Aero & Dynamics Delta" icon={<Wind size={16} />}>
                  <div className="grid grid-cols-2 gap-2">
                    <StatTile label="Drag Cd" value={sim.dragCoeff.toFixed(3)} accent="accent" />
                    <StatTile label="Lift Cl" value={sim.liftCoeff.toFixed(3)} accent="accent" />
                    <StatTile label="Downforce @ 200" value={sim.downforce} unit="N" accent="ok" />
                    <StatTile label="Curb Weight" value={sim.weight} unit="kg" />
                    <StatTile label="Est. Top Speed" value={sim.topSpeed} unit="km/h" accent="accent" />
                    <StatTile label="0-100 km/h" value={sim.accel0_100} unit="s" accent="ok" />
                  </div>
                </Section>
              </div>
            </div>
          )}
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
                    ? "bg-cyan-500/20 border-cyan-400/60 text-cyan-700 dark:text-cyan-200 shadow-sm"
                    : "bg-base-850/80 border-base-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <Wind size={14} className={aeroViewMode === "cfd_windtunnel" ? "text-cyan-600 dark:text-cyan-400" : ""} />
                🌪️ CFD WIND TUNNEL & FLOWFIELD
              </button>
              <button
                onClick={() => {
                  playHMIClickSound();
                  setAeroViewMode("research_depts");
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                  aeroViewMode === "research_depts"
                    ? "bg-purple-500/20 border-purple-400/60 text-purple-700 dark:text-purple-200 shadow-sm"
                    : "bg-base-850/80 border-base-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <BarChart3 size={14} className={aeroViewMode === "research_depts" ? "text-purple-600 dark:text-purple-400" : ""} />
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
                  <Wind size={20} className="text-cyan-400" />
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
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 transition-all shadow-sm"
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
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 transition-all shadow-sm"
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
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
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
                              { data: sim.dragVsSpeed.map((d) => ({ x: d.speed, y: d.downforce })), color: "#10b981", label: "Downforce (N)" },
                              { data: sim.dragVsSpeed.map((d) => ({ x: d.speed, y: d.drag })), color: "#06b6d4", label: "Drag Force (N)" },
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
                        <span className="text-cyan-400">{Math.round(sim.downforce * (1 - sim.aeroBalance))} N</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-base-800 overflow-hidden flex">
                        <div style={{ width: `${(1 - sim.aeroBalance) * 100}%` }} className="bg-cyan-500 h-full transition-all" />
                        <div style={{ width: `${sim.aeroBalance * 100}%` }} className="bg-purple-500 h-full transition-all" />
                      </div>
                      <div className="flex justify-between text-slate-400 font-bold pt-1">
                        <span>Rear Axle Downforce</span>
                        <span className="text-purple-400">{Math.round(sim.downforce * sim.aeroBalance)} N</span>
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
          STUDIO 5: UNIFIED BENCHMARK & GRAND SUITE
          ========================================================================= */}
      {activeTab === "suite_and_benchmark" && (
        <div className="space-y-4 animate-stage-transition-enter">
          {/* Sub-Studio Mode Switcher */}
          <div className="panel p-3.5 rounded-2xl flex items-center justify-between flex-wrap gap-2 shadow-md">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  playHMIClickSound();
                  setSuiteViewMode("benchmark_ab");
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                  suiteViewMode === "benchmark_ab"
                    ? "bg-cyan-500/20 border-cyan-500/60 text-cyan-700 dark:text-cyan-200 shadow-sm"
                    : "bg-base-850/80 border-base-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <GitCompare size={14} className={suiteViewMode === "benchmark_ab" ? "text-cyan-600 dark:text-cyan-400" : ""} />
                🏎️ A/B VEHICLE BENCHMARK & TRACK BATTLE
              </button>
              <button
                onClick={() => {
                  playHMIClickSound();
                  setSuiteViewMode("grand_suite");
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                  suiteViewMode === "grand_suite"
                    ? "bg-amber-500/20 border-amber-500/60 text-amber-700 dark:text-amber-200 shadow-sm"
                    : "bg-base-850/80 border-base-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <Crown size={14} className={suiteViewMode === "grand_suite" ? "text-amber-600 dark:text-amber-400" : ""} />
                👑 GRAND AUTOMOTIVE ENGINEERING SUITE
              </button>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Fleet Status: <span className="font-bold text-amber-400">Master Vehicle Hub Active</span>
            </div>
          </div>

          {suiteViewMode === "benchmark_ab" ? <VehicleComparisonStudio /> : <GrandAutomotiveStudioHub />}
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
