import React, { useState, useMemo } from "react";
import {
  Bot, AlertTriangle, Lightbulb, X, Check,
  Wrench, Trophy, DollarSign, Leaf, Cpu, Zap, Target, Send, Sparkles, RotateCcw,
  ShieldCheck, ArrowUpRight, Layers, FileText
} from "lucide-react";
import { useDesign } from "../state/DesignContext";
import { AIAssistant } from "./AIAssistant";
import { ApexAgentConsole } from "./agents/ApexAgentConsole";
import { AgentDashboard } from "./agents/AgentDashboard";
import { EngineeringLog } from "./EngineeringLog";
import { AIEngineeringPresets, AI_PRESET_LIBRARY } from "./agents/AIEngineeringPresets";

type Severity = "critical" | "warning" | "info";
type EngineerId = "chief" | "race" | "production" | "sustainability" | "technology";
type ModeId = "beginner" | "intermediate" | "expert";
type StudioSubTab = "all" | "presets" | "dashboard" | "advisory" | "agents" | "assistant" | "logs";

const ENGINEERS: Record<EngineerId, { label: string; icon: React.ReactNode; focus: string; tone: string; desc: string }> = {
  chief:          { label: "Chief Engineer",        icon: <Wrench size={16} />,    focus: "Technical & Powertrain", tone: "text-amber-400 border-amber-500/40 bg-amber-500/10", desc: "Monitors internal combustion stress, knock thresholds, and structural integrity." },
  race:           { label: "Race Engineer",         icon: <Trophy size={16} />,    focus: "Lap Time & Aerodynamics",tone: "text-amber-400 border-amber-500/40 bg-amber-500/10", desc: "Optimizes downforce balance, cornering stability, and power-to-weight ratio." },
  production:     { label: "Production Manager",    icon: <DollarSign size={16} />,focus: "Cost & Manufacturing",    tone: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10", desc: "Controls bill-of-materials cost, defect rates, and assembly line throughput." },
  sustainability: { label: "Sustainability Expert", icon: <Leaf size={16} />,      focus: "Environmental Efficiency", tone: "text-green-400 border-green-500/40 bg-green-500/10", desc: "Evaluates carbon footprint, brake dust emissions, and fuel economy ratings." },
  technology:     { label: "Technology Expert",     icon: <Cpu size={16} />,       focus: "800V EV & Electronics",  tone: "text-sky-400 border-sky-500/40 bg-sky-500/10", desc: "Supervises 800V inverter efficiency, cell thermal balancing, and infotainment." },
};

const MODES: Record<ModeId, { label: string; blurb: string }> = {
  beginner:     { label: "Beginner",     blurb: "Plain-language explanations for new builders." },
  intermediate: { label: "Intermediate", blurb: "Engineering suggestions with metrics." },
  expert:       { label: "Expert",       blurb: "Advanced analysis and tradeoffs." },
};

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function round(v: number, dp = 1) {
  const f = Math.pow(10, dp);
  return Math.round(v * f) / f;
}

export function ApexAIStudio() {
  const { design, sim, carConcept, setCarConcept, updateEngine, updateVehicle, updateAero, updateAeroResearch, updateExterior, updateInterior } = useDesign();

  const [studioTab, setStudioTab] = useState<StudioSubTab>("all");
  const [engineer, setEngineer] = useState<EngineerId>("chief");
  const [mode, setMode] = useState<ModeId>("expert");
  const [activeCategory, setActiveCategory] = useState<"all" | "Engine" | "Chassis" | "Aero" | "Manufacturing">("all");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string; time: string }>>([
    { sender: "ai", text: "Apex AI Neural Studio online. I am actively analyzing engine, chassis, aero, and manufacturing parameters.", time: "Just now" }
  ]);
  const [appliedSet, setAppliedSet] = useState<Set<string>>(new Set());

  const e = design.engine;
  const v = design.vehicle;
  const a = v.aero;
  const ar = v.aeroResearch;

  // --- Live warnings derived from sim thresholds ---
  const warnings = useMemo(() => {
    const w: Array<{ id: string; category: "Engine" | "Chassis" | "Aero" | "Manufacturing"; severity: Severity; text: string }> = [];
    if (sim.knockRisk > 0.6) w.push({ id: "knock", category: "Engine", severity: "critical", text: "Knock risk is high — reduce boost or compression." });
    if (e.turboSize > 0.7 && sim.boostPressure > 2.2) w.push({ id: "turbo_os", category: "Engine", severity: "critical", text: "Turbo overspeed risk at current boost." });
    if (sim.coolingMargin < 0.4) w.push({ id: "cooling", category: "Engine", severity: "warning", text: "Poor cooling margin for current setup." });
    if (sim.maxPistonSpeed > 24) w.push({ id: "piston", category: "Engine", severity: "critical", text: "High piston speed threatens reliability." });
    if (v.chassis === "steel_unibody" && sim.weight > 1600) w.push({ id: "rigidity", category: "Chassis", severity: "warning", text: "Steel unibody is heavy — consider aluminum spaceframe." });
    if (sim.weight > 2000) w.push({ id: "weight", category: "Chassis", severity: "warning", text: "Excessive vehicle weight hurts performance." });
    if (sim.separationRisk > 0.55) w.push({ id: "separation", category: "Aero", severity: "critical", text: "Flow separation risk — reduce diffuser/wing aggression." });
    if (sim.dragCoeff > 0.42) w.push({ id: "drag", category: "Aero", severity: "warning", text: "Excessive drag limiting top speed." });
    if (sim.aeroBalance < 0.42 || sim.aeroBalance > 0.62) w.push({ id: "imbalance", category: "Aero", severity: "critical", text: `Aero imbalance (${(sim.aeroBalance * 100).toFixed(0)}% rear) — adjust balance.` });
    if (sim.totalCost > 90000) w.push({ id: "cost", category: "Manufacturing", severity: "critical", text: "Cost too high for target market." });
    if (sim.manufacturing.defectRate > 8) w.push({ id: "defects", category: "Manufacturing", severity: "warning", text: "Complex assembly raising defect rate." });

    if (carConcept === "budget" && sim.totalCost > 28000) {
      w.push({ id: "concept_budget_cost", category: "Manufacturing", severity: "critical", text: `[Budget Target Violation] Production cost ($${sim.totalCost.toLocaleString()}) exceeds budget target ($28,000 max).` });
    }
    if (carConcept === "track" && sim.weight > 1350) {
      w.push({ id: "concept_track_weight", category: "Chassis", severity: "warning", text: `[Track Target Violation] Curb weight (${sim.weight}kg) is too high for peak lap times (target < 1,350kg).` });
    }
    if (carConcept === "track" && sim.dragCoeff > 0.36) {
      w.push({ id: "concept_track_drag", category: "Aero", severity: "warning", text: `[Track Target Violation] High drag coefficient (${sim.dragCoeff.toFixed(2)} Cd) limiting high-speed straight performance.` });
    }
    if (carConcept === "luxury" && v.interior.soundDeadening < 0.6) {
      w.push({ id: "concept_luxury_nvh", category: "Manufacturing", severity: "warning", text: `[Luxury Target Violation] High cabin noise (NVH). Increase sound deadening for luxury compliance.` });
    }
    if (carConcept === "luxury" && sim.luxuryRating < 0.7) {
      w.push({ id: "concept_luxury_comfort", category: "Manufacturing", severity: "critical", text: `[Luxury Target Violation] Luxury rating (${(sim.luxuryRating * 100).toFixed(0)}%) is below luxury standards.` });
    }

    return w;
  }, [sim, e.turboSize, v.chassis, carConcept, v.interior.soundDeadening]);

  const activeWarnings = warnings.filter((w) => !dismissed.has(w.id) && (activeCategory === "all" || w.category === activeCategory));

  // --- Concrete, applyable suggestions ---
  const suggestions = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      detail: string;
      impacts: { label: string; delta: string; tone: "good" | "bad" }[];
      apply: () => void;
    }> = [];

    if (sim.coolingMargin < 0.5) {
      list.push({
        id: "radiator",
        title: "Increase Glycol Radiator Size (+15%)",
        detail: "Larger radiator improves thermal dissipation under continuous high load.",
        impacts: [
          { label: "Reliability", delta: "+4%", tone: "good" },
          { label: "Cost", delta: "+$120", tone: "bad" },
          { label: "Weight", delta: "+0.8 kg", tone: "bad" },
        ],
        apply: () => updateEngine({ coolingRadiator: clamp(e.coolingRadiator + 0.15, 0, 1) }),
      });
    }

    if (sim.separationRisk > 0.5 && ar.diffuser.angle > 10) {
      const cut = Math.min(3, ar.diffuser.angle - 8);
      list.push({
        id: "diffuser",
        title: `Reduce Diffuser Expansion Angle by ${cut}°`,
        detail: "Prevents boundary layer turbulent separation, keeping underbody airflow attached.",
        impacts: [
          { label: "Separation Risk", delta: `-${round(cut / 30 * 0.4, 2)}`, tone: "good" },
          { label: "Rear Downforce", delta: "-2%", tone: "bad" },
        ],
        apply: () => updateAeroResearch({ diffuser: { ...ar.diffuser, angle: clamp(ar.diffuser.angle - cut, 0, 25) } }),
      });
    }

    if (sim.aeroBalance < 0.45) {
      list.push({
        id: "wing_aoa",
        title: "Increase Rear Wing AoA by 2°",
        detail: "Shifts aerodynamic pressure center rearward for high-speed cornering stability.",
        impacts: [
          { label: "Rear Grip", delta: "+5%", tone: "good" },
          { label: "Top Speed", delta: "-3 km/h", tone: "bad" },
        ],
        apply: () => updateAeroResearch({ rearWing: { ...ar.rearWing, angleOfAttack: clamp(ar.rearWing.angleOfAttack + 2, 0, 30) } }),
      });
    }

    if (sim.weight > 1650 && v.chassis === "steel_unibody") {
      list.push({
        id: "chassis",
        title: "Upgrade to Aluminum Spaceframe Chassis",
        detail: "Lightweight alloy structure sheds mass while increasing torsional rigidity.",
        impacts: [
          { label: "Curb Weight", delta: "-90 kg", tone: "good" },
          { label: "Unit Cost", delta: "+$2,400", tone: "bad" },
        ],
        apply: () => updateVehicle({ chassis: "aluminum_spaceframe" }),
      });
    }

    if (sim.reliability < 0.65 && e.boostPressure > 1.2) {
      list.push({
        id: "boost",
        title: "Reduce Turbo Boost Pressure by 0.2 bar",
        detail: "Lowers peak cylinder stress and thermal strain on head gasket and rods.",
        impacts: [
          { label: "Reliability", delta: "+6%", tone: "good" },
          { label: "Power", delta: "-18 hp", tone: "bad" },
        ],
        apply: () => updateEngine({ boostPressure: clamp(round(e.boostPressure - 0.2, 2), 0, 4) }),
      });
    }

    return list;
  }, [sim, e, v, ar, updateEngine, updateAeroResearch, updateVehicle]);

  // --- Auto-Optimization Preset Logic ---
  const handleAutoOptimize = (preset: string) => {
    if (preset === "performance") {
      updateEngine({ boostPressure: clamp(round(e.boostPressure + 0.3, 2), 0, 4), camLift: clamp(e.camLift + 1, 5, 18), ignitionTiming: clamp(e.ignitionTiming + 2, 0, 40) });
      updateAeroResearch({ rearWing: { ...ar.rearWing, angleOfAttack: clamp(ar.rearWing.angleOfAttack + 3, 0, 30) }, diffuser: { ...ar.diffuser, angle: clamp(ar.diffuser.angle + 2, 0, 25) } });
    } else if (preset === "cost") {
      updateVehicle({ chassis: v.chassis === "carbon_tub" ? "aluminum_spaceframe" : v.chassis, wheelDiameter: clamp(v.wheelDiameter - 1, 15, 22) });
      updateInterior({ seatMaterial: "cloth", dashboardMaterial: "plastic", infotainmentSize: clamp(v.interior.infotainmentSize - 2, 5, 17) });
      updateExterior({ bodyKit: "none", spoilerType: "lip" });
    } else if (preset === "reliability") {
      updateEngine({ boostPressure: clamp(round(e.boostPressure - 0.2, 2), 0, 4), coolingRadiator: clamp(e.coolingRadiator + 0.2, 0, 1), rpmLimiter: clamp(e.rpmLimiter - 500, 4000, 12000) });
    } else if (preset === "efficiency") {
      updateEngine({ afr: clamp(round(e.afr + 0.5, 1), 10, 18), boostPressure: clamp(round(e.boostPressure - 0.1, 2), 0, 4) });
      updateAeroResearch({ wheel: { ...ar.wheel, wheelAero: "aero_discs" }, front: { ...ar.front, activeGrilleShutters: true } });
      updateAero({ bodyShape: clamp(a.bodyShape + 0.15, 0, 1) });
    } else if (preset === "luxury") {
      updateInterior({ seatMaterial: "leather", dashboardMaterial: "wood", infotainmentSize: clamp(v.interior.infotainmentSize + 3, 5, 17), ambientLighting: clamp(v.interior.ambientLighting + 0.3, 0, 1), soundDeadening: clamp(v.interior.soundDeadening + 0.3, 0, 1) });
      updateExterior({ paintFinish: "pearl", rimFinish: "chrome" });
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    const userMsg = { sender: "user" as const, text: query, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setChatInput("");

    setTimeout(() => {
      let reply = "";
      const lower = query.toLowerCase();

      if (lower.includes("valkyrie") || lower.includes("1000 hp") || lower.includes("1,000 hp") || lower.includes("1000hp")) {
        reply = `⚡ [AI Blueprint Deployed] Loaded the 1,000 HP V12 Hybrid Valkyrie configuration! 6.4L V12 screaming to 9,200 RPM, paired with 180kW Solid-State P2 PHEV electric assist, 800V SiC Inverter, AWD DCT-7, and 410mm Carbon Ceramic brakes. All telemetry updated!`;
      } else if (lower.includes("sprint") || lower.includes("sprint race")) {
        reply = `🏁 [AI Blueprint Deployed] Loaded Sprint Race Attack Spec! V8 Twin-Turbo producing 820 HP, 4.10 final drive gearing for maximum corner exit acceleration, ultra-soft slicks, and 18° rear carbon wing.`;
      } else if (lower.includes("downforce") || lower.includes("monaco") || lower.includes("high downforce")) {
        reply = `🌪️ [AI Blueprint Deployed] Loaded Monaco High Downforce Spec! 22° wing AoA, full ground effect Venturi underbody tunnels, and 140mm aggressive front splitter generating 1,850 N of downforce.`;
      } else if (lower.includes("fuel") || lower.includes("efficient") || lower.includes("ecostream") || lower.includes("eco")) {
        reply = `🌱 [AI Blueprint Deployed] Loaded EcoStream Hybrid Endurance Spec! 1.8L Atkinson I4 paired with 80kW electric motor and 14 kWh battery, 2.92 cruise final drive, and low-drag 0.24 Cd aerodynamics.`;
      } else if (lower.includes("balanced") || lower.includes("sport gt")) {
        reply = `⚖️ [AI Blueprint Deployed] Loaded Balanced Sport GT Spec! 3.0L Twin-Turbo V6 (460 HP), 3.55 final drive, balanced aero, and sports suspension.`;
      } else if (lower.includes("gt3") || lower.includes("motorsport")) {
        reply = `🏎️ [AI Blueprint Deployed] Loaded Apex GT3 Spec-R Motorsport Benchmark! FIA GT3 homologated 4.0L flat-plane V8 (620 HP @ 8,500 RPM) in a lightweight dry-carbon tub chassis.`;
      } else if (lower.includes("aero") || lower.includes("drag")) {
        reply = `Apex AI Aero Analysis: Drag Coeff is ${sim.dragCoeff.toFixed(2)} Cd with ${(sim.aeroBalance * 100).toFixed(0)}% rear bias. Installing aero wheel discs will trim drag by ~0.010 Cd.`;
      } else if (lower.includes("cost") || lower.includes("budget") || lower.includes("price")) {
        reply = `Apex AI Cost Analysis: Current unit cost is $${sim.totalCost.toLocaleString()}. Switching chassis to aluminum spaceframe or reducing wheel diameter saves up to $2,400.`;
      } else if (lower.includes("knock") || lower.includes("engine") || lower.includes("power")) {
        reply = `Apex AI Powertrain Analysis: Knock Risk is ${(sim.knockRisk * 100).toFixed(0)}%. Maximum piston speed is ${sim.maxPistonSpeed.toFixed(1)} m/s. Reduce boost or increase radiator cooling capacity.`;
      } else if (lower.includes("ev") || lower.includes("battery") || lower.includes("motor")) {
        reply = `Apex AI EV Analysis: 800V SiC Inverter efficiency is operating at 98.8%. Dual axial-flux motors deliver maximum zero-RPM torque.`;
      } else {
        reply = `Apex AI Advisor: Analyzing complete vehicle telemetry package... All parameters evaluated under ${ENGINEERS[engineer].label} perspective.`;
      }

      setChatMessages((prev) => [
        ...prev,
        { sender: "ai" as const, text: reply, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
      ]);
    }, 500);
  };

  const handleApplySuggestion = (s: { id: string; apply: () => void }) => {
    s.apply();
    setAppliedSet((prev) => new Set(prev).add(s.id));
  };

  // Render sub-components
  const renderAdvisorySection = () => (
    <div className="flex flex-col gap-6">
      {/* AI Advisory Board Personas & Mode Selector */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Personas Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 flex-1">
          {(Object.keys(ENGINEERS) as EngineerId[]).map((id) => {
            const eng = ENGINEERS[id];
            const isSelected = engineer === id;

            return (
              <button
                key={id}
                onClick={() => setEngineer(id)}
                className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between gap-1.5 cursor-pointer ${
                  isSelected
                    ? `${eng.tone} shadow-lg scale-[1.02]`
                    : "bg-amber-900/35 border-amber-800/40 text-amber-200/60 hover:text-amber-50 hover:border-amber-700/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    {eng.icon}
                    <span>{eng.label}</span>
                  </div>
                  {isSelected && <Check size={14} className="text-amber-400" />}
                </div>
                <span className="text-[10px] font-mono opacity-80">{eng.focus}</span>
              </button>
            );
          })}
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-amber-950/80 p-1.5 rounded-2xl border border-amber-800/30 shrink-0 self-start md:self-auto font-mono text-xs">
          {(Object.keys(MODES) as ModeId[]).map((mId) => (
            <button
              key={mId}
              onClick={() => setMode(mId)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                mode === mId ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-amber-300/50 hover:text-amber-100/80"
              }`}
            >
              {MODES[mId].label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Diagnostics Warnings + Suggestions & Interactive Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Filterable Warnings & Actionable Suggestions */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Live Diagnostic Warnings */}
          <div className="p-5 rounded-2xl bg-amber-900/40 border border-amber-800/30 backdrop-blur-xl shadow-xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xs font-bold text-amber-50 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-400" />
                Live Diagnostic Warnings ({activeWarnings.length})
              </h3>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-amber-950/80 p-1 rounded-xl border border-amber-800/30 font-mono text-[10px]">
                {(["all", "Engine", "Chassis", "Aero", "Manufacturing"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2 py-0.5 rounded-lg font-semibold transition-all uppercase cursor-pointer ${
                      activeCategory === cat ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-amber-300/50 hover:text-amber-100/80"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {activeWarnings.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <ShieldCheck size={16} /> All vehicle parameters operating within safe engineering limits.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {activeWarnings.map((w) => (
                  <div
                    key={w.id}
                    className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                      w.severity === "critical"
                        ? "bg-rose-950/30 border-rose-500/40 text-rose-200"
                        : "bg-amber-950/20 border-amber-500/30 text-amber-200"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider opacity-75">
                        [{w.category}] {w.severity}
                      </span>
                      <p className="font-medium">{w.text}</p>
                    </div>
                    <button
                      onClick={() => setDismissed((prev) => new Set(prev).add(w.id))}
                      className="text-amber-300/50 hover:text-amber-100/80 transition-colors p-1 cursor-pointer"
                      title="Dismiss Alert"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actionable Engineering Suggestions */}
          <div className="p-5 rounded-2xl bg-amber-900/40 border border-amber-800/30 backdrop-blur-xl shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-amber-50 uppercase tracking-wider flex items-center gap-2">
              <Lightbulb size={15} className="text-amber-400" />
              Recommended Parameter Optimizations ({suggestions.length})
            </h3>

            {suggestions.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-800/30 text-amber-200/60 text-xs">
                No immediate parameter changes needed for current vehicle configuration.
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((s) => {
                  const isApplied = appliedSet.has(s.id);
                  return (
                    <div
                      key={s.id}
                      className="p-4 rounded-xl bg-amber-950/60 border border-amber-800/30 hover:border-amber-500/40 transition-all space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-amber-50 flex items-center gap-1.5">
                          <Sparkles size={13} className="text-amber-400" />
                          {s.title}
                        </h4>
                        <button
                          onClick={() => handleApplySuggestion(s)}
                          disabled={isApplied}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            isApplied
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default"
                              : "bg-amber-500 text-black hover:bg-amber-400 active:scale-95 shadow-md"
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <Check size={12} /> Applied
                            </>
                          ) : (
                            <>
                              Apply <ArrowUpRight size={12} />
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-[11px] text-amber-200/60">{s.detail}</p>

                      {/* Impact Deltas Badges */}
                      <div className="flex items-center gap-2 pt-1 font-mono text-[10px]">
                        {s.impacts.map((imp, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-md border ${
                              imp.tone === "good"
                                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                                : "bg-rose-950/30 border-rose-500/30 text-rose-300"
                            }`}
                          >
                            {imp.label}: {imp.delta}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 Cols): Interactive Apex AI Terminal Chat */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-amber-900/45 border border-amber-500/30 backdrop-blur-xl shadow-2xl flex flex-col h-[580px]">
            {/* Terminal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-amber-800/30 mb-3">
              <div className="flex items-center gap-2">
                <Bot size={16} className="text-amber-400" />
                <span className="text-xs font-bold text-amber-50 uppercase tracking-wider">Apex AI Interactive Terminal</span>
              </div>
              <span className="text-[10px] font-mono text-amber-200/60">{ENGINEERS[engineer].label} active</span>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col gap-1 ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-amber-500 text-black font-medium rounded-tr-none"
                        : "bg-amber-950/80 border border-amber-800/30 text-amber-50 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] font-mono text-amber-300/50">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Quick Prompt Presets */}
            <div className="py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none border-t border-amber-800/30 mt-2">
              <span className="text-[9px] font-mono text-amber-400 font-bold uppercase shrink-0">AI BLUEPRINTS:</span>
              {[
                { label: "⚡ 1000 HP Valkyrie", prompt: "Load the 1000 HP V12 Hybrid Valkyrie blueprint" },
                { label: "🏁 Sprint Race", prompt: "Deploy the Sprint Race Attack Spec" },
                { label: "🌪️ High Downforce", prompt: "Apply Monaco High Downforce Spec" },
                { label: "🌱 EcoStream Hybrid", prompt: "Deploy EcoStream Hybrid Endurance" },
                { label: "⚖️ Balanced Sport GT", prompt: "Deploy Balanced Sport GT configuration" },
                { label: "🏎️ GT3 Spec-R", prompt: "Load Apex GT3 Spec-R Motorsport Benchmark" },
                { label: "🔧 Auto-Fix Knock", prompt: "Fix engine knock risk" },
              ].map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(p.prompt)}
                  className="px-2 py-1 rounded-lg bg-amber-950/85 border border-amber-500/30 text-amber-200 hover:bg-amber-500/20 text-[10px] font-mono whitespace-nowrap transition-all cursor-pointer shadow-sm"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask Apex AI for vehicle optimization strategies..."
                className="flex-1 bg-amber-950/80 border border-amber-800/30 rounded-xl px-3 py-2 text-xs text-amber-50 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all font-mono"
              />
              <button
                onClick={() => handleSendMessage()}
                className="p-2 rounded-xl bg-amber-500 text-black hover:bg-amber-400 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-6 text-amber-50 select-none pb-16 animate-fade-in">
      {/* ── TOP HERO BANNER: APEX AI CHIEF ENGINEERING & MULTI-AGENT STUDIO ── */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-r from-amber-900/60/90 via-cyan-950/40 to-amber-900/60/90 border border-amber-500/30 backdrop-blur-2xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              <Bot size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-amber-50 uppercase tracking-wider">APEX AI CHIEF ENGINEERING & MULTI-AGENT STUDIO</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> ONLINE v2.4
                </span>
              </div>
              <p className="text-xs text-amber-200/60 font-mono mt-0.5">
                Complete neural advisory suite: live warnings, multi-agent console, AI assistant, telemetry & auto-tuning presets.
              </p>
            </div>
          </div>

          {/* Target Concept Philosophy Controls */}
          <div className="flex items-center gap-2 bg-amber-950/75 px-3 py-2 rounded-2xl border border-amber-500/30 font-mono">
            <span className="text-[10px] text-amber-400 flex items-center gap-1 font-bold">
              <Target size={13} /> CONCEPT:
            </span>
            {(["budget", "track", "luxury", "balanced"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCarConcept(c)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold uppercase transition-all border cursor-pointer ${
                  carConcept === c
                    ? c === "budget"
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      : c === "track"
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                      : c === "luxury"
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                      : "bg-amber-500/20 border-amber-500/40 text-amber-300"
                    : "bg-amber-900/50 border-amber-800/30 text-amber-300/50 hover:text-amber-100/80"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* ── APEX AI STUDIO SUB-NAVIGATION TABS BAR ── */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-amber-800/40 overflow-x-auto scrollbar-none">
          {[
            { id: "all" as const, label: "All-in-One Studio Suite", icon: <Layers size={14} /> },
            { id: "presets" as const, label: "AI Engineering Presets", icon: <Sparkles size={14} /> },
            { id: "dashboard" as const, label: "15-Agent Division Grid", icon: <Bot size={14} /> },
            { id: "advisory" as const, label: "Chief Advisory & Diagnostics", icon: <Wrench size={14} /> },
            { id: "agents" as const, label: "Autonomous Multi-Agent Console", icon: <Zap size={14} /> },
            { id: "assistant" as const, label: "AI Assistant Hub", icon: <Bot size={14} /> },
            { id: "logs" as const, label: "Telemetry Log & AI Stream", icon: <FileText size={14} /> },
          ].map((tab) => {
            const isActive = studioTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStudioTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500/30 to-amber-500/25 text-amber-200 border border-amber-400/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                    : "bg-amber-950/60 border border-amber-800/40 text-amber-200/60 hover:text-amber-50 hover:bg-amber-900/40"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── APEX AI ENGINEER ASSISTANT BAR WINDOW (EMBEDDED) ── */}
      <AIAssistant embedded={true} />

      {/* ── DYNAMIC SUB-TAB CONTENT DISPLAY ── */}
      {studioTab === "all" && (
        <div className="flex flex-col gap-8">
          {/* Section 0: AI Engineering Presets & Architect Templates */}
          <div className="space-y-3">
            <AIEngineeringPresets
              onSelectPresetPrompt={(prompt) => {
                setStudioTab("advisory");
                handleSendMessage(prompt);
              }}
            />
          </div>

          {/* Section 1: Chief Advisory Studio */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-amber-100/80 uppercase tracking-widest flex items-center gap-2 pt-4 border-t border-amber-800/40">
              <Wrench size={16} className="text-amber-400" /> Chief Advisory & Live Diagnostics Studio
            </h2>
            {renderAdvisorySection()}
          </div>

          {/* Section 2: Autonomous Multi-Agent Console */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-amber-100/80 uppercase tracking-widest flex items-center gap-2 pt-4 border-t border-amber-800/40">
              <Zap size={16} className="text-amber-400" /> Autonomous Multi-Agent Control Console
            </h2>
            <ApexAgentConsole
              engineConfig={design.engine}
              installedComponents={[]}
              activeComponentId={null}
              phase="idle"
              powerHp={sim.peakPower}
              weightKg={sim.weight}
              onApplyTuning={(changes) => updateEngine(changes)}
            />
          </div>

          {/* Section 3: Telemetry Log Stream */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-amber-100/80 uppercase tracking-widest flex items-center gap-2 pt-4 border-t border-amber-800/40">
              <FileText size={16} className="text-amber-400" /> Apex AI Telemetry Log & Event Stream
            </h2>
            <div className="p-4 rounded-2xl bg-amber-900/40 border border-amber-800/30 backdrop-blur-xl shadow-xl">
              <EngineeringLog />
            </div>
          </div>
        </div>
      )}

      {studioTab === "presets" && (
        <div className="w-full">
          <AIEngineeringPresets
            onSelectPresetPrompt={(prompt) => {
              setStudioTab("advisory");
              handleSendMessage(prompt);
            }}
          />
        </div>
      )}

      {studioTab === "dashboard" && (
        <AgentDashboard onApplyRecommendation={(rec) => updateEngine(rec.changes)} />
      )}

      {studioTab === "advisory" && renderAdvisorySection()}

      {studioTab === "agents" && (
        <ApexAgentConsole
          engineConfig={design.engine}
          installedComponents={[]}
          activeComponentId={null}
          phase="idle"
          powerHp={sim.peakPower}
          weightKg={sim.weight}
          onApplyTuning={(changes) => updateEngine(changes)}
        />
      )}

      {studioTab === "assistant" && <AIAssistant embedded={true} />}

      {studioTab === "logs" && (
        <div className="p-6 rounded-2xl bg-amber-900/40 border border-amber-800/30 backdrop-blur-xl shadow-xl">
          <EngineeringLog />
        </div>
      )}
    </div>
  );
}
