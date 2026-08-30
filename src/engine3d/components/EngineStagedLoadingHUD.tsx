// ============================================================================
// ENGINE 3D STAGED LOADING HUD — PROGRESSIVE INITIALIZATION BAR
// ============================================================================
// Sleek, futuristic loading progress HUD displayed during progressive load.
// Fades out gracefully once 100% of the mechanical hierarchy is mounted.
// ============================================================================

import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { EngineStagedLoader, EngineStagedLoadProgress } from '../managers/EngineStagedLoader';

export const EngineStagedLoadingHUD: React.FC = () => {
  const [progress, setProgress] = useState<EngineStagedLoadProgress>(() =>
    EngineStagedLoader.getInstance().getProgress()
  );
  const [visible, setVisible] = useState(false);
  const [displayPercent, setDisplayPercent] = useState(0);
  const animRef = useRef<number>(0);

  // Animated counter
  useEffect(() => {
    const target = progress.percentage;
    const animate = () => {
      setDisplayPercent((prev) => {
        const diff = target - prev;
        if (Math.abs(diff) < 0.5) return target;
        return prev + diff * 0.15;
      });
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [progress.percentage]);

  useEffect(() => {
    const unsub = EngineStagedLoader.getInstance().subscribe((p) => {
      setProgress(p);
      if (!p.isComplete) {
        setVisible(true);
      } else {
        const timeout = setTimeout(() => setVisible(false), 600);
        return () => clearTimeout(timeout);
      }
    });
    return () => unsub();
  }, []);

  if (!visible && progress.isComplete) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 px-5 py-3 rounded-2xl bg-amber-950/85 border border-amber-500/30 backdrop-blur-2xl shadow-[0_0_30px_rgba(245,158,11,0.15)] select-none transition-all duration-300 pointer-events-none w-96">
      <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300">
        <Sparkles size={13} className="text-amber-400 animate-spin" />
        <span className="tracking-wider uppercase">ENGINE INITIALIZATION:</span>
        <span className="text-white font-extrabold">{progress.stageName}</span>
        <span className="text-amber-400 ml-1">({Math.round(displayPercent)}%)</span>
      </div>

      <div className="w-48 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-amber-500/30">
        <div
          className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 transition-all duration-150 ease-out relative overflow-hidden" style={{ boxShadow: '0 0 10px rgba(245,158,11,0.3)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{ animation: 'shimmer 1.5s infinite' }} />
        </div
          style={{ width: `${displayPercent}%` }}
        />
      </div>

      {progress.activeItem && (
        <span className="text-[9.5px] font-mono text-amber-300/50 truncate max-w-[200px]">
          Mounting: {progress.activeItem}
        </span>
      )}
    </div>
  );
};
