// ===================================================================
// APEX ENGINE BUILDER — SECTION NAVIGATION BAR (PHASE 3)
// Translucent Horizontal Scrollable Sequential Stage Navigation Bar
// ===================================================================

import React, { useRef, useEffect, useCallback, useState } from "react";
import { useMultiSpring, SPRING_PRESETS } from "../ui1/ux/useSpringPhysics";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
  Flame,
  Layers,
  Wrench,
  ShieldCheck,
  Award,
} from "lucide-react";
import { BuildStageId, ComponentId, PowertrainMode } from "../../sim/assemblyTypes";
import { StageInfo } from "../../state/useEngineBuilderFlow";

interface SectionNavigationBarProps {
  powertrainMode: PowertrainMode;
  currentStage: BuildStageId;
  stagesList: StageInfo[];
  flowProgressPercentage: number;
  onNavigateToStage: (stageId: BuildStageId) => void;
  onInstallCurrentStage?: () => void;
  isInstalling?: boolean;
  canInstallCurrent?: boolean;
  className?: string;
}

function SpringPill({ children, index, isCurrent }: { children: React.ReactNode; index: number; isCurrent: boolean }) {
  const [hasAppeared, setHasAppeared] = useState(false);
  useEffect(() => {
    var timer = setTimeout(function() { setHasAppeared(true); }, index * 60 + 100);
    return function() { clearTimeout(timer); };
  }, [index]);
  var sp = useMultiSpring([hasAppeared ? 1 : 0], SPRING_PRESETS.gentle);
  var opacity = sp[0];
  return (
    <div style={{ opacity: opacity, transform: "translateY(" + ((1 - opacity) * 16) + "px) scale(" + (0.9 + opacity * 0.1) + ")" }}>
      {children}
    </div>
  );
}

export function SectionNavigationBar({
  powertrainMode,
  currentStage,
  stagesList,
  flowProgressPercentage,
  onNavigateToStage,
  onInstallCurrentStage,
  isInstalling = false,
  canInstallCurrent = true,
  className = "",
}: SectionNavigationBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const activePillRef = useRef<HTMLButtonElement | null>(null);

  // Auto-scroll active pill into view with smooth animation
  useEffect(() => {
    if (activePillRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const pill = activePillRef.current;
      const containerWidth = container.clientWidth;
      const pillLeft = pill.offsetLeft;
      const pillWidth = pill.clientWidth;

      container.scrollTo({
        left: pillLeft - containerWidth / 2 + pillWidth / 2,
        behavior: "smooth",
      });
    }
  }, [currentStage]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const isEV = powertrainMode === "electric";
  const accentColor = isEV ? "purple" : "cyan";

  const installedCount = stagesList.filter((s) => s.isInstalled).length;
  const totalCount = stagesList.length;

  return (
    <div
      className={`w-full rounded-2xl bg-gradient-to-r from-slate-950/40 via-slate-900/30 to-slate-950/40 border border-white/10 backdrop-blur-xl p-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-2 select-none ${className}`}
    >
      {/* ── TOP META BAR: PROGRESS & QUICK STATUS ── */}
      <div className="flex items-center justify-between px-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          {isEV ? (
            <Zap size={14} className="text-amber-400 animate-pulse" />
          ) : (
            <Flame size={14} className="text-amber-400 animate-pulse" />
          )}
          <span className="font-extrabold text-slate-200 uppercase tracking-wider">
            {isEV ? "Electric Powertrain Pipeline" : "ICE Assembly Line"}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-base-900 border border-slate-800 text-[10px] text-slate-400">
            {installedCount} of {totalCount} Installed
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[10px] text-slate-400">Completion</span>
            <div className="w-24 h-2 rounded-full bg-base-950 border border-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isEV
                    ? "bg-gradient-to-r from-amber-500 to-emerald-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]"
                    : "bg-gradient-to-r from-amber-500 to-amber-500 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                }`}
                style={{ width: `${flowProgressPercentage}%` }}
              />
            </div>
            <span className="text-xs font-extrabold text-amber-300">{flowProgressPercentage}%</span>
          </div>
        </div>
      </div>

      {/* ── HORIZONTAL SCROLLABLE STAGE PILLS ROW ── */}
      <div className="relative flex items-center gap-1.5">
        {/* Left Scroll Arrow */}
        <button
          onClick={() => handleScroll("left")}
          className="p-1.5 rounded-xl bg-base-950/80 hover:bg-base-800 text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer shrink-0 active:scale-90"
          title="Scroll Left"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1"
        >
          {/* Powertrain Select Pill */}
          <SpringPill index={0} isCurrent={currentStage === "powertrain_select"}>
          <button
            type="button"
            onClick={() => onNavigateToStage("powertrain_select")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer border ${
              currentStage === "powertrain_select"
                ? "bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] scale-105"
                : "bg-base-950/80 text-slate-400 border-base-800 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <Layers size={13} />
            <span>Architecture</span>
          </button>
          </SpringPill>

          {/* Component Stage Pills */}
          {stagesList.map((stage) => {
            const isCurrent = stage.id === currentStage;
            const isInstalled = stage.isInstalled;
            const isUnlocked = stage.isUnlocked;

            return (
              <SpringPill index={stage.index + 1} isCurrent={isCurrent}>
              <button
                key={stage.id}
                ref={isCurrent ? activePillRef : null}
                type="button"
                disabled={!isUnlocked}
                onClick={() => onNavigateToStage(stage.id)}
                className={`group relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 border cursor-pointer ${
                  !isUnlocked
                    ? "bg-base-950/40 text-slate-600 border-slate-900 cursor-not-allowed opacity-50"
                    : isCurrent
                    ? isEV
                      ? "bg-amber-500 text-black border-amber-300 shadow-[0_0_18px_rgba(192,132,252,0.6)] scale-105"
                      : "bg-amber-500 text-black border-amber-300 shadow-[0_0_18px_rgba(34,211,238,0.6)] scale-105"
                    : isInstalled
                    ? "bg-base-900/90 text-slate-200 border-emerald-500/40 hover:border-emerald-400 hover:bg-base-850"
                    : "bg-base-950/80 text-slate-400 border-base-800 hover:text-slate-200 hover:border-slate-700 hover:bg-base-900"
                }`}
                title={stage.title}
              >
                {/* Stage Icon Status */}
                <span className="shrink-0">
                  {isInstalled ? (
                    <CheckCircle2
                      size={13}
                      className={isCurrent ? "text-black" : "text-emerald-400"}
                    />
                  ) : !isUnlocked ? (
                    <Lock size={12} className="text-slate-600" />
                  ) : isCurrent ? (
                    <Sparkles size={13} className="text-black animate-spin" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors inline-block" />
                  )}
                </span>

                {/* Stage Short Name */}
                <span className="whitespace-nowrap">{stage.shortName}</span>

                {/* Index Sub-badge */}
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                    isCurrent
                      ? "bg-amber-200/60 text-amber-900 font-extrabold"
                      : isInstalled
                      ? "bg-amber-100/60 text-amber-700"
                      : "bg-amber-100/50 text-amber-600"
                  }`}
                >
                  #{stage.index + 1}
                </span>
              </button>
              </SpringPill>
            );
          })}

          {/* Finish / Summary Pill */}
          <SpringPill index={stagesList.length + 1} isCurrent={currentStage === "finish"}>
          <button
            type="button"
            onClick={() => onNavigateToStage("finish")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer border ${
              currentStage === "finish"
                ? "bg-gradient-to-r from-emerald-400 to-amber-400 text-black border-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.5)] scale-105"
                : installedCount === totalCount
                ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50"
                : "bg-base-950/80 text-slate-500 border-base-850 hover:text-slate-300"
            }`}
          >
            <Award size={13} />
            <span>Finish Summary</span>
          </button>
          </SpringPill>
        </div>

        {/* Right Scroll Arrow */}
        <button
          onClick={() => handleScroll("right")}
          className="p-1.5 rounded-xl bg-base-950/80 hover:bg-base-800 text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer shrink-0 active:scale-90"
          title="Scroll Right"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
