// ============================================================================
// ENGINE 3D STAGED LOADING HUD — PROGRESSIVE INITIALIZATION BAR
// ============================================================================
// Sleek, futuristic loading progress HUD displayed during progressive load.
// Fades out gracefully once 100% of the mechanical hierarchy is mounted.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { EngineStagedLoader, EngineStagedLoadProgress } from '../managers/EngineStagedLoader';

export const EngineStagedLoadingHUD: React.FC = () => {
  const [progress, setProgress] = useState<EngineStagedLoadProgress>(() =>
    EngineStagedLoader.getInstance().getProgress()
  );
  const [visible, setVisible] = useState(false);

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
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-950/85 border border-amber-500/40 backdrop-blur-2xl shadow-[0_0_25px_rgba(6,182,212,0.3)] select-none transition-all duration-300 pointer-events-none">
      <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300">
        <Sparkles size={13} className="text-amber-400 animate-spin" />
        <span className="tracking-wider uppercase">ENGINE INITIALIZATION:</span>
        <span className="text-white font-extrabold">{progress.stageName}</span>
        <span className="text-amber-400 ml-1">({progress.percentage}%)</span>
      </div>

      <div className="w-48 h-1.5 bg-amber-900/60 rounded-full overflow-hidden border border-amber-500/30">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-indigo-400 transition-all duration-150 ease-out"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {progress.activeItem && (
        <span className="text-[9.5px] font-mono text-amber-200/60 truncate max-w-[200px]">
          Mounting: {progress.activeItem}
        </span>
      )}
    </div>
  );
};
