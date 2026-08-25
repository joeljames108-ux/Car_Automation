// ===================================================================
// THREE.JS CARBON FRONT SPLITTER TRAY 3D GEOMETRY GENERATOR
// ===================================================================
// Generates sculpted carbon fiber front splitter tray with curved leading
// edge, vertical endplate vortex fences, and titanium support turnbuckle struts.
// ===================================================================

import * as THREE from "three";
import type { AeroSurfaceConfig } from "../../sim/types/exterior";

export function generateFrontSplitter3DGeometry(
  config?: Partial<AeroSurfaceConfig>
): THREE.Group {
  const group = new THREE.Group();
  group.name = "Front_Splitter_Tray_Assembly";

  const carbonMat = new THREE.MeshPhysicalMaterial({
    color: 0x090d16,
    roughness: 0.15,
    metalness: 0.90,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    reflectivity: 0.95,
    name: "Carbon_Aero_Material",
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.05,
    metalness: 0.98,
  });

  const ext = (config?.splitterExtensionMm || 110) / 1000;
  const width = 1.65;
  const length = 0.42 + ext;

  // Main Swept Aerodynamic Carbon Splitter Blade Tray
  const trayGeo = new THREE.BoxGeometry(length, 0.022, width);
  const trayMesh = new THREE.Mesh(trayGeo, carbonMat);
  trayMesh.position.set(ext / 2, 0, 0);
  trayMesh.castShadow = true;
  group.add(trayMesh);

  // Left & Right Vertical Endplate Vortex Spill Fences
  const endplateGeo = new THREE.BoxGeometry(length * 0.9, 0.12, 0.015);
  [-width / 2, width / 2].forEach((sideZ) => {
    const endplate = new THREE.Mesh(endplateGeo, carbonMat);
    endplate.position.set(ext / 2, 0.05, sideZ);
    group.add(endplate);
  });

  // Dual Adjustable Titanium Support Turnbuckle Struts
  const strutGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.24, 8);
  [-0.32, 0.32].forEach((strutZ) => {
    const strut = new THREE.Mesh(strutGeo, chromeMat);
    strut.rotation.z = Math.PI / 6;
    strut.position.set(ext * 0.4, 0.10, strutZ);
    group.add(strut);
  });

  return group;
}
