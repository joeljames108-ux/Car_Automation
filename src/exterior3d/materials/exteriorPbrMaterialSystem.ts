// ===================================================================
// EXTERIOR PBR PHYSICAL MATERIAL SYSTEM (THREE.JS)
// ===================================================================
// Multi-layer physical materials: automotive clear coats, dry/wet carbon,
// optical glass, tire compounds, anodized alloys, and laser LEDs.
// ===================================================================

import * as THREE from "three";
import type { MaterialGrade } from "../../sim/assemblyTypes";
import type { PaintSystemConfig, PaintFinishType } from "../../sim/types/exterior";

export class ExteriorMaterialLibrary {
  private static cache: Map<string, THREE.Material> = new Map();

  public static getPaintMaterial(paintConfig: PaintSystemConfig): THREE.MeshPhysicalMaterial {
    const key = `paint_${paintConfig.primaryColorHex}_${paintConfig.finishType}`;
    if (this.cache.has(key)) {
      return this.cache.get(key) as THREE.MeshPhysicalMaterial;
    }

    const hex = parseInt(paintConfig.primaryColorHex.replace("#", "0x"), 16);
    const finish = paintConfig.finishType;

    let roughness = 0.12;
    let metalness = 0.85;
    let clearcoat = 1.0;
    let clearcoatRoughness = 0.05;
    let iridescence = 0.0;

    switch (finish) {
      case "high_gloss_mirror":
        roughness = 0.05;
        metalness = 0.2;
        clearcoat = 1.0;
        clearcoatRoughness = 0.02;
        break;
      case "liquid_metallic":
        roughness = 0.15;
        metalness = 0.9;
        clearcoat = 0.95;
        break;
      case "deep_satin_matte":
        roughness = 0.45;
        metalness = 0.5;
        clearcoat = 0.0;
        break;
      case "raw_matte_frost":
        roughness = 0.75;
        metalness = 0.1;
        clearcoat = 0.0;
        break;
      case "tri_coat_pearl_iridescent":
        roughness = 0.12;
        metalness = 0.4;
        clearcoat = 1.0;
        iridescence = 0.85;
        break;
      case "candy_translucent_tint":
        roughness = 0.08;
        metalness = 0.3;
        clearcoat = 1.0;
        break;
      case "full_mirror_chrome":
        roughness = 0.02;
        metalness = 1.0;
        clearcoat = 1.0;
        break;
      case "chameleon_colorshift":
        roughness = 0.15;
        metalness = 0.6;
        clearcoat = 1.0;
        iridescence = 1.0;
        break;
      case "exposed_tinted_carbon":
        roughness = 0.25;
        metalness = 0.8;
        clearcoat = 0.8;
        break;
      default:
        roughness = 0.15;
        metalness = 0.85;
    }

    const mat = new THREE.MeshPhysicalMaterial({
      color: hex,
      roughness,
      metalness,
      clearcoat,
      clearcoatRoughness,
      iridescence,
      ior: 1.5,
      name: `Automotive_Paint_${finish}`,
    });

    this.cache.set(key, mat);
    return mat;
  }

  public static getCarbonMaterial(): THREE.MeshStandardMaterial {
    const key = "carbon_twill";
    if (this.cache.has(key)) return this.cache.get(key) as THREE.MeshStandardMaterial;

    const mat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.25,
      metalness: 0.9,
      name: "Carbon_PrePreg_Twill",
    });

    this.cache.set(key, mat);
    return mat;
  }

  public static getGlassMaterial(transmission = 0.92): THREE.MeshPhysicalMaterial {
    const key = `glass_${transmission}`;
    if (this.cache.has(key)) return this.cache.get(key) as THREE.MeshPhysicalMaterial;

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xfbbf24,
      transmission,
      opacity: 1,
      transparent: true,
      roughness: 0.02,
      ior: 1.52,
      name: "Automotive_Acoustic_Glass",
    });

    this.cache.set(key, mat);
    return mat;
  }

  public static getTireRubberMaterial(): THREE.MeshStandardMaterial {
    const key = "tire_rubber";
    if (this.cache.has(key)) return this.cache.get(key) as THREE.MeshStandardMaterial;

    const mat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.85,
      metalness: 0.08,
      name: "Tire_Compound_Rubber",
    });

    this.cache.set(key, mat);
    return mat;
  }

  public static getLightingEmissiveMaterial(hex = 0xfbbf24, intensity = 2.5): THREE.MeshStandardMaterial {
    const key = `emissive_${hex}_${intensity}`;
    if (this.cache.has(key)) return this.cache.get(key) as THREE.MeshStandardMaterial;

    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: hex,
      emissiveIntensity: intensity,
      roughness: 0.1,
      name: "Lighting_Emissive_LED",
    });

    this.cache.set(key, mat);
    return mat;
  }
}
