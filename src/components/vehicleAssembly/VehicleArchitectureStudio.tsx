// ============================================================================
// VEHICLE ARCHITECTURE STUDIO — VEHICLE TAB ENTRY WORKSPACE
// ============================================================================
// First-stage engineering gate: User must select their vehicle type (Sedan,
// Hatchback, Crossover, SUV) to load its dedicated chassis platform, body
// cage, floor, wheel arches, hardpoints, and packaging envelopes BEFORE
// entering the Design Studio.
// ============================================================================

import React, { useState } from "react";
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

interface VehicleArchitectureStudioProps {
  onEnterDesignStudio?: () => void;
}

export const VehicleArchitectureStudio: React.FC<VehicleArchitectureStudioProps> = ({
  onEnterDesignStudio,
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
  const getArchitectureMetadataForSave = useVehicleArchitectureStore((s) => s.getArchitectureMetadataForSave);
  const setExteriorCategory = useExteriorAssemblyStore((s) => s.setVehicleCategory);

  const [activeDetailTab, setActiveDetailTab] = useState<"dimensions" | "envelopes" | "validation" | "outliner">("dimensions");
  const [selectedOutlinerCol, setSelectedOutlinerCol] = useState<OutlinerCollectionId>("01_Body_Main");
  const [testNodeQuery, setTestNodeQuery] = useState("GEO_Fender_Front.L");
  const [copiedScript, setCopiedScript] = useState(false);

  const outlinerScene = getVehicleOutlinerHierarchy(selectedCategory);
  const testValidationReport = validateOutlinerNodeName(testNodeQuery);

  const handleCopyBlenderScript = () => {
    const cmd = `python scripts/blender/setup_vehicle_outliner_hierarchy.py --category ${selectedCategory}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(cmd);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2500);
    }
  };

  const allArchitectures = getAllVehicleArchitectures();

  const handleCategorySelect = (cat: VehicleCategory) => {
    playHMITabSound();
    selectCategory(cat);
    setExteriorCategory(cat);
    const arch = getVehicleArchitecture(cat);
    updateVehicle({
      category: arch.id,
      architecture: arch.architectureClass,
      chassisArchId: arch.metadata.platformType,
      rideHeight: arch.rideHeightMm,
      wheelDiameter: arch.wheelDiameterInches,
    });
  };

  const handleLoadPackage = async () => {
    playHMIClickSound();
    const success = await loadEngineeringPackage();
    if (success) {
      // Sync into main vehicle simulation state
      updateVehicle({
        category: architecture.id,
        architecture: architecture.architectureClass,
        chassisArchId: architecture.metadata.platformType,
        rideHeight: architecture.rideHeightMm,
        wheelDiameter: architecture.wheelDiameterInches,
      });
      setExteriorCategory(architecture.id as VehicleCategory);
    }
  };

  const handleEnterDesignStudio = () => {
    playHMIClickSound();
    setExteriorCategory(selectedCategory);
    updateVehicle({
      category: architecture.id,
      architecture: architecture.architectureClass,
      chassisArchId: architecture.metadata.platformType,
      rideHeight: architecture.rideHeightMm,
      wheelDiameter: architecture.wheelDiameterInches,
    });
    if (onEnterDesignStudio) {
      onEnterDesignStudio();
    }
  };

  return (
    <div className="w-full space-y-5 text-slate-100 font-sans animate-stage-transition-enter">
      {/* ── 1. STUDIO HEADER & ARCHITECTURAL GUIDANCE ── */}
      <div className="panel p-5 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-amber-400" /> STAGE 01: ENGINEERING BASE
            </span>
            <span className="text-xs font-mono text-slate-500">· Modular Architecture Platform</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            VEHICLE ARCHITECTURE & ENGINEERING PLATFORM
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
            Select your vehicle category to initialize its dedicated structural chassis, body framework cage, 
            wheel arches, and hardpoints. Under no circumstances is a generic body stretched over an arbitrary chassis.
          </p>
        </div>

        {/* Load Package & Enter Studio Primary CTAs */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLoadPackage}
            disabled={isValidating}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border shadow-lg ${
              isPackageLoaded
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30"
                : "bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400 font-extrabold"
            }`}
          >
            {isValidating ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                VALIDATING...
              </span>
            ) : isPackageLoaded ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-400" />
                PACKAGE LOADED & VERIFIED
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
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-300 hover:brightness-110 cursor-pointer shadow-amber-500/25 active:scale-95 animate-pulse-subtle"
                : "bg-slate-800/60 text-slate-500 border-slate-700/60 cursor-not-allowed opacity-60"
            }`}
          >
            ENTER DESIGNING STUDIO
            <ArrowRight size={15} className="animate-pulse" />
          </button>
        </div>
      </div>

      {/* ── 2. FOUR VEHICLE CATEGORY SELECTOR CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {allArchitectures.map((arch) => {
          const isSelected = selectedCategory === arch.id;
          const displayBadge =
            arch.id === "sedan"
              ? "SEDAN • 3-BOX"
              : arch.id === "hatchback"
              ? "HATCHBACK • 2-BOX"
              : arch.id === "crossover"
              ? "CROSS • ELEVATED"
              : "SUV • HEAVY-DUTY";

          return (
            <button
              key={arch.id}
              onClick={() => handleCategorySelect(arch.id)}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between group cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-b from-amber-500/15 via-slate-900/90 to-slate-950 border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/50"
                  : "bg-slate-900/60 hover:bg-slate-850/80 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
            >
              {/* Category Top Banner */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      isSelected
                        ? "bg-amber-500 text-slate-950"
                        : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
                    }`}
                  >
                    {displayBadge}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400 font-bold">
                      <CheckCircle2 size={12} /> SELECTED
                    </span>
                  )}
                </div>

                <h2 className="text-base font-extrabold text-white group-hover:text-amber-200 transition-colors flex items-center gap-2">
                  {arch.id === "crossover" ? "Cross / Crossover" : arch.name}
                </h2>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {arch.description}
                </p>
              </div>

              {/* Architectural Key Proportions */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-1 text-[10px] font-mono">
                <div>
                  <span className="text-slate-500 block">WHEELBASE</span>
                  <span className="font-bold text-slate-200">{arch.wheelbaseMm}mm</span>
                </div>
                <div>
                  <span className="text-slate-500 block">HEIGHT</span>
                  <span className="font-bold text-slate-200">{arch.overallHeightMm}mm</span>
                </div>
                <div>
                  <span className="text-slate-500 block">CLEARANCE</span>
                  <span className="font-bold text-amber-400">{arch.rideHeightMm}mm</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── 3. MAIN DUAL-COLUMN WORKSPACE: 3D VIEWPORT & SPECS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Photorealistic 3D Architecture Viewport (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <VehicleArchitecture3DViewport />
        </div>

        {/* Right Column: Engineering Specification & Pre-Flight Validation (5 Cols) */}
        <div className="lg:col-span-5 panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-xl space-y-4">
          {/* Sub-Tabs: Dimensions vs Envelopes vs Validation */}
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
            {(
              [
                { id: "dimensions", label: "Dimensions", icon: <Ruler size={12} /> },
                { id: "envelopes", label: "Packaging Envelopes", icon: <Box size={12} /> },
                { id: "validation", label: "Asset Verification", icon: <ShieldCheck size={12} /> },
                { id: "outliner", label: "Outliner & Modifiers", icon: <FolderTree size={12} /> },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  playHMIClickSound();
                  setActiveDetailTab(t.id);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
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

          {/* TAB 1: DIMENSIONS SPECIFICATION */}
          {activeDetailTab === "dimensions" && (
            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Wheelbase</span>
                  <strong className="text-sm text-slate-200">{architecture.wheelbaseMm} mm</strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Axle-to-Axle Spacing</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Track Width (F/R)</span>
                  <strong className="text-sm text-slate-200">{architecture.trackFrontMm} / {architecture.trackRearMm} mm</strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Lateral Stance</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Overall Length</span>
                  <strong className="text-sm text-slate-200">{architecture.overallLengthMm} mm</strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Fascia to Fascia</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Overall Width</span>
                  <strong className="text-sm text-slate-200">{architecture.overallWidthMm} mm</strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Body Moldings Width</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Overall Roof Height</span>
                  <strong className="text-sm text-slate-200">{architecture.overallHeightMm} mm</strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Ground to Crown</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Ride Height</span>
                  <strong className="text-sm text-amber-400">{architecture.rideHeightMm} mm</strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Ground Clearance</span>
                </div>
              </div>

              {/* Overhangs and Wheel Fitment */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Front Overhang:</span>
                  <span className="text-slate-200 font-bold">{architecture.frontOverhangMm} mm</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Rear Overhang:</span>
                  <span className="text-slate-200 font-bold">{architecture.rearOverhangMm} mm</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Base Wheel Diameter:</span>
                  <span className="text-slate-200 font-bold">{architecture.wheelDiameterInches}"</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Target Torsional Rigidity:</span>
                  <span className="text-amber-400 font-bold">{architecture.metadata.targetTorsionalRigidityKNmDeg} kNm/deg</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Nominal Curb Weight:</span>
                  <span className="text-slate-200 font-bold">{architecture.metadata.nominalCurbWeightKg} kg</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PACKAGING ENVELOPES */}
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

          {/* TAB 3: ASSET VERIFICATION & QUALITY GATE */}
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

          {/* TAB 4: OUTLINER HIERARCHY & NAMING CONVENTIONS */}
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

                {/* Summary Metrics */}
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
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1.5 ${
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
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {activeCol.nodes.map((node) => (
                        <div
                          key={node.name}
                          className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-between text-[11px] hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Prefix Badge */}
                            <span className={`px-1 py-0.5 rounded text-[9px] font-bold ${
                              node.prefix === "REF"
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                : node.prefix === "COL"
                                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}>
                              {node.prefix}
                            </span>

                            {/* Node Name */}
                            <span className="font-bold text-slate-200 truncate">{node.name}</span>

                            {/* Side badge */}
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
                            {/* Mirror modifier badge */}
                            {node.hasMirrorModifier && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40 flex items-center gap-1">
                                <Split size={9} />
                                Mirror (0,0,0)
                              </span>
                            )}

                            {/* Panel seam vertex groups badge */}
                            {node.panelSeamGroups && node.panelSeamGroups.length > 0 && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 flex items-center gap-1">
                                <Tag size={9} />
                                {node.panelSeamGroups.length} Seams
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Practical Modeling Rules Banner */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-[11px] text-slate-400">
                <div className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  PRACTICAL AUTOMOTIVE MODELING RULES:
                </div>
                <ul className="space-y-1 list-disc list-inside text-[10px]">
                  <li>
                    <strong className="text-slate-200">Shared Modifiers:</strong> Keep left side (<code className="text-cyan-300">.L</code>) as primary active modeling mesh with Mirror Modifier targeting Empty origin at <code className="text-amber-300">(0,0,0)</code>.
                  </li>
                  <li>
                    <strong className="text-slate-200">Panel Seam Vertex Groups:</strong> Align shared edge loops across adjacent panels using <code className="text-amber-300">VG_PanelSeam_*</code> vertex groups for smooth panel gap continuity.
                  </li>
                  <li>
                    <strong className="text-slate-200">Material-Driven Collections:</strong> Transparent greenhouse glass is grouped in <code className="text-cyan-300">03_Glass_Greenhouse</code> for rapid alpha toggling and multi-pass GLB exports.
                  </li>
                </ul>
              </div>

              {/* Interactive Naming Convention Sandbox */}
              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs">
                    NAMING CONVENTION VALIDATOR SANDBOX
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    [Asset]_[Category]_[PartName]_[SubPart]_[Side]
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testNodeQuery}
                    onChange={(e) => setTestNodeQuery(e.target.value)}
                    placeholder="e.g., GEO_Fender_Front.L"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Preset Testing Pills */}
                <div className="flex flex-wrap gap-1">
                  {[
                    "GEO_Hood",
                    "GEO_Fender_Front.L",
                    "GEO_Door_Front.L",
                    "GEO_Windshield",
                    "COL_Bumper_Front",
                    "REF_Blueprint_Top",
                  ].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setTestNodeQuery(preset)}
                      className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 text-[9px]"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Validation Result Box */}
                {testValidationReport.parsed && (
                  <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1 text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300">PARSED SPECIFICATION:</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold ${
                        testValidationReport.isValid ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                      }`}>
                        {testValidationReport.isValid ? "✓ COMPLIANT" : "✗ ISSUES DETECTED"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-slate-400">
                      <div>Prefix: <strong className="text-slate-200">{testValidationReport.parsed.prefix}</strong></div>
                      <div>Target Collection: <strong className="text-amber-300">{testValidationReport.parsed.collectionId}</strong></div>
                      <div>Side: <strong className="text-cyan-300">{testValidationReport.parsed.side} ({testValidationReport.parsed.symmetryNotation})</strong></div>
                      <div>Shader: <strong className="text-blue-300">{testValidationReport.parsed.shaderPass}</strong></div>
                      <div>GLB Export: <strong className={testValidationReport.parsed.isGlbExportable ? "text-emerald-400" : "text-slate-500"}>
                        {testValidationReport.parsed.isGlbExportable ? "Included" : "Excluded"}
                      </strong></div>
                      <div>Mirror Target: <strong className="text-purple-300">{testValidationReport.parsed.mirrorTarget || "None"}</strong></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Copy Blender Setup Script Button */}
              <button
                onClick={handleCopyBlenderScript}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-300 flex items-center justify-center gap-2 text-xs font-mono font-bold transition-all shadow-sm"
              >
                {copiedScript ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedScript ? "BLENDER COMMAND COPIED!" : `COPY BLENDER SCRIPT COMMAND (${selectedCategory.toUpperCase()})`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
