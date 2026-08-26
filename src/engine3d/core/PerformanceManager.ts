// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — PERFORMANCE TELEMETRY MANAGER
// ============================================================================
// Centralized real-time performance, memory, draw-call, and frame-time
// telemetry collector for WebGL and React Engine Studio. Throttles HUD updates
// to avoid performance observer interference.
// ============================================================================

import type * as THREE from 'three';

export interface PerformanceMetrics {
  fps: number;
  frameTimeMs: number;
  cpuTimeMs: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  reactRenderCount: number;
  isIdle: boolean;
}

export type PerformanceListener = (metrics: PerformanceMetrics) => void;

export class PerformanceManager {
  private static instance: PerformanceManager;

  private metrics: PerformanceMetrics = {
    fps: 60,
    frameTimeMs: 16.67,
    cpuTimeMs: 0,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    reactRenderCount: 0,
    isIdle: false,
  };

  private listeners: Set<PerformanceListener> = new Set();
  private isEnabled: boolean = typeof window !== 'undefined' && process.env.NODE_ENV === 'development';
  private frameCount: number = 0;
  private lastTime: number = typeof performance !== 'undefined' ? performance.now() : 0;
  private lastUpdate: number = typeof performance !== 'undefined' ? performance.now() : 0;

  private constructor() {}

  public static getInstance(): PerformanceManager {
    if (!PerformanceManager.instance) {
      PerformanceManager.instance = new PerformanceManager();
    }
    return PerformanceManager.instance;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public subscribe(listener: PerformanceListener): () => void {
    this.listeners.add(listener);
    // Immediate send current metrics
    listener(this.metrics);
    return () => this.listeners.delete(listener);
  }

  public incrementReactRenderCount(): void {
    this.metrics.reactRenderCount++;
  }

  public updateFrameStats(renderer?: THREE.WebGLRenderer | null, cpuTimeMs: number = 0, isIdle: boolean = false): void {
    const now = performance.now();
    this.frameCount++;

    const elapsedSinceLastUpdate = now - this.lastUpdate;

    if (elapsedSinceLastUpdate >= 250) {
      // Throttled 4Hz metrics update for HUD
      const frameDelta = now - this.lastTime;
      const computedFps = Math.min(120, Math.round((this.frameCount * 1000) / elapsedSinceLastUpdate));
      const frameTimeMs = parseFloat((frameDelta / (this.frameCount || 1)).toFixed(2));

      let drawCalls = 0;
      let triangles = 0;
      let geometries = 0;
      let textures = 0;

      if (renderer && renderer.info) {
        drawCalls = renderer.info.render.calls;
        triangles = renderer.info.render.triangles;
        geometries = renderer.info.memory.geometries;
        textures = renderer.info.memory.textures;
      }

      this.metrics = {
        fps: computedFps,
        frameTimeMs,
        cpuTimeMs: parseFloat(cpuTimeMs.toFixed(2)),
        drawCalls,
        triangles,
        geometries,
        textures,
        reactRenderCount: this.metrics.reactRenderCount,
        isIdle,
      };

      this.frameCount = 0;
      this.lastUpdate = now;

      this.notify();
    }

    this.lastTime = now;
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.metrics);
      } catch (err) {
        console.error('[PerformanceManager] Listener error:', err);
      }
    });
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

export const globalPerformanceManager = PerformanceManager.getInstance();
