import React from "react";
import { Orbit, Compass } from "lucide-react";
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
  onOpenOrbitalNav?: () => void;
}

export const NeonHorizonSubNav: React.FC<NeonHorizonSubNavProps> = ({
  stages,
  activeStage,
  onSelectStage,
  onOpenOrbitalNav,
}) => {
  return (
    <nav className="sticky top-16 z-30 bg-[#0e1626]/85 backdrop-blur-xl border-b border-white/8 shadow-lg select-none">
      <div className="max-w-full px-6 py-2.5 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2">
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
                    ? "bg-sky-400/15 text-sky-300 border border-sky-400/30 font-bold shadow-[0_0_12px_rgba(56,189,248,0.2)]"
                    : "bg-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08] border border-white/6"
                }`}
              >
                <span className={isCurrent ? "text-sky-400" : "text-slate-500"}>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {onOpenOrbitalNav && (
          <button
            onClick={() => {
              playHMIClickSound();
              onOpenOrbitalNav();
            }}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono tracking-wider text-sky-300 bg-sky-400/10 hover:bg-sky-400/20 border border-sky-400/30 hover:border-sky-400/60 shadow-[0_0_15px_rgba(56,189,248,0.25)] transition-all cursor-pointer whitespace-nowrap shrink-0 group"
          >
            <Orbit size={13} className="text-sky-400 group-hover:rotate-180 transition-transform duration-500" />
            <span>3D GLOBE NAV</span>
          </button>
        )}
      </div>
    </nav>
  );
};
