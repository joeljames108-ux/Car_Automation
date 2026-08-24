import React from "react";
import { NeonEntrance } from "./useNeonEntrance";
import { Cpu, Activity } from "lucide-react";

export function NeonStageLoadingSkeleton({ stageName }: { stageName?: string }) {
  return (
    <NeonEntrance type="glitch" className="w-full h-full min-h-[520px] rounded-2xl bg-[#0a1628]/60 border border-sky-400/15 backdrop-blur-xl p-8 flex flex-col justify-between relative overflow-hidden" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.37) }}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-400/[0.04] to-transparent pointer-events-none animate-pulse" />
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-400/10 border border-sky-400/25 flex items-center justify-center text-sky-400" style={{ }}>
            <Cpu size={20} className="animate-spin" style={{ animationDuration: "3s" }} />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-sky-300 tracking-wider flex items-center gap-2">
              <span>INITIALIZING SUBSYSTEM</span>
              <span className="w-2 h-2 rounded-full bg-sky-300 animate-ping" />
            </div>
            <div className="text-[11px] text-slate-400 font-mono">{stageName ? "Loading [" + stageName.toUpperCase() + "]" : "Streaming CAD..."}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500 bg-[#0c1626]/80 px-3 py-1.5 rounded-lg border border-white/[0.06]">
          <Activity size={12} className="text-sky-400 animate-pulse" /><span>120Hz STREAM</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
        {["#38bdf8", "#a855f7", "#3b82f6"].map((color, idx) => (
          <div key={idx} className="h-48 rounded-xl bg-[#0c1626]/70 border border-white/[0.05] p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="h-4 w-32 bg-white/[0.08] rounded animate-pulse" />
            <div className="space-y-2"><div className="h-2 w-full bg-white/[0.05] rounded animate-pulse" /><div className="h-2 w-4/5 bg-white/[0.05] rounded animate-pulse" /><div className="h-2 w-3/5 rounded animate-pulse" style={{ backgroundColor: color + "20" }} /></div>
            <div className="h-8 w-full rounded border animate-pulse" style={{ backgroundColor: color + "10", borderColor: color + "20" }} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/[0.08] pt-4">
        <span>MEM: OK · SHADERS: COMPILING</span>
        <div className="w-48 h-1.5 bg-[#0c1626] rounded-full overflow-hidden border border-white/[0.08]">
          <div className="h-full bg-gradient-to-r from-sky-400 via-sky-400 to-sky-500 w-2/3 rounded-full animate-pulse" />
        </div>
      </div>
    </NeonEntrance>
  );
}