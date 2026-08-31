/**
 * ============================================================================
 * INTERIOR METRICS PANEL — LEFT SIDEBAR
 * ============================================================================
 * Displays 8 animated progress bars, overall rating badge, weight & cost.
 * Subscribes to the Zustand interiorDashboardConfigStore for real-time updates.
 * Includes interactive Compare Interiors modal trigger.
 * ============================================================================
 */

import React, { useState } from "react";
import { useInteriorDashboardConfigStore } from "../../state/interiorDashboardConfigStore";
import { InteriorCompareModal } from "./InteriorCompareModal";

// Stat bar icon SVGs
const STAT_ICONS: Record<string, string> = {
  comfort: "☆",
  ergonomics: "◎",
  quality: "◆",
  perceivedValue: "◈",
  reliability: "⛨",
  noiseIsolation: "◉",
  infotainment: "▣",
  marketAppeal: "♛",
};

const STAT_LABELS: Record<string, string> = {
  comfort: "Comfort",
  ergonomics: "Ergonomics",
  quality: "Quality",
  perceivedValue: "Perceived Value",
  reliability: "Reliability",
  noiseIsolation: "Noise Isolation",
  infotainment: "Infotainment",
  marketAppeal: "Market Appeal",
};

const STAT_KEYS = [
  "comfort",
  "ergonomics",
  "quality",
  "perceivedValue",
  "reliability",
  "noiseIsolation",
  "infotainment",
  "marketAppeal",
] as const;

export const InteriorMetricsPanel: React.FC = () => {
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const metrics = useInteriorDashboardConfigStore((s) => s.metrics);

  const ratingColor =
    metrics.overallRating === "S"
      ? "#00e5ff"
      : metrics.overallRating === "A"
        ? "#4ade80"
        : metrics.overallRating === "B"
          ? "#facc15"
          : metrics.overallRating === "C"
            ? "#fb923c"
            : "#ef4444";

  return (
    <div className="idash-panel-left bg-[#0d121f] text-slate-100 border-r border-amber-800/30 p-4 flex flex-col gap-3 overflow-y-auto w-[310px] flex-shrink-0">
      {/* Section Header */}
      <div className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase flex items-center gap-1.5 pb-1 border-b border-amber-800/30/80">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        INTERIOR OVERVIEW
      </div>

      {/* Stat Bars */}
      <div className="flex flex-col gap-2">
        {STAT_KEYS.map((key) => {
          const val = metrics[key];
          return (
            <div key={key} className="flex flex-col gap-1 p-2 rounded-xl bg-amber-950/80/90 border border-amber-800/30/80 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="text-cyan-400 font-bold w-4 text-center">{STAT_ICONS[key]}</span>
                <span className="text-white font-bold flex-1 px-1.5 text-left">{STAT_LABELS[key]}</span>
                <span className="text-cyan-300 font-mono font-bold">{val}%</span>
              </div>
              <div className="h-1.5 w-full bg-amber-950 rounded-full overflow-hidden border border-amber-800/30">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(0,229,255,0.5)]"
                  style={{ width: `${val}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Rating Badge */}
      <div className="bg-amber-950/80/90 border border-amber-800/30 rounded-2xl p-3 flex items-center justify-between shadow-sm">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-amber-300/70 uppercase">Interior Rating</span>
          <span className="text-sm font-extrabold text-white">{metrics.ratingLabel}</span>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl border-2 bg-amber-950/80 shadow-md transition-all"
          style={{ color: ratingColor, borderColor: ratingColor, textShadow: `0 0 10px ${ratingColor}60` }}
        >
          {metrics.overallRating}
        </div>
      </div>

      {/* Stats Readout */}
      <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-amber-950/80/90 border border-amber-800/30 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-amber-300/70 flex items-center gap-1">
            <span>♛</span> Market Appeal
          </span>
          <span className="font-mono font-bold" style={{ color: metrics.marketAppeal >= 60 ? "#4ade80" : "#facc15" }}>
            {metrics.marketAppeal}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-amber-300/70 flex items-center gap-1">
            <span>⚖</span> Total Mass
          </span>
          <span className="font-mono font-bold text-white">{metrics.weight} kg</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-amber-300/70 flex items-center gap-1">
            <span>💲</span> Production Cost
          </span>
          <span className="font-mono font-bold text-emerald-400">${metrics.cost.toLocaleString()}</span>
        </div>
      </div>

      {/* Compare Button */}
      <button
        className="w-full py-2.5 px-3 rounded-xl bg-amber-900/40 hover:bg-slate-750 text-amber-100 hover:text-amber-50 border border-amber-700/30 hover:border-cyan-500/50 text-xs font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        onClick={() => setCompareModalOpen(true)}
      >
        <span>⇌</span>
        <span>COMPARE INTERIORS</span>
      </button>

      {/* Compare Modal */}
      <InteriorCompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
      />
    </div>
  );
};
