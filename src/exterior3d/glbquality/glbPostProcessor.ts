import * as THREE from 'three';

export interface SubdivisionConfig {
  levels: number;
  creaseAngle: number;
  preserveUVs: boolean;
  smoothNormals: boolean;
  generateTangents: boolean;
  wireframe: boolean;
  adaptiveSubdivision: boolean;
  edgeSplitAngle: number;
  minFaceArea: number;
  maxEdgeLength: number;
}

export interface NormalSmoothingConfig {
  angleThreshold: number;
  iterations: number;
  weightByArea: boolean;
  weightByAngle: boolean;
  preserveBoundary: boolean;
  sharpEdgeDetection: boolean;
  sharpAngle: number;
  smoothInteriorOnly: boolean;
}

const DEFAULT_SUBDIV: SubdivisionConfig = {
  levels: 1, creaseAngle: Math.PI / 4, preserveUVs: true,
  smoothNormals: true, generateTangents: true, wireframe: false,
  adaptiveSubdivision: true, edgeSplitAngle: 30, minFaceArea: 0.001, maxEdgeLength: 0.5,
};

const DEFAULT_NORMAL: NormalSmoothingConfig = {
  angleThreshold: Math.PI / 6, iterations: 3, weightByArea: true,
  weightByAngle: true, preserveBoundary: true,
  sharpEdgeDetection: true, sharpAngle: Math.PI / 3, smoothInteriorOnly: false,
};

export class GLBPostProcessor {
  private cfg: SubdivisionConfig;
  private nCfg: NormalSmoothingConfig;

  constructor(sc?: Partial<SubdivisionConfig>, nc?: Partial<NormalSmoothingConfig>) {
    this.cfg = { ...DEFAULT_SUBDIV, ...sc };
    this.nCfg = { ...DEFAULT_NORMAL, ...nc };
  }

  processScene(scene: THREE.Group): THREE.Group {
    scene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        if (mesh.geometry) this.processGeometry(mesh);
      }
    });
    return scene;
  }

  private processGeometry(mesh: THREE.Mesh): void {
    const geo = mesh.geometry;
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    if (this.cfg.smoothNormals) this.smoothNormals(geo);
    if (this.cfg.generateTangents) this.generateTangents(geo);
    if (this.cfg.adaptiveSubdivision) this.adaptiveSubdivide(geo);
    this.ensureNonIndexed(geo);
  }

  private ensureNonIndexed(geo: THREE.BufferGeometry): void {
    if (geo.index) {
      const d = geo.toNonIndexed();
      geo.setIndex(null);
      Object.keys(d.attributes).forEach((k) => geo.setAttribute(k, d.getAttribute(k)));
      geo.computeVertexNormals();
    }
  }

  smoothNormals(geo: THREE.BufferGeometry): void {
    const pos = geo.getAttribute('position');
    const norm = geo.getAttribute('normal');
    if (!pos || !norm) return;
    const vc = pos.count;
    const sm = new Float32Array(vc * 3);
    const wa = new Float32Array(vc);
    const idx = geo.index;
    const tc = idx ? idx.count / 3 : vc / 3;

    for (let t = 0; t < tc; t++) {
      const i0 = idx ? idx.getX(t * 3) : t * 3;
      const i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1;
      const i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
      const ax = pos.getX(i1) - pos.getX(i0);
      const ay = pos.getY(i1) - pos.getY(i0);
      const az = pos.getZ(i1) - pos.getZ(i0);
      const bx = pos.getX(i2) - pos.getX(i0);
      const by = pos.getY(i2) - pos.getY(i0);
      const bz = pos.getZ(i2) - pos.getZ(i0);
      let nx = ay * bz - az * by;
      let ny = az * bx - ax * bz;
      let nz = ax * by - ay * bx;
      const area = Math.sqrt(nx * nx + ny * ny + nz * nz) * 0.5;
      if (area < 1e-10) continue;
      nx /= (area * 2); ny /= (area * 2); nz /= (area * 2);
      const wt = this.nCfg.weightByArea ? area : 1;
      for (const ii of [i0, i1, i2]) {
        sm[ii * 3] += nx * wt; sm[ii * 3 + 1] += ny * wt; sm[ii * 3 + 2] += nz * wt;
        wa[ii] += wt;
      }
    }

    for (let i = 0; i < vc; i++) {
      const w = wa[i] || 1;
      const sx = sm[i * 3] / w, sy = sm[i * 3 + 1] / w, sz = sm[i * 3 + 2] / w;
      const len = Math.sqrt(sx * sx + sy * sy + sz * sz) || 1;
      norm.setXYZ(i, sx / len, sy / len, sz / len);
    }
    norm.needsUpdate = true;
  }

  generateTangents(geo: THREE.BufferGeometry): void {
    const pos = geo.getAttribute('position');
    const uv = geo.getAttribute('uv');
    const norm = geo.getAttribute('normal');
    if (!pos || !uv || !norm) return;
    const vc = pos.count;
    const tang = new Float32Array(vc * 3);
    const idx = geo.index;
    const tc = idx ? idx.count / 3 : vc / 3;

    for (let t = 0; t < tc; t++) {
      const i0 = idx ? idx.getX(t * 3) : t * 3;
      const i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1;
      const i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
      const e1x = pos.getX(i1) - pos.getX(i0);
      const e1y = pos.getY(i1) - pos.getY(i0);
      const e1z = pos.getZ(i1) - pos.getZ(i0);
      const e2x = pos.getX(i2) - pos.getX(i0);
      const e2y = pos.getY(i2) - pos.getY(i0);
      const e2z = pos.getZ(i2) - pos.getZ(i0);
      const du1x = uv.getX(i1) - uv.getX(i0);
      const du1y = uv.getY(i1) - uv.getY(i0);
      const du2x = uv.getX(i2) - uv.getX(i0);
      const du2y = uv.getY(i2) - uv.getY(i0);
      const r = 1.0 / (du1x * du2y - du2x * du1y + 1e-10);
      const tx = (e1x * du2y - e2x * du1y) * r;
      const ty = (e1y * du2y - e2y * du1y) * r;
      const tz = (e1z * du2y - e2z * du1y) * r;
      for (const ii of [i0, i1, i2]) {
        tang[ii * 3] += tx; tang[ii * 3 + 1] += ty; tang[ii * 3 + 2] += tz;
      }
    }

    for (let i = 0; i < vc; i++) {
      const n = new THREE.Vector3(norm.getX(i), norm.getY(i), norm.getZ(i));
      const t = new THREE.Vector3(tang[i * 3], tang[i * 3 + 1], tang[i * 3 + 2]);
      t.sub(n.clone().multiplyScalar(n.dot(t))).normalize();
      tang[i * 3] = t.x; tang[i * 3 + 1] = t.y; tang[i * 3 + 2] = t.z;
    }
    geo.setAttribute('tangent', new THREE.BufferAttribute(tang, 3));
  }

  adaptiveSubdivide(geo: THREE.BufferGeometry): void {
    const pos = geo.getAttribute('position');
    if (!pos) return;
    const idx = geo.index;
    if (!idx) return;
    const maxE = this.cfg.maxEdgeLength;
    const minA = this.cfg.minFaceArea;
    const np: number[] = [], nn: number[] = [], nu: number[] = [];
    const tc = idx.count / 3;

    for (let t = 0; t < tc; t++) {
      const i0 = idx.getX(t * 3), i1 = idx.getX(t * 3 + 1), i2 = idx.getX(t * 3 + 2);
      const p0 = new THREE.Vector3(pos.getX(i0), pos.getY(i0), pos.getZ(i0));
      const p1 = new THREE.Vector3(pos.getX(i1), pos.getY(i1), pos.getZ(i1));
      const p2 = new THREE.Vector3(pos.getX(i2), pos.getY(i2), pos.getZ(i2));
      const me = Math.max(p0.distanceTo(p1), p1.distanceTo(p2), p2.distanceTo(p0));
      const ab = p1.clone().sub(p0), ac = p2.clone().sub(p0);
      const area = ab.cross(ac).length() * 0.5;

      if (me > maxE && area > minA) {
        const m01 = p0.clone().add(p1).multiplyScalar(0.5);
        const m12 = p1.clone().add(p2).multiplyScalar(0.5);
        const m20 = p2.clone().add(p0).multiplyScalar(0.5);
        const subTris = [[p0, m01, m20], [m01, p1, m12], [m20, m12, p2], [m01, m12, m20]];
        for (const tri of subTris) {
          for (const pt of tri) { np.push(pt.x, pt.y, pt.z); nn.push(0, 1, 0); nu.push(0, 0); }
        }
      } else {
        for (const ii of [i0, i1, i2]) {
          np.push(pos.getX(ii), pos.getY(ii), pos.getZ(ii));
          const n = geo.getAttribute('normal');
          if (n) nn.push(n.getX(ii), n.getY(ii), n.getZ(ii)); else nn.push(0, 1, 0);
          const u = geo.getAttribute('uv');
          if (u) nu.push(u.getX(ii), u.getY(ii)); else nu.push(0, 0);
        }
      }
    }
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(np), 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nn), 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(nu), 2));
    geo.setIndex(null);
    geo.computeVertexNormals();
  }

  addShadowCasting(scene: THREE.Group, cast = true, receive = true): void {
    scene.traverse((n) => {
      if ((n as THREE.Mesh).isMesh) {
        const m = n as THREE.Mesh;
        m.castShadow = cast; m.receiveShadow = receive; m.frustumCulled = false;
      }
    });
  }

  processEnvironmentMap(scene: THREE.Group, pmrem: THREE.PMREMGenerator, _ren: THREE.WebGLRenderer): void {
    const es = new THREE.Scene();
    es.background = new THREE.Color(0x1a1208);
    const tl = new THREE.DirectionalLight(0xffeedd, 2); tl.position.set(0, 10, 0); es.add(tl);
    const rl = new THREE.DirectionalLight(0xd4a574, 1.5); rl.position.set(-5, 5, -5); es.add(rl);
    const fl = new THREE.DirectionalLight(0xb8860b, 0.8); fl.position.set(5, 3, 5); es.add(fl);
    es.add(new THREE.AmbientLight(0x2d1a0a, 0.5));
    const env = pmrem.fromScene(es, 0.04).texture;
    scene.traverse((n) => {
      if ((n as THREE.Mesh).isMesh) {
        const m = n as THREE.Mesh;
        if (m.material instanceof THREE.MeshStandardMaterial) {
          m.material.envMap = env; m.material.envMapIntensity = 0.8; m.material.needsUpdate = true;
        }
      }
    });
  }

  getSceneStats(scene: THREE.Group): { meshes: number; tris: number; verts: number; kb: number } {
    let meshes = 0, tris = 0, verts = 0, kb = 0;
    scene.traverse((n) => {
      if ((n as THREE.Mesh).isMesh) {
        meshes++;
        const g = (n as THREE.Mesh).geometry;
        if (g) {
          verts += g.getAttribute('position')?.count || 0;
          if (g.index) tris += g.index.count / 3; else tris += (g.getAttribute('position')?.count || 0) / 3;
          for (const k of Object.keys(g.attributes)) { kb += (g.getAttribute(k).array as unknown as ArrayBuffer).byteLength / 1024; }
        }
      }
    });
    return { meshes, tris, verts, kb: Math.round(kb) };
  }
}

export const createDefaultPostProcessor = () => new GLBPostProcessor();
export const createHighQualityPostProcessor = () => new GLBPostProcessor(
  { levels: 2, creaseAngle: Math.PI / 6, adaptiveSubdivision: true, maxEdgeLength: 0.3 },
  { angleThreshold: Math.PI / 8, iterations: 5, weightByArea: true }
);
