/**
 * ============================================================================
 * ULTRA-FIDELITY AUTOMOTIVE INTERIOR PBR MATERIAL & TEXTURE SYNTHESIZER
 * ============================================================================
 * Generates photorealistic physical PBR materials with high-definition
 * procedural normal maps, roughness maps, metallic sheens, and anisotropic
 * reflections for all automotive interior subassemblies:
 * 1. Nappa, Semi-Aniline & Saddle Leathers (Plain, Micro-Perforated, Diamond-Quilted)
 * 2. Alcantara & Dinamica Synthetic Micro-Suede (Fuzz Sheen & Nap Orientation)
 * 3. Dry Matte, High-Gloss 3K Twill & Forged Marble Carbon Fiber Composites
 * 4. Open-Pore Natural Hardwoods (Santos Rosewood, Piano Black, Burl Walnut)
 * 5. Aerospace Metals (Brushed Billet Aluminum, Dark Knurled Titanium, Polished Chrome, Rose Gold)
 * 6. Crystal Glass, Polycarbonate & Anti-Reflective Curved OLED Display Cover Surfaces
 * 7. 64-Color Ambient Fiber-Optic Lightguide Luminescence Shaders
 * ============================================================================
 */

import * as THREE from "three";
import { InteriorMaterialType } from "../../sim/interior/masterInteriorTypes";

export type InteriorNormalMapType =
  | "nappa_leather_grain"
  | "saddle_leather_creases"
  | "perforated_ventilation_dots"
  | "diamond_french_double_stitch"
  | "hexagon_quilted_seams"
  | "carbon_fiber_2x2_twill"
  | "forged_carbon_marble"
  | "open_pore_wood_grain"
  | "brushed_radial_aluminum"
  | "knurled_diamond_grip"
  | "tufted_wool_carpet_weave"
  | "alcantara_micro_fuzz";

export interface MasterPbrMaterialConfig {
  id: string;
  name: string;
  materialType: InteriorMaterialType;
  baseColorHex: string;
  roughness: number;
  metalness: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  sheen?: number;
  sheenColorHex?: string;
  sheenRoughness?: number;
  transmission?: number;
  ior?: number;
  bumpScale?: number;
  envMapIntensity?: number;
  emissiveHex?: string;
  emissiveIntensity?: number;
  normalMapType?: InteriorNormalMapType;
  normalScaleX?: number;
  normalScaleY?: number;
  uvRepeatU?: number;
  uvRepeatV?: number;
}

export class InteriorPbrMaterialSynthesizer {
  private static instance: InteriorPbrMaterialSynthesizer | null = null;
  private materialCache: Map<string, THREE.MeshPhysicalMaterial> = new Map();
  private textureCache: Map<string, THREE.CanvasTexture> = new Map();

  public static getInstance(): InteriorPbrMaterialSynthesizer {
    if (!this.instance) {
      this.instance = new InteriorPbrMaterialSynthesizer();
    }
    return this.instance;
  }

  // ==========================================================================
  // 1. PROCEDURAL TEXTURE GENERATION ENGINE (2D Canvas to WebGL CanvasTexture)
  // ==========================================================================

  /**
   * Synthesizes or retrieves cached procedural normal map texture
   */
  public getProceduralTexture(type: InteriorNormalMapType, resolution: number = 512): THREE.CanvasTexture | null {
    if (typeof document === "undefined") return null;

    const cacheKey = `${type}_${resolution}`;
    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!;
    }

    const canvas = document.createElement("canvas");
    canvas.width = resolution;
    canvas.height = resolution;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    switch (type) {
      case "nappa_leather_grain":
        this.generateNappaLeatherNormalMap(ctx, resolution);
        break;
      case "saddle_leather_creases":
        this.generateSaddleLeatherCreasesMap(ctx, resolution);
        break;
      case "perforated_ventilation_dots":
        this.generatePerforatedDotsNormalMap(ctx, resolution);
        break;
      case "diamond_french_double_stitch":
        this.generateDiamondStitchNormalMap(ctx, resolution);
        break;
      case "hexagon_quilted_seams":
        this.generateHexagonQuiltNormalMap(ctx, resolution);
        break;
      case "carbon_fiber_2x2_twill":
        this.generateCarbonTwillNormalMap(ctx, resolution);
        break;
      case "forged_carbon_marble":
        this.generateForgedCarbonNormalMap(ctx, resolution);
        break;
      case "open_pore_wood_grain":
        this.generateOpenPoreWoodNormalMap(ctx, resolution);
        break;
      case "brushed_radial_aluminum":
        this.generateBrushedMetalNormalMap(ctx, resolution);
        break;
      case "knurled_diamond_grip":
        this.generateKnurledDiamondNormalMap(ctx, resolution);
        break;
      case "tufted_wool_carpet_weave":
        this.generateTuftedCarpetNormalMap(ctx, resolution);
        break;
      case "alcantara_micro_fuzz":
        this.generateAlcantaraFuzzNormalMap(ctx, resolution);
        break;
      default:
        return null;
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;

    this.textureCache.set(cacheKey, texture);
    return texture;
  }

  // --------------------------------------------------------------------------
  // Procedural Canvas Texture Synthesizers
  // --------------------------------------------------------------------------

  private generateNappaLeatherNormalMap(ctx: CanvasRenderingContext2D, size: number): void {
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const nx = Math.sin(x * 0.35) * Math.cos(y * 0.35) * 18;
        const ny = Math.cos(x * 0.35) * Math.sin(y * 0.35) * 18;
        const microNoise = (Math.random() - 0.5) * 10;

        data[idx] = Math.min(255, Math.max(0, 128 + nx + microNoise));
        data[idx + 1] = Math.min(255, Math.max(0, 128 + ny + microNoise));
        data[idx + 2] = 255;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  private generateSaddleLeatherCreasesMap(ctx: CanvasRenderingContext2D, size: number): void {
    ctx.fillStyle = "#8080ff";
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = "rgba(100, 100, 255, 0.4)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      const startX = Math.random() * size;
      const startY = Math.random() * size;
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(
        startX + (Math.random() - 0.5) * 60,
        startY + (Math.random() - 0.5) * 60,
        startX + (Math.random() - 0.5) * 120,
        startY + (Math.random() - 0.5) * 120,
        startX + (Math.random() - 0.5) * 180,
        startY + (Math.random() - 0.5) * 180
      );
      ctx.stroke();
    }
  }

  private generatePerforatedDotsNormalMap(ctx: CanvasRenderingContext2D, size: number): void {
    ctx.fillStyle = "#8080ff";
    ctx.fillRect(0, 0, size, size);

    const step = 16;
    const radius = 2.5;

    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        const offsetX = (y / step) % 2 === 0 ? 0 : step / 2;
        const cx = (x + offsetX) % size;
        const cy = y;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, "#4040ff");
        grad.addColorStop(0.7, "#6060ff");
        grad.addColorStop(1, "#8080ff");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private generateDiamondStitchNormalMap(ctx: CanvasRenderingContext2D, size: number): void {
    ctx.fillStyle = "#8080ff";
    ctx.fillRect(0, 0, size, size);

    const diamondSize = 64;
    ctx.strokeStyle = "#4040ff";
    ctx.lineWidth = 3;

    for (let y = -size; y < size * 2; y += diamondSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y + size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(size, y);
      ctx.lineTo(0, y + size);
      ctx.stroke();
    }

    ctx.strokeStyle = "#a0a0ff";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);

    for (let y = -size; y < size * 2; y += diamondSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y + size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(size, y);
      ctx.lineTo(0, y + size);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  private generateHexagonQuiltNormalMap(ctx: CanvasRenderingContext2D, size: number): void {
    ctx.fillStyle = "#8080ff";
    ctx.fillRect(0, 0, size, size);

    const r = 28;
    const h = r * Math.sqrt(3);

    ctx.strokeStyle = "#5050ff";
    ctx.lineWidth = 2.5;

    for (let y = -h; y < size + h; y += h) {
      for (let x = -r * 3; x < size + r * 3; x += r * 3) {
        const row = Math.floor(y / h);
        const cx = x + (row % 2 === 0 ? 0 : r * 1.5);
        const cy = y;

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const px = cx + r * Math.cos(angle);
          const py = cy + r * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
  }

  private generateCarbonTwillNormalMap(ctx: CanvasRenderingContext2D, size: number): void {
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;
    const patternSize = 8;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const cellX = Math.floor(x / patternSize);
        const cellY = Math.floor(y / patternSize);
        const isTwill = (cellX + cellY) % 4 < 2;

        const slope = isTwill ? (x % patternSize) - patternSize / 2 : (y % patternSize) - patternSize / 2;
        const norm = (slope / patternSize) * 60;

        data[idx] = Math.min(255, Math.max(0, 128 + norm));
        data[idx + 1] = Math.min(255, Math.max(0, 128 - norm));
        data[idx + 2] = 255;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  private generateForgedCarbonNormalMap(ctx: CanvasRenderingContext2D, size: number): void {
    ctx.fillStyle = "#8080ff";
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 180; i++) {
      const cx = Math.random() * size;
      const cy = Math.random() * size;
      const w = 15 + Math.random() * 35;
      const h = 10 + Math.random() * 20;
      const angle = Math.random() * Math.PI * 2;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      const r = Math.floor(110 + Math.random() * 36);
      const g = Math.floor(110 + Math.random() * 36);
      ctx.fillStyle = `rgb(${r}, ${g}, 255)`;

      ctx.beginPath();
      ctx.moveTo(-w / 2, -h / 2);
      ctx.lineTo(w / 2, -h / 4);
      ctx.lineTo(w / 3, h / 2);
      ctx.lineTo(-w / 2, h / 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  private generateOpenPoreWoodNormalMap(ctx: CanvasRenderingContext2D, size: number): void {
    ctx.fillStyle = "#8080ff";
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = "rgba(80, 80, 255, 0.4)";
    ctx.lineWidth = 1;

    for (let y = 0; y < size; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      let prevY = y;
      for (let x = 0; x < size; x += 16) {
        const ny = y + Math.sin(x * 0.05) * 2 + (Math.random() - 0.5) * 1.5;
        ctx.lineTo(x, ny);
        prevY = ny;
      }
      ctx.stroke();
    }
  }

  private generateBrushedMetalNormalMap(ctx: CanvasRenderingContext2D, size: number): void {
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const streak = (Math.random() - 0.5) * 25;

        data[idx] = Math.min(255, Math.max(0, 128 + streak));
        data[idx + 1] = 128;
        data[idx + 2] = 255;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  private generateKnurledDiamondNormalMap(ctx: CanvasRenderingContext2D, size: number): void {
    ctx.fillStyle = "#8080ff";
    ctx.fillRect(0, 0, size, size);

    const pitch = 8;
    for (let y = 0; y < size; y += pitch) {
      for (let x = 0; x < size; x += pitch) {
        const grad = ctx.createRadialGradient(x + pitch / 2, y + pitch / 2, 0, x + pitch / 2, y + pitch / 2, pitch / 2);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.8, "#6060ff");
        grad.addColorStop(1, "#8080ff");

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, pitch, pitch);
      }
    }
  }

  private generateTuftedCarpetNormalMap(ctx: CanvasRenderingContext2D, size: number): void {
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const loop = (Math.sin(x * 1.5) * Math.sin(y * 1.5) + (Math.random() - 0.5) * 0.8) * 35;

        data[idx] = Math.min(255, Math.max(0, 128 + loop));
        data[idx + 1] = Math.min(255, Math.max(0, 128 + loop));
        data[idx + 2] = 255;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  private generateAlcantaraFuzzNormalMap(ctx: CanvasRenderingContext2D, size: number): void {
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const fuzz = (Math.sin(x * 0.8) * Math.cos(y * 0.8) + (Math.random() - 0.5) * 1.2) * 14;

        data[idx] = Math.min(255, Math.max(0, 128 + fuzz));
        data[idx + 1] = Math.min(255, Math.max(0, 128 + fuzz));
        data[idx + 2] = 255;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // ==========================================================================
  // 2. MASTER PBR PHYSICAL MATERIAL FACTORY
  // ==========================================================================

  public createPhysicalMaterial(config: MasterPbrMaterialConfig): THREE.MeshPhysicalMaterial {
    const cacheKey = `${config.id}_${config.baseColorHex}_${config.roughness}_${config.metalness}_${config.normalMapType || "none"}`;
    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey)!;
    }

    const baseColor = new THREE.Color(config.baseColorHex);
    const sheenColor = config.sheenColorHex ? new THREE.Color(config.sheenColorHex) : baseColor.clone().offsetHSL(0, -0.1, 0.2);

    const mat = new THREE.MeshPhysicalMaterial({
      color: baseColor,
      roughness: Math.max(0.02, Math.min(1.0, config.roughness)),
      metalness: Math.max(0.0, Math.min(1.0, config.metalness)),
      clearcoat: config.clearcoat || 0,
      clearcoatRoughness: config.clearcoatRoughness || 0.1,
      sheen: config.sheen || 0,
      sheenColor,
      sheenRoughness: config.sheenRoughness || 0.4,
      transmission: config.transmission || 0,
      transparent: (config.transmission || 0) > 0.05,
      opacity: (config.transmission || 0) > 0.05 ? 1.0 - (config.transmission || 0) * 0.4 : 1.0,
      ior: config.ior || 1.5,
      envMapIntensity: config.envMapIntensity ?? 1.2,
    });

    if (config.emissiveHex && config.emissiveIntensity) {
      mat.emissive = new THREE.Color(config.emissiveHex);
      mat.emissiveIntensity = config.emissiveIntensity;
    }

    if (config.normalMapType) {
      const normalTex = this.getProceduralTexture(config.normalMapType);
      if (normalTex) {
        mat.normalMap = normalTex;
        const scaleX = config.normalScaleX ?? config.bumpScale ?? 0.8;
        const scaleY = config.normalScaleY ?? config.bumpScale ?? 0.8;
        mat.normalScale = new THREE.Vector2(scaleX, scaleY);

        if (config.uvRepeatU && config.uvRepeatV) {
          mat.normalMap.repeat.set(config.uvRepeatU, config.uvRepeatV);
        }
      }
    }

    this.materialCache.set(cacheKey, mat);
    return mat;
  }

  // ==========================================================================
  // 3. CURATED AUTOMOTIVE INTERIOR PRESETS
  // ==========================================================================

  public static getPresetMaterial(preset: "nappa_leather_black" | "nappa_leather_cognac" | "saddle_tan" | "alcantara_anthracite" | "carbon_fiber_twill" | "forged_carbon" | "santos_rosewood" | "piano_black" | "brushed_aluminum" | "knurled_titanium" | "polished_chrome" | "crystal_glass" | "oled_screen" | "carpet_black" | "ambient_led_cyan"): THREE.MeshPhysicalMaterial {
    const synth = InteriorPbrMaterialSynthesizer.getInstance();

    switch (preset) {
      case "nappa_leather_black":
        return synth.createPhysicalMaterial({
          id: "mat_nappa_black",
          name: "Beluga Nappa Leather",
          materialType: "nappa_leather",
          baseColorHex: "#141518",
          roughness: 0.52,
          metalness: 0.04,
          sheen: 0.65,
          sheenRoughness: 0.35,
          normalMapType: "nappa_leather_grain",
          bumpScale: 0.45,
          uvRepeatU: 6,
          uvRepeatV: 6,
        });

      case "nappa_leather_cognac":
        return synth.createPhysicalMaterial({
          id: "mat_nappa_cognac",
          name: "Imperial Cognac Leather",
          materialType: "nappa_leather",
          baseColorHex: "#9b552b",
          roughness: 0.48,
          metalness: 0.02,
          sheen: 0.75,
          sheenRoughness: 0.3,
          normalMapType: "nappa_leather_grain",
          bumpScale: 0.5,
          uvRepeatU: 6,
          uvRepeatV: 6,
        });

      case "saddle_tan":
        return synth.createPhysicalMaterial({
          id: "mat_saddle_tan",
          name: "Heritage Saddle Tan",
          materialType: "semi_aniline_leather",
          baseColorHex: "#af6e3d",
          roughness: 0.55,
          metalness: 0.02,
          sheen: 0.8,
          sheenRoughness: 0.4,
          normalMapType: "saddle_leather_creases",
          bumpScale: 0.6,
          uvRepeatU: 4,
          uvRepeatV: 4,
        });

      case "alcantara_anthracite":
        return synth.createPhysicalMaterial({
          id: "mat_alcantara_anthracite",
          name: "Anthracite Alcantara",
          materialType: "perforated_alcantara",
          baseColorHex: "#22242b",
          roughness: 0.92,
          metalness: 0.0,
          sheen: 0.95,
          sheenColorHex: "#454955",
          sheenRoughness: 0.85,
          normalMapType: "alcantara_micro_fuzz",
          bumpScale: 0.35,
          uvRepeatU: 8,
          uvRepeatV: 8,
        });

      case "carbon_fiber_twill":
        return synth.createPhysicalMaterial({
          id: "mat_carbon_twill",
          name: "3K Gloss Carbon Fiber",
          materialType: "3k_twill_carbon_fiber",
          baseColorHex: "#111215",
          roughness: 0.12,
          metalness: 0.25,
          clearcoat: 1.0,
          clearcoatRoughness: 0.04,
          normalMapType: "carbon_fiber_2x2_twill",
          bumpScale: 0.7,
          uvRepeatU: 10,
          uvRepeatV: 10,
        });

      case "forged_carbon":
        return synth.createPhysicalMaterial({
          id: "mat_forged_carbon",
          name: "Forged Composite Carbon",
          materialType: "forged_carbon_composite",
          baseColorHex: "#16181d",
          roughness: 0.35,
          metalness: 0.15,
          clearcoat: 0.6,
          clearcoatRoughness: 0.18,
          normalMapType: "forged_carbon_marble",
          bumpScale: 0.85,
          uvRepeatU: 4,
          uvRepeatV: 4,
        });

      case "santos_rosewood":
        return synth.createPhysicalMaterial({
          id: "mat_santos_rosewood",
          name: "Open-Pore Santos Rosewood",
          materialType: "open_pore_walnut",
          baseColorHex: "#4e2b1b",
          roughness: 0.68,
          metalness: 0.0,
          normalMapType: "open_pore_wood_grain",
          bumpScale: 0.6,
          uvRepeatU: 3,
          uvRepeatV: 3,
        });

      case "piano_black":
        return synth.createPhysicalMaterial({
          id: "mat_piano_black",
          name: "Mirror Gloss Piano Black",
          materialType: "piano_black_lacquer",
          baseColorHex: "#050608",
          roughness: 0.02,
          metalness: 0.08,
          clearcoat: 1.0,
          clearcoatRoughness: 0.01,
          envMapIntensity: 2.0,
        });

      case "brushed_aluminum":
        return synth.createPhysicalMaterial({
          id: "mat_brushed_aluminum",
          name: "Aerospace Brushed Aluminum",
          materialType: "brushed_billet_aluminum",
          baseColorHex: "#d8dee9",
          roughness: 0.28,
          metalness: 0.95,
          clearcoat: 0.2,
          normalMapType: "brushed_radial_aluminum",
          bumpScale: 0.4,
          uvRepeatU: 6,
          uvRepeatV: 6,
        });

      case "knurled_titanium":
        return synth.createPhysicalMaterial({
          id: "mat_knurled_titanium",
          name: "Diamond Knurled Dark Titanium",
          materialType: "titanium_satin_finish",
          baseColorHex: "#4c566a",
          roughness: 0.32,
          metalness: 0.92,
          normalMapType: "knurled_diamond_grip",
          bumpScale: 0.9,
          uvRepeatU: 12,
          uvRepeatV: 12,
        });

      case "polished_chrome":
        return synth.createPhysicalMaterial({
          id: "mat_polished_chrome",
          name: "Electroplated Chrome",
          materialType: "brushed_billet_aluminum",
          baseColorHex: "#ffffff",
          roughness: 0.02,
          metalness: 0.98,
          clearcoat: 1.0,
          envMapIntensity: 2.2,
        });

      case "crystal_glass":
        return synth.createPhysicalMaterial({
          id: "mat_crystal_glass",
          name: "Optical Crystal Glass",
          materialType: "brushed_billet_aluminum",
          baseColorHex: "#ffffff",
          roughness: 0.03,
          metalness: 0.0,
          transmission: 0.92,
          ior: 1.54,
          clearcoat: 1.0,
        });

      case "oled_screen":
        return synth.createPhysicalMaterial({
          id: "mat_oled_screen",
          name: "Anti-Reflective Curved OLED Display",
          materialType: "piano_black_lacquer",
          baseColorHex: "#020305",
          roughness: 0.08,
          metalness: 0.05,
          clearcoat: 0.95,
          clearcoatRoughness: 0.02,
          emissiveHex: "#00f0ff",
          emissiveIntensity: 0.2,
        });

      case "carpet_black":
        return synth.createPhysicalMaterial({
          id: "mat_carpet_black",
          name: "Deep-Pile Tufted Wool Carpet",
          materialType: "perforated_alcantara",
          baseColorHex: "#18191c",
          roughness: 0.95,
          metalness: 0.0,
          normalMapType: "tufted_wool_carpet_weave",
          bumpScale: 0.7,
          uvRepeatU: 10,
          uvRepeatV: 10,
        });

      case "ambient_led_cyan":
        return synth.createPhysicalMaterial({
          id: "mat_ambient_cyan",
          name: "Ambient Lightguide Fiber-Optic Cyan",
          materialType: "piano_black_lacquer",
          baseColorHex: "#00f0ff",
          roughness: 0.2,
          metalness: 0.0,
          emissiveHex: "#00f0ff",
          emissiveIntensity: 2.5,
        });
    }
  }
}
