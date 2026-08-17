// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — PHOTOREALISTIC PBR MATERIAL SYSTEM
// ============================================================================
// Advanced multi-layer automotive PBR material shaders with procedural normal
// maps for carbon weave, brake rotor machining, tire tread, leather pores,
// and brushed/cast metallurgy.
// ============================================================================

import * as THREE from 'three';
import { MaterialGrade } from '../../sim/assemblyTypes';
import { InteriorTrimGrade } from '../types/modularInteriorTypes';

export class AutomotivePBRMaterialSystem {
  private static materialCache: Map<string, THREE.Material> = new Map();
  private static textureCache: Map<string, THREE.CanvasTexture> = new Map();

  // ==========================================================================
  // 1. PROCEDURAL NORMAL & SURFACE TEXTURE GENERATORS
  // ==========================================================================

  /**
   * Generates a 2x2 Twill Carbon Fiber Normal Map (128x128).
   */
  public static getCarbonWeaveNormalTexture(): THREE.CanvasTexture {
    const key = 'tex_carbon_weave_normal';
    if (this.textureCache.has(key)) {
      return this.textureCache.get(key)!;
    }

    if (typeof document === 'undefined') {
      const data = new Uint8Array(128 * 128 * 4);
      for (let y = 0; y < 128; y++) {
        for (let x = 0; x < 128; x++) {
          const idx = (y * 128 + x) * 4;
          const pattern = Math.sin((x + y) * 0.4) * Math.cos((x - y) * 0.4);
          data[idx] = Math.floor(128 + pattern * 60);
          data[idx + 1] = Math.floor(128 + pattern * 60);
          data[idx + 2] = 240;
          data[idx + 3] = 255;
        }
      }
      const dataTex = new THREE.DataTexture(data, 128, 128, THREE.RGBAFormat);
      dataTex.needsUpdate = true;
      const castTex = dataTex as unknown as THREE.CanvasTexture;
      this.textureCache.set(key, castTex);
      return castTex;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const imgData = ctx.createImageData(128, 128);
      const data = imgData.data;

      for (let y = 0; y < 128; y++) {
        for (let x = 0; x < 128; x++) {
          const idx = (y * 128 + x) * 4;
          // 2x2 twill diagonal pattern
          const pattern = Math.sin((x + y) * 0.4) * Math.cos((x - y) * 0.4);
          
          // Tangent-space Normal: R = X normal, G = Y normal, B = Z normal (128 = 0.5)
          const nx = Math.floor(128 + pattern * 60);
          const ny = Math.floor(128 + pattern * 60);
          const nz = 240; // facing outward

          data[idx] = Math.max(0, Math.min(255, nx));
          data[idx + 1] = Math.max(0, Math.min(255, ny));
          data[idx + 2] = nz;
          data[idx + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16);
    this.textureCache.set(key, texture);
    return texture;
  }

  /**
   * Generates a Circular Brake Rotor Machining Normal Map.
   */
  public static getBrakeRotorNormalTexture(): THREE.CanvasTexture {
    const key = 'tex_brake_rotor_normal';
    if (this.textureCache.has(key)) {
      return this.textureCache.get(key)!;
    }

    if (typeof document === 'undefined') {
      const data = new Uint8Array(256 * 256 * 4);
      const cx = 128;
      const cy = 128;
      for (let y = 0; y < 256; y++) {
        for (let x = 0; x < 256; x++) {
          const idx = (y * 256 + x) * 4;
          const dx = x - cx;
          const dy = y - cy;
          const r = Math.sqrt(dx * dx + dy * dy);
          const groove = Math.sin(r * 1.8) * 40;
          const angle = Math.atan2(dy, dx);
          data[idx] = Math.floor(128 + Math.cos(angle) * groove);
          data[idx + 1] = Math.floor(128 + Math.sin(angle) * groove);
          data[idx + 2] = 235;
          data[idx + 3] = 255;
        }
      }
      const dataTex = new THREE.DataTexture(data, 256, 256, THREE.RGBAFormat);
      dataTex.needsUpdate = true;
      const castTex = dataTex as unknown as THREE.CanvasTexture;
      this.textureCache.set(key, castTex);
      return castTex;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const cx = 128;
      const cy = 128;
      const imgData = ctx.createImageData(256, 256);
      const data = imgData.data;

      for (let y = 0; y < 256; y++) {
        for (let x = 0; x < 256; x++) {
          const idx = (y * 256 + x) * 4;
          const dx = x - cx;
          const dy = y - cy;
          const r = Math.sqrt(dx * dx + dy * dy);

          // Concentric circular machining grooves
          const groove = Math.sin(r * 1.8) * 40;

          // Normal direction perpendicular to radius
          const angle = Math.atan2(dy, dx);
          const nx = Math.floor(128 + Math.cos(angle) * groove);
          const ny = Math.floor(128 + Math.sin(angle) * groove);

          data[idx] = Math.max(0, Math.min(255, nx));
          data[idx + 1] = Math.max(0, Math.min(255, ny));
          data[idx + 2] = 235;
          data[idx + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.textureCache.set(key, texture);
    return texture;
  }

  /**
   * Generates a Directional Tire Tread Normal Map.
   */
  public static getTireTreadNormalTexture(): THREE.CanvasTexture {
    const key = 'tex_tire_tread_normal';
    if (this.textureCache.has(key)) {
      return this.textureCache.get(key)!;
    }

    if (typeof document === 'undefined') {
      const data = new Uint8Array(128 * 256 * 4);
      data.fill(128);
      const dataTex = new THREE.DataTexture(data, 128, 256, THREE.RGBAFormat);
      dataTex.needsUpdate = true;
      const castTex = dataTex as unknown as THREE.CanvasTexture;
      this.textureCache.set(key, castTex);
      return castTex;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = 'rgb(128, 128, 255)';
      ctx.fillRect(0, 0, 128, 256);

      // Longitudinal Grooves
      ctx.fillStyle = 'rgb(100, 100, 240)';
      ctx.fillRect(30, 0, 8, 256);
      ctx.fillRect(60, 0, 8, 256);
      ctx.fillRect(90, 0, 8, 256);

      // Lateral Sipes
      ctx.fillStyle = 'rgb(128, 90, 220)';
      for (let y = 0; y < 256; y += 16) {
        ctx.fillRect(0, y, 128, 3);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 12);
    this.textureCache.set(key, texture);
    return texture;
  }

  /**
   * Generates a Perforated Nappa Leather Normal Map.
   */
  public static getLeatherPoresNormalTexture(): THREE.CanvasTexture {
    const key = 'tex_leather_pores_normal';
    if (this.textureCache.has(key)) {
      return this.textureCache.get(key)!;
    }

    if (typeof document === 'undefined') {
      const data = new Uint8Array(128 * 128 * 4);
      data.fill(128);
      const dataTex = new THREE.DataTexture(data, 128, 128, THREE.RGBAFormat);
      dataTex.needsUpdate = true;
      const castTex = dataTex as unknown as THREE.CanvasTexture;
      this.textureCache.set(key, castTex);
      return castTex;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = 'rgb(128, 128, 255)';
      ctx.fillRect(0, 0, 128, 128);

      // Perforation dots
      ctx.fillStyle = 'rgb(70, 70, 200)';
      for (let y = 8; y < 128; y += 16) {
        for (let x = 8; x < 128; x += 16) {
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    this.textureCache.set(key, texture);
    return texture;
  }

  // ==========================================================================
  // 2. MASTER PBR MATERIAL LIBRARY
  // ==========================================================================

  /**
   * High-Gloss Multi-Layer Automotive Paint with Clearcoat & Metallic Flake.
   */
  public static getAutomotivePaint(colorHex: string = '#0ea5e9'): THREE.MeshPhysicalMaterial {
    const key = `paint_${colorHex}`;
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
    }

    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colorHex),
      metalness: 0.88,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      ior: 1.52,
      reflectivity: 0.9,
      name: `Paint_${colorHex}`,
    });

    this.materialCache.set(key, mat);
    return mat;
  }

  /**
   * Carbon Fiber Composite (Dry or Gloss Twill).
   */
  public static getCarbonFiber(isGloss: boolean = true): THREE.MeshPhysicalMaterial {
    const key = `carbon_${isGloss ? 'gloss' : 'dry'}`;
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
    }

    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x18181b),
      metalness: 0.65,
      roughness: isGloss ? 0.22 : 0.85,
      clearcoat: isGloss ? 0.95 : 0.0,
      clearcoatRoughness: 0.04,
      normalMap: this.getCarbonWeaveNormalTexture(),
      normalScale: new THREE.Vector2(0.6, 0.6),
      name: `CarbonFiber_${isGloss ? 'Gloss' : 'Dry'}`,
    });

    this.materialCache.set(key, mat);
    return mat;
  }

  /**
   * Cast Iron / Carbon-Ceramic Brake Rotor Material.
   */
  public static getBrakeRotorMaterial(isCarbonCeramic: boolean = false): THREE.MeshStandardMaterial {
    const key = `brake_rotor_${isCarbonCeramic ? 'cc' : 'iron'}`;
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key) as THREE.MeshStandardMaterial;
    }

    const mat = new THREE.MeshStandardMaterial({
      color: isCarbonCeramic ? new THREE.Color(0x334155) : new THREE.Color(0x94a3b8),
      metalness: isCarbonCeramic ? 0.45 : 0.85,
      roughness: isCarbonCeramic ? 0.65 : 0.32,
      normalMap: this.getBrakeRotorNormalTexture(),
      normalScale: new THREE.Vector2(0.8, 0.8),
      name: `BrakeRotor_${isCarbonCeramic ? 'CarbonCeramic' : 'CastIron'}`,
    });

    this.materialCache.set(key, mat);
    return mat;
  }

  /**
   * Anodized Brake Caliper Material.
   */
  public static getBrakeCaliperMaterial(colorHex: string = '#f59e0b'): THREE.MeshStandardMaterial {
    const key = `caliper_${colorHex}`;
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key) as THREE.MeshStandardMaterial;
    }

    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      metalness: 0.92,
      roughness: 0.18,
      name: `Caliper_${colorHex}`,
    });

    this.materialCache.set(key, mat);
    return mat;
  }

  /**
   * High-Performance Tire Rubber Compound.
   */
  public static getTireRubberMaterial(): THREE.MeshStandardMaterial {
    const key = 'tire_rubber';
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key) as THREE.MeshStandardMaterial;
    }

    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x18181b),
      metalness: 0.02,
      roughness: 0.84,
      normalMap: this.getTireTreadNormalTexture(),
      normalScale: new THREE.Vector2(1.0, 1.0),
      name: 'TireRubber_SemiSlick',
    });

    this.materialCache.set(key, mat);
    return mat;
  }

  /**
   * Structural Chassis Box Rail & Subframe Metallurgy.
   */
  public static getChassisStructuralMaterial(grade: MaterialGrade = 'forged'): THREE.MeshStandardMaterial {
    const key = `chassis_meta_${grade}`;
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key) as THREE.MeshStandardMaterial;
    }

    let color = 0x475569;
    let metalness = 0.85;
    let roughness = 0.38;

    switch (grade) {
      case 'titanium':
        color = 0x64748b;
        metalness = 0.95;
        roughness = 0.25;
        break;
      case 'ceramic':
        color = 0x1e293b;
        metalness = 0.45;
        roughness = 0.65;
        break;
      case 'billet':
        color = 0x94a3b8;
        metalness = 0.92;
        roughness = 0.18;
        break;
      case 'cast':
        color = 0x334155;
        metalness = 0.75;
        roughness = 0.55;
        break;
      case 'forged':
      default:
        color = 0x475569;
        metalness = 0.88;
        roughness = 0.35;
        break;
    }

    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      metalness,
      roughness,
      name: `ChassisMetallurgy_${grade}`,
    });

    this.materialCache.set(key, mat);
    return mat;
  }

  /**
   * Optical Laminated Automotive Glass.
   */
  public static getOpticalGlass(tintHex: string = '#e2e8f0', transmission: number = 0.95): THREE.MeshPhysicalMaterial {
    const key = `glass_${tintHex}_${transmission}`;
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key) as THREE.MeshPhysicalMaterial;
    }

    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(tintHex),
      metalness: 0.1,
      roughness: 0.02,
      transmission,
      transparent: true,
      opacity: 1.0 - transmission * 0.75,
      ior: 1.52,
      name: `AutomotiveGlass_${tintHex}`,
    });

    this.materialCache.set(key, mat);
    return mat;
  }

  /**
   * Interior Nappa Leather & Alcantara Material.
   */
  public static getInteriorTrimMaterial(trim: InteriorTrimGrade): THREE.MeshStandardMaterial {
    const key = `trim_${trim}`;
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key) as THREE.MeshStandardMaterial;
    }

    switch (trim) {
      case 'forged_carbon':
        return this.getCarbonFiber(true);
      case 'alcantara_race':
        const alc = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x27272a),
          metalness: 0.0,
          roughness: 0.96,
          name: 'Interior_AlcantaraRace',
        });
        this.materialCache.set(key, alc);
        return alc;
      case 'open_pore_wood':
        const wood = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x3e2723),
          metalness: 0.05,
          roughness: 0.65,
          name: 'Interior_OpenPoreWood',
        });
        this.materialCache.set(key, wood);
        return wood;
      case 'brushed_aluminum':
        const alum = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0xd4d4d8),
          metalness: 0.95,
          roughness: 0.22,
          name: 'Interior_BrushedAluminum',
        });
        this.materialCache.set(key, alum);
        return alum;
      case 'nappa_leather':
      default:
        const leather = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x1e293b),
          metalness: 0.1,
          roughness: 0.68,
          normalMap: this.getLeatherPoresNormalTexture(),
          normalScale: new THREE.Vector2(0.4, 0.4),
          name: 'Interior_NappaLeather',
        });
        this.materialCache.set(key, leather);
        return leather;
    }
  }
}
