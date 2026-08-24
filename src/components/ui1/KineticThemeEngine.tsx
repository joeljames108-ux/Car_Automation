import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UI1VibeTheme =
  | "kinetic_horizon"
  | "cyberpunk_neon"
  | "cosmic_nebula"
  | "racing_telemetry"
  | "emerald_stealth"
  | "nordic_light"
  | "obsidian_blackout"
  | "solar_flare";

export interface KineticThemeTokens {
  id: UI1VibeTheme;
  name: string;
  description: string;
  bgRoot: string;
  panelBg: string;
  primaryGlow: string;
  secondaryGlow: string;
  accentText: string;
  borderColor: string;
  btnBg: string;
  btnBorder: string;
  scanlineGradient: string;
  badgeBg: string;
  badgeText: string;
  chartPrimary: string;
  chartSecondary: string;
}

export const THEME_PRESETS: Record<UI1VibeTheme, KineticThemeTokens> = {
  kinetic_horizon: {
    id: "kinetic_horizon",
    name: "Kinetic Horizon",
    description: "Ice steel & quiet violet — muted aerospace glass (default)",
    bgRoot: "#080c14",
    panelBg: "rgba(15, 22, 36, 0.78)",
    primaryGlow: "rgba(127, 181, 216, 0.25)",
    secondaryGlow: "rgba(157, 143, 196, 0.20)",
    accentText: "#9fc4de",
    borderColor: "rgba(255, 255, 255, 0.12)",
    btnBg: "rgba(255, 255, 255, 0.05)",
    btnBorder: "rgba(255, 255, 255, 0.14)",
    scanlineGradient: "linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, rgba(255, 255, 255, 0.03) 51%, transparent 100%)",
    badgeBg: "rgba(127, 181, 216, 0.12)",
    badgeText: "#b9d4e8",
    chartPrimary: "#7fb5d8",
    chartSecondary: "#9d8fc4",
  },
  cyberpunk_neon: {
    id: "cyberpunk_neon",
    name: "Cyberpunk Neon",
    description: "Desaturated amber & steel telemetry — retro CRT without the glare",
    bgRoot: "#0a0a10",
    panelBg: "rgba(16, 16, 26, 0.82)",
    primaryGlow: "rgba(217, 179, 108, 0.28)",
    secondaryGlow: "rgba(127, 181, 216, 0.22)",
    accentText: "#d9b36c",
    borderColor: "rgba(217, 179, 108, 0.22)",
    btnBg: "rgba(217, 179, 108, 0.08)",
    btnBorder: "rgba(217, 179, 108, 0.28)",
    scanlineGradient: "linear-gradient(180deg, transparent 0%, rgba(217, 179, 108, 0.03) 50%, rgba(217, 179, 108, 0.04) 51%, transparent 100%)",
    badgeBg: "rgba(217, 179, 108, 0.14)",
    badgeText: "#e2c48b",
    chartPrimary: "#d9b36c",
    chartSecondary: "#7fb5d8",
  },
  cosmic_nebula: {
    id: "cosmic_nebula",
    name: "Cosmic Nebula",
    description: "Deep slate violet with soft ambient depth",
    bgRoot: "#0a0812",
    panelBg: "rgba(20, 16, 32, 0.78)",
    primaryGlow: "rgba(157, 143, 196, 0.28)",
    secondaryGlow: "rgba(127, 181, 216, 0.20)",
    accentText: "#b0a6cf",
    borderColor: "rgba(157, 143, 196, 0.22)",
    btnBg: "rgba(157, 143, 196, 0.08)",
    btnBorder: "rgba(157, 143, 196, 0.28)",
    scanlineGradient: "linear-gradient(180deg, transparent 0%, rgba(157, 143, 196, 0.03) 50%, rgba(157, 143, 196, 0.04) 51%, transparent 100%)",
    badgeBg: "rgba(157, 143, 196, 0.14)",
    badgeText: "#c4bad9",
    chartPrimary: "#9d8fc4",
    chartSecondary: "#7fb5d8",
  },
  racing_telemetry: {
    id: "racing_telemetry",
    name: "Racing Telemetry",
    description: "Muted racing red & championship gold on graphite",
    bgRoot: "#0c0708",
    panelBg: "rgba(26, 15, 17, 0.80)",
    primaryGlow: "rgba(217, 131, 141, 0.28)",
    secondaryGlow: "rgba(217, 179, 108, 0.22)",
    accentText: "#d9838d",
    borderColor: "rgba(217, 131, 141, 0.24)",
    btnBg: "rgba(217, 131, 141, 0.08)",
    btnBorder: "rgba(217, 131, 141, 0.28)",
    scanlineGradient: "linear-gradient(180deg, transparent 0%, rgba(217, 131, 141, 0.03) 50%, rgba(217, 131, 141, 0.04) 51%, transparent 100%)",
    badgeBg: "rgba(217, 131, 141, 0.14)",
    badgeText: "#e2a3ab",
    chartPrimary: "#c96f7a",
    chartSecondary: "#d9b36c",
  },
  emerald_stealth: {
    id: "emerald_stealth",
    name: "Emerald Stealth",
    description: "Carbon graphite with restrained sage-green instrumentation",
    bgRoot: "#060a08",
    panelBg: "rgba(12, 22, 18, 0.80)",
    primaryGlow: "rgba(111, 191, 154, 0.26)",
    secondaryGlow: "rgba(148, 163, 184, 0.20)",
    accentText: "#8cc7ab",
    borderColor: "rgba(111, 191, 154, 0.22)",
    btnBg: "rgba(111, 191, 154, 0.08)",
    btnBorder: "rgba(111, 191, 154, 0.26)",
    scanlineGradient: "linear-gradient(180deg, transparent 0%, rgba(111, 191, 154, 0.03) 50%, rgba(111, 191, 154, 0.04) 51%, transparent 100%)",
    badgeBg: "rgba(111, 191, 154, 0.14)",
    badgeText: "#a5d4bc",
    chartPrimary: "#6fbf9a",
    chartSecondary: "#94a3b8",
  },
  nordic_light: {
    id: "nordic_light",
    name: "Nordic Light Glass",
    description: "Alabaster white & minimalist ice-blue glass",
    bgRoot: "#0d1320",
    panelBg: "rgba(28, 37, 52, 0.76)",
    primaryGlow: "rgba(159, 196, 222, 0.26)",
    secondaryGlow: "rgba(148, 163, 184, 0.22)",
    accentText: "#b9d4e8",
    borderColor: "rgba(148, 163, 184, 0.24)",
    btnBg: "rgba(255, 255, 255, 0.06)",
    btnBorder: "rgba(255, 255, 255, 0.16)",
    scanlineGradient: "linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, rgba(255, 255, 255, 0.03) 51%, transparent 100%)",
    badgeBg: "rgba(159, 196, 222, 0.14)",
    badgeText: "#cfe2f0",
    chartPrimary: "#9fc4de",
    chartSecondary: "#cbd5e1",
  },
  obsidian_blackout: {
    id: "obsidian_blackout",
    name: "Obsidian Blackout",
    description: "Monochrome stealth carbon & crisp platinum white",
    bgRoot: "#050506",
    panelBg: "rgba(14, 14, 16, 0.85)",
    primaryGlow: "rgba(255, 255, 255, 0.18)",
    secondaryGlow: "rgba(161, 161, 170, 0.14)",
    accentText: "#e4e4e7",
    borderColor: "rgba(255, 255, 255, 0.14)",
    btnBg: "rgba(255, 255, 255, 0.06)",
    btnBorder: "rgba(255, 255, 255, 0.18)",
    scanlineGradient: "linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, rgba(255, 255, 255, 0.03) 51%, transparent 100%)",
    badgeBg: "rgba(255, 255, 255, 0.10)",
    badgeText: "#f4f4f5",
    chartPrimary: "#e4e4e7",
    chartSecondary: "#a1a1aa",
  },
  solar_flare: {
    id: "solar_flare",
    name: "Solar Flare",
    description: "Burnt orange & antique gold on warm graphite",
    bgRoot: "#100805",
    panelBg: "rgba(30, 18, 12, 0.80)",
    primaryGlow: "rgba(224, 146, 90, 0.26)",
    secondaryGlow: "rgba(217, 179, 108, 0.22)",
    accentText: "#e0a272",
    borderColor: "rgba(224, 146, 90, 0.24)",
    btnBg: "rgba(224, 146, 90, 0.08)",
    btnBorder: "rgba(224, 146, 90, 0.28)",
    scanlineGradient: "linear-gradient(180deg, transparent 0%, rgba(224, 146, 90, 0.03) 50%, rgba(224, 146, 90, 0.04) 51%, transparent 100%)",
    badgeBg: "rgba(224, 146, 90, 0.14)",
    badgeText: "#ecc3a3",
    chartPrimary: "#d98d5c",
    chartSecondary: "#d9b36c",
  },
};

interface KineticThemeContextType {
  theme: KineticThemeTokens;
  vibe: UI1VibeTheme;
  setVibe: (vibe: UI1VibeTheme) => void;
  particlesEnabled: boolean;
  setParticlesEnabled: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
}

const KineticThemeContext = createContext<KineticThemeContextType | null>(null);

export function KineticThemeProvider({ children }: { children: ReactNode }) {
  const [vibe, setVibe] = useState<UI1VibeTheme>("kinetic_horizon");
  const [particlesEnabled, setParticlesEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const theme = THEME_PRESETS[vibe] || THEME_PRESETS.kinetic_horizon;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--ui1-bg-root", theme.bgRoot);
    root.style.setProperty("--ui1-panel-bg", theme.panelBg);
    root.style.setProperty("--ui1-primary-glow", theme.primaryGlow);
    root.style.setProperty("--ui1-secondary-glow", theme.secondaryGlow);
    root.style.setProperty("--ui1-accent-text", theme.accentText);
    root.style.setProperty("--ui1-border-color", theme.borderColor);
  }, [theme]);

  return (
    <KineticThemeContext.Provider
      value={{
        theme,
        vibe,
        setVibe,
        particlesEnabled,
        setParticlesEnabled,
        soundEnabled,
        setSoundEnabled,
      }}
    >
      {children}
    </KineticThemeContext.Provider>
  );
}

export function useKineticTheme() {
  const ctx = useContext(KineticThemeContext);
  if (!ctx) {
    return {
      theme: THEME_PRESETS.kinetic_horizon,
      vibe: "kinetic_horizon" as UI1VibeTheme,
      setVibe: () => {},
      particlesEnabled: true,
      setParticlesEnabled: () => {},
      soundEnabled: true,
      setSoundEnabled: () => {},
    };
  }
  return ctx;
}
