import React from "react";

interface V12DynoHUDOverlayIsoProps {
  hasCover?: boolean;
  onToggleCover?: () => void;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * PHASE 23 — FLOATING GLASSMORPHIC SPEC HUD & TELEMETRY BADGES
 * ═══════════════════════════════════════════════════════════════════
 *
 * Floating Glassmorphic Specification HUD Callouts, Interactive Camera
 * Reticle Badge, and Live Dyno Telemetry matching the reference illustration.
 *
 * Visual & Telemetry Elements:
 *  1. Header Callout: "3D Isometric View: Racing-Spec V12 Engine & Integrated Dry-Sump System with Transmission"
 *  2. Right-Hand Specification Matrix with Custom Vector Glyph Icons:
 *     - Configuration: 60° V12
 *     - Displacement: 6.5L
 *     - Fuel: Direct Injection (350 Bar GDI)
 *     - Max RPM: 11,000 RPM
 *     - Lubrication: Dry Sump (4-Stage Scavenge)
 *     - Sump Tank: Inline Filtration
 *  3. Interactive Camera Control Orb Badge on Left Podium Stanchion
 *  4. Quick Engine Cover Mode Switcher Pill ("With Cover" / "Without Cover")
 */
export const V12DynoHUDOverlayIso: React.FC<V12DynoHUDOverlayIsoProps> = ({
  hasCover = false,
  onToggleCover,
}) => {
  return (
    <g id="v12-dyno-hud-overlay">
      {/* ── 1. DEFINITIONS FOR HUD GRADIENTS ── */}
      <defs>
        <linearGradient id="v12-hud-title-glass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.88" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.85" />
        </linearGradient>

        <linearGradient id="v12-hud-spec-card" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0.92" />
        </linearGradient>
      </defs>

      {/* ── 2. TOP CENTER HEADER SPEC CALLOUT BADGE ── */}
      <g id="v12-hud-header-badge" transform="translate(145, 12)">
        {/* Soft Drop Shadow */}
        <rect x="0" y="3" width="220" height="26" rx="8" fill="#000000" opacity="0.45" />

        {/* Glossy Sky-Blue Glassmorphic Plaque */}
        <rect
          x="0"
          y="0"
          width="220"
          height="26"
          rx="8"
          fill="url(#v12-hud-title-glass)"
          stroke="#e0f2fe"
          strokeWidth="1.2"
        />

        {/* Camera Icon Glyph */}
        <g transform="translate(10, 6)">
          <rect x="0" y="3" width="14" height="10" rx="2" fill="#090d16" stroke="#ffffff" strokeWidth="0.8" />
          <circle cx="7" cy="8" r="3" fill="none" stroke="#38bdf8" strokeWidth="1.0" />
          <rect x="4" y="1" width="4" height="2" fill="#090d16" />
        </g>

        {/* Title Text */}
        <text x="32" y="10.5" fill="#082f49" fontSize="6.2" fontFamily="sans-serif" fontWeight="bold">
          3D Isometric View:
        </text>
        <text x="32" y="19" fill="#0f172a" fontSize="5.4" fontFamily="sans-serif" fontWeight="600">
          Racing-Spec V12 Engine & Integrated Dry-Sump
        </text>
      </g>

      {/* ── 3. RIGHT-HAND SPECIFICATION MATRIX ── */}
      <g id="v12-hud-specs-panel" transform="translate(372, 38)">
        {/* Specs Panel Card */}
        <rect
          x="0"
          y="0"
          width="118"
          height="148"
          rx="6"
          fill="url(#v12-hud-spec-card)"
          stroke="#1e293b"
          strokeWidth="1.0"
        />

        {/* 6 Spec Data Rows matching illustration */}
        {[
          { label: "Configuration:", value: "60° V12", icon: "⚙️" },
          { label: "Displacement:", value: "6.5L", icon: "🏎️" },
          { label: "Fuel:", value: "Direct Injection", icon: "⛽" },
          { label: "Max RPM:", value: "11,000", icon: "⏱️" },
          { label: "Lubrication:", value: "Dry Sump", icon: "💧" },
          { label: "Sump Tank:", value: "Inline Filtration", icon: "🛢️" },
        ].map((item, idx) => {
          const rowY = 16 + idx * 22;
          return (
            <g key={`spec-row-${idx}`} transform={`translate(8, ${rowY})`}>
              {/* Glyph Icon */}
              <text x="0" y="8" fontSize="8">{item.icon}</text>
              {/* Spec Label */}
              <text x="14" y="4" fill="#94a3b8" fontSize="4.8" fontFamily="monospace">
                {item.label}
              </text>
              {/* Spec Value */}
              <text x="14" y="12" fill="#f8fafc" fontSize="5.5" fontFamily="monospace" fontWeight="bold">
                {item.value}
              </text>
              {/* Separator Line */}
              {idx < 5 && <line x1="0" y1="17" x2="102" y2="17" stroke="#1e293b" strokeWidth="0.6" />}
            </g>
          );
        })}
      </g>

      {/* ── 4. INTERACTIVE CAMERA CONTROL RETICLE BADGE (LEFT) ── */}
      <g id="v12-hud-camera-orb" transform="translate(18, 160)">
        {/* Chrome Stand Base */}
        <ellipse cx="20" cy="56" rx="16" ry="8" fill="#475569" stroke="#090d16" strokeWidth="1.2" />
        <ellipse cx="20" cy="53" rx="12" ry="6" fill="#94a3b8" />

        {/* Circular Gyroscope Gimbal Ring */}
        <circle cx="20" cy="28" r="22" fill="none" stroke="#cbd5e1" strokeWidth="2.4" />
        <circle cx="20" cy="28" r="18" fill="none" stroke="#475569" strokeWidth="1.2" />

        {/* Camera Lens Eye Hub */}
        <circle cx="20" cy="28" r="10" fill="#090d16" stroke="#38bdf8" strokeWidth="1.6" />
        <circle cx="20" cy="28" r="4.5" fill="#0284c7" />

        {/* Orange Grip Clips */}
        <circle cx="12" cy="10" r="3.0" fill="#ea580c" />
        <circle cx="28" cy="10" r="3.0" fill="#ea580c" />
      </g>

      {/* ── 5. QUICK ENGINE COVER MODE TOGGLE PILL ── */}
      <g
        id="v12-hud-cover-toggle"
        transform="translate(155, 340)"
        onClick={() => onToggleCover?.()}
        className="cursor-pointer"
      >
        <rect
          x="0"
          y="0"
          width="190"
          height="24"
          rx="12"
          fill="#090d16"
          stroke={hasCover ? "#facc15" : "#38bdf8"}
          strokeWidth="1.4"
        />
        <text
          x="95"
          y="15.5"
          fill={hasCover ? "#fde047" : "#e0f2fe"}
          fontSize="6.2"
          fontFamily="monospace"
          fontWeight="bold"
          textAnchor="middle"
        >
          {hasCover ? "✦ MODE: WITH ENGINE COVER (CLICK TO STRIP)" : "✦ MODE: WITHOUT ENGINE COVER (CLICK TO DRESS)"}
        </text>
      </g>
    </g>
  );
};
