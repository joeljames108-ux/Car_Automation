import * as THREE from 'three';

export interface LODLevel { distance: number; ratio: number; label: string; }

const DEFAULT_LODS: LODLevel[] = [
  { distance: 0, ratio: 1.0, label: 'Ultra' },
  { distance: 50, ratio: 0.5, label: 'High' },
  { distance: 150, ratio: 0.25, label: 'Medium' },
  { distance: 400, ratio: 0.1, label: 'Low' },
  { distance: 800, ratio: 0.03, label: 'Minimal' },
];

export class GLBLODGenerator {
  private levels: LODLevel[];
  private mergeThreshold: number;
  private preserveSkeletal: boolean;

  constructor(levels?: LODLevel[], mergeThreshold = 0.002, preserveSkeletal = true) {
    this.levels = levels || DEFAULT_LODS;
    this.mergeThreshold = mergeThreshold;
    this.preserveSkeletal = preserveSkeletal;
  }

  createLODHierarchy(scene: THREE.Group): THREE.LOD {
    const lod = new THREE.LOD();
    for (const level of this.levels) {
      const clone = scene.clone(true);
      if (level.ratio < 1.0) {
        this.simplifyMeshes(clone, level.ratio);
      }
      lod.addLevel(clone, level.distance);
    }
    return lod;
  }

  private simplifyMeshes(group: THREE.Group, ratio: number): void {
    group.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) return;
      const mesh = node as THREE.Mesh;
      if (!mesh.geometry) return;
      let geo = mesh.geometry.clone();
      if (geo.index) geo = geo.toNonIndexed();

      const pos = geo.getAttribute('position');
      if (!pos) return;
      const vertCount = pos.count;
      const targetCount = Math.max(4, Math.floor(vertCount * ratio));

      if (targetCount >= vertCount) { mesh.geometry = geo; return; }

      const gridSize = 0.1 / Math.max(ratio, 0.01);
      const grid = new Map<string, number[]>();
      for (let i = 0; i < vertCount; i++) {
        const key = `${Math.floor(pos.getX(i) / gridSize)},${Math.floor(pos.getY(i) / gridSize)},${Math.floor(pos.getZ(i) / gridSize)}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key)!.push(i);
      }

      const kept: number[] = [];
      for (const [, indices] of grid) { if (kept.length >= targetCount) break; kept.push(indices[0]); }
      while (kept.length < targetCount && kept.length < vertCount) kept.push(kept.length);
      kept.sort((a, b) => a - b);

      const np = new Float32Array(kept.length * 3);
      const nn = new Float32Array(kept.length * 3);
      const nu = new Float32Array(kept.length * 2);
      const normAttr = geo.getAttribute('normal');
      const uvAttr = geo.getAttribute('uv');

      for (let ni = 0; ni < kept.length; ni++) {
        const oi = kept[ni];
        np[ni * 3] = pos.getX(oi); np[ni * 3 + 1] = pos.getY(oi); np[ni * 3 + 2] = pos.getZ(oi);
        if (normAttr) { nn[ni * 3] = normAttr.getX(oi); nn[ni * 3 + 1] = normAttr.getY(oi); nn[ni * 3 + 2] = normAttr.getZ(oi); }
        if (uvAttr) { nu[ni * 2] = uvAttr.getX(oi); nu[ni * 2 + 1] = uvAttr.getY(oi); }
      }

      const simplified = new THREE.BufferGeometry();
      simplified.setAttribute('position', new THREE.BufferAttribute(np, 3));
      simplified.setAttribute('normal', new THREE.BufferAttribute(nn, 3));
      simplified.setAttribute('uv', new THREE.BufferAttribute(nu, 2));
      simplified.computeVertexNormals();
      mesh.geometry.dispose();
      mesh.geometry = simplified;
    });
  }

  autoSwitchLOD(camera: THREE.Camera, lod: THREE.LOD): void {
    lod.update(camera);
  }

  createDetailCullingProxy(scene: THREE.Group, maxDistance = 300): THREE.Group {
    const proxy = new THREE.Group();
    const detailGroup = new THREE.Group();
    const simpleGroup = new THREE.Group();

    scene.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) return;
      const mesh = node as THREE.Mesh;
      const pos = mesh.geometry?.getAttribute('position');
      const vertCount = pos?.count || 0;

      if (vertCount > 5000) {
        const simplified = this.createSimplifiedClone(mesh, 0.1);
        simpleGroup.add(simplified);
        detailGroup.add(mesh.clone());
      } else {
        detailGroup.add(mesh.clone());
        simpleGroup.add(mesh.clone());
      }
    });

    proxy.userData.detailGroup = detailGroup;
    proxy.userData.simpleGroup = simpleGroup;
    proxy.userData.maxDistance = maxDistance;
    proxy.add(simpleGroup);
    return proxy;
  }

  private createSimplifiedClone(mesh: THREE.Mesh, ratio: number): THREE.Mesh {
    const clone = mesh.clone();
    let geo = clone.geometry.clone();
    if (geo.index) geo = geo.toNonIndexed();
    const pos = geo.getAttribute('position');
    if (!pos) return clone;

    const vc = pos.count;
    const tc = Math.max(3, Math.floor(vc * ratio));
    const grid = new Map<string, number[]>();
    const gs = 0.1 / Math.max(ratio, 0.01);

    for (let i = 0; i < vc; i++) {
      const key = `${Math.floor(pos.getX(i) / gs)},${Math.floor(pos.getY(i) / gs)},${Math.floor(pos.getZ(i) / gs)}`;
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key)!.push(i);
    }

    const kept: number[] = [];
    for (const [, idx] of grid) { if (kept.length >= tc) break; kept.push(idx[0]); }
    while (kept.length < tc && kept.length < vc) kept.push(kept.length);
    kept.sort((a, b) => a - b);

    const np = new Float32Array(kept.length * 3);
    const nn = new Float32Array(kept.length * 3);
    for (let i = 0; i < kept.length; i++) {
      np[i * 3] = pos.getX(kept[i]); np[i * 3 + 1] = pos.getY(kept[i]); np[i * 3 + 2] = pos.getZ(kept[i]);
      const n = geo.getAttribute('normal');
      if (n) { nn[i * 3] = n.getX(kept[i]); nn[i * 3 + 1] = n.getY(kept[i]); nn[i * 3 + 2] = n.getZ(kept[i]); }
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(np, 3));
    sg.setAttribute('normal', new THREE.BufferAttribute(nn, 3));
    sg.computeVertexNormals();
    clone.geometry.dispose();
    clone.geometry = sg;
    return clone;
  }

  getLODInfo(lod: THREE.LOD): { levels: number; totalMeshes: number[] } {
    const info: { levels: number; totalMeshes: number[] } = { levels: lod.levels.length, totalMeshes: [] };
    for (const level of lod.levels) {
      let count = 0;
      level.object.traverse(n => { if ((n as THREE.Mesh).isMesh) count++; });
      info.totalMeshes.push(count);
    }
    return info;
  }
}

export const createDefaultLODGenerator = () => new GLBLODGenerator();
export const createFineLODGenerator = () => new GLBLODGenerator([
  { distance: 0, ratio: 1.0, label: 'Ultra' },
  { distance: 30, ratio: 0.7, label: 'Very High' },
  { distance: 80, ratio: 0.4, label: 'High' },
  { distance: 200, ratio: 0.2, label: 'Medium' },
  { distance: 500, ratio: 0.08, label: 'Low' },
  { distance: 1000, ratio: 0.02, label: 'Minimal' },
]);
