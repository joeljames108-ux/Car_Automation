// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — BODY PANEL CUSTOMIZER & PBR SHADERS
// ============================================================================
// 100-Phase Master Automotive CAD Architecture — Phase 11: PBR Paint, Carbon & VFX
// - Multi-Layer Metallic Flake Clearcoat with Specular Reflection & Color Flop
// - Gloss & Matte 2x2 Twill Carbon Fiber Weave Normal Textures
// - Titanium Blue Flame Anodized Specular & Ceramic Glass Frit Border Shaders
// - High-RPM Shift Pop & Bang Exhaust Backfire Flame Particle VFX
// ============================================================================

import * as THREE from 'three';
import { AutomotivePBRMaterialSystem } from './automotivePBRMaterialSystem';

export type PaintFinishType = 'satin_metallic' | 'gloss_clearcoat' | 'matte_carbon' | 'pearlescent' | 'forged_carbon' | 'liquid_candy';

export interface PaintConfiguration {
  finishType: PaintFinishType;
  primaryColorHex: string;
  accentColorHex: string;
  showLiveryDecals: boolean;
  clearcoatIntensity: number;
  metalness: number;
  roughness: number;
}

export const DEFAULT_PAINT_CONFIG: PaintConfiguration = {
  finishType: 'satin_metallic',
  primaryColorHex: '#b45309', // Cyber Sapphire Blue
  accentColorHex: '#09090b',  // Gloss Carbon Black
  showLiveryDecals: true,
  clearcoatIntensity: 0.98,
  metalness: 0.84,
  roughness: 0.20,
};

export class ModularBodyPanelCustomizer {
  /**
   * Creates a luxury automotive PBR paint material based on user configuration.
   */
  public static createPaintMaterial(config: Partial<PaintConfiguration> = {}, isXRay: boolean = false): THREE.Material {
    const fullConfig: PaintConfiguration = { ...DEFAULT_PAINT_CONFIG, ...config };
    const color = new THREE.Color(fullConfig.primaryColorHex);

    // 1. Matte 2x2 Twill Carbon Fiber
    if (fullConfig.finishType === 'matte_carbon') {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color('#080c14'),
        metalness: 0.92,
        roughness: 0.38,
        normalMap: typeof document !== 'undefined' ? AutomotivePBRMaterialSystem.getCarbonWeaveNormalTexture() : null,
        transparent: isXRay,
        opacity: isXRay ? 0.25 : 1.0,
      });
    }

    // 2. High-Gloss Lacquered Forged / Woven Carbon Fiber
    if (fullConfig.finishType === 'forged_carbon') {
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#080c14'),
        metalness: 0.94,
        roughness: 0.12,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        reflectivity: 0.98,
        normalMap: typeof document !== 'undefined' ? AutomotivePBRMaterialSystem.getCarbonWeaveNormalTexture() : null,
        transparent: isXRay,
        opacity: isXRay ? 0.25 : 1.0,
        depthWrite: !isXRay,
      });
    }

    // 3. Pearlescent Metallic Flake with Angle Flop & Cyan Sheen
    if (fullConfig.finishType === 'pearlescent') {
      return new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.72,
        roughness: 0.12,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        reflectivity: 0.98,
        sheen: 1.0,
        sheenColor: new THREE.Color('#fbbf24'),
        sheenRoughness: 0.22,
        transparent: isXRay,
        opacity: isXRay ? 0.25 : 1.0,
        depthWrite: !isXRay,
      });
    }

    // 4. Liquid Candy Deep Tinted Clearcoat
    if (fullConfig.finishType === 'liquid_candy') {
      return new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.90,
        roughness: 0.04,
        clearcoat: 1.0,
        clearcoatRoughness: 0.01,
        transmission: 0.15,
        reflectivity: 1.0,
        attenuationColor: color,
        attenuationDistance: 0.5,
        transparent: isXRay,
        opacity: isXRay ? 0.25 : 1.0,
        depthWrite: !isXRay,
      });
    }

    // 5. Gloss Multi-Layer Clearcoat
    if (fullConfig.finishType === 'gloss_clearcoat') {
      return new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.92,
        roughness: 0.06,
        clearcoat: 1.0,
        clearcoatRoughness: 0.01,
        reflectivity: 1.0,
        transparent: isXRay,
        opacity: isXRay ? 0.25 : 1.0,
        depthWrite: !isXRay,
      });
    }

    // 6. Default: Satin Metallic with Specular Sheen
    return new THREE.MeshPhysicalMaterial({
      color,
      metalness: fullConfig.metalness,
      roughness: fullConfig.roughness,
      clearcoat: fullConfig.clearcoatIntensity,
      clearcoatRoughness: 0.03,
      reflectivity: 0.96,
      transparent: isXRay,
      opacity: isXRay ? 0.25 : 1.0,
      depthWrite: !isXRay,
    });
  }

  /**
   * Procedural Titanium Heat-Bluing Gradient Material (Gold -> Violet -> Deep Blue)
   */
  public static createTitaniumHeatStainMaterial(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: 0xd97706, // Cobalt blue tip
      emissive: 0x92400e,
      emissiveIntensity: 0.25,
      metalness: 0.98,
      roughness: 0.12,
      clearcoat: 0.95,
      clearcoatRoughness: 0.04,
    });
  }

  /**
   * Generates high-RPM gear-shift backfire flame bursts emitting from exhaust tips.
   */
  public static createExhaustBackfireVFX(rearX: number, exhaustY: number, tipOffsetsZ: number[] = [-0.18, 0.18]): THREE.Group {
    const vfxGroup = new THREE.Group();
    vfxGroup.name = 'Exhaust_Backfire_Flame_VFX';

    const flameCoreMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24, // Hot cyan interior core
      transparent: true,
      opacity: 0.95,
    });

    const flameOuterMat = new THREE.MeshBasicMaterial({
      color: 0xf97316, // Orange/amber outer flame envelope
      transparent: true,
      opacity: 0.75,
    });

    tipOffsetsZ.forEach((z) => {
      // Outer Cone
      const outerGeo = new THREE.ConeGeometry(0.045, 0.22, 16);
      outerGeo.rotateZ(-Math.PI / 2);
      const outerCone = new THREE.Mesh(outerGeo, flameOuterMat);
      outerCone.position.set(rearX - 0.14, exhaustY, z);

      // Inner Core Cone
      const innerGeo = new THREE.ConeGeometry(0.025, 0.15, 16);
      innerGeo.rotateZ(-Math.PI / 2);
      const innerCone = new THREE.Mesh(innerGeo, flameCoreMat);
      innerCone.position.set(rearX - 0.10, exhaustY, z);

      // Incandescent Flame Point Light
      const flameLight = new THREE.PointLight(0xf97316, 2.5, 1.8);
      flameLight.position.set(rearX - 0.12, exhaustY, z);

      vfxGroup.add(outerCone, innerCone, flameLight);
    });

    return vfxGroup;
  }

  /**
   * Generates white livery decals on a transparent canvas texture.
   */
  public static createHoodLiveryTexture(): THREE.CanvasTexture | null {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, 512, 128);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "JetBrains Mono", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CYBER-SPORT GT3', 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }
}
