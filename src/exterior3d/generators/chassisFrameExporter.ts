// ===================================================================
// THREE.JS GLTF EXPORTER UTILITY FOR EXTERIOR 3D MODELS
// ===================================================================

import * as THREE from "three";
import { GLTFExporter } from "three-stdlib";

export function exportGroupToGLTF(group: THREE.Group): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      group,
      (gltf) => {
        if (gltf instanceof ArrayBuffer) {
          resolve(gltf);
        } else {
          const jsonString = JSON.stringify(gltf);
          const encoder = new TextEncoder();
          resolve(encoder.encode(jsonString).buffer as ArrayBuffer);
        }
      },
      (error) => reject(error),
      { binary: true }
    );
  });
}
