// ============================================================================
// AERO STUDIO CONTROL DECK
// ============================================================================
// Precision interactive control deck for tuning all aerodynamic subassemblies.
// Standardized on enclosed rounded option stepper boxes (< [Value] > (i))
// matching the authentic application UI design system, with live mechanical
// hinge pivot transforms and surrogate CFD aerodynamics telemetry.
// ============================================================================

import React, { useState, useMemo, useEffect } from "react";
import {
  Wind,
  Gauge,
  Zap,
  Flame,
  Layers,
  Activity,
  Sparkles,
  Info,
  X,
  Compass,
  CircleDot,
  Car,
  Wrench,
  Shield,
  CheckCircle2,
  ChevronRight,
  Sliders,
} from "lucide-react";
import {
  useAeroStudioStore,
  AeroStudioSubTab,
  AeroComponentId,
  VehicleArchitecture,
  VEHICLE_ARCHITECTURES,
} from "../../state/aeroStudioStore";
import { useModularVehicleBuilderStore } from "../../state/modularVehicleBuilderStore";
import { AeroPackagePresetId } from "../../sim/aerodynamics/aeroStudioTypes";
import { calculateHypercarActiveAero } from "../../sim/modularVehicle/vehicleFamilyArchitecture";
import { playHMIClickSound } from "../../utils/hmiSoundSynth";

// Option interface for generic stepper
export interface AeroOption<T> {
  value: T;
  label: string;
}

interface AeroOptionStepperBoxProps<T> {
  label: string;
  value: T;
  options: AeroOption<T>[];
  onChange: (val: T) => void;
  infoTitle?: string;
  infoDesc?: string;
  proTip?: string;
  onInfoClick?: (info: { title: string; desc: string; proTip: string }) => void;
  isNumeric?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

/**
 * Standardized AeroOptionStepperBox
 * Renders an enclosed card with:
 * [ Feature Label ] [ ‹ ] [ Centered Option Pill / Direct Numeric Entry ] [ › ] [ (i) ]
 * Exactly matching the rest of the application UI with synchronized numerical entry.
 */
function AeroOptionStepperBox<T>({
  label,
  value,
  options,
  onChange,
  infoTitle,
  infoDesc,
  proTip,
  onInfoClick,
  isNumeric,
  min,
  max,
  step,
}: AeroOptionStepperBoxProps<T>) {
  const [animTrigger, setAnimTrigger] = useState<number>(0);
  const [isEditingNumeric, setIsEditingNumeric] = useState<boolean>(false);
  const [numericInputText, setNumericInputText] = useState<string>(String(value));

  // Keep input text synced when value changes from outside
  useEffect(() => {
    setNumericInputText(String(value));
  }, [value]);

  // Find exact matching index or nearest numeric option
  const activeIndex = useMemo(() => {
    const exact = options.findIndex((opt) => opt.value === value);
    if (exact !== -1) return exact;
    if (typeof value === "number") {
      let closestIdx = 0;
      let minDiff = Infinity;
      options.forEach((opt, idx) => {
        if (typeof opt.value === "number") {
          const diff = Math.abs(opt.value - value);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = idx;
          }
        }
      });
      return closestIdx;
    }
    return 0;
  }, [options, value]);

  const currentOption = options[activeIndex] || options[0];

  const handleStep = (direction: 1 | -1) => {
    setAnimTrigger((prev) => prev + 1);
    const nextIdx = (activeIndex + direction + options.length) % options.length;
    onChange(options[nextIdx].value);
  };

  const commitNumericInput = () => {
    setIsEditingNumeric(false);
    const parsed = parseFloat(numericInputText);
    if (!isNaN(parsed)) {
      let clamped = parsed;
      if (min !== undefined) clamped = Math.max(min, clamped);
      if (max !== undefined) clamped = Math.min(max, clamped);
      onChange(clamped as unknown as T);
    } else {
      setNumericInputText(String(value));
    }
  };

  const hasInfo = Boolean(infoTitle || infoDesc || proTip);

  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl transition-all shadow-sm group border bg-slate-800/60 hover:bg-slate-800/90 border-slate-700/60 hover:border-cyan-500/30">
      <span
        className="text-[12px] font-bold tracking-tight flex-1 pr-2 truncate text-slate-200"
        title={label}
      >
        {label}
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          className="w-7 h-7 rounded-lg font-extrabold text-base flex items-center justify-center transition-all shadow-sm active:scale-90 cursor-pointer border bg-slate-700/80 hover:bg-cyan-600 active:bg-cyan-700 border-slate-600 hover:border-cyan-400 text-slate-200 hover:text-white"
          onClick={() => handleStep(-1)}
          aria-label={`Previous ${label}`}
          type="button"
        >
          ‹
        </button>

        {isEditingNumeric ? (
          <input
            type="number"
            autoFocus
            step={step || 1}
            min={min}
            max={max}
            value={numericInputText}
            onChange={(e) => setNumericInputText(e.target.value)}
            onBlur={commitNumericInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitNumericInput();
              if (e.key === "Escape") setIsEditingNumeric(false);
            }}
            className="text-[11px] font-mono font-bold w-[130px] text-center px-2 py-1 rounded-lg bg-slate-950 border border-cyan-400 text-cyan-300 outline-none shadow-inner"
          />
        ) : (
          <span
            key={animTrigger}
            onClick={() => {
              if (typeof value === "number" || isNumeric) {
                setIsEditingNumeric(true);
              }
            }}
            className={`text-[11px] font-mono font-bold min-w-[125px] max-w-[175px] text-center px-2 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-cyan-300 truncate shadow-inner select-none animate-in fade-in zoom-in-95 duration-100 ${
              typeof value === "number" || isNumeric
                ? "cursor-text hover:border-cyan-500/60 hover:text-cyan-200"
                : ""
            }`}
            title={
              typeof value === "number" || isNumeric
                ? `${currentOption.label} (Click to type exact numerical value)`
                : currentOption.label
            }
          >
            {currentOption.label}
          </span>
        )}

        <button
          className="w-7 h-7 rounded-lg font-extrabold text-base flex items-center justify-center transition-all shadow-sm active:scale-90 cursor-pointer border bg-slate-700/80 hover:bg-cyan-600 active:bg-cyan-700 border-slate-600 hover:border-cyan-400 text-slate-200 hover:text-white"
          onClick={() => handleStep(1)}
          aria-label={`Next ${label}`}
          type="button"
        >
          ›
        </button>
        {hasInfo && (
          <button
            className="w-6 h-6 rounded-lg transition-all flex items-center justify-center cursor-pointer text-xs text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50"
            onClick={() => {
              if (onInfoClick) {
                onInfoClick({
                  title: infoTitle || label,
                  desc: infoDesc || "Parametric aerodynamic control parameter.",
                  proTip:
                    proTip ||
                    "Optimizes aerodynamic efficiency and vehicle downforce balance.",
                });
              }
            }}
            aria-label={`Info about ${label}`}
            type="button"
            title="View engineering rationale"
          >
            <Info size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

export const AeroControlDeck: React.FC = () => {
  const activeSubTab = useAeroStudioStore((s) => s.activeSubTab);
  const setActiveSubTab = useAeroStudioStore((s) => s.setActiveSubTab);
  const selectedComponent = useAeroStudioStore((s) => s.selectedComponent);
  const config = useAeroStudioStore((s) => s.config);
  const physics = useAeroStudioStore((s) => s.physics);
  const inspectionExplodedPct = useAeroStudioStore((s) => s.inspectionExplodedPct);
  const activeAeroDeploymentPct = useAeroStudioStore((s) => s.activeAeroDeploymentPct);
  const canardTierCount = useAeroStudioStore((s) => s.canardTierCount);
  const wheelAeroDiscsInstalled = useAeroStudioStore((s) => s.wheelAeroDiscsInstalled);
  const splitterTieRodsVisible = useAeroStudioStore((s) => s.splitterTieRodsVisible);
  const isolatedComponentView = useAeroStudioStore((s) => s.isolatedComponentView);
  const rearWingPylonStyle = useAeroStudioStore((s) => s.rearWingPylonStyle);
  const vehicleVariant = useAeroStudioStore((s) => s.vehicleVariant);
  const setVehicleVariant = useAeroStudioStore((s) => s.setVehicleVariant);
  const modularModel = useModularVehicleBuilderStore((s) => s.selectedModel);

  // Hypercar Active Aero & Architecture state (from Modular Vehicle Builder)
  const activeWingAngleDeg = useModularVehicleBuilderStore((s) => s.activeWingAngleDeg);
  const drsActive = useModularVehicleBuilderStore((s) => s.drsActive);
  const setActiveWingAngle = useModularVehicleBuilderStore((s) => s.setActiveWingAngle);
  const setDrsActive = useModularVehicleBuilderStore((s) => s.setDrsActive);
  const chassisArch = useModularVehicleBuilderStore((s) => s.chassisArch);
  const materialGrade = useModularVehicleBuilderStore((s) => s.materialGrade);
  const setChassisArch = useModularVehicleBuilderStore((s) => s.setChassisArch);
  const setMaterialGrade = useModularVehicleBuilderStore((s) => s.setMaterialGrade);

  const hypercarAero = useMemo(() => {
    return calculateHypercarActiveAero(activeWingAngleDeg, drsActive);
  }, [activeWingAngleDeg, drsActive]);

  const rearSpoilerAngleDeg = useAeroStudioStore((s) => s.rearSpoilerAngleDeg);
  const rearSpoilerHeightMm = useAeroStudioStore((s) => s.rearSpoilerHeightMm);
  const rearSpoilerWidthMm = useAeroStudioStore((s) => s.rearSpoilerWidthMm);
  const rearSpoilerGurneyMm = useAeroStudioStore((s) => s.rearSpoilerGurneyMm);
  const underbodyTunnelDepthMm = useAeroStudioStore((s) => s.underbodyTunnelDepthMm);
  const underbodyFloorStrakeCount = useAeroStudioStore((s) => s.underbodyFloorStrakeCount);

  // Actions
  const setSelectedComponent = useAeroStudioStore((s) => s.setSelectedComponent);
  const setPreset = useAeroStudioStore((s) => s.setPreset);
  const setAirspeedKmh = useAeroStudioStore((s) => s.setAirspeedKmh);
  const setInspectionExplodedPct = useAeroStudioStore((s) => s.setInspectionExplodedPct);
  const setIsolatedComponentView = useAeroStudioStore((s) => s.setIsolatedComponentView);

  // Parametric setters
  const updateRearWingAngle = useAeroStudioStore((s) => s.updateRearWingAngle);
  const updateRearWingHeight = useAeroStudioStore((s) => s.updateRearWingHeight);
  const updateRearWingWidth = useAeroStudioStore((s) => s.updateRearWingWidth);
  const updateRearWingFlapAngle = useAeroStudioStore((s) => s.updateRearWingFlapAngle);
  const updateRearWingGurney = useAeroStudioStore((s) => s.updateRearWingGurney);

  const updateRearSpoilerAngle = useAeroStudioStore((s) => s.updateRearSpoilerAngle);
  const updateRearSpoilerHeight = useAeroStudioStore((s) => s.updateRearSpoilerHeight);
  const updateRearSpoilerWidth = useAeroStudioStore((s) => s.updateRearSpoilerWidth);
  const updateRearSpoilerGurney = useAeroStudioStore((s) => s.updateRearSpoilerGurney);

  const updateFrontSplitterExtension = useAeroStudioStore((s) => s.updateFrontSplitterExtension);
  const updateFrontSplitterAngle = useAeroStudioStore((s) => s.updateFrontSplitterAngle);
  const updateFrontSplitterRideHeight = useAeroStudioStore((s) => s.updateFrontSplitterRideHeight);

  const updateCanardsAngle = useAeroStudioStore((s) => s.updateCanardsAngle);
  const updateCanardTierCount = useAeroStudioStore((s) => s.updateCanardTierCount);

  const updateSideSkirtsExtension = useAeroStudioStore((s) => s.updateSideSkirtsExtension);
  const updateSideSkirtsClearance = useAeroStudioStore((s) => s.updateSideSkirtsClearance);

  const updateDiffuserAngle = useAeroStudioStore((s) => s.updateDiffuserAngle);
  const updateDiffuserStrakeCount = useAeroStudioStore((s) => s.updateDiffuserStrakeCount);
  const updateDiffuserExpansionLength = useAeroStudioStore((s) => s.updateDiffuserExpansionLength);

  const updateUnderbodyTunnelDepth = useAeroStudioStore((s) => s.updateUnderbodyTunnelDepth);
  const updateUnderbodyFloorStrakeCount = useAeroStudioStore((s) => s.updateUnderbodyFloorStrakeCount);

  const updateActiveAeroDeployment = useAeroStudioStore((s) => s.updateActiveAeroDeployment);
  const updateRoofSharkFinHeight = useAeroStudioStore((s) => s.updateRoofSharkFinHeight);
  const updateCoolingLouversPct = useAeroStudioStore((s) => s.updateCoolingLouversPct);
  const updateWheelAeroDiscs = useAeroStudioStore((s) => s.updateWheelAeroDiscs);

  // Info Modal state
  const [selectedInfo, setSelectedInfo] = useState<{
    title: string;
    desc: string;
    proTip: string;
  } | null>(null);

  // Active Preset ID detection
  const currentPresetId: AeroPackagePresetId = useMemo(() => {
    if (config.rearWing.angleOfAttackDeg <= 4) return "low_drag_speed";
    if (config.diffuser.rampAngleDeg >= 20) return "extreme_ground_effect";
    if (config.rearWing.angleOfAttackDeg >= 22) return "high_downforce_sprint";
    return "balanced_gt";
  }, [config]);

  // Derive front splitter extension from mainChord
  const splitterExtensionMm = Math.round(config.frontWing.mainChordMm - 240);

  // Vehicle Variant Architecture Options (Section 40)
  const ARCHITECTURE_OPTIONS: AeroOption<VehicleArchitecture>[] = useMemo(
    () =>
      Object.values(VEHICLE_ARCHITECTURES).map((arch) => ({
        value: arch.id,
        label: `${arch.label} (${arch.badge})`,
      })),
    []
  );

  // Global Presets Options
  const PRESET_OPTIONS: AeroOption<AeroPackagePresetId>[] = [
    { value: "low_drag_speed", label: "Low Drag (Monza)" },
    { value: "balanced_gt", label: "Balanced GT (Spa)" },
    { value: "high_downforce_sprint", label: "High Downforce (Monaco)" },
    { value: "extreme_ground_effect", label: "Ground Effect (Attack)" },
  ];

  // Exploded View Options
  const EXPLODED_OPTIONS: AeroOption<number>[] = [
    { value: 0.0, label: "0% (Assembled)" },
    { value: 0.25, label: "25% (Mild Spread)" },
    { value: 0.50, label: "50% (Hardpoint CAD)" },
    { value: 0.75, label: "75% (Expanded)" },
    { value: 1.0, label: "100% (Full Explode)" },
  ];

  // Bodywork Visibility Options
  const VISIBILITY_OPTIONS: AeroOption<boolean>[] = [
    { value: false, label: "Full Vehicle Assembly" },
    { value: true, label: "Isolated Aero Only" },
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 1. Master Telemetry Banner & Aero Balance Visualization Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Aero Balance Visual Gauge */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-cyan-400" />
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Aero Balance Split
              </span>
            </div>
            <div className="font-mono text-xs font-bold text-cyan-300">
              {physics.aeroBalanceFrontPct.toFixed(1)}% Front /{" "}
              {(100 - physics.aeroBalanceFrontPct).toFixed(1)}% Rear
            </div>
          </div>

          {/* Dual Bar Graphic */}
          <div className="relative w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-200"
              style={{ width: `${physics.aeroBalanceFrontPct}%` }}
            />
            {/* Target 45/55 balance indicator line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
              style={{ left: "45%" }}
              title="Target 45% Neutral Balance"
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>Front Axle: {physics.frontDownforceN.toFixed(0)} N</span>
            <span className="text-amber-400/80 font-semibold">45% Target</span>
            <span>Rear Axle: {physics.rearDownforceN.toFixed(0)} N</span>
          </div>
        </div>

        {/* Downforce & Drag Telemetry Card */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Total Downforce @ {config.airspeedKmh} km/h
            </span>
            <div className="text-2xl font-black text-cyan-400 font-mono tracking-tight mt-0.5">
              {physics.totalDownforceN.toFixed(0)}{" "}
              <span className="text-xs font-normal text-slate-400">N</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {(physics.totalDownforceN / 9.80665).toFixed(0)} kgf downforce
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Aero Drag</span>
            <div className="text-2xl font-black text-rose-400 font-mono tracking-tight mt-0.5">
              {physics.totalDragN.toFixed(0)}{" "}
              <span className="text-xs font-normal text-slate-400">N</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">Cd: {physics.totalCd.toFixed(3)}</span>
          </div>
        </div>

        {/* Aerodynamic Efficiency & Top Speed */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Aero Efficiency (L/D)</span>
            <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight mt-0.5">
              {physics.liftToDragRatio.toFixed(2)}:1
            </div>
            <span className="text-xs text-emerald-400/80 font-mono">
              Cl: {physics.totalCl.toFixed(3)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Est. Top Speed</span>
            <div className="text-2xl font-black text-amber-400 font-mono tracking-tight mt-0.5">
              {physics.lapSimulation.topSpeedKmh.toFixed(0)}{" "}
              <span className="text-xs font-normal text-slate-400">km/h</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {physics.lapSimulation.lateralGAt200Kmh.toFixed(2)} Max G
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top-Level Option Stepper Boxes (Continuous CAD Host, Presets, Exploded CAD View, Bodywork Visibility) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-[#0c1322] via-[#09101d] to-[#080d16] p-3 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Car size={13} className="text-cyan-400" />
              CAD Twin Host
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-extrabold uppercase tracking-wider">
              ✓ CONTINUED
            </span>
          </div>
          <div className="my-1.5">
            <div className="text-sm font-black font-mono text-white tracking-wider flex items-center gap-2">
              <span className="text-cyan-300">{(modularModel || vehicleVariant || "sedan").toUpperCase()}</span>
              <span className="text-slate-500 text-xs font-normal">SPEC</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Unified vehicle continues directly from Vehicle Studio CAD
            </p>
          </div>
          <div className="text-[9px] font-mono text-cyan-400/70 flex items-center gap-1 border-t border-slate-800/80 pt-1.5">
            <Layers size={10} />
            <span>Zero-offset snapping • Single GLB pipeline</span>
          </div>
        </div>

        <AeroOptionStepperBox
          label="Aero Package Preset"
          value={currentPresetId}
          options={PRESET_OPTIONS}
          onChange={(val) => setPreset(val)}
          infoTitle="Aero Package Setup Preset"
          infoDesc="Factory-calibrated aerodynamic trimming packages tailored for specific circuit topologies and terminal velocity requirements."
          proTip="Balanced GT is optimized for mixed mid-speed sweeps and heavy braking stability."
          onInfoClick={setSelectedInfo}
        />

        <AeroOptionStepperBox
          label="Exploded CAD Inspection"
          value={inspectionExplodedPct}
          options={EXPLODED_OPTIONS}
          onChange={(val) => setInspectionExplodedPct(val)}
          infoTitle="Exploded View Inspection Mode"
          infoDesc="Translates aerodynamic components outward along their mounting normal vectors to inspect brackets, pylons, and fasteners."
          proTip="Use 50% exploded view to inspect swan-neck pylon mounting hardpoints on the rear decklid."
          onInfoClick={setSelectedInfo}
        />

        <AeroOptionStepperBox
          label="Bodywork Visibility"
          value={isolatedComponentView}
          options={VISIBILITY_OPTIONS}
          onChange={(val) => setIsolatedComponentView(val)}
          infoTitle="Bodywork & Chassis Visibility"
          infoDesc="Isolates the carbon aerodynamic surfaces or renders them in context with the full host vehicle bodywork and monocoque."
          proTip="Toggle to Isolated Aero to see raw airflow suction channels beneath the vehicle."
          onInfoClick={setSelectedInfo}
        />
      </div>

      {/* 3. Sub-Tab Specific Parameter Control Deck (Enclosed Stepper Boxes) */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-2xl">
        {/* FRONT AERO SUB-TAB */}
        {activeSubTab === "frontAero" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Wind size={16} className="text-cyan-400" />
                  Front Aerodynamics Inspection
                </h3>
                <p className="text-xs text-slate-400">
                  Controls front-axle downforce, stagnation pressure wedge, and turbulent tire wake deflection.
                </p>
              </div>

              {/* Front Aero Sub-Component Selector */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 w-fit">
                <button
                  onClick={() => setSelectedComponent("frontSplitter")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedComponent === "frontSplitter"
                      ? "bg-cyan-500 text-slate-950 shadow-sm font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Front Carbon Splitter
                </button>
                <button
                  onClick={() => setSelectedComponent("canards")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedComponent === "canards"
                      ? "bg-cyan-500 text-slate-950 shadow-sm font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Canard Dive Planes
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedComponent === "frontSplitter" ? (
                <>
                  <AeroOptionStepperBox
                    label="Front Splitter Extension"
                    value={splitterExtensionMm}
                    isNumeric
                    min={10}
                    max={250}
                    step={10}
                    options={[
                      { value: 20, label: "20 mm (Street)" },
                      { value: 60, label: "60 mm (Club Sport)" },
                      { value: 100, label: "100 mm (FIA GT3)" },
                      { value: 140, label: "140 mm (Endurance)" },
                      { value: 180, label: "180 mm (Time Attack)" },
                      { value: 220, label: "220 mm (Pikes Peak)" },
                    ]}
                    onChange={(val) => updateFrontSplitterExtension(val)}
                    infoTitle="Front Splitter Extension"
                    infoDesc="Longitudinal protrusion of the carbon blade forward of the front fascia. Creates high static stagnation pressure on top surface."
                    proTip="100 mm extension provides optimal 45% front aero balance without excessive pitch sensitivity over curb strikes."
                    onInfoClick={setSelectedInfo}
                  />

                  <AeroOptionStepperBox
                    label="Splitter Ground Clearance"
                    value={config.frontWing.rideHeightMm}
                    isNumeric
                    min={20}
                    max={150}
                    step={5}
                    options={[
                      { value: 30, label: "30 mm (Slammed Track)" },
                      { value: 45, label: "45 mm (GT3 Circuit)" },
                      { value: 60, label: "60 mm (Balanced Track)" },
                      { value: 80, label: "80 mm (Sport Road)" },
                      { value: 100, label: "100 mm (Street Clearance)" },
                      { value: 120, label: "120 mm (High Clearance)" },
                    ]}
                    onChange={(val) => updateFrontSplitterRideHeight(val)}
                    infoTitle="Splitter Ground Clearance"
                    infoDesc="Ride height gap between track asphalt and the lower carbon undertray blade. Governs ground effect venturi inlet velocity."
                    proTip="Lowering clearance from 80mm to 45mm increases front suction downforce by over 40%."
                    onInfoClick={setSelectedInfo}
                  />

                  <AeroOptionStepperBox
                    label="Splitter Pitch Angle"
                    value={Math.round(config.frontWing.flapAngleDeg * 0.5 * 2) / 2}
                    isNumeric
                    min={-4}
                    max={12}
                    step={0.5}
                    options={[
                      { value: -2, label: "-2.0° (High Velocity)" },
                      { value: 0, label: "0.0° (Neutral Flat)" },
                      { value: 2, label: "+2.0° (Moderate Stagnation)" },
                      { value: 4, label: "+4.0° (Aggressive Rake)" },
                      { value: 7, label: "+7.0° (High Downforce)" },
                      { value: 10, label: "+10.0° (Maximum Wedge)" },
                    ]}
                    onChange={(val) => updateFrontSplitterAngle(val)}
                    infoTitle="Splitter Angle / Pitch"
                    infoDesc="Leading blade inclination angle relative to chassis horizontal datum. Negative pitch promotes high velocity underfloor entry."
                    proTip="A +4.0° pitch angle creates a low-pressure wedge underneath that energizes front underfloor tunnels."
                    onInfoClick={setSelectedInfo}
                  />

                  <AeroOptionStepperBox
                    label="Titanium Support Tie-Rods"
                    value={splitterTieRodsVisible}
                    options={[
                      { value: true, label: "Installed (Rigid Turnbuckles)" },
                      { value: false, label: "Removed (Clean Flush Mount)" },
                    ]}
                    onChange={(val) => {
                      useAeroStudioStore.setState({ splitterTieRodsVisible: val });
                    }}
                    infoTitle="Titanium Splitter Tie-Rods"
                    infoDesc="Structural turnbuckles with spherical rod ends bracing the leading carbon blade against aerodynamic deflection."
                    proTip="At speeds exceeding 250 km/h, aero load on the splitter exceeds 2,500 N; tie-rods prevent blade flutter."
                    onInfoClick={setSelectedInfo}
                  />

                  <AeroOptionStepperBox
                    label="Carbon Endplate Winglets"
                    value="vertical_fences"
                    options={[
                      { value: "vertical_fences", label: "Vertical Aerofoil Winglets" },
                      { value: "curved_strakes", label: "Curved Outer Spill Fences" },
                    ]}
                    onChange={() => {}}
                    infoTitle="Splitter Endplate Winglets"
                    infoDesc="Vertical carbon fences at outer edges preventing high pressure from spilling off the sides."
                    proTip="Winglets isolate the stagnation air pocket, boosting effective splitter area by 12%."
                    onInfoClick={setSelectedInfo}
                  />
                </>
              ) : (
                <>
                  <AeroOptionStepperBox
                    label="Canards Angle of Attack (AoA)"
                    value={config.canards.incidenceDeg}
                    isNumeric
                    min={2}
                    max={35}
                    step={1}
                    options={[
                      { value: 5, label: "5° (Low Drag Stream)" },
                      { value: 10, label: "10° (Mild Vortex)" },
                      { value: 15, label: "15° (Standard GT3)" },
                      { value: 20, label: "20° (High Downforce)" },
                      { value: 25, label: "25° (Heavy Vortex)" },
                      { value: 30, label: "30° (Maximum Dive)" },
                    ]}
                    onChange={(val) => updateCanardsAngle(val)}
                    infoTitle="Canard Dive Planes AoA"
                    infoDesc="Inclination angle of the dive planes mounted on the front bumper corners. Sheds longitudinal vortices along the flanks."
                    proTip="Canard vortices shield the underfloor from turbulent front tire wake, preserving diffuser efficiency."
                    onInfoClick={setSelectedInfo}
                  />

                  <AeroOptionStepperBox
                    label="Canard Cascade Tier Count"
                    value={canardTierCount}
                    options={[
                      { value: 1, label: "Single Tier Dive Plane" },
                      { value: 2, label: "Dual Stacked Dive Planes" },
                      { value: 3, label: "Triple Cascade Planes" },
                    ]}
                    onChange={(val) => updateCanardTierCount(val as 1 | 2 | 3)}
                    infoTitle="Canard Cascade Architecture"
                    infoDesc="Number of vertically stacked aerodynamic dive planes mounted on each front bumper flank."
                    proTip="Dual stacked planes generate counter-rotating vortex pairs that actively evacuate wheel well air."
                    onInfoClick={setSelectedInfo}
                  />

                  <AeroOptionStepperBox
                    label="Canard Mount Bracket Style"
                    value="billet"
                    options={[
                      { value: "billet", label: "CNC Billet Flange Mount" },
                      { value: "quick_release", label: "FIA Quick-Release Carbon Tabs" },
                    ]}
                    onChange={() => {}}
                    infoTitle="Canard Mounting Hardpoints"
                    infoDesc="Structural fastening hardware connecting dive planes directly into bumper crash structure."
                    proTip="Direct bumper spine mounting prevents aerodynamic deformation under high downforce."
                    onInfoClick={setSelectedInfo}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* REAR AERO SUB-TAB */}
        {activeSubTab === "rearAero" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Wind size={16} className="text-cyan-400" />
                  Rear Aerodynamics & Downforce Controls
                </h3>
                <p className="text-xs text-slate-400">
                  Interactive real-time 3D aerodynamic surfaces rotating around genuine mechanical hinge pivots.
                </p>
              </div>

              {/* Rear Aero Component Switcher (Section 6 & 9) */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 w-fit">
                <button
                  onClick={() => setSelectedComponent("rearWing")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedComponent === "rearWing"
                      ? "bg-cyan-500 text-slate-950 shadow-sm font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Dual-Element Rear Wing
                </button>
                <button
                  onClick={() => setSelectedComponent("rearSpoiler")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedComponent === "rearSpoiler"
                      ? "bg-cyan-500 text-slate-950 shadow-sm font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Pedestal Rear Spoiler
                </button>
              </div>
            </div>

            {/* Quick Access to Hypercar Active Aero Dynamics Controller */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-slate-900/60 border border-cyan-500/30 flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <Zap size={14} className="text-purple-400 animate-pulse" />
                <span className="text-slate-300 font-semibold">Hypercar Active Aero & DRS Controller:</span>
                <span className="text-cyan-300 font-mono font-bold">{activeWingAngleDeg > 0 ? "+" : ""}{activeWingAngleDeg}°</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${drsActive ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" : "bg-slate-800 text-slate-400"}`}>
                  {drsActive ? "DRS OPEN (LOW DRAG)" : "DRS CLOSED"}
                </span>
                <span className="text-emerald-400 font-mono text-[11px] ml-2">Downforce: {hypercarAero.downforceKgAt250Kmh} kg</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  playHMIClickSound();
                  setActiveSubTab("activeAero");
                }}
                className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer transition-colors"
              >
                <span>OPEN ACTIVE AERO DECK</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {selectedComponent === "rearWing" ? (
              /* DUAL-ELEMENT REAR WING CONTROLS */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <AeroOptionStepperBox
                  label="Main Wing Angle of Attack (AoA)"
                  value={Math.round(config.rearWing.angleOfAttackDeg)}
                  isNumeric
                  min={0}
                  max={35}
                  step={1}
                  options={[
                    { value: 0, label: "0° (Monza Low Drag)" },
                    { value: 6, label: "6° (Mild Downforce)" },
                    { value: 12, label: "12° (Balanced GT3)" },
                    { value: 18, label: "18° (High Downforce / Spa)" },
                    { value: 24, label: "24° (Sprint Attack)" },
                    { value: 30, label: "30° (Monaco Maximum)" },
                  ]}
                  onChange={(val) => updateRearWingAngle(val)}
                  infoTitle="Main Wing Angle of Attack"
                  infoDesc="Primary aerofoil pitch relative to freestream air. Physical 3D mesh rotates dynamically on mechanical pivot hinge pins."
                  proTip="12° to 18° is the ideal operating regime for maximum lift-to-drag ratio (L/D) on road circuits."
                  onInfoClick={setSelectedInfo}
                />

                <AeroOptionStepperBox
                  label="Slotted Upper Element Flap AoA"
                  value={Math.round(config.rearWing.angleOfAttackDeg * 1.3)}
                  isNumeric
                  min={0}
                  max={45}
                  step={1}
                  options={[
                    { value: 0, label: "0° (Flat Slotted Profile)" },
                    { value: 8, label: "8° (Gentle Slot Camber)" },
                    { value: 16, label: "16° (High Camber Slot)" },
                    { value: 24, label: "24° (Aggressive High Lift)" },
                    { value: 32, label: "32° (Maximum Downforce)" },
                    { value: 38, label: "38° (Extreme Slot Expansion)" },
                  ]}
                  onChange={(val) => updateRearWingFlapAngle(val)}
                  infoTitle="Slotted Upper Element Flap AoA"
                  infoDesc="Secondary high-camber flap with precision boundary layer slot that injects high-energy air to delay aerodynamic stall."
                  proTip="The slotted flap allows extreme effective camber angles up to 38° without flow detachment."
                  onInfoClick={setSelectedInfo}
                />

                <AeroOptionStepperBox
                  label="Rear Wing Span Width"
                  value={config.rearWing.spanMm}
                  isNumeric
                  min={1100}
                  max={2100}
                  step={50}
                  options={[
                    { value: 1300, label: "1,300 mm (Compact Touring)" },
                    { value: 1450, label: "1,450 mm (Street GT)" },
                    { value: 1600, label: "1,600 mm (FIA GT3 Standard)" },
                    { value: 1750, label: "1,750 mm (Wide-Body Racing)" },
                    { value: 1950, label: "1,950 mm (Pikes Peak Unlimited)" },
                  ]}
                  onChange={(val) => updateRearWingWidth(val)}
                  infoTitle="Rear Wing Span Width"
                  infoDesc="Overall lateral width of carbon mainplane blade across the rear decklid."
                  proTip="Wider span increases aspect ratio, drastically reducing induced tip vortex drag."
                  onInfoClick={setSelectedInfo}
                />

                <AeroOptionStepperBox
                  label="Pylon Mounting Height"
                  value={config.rearWing.heightMm}
                  isNumeric
                  min={80}
                  max={500}
                  step={20}
                  options={[
                    { value: 120, label: "120 mm (Low Decklid Mount)" },
                    { value: 180, label: "180 mm (Semi-Raised)" },
                    { value: 250, label: "250 mm (Clean Airstream GT)" },
                    { value: 320, label: "320 mm (High Pylon Stance)" },
                    { value: 420, label: "420 mm (Roofline Match Max)" },
                  ]}
                  onChange={(val) => updateRearWingHeight(val)}
                  infoTitle="Pylon Mounting Height"
                  infoDesc="Elevation above rear decklid to capture undisturbed clean airflow over the vehicle greenhouse."
                  proTip="Raising wing to 250mm+ places the foil into clean freestream air, increasing downforce by 22%."
                  onInfoClick={setSelectedInfo}
                />

                <AeroOptionStepperBox
                  label="Gurney Flap Trailing Lip"
                  value={config.rearWing.gurneyHeightMm}
                  isNumeric
                  min={0}
                  max={25}
                  step={1}
                  options={[
                    { value: 0, label: "0 mm (None / Clean Airfoil)" },
                    { value: 5, label: "5 mm (Subtle Pressure Lip)" },
                    { value: 10, label: "10 mm (Medium GT3 Lip)" },
                    { value: 15, label: "15 mm (High Downforce Lip)" },
                    { value: 22, label: "22 mm (Maximum Stagnation Lip)" },
                  ]}
                  onChange={(val) => updateRearWingGurney(val)}
                  infoTitle="Gurney Flap Trailing Lip"
                  infoDesc="Vertical carbon strip perpendicular to pressure side on the airfoil trailing edge."
                  proTip="A 10mm Gurney flap increases downforce by up to 15% with a negligible increase in drag."
                  onInfoClick={setSelectedInfo}
                />

                <AeroOptionStepperBox
                  label="Mounting Pylon Architecture"
                  value={rearWingPylonStyle}
                  options={[
                    { value: "swan_neck", label: "CNC Titanium Swan-Neck" },
                    { value: "bottom_mount", label: "Carbon Billet Deck Pedestals" },
                  ]}
                  onChange={(val) => {
                    useAeroStudioStore.setState({ rearWingPylonStyle: val as "swan_neck" | "bottom_mount" });
                  }}
                  infoTitle="Pylon Architecture & Geometry"
                  infoDesc="Swan-neck mounts connect to top (suction side) of the airfoil, preserving 100% clean airflow on lower lifting surface."
                  proTip="Swan-neck pylons yield 8% higher net rear downforce compared to traditional bottom pedestal supports."
                  onInfoClick={setSelectedInfo}
                />
              </div>
            ) : (
              /* PEDESTAL REAR SPOILER CONTROLS (Section 9) */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <AeroOptionStepperBox
                  label="Spoiler Pitch Angle"
                  value={rearSpoilerAngleDeg}
                  isNumeric
                  min={0}
                  max={30}
                  step={1}
                  options={[
                    { value: 0, label: "0° (Low Drag High Velocity)" },
                    { value: 5, label: "5° (Mild Downforce)" },
                    { value: 10, label: "10° (Standard GT Spec)" },
                    { value: 16, label: "16° (High Downforce)" },
                    { value: 22, label: "22° (Track Attack)" },
                    { value: 28, label: "28° (Maximum Brake Stagnation)" },
                  ]}
                  onChange={(val) => updateRearSpoilerAngle(val)}
                  infoTitle="Rear Spoiler Pitch Angle"
                  infoDesc="Angle of inclination of the pedestal spoiler blade. Mesh physically rotates around its mechanical hinge pivot in real time."
                  proTip="10° to 16° creates optimal rear decklid pressure stagnation without creating excessive induced vortex drag."
                  onInfoClick={setSelectedInfo}
                />

                <AeroOptionStepperBox
                  label="Spoiler Decklid Height"
                  value={rearSpoilerHeightMm}
                  isNumeric
                  min={50}
                  max={240}
                  step={10}
                  options={[
                    { value: 60, label: "60 mm (Low Profile Street)" },
                    { value: 90, label: "90 mm (Sport Road)" },
                    { value: 110, label: "110 mm (Standard Track)" },
                    { value: 150, label: "150 mm (High Stance GT)" },
                    { value: 190, label: "190 mm (Club Sport High)" },
                  ]}
                  onChange={(val) => updateRearSpoilerHeight(val)}
                  infoTitle="Spoiler Decklid Height"
                  infoDesc="Vertical elevation of the spoiler blade above the trunk lid edge."
                  proTip="Higher elevation moves the spoiler out of boundary layer separation off the rear glass."
                  onInfoClick={setSelectedInfo}
                />

                <AeroOptionStepperBox
                  label="Spoiler Span Width"
                  value={rearSpoilerWidthMm}
                  isNumeric
                  min={1000}
                  max={1600}
                  step={50}
                  options={[
                    { value: 1150, label: "1,150 mm (Narrow Body)" },
                    { value: 1250, label: "1,250 mm (Touring)" },
                    { value: 1350, label: "1,350 mm (Full Decklid)" },
                    { value: 1450, label: "1,450 mm (Extended Flank)" },
                  ]}
                  onChange={(val) => updateRearSpoilerWidth(val)}
                  infoTitle="Spoiler Span Width"
                  infoDesc="Lateral width of the carbon spoiler blade spanning across the rear decklid."
                  proTip="Full 1,350mm width ensures complete coverage across rear deck wake."
                  onInfoClick={setSelectedInfo}
                />

                <AeroOptionStepperBox
                  label="Spoiler Trailing Gurney Lip"
                  value={rearSpoilerGurneyMm}
                  isNumeric
                  min={0}
                  max={20}
                  step={1}
                  options={[
                    { value: 0, label: "0 mm (None / Flush Blade)" },
                    { value: 4, label: "4 mm (Subtle Lip)" },
                    { value: 8, label: "8 mm (Standard GT Lip)" },
                    { value: 12, label: "12 mm (Aggressive Lip)" },
                    { value: 16, label: "16 mm (Maximum Suction)" },
                  ]}
                  onChange={(val) => updateRearSpoilerGurney(val)}
                  infoTitle="Spoiler Gurney Lip"
                  infoDesc="Vertical lip at the trailing edge of the spoiler generating a recirculating vortex that increases stagnation pressure."
                  proTip="8mm lip increases effective spoiler downforce by over 20%."
                  onInfoClick={setSelectedInfo}
                />

                <AeroOptionStepperBox
                  label="Endplate Design Integration"
                  value="integrated"
                  options={[
                    { value: "integrated", label: "Integrated Sculpted Endplates" },
                    { value: "extended", label: "Extended Aerofoil Spill Fences" },
                  ]}
                  onChange={() => {}}
                  infoTitle="Spoiler Endplate Design"
                  infoDesc="Molded lateral endplates containing spanwise pressure gradient."
                  proTip="Sculpted endplates minimize edge drag vortex shedding."
                  onInfoClick={setSelectedInfo}
                />
              </div>
            )}
          </div>
        )}

        {/* SIDE AERO SUB-TAB */}
        {activeSubTab === "sideAero" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Wind size={16} className="text-cyan-400" />
                  Side Skirts & Underbody Sealing Rockers
                </h3>
                <p className="text-xs text-slate-400">
                  Prevents high-pressure ambient air from leaking under the low-pressure underfloor tunnels.
                </p>
              </div>
              <button
                onClick={() => setSelectedComponent("sideSkirts")}
                className="text-xs px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono hover:bg-cyan-900/80 transition-all cursor-pointer"
              >
                Focus Side Skirt Camera
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <AeroOptionStepperBox
                label="Side Skirt Blade Extension"
                value={Math.round(config.sidepod.widthMm - 435)}
                isNumeric
                min={5}
                max={120}
                step={5}
                options={[
                  { value: 10, label: "10 mm (OEM Plus)" },
                  { value: 30, label: "30 mm (Sport Rocker)" },
                  { value: 50, label: "50 mm (Aero Blade GT)" },
                  { value: 75, label: "75 mm (Wide Boundary Seal)" },
                  { value: 100, label: "100 mm (Maximum Tunnel Seal)" },
                ]}
                onChange={(val) => updateSideSkirtsExtension(val)}
                infoTitle="Side Skirt Blade Extension"
                infoDesc="Carbon rocker extension extending laterally beneath doors to seal ground effect underfloor."
                proTip="Wider skirts physically block crosswinds and ambient air from contaminating underfloor low pressure."
                onInfoClick={setSelectedInfo}
              />

              <AeroOptionStepperBox
                label="Ground Seal Clearance"
                value={Math.round(config.groundEffectFloor.tunnelThroatHeightMm * 1.8)}
                isNumeric
                min={15}
                max={100}
                step={5}
                options={[
                  { value: 20, label: "20 mm (Ground Effect Skirt)" },
                  { value: 35, label: "35 mm (Low Track Stance)" },
                  { value: 50, label: "50 mm (Balanced Track)" },
                  { value: 65, label: "65 mm (Sport Road)" },
                  { value: 80, label: "80 mm (Daily Clearance)" },
                ]}
                onChange={(val) => updateSideSkirtsClearance(val)}
                infoTitle="Ground Seal Clearance"
                infoDesc="Vertical gap between side skirt lower edge and the asphalt surface."
                proTip="Keeping skirt clearance under 35mm dramatically magnifies underbody suction."
                onInfoClick={setSelectedInfo}
              />

              <AeroOptionStepperBox
                label="Rear Wheel Wake Deflector"
                value="active"
                options={[
                  { value: "active", label: "Active Vertical Wake Deflector" },
                  { value: "integrated", label: "Integrated Endplate Strakes" },
                ]}
                onChange={() => {}}
                infoTitle="Rear Wheel Wake Deflector"
                infoDesc="Vertical aerodynamic fences placed ahead of rear tires to deflect tire spray away from diffuser tunnels."
                proTip="Tire squirt deflector prevents rotating tire turbulent wake from destroying rear diffuser suction."
                onInfoClick={setSelectedInfo}
              />

              <AeroOptionStepperBox
                label="Underfloor Vortex Strakes"
                value="dual"
                options={[
                  { value: "dual", label: "Dual Longitudinal Vortex Rails" },
                  { value: "quad", label: "Quad Channeling Strakes" },
                ]}
                onChange={() => {}}
                infoTitle="Underfloor Vortex Strakes"
                infoDesc="Under-rocker longitudinal fences generating twin vortices that act as pneumatic side skirts."
                proTip="Vortex skirts provide ground sealing even through chassis roll during aggressive cornering."
                onInfoClick={setSelectedInfo}
              />
            </div>
          </div>
        )}

        {/* UNDERBODY DIFFUSER SUB-TAB */}
        {activeSubTab === "underbody" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Wind size={16} className="text-cyan-400" />
                  Underbody Ground Effect & Diffuser Systems
                </h3>
                <p className="text-xs text-slate-400">
                  Venturi floor suction and controlled expansion chambers generating low-drag ground effect.
                </p>
              </div>

              {/* Underbody Sub-Component Switcher (Section 10 & 11) */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 w-fit">
                <button
                  onClick={() => setSelectedComponent("diffuser")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedComponent === "diffuser"
                      ? "bg-cyan-500 text-slate-950 shadow-sm font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Rear Diffuser Tray
                </button>
                <button
                  onClick={() => setSelectedComponent("underbodyFloor")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedComponent === "underbodyFloor"
                      ? "bg-cyan-500 text-slate-950 shadow-sm font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Venturi Floor & Tunnels
                </button>
              </div>
            </div>

            {selectedComponent === "diffuser" ? (
              /* DIFFUSER PARAMETRIC CONTROLS */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <AeroOptionStepperBox
                  label="Diffuser Ramp Expansion Angle"
                  value={Math.round(config.diffuser.rampAngleDeg * 2) / 2}
                  isNumeric
                  min={4}
                  max={26}
                  step={0.5}
                  options={[
                    { value: 6, label: "6° (Low Drag High Velocity)" },
                    { value: 10, label: "10° (Gentle Pressure Recovery)" },
                    { value: 14, label: "14° (Optimal GT Expansion)" },
                    { value: 18, label: "18° (Aggressive High Suction)" },
                    { value: 24, label: "24° (Extreme Ground Effect)" },
                  ]}
                  onChange={(val) => updateDiffuserAngle(val)}
                  infoTitle="Diffuser Ramp Expansion Angle"
                  infoDesc="Upward expansion pitch angle of the rear floor. Physical 3D mesh hinges upward around mechanical pivot."
                  proTip="14° is the theoretical optimum before boundary layer flow detachment occurs in RANS simulations."
                  onInfoClick={setSelectedInfo}
                />

                <AeroOptionStepperBox
                  label="Vertical Guide Strakes"
                  value={config.diffuser.strakeCount}
                  options={[
                    { value: 2, label: "2 Guide Strakes" },
                    { value: 3, label: "3 Guide Strakes" },
                    { value: 4, label: "4 Guide Strakes (GT3 Spec)" },
                    { value: 5, label: "5 Guide Strakes" },
                    { value: 6, label: "6 Guide Strakes (Vortex Channels)" },
                  ]}
                  onChange={(val) => updateDiffuserStrakeCount(val)}
                  infoTitle="Vertical Guide Strakes"
                  infoDesc="Full-depth carbon vanes dividing the diffuser into discrete expansion tunnels."
                  proTip="4 strakes isolate yaw cross-flow, keeping diffuser suction symmetrical during hard cornering."
                  onInfoClick={setSelectedInfo}
                />

                <AeroOptionStepperBox
                  label="Diffuser Expansion Length"
                  value={config.diffuser.lengthMm}
                  isNumeric
                  min={550}
                  max={1500}
                  step={50}
                  options={[
                    { value: 650, label: "650 mm (Short Road Diffuser)" },
                    { value: 850, label: "850 mm (Sport Aerodynamic)" },
                    { value: 1050, label: "1,050 mm (Full Extended Venturi)" },
                    { value: 1200, label: "1,200 mm (Long Tail GT)" },
                    { value: 1350, label: "1,350 mm (Maximum Tunnel)" },
                  ]}
                  onChange={(val) => updateDiffuserExpansionLength(val)}
                  infoTitle="Diffuser Expansion Length"
                  infoDesc="Longitudinal length of diffuser ramp from throat choke point to rear bumper exit."
                  proTip="Longer tunnels allow gentler expansion slopes, generating larger suction zones without boundary separation."
                  onInfoClick={setSelectedInfo}
                />

                <AeroOptionStepperBox
                  label="Lateral Expansion Fences"
                  value="sealed"
                  options={[
                    { value: "sealed", label: "Sealed Carbon End Fences" },
                    { value: "open", label: "Open Flared Outlets" },
                  ]}
                  onChange={() => {}}
                  infoTitle="Lateral Expansion Fences"
                  infoDesc="Outermost lateral diffuser fences isolating tire wake from the central underbody venturi chamber."
                  proTip="Sealed end fences maintain stable downforce under heavy braking pitch changes."
                  onInfoClick={setSelectedInfo}
                />
              </div>
            ) : (
              /* UNDERBODY VENTURI FLOOR CONTROLS (Section 11) */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <AeroOptionStepperBox
                  label="Venturi Tunnel Throat Depth"
                  value={underbodyTunnelDepthMm}
                  isNumeric
                  min={15}
                  max={70}
                  step={5}
                  options={[
                    { value: 20, label: "20 mm (Shallow Venturi)" },
                    { value: 35, label: "35 mm (Class-1 Prototype)" },
                    { value: 45, label: "45 mm (High Suction Deep)" },
                    { value: 60, label: "60 mm (Maximum Ground Effect)" },
                  ]}
                  onChange={(val) => updateUnderbodyTunnelDepth(val)}
                  infoTitle="Venturi Tunnel Throat Depth"
                  infoDesc="Throat convergence constriction under the chassis floor generating extreme Bernoulli suction."
                  proTip="Deep 35-45mm tunnels generate immense low-drag downforce right under the vehicle's center of mass."
                  onInfoClick={setSelectedInfo}
                />

                <AeroOptionStepperBox
                  label="Floor Longitudinal Strakes"
                  value={underbodyFloorStrakeCount}
                  options={[
                    { value: 0, label: "Smooth Flat Undertray (0x)" },
                    { value: 2, label: "Dual Underfloor Strakes (2x)" },
                    { value: 4, label: "Quad Channeling Strakes (4x)" },
                    { value: 6, label: "Six Full Venturi Strakes (6x)" },
                  ]}
                  onChange={(val) => updateUnderbodyFloorStrakeCount(val)}
                  infoTitle="Floor Longitudinal Strakes"
                  infoDesc="Vertical carbon fences running along the underbody guiding longitudinal airflow and generating vortex seals."
                  proTip="Quad floor strakes prevent cross-flow separation when entering high lateral-G corners."
                  onInfoClick={setSelectedInfo}
                />

                <AeroOptionStepperBox
                  label="Underbody Floor Sealing"
                  value="full_sealed"
                  options={[
                    { value: "full_sealed", label: "Full Sealed Carbon Floor" },
                    { value: "evac_slots", label: "Pressure Evacuation Slits" },
                  ]}
                  onChange={() => {}}
                  infoTitle="Underbody Floor Sealing"
                  infoDesc="Underbody floor continuity from front splitter undertray transition to rear diffuser throat."
                  proTip="Full sealed carbon floor prevents parasitic drag turbulence and maximizes ground effect."
                  onInfoClick={setSelectedInfo}
                />
              </div>
            )}
          </div>
        )}

        {/* ROOF AERO SUB-TAB */}
        {activeSubTab === "roofAero" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Compass size={16} className="text-cyan-400" />
                  Roof LMP1 Shark Fin & Delta Vortex Generators
                </h3>
                <p className="text-xs text-slate-400">
                  Stabilizes yaw moments in high-speed crosswinds and energizes boundary layer air feeding rear wing.
                </p>
              </div>
              <button
                onClick={() => setSelectedComponent("roofFin")}
                className="text-xs px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono hover:bg-cyan-900/80 transition-all cursor-pointer"
              >
                Focus Roof Fin Camera
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <AeroOptionStepperBox
                label="LMP1 Shark Fin Spine"
                value={240}
                options={[
                  { value: 180, label: "Low Profile Fin (180 mm)" },
                  { value: 240, label: "FIA Standard LMP1 Fin (240 mm)" },
                  { value: 320, label: "Hypercar Extended Spine (320 mm)" },
                ]}
                onChange={(val) => updateRoofSharkFinHeight(val)}
                infoTitle="LMP1 Shark Fin Spine"
                infoDesc="Vertical carbon fin running from roof center along the rear engine cover."
                proTip="Eliminates dangerous high-yaw spins and straightens cross-flow heading into the rear wing."
                onInfoClick={setSelectedInfo}
              />

              <AeroOptionStepperBox
                label="Delta Vortex Generators"
                value={8}
                options={[
                  { value: 0, label: "Clean Smooth Roof (0x)" },
                  { value: 6, label: "6x Delta Micro Teeth" },
                  { value: 8, label: "8x High-Energy Delta Fins" },
                  { value: 10, label: "10x Boundary Layer Energizers" },
                ]}
                onChange={() => {}}
                infoTitle="Delta Vortex Generators"
                infoDesc="Array of miniature delta wings placed on the roof trailing edge."
                proTip="Injects high-energy vortices into the sluggish boundary layer, preventing airflow stalling over the rear window."
                onInfoClick={setSelectedInfo}
              />

              <AeroOptionStepperBox
                label="Engine Intake Roof Scoop"
                value="ram_air"
                options={[
                  { value: "ram_air", label: "Ram-Air Carbon Intake Scoop" },
                  { value: "flush", label: "Flush NACA Duct Inlets" },
                  { value: "dual_periscope", label: "Dual Low-Drag Roof Periscopes" },
                ]}
                onChange={() => {}}
                infoTitle="Engine Intake Roof Scoop"
                infoDesc="Roof-mounted air intake directing high-velocity ram air into the engine plenum."
                proTip="Ram-air roof scoop pressurizes intake manifold at 250+ km/h, yielding up to 3% additional engine horsepower."
                onInfoClick={setSelectedInfo}
              />
            </div>
          </div>
        )}

        {/* ACTIVE AERO SUB-TAB */}
        {activeSubTab === "activeAero" && (
          <div className="flex flex-col gap-5">
            {/* 1. HYPERCAR ACTIVE AERO DYNAMICS CONTROLLER (Moved from Vehicle Architecture) */}
            <div className="p-4 rounded-2xl border-2 border-cyan-500/60 bg-gradient-to-r from-cyan-950/40 via-slate-900/90 to-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.18)] space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Wind size={18} className="text-cyan-400" />
                  <h3 className="text-xs font-black uppercase text-cyan-300 tracking-wider">
                    HYPERCAR ACTIVE AERO DYNAMICS CONTROLLER
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playHMIClickSound();
                    const next = !drsActive;
                    setDrsActive(next);
                    if (next) {
                      updateActiveAeroDeployment(0);
                    } else {
                      updateActiveAeroDeployment(50);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    drsActive
                      ? "bg-purple-500 text-slate-950 border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.6)] animate-pulse"
                      : "bg-slate-900 text-purple-300 border-purple-500/40 hover:bg-purple-950/40"
                  }`}
                >
                  DRS FLAP: {drsActive ? "OPEN (LOW DRAG)" : "CLOSED (MAX DOWNFORCE)"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-5 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Rear Wing Angle:</span>
                    <span className="font-bold text-cyan-300">{activeWingAngleDeg > 0 ? "+" : ""}{activeWingAngleDeg}°</span>
                  </div>
                  <input
                    type="range"
                    min={-15}
                    max={35}
                    step={1}
                    value={activeWingAngleDeg}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setActiveWingAngle(val);
                      if (val >= 0) {
                        updateRearWingAngle(val);
                      }
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>-15° Low Drag</span>
                    <span>0° Neutral</span>
                    <span>+35° High Downforce Airbrake</span>
                  </div>
                </div>

                {/* Live Aero Telemetry */}
                <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                  <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-0.5">
                    <span className="text-slate-500 block">DOWNFORCE (250km/h)</span>
                    <strong className="text-cyan-400 text-xs block">{hypercarAero.downforceKgAt250Kmh} kg</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-0.5">
                    <span className="text-slate-500 block">DRAG DELTA</span>
                    <strong className="text-amber-400 text-xs block">{hypercarAero.dragCdDelta >= 0 ? "+" : ""}{hypercarAero.dragCdDelta.toFixed(3)} Cd</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-0.5">
                    <span className="text-slate-500 block">FRONT AERO BALANCE</span>
                    <strong className="text-emerald-400 text-xs block">{hypercarAero.aeroBalanceFrontPct.toFixed(1)}%</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-0.5">
                    <span className="text-slate-500 block">LAP TIME DELTA</span>
                    <strong className={`text-xs block ${hypercarAero.lapTimeDeltaSec < 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {hypercarAero.lapTimeDeltaSec > 0 ? "+" : ""}{hypercarAero.lapTimeDeltaSec.toFixed(2)}s
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. ACTIVE DRS & HYDRAULIC ACTUATOR SECTION */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Zap size={16} className="text-cyan-400" />
                  Active DRS & Aerodynamic Airbrake System
                </h3>
                <p className="text-xs text-slate-400">
                  Hydraulic articulating wing & underfloor flaps providing dynamic drag shedding or emergency braking.
                </p>
              </div>
              <button
                onClick={() => setSelectedComponent("activeWing")}
                className="text-xs px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono hover:bg-cyan-900/80 transition-all cursor-pointer"
              >
                Focus Active Wing Camera
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <AeroOptionStepperBox
                label="Live Wing Articulation Mode"
                value={activeAeroDeploymentPct}
                options={[
                  { value: 0, label: "0% — Low Drag DRS (4°)" },
                  { value: 25, label: "25% — Cornering (14°)" },
                  { value: 50, label: "50% — Balanced GT (24°)" },
                  { value: 75, label: "75% — Braking Transition (36°)" },
                  { value: 100, label: "100% — Full Airbrake (48°)" },
                ]}
                onChange={(val) => updateActiveAeroDeployment(val)}
                infoTitle="Active DRS & Airbrake System"
                infoDesc="Active articulation of rear wing and underfloor flaps via hydraulic servo pistons."
                proTip="100% Airbrake position sheds 1,800 N of braking burden from carbon-ceramic brake calipers."
                onInfoClick={setSelectedInfo}
              />

              <AeroOptionStepperBox
                label="Active Front Diffuser Flaps"
                value="coupled"
                options={[
                  { value: "coupled", label: "Coupled Dynamic Synchronized" },
                  { value: "autonomous", label: "Speed-Sensitive Autonomous" },
                  { value: "locked", label: "Locked Neutral (High Speed)" },
                ]}
                onChange={() => {}}
                infoTitle="Active Front Diffuser Flaps"
                infoDesc="Motorized flaps in the front undertray that open to vent stagnation air or close to maximize suction."
                proTip="Coupled deployment prevents high-speed nose dive and maintains constant center of pressure."
                onInfoClick={setSelectedInfo}
              />

              <AeroOptionStepperBox
                label="Hydraulic Ram Actuator System"
                value="high_pressure"
                options={[
                  { value: "high_pressure", label: "210 Bar Dual Servo Actuators" },
                  { value: "ultra_fast", label: "300 Bar High-Speed Solenoid" },
                  { value: "electric_screw", label: "Brushless Electric Screw" },
                ]}
                onChange={() => {}}
                infoTitle="Hydraulic Ram Actuator System"
                infoDesc="High-pressure aerospace actuators capable of rotating the carbon wing under 2,500 N aerodynamic load in under 0.2s."
                proTip="300 Bar system transitions from DRS low-drag to Full Airbrake in just 180 milliseconds."
                onInfoClick={setSelectedInfo}
              />
            </div>

            {/* 3. ALL CONFIGURATIONS RELATED TO AERODYNAMICS (Moved from Vehicle Studio) */}
            <div className="rounded-2xl border border-slate-700/80 bg-slate-950/95 shadow-xl p-5 select-none space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <Wrench size={14} className="text-cyan-400" />
                  <span>ALL CONFIGURATIONS RELATED TO AERODYNAMICS</span>
                </div>
                <span className="text-[10px] text-slate-500 uppercase font-mono">
                  ACTIVE ARCHITECTURE: {(modularModel || vehicleVariant || "sedan").toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* COLUMN 1: STRUCTURAL ARCHITECTURE */}
                <div className="space-y-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
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
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            playHMIClickSound();
                            setChassisArch(opt.id);
                          }}
                          className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-0.5 ${
                            isSelected
                              ? "bg-cyan-500/15 border-cyan-400/80 text-cyan-200 shadow-sm"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-200">{opt.label}</span>
                            <span className="text-[10px] text-cyan-400 font-mono">{opt.stiffness}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-tight">{opt.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* COLUMN 2: MATERIAL GRADE */}
                <div className="space-y-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
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
                        id: "stamped_steel",
                        label: "Stamped Steel",
                        sub: "OEM BASE",
                        mass: "Mass: Baseline",
                        stiff: "Stiffness: Baseline",
                      },
                      {
                        id: "cast_aluminum",
                        label: "Die-Cast Aluminum Alloy",
                        sub: "LIGHTWEIGHT",
                        mass: "Mass: -15%",
                        stiff: "Stiffness: +6 kNm/°",
                      },
                      {
                        id: "extruded_aluminum",
                        label: "Compacted Graphite / CNC Billet",
                        sub: "CNC BILLET",
                        mass: "Mass: -25%",
                        stiff: "Stiffness: +14 kNm/°",
                      },
                      {
                        id: "carbon_composite",
                        label: "Titanium & Pre-Preg Carbon",
                        sub: "RACE SPEC",
                        mass: "Mass: -40%",
                        stiff: "Stiffness: +24 kNm/°",
                      },
                    ].map((mat) => {
                      const isSelected = materialGrade === mat.id;
                      return (
                        <button
                          key={mat.id}
                          type="button"
                          onClick={() => {
                            playHMIClickSound();
                            setMaterialGrade(mat.id);
                          }}
                          className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-0.5 ${
                            isSelected
                              ? "bg-amber-500/15 border-amber-400/80 text-amber-200 shadow-sm"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-200">{mat.label}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                              {mat.sub}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span>{mat.mass}</span>
                            <span className="text-emerald-400">{mat.stiff}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* COLUMN 3: ECONOMICS & STATS */}
                <div className="space-y-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge size={16} className="text-emerald-400" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                        ECONOMICS & STATS
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                      Dynamic aerodynamic appendage weight and structural chassis response.
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase">SUB-MASS</span>
                        <strong className="text-slate-200 text-sm">
                          {materialGrade === "carbon_composite"
                            ? "32.4"
                            : materialGrade === "extruded_aluminum"
                            ? "38.5"
                            : materialGrade === "cast_aluminum"
                            ? "43.1"
                            : "51.0"} kg
                        </strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase">RIGIDITY</span>
                        <strong className="text-emerald-400 text-sm">
                          {chassisArch === "carbon_tub"
                            ? "58.0"
                            : chassisArch === "monocoque"
                            ? "46.2"
                            : "39.5"} kNm/°
                        </strong>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1 text-[11px] font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Aero Load @ 250 km/h:</span>
                        <span className="text-cyan-300 font-bold">{hypercarAero.downforceKgAt250Kmh} kg</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Induced Drag Delta:</span>
                        <span className="text-amber-300 font-bold">{hypercarAero.dragCdDelta >= 0 ? "+" : ""}{hypercarAero.dragCdDelta.toFixed(3)} Cd</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Aero Balance Shift:</span>
                        <span className="text-emerald-300 font-bold">{hypercarAero.aeroBalanceFrontPct.toFixed(1)}% Front</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-800/80">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    <span>Continuous CAD Twin: synched with Stage 3 Aero Viewport</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COOLING AERO SUB-TAB */}
        {activeSubTab === "coolingAero" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Flame size={16} className="text-amber-400" />
                  Thermal Management & Cooling Aerodynamics
                </h3>
                <p className="text-xs text-slate-400">
                  Hood heat extraction louvers, brake cooling ducts, and wheelhouse pressure relief vents.
                </p>
              </div>
              <button
                onClick={() => setSelectedComponent("coolingLouvers")}
                className="text-xs px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono hover:bg-cyan-900/80 transition-all cursor-pointer"
              >
                Focus Cooling Camera
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <AeroOptionStepperBox
                label="Hood Heat Extraction Louvers"
                value={Math.round(((config.sidepod.coolingOutletAreaM2 - 0.05) / 0.15) * 100)}
                options={[
                  { value: 0, label: "0% — Closed / Streamlined" },
                  { value: 25, label: "25% — Mild Venting" },
                  { value: 50, label: "50% — High Flow Extraction" },
                  { value: 75, label: "75% — Thermal Stress Mode" },
                  { value: 100, label: "100% — Full Radiator Evac" },
                ]}
                onChange={(val) => updateCoolingLouversPct(val)}
                infoTitle="Hood Heat Extraction Louvers"
                infoDesc="Serrated carbon hood vents drawing hot air from the front radiator over the windshield."
                proTip="Evacuating radiator exhaust through the hood prevents high-pressure air from lifting the front axle."
                onInfoClick={setSelectedInfo}
              />

              <AeroOptionStepperBox
                label="Carbon Brake Cooling Ducts"
                value="naca"
                options={[
                  { value: "naca", label: "Dual High-Flow NACA Channels" },
                  { value: "forced", label: "Forced Carbon Caliper Ducts" },
                  { value: "shutters", label: "Active Low-Drag Shutters" },
                ]}
                onChange={() => {}}
                infoTitle="Carbon Brake Cooling Ducts"
                infoDesc="Aerodynamic ducts directing ram air through the front fascia directly onto brake discs and calipers."
                proTip="NACA ducts maintain high volumetric flow while creating virtually zero parasitic aerodynamic drag."
                onInfoClick={setSelectedInfo}
              />

              <AeroOptionStepperBox
                label="Wheelhouse Pressure Relief Vents"
                value="louvers"
                options={[
                  { value: "louvers", label: "Top Fender Louvers (-8% Lift)" },
                  { value: "chimney", label: "Rear Arch Chimney Outlets" },
                  { value: "sealed", label: "Sealed Smooth Fenders" },
                ]}
                onChange={() => {}}
                infoTitle="Wheelhouse Pressure Relief Vents"
                infoDesc="Louvers cut into the top of the front fenders to release compressed tire air."
                proTip="Fender louvers reduce front axle aerodynamic lift by up to 8% at circuit speeds."
                onInfoClick={setSelectedInfo}
              />
            </div>
          </div>
        )}

        {/* WHEEL AERO SUB-TAB */}
        {activeSubTab === "wheelAero" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <CircleDot size={16} className="text-cyan-400" />
                  Turbofan Aero Wheel Discs
                </h3>
                <p className="text-xs text-slate-400">
                  Eliminates spoke churning turbulence and draws hot air out from brakes through centrifugal vanes.
                </p>
              </div>
              <button
                onClick={() => setSelectedComponent("wheelDiscs")}
                className="text-xs px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono hover:bg-cyan-900/80 transition-all cursor-pointer"
              >
                Focus Wheel Camera
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <AeroOptionStepperBox
                label="Turbofan Aero Wheel Discs"
                value={wheelAeroDiscsInstalled}
                options={[
                  { value: true, label: "Installed (Forged Carbon Discs)" },
                  { value: false, label: "Removed (Open Spoke Alloy)" },
                ]}
                onChange={(val) => updateWheelAeroDiscs(val)}
                infoTitle="Turbofan Aero Wheel Discs"
                infoDesc="Aerodynamic wheel covers covering the outer rim face, inspired by Group C and IMSA prototypes."
                proTip="Reduces wheel turbulence drag (Cd delta of -0.018) while extracting brake heat through internal vanes."
                onInfoClick={setSelectedInfo}
              />

              <AeroOptionStepperBox
                label="Centrifugal Thermal Evacuation"
                value="directional"
                options={[
                  { value: "directional", label: "Directional Vanes (-65°C Delta)" },
                  { value: "high_suction", label: "High-Suction Billet Extractors" },
                ]}
                onChange={() => {}}
                infoTitle="Centrifugal Thermal Evacuation"
                infoDesc="Reverse-curved turbine fins integrated into the disc structure that draw cooling air outward as wheels spin."
                proTip="Centrifugal pumping effect increases with wheel RPM, keeping brake fluid well below boiling point."
                onInfoClick={setSelectedInfo}
              />
            </div>
          </div>
        )}

        {/* AERO SUMMARY SUB-TAB */}
        {activeSubTab === "aeroSummary" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Gauge size={16} className="text-cyan-400" />
                  Full Aerodynamic Performance Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Comprehensive wind-tunnel velocity telemetry and subsystem force breakdown.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <AeroOptionStepperBox
                label="Wind Tunnel Velocity"
                value={config.airspeedKmh}
                options={[
                  { value: 80, label: "80 km/h (Urban / Hairpin)" },
                  { value: 120, label: "120 km/h (Club Cornering)" },
                  { value: 160, label: "160 km/h (Fast Sweeper)" },
                  { value: 200, label: "200 km/h (GT3 Reference)" },
                  { value: 250, label: "250 km/h (High-Speed Curve)" },
                  { value: 300, label: "300 km/h (Main Straight)" },
                  { value: 350, label: "350 km/h (Mulsanne Velocity)" },
                ]}
                onChange={(val) => setAirspeedKmh(val)}
                infoTitle="Wind Tunnel Test Velocity"
                infoDesc="Controlled airflow velocity in the virtual wind tunnel test chamber."
                proTip="Downforce scales with velocity squared (v²): doubling airspeed from 100 to 200 km/h quadruples aero load."
                onInfoClick={setSelectedInfo}
              />

              <AeroOptionStepperBox
                label="Surrogate CFD Solver Mode"
                value="rans"
                options={[
                  { value: "rans", label: "Steady-State RANS k-ω SST" },
                  { value: "les", label: "Transient Detached Eddy LES" },
                  { value: "panel", label: "Fast Boundary Element Vortex" },
                ]}
                onChange={() => {}}
                infoTitle="Surrogate CFD Solver Mode"
                infoDesc="Numerical turbulence model used to calculate surrogate pressure distributions, downforce, and drag."
                proTip="k-ω SST provides the most accurate aerodynamic separation predictions for adverse pressure gradient diffusers."
                onInfoClick={setSelectedInfo}
              />
            </div>

            {/* Subsystem Downforce Breakdown Table */}
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 px-3">Subsystem</th>
                    <th className="py-2 px-3">Downforce (N)</th>
                    <th className="py-2 px-3">Downforce (kgf)</th>
                    <th className="py-2 px-3">Drag (N)</th>
                    <th className="py-2 px-3">Subsystem Efficiency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-semibold text-cyan-300">Rear Wing (Dual Element)</td>
                    <td className="py-2 px-3">{physics.rearDownforceN.toFixed(0)} N</td>
                    <td className="py-2 px-3">{(physics.rearDownforceN / 9.80665).toFixed(0)} kg</td>
                    <td className="py-2 px-3">{(physics.totalDragN * 0.44).toFixed(0)} N</td>
                    <td className="py-2 px-3 text-emerald-400">High Camber Lift</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-semibold text-blue-300">Front Splitter & Canards</td>
                    <td className="py-2 px-3">{physics.frontDownforceN.toFixed(0)} N</td>
                    <td className="py-2 px-3">{(physics.frontDownforceN / 9.80665).toFixed(0)} kg</td>
                    <td className="py-2 px-3">{(physics.totalDragN * 0.28).toFixed(0)} N</td>
                    <td className="py-2 px-3 text-emerald-400">Stagnation Wedge</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-semibold text-purple-300">Underbody Venturi & Diffuser</td>
                    <td className="py-2 px-3">{(physics.totalDownforceN * 0.42).toFixed(0)} N</td>
                    <td className="py-2 px-3">
                      {((physics.totalDownforceN * 0.42) / 9.80665).toFixed(0)} kg
                    </td>
                    <td className="py-2 px-3">{(physics.totalDragN * 0.16).toFixed(0)} N</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">Ultra-Low Induced Drag</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-semibold text-amber-300">Cooling & Wheels Parasitic</td>
                    <td className="py-2 px-3">0 N</td>
                    <td className="py-2 px-3">0 kg</td>
                    <td className="py-2 px-3">{(physics.totalDragN * 0.12).toFixed(0)} N</td>
                    <td className="py-2 px-3 text-slate-400">Internal Pressure Vents</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 4. Interactive Engineering Rationale Info Popover Modal */}
      {selectedInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="rounded-2xl p-5 max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.6)] space-y-3.5 border bg-slate-900/95 border-cyan-500/40">
            <div className="flex items-start justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Info size={16} />
                </div>
                <h3 className="font-bold text-sm text-slate-100">{selectedInfo.title}</h3>
              </div>
              <button
                onClick={() => setSelectedInfo(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs leading-relaxed text-slate-300">{selectedInfo.desc}</p>

            <div className="rounded-xl p-3 flex items-start gap-2.5 shadow-inner border bg-slate-800/80 border-slate-700/60">
              <Sparkles size={15} className="shrink-0 mt-0.5 text-cyan-400" />
              <p className="text-[11px] leading-snug text-slate-300">
                <strong className="font-bold text-cyan-300">Aero ProTip: </strong>
                {selectedInfo.proTip}
              </p>
            </div>

            <div className="text-right pt-1">
              <button
                onClick={() => setSelectedInfo(null)}
                className="px-4 py-1.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
