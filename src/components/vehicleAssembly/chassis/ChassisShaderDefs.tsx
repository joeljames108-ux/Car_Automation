import React from "react";

export const ChassisShaderDefs: React.FC = () => (
  <defs>
    {/* 1. Carbon Fiber Twill 2x2 Pattern */}
    <pattern id="carbon-twill-2x2" width="16" height="16" patternUnits="userSpaceOnUse">
      <rect width="16" height="16" fill="#0f172a" />
      <path d="M 0 0 L 8 8 L 16 0 L 8 -8 Z" fill="#1e293b" />
      <path d="M 8 8 L 16 16 L 24 8 L 16 0 Z" fill="#334155" />
      <path d="M 0 16 L 8 24 L 16 16 L 8 8 Z" fill="#1e293b" />
      <path d="M -8 8 L 0 16 L 8 8 L 0 0 Z" fill="#0b0f19" />
    </pattern>

    {/* 2. Brushed Aluminum Metallic Gradient */}
    <linearGradient id="al-brushed-metallic" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#ffffff" />
      <stop offset="20%" stopColor="#f1f5f9" />
      <stop offset="45%" stopColor="#cbd5e1" />
      <stop offset="70%" stopColor="#94a3b8" />
      <stop offset="100%" stopColor="#475569" />
    </linearGradient>

    {/* 3. Titanium Weld Heat-Tint Iridescent Gradient */}
    <linearGradient id="titanium-weld-tint" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#3b82f6" />
      <stop offset="33%" stopColor="#a855f7" />
      <stop offset="66%" stopColor="#f59e0b" />
      <stop offset="100%" stopColor="#e11d48" />
    </linearGradient>

    {/* 4. Shoulder Character Line Specular Reflection */}
    <linearGradient id="biw-shoulder-specular" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
      <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
      <stop offset="100%" stopColor="rgba(255,255,255,0.75)" />
    </linearGradient>

    {/* 5. Inner Body Cavity Shadow Gradient */}
    <linearGradient id="biw-inner-cavity-dark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#334155" />
      <stop offset="50%" stopColor="#1e293b" />
      <stop offset="100%" stopColor="#0f172a" />
    </linearGradient>

    {/* 6. Extruded Aluminum Frame Rail Gradient */}
    <linearGradient id="al-extrusion-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#cbd5e1" />
      <stop offset="30%" stopColor="#f8fafc" />
      <stop offset="70%" stopColor="#94a3b8" />
      <stop offset="100%" stopColor="#475569" />
    </linearGradient>

    {/* 7. Strut Dome Shading Radial */}
    <radialGradient id="strut-dome-shader" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stopColor="#ffffff" />
      <stop offset="50%" stopColor="#cbd5e1" />
      <stop offset="85%" stopColor="#64748b" />
      <stop offset="100%" stopColor="#1e293b" />
    </radialGradient>

    {/* 8. TIG Weld Overlap Bead Pattern */}
    <pattern id="tig-weld-bead" width="6" height="6" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="2.8" fill="none" stroke="#cbd5e1" strokeWidth="0.8" opacity="0.7" />
    </pattern>

    {/* 9. FEA Stress Colors */}
    <linearGradient id="fea-stress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#3b82f6" />
      <stop offset="35%" stopColor="#10b981" />
      <stop offset="70%" stopColor="#f59e0b" />
      <stop offset="100%" stopColor="#ef4444" />
    </linearGradient>

    {/* 10. Reusable Stamped Swage Flange Hole (Large) */}
    <g id="swage-hole-deep">
      <ellipse cx="0" cy="0" rx="10" ry="6.5" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
      <ellipse cx="0" cy="0" rx="8.5" ry="5" fill="none" stroke="#64748b" strokeWidth="1" />
    </g>

    {/* 11. Reusable Stamped Swage Flange Hole (Small) */}
    <g id="swage-hole-sm-deep">
      <circle cx="0" cy="0" r="5" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.2" />
      <circle cx="0" cy="0" r="4.2" fill="none" stroke="#64748b" strokeWidth="0.8" />
    </g>
  </defs>
);
