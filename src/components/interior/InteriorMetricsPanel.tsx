import React, { useState } from 'react';
import { useSpring, SPRING_PRESETS } from '../../utils/useSpringPhysics';
import { useInteriorDashboardConfigStore } from '../../state/interiorDashboardConfigStore';
import { InteriorCompareModal } from './InteriorCompareModal';

const STAT_ICONS: Record<string, string> = {
  comfort: '★', ergonomics: '◎', quality: '◆', perceivedValue: '◈',
  reliability: '⛨', noiseIsolation: '◉', infotainment: '▣', marketAppeal: '♛',
};
const STAT_LABELS: Record<string, string> = {
  comfort: 'Comfort', ergonomics: 'Ergonomics', quality: 'Quality',
  perceivedValue: 'Perceived Value', reliability: 'Reliability',
  noiseIsolation: 'Noise Isolation', infotainment: 'Infotainment', marketAppeal: 'Market Appeal',
};
const STAT_KEYS = ['comfort','ergonomics','quality','perceivedValue','reliability','noiseIsolation','infotainment','marketAppeal'] as const;

/** Spring-animated metric row — each gets its own useSpring hook */
const MetricRow: React.FC<{ icon: string; label: string; value: number; theme?: 'dark' | 'amber' }> = ({
  icon,
  label,
  value,
  theme = 'amber',
}) => {
  const springProgress = useSpring(value / 100, SPRING_PRESETS.gentle);
  const displayVal = Math.round(springProgress * 100);
  const isDark = theme === 'dark';

  return (
    <div
      className={`flex flex-col gap-1 p-2 rounded-xl transition-all ${
        isDark
          ? 'bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800/90 shadow-sm'
          : 'bg-amber-100/60 border border-white/[0.06] hover:bg-amber-100/40'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs w-4 text-center ${isDark ? 'text-cyan-400' : 'text-amber-600'}`}>{icon}</span>
        <span className={`font-bold flex-1 px-1.5 text-[11px] truncate ${isDark ? 'text-slate-200' : 'text-amber-900'}`}>
          {label}
        </span>
        <span className={`font-mono font-bold text-[11px] ${isDark ? 'text-cyan-300' : 'text-amber-700'}`}>
          {displayVal}%
        </span>
      </div>
      <div
        className={`h-1.5 w-full rounded-full overflow-hidden border ${
          isDark ? 'bg-slate-950/80 border-slate-700/50' : 'bg-amber-200/60 border-white/[0.06]'
        }`}
      >
        <div
          className={`h-full rounded-full transition-all ${
            isDark
              ? 'bg-gradient-to-r from-red-500 via-amber-500 to-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
              : 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]'
          }`}
          style={{ width: `${displayVal}%` }}
        />
      </div>
    </div>
  );
};

export const InteriorMetricsPanel: React.FC<{ theme?: 'dark' | 'amber'; className?: string }> = ({ theme = 'amber', className }) => {
  const isDark = theme === 'dark';
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const metrics = useInteriorDashboardConfigStore((s) => s.metrics);
  const ratingColor =
    metrics.overallRating === 'S'
      ? '#f59e0b'
      : metrics.overallRating === 'A'
      ? '#4ade80'
      : metrics.overallRating === 'B'
      ? '#facc15'
      : metrics.overallRating === 'C'
      ? '#fb923c'
      : '#ef4444';

  return (
    <div
      className={`backdrop-blur-2xl p-3.5 flex flex-col gap-2.5 overflow-y-auto w-full h-full min-w-0 select-none ${
        className
          ? className
          : isDark
          ? 'bg-slate-900/90 border-r border-slate-800 text-slate-100 shadow-2xl'
          : 'bg-amber-50/80 border-r border-white/10 text-amber-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
      }`}
    >
      <div className={`flex items-center gap-2 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-white/10'}`}>
        <span className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-red-500' : 'bg-amber-400'} animate-pulse`} />
        <span className={`text-[12px] font-black tracking-widest uppercase ${isDark ? 'text-red-400' : 'text-amber-700'}`}>
          Interior Overview
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {STAT_KEYS.map((key) => (
          <MetricRow key={key} icon={STAT_ICONS[key]} label={STAT_LABELS[key]} value={metrics[key]} theme={theme} />
        ))}
      </div>

      <div
        className={`border rounded-2xl p-2.5 flex items-center justify-between ${
          isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-amber-100/60 border-white/[0.06]'
        }`}
      >
        <div className="flex flex-col gap-0.5">
          <span className={`text-[10px] font-mono uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-amber-600'}`}>
            Interior Rating
          </span>
          <span className={`text-xs font-extrabold ${isDark ? 'text-white' : 'text-amber-900'}`}>
            {metrics.ratingLabel}
          </span>
        </div>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl border-2 shadow-md ${
            isDark ? 'bg-slate-900/90' : 'bg-amber-100/60'
          }`}
          style={{ color: ratingColor, borderColor: ratingColor, textShadow: '0 0 14px ' + ratingColor + '60' }}
        >
          {metrics.overallRating}
        </div>
      </div>

      <div
        className={`flex flex-col gap-1.5 p-2.5 rounded-xl border text-[11px] ${
          isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-amber-100/60 border-white/[0.06]'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-amber-700/80'}`}>
            <span>♛</span> Market Appeal
          </span>
          <span className="font-mono font-bold" style={{ color: metrics.marketAppeal >= 60 ? '#4ade80' : '#facc15' }}>
            {metrics.marketAppeal}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-amber-700/80'}`}>
            <span>⚖</span> Total Mass
          </span>
          <span className={`font-mono font-bold ${isDark ? 'text-slate-200' : 'text-amber-900'}`}>{metrics.weight} kg</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-amber-700/80'}`}>
            <span>$</span> Production Cost
          </span>
          <span className="font-mono font-bold text-emerald-400">${metrics.cost.toLocaleString()}</span>
        </div>
      </div>

      <button
        className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
          isDark
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-600'
            : 'bg-amber-100/60 hover:bg-amber-200/60 text-amber-800 hover:text-amber-950 border-amber-300/40 hover:border-amber-400/60'
        }`}
        onClick={() => setCompareModalOpen(true)}
      >
        <span>⇌</span>
        <span>Compare Interiors</span>
      </button>

      <InteriorCompareModal isOpen={compareModalOpen} onClose={() => setCompareModalOpen(false)} />
    </div>
  );
};
