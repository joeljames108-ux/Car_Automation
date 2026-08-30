import React, { useState, useEffect } from "react";
import {
  Zap,
  Search,
  Command as CmdIcon,
  Save,
  FolderOpen,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Ruler,
  Clock,
  User,
} from "lucide-react";
import { playHMIClickSound, playHMITabSound } from "../../../utils/hmiSoundSynth";
import type { WorkspaceCategory } from "../../ui/UI1Layout";

export interface NeonHorizonHeaderProps {
  categories: { id: WorkspaceCategory; label: string; icon: React.ReactNode }[];
  activeCategory: WorkspaceCategory;
  onSelectCategory: (cat: WorkspaceCategory) => void;
  month: number;
  revenue: number;
  onAdvanceMonth: () => void;
  units: "metric" | "imperial";
  onSetUnits: (u: "metric" | "imperial") => void;
  onOpenSearch: () => void;
  onSave: () => void;
  onLoad: () => void;
  onReset: () => void;
  uiTheme?: "theme1" | "theme2" | "theme3" | "theme4";
  onSetUiTheme?: (theme: "theme1" | "theme2" | "theme3" | "theme4") => void;
}

export const NeonHorizonHeader: React.FC<NeonHorizonHeaderProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  month,
  revenue,
  onAdvanceMonth,
  units,
  onSetUnits,
  onOpenSearch,
  onSave,
  onLoad,
  onReset,
  uiTheme = "theme1",
  onSetUiTheme,
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formattedRevenue =
    revenue >= 1e6
      ? `$${(revenue / 1e6).toFixed(1)}M`
      : `$${(revenue / 1e3).toFixed(1)}k`;

  return (
    <header
      role="banner"
      aria-label="Vision Glass Studio Header"
      className="sticky top-0 z-40 border-b select-none"
      style={{
        background: "rgba(10, 18, 35, 0.72)",
        backdropFilter: "blur(60px) saturate(220%)",
        WebkitBackdropFilter: "blur(60px) saturate(220%)",
        borderColor: "rgba(95, 168, 200, 0.08)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
      }}
    >
      <div className="max-w-full px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Animated Conic Logo & Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl border overflow-hidden"
            style={{ background: "rgba(95, 168, 200, 0.08)", borderColor: "rgba(95, 168, 200, 0.18)" }}>
            <div
              className="absolute inset-0 rounded-2xl opacity-40 pointer-events-none"
              style={{
                background: "conic-gradient(from 0deg, rgba(95,168,200,0.20), rgba(120,104,160,0.12), rgba(90,175,136,0.10), rgba(95,168,200,0.20))",
                animation: "vg-logo-spin 8s linear infinite",
                filter: "blur(4px)",
              }}
            />
            <Zap size={20} className="relative z-10" style={{ color: "#5fa8c8" }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-wider" style={{ color: "#e4eaf4" }}>
                APEX ENGINEER
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                style={{ background: "rgba(95, 168, 200, 0.08)", color: "#8cbcd0", borderColor: "rgba(95, 168, 200, 0.20)" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#5fa8c8" }} /> VISION STUDIO
              </span>
            </div>
            <span className="text-[10px] tracking-wider uppercase block leading-tight" style={{ color: "#506070" }}>
              Kinetic Spatial Architecture
            </span>
          </div>
        </div>

        {/* Center: Workspace Category Switcher + Live Clock & AI Badge */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Workspace Category Switcher */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-full border shadow-inner"
            style={{ background: "rgba(8, 14, 28, 0.85)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.06)" }}>
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    playHMITabSound();
                    onSelectCategory(cat.id);
                  }}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 whitespace-nowrap cursor-pointer"
                  style={{
                    background: isActive ? "rgba(95, 168, 200, 0.12)" : "transparent",
                    color: isActive ? "#8cbcd0" : "#506070",
                    border: isActive ? "1px solid rgba(95, 168, 200, 0.20)" : "1px solid transparent",
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  <span style={{ color: isActive ? "#5fa8c8" : "#506070" }}>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Live Clock Pill (Vision Glass Header Feature) */}
          <div
            aria-label={`Current studio time: ${timeStr}`}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-mono shadow-inner"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#8494a8" }}
          >
            <Clock size={12} style={{ color: "#5fa8c8" }} aria-hidden="true" />
            <span className="font-semibold">{timeStr}</span>
          </div>

          {/* AI Status Badge */}
          <div
            aria-label="Apex AI Studio Agent Online"
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
            style={{ background: "rgba(95, 168, 200, 0.06)", border: "1px solid rgba(95, 168, 200, 0.15)", color: "#8cbcd0" }}
          >
            <Sparkles size={11} style={{ color: "#5fa8c8" }} className="animate-pulse" />
            <span>AI ONLINE</span>
          </div>
        </div>

        {/* Right: Search, Economy Telemetry, Units & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Search */}
          <button
            onClick={() => {
              playHMIClickSound();
              onOpenSearch();
            }}
            className="flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs transition-all cursor-pointer hidden md:flex"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#8494a8" }}
          >
            <Search size={13} style={{ color: "#5fa8c8" }} />
            <span className="text-[11px]">Search Studio...</span>
            <kbd className="px-1.5 py-0.5 rounded-md bg-white/10 border border-white/15 text-[10px] text-amber-100/80 flex items-center gap-0.5 font-mono">
              <CmdIcon size={9} /> K
            </kbd>
          </button>

          {/* Economy Telemetry */}
          <div className="hidden xl:flex items-center gap-2.5 rounded-full px-3.5 py-1 text-xs"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-amber-200/60 uppercase font-mono">MO.</span>
              <span className="font-bold font-mono" style={{ color: "#8cbcd0" }}>{month}</span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            <div className="flex items-center gap-1.5">
              <span className="font-bold font-mono" style={{ color: "#5aaf88" }}>{formattedRevenue}</span>
            </div>
            <button
              onClick={() => {
                playHMIClickSound();
                onAdvanceMonth();
              }}
              title="Advance 1 Month"
              className="ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer border"
              style={{ background: "rgba(95, 168, 200, 0.10)", color: "#8cbcd0", borderColor: "rgba(95, 168, 200, 0.18)" }}
            >
              +1 Mo
            </button>
          </div>

          {/* Unit Switcher */}
          <div
            role="radiogroup"
            aria-label="Measurement Units"
            className="hidden sm:flex items-center gap-0.5 p-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {(["metric", "imperial"] as const).map((u) => (
              <button
                key={u}
                role="radio"
                aria-checked={units === u}
                onClick={() => {
                  playHMIClickSound();
                  onSetUnits(u);
                }}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer"
                style={{
                  background: units === u ? "#5fa8c8" : "transparent",
                  color: units === u ? "#070b14" : "#506070",
                }}
              >
                {u}
              </button>
            ))}
          </div>

          {/* Save / Load / Reset Controls */}
          <div className="flex items-center gap-1 p-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <button
              onClick={() => {
                playHMIClickSound();
                onSave();
              }}
              title="Save Blueprint"
              className="p-1.5 rounded-full transition-all cursor-pointer"
              style={{ color: "#506070" }}
            >
              <Save size={14} />
            </button>

            <button
              onClick={() => {
                playHMIClickSound();
                onLoad();
              }}
              title="Load Blueprint"
              className="p-1.5 rounded-full transition-all cursor-pointer"
              style={{ color: "#506070" }}
            >
              <FolderOpen size={14} />
            </button>

            <button
              onClick={() => {
                playHMIClickSound();
                onReset();
              }}
              title="Reset Build"
              className="p-1.5 rounded-full transition-all cursor-pointer"
              style={{ color: "#506070" }}
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Quick UI Mode Switcher (UI 1 <-> Glass UI) */}
          {onSetUiTheme && (
            <button
              onClick={() => {
                playHMIClickSound();
                onSetUiTheme("theme4");
              }}
              title="Switch to Vision Glass UI"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap border"
              style={{ background: "rgba(196, 168, 96, 0.08)", borderColor: "rgba(196, 168, 96, 0.18)", color: "#c4a860" }}
            >
              <Sparkles size={12} className="animate-pulse" style={{ color: "#c4a860" }} />
              <span>GLASS UI</span>
            </button>
          )}

          {/* User Profile Avatar (Vision Glass Header Feature) */}
          <div
            aria-label="User Profile"
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-105 transition-transform"
            style={{ background: "linear-gradient(135deg, #1a3048, #0c1c30)", color: "#8cbcd0", border: "1px solid rgba(95, 168, 200, 0.20)", boxShadow: "0 2px 10px rgba(95, 168, 200, 0.15)" }}
          >
            <User size={15} />
          </div>
        </div>
      </div>
    </header>
  );
};
