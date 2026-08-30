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
  onReplayBoot?: () => void;
}

export const NeonHorizonSubNav: React.FC<NeonHorizonSubNavProps> = ({
  stages,
  activeStage,
  onSelectStage,
  onOpenOrbitalNav,
  onReplayBoot,
}) => {
  return (
    <nav className="sticky top-16 z-30 border-b shadow-lg select-none"
      style={{ background: "rgba(8, 14, 28, 0.75)", backdropFilter: "blur(40px) saturate(200%)", borderColor: "rgba(255,255,255,0.05)" }}>
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
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-200 cursor-pointer"
                style={{
                  background: isCurrent ? "rgba(95, 168, 200, 0.10)" : "rgba(255,255,255,0.02)",
                  color: isCurrent ? "#8cbcd0" : "#506070",
                  border: isCurrent ? "1px solid rgba(95, 168, 200, 0.18)" : "1px solid rgba(255,255,255,0.03)",
                }}
              >
                <span style={{ color: isCurrent ? "#5fa8c8" : "#506070" }}>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onReplayBoot && (
            <button
              onClick={() => {
                playHMIClickSound();
                onReplayBoot();
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-mono tracking-wider transition-all cursor-pointer whitespace-nowrap border"
              style={{ color: "#8878a8", background: "rgba(120, 104, 160, 0.06)", borderColor: "rgba(120, 104, 160, 0.15)" }}
            >
              <Orbit size={12} className="text-fuchsia-400 animate-spin" />
              <span>BOOT INTRO</span>
            </button>
          )}

          {onOpenOrbitalNav && (
            <button
              onClick={() => {
                playHMIClickSound();
                onOpenOrbitalNav();
              }}
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono tracking-wider text-amber-300 bg-amber-500/20 hover:bg-amber-500/25 border border-amber-500/30 hover:border-sky-400/60 shadow-[0_0_15px_rgba(56,189,248,0.25)] transition-all cursor-pointer whitespace-nowrap shrink-0 group"
            >
              <Orbit size={13} className="text-amber-400 group-hover:rotate-180 transition-transform duration-500" />
              <span>3D GLOBE NAV</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

