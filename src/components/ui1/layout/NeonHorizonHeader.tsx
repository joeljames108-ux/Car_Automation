import React, { useState, useEffect } from "react";
import {
  Zap,
  Search,
  Command as CmdIcon,
  Save,
  FolderOpen,
  RotateCcw,
  Sparkles,
  Clock,
  User,
  Sliders,
  DollarSign,
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
      aria-label="Quanta Studio Header"
      className="sticky top-0 z-40 border-b select-none transition-colors"
      style={{
        background: "rgba(8, 10, 16, 0.88)",
        backdropFilter: "blur(40px) saturate(200%)",
        WebkitBackdropFilter: "blur(40px) saturate(200%)",
        borderColor: "rgba(255, 255, 255, 0.08)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.50), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
      }}
    >
      <div className="max-w-full px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Quanta Studio Logo & Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="relative flex items-center justify-center w-10 h-10 rounded-2xl border overflow-hidden"
            style={{
              background: "rgba(0, 245, 212, 0.08)",
              borderColor: "rgba(0, 245, 212, 0.3)",
              boxShadow: "0 0 20px rgba(0, 245, 212, 0.15)",
            }}
          >
            <div
              className="absolute inset-0 rounded-2xl opacity-40 pointer-events-none"
              style={{
                background: "conic-gradient(from 0deg, rgba(0,245,212,0.35), rgba(255,183,3,0.25), rgba(131,56,236,0.2), rgba(0,245,212,0.35))",
                animation: "vg-logo-spin 8s linear infinite",
                filter: "blur(4px)",
              }}
            />
            <Zap size={20} className="relative z-10 text-[#00F5D4]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-wider text-white font-sans">
                APEX QUANTA
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-[#00F5D4]/10 text-[#00F5D4] border-[#00F5D4]/30 shadow-[0_0_10px_rgba(0,245,212,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-pulse" />
                STUDIO 1
              </span>
            </div>
            <span className="text-[10px] tracking-wider uppercase block leading-tight font-mono text-zinc-400">
              Automotive Engineering OS
            </span>
          </div>
        </div>

        {/* Center: Workspace Category Switcher */}
        <div className="hidden lg:flex items-center gap-3">
          <div
            className="flex items-center gap-1.5 p-1 rounded-full border"
            style={{
              background: "rgba(12, 16, 26, 0.9)",
              backdropFilter: "blur(20px)",
              borderColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
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
                      ? "bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/35 font-bold shadow-[0_0_12px_rgba(0,245,212,0.2)]"
                      : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <span className={isActive ? "text-[#00F5D4]" : "text-zinc-400"}>
                    {cat.icon}
                  </span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Live Studio Clock */}
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-mono bg-white/[0.04] border border-white/8 text-zinc-300">
            <Clock size={12} className="text-[#00F5D4]" />
            <span className="font-semibold">{timeStr}</span>
          </div>

          {/* AI Status Badge */}
          <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4]">
            <Sparkles size={11} className="animate-pulse" />
            <span>NEURAL READY</span>
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
            className="flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs transition-all cursor-pointer hidden md:flex bg-white/[0.04] border border-white/8 text-zinc-300 hover:border-white/15"
          >
            <Search size={13} className="text-[#00F5D4]" />
            <span className="text-[11px]">Search...</span>
            <kbd className="px-1.5 py-0.5 rounded-md bg-white/10 border border-white/15 text-[10px] text-zinc-300 flex items-center gap-0.5 font-mono">
              <CmdIcon size={9} /> K
            </kbd>
          </button>

          {/* Economy Telemetry */}
          <div className="hidden xl:flex items-center gap-2.5 rounded-full px-3.5 py-1 text-xs bg-white/[0.04] border border-white/8">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-400 uppercase font-mono">MO.</span>
              <span className="font-bold font-mono text-white">{month}</span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            <div className="flex items-center gap-1.5">
              <DollarSign size={12} className="text-[#10B981]" />
              <span className="font-bold font-mono text-[#10B981]">{formattedRevenue}</span>
            </div>
            <button
              onClick={() => {
                playHMIClickSound();
                onAdvanceMonth();
              }}
              title="Advance 1 Month"
              className="ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/30 hover:bg-[#00F5D4]/25"
            >
              +1 Mo
            </button>
          </div>

          {/* Unit Switcher */}
          <div
            role="radiogroup"
            aria-label="Measurement Units"
            className="hidden sm:flex items-center gap-0.5 p-1 rounded-full bg-white/[0.04] border border-white/8"
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
                    ? "bg-[#00F5D4] text-zinc-950 font-black shadow-[0_0_8px_#00F5D4]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {u}
              </button>
            ))}
          </div>

          {/* Save / Load / Reset Controls */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/8">
            <button
              onClick={() => {
                playHMIClickSound();
                onSave();
              }}
              title="Save Blueprint"
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Save size={14} />
            </button>

            <button
              onClick={() => {
                playHMIClickSound();
                onLoad();
              }}
              title="Load Blueprint"
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <FolderOpen size={14} />
            </button>

            <button
              onClick={() => {
                playHMIClickSound();
                onReset();
              }}
              title="Reset Build"
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Switch to Glass UI (UI 4) Button */}
          {onSetUiTheme && (
            <button
              onClick={() => {
                playHMIClickSound();
                onSetUiTheme("theme4");
              }}
              title="Switch to Vision Glass UI (UI 4)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap border bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
            >
              <Sparkles size={12} className="animate-pulse text-amber-300" />
              <span>GLASS UI</span>
            </button>
          )}

          {/* User Profile Avatar */}
          <div
            aria-label="User Profile"
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-105 transition-transform bg-gradient-to-br from-zinc-800 to-zinc-950 text-[#00F5D4] border border-[#00F5D4]/30 shadow-[0_0_10px_rgba(0,245,212,0.2)]"
          >
            <User size={15} />
          </div>
        </div>
      </div>
    </header>
  );
};
