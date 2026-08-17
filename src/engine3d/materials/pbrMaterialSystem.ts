// ============================================================================
// MODULAR GLB/glTF ENGINE ASSEMBLY — PHYSICAL PBR MATERIAL SYSTEM
// ============================================================================
// High-performance Three.js PBR material library, procedural micro-texture
// generation, dynamic variant interpolation, selection highlight shaders,
// wireframe overlays, transmissive glass physics, and GPU resource lifecycle.
// ============================================================================

import * as THREE from 'three';
import type { MaterialVariantVisual } from '../types';

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
      ctx.fillStyle = isAlt ? '#0f172a' : '#334155';
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
    } catch (err) {
      console.warn('[EngineMaterialLibrary] Procedural canvas texture generation skipped:', err);
    }
  }

  // ─── 2.1 BASE MATERIAL PRESET CREATORS ───

  public getCastIron(): THREE.MeshStandardMaterial {
    const key = 'base_cast_iron';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshStandardMaterial({
        name: 'Heavy_Duty_Ductile_Cast_Iron',
        color: new THREE.Color(0x2a2c30),
        metalness: 0.78,
        roughness: 0.72,
        roughnessMap: this.textureCache.get('cast_iron') || null,
        bumpMap: this.textureCache.get('cast_iron') || null,
        bumpScale: 0.04,
        envMapIntensity: 0.85,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshStandardMaterial;
  }

  public getTitaniumAerospace(): THREE.MeshStandardMaterial {
    const key = 'base_titanium_aerospace';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshStandardMaterial({
        name: 'Ti_6Al_4V_Aerospace_Titanium',
        color: new THREE.Color(0x9d8bf0),
        metalness: 0.96,
        roughness: 0.12,
        normalMap: this.textureCache.get('brushed_metal') || null,
        normalScale: new THREE.Vector2(0.15, 0.15),
        envMapIntensity: 2.2,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshStandardMaterial;
  }

  public getForgedSteel(): THREE.MeshStandardMaterial {
    const key = 'base_forged_steel';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshStandardMaterial({
        name: 'Forged_4340_Chromoly_Steel',
        color: new THREE.Color(0xb0bec5),
        metalness: 0.90,
        roughness: 0.22,
        envMapIntensity: 1.5,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshStandardMaterial;
  }

  public getCastAluminum(): THREE.MeshStandardMaterial {
    const key = 'base_cast_aluminum';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshStandardMaterial({
        name: 'Cast_Magnesium_Aluminum',
        color: new THREE.Color(0x94a3b8),
        metalness: 0.75,
        roughness: 0.42,
        roughnessMap: this.textureCache.get('cast_iron') || null,
        envMapIntensity: 1.2,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshStandardMaterial;
  }

  public getMachinedBillet(): THREE.MeshStandardMaterial {
    const key = 'base_machined_billet';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshStandardMaterial({
        name: 'Machined_Billet_Surface',
        color: new THREE.Color(0xe2e8f0),
        metalness: 0.94,
        roughness: 0.16,
        normalMap: this.textureCache.get('brushed_metal') || null,
        normalScale: new THREE.Vector2(0.35, 0.35),
        envMapIntensity: 1.8,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshStandardMaterial;
  }

  public getNitridedCrank(): THREE.MeshStandardMaterial {
    const key = 'base_nitrided_crank';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshStandardMaterial({
        name: 'Forged_Nitrided_Steel',
        color: new THREE.Color(0xcbd5e1),
        metalness: 0.92,
        roughness: 0.15,
        envMapIntensity: 1.4,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshStandardMaterial;
  }

  public getGoldAnodized(): THREE.MeshStandardMaterial {
    const key = 'base_gold_anodized';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshStandardMaterial({
        name: 'Billet_Gold_Anodized',
        color: new THREE.Color(0xf59e0b),
        metalness: 0.92,
        roughness: 0.18,
        envMapIntensity: 1.8,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshStandardMaterial;
  }

  public getCobaltAnodized(): THREE.MeshStandardMaterial {
    const key = 'base_cobalt_anodized';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshStandardMaterial({
        name: 'Apex_Cobalt_Blue_Anodized',
        color: new THREE.Color(0x0284c7),
        metalness: 0.88,
        roughness: 0.18,
        envMapIntensity: 1.8,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshStandardMaterial;
  }

  public getCeramicIntake(): THREE.MeshStandardMaterial {
    const key = 'base_ceramic_intake';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshStandardMaterial({
        name: 'Thermal_Barrier_Ceramic_White',
        color: new THREE.Color(0xf8fafc),
        metalness: 0.20,
        roughness: 0.35,
        envMapIntensity: 0.9,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshStandardMaterial;
  }

  public getInconelExhaust(): THREE.MeshStandardMaterial {
    const key = 'base_inconel_exhaust';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshStandardMaterial({
        name: 'Inconel_625_Heat_Tinted_Gold',
        color: new THREE.Color(0xd97706),
        metalness: 0.92,
        roughness: 0.24,
        envMapIntensity: 1.6,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshStandardMaterial;
  }

  public getDryCarbonFiber(): THREE.MeshStandardMaterial {
    const key = 'base_dry_carbon_fiber';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshStandardMaterial({
        name: 'Autoclaved_2x2_Twill_Dry_Carbon',
        color: new THREE.Color(0x1e293b),
        metalness: 0.35,
        roughness: 0.32,
        roughnessMap: this.textureCache.get('carbon_fiber') || null,
        envMapIntensity: 1.5,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshStandardMaterial;
  }

  public getQuartzGlass(): THREE.MeshPhysicalMaterial {
    const key = 'base_quartz_glass';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshPhysicalMaterial({
        name: 'Quartz_ITB_Inspection_Glass',
        color: new THREE.Color(0x38bdf8),
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

  public getBlueSilicone(): THREE.MeshStandardMaterial {
    const key = 'base_blue_silicone';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshStandardMaterial({
        name: 'High_Pressure_Blue_Silicone',
        color: new THREE.Color(0x2563eb),
        metalness: 0.10,
        roughness: 0.60,
        envMapIntensity: 0.8,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshStandardMaterial;
  }

  public getTransaxleMagnesium(): THREE.MeshStandardMaterial {
    const key = 'base_transaxle_magnesium';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshStandardMaterial({
        name: 'Transaxle_Magnesium_Casing',
        color: new THREE.Color(0x64748b),
        metalness: 0.80,
        roughness: 0.44,
        roughnessMap: this.textureCache.get('cast_iron') || null,
        envMapIntensity: 1.2,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshStandardMaterial;
  }

  public getBlackPolymer(): THREE.MeshStandardMaterial {
    const key = 'base_black_polymer';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshStandardMaterial({
        name: 'Black_Polymer_Shroud',
        color: new THREE.Color(0x0f172a),
        metalness: 0.20,
        roughness: 0.70,
        envMapIntensity: 0.6,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshStandardMaterial;
  }

  public getOrangeHighVoltage(): THREE.MeshStandardMaterial {
    const key = 'base_orange_hv';
    if (!this.materialCache.has(key)) {
      const mat = new THREE.MeshStandardMaterial({
        name: 'High_Voltage_800V_Orange',
        color: new THREE.Color(0xea580c),
        metalness: 0.15,
        roughness: 0.50,
        envMapIntensity: 0.9,
      });
      this.materialCache.set(key, mat);
    }
    return this.materialCache.get(key) as THREE.MeshStandardMaterial;
  }

  /**
   * Resolves the authentic physical PBR material for any selected material variant string.
   */
  public resolveMaterialForVariant(materialId?: string, fallbackType?: string): THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial {
    const id = (materialId || '').toLowerCase();

    if (id.includes('cast_iron') || id === 'cast') {
      return this.getCastIron();
    }
    if (id.includes('titanium') || id.includes('ti_6al_4v')) {
      return this.getTitaniumAerospace();
    }
    if (id.includes('billet') || id.includes('cnc') || id.includes('machined')) {
      return this.getMachinedBillet();
    }
    if (id.includes('forged') || id.includes('chromoly') || id.includes('steel')) {
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
    if (id.includes('aluminum')) {
      return this.getCastAluminum();
    }

    // Contextual fallback by component type
    if (fallbackType === 'turbocharger') return this.getInconelExhaust();
    if (fallbackType === 'engine-cover') return this.getDryCarbonFiber();
    if (fallbackType === 'radiator') return this.getCastAluminum();
    if (fallbackType === 'transaxle') return this.getTransaxleMagnesium();
    return this.getCastAluminum();
  }

  // ─── 2.2 DYNAMIC VARIANT MATERIAL GENERATOR ───

  public getVariantMaterial(variant: MaterialVariantVisual): THREE.MeshStandardMaterial {
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
            color: new THREE.Color(0x38bdf8),
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
            color: new THREE.Color(0x38bdf8),
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
