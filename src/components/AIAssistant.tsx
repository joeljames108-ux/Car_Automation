import { useMemo, useState, useEffect } from "react";
import {
  Bot, AlertTriangle, Lightbulb, TrendingUp, X, Check, Info,
  Wrench, Trophy, DollarSign, Leaf, Cpu, Zap, RotateCcw, Target,
} from "lucide-react";
import { useDesign } from "../state/DesignContext";

type Severity = "critical" | "warning" | "info";
type EngineerId = "chief" | "race" | "production" | "sustainability" | "technology";
type ModeId = "beginner" | "intermediate" | "expert";

interface Warning {
  id: string;
  category: "Engine" | "Chassis" | "Aero" | "Manufacturing";
  severity: Severity;
  text: string;
}

interface Suggestion {
  id: string;
  title: string;
  detail: string;
  impacts: { label: string; delta: string; tone: "good" | "bad" | "neutral" }[];
  apply: () => void;
}

const ENGINEERS: Record<EngineerId, { label: string; icon: React.ReactNode; focus: string; tone: string }> = {
  chief:          { label: "Chief Engineer",        icon: <Wrench size={14} />,    focus: "Technical",       tone: "text-accent-300" },
  race:           { label: "Race Engineer",         icon: <Trophy size={14} />,    focus: "Performance",     tone: "text-orange-300" },
  production:     { label: "Production Manager",    icon: <DollarSign size={14} />,focus: "Cost",            tone: "text-emerald-300" },
  sustainability: { label: "Sustainability Expert", icon: <Leaf size={14} />,      focus: "Environmental",   tone: "text-green-300" },
  technology:     { label: "Technology Expert",     icon: <Cpu size={14} />,       focus: "Infotainment/AI", tone: "text-sky-300" },
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

export function AIAssistant() {
  const { design, sim, carConcept, setCarConcept, updateEngine, updateVehicle, updateAero, updateAeroResearch, updateExterior, updateInterior } = useDesign();
  const [open, setOpen] = useState(true);
  const [engineer, setEngineer] = useState<EngineerId>("chief");
  const [mode, setMode] = useState<ModeId>("intermediate");
  const [activeSuggIdx, setActiveSuggIdx] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [reaction, setReaction] = useState<string | null>(null);
  const [lastReactionKey, setLastReactionKey] = useState("");

  const e = design.engine;
  const v = design.vehicle;
  const a = v.aero;
  const ar = v.aeroResearch;

  // --- Live warnings derived from sim thresholds ---
  const warnings: Warning[] = useMemo(() => {
    const w: Warning[] = [];
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
    // --- Concept-specific Warnings ---
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
    if (carConcept === "luxury" && sim.luxuryScore < 0.7) {
      w.push({ id: "concept_luxury_comfort", category: "Manufacturing", severity: "critical", text: `[Luxury Target Violation] Luxury rating (${(sim.luxuryScore * 100).toFixed(0)}%) is below luxury standards.` });
    }

    return w;
  }, [sim, e.turboSize, v.chassis, carConcept]);

  const activeWarnings = warnings.filter((w) => !dismissed.has(w.id));

  // --- Concrete, applyable suggestions ---
  const suggestions: Suggestion[] = useMemo(() => {
    const s: Suggestion[] = [];

    if (sim.coolingMargin < 0.5) {
      s.push({
        id: "radiator",
        title: "Increase radiator size by 15%",
        detail: "Larger radiator improves cooling capacity, reducing engine temperatures under load.",
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
      s.push({
        id: "diffuser",
        title: `Reduce diffuser angle by ${cut}°`,
        detail: "Lowering the diffuser expansion angle keeps flow attached, trading a little downforce for consistency.",
        impacts: [
          { label: "Separation risk", delta: `-${round(cut / 30 * 0.4, 2)}`, tone: "good" },
          { label: "Rear downforce", delta: "-2%", tone: "bad" },
        ],
        apply: () => updateAeroResearch({ diffuser: { ...ar.diffuser, angle: clamp(ar.diffuser.angle - cut, 0, 25) } }),
      });
    }
    if (sim.aeroBalance < 0.45) {
      s.push({
        id: "wing_aoa",
        title: "Increase rear wing angle by 2°",
        detail: "More rear wing AoA shifts aero balance rearward for stability under braking.",
        impacts: [
          { label: "Rear grip", delta: "+5%", tone: "good" },
          { label: "Top speed", delta: "-3 km/h", tone: "bad" },
        ],
        apply: () => updateAeroResearch({ rearWing: { ...ar.rearWing, angleOfAttack: clamp(ar.rearWing.angleOfAttack + 2, 0, 30) } }),
      });
    }
    if (sim.aeroBalance > 0.6 && ar.front.splitterExtension > 0) {
      s.push({
        id: "splitter",
        title: "Reduce splitter extension by 40 mm",
        detail: "Less front splitter shifts aero balance rearward, reducing front-end overload.",
        impacts: [
          { label: "Aero balance", delta: "+3% rear", tone: "good" },
          { label: "Front downforce", delta: "-4%", tone: "bad" },
        ],
        apply: () => updateAeroResearch({ front: { ...ar.front, splitterExtension: clamp(ar.front.splitterExtension - 40, 0, 300) } }),
      });
    }
    if (sim.dragCoeff > 0.4 && ar.wheel.wheelAero !== "covers") {
      s.push({
        id: "wheel_covers",
        title: "Switch to full aero wheel covers",
        detail: "Solid wheel covers reduce wheel-well turbulence, cutting drag noticeably.",
        impacts: [
          { label: "Drag", delta: "-0.010 Cd", tone: "good" },
          { label: "Brake cooling", delta: "-60%", tone: "bad" },
        ],
        apply: () => updateAeroResearch({ wheel: { ...ar.wheel, wheelAero: "covers" } }),
      });
    }
    if (sim.totalCost > 75000 && v.wheelDiameter > 18) {
      s.push({
        id: "wheel_size",
        title: "Reduce wheel diameter by 1 inch",
        detail: "Smaller wheels lower tire and rim cost with minimal performance impact.",
        impacts: [
          { label: "Cost", delta: "-$600", tone: "good" },
          { label: "Ride comfort", delta: "+5%", tone: "good" },
        ],
        apply: () => updateVehicle({ wheelDiameter: clamp(v.wheelDiameter - 1, 15, 22) }),
      });
    }
    if (sim.weight > 1700 && v.chassis === "steel_unibody") {
      s.push({
        id: "chassis",
        title: "Upgrade chassis to aluminum spaceframe",
        detail: "Aluminum spaceframe cuts significant weight vs steel unibody.",
        impacts: [
          { label: "Weight", delta: "-90 kg", tone: "good" },
          { label: "Cost", delta: "+$2,400", tone: "bad" },
        ],
        apply: () => updateVehicle({ chassis: "aluminum_spaceframe" }),
      });
    }
    if (sim.reliability < 0.65 && e.boostPressure > 1.2) {
      s.push({
        id: "boost",
        title: "Reduce turbo boost by 0.2 bar",
        detail: "Lower boost reduces thermal and mechanical stress, improving longevity.",
        impacts: [
          { label: "Reliability", delta: "+6%", tone: "good" },
          { label: "Power", delta: "-18 hp", tone: "bad" },
        ],
        apply: () => updateEngine({ boostPressure: clamp(round(e.boostPressure - 0.2, 2), 0, 4) }),
      });
    }
    if (s.length === 0) {
      s.push({
        id: "balanced",
        title: "Setup is well balanced",
        detail: "No critical issues detected. Consider higher CFD fidelity for marginal gains.",
        impacts: [{ label: "Status", delta: "Healthy", tone: "good" }],
        apply: () => updateAeroResearch({ cfd: { quality: "high" } }),
      });
    }
    return s;
  }, [sim, e, v, a, ar, updateEngine, updateVehicle, updateAeroResearch]);

  // Track active suggestion within bounds
  useEffect(() => {
    if (activeSuggIdx >= suggestions.length) setActiveSuggIdx(0);
  }, [suggestions.length, activeSuggIdx]);

  const activeSugg = suggestions[Math.min(activeSuggIdx, suggestions.length - 1)] ?? suggestions[0];

  // --- Dynamic reactions to design changes ---
  const reactionKey = `${e.turboSize}|${ar.diffuser.angle}|${v.chassis}|${v.exterior.bodyType}|${sim.dragCoeff}`;
  useEffect(() => {
    if (reactionKey === lastReactionKey) return;
    setLastReactionKey(reactionKey);
    const reactions: Record<EngineerId, string[]> = {
      chief: [
        e.turboSize > 0.7 ? "Large turbo — expect big top-end but notable lag." : "Interesting choice. Smaller turbo improves response.",
        ar.diffuser.angle > 16 ? "Aggressive diffuser angle — downforce is strong but watch separation." : "Conservative diffuser. Reliable but leaving downforce on the table.",
        v.chassis === "carbon_tub" ? "Carbon tub is the right call for a lightweight platform." : "",
      ],
      race: [
        sim.dragCoeff < 0.32 ? "Slippery aero — great for straights, but check cornering grip." : "Higher drag than ideal for a track-focused build.",
        sim.aeroBalance > 0.55 ? "Rear-biased aero favors high-speed stability." : "Neutral aero balance — responsive but less forgiving.",
        v.tireCompound === "slick" ? "Slicks are fastest but need heat. Good for qualifying." : "",
      ],
      production: [
        sim.totalCost > 80000 ? "Cost is climbing — aluminum panels could trim budget." : "Cost discipline looks good.",
        v.chassis === "carbon_tub" ? "Carbon tub is expensive to manufacture — premium positioning required." : "",
        sim.manufacturing.defectRate > 6 ? "Assembly complexity is hurting yield." : "",
      ],
      sustainability: [
        e.turboSize < 0.3 ? "Naturally aspirated layout keeps emissions predictable." : "Turbocharging can improve efficiency if tuned for lean burn.",
        sim.fuelEconomy > 10 ? "Fuel economy is heavy — consider downsizing or hybrid assist." : "Efficiency is reasonable for the performance level.",
      ],
      technology: [
        v.electronics.dataLogging ? "Telemetry logging is enabled — great for development." : "Add data logging to unlock development feedback.",
        v.interior.infotainmentSize > 12 ? "Large infotainment screen suits a tech-forward buyer." : "",
      ],
    };
    const pool = reactions[engineer].filter(Boolean);
    if (pool.length) setReaction(pool[Math.floor(Math.random() * pool.length)]);
    else setReaction(null);
    const t = setTimeout(() => setReaction(null), 7000);
    return () => clearTimeout(t);
  }, [reactionKey, engineer]);

  const sevColor = (s: Severity) =>
    s === "critical" ? "text-danger-300 bg-danger-500/10 border-danger-500/30"
    : s === "warning" ? "text-warn-300 bg-warn-500/10 border-warn-500/30"
    : "text-sky-300 bg-sky-500/10 border-sky-500/30";

  const sevDot = (s: Severity) =>
    s === "critical" ? "bg-danger-500" : s === "warning" ? "bg-warn-500" : "bg-sky-500";

  const optimize = (preset: string) => {
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

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-base-850 border border-base-700 text-slate-300 hover:border-accent-500/50 hover:text-accent-300 transition-all shadow-xl"
      >
        <Bot size={16} className="text-accent-400" />
        <span className="text-xs font-semibold">Apex AI</span>
        {activeWarnings.length > 0 && (
          <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-danger-500 text-white text-[10px] font-bold">
            {activeWarnings.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-[1600px] mx-auto px-4 pb-3 pointer-events-auto">
        <div className="rounded-2xl border border-base-700 bg-base-900/95 backdrop-blur-md shadow-2xl overflow-hidden">
          {/* Top bar: engineer + mode + collapse */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-base-800 bg-base-850/60">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent-500/20 border border-accent-500/30">
                <Bot size={15} className="text-accent-300" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200 leading-tight">Apex AI Engineer</div>
                <div className="text-[10px] text-slate-500 leading-tight">{ENGINEERS[engineer].label} · {MODES[mode].label}</div>
              </div>
            </div>

            <div className="flex-1" />

            {/* Car Concept Philosophy Selector */}
            <div className="hidden lg:flex items-center gap-1 bg-base-950 px-2 py-1 rounded-xl border border-cyan-500/30">
              <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 font-bold">
                <Target size={11} /> PHILOSOPHY:
              </span>
              {(["budget", "track", "luxury", "balanced"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCarConcept(c)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all border ${
                    carConcept === c
                      ? c === "budget"
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                        : c === "track"
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                        : c === "luxury"
                        ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                        : "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                      : "bg-base-900 border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Engineer picker */}
            <div className="flex items-center gap-0.5 bg-base-900 rounded-lg p-0.5 border border-base-800">
              {(Object.keys(ENGINEERS) as EngineerId[]).map((id) => (
                <button
                  key={id}
                  onClick={() => setEngineer(id)}
                  title={`${ENGINEERS[id].label} — ${ENGINEERS[id].focus}`}
                  className={`flex items-center justify-center w-6 h-6 rounded transition-all ${
                    engineer === id ? "bg-accent-500/20 " + ENGINEERS[id].tone : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {ENGINEERS[id].icon}
                </button>
              ))}
            </div>

            {/* Mode picker */}
            <div className="flex items-center gap-0.5 bg-base-900 rounded-lg p-0.5 border border-base-800">
              {(Object.keys(MODES) as ModeId[]).map((id) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                    mode === id ? "bg-accent-500/20 text-accent-300" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {MODES[id].label}
                </button>
              ))}
            </div>

            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300 p-1 rounded transition-colors">
              <X size={14} />
            </button>
          </div>

          {/* Body: warnings + active suggestion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-base-800">
            {/* Warnings */}
            <div className="bg-base-900 p-3 max-h-[180px] overflow-y-auto">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle size={13} className="text-warn-400" />
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Live Warnings</span>
                {activeWarnings.length > 0 && (
                  <span className="text-[10px] text-slate-600">{activeWarnings.length} active</span>
                )}
              </div>
              {activeWarnings.length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-ok-400 py-2">
                  <Check size={14} /> All systems nominal.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {activeWarnings.map((w) => (
                    <div key={w.id} className={`flex items-start gap-2 px-2 py-1.5 rounded-lg border text-xs ${sevColor(w.severity)}`}>
                      <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${sevDot(w.severity)}`} />
                      <div className="flex-1">
                        <span className="text-[10px] text-slate-500 mr-1.5">{w.category}</span>
                        <span className="text-slate-300">{w.text}</span>
                      </div>
                      <button
                        onClick={() => setDismissed((prev) => new Set(prev).add(w.id))}
                        className="text-slate-600 hover:text-slate-400 transition-colors"
                        title="Dismiss"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active suggestion */}
            <div className="bg-base-900 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb size={13} className="text-accent-400" />
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">AI Suggestion</span>
                {suggestions.length > 1 && (
                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={() => setActiveSuggIdx((i) => (i - 1 + suggestions.length) % suggestions.length)}
                      className="text-slate-600 hover:text-slate-300 text-[10px] px-1"
                    >‹</button>
                    <span className="text-[10px] text-slate-600">{Math.min(activeSuggIdx + 1, suggestions.length)}/{suggestions.length}</span>
                    <button
                      onClick={() => setActiveSuggIdx((i) => (i + 1) % suggestions.length)}
                      className="text-slate-600 hover:text-slate-300 text-[10px] px-1"
                    >›</button>
                  </div>
                )}
              </div>

              {activeSugg && (
                <div>
                  <div className="flex items-start gap-2 mb-1.5">
                    <Zap size={14} className="text-accent-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-200">{activeSugg.title}</div>
                      {mode !== "beginner" && <div className="text-[11px] text-slate-500 mt-0.5">{activeSugg.detail}</div>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-2.5 ml-6">
                    {activeSugg.impacts.map((imp) => (
                      <span
                        key={imp.label}
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          imp.tone === "good" ? "text-ok-300 bg-ok-500/10"
                          : imp.tone === "bad" ? "text-danger-300 bg-danger-500/10"
                          : "text-slate-400 bg-base-800"
                        }`}
                      >
                        <TrendingUp size={9} />
                        {imp.label}: <span className="font-semibold">{imp.delta}</span>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 ml-6">
                    <button
                      onClick={() => activeSugg.apply()}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent-500/20 border border-accent-500/40 text-accent-300 text-xs font-medium hover:bg-accent-500/30 transition-all"
                    >
                      <Check size={12} /> Apply
                    </button>
                    <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-base-800 border border-base-700 text-slate-400 text-xs hover:text-slate-200 transition-all">
                      <Info size={12} /> Explain
                    </button>
                    <button
                      onClick={() => setDismissed((prev) => new Set(prev).add(activeSugg.id))}
                      className="px-2.5 py-1 rounded-lg bg-base-800 border border-base-700 text-slate-400 text-xs hover:text-slate-200 transition-all"
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reaction ticker */}
          {reaction && (
            <div className="px-3 py-1.5 border-t border-base-800 bg-accent-500/5">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className={ENGINEERS[engineer].tone}>{ENGINEERS[engineer].icon}</span>
                <span>"{reaction}"</span>
              </div>
            </div>
          )}

          {/* Auto-optimization presets */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-t border-base-800 bg-base-850/60 overflow-x-auto">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider shrink-0 mr-1">Auto Optimize</span>
            {[
              { id: "performance", label: "Max Performance", icon: <Trophy size={11} />, color: "text-orange-300 border-orange-500/30 hover:bg-orange-500/10" },
              { id: "cost", label: "Lowest Cost", icon: <DollarSign size={11} />, color: "text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10" },
              { id: "reliability", label: "Max Reliability", icon: <Wrench size={11} />, color: "text-accent-300 border-accent-500/30 hover:bg-accent-500/10" },
              { id: "efficiency", label: "Best Efficiency", icon: <Leaf size={11} />, color: "text-green-300 border-green-500/30 hover:bg-green-500/10" },
              { id: "luxury", label: "Luxury Focus", icon: <Cpu size={11} />, color: "text-sky-300 border-sky-500/30 hover:bg-sky-500/10" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => optimize(p.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg border bg-base-900 text-[10px] font-medium transition-all whitespace-nowrap ${p.color}`}
              >
                {p.icon}
                {p.label}
              </button>
            ))}
            <button
              onClick={() => setDismissed(new Set())}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-base-700 bg-base-900 text-[10px] text-slate-400 hover:text-slate-200 transition-all whitespace-nowrap ml-auto"
            >
              <RotateCcw size={11} /> Reset alerts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
