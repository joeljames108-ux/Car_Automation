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
   * Generates a High-Fidelity 2x2 Twill Carbon Fiber Normal Map (256x256)
   * with herringbone tow bundle weaves and micro-filament striations.
   */
  public static getCarbonWeaveNormalTexture(): THREE.CanvasTexture {
    const key = 'tex_carbon_weave_normal_hd';
    if (this.textureCache.has(key)) {
      return this.textureCache.get(key)!;
    }

    if (typeof document === 'undefined') {
      const data = new Uint8Array(256 * 256 * 4);
      for (let y = 0; y < 256; y++) {
        for (let x = 0; x < 256; x++) {
          const idx = (y * 256 + x) * 4;
          const macroWeave = Math.sin((x + y) * 0.35) * Math.cos((x - y) * 0.35);
          const microStriation = Math.sin((x + y) * 2.8) * 0.15;
          const pattern = macroWeave + microStriation;

          data[idx] = Math.floor(128 + pattern * 55);
          data[idx + 1] = Math.floor(128 + pattern * 55);
          data[idx + 2] = 238;
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
      const imgData = ctx.createImageData(256, 256);
      const data = imgData.data;

      for (let y = 0; y < 256; y++) {
        for (let x = 0; x < 256; x++) {
          const idx = (y * 256 + x) * 4;
          // Dual-frequency 2x2 twill tow bundle wave + filament striation
          const macroWeave = Math.sin((x + y) * 0.35) * Math.cos((x - y) * 0.35);
          const microStriation = Math.sin((x + y) * 2.8) * 0.15;
          const pattern = macroWeave + microStriation;
          
          // Tangent-space Normal: R = X normal, G = Y normal, B = Z normal
          const nx = Math.floor(128 + pattern * 55);
          const ny = Math.floor(128 + pattern * 55);
          const nz = 238;

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
          const angle = Math.atan2(dy, dx);

          const nx = Math.floor(128 + Math.cos(angle) * groove);
          const ny = Math.floor(128 + Math.sin(angle) * groove);
          const nz = 235;

          data[idx] = Math.max(0, Math.min(255, nx));
          data[idx + 1] = Math.max(0, Math.min(255, ny));
          data[idx + 2] = nz;
          data[idx + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.textureCache.set(key, texture);
    return texture;
  }

  /**
   * Generates a Perforated Sport Leather Normal Map.
   */
  public static getPerforatedLeatherNormalTexture(): THREE.CanvasTexture {
    const key = 'tex_perf_leather_normal';
    if (this.textureCache.has(key)) {
      return this.textureCache.get(key)!;
    }

    if (typeof document === 'undefined') {
      const data = new Uint8Array(128 * 128 * 4);
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 128;
        data[i + 1] = 128;
        data[i + 2] = 255;
        data[i + 3] = 255;
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
          // Grid holes every 16 pixels
          const gx = x % 16;
          const gy = y % 16;
          const dist = Math.sqrt((gx - 8) * (gx - 8) + (gy - 8) * (gy - 8));

          let nx = 128;
          let ny = 128;
          let nz = 240;

          if (dist < 4) {
            // Indented hole normal
            nx = Math.floor(128 - (gx - 8) * 20);
            ny = Math.floor(128 - (gy - 8) * 20);
            nz = 180;
          }

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
    texture.repeat.set(8, 8);
    this.textureCache.set(key, texture);
    return texture;
  }

  // ==========================================================================
  // 2. CHASSIS & SUBSTRUCTURE METALLURGY MATERIALS
  // ==========================================================================

  public static getChassisStructuralMaterial(grade: MaterialGrade, isXRay: boolean = false): THREE.Material {
    return this.getMaterialForGrade(grade, isXRay);
  }

  public static getMaterialForGrade(grade: MaterialGrade, isXRay: boolean = false): THREE.Material {
    const key = `grade_${grade}_xray_${isXRay}`;
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key)!;
    }

    let mat: THREE.Material;

    switch (grade) {
      case 'forged':
        // Forged Billet 7075-T6 Aluminum
        mat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#94a3b8'),
          metalness: 0.94,
          roughness: 0.18,
          clearcoat: 0.4,
          clearcoatRoughness: 0.1,
          reflectivity: 0.9,
          transparent: isXRay,
          opacity: isXRay ? 0.35 : 1.0,
          wireframe: false,
        });
        break;

      case 'titanium':
        // Grade 5 Titanium Ti-6Al-4V (Slight Golden-Blue Anodized Sheen)
        mat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#cbd5e1'),
          metalness: 0.98,
          roughness: 0.14,
          clearcoat: 0.6,
          clearcoatRoughness: 0.08,
          reflectivity: 0.95,
          sheen: 0.5,
          sheenColor: new THREE.Color('#fbbf24'),
          transparent: isXRay,
          opacity: isXRay ? 0.35 : 1.0,
        });
        break;

      case 'billet':
        // CNC Milled 6061-T6 Billet
        mat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#cbd5e1'),
          metalness: 0.92,
          roughness: 0.15,
          clearcoat: 0.5,
          transparent: isXRay,
          opacity: isXRay ? 0.35 : 1.0,
        });
        break;

      case 'ceramic':
        // Carbon Ceramic / Silicon Carbide Matrix
        mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#1a1008'),
          metalness: 0.88,
          roughness: 0.24,
          normalMap: this.getCarbonWeaveNormalTexture(),
          transparent: isXRay,
          opacity: isXRay ? 0.35 : 1.0,
        });
        break;

      case 'cast':
      default:
        // Cast A356-T6 Aluminum (Micro-porous cast grain)
        mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#64748b'),
          metalness: 0.85,
          roughness: 0.45,
          transparent: isXRay,
          opacity: isXRay ? 0.35 : 1.0,
        });
        break;
    }

    this.materialCache.set(key, mat);
    return mat;
  }

  // ==========================================================================
  // 3. COMMON AUTOMOTIVE PBR HELPERS
  // ==========================================================================

  public static getAutomotivePaint(colorHex: string = '#fbbf24', roughness: number = 0.08, metalness: number = 0.9): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colorHex),
      metalness,
      roughness,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 1.0,
    });
  }

  public static getMetallicFlakePaint(
    colorHex: string = '#fbbf24',
    roughness: number = 0.12,
    flakeIntensity: number = 0.8
  ): THREE.MeshPhysicalMaterial {
    const key = `paint_metallic_${colorHex}_${roughness}_${flakeIntensity}`;
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key)! as THREE.MeshPhysicalMaterial;
    }

    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colorHex),
      metalness: 0.92,
      roughness: roughness,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      reflectivity: 1.0,
      sheen: flakeIntensity,
      sheenColor: new THREE.Color('#ffffff'),
      sheenRoughness: 0.25,
    });

    this.materialCache.set(key, mat);
    return mat;
  }

  public static getPearlescentPaint(
    baseHex: string = '#f59e0b',
    shimmerHex: string = '#fbbf24'
  ): THREE.MeshPhysicalMaterial {
    const key = `paint_pearl_${baseHex}_${shimmerHex}`;
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key)! as THREE.MeshPhysicalMaterial;
    }

    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(baseHex),
      metalness: 0.85,
      roughness: 0.10,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      sheen: 1.0,
      sheenColor: new THREE.Color(shimmerHex),
      sheenRoughness: 0.15,
      reflectivity: 0.95,
    });

    this.materialCache.set(key, mat);
    return mat;
  }

  public static getMatteSatinPaint(colorHex: string = '#334155'): THREE.MeshPhysicalMaterial {
    const key = `paint_matte_${colorHex}`;
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key)! as THREE.MeshPhysicalMaterial;
    }

    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colorHex),
      metalness: 0.4,
      roughness: 0.65,
      clearcoat: 0.15,
      clearcoatRoughness: 0.5,
      reflectivity: 0.3,
    });

    this.materialCache.set(key, mat);
    return mat;
  }

  /**
   * Generates Multi-Layer Candy Apple Deep Tint Automotive Paint
   */
  public static getCandyApplePaint(colorHex: string = '#b91c1c'): THREE.MeshPhysicalMaterial {
    const key = `paint_candy_${colorHex}`;
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key)! as THREE.MeshPhysicalMaterial;
    }

    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colorHex),
      metalness: 0.95,
      roughness: 0.04,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      reflectivity: 1.0,
      specularIntensity: 1.0,
      specularColor: new THREE.Color('#ffffff'),
      transmission: 0.15,
      sheen: 0.8,
      sheenColor: new THREE.Color(colorHex),
      sheenRoughness: 0.1,
    });

    this.materialCache.set(key, mat);
    return mat;
  }

  /**
   * Generates Chroma Shift / Chameleon Color Shifting Paint
   */
  public static getChameleonPaint(
    primaryHex: string = '#f59e0b',
    secondaryHex: string = '#f59e0b'
  ): THREE.MeshPhysicalMaterial {
    const key = `paint_chameleon_${primaryHex}_${secondaryHex}`;
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key)! as THREE.MeshPhysicalMaterial;
    }

    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(primaryHex),
      metalness: 0.90,
      roughness: 0.06,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      sheen: 1.0,
      sheenColor: new THREE.Color(secondaryHex),
      sheenRoughness: 0.12,
      reflectivity: 0.98,
    });

    this.materialCache.set(key, mat);
    return mat;
  }

  /**
   * Generates Marbled Forged Carbon Fiber Material
   */
  public static getForgedCarbon(gloss: boolean = true): THREE.MeshPhysicalMaterial {
    const key = `forged_carbon_${gloss}`;
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key)! as THREE.MeshPhysicalMaterial;
    }

    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#18181b'),
      metalness: 0.60,
      roughness: gloss ? 0.14 : 0.45,
      clearcoat: gloss ? 1.0 : 0.2,
      clearcoatRoughness: gloss ? 0.03 : 0.4,
      normalMap: this.getCarbonWeaveNormalTexture(),
    });

    this.materialCache.set(key, mat);
    return mat;
  }

  /**
   * Generates Optical-Grade Dielectric Tinted Glass Material
   */
  public static getDielectricGlass(
    tintHex: string = '#1a1008',
    opacity: number = 0.65,
    ior: number = 1.52
  ): THREE.MeshPhysicalMaterial {
    const key = `glass_dielectric_${tintHex}_${opacity}_${ior}`;
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key)! as THREE.MeshPhysicalMaterial;
    }

    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(tintHex),
      transmission: 0.92,
      transparent: true,
      opacity,
      ior,
      metalness: 0.05,
      roughness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      depthWrite: false,
    });

    this.materialCache.set(key, mat);
    return mat;
  }

  /**
   * Generates FEA Von Mises Stress Heatmap Material for Chassis Frame & Suspension
   * Load Path Inspection (Low Stress: Cyan/Blue -> Nominal: Green -> Peak Yield: Amber/Crimson)
   */
  public static getFeaStressMaterial(stressRatio: number = 0.5, isXRay: boolean = false): THREE.MeshPhysicalMaterial {
    const clamped = Math.max(0, Math.min(1, stressRatio));
    const key = `fea_stress_${clamped.toFixed(2)}_xray_${isXRay}`;
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key)! as THREE.MeshPhysicalMaterial;
    }

    // Von Mises Color Map Interpolation:
    // 0.0 -> Blue (#0284c7)
    // 0.25 -> Cyan (#f59e0b)
    // 0.50 -> Emerald (#10b981)
    // 0.75 -> Amber (#f59e0b)
    // 1.0 -> Crimson (#ef4444)
    let color: THREE.Color;
    if (clamped < 0.25) {
      color = new THREE.Color('#0284c7').lerp(new THREE.Color('#f59e0b'), clamped / 0.25);
    } else if (clamped < 0.5) {
      color = new THREE.Color('#f59e0b').lerp(new THREE.Color('#10b981'), (clamped - 0.25) / 0.25);
    } else if (clamped < 0.75) {
      color = new THREE.Color('#10b981').lerp(new THREE.Color('#f59e0b'), (clamped - 0.5) / 0.25);
    } else {
      color = new THREE.Color('#f59e0b').lerp(new THREE.Color('#ef4444'), (clamped - 0.75) / 0.25);
    }

    const mat = new THREE.MeshPhysicalMaterial({
      color,
      emissive: color.clone().multiplyScalar(0.35),
      metalness: 0.85,
      roughness: 0.25,
      clearcoat: 0.5,
      transparent: isXRay,
      opacity: isXRay ? 0.45 : 0.95,
      wireframe: false,
    });

    this.materialCache.set(key, mat);
    return mat;
  }

  /**
   * Generates FEA Load-Case Specific Stress Distribution Material
   * (Torsional Twist 45 kNm/deg, Lateral Cornering 1.8G, Braking 1.5G, Frontal Crash)
   */
  public static getFeaLoadCaseStressMaterial(
    loadCase: 'torsional' | 'cornering' | 'braking' | 'crash',
    stressRatio: number = 0.5,
    isXRay: boolean = false
  ): THREE.MeshPhysicalMaterial {
    // Dynamic bias based on load case engineering profile
    let effectiveRatio = stressRatio;
    switch (loadCase) {
      case 'torsional':
        effectiveRatio = Math.min(1.0, stressRatio * 1.15); // Diagonal shear concentration
        break;
      case 'cornering':
        effectiveRatio = Math.min(1.0, stressRatio * 1.25); // Lateral wishbone/sill load
        break;
      case 'braking':
        effectiveRatio = Math.min(1.0, stressRatio * 1.10); // Forward rail compression
        break;
      case 'crash':
        effectiveRatio = 0.92; // Near-yield deformation zone
        break;
    }
    return this.getFeaStressMaterial(effectiveRatio, isXRay);
  }

  /**
   * Generates Dedicated Chassis Metallurgy Material (Titanium, 6061-T6 Aluminum, 4130 Chromoly, Carbon Tub, Hardox Steel)
   */
  public static getChassisMetallurgyMaterial(
    metalType: 'titanium' | 'aluminum_6061' | 'chromoly_4130' | 'carbon_autoclave' | 'hardox_steel',
    weldBluing: boolean = false
  ): THREE.Material {
    const key = `chassis_metal_${metalType}_weld_${weldBluing}`;
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key)!;
    }

    let mat: THREE.Material;
    switch (metalType) {
      case 'titanium':
        mat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(weldBluing ? '#7c8ba1' : '#94a3b8'),
          metalness: 0.94,
          roughness: 0.22,
          clearcoat: 0.6,
          reflectivity: 0.95,
          sheen: weldBluing ? 0.8 : 0,
          sheenColor: new THREE.Color('#fbbf24'),
        });
        break;
      case 'aluminum_6061':
        mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#cbd5e1'),
          metalness: 0.88,
          roughness: 0.32,
        });
        break;
      case 'chromoly_4130':
        mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#475569'),
          metalness: 0.82,
          roughness: 0.38,
        });
        break;
      case 'carbon_autoclave':
        mat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#111827'),
          metalness: 0.65,
          roughness: 0.18,
          clearcoat: 0.9,
          clearcoatRoughness: 0.05,
          normalMap: this.getCarbonWeaveNormalTexture(),
        });
        break;
      case 'hardox_steel':
      default:
        mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#334155'),
          metalness: 0.75,
          roughness: 0.48,
        });
        break;
    }

    this.materialCache.set(key, mat);
    return mat;
  }

  public static getCarbonFiber(gloss: boolean = true): THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial {
    if (gloss) {
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#1a1008'),
        metalness: 0.94,
        roughness: 0.12,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        normalMap: this.getCarbonWeaveNormalTexture(),
      });
    }
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1a1008'),
      metalness: 0.9,
      roughness: 0.38,
      normalMap: this.getCarbonWeaveNormalTexture(),
    });
  }

  public static getBrakeRotorMaterial(crossDrilled: boolean = false): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#334155'),
      metalness: 0.90,
      roughness: 0.24,
      normalMap: this.getBrakeRotorNormalTexture(),
    });
  }

  public static getTireRubberMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#11141a'),
      roughness: 0.88,
      metalness: 0.08,
    });
  }

  public static getOpticalGlass(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#fbbf24'),
      metalness: 0.1,
      roughness: 0.02,
      transmission: 0.95,
      transparent: true,
      opacity: 0.6,
      ior: 1.52,
    });
  }

  // ==========================================================================
  // 4. INTERIOR LUXURY MATERIALS
  // ==========================================================================

  public static getInteriorTrimMaterial(trim: InteriorTrimGrade): {
    primary: THREE.Material;
    accent: THREE.Material;
    stitching: THREE.Material;
    screenGlass: THREE.Material;
  } {
    switch (trim) {
      case 'forged_carbon':
        return {
          primary: new THREE.MeshStandardMaterial({
            color: new THREE.Color('#090d16'),
            metalness: 0.9,
            roughness: 0.3,
            normalMap: this.getCarbonWeaveNormalTexture(),
          }),
          accent: new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#ef4444'),
            metalness: 0.95,
            roughness: 0.12,
            clearcoat: 0.8,
          }),
          stitching: new THREE.MeshBasicMaterial({ color: 0xef4444 }),
          screenGlass: new THREE.MeshPhysicalMaterial({
            color: 0x0284c7,
            transmission: 0.9,
            roughness: 0.05,
            ior: 1.5,
          }),
        };

      case 'alcantara_race':
        return {
          primary: new THREE.MeshStandardMaterial({
            color: new THREE.Color('#1e293b'),
            roughness: 0.92,
            metalness: 0.05,
          }),
          accent: new THREE.MeshStandardMaterial({
            color: new THREE.Color('#fbbf24'),
            metalness: 0.8,
            roughness: 0.2,
          }),
          stitching: new THREE.MeshBasicMaterial({ color: 0xfbbf24 }),
          screenGlass: new THREE.MeshPhysicalMaterial({
            color: 0x0284c7,
            transmission: 0.9,
            roughness: 0.05,
            ior: 1.5,
          }),
        };

      case 'nappa_leather':
      default:
        return {
          primary: new THREE.MeshStandardMaterial({
            color: new THREE.Color('#1a1008'),
            roughness: 0.65,
            metalness: 0.1,
            normalMap: this.getPerforatedLeatherNormalTexture(),
          }),
          accent: new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#d4d4d8'),
            metalness: 0.98,
            roughness: 0.12,
            clearcoat: 0.7,
          }),
          stitching: new THREE.MeshBasicMaterial({ color: 0xf59e0b }),
          screenGlass: new THREE.MeshPhysicalMaterial({
            color: 0x0284c7,
            transmission: 0.9,
            roughness: 0.05,
            ior: 1.5,
          }),
        };
    }
  }

  // ==========================================================================
  // 5. SUSPENSION SPRINGS & BRAKE ROTORS
  // ==========================================================================

  public static getSuspensionSpringMaterial(rateNmm: number): THREE.Material {
    const color = rateNmm > 80 ? new THREE.Color('#ef4444') : new THREE.Color('#d97706');
    return new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.75,
      roughness: 0.18,
      clearcoat: 0.9,
      clearcoatRoughness: 0.05,
    });
  }

  public static getBrakeRotorMachinedMaterial(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#475569'),
      metalness: 0.92,
      roughness: 0.22,
      normalMap: this.getBrakeRotorNormalTexture(),
    });
  }
}
