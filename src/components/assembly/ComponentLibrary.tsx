import { useState, useMemo } from "react";
import {
  Lock,
  Check,
  Zap,
  TrendingUp,
  DollarSign,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Cog,
  Wrench,
  Layers,
} from "lucide-react";
import {
  ComponentId,
  AssemblyComponentMeta,
  AssemblyPhase,
  MaterialGrade,
  getAssemblyComponents,
} from "../../sim/assemblyTypes";
import { EngineConfig } from "../../sim/types";

interface ComponentLibraryProps {
  installedComponents: ComponentId[];
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  hoveredComponentId: ComponentId | null;
  canInstall: (id: ComponentId) => boolean;
  onStartInstall: (id: ComponentId) => void;
  onHoverComponent: (id: ComponentId | null) => void;
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

type CategoryFilter = "All" | "Core" | "Bottom End" | "Top End" | "Induction & Exhaust";

export function ComponentLibrary({
  installedComponents,
  activeComponentId,
  phase,
  hoveredComponentId,
  canInstall,
  onStartInstall,
  onHoverComponent,
  engineConfig,
  className = "",
}: ComponentLibraryProps) {
  const [activeTab, setActiveTab] = useState<CategoryFilter>("All");
  const [selectedVariants, setSelectedVariants] = useState<Record<ComponentId, MaterialGrade>>({
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
  });

  const assemblyComponents = useMemo(() => getAssemblyComponents(engineConfig), [engineConfig]);

  const isEV =
    engineConfig?.layout === "electric" ||
    engineConfig?.layout === "hybrid" ||
    (engineConfig as any)?.isElectric ||
    (engineConfig as any)?.powertrainType === "electric";

  const filteredComponents = useMemo(() => {
    return assemblyComponents.filter((comp) => {
      if (activeTab === "All") return true;
      return comp.category === activeTab;
    });
  }, [assemblyComponents, activeTab]);

  const categories: CategoryFilter[] = ["All", "Core", "Bottom End", "Top End", "Induction & Exhaust"];

  const handleVariantChange = (compKey: ComponentId, variant: MaterialGrade) => {
    setSelectedVariants((prev) => ({ ...prev, [compKey]: variant }));
  };

  const getCategoryBorder = (category: string) => {
    switch (category) {
      case "Core": return "border-l-4 border-l-cyan-400";
      case "Bottom End": return "border-l-4 border-l-pink-400";
      case "Top End": return "border-l-4 border-l-emerald-400";
      case "Induction & Exhaust": return "border-l-4 border-l-amber-400";
      default: return "border-l-4 border-l-cyan-400";
    }
  };

  return (
    <div className={`flex flex-col bg-base-900/90 border border-base-800 rounded-2xl p-4 backdrop-blur-xl shadow-2xl h-full select-none ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-base-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Wrench size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              {isEV ? "EV Powertrain Tray" : "Component Tray"}
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              {isEV ? "Select high-voltage EV components" : "Select parts & materials"}
            </span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-bold">
          {installedComponents.length} / {assemblyComponents.length} Installed
        </span>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all whitespace-nowrap ${
              activeTab === cat
                ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-base-800/60 border border-transparent"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3D Component Cards List */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-base-750">
        {filteredComponents.map((comp) => {
          const isInstalled = installedComponents.includes(comp.id);
          const isActive = activeComponentId === comp.id;
          const isAvailable = canInstall(comp.id);
          const currentVariant = selectedVariants[comp.id] || "cast";

          // Calculate stat delta multipliers based on chosen material variant
          const variantObj = comp.variants.find((v) => v.id === currentVariant) || comp.variants[0];
          const calculatedHp = Math.round(comp.statDeltas.hp * (variantObj ? variantObj.hpMultiplier : 1));
          const calculatedCost = Math.round(comp.statDeltas.cost * (variantObj ? variantObj.costMultiplier : 1));

          // Get missing dependency names if locked
          const missingDeps = comp.dependencies
            .filter((depId) => !installedComponents.includes(depId))
            .map((depId) => assemblyComponents.find((c) => c.id === depId)?.name)
            .filter(Boolean);

          return (
            <div
              key={comp.id}
              onMouseEnter={() => onHoverComponent(comp.id)}
              onMouseLeave={() => onHoverComponent(null)}
              className={`group relative p-3 rounded-xl border transition-all duration-200 assembly-card-3d ${getCategoryBorder(comp.category)} ${
                isActive
                  ? "bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] scale-[1.01]"
                  : isInstalled
                  ? "bg-emerald-950/20 border-emerald-500/30 opacity-85"
                  : isAvailable
                  ? "bg-base-850 border-base-750 hover:border-cyan-500/50 hover:bg-base-800/80 cursor-pointer"
                  : "bg-base-900/60 border-base-800/60 opacity-60 cursor-not-allowed"
              }`}
            >
              {/* Card Top Row */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-lg border overflow-hidden flex items-center justify-center p-0.5 relative ${
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
                        className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <Cog size={14} className={isActive ? "animate-spin" : ""} />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {comp.name}
                    </h4>
                    <span className="text-[9.5px] font-mono text-slate-400">{comp.category}</span>
                  </div>
                </div>

                {/* Status / Install Button */}
                <div>
                  {isInstalled ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9.5px] font-mono font-bold">
                      <Check size={10} /> Installed
                    </span>
                  ) : isActive ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9.5px] font-mono font-bold animate-pulse">
                      <Sparkles size={10} /> {phase.toUpperCase()}
                    </span>
                  ) : !isAvailable ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[9.5px] font-mono">
                      <Lock size={10} /> Locked
                    </span>
                  ) : (
                    <button
                      onClick={() => onStartInstall(comp.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500 hover:text-black border border-cyan-500/40 text-[10px] font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      Install <ArrowRight size={10} />
                    </button>
                  )}
                </div>
              </div>

              {/* Material Grade Selector Buttons */}
              {!isInstalled && (
                <div className="flex items-center gap-1 mb-2 overflow-x-auto scrollbar-none">
                  <span className="text-[9px] font-mono text-slate-400 flex items-center gap-0.5 pr-1">
                    <Layers size={9} /> Material:
                  </span>
                  {comp.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVariantChange(comp.id, v.id);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-all ${
                        currentVariant === v.id
                          ? "bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 font-bold"
                          : "bg-base-800 text-slate-400 border border-base-750 hover:bg-base-750"
                      }`}
                    >
                      {v.id.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}

              {/* Locked Dependency Warning */}
              {!isAvailable && !isInstalled && missingDeps.length > 0 && (
                <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[9.5px] font-mono mb-2">
                  <AlertCircle size={11} className="shrink-0 text-amber-400" />
                  <span className="truncate">Requires: {missingDeps.join(", ")}</span>
                </div>
              )}

              {/* Stat Impact Badges Grid */}
              <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-white/5 text-[9.5px] font-mono">
                <span className="flex items-center gap-0.5 text-cyan-300">
                  <TrendingUp size={9} />
                  <span>+{calculatedHp} HP</span>
                </span>
                <span className="flex items-center gap-0.5 text-pink-300">
                  <Zap size={9} />
                  <span>+{comp.statDeltas.torque} Nm</span>
                </span>
                <span className="flex items-center gap-0.5 text-amber-300">
                  <DollarSign size={9} />
                  <span>+${calculatedCost}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
