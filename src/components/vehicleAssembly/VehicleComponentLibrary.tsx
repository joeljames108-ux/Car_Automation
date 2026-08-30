import React, { useState, useMemo } from "react";
import {
  Lock,
  Check,
  AlertCircle,
  Sparkles,
  Layers,
  Wrench,
  Car,
} from "lucide-react";
import {
  VehicleComponentId,
  VehicleAssemblyComponentMeta,
  getVehicleAssemblyComponents,
} from "../../sim/vehicleAssemblyTypes";
import { AssemblyPhase, MaterialGrade } from "../../sim/assemblyTypes";
import { StatDeltaBadges } from "../assembly/assemblyUIHelpers";
import { VehicleConfig } from "../../sim/types";

interface VehicleComponentLibraryProps {
  installedComponents: VehicleComponentId[];
  activeComponentId: VehicleComponentId | null;
  phase: AssemblyPhase;
  hoveredComponentId: VehicleComponentId | null;
  canInstall: (id: VehicleComponentId) => boolean;
  onStartInstall: (id: VehicleComponentId) => void;
  onHoverComponent: (id: VehicleComponentId | null) => void;
  selectedVariants?: Record<string, MaterialGrade>;
  onSelectVariant?: (id: VehicleComponentId, variant: MaterialGrade) => void;
  vehicleConfig?: Partial<VehicleConfig>;
  className?: string;
}

type CategoryFilter = "All" | "Structure" | "Powertrain" | "Suspension & Handling" | "Exterior & Aero" | "Electronics";

export const VehicleComponentLibrary: React.FC<VehicleComponentLibraryProps> = ({
  installedComponents,
  activeComponentId,
  phase,
  hoveredComponentId,
  canInstall,
  onStartInstall,
  onHoverComponent,
  selectedVariants: propsSelectedVariants,
  onSelectVariant,
  vehicleConfig,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<CategoryFilter>("All");
  const [localSelectedVariants, setLocalSelectedVariants] = useState<Record<string, MaterialGrade>>({
    chassis_frame: "forged",
    engine_bay: "cast",
    transmission: "forged",
    exhaust_system: "forged",
    suspension_front: "forged",
    suspension_rear: "forged",
    brakes: "forged",
    wheels_tires: "forged",
    aero_package: "forged",
    electronics_ecu: "billet",
  });

  const selectedVariants = propsSelectedVariants || localSelectedVariants;

  const handleVariantSelect = (id: VehicleComponentId, variant: MaterialGrade) => {
    if (onSelectVariant) {
      onSelectVariant(id, variant);
    } else {
      setLocalSelectedVariants((prev) => ({ ...prev, [id]: variant }));
    }
  };

  const components = useMemo(() => getVehicleAssemblyComponents(vehicleConfig), [vehicleConfig]);

  const filteredComponents = useMemo(() => {
    if (activeTab === "All") return components;
    return components.filter((c) => c.category === activeTab);
  }, [components, activeTab]);

  const categories: CategoryFilter[] = [
    "All",
    "Structure",
    "Powertrain",
    "Suspension & Handling",
    "Exterior & Aero",
    "Electronics",
  ];

  return (
    <div className={`flex flex-col h-full bg-white/80 dark:bg-base-900/90 border border-slate-200 dark:border-amber-800/30 rounded-3xl p-4 backdrop-blur-xl shadow-xl ${className}`}>
      {/* Header & Category Filters */}
      <div className="mb-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <Car size={14} /> VEHICLE SUBSYSTEM CATALOG
          </span>
          <span className="text-[10px] font-mono text-amber-400 dark:text-amber-200/60 bg-slate-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-md border border-slate-200 dark:border-amber-800/30 font-bold">
            {installedComponents.length} / {components.length} Installed
          </span>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold whitespace-nowrap transition-all ${
                activeTab === cat
                  ? "bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                  : "bg-slate-100 dark:bg-amber-900/40 text-amber-400 dark:text-amber-200/60 hover:text-slate-900 dark:hover:text-amber-50 border border-slate-200 dark:border-amber-800/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Component Cards List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredComponents.map((comp) => {
          const isInstalled = installedComponents.includes(comp.id);
          const isActive = activeComponentId === comp.id;
          const isAvailable = canInstall(comp.id);
          const isHovered = hoveredComponentId === comp.id;

          const currentVariantId = selectedVariants[comp.id] || "cast";
          const variantObj = comp.variants.find((v) => v.id === currentVariantId) || comp.variants[0];

          // Compute un-met dependency names
          const missingDeps = comp.dependencies
            .filter((depId) => !installedComponents.includes(depId))
            .map((depId) => components.find((c) => c.id === depId)?.name || depId);

          return (
            <div
              key={comp.id}
              onMouseEnter={() => onHoverComponent(comp.id)}
              onMouseLeave={() => onHoverComponent(null)}
              className={`p-3.5 rounded-2xl border transition-all duration-300 ${
                isInstalled
                  ? "bg-emerald-950/20 border-emerald-500/40 opacity-90"
                  : isActive
                  ? "bg-amber-950/40 border-amber-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] animate-pulse"
                  : isAvailable
                  ? isHovered
                    ? "bg-amber-900/40 border-amber-500/60 shadow-lg"
                    : "bg-amber-900/40 border-amber-800/30 hover:border-amber-700/30"
                  : "bg-amber-950/40 border-amber-900/30 opacity-60"
              }`}
            >
              {/* Card Header: Title & Action Button */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wide font-extrabold block">
                    {comp.category}
                  </span>
                  <h4 className="text-xs font-bold text-amber-50 tracking-tight">{comp.name}</h4>
                </div>

                {/* Install / Completed Status Badge */}
                {isInstalled ? (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold shrink-0">
                    <Check size={11} /> INSTALLED
                  </span>
                ) : (
                  <button
                    disabled={!isAvailable || isActive || phase !== "idle"}
                    onClick={() => onStartInstall(comp.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-mono font-bold transition-all shrink-0 ${
                      isActive
                        ? "bg-amber-500 text-slate-950 animate-pulse"
                        : isAvailable
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 shadow-md"
                        : "bg-amber-900/50 text-amber-300/50 border border-amber-800/30 cursor-not-allowed"
                    }`}
                  >
                    {!isAvailable ? <Lock size={10} /> : <Wrench size={10} />}
                    <span>{isActive ? "INSTALLING..." : isAvailable ? "INSTALL" : "LOCKED"}</span>
                  </button>
                )}
              </div>

              {/* Description */}
              <p className="text-[10px] text-amber-200/60 leading-normal mb-2.5 line-clamp-2">
                {comp.description}
              </p>

              {/* Dependency Warning */}
              {!isAvailable && !isInstalled && missingDeps.length > 0 && (
                <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[9.5px] font-mono mb-2.5">
                  <AlertCircle size={11} className="shrink-0 text-amber-400" />
                  <span className="truncate">Requires: {missingDeps.join(", ")}</span>
                </div>
              )}

              {/* Tier / Material Variant Selector */}
              {comp.variants.length > 0 && (
                <div className="mb-2.5">
                  <span className="text-[9px] font-mono text-amber-200/60 uppercase font-bold block mb-1 flex items-center gap-1">
                    <Layers size={9} /> Material Grade Tier:
                  </span>
                  <div className="grid grid-cols-2 gap-1">
                    {comp.variants.map((variant) => (
                      <button
                        key={variant.id}
                        disabled={isInstalled || isActive}
                        onClick={() => handleVariantSelect(comp.id, variant.id)}
                        className={`p-1.5 rounded-lg border text-[9px] font-mono text-left truncate transition-all ${
                          currentVariantId === variant.id
                            ? "bg-amber-500/20 border-amber-400 text-amber-300 font-bold"
                            : "bg-amber-900/40 border-amber-800/30 text-amber-200/60 hover:text-amber-50"
                        }`}
                      >
                        {variant.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Shared Stat Impact Badges Grid */}
              <StatDeltaBadges meta={comp as any} variant={variantObj} size="sm" className="pt-1.5 border-t border-amber-800/30" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
