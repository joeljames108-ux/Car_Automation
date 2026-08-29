// ===================================================================
// CFD AERODYNAMIC STREAMLINE FLOW OVERLAY (SVG)
// ===================================================================

import React from "react";

interface AeroStreamlineOverlayProps {
  isVisible?: boolean;
}

export const AeroStreamlineOverlay: React.FC<AeroStreamlineOverlayProps> = ({
  isVisible = true,
}) => {
  if (!isVisible) return null;

  return (
    <g id="cfd_streamlines_overlay" pointerEvents="none" opacity="0.75">
      {/* Streamline 1: Over Hood & Roof */}
      <path
        d="M 140 320 C 220 280, 380 180, 480 180 C 580 180, 720 240, 840 220"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="2.0"
        strokeDasharray="12 6"
        className="animate-pulse"
      />
      {/* Streamline 2: Underbody Venturi Suction */}
      <path
        d="M 150 370 C 260 380, 480 395, 740 390 C 780 385, 820 360, 860 350"
        fill="none"
        stroke="#22c55e"
        strokeWidth="2.5"
        strokeDasharray="8 4"
        className="animate-pulse"
      />
    </g>
  );
};
