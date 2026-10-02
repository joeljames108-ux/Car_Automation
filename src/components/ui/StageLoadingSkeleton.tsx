import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Activity, Cpu, CheckCircle2, Circle, ArrowRight, ShieldCheck,
  Terminal, FastForward, Play, ChevronLeft, ChevronRight,
  Lightbulb, Zap, Keyboard, HelpCircle
} from "lucide-react";
import { getStageLoadingConfig } from "./loading/stageLoadingData";
import { StageLoadingSchematics } from "./loading/StageLoadingSchematics";
import { getGameTipsForStage, type GameTip } from "./loading/gameTipsData";

export interface StageLoadingSkeletonProps {
  stageName?: string;
  onComplete?: () => void;
  onSkip?: () => void;
  durationMs?: number;
  autoComplete?: boolean;
}

// 5 Standard Lifecycle Phases matching automotive CAD pipeline
const PIPELINE_PHASES = [
  { id: "init", label: "Initializing", min: 0, max: 20 },
  { id: "load", label: "Loading", min: 20, max: 45 },
  { id: "compile", label: "Compiling", min: 45, max: 72 },
  { id: "sync", label: "Syncing", min: 72, max: 94 },
  { id: "ready", label: "Ready", min: 94, max: 100 },
];

export const StageLoadingSkeleton: React.FC<StageLoadingSkeletonProps> = ({
  stageName,
  onComplete,
  onSkip,
  durationMs = 950,
  autoComplete = true,
}) => {
  const [progress, setProgress] = useState(0);
  const [activeSubtask, setActiveSubtask] = useState(0);
  const [logIndex, setLogIndex] = useState(0);

  const config = useMemo(() => getStageLoadingConfig(stageName), [stageName]);
  const tipsList = useMemo(() => getGameTipsForStage(stageName), [stageName]);

  // Game Tips state
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * tipsList.length));
  const [tipKey, setTipKey] = useState(0);
  const [isTipPaused, setIsTipPaused] = useState(false);

  const currentTip: GameTip = tipsList[tipIndex] || tipsList[0];

  const handleSkip = useCallback(() => {
    React.startTransition(() => {
      if (onSkip) {
        onSkip();
      } else if (onComplete) {
        onComplete();
      }
    });
  }, [onSkip, onComplete]);

  // Global ESC key to skip loading
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSkip]);

  // Smooth progressive loading animation based on durationMs
  useEffect(() => {
    const startTime = performance.now();
    let animId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / durationMs, 1);
      // Ease-out cubic curve for natural deceleration feel
      const easeOut = 1 - Math.pow(1 - t, 3);
      const currentVal = Math.min(100, Math.round(easeOut * 100));

      setProgress(currentVal);

      // Advance subtasks proportionally
      const subtaskStep = Math.min(
        Math.floor(t * config.subtasks.length),
        config.subtasks.length - 1
      );
      setActiveSubtask(subtaskStep);

      // Advance logs proportionally
      const logStep = Math.min(
        Math.floor(t * config.telemetryLogs.length),
        config.telemetryLogs.length - 1
      );
      setLogIndex(logStep);

      if (t < 1) {
        animId = requestAnimationFrame(tick);
      } else {
        if (autoComplete && onComplete) {
          // Brief pause at 100% to let user see "Ready" status
          const finishTimer = setTimeout(() => {
            React.startTransition(() => {
              onComplete();
            });
          }, 90);
          return () => clearTimeout(finishTimer);
        }
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [durationMs, config.subtasks.length, config.telemetryLogs.length, autoComplete, onComplete]);

  // Auto-cycle tips every 4.5 seconds unless hovered/paused
  useEffect(() => {
    if (isTipPaused) return;
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tipsList.length);
      setTipKey((k) => k + 1);
    }, 4500);
    return () => clearInterval(timer);
  }, [tipsList.length, isTipPaused]);

  const handlePrevTip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTipIndex((prev) => (prev - 1 + tipsList.length) % tipsList.length);
    setTipKey((k) => k + 1);
  };

  const handleNextTip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTipIndex((prev) => (prev + 1) % tipsList.length);
    setTipKey((k) => k + 1);
  };

  const moduleCode = (stageName || "main_menu").toUpperCase();

  return (
    <div
      onClick={handleSkip}
      className="w-full h-full min-h-[620px] rounded-3xl bg-gradient-to-br from-[#fcfbf9]/95 via-[#f8f5ee]/90 to-[#f1ede2]/90 border-2 border-[#e6dfd2] backdrop-blur-2xl p-5 sm:p-7 lg:p-8 flex flex-col justify-between relative overflow-hidden shadow-[0_16px_45px_rgba(20,20,20,0.06)] select-none font-sans cursor-pointer group"
      title="Click anywhere or press ESC to skip loading transition"
    >
      {/* ── Dynamic Ambient Themed Light Glows ── */}
      <div
        className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-25"
        style={{ backgroundColor: config.accentColor }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-20"
        style={{ backgroundColor: config.accentColor }}
      />

      {/* ── 1. TOP HEADER BAR (Matching Reference Subsystem Pipeline Header) ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5dfd3]/80 pb-4 relative z-10">
        <div className="flex items-center gap-3.5">
          {/* Domain Icon Badge */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border transition-all duration-300 transform group-hover:scale-105"
            style={{
              backgroundColor: config.badgeBg,
              borderColor: `${config.accentColor}35`,
              boxShadow: `0 4px 14px ${config.accentColor}25`,
            }}
          >
            <span className="scale-110 drop-shadow-sm">{config.icon}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-slate-900 tracking-wider uppercase flex items-center gap-2">
                <span>INITIALIZING SUBSYSTEM PIPELINE</span>
                <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: config.accentColor }} />
              </span>
            </div>

            <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
              <span>Loading module <strong className="font-bold text-slate-800">[{moduleCode}]</strong></span>
              <span className="text-slate-300">•</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">{config.category}</span>
            </div>
          </div>
        </div>

        {/* Live Stream Status Badge & Quick Skip Pill */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-700 bg-white/80 px-3.5 py-1.5 rounded-xl border border-[#ded8cb] shadow-xs">
            <Zap size={14} className="animate-pulse" style={{ color: config.accentColor }} />
            <span className="font-bold">120Hz STREAM</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 font-mono text-[11px] text-slate-600 bg-white/60 px-3 py-1.5 rounded-xl border border-[#ded8cb]">
            <Cpu size={13} className="text-slate-500" />
            <span>CAD MESHOPT</span>
          </div>

          {/* Skip Button Pill */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSkip();
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-600 hover:text-slate-950 border border-[#ded8cb] text-xs font-mono font-bold shadow-xs hover:shadow-sm transition-all"
            title="Skip loading transition (ESC)"
          >
            <span className="text-[10px] bg-slate-100 border border-slate-300 text-slate-500 px-1 py-0.2 rounded font-sans">ESC</span>
            <span className="hidden sm:inline">Skip</span>
            <FastForward size={12} className="text-slate-400 group-hover:text-slate-700" />
          </button>
        </div>
      </div>

      {/* ── 2. CENTER-TOP: LOADING PERCENTAGE BAR & 5-STAGE LIFECYCLE STEPS ── */}
      <div className="my-3 space-y-2.5 relative z-10">
        {/* Loading System Header & Large Percentage Counter */}
        <div className="w-full bg-white/90 p-4 rounded-2xl border border-[#e5dfd3] shadow-xs">
          <div className="flex justify-between items-center text-xs font-mono mb-2">
            <span className="font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: config.accentColor }} />
              <span>Loading System</span>
              <span className="text-slate-400 font-normal hidden sm:inline">· {config.label}</span>
            </span>
            <span
              className="font-black text-lg sm:text-xl font-mono tracking-tight transition-all duration-75"
              style={{ color: config.accentColor }}
            >
              {progress}%
            </span>
          </div>

          {/* Progress Track */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 p-0.5 relative">
            <div
              className="h-full rounded-full transition-all duration-150 relative overflow-hidden flex items-center justify-end"
              style={{
                width: `${Math.max(2, progress)}%`,
                background: `linear-gradient(90deg, ${config.accentColor}, #f59e0b, ${config.accentColor})`,
                boxShadow: `0 0 16px ${config.accentColor}60`,
              }}
            >
              {/* Shimmer sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full animate-shimmer pointer-events-none" />
              {/* Glowing Leading Edge Dot */}
              <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_#ffffff] mr-0.5 shrink-0" />
            </div>
          </div>
        </div>

        {/* 5-Stage Lifecycle Stepper (Matching User Reference: Initializing -> Loading -> Compiling -> Syncing -> Ready) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PIPELINE_PHASES.map((phase) => {
            const isCompleted = progress > phase.max;
            const isActive = progress >= phase.min && progress <= phase.max;
            const isUpcoming = progress < phase.min;

            return (
              <div
                key={phase.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 border text-left shadow-xs"
                style={{
                  backgroundColor: isActive
                    ? `${config.accentColor}18`
                    : isCompleted
                    ? "#ffffff"
                    : "rgba(255, 255, 255, 0.45)",
                  borderColor: isActive
                    ? config.accentColor
                    : isCompleted
                    ? "#cbd5e1"
                    : "#e2e8f0",
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                }}
              >
                {isCompleted ? (
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                ) : isActive ? (
                  <Play size={12} className="fill-current animate-pulse shrink-0" style={{ color: config.accentColor }} />
                ) : (
                  <Circle size={12} className="text-slate-300 shrink-0" />
                )}
                <span
                  className="text-xs font-mono font-bold leading-tight truncate"
                  style={{
                    color: isActive ? "#0f172a" : isCompleted ? "#334155" : "#94a3b8",
                  }}
                >
                  {isCompleted ? `✓ ${phase.label}` : isActive ? `▶ ${phase.label}` : `○ ${phase.label}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. CENTER: 3-CARD INFORMATIVE DECK (GAME TIPS, 3D CAD SCHEMATIC, SHORTCUTS) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2 relative z-10 flex-1 min-h-[220px]">
        {/* CARD 1: ROTATING GAME TIPS & AUTOMOTIVE SECRETS */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleNextTip(e);
          }}
          onMouseEnter={() => setIsTipPaused(true)}
          onMouseLeave={() => setIsTipPaused(false)}
          className="rounded-2xl bg-white/95 border border-[#e5dfd3] p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden group/tip cursor-pointer"
          title="Click to see next tip (Auto-cycles every 4.5s)"
        >
          {/* Subtle Accent Glow */}
          <div
            className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none"
            style={{ backgroundColor: currentTip.badgeColor }}
          />

          <div>
            {/* Tip Category Badge & Navigation Controls */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span
                className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full font-mono border flex items-center gap-1.5"
                style={{
                  backgroundColor: `${currentTip.badgeColor}15`,
                  borderColor: `${currentTip.badgeColor}35`,
                  color: currentTip.badgeColor,
                }}
              >
                <span>{currentTip.icon}</span>
                <span>{currentTip.categoryLabel}</span>
              </span>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                <span className="hidden sm:inline text-slate-400 font-bold mr-1">
                  {tipIndex + 1}/{tipsList.length}
                </span>
                <button
                  type="button"
                  onClick={handlePrevTip}
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                  title="Previous Tip"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleNextTip}
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                  title="Next Tip"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Tip Title & Body */}
            <div key={tipKey} className="animate-tipFadeIn">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5 mb-1.5">
                <Lightbulb size={14} className="text-amber-500 shrink-0" />
                <span>{currentTip.title}</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {currentTip.tip}
              </p>
            </div>
          </div>

          {/* Tip Impact Tag & Auto-Advance Progress Line */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
            {currentTip.impact && (
              <div className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/80 flex items-center gap-1 truncate">
                <span className="font-bold">IMPACT:</span>
                <span className="truncate">{currentTip.impact}</span>
              </div>
            )}
            {/* Auto-cycle mini-progress bar */}
            <div className="w-full h-0.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                key={`bar-${tipKey}`}
                className="h-full rounded-full animate-tipProgress"
                style={{ backgroundColor: currentTip.badgeColor }}
              />
            </div>
          </div>
        </div>

        {/* CARD 2: BESPOKE 3D CAD SCHEMATIC (TAILORED TO OPTION) */}
        <div className="rounded-2xl bg-white/90 border border-[#e5dfd3] p-4 flex flex-col justify-between shadow-xs relative overflow-hidden">
          {/* Blueprint Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1ede2_1px,transparent_1px),linear-gradient(to_bottom,#f1ede2_1px,transparent_1px)] bg-[size:22px_22px] opacity-75 pointer-events-none" />

          {/* Top Schematic Header Pill */}
          <div className="relative z-10 flex items-center justify-between text-[10px] font-mono font-bold text-slate-600 mb-2 border-b border-slate-200/60 pb-1.5">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: config.accentColor }} />
              <span>CAD SCHEMATIC</span>
            </span>
            <span className="text-slate-400 font-normal">G2 CURVATURE OK</span>
          </div>

          {/* Dynamic Schematic Component */}
          <div className="relative z-10 w-full flex-1 flex items-center justify-center my-auto min-h-[120px]">
            <StageLoadingSchematics config={config} />
          </div>

          {/* Subtitle Telemetry */}
          <div className="relative z-10 text-[10px] font-mono text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
            <span>{config.schematicType.toUpperCase()} TOPOLOGY</span>
            <span className="text-emerald-700 font-bold">SNAPPED 0,0,0</span>
          </div>
        </div>

        {/* CARD 3: KEYBOARD SHORTCUTS, CONTROLS & STAGE METRICS */}
        <div className="rounded-2xl bg-white/90 border border-[#e5dfd3] p-4 sm:p-5 flex flex-col justify-between shadow-xs relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-700 mb-2 border-b border-slate-200/60 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Keyboard size={13} className="text-slate-500" />
                <span>HOTKEYS & SYSTEM STATUS</span>
              </span>
              <span className="text-slate-400">SHORTCUTS</span>
            </div>

            {/* Essential Shortcuts */}
            <div className="space-y-1.5 text-xs font-mono my-2">
              <div className="flex items-center justify-between text-slate-700 bg-slate-50/80 px-2 py-1 rounded-lg border border-slate-200/60">
                <span className="text-slate-500 text-[11px]">Skip Loading</span>
                <span className="px-1.5 py-0.5 rounded bg-white text-slate-800 border border-slate-300 font-bold text-[10px] shadow-2xs">ESC</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 bg-slate-50/80 px-2 py-1 rounded-lg border border-slate-200/60">
                <span className="text-slate-500 text-[11px]">Developer Sandbox</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-300 font-bold text-[10px] shadow-2xs">F8</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 bg-slate-50/80 px-2 py-1 rounded-lg border border-slate-200/60">
                <span className="text-slate-500 text-[11px]">Dev Terminal Console</span>
                <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-900 border border-sky-300 font-bold text-[10px] shadow-2xs">F9</span>
              </div>
            </div>
          </div>

          {/* Active Subtask Indicator */}
          <div className="pt-2 border-t border-slate-200/60 text-[11px] font-mono">
            <span className="text-slate-400 block text-[9px] font-bold uppercase mb-0.5">CURRENT STAGE SUBTASK:</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-800 truncate" title={config.subtasks[activeSubtask]}>
              <ArrowRight size={12} className="animate-pulse shrink-0" style={{ color: config.accentColor }} />
              <span className="truncate">{config.subtasks[activeSubtask]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. LIVE TELEMETRY TERMINAL LOGS & OPTION METRICS (Matching Reference Footer) ── */}
      <div className="mt-3 pt-3 border-t border-[#e5dfd3]/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono relative z-10">
        {/* Left Telemetry Indicators (Matching reference: MEM: OK · SHADERS: COMPILING · VALIDATING) */}
        <div className="flex items-center gap-2.5 text-slate-700 flex-wrap">
          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-white/70 px-2 py-0.5 rounded-md border border-[#e5dfd3]">
            <span>☿ MEM:</span> <span className="text-emerald-700">OK</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-white/70 px-2 py-0.5 rounded-md border border-[#e5dfd3]">
            <span>∇ SHADERS:</span> <span className="text-sky-700">{progress >= 72 ? "COMPILED" : "COMPILING"}</span>
          </span>
          <span className="hidden md:flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-white/70 px-2 py-0.5 rounded-md border border-[#e5dfd3]">
            <span>○ BUS:</span> <span className="text-amber-700">VALIDATED</span>
          </span>

          {/* Telemetry Console Log */}
          <div className="flex items-center gap-1.5 text-slate-700 ml-1 truncate max-w-sm sm:max-w-md">
            <Terminal size={13} style={{ color: config.accentColor }} className="shrink-0" />
            <span className="text-[11px] text-slate-800 font-medium truncate">
              {config.telemetryLogs[logIndex] || config.telemetryLogs[0]}
            </span>
          </div>
        </div>

        {/* Right Status Pill (Matching reference: System INITIALIZING / READY) */}
        <div className="flex items-center gap-2 text-[11px] font-bold shrink-0">
          <span
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono"
            style={{
              backgroundColor: progress >= 95 ? "#ecfdf5" : "#fffbeb",
              borderColor: progress >= 95 ? "#a7f3d0" : "#fde68a",
              color: progress >= 95 ? "#065f46" : "#92400e",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: progress >= 95 ? "#10b981" : "#f59e0b",
              }}
            />
            <span>System {progress >= 95 ? "READY" : "INITIALIZING"}</span>
          </span>
        </div>
      </div>

      {/* ── CSS Keyframe Animations ── */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.8s ease-in-out infinite;
        }
        @keyframes tipFadeIn {
          from { opacity: 0; transform: translateY(3px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-tipFadeIn {
          animation: tipFadeIn 0.3s ease-out forwards;
        }
        @keyframes tipProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-tipProgress {
          animation: tipProgress 4.5s linear infinite;
        }
      `}</style>
    </div>
  );
};
