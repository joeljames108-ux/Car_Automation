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
  Wind,
  Maximize2,
  ArrowLeft,
  ArrowRight,
  Cpu,
  ChevronRight,
} from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { useGuidedEngineeringStore } from "../state/guidedEngineeringStore";
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
const EngineBuilderFlow = React.lazy(() => import("./assembly/EngineBuilderFlow").then(m => ({ default: m.EngineBuilderFlow })));

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

interface EngineDesignerProps {
  onSelectStage?: (stage: string) => void;
}

export function EngineDesigner({ onSelectStage }: EngineDesignerProps = {}) {
  const { design, sim, updateEngine, updateVehicle } = useDesign();
  const { engineStatus, markStageComplete, setActiveWorkflowStage } = useGuidedEngineeringStore();
  const eng = design.engine;
  const v = design.vehicle;
  const isElectric = eng.layout === "electric";
  const isHybrid = eng.layout === "hybrid" || eng.hybridArchitecture !== "none" || eng.hasMguH;
  const isForced = eng.intake !== "na";

  const [dismissedWarnings, setDismissedWarnings] = useState<string[]>([]);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [modalRendered, setModalRendered] = useState(false);
  const [modalActive, setModalActive] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showSecondaryPanels, setShowSecondaryPanels] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentFlowStage, setCurrentFlowStage] = useState<string>("powertrain_select");

  const isPowertrainSelect = currentFlowStage === "powertrain_select";

  const handleNextToCreationHub = () => {
    markStageComplete("engine");
    if (onSelectStage) {
      onSelectStage("powertrain_studio_select");
    }
  };

  const handleBackToCreatorMenu = () => {
    if (onSelectStage) {
      onSelectStage("powertrain_studio_select");
    }
  };

  // Ensure that if entering with unconfigured engine, we land directly on powertrain_select (Photo 2)
  useEffect(() => {
    if (engineStatus === "unconfigured" || eng.layout === "unconfigured") {
      setCurrentFlowStage("powertrain_select");
    }
  }, [engineStatus, eng.layout]);

  useEffect(() => {
    useGuidedEngineeringStore.getState().setPowertrainSelecting(isPowertrainSelect);
  }, [isPowertrainSelect]);

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

  // Disable body scrolling while image is enlarged or drawer is open
  useEffect(() => {
    if (isEnlarged || isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isEnlarged, isDrawerOpen]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen]);

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



  const engineLayouts = Object.keys(ENGINE_LAYOUTS) as EngineLayout[];

  return (
    <div className={`stagger-enter select-none ${isPowertrainSelect ? "w-full overflow-hidden" : "space-y-4"}`}>


      {/* SEQUENTIAL 1-PAGE ENGINE & EV ROBOTIC ASSEMBLY PIPELINE */}
      <EngineBuilderFlow
        engineConfig={eng}
        sim={sim}
        updateEngine={updateEngine}
        updateVehicle={updateVehicle}
        onShowCompletionModal={() => setShowCompletionModal(true)}
        onOpenLightbox={openEnlargedModal}
        onStageChange={setCurrentFlowStage}
        initialStage={(engineStatus === "unconfigured" || eng.layout === "unconfigured") ? "powertrain_select" : undefined}
        onNextToCreationHub={handleNextToCreationHub}
        onBackToCreatorMenu={handleBackToCreatorMenu}
      />

      {/* =========================================================================== */}
      {/* SMALL BUTTON ON LEFT SIDE: Opens Engine Vitals & Dyno Drawer                */}
      {/* =========================================================================== */}
      {!isPowertrainSelect && (
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-2.5 pl-2.5 pr-3.5 py-3 rounded-r-2xl bg-[#faf8f4]/95 hover:bg-white text-slate-800 border-y border-r border-amber-500/40 shadow-[0_8px_32px_rgba(0,0,0,0.14),0_0_16px_rgba(245,158,11,0.16)] hover:shadow-[0_12px_36px_rgba(245,158,11,0.3)] backdrop-blur-2xl transition-all duration-200 cursor-pointer group hover:pl-3.5 active:scale-95"
          title="Open Engine Vitals & Dyno Drawer"
          aria-label="Open Engine Vitals and Dyno Drawer"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform shrink-0">
            <Activity size={17} />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900">
                Vitals & Dyno
              </span>
              <ChevronRight size={13} className="text-amber-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <span className="text-[9.5px] font-mono text-slate-500 font-medium">
              {sim.peakPower} hp • {sim.displacement} cc
            </span>
          </div>
        </button>
      )}

      {/* =========================================================================== */}
      {/* SLIDE-OUT DRAWER: Hovers over existing page from the left                   */}
      {/* =========================================================================== */}
      {isDrawerOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex pointer-events-auto">
            {/* Dimmed backdrop */}
            <div
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={() => setIsDrawerOpen(false)}
            />

            {/* Drawer panel */}
            <div
              className="relative z-10 w-full sm:w-[560px] md:w-[640px] max-w-[95vw] h-full bg-[#faf8f4] border-r border-[#dad4c5] shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 ease-out"
              role="dialog"
              aria-modal="true"
              aria-label="Engine Vitals & Analytics Drawer"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-[#dad4c5] bg-white/85 backdrop-blur-md flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md">
                    <Activity size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 font-mono tracking-wide">
                        ENGINE VITALS & DYNO
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-800 border border-amber-500/30">
                        LIVE TELEMETRY
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Real-time dyno curves, mechanical vitals & cost economics
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Close Drawer (Esc)"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {/* Live Warnings Banner (If Active) */}
                {warnings.length > 0 && (
                  <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-500/30 shadow-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={14} className="text-amber-600" />
                      <span className="label-mono text-amber-800 font-bold">Live Engineering Warnings</span>
                      <span className="text-[10px] text-amber-700/80 font-mono">({warnings.length} active)</span>
                    </div>
                    <div className="space-y-1.5">
                      {warnings.map((w) => (
                        <div key={w.id} className="bg-white/90 border border-amber-400/30 p-2 rounded-xl flex items-center gap-2">
                          <span className="warning-dot" />
                          <span className="font-mono text-[10px] text-amber-800 uppercase tracking-wider font-bold">{w.category}</span>
                          <span className="flex-1 text-[11px] text-slate-700">{w.text}</span>
                          <button onClick={() => setDismissedWarnings((prev) => [...prev, w.id])} className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dyno Power & Torque */}
                <Section title="Dyno Power & Torque" icon={<Zap size={16} />}>
                  <LineChart series={powerSeries} xLabel="RPM" yLabel="hp / Nm" height={190} />
                  <div className="flex justify-between text-[10px] text-slate-600 mt-2 font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-3.5 bg-amber-500 rounded-sm shadow-xs" /> Power ({sim.peakPower} hp)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-3.5 rounded-sm shadow-xs" style={{ background: "#e879a0" }} /> Torque ({sim.peakTorque} Nm)
                    </span>
                  </div>
                </Section>

                {/* Engine Vitals */}
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

                {/* Cost & Economics */}
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

                {/* 21 Subsystem Hybrid & EV Telemetry Suite (If Hybrid or EV) */}
                {(isHybrid || isElectric) && (
                  <div className="w-full pt-2">
                    <HybridTelemetrySuite />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-[#dad4c5] bg-white/70 backdrop-blur-md flex items-center justify-between text-xs font-mono text-slate-500">
                <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold text-[10px]">Esc</kbd> to close</span>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-semibold transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Floating / Sticky Bottom Navigation Dock: Next -> Creator Menu */}
      {!isPowertrainSelect && eng.layout !== "unconfigured" && (
        <div className="sticky bottom-4 z-30 w-full mt-8 p-4 rounded-2xl bg-[#faf8f4]/95 border-2 border-emerald-500/40 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12),0_0_25px_rgba(16,185,129,0.12)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 font-bold shrink-0">
              <Check size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                  Engine Architecture Ready
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-700 border border-emerald-500/30">
                  STAGE 1 SATISFIED
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                Engine is configured with valid telemetry. Proceed to Creator Menu to select your next car component to build.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={handleNextToCreationHub}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-mono font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_4px_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>NEXT → CREATOR MENU</span>
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {/* Assembly Completion Celebration Modal */}
      <AssemblyCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onReset={assembly.resetAssembly}
        stats={assembly.currentStats}
        layout={eng.layout}
        engineConfig={eng}
        onNextToCreationHub={handleNextToCreationHub}
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
