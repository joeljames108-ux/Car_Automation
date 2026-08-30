import React, { useMemo } from "react";
import { AnimatedCounter } from "../../ui/AnimatedCounter";

// ═══ Neon Horizon Donut Chart ═══
export function NeonDonutChart({ segments, size = 140, totalLabel = "TOTAL" }: {
  segments: { label: string; value: number; color: string }[]; size?: number; totalLabel?: string;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const cx = size / 2; const cy = size / 2; const r = size / 2 - 16;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
          {segments.map((s, i) => { const pct = s.value / total; const dash = circ * pct; const doff = -offset; offset += dash;
            return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="12"
              strokeDasharray={dash + " " + circ * (1 - pct)} strokeDashoffset={doff}
              className="transition-all duration-700" />;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono font-bold text-amber-50 text-base"><AnimatedCounter value={total} /></span>
          <span className="text-[9px] uppercase tracking-wider text-amber-300/50 font-mono">{totalLabel}</span>
        </div>
      </div>
      <div className="space-y-1.5 flex-1 w-full">
        {segments.map((s, i) => { const pct = Math.round((s.value / total) * 100);
          return (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{backgroundColor:s.color}} /><span className="text-amber-100/80 text-xs font-medium">{s.label}</span></div>
              <div className="flex items-center gap-2 font-mono"><span className="text-amber-200/60 text-xs font-bold">{s.value.toLocaleString()}</span><span className="text-[10px] text-amber-300/50 w-8 text-right">{pct}%</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══ Neon Horizon Horseshoe Gauge ═══
export function NeonHorseshoeGauge({ value, max = 10, size = 180 }: { value: number; max?: number; size?: number }) {
  const r = size / 2 - 14; const cx = size / 2; const cy = size / 2;
  const startAngle = 150; const endAngle = 30;
  const pct = Math.max(0, Math.min(1, value / max));
  const sweep = (360 - (startAngle - endAngle)) % 360;
  const arc = (from: number, to: number) => {
    const a1 = (from * Math.PI) / 180; const a2 = (to * Math.PI) / 180;
    const x1 = cx + r * Math.cos(a1); const y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2); const y2 = cy + r * Math.sin(a2);
    const large = Math.abs(a2 - a1) > Math.PI ? 1 : 0;
    return "M" + x1.toFixed(1) + "," + y1.toFixed(1) + " A" + r + "," + r + " 0 " + large + " 1 " + x2.toFixed(1) + "," + y2.toFixed(1);
  };
  const color = pct >= 0.85 ? "#57a878" : pct >= 0.7 ? "#8fb9d9" : pct >= 0.55 ? "#c9974f" : "#c96f6f";
  const valEnd = startAngle + (pct * sweep);
  return (
    <div className="relative inline-flex items-center justify-center" style={{width:size,height:size}}>
      <svg width={size} height={size}>
        <path d={arc(startAngle, endAngle)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round" />
        <path d={arc(startAngle, valEnd)} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          style={{transition:"all 0.6s cubic-bezier(0.22,1,0.36,1)"}} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-bold text-amber-50" style={{fontSize:size*0.2,color}}>{value.toFixed(1)}</span>
        <span className="text-[9px] uppercase tracking-wider text-amber-300/50 font-mono">/ {max}</span>
      </div>
    </div>
  );
}

