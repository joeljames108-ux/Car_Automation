import React, { useState } from "react";
import {
  SlidersHorizontal,
  Clock,
  Sparkles,
  Rocket,
  Box,
  X,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Unlock,
  RotateCcw,
  Calendar,
  FastForward,
  DollarSign,
  Layers,
  Wrench,
  Cog,
  Car,
  Wind,
  Sofa,
  FlaskConical,
  Flag,
  Factory,
  Zap,
} from "lucide-react";
import {
  useDeveloperModeStore,
  TEST_SCENARIOS,
  type TestScenarioId,
  type DevOverrides,
} from "../../state/developerModeStore";
import { useSimulationClockStore } from "../../state/simulationClockStore";
import { formatGameDate } from "../../state/gameClockEngine";
import { DevQuickSpawner } from "./DevQuickSpawner";
import { DevAssetGallery } from "./DevAssetGallery";
import { DevStateInspector } from "./DevStateInspector";
import { Camera } from "lucide-react";
import type { Stage } from "../StageSwitcher";

interface DeveloperControlModalProps {
  onSelectStage: (stage: Stage) => void;
}

export const DeveloperControlModal: React.FC<DeveloperControlModalProps> = ({
  onSelectStage,
}) => {
  const {
    devMode,
    modalOpen,
    activeTab,
    overrides,
    activeScenario,
    setDevMode,
    toggleDevMode,
    setModalOpen,
    setActiveTab,
    setOverride,
    unlockAll,
    resetToPlayerMode,
    applyScenario,
  } = useDeveloperModeStore();

  const clock = useSimulationClockStore();

  // Jump to date local state
  const [jumpYear, setJumpYear] = useState<number>(clock.year);
  const [jumpMonth, setJumpMonth] = useState<number>(clock.month);
  const [jumpDay, setJumpDay] = useState<number>(clock.day);
  const [simYear, setSimYear] = useState<number>(clock.year + 1);

  // Category filter for granular overrides tab
  type OverrideCategory = "all" | "studios" | "tech" | "economy";
  const [overrideCategory, setOverrideCategory] = useState<OverrideCategory>("all");

  if (!modalOpen) return null;

  const OVERRIDE_ITEMS: {
    key: keyof DevOverrides;
    label: string;
    category: "studios" | "tech" | "economy";
    categoryLabel: string;
    description: string;
    impact: string;
    icon: React.ReactNode;
    accentColor: string;
    accentBorder: string;
    accentGlow: string;
  }[] = [
    {
      key: "ignoreWorkflowGating",
      label: "Bypass Sequential Workflow Gating",
      category: "studios",
      categoryLabel: "WORKFLOW GATING",
      description: "Direct entry to Engine, Vehicle, Aero, Interior, & Final Build without stage completion requirements.",
      impact: "Freeform Studio Navigation & Instant Hopping",
      icon: <Layers size={18} className="text-amber-400" />,
      accentColor: "text-amber-400",
      accentBorder: "border-amber-500/50 hover:border-amber-400",
      accentGlow: "rgba(245,158,11,0.2)",
    },
    {
      key: "ignoreEngineLocks",
      label: "Unlock All Engines & Powertrains",
      category: "studios",
      categoryLabel: "ENGINE STUDIO",
      description: "Access V12, W16, Rotary, Twin-Turbo, Hybrid & 800V EV architectures regardless of year.",
      impact: "Zero Year Lockouts, Unlimited Displacements",
      icon: <Cog size={18} className="text-orange-400" />,
      accentColor: "text-orange-400",
      accentBorder: "border-orange-500/50 hover:border-orange-400",
      accentGlow: "rgba(249,115,22,0.2)",
    },
    {
      key: "ignoreVehicleLocks",
      label: "Unlock All Vehicle Platforms & Body Types",
      category: "studios",
      categoryLabel: "CHASSIS & BODY",
      description: "Access carbon monocoques, hypercars, mid-engine setups, SUVs, and custom wheelbases.",
      impact: "All 168+ Vehicle Architecture Combinations",
      icon: <Car size={18} className="text-cyan-400" />,
      accentColor: "text-cyan-400",
      accentBorder: "border-cyan-500/50 hover:border-cyan-400",
      accentGlow: "rgba(6,182,212,0.2)",
    },
    {
      key: "ignoreAeroLocks",
      label: "Unlock All Aero & Active DRS",
      category: "studios",
      categoryLabel: "AERODYNAMICS",
      description: "Access multi-element wings, active DRS flaps, ground-effect Venturi tunnels, and splitters.",
      impact: "Active Aerodynamics & High-Downforce Wings",
      icon: <Wind size={18} className="text-teal-400" />,
      accentColor: "text-teal-400",
      accentBorder: "border-teal-500/50 hover:border-teal-400",
      accentGlow: "rgba(20,184,166,0.2)",
    },
    {
      key: "ignoreInteriorLocks",
      label: "Unlock All Cabin Trims & OLED Displays",
      category: "studios",
      categoryLabel: "COCKPIT & INTERIOR",
      description: "Access curved OLED screens, AR HUDs, racing carbon seats, and bespoke luxury leather.",
      impact: "All 12 Cabin Gadgets & Luxury Upholstery",
      icon: <Sofa size={18} className="text-purple-400" />,
      accentColor: "text-purple-400",
      accentBorder: "border-purple-500/50 hover:border-purple-400",
      accentGlow: "rgba(168,85,247,0.2)",
    },
    {
      key: "ignoreResearchRequirements",
      label: "Bypass R&D Requirements & Tech Trees",
      category: "tech",
      categoryLabel: "R&D RESEARCH",
      description: "Start or apply any advanced technology without prerequisite research or building levels.",
      impact: "Instant Access to Next-Gen Technologies",
      icon: <FlaskConical size={18} className="text-indigo-400" />,
      accentColor: "text-indigo-400",
      accentBorder: "border-indigo-500/50 hover:border-indigo-400",
      accentGlow: "rgba(99,102,241,0.2)",
    },
    {
      key: "ignoreMotorsportRequirements",
      label: "Unlock All Motorsport Series & Circuits",
      category: "tech",
      categoryLabel: "MOTORSPORT RACING",
      description: "Enter Grand Prix races, Le Mans hypercar events, and unlock all world tracks.",
      impact: "Formula 1, GT3, Endurance, Rally & All Series",
      icon: <Flag size={18} className="text-rose-400" />,
      accentColor: "text-rose-400",
      accentBorder: "border-rose-500/50 hover:border-rose-400",
      accentGlow: "rgba(244,63,94,0.2)",
    },
    {
      key: "ignoreFacilityLocks",
      label: "Unlock All Factory Lines & Tooling",
      category: "economy",
      categoryLabel: "MANUFACTURING",
      description: "Maximum production capacity, robotic automation tiers, and infinite stamping throughput.",
      impact: "Tier 4 Factory Automation & Instant Retooling",
      icon: <Factory size={18} className="text-emerald-400" />,
      accentColor: "text-emerald-400",
      accentBorder: "border-emerald-500/50 hover:border-emerald-400",
      accentGlow: "rgba(16,185,129,0.2)",
    },
    {
      key: "infiniteBudget",
      label: "Infinite Capital & Raw Materials",
      category: "economy",
      categoryLabel: "FINANCE & TREASURY",
      description: "Never run out of money or steel/aluminum sheets during rapid prototyping.",
      impact: "Unlimited Balance Sheet ($500M+) & Raw Stock",
      icon: <DollarSign size={18} className="text-yellow-400" />,
      accentColor: "text-yellow-400",
      accentBorder: "border-yellow-500/50 hover:border-yellow-400",
      accentGlow: "rgba(234,179,8,0.2)",
    },
    {
      key: "instantBuild",
      label: "Instant Tooling & Zero Build Delay",
      category: "economy",
      categoryLabel: "TIME & TURNAROUND",
      description: "Zero turnaround time for R&D projects, factory retooling, and vehicle assembly.",
      impact: "0-Day Turnaround on All Projects & Assembly",
      icon: <Zap size={18} className="text-blue-400" />,
      accentColor: "text-blue-400",
      accentBorder: "border-blue-500/50 hover:border-blue-400",
      accentGlow: "rgba(59,130,246,0.2)",
    },
  ];

  const activeCount = Object.values(overrides).filter(Boolean).length;
  const filteredOverrides = OVERRIDE_ITEMS.filter((item) => {
    if (overrideCategory === "all") return true;
    return item.category === overrideCategory;
  });

  const unlockAllStudios = () => {
    setDevMode(true);
    setOverride("ignoreWorkflowGating", true);
    setOverride("ignoreEngineLocks", true);
    setOverride("ignoreVehicleLocks", true);
    setOverride("ignoreAeroLocks", true);
    setOverride("ignoreInteriorLocks", true);
  };

  const maxSandbox = () => {
    setDevMode(true);
    setOverride("infiniteBudget", true);
    setOverride("instantBuild", true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in">
      <div
        className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-[#080c16]/98 border border-amber-500/40 shadow-[0_0_80px_rgba(245,158,11,0.25)] overflow-hidden text-slate-100 select-none dev-matrix-modal dark-surface"
        data-theme="dark"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── TOP HEADER ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.35)]">
              <Wrench size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold font-mono tracking-wider text-white">
                  DEVELOPER CONTROL MATRIX
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                  CTRL+SHIFT+D
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Decoupled progression overrides • Sandbox testing • Asset gallery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Master Dev Mode Switch */}
            <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-slate-950/90 border border-slate-700 shadow-inner">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">DEV SYSTEM</span>
                <span className={`text-xs font-mono font-black ${devMode ? "text-emerald-400" : "text-slate-400"}`}>
                  {devMode ? "ENABLED" : "DISABLED"}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleDevMode}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors cursor-pointer ${
                  devMode ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]" : "bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-md ${
                    devMode ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── TABS NAVIGATION ── */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-white/10 bg-slate-950/70 overflow-x-auto text-xs font-mono">
          {[
            { id: "overrides", label: "Granular Overrides", icon: <SlidersHorizontal size={14} />, badge: `${activeCount}/10` },
            { id: "timemachine", label: "Time Machine & Budget", icon: <Clock size={14} /> },
            { id: "scenarios", label: "Test Scenarios", icon: <Sparkles size={14} /> },
            { id: "spawner", label: "Direct Test Spawner", icon: <Rocket size={14} /> },
            { id: "asset_gallery", label: "3D Asset Gallery", icon: <Box size={14} /> },
            { id: "state_inspector", label: "State & Snapshots", icon: <Camera size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-amber-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.35)]"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${activeTab === tab.id ? "bg-slate-900/30 text-slate-950" : "bg-white/10 text-amber-300"}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── MODAL BODY CONTENT ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: GRANULAR OVERRIDES */}
          {activeTab === "overrides" && (
            <div className="space-y-6">
              {/* Quick Preset Buttons & Active Counter */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 shadow-lg space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-2">
                      <Unlock size={15} />
                      <span className="tracking-wide">RAPID GLOBAL OVERRIDES</span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono">
                      Decouple engineering restrictions for unrestricted sandbox testing, or restore authentic player progression.
                    </p>
                  </div>

                  {/* Active Overrides Status Pill */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700">
                    <span className={`w-2 h-2 rounded-full ${activeCount > 0 && devMode ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {activeCount === 10 ? (
                        <span className="text-emerald-400">10 / 10 FULL SANDBOX UNLOCKED</span>
                      ) : activeCount === 0 ? (
                        <span className="text-slate-400">0 / 10 AUTHENTIC PLAYER MODE</span>
                      ) : (
                        <span>{activeCount} / 10 OVERRIDES ACTIVE</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Segmented Progress Bar */}
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden flex border border-slate-800">
                  {OVERRIDE_ITEMS.map((item, idx) => {
                    const isChecked = overrides[item.key] && devMode;
                    return (
                      <div
                        key={idx}
                        className={`flex-1 transition-all duration-300 ${
                          isChecked
                            ? "bg-gradient-to-r from-amber-500 to-emerald-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                            : "bg-slate-800/40 border-r border-slate-900 last:border-0"
                        }`}
                        title={`${item.label}: ${isChecked ? "ACTIVE" : "INACTIVE"}`}
                      />
                    );
                  })}
                </div>

                {/* Batch Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={unlockAll}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-mono font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer active:scale-95"
                  >
                    <Unlock size={14} />
                    <span>UNLOCK ALL CONTENT</span>
                  </button>

                  <button
                    type="button"
                    onClick={resetToPlayerMode}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-mono font-bold text-xs border border-slate-600 hover:border-slate-500 transition-all cursor-pointer active:scale-95"
                  >
                    <RotateCcw size={14} />
                    <span>RESTORE PLAYER MODE</span>
                  </button>

                  <button
                    type="button"
                    onClick={unlockAllStudios}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 font-mono font-bold text-xs border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer active:scale-95"
                  >
                    <Car size={14} />
                    <span>UNLOCK 5 STUDIOS</span>
                  </button>

                  <button
                    type="button"
                    onClick={maxSandbox}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-yellow-950/60 hover:bg-yellow-900/60 text-yellow-300 font-mono font-bold text-xs border border-yellow-500/40 hover:border-yellow-400 transition-all cursor-pointer active:scale-95"
                  >
                    <Zap size={14} />
                    <span>MAX SANDBOX (BUDGET + SPEED)</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Bar */}
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">FILTER:</span>
                  {[
                    { id: "all", label: "All Overrides", count: OVERRIDE_ITEMS.length },
                    { id: "studios", label: "Vehicle Studios", count: OVERRIDE_ITEMS.filter((i) => i.category === "studios").length },
                    { id: "tech", label: "R&D & Motorsport", count: OVERRIDE_ITEMS.filter((i) => i.category === "tech").length },
                    { id: "economy", label: "Production & Economy", count: OVERRIDE_ITEMS.filter((i) => i.category === "economy").length },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setOverrideCategory(cat.id as OverrideCategory)}
                      className={`px-3 py-1 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                        overrideCategory === cat.id
                          ? "bg-slate-700 text-white font-bold border border-slate-500 shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                      }`}
                    >
                      {cat.label} ({cat.count})
                    </button>
                  ))}
                </div>

                <span className="text-[11px] font-mono text-slate-400">
                  Showing {filteredOverrides.length} of {OVERRIDE_ITEMS.length} controls
                </span>
              </div>

              {/* Grid of Subsystem Overrides */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredOverrides.map((item) => {
                  const isChecked = overrides[item.key];
                  const isEffective = isChecked && devMode;

                  return (
                    <div
                      key={item.key}
                      onClick={() => setOverride(item.key, !isChecked)}
                      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden group select-none ${
                        isEffective
                          ? "bg-slate-900/95 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.18)] translate-y-[-1px]"
                          : "bg-slate-950/80 border-slate-800 hover:border-slate-600 hover:bg-slate-900/60"
                      }`}
                      style={{
                        borderLeftWidth: "4px",
                        borderLeftColor: isEffective
                          ? undefined
                          : "rgba(100, 116, 139, 0.4)",
                      }}
                    >
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                            isEffective ? "bg-amber-500/20 border border-amber-500/40" : "bg-slate-800/80 border border-slate-700 text-slate-400"
                          }`}>
                            {item.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                                {item.categoryLabel}
                              </span>
                              {isEffective ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  ACTIVE
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono text-slate-400 bg-slate-900 border border-slate-800">
                                  LOCKED
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-mono font-bold text-white mt-0.5 leading-snug group-hover:text-amber-200 transition-colors">
                              {item.label}
                            </h4>
                          </div>
                        </div>

                        {/* visionOS Tactile Toggle Switch */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isChecked}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOverride(item.key, !isChecked);
                          }}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isChecked && devMode
                              ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                              : "bg-slate-800 border-slate-700"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              isChecked && devMode ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Description Text with high contrast */}
                      <p className="text-xs text-slate-300 font-mono leading-relaxed pl-12">
                        {item.description}
                      </p>

                      {/* Footer Impact Chip */}
                      <div className="pt-2.5 mt-1 border-t border-white/5 flex items-center justify-between text-[11px] font-mono pl-12">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Zap size={12} className={item.accentColor} />
                          <span className="text-slate-300 font-medium">{item.impact}</span>
                        </span>
                        <span className={`text-[10px] font-bold ${isEffective ? item.accentColor : "text-slate-500"}`}>
                          {isEffective ? "ENGAGED" : "DISABLED"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: TIME MACHINE & BUDGET */}
          {activeTab === "timemachine" && (
            <div className="space-y-6">
              {/* Current Date Card */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                    CURRENT IN-GAME CHRONOMETER
                  </span>
                  <div className="text-xl font-bold font-mono text-white flex items-center gap-2">
                    <Calendar size={18} className="text-amber-400" />
                    <span>{formatGameDate(clock.getGameDateTime())}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-400">Cash:</span>{" "}
                    <span className="text-emerald-400 font-bold">
                      ${clock.cash.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Materials:</span>{" "}
                    <span className="text-cyan-400 font-bold">
                      {clock.materialsTonnes.toLocaleString()} t
                    </span>
                  </div>
                </div>
              </div>

              {/* Set Date Instantly (Jump Year) */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-cyan-400" />
                  <h4 className="text-xs font-bold font-mono text-white uppercase">
                    1. INSTANT CALENDAR TELEPORT (SET DATE)
                  </h4>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Directly sets calendar date without executing ticks or consuming time.
                </p>

                {/* Preset Era Quick Jumps */}
                <div className="flex flex-wrap gap-2">
                  {[1970, 1975, 1980, 1985, 1990, 1995, 2000, 2010, 2020, 2026].map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => clock.setDate(y, 1, 1)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                        clock.year === y
                          ? "bg-cyan-500 text-black border-cyan-400"
                          : "bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">Year:</span>
                    <input
                      type="number"
                      value={jumpYear}
                      onChange={(e) => setJumpYear(parseInt(e.target.value) || 1970)}
                      className="w-20 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">Month:</span>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={jumpMonth}
                      onChange={(e) => setJumpMonth(parseInt(e.target.value) || 1)}
                      className="w-16 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">Day:</span>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={jumpDay}
                      onChange={(e) => setJumpDay(parseInt(e.target.value) || 1)}
                      className="w-16 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => clock.setDate(jumpYear, jumpMonth, jumpDay)}
                    className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold transition-all"
                  >
                    Apply Instant Jump
                  </button>
                </div>
              </div>

              {/* Fast Forward Simulate */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <FastForward size={16} className="text-amber-400" />
                  <h4 className="text-xs font-bold font-mono text-white uppercase">
                    2. SIMULATE UNTIL DATE (FAST FORWARD TICKS)
                  </h4>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Advances simulation ticks, running financial cashflow, R&D progress, and firing events.
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => clock.advanceDays(30)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-white"
                  >
                    +30 Days (1 Month)
                  </button>
                  <button
                    type="button"
                    onClick={() => clock.advanceDays(90)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-white"
                  >
                    +90 Days (1 Quarter)
                  </button>
                  <button
                    type="button"
                    onClick={() => clock.advanceDays(365)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-white"
                  >
                    +1 Year (365 Days)
                  </button>
                  <button
                    type="button"
                    onClick={() => clock.advanceDays(365 * 5)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-white"
                  >
                    +5 Years
                  </button>
                </div>
              </div>

              {/* Resource Injection */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-emerald-400" />
                  <h4 className="text-xs font-bold font-mono text-white uppercase">
                    3. RESOURCE INJECTION
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => clock.addResources(10_000_000, 1_000)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-black transition-all text-xs font-mono font-bold"
                  >
                    +$10M Cash & 1,000t Materials
                  </button>
                  <button
                    type="button"
                    onClick={() => clock.addResources(50_000_000, 10_000)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-black transition-all text-xs font-mono font-bold"
                  >
                    +$50M Cash & 10,000t Materials
                  </button>
                  <button
                    type="button"
                    onClick={() => clock.addResources(500_000_000, 100_000)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-black transition-all text-xs font-mono font-bold"
                  >
                    +$500M Maximum Treasury
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TEST SCENARIOS */}
          {activeTab === "scenarios" && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-400" />
                  PRE-CONFIGURED DEVELOPMENT SCENARIOS
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  1-click instant configuration of game era, R&D unlocks, capital, and system permissions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.keys(TEST_SCENARIOS) as TestScenarioId[]).map((key) => {
                  const sc = TEST_SCENARIOS[key];
                  const isActive = activeScenario === key;
                  return (
                    <div
                      key={key}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                        isActive
                          ? "bg-amber-500/15 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                          : "bg-slate-900/60 border-slate-700/60 hover:border-slate-500"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-amber-300">
                            {sc.badge}
                          </span>
                          <span className="text-xs font-mono text-slate-400">Year {sc.year}</span>
                        </div>
                        <h4 className="text-sm font-bold font-mono text-white">{sc.name}</h4>
                        <p className="text-xs font-mono text-slate-400 leading-relaxed">
                          {sc.description}
                        </p>
                      </div>

                      <div className="pt-4 flex items-center justify-between border-t border-white/5 mt-4">
                        <div className="text-[11px] font-mono text-emerald-400">
                          {sc.cash ? `$${(sc.cash / 1_000_000).toFixed(0)}M Capital` : "Normal Capital"}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            applyScenario(key);
                            clock.setDate(sc.year, 1, 1);
                            if (sc.cash) {
                              clock.addResources(sc.cash, sc.materialsTonnes || 1000);
                            }
                          }}
                          className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                            isActive
                              ? "bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                              : "bg-slate-800 hover:bg-amber-500 hover:text-black text-slate-200 border border-slate-600"
                          }`}
                        >
                          {isActive ? "ACTIVE SCENARIO" : "LOAD SCENARIO"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: DIRECT TEST SPAWNER */}
          {activeTab === "spawner" && (
            <DevQuickSpawner
              onSelectStage={onSelectStage}
              onClose={() => setModalOpen(false)}
            />
          )}

          {/* TAB 5: 3D ASSET GALLERY */}
          {activeTab === "asset_gallery" && (
            <DevAssetGallery
              onSelectStage={onSelectStage}
              onClose={() => setModalOpen(false)}
            />
          )}

          {/* TAB 6: STATE & SNAPSHOTS */}
          {activeTab === "state_inspector" && <DevStateInspector />}
        </div>

        {/* ── FOOTER STATUS BAR ── */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/10 bg-slate-950/80 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                devMode ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
              }`}
            />
            <span>
              Status:{" "}
              <strong className={devMode ? "text-emerald-400" : "text-slate-400"}>
                {devMode ? "DEV MODE ACTIVE (OVERRIDES PERMITTED)" : "PLAYER PROGRESSION ACTIVE"}
              </strong>
            </span>
          </div>
          <div>Press [ESC] or [Ctrl+Shift+D] to toggle matrix</div>
        </div>
      </div>
    </div>
  );
};
