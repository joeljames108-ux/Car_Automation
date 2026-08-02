import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { Cog, Zap, Gauge, Thermometer, DollarSign, Battery, Activity, Bot, AlertTriangle, Lightbulb, Check, Info, X, Flame, Wrench, Target, Leaf, TrendingUp, Wind, Maximize2, ArrowLeft } from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { Section, Slider, Select, ChoiceGrid, Toggle, StatTile } from "./ui/Controls";
import { LineChart } from "./ui/LineChart";
import { ENGINE_LAYOUTS, CRANK_MATERIALS, PISTON_TYPES, VALVETRAIN_TYPES, INTAKE_TYPES, FUEL_SYSTEMS, BATTERY_CHEMISTRIES, EV_MOTOR_TYPES, HYBRID_DEPLOY_MODES, MGU_H_MODES, HYBRID_ARCHITECTURES, MOTOR_PLACEMENTS, TURBO_HOUSINGS, INTERCOOLER_TYPES, WASTEGATE_TYPES, BOV_TYPES, BOOST_CONTROLLERS, DRIVE_TYPES, ENGINE_POSITIONS, POWER_ELECTRONICS_TYPES, HYBRID_TRANSMISSION_TYPES, REGEN_BRAKING_TYPES, THERMAL_MANAGEMENT_TYPES, CHARGING_TECH_TYPES, SPORTS_HYBRID_TECH_TYPES } from "../sim/constants";
import type { EngineLayout, CrankMaterial, PistonType, ValvetrainType, IntakeType, FuelSystemType, EngineConfig, DriveType, EnginePosition } from "../sim/types";

import { PresetQuickSelect } from "./PresetQuickSelect";
import { useAssemblyStore } from "../state/useAssemblyStore";
import { ComponentLibrary } from "./assembly/ComponentLibrary";
import { EngineAssemblyViewer } from "./assembly/EngineAssemblyViewer";
import { AssemblyProgressPanel } from "./assembly/AssemblyProgressPanel";
import { AssemblyTabSwitcher } from "./assembly/AssemblyTabSwitcher";
import { AssemblyCompletionModal } from "./assembly/AssemblyCompletionModal";
import { HybridTelemetrySuite } from "./HybridTelemetrySuite";
import { EngineAudioVisualizer } from "./assembly/EngineAudioVisualizer";
import { ApexAgentConsole } from "./agents/ApexAgentConsole";
import { Play, Sparkles } from "lucide-react";

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
type SkillLevel = "beginner" | "intermediate" | "expert";
type OptimizeGoal = "performance" | "cost" | "reliability" | "efficiency" | "luxury";

export function EngineDesigner() {
  const { design, sim, updateEngine, updateVehicle } = useDesign();
  const eng = design.engine;
  const v = design.vehicle;
  const isElectric = eng.layout === "electric";
  const isHybrid = eng.layout === "hybrid" || eng.hybridArchitecture !== "none" || eng.hasMguH;
  const isForced = eng.intake !== "na";

  const [philosophy, setPhilosophy] = useState<Philosophy>("balanced");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("intermediate");
  const [optimizeGoal, setOptimizeGoal] = useState<OptimizeGoal>("performance");
  const [dismissedWarnings, setDismissedWarnings] = useState<string[]>([]);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [modalRendered, setModalRendered] = useState(false);
  const [modalActive, setModalActive] = useState(false);

  // Robotic Engine Assembly Line System state
  const [assemblyMode, setAssemblyMode] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const assembly = useAssemblyStore();

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
  const powerSeries = [
    { data: sim.powerCurve.map((p) => ({ x: p.rpm, y: p.power })), color: "#22d3ee", fill: true, label: "Power", unit: " hp" },
    { data: sim.powerCurve.map((p) => ({ x: p.rpm, y: p.torque })), color: "#e879a0", fill: true, label: "Torque", unit: " Nm" },
  ];

  // Generate live warnings based on sim
  const warnings = useMemo(() => {
    const w: { id: string; category: string; text: string }[] = [];
    if (sim.knockRisk > 0.5) w.push({ id: "knock", category: "Engine", text: "Knock risk is critically high — reduce compression or timing" });
    if (sim.thermalEfficiency < 0.25 && !isElectric) w.push({ id: "thermal", category: "Engine", text: "Thermal efficiency below 25% — consider optimizing AFR or timing" });
    if (sim.engineCost > 150000) w.push({ id: "cost", category: "Manufacturing", text: "Cost too high for target market" });
    if (sim.reliability < 0.6) w.push({ id: "reliability", category: "Engine", text: "Reliability below 60% — engine may not pass durability tests" });
    if (sim.noise > 95) w.push({ id: "noise", category: "Engine", text: "Noise exceeds 95dB — may fail regulatory requirements" });
    return w.filter(w => !dismissedWarnings.includes(w.id));
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
    <div className="space-y-4 stagger-enter">
      {/* Studio Mode Toggle Bar: Parameter Tweaker vs Robotic Assembly Line Workstation */}
      <div className="relative z-30 flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-base-900 via-base-850 to-base-900 border-2 border-cyan-500/50 backdrop-blur-2xl shadow-[0_0_25px_rgba(34,211,238,0.2)]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            ENGINE STUDIO MODE:
          </span>
          <div className="flex items-center gap-2 bg-base-950/80 p-1 rounded-xl border border-base-750">
            <button
              onClick={() => setAssemblyMode(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                !assemblyMode
                  ? "bg-cyan-500 text-black shadow-[0_0_14px_rgba(34,211,238,0.5)] scale-[1.02]"
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
              }`}
            >
              <Cog size={15} /> Spec Parameters
            </button>
            <button
              onClick={() => setAssemblyMode(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                assemblyMode
                  ? "bg-gradient-to-r from-cyan-400 to-sky-400 text-black shadow-[0_0_18px_rgba(34,211,238,0.6)] scale-[1.02] animate-pulse"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Wrench size={15} /> 🤖 Robotic Assembly Line
            </button>
          </div>
        </div>

        {assemblyMode ? (
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-cyan-300 font-bold hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
              <Sparkles size={13} className="text-cyan-400 animate-spin" />
              Build Progress: {assembly.progressPercentage}%
            </span>
            {assembly.isAssemblyComplete ? (
              <button
                onClick={() => setShowCompletionModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-mono font-bold hover:bg-emerald-400 transition-all shadow-[0_0_16px_rgba(16,185,129,0.4)] active:scale-95 cursor-pointer"
              >
                <Check size={14} /> View Completed Engine
              </button>
            ) : (
              <button
                onClick={() => {
                  if (assembly.nextRecommendedComponent) {
                    assembly.startInstall(assembly.nextRecommendedComponent.id);
                  }
                }}
                disabled={!assembly.nextRecommendedComponent}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 text-xs font-mono font-bold hover:bg-cyan-500 hover:text-black transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-40"
              >
                <Play size={13} /> Auto Step
              </button>
            )}
          </div>
        ) : (
          <span className="text-[11px] font-mono text-slate-400 hidden lg:inline">
            Click <strong className="text-cyan-300">Robotic Assembly Line</strong> for 3D animated engine building
          </span>
        )}
      </div>

      {/* Assembly Mode Viewport */}
      {assemblyMode ? (
        <div className="space-y-4 animate-stage-transition-enter">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start min-h-[460px]">
            {/* Left Column: Spacious Engine SVG Assembly Canvas Viewport (Sticky Constant Workstation) */}
            <div className="xl:col-span-7 h-[calc(100vh-170px)] max-h-[640px] overflow-hidden sticky top-4 z-20">
              <EngineAssemblyViewer
                installedComponents={assembly.installedComponents}
                activeComponentId={assembly.activeComponentId}
                phase={assembly.phase}
                hoveredComponentId={assembly.hoveredComponentId}
                isExplodedView={assembly.isExplodedView}
                isAssemblyComplete={assembly.isAssemblyComplete}
                engineConfig={eng}
                onAdvancePhase={assembly.advancePhase}
                onHoverComponent={assembly.setHoveredComponentId}
                onCompleteInstall={() => {
                  const completedId = assembly.activeComponentId;
                  assembly.completeInstall();
                  if (completedId === "pistons") updateEngine({ pistons: "forged" });
                  if (completedId === "crankshaft") updateEngine({ crank: "forged_steel" });
                  if (completedId === "cylinder_head") updateEngine({ valvetrain: "dohc_vvl" });
                  if (completedId === "turbocharger") updateEngine({ intake: "turbo_single", boostPressure: 1.4 });
                  if (completedId === "intake_manifold") updateEngine({ intake: "na" });
                  
                  if (assembly.installedComponents.length + 1 === 12) {
                    setShowCompletionModal(true);
                  }
                }}
                onSkipAnimation={assembly.skipCurrentAnimation}
              />
            </div>

            {/* Right Column: Spacious 5-Column Tabbed Control Console */}
            <div className="xl:col-span-5 h-[calc(100vh-170px)] max-h-[640px] overflow-hidden">
              <AssemblyTabSwitcher
                installedComponents={assembly.installedComponents}
                activeComponentId={assembly.activeComponentId}
                phase={assembly.phase}
                hoveredComponentId={assembly.hoveredComponentId}
                canInstall={assembly.canInstall}
                onStartInstall={assembly.startInstall}
                onHoverComponent={assembly.setHoveredComponentId}
                progressPercentage={assembly.progressPercentage}
                currentStats={assembly.currentStats}
                isExplodedView={assembly.isExplodedView}
                nextRecommendedComponent={assembly.nextRecommendedComponent}
                isAssemblyComplete={assembly.isAssemblyComplete}
                onResetAssembly={assembly.resetAssembly}
                onToggleExplodedView={assembly.toggleExplodedView}
                engineConfig={eng}
              />
            </div>
          </div>

          {/* Fullscreen Assembly Completion Celebration Modal */}
          <AssemblyCompletionModal
            isOpen={showCompletionModal}
            onClose={() => setShowCompletionModal(false)}
            onReset={assembly.resetAssembly}
            stats={assembly.currentStats}
            layout={eng.layout}
            engineConfig={eng}
          />
        </div>
      ) : (
        <>
          {/* Inline Auto-Optimize Preset Tuning Bar (Translucent Liquid Glass) */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white/40 dark:bg-base-900/60 border border-white/60 dark:border-cyan-500/30 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-500 animate-pulse" />
              <span className="text-xs font-mono font-extrabold text-slate-800 dark:text-cyan-300 uppercase tracking-wider">
                AUTO OPTIMIZE TARGET:
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {([
                { id: "performance" as OptimizeGoal, icon: <TrendingUp size={12} />, label: "Performance" },
                { id: "cost" as OptimizeGoal, icon: <DollarSign size={12} />, label: "Lowest Cost" },
                { id: "reliability" as OptimizeGoal, icon: <Wrench size={12} />, label: "Reliability" },
                { id: "efficiency" as OptimizeGoal, icon: <Leaf size={12} />, label: "Efficiency" },
                { id: "luxury" as OptimizeGoal, icon: <Flame size={12} />, label: "Luxury" },
              ]).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setOptimizeGoal(opt.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    optimizeGoal === opt.id
                      ? "bg-cyan-500 text-black shadow-[0_0_14px_rgba(34,211,238,0.5)] scale-[1.02]"
                      : "bg-white/40 dark:bg-base-800/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/65 dark:hover:bg-base-750 border border-white/50 dark:border-base-700 backdrop-blur-md"
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <PresetQuickSelect />

          {/* 3-Column Ergonomic Studio Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start pb-4">
            
            {/* COLUMN 1: Engine Layout & Architecture */}
            <div className="space-y-4">
              {/* Persistent Engine Blueprint Banner (Phase 8) */}
              <div className="relative overflow-hidden p-3 rounded-2xl bg-gradient-to-r from-base-900 via-cyan-950/20 to-base-900 border border-cyan-500/30 backdrop-blur-xl shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    onClick={openEnlargedModal}
                    className="relative group cursor-pointer w-20 h-16 rounded-xl bg-base-950/80 border border-cyan-500/30 overflow-hidden flex items-center justify-center shrink-0"
                    title="Click to enlarge schematic"
                  >
                    <img
                      src={ENGINE_DIAGRAM_IMAGES[eng.layout] || "/engine_diagram_v8.png"}
                      alt={`${ENGINE_LAYOUTS[eng.layout]?.label || "Engine"} Layout Schematic`}
                      className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 size={14} className="text-cyan-300" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-100 font-mono">
                        {ENGINE_LAYOUTS[eng.layout]?.label || eng.layout} Blueprint
                      </h4>
                      <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[9px] font-mono">
                        {ENGINE_LAYOUTS[eng.layout]?.cylinders} Cyl
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Base: {ENGINE_LAYOUTS[eng.layout]?.weightBase}kg · Balance: {((ENGINE_LAYOUTS[eng.layout]?.balanceFactor || 0) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                <button
                  onClick={openEnlargedModal}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <Maximize2 size={12} /> HUD
                </button>
              </div>

              {/* Real-Time Engine Audio Synthesizer Box (Below Engine Diagram) */}
              <EngineAudioVisualizer currentLayout={eng.layout} rpm={sim.peakPowerRpm || 6500} />

              {/* Architecture Section */}
              <Section title="Architecture" icon={<Cog size={16} />}>
                <div className="space-y-3">
                  <div>
                    <label className="label-mono mb-1.5 block">Engine Type</label>
                    <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                      {engineLayouts.map((layout) => (
                        <button
                          key={layout}
                          onClick={() => {
                            if (layout === "hybrid") {
                              updateEngine({
                                hybridArchitecture: eng.hybridArchitecture === "none" ? "phev" : eng.hybridArchitecture,
                                hybridMotorPower: eng.hybridMotorPower || 180,
                                batteryCapacity: eng.batteryCapacity || 16,
                              });
                            } else {
                              updateEngine({ layout });
                            }
                          }}
                          className={`engine-choice-btn ${eng.layout === layout || (layout === "hybrid" && eng.hybridArchitecture !== "none") ? "active" : ""}`}
                        >
                          <span className="engine-choice-icon">
                            {LAYOUT_ICONS[layout] || <Cog size={11} />}
                          </span>
                          {ENGINE_LAYOUTS[layout].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {!isElectric && (
                    <div className="space-y-2 pt-2 border-t border-base-800">
                      <Slider label="Bore" value={eng.bore} min={60} max={110} unit="mm" onChange={(v) => updateEngine({ bore: v })} />
                      <Slider label="Stroke" value={eng.stroke} min={60} max={110} unit="mm" onChange={(v) => updateEngine({ stroke: v })} />
                      <Slider label="Rod Length" value={eng.rodLength} min={100} max={220} unit="mm" onChange={(v) => updateEngine({ rodLength: v })} />
                      <Slider label="Compression Ratio" value={eng.compressionRatio} min={8} max={16} step={0.1} format={(v) => `${v}:1`} onChange={(v) => updateEngine({ compressionRatio: v })} />
                    </div>
                  )}

                  {/* Drivetrain & Engine Placement */}
                  <div className="space-y-2.5 pt-2 border-t border-base-800">
                    <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-xl p-2.5">
                      <label className="label-mono mb-1.5 flex items-center justify-between text-xs font-bold text-cyan-300">
                        <span>Drivetrain (Drive Type)</span>
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono text-[10px]">
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
                    </div>

                    <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-2.5">
                      <label className="label-mono mb-1.5 flex items-center justify-between text-xs font-bold text-purple-300">
                        <span>Engine Placement (Position)</span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono text-[10px]">
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
                    </div>
                  </div>
                </div>
              </Section>

              {/* Internals with Compact AI Card (Phase 7) */}
              {!isElectric && (
                <Section title="Internals" icon={<Cog size={16} />}>
                  {/* Compact AI Engineer Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2 mb-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded-lg bg-purple-500/20 text-purple-300">
                        <Bot size={14} />
                      </div>
                      <span className="font-bold text-purple-200 text-xs">Apex AI</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="engine-toggle-bar">
                        {(["budget", "track", "luxury", "balanced"] as Philosophy[]).map((p) => (
                          <button
                            key={p}
                            onClick={() => setPhilosophy(p)}
                            className={`engine-toggle-btn ${philosophy === p ? "active" : ""}`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Select<CrankMaterial> label="Crankshaft" value={eng.crank} options={(Object.keys(CRANK_MATERIALS) as CrankMaterial[]).map((c) => ({ value: c, label: CRANK_MATERIALS[c].label }))} onChange={(v) => updateEngine({ crank: v })} />
                    <Select<PistonType> label="Pistons" value={eng.pistons} options={(Object.keys(PISTON_TYPES) as PistonType[]).map((p) => ({ value: p, label: PISTON_TYPES[p].label }))} onChange={(v) => updateEngine({ pistons: v })} />
                    <Select<ValvetrainType> label="Valvetrain" value={eng.valvetrain} options={(Object.keys(VALVETRAIN_TYPES) as ValvetrainType[]).map((v) => ({ value: v, label: VALVETRAIN_TYPES[v].label }))} onChange={(v) => updateEngine({ valvetrain: v })} />
                    <Slider label="Cam Duration" value={eng.camDuration} min={240} max={340} unit="°" onChange={(v) => updateEngine({ camDuration: v })} />
                    <Slider label="Cam Lift" value={eng.camLift} min={6} max={16} step={0.5} unit="mm" onChange={(v) => updateEngine({ camLift: v })} />
                    <Slider label="Cam Timing" value={eng.camTiming} min={-10} max={10} step={0.5} unit="°" onChange={(v) => updateEngine({ camTiming: v })} />
                  </div>
                </Section>
              )}
            </div>

            {/* COLUMN 2: Fuel, Turbo, Cooling, ECU & Hybrid Controls */}
            <div className="space-y-4">
              {!isElectric && (
                <>

                  {/* Live Warnings */}
                  {warnings.length > 0 && (
                    <div className="panel p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={14} className="text-amber-400" />
                        <span className="label-mono text-amber-300">Live Warnings</span>
                        <span className="text-[10px] text-purple-400/60 ml-1">{warnings.length} active</span>
                      </div>
                      <div className="space-y-1.5">
                        {warnings.map((w) => (
                          <div key={w.id} className="engine-warning-bar">
                            <span className="warning-dot" />
                            <span className="font-mono text-[10px] text-amber-400/70 uppercase tracking-wider">{w.category}</span>
                            <span className="flex-1 text-[11px]">{w.text}</span>
                            <button onClick={() => setDismissedWarnings(prev => [...prev, w.id])} className="text-red-400/50 hover:text-red-300 transition-colors">
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Section title="Induction & Fuel" icon={<Zap size={16} />}>
                    <div className="space-y-2.5">
                      <Select<IntakeType> label="Intake" value={eng.intake} options={(Object.keys(INTAKE_TYPES) as IntakeType[]).map((i) => ({ value: i, label: INTAKE_TYPES[i].label }))} onChange={(v) => updateEngine({ intake: v })} />
                      <Select<FuelSystemType> label="Fuel System" value={eng.fuelSystem} options={(Object.keys(FUEL_SYSTEMS) as FuelSystemType[]).map((f) => ({ value: f, label: FUEL_SYSTEMS[f].label }))} onChange={(v) => updateEngine({ fuelSystem: v })} />
                      {isForced && (
                        <>
                          <Slider label="Boost Pressure" value={eng.boostPressure} min={0} max={5} step={0.1} unit="bar" onChange={(v) => updateEngine({ boostPressure: v })} />
                          <Slider label="Intercooler Eff." value={eng.intercoolerEff} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => updateEngine({ intercoolerEff: v })} />
                        </>
                      )}
                      <Slider label="AFR" value={eng.afr} min={10} max={16} step={0.1} onChange={(v) => updateEngine({ afr: v })} />
                      <Slider label="Ignition Timing" value={eng.ignitionTiming} min={10} max={40} unit="°BTDC" onChange={(v) => updateEngine({ ignitionTiming: v })} />
                    </div>
                  </Section>

                  {/* Turbo Mechanics (Collapsible Phase 5) */}
                  {isForced && (
                    <Section title="Turbo Mechanics" icon={<Wind size={16} />} collapsible defaultOpen={false}>
                      <div className="space-y-2.5">
                        <Select label="Turbo Housing" value={eng.turboHousing} options={Object.keys(TURBO_HOUSINGS).map((k) => ({ value: k, label: TURBO_HOUSINGS[k].label }))} onChange={(v) => updateEngine({ turboHousing: v as EngineConfig["turboHousing"] })} />
                        <Select label="Intercooler Type" value={eng.intercoolerType} options={Object.keys(INTERCOOLER_TYPES).map((k) => ({ value: k, label: INTERCOOLER_TYPES[k].label }))} onChange={(v) => updateEngine({ intercoolerType: v as EngineConfig["intercoolerType"] })} />
                        <Select label="Wastegate Type" value={eng.wastegateType} options={Object.keys(WASTEGATE_TYPES).map((k) => ({ value: k, label: WASTEGATE_TYPES[k].label }))} onChange={(v) => updateEngine({ wastegateType: v as EngineConfig["wastegateType"] })} />
                        <Select label="BOV / Dump Valve" value={eng.bovType} options={Object.keys(BOV_TYPES).map((k) => ({ value: k, label: BOV_TYPES[k].label }))} onChange={(v) => updateEngine({ bovType: v as EngineConfig["bovType"] })} />
                        <Select label="Boost Controller" value={eng.boostController} options={Object.keys(BOOST_CONTROLLERS).map((k) => ({ value: k, label: BOOST_CONTROLLERS[k].label }))} onChange={(v) => updateEngine({ boostController: v as EngineConfig["boostController"] })} />
                        <Slider label="Compressor A/R" value={eng.compressorAR} min={0.3} max={1.2} step={0.05} onChange={(v) => updateEngine({ compressorAR: v })} />
                        <Slider label="Turbine A/R" value={eng.turbineAR} min={0.4} max={1.4} step={0.05} onChange={(v) => updateEngine({ turbineAR: v })} />
                        <Slider label="Turbine Wheel Ø" value={eng.turbineWheelDia} min={30} max={100} unit="mm" onChange={(v) => updateEngine({ turbineWheelDia: v })} />
                        <Slider label="Turbo Size" value={eng.turboSize} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => updateEngine({ turboSize: v })} />
                        <Slider label="Wastegate Size" value={eng.wastegateSize} min={0} max={60} unit="mm" onChange={(v) => updateEngine({ wastegateSize: v })} />
                      </div>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        <Toggle label="Anti-Lag System (ALS)" value={eng.antiLag} onChange={(v) => updateEngine({ antiLag: v })} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <StatTile label="Turbo Lag" value={`${sim.turboLag.toFixed(2)}s`} icon={<Wind size={13} />} />
                        <StatTile label="Boost" value={`${sim.boostPressure.toFixed(1)} bar`} icon={<Gauge size={13} />} />
                        <StatTile label="Knock Risk" value={`${(sim.knockRisk * 100).toFixed(0)}%`} icon={<AlertTriangle size={13} />} />
                      </div>
                    </Section>
                  )}

                  {/* Cooling & Exhaust (Collapsible Phase 5) */}
                  <Section title="Cooling & Exhaust" icon={<Thermometer size={16} />} collapsible defaultOpen={false}>
                    <div className="grid grid-cols-2 gap-2.5">
                      <Slider label="Radiator" value={eng.coolingRadiator} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => updateEngine({ coolingRadiator: v })} />
                      <Slider label="Oil Cooler" value={eng.coolingOilCooler} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => updateEngine({ coolingOilCooler: v })} />
                      <Slider label="Water Pump" value={eng.coolingWaterPump} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => updateEngine({ coolingWaterPump: v })} />
                      <Slider label="Fan Speed" value={eng.coolingFanSpeed} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => updateEngine({ coolingFanSpeed: v })} />
                    </div>
                    <div className="space-y-2 mt-3 pt-2 border-t border-base-800">
                      <Slider label="Exhaust Primary" value={eng.exhaustPrimaryLength} min={400} max={1400} unit="mm" onChange={(v) => updateEngine({ exhaustPrimaryLength: v })} />
                      <Slider label="Collector Dia." value={eng.exhaustCollectorDia} min={40} max={100} unit="mm" onChange={(v) => updateEngine({ exhaustCollectorDia: v })} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Toggle label="Catalytic Converter" value={eng.exhaustCat} onChange={(v) => updateEngine({ exhaustCat: v })} />
                      <Toggle label="Valved Exhaust" value={eng.exhaustValved} onChange={(v) => updateEngine({ exhaustValved: v })} />
                    </div>
                  </Section>

                  {/* ECU & Eco Tech (Collapsible Phase 5) */}
                  <Section title="ECU & Eco Technology" icon={<Activity size={16} />} collapsible defaultOpen={false}>
                    <div className="space-y-2.5 mb-3">
                      <Select
                        label="ECU Calibration Map"
                        value={eng.ecuMapMode || "balanced"}
                        options={[
                          { value: "economy", label: "🍃 Eco Lean-Burn (-0.8 L/100km)" },
                          { value: "balanced", label: "⚖️ Balanced Daily" },
                          { value: "sport", label: "🏎️ Sport (+0.5 L/100km)" },
                          { value: "race", label: "🏁 Race Track (+1.2 L/100km)" },
                        ]}
                        onChange={(v) => updateEngine({ ecuMapMode: v as EngineConfig["ecuMapMode"] })}
                      />
                      <Toggle label="Automatic Start-Stop System (-0.6 L/100km)" value={eng.hasStartStop || false} onChange={(v) => updateEngine({ hasStartStop: v })} />
                    </div>
                    <div className="space-y-2 pt-2 border-t border-base-800">
                      <Slider label="RPM Limiter" value={eng.rpmLimiter} min={4000} max={20000} step={100} unit="rpm" onChange={(v) => updateEngine({ rpmLimiter: v })} />
                      <Slider label="Redline" value={eng.redline} min={3500} max={18000} step={100} unit="rpm" onChange={(v) => updateEngine({ redline: v })} />
                    </div>
                  </Section>
                </>
              )}

              {/* Electric / Hybrid Section — Horizontal Grid Architecture */}
              {(isElectric || isHybrid) && (
                <Section title={isElectric ? "Electric Powertrain" : "Hybrid System & MGU Architecture"} icon={<Battery size={16} />}>
                  <div className="space-y-4">
                    {/* Subsystem Cards — Full Column Width for High Readability */}
                    <div className="space-y-3">
                      
                      {/* SUB-CARD 1: Architecture & Electric Motor */}
                      <div className="p-3.5 rounded-xl bg-base-950/80 border border-cyan-500/30 space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-base-800">
                          <Zap size={15} className="text-cyan-400" />
                          <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">Architecture & Motor</h4>
                        </div>
                        {isElectric && (
                          <>
                            <Select label="Motor Type" value={eng.evMotorType} options={(Object.keys(EV_MOTOR_TYPES) as string[]).map((m) => ({ value: m, label: EV_MOTOR_TYPES[m].label }))} onChange={(v) => updateEngine({ evMotorType: v as EngineConfig["evMotorType"] })} />
                            <Slider label="Motor Power" value={eng.evMotorPower} min={50} max={1500} step={10} unit="kW" onChange={(v) => updateEngine({ evMotorPower: v })} />
                            <Select label="Motor Layout" value={eng.motorLayout} options={[{ value: "none", label: "Single" }, { value: "front", label: "Front" }, { value: "rear", label: "Rear" }, { value: "both", label: "Dual Motor" }]} onChange={(v) => updateEngine({ motorLayout: v as EngineConfig["motorLayout"] })} />
                          </>
                        )}
                        {!isElectric && (
                          <Select
                            label="Hybrid Architecture"
                            value={eng.hybridArchitecture}
                            options={(Object.keys(HYBRID_ARCHITECTURES) as string[]).map((arch) => ({
                              value: arch,
                              label: HYBRID_ARCHITECTURES[arch].label,
                            }))}
                            onChange={(v) => {
                              const newArch = v as EngineConfig["hybridArchitecture"];
                              const caps = HYBRID_ARCHITECTURES[newArch];
                              updateEngine({
                                hybridArchitecture: newArch,
                                batteryCapacity: caps.minBattery,
                                hybridMotorPower: newArch === "none" ? 0 : Math.max(60, Math.min(eng.hybridMotorPower || 60, caps.maxMotorPower)),
                              });
                            }}
                          />
                        )}
                        {isHybrid && !isElectric && eng.hybridArchitecture !== "none" && (
                          <>
                            <Select
                              label="Motor Placement"
                              value={eng.motorPlacement}
                              options={(Object.keys(MOTOR_PLACEMENTS) as string[]).map((p) => ({
                                value: p,
                                label: MOTOR_PLACEMENTS[p].label,
                              }))}
                              onChange={(v) => updateEngine({ motorPlacement: v as EngineConfig["motorPlacement"] })}
                            />
                            <Slider
                              label="Electric Motor Power"
                              value={eng.hybridMotorPower}
                              min={5}
                              max={HYBRID_ARCHITECTURES[eng.hybridArchitecture]?.maxMotorPower || 200}
                              step={5}
                              unit="kW"
                              onChange={(v) => updateEngine({ hybridMotorPower: v })}
                            />
                          </>
                        )}
                      </div>

                      {/* SUB-CARD 2: Battery & Charging */}
                      <div className="p-3.5 rounded-xl bg-base-950/80 border border-emerald-500/30 space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-base-800">
                          <Battery size={15} className="text-emerald-400" />
                          <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">Battery & Charging</h4>
                        </div>
                        <Select label="Battery Chemistry" value={eng.batteryChemistry || "solid_state"} options={(Object.keys(BATTERY_CHEMISTRIES) as string[]).map((b) => ({ value: b, label: BATTERY_CHEMISTRIES[b].label }))} onChange={(v) => updateEngine({ batteryChemistry: v as EngineConfig["batteryChemistry"] })} />
                        <Slider
                          label="Battery Capacity"
                          value={eng.batteryCapacity || 16}
                          min={isElectric ? 20 : (HYBRID_ARCHITECTURES[eng.hybridArchitecture]?.minBattery || 0.5)}
                          max={isElectric ? 120 : (HYBRID_ARCHITECTURES[eng.hybridArchitecture]?.maxBattery || 25)}
                          step={0.5}
                          unit="kWh"
                          onChange={(v) => updateEngine({ batteryCapacity: v })}
                        />
                        <Select
                          label="Charging & V2G Power"
                          value={eng.chargingTech || "nacs"}
                          options={(Object.keys(CHARGING_TECH_TYPES) as (keyof typeof CHARGING_TECH_TYPES)[]).map((k) => ({ value: k, label: CHARGING_TECH_TYPES[k].label }))}
                          onChange={(v) => updateEngine({ chargingTech: v as EngineConfig["chargingTech"] })}
                        />
                        <Select
                          label="Regen Braking Tech"
                          value={eng.regenBrakingTech || "brake_by_wire"}
                          options={(Object.keys(REGEN_BRAKING_TYPES) as (keyof typeof REGEN_BRAKING_TYPES)[]).map((k) => ({ value: k, label: REGEN_BRAKING_TYPES[k].label }))}
                          onChange={(v) => updateEngine({ regenBrakingTech: v as EngineConfig["regenBrakingTech"] })}
                        />
                        <Slider label="Regen Harvest Level" value={eng.regenLevel || 0.8} min={0} max={1} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => updateEngine({ regenLevel: v })} />
                      </div>

                      {/* SUB-CARD 3: Power Electronics & Transmission */}
                      <div className="p-3.5 rounded-xl bg-base-950/80 border border-purple-500/30 space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-base-800">
                          <Activity size={15} className="text-purple-400" />
                          <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">Electronics & Chiller</h4>
                        </div>
                        <Select
                          label="Power Electronics (SiC / GaN)"
                          value={eng.powerElectronicsType || "silicon_carbide_sic"}
                          options={(Object.keys(POWER_ELECTRONICS_TYPES) as (keyof typeof POWER_ELECTRONICS_TYPES)[]).map((k) => ({ value: k, label: POWER_ELECTRONICS_TYPES[k].label }))}
                          onChange={(v) => updateEngine({ powerElectronicsType: v as EngineConfig["powerElectronicsType"] })}
                        />
                        <Select
                          label="Hybrid Transmission"
                          value={eng.hybridTransmission || "dct_hybrid"}
                          options={(Object.keys(HYBRID_TRANSMISSION_TYPES) as (keyof typeof HYBRID_TRANSMISSION_TYPES)[]).map((k) => ({ value: k, label: HYBRID_TRANSMISSION_TYPES[k].label }))}
                          onChange={(v) => updateEngine({ hybridTransmission: v as EngineConfig["hybridTransmission"] })}
                        />
                        <Select
                          label="Thermal Management Chiller"
                          value={eng.thermalManagement || "liquid_chiller"}
                          options={(Object.keys(THERMAL_MANAGEMENT_TYPES) as (keyof typeof THERMAL_MANAGEMENT_TYPES)[]).map((k) => ({ value: k, label: THERMAL_MANAGEMENT_TYPES[k].label }))}
                          onChange={(v) => updateEngine({ thermalManagement: v as EngineConfig["thermalManagement"] })}
                        />
                        <Select
                          label="Sports Hybrid Suite"
                          value={eng.sportsHybridTech || "electric_torque_fill"}
                          options={(Object.keys(SPORTS_HYBRID_TECH_TYPES) as (keyof typeof SPORTS_HYBRID_TECH_TYPES)[]).map((k) => ({ value: k, label: SPORTS_HYBRID_TECH_TYPES[k].label }))}
                          onChange={(v) => updateEngine({ sportsHybridTech: v as EngineConfig["sportsHybridTech"] })}
                        />
                      </div>
                    </div>

                    {/* FULL-WIDTH ROW: MGU-H & Energy Recovery Deployment */}
                    {isHybrid && !isElectric && (
                      <div className="p-3.5 rounded-xl bg-gradient-to-r from-base-950 via-cyan-950/30 to-base-950 border border-cyan-500/40 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                        <Toggle label="MGU-H Turbo Heat Recovery" value={eng.hasMguH || false} onChange={(v) => updateEngine({ hasMguH: v })} />
                        {eng.hasMguH && (
                          <Select label="MGU-H Mode" value={eng.mguHMode || "auto"} options={(Object.keys(MGU_H_MODES) as string[]).map((m) => ({ value: m, label: MGU_H_MODES[m].label }))} onChange={(v) => updateEngine({ mguHMode: v as EngineConfig["mguHMode"] })} />
                        )}
                        <Select label="Deploy Mode" value={eng.deployMode || "qualifying"} options={(Object.keys(HYBRID_DEPLOY_MODES) as string[]).map((d) => ({ value: d, label: HYBRID_DEPLOY_MODES[d].label }))} onChange={(v) => updateEngine({ deployMode: v as EngineConfig["deployMode"] })} />
                      </div>
                    )}
                  </div>
                </Section>
              )}
            </div>

            {/* COLUMN 3: Live Stats, Power Chart & Telemetry Sidebar */}
            <div className="space-y-4">
              <Section title="Power & Torque" icon={<Zap size={16} />}>
                <LineChart series={powerSeries} xLabel="RPM" yLabel="hp / Nm" height={190} />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span className="flex items-center gap-1"><span className="h-2 w-3 bg-accent-400 rounded-sm" />Power</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: "#e879a0" }} />Torque</span>
                </div>
              </Section>

              <Section title="Engine Vitals" icon={<Gauge size={16} />}>
                <div className="grid grid-cols-2 gap-2">
                  <StatTile label="Displacement" value={sim.displacement} unit="cc" accent="accent" />
                  <StatTile label="Cylinders" value={sim.cylinderCount} />
                  <StatTile label="Peak Power" value={sim.peakPower} unit="hp" accent="accent" sub={`@ ${sim.peakPowerRpm} rpm`} />
                  <StatTile label="Peak Torque" value={sim.peakTorque} unit="Nm" accent="accent" sub={`@ ${sim.peakTorqueRpm} rpm`} />
                  {!isElectric && <StatTile label="Thermal Eff." value={`${(sim.thermalEfficiency * 100).toFixed(1)}%`} accent="ok" />}
                  <StatTile label="Redline" value={sim.redline} unit="rpm" />
                  {!isElectric && <StatTile label="Knock Risk" value={`${(sim.knockRisk * 100).toFixed(0)}%`} accent={sim.knockRisk > 0.5 ? "danger" : sim.knockRisk > 0.3 ? "warn" : "ok"} />}
                  {!isElectric && <StatTile label="Octane Req." value={sim.octaneRequired} unit="RON" />}
                  {!isElectric && <StatTile label="BSFC" value={sim.bsfc} unit="g/kWh" />}
                  {!isElectric && <StatTile label="Turbo Lag" value={sim.turboLag.toFixed(2)} unit="s" accent={sim.turboLag > 0.6 ? "warn" : "default"} />}
                  <StatTile label="Engine Weight" value={sim.engineWeight} unit="kg" />
                  <StatTile label="Reliability" value={`${(sim.reliability * 100).toFixed(0)}%`} accent={sim.reliability > 0.85 ? "ok" : "warn"} />
                </div>
              </Section>

              {(isHybrid || isElectric) && (
                <Section title="Hybrid / Electric" icon={<Battery size={16} />}>
                  <div className="grid grid-cols-2 gap-2">
                    {sim.mguHPower > 0 && <StatTile label="MGU-H Power" value={sim.mguHPower} unit="kW" accent="accent" />}
                    {sim.mguKPower > 0 && <StatTile label="MGU-K Power" value={sim.mguKPower} unit="kW" accent="accent" />}
                    <StatTile label="Combined Power" value={sim.peakPower} unit="hp" accent="accent" />
                    <StatTile label="Combined Torque" value={sim.peakTorque} unit="Nm" />
                    <StatTile label="Battery" value={sim.batteryEnergy} unit="kWh" />
                    <StatTile label="Battery Weight" value={sim.batteryWeight} unit="kg" />
                    {isElectric && <StatTile label="Range" value={sim.electricRange} unit="km" accent="ok" />}
                    <StatTile label="Regen Eff." value={`${(sim.regenEfficiency * 100).toFixed(0)}%`} accent="ok" />
                  </div>
                </Section>
              )}

              {/* AI Suggestion Card */}
              <Section title="AI Suggestion" icon={<Lightbulb size={16} />}>
                <div className="ai-suggestion-card">
                  <div className="text-xs font-semibold text-purple-200 mb-1">{suggestion.title}</div>
                  <div className="text-[10.5px] text-purple-300/70 leading-relaxed">{suggestion.detail}</div>
                  <div className="suggestion-impacts">
                    {suggestion.impacts.map((impact, i) => (
                      <span key={i} className={`impact-badge ${impact.tone === "good" ? "good" : "caution"}`}>
                        → {impact.label} : {impact.delta}
                      </span>
                    ))}
                  </div>
                  <div className="ai-suggestion-actions">
                    <button className="btn-apply">
                      <Check size={11} /> Apply
                    </button>
                    <button className="btn-explain">
                      <Info size={11} /> Explain
                    </button>
                  </div>
                </div>
              </Section>

              <Section title="Cost & Environment" icon={<DollarSign size={16} />}>
                <div className="grid grid-cols-2 gap-2">
                  <StatTile label="Engine Cost" value={`$${(sim.engineCost / 1000).toFixed(1)}k`} accent="accent" />
                  {!isElectric && <StatTile label="Fuel Economy" value={sim.fuelEconomy} unit="L/100km" />}
                  <StatTile label="Emissions" value={sim.emissions} unit="g/km" accent={sim.emissions > 250 ? "warn" : "default"} />
                  <StatTile label="Noise" value={sim.noise} unit="dB" />
                </div>
              </Section>
            </div>
          </div>

          {/* Full-Width Workstation Console: Autonomous AI Agent Suite */}
          <div className="w-full mt-6 mb-6">
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

          {/* Wide Full-Width Workstation Console: 21 Hybrid & EV Telemetry Suite */}
          {(isHybrid || isElectric) && (
            <div className="w-full mt-4 mb-24 pb-8">
              <HybridTelemetrySuite />
            </div>
          )}
        </>
      )}

      {/* Ultra-Smooth Spatial Glass Lightbox Modal via Portal directly to body */}
      {modalRendered && createPortal(
        <div 
          className={`schematic-backdrop ${modalActive ? "active" : ""}`}
          onClick={closeEnlargedModal}
        >
          <div 
            className="schematic-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Back & Close */}
            <div className="w-full flex items-center justify-between border-b border-blue-200/50 pb-3.5 mb-4">
              <button
                onClick={closeEnlargedModal}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-[#007aff] border border-blue-400/30 text-xs font-mono font-bold hover:bg-blue-500/20 transition-all shadow-sm active:scale-95 cursor-pointer"
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
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3.5 border-t border-blue-200/40">
              <div className="bg-white/85 border border-blue-200/50 rounded-2xl p-3 text-center shadow-sm backdrop-blur-md">
                <span className="block text-[9.5px] font-mono text-slate-400 uppercase tracking-wider">Cylinders</span>
                <span className="text-sm font-mono font-bold text-slate-800">{ENGINE_LAYOUTS[eng.layout]?.cylinders || "-"}</span>
              </div>
              <div className="bg-white/85 border border-blue-200/50 rounded-2xl p-3 text-center shadow-sm backdrop-blur-md">
                <span className="block text-[9.5px] font-mono text-slate-400 uppercase tracking-wider">Base Weight</span>
                <span className="text-sm font-mono font-bold text-slate-800">{ENGINE_LAYOUTS[eng.layout]?.weightBase} kg</span>
              </div>
              <div className="bg-white/85 border border-blue-200/50 rounded-2xl p-3 text-center shadow-sm backdrop-blur-md">
                <span className="block text-[9.5px] font-mono text-slate-400 uppercase tracking-wider">Smoothness</span>
                <span className="text-sm font-mono font-bold text-[#007aff]">{((ENGINE_LAYOUTS[eng.layout]?.balanceFactor || 0) * 100).toFixed(0)}%</span>
              </div>
              <div className="bg-white/85 border border-blue-200/50 rounded-2xl p-3 text-center shadow-sm backdrop-blur-md">
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
