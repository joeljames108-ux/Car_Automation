import * as THREE from 'three';

export interface NoiseConfig { scale: number; octaves: number; persistence: number; lacunarity: number; seed: number; }
export interface TextureGenConfig { width: number; height: number; format: THREE.PixelFormat; type: THREE.TextureDataType; }

const DEFAULT_NOISE: NoiseConfig = { scale: 50, octaves: 6, persistence: 0.5, lacunarity: 2.0, seed: 42 };
const DEFAULT_TEX: TextureGenConfig = { width: 1024, height: 1024, format: THREE.RGBAFormat, type: THREE.UnsignedByteType };

class SimplexNoise {
  private perm: number[];
  private grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
  constructor(seed: number) {
    this.perm = new Array(512);
    const p = new Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    let s = seed;
    for (let i = 255; i > 0; i--) { s = (s * 16807 + 0) % 2147483647; const j = s % (i + 1); [p[i], p[j]] = [p[j], p[i]]; }
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }
  noise2D(x: number, y: number): number {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    const s = (x + y) * F2;
    const i = Math.floor(x + s), j = Math.floor(y + s);
    const t = (i + j) * G2;
    const X0 = i - t, Y0 = j - t;
    const x0 = x - X0, y0 = y - Y0;
    const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
    const ii = i & 255, jj = j & 255;
    const dot = (g: number[], x: number, y: number) => g[0] * x + g[1] * y;
    let n0 = 0, n1 = 0, n2 = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) { t0 *= t0; n0 = t0 * t0 * dot(this.grad3[this.perm[ii + this.perm[jj]] % 12], x0, y0); }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) { t1 *= t1; n1 = t1 * t1 * dot(this.grad3[this.perm[ii + i1 + this.perm[jj + j1]] % 12], x1, y1); }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) { t2 *= t2; n2 = t2 * t2 * dot(this.grad3[this.perm[ii + 1 + this.perm[jj + 1]] % 12], x2, y2); }
    return 70 * (n0 + n1 + n2);
  }
  fbm(x: number, y: number, octaves: number, persistence: number, lacunarity: number): number {
    let val = 0, amp = 1, freq = 1, maxAmp = 0;
    for (let o = 0; o < octaves; o++) {
      val += this.noise2D(x * freq, y * freq) * amp;
      maxAmp += amp;
      amp *= persistence;
      freq *= lacunarity;
    }
    return val / maxAmp;
  }
}

export class GLBTextureGenerator {
  private noise: SimplexNoise;
  private texCfg: TextureGenConfig;

  constructor(noiseCfg?: Partial<NoiseConfig>, texCfg?: Partial<TextureGenConfig>) {
    const nc = { ...DEFAULT_NOISE, ...noiseCfg };
    this.noise = new SimplexNoise(nc.seed);
    this.texCfg = { ...DEFAULT_TEX, ...texCfg };
  }

  generateNormalMap(cfg?: Partial<NoiseConfig>): THREE.DataTexture {
    const nc = { ...DEFAULT_NOISE, ...cfg };
    const { width, height } = this.texCfg;
    const data = new Uint8Array(width * height * 4);
    const strength = 2.0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const u = x / width * nc.scale;
        const v = y / height * nc.scale;
        const eps = 1.0 / nc.scale;
        const h00 = this.noise.fbm(u, v, nc.octaves, nc.persistence, nc.lacunarity);
        const h10 = this.noise.fbm(u + eps, v, nc.octaves, nc.persistence, nc.lacunarity);
        const h01 = this.noise.fbm(u, v + eps, nc.octaves, nc.persistence, nc.lacunarity);
        const dx = (h10 - h00) * strength;
        const dy = (h01 - h00) * strength;
        const dz = 1.0;
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const idx = (y * width + x) * 4;
        data[idx] = Math.floor(((dx / len) * 0.5 + 0.5) * 255);
        data[idx + 1] = Math.floor(((dy / len) * 0.5 + 0.5) * 255);
        data[idx + 2] = Math.floor(((dz / len) * 0.5 + 0.5) * 255);
        data[idx + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    tex.needsUpdate = true;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  generateRoughnessMap(baseRoughness = 0.5, variation = 0.3): THREE.DataTexture {
    const { width, height } = this.texCfg;
    const data = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const u = x / width * 30;
        const v = y / height * 30;
        const n = this.noise.fbm(u, v, 4, 0.6, 2.2);
        const val = Math.max(0, Math.min(1, baseRoughness + n * variation));
        const idx = (y * width + x) * 4;
        const byte = Math.floor(val * 255);
        data[idx] = byte; data[idx + 1] = byte; data[idx + 2] = byte; data[idx + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    tex.needsUpdate = true;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  generateAOMap(detail = 0.4): THREE.DataTexture {
    const { width, height } = this.texCfg;
    const data = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const u = x / width * 20;
        const v = y / height * 20;
        const n = this.noise.fbm(u, v, 5, 0.5, 2.0);
        const val = Math.max(0, Math.min(1, 1.0 - Math.abs(n) * detail));
        const idx = (y * width + x) * 4;
        const byte = Math.floor(val * 255);
        data[idx] = byte; data[idx + 1] = byte; data[idx + 2] = byte; data[idx + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    tex.needsUpdate = true;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  generateMetalnessMap(baseMetalness = 0.9, variation = 0.1): THREE.DataTexture {
    const { width, height } = this.texCfg;
    const data = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const n = this.noise.noise2D(x / width * 10, y / height * 10) * variation;
        const val = Math.max(0, Math.min(1, baseMetalness + n));
        const idx = (y * width + x) * 4;
        const byte = Math.floor(val * 255);
        data[idx] = byte; data[idx + 1] = byte; data[idx + 2] = byte; data[idx + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    tex.needsUpdate = true;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  generateBrushedMetalMap(direction: 'horizontal' | 'vertical' | 'circular' = 'horizontal'): THREE.DataTexture {
    const { width, height } = this.texCfg;
    const data = new Float32Array(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const u = x / width * 200;
        const v = y / height * 10;
        let n: number;
        if (direction === 'horizontal') n = this.noise.noise2D(u, v);
        else if (direction === 'vertical') n = this.noise.noise2D(v, u);
        else { const cx = x - width / 2, cy = y - height / 2; const r = Math.sqrt(cx * cx + cy * cy) / width * 200; const a = Math.atan2(cy, cx); n = this.noise.noise2D(r, a * 10); }
        const idx = (y * width + x) * 4;
        const val = n * 0.5 + 0.5;
        data[idx] = val; data[idx + 1] = val; data[idx + 2] = val; data[idx + 3] = 1;
      }
    }
    const tex = new THREE.DataTexture(new Uint8Array(data.map(v => Math.floor(v * 255))), width, height, THREE.RGBAFormat);
    tex.needsUpdate = true;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  generateCarbonFiberMap(weaveType: string = 'twill'): THREE.DataTexture {
    const { width, height } = this.texCfg;
    const data = new Uint8Array(width * height * 4);
    const scale = weaveType === 'twill' ? 8 : weaveType === 'plain' ? 12 : 6;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const ux = (x / width) * scale;
        const vy = (y / height) * scale;
        let val: number;
        if (weaveType === 'twill') {
          val = ((Math.floor(ux) + Math.floor(vy)) % 2 === 0) ? 0.08 : 0.15;
          const diag = (ux % 1 + vy % 1);
          if (diag > 0.8 || diag < 0.2) val *= 0.7;
        } else if (weaveType === 'plain') {
          val = ((Math.floor(ux) + Math.floor(vy)) % 2 === 0) ? 0.06 : 0.14;
        } else {
          val = this.noise.fbm(ux * 5, vy * 5, 3, 0.5, 2) * 0.15 + 0.05;
        }
        val = Math.max(0, Math.min(1, val));
        const idx = (y * width + x) * 4;
        const byte = Math.floor(val * 255);
        data[idx] = byte; data[idx + 1] = byte; data[idx + 2] = byte; data[idx + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    tex.needsUpdate = true;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  generateLeatherGrainMap(grainScale = 100): THREE.DataTexture {
    const { width, height } = this.texCfg;
    const data = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const u = x / width * grainScale;
        const v = y / height * grainScale;
        const coarse = this.noise.fbm(u, v, 3, 0.6, 2.0) * 0.3;
        const fine = this.noise.noise2D(u * 5, v * 5) * 0.15;
        const val = Math.max(0, Math.min(1, 0.5 + coarse + fine));
        const idx = (y * width + x) * 4;
        const byte = Math.floor(val * 255);
        data[idx] = byte; data[idx + 1] = byte; data[idx + 2] = byte; data[idx + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    tex.needsUpdate = true;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  generatePaintFlakeMap(flakeDensity = 200, flakeSize = 0.3): THREE.DataTexture {
    const { width, height } = this.texCfg;
    const data = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const u = x / width, v = y / height;
        const idx = (y * width + x) * 4;
        const seed = (x * 12.9898 + y * 78.233) % 1;
        const val = seed < flakeDensity / 10000 ? flakeSize : 0;
        data[idx] = Math.floor(val * 255); data[idx + 1] = Math.floor(val * 255);
        data[idx + 2] = Math.floor(val * 255); data[idx + 3] = 255;
        void u; void v;
      }
    }
    const tex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    tex.needsUpdate = true;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  generateGroundPlaneReflection(): THREE.DataTexture {
    const { width, height } = this.texCfg;
    const data = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const v = y / height;
        const val = Math.max(0, 0.12 - v * 0.08);
        const idx = (y * width + x) * 4;
        data[idx] = Math.floor(val * 255); data[idx + 1] = Math.floor(val * 0.88 * 255);
        data[idx + 2] = Math.floor(val * 0.6 * 255); data[idx + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    tex.needsUpdate = true;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }
}

export const createDefaultTextureGenerator = () => new GLBTextureGenerator();
export const createHighResTextureGenerator = () => new GLBTextureGenerator({ octaves: 8 }, { width: 2048, height: 2048 });
