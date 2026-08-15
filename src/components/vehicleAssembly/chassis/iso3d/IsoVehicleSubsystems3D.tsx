import React from "react";
import { VehicleComponentId, VehicleAssemblyComponentMeta, getVehicleAssemblyComponents } from "../../../../sim/vehicleAssemblyTypes";
import { EnginePosition, DriveType, VehicleConfig } from "../../../../sim/types";
import { VBankLayoutRenderer } from "../../../assembly/layoutRenderers/VBankLayoutRenderer";

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
      opacity = 0.15;
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

  // Dynamic Transmission Bellhousing Anchor & Drivetrain Offset
  const transBellX = Math.min(780, engineCoords.x + 50);
  const transEndX = Math.min(840, transBellX + 60);

  const weightBiasLabel =
    enginePosition === "mid"
      ? "MID-ENGINE LAYOUT // 42:58 WEIGHT BIAS"
      : enginePosition === "rear"
      ? "REAR-ENGINE LAYOUT // 38:62 WEIGHT BIAS"
      : "FRONT-ENGINE LAYOUT // 54:46 WEIGHT BIAS";

  return (
    <g id="iso-3d-vehicle-subsystems-group">
      {/* ── ENGINE BAY CHASSIS MOUNT ANCHORS & WEIGHT DISTRIBUTION BADGE ── */}
      <g opacity="0.9" className="font-mono text-[9px] pointer-events-none">
        {/* Heavy-Duty Rubber Isolator Engine Mount Bushings */}
        <rect x={engineCoords.x - 42} y="246" width="18" height="14" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
        <circle cx={engineCoords.x - 33} cy="253" r="3.5" fill="#f59e0b" stroke="#0f172a" strokeWidth="1" />

        <rect x={engineCoords.x + 24} y="246" width="18" height="14" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
        <circle cx={engineCoords.x + 33} cy="253" r="3.5" fill="#f59e0b" stroke="#0f172a" strokeWidth="1" />

        {/* Structural Subframe Crossmember Engine Bed */}
        <rect x={engineCoords.x - 55} y="258" width="110" height="10" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.8" />
        <line x1={engineCoords.x - 50} y1="263" x2={engineCoords.x + 50} y2="263" stroke="#94a3b8" strokeWidth="1" />

        {/* Engine Placement & Weight Distribution HUD Tag */}
        <text x={engineCoords.x} y="105" fill="#38bdf8" fontSize="8" textAnchor="middle" fontWeight="bold" letterSpacing="0.5">
          {weightBiasLabel}
        </text>
        <line x1={engineCoords.x - 40} y1="110" x2={engineCoords.x + 40} y2="110" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
      </g>

      {/* ── 1. 2D MODE ENGINE BLOCK IN ENGINE BAY (Seated on Chassis Bed Y = 258) ── */}
      <g
        id="iso_engine_bay"
        onMouseEnter={() => onHoverComponent?.("engine_bay")}
        onMouseLeave={() => onHoverComponent?.(null)}
        className="cursor-pointer transition-all duration-700 ease-out"
        style={{ opacity: engineState.opacity }}
      >
        <g transform={`translate(${engineCoords.x - 125}, 128) scale(0.55)`}>
          <VBankLayoutRenderer
            layoutSpec={{
              label: "V12 SPEC-R BILLET ENGINE BLOCK",
              cyls: [180, 220, 260, 300, 340, 380],
              width: 32,
              bankAngle: "60° V-Angle",
              bx: 140,
              bw: 280,
              bh: 230,
              category: "V-Engine",
              bolts: [
                { x: 155, y: 120 }, { x: 405, y: 120 },
                { x: 155, y: 320 }, { x: 405, y: 320 },
              ],
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

      {/* ── 2. DYNAMIC TRANSMISSION & DRIVETRAIN ALIGNMENT ── */}
      <g
        id="iso_transmission"
        onMouseEnter={() => onHoverComponent?.("transmission")}
        onMouseLeave={() => onHoverComponent?.(null)}
        className="cursor-pointer transition-all duration-700 ease-out"
        style={{ opacity: transState.opacity }}
      >
        {/* Gearbox Bellhousing (Dynamically moves with Engine Position) */}
        <path
          d={`M ${transBellX} 210 L ${transEndX} 215 L ${transEndX} 265 L ${transBellX} 260 Z`}
          fill="url(#al-brushed-metallic)"
          stroke={transState.isHovered ? "#38bdf8" : "#475569"}
          strokeWidth="2"
        />
        <line x1={transBellX + 10} y1="215" x2={transBellX + 10} y2="258" stroke="#94a3b8" strokeWidth="1" />
        <line x1={transBellX + 25} y1="216" x2={transBellX + 25} y2="260" stroke="#94a3b8" strokeWidth="1" />
        <line x1={transBellX + 40} y1="217" x2={transBellX + 40} y2="262" stroke="#94a3b8" strokeWidth="1" />

        {/* Drivetrain Driveshaft & Differentials Routing based on DriveType and EnginePosition */}
        {(driveType === "rwd" || driveType === "awd") && (
          <g>
            {/* Rear Driveshaft */}
            <line x1={transEndX} y1="250" x2="710" y2="275" stroke="#10b981" strokeWidth="4" />
            <circle cx="710" cy="275" r="16" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
            <circle cx="710" cy="275" r="9" fill="#334155" stroke="#64748b" strokeWidth="1" />
          </g>
        )}

        {(driveType === "fwd" || driveType === "awd") && (
          <g>
            {/* Front Driveshaft */}
            <line x1={transBellX} y1="245" x2="230" y2="275" stroke="#a855f7" strokeWidth="4" />
            <circle cx="230" cy="275" r="16" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
            <circle cx="230" cy="275" r="9" fill="#334155" stroke="#64748b" strokeWidth="1" />
          </g>
        )}
      </g>

      {/* ── 3. DYNAMIC EXHAUST SYSTEM ROUTING ── */}
      <g
        id="iso_exhaust_system"
        onMouseEnter={() => onHoverComponent?.("exhaust_system")}
        onMouseLeave={() => onHoverComponent?.(null)}
        className="cursor-pointer transition-all duration-700 ease-out"
        style={{ opacity: exhaustState.opacity }}
      >
        {/* Exhaust Header originating from Engine Position */}
        <path
          d={`M ${engineCoords.x + 30} 250 L ${Math.min(760, engineCoords.x + 80)} 288 L 760 288 Q 800 288 870 280`}
          fill="none"
          stroke="url(#titanium-weld-tint)"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        <rect x={Math.min(700, engineCoords.x + 120)} y="281" width="45" height="15" rx="4" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
        <rect x="760" y="270" width="58" height="22" rx="4" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
        
        {/* Dual Stainless Muffler Exhaust Tips */}
        <circle cx="875" cy="276" r="4.5" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.5" />
        <circle cx="875" cy="284" r="4.5" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.5" />
      </g>

      {/* ── 4. 3D FRONT SUSPENSION ── */}
      <g
        id="iso_suspension_front"
        onMouseEnter={() => onHoverComponent?.("suspension_front")}
        onMouseLeave={() => onHoverComponent?.(null)}
        className="cursor-pointer transition-all duration-700 ease-out"
        style={{ opacity: suspFrontState.opacity }}
      >
        {/* Chrome Damper Shaft & Blue Anodized Body */}
        <line x1="230" y1="205" x2="230" y2="280" stroke="#0284c7" strokeWidth="7" strokeLinecap="round" />
        <line x1="230" y1="205" x2="230" y2="245" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
        {/* Metallic Gold Coil Spring Turns */}
        <path d="M 221 215 L 239 220 L 221 230 L 239 240 L 221 250 L 239 260 M 221 260 L 239 270" fill="none" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
        {/* Double Wishbone Forged Control Arms */}
        <path d="M 195 275 L 230 280 L 265 275" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* ── 5. 3D REAR SUSPENSION ── */}
      <g
        id="iso_suspension_rear"
        onMouseEnter={() => onHoverComponent?.("suspension_rear")}
        onMouseLeave={() => onHoverComponent?.(null)}
        className="cursor-pointer transition-all duration-700 ease-out"
        style={{ opacity: suspRearState.opacity }}
      >
        <line x1="710" y1="205" x2="710" y2="280" stroke="#0284c7" strokeWidth="7" strokeLinecap="round" />
        <line x1="710" y1="205" x2="710" y2="245" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
        <path d="M 701 215 L 719 220 L 701 230 L 719 240 L 701 250 L 719 260 M 701 260 L 719 270" fill="none" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 675 275 L 710 280 L 745 275" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* ── 6. 3D BRAKES (Cross-Drilled Steel Discs + Brembo Red Calipers) ── */}
      <g
        id="iso_brakes"
        onMouseEnter={() => onHoverComponent?.("brakes")}
        onMouseLeave={() => onHoverComponent?.(null)}
        className="cursor-pointer transition-all duration-700 ease-out"
        style={{ opacity: brakesState.opacity }}
      >
        {/* Front Brake Rotor */}
        <ellipse cx="230" cy="280" rx="36" ry="26" fill="url(#brake-rotor-ring-hdr)" stroke="#cbd5e1" strokeWidth="2.5" />
        <ellipse cx="230" cy="280" rx="14" ry="10" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
        {/* Cross-Drilled Rotor Holes */}
        <circle cx="218" cy="272" r="1.2" fill="#020617" />
        <circle cx="242" cy="272" r="1.2" fill="#020617" />
        <circle cx="218" cy="288" r="1.2" fill="#020617" />
        <circle cx="242" cy="288" r="1.2" fill="#020617" />
        {/* Brembo Red Caliper */}
        <rect x="194" y="256" width="20" height="38" rx="5" fill="url(#caliper-brembo-red)" stroke="#ffffff" strokeWidth="1.2" />
        <circle cx="204" cy="265" r="2" fill="#ffffff" />
        <circle cx="204" cy="285" r="2" fill="#ffffff" />

        {/* Rear Brake Rotor */}
        <ellipse cx="710" cy="280" rx="34" ry="24" fill="url(#brake-rotor-ring-hdr)" stroke="#cbd5e1" strokeWidth="2.5" />
        <ellipse cx="710" cy="280" rx="13" ry="9" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
        <circle cx="698" cy="273" r="1.2" fill="#020617" />
        <circle cx="722" cy="273" r="1.2" fill="#020617" />
        <circle cx="698" cy="287" r="1.2" fill="#020617" />
        <circle cx="722" cy="287" r="1.2" fill="#020617" />
        <rect x="678" y="258" width="18" height="34" rx="5" fill="url(#caliper-brembo-red)" stroke="#ffffff" strokeWidth="1.2" />
        <circle cx="687" cy="267" r="2" fill="#ffffff" />
        <circle cx="687" cy="283" r="2" fill="#ffffff" />
      </g>

      {/* ── 7. 3D WHEELS & TYRES (5-Spoke Alloy Rims + Radial Rubber Tyres) ── */}
      <g
        id="iso_wheels_tires"
        onMouseEnter={() => onHoverComponent?.("wheels_tires")}
        onMouseLeave={() => onHoverComponent?.(null)}
        className="cursor-pointer transition-all duration-700 ease-out"
        style={{ opacity: wheelsState.opacity }}
      >
        {/* Front Wheel */}
        <ellipse cx="230" cy="280" rx="60" ry="44" fill="none" stroke="url(#tire-rubber-sidewall-hd)" strokeWidth="16" />
        <ellipse cx="230" cy="280" rx="49" ry="35" fill="none" stroke="url(#rim-alloy-chrome-hdr)" strokeWidth="3" />
        {/* 5-Spoke Alloy Geometry */}
        <g stroke="url(#rim-alloy-chrome-hdr)" strokeWidth="3.5" strokeLinecap="round">
          <line x1="230" y1="280" x2="230" y2="245" />
          <line x1="230" y1="280" x2="265" y2="265" />
          <line x1="230" y1="280" x2="250" y2="310" />
          <line x1="230" y1="280" x2="210" y2="310" />
          <line x1="230" y1="280" x2="195" y2="265" />
        </g>
        <circle cx="230" cy="280" r="7" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
        {/* Lug Nuts */}
        <circle cx="227" cy="277" r="1.2" fill="#f8fafc" />
        <circle cx="233" cy="277" r="1.2" fill="#f8fafc" />
        <circle cx="230" cy="283" r="1.2" fill="#f8fafc" />

        {/* Rear Wheel */}
        <ellipse cx="710" cy="280" rx="60" ry="44" fill="none" stroke="url(#tire-rubber-sidewall-hd)" strokeWidth="16" />
        <ellipse cx="710" cy="280" rx="49" ry="35" fill="none" stroke="url(#rim-alloy-chrome-hdr)" strokeWidth="3" />
        <g stroke="url(#rim-alloy-chrome-hdr)" strokeWidth="3.5" strokeLinecap="round">
          <line x1="710" y1="280" x2="710" y2="245" />
          <line x1="710" y1="280" x2="745" y2="265" />
          <line x1="710" y1="280" x2="730" y2="310" />
          <line x1="710" y1="280" x2="690" y2="310" />
          <line x1="710" y1="280" x2="675" y2="265" />
        </g>
        <circle cx="710" cy="280" r="7" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
        <circle cx="707" cy="277" r="1.2" fill="#f8fafc" />
        <circle cx="713" cy="277" r="1.2" fill="#f8fafc" />
        <circle cx="710" cy="283" r="1.2" fill="#f8fafc" />
      </g>

      {/* ── 8. 3D AERODYNAMIC PACKAGE ── */}
      <g
        id="iso_aero_package"
        onMouseEnter={() => onHoverComponent?.("aero_package")}
        onMouseLeave={() => onHoverComponent?.(null)}
        className="cursor-pointer transition-all duration-700 ease-out"
        style={{ opacity: aeroState.opacity }}
      >
        <path d="M 65 270 L 150 270 L 150 282 L 65 276 Z" fill="url(#carbon-twill-2x2)" stroke="#10b981" strokeWidth="1.8" />
        <path d="M 760 110 Q 800 100 860 115 L 855 125 Q 800 110 760 120 Z" fill="url(#carbon-twill-2x2)" stroke="#10b981" strokeWidth="2" />
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
        <rect x="400" y="180" width="34" height="24" rx="4" fill="#0f172a" stroke="#a855f7" strokeWidth="2.2" className="animate-pulse" />
        <path d="M 400 190 L 260 200 M 415 204 L 480 250 M 434 190 L 700 250" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="5 2" />
      </g>
    </g>
  );
};
