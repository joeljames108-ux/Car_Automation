import * as THREE from "three";

export interface GLBExportOptions {
  binary: boolean;
  compressTextures: boolean;
  maxTextureSize: number;
  includeAnimations: boolean;
  includeMaterials: boolean;
  includeNormals: boolean;
  includeUVs: boolean;
}

const DEFAULT_OPTIONS: GLBExportOptions = {
  binary: true, compressTextures: true, maxTextureSize: 1024,
  includeAnimations: true, includeMaterials: true, includeNormals: true, includeUVs: true,
};

export class AdvancedGLBExporter {
  private options: GLBExportOptions;
  private meshCount = 0;
  private materialCount = 0;
  private textureCount = 0;

  constructor(options: Partial<GLBExportOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  exportScene(scene: THREE.Scene): ArrayBuffer {
    this.meshCount = 0;
    this.materialCount = 0;
    this.textureCount = 0;
    const meshes: THREE.Mesh[] = [];
    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();
    scene.traverse(node => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        meshes.push(mesh);
        this.meshCount++;
        if (mesh.material) {
          const mat = mesh.material as THREE.Material;
          materials.add(mat);
          this.materialCount++;
          if ((mat as any).map) textures.add((mat as any).map);
        }
      }
    });
    const json: any = {
      asset: { generator: "AdvancedGLBExporter", version: "2.0" },
      scene: 0, scenes: [{ name: "Scene", nodes: [0] }],
      nodes: meshes.map((m, i) => ({ name: m.name || "Mesh_" + i, mesh: i })),
      meshes: meshes.map(m => ({ primitives: [{ attributes: { POSITION: 0 }, material: 0 }] })),
      materials: Array.from(materials).map((m: any) => ({ name: m.name || "Material", pbrMetallicRoughness: { baseColorFactor: m.color ? [m.color.r, m.color.g, m.color.b, 1] : [1, 1, 1, 1] } })),
      accessors: [{ componentType: 5126, count: 3, type: "VEC3", byteOffset: 0 }],
      bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 36 }],
      buffers: [{ byteLength: 36 }],
    };
    const jsonData = JSON.stringify(json);
    const pad = (4 - (jsonData.length % 4)) % 4;
    const totalLength = 12 + 8 + jsonData.length + pad + 8 + 36;
    const buffer = new ArrayBuffer(totalLength);
    const view = new DataView(buffer);
    let offset = 0;
    view.setUint32(offset, 0x46546C67, true); offset += 4;
    view.setUint32(offset, 2, true); offset += 4;
    view.setUint32(offset, totalLength, true); offset += 4;
    view.setUint32(offset, jsonData.length, true); offset += 4;
    view.setUint32(offset, 0x4E4F534A, true); offset += 4;
    for (let i = 0; i < jsonData.length; i++) { view.setUint8(offset++, jsonData.charCodeAt(i)); }
    for (let i = 0; i < pad; i++) { view.setUint8(offset++, 0x20); }
    return buffer;
  }

  getStats(): { meshes: number; materials: number; textures: number } {
    return { meshes: this.meshCount, materials: this.materialCount, textures: this.textureCount };
  }
}
