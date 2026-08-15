import React from "react";

// ===================================================================
// PHOTOREALISTIC SVG MATERIAL PIPELINE & SHADER REPOSITORY
// Implements 7-Layer SVG Material Pipeline:
// 1. Geometry → 2. Multi-Stop Gradient Base → 3. Micro-Texture Overlay
// → 4. Directional Key/Ambient Lighting → 5. Specular Highlights
// → 6. Ambient Occlusion & Contact Shadows → 7. CNC Machining Details
// ===================================================================

export type MaterialId =
  | "cast_iron"
  | "cast_aluminum"
  | "forged_steel"
  | "forged_aluminum"
  | "billet_cnc"
  | "titanium_grade5"
  | "carbon_fibre"
  | "rubber_elastomer"
  | "copper"
  | "brass"
  | "chrome_mirror"
  | "inconel_heat"
  | "ceramic"
  | "anodized_gold"
  | "anodized_red"
  | "anodized_blue";

export interface MaterialPreset {
  id: MaterialId;
  label: string;
  category: "metals" | "composites" | "polymers" | "coatings";
  gradientIds: {
    top: string;
    left: string;
    right: string;
    front: string;
  };
  textureFilterId: string;
  specularIntensity: number; // 0.0 (matte) to 1.0 (mirror)
  roughness: number;         // 0.0 (ultra-smooth) to 1.0 (rough cast)
  aoStrength: number;        // Ambient occlusion depth multiplier
  contactShadowBlur: number; // px blur
}

export const MATERIAL_PRESETS: Record<MaterialId, MaterialPreset> = {
  cast_iron: {
    id: "cast_iron",
    label: "Gray Cast Iron (Heavy Duty)",
    category: "metals",
    gradientIds: {
      top: "mat-grad-cast-iron-top",
      left: "mat-grad-cast-iron-left",
      right: "mat-grad-cast-iron-right",
      front: "mat-grad-cast-iron-left",
    },
    textureFilterId: "mat-cast-iron-filter",
    specularIntensity: 0.2,
    roughness: 0.85,
    aoStrength: 0.9,
    contactShadowBlur: 6,
  },
  cast_aluminum: {
    id: "cast_aluminum",
    label: "Cast A356 Aluminum Alloy",
    category: "metals",
    gradientIds: {
      top: "mat-grad-cast-alum-top",
      left: "mat-grad-cast-alum-left",
      right: "mat-grad-cast-alum-right",
      front: "mat-grad-cast-alum-left",
    },
    textureFilterId: "mat-cast-alum-filter",
    specularIntensity: 0.35,
    roughness: 0.65,
    aoStrength: 0.75,
    contactShadowBlur: 5,
  },
  forged_steel: {
    id: "forged_steel",
    label: "Forged 4340 Chromoly Steel",
    category: "metals",
    gradientIds: {
      top: "mat-grad-forged-steel-top",
      left: "mat-grad-forged-steel-left",
      right: "mat-grad-forged-steel-right",
      front: "mat-grad-forged-steel-left",
    },
    textureFilterId: "mat-brushed-metal-filter",
    specularIntensity: 0.6,
    roughness: 0.3,
    aoStrength: 0.8,
    contactShadowBlur: 4,
  },
  forged_aluminum: {
    id: "forged_aluminum",
    label: "Forged 6061-T6 Aerospace Aluminum",
    category: "metals",
    gradientIds: {
      top: "mat-grad-forged-alum-top",
      left: "mat-grad-forged-alum-left",
      right: "mat-grad-forged-alum-right",
      front: "mat-grad-forged-alum-left",
    },
    textureFilterId: "mat-brushed-metal-filter",
    specularIntensity: 0.7,
    roughness: 0.25,
    aoStrength: 0.7,
    contactShadowBlur: 4,
  },
  billet_cnc: {
    id: "billet_cnc",
    label: "CNC Billet 7075-T6 Mirror Sheen",
    category: "metals",
    gradientIds: {
      top: "mat-grad-billet-cnc-top",
      left: "mat-grad-billet-cnc-left",
      right: "mat-grad-billet-cnc-right",
      front: "mat-grad-billet-cnc-left",
    },
    textureFilterId: "mat-cnc-micro-filter",
    specularIntensity: 0.95,
    roughness: 0.08,
    aoStrength: 0.65,
    contactShadowBlur: 3,
  },
  titanium_grade5: {
    id: "titanium_grade5",
    label: "Grade 5 Ti-6Al-4V Motorsport Titanium",
    category: "metals",
    gradientIds: {
      top: "mat-grad-titanium-top",
      left: "mat-grad-titanium-left",
      right: "mat-grad-titanium-right",
      front: "mat-grad-titanium-left",
    },
    textureFilterId: "mat-satin-titanium-filter",
    specularIntensity: 0.8,
    roughness: 0.2,
    aoStrength: 0.85,
    contactShadowBlur: 4,
  },
  carbon_fibre: {
    id: "carbon_fibre",
    label: "2x2 Twill Prepreg Carbon Fibre",
    category: "composites",
    gradientIds: {
      top: "mat-grad-carbon-top",
      left: "mat-grad-carbon-left",
      right: "mat-grad-carbon-right",
      front: "mat-grad-carbon-left",
    },
    textureFilterId: "mat-carbon-weave-filter",
    specularIntensity: 0.85,
    roughness: 0.15,
    aoStrength: 0.95,
    contactShadowBlur: 5,
  },
  rubber_elastomer: {
    id: "rubber_elastomer",
    label: "Fluorocarbon Viton / NBR Rubber",
    category: "polymers",
    gradientIds: {
      top: "mat-grad-rubber-top",
      left: "mat-grad-rubber-left",
      right: "mat-grad-rubber-right",
      front: "mat-grad-rubber-left",
    },
    textureFilterId: "mat-rubber-pore-filter",
    specularIntensity: 0.1,
    roughness: 0.9,
    aoStrength: 0.9,
    contactShadowBlur: 3,
  },
  copper: {
    id: "copper",
    label: "High-Conductivity Oxygen-Free Copper",
    category: "metals",
    gradientIds: {
      top: "mat-grad-copper-top",
      left: "mat-grad-copper-left",
      right: "mat-grad-copper-right",
      front: "mat-grad-copper-left",
    },
    textureFilterId: "mat-copper-filter",
    specularIntensity: 0.75,
    roughness: 0.25,
    aoStrength: 0.7,
    contactShadowBlur: 4,
  },
  brass: {
    id: "brass",
    label: "C36000 Free-Cutting Brass",
    category: "metals",
    gradientIds: {
      top: "mat-grad-brass-top",
      left: "mat-grad-brass-left",
      right: "mat-grad-brass-right",
      front: "mat-grad-brass-left",
    },
    textureFilterId: "mat-brushed-metal-filter",
    specularIntensity: 0.7,
    roughness: 0.3,
    aoStrength: 0.7,
    contactShadowBlur: 4,
  },
  chrome_mirror: {
    id: "chrome_mirror",
    label: "Electroplated Hard Chrome Mirror",
    category: "coatings",
    gradientIds: {
      top: "mat-grad-chrome-top",
      left: "mat-grad-chrome-left",
      right: "mat-grad-chrome-right",
      front: "mat-grad-chrome-left",
    },
    textureFilterId: "mat-mirror-specular-filter",
    specularIntensity: 1.0,
    roughness: 0.02,
    aoStrength: 0.6,
    contactShadowBlur: 2,
  },
  inconel_heat: {
    id: "inconel_heat",
    label: "Inconel 625 with Exhaust Heat Patina",
    category: "metals",
    gradientIds: {
      top: "mat-grad-inconel-top",
      left: "mat-grad-inconel-left",
      right: "mat-grad-inconel-right",
      front: "mat-grad-inconel-left",
    },
    textureFilterId: "mat-satin-titanium-filter",
    specularIntensity: 0.65,
    roughness: 0.35,
    aoStrength: 0.85,
    contactShadowBlur: 5,
  },
  ceramic: {
    id: "ceramic",
    label: "Thermal Barrier Ceramic Coating (White Pearl)",
    category: "coatings",
    gradientIds: {
      top: "mat-grad-ceramic-top",
      left: "mat-grad-ceramic-left",
      right: "mat-grad-ceramic-right",
      front: "mat-grad-ceramic-left",
    },
    textureFilterId: "mat-satin-titanium-filter",
    specularIntensity: 0.5,
    roughness: 0.4,
    aoStrength: 0.6,
    contactShadowBlur: 4,
  },
  anodized_gold: {
    id: "anodized_gold",
    label: "Mil-Spec Gold Anodized Aluminum",
    category: "coatings",
    gradientIds: {
      top: "mat-grad-gold-top",
      left: "mat-grad-gold-left",
      right: "mat-grad-gold-right",
      front: "mat-grad-gold-left",
    },
    textureFilterId: "mat-brushed-metal-filter",
    specularIntensity: 0.75,
    roughness: 0.25,
    aoStrength: 0.7,
    contactShadowBlur: 4,
  },
  anodized_red: {
    id: "anodized_red",
    label: "Motorsport Crimson Anodized",
    category: "coatings",
    gradientIds: {
      top: "mat-grad-red-top",
      left: "mat-grad-red-left",
      right: "mat-grad-red-right",
      front: "mat-grad-red-left",
    },
    textureFilterId: "mat-brushed-metal-filter",
    specularIntensity: 0.8,
    roughness: 0.2,
    aoStrength: 0.75,
    contactShadowBlur: 4,
  },
  anodized_blue: {
    id: "anodized_blue",
    label: "Cobalt Blue Anodized Finish",
    category: "coatings",
    gradientIds: {
      top: "mat-grad-blue-top",
      left: "mat-grad-blue-left",
      right: "mat-grad-blue-right",
      front: "mat-grad-blue-left",
    },
    textureFilterId: "mat-brushed-metal-filter",
    specularIntensity: 0.8,
    roughness: 0.2,
    aoStrength: 0.75,
    contactShadowBlur: 4,
  },
};

/**
 * Returns fill references and texture filters for a given material grade
 */
export function getPhotorealisticMaterial(
  materialGrade: string = "forged",
  fallback: MaterialId = "forged_aluminum"
): {
  preset: MaterialPreset;
  fills: { top: string; left: string; right: string; front: string };
  filter: string;
} {
  let matId: MaterialId = fallback;
  if (materialGrade === "cast") matId = "cast_iron";
  else if (materialGrade === "forged") matId = "forged_aluminum";
  else if (materialGrade === "billet") matId = "billet_cnc";
  else if (materialGrade === "titanium") matId = "titanium_grade5";
  else if (materialGrade === "carbon" || materialGrade === "carbon_fibre") matId = "carbon_fibre";
  else if (materialGrade === "ceramic") matId = "ceramic";
  else if (materialGrade in MATERIAL_PRESETS) matId = materialGrade as MaterialId;

  const preset = MATERIAL_PRESETS[matId] || MATERIAL_PRESETS.forged_aluminum;

  return {
    preset,
    fills: {
      top: `url(#${preset.gradientIds.top})`,
      left: `url(#${preset.gradientIds.left})`,
      right: `url(#${preset.gradientIds.right})`,
      front: `url(#${preset.gradientIds.front})`,
    },
    filter: `url(#${preset.textureFilterId})`,
  };
}

/**
 * Complete SVG Defs containing the entire 7-layer photorealistic material shader library
 */
export const IsoMaterialPipelineDefs: React.FC = () => {
  return (
    <defs>
      {/* ========================================================================= */}
      {/* 1. ADVANCED SVG TEXTURE & LIGHTING FILTERS                                */}
      {/* ========================================================================= */}

      {/* Cast Iron Porous Texture with Ambient Occlusion */}
      <filter id="mat-cast-iron-filter" x="-15%" y="-15%" width="130%" height="130%">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
        <feColorMatrix
          type="matrix"
          values="0.18 0 0 0 0
                  0.18 0 0 0 0
                  0.20 0 0 0 0
                  0.15 0 0 0 0"
          result="darkNoise"
        />
        <feBlend in="SourceGraphic" in2="darkNoise" mode="multiply" result="textured" />
        <feSpecularLighting in="noise" surfaceScale="1.2" specularConstant="0.4" specularExponent="15" result="specular">
          <feDistantLight azimuth="225" elevation="45" />
        </feSpecularLighting>
        <feComposite in="specular" in2="textured" operator="in" result="specularMasked" />
        <feBlend in="textured" in2="specularMasked" mode="screen" />
      </filter>

      {/* Cast Aluminum Matte Granular Filter */}
      <filter id="mat-cast-alum-filter" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" result="grain" />
        <feColorMatrix
          type="matrix"
          values="0.25 0 0 0 0
                  0.25 0 0 0 0
                  0.28 0 0 0 0
                  0.12 0 0 0 0"
          result="grainAlpha"
        />
        <feBlend in="SourceGraphic" in2="grainAlpha" mode="overlay" result="grained" />
        <feSpecularLighting in="grain" surfaceScale="0.8" specularConstant="0.6" specularExponent="25" result="spec">
          <feDistantLight azimuth="225" elevation="50" />
        </feSpecularLighting>
        <feComposite in="spec" in2="grained" operator="in" result="specMask" />
        <feBlend in="grained" in2="specMask" mode="screen" />
      </filter>

      {/* Directional Brushed Metal Finish (Forged Steel & Aluminum) */}
      <filter id="mat-brushed-metal-filter" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="turbulence" baseFrequency="0.04 0.95" numOctaves="2" result="brushLines" />
        <feColorMatrix
          type="matrix"
          values="0.3 0 0 0 0
                  0.3 0 0 0 0
                  0.35 0 0 0 0
                  0.09 0 0 0 0"
          result="brushAlpha"
        />
        <feBlend in="SourceGraphic" in2="brushAlpha" mode="overlay" />
      </filter>

      {/* CNC Precision Machining Micro-Groove Filter */}
      <filter id="mat-cnc-micro-filter" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="turbulence" baseFrequency="0.01 0.85" numOctaves="3" result="cncGrain" />
        <feColorMatrix
          type="matrix"
          values="0.4 0 0 0 0
                  0.45 0 0 0 0
                  0.55 0 0 0 0
                  0.07 0 0 0 0"
          result="cncAlpha"
        />
        <feBlend in="SourceGraphic" in2="cncAlpha" mode="overlay" result="cncBase" />
        <feSpecularLighting in="cncGrain" surfaceScale="0.6" specularConstant="1.2" specularExponent="45" result="cncSpec">
          <feDistantLight azimuth="225" elevation="55" />
        </feSpecularLighting>
        <feComposite in="cncSpec" in2="cncBase" operator="in" result="cncSpecMask" />
        <feBlend in="cncBase" in2="cncSpecMask" mode="screen" />
      </filter>

      {/* Satin Motorsport Titanium Filter */}
      <filter id="mat-satin-titanium-filter" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.3" numOctaves="2" result="titanNoise" />
        <feColorMatrix
          type="matrix"
          values="0.2 0 0 0 0
                  0.2 0 0 0 0
                  0.25 0 0 0 0
                  0.06 0 0 0 0"
          result="titanAlpha"
        />
        <feBlend in="SourceGraphic" in2="titanAlpha" mode="soft-light" />
      </filter>

      {/* Carbon Fibre 2x2 Weave Overlay Filter */}
      <filter id="mat-carbon-weave-filter" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="turbulence" baseFrequency="0.25 0.25" numOctaves="2" result="carbonGrain" />
        <feColorMatrix
          type="matrix"
          values="0.1 0 0 0 0
                  0.1 0 0 0 0
                  0.15 0 0 0 0
                  0.2 0 0 0 0"
          result="carbonAlpha"
        />
        <feBlend in="SourceGraphic" in2="carbonAlpha" mode="multiply" result="twillBase" />
        <feSpecularLighting in="carbonGrain" surfaceScale="1.0" specularConstant="0.9" specularExponent="30" result="resinSpec">
          <feDistantLight azimuth="225" elevation="45" />
        </feSpecularLighting>
        <feComposite in="resinSpec" in2="twillBase" operator="in" result="resinMask" />
        <feBlend in="twillBase" in2="resinMask" mode="screen" />
      </filter>

      {/* Rubber Micro-Pore Filter */}
      <filter id="mat-rubber-pore-filter" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="rubberNoise" />
        <feColorMatrix
          type="matrix"
          values="0.08 0 0 0 0
                  0.08 0 0 0 0
                  0.08 0 0 0 0
                  0.25 0 0 0 0"
          result="rubberAlpha"
        />
        <feBlend in="SourceGraphic" in2="rubberAlpha" mode="multiply" />
      </filter>

      {/* Mirror Chrome High-Contrast Specular Filter */}
      <filter id="mat-mirror-specular-filter" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="0.8" result="blur" />
        <feSpecularLighting in="blur" surfaceScale="2.5" specularConstant="1.8" specularExponent="60" result="chromeSpec">
          <feDistantLight azimuth="225" elevation="60" />
        </feSpecularLighting>
        <feComposite in="chromeSpec" in2="SourceGraphic" operator="in" result="chromeMask" />
        <feBlend in="SourceGraphic" in2="chromeMask" mode="screen" />
      </filter>

      {/* Soft Inter-Component Contact Shadow Filter */}
      <filter id="contact-shadow-soft" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="4.5" result="blur" />
        <feComponentTransfer in="blur" result="shadow">
          <feFuncA type="linear" slope="0.75" />
        </feComponentTransfer>
      </filter>

      {/* Heavy Ambient Occlusion Cavity Shadow */}
      <filter id="ao-cavity-shadow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="8.0" result="blur" />
        <feComponentTransfer in="blur" result="shadow">
          <feFuncA type="linear" slope="0.9" />
        </feComponentTransfer>
      </filter>

      {/* ========================================================================= */}
      {/* 2. REUSABLE MICRO-DETAIL PATTERNS                                         */}
      {/* ========================================================================= */}

      {/* Carbon Fibre 2x2 Twill Diagonal Pattern */}
      <pattern id="pat-carbon-twill" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="8" height="8" fill="#090d16" />
        <rect x="0" y="0" width="4" height="4" fill="#1e293b" opacity="0.85" />
        <rect x="4" y="4" width="4" height="4" fill="#1e293b" opacity="0.85" />
        <line x1="0" y1="2" x2="4" y2="2" stroke="#334155" strokeWidth="0.5" opacity="0.6" />
        <line x1="4" y1="6" x2="8" y2="6" stroke="#334155" strokeWidth="0.5" opacity="0.6" />
      </pattern>

      {/* Precision Cylinder Bore Honing Crosshatch */}
      <pattern id="pat-bore-honing" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
        <line x1="0" y1="0" x2="10" y2="10" stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.35" />
        <line x1="0" y1="10" x2="10" y2="0" stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.35" />
      </pattern>

      {/* Diamond Knurling Pattern (Grip Sleeves / Tooling) */}
      <pattern id="pat-diamond-knurl" width="6" height="6" patternUnits="userSpaceOnUse">
        <path d="M 0 3 L 3 0 L 6 3 L 3 6 Z" fill="#1e293b" stroke="#475569" strokeWidth="0.4" />
      </pattern>

      {/* ========================================================================= */}
      {/* 3. MULTI-STOP MATERIAL BASE GRADIENTS (5+ STOPS EACH)                     */}
      {/* ========================================================================= */}

      {/* ── 1. GRAY CAST IRON (Dark Porous Ferrous Slate) ── */}
      <linearGradient id="mat-grad-cast-iron-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="25%" stopColor="#94a3b8" />
        <stop offset="55%" stopColor="#64748b" />
        <stop offset="80%" stopColor="#475569" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
      <linearGradient id="mat-grad-cast-iron-left" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="30%" stopColor="#475569" />
        <stop offset="65%" stopColor="#334155" />
        <stop offset="90%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="mat-grad-cast-iron-right" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="35%" stopColor="#334155" />
        <stop offset="70%" stopColor="#1e293b" />
        <stop offset="90%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>

      {/* ── 2. CAST ALUMINUM (Bright Silver with Blue-Gray Undertones) ── */}
      <linearGradient id="mat-grad-cast-alum-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="20%" stopColor="#f1f5f9" />
        <stop offset="50%" stopColor="#e2e8f0" />
        <stop offset="75%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>
      <linearGradient id="mat-grad-cast-alum-left" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="30%" stopColor="#94a3b8" />
        <stop offset="60%" stopColor="#64748b" />
        <stop offset="85%" stopColor="#475569" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
      <linearGradient id="mat-grad-cast-alum-right" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="35%" stopColor="#64748b" />
        <stop offset="70%" stopColor="#475569" />
        <stop offset="90%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>

      {/* ── 3. FORGED 4340 CHROMOLY STEEL ── */}
      <linearGradient id="mat-grad-forged-steel-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="25%" stopColor="#e2e8f0" />
        <stop offset="55%" stopColor="#cbd5e1" />
        <stop offset="80%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
      <linearGradient id="mat-grad-forged-steel-left" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="30%" stopColor="#64748b" />
        <stop offset="60%" stopColor="#475569" />
        <stop offset="85%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
      <linearGradient id="mat-grad-forged-steel-right" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="35%" stopColor="#475569" />
        <stop offset="70%" stopColor="#334155" />
        <stop offset="90%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>

      {/* ── 4. FORGED 6061-T6 ALUMINUM ALLOY ── */}
      <linearGradient id="mat-grad-forged-alum-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="30%" stopColor="#f8fafc" />
        <stop offset="60%" stopColor="#e2e8f0" />
        <stop offset="85%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>
      <linearGradient id="mat-grad-forged-alum-left" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="35%" stopColor="#cbd5e1" />
        <stop offset="65%" stopColor="#94a3b8" />
        <stop offset="85%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id="mat-grad-forged-alum-right" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="35%" stopColor="#94a3b8" />
        <stop offset="70%" stopColor="#64748b" />
        <stop offset="90%" stopColor="#475569" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>

      {/* ── 5. CNC BILLET 7075-T6 (Cyan Ambient Specular) ── */}
      <linearGradient id="mat-grad-billet-cnc-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="20%" stopColor="#e0f2fe" />
        <stop offset="45%" stopColor="#7dd3fc" />
        <stop offset="60%" stopColor="#ffffff" />
        <stop offset="85%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>
      <linearGradient id="mat-grad-billet-cnc-left" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f0f9ff" />
        <stop offset="25%" stopColor="#38bdf8" />
        <stop offset="55%" stopColor="#0f172a" />
        <stop offset="80%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#082f49" />
      </linearGradient>
      <linearGradient id="mat-grad-billet-cnc-right" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="30%" stopColor="#0284c7" />
        <stop offset="60%" stopColor="#0f172a" />
        <stop offset="85%" stopColor="#082f49" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>

      {/* ── 6. GRADE 5 MOTORSPORT TITANIUM (Satin Gunmetal + Platinum) ── */}
      <linearGradient id="mat-grad-titanium-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="18%" stopColor="#f8fafc" />
        <stop offset="45%" stopColor="#cbd5e1" />
        <stop offset="70%" stopColor="#94a3b8" />
        <stop offset="90%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id="mat-grad-titanium-left" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="30%" stopColor="#64748b" />
        <stop offset="60%" stopColor="#475569" />
        <stop offset="85%" stopColor="#334155" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
      <linearGradient id="mat-grad-titanium-right" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="35%" stopColor="#475569" />
        <stop offset="70%" stopColor="#334155" />
        <stop offset="90%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#090d16" />
      </linearGradient>

      {/* ── 7. PREPREG CARBON FIBRE ── */}
      <linearGradient id="mat-grad-carbon-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="25%" stopColor="#334155" />
        <stop offset="55%" stopColor="#1e293b" />
        <stop offset="80%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
      <linearGradient id="mat-grad-carbon-left" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="35%" stopColor="#1e293b" />
        <stop offset="70%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#000000" />
      </linearGradient>
      <linearGradient id="mat-grad-carbon-right" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="40%" stopColor="#0f172a" />
        <stop offset="80%" stopColor="#020617" />
        <stop offset="100%" stopColor="#000000" />
      </linearGradient>

      {/* ── 8. VITON / NBR RUBBER ELASTOMER ── */}
      <linearGradient id="mat-grad-rubber-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="30%" stopColor="#1e293b" />
        <stop offset="70%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
      <linearGradient id="mat-grad-rubber-left" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="50%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
      <linearGradient id="mat-grad-rubber-right" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="50%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#000000" />
      </linearGradient>

      {/* ── 9. OXYGEN-FREE COPPER ── */}
      <linearGradient id="mat-grad-copper-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffedd5" />
        <stop offset="25%" stopColor="#fed7aa" />
        <stop offset="55%" stopColor="#fb923c" />
        <stop offset="80%" stopColor="#ea580c" />
        <stop offset="100%" stopColor="#c2410c" />
      </linearGradient>
      <linearGradient id="mat-grad-copper-left" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fb923c" />
        <stop offset="35%" stopColor="#ea580c" />
        <stop offset="70%" stopColor="#c2410c" />
        <stop offset="100%" stopColor="#7c2d12" />
      </linearGradient>
      <linearGradient id="mat-grad-copper-right" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ea580c" />
        <stop offset="35%" stopColor="#c2410c" />
        <stop offset="70%" stopColor="#9a3412" />
        <stop offset="100%" stopColor="#431407" />
      </linearGradient>

      {/* ── 10. FREE-CUTTING BRASS ── */}
      <linearGradient id="mat-grad-brass-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef9c3" />
        <stop offset="25%" stopColor="#fef08a" />
        <stop offset="55%" stopColor="#facc15" />
        <stop offset="80%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>
      <linearGradient id="mat-grad-brass-left" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#facc15" />
        <stop offset="35%" stopColor="#eab308" />
        <stop offset="70%" stopColor="#ca8a04" />
        <stop offset="100%" stopColor="#854d0e" />
      </linearGradient>
      <linearGradient id="mat-grad-brass-right" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#eab308" />
        <stop offset="35%" stopColor="#ca8a04" />
        <stop offset="70%" stopColor="#a16207" />
        <stop offset="100%" stopColor="#422006" />
      </linearGradient>

      {/* ── 11. HARD CHROME MIRROR ── */}
      <linearGradient id="mat-grad-chrome-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="20%" stopColor="#f1f5f9" />
        <stop offset="35%" stopColor="#475569" />
        <stop offset="50%" stopColor="#ffffff" />
        <stop offset="70%" stopColor="#334155" />
        <stop offset="85%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
      <linearGradient id="mat-grad-chrome-left" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="25%" stopColor="#64748b" />
        <stop offset="45%" stopColor="#0f172a" />
        <stop offset="65%" stopColor="#e2e8f0" />
        <stop offset="85%" stopColor="#334155" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
      <linearGradient id="mat-grad-chrome-right" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="30%" stopColor="#1e293b" />
        <stop offset="50%" stopColor="#94a3b8" />
        <stop offset="75%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#000000" />
      </linearGradient>

      {/* ── 12. INCONEL / HEAT PATINA (Exhaust Blue/Purple/Amber) ── */}
      <linearGradient id="mat-grad-inconel-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="18%" stopColor="#f59e0b" />
        <stop offset="40%" stopColor="#ec4899" />
        <stop offset="65%" stopColor="#8b5cf6" />
        <stop offset="85%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
      <linearGradient id="mat-grad-inconel-left" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ec4899" />
        <stop offset="30%" stopColor="#8b5cf6" />
        <stop offset="65%" stopColor="#3b82f6" />
        <stop offset="90%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="mat-grad-inconel-right" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="35%" stopColor="#3b82f6" />
        <stop offset="70%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>

      {/* ── 13. CERAMIC THERMAL COATING (White Pearl Gloss) ── */}
      <linearGradient id="mat-grad-ceramic-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="30%" stopColor="#f8fafc" />
        <stop offset="65%" stopColor="#e2e8f0" />
        <stop offset="85%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>
      <linearGradient id="mat-grad-ceramic-left" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="35%" stopColor="#e2e8f0" />
        <stop offset="70%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
      <linearGradient id="mat-grad-ceramic-right" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="40%" stopColor="#cbd5e1" />
        <stop offset="75%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>

      {/* ── 14. ANODIZED GOLD ── */}
      <linearGradient id="mat-grad-gold-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="25%" stopColor="#fbbf24" />
        <stop offset="60%" stopColor="#f59e0b" />
        <stop offset="85%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
      <linearGradient id="mat-grad-gold-left" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="35%" stopColor="#d97706" />
        <stop offset="70%" stopColor="#b45309" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
      <linearGradient id="mat-grad-gold-right" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#d97706" />
        <stop offset="40%" stopColor="#b45309" />
        <stop offset="80%" stopColor="#78350f" />
        <stop offset="100%" stopColor="#451a03" />
      </linearGradient>

      {/* ── 15. ANODIZED CRIMSON RED ── */}
      <linearGradient id="mat-grad-red-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fca5a5" />
        <stop offset="25%" stopColor="#f87171" />
        <stop offset="55%" stopColor="#ef4444" />
        <stop offset="80%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#991b1b" />
      </linearGradient>
      <linearGradient id="mat-grad-red-left" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="35%" stopColor="#dc2626" />
        <stop offset="70%" stopColor="#991b1b" />
        <stop offset="100%" stopColor="#450a0a" />
      </linearGradient>
      <linearGradient id="mat-grad-red-right" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#dc2626" />
        <stop offset="40%" stopColor="#991b1b" />
        <stop offset="80%" stopColor="#7f1d1d" />
        <stop offset="100%" stopColor="#450a0a" />
      </linearGradient>

      {/* ── 16. ANODIZED COBALT BLUE ── */}
      <linearGradient id="mat-grad-blue-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#93c5fd" />
        <stop offset="25%" stopColor="#60a5fa" />
        <stop offset="55%" stopColor="#3b82f6" />
        <stop offset="80%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
      <linearGradient id="mat-grad-blue-left" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="35%" stopColor="#2563eb" />
        <stop offset="70%" stopColor="#1d4ed8" />
        <stop offset="100%" stopColor="#172554" />
      </linearGradient>
      <linearGradient id="mat-grad-blue-right" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#2563eb" />
        <stop offset="40%" stopColor="#1d4ed8" />
        <stop offset="80%" stopColor="#1e3a8a" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>

      {/* ========================================================================= */}
      {/* 4. ENVIRONMENT REFLECTION & SPECULAR HOTSPOT GRADIENTS                    */}
      {/* ========================================================================= */}
      <radialGradient id="env-reflection-sphere" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="25%" stopColor="#e0f2fe" stopOpacity="0.7" />
        <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.3" />
        <stop offset="75%" stopColor="#0f172a" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </radialGradient>

      <radialGradient id="specular-hotspot-intense" cx="35%" cy="30%" r="60%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
        <stop offset="25%" stopColor="#ffffff" stopOpacity="0.6" />
        <stop offset="55%" stopColor="#ffffff" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
};

// ===================================================================
// COMPOSABLE SUB-COMPONENTS
// ===================================================================

/**
 * Specular Hotspot Overlay Component
 */
export const SpecularHotspot: React.FC<{
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  intensity?: number;
  rotation?: number;
}> = ({ cx, cy, rx, ry, intensity = 0.8, rotation = 0 }) => (
  <ellipse
    cx={cx}
    cy={cy}
    rx={rx}
    ry={ry}
    fill="url(#specular-hotspot-intense)"
    opacity={intensity}
    transform={rotation ? `rotate(${rotation} ${cx} ${cy})` : undefined}
    pointerEvents="none"
  />
);

/**
 * Inter-Component Contact Shadow Component
 */
export const ContactShadow: React.FC<{
  points?: string;
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  opacity?: number;
}> = ({ points, cx, cy, rx, ry, opacity = 0.75 }) => {
  if (points) {
    return <polygon points={points} fill="#000000" opacity={opacity * 0.7} pointerEvents="none" />;
  }
  if (cx !== undefined && cy !== undefined && rx !== undefined && ry !== undefined) {
    return (
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="url(#iso-ground-shadow)"
        opacity={opacity}
        pointerEvents="none"
      />
    );
  }
  return null;
};

/**
 * CNC Machining Mark Line
 */
export const MachiningMark: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  opacity?: number;
  color?: string;
}> = ({ x1, y1, x2, y2, opacity = 0.35, color = "#ffffff" }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="0.6" strokeOpacity={opacity} strokeLinecap="round" />
);
