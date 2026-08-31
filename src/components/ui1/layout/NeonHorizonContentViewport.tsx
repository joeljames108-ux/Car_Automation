import React, { ReactNode, useState, useRef, useEffect } from "react";
import {
  Home, Cog, Car, Sofa, Factory, ShieldCheck,
} from "lucide-react";
import type { Stage } from "../../StageSwitcher";
import { playHMITabSound } from "../../../utils/hmiSoundSynth";

export interface NeonHorizonContentViewportProps {
  children: ReactNode;
  activeStage: Stage;
  onSelectStage: (stage: Stage) => void;
  className?: string;
}

const TOP_NAV_TABS: { id: Stage; label: string; icon: React.ReactNode }[] = [
  { id: "command", label: "Command Center", icon: <Home size={18} /> },
  { id: "engine", label: "Engine", icon: <Cog size={18} /> },
  { id: "vehicle", label: "Vehicle Studio", icon: <Car size={18} /> },
  { id: "interior", label: "Interior & Electronics", icon: <Sofa size={18} /> },
  { id: "manufacturing", label: "Manufacturing", icon: <Factory size={18} /> },
  { id: "safety", label: "Safety Center", icon: <ShieldCheck size={18} /> },
];

const TRANSITION_MS = 420;

export const NeonHorizonContentViewport: React.FC<NeonHorizonContentViewportProps> = ({
  children, activeStage, onSelectStage, className = "",
}) => {
  const [transition, setTransition] = useState<null | {
    dir: "left" | "right"; prevStage: Stage; prevChildren: ReactNode;
  }>(null);
  const prevStageRef = useRef<Stage>(activeStage);
  const prevChildrenRef = useRef<ReactNode>(children);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (activeStage !== prevStageRef.current) {
      if (timerRef.current) clearTimeout(timerRef.current);
      const prevIdx = TOP_NAV_TABS.findIndex(t => t.id === prevStageRef.current);
      const currIdx = TOP_NAV_TABS.findIndex(t => t.id === activeStage);
      const dir: "left" | "right" = currIdx >= prevIdx ? "right" : "left";
      setTransition({ dir, prevStage: prevStageRef.current, prevChildren: prevChildrenRef.current });
      prevStageRef.current = activeStage;
      prevChildrenRef.current = children;
      timerRef.current = setTimeout(() => setTransition(null), TRANSITION_MS);
    } else {
      prevChildrenRef.current = children;
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [activeStage, children]);

  return (
    <div className={`flex-1 min-w-0 flex flex-col gap-4 ${className}`}>
      <div className="relative p-6 rounded-3xl bg-amber-950/80 backdrop-blur-3xl border border-white/12 shadow-[0_25px_60px_rgba(0,0,0,0.60),inset_0_1px_0_rgba(255,255,255,0.10)] flex flex-col gap-6 nh-edge-top nh-grain">
        <div className="nh-ruler -mt-2 opacity-30" aria-hidden="true" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pb-4 border-b border-white/10 select-none">
          {TOP_NAV_TABS.map((tab) => {
            const isActive = activeStage === tab.id;
            return (
              <button key={tab.id} onClick={() => { if (!isActive) { playHMITabSound(); onSelectStage(tab.id); } }}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all cursor-pointer group ${isActive ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-amber-200/50 hover:text-amber-100 hover:bg-white/[0.04] border border-transparent"}`}>
                <div className={`mb-1 transition-transform group-hover:scale-110 ${isActive ? "text-amber-400" : "text-amber-300/60"}`}>{tab.icon}</div>
                <span className="text-[11px] font-semibold tracking-tight text-center truncate w-full">{tab.label}</span>
                {isActive && <div className="w-6 h-0.5 bg-amber-400 rounded-full mt-1.5" />}
              </button>
            );
          })}
        </div>

        {/* Content Body — cross-fade + slide transition */}
        <div className="min-h-[540px] relative overflow-hidden">
          {transition && (
            <div key={`exit-${transition.prevStage}`}
              className={`absolute inset-0 pointer-events-none ${transition.dir === "right" ? "animate-exit-slide-left" : "animate-exit-slide-right"}`}
              style={{ zIndex: 1, willChange: "transform, opacity" }}>
              {transition.prevChildren}
            </div>
          )}
          <div key={`enter-${activeStage}`}
            className={`relative ${transition ? (transition.dir === "right" ? "animate-enter-slide-right" : "animate-enter-slide-left") : "animate-stage-enter"}`}
            style={{ zIndex: 2, willChange: "transform, opacity" }}>
            {children}
          </div>
        </div>
        <div className="nh-ruler opacity-20 -mb-2" aria-hidden="true" />
      </div>
    </div>
  );
};