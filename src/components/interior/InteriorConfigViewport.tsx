/**
 * ============================================================================
 * INTERIOR CONFIG VIEWPORT — CENTER PANEL
 * ============================================================================
 * Dynamic SVG cabin visualization that reacts to every config change:
 * - Seat color from interior color swatch
 * - Ambient lighting glow strip with color + CSS filter
 * - Instrument cluster morphs between analog/digital/HUD
 * - Center display appears/disappears with size changes
 * - Steering wheel spokes change (2-spoke, 3-spoke, yoke)
 * - Dashboard shape responds to layout selection
 * Also contains the tab navigation bar and bottom presets carousel.
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

  // Visual hints from options
  const clusterOpt = getSelectedOption("instrumentCluster", selections);
  const displayOpt = getSelectedOption("centerDisplay", selections);
  const wheelOpt = getSelectedOption("steeringWheel", selections);
  const ambientOpt = getSelectedOption("ambientLighting", selections);
  const layoutOpt = getSelectedOption("dashboardLayout", selections);

  const clusterType = (clusterOpt.visualHints?.clusterType as string) ?? "analog";
  const screenSize = (displayOpt.visualHints?.screenSize as number) ?? 0;
  const spokeCount = (wheelOpt.visualHints?.spokeCount as number) ?? 2;
  const ambientEnabled = (ambientOpt.visualHints?.enabled as boolean) ?? false;
  const ambientColor = (ambientOpt.visualHints?.glowColor as string) ?? "transparent";
  const dashShape = (layoutOpt.visualHints?.shape as string) ?? "classic";

  // Compute dashboard path based on layout
  const getDashPath = () => {
    switch (dashShape) {
      case "driver_focused":
        return "M70 148 Q200 125 530 155 L500 232 Q300 242 100 228 Z";
      case "minimalist":
        return "M80 155 Q300 148 520 155 L505 225 Q300 232 95 225 Z";
      default: // classic
        return "M70 150 Q300 130 530 150 L500 230 Q300 240 100 230 Z";
    }
  };

  // Compute center display width
  const getScreenWidth = () => {
    if (screenSize <= 0) return 0;
    if (screenSize <= 8) return 50;
    return 75;
  };

  return (
    <div className="idash-center-viewport">
      {/* Tab Navigation */}
      <div className="idash-tab-nav">
        <button className="idash-tab-btn">
          <span className="idash-tab-icon">🚗</span>
          EXTERIOR
        </button>
        <button className="idash-tab-btn active">
          <span className="idash-tab-icon">⚙</span>
          INTERIOR
        </button>
        <button className="idash-tab-btn">
          <span className="idash-tab-icon">⚡</span>
          ELECTRONICS
        </button>
      </div>

      {/* SVG Viewport Canvas */}
      <div className="idash-viewport-canvas">
        <svg
          id="idash-viewport-svg"
          viewBox="0 0 600 350"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="idash-svg"
        >
          {/* Windshield & Body Line */}
          <path
            d="M50 80 Q300 30 550 80 L520 280 Q300 310 80 280 Z"
            fill="#121722"
            stroke="#252f44"
            strokeWidth="3"
          />

          {/* Rearview Mirror */}
          <g transform="translate(280, 42)">
            <rect width="40" height="16" rx="3" fill="#0f1318" stroke="#334155" strokeWidth="1.5" />
            <rect x="3" y="3" width="34" height="10" rx="2" fill="#1c2536" opacity="0.6" />
          </g>

          {/* Dashboard Base — shape-responsive */}
          <path
            d={getDashPath()}
            fill="#1f2737"
            stroke="#334155"
            strokeWidth="2"
            style={{ transition: "d 0.4s ease" }}
          />

          {/* Ambient Light Strip */}
          <path
            d="M90 155 Q300 135 510 155"
            stroke={ambientEnabled ? ambientColor : "transparent"}
            strokeWidth="4"
            strokeLinecap="round"
            style={{
              filter: ambientEnabled ? `drop-shadow(0 0 8px ${ambientColor})` : "none",
              transition: "stroke 0.3s ease, filter 0.3s ease",
            }}
          />

          {/* Seats */}
          <rect
            x="90"
            y="160"
            width="130"
            height="130"
            rx="16"
            fill={interiorColor}
            stroke="#1a202c"
            strokeWidth="4"
            style={{ transition: "fill 0.3s ease" }}
          />
          {/* Seat detail stitching lines */}
          <line x1="115" y1="175" x2="115" y2="275" stroke="#ffffff15" strokeWidth="1" />
          <line x1="195" y1="175" x2="195" y2="275" stroke="#ffffff15" strokeWidth="1" />

          <rect
            x="380"
            y="160"
            width="130"
            height="130"
            rx="16"
            fill={interiorColor}
            stroke="#1a202c"
            strokeWidth="4"
            style={{ transition: "fill 0.3s ease" }}
          />
          <line x1="405" y1="175" x2="405" y2="275" stroke="#ffffff15" strokeWidth="1" />
          <line x1="485" y1="175" x2="485" y2="275" stroke="#ffffff15" strokeWidth="1" />

          {/* Instrument Cluster */}
          <g transform="translate(140, 140)">
            <rect
              width="110"
              height="42"
              rx="6"
              fill="#0b0e14"
              stroke="#475569"
              strokeWidth="2"
            />
            {clusterType === "analog" && (
              <>
                <circle cx="30" cy="21" r="14" stroke="#00e5ff" strokeWidth="2" fill="none" />
                <circle cx="80" cy="21" r="14" stroke="#00e5ff" strokeWidth="2" fill="none" />
                <line x1="30" y1="21" x2="38" y2="14" stroke="#00e5ff" strokeWidth="1.5" />
                <line x1="80" y1="21" x2="72" y2="12" stroke="#00e5ff" strokeWidth="1.5" />
              </>
            )}
            {clusterType === "digital" && (
              <>
                <rect x="6" y="6" width="98" height="30" rx="3" fill="#0284c7" opacity="0.7" />
                <text x="55" y="25" textAnchor="middle" fill="#00e5ff" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  120 km/h
                </text>
              </>
            )}
            {clusterType === "hud" && (
              <>
                <rect x="6" y="6" width="98" height="30" rx="3" fill="#059669" opacity="0.5" />
                <text x="55" y="18" textAnchor="middle" fill="#34d399" fontSize="9" fontFamily="monospace">
                  HUD
                </text>
                <text x="55" y="30" textAnchor="middle" fill="#34d399" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  ▲ 120
                </text>
              </>
            )}
          </g>

          {/* Center Infotainment Screen */}
          {screenSize > 0 && (
            <g transform="translate(265, 135)">
              <rect
                width={getScreenWidth()}
                height="48"
                rx="4"
                fill="#000"
                stroke="#475569"
                strokeWidth="2"
                style={{ transition: "width 0.3s ease" }}
              />
              <rect
                x="4"
                y="4"
                width={getScreenWidth() - 8}
                height="40"
                fill="#0284c7"
                opacity="0.7"
                style={{ transition: "width 0.3s ease" }}
              />
              <text
                x={getScreenWidth() / 2}
                y="28"
                textAnchor="middle"
                fill="#e0f2fe"
                fontSize="9"
                fontFamily="sans-serif"
              >
                NAV
              </text>
            </g>
          )}

          {/* Steering Wheel */}
          <g transform="translate(195, 218)">
            {/* Rim */}
            {spokeCount > 0 ? (
              <circle
                cx="0"
                cy="0"
                r="52"
                stroke="#374151"
                strokeWidth="12"
                fill="none"
              />
            ) : (
              /* Yoke — half-circle top open */
              <path
                d="M -45 15 Q -52 -35 0 -52 Q 52 -35 45 15"
                stroke="#374151"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
              />
            )}

            {/* Hub */}
            <circle cx="0" cy="0" r="18" fill="#111827" stroke="#4b5563" strokeWidth="2" />
            {/* BMW-style logo placeholder */}
            <circle cx="0" cy="0" r="8" fill="#1d4ed8" opacity="0.6" />

            {/* Spokes */}
            {(spokeCount === 2 || spokeCount === 3) && (
              <>
                <line x1="-46" y1="0" x2="-18" y2="0" stroke="#374151" strokeWidth="8" strokeLinecap="round" />
                <line x1="46" y1="0" x2="18" y2="0" stroke="#374151" strokeWidth="8" strokeLinecap="round" />
              </>
            )}
            {spokeCount === 3 && (
              <line x1="0" y1="18" x2="0" y2="46" stroke="#374151" strokeWidth="8" strokeLinecap="round" />
            )}
          </g>

          {/* Gear Shift / Center Console Area */}
          <rect x="268" y="200" width="64" height="80" rx="6" fill="#151b28" stroke="#2d3748" strokeWidth="1.5" />
          <rect x="282" y="210" width="36" height="24" rx="4" fill="#0f1318" stroke="#334155" strokeWidth="1" />
          <text x="300" y="227" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">
            D
          </text>

          {/* Cup Holders */}
          <circle cx="284" y="255" r="10" fill="#0b0f16" stroke="#2d3748" strokeWidth="1" />
          <circle cx="316" y="255" r="10" fill="#0b0f16" stroke="#2d3748" strokeWidth="1" />

          {/* Door Panel Accents */}
          <line x1="55" y1="110" x2="55" y2="275" stroke="#252f44" strokeWidth="2" />
          <line x1="545" y1="110" x2="545" y2="275" stroke="#252f44" strokeWidth="2" />

          {/* Ambient door strips */}
          {ambientEnabled && (
            <>
              <line
                x1="57" y1="130" x2="57" y2="260"
                stroke={ambientColor}
                strokeWidth="2"
                style={{ filter: `drop-shadow(0 0 4px ${ambientColor})` }}
              />
              <line
                x1="543" y1="130" x2="543" y2="260"
                stroke={ambientColor}
                strokeWidth="2"
                style={{ filter: `drop-shadow(0 0 4px ${ambientColor})` }}
              />
            </>
          )}
        </svg>
      </div>

      {/* Bottom Presets Carousel */}
      <div className="idash-presets-container">
        <div className="idash-section-title" style={{ marginBottom: 8 }}>
          INTERIOR PRESETS
        </div>
        <div className="idash-preset-list">
          {Object.entries(INTERIOR_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              className={`idash-preset-card ${activePreset === key ? "active" : ""}`}
              onClick={() => applyPreset(key)}
            >
              {/* Mini color preview */}
              <div
                className="idash-preset-swatch"
                style={{ backgroundColor: preset.color }}
              />
              <span className="idash-preset-name">{preset.name}</span>
            </button>
          ))}
        </div>
        <button className="idash-apply-btn">✓ APPLY &amp; CONTINUE</button>
        <div className="idash-apply-hint">
          Changes will be saved to your design
        </div>
      </div>
    </div>
  );
};
