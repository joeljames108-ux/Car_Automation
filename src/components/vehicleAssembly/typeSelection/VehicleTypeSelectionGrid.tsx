/**
 * ============================================================================
 * VEHICLE TYPE SELECTION GRID (PHASE 1 & 2 MASTER UI)
 * ============================================================================
 * Premium automotive development platform entry screen:
 * "WHAT ARE YOU BUILDING?"
 * Displays 18 comprehensive vehicle category cards with interactive 3D
 * silhouettes, subcategory selectors, dimensional envelopes, aero class,
 * development costs, and 1-click platform adaptation.
 */

import React, { useState, useMemo } from "react";
import {
  Car,
  Layers,
  Sparkles,
  ChevronRight,
  Filter,
  DollarSign,
  Activity,
  Gauge,
  Wind,
  ShieldAlert,
  CheckCircle2,
  Cpu,
  Compass,
} from "lucide-react";
import {
  VehicleCategoryId,
  VehicleCategoryDefinition,
  getAllVehicleCategories,
} from "../../../sim/modularVehicle/vehicleTypeRegistry";
import { VehicleSilhouetteViewer3D } from "./VehicleSilhouetteViewer3D";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

interface VehicleTypeSelectionGridProps {
  selectedCategoryId: VehicleCategoryId;
  selectedSubcategory?: string;
  onSelectCategory: (categoryId: VehicleCategoryId, subcategory: string) => void;
  onClose?: () => void;
}

type GroupFilter = "all" | "road" | "suv_utility" | "sports_exotic" | "motorsport" | "electric";

export const VehicleTypeSelectionGrid: React.FC<VehicleTypeSelectionGridProps> = ({
  selectedCategoryId,
  selectedSubcategory,
  onSelectCategory,
  onClose,
}) => {
  const [activeGroup, setActiveGroup] = useState<GroupFilter>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeSubcategoryMap, setActiveSubcategoryMap] = useState<Record<string, string>>(() => {
    return {
      [selectedCategoryId]: selectedSubcategory || "",
    };
  });

  const allCategories = useMemo(() => getAllVehicleCategories(), []);

  const filteredCategories = useMemo(() => {
    return allCategories.filter((cat) => {
      const matchesGroup = activeGroup === "all" || cat.group === activeGroup;
      const matchesSearch =
        searchQuery === "" ||
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.subcategories.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesGroup && matchesSearch;
    });
  }, [allCategories, activeGroup, searchQuery]);

  const handleChoose = (cat: VehicleCategoryDefinition) => {
    playHMIClickSound();
    const sub = activeSubcategoryMap[cat.id] || cat.subcategories[0];
    onSelectCategory(cat.id, sub);
  };

  const handleSubcategorySelect = (catId: string, sub: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playHMIClickSound();
    setActiveSubcategoryMap((prev) => ({ ...prev, [catId]: sub }));
  };

  return (
    <div className="space-y-6 select-none">
      {/* =====================================================================
          HEADER SECTION (PHASE 1 SPECIFICATION)
          ===================================================================== */}
      <div className="panel p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-base-950 to-slate-900 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Studio Spotlight */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Compass size={24} className="animate-spin-slow" />
              </span>
              <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wider uppercase">
                PHASE 1 • VEHICLE PLATFORM CONFIGURATOR
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight text-white uppercase">
              WHAT ARE YOU BUILDING?
            </h1>
            <p className="text-sm sm:text-base font-mono text-slate-400 max-w-3xl mt-1.5 leading-relaxed">
              Select the vehicle category. Your platform, chassis, body architecture and available components will adapt to your choice.
            </p>
          </div>

          {/* Search bar & Categories Counter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono font-bold text-amber-400 flex items-center justify-center gap-2">
              <span>{filteredCategories.length} OF 18</span>
              <span className="text-slate-500">PLATFORMS</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1">
          {[
            { id: "all", label: "ALL PLATFORMS (18)" },
            { id: "road", label: "ROAD & SALOONS" },
            { id: "suv_utility", label: "SUVS & UTILITY 4x4" },
            { id: "sports_exotic", label: "SPORTS & EXOTICS" },
            { id: "motorsport", label: "MOTORSPORT SPEC" },
            { id: "electric", label: "ELECTRIC PLATFORMS" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playHMIClickSound();
                setActiveGroup(tab.id as GroupFilter);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-[11px] font-mono font-bold tracking-wide whitespace-nowrap transition-all border ${
                activeGroup === tab.id
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20"
                  : "bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================================
          18 VEHICLE CATEGORY CARDS (PHASE 2 SPECIFICATION)
          ===================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCategories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          const currentSub = activeSubcategoryMap[cat.id] || cat.subcategories[0];

          return (
            <div
              key={cat.id}
              onClick={() => handleChoose(cat)}
              className={`group relative rounded-3xl p-5 transition-all duration-300 flex flex-col justify-between border cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-b from-slate-900/95 via-base-950 to-slate-950 border-amber-500 shadow-2xl shadow-amber-500/15 ring-2 ring-amber-500/30"
                  : "bg-slate-950/85 hover:bg-slate-900/90 border-slate-800 hover:border-amber-500/50 shadow-lg hover:shadow-xl"
              }`}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute -top-3 right-6 z-20 flex items-center gap-1.5 bg-amber-500 text-slate-950 text-[10px] font-mono font-black px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                  <CheckCircle2 size={13} />
                  ACTIVE PLATFORM
                </div>
              )}

              <div>
                {/* 3D Interactive Silhouette Viewport */}
                <VehicleSilhouetteViewer3D
                  categoryId={cat.id}
                  accentColor={isSelected ? "#fbbf24" : "#f59e0b"}
                  isInteractive={true}
                />

                {/* Title & Group Badge */}
                <div className="flex items-start justify-between gap-2 mt-4">
                  <div>
                    <h3 className="text-lg font-black font-mono tracking-tight text-white group-hover:text-amber-400 transition-colors uppercase">
                      {cat.name}
                    </h3>
                    <p className="text-xs font-mono text-slate-400 mt-0.5 line-clamp-2">
                      {cat.tagline}
                    </p>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 uppercase whitespace-nowrap">
                    {cat.engineeringDifficulty}
                  </span>
                </div>

                {/* Subcategory Pills */}
                <div className="mt-3.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1.5">
                    Subcategory Spec:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories.map((sub) => {
                      const isSubActive = currentSub === sub;
                      return (
                        <button
                          key={sub}
                          onClick={(e) => handleSubcategorySelect(cat.id, sub, e)}
                          className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                            isSubActive
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold"
                              : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-300"
                          }`}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Technical Specifications Rail */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/80">
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">Typical Wheelbase</span>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {cat.dimensions.wheelbase.min} - {cat.dimensions.wheelbase.max} mm
                    </span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">Weight Range</span>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {cat.typicalWeightKg.min.toLocaleString()} - {cat.typicalWeightKg.max.toLocaleString()} kg
                    </span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">Drivetrain Layout</span>
                    <span className="text-xs font-mono font-bold text-slate-200 truncate block">
                      {cat.recommendedArchitecture}
                    </span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">Aerodynamics</span>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {cat.aeroClass} (Cd {cat.baseCd})
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Estimated Dev Cost</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    ${(cat.developmentCost / 1000).toFixed(0)}k USD
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChoose(cat);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                      : "bg-slate-800 text-slate-200 hover:bg-amber-500 hover:text-slate-950"
                  }`}
                >
                  <span>{isSelected ? "CONFIGURING" : "SELECT"}</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
