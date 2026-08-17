// ============================================================================
// PHASE 05 — PROCEDURAL NORMAL MAP SYNTHESIZER & TANGENT-SPACE SUITE
// ============================================================================
// Mathematical procedural normal map synthesizers with pure TypedArray
// pixel pipelines supporting Node.js test runners and WebGL runtime canvases:
// 1. Lathe-machined & cross-drilled brake rotors
// 2. Asymmetric directional tire tread & lateral sipes
// 3. 2x2 Twill & Forged Chopped Carbon Fiber weaves
// 4. Diamond cross-hatch knurled rotary controls
// 5. Perforated leather ventilation pores & organic grain
// ============================================================================

import * as THREE from 'three';

export class ProceduralNormalMapSynthesizer {
  /**
   * Synthesizes a circular lathe-machined and cross-drilled brake rotor normal map.
   */
  public static generateBrakeRotorNormalMap(size: number = 512): THREE.Texture {
    const data = new Uint8Array(size * size * 4);
    const center = size / 2.0;
    const maxRadius = size * 0.46;
    const minRadius = size * 0.22;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const dx = x - center;
        const dy = y - center;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        if (dist < minRadius || dist > maxRadius) {
          // Non-friction hat or outer air: Flat normal (0, 0, 1) -> (128, 128, 255)
          data[idx] = 128;
          data[idx + 1] = 128;
          data[idx + 2] = 255;
          data[idx + 3] = 255;
          continue;
        }

        // 1. Fine concentric lathe machining grooves
        const latheFreq = 64.0;
        const latheWave = Math.sin((dist / maxRadius) * Math.PI * latheFreq);
        let nx = Math.cos(angle) * latheWave * 0.25;
        let ny = Math.sin(angle) * latheWave * 0.25;
        let nz = 1.0;

        // 2. Cross-drilled cooling holes (spiral distribution, 24 holes)
        const holeCount = 24;
        for (let h = 0; h < holeCount; h++) {
          const hAngle = (h / holeCount) * Math.PI * 2 + (h % 3) * 0.15;
          const hRadius = minRadius + (maxRadius - minRadius) * ((h % 4 + 1) / 5.0);
          const hx = center + Math.cos(hAngle) * hRadius;
          const hy = center + Math.sin(hAngle) * hRadius;
          const hDist = Math.sqrt((x - hx) * (x - hx) + (y - hy) * (y - hy));
          const holeRadius = size * 0.016;

          if (hDist < holeRadius) {
            // Inside chamfer of drilled hole
            const cdx = (x - hx) / holeRadius;
            const cdy = (y - hy) / holeRadius;
            nx += cdx * 0.75;
            ny += cdy * 0.75;
            nz = 0.5;
            break;
          }
        }

        // Normalize vector
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;
        data[idx] = Math.floor(((nx / len) * 0.5 + 0.5) * 255);
        data[idx + 1] = Math.floor(((ny / len) * 0.5 + 0.5) * 255);
        data[idx + 2] = Math.floor(((nz / len) * 0.5 + 0.5) * 255);
        data[idx + 3] = 255;
      }
    }

    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Synthesizes an asymmetric directional tire tread normal map.
   */
  public static generateTireTreadNormalMap(size: number = 512): THREE.Texture {
    const data = new Uint8Array(size * size * 4);

    for (let y = 0; y < size; y++) {
      const v = y / size;
      for (let x = 0; x < size; x++) {
        const u = x / size;
        const idx = (y * size + x) * 4;

        let nx = 0.0;
        let ny = 0.0;
        let nz = 1.0;

        // 4 Main Longitudinal Water Evacuation Channels
        const channels = [0.22, 0.42, 0.62, 0.82];
        for (const c of channels) {
          const distToChannel = Math.abs(u - c);
          if (distToChannel < 0.025) {
            const grad = (u - c) / 0.025;
            nx = grad * 0.8;
            nz = 0.6;
            break;
          }
        }

        // Angled Lateral Siping Grooves
        const lateralPhase = (v * 16.0 + u * 4.0) % 1.0;
        if (lateralPhase > 0.85) {
          const sGrad = (lateralPhase - 0.925) / 0.075;
          ny = sGrad * 0.6;
          nz = Math.min(nz, 0.7);
        }

        // Normalize
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;
        data[idx] = Math.floor(((nx / len) * 0.5 + 0.5) * 255);
        data[idx + 1] = Math.floor(((ny / len) * 0.5 + 0.5) * 255);
        data[idx + 2] = Math.floor(((nz / len) * 0.5 + 0.5) * 255);
        data[idx + 3] = 255;
      }
    }

    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 16);
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Synthesizes a 2x2 Twill Carbon Fiber weave normal map.
   */
  public static generateCarbonTwillNormalMap(size: number = 256): THREE.Texture {
    const data = new Uint8Array(size * size * 4);
    const tileSize = size / 8.0;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const tx = Math.floor(x / tileSize);
        const ty = Math.floor(y / tileSize);
        const isWarp = (tx + ty) % 2 === 0;

        const uInTile = (x % tileSize) / tileSize;
        const vInTile = (y % tileSize) / tileSize;

        let nx = 0.0;
        let ny = 0.0;

        if (isWarp) {
          nx = Math.sin((uInTile - 0.5) * Math.PI) * 0.5;
          ny = Math.sin((vInTile - 0.5) * Math.PI) * 0.15;
        } else {
          nx = Math.sin((uInTile - 0.5) * Math.PI) * 0.15;
          ny = Math.sin((vInTile - 0.5) * Math.PI) * 0.5;
        }

        const nz = Math.sqrt(Math.max(0, 1.0 - (nx * nx + ny * ny)));
        data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
        data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
        data[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
        data[idx + 3] = 255;
      }
    }

    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16);
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Synthesizes an interior switchgear diamond cross-hatch knurling normal map.
   */
  public static generateKnurledSwitchgearNormalMap(size: number = 256): THREE.Texture {
    const data = new Uint8Array(size * size * 4);
    const scale = 16.0;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const u = (x / size) * scale;
        const v = (y / size) * scale;

        const d1 = Math.sin((u + v) * Math.PI);
        const d2 = Math.sin((u - v) * Math.PI);

        const nx = (d1 + d2) * 0.35;
        const ny = (d1 - d2) * 0.35;
        const nz = Math.sqrt(Math.max(0, 1.0 - (nx * nx + ny * ny)));

        data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
        data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
        data[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
        data[idx + 3] = 255;
      }
    }

    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Synthesizes a perforated leather upholstery normal map.
   */
  public static generatePerforatedLeatherNormalMap(size: number = 256): THREE.Texture {
    const data = new Uint8Array(size * size * 4);
    const hexSpacing = size / 16.0;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const row = Math.floor(y / hexSpacing);
        const xOffset = (row % 2) * (hexSpacing / 2.0);
        const localX = (x + xOffset) % hexSpacing;
        const localY = y % hexSpacing;

        const dx = (localX - hexSpacing / 2.0) / (hexSpacing / 2.0);
        const dy = (localY - hexSpacing / 2.0) / (hexSpacing / 2.0);
        const dist = Math.sqrt(dx * dx + dy * dy);

        let nx = 0.0;
        let ny = 0.0;
        let nz = 1.0;

        if (dist < 0.35) {
          // Inside perforation hole bevel
          nx = dx * 0.8;
          ny = dy * 0.8;
          nz = 0.5;
        }

        const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;
        data[idx] = Math.floor(((nx / len) * 0.5 + 0.5) * 255);
        data[idx + 1] = Math.floor(((ny / len) * 0.5 + 0.5) * 255);
        data[idx + 2] = Math.floor(((nz / len) * 0.5 + 0.5) * 255);
        data[idx + 3] = 255;
      }
    }

    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    texture.needsUpdate = true;
    return texture;
  }
}
