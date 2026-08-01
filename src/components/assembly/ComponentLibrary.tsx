import { useState } from "react";
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
} from "lucide-react";
import {
  ENGINE_ASSEMBLY_COMPONENTS,
  ComponentId,
  AssemblyPhase,
  AssemblyComponentMeta,
} from "../../sim/assemblyTypes";

interface ComponentLibraryProps {
  installedComponents: ComponentId[];
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  hoveredComponentId: ComponentId | null;
  canInstall: (id: ComponentId) => boolean;
  onStartInstall: (id: ComponentId) => void;
  onHoverComponent: (id: ComponentId | null) => void;
  className?: string;
}

type CategoryFilter = "All" | "Core" | "Bottom End" | "Top End" | "Induction & Exhaust";

export function ComponentLibrary({
  installedComponents,
  activeComponentId,
  phase,
  hoveredComponentId,
  canInstall,
  onStartInstall,
  onHoverComponent,
  className = "",
}: ComponentLibraryProps) {
  const [activeTab, setActiveTab] = useState<CategoryFilter>("All");

  const filteredComponents = ENGINE_ASSEMBLY_COMPONENTS.filter((comp) => {
    if (activeTab === "All") return true;
    return comp.category === activeTab;
  });

  const categories: CategoryFilter[] = ["All", "Core", "Bottom End", "Top End", "Induction & Exhaust"];

  return (
    <div className={`flex flex-col bg-base-900/90 border border-base-800 rounded-2xl p-4 backdrop-blur-xl shadow-2xl h-full select-none ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-base-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Wrench size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Component Tray</h3>
            <span className="text-[10px] text-slate-400 font-mono">Select parts to assemble</span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-bold">
          {installedComponents.length} / {ENGINE_ASSEMBLY_COMPONENTS.length} Installed
        </span>
      </div>

      {/* Category Tabs */}
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

      {/* Component Cards List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-base-750">
        {filteredComponents.map((comp) => {
          const isInstalled = installedComponents.includes(comp.id);
          const isActive = activeComponentId === comp.id;
          const isHovered = hoveredComponentId === comp.id;
          const isAvailable = canInstall(comp.id);

          // Get missing dependency names if locked
          const missingDeps = comp.dependencies
            .filter((depId) => !installedComponents.includes(depId))
            .map((depId) => ENGINE_ASSEMBLY_COMPONENTS.find((c) => c.id === depId)?.name)
            .filter(Boolean);

          return (
            <div
              key={comp.id}
              onMouseEnter={() => onHoverComponent(comp.id)}
              onMouseLeave={() => onHoverComponent(null)}
              className={`group relative p-3 rounded-xl border transition-all duration-200 ${
                isActive
                  ? "bg-cyan-950/40 border-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.3)] scale-[1.01]"
                  : isInstalled
                  ? "bg-emerald-950/20 border-emerald-500/30 opacity-80"
                  : isAvailable
                  ? "bg-base-850 border-base-750 hover:border-cyan-500/50 hover:bg-base-800/80 interactive-card cursor-pointer"
                  : "bg-base-900/60 border-base-800/60 opacity-60 cursor-not-allowed"
              }`}
            >
              {/* Card Top Row */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-lg border ${
                      isInstalled
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : isAvailable
                        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                        : "bg-base-800 text-slate-500 border-base-700"
                    }`}
                  >
                    <Cog size={14} className={isActive ? "animate-spin" : ""} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {comp.name}
                    </h4>
                    <span className="text-[9.5px] font-mono text-slate-400">{comp.category}</span>
                  </div>
                </div>

                {/* Status Badge */}
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

              {/* Description */}
              <p className="text-[10.5px] text-slate-400 leading-relaxed mb-2 line-clamp-2">
                {comp.description}
              </p>

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
                  <span>+{comp.statDeltas.hp} HP</span>
                </span>
                <span className="flex items-center gap-0.5 text-pink-300">
                  <Zap size={9} />
                  <span>+{comp.statDeltas.torque} Nm</span>
                </span>
                <span className="flex items-center gap-0.5 text-amber-300">
                  <DollarSign size={9} />
                  <span>+${comp.statDeltas.cost}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
