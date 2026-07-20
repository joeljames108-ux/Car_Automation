interface RadarAxis { label: string; value: number }

export function RadarChart({ axes, max = 10, size = 220 }: { axes: RadarAxis[]; max?: number; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 36;
  const n = axes.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, val: number) => {
    const rad = (val / max) * r;
    return [cx + Math.cos(angle(i)) * rad, cy + Math.sin(angle(i)) * rad] as const;
  };
  const ringVals = [0.25, 0.5, 0.75, 1];

  const polyPath = axes
    .map((a, i) => { const [x, y] = point(i, a.value); return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`; })
    .join(" ") + " Z";

  return (
    <svg width={size} height={size} className="overflow-visible">
      <defs>
        <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.12" />
        </radialGradient>
      </defs>
      {ringVals.map((rv) => (
        <polygon
          key={rv}
          points={axes.map((_, i) => { const [x, y] = point(i, max * rv); return `${x.toFixed(1)},${y.toFixed(1)}`; }).join(" ")}
          fill="none"
          stroke="#1e2839"
          strokeWidth="1"
        />
      ))}
      {axes.map((_, i) => {
        const [x, y] = point(i, max);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#1e2839" strokeWidth="1" />;
      })}
      <path d={polyPath} fill="url(#radarFill)" stroke="#22d3ee" strokeWidth="2" strokeLinejoin="round" />
      {axes.map((a, i) => {
        const [x, y] = point(i, a.value);
        return <circle key={i} cx={x} cy={y} r="3" fill="#67e8f9" stroke="#0b0f17" strokeWidth="1.5" />;
      })}
      {axes.map((a, i) => {
        const [x, y] = point(i, max * 1.18);
        return (
          <text
            key={i}
            x={x} y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-slate-400"
            style={{ fontSize: 9, fontFamily: "JetBrains Mono, monospace" }}
          >
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}

export function RadialGauge({ value, max = 10, label, size = 140 }: { value: number; max?: number; label?: string; size?: number }) {
  const r = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  const color = pct >= 0.85 ? "#22c55e" : pct >= 0.7 ? "#22d3ee" : pct >= 0.55 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#141b29" strokeWidth="8" />
        <circle
          cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct * 0.75)}
          style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.22,1,0.36,1), stroke 0.3s", filter: `drop-shadow(0 0 4px ${color}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-bold text-slate-100 transition-colors duration-300" style={{ fontSize: size * 0.22, color }}>{value.toFixed(1)}</span>
        {label && <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono mt-0.5">{label}</span>}
      </div>
    </div>
  );
}

export function BarCompare({ rows, labels, highlight }: {
  rows: { category: string; yours: number; competitors: number[] }[];
  labels: string[];
  highlight: number;
}) {
  const max = 10;
  const colors = ["#22d3ee", "#64748b", "#475569"];
  return (
    <div className="space-y-2.5">
      {rows.map((r) => {
        const all = [r.yours, ...r.competitors];
        const best = Math.max(...all);
        return (
          <div key={r.category}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">{r.category}</span>
            </div>
            <div className="space-y-1">
              {all.map((val, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 w-20 shrink-0 truncate">{labels[i]}</span>
                  <div className="flex-1 h-3 bg-base-850 rounded relative overflow-hidden">
                    <div
                      className="h-full rounded transition-all duration-500"
                      style={{ width: `${(val / max) * 100}%`, background: i === highlight ? "#22d3ee" : colors[i], opacity: val === best ? 1 : 0.6 }}
                    />
                  </div>
                  <span className={`text-[10px] font-mono w-8 text-right ${val === best ? "text-ok-300" : "text-slate-400"}`}>{val.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Podium({ winners }: { winners: { name: string; score: number; you: boolean }[] }) {
  const sorted = [...winners].sort((a, b) => b.score - a.score);
  const order = [sorted[1], sorted[0], sorted[2]].filter(Boolean);
  const heights = [60, 84, 44];
  const medals = ["#94a3b8", "#fbbf24", "#a16207"];
  return (
    <div className="flex items-end justify-center gap-2 h-28">
      {order.map((w, i) => {
        const realIdx = sorted.indexOf(w);
        return (
          <div key={i} className="flex flex-col items-center" style={{ width: 90 }}>
            <div className={`text-xs font-medium mb-1 ${w.you ? "text-accent-300" : "text-slate-400"}`}>{w.name}</div>
            <div className="font-mono text-sm font-bold mb-1" style={{ color: medals[realIdx] }}>{w.score.toFixed(1)}</div>
            <div
              className={`w-full rounded-t-md border-t-2 ${w.you ? "border-accent-400 bg-accent-500/20" : "border-base-600 bg-base-800"}`}
              style={{ height: heights[i] }}
            />
            <div className="text-[10px] font-mono mt-0.5" style={{ color: medals[realIdx] }}>{realIdx === 0 ? "1st" : realIdx === 1 ? "2nd" : "3rd"}</div>
          </div>
        );
      })}
    </div>
  );
}

export function Sparkline({ values, width = 120, height = 32, color = "#22d3ee" }: { values: number[]; width?: number; height?: number; color?: string }) {
  if (values.length < 2) return <svg width={width} height={height} />;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const pts = values.map((v, i) => `${(i * step).toFixed(1)},${(height - ((v - min) / range) * height).toFixed(1)}`);
  const path = "M" + pts.join(" L");
  const area = path + ` L${width},${height} L0,${height} Z`;
  const id = `spark-${color.replace("#", "")}`;
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} className="animate-fade-in" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 2px ${color}88)` }} />
      <circle cx={width} cy={height - ((values[values.length - 1] - min) / range) * height} r="3" fill={color} className="animate-pulse" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
    </svg>
  );
}

export function HorseshoeGauge({ value, max = 10, size = 180 }: { value: number; max?: number; size?: number }) {
  const r = size / 2 - 14;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = 150;
  const endAngle = 30;
  const pct = Math.max(0, Math.min(1, value / max));
  const sweep = (360 - (startAngle - endAngle)) % 360;
  const arc = (from: number, to: number) => {
    const a1 = (from * Math.PI) / 180;
    const a2 = (to * Math.PI) / 180;
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy + r * Math.sin(a2);
    const large = Math.abs(a2 - a1) > Math.PI ? 1 : 0;
    return `M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large} 1 ${x2.toFixed(1)},${y2.toFixed(1)}`;
  };
  const color = pct >= 0.85 ? "#22c55e" : pct >= 0.7 ? "#22d3ee" : pct >= 0.55 ? "#f59e0b" : "#ef4444";
  const valEnd = startAngle + (pct * sweep);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <path d={arc(startAngle, endAngle)} fill="none" stroke="#141b29" strokeWidth="10" strokeLinecap="round" />
        <path d={arc(startAngle, valEnd)} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" style={{ transition: "all 0.6s cubic-bezier(0.22,1,0.36,1)", filter: `drop-shadow(0 0 6px ${color}55)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-bold text-slate-100 transition-colors duration-300" style={{ fontSize: size * 0.2, color }}>{value.toFixed(1)}</span>
        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">/ {max}</span>
      </div>
    </div>
  );
}
