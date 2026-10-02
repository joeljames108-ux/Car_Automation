import React, { useState, useEffect } from "react";
import {
  Calendar,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  History,
  Building,
  Cpu,
  Car
} from "lucide-react";
import { CAMPUS_ERAS, CampusEraId, getCampusEraByYear, EraVisualDefinition } from "../../sim/campus/eraDefinitions";
import { useSimulationClockStore } from "../../state/simulationClockStore";
import { useCampusStore } from "../../state/campusStore";

interface CampusTimelineViewerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectYear?: (year: number) => void;
}

export const CampusTimelineViewer: React.FC<CampusTimelineViewerProps> = ({
  isOpen,
  onClose,
  onSelectYear,
}) => {
  const { year: simYear } = useSimulationClockStore();
  const { units, setDebugUnitLevel } = useCampusStore();

  const [previewYear, setPreviewYear] = useState<number>(simYear || 1970);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const era = getCampusEraByYear(previewYear);

  // Auto-play animation timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPreviewYear((prev) => {
          if (prev >= 2030) {
            setIsPlaying(false);
            return 2030;
          }
          const next = prev + 1;
          if (onSelectYear) onSelectYear(next);
          return next;
        });
      }, 750);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, onSelectYear]);

  if (!isOpen) return null;

  const decades: { id: CampusEraId; year: number; label: string }[] = [
    { id: "ERA_1970S", year: 1970, label: "1970s" },
    { id: "ERA_1980S", year: 1980, label: "1980s" },
    { id: "ERA_1990S", year: 1990, label: "1990s" },
    { id: "ERA_2000S", year: 2000, label: "2000s" },
    { id: "ERA_2010S", year: 2010, label: "2010s" },
    { id: "ERA_2020S_PLUS", year: 2025, label: "2020s+" },
  ];

  const handleDecadeClick = (targetYear: number) => {
    setPreviewYear(targetYear);
    if (onSelectYear) onSelectYear(targetYear);
  };

  const handleResetToSim = () => {
    setIsPlaying(false);
    setPreviewYear(simYear);
    if (onSelectYear) onSelectYear(simYear);
  };

  // Sync building levels to match preview era in sandbox
  const handleApplyEraToCampus = () => {
    let targetLevel = 1;
    if (previewYear >= 2020) targetLevel = 7;
    else if (previewYear >= 2010) targetLevel = 5;
    else if (previewYear >= 2000) targetLevel = 4;
    else if (previewYear >= 1990) targetLevel = 3;
    else if (previewYear >= 1980) targetLevel = 2;
    else targetLevel = 1;

    Object.values(units).forEach((u) => {
      if (u.status !== "locked") {
        setDebugUnitLevel(u.id, targetLevel);
      }
    });
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4 pointer-events-auto">
      <div className="bg-[#f8f6f0]/95 border border-[#dad4c5] backdrop-blur-xl rounded-3xl shadow-2xl p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#dad4c5] pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-700">
              <History size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-mono font-extrabold text-slate-900 tracking-wide">
                  CAMPUS ARCHITECTURAL TIMELINE
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-cyan-100 text-cyan-800 border border-cyan-300">
                  {previewYear}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-sans">
                {era.name} • {era.architecturalStyle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleApplyEraToCampus}
              title="Apply this era's architecture to active campus buildings"
              className="px-2.5 py-1 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-[10px] font-mono font-bold flex items-center gap-1 shadow-xs transition-colors"
            >
              <Sparkles size={11} />
              <span>Morph Campus</span>
            </button>
            <button
              onClick={handleResetToSim}
              title="Reset timeline to current game simulation date"
              className="p-1.5 rounded-xl border border-[#dad4c5] bg-white text-slate-600 hover:text-slate-900 text-xs font-mono transition-colors"
            >
              <RotateCcw size={13} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Timeline Slider & Play Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-xl transition-all shadow-xs ${
              isPlaying
                ? "bg-amber-600 text-white"
                : "bg-cyan-700 hover:bg-cyan-800 text-white"
            }`}
            title={isPlaying ? "Pause timeline evolution" : "Play timeline evolution timelapse"}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>

          <input
            type="range"
            min={1970}
            max={2030}
            step={1}
            value={previewYear}
            onChange={(e) => {
              const y = parseInt(e.target.value, 10);
              setPreviewYear(y);
              if (onSelectYear) onSelectYear(y);
            }}
            className="flex-1 accent-cyan-700 cursor-pointer"
          />

          <span className="font-mono text-xs font-extrabold text-slate-900 w-12 text-right">
            {previewYear}
          </span>
        </div>

        {/* Decade Selector Chips */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-none pt-1">
          {decades.map((d) => {
            const isCurrent = era.decadeLabel.startsWith(d.label.slice(0, 4));
            return (
              <button
                key={d.id}
                onClick={() => handleDecadeClick(d.year)}
                className={`flex-1 py-1 px-2 rounded-xl text-[10px] font-mono font-bold whitespace-nowrap transition-all border ${
                  isCurrent
                    ? "bg-cyan-700 text-white border-cyan-800 shadow-xs"
                    : "bg-white/80 text-slate-600 hover:text-slate-900 border-[#dad4c5] hover:bg-white"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>

        {/* Era Info Snippet */}
        <div className="p-2.5 rounded-2xl bg-white border border-[#dad4c5] text-xs flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <Building size={14} className="text-cyan-700 shrink-0" />
            <span className="text-[11px] text-slate-700 truncate font-sans">
              <strong className="text-slate-900">Signage:</strong> {era.signageStyle.label}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Car size={14} className="text-emerald-700 shrink-0" />
            <span className="text-[11px] text-slate-600 font-mono">
              {era.ambientVehicles.category.split("&")[0]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
