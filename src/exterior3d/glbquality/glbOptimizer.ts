import * as THREE from 'three';

export interface LODConfig {
  distances: number[];
  ratios: number[];
  preserveTextures: boolean;
  mergeVertices: boolean;
  mergeDistance: number;
}

export interface InstancingConfig {
  maxInstances: number;
  frustumCull: boolean;
  maxPixelError: number;
  boundingBoxPadding: number;
}

export interface BufferCompressionConfig {
  quantizePositions: boolean;
  quantizeNormals: boolean;
  quantizeUVs: boolean;
  positionBits: number;
  normalBits: number;
  uvBits: number;
  deduplicateVertices: boolean;
  deduplicateThreshold: number;
}

export class GLBOptimizer {
  private lodCfg: LODConfig;
  private instCfg: InstancingConfig;
  private bufCfg: BufferCompressionConfig;

  constructor(lodCfg?: Partial<LODConfig>, instCfg?: Partial<InstancingConfig>, bufCfg?: Partial<BufferCompressionConfig>) {
    this.lodCfg = { distances: [0, 50, 150, 400], ratios: [1.0, 0.6, 0.3, 0.1], preserveTextures: true, mergeVertices: true, mergeDistance: 0.001, ...lodCfg };
    this.instCfg = { maxInstances: 1000, frustumCull: true, maxPixelError: 4, boundingBoxPadding: 0.1, ...instCfg };
    this.bufCfg = { quantizePositions: true, quantizeNormals: true, quantizeUVs: true, positionBits: 16, normalBits: 8, uvBits: 12, deduplicateVertices: true, deduplicateThreshold: 0.0001, ...bufCfg };
  }

  generateLODLevels(scene: THREE.Group): THREE.Group[] {
    const levels: THREE.Group[] = [];
    for (let i = 0; i < this.lodCfg.distances.length; i++) {
      const ratio = this.lodCfg.ratios[i] || 0.1;
      const clone = scene.clone(true);
      if (ratio < 1.0) {
        clone.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            const mesh = node as THREE.Mesh;
            if (mesh.geometry) mesh.geometry = this.simplifyGeometry(mesh.geometry, ratio);
          }
        });
      }
      levels.push(clone);
    }
    return levels;
  }

  private simplifyGeometry(geo: THREE.BufferGeometry, ratio: number): THREE.BufferGeometry {
    let g = geo.clone();
    if (g.index) { g = g.toNonIndexed(); }
    return this.simplifyNonIndexed(g, ratio);
  }

  private simplifyNonIndexed(geo: THREE.BufferGeometry, ratio: number): THREE.BufferGeometry {
    const pos = geo.getAttribute('position');
    if (!pos) return geo;
    const vertCount = pos.count;
    const targetCount = Math.max(3, Math.floor(vertCount * ratio));
    const spatialGrid = new Map<string, number[]>();
    const gridSize = 0.1 / Math.max(ratio, 0.01);

    for (let i = 0; i < vertCount; i++) {
      const key = `${Math.floor(pos.getX(i) / gridSize)},${Math.floor(pos.getY(i) / gridSize)},${Math.floor(pos.getZ(i) / gridSize)}`;
      if (!spatialGrid.has(key)) spatialGrid.set(key, []);
      spatialGrid.get(key)!.push(i);
    }

    const kept: number[] = [];
    for (const [, indices] of spatialGrid) {
      if (kept.length >= targetCount) break;
      kept.push(indices[0]);
    }
    while (kept.length < targetCount && kept.length < vertCount) kept.push(kept.length);
    kept.sort((a, b) => a - b);

    const np = new Float32Array(kept.length * 3);
    const nn = new Float32Array(kept.length * 3);
    const nu = new Float32Array(kept.length * 2);
    const nAttr = geo.getAttribute('normal');
    const uAttr = geo.getAttribute('uv');

    for (let ni = 0; ni < kept.length; ni++) {
      const oi = kept[ni];
      np[ni * 3] = pos.getX(oi); np[ni * 3 + 1] = pos.getY(oi); np[ni * 3 + 2] = pos.getZ(oi);
      if (nAttr) { nn[ni * 3] = nAttr.getX(oi); nn[ni * 3 + 1] = nAttr.getY(oi); nn[ni * 3 + 2] = nAttr.getZ(oi); }
      if (uAttr) { nu[ni * 2] = uAttr.getX(oi); nu[ni * 2 + 1] = uAttr.getY(oi); }
    }

    const simplified = new THREE.BufferGeometry();
    simplified.setAttribute('position', new THREE.BufferAttribute(np, 3));
    simplified.setAttribute('normal', new THREE.BufferAttribute(nn, 3));
    simplified.setAttribute('uv', new THREE.BufferAttribute(nu, 2));
    simplified.computeVertexNormals();
    return simplified;
  }

  mergeGeometriesByMaterial(scene: THREE.Group): Map<string, THREE.BufferGeometry> {
    const groups = new Map<string, THREE.BufferGeometry[]>();
    scene.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) return;
      const mesh = node as THREE.Mesh;
      const matKey = this.getMaterialKey(mesh.material as THREE.Material);
      if (!groups.has(matKey)) groups.set(matKey, []);
      let geo = mesh.geometry.clone();
      if (geo.index) geo = geo.toNonIndexed();
      geo.applyMatrix4(mesh.matrixWorld);
      groups.get(matKey)!.push(geo);
    });

    const merged = new Map<string, THREE.BufferGeometry>();
    for (const [key, geos] of groups) {
      if (geos.length === 1) { merged.set(key, geos[0]); continue; }
      let totalVerts = 0;
      for (const g of geos) totalVerts += g.getAttribute('position')?.count || 0;
      const pa = new Float32Array(totalVerts * 3), na = new Float32Array(totalVerts * 3), ua = new Float32Array(totalVerts * 2);
      let off = 0;
      for (const geo of geos) {
        const pos = geo.getAttribute('position'), norm = geo.getAttribute('normal'), uv = geo.getAttribute('uv');
        const count = pos?.count || 0;
        for (let i = 0; i < count; i++) {
          if (pos) { pa[(off + i) * 3] = pos.getX(i); pa[(off + i) * 3 + 1] = pos.getY(i); pa[(off + i) * 3 + 2] = pos.getZ(i); }
          if (norm) { na[(off + i) * 3] = norm.getX(i); na[(off + i) * 3 + 1] = norm.getY(i); na[(off + i) * 3 + 2] = norm.getZ(i); }
          if (uv) { ua[(off + i) * 2] = uv.getX(i); ua[(off + i) * 2 + 1] = uv.getY(i); }
        }
        off += count;
      }
      const mg = new THREE.BufferGeometry();
      mg.setAttribute('position', new THREE.BufferAttribute(pa, 3));
      mg.setAttribute('normal', new THREE.BufferAttribute(na, 3));
      mg.setAttribute('uv', new THREE.BufferAttribute(ua, 2));
      mg.computeVertexNormals();
      merged.set(key, mg);
      geos.forEach(g => g.dispose());
    }
    return merged;
  }

  deduplicateVertices(geo: THREE.BufferGeometry): THREE.BufferGeometry {
    const pos = geo.getAttribute('position');
    if (!pos) return geo;
    const th = this.bufCfg.deduplicateThreshold;
    const uniqueMap = new Map<string, number>();
    const indexMap: number[] = [];

    for (let i = 0; i < pos.count; i++) {
      const key = `${Math.round(pos.getX(i) / th)},${Math.round(pos.getY(i) / th)},${Math.round(pos.getZ(i) / th)}`;
      if (uniqueMap.has(key)) { indexMap.push(uniqueMap.get(key)!); }
      else { uniqueMap.set(key, i); indexMap.push(i); }
    }

    const uniqueIndices = Array.from(uniqueMap.values());
    const np = new Float32Array(uniqueIndices.length * 3);
    const nn = new Float32Array(uniqueIndices.length * 3);
    const nu = new Float32Array(uniqueIndices.length * 2);
    const nAttr = geo.getAttribute('normal');
    const uAttr = geo.getAttribute('uv');

    for (let ni = 0; ni < uniqueIndices.length; ni++) {
      const oi = uniqueIndices[ni];
      np[ni * 3] = pos.getX(oi); np[ni * 3 + 1] = pos.getY(oi); np[ni * 3 + 2] = pos.getZ(oi);
      if (nAttr) { nn[ni * 3] = nAttr.getX(oi); nn[ni * 3 + 1] = nAttr.getY(oi); nn[ni * 3 + 2] = nAttr.getZ(oi); }
      if (uAttr) { nu[ni * 2] = uAttr.getX(oi); nu[ni * 2 + 1] = uAttr.getY(oi); }
    }

    const deduped = new THREE.BufferGeometry();
    deduped.setAttribute('position', new THREE.BufferAttribute(np, 3));
    deduped.setAttribute('normal', new THREE.BufferAttribute(nn, 3));
    deduped.setAttribute('uv', new THREE.BufferAttribute(nu, 2));
    deduped.setIndex(new THREE.BufferAttribute(new Uint32Array(indexMap), 1));
    return deduped;
  }

  createInstancedMeshes(scene: THREE.Group): THREE.Group {
    const result = new THREE.Group();
    const meshTypes = new Map<string, THREE.Mesh[]>();
    scene.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) return;
      const key = this.getMaterialKey((node as THREE.Mesh).material as THREE.Material);
      if (!meshTypes.has(key)) meshTypes.set(key, []);
      meshTypes.get(key)!.push(node as THREE.Mesh);
          });
    for (const [, meshes] of meshTypes) {
      if (meshes.length > 1 && meshes.length <= this.instCfg.maxInstances) {
        const template = meshes[0];
        const instanced = new THREE.InstancedMesh(template.geometry.clone(), template.material, meshes.length);
        const dummy = new THREE.Object3D();
        for (let i = 0; i < meshes.length; i++) {
          dummy.position.copy(meshes[i].position); dummy.rotation.copy(meshes[i].rotation);
          dummy.scale.copy(meshes[i].scale); dummy.updateMatrix();
          instanced.setMatrixAt(i, dummy.matrix);
        }
        instanced.instanceMatrix.needsUpdate = true; result.add(instanced);
      } else { for (const m of meshes) result.add(m.clone()); }
    }
    return result;
  }
  private getMaterialKey(mat: THREE.Material): string {
    if (mat instanceof THREE.MeshStandardMaterial) return `std_${mat.color.getHex()}_${mat.metalness}_${mat.roughness}`;
    if (mat instanceof THREE.MeshPhysicalMaterial) return `phys_${mat.color.getHex()}_${mat.metalness}_${mat.clearcoat}`;
    return `mat_${mat.type}_${mat.uuid.slice(0, 8)}`;
  }
  getSceneStats(scene: THREE.Group) {
    let meshes = 0, triangles = 0, kb = 0;
    const mats = new Set<string>(), texs = new Set<string>();
    scene.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) return; meshes++;
      const g = (node as THREE.Mesh).geometry;
      if (g) {
        triangles += g.index ? g.index.count / 3 : (g.getAttribute('position')?.count || 0) / 3;
        for (const k of Object.keys(g.attributes)) kb += (g.getAttribute(k).array as unknown as ArrayBuffer).byteLength / 1024;
      }
      const m = (node as THREE.Mesh).material as any;
      if (m) { mats.add(m.uuid); if (m.map) texs.add(m.map.uuid); if (m.normalMap) texs.add(m.normalMap.uuid); }
    });
    return { meshes, triangles, textures: texs.size, materials: mats.size, memoryKB: Math.round(kb) };
  }
}
export const createDefaultOptimizer = () => new GLBOptimizer();
export const createAggressiveOptimizer = () => new GLBOptimizer(
  { distances: [0, 30, 80, 200], ratios: [1, 0.4, 0.15, 0.05], mergeVertices: true, mergeDistance: 0.002 },
  { maxInstances: 500, frustumCull: true },
  { positionBits: 14, normalBits: 8, uvBits: 10, deduplicateVertices: true }
);
