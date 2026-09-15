// ============================================================================
// ARCHITECTURE & ERA PICKER (24 × 7 EXTERIOR BODY MATRIX)
// ============================================================================
// Stage 0 vehicle library selector displaying 24 Body Architectures × 7 Eras (168 cells).
// Features:
// - Hover architecture card -> reveals 7-era flyout with reference vehicle & DNA preview
// - Clicking an era commits (architecture, era) and unlocks Design Studio
// - Clicking architecture title alone does NOT enter the studio
// - No default selection: Design Studio unlocks only after both are chosen
// - "BUILD ANOTHER" clears the selection
// - UI Copy: "24 body architectures × 7 eras = 168 exterior starting points"
// - Legal: "Inspiration only — original body architecture"
// ============================================================================

import React, { useState, useMemo, useRef } from "react";
import {
  Sparkles,
  Box,
  Search,
  Check,
  ChevronRight,
  ArrowRight,
  Layers,
  Car,
  Filter,
  Eye,
  Calendar,
  Grid,
  Table,
  Info,
  Sliders,
  ShieldCheck,
  Wrench,
  RotateCcw,
  Compass,
  Cpu,
  Lock,
  Unlock,
} from "lucide-react";
import {
  BodyArchitectureId,
  VehicleEraId,
  BodyArchitectureCell,
  ArchitectureDefinition,
  EraDefinition,
  ARCHITECTURES,
  ERAS,
  BODY_ARCHITECTURE_MATRIX,
  getCell,
  getErasForArchitecture,
  getBodyGlbUrl,
} from "../../../sim/bodyArchitectureMatrix";
import { useVehicleArchitectureStore } from "../../../state/useVehicleArchitectureStore";
import { useModularVehicleBuilderStore } from "../../../state/modularVehicleBuilderStore";
import { playHMIClickSound, playHMITabSound } from "../../../utils/hmiSoundSynth";

export interface ArchitectureEraPickerProps {
  onSelectArchitectureEra?: (arch: BodyArchitectureId, era: VehicleEraId) => void;
  onProceedToStudio?: () => void;
  onInspectGlb?: () => void;
}

type GroupFilter = "all" | "passenger" | "performance" | "utility" | "commercial" | "motorsport";

export const ArchitectureEraPicker: React.FC<ArchitectureEraPickerProps> = ({
  onSelectArchitectureEra,
  onProceedToStudio,
  onInspectGlb,
}) => {
  // Store bindings
  const selectedArchitecture = useVehicleArchitectureStore((s) => s.selectedArchitecture);
  const selectedEra = useVehicleArchitectureStore((s) => s.selectedEra);
  const selectedBodyCell = useVehicleArchitectureStore((s) => s.selectedBodyCell);
  const isDesignStudioUnlocked = useVehicleArchitectureStore((s) => s.isDesignStudioUnlocked);
  const selectArchitectureEra = useVehicleArchitectureStore((s) => s.selectArchitectureEra);
  const clearArchitectureSelection = useVehicleArchitectureStore((s) => s.clearArchitectureSelection);

  const setSelectedModel = useModularVehicleBuilderStore((s) => s.setSelectedModel);
  const setSelectedEra = useModularVehicleBuilderStore((s) => s.setSelectedEra);
  const setSelectedModelAndEra = useModularVehicleBuilderStore((s) => s.setSelectedModelAndEra);
  const setCurrentStage = useModularVehicleBuilderStore((s) => s.setCurrentStage);

  // UI state
  const [activeGroup, setActiveGroup] = useState<GroupFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "matrix">("cards");
  const [hoveredArchId, setHoveredArchId] = useState<BodyArchitectureId | null>(null);
  const [previewCell, setPreviewCell] = useState<BodyArchitectureCell | null>(null);

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter architectures
  const filteredArchitectures = useMemo(() => {
    return ARCHITECTURES.filter((arch) => {
      if (activeGroup !== "all" && arch.group !== activeGroup) {
        return false;
      }
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchesArch =
        arch.label.toLowerCase().includes(q) ||
        arch.tagline.toLowerCase().includes(q) ||
        arch.description.toLowerCase().includes(q);

      if (matchesArch) return true;

      // Check if any reference vehicle or DNA in its 7 eras matches search
      const row = BODY_ARCHITECTURE_MATRIX[arch.id];
      if (row) {
        for (const era of ERAS) {
          const cell = row[era.id];
          if (
            cell &&
            (cell.referenceVehicle.toLowerCase().includes(q) ||
              cell.designDNA.proportions.toLowerCase().includes(q) ||
              cell.designDNA.silhouette.toLowerCase().includes(q) ||
              cell.designDNA.engineering.toLowerCase().includes(q))
          ) {
            return true;
          }
        }
      }
      return false;
    });
  }, [activeGroup, searchQuery]);

  // Handle selecting an architecture + era cell
  const handleCommitCell = (arch: BodyArchitectureId, era: VehicleEraId) => {
    playHMIClickSound();
    selectArchitectureEra(arch, era);
    setSelectedModelAndEra(arch, era);

    if (onSelectArchitectureEra) {
      onSelectArchitectureEra(arch, era);
    }
  };

  const handleClearSelection = () => {
    playHMITabSound();
    clearArchitectureSelection();
  };

  const handleProceedToDesignStudio = () => {
    if (!selectedArchitecture || !selectedEra) return;
    playHMITabSound();
    if (onProceedToStudio) {
      onProceedToStudio();
    } else {
      setCurrentStage("chassis");
    }
  };

  const handleInspectCompleteGlb = () => {
    if (!selectedArchitecture || !selectedEra) return;
    playHMITabSound();
    if (onInspectGlb) {
      onInspectGlb();
    } else {
      setCurrentStage("complete");
    }
  };

  return (
    <div className="space-y-6 font-mono select-none">
      {/* =====================================================================
          1. HEADER & LEGAL DISCLAIMER
          ===================================================================== */}
      <div className="panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Layers size={13} className="text-cyan-400" />
                EXTERIOR BODY ARCHITECTURE LIBRARY
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-400" />
                Inspiration only — original body architecture
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-400" />
                Zero-Offset CAD Snapping
              </span>
            </div>
          </div>

          {/* Action / Selection Status Card */}
          <div className="w-full lg:w-auto shrink-0 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl flex flex-col gap-3 min-w-[280px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                {isDesignStudioUnlocked ? (
                  <Unlock size={12} className="text-emerald-400" />
                ) : (
                  <Lock size={12} className="text-amber-400" />
                )}
                DESIGN STUDIO STATUS
              </span>
              {isDesignStudioUnlocked && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="text-[10px] text-slate-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Clear architecture and era selection"
                >
                  <RotateCcw size={10} />
                  <span>CLEAR</span>
                </button>
              )}
            </div>

            {isDesignStudioUnlocked && selectedArchitecture && selectedEra ? (
              <div>
                <div className="text-sm font-black text-slate-100 uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {ARCHITECTURES.find((a) => a.id === selectedArchitecture)?.label} · {selectedEra}
                </div>
                <div className="text-[11px] text-amber-300 font-bold mt-0.5 truncate max-w-[260px]">
                  Ref: {selectedBodyCell?.referenceVehicle || "Custom CAD"}
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 italic">
                No architecture & era selected yet. Hover a card & click an era below.
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleProceedToDesignStudio}
                disabled={!isDesignStudioUnlocked}
                className={`w-full px-4 py-2.5 rounded-xl font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isDesignStudioUnlocked
                    ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 shadow-lg shadow-emerald-500/30"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750"
                }`}
              >
                <span>ENTER STUDIO</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters & View Mode Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Group Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
            {(
              [
                { id: "all", label: "ALL (24)" },
                { id: "passenger", label: "PASSENGER" },
                { id: "performance", label: "PERFORMANCE" },
                { id: "utility", label: "UTILITY" },
                { id: "commercial", label: "COMMERCIAL" },
                { id: "motorsport", label: "MOTORSPORT" },
              ] as const
            ).map((grp) => (
              <button
                key={grp.id}
                type="button"
                onClick={() => {
                  playHMIClickSound();
                  setActiveGroup(grp.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer shrink-0 ${
                  activeGroup === grp.id
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm"
                    : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700"
                }`}
              >
                {grp.label}
              </button>
            ))}
          </div>

          {/* Search & View Mode Toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="relative flex-1 md:w-64">
              <Search size={13} className="absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search architecture, era, reference..."
                className="w-full bg-slate-900/90 border border-slate-750 focus:border-cyan-500/70 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200 text-xs"
                >
                  ×
                </button>
              )}
            </div>

            <div className="flex items-center rounded-xl bg-slate-900/80 border border-slate-800 p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  playHMIClickSound();
                  setViewMode("cards");
                }}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === "cards" ? "bg-slate-800 text-cyan-300" : "text-slate-400 hover:text-slate-200"
                }`}
                title="Cards & Flyout View"
              >
                <Grid size={15} />
              </button>
              <button
                type="button"
                onClick={() => {
                  playHMIClickSound();
                  setViewMode("matrix");
                }}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === "matrix" ? "bg-slate-800 text-cyan-300" : "text-slate-400 hover:text-slate-200"
                }`}
                title="Full 24x7 Matrix Grid"
              >
                <Table size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. VIEW MODE A: CARDS WITH HOVER ERA FLYOUT
          ===================================================================== */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative">
          {filteredArchitectures.map((arch) => {
            const isCardSelected = selectedArchitecture === arch.id;
            const isCardHovered = hoveredArchId === arch.id;
            const erasForArch = getErasForArchitecture(arch.id);

            return (
              <div
                key={arch.id}
                className="relative group"
                onMouseEnter={() => {
                  if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                  setHoveredArchId(arch.id);
                  const activeEraCell = getCell(arch.id, selectedEra || "2020s");
                  if (activeEraCell) setPreviewCell(activeEraCell);
                }}
                onMouseLeave={() => {
                  hoverTimeoutRef.current = setTimeout(() => {
                    setHoveredArchId((curr) => (curr === arch.id ? null : curr));
                  }, 220);
                }}
              >
                {/* Architecture Card */}
                <div
                  className={`panel p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between h-48 relative overflow-hidden cursor-default ${
                    isCardSelected
                      ? "border-cyan-500/80 bg-slate-900/95 shadow-[0_0_25px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/60"
                      : isCardHovered
                      ? "border-slate-600 bg-slate-900/90 shadow-xl"
                      : "border-slate-800/80 bg-slate-950/70 hover:border-slate-700"
                  }`}
                >
                  <div>
                    {/* Top Group & Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {arch.group}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                        7 ERAS
                      </span>
                    </div>

                    {/* Architecture Title */}
                    <h3 className="text-lg font-black text-slate-100 uppercase tracking-wide mt-1.5 flex items-center gap-2">
                      <span>{arch.label}</span>
                      {isCardSelected && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
                      )}
                    </h3>

                    {/* Tagline */}
                    <p className="text-[11px] text-amber-300 font-bold mt-1 line-clamp-1">
                      {arch.tagline}
                    </p>

                    {/* Description */}
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {arch.description}
                    </p>
                  </div>

                  {/* Bottom Hover Hint */}
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 flex items-center gap-1 group-hover:text-cyan-300 transition-colors">
                      <Calendar size={11} /> Hover to select era
                    </span>
                    <span className="text-slate-400 flex items-center gap-0.5 group-hover:text-slate-200">
                      <span>70s → Fut</span>
                      <ChevronRight size={12} />
                    </span>
                  </div>
                </div>

                {/* =================================================================
                    HOVER ERA FLYOUT (POPOVER)
                    ================================================================= */}
                {isCardHovered && (
                  <div
                    className="absolute z-50 left-0 right-0 top-full mt-2 bg-slate-950/95 border-2 border-cyan-500/70 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.85)] p-3.5 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseEnter={() => {
                      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                      setHoveredArchId(arch.id);
                    }}
                    onMouseLeave={() => {
                      setHoveredArchId(null);
                    }}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-cyan-400" />
                        <span className="text-xs font-black text-slate-100 uppercase">
                          {arch.label} · CHOOSE ERA
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">CLICK ROW TO LOAD</span>
                    </div>

                    {/* 7 Eras List */}
                    <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                      {erasForArch.map((cell) => {
                        const eraDef = ERAS.find((e) => e.id === cell.era);
                        const isThisSelected =
                          selectedArchitecture === arch.id && selectedEra === cell.era;

                        return (
                          <button
                            key={cell.era}
                            type="button"
                            onClick={() => handleCommitCell(arch.id, cell.era)}
                            onMouseEnter={() => setPreviewCell(cell)}
                            className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                              isThisSelected
                                ? "bg-cyan-950/70 border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400"
                                : "bg-slate-900/80 border-slate-800/80 hover:bg-slate-850 hover:border-cyan-500/50 hover:shadow-md"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-100 font-mono">
                                  {cell.era}
                                </span>
                                <span className="text-[10px] px-2 py-0.2 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/60">
                                  {eraDef?.badge || cell.era}
                                </span>
                              </div>
                              <div className="text-[11px] font-bold text-amber-300 mt-0.5 truncate">
                                {cell.referenceVehicle}
                              </div>
                              <div className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">
                                {cell.designDNA.proportions}
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-1.5 pt-1">
                              {isThisSelected ? (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold flex items-center gap-1">
                                  <Check size={10} /> ACTIVE
                                </span>
                              ) : (
                                <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                                  LOAD <ChevronRight size={11} />
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* =====================================================================
          3. VIEW MODE B: FULL 24 × 7 MATRIX TABLE
          ===================================================================== */}
      {viewMode === "matrix" && (
        <div className="panel p-5 rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-3 sticky left-0 bg-slate-950 z-10 w-44">ARCHITECTURE</th>
                {ERAS.map((era) => (
                  <th key={era.id} className="p-3 font-mono">
                    <div>{era.label}</div>
                    <div className="text-[9px] text-slate-500 font-normal">{era.badge}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredArchitectures.map((arch) => (
                <tr key={arch.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3 sticky left-0 bg-slate-950/95 z-10">
                    <div className="font-bold text-slate-100 uppercase">{arch.label}</div>
                    <div className="text-[9px] text-slate-400">{arch.group}</div>
                  </td>
                  {ERAS.map((era) => {
                    const cell = getCell(arch.id, era.id);
                    const isSelected =
                      selectedArchitecture === arch.id && selectedEra === era.id;

                    return (
                      <td key={era.id} className="p-2">
                        {cell ? (
                          <button
                            type="button"
                            onClick={() => handleCommitCell(arch.id, era.id)}
                            className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                                : "bg-slate-900/60 border-slate-800/70 hover:border-cyan-500/60 hover:bg-slate-850 text-slate-300"
                            }`}
                          >
                            <div className="text-[10px] font-bold truncate max-w-[130px] text-amber-300">
                              {cell.referenceVehicle}
                            </div>
                            <div className="text-[8px] text-slate-500 truncate max-w-[130px]">
                              {cell.designDNA.proportions.split(",")[0]}
                            </div>
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[10px]">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* =====================================================================
          4. DESIGN DNA INSPECTION DRAWER (WHEN A CELL IS SELECTED OR PREVIEWED)
          ===================================================================== */}
      {selectedBodyCell && (
        <div className="panel p-6 rounded-3xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/20 via-slate-900 to-slate-950 shadow-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase">
                  ACTIVE PLATFORM SELECTION
                </span>
                <span className="text-xs text-amber-300 font-bold">
                  Reference: {selectedBodyCell.referenceVehicle} (Inspiration Only)
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-100 uppercase mt-1">
                {selectedBodyCell.architecture.toUpperCase()} · {selectedBodyCell.era.toUpperCase()}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleProceedToDesignStudio}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer"
              >
                <span>PROCEED TO DESIGN STUDIO</span>
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={handleInspectCompleteGlb}
                className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <Eye size={14} />
                <span>INSPECT GLB</span>
              </button>
              <button
                type="button"
                onClick={handleClearSelection}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <RotateCcw size={12} />
                <span>BUILD ANOTHER</span>
              </button>
            </div>
          </div>

          {/* 8 Pillars of Design DNA */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "PROPORTIONS", value: selectedBodyCell.designDNA.proportions },
              { label: "SILHOUETTE", value: selectedBodyCell.designDNA.silhouette },
              { label: "GREENHOUSE", value: selectedBodyCell.designDNA.greenhouse },
              { label: "HOOD & CABIN", value: selectedBodyCell.designDNA.hoodCabin },
              { label: "SURFACING", value: selectedBodyCell.designDNA.surfacing },
              { label: "AERODYNAMICS", value: selectedBodyCell.designDNA.aeroPhilosophy },
              { label: "WHEELS & STANCE", value: selectedBodyCell.designDNA.wheels },
              { label: "ENGINEERING", value: selectedBodyCell.designDNA.engineering },
            ].map((dna) => (
              <div
                key={dna.label}
                className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-1"
              >
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                  {dna.label}
                </div>
                <div className="text-xs text-slate-200 leading-relaxed">{dna.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
