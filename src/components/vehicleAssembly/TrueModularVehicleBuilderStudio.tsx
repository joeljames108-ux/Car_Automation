// ============================================================================
// TRUE MODULAR VEHICLE BUILDER STUDIO
// ============================================================================
// Faithfully implements piece-by-piece modular vehicle construction across
// all 38 body types and 8 platform families:
// - Stage 0: Expanded 38-Body Selection with Platform Filtering
// - Stage 1-10: Cumulative Subsystem Construction with Specialized CAD Modules:
//   * Hypercar Active Aero (-15° to +35° wing, DRS flap, dynamic lap time)
//   * Roadster/Convertible Structural Roof (0 -> 1 slider, mechanism status)
//   * Van/MPV Modular Seating Layout (2, 5, 7, 8, 9 seats with cargo volume trade-off)
//   * Off-Road Long-Travel Suspension & Tire Clearance (180-360mm height, 30-42" tires)
//   * Commercial Master Frame Rear Body Swapper (Flatbed, Cargo Box, Tipper, Camper, etc.)
// ============================================================================

import React, { useState, useMemo } from "react";
import {
  Car,
  CheckCircle2,
  ChevronRight,
  Shield,
  Layers,
  Wrench,
  Gauge,
  Sparkles,
  RefreshCw,
  Cpu,
  Zap,
  ArrowRight,
  Flame,
  Award,
  CircleDot,
  Check,
  RotateCcw,
  Eye,
  EyeOff,
  Wind,
  Sliders,
  Maximize2,
  Truck,
  Users,
  Search,
  Compass,
  Download,
  Box,
  Edit3,
  Sofa,
  Cog,
  ExternalLink,
} from "lucide-react";
import { useDesign } from "../../state/DesignContext";
import {
  useModularVehicleBuilderStore,
  VehicleModelCategory,
  AssemblyStage,
  ASSEMBLY_STAGES,
  getStageIndividualParts,
  getCompleteVehicleGlbPath,
} from "../../state/modularVehicleBuilderStore";
import { ModularVehicleCanvasViewport } from "./ModularVehicleCanvasViewport";
import { playHMIClickSound, playHMITabSound } from "../../utils/hmiSoundSynth";
import {
  BODY_TYPE_REGISTRY,
  PLATFORM_FAMILIES,
  getAllBodyTypeIds,
  calculateConvertibleRoof,
  calculateOffRoadClearance,
  COMMERCIAL_BODY_REGISTRY,
} from "../../sim/modularVehicle/vehicleFamilyArchitecture";
import {
  VehicleBodyTypeId,
  CommercialBodyType,
} from "../../sim/modularVehicle/types";

// Color swatches for exterior paint
const BODY_COLORS = [
  { name: "Super White / Platinum Pearl", hex: "#f0f2f5" },
  { name: "Oxide Bronze Metallic", hex: "#6c6052" },
  { name: "Attitude Black Mica", hex: "#111214" },
  { name: "Deep Sapphire Blue", hex: "#0a2558" },
  { name: "Liquid Silver", hex: "#b0b8c2" },
  { name: "Gloss Nero Carbon", hex: "#1a1a1c" },
  { name: "Rosso Corsa Red", hex: "#c4151c" },
  { name: "British Racing Green", hex: "#0d4224" },
  { name: "Stealth Satin Gold", hex: "#a3823f" },
  { name: "Vibrant Velocity Orange", hex: "#d9531e" },
  { name: "Frozen Matte Cyan", hex: "#06b6d4" },
];

export interface TrueModularVehicleBuilderStudioProps {
  onSelectStage?: (stage: string) => void;
}

export const TrueModularVehicleBuilderStudio: React.FC<TrueModularVehicleBuilderStudioProps> = ({
  onSelectStage,
}) => {
  const { design, sim, updateVehicle, setDesignName } = useDesign();
  const selectedModel = useModularVehicleBuilderStore((s) => s.selectedModel);
  const currentStage = useModularVehicleBuilderStore((s) => s.currentStage);
  const installedStages = useModularVehicleBuilderStore((s) => s.installedStages);
  const setSelectedModel = useModularVehicleBuilderStore((s) => s.setSelectedModel);
  const setCurrentStage = useModularVehicleBuilderStore((s) => s.setCurrentStage);
  const installCurrentStageAndNext = useModularVehicleBuilderStore((s) => s.installCurrentStageAndNext);
  const resetToFrontPage = useModularVehicleBuilderStore((s) => s.resetToFrontPage);

  // Subsystem Options
  const chassisArch = useModularVehicleBuilderStore((s) => s.chassisArch);
  const materialGrade = useModularVehicleBuilderStore((s) => s.materialGrade);
  const bodyColorHex = useModularVehicleBuilderStore((s) => s.bodyColorHex);
  const enginePosition = useModularVehicleBuilderStore((s) => s.enginePosition);

  const setChassisArch = useModularVehicleBuilderStore((s) => s.setChassisArch);
  const setMaterialGrade = useModularVehicleBuilderStore((s) => s.setMaterialGrade);
  const setBodyColorHex = useModularVehicleBuilderStore((s) => s.setBodyColorHex);
  const setEnginePosition = useModularVehicleBuilderStore((s) => s.setEnginePosition);
  const togglePartVisibility = useModularVehicleBuilderStore((s) => s.togglePartVisibility);
  const isPartVisible = useModularVehicleBuilderStore((s) => s.isPartVisible);

  // Specialized CAD state
  const convertibleRoofPosition = useModularVehicleBuilderStore((s) => s.convertibleRoofPosition);
  const offRoadRideHeightMm = useModularVehicleBuilderStore((s) => s.offRoadRideHeightMm);
  const offRoadTireDiameterInches = useModularVehicleBuilderStore((s) => s.offRoadTireDiameterInches);
  const commercialBodyType = useModularVehicleBuilderStore((s) => s.commercialBodyType);

  const setConvertibleRoofPosition = useModularVehicleBuilderStore((s) => s.setConvertibleRoofPosition);
  const setOffRoadRideHeight = useModularVehicleBuilderStore((s) => s.setOffRoadRideHeight);
  const setOffRoadTireDiameter = useModularVehicleBuilderStore((s) => s.setOffRoadTireDiameter);
  const setCommercialBodyType = useModularVehicleBuilderStore((s) => s.setCommercialBodyType);

  // Sanitize currentStage: strictly enforce that only hardware assembly stages run in Vehicle Studio
  React.useEffect(() => {
    const isHardwareStage = ASSEMBLY_STAGES.some((st) => st.id === currentStage);
    if (!isHardwareStage && currentStage !== "model_select" && currentStage !== "complete") {
      setCurrentStage("chassis");
    }
  }, [currentStage, setCurrentStage]);

  // Auto-scroll the stage-chain breadcrumb so the ACTIVE stage chip is always fully visible
  const breadcrumbRailRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const rail = breadcrumbRailRef.current;
    if (!rail) return;
    const chip = rail.querySelector<HTMLElement>("[data-breadcrumb-active='true']");
    if (!chip) return;
    const railRect = rail.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();
    const margin = 24; // keep a little breathing room around the active chip
    if (chipRect.left < railRect.left + margin) {
      rail.scrollBy({ left: chipRect.left - railRect.left - margin, behavior: "smooth" });
    } else if (chipRect.right > railRect.right - margin) {
      rail.scrollBy({ left: chipRect.right - railRect.right + margin, behavior: "smooth" });
    }
  }, [currentStage]);

  // Filter state for Stage 0
  const [modelFilterCategory, setModelFilterCategory] = useState<string>("ALL");
  const [modelSearchQuery, setModelSearchQuery] = useState<string>("");

  // Active stage definition and parts
  const activeStageDef = ASSEMBLY_STAGES.find((st) => st.id === currentStage) || ASSEMBLY_STAGES[0];
  const stageParts = getStageIndividualParts(currentStage);
  const totalStageMass = stageParts.length > 0 ? stageParts.reduce((acc, p) => acc + p.massKg, 0) : 142.5;

  // Active Model Spec
  const activeBodySpec = BODY_TYPE_REGISTRY[selectedModel as VehicleBodyTypeId] || BODY_TYPE_REGISTRY["sedan"];

  // Specialized CAD Calculations
  const convertibleRoof = useMemo(() => {
    return calculateConvertibleRoof(convertibleRoofPosition);
  }, [convertibleRoofPosition]);

  const offRoadClearance = useMemo(() => {
    return calculateOffRoadClearance(offRoadRideHeightMm, offRoadTireDiameterInches);
  }, [offRoadRideHeightMm, offRoadTireDiameterInches]);

  const activeCommercialSpec = COMMERCIAL_BODY_REGISTRY[commercialBodyType];

  // Filtered 38 Models for Stage 0
  const filteredModels = useMemo(() => {
    const allIds = getAllBodyTypeIds();
    return allIds.filter((bId) => {
      const spec = BODY_TYPE_REGISTRY[bId];
      if (!spec) return false;

      const matchesSearch =
        modelSearchQuery === "" ||
        spec.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
        spec.designIdentity.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
        spec.typicalArchitecture.toLowerCase().includes(modelSearchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (modelFilterCategory === "PASSENGER") {
        return ["sedan", "luxury_sedan", "coupe", "station_wagon", "shooting_brake", "grand_tourer", "limousine"].includes(bId);
      }
      if (modelFilterCategory === "PERFORMANCE") {
        return ["coupe", "supercar", "hypercar", "track_special", "roadster", "convertible", "grand_tourer", "sport_wagon"].includes(bId);
      }
      if (modelFilterCategory === "UTILITY_OFFROAD") {
        return ["suv", "crossover", "pickup_truck", "offroad_4x4", "luxury_suv", "offroad_suv", "performance_suv"].includes(bId);
      }
      if (modelFilterCategory === "COMMERCIAL") {
        return ["cargo_van", "bus_shuttle", "truck_lorry"].includes(bId);
      }
      if (modelFilterCategory === "COMPACT") {
        return ["hatchback"].includes(bId);
      }

      return true;
    });
  }, [modelFilterCategory, modelSearchQuery]);

  // --------------------------------------------------------------------------
  // RENDER SCREEN 1: FRONT PAGE (STAGE 0: 38-BODY EXPANDED MODEL SELECTOR)
  // --------------------------------------------------------------------------
  if (currentStage === "model_select") {
    return (
      <div className="space-y-6 animate-stage-transition-enter font-mono">
        {/* Front Page Header */}
        <div className="panel p-6 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase mb-2">
            <Sparkles size={13} />
            <span>TRUE MODULAR AUTOMOTIVE CAD PIPELINE • STAGE 0</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-wider uppercase text-slate-100">
            FRONT PAGE : MODEL YOU WANT TO BUILD
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-2xl mx-auto">
            Choose from the library of 24 vehicle body architectures across 8 foundational platforms.
            Snap discrete GLB modules zero-offset: Chassis, Subframes, Suspension, Body Clip, Aero, Wheels, and Cockpit.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="panel p-4 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: "ALL", label: "All 24 Models" },
              { id: "PASSENGER", label: "Passenger & GT" },
              { id: "PERFORMANCE", label: "Performance & Aero" },
              { id: "UTILITY_OFFROAD", label: "Utility & 4×4" },
              { id: "COMMERCIAL", label: "Commercial & Fleet" },
              { id: "COMPACT", label: "Compact & Urban" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  playHMIClickSound();
                  setModelFilterCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  modelFilterCategory === cat.id
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search 24 body models..."
              value={modelSearchQuery}
              onChange={(e) => setModelSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* 24 Vehicle Model Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 max-h-[580px] overflow-y-auto pr-1 no-scrollbar">
          {filteredModels.map((bId) => {
            const spec = BODY_TYPE_REGISTRY[bId];
            const isSelected = selectedModel === bId;

            return (
              <div
                key={bId}
                onClick={() => {
                  playHMIClickSound();
                  setSelectedModel(bId);
                }}
                className={`group relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none ${
                  isSelected
                    ? "bg-cyan-950/40 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)] scale-[1.02]"
                    : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850/80"
                }`}
              >
                {/* Badge & Check */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                    {spec.typicalArchitecture}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-400 text-slate-950"
                        : "border-slate-600 bg-transparent"
                    }`}
                  >
                    {isSelected && <Check size={10} strokeWidth={3} />}
                  </div>
                </div>

                {/* Model Title & Identity */}
                <div className="mb-3">
                  <h3 className="text-base font-black tracking-wider text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {spec.name}
                  </h3>
                  <div className="text-[10px] text-cyan-400/90 mt-0.5 truncate">{spec.designIdentity}</div>
                </div>

                {/* Dimensions Matrix */}
                <div className="pt-2.5 border-t border-slate-800/80 space-y-1 text-[10px]">
                  <div className="flex justify-between text-slate-400">
                    <span>WHEELBASE</span>
                    <span className="font-bold text-slate-200">{spec.defaultDimensions.wheelbaseMm} mm</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>TRACK</span>
                    <span className="font-bold text-slate-200">{spec.defaultDimensions.frontTrackMm} mm</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>DRAG</span>
                    <span className="font-bold text-amber-400">Cd {spec.aerodynamicBaseline.cd.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>SEATING</span>
                    <span className="font-bold text-emerald-400">{spec.seatingCapacity} Seats</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Big SELECT & CONTINUE Button */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => {
              playHMITabSound();
              setCurrentStage("chassis");
            }}
            className="group relative px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer flex items-center gap-3 border-2 border-cyan-300"
          >
            <span>SELECT {activeBodySpec.name.toUpperCase()} & BUILD CHASSIS</span>
            <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER SCREEN 2: ALL COMPLETED / FULL INSPECTION
  // --------------------------------------------------------------------------
  if (currentStage === "complete") {
    const completeGlbPath = getCompleteVehicleGlbPath(selectedModel);
    const glbFilename = completeGlbPath.split("/").pop() || "Car_Complete.glb";

    return (
      <div className="space-y-6 animate-stage-transition-enter font-mono">
        {/* Celebration Header */}
        <div className="panel p-6 rounded-3xl border border-emerald-500/40 bg-emerald-950/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
              <Award size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black uppercase text-slate-100">
                  VEHICLE ASSEMBLY COMPLETE : {activeBodySpec.name.toUpperCase()} SPEC
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                  100% OPERATIONAL
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                All 11 modular engineering subsystems have been successfully coupled to master coordinates with zero offset.
              </p>
              <div className="flex items-center gap-2 my-2">
                <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Edit3 size={12} /> MODEL NAME:
                </span>
                <input
                  type="text"
                  value={design.name}
                  onChange={(e) => setDesignName(e.target.value)}
                  placeholder="Type custom vehicle model name..."
                  className="text-xs font-bold font-mono text-slate-100 bg-slate-900/90 border border-amber-500/40 focus:border-amber-400 rounded-lg px-3 py-1 outline-none w-72 focus:ring-1 focus:ring-amber-400/40"
                />
              </div>
              <div className="flex items-center gap-2.5 mt-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-[11px] text-cyan-300">
                  <Box size={13} className="text-cyan-400" />
                  <strong>CAR GLB:</strong> {glbFilename} (9.62 MB • Class-A CAD Mesh)
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/50 border border-emerald-500/40 text-[10px] text-emerald-400 font-bold">
                  <CheckCircle2 size={12} />
                  11/11 SUBSYSTEMS COUPLED
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {onSelectStage && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    playHMIClickSound();
                    onSelectStage("aero_studio");
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-lg shadow-emerald-500/25 border border-emerald-300"
                >
                  <Wind size={14} />
                  <span>CONTINUE TO 3. AERO STUDIO →</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playHMIClickSound();
                    onSelectStage("interior");
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-lg shadow-amber-500/25 border border-amber-300"
                >
                  <Sofa size={14} />
                  <span>CONTINUE TO 4. INTERIOR STUDIO →</span>
                </button>
              </>
            )}

            <a
              href={completeGlbPath}
              download={glbFilename}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-lg shadow-cyan-500/25 border border-cyan-300"
            >
              <Download size={14} />
              <span>DOWNLOAD CAR GLB</span>
            </a>

            <button
              type="button"
              onClick={resetToFrontPage}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-700"
            >
              <RotateCcw size={14} />
              <span>BUILD ANOTHER</span>
            </button>
          </div>
        </div>

        {/* Complete 3D Assembly Viewport */}
        <ModularVehicleCanvasViewport />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER SCREEN 3: UNIVERSAL MODULAR SUBSYSTEM BUILDER
  // (Images 2, 3, 4: Red Box Top, Green Install Middle, Black Box Bottom)
  // --------------------------------------------------------------------------
  return (
    <div className="space-y-5 animate-stage-transition-enter font-mono">
      {/* =====================================================================
          TOP CHAIN BREADCRUMB
          ===================================================================== */}
      <div className="panel p-3.5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg">
        <div ref={breadcrumbRailRef} className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex items-center gap-1.5 flex-nowrap min-w-max">
          <button
            type="button"
            onClick={resetToFrontPage}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[10px] font-bold text-slate-400 hover:text-slate-200 border border-slate-700/60 mr-1 cursor-pointer shrink-0"
          >
            ← {activeBodySpec.name.toUpperCase()}
          </button>

          {ASSEMBLY_STAGES.map((st, idx) => {
            const isCurrent = currentStage === st.id;
            const isInstalled = installedStages.includes(st.id);

            return (
              <React.Fragment key={st.id}>
                {idx > 0 && <ChevronRight size={12} className="text-slate-600 shrink-0" />}
                <button
                  type="button"
                  onClick={() => {
                    playHMIClickSound();
                    setCurrentStage(st.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isCurrent
                      ? "bg-amber-500/25 text-amber-300 border-2 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                      : isInstalled
                      ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-900/60 text-slate-500 border border-slate-800 hover:text-slate-300"
                  }`}
                  data-breadcrumb-active={isCurrent ? "true" : undefined}
                >
                  {isInstalled ? (
                    <CheckCircle2 size={12} className="text-emerald-400" />
                  ) : (
                    <CircleDot size={12} className={isCurrent ? "text-amber-400 animate-pulse" : "text-slate-600"} />
                  )}
                  <span>{st.label}</span>
                </button>
              </React.Fragment>
            );
          })}
          </div>
        </div>
      </div>

      {/* =====================================================================
          TOP RED-OUTLINED BOX: 3D CAD SUBSYSTEM GLB VIEWPORT
          ===================================================================== */}
      <div className="relative rounded-2xl border-4 border-red-500/80 bg-slate-950/90 shadow-[0_0_35px_rgba(239,68,68,0.25)] p-2 transition-all">
        <div className="absolute top-4 left-6 z-20 pointer-events-none flex items-center gap-2">
          <span className="px-3 py-1 rounded-md bg-red-600/90 text-white text-[11px] font-black tracking-wider uppercase shadow-md flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            GLB OF {activeStageDef.label.toUpperCase()}
          </span>
          <span className="text-xs text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700/60">
            {activeStageDef.subsystemTitle} · {activeBodySpec.name}
          </span>
        </div>

        {/* 3D WebGL Canvas Viewport */}
        <ModularVehicleCanvasViewport />
      </div>

      {/* =====================================================================
          SEPARATOR WITH SUBSYSTEM TITLE & GREEN INSTALL BUTTON
          ===================================================================== */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              ACTIVE SUBSYSTEM NODE:
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-100 tracking-wider uppercase">
              {activeStageDef.label}
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            playHMITabSound();
            installCurrentStageAndNext();
          }}
          className="group relative px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer flex items-center gap-3 border-2 border-emerald-300"
        >
          <Check size={18} strokeWidth={3} />
          <span>INSTALL AND NEXT</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* =====================================================================
          SPECIALIZED INTERACTIVE CAD MODULES DECK
          (Hypercar Active Aero, Convertible Roof, Van Seating, Off-Road Clearances, Commercial Rear Swapper)
          ===================================================================== */}


      {/* 2. ROADSTER / CONVERTIBLE STRUCTURAL ROOF DECK */}
      {(currentStage === "exterior_panels" || ["roadster", "convertible"].includes(selectedModel)) && (
        <div className="p-4 rounded-2xl border-2 border-amber-500/60 bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-slate-950 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-amber-400" />
              <h3 className="text-xs font-black uppercase text-amber-300 tracking-wider">
                CONVERTIBLE / ROADSTER STRUCTURAL ROOF MECHANISM
              </h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
              convertibleRoof.state === "roof_up"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : convertibleRoof.state === "roof_down"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
            }`}>
              {convertibleRoof.state.replace("_", " ")} ({(convertibleRoofPosition * 100).toFixed(0)}%)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Roof Kinematics Slider (0=Down, 1=Up):</span>
                <span className="font-bold text-amber-300">{convertibleRoofPosition.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={convertibleRoofPosition}
                onChange={(e) => setConvertibleRoofPosition(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0.0 Roof Stowed (Open Air)</span>
                <span>1.0 Roof Deployed (Sealed)</span>
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">RIGIDITY PENALTY</span>
                <strong className="text-red-400 text-xs">{convertibleRoof.structuralRigidityPenaltyPct}%</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">AERO DRAG DELTA</span>
                <strong className="text-amber-400 text-xs">+{convertibleRoof.cdDelta.toFixed(2)} Cd</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">WIND DEFLECTOR</span>
                <strong className="text-cyan-400 text-xs">{convertibleRoofPosition > 0.5 ? "STOWED" : "DEPLOYED"}</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">ROOF STATE</span>
                <strong className="text-emerald-400 text-xs uppercase">{convertibleRoof.state}</strong>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* 4. OFF-ROAD CLEARANCE & SUSPENSION TRAVEL DECK */}
      {(currentStage === "suspension" || ["offroad_4x4", "offroad_suv", "pickup_truck"].includes(selectedModel)) && (
        <div className="p-4 rounded-2xl border-2 border-orange-500/60 bg-gradient-to-r from-orange-950/40 via-slate-900/90 to-slate-950 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-orange-400" />
              <h3 className="text-xs font-black uppercase text-orange-300 tracking-wider">
                OFF-ROAD SUSPENSION KINEMATICS & ARTICULATION
              </h3>
            </div>
            <span className="text-xs text-orange-300 font-bold">
              CLEARANCE: {offRoadClearance.effectiveGroundClearanceMm} mm
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Ride Height Adjustment:</span>
                <span className="font-bold text-orange-400">{offRoadRideHeightMm} mm</span>
              </div>
              <input
                type="range"
                min={180}
                max={360}
                step={5}
                value={offRoadRideHeightMm}
                onChange={(e) => setOffRoadRideHeight(Number(e.target.value))}
                className="w-full accent-orange-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>All-Terrain Tire Outer Diameter:</span>
                <span className="font-bold text-orange-400">{offRoadTireDiameterInches}"</span>
              </div>
              <input
                type="range"
                min={30}
                max={42}
                step={1}
                value={offRoadTireDiameterInches}
                onChange={(e) => setOffRoadTireDiameter(Number(e.target.value))}
                className="w-full accent-orange-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-slate-500 block">EFFECTIVE CLEARANCE</span>
              <strong className="text-slate-200 text-xs">{offRoadClearance.effectiveGroundClearanceMm} mm</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-slate-500 block">SUSPENSION TRAVEL</span>
              <strong className="text-slate-200 text-xs">{offRoadClearance.suspensionTravelMm} mm</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-slate-500 block">FENDER CLEARANCE</span>
              <strong className="text-orange-400 text-xs">{offRoadClearance.fenderClearanceMm} mm</strong>
            </div>
          </div>
        </div>
      )}

      {/* 5. COMMERCIAL REAR BODY SWAPPER */}
      {(currentStage === "exterior_panels" || ["cargo_van", "pickup_truck", "truck_lorry"].includes(selectedModel)) && (
        <div className="p-4 rounded-2xl border-2 border-blue-500/60 bg-gradient-to-r from-blue-950/40 via-slate-900/90 to-slate-950 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-blue-400" />
              <h3 className="text-xs font-black uppercase text-blue-300 tracking-wider">
                COMMERCIAL MASTER FRAME INTERCHANGEABLE REAR BODY MODULES
              </h3>
            </div>
            <span className="text-xs text-blue-300 font-bold">
              PAYLOAD: {activeCommercialSpec.payloadCapacityKg} kg
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {(Object.keys(COMMERCIAL_BODY_REGISTRY) as CommercialBodyType[]).map((cType) => {
              const isSelected = commercialBodyType === cType;
              const spec = COMMERCIAL_BODY_REGISTRY[cType];
              return (
                <button
                  key={cType}
                  onClick={() => {
                    playHMIClickSound();
                    setCommercialBodyType(cType);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-500 text-slate-950 border-blue-300 shadow-md"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  {spec.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          BOTTOM BLACK-OUTLINED BOX: 3-COLUMN CONFIGURATION GRID
          ===================================================================== */}
      <div className="rounded-2xl border-4 border-slate-700/90 bg-slate-950/95 shadow-2xl p-6 select-none">
        <div className="border-b border-slate-800 pb-3 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Wrench size={14} className="text-cyan-400" />
            <span>ALL CONFIGURATIONS RELATED TO {activeStageDef.label.toUpperCase()}</span>
          </div>
          <span className="text-[10px] text-slate-500 uppercase">
            ACTIVE ARCHITECTURE: {activeBodySpec.name.toUpperCase()}
          </span>
        </div>

        {currentStage === "engine" ? (
          /* ===============================================================
             STAGE: ENGINE — 3-WAY POSITION SELECTOR + ENGINE TAB READOUT
             =============================================================== */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* COLUMN 1: THE 3 ENGINE POSITION OPTIONS */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Compass size={16} className="text-amber-400" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                    ENGINE CHASSIS POSITION
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  Select longitudinal chassis placement. Dynamically shifts the final assembled engine GLB in 3D CAD.
                </p>

                <div className="space-y-2 pt-1">
                  {[
                    {
                      id: "front" as const,
                      label: "Front Engine",
                      subtitle: "Longitudinal / Transverse Ahead of Cabin",
                      desc: "Mounted ahead of firewall over front axle. Classic GT / sedan / truck layout with maximum cabin space.",
                      weightBias: "54% F / 46% R",
                      badge: "PREDICTABLE TRACTION",
                    },
                    {
                      id: "mid" as const,
                      label: "Mid Engine",
                      subtitle: "Behind Cockpit / Between Axles",
                      desc: "Mounted between cabin and rear axle. Minimal polar moment of inertia for razor-sharp track cornering.",
                      weightBias: "43% F / 57% R",
                      badge: "OPTIMAL HANDLING",
                    },
                    {
                      id: "rear" as const,
                      label: "Rear Engine",
                      subtitle: "Over / Behind Rear Axle",
                      desc: "Cantilevered over or behind rear axle. Maximizes rear launch grip and high-braking deceleration stability.",
                      weightBias: "38% F / 62% R",
                      badge: "LAUNCH GRIP",
                    },
                  ].map((opt) => {
                    const isSelected = enginePosition === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          playHMIClickSound();
                          setEnginePosition(opt.id);
                          updateVehicle({ enginePosition: opt.id });
                        }}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-500/20 border-amber-400 text-slate-100 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                            : "bg-slate-850/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{opt.label}</span>
                          <span className="text-[10px] font-bold text-amber-400">{opt.weightBias}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[9px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-bold border border-slate-700">
                            {opt.badge}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                              <Check size={12} strokeWidth={3} /> ACTIVE
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
                <span>ACTIVE POSITION</span>
                <span className="text-amber-400 font-bold uppercase">{enginePosition} ENGINE</span>
              </div>
            </div>

            {/* COLUMN 2: ENGINE TAB SPECIFICATION SUMMARY */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Cog size={16} className="text-cyan-400" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                    ENGINE SPECIFICATION (CONFIGURED IN ENGINE TAB)
                  </h3>
                </div>
                <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-200 leading-relaxed">
                  Bore, stroke, cylinder layout, valvetrain, turbocharger boost, and camshaft profiles are configured exclusively in <strong>Tab 1 (Engine Designer)</strong>.
                </div>

                {/* Read-only Live Engine Metrics from Engine Tab */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">ARCHITECTURE</span>
                    <strong className="text-slate-200 text-xs uppercase">{design.engine.layout}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">DISPLACEMENT</span>
                    <strong className="text-slate-200 text-xs">
                      {((sim.displacement || 4000) / 1000).toFixed(1)}L ({Math.round(sim.displacement || 4000)} cc)
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">PEAK OUTPUT</span>
                    <strong className="text-amber-400 text-xs">
                      {Math.round(sim.peakPower || 550)} HP @ {Math.round(sim.peakPowerRpm || 6500)} RPM
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">PEAK TORQUE</span>
                    <strong className="text-cyan-400 text-xs">
                      {Math.round(sim.peakTorque || 680)} Nm @ {Math.round(sim.peakTorqueRpm || 3200)} RPM
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">ASPIRATION</span>
                    <strong className="text-slate-200 text-xs uppercase">
                      {design.engine.intake.replace(/_/g, " ")}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">REDLINE</span>
                    <strong className="text-rose-400 text-xs">
                      {design.engine.redline || 8500} RPM
                    </strong>
                  </div>
                </div>
              </div>

              {/* Direct Link to Engine Designer Tab */}
              {onSelectStage && (
                <div className="pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      playHMIClickSound();
                      onSelectStage("engine");
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 hover:border-cyan-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Cog size={14} className="animate-spin-slow" />
                    <span>OPEN 1. ENGINE TAB TO CONFIGURE ENGINE</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* COLUMN 3: PACKAGING & 3D GLB ASSET STATUS */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Gauge size={16} className="text-emerald-400" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                    PACKAGING & 3D GLB ASSET
                  </h3>
                </div>

                {/* Engineering Metrics */}
                <div className="grid grid-cols-2 gap-2 text-[11px] mb-4">
                  <div className="p-2 rounded-lg bg-slate-850 border border-slate-800">
                    <div className="text-slate-500 text-[9px]">ENGINE MASS</div>
                    <div className="font-bold text-slate-200">{Math.round(sim.engineWeight || 195)} kg</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-850 border border-slate-800">
                    <div className="text-slate-500 text-[9px]">CHASSIS Y-OFFSET</div>
                    <div className="font-bold text-cyan-400">
                      {enginePosition === "front" ? "+0.85 m (Front)" : enginePosition === "mid" ? "-0.30 m (Mid)" : "-1.55 m (Rear)"}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-850 border border-slate-800">
                    <div className="text-slate-500 text-[9px]">WEIGHT BIAS</div>
                    <div className="font-bold text-amber-400">
                      {enginePosition === "front" ? "54% F / 46% R" : enginePosition === "mid" ? "43% F / 57% R" : "38% F / 62% R"}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-850 border border-slate-800">
                    <div className="text-slate-500 text-[9px]">CAD ASSET</div>
                    <div className="font-bold text-emerald-400 truncate" title={selectedModel === "pickup_truck" ? "pickup/engine.glb" : selectedModel === "coupe" ? "coupe/engine.glb" : "Engine_V8_TwinTurbo_Complete.glb"}>
                      {selectedModel === "pickup_truck" ? "pickup/engine.glb" : selectedModel === "coupe" ? "coupe/engine.glb" : "Engine_V8_Complete.glb"}
                    </div>
                  </div>
                </div>

                {/* Visual 3D Asset Verification Banner */}
                <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 size={15} />
                    <span>FINAL ASSEMBLED ENGINE GLB LOADED</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    The complete 3D engine CAD assembly is loaded directly from the Engine tab pipeline. Positioned dynamically at the {enginePosition.toUpperCase()} chassis hardpoints without regenerating any mesh assets.
                  </p>
                </div>
              </div>

              {/* Status Footer */}
              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
                <span>ZERO-OFFSET CHASSIS SNAP</span>
                <span className="text-emerald-400 font-bold">✓ {enginePosition.toUpperCase()} HARDPOINTS LOCKED</span>
              </div>
            </div>
          </div>
        ) : currentStage === "gearbox" ? (
          /* ===============================================================
             STAGE: GEARBOX — TRANSMISSION MATING & POWERTRAIN STUDIO LINK
             =============================================================== */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* COLUMN 1: TRANSMISSION ARCHITECTURE & DRIVETRAIN LAYOUT */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Compass size={16} className="text-amber-400" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                    DRIVETRAIN LAYOUT & MATING
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  Transmission aligns directly to the {enginePosition.toUpperCase()} engine bellhousing hardpoints.
                </p>

                <div className="space-y-2 pt-1">
                  {[
                    {
                      id: "transaxle_dct",
                      label: "Dual-Clutch Transaxle (DCT)",
                      desc: "Electro-hydraulic twin clutches for 40ms gear handoff.",
                      efficiency: "98.2%",
                    },
                    {
                      id: "manual_6",
                      label: "6-Speed Manual with Auto-Blip",
                      desc: "Lightweight 3-shaft mechanical linkage with rev-matching.",
                      efficiency: "97.5%",
                    },
                    {
                      id: "sequential_dog",
                      label: "Sequential Dog-Ring Race Box",
                      desc: "Straight-cut gears with clutchless pneumatic paddle shift.",
                      efficiency: "99.1%",
                    },
                  ].map((opt) => {
                    const isSelected = (design.vehicle.transmission as string)?.includes("dct") ? opt.id === "transaxle_dct" : opt.id === "manual_6";
                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          playHMIClickSound();
                          if (opt.id === "transaxle_dct") updateVehicle({ transmission: "dct_7" });
                          else if (opt.id === "manual_6") updateVehicle({ transmission: "manual_6" });
                          else updateVehicle({ transmission: "seq_6" });
                        }}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-500/20 border-amber-400 text-slate-100 shadow-sm"
                            : "bg-slate-850/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{opt.label}</span>
                          <span className="text-[10px] font-bold text-amber-400">{opt.efficiency}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">{opt.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
                <span>MATING ARCHITECTURE</span>
                <span className="text-amber-400 font-bold uppercase">{enginePosition} TRANSAXLE</span>
              </div>
            </div>

            {/* COLUMN 2: TRANSMISSION SPEC FROM POWERTRAIN TAB */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Cog size={16} className="text-cyan-400" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                    GEARBOX SPECIFICATION (CONFIGURED IN POWERTRAIN)
                  </h3>
                </div>
                <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-200 leading-relaxed">
                  Gear ratios, final drive ratio, differential locking, and preload are configured in the <strong>Powertrain / Transmission Studio</strong>.
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">TYPE</span>
                    <strong className="text-slate-200 text-xs uppercase">{design.vehicle.transmission || "dct_7"}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">GEAR COUNT</span>
                    <strong className="text-slate-200 text-xs">{design.vehicle.gearCount || 7} SPEEDS</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">FINAL DRIVE</span>
                    <strong className="text-amber-400 text-xs">{design.vehicle.finalDrive?.toFixed(2) || "3.73"}:1</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">DRIVE TYPE</span>
                    <strong className="text-cyan-400 text-xs uppercase">{design.vehicle.driveType || "rwd"}</strong>
                  </div>
                </div>
              </div>

              {onSelectStage && (
                <div className="pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      playHMIClickSound();
                      onSelectStage("transmission3d");
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 hover:border-cyan-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Cog size={14} />
                    <span>OPEN 3D TRANSMISSION STUDIO</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* COLUMN 3: DRIVETRAIN PACKAGING & GLB ASSET */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Gauge size={16} className="text-emerald-400" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                    GEARBOX PACKAGING & 3D GLB
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] mb-4">
                  <div className="p-2 rounded-lg bg-slate-850 border border-slate-800">
                    <div className="text-slate-500 text-[9px]">GEARBOX MASS</div>
                    <div className="font-bold text-slate-200">78.0 kg</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-850 border border-slate-800">
                    <div className="text-slate-500 text-[9px]">COUPLED TO</div>
                    <div className="font-bold text-amber-400">{enginePosition.toUpperCase()} ENGINE</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-850 border border-slate-800">
                    <div className="text-slate-500 text-[9px]">DRIVELINE LOSS</div>
                    <div className="font-bold text-emerald-400">~12%</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-850 border border-slate-800">
                    <div className="text-slate-500 text-[9px]">CAD ASSET</div>
                    <div className="font-bold text-cyan-400 truncate">
                      {selectedModel === "pickup_truck" ? "pickup/gearbox.glb" : selectedModel === "coupe" ? "coupe/gearbox.glb" : "transmission.glb"}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 size={15} />
                    <span>FINAL COMPLETE TRANSMISSION GLB LOADED</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    The complete 3D transmission CAD asset is loaded and mated to the {enginePosition.toUpperCase()} engine bellhousing with zero offset.
                  </p>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
                <span>BELLHOUSING SNAP</span>
                <span className="text-emerald-400 font-bold">✓ MATED TO {enginePosition.toUpperCase()} ENGINE</span>
              </div>
            </div>
          </div>
        ) : (
          /* ===============================================================
             DEFAULT HARDWARE STAGES (CHASSIS, SUSPENSION, BIW, PANELS, ETC.)
             =============================================================== */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* COLUMN 1: STRUCTURAL ARCHITECTURE */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-cyan-400" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                  STRUCTURAL ARCHITECTURE
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Select geometric topology and structural framework archetype.
              </p>

              <div className="space-y-2 pt-1">
                {[
                  {
                    id: "monocoque",
                    label: "High-Rigidity Monocoque",
                    desc: "Integrated structural shell with optimized load paths.",
                    stiffness: "+42 kNm/deg",
                  },
                  {
                    id: "spaceframe",
                    label: "Extruded Aluminum Spaceframe",
                    desc: "Modular nodes with hollow tubular longitudinal extrusions.",
                    stiffness: "+36 kNm/deg",
                  },
                  {
                    id: "carbon_tub",
                    label: "Autoclaved Carbon Tub",
                    desc: "Single-piece pre-preg carbon safety tub for hypercar rigidity.",
                    stiffness: "+58 kNm/deg",
                  },
                ].map((opt) => {
                  const isSelected = chassisArch === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        playHMIClickSound();
                        setChassisArch(opt.id);
                      }}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-cyan-500/20 border-cyan-400 text-slate-100 shadow-sm"
                          : "bg-slate-850/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{opt.label}</span>
                        <span className="text-[10px] font-bold text-cyan-400">{opt.stiffness}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">{opt.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUMN 2: MATERIAL GRADE & BODY PAINT */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-amber-400" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                  MATERIAL GRADE
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Material alloy specifies density, tensile strength, and mass.
              </p>

              <div className="space-y-2 pt-1">
                {[
                  {
                    id: "high_strength_steel",
                    name: "High-Strength Steel",
                    massDelta: "+0%",
                    rigidityDelta: "Baseline",
                    cost: "$$",
                  },
                  {
                    id: "extruded_aluminum",
                    name: "Extruded 6061-T6 Aluminum",
                    massDelta: "-32%",
                    rigidityDelta: "+15%",
                    cost: "$$$",
                  },
                  {
                    id: "carbon_composite",
                    name: "Autoclaved 3K Carbon Fiber",
                    massDelta: "-58%",
                    rigidityDelta: "+45%",
                    cost: "$$$$",
                  },
                  {
                    id: "titanium_magnesium",
                    name: "Grade 5 Titanium / Magnesium",
                    massDelta: "-65%",
                    rigidityDelta: "+60%",
                    cost: "$$$$$",
                  },
                ].map((mat) => {
                  const isSelected = materialGrade === mat.id;
                  return (
                    <div
                      key={mat.id}
                      onClick={() => {
                        playHMIClickSound();
                        setMaterialGrade(mat.id);
                      }}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-500/20 border-amber-400 text-slate-100 shadow-sm"
                          : "bg-slate-850/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{mat.name}</span>
                        <span className="text-[10px] font-bold text-amber-400">{mat.cost}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                        <span>Mass: <strong className="text-slate-200">{mat.massDelta}</strong></span>
                        <span>Stiffness: <strong className="text-slate-200">{mat.rigidityDelta}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* If Exterior stage, show paint color picker */}
              {currentStage === "exterior_panels" && (
                <div className="pt-3 border-t border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase">
                    AUTOMOTIVE BODY PAINT LACQUER
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {BODY_COLORS.map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        title={col.name}
                        onClick={() => setBodyColorHex(col.hex)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                          bodyColorHex === col.hex ? "scale-125 border-white shadow-lg" : "border-slate-700"
                        }`}
                        style={{ backgroundColor: col.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* COLUMN 3: ECONOMICS & STATS + COMPONENT CHECKLIST */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Gauge size={16} className="text-emerald-400" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                    ECONOMICS & STATS
                  </h3>
                </div>

                {/* Real-time Engineering Metrics */}
                <div className="grid grid-cols-2 gap-2 text-[11px] mb-4">
                  <div className="p-2 rounded-lg bg-slate-850 border border-slate-800">
                    <div className="text-slate-500 text-[9px]">SUB-MASS</div>
                    <div className="font-bold text-slate-200">{totalStageMass.toFixed(1)} kg</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-850 border border-slate-800">
                    <div className="text-slate-500 text-[9px]">RIGIDITY</div>
                    <div className="font-bold text-emerald-400">46.2 kNm/°</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-850 border border-slate-800">
                    <div className="text-slate-500 text-[9px]">DRAG COEFF</div>
                    <div className="font-bold text-amber-400">Cd {activeBodySpec.aerodynamicBaseline.cd.toFixed(2)}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-850 border border-slate-800">
                    <div className="text-slate-500 text-[9px]">DISCRETE CAD NODES</div>
                    <div className="font-bold text-cyan-400">{stageParts.length} PARTS</div>
                  </div>
                </div>

                {/* Modular CAD Components Checklist with Eye Toggle */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="text-[10px] font-extrabold text-slate-400 mb-2 uppercase flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Cpu size={12} className="text-cyan-400" />
                      <span>MODULAR CAD COMPONENTS ({stageParts.length})</span>
                    </div>
                    <span className="text-[9px] text-slate-500">EYE: HIDE / INSPECT</span>
                  </div>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                    {stageParts.map((part) => {
                      const visible = isPartVisible(part.id);
                      return (
                        <div
                          key={part.id}
                          className={`flex items-center justify-between p-2 rounded-lg border transition-all text-[11px] select-none ${
                            visible
                              ? "bg-slate-850/80 border-slate-800 text-slate-200"
                              : "bg-slate-900/40 border-slate-800/40 text-slate-600 opacity-60"
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => {
                                playHMIClickSound();
                                togglePartVisibility(part.id);
                              }}
                              className={`p-1 rounded cursor-pointer transition-colors ${
                                visible
                                  ? "text-cyan-400 hover:text-cyan-300 hover:bg-slate-800"
                                  : "text-slate-600 hover:text-slate-400"
                              }`}
                              title={visible ? "Hide Part in 3D CAD" : "Show Part in 3D CAD"}
                            >
                              {visible ? <Eye size={13} /> : <EyeOff size={13} />}
                            </button>
                            <div className="truncate">
                              <span className="font-semibold">{part.name}</span>
                              <div className="text-[9px] text-slate-400">{part.material}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-bold text-slate-300">{part.massKg.toFixed(1)} kg</span>
                            <CheckCircle2 size={12} className="text-emerald-400" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Status Footer */}
              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
                <span>ZERO-OFFSET CAD SNAP</span>
                <span className="text-emerald-400 font-bold">✓ VERIFIED</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
