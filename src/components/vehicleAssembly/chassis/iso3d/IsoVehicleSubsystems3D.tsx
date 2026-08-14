import React from "react";
import { VehicleComponentId, VehicleAssemblyComponentMeta, getVehicleAssemblyComponents } from "../../../../sim/vehicleAssemblyTypes";
import { EnginePosition, DriveType, VehicleConfig } from "../../../../sim/types";
import { VBankBlockCastingIso } from "../../../assembly/iso3d/VBankBlockCastingIso";
import { projectIso, ScreenPoint2D } from "../../../assembly/iso3d/isoMath";

interface IsoVehicleSubsystems3DProps {
  installedComponents: VehicleComponentId[];
  activeComponentId: VehicleComponentId | null;
  hoveredComponentId: VehicleComponentId | null;
  enginePosition?: EnginePosition;
  driveType?: DriveType;
  vehicleConfig?: Partial<VehicleConfig>;
  onHoverComponent?: (id: VehicleComponentId | null) => void;
}

export const IsoVehicleSubsystems3D: React.FC<IsoVehicleSubsystems3DProps> = ({
  installedComponents,
  activeComponentId,
  hoveredComponentId,
  enginePosition = "front",
  driveType = "rwd",
  vehicleConfig,
  onHoverComponent,
}) => {
  const allComponentsList = getVehicleAssemblyComponents(vehicleConfig);

  const getPartState = (id: VehicleComponentId) => {
    const isInstalled = installedComponents.includes(id);
    const isActive = activeComponentId === id;
    const isHovered = hoveredComponentId === id;
    const meta = allComponentsList.find((c: VehicleAssemblyComponentMeta) => c.id === id);

    let opacity = 1;
    if (!isInstalled && !isActive) {
      opacity = 0.12;
    }

    return {
      isInstalled,
      isActive,
      isHovered,
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

  const engineState = getPartState("engine_bay");
  const transState = getPartState("transmission");
  const exhaustState = getPartState("exhaust_system");
  const suspFrontState = getPartState("suspension_front");
  const suspRearState = getPartState("suspension_rear");
  const brakesState = getPartState("brakes");
  const wheelsState = getPartState("wheels_tires");
  const aeroState = getPartState("aero_package");
  const ecuState = getPartState("electronics_ecu");

  const originScreen: ScreenPoint2D = { x: 450, y: 220 };

  return (
    <g id="iso-3d-vehicle-subsystems-group">
      {/* ── 1. 3D ISOMETRIC ENGINE BLOCK (VBankBlockCastingIso Rendered in Front/Mid/Rear Slot) ── */}
      <g
        id="iso_engine_bay"
        onMouseEnter={() => onHoverComponent?.("engine_bay")}
        onMouseLeave={() => onHoverComponent?.(null)}
        className="cursor-pointer transition-all duration-700 ease-out"
        style={{ opacity: engineState.opacity }}
      >
        <g transform={`translate(${engineCoords.x - 240}, -15) scale(0.65)`}>
          <VBankBlockCastingIso
            layoutSpec={{
              label: "V12 Spec-R Block",
              cyls: [6, 6],
              width: 90,
              bankAngle: "60°",
              bx: 250,
              bw: 120,
              bh: 90,
              category: "V-Engine",
            }}
            blockState={{
              isInstalled: engineState.isInstalled,
              isActive: engineState.isActive,
              isHovered: engineState.isHovered,
              opacity: 1,
              offsetX: 0,
              offsetY: 0,
            }}
          />
        </g>
      </g>

      {/* ── 2. 3D TRANSMISSION & DRIVETRAIN ── */}
      <g
        id="iso_transmission"
        onMouseEnter={() => onHoverComponent?.("transmission")}
        onMouseLeave={() => onHoverComponent?.(null)}
        className="cursor-pointer transition-all duration-700 ease-out"
        style={{ opacity: transState.opacity }}
      >
        {/* 3D Gearbox Bellhousing */}
        <path d="M 300 210 L 360 215 L 360 265 L 300 260 Z" fill="#334155" stroke={transState.isHovered ? "#38bdf8" : "#64748b"} strokeWidth="2" />

        {(driveType === "rwd" || driveType === "awd") && (
          <g>
            <line x1="360" y1="250" x2="710" y2="275" stroke="#10b981" strokeWidth="4.5" strokeDasharray="6 3" />
            <circle cx="710" cy="275" r="16" fill="#0f172a" stroke="#10b981" strokeWidth="2.5" />
          </g>
        )}
      </g>

      {/* ── 3. 3D EXHAUST SYSTEM ── */}
      <g
        id="iso_exhaust_system"
        onMouseEnter={() => onHoverComponent?.("exhaust_system")}
        onMouseLeave={() => onHoverComponent?.(null)}
        className="cursor-pointer transition-all duration-700 ease-out"
        style={{ opacity: exhaustState.opacity }}
      >
        <path d="M 280 250 L 320 290 L 540 290 Q 680 290 790 280 L 870 280" fill="none" stroke="#ef4444" strokeWidth="4.5" strokeLinecap="round" />
        <rect x="390" y="283" width="45" height="14" rx="4" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
        <rect x="760" y="272" width="55" height="20" rx="4" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
      </g>

      {/* ── 4. 3D FRONT SUSPENSION ── */}
      <g
        id="iso_suspension_front"
        onMouseEnter={() => onHoverComponent?.("suspension_front")}
        onMouseLeave={() => onHoverComponent?.(null)}
        className="cursor-pointer transition-all duration-700 ease-out"
        style={{ opacity: suspFrontState.opacity }}
      >
        <line x1="230" y1="210" x2="230" y2="280" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
        <path d="M 223 220 L 237 225 L 223 235 L 237 245 L 223 255 L 237 265" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
      </g>

      {/* ── 5. 3D REAR SUSPENSION ── */}
      <g
        id="iso_suspension_rear"
        onMouseEnter={() => onHoverComponent?.("suspension_rear")}
        onMouseLeave={() => onHoverComponent?.(null)}
        className="cursor-pointer transition-all duration-700 ease-out"
        style={{ opacity: suspRearState.opacity }}
      >
        <line x1="710" y1="210" x2="710" y2="280" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
        <path d="M 703 220 L 717 225 L 703 235 L 717 245 L 703 255 L 717 265" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
      </g>

      {/* ── 6. 3D BRAKES ── */}
      <g
        id="iso_brakes"
        onMouseEnter={() => onHoverComponent?.("brakes")}
        onMouseLeave={() => onHoverComponent?.(null)}
        className="cursor-pointer transition-all duration-700 ease-out"
        style={{ opacity: brakesState.opacity }}
      >
        <ellipse cx="230" cy="280" rx="34" ry="24" fill="url(#iso-strut-dome-3d)" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="198" y="258" width="18" height="34" rx="4" fill="#f43f5e" stroke="#fff" strokeWidth="1" />

        <ellipse cx="710" cy="280" rx="32" ry="22" fill="url(#iso-strut-dome-3d)" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="682" y="260" width="16" height="32" rx="4" fill="#f43f5e" stroke="#fff" strokeWidth="1" />
      </g>

      {/* ── 7. 3D WHEELS & TIRES ── */}
      <g
        id="iso_wheels_tires"
        onMouseEnter={() => onHoverComponent?.("wheels_tires")}
        onMouseLeave={() => onHoverComponent?.(null)}
        className="cursor-pointer transition-all duration-700 ease-out"
        style={{ opacity: wheelsState.opacity }}
      >
        <ellipse cx="230" cy="280" rx="58" ry="42" fill="none" stroke="#020617" strokeWidth="18" />
        <ellipse cx="230" cy="280" rx="48" ry="34" fill="none" stroke="#e2e8f0" strokeWidth="3" />
        <path d="M 230 238 L 230 322 M 182 280 L 278 280" stroke="#cbd5e1" strokeWidth="2.5" />

        <ellipse cx="710" cy="280" rx="58" ry="42" fill="none" stroke="#020617" strokeWidth="18" />
        <ellipse cx="710" cy="280" rx="48" ry="34" fill="none" stroke="#e2e8f0" strokeWidth="3" />
        <path d="M 710 238 L 710 322 M 662 280 L 758 280" stroke="#cbd5e1" strokeWidth="2.5" />
      </g>

      {/* ── 8. 3D AERODYNAMIC PACKAGE ── */}
      <g
        id="iso_aero_package"
        onMouseEnter={() => onHoverComponent?.("aero_package")}
        onMouseLeave={() => onHoverComponent?.(null)}
        className="cursor-pointer transition-all duration-700 ease-out"
        style={{ opacity: aeroState.opacity }}
      >
        <path d="M 65 270 L 150 270 L 150 282 L 65 276 Z" fill="url(#iso-carbon-twill-3d)" stroke="#10b981" strokeWidth="1.5" />
        <path d="M 760 110 Q 800 100 860 115 L 855 125 Q 800 110 760 120 Z" fill="url(#iso-carbon-twill-3d)" stroke="#10b981" strokeWidth="2" />
        <line x1="780" y1="120" x2="800" y2="200" stroke="#10b981" strokeWidth="3" />
        <line x1="830" y1="120" x2="840" y2="205" stroke="#10b981" strokeWidth="3" />
      </g>

      {/* ── 9. 3D ELECTRONICS & ECU ── */}
      <g
        id="iso_electronics_ecu"
        onMouseEnter={() => onHoverComponent?.("electronics_ecu")}
        onMouseLeave={() => onHoverComponent?.(null)}
        className="cursor-pointer transition-all duration-700 ease-out"
        style={{ opacity: ecuState.opacity }}
      >
        <rect x="400" y="180" width="32" height="22" rx="3" fill="#0f172a" stroke="#a855f7" strokeWidth="2" className="animate-pulse" />
        <path d="M 400 190 L 260 200 M 415 202 L 480 250 M 432 190 L 700 250" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4 2" />
      </g>
    </g>
  );
};
