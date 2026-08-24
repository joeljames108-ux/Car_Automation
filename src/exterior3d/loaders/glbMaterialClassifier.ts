// ============================================================================
// GLB MATERIAL CLASSIFIER
// ============================================================================
// Automatically classifies GLB materials by type (paint, glass, rubber,
// metal, carbon, interior) based on color, metalness, roughness, and name
// heuristics, then applies appropriate PBR properties for photorealism.
// ============================================================================

import * as THREE from 'three';

export type MaterialType = 'paint' | 'glass' | 'rubber' | 'metal' | 'carbon' | 'interior' | 'chrome' | 'emissive' | 'unknown';

export interface MaterialClassification {
  type: MaterialType;
  confidence: number;
  originalColor: THREE.Color;
  suggestedProperties: Partial<THREE.MeshPhysicalMaterialParameters>;
}

const GLASS_KEYWORDS = ['glass', 'window', 'windshield', 'windscreen', 'mirror', 'lens', 'headlight', 'taillight', 'light'];
const RUBBER_KEYWORDS = ['rubber', 'tire', 'tyre', 'seal', 'gasket', 'wiper', 'mat'];
const METAL_KEYWORDS = ['metal', 'steel', 'aluminum', 'alloy', 'chrome', 'exhaust', 'brake', 'rotor', 'caliper', 'engine', 'block'];
const CARBON_KEYWORDS = ['carbon', 'cf', 'fiber', 'fibre', 'composite'];
const PAINT_KEYWORDS = ['paint', 'body', 'panel', 'hood', 'door', 'fender', 'wing', 'roof', 'bumper', 'trunk', 'decklid'];
const INTERIOR_KEYWORDS = ['interior', 'leather', 'seat', 'dashboard', 'dash', 'console', 'steering', 'carpet', 'fabric', 'alcantara'];
const EMISSIVE_KEYWORDS = ['emissive', 'glow', 'led', 'neon', 'accent', 'ambient'];

export type ClassifiableMaterial = THREE.Material & {
  color?: THREE.Color;
  roughness?: number;
  metalness?: number;
  opacity?: number;
  transparent?: boolean;
  emissive?: THREE.Color;
  emissiveIntensity?: number;
  transmission?: number;
  clearcoat?: number;
  ior?: number;
};

export class GLBMaterialClassifier {
  /**
   * Classify a material by type based on its properties and name
   */
  public static classify(material: THREE.Material): MaterialClassification {
    const name = material.name.toLowerCase();
    const mat = material as ClassifiableMaterial;

    // Check name keywords first
    if (GLASS_KEYWORDS.some(k => name.includes(k))) {
      return this.createClassification('glass', 0.9, material, this.getGlassProperties(mat));
    }
    if (RUBBER_KEYWORDS.some(k => name.includes(k))) {
      return this.createClassification('rubber', 0.85, material, this.getRubberProperties(mat));
    }
    if (CARBON_KEYWORDS.some(k => name.includes(k))) {
      return this.createClassification('carbon', 0.85, material, this.getCarbonProperties(mat));
    }
    if (EMISSIVE_KEYWORDS.some(k => name.includes(k))) {
      return this.createClassification('emissive', 0.8, material, this.getEmissiveProperties(mat));
    }
    if (INTERIOR_KEYWORDS.some(k => name.includes(k))) {
      return this.createClassification('interior', 0.8, material, this.getInteriorProperties(mat));
    }

    // Fallback to property-based classification
    return this.classifyByProperties(material);
  }

  /**
   * Classify by material properties when name doesn't help
   */
  private static classifyByProperties(material: THREE.Material): MaterialClassification {
    const mat = material as ClassifiableMaterial;
    const metalness = mat.metalness ?? 0;
    const roughness = mat.roughness ?? 0.5;
    const opacity = mat.opacity ?? 1;
    const color = mat.color ?? new THREE.Color(0x888888);

    // Very transparent = glass
    if (opacity < 0.5 || mat.transparent) {
      return this.createClassification('glass', 0.7, material, this.getGlassProperties(mat));
    }

    // High metalness + low roughness = chrome/mirror
    if (metalness > 0.9 && roughness < 0.05) {
      return this.createClassification('chrome', 0.8, material, this.getChromeProperties(mat));
    }

    // High metalness = paint or metal
    if (metalness > 0.6) {
      // Dark colors with high metalness = likely body paint
      const brightness = (color.r + color.g + color.b) / 3;
      if (brightness > 0.1 && brightness < 0.85) {
        return this.createClassification('paint', 0.75, material, this.getPaintProperties(mat));
      }
      // Very dark or very bright = likely mechanical metal
      return this.createClassification('metal', 0.7, material, this.getMetalProperties(mat));
    }

    // Low metalness, very rough = rubber
    if (metalness < 0.1 && roughness > 0.7) {
      return this.createClassification('rubber', 0.7, material, this.getRubberProperties(mat));
    }

    // Medium metalness, medium roughness = interior
    if (metalness < 0.3 && roughness > 0.4 && roughness < 0.8) {
      return this.createClassification('interior', 0.6, material, this.getInteriorProperties(mat));
    }

    return this.createClassification('unknown', 0.3, material, {});
  }

  /**
   * Get suggested PBR properties for each material type
   */
  private static getGlassProperties(mat: any): Partial<THREE.MeshPhysicalMaterialParameters> {
    return {
      metalness: 0.0,
      roughness: 0.01,
      transmission: 0.9,
      thickness: 0.005,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      envMapIntensity: 2.5,
      specularColor: new THREE.Color(0xffffff),
      specularIntensity: 0.6,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      depthWrite: false,
    };
  }

  private static getRubberProperties(mat: any): Partial<THREE.MeshPhysicalMaterialParameters> {
    return {
      metalness: 0.05,
      roughness: 0.85,
      clearcoat: 0.15,
      clearcoatRoughness: 0.6,
      envMapIntensity: 0.15,
    };
  }

  private static getMetalProperties(mat: any): Partial<THREE.MeshPhysicalMaterialParameters> {
    return {
      metalness: Math.min(0.98, (mat.metalness ?? 0.8) + 0.1),
      roughness: Math.max(0.08, (mat.roughness ?? 0.3) - 0.1),
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.5,
    };
  }

  private static getCarbonProperties(mat: any): Partial<THREE.MeshPhysicalMaterialParameters> {
    return {
      metalness: 0.4,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.4,
    };
  }

  private static getChromeProperties(mat: any): Partial<THREE.MeshPhysicalMaterialParameters> {
    return {
      metalness: 0.99,
      roughness: 0.01,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      envMapIntensity: 2.0,
      reflectivity: 1.0,
    };
  }

  private static getPaintProperties(mat: any): Partial<THREE.MeshPhysicalMaterialParameters> {
    return {
      metalness: Math.min(0.92, (mat.metalness ?? 0.8) + 0.08),
      roughness: Math.max(0.08, (mat.roughness ?? 0.25) - 0.1),
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      envMapIntensity: 1.6,
      sheen: 0.3,
      sheenColor: (mat.color ?? new THREE.Color(0x888888)).clone().multiplyScalar(0.6),
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xffffff),
    };
  }

  private static getInteriorProperties(mat: any): Partial<THREE.MeshPhysicalMaterialParameters> {
    const isLeather = mat.roughness > 0.6;
    return {
      metalness: isLeather ? 0.02 : (mat.metalness ?? 0.1),
      roughness: isLeather ? 0.7 : (mat.roughness ?? 0.5),
      sheen: isLeather ? 0.25 : 0,
      sheenColor: isLeather ? (mat.color ?? new THREE.Color(0x444444)).clone().multiplyScalar(0.4) : undefined,
      clearcoat: isLeather ? 0.15 : 0,
      clearcoatRoughness: 0.5,
      envMapIntensity: isLeather ? 0.3 : 0.8,
    };
  }

  private static getEmissiveProperties(mat: any): Partial<THREE.MeshPhysicalMaterialParameters> {
    const color = mat.color ?? new THREE.Color(0xffffff);
    return {
      emissive: color.clone(),
      emissiveIntensity: 0.6,
      metalness: 0.0,
      roughness: 0.2,
      clearcoat: 0.8,
      envMapIntensity: 1.0,
    };
  }

  private static createClassification(
    type: MaterialType, confidence: number,
    material: THREE.Material, suggested: Partial<THREE.MeshPhysicalMaterialParameters>
  ): MaterialClassification {
    return {
      type,
      confidence,
      originalColor: (material as ClassifiableMaterial).color?.clone() ?? new THREE.Color(0x888888),
      suggestedProperties: suggested,
    };
  }
}
