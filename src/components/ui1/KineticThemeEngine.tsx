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
    description: "Electric Cyan & Neon Purple space age aesthetic (AnimMaster & HorizonX Default)",
    bgRoot: "#04060c",
    panelBg: "rgba(10, 15, 28, 0.75)",
    primaryGlow: "rgba(34, 211, 238, 0.6)",
    secondaryGlow: "rgba(168, 85, 247, 0.5)",
    accentText: "#38bdf8",
    borderColor: "rgba(56, 189, 248, 0.25)",
    btnBg: "linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)",
    btnBorder: "rgba(56, 189, 248, 0.4)",
    scanlineGradient: "linear-gradient(180deg, transparent 0%, rgba(34, 211, 238, 0.04) 50%, rgba(168, 85, 247, 0.08) 51%, transparent 100%)",
    badgeBg: "rgba(34, 211, 238, 0.2)",
    badgeText: "#7dd3fc",
    chartPrimary: "#00f0ff",
    chartSecondary: "#a855f7",
  },
  cyberpunk_neon: {
    id: "cyberpunk_neon",
    name: "Cyberpunk Neon",
    description: "Laser Cyan & Acid Yellow high-contrast telemetry HUD",
    bgRoot: "#070710",
    panelBg: "rgba(12, 12, 24, 0.80)",
    primaryGlow: "rgba(34, 211, 238, 0.8)",
    secondaryGlow: "rgba(250, 204, 21, 0.7)",
    accentText: "#facc15",
    borderColor: "rgba(250, 204, 21, 0.3)",
    btnBg: "linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(250, 204, 21, 0.18) 100%)",
    btnBorder: "rgba(250, 204, 21, 0.5)",
    scanlineGradient: "linear-gradient(180deg, transparent 0%, rgba(250, 204, 21, 0.05) 50%, rgba(34, 211, 238, 0.08) 51%, transparent 100%)",
    badgeBg: "rgba(250, 204, 21, 0.2)",
    badgeText: "#fde047",
    chartPrimary: "#22d3ee",
    chartSecondary: "#facc15",
  },
  cosmic_nebula: {
    id: "cosmic_nebula",
    name: "Cosmic Nebula",
    description: "Deep Violet & Magenta pulse with starry ambient reflections",
    bgRoot: "#090514",
    panelBg: "rgba(20, 10, 35, 0.75)",
    primaryGlow: "rgba(192, 38, 211, 0.7)",
    secondaryGlow: "rgba(124, 58, 237, 0.6)",
    accentText: "#e879f9",
    borderColor: "rgba(192, 38, 211, 0.3)",
    btnBg: "linear-gradient(135deg, rgba(192, 38, 211, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)",
    btnBorder: "rgba(192, 38, 211, 0.5)",
    scanlineGradient: "linear-gradient(180deg, transparent 0%, rgba(192, 38, 211, 0.05) 50%, rgba(124, 58, 237, 0.08) 51%, transparent 100%)",
    badgeBg: "rgba(192, 38, 211, 0.25)",
    badgeText: "#f0abfc",
    chartPrimary: "#e879f9",
    chartSecondary: "#8b5cf6",
  },
  racing_telemetry: {
    id: "racing_telemetry",
    name: "Racing Telemetry",
    description: "Formula 1 High-Visibility Red & Championship Gold",
    bgRoot: "#0c0405",
    panelBg: "rgba(28, 10, 12, 0.8)",
    primaryGlow: "rgba(239, 68, 68, 0.7)",
    secondaryGlow: "rgba(245, 158, 11, 0.6)",
    accentText: "#f87171",
    borderColor: "rgba(239, 68, 68, 0.35)",
    btnBg: "linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(245, 158, 11, 0.2) 100%)",
    btnBorder: "rgba(239, 68, 68, 0.5)",
    scanlineGradient: "linear-gradient(180deg, transparent 0%, rgba(239, 68, 68, 0.05) 50%, rgba(245, 158, 11, 0.08) 51%, transparent 100%)",
    badgeBg: "rgba(239, 68, 68, 0.25)",
    badgeText: "#fca5a5",
    chartPrimary: "#ef4444",
    chartSecondary: "#f59e0b",
  },
  emerald_stealth: {
    id: "emerald_stealth",
    name: "Emerald Stealth",
    description: "Hypercar Carbon Fiber & Electric Emerald Matrix",
    bgRoot: "#030c08",
    panelBg: "rgba(8, 24, 16, 0.8)",
    primaryGlow: "rgba(16, 185, 129, 0.7)",
    secondaryGlow: "rgba(52, 211, 153, 0.6)",
    accentText: "#34d399",
    borderColor: "rgba(16, 185, 129, 0.35)",
    btnBg: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)",
    btnBorder: "rgba(16, 185, 129, 0.5)",
    scanlineGradient: "linear-gradient(180deg, transparent 0%, rgba(16, 185, 129, 0.05) 50%, rgba(52, 211, 153, 0.08) 51%, transparent 100%)",
    badgeBg: "rgba(16, 185, 129, 0.25)",
    badgeText: "#6ee7b7",
    chartPrimary: "#10b981",
    chartSecondary: "#34d399",
  },
  nordic_light: {
    id: "nordic_light",
    name: "Nordic Light Glass",
    description: "Alabaster White & Minimalist Ice Blue Glass",
    bgRoot: "#0f172a",
    panelBg: "rgba(30, 41, 59, 0.75)",
    primaryGlow: "rgba(56, 189, 248, 0.6)",
    secondaryGlow: "rgba(148, 163, 184, 0.4)",
    accentText: "#7dd3fc",
    borderColor: "rgba(148, 163, 184, 0.3)",
    btnBg: "linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(148, 163, 184, 0.15) 100%)",
    btnBorder: "rgba(56, 189, 248, 0.4)",
    scanlineGradient: "linear-gradient(180deg, transparent 0%, rgba(56, 189, 248, 0.04) 50%, rgba(203, 213, 225, 0.06) 51%, transparent 100%)",
    badgeBg: "rgba(56, 189, 248, 0.2)",
    badgeText: "#bae6fd",
    chartPrimary: "#38bdf8",
    chartSecondary: "#cbd5e1",
  },
  obsidian_blackout: {
    id: "obsidian_blackout",
    name: "Obsidian Blackout",
    description: "Monochrome Stealth Carbon & Crisp Platinum White",
    bgRoot: "#020203",
    panelBg: "rgba(12, 12, 14, 0.85)",
    primaryGlow: "rgba(255, 255, 255, 0.5)",
    secondaryGlow: "rgba(161, 161, 170, 0.4)",
    accentText: "#e4e4e7",
    borderColor: "rgba(255, 255, 255, 0.2)",
    btnBg: "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(161, 161, 170, 0.1) 100%)",
    btnBorder: "rgba(255, 255, 255, 0.3)",
    scanlineGradient: "linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.03) 50%, rgba(161, 161, 170, 0.05) 51%, transparent 100%)",
    badgeBg: "rgba(255, 255, 255, 0.15)",
    badgeText: "#f4f4f5",
    chartPrimary: "#ffffff",
    chartSecondary: "#a1a1aa",
  },
  solar_flare: {
    id: "solar_flare",
    name: "Solar Flare",
    description: "Vibrant Racing Orange & Supernova Gold Plasma",
    bgRoot: "#120602",
    panelBg: "rgba(32, 14, 8, 0.8)",
    primaryGlow: "rgba(249, 115, 22, 0.7)",
    secondaryGlow: "rgba(234, 179, 8, 0.6)",
    accentText: "#fb923c",
    borderColor: "rgba(249, 115, 22, 0.35)",
    btnBg: "linear-gradient(135deg, rgba(249, 115, 22, 0.25) 0%, rgba(234, 179, 8, 0.2) 100%)",
    btnBorder: "rgba(249, 115, 22, 0.5)",
    scanlineGradient: "linear-gradient(180deg, transparent 0%, rgba(249, 115, 22, 0.05) 50%, rgba(234, 179, 8, 0.08) 51%, transparent 100%)",
    badgeBg: "rgba(249, 115, 22, 0.25)",
    badgeText: "#ffedd5",
    chartPrimary: "#f97316",
    chartSecondary: "#eab308",
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
