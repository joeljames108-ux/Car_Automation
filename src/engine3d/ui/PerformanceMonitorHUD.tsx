// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — PERFORMANCE TELEMETRY HUD OVERLAY
// ============================================================================
// Floating development HUD component monitoring WebGL render metrics, FPS,
// draw calls, triangle counts, GPU memory, and React render counts.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { globalPerformanceManager, PerformanceMetrics } from '../core/PerformanceManager';
import { Activity, Cpu, Layers, HardDrive, ShieldAlert, Zap } from 'lucide-react';

export const PerformanceMonitorHUD: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(() => globalPerformanceManager.getMetrics());
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = globalPerformanceManager.subscribe((newMetrics) => {
      setMetrics(newMetrics);
    });
    return () => unsubscribe();
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="absolute top-3 left-3 z-50 px-2 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-300 rounded-lg text-[10px] font-mono border border-slate-700/80 shadow-lg cursor-pointer flex items-center gap-1"
        title="Show Performance Telemetry Monitor"
      >
        <Activity size={12} className="text-amber-400" />
        <span>PERF</span>
      </button>
    );
  }

  const fpsColor =
    metrics.fps >= 55 ? 'text-emerald-400' : metrics.fps >= 30 ? 'text-amber-400' : 'text-rose-400';

  const drawCallColor =
    metrics.drawCalls < 30 ? 'text-emerald-400' : metrics.drawCalls < 80 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="absolute top-3 left-3 z-50 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 shadow-2xl text-slate-200 text-xs font-mono select-none w-56 space-y-2 pointer-events-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
        <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-400">
          <Activity size={13} />
          <span>ENGINE 3D TELEMETRY</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-slate-200 text-[10px] px-1 cursor-pointer"
        >
          [hide]
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
        <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800/60">
          <div className="text-[9px] text-slate-400 font-semibold uppercase">Frame Rate</div>
          <div className={`text-sm font-bold ${fpsColor}`}>
            {metrics.fps} <span className="text-[10px] font-normal text-slate-400">FPS</span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800/60">
          <div className="text-[9px] text-slate-400 font-semibold uppercase">Frame Time</div>
          <div className="text-sm font-bold text-slate-200">
            {metrics.frameTimeMs} <span className="text-[10px] font-normal text-slate-400">ms</span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800/60">
          <div className="text-[9px] text-slate-400 font-semibold uppercase">Draw Calls</div>
          <div className={`text-sm font-bold ${drawCallColor}`}>{metrics.drawCalls}</div>
        </div>

        <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800/60">
          <div className="text-[9px] text-slate-400 font-semibold uppercase">Triangles</div>
          <div className="text-sm font-bold text-slate-200">
            {metrics.triangles > 1000 ? `${(metrics.triangles / 1000).toFixed(1)}k` : metrics.triangles}
          </div>
        </div>
      </div>

      <div className="space-y-1 text-[10px] pt-0.5 border-t border-slate-800/80 text-slate-400">
        <div className="flex justify-between items-center">
          <span>Geometries / Textures:</span>
          <span className="text-slate-200 font-semibold">
            {metrics.geometries} / {metrics.textures}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>CPU Execution Time:</span>
          <span className="text-slate-200 font-semibold">{metrics.cpuTimeMs} ms</span>
        </div>
        <div className="flex justify-between items-center">
          <span>React Re-renders:</span>
          <span className="text-slate-200 font-semibold">{metrics.reactRenderCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Render Mode:</span>
          <span className={`font-semibold ${metrics.isIdle ? 'text-amber-400' : 'text-emerald-400'}`}>
            {metrics.isIdle ? 'IDLE (SLEEP)' : 'ACTIVE (60FPS)'}
          </span>
        </div>
      </div>
    </div>
  );
};
