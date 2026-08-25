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
      className="sticky top-0 z-40 bg-[#0e1626]/88 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.55)] select-none nh-edge-top"
    >
      <div className="max-w-full px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Animated Conic Logo & Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-sky-400/10 border border-sky-400/25 overflow-hidden">
            <div
              className="absolute inset-0 rounded-2xl opacity-40 pointer-events-none"
              style={{
                background: "conic-gradient(from 0deg, rgba(127,181,216,0.25), rgba(157,143,196,0.18), rgba(127,181,216,0.25))",
                animation: "vg-logo-spin 8s linear infinite",
                filter: "blur(4px)",
              }}
            />
            <Zap size={20} className="relative z-10 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-wider nh-gradient-text-cyan">
                APEX ENGINEER
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-400/10 text-sky-300 text-[10px] font-semibold border border-sky-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" /> VISION STUDIO
              </span>
            </div>
            <span className="text-[10px] text-slate-400 tracking-wider uppercase block leading-tight">
              Kinetic Spatial Architecture
            </span>
          </div>
        </div>

        {/* Center: Workspace Category Switcher + Live Clock & AI Badge */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Workspace Category Switcher */}
          <div className="flex items-center gap-1.5 bg-[#0a111e]/90 backdrop-blur-md p-1.5 rounded-full border border-white/10 shadow-inner">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    playHMITabSound();
                    onSelectCategory(cat.id);
                  }}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 whitespace-nowrap cursor-pointer ${
 isActive
 ? "bg-sky-400/15 text-sky-300 border border-sky-400/30 font-bold"
 : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
 }`}
                >
                  <span className={isActive ? "text-sky-400" : "text-slate-500"}>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Live Clock Pill (Vision Glass Header Feature) */}
          <div
            aria-label={`Current studio time: ${timeStr}`}
            className="flex items-center gap-1.5 bg-white/[0.05] border border-white/10 rounded-full px-3 py-1.5 text-xs text-slate-300 font-mono shadow-inner"
          >
            <Clock size={12} className="text-sky-400" aria-hidden="true" />
            <span className="font-semibold">{timeStr}</span>
          </div>

          {/* AI Status Badge */}
          <div
            aria-label="Apex AI Studio Agent Online"
            className="flex items-center gap-1.5 bg-sky-400/10 border border-sky-400/30 rounded-full px-2.5 py-1 text-[10px] font-bold text-sky-300"
          >
            <Sparkles size={11} className="text-sky-400 animate-pulse" />
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
            className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-sky-400/30 rounded-full px-3.5 py-1.5 text-xs text-slate-300 transition-all cursor-pointer hidden md:flex"
          >
            <Search size={13} className="text-sky-400" />
            <span className="text-[11px]">Search Studio...</span>
            <kbd className="px-1.5 py-0.5 rounded-md bg-white/10 border border-white/15 text-[10px] text-slate-300 flex items-center gap-0.5 font-mono">
              <CmdIcon size={9} /> K
            </kbd>
          </button>

          {/* Economy Telemetry */}
          <div className="hidden xl:flex items-center gap-2.5 bg-white/[0.04] border border-white/10 rounded-full px-3.5 py-1 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-mono">MO.</span>
              <span className="font-bold text-sky-300 font-mono">{month}</span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-emerald-400 font-mono">{formattedRevenue}</span>
            </div>
            <button
              onClick={() => {
                playHMIClickSound();
                onAdvanceMonth();
              }}
              title="Advance 1 Month"
              className="ml-1 px-1.5 py-0.5 rounded-md bg-sky-400/15 text-sky-300 hover:bg-sky-400/20 text-[10px] font-bold transition-all cursor-pointer border border-sky-400/30"
            >
              +1 Mo
            </button>
          </div>

          {/* Unit Switcher */}
          <div
            role="radiogroup"
            aria-label="Measurement Units"
            className="hidden sm:flex items-center gap-0.5 bg-white/[0.04] border border-white/10 p-1 rounded-full"
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
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${
 units === u
 ? "bg-sky-400 text-slate-950"
 : "text-slate-400 hover:text-slate-200"
 }`}
              >
                {u}
              </button>
            ))}
          </div>

          {/* Save / Load / Reset Controls */}
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 p-1 rounded-full">
            <button
              onClick={() => {
                playHMIClickSound();
                onSave();
              }}
              title="Save Blueprint"
              className="p-1.5 rounded-full text-slate-400 hover:text-sky-400 hover:bg-white/10 transition-all cursor-pointer"
            >
              <Save size={14} />
            </button>

            <button
              onClick={() => {
                playHMIClickSound();
                onLoad();
              }}
              title="Load Blueprint"
              className="p-1.5 rounded-full text-slate-400 hover:text-sky-400 hover:bg-white/10 transition-all cursor-pointer"
            >
              <FolderOpen size={14} />
            </button>

            <button
              onClick={() => {
                playHMIClickSound();
                onReset();
              }}
              title="Reset Build"
              className="p-1.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-all cursor-pointer"
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono font-bold tracking-wider bg-gradient-to-r from-amber-500/20 to-sky-500/20 hover:from-amber-500/30 hover:to-sky-500/30 border border-amber-400/40 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles size={12} className="text-amber-400 animate-pulse" />
              <span>GLASS UI</span>
            </button>
          )}

          {/* User Profile Avatar (Vision Glass Header Feature) */}
          <div
            aria-label="User Profile"
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#41627f] to-[#2e455c] flex items-center justify-center text-white text-xs font-bold shadow-[0_2px_10px_rgba(56,189,248,0.4)] border border-white/20 cursor-pointer hover:scale-105 transition-transform"
          >
            <User size={15} />
          </div>
        </div>
      </div>
    </header>
  );
};
