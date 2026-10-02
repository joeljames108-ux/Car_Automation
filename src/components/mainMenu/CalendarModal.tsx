import React from "react";
import { X, Calendar as CalendarIcon, Clock, ChevronRight, CheckCircle2, AlertCircle, Trophy, Truck, Wrench, Building } from "lucide-react";
import { useSimulationClockStore, formatSimDate } from "../../state/simulationClockStore";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStage?: (stage: string) => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, onSelectStage }) => {
  const { year, month, day, dayOfWeek, week, allCalendarEvents } = useSimulationClockStore();

  if (!isOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "motorsport":
        return <Trophy size={14} className="text-red-400" />;
      case "logistics":
        return <Truck size={14} className="text-blue-400" />;
      case "engineering":
        return <Wrench size={14} className="text-amber-400" />;
      case "corporate":
        return <Building size={14} className="text-purple-400" />;
      default:
        return <CalendarIcon size={14} className="text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        style={{
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(56, 189, 248, 0.15)"
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Automotive Master Calendar
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  {formatSimDate(year, month, day)}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {dayOfWeek} • Week {week} • Year {year}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors ml-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Upcoming Company Schedule & Race Deadlines
          </div>

          <div className="space-y-2.5">
            {allCalendarEvents.map((ev) => {
              const isToday = ev.dayOffset === 0;
              return (
                <div
                  key={ev.id}
                  onClick={() => {
                    if (ev.actionStage && onSelectStage) {
                      onSelectStage(ev.actionStage);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer group ${
                    isToday
                      ? "bg-amber-500/10 border-amber-500/30 hover:border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                      : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center">
                      {getCategoryIcon(ev.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-100 group-hover:text-amber-200 transition-colors">
                          {ev.title}
                        </span>
                        {isToday && (
                          <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/25 text-amber-300 border border-amber-500/40">
                            TODAY
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-slate-300">{ev.time}</span>
                        <span>•</span>
                        <span className="capitalize">{ev.category}</span>
                        <span>•</span>
                        <span>{ev.dateStr}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {ev.actionStage && (
                      <span className="text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        Open Subsystem <ChevronRight size={14} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>* All vehicle production, testing lead times and race weekends synchronize with this calendar.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
