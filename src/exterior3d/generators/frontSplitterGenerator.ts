// ===================================================================
// THREE.JS CARBON FRONT SPLITTER TRAY 3D GEOMETRY GENERATOR
// ===================================================================

import * as THREE from "three";
import type { AeroSurfaceConfig } from "../../sim/types/exterior";

export function generateFrontSplitter3DGeometry(
  config?: Partial<AeroSurfaceConfig>
): THREE.Group {
  const group = new THREE.Group();
  group.name = "Front_Splitter_Tray_Assembly";

  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.25,
    metalness: 0.9,
    name: "Carbon_Aero_Material",
  });

  const ext = (config?.splitterExtensionMm || 110) / 1000;

  // Horizontal Splitter Blade Tray
  const trayGeo = new THREE.BoxGeometry(0.35 + ext, 0.02, 0.95);
  const trayMesh = new THREE.Mesh(trayGeo, carbonMat);
  trayMesh.position.set(ext / 2, 0, 0);
  trayMesh.castShadow = true;
  group.add(trayMesh);

  // Left & Right Vertical Endplates
  const endplateGeo = new THREE.BoxGeometry(0.25, 0.12, 0.015);
  const leftEndplate = new THREE.Mesh(endplateGeo, carbonMat);
  leftEndplate.position.set(ext / 2, 0.05, 0.47);
  group.add(leftEndplate);

  const rightEndplate = new THREE.Mesh(endplateGeo, carbonMat);
  rightEndplate.position.set(ext / 2, 0.05, -0.47);
  group.add(rightEndplate);

  return group;
}
