import React from "react";


export function NeonCircuitDiagram({ trackName, country, lengthKm, turns }: { trackName: string; country: string; lengthKm: number; turns: number }) {
  return (
    <div className="panel p-4 rounded-2xl space-y-3">
      <div className="flex items-center justify-between">
        <div><span className="text-[9px] font-mono text-sky-400/80 uppercase tracking-widest font-bold">Circuit Telemetry</span><h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{trackName}</h4></div>
        <div className="text-right"><span className="text-xs font-mono text-slate-700 dark:text-slate-300">{lengthKm} km</span><div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{turns} Turns</div></div>
      </div>
      <div className="h-32 w-full flex items-center justify-center"><svg viewBox="0 0 400 160" className="w-full h-full">
        <defs><linearGradient id="nCG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#8fb9d9" /><stop offset="50%" stopColor="#6e8cb5" /><stop offset="100%" stopColor="#9d8fc4" /></linearGradient></defs>
        <path d="M 60,110 C 20,110 30,30 90,30 C 150,30 180,70 240,60 C 300,50 340,20 370,50 C 400,80 370,140 310,130 C 250,120 200,140 140,130 Z" fill="none" stroke="url(#nCG)" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="90" cy="30" r="4" fill="#8fb9d9" /><circle cx="240" cy="60" r="4" fill="#9d8fc4" /><circle cx="370" cy="50" r="4" fill="#c9974f" />
      </svg></div>
    </div>
  );
}

export function NeonTelemetryGraph({ tp }: { tp: { distancePercent: number; speedKmh: number; throttlePct: number; brakePct: number }[] }) {
  const W = 400, H = 140;
  const mk = (fn: (p: any) => number) => tp.map((_, i) => (i === 0 ? "M" : "L") + (tp[i].distancePercent * 4).toFixed(1) + "," + fn(tp[i]).toFixed(1)).join(" ");
  return (
    <div className="panel p-4 rounded-2xl">
      <span className="text-[9px] font-mono text-sky-400/80 uppercase tracking-widest font-bold">Lap Telemetry</span>
      <div className="h-32 mt-2"><svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
        <path d={mk(p => H - (p.speedKmh / 360) * H)} fill="none" stroke="#8fb9d9" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        <path d={mk(p => H - (p.throttlePct / 100) * H * 0.4 - 5)} fill="none" stroke="#57a878" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        <path d={mk(p => H - (p.brakePct / 100) * H * 0.4 - 5)} fill="none" stroke="#c96f6f" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg></div>
    </div>
  );
}