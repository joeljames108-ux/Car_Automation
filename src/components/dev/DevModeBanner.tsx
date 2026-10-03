import React, { useState } from "react";
import {
  Zap,
  Terminal,
  Settings,
  ChevronUp,
  ChevronDown,
  Lock,
  Calendar,
  DollarSign,
  Boxes,
  ShieldAlert,
} from "lucide-react";
import { useDeveloperModeStore } from "../../state/developerModeStore";
import { useDevConsoleStore } from "../../state/devConsoleStore";
import { useSimulationClockStore } from "../../state/simulationClockStore";
import { useCompanyFinanceStore } from "../../state/companyFinanceStore";
import { useTradeStore, selectTotalMaterialsTonnes } from "../../state/tradeStore";
import { formatGameDate } from "../../state/gameClockEngine";

export const DevModeBanner: React.FC = () => {
  const { devMode, overrides, activeScenario, toggleModal, toggleDevMode, resetToPlayerMode } =
    useDeveloperModeStore();
  const { toggle: toggleConsole, isOpen: isConsoleOpen } = useDevConsoleStore();
  const clock = useSimulationClockStore();
  const cash = useCompanyFinanceStore((s) => s.cash);
  const materialsTonnes = useTradeStore(selectTotalMaterialsTonnes);

  const [collapsed, setCollapsed] = useState(false);

  if (!devMode) {
    return null;
  }

  const activeOverridesCount = Object.values(overrides).filter(Boolean).length;
  const totalOverrides = Object.keys(overrides).length;

  const formattedDate = clock.getGameDateTime
    ? formatGameDate(clock.getGameDateTime())
    : `${clock.year}-${String(clock.month).padStart(2, "0")}-${String(clock.day).padStart(2, "0")}`;

  const formatCash = (val: number) => {
    if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
    return `$${val.toLocaleString()}`;
  };

  if (collapsed) {
    return (
      <div
        className="fixed top-2 right-4 z-[9999] flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 text-amber-50 rounded-full shadow-lg shadow-amber-950/40 border border-amber-400/40 text-xs font-mono font-medium backdrop-blur-md select-none transition-all duration-200 hover:brightness-110"
        title="Developer Mode Active (Click to expand banner)"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <Zap size={13} className="text-amber-200" />
        <span className="font-semibold tracking-wide">DEV</span>
        <span className="text-amber-200/80 text-[11px]">[{activeOverridesCount}/{totalOverrides}]</span>
        <button
          onClick={toggleConsole}
          className={`p-1 rounded hover:bg-black/20 text-amber-100 transition-colors ${isConsoleOpen ? "bg-black/30 text-emerald-300" : ""}`}
          title="Toggle Dev Console (F9)"
          aria-label="Toggle Dev Console"
        >
          <Terminal size={12} />
        </button>
        <button
          onClick={() => setCollapsed(false)}
          className="p-1 rounded hover:bg-black/20 text-amber-100 transition-colors"
          title="Expand Banner"
          aria-label="Expand Developer Banner"
        >
          <ChevronDown size={13} />
        </button>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Developer Mode Toolbar"
      className="fixed top-0 left-0 right-0 h-8 z-[9999] bg-gradient-to-r from-amber-800 via-amber-700 to-orange-800 text-amber-50 border-b border-amber-500/40 shadow-md backdrop-blur-md flex items-center justify-between px-3 text-xs font-mono select-none"
    >
      {/* Left: Indicator & Status */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 bg-black/25 px-2 py-0.5 rounded border border-amber-400/20">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Zap size={13} className="text-amber-300" />
          <span className="font-bold tracking-wider text-[11px] text-amber-100">
            DEV MODE
          </span>
        </div>

        {activeScenario ? (
          <span className="bg-amber-900/60 text-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-500/30">
            {activeScenario}
          </span>
        ) : (
          <span className="text-amber-200/80 text-[11px]">Custom Sandbox</span>
        )}

        <button
          onClick={toggleModal}
          className="hover:underline flex items-center gap-1 text-amber-200 hover:text-white transition-colors"
          title="Click to configure overrides"
        >
          <ShieldAlert size={12} className="text-amber-300" />
          <span>
            Overrides:{" "}
            <strong className="text-amber-100 font-bold">
              {activeOverridesCount}/{totalOverrides}
            </strong>
          </span>
        </button>
      </div>

      {/* Center: Live Simulation State */}
      <div className="hidden md:flex items-center gap-4 text-[11px] text-amber-100/90 font-medium">
        <span className="flex items-center gap-1">
          <Calendar size={12} className="text-amber-300" />
          {formattedDate}
        </span>
        <span className="flex items-center gap-1 text-emerald-300">
          <DollarSign size={12} />
          {formatCash(cash)}
        </span>
        <span className="flex items-center gap-1 text-sky-200">
          <Boxes size={12} />
          {materialsTonnes.toLocaleString()}t
        </span>
      </div>

      {/* Right: Quick Actions */}
      <div className="flex items-center gap-1.5">
        {/* Console Toggle Button */}
        <button
          onClick={toggleConsole}
          className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] transition-colors ${
            isConsoleOpen
              ? "bg-amber-500 text-slate-950 font-bold border-amber-300 shadow-sm"
              : "bg-black/25 text-amber-100 hover:bg-black/40 border-amber-400/30"
          }`}
          title="Toggle Developer Console (F9)"
        >
          <Terminal size={12} />
          <span>Console (F9)</span>
        </button>

        {/* Modal Settings Button */}
        <button
          onClick={toggleModal}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/25 hover:bg-black/40 text-amber-100 border border-amber-400/30 text-[11px] transition-colors"
          title="Open Developer Control Matrix (Ctrl+Shift+D)"
        >
          <Settings size={12} />
          <span>Matrix</span>
        </button>

        {/* Exit / Restore Button */}
        <button
          onClick={resetToPlayerMode}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-500/40 text-[11px] transition-colors"
          title="Reset overrides and lock progression"
        >
          <Lock size={11} />
          <span>Lock</span>
        </button>

        {/* Minimize Collapse Button */}
        <button
          onClick={() => setCollapsed(true)}
          className="p-1 rounded hover:bg-black/30 text-amber-200 transition-colors ml-1"
          title="Minimize banner (F8 toggles dev mode)"
          aria-label="Minimize banner"
        >
          <ChevronUp size={14} />
        </button>
      </div>
    </div>
  );
};
