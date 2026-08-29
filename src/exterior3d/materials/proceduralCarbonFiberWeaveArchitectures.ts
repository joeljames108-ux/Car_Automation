/**
 * ============================================================================
 * PROCEDURAL CARBON FIBER WEAVE ARCHITECTURES ENGINE
 * ============================================================================
 * Synthesizes photorealistic multi-axial composite carbon fiber materials & normal maps:
 *
 * 1. 2x2 Twill Weave (Standard 3k motorsport weave with diagonal reflection banding)
 * 2. 1x1 Plain Weave (Square checkerboard high-modulus carbon)
 * 3. Spread-Tow Biaxial Fabric (Wide 20mm ultra-flat aerospace carbon ribbons)
 * 4. Forged Carbon Composite (Chopped multi-directional graphite flakes in epoxy matrix)
 * 5. Jacquard Diamond Custom Weave (Intricate hypercar bespoke textile patterns)
 * 6. Colored Resin Clearcoat Tinting (Royal Blue, Ruby, Emerald, Champagne Gold)
 * ============================================================================
 */

import * as THREE from "three";

export type CarbonWeavePattern =
  | "TWILL_2X2_3K"
  | "PLAIN_WEAVE_1X1"
  | "SPREAD_TOW_BIAXIAL"
  | "FORGED_COMPOSITE_CHOPPED"
  | "JACQUARD_DIAMOND";

export interface CarbonWeaveSpec {
  pattern: CarbonWeavePattern;
  resinTintHex: string; // e.g. "#000000" for raw carbon, or "#003366" for deep sapphire blue carbon
  clearcoatGloss: number; // 0.0 to 1.0 (Matte vs High-Gloss Wet Carbon)
  anisotropyStrength: number; // Specular directional sheen
  weaveScale: number; // UV Repeat count (e.g. 32)
}

export class ProceduralCarbonFiberWeaveArchitectures {
  /**
   * Creates a High-Fidelity Carbon Physical Material with Procedural Textures.
   */
  public static createCarbonFiberMaterial(spec: CarbonWeaveSpec): THREE.MeshPhysicalMaterial {
    const normalMap = this.generateWeaveNormalMap(spec.pattern);
    const roughnessMap = this.generateWeaveRoughnessMap(spec.pattern);

    const baseColor = new THREE.Color(spec.resinTintHex);
    // Darken tint to represent deep carbon graphite core with surface chroma
    baseColor.multiplyScalar(0.35);

    const mat = new THREE.MeshPhysicalMaterial({
      color: baseColor,
      roughness: 0.28,
      metalness: 0.82,
      clearcoat: spec.clearcoatGloss,
      clearcoatRoughness: 0.08 + (1 - spec.clearcoatGloss) * 0.4,
      normalMap,
      roughnessMap,
      reflectivity: 0.95,
      anisotropy: spec.anisotropyStrength,
    });

    if (normalMap) {
      normalMap.repeat.set(spec.weaveScale, spec.weaveScale);
      normalMap.wrapS = THREE.RepeatWrapping;
      normalMap.wrapT = THREE.RepeatWrapping;
    }

    return mat;
  }

  /**
   * Synthesizes 256x256 Watertight Tangent-Space Normal Map for Weave Patterns.
   */
  public static generateWeaveNormalMap(pattern: CarbonWeavePattern): THREE.Texture {
    if (typeof document === "undefined") {
      const data = new Uint8Array([128, 128, 255, 255]);
      const texture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
      texture.needsUpdate = true;
      return texture;
    }

    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const imgData = ctx.createImageData(size, size);
      const data = imgData.data;

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          let nx = 128;
          let ny = 128;

          if (pattern === "TWILL_2X2_3K") {
            // 2x2 diagonal step pattern
            const cell = ((Math.floor(x / 16) + Math.floor(y / 16)) % 4);
            const isHorizontal = cell < 2;
            const u = (x % 16) / 16;
            const v = (y % 16) / 16;

            if (isHorizontal) {
              ny = Math.floor(128 + Math.sin(v * Math.PI * 2) * 55);
              nx = 128;
            } else {
              nx = Math.floor(128 + Math.sin(u * Math.PI * 2) * 55);
              ny = 128;
            }
          } else if (pattern === "PLAIN_WEAVE_1X1") {
            const isH = (Math.floor(x / 16) + Math.floor(y / 16)) % 2 === 0;
            const u = (x % 16) / 16;
            const v = (y % 16) / 16;
            nx = isH ? Math.floor(128 + Math.sin(u * Math.PI * 2) * 60) : 128;
            ny = !isH ? Math.floor(128 + Math.sin(v * Math.PI * 2) * 60) : 128;
          } else if (pattern === "SPREAD_TOW_BIAXIAL") {
            // Large 64px flat ribbon tiles
            const isH = (Math.floor(x / 64) + Math.floor(y / 64)) % 2 === 0;
            nx = isH ? 140 : 116;
            ny = !isH ? 140 : 116;
          } else if (pattern === "FORGED_COMPOSITE_CHOPPED") {
            // Procedural Voronoi-like random angle flake normal distribution
            const noise = Math.sin(x * 0.15) * Math.cos(y * 0.15);
            nx = Math.floor(128 + noise * 45);
            ny = Math.floor(128 + Math.cos(x * 0.2 + y * 0.1) * 45);
          } else {
            // JACQUARD DIAMOND
            const dist = Math.abs((x % 32) - 16) + Math.abs((y % 32) - 16);
            nx = Math.floor(128 + Math.sin(dist * 0.4) * 40);
            ny = Math.floor(128 + Math.cos(dist * 0.4) * 40);
          }

          data[idx] = Math.max(0, Math.min(255, nx));
          data[idx + 1] = Math.max(0, Math.min(255, ny));
          data[idx + 2] = 255; // Upward Z
          data[idx + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  /**
   * Synthesizes 256x256 Roughness Map for Dynamic Surface Specularity.
   */
  public static generateWeaveRoughnessMap(pattern: CarbonWeavePattern): THREE.Texture {
    if (typeof document === "undefined") {
      const data = new Uint8Array([70, 70, 70, 255]);
      const texture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
      texture.needsUpdate = true;
      return texture;
    }

    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.fillStyle = "#333333";
      ctx.fillRect(0, 0, size, size);

      if (pattern === "FORGED_COMPOSITE_CHOPPED") {
        // Multi-toned flake patches
        for (let i = 0; i < 350; i++) {
          const fx = Math.random() * size;
          const fy = Math.random() * size;
          const w = 12 + Math.random() * 24;
          const h = 8 + Math.random() * 16;
          const b = Math.floor(40 + Math.random() * 80);
          ctx.fillStyle = `rgb(${b},${b},${b})`;
          ctx.fillRect(fx, fy, w, h);
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }
}
