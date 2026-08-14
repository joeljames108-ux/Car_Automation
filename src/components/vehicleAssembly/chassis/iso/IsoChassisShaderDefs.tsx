import React from "react";

export const IsoChassisShaderDefs: React.FC = () => (
  <defs>
    {/* 1. 3D Isometric Specular Top Lighting */}
    <linearGradient id="iso-chassis-top-light" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
      <stop offset="30%" stopColor="#f1f5f9" stopOpacity="0.9" />
      <stop offset="70%" stopColor="#cbd5e1" stopOpacity="0.8" />
      <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.7" />
    </linearGradient>

    {/* 2. 3D Isometric Left Metallic Shading */}
    <linearGradient id="iso-chassis-left-metallic" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#e2e8f0" />
      <stop offset="35%" stopColor="#cbd5e1" />
      <stop offset="70%" stopColor="#94a3b8" />
      <stop offset="100%" stopColor="#64748b" />
    </linearGradient>

    {/* 3. 3D Isometric Right Metallic Shading (Darker Specular) */}
    <linearGradient id="iso-chassis-right-metallic" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#94a3b8" />
      <stop offset="50%" stopColor="#64748b" />
      <stop offset="100%" stopColor="#475569" />
    </linearGradient>

    {/* 4. 3D Ambient Occlusion Inner Shadow */}
    <linearGradient id="iso-chassis-bottom-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#334155" />
      <stop offset="50%" stopColor="#1e293b" />
      <stop offset="100%" stopColor="#0f172a" />
    </linearGradient>

    {/* 5. 3D Carbon Fiber Twill Weave Pattern Tile */}
    <pattern id="iso-carbon-twill-3d" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect width="20" height="20" fill="#0b0f19" />
      <path d="M 0 0 L 10 10 L 20 0 L 10 -10 Z" fill="#1e293b" />
      <path d="M 10 10 L 20 20 L 30 10 L 20 0 Z" fill="#38bdf8" opacity="0.3" />
      <path d="M 0 20 L 10 30 L 20 20 L 10 10 Z" fill="#1e293b" />
      <path d="M -10 10 L 0 20 L 10 10 L 0 0 Z" fill="#090d16" />
    </pattern>

    {/* 6. Titanium Iridescent Weld Tint */}
    <linearGradient id="iso-titanium-weld-glow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#38bdf8" />
      <stop offset="25%" stopColor="#a855f7" />
      <stop offset="50%" stopColor="#ec4899" />
      <stop offset="75%" stopColor="#f59e0b" />
      <stop offset="100%" stopColor="#10b981" />
    </linearGradient>

    {/* 7. Extruded Aluminum Tube Gradient */}
    <linearGradient id="iso-al-tube-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#f8fafc" />
      <stop offset="40%" stopColor="#cbd5e1" />
      <stop offset="80%" stopColor="#64748b" />
      <stop offset="100%" stopColor="#334155" />
    </linearGradient>

    {/* 8. 3D Strut Tower Radial Shading */}
    <radialGradient id="iso-strut-dome-3d" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stopColor="#ffffff" />
      <stop offset="45%" stopColor="#cbd5e1" />
      <stop offset="80%" stopColor="#64748b" />
      <stop offset="100%" stopColor="#1e293b" />
    </radialGradient>

    {/* 9. Reusable 3D Swage Flange Hole */}
    <g id="iso-swage-hole-3d">
      <ellipse cx="0" cy="0" rx="11" ry="7" fill="#070a12" stroke="#cbd5e1" strokeWidth="1.6" />
      <ellipse cx="0" cy="0" rx="9" ry="5.5" fill="none" stroke="#475569" strokeWidth="1.2" />
      <ellipse cx="0" cy="0" rx="7" ry="4" fill="none" stroke="#1e293b" strokeWidth="0.8" />
    </g>
  </defs>
);
