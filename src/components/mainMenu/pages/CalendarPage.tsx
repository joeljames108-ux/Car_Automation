import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon, Clock, ChevronRight, ChevronLeft,
  FastForward, Play, Pause, SkipForward, Sparkles,
  Flag, FlaskConical, Factory, Building, Gauge, Truck, ShoppingBag,
  AlertCircle, Trophy, Gavel,
} from "lucide-react";
import { SubPageLayout } from "../SubPageLayout";
import { useSimulationClockStore, formatSimDate } from "../../../state/simulationClockStore";
import {
  generateMonthGrid, formatGameDate, formatGameTime,
  gameEventDateStr, type GameEventCategory, type CalendarGridDay,
  MONTH_NAMES_FULL,
} from "../../../state/gameClockEngine";
import type { Stage } from "../../StageSwitcher";

interface CalendarPageProps {
  onSelectStage: (stage: Stage) => void;
}

/* ── Category colour + icon helper ──────────────────────── */
const CAT_META: Record<GameEventCategory, { color: string; border: string; bg: string; Icon: typeof Flag }> = {
  motorsport:      { color: "text-red-400",    border: "border-red-500/40",    bg: "bg-red-500/15",    Icon: Flag },
  engineering:     { color: "text-cyan-400",   border: "border-cyan-500/40",   bg: "bg-cyan-500/15",   Icon: Gauge },
  rnd:             { color: "text-indigo-400", border: "border-indigo-500/40", bg: "bg-indigo-500/15", Icon: FlaskConical },
  factory:         { color: "text-emerald-400",border: "border-emerald-500/40",bg: "bg-emerald-500/15",Icon: Factory },
  corporate:       { color: "text-amber-400",  border: "border-amber-500/40",  bg: "bg-amber-500/15",  Icon: Building },
  logistics:       { color: "text-sky-400",    border: "border-sky-500/40",    bg: "bg-sky-500/15",    Icon: Truck },
  npc:             { color: "text-purple-400", border: "border-purple-500/40", bg: "bg-purple-500/15", Icon: ShoppingBag },
  market:          { color: "text-teal-400",   border: "border-teal-500/40",   bg: "bg-teal-500/15",   Icon: Trophy },
  regulation:      { color: "text-orange-400", border: "border-orange-500/40", bg: "bg-orange-500/15", Icon: Gavel },
  vehicle_launch:  { color: "text-rose-400",   border: "border-rose-500/40",   bg: "bg-rose-500/15",   Icon: Sparkles },
  milestone:       { color: "text-yellow-400", border: "border-yellow-500/40", bg: "bg-yellow-500/15", Icon: AlertCircle },
};

const DOW_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export const CalendarPage: React.FC<CalendarPageProps> = ({ onSelectStage }) => {
  const store = useSimulationClockStore();
  const {
    year, month, day, dayOfWeek, week, hour, minute,
    isPlaying, speed,
    scheduledEvents, todayEvents, feedItems,
    togglePlay, setSpeed,
  } = store;

  // View state: which month/year the calendar is displaying
  const [viewYear, setViewYear] = useState(year);
  const [viewMonth, setViewMonth] = useState(month);

  // Keep view in sync when game date changes month
  React.useEffect(() => {
    setViewYear(year);
    setViewMonth(month);
  }, [year, month]);

  const goToPrevMonth = () => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goToNextMonth = () => {
    if (viewMonth === 12) { setViewMonth(1); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };
  const goToToday = () => { setViewYear(year); setViewMonth(month); };

  const today = store.getGameDateTime();
  const grid = useMemo(
    () => generateMonthGrid(viewYear, viewMonth, today, scheduledEvents),
    [viewYear, viewMonth, today, scheduledEvents]
  );

  // Selected day for detail view
  const [selectedDay, setSelectedDay] = useState<CalendarGridDay | null>(null);

  // Upcoming events (next 30 days)
  const nowStr = gameEventDateStr(today);
  const upcomingEvents = useMemo(() => {
    return scheduledEvents
      .filter(e => e.dateStr >= nowStr)
      .sort((a, b) => a.dateStr.localeCompare(b.dateStr))
      .slice(0, 12);
  }, [scheduledEvents, nowStr]);

  const speedOptions: (1 | 2 | 5 | 10 | 25 | 50)[] = [1, 2, 5, 10, 25, 50];

  return (
    <SubPageLayout
      title="Master Simulation Calendar"
      category="Corporate Schedule • Races • Milestones • Deliveries"
      icon={<CalendarIcon size={20} className="text-amber-400" />}
      onSelectStage={onSelectStage}
    >
      <div className="w-full flex-1 flex flex-col gap-4">

        {/* ═══ TOP: Date HUD + Time Controls ═══════════════════════ */}
        <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900/50 to-slate-900 border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
          {/* Current Date/Time Display */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <CalendarIcon size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide font-mono">
                {formatGameDate(today)}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-300 font-mono">
                <span>{dayOfWeek}</span>
                <span className="text-slate-600">│</span>
                <span>WEEK {week}</span>
                <span className="text-slate-600">│</span>
                <span className="text-amber-300">{formatGameTime(today)}</span>
              </div>
            </div>
          </div>

          {/* Time Controls Bar */}
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-white/10">
              <button
                onClick={togglePlay}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  !isPlaying
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Pause"
              >
                <Pause size={14} />
              </button>
              <button
                onClick={togglePlay}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isPlaying
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Play"
              >
                <Play size={14} />
              </button>
            </div>

            {/* Speed chips */}
            <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-white/10">
              {speedOptions.map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 h-7 rounded-lg text-[11px] font-mono font-bold transition-all ${
                    speed === s
                      ? "bg-amber-500/25 text-amber-300 border border-amber-500/40"
                      : "text-slate-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ MAIN: Calendar Grid + Side Panels ═══════════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 flex-1">

          {/* ── LEFT: Month Grid (8 cols) ───────────────────────── */}
          <div className="xl:col-span-8 p-5 rounded-2xl bg-slate-900/80 border border-white/10 shadow-xl flex flex-col">
            {/* Month Header + Nav */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={goToPrevMonth} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all">
                <ChevronLeft size={16} />
              </button>
              <div className="text-center">
                <h3 className="text-base font-extrabold text-white tracking-wider uppercase font-mono">
                  {MONTH_NAMES_FULL[viewMonth - 1]} {viewYear}
                </h3>
                {(viewYear !== year || viewMonth !== month) && (
                  <button onClick={goToToday} className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold font-mono mt-0.5">
                    ↳ GO TO TODAY
                  </button>
                )}
              </div>
              <button onClick={goToNextMonth} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all">
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Day-of-Week Header Row */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DOW_LABELS.map(d => (
                <div key={d} className={`text-center text-[10px] font-bold font-mono py-1 ${
                  d === "SUN" || d === "SAT" ? "text-slate-500" : "text-slate-400"
                }`}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 flex-1">
              {grid.map((cell, idx) => {
                const hasEvents = cell.events.length > 0;
                const isSelected = selectedDay?.dateStr === cell.dateStr;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDay(cell)}
                    className={`
                      relative rounded-xl p-1.5 min-h-[60px] flex flex-col items-start transition-all duration-200 border
                      ${!cell.isCurrentMonth
                        ? "opacity-30 border-transparent"
                        : cell.isToday
                          ? "bg-amber-500/20 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                          : isSelected
                            ? "bg-cyan-500/15 border-cyan-400/50"
                            : cell.isWeekend
                              ? "bg-slate-950/50 border-white/5 hover:border-white/20"
                              : "bg-slate-950/30 border-white/5 hover:border-white/20"
                      }
                    `}
                  >
                    <span className={`text-xs font-bold font-mono ${
                      cell.isToday ? "text-amber-300" : cell.isCurrentMonth ? "text-slate-200" : "text-slate-600"
                    }`}>
                      {cell.day}
                    </span>

                    {/* Event dots */}
                    {hasEvents && (
                      <div className="flex flex-wrap gap-0.5 mt-auto">
                        {cell.events.slice(0, 3).map((ev, i) => {
                          const meta = CAT_META[ev.category] || CAT_META.corporate;
                          return (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${meta.bg.replace('/15', '/80')}`}
                              title={ev.title}
                            />
                          );
                        })}
                        {cell.events.length > 3 && (
                          <span className="text-[8px] text-slate-500 font-mono">+{cell.events.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Day Detail */}
            {selectedDay && selectedDay.events.length > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-white/10">
                <h4 className="text-xs font-bold text-white font-mono mb-2">
                  EVENTS ON {selectedDay.day} {MONTH_NAMES_FULL[selectedDay.month - 1].toUpperCase()} {selectedDay.year}
                </h4>
                <div className="space-y-2">
                  {selectedDay.events.map(ev => {
                    const meta = CAT_META[ev.category] || CAT_META.corporate;
                    const CatIcon = meta.Icon;
                    return (
                      <div
                        key={ev.id}
                        onClick={() => { if (ev.actionStage) onSelectStage(ev.actionStage as Stage); }}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border ${meta.border} ${meta.bg} cursor-pointer hover:brightness-125 transition-all group`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${meta.color}`}>
                          <CatIcon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate">{ev.title}</div>
                          {ev.description && <p className="text-[10px] text-slate-400 truncate">{ev.description}</p>}
                        </div>
                        {ev.time && <span className="text-[10px] font-mono text-slate-500">{ev.time}</span>}
                        <ChevronRight size={13} className="text-slate-600 group-hover:text-white transition-colors" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Upcoming Events + Today + Feed (4 cols) ──── */}
          <div className="xl:col-span-4 flex flex-col gap-4">

            {/* Today's Schedule */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 font-mono flex items-center gap-2">
                <Clock size={14} className="text-amber-400" />
                TODAY — {formatGameDate(today)}
              </h3>
              {todayEvents.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No events scheduled for today.</p>
              ) : (
                <div className="space-y-2">
                  {todayEvents.map(ev => (
                    <div
                      key={ev.id}
                      onClick={() => { if (ev.actionStage) onSelectStage(ev.actionStage as Stage); }}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span className="text-[11px] font-mono font-bold text-slate-400">{ev.time}</span>
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {ev.title}
                        </span>
                      </div>
                      <ChevronRight size={13} className="text-slate-600 group-hover:text-white transition-colors shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Events */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-xl flex-1">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 font-mono flex items-center gap-2">
                <FastForward size={14} className="text-cyan-400" />
                UPCOMING EVENTS
              </h3>
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No upcoming events scheduled.</p>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map(ev => {
                    const meta = CAT_META[ev.category] || CAT_META.corporate;
                    const CatIcon = meta.Icon;
                    return (
                      <div
                        key={ev.id}
                        onClick={() => { if (ev.actionStage) onSelectStage(ev.actionStage as Stage); }}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${meta.bg} ${meta.color}`}>
                          <CatIcon size={13} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                            {ev.title}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {ev.dateStr} {ev.time && `• ${ev.time}`}
                          </div>
                        </div>
                        <ChevronRight size={12} className="text-slate-600 group-hover:text-white transition-colors shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Company Feed */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 font-mono">
                RECENT LOGS
              </h3>
              <div className="space-y-2">
                {feedItems.slice(0, 5).map(item => (
                  <div key={item.id} className="p-2 rounded-xl bg-slate-950/70 border border-white/5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-[11px] font-bold text-white truncate">{item.title}</h4>
                      <span className="text-[9px] font-mono text-slate-500 shrink-0">{item.timestamp}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SubPageLayout>
  );
};
