import * as THREE from "three";

export interface PaintPreset { name: string; color: number; metalness: number; roughness: number; clearcoat: number; clearcoatRoughness: number; envMapIntensity: number; }

const PRESETS: PaintPreset[] = [
  { name: "Rosso Corsa", color: 0xcc0000, metalness: 0.6, roughness: 0.15, clearcoat: 1.0, clearcoatRoughness: 0.05, envMapIntensity: 2.5 },
  { name: "Nero Daytona", color: 0x0a0a0a, metalness: 0.7, roughness: 0.12, clearcoat: 1.0, clearcoatRoughness: 0.03, envMapIntensity: 3.0 },
  { name: "Bianco Avus", color: 0xf5f5f5, metalness: 0.4, roughness: 0.18, clearcoat: 1.0, clearcoatRoughness: 0.08, envMapIntensity: 2.0 },
  { name: "Giallo Modena", color: 0xffcc00, metalness: 0.5, roughness: 0.16, clearcoat: 1.0, clearcoatRoughness: 0.06, envMapIntensity: 2.2 },
  { name: "Blu Pozzi", color: 0x003399, metalness: 0.55, roughness: 0.14, clearcoat: 1.0, clearcoatRoughness: 0.04, envMapIntensity: 2.4 },
  { name: "Verde British", color: 0x004d00, metalness: 0.5, roughness: 0.17, clearcoat: 0.9, clearcoatRoughness: 0.07, envMapIntensity: 2.0 },
  { name: "Argento Nurburgring", color: 0xaaaaaa, metalness: 0.75, roughness: 0.1, clearcoat: 1.0, clearcoatRoughness: 0.02, envMapIntensity: 2.8 },
  { name: "Matte Black", color: 0x1a1a1a, metalness: 0.3, roughness: 0.85, clearcoat: 0.0, clearcoatRoughness: 0.0, envMapIntensity: 0.5 },
  { name: "Satin Grey", color: 0x666666, metalness: 0.5, roughness: 0.4, clearcoat: 0.3, clearcoatRoughness: 0.3, envMapIntensity: 1.0 },
  { name: "Chameleon", color: 0x6633cc, metalness: 0.6, roughness: 0.15, clearcoat: 1.0, clearcoatRoughness: 0.05, envMapIntensity: 2.5 },
  { name: "Frozen Blue", color: 0x3366cc, metalness: 0.45, roughness: 0.55, clearcoat: 0.5, clearcoatRoughness: 0.15, envMapIntensity: 1.5 },
  { name: "Arancio Borealis", color: 0xff6600, metalness: 0.55, roughness: 0.13, clearcoat: 1.0, clearcoatRoughness: 0.04, envMapIntensity: 2.6 },
];

export class AdvancedPaintSystem {
  private cache = new Map<string, THREE.MeshPhysicalMaterial>();

  getPreset(name: string): PaintPreset | undefined { return PRESETS.find(p => p.name === name); }
  getAllPresets(): PaintPreset[] { return [...PRESETS]; }

  createMaterial(preset: PaintPreset): THREE.MeshPhysicalMaterial {
    if (this.cache.has(preset.name)) return this.cache.get(preset.name)!;
    const mat = new THREE.MeshPhysicalMaterial({
      color: preset.color, metalness: preset.metalness, roughness: preset.roughness,
      clearcoat: preset.clearcoat, clearcoatRoughness: preset.clearcoatRoughness,
      envMapIntensity: preset.envMapIntensity,
    });
    this.cache.set(preset.name, mat);
    return mat;
  }

  createMaterialByColor(color: number, finish: "gloss" | "matte" | "satin" | "metallic" = "gloss"): THREE.MeshPhysicalMaterial {
    const presets: Record<string, Partial<PaintPreset>> = {
      gloss: { metalness: 0.5, roughness: 0.15, clearcoat: 1.0, clearcoatRoughness: 0.05, envMapIntensity: 2.5 },
      matte: { metalness: 0.3, roughness: 0.85, clearcoat: 0.0, clearcoatRoughness: 0.0, envMapIntensity: 0.5 },
      satin: { metalness: 0.5, roughness: 0.4, clearcoat: 0.3, clearcoatRoughness: 0.3, envMapIntensity: 1.0 },
      metallic: { metalness: 0.75, roughness: 0.1, clearcoat: 1.0, clearcoatRoughness: 0.02, envMapIntensity: 2.8 },
    };
    const p = presets[finish] || presets.gloss;
    return new THREE.MeshPhysicalMaterial({ color, ...p } as any);
  }

  applyToGroup(group: THREE.Group, preset: PaintPreset): void {
    const mat = this.createMaterial(preset);
    group.traverse(node => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        if (mesh.material && (mesh.material as any).color) {
          mesh.material = mat;
        }
      }
    });
  }

  getCacheSize(): number { return this.cache.size; }
  dispose(): void { this.cache.forEach(m => m.dispose()); this.cache.clear(); }
}
