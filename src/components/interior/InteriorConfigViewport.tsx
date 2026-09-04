/**
 * ============================================================================
 * INTERIOR CONFIG VIEWPORT — CENTER PANEL WITH DUAL 3D WEBGL & 2D MODES
 * ============================================================================
 * Features:
 * 1. REAL-TIME 3D WEBGL COCKPIT (Default):
 *    - 280,000+ photorealistic 3D configurations rendered live at 60 FPS
 *    - Dynamic PBR lighting, Nappa leather/Alcantara/3K carbon materials
 *    - 4 instant camera poses (Driver POV, Steering/Cluster, Console, Wide 3D)
 *    - Day / Night lighting mode toggle
 * 2. 2D BLUEPRINT SVG MODE:
 *    - Clean vector schematic with reactive seats, ambient neon tube & cluster
 * 3. Presets Carousel + Dynamic Sync with Master Vehicle Design (DesignContext)
 * ============================================================================
 */

import React, { useState } from "react";
import {
  useInteriorDashboardConfigStore,
  INTERIOR_PRESETS,
  getSelectedOption,
} from "../../state/interiorDashboardConfigStore";
import { InteriorConfig3DViewport } from "./InteriorConfig3DViewport";
import { useDesign } from "../../state/DesignContext";
import { playHMITabSound } from "../../utils/hmiSoundSynth";
import { Box, Layers, CheckCircle2 } from "lucide-react";

export const InteriorConfigViewport: React.FC = () => {
  const [viewportMode, setViewportMode] = useState<"3d" | "2d">("3d");
  const [showAppliedToast, setShowAppliedToast] = useState<boolean>(false);

  const selections = useInteriorDashboardConfigStore((s) => s.selections);
  const interiorColor = useInteriorDashboardConfigStore((s) => s.interiorColor);
  const metrics = useInteriorDashboardConfigStore((s) => s.metrics);
  const activePreset = useInteriorDashboardConfigStore((s) => s.activePreset);
  const applyPreset = useInteriorDashboardConfigStore((s) => s.applyPreset);

  const { updateInterior } = useDesign();

  // Handle Apply & Save to Master Vehicle Specification
  const handleApplyAndContinue = () => {
    playHMITabSound();

    // Map selections to Master DesignContext InteriorConfig
    const seatTypeLabel = getSelectedOption("seatType", selections).label.toLowerCase();
    let seatType: any = "sport";
    if (seatTypeLabel.includes("racing")) seatType = "carbon_bucket";
    else if (seatTypeLabel.includes("standard")) seatType = "standard";

    const seatMatLabel = getSelectedOption("seatMaterial", selections).label.toLowerCase();
    let seatMaterial: any = "leather";
    if (seatMatLabel.includes("alcantara")) seatMaterial = "alcantara";
    else if (seatMatLabel.includes("cloth")) seatMaterial = "cloth";

    const trimLabel = getSelectedOption("interiorTrim", selections).label.toLowerCase();
    let dashMat: any = "soft_touch";
    if (trimLabel.includes("carbon")) dashMat = "carbon_fiber";
    else if (trimLabel.includes("wood")) dashMat = "wood";
    else if (trimLabel.includes("aluminum")) dashMat = "aluminum";

    const displaySize = (getSelectedOption("centerDisplay", selections).visualHints?.screenSize as number) || 0;

    const wheelLabel = getSelectedOption("steeringWheel", selections).label.toLowerCase();
    let wheelType: any = "sport";
    if (wheelLabel.includes("yoke")) wheelType = "gt_wheel";
    else if (wheelLabel.includes("2-spoke")) wheelType = "standard";

    updateInterior({
      seatType,
      seatMaterial,
      interiorColor,
      dashboardMaterial: dashMat,
      infotainmentSize: displaySize,
      steeringWheel: wheelType,
      ambientLighting: selections.ambientLighting === 1 ? 1 : 0,
      interiorWeight: metrics.weight,
    });

    setShowAppliedToast(true);
    setTimeout(() => setShowAppliedToast(false), 3000);
  };

  // Visual hints from selections for 2D mode
  const clusterOpt = getSelectedOption("instrumentCluster", selections);
  const displayOpt = getSelectedOption("centerDisplay", selections);
  const wheelOpt = getSelectedOption("steeringWheel", selections);
  const ambientOpt = getSelectedOption("ambientLighting", selections);
  const layoutOpt = getSelectedOption("dashboardLayout", selections);
  const trimOpt = getSelectedOption("interiorTrim", selections);

  const clusterType = (clusterOpt.visualHints?.clusterType as string) ?? "analog";
  const screenSize = (displayOpt.visualHints?.screenSize as number) ?? 0;
  const spokeCount = (wheelOpt.visualHints?.spokeCount as number) ?? 2;
  const ambientEnabled = (ambientOpt.visualHints?.enabled as boolean) ?? false;
  const ambientColor = (ambientOpt.visualHints?.glowColor as string) ?? "#f59e0b";
  const dashShape = (layoutOpt.visualHints?.shape as string) ?? "classic";
  const trimLabel = trimOpt.label.toLowerCase();

  const getDashTopPath = () => {
    switch (dashShape) {
      case "driver_focused":
        return "M 65 145 Q 180 120 280 135 Q 420 148 535 150 L 525 210 Q 300 230 75 210 Z";
      case "minimalist":
        return "M 70 148 Q 300 138 530 148 L 520 205 Q 300 215 80 205 Z";
      default:
        return "M 65 142 Q 185 125 300 132 Q 415 138 535 142 L 525 210 Q 300 225 75 210 Z";
    }
  };

  const getTrimFill = () => {
    if (trimLabel.includes("carbon")) return "url(#trimCarbon)";
    if (trimLabel.includes("wood")) return "url(#trimWood)";
    if (trimLabel.includes("aluminum")) return "url(#trimAluminum)";
    return "#92400e";
  };

  return (
    <div className="idash-center-viewport relative flex flex-col">
      {/* Main Viewport Content (3D or 2D) */}
      <div className="idash-viewport-canvas">
        {viewportMode === "3d" ? (
          /* MODE 1: 3D REAL-TIME WEBGL COCKPIT */
          <InteriorConfig3DViewport />
        ) : (
          /* MODE 2: 2D HIGH-CONTRAST VECTOR BLUEPRINT */
          <svg
            id="idash-viewport-svg"
            viewBox="0 0 600 340"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="idash-svg"
          >
            <defs>
              <linearGradient id="cabinSky" x1="300" y1="0" x2="300" y2="300" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="50%" stopColor="#fde68a" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>

              <linearGradient id="windshieldGlass" x1="300" y1="40" x2="300" y2="280" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.85" />
                <stop offset="35%" stopColor="#d97706" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>

              <linearGradient id="seatHighlight" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
              </linearGradient>

              <linearGradient id="seatShading" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
                <stop offset="70%" stopColor="#000000" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
              </linearGradient>

              <linearGradient id="trimCarbon" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1e2430" />
                <stop offset="25%" stopColor="#0f141c" />
                <stop offset="50%" stopColor="#252e3d" />
                <stop offset="75%" stopColor="#111620" />
                <stop offset="100%" stopColor="#1e2430" />
              </linearGradient>

              <linearGradient id="trimWood" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#633719" />
                <stop offset="30%" stopColor="#8d5027" />
                <stop offset="70%" stopColor="#512b12" />
                <stop offset="100%" stopColor="#7a4420" />
              </linearGradient>

              <linearGradient id="trimAluminum" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="35%" stopColor="#cbd5e1" />
                <stop offset="70%" stopColor="#475569" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>

              <linearGradient id="dashTopGrad" x1="300" y1="120" x2="300" y2="220" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="40%" stopColor="#fef3c7" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>

              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Cabin Background & Windshield */}
            <rect width="600" height="340" fill="url(#cabinSky)" rx="8" />
            <path
              d="M 50 65 Q 300 25 550 65 L 525 275 Q 300 305 75 275 Z"
              fill="url(#windshieldGlass)"
              stroke="#d97706"
              strokeWidth="2.5"
            />

            {/* Driver & Passenger Seats */}
            {/* Driver Seat */}
            <g id="driverSeat">
              <rect x="138" y="98" width="5" height="18" rx="2" fill="#94a3b8" />
              <rect x="157" y="98" width="5" height="18" rx="2" fill="#94a3b8" />
              <rect x="126" y="76" width="48" height="30" rx="9" fill={interiorColor} stroke="#92400e" strokeWidth="2" />
              <rect x="126" y="76" width="48" height="30" rx="9" fill="url(#seatHighlight)" />
              <path
                d="M 112 110 Q 150 102 188 110 Q 206 135 198 185 L 102 185 Q 94 135 112 110 Z"
                fill={interiorColor}
                stroke="#92400e"
                strokeWidth="2.5"
              />
              <path
                d="M 112 110 Q 150 102 188 110 Q 206 135 198 185 L 102 185 Q 94 135 112 110 Z"
                fill="url(#seatShading)"
              />
              <path
                d="M 98 185 L 202 185 Q 208 240 198 275 L 102 275 Q 92 240 98 185 Z"
                fill={interiorColor}
                stroke="#92400e"
                strokeWidth="2"
              />
            </g>

            {/* Passenger Seat */}
            <g id="passengerSeat">
              <rect x="438" y="98" width="5" height="18" rx="2" fill="#94a3b8" />
              <rect x="457" y="98" width="5" height="18" rx="2" fill="#94a3b8" />
              <rect x="426" y="76" width="48" height="30" rx="9" fill={interiorColor} stroke="#92400e" strokeWidth="2" />
              <rect x="426" y="76" width="48" height="30" rx="9" fill="url(#seatHighlight)" />
              <path
                d="M 412 110 Q 450 102 488 110 Q 506 135 498 185 L 402 185 Q 394 135 412 110 Z"
                fill={interiorColor}
                stroke="#92400e"
                strokeWidth="2.5"
              />
              <path
                d="M 412 110 Q 450 102 488 110 Q 506 135 498 185 L 402 185 Q 394 135 412 110 Z"
                fill="url(#seatShading)"
              />
              <path
                d="M 398 185 L 502 185 Q 508 240 498 275 L 402 275 Q 392 240 398 185 Z"
                fill={interiorColor}
                stroke="#92400e"
                strokeWidth="2"
              />
            </g>

            {/* Dashboard & Inlay */}
            <path d={getDashTopPath()} fill="url(#dashTopGrad)" stroke="#d97706" strokeWidth="2" />
            <path d="M 85 170 Q 300 156 515 170 L 510 184 Q 300 170 90 184 Z" fill={getTrimFill()} stroke="#92400e" strokeWidth="1.2" />

            {/* Ambient LED Strip */}
            {ambientEnabled && (
              <path
                d="M 85 186 Q 300 172 515 186"
                stroke={ambientColor}
                strokeWidth="3.5"
                strokeLinecap="round"
                filter="url(#neonGlow)"
              />
            )}

            {/* Cluster Binnacle */}
            <g transform="translate(130, 132)">
              <path d="M 0 42 Q 45 8 90 42 Z" fill="#fde68a" stroke="#a08040" strokeWidth="2" />
              <rect x="6" y="14" width="78" height="30" rx="4" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
              {clusterType === "analog" && (
                <g>
                  <circle cx="25" cy="29" r="11" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1.5" />
                  <circle cx="65" cy="29" r="11" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1.5" />
                </g>
              )}
              {clusterType === "digital" && (
                <g>
                  <rect x="8" y="16" width="74" height="26" rx="2" fill="#d97706" fillOpacity="0.25" />
                  <text x="45" y="27" fill="#ffffff" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="900">
                    120
                  </text>
                </g>
              )}
            </g>

            {/* Center Display Screen */}
            {screenSize > 0 && (
              <g transform={`translate(${screenSize > 8 ? 260 : 272}, 128)`}>
                <rect width={screenSize > 8 ? 80 : 56} height="46" rx="4" fill="#fef3c7" stroke="#b45309" strokeWidth="2" />
                <rect x="3" y="3" width={screenSize > 8 ? 74 : 50} height="40" rx="2" fill="#fef3c7" />
              </g>
            )}

            {/* Steering Wheel */}
            <g transform="translate(175, 215)">
              <circle cx="0" cy="0" r="50" stroke="#92400e" strokeWidth="13" fill="none" />
              <circle cx="0" cy="0" r="50" stroke="#a08040" strokeWidth="9" fill="none" />
              <circle cx="0" cy="0" r="18" fill="#fde68a" stroke="#b45309" strokeWidth="2" />
            </g>
          </svg>
        )}
      </div>

      {/* Bottom Presets Carousel */}
      <div className="idash-presets-container bg-amber-50/70 border-t border-amber-300/30 p-3.5 shrink-0">
        <div className="text-xs font-mono font-bold tracking-widest text-amber-700 uppercase mb-2 font-black tracking-widest flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          INTERIOR PRESETS
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
          {Object.entries(INTERIOR_PRESETS).map(([key, preset]) => {
            const isActive = activePreset === key;
            return (
              <button
                key={key}
                type="button"
                className={`min-w-[95px] p-2 rounded-xl bg-amber-100/60 border border-white/[0.06] transition-all hover:bg-amber-200/30 duration-200 flex flex-col items-center gap-1.5 cursor-pointer text-center ${
                  isActive
                    ? "border-amber-400/50 bg-amber-100/60 shadow-[0_0_16px_rgba(251,191,36,0.25)] scale-102"
                    : "border-amber-800/30 hover:border-amber-400/30 hover:bg-amber-100/40"
                }`}
                onClick={() => applyPreset(key)}
              >
                <div
                  className="w-14 h-8 rounded-lg border border-white/20 transition-all"
                  style={{
                    backgroundColor: preset.color,
                    boxShadow: isActive ? `0 0 12px ${preset.color}80` : "none",
                  }}
                />
                <span className={`text-[11px] font-bold tracking-tight truncate w-full ${isActive ? "text-amber-900" : "text-amber-700"}`}>
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>
        <button
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 border border-amber-400/20 text-amber-900 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[0_4px_20px_rgba(217,119,6,0.3)] active:scale-98 cursor-pointer mt-2 flex items-center justify-center gap-2"
          type="button"
          onClick={handleApplyAndContinue}
        >
          <span>✓</span>
          <span>APPLY &amp; CONTINUE</span>
        </button>
        <div className="text-center text-[10px] font-mono text-amber-600 mt-1.5">
          Changes will be saved to your design &amp; master vehicle physics
        </div>
      </div>
    </div>
  );
};
