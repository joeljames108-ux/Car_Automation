/**
 * ============================================================================
 * INTERIOR CONFIG VIEWPORT — HIGH-FIDELITY AUTOMOTIVE COCKPIT VISUALIZER
 * ============================================================================
 * Photorealistic dynamic SVG cabin visualization:
 * - Sculpted luxury sport seats with headrests, bolsters & stitching in interiorColor
 * - Dynamic Trim Inlay (Carbon Fiber, Wood, Aluminum, Plastic)
 * - Ambient LED fiber-optic neon contour with dynamic glow
 * - Dynamic Instrument Cluster (Analog twin dials / Digital widescreen / HUD AR)
 * - Dynamic Infotainment Display (None / 8" tablet / 12" ultra-widescreen)
 * - Dynamic Steering Wheel (2-spoke classic / 3-spoke sport / Jet-fighter yoke)
 * - Center console with electronic shifter, rotary dial & cup holders
 * - Bottom presets carousel with active glow & apply CTA
 * ============================================================================
 */

import React from "react";
import {
  useInteriorDashboardConfigStore,
  INTERIOR_PRESETS,
  getSelectedOption,
} from "../../state/interiorDashboardConfigStore";

export const InteriorConfigViewport: React.FC = () => {
  const selections = useInteriorDashboardConfigStore((s) => s.selections);
  const interiorColor = useInteriorDashboardConfigStore((s) => s.interiorColor);
  const activePreset = useInteriorDashboardConfigStore((s) => s.activePreset);
  const applyPreset = useInteriorDashboardConfigStore((s) => s.applyPreset);

  // Visual hints from selections
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
  const ambientColor = (ambientOpt.visualHints?.glowColor as string) ?? "#00e5ff";
  const dashShape = (layoutOpt.visualHints?.shape as string) ?? "classic";
  const trimLabel = trimOpt.label.toLowerCase();

  // Dashboard top contour based on layout
  const getDashTopPath = () => {
    switch (dashShape) {
      case "driver_focused":
        return "M 65 145 Q 180 120 280 135 Q 420 148 535 150 L 525 210 Q 300 230 75 210 Z";
      case "minimalist":
        return "M 70 148 Q 300 138 530 148 L 520 205 Q 300 215 80 205 Z";
      default: // classic
        return "M 65 142 Q 185 125 300 132 Q 415 138 535 142 L 525 210 Q 300 225 75 210 Z";
    }
  };

  // Trim strip fill/gradient
  const getTrimFill = () => {
    if (trimLabel.includes("carbon")) return "url(#trimCarbon)";
    if (trimLabel.includes("wood")) return "url(#trimWood)";
    if (trimLabel.includes("aluminum")) return "url(#trimAluminum)";
    return "#1e293b"; // plastic
  };

  return (
    <div className="idash-center-viewport">
      {/* Tab Navigation */}
      <div className="idash-tab-nav">
        <button className="idash-tab-btn" type="button">
          <span className="idash-tab-icon">🚗</span>
          <span>EXTERIOR</span>
        </button>
        <button className="idash-tab-btn active" type="button">
          <span className="idash-tab-icon">⚙</span>
          <span>INTERIOR</span>
        </button>
        <button className="idash-tab-btn" type="button">
          <span className="idash-tab-icon">⚡</span>
          <span>ELECTRONICS</span>
        </button>
      </div>

      {/* SVG Viewport Canvas */}
      <div className="idash-viewport-canvas">
        <svg
          id="idash-viewport-svg"
          viewBox="0 0 600 340"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="idash-svg"
        >
          <defs>
            {/* Cabin Ambient Sky Gradient */}
            <linearGradient id="cabinSky" x1="300" y1="0" x2="300" y2="300" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0c1220" />
              <stop offset="50%" stopColor="#151e33" />
              <stop offset="100%" stopColor="#080c14" />
            </linearGradient>

            {/* Windshield Reflection */}
            <linearGradient id="windshieldGlass" x1="300" y1="40" x2="300" y2="280" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.85" />
              <stop offset="35%" stopColor="#0f172a" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>

            {/* Seat 3D Lighting Overlays */}
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

            {/* Trim Patterns & Gradients */}
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

            {/* Leather Grain Highlight */}
            <linearGradient id="dashTopGrad" x1="300" y1="120" x2="300" y2="220" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#232d40" />
              <stop offset="40%" stopColor="#192030" />
              <stop offset="100%" stopColor="#0f1522" />
            </linearGradient>

            {/* Screen Glow Filter */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── 1. CABIN BACKGROUND & WINDSHIELD ── */}
          <rect width="600" height="340" fill="url(#cabinSky)" rx="8" />

          {/* Windshield Glass Frame */}
          <path
            d="M 50 65 Q 300 25 550 65 L 525 275 Q 300 305 75 275 Z"
            fill="url(#windshieldGlass)"
            stroke="#1e293b"
            strokeWidth="2.5"
          />

          {/* Windshield horizon glow / gradient sky tint */}
          <path
            d="M 60 70 Q 300 32 540 70 L 530 145 Q 300 135 70 145 Z"
            fill="#0ea5e9"
            fillOpacity="0.07"
          />

          {/* A-Pillars (Left & Right) */}
          <path d="M 45 60 L 78 280 L 52 280 L 25 60 Z" fill="#131926" stroke="#253248" strokeWidth="1.5" />
          <path d="M 555 60 L 575 60 L 548 280 L 522 280 Z" fill="#131926" stroke="#253248" strokeWidth="1.5" />

          {/* Rearview Mirror + Rain Sensor */}
          <g transform="translate(275, 38)">
            <path d="M 25 0 L 25 12" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
            <rect x="0" y="12" width="50" height="18" rx="4" fill="#0b0f16" stroke="#475569" strokeWidth="1.5" />
            <rect x="3" y="15" width="44" height="12" rx="2" fill="#1e293b" />
            {/* Mirror reflection shimmer */}
            <line x1="8" y1="21" x2="38" y2="21" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.6" />
          </g>

          {/* ── 2. SCULPTED SPORT SEATS (Background Layer) ── */}

          {/* LEFT SEAT (Driver) */}
          <g id="driverSeat">
            {/* Headrest Dual Metal Stalks */}
            <rect x="138" y="98" width="5" height="18" rx="2" fill="#94a3b8" />
            <rect x="157" y="98" width="5" height="18" rx="2" fill="#94a3b8" />

            {/* Headrest Pillow */}
            <rect x="126" y="76" width="48" height="30" rx="9" fill={interiorColor} stroke="#0f172a" strokeWidth="2" />
            <rect x="126" y="76" width="48" height="30" rx="9" fill="url(#seatHighlight)" />
            <line x1="134" y1="91" x2="166" y2="91" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.25" />

            {/* Main Shoulder & Upper Backrest */}
            <path
              d="M 112 110 Q 150 102 188 110 Q 206 135 198 185 L 102 185 Q 94 135 112 110 Z"
              fill={interiorColor}
              stroke="#0f172a"
              strokeWidth="2.5"
            />
            <path
              d="M 112 110 Q 150 102 188 110 Q 206 135 198 185 L 102 185 Q 94 135 112 110 Z"
              fill="url(#seatShading)"
            />

            {/* Lateral Bolster Wings */}
            <path d="M 102 125 Q 112 155 112 185" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="3 2" />
            <path d="M 198 125 Q 188 155 188 185" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="3 2" />

            {/* Center Cushion Ribbed Stitching */}
            <line x1="126" y1="130" x2="174" y2="130" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.25" />
            <line x1="124" y1="148" x2="176" y2="148" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.25" />
            <line x1="122" y1="166" x2="178" y2="166" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.25" />

            {/* Seat Base Cushion */}
            <path
              d="M 98 185 L 202 185 Q 208 240 198 275 L 102 275 Q 92 240 98 185 Z"
              fill={interiorColor}
              stroke="#0f172a"
              strokeWidth="2"
            />
            <path
              d="M 98 185 L 202 185 Q 208 240 198 275 L 102 275 Q 92 240 98 185 Z"
              fill="url(#seatHighlight)"
            />
          </g>

          {/* RIGHT SEAT (Passenger) */}
          <g id="passengerSeat">
            {/* Headrest Stalks */}
            <rect x="438" y="98" width="5" height="18" rx="2" fill="#94a3b8" />
            <rect x="457" y="98" width="5" height="18" rx="2" fill="#94a3b8" />

            {/* Headrest Pillow */}
            <rect x="426" y="76" width="48" height="30" rx="9" fill={interiorColor} stroke="#0f172a" strokeWidth="2" />
            <rect x="426" y="76" width="48" height="30" rx="9" fill="url(#seatHighlight)" />
            <line x1="434" y1="91" x2="466" y2="91" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.25" />

            {/* Main Shoulder & Upper Backrest */}
            <path
              d="M 412 110 Q 450 102 488 110 Q 506 135 498 185 L 402 185 Q 394 135 412 110 Z"
              fill={interiorColor}
              stroke="#0f172a"
              strokeWidth="2.5"
            />
            <path
              d="M 412 110 Q 450 102 488 110 Q 506 135 498 185 L 402 185 Q 394 135 412 110 Z"
              fill="url(#seatShading)"
            />

            {/* Lateral Bolster Wings */}
            <path d="M 402 125 Q 412 155 412 185" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="3 2" />
            <path d="M 498 125 Q 488 155 488 185" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="3 2" />

            {/* Center Cushion Ribbed Stitching */}
            <line x1="426" y1="130" x2="474" y2="130" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.25" />
            <line x1="424" y1="148" x2="476" y2="148" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.25" />
            <line x1="422" y1="166" x2="478" y2="166" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.25" />

            {/* Seat Base Cushion */}
            <path
              d="M 398 185 L 502 185 Q 508 240 498 275 L 402 275 Q 392 240 398 185 Z"
              fill={interiorColor}
              stroke="#0f172a"
              strokeWidth="2"
            />
            <path
              d="M 398 185 L 502 185 Q 508 240 498 275 L 402 275 Q 392 240 398 185 Z"
              fill="url(#seatHighlight)"
            />
          </g>

          {/* ── 3. SCULPTED LUXURY DASHBOARD (Foreground Layer) ── */}

          {/* Main Dashboard Upper Surface */}
          <path
            d={getDashTopPath()}
            fill="url(#dashTopGrad)"
            stroke="#2d3a4f"
            strokeWidth="2"
            style={{ transition: "d 0.35s ease" }}
          />

          {/* Decorative Trim Inlay (Carbon/Wood/Aluminum/Plastic) */}
          <path
            d="M 85 170 Q 300 156 515 170 L 510 184 Q 300 170 90 184 Z"
            fill={getTrimFill()}
            stroke="#0f172a"
            strokeWidth="1.2"
          />

          {/* Full-Width Ambient LED Light Strip */}
          {ambientEnabled ? (
            <path
              d="M 85 186 Q 300 172 515 186"
              stroke={ambientColor}
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#neonGlow)"
              style={{ transition: "stroke 0.3s ease" }}
            />
          ) : (
            <path
              d="M 85 186 Q 300 172 515 186"
              stroke="#1e293b"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          )}

          {/* Turbine Air Vents (Left, Center Pair, Right) */}
          {/* Left Vent */}
          <g transform="translate(95, 172)">
            <circle cx="0" cy="0" r="11" fill="#090d14" stroke="#475569" strokeWidth="2" />
            <circle cx="0" cy="0" r="8" fill="#151e2e" />
            <line x1="-7" y1="0" x2="7" y2="0" stroke="#64748b" strokeWidth="1.5" />
            <line x1="0" y1="-7" x2="0" y2="7" stroke="#64748b" strokeWidth="1.5" />
          </g>

          {/* Center Dual Vents */}
          <g transform="translate(285, 168)">
            <rect x="0" y="0" width="30" height="12" rx="2" fill="#090d14" stroke="#475569" strokeWidth="1.5" />
            <line x1="4" y1="6" x2="26" y2="6" stroke="#64748b" strokeWidth="1.5" />
          </g>

          {/* Right Vent */}
          <g transform="translate(505, 172)">
            <circle cx="0" cy="0" r="11" fill="#090d14" stroke="#475569" strokeWidth="2" />
            <circle cx="0" cy="0" r="8" fill="#151e2e" />
            <line x1="-7" y1="0" x2="7" y2="0" stroke="#64748b" strokeWidth="1.5" />
            <line x1="0" y1="-7" x2="0" y2="7" stroke="#64748b" strokeWidth="1.5" />
          </g>

          {/* ── 4. INSTRUMENT CLUSTER BINNACLE ── */}
          <g transform="translate(130, 132)">
            {/* Cluster Hood Housing */}
            <path d="M 0 42 Q 45 8 90 42 Z" fill="#101726" stroke="#334155" strokeWidth="2" />

            {/* Display / Dial Area */}
            <rect x="6" y="14" width="78" height="30" rx="4" fill="#06090e" stroke="#1e293b" strokeWidth="1.5" />

            {/* A) ANALOG DIALS */}
            {clusterType === "analog" && (
              <g>
                {/* Speedo (Left) */}
                <circle cx="25" cy="29" r="11" fill="#0a0f18" stroke="#00e5ff" strokeWidth="1.5" />
                <line x1="25" y1="29" x2="31" y2="23" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                {/* Tacho (Right) */}
                <circle cx="65" cy="29" r="11" fill="#0a0f18" stroke="#00e5ff" strokeWidth="1.5" />
                <line x1="65" y1="29" x2="59" y2="22" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                <text x="45" y="32" fill="#38bdf8" fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  80s
                </text>
              </g>
            )}

            {/* B) DIGITAL WIDESCREEN COCKPIT */}
            {clusterType === "digital" && (
              <g>
                <rect x="8" y="16" width="74" height="26" rx="2" fill="#0369a1" fillOpacity="0.25" />
                {/* Speed Bar Arc */}
                <path d="M 12 36 A 14 14 0 0 1 36 22" fill="none" stroke="#00e5ff" strokeWidth="2.5" />
                <path d="M 78 36 A 14 14 0 0 0 54 22" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                {/* Speed Digital Readout */}
                <text x="45" y="27" fill="#ffffff" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="900">
                  120
                </text>
                <text x="45" y="36" fill="#00e5ff" fontSize="6" fontFamily="sans-serif" textAnchor="middle">
                  km/h • D4
                </text>
              </g>
            )}

            {/* C) AUGMENTED REALITY HUD */}
            {clusterType === "hud" && (
              <g>
                <rect x="8" y="16" width="74" height="26" rx="2" fill="#065f46" fillOpacity="0.3" />
                <text x="45" y="26" fill="#34d399" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  ▲ 120 km/h
                </text>
                <text x="45" y="36" fill="#6ee7b7" fontSize="6" fontFamily="monospace" textAnchor="middle">
                  HUD ACTIVE
                </text>
                {/* Floating Windshield HUD Projection */}
                <g transform="translate(20, -50)" filter="url(#neonGlow)">
                  <circle cx="25" cy="0" r="8" stroke="#34d399" strokeWidth="1" strokeDasharray="2 2" fill="none" opacity="0.8" />
                  <text x="25" y="3" fill="#34d399" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    120
                  </text>
                  <path d="M 21 -10 L 25 -14 L 29 -10" stroke="#34d399" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </g>
              </g>
            )}
          </g>

          {/* ── 5. CENTER INFOTAINMENT SCREEN ── */}
          {screenSize > 0 && (
            <g transform={`translate(${screenSize > 8 ? 260 : 272}, 128)`}>
              {/* Screen Bezel Frame */}
              <rect
                width={screenSize > 8 ? 80 : 56}
                height="46"
                rx="4"
                fill="#000000"
                stroke="#475569"
                strokeWidth="2"
                style={{ transition: "width 0.3s ease" }}
              />
              {/* Screen Display Active Area */}
              <rect
                x="3"
                y="3"
                width={screenSize > 8 ? 74 : 50}
                height="40"
                rx="2"
                fill="#0f172a"
              />
              {/* GPS Nav Map Graphic */}
              <path
                d={`M 6 36 Q ${screenSize > 8 ? 35 : 22} 24 ${screenSize > 8 ? 70 : 46} 12`}
                stroke="#38bdf8"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx={screenSize > 8 ? 42 : 28} cy="22" r="3" fill="#00e5ff" />
              <text
                x={screenSize > 8 ? 40 : 28}
                y="12"
                fill="#e2e8f0"
                fontSize="6"
                fontFamily="sans-serif"
                textAnchor="middle"
                fontWeight="bold"
              >
                APEX NAV
              </text>
              <text
                x={screenSize > 8 ? 40 : 28}
                y="38"
                fill="#94a3b8"
                fontSize="5"
                fontFamily="sans-serif"
                textAnchor="middle"
              >
                21.5°C • 🎵 Radio
              </text>
            </g>
          )}

          {/* ── 6. CENTER CONSOLE (Tunnel, Shifter, Cup Holders) ── */}
          <g id="centerConsole">
            {/* Console Base */}
            <path
              d="M 270 190 L 330 190 L 345 300 L 255 300 Z"
              fill="#101622"
              stroke="#243048"
              strokeWidth="2"
            />

            {/* Gear Selector Shifter Plate */}
            <rect x="282" y="205" width="36" height="38" rx="4" fill="#0b0f16" stroke="#334155" strokeWidth="1.5" />

            {/* Shifter Lever / Crystal Dial */}
            <rect x="294" y="212" width="12" height="16" rx="3" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="1" />
            <text x="300" y="238" fill="#38bdf8" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              P R N D S
            </text>

            {/* Ambient Console Halo */}
            {ambientEnabled && (
              <path
                d="M 275 195 L 265 295 M 325 195 L 335 295"
                stroke={ambientColor}
                strokeWidth="2"
                filter="url(#neonGlow)"
              />
            )}

            {/* Dual Cup Holders */}
            <circle cx="286" cy="265" r="9" fill="#070a0f" stroke="#334155" strokeWidth="1" />
            <circle cx="314" cy="265" r="9" fill="#070a0f" stroke="#334155" strokeWidth="1" />
          </g>

          {/* ── 7. STEERING WHEEL (Driver Side Front) ── */}
          <g transform="translate(175, 215)">
            {/* A) YOKE STEERING WHEEL */}
            {spokeCount === 0 ? (
              <g>
                {/* Yoke Open-Top Rim */}
                <path
                  d="M -42 16 Q -50 -28 0 -44 Q 50 -28 42 16"
                  stroke="#1e293b"
                  strokeWidth="13"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M -42 16 Q -50 -28 0 -44 Q 50 -28 42 16"
                  stroke="#334155"
                  strokeWidth="9"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Integrated Shift Light LED Bar */}
                <path
                  d="M -22 -40 Q 0 -44 22 -40"
                  stroke="#22c55e"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
            ) : (
              /* B) TRADITIONAL CIRCULAR / SPORT RIM */
              <g>
                {/* Outer Leather Grip Rim */}
                <circle cx="0" cy="0" r="50" stroke="#0f172a" strokeWidth="13" fill="none" />
                <circle cx="0" cy="0" r="50" stroke="#334155" strokeWidth="9" fill="none" />
                {/* 12 O'clock Centering Stripe */}
                <line x1="0" y1="-54" x2="0" y2="-45" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
              </g>
            )}

            {/* Central Airbag Boss Hub */}
            <circle cx="0" cy="0" r="18" fill="#111827" stroke="#475569" strokeWidth="2" />
            <circle cx="0" cy="0" r="10" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
            {/* Brand Logo Emblem */}
            <circle cx="0" cy="0" r="5" fill="#0284c7" />

            {/* Spokes (2-Spoke vs 3-Spoke) */}
            {/* Left & Right Horizontal Spokes with Control Pods */}
            <g>
              <rect x="-44" y="-5" width="28" height="10" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <circle cx="-32" cy="0" r="2.5" fill="#38bdf8" />
              <rect x="16" y="-5" width="28" height="10" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <circle cx="32" cy="0" r="2.5" fill="#38bdf8" />
            </g>

            {/* 3rd Bottom Spoke (for Sport 3-Spoke) */}
            {spokeCount === 3 && (
              <g>
                <path d="M -5 18 L 5 18 L 4 45 L -4 45 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                <rect x="-2" y="24" width="4" height="14" rx="1" fill="#475569" />
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Bottom Presets Carousel */}
      <div className="idash-presets-container">
        <div className="idash-section-title" style={{ marginBottom: 8 }}>
          INTERIOR PRESETS
        </div>
        <div className="idash-preset-list">
          {Object.entries(INTERIOR_PRESETS).map(([key, preset]) => {
            const isActive = activePreset === key;
            return (
              <button
                key={key}
                type="button"
                className={`idash-preset-card ${isActive ? "active" : ""}`}
                onClick={() => applyPreset(key)}
              >
                <div
                  className="idash-preset-swatch"
                  style={{
                    backgroundColor: preset.color,
                    boxShadow: isActive ? `0 0 10px ${preset.color}` : "none",
                  }}
                />
                <span className="idash-preset-name">{preset.name}</span>
              </button>
            );
          })}
        </div>
        <button className="idash-apply-btn" type="button">
          ✓ APPLY &amp; CONTINUE
        </button>
        <div className="idash-apply-hint">
          Changes will be saved to your design
        </div>
      </div>
    </div>
  );
};
