// ===================================================================
// SUSPENSION KINEMATICS & GEOMETRY HUD OVERLAY
// ===================================================================
// Technical CAD vectors displaying front/rear roll centers, roll axis,
// virtual swing arm instant centers, and anti-dive vectors.
// ===================================================================

import React from "react";

interface SuspensionGeometryOverlayProps {
  isVisible?: boolean;
}

export const SuspensionGeometryOverlay: React.FC<SuspensionGeometryOverlayProps> = ({
  isVisible = false,
}) => {
  if (!isVisible) return null;

  return (
    <g id="suspension_kinematics_hud_overlay" pointerEvents="none">
      {/* ── 1. Front Roll Center Point & Vectors ── */}
      <line x1="240" y1="330" x2="160" y2="380" stroke="#0284c7" strokeWidth="0.8" strokeDasharray="3 3" />
      <line x1="225" y1="355" x2="160" y2="380" stroke="#0284c7" strokeWidth="0.8" strokeDasharray="3 3" />
      {/* Instant Center (IC Front) */}
      <circle cx="160" cy="380" r="3.5" fill="#fbbf24" />
      <text x="145" y="375" fill="#fbbf24" fontSize="8" fontFamily="monospace">IC_F</text>

      {/* Front Roll Center */}
      <circle cx="265" cy="365" r="4.5" fill="#f59e0b" />
      <text x="250" y="380" fill="#f59e0b" fontSize="8" fontFamily="monospace">RC_F (55mm)</text>

      {/* ── 2. Rear Roll Center Point & Vectors ── */}
      <circle cx="695" cy="360" r="4.5" fill="#f59e0b" />
      <text x="680" y="375" fill="#f59e0b" fontSize="8" fontFamily="monospace">RC_R (85mm)</text>

      {/* ── 3. Vehicle Roll Axis Line (Connecting Front to Rear RC) ── */}
      <line x1="265" y1="365" x2="695" y2="360" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 4" />
    </g>
  );
};
