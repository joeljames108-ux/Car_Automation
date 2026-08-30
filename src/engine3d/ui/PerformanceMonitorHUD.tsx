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
        className="absolute top-3 left-3 z-50 px-2 py-1 bg-amber-900/40 hover:bg-amber-800/40 text-amber-100/80 rounded-lg text-[10px] font-mono border border-amber-700/30/80 shadow-lg cursor-pointer flex items-center gap-1"
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
    <div className="absolute top-3 left-3 z-50 bg-amber-950/85 backdrop-blur-md border border-amber-800/30 rounded-xl p-2.5 shadow-2xl text-amber-50 text-xs font-mono select-none w-56 space-y-2 pointer-events-auto">
      <div className="flex items-center justify-between border-b border-amber-800/30 pb-1.5">
        <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-400">
          <Activity size={13} />
          <span>ENGINE 3D TELEMETRY</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-amber-200/60 hover:text-amber-50 text-[10px] px-1 cursor-pointer"
        >
          [hide]
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
        <div className="bg-amber-900/40 p-1.5 rounded-lg border border-amber-800/30">
          <div className="text-[9px] text-amber-200/60 font-semibold uppercase">Frame Rate</div>
          <div className={`text-sm font-bold ${fpsColor}`}>
            {metrics.fps} <span className="text-[10px] font-normal text-amber-200/60">FPS</span>
          </div>
        </div>

        <div className="bg-amber-900/40 p-1.5 rounded-lg border border-amber-800/30">
          <div className="text-[9px] text-amber-200/60 font-semibold uppercase">Frame Time</div>
          <div className="text-sm font-bold text-amber-50">
            {metrics.frameTimeMs} <span className="text-[10px] font-normal text-amber-200/60">ms</span>
          </div>
        </div>

        <div className="bg-amber-900/40 p-1.5 rounded-lg border border-amber-800/30">
          <div className="text-[9px] text-amber-200/60 font-semibold uppercase">Draw Calls</div>
          <div className={`text-sm font-bold ${drawCallColor}`}>{metrics.drawCalls}</div>
        </div>

        <div className="bg-amber-900/40 p-1.5 rounded-lg border border-amber-800/30">
          <div className="text-[9px] text-amber-200/60 font-semibold uppercase">Triangles</div>
          <div className="text-sm font-bold text-amber-50">
            {metrics.triangles > 1000 ? `${(metrics.triangles / 1000).toFixed(1)}k` : metrics.triangles}
          </div>
        </div>
      </div>

      <div className="space-y-1 text-[10px] pt-0.5 border-t border-amber-800/40 text-amber-200/60">
        <div className="flex justify-between items-center">
          <span>Geometries / Textures:</span>
          <span className="text-amber-50 font-semibold">
            {metrics.geometries} / {metrics.textures}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>CPU Execution Time:</span>
          <span className="text-amber-50 font-semibold">{metrics.cpuTimeMs} ms</span>
        </div>
        <div className="flex justify-between items-center">
          <span>React Re-renders:</span>
          <span className="text-amber-50 font-semibold">{metrics.reactRenderCount}</span>
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
