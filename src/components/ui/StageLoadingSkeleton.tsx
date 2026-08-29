import React from "react";
import { Cpu, Activity } from "lucide-react";

interface StageLoadingSkeletonProps {
  stageName?: string;
}

export const StageLoadingSkeleton: React.FC<StageLoadingSkeletonProps> = ({ stageName }) => {
  return (
    <div className="w-full h-full min-h-[520px] rounded-2xl bg-base-900/60 border border-amber-500/20 backdrop-blur-xl p-8 flex flex-col justify-between relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
      {/* Background Holographic Sweep Line */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none animate-pulse" />
      
      {/* Top Telemetry Header Skeleton */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center animate-pulse text-amber-400 shadow-[0_0_15px_rgba(34,211,238,0.25)]">
            <Cpu size={20} className="animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-amber-300 tracking-wider flex items-center gap-2">
              <span>INITIALIZING SUBSYSTEM PIPELINE</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {stageName ? `Loading module [${stageName.toUpperCase()}]` : "Streaming CAD & Multi-Physics Solvers..."}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500 bg-base-950/80 px-3 py-1.5 rounded-lg border border-white/5">
          <Activity size={12} className="text-amber-400 animate-pulse" />
          <span>120Hz STREAM</span>
        </div>
      </div>

      {/* Center 3D Wireframe / Card Skeleton Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
        <div className="h-48 rounded-xl bg-base-950/70 border border-white/5 p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-2 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-2 w-4/5 bg-white/5 rounded animate-pulse" />
            <div className="h-2 w-3/5 bg-amber-500/20 rounded animate-pulse" />
          </div>
          <div className="h-8 w-full bg-amber-500/10 rounded border border-amber-500/20 animate-pulse" />
        </div>

        <div className="h-48 rounded-xl bg-base-950/70 border border-white/5 p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-2 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-2 w-5/6 bg-white/5 rounded animate-pulse" />
            <div className="h-2 w-2/3 bg-amber-500/20 rounded animate-pulse" />
          </div>
          <div className="h-8 w-full bg-amber-500/10 rounded border border-amber-500/20 animate-pulse" />
        </div>

        <div className="h-48 rounded-xl bg-base-950/70 border border-white/5 p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="h-4 w-36 bg-white/10 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-2 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-2 w-3/4 bg-white/5 rounded animate-pulse" />
            <div className="h-2 w-1/2 bg-sky-500/20 rounded animate-pulse" />
          </div>
          <div className="h-8 w-full bg-sky-500/10 rounded border border-sky-500/20 animate-pulse" />
        </div>
      </div>

      {/* Bottom Progress Bar Skeleton */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/10 pt-4">
        <span>MEM: OK · SHADERS: COMPILING</span>
        <div className="w-48 h-1.5 bg-base-950 rounded-full overflow-hidden border border-white/10">
          <div className="h-full bg-gradient-to-r from-amber-400 via-sky-400 to-amber-500 w-2/3 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};
