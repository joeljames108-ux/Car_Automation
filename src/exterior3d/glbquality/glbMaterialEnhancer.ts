import * as THREE from 'three';

export interface PaintPreset { name: string; baseColor: THREE.Color; metallic: number; roughness: number; clearcoat: number; clearcoatRoughness: number; envMapIntensity: number; }
export interface LeatherPreset { name: string; color: THREE.Color; roughness: number; sheenColor: THREE.Color; }
export interface CarbonPreset { name: string; color: THREE.Color; glossLevel: number; weaveType: string; }
export interface MetalPreset { name: string; color: THREE.Color; metalness: number; roughness: number; anisotropy: number; }

const PAINTS: PaintPreset[] = [
  { name: 'rosso_corsa', baseColor: new THREE.Color(0.8,0,0), metallic: 0.92, roughness: 0.12, clearcoat: 1.0, clearcoatRoughness: 0.03, envMapIntensity: 1.2 },
  { name: 'midnight_blue', baseColor: new THREE.Color(0.02,0.03,0.15), metallic: 0.9, roughness: 0.14, clearcoat: 1.0, clearcoatRoughness: 0.04, envMapIntensity: 1.1 },
  { name: 'british_racing_green', baseColor: new THREE.Color(0.02,0.15,0.05), metallic: 0.88, roughness: 0.16, clearcoat: 0.95, clearcoatRoughness: 0.05, envMapIntensity: 1.0 },
  { name: 'nardo_gray', baseColor: new THREE.Color(0.45,0.43,0.42), metallic: 0.6, roughness: 0.2, clearcoat: 0.8, clearcoatRoughness: 0.08, envMapIntensity: 0.9 },
  { name: 'obsidian_black', baseColor: new THREE.Color(0.02,0.02,0.03), metallic: 0.95, roughness: 0.08, clearcoat: 1.0, clearcoatRoughness: 0.02, envMapIntensity: 1.3 },
  { name: 'arctic_white', baseColor: new THREE.Color(0.95,0.93,0.92), metallic: 0.3, roughness: 0.18, clearcoat: 0.9, clearcoatRoughness: 0.06, envMapIntensity: 0.8 },
  { name: 'acid_green', baseColor: new THREE.Color(0.2,0.8,0.1), metallic: 0.85, roughness: 0.15, clearcoat: 1.0, clearcoatRoughness: 0.03, envMapIntensity: 1.1 },
  { name: 'chameleon_violet', baseColor: new THREE.Color(0.15,0.05,0.3), metallic: 0.9, roughness: 0.1, clearcoat: 1.0, clearcoatRoughness: 0.02, envMapIntensity: 1.2 },
  { name: 'burnt_orange', baseColor: new THREE.Color(0.7,0.25,0.02), metallic: 0.9, roughness: 0.13, clearcoat: 0.95, clearcoatRoughness: 0.04, envMapIntensity: 1.0 },
  { name: 'gunmetal', baseColor: new THREE.Color(0.25,0.27,0.3), metallic: 0.95, roughness: 0.12, clearcoat: 0.9, clearcoatRoughness: 0.05, envMapIntensity: 1.1 },
  { name: 'liquid_silver', baseColor: new THREE.Color(0.75,0.73,0.7), metallic: 0.95, roughness: 0.1, clearcoat: 1.0, clearcoatRoughness: 0.03, envMapIntensity: 1.2 },
  { name: 'viper_green', baseColor: new THREE.Color(0.08,0.35,0.08), metallic: 0.88, roughness: 0.14, clearcoat: 1.0, clearcoatRoughness: 0.03, envMapIntensity: 1.1 },
];

const LEATHER: LeatherPreset[] = [
  { name: 'nappa_black', color: new THREE.Color(0.05,0.05,0.05), roughness: 0.7, sheenColor: new THREE.Color(0.15,0.12,0.1) },
  { name: 'cognac_brown', color: new THREE.Color(0.45,0.22,0.08), roughness: 0.68, sheenColor: new THREE.Color(0.55,0.3,0.12) },
  { name: 'rosso_red', color: new THREE.Color(0.5,0.05,0.05), roughness: 0.72, sheenColor: new THREE.Color(0.6,0.12,0.1) },
  { name: 'cream_white', color: new THREE.Color(0.9,0.85,0.78), roughness: 0.65, sheenColor: new THREE.Color(0.95,0.9,0.85) },
  { name: 'alcantara', color: new THREE.Color(0.1,0.1,0.12), roughness: 0.9, sheenColor: new THREE.Color(0.2,0.2,0.22) },
];

const CARBON: CarbonPreset[] = [
  { name: 'twill_2x2', color: new THREE.Color(0.05,0.05,0.05), glossLevel: 0.8, weaveType: 'twill' },
  { name: 'dry_carbon', color: new THREE.Color(0.08,0.08,0.08), glossLevel: 0.3, weaveType: 'twill' },
  { name: 'forged_composite', color: new THREE.Color(0.1,0.1,0.1), glossLevel: 0.5, weaveType: 'forged' },
  { name: 'exposed_weave', color: new THREE.Color(0.04,0.04,0.04), glossLevel: 0.6, weaveType: 'plain' },
];

const METALS: MetalPreset[] = [
  { name: 'brushed_aluminum', color: new THREE.Color(0.7,0.72,0.73), metalness: 0.95, roughness: 0.35, anisotropy: 0.8 },
  { name: 'polished_aluminum', color: new THREE.Color(0.85,0.87,0.88), metalness: 1.0, roughness: 0.05, anisotropy: 0 },
  { name: 'cast_aluminum', color: new THREE.Color(0.55,0.57,0.58), metalness: 0.85, roughness: 0.6, anisotropy: 0 },
  { name: 'anodized_red', color: new THREE.Color(0.6,0.08,0.05), metalness: 0.9, roughness: 0.2, anisotropy: 0 },
  { name: 'anodized_blue', color: new THREE.Color(0.1,0.15,0.5), metalness: 0.9, roughness: 0.2, anisotropy: 0 },
  { name: 'gold_anodized', color: new THREE.Color(0.85,0.65,0.2), metalness: 0.95, roughness: 0.15, anisotropy: 0 },
  { name: 'titanium', color: new THREE.Color(0.55,0.52,0.48), metalness: 0.92, roughness: 0.25, anisotropy: 0 },
  { name: 'chrome', color: new THREE.Color(0.95,0.93,0.88), metalness: 1.0, roughness: 0.02, anisotropy: 0 },
  { name: 'satin_chrome', color: new THREE.Color(0.8,0.78,0.75), metalness: 0.98, roughness: 0.1, anisotropy: 0 },
];

export class GLBMaterialEnhancer {
  private paintMap = new Map<string, PaintPreset>();
  private leatherMap = new Map<string, LeatherPreset>();
  private carbonMap = new Map<string, CarbonPreset>();
  private metalMap = new Map<string, MetalPreset>();

  constructor() {
    PAINTS.forEach(p => this.paintMap.set(p.name, p));
    LEATHER.forEach(l => this.leatherMap.set(l.name, l));
    CARBON.forEach(c => this.carbonMap.set(c.name, c));
    METALS.forEach(m => this.metalMap.set(m.name, m));
  }

  createPaint(name: string): THREE.MeshPhysicalMaterial {
    const p = this.paintMap.get(name) || PAINTS[0];
    return new THREE.MeshPhysicalMaterial({
      color: p.baseColor, metalness: p.metallic, roughness: p.roughness,
      clearcoat: p.clearcoat, clearcoatRoughness: p.clearcoatRoughness,
      envMapIntensity: p.envMapIntensity,
    });
  }

  createLeather(name: string): THREE.MeshPhysicalMaterial {
    const l = this.leatherMap.get(name) || LEATHER[0];
    return new THREE.MeshPhysicalMaterial({
      color: l.color, metalness: 0, roughness: l.roughness,
      sheen: 0.3, sheenColor: l.sheenColor, sheenRoughness: 0.4,
      clearcoat: 0.05, clearcoatRoughness: 0.9, envMapIntensity: 0.5,
    });
  }

  createCarbon(name: string): THREE.MeshPhysicalMaterial {
    const c = this.carbonMap.get(name) || CARBON[0];
    return new THREE.MeshPhysicalMaterial({
      color: c.color, metalness: 0.1, roughness: 1.0 - c.glossLevel * 0.8,
      clearcoat: c.glossLevel, clearcoatRoughness: 0.05,
      anisotropy: c.weaveType === 'twill' ? 0.4 : 0.1,
      anisotropyRotation: Math.PI / 4, envMapIntensity: 0.9,
    });
  }

  createMetal(name: string): THREE.MeshPhysicalMaterial {
    const m = this.metalMap.get(name) || METALS[0];
    return new THREE.MeshPhysicalMaterial({
      color: m.color, metalness: m.metalness, roughness: m.roughness,
      anisotropy: m.anisotropy, anisotropyRotation: 0,
      clearcoat: m.roughness < 0.1 ? 0.5 : 0.0, envMapIntensity: 0.9,
    });
  }

  createGlass(tint?: THREE.Color): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: tint || new THREE.Color(0.8,0.85,0.9), metalness: 0, roughness: 0,
      transmission: 0.9, ior: 1.52, thickness: 0.005,
      transparent: true, opacity: 0.3, envMapIntensity: 1.0,
    });
  }

  createRubber(type = 'tire'): THREE.MeshPhysicalMaterial {
    const cfg: Record<string, Partial<THREE.MeshPhysicalMaterialParameters>> = {
      tire: { color: new THREE.Color(0.05,0.05,0.05), roughness: 0.85 },
      seal: { color: new THREE.Color(0.02,0.02,0.02), roughness: 0.95 },
      hose: { color: new THREE.Color(0.08,0.08,0.08), roughness: 0.7, clearcoat: 0.1 },
    };
    return new THREE.MeshPhysicalMaterial(cfg[type] as any);
  }

  createPlastic(type = 'hard'): THREE.MeshPhysicalMaterial {
    const cfg: Record<string, Partial<THREE.MeshPhysicalMaterialParameters>> = {
      hard: { color: new THREE.Color(0.15,0.15,0.15), roughness: 0.4, clearcoat: 0.3 },
      soft: { color: new THREE.Color(0.1,0.1,0.1), roughness: 0.8 },
      textured: { color: new THREE.Color(0.12,0.12,0.12), roughness: 0.6 },
    };
    return new THREE.MeshPhysicalMaterial(cfg[type] as any);
  }

  getPaintNames(): string[] { return PAINTS.map(p => p.name); }
  getLeatherNames(): string[] { return LEATHER.map(l => l.name); }
  getCarbonNames(): string[] { return CARBON.map(c => c.name); }
  getMetalNames(): string[] { return METALS.map(m => m.name); }

  enhanceScene(scene: THREE.Group): void {
    scene.traverse(n => {
      if ((n as THREE.Mesh).isMesh) {
        const m = (n as THREE.Mesh).material as any;
        if (m.envMapIntensity !== undefined) { m.envMapIntensity = Math.min(m.envMapIntensity, 1.2); m.needsUpdate = true; }
      }
    });
  }
}

export const createDefaultMaterialEnhancer = () => new GLBMaterialEnhancer();
