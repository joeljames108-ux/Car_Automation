// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — STAGED INITIALIZATION PROGRESS HUD
// ============================================================================
// Non-blocking, glassmorphic floating progress indicator showing staged asset
// streaming (Engine Block -> Head Assemblies -> Induction/Exhaust -> Subsystems).
// ============================================================================

import React, { useEffect, useState } from 'react';
import { globalAssetCache, AssetLoadProgress } from '../assets/glbAssetLoader';
import { Flame, CheckCircle2, Layers } from 'lucide-react';

export const EngineInitializationHUD: React.FC = () => {
  const [progress, setProgress] = useState<AssetLoadProgress>({
    totalAssets: 10,
    loadedAssets: 0,
    failedAssets: 0,
    percentage: 0,
    currentAssetPath: 'Initial Shell',
  });
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = globalAssetCache.onProgress((p) => {
      setProgress(p);
      if (p.percentage >= 100) {
        setIsComplete(true);
        // Smoothly fade out 1.2s after completion
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 1200);
        return () => clearTimeout(timer);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!isVisible) return null;

  const currentStepName =
    progress.percentage < 25
      ? 'ENGINE BLOCK SHELL'
      : progress.percentage < 50
      ? 'CYLINDER HEADS & CRANKSHAFT'
      : progress.percentage < 75
      ? 'INTAKE & EXHAUST MANIFOLDS'
      : progress.percentage < 100
      ? 'RECIPROCATING SUBSYSTEMS'
      : 'ENGINE INITIALIZED';

  return (
    <div
      className={`absolute bottom-4 left-4 z-40 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 shadow-2xl transition-all duration-500 w-72 pointer-events-none select-none ${
        isComplete ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 size={15} className="text-emerald-400" />
          ) : (
            <Flame size={15} className="text-cyan-400 animate-pulse" />
          )}
          <span className="text-xs font-bold text-slate-200 tracking-wide">
            {isComplete ? 'ASSET STREAMING READY' : 'ENGINE INITIALIZATION'}
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-cyan-400">{progress.percentage}%</span>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full bg-slate-800/90 h-1.5 rounded-full overflow-hidden mb-1.5 border border-slate-700/50">
        <div
          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300 rounded-full"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span className="truncate max-w-[170px] text-slate-300 font-semibold">{currentStepName}</span>
        <span>
          {progress.loadedAssets}/{progress.totalAssets}
        </span>
      </div>
    </div>
  );
};
