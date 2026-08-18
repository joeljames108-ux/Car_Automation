import React from "react";
import {
  VehicleComponentId,
  getVehicleAssemblyComponents,
} from "../../sim/vehicleAssemblyTypes";
import { AssemblyPhase } from "../../sim/assemblyTypes";
import { EnginePosition, DriveType, VehicleConfig } from "../../sim/types";

import { AssemblyLaserGuidance } from "../assembly/animationFX/AssemblyLaserGuidance";
import { AssemblySparkFlashes } from "../assembly/animationFX/AssemblySparkFlashes";
import { AssemblyTrajectoryOverlay } from "../assembly/animationFX/AssemblyTrajectoryOverlay";
import { AssemblyTorqueHUDOverlay } from "../assembly/animationFX/AssemblyTorqueHUDOverlay";

import { ChassisShaderDefs } from "./chassis/ChassisShaderDefs";
import { ChassisArchitectureRenderer } from "./chassis/ChassisArchitectureRenderer";
import { ChassisStressHeatmap } from "./chassis/ChassisStressHeatmap";
import { IsoVehicleSubsystems3D } from "./chassis/iso3d/IsoVehicleSubsystems3D";

interface VehicleSVGProps {
  installedComponents: VehicleComponentId[];
  activeComponentId: VehicleComponentId | null;
  phase: AssemblyPhase;
  hoveredComponentId: VehicleComponentId | null;
  isExplodedView: boolean;
  enginePosition?: EnginePosition;
  driveType?: DriveType;
  vehicleConfig?: Partial<VehicleConfig>;
  onHoverComponent?: (id: VehicleComponentId | null) => void;
  className?: string;
}

export const VehicleSVG: React.FC<VehicleSVGProps> = ({
  installedComponents,
  activeComponentId,
  phase,
  hoveredComponentId,
  isExplodedView,
  enginePosition = "front",
  driveType = "rwd",
  vehicleConfig,
  onHoverComponent,
  className = "",
}) => {
  const allComponentsList = getVehicleAssemblyComponents(vehicleConfig);

  const getPartState = (id: VehicleComponentId) => {
    const isInstalled = installedComponents.includes(id);
    const isActive = activeComponentId === id;
    const isHovered = hoveredComponentId === id;
    const meta = allComponentsList.find((c) => c.id === id);

    let offsetX = 0;
    let offsetY = 0;
    let opacity = 1;

    if (!isInstalled && !isActive) {
      if (isExplodedView && meta) {
        offsetX = meta.explodedOffset.x;
        offsetY = meta.explodedOffset.y;
        opacity = 0.25;
      } else {
        opacity = 0.12;
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

  const getEnginePosCoordinates = () => {
    if (enginePosition === "mid") return { x: 480, y: 220 };
    if (enginePosition === "rear") return { x: 710, y: 220 };
    return { x: 240, y: 220 };
  };

  const engineCoords = getEnginePosCoordinates();

  const activeMeta = activeComponentId ? allComponentsList.find((c) => c.id === activeComponentId) : null;
  let spotlightX = activeMeta ? activeMeta.slotPosition.x : 450;
  let spotlightY = activeMeta ? activeMeta.slotPosition.y : 220;

  if (activeComponentId === "engine_bay") {
    spotlightX = engineCoords.x;
    spotlightY = engineCoords.y;
  }

  const chassisState = getPartState("chassis_frame");
  const engineState = getPartState("engine_bay");
  const transState = getPartState("transmission");
  const exhaustState = getPartState("exhaust_system");
  const suspFrontState = getPartState("suspension_front");
  const suspRearState = getPartState("suspension_rear");
  const brakesState = getPartState("brakes");
  const wheelsState = getPartState("wheels_tires");
  const aeroState = getPartState("aero_package");
  const ecuState = getPartState("electronics_ecu");

  return (
    <div className={`relative w-full h-full flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 950 460"
        className="w-full h-full max-h-[560px] overflow-visible filter drop-shadow-[0_30px_70px_rgba(15,23,42,0.95)]"
      >
        {/* Shared Advanced Shader Definitions */}
        <ChassisShaderDefs />

        {/* Blueprint Grid Background */}
        <rect width="950" height="460" fill="url(#cad-grid-sleek)" className="pointer-events-none" />

        {/* CAD Alignment Datum Grid & Wheelbase Dimensioning */}
        <g opacity="0.55" className="font-mono text-[9px] pointer-events-none">
          <line x1="40" y1="345" x2="910" y2="345" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="6 4" />
          <line x1="240" y1="70" x2="240" y2="365" stroke="#38bdf8" strokeWidth="1.0" strokeDasharray="4 4" />
          <line x1="760" y1="70" x2="760" y2="365" stroke="#38bdf8" strokeWidth="1.0" strokeDasharray="4 4" />

          {/* Wheelbase Metric Arrow */}
          <line x1="240" y1="358" x2="760" y2="358" stroke="#38bdf8" strokeWidth="1" />
          <polygon points="240,358 248,355 248,361" fill="#38bdf8" />
          <polygon points="760,358 752,355 752,361" fill="#38bdf8" />
          <text x="500" y="354" fill="#38bdf8" fontSize="9" textAnchor="middle" fontWeight="bold">
            WHEELBASE DATUM: 2850 mm
          </text>
        </g>

        {/* ── 1. DYNAMIC CHASSIS ARCHITECTURE RENDERER (Unibody / Carbon Tub / Spaceframe) ── */}
        <g
          id="chassis_frame"
          onMouseEnter={() => onHoverComponent?.("chassis_frame")}
          onMouseLeave={() => onHoverComponent?.(null)}
          className="cursor-pointer transition-all duration-700 ease-out"
          style={{
            transform: `translate(${chassisState.offsetX}px, ${chassisState.offsetY}px)`,
            opacity: chassisState.opacity,
          }}
        >
          <ChassisArchitectureRenderer
            chassisType={vehicleConfig?.chassis}
            isHovered={chassisState.isHovered}
          />
        </g>

        {/* ── 2-10. 3D ISOMETRIC VEHICLE SUBSYSTEMS & V12 ENGINE BLOCK CASTING ── */}
        <IsoVehicleSubsystems3D
          installedComponents={installedComponents}
          activeComponentId={activeComponentId}
          hoveredComponentId={hoveredComponentId}
          enginePosition={enginePosition}
          driveType={driveType}
          vehicleConfig={vehicleConfig}
          onHoverComponent={onHoverComponent}
        />

        {/* FEA Stress Heatmap Overlay on Hover */}
        <ChassisStressHeatmap isVisible={chassisState.isHovered} />

        {/* ── ASSEMBLY ANIMATION & FX LAYERS ── */}
        <AssemblyLaserGuidance
          activeComponentId={activeComponentId as any}
          phase={phase}
          targetPos={{ x: spotlightX, y: spotlightY }}
        />
        <AssemblyTrajectoryOverlay
          activeComponentId={activeComponentId as any}
          phase={phase}
          targetPos={{ x: spotlightX, y: spotlightY }}
        />
        <AssemblyTorqueHUDOverlay
          activeComponentId={activeComponentId as any}
          phase={phase}
          targetPos={{ x: spotlightX, y: spotlightY }}
          meta={activeMeta as any}
        />
        <AssemblySparkFlashes
          activeComponentId={activeComponentId as any}
          phase={phase}
          targetPos={{ x: spotlightX, y: spotlightY }}
        />
      </svg>
    </div>
  );
};
