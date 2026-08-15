import { ComponentId, AssemblyPhase, ENGINE_ASSEMBLY_COMPONENTS, getAssemblyComponents, AssemblyComponentMeta, MaterialGrade } from "../../sim/assemblyTypes";
import { EngineConfig } from "../../sim/types";
import { WBankLayoutRenderer } from "./layoutRenderers/WBankLayoutRenderer";
import { FlatBoxerLayoutRenderer } from "./layoutRenderers/FlatBoxerLayoutRenderer";
import { RotaryWankelRenderer } from "./layoutRenderers/RotaryWankelRenderer";
import { RadialAircraftRenderer } from "./layoutRenderers/RadialAircraftRenderer";
import { ApexHybridLayoutRenderer } from "./layoutRenderers/ApexHybridLayoutRenderer";
import { InlineLayoutRenderer } from "./layoutRenderers/InlineLayoutRenderer";
import { VBankLayoutRenderer } from "./layoutRenderers/VBankLayoutRenderer";

import { EVBatteryCasingRenderer } from "./evRenderers/EVBatteryCasingRenderer";
import { EVCellModulesRenderer } from "./evRenderers/EVCellModulesRenderer";
import { EVBusbarGridRenderer } from "./evRenderers/EVBusbarGridRenderer";
import { EVBMSRenderer } from "./evRenderers/EVBMSRenderer";
import { EVCoolingPlateRenderer } from "./evRenderers/EVCoolingPlateRenderer";
import { EVInverterRenderer } from "./evRenderers/EVInverterRenderer";
import { EVStatorCoilsRenderer } from "./evRenderers/EVStatorCoilsRenderer";
import { EVRotorShaftRenderer } from "./evRenderers/EVRotorShaftRenderer";
import { EVGearboxRenderer } from "./evRenderers/EVGearboxRenderer";
import { EVPDUUnitRenderer } from "./evRenderers/EVPDUUnitRenderer";
import { EVRegenBoostRenderer } from "./evRenderers/EVRegenBoostRenderer";
import { EVCoolingReservoirRenderer } from "./evRenderers/EVCoolingReservoirRenderer";

import { AssemblyLaserGuidance } from "./animationFX/AssemblyLaserGuidance";
import { AssemblySparkFlashes } from "./animationFX/AssemblySparkFlashes";
import { RoboticGantryArmOverlay } from "./animationFX/RoboticGantryArmOverlay";
import { AssemblyTrajectoryOverlay } from "./animationFX/AssemblyTrajectoryOverlay";
import { AssemblyTorqueHUDOverlay } from "./animationFX/AssemblyTorqueHUDOverlay";

import { IsoShadersDefs } from "./iso3d/isoShaders";
import { IsoBlockShaderDefs } from "./iso3d/isoBlockShaders";
import { VBankIsoRenderer } from "./iso3d/VBankIsoRenderer";
import { VBankBlockCastingIso } from "./iso3d/VBankBlockCastingIso";
import { InlineIsoRenderer } from "./iso3d/InlineIsoRenderer";
import { WBankIsoRenderer } from "./iso3d/WBankIsoRenderer";
import { BoxerIsoRenderer } from "./iso3d/BoxerIsoRenderer";
import { RotaryBlockCastingIso } from "./iso3d/RotaryBlockCastingIso";
import { RadialBlockCastingIso } from "./iso3d/RadialBlockCastingIso";
import { ApexHybridBlockCastingIso } from "./iso3d/ApexHybridBlockCastingIso";
import { VR6BlockCastingIso } from "./iso3d/VR6BlockCastingIso";
import { I4BlockCastingIso } from "./iso3d/I4BlockCastingIso";
import { I3BlockCastingIso } from "./iso3d/I3BlockCastingIso";
import { I6BlockCastingIso } from "./iso3d/I6BlockCastingIso";
import { V6BlockCastingIso } from "./iso3d/V6BlockCastingIso";
import { V8BlockCastingIso } from "./iso3d/V8BlockCastingIso";
import { V10BlockCastingIso } from "./iso3d/V10BlockCastingIso";
import { BoxerH4BlockCastingIso } from "./iso3d/BoxerH4BlockCastingIso";
import { BoxerH6BlockCastingIso } from "./iso3d/BoxerH6BlockCastingIso";
import { W12BlockCastingIso } from "./iso3d/W12BlockCastingIso";
import { W16BlockCastingIso } from "./iso3d/W16BlockCastingIso";
import { W18BlockCastingIso } from "./iso3d/W18BlockCastingIso";
import { EVPowertrainIsoRenderer } from "./iso3d/EVPowertrainIsoRenderer";
import { CrankshaftIso } from "./iso3d/CrankshaftIso";
import { PistonsIso } from "./iso3d/PistonsIso";
import { CylinderHeadIso } from "./iso3d/CylinderHeadIso";
import { TurbochargerIso } from "./iso3d/TurbochargerIso";
import { HeadGasketIso } from "./iso3d/HeadGasketIso";
import { CamshaftIso } from "./iso3d/CamshaftIso";
import { ValvesIso } from "./iso3d/ValvesIso";
import { IntakeManifoldIso } from "./iso3d/IntakeManifoldIso";
import { ExhaustHeadersIso } from "./iso3d/ExhaustHeadersIso";
import { OilPanIso } from "./iso3d/OilPanIso";
import { HybridMotorIso } from "./iso3d/HybridMotorIso";
import { InverterECUIso } from "./iso3d/InverterECUIso";
import { RadiatorIso } from "./iso3d/RadiatorIso";
import { TransmissionIso } from "./iso3d/TransmissionIso";
import { EngineCoverIso } from "./iso3d/EngineCoverIso";


interface EngineSVGProps {
  installedComponents: ComponentId[];
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  hoveredComponentId: ComponentId | null;
  isExplodedView: boolean;
  isAssemblyComplete: boolean;
  layout?: string;
  engineConfig?: Partial<EngineConfig>;
  selectedVariants?: Record<string, MaterialGrade>;
  viewMode?: "2d" | "3d_iso";
  onHoverComponent?: (id: ComponentId | null) => void;
  className?: string;
}

export function EngineSVG({
  installedComponents,
  activeComponentId,
  phase,
  hoveredComponentId,
  isExplodedView,
  isAssemblyComplete,
  layout,
  engineConfig,
  selectedVariants,
  viewMode = "3d_iso",
  onHoverComponent,
  className = "",
}: EngineSVGProps) {
  const rawLayout = (layout || engineConfig?.layout || "v12").toLowerCase();
  const currentLayout = rawLayout
    .replace(/^inline-?/, "i")
    .replace(/^boxer-?/, "boxer")
    .replace(/^flat-?/, "boxer");

  // Dynamic Layout Metadata Generator for 25 Engine Block Configurations
  const getLayoutSpec = (ly: string) => {
    switch (ly) {
      case "i3":
        return {
          label: "APEX-I3 SPEC-03 CAST STEEL",
          cyls: [185, 250, 315],
          width: 50,
          bankAngle: "0° Inline",
          bx: 145, bw: 210, bh: 238,
          category: "inline",
          bolts: [{ x: 160, y: 118 }, { x: 217, y: 118 }, { x: 283, y: 118 }, { x: 340, y: 118 }, { x: 160, y: 332 }, { x: 217, y: 332 }, { x: 283, y: 332 }, { x: 340, y: 332 }],
        };
      case "i4":
        return {
          label: "APEX-I4 SPEC-04 TURBO",
          cyls: [165, 220, 275, 330],
          width: 44,
          bankAngle: "0° Inline",
          bx: 135, bw: 230, bh: 238,
          category: "inline",
          bolts: [{ x: 148, y: 118 }, { x: 202, y: 118 }, { x: 256, y: 118 }, { x: 310, y: 118 }, { x: 352, y: 118 }, { x: 148, y: 332 }, { x: 202, y: 332 }, { x: 256, y: 332 }, { x: 310, y: 332 }, { x: 352, y: 332 }],
        };
      case "i6":
        return {
          label: "APEX-I6 SPEC-06 TWIN-TURBO",
          cyls: [135, 180, 225, 270, 315, 360],
          width: 34,
          bankAngle: "0° Straight-6",
          bx: 105, bw: 290, bh: 238,
          category: "inline",
          bolts: [{ x: 118, y: 118 }, { x: 160, y: 118 }, { x: 202, y: 118 }, { x: 248, y: 118 }, { x: 292, y: 118 }, { x: 336, y: 118 }, { x: 382, y: 118 }, { x: 118, y: 332 }, { x: 160, y: 332 }, { x: 202, y: 332 }, { x: 248, y: 332 }, { x: 292, y: 332 }, { x: 336, y: 332 }, { x: 382, y: 332 }],
        };
      case "v4":
        return {
          label: "APEX-V4 MOTOGP 16500-RPM",
          cyls: [180, 230, 280, 330],
          width: 42,
          bankAngle: "90° V4 Race",
          bx: 135, bw: 230, bh: 238,
          category: "vbank",
          bolts: [{ x: 148, y: 118 }, { x: 205, y: 118 }, { x: 295, y: 118 }, { x: 352, y: 118 }, { x: 148, y: 332 }, { x: 205, y: 332 }, { x: 295, y: 332 }, { x: 352, y: 332 }],
        };
      case "v6":
        return {
          label: "APEX-V6 SPEC-06 60-DEG",
          cyls: [165, 225, 285, 345],
          width: 46,
          bankAngle: "60° V-Bank",
          bx: 125, bw: 250, bh: 238,
          category: "vbank",
          bolts: [{ x: 140, y: 118 }, { x: 195, y: 118 }, { x: 250, y: 118 }, { x: 305, y: 118 }, { x: 360, y: 118 }, { x: 140, y: 332 }, { x: 195, y: 332 }, { x: 250, y: 332 }, { x: 305, y: 332 }, { x: 360, y: 332 }],
        };
      case "v8":
        return {
          label: "APEX-V8 SPEC-08 CROSSPLANE",
          cyls: [160, 220, 280, 340],
          width: 46,
          bankAngle: "90° V8 Crossplane",
          bx: 116, bw: 268, bh: 238,
          category: "vbank",
          bolts: [{ x: 136, y: 118 }, { x: 193, y: 118 }, { x: 250, y: 118 }, { x: 307, y: 118 }, { x: 364, y: 118 }, { x: 136, y: 332 }, { x: 193, y: 332 }, { x: 250, y: 332 }, { x: 307, y: 332 }, { x: 364, y: 332 }],
        };
      case "v10":
        return {
          label: "APEX-V10 SPEC-10 EXOTIC",
          cyls: [145, 195, 245, 295, 345],
          width: 38,
          bankAngle: "90° V10",
          bx: 110, bw: 280, bh: 238,
          category: "vbank",
          bolts: [{ x: 125, y: 118 }, { x: 170, y: 118 }, { x: 220, y: 118 }, { x: 270, y: 118 }, { x: 320, y: 118 }, { x: 365, y: 118 }, { x: 125, y: 332 }, { x: 170, y: 332 }, { x: 220, y: 332 }, { x: 270, y: 332 }, { x: 320, y: 332 }, { x: 365, y: 332 }],
        };
      case "w12":
        return {
          label: "APEX-W12 TWIN-TURBO",
          cyls: [152, 204, 256, 308],
          width: 46,
          bankAngle: "72°/15° W12",
          bx: 116, bw: 268, bh: 238,
          category: "wbank",
          bolts: [{ x: 136, y: 118 }, { x: 193, y: 118 }, { x: 250, y: 118 }, { x: 307, y: 118 }, { x: 364, y: 118 }, { x: 136, y: 332 }, { x: 193, y: 332 }, { x: 250, y: 332 }, { x: 307, y: 332 }, { x: 364, y: 332 }],
        };
      case "w16":
        return {
          label: "APEX-W16 QUAD-TURBO HYPERCAR",
          cyls: [145, 195, 245, 295, 345],
          width: 38,
          bankAngle: "90°/15° W16",
          bx: 100, bw: 300, bh: 245,
          category: "wbank",
          bolts: [{ x: 115, y: 118 }, { x: 165, y: 118 }, { x: 220, y: 118 }, { x: 280, y: 118 }, { x: 335, y: 118 }, { x: 385, y: 118 }, { x: 115, y: 332 }, { x: 165, y: 332 }, { x: 220, y: 332 }, { x: 280, y: 332 }, { x: 335, y: 332 }, { x: 385, y: 332 }],
        };
      case "w18":
        return {
          label: "APEX-W18 TRIPLE-VR6 6.3L",
          cyls: [130, 175, 220, 265, 310, 355],
          width: 32,
          bankAngle: "72°/15° W18",
          bx: 95, bw: 310, bh: 245,
          category: "wbank",
          bolts: [{ x: 110, y: 118 }, { x: 155, y: 118 }, { x: 200, y: 118 }, { x: 250, y: 118 }, { x: 295, y: 118 }, { x: 340, y: 118 }, { x: 385, y: 118 }, { x: 110, y: 332 }, { x: 155, y: 332 }, { x: 200, y: 332 }, { x: 250, y: 332 }, { x: 295, y: 332 }, { x: 340, y: 332 }, { x: 385, y: 332 }],
        };
      case "boxer4":
        return {
          label: "APEX-H4 BOXER SUB-ZERO",
          cyls: [175, 227, 279, 331],
          width: 46,
          bankAngle: "180° Flat-4",
          bx: 100, bw: 300, bh: 180,
          category: "flat",
          bolts: [{ x: 120, y: 148 }, { x: 180, y: 148 }, { x: 250, y: 148 }, { x: 320, y: 148 }, { x: 380, y: 148 }, { x: 120, y: 302 }, { x: 180, y: 302 }, { x: 250, y: 302 }, { x: 320, y: 302 }, { x: 380, y: 302 }],
        };
      case "boxer6":
        return {
          label: "APEX-H6 BOXER 9000-RPM",
          cyls: [152, 204, 256, 308],
          width: 46,
          bankAngle: "180° Flat-6",
          bx: 90, bw: 320, bh: 180,
          category: "flat",
          bolts: [{ x: 110, y: 148 }, { x: 170, y: 148 }, { x: 250, y: 148 }, { x: 330, y: 148 }, { x: 390, y: 148 }, { x: 110, y: 302 }, { x: 170, y: 302 }, { x: 250, y: 302 }, { x: 330, y: 302 }, { x: 390, y: 302 }],
        };
      case "rotary":
        return {
          label: "APEX-ROTARY WANKEL 13B-REW",
          cyls: [195, 285],
          width: 60,
          bankAngle: "Planetary Orbit",
          bx: 135, bw: 230, bh: 230,
          category: "rotary",
          bolts: [{ x: 150, y: 118 }, { x: 250, y: 118 }, { x: 350, y: 118 }, { x: 150, y: 322 }, { x: 250, y: 322 }, { x: 350, y: 322 }],
        };
      case "radial":
        return {
          label: "APEX-RADIAL R-2800 9-CYL",
          cyls: [152, 204, 256, 308],
          width: 46,
          bankAngle: "360° Radial Ring",
          bx: 90, bw: 320, bh: 320,
          category: "radial",
          bolts: [{ x: 120, y: 85 }, { x: 250, y: 70 }, { x: 380, y: 85 }, { x: 120, y: 375 }, { x: 250, y: 390 }, { x: 380, y: 375 }],
        };
      case "vr6":
        return {
          label: "APEX-VR6 15-DEG NARROW",
          cyls: [150, 190, 230, 270, 310, 350],
          width: 34,
          bankAngle: "15° VR-Bank",
          bx: 120, bw: 260, bh: 238,
          category: "vr",
          bolts: [{ x: 135, y: 118 }, { x: 180, y: 118 }, { x: 225, y: 118 }, { x: 275, y: 118 }, { x: 320, y: 118 }, { x: 365, y: 118 }, { x: 135, y: 332 }, { x: 180, y: 332 }, { x: 225, y: 332 }, { x: 275, y: 332 }, { x: 320, y: 332 }, { x: 365, y: 332 }],
        };
      case "twin":
        return {
          label: "APEX-TWIN 270-DEG CROSSPLANE",
          cyls: [210, 290],
          width: 56,
          bankAngle: "270° Parallel Twin",
          bx: 155, bw: 190, bh: 238,
          category: "inline",
          bolts: [{ x: 170, y: 118 }, { x: 250, y: 118 }, { x: 330, y: 118 }, { x: 170, y: 332 }, { x: 250, y: 332 }, { x: 330, y: 332 }],
        };
      case "thumper":
        return {
          label: "APEX-THUMPER 450CC 4-STROKE",
          cyls: [250],
          width: 68,
          bankAngle: "0° Single Bore",
          bx: 175, bw: 150, bh: 238,
          category: "inline",
          bolts: [{ x: 190, y: 118 }, { x: 310, y: 118 }, { x: 190, y: 332 }, { x: 310, y: 332 }],
        };
      case "apex_hybrid":
        return {
          label: "APEX SPEC-X HYBRID TRI-MOTOR",
          cyls: [152, 204, 256, 308],
          width: 46,
          bankAngle: "60° V12 + 800V EV",
          bx: 105, bw: 290, bh: 245,
          category: "hybrid",
          bolts: [{ x: 125, y: 118 }, { x: 185, y: 118 }, { x: 250, y: 118 }, { x: 315, y: 118 }, { x: 375, y: 118 }, { x: 125, y: 332 }, { x: 185, y: 332 }, { x: 250, y: 332 }, { x: 315, y: 332 }, { x: 375, y: 332 }],
        };
      case "v12":
      default:
        return {
          label: "APEX-V12 QUAD-CAM 6.0L TWIN-TURBO",
          cyls: [115, 169, 223, 277, 331, 385],
          width: 36,
          bankAngle: "60° V12 Flagship GT",
          bx: 90, bw: 320, bh: 245,
          category: "vbank",
          bolts: [
            { x: 105, y: 118 }, { x: 159, y: 118 }, { x: 213, y: 118 }, { x: 267, y: 118 }, { x: 321, y: 118 }, { x: 375, y: 118 }, { x: 395, y: 118 },
            { x: 105, y: 332 }, { x: 159, y: 332 }, { x: 213, y: 332 }, { x: 267, y: 332 }, { x: 321, y: 332 }, { x: 375, y: 332 }, { x: 395, y: 332 }
          ],
        };
    }
  };

  const layoutSpec = getLayoutSpec(currentLayout);

  // Helper to determine component visibility, exploded offset, or active highlight state
  const getPartState = (id: ComponentId) => {
    const isInstalled = installedComponents.includes(id);
    const isActive = activeComponentId === id;
    const isHovered = hoveredComponentId === id;
    const allComponentsList = getAssemblyComponents(engineConfig);
    const meta = allComponentsList.find((c: AssemblyComponentMeta) => c.id === id);

    let offsetX = 0;
    let offsetY = 0;
    let opacity = 1;

    if (!isInstalled && !isActive) {
      if (isExplodedView && meta) {
        offsetX = meta.explodedOffset.x;
        offsetY = meta.explodedOffset.y;
        opacity = 0.55;
      } else {
        opacity = 0.15;
      }
    }

    return {
      isInstalled,
      isActive,
      isHovered,
      offsetX,
      offsetY,
      opacity,
      meta,
    };
  };

  const isEV =
    currentLayout === "electric" ||
    (engineConfig as any)?.powertrainType === "electric";

  const isHybridEnabled =
    currentLayout === "hybrid" ||
    (engineConfig?.hybridArchitecture && engineConfig.hybridArchitecture !== "none") ||
    (engineConfig as any)?.isHybrid;

  const isTurboEnabled =
    (engineConfig as any)?.aspiration !== "NA" &&
    (engineConfig as any)?.aspiration !== "naturally_aspirated";

  const blockState = getPartState("block");
  const crankState = getPartState("crankshaft");
  const pistonState = getPartState("pistons");
  const rodState = getPartState("rods");
  const panState = getPartState("oil_pan");
  const gasketState = getPartState("head_gasket");
  const headState = getPartState("cylinder_head");
  const camState = getPartState("camshaft");
  const valveState = getPartState("valves");
  const intakeState = getPartState("intake_manifold");
  const exhaustState = getPartState("exhaust_headers");
  const turboState = getPartState("turbocharger");
  const radiatorState = getPartState("radiator");
  const transmissionState = getPartState("transmission");
  const engineCoverState = getPartState("engine_cover");
  const hybridMotorState = getPartState("hybrid_motor");
  const inverterState = getPartState("inverter_ecu");

  // Active spotlight location
  const allCompList = getAssemblyComponents(engineConfig);
  const activeMeta = activeComponentId ? allCompList.find((c: AssemblyComponentMeta) => c.id === activeComponentId) : null;
  const spotlightX = activeMeta ? activeMeta.slotPosition.x : 290;
  const spotlightY = activeMeta ? activeMeta.slotPosition.y : 245;

  return (
    <div className={`relative w-full h-full flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 580 480"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full max-h-[520px] overflow-visible filter drop-shadow-[0_20px_50px_rgba(15,23,42,0.85)]"
      >
        {/* CAD Engineering Background Grid Overlay */}
        <rect width="580" height="480" fill="url(#cad-grid)" className="pointer-events-none" />

        <defs>
          <IsoShadersDefs />
          <IsoBlockShaderDefs />

          {/* ── DYNAMIC COMPONENT MATERIAL GRADE SHADERS ── */}

          {/* 1. OEM Cast Steel / Cast Iron (Rugged dark slate gray with heavy texture) */}
          <linearGradient id="mat-cast-steel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="12%" stopColor="#475569" />
            <stop offset="38%" stopColor="#1e293b" />
            <stop offset="68%" stopColor="#0f172a" />
            <stop offset="92%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* 2. Forged Racing Alloy (6061-T6 Aerospace Brushed Aluminum Silver Sheen) */}
          <linearGradient id="mat-forged-alloy" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="15%" stopColor="#cbd5e1" />
            <stop offset="35%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="72%" stopColor="#64748b" />
            <stop offset="92%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* 3. Billet CNC Precision (Mirror-Polished CNC Chrome Aluminum with Cyan Reflections) */}
          <linearGradient id="mat-billet-cnc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="18%" stopColor="#38bdf8" />
            <stop offset="38%" stopColor="#ffffff" />
            <stop offset="48%" stopColor="#0f172a" />
            <stop offset="75%" stopColor="#e2e8f0" />
            <stop offset="92%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* 4. Titanium Spec-R (Grade 5 Motorsport Titanium — Sleek Satin Gunmetal Alloy with Cool Metallic Highlight) */}
          <linearGradient id="mat-titanium-spec" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="18%" stopColor="#475569" />
            <stop offset="38%" stopColor="#f1f5f9" />
            <stop offset="48%" stopColor="#1e293b" />
            <stop offset="75%" stopColor="#64748b" />
            <stop offset="90%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Recipe 1: High-Contrast Chrome 3D Gradient */}
          <linearGradient id="chrome-3d" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2b3038"/>
            <stop offset="20%" stopColor="#8b95a1"/>
            <stop offset="40%" stopColor="#ffffff"/> {/* Bright Reflection */}
            <stop offset="45%" stopColor="#ffffff"/>
            <stop offset="50%" stopColor="#1a1d24"/> {/* Horizon Line Shadow */}
            <stop offset="80%" stopColor="#677381"/>
            <stop offset="100%" stopColor="#0f1115"/>
          </linearGradient>

          {/* Recipe 4: Anodized Steel-Blue/Gunmetal Alloy (Pistons & Couplers) */}
          <linearGradient id="anodized-blue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa"/>
            <stop offset="20%" stopColor="#3b82f6"/>
            <stop offset="40%" stopColor="#ffffff"/> {/* Bright Reflection */}
            <stop offset="45%" stopColor="#ffffff"/>
            <stop offset="50%" stopColor="#1d4ed8"/> {/* Horizon Line Shadow */}
            <stop offset="80%" stopColor="#1e3a8a"/>
            <stop offset="100%" stopColor="#0f172a"/>
          </linearGradient>

          {/* Exact Cylinder Tube 3D Specular Gradient Matching Reference Artwork */}
          <linearGradient id="cylinder-tube-3d" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e242f" />
            <stop offset="5%" stopColor="#8b95a1" />
            <stop offset="13%" stopColor="#ffffff" /> {/* Crisp Primary Specular Band */}
            <stop offset="20%" stopColor="#e2e8f0" />
            <stop offset="48%" stopColor="#64748b" />
            <stop offset="78%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Exact Engine Block Casing Shading Gradient Matching Reference Artwork */}
          <linearGradient id="slate-block-artwork" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="4%" stopColor="#cbd5e1" />
            <stop offset="18%" stopColor="#64748b" />
            <stop offset="35%" stopColor="#475569" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="78%" stopColor="#475569" />
            <stop offset="96%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>

          {/* Machined Silver 3D Engine Block Alloy */}
          <linearGradient id="slate-block" href="#slate-block-artwork" />

          {/* CNC Brushed Aluminum Cylinder Head */}
          <linearGradient id="brushed-head" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="18%" stopColor="#f1f5f9" />
            <stop offset="42%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="80%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Cast Metallic Grain Specular Shimmer */}
          <linearGradient id="cast-grain-shimmer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="15%" stopColor="#cbd5e1" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#000000" stopOpacity="0" />
            <stop offset="85%" stopColor="#000000" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
          </linearGradient>

          {/* Top Machined Deck Surface Gradient (CNC Stainless/Alloy Deck) */}
          <linearGradient id="machined-deck-bevel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#e2e8f0" />
            <stop offset="45%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#94a3b8" />
            <stop offset="90%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* 3D Cylinder Sleeve Steel Ring Bevel */}
          <linearGradient id="sleeve-steel-rim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="20%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="80%" stopColor="#475569" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Super-Polished Mirror Chrome Journal Finish */}
          <linearGradient id="journal-polished-chrome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2b3038" />
            <stop offset="18%" stopColor="#8b95a1" />
            <stop offset="38%" stopColor="#ffffff" /> {/* Bright Reflection */}
            <stop offset="42%" stopColor="#ffffff" />
            <stop offset="48%" stopColor="#1a1d24" /> {/* Horizon Line Shadow */}
            <stop offset="78%" stopColor="#677381" />
            <stop offset="100%" stopColor="#0f1115" />
          </linearGradient>

          {/* 3D Volumetric Forged Steel Crank Shaft Axis */}
          <linearGradient id="crank-forged-3d" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="20%" stopColor="#cbd5e1" />
            <stop offset="40%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="82%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* 3D Volumetric Main Bearing Cap Cast Iron Shading */}
          <linearGradient id="main-bearing-cap-cast-iron" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="20%" stopColor="#64748b" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="80%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Tri-Metal Copper-Lead Babbitt Bearing Shell Insert */}
          <linearGradient id="tri-metal-bearing-shell" x1="0%" y1="0%" x2="1%" y2="0">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="15%" stopColor="#d97706" />
            <stop offset="35%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#cbd5e1" />
            <stop offset="85%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>

          {/* 3D Recessed Cylinder Sleeve Depth Gradient */}
          <linearGradient id="bore-depth-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#020617" />
            <stop offset="8%" stopColor="#090d16" />
            <stop offset="22%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="78%" stopColor="#1e293b" />
            <stop offset="92%" stopColor="#090d16" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Precision 45-Degree Diamond Honing Crosshatch Grooves Pattern */}
          <pattern id="honing-crosshatch" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M 0 12 L 12 0 M 0 0 L 12 12" stroke="#ffffff" strokeWidth="0.8" opacity="0.18" />
          </pattern>

          {/* Translucent Coolant Water Jacket Fluid Flow */}
          <linearGradient id="coolant-jacket-flow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#0284c7" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#0369a1" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#075985" stopOpacity="0.9" />
          </linearGradient>

          {/* Heavy Duty 3D Casting Mounting Lug Gradient */}
          <linearGradient id="mounting-lug-3d" x1="0" y1="0" x2="1" y2="0.8">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="85%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* 3D Threaded Head Bolt Boss Metal Shading */}
          <linearGradient id="bolt-boss-3d" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="80%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* CNC Machined Aluminum Plaque Metallic Gradient */}
          <linearGradient id="plaque-metal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#e2e8f0" />
            <stop offset="45%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Alias blue-piston to anodized-blue */}
          <linearGradient id="blue-piston" href="#anodized-blue" />

          {/* Forged Steel Connecting Rods & Crankshaft */}
          <linearGradient id="forged-steel" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="20%" stopColor="#cbd5e1" />
            <stop offset="42%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="82%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* 3D Round Cylindrical Pipe Gradient for Aluminum Intake */}
          <linearGradient id="pipe-cylinder-3d" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="22%" stopColor="#f1f5f9" />
            <stop offset="42%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="82%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Blue Silicone Hose Couplers */}
          <linearGradient id="blue-silicone" href="#anodized-blue" />

          {/* Heat-Treated Copper Exhaust Runners with High-Contrast Metallic Glow */}
          <linearGradient id="copper-heat-treated" x1="0" y1="0" x2="1" y2="0.8">
            <stop offset="0%" stopColor="#fff7ed" />
            <stop offset="20%" stopColor="#ffedd5" />
            <stop offset="42%" stopColor="#ffffff" /> {/* Bright Specular Highlight */}
            <stop offset="50%" stopColor="#ea580c" />
            <stop offset="82%" stopColor="#9a3412" />
            <stop offset="100%" stopColor="#431407" />
          </linearGradient>

          {/* Polished Stainless Steel Downpipe */}
          <linearGradient id="stainless-downpipe" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#cbd5e1" />
            <stop offset="42%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="88%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Cast Aluminum Turbo Housing */}
          <linearGradient id="turbo-housing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="22%" stopColor="#e2e8f0" />
            <stop offset="42%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="88%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Golden Impeller Wheel Hub */}
          <linearGradient id="gold-hub" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fef08a" />
            <stop offset="42%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="85%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>

          {/* Subtle Thin Copper Head Gasket */}
          <linearGradient id="copper-gasket" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#d4a574" />
            <stop offset="40%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#b8834a" />
            <stop offset="100%" stopColor="#8b6332" />
          </linearGradient>

          {/* Inner Cylinder Bore Depth Gradient */}
          <linearGradient id="bore-depth-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#090d16" />
            <stop offset="15%" stopColor="#111827" />
            <stop offset="50%" stopColor="#0a0f1d" />
            <stop offset="85%" stopColor="#111827" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>

          {/* Combustion Chamber Flame Glow Gradient (Matching Gauge Redline Rose #f43f5e) */}
          <radialGradient id="combustion-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" /> {/* Cyan Ignition Core */}
            <stop offset="35%" stopColor="#f43f5e" stopOpacity="0.85" /> {/* Telemetry Rose Flame */}
            <stop offset="70%" stopColor="#e11d48" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#881337" stopOpacity="0" />
          </radialGradient>

          {/* Airflow Velocity Streamline Gradient */}
          <linearGradient id="intake-airflow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>

          {/* ── 2. SVG TEXTURE PATTERNS ── */}
          <pattern id="cad-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#38bdf8" strokeWidth="0.5" opacity="0.1" />
          </pattern>

          <pattern id="honing-crosshatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#64748b" strokeWidth="0.8" opacity="0.45" />
            <line x1="0" y1="0" x2="8" y2="0" stroke="#64748b" strokeWidth="0.8" opacity="0.45" />
          </pattern>

          {/* ── 3. SPECULAR & DEEP DROP SHADOW FILTERS ── */}
          <filter id="3d-light" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
            <feSpecularLighting in="blur" surfaceScale="5" specularConstant="1" 
                                specularExponent="20" lighting-color="#ffffff" result="specular">
              <fePointLight x="-500" y="-500" z="300"/>
            </feSpecularLighting>
            <feComposite in="SourceGraphic" in2="specular" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
          </filter>

          {/* Recipe 3: Brushed Metal Texture Filter */}
          <filter id="brushed-metal">
            <feTurbulence type="fractalNoise" baseFrequency="0.05 0.95" numOctaves="2" result="noise"/>
            <feColorMatrix type="matrix" values="0.3 0 0 0 0  0.3 0 0 0 0  0.3 0 0 0 0  0 0 0 0.15 0"/>
            <feComposite in2="SourceGraphic" operator="in"/>
          </filter>

          <filter id="soft-shadow-3d" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="2" dy="8" stdDeviation="6" floodColor="#020617" floodOpacity="0.75" />
          </filter>

          <filter id="heat-shimmer-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise">
              <animate attributeName="baseFrequency" values="0.04;0.07;0.04" dur="2s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* Studio Lighting Ambient Glow Circle */}
        {activeComponentId && (
          <circle
            cx={spotlightX}
            cy={spotlightY}
            r="160"
            fill="url(#brushed-head)"
            opacity="0.12"
            className="transition-all duration-700 ease-out"
          >
            <animate attributeName="r" values="140;170;140" dur="3s" repeatCount="indefinite" />
          </circle>
        )}

        {/* ── EV POWERTRAIN 3D VECTOR MECHANICS SYSTEM ── */}
        {isEV ? (
          viewMode === "3d_iso" ? (
            <EVPowertrainIsoRenderer
              layoutSpec={layoutSpec}
              blockState={blockState}
              onHoverComponent={onHoverComponent}
            />
          ) : (
            <g id="ev-powertrain-full-assembly">
              <EVBatteryCasingRenderer layoutSpec={layoutSpec} blockState={blockState} onHoverComponent={onHoverComponent} />
              <EVCellModulesRenderer layoutSpec={layoutSpec} componentState={crankState} onHoverComponent={onHoverComponent} />
              <EVBusbarGridRenderer layoutSpec={layoutSpec} componentState={rodState} onHoverComponent={onHoverComponent} />
              <EVBMSRenderer layoutSpec={layoutSpec} componentState={pistonState} onHoverComponent={onHoverComponent} />
              <EVCoolingPlateRenderer layoutSpec={layoutSpec} componentState={gasketState} onHoverComponent={onHoverComponent} />
              <EVInverterRenderer layoutSpec={layoutSpec} componentState={headState} onHoverComponent={onHoverComponent} />
              <EVStatorCoilsRenderer layoutSpec={layoutSpec} componentState={valveState} onHoverComponent={onHoverComponent} />
              <EVRotorShaftRenderer layoutSpec={layoutSpec} componentState={camState} onHoverComponent={onHoverComponent} />
              <EVGearboxRenderer layoutSpec={layoutSpec} componentState={intakeState} onHoverComponent={onHoverComponent} />
              <EVPDUUnitRenderer layoutSpec={layoutSpec} componentState={exhaustState} onHoverComponent={onHoverComponent} />
              <EVRegenBoostRenderer layoutSpec={layoutSpec} componentState={turboState} onHoverComponent={onHoverComponent} />
              <EVCoolingReservoirRenderer layoutSpec={layoutSpec} componentState={panState} onHoverComponent={onHoverComponent} />
            </g>
          )
        ) : (
          <g id="ice-engine-full-assembly">
        {/* ── 1. ENGINE BLOCK (Modular Layout Renderers for 25 Engine Configurations) ── */}
        {(() => {
          if (currentLayout === "rotary") {
            return viewMode === "3d_iso" ? (
              <RotaryBlockCastingIso
                layoutSpec={layoutSpec}
                blockState={blockState}
                onHoverComponent={onHoverComponent}
                selectedVariants={selectedVariants}
              />
            ) : (
              <RotaryWankelRenderer
                layoutSpec={layoutSpec}
                blockState={blockState}
                onHoverComponent={onHoverComponent}
              />
            );
          }
          if (currentLayout === "radial") {
            return viewMode === "3d_iso" ? (
              <RadialBlockCastingIso
                layoutSpec={layoutSpec}
                blockState={blockState}
                onHoverComponent={onHoverComponent}
                selectedVariants={selectedVariants}
              />
            ) : (
              <RadialAircraftRenderer
                layoutSpec={layoutSpec}
                blockState={blockState}
                onHoverComponent={onHoverComponent}
              />
            );
          }
          if (currentLayout === "apex_hybrid") {
            return viewMode === "3d_iso" ? (
              <ApexHybridBlockCastingIso
                layoutSpec={layoutSpec}
                blockState={blockState}
                onHoverComponent={onHoverComponent}
                selectedVariants={selectedVariants}
              />
            ) : (
              <ApexHybridLayoutRenderer
                layoutSpec={layoutSpec}
                blockState={blockState}
                onHoverComponent={onHoverComponent}
              />
            );
          }
          if (layoutSpec.category === "vr" || currentLayout === "vr6") {
            return viewMode === "3d_iso" ? (
              <VR6BlockCastingIso
                layoutSpec={layoutSpec}
                blockState={blockState}
                onHoverComponent={onHoverComponent}
                selectedVariants={selectedVariants}
              />
            ) : (
              <VBankLayoutRenderer
                layoutSpec={layoutSpec}
                blockState={blockState}
                onHoverComponent={onHoverComponent}
                selectedVariants={selectedVariants}
              />
            );
          }
          if (layoutSpec.category === "wbank") {
            return viewMode === "3d_iso" ? (
              currentLayout === "w12" ? (
                <W12BlockCastingIso
                  layoutSpec={layoutSpec}
                  blockState={blockState}
                  onHoverComponent={onHoverComponent}
                  selectedVariants={selectedVariants}
                />
              ) : currentLayout === "w16" ? (
                <W16BlockCastingIso
                  layoutSpec={layoutSpec}
                  blockState={blockState}
                  onHoverComponent={onHoverComponent}
                  selectedVariants={selectedVariants}
                />
              ) : currentLayout === "w18" ? (
                <W18BlockCastingIso
                  layoutSpec={layoutSpec}
                  blockState={blockState}
                  onHoverComponent={onHoverComponent}
                  selectedVariants={selectedVariants}
                />
              ) : (
                <WBankIsoRenderer
                  layoutSpec={layoutSpec}
                  blockState={blockState}
                  onHoverComponent={onHoverComponent}
                  selectedVariants={selectedVariants}
                />
              )
            ) : (
              <WBankLayoutRenderer
                layoutSpec={layoutSpec}
                blockState={blockState}
                onHoverComponent={onHoverComponent}
                selectedVariants={selectedVariants}
              />
            );
          }
          if (layoutSpec.category === "flat") {
            return viewMode === "3d_iso" ? (
              currentLayout === "boxer4" ? (
                <BoxerH4BlockCastingIso
                  layoutSpec={layoutSpec}
                  blockState={blockState}
                  onHoverComponent={onHoverComponent}
                  selectedVariants={selectedVariants}
                />
              ) : currentLayout === "boxer6" ? (
                <BoxerH6BlockCastingIso
                  layoutSpec={layoutSpec}
                  blockState={blockState}
                  onHoverComponent={onHoverComponent}
                  selectedVariants={selectedVariants}
                />
              ) : (
                <BoxerIsoRenderer
                  layoutSpec={layoutSpec}
                  blockState={blockState}
                  onHoverComponent={onHoverComponent}
                  selectedVariants={selectedVariants}
                />
              )
            ) : (
              <FlatBoxerLayoutRenderer
                layoutSpec={layoutSpec}
                blockState={blockState}
                onHoverComponent={onHoverComponent}
                selectedVariants={selectedVariants}
              />
            );
          }
          if (layoutSpec.category === "inline") {
            return viewMode === "3d_iso" ? (
              currentLayout === "i3" ? (
                <I3BlockCastingIso
                  layoutSpec={layoutSpec}
                  blockState={blockState}
                  onHoverComponent={onHoverComponent}
                  selectedVariants={selectedVariants}
                />
              ) : currentLayout === "i4" ? (
                <I4BlockCastingIso
                  layoutSpec={layoutSpec}
                  blockState={blockState}
                  onHoverComponent={onHoverComponent}
                  selectedVariants={selectedVariants}
                />
              ) : currentLayout === "i6" ? (
                <I6BlockCastingIso
                  layoutSpec={layoutSpec}
                  blockState={blockState}
                  onHoverComponent={onHoverComponent}
                  selectedVariants={selectedVariants}
                />
              ) : (
                <InlineIsoRenderer
                  layoutSpec={layoutSpec}
                  blockState={blockState}
                  onHoverComponent={onHoverComponent}
                  selectedVariants={selectedVariants}
                />
              )
            ) : (
              <InlineLayoutRenderer
                layoutSpec={layoutSpec}
                blockState={blockState}
                onHoverComponent={onHoverComponent}
                selectedVariants={selectedVariants}
              />
            );
          }
          return viewMode === "3d_iso" ? (
            <g id="v-bank-3d-full-assembly">
              {currentLayout === "v6" ? (
                <V6BlockCastingIso
                  layoutSpec={layoutSpec}
                  blockState={blockState}
                  onHoverComponent={onHoverComponent}
                  selectedVariants={selectedVariants}
                />
              ) : currentLayout === "v8" ? (
                <V8BlockCastingIso
                  layoutSpec={layoutSpec}
                  blockState={blockState}
                  onHoverComponent={onHoverComponent}
                  selectedVariants={selectedVariants}
                />
              ) : currentLayout === "v10" ? (
                <V10BlockCastingIso
                  layoutSpec={layoutSpec}
                  blockState={blockState}
                  onHoverComponent={onHoverComponent}
                  selectedVariants={selectedVariants}
                />
              ) : (
                <VBankBlockCastingIso
                  layoutSpec={layoutSpec}
                  blockState={blockState}
                  onHoverComponent={onHoverComponent}
                  selectedVariants={selectedVariants}
                />
              )}
              {/* 3D Radiator & Electric Cooling Fan Assembly at Front-Left */}
              <RadiatorIso
                layoutSpec={layoutSpec}
                componentState={blockState}
                onHoverComponent={onHoverComponent}
              />
              {/* 3D Racing Transmission & Bellhousing with Clutch Cutaway at Rear-Right */}
              <TransmissionIso
                layoutSpec={layoutSpec}
                componentState={crankState}
                onHoverComponent={onHoverComponent}
              />
              <VBankIsoRenderer
                layoutSpec={layoutSpec}
                blockState={blockState}
                onHoverComponent={onHoverComponent}
                selectedVariants={selectedVariants}
              />
            </g>
          ) : (
            <VBankLayoutRenderer
              layoutSpec={layoutSpec}
              blockState={blockState}
              onHoverComponent={onHoverComponent}
              selectedVariants={selectedVariants}
            />
          );
        })()}

        {/* ── 2. FORGED STEEL CRANKSHAFT WITH 3D VOLUMETRIC MAIN BEARINGS & CAPS ── */}
        {viewMode === "3d_iso" ? (
          <CrankshaftIso
            layoutSpec={layoutSpec}
            componentState={crankState}
            isAssemblyComplete={isAssemblyComplete}
            selectedVariants={selectedVariants}
            onHoverComponent={onHoverComponent}
          />
        ) : (
          <g
            id="crankshaft"
            onMouseEnter={() => onHoverComponent?.("crankshaft")}
            onMouseLeave={() => onHoverComponent?.(null)}
            className={`cursor-pointer transition-all duration-700 ease-out ${
              crankState.isActive ? "filter-glow-active" : ""
            }`}
            style={{
              transform: `translate(${crankState.offsetX}px, ${crankState.offsetY}px)`,
              opacity: crankState.opacity,
            }}
            filter={crankState.isInstalled ? "url(#soft-shadow-3d)" : undefined}
          >
            {/* Main Forged Steel Crank Shaft Cylindrical Axis */}
            <path
              d={`M ${layoutSpec.bx - 30} 305 L ${layoutSpec.bx + layoutSpec.bw + 30} 305`}
              fill="none"
              stroke="url(#crank-forged-3d)"
              strokeWidth="22"
              strokeLinecap="round"
            />
            {/* Main Axis Top Specular Highlight Line */}
            <line x1={layoutSpec.bx - 28} y1="295" x2={layoutSpec.bx + layoutSpec.bw + 28} y2="295" stroke="#ffffff" strokeWidth="2.8" opacity="0.95" />
            <line x1={layoutSpec.bx - 28} y1="298" x2={layoutSpec.bx + layoutSpec.bw + 28} y2="298" stroke="#e2e8f0" strokeWidth="1.2" opacity="0.7" />

            {/* Super-Polished Mirror Chrome Main Journals & 3D Main Bearing Shell Caps (Dynamically mapped over layoutSpec.cyls) */}
            {layoutSpec.cyls.map((cxPos, idx) => (
              <g key={`main-journal-cap-${idx}`}>
                {/* 3D Cast Iron Main Bearing Cap Pedestal (Underneath Journal) */}
                <rect x={cxPos - 12} y="302" width="24" height="20" rx="4" fill="url(#main-bearing-cap-cast-iron)" stroke="#090d16" strokeWidth="1.8" />
                <line x1={cxPos - 11} y1="303.5" x2={cxPos + 11} y2="303.5" stroke="#f8fafc" strokeWidth="1.2" opacity="0.9" />
                
                {/* Tri-Metal Copper-Lead Babbitt Bearing Shell Half Insert */}
                <rect x={cxPos - 9.5} y="295" width="19" height="11" rx="2" fill="url(#tri-metal-bearing-shell)" stroke="#78350f" strokeWidth="1" />

                {/* Polished Mirror Chrome Journal Surface */}
                <rect x={cxPos - 8} y="293" width="16" height="24" rx="3" fill="url(#journal-polished-chrome)" stroke="#090d16" strokeWidth="1.2" />
                <line x1={cxPos - 6} y1="295" x2={cxPos + 6} y2="295" stroke="#ffffff" strokeWidth="1.8" />
                <line x1={cxPos - 6} y1="301" x2={cxPos + 6} y2="301" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
                
                {/* Journal Center Oiling Hole Port */}
                <circle cx={cxPos} cy="305" r="2.2" fill="#020617" stroke="#38bdf8" strokeWidth="0.8" />

                {/* Dual ARP Main Cap Studs with 12-Point Hex Nuts */}
                <g fill="url(#bolt-boss-3d)" stroke="#090d16" strokeWidth="0.9">
                  <circle cx={cxPos - 9} cy="316" r="2.8" />
                  <polygon points={`${cxPos - 9},314.5 ${cxPos - 7.2},315.2 ${cxPos - 7.2},316.8 ${cxPos - 9},317.5 ${cxPos - 10.8},316.8 ${cxPos - 10.8},315.2`} fill="#ffffff" />
                  <circle cx={cxPos + 9} cy="316" r="2.8" />
                  <polygon points={`${cxPos + 9},314.5 ${cxPos + 10.8},315.2 ${cxPos + 10.8},316.8 ${cxPos + 9},317.5 ${cxPos + 7.2},316.8 ${cxPos + 7.2},315.2`} fill="#ffffff" />
                </g>
              </g>
            ))}

            {/* Swept 3D Forged Steel Counterweight Webs with Precision Balance Drills */}
            {layoutSpec.cyls.map((cxPos, idx) => {
              const isEven = idx % 2 === 0;
              const cw = { cx: cxPos, cy: isEven ? 324 : 286 };
              return (
                <g key={`counterweight-${idx}`}>
                  {/* Swept D-Shaped Forged Web Body */}
                  <path
                    d={`M ${cw.cx - 24} ${cw.cy - 12} Q ${cw.cx} ${cw.cy + 28} ${cw.cx + 24} ${cw.cy - 12} Z`}
                    fill="url(#crank-forged-3d)"
                    stroke="#090d16"
                    strokeWidth="2.5"
                  />
                  {/* Web Bevel Edge Specular Highlight Arc */}
                  <path
                    d={`M ${cw.cx - 20} ${cw.cy - 10} Q ${cw.cx} ${cw.cy + 24} ${cw.cx + 20} ${cw.cy - 10} Z`}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    opacity="0.85"
                  />
                  {/* 3 Precision Balance Drill Holes with Inset Conical Depth Shading */}
                  <g>
                    <circle cx={cw.cx - 10} cy={cw.cy + 6} r="3.5" fill="#020617" stroke="#475569" strokeWidth="1" />
                    <circle cx={cw.cx - 10} cy={cw.cy + 6} r="1.8" fill="#1e293b" />
                    
                    <circle cx={cw.cx + 10} cy={cw.cy + 6} r="3.5" fill="#020617" stroke="#475569" strokeWidth="1" />
                    <circle cx={cw.cx + 10} cy={cw.cy + 6} r="1.8" fill="#1e293b" />
                    
                    <circle cx={cw.cx} cy={cw.cy + 14} r="4" fill="#020617" stroke="#475569" strokeWidth="1" />
                    <circle cx={cw.cx} cy={cw.cy + 14} r="2" fill="#1e293b" />
                  </g>
                </g>
              );
            })}

            {/* Left Extended 3-Step Crankshaft Snout & Woodruff Keyway */}
            <g fill="url(#crank-forged-3d)" stroke="#090d16" strokeWidth="1.8">
              {/* Step 1: Front Main Seal Journal */}
              <rect x={layoutSpec.bx + 6} y="295" width="22" height="20" rx="3" />
              <line x1={layoutSpec.bx + 7} y1="296" x2={layoutSpec.bx + 27} y2="296" stroke="#ffffff" strokeWidth="1.8" opacity="0.95" />
              
              {/* Step 2: Timing Gear Drive Journal */}
              <rect x={layoutSpec.bx - 14} y="297" width="20" height="16" rx="2" />
              <line x1={layoutSpec.bx - 13} y1="298" x2={layoutSpec.bx + 5} y2="298" stroke="#ffffff" strokeWidth="1.5" opacity="0.9" />
              
              {/* Step 3: Keyed Snout Tip */}
              <rect x={layoutSpec.bx - 35} y="299" width="21" height="12" rx="1.5" />
              <line x1={layoutSpec.bx - 34} y1="300" x2={layoutSpec.bx - 15} y2="300" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
            </g>

            {/* Precision Keyway Drive Slot & Woodruff Key */}
            <rect x={layoutSpec.bx - 30} y="303" width="13" height="4.5" fill="#020617" rx="1" stroke="#475569" strokeWidth="0.8" />
            <rect x={layoutSpec.bx - 28} y="304" width="9" height="2.5" fill="#38bdf8" rx="0.5" />

            {/* Right Rear Flywheel Flange with 8-Bolt Pattern & Pilot Bearing */}
            <g>
              {/* Main Flange Disc */}
              <rect x={layoutSpec.bx + layoutSpec.bw + 10} y="284" width="22" height="42" rx="4" fill="url(#crank-forged-3d)" stroke="#090d16" strokeWidth="2.2" />
              <line x1={layoutSpec.bx + layoutSpec.bw + 11} y1="285.5" x2={layoutSpec.bx + layoutSpec.bw + 31} y2="285.5" stroke="#ffffff" strokeWidth="2.2" opacity="0.95" />
              
              {/* Center Pilot Bearing Recess */}
              <circle cx={layoutSpec.bx + layoutSpec.bw + 21} cy="305" r="5.5" fill="#020617" stroke="#cbd5e1" strokeWidth="1.2" />
              <circle cx={layoutSpec.bx + layoutSpec.bw + 21} cy="305" r="2.8" fill="#b45309" stroke="#fef08a" strokeWidth="0.8" />

              {/* 8-Bolt Circle Pattern */}
              <circle cx={layoutSpec.bx + layoutSpec.bw + 21} cy="289" r="2.2" fill="#020617" stroke="#ffffff" strokeWidth="0.8" />
              <circle cx={layoutSpec.bx + layoutSpec.bw + 21} cy="297" r="2.2" fill="#020617" stroke="#ffffff" strokeWidth="0.8" />
              <circle cx={layoutSpec.bx + layoutSpec.bw + 21} cy="313" r="2.2" fill="#020617" stroke="#ffffff" strokeWidth="0.8" />
              <circle cx={layoutSpec.bx + layoutSpec.bw + 21} cy="321" r="2.2" fill="#020617" stroke="#ffffff" strokeWidth="0.8" />

              {/* Starter Ring Gear Teeth */}
              <line x1={layoutSpec.bx + layoutSpec.bw + 30} y1="284" x2={layoutSpec.bx + layoutSpec.bw + 30} y2="326" stroke="#090d16" strokeWidth="3.5" strokeDasharray="3 2" />
            </g>
          </g>
        )}

        {/* ── 3. FORGED STEEL H-BEAM CONNECTING RODS & ARP FASTENERS ── */}
        {viewMode === "3d_iso" ? null : (
          <g
            id="rods"
            onMouseEnter={() => onHoverComponent?.("rods")}
            onMouseLeave={() => onHoverComponent?.(null)}
            className="cursor-pointer transition-all duration-700 ease-out"
            style={{
              transform: `translate(${rodState.offsetX}px, ${rodState.offsetY}px)`,
              opacity: rodState.opacity,
            }}
          >
            {layoutSpec.cyls.map((cxPos, idx) => {
              const isOdd = idx % 2 === 1;
              const rodY = isOdd ? 184 : 194;
              const rodH = 104;
              const rod = { x: cxPos, y: rodY, h: rodH };
              return (
                <g key={`rod-${idx}`}>
                  {/* Forged Steel H-Beam Outer Shank */}
                  <rect x={rod.x - 7} y={rod.y} width="14" height={rod.h} rx="5" fill="url(#forged-steel)" stroke="#090d16" strokeWidth="2.2" />
                  {/* Top Chamfer Specular Highlight Line */}
                  <line x1={rod.x - 6} y1={rod.y + 2} x2={rod.x + 6} y2={rod.y + 2} stroke="#ffffff" strokeWidth="2" opacity="0.98" />
                  <line x1={rod.x - 6} y1={rod.y + 4} x2={rod.x + 6} y2={rod.y + 4} stroke="#ffffff" strokeWidth="0.9" opacity="0.6" />

                  {/* Recessed H-Beam Center Channel */}
                  <rect x={rod.x - 4.5} y={rod.y + 10} width="9" height={rod.h - 22} rx="2.5" fill="#020617" stroke="#475569" strokeWidth="0.8" />
                  {/* Center Channel Polished Specular Reflection Streak */}
                  <line x1={rod.x - 2.5} y1={rod.y + 12} x2={rod.x - 2.5} y2={rod.y + rod.h - 14} stroke="url(#journal-polished-chrome)" strokeWidth="1.8" />
                  <line x1={rod.x - 1} y1={rod.y + 12} x2={rod.x - 1} y2={rod.y + rod.h - 14} stroke="#ffffff" strokeWidth="0.9" opacity="0.8" />

                  {/* Small-End Wrist Pin Bushing (Phosphor Bronze Sleeve) */}
                  <circle cx={rod.x} cy={rod.y + 6} r="5.2" fill="none" stroke="#d97706" strokeWidth="2.8" />
                  <circle cx={rod.x} cy={rod.y + 6} r="3" fill="#020617" />
                  {/* Small-End Oiling Hole */}
                  <circle cx={rod.x} cy={rod.y + 2} r="1.2" fill="#020617" />

                  {/* Big-End Rod Cap Precision Split Line */}
                  <line x1={rod.x - 7.5} y1={rod.y + rod.h - 10} x2={rod.x + 7.5} y2={rod.y + rod.h - 10} stroke="#090d16" strokeWidth="2.8" />

                  {/* Dual ARP 2000 12-Point Hex Rod Cap Fasteners */}
                  <g fill="url(#bolt-boss-3d)" stroke="#090d16" strokeWidth="0.9">
                    <circle cx={rod.x - 4} cy={rod.y + rod.h - 5} r="2.8" />
                    <polygon points={`${rod.x - 4},${rod.y + rod.h - 6.5} ${rod.x - 2.5},${rod.y + rod.h - 5.8} ${rod.x - 2.5},${rod.y + rod.h - 4.2} ${rod.x - 4},${rod.y + rod.h - 3.5} ${rod.x - 5.5},${rod.y + rod.h - 4.2} ${rod.x - 5.5},${rod.y + rod.h - 5.8}`} fill="#ffffff" />
                    <circle cx={rod.x + 4} cy={rod.y + rod.h - 5} r="2.8" />
                    <polygon points={`${rod.x + 4},${rod.y + rod.h - 6.5} ${rod.x + 5.5},${rod.y + rod.h - 5.8} ${rod.x + 5.5},${rod.y + rod.h - 4.2} ${rod.x + 4},${rod.y + rod.h - 3.5} ${rod.x + 2.5},${rod.y + rod.h - 4.2} ${rod.x + 2.5},${rod.y + rod.h - 5.8}`} fill="#ffffff" />
                  </g>
                </g>
              );
            })}
          </g>
        )}

        {/* ── 4. ANODIZED BILLET ALUMINUM PISTONS & POLISHED METALLIC RINGS ── */}
        {viewMode === "3d_iso" ? (
          <PistonsIso
            layoutSpec={layoutSpec}
            componentState={pistonState}
            isAssemblyComplete={isAssemblyComplete}
            selectedVariants={selectedVariants}
            onHoverComponent={onHoverComponent}
          />
        ) : (
          <g
            id="pistons"
            onMouseEnter={() => onHoverComponent?.("pistons")}
            onMouseLeave={() => onHoverComponent?.(null)}
            className="cursor-pointer transition-all duration-700 ease-out"
            style={{
              transform: `translate(${pistonState.offsetX}px, ${pistonState.offsetY}px)`,
              opacity: pistonState.opacity,
            }}
            filter={pistonState.isInstalled ? "url(#soft-shadow-3d)" : undefined}
          >
            {layoutSpec.cyls.map((cxPos, idx) => {
              const isOdd = idx % 2 === 1;
              const pY = isOdd ? 152 : 162;
              const p = { x: cxPos, y: pY, h: 44 };
              const pWidth = Math.max(30, layoutSpec.width - 6);
              const pRadius = pWidth / 2;

              // Staggered firing delay (0.0s to 1.0s)
              const phaseDelaySeconds = ((idx % 6) * 0.2).toFixed(1);
              const animClass = isAssemblyComplete || pistonState.isActive ? "piston-anim-vertical" : "";

              return (
                <g
                  key={`piston-${idx}`}
                  className={animClass}
                  style={{
                    animationDelay: `${phaseDelaySeconds}s`,
                  }}
                >
                  {/* Metallic Anodized Blue Billet Crown & Side Skirt (Mated inside cylinder bores!) */}
                  <rect x={p.x - pRadius} y={p.y} width={pWidth} height={p.h} rx="6" fill="url(#anodized-blue)" stroke="#090d16" strokeWidth="2.5" />
                  
                  {/* CNC Machined Piston Crown Top Deck & Bevel Highlight */}
                  <path d={`M ${p.x - pRadius + 2} ${p.y + 4} L ${p.x + pRadius - 2} ${p.y + 4} L ${p.x + pRadius - 4} ${p.y + 1} L ${p.x - pRadius + 4} ${p.y + 1} Z`} fill="url(#machined-deck-bevel)" />
                  <line x1={p.x - pRadius + 3} y1={p.y + 2} x2={p.x + pRadius - 3} y2={p.y + 2} stroke="#ffffff" strokeWidth="2.5" opacity="0.98" />

                  {/* Recessed Dual CNC Valve Relief Cutouts */}
                  <ellipse cx={p.x - 9} cy={p.y + 3} rx="5.5" ry="2.2" fill="#020617" opacity="0.8" />
                  <ellipse cx={p.x - 9} cy={p.y + 3} rx="4.5" ry="1.5" fill="url(#machined-deck-bevel)" opacity="0.7" />
                  
                  <ellipse cx={p.x + 9} cy={p.y + 3} rx="5.5" ry="2.2" fill="#020617" opacity="0.8" />
                  <ellipse cx={p.x + 9} cy={p.y + 3} rx="4.5" ry="1.5" fill="url(#machined-deck-bevel)" opacity="0.7" />

                  {/* 3 Distinct 3D Metallic Ring Lands */}
                  <rect x={p.x - 21} y={p.y + 8} width="42" height="2.8" rx="1" fill="url(#journal-polished-chrome)" stroke="#090d16" strokeWidth="0.9" />
                  <rect x={p.x - 20.5} y={p.y + 14} width="41" height="2.8" rx="1" fill="url(#chrome-3d)" stroke="#090d16" strokeWidth="0.9" />
                  <rect x={p.x - 20.5} y={p.y + 20} width="41" height="3.2" rx="1" fill="#1e293b" stroke="#090d16" strokeWidth="0.9" />

                  {/* Pin Boss Skirt Chamfer & Hollow Hardened Steel Wrist Pin */}
                  <rect x={p.x - 10} y={p.y + 26} width="20" height="13" rx="3.5" fill="url(#chrome-3d)" stroke="#090d16" strokeWidth="1.2" />
                  <circle cx={p.x} cy={p.y + 32} r="6.5" fill="url(#journal-polished-chrome)" stroke="#090d16" strokeWidth="2.2" />
                  <circle cx={p.x} cy={p.y + 32} r="3.2" fill="#020617" />
                </g>
              );
            })}
          </g>
        )}

        {/* ── 5. MULTILAYER STEEL (MLS) HEAD GASKET WITH COPPER STOPPER BEADS ── */}
        {viewMode === "3d_iso" ? (
          <HeadGasketIso
            layoutSpec={layoutSpec}
            componentState={gasketState}
            onHoverComponent={onHoverComponent}
          />
        ) : (
          <g
            id="head_gasket"
            onMouseEnter={() => onHoverComponent?.("head_gasket")}
            onMouseLeave={() => onHoverComponent?.(null)}
            className="cursor-pointer transition-all duration-700 ease-out"
            style={{
              transform: `translate(${gasketState.offsetX}px, ${gasketState.offsetY}px)`,
              opacity: gasketState.opacity,
            }}
          >
            {/* Main MLS Copper Head Gasket Body (Mated on top of block deck at Y: 106!) */}
            <rect x={layoutSpec.bx + 2} y="104" width={layoutSpec.bw - 4} height="8" rx="2.5" fill="url(#copper-gasket)" stroke="#090d16" strokeWidth="2" opacity="0.98" />
            <line x1={layoutSpec.bx + 4} y1="105.5" x2={layoutSpec.bx + layoutSpec.bw - 4} y2="105.5" stroke="#ffffff" strokeWidth="1.5" opacity="0.9" />
            
            {/* Combustion Stopper Ring Seals (Dynamically aligned with layoutSpec.cyls!) */}
            {layoutSpec.cyls.map((gx, idx) => (
              <ellipse key={`gasket-ring-${idx}`} cx={gx} cy="108" rx={layoutSpec.width / 2 - 1} ry="2.8" fill="none" stroke="#fba518" strokeWidth="1.6" />
            ))}
          </g>
        )}

        {/* ── 6. BRUSHED ALUMINUM CNC CYLINDER HEAD & DUAL DOME CHAMBERS ── */}
        {viewMode === "3d_iso" ? (
          <CylinderHeadIso
            layoutSpec={layoutSpec}
            componentState={headState}
            selectedVariants={selectedVariants}
            onHoverComponent={onHoverComponent}
          />
        ) : (
          <g
            id="cylinder_head"
            onMouseEnter={() => onHoverComponent?.("cylinder_head")}
            onMouseLeave={() => onHoverComponent?.(null)}
            className="cursor-pointer transition-all duration-700 ease-out"
            style={{
              transform: `translate(${headState.offsetX}px, ${headState.offsetY}px)`,
              opacity: headState.opacity,
            }}
            filter={headState.isInstalled ? "url(#soft-shadow-3d)" : undefined}
          >
            {/* Spark Plugs & Ignition Coil Packs (Dynamically aligned with layoutSpec.cyls!) */}
            {layoutSpec.cyls.map((spx, idx) => (
              <g key={`sparkplug-${idx}`}>
                <rect x={spx - 4} y="16" width="8" height="22" rx="2.5" fill="#f8fafc" stroke="#090d16" strokeWidth="1.2" />
                <rect x={spx - 6} y="14" width="12" height="6" rx="2" fill="#0f172a" />
                <line x1={spx} y1="8" x2={spx} y2="14" stroke="#ea580c" strokeWidth="2.5" />
              </g>
            ))}

            {/* Main Brushed Aluminum Cylinder Head Block (Mated on top of Head Gasket at Y: 104!) */}
            <rect
              x={layoutSpec.bx + 2}
              y="36"
              width={layoutSpec.bw - 4}
              height="70"
              rx="10"
              fill="url(#brushed-head)"
              stroke={headState.isHovered || headState.isActive ? "#38bdf8" : "#090d16"}
              strokeWidth="3.8"
            />
            {/* Top Edge Bevel & Machined Flange Lip */}
            <line x1={layoutSpec.bx + 4} y1="39" x2={layoutSpec.bx + layoutSpec.bw - 4} y2="39" stroke="#ffffff" strokeWidth="2.8" opacity="0.95" />

            {/* Combustion Dome Cutout Scallops along bottom deck */}
            {layoutSpec.cyls.map((cx, idx) => (
              <g key={`dome-${idx}`}>
                <path d={`M ${cx - layoutSpec.width / 2.3} 106 A ${layoutSpec.width / 2.3} ${layoutSpec.width / 2.3} 0 0 1 ${cx + layoutSpec.width / 2.3} 106 Z`} fill="#020617" opacity="0.6" />
                {isAssemblyComplete && (
                  <path d={`M ${cx - layoutSpec.width / 2.3} 106 A ${layoutSpec.width / 2.3} ${layoutSpec.width / 2.3} 0 0 1 ${cx + layoutSpec.width / 2.3} 106 Z`} fill="url(#combustion-glow)" className="animate-pulse" />
                )}
              </g>
            ))}

            {/* Recessed Deck Hex Head Bolts Across Top Rim */}
            {[136, 175, 214, 250, 290, 329, 364].map((bx, idx) => (
              <circle key={`head-bolt-${idx}`} cx={bx} cy="46" r="4.5" fill="#334155" stroke="#090d16" strokeWidth="1.4" />
            ))}

            {/* Laser Debossed Typography */}
            <text
              x="250"
              y="76"
              fill="#090d16"
              fontSize="10"
              fontFamily="monospace"
              textAnchor="middle"
              fontWeight="900"
              letterSpacing="2.8"
              opacity="0.95"
            >
              CYLINDER HEAD (CNC PORTED)
            </text>
          </g>
        )}

        {/* ── 7. DUAL HELICAL SPRINGS, TITANIUM RETAINERS & 45-DEGREE MUSHROOM VALVES ── */}
        {viewMode === "3d_iso" ? (
          <ValvesIso
            layoutSpec={layoutSpec}
            componentState={valveState}
            selectedVariants={selectedVariants}
            onHoverComponent={onHoverComponent}
          />
        ) : (
          <g
            id="valves"
            onMouseEnter={() => onHoverComponent?.("valves")}
            onMouseLeave={() => onHoverComponent?.(null)}
            className="cursor-pointer transition-all duration-700 ease-out"
            style={{
              transform: `translate(${valveState.offsetX}px, ${valveState.offsetY}px)`,
              opacity: valveState.opacity,
            }}
          >
            {layoutSpec.cyls.flatMap((cx) => [cx - 10, cx + 10]).map((vx, idx) => (
              <g key={`valve-${idx}`}>
                {/* Bronze Valve Guide Sleeve in Head Casting */}
                <rect x={vx - 3.5} y="48" width="7" height="34" rx="2" fill="none" stroke="#b45309" strokeWidth="1.8" opacity="0.95" />

                {/* Polished Mirror Chrome Hardened Valve Stem */}
                <line x1={vx} y1="42" x2={vx} y2="108" stroke="url(#journal-polished-chrome)" strokeWidth="3.5" />
                <line x1={vx - 0.8} y1="42" x2={vx - 0.8} y2="108" stroke="#ffffff" strokeWidth="1.2" opacity="0.95" />

                {/* 3D Helical Spiraling Dual Valve Springs (Outer & Inner Coils) */}
                {[50, 58, 66, 74].map((sy, sidx) => (
                  <g key={`coil-${sidx}`}>
                    {/* Back Coil Loop Arc */}
                    <path d={`M ${vx - 6} ${sy} Q ${vx} ${sy - 2.5} ${vx + 6} ${sy}`} fill="none" stroke="#090d16" strokeWidth="2.8" />
                    {/* Front Helical Coil Arc with 3D Highlight */}
                    <path d={`M ${vx - 6.5} ${sy + 4} Q ${vx} ${sy + 8.5} ${vx + 6.5} ${sy + 4}`} fill="none" stroke="#94a3b8" strokeWidth="3.2" strokeLinecap="round" />
                    <path d={`M ${vx - 5.5} ${sy + 3.5} Q ${vx} ${sy + 7.5} ${vx + 5.5} ${sy + 3.5}`} fill="none" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
                  </g>
                ))}

                {/* 3D CNC Titanium Valve Retainer Cap with Split Collet Keepers */}
                <path d={`M ${vx - 7.5} 44 L ${vx + 7.5} 44 L ${vx + 5.5} 50 L ${vx - 5.5} 50 Z`} fill="url(#machined-deck-bevel)" stroke="#090d16" strokeWidth="1.2" />
                <line x1={vx - 6.5} y1="45" x2={vx + 6.5} y2="45" stroke="#ffffff" strokeWidth="1.2" opacity="0.95" />

                {/* 45-Degree Beveled Mushroom Valve Disc Head */}
                <g>
                  <path d={`M ${vx - 9} 108 L ${vx + 9} 108 L ${vx + 5} 99 L ${vx - 5} 99 Z`} fill="url(#machined-deck-bevel)" stroke="#090d16" strokeWidth="1.5" />
                  <line x1={vx - 8.5} y1="107" x2={vx + 8.5} y2="107" stroke="#ffffff" strokeWidth="1.2" opacity="0.9" />
                </g>
              </g>
            ))}
          </g>
        )}

        {/* ── 8. CAMSHAFTS & SPROCKET GEAR TIMING SYSTEM ── */}
        {viewMode === "3d_iso" ? (
          <CamshaftIso
            layoutSpec={layoutSpec}
            componentState={camState}
            selectedVariants={selectedVariants}
            onHoverComponent={onHoverComponent}
          />
        ) : (
          <g
            id="camshaft"
            onMouseEnter={() => onHoverComponent?.("camshaft")}
            onMouseLeave={() => onHoverComponent?.(null)}
            className="cursor-pointer transition-all duration-700 ease-out"
            style={{
              transform: `translate(${camState.offsetX}px, ${camState.offsetY}px)`,
              opacity: camState.opacity,
            }}
          >
            {/* Dual Overhead Camshaft Sprocket Gears with Timing Teeth */}
            <g fill="url(#forged-steel)" stroke="#090d16" strokeWidth="2.2">
              <circle cx={layoutSpec.bx + 18} cy="46" r="11" strokeDasharray="3 1.5" />
              <circle cx={layoutSpec.bx + 18} cy="46" r="4.5" fill="#090d16" />
              <circle cx={layoutSpec.bx + 18} cy="62" r="11" strokeDasharray="3 1.5" />
              <circle cx={layoutSpec.bx + 18} cy="62" r="4.5" fill="#090d16" />
            </g>

            {/* DOHC Camshaft Shaft Bars */}
            <line x1={layoutSpec.bx + 22} y1="46" x2={layoutSpec.bx + layoutSpec.bw - 18} y2="46" stroke="url(#crank-forged-3d)" strokeWidth="11" strokeLinecap="round" />
            <line x1={layoutSpec.bx + 23} y1="42.5" x2={layoutSpec.bx + layoutSpec.bw - 19} y2="42.5" stroke="#ffffff" strokeWidth="2" opacity="0.9" />

            <line x1={layoutSpec.bx + 22} y1="62" x2={layoutSpec.bx + layoutSpec.bw - 18} y2="62" stroke="url(#crank-forged-3d)" strokeWidth="11" strokeLinecap="round" />
            <line x1={layoutSpec.bx + 23} y1="58.5" x2={layoutSpec.bx + layoutSpec.bw - 19} y2="58.5" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
          </g>
        )}

        {/* ── 9. ULTRA-REALISTIC BILLET ALUMINUM INTAKE MANIFOLD & ELECTRONIC THROTTLE BODY ── */}
        {viewMode === "3d_iso" ? (
          <IntakeManifoldIso
            layoutSpec={layoutSpec}
            componentState={intakeState}
            selectedVariants={selectedVariants}
            onHoverComponent={onHoverComponent}
          />
        ) : (
          <g
            id="intake_manifold"
            onMouseEnter={() => onHoverComponent?.("intake_manifold")}
            onMouseLeave={() => onHoverComponent?.(null)}
            className="cursor-pointer transition-all duration-700 ease-out"
            style={{
              transform: `translate(${intakeState.offsetX}px, ${intakeState.offsetY}px)`,
              opacity: intakeState.opacity,
            }}
            filter={intakeState.isInstalled ? "url(#soft-shadow-3d)" : undefined}
          >
            {/* 1. Main Cast Aluminum Intake Plenum Surge Chamber Box */}
            <g>
              <path
                d={`M ${layoutSpec.bx - 82} 42 C ${layoutSpec.bx - 88} 42 ${layoutSpec.bx - 92} 52 ${layoutSpec.bx - 92} 75 C ${layoutSpec.bx - 92} 98 ${layoutSpec.bx - 88} 108 ${layoutSpec.bx - 82} 108 L ${layoutSpec.bx - 48} 104 C ${layoutSpec.bx - 42} 104 ${layoutSpec.bx - 38} 96 ${layoutSpec.bx - 38} 75 C ${layoutSpec.bx - 38} 54 ${layoutSpec.bx - 42} 46 ${layoutSpec.bx - 48} 46 Z`}
                fill="url(#slate-block-artwork)"
                stroke={intakeState.isHovered ? "#38bdf8" : "#090d16"}
                strokeWidth="3.2"
              />
              {/* Plenum Top Contour Specular Highlight Line */}
              <path
                d={`M ${layoutSpec.bx - 80} 45 C ${layoutSpec.bx - 85} 45 ${layoutSpec.bx - 88} 54 ${layoutSpec.bx - 88} 75 C ${layoutSpec.bx - 88} 94 ${layoutSpec.bx - 85} 104 ${layoutSpec.bx - 80} 104`}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                opacity="0.9"
              />
              {/* Vacuum MAP Sensor Boss on Plenum Roof */}
              <rect x={layoutSpec.bx - 75} y="36" width="16" height="8" rx="2" fill="#090d16" stroke="#38bdf8" strokeWidth="1" />
              <circle cx={layoutSpec.bx - 67} cy="40" r="1.5" fill="#38bdf8" />
            </g>

            {/* 2. Individual Velocity Runners (Plumbing Plenum Chamber to Cylinder Head Ports) */}
            <g>
              {/* Upper Intake Runner Branch */}
              <path
                d={`M ${layoutSpec.bx - 68} 54 C ${layoutSpec.bx - 38} 54 ${layoutSpec.bx - 18} 60 ${layoutSpec.bx + 2} 60`}
                fill="none"
                stroke="url(#cylinder-tube-3d)"
                strokeWidth="20"
                strokeLinecap="round"
              />
              <path
                d={`M ${layoutSpec.bx - 68} 51.5 C ${layoutSpec.bx - 38} 51.5 ${layoutSpec.bx - 18} 57.5 ${layoutSpec.bx + 2} 57.5`}
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.95"
              />

              {/* Lower Intake Runner Branch */}
              <path
                d={`M ${layoutSpec.bx - 68} 96 C ${layoutSpec.bx - 38} 96 ${layoutSpec.bx - 18} 90 ${layoutSpec.bx + 2} 90`}
                fill="none"
                stroke="url(#cylinder-tube-3d)"
                strokeWidth="20"
                strokeLinecap="round"
              />
              <path
                d={`M ${layoutSpec.bx - 68} 93.5 C ${layoutSpec.bx - 38} 93.5 ${layoutSpec.bx - 18} 87.5 ${layoutSpec.bx + 2} 87.5`}
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.95"
              />
            </g>

            {/* 3. Blue 4-Ply Silicone Hose Couplers with Mirror Stainless T-Bolt Clamps */}
            <g>
              {/* Top Coupler */}
              <rect x={layoutSpec.bx - 62} y="44" width="24" height="20" rx="3.5" fill="url(#anodized-blue)" stroke="#090d16" strokeWidth="2" />
              <rect x={layoutSpec.bx - 60} y="45" width="4" height="18" fill="url(#chrome-3d)" />
              <rect x={layoutSpec.bx - 44} y="45" width="4" height="18" fill="url(#chrome-3d)" />
              <circle cx={layoutSpec.bx - 58} cy="42" r="2" fill="#090d16" />

              {/* Bottom Coupler */}
              <rect x={layoutSpec.bx - 62} y="86" width="24" height="20" rx="3.5" fill="url(#anodized-blue)" stroke="#090d16" strokeWidth="2" />
              <rect x={layoutSpec.bx - 60} y="87" width="4" height="18" fill="url(#chrome-3d)" />
              <rect x={layoutSpec.bx - 44} y="87" width="4" height="18" fill="url(#chrome-3d)" />
              <circle cx={layoutSpec.bx - 58} cy="108" r="2" fill="#090d16" />
            </g>

            {/* 4. High-Pressure Billet Fuel Rail & Electronic Fuel Injectors */}
            <g>
              {/* Extruded Blue Anodized Fuel Rail */}
              <rect x={layoutSpec.bx - 55} y="70" width="58" height="10" rx="3" fill="url(#anodized-blue)" stroke="#090d16" strokeWidth="1.8" />
              <line x1={layoutSpec.bx - 53} y1="72" x2={layoutSpec.bx + 1} y2="72" stroke="#ffffff" strokeWidth="1.8" opacity="0.95" />
              
              {/* Fuel Rail End Fitting AN-8 Connector */}
              <rect x={layoutSpec.bx - 62} y="68" width="8" height="14" rx="2" fill="url(#gold-hub)" stroke="#090d16" strokeWidth="1.2" />

              {/* Fuel Injectors Plumbed to Runner Ports */}
              {[-35, -15, 5].map((ix, idx) => (
                <g key={`injector-${idx}`}>
                  <rect x={layoutSpec.bx + ix - 3} y="60" width="6" height="28" rx="2" fill="#0f172a" stroke="#090d16" strokeWidth="1.2" />
                  <rect x={layoutSpec.bx + ix - 2} y="61" width="4" height="4" fill="#38bdf8" />
                  <rect x={layoutSpec.bx + ix - 2} y="82" width="4" height="4" fill="#38bdf8" />
                  {/* Wiring Connector Socket */}
                  <rect x={layoutSpec.bx + ix - 5} y="66" width="4" height="6" fill="#b45309" stroke="#090d16" strokeWidth="0.8" />
                </g>
              ))}
            </g>

            {/* 5. 6061-T6 Billet Aluminum Throttle Body Housing & Drive-By-Wire Actuator */}
            <g>
              {/* Drive-by-Wire Electronic Servo Actuator Module Box (Mounted on side of Throttle Body) */}
              <rect x={layoutSpec.bx - 44} y="52" width="16" height="46" rx="4" fill="#0f172a" stroke="#090d16" strokeWidth="2" />
              <line x1={layoutSpec.bx - 42} y1="54" x2={layoutSpec.bx - 42} y2="94" stroke="#475569" strokeWidth="1.2" />
              {/* 4-Pin Electrical Connector Plug */}
              <rect x={layoutSpec.bx - 46} y="70" width="4" height="10" rx="1" fill="#f59e0b" stroke="#090d16" strokeWidth="0.8" />

              {/* Machined Billet Bellmouth Outer Housing */}
              <circle cx={layoutSpec.bx - 25} cy="75" r="23" fill="url(#cylinder-tube-3d)" stroke="#090d16" strokeWidth="3" />
              <circle cx={layoutSpec.bx - 25} cy="75" r="20" fill="url(#machined-deck-bevel)" stroke="#090d16" strokeWidth="1.8" />
              <circle cx={layoutSpec.bx - 25} cy="75" r="15" fill="#020617" stroke="#475569" strokeWidth="1.5" />

              {/* Precision Brass Butterfly Valve Plate & Central Stainless Shaft */}
              <g>
                {/* Stainless Steel Center Throttle Shaft Rod */}
                <line x1={layoutSpec.bx - 25} y1="57" x2={layoutSpec.bx - 25} y2="93" stroke="url(#chrome-3d)" strokeWidth="3.5" />
                <line x1={layoutSpec.bx - 25.8} y1="58" x2={layoutSpec.bx - 25.8} y2="92" stroke="#ffffff" strokeWidth="1.2" opacity="0.95" />

                {/* Brass Butterfly Disc Plate (Pivoted at 30° throttle opening angle) */}
                <ellipse cx={layoutSpec.bx - 25} cy="75" rx="12.5" ry="4.5" fill="url(#tri-metal-bearing-shell)" stroke="#fef08a" strokeWidth="1.2" opacity="0.95" />
                <circle cx={layoutSpec.bx - 25} cy="75" r="2.2" fill="#090d16" />
              </g>

              {/* Throttle Flange Perimeter Mounting Bolts */}
              {[0, 90, 180, 270].map((ang, bidx) => (
                <circle
                  key={`tb-bolt-${bidx}`}
                  cx={layoutSpec.bx - 25 + 18 * Math.cos((ang * Math.PI) / 180)}
                  cy={75 + 18 * Math.sin((ang * Math.PI) / 180)}
                  r="2.2"
                  fill="url(#bolt-boss-3d)"
                  stroke="#090d16"
                  strokeWidth="0.8"
                />
              ))}
            </g>
          </g>
        )}

        {/* ── 10. ULTRA-REALISTIC EQUAL-LENGTH TITANIUM/INCONEL EXHAUST HEADERS & 4-INTO-1 COLLECTOR ── */}
        {viewMode === "3d_iso" ? (
          <ExhaustHeadersIso
            layoutSpec={layoutSpec}
            componentState={exhaustState}
            onHoverComponent={onHoverComponent}
          />
        ) : (
          <g
            id="exhaust_headers"
            onMouseEnter={() => onHoverComponent?.("exhaust_headers")}
            onMouseLeave={() => onHoverComponent?.(null)}
            className={`cursor-pointer transition-all duration-700 ease-out ${
              isAssemblyComplete ? "filter-heat-shimmer" : ""
            }`}
            style={{
              transform: `translate(${exhaustState.offsetX}px, ${exhaustState.offsetY}px)`,
              opacity: exhaustState.opacity,
            }}
            filter={exhaustState.isInstalled ? "url(#soft-shadow-3d)" : undefined}
          >
            {/* 1. CNC Laser-Cut Heavy Steel Exhaust Head Flange Plate */}
            <g>
              <rect
                x={layoutSpec.bx + layoutSpec.bw - 4}
                y="40"
                width="14"
                height="72"
                rx="4"
                fill="url(#slate-block-artwork)"
                stroke={exhaustState.isHovered ? "#38bdf8" : "#090d16"}
                strokeWidth="2.8"
              />
              <line x1={layoutSpec.bx + layoutSpec.bw - 2} y1="42" x2={layoutSpec.bx + layoutSpec.bw - 2} y2="110" stroke="#ffffff" strokeWidth="1.8" opacity="0.9" />

              {/* Copper Crush Ring Exhaust Port Gaskets */}
              {[48, 64, 84, 102].map((py, pidx) => (
                <g key={`port-${pidx}`}>
                  <ellipse cx={layoutSpec.bx + layoutSpec.bw + 3} cy={py} rx="3.5" ry="6" fill="#b45309" stroke="#fef08a" strokeWidth="1" />
                  <circle cx={layoutSpec.bx + layoutSpec.bw + 3} cy={py - 8} r="2.2" fill="url(#gold-hub)" stroke="#090d16" strokeWidth="0.8" />
                </g>
              ))}
            </g>
          </g>
        )}

        {/* ── 11. PERFECTLY ALIGNED 3D VOLUTE SNAIL SCROLL TURBOCHARGER ── */}
        {isTurboEnabled && (
          viewMode === "3d_iso" ? (
            <TurbochargerIso
              layoutSpec={layoutSpec}
              componentState={turboState}
              isAssemblyComplete={isAssemblyComplete}
              selectedVariants={selectedVariants}
              onHoverComponent={onHoverComponent}
            />
          ) : (
            <g
              id="turbocharger"
              onMouseEnter={() => onHoverComponent?.("turbocharger")}
              onMouseLeave={() => onHoverComponent?.(null)}
              className={`cursor-pointer transition-all duration-700 ease-out ${
                isAssemblyComplete ? "filter-heat-shimmer" : ""
              }`}
              style={{
                transform: `translate(${turboState.offsetX}px, ${turboState.offsetY}px)`,
                opacity: turboState.opacity,
              }}
              filter={turboState.isInstalled ? "url(#soft-shadow-3d)" : undefined}
            >
              {/* Stainless Steel Downpipe */}
              <path
                d={`M ${layoutSpec.bx + layoutSpec.bw + 30} 108 C ${layoutSpec.bx + layoutSpec.bw + 24} 138 ${layoutSpec.bx + layoutSpec.bw + 46} 178 ${layoutSpec.bx + layoutSpec.bw + 32} 196 C ${layoutSpec.bx + layoutSpec.bw + 14} 206 ${layoutSpec.bx + layoutSpec.bw - 14} 194 ${layoutSpec.bx + layoutSpec.bw - 22} 168 C ${layoutSpec.bx + layoutSpec.bw - 28} 152 ${layoutSpec.bx + layoutSpec.bw - 26} 138 ${layoutSpec.bx + layoutSpec.bw - 20} 128`}
                fill="none"
                stroke="url(#stainless-downpipe)"
                strokeWidth="22"
                strokeLinecap="round"
              />
              {/* Cold-Side Billet Compressor Housing */}
              <path
                d={`M ${layoutSpec.bx + layoutSpec.bw + 20} 88 C ${layoutSpec.bx + layoutSpec.bw + 20} 54 ${layoutSpec.bx + layoutSpec.bw + 60} 42 ${layoutSpec.bx + layoutSpec.bw + 80} 62 C ${layoutSpec.bx + layoutSpec.bw + 96} 80 ${layoutSpec.bx + layoutSpec.bw + 88} 118 ${layoutSpec.bx + layoutSpec.bw + 58} 124 C ${layoutSpec.bx + layoutSpec.bw + 30} 128 ${layoutSpec.bx + layoutSpec.bw + 16} 108 ${layoutSpec.bx + layoutSpec.bw + 20} 88 Z`}
                fill="url(#turbo-housing)"
                stroke={turboState.isHovered ? "#38bdf8" : "#090d16"}
                strokeWidth="3.5"
              />
              <circle cx={layoutSpec.bx + layoutSpec.bw + 42} cy="88" r="18" fill="url(#machined-deck-bevel)" stroke="#090d16" strokeWidth="2.8" />
              <circle cx={layoutSpec.bx + layoutSpec.bw + 42} cy="88" r="14" fill="#020617" stroke="#475569" strokeWidth="1.8" />
            </g>
          )
        )}

        {/* ── 12. BRUSHED STEEL OIL PAN SUMP & RULER SCALE PLATE ── */}
        {viewMode === "3d_iso" ? (
          <OilPanIso
            layoutSpec={layoutSpec}
            componentState={panState}
            selectedVariants={selectedVariants}
            onHoverComponent={onHoverComponent}
          />
        ) : (
          <g
            id="oil_pan"
            onMouseEnter={() => onHoverComponent?.("oil_pan")}
            onMouseLeave={() => onHoverComponent?.(null)}
            className="cursor-pointer transition-all duration-700 ease-out"
            style={{
              transform: `translate(${panState.offsetX}px, ${panState.offsetY}px)`,
              opacity: panState.opacity,
            }}
            filter={panState.isInstalled ? "url(#soft-shadow-3d)" : undefined}
          >
            {/* Brushed Steel Oil Pan Sump Shell (Dynamically mated to bottom of engine block at Y: 344!) */}
            <path
              d={`M ${layoutSpec.bx + 36} 344 L ${layoutSpec.bx + 48} 394 Q ${layoutSpec.bx + 52} 402 ${layoutSpec.bx + 64} 402 L ${layoutSpec.bx + layoutSpec.bw - 64} 402 Q ${layoutSpec.bx + layoutSpec.bw - 52} 402 ${layoutSpec.bx + layoutSpec.bw - 48} 394 L ${layoutSpec.bx + layoutSpec.bw - 36} 344 Z`}
              fill="url(#pipe-cylinder-3d)"
              stroke={panState.isHovered ? "#38bdf8" : "#090d16"}
              strokeWidth="3.5"
            />

            {/* Front Scale Recessed Calibration Plate */}
            <rect x={layoutSpec.bx + 52} y="358" width={layoutSpec.bw - 104} height="34" rx="6.5" fill="url(#forged-steel)" stroke="#090d16" strokeWidth="2" />
            <line x1={layoutSpec.bx + 54} y1="359.5" x2={layoutSpec.bx + layoutSpec.bw - 52} y2="359.5" stroke="#ffffff" strokeWidth="1.5" opacity="0.9" />

            {/* Engraved Ruler Calibration Scale Ticks */}
            {[...Array(15)].map((_, idx) => {
              const step = (layoutSpec.bw - 120) / 14;
              const tx = layoutSpec.bx + 60 + idx * step;
              return (
                <line
                  key={`tick-${idx}`}
                  x1={tx}
                  y1="362"
                  x2={tx}
                  y2={idx % 5 === 0 ? "380" : "370"}
                  stroke="#090d16"
                  strokeWidth={idx % 5 === 0 ? "2.2" : "1.2"}
                />
              );
            })}

            {/* Central Triangular Pointer Needle */}
            <polygon points={`${layoutSpec.bx + layoutSpec.bw / 2 - 3},386 ${layoutSpec.bx + layoutSpec.bw / 2 + 3},386 ${layoutSpec.bx + layoutSpec.bw / 2},362`} fill="#090d16" stroke="#ffffff" strokeWidth="1.2" />

            {/* Hex Oil Pan Drain Plug */}
            <circle cx={layoutSpec.bx + layoutSpec.bw - 48} cy="394" r="4.5" fill="#334155" stroke="#090d16" strokeWidth="1.5" />
          </g>
        )}

        {/* ── 13. RACING RADIATOR & DUAL ELECTRIC COOLING FANS ── */}
        {viewMode === "3d_iso" ? (
          <RadiatorIso
            layoutSpec={layoutSpec}
            componentState={radiatorState}
            onHoverComponent={onHoverComponent}
          />
        ) : (
          <g
            id="radiator"
            onMouseEnter={() => onHoverComponent?.("radiator")}
            onMouseLeave={() => onHoverComponent?.(null)}
            className="cursor-pointer transition-all duration-700 ease-out"
            style={{
              transform: `translate(${radiatorState.offsetX}px, ${radiatorState.offsetY}px)`,
              opacity: radiatorState.opacity,
            }}
            filter={radiatorState.isInstalled ? "url(#soft-shadow-3d)" : undefined}
          >
            <rect x={layoutSpec.bx - 68} y="150" width="34" height="150" rx="6" fill="url(#turbo-housing)" stroke={radiatorState.isHovered ? "#38bdf8" : "#090d16"} strokeWidth="2.5" />
            <rect x={layoutSpec.bx - 64} y="160" width="26" height="130" fill="#020617" stroke="#475569" strokeWidth="1" />
            {Array.from({ length: 14 }).map((_, i) => (
              <line key={`rfin-${i}`} x1={layoutSpec.bx - 63} y1={165 + i * 9} x2={layoutSpec.bx - 39} y2={165 + i * 9} stroke="#64748b" strokeWidth="1.2" opacity="0.8" />
            ))}
          </g>
        )}

        {/* ── 14. SEQUENTIAL TRANSMISSION & CUTAWAY BELLHOUSING ── */}
        {viewMode === "3d_iso" ? (
          <TransmissionIso
            layoutSpec={layoutSpec}
            componentState={transmissionState}
            onHoverComponent={onHoverComponent}
          />
        ) : (
          <g
            id="transmission"
            onMouseEnter={() => onHoverComponent?.("transmission")}
            onMouseLeave={() => onHoverComponent?.(null)}
            className="cursor-pointer transition-all duration-700 ease-out"
            style={{
              transform: `translate(${transmissionState.offsetX}px, ${transmissionState.offsetY}px)`,
              opacity: transmissionState.opacity,
            }}
            filter={transmissionState.isInstalled ? "url(#soft-shadow-3d)" : undefined}
          >
            <rect x={layoutSpec.bx + layoutSpec.bw + 8} y="220" width="75" height="110" rx="12" fill="url(#mat-cast-steel)" stroke={transmissionState.isHovered ? "#38bdf8" : "#090d16"} strokeWidth="3" />
            <rect x={layoutSpec.bx + layoutSpec.bw + 18} y="240" width="55" height="70" rx="8" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
            <circle cx={layoutSpec.bx + layoutSpec.bw + 45} cy="275" r="18" fill="url(#gold-hub)" stroke="#090d16" strokeWidth="1.5" />
          </g>
        )}

        {/* ── 15. CARBON-FIBER & GOLD BEZEL ENGINE COVER ── */}
        {viewMode === "3d_iso" ? (
          <EngineCoverIso
            layoutSpec={layoutSpec}
            componentState={engineCoverState}
            selectedVariant={selectedVariants?.engine_cover}
            onHoverComponent={onHoverComponent}
          />
        ) : (
          <g
            id="engine_cover"
            onMouseEnter={() => onHoverComponent?.("engine_cover")}
            onMouseLeave={() => onHoverComponent?.(null)}
            className="cursor-pointer transition-all duration-700 ease-out"
            style={{
              transform: `translate(${engineCoverState.offsetX}px, ${engineCoverState.offsetY}px)`,
              opacity: engineCoverState.opacity,
            }}
            filter={engineCoverState.isInstalled ? "url(#soft-shadow-3d)" : undefined}
          >
            <rect x={layoutSpec.bx + 20} y="75" width={layoutSpec.bw - 40} height="55" rx="8" fill="url(#mat-billet-cnc)" stroke={engineCoverState.isHovered ? "#38bdf8" : "#090d16"} strokeWidth="2.5" />
            <text x={layoutSpec.bx + layoutSpec.bw / 2} y="106" fill="#fef08a" fontSize="10" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
              RACING SPEC EVOLUTION
            </text>
          </g>
        )}

        {/* ── 13. 800V P2/P4 AXIAL-FLUX HYBRID ELECTRIC MOTOR UNIT ── */}
        {isHybridEnabled && (
          viewMode === "3d_iso" ? (
            <HybridMotorIso
              layoutSpec={layoutSpec}
              componentState={hybridMotorState}
              onHoverComponent={onHoverComponent}
            />
          ) : (
            <g
              id="hybrid_motor"
              onMouseEnter={() => onHoverComponent?.("hybrid_motor")}
              onMouseLeave={() => onHoverComponent?.(null)}
              className="cursor-pointer transition-all duration-700 ease-out"
              style={{
                transform: `translate(${hybridMotorState.offsetX}px, ${hybridMotorState.offsetY}px)`,
                opacity: hybridMotorState.opacity,
              }}
              filter={hybridMotorState.isInstalled ? "url(#soft-shadow-3d)" : undefined}
            >
              {/* Main Cylindrical Axial-Flux Motor Housing */}
              <rect x={layoutSpec.bx - 60} y="290" width="54" height="90" rx="10" fill="url(#anodized-blue)" stroke={hybridMotorState.isHovered ? "#38bdf8" : "#090d16"} strokeWidth="3" />
              <rect x={layoutSpec.bx - 56} y="294" width="46" height="82" rx="8" fill="none" stroke="#ffffff" strokeWidth="1.8" opacity="0.9" />

              {/* Copper Stator Winding Coils */}
              <rect x={layoutSpec.bx - 50} y="310" width="34" height="50" rx="5" fill="#020617" stroke="#b45309" strokeWidth="2" />
              <path d={`M ${layoutSpec.bx - 46} 315 L ${layoutSpec.bx - 20} 355 M ${layoutSpec.bx - 46} 325 L ${layoutSpec.bx - 20} 345`} stroke="#f59e0b" strokeWidth="3" strokeDasharray="4 2" />

              {/* High-Voltage 800V Orange Power Cable Harness */}
              <path d={`M ${layoutSpec.bx - 33} 290 C ${layoutSpec.bx - 33} 250 ${layoutSpec.bx - 70} 220 ${layoutSpec.bx - 65} 170`} fill="none" stroke="#f97316" strokeWidth="7" strokeLinecap="round" />
              <path d={`M ${layoutSpec.bx - 33} 290 C ${layoutSpec.bx - 33} 250 ${layoutSpec.bx - 70} 220 ${layoutSpec.bx - 65} 170`} fill="none" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" opacity="0.9" />

              {/* Gold Rotor Hub Nut */}
              <circle cx={layoutSpec.bx - 33} cy="335" r="8" fill="url(#gold-hub)" stroke="#090d16" strokeWidth="1.5" />
              <circle cx={layoutSpec.bx - 33} cy="335" r="4" fill="#090d16" />
            </g>
          )
        )}

        {/* ── 14. SILICON CARBIDE (SiC) INVERTER & HYBRID ECU CONTROL MODULE ── */}
        {isHybridEnabled && (
          viewMode === "3d_iso" ? (
            <InverterECUIso
              layoutSpec={layoutSpec}
              componentState={inverterState}
              onHoverComponent={onHoverComponent}
            />
          ) : (
            <g
              id="inverter_ecu"
              onMouseEnter={() => onHoverComponent?.("inverter_ecu")}
              onMouseLeave={() => onHoverComponent?.(null)}
              className="cursor-pointer transition-all duration-700 ease-out"
              style={{
                transform: `translate(${inverterState.offsetX}px, ${inverterState.offsetY}px)`,
                opacity: inverterState.opacity,
              }}
              filter={inverterState.isInstalled ? "url(#soft-shadow-3d)" : undefined}
            >
              {/* Sealed Billet Inverter Housing with Cooling Fins */}
              <rect x={layoutSpec.bx - 85} y="125" width="60" height="50" rx="8" fill="url(#turbo-housing)" stroke={inverterState.isHovered ? "#38bdf8" : "#090d16"} strokeWidth="2.8" />
              <rect x={layoutSpec.bx - 82} y="128" width="54" height="44" rx="6" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.9" />

              {/* External Heat Sink Cooling Fins */}
              {[-75, -67, -59, -51, -43, -35].map((fx, fidx) => (
                <line key={`fin-${fidx}`} x1={layoutSpec.bx + fx} y1="130" x2={layoutSpec.bx + fx} y2="168" stroke="#090d16" strokeWidth="1.8" />
              ))}

              {/* Pulsing Digital Status LED Indicator */}
              <circle cx={layoutSpec.bx - 75} cy="138" r="3" fill="#38bdf8" stroke="#090d16" strokeWidth="1" className="animate-pulse" />
              <text x={layoutSpec.bx - 55} y="141" fill="#38bdf8" fontSize="6.5" fontFamily="monospace" fontWeight="bold">SiC 800V</text>
            </g>
          )
        )}
        </g>
        )}

        {/* ── 5. NEXT-GEN ROBOTIC ASSEMBLY ANIMATION & PHYSICS FX LAYERS ── */}
        <AssemblyLaserGuidance
          activeComponentId={activeComponentId}
          phase={phase}
          targetPos={{ x: spotlightX, y: spotlightY }}
        />
        <AssemblyTrajectoryOverlay
          activeComponentId={activeComponentId}
          phase={phase}
          targetPos={{ x: spotlightX, y: spotlightY }}
        />
        <RoboticGantryArmOverlay
          activeComponentId={activeComponentId}
          phase={phase}
          targetPos={{ x: spotlightX, y: spotlightY }}
          meta={activeMeta || undefined}
        />
        <AssemblyTorqueHUDOverlay
          activeComponentId={activeComponentId}
          phase={phase}
          targetPos={{ x: spotlightX, y: spotlightY }}
          meta={activeMeta || undefined}
        />
        <AssemblySparkFlashes
          activeComponentId={activeComponentId}
          phase={phase}
          targetPos={{ x: spotlightX, y: spotlightY }}
        />
        {/* ── 6. 3D ISOMETRIC VIEW TITLE BANNER & SPEC METRICS HUD OVERLAY (Matching Reference) ── */}
        {viewMode === "3d_iso" && (
          <g id="iso-spec-hud-overlay" className="pointer-events-none">
            {/* Top Center Title Header Banner */}
            <g id="iso-title-banner" transform="translate(18, 22)">
              <rect
                x="0"
                y="0"
                width="310"
                height="32"
                rx="6"
                fill="#070a12"
                fillOpacity="0.82"
                stroke="#0284c7"
                strokeWidth="1.2"
                strokeOpacity="0.5"
              />
              <circle cx="12" cy="16" r="3.5" fill="#38bdf8" className="animate-pulse" />
              <text x="22" y="14" fill="#f8fafc" fontSize="8.5" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.3">
                3D Isometric View: Racing-Spec V12 Engine
              </text>
              <text x="22" y="24" fill="#38bdf8" fontSize="6.5" fontWeight="600" fontFamily="monospace" letterSpacing="0.5">
                INTEGRATED DRY-SUMP SYSTEM WITH TRANSMISSION
              </text>
            </g>

            {/* Right-Side Floating Spec Metrics Cards (Photo 2 Reference) */}
            <g id="iso-spec-cards" transform="translate(378, 20)">
              {[
                { label: "Configuration", val: "60° V12" },
                { label: "Displacement", val: "6.5L" },
                { label: "Fuel", val: "Direct Injection" },
                { label: "Max RPM", val: "11,000" },
                { label: "Lubrication", val: "Dry Sump" },
                { label: "Sump Tank", val: "Inline Filtration" },
              ].map((card, cIdx) => (
                <g key={`spec-card-${cIdx}`} transform={`translate(0, ${cIdx * 25})`}>
                  {/* Card Background */}
                  <rect
                    x="0"
                    y="0"
                    width="106"
                    height="21"
                    rx="4"
                    fill="#070a12"
                    fillOpacity="0.85"
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                  {/* Accent Left Bar */}
                  <rect x="0" y="0" width="2.5" height="21" rx="1" fill="#0284c7" />
                  {/* Spec Label */}
                  <text x="7" y="9" fill="#94a3b8" fontSize="5.5" fontWeight="600" fontFamily="sans-serif" textAnchor="start">
                    {card.label}
                  </text>
                  {/* Spec Value */}
                  <text x="7" y="17" fill="#f8fafc" fontSize="7.5" fontWeight="bold" fontFamily="monospace" textAnchor="start">
                    {card.val}
                  </text>
                </g>
              ))}
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
