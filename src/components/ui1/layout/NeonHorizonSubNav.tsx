import React from "react";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import type { Stage } from "../../StageSwitcher";

export interface StageNavTab {
  id: Stage;
  label: string;
  icon: React.ReactNode;
}

export interface NeonHorizonSubNavProps {
  stages: StageNavTab[];
  activeStage: Stage;
  onSelectStage: (stage: Stage) => void;
}

export const NeonHorizonSubNav: React.FC<NeonHorizonSubNavProps> = ({
  stages,
  activeStage,
  onSelectStage,
}) => {
  return (
    <nav className="sticky top-16 z-30 bg-[#0c1626]/85 backdrop-blur-xl border-b border-white/8 shadow-lg select-none">
      <div className="max-w-full px-6 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {stages.map((s) => {
          const isCurrent = activeStage === s.id;
          return (
            <button
              key={s.id}
              onClick={() => {
                playHMIClickSound();
                onSelectStage(s.id);
              }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-200 cursor-pointer ${
 isCurrent
 ? "bg-sky-500/20 text-sky-300 border border-sky-400/40 font-bold"
 : "bg-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] border border-white/6"
 }`}
            >
              <span className={isCurrent ? "text-sky-400" : "text-slate-500"}>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
