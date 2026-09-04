// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — STAGED INITIALIZATION PROGRESS HUD
// ============================================================================

import React, { useEffect, useState, useRef } from 'react';
import { globalAssetCache, AssetLoadProgress } from '../assets/glbAssetLoader';
import { Flame, CheckCircle2 } from 'lucide-react';

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
  const [displayPercent, setDisplayPercent] = useState(0);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const target = progress.percentage;
    const animate = () => {
      setDisplayPercent((prev) => {
        const diff = target - prev;
        if (Math.abs(diff) < 0.5) return target;
        return prev + diff * 0.12;
      });
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [progress.percentage]);

  useEffect(() => {
    const unsubscribe = globalAssetCache.onProgress((p) => {
      setProgress(p);
      if (p.percentage >= 100) {
        setIsComplete(true);
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
      className={`absolute bottom-4 left-4 z-40 bg-amber-950/80 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 shadow-2xl transition-all duration-500 w-80 pointer-events-none select-none ${
        isComplete ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 size={15} className="text-emerald-400" />
          ) : (
            <Flame size={15} className="text-amber-400 animate-pulse" />
          )}
          <span className="text-xs font-bold text-amber-100/90 tracking-wide">
            {isComplete ? 'ASSET STREAMING READY' : 'ENGINE INITIALIZATION'}
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-amber-400">{Math.round(displayPercent)}%</span>
      </div>

      <div className="w-full bg-amber-900/40 h-1.5 rounded-full overflow-hidden mb-1.5 border border-amber-800/30">
        <div
          className="bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 h-full transition-all duration-300 rounded-full relative overflow-hidden"
          style={{ width: `${displayPercent}%`, boxShadow: '0 0 10px rgba(245,158,11,0.4)' }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-amber-300/50 font-mono">
        <span className="truncate max-w-[170px] text-amber-200/70 font-semibold">{currentStepName}</span>
        <span>
          {progress.loadedAssets}/{progress.totalAssets}
        </span>
      </div>
    </div>
  );
};
