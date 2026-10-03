import React from "react";
import { ArrowLeft, Gauge, Zap, Star } from "lucide-react";
import { useSimulationClockStore, formatSimDate } from "../../state/simulationClockStore";
import { useCompanyFinanceStore } from "../../state/companyFinanceStore";
import { useTradeStore, selectTotalMaterialsTonnes } from "../../state/tradeStore";
import { useReputationStore } from "../../state/reputationStore";
import { useVehicleProjectStore } from "../../state/vehicleProjectStore";
import type { Stage } from "../StageSwitcher";

interface SubPageLayoutProps {
  title: string;
  category: string;
  icon: React.ReactNode;
  accentColor?: string; // Border & glow classes
  onSelectStage: (stage: Stage) => void;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const SubPageLayout: React.FC<SubPageLayoutProps> = ({
  title,
  category,
  icon,
  onSelectStage,
  children,
  rightAction,
}) => {
  const { year, month, day } = useSimulationClockStore();
  const cash = useCompanyFinanceStore((s) => s.cash);
  const materialsTonnes = useTradeStore(selectTotalMaterialsTonnes);
  const reputation = useReputationStore((s) => s.overallReputation);
  const activeProject = useVehicleProjectStore((s) => s.activeProject);

  const formatCurrency = (val: number) => {
    return "$" + val.toLocaleString("en-US");
  };

  return (
    <div className="main-menu-root w-full min-h-screen text-slate-900 flex flex-col justify-between select-none bg-gradient-to-br from-[#f7f5ef] via-[#f1eee4] to-[#e8e4d8] p-3 sm:p-5 lg:p-6 relative font-sans">
      {/* Dynamic ambient radial lighting backdrop contained to prevent pseudo-overflow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-amber-400/12 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-3xl" />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION HEADER (Warm Light Glass)
      ───────────────────────────────────────────────────────────── */}
      <header className="relative z-10 w-full py-2.5 px-4 sm:px-6 mb-4 rounded-2xl bg-[#f8f6f0]/95 border border-[#dad4c5] backdrop-blur-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        {/* Back to Main Menu Button */}
        <button
          onClick={() => onSelectStage("main_menu")}
          className="group flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#ffffff]/90 hover:bg-[#ffffff] border border-[#d2ccc0] hover:border-amber-400/80 text-slate-800 transition-all shadow-xs active:scale-95"
          title="Return to Main Menu Hub"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-amber-600" />
          <span className="text-xs font-black tracking-wider uppercase font-mono">
            Main Menu
          </span>
        </button>

        {/* Center: Module Title & Icon */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
            {icon}
          </div>
          <div>
            <div className="text-sm sm:text-base font-black tracking-wider text-slate-900 font-mono uppercase leading-tight">
              {title}
            </div>
            <div className="text-[10px] font-bold text-slate-500 font-mono tracking-widest uppercase">
              {category}
            </div>
          </div>
        </div>

        {/* Right: Active Project & Resources Badges */}
        <div className="flex items-center gap-3">
          {rightAction}

          {/* Project & Sim Date */}
          <div className="hidden md:flex items-center gap-2.5 bg-[#f3ede3] border border-[#ded5c7] px-3.5 py-1.5 rounded-xl shadow-xs">
            <div className="text-right">
              <div className="text-xs font-extrabold text-slate-900 font-mono truncate max-w-[160px]">
                {activeProject.name}
              </div>
              <div className="text-[10px] text-amber-800 font-mono font-bold">
                {formatSimDate(year, month, day)}
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
              <Gauge size={14} />
            </div>
          </div>

          {/* Cash & Materials Quick Badge */}
          <div className="flex items-center gap-2 bg-[#f0ede6] border border-[#ded5c7] px-3 py-1.5 rounded-xl text-xs font-mono shadow-xs">
            <span className="text-emerald-700 font-extrabold">{formatCurrency(cash)}</span>
            <span className="text-slate-400">•</span>
            <span className="text-sky-700 font-extrabold">{materialsTonnes.toLocaleString()} t</span>
          </div>

          {/* Reputation Badge */}
          <button
            onClick={() => onSelectStage("reputation")}
            className="flex items-center gap-1.5 bg-[#fcf5e6] hover:bg-[#faeed6] border border-[#eedab2] hover:border-amber-400 px-2.5 py-1.5 rounded-xl text-xs font-mono shadow-xs text-amber-900 transition-all cursor-pointer group active:scale-95"
            title="Open Corporate Reputation & Brand Equity"
          >
            <Star size={13} className="text-amber-500 fill-amber-500 group-hover:scale-110 transition-transform" />
            <span className="font-extrabold text-amber-950">{reputation}</span>
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN PAGE CONTENT SLOT
      ───────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 w-full flex flex-col mb-4">
        {children}
      </main>

      {/* ─────────────────────────────────────────────────────────────
          3. FOOTER QUICK BAR
      ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 w-full py-2.5 px-4 rounded-xl bg-[#f4f2ec]/95 border border-[#d5d0c2] text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          <Zap size={13} className="text-amber-600" />
          <span className="text-slate-700">Apex Corporate Automotive Ecosystem • All changes synchronized in real time.</span>
        </div>
        <div className="font-mono text-[10px] text-slate-500 font-bold">
          DESIGN PHASE PREPARATION ARCHITECTURE
        </div>
      </footer>
    </div>
  );
};
