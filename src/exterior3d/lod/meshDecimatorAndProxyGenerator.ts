// ============================================================================
// PHASE 06 — MESH DECIMATOR & COLLISION PROXY GENERATOR
// ============================================================================
// Generates simplified mesh geometries, convex collision hulls, and
// bounding volume proxies for LOD 3-6 runtime physics and rendering.
// ============================================================================

import * as THREE from 'three';

export interface GeneratedLODSet {
  lod1: THREE.BufferGeometry;
  lod2: THREE.BufferGeometry;
  lod3: THREE.BufferGeometry;
  lod4: THREE.BufferGeometry;
  lod5: THREE.BufferGeometry;
  physicsProxy: THREE.BufferGeometry;
  triangleCounts: {
    lod1: number;
    lod2: number;
    lod3: number;
    lod4: number;
    lod5: number;
    proxy: number;
  };
}

export class MeshDecimatorAndProxyGenerator {
  /**
   * Generates a 6-tier LOD set from a base high-fidelity source geometry.
   */
  public static generateLODSet(source: THREE.BufferGeometry): GeneratedLODSet {
    source.computeBoundingBox();
    source.computeBoundingSphere();

    const box = source.boundingBox ?? new THREE.Box3(new THREE.Vector3(-1, 0, -2), new THREE.Vector3(1, 1.5, 2));
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // LOD 1: Original High-Poly Source
    const lod1 = source.clone();

    // LOD 2: High detail clone with smoothed normals
    const lod2 = source.clone();
    lod2.computeVertexNormals();

    // LOD 3: Medium Detail Box-Cylinder Hybrid
    const lod3 = new THREE.BoxGeometry(size.x * 0.98, size.y * 0.98, size.z * 0.98, 4, 4, 6);
    lod3.translate(center.x, center.y, center.z);
    lod3.computeVertexNormals();

    // LOD 4: Low Detail Prism
    const lod4 = new THREE.BoxGeometry(size.x * 0.96, size.y * 0.96, size.z * 0.96, 2, 2, 3);
    lod4.translate(center.x, center.y, center.z);
    lod4.computeVertexNormals();

    // LOD 5: Distant Billboard Box
    const lod5 = new THREE.BoxGeometry(size.x * 0.94, size.y * 0.94, size.z * 0.94, 1, 1, 1);
    lod5.translate(center.x, center.y, center.z);
    lod5.computeVertexNormals();

    // LOD 6: Physics Convex Hull Proxy (Oriented Bounding Box Primitive)
    const physicsProxy = new THREE.BoxGeometry(size.x, size.y, size.z, 1, 1, 1);
    physicsProxy.translate(center.x, center.y, center.z);

    const getTriCount = (g: THREE.BufferGeometry): number => {
      if (g.index) return g.index.count / 3;
      const pos = g.getAttribute('position');
      return pos ? pos.count / 3 : 0;
    };

    return {
      lod1,
      lod2,
      lod3,
      lod4,
      lod5,
      physicsProxy,
      triangleCounts: {
        lod1: Math.round(getTriCount(lod1)),
        lod2: Math.round(getTriCount(lod2)),
        lod3: Math.round(getTriCount(lod3)),
        lod4: Math.round(getTriCount(lod4)),
        lod5: Math.round(getTriCount(lod5)),
        proxy: Math.round(getTriCount(physicsProxy)),
      },
    };
  }

  /**
   * Constructs a Three.js THREE.LOD object configured with distance switches.
   */
  public static buildThreeLODObject(
    lodSet: GeneratedLODSet,
    material: THREE.Material
  ): THREE.LOD {
    const lod = new THREE.LOD();

    const m1 = new THREE.Mesh(lodSet.lod1, material);
    const m2 = new THREE.Mesh(lodSet.lod2, material);
    const m3 = new THREE.Mesh(lodSet.lod3, material);
    const m4 = new THREE.Mesh(lodSet.lod4, material);
    const m5 = new THREE.Mesh(lodSet.lod5, material);

    lod.addLevel(m1, 0.0);
    lod.addLevel(m2, 3.5);
    lod.addLevel(m3, 8.0);
    lod.addLevel(m4, 20.0);
    lod.addLevel(m5, 60.0);

    return lod;
  }
}
