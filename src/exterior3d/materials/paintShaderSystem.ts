// ===================================================================
// MULTI-LAYER AUTOMOTIVE PAINT SHADER SYSTEM (GLSL EXTENSIONS)
// ===================================================================

import * as THREE from "three";
import type { PaintSystemConfig } from "../../sim/types/exterior";

export function createProceduralFlakeNormalMap(): THREE.DataTexture {
  const size = 128;
  const data = new Uint8Array(size * size * 4);

  for (let i = 0; i < size * size * 4; i += 4) {
    const nx = Math.random() * 255;
    const ny = Math.random() * 255;
    const nz = 200 + Math.random() * 55;

    data[i] = nx;
    data[i + 1] = ny;
    data[i + 2] = nz;
    data[i + 3] = 255;
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  texture.needsUpdate = true;
  return texture;
}
