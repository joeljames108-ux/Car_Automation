// ===================================================================
// MASTER EXTERIOR ASSEMBLY SVG CANVAS (960x640 VIEWPORT)
// ===================================================================
// Composes all structural, closure, aerodynamic, optical, glazing,
// and running gear SVG components with z-indexing, exploded view, and FX.
// ===================================================================

import React, { useMemo } from "react";
import type { ExteriorComponentId, ExteriorAssemblyPhase } from "../../../sim/exteriorAssemblyTypes";
import { EXTERIOR_ASSEMBLY_REGISTRY } from "../../../sim/exteriorAssemblyTypes";
import type { MaterialGrade } from "../../../sim/assemblyTypes";
import type {
  ExteriorEngineeringConfig,
  PaintSystemConfig,
  AeroSurfaceConfig,
  LightingConfig,
  GlassConfig,
  ExteriorWheelConfig,
  ExteriorTireConfig,
  ExteriorBrakeVisualConfig,
} from "../../../sim/types/exterior";

import { ChassisFrameShaderDefs } from "./svg/ChassisFrameShaderDefs";
import { BodyPanelShaderDefs } from "./svg/BodyPanelShaderDefs";
import { LightingShaderDefs } from "./svg/LightingShaderDefs";
import { WheelBrakeShaderDefs } from "./svg/WheelBrakeShaderDefs";

import { ChassisFrameSVG } from "./svg/ChassisFrameSVG";
import { SubframeSVG } from "./svg/SubframeSVG";
import { PillarSVG } from "./svg/PillarSVG";
import { HoodPanelSVG } from "./svg/HoodPanelSVG";
import { FenderSVG } from "./svg/FenderSVG";
import { DoorPanelSVG } from "./svg/DoorPanelSVG";
import { RearQuarterSVG } from "./svg/RearQuarterSVG";
import { TrunkLidSVG } from "./svg/TrunkLidSVG";
import { RoofPanelSVG } from "./svg/RoofPanelSVG";
import { BumperSVG } from "./svg/BumperSVG";
import { FrontSplitterSVG } from "./svg/FrontSplitterSVG";
import { RearDiffuserSVG } from "./svg/RearDiffuserSVG";
import { RearWingSVG } from "./svg/RearWingSVG";
import { CanardsSVG } from "./svg/CanardsSVG";
import { SideSkirtSVG } from "./svg/SideSkirtSVG";
import { VentsSVG } from "./svg/VentsSVG";
import { WindshieldSVG } from "./svg/WindshieldSVG";
import { SideGlassSVG } from "./svg/SideGlassSVG";
import { RearWindowSVG } from "./svg/RearWindowSVG";
import { HeadlightSVG } from "./svg/HeadlightSVG";
import { TaillightSVG } from "./svg/TaillightSVG";
import { FogLightSVG } from "./svg/FogLightSVG";
import { AmbientLightingSVG } from "./svg/AmbientLightingSVG";
import { MirrorSVG } from "./svg/MirrorSVG";
import { TrimDetailsSVG } from "./svg/TrimDetailsSVG";
import { WiperAssemblySVG } from "./svg/WiperAssemblySVG";
import { FrontSuspensionSVG } from "./svg/FrontSuspensionSVG";
import { RearSuspensionSVG } from "./svg/RearSuspensionSVG";
import { BrakeCaliperSVG } from "./svg/BrakeCaliperSVG";
import { WheelSVG } from "./svg/WheelSVG";
import { TireSVG } from "./svg/TireSVG";
import { SuspensionGeometryOverlay } from "./svg/SuspensionGeometryOverlay";
import { calculateExplodedOffset } from "./ExteriorAssemblyAnimations";

interface ExteriorSVGCanvasProps {
  installedComponents: ExteriorComponentId[];
  activeComponentId: ExteriorComponentId | null;
  phase: ExteriorAssemblyPhase;
  hoveredComponentId: ExteriorComponentId | null;
  selectedComponentId: ExteriorComponentId | null;
  selectedVariants: Record<ExteriorComponentId, MaterialGrade>;
  isExplodedView: boolean;
  explodedAmount: number;
  exteriorConfig: ExteriorEngineeringConfig;
  paintConfig: PaintSystemConfig;
  aeroConfig: AeroSurfaceConfig;
  lightingConfig: LightingConfig;
  glassConfig: GlassConfig;
  wheelConfig: ExteriorWheelConfig;
  tireConfig: ExteriorTireConfig;
  brakeConfig: ExteriorBrakeVisualConfig;
  onSelectComponent: (id: ExteriorComponentId) => void;
  onHoverComponent: (id: ExteriorComponentId | null) => void;
  className?: string;
}

export const ExteriorSVGCanvas: React.FC<ExteriorSVGCanvasProps> = ({
  installedComponents,
  activeComponentId,
  phase,
  hoveredComponentId,
  selectedComponentId,
  selectedVariants,
  isExplodedView,
  explodedAmount,
  exteriorConfig,
  paintConfig,
  aeroConfig,
  lightingConfig,
  glassConfig,
  wheelConfig,
  tireConfig,
  brakeConfig,
  onSelectComponent,
  onHoverComponent,
  className = "w-full h-full",
}) => {
  const getTransform = (id: ExteriorComponentId) => {
    const isAct = activeComponentId === id;
    if (isAct && (phase === "picking" || phase === "traveling")) {
      return "translate(0, -60)";
    }
    if (isExplodedView || explodedAmount > 0.01) {
      const offset = calculateExplodedOffset(id, explodedAmount);
      return `translate(${offset.x}, ${offset.y})`;
    }
    return "";
  };

  const isVisible = (id: ExteriorComponentId) => {
    return installedComponents.includes(id) || activeComponentId === id;
  };

  const getOpacity = (id: ExteriorComponentId) => {
    if (activeComponentId === id) return 0.95;
    if (installedComponents.includes(id)) return 1.0;
    return isExplodedView ? 0.25 : 0.0;
  };

  return (
    <svg
      viewBox="0 0 960 640"
      className={`select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── 1. Integrated Shader & Material Defs ── */}
      <ChassisFrameShaderDefs materialGrade={selectedVariants.chassis_frame} />
      <BodyPanelShaderDefs paintConfig={paintConfig} />
      <LightingShaderDefs />
      <WheelBrakeShaderDefs />

      {/* ── 2. Background Grid & Dimensional Stage Reference ── */}
      <g id="canvas_background_grid" opacity="0.15">
        <pattern id="cadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0284c7" strokeWidth="0.5" />
        </pattern>
        <rect width="960" height="640" fill="url(#cadGrid)" />
        {/* Ground Plane Axis Line */}
        <line x1="80" y1="410" x2="880" y2="410" stroke="#0284c7" strokeWidth="1.0" strokeDasharray="8 4" />
      </g>

      {/* ── 3. Underbody Ambient Ground Lighting ── */}
      <AmbientLightingSVG
        glowColorHex={lightingConfig.ambientGlowColorHex}
        isEnabled={lightingConfig.underbodyAmbientGlow}
      />

      {/* ── 4. Layered Subsystem Assembly Hierarchy ── */}

      {/* Subframes */}
      {isVisible("front_subframe") && (
        <SubframeSVG
          type="front"
          materialGrade={selectedVariants.front_subframe}
          isHovered={hoveredComponentId === "front_subframe"}
          isSelected={selectedComponentId === "front_subframe"}
          isInstalled={installedComponents.includes("front_subframe")}
          opacity={getOpacity("front_subframe")}
          transform={getTransform("front_subframe")}
          onClick={() => onSelectComponent("front_subframe")}
          onMouseEnter={() => onHoverComponent("front_subframe")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("rear_subframe") && (
        <SubframeSVG
          type="rear"
          materialGrade={selectedVariants.rear_subframe}
          isHovered={hoveredComponentId === "rear_subframe"}
          isSelected={selectedComponentId === "rear_subframe"}
          isInstalled={installedComponents.includes("rear_subframe")}
          opacity={getOpacity("rear_subframe")}
          transform={getTransform("rear_subframe")}
          onClick={() => onSelectComponent("rear_subframe")}
          onMouseEnter={() => onHoverComponent("rear_subframe")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {/* Chassis Frame Master */}
      {isVisible("chassis_frame") && (
        <ChassisFrameSVG
          materialGrade={selectedVariants.chassis_frame}
          exteriorConfig={exteriorConfig}
          isHovered={hoveredComponentId === "chassis_frame"}
          isSelected={selectedComponentId === "chassis_frame"}
          isInstalled={installedComponents.includes("chassis_frame")}
          opacity={getOpacity("chassis_frame")}
          transform={getTransform("chassis_frame")}
          onClick={() => onSelectComponent("chassis_frame")}
          onMouseEnter={() => onHoverComponent("chassis_frame")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {/* Pillars */}
      {isVisible("a_pillar_assembly") && (
        <PillarSVG
          pillarType="a_pillar"
          materialGrade={selectedVariants.a_pillar_assembly}
          isHovered={hoveredComponentId === "a_pillar_assembly"}
          isSelected={selectedComponentId === "a_pillar_assembly"}
          opacity={getOpacity("a_pillar_assembly")}
          transform={getTransform("a_pillar_assembly")}
          onClick={() => onSelectComponent("a_pillar_assembly")}
          onMouseEnter={() => onHoverComponent("a_pillar_assembly")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("b_pillar_assembly") && (
        <PillarSVG
          pillarType="b_pillar"
          materialGrade={selectedVariants.b_pillar_assembly}
          isHovered={hoveredComponentId === "b_pillar_assembly"}
          isSelected={selectedComponentId === "b_pillar_assembly"}
          opacity={getOpacity("b_pillar_assembly")}
          transform={getTransform("b_pillar_assembly")}
          onClick={() => onSelectComponent("b_pillar_assembly")}
          onMouseEnter={() => onHoverComponent("b_pillar_assembly")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("c_pillar_assembly") && (
        <PillarSVG
          pillarType="c_pillar"
          materialGrade={selectedVariants.c_pillar_assembly}
          isHovered={hoveredComponentId === "c_pillar_assembly"}
          isSelected={selectedComponentId === "c_pillar_assembly"}
          opacity={getOpacity("c_pillar_assembly")}
          transform={getTransform("c_pillar_assembly")}
          onClick={() => onSelectComponent("c_pillar_assembly")}
          onMouseEnter={() => onHoverComponent("c_pillar_assembly")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {/* Suspensions */}
      {isVisible("suspension_front_assembly") && (
        <FrontSuspensionSVG
          materialGrade={selectedVariants.suspension_front_assembly}
          isHovered={hoveredComponentId === "suspension_front_assembly"}
          isSelected={selectedComponentId === "suspension_front_assembly"}
          opacity={getOpacity("suspension_front_assembly")}
          transform={getTransform("suspension_front_assembly")}
          onClick={() => onSelectComponent("suspension_front_assembly")}
          onMouseEnter={() => onHoverComponent("suspension_front_assembly")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("suspension_rear_assembly") && (
        <RearSuspensionSVG
          materialGrade={selectedVariants.suspension_rear_assembly}
          isHovered={hoveredComponentId === "suspension_rear_assembly"}
          isSelected={selectedComponentId === "suspension_rear_assembly"}
          opacity={getOpacity("suspension_rear_assembly")}
          transform={getTransform("suspension_rear_assembly")}
          onClick={() => onSelectComponent("suspension_rear_assembly")}
          onMouseEnter={() => onHoverComponent("suspension_rear_assembly")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {/* Brakes */}
      {isVisible("brake_rotors_calipers") && (
        <>
          <BrakeCaliperSVG
            position="front"
            brakeConfig={brakeConfig}
            isHovered={hoveredComponentId === "brake_rotors_calipers"}
            isSelected={selectedComponentId === "brake_rotors_calipers"}
            opacity={getOpacity("brake_rotors_calipers")}
            transform={getTransform("brake_rotors_calipers")}
            onClick={() => onSelectComponent("brake_rotors_calipers")}
            onMouseEnter={() => onHoverComponent("brake_rotors_calipers")}
            onMouseLeave={() => onHoverComponent(null)}
          />
          <BrakeCaliperSVG
            position="rear"
            brakeConfig={brakeConfig}
            isHovered={hoveredComponentId === "brake_rotors_calipers"}
            isSelected={selectedComponentId === "brake_rotors_calipers"}
            opacity={getOpacity("brake_rotors_calipers")}
            transform={getTransform("brake_rotors_calipers")}
            onClick={() => onSelectComponent("brake_rotors_calipers")}
            onMouseEnter={() => onHoverComponent("brake_rotors_calipers")}
            onMouseLeave={() => onHoverComponent(null)}
          />
        </>
      )}

      {/* Wheels & Tires */}
      {isVisible("wheels_tires_assembly") && (
        <>
          <TireSVG position="front" tireConfig={tireConfig} opacity={getOpacity("wheels_tires_assembly")} transform={getTransform("wheels_tires_assembly")} />
          <WheelSVG position="front" wheelConfig={wheelConfig} opacity={getOpacity("wheels_tires_assembly")} transform={getTransform("wheels_tires_assembly")} onClick={() => onSelectComponent("wheels_tires_assembly")} onMouseEnter={() => onHoverComponent("wheels_tires_assembly")} onMouseLeave={() => onHoverComponent(null)} />
          <TireSVG position="rear" tireConfig={tireConfig} opacity={getOpacity("wheels_tires_assembly")} transform={getTransform("wheels_tires_assembly")} />
          <WheelSVG position="rear" wheelConfig={wheelConfig} opacity={getOpacity("wheels_tires_assembly")} transform={getTransform("wheels_tires_assembly")} onClick={() => onSelectComponent("wheels_tires_assembly")} onMouseEnter={() => onHoverComponent("wheels_tires_assembly")} onMouseLeave={() => onHoverComponent(null)} />
        </>
      )}

      {/* Body Closures */}
      {isVisible("front_fenders") && (
        <FenderSVG
          materialGrade={selectedVariants.front_fenders}
          exteriorConfig={exteriorConfig}
          paintConfig={paintConfig}
          isHovered={hoveredComponentId === "front_fenders"}
          isSelected={selectedComponentId === "front_fenders"}
          opacity={getOpacity("front_fenders")}
          transform={getTransform("front_fenders")}
          onClick={() => onSelectComponent("front_fenders")}
          onMouseEnter={() => onHoverComponent("front_fenders")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("rear_quarter_panels") && (
        <RearQuarterSVG
          materialGrade={selectedVariants.rear_quarter_panels}
          exteriorConfig={exteriorConfig}
          paintConfig={paintConfig}
          isHovered={hoveredComponentId === "rear_quarter_panels"}
          isSelected={selectedComponentId === "rear_quarter_panels"}
          opacity={getOpacity("rear_quarter_panels")}
          transform={getTransform("rear_quarter_panels")}
          onClick={() => onSelectComponent("rear_quarter_panels")}
          onMouseEnter={() => onHoverComponent("rear_quarter_panels")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("doors_assembly") && (
        <DoorPanelSVG
          materialGrade={selectedVariants.doors_assembly}
          exteriorConfig={exteriorConfig}
          paintConfig={paintConfig}
          isHovered={hoveredComponentId === "doors_assembly"}
          isSelected={selectedComponentId === "doors_assembly"}
          opacity={getOpacity("doors_assembly")}
          transform={getTransform("doors_assembly")}
          onClick={() => onSelectComponent("doors_assembly")}
          onMouseEnter={() => onHoverComponent("doors_assembly")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("hood_panel") && (
        <HoodPanelSVG
          materialGrade={selectedVariants.hood_panel}
          exteriorConfig={exteriorConfig}
          paintConfig={paintConfig}
          isHovered={hoveredComponentId === "hood_panel"}
          isSelected={selectedComponentId === "hood_panel"}
          opacity={getOpacity("hood_panel")}
          transform={getTransform("hood_panel")}
          onClick={() => onSelectComponent("hood_panel")}
          onMouseEnter={() => onHoverComponent("hood_panel")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("trunk_decklid") && (
        <TrunkLidSVG
          materialGrade={selectedVariants.trunk_decklid}
          exteriorConfig={exteriorConfig}
          paintConfig={paintConfig}
          isHovered={hoveredComponentId === "trunk_decklid"}
          isSelected={selectedComponentId === "trunk_decklid"}
          opacity={getOpacity("trunk_decklid")}
          transform={getTransform("trunk_decklid")}
          onClick={() => onSelectComponent("trunk_decklid")}
          onMouseEnter={() => onHoverComponent("trunk_decklid")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("roof_panel") && (
        <RoofPanelSVG
          materialGrade={selectedVariants.roof_panel}
          exteriorConfig={exteriorConfig}
          paintConfig={paintConfig}
          isHovered={hoveredComponentId === "roof_panel"}
          isSelected={selectedComponentId === "roof_panel"}
          opacity={getOpacity("roof_panel")}
          transform={getTransform("roof_panel")}
          onClick={() => onSelectComponent("roof_panel")}
          onMouseEnter={() => onHoverComponent("roof_panel")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {/* Bumpers & Aero */}
      {isVisible("front_bumper_fascia") && (
        <BumperSVG
          type="front"
          materialGrade={selectedVariants.front_bumper_fascia}
          exteriorConfig={exteriorConfig}
          paintConfig={paintConfig}
          isHovered={hoveredComponentId === "front_bumper_fascia"}
          isSelected={selectedComponentId === "front_bumper_fascia"}
          opacity={getOpacity("front_bumper_fascia")}
          transform={getTransform("front_bumper_fascia")}
          onClick={() => onSelectComponent("front_bumper_fascia")}
          onMouseEnter={() => onHoverComponent("front_bumper_fascia")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("rear_bumper_fascia") && (
        <BumperSVG
          type="rear"
          materialGrade={selectedVariants.rear_bumper_fascia}
          exteriorConfig={exteriorConfig}
          paintConfig={paintConfig}
          isHovered={hoveredComponentId === "rear_bumper_fascia"}
          isSelected={selectedComponentId === "rear_bumper_fascia"}
          opacity={getOpacity("rear_bumper_fascia")}
          transform={getTransform("rear_bumper_fascia")}
          onClick={() => onSelectComponent("rear_bumper_fascia")}
          onMouseEnter={() => onHoverComponent("rear_bumper_fascia")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("front_splitter_tray") && (
        <FrontSplitterSVG
          materialGrade={selectedVariants.front_splitter_tray}
          aeroConfig={aeroConfig}
          isHovered={hoveredComponentId === "front_splitter_tray"}
          isSelected={selectedComponentId === "front_splitter_tray"}
          opacity={getOpacity("front_splitter_tray")}
          transform={getTransform("front_splitter_tray")}
          onClick={() => onSelectComponent("front_splitter_tray")}
          onMouseEnter={() => onHoverComponent("front_splitter_tray")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("rear_diffuser_tunnel") && (
        <RearDiffuserSVG
          materialGrade={selectedVariants.rear_diffuser_tunnel}
          aeroConfig={aeroConfig}
          isHovered={hoveredComponentId === "rear_diffuser_tunnel"}
          isSelected={selectedComponentId === "rear_diffuser_tunnel"}
          opacity={getOpacity("rear_diffuser_tunnel")}
          transform={getTransform("rear_diffuser_tunnel")}
          onClick={() => onSelectComponent("rear_diffuser_tunnel")}
          onMouseEnter={() => onHoverComponent("rear_diffuser_tunnel")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("side_skirts_aero") && (
        <SideSkirtSVG
          materialGrade={selectedVariants.side_skirts_aero}
          isHovered={hoveredComponentId === "side_skirts_aero"}
          isSelected={selectedComponentId === "side_skirts_aero"}
          opacity={getOpacity("side_skirts_aero")}
          transform={getTransform("side_skirts_aero")}
          onClick={() => onSelectComponent("side_skirts_aero")}
          onMouseEnter={() => onHoverComponent("side_skirts_aero")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("rear_wing_spoiler") && (
        <RearWingSVG
          materialGrade={selectedVariants.rear_wing_spoiler}
          aeroConfig={aeroConfig}
          isHovered={hoveredComponentId === "rear_wing_spoiler"}
          isSelected={selectedComponentId === "rear_wing_spoiler"}
          opacity={getOpacity("rear_wing_spoiler")}
          transform={getTransform("rear_wing_spoiler")}
          onClick={() => onSelectComponent("rear_wing_spoiler")}
          onMouseEnter={() => onHoverComponent("rear_wing_spoiler")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("canards_dive_planes") && (
        <CanardsSVG
          materialGrade={selectedVariants.canards_dive_planes}
          isHovered={hoveredComponentId === "canards_dive_planes"}
          isSelected={selectedComponentId === "canards_dive_planes"}
          opacity={getOpacity("canards_dive_planes")}
          transform={getTransform("canards_dive_planes")}
          onClick={() => onSelectComponent("canards_dive_planes")}
          onMouseEnter={() => onHoverComponent("canards_dive_planes")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("hood_fender_vents") && (
        <VentsSVG
          materialGrade={selectedVariants.hood_fender_vents}
          isHovered={hoveredComponentId === "hood_fender_vents"}
          isSelected={selectedComponentId === "hood_fender_vents"}
          opacity={getOpacity("hood_fender_vents")}
          transform={getTransform("hood_fender_vents")}
          onClick={() => onSelectComponent("hood_fender_vents")}
          onMouseEnter={() => onHoverComponent("hood_fender_vents")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {/* Glass & Lighting */}
      {isVisible("windshield_glass") && (
        <WindshieldSVG
          glassConfig={glassConfig}
          isHovered={hoveredComponentId === "windshield_glass"}
          isSelected={selectedComponentId === "windshield_glass"}
          opacity={getOpacity("windshield_glass")}
          transform={getTransform("windshield_glass")}
          onClick={() => onSelectComponent("windshield_glass")}
          onMouseEnter={() => onHoverComponent("windshield_glass")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("side_door_glass") && (
        <SideGlassSVG
          glassConfig={glassConfig}
          isHovered={hoveredComponentId === "side_door_glass"}
          isSelected={selectedComponentId === "side_door_glass"}
          opacity={getOpacity("side_door_glass")}
          transform={getTransform("side_door_glass")}
          onClick={() => onSelectComponent("side_door_glass")}
          onMouseEnter={() => onHoverComponent("side_door_glass")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("rear_window_backlite") && (
        <RearWindowSVG
          glassConfig={glassConfig}
          isHovered={hoveredComponentId === "rear_window_backlite"}
          isSelected={selectedComponentId === "rear_window_backlite"}
          opacity={getOpacity("rear_window_backlite")}
          transform={getTransform("rear_window_backlite")}
          onClick={() => onSelectComponent("rear_window_backlite")}
          onMouseEnter={() => onHoverComponent("rear_window_backlite")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("headlights_matrix") && (
        <HeadlightSVG
          lightingConfig={lightingConfig}
          isHovered={hoveredComponentId === "headlights_matrix"}
          isSelected={selectedComponentId === "headlights_matrix"}
          opacity={getOpacity("headlights_matrix")}
          transform={getTransform("headlights_matrix")}
          onClick={() => onSelectComponent("headlights_matrix")}
          onMouseEnter={() => onHoverComponent("headlights_matrix")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("taillights_oled") && (
        <TaillightSVG
          lightingConfig={lightingConfig}
          isHovered={hoveredComponentId === "taillights_oled"}
          isSelected={selectedComponentId === "taillights_oled"}
          opacity={getOpacity("taillights_oled")}
          transform={getTransform("taillights_oled")}
          onClick={() => onSelectComponent("taillights_oled")}
          onMouseEnter={() => onHoverComponent("taillights_oled")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("fog_drl_lights") && (
        <FogLightSVG
          isHovered={hoveredComponentId === "fog_drl_lights"}
          isSelected={selectedComponentId === "fog_drl_lights"}
          opacity={getOpacity("fog_drl_lights")}
          transform={getTransform("fog_drl_lights")}
          onClick={() => onSelectComponent("fog_drl_lights")}
          onMouseEnter={() => onHoverComponent("fog_drl_lights")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("side_mirrors") && (
        <MirrorSVG
          isHovered={hoveredComponentId === "side_mirrors"}
          isSelected={selectedComponentId === "side_mirrors"}
          opacity={getOpacity("side_mirrors")}
          transform={getTransform("side_mirrors")}
          onClick={() => onSelectComponent("side_mirrors")}
          onMouseEnter={() => onHoverComponent("side_mirrors")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("front_grille_mesh") && (
        <TrimDetailsSVG
          type="grille"
          isHovered={hoveredComponentId === "front_grille_mesh"}
          isSelected={selectedComponentId === "front_grille_mesh"}
          opacity={getOpacity("front_grille_mesh")}
          transform={getTransform("front_grille_mesh")}
          onClick={() => onSelectComponent("front_grille_mesh")}
          onMouseEnter={() => onHoverComponent("front_grille_mesh")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("exhaust_tips_surround") && (
        <TrimDetailsSVG
          type="exhaust"
          isHovered={hoveredComponentId === "exhaust_tips_surround"}
          isSelected={selectedComponentId === "exhaust_tips_surround"}
          opacity={getOpacity("exhaust_tips_surround")}
          transform={getTransform("exhaust_tips_surround")}
          onClick={() => onSelectComponent("exhaust_tips_surround")}
          onMouseEnter={() => onHoverComponent("exhaust_tips_surround")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("door_handles_latches") && (
        <TrimDetailsSVG
          type="handles"
          isHovered={hoveredComponentId === "door_handles_latches"}
          isSelected={selectedComponentId === "door_handles_latches"}
          opacity={getOpacity("door_handles_latches")}
          transform={getTransform("door_handles_latches")}
          onClick={() => onSelectComponent("door_handles_latches")}
          onMouseEnter={() => onHoverComponent("door_handles_latches")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("wiper_cowl_assembly") && (
        <WiperAssemblySVG
          isHovered={hoveredComponentId === "wiper_cowl_assembly"}
          isSelected={selectedComponentId === "wiper_cowl_assembly"}
          opacity={getOpacity("wiper_cowl_assembly")}
          transform={getTransform("wiper_cowl_assembly")}
          onClick={() => onSelectComponent("wiper_cowl_assembly")}
          onMouseEnter={() => onHoverComponent("wiper_cowl_assembly")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {isVisible("badges_emblems") && (
        <TrimDetailsSVG
          type="badges"
          isHovered={hoveredComponentId === "badges_emblems"}
          isSelected={selectedComponentId === "badges_emblems"}
          opacity={getOpacity("badges_emblems")}
          transform={getTransform("badges_emblems")}
          onClick={() => onSelectComponent("badges_emblems")}
          onMouseEnter={() => onHoverComponent("badges_emblems")}
          onMouseLeave={() => onHoverComponent(null)}
        />
      )}

      {/* Kinematics HUD Overlay */}
      <SuspensionGeometryOverlay isVisible={hoveredComponentId === "suspension_front_assembly" || hoveredComponentId === "suspension_rear_assembly"} />
    </svg>
  );
};
