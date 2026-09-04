import React, { ReactNode, useState, useRef, useEffect, useCallback } from "react";
import { Home, Cog, Car, Sofa, Factory, ShieldCheck } from "lucide-react";
import type { Stage } from "../../StageSwitcher";
import { playHMITabSound } from "../../../utils/hmiSoundSynth";
import { NeonStageLoadingSkeleton } from "../design/NeonStageLoadingSkeleton";
import { useSpring, SPRING_PRESETS } from "../ux/useSpringPhysics";

export interface NeonHorizonContentViewportProps {
  children: ReactNode; activeStage: Stage; onSelectStage: (stage: Stage) => void; className?: string;
}

const TOP_NAV_TABS: { id: Stage; label: string; icon: React.ReactNode }[] = [
  { id: "command", label: "Command Center", icon: React.createElement(Home, {size:18}) },
  { id: "engine", label: "Engine", icon: React.createElement(Cog, {size:18}) },
  { id: "vehicle", label: "Vehicle Studio", icon: React.createElement(Car, {size:18}) },
  { id: "interior", label: "Interior & Electronics", icon: React.createElement(Sofa, {size:18}) },
  { id: "manufacturing", label: "Manufacturing", icon: React.createElement(Factory, {size:18}) },
  { id: "safety", label: "Safety Center", icon: React.createElement(ShieldCheck, {size:18}) },
];

const EXIT_SPRING = SPRING_PRESETS.slideIn;
const ENTER_SPRING = SPRING_PRESETS.crossfade;
const SKELETON_MS = 1400;

type TransitionPhase = "exiting" | "loading" | "entering";

interface TransitionState {
  dir: "left" | "right"; prevStage: Stage; prevChildren: ReactNode; nextStage: Stage; phase: TransitionPhase;
}

function springStyles(progress: number, dir: "left" | "right", isExiting: boolean): React.CSSProperties {
  const opacity = progress;
  const sign = dir === "right" ? 1 : -1;
  const translateX = isExiting ? sign * (1 - progress) * 40 : -sign * (1 - progress) * 40;
  const scale = 0.98 + 0.02 * progress;
  const blur = (1 - progress) * 3;
  return {
    position: "absolute", inset: 0, opacity,
    transform: "translateX(" + translateX + "px) scale(" + scale + ")",
    filter: "blur(" + blur + "px)",
    willChange: "transform, opacity, filter",
    zIndex: isExiting ? 1 : 4,
    pointerEvents: isExiting ? "none" : "auto",
  };
}

export const NeonHorizonContentViewport: React.FC<NeonHorizonContentViewportProps> = ({
  children, activeStage, onSelectStage, className = "",
}) => {
  const [tr, setTr] = useState<TransitionState | null>(null);
  const prevStageRef = useRef<Stage>(activeStage);
  const prevChildrenRef = useRef<ReactNode>(children);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    [timerRef, loadTimerRef].forEach(r => { if (r.current) { clearTimeout(r.current); r.current = null; } });
  }, []);

  useEffect(() => {
    if (activeStage !== prevStageRef.current) {
      cleanup();
      const prevIdx = TOP_NAV_TABS.findIndex(t => t.id === prevStageRef.current);
      const currIdx = TOP_NAV_TABS.findIndex(t => t.id === activeStage);
      const dir: "left" | "right" = currIdx >= prevIdx ? "right" : "left";
      setTr({ dir, prevStage: prevStageRef.current, prevChildren: prevChildrenRef.current, nextStage: activeStage, phase: "exiting" });
      loadTimerRef.current = setTimeout(() => {
        setTr(p => p ? { ...p, phase: "loading" } : null);
        timerRef.current = setTimeout(() => {
          setTr(p => p ? { ...p, phase: "entering" } : null);
          loadTimerRef.current = setTimeout(() => setTr(null), 700);
        }, SKELETON_MS);
      }, 550);
      prevStageRef.current = activeStage;
      prevChildrenRef.current = children;
    } else { prevChildrenRef.current = children; }
    return cleanup;
  }, [activeStage, children, cleanup]);

  const exitProgress = useSpring(tr?.phase === "exiting" ? 0 : 1, EXIT_SPRING);
  const enterProgress = useSpring(tr?.phase === "entering" ? 0 : 1, ENTER_SPRING);

  var rootCls = "flex-1 min-w-0 flex flex-col gap-4 " + className;
  return (
    <div className={rootCls}>
      <div className="relative p-6 rounded-3xl bg-amber-950/80 backdrop-blur-3xl border border-white/12 shadow-[0_25px_60px_rgba(0,0,0,0.60),inset_0_1px_0_rgba(255,255,255,0.10)] flex flex-col gap-6 nh-edge-top nh-grain">
        <div className="nh-ruler -mt-2 opacity-30" aria-hidden="true" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pb-4 border-b border-white/10 select-none">
          {TOP_NAV_TABS.map(function(tab) {
            var isActive = activeStage === tab.id;
            var tabCls = "flex flex-col items-center justify-center p-2 rounded-2xl transition-all cursor-pointer group " + (isActive ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-amber-200/50 hover:text-amber-100 hover:bg-white/[0.04] border border-transparent");
            var iconCls = "mb-1 transition-transform group-hover:scale-110 " + (isActive ? "text-amber-400" : "text-amber-300/60");
            return (<button key={tab.id} onClick={function() { if (!isActive) { playHMITabSound(); onSelectStage(tab.id); } }} className={tabCls}>
              <div className={iconCls}>{tab.icon}</div>
              <span className="text-[11px] font-semibold tracking-tight text-center truncate w-full">{tab.label}</span>
              {isActive && <div className="w-6 h-0.5 bg-amber-400 rounded-full mt-1.5" />}
            </button>);
          })}
        </div>
        <div className="min-h-[540px] relative overflow-hidden">
          {tr && tr.phase === "exiting" && (<div key={"exit-"+tr.prevStage} style={springStyles(exitProgress, tr.dir, true)}>{tr.prevChildren}</div>)}
          {tr && tr.phase === "loading" && (<div key={"load-"+tr.nextStage} className="absolute inset-0 flex items-center justify-center" style={{zIndex:3}}><NeonStageLoadingSkeleton stageName={tr.nextStage} /></div>)}
          {tr && tr.phase === "entering" && (<div key={"enter-"+activeStage} style={springStyles(enterProgress, tr.dir, false)}>{children}</div>)}
          {!tr && (<div key={"idle-"+activeStage} className="relative" style={{zIndex:2}}>{children}</div>)}
        </div>
        <div className="nh-ruler opacity-20 -mb-2" aria-hidden="true" />
      </div>
    </div>
  );
};