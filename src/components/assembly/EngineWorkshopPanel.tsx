import { useState, useMemo, useEffect } from "react";
import {
  Wrench,
  Sparkles,
  CheckCircle2,
  Circle,
  Play,
  RotateCcw,
  Eye,
  Check,
  Zap,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  Layers,
  Clock,
  Lock,
  ArrowRight,
  AlertCircle,
  Cog,
  Activity,
  Award,
} from "lucide-react";
import {
  ComponentId,
  AssemblyComponentMeta,
  AssemblyPhase,
  MaterialGrade,
  getAssemblyComponents,
} from "../../sim/assemblyTypes";
import { StatDeltaBadges, TorqueClearanceReadout } from "./assemblyUIHelpers";
import { EngineConfig } from "../../sim/types";
import { AnimatedCounter } from "../ui/AnimatedCounter";

interface EngineWorkshopPanelProps {
  installedComponents: ComponentId[];
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  hoveredComponentId: ComponentId | null;
  canInstall: (id: ComponentId) => boolean;
  onStartInstall: (id: ComponentId) => void;
  onHoverComponent: (id: ComponentId | null) => void;
  progressPercentage: number;
  currentStats: {
    hp: number;
    torque: number;
    weight: number;
    reliability: number;
    cost: number;
  };
  isExplodedView: boolean;
  nextRecommendedComponent: AssemblyComponentMeta | null;
  isAssemblyComplete: boolean;
  onResetAssembly: () => void;
  onToggleExplodedView: () => void;
  selectedVariants?: Record<string, MaterialGrade>;
  onSelectVariant?: (id: ComponentId, variant: MaterialGrade) => void;
  onShowCompletionModal?: () => void;
  engineConfig?: Partial<EngineConfig>;
  className?: string;
}

const COMPONENT_PNG_MAP: Record<string, string> = {
  block: "/assets/engine/block.png",
  crankshaft: "/assets/engine/crankshaft.png",
  rods: "/assets/engine/piston_rod.png",
  pistons: "/assets/engine/piston_rod.png",
  cylinder_head: "/assets/engine/cylinder_head.png",
  intake_manifold: "/assets/engine/intake_manifold.png",
  exhaust_headers: "/assets/engine/exhaust_headers.png",
  turbocharger: "/assets/engine/turbocharger.png",
  oil_pan: "/assets/engine/oil_pan.png",
};

type CategoryFilter = "All" | "Core" | "Bottom End" | "Top End" | "Induction & Exhaust" | "Hybrid & Electric";
type ViewTab = "parts" | "timeline";

export function EngineWorkshopPanel({
  installedComponents,
  activeComponentId,
  phase,
  hoveredComponentId,
  canInstall,
  onStartInstall,
  onHoverComponent,
  progressPercentage,
  currentStats,
  isExplodedView,
  nextRecommendedComponent,
  isAssemblyComplete,
  onResetAssembly,
  onToggleExplodedView,
  selectedVariants: propsSelectedVariants,
  onSelectVariant,
  onShowCompletionModal,
  engineConfig,
  className = "",
}: EngineWorkshopPanelProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [viewTab, setViewTab] = useState<ViewTab>("parts");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [localSelectedVariants, setLocalSelectedVariants] = useState<Record<string, MaterialGrade>>({
    block: "cast",
    crankshaft: "forged",
    pistons: "forged",
    rods: "forged",
    camshaft: "forged",
    head_gasket: "forged",
    cylinder_head: "billet",
    valves: "titanium",
    intake_manifold: "billet",
    exhaust_headers: "forged",
    turbocharger: "titanium",
    oil_pan: "cast",
    hybrid_motor: "forged",
    inverter_ecu: "billet",
  });

  const selectedVariants = propsSelectedVariants || localSelectedVariants;

  // Timer counter for elapsed assembly time
  useEffect(() => {
    if (installedComponents.length === 0 || isAssemblyComplete) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [installedComponents.length, isAssemblyComplete]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  const assemblyComponents = useMemo(() => getAssemblyComponents(engineConfig), [engineConfig]);

  const isEV =
    engineConfig?.layout === "electric" ||
    (engineConfig as any)?.powertrainType === "electric";

  const filteredComponents = useMemo(() => {
    return assemblyComponents.filter((comp) => {
      if (activeCategory === "All") return true;
      return comp.category === activeCategory;
    });
  }, [assemblyComponents, activeCategory]);

  const categories: CategoryFilter[] = [
    "All",
    "Core",
    "Bottom End",
    "Top End",
    "Induction & Exhaust",
    "Hybrid & Electric",
  ];

  const handleVariantChange = (compKey: ComponentId, variant: MaterialGrade) => {
    setLocalSelectedVariants((prev) => ({ ...prev, [compKey]: variant }));
    onSelectVariant?.(compKey, variant);
  };

  const getCategoryBorder = (category: string) => {
    switch (category) {
      case "Core":
        return "border-l-4 border-l-cyan-400";
      case "Bottom End":
        return "border-l-4 border-l-pink-400";
      case "Top End":
        return "border-l-4 border-l-emerald-400";
      case "Induction & Exhaust":
        return "border-l-4 border-l-amber-400";
      case "Hybrid & Electric":
        return "border-l-4 border-l-purple-400";
      default:
        return "border-l-4 border-l-cyan-400";
    }
  };

  const qualityScore = Math.min(
    100,
    Math.round(75 + (installedComponents.length / 12) * 20 + (currentStats.reliability > 100 ? 5 : 0))
  );

  return (
    <div
      className={`flex flex-col bg-base-900/95 border border-base-750/80 rounded-2xl p-3.5 backdrop-blur-2xl shadow-2xl h-full select-none ${className}`}
    >
      {/* Top Header with Live Progress & Quick Actions */}
      <div className="pb-3 border-b border-base-800 shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(34,211,238,0.25)]">
              <Wrench size={16} />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                {isEV ? "⚡ EV Powertrain Tray" : "🤖 Robotic Assembly Tray"}
              </h3>
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Clock size={10} className="text-cyan-400" />
                Time: {formatTime(elapsedSeconds)} · {installedComponents.length} / {assemblyComponents.length} Installed
              </span>
            </div>
          </div>

          {/* View Tab Switcher (Parts Tray vs Build Timeline) */}
          <div className="flex items-center gap-1 bg-base-950/80 p-1 rounded-xl border border-base-800">
            <button
              onClick={() => setViewTab("parts")}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                viewTab === "parts"
                  ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Parts
            </button>
            <button
              onClick={() => setViewTab("timeline")}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                viewTab === "timeline"
                  ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Timeline
            </button>
          </div>
        </div>

        {/* Progress Bar & Quick Stats Strip */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-cyan-300 font-bold">
              <Sparkles size={11} className={progressPercentage > 0 && !isAssemblyComplete ? "animate-spin" : ""} />
              Assembly Progress: {progressPercentage}%
            </span>
            <span>{isAssemblyComplete ? "Factory Complete" : `${assemblyComponents.length - installedComponents.length} pending`}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-base-950 border border-base-800 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 transition-all duration-500 shadow-[0_0_12px_rgba(34,211,238,0.6)]"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Cumulative Live Stat Badges */}
        <div className="grid grid-cols-4 gap-1.5 pt-0.5">
          <div className="bg-base-950/80 border border-base-800/80 rounded-xl p-1.5 text-center">
            <span className="text-[9px] font-mono text-slate-400 block truncate">Power</span>
            <div className="text-xs font-mono font-bold text-cyan-300">
              <AnimatedCounter value={currentStats.hp} suffix="hp" />
            </div>
          </div>
          <div className="bg-base-950/80 border border-base-800/80 rounded-xl p-1.5 text-center">
            <span className="text-[9px] font-mono text-slate-400 block truncate">Torque</span>
            <div className="text-xs font-mono font-bold text-pink-300">
              <AnimatedCounter value={currentStats.torque} suffix="Nm" />
            </div>
          </div>
          <div className="bg-base-950/80 border border-base-800/80 rounded-xl p-1.5 text-center">
            <span className="text-[9px] font-mono text-slate-400 block truncate">Durability</span>
            <div className="text-xs font-mono font-bold text-emerald-300">
              <AnimatedCounter value={currentStats.reliability} suffix="%" />
            </div>
          </div>
          <div className="bg-base-950/80 border border-base-800/80 rounded-xl p-1.5 text-center">
            <span className="text-[9px] font-mono text-slate-400 block truncate">Cost</span>
            <div className="text-xs font-mono font-bold text-amber-300">
              <AnimatedCounter value={currentStats.cost} prefix="$" />
            </div>
          </div>
        </div>

        {/* Next Recommended / Completion Action Strip */}
        {isAssemblyComplete ? (
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/50 via-teal-950/40 to-base-950 border border-emerald-500/40 flex items-center justify-between shadow-lg animate-scale-reveal">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400">
                <Check size={14} />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-300 block">Assembly 100% Complete!</span>
                <span className="text-[9.5px] font-mono text-slate-300">Quality Score: {qualityScore}%</span>
              </div>
            </div>
            {onShowCompletionModal && (
              <button
                onClick={onShowCompletionModal}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-mono font-bold hover:bg-emerald-400 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Award size={12} /> View Engine
              </button>
            )}
          </div>
        ) : nextRecommendedComponent ? (
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-sky-950/30 to-base-950 border border-cyan-500/30 flex items-center justify-between shadow-md">
            <div>
              <span className="text-[8.5px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
                NEXT RECOMMENDED STEP
              </span>
              <span className="text-xs font-bold text-slate-100">{nextRecommendedComponent.name}</span>
            </div>
            <button
              onClick={() => onStartInstall(nextRecommendedComponent.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 text-black text-xs font-mono font-bold hover:from-cyan-300 hover:to-sky-300 transition-all shadow-[0_0_12px_rgba(34,211,238,0.4)] active:scale-95 cursor-pointer"
            >
              <Play size={12} /> Auto Step
            </button>
          </div>
        ) : null}
      </div>

      {/* Main Body: Parts Tray OR Timeline View */}
      {viewTab === "parts" ? (
        <div className="flex-1 min-h-0 flex flex-col pt-2.5">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-2 scrollbar-none shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === cat
                    ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-base-800/60 border border-transparent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Component Cards List */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-base-750">
            {filteredComponents.map((comp) => {
              const isInstalled = installedComponents.includes(comp.id);
              const isActive = activeComponentId === comp.id;
              const isAvailable = canInstall(comp.id);
              const currentVariant = selectedVariants[comp.id] || "cast";

              const variantObj = comp.variants.find((v) => v.id === currentVariant) || comp.variants[0];

              const missingDeps = comp.dependencies
                .filter((depId) => !installedComponents.includes(depId))
                .map((depId) => assemblyComponents.find((c) => c.id === depId)?.name)
                .filter(Boolean);

              return (
                <div
                  key={comp.id}
                  onMouseEnter={() => onHoverComponent(comp.id)}
                  onMouseLeave={() => onHoverComponent(null)}
                  className={`group relative p-2.5 rounded-xl border transition-all duration-200 ${getCategoryBorder(
                    comp.category
                  )} ${
                    isActive
                      ? "bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] scale-[1.01]"
                      : isInstalled
                      ? "bg-emerald-950/20 border-emerald-500/30 opacity-90"
                      : isAvailable
                      ? "bg-base-850/80 border-base-750 hover:border-cyan-500/50 hover:bg-base-800/90 cursor-pointer"
                      : "bg-base-900/60 border-base-800/60 opacity-60 cursor-not-allowed"
                  }`}
                >
                  {/* Card Top Row */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg border overflow-hidden flex items-center justify-center p-0.5 relative shrink-0 ${
                          isInstalled
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : isAvailable
                            ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                            : "bg-base-800 text-slate-500 border-base-700"
                        }`}
                      >
                        {COMPONENT_PNG_MAP[comp.id] ? (
                          <img
                            src={COMPONENT_PNG_MAP[comp.id]}
                            alt={comp.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <Cog size={13} className={isActive ? "animate-spin" : ""} />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                          {comp.name}
                        </h4>
                        <span className="text-[9px] font-mono text-slate-400">{comp.category}</span>
                      </div>
                    </div>

                    {/* Status Badge / Install Button */}
                    <div>
                      {isInstalled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold">
                          <Check size={9} /> Installed
                        </span>
                      ) : isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono font-bold animate-pulse">
                          <Sparkles size={9} /> {phase.toUpperCase()}
                        </span>
                      ) : !isAvailable ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[9px] font-mono">
                          <Lock size={9} /> Locked
                        </span>
                      ) : (
                        <button
                          onClick={() => onStartInstall(comp.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500 hover:text-black border border-cyan-500/40 text-[9.5px] font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          Install <ArrowRight size={9} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Material Grade / Variant Picker */}
                  {!isInstalled && (
                    <div className="mb-2 space-y-1">
                      <span className="text-[8.5px] font-mono text-slate-400 flex items-center gap-0.5">
                        <Layers size={8.5} /> Material Grade & Spec:
                      </span>
                      <div className="grid grid-cols-2 gap-1">
                        {comp.variants.map((v) => (
                          <button
                            key={v.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVariantChange(comp.id, v.id);
                            }}
                            className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono text-left truncate transition-all cursor-pointer ${
                              currentVariant === v.id
                                ? "bg-cyan-500/25 text-cyan-200 border border-cyan-500/50 font-bold shadow-sm"
                                : "bg-base-800 text-slate-400 border border-base-750 hover:bg-base-750 hover:text-slate-200"
                            }`}
                            title={v.label}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Dependencies Alert */}
                  {!isAvailable && !isInstalled && missingDeps.length > 0 && (
                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[9px] font-mono mb-2">
                      <AlertCircle size={10} className="shrink-0 text-amber-400" />
                      <span className="truncate">Requires: {missingDeps.join(", ")}</span>
                    </div>
                  )}

                  {/* Stat Impact Badges */}
                  <StatDeltaBadges meta={comp} variant={variantObj} size="sm" className="pt-1 border-t border-white/5" />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Timeline View Mode */
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 pt-2.5 mb-2 scrollbar-thin scrollbar-thumb-base-750">
          <div className="relative pl-3 space-y-2 border-l border-base-750 ml-1.5">
            {assemblyComponents.map((comp) => {
              const isDone = installedComponents.includes(comp.id);
              const isCurrent = activeComponentId === comp.id;

              return (
                <div
                  key={comp.id}
                  className={`relative flex items-center justify-between p-2 rounded-lg text-xs font-mono transition-all ${
                    isDone
                      ? "bg-emerald-950/20 text-emerald-300 border border-emerald-500/20"
                      : isCurrent
                      ? "bg-cyan-950/40 text-cyan-200 border border-cyan-400/50 animate-pulse"
                      : "bg-base-850/50 text-slate-400 border border-base-800"
                  }`}
                >
                  <div
                    className={`absolute -left-[19px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border ${
                      isDone
                        ? "bg-emerald-400 border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                        : isCurrent
                        ? "bg-cyan-400 border-cyan-300 animate-ping"
                        : "bg-base-800 border-base-700"
                    }`}
                  />

                  <div className="flex items-center gap-2 truncate">
                    {isDone ? (
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <Play size={13} className="text-cyan-400 shrink-0" />
                    ) : (
                      <Circle size={13} className="text-slate-600 shrink-0" />
                    )}
                    <span className="truncate">{comp.name}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 uppercase shrink-0">{comp.category}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Actions: Exploded View Toggle + Reset Assembly */}
      <div className="pt-2.5 border-t border-base-800 flex items-center justify-between gap-2 shrink-0">
        <button
          onClick={onToggleExplodedView}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[10.5px] font-mono font-bold transition-all border cursor-pointer ${
            isExplodedView
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm"
              : "bg-base-800 text-slate-300 border-base-750 hover:bg-base-750"
          }`}
        >
          <Eye size={12} /> {isExplodedView ? "Exploded 3D" : "Condensed 3D"}
        </button>

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-1.5 rounded-xl bg-base-800 text-rose-400 border border-base-750 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Reset Assembly"
          >
            <RotateCcw size={14} />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onResetAssembly();
                setShowResetConfirm(false);
                setElapsedSeconds(0);
              }}
              className="px-2 py-1 rounded-lg bg-rose-500 text-white text-[10px] font-mono font-bold hover:bg-rose-600 transition-all cursor-pointer"
            >
              Reset All
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-2 py-1 rounded-lg bg-base-800 text-slate-400 text-[10px] font-mono hover:bg-base-750 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
