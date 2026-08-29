// ====================================================================
// GLASS REFRACTION SYSTEM - Automotive Glass with Weather Effects
// ====================================================================
// Complete automotive glass simulation:
// - 10+ glass types with accurate IOR and transmission
// - Rain droplet formation on glass surfaces
// - Condensation/fog simulation
// - Tinting with gradient darkening
// - Edge vignetting and Fresnel effects
// - Defroster grid patterns
// - Self-cleaning hydrophobic coating simulation
// ====================================================================

import * as THREE from "three";

function hash21(x: number, y: number): number {
  const sin = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
  return sin - Math.floor(sin);
}

export interface GlassType {
  name: string;
  transmission: number;
  ior: number;
  thickness: number;
  color: THREE.Color;
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  envMapIntensity: number;
  defrosterLines: boolean;
  edgeDarkening: number;
  tintStrength: number;
  uvProtection: number;
}

export interface RainDropConfig {
  count: number;
  maxSize: number;
  minSize: number;
  flowSpeed: number;
  surfaceTension: number;
  streakLength: number;
}

export interface CondensationConfig {
  density: number;
  fogThickness: number;
  dropletSize: number;
  temperatureDelta: number;
  affectedArea: number;
}

export interface TintGradientConfig {
  enabled: boolean;
  topDarkness: number;
  bottomDarkness: number;
  leftDarkness: number;
  rightDarkness: number;
  fadeStart: number;
}

// --- 10+ GLASS TYPES ---
export const GLASS_TYPES: Record<string, GlassType> = {
  windshield: {
    name: "Windshield", transmission: 0.92, ior: 1.52, thickness: 0.006,
    color: new THREE.Color(0xe8f0f4), roughness: 0.02, metalness: 0,
    clearcoat: 0.8, clearcoatRoughness: 0.01, envMapIntensity: 2,
    defrosterLines: true, edgeDarkening: 0.3, tintStrength: 0.05, uvProtection: 0.95,
  },
  sideWindow: {
    name: "Side Window", transmission: 0.88, ior: 1.52, thickness: 0.004,
    color: new THREE.Color(0xd8e8ee), roughness: 0.01, metalness: 0,
    clearcoat: 0.6, clearcoatRoughness: 0.02, envMapIntensity: 1.8,
    defrosterLines: false, edgeDarkening: 0.2, tintStrength: 0.15, uvProtection: 0.90,
  },
  privacyRear: {
    name: "Privacy Rear", transmission: 0.42, ior: 1.54, thickness: 0.005,
    color: new THREE.Color(0x1a2830), roughness: 0.04, metalness: 0.15,
    clearcoat: 0.7, clearcoatRoughness: 0.015, envMapIntensity: 1.5,
    defrosterLines: true, edgeDarkening: 0.4, tintStrength: 0.6, uvProtection: 0.98,
  },
  headlightLens: {
    name: "Headlight Lens", transmission: 0.96, ior: 1.58, thickness: 0.003,
    color: new THREE.Color(0xf8fcff), roughness: 0.01, metalness: 0,
    clearcoat: 1.0, clearcoatRoughness: 0.005, envMapIntensity: 2.5,
    defrosterLines: false, edgeDarkening: 0.15, tintStrength: 0.0, uvProtection: 0.99,
  },
  taillightLens: {
    name: "Taillight Lens", transmission: 0.75, ior: 1.58, thickness: 0.003,
    color: new THREE.Color(0xff1828), roughness: 0.02, metalness: 0.05,
    clearcoat: 0.9, clearcoatRoughness: 0.008, envMapIntensity: 1.8,
    defrosterLines: false, edgeDarkening: 0.2, tintStrength: 0.0, uvProtection: 0.85,
  },
  panoramicRoof: {
    name: "Panoramic Roof", transmission: 0.7, ior: 1.52, thickness: 0.008,
    color: new THREE.Color(0x8ab0c0), roughness: 0.03, metalness: 0.1,
    clearcoat: 0.85, clearcoatRoughness: 0.012, envMapIntensity: 2.2,
    defrosterLines: true, edgeDarkening: 0.35, tintStrength: 0.25, uvProtection: 0.95,
  },
  polycarbonateLens: {
    name: "Polycarbonate Lens", transmission: 0.88, ior: 1.585, thickness: 0.002,
    color: new THREE.Color(0xf0f4ff), roughness: 0.015, metalness: 0,
    clearcoat: 1.0, clearcoatRoughness: 0.003, envMapIntensity: 2.8,
    defrosterLines: false, edgeDarkening: 0.1, tintStrength: 0.0, uvProtection: 0.99,
  },
  carbonTinted: {
    name: "Carbon Tinted", transmission: 0.35, ior: 1.53, thickness: 0.005,
    color: new THREE.Color(0x0a1018), roughness: 0.03, metalness: 0.1,
    clearcoat: 0.8, clearcoatRoughness: 0.01, envMapIntensity: 1.3,
    defrosterLines: false, edgeDarkening: 0.5, tintStrength: 0.75, uvProtection: 0.99,
  },
  fenderFlareSmoke: {
    name: "Fender Flare Smoke", transmission: 0.55, ior: 1.52, thickness: 0.003,
    color: new THREE.Color(0x2a2a30), roughness: 0.04, metalness: 0.08,
    clearcoat: 0.7, clearcoatRoughness: 0.02, envMapIntensity: 1.6,
    defrosterLines: false, edgeDarkening: 0.25, tintStrength: 0.45, uvProtection: 0.92,
  },
  turnSignalAmber: {
    name: "Turn Signal Amber", transmission: 0.8, ior: 1.56, thickness: 0.002,
    color: new THREE.Color(0xff8c00), roughness: 0.015, metalness: 0,
    clearcoat: 0.9, clearcoatRoughness: 0.008, envMapIntensity: 2.0,
    defrosterLines: false, edgeDarkening: 0.15, tintStrength: 0.0, uvProtection: 0.80,
  },
  mirrorGlass: {
    name: "Mirror Glass", transmission: 0.0, ior: 2.5, thickness: 0.003,
    color: new THREE.Color(0xd0d4dc), roughness: 0.01, metalness: 0.98,
    clearcoat: 0.0, clearcoatRoughness: 0, envMapIntensity: 3.0,
    defrosterLines: false, edgeDarkening: 0.1, tintStrength: 0.0, uvProtection: 0.95,
  },
  adaptiveTint: {
    name: "Adaptive Electrochromic", transmission: 0.5, ior: 1.52, thickness: 0.006,
    color: new THREE.Color(0x6080a0), roughness: 0.02, metalness: 0.05,
    clearcoat: 0.8, clearcoatRoughness: 0.01, envMapIntensity: 1.8,
    defrosterLines: true, edgeDarkening: 0.3, tintStrength: 0.4, uvProtection: 0.99,
  },
};

// --- GLASS REFRACTION SYSTEM ---
export class GlassRefractionSystem {
  public static createGlassMaterial(type: GlassType): THREE.MeshPhysicalMaterial {
    const mat = new THREE.MeshPhysicalMaterial({
      color: type.color,
      transmission: type.transmission,
      ior: type.ior,
      thickness: type.thickness,
      metalness: type.metalness,
      roughness: type.roughness,
      clearcoat: type.clearcoat,
      clearcoatRoughness: type.clearcoatRoughness,
      envMapIntensity: type.envMapIntensity,
      transparent: true,
      opacity: 1.0 - type.transmission * 0.7,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    if (type.defrosterLines) {
      mat.normalMap = this.generateDefrosterGrid();
    }
    if (type.edgeDarkening > 0) {
      mat.aoMap = this.generateEdgeVignette(type.edgeDarkening);
    }
    if (type.tintStrength > 0) {
      mat.roughnessMap = this.generateTintGradient(type.tintStrength);
    }
    mat.needsUpdate = true;
    return mat;
  }

  // --- DEFROSTER GRID ---
  public static generateDefrosterGrid(): THREE.DataTexture {
    const size = 128;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const u = x / size, v = y / size;
        let nx = 0, ny = 0, nz = 1;
        // Horizontal defroster wires
        if (Math.abs(Math.sin(u * 40)) > 0.97) { nx = 0.4; nz = 0.5; }
        // Vertical antenna wire
        if (Math.abs(Math.sin(v * 8)) > 0.95) { ny = 0.4; nz = 0.5; }
        // Connector pads at bottom
        if (v > 0.92 && (Math.abs(u - 0.15) < 0.02 || Math.abs(u - 0.85) < 0.02)) {
          nx = 0.6; nz = 0.3;
        }
        data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
        data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
        data[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
        data[idx + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
  }

  // --- EDGE VIGNETTE ---
  public static generateEdgeVignette(strength: number): THREE.DataTexture {
    const size = 256;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const d = Math.sqrt(Math.pow(x / size - 0.5, 2) + Math.pow(y / size - 0.5, 2)) * 2;
        const v = Math.floor((1 - Math.min(1, d * strength) * 0.5) * 255);
        data[idx] = v; data[idx + 1] = v; data[idx + 2] = v; data[idx + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
  }

  // --- TINT GRADIENT ---
  public static generateTintGradient(strength: number): THREE.DataTexture {
    const size = 256;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const u = x / size, v = y / size;
        // Top-to-bottom gradient (darker at top = strip tint)
        const topDark = Math.max(0, 1 - v * 3) * strength;
        // Center vignette
        const cx = u - 0.5, cy = v - 0.5;
        const vig = Math.sqrt(cx * cx + cy * cy) * 2 * strength * 0.3;
        const tint = Math.min(1, topDark + vig);
        const v8 = Math.floor(tint * 180);
        data[idx] = v8; data[idx + 1] = v8; data[idx + 2] = v8; data[idx + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
  }

  // --- RAIN DROPLET FORMATION ---
  public static generateRainDroplets(config: RainDropConfig): THREE.DataTexture {
    const size = 512;
    const data = new Uint8Array(size * size * 4);

    // Hash function for deterministic randomness
    const hash = (x: number, y: number) => {
      let h = x * 374761393 + y * 668265263;
      h = (h ^ (h >> 13)) * 1274126177;
      return ((h ^ (h >> 16)) & 0x7fffffff) / 0x7fffffff;
    };

    // Generate raindrop positions
    const drops: Array<{ cx: number; cy: number; r: number; vx: number; vy: number }> = [];
    for (let i = 0; i < config.count; i++) {
      drops.push({
        cx: hash(i * 7, 13) * size,
        cy: hash(i * 11, 17) * size,
        r: config.minSize + hash(i * 3, 23) * (config.maxSize - config.minSize),
        vx: (hash(i * 5, 31) - 0.5) * 0.3,
        vy: config.flowSpeed * (0.5 + hash(i * 9, 37) * 0.5),
      });
    }

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        let normalX = 0, normalY = 0, normalZ = 1;
        let isDrop = false;

        for (const drop of drops) {
          // Actual droplet position with flow
          const dx = x - drop.cx;
          const dy = y - (drop.cy + drop.vy * config.streakLength * 0.5);
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < drop.r) {
            // Within droplet — compute surface normal (sphere intersection)
            const ratio = dist / drop.r;
            const height = Math.sqrt(Math.max(0, 1 - ratio * ratio));
            normalX = -(dx / drop.r) * config.surfaceTension;
            normalY = -(dy / drop.r) * config.surfaceTension;
            normalZ = height;
            isDrop = true;
          } else if (dist < drop.r * 2.5) {
            // Near droplet — surface tension deformation ring
            const ringDist = (dist - drop.r) / drop.r;
            const ringHeight = Math.sin(ringDist * Math.PI) * 0.15 * (1 - ringDist);
            normalZ += ringHeight;
            isDrop = true;
          }

          // Rain streak trail
          const trailDy = y - drop.cy;
          if (trailDy > 0 && trailDy < config.streakLength && Math.abs(x - drop.cx - drop.vx * trailDy) < 1.5) {
            const trailFade = 1 - trailDy / config.streakLength;
            normalX += trailFade * 0.2;
            isDrop = true;
          }
        }

        if (isDrop) {
          const len = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ) || 1;
          data[idx] = Math.floor((normalX / len * 0.5 + 0.5) * 255);
          data[idx + 1] = Math.floor((normalY / len * 0.5 + 0.5) * 255);
          data[idx + 2] = Math.floor((normalZ / len * 0.5 + 0.5) * 255);
        } else {
          data[idx] = 128; data[idx + 1] = 128; data[idx + 2] = 255;
        }
        data[idx + 3] = 255;
      }
    }

    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    tex.needsUpdate = true;
    return tex;
  }

  // --- CONDENSATION / FOG ---
  public static generateCondensationMap(config: CondensationConfig): THREE.DataTexture {
    const size = 256;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const u = x / size, v = y / size;

        // Base fog layer
        let fog = config.fogThickness * 0.3;

        // Droplet clusters
        for (let d = 0; d < 20; d++) {
          const dx = hash21(d * 7, 13) * size;
          const dy = hash21(d * 11, 17) * size;
          const dist = Math.sqrt((x - dx) ** 2 + (y - dy) ** 2);
          if (dist < config.dropletSize * 8) {
            const h = Math.exp(-dist * dist / (config.dropletSize * config.dropletSize * 2));
            fog += h * config.density * 0.4;
          }
        }

        // Temperature gradient (heavier at bottom)
        fog += v * config.temperatureDelta * 0.15;

        // Edge concentration (glass edges fog more)
        const edgeDist = Math.min(u, 1 - u, v, 1 - v);
        if (edgeDist < 0.1) {
          fog += (1 - edgeDist / 0.1) * config.fogThickness * 0.3;
        }

        fog = Math.min(1, fog);
        const v8 = Math.floor(fog * 200);
        data[idx] = v8; data[idx + 1] = v8; data[idx + 2] = v8 + 15; data[idx + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
  }

  // --- HYDROPHOBIC WATER SHEET ---
  public static generateHydrophobicSheet(): THREE.DataTexture {
    const size = 256;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const u = x / size, v = y / size;
        // Beading pattern — water forms distinct beads on hydrophobic surface
        const beadX = Math.sin(u * 60) * Math.cos(v * 45);
        const beadY = Math.cos(u * 50) * Math.sin(v * 55);
        const bead = Math.exp(-(beadX * beadX + beadY * beadY) * 8);
        const v8 = Math.floor(bead * 180 + 20);
        data[idx] = 128; data[idx + 1] = 128;
        data[idx + 2] = v8; data[idx + 3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
  }

  // --- WIPER MARK PATTERN ---
  public static generateWiperMarks(): THREE.DataTexture {
    const size = 256;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const u = x / size, v = y / size;
        // Arc-shaped wiper path
        const cx = 0.5, cy = 1.2;
        const dist = Math.sqrt((u - cx) ** 2 + (v - cy) ** 2);
        const angle = Math.atan2(v - cy, u - cx);
        // Wiper arc sweep
        if (dist > 0.5 && dist < 0.7 && angle > -1.2 && angle < 0) {
          const w = Math.sin((dist - 0.5) / 0.2 * Math.PI);
          const v8 = Math.floor(w * 80);
          data[idx] = 128 + v8; data[idx + 1] = 128 + v8;
          data[idx + 2] = 128 + v8; data[idx + 3] = 255;
        } else {
          data[idx] = 128; data[idx + 1] = 128;
          data[idx + 2] = 255; data[idx + 3] = 255;
        }
      }
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
  }

  // --- FILM OF RAIN (WET GLASS AFFECT) ---
  public static createWetGlassOverlay(): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(1.2, 0.6);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x8ab0d0, transmission: 0.85, ior: 1.33,
      thickness: 0.001, roughness: 0.05, metalness: 0,
      transparent: true, opacity: 0.3, depthWrite: false,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = "WetGlassOverlay";
    return mesh;
  }

  // --- SCENE APPLICATION ---
  public static applyToScene(root: THREE.Object3D): void {
    const materials = new Map<string, THREE.MeshPhysicalMaterial>();
    materials.set("windshield", this.createGlassMaterial(GLASS_TYPES.windshield));
    materials.set("side", this.createGlassMaterial(GLASS_TYPES.sideWindow));
    materials.set("rear", this.createGlassMaterial(GLASS_TYPES.privacyRear));
    materials.set("headlight", this.createGlassMaterial(GLASS_TYPES.headlightLens));
    materials.set("taillight", this.createGlassMaterial(GLASS_TYPES.taillightLens));
    materials.set("panoramic", this.createGlassMaterial(GLASS_TYPES.panoramicRoof));
    materials.set("mirror", this.createGlassMaterial(GLASS_TYPES.mirrorGlass));
    materials.set("default", this.createGlassMaterial(GLASS_TYPES.sideWindow));

    root.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) return;
      const mesh = node as THREE.Mesh;
      const n = mesh.name.toLowerCase();
      if (n.includes("windshield")) mesh.material = materials.get("windshield")!;
      else if (n.includes("panoramic")) mesh.material = materials.get("panoramic")!;
      else if (n.includes("side") && n.includes("glass")) mesh.material = materials.get("side")!;
      else if (n.includes("rear") && n.includes("glass")) mesh.material = materials.get("rear")!;
      else if (n.includes("headlight") && n.includes("lens")) mesh.material = materials.get("headlight")!;
      else if (n.includes("taillight") && n.includes("lens")) mesh.material = materials.get("taillight")!;
      else if (n.includes("mirror") && n.includes("glass")) mesh.material = materials.get("mirror")!;
      else if (n.includes("glass") || n.includes("window")) mesh.material = materials.get("default")!;
    });
  }

  // --- WEATHER-CONDITIONED APPLICATION ---
  public static applyWeatherCondition(
    root: THREE.Object3D,
    condition: "clear" | "rain" | "fog" | "frost" | "condensation"
  ): void {
    root.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) return;
      const mesh = node as THREE.Mesh;
      const n = mesh.name.toLowerCase();
      if (!n.includes("glass") && !n.includes("window") && !n.includes("windshield")) return;
      const mat = mesh.material as THREE.MeshPhysicalMaterial;
      if (!mat.isMeshPhysicalMaterial) return;

      switch (condition) {
        case "rain":
          mat.normalMap = this.generateRainDroplets({ count: 200, maxSize: 6, minSize: 1, flowSpeed: 2, surfaceTension: 0.7, streakLength: 40 });
          mat.normalScale.set(0.3, 0.3);
          mat.roughness = Math.max(mat.roughness, 0.15);
          break;
        case "fog":
          mat.normalMap = this.generateCondensationMap({ density: 0.8, fogThickness: 0.6, dropletSize: 8, temperatureDelta: 0.5, affectedArea: 0.8 });
          mat.normalScale.set(0.2, 0.2);
          mat.roughness = Math.max(mat.roughness, 0.3);
          mat.transmission = mat.transmission * 0.6;
          break;
        case "frost":
          mat.normalMap = this.generateCondensationMap({ density: 0.9, fogThickness: 0.8, dropletSize: 3, temperatureDelta: 0.8, affectedArea: 1.0 });
          mat.normalScale.set(0.4, 0.4);
          mat.roughness = 0.5;
          mat.transmission = mat.transmission * 0.3;
          mat.color = new THREE.Color(0xd0e8f0);
          break;
        case "condensation":
          mat.normalMap = this.generateCondensationMap({ density: 0.4, fogThickness: 0.3, dropletSize: 5, temperatureDelta: 0.3, affectedArea: 0.5 });
          mat.normalScale.set(0.15, 0.15);
          mat.transmission = mat.transmission * 0.75;
          break;
        case "clear":
        default:
          mat.normalMap = null;
          mat.roughness = 0.02;
          mat.transmission = 0.92;
          break;
      }
      mat.needsUpdate = true;
    });
  }
}
