import React from "react";

import { Map, MapPin, Table, ChevronRight } from "lucide-react";

export interface NeonLapTimeItem { trackId: string; trackName: string; time: number; topSpeed: number; avgSpeed: number }

function fmtLap(t: number) { return Math.floor(t / 60) + ":" + (t % 60).toFixed(3).padStart(6, "0"); }

export function NeonLapTimesPanel({ lapTimes, className = "" }: { lapTimes: NeonLapTimeItem[]; className?: string }) {
  const sorted = [...(lapTimes || [])].sort((a, b) => a.time - b.time);
  const fastest = sorted[0];
  return (
    <div className={"space-y-4 " + className}>
      <div className="rounded-xl bg-[#0e1626]/80 border border-white/[0.08] p-4 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><Map size={14} className="text-sky-400" /><span className="text-[10px] font-mono font-bold uppercase tracking-widest text-sky-400/70">Circuit Comparison</span></div>
          {fastest && <span className="text-[10px] font-mono text-slate-500">Fastest: <span className="text-emerald-400 font-bold">{fastest.trackName}</span></span>}
        </div>
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 nh-scroll">
          {sorted.map((lap, idx) => {
            const ratio = fastest ? fastest.time / lap.time : 1;
            return (
              <div key={lap.trackId} className="flex items-center gap-2 group p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer">
                <span className="w-28 truncate text-[11px] text-slate-300 group-hover:text-sky-300 flex items-center gap-1.5 font-medium">
                  <MapPin size={10} className={idx === 0 ? "text-emerald-400" : "text-sky-400/50"} />{lap.trackName}
                </span>
                <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: Math.min(100, Math.max(10, ratio * 100)) + "%", background: idx === 0 ? "linear-gradient(90deg, #57a878, #8fb9d9)" : "linear-gradient(90deg, #5f8ba3, #8fb9d9)" }} />
                </div>
                <span className="font-mono text-[11px] text-slate-400 w-20 text-right">{fmtLap(lap.time)}</span>
                <ChevronRight size={10} className="text-slate-600 group-hover:text-sky-400 transition-colors" />
              </div>
            );
          })}
        </div>
      </div>
      <div className="rounded-xl bg-[#0e1626]/80 border border-white/[0.08] p-4 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-3"><Table size={14} className="text-sky-400" /><span className="text-[10px] font-mono font-bold uppercase tracking-widest text-sky-400/70">Full Lap Times</span></div>
        <div className="overflow-x-auto"><table className="w-full text-[11px]">
          <thead><tr className="text-slate-500 border-b border-white/[0.06]"><th className="text-left py-2 px-2 font-mono">#</th><th className="text-left py-2 px-2">Track</th><th className="text-right py-2 px-2 font-mono">Time</th><th className="text-right py-2 px-2 font-mono">Delta</th><th className="text-right py-2 px-2 font-mono">Top</th></tr></thead>
          <tbody>
            {sorted.map((lap, idx) => (
              <tr key={lap.trackId} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer">
                <td className="py-2 px-2 font-mono text-slate-600">{idx + 1}</td>
                <td className="py-2 px-2 text-slate-200 font-medium">{lap.trackName}</td>
                <td className="py-2 px-2 font-mono text-right font-bold" style={{ color: idx === 0 ? "#57a878" : "#8fb9d9" }}>{fmtLap(lap.time)}</td>
                <td className="py-2 px-2 font-mono text-right text-slate-500">{idx === 0 ? "--" : "+" + (lap.time - (fastest?.time || 0)).toFixed(2)}</td>
                <td className="py-2 px-2 font-mono text-right text-slate-400">{lap.topSpeed} km/h</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}