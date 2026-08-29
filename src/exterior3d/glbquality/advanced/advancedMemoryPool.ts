import * as THREE from "three";

export class AdvancedMemoryPool {
  private geometryPool = new Map<string, THREE.BufferGeometry>();
  private materialPool = new Map<string, THREE.Material>();
  private totalGPUMemory = 0;
  private maxGPUMemory = 512 * 1024 * 1024;

  getGeometry(key: string, factory: () => THREE.BufferGeometry): THREE.BufferGeometry {
    if (this.geometryPool.has(key)) return this.geometryPool.get(key)!;
    const geo = factory();
    this.geometryPool.set(key, geo);
    this.totalGPUMemory += this.estimateGeometryMemory(geo);
    return geo;
  }

  getMaterial(key: string, factory: () => THREE.Material): THREE.Material {
    if (this.materialPool.has(key)) return this.materialPool.get(key)!;
    const mat = factory();
    this.materialPool.set(key, mat);
    return mat;
  }

  private estimateGeometryMemory(geo: THREE.BufferGeometry): number {
    let bytes = 0;
    for (const key in geo.attributes) {
      const attr = geo.attributes[key];
      bytes += attr.array.byteLength;
    }
    if (geo.index) bytes += geo.index.array.byteLength;
    return bytes;
  }

  disposeUnused(): number {
    let disposed = 0;
    this.geometryPool.forEach((geo, key) => {
      if (geo.userData && (geo.userData as any).lastUsed && Date.now() - (geo.userData as any).lastUsed > 30000) {
        this.totalGPUMemory -= this.estimateGeometryMemory(geo);
        geo.dispose();
        this.geometryPool.delete(key);
        disposed++;
      }
    });
    return disposed;
  }

  getMemoryUsage(): { used: number; max: number; percentage: number } {
    return { used: this.totalGPUMemory, max: this.maxGPUMemory, percentage: (this.totalGPUMemory / this.maxGPUMemory) * 100 };
  }

  dispose(): void {
    this.geometryPool.forEach(g => g.dispose());
    this.geometryPool.clear();
    this.materialPool.forEach(m => m.dispose());
    this.materialPool.clear();
    this.totalGPUMemory = 0;
  }
}
