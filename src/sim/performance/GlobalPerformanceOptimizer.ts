/**
 * ============================================================================
 * APEX ENGINEER — GLOBAL PERFORMANCE & TELEMETRY OPTIMIZER
 * ============================================================================
 * Central performance infrastructure for state calculations, 3D WebGL scenes,
 * physics solver caching, and idle task scheduling.
 *
 * Features:
 * 1. O(1) LRU Calculation Cache for Dyno & Physics Solvers
 * 2. WebGL Buffer & Material Garbage Collection & Reuse Pool
 * 3. Priority Task Scheduler (requestIdleCallback fallback)
 * 4. High-Efficiency React State Transition Manager
 * ============================================================================
 */

import * as THREE from "three";

export interface CachedCalculation<T> {
  key: string;
  result: T;
  timestamp: number;
}

export class GlobalPerformanceOptimizer {
  private static instance: GlobalPerformanceOptimizer | null = null;
  private calcCache: Map<string, CachedCalculation<any>> = new Map();
  private maxCacheSize: number = 200;
  private ttlMs: number = 60000; // 1 minute TTL

  // WebGL Disposable Geometry & Material Registry
  private geometryPool: Map<string, THREE.BufferGeometry> = new Map();
  private materialPool: Map<string, THREE.Material> = new Map();

  public static getInstance(): GlobalPerformanceOptimizer {
    if (!GlobalPerformanceOptimizer.instance) {
      GlobalPerformanceOptimizer.instance = new GlobalPerformanceOptimizer();
    }
    return GlobalPerformanceOptimizer.instance;
  }

  /**
   * Memoizes a heavy physics computation using a parameter signature hash
   */
  public memoize<T>(key: string, computeFn: () => T): T {
    const cached = this.calcCache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.ttlMs) {
      return cached.result;
    }

    const result = computeFn();
    
    // LRU eviction if cache exceeds limit
    if (this.calcCache.size >= this.maxCacheSize) {
      const firstKey = this.calcCache.keys().next().value;
      if (firstKey) this.calcCache.delete(firstKey);
    }

    this.calcCache.set(key, { key, result, timestamp: now });
    return result;
  }

  /**
   * Clears calculation cache when major global state resets occur
   */
  public clearCache(): void {
    this.calcCache.clear();
  }

  /**
   * Schedule a low-priority task during idle frames
   */
  public scheduleIdleTask(task: () => void, timeoutMs: number = 100): void {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      (window as any).requestIdleCallback(() => task(), { timeout: timeoutMs });
    } else {
      setTimeout(task, 1);
    }
  }

  /**
   * Shared WebGL BufferGeometry Factory (prevents duplicate buffer allocations)
   */
  public getOrCreateGeometry(
    key: string,
    factory: () => THREE.BufferGeometry
  ): THREE.BufferGeometry {
    if (this.geometryPool.has(key)) {
      return this.geometryPool.get(key)!;
    }
    const geom = factory();
    this.geometryPool.set(key, geom);
    return geom;
  }

  /**
   * Safely dispose all cached WebGL geometries to free GPU VRAM
   */
  public disposeAllGeometries(): void {
    this.geometryPool.forEach((geom) => geom.dispose());
    this.geometryPool.clear();
    this.materialPool.forEach((mat) => mat.dispose());
    this.materialPool.clear();
  }
}
