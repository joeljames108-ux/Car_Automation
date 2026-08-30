import React, { useMemo } from "react";
import { X, Orbit, Sparkles, Navigation, Globe, Compass, ExternalLink } from "lucide-react";
import { NeonHiggsfieldGlobe, type GlobeTabDef } from "../stages/NeonHiggsfieldGlobe";
import { playHMIClickSound, playHMITabSound } from "../../../utils/hmiSoundSynth";
import type { Stage } from "../../StageSwitcher";
import type { WorkspaceCategory } from "../../ui/UI1Layout";

interface StageItem {
  id: Stage;
  label: string;
  icon: React.ReactNode;
  category: WorkspaceCategory;
}

interface NeonHorizonOrbitalStageNavigatorProps {
  isOpen: boolean;
  onClose: () => void;
  stages: StageItem[];
  activeStage: Stage;
  activeCategory: WorkspaceCategory;
  onSelectStage: (stage: Stage) => void;
  onSelectCategory: (cat: WorkspaceCategory) => void;
}

const CATEGORY_HUES: Record<WorkspaceCategory, number> = {
  engineering: 199, // Cyan
  studios: 265,     // Electric Purple
  simulation: 155,  // Emerald
  world: 45,        // Amber Gold
};

export const NeonHorizonOrbitalStageNavigator: React.FC<NeonHorizonOrbitalStageNavigatorProps> = ({
  isOpen,
  onClose,
  stages,
  activeStage,
  activeCategory,
  onSelectStage,
  onSelectCategory,
}) => {
  const currentCategoryStages = useMemo(() => {
    return stages.filter((s) => s.category === activeCategory);
  }, [stages, activeCategory]);

  const globeTabs: GlobeTabDef[] = useMemo(() => {
    const total = currentCategoryStages.length;
    const baseHue = CATEGORY_HUES[activeCategory] ?? 200;

    return currentCategoryStages.map((st, i) => {
      // Distribute evenly around the equator and upper/lower latitudes
      let lat = 0;
      let lng = 0;
      let cardinal = "EQUATORIAL";

      if (total <= 4) {
        lng = (i * 360) / total - 180;
        cardinal = `${lng >= 0 ? "+" : ""}${Math.round(lng)}° ORBIT`;
      } else if (i === 0) {
        lat = 0;
        lng = 0;
        cardinal = "PRIME MERIDIAN · 0°";
      } else if (i === total - 1) {
        lat = 55;
        lng = 0;
        cardinal = "+55° POLAR ZENITH";
      } else if (i === total - 2) {
        lat = -55;
        lng = 0;
        cardinal = "-55° POLAR NADIR";
      } else {
        const ringIdx = i - 1;
        const ringTotal = total - 3;
        lng = (ringIdx * 360) / Math.max(1, ringTotal) - 180;
        cardinal = `${lng >= 0 ? "+" : ""}${Math.round(lng)}° RING`;
      }

      return {
        id: st.id,
        label: st.label,
        icon: st.icon,
        lat,
        lng,
        hue: (baseHue + i * 25) % 360,
        cardinal,
        description: `Workspace Module: ${st.label}`,
      };
    });
  }, [currentCategoryStages, activeCategory]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-2xl animate-nh-materialize select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-950/95 border border-white/15 p-6 shadow-[0_0_80px_rgba(0,180,255,0.2)] flex flex-col gap-5 scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg">
              <Orbit size={20} className="animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wide text-white">ORBITAL STAGE NAVIGATOR</h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase">
                  3D Planetary Waypoint System
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Click any orbital facet to rotate the planetary sphere and fly directly into that workspace stage.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Category Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(
            [
              { id: "engineering", label: "Engineering Studio" },
              { id: "studios", label: "Design Studios Hub" },
              { id: "simulation", label: "Sim & Testing Lab" },
              { id: "world", label: "World & Racing" },
            ] as const
          ).map((cat) => {
            const isCatActive = activeCategory === cat.id;
            const catHue = CATEGORY_HUES[cat.id];
            return (
              <button
                key={cat.id}
                onClick={() => {
                  playHMITabSound();
                  onSelectCategory(cat.id);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wide border transition-all duration-200 ${
                  isCatActive
                    ? "text-white shadow-lg"
                    : "text-slate-400 hover:text-slate-200 border-white/10 hover:bg-white/5"
                }`}
                style={
                  isCatActive
                    ? {
                        borderColor: `hsl(${catHue} 90% 70% / 0.7)`,
                        background: `hsl(${catHue} 90% 60% / 0.18)`,
                        boxShadow: `0 0 20px hsl(${catHue} 90% 60% / 0.25)`,
                      }
                    : undefined
                }
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* 3D Interactive Planetary Sphere & Surrounding Waypoint Cards */}
        <div className="p-2 bg-slate-900/60 rounded-2xl border border-white/10">
          <NeonHiggsfieldGlobe
            tabs={globeTabs}
            activeId={activeStage}
            onSelect={(id) => {
              playHMIClickSound();
              onSelectStage(id as Stage);
            }}
            onArrive={() => {
              // Smooth arrival feedback
            }}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <Navigation size={12} className="text-amber-400" />
            DRAG SPHERE TO ROTATE · SELECT ANY WAYPOINT TO ENGAGE
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-amber-500 text-slate-950 font-bold tracking-wider transition-all shadow-md"
          >
            ENTER STAGE
          </button>
        </div>
      </div>
    </div>
  );
};
