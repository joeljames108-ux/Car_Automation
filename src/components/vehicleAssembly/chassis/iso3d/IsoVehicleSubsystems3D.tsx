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

  // Standard CAD Chassis Datum: Rear Axle X=240, Front Axle X=760, Wheelbase=520px
  const getEnginePosCoordinates = () => {
    if (enginePosition === "mid") return { x: 470, y: 220 };
    if (enginePosition === "rear") return { x: 230, y: 220 };
    return { x: 740, y: 220 }; // Front Engine Bay
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

  // Dynamic Transmission Bellhousing Anchor (Attached rearward of engine)
  const transBellX = enginePosition === "rear" ? 280 : enginePosition === "mid" ? 410 : 670;
  const transEndX = enginePosition === "rear" ? 330 : enginePosition === "mid" ? 350 : 590;

  const weightBiasLabel =
    enginePosition === "mid"
      ? "MID-ENGINE LAYOUT // 42:58 WEIGHT BIAS"
      : enginePosition === "rear"
      ? "REAR-ENGINE LAYOUT // 38:62 WEIGHT BIAS"
      : "FRONT-ENGINE LAYOUT // 54:46 WEIGHT BIAS";

  const isEV = false;

  return (
    <g id="iso-3d-vehicle-subsystems-group">
      {/* ── ENGINE BAY CHASSIS MOUNT ANCHORS & WEIGHT DISTRIBUTION BADGE ── */}
      {!isEV && (
        <g opacity="0.9" className="font-mono text-[9px] pointer-events-none">
          {/* Heavy-Duty Rubber Isolator Engine Mount Bushings */}
          <rect x={engineCoords.x - 36} y="246" width="16" height="12" rx="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx={engineCoords.x - 28} cy="252" r="3" fill="#f59e0b" stroke="#0f172a" strokeWidth="1" />

          <rect x={engineCoords.x + 20} y="246" width="16" height="12" rx="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx={engineCoords.x + 28} cy="252" r="3" fill="#f59e0b" stroke="#0f172a" strokeWidth="1" />

          {/* Structural Subframe Crossmember Engine Bed */}
          <rect x={engineCoords.x - 48} y="258" width="96" height="8" rx="2" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1={engineCoords.x - 42} y1="262" x2={engineCoords.x + 42} y2="262" stroke="#94a3b8" strokeWidth="1" />

          {/* Engine Placement & Weight Distribution HUD Tag */}
          <text x={engineCoords.x} y="95" fill="#38bdf8" fontSize="8" textAnchor="middle" fontWeight="bold" letterSpacing="0.5">
            {weightBiasLabel}
          </text>
          <line x1={engineCoords.x - 35} y1="100" x2={engineCoords.x + 35} y2="100" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
        </g>
      )}

      {/* ── 1. ENGINE BLOCK (Or Skateboard Battery for EV) ── */}
      <g
        id="iso_engine_bay"
        onMouseEnter={() => onHoverComponent?.("engine_bay")}
        onMouseLeave={() => onHoverComponent?.(null)}
        className="cursor-pointer transition-all duration-700 ease-out"
        style={{ opacity: engineState.opacity }}
      >
        {isEV ? (
          /* High-Voltage Skateboard Battery Enclosure between Axles (X=330 to X=670) */
          <g>
            <rect x="330" y="282" width="340" height="24" rx="4" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
            <line x1="335" y1="294" x2="665" y2="294" stroke="#059669" strokeWidth="1.5" strokeDasharray="6 4" />
            {Array.from({ length: 8 }).map((_, i) => (
              <rect key={i} x={345 + i * 40} y="286" width="28" height="16" rx="2" fill="#1e293b" stroke="#34d399" strokeWidth="1" />
            ))}
            <text x="500" y="298" fill="#34d399" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              800V SOLID-STATE SKATEBOARD BATTERY PACK
            </text>
          </g>
        ) : (
          <g transform={`translate(${engineCoords.x - 110}, 135) scale(0.50)`}>
            <VBankLayoutRenderer
              layoutSpec={{
                label: "V12 SPEC-R BILLET ENGINE BLOCK",
                cyls: [180, 220, 260, 300, 340, 380],
                width: 30,
                bankAngle: "60° V-Angle",
                bx: 140,
                bw: 260,
                bh: 210,
                category: "V-Engine",
                bolts: [
                  { x: 155, y: 120 }, { x: 385, y: 120 },
                  { x: 155, y: 300 }, { x: 385, y: 300 },
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
        )}
      </g>

      {/* ── 2. DYNAMIC TRANSMISSION & DRIVETRAIN ALIGNMENT ── */}
      {!isEV && (
        <g
          id="iso_transmission"
          onMouseEnter={() => onHoverComponent?.("transmission")}
          onMouseLeave={() => onHoverComponent?.(null)}
          className="cursor-pointer transition-all duration-700 ease-out"
          style={{ opacity: transState.opacity }}
        >
          {/* Gearbox Bellhousing */}
          <path
            d={`M ${transBellX} 220 L ${transEndX} 225 L ${transEndX} 265 L ${transBellX} 260 Z`}
            fill="url(#al-brushed-metallic)"
            stroke={transState.isHovered ? "#38bdf8" : "#475569"}
            strokeWidth="2"
          />
          <line x1={transBellX - 10} y1="223" x2={transBellX - 10} y2="258" stroke="#94a3b8" strokeWidth="1" />
          <line x1={transBellX - 25} y1="226" x2={transBellX - 25} y2="260" stroke="#94a3b8" strokeWidth="1" />

          {/* Drivetrain Driveshaft & Rear Differential at X=240 */}
          {(driveType === "rwd" || driveType === "awd") && (
            <g>
              <line x1={transEndX} y1="250" x2="240" y2="275" stroke="#10b981" strokeWidth="4" />
              <circle cx="240" cy="275" r="16" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
              <circle cx="240" cy="275" r="9" fill="#334155" stroke="#64748b" strokeWidth="1" />
            </g>
          )}

          {/* Front Driveshaft & Front Differential at X=760 */}
          {(driveType === "fwd" || driveType === "awd") && (
            <g>
              <line x1={transBellX} y1="245" x2="760" y2="275" stroke="#a855f7" strokeWidth="4" />
              <circle cx="760" cy="275" r="16" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
              <circle cx="760" cy="275" r="9" fill="#334155" stroke="#64748b" strokeWidth="1" />
            </g>
          )}
        </g>
      )}

      {/* ── 3. DYNAMIC EXHAUST SYSTEM (Runs rearward to Left Bumper at X=70) ── */}
      {!isEV && (
        <g
          id="iso_exhaust_system"
          onMouseEnter={() => onHoverComponent?.("exhaust_system")}
          onMouseLeave={() => onHoverComponent?.(null)}
          className="cursor-pointer transition-all duration-700 ease-out"
          style={{ opacity: exhaustState.opacity }}
        >
          {/* Exhaust Header originating from Engine, running leftward to rear */}
          <path
            d={`M ${engineCoords.x - 20} 250 L ${Math.max(180, engineCoords.x - 80)} 286 L 180 286 Q 120 286 75 280`}
            fill="none"
            stroke="url(#titanium-weld-tint)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Catalytic Converter & Resonator */}
          <rect x="520" y="279" width="45" height="14" rx="4" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
          <rect x="360" y="279" width="50" height="14" rx="4" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
          {/* Rear Muffler Box */}
          <rect x="130" y="272" width="55" height="20" rx="4" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
          
          {/* Dual Stainless Muffler Exhaust Tips at Rear Bumper (Left X=70) */}
          <circle cx="72" cy="276" r="4.5" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.5" />
          <circle cx="72" cy="284" r="4.5" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.5" />
        </g>
      )}

      {/* ── 4. 3D FRONT SUSPENSION (Mounted at Front Axle X=760) ── */}
      <g
        id="iso_suspension_front"
        onMouseEnter={() => onHoverComponent?.("suspension_front")}
        onMouseLeave={() => onHoverComponent?.(null)}
        className="cursor-pointer transition-all duration-700 ease-out"
        style={{ opacity: suspFrontState.opacity }}
      >
        {/* Chrome Damper Shaft & Blue Anodized Body */}
        <line x1="760" y1="205" x2="760" y2="280" stroke="#0284c7" strokeWidth="7" strokeLinecap="round" />
        <line x1="760" y1="205" x2="760" y2="245" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
        {/* Metallic Gold Coil Spring Turns */}
        <path d="M 751 215 L 769 220 L 751 230 L 769 240 L 751 250 L 769 260 M 751 260 L 769 270" fill="none" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
        {/* Double Wishbone Forged Control Arms */}
        <path d="M 725 275 L 760 280 L 795 275" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* ── 5. 3D REAR SUSPENSION (Mounted at Rear Axle X=240) ── */}
      <g
        id="iso_suspension_rear"
        onMouseEnter={() => onHoverComponent?.("suspension_rear")}
        onMouseLeave={() => onHoverComponent?.(null)}
        className="cursor-pointer transition-all duration-700 ease-out"
        style={{ opacity: suspRearState.opacity }}
      >
        <line x1="240" y1="205" x2="240" y2="280" stroke="#0284c7" strokeWidth="7" strokeLinecap="round" />
        <line x1="240" y1="205" x2="240" y2="245" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
        <path d="M 231 215 L 249 220 L 231 230 L 249 240 L 231 250 L 249 260 M 231 260 L 249 270" fill="none" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 205 275 L 240 280 L 275 275" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* ── 6. 3D BRAKES (Cross-Drilled Rotors + Red Monobloc Calipers) ── */}
      <g
        id="iso_brakes"
        onMouseEnter={() => onHoverComponent?.("brakes")}
        onMouseLeave={() => onHoverComponent?.(null)}
        className="cursor-pointer transition-all duration-700 ease-out"
        style={{ opacity: brakesState.opacity }}
      >
        {/* Front Brake Rotor (At X=760) */}
        <ellipse cx="760" cy="280" rx="36" ry="26" fill="url(#brake-rotor-ring-hdr)" stroke="#cbd5e1" strokeWidth="2.5" />
        <ellipse cx="760" cy="280" rx="14" ry="10" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
        <circle cx="748" cy="272" r="1.2" fill="#020617" />
        <circle cx="772" cy="272" r="1.2" fill="#020617" />
        <circle cx="748" cy="288" r="1.2" fill="#020617" />
        <circle cx="772" cy="288" r="1.2" fill="#020617" />
        <rect x="724" y="256" width="20" height="38" rx="5" fill="url(#caliper-brembo-red)" stroke="#ffffff" strokeWidth="1.2" />
        <circle cx="734" cy="265" r="2" fill="#ffffff" />
        <circle cx="734" cy="285" r="2" fill="#ffffff" />

        {/* Rear Brake Rotor (At X=240) */}
        <ellipse cx="240" cy="280" rx="34" ry="24" fill="url(#brake-rotor-ring-hdr)" stroke="#cbd5e1" strokeWidth="2.5" />
        <ellipse cx="240" cy="280" rx="13" ry="9" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
        <circle cx="228" cy="273" r="1.2" fill="#020617" />
        <circle cx="252" cy="273" r="1.2" fill="#020617" />
        <circle cx="228" cy="287" r="1.2" fill="#020617" />
        <circle cx="252" cy="287" r="1.2" fill="#020617" />
        <rect x="208" y="258" width="18" height="34" rx="5" fill="url(#caliper-brembo-red)" stroke="#ffffff" strokeWidth="1.2" />
        <circle cx="217" cy="267" r="2" fill="#ffffff" />
        <circle cx="217" cy="283" r="2" fill="#ffffff" />
      </g>

      {/* ── 7. 3D WHEELS & TIRES (Forged Alloy Rims + Low Profile Tires) ── */}
      <g
        id="iso_wheels_tires"
        onMouseEnter={() => onHoverComponent?.("wheels_tires")}
        onMouseLeave={() => onHoverComponent?.(null)}
        className="cursor-pointer transition-all duration-700 ease-out"
        style={{ opacity: wheelsState.opacity }}
      >
        {/* Front Wheel (At X=760) */}
        <ellipse cx="760" cy="280" rx="58" ry="43" fill="none" stroke="url(#tire-rubber-sidewall-hd)" strokeWidth="15" />
        <ellipse cx="760" cy="280" rx="47" ry="34" fill="none" stroke="url(#rim-alloy-chrome-hdr)" strokeWidth="3" />
        <g stroke="url(#rim-alloy-chrome-hdr)" strokeWidth="3.5" strokeLinecap="round">
          <line x1="760" y1="280" x2="760" y2="245" />
          <line x1="760" y1="280" x2="795" y2="265" />
          <line x1="760" y1="280" x2="780" y2="310" />
          <line x1="760" y1="280" x2="740" y2="310" />
          <line x1="760" y1="280" x2="725" y2="265" />
        </g>
        <circle cx="760" cy="280" r="7" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
        <circle cx="757" cy="277" r="1.2" fill="#f8fafc" />
        <circle cx="763" cy="277" r="1.2" fill="#f8fafc" />
        <circle cx="760" cy="283" r="1.2" fill="#f8fafc" />

        {/* Rear Wheel (At X=240) */}
        <ellipse cx="240" cy="280" rx="58" ry="43" fill="none" stroke="url(#tire-rubber-sidewall-hd)" strokeWidth="15" />
        <ellipse cx="240" cy="280" rx="47" ry="34" fill="none" stroke="url(#rim-alloy-chrome-hdr)" strokeWidth="3" />
        <g stroke="url(#rim-alloy-chrome-hdr)" strokeWidth="3.5" strokeLinecap="round">
          <line x1="240" y1="280" x2="240" y2="245" />
          <line x1="240" y1="280" x2="275" y2="265" />
          <line x1="240" y1="280" x2="260" y2="310" />
          <line x1="240" y1="280" x2="220" y2="310" />
          <line x1="240" y1="280" x2="205" y2="265" />
        </g>
        <circle cx="240" cy="280" r="7" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
        <circle cx="237" cy="277" r="1.2" fill="#f8fafc" />
        <circle cx="243" cy="277" r="1.2" fill="#f8fafc" />
        <circle cx="240" cy="283" r="1.2" fill="#f8fafc" />
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
