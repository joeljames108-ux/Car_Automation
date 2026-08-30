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
      <path d="M 6 6 L 12 12 L 18 6 L 12 0 Z" fill="#fbbf24" opacity="0.25" />
      <path d="M 0 12 L 6 18 L 12 12 L 6 6 Z" fill="#1e293b" />
      <path d="M -6 6 L 0 12 L 6 6 L 0 0 Z" fill="#1a1008" />
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
      <stop offset="0%" stopColor="#d97706" />
      <stop offset="25%" stopColor="#f59e0b" />
      <stop offset="50%" stopColor="#d97706" />
      <stop offset="75%" stopColor="#f59e0b" />
      <stop offset="100%" stopColor="#10b981" />
    </linearGradient>

    {/* 6. Deep Cockpit Inner Cavity Shading */}
    <linearGradient id="biw-inner-cavity-dark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#1e293b" />
      <stop offset="40%" stopColor="#1a1008" />
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
      <stop offset="85%" stopColor="#1a1008" />
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
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1008" strokeWidth="1" opacity="0.4" />
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

    {/* 16. Finite Element Analysis (FEA) Von Mises Stress Spectrum Gradient */}
    <linearGradient id="fea-stress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#1e3a8a" />   {/* 0-100 MPa: Elastic Minimal (Navy Blue) */}
      <stop offset="25%" stopColor="#0284c7" />  {/* 100-250 MPa: Low Load (Sky Blue) */}
      <stop offset="50%" stopColor="#10b981" />  {/* 250-400 MPa: Nominal Operating (Emerald Green) */}
      <stop offset="70%" stopColor="#eab308" />  {/* 400-550 MPa: High Stress Yield Warning (Yellow) */}
      <stop offset="88%" stopColor="#f97316" />  {/* 550-700 MPa: High Plastic Shear (Orange) */}
      <stop offset="100%" stopColor="#ef4444" /> {/* 700+ MPa: Critical Yield Hotspot (Neon Red) */}
    </linearGradient>

    {/* 17. FEA Radial Node Stress Glow */}
    <radialGradient id="fea-node-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
      <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.6" />
      <stop offset="80%" stopColor="#0284c7" stopOpacity="0.2" />
      <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
    </radialGradient>

    {/* 18. FEA Triangular Mesh Overlay Pattern */}
    <pattern id="fea-tri-mesh" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 0 0 L 30 0 L 15 30 Z M 30 0 L 30 30 L 15 30 Z" fill="none" stroke="#fbbf24" strokeWidth="0.6" opacity="0.35" />
    </pattern>
  </defs>
);

