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

export const NEON_HORIZON_TOKENS: NeonHorizonTokens = {
  colors: {
    bgVoid: "#060b14",
    bgDeep: "#0a101d",
    glassPrimary: "rgba(18, 28, 44, 0.78)",
    glassSecondary: "rgba(14, 23, 38, 0.65)",
    glassTertiary: "rgba(22, 34, 52, 0.50)",
    glassFloating: "rgba(15, 25, 42, 0.88)",
    accentCyan: "#38bdf8",
    accentMagenta: "#c084fc",
    accentGold: "#fbbf24",
    accentEmerald: "#34d399",
    accentCoral: "#fb7185",
    accentSky: "#38bdf8",
    accentPurple: "#a855f7",
    textPrimary: "#f8fafc",
    textSecondary: "#94a3b8",
    textMuted: "#64748b",
    borderGlow: "rgba(56, 189, 248, 0.25)",
    borderSubtle: "rgba(255, 255, 255, 0.12)",
    borderCyanGlow: "rgba(56, 189, 248, 0.35)",
    borderPurpleGlow: "rgba(168, 85, 247, 0.30)",
  },
  shadows: {
    glowCyanSm: "0 0 10px rgba(56, 189, 248, 0.25)",
    glowCyanMd: "0 0 20px rgba(56, 189, 248, 0.35)",
    glowCyanLg: "0 0 35px rgba(56, 189, 248, 0.45)",
    glowMagentaSm: "0 0 10px rgba(192, 132, 252, 0.25)",
    glowMagentaMd: "0 0 20px rgba(192, 132, 252, 0.35)",
    glowGoldSm: "0 0 10px rgba(251, 191, 36, 0.25)",
    panelFloat: "0 28px 70px rgba(0, 0, 0, 0.65), 0 10px 30px rgba(0, 0, 0, 0.45)",
    panelGlass: "0 20px 50px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.30)",
    insetHighlight: "inset 0 1px 1px rgba(255, 255, 255, 0.18)",
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
