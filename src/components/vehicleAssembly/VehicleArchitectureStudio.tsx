// ============================================================================
// VEHICLE ARCHITECTURE STUDIO — VEHICLE TAB ENTRY WORKSPACE
// ============================================================================
// Expanded 3-Layer Automotive CAD & Engineering Platform:
// - LAYER 1: 8 Foundational Platforms (Wheelbase, Track, Chassis, Powertrain)
// - LAYER 2: 38 Derived Body Types (Master Body Cage 5-Zone Morph Engine)
// - LAYER 3: 6-Branch Blender Asset Hierarchy (PLATFORM, BODY, AERO, WHEELS, GLASS, INTERIOR)
// ============================================================================

import React, { useState, useMemo } from "react";
import {
  Car,
  Layers,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Sparkles,
  Sliders,
  Ruler,
  Maximize2,
  Box,
  Truck,
  Flame,
  Info,
  FolderTree,
  Copy,
  Check,
  Split,
  Tag,
  Search,
  ChevronRight,
  Wind,
  Compass,
  Zap,
} from "lucide-react";
import {
  useVehicleArchitectureStore,
} from "../../state/useVehicleArchitectureStore";
import {
  VehicleCategory,
  VehicleArchitectureConfig,
} from "../../sim/vehicleArchitecture/vehicleArchitectureTypes";
import {
  getAllVehicleArchitectures,
  getVehicleArchitecture,
} from "../../sim/vehicleArchitecture/vehicleArchitectureRegistry";
import {
  getVehicleOutlinerHierarchy,
  validateOutlinerNodeName,
  OutlinerCollectionId,
  OUTLINER_COLLECTIONS,
} from "../../sim/vehicleArchitecture/vehicleOutlinerSchema";
import { VehicleArchitecture3DViewport } from "./VehicleArchitecture3DViewport";
import { playHMIClickSound, playHMITabSound } from "../../utils/hmiSoundSynth";
import { useDesign } from "../../state/DesignContext";
import { useExteriorAssemblyStore } from "../../state/useExteriorAssemblyStore";
import { useModularVehicleBuilderStore } from "../../state/modularVehicleBuilderStore";
import {
  PLATFORM_FAMILIES,
  BODY_TYPE_REGISTRY,
  BLENDER_ASSET_HIERARCHY,
  getAllPlatformFamilyIds,
  getAllBodyTypeIds,
  calculatePlatformHardpoints,
  getMorphDeltas,
} from "../../sim/modularVehicle/vehicleFamilyArchitecture";
import { PlatformFamilyId, VehicleBodyTypeId, BlenderBranchCategory } from "../../sim/modularVehicle/types";

interface VehicleArchitectureStudioProps {
  onEnterDesignStudio?: () => void;
  onEnterModularBuilder?: () => void;
}

export const VehicleArchitectureStudio: React.FC<VehicleArchitectureStudioProps> = ({
  onEnterDesignStudio,
  onEnterModularBuilder,
}) => {
  const { updateVehicle } = useDesign();

  const selectedCategory = useVehicleArchitectureStore((s) => s.selectedCategory);
  const architecture = useVehicleArchitectureStore((s) => s.architecture);
  const selectCategory = useVehicleArchitectureStore((s) => s.selectCategory);
  const loadEngineeringPackage = useVehicleArchitectureStore((s) => s.loadEngineeringPackage);
  const validationResult = useVehicleArchitectureStore((s) => s.validationResult);
  const isValidating = useVehicleArchitectureStore((s) => s.isValidating);
  const isPackageLoaded = useVehicleArchitectureStore((s) => s.isPackageLoaded);
  const isDesignStudioUnlocked = useVehicleArchitectureStore((s) => s.isDesignStudioUnlocked);
  const setExteriorCategory = useExteriorAssemblyStore((s) => s.setVehicleCategory);

  // Modular Builder Sync
  const setSelectedModel = useModularVehicleBuilderStore((s) => s.setSelectedModel);
  const currentStage = useModularVehicleBuilderStore((s) => s.currentStage);

  // Local state for active Platform Family and 38-Body Selection
  const [selectedFamilyId, setSelectedFamilyId] = useState<PlatformFamilyId>("unibody_passenger");
  const [selectedBodyTypeId, setSelectedBodyTypeId] = useState<VehicleBodyTypeId>("sedan");
  const [bodySearchQuery, setBodySearchQuery] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("ALL");

  // Tab state
  const [activeDetailTab, setActiveDetailTab] = useState<
    "dimensions" | "blender_hierarchy" | "morph_cage" | "envelopes" | "validation" | "outliner"
  >("dimensions");

  const [selectedBranch, setSelectedBranch] = useState<BlenderBranchCategory>("PLATFORM");
  const [selectedOutlinerCol, setSelectedOutlinerCol] = useState<OutlinerCollectionId>("01_Body_Main");
  const [testNodeQuery, setTestNodeQuery] = useState("GEO_Fender_Front.L");
  const [copiedScript, setCopiedScript] = useState(false);

  const outlinerScene = getVehicleOutlinerHierarchy(selectedCategory);
  const testValidationReport = validateOutlinerNodeName(testNodeQuery);

  const currentBodySpec = BODY_TYPE_REGISTRY[selectedBodyTypeId] || BODY_TYPE_REGISTRY["sedan"];
  const currentPlatformFam = PLATFORM_FAMILIES[selectedFamilyId] || PLATFORM_FAMILIES["unibody_passenger"];

  // Hardpoints calculated dynamically for the active 38-body selection
  const liveHardpoints = useMemo(() => {
    return calculatePlatformHardpoints(currentBodySpec.defaultDimensions);
  }, [currentBodySpec]);

  // Morph deltas calculated if derived
  const activeMorphDeltas = useMemo(() => {
    if (!currentBodySpec.morphSourceId) return null;
    return getMorphDeltas(currentBodySpec.morphSourceId, selectedBodyTypeId);
  }, [currentBodySpec, selectedBodyTypeId]);

  // Map 38 body types to 3D base category
  const mapBodyTypeToCategory = (bId: VehicleBodyTypeId): VehicleCategory => {
    if (
      bId === "suv" ||
      bId === "pickup_truck" ||
      bId === "offroad_4x4" ||
      bId === "luxury_suv" ||
      bId === "offroad_suv" ||
      bId === "performance_suv" ||
      bId === "chassis_cab" ||
      bId === "motorhome_camper"
    ) {
      return "suv";
    }
    if (
      bId === "crossover" ||
      bId === "station_wagon" ||
      bId === "shooting_brake" ||
      bId === "sport_wagon" ||
      bId === "shooting_brake_ev" ||
      bId === "liftback" ||
      bId === "minivan_mpv" ||
      bId === "cargo_van" ||
      bId === "microvan" ||
      bId === "bus_shuttle"
    ) {
      return "crossover";
    }
    if (
      bId === "hatchback" ||
      bId === "city_car" ||
      bId === "kei_compact" ||
      bId === "supermini" ||
      bId === "hot_hatch" ||
      bId === "three_wheeler" ||
      bId === "dune_buggy" ||
      bId === "beach_buggy"
    ) {
      return "hatchback";
    }
    return "sedan";
  };

  const handleBodyTypeSelect = (bId: VehicleBodyTypeId) => {
    playHMIClickSound();
    setSelectedBodyTypeId(bId);

    // Sync platform family
    const famEntry = Object.entries(PLATFORM_FAMILIES).find(([_, fam]) =>
      fam.allowedBodyTypes.includes(bId)
    );
    if (famEntry) {
      setSelectedFamilyId(famEntry[0] as PlatformFamilyId);
    }

    // Sync category for 3D Viewport & Simulation
    const cat = mapBodyTypeToCategory(bId);
    selectCategory(cat);
    setExteriorCategory(cat);
    const arch = getVehicleArchitecture(cat);
    const bodySpec = BODY_TYPE_REGISTRY[bId];

    updateVehicle({
      category: arch.id,
      architecture: arch.architectureClass,
      chassisArchId: bodySpec.typicalArchitecture,
      rideHeight: bodySpec.defaultDimensions.groundClearanceMm,
      wheelDiameter: arch.wheelDiameterInches,
    });

    // Sync to piece-by-piece Modular CAD Builder
    setSelectedModel(bId);
  };

  const handleFamilySelect = (fId: PlatformFamilyId) => {
    playHMITabSound();
    setSelectedFamilyId(fId);
    const fam = PLATFORM_FAMILIES[fId];
    if (fam && fam.allowedBodyTypes.length > 0) {
      // Pick first body type of this family if current doesn't belong
      if (!fam.allowedBodyTypes.includes(selectedBodyTypeId)) {
        handleBodyTypeSelect(fam.allowedBodyTypes[0]);
      }
    }
  };

  const handleCopyBlenderScript = () => {
    const cmd = `python scripts/blender/procedural_vehicle_family_generator.py --body ${selectedBodyTypeId} --family ${selectedFamilyId}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(cmd);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2500);
    }
  };

  const handleLoadPackage = async () => {
    playHMIClickSound();
    const success = await loadEngineeringPackage();
    if (success) {
      updateVehicle({
        category: architecture.id,
        architecture: architecture.architectureClass,
        chassisArchId: currentBodySpec.typicalArchitecture,
        rideHeight: currentBodySpec.defaultDimensions.groundClearanceMm,
        wheelDiameter: architecture.wheelDiameterInches,
      });
      setExteriorCategory(architecture.id as VehicleCategory);
      setSelectedModel(selectedBodyTypeId);
    }
  };

  const handleEnterDesignStudio = () => {
    playHMIClickSound();
    setExteriorCategory(selectedCategory);
    setSelectedModel(selectedBodyTypeId);
    updateVehicle({
      category: architecture.id,
      architecture: architecture.architectureClass,
      chassisArchId: currentBodySpec.typicalArchitecture,
      rideHeight: currentBodySpec.defaultDimensions.groundClearanceMm,
      wheelDiameter: architecture.wheelDiameterInches,
    });
    if (onEnterDesignStudio) {
      onEnterDesignStudio();
    }
  };

  // Filtered body types
  const filteredBodyTypes = useMemo(() => {
    const allIds = getAllBodyTypeIds();
    return allIds.filter((bId) => {
      const spec = BODY_TYPE_REGISTRY[bId];
      if (!spec) return false;

      // Search match
      const matchesSearch =
        bodySearchQuery === "" ||
        spec.name.toLowerCase().includes(bodySearchQuery.toLowerCase()) ||
        spec.designIdentity.toLowerCase().includes(bodySearchQuery.toLowerCase()) ||
        spec.typicalArchitecture.toLowerCase().includes(bodySearchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Category filter
      if (activeCategoryFilter === "FAMILY") {
        return currentPlatformFam.allowedBodyTypes.includes(bId);
      }
      if (activeCategoryFilter === "PASSENGER") {
        return ["sedan", "coupe", "station_wagon", "shooting_brake", "liftback", "fastback", "limousine"].includes(bId);
      }
      if (activeCategoryFilter === "PERFORMANCE") {
        return ["coupe", "supercar", "hypercar", "track_special", "roadster", "convertible", "grand_tourer", "sport_wagon", "hot_hatch"].includes(bId);
      }
      if (activeCategoryFilter === "UTILITY_OFFROAD") {
        return ["suv", "crossover", "pickup_truck", "off_road_4x4", "rally_car", "dune_buggy", "beach_buggy", "luxury_suv", "off_road_suv", "performance_suv"].includes(bId);
      }
      if (activeCategoryFilter === "COMMERCIAL") {
        return ["minivan", "cargo_van", "microvan", "cab_over_utility", "chassis_cab", "motorhome", "bus_shuttle"].includes(bId);
      }
      if (activeCategoryFilter === "COMPACT") {
        return ["hatchback", "city_car", "kei_compact", "supermini", "three_wheeler"].includes(bId);
      }

      return true;
    });
  }, [bodySearchQuery, activeCategoryFilter, currentPlatformFam]);

  return (
    <div className="w-full space-y-5 text-slate-100 font-sans animate-stage-transition-enter">
      {/* ── 1. STUDIO HEADER & 3-LAYER ARCHITECTURAL PIPELINE BANNER ── */}
      <div className="panel p-5 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-amber-400" /> STAGE 01: VEHICLE ARCHITECTURE & PLATFORM
            </span>
            <span className="text-xs font-mono text-cyan-400">· 8 Platform Families / 38 Derived Body Types</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2 font-mono">
            VEHICLE ARCHITECTURE & CAD PLATFORM STUDIO
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-0.5 font-mono">
            Construct vehicles through a true 3-Layer Automotive Hierarchy: <span className="text-amber-400 font-bold">Platform</span> → <span className="text-cyan-400 font-bold">Body Architecture</span> → <span className="text-emerald-400 font-bold">Design Kit</span>.
            Zero monolithic GLBs; each component snaps at world-coordinate hardpoints with 6-branch asset architecture.
          </p>
        </div>

        {/* Load Package & Enter Studio Primary CTAs */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleLoadPackage}
            disabled={isValidating}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border shadow-lg cursor-pointer ${
              isPackageLoaded
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30"
                : "bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400 font-extrabold"
            }`}
          >
            {isValidating ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                VALIDATING ARCHITECTURE...
              </span>
            ) : isPackageLoaded ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-400" />
                PACKAGE VERIFIED ({selectedBodyTypeId.toUpperCase()})
              </>
            ) : (
              <>
                <Wrench size={14} />
                LOAD ENGINEERING PACKAGE
              </>
            )}
          </button>

          <button
            onClick={handleEnterDesignStudio}
            disabled={!isDesignStudioUnlocked}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-extrabold transition-all border shadow-xl ${
              isDesignStudioUnlocked
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-300 hover:brightness-110 cursor-pointer shadow-amber-500/25 active:scale-95"
                : "bg-slate-800/60 text-slate-500 border-slate-700/60 cursor-not-allowed opacity-60"
            }`}
          >
            <span>ENTER DESIGN STUDIO</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* ── 2. LAYER 1: 8 FOUNDATIONAL PLATFORM ARCHITECTURES ── */}
      <div className="panel p-4 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold uppercase">
              LAYER 1 : PLATFORM
            </span>
            <span className="text-xs font-mono font-bold text-slate-200">
              8 FOUNDATIONAL CHASSIS PLATFORMS
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Selected Platform: <strong className="text-amber-400">{currentPlatformFam.name}</strong> ({currentPlatformFam.allowedBodyTypes.length} Derived Bodies)
          </span>
        </div>

        {/* 8 Platform Families Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {getAllPlatformFamilyIds().map((fId) => {
            const fam = PLATFORM_FAMILIES[fId];
            const isSelected = selectedFamilyId === fId;

            return (
              <button
                key={fId}
                onClick={() => handleFamilySelect(fId)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-gradient-to-b from-amber-500/20 to-slate-950 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/50"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                    isSelected ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"
                  }`}>
                    {fam.allowedBodyTypes.length} BODIES
                  </span>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
                </div>

                <div className="font-mono font-bold text-[11px] text-slate-100 truncate mt-1">
                  {fam.name.replace(" Platform", "")}
                </div>
                <div className="text-[9px] font-mono text-slate-500 mt-0.5 truncate uppercase">
                  {fam.chassisType} · {(fam.baselineTorsionalRigidityNmPerDeg / 1000).toFixed(0)}kNm/°
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. LAYER 2: EXPANDED 38 BODY-TYPE LIBRARY & INTERACTIVE PICKER ── */}
      <div className="panel p-4 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold uppercase">
              LAYER 2 : BODY ARCHITECTURE
            </span>
            <span className="text-xs font-mono font-bold text-slate-200">
              EXPANDED 38-BODY TYPE LIBRARY
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              ({filteredBodyTypes.length} Available)
            </span>
          </div>

          {/* Search and Category Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-2 text-slate-500" />
              <input
                type="text"
                placeholder="Search body type, identity, or architecture..."
                value={bodySearchQuery}
                onChange={(e) => setBodySearchQuery(e.target.value)}
                className="pl-7 pr-3 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 w-52 md:w-64"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
              {[
                { id: "ALL", label: "All 38" },
                { id: "FAMILY", label: "Active Platform" },
                { id: "PASSENGER", label: "Passenger & GT" },
                { id: "PERFORMANCE", label: "Performance & Aero" },
                { id: "UTILITY_OFFROAD", label: "Utility & 4×4" },
                { id: "COMMERCIAL", label: "Van & Bus" },
                { id: "COMPACT", label: "Compact" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    playHMIClickSound();
                    setActiveCategoryFilter(f.id);
                  }}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    activeCategoryFilter === f.id
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 38-Body Types Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 max-h-80 overflow-y-auto pr-1 no-scrollbar">
          {filteredBodyTypes.map((bId) => {
            const spec = BODY_TYPE_REGISTRY[bId];
            const isSelected = selectedBodyTypeId === bId;

            return (
              <div
                key={bId}
                onClick={() => handleBodyTypeSelect(bId)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between select-none ${
                  isSelected
                    ? "bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/60"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850/80 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                      isSelected ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"
                    }`}>
                      {spec.typicalArchitecture}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[9px] font-mono text-amber-400 font-bold">
                        <CheckCircle2 size={10} /> ACTIVE
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-black font-mono text-white truncate group-hover:text-amber-200">
                    {spec.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {spec.designIdentity}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-1 text-[9px] font-mono">
                  <div>
                    <span className="text-slate-500 block">WB</span>
                    <span className="font-bold text-slate-200">{spec.defaultDimensions.wheelbaseMm}mm</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">DRAG</span>
                    <span className="font-bold text-cyan-400">Cd {spec.aerodynamicBaseline.cd.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">SEATS</span>
                    <span className="font-bold text-amber-400">{spec.seatingCapacity}p</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. MAIN DUAL-COLUMN WORKSPACE: 3D CAD VIEWPORT & ENGINEERING DECKS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Photorealistic 3D Architecture Viewport (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <VehicleArchitecture3DViewport />
        </div>

        {/* Right Column: Master Platform Properties & Asset Hierarchy (5 Cols) */}
        <div className="lg:col-span-5 panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-xl space-y-4">
          {/* Sub-Tabs: Dimensions vs Blender Hierarchy vs Morph Cage vs Envelopes vs Verification vs Outliner */}
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
            {(
              [
                { id: "dimensions", label: "13 Dimensions", icon: <Ruler size={12} /> },
                { id: "blender_hierarchy", label: "6-Branch Asset Tree", icon: <Layers size={12} /> },
                { id: "morph_cage", label: "5-Zone Morph", icon: <Box size={12} /> },
                { id: "envelopes", label: "Packaging", icon: <Maximize2 size={12} /> },
                { id: "validation", label: "Verification", icon: <ShieldCheck size={12} /> },
                { id: "outliner", label: "Outliner", icon: <FolderTree size={12} /> },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  playHMIClickSound();
                  setActiveDetailTab(t.id);
                }}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeDetailTab === t.id
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* TAB 1: 13 MASTER PLATFORM CUSTOM PROPERTIES & DIMENSIONS */}
          {activeDetailTab === "dimensions" && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1">
                  <span className="text-amber-400">13 MASTER PLATFORM PROPERTIES</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 uppercase">
                    {currentBodySpec.name}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Changing wheelbase, track, and clearance physically repositions Wheel_FL/FR/RL/RR and suspension hardpoints.
                </p>
              </div>

              {/* 13 Custom Platform Properties Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 uppercase block">Wheelbase</span>
                  <strong className="text-sm text-slate-200">{currentBodySpec.defaultDimensions.wheelbaseMm} mm</strong>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Axle-to-Axle</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 uppercase block">Front Track</span>
                  <strong className="text-sm text-slate-200">{currentBodySpec.defaultDimensions.frontTrackMm} mm</strong>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Lateral Stance</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 uppercase block">Rear Track</span>
                  <strong className="text-sm text-slate-200">{currentBodySpec.defaultDimensions.rearTrackMm} mm</strong>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Rear Stance</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 uppercase block">Overall Length</span>
                  <strong className="text-sm text-slate-200">{currentBodySpec.defaultDimensions.overallLengthMm} mm</strong>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Tip to Tail</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 uppercase block">Overall Width</span>
                  <strong className="text-sm text-slate-200">{currentBodySpec.defaultDimensions.overallWidthMm} mm</strong>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Excl. Mirrors</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 uppercase block">Overall Height</span>
                  <strong className="text-sm text-slate-200">{currentBodySpec.defaultDimensions.overallHeightMm} mm</strong>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Ground to Crown</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 uppercase block">Ground Clearance</span>
                  <strong className="text-sm text-amber-400">{currentBodySpec.defaultDimensions.groundClearanceMm} mm</strong>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Chassis-to-Ground</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 uppercase block">Front Overhang</span>
                  <strong className="text-sm text-slate-200">{currentBodySpec.defaultDimensions.frontOverhangMm} mm</strong>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Axle to Nose</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 uppercase block">Rear Overhang</span>
                  <strong className="text-sm text-slate-200">{currentBodySpec.defaultDimensions.rearOverhangMm} mm</strong>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Axle to Tail</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 uppercase block">Cabin Length</span>
                  <strong className="text-sm text-cyan-300">{currentBodySpec.defaultDimensions.cabinLengthMm} mm</strong>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Passenger Bay</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 uppercase block">Cabin Height</span>
                  <strong className="text-sm text-cyan-300">{currentBodySpec.defaultDimensions.cabinHeightMm} mm</strong>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Floor to Roof</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 uppercase block">Engine Position</span>
                  <strong className="text-sm text-emerald-400 uppercase">{currentBodySpec.defaultDimensions.enginePosition}</strong>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Mounting Bay</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 col-span-2 sm:col-span-3">
                  <span className="text-[9px] text-slate-500 uppercase block">Battery Pack Length</span>
                  <strong className="text-sm text-purple-400">{currentBodySpec.defaultDimensions.batteryLengthMm} mm</strong>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Underfloor Packaging Envelope</span>
                </div>
              </div>

              {/* Dynamic Live Wheel Center Coordinates in 3D Space */}
              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5">
                <span className="text-slate-400 font-bold block text-[10px]">
                  DYNAMIC 4-CORNER WHEEL CENTER HARDPOINTS (X, Y, Z):
                </span>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-cyan-400 font-bold block">WHEEL_FL (Front Left)</span>
                    <span className="text-slate-300 font-mono">
                      X: {liveHardpoints.wheelCenters.fl[0]}mm | Y: {liveHardpoints.wheelCenters.fl[1]}mm | Z: {liveHardpoints.wheelCenters.fl[2]}mm
                    </span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-cyan-400 font-bold block">WHEEL_FR (Front Right)</span>
                    <span className="text-slate-300 font-mono">
                      X: {liveHardpoints.wheelCenters.fr[0]}mm | Y: {liveHardpoints.wheelCenters.fr[1]}mm | Z: {liveHardpoints.wheelCenters.fr[2]}mm
                    </span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-amber-400 font-bold block">WHEEL_RL (Rear Left)</span>
                    <span className="text-slate-300 font-mono">
                      X: {liveHardpoints.wheelCenters.rl[0]}mm | Y: {liveHardpoints.wheelCenters.rl[1]}mm | Z: {liveHardpoints.wheelCenters.rl[2]}mm
                    </span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-amber-400 font-bold block">WHEEL_RR (Rear Right)</span>
                    <span className="text-slate-300 font-mono">
                      X: {liveHardpoints.wheelCenters.rr[0]}mm | Y: {liveHardpoints.wheelCenters.rr[1]}mm | Z: {liveHardpoints.wheelCenters.rr[2]}mm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 6-BRANCH BLENDER ASSET HIERARCHY */}
          {activeDetailTab === "blender_hierarchy" && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-1">
                <div className="flex items-center justify-between text-cyan-300 font-bold">
                  <span>6-BRANCH BLENDER ASSET ARCHITECTURE</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/20 uppercase">
                    Zero Monolithic GLBs
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Components are split across 6 dedicated branches to allow dynamic loading and module reuse.
                </p>
              </div>

              {/* Branch Selector Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
                {(["PLATFORM", "BODY", "AERO", "WHEELS", "GLASS", "INTERIOR"] as const).map((branch) => {
                  const isSelected = selectedBranch === branch;
                  return (
                    <button
                      key={branch}
                      onClick={() => {
                        playHMIClickSound();
                        setSelectedBranch(branch);
                      }}
                      className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${
                        isSelected
                          ? "bg-amber-500 text-slate-950 shadow"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                      }`}
                    >
                      {branch}
                    </button>
                  );
                })}
              </div>

              {/* Active Branch Nodes List */}
              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] border-b border-slate-800 pb-1.5">
                  <span className="font-bold text-slate-200">
                    BRANCH: VEHICLE → {selectedBranch}
                  </span>
                  <span className="text-[9px] text-amber-400 font-mono">
                    EXPORT: {selectedBranch.toLowerCase()}_{selectedBodyTypeId}.glb
                  </span>
                </div>

                <div className="space-y-1 max-h-52 overflow-y-auto pr-1 no-scrollbar">
                  {BLENDER_ASSET_HIERARCHY[selectedBranch].map((nodeName) => (
                    <div
                      key={nodeName}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                        <span className="font-bold text-slate-200">{nodeName}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 font-mono">
                        SNAP: (0,0,0)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Body-Type Asset Kit for Active Body */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-[10px]">
                <div className="flex items-center justify-between text-slate-300 font-bold">
                  <span>SPECIALIZED BODY-KIT MODULES:</span>
                  <span className="text-amber-400 uppercase">{currentBodySpec.name}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {currentBodySpec.keyBlenderAssets.map((asset, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {asset}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MASTER BODY CAGE 5-ZONE MORPH ENGINE */}
          {activeDetailTab === "morph_cage" && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-1">
                <div className="flex items-center justify-between text-purple-300 font-bold">
                  <span>MASTER BODY CAGE 5-ZONE MORPH ENGINE</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-purple-500/20 uppercase">
                    Procedural Lattice / Shrinkwrap
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Vehicle silhouettes transform procedurally from the master sedan cage via 5 distinct zones:
                  Front, Passenger, Roof, Rear, and Underbody.
                </p>
              </div>

              {/* 5 Zones Breakdown */}
              <div className="space-y-1.5 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-amber-400">1. FRONT ZONE</span>
                    <div className="text-[9px] text-slate-400">Front clip, bumper, hood rake, front fenders</div>
                  </div>
                  <span className="text-[10px] text-slate-300">{currentBodySpec.defaultDimensions.frontOverhangMm}mm Overhang</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-cyan-400">2. PASSENGER ZONE</span>
                    <div className="text-[9px] text-slate-400">A-pillar to C-pillar, door aperture, sill reinforcement</div>
                  </div>
                  <span className="text-[10px] text-slate-300">{currentBodySpec.defaultDimensions.cabinLengthMm}mm Length</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-400">3. ROOF ZONE</span>
                    <div className="text-[9px] text-slate-400">Roof panel, crown curvature, D-pillar extension</div>
                  </div>
                  <span className="text-[10px] text-slate-300">{currentBodySpec.defaultDimensions.cabinHeightMm}mm Height</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-red-400">4. REAR ZONE</span>
                    <div className="text-[9px] text-slate-400">Trunk deck / hatch / cargo bed / aero diffuser</div>
                  </div>
                  <span className="text-[10px] text-slate-300">{currentBodySpec.defaultDimensions.rearOverhangMm}mm Overhang</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-purple-400">5. UNDERBODY ZONE</span>
                    <div className="text-[9px] text-slate-400">Ground clearance, flat floor venturis, battery tray</div>
                  </div>
                  <span className="text-[10px] text-slate-300">{currentBodySpec.defaultDimensions.groundClearanceMm}mm Clearance</span>
                </div>
              </div>

              {/* Active Morph Deltas vs Base Model */}
              {activeMorphDeltas && (
                <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-500/40 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-200 font-bold text-[11px]">
                    <span>MORPH DELTAS vs {currentBodySpec.morphSourceId?.toUpperCase()}:</span>
                    <span className="text-amber-400 uppercase text-[10px]">
                      {currentBodySpec.morphParameters?.tailgateStyle || "STANDARD"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                    <div>Roof Length Delta: <strong className="text-slate-200">{activeMorphDeltas.roofLengthDeltaMm > 0 ? "+" : ""}{activeMorphDeltas.roofLengthDeltaMm}mm</strong></div>
                    <div>Roof Height Delta: <strong className="text-slate-200">{activeMorphDeltas.roofHeightDeltaMm > 0 ? "+" : ""}{activeMorphDeltas.roofHeightDeltaMm}mm</strong></div>
                    <div>Door Length Delta: <strong className="text-cyan-300">{activeMorphDeltas.doorLengthDeltaMm > 0 ? "+" : ""}{activeMorphDeltas.doorLengthDeltaMm}mm</strong></div>
                    <div>Rear Rake Angle: <strong className="text-amber-300">{activeMorphDeltas.rearRakeAngleDeg}°</strong></div>
                    <div>Cargo Extension: <strong className="text-emerald-400">{activeMorphDeltas.cargoExtensionMm > 0 ? "+" : ""}{activeMorphDeltas.cargoExtensionMm}mm</strong></div>
                    <div>D-Pillar Added: <strong className={activeMorphDeltas.dPillarRequired ? "text-emerald-400" : "text-slate-500"}>{activeMorphDeltas.dPillarRequired ? "YES" : "NO"}</strong></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PACKAGING ENVELOPES */}
          {activeDetailTab === "envelopes" && (
            <div className="space-y-3 font-mono text-xs">
              {/* Engine Bay Envelope */}
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30">
                <div className="flex items-center justify-between text-red-300 font-bold mb-1">
                  <span>ENGINE BAY ENVELOPE</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20">
                    {Math.round((architecture.engineBayEnvelope.lengthMm * architecture.engineBayEnvelope.widthMm * architecture.engineBayEnvelope.heightMm) / 1e6)}L VOL
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <div>Length: {architecture.engineBayEnvelope.lengthMm}mm | Width: {architecture.engineBayEnvelope.widthMm}mm | Height: {architecture.engineBayEnvelope.heightMm}mm</div>
                  <div>Offset: X={architecture.engineBayEnvelope.centerOffsetMm.x}mm, Z={architecture.engineBayEnvelope.centerOffsetMm.z}mm</div>
                </div>
              </div>

              {/* Cabin Greenhouse Envelope */}
              <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30">
                <div className="flex items-center justify-between text-blue-300 font-bold mb-1">
                  <span>CABIN OCCUPANT ENVELOPE</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20">
                    {Math.round((architecture.cabinEnvelope.lengthMm * architecture.cabinEnvelope.widthMm * architecture.cabinEnvelope.heightMm) / 1e6)}L VOL
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <div>Length: {architecture.cabinEnvelope.lengthMm}mm | Width: {architecture.cabinEnvelope.widthMm}mm | Height: {architecture.cabinEnvelope.heightMm}mm</div>
                  <div>Offset: X={architecture.cabinEnvelope.centerOffsetMm.x}mm, Z={architecture.cabinEnvelope.centerOffsetMm.z}mm</div>
                </div>
              </div>

              {/* Cargo Trunk/Hatch Envelope */}
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <div className="flex items-center justify-between text-emerald-300 font-bold mb-1">
                  <span>CARGO / TRUNK ENVELOPE</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20">
                    {Math.round((architecture.cargoEnvelope.lengthMm * architecture.cargoEnvelope.widthMm * architecture.cargoEnvelope.heightMm) / 1e6)}L VOL
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <div>Length: {architecture.cargoEnvelope.lengthMm}mm | Width: {architecture.cargoEnvelope.widthMm}mm | Height: {architecture.cargoEnvelope.heightMm}mm</div>
                  <div>Closure: <strong className="text-emerald-300 uppercase">{architecture.compatibleExteriorComponents.rearClosureType.replace(/_/g, " ")}</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ASSET VERIFICATION & QUALITY GATE */}
          {activeDetailTab === "validation" && (
            <div className="space-y-3 font-mono text-xs">
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                validationResult?.isValid
                  ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-300"
                  : "bg-red-950/30 border-red-500/50 text-red-300"
              }`}>
                <div className="flex items-center gap-2">
                  {validationResult?.isValid ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span className="font-bold">
                    {validationResult?.isValid ? "QUALITY GATE: VERIFIED" : "QUALITY GATE: ISSUES DETECTED"}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-black/40">
                  {validationResult?.passedAssetsCount} / {validationResult?.checkedAssetsCount} ASSETS
                </span>
              </div>

              {/* Assets Checklist */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-[11px]">
                <div className="text-slate-400 font-bold border-b border-slate-800 pb-1">
                  6-PART DISCRETE GLB ASSET CHECKLIST:
                </div>
                {(
                  [
                    { name: "Chassis Monocoque", path: architecture.assets.chassisAsset },
                    { name: "Body Framework Cage", path: architecture.assets.bodyFrameworkAsset },
                    { name: "Underbody Floor", path: architecture.assets.floorAsset },
                    { name: "Wheel Arch Liners", path: architecture.assets.wheelArchAsset },
                    { name: "Hardpoint Sockets", path: architecture.assets.hardpointAsset },
                    { name: "Packaging Envelopes", path: architecture.assets.envelopeAsset },
                  ]
                ).map((a) => (
                  <div key={a.name} className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      {a.name}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">{a.path}</span>
                  </div>
                ))}
              </div>

              {/* Semantic Nodes Validated */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-[10px]">
                <span className="text-slate-400 font-bold block">VALIDATED SEMANTIC HARDPOINT NODES:</span>
                <div className="flex flex-wrap gap-1">
                  {(validationResult?.validatedNodes || []).map((node) => (
                    <span key={node} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {node}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: OUTLINER HIERARCHY & NAMING CONVENTIONS */}
          {activeDetailTab === "outliner" && (
            <div className="space-y-4 font-mono text-xs">
              {/* Master Root Collection Card */}
              <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-500/40 shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FolderTree size={16} className="text-amber-400" />
                    <span className="font-bold text-amber-300 text-sm">
                      📁 {outlinerScene.masterRootCollection}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-bold">
                    BLENDER MASTER ROOT
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block">TOTAL NODES</span>
                    <strong className="text-slate-200 text-xs">{outlinerScene.summary.totalNodes}</strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block">SYMMETRICAL</span>
                    <strong className="text-cyan-400 text-xs">{outlinerScene.summary.symmetricalNodesCount} (.L/.R)</strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block">MIRROR MODS</span>
                    <strong className="text-purple-400 text-xs">{outlinerScene.summary.mirrorModifierCount}</strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block">GLB VISUAL</span>
                    <strong className="text-emerald-400 text-xs">{outlinerScene.summary.glbVisualNodesCount}</strong>
                  </div>
                </div>
              </div>

              {/* 7 Outliner Collections Pill Selector */}
              <div>
                <span className="text-[10px] text-slate-400 font-bold block mb-1.5">
                  7 PRODUCTION OUTLINER COLLECTIONS:
                </span>
                <div className="flex flex-wrap gap-1">
                  {outlinerScene.collections.map((col) => {
                    const isSelected = selectedOutlinerCol === col.id;
                    return (
                      <button
                        key={col.id}
                        onClick={() => {
                          playHMIClickSound();
                          setSelectedOutlinerCol(col.id);
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                            : "bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                        }`}
                      >
                        <span>📁 {col.id}</span>
                        <span className={`px-1 py-0.2 rounded text-[9px] ${
                          isSelected ? "bg-black/30 text-amber-950" : "bg-slate-800 text-slate-400"
                        }`}>
                          {col.nodes.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Collection Node Browser */}
              {(() => {
                const activeCol = outlinerScene.collections.find((c) => c.id === selectedOutlinerCol);
                if (!activeCol) return null;

                return (
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                      <div>
                        <div className="font-bold text-slate-200 text-xs flex items-center gap-2">
                          <span>📁 {activeCol.id}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({activeCol.description})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/50">
                          Shader: {activeCol.shaderPass}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                          activeCol.isGlbExportable
                            ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/50"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}>
                          {activeCol.isGlbExportable ? "GLB: Exported" : "GLB: Filtered"}
                        </span>
                      </div>
                    </div>

                    {/* Nodes in this Collection */}
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                      {activeCol.nodes.map((node) => (
                        <div
                          key={node.name}
                          className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-between text-[11px]"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`px-1 py-0.5 rounded text-[9px] font-bold ${
                              node.prefix === "REF"
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                : node.prefix === "COL"
                                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}>
                              {node.prefix}
                            </span>
                            <span className="font-bold text-slate-200 truncate">{node.name}</span>
                            {node.side !== "CENTER" && (
                              <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                                node.side === "L"
                                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                  : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              }`}>
                                .{node.side}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {node.hasMirrorModifier && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40 flex items-center gap-1">
                                <Split size={9} /> Mirror (0,0,0)
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Copy Generator Command */}
              <button
                onClick={handleCopyBlenderScript}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-300 flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
              >
                {copiedScript ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedScript ? "BLENDER COMMAND COPIED!" : `COPY BLENDER SCRIPT COMMAND (${selectedBodyTypeId.toUpperCase()})`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
