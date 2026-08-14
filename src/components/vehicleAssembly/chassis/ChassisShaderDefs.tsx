import React from "react";

export const ChassisShaderDefs: React.FC = () => (
  <defs>
    {/* 1. High-Fidelity HDR Metallic Steel Body Gradient */}
    <linearGradient id="biw-hdr-silver-body" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#ffffff" />
      <stop offset="8%" stopColor="#f8fafc" />
      <stop offset="22%" stopColor="#e2e8f0" />
      <stop offset="42%" stopColor="#cbd5e1" />
      <stop offset="68%" stopColor="#94a3b8" />
      <stop offset="88%" stopColor="#64748b" />
      <stop offset="100%" stopColor="#334155" />
    </linearGradient>

    {/* 2. Shoulder Character Line Specular Highlight (Curvature Reflection) */}
    <linearGradient id="biw-shoulder-specular-glow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
      <stop offset="25%" stopColor="rgba(255,255,255,0.4)" />
      <stop offset="60%" stopColor="rgba(255,255,255,0.9)" />
      <stop offset="100%" stopColor="rgba(255,255,255,0.6)" />
    </linearGradient>

    {/* 3. Carbon Fiber Twill 2x2 Pattern HD */}
    <pattern id="carbon-twill-2x2" width="12" height="12" patternUnits="userSpaceOnUse">
      <rect width="12" height="12" fill="#0b0f19" />
      <path d="M 0 0 L 6 6 L 12 0 L 6 -6 Z" fill="#1e293b" />
      <path d="M 6 6 L 12 12 L 18 6 L 12 0 Z" fill="#38bdf8" opacity="0.25" />
      <path d="M 0 12 L 6 18 L 12 12 L 6 6 Z" fill="#1e293b" />
      <path d="M -6 6 L 0 12 L 6 6 L 0 0 Z" fill="#0f172a" />
    </pattern>

    {/* 4. Brushed Aluminum Metallic Gradient */}
    <linearGradient id="al-brushed-metallic" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#ffffff" />
      <stop offset="15%" stopColor="#f1f5f9" />
      <stop offset="45%" stopColor="#cbd5e1" />
      <stop offset="75%" stopColor="#94a3b8" />
      <stop offset="100%" stopColor="#475569" />
    </linearGradient>

    {/* 5. Titanium Weld Heat-Tint Iridescent Gradient */}
    <linearGradient id="titanium-weld-tint" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#3b82f6" />
      <stop offset="25%" stopColor="#a855f7" />
      <stop offset="50%" stopColor="#ec4899" />
      <stop offset="75%" stopColor="#f59e0b" />
      <stop offset="100%" stopColor="#10b981" />
    </linearGradient>

    {/* 6. Deep Cockpit Inner Cavity Shading */}
    <linearGradient id="biw-inner-cavity-dark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#1e293b" />
      <stop offset="40%" stopColor="#0f172a" />
      <stop offset="100%" stopColor="#020617" />
    </linearGradient>

    {/* 7. Extruded Aluminum Frame Rail Gradient */}
    <linearGradient id="al-extrusion-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#94a3b8" />
      <stop offset="25%" stopColor="#f8fafc" />
      <stop offset="65%" stopColor="#cbd5e1" />
      <stop offset="100%" stopColor="#475569" />
    </linearGradient>

    {/* 8. Strut Dome Shading Radial */}
    <radialGradient id="strut-dome-shader" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stopColor="#ffffff" />
      <stop offset="50%" stopColor="#cbd5e1" />
      <stop offset="85%" stopColor="#64748b" />
      <stop offset="100%" stopColor="#1e293b" />
    </radialGradient>

    {/* 9. Rubber Tyre Sidewall Radial Shading */}
    <radialGradient id="tire-rubber-sidewall-hd" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stopColor="#334155" />
      <stop offset="50%" stopColor="#1e293b" />
      <stop offset="85%" stopColor="#0f172a" />
      <stop offset="100%" stopColor="#020617" />
    </radialGradient>

    {/* 10. Metallic Alloy Rim Specular Gradient */}
    <linearGradient id="rim-alloy-chrome-hdr" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#ffffff" />
      <stop offset="25%" stopColor="#e2e8f0" />
      <stop offset="50%" stopColor="#94a3b8" />
      <stop offset="75%" stopColor="#cbd5e1" />
      <stop offset="100%" stopColor="#475569" />
    </linearGradient>

    {/* 11. Cross-Drilled Steel Brake Rotor Metallic Friction Ring */}
    <radialGradient id="brake-rotor-ring-hdr" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#1e293b" />
      <stop offset="60%" stopColor="#cbd5e1" />
      <stop offset="75%" stopColor="#f1f5f9" />
      <stop offset="90%" stopColor="#94a3b8" />
      <stop offset="100%" stopColor="#475569" />
    </radialGradient>

    {/* 12. Brembo Red Caliper Gloss Gradient */}
    <linearGradient id="caliper-brembo-red" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#f87171" />
      <stop offset="35%" stopColor="#ef4444" />
      <stop offset="70%" stopColor="#b91c1c" />
      <stop offset="100%" stopColor="#7f1d1d" />
    </linearGradient>

    {/* 13. High-Contrast CAD Blueprint Grid */}
    <pattern id="cad-grid-sleek" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0f172a" strokeWidth="1" opacity="0.4" />
      <path d="M 20 0 L 20 40 M 0 20 L 40 20" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
    </pattern>

    {/* 14. Soft Ground Contact Shadow Filter */}
    <filter id="ground-contact-blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" />
    </filter>

    {/* 15. Body Panel Ambient Occlusion Shadow Filter */}
    <filter id="panel-ambient-occlusion" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#020617" floodOpacity="0.6" />
    </filter>

    {/* Reusable Stamped Swage Flange Hole (Large) */}
    <g id="swage-hole-deep">
      <ellipse cx="0" cy="0" rx="10" ry="6.5" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
      <ellipse cx="0" cy="0" rx="8.5" ry="5" fill="none" stroke="#64748b" strokeWidth="1" />
    </g>

    {/* Reusable Stamped Swage Flange Hole (Small) */}
    <g id="swage-hole-sm-deep">
      <circle cx="0" cy="0" r="5" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.2" />
      <circle cx="0" cy="0" r="4.2" fill="none" stroke="#64748b" strokeWidth="0.8" />
    </g>
  </defs>
);

