import React from "react";

/**
 * Photorealistic 3D Engine Block SVG Shaders, Filters & Texture Defs
 * Implements ambient occlusion, metallic specular chamfers, cast iron noise filters,
 * honing crosshatch patterns, and multi-stop depth gradients.
 */
export const IsoBlockShaderDefs: React.FC = () => {
  return (
    <defs>
      {/* ── 1. CAST METALLIC SURFACE TEXTURE FILTER ── */}
      <filter id="cast-iron-texture" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
        <feColorMatrix type="matrix" values="0.15 0 0 0 0  0.15 0 0 0 0  0.15 0 0 0 0  0.12 0 0 0 0" result="darkNoise" />
        <feBlend in="SourceGraphic" in2="darkNoise" mode="multiply" />
      </filter>

      <filter id="machined-aluminum-texture" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="turbulence" baseFrequency="0.05 0.95" numOctaves="2" result="brushed" />
        <feColorMatrix type="matrix" values="0.2 0 0 0 0  0.2 0 0 0 0  0.25 0 0 0 0  0.08 0 0 0 0" result="brushAlpha" />
        <feBlend in="SourceGraphic" in2="brushAlpha" mode="overlay" />
      </filter>

      <filter id="soft-ao-shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComponentTransfer in="blur" result="shadow">
          <feFuncA type="linear" slope="0.6" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode in="shadow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* ── 2. DEEP CYLINDER BORE RADIAL SHADERS ── */}
      <radialGradient id="bore-3d-depth" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#475569" stopOpacity="0.9" />
        <stop offset="25%" stopColor="#1e293b" stopOpacity="0.95" />
        <stop offset="60%" stopColor="#0f172a" stopOpacity="1" />
        <stop offset="85%" stopColor="#020617" stopOpacity="1" />
        <stop offset="100%" stopColor="#000000" stopOpacity="1" />
      </radialGradient>

      {/* ── 3. V-BANK WALL & DECK GRADIENTS ── */}
      <linearGradient id="v-bank-left-wall" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="35%" stopColor="#475569" />
        <stop offset="70%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>

      <linearGradient id="v-bank-right-wall" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="45%" stopColor="#1e293b" />
        <stop offset="80%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>

      <linearGradient id="v-deck-surface-left" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="40%" stopColor="#94a3b8" />
        <stop offset="75%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>

      <linearGradient id="v-deck-surface-right" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="50%" stopColor="#64748b" />
        <stop offset="85%" stopColor="#475569" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>

      <radialGradient id="v-valley-floor" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="40%" stopColor="#0f172a" />
        <stop offset="85%" stopColor="#020617" />
        <stop offset="100%" stopColor="#000000" />
      </radialGradient>

      <linearGradient id="bore-wall-thickness" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="40%" stopColor="#94a3b8" />
        <stop offset="80%" stopColor="#475569" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>

      <linearGradient id="lifting-bracket-cast" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="45%" stopColor="#475569" />
        <stop offset="85%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#090d16" />
      </linearGradient>

      {/* ── 9. FORGED H-BEAM CONNECTING ROD SHADERS ── */}
      <linearGradient id="rod-hbeam-shank" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="25%" stopColor="#94a3b8" />
        <stop offset="60%" stopColor="#475569" />
        <stop offset="85%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>

      <linearGradient id="rod-recessed-channel" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="50%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>

      <radialGradient id="wrist-pin-bushing-bronze" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="45%" stopColor="#d97706" />
        <stop offset="85%" stopColor="#92400e" />
        <stop offset="100%" stopColor="#451a03" />
      </radialGradient>

      <linearGradient id="wrist-pin-dlc-chrome" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="30%" stopColor="#38bdf8" />
        <stop offset="55%" stopColor="#0f172a" />
        <stop offset="80%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>

      <radialGradient id="arp-bolt-head-12pt" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="30%" stopColor="#94a3b8" />
        <stop offset="70%" stopColor="#334155" />
        <stop offset="100%" stopColor="#090d16" />
      </radialGradient>

      {/* ── 10. MULTI-LAYER STEEL (MLS) CYLINDER HEAD GASKET SHADERS ── */}
      <linearGradient id="mls-copper-plate" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffedd5" />
        <stop offset="30%" stopColor="#f97316" />
        <stop offset="70%" stopColor="#c2410c" />
        <stop offset="100%" stopColor="#7c2d12" />
      </linearGradient>

      <linearGradient id="viton-elastomer-bead" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#155e75" />
        <stop offset="50%" stopColor="#0891b2" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>

      <linearGradient id="firering-stainless-emboss" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="40%" stopColor="#e2e8f0" />
        <stop offset="75%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>

      <radialGradient id="bore-rim-specular" cx="45%" cy="40%" r="55%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="35%" stopColor="#cbd5e1" stopOpacity="0.8" />
        <stop offset="70%" stopColor="#64748b" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
      </radialGradient>

      {/* Honing Pattern inside bores */}
      <pattern id="honing-crosshatch-pattern" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
        <line x1="0" y1="0" x2="12" y2="12" stroke="#64748b" strokeWidth="0.6" strokeOpacity="0.3" />
        <line x1="0" y1="12" x2="12" y2="0" stroke="#64748b" strokeWidth="0.6" strokeOpacity="0.3" />
      </pattern>

      {/* ── 3. MAIN BEARING SADDLE & JOURNAL SHADERS ── */}
      <linearGradient id="bearing-saddle-chrome" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="20%" stopColor="#94a3b8" />
        <stop offset="45%" stopColor="#1e293b" />
        <stop offset="70%" stopColor="#e2e8f0" />
        <stop offset="90%" stopColor="#475569" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>

      <linearGradient id="journal-oil-hole" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#020617" />
        <stop offset="50%" stopColor="#090d16" />
        <stop offset="100%" stopColor="#000000" />
      </linearGradient>

      {/* ── 4. TRAPEZOIDAL RIB SHADERS (TOP / LEFT / RIGHT FACES) ── */}
      <linearGradient id="rib-face-light" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="40%" stopColor="#94a3b8" />
        <stop offset="80%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>

      <linearGradient id="rib-face-mid" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="50%" stopColor="#475569" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>

      <linearGradient id="rib-face-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="50%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>

      {/* ── 5. RAISED BOLT BOSS & HEX SOCKET SHADERS ── */}
      <radialGradient id="bolt-boss-raised" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="50%" stopColor="#64748b" />
        <stop offset="85%" stopColor="#334155" />
        <stop offset="100%" stopColor="#0f172a" />
      </radialGradient>

      <radialGradient id="hex-socket-recess" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#000000" />
        <stop offset="70%" stopColor="#090d16" />
        <stop offset="100%" stopColor="#334155" />
      </radialGradient>

      {/* ── 6. COOLANT WATER JACKET OPENING SHADERS ── */}
      <linearGradient id="water-jacket-opening" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#083344" />
        <stop offset="50%" stopColor="#0e7490" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>

      {/* ── 7. OIL PAN STAMPED STEEL SUMP TRAY SHADERS ── */}
      <linearGradient id="oil-pan-top-lip" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="50%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>

      <linearGradient id="oil-pan-front-face" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="40%" stopColor="#cbd5e1" />
        <stop offset="85%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>

      <linearGradient id="oil-pan-side-face" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="60%" stopColor="#475569" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>

      {/* ── 8. SPECULAR EDGE HIGHLIGHTS ── */}
      <linearGradient id="specular-edge-bright" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="50%" stopColor="#ffffff" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>

      <linearGradient id="specular-edge-vertical" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="30%" stopColor="#e2e8f0" stopOpacity="0.7" />
        <stop offset="70%" stopColor="#94a3b8" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>

      {/* ── V12 BLOCK-SPECIFIC SHADERS ── */}

      {/* Cast aluminium body — dark gunmetal matte casting texture */}
      <linearGradient id="v12-cast-aluminum-body" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#768a9e" />
        <stop offset="20%" stopColor="#5a6d84" />
        <stop offset="50%" stopColor="#44566c" />
        <stop offset="75%" stopColor="#303f52" />
        <stop offset="100%" stopColor="#1f2e40" />
      </linearGradient>

      {/* Cast aluminium body — right side (darker for 3D depth) */}
      <linearGradient id="v12-cast-aluminum-body-right" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#44566c" />
        <stop offset="30%" stopColor="#303f52" />
        <stop offset="65%" stopColor="#1f2e40" />
        <stop offset="100%" stopColor="#131f30" />
      </linearGradient>

      {/* Bright silver machined deck surface */}
      <linearGradient id="v12-machined-deck" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e8edf4" />
        <stop offset="25%" stopColor="#c8d2e0" />
        <stop offset="55%" stopColor="#a0afc4" />
        <stop offset="80%" stopColor="#7a8da6" />
        <stop offset="100%" stopColor="#5d7090" />
      </linearGradient>

      {/* Deep crankcase lower section — heavy shadow */}
      <linearGradient id="v12-crankcase-deep" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4a5a70" />
        <stop offset="30%" stopColor="#334155" />
        <stop offset="65%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>

      {/* Deep crankcase right face */}
      <linearGradient id="v12-crankcase-deep-right" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="40%" stopColor="#1e293b" />
        <stop offset="75%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#090d16" />
      </linearGradient>

      {/* Valley ambient occlusion shadow */}
      <radialGradient id="v12-valley-shadow" cx="50%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#2a3a4e" />
        <stop offset="30%" stopColor="#1a2535" />
        <stop offset="60%" stopColor="#0f172a" />
        <stop offset="85%" stopColor="#060c18" />
        <stop offset="100%" stopColor="#020408" />
      </radialGradient>

      {/* Front timing cover face */}
      <linearGradient id="v12-timing-cover-face" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#7a8da6" />
        <stop offset="35%" stopColor="#5d7090" />
        <stop offset="70%" stopColor="#3d4d63" />
        <stop offset="100%" stopColor="#2a3a4e" />
      </linearGradient>

      {/* Rear transmission flange — flat machined */}
      <linearGradient id="v12-transmission-flange" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#c8d2e0" />
        <stop offset="40%" stopColor="#94a3b8" />
        <stop offset="75%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>

      {/* Cast reinforcement rib surface */}
      <linearGradient id="v12-rib-cast-surface" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7a8da6" />
        <stop offset="45%" stopColor="#5d7090" />
        <stop offset="80%" stopColor="#3d4d63" />
        <stop offset="100%" stopColor="#2a3a4e" />
      </linearGradient>

      {/* Main bearing cap steel finish */}
      <radialGradient id="v12-bearing-cap" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="35%" stopColor="#64748b" />
        <stop offset="70%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1e293b" />
      </radialGradient>

      {/* Crankshaft tunnel bore darkness */}
      <radialGradient id="v12-crank-tunnel-bore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="40%" stopColor="#0f172a" />
        <stop offset="80%" stopColor="#060c18" />
        <stop offset="100%" stopColor="#000000" />
      </radialGradient>

      {/* ── GOLD ANODIZED ACCENT BOLT ── */}
      <radialGradient id="gold-anodized-bolt" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#fde68a" />
        <stop offset="25%" stopColor="#f59e0b" />
        <stop offset="55%" stopColor="#d97706" />
        <stop offset="80%" stopColor="#b45309" />
        <stop offset="100%" stopColor="#78350f" />
      </radialGradient>

      {/* ── CHROME POLISHED VELOCITY STACK TRUMPET ── */}
      <linearGradient id="chrome-polished-trumpet" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
        <stop offset="15%" stopColor="#e2e8f0" />
        <stop offset="35%" stopColor="#64748b" />
        <stop offset="50%" stopColor="#f1f5f9" />
        <stop offset="65%" stopColor="#334155" />
        <stop offset="80%" stopColor="#cbd5e1" />
        <stop offset="95%" stopColor="#475569" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>

      {/* ── VELOCITY STACK BELLMOUTH (radial — inside of trumpet) ── */}
      <radialGradient id="velocity-stack-bellmouth" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.7" />
        <stop offset="30%" stopColor="#334155" />
        <stop offset="65%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#000000" />
      </radialGradient>

      {/* ── BRASS BUTTERFLY VALVE DISC ── */}
      <linearGradient id="brass-butterfly-disc" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="30%" stopColor="#fbbf24" />
        <stop offset="60%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#92400e" />
      </linearGradient>

      {/* ── ANODIZED FUEL RAIL (deep red/orange) ── */}
      <linearGradient id="anodized-fuel-rail" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fca5a5" />
        <stop offset="25%" stopColor="#ef4444" />
        <stop offset="60%" stopColor="#b91c1c" />
        <stop offset="100%" stopColor="#7f1d1d" />
      </linearGradient>

      {/* ── TURBO VOLUTE CAST IRON ── */}
      <linearGradient id="turbo-volute-cast-iron" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6b7280" />
        <stop offset="30%" stopColor="#4b5563" />
        <stop offset="60%" stopColor="#374151" />
        <stop offset="100%" stopColor="#1f2937" />
      </linearGradient>

      {/* ── OIL PAN COOLING FIN CHANNEL ── */}
      <linearGradient id="cooling-fin-channel" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="50%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#060c18" />
      </linearGradient>

      {/* ── CEL-SHADED TECHNICAL ILLUSTRATION GRADIENTS ── */}

      {/* Electric Blue Anodized Velocity Stack Rim Lip */}
      <linearGradient id="electric-blue-lip" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7dd3fc" />
        <stop offset="30%" stopColor="#0284c7" />
        <stop offset="70%" stopColor="#0369a1" />
        <stop offset="100%" stopColor="#0c4a6e" />
      </linearGradient>

      {/* Blue Cylinder Sleeve Ring Accent */}
      <linearGradient id="blue-sleeve-ring" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="40%" stopColor="#0284c7" />
        <stop offset="80%" stopColor="#075985" />
        <stop offset="100%" stopColor="#0c4a6e" />
      </linearGradient>

      {/* Cel-Shaded Steel Engine Block Surface */}
      <linearGradient id="cel-steel-block" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="25%" stopColor="#475569" />
        <stop offset="60%" stopColor="#334155" />
        <stop offset="85%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>

      {/* Bright Orange/Copper Accent Gasket Line */}
      <linearGradient id="orange-gasket-line" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fb923c" />
        <stop offset="50%" stopColor="#ea580c" />
        <stop offset="100%" stopColor="#9a3412" />
      </linearGradient>

      {/* Bright Yellow Dipstick / Fitting Accent */}
      <radialGradient id="yellow-dipstick-accent" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="40%" stopColor="#eab308" />
        <stop offset="85%" stopColor="#ca8a04" />
        <stop offset="100%" stopColor="#854d0e" />
      </radialGradient>

      {/* Camshaft Lobed Journal Steel */}
      <linearGradient id="camshaft-steel-journal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="25%" stopColor="#cbd5e1" />
        <stop offset="55%" stopColor="#64748b" />
        <stop offset="80%" stopColor="#334155" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>

      {/* ── 10. HONING CROSS-HATCH PATTERN FOR CYLINDER BORE REALISM ── */}
      <pattern id="honing-crosshatch" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
        <path d="M 0 0 L 12 12 M 12 0 L 0 12" stroke="#38bdf8" strokeWidth="0.8" opacity="0.3" />
      </pattern>

      {/* ── 11. TITANIUM & EXHAUST HEAT PATINA GRADIENTS ── */}
      <linearGradient id="titanium-heat-patina" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="20%" stopColor="#f59e0b" />
        <stop offset="45%" stopColor="#ec4899" />
        <stop offset="70%" stopColor="#8b5cf6" />
        <stop offset="90%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>

      <linearGradient id="blue-heat-tint" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#a855f7" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#ec4899" stopOpacity="0.4" />
      </linearGradient>

      {/* ── 12. SPECULAR HIGH-CONTRAST CHAMFER HIGHLIGHT ── */}
      <linearGradient id="specular-chamfer-edge" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
      </linearGradient>
    </defs>
  );
};
