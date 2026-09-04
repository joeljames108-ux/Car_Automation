import React, { useState } from 'react';
import { useSpring, SPRING_PRESETS } from '../ui1/ux/useSpringPhysics';
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
const MetricRow: React.FC<{ icon: string; label: string; value: number }> = ({ icon, label, value }) => {
  const springProgress = useSpring(value / 100, SPRING_PRESETS.gentle);
  const displayVal = Math.round(springProgress * 100);
  return (
    <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-amber-100/60 border border-white/[0.06] hover:bg-amber-100/40 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-amber-600 text-sm w-5 text-center">{icon}</span>
        <span className="text-amber-900 font-bold flex-1 px-2 text-[13px]">{label}</span>
        <span className="text-amber-700 font-mono font-bold text-[13px]">{displayVal}%</span>
      </div>
      <div className="h-2 w-full bg-amber-200/60 rounded-full overflow-hidden border border-white/[0.06]">
        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.4)]" style={{ width: displayVal + "%" }} />
      </div>
    </div>
  );
};

export const InteriorMetricsPanel: React.FC = () => {
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const metrics = useInteriorDashboardConfigStore((s) => s.metrics);
  const ratingColor = metrics.overallRating === 'S' ? '#f59e0b' : metrics.overallRating === 'A' ? '#4ade80' : metrics.overallRating === 'B' ? '#facc15' : metrics.overallRating === 'C' ? '#fb923c' : '#ef4444';
  return (
    <div className='bg-amber-50/80 backdrop-blur-2xl border-r border-white/10 p-4 flex flex-col gap-3 overflow-y-auto w-[310px] flex-shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'>
      <div className='flex items-center gap-2 pb-2 border-b border-white/10'>
        <span className='w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse' />
        <span className='text-[14px] font-black tracking-widest text-amber-700 uppercase'>Interior Overview</span>
      </div>
      <div className='flex flex-col gap-2'>
        {STAT_KEYS.map((key) => (
          <MetricRow key={key} icon={STAT_ICONS[key]} label={STAT_LABELS[key]} value={metrics[key]} />
        ))}
      </div>
      <div className='bg-amber-100/60 border border-white/[0.06] rounded-2xl p-3.5 flex items-center justify-between'>
        <div className='flex flex-col gap-0.5'>
          <span className='text-[11px] font-mono text-amber-600 uppercase tracking-wider'>Interior Rating</span>
          <span className='text-sm font-extrabold text-amber-900'>{metrics.ratingLabel}</span>
        </div>
        <div className='w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl border-2 bg-amber-100/60 shadow-md' style={{ color: ratingColor, borderColor: ratingColor, textShadow: '0 0 14px ' + ratingColor + '60' }}>
          {metrics.overallRating}
        </div>
      </div>
      <div className='flex flex-col gap-2 p-3 rounded-xl bg-amber-100/60 border border-white/[0.06] text-[13px]'>
        <div className='flex items-center justify-between'>
          <span className='text-amber-700/80 flex items-center gap-1.5'><span>♛</span> Market Appeal</span>
          <span className='font-mono font-bold' style={{ color: metrics.marketAppeal >= 60 ? '#4ade80' : '#facc15' }}>{metrics.marketAppeal}%</span>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-amber-700/80 flex items-center gap-1.5'><span>⚖</span> Total Mass</span>
          <span className='font-mono font-bold text-amber-900'>{metrics.weight} kg</span>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-amber-700/80 flex items-center gap-1.5'><span>$</span> Production Cost</span>
          <span className='font-mono font-bold text-emerald-600'>${'$'}{metrics.cost.toLocaleString()}</span>
        </div>
      </div>
      <button className='w-full py-2.5 px-3 rounded-xl bg-amber-100/60 hover:bg-amber-200/60 text-amber-800 hover:text-amber-950 border border-amber-300/40 hover:border-amber-400/60 text-[13px] font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2' onClick={() => setCompareModalOpen(true)}>
        <span>⇌</span><span>Compare Interiors</span>
      </button>
      <InteriorCompareModal isOpen={compareModalOpen} onClose={() => setCompareModalOpen(false)} />
    </div>
  );
};
