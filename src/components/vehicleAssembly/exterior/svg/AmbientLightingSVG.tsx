// ===================================================================
// UNDERBODY AMBIENT GLOW & PUDDLE LIGHTS SVG ISOMETRIC RENDERER
// ===================================================================

import React from "react";

interface AmbientLightingSVGProps {
  glowColorHex?: string;
  isEnabled?: boolean;
}

export const AmbientLightingSVG: React.FC<AmbientLightingSVGProps> = ({
  glowColorHex = "#00f0ff",
  isEnabled = true,
}) => {
  if (!isEnabled) return null;

  return (
    <g id="underbody_ambient_glow_layer" pointerEvents="none">
      {/* Ground Floor Underbody Ambient Glow Oval */}
      <ellipse
        cx="480"
        cy="400"
        rx="260"
        ry="45"
        fill={glowColorHex}
        opacity="0.25"
        filter="url(#opticalLightBloom)"
      />
    </g>
  );
};
