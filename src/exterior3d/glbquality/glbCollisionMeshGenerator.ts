import * as THREE from 'three';

export interface CollisionConfig { simplifyRatio: number; mergeDistance: number; includeChildren: boolean; convexDecomposition: boolean; maxConvexParts: number; }
const DEFAULT_COLLISION: CollisionConfig = { simplifyRatio: 0.1, mergeDistance: 0.01, includeChildren: true, convexDecomposition: false, maxConvexParts: 16 };

export class GLBCollisionMeshGenerator {
  private cfg: CollisionConfig;
  constructor(cfg?: Partial<CollisionConfig>) { this.cfg = { ...DEFAULT_COLLISION, ...cfg }; }

  generateCollisionMesh(scene: THREE.Group): THREE.Mesh {
    const geometries: THREE.BufferGeometry[] = [];
    scene.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) return;
      const mesh = node as THREE.Mesh;
      let geo = mesh.geometry.clone();
      if (geo.index) geo = geo.toNonIndexed();
      geo.applyMatrix4(mesh.matrixWorld);
      geometries.push(geo);
    });

    if (geometries.length === 0) return new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));

    const merged = this.mergeGeometries(geometries);
    const simplified = this.simplify(merged);
    const material = new THREE.MeshBasicMaterial({ visible: false, wireframe: true, color: 0x00ff00 });
    const collisionMesh = new THREE.Mesh(simplified, material);
    collisionMesh.name = 'collision_mesh';
    collisionMesh.userData.isCollisionMesh = true;
    geometries.forEach(g => g.dispose());
    return collisionMesh;
  }

  generateBoxCollider(scene: THREE.Group): THREE.Box3 {
    const box = new THREE.Box3();
    scene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        mesh.geometry.computeBoundingBox();
        if (mesh.geometry.boundingBox) {
          const transformed = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
          box.union(transformed);
        }
      }
    });
    return box;
  }

  generateSphereCollider(scene: THREE.Group): THREE.Sphere {
    const box = this.generateBoxCollider(scene);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);
    const radius = Math.max(size.x, size.y, size.z) * 0.5;
    return new THREE.Sphere(center, radius);
  }

  generateConvexHulls(scene: THREE.Group, maxParts = 16): THREE.Mesh[] {
    const hulls: THREE.Mesh[] = [];
    const material = new THREE.MeshBasicMaterial({ visible: false, wireframe: true, color: 0x00ff00 });
    let partCount = 0;

    scene.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh || partCount >= maxParts) return;
      const mesh = node as THREE.Mesh;
      let geo = mesh.geometry.clone();
      if (geo.index) geo = geo.toNonIndexed();
      geo.applyMatrix4(mesh.matrixWorld);

      const positions = geo.getAttribute('position');
      if (!positions || positions.count < 4) return;

      const hullMesh = new THREE.Mesh(geo, material);
      hullMesh.name = `convex_hull_${partCount}`;
      hullMesh.userData.isCollisionMesh = true;
      hulls.push(hullMesh);
      partCount++;
    });

    return hulls;
  }

  private mergeGeometries(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
    let totalVerts = 0;
    for (const g of geos) totalVerts += g.getAttribute('position')?.count || 0;
    const pa = new Float32Array(totalVerts * 3);
    let off = 0;
    for (const g of geos) {
      const pos = g.getAttribute('position');
      if (!pos) continue;
      for (let i = 0; i < pos.count; i++) {
        pa[(off + i) * 3] = pos.getX(i); pa[(off + i) * 3 + 1] = pos.getY(i); pa[(off + i) * 3 + 2] = pos.getZ(i);
      }
      off += pos.count;
    }
    const merged = new THREE.BufferGeometry();
    merged.setAttribute('position', new THREE.BufferAttribute(pa, 3));
    merged.computeVertexNormals();
    return merged;
  }

  private simplify(geo: THREE.BufferGeometry): THREE.BufferGeometry {
    const pos = geo.getAttribute('position');
    if (!pos) return geo;
    const vc = pos.count;
    const tc = Math.max(4, Math.floor(vc * this.cfg.simplifyRatio));
    if (tc >= vc) return geo;

    const gs = 0.1 / Math.max(this.cfg.simplifyRatio, 0.01);
    const grid = new Map<string, number[]>();
    for (let i = 0; i < vc; i++) {
      const k = `${Math.floor(pos.getX(i) / gs)},${Math.floor(pos.getY(i) / gs)},${Math.floor(pos.getZ(i) / gs)}`;
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k)!.push(i);
    }

    const kept: number[] = [];
    for (const [, idx] of grid) { if (kept.length >= tc) break; kept.push(idx[0]); }
    while (kept.length < tc && kept.length < vc) kept.push(kept.length);
    kept.sort((a, b) => a - b);

    const np = new Float32Array(kept.length * 3);
    for (let i = 0; i < kept.length; i++) {
      np[i * 3] = pos.getX(kept[i]); np[i * 3 + 1] = pos.getY(kept[i]); np[i * 3 + 2] = pos.getZ(kept[i]);
    }
    const simplified = new THREE.BufferGeometry();
    simplified.setAttribute('position', new THREE.BufferAttribute(np, 3));
    simplified.computeVertexNormals();
    return simplified;
  }

  generateMeshGroupCollider(scene: THREE.Group): Map<string, THREE.Mesh> {
    const colliders = new Map<string, THREE.Mesh>();
    scene.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) return;
      const mesh = node as THREE.Mesh;
      const name = mesh.name || `part_${colliders.size}`;
      const box = new THREE.Box3().setFromObject(mesh);
      const size = new THREE.Vector3();
      box.getSize(size);
      if (size.length() < 0.001) return;
      const center = new THREE.Vector3();
      box.getCenter(center);
      const collider = new THREE.Mesh(
        new THREE.BoxGeometry(size.x * 1.05, size.y * 1.05, size.z * 1.05),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      collider.position.copy(center);
      collider.name = `collider_${name}`;
      collider.userData.isCollisionMesh = true;
      colliders.set(name, collider);
    });
    return colliders;
  }
}

export const createDefaultCollisionGenerator = () => new GLBCollisionMeshGenerator();
export const createConvexCollisionGenerator = () => new GLBCollisionMeshGenerator({ convexDecomposition: true, maxConvexParts: 32 });
