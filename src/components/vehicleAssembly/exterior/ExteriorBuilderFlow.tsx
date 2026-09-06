// ===================================================================
// EXTERIOR VEHICLE BUILDER FLOW (PROGRESSIVE WORKSTATION)
// ===================================================================
// Supports dual grouping workflows:
// 1. Anatomical Vehicle Sections:
//    - Front Section
//    - Greenhouse & Roof (Cabin Upper)
//    - Sides & Passenger Doors
//    - Rear Section
//    - Underbody & Wheel Wells
// 2. Manufacturing Stages (6-stage structural assembly)
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
  Car,
  Shield,
  Box,
  Sliders,
} from "lucide-react";
import { useExteriorAssemblyStore } from "../../../state/useExteriorAssemblyStore";
import {
  useExteriorCategoryProgress,
  useExteriorAnatomicalZoneProgress,
} from "../../../state/exteriorAssemblyHooks";
import { useVehicleArchitectureStore } from "../../../state/useVehicleArchitectureStore";
import { ExteriorComponentCard } from "./ExteriorComponentCard";
import { ExteriorWorkshopPanel } from "./ExteriorWorkshopPanel";
import type { ExteriorComponentId, ExteriorAnatomicalZone } from "../../../sim/exteriorAssemblyTypes";
import type { MaterialGrade } from "../../../sim/assemblyTypes";
import { ShieldCheck } from "lucide-react";

export const ExteriorBuilderFlow: React.FC = () => {
  const architecture = useVehicleArchitectureStore((s) => s.architecture);

  const [groupingMode, setGroupingMode] = useState<"anatomical" | "manufacturing">("anatomical");
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<ExteriorAnatomicalZone | "all">("all");

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Structure & Chassis": true,
    "Suspension & Running Gear": true,
    "Body Closures & Shell": true,
    "Aerodynamics & Bumpers": true,
    "Glazing & Lighting": true,
    "Trim & Final Assembly": true,
  });

  const [expandedZones, setExpandedZones] = useState<Record<string, boolean>>({
    front_section: true,
    greenhouse_roof: true,
    sides_doors: true,
    rear_section: true,
    underbody_wheel_wells: true,
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
  const anatomicalProgress = useExteriorAnatomicalZoneProgress();

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleZone = (zoneId: string) => {
    setExpandedZones((prev) => ({ ...prev, [zoneId]: !prev[zoneId] }));
  };

  const filteredAnatomicalZones =
    selectedZoneFilter === "all"
      ? anatomicalProgress
      : anatomicalProgress.filter((z) => z.zone.id === selectedZoneFilter);

  return (
    <div className="space-y-4">
      {/* ── ACTIVE VEHICLE ARCHITECTURE BANNER ── */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900/90 to-slate-950 border border-amber-500/40 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <ShieldCheck size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-extrabold text-white uppercase">
                {architecture.name}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                {architecture.metadata.platformType}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Chassis: {architecture.metadata.chassisVersion} · Framework: {architecture.metadata.bodyFrameworkVersion} (Hardpoints Locked)
            </span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <span>WB: <strong className="text-slate-200">{architecture.wheelbaseMm}mm</strong></span>
          <span>HEIGHT: <strong className="text-slate-200">{architecture.overallHeightMm}mm</strong></span>
        </div>
      </div>

      {/* ── TOP WORKSHOP PANEL: PAINT BOOTH & AERO LAB ── */}
      <ExteriorWorkshopPanel />

      {/* ── WORKSPACE MODE TOGGLE & FAST TRACK ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-900/80 border border-white/10">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setGroupingMode("anatomical")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              groupingMode === "anatomical"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Car size={13} />
            <span>ANATOMICAL SECTIONS</span>
          </button>
          <button
            onClick={() => setGroupingMode("manufacturing")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              groupingMode === "manufacturing"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Wrench size={13} />
            <span>MANUFACTURING STAGES</span>
          </button>
        </div>

        <button
          onClick={installAllComponents}
          className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold transition-all flex items-center gap-1.5 ml-auto"
        >
          <Sparkles size={13} />
          <span>INSTALL ALL (ROBOTIC FAST TRACK)</span>
        </button>
      </div>

      {/* ── ANATOMICAL SECTIONS FILTER PILLS ── */}
      {groupingMode === "anatomical" && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-slate-950/60 border border-white/5">
          <button
            onClick={() => setSelectedZoneFilter("all")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
              selectedZoneFilter === "all"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Zones
          </button>
          {anatomicalProgress.map((item) => {
            const isSelected = selectedZoneFilter === item.zone.id;
            return (
              <button
                key={item.zone.id}
                onClick={() => setSelectedZoneFilter(item.zone.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 ${
                  isSelected
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>{item.zone.shortLabel}</span>
                <span className="text-[9px] opacity-70">
                  ({item.installed}/{item.total})
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── 1. ANATOMICAL VIEW MODE ── */}
      {groupingMode === "anatomical" ? (
        <div className="space-y-3">
          {filteredAnatomicalZones.map((z) => {
            const isExpanded = expandedZones[z.zone.id] ?? true;

            return (
              <div
                key={z.zone.id}
                className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md overflow-hidden transition-all"
              >
                {/* Zone Accordion Header */}
                <button
                  onClick={() => toggleZone(z.zone.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                        z.isComplete
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      }`}
                    >
                      {z.isComplete ? "✓" : isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-extrabold font-mono text-slate-100 uppercase tracking-wide">
                          {z.zone.name}
                        </h3>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-amber-400 border border-white/10">
                          {z.installed}/{z.total} Subsystems
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 line-clamp-1 mt-0.5">
                        {z.zone.description}
                      </span>
                    </div>
                  </div>

                  {/* Mini Progress Bar */}
                  <div className="w-20 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${z.percentage}%` }}
                    />
                  </div>
                </button>

                {/* Component Cards Grid */}
                {isExpanded && (
                  <div className="p-3 pt-0 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {z.components.map((comp) => (
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
      ) : (
        /* ── 2. MANUFACTURING STAGES VIEW MODE ── */
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
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
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
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
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
      )}
    </div>
  );
};
