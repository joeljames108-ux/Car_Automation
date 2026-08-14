import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso } from "./isoMath";

interface TurbochargerIsoProps {
  layoutSpec: {
    label: string;
    cyls: number[];
    width: number;
    bx: number;
    bw: number;
    bh: number;
    category?: string;
  };
  componentState: {
    isInstalled: boolean;
    isActive: boolean;
    opacity: number;
    offsetX: number;
    offsetY: number;
  };
  isAssemblyComplete?: boolean;
  selectedVariants?: Record<string, string>;
  onHoverComponent?: (id: ComponentId | null) => void;
}

/**
 * Photorealistic 3D Isometric Twin-Scroll Turbocharger & Wastegate Assembly Renderer
 * Perfectly aligned for V12 / V8 / Inline High-Performance Engines:
 * - Cold-side CNC billet aluminum compressor volute snail scroll housing
 * - 10-Blade golden billet CNC impeller wheel with high-RPM spin animation
 * - Hot-side cast iron heat-treated turbine scroll & exhaust flange
 * - Stainless steel downpipe with V-band coupling flange clamps
 * - Pneumatic internal wastegate actuator cylinder, stainless rod & arm
 * - 4-ply blue silicone intercooler piping coupler & T-bolt clamps
 */
export const TurbochargerIso: React.FC<TurbochargerIsoProps> = ({
  layoutSpec,
  componentState,
  isAssemblyComplete,
  selectedVariants,
  onHoverComponent,
}) => {
  const originScreen = { x: 250, y: 215 };
  const blockW = 230;

  // Primary Turbocharger Center (located at front-right side of engine: X = +95, Y = -65, Z = 110)
  const turboCenter3D = { x: blockW / 2 - 20, y: -65, z: 110 };
  const tPt = projectIso(turboCenter3D, originScreen);

  // Turbine Scroll (Hot side: X = +80, Y = -72, Z = 95)
  const turbinePt = projectIso({ x: blockW / 2 - 35, y: -72, z: 95 }, originScreen);

  // Downpipe exit (X = +60, Y = -80, Z = 40)
  const dpStart = projectIso({ x: blockW / 2 - 35, y: -72, z: 80 }, originScreen);
  const dpEnd = projectIso({ x: blockW / 2 - 55, y: -85, z: 35 }, originScreen);

  // Wastegate Actuator (X = +105, Y = -50, Z = 135)
  const wgPt = projectIso({ x: blockW / 2, y: -50, z: 135 }, originScreen);

  return (
    <g
      id="iso-turbocharger-assembly-3d"
      onMouseEnter={() => onHoverComponent?.("turbocharger")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
    >
      {/* ── 1. STAINLESS STEEL DOWNPIPE LOOP & V-BAND CLAMPS ── */}
      <g id="turbo-downpipe">
        {/* Stainless Steel Curved Downpipe */}
        <path
          d={`M ${dpStart.x} ${dpStart.y} C ${dpStart.x - 10} ${dpStart.y + 35} ${dpEnd.x + 20} ${dpEnd.y - 15} ${dpEnd.x} ${dpEnd.y}`}
          fill="none"
          stroke="url(#stainless-downpipe)"
          strokeWidth="18"
          strokeLinecap="round"
        />
        {/* Downpipe Specular Highlight Streak */}
        <path
          d={`M ${dpStart.x - 2} ${dpStart.y} C ${dpStart.x - 12} ${dpStart.y + 33} ${dpEnd.x + 18} ${dpEnd.y - 17} ${dpEnd.x - 2} ${dpEnd.y}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* V-Band Coupling Flange Ring */}
        <ellipse cx={dpStart.x} cy={dpStart.y} rx="12" ry="7" fill="url(#machined-deck-bevel)" stroke="#090d16" strokeWidth="1.5" />
        <ellipse cx={dpStart.x} cy={dpStart.y} rx="10" ry="5.5" fill="#020617" stroke="#475569" strokeWidth="1" />
      </g>

      {/* ── 2. HOT-SIDE CAST IRON TURBINE SCROLL HOUSING ── */}
      <g id="turbo-turbine-housing">
        {/* Cast Iron Volute Scroll Body */}
        <path
          d={`M ${turbinePt.x - 22} ${turbinePt.y - 15}
              C ${turbinePt.x - 34} ${turbinePt.y + 12} ${turbinePt.x + 8} ${turbinePt.y + 32} ${turbinePt.x + 28} ${turbinePt.y + 10}
              C ${turbinePt.x + 36} ${turbinePt.y - 12} ${turbinePt.x + 4} ${turbinePt.y - 30} ${turbinePt.x - 22} ${turbinePt.y - 15} Z`}
          fill="url(#turbo-volute-cast-iron)"
          stroke="#090d16"
          strokeWidth="2.5"
        />
        {/* Heat discoloration / copper glow accent */}
        <path
          d={`M ${turbinePt.x - 18} ${turbinePt.y - 10} C ${turbinePt.x - 26} ${turbinePt.y + 10} ${turbinePt.x + 6} ${turbinePt.y + 24} ${turbinePt.x + 22} ${turbinePt.y + 6}`}
          fill="none"
          stroke="#c2410c"
          strokeWidth="3.5"
          opacity="0.65"
        />
        {/* Turbine Housing Exhaust Inlet Flange (connected to manifold) */}
        <rect x={turbinePt.x - 24} y={turbinePt.y - 20} width="18" height="14" rx="2" fill="url(#lifting-bracket-cast)" stroke="#090d16" strokeWidth="1.6" />
        <circle cx={turbinePt.x - 19} cy={turbinePt.y - 13} r="2.2" fill="url(#gold-anodized-bolt)" stroke="#78350f" strokeWidth="0.8" />
        <circle cx={turbinePt.x - 10} cy={turbinePt.y - 13} r="2.2" fill="url(#gold-anodized-bolt)" stroke="#78350f" strokeWidth="0.8" />
      </g>

      {/* ── 3. COLD-SIDE BILLET ALUMINUM COMPRESSOR VOLUTE SNAIL SCROLL HOUSING ── */}
      <g id="turbo-compressor-housing">
        {/* Outer Volute Scroll Snail Shell Body (Logarithmic Spiral Silhouette) */}
        <path
          d={`M ${tPt.x - 28} ${tPt.y + 6}
              C ${tPt.x - 32} ${tPt.y - 22} ${tPt.x - 4} ${tPt.y - 34} ${tPt.x + 24} ${tPt.y - 26}
              C ${tPt.x + 36} ${tPt.y - 14} ${tPt.x + 34} ${tPt.y + 18} ${tPt.x + 14} ${tPt.y + 28}
              C ${tPt.x - 8} ${tPt.y + 34} ${tPt.x - 26} ${tPt.y + 22} ${tPt.x - 28} ${tPt.y + 6} Z`}
          fill="url(#turbo-housing)"
          stroke="#090d16"
          strokeWidth="3"
        />
        {/* Specular Highlight Arc along outer volute curve */}
        <path
          d={`M ${tPt.x - 26} ${tPt.y + 2} C ${tPt.x - 28} ${tPt.y - 20} ${tPt.x - 2} ${tPt.y - 30} ${tPt.x + 22} ${tPt.y - 23}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.9"
        />
        {/* Inner Volute contour shadow line */}
        <path
          d={`M ${tPt.x + 20} ${tPt.y - 20} C ${tPt.x + 30} ${tPt.y - 8} ${tPt.x + 28} ${tPt.y + 14} ${tPt.x + 10} ${tPt.y + 22}`}
          fill="none"
          stroke="#334155"
          strokeWidth="2"
          opacity="0.7"
        />

        {/* Top Compressor Outlet Elbow Tube */}
        <rect x={tPt.x + 8} y={tPt.y - 32} width="16" height="22" rx="3" fill="url(#turbo-housing)" stroke="#090d16" strokeWidth="2" />
        <line x1={tPt.x + 10} y1={tPt.y - 31} x2={tPt.x + 10} y2={tPt.y - 12} stroke="#ffffff" strokeWidth="1.8" opacity="0.85" />

        {/* Blue Silicone Hose Coupler & T-Bolt Clamps */}
        <rect x={tPt.x + 6} y={tPt.y - 40} width="20" height="12" rx="2" fill="url(#anodized-blue)" stroke="#090d16" strokeWidth="1.4" />
        <line x1={tPt.x + 9} y1={tPt.y - 39} x2={tPt.x + 9} y2={tPt.y - 29} stroke="#ffffff" strokeWidth="1.5" />
        <line x1={tPt.x + 23} y1={tPt.y - 39} x2={tPt.x + 23} y2={tPt.y - 29} stroke="#ffffff" strokeWidth="1.5" />
      </g>

      {/* ── 4. MACHINED BELLMOUTH INLET & 10-BLADE GOLDEN BILLET IMPELLER ── */}
      <g id="turbo-impeller-wheel">
        {/* Machined Outer Bellmouth Lip */}
        <ellipse cx={tPt.x} cy={tPt.y} rx="18" ry="14" fill="url(#machined-deck-bevel)" stroke="#090d16" strokeWidth="2.2" />
        {/* Deep Inducted Bore Shaft */}
        <ellipse cx={tPt.x} cy={tPt.y} rx="14" ry="10" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />

        {/* 10-Blade Golden Billet CNC Impeller Wheel */}
        <g className={isAssemblyComplete || componentState.isActive ? "animate-spin-slow" : undefined} style={{ transformOrigin: `${tPt.x}px ${tPt.y}px` }}>
          <circle cx={tPt.x} cy={tPt.y} r="5" fill="url(#gold-hub)" stroke="#78350f" strokeWidth="1" />
          {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((ang, bidx) => (
            <g key={`turbo-blade-${bidx}`}>
              <line
                x1={tPt.x + 5 * Math.cos((ang * Math.PI) / 180)}
                y1={tPt.y + 3.8 * Math.sin((ang * Math.PI) / 180)}
                x2={tPt.x + 13 * Math.cos((ang * Math.PI) / 180)}
                y2={tPt.y + 9 * Math.sin((ang * Math.PI) / 180)}
                stroke="#fef08a"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <line
                x1={tPt.x + 5 * Math.cos((ang * Math.PI) / 180)}
                y1={tPt.y + 3.8 * Math.sin((ang * Math.PI) / 180)}
                x2={tPt.x + 12.5 * Math.cos((ang * Math.PI) / 180)}
                y2={tPt.y + 8.5 * Math.sin((ang * Math.PI) / 180)}
                stroke="#ffffff"
                strokeWidth="0.9"
                opacity="0.9"
              />
            </g>
          ))}
          <circle cx={tPt.x} cy={tPt.y} r="2.2" fill="#e2e8f0" stroke="#090d16" strokeWidth="0.7" />
        </g>
      </g>

      {/* ── 5. PNEUMATIC INTERNAL WASTEGATE ACTUATOR ASSEMBLY ── */}
      <g id="turbo-wastegate-actuator">
        {/* Actuator Canister Box */}
        <rect x={wgPt.x - 8} y={wgPt.y - 12} width="18" height="24" rx="4" fill="url(#pipe-cylinder-3d)" stroke="#090d16" strokeWidth="1.6" />
        <line x1={wgPt.x - 6} y1={wgPt.y - 10} x2={wgPt.x + 8} y2={wgPt.y - 10} stroke="#ffffff" strokeWidth="1.2" opacity="0.9" />

        {/* Stainless Actuator Connecting Rod */}
        <line x1={tPt.x - 12} y1={tPt.y + 12} x2={wgPt.x - 8} y2={wgPt.y} stroke="#e2e8f0" strokeWidth="3" />
        {/* Threaded Jam Nut & C-Clip Rod End Clevis */}
        <rect x={tPt.x - 10} y={tPt.y + 8} width="5" height="5" fill="#f8fafc" stroke="#090d16" strokeWidth="0.7" />
        <circle cx={tPt.x - 12} cy={tPt.y + 12} r="2.8" fill="#b45309" stroke="#090d16" strokeWidth="0.9" />

        {/* Boost Reference Pressure Fitting & Hose */}
        <rect x={wgPt.x + 10} y={wgPt.y - 4} width="5" height="4" fill="#38bdf8" rx="1" />
        <path d={`M ${wgPt.x + 14} ${wgPt.y - 2} Q ${wgPt.x + 22} ${wgPt.y + 10} ${tPt.x + 16} ${tPt.y - 25}`} fill="none" stroke="#0e7490" strokeWidth="2" strokeDasharray="3 1.5" />
      </g>
    </g>
  );
};
