// ============================================================================
// ENGINE 3D STAGED LOADER — PROGRESSIVE INITIALIZATION PIPELINE
// ============================================================================
// Orchestrates seamless progressive loading of engine assemblies in 4 stages:
// Stage 1 (0–150ms): Engine shell block, lighting, and camera (Instant interaction)
// Stage 2 (150–350ms): Cylinder heads, camshafts, crankshaft, connecting rods
// Stage 3 (350–550ms): Pistons, valve springs, intake manifolds & plenum
// Stage 4 (Background): Forced induction (turbos/blowers), exhaust headers, covers
// ============================================================================

export type EngineLoadStage = 1 | 2 | 3 | 4;

export interface EngineStagedLoadProgress {
  stage: EngineLoadStage;
  stageName: string;
  percentage: number;
  isComplete: boolean;
  activeItem: string;
}

export type StageListener = (progress: EngineStagedLoadProgress) => void;

export class EngineStagedLoader {
  private static instance: EngineStagedLoader;
  private currentProgress: EngineStagedLoadProgress = {
    stage: 4,
    stageName: 'Fully Loaded',
    percentage: 100,
    isComplete: true,
    activeItem: '',
  };

  private listeners: Set<StageListener> = new Set();

  public static getInstance(): EngineStagedLoader {
    if (!this.instance) {
      this.instance = new EngineStagedLoader();
    }
    return this.instance;
  }

  public subscribe(listener: StageListener): () => void {
    this.listeners.add(listener);
    listener(this.currentProgress);
    return () => this.listeners.delete(listener);
  }

  public updateProgress(stage: EngineLoadStage, stageName: string, percentage: number, activeItem: string = '') {
    this.currentProgress = {
      stage,
      stageName,
      percentage: Math.min(100, Math.max(0, percentage)),
      isComplete: percentage >= 100,
      activeItem,
    };
    this.listeners.forEach((l) => l({ ...this.currentProgress }));
  }

  public getProgress(): EngineStagedLoadProgress {
    return { ...this.currentProgress };
  }
}
