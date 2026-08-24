// ====================================================================
// GLB SCENE POST-PROCESSOR — Edge Darkening, AO, Specular Sharpening
// ====================================================================
import * as THREE from "three";

export interface PostProcessOptions {
  edgeDarkeningStrength: number;
  aoStrength: number;
  specularSharpen: number;
  normalEnhance: number;
  envMapIntensity: number;
  preserveOriginalTextures: boolean;
}

const DEFAULT_OPTS: PostProcessOptions = {
  edgeDarkeningStrength: 0.3,
  aoStrength: 0.5,
  specularSharpen: 0.2,
  normalEnhance: 0.3,
  envMapIntensity: 1.5,
  preserveOriginalTextures: true,
};

export class GLBScenePostProcessor {

  public static process(scene: THREE.Group, opts?: Partial<PostProcessOptions>): void {
    const o = { ...DEFAULT_OPTS, ...opts };
    scene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      if (!mesh.material) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of mats) {
        this.enhanceMaterial(mat as THREE.MeshPhysicalMaterial, o);
      }
      if (o.edgeDarkeningStrength > 0 && mesh.geometry) {
        this.applyEdgeDarkening(mesh, o.edgeDarkeningStrength);
      }
      if (o.specularSharpen > 0 && mesh.geometry) {
        this.sharpenSpecular(mesh, o.specularSharpen);
      }
    });
  }

  private static enhanceMaterial(mat: THREE.MeshPhysicalMaterial, o: PostProcessOptions): void {
    if (!(mat as any).isMeshPhysicalMaterial) return;
    if (mat.clearcoat !== undefined && mat.clearcoat < 0.5) {
      mat.clearcoat = Math.min(1.0, mat.clearcoat + 0.15);
      mat.clearcoatRoughness = Math.max(0.05, (mat.clearcoatRoughness ?? 0.3) - 0.1);
    }
    if (mat.metalness !== undefined && mat.metalness > 0.5) {
      mat.envMapIntensity = o.envMapIntensity;
    }
    const roughness = mat.roughness ?? 0.5;
    if (roughness > 0.6 && mat.metalness !== undefined && mat.metalness < 0.2) {
      mat.sheen = Math.min(0.5, (mat.sheen ?? 0) + 0.08);
    }
    if (mat.normalMap && o.normalEnhance > 0) {
      mat.normalScale = new THREE.Vector2(
        (mat.normalScale?.x ?? 1) * (1 + o.normalEnhance),
        (mat.normalScale?.y ?? 1) * (1 + o.normalEnhance)
      );
    }
    if (mat.aoMap && o.aoStrength > 0) {
      mat.aoMapIntensity = 1.0 + o.aoStrength;
    }
    if (roughness < 0.4 && o.specularSharpen > 0) {
      mat.roughness = Math.max(0.02, roughness * (1 - o.specularSharpen * 0.3));
    }
    mat.needsUpdate = true;
  }

  private static applyEdgeDarkening(mesh: THREE.Mesh, strength: number): void {
    const geo = mesh.geometry;
    const pos = geo.getAttribute("position");
    if (!pos) return;
    if (!geo.getAttribute("normal")) { geo.computeVertexNormals(); }
    const norm = geo.getAttribute("normal");
    if (!norm) return;
    const index = geo.getIndex();
    const count = pos.count;
    const edgeAngleCounts = new Float32Array(count);
    if (index) {
      const triCount = index.count / 3;
      for (let t = 0; t < triCount; t++) {
        const verts = [index.getX(t*3), index.getX(t*3+1), index.getX(t*3+2)];
        for (let e = 0; e < 3; e++) {
          const a = verts[e], b = verts[(e+1)%3];
          const na = new THREE.Vector3(norm.getX(a), norm.getY(a), norm.getZ(a));
          const nb = new THREE.Vector3(norm.getX(b), norm.getY(b), norm.getZ(b));
          const angle = na.angleTo(nb);
          if (angle > 0.4) { edgeAngleCounts[a] += angle; edgeAngleCounts[b] += angle; }
        }
      }
    }
    let maxCount = 0;
    for (let i = 0; i < count; i++) maxCount = Math.max(maxCount, edgeAngleCounts[i]);
    if (maxCount < 0.001) return;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const d = 1.0 - (edgeAngleCounts[i] / maxCount) * strength;
      colors[i*3] = d; colors[i*3+1] = d; colors[i*3+2] = d;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  }

  private static sharpenSpecular(mesh: THREE.Mesh, strength: number): void {
    const geo = mesh.geometry;
    if (!geo.getAttribute("uv") || !geo.getAttribute("position")) return;
    try { if (!geo.getAttribute("tangent")) geo.computeTangents(); } catch {}
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      const m = mat as THREE.MeshPhysicalMaterial;
      if (m.roughness !== undefined && m.roughness < 0.35) {
        m.roughness = Math.max(0.01, m.roughness * (1 - strength * 0.5));
        if (m.clearcoatRoughness !== undefined) {
          m.clearcoatRoughness = Math.max(0.01, m.clearcoatRoughness * (1 - strength * 0.4));
        }
        m.needsUpdate = true;
      }
    }
  }

  public static generateStudioEnvMap(renderer: THREE.WebGLRenderer): THREE.Texture {
    const size = 128;
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const cv = document.createElement("canvas");
    cv.width = size * 4; cv.height = size * 2;
    const ctx = cv.getContext("2d")!;
    const skyGrad = ctx.createLinearGradient(0, 0, 0, size);
    skyGrad.addColorStop(0, "#1a1020");
    skyGrad.addColorStop(0.3, "#2a1a35");
    skyGrad.addColorStop(0.5, "#40304a");
    skyGrad.addColorStop(0.7, "#5a4040");
    skyGrad.addColorStop(1.0, "#3a2818");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, cv.width, cv.height);
    const kl = ctx.createRadialGradient(cv.width*0.7, size*0.3, 0, cv.width*0.7, size*0.3, size*0.5);
    kl.addColorStop(0, "rgba(255,240,220,0.6)");
    kl.addColorStop(0.5, "rgba(255,220,180,0.15)");
    kl.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = kl;
    ctx.fillRect(0, 0, cv.width, cv.height);
    const fl = ctx.createRadialGradient(cv.width*0.2, size*0.4, 0, cv.width*0.2, size*0.4, size*0.35);
    fl.addColorStop(0, "rgba(180,200,255,0.25)");
    fl.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = fl;
    ctx.fillRect(0, 0, cv.width, cv.height);
    const floorGrad = ctx.createLinearGradient(0, size*1.6, 0, size*2);
    floorGrad.addColorStop(0, "rgba(40,30,20,0.8)");
    floorGrad.addColorStop(1, "rgba(10,8,5,1)");
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, size*1.6, cv.width, size*0.4);
    const tex = new THREE.CanvasTexture(cv);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    const envMap = pmrem.fromEquirectangular(tex).texture;
    tex.dispose(); pmrem.dispose();
    return envMap;
  }
}