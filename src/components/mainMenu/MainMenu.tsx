import React, { useEffect, useState } from "react";
import {
  Wrench, Car, Flag, FlaskConical, Factory, Play, Pause, FastForward,
  Star, ChevronRight, Scale, Wind, DollarSign, Gauge, Building,
  Calendar as CalendarIcon, Globe, FileText, Settings,
  TrendingUp, Truck, Trophy, Sparkles, Users, Zap, Clock, Shield,
  CheckCircle2, AlertCircle, ArrowRight
} from "lucide-react";
import { useSimulationClockStore, formatSimDate } from "../../state/simulationClockStore";
import { useDeveloperModeStore } from "../../state/developerModeStore";
import { useCompanyActivities } from "../../hooks/useCompanyActivities";

interface MainMenuProps {
  onSelectStage: (stage: string) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onSelectStage }) => {
  const {
    year, month, day, hour, minute, dayOfWeek, week, isPlaying, speed,
    cash, materialsTonnes, reputation,
    activeProject, todayEvents, feedItems,
    togglePlay, setSpeed,
  } = useSimulationClockStore();

  const { activities, isIdle, activeCount } = useCompanyActivities();
  const [selectedActivityIdx, setSelectedActivityIdx] = useState<number>(0);

  useEffect(() => {
    if (selectedActivityIdx >= activities.length && activities.length > 0) {
      setSelectedActivityIdx(0);
    }
  }, [activities.length, selectedActivityIdx]);

  const currentActivity = activities[selectedActivityIdx] || activities[0] || null;

  // Format currency
  const formatCurrency = (val: number) => {
    return "$" + val.toLocaleString("en-US");
  };

  const speedOptions: (1 | 2 | 5 | 10 | 25 | 50)[] = [1, 2, 5, 10, 25, 50];
  const handleCycleSpeed = () => {
    const curIdx = speedOptions.indexOf(speed);
    const nextSpeed = speedOptions[(curIdx + 1) % speedOptions.length];
    setSpeed(nextSpeed);
  };

  // Solid colored square icon badges matching luxury master reference
  const getFeedIcon = (type: string) => {
    switch (type) {
      case "rnd":
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/50 shrink-0">
            <FlaskConical size={18} />
          </div>
        );
      case "motorsport":
        return (
          <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-900/50 shrink-0">
            <Flag size={18} />
          </div>
        );
      case "supplier":
        return (
          <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-900/50 shrink-0">
            <Truck size={18} />
          </div>
        );
      case "competitor":
        return (
          <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-900/50 shrink-0">
            <TrendingUp size={18} />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-900/50 shrink-0">
            <Trophy size={18} />
          </div>
        );
    }
  };

  const renderMetricIcon = (iconType: string) => {
    switch (iconType) {
      case "car": return <Car size={13} className="text-sky-600" />;
      case "gauge": return <Gauge size={13} className="text-emerald-600" />;
      case "flask": return <FlaskConical size={13} className="text-purple-600" />;
      case "building": return <Building size={13} className="text-amber-600" />;
      case "clock": return <Clock size={13} className="text-indigo-600" />;
      case "users": return <Users size={13} className="text-emerald-600" />;
      case "dollar": return <DollarSign size={13} className="text-amber-600" />;
      case "scale": return <Scale size={13} className="text-sky-600" />;
      default: return <Sparkles size={13} className="text-sky-600" />;
    }
  };

  return (
    <div className="main-menu-root w-full h-full max-h-screen text-slate-900 flex flex-col justify-between select-none bg-[#f6f4ee] p-2.5 sm:p-3 relative font-sans overflow-hidden">
      {/* Subtle ambient lighting backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] bg-emerald-500/5 rounded-full blur-[140px]" />
        <div className="absolute top-1/4 -right-24 w-[480px] h-[480px] bg-amber-400/6 rounded-full blur-[130px]" />
        <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-[150px]" />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. TOP BAR HEADER (Warm Light Glass)
      ───────────────────────────────────────────────────────────── */}
      <header className="relative z-10 w-full py-1.5 px-3 sm:px-4 mb-2 rounded-xl bg-[#fcfbf9]/95 border border-[#dad4c5] backdrop-blur-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs shrink-0">
        {/* Left: Stylized Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 via-slate-900 to-black p-0.5 shadow-sm border border-slate-700 flex items-center justify-center">
            <svg
              viewBox="0 0 36 28"
              className="h-4 w-5 text-white fill-current drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon points="0,0 8,0 18,24 28,0 36,0 22,28 14,28" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-black tracking-widest text-slate-900 uppercase font-mono leading-none">
              APEX AUTOMOTIVE
            </div>
            <div className="text-[9px] font-bold text-slate-500 font-mono tracking-wider mt-0.5">
              GLOBAL HEADQUARTERS
            </div>
          </div>
        </div>

        {/* Center: Live Date & Simulation Speed Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-right">
            <div className="text-xs sm:text-sm font-black tracking-wider text-slate-900 font-mono leading-tight">
              {formatSimDate(year, month, day)}
            </div>
            <div className="text-[9px] font-bold tracking-widest text-slate-500 font-mono">
              {dayOfWeek} &nbsp; W{week} &nbsp;│&nbsp;{" "}
              <span className="px-1 py-0.2 rounded bg-amber-100 text-amber-900 font-extrabold border border-amber-300">
                {String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Time speed controls in sleek warm pill */}
          <div className="flex items-center gap-0.5 bg-[#eae6db] p-0.5 rounded-lg border border-[#d2ccc0] shadow-inner">
            <button
              onClick={togglePlay}
              className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                !isPlaying
                  ? "bg-amber-500 text-slate-950 font-bold shadow-xs shadow-amber-500/30"
                  : "text-slate-600 hover:text-slate-950"
              }`}
              title={isPlaying ? "Pause Simulation" : "Resume Simulation"}
            >
              <Pause size={11} />
            </button>
            <button
              onClick={togglePlay}
              className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                isPlaying
                  ? "bg-emerald-600 text-white font-bold shadow-xs shadow-emerald-600/30"
                  : "text-slate-600 hover:text-slate-950"
              }`}
              title="Play Simulation (1x)"
            >
              <Play size={11} />
            </button>
            <button
              onClick={handleCycleSpeed}
              className="px-1.5 h-6 rounded flex items-center gap-1 text-[10px] font-mono font-bold text-slate-700 hover:text-slate-950 hover:bg-[#dfd9cd] transition-all"
              title="Cycle Speed (1x, 2x, 5x, 10x, 25x, 50x)"
            >
              <FastForward size={11} className={speed > 1 ? "text-amber-600" : "text-slate-500"} />
              <span>{speed}x</span>
            </button>
          </div>
        </div>

        {/* Right: Company Resources Status Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cash */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#eaf4ec] border border-[#bddfc5] shadow-2xs">
            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
              $
            </div>
            <div>
              <div className="text-xs font-extrabold font-mono text-emerald-950 leading-tight">
                {formatCurrency(cash)}
              </div>
              <div className="text-[8px] font-bold text-emerald-800 uppercase tracking-widest">
                Cash
              </div>
            </div>
          </div>

          {/* Materials */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#ecf3f8] border border-[#c4deee] shadow-2xs">
            <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
              ⚙
            </div>
            <div>
              <div className="text-xs font-extrabold font-mono text-sky-950 leading-tight">
                {materialsTonnes.toLocaleString()} t
              </div>
              <div className="text-[8px] font-bold text-sky-800 uppercase tracking-widest">
                Materials
              </div>
            </div>
          </div>

          {/* Reputation */}
          <button
            onClick={() => onSelectStage("reputation")}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#fbf4e5] border border-[#f0dba7] hover:border-amber-400 hover:bg-[#f6ebd4] transition-all shadow-2xs group text-left cursor-pointer active:scale-95"
            title="Open Corporate Reputation & Brand Equity Dashboard"
          >
            <Star size={14} className="text-amber-500 fill-amber-500 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-xs font-extrabold font-mono text-amber-950 leading-tight flex items-center gap-1">
                {reputation}
                <ChevronRight size={10} className="text-amber-700 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="text-[8px] font-bold text-amber-800 group-hover:text-amber-900 uppercase tracking-widest transition-colors">
                Reputation
              </div>
            </div>
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. TOP ROW: HERO NAVIGATION CARDS (Inspiration Reference)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5 mb-2 shrink-0">
        {[
          {
            id: "create_vehicle_hub",
            title: "CREATE VEHICLE",
            desc: "Design, engineer, and build championship-grade vehicles.",
            icon: <Wrench size={12} />,
            image: "/assets/main_menu/create_vehicle.jpg",
          },
          {
            id: "garage",
            title: "GARAGE",
            desc: "Manage, maintain, and upgrade your diverse vehicle collection.",
            icon: <Car size={12} />,
            image: "/assets/main_menu/garage.jpg",
          },
          {
            id: "motorsport",
            title: "MOTORSPORT",
            desc: "Compete in global leagues and elite racing events.",
            icon: <Flag size={12} />,
            image: "/assets/main_menu/motorsport.jpg",
          },
          {
            id: "rd",
            title: "R&D",
            desc: "Research, innovate, and develop next-gen automotive tech.",
            icon: <FlaskConical size={12} />,
            image: "/assets/main_menu/rd.jpg",
          },
          {
            id: "operations",
            title: "OPERATIONS",
            desc: "Monitor and optimize factory lines and supply chains.",
            icon: <Factory size={12} />,
            image: "/assets/main_menu/operations.jpg",
          },
        ].map((card) => (
          <div
            key={card.id}
            onClick={() => onSelectStage(card.id)}
            className="group relative rounded-xl sm:rounded-2xl overflow-hidden border border-[#dad4c5] hover:border-[#b8957c]/80 bg-[#fdfcfa] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            {/* Top Visual Image Section */}
            <div className="relative h-16 sm:h-20 lg:h-22 w-full overflow-hidden bg-slate-200">
              <img
                src={card.image}
                alt={card.title}
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {/* Subtle top scrim to make header text pop */}
              <div className="absolute inset-x-0 top-0 h-9 bg-gradient-to-b from-black/65 via-black/25 to-transparent pointer-events-none" />

              {/* Top Header Label */}
              <div className="absolute top-2 left-2.5 flex items-center pointer-events-none z-10">
                <span className="text-[10px] sm:text-[11px] font-black tracking-wider text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] font-mono uppercase">
                  {card.title}
                </span>
              </div>
            </div>

            {/* Bottom Info Section */}
            <div className="p-2 sm:p-2.5 bg-[#fdfcfa] group-hover:bg-white border-t border-[#eae5dc] flex flex-col justify-between flex-1 transition-colors">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-slate-600 group-hover:text-slate-900 transition-colors shrink-0">
                    {card.icon}
                  </span>
                  <h3 className="text-xs font-black text-slate-900 tracking-wider font-mono truncate uppercase group-hover:text-[#ad5b35] transition-colors">
                    {card.title}
                  </h3>
                </div>
                <ChevronRight
                  size={12}
                  className="text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </div>

              <p className="text-[10px] text-slate-600 font-medium leading-snug mt-1 line-clamp-1">
                {card.desc}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. CENTER MAIN CONTENT: LEFT HERO + RIGHT SIDEBAR
      ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 mb-2 flex-1 min-h-0 overflow-hidden">
        {/* LEFT HERO: CURRENT COMPANY ACTIVITY OR IDLE STANDBY (8 Cols) */}
        {!isIdle && currentActivity ? (
          <div className="lg:col-span-8 rounded-2xl overflow-hidden border border-[#dad4c5] relative shadow-md flex flex-col justify-between p-3.5 sm:p-4 min-h-0 h-full bg-[#fbf9f4]">
            {/* Panoramic Campus Background Image */}
            <img
              src="/assets/main_menu/campus_hero.jpg"
              alt="HQ Campus"
              className="absolute inset-0 w-full h-full object-cover opacity-55"
            />
            {/* Luminous Warm Light Scrim */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#fefcf8]/96 via-[#fefcf8]/75 to-[#fefcf8]/20 pointer-events-none" />

            {/* Top Activity Header */}
            <div className="relative z-10 max-w-2xl">
              {/* Multi-Activity Stream Switcher if multiple projects are running */}
              {activities.length > 1 && (
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className="text-[9px] font-black text-slate-500 font-mono uppercase tracking-wider">
                    STREAMS ({activities.length}):
                  </span>
                  {activities.map((act, idx) => {
                    const isSelected = idx === selectedActivityIdx;
                    return (
                      <button
                        key={act.id}
                        onClick={() => setSelectedActivityIdx(idx)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all border flex items-center gap-1 shadow-2xs ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-800 shadow-2xs"
                            : "bg-white/80 text-slate-700 border-[#d2ccc0] hover:bg-white hover:text-slate-900"
                        }`}
                      >
                        {act.type === "car_production" && (
                          <Car size={11} className={isSelected ? "text-sky-300" : "text-sky-600"} />
                        )}
                        {act.type === "rnd" && (
                          <FlaskConical size={11} className={isSelected ? "text-emerald-300" : "text-emerald-600"} />
                        )}
                        {act.type === "hq_upgrade" && (
                          <Building size={11} className={isSelected ? "text-amber-300" : "text-amber-600"} />
                        )}
                        <span className="truncate max-w-[100px]">{act.title}</span>
                        <span className={isSelected ? "text-amber-300 font-black" : "text-slate-500"}>
                          {act.progressPct}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <span className="text-[9px] font-black text-[#8a4a2b] bg-[#fbf0e8] border border-[#eecbbe] px-2.5 py-0.5 rounded-full uppercase tracking-widest font-mono inline-flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c97c5d] animate-ping inline-block" />
                ACTIVITY • {currentActivity.badgeLabel}
              </span>

              {/* Title with duration remaining & progress percentage side badge */}
              <div className="flex flex-wrap items-center gap-2 mt-1 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-wide drop-shadow-2xs">
                  {currentActivity.title}
                </h1>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg bg-amber-100/95 border border-amber-300 text-amber-950 font-mono text-[11px] font-extrabold shadow-2xs">
                  <Clock size={12} className="text-amber-700 animate-pulse shrink-0" />
                  <span className="tracking-wide uppercase">{currentActivity.durationLeftText}</span>
                  <span className="text-amber-400 font-normal">│</span>
                  <span className="text-emerald-700 font-black">{currentActivity.progressPct}%</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-snug mb-2 max-w-xl font-medium line-clamp-2">
                {currentActivity.subtitle}
              </p>

              <button
                onClick={() => onSelectStage(currentActivity.stageAction)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#c97c5d] to-[#99583b] hover:from-[#ba6e4f] hover:to-[#884b30] text-[11px] font-black tracking-wider text-white shadow-sm group active:scale-95 transition-all uppercase font-mono"
              >
                <span>{currentActivity.actionButtonText}</span>
                <ChevronRight
                  size={13}
                  className="group-hover:translate-x-1 transition-transform text-white/90"
                />
              </button>
            </div>

            {/* Bottom Split: Attributes 4-Grid + Development / Execution Progress */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-2.5 mt-2">
              {/* Project Focus & Attributes (7 Cols) */}
              <div className="project-focus-card md:col-span-7 bg-[#edf3eb] border border-[#c6d7c2] rounded-xl p-2.5 shadow-2xs">
                <span className="text-[9px] font-bold text-[#2d4a2d] uppercase tracking-wider block mb-1.5 font-mono">
                  PROJECT FOCUS & ATTRIBUTES
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {currentActivity.metrics.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border shadow-2xs ${
                        m.colorTheme === "blue"
                          ? "bg-[#e4eff8] border-[#b8d6ec] text-sky-800"
                          : m.colorTheme === "green"
                          ? "bg-[#e5f2e7] border-[#b8dfbc] text-emerald-800"
                          : m.colorTheme === "purple"
                          ? "bg-[#edeef9] border-[#c7cbf0] text-indigo-800"
                          : "bg-[#fcf3e3] border-[#edd5ae] text-amber-800"
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[9px] uppercase font-bold">
                        {renderMetricIcon(m.iconType)}
                        <span>{m.label}</span>
                      </div>
                      <div className="text-sm sm:text-base font-black text-slate-900 mt-0.5 font-mono truncate">
                        {m.value}
                      </div>
                      <div className="text-[8px] font-bold tracking-wider uppercase mt-0.5 truncate opacity-90">
                        {m.sub}
                      </div>
                      <div className="w-full h-1 bg-black/10 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            m.colorTheme === "blue"
                              ? "bg-sky-500 shadow-xs shadow-sky-400/50"
                              : m.colorTheme === "green"
                              ? "bg-emerald-500 shadow-xs shadow-emerald-400/50"
                              : m.colorTheme === "purple"
                              ? "bg-indigo-500 shadow-xs shadow-indigo-400/50"
                              : "bg-amber-500 shadow-xs shadow-amber-400/50"
                          }`}
                          style={{ width: `${Math.max(5, Math.min(100, m.progressPct))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Progress (5 Cols) */}
              <div className="dev-progress-card md:col-span-5 bg-[#f8f5ed] border border-[#e0d6c5] rounded-xl p-2.5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold text-[#4a3f2d] uppercase tracking-wider font-mono">
                      EXECUTION PROGRESS
                    </span>
                    <span className="text-[10px] font-mono font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                      {currentActivity.progressPct}%
                    </span>
                  </div>

                  {/* Main Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-[#e8e2d4] overflow-hidden border border-[#d8d0bf] mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 via-sky-500 to-emerald-500 rounded-full transition-all duration-500 shadow-2xs"
                      style={{ width: `${currentActivity.progressPct}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  {currentActivity.stages.map((st, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-[11px] font-semibold mb-0.5">
                        <span className="text-slate-800 font-bold truncate max-w-[140px]">
                          {st.name}
                        </span>
                        <span className="text-slate-600 font-mono text-[10px] font-bold">
                          {st.statusLabel}
                        </span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-[#e4ded0] overflow-hidden border border-[#d6cfbf]">
                        <div
                          className={`h-full ${st.color} rounded-full transition-all duration-500`}
                          style={{ width: `${st.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* IDLE STATE: When no car production, R&D tech, or HQ upgrade is running */
          <div className="lg:col-span-8 rounded-2xl overflow-hidden border border-[#dad4c5] relative shadow-md flex flex-col justify-between p-3.5 sm:p-4 min-h-0 h-full bg-[#fbf9f4]">
            {/* Panoramic Campus Background Image */}
            <img
              src="/assets/main_menu/campus_hero.jpg"
              alt="HQ Campus"
              className="absolute inset-0 w-full h-full object-cover opacity-55"
            />
            {/* Luminous Warm Light Scrim */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#fefcf8]/96 via-[#fefcf8]/75 to-[#fefcf8]/20 pointer-events-none" />

            {/* Top Activity Header */}
            <div className="relative z-10 max-w-2xl">
              <span className="text-[9px] font-extrabold text-amber-900 bg-amber-50/90 border border-amber-300/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono inline-flex items-center gap-1.5 shadow-2xs backdrop-blur-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block ring-2 ring-amber-300 animate-pulse" />
                IDLE · ALL DIVISIONS ON STANDBY
              </span>

              <div className="flex flex-wrap items-center gap-2 mt-1 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-wide drop-shadow-2xs">
                  ALL SYSTEMS IDLE
                </h1>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-100/90 border border-slate-300 text-slate-700 font-mono text-[10px] font-extrabold shadow-2xs backdrop-blur-xs">
                  <Clock size={12} className="text-slate-500" />
                  <span>0 ACTIVE TASKS</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-snug mb-2 max-w-xl font-medium line-clamp-2">
                No vehicle production batches, R&D technology programs, or campus construction expansions are currently active. Direct your company workforce and facilities using the launch options below.
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onSelectStage("manufacturing")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/85 hover:bg-white text-slate-800 border border-[#d2cbbe] hover:border-[#b8af9f] text-[10px] font-black tracking-wider shadow-2xs active:scale-95 transition-all uppercase font-mono backdrop-blur-xs cursor-pointer"
                >
                  <Factory size={12} className="text-slate-600" />
                  <span>CAR PRODUCTION</span>
                </button>

                <button
                  onClick={() => onSelectStage("rd")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/85 hover:bg-white text-slate-800 border border-[#d2cbbe] hover:border-[#b8af9f] text-[10px] font-black tracking-wider shadow-2xs active:scale-95 transition-all uppercase font-mono backdrop-blur-xs cursor-pointer"
                >
                  <FlaskConical size={12} className="text-slate-600" />
                  <span>LAUNCH R&D</span>
                </button>

                <button
                  onClick={() => onSelectStage("hq")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/85 hover:bg-white text-slate-800 border border-[#d2cbbe] hover:border-[#b8af9f] text-[10px] font-black tracking-wider shadow-2xs active:scale-95 transition-all uppercase font-mono backdrop-blur-xs cursor-pointer"
                >
                  <Building size={12} className="text-slate-600" />
                  <span>UPGRADE HQ</span>
                </button>
              </div>
            </div>

            {/* Bottom Split: Ready Standby Divisions (7 Cols) + Capacity Overview (5 Cols) */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-2.5 mt-2">
              {/* Standby Divisions (7 Cols) */}
              <div className="md:col-span-7 bg-[#f4f7f3]/90 border border-[#d5ded3] rounded-xl p-2.5 shadow-2xs backdrop-blur-xs">
                <span className="text-[9px] font-bold text-[#2d4a2d] uppercase tracking-wider block mb-1.5 font-mono">
                  FACILITIES & DIVISIONS READY FOR DIRECTIVES
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* 1. Manufacturing */}
                  <div
                    onClick={() => onSelectStage("manufacturing")}
                    className="p-2 rounded-lg bg-white/90 border border-[#b8d6ec] hover:border-sky-500 hover:bg-sky-50/50 cursor-pointer transition-all shadow-2xs group"
                  >
                    <div className="w-6 h-6 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                      <Factory size={13} />
                    </div>
                    <div className="text-[11px] font-black text-slate-900">Vehicle Assembly</div>
                    <div className="text-[9px] text-slate-600 leading-snug line-clamp-1">
                      Tooling ready for batch
                    </div>
                  </div>

                  {/* 2. R&D */}
                  <div
                    onClick={() => onSelectStage("rd")}
                    className="p-2 rounded-lg bg-white/90 border border-[#b8dfbc] hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer transition-all shadow-2xs group"
                  >
                    <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                      <FlaskConical size={13} />
                    </div>
                    <div className="text-[11px] font-black text-slate-900">Research & Tech</div>
                    <div className="text-[9px] text-slate-600 leading-snug line-clamp-1">
                      Staff available for tech
                    </div>
                  </div>

                  {/* 3. HQ Expansion */}
                  <div
                    onClick={() => onSelectStage("hq")}
                    className="p-2 rounded-lg bg-white/90 border border-[#edd5ae] hover:border-amber-500 hover:bg-amber-50/50 cursor-pointer transition-all shadow-2xs group"
                  >
                    <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                      <Building size={13} />
                    </div>
                    <div className="text-[11px] font-black text-slate-900">Civil & Campus</div>
                    <div className="text-[9px] text-slate-600 leading-snug line-clamp-1">
                      Facility plots ready
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Capacity & Readiness (5 Cols) */}
              <div className="md:col-span-5 bg-[#fbf8f2]/90 border border-[#e4dcce] rounded-xl p-2.5 shadow-2xs flex flex-col justify-between backdrop-blur-xs">
                <div>
                  <span className="text-[9px] font-bold text-[#4a3f2d] uppercase tracking-wider block mb-1.5 font-mono">
                    COMPANY READINESS & RESOURCES
                  </span>
                  <div className="space-y-1 text-[11px] font-mono">
                    <div className="flex justify-between items-center py-0.5 border-b border-[#ece4d5]">
                      <span className="text-slate-600">Treasury Capital:</span>
                      <span className="font-extrabold text-emerald-800">{formatCurrency(cash)}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-[#ece4d5]">
                      <span className="text-slate-600">Materials:</span>
                      <span className="font-extrabold text-sky-800">{materialsTonnes.toLocaleString()} t</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-[#ece4d5]">
                      <span className="text-slate-600">Brand Rep:</span>
                      <span className="font-extrabold text-amber-800">{reputation} PTS</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectStage("create_vehicle_hub")}
                  className="w-full mt-2 py-1.5 rounded-lg bg-[#f4f0e6] hover:bg-[#eae4d5] border border-[#d8d0bf] text-slate-900 text-[11px] font-black uppercase tracking-wider font-mono flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-98 cursor-pointer"
                >
                  <span>VEHICLE DESIGN STUDIO</span>
                  <ChevronRight size={12} className="text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT SIDEBAR: COMPANY FEED & TODAY'S EVENTS (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-2.5 h-full min-h-0">
          {/* Card 1: COMPANY FEED */}
          <div className="company-feed-card flex-1 bg-[#fbfaf6] border border-[#dad4c5] rounded-xl p-2.5 shadow-xs flex flex-col justify-between min-h-0 overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#eae5dc]">
                <span className="text-xs font-black text-slate-900 tracking-wider uppercase font-mono">
                  COMPANY FEED
                </span>
                <button
                  onClick={() => onSelectStage("calendar")}
                  className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
                >
                  View All <ChevronRight size={11} />
                </button>
              </div>

              <div className="space-y-1.5">
                {feedItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-1.5 rounded-lg bg-white/90 hover:bg-white border border-[#eae5dc] shadow-2xs transition-all"
                  >
                    {getFeedIcon(item.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-[11px] font-bold text-slate-900 truncate">
                          {item.title}
                        </h4>
                        <span className="text-[9px] text-slate-500 font-mono shrink-0">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: TODAY'S EVENTS */}
          <div className="todays-events-card bg-[#fbfaf6] border border-[#dad4c5] rounded-xl p-2.5 shadow-xs shrink-0">
            <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-[#eae5dc]">
              <span className="text-xs font-black text-slate-900 tracking-wider uppercase font-mono flex items-center gap-1.5">
                <CalendarIcon size={12} className="text-amber-600" />
                TODAY'S EVENTS
              </span>
              <button
                onClick={() => onSelectStage("calendar")}
                className="text-[10px] text-amber-800 hover:text-amber-900 font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
              >
                Calendar <ChevronRight size={11} />
              </button>
            </div>

            <div className="space-y-1">
              {todayEvents.slice(0, 2).map((ev, idx) => (
                <div
                  key={ev.id}
                  onClick={() => {
                    if (ev.actionStage) onSelectStage(ev.actionStage);
                  }}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-white/85 hover:bg-white border border-[#eae5dc] shadow-2xs transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        idx === todayEvents.length - 1 ? "bg-rose-500" : "bg-emerald-500"
                      } group-hover:scale-125 transition-transform`}
                    />
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {ev.time}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors truncate max-w-[160px]">
                      {ev.title}
                    </span>
                  </div>
                  <ChevronRight
                    size={11}
                    className="text-slate-400 group-hover:text-slate-700 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. BOTTOM BAR / FOOTER NAVIGATION DOCK
      ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 w-full py-1.5 px-3 sm:px-4 rounded-xl bg-[#f8f6f0]/95 border border-[#dad4c5] backdrop-blur-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs shrink-0">
        {/* Left: COMPANY HQ Card Link */}
        <div
          onClick={() => onSelectStage("hq")}
          className="flex items-center gap-2 cursor-pointer group p-0.5 pr-2 rounded-lg hover:bg-[#eae5d8] transition-all"
        >
          <div className="w-11 h-7 rounded-md overflow-hidden border border-[#d0cac0] relative shrink-0 shadow-2xs">
            <img
              src="/assets/main_menu/campus_hero.jpg"
              alt="HQ"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div>
            <div className="text-[11px] font-black text-slate-900 group-hover:text-emerald-700 transition-colors uppercase font-mono">
              COMPANY HQ
            </div>
            <div className="text-[9px] text-slate-600 flex items-center gap-0.5 font-medium">
              Manage facilities{" "}
              <ChevronRight
                size={10}
                className="group-hover:translate-x-0.5 transition-transform text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Right: Quick Action Dock Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* HQ */}
          <button
            onClick={() => onSelectStage("hq")}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-[#eae5d8] text-slate-700 hover:text-slate-950 transition-all text-center group cursor-pointer"
            title="Company Campus Facilities"
          >
            <Building
              size={14}
              className="text-slate-600 group-hover:scale-110 group-hover:text-slate-950 transition-transform"
            />
            <span className="text-[9px] font-bold">HQ</span>
          </button>

          {/* Workforce */}
          <button
            onClick={() => onSelectStage("workforce")}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-[#eae5d8] text-slate-700 hover:text-slate-950 transition-all text-center group cursor-pointer"
            title="Workforce & Organizational Hierarchy"
          >
            <Users
              size={14}
              className="text-slate-600 group-hover:scale-110 group-hover:text-slate-950 transition-transform"
            />
            <span className="text-[9px] font-bold">Staff</span>
          </button>

          {/* Calendar */}
          <button
            onClick={() => onSelectStage("calendar")}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-[#eae5d8] text-slate-700 hover:text-slate-950 transition-all text-center group cursor-pointer"
            title="Master Simulation Calendar"
          >
            <CalendarIcon
              size={14}
              className="text-slate-600 group-hover:scale-110 group-hover:text-slate-950 transition-transform"
            />
            <span className="text-[9px] font-bold">Calendar</span>
          </button>

          {/* World */}
          <button
            onClick={() => onSelectStage("competitors")}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-[#eae5d8] text-slate-700 hover:text-slate-950 transition-all text-center group cursor-pointer"
            title="World Competitors & Global Market"
          >
            <Globe
              size={14}
              className="text-slate-600 group-hover:scale-110 group-hover:text-slate-950 transition-transform"
            />
            <span className="text-[9px] font-bold">World</span>
          </button>

          {/* Contracts */}
          <button
            onClick={() => onSelectStage("contracts")}
            className="relative flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg bg-[#dff3e5] border border-[#b8e4c3] text-emerald-950 shadow-2xs hover:bg-[#d4eedb] transition-all text-center group cursor-pointer"
            title="B2B Supply & Motorsport Contracts"
          >
            <Sparkles size={9} className="absolute -top-1 -right-1 text-amber-500 animate-pulse" />
            <FileText
              size={14}
              className="text-emerald-700 group-hover:scale-110 transition-transform"
            />
            <span className="text-[9px] font-bold text-emerald-950">Contracts</span>
          </button>

          {/* Reputation */}
          <button
            onClick={() => onSelectStage("reputation")}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-[#eae5d8] text-slate-700 hover:text-amber-800 transition-all text-center group cursor-pointer"
            title="Corporate Reputation & Brand Equity"
          >
            <Trophy
              size={14}
              className="text-slate-600 group-hover:scale-110 group-hover:text-amber-600 transition-transform"
            />
            <span className="text-[9px] font-bold">Reputation</span>
          </button>

          {/* Finance & Economy */}
          <button
            onClick={() => onSelectStage("economy")}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-[#eae5d8] text-slate-700 hover:text-sky-800 transition-all text-center group cursor-pointer"
            title="Company Finance, P&L, Balance Sheet & Vehicle Costs"
          >
            <DollarSign
              size={14}
              className="text-slate-600 group-hover:scale-110 group-hover:text-sky-700 transition-transform"
            />
            <span className="text-[9px] font-bold">Finance</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => onSelectStage("settings")}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-[#eae5d8] text-slate-700 hover:text-slate-950 transition-all text-center group cursor-pointer"
            title="Game Economy & Corporate Settings"
          >
            <Settings
              size={14}
              className="text-slate-600 group-hover:scale-110 group-hover:text-slate-950 transition-transform"
            />
            <span className="text-[9px] font-bold">Settings</span>
          </button>

          {/* Developer Sandbox */}
          <button
            onClick={() => useDeveloperModeStore.getState().toggleModal()}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-[#eae5d8] text-amber-800 hover:text-amber-950 transition-all text-center group cursor-pointer"
            title="Developer Sandbox & Overrides Matrix (F8 / F9 / Ctrl+Shift+D)"
          >
            <Zap
              size={14}
              className="text-amber-600 group-hover:scale-110 group-hover:text-amber-700 transition-transform"
            />
            <span className="text-[9px] font-bold">Dev Sandbox</span>
          </button>
        </div>
      </footer>

    </div>
  );
};
