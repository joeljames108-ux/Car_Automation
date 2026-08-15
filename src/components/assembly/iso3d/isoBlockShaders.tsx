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

      {/* ── 2. DEEP CYLINDER BORE RADIAL SHADERS (Cobalt Blue with High-Gloss Specular Domes) ── */}
      <radialGradient id="bore-3d-depth" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.95" />
        <stop offset="25%" stopColor="#1d4ed8" stopOpacity="1" />
        <stop offset="60%" stopColor="#1e3a8a" stopOpacity="1" />
        <stop offset="85%" stopColor="#0f172a" stopOpacity="1" />
        <stop offset="100%" stopColor="#020617" stopOpacity="1" />
      </radialGradient>

      <radialGradient id="bore-cobalt-dome" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="30%" stopColor="#2563eb" />
        <stop offset="70%" stopColor="#1e3a8a" />
        <stop offset="100%" stopColor="#0a192f" />
      </radialGradient>

      <radialGradient id="bore-specular-highlight" cx="30%" cy="25%" r="50%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="35%" stopColor="#93c5fd" stopOpacity="0.6" />
        <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
      </radialGradient>

      {/* ── 3. V-BANK WALL & DECK GRADIENTS (Refined Aluminum Tones) ── */}
      <linearGradient id="v-bank-left-wall" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="35%" stopColor="#64748b" />
        <stop offset="70%" stopColor="#475569" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>

      <linearGradient id="v-bank-right-wall" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="45%" stopColor="#475569" />
        <stop offset="80%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>

      <linearGradient id="v-deck-surface-left" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f1f5f9" />
        <stop offset="40%" stopColor="#cbd5e1" />
        <stop offset="75%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>

      <linearGradient id="v-deck-surface-right" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="50%" stopColor="#94a3b8" />
        <stop offset="85%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>

      <radialGradient id="v-valley-floor" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="40%" stopColor="#334155" />
        <stop offset="85%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </radialGradient>

      <linearGradient id="bore-wall-thickness" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="40%" stopColor="#cbd5e1" />
        <stop offset="80%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>

      <linearGradient id="lifting-bracket-cast" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="45%" stopColor="#94a3b8" />
        <stop offset="85%" stopColor="#475569" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>

      {/* ── 9. FORGED H-BEAM CONNECTING ROD SHADERS ── */}
      <linearGradient id="rod-hbeam-shank" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="25%" stopColor="#cbd5e1" />
        <stop offset="60%" stopColor="#94a3b8" />
        <stop offset="85%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>

      <linearGradient id="rod-recessed-channel" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="50%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1e293b" />
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
        <stop offset="30%" stopColor="#cbd5e1" />
        <stop offset="70%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#1e293b" />
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
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
        <stop offset="35%" stopColor="#e2e8f0" stopOpacity="0.85" />
        <stop offset="70%" stopColor="#94a3b8" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#475569" stopOpacity="0" />
      </radialGradient>

      {/* Honing Pattern inside bores */}
      <pattern id="honing-crosshatch-pattern" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
        <line x1="0" y1="0" x2="12" y2="12" stroke="#60a5fa" strokeWidth="0.7" strokeOpacity="0.35" />
        <line x1="0" y1="12" x2="12" y2="0" stroke="#60a5fa" strokeWidth="0.7" strokeOpacity="0.35" />
      </pattern>

      {/* ── 3. MAIN BEARING SADDLE & JOURNAL SHADERS ── */}
      <linearGradient id="bearing-saddle-chrome" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="20%" stopColor="#cbd5e1" />
        <stop offset="45%" stopColor="#475569" />
        <stop offset="70%" stopColor="#e2e8f0" />
        <stop offset="90%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>

      <linearGradient id="journal-oil-hole" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="50%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>

      {/* ── 4. TRAPEZOIDAL RIB SHADERS (TOP / LEFT / RIGHT FACES) ── */}
      <linearGradient id="rib-face-light" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="40%" stopColor="#cbd5e1" />
        <stop offset="80%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>

      <linearGradient id="rib-face-mid" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="50%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>

      <linearGradient id="rib-face-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="50%" stopColor="#475569" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>

      {/* ── 5. RAISED BOLT BOSS & HEX SOCKET SHADERS ── */}
      <radialGradient id="bolt-boss-raised" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="50%" stopColor="#94a3b8" />
        <stop offset="85%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#334155" />
      </radialGradient>

      <radialGradient id="hex-socket-recess" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="70%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#475569" />
      </radialGradient>

      {/* ── 6. COOLANT WATER JACKET OPENING SHADERS ── */}
      <linearGradient id="water-jacket-opening" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0e7490" />
        <stop offset="50%" stopColor="#0891b2" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#164e63" />
      </linearGradient>

      {/* ── 7. OIL PAN STAMPED STEEL SUMP TRAY SHADERS ── */}
      <linearGradient id="oil-pan-top-lip" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="50%" stopColor="#475569" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>

      <linearGradient id="oil-pan-front-face" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f1f5f9" />
        <stop offset="40%" stopColor="#cbd5e1" />
        <stop offset="85%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>

      <linearGradient id="oil-pan-side-face" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="60%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>

      {/* ── 8. SPECULAR EDGE HIGHLIGHTS ── */}
      <linearGradient id="specular-edge-bright" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="50%" stopColor="#ffffff" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>

      <linearGradient id="specular-edge-vertical" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
        <stop offset="30%" stopColor="#f1f5f9" stopOpacity="0.8" />
        <stop offset="70%" stopColor="#cbd5e1" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>

      {/* ── V12 BLOCK-SPECIFIC SHADERS (Bright Machined & Cast Aluminum) ── */}

      {/* Cast aluminium body — crisp silver-slate casting texture */}
      <linearGradient id="v12-cast-aluminum-body" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="20%" stopColor="#a3b3c6" />
        <stop offset="50%" stopColor="#8194aa" />
        <stop offset="75%" stopColor="#647890" />
        <stop offset="100%" stopColor="#4c5e75" />
      </linearGradient>

      {/* Cast aluminium body — right side (slight shadow for 3D depth) */}
      <linearGradient id="v12-cast-aluminum-body-right" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8194aa" />
        <stop offset="30%" stopColor="#647890" />
        <stop offset="65%" stopColor="#4c5e75" />
        <stop offset="100%" stopColor="#37485e" />
      </linearGradient>

      {/* Bright silver machined deck surface */}
      <linearGradient id="v12-machined-deck" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="25%" stopColor="#e2e8f0" />
        <stop offset="55%" stopColor="#cbd5e1" />
        <stop offset="80%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>

      {/* Deep crankcase lower section */}
      <linearGradient id="v12-crankcase-deep" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#8194aa" />
        <stop offset="30%" stopColor="#64748b" />
        <stop offset="65%" stopColor="#475569" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>

      {/* Deep crankcase right face */}
      <linearGradient id="v12-crankcase-deep-right" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="40%" stopColor="#475569" />
        <stop offset="75%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>

      {/* Valley ambient occlusion shadow */}
      <radialGradient id="v12-valley-shadow" cx="50%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#4c5e75" />
        <stop offset="30%" stopColor="#37485e" />
        <stop offset="60%" stopColor="#253448" />
        <stop offset="85%" stopColor="#172332" />
        <stop offset="100%" stopColor="#0c1420" />
      </radialGradient>

      {/* Front timing cover face */}
      <linearGradient id="v12-timing-cover-face" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="35%" stopColor="#94a3b8" />
        <stop offset="70%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>

      {/* Rear transmission flange — flat machined */}
      <linearGradient id="v12-transmission-flange" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f1f5f9" />
        <stop offset="40%" stopColor="#cbd5e1" />
        <stop offset="75%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>

      {/* Cast reinforcement rib surface */}
      <linearGradient id="v12-rib-cast-surface" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="45%" stopColor="#94a3b8" />
        <stop offset="80%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>

      {/* Main bearing cap steel finish */}
      <radialGradient id="v12-bearing-cap" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="35%" stopColor="#94a3b8" />
        <stop offset="70%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#475569" />
      </radialGradient>

      {/* Crankshaft tunnel bore */}
      <radialGradient id="v12-crank-tunnel-bore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="40%" stopColor="#334155" />
        <stop offset="80%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </radialGradient>

      {/* ── POLISHED GOLD / BRASS VALVE COVER GRADIENTS ── */}
      <linearGradient id="valve-cover-gold-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="20%" stopColor="#f59e0b" />
        <stop offset="50%" stopColor="#d97706" />
        <stop offset="80%" stopColor="#b45309" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>

      <linearGradient id="valve-cover-gold-side" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="30%" stopColor="#d97706" />
        <stop offset="70%" stopColor="#92400e" />
        <stop offset="100%" stopColor="#451a03" />
      </linearGradient>

      <linearGradient id="valve-cover-gold-highlight" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="40%" stopColor="#fef08a" stopOpacity="0.8" />
        <stop offset="75%" stopColor="#f59e0b" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
      </linearGradient>

      {/* ── CHROME / MIRROR EXHAUST HEADER GRADIENTS ── */}
      <linearGradient id="chrome-headers-tube" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="25%" stopColor="#f1f5f9" />
        <stop offset="55%" stopColor="#cbd5e1" />
        <stop offset="80%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>

      <linearGradient id="chrome-merge-collector" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="30%" stopColor="#e2e8f0" />
        <stop offset="65%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>

      <linearGradient id="header-flange-dark" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="50%" stopColor="#475569" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>

      {/* ── TRANSMISSION & BELLHOUSING GRADIENTS ── */}
      <linearGradient id="transmission-case-cast" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="25%" stopColor="#cbd5e1" />
        <stop offset="55%" stopColor="#94a3b8" />
        <stop offset="80%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>

      <linearGradient id="clutch-housing-cutaway" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="50%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>

      <linearGradient id="clutch-disc-friction" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#b45309" />
        <stop offset="40%" stopColor="#d97706" />
        <stop offset="80%" stopColor="#92400e" />
        <stop offset="100%" stopColor="#451a03" />
      </linearGradient>

      <linearGradient id="pressure-plate-steel" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="35%" stopColor="#cbd5e1" />
        <stop offset="70%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>

      <linearGradient id="flywheel-ring-gear" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="30%" stopColor="#64748b" />
        <stop offset="70%" stopColor="#475569" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>

      {/* ── RADIATOR SHADERS ── */}
      <linearGradient id="radiator-core-aluminum" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="30%" stopColor="#e2e8f0" />
        <stop offset="70%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>

      <linearGradient id="radiator-end-tank" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="40%" stopColor="#cbd5e1" />
        <stop offset="80%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>

      {/* ── GLASS DISPLAY PLATFORM SHADERS ── */}
      <linearGradient id="glass-platform-surface" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.4" />
        <stop offset="40%" stopColor="#f0f9ff" stopOpacity="0.25" />
        <stop offset="80%" stopColor="#bae6fd" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.5" />
      </linearGradient>

      <linearGradient id="glass-platform-edge" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.7" />
        <stop offset="70%" stopColor="#0284c7" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
      </linearGradient>

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

      {/* ── VELOCITY STACK BELLMOUTH (radial — deep cobalt dome inside trumpet) ── */}
      <radialGradient id="velocity-stack-bellmouth" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
        <stop offset="30%" stopColor="#1d4ed8" />
        <stop offset="65%" stopColor="#1e3a8a" />
        <stop offset="100%" stopColor="#0f172a" />
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
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="25%" stopColor="#e2e8f0" />
        <stop offset="60%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>

      {/* ── OIL PAN COOLING FIN CHANNEL ── */}
      <linearGradient id="cooling-fin-channel" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="50%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>

      {/* ── CEL-SHADED TECHNICAL ILLUSTRATION GRADIENTS ── */}

      {/* Electric Blue Anodized Velocity Stack Rim Lip */}
      <linearGradient id="electric-blue-lip" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#93c5fd" />
        <stop offset="30%" stopColor="#3b82f6" />
        <stop offset="70%" stopColor="#1d4ed8" />
        <stop offset="100%" stopColor="#1e3a8a" />
      </linearGradient>

      {/* Blue Cylinder Sleeve Ring Accent */}
      <linearGradient id="blue-sleeve-ring" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="40%" stopColor="#2563eb" />
        <stop offset="80%" stopColor="#1d4ed8" />
        <stop offset="100%" stopColor="#1e3a8a" />
      </linearGradient>

      {/* Cel-Shaded Steel Engine Block Surface */}
      <linearGradient id="cel-steel-block" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="25%" stopColor="#64748b" />
        <stop offset="60%" stopColor="#475569" />
        <stop offset="85%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1e293b" />
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
