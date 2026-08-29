import * as THREE from 'three';

export interface TextureBudget { maxTextures: number; maxTotalMB: number; maxSingleMB: number; }
export interface GeometryBudget { maxTotalVertices: number; maxTotalTriangles: number; maxMeshes: number; }
export interface MemorySnapshot { textureMB: number; geometryMB: number; totalMB: number; meshCount: number; textureCount: number; timestamp: number; }

const DEFAULT_TEX_BUDGET: TextureBudget = { maxTextures: 64, maxTotalMB: 256, maxSingleMB: 32 };
const DEFAULT_GEO_BUDGET: GeometryBudget = { maxTotalVertices: 5000000, maxTotalTriangles: 10000000, maxMeshes: 2000 };

export class GLBMemoryManager {
  private texBudget: TextureBudget;
  private geoBudget: GeometryBudget;
  private trackedTextures = new Map<string, THREE.Texture>();
  private trackedGeometries = new Map<string, THREE.BufferGeometry>();
  private snapshots: MemorySnapshot[] = [];
  private maxSnapshots = 100;

  constructor(texBudget?: Partial<TextureBudget>, geoBudget?: Partial<GeometryBudget>) {
    this.texBudget = { ...DEFAULT_TEX_BUDGET, ...texBudget };
    this.geoBudget = { ...DEFAULT_GEO_BUDGET, ...geoBudget };
  }

  trackScene(scene: THREE.Group): void {
    scene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        if (mesh.geometry) this.trackedGeometries.set(mesh.geometry.uuid, mesh.geometry);
        const mat = mesh.material as any;
        if (mat) {
          for (const key of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'envMap', 'aoMap', 'bumpMap', 'displacementMap']) {
            if (mat[key] && mat[key].isTexture) this.trackedTextures.set(mat[key].uuid, mat[key]);
          }
        }
      }
    });
  }

  takeSnapshot(): MemorySnapshot {
    let texMB = 0;
    for (const [, tex] of this.trackedTextures) {
      const img = tex.image;
      if (img && (img as any).width && (img as any).height) texMB += ((img as any).width * (img as any).height * 4) / (1024 * 1024);
      else texMB += 4;
    }
    let geoMB = 0, verts = 0, tris = 0, meshes = 0;
    for (const [, geo] of this.trackedGeometries) {
      for (const key of Object.keys(geo.attributes)) {
        const attr = geo.getAttribute(key);
        if (attr) geoMB += (attr.array as unknown as ArrayBuffer).byteLength / (1024 * 1024);
      }
      const posAttr = geo.getAttribute('position');
      if (posAttr) { verts += posAttr.count; meshes++; }
      if (geo.index) tris += geo.index.count / 3; else if (posAttr) tris += posAttr.count / 3;
    }

    const snap: MemorySnapshot = {
      textureMB: Math.round(texMB * 100) / 100,
      geometryMB: Math.round(geoMB * 100) / 100,
      totalMB: Math.round((texMB + geoMB) * 100) / 100,
      meshCount: meshes, textureCount: this.trackedTextures.size,
      timestamp: Date.now(),
    };
    this.snapshots.push(snap);
    if (this.snapshots.length > this.maxSnapshots) this.snapshots.shift();
    return snap;
  }

  checkBudgets(): { textureOverBudget: boolean; geometryOverBudget: boolean; warnings: string[] } {
    const warnings: string[] = [];
    let texMB = 0;
    for (const [, tex] of this.trackedTextures) {
      const img = tex.image;
      if (img && (img as any).width) texMB += ((img as any).width * ((img as any).height || (img as any).width) * 4) / (1024 * 1024);
    }
    if (this.trackedTextures.size > this.texBudget.maxTextures) warnings.push(`Texture count ${this.trackedTextures.size} exceeds budget ${this.texBudget.maxTextures}`);
    if (texMB > this.texBudget.maxTotalMB) warnings.push(`Texture memory ${texMB.toFixed(1)}MB exceeds budget ${this.texBudget.maxTotalMB}MB`);

    let geoMB = 0, verts = 0, meshCount = 0;
    for (const [, geo] of this.trackedGeometries) {
      for (const key of Object.keys(geo.attributes)) { geoMB += (geo.getAttribute(key).array as unknown as ArrayBuffer).byteLength / (1024 * 1024); }
      const pos = geo.getAttribute('position');
      if (pos) { verts += pos.count; meshCount++; }
    }
    if (verts > this.geoBudget.maxTotalVertices) warnings.push(`Vertex count ${verts} exceeds budget ${this.geoBudget.maxTotalVertices}`);
    if (meshCount > this.geoBudget.maxMeshes) warnings.push(`Mesh count ${meshCount} exceeds budget ${this.geoBudget.maxMeshes}`);

    return { textureOverBudget: texMB > this.texBudget.maxTotalMB, geometryOverBudget: geoMB > (this.geoBudget.maxTotalVertices * 12 / 1024 / 1024), warnings };
  }

  downscaleTextures(maxSize = 1024): number {
    let downscaled = 0;
    for (const [, tex] of this.trackedTextures) {
      const img = tex.image;
      if (img && (img as any).width && (img as any).width > maxSize) {
        const canvas = document.createElement('canvas');
        const aspect = (img as any).width / (img as any).height;
        canvas.width = maxSize;
        canvas.height = Math.floor(maxSize / aspect);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img as any, 0, 0, canvas.width, canvas.height);
          tex.image = canvas;
          tex.needsUpdate = true;
          downscaled++;
        }
      }
    }
    return downscaled;
  }

  disposeUnused(scene: THREE.Group): { textures: number; geometries: number } {
    const usedTextures = new Set<string>();
    const usedGeometries = new Set<string>();
    scene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        if (mesh.geometry) usedGeometries.add(mesh.geometry.uuid);
        const mat = mesh.material as any;
        if (mat) {
          for (const key of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'envMap']) {
            if (mat[key] && mat[key].isTexture) usedTextures.add(mat[key].uuid);
          }
        }
      }
    });

    let disposedTex = 0, disposedGeo = 0;
    for (const [uuid, tex] of this.trackedTextures) {
      if (!usedTextures.has(uuid)) { tex.dispose(); this.trackedTextures.delete(uuid); disposedTex++; }
    }
    for (const [uuid, geo] of this.trackedGeometries) {
      if (!usedGeometries.has(uuid)) { geo.dispose(); this.trackedGeometries.delete(uuid); disposedGeo++; }
    }
    return { textures: disposedTex, geometries: disposedGeo };
  }

  getMemoryHistory(): MemorySnapshot[] { return [...this.snapshots]; }
  getMemoryTrend(): { texChange: number; geoChange: number } {
    if (this.snapshots.length < 2) return { texChange: 0, geoChange: 0 };
    const last = this.snapshots[this.snapshots.length - 1];
    const prev = this.snapshots[this.snapshots.length - 2];
    return { texChange: last.textureMB - prev.textureMB, geoChange: last.geometryMB - prev.geometryMB };
  }
  forceGC(): void {
    for (const [, tex] of this.trackedTextures) { if ((tex.image as any)?.src) (tex.image as any).src = ''; }
  }
}

export const createDefaultMemoryManager = () => new GLBMemoryManager();
export const createStrictMemoryManager = () => new GLBMemoryManager(
  { maxTextures: 32, maxTotalMB: 128, maxSingleMB: 16 },
  { maxTotalVertices: 2000000, maxTotalTriangles: 4000000, maxMeshes: 500 }
);
