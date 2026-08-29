export interface NeonHorizonTokens {
  colors: {
    bgVoid: string;
    bgDeep: string;
    glassPrimary: string;
    glassSecondary: string;
    glassTertiary: string;
    glassFloating: string;
    accentCyan: string;
    accentMagenta: string;
    accentGold: string;
    accentEmerald: string;
    accentCoral: string;
    accentSky: string;
    accentPurple: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    borderGlow: string;
    borderSubtle: string;
    borderCyanGlow: string;
    borderPurpleGlow: string;
  };
  shadows: {
    glowCyanSm: string;
    glowCyanMd: string;
    glowCyanLg: string;
    glowMagentaSm: string;
    glowMagentaMd: string;
    glowGoldSm: string;
    panelFloat: string;
    panelGlass: string;
    insetHighlight: string;
  };
  blur: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    massive: string;
  };
  radii: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    window: string;
    full: string;
  };
  fonts: {
    headline: string;
    body: string;
    mono: string;
  };
}

/**
 * Nordic Frost Design Tokens — Crystalline Ice Language.
 * Cold, serene, elegant: deep arctic navy backgrounds,
 * frosted glass with crystalline edges, aurora-inspired accent gradients,
 * delicate ice-blue highlights. No neon: no glowing borders, no saturated fills.
 * Inspired by frozen fjords, northern lights, and Scandinavian minimalism.
 */
export const NEON_HORIZON_TOKENS: NeonHorizonTokens = {
  colors: {
    bgVoid: "#070b14",
    bgDeep: "#0a1020",
    glassPrimary: "rgba(12, 20, 38, 0.82)",
    glassSecondary: "rgba(10, 16, 30, 0.70)",
    glassTertiary: "rgba(16, 24, 42, 0.55)",
    glassFloating: "rgba(14, 22, 40, 0.92)",
    // Nordic Frost palette — muted, sophisticated, icy
    accentCyan: "#5fa8c8",
    accentMagenta: "#8878a8",
    accentGold: "#c4a860",
    accentEmerald: "#5aaf88",
    accentCoral: "#c87880",
    accentSky: "#68b0d0",
    accentPurple: "#7868a0",
    textPrimary: "#e4eaf4",
    textSecondary: "#8494a8",
    textMuted: "#506070",
    borderGlow: "rgba(95, 168, 200, 0.12)",
    borderSubtle: "rgba(255, 255, 255, 0.06)",
    borderCyanGlow: "rgba(95, 168, 200, 0.18)",
    borderPurpleGlow: "rgba(120, 104, 160, 0.15)",
  },
  shadows: {
    // Aurora-inspired subtle glows — no neon, just depth
    glowCyanSm: "0 2px 12px rgba(95, 168, 200, 0.08)",
    glowCyanMd: "0 4px 24px rgba(95, 168, 200, 0.12)",
    glowCyanLg: "0 8px 48px rgba(95, 168, 200, 0.15)",
    glowMagentaSm: "0 2px 12px rgba(120, 104, 160, 0.06)",
    glowMagentaMd: "0 4px 24px rgba(120, 104, 160, 0.10)",
    glowGoldSm: "0 2px 12px rgba(196, 168, 96, 0.06)",
    // Panel depth
    panelFloat: "0 8px 32px rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.20)",
    panelGlass: "inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 4px 16px rgba(0, 0, 0, 0.25)",
    insetHighlight: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
  },
  blur: {
    sm: "blur(8px)",
    md: "blur(16px)",
    lg: "blur(32px)",
    xl: "blur(48px)",
    massive: "blur(80px)",
  },
  radii: {
    sm: "6px",
    md: "10px",
    lg: "16px",
    xl: "22px",
    window: "28px",
    full: "9999px",
  },
  fonts: {
    headline: "'Outfit', 'SF Pro Display', -apple-system, sans-serif",
    body: "'Inter', 'SF Pro Text', -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
  },
};
