import * as THREE from "three";

export class AdvancedMaterialLibrary {
  private cache = new Map<string, THREE.Material>();
  automotivePaint(color: number): THREE.MeshPhysicalMaterial { const k = "p" + color; if (this.cache.has(k)) return this.cache.get(k) as THREE.MeshPhysicalMaterial; const m = new THREE.MeshPhysicalMaterial({ color, metalness: 0.5, roughness: 0.18, clearcoat: 1.0, clearcoatRoughness: 0.08, envMapIntensity: 2.0 }); this.cache.set(k, m); return m; }
  carbonFiber(): THREE.MeshPhysicalMaterial { if (this.cache.has("cf")) return this.cache.get("cf") as THREE.MeshPhysicalMaterial; const m = new THREE.MeshPhysicalMaterial({ color: 0x111111, metalness: 0.4, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.1 }); this.cache.set("cf", m); return m; }
  chrome(): THREE.MeshPhysicalMaterial { if (this.cache.has("ch")) return this.cache.get("ch") as THREE.MeshPhysicalMaterial; const m = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1.0, roughness: 0.02, envMapIntensity: 2.5 }); this.cache.set("ch", m); return m; }
  rubber(): THREE.MeshStandardMaterial { if (this.cache.has("ru")) return this.cache.get("ru") as THREE.MeshStandardMaterial; const m = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9, metalness: 0.0 }); this.cache.set("ru", m); return m; }
  leather(color: number = 0x3d2b1f): THREE.MeshStandardMaterial { const k = "l" + color; if (this.cache.has(k)) return this.cache.get(k) as THREE.MeshStandardMaterial; const m = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.0 }); this.cache.set(k, m); return m; }
  glass(tint: number = 0xaaccff): THREE.MeshPhysicalMaterial { return new THREE.MeshPhysicalMaterial({ color: tint, transmission: 0.85, ior: 1.52, thickness: 0.004, roughness: 0.05, metalness: 0.0, side: THREE.DoubleSide }); }
  brushedAluminum(): THREE.MeshPhysicalMaterial { return new THREE.MeshPhysicalMaterial({ color: 0xbbbbbb, metalness: 0.8, roughness: 0.35 }); }
  anodized(color: number): THREE.MeshPhysicalMaterial { return new THREE.MeshPhysicalMaterial({ color, metalness: 0.7, roughness: 0.25, clearcoat: 0.3 }); }
  getCacheSize(): number { return this.cache.size; }
  dispose(): void { this.cache.forEach(m => m.dispose()); this.cache.clear(); }
}
