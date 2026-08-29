import * as THREE from "three";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  meshCount: number;
  totalTriangles: number;
  totalVertices: number;
  materialCount: number;
  textureCount: number;
}

export class AdvancedGLBValidation {
  validateScene(scene: THREE.Scene): ValidationResult {
    const result: ValidationResult = { valid: true, errors: [], warnings: [], meshCount: 0, totalTriangles: 0, totalVertices: 0, materialCount: 0, textureCount: 0 };
    const materials = new Set<string>();
    const textures = new Set<string>();
    scene.traverse(node => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        result.meshCount++;
        if (!mesh.geometry) { result.errors.push("Mesh " + mesh.name + " has no geometry"); result.valid = false; return; }
        const pos = mesh.geometry.attributes.position;
        if (!pos) { result.errors.push("Mesh " + mesh.name + " has no position attribute"); result.valid = false; return; }
        result.totalVertices += pos.count;
        const idx = mesh.geometry.index;
        result.totalTriangles += idx ? idx.count / 3 : pos.count / 3;
        if (mesh.geometry.attributes.position.count > 65536) { result.warnings.push("Mesh " + mesh.name + " has >65536 vertices (may not render on mobile)"); }
        if (!mesh.material) { result.warnings.push("Mesh " + mesh.name + " has no material"); }
        else { const mat = mesh.material as THREE.Material; materials.add(mat.uuid); if ((mat as any).map) textures.add((mat as any).map.uuid); }
        if (!mesh.geometry.attributes.normal) { result.warnings.push("Mesh " + mesh.name + " has no normals (will look flat)"); }
        mesh.updateWorldMatrix(true, false);
        const box = new THREE.Box3().setFromObject(mesh);
        if (box.min.y < -10 || box.max.y > 10) { result.warnings.push("Mesh " + mesh.name + " is very large or positioned far from origin"); }
      }
    });
    result.materialCount = materials.size;
    result.textureCount = textures.size;
    if (result.totalTriangles > 1000000) { result.warnings.push("Scene has >1M triangles (may be slow)"); }
    return result;
  }

  validateGroup(group: THREE.Group): ValidationResult {
    const scene = new THREE.Scene(); scene.add(group);
    return this.validateScene(scene);
  }
}
