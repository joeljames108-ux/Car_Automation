// ============================================================================
// INTERIOR CONTROL DECK — SECTION-DRIVEN MODULAR COCKPIT TUNER
// ============================================================================
// Precision interactive control deck for tuning cockpit subassemblies.
// Modeled directly on Aero Studio's section-driven architecture:
// When a section is selected, only the options and steppers for that subassembly
// are rendered below the 3D GLB viewport.
// ============================================================================

import React, { useState, useMemo, useEffect } from "react";
import {
  Compass,
  Sliders,
  Sparkles,
  Sun,
  Moon,
  Camera,
  CheckCircle2,
  RotateCcw,
  Save,
  Layers,
  Activity,
  Radio,
  Navigation as NavIcon,
  Thermometer,
  Gauge,
  CircleDot,
  Undo2,
  Redo2,
  Shuffle,
  Eye,
  EyeOff,
  Zap,
  Award,
  Armchair,
  SlidersHorizontal,
  Cpu,
  Tv,
  DoorClosed,
  Disc,
  Info,
  X,
  Check,
  ArrowRight,
  Shield,
  Users,
  Car,
  Volume2,
  Sofa,
  ToggleLeft,
  Truck,
  Bus,
  Wine,
} from "lucide-react";
import {
  getAllowedSeatingOptions,
  getDefaultSeatingForBodyType,
  isRow2Available,
  isRow3Available,
  getInteriorVariantForBodyType,
  getSeatingSummaryBadge,
} from "../../sim/modularVehicle/seatingConstraints";
import {
  useInteriorDashboardConfigStore,
  ActiveConfigPanel,
  CameraPose,
  DriverHeight,
  SteeringWheelStyle,
  SteeringGripMaterial,
  SteeringStripeStyle,
  PaddleShifterStyle,
  DriveModeType,
  DashboardTrimType,
  InfotainmentMode,
  ClusterStyle,
  HUDMode,
  ShifterStyle,
  SeatStyle,
  SeatBeltColor,
  StitchingColor,
  WindshieldTint,
  SeatingCapacity,
  Row2SeatingType,
  Row3SeatingType,
  RearEntertainment,
  RearClimateZone,
  COCKPIT_THEME_PRESETS,
  CONFIG_OPTIONS,
  FeatureKey,
} from "../../state/interiorDashboardConfigStore";
import {
  useModularVehicleBuilderStore,
  MODULAR_CAR_PARTS,
} from "../../state/modularVehicleBuilderStore";
import {
  calculateVanInteriorVolume,
  BODY_TYPE_REGISTRY,
} from "../../sim/modularVehicle/vehicleFamilyArchitecture";
import type { VanSeatConfig } from "../../sim/modularVehicle/types";
import { playHMIClickSound, playHMITabSound } from "../../utils/hmiSoundSynth";

export interface InteriorOption<T> {
  value: T;
  label: string;
}

interface InteriorOptionStepperBoxProps<T> {
  label: string;
  value: T;
  options: InteriorOption<T>[];
  onChange: (val: T) => void;
  infoTitle?: string;
  infoDesc?: string;
  proTip?: string;
  onInfoClick?: (info: { title: string; desc: string; proTip: string }) => void;
}

function InteriorOptionStepperBox<T>({
  label,
  value,
  options,
  onChange,
  infoTitle,
  infoDesc,
  proTip,
  onInfoClick,
}: InteriorOptionStepperBoxProps<T>) {
  const activeIndex = useMemo(() => {
    const idx = options.findIndex((opt) => opt.value === value);
    return idx !== -1 ? idx : 0;
  }, [options, value]);

  const handleStep = (direction: 1 | -1) => {
    playHMIClickSound();
    let nextIdx = activeIndex + direction;
    if (nextIdx < 0) nextIdx = options.length - 1;
    if (nextIdx >= options.length) nextIdx = 0;
    onChange(options[nextIdx].value);
  };

  const currentOption = options[activeIndex] || options[0];
  const hasInfo = Boolean(infoTitle || infoDesc || proTip);

  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl transition-all shadow-sm group border bg-slate-800/60 hover:bg-slate-800/90 border-slate-700/60 hover:border-red-500/40">
      <span
        className="text-[12px] font-bold tracking-tight flex-1 pr-2 truncate text-slate-200"
        title={label}
      >
        {label}
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          className="w-7 h-7 rounded-lg font-extrabold text-base flex items-center justify-center transition-all shadow-sm active:scale-90 cursor-pointer border bg-slate-700/80 hover:bg-red-600 active:bg-red-700 border-slate-600 hover:border-red-400 text-slate-200 hover:text-white"
          onClick={() => handleStep(-1)}
          aria-label={`Previous ${label}`}
          type="button"
        >
          ‹
        </button>

        <span
          className="text-[11px] font-mono font-bold min-w-[125px] max-w-[175px] text-center px-2 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-cyan-300 truncate shadow-inner select-none"
          title={currentOption.label}
        >
          {currentOption.label}
        </span>

        <button
          className="w-7 h-7 rounded-lg font-extrabold text-base flex items-center justify-center transition-all shadow-sm active:scale-90 cursor-pointer border bg-slate-700/80 hover:bg-red-600 active:bg-red-700 border-slate-600 hover:border-red-400 text-slate-200 hover:text-white"
          onClick={() => handleStep(1)}
          aria-label={`Next ${label}`}
          type="button"
        >
          ›
        </button>

        {hasInfo && (
          <button
            className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-cyan-300 hover:bg-slate-700/60 transition-colors ml-0.5 cursor-pointer"
            onClick={() => {
              if (onInfoClick) {
                onInfoClick({
                  title: infoTitle || label,
                  desc: infoDesc || "",
                  proTip: proTip || "",
                });
              }
            }}
            title="Inspect engineering information"
            type="button"
          >
            <Info size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

interface InteriorControlDeckProps {
  onSelectStage?: (stage: string) => void;
  onApplyConfig?: () => void;
}

export const InteriorControlDeck: React.FC<InteriorControlDeckProps> = ({
  onSelectStage,
  onApplyConfig,
}) => {
  // Store Subscriptions
  const activePanel = useInteriorDashboardConfigStore((s) => s.activePanel);
  const setActivePanel = useInteriorDashboardConfigStore((s) => s.setActivePanel);
  const cameraPose = useInteriorDashboardConfigStore((s) => s.cameraPose);
  const setCameraPose = useInteriorDashboardConfigStore((s) => s.setCameraPose);
  const driverHeight = useInteriorDashboardConfigStore((s) => s.driverHeight);
  const setDriverHeight = useInteriorDashboardConfigStore((s) => s.setDriverHeight);
  const nightMode = useInteriorDashboardConfigStore((s) => s.nightMode);
  const setNightMode = useInteriorDashboardConfigStore((s) => s.setNightMode);

  // Steering
  const steeringWheelStyle = useInteriorDashboardConfigStore((s) => s.steeringWheelStyle);
  const setSteeringWheelStyle = useInteriorDashboardConfigStore((s) => s.setSteeringWheelStyle);
  const steeringGripMaterial = useInteriorDashboardConfigStore((s) => s.steeringGripMaterial);
  const setSteeringGripMaterial = useInteriorDashboardConfigStore((s) => s.setSteeringGripMaterial);
  const steeringStripe = useInteriorDashboardConfigStore((s) => s.steeringStripe);
  const setSteeringStripe = useInteriorDashboardConfigStore((s) => s.setSteeringStripe);
  const paddleShifters = useInteriorDashboardConfigStore((s) => s.paddleShifters);
  const setPaddleShifters = useInteriorDashboardConfigStore((s) => s.setPaddleShifters);
  const driveMode = useInteriorDashboardConfigStore((s) => s.driveMode);
  const setDriveMode = useInteriorDashboardConfigStore((s) => s.setDriveMode);

  // Dashboard & Infotainment & Cluster
  const upperDashPadColor = useInteriorDashboardConfigStore((s) => s.upperDashPadColor);
  const setUpperDashPadColor = useInteriorDashboardConfigStore((s) => s.setUpperDashPadColor);
  const dashboardTrimMaterial = useInteriorDashboardConfigStore((s) => s.dashboardTrimMaterial);
  const setDashboardTrimMaterial = useInteriorDashboardConfigStore((s) => s.setDashboardTrimMaterial);
  const infotainmentMode = useInteriorDashboardConfigStore((s) => s.infotainmentMode);
  const setInfotainmentMode = useInteriorDashboardConfigStore((s) => s.setInfotainmentMode);
  const clusterStyle = useInteriorDashboardConfigStore((s) => s.clusterStyle);
  const setClusterStyle = useInteriorDashboardConfigStore((s) => s.setClusterStyle);
  const hudMode = useInteriorDashboardConfigStore((s) => s.hudMode);
  const setHudMode = useInteriorDashboardConfigStore((s) => s.setHudMode);
  const ambientLightColor = useInteriorDashboardConfigStore((s) => s.ambientLightColor);
  const setAmbientLightColor = useInteriorDashboardConfigStore((s) => s.setAmbientLightColor);

  // Console & Seats & Upholstery
  const shifterStyle = useInteriorDashboardConfigStore((s) => s.shifterStyle);
  const setShifterStyle = useInteriorDashboardConfigStore((s) => s.setShifterStyle);
  const seatStyle = useInteriorDashboardConfigStore((s) => s.seatStyle);
  const setSeatStyle = useInteriorDashboardConfigStore((s) => s.setSeatStyle);
  const seatBeltColor = useInteriorDashboardConfigStore((s) => s.seatBeltColor);
  const setSeatBeltColor = useInteriorDashboardConfigStore((s) => s.setSeatBeltColor);
  const stitchingColor = useInteriorDashboardConfigStore((s) => s.stitchingColor);
  const setStitchingColor = useInteriorDashboardConfigStore((s) => s.setStitchingColor);
  const windshieldTint = useInteriorDashboardConfigStore((s) => s.windshieldTint);
  const setWindshieldTint = useInteriorDashboardConfigStore((s) => s.setWindshieldTint);

  // Rear Cabin / Multi-Row Seating
  const seatingCapacity = useInteriorDashboardConfigStore((s) => s.seatingCapacity);
  const setSeatingCapacity = useInteriorDashboardConfigStore((s) => s.setSeatingCapacity);
  const row2SeatingType = useInteriorDashboardConfigStore((s) => s.row2SeatingType);
  const setRow2SeatingType = useInteriorDashboardConfigStore((s) => s.setRow2SeatingType);
  const row3SeatingType = useInteriorDashboardConfigStore((s) => s.row3SeatingType);
  const setRow3SeatingType = useInteriorDashboardConfigStore((s) => s.setRow3SeatingType);
  const rearEntertainment = useInteriorDashboardConfigStore((s) => s.rearEntertainment);
  const setRearEntertainment = useInteriorDashboardConfigStore((s) => s.setRearEntertainment);
  const rearClimateZone = useInteriorDashboardConfigStore((s) => s.rearClimateZone);
  const setRearClimateZone = useInteriorDashboardConfigStore((s) => s.setRearClimateZone);
  const rearHeatedVentilated = useInteriorDashboardConfigStore((s) => s.rearHeatedVentilated);
  const setRearHeatedVentilated = useInteriorDashboardConfigStore((s) => s.setRearHeatedVentilated);
  const rearMassage = useInteriorDashboardConfigStore((s) => s.rearMassage);
  const setRearMassage = useInteriorDashboardConfigStore((s) => s.setRearMassage);
  const rearFoldingTables = useInteriorDashboardConfigStore((s) => s.rearFoldingTables);
  const setRearFoldingTables = useInteriorDashboardConfigStore((s) => s.setRearFoldingTables);

  // Dedicated Architecture Subsystems
  const truck4WdMode = useInteriorDashboardConfigStore((s) => s.truck4WdMode);
  const setTruck4WdMode = useInteriorDashboardConfigStore((s) => s.setTruck4WdMode);
  const truckAuxSwitchpod = useInteriorDashboardConfigStore((s) => s.truckAuxSwitchpod);
  const setTruckAuxSwitchpod = useInteriorDashboardConfigStore((s) => s.setTruckAuxSwitchpod);
  const truckUnderseatStorage = useInteriorDashboardConfigStore((s) => s.truckUnderseatStorage);
  const setTruckUnderseatStorage = useInteriorDashboardConfigStore((s) => s.setTruckUnderseatStorage);

  const busFareValidator = useInteriorDashboardConfigStore((s) => s.busFareValidator);
  const setBusFareValidator = useInteriorDashboardConfigStore((s) => s.setBusFareValidator);
  const busStanchionPoles = useInteriorDashboardConfigStore((s) => s.busStanchionPoles);
  const setBusStanchionPoles = useInteriorDashboardConfigStore((s) => s.setBusStanchionPoles);

  const luxuryOttomanDeployed = useInteriorDashboardConfigStore((s) => s.luxuryOttomanDeployed);
  const setLuxuryOttomanDeployed = useInteriorDashboardConfigStore((s) => s.setLuxuryOttomanDeployed);
  const luxuryChampagneChiller = useInteriorDashboardConfigStore((s) => s.luxuryChampagneChiller);
  const setLuxuryChampagneChiller = useInteriorDashboardConfigStore((s) => s.setLuxuryChampagneChiller);
  const luxuryTheaterScreen = useInteriorDashboardConfigStore((s) => s.luxuryTheaterScreen);
  const setLuxuryTheaterScreen = useInteriorDashboardConfigStore((s) => s.setLuxuryTheaterScreen);

  // Audio system state (local or store)
  const [audioSystemGrade, setAudioSystemGrade] = useState<string>("burmester");
  const [hvacDualZone, setHvacDualZone] = useState<boolean>(true);

  // Feature selections (legacy/2D index steppers)
  const applyThemePreset = useInteriorDashboardConfigStore((s) => s.applyThemePreset);
  const resetConfig = useInteriorDashboardConfigStore((s) => s.reset);
  const engineering = useInteriorDashboardConfigStore((s) => s.engineering);

  // Vehicle Store for structural chassis & MPV volume
  const selectedModel = useModularVehicleBuilderStore((s) => s.selectedModel);
  const setSelectedModel = useModularVehicleBuilderStore((s) => s.setSelectedModel);
  const hiddenPartIds = useModularVehicleBuilderStore((s) => s.hiddenPartIds);
  const togglePartVisibility = useModularVehicleBuilderStore((s) => s.togglePartVisibility);

  // Dynamic Seating Constraints & Auto-Clamp
  const allowedSeatingOptions = useMemo(
    () => getAllowedSeatingOptions(selectedModel),
    [selectedModel]
  );
  const seatingBadge = useMemo(
    () => getSeatingSummaryBadge(selectedModel),
    [selectedModel]
  );
  const interiorVariant = useMemo(
    () => getInteriorVariantForBodyType(selectedModel),
    [selectedModel]
  );

  useEffect(() => {
    const validSeats = allowedSeatingOptions.map((o) => o.seats);
    if (!validSeats.includes(seatingCapacity)) {
      const defaultSeats = getDefaultSeatingForBodyType(selectedModel);
      setSeatingCapacity(defaultSeats);
    }
  }, [selectedModel, allowedSeatingOptions, seatingCapacity, setSeatingCapacity]);

  const [chassisArch, setChassisArch] = useState<string>("monocoque");
  const [materialGrade, setMaterialGrade] = useState<string>("cast_aluminum");
  const [vanSeatConfig, setVanSeatConfig] = useState<VanSeatConfig>("7_seat");

  // Info modal state
  const [selectedInfo, setSelectedInfo] = useState<{
    title: string;
    desc: string;
    proTip: string;
  } | null>(null);

  const activeModelSpec = BODY_TYPE_REGISTRY[selectedModel] || BODY_TYPE_REGISTRY.sedan;
  const vanVolume = useMemo(
    () => calculateVanInteriorVolume(vanSeatConfig),
    [vanSeatConfig]
  );

  const interiorParts = useMemo(
    () => MODULAR_CAR_PARTS.filter((p) => p.category === "interior"),
    []
  );

  const isPartVisible = (partId: string) => !hiddenPartIds.includes(partId);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* ── INFO MODAL ── */}
      {selectedInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedInfo(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Info size={14} />
              <span>Engineering Telemetry & Physics</span>
            </div>
            <h3 className="text-base font-black text-slate-100 mb-2">{selectedInfo.title}</h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">{selectedInfo.desc}</p>
            {selectedInfo.proTip && (
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs">
                <span className="font-bold text-cyan-300 block mb-0.5">Apex Engineering Pro-Tip:</span>
                <span className="text-cyan-200/90">{selectedInfo.proTip}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SECTION CONTROL DECK CONTAINER ── */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-2xl">
        {/* ================================================================= */}
        {/* SECTION 1: COCKPIT OVERVIEW (overview)                            */}
        {/* ================================================================= */}
        {activePanel === "overview" && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Car size={16} className="text-red-400" />
                  Cockpit Overview & Factory Theme Presets
                </h3>
                <p className="text-xs text-slate-400">
                  Global cabin aesthetics, structural frame topology, material grades, and driver posture calibration.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-500/40 font-bold uppercase">
                  3/4 STUDIO SPORT CAM
                </span>
              </div>
            </div>

            {/* Vehicle Interior Platform Architecture & Dynamic GLB Swapper */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2.5 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck size={14} className="text-cyan-400" />
                  Vehicle Platform Architecture & Dedicated GLB
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold">
                  {interiorVariant.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Dynamically hot-swaps the underlying Class-A 3D CAD cockpit GLB inside this studio in real time.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: "sedan", label: "Standard / GT", sub: "Master Cockpit", icon: "🚗" },
                  { id: "pickup_truck", label: "Heavy Truck", sub: "Workstation GLB", icon: "🚚" },
                  { id: "bus_shuttle", label: "Transit Bus", sub: "Commercial GLB", icon: "🚌" },
                  { id: "luxury_sedan", label: "Executive LWB", sub: "VIP Lounge GLB", icon: "👑" },
                  { id: "supercar", label: "Track Special", sub: "Supercar GLB", icon: "🏎️" },
                ].map((p) => {
                  const isCur =
                    (p.id === "supercar" && interiorVariant === "supercar_cockpit") ||
                    (p.id === "bus_shuttle" && interiorVariant === "transit_bus") ||
                    (p.id === "pickup_truck" && interiorVariant === "heavy_duty_truck") ||
                    (p.id === "luxury_sedan" && interiorVariant === "executive_long_wheelbase") ||
                    (p.id === "sedan" && interiorVariant === "standard_cabin");
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        playHMIClickSound();
                        setSelectedModel(p.id as any);
                      }}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col ${
                        isCur
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-100 shadow-md ring-1 ring-cyan-400/50"
                          : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <span>{p.icon}</span>
                        <span>{p.label}</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 mt-0.5">{p.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Factory Theme Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-400" />
                Factory Curated Interior Themes
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {COCKPIT_THEME_PRESETS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      playHMITabSound();
                      applyThemePreset(t.id);
                    }}
                    className="p-3 rounded-xl text-left bg-slate-950/60 border border-slate-800 hover:border-red-500/60 hover:bg-slate-800/50 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs font-black text-slate-100 group-hover:text-red-300 transition-colors flex items-center justify-between">
                        <span>{t.name}</span>
                        <span
                          className="w-3 h-3 rounded-full border border-slate-600"
                          style={{ backgroundColor: t.ambientLightColor }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">{t.description}</p>
                    </div>
                    <div className="mt-2 text-[9px] font-mono text-cyan-400 font-bold uppercase">
                      LOAD PRESET →
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Structural Framework & Material Grade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
              {/* Structural Framework */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-cyan-400" />
                  <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                    Structural Chassis Architecture
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: "monocoque", label: "High-Rigidity Monocoque", stiffness: "+42 kNm/deg" },
                    { id: "spaceframe", label: "Extruded Aluminum Spaceframe", stiffness: "+36 kNm/deg" },
                    { id: "carbon_tub", label: "Autoclaved Carbon Tub", stiffness: "+58 kNm/deg" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        playHMIClickSound();
                        setChassisArch(opt.id);
                      }}
                      className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer text-xs ${
                        chassisArch === opt.id
                          ? "bg-cyan-500/15 border-cyan-400 text-cyan-200 font-bold shadow-sm"
                          : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span>{opt.label}</span>
                      <span className="text-[10px] font-mono text-cyan-400">{opt.stiffness}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Material Grade */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-amber-400" />
                  <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                    Material Alloy Grade
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: "stamped_steel", label: "Stamped Steel (Baseline Mass)", cost: "$" },
                    { id: "cast_aluminum", label: "Die-Cast Aluminum (-15% Mass)", cost: "$$" },
                    { id: "extruded_aluminum", label: "CNC Billet Alloy (-25% Mass)", cost: "$$$" },
                    { id: "carbon_composite", label: "Pre-Preg Carbon (-40% Mass)", cost: "$$$$$" },
                  ].map((mat) => (
                    <button
                      key={mat.id}
                      type="button"
                      onClick={() => {
                        playHMIClickSound();
                        setMaterialGrade(mat.id);
                      }}
                      className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer text-xs ${
                        materialGrade === mat.id
                          ? "bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow-sm"
                          : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span>{mat.label}</span>
                      <span className="text-[10px] font-mono text-amber-400 font-bold">{mat.cost}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 2: STEERING WHEEL (steering)                             */}
        {/* ================================================================= */}
        {activePanel === "steering" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Disc size={16} className="text-red-400" />
                  Steering Wheel Architecture & Controls
                </h3>
                <p className="text-xs text-slate-400">
                  Select wheel typology, high-grip upholstery materials, 12 o'clock racing stripe, and motorsport shifters.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-500/40 font-bold uppercase">
                  FOCUSED ON STEERING
                </span>
              </div>
            </div>

            {/* Standardized Steppers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InteriorOptionStepperBox
                label="Steering Typology"
                value={steeringWheelStyle}
                options={[
                  { value: "sport", label: "Sport 3-Spoke" },
                  { value: "gt_3spoke", label: "GT 3-Spoke (Flat-Bottom)" },
                  { value: "yoke", label: "GT3 Track Yoke" },
                  { value: "formula", label: "Formula Carbon Yoke" },
                  { value: "luxury_2spoke", label: "Luxury 2-Spoke" },
                  { value: "classic_4spoke", label: "Classic 4-Spoke" },
                  { value: "performance_4spoke", label: "Performance 4-Spoke" },
                ]}
                onChange={setSteeringWheelStyle}
                infoTitle="Steering Wheel Typology"
                infoDesc="Governs driver ergonomics, turn-in leverage, hand positioning, and instrument visibility."
                proTip="Open-top yokes increase cluster sightline clearance by 34%."
                onInfoClick={setSelectedInfo}
              />

              <InteriorOptionStepperBox
                label="Grip Upholstery"
                value={steeringGripMaterial}
                options={[
                  { value: "leather", label: "Nappa Leather" },
                  { value: "alcantara", label: "Motorsport Alcantara" },
                  { value: "perforated", label: "Perforated Leather" },
                  { value: "carbon", label: "Gloss Carbon Fiber" },
                  { value: "wood", label: "Bookmatched Walnut" },
                  { value: "suede", label: "Ultra Suede" },
                ]}
                onChange={setSteeringGripMaterial}
                infoTitle="Grip Upholstery Material"
                infoDesc="Affects friction coefficient against racing gloves and thermal heat dissipation."
                proTip="Alcantara ensures non-slip grip under high lateral-G steering loads."
                onInfoClick={setSelectedInfo}
              />
            </div>

            {/* Visual Card Selector for 7 Wheel Styles */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                1. Steering Wheel Architectures (7 Designs)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {(
                  [
                    { id: "sport", label: "Sport 3-Spoke", desc: "Contoured Nappa, aluminum hub" },
                    { id: "gt_3spoke", label: "GT 3-Spoke", desc: "Flat-bottom, perforated" },
                    { id: "yoke", label: "GT3 Track Yoke", desc: "Open-top racing yoke" },
                    { id: "formula", label: "Formula Carbon", desc: "Motorsport shift LEDs" },
                    { id: "luxury_2spoke", label: "Luxury 2-Spoke", desc: "Walnut swept arch" },
                    { id: "classic_4spoke", label: "Classic 4-Spoke", desc: "Stainless steel vintage" },
                    { id: "performance_4spoke", label: "Performance 4-Spoke", desc: "Forged split carbon" },
                  ] as const
                ).map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => {
                      playHMIClickSound();
                      setSteeringWheelStyle(w.id);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      steeringWheelStyle === w.id
                        ? "bg-red-600/20 border-red-500 text-white shadow-sm ring-1 ring-red-500"
                        : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-700/60"
                    }`}
                  >
                    <div className="text-[11px] font-black">{w.label}</div>
                    <div className="text-[9px] text-slate-400 leading-tight mt-0.5">{w.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 12 O'Clock Stripe, Paddle Shifters & Drive Mode Dial */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800/60">
              {/* 12 O'Clock Stripe */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  2. 12 O'Clock Racing Center Stripe
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(["none", "red", "yellow", "blue", "white", "green"] as const).map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => {
                        playHMIClickSound();
                        setSteeringStripe(col);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all cursor-pointer ${
                        steeringStripe === col
                          ? "bg-slate-700 border-red-500 text-white ring-1 ring-red-400 font-black"
                          : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700/50"
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paddle Shifters */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  3. Paddle Shifter Finishes
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: "none", label: "None" },
                      { id: "billet", label: "Billet Aluminum" },
                      { id: "carbon", label: "3K Carbon" },
                      { id: "forged_carbon", label: "Forged Carbon" },
                      { id: "red", label: "Anodized Red" },
                      { id: "extended", label: "GT3 Extended" },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        playHMIClickSound();
                        setPaddleShifters(p.id);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer truncate text-center ${
                        paddleShifters === p.id
                          ? "bg-red-600/20 border-red-500 text-red-300"
                          : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drive Mode Rotary Dial */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  4. Drive Mode Rotary Dial
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["comfort", "eco", "sport", "sport_plus", "track", "custom"] as const).map((dm) => (
                    <button
                      key={dm}
                      type="button"
                      onClick={() => {
                        playHMIClickSound();
                        setDriveMode(dm);
                      }}
                      className={`px-1.5 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all cursor-pointer text-center truncate ${
                        driveMode === dm
                          ? "bg-red-600/20 border-red-500 text-red-300"
                          : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50"
                      }`}
                    >
                      {dm.replace("_", "+")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 3: INSTRUMENT CLUSTER (cluster)                          */}
        {/* ================================================================= */}
        {activePanel === "cluster" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Gauge size={16} className="text-red-400" />
                  Driver Instrument Cluster Binnacle & Head-Up Display
                </h3>
                <p className="text-xs text-slate-400">
                  Configure driver gauge telemetry presentation, virtual screen modes, and windshield HUD projection.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-500/40 font-bold uppercase">
                  FOCUSED ON CLUSTER
                </span>
              </div>
            </div>

            {/* Standardized Steppers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InteriorOptionStepperBox
                label="Cluster Binnacle Architecture"
                value={clusterStyle}
                options={[
                  { value: "digital", label: "Full Virtual OLED Display" },
                  { value: "analog", label: "Classic Analog Dials" },
                  { value: "performance", label: "Performance Chrono Dial" },
                  { value: "track", label: "F1 Shift LED Track Screen" },
                  { value: "minimal", label: "Minimalist Floating OLED" },
                ]}
                onChange={setClusterStyle}
                infoTitle="Driver Instrument Cluster Binnacle"
                infoDesc="Controls gauge telemetry presentation (Analog dials vs Virtual OLED screen vs Windshield HUD)."
                proTip="F1 Track mode projects tachometer sweep and gear delta into the central driver focal plane."
                onInfoClick={setSelectedInfo}
              />

              <InteriorOptionStepperBox
                label="Windshield Head-Up Display (HUD)"
                value={hudMode}
                options={[
                  { value: "off", label: "HUD: Deactivated" },
                  { value: "performance", label: "HUD: Chrono & G-Meter" },
                  { value: "navigation", label: "HUD: Turn-by-Turn Nav" },
                  { value: "minimal", label: "HUD: Speed & Speed Limit" },
                ]}
                onChange={setHudMode}
                infoTitle="Windshield Head-Up Display (HUD)"
                infoDesc="Projects critical speed, RPM, and turn-by-turn navigation data directly into the driver sightline."
                proTip="Reduces driver glance time away from the apex to under 0.25 seconds."
                onInfoClick={setSelectedInfo}
              />
            </div>

            {/* Visual Style Cards */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Cluster Theme Modes
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {(
                  [
                    { id: "digital", label: "Digital ADAS", desc: "Autonomy & lane tracking" },
                    { id: "analog", label: "Analog Dials", desc: "Dual chrome gauge pods" },
                    { id: "performance", label: "Performance Chrono", desc: "Central rev needle & boost" },
                    { id: "track", label: "F1 Track Mode", desc: "Telemetry & shift lights" },
                    { id: "minimal", label: "Minimalist OLED", desc: "Clean HUD focal points" },
                  ] as const
                ).map((cs) => (
                  <button
                    key={cs.id}
                    type="button"
                    onClick={() => {
                      playHMIClickSound();
                      setClusterStyle(cs.id);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      clusterStyle === cs.id
                        ? "bg-red-600/20 border-red-500 text-white ring-1 ring-red-500 shadow-sm"
                        : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50"
                    }`}
                  >
                    <div className="text-[11px] font-black">{cs.label}</div>
                    <div className="text-[9px] text-slate-400 leading-tight mt-0.5">{cs.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 4: CENTER DISPLAY (infotainment)                         */}
        {/* ================================================================= */}
        {activePanel === "infotainment" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Tv size={16} className="text-red-400" />
                  Central 12.3-inch Infotainment Display & Audio
                </h3>
                <p className="text-xs text-slate-400">
                  Switch interactive display HMI applications, telematics computing modes, and premium acoustic sound stages.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-500/40 font-bold uppercase">
                  FOCUSED ON DISPLAY
                </span>
              </div>
            </div>

            {/* Standardized Steppers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InteriorOptionStepperBox
                label="Display Physical Glass Topology"
                value={infotainmentMode}
                options={[
                  { value: "navigation", label: "12.3\" 3D GPS Satellite Nav" },
                  { value: "telemetry", label: "12.3\" Real-Time Vehicle Telemetry" },
                  { value: "media", label: "12.3\" Audiophile Media & DAB" },
                  { value: "climate", label: "12.3\" Multi-Zone HVAC Interface" },
                  { value: "performance", label: "12.3\" Lap Timer & G-Force Chrono" },
                ]}
                onChange={setInfotainmentMode}
                infoTitle="Central Infotainment Touchscreen"
                infoDesc="Determines central display diagonal size, HMI graphics, and navigation telematics."
                proTip="12.3-inch widescreen maximizes split-screen telemetry and lap timer view."
                onInfoClick={setSelectedInfo}
              />

              <InteriorOptionStepperBox
                label="Acoustic Sound Stage"
                value={audioSystemGrade}
                options={[
                  { value: "standard", label: "6-Speaker Standard Hi-Fi" },
                  { value: "harman", label: "12-Speaker Harman Kardon 600W" },
                  { value: "burmester", label: "16-Speaker Burmester 3D 1000W" },
                  { value: "bowers", label: "22-Speaker Bowers & Wilkins Diamond 1400W" },
                ]}
                onChange={setAudioSystemGrade}
                infoTitle="Premium Cockpit Audio System"
                infoDesc="Diamond-dome tweeters and active active noise cancellation speakers integrated into headrests."
                proTip="Burmester 3D sound uses transducer exciters in seat cushions for tactile bass resonance."
                onInfoClick={setSelectedInfo}
              />
            </div>

            {/* 8 Interactive Screen Modes Grid */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Infotainment UI Screen Modes (8 Live Canvases)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: "navigation", label: "Navigation", icon: NavIcon, desc: "3D Satellite Maps" },
                    { id: "telemetry", label: "Telemetry", icon: Activity, desc: "G-Forces & Pressures" },
                    { id: "media", label: "Media Audio", icon: Radio, desc: "FLAC Lossless Audio" },
                    { id: "climate", label: "HVAC Climate", icon: Thermometer, desc: "Dual/Quad Zone" },
                    { id: "vehicle", label: "EV Health", icon: Zap, desc: "SoC & Thermal Battery" },
                    { id: "camera", label: "360° Cam", icon: Camera, desc: "Surround Obstacle View" },
                    { id: "performance", label: "Chrono", icon: Gauge, desc: "Lap Times & Delta" },
                    { id: "settings", label: "Settings", icon: Sliders, desc: "Vehicle Dynamics" },
                  ] as const
                ).map((im) => {
                  const Icon = im.icon;
                  return (
                    <button
                      key={im.id}
                      type="button"
                      onClick={() => {
                        playHMIClickSound();
                        setInfotainmentMode(im.id);
                      }}
                      className={`flex items-start gap-2.5 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        infotainmentMode === im.id
                          ? "bg-red-600/20 border-red-500 text-white ring-1 ring-red-400 shadow-sm"
                          : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50"
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${infotainmentMode === im.id ? "bg-red-500/30 text-red-300" : "bg-slate-700 text-slate-400"}`}>
                        <Icon size={14} />
                      </div>
                      <div>
                        <div className="text-[11px] font-black">{im.label}</div>
                        <div className="text-[9px] text-slate-400 leading-tight">{im.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 5: CENTER CONSOLE (console)                              */}
        {/* ================================================================= */}
        {activePanel === "console" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Sliders size={16} className="text-red-400" />
                  Center Console Shifter Mechanism & Climate Control
                </h3>
                <p className="text-xs text-slate-400">
                  Select transmission selector mechanics, tactile HVAC rotary hardware, and wireless phone charging cradle.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-500/40 font-bold uppercase">
                  FOCUSED ON CONSOLE
                </span>
              </div>
            </div>

            {/* Standardized Steppers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InteriorOptionStepperBox
                label="Shifter Mechanism"
                value={shifterStyle}
                options={[
                  { value: "auto", label: "Auto Leather Selector" },
                  { value: "manual_gated", label: "Gated Slotted Chrome" },
                  { value: "manual_h", label: "6-Speed H-Pattern Boot" },
                  { value: "toggle", label: "Satin Aluminum Toggle" },
                  { value: "rotary", label: "Knurled Aluminum Dial" },
                  { value: "crystal", label: "Faceted Diamond Crystal" },
                  { value: "performance", label: "Sequential Stalk Lever" },
                ]}
                onChange={setShifterStyle}
                infoTitle="Shifter Mechanism & Linkage"
                infoDesc="Tactile feedback and shift linkage connection to the gearbox or drive-by-wire controller."
                proTip="Gated manual provides satisfying metallic click on every gear gate engagement."
                onInfoClick={setSelectedInfo}
              />

              <InteriorOptionStepperBox
                label="HVAC Climate Zone Hardware"
                value={hvacDualZone ? "dual" : "single"}
                options={[
                  { value: "single", label: "Single-Zone Automatic" },
                  { value: "dual", label: "Dual-Zone Driver/Passenger Split" },
                ]}
                onChange={(val) => setHvacDualZone(val === "dual")}
                infoTitle="Climate Control & Thermal Management"
                infoDesc="Independent microclimate temperature regulation for driver, passenger, and rear occupants."
                proTip="Dual-zone compressor balances cabin air enthalpy with minimal parasitic powertrain draw."
                onInfoClick={setSelectedInfo}
              />
            </div>

            {/* 7 Shifter Mechanism Cards */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Transmission Selector Hardware (7 Styles)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {(
                  [
                    { id: "auto", label: "Auto Lever", desc: "Perforated leather grip" },
                    { id: "manual_gated", label: "Gated Manual", desc: "Open chrome slotted gate" },
                    { id: "manual_h", label: "H-Pattern Boot", desc: "Leather boot 6-speed" },
                    { id: "toggle", label: "Electronic Toggle", desc: "Satin aluminum rocker" },
                    { id: "rotary", label: "Rotary Controller", desc: "Knurled aluminum dial" },
                    { id: "crystal", label: "Crystal Glass", desc: "Faceted diamond jewel" },
                    { id: "performance", label: "Sequential Lever", desc: "Motorsport carbon stalk" },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      playHMIClickSound();
                      setShifterStyle(s.id);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      shifterStyle === s.id
                        ? "bg-red-600/20 border-red-500 text-white ring-1 ring-red-500 shadow-sm"
                        : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-700/60"
                    }`}
                  >
                    <div className="text-[11px] font-black">{s.label}</div>
                    <div className="text-[9px] text-slate-400 leading-tight mt-0.5">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 6: DASHBOARD TRIM (dashboard)                            */}
        {/* ================================================================= */}
        {activePanel === "dashboard" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-red-400" />
                  Dashboard Cowl & Decorative Trim Inlays
                </h3>
                <p className="text-xs text-slate-400">
                  Select hand-crafted timber, autoclave twill carbon, brushed titanium spears, and upper pad leathers.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-500/40 font-bold uppercase">
                  FOCUSED ON DASH TRIM
                </span>
              </div>
            </div>

            {/* Upper Dash Pad Leather Swatches */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                1. Upper Dashboard Cowl Nappa Leather Swatch
              </label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {[
                  { name: "Obsidian Black", hex: "#17181c" },
                  { name: "Charcoal Grey", hex: "#26282e" },
                  { name: "Cognac Tan", hex: "#9a5b32" },
                  { name: "Crimson Burgundy", hex: "#7f1d1d" },
                  { name: "Dark Navy", hex: "#1e293b" },
                  { name: "Cream Beige", hex: "#d4c5a9" },
                ].map((sw) => (
                  <button
                    key={sw.hex}
                    type="button"
                    onClick={() => {
                      playHMIClickSound();
                      setUpperDashPadColor(sw.hex);
                    }}
                    title={sw.name}
                    className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                      upperDashPadColor === sw.hex
                        ? "scale-115 border-red-500 shadow-md ring-2 ring-red-400/40"
                        : "border-slate-600 hover:scale-105"
                    }`}
                    style={{ backgroundColor: sw.hex }}
                  >
                    {upperDashPadColor === sw.hex && <Check size={14} className="text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Decorative Trim Spear Inlays (11 Materials) */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                2. Main Decorative Dash Spear Inlay (11 Materials)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {(
                  [
                    { id: "walnut", label: "American Walnut", desc: "Open-pore bookmatched" },
                    { id: "dark_walnut", label: "Dark Walnut", desc: "Stained deep espresso" },
                    { id: "carbon", label: "3K Twill Carbon", desc: "High-gloss clearcoat" },
                    { id: "forged_carbon", label: "Forged Carbon", desc: "Matte motorsport composite" },
                    { id: "titanium", label: "Brushed Titanium", desc: "Aerospace satin grade" },
                    { id: "aluminum", label: "Satin Aluminum", desc: "Machined jewel finish" },
                    { id: "piano_black", label: "Piano Black", desc: "Mirror lacquer gloss" },
                    { id: "bronze", label: "Anodized Bronze", desc: "Warm metallic luxury" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      playHMIClickSound();
                      setDashboardTrimMaterial(t.id);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      dashboardTrimMaterial === t.id
                        ? "bg-red-600/20 border-red-500 text-white ring-1 ring-red-500 shadow-sm"
                        : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-700/60"
                    }`}
                  >
                    <div className="text-[11px] font-black">{t.label}</div>
                    <div className="text-[9px] text-slate-400 leading-tight mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 7: SEATS & SEATING (seats)                               */}
        {/* ================================================================= */}
        {activePanel === "seats" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Armchair size={16} className="text-red-400" />
                  Seating Architecture, Upholstery & Multi-Passenger Deck
                </h3>
                <p className="text-xs text-slate-400">
                  Configure driver & passenger bolsters, carbon racing shells, French stitching accents, and Van/MPV cargo rows.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-500/40 font-bold uppercase">
                  FOCUSED ON SEATS
                </span>
              </div>
            </div>

            {/* Standardized Steppers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InteriorOptionStepperBox
                label="Seating Bolster Geometry"
                value={seatStyle}
                options={[
                  { value: "sport", label: "Sport Bolstered (Contoured Lateral Support)" },
                  { value: "bucket", label: "Carbon Monocoque Bucket (Track Spec)" },
                  { value: "luxury", label: "Executive Lounge (Ventilated Massaging)" },
                  { value: "racing", label: "FIA Competition Recaro Shell" },
                  { value: "standard", label: "Standard Comfort Seating" },
                ]}
                onChange={setSeatStyle}
                infoTitle="Driver & Passenger Seating Ergonomics"
                infoDesc="Configures bolster depth, lumbar adjustability, and lateral G-force support."
                proTip="Carbon bucket seats lock the pelvis into the chassis for enhanced vehicle yaw feedback."
                onInfoClick={setSelectedInfo}
              />

              <InteriorOptionStepperBox
                label="Seatbelt Webbing Color"
                value={seatBeltColor}
                options={[
                  { value: "black", label: "Obsidian Black Webbing" },
                  { value: "red", label: "Guards Red Racing Harness" },
                  { value: "yellow", label: "Speed Yellow Track Webbing" },
                  { value: "blue", label: "Miami Blue Webbing" },
                  { value: "grey", label: "Silver Grey Metallic Webbing" },
                ]}
                onChange={setSeatBeltColor}
                infoTitle="Seatbelt Restraint Webbing"
                infoDesc="High-tensile polyester webbing woven to exceed FMVSS 209 and FIA 8853 motorsport safety criteria."
                onInfoClick={setSelectedInfo}
              />
            </div>

            {/* Contrast French Stitching Color Accent */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Contrast French Stitching Accent
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {(["matching", "red", "gold", "silver", "blue", "orange"] as StitchingColor[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      playHMIClickSound();
                      setStitchingColor(st);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border transition-all cursor-pointer ${
                      stitchingColor === st
                        ? "bg-red-600/20 border-red-500 text-red-300 ring-1 ring-red-400 font-black"
                        : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50"
                    }`}
                  >
                    {st} Stitching
                  </button>
                ))}
              </div>
            </div>

            {/* Modular Van / MPV Multi-Passenger Seating Architecture Deck */}
            <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 space-y-2 mt-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Users size={15} className="text-emerald-400" />
                  <span className="text-xs font-black text-emerald-300 uppercase tracking-wider font-mono">
                    MODULAR VAN / MPV PASSENGER ARCHITECTURE
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">
                    Cargo Volume: <strong className="text-emerald-400 text-sm">{vanVolume.cargoVolumeL} L</strong>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400">
                    Payload: <strong className="text-slate-200">{vanVolume.floorPayloadKg} kg</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {(["2_seat_cargo", "5_seat", "7_seat", "8_seat", "9_seat"] as VanSeatConfig[]).map((cfg) => {
                  const isSelected = vanSeatConfig === cfg;
                  return (
                    <button
                      key={cfg}
                      type="button"
                      onClick={() => {
                        playHMIClickSound();
                        setVanSeatConfig(cfg);
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-emerald-500 text-slate-950 border-emerald-300 shadow-md font-black"
                          : "bg-slate-900/80 text-slate-300 border-slate-700/80 hover:border-emerald-500/50"
                      }`}
                    >
                      {cfg.replace(/_/g, " ").toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 7B: REAR CABIN & MULTI-ROW SEATING (rear_cabin)          */}
        {/* ================================================================= */}
        {activePanel === "rear_cabin" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Sofa size={16} className="text-red-400" />
                  Rear Cabin & Cabin Architecture
                </h3>
                <p className="text-xs text-slate-400">
                  {interiorVariant === "executive_long_wheelbase"
                    ? "Flagship Chauffeured Cabin: +270mm extended legroom, motorized calf ottomans, champagne chiller bar, and deployable 31.3\" 8K theater screen."
                    : interiorVariant === "heavy_duty_truck"
                    ? "Heavy-Duty Commercial Cabin: High-command upright seating, 4WD transfer case mode dial, auxiliary switchpod, and under-seat lockbox."
                    : interiorVariant === "transit_bus"
                    ? "Urban Transit Saloon: Forward elevated driver station, fare validator terminal, overhead stanchion safety poles, and multi-row transit passenger seating."
                    : interiorVariant === "supercar_cockpit"
                    ? "Mid-Engine Performance Cockpit: Monocoque carbon tub fixed twin/monoposto seating; optimized for track telemetry and lateral G support."
                    : "Configure passenger seating capacity, Row 2 & Row 3 styles, entertainment, and rear climate comfort zones."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold uppercase">
                  {seatingBadge.label}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold">
                  {seatingBadge.range}
                </span>
                {interiorVariant === "executive_long_wheelbase" && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 font-black">
                    CHAUFFEURED LWB (+270mm LEG SPACE)
                  </span>
                )}
                {interiorVariant === "heavy_duty_truck" && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-black">
                    HIGH-COMMAND UTILITY CAB
                  </span>
                )}
                {interiorVariant === "transit_bus" && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-950/80 text-violet-300 border border-violet-500/40 font-black">
                    TRANSIT MULTI-ROW SALOON
                  </span>
                )}
                {interiorVariant === "supercar_cockpit" && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/40 font-black">
                    CARBON TUB COCKPIT
                  </span>
                )}
              </div>
            </div>

            {/* 1. SEATING CAPACITY SELECTOR (Dynamic Body-Type Feasible Options) */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users size={13} className="text-amber-400" />
                  1. Passenger Seating Capacity
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-normal">
                  {allowedSeatingOptions.length} valid option{allowedSeatingOptions.length > 1 ? "s" : ""} for {seatingBadge.label}
                </span>
              </label>
              <div className={`grid gap-2.5 ${
                allowedSeatingOptions.length === 1
                  ? "grid-cols-1"
                  : allowedSeatingOptions.length === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : allowedSeatingOptions.length === 3
                  ? "grid-cols-1 sm:grid-cols-3"
                  : "grid-cols-2 sm:grid-cols-4"
              }`}>
                {allowedSeatingOptions.map((cap) => {
                  const isSelected = seatingCapacity === cap.seats;
                  return (
                    <button
                      key={cap.seats}
                      type="button"
                      onClick={() => {
                        playHMIClickSound();
                        setSeatingCapacity(cap.seats);
                      }}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-red-600/20 border-red-500 text-white ring-1 ring-red-500 shadow-lg"
                          : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-700/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-black">{cap.label}</div>
                        {isSelected && <Check size={12} className="text-red-400" />}
                      </div>
                      <div className="text-[10px] font-mono text-cyan-400 font-bold mt-0.5">{cap.layout}</div>
                      <div className="text-[9px] text-slate-400 leading-tight mt-1">{cap.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. ROW 2 SEATING STYLE (or Informative Card for Front-Row-Only vehicles) */}
            {isRow2Available(selectedModel, seatingCapacity) ? (
              <div className="space-y-2 pt-1 border-t border-slate-800/60">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Armchair size={13} className="text-cyan-400" />
                    2. Row 2 Seating Style (Second Row)
                  </span>
                  {interiorVariant === "executive_long_wheelbase" && (
                    <span className="text-[10px] font-mono text-amber-400 font-bold">
                      EXECUTIVE LOUNGE SPEC
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {([
                    {
                      id: "split_bench_40_20_40" as Row2SeatingType,
                      label: interiorVariant === "executive_long_wheelbase" ? "Executive 40/20/40 Bench" : "40/20/40 Split Bench",
                      desc: interiorVariant === "executive_long_wheelbase"
                        ? "3-abreast seating with deployable touch-command VIP smart tablet center armrest"
                        : "3-abreast with fold-down center armrest and twin cupholders",
                    },
                    {
                      id: "executive_captain_chairs" as Row2SeatingType,
                      label: "Executive Captain Chairs",
                      desc: interiorVariant === "executive_long_wheelbase"
                        ? "Individual power-reclining thrones with continuous champagne chiller waterfall console"
                        : "Individual power-reclining captains with floor console and isolating armrests",
                    },
                    {
                      id: "luxury_lounge" as Row2SeatingType,
                      label: "Luxury Lounge Recliners",
                      desc: "Extended Ottoman-slide power recliners with motorized calf supports and 10-point massage",
                    },
                  ]).map((r2) => (
                    <button
                      key={r2.id}
                      type="button"
                      onClick={() => {
                        playHMIClickSound();
                        setRow2SeatingType(r2.id);
                      }}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                        row2SeatingType === r2.id
                          ? "bg-cyan-500/15 border-cyan-400 text-cyan-200 font-bold shadow-sm"
                          : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-700/60"
                      }`}
                    >
                      <div className="text-[11px] font-black">{r2.label}</div>
                      <div className="text-[9px] text-slate-400 leading-tight mt-0.5">{r2.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 flex items-start gap-3">
                <Shield size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-200">Front-Row Only Cockpit Architecture</div>
                  <div className="text-[10px] text-slate-400 leading-relaxed">
                    {seatingBadge.label} is strictly engineered for front-row occupancy ({seatingCapacity} seat{seatingCapacity > 1 ? "s" : ""}).
                    The rear space is allocated for structural chassis rigidity, mid-engine powertrain, or commercial cargo bulkheads.
                  </div>
                </div>
              </div>
            )}

            {/* 3. ROW 3 CONFIGURATION (only when physically possible and selected capacity >= 6) */}
            {isRow3Available(selectedModel, seatingCapacity) && seatingCapacity >= 6 && (
              <div className="space-y-2 pt-1 border-t border-slate-800/60">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users size={13} className="text-emerald-400" />
                  3. Row 3 Configuration (Third Row)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {([
                    { id: "fold_flat_bench" as Row3SeatingType, label: "Fold-Flat Bench", desc: "Electric fold-flat into cargo floor for maximum luggage volume" },
                    { id: "split_50_50" as Row3SeatingType, label: "50/50 Split Fold", desc: "Independent left/right folding for versatile passenger-cargo mix" },
                    { id: "power_stow" as Row3SeatingType, label: "Power-Stow Retractable", desc: "One-touch retractable power-stow seats flush into the cargo floor" },
                  ]).map((r3) => (
                    <button
                      key={r3.id}
                      type="button"
                      onClick={() => {
                        playHMIClickSound();
                        setRow3SeatingType(r3.id);
                      }}
                      className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                        row3SeatingType === r3.id
                          ? "bg-emerald-500/15 border-emerald-400 text-emerald-200 font-bold shadow-sm"
                          : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-700/60"
                      }`}
                    >
                      <div className="text-[11px] font-black">{r3.label}</div>
                      <div className="text-[9px] text-slate-400 leading-tight mt-0.5">{r3.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── BESPOKE DEDICATED ARCHITECTURE DECKS ── */}

            {/* A. LUXURY SEDAN & LIMOUSINE EXECUTIVE LOUNGE DECK */}
            {interiorVariant === "executive_long_wheelbase" && (
              <div className="space-y-2.5 pt-2 border-t border-amber-500/30 bg-amber-950/10 p-3 rounded-xl border">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-400" />
                    Chauffeured VIP Executive Suite (+270mm Stretched Cabin)
                  </label>
                  <span className="text-[9px] font-mono text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-900/40 border border-amber-500/30">
                    FLAGSHIP AMENITIES
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Motorized Calf Ottomans Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      playHMIClickSound();
                      setLuxuryOttomanDeployed(!luxuryOttomanDeployed);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2.5 ${
                      luxuryOttomanDeployed
                        ? "bg-amber-500/20 border-amber-400 text-amber-100 shadow-sm"
                        : "bg-slate-800/70 border-slate-700 text-slate-400 hover:bg-slate-700/70"
                    }`}
                  >
                    <div className={`w-8 h-4.5 rounded-full transition-colors flex items-center ${luxuryOttomanDeployed ? "bg-amber-500 justify-end" : "bg-slate-700 justify-start"}`}>
                      <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm mx-0.5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-black">60° Power Calf Ottomans</div>
                      <div className="text-[9px] text-slate-400 leading-tight">Motorized legrest extension with heated footplate</div>
                    </div>
                  </button>

                  {/* Champagne Chiller & Bar Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      playHMIClickSound();
                      setLuxuryChampagneChiller(!luxuryChampagneChiller);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2.5 ${
                      luxuryChampagneChiller
                        ? "bg-amber-500/20 border-amber-400 text-amber-100 shadow-sm"
                        : "bg-slate-800/70 border-slate-700 text-slate-400 hover:bg-slate-700/70"
                    }`}
                  >
                    <div className={`w-8 h-4.5 rounded-full transition-colors flex items-center ${luxuryChampagneChiller ? "bg-amber-500 justify-end" : "bg-slate-700 justify-start"}`}>
                      <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm mx-0.5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-black flex items-center gap-1">
                        <Wine size={11} className="text-amber-400" />
                        Champagne Chiller Bar
                      </div>
                      <div className="text-[9px] text-slate-400 leading-tight">6°C thermoelectric cooler + twin crystal flutes</div>
                    </div>
                  </button>

                  {/* Drop-down 31.3" 8K Theater Display */}
                  <button
                    type="button"
                    onClick={() => {
                      playHMIClickSound();
                      setLuxuryTheaterScreen(!luxuryTheaterScreen);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2.5 ${
                      luxuryTheaterScreen
                        ? "bg-amber-500/20 border-amber-400 text-amber-100 shadow-sm"
                        : "bg-slate-800/70 border-slate-700 text-slate-400 hover:bg-slate-700/70"
                    }`}
                  >
                    <div className={`w-8 h-4.5 rounded-full transition-colors flex items-center ${luxuryTheaterScreen ? "bg-amber-500 justify-end" : "bg-slate-700 justify-start"}`}>
                      <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm mx-0.5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-black flex items-center gap-1">
                        <Tv size={11} className="text-amber-400" />
                        31.3" 8K Cinema Display
                      </div>
                      <div className="text-[9px] text-slate-400 leading-tight">Motorized ceiling cinema screen + Bowers & Wilkins audio</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* B. TRUCK & HEAVY UTILITY COCKPIT DECK */}
            {interiorVariant === "heavy_duty_truck" && (
              <div className="space-y-2.5 pt-2 border-t border-emerald-500/30 bg-emerald-950/10 p-3 rounded-xl border">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck size={13} className="text-emerald-400" />
                    Heavy-Duty Truck & 4WD Utility Controls
                  </label>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-900/40 border border-emerald-500/30">
                    ALL-TERRAIN UTILITY
                  </span>
                </div>
                {/* 4WD Transfer Case Stepper */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-300 font-bold">4WD Transfer Case Mode:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { mode: "2H" as const, label: "2H (RWD)", desc: "Highway efficiency" },
                      { mode: "4H" as const, label: "4H (4WD High)", desc: "All-weather trail traction" },
                      { mode: "4L" as const, label: "4L (Low-Range)", desc: "Rock crawl torque multiplication" },
                    ]).map((t) => (
                      <button
                        key={t.mode}
                        type="button"
                        onClick={() => {
                          playHMIClickSound();
                          setTruck4WdMode(t.mode);
                        }}
                        className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                          truck4WdMode === t.mode
                            ? "bg-emerald-600/25 border-emerald-400 text-emerald-200 font-bold shadow-sm"
                            : "bg-slate-800/70 border-slate-700 text-slate-400 hover:bg-slate-700/70"
                        }`}
                      >
                        <div className="text-[10px] font-black">{t.label}</div>
                        <div className="text-[8px] text-slate-400 leading-tight mt-0.5">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Truck Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      playHMIClickSound();
                      setTruckAuxSwitchpod(!truckAuxSwitchpod);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2.5 ${
                      truckAuxSwitchpod
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-100 shadow-sm"
                        : "bg-slate-800/70 border-slate-700 text-slate-400 hover:bg-slate-700/70"
                    }`}
                  >
                    <div className={`w-8 h-4.5 rounded-full transition-colors flex items-center ${truckAuxSwitchpod ? "bg-emerald-500 justify-end" : "bg-slate-700 justify-start"}`}>
                      <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm mx-0.5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-black">4-Gang Auxiliary Switchpod</div>
                      <div className="text-[9px] text-slate-400 leading-tight">Pre-wired winch, lightbar, & compressor relays</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playHMIClickSound();
                      setTruckUnderseatStorage(!truckUnderseatStorage);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2.5 ${
                      truckUnderseatStorage
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-100 shadow-sm"
                        : "bg-slate-800/70 border-slate-700 text-slate-400 hover:bg-slate-700/70"
                    }`}
                  >
                    <div className={`w-8 h-4.5 rounded-full transition-colors flex items-center ${truckUnderseatStorage ? "bg-emerald-500 justify-end" : "bg-slate-700 justify-start"}`}>
                      <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm mx-0.5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-black">Lockable Under-Seat Tool Chest</div>
                      <div className="text-[9px] text-slate-400 leading-tight">Heavy-duty weather-sealed steel gear vault</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* C. TRANSIT BUS & SHUTTLE DECK */}
            {interiorVariant === "transit_bus" && (
              <div className="space-y-2.5 pt-2 border-t border-violet-500/30 bg-violet-950/10 p-3 rounded-xl border">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Bus size={13} className="text-violet-400" />
                    Transit Bus Cockpit & Passenger Systems
                  </label>
                  <span className="text-[9px] font-mono text-violet-400 font-bold px-2 py-0.5 rounded bg-violet-900/40 border border-violet-500/30">
                    TRANSIT COACH SPEC
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playHMIClickSound();
                      setBusFareValidator(!busFareValidator);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2.5 ${
                      busFareValidator
                        ? "bg-violet-500/20 border-violet-400 text-violet-100 shadow-sm"
                        : "bg-slate-800/70 border-slate-700 text-slate-400 hover:bg-slate-700/70"
                    }`}
                  >
                    <div className={`w-8 h-4.5 rounded-full transition-colors flex items-center ${busFareValidator ? "bg-violet-500 justify-end" : "bg-slate-700 justify-start"}`}>
                      <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm mx-0.5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-black">Smartcard Ticket Farebox</div>
                      <div className="text-[9px] text-slate-400 leading-tight">Curbside contactless transit validator terminal</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playHMIClickSound();
                      setBusStanchionPoles(!busStanchionPoles);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2.5 ${
                      busStanchionPoles
                        ? "bg-violet-500/20 border-violet-400 text-violet-100 shadow-sm"
                        : "bg-slate-800/70 border-slate-700 text-slate-400 hover:bg-slate-700/70"
                    }`}
                  >
                    <div className={`w-8 h-4.5 rounded-full transition-colors flex items-center ${busStanchionPoles ? "bg-violet-500 justify-end" : "bg-slate-700 justify-start"}`}>
                      <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm mx-0.5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-black">Safety Grab Stanchion Poles</div>
                      <div className="text-[9px] text-slate-400 leading-tight">High-visibility safety yellow poles with stop bells</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* 4. REAR ENTERTAINMENT SUITE (for Passenger vehicles with Row 2) */}
            {isRow2Available(selectedModel, seatingCapacity) && interiorVariant !== "heavy_duty_truck" && (
              <div className="space-y-2 pt-1 border-t border-slate-800/60">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Tv size={13} className="text-violet-400" />
                  Rear Entertainment Suite
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {([
                    { id: "none" as RearEntertainment, label: "None", desc: "No rear screens" },
                    { id: "dual_11in_oled" as RearEntertainment, label: "Dual 11.6\" OLED", desc: "4K seatback screens on front headrests" },
                    { id: "overhead_theater_31in" as RearEntertainment, label: "31\" Theater", desc: "Panoramic 8K ceiling-mounted display" },
                    { id: "executive_bundle" as RearEntertainment, label: "Executive Bundle", desc: "Dual OLEDs + 31\" theater + wireless AirPlay" },
                  ]).map((ent) => (
                    <button
                      key={ent.id}
                      type="button"
                      onClick={() => {
                        playHMIClickSound();
                        setRearEntertainment(ent.id);
                      }}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        rearEntertainment === ent.id
                          ? "bg-violet-500/15 border-violet-400 text-violet-200 font-bold shadow-sm"
                          : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-700/60"
                      }`}
                    >
                      <div className="text-[11px] font-black">{ent.label}</div>
                      <div className="text-[9px] text-slate-400 leading-tight mt-0.5">{ent.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 5. REAR CLIMATE ZONE (for vehicles with Row 2) */}
            {isRow2Available(selectedModel, seatingCapacity) && (
              <div className="space-y-2 pt-1 border-t border-slate-800/60">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Thermometer size={13} className="text-blue-400" />
                  Rear Climate Zone Configuration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: "shared" as RearClimateZone, label: "Shared (Front Only)", desc: "Single-zone front climate extends to rear" },
                    { id: "tri_zone" as RearClimateZone, label: "Tri-Zone Automatic", desc: "Independent rear temp via ceiling vents" },
                    { id: "quad_zone_touch" as RearClimateZone, label: "Quad-Zone Touch HVAC", desc: "Individual touchscreen zones with seat ventilation" },
                  ]).map((cz) => (
                    <button
                      key={cz.id}
                      type="button"
                      onClick={() => {
                        playHMIClickSound();
                        setRearClimateZone(cz.id);
                      }}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        rearClimateZone === cz.id
                          ? "bg-blue-500/15 border-blue-400 text-blue-200 font-bold shadow-sm"
                          : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-700/60"
                      }`}
                    >
                      <div className="text-[11px] font-black">{cz.label}</div>
                      <div className="text-[9px] text-slate-400 leading-tight mt-0.5">{cz.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 6. REAR COMFORT FEATURE TOGGLES (for vehicles with Row 2) */}
            {isRow2Available(selectedModel, seatingCapacity) && (
              <div className="space-y-2 pt-1 border-t border-slate-800/60">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  Rear Comfort & Luxury Features
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Heated & Ventilated Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      playHMIClickSound();
                      setRearHeatedVentilated(!rearHeatedVentilated);
                    }}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-3 ${
                      rearHeatedVentilated
                        ? "bg-amber-500/15 border-amber-400 text-amber-200 shadow-sm"
                        : "bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-700/60"
                    }`}
                  >
                    <div className={`w-9 h-5 rounded-full transition-colors flex items-center ${rearHeatedVentilated ? "bg-amber-500 justify-end" : "bg-slate-700 justify-start"}`}>
                      <div className="w-4 h-4 rounded-full bg-white shadow-sm mx-0.5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-black">Heated & Ventilated Seats</div>
                      <div className="text-[9px] text-slate-400 leading-tight">3-stage rear seat heating + active ventilation</div>
                    </div>
                  </button>

                  {/* Massage Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      playHMIClickSound();
                      setRearMassage(!rearMassage);
                    }}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-3 ${
                      rearMassage
                        ? "bg-amber-500/15 border-amber-400 text-amber-200 shadow-sm"
                        : "bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-700/60"
                    }`}
                  >
                    <div className={`w-9 h-5 rounded-full transition-colors flex items-center ${rearMassage ? "bg-amber-500 justify-end" : "bg-slate-700 justify-start"}`}>
                      <div className="w-4 h-4 rounded-full bg-white shadow-sm mx-0.5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-black">Pneumatic Massage</div>
                      <div className="text-[9px] text-slate-400 leading-tight">10-program pneumatic lumbar and full-body massage</div>
                    </div>
                  </button>

                  {/* Folding Tables Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      playHMIClickSound();
                      setRearFoldingTables(!rearFoldingTables);
                    }}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-3 ${
                      rearFoldingTables
                        ? "bg-amber-500/15 border-amber-400 text-amber-200 shadow-sm"
                        : "bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-700/60"
                    }`}
                  >
                    <div className={`w-9 h-5 rounded-full transition-colors flex items-center ${rearFoldingTables ? "bg-amber-500 justify-end" : "bg-slate-700 justify-start"}`}>
                      <div className="w-4 h-4 rounded-full bg-white shadow-sm mx-0.5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-black">Billet Folding Tables</div>
                      <div className="text-[9px] text-slate-400 leading-tight">Airline-grade aluminum tray tables on seatbacks</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* REAR CABIN CAMERA SHORTCUTS */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">CAMERA:</span>
              {([
                { pose: "rear_cabin" as CameraPose, label: "Rear Overview", show: true },
                { pose: "rear_row2" as CameraPose, label: "Row 2 Focus", show: isRow2Available(selectedModel, seatingCapacity) },
                { pose: "rear_row3" as CameraPose, label: "Row 3 Focus", show: isRow3Available(selectedModel, seatingCapacity) && seatingCapacity >= 6 },
              ])
                .filter((cam) => cam.show)
                .map((cam) => (
                  <button
                    key={cam.pose}
                    type="button"
                    onClick={() => {
                      playHMIClickSound();
                      setCameraPose(cam.pose);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      cameraPose === cam.pose
                        ? "bg-red-600/20 border-red-500 text-red-300"
                        : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cam.label}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 8: DOORS & AMBIENT (doors)                               */}
        {/* ================================================================= */}
        {activePanel === "doors" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <DoorClosed size={16} className="text-red-400" />
                  Door Cards & Multi-Zone Ambient Neon Lightguides
                </h3>
                <p className="text-xs text-slate-400">
                  Select fiber-optic ambient illumination spectrum, window acoustic tint percentage, and door panel trim inserts.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-500/40 font-bold uppercase">
                  FOCUSED ON DOORS
                </span>
              </div>
            </div>

            {/* Standardized Stepper for Ambient Light */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InteriorOptionStepperBox
                label="Multi-Zone Ambient Light Channels"
                value={ambientLightColor}
                options={[
                  { value: "#06b6d4", label: "Cyan Neon (480nm)" },
                  { value: "#ef4444", label: "Crimson Red (630nm)" },
                  { value: "#f59e0b", label: "Amber Gold (590nm)" },
                  { value: "#3b82f6", label: "Electric Blue (450nm)" },
                  { value: "#a855f7", label: "Violet Purple (400nm)" },
                  { value: "#10b981", label: "Emerald Green (520nm)" },
                  { value: "#ffffff", label: "Ice White (6500K)" },
                ]}
                onChange={setAmbientLightColor}
                infoTitle="Multi-Zone Fiber-Optic Ambient Illumination"
                infoDesc="Multi-channel LED piping illuminating the dash contour, footwells, and center console."
                proTip="Ambient illumination enhances nighttime cockpit depth perception."
                onInfoClick={setSelectedInfo}
              />

              <InteriorOptionStepperBox
                label="Windshield & Window Privacy Tint"
                value={windshieldTint}
                options={[
                  { value: "clear", label: "Clear Glass (90% VLT)" },
                  { value: "light_tint", label: "Light Solar Tint (70% VLT)" },
                  { value: "medium_smoke", label: "Medium Acoustic Tint (50% VLT)" },
                  { value: "dark_smoke", label: "Privacy Dark Tint (30% VLT)" },
                  { value: "blue_tint", label: "Polarized Blue Glare Rejection" },
                  { value: "iridescent", label: "Thermal Iridescent Solar Shield" },
                ]}
                onChange={setWindshieldTint}
                infoTitle="Acoustic & Solar Tint Glass"
                infoDesc="Nanoceramic infrared rejection layer blocks 99% of UV rays and dampens high-frequency wind buffeting."
                onInfoClick={setSelectedInfo}
              />
            </div>

            {/* Color Swatches for Ambient Neon Lightguide */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Ambient Illumination Color Spectrum (8 Presets)
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                {[
                  { name: "Cyan Neon", hex: "#06b6d4" },
                  { name: "Crimson Red", hex: "#ef4444" },
                  { name: "Amber Gold", hex: "#f59e0b" },
                  { name: "Electric Blue", hex: "#3b82f6" },
                  { name: "Violet Purple", hex: "#a855f7" },
                  { name: "Emerald Green", hex: "#10b981" },
                  { name: "Ice White", hex: "#ffffff" },
                ].map((sw) => (
                  <button
                    key={sw.hex}
                    type="button"
                    onClick={() => {
                      playHMIClickSound();
                      setAmbientLightColor(sw.hex);
                    }}
                    title={sw.name}
                    className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                      ambientLightColor === sw.hex
                        ? "scale-125 border-white shadow-lg ring-2 ring-cyan-400/50"
                        : "border-slate-700 hover:scale-110"
                    }`}
                    style={{ backgroundColor: sw.hex }}
                  >
                    {ambientLightColor === sw.hex && <Check size={14} className="text-black drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 9: INTERIOR SUMMARY (summary)                            */}
        {/* ================================================================= */}
        {(activePanel === "summary" || activePanel === "other") && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Award size={16} className="text-red-400" />
                  Interior Ergonomics, Engineering Telemetry & CAD Audit
                </h3>
                <p className="text-xs text-slate-400">
                  Comprehensive audit of cockpit mass, structural rigidity, power consumption, ergonomics scores, and modular nodes.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-bold uppercase">
                  ZERO-OFFSET CAD VERIFIED
                </span>
              </div>
            </div>

            {/* Radar & Score Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Score Progress Bars */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <span className="text-xs font-extrabold uppercase text-slate-200 tracking-wider flex items-center gap-2">
                  <Activity size={14} className="text-red-400" />
                  Cockpit Ergonomic Index Scores
                </span>

                <div className="space-y-2 text-[11px]">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>LUXURY INDEX</span>
                      <span className="font-mono text-amber-300 font-bold">{engineering.luxuryScore}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${engineering.luxuryScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>SPORT & DYNAMICS</span>
                      <span className="font-mono text-red-400 font-bold">{engineering.sportScore}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${engineering.sportScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>TECHNOLOGY & AVIONICS</span>
                      <span className="font-mono text-cyan-400 font-bold">{engineering.technologyScore}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${engineering.technologyScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Engineering Metrics */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <span className="text-xs font-extrabold uppercase text-slate-200 tracking-wider flex items-center gap-2">
                  <Zap size={14} className="text-cyan-400" />
                  Engineering Telemetry Deltas
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-slate-500 text-[10px] uppercase font-bold">Total Interior Delta</div>
                    <div className="font-bold text-slate-100 mt-0.5 font-mono">${engineering.totalPriceDelta}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-slate-500 text-[10px] uppercase font-bold">Subassembly Mass</div>
                    <div className="font-bold text-emerald-400 mt-0.5 font-mono">{engineering.totalWeightDelta > 0 ? `+${engineering.totalWeightDelta}` : engineering.totalWeightDelta} kg</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-slate-500 text-[10px] uppercase font-bold">Cabin Power Draw</div>
                    <div className="font-bold text-cyan-400 mt-0.5 font-mono">{engineering.totalPowerConsumptionW} W</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-slate-500 text-[10px] uppercase font-bold">CAD Nodes Active</div>
                    <div className="font-bold text-amber-400 mt-0.5 font-mono">{interiorParts.length} Parts</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modular CAD Parts Visibility Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                <span className="flex items-center gap-1.5">
                  <Cpu size={13} className="text-cyan-400" />
                  Discrete Modular CAD Components ({interiorParts.length})
                </span>
                <span className="text-[10px] text-slate-500 font-mono">CLICK EYE TO TOGGLE VISIBILITY</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {interiorParts.map((part) => {
                  const visible = isPartVisible(part.id);
                  return (
                    <div
                      key={part.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                        visible
                          ? "bg-slate-950/70 border-slate-800 text-slate-200"
                          : "bg-slate-950/30 border-slate-800/40 text-slate-600 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <button
                          type="button"
                          onClick={() => {
                            playHMIClickSound();
                            togglePartVisibility(part.id);
                          }}
                          className={`p-1 rounded cursor-pointer transition-colors ${
                            visible ? "text-cyan-400 hover:text-cyan-300" : "text-slate-600"
                          }`}
                          title={visible ? "Hide Part in 3D" : "Show Part in 3D"}
                        >
                          {visible ? <Eye size={13} /> : <EyeOff size={13} />}
                        </button>
                        <span className="font-semibold truncate">{part.name}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">{part.massKg.toFixed(1)} kg</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions: Sync & Advance */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playHMIClickSound();
                    if (onApplyConfig) onApplyConfig();
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                >
                  <Save size={14} />
                  <span>SYNC TO VEHICLE</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playHMIClickSound();
                    resetConfig();
                  }}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
                  title="Reset to Factory Defaults"
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              {onSelectStage && (
                <button
                  type="button"
                  onClick={() => {
                    playHMITabSound();
                    if (onApplyConfig) onApplyConfig();
                    onSelectStage("safety");
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Check size={15} strokeWidth={3} />
                  <span>COMPLETE INTERIOR & ADVANCE TO SAFETY →</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
