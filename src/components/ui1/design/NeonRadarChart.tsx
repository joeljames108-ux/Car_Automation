import React from "react";

interface RadarAxis { label: string; value: number }

export function NeonRadarChart({ axes, max = 10, size = 220 }: { axes: RadarAxis[]; max?: number; size?: number }) {
  const cx = size / 2; const cy = size / 2; const r = size / 2 - 36; const n = axes.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, val: number) => { const rad = (val / max) * r; return [cx + Math.cos(angle(i)) * rad, cy + Math.sin(angle(i)) * rad] as const; };
  const ringVals = [0.25, 0.5, 0.75, 1];
  const polyPath = axes.map((a, i) => { const [x, y] = point(i, a.value); return (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1); }).join(" ") + " Z";
  return (
    <svg width={size} height={size} className="overflow-visible">
      <defs><radialGradient id="neonRadarFill" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#7fb5d8" stopOpacity="0.22" /><stop offset="100%" stopColor="#48708c" stopOpacity="0.08" /></radialGradient></defs>
      {ringVals.map((rv) => (<polygon key={rv} points={axes.map((_, i) => { const [x, y] = point(i, max * rv); return x.toFixed(1)+","+y.toFixed(1); }).join(" ")} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />))}
      {axes.map((_, i) => { const [x, y] = point(i, max); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />; })}
      <path d={polyPath} fill="url(#neonRadarFill)" stroke="#8fb9d9" strokeWidth="1.5" strokeLinejoin="round" />
      {axes.map((a, i) => { const [x, y] = point(i, a.value); return <circle key={i} cx={x} cy={y} r="3" fill="#a9cde8" stroke="#0c1626" strokeWidth="1.5" />; })}
      {axes.map((a, i) => { const [x, y] = point(i, max * 1.18); return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-slate-400" style={{fontSize:9,fontFamily:"monospace"}}>{a.label}</text>; })}
    </svg>
  );
}
