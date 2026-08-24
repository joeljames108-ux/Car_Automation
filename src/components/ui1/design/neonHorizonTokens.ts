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
 * Horizon Design Tokens — "Quiet Cockpit" language.
 * Futuristic through material depth and restraint: smoked frosted glass,
 * hairline borders, neutral shadow physics, one ice-blue accent.
 * No neon: no colored glows, no text shadows, no saturated gradients.
 */
export const NEON_HORIZON_TOKENS: NeonHorizonTokens = {
  colors: {
    bgVoid: "#080c14",
    bgDeep: "#0c111c",
    glassPrimary: "rgba(17, 24, 38, 0.80)",
    glassSecondary: "rgba(13, 19, 31, 0.68)",
    glassTertiary: "rgba(21, 29, 44, 0.52)",
    glassFloating: "rgba(15, 22, 35, 0.90)",
    accentCyan: "#7fb5d8",
    accentMagenta: "#9d8fc4",
    accentGold: "#d9b36c",
    accentEmerald: "#6fbf9a",
    accentCoral: "#d9838d",
    accentSky: "#7fb5d8",
    accentPurple: "#9d8fc4",
    textPrimary: "#edf1f7",
    textSecondary: "#8b96a8",
    textMuted: "#5c6779",
    borderGlow: "rgba(255, 255, 255, 0.14)",
    borderSubtle: "rgba(255, 255, 255, 0.08)",
    borderCyanGlow: "rgba(127, 181, 216, 0.28)",
    borderPurpleGlow: "rgba(157, 143, 196, 0.24)",
  },
  shadows: {
    // Kept for API compatibility — now soft neutral elevation, not colored glows.
    glowCyanSm: "0 2px 10px rgba(0, 0, 0, 0.35)",
    glowCyanMd: "0 4px 18px rgba(0, 0, 0, 0.40)",
    glowCyanLg: "0 8px 28px rgba(0, 0, 0, 0.45)",
    glowMagentaSm: "0 2px 10px rgba(0, 0, 0, 0.35)",
    glowMagentaMd: "0 4px 18px rgba(0, 0, 0, 0.40)",
    glowGoldSm: "0 2px 10px rgba(0, 0, 0, 0.35)",
    panelFloat: "0 24px 60px rgba(0, 0, 0, 0.55), 0 8px 24px rgba(0, 0, 0, 0.35)",
    panelGlass:
      "0 16px 40px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.10), inset 0 -1px 0 rgba(0, 0, 0, 0.25)",
    insetHighlight: "inset 0 1px 1px rgba(255, 255, 255, 0.12)",
  },
  blur: {
    sm: "8px",
    md: "16px",
    lg: "28px",
    xl: "45px",
    massive: "65px",
  },
  radii: {
    sm: "8px",
    md: "14px",
    lg: "20px",
    xl: "24px",
    window: "28px",
    full: "9999px",
  },
  fonts: {
    headline: "'Inter', 'Rajdhani', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
};
