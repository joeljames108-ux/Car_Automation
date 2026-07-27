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

export function DonutChart({ segments, size = 140, totalLabel = "TOTAL" }: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  totalLabel?: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 16;
  const circ = 2 * Math.PI * r;

  let currentOffset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#141b29" strokeWidth="12" />
          {segments.map((s, i) => {
            const pct = s.value / total;
            const strokeDasharray = `${circ * pct} ${circ * (1 - pct)}`;
            const strokeDashoffset = -currentOffset;
            currentOffset += circ * pct;
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="12"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700"
                style={{ filter: `drop-shadow(0 0 3px ${s.color}66)` }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono font-bold text-slate-100 text-base">{total.toLocaleString()}</span>
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">{totalLabel}</span>
        </div>
      </div>

      <div className="space-y-1.5 flex-1 w-full">
        {segments.map((s, i) => {
          const pct = Math.round((s.value / total) * 100);
          return (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-slate-300 text-xs font-medium">{s.label}</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-400 text-xs font-bold">{s.value.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 w-8 text-right">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CircuitDiagram({ trackName, country, lengthKm, turns }: {
  trackName: string;
  country: string;
  lengthKm: number;
  turns: number;
}) {
  return (
    <div className="bg-base-950/60 p-4 rounded-xl border border-white/10 relative overflow-hidden flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">CIRCUIT TELEMETRY LAYOUT</span>
          <h4 className="text-sm font-bold text-slate-100">{trackName}</h4>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-slate-300">{lengthKm} km</span>
          <div className="text-[10px] text-slate-500 font-mono">{turns} Turn Apexes · {country}</div>
        </div>
      </div>

      <div className="h-32 w-full relative flex items-center justify-center">
        <svg viewBox="0 0 400 160" className="w-full h-full">
          <defs>
            <linearGradient id="circuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          {/* Track shadow / background glow */}
          <path
            d="M 60,110 C 20,110 30,30 90,30 C 150,30 180,70 240,60 C 300,50 340,20 370,50 C 400,80 370,140 310,130 C 250,120 200,140 140,130 Z"
            fill="none"
            stroke="url(#circuitGrad)"
            strokeWidth="12"
            strokeOpacity="0.15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Main Track Outline */}
          <path
            d="M 60,110 C 20,110 30,30 90,30 C 150,30 180,70 240,60 C 300,50 340,20 370,50 C 400,80 370,140 310,130 C 250,120 200,140 140,130 Z"
            fill="none"
            stroke="url(#circuitGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* DRS Zone 1 */}
          <path
            d="M 60,110 L 140,130"
            fill="none"
            stroke="#22c55e"
            strokeWidth="4"
            strokeDasharray="4 2"
          />

          {/* Start / Finish line */}
          <line x1="60" y1="100" x2="60" y2="120" stroke="#ffffff" strokeWidth="3" strokeDasharray="3 3" />

          {/* Sector dots */}
          <circle cx="90" cy="30" r="4" fill="#38bdf8" />
          <circle cx="240" cy="60" r="4" fill="#a855f7" />
          <circle cx="370" cy="50" r="4" fill="#f59e0b" />
          <circle cx="310" cy="130" r="4" fill="#22c55e" />

          {/* Labels */}
          <text x="60" y="135" fill="#22c55e" fontSize="9" fontFamily="monospace" fontWeight="bold">DRS MAIN STRAIGHT</text>
          <text x="90" y="20" fill="#38bdf8" fontSize="8" fontFamily="monospace">T1 Hairpin</text>
          <text x="240" y="48" fill="#a855f7" fontSize="8" fontFamily="monospace">T4 Chicane</text>
          <text x="370" y="38" fill="#f59e0b" fontSize="8" fontFamily="monospace">T7 High-Speed Apex</text>
        </svg>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-white/5">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> DRS Activation Zone</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> High Downforce Apex</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" /> Heavy Braking Point</span>
      </div>
    </div>
  );
}

export function TelemetryGraph({ telemetryPoints }: {
  telemetryPoints: { distancePercent: number; speedKmh: number; gear: number; throttlePct: number; brakePct: number }[];
}) {
  const W = 400;
  const H = 140;
  const maxSpeed = 360;

  const speedLine = telemetryPoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${(p.distancePercent * 4).toFixed(1)},${(H - (p.speedKmh / maxSpeed) * H).toFixed(1)}`)
    .join(" ");

  const throttleLine = telemetryPoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${(p.distancePercent * 4).toFixed(1)},${(H - (p.throttlePct / 100) * (H * 0.4) - 5).toFixed(1)}`)
    .join(" ");

  const brakeLine = telemetryPoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${(p.distancePercent * 4).toFixed(1)},${(H - (p.brakePct / 100) * (H * 0.4) - 5).toFixed(1)}`)
    .join(" ");

  return (
    <div className="bg-base-950/60 p-4 rounded-xl border border-white/10 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">REAL-TIME LAP TELEMETRY SPEEDS</span>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="text-cyan-400 font-bold">Speed (km/h)</span>
          <span className="text-emerald-400">Throttle (%)</span>
          <span className="text-red-400">Brake (%)</span>
        </div>
      </div>

      <div className="h-32 w-full relative">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
          {/* Grid lines */}
          <line x1="0" y1="35" x2={W} y2="35" stroke="#1e2839" strokeWidth="0.5" />
          <line x1="0" y1="70" x2={W} y2="70" stroke="#1e2839" strokeWidth="0.5" />
          <line x1="0" y1="105" x2={W} y2="105" stroke="#1e2839" strokeWidth="0.5" />

          {/* Speed trace */}
          <path d={speedLine} fill="none" stroke="#22d3ee" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />

          {/* Throttle trace */}
          <path d={throttleLine} fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.8" vectorEffect="non-scaling-stroke" />

          {/* Brake trace */}
          <path d={brakeLine} fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.8" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </div>
  );
}

export function SectorTimesBarChart({ s1, s2, s3, bestS1 = 24.1, bestS2 = 32.4, bestS3 = 21.8 }: {
  s1: number;
  s2: number;
  s3: number;
  bestS1?: number;
  bestS2?: number;
  bestS3?: number;
}) {
  const total = (s1 + s2 + s3).toFixed(3);
  const getSectorColor = (val: number, best: number) => {
    if (val <= best) return { bg: "bg-purple-500/20", border: "border-purple-500/40", text: "text-purple-300", badge: "PURPLE (SESSION BEST)" };
    if (val <= best * 1.02) return { bg: "bg-emerald-500/20", border: "border-emerald-500/40", text: "text-emerald-300", badge: "GREEN (PERSONAL BEST)" };
    return { bg: "bg-amber-500/20", border: "border-amber-500/40", text: "text-amber-300", badge: "YELLOW" };
  };

  const c1 = getSectorColor(s1, bestS1);
  const c2 = getSectorColor(s2, bestS2);
  const c3 = getSectorColor(s3, bestS3);

  return (
    <div className="bg-base-950/60 p-4 rounded-xl border border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">SECTOR TIME ANALYSIS (S1 / S2 / S3)</span>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 font-mono">TOTAL LAP TIME</span>
          <div className="font-mono text-base font-black text-cyan-300">{total}s</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className={`p-2.5 rounded-lg border ${c1.bg} ${c1.border} space-y-1`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400">SECTOR 1</span>
            <span className={`text-[8px] font-mono px-1 rounded ${c1.text}`}>{c1.badge}</span>
          </div>
          <div className={`font-mono text-lg font-bold ${c1.text}`}>{s1.toFixed(3)}s</div>
          <div className="w-full bg-base-900 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-purple-400 rounded-full" style={{ width: `${(bestS1 / s1) * 100}%` }} />
          </div>
        </div>

        <div className={`p-2.5 rounded-lg border ${c2.bg} ${c2.border} space-y-1`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400">SECTOR 2</span>
            <span className={`text-[8px] font-mono px-1 rounded ${c2.text}`}>{c2.badge}</span>
          </div>
          <div className={`font-mono text-lg font-bold ${c2.text}`}>{s2.toFixed(3)}s</div>
          <div className="w-full bg-base-900 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(bestS2 / s2) * 100}%` }} />
          </div>
        </div>

        <div className={`p-2.5 rounded-lg border ${c3.bg} ${c3.border} space-y-1`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400">SECTOR 3</span>
            <span className={`text-[8px] font-mono px-1 rounded ${c3.text}`}>{c3.badge}</span>
          </div>
          <div className={`font-mono text-lg font-bold ${c3.text}`}>{s3.toFixed(3)}s</div>
          <div className="w-full bg-base-900 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(bestS3 / s3) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CarSilhouetteDiagram({ powerHp, downforceKg, weightKg, aeroBalancePct = 52 }: {
  powerHp: number;
  downforceKg: number;
  weightKg: number;
  aeroBalancePct?: number;
}) {
  return (
    <div className="bg-base-950/60 p-4 rounded-xl border border-white/10 space-y-3 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">AERODYNAMIC SILHOUETTE DIAGRAM</span>
          <h4 className="text-xs font-bold text-slate-200">High-Velocity Pressure Vector Map</h4>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <span>Power: <strong className="text-amber-400">{powerHp}hp</strong></span>
          <span>Downforce: <strong className="text-cyan-300">{downforceKg}kg</strong></span>
          <span>Weight: <strong className="text-slate-200">{weightKg}kg</strong></span>
        </div>
      </div>

      <div className="h-28 w-full relative flex items-center justify-center">
        <svg viewBox="0 0 360 110" className="w-full h-full">
          <defs>
            <linearGradient id="aeroFlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Airflow vector lines */}
          <path d="M 10,25 Q 90,15 150,30 T 290,20 T 350,15" fill="none" stroke="url(#aeroFlowGrad)" strokeWidth="2" strokeDasharray="6 3" />
          <path d="M 10,40 Q 90,30 160,50 T 300,35 T 350,30" fill="none" stroke="url(#aeroFlowGrad)" strokeWidth="1.5" strokeDasharray="8 4" />
          <path d="M 10,85 L 350,85" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="5 2" />

          {/* Car Side Silhouette Contour */}
          <path
            d="M 40,80 L 70,80 L 100,70 L 140,65 L 170,45 L 230,45 L 270,60 L 310,65 L 325,40 L 330,80 Z"
            fill="rgba(34,211,238,0.08)"
            stroke="#22d3ee"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Wheels */}
          <circle cx="85" cy="80" r="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
          <circle cx="280" cy="80" r="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />

          {/* Downforce Force Vectors (Arrows) */}
          {/* Front Wing Vector */}
          <line x1="60" y1="20" x2="60" y2="60" stroke="#06b6d4" strokeWidth="2.5" />
          <polygon points="56,58 60,67 64,58" fill="#06b6d4" />
          <text x="45" y="15" fill="#06b6d4" fontSize="8" fontFamily="monospace">FRONT DOWNFORCE ({aeroBalancePct}%)</text>

          {/* Rear Wing Vector */}
          <line x1="320" y1="10" x2="320" y2="40" stroke="#a855f7" strokeWidth="2.5" />
          <polygon points="316,38 320,47 324,38" fill="#a855f7" />
          <text x="270" y="10" fill="#a855f7" fontSize="8" fontFamily="monospace">REAR WING ({100 - aeroBalancePct}%)</text>

          {/* Ground Effect Diffuser Vector */}
          <text x="140" y="100" fill="#22c55e" fontSize="8" fontFamily="monospace">GROUND EFFECT VENTURI TUNNELS</text>
        </svg>
      </div>
    </div>
  );
}
