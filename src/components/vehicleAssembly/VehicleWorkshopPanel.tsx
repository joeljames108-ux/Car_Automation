// ===================================================================
// VEHICLE ASSEMBLY WORKSHOP PANEL & 3-COLUMN CONFIGURATION DECK
// ===================================================================
// Replicates the exact layout structure of the Engine Designer:
// - Top Ribbon: Progress bar + Horizontal scrollable carousel of components
// - Bottom Deck: 3-column interactive configuration deck:
//   Column 1: Part Architecture & Dimension Controls
//   Column 2: Metallurgy & Material Grade Selection (4 tiers)
//   Column 3: Engineering Impact & Spec Deltas + Advisory
// ===================================================================

import React, { useState, useRef, useMemo } from "react";
import {
  Wrench,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  Scale,
  DollarSign,
  Activity,
  Zap,
  Info,
  Car,
  Settings,
  Flame,
  Cpu,
} from "lucide-react";
import {
  VehicleComponentId,
  VehicleAssemblyComponentMeta,
  getVehicleAssemblyComponents,
} from "../../sim/vehicleAssemblyTypes";
import { AssemblyPhase, MaterialGrade } from "../../sim/assemblyTypes";
import {
  VehicleConfig,
  DriveType,
  EnginePosition,
  ChassisType,
  SuspensionType,
  BrakeType,
  TransmissionType,
  TireCompound,
} from "../../sim/types";
import { Slider, ChoiceGrid, Toggle } from "../ui/Controls";

interface VehicleWorkshopPanelProps {
  installedComponents: VehicleComponentId[];
  activeComponentId: VehicleComponentId | null;
  phase: AssemblyPhase;
  hoveredComponentId: VehicleComponentId | null;
  canInstall: (id: VehicleComponentId) => boolean;
  onStartInstall: (id: VehicleComponentId) => void;
  onHoverComponent: (id: VehicleComponentId | null) => void;
  progressPercentage: number;
  currentStats: {
    hp: number;
    torque: number;
    weight: number;
    reliability: number;
    cost: number;
  };
  selectedVariants?: Record<string, MaterialGrade>;
  onSelectVariant?: (id: VehicleComponentId, variant: MaterialGrade) => void;
  vehicleConfig?: Partial<VehicleConfig>;
  onUpdateVehicle?: (partial: Partial<VehicleConfig>) => void;
  className?: string;
}

const RIBBON_ITEMS = [
  { id: "architecture", number: "#0", name: "Architecture", category: "Core" },
  { id: "chassis_frame", number: "#1", name: "Chassis Monocoque", category: "Structure" },
  { id: "subframe_front", number: "#2", name: "Front Subframe", category: "Structure" },
  { id: "subframe_rear", number: "#3", name: "Rear Subframe", category: "Structure" },
  { id: "suspension_front", number: "#4", name: "Front Suspension", category: "Suspension & Handling" },
  { id: "suspension_rear", number: "#5", name: "Rear Suspension", category: "Suspension & Handling" },
  { id: "brakes", number: "#6", name: "Brakes & Calipers", category: "Suspension & Handling" },
  { id: "steering", number: "#7", name: "Steering System", category: "Suspension & Handling" },
  { id: "transmission", number: "#8", name: "Transmission & Driveline", category: "Powertrain" },
  { id: "floor_pan", number: "#9", name: "Floor Pan & Tunnel", category: "Structure" },
  { id: "firewall", number: "#10", name: "Firewall & Cowl", category: "Structure" },
  { id: "pillars", number: "#11", name: "A/B/C Pillars", category: "Structure" },
  { id: "roof_structure", number: "#12", name: "Roof Framework", category: "Structure" },
  { id: "rear_wheelhouses", number: "#13", name: "Rear Wheelhouses", category: "Structure" },
  { id: "closures", number: "#14", name: "Closures & Body Panels", category: "Exterior & Aero" },
  { id: "wheels_tires", number: "#15", name: "Wheels & Tires", category: "Suspension & Handling" },
];

const MATERIAL_TIERS = [
  {
    id: "cast" as MaterialGrade,
    name: "Stamped Steel (OEM Base)",
    badge: "OEM BASE",
    powerLabel: "100%",
    weightLabel: "100%",
    rigidityLabel: "+0 kNm/deg",
    costMult: "1.0x",
    description: "High-volume stamped deep-draw steel. Maximum impact ductility and lowest production cost.",
  },
  {
    id: "forged" as MaterialGrade,
    name: "Die-Cast Aluminum Alloy (Lightweight)",
    badge: "RACE SPEC",
    powerLabel: "120%",
    weightLabel: "55%",
    rigidityLabel: "+8 kNm/deg",
    costMult: "1.4x",
    description: "Automotive aerospace 6000/7000 series aluminum. 45% weight saving with enhanced torsional response.",
  },
  {
    id: "billet" as MaterialGrade,
    name: "Compacted Graphite / Billet CNC Alloy",
    badge: "CNC BILLET",
    powerLabel: "140%",
    weightLabel: "80%",
    rigidityLabel: "+18 kNm/deg",
    costMult: "1.9x",
    description: "5-axis CNC machined billet structure. Double fatigue strength under high-frequency track loads.",
  },
  {
    id: "titanium" as MaterialGrade,
    name: "Titanium / Carbon Monocoque (Motorsport)",
    badge: "TITANIUM / CARBON",
    powerLabel: "165%",
    weightLabel: "50%",
    rigidityLabel: "+32 kNm/deg",
    costMult: "4.5x",
    description: "Autoclave cured carbon fiber & Ti-6Al-4V titanium hardpoints. Uncompromising F1-grade stiffness.",
  },
];

export const VehicleWorkshopPanel: React.FC<VehicleWorkshopPanelProps> = ({
  installedComponents,
  activeComponentId,
  phase,
  hoveredComponentId,
  canInstall,
  onStartInstall,
  onHoverComponent,
  progressPercentage,
  currentStats,
  selectedVariants: propsSelectedVariants,
  onSelectVariant,
  vehicleConfig = {},
  onUpdateVehicle,
  className = "",
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [selectedNavId, setSelectedNavId] = useState<string>("chassis_frame");

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

  const activeRibbonId = activeComponentId || selectedNavId;

  const scrollRibbon = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Material Grade Metadata Tiers for Column 2
  const currentGrade = (selectedVariants[activeRibbonId as VehicleComponentId] || "forged") as MaterialGrade;

  return (
    <div className={`space-y-4 font-mono ${className}`}>
      {/* ============================================================= */}
      {/* 1. HORIZONTAL PROGRESS & COMPONENT ASSEMBLY RIBBON            */}
      {/* ============================================================= */}
      <div className="bg-white/80 dark:bg-base-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 backdrop-blur-xl shadow-xl space-y-3">
        {/* Ribbon Header: Title + Completion Bar */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400">
              <Car size={16} />
            </span>
            <strong className="text-slate-800 dark:text-slate-200 font-bold uppercase tracking-wider">
              CHASSIS & VEHICLE ASSEMBLY LINE
            </strong>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-base-950 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 font-semibold">
              {installedComponents.length} of {components.length} Installed
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
              Completion
            </span>
            <div className="w-32 h-2.5 bg-slate-200 dark:bg-base-950 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <strong className="text-amber-600 dark:text-amber-400 font-bold w-9 text-right">
              {progressPercentage}%
            </strong>
          </div>
        </div>

        {/* Ribbon Horizontal Carousel */}
        <div className="relative flex items-center">
          {/* Scroll Left Button */}
          <button
            onClick={() => scrollRibbon("left")}
            className="p-2 rounded-2xl bg-slate-100 dark:bg-base-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-500/40 transition-all mr-2 shadow-sm"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Horizontal Scrollable Pills */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {RIBBON_ITEMS.map((item) => {
              const isSelected = activeRibbonId === item.id;
              const isInstalled = installedComponents.includes(item.id as VehicleComponentId);
              const installable = item.id === "architecture" || canInstall(item.id as VehicleComponentId);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedNavId(item.id);
                    if (item.id !== "architecture" && !isInstalled && installable) {
                      onStartInstall(item.id as VehicleComponentId);
                    }
                  }}
                  onMouseEnter={() => onHoverComponent(item.id as VehicleComponentId)}
                  onMouseLeave={() => onHoverComponent(null)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 border shadow-sm ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(6,182,212,0.45)] scale-105"
                      : isInstalled
                      ? "bg-emerald-500/10 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:border-emerald-400"
                      : installable
                      ? "bg-slate-100 dark:bg-base-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-500/40"
                      : "bg-slate-100/50 dark:bg-base-950/40 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800/60 opacity-60 cursor-not-allowed"
                  }`}
                >
                  {isInstalled ? (
                    <CheckCircle2 size={14} className={isSelected ? "text-slate-950" : "text-emerald-400"} />
                  ) : !installable ? (
                    <Lock size={13} className="text-slate-400" />
                  ) : (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isSelected ? "bg-slate-950 text-amber-300" : "bg-slate-200 dark:bg-base-900 text-slate-500"}`}>
                      {item.number}
                    </span>
                  )}
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => scrollRibbon("right")}
            className="p-2 rounded-2xl bg-slate-100 dark:bg-base-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-500/40 transition-all ml-2 shadow-sm"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* 2. THREE-COLUMN PART CONFIGURATION DECK                       */}
      {/* ============================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── COLUMN 1: PART ARCHITECTURE & SPEC CONTROLS ── */}
        <div className="bg-white/80 dark:bg-base-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Settings size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {activeRibbonId === "architecture"
                  ? "Platform & Powertrain Architecture"
                  : activeRibbonId === "chassis_frame"
                  ? "Chassis Monocoque & Hardpoints"
                  : activeRibbonId === "suspension_front" || activeRibbonId === "suspension_rear"
                  ? "Suspension Kinematics & Springs"
                  : activeRibbonId === "brakes"
                  ? "Braking System & Rotor Sizing"
                  : activeRibbonId === "transmission"
                  ? "Transmission & Gear Ratios"
                  : activeRibbonId === "wheels_tires"
                  ? "Wheel Dimensions & Tire Compound"
                  : "Component Dimensions & Geometry"}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Parametric dimensions, layout geometry & kinematic tolerances
              </p>
            </div>
          </div>

          {/* Dynamic Component Specific Controls */}
          <div className="space-y-4 text-xs">
            {activeRibbonId === "architecture" && (
              <>
                <div>
                  <label className="label-mono mb-1.5 block font-bold text-slate-300">Drivetrain Layout</label>
                  <ChoiceGrid<DriveType>
                    options={[
                      { value: "rwd", label: "RWD (Rear-Wheel Drive)" },
                      { value: "awd", label: "AWD (All-Wheel Drive)" },
                      { value: "fwd", label: "FWD (Front-Wheel Drive)" },
                    ]}
                    value={vehicleConfig.driveType || "rwd"}
                    onChange={(v) => onUpdateVehicle?.({ driveType: v })}
                  />
                </div>
                <div>
                  <label className="label-mono mb-1.5 block font-bold text-slate-300">Engine Placement</label>
                  <ChoiceGrid<EnginePosition>
                    options={[
                      { value: "front", label: "Front (Over Axle)" },
                      { value: "mid", label: "Mid (Between Axles)" },
                      { value: "rear", label: "Rear (Behind Axle)" },
                    ]}
                    value={vehicleConfig.enginePosition || "front"}
                    onChange={(v) => onUpdateVehicle?.({ enginePosition: v })}
                  />
                </div>
              </>
            )}

            {(activeRibbonId === "chassis_frame" || activeRibbonId === "floor_pan" || activeRibbonId === "pillars") && (
              <>
                <div>
                  <label className="label-mono mb-1.5 block font-bold text-slate-300">Chassis Construction</label>
                  <ChoiceGrid<ChassisType>
                    options={[
                      { value: "monocoque", label: "Aluminum Monocoque" },
                      { value: "steel_unibody", label: "Steel Unibody Shell" },
                      { value: "carbon_tub", label: "Carbon Monocell Tub" },
                      { value: "aluminum_spaceframe", label: "Al Spaceframe" },
                    ]}
                    value={vehicleConfig.chassis || "monocoque"}
                    onChange={(v) => onUpdateVehicle?.({ chassis: v })}
                  />
                </div>
                <Slider
                  label="Ride Height"
                  value={vehicleConfig.rideHeight || 120}
                  min={60}
                  max={250}
                  step={2}
                  unit="mm"
                  onChange={(val) => onUpdateVehicle?.({ rideHeight: val })}
                />
              </>
            )}

            {(activeRibbonId === "suspension_front" || activeRibbonId === "subframe_front") && (
              <>
                <div>
                  <label className="label-mono mb-1.5 block font-bold text-slate-300">Front Suspension Geometry</label>
                  <ChoiceGrid<SuspensionType>
                    options={[
                      { value: "double_wishbone", label: "Double Wishbone Dual A-Arms" },
                      { value: "macpherson", label: "MacPherson Strut Assembly" },
                      { value: "pushrod", label: "Pushrod Inboard Cantilever" },
                    ]}
                    value={vehicleConfig.suspensionFront || "double_wishbone"}
                    onChange={(v) => onUpdateVehicle?.({ suspensionFront: v })}
                  />
                </div>
                <Slider
                  label="Front Spring Rate"
                  value={vehicleConfig.springRateF || 75}
                  min={20}
                  max={150}
                  step={2}
                  unit="N/mm"
                  onChange={(val) => onUpdateVehicle?.({ springRateF: val })}
                />
                <Slider
                  label="Front Damper Stiffness"
                  value={Math.round((vehicleConfig.damperF ?? 0.65) * 100)}
                  min={10}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(val) => onUpdateVehicle?.({ damperF: val / 100 })}
                />
              </>
            )}

            {(activeRibbonId === "suspension_rear" || activeRibbonId === "subframe_rear" || activeRibbonId === "rear_wheelhouses") && (
              <>
                <div>
                  <label className="label-mono mb-1.5 block font-bold text-slate-300">Rear Suspension Geometry</label>
                  <ChoiceGrid<SuspensionType>
                    options={[
                      { value: "multilink", label: "5-Link Multilink Arms" },
                      { value: "double_wishbone", label: "Double Wishbone Carrier" },
                      { value: "pushrod", label: "Pushrod Inboard Bellcrank" },
                    ]}
                    value={vehicleConfig.suspensionRear || "multilink"}
                    onChange={(v) => onUpdateVehicle?.({ suspensionRear: v })}
                  />
                </div>
                <Slider
                  label="Rear Spring Rate"
                  value={vehicleConfig.springRateR || 85}
                  min={20}
                  max={150}
                  step={2}
                  unit="N/mm"
                  onChange={(val) => onUpdateVehicle?.({ springRateR: val })}
                />
                <Slider
                  label="Rear Damper Stiffness"
                  value={Math.round((vehicleConfig.damperR ?? 0.65) * 100)}
                  min={10}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={(val) => onUpdateVehicle?.({ damperR: val / 100 })}
                />
              </>
            )}

            {activeRibbonId === "brakes" && (
              <>
                <div>
                  <label className="label-mono mb-1.5 block font-bold text-slate-300">Braking Rotor Chemistry</label>
                  <ChoiceGrid<BrakeType>
                    options={[
                      { value: "slotted_steel", label: "Slotted Steel Discs" },
                      { value: "cast_iron", label: "Cast Iron Discs" },
                      { value: "carbon_ceramic", label: "Carbon Ceramic Discs" },
                    ]}
                    value={vehicleConfig.brakeType || "slotted_steel"}
                    onChange={(v) => onUpdateVehicle?.({ brakeType: v })}
                  />
                </div>
                <Slider
                  label="Brake Disc Size"
                  value={vehicleConfig.brakeDiscSize || 360}
                  min={280}
                  max={420}
                  step={10}
                  unit="mm"
                  onChange={(val) => onUpdateVehicle?.({ brakeDiscSize: val })}
                />
                <Slider
                  label="Brake Piston Count"
                  value={vehicleConfig.brakePistonCount || 6}
                  min={2}
                  max={8}
                  step={2}
                  unit="Pistons"
                  onChange={(val) => onUpdateVehicle?.({ brakePistonCount: val })}
                />
              </>
            )}

            {activeRibbonId === "transmission" && (
              <>
                <div>
                  <label className="label-mono mb-1.5 block font-bold text-slate-300">Transmission Type</label>
                  <ChoiceGrid<TransmissionType>
                    options={[
                      { value: "dct_7", label: "7-Speed Dual Clutch (DCT)" },
                      { value: "manual_6", label: "6-Speed Manual (H-Pattern)" },
                      { value: "seq_6", label: "6-Speed Sequential Race Box" },
                      { value: "dct_8", label: "8-Speed Supercar Dual Clutch" },
                    ]}
                    value={vehicleConfig.transmission || "dct_7"}
                    onChange={(v) => onUpdateVehicle?.({ transmission: v })}
                  />
                </div>
                <Slider
                  label="Final Drive Ratio"
                  value={vehicleConfig.finalDrive || 3.73}
                  min={2.5}
                  max={5.0}
                  step={0.05}
                  unit=":1"
                  onChange={(val) => onUpdateVehicle?.({ finalDrive: val })}
                />
              </>
            )}

            {activeRibbonId === "wheels_tires" && (
              <>
                <div>
                  <label className="label-mono mb-1.5 block font-bold text-slate-300">Tire Compound Grade</label>
                  <ChoiceGrid<TireCompound>
                    options={[
                      { value: "medium", label: "Medium Street Compound" },
                      { value: "soft", label: "Soft Track Compound" },
                      { value: "supersoft", label: "Supersoft R-Spec" },
                      { value: "slick", label: "Full Slick Motorsport" },
                    ]}
                    value={vehicleConfig.tireCompound || "soft"}
                    onChange={(v) => onUpdateVehicle?.({ tireCompound: v })}
                  />
                </div>
                <Slider
                  label="Wheel Rim Diameter"
                  value={vehicleConfig.wheelDiameter || 19}
                  min={17}
                  max={22}
                  step={1}
                  unit="inch"
                  onChange={(val) => onUpdateVehicle?.({ wheelDiameter: val })}
                />
                <Slider
                  label="Wheel Rim Width"
                  value={vehicleConfig.wheelWidth || 9.5}
                  min={7.0}
                  max={13.0}
                  step={0.5}
                  unit="inch"
                  onChange={(val) => onUpdateVehicle?.({ wheelWidth: val })}
                />
              </>
            )}

            {/* Default Fallback for other subsystems */}
            {!["architecture", "chassis_frame", "floor_pan", "pillars", "suspension_front", "subframe_front", "suspension_rear", "subframe_rear", "brakes", "transmission", "wheels_tires"].includes(activeRibbonId) && (
              <div className="space-y-3">
                <Slider
                  label="Structural Gauge Thickness"
                  value={1.8}
                  min={0.8}
                  max={3.5}
                  step={0.1}
                  unit="mm"
                  onChange={() => {}}
                />
                <Slider
                  label="Fastener Pre-Torque"
                  value={75}
                  min={30}
                  max={140}
                  step={5}
                  unit="Nm"
                  onChange={() => {}}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── COLUMN 2: METALLURGY & MATERIAL GRADE (4 TIERS) ── */}
        <div className="bg-white/80 dark:bg-base-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Metallurgy & Material Grade
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Strength, structural density & thermal properties
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              4 Grades
            </span>
          </div>

          {/* 4 Interactive Material Cards */}
          <div className="space-y-2.5">
            {MATERIAL_TIERS.map((tier) => {
              const isSelected = currentGrade === tier.id;

              return (
                <div
                  key={tier.id}
                  onClick={() => handleVariantSelect(activeRibbonId as VehicleComponentId, tier.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all duration-200 space-y-1.5 ${
                    isSelected
                      ? "bg-amber-500/10 dark:bg-slate-900/60 border-amber-500 dark:border-amber-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                      : "bg-slate-50 dark:bg-base-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? "border-amber-500 bg-amber-500" : "border-slate-400"}`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </div>
                      <strong className="text-xs text-slate-800 dark:text-slate-200 font-bold">
                        {tier.name}
                      </strong>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isSelected ? "bg-amber-500 text-slate-950" : "bg-slate-200 dark:bg-base-900 text-slate-500"}`}>
                      {tier.badge}
                    </span>
                  </div>

                  {/* Stat Badges Strip */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 font-mono">
                    <div>
                      <span>Mass: </span>
                      <strong className={isSelected ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-300"}>
                        {tier.weightLabel}
                      </strong>
                    </div>
                    <div>
                      <span>Rigidity: </span>
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        {tier.rigidityLabel}
                      </strong>
                    </div>
                    <div>
                      <span>Cost: </span>
                      <strong className="text-amber-600 dark:text-amber-400">
                        {tier.costMult}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── COLUMN 3: ENGINEERING IMPACT & DELTAS + ADVISORY ── */}
        <div className="bg-white/80 dark:bg-base-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Activity size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Specification & Impact
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Structural mass, torsional rigidity & vehicle dynamics
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Live Computed
            </span>
          </div>

          {/* 4 Dynamic Metric Delta Tiles */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-base-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 block">TOTAL CURB WEIGHT</span>
              <strong className="text-sm text-amber-600 dark:text-amber-400 font-bold block">
                {Math.round(currentStats.weight || 1480)} kg
              </strong>
              <span className="text-[10px] text-slate-400 block">Baseline sports sedan</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-base-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 block">TORSIONAL RIGIDITY</span>
              <strong className="text-sm text-emerald-600 dark:text-emerald-400 font-bold block">
                {currentGrade === "titanium" ? "42.5" : currentGrade === "billet" ? "34.0" : currentGrade === "forged" ? "28.5" : "22.0"} kNm/deg
              </strong>
              <span className="text-[10px] text-slate-400 block">Chassis deflection resistance</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-base-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 block">LATERAL CORNERING GRIP</span>
              <strong className="text-sm text-amber-600 dark:text-amber-400 font-bold block">
                {vehicleConfig.tireCompound === "slick" ? "1.45 G" : vehicleConfig.tireCompound === "supersoft" ? "1.32 G" : vehicleConfig.tireCompound === "soft" ? "1.24 G" : "1.12 G"}
              </strong>
              <span className="text-[10px] text-slate-400 block">Peak skidpad load</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-base-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 block">HARDWARE BOM COST</span>
              <strong className="text-sm text-amber-600 dark:text-amber-400 font-bold block">
                ${Math.round(currentStats.cost || 28500).toLocaleString()}
              </strong>
              <span className="text-[10px] text-slate-400 block">Subsystem component sum</span>
            </div>
          </div>

          {/* Contextual Engineering Advisory Card */}
          <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-slate-900/60 border border-amber-500/20 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
              <Info size={14} />
              <span>ENGINEERING ADVISORY</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {currentGrade === "titanium"
                ? "Titanium & Carbon Monocoque maximizes torsional stiffness (+32 kNm/deg) and eliminates cornering body flex at high cost (~4.5x BOM)."
                : currentGrade === "billet"
                ? "Compacted Graphite & CNC Billet provides race-grade fatigue resistance and elevated stiffness under high track loads."
                : currentGrade === "forged"
                ? "Die-Cast Aluminum delivers optimal 45% weight saving and excellent stiffness-to-weight balance for modern executive performance cars."
                : "Stamped Steel is the robust high-volume baseline for mass production and economical manufacturing."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
