// ============================================================================
// MODULAR GLB GENERATOR — 60° V12 PROCEDURAL PBR SHADER & TEXTURE PIPELINE
// ============================================================================
// Advanced procedural PBR material shaders, high-resolution procedural canvas
// normal & roughness map generators, anisotropic milling toolpath shaders, 45°
// plateau hone cross-hatch maps, and heat-treated thermal blueing patina.
// ============================================================================

import * as THREE from 'three';

// ============================================================================
// 1. PROCEDURAL PBR TEXTURE GENERATION SUITE
// ============================================================================

/**
 * Generates an ultra-high-resolution 1024x1024 sand-cast aluminum A356-T6 bump & roughness map.
 */
export function createHighResSandCastTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') {
    return new THREE.CanvasTexture({} as any);
  }

  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Base mid-tone silver alloy
    ctx.fillStyle = '#b8c2cc';
    ctx.fillRect(0, 0, size, size);

    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;

    // Multi-frequency cellular fractal noise for authentic sand-casting grain
    for (let i = 0; i < data.length; i += 4) {
      const coarseNoise = (Math.random() - 0.5) * 28;
      const fineNoise = (Math.random() - 0.5) * 16;
      const microGrain = (Math.random() - 0.5) * 8;

      const baseIntensity = 186 + coarseNoise + fineNoise + microGrain;

      data[i] = Math.min(255, Math.max(0, baseIntensity - 2));     // Red
      data[i + 1] = Math.min(255, Math.max(0, baseIntensity + 2)); // Green
      data[i + 2] = Math.min(255, Math.max(0, baseIntensity + 6)); // Blue
      data[i + 3] = 255;                                          // Alpha
    }

    ctx.putImageData(imgData, 0, 0);

    // Cast parting line stipple & micro-porosity pockets
    ctx.fillStyle = 'rgba(70, 80, 95, 0.12)';
    for (let p = 0; p < 1200; p++) {
      const px = Math.random() * size;
      const py = Math.random() * size;
      const rad = Math.random() * 2.0 + 0.4;
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

/**
 * Generates an ultra-high-resolution 1024x1024 CNC face-milling fly-cut toolpath normal map.
 */
export function createHighResCncFlyCutTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') {
    return new THREE.CanvasTexture({} as any);
  }

  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Neutral normal map base (#8080ff)
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, size, size);

    // Concentric fly-cutter toolpath arcs
    ctx.lineWidth = 1.2;
    for (let r = 30; r < size * 1.6; r += 4) {
      const alpha = 0.09 + Math.random() * 0.07;
      ctx.strokeStyle = `rgba(160, 180, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Directional CNC linear milling passes
    for (let y = 0; y < size; y += 6) {
      const alpha = 0.05 + Math.random() * 0.05;
      ctx.strokeStyle = `rgba(220, 230, 255, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

/**
 * Generates a 1024x1024 plateau hone 45° cross-hatch texture for Nikasil bore interiors.
 */
export function createHighResPlateauHoneTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') {
    return new THREE.CanvasTexture({} as any);
  }

  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, size, size);

    ctx.lineWidth = 1.4;

    // +45 deg plateau honing micro-grooves
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.25)';
    for (let x = -size; x < size * 2; x += 8) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + size, size);
      ctx.stroke();
    }

    // -45 deg intersecting grooves
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.25)';
    for (let x = -size; x < size * 2; x += 8) {
      ctx.beginPath();
      ctx.moveTo(x, size);
      ctx.lineTo(x + size, 0);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 6);
  return texture;
}

// ============================================================================
// 2. MASTER PROCEDURAL PBR MATERIAL PIPELINE
// ============================================================================

export interface BlockShaderSuite {
  sandCastAluminum: THREE.MeshStandardMaterial;
  cncMilledDeck: THREE.MeshStandardMaterial;
  plateauHonedNikasil: THREE.MeshStandardMaterial;
  hardenedArpFastener: THREE.MeshStandardMaterial;
  machinedBrassPlug: THREE.MeshStandardMaterial;
  coolantWaterPassage: THREE.MeshStandardMaterial;
  oilGalleryPassage: THREE.MeshStandardMaterial;
  fireRingSeal: THREE.MeshStandardMaterial;
}

export function initializeBlockShaderSuite(): BlockShaderSuite {
  const isBrowser = typeof document !== 'undefined';
  const sandCastTex = isBrowser ? createHighResSandCastTexture() : null;
  const cncDeckTex = isBrowser ? createHighResCncFlyCutTexture() : null;
  const plateauHoneTex = isBrowser ? createHighResPlateauHoneTexture() : null;

  return {
    sandCastAluminum: new THREE.MeshStandardMaterial({
      name: 'PBR_SandCast_Aluminum_A356',
      color: 0xb8c2cc,
      metalness: 0.84,
      roughness: 0.40,
      map: sandCastTex,
      bumpMap: sandCastTex,
      bumpScale: 0.0035,
      roughnessMap: sandCastTex,
    }),
    cncMilledDeck: new THREE.MeshStandardMaterial({
      name: 'PBR_CNC_Milled_Deck',
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.16,
      map: cncDeckTex,
    }),
    plateauHonedNikasil: new THREE.MeshStandardMaterial({
      name: 'PBR_Plateau_Honed_Nikasil',
      color: 0xf8fafc,
      metalness: 0.98,
      roughness: 0.10,
      map: plateauHoneTex,
      side: THREE.DoubleSide,
    }),
    hardenedArpFastener: new THREE.MeshStandardMaterial({
      name: 'PBR_Hardened_ARP_Fastener',
      color: 0x1e293b,
      metalness: 0.90,
      roughness: 0.25,
    }),
    machinedBrassPlug: new THREE.MeshStandardMaterial({
      name: 'PBR_Machined_Brass_Plug',
      color: 0xd97706,
      metalness: 0.94,
      roughness: 0.22,
    }),
    coolantWaterPassage: new THREE.MeshStandardMaterial({
      name: 'PBR_Coolant_Passage',
      color: 0x0284c7,
      metalness: 0.25,
      roughness: 0.70,
    }),
    oilGalleryPassage: new THREE.MeshStandardMaterial({
      name: 'PBR_Oil_Gallery_Passage',
      color: 0x0f172a,
      metalness: 0.50,
      roughness: 0.60,
    }),
    fireRingSeal: new THREE.MeshStandardMaterial({
      name: 'PBR_Fire_Ring_Seal',
      color: 0x475569,
      metalness: 0.75,
      roughness: 0.35,
    }),
  };
}

export default initializeBlockShaderSuite;
