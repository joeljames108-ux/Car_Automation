// ============================================================================
// MODULAR GLB/glTF ENGINE ASSEMBLY — PHYSICAL PBR MATERIAL SYSTEM
// ============================================================================
// High-performance Three.js PBR material library, procedural micro-texture
// generation, dynamic variant interpolation, selection highlight shaders,
// wireframe overlays, transmissive glass physics, and GPU resource lifecycle.
// ============================================================================

import * as THREE from 'three';
import type { MaterialVariantVisual } from '../types';
import type { EngineConfig } from '../../sim/types';

/** Generates anisotropic brushed metal normal map with radial grain. */
function genAnisoBrushed(size: number = 512): HTMLCanvasElement {
  const cv = document.createElement("canvas"); cv.width = cv.height = size;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = "#8080ff"; ctx.fillRect(0, 0, size, size);
  const cx = size / 2, cy = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x += 2) {
      const a = Math.atan2(y - cy, x - cx), d = Math.hypot(x - cx, y - cy);
      const v = Math.sin(a * 120 + d * 0.3) * 0.12 + (Math.random() - 0.5) * 0.04;
      ctx.fillStyle = "rgb(" + (128 + v * 60 | 0) + ",128,255)";
      ctx.fillRect(x, y, 2, 1);
    }
  }
  return cv;
}

/** Generates embossed foil thermal blanket texture. */
function genEmbossedFoil(size: number = 256): HTMLCanvasElement {
  const cv = document.createElement("canvas"); cv.width = cv.height = size;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = "#808080"; ctx.fillRect(0, 0, size, size);
  const id = ctx.getImageData(0, 0, size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const dx2 = (x % 32) - 16, dy2 = (y % 32) - 16;
      const e = Math.max(0, 1 - Math.hypot(dx2, dy2) / 16) * 40;
      const v = Math.min(255, Math.max(0, 128 + e + (Math.random() - 0.5) * 15));
      id.data[i] = id.data[i+1] = id.data[i+2] = v;
    }
  }
  ctx.putImageData(id, 0, 0);
  return cv;
}


// ============================================================================
// 1. PROCEDURAL TEXTURE GENERATION UTILITIES
// ============================================================================

/**
 * Generates a seamless 2x2 twill dry carbon fiber normal/roughness pattern.
 */
export function generateCarbonFiberCanvas(size: number = 256): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, size, size);

  const tileSize = size / 16;
  for (let x = 0; x < size; x += tileSize) {
    for (let y = 0; y < size; y += tileSize) {
      const isAlt = ((x / tileSize) + (y / tileSize)) % 2 === 0;
      ctx.fillStyle = isAlt ? '#1a1008' : '#334155';
      ctx.fillRect(x, y, tileSize, tileSize);

      // Micro-weave diagonal gradient
      const grad = ctx.createLinearGradient(x, y, x + tileSize, y + tileSize);
      grad.addColorStop(0, isAlt ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.15)');
      grad.addColorStop(1, isAlt ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.08)');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, tileSize, tileSize);
    }
  }

  return canvas;
}

/**
 * Generates a machined brushed billet micro-grain normal map pattern.
 */
export function generateBrushedMetalCanvas(size: number = 256): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = '#8080ff'; // Neutral normal map base
  ctx.fillRect(0, 0, size, size);

  // Horizontal micro-groove striations
  for (let y = 0; y < size; y += 2) {
    const intensity = Math.sin((y / size) * Math.PI * 32) * 0.15 + (Math.random() - 0.5) * 0.08;
    const r = Math.floor(128 + intensity * 60);
    const g = 128;
    const b = 255;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, y, size, 2);
  }

  return canvas;
}

/**
 * Generates a cast iron micro-stippling bump canvas.
 */
export function generateCastIronCanvas(size: number = 256): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 40;
    const val = Math.min(255, Math.max(0, 128 + noise));
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

// ============================================================================
// 2. MASTER PBR MATERIAL LIBRARY
// ============================================================================

export class EngineMaterialLibrary {
  private static instance: EngineMaterialLibrary;
  private materialCache: Map<string, THREE.Material> = new Map();
  private textureCache: Map<string, THREE.Texture> = new Map();

  private constructor() {
    this.initProceduralTextures();
  }

  public static getInstance(): EngineMaterialLibrary {
    if (!EngineMaterialLibrary.instance) {
      EngineMaterialLibrary.instance = new EngineMaterialLibrary();
    }
    return EngineMaterialLibrary.instance;
  }

  private initProceduralTextures(): void {
    if (typeof document === 'undefined') return;

    try {
      const carbonCanvas = generateCarbonFiberCanvas(256);
      const carbonTexture = new THREE.CanvasTexture(carbonCanvas);
      carbonTexture.wrapS = THREE.RepeatWrapping;
      carbonTexture.wrapT = THREE.RepeatWrapping;
      carbonTexture.repeat.set(8, 8);
      this.textureCache.set('carbon_fiber', carbonTexture);

      const brushedCanvas = generateBrushedMetalCanvas(256);
      const brushedTexture = new THREE.CanvasTexture(brushedCanvas);
      brushedTexture.wrapS = THREE.RepeatWrapping;
      brushedTexture.wrapT = THREE.RepeatWrapping;
      brushedTexture.repeat.set(4, 4);
      this.textureCache.set('brushed_metal', brushedTexture);

      const castCanvas = generateCastIronCanvas(256);
      const castTexture = new THREE.CanvasTexture(castCanvas);
      castTexture.wrapS = THREE.RepeatWrapping;
      castTexture.wrapT = THREE.RepeatWrapping;
      castTexture.repeat.set(6, 6);
      this.textureCache.set('cast_iron', castTexture);
      try { const cv = genAnisoBrushed(512); const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4,4); this.textureCache.set("anisotropic_brushed", t); } catch {}
      try { const cv = genEmbossedFoil(256); const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6,6); this.textureCache.set("embossed_foil", t); } catch {}
    } catch (err) {
      console.warn('[EngineMaterialLibrary] Procedural canvas texture generation skipped:', err);
    }
  }

  // ─── 2.1 BASE MATERIAL PRESET CREATORS ───

  public getCastIron(): THREE.MeshPhysicalMaterial {
    const key = 'base_cast_iron';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Heavy_Duty_Ductile_Cast_Iron',
        color: new THREE.Color(0x51586a),
        metalness: 0.82,
        roughness: 0.34,
        roughnessMap: this.textureCache.get('cast_iron') || null,
        bumpMap: this.textureCache.get('cast_iron') || null,
        bumpScale: 0.015,
        envMapIntensity: 2.0,
        clearcoat: 0.15,
        clearcoatRoughness: 0.6,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getTitaniumAerospace(): THREE.MeshPhysicalMaterial {
    const key = 'base_titanium_aerospace';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Ti_6Al_4V_Aerospace_Titanium',
        color: new THREE.Color(0xc4b5fd),
        metalness: 0.92,
        roughness: 0.15,
        normalMap: this.textureCache.get('brushed_metal') || null,
        normalScale: new THREE.Vector2(0.15, 0.15),
        envMapIntensity: 2.4,
        clearcoat: 0.4,
        clearcoatRoughness: 0.08,
        sheen: 0.15,
        sheenColor: new THREE.Color(0xa5b4fc),
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getForgedSteel(): THREE.MeshPhysicalMaterial {
    const key = 'base_forged_steel';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Forged_4340_Chromoly_Steel',
        color: new THREE.Color(0xcfd8dc),
        metalness: 0.90,
        roughness: 0.18,
        envMapIntensity: 2.2,
        clearcoat: 0.35,
        clearcoatRoughness: 0.1,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getCastAluminum(): THREE.MeshPhysicalMaterial {
    const key = 'base_cast_aluminum';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Cast_Magnesium_Aluminum',
        color: new THREE.Color(0x9aa4b2),
        metalness: 0.86,
        roughness: 0.30,
        roughnessMap: this.textureCache.get('cast_iron') || null,
        envMapIntensity: 2.2,
        clearcoat: 0.2,
        clearcoatRoughness: 0.3,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getMachinedBillet(): THREE.MeshPhysicalMaterial {
    const key = 'base_machined_billet';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Machined_Billet_Surface',
        color: new THREE.Color(0xe2e8f0),
        metalness: 0.94,
        roughness: 0.12,
        normalMap: this.textureCache.get('anisotropic_brushed') || this.textureCache.get('brushed_metal') || null,
        normalScale: new THREE.Vector2(0.25, 0.25),
        envMapIntensity: 2.5,
        clearcoat: 0.5,
        clearcoatRoughness: 0.05,
        sheen: 0.2,
        sheenColor: new THREE.Color(0xd1d5db),
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getNitridedCrank(): THREE.MeshPhysicalMaterial {
    const key = 'base_nitrided_crank';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Forged_Nitrided_Steel',
        color: new THREE.Color(0xd4dce8),
        metalness: 0.95,
        roughness: 0.14,
        envMapIntensity: 2.4,
        clearcoat: 0.6,
        clearcoatRoughness: 0.03,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getGoldAnodized(): THREE.MeshPhysicalMaterial {
    const key = 'base_gold_anodized';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Billet_Gold_Anodized',
        color: new THREE.Color(0xf0a028),
        metalness: 0.90,
        roughness: 0.22,
        envMapIntensity: 2.2,
        clearcoat: 0.7,
        clearcoatRoughness: 0.05,
        sheen: 0.12,
        sheenColor: new THREE.Color(0xfcd34d),
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getCobaltAnodized(): THREE.MeshPhysicalMaterial {
    const key = 'base_cobalt_anodized';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Apex_Cobalt_Blue_Anodized',
        color: new THREE.Color(0x0284c7),
        metalness: 0.88,
        roughness: 0.18,
        envMapIntensity: 1.8,
        clearcoat: 0.7,
        clearcoatRoughness: 0.04,
        sheen: 0.15,
        sheenColor: new THREE.Color(0xfbbf24),
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getCeramicIntake(): THREE.MeshPhysicalMaterial {
    const key = 'base_ceramic_intake';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Thermal_Barrier_Ceramic_White',
        color: new THREE.Color(0xf8fafc),
        metalness: 0.20,
        roughness: 0.35,
        envMapIntensity: 0.9,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2,
        sheen: 0.1,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getInconelExhaust(): THREE.MeshPhysicalMaterial {
    const key = 'base_inconel_exhaust';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Inconel_625_Heat_Tinted_Gold',
        color: new THREE.Color(0xd97706),
        metalness: 0.92,
        roughness: 0.24,
        envMapIntensity: 1.6,
        clearcoat: 0.4,
        clearcoatRoughness: 0.08,
        sheen: 0.12,
        sheenColor: new THREE.Color(0xfbbf24),
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getDryCarbonFiber(): THREE.MeshPhysicalMaterial {
    const key = 'base_dry_carbon_fiber';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Autoclaved_2x2_Twill_Dry_Carbon',
        color: new THREE.Color(0x1e293b),
        metalness: 0.35,
        roughness: 0.32,
        roughnessMap: this.textureCache.get('carbon_fiber') || null,
        envMapIntensity: 1.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        sheen: 0.15,
        sheenColor: new THREE.Color(0x475569),
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getQuartzGlass(): THREE.MeshPhysicalMaterial {
    const key = 'base_quartz_glass';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Quartz_ITB_Inspection_Glass',
        color: new THREE.Color(0xfbbf24),
        metalness: 0.10,
        roughness: 0.05,
        transmission: 0.90,
        ior: 1.54,
        opacity: 0.45,
        transparent: true,
        envMapIntensity: 2.0,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getBlueSilicone(): THREE.MeshPhysicalMaterial {
    const key = 'base_blue_silicone';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'High_Pressure_Blue_Silicone',
        color: new THREE.Color(0xb45309),
        metalness: 0.10,
        roughness: 0.60,
        envMapIntensity: 0.8,
        sheen: 0.3,
        sheenColor: new THREE.Color(0xfbbf24),
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getTransaxleMagnesium(): THREE.MeshPhysicalMaterial {
    const key = 'base_transaxle_magnesium';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Transaxle_Magnesium_Casing',
        color: new THREE.Color(0x8b95a3),
        metalness: 0.78,
        roughness: 0.46,
        roughnessMap: this.textureCache.get('cast_iron') || null,
        envMapIntensity: 1.4,
        clearcoat: 0.15,
        clearcoatRoughness: 0.4,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getBlackPolymer(): THREE.MeshPhysicalMaterial {
    const key = 'base_black_polymer';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Black_Polymer_Shroud',
        color: new THREE.Color(0x0f172a),
        metalness: 0.20,
        roughness: 0.70,
        envMapIntensity: 0.6,
        sheen: 0.3,
        sheenColor: new THREE.Color(0x1e293b),
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getOrangeHighVoltage(): THREE.MeshPhysicalMaterial {
    const key = 'base_orange_hv';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'High_Voltage_800V_Orange',
        color: new THREE.Color(0xea580c),
        metalness: 0.15,
        roughness: 0.50,
        envMapIntensity: 0.9,
        clearcoat: 0.3,
        clearcoatRoughness: 0.15,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getShotPeenedTitanium(): THREE.MeshPhysicalMaterial {
    const key = 'base_shot_peened_titanium';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Shot_Peened_Aerospace_Titanium',
        color: new THREE.Color(0x818cf8),
        metalness: 0.92,
        roughness: 0.38,
        roughnessMap: this.textureCache.get('cast_iron') || null,
        bumpMap: this.textureCache.get('cast_iron') || null,
        bumpScale: 0.015,
        envMapIntensity: 1.6,
        clearcoat: 0.25,
        clearcoatRoughness: 0.15,
        sheen: 0.1,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getThermalBarrierCeramic(): THREE.MeshPhysicalMaterial {
    const key = 'base_thermal_barrier_ceramic';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Plasma_Sprayed_Thermal_Barrier_Ceramic',
        color: new THREE.Color(0xd97706),
        metalness: 0.35,
        roughness: 0.65,
        bumpMap: this.textureCache.get('cast_iron') || null,
        bumpScale: 0.02,
        envMapIntensity: 1.1,
        sheen: 0.15,
        sheenColor: new THREE.Color(0xfbbf24),
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getHeatShieldBlanket(): THREE.MeshPhysicalMaterial {
    const key = 'base_heat_shield_blanket';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Embossed_Inconel_Foil_Thermal_Blanket',
        color: new THREE.Color(0xf59e0b),
        metalness: 0.96,
        roughness: 0.28,
        normalMap: this.textureCache.get('brushed_metal') || null,
        normalScale: new THREE.Vector2(0.4, 0.4),
        envMapIntensity: 2.0,
        clearcoat: 0.5,
        clearcoatRoughness: 0.06,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getStainlessFlexBellows(): THREE.MeshPhysicalMaterial {
    const key = 'base_stainless_flex_bellows';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'High_Temp_Hydroformed_Stainless_Bellows',
        color: new THREE.Color(0x94a3b8),
        metalness: 0.94,
        roughness: 0.18,
        envMapIntensity: 1.7,
        clearcoat: 0.4,
        clearcoatRoughness: 0.05,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getTranslucentMesh(): THREE.MeshPhysicalMaterial {
    const key = 'base_translucent_mesh';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Stainless_Wire_Cloth_Screen',
        color: new THREE.Color(0xcbd5e1),
        metalness: 0.85,
        roughness: 0.40,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
        envMapIntensity: 1.2,
        clearcoat: 0.2,
        clearcoatRoughness: 0.1,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getRubberOring(): THREE.MeshPhysicalMaterial {
    const key = 'base_rubber_oring';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Fluorocarbon_Viton_O_Ring',
        color: new THREE.Color(0x0a0a0a),
        metalness: 0.05,
        roughness: 0.85,
        envMapIntensity: 0.4,
        sheen: 0.15,
        sheenColor: new THREE.Color(0x1a1a1a),
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getTitaniumBlued(): THREE.MeshPhysicalMaterial {
    const key = 'base_titanium_blued';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Titanium_Heat_Blued_PieCut',
        color: new THREE.Color(0xb45309),
        metalness: 0.96,
        roughness: 0.16,
        clearcoat: 0.85,
        clearcoatRoughness: 0.06,
        sheen: 0.55,
        sheenColor: new THREE.Color(0xd97706),
        specularColor: new THREE.Color(0xfbbf24),
        envMapIntensity: 2.8,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getForgedGoldFlakeCarbon(): THREE.MeshPhysicalMaterial {
    const key = 'base_forged_gold_flake_carbon';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Forged_Composite_Carbon_GoldFlake',
        color: new THREE.Color(0x1c1917),
        metalness: 0.45,
        roughness: 0.22,
        clearcoat: 0.95,
        clearcoatRoughness: 0.04,
        sheen: 0.35,
        sheenColor: new THREE.Color(0xf59e0b),
        envMapIntensity: 2.2,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getRossoCorsaPowdercoat(): THREE.MeshPhysicalMaterial {
    const key = 'base_rosso_corsa';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Rosso_Corsa_Textured_Powdercoat',
        color: new THREE.Color(0xdc2626),
        metalness: 0.35,
        roughness: 0.28,
        clearcoat: 0.8,
        clearcoatRoughness: 0.15,
        sheen: 0.2,
        sheenColor: new THREE.Color(0xef4444),
        envMapIntensity: 1.8,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getMonacoBluePowdercoat(): THREE.MeshPhysicalMaterial {
    const key = 'base_monaco_blue';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Monaco_Blue_Metallic_Powdercoat',
        color: new THREE.Color(0x0284c7),
        metalness: 0.65,
        roughness: 0.22,
        clearcoat: 0.85,
        clearcoatRoughness: 0.08,
        sheen: 0.3,
        sheenColor: new THREE.Color(0xfbbf24),
        envMapIntensity: 2.0,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getGialloModenaPowdercoat(): THREE.MeshPhysicalMaterial {
    const key = 'base_giallo_modena';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Giallo_Modena_Racing_Yellow',
        color: new THREE.Color(0xeab308),
        metalness: 0.3,
        roughness: 0.25,
        clearcoat: 0.85,
        clearcoatRoughness: 0.1,
        sheen: 0.25,
        sheenColor: new THREE.Color(0xfde047),
        envMapIntensity: 1.8,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getBritishRacingGreenPowdercoat(): THREE.MeshPhysicalMaterial {
    const key = 'base_british_racing_green';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'British_Racing_Green_Metallic',
        color: new THREE.Color(0x15803d),
        metalness: 0.55,
        roughness: 0.24,
        clearcoat: 0.9,
        clearcoatRoughness: 0.08,
        sheen: 0.2,
        sheenColor: new THREE.Color(0x4ade80),
        envMapIntensity: 1.9,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getStealthBlackCeramic(): THREE.MeshPhysicalMaterial {
    const key = 'base_stealth_black_ceramic';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Stealth_Black_Ceramic_Coating',
        color: new THREE.Color(0x18181b),
        metalness: 0.30,
        roughness: 0.55,
        clearcoat: 0.15,
        clearcoatRoughness: 0.4,
        envMapIntensity: 1.2,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getDynoGlowExhaust(): THREE.MeshPhysicalMaterial {
    const key = 'base_dyno_glow_exhaust';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Dyno_Glow_Exhaust_Headers',
        color: new THREE.Color(0xff5722),
        emissive: new THREE.Color(0xff3d00),
        emissiveIntensity: 1.8,
        metalness: 0.85,
        roughness: 0.32,
        clearcoat: 0.5,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.5,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getPolishedChrome(): THREE.MeshPhysicalMaterial {
    const key = 'base_polished_chrome';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Mirror_Polished_Chrome',
        color: new THREE.Color(0xf8fafc),
        metalness: 0.98,
        roughness: 0.05,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        envMapIntensity: 3.0,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getGoldLeaf(): THREE.MeshPhysicalMaterial {
    const key = 'base_gold_leaf';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: '24K_Gold_Leaf_Mirror',
        color: new THREE.Color(0xfbbf24),
        metalness: 0.95,
        roughness: 0.12,
        clearcoat: 0.9,
        clearcoatRoughness: 0.04,
        sheen: 0.4,
        sheenColor: new THREE.Color(0xfef08a),
        envMapIntensity: 2.6,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getAnodizedPurple(): THREE.MeshPhysicalMaterial {
    const key = 'base_anodized_purple';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Anodized_Billet_Purple',
        color: new THREE.Color(0xd97706),
        metalness: 0.88,
        roughness: 0.18,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        sheen: 0.35,
        sheenColor: new THREE.Color(0xfbbf24),
        envMapIntensity: 2.2,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getBilletEmerald(): THREE.MeshPhysicalMaterial {
    const key = 'base_billet_emerald';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Anodized_Billet_Emerald',
        color: new THREE.Color(0x10b981),
        metalness: 0.90,
        roughness: 0.16,
        clearcoat: 0.85,
        clearcoatRoughness: 0.08,
        sheen: 0.3,
        sheenColor: new THREE.Color(0x6ee7b7),
        envMapIntensity: 2.4,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getBilletCobalt(): THREE.MeshPhysicalMaterial {
    const key = 'base_billet_cobalt';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Anodized_Billet_Cobalt',
        color: new THREE.Color(0x0284c7),
        metalness: 0.90,
        roughness: 0.16,
        clearcoat: 0.85,
        clearcoatRoughness: 0.08,
        sheen: 0.3,
        sheenColor: new THREE.Color(0xfbbf24),
        envMapIntensity: 2.4,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getBilletCrimson(): THREE.MeshPhysicalMaterial {
    const key = 'base_billet_crimson';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Anodized_Billet_Crimson',
        color: new THREE.Color(0xef4444),
        metalness: 0.90,
        roughness: 0.16,
        clearcoat: 0.85,
        clearcoatRoughness: 0.08,
        sheen: 0.3,
        sheenColor: new THREE.Color(0xfca5a5),
        envMapIntensity: 2.4,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getCoggedBeltRubber(): THREE.MeshPhysicalMaterial {
    const key = 'base_cogged_belt';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Reinforced_Cogged_Drive_Belt',
        color: new THREE.Color(0x1f2937),
        metalness: 0.05,
        roughness: 0.78,
        clearcoat: 0.05,
        clearcoatRoughness: 0.8,
        envMapIntensity: 0.6,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getRedSilicone(): THREE.MeshPhysicalMaterial {
    const key = 'base_red_silicone';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Red_4Ply_Silicone_Coupler',
        color: new THREE.Color(0xdc2626),
        metalness: 0.05,
        roughness: 0.45,
        clearcoat: 0.6,
        clearcoatRoughness: 0.25,
        sheen: 0.2,
        sheenColor: new THREE.Color(0xfca5a5),
        envMapIntensity: 1.2,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getBlackViton(): THREE.MeshPhysicalMaterial {
    const key = 'base_black_viton';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Viton_Fluoroelastomer_Black',
        color: new THREE.Color(0x18181b),
        metalness: 0.08,
        roughness: 0.65,
        clearcoat: 0.2,
        clearcoatRoughness: 0.5,
        envMapIntensity: 0.8,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  /**
   * Resolves the authentic physical PBR material for any selected material variant string or component type.
   */

  // --- EXPANDED ENGINE COVER COLOR PALETTE ---

  public getCoverBmwOrange(): THREE.MeshPhysicalMaterial {
    const key = 'cover_bmw_orange';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'BMW_M_Orange', color: new THREE.Color(16739072),
        metalness: 0.35, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.8,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getCoverSubaruBlue(): THREE.MeshPhysicalMaterial {
    const key = 'cover_subaru_blue';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Subaru_WR_Blue', color: new THREE.Color(11886),
        metalness: 0.4, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 2,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getCoverPorscheRed(): THREE.MeshPhysicalMaterial {
    const key = 'cover_porsche_red';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Porsche_GTS_Red', color: new THREE.Color(10485760),
        metalness: 0.3, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.6,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getCoverMazdaRed(): THREE.MeshPhysicalMaterial {
    const key = 'cover_mazda_red';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Mazda_Soul_Red', color: new THREE.Color(10027008),
        metalness: 0.5, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2,
        sheen: 0.6, sheenColor: new THREE.Color(16724787),
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getCoverBugattiBlue(): THREE.MeshPhysicalMaterial {
    const key = 'cover_bugatti_blue';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Bugatti_Carbon_Blue', color: new THREE.Color(661032),
        metalness: 0.2, roughness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.1, envMapIntensity: 1.4,
        sheen: 0.4, sheenColor: new THREE.Color(1985932),
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getCoverLamboOrange(): THREE.MeshPhysicalMaterial {
    const key = 'cover_lambo_orange';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Lamborghini_Arancio', color: new THREE.Color(16747520),
        metalness: 0.45, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2.2,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getCoverAmgBeige(): THREE.MeshPhysicalMaterial {
    const key = 'cover_amg_beige';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'AMG_Galactic_Beige', color: new THREE.Color(12888194),
        metalness: 0.5, roughness: 0.15, clearcoat: 0.9, clearcoatRoughness: 0.05, envMapIntensity: 1.5,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getCoverNismoRed(): THREE.MeshPhysicalMaterial {
    const key = 'cover_nismo_red';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Nismo_Ultimate_Red', color: new THREE.Color(13369344),
        metalness: 0.35, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.8,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getCoverCosworthGreen(): THREE.MeshPhysicalMaterial {
    const key = 'cover_cosworth_green';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Cosworth_Heritage_Green', color: new THREE.Color(19758),
        metalness: 0.4, roughness: 0.2, clearcoat: 0.95, clearcoatRoughness: 0.04, envMapIntensity: 1.6,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getCoverAudiRsCarbon(): THREE.MeshPhysicalMaterial {
    const key = 'cover_audi_rs_carbon';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Audi_RS_Dark_Carbon', color: new THREE.Color(1710618),
        metalness: 0.15, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.12, envMapIntensity: 1.2,
        sheen: 0.3, sheenColor: new THREE.Color(4210752),
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getBezelAnodizedRed(): THREE.MeshPhysicalMaterial {
    const key = 'bezel_anodized_red';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Anodized_Red_Aluminum', color: new THREE.Color(12131356),
        metalness: 0.85, roughness: 0.2, clearcoat: 0.3, clearcoatRoughness: 0.3, envMapIntensity: 1.4,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getBezelBrushedAluminum(): THREE.MeshPhysicalMaterial {
    const key = 'bezel_brushed_aluminum';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Brushed_6061_Aluminum', color: new THREE.Color(12632256),
        metalness: 0.9, roughness: 0.35, envMapIntensity: 1.2,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getBezelDarkChrome(): THREE.MeshPhysicalMaterial {
    const key = 'bezel_dark_chrome';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Dark_Chrome_PVD', color: new THREE.Color(2763306),
        metalness: 0.95, roughness: 0.1, clearcoat: 0.5, clearcoatRoughness: 0.15, envMapIntensity: 2,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public getBezelBronzeAntique(): THREE.MeshPhysicalMaterial {
    const key = 'bezel_bronze_antique';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Antique_Bronze', color: new THREE.Color(9136404),
        metalness: 0.8, roughness: 0.3, clearcoat: 0.2, clearcoatRoughness: 0.4, envMapIntensity: 1.1,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
  }

  public resolveMaterialForVariant(
    materialId?: string,
    fallbackType?: string,
    engineConfig?: Partial<EngineConfig>
  ): THREE.MeshPhysicalMaterial {
    const id = (materialId || '').toLowerCase();

    if (id.includes('titanium_blued') || id.includes('burnt_titanium') || id.includes('heat_blued')) {
      return this.getTitaniumBlued();
    }
    if (id.includes('dyno_glow') || id.includes('glowing') || id.includes('hot_exhaust')) {
      return this.getDynoGlowExhaust();
    }
    if (id.includes('forged_carbon') || id.includes('gold_flake') || id.includes('forged_composite')) {
      return this.getForgedGoldFlakeCarbon();
    }
    if (id.includes('rosso') || id.includes('red_corsa') || id.includes('rosso_red') || id.includes('wrinkle_red')) {
      return this.getRossoCorsaPowdercoat();
    }
    if (id.includes('monaco_blue') || id.includes('electric_blue') || id.includes('apex_blue')) {
      return this.getMonacoBluePowdercoat();
    }
    if (id.includes('giallo') || id.includes('yellow') || id.includes('acid_yellow')) {
      return this.getGialloModenaPowdercoat();
    }
    if (id.includes('green') || id.includes('british_racing')) {
      return this.getBritishRacingGreenPowdercoat();
    }
    if (id.includes('stealth_black') || id.includes('satin_black') || id.includes('black_ceramic')) {
      return this.getStealthBlackCeramic();
    }
    if (id.includes('chrome') || id.includes('polished_stainless') || id.includes('mirror')) {
      return this.getPolishedChrome();
    }
    if (id.includes('gold_leaf') || id.includes('24k')) {
      return this.getGoldLeaf();
    }
    if (id.includes('cast_iron') || id === 'iron') {
      return this.getCastIron();
    }
    if (id.includes('titanium') || id.includes('ti_6al_4v') || id.includes('ti-')) {
      return this.getTitaniumAerospace();
    }
    if (id.includes('billet') || id.includes('cnc') || id.includes('machined') || id.includes('6061')) {
      return this.getMachinedBillet();
    }
    if (id.includes('forged') || id.includes('chromoly') || id.includes('steel') || id.includes('4340')) {
      return this.getForgedSteel();
    }
    if (id.includes('carbon') || id.includes('composite')) {
      return this.getDryCarbonFiber();
    }
    if (id.includes('ceramic')) {
      return this.getCeramicIntake();
    }
    if (id.includes('inconel')) {
      return this.getInconelExhaust();
    }
    if (id.includes('gold')) {
      return this.getGoldAnodized();
    }
    if (id.includes('cobalt') || id.includes('blue')) {
      return this.getCobaltAnodized();
    }
    if (id.includes('magnesium')) {
      return this.getTransaxleMagnesium();
    }
    if (id.includes('aluminum') || id.includes('alloy')) {
      return this.getCastAluminum();
    }

    // Contextual fallback by component type and live engine specifications
    if (fallbackType === 'engine-block') {
      const blockMat = (engineConfig as any)?.blockMaterial || (engineConfig as any)?.material;
      if (blockMat) return this.resolveMaterialForVariant(blockMat);
      return this.getCastAluminum();
    }

    if (fallbackType === 'crankshaft') {
      if (engineConfig?.crank) return this.resolveMaterialForVariant(engineConfig.crank);
      return this.getNitridedCrank();
    }

    if (fallbackType === 'piston') {
      if (engineConfig?.pistons) return this.resolveMaterialForVariant(engineConfig.pistons);
      return this.getMachinedBillet();
    }

    if (fallbackType === 'connecting-rod') {
      return this.getForgedSteel();
    }

    if (fallbackType === 'turbocharger') {
      if (engineConfig?.turboHousing) return this.resolveMaterialForVariant(engineConfig.turboHousing);
      return this.getInconelExhaust();
    }

    if (fallbackType === 'exhaust-header-left' || fallbackType === 'exhaust-header-right') {
      return this.getInconelExhaust();
    }

    if (fallbackType === 'intake-manifold-left' || fallbackType === 'intake-manifold-right') {
      return this.getMachinedBillet();
    }

    if (fallbackType === 'engine-cover') return this.getDryCarbonFiber();
    if (fallbackType === 'radiator') return this.getCastAluminum();
    if (fallbackType === 'transaxle') return this.getTransaxleMagnesium();
    if (fallbackType === 'dry-sump') return this.getMachinedBillet();

    return this.getCastAluminum();
  }

  // ─── 2.2 DYNAMIC VARIANT MATERIAL GENERATOR ───

  public getVariantMaterial(variant: MaterialVariantVisual): THREE.Material {
    const key = `variant_${variant.id}_${variant.color}_${variant.metalness}_${variant.roughness}`;
    if (!this.materialCache.has(key)) {
      const isTransmissive = (variant.transmission ?? 0) > 0;

      let mat: THREE.Material;
      if (isTransmissive) {
        mat = new THREE.MeshPhysicalMaterial({
          name: `Variant_${variant.label}`,
          color: new THREE.Color(variant.color),
          metalness: variant.metalness,
          roughness: variant.roughness,
          transmission: variant.transmission,
          ior: variant.ior || 1.5,
          opacity: variant.opacity ?? 0.6,
          transparent: true,
          envMapIntensity: variant.envMapIntensity || 1.5,
        });
      } else {
        mat = new THREE.MeshStandardMaterial({
          name: `Variant_${variant.label}`,
          color: new THREE.Color(variant.color),
          metalness: variant.metalness,
          roughness: variant.roughness,
          emissive: variant.emissive ? new THREE.Color(variant.emissive) : new THREE.Color(0x000000),
          emissiveIntensity: variant.emissiveIntensity || 0,
          envMapIntensity: variant.envMapIntensity || 1.3,
          wireframe: variant.wireframe || false,
        });
      }

      this.materialCache.set(key, mat);
    }

    return this.materialCache.get(key) as THREE.MeshStandardMaterial;
  }

  // ─── 2.3 INTERACTIVE HIGHLIGHT & FEEDBACK MATERIALS ───

  public getHighlightMaterial(type: 'hover' | 'selected' | 'ghost' | 'error'): THREE.Material {
    const key = `highlight_${type}`;
    if (!this.materialCache.has(key)) {
      let mat: THREE.Material;

      switch (type) {
        case 'hover':
          mat = new THREE.MeshStandardMaterial({
            name: 'Highlight_Hover',
            color: new THREE.Color(0xfbbf24),
            metalness: 0.8,
            roughness: 0.2,
            emissive: new THREE.Color(0x0284c7),
            emissiveIntensity: 0.45,
            transparent: true,
            opacity: 0.9,
          });
          break;

        case 'selected':
          mat = new THREE.MeshStandardMaterial({
            name: 'Highlight_Selected',
            color: new THREE.Color(0x06b6d4),
            metalness: 0.9,
            roughness: 0.1,
            emissive: new THREE.Color(0x0891b2),
            emissiveIntensity: 0.75,
          });
          break;

        case 'ghost':
          mat = new THREE.MeshPhysicalMaterial({
            name: 'Highlight_Ghost_Preview',
            color: new THREE.Color(0xfbbf24),
            metalness: 0.1,
            roughness: 0.1,
            transmission: 0.8,
            opacity: 0.35,
            transparent: true,
            wireframe: true,
          });
          break;

        case 'error':
          mat = new THREE.MeshStandardMaterial({
            name: 'Highlight_Error',
            color: new THREE.Color(0xef4444),
            metalness: 0.5,
            roughness: 0.3,
            emissive: new THREE.Color(0xdc2626),
            emissiveIntensity: 0.8,
          });
          break;
      }

      this.materialCache.set(key, mat);
    }

    return this.materialCache.get(key)!;
  }

  // ─── 2.4 MESH MATERIAL HOT-SWAPPING ───

  public applyMaterialToGroup(
    group: THREE.Object3D,
    material: THREE.Material,
    preserveOriginal: boolean = true
  ): void {
    group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (preserveOriginal && !mesh.userData.originalMaterial) {
          mesh.userData.originalMaterial = mesh.material;
        }
        mesh.material = material;
      }
    });
  }

  public restoreOriginalMaterial(group: THREE.Object3D): void {
    group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.userData.originalMaterial) {
          mesh.material = mesh.userData.originalMaterial;
        }
      }
    });
  }

  // ─── 2.5 GPU CLEANUP ───

  public dispose(): void {
    this.materialCache.forEach((mat) => mat.dispose());
    this.materialCache.clear();

    this.textureCache.forEach((tex) => tex.dispose());
    this.textureCache.clear();
  }
}

/** Global singleton instance */
export const globalMaterialLibrary = EngineMaterialLibrary.getInstance();
