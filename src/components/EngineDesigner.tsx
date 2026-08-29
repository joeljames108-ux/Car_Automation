import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Cog,
  Zap,
  Gauge,
  Thermometer,
  DollarSign,
  Battery,
  Activity,
  Bot,
  AlertTriangle,
  Lightbulb,
  Check,
  Info,
  X,
  Flame,
  Wrench,
  Leaf,
  TrendingUp,
  Wind,
  Maximize2,
  ArrowLeft,
  Sparkles,
  Layers,
  Cpu,
  Sliders,
  Radio,
} from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { Section, Slider, Select, ChoiceGrid, Toggle, StatTile } from "./ui/Controls";
import { LineChart } from "./ui/LineChart";
import {
  ENGINE_LAYOUTS,
  CRANK_MATERIALS,
  PISTON_TYPES,
  VALVETRAIN_TYPES,
  INTAKE_TYPES,
  FUEL_SYSTEMS,
  BATTERY_CHEMISTRIES,
  EV_MOTOR_TYPES,
  HYBRID_DEPLOY_MODES,
  MGU_H_MODES,
  HYBRID_ARCHITECTURES,
  MOTOR_PLACEMENTS,
  TURBO_HOUSINGS,
  INTERCOOLER_TYPES,
  WASTEGATE_TYPES,
  BOV_TYPES,
  BOOST_CONTROLLERS,
  DRIVE_TYPES,
  ENGINE_POSITIONS,
  POWER_ELECTRONICS_TYPES,
  HYBRID_TRANSMISSION_TYPES,
  REGEN_BRAKING_TYPES,
  THERMAL_MANAGEMENT_TYPES,
  CHARGING_TECH_TYPES,
  SPORTS_HYBRID_TECH_TYPES,
} from "../sim/constants";
import type {
  EngineLayout,
  CrankMaterial,
  PistonType,
  ValvetrainType,
  IntakeType,
  FuelSystemType,
  EngineConfig,
  DriveType,
  EnginePosition,
} from "../sim/types";

import { useAssemblyStore } from "../state/useAssemblyStore";

const EngineAssemblyViewer = React.lazy(() => import("./assembly/EngineAssemblyViewer").then(m => ({ default: m.EngineAssemblyViewer })));
const EngineWorkshopPanel = React.lazy(() => import("./assembly/EngineWorkshopPanel").then(m => ({ default: m.EngineWorkshopPanel })));
const AssemblyCompletionModal = React.lazy(() => import("./assembly/AssemblyCompletionModal").then(m => ({ default: m.AssemblyCompletionModal })));
const HybridTelemetrySuite = React.lazy(() => import("./HybridTelemetrySuite").then(m => ({ default: m.HybridTelemetrySuite })));
const EngineAudioVisualizer = React.lazy(() => import("./assembly/EngineAudioVisualizer").then(m => ({ default: m.EngineAudioVisualizer })));
const ApexAgentConsole = React.lazy(() => import("./agents/ApexAgentConsole").then(m => ({ default: m.ApexAgentConsole })));
const EngineBuilderFlow = React.lazy(() => import("./assembly/EngineBuilderFlow").then(m => ({ default: m.EngineBuilderFlow })));
const ModularEngineStudio = React.lazy(() => import("./engineStudio/ModularEngineStudio").then(m => ({ default: m.ModularEngineStudio })));
const Transmission3DStudio = React.lazy(() => import("./transmissionStudio/Transmission3DStudio").then(m => ({ default: m.Transmission3DStudio })));
const AdvancedEngineTelemetryStudio = React.lazy(() => import("./engineStudio/AdvancedEngineTelemetryStudio").then(m => ({ default: m.AdvancedEngineTelemetryStudio })));

// Engine layout → icon mapping
const LAYOUT_ICONS: Record<string, React.ReactNode> = {
  i3: <Cog size={11} />,
  i4: <Cog size={11} />,
  i6: <Cog size={11} />,
  v6: <Cog size={11} />,
  v8: <Cog size={11} />,
  v10: <Cog size={11} />,
  v12: <Cog size={11} />,
  w12: <Cog size={11} />,
  w16: <Cog size={11} />,
  w18: <Cog size={11} />,
  boxer4: <Cog size={11} />,
  boxer6: <Cog size={11} />,
  rotary: <Flame size={11} />,
  hybrid: <Zap size={11} />,
  electric: <Zap size={11} />,
};

// Engine layout → diagram illustration mapping
const ENGINE_DIAGRAM_IMAGES: Record<string, string> = {
  boxer6: "/engine_diagram_boxer6.png",
  boxer4: "/engine_diagram_boxer4.png",
  i4: "/engine_diagram_i4.png",
  i3: "/engine_diagram_i4.png",
  i6: "/engine_diagram_i6.png",
  v6: "/engine_diagram_v6.png",
  rotary: "/engine_diagram_rotary.png",
  v12: "/engine_diagram_v12.png",
  v10: "/engine_diagram_v10.png",
  v8: "/engine_diagram_v8.png",
  w12: "/engine_diagram_w12.png",
  w16: "/engine_diagram_w16.png",
  w18: "/engine_diagram_w18.png",
  hybrid: "/engine_diagram_v8.png",
};

type Philosophy = "track" | "budget" | "luxury" | "balanced";
type OptimizeGoal = "performance" | "cost" | "reliability" | "efficiency" | "luxury";

export function EngineDesigner() {
  const { design, sim, updateEngine, updateVehicle } = useDesign();
  const eng = design.engine;
  const v = design.vehicle;
  const isElectric = eng.layout === "electric";
  const isHybrid = eng.layout === "hybrid" || eng.hybridArchitecture !== "none" || eng.hasMguH;
  const isForced = eng.intake !== "na";

  const [philosophy, setPhilosophy] = useState<Philosophy>("balanced");
  const [optimizeGoal, setOptimizeGoal] = useState<OptimizeGoal>("performance");
  const [dismissedWarnings, setDismissedWarnings] = useState<string[]>([]);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [modalRendered, setModalRendered] = useState(false);
  const [modalActive, setModalActive] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [engineMode, setEngineMode] = useState<"3d_studio" | "assembly_flow" | "transmission_studio" | "advanced_telemetry">("assembly_flow");
  const [showSecondaryPanels, setShowSecondaryPanels] = useState(false);

  // Defer heavy lower deck analytics and agent suite to next frame for instant tab switching
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setShowSecondaryPanels(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // Robotic Engine Assembly Line System state (Unified)
  const assembly = useAssemblyStore(eng);

  const openEnlargedModal = () => {
    setIsEnlarged(true);
    setModalRendered(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setModalActive(true);
      });
    });
  };

  const closeEnlargedModal = () => {
    setIsEnlarged(false);
    setModalActive(false);
    setTimeout(() => {
      setModalRendered(false);
    }, 400);
  };

  // Disable body scrolling while image is enlarged
  useEffect(() => {
    if (isEnlarged) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isEnlarged]);

  // Power & Torque chart — pink/magenta torque + teal power with dual fill
  const powerSeries = useMemo(() => [
    { data: sim.powerCurve.map((p) => ({ x: p.rpm, y: p.power })), color: "#fbbf24", fill: true, label: "Power", unit: " hp" },
    { data: sim.powerCurve.map((p) => ({ x: p.rpm, y: p.torque })), color: "#e879a0", fill: true, label: "Torque", unit: " Nm" },
  ], [sim.powerCurve]);

  // Generate live warnings based on sim
  const warnings = useMemo(() => {
    const w: { id: string; category: string; text: string }[] = [];
    if (sim.knockRisk > 0.5) w.push({ id: "knock", category: "Engine", text: "Knock risk is critically high — reduce compression or timing" });
    if (sim.thermalEfficiency < 0.25 && !isElectric) w.push({ id: "thermal", category: "Engine", text: "Thermal efficiency below 25% — consider optimizing AFR or timing" });
    if (sim.engineCost > 150000) w.push({ id: "cost", category: "Manufacturing", text: "Cost too high for target market" });
    if (sim.reliability < 0.6) w.push({ id: "reliability", category: "Engine", text: "Reliability below 60% — engine may not pass durability tests" });
    if (sim.noise > 95) w.push({ id: "noise", category: "Engine", text: "Noise exceeds 95dB — may fail regulatory requirements" });
    return w.filter((w) => !dismissedWarnings.includes(w.id));
  }, [sim, isElectric, dismissedWarnings]);

  // AI Suggestion based on current state
  const suggestion = useMemo(() => {
    if (sim.engineCost > 100000 && !isElectric) {
      return {
        title: "Reduce wheel diameter by 1 inch",
        detail: "Smaller wheels lower tire and rim cost with minimal performance impact.",
        impacts: [
          { label: "Cost", delta: "-$500", tone: "good" as const },
          { label: "Ride comfort", delta: "+5%", tone: "caution" as const },
        ],
      };
    }
    if (sim.knockRisk > 0.3) {
      return {
        title: "Lower compression ratio by 0.5",
        detail: "Reducing compression will decrease knock risk without significant power loss.",
        impacts: [
          { label: "Knock Risk", delta: "-15%", tone: "good" as const },
          { label: "Power", delta: "-3hp", tone: "caution" as const },
        ],
      };
    }
    return {
      title: "Enable start-stop system",
      detail: "Automatic start-stop saves fuel in city driving with minimal added cost.",
      impacts: [
        { label: "Fuel Economy", delta: "-0.6 L/100km", tone: "good" as const },
        { label: "Cost", delta: "+$200", tone: "caution" as const },
      ],
    };
  }, [sim, isElectric]);

  const engineLayouts = Object.keys(ENGINE_LAYOUTS) as EngineLayout[];

  return (
    <div className="space-y-4 stagger-enter select-none">
      {/* Top Banner: Auto-Optimize Preset Tuning Bar (Translucent Liquid Glass) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-gradient-to-r from-base-900/90 via-base-850/80 to-base-900/90 border border-amber-500/30 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber-400 animate-pulse" />
          <span className="text-xs font-mono font-extrabold text-amber-300 uppercase tracking-wider">
            AUTO OPTIMIZE TARGET:
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: "performance" as OptimizeGoal, icon: <TrendingUp size={12} />, label: "Performance" },
            { id: "cost" as OptimizeGoal, icon: <DollarSign size={12} />, label: "Lowest Cost" },
            { id: "reliability" as OptimizeGoal, icon: <Wrench size={12} />, label: "Reliability" },
            { id: "efficiency" as OptimizeGoal, icon: <Leaf size={12} />, label: "Efficiency" },
            { id: "luxury" as OptimizeGoal, icon: <Flame size={12} />, label: "Luxury" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setOptimizeGoal(opt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                optimizeGoal === opt.id
                  ? "bg-amber-500 text-black shadow-[0_0_14px_rgba(34,211,238,0.5)] scale-[1.02]"
                  : "bg-base-800/50 text-slate-300 hover:text-white hover:bg-base-750 border border-base-700 backdrop-blur-md"
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Switcher Bar */}
      <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-2 px-2">
          <Layers size={15} className="text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Engine Workspace:
          </span>
        </div>
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 flex-wrap">
          <button
            onClick={() => setEngineMode("assembly_flow")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              engineMode === "assembly_flow"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-cyan-500/30 font-extrabold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cog size={13} />
            <span>3D Engine Assembly & Builder</span>
          </button>
          <button
            onClick={() => setEngineMode("3d_studio")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              engineMode === "3d_studio"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-cyan-500/30 font-extrabold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles size={13} />
            <span>Dyno & Master Workbench</span>
          </button>
          <button
            onClick={() => setEngineMode("transmission_studio")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              engineMode === "transmission_studio"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-cyan-500/30 font-extrabold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders size={13} />
            <span>3D Transmission Studio</span>
          </button>
          <button
            onClick={() => setEngineMode("advanced_telemetry")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              engineMode === "advanced_telemetry"
                ? "bg-amber-500 text-white shadow-md shadow-violet-500/30 font-extrabold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Radio size={13} />
            <span>Telemetry & ECU 3D</span>
          </button>
        </div>
      </div>

      {engineMode === "advanced_telemetry" ? (
        <AdvancedEngineTelemetryStudio />
      ) : engineMode === "transmission_studio" ? (
        <Transmission3DStudio />
      ) : engineMode === "3d_studio" ? (
        <ModularEngineStudio />
      ) : (
        /* ========================================================================= */
        /* SEQUENTIAL 1-PAGE ENGINE & EV ROBOTIC ASSEMBLY PIPELINE (PHASES 1-25)     */
        /* ========================================================================= */
        <EngineBuilderFlow
          engineConfig={eng}
          sim={sim}
          updateEngine={updateEngine}
          updateVehicle={updateVehicle}
          onShowCompletionModal={() => setShowCompletionModal(true)}
          onOpenLightbox={openEnlargedModal}
        />
      )}

      {/* =========================================================================== */}
      {/* LOWER DECK: Dyno Curves, Engine Vitals, AI Engine & Telemetry               */}
      {/* =========================================================================== */}

      {showSecondaryPanels && (
        <>
          {/* Live Warnings Banner (If Active) */}
          {warnings.length > 0 && (
            <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-amber-400" />
                <span className="label-mono text-amber-300">Live Engineering Warnings</span>
                <span className="text-[10px] text-amber-400/70 font-mono">({warnings.length} active)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {warnings.map((w) => (
                  <div key={w.id} className="engine-warning-bar bg-base-950/80 border border-amber-500/20 p-2 rounded-xl">
                    <span className="warning-dot" />
                    <span className="font-mono text-[10px] text-amber-400/80 uppercase tracking-wider">{w.category}</span>
                    <span className="flex-1 text-[11px] text-slate-200">{w.text}</span>
                    <button onClick={() => setDismissedWarnings((prev) => [...prev, w.id])} className="text-red-400/50 hover:text-red-300 transition-colors">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4-Column Lower Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
            
            {/* Power & Torque Dyno Chart */}
            <Section title="Dyno Power & Torque" icon={<Zap size={16} />}>
              <LineChart series={powerSeries} xLabel="RPM" yLabel="hp / Nm" height={190} />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-3 bg-amber-400 rounded-sm shadow-[0_0_6px_rgba(34,211,238,0.6)]" /> Power ({sim.peakPower} hp)
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-3 rounded-sm shadow-[0_0_6px_rgba(232,121,160,0.6)]" style={{ background: "#e879a0" }} /> Torque ({sim.peakTorque} Nm)
                </span>
              </div>
            </Section>

            {/* Engine Vitals Grid */}
            <Section title="Engine Vitals" icon={<Gauge size={16} />}>
              <div className="grid grid-cols-2 gap-2">
                <StatTile label="Displacement" value={sim.displacement} unit="cc" accent="accent" />
                <StatTile label="Cylinders" value={sim.cylinderCount} />
                <StatTile label="Peak Power" value={sim.peakPower} unit="hp" accent="accent" sub={`@ ${sim.peakPowerRpm} rpm`} />
                <StatTile label="Peak Torque" value={sim.peakTorque} unit="Nm" accent="accent" sub={`@ ${sim.peakTorqueRpm} rpm`} />
                {!isElectric && <StatTile label="Thermal Eff." value={`${(sim.thermalEfficiency * 100).toFixed(1)}%`} accent="ok" />}
                <StatTile label="Redline" value={sim.redline} unit="rpm" />
                {!isElectric && <StatTile label="Knock Risk" value={`${(sim.knockRisk * 100).toFixed(0)}%`} accent={sim.knockRisk > 0.5 ? "danger" : sim.knockRisk > 0.3 ? "warn" : "ok"} />}
                {!isElectric && <StatTile label="BSFC" value={sim.bsfc} unit="g/kWh" />}
                <StatTile label="Engine Weight" value={sim.engineWeight} unit="kg" />
                <StatTile label="Reliability" value={`${(sim.reliability * 100).toFixed(0)}%`} accent={sim.reliability > 0.85 ? "ok" : "warn"} />
              </div>
            </Section>

            {/* AI Suggestion Card */}
            <Section title="Apex AI Copilot" icon={<Lightbulb size={16} />}>
              <div className="ai-suggestion-card bg-amber-950/20 border border-amber-500/30 p-3 rounded-xl space-y-2">
                <div className="text-xs font-semibold text-amber-200">{suggestion.title}</div>
                <div className="text-[10.5px] text-amber-300/80 leading-relaxed">{suggestion.detail}</div>
                <div className="suggestion-impacts flex flex-wrap gap-1.5 pt-1">
                  {suggestion.impacts.map((impact, i) => (
                    <span key={i} className={`impact-badge ${impact.tone === "good" ? "good" : "caution"}`}>
                      → {impact.label} : {impact.delta}
                    </span>
                  ))}
                </div>
                <div className="ai-suggestion-actions flex items-center gap-2 pt-2 border-t border-amber-500/20">
                  <button className="btn-apply flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500 text-black text-xs font-mono font-bold hover:bg-amber-400 transition-all cursor-pointer">
                    <Check size={11} /> Apply
                  </button>
                  <button className="btn-explain flex items-center gap-1 px-3 py-1 rounded-lg bg-base-800 text-amber-300 border border-amber-500/30 text-xs font-mono hover:bg-base-750 transition-all cursor-pointer">
                    <Info size={11} /> Explain
                  </button>
                </div>
              </div>
            </Section>

            {/* Cost, Emissions & Environment */}
            <Section title="Cost & Economics" icon={<DollarSign size={16} />}>
              <div className="grid grid-cols-2 gap-2">
                <StatTile label="Engine Cost" value={`$${(sim.engineCost / 1000).toFixed(1)}k`} accent="accent" />
                {!isElectric && <StatTile label="Fuel Economy" value={sim.fuelEconomy} unit="L/100km" />}
                <StatTile label="Emissions" value={sim.emissions} unit="g/km" accent={sim.emissions > 250 ? "warn" : "default"} />
                <StatTile label="Noise" value={sim.noise} unit="dB" />
                {isHybrid && <StatTile label="Regen Eff." value={`${(sim.regenEfficiency * 100).toFixed(0)}%`} accent="ok" />}
                {isElectric && <StatTile label="EV Range" value={sim.electricRange} unit="km" accent="ok" />}
              </div>
            </Section>
          </div>

          {/* Autonomous AI Agent Suite Console */}
          <div className="w-full mt-4">
            <ApexAgentConsole
              engineConfig={eng}
              installedComponents={assembly.installedComponents}
              activeComponentId={assembly.activeComponentId}
              phase={assembly.phase}
              powerHp={sim.peakPower}
              weightKg={sim.engineWeight + 1200}
              onApplyTuning={(changes) => updateEngine(changes)}
            />
          </div>

          {/* 21 Subsystem Hybrid & EV Telemetry Suite (If Hybrid or EV) */}
          {(isHybrid || isElectric) && (
            <div className="w-full mt-4 mb-16 pb-6">
              <HybridTelemetrySuite />
            </div>
          )}
        </>
      )}

      {/* Assembly Completion Celebration Modal */}
      <AssemblyCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onReset={assembly.resetAssembly}
        stats={assembly.currentStats}
        layout={eng.layout}
        engineConfig={eng}
      />

      {/* Ultra-Smooth Spatial Glass Lightbox Modal via Portal directly to body */}
      {modalRendered &&
        createPortal(
          <div className={`schematic-backdrop ${modalActive ? "active" : ""}`} onClick={closeEnlargedModal}>
            <div className="schematic-modal-container" onClick={(e) => e.stopPropagation()}>
              {/* Top Bar with Back & Close */}
              <div className="w-full flex items-center justify-between border-b border-amber-200/50 pb-3.5 mb-4">
                <button
                  onClick={closeEnlargedModal}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-400/30 text-xs font-mono font-bold hover:bg-amber-500/20 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-700">
                  {ENGINE_LAYOUTS[eng.layout]?.label || eng.layout} Architecture Blueprint
                </span>
                <button
                  onClick={closeEnlargedModal}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Center Enlarged Image Box */}
              <div className="schematic-modal-image-box group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,122,255,0.08),transparent_70%)] pointer-events-none" />
                <img
                  src={ENGINE_DIAGRAM_IMAGES[eng.layout] || "/engine_diagram_v8.png"}
                  alt={`${ENGINE_LAYOUTS[eng.layout]?.label || "Engine"} Layout Schematic`}
                  className="schematic-modal-image"
                />
              </div>

              {/* Specifications Cards Grid */}
              <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3.5 border-t border-amber-200/40">
                <div className="bg-white/85 border border-amber-200/50 rounded-2xl p-3 text-center shadow-sm backdrop-blur-md">
                  <span className="block text-[9.5px] font-mono text-slate-400 uppercase tracking-wider">Cylinders</span>
                  <span className="text-sm font-mono font-bold text-slate-800">{ENGINE_LAYOUTS[eng.layout]?.cylinders || "-"}</span>
                </div>
                <div className="bg-white/85 border border-amber-200/50 rounded-2xl p-3 text-center shadow-sm backdrop-blur-md">
                  <span className="block text-[9.5px] font-mono text-slate-400 uppercase tracking-wider">Base Weight</span>
                  <span className="text-sm font-mono font-bold text-slate-800">{ENGINE_LAYOUTS[eng.layout]?.weightBase} kg</span>
                </div>
                <div className="bg-white/85 border border-amber-200/50 rounded-2xl p-3 text-center shadow-sm backdrop-blur-md">
                  <span className="block text-[9.5px] font-mono text-slate-400 uppercase tracking-wider">Smoothness</span>
                  <span className="text-sm font-mono font-bold text-[#007aff]">{((ENGINE_LAYOUTS[eng.layout]?.balanceFactor || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="bg-white/85 border border-amber-200/50 rounded-2xl p-3 text-center shadow-sm backdrop-blur-md">
                  <span className="block text-[9.5px] font-mono text-slate-400 uppercase tracking-wider">Cost Factor</span>
                  <span className="text-sm font-mono font-bold text-slate-800">{ENGINE_LAYOUTS[eng.layout]?.costFactor}x</span>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
