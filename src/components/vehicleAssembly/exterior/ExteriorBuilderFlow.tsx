// ===================================================================
// EXTERIOR VEHICLE BUILDER FLOW (PROGRESSIVE 6-STAGE WORKSTATION)
// ===================================================================
// Progressive assembly workflow managing component installation order,
// category accordions, material variant swaps, and workshop integration.
// ===================================================================

import React, { useState } from "react";
import {
  Wrench,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Plus,
  Sparkles,
  Layers,
} from "lucide-react";
import { useExteriorAssemblyStore } from "../../../state/useExteriorAssemblyStore";
import { useExteriorCategoryProgress } from "../../../state/exteriorAssemblyHooks";
import { ExteriorComponentCard } from "./ExteriorComponentCard";
import { ExteriorWorkshopPanel } from "./ExteriorWorkshopPanel";
import type { ExteriorComponentId } from "../../../sim/exteriorAssemblyTypes";
import type { MaterialGrade } from "../../../sim/assemblyTypes";

export const ExteriorBuilderFlow: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Structure & Chassis": true,
    "Suspension & Running Gear": true,
    "Body Closures & Shell": true,
    "Aerodynamics & Bumpers": true,
    "Glazing & Lighting": true,
    "Trim & Final Assembly": true,
  });

  const installedComponents = useExteriorAssemblyStore((s) => s.installedComponents);
  const activeComponentId = useExteriorAssemblyStore((s) => s.activeComponentId);
  const selectedComponentId = useExteriorAssemblyStore((s) => s.selectedComponentId);
  const selectedVariants = useExteriorAssemblyStore((s) => s.selectedVariants);

  const startInstall = useExteriorAssemblyStore((s) => s.startInstall);
  const selectComponent = useExteriorAssemblyStore((s) => s.selectComponent);
  const replaceVariant = useExteriorAssemblyStore((s) => s.replaceVariant);
  const installAllComponents = useExteriorAssemblyStore((s) => s.installAllComponents);
  const isComponentInstallable = useExteriorAssemblyStore((s) => s.isComponentInstallable);

  const categoryProgress = useExteriorCategoryProgress();

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="space-y-4">
      {/* ── TOP WORKSHOP PANEL: PAINT BOOTH & AERO LAB ── */}
      <ExteriorWorkshopPanel />

      {/* ── BULK ACTIONS & STAGE PROGRESS ── */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-white/10">
        <div className="flex items-center gap-2">
          <Wrench size={16} className="text-cyan-400" />
          <span className="text-xs font-mono font-bold text-slate-200 uppercase">
            PROGRESSIVE EXTERIOR ASSEMBLY STAGES
          </span>
        </div>
        <button
          onClick={installAllComponents}
          className="px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
        >
          <Sparkles size={13} />
          <span>INSTALL ALL (ROBOTIC FAST TRACK)</span>
        </button>
      </div>

      {/* ── 6 PROGRESSIVE ASSEMBLY CATEGORIES ── */}
      <div className="space-y-3">
        {categoryProgress.map((cat) => {
          const isExpanded = expandedCategories[cat.category] ?? true;

          return (
            <div
              key={cat.category}
              className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md overflow-hidden transition-all"
            >
              {/* Category Accordion Header */}
              <button
                onClick={() => toggleCategory(cat.category)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                      cat.isComplete
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                    }`}
                  >
                    {cat.isComplete ? "✓" : isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold font-mono text-slate-100 uppercase tracking-wide">
                      {cat.category}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      {cat.installed} / {cat.total} Subsystems Installed ({cat.percentage}%)
                    </span>
                  </div>
                </div>

                {/* Mini Category Progress Bar */}
                <div className="w-20 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </button>

              {/* Component Cards Grid */}
              {isExpanded && (
                <div className="p-3 pt-0 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {cat.components.map((comp) => (
                    <ExteriorComponentCard
                      key={comp.id}
                      component={comp}
                      isInstalled={installedComponents.includes(comp.id)}
                      isActive={activeComponentId === comp.id}
                      isSelected={selectedComponentId === comp.id}
                      selectedGrade={selectedVariants[comp.id] || "forged"}
                      isInstallable={isComponentInstallable(comp.id)}
                      onInstall={() => startInstall(comp.id)}
                      onSelect={() => selectComponent(comp.id)}
                      onGradeChange={(grade) => replaceVariant(comp.id, grade)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
