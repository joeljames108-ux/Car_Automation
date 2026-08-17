// ===================================================================
// THREE.JS AERODYNAMIC SIDE SKIRTS 3D GEOMETRY GENERATOR
// ===================================================================

import * as THREE from "three";

export function generateSideSkirts3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Side_Skirts_Assembly";

  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.2,
    metalness: 0.9,
    name: "Carbon_Aero_Material",
  });

  // Left Side Skirt Blade
  const skirtGeo = new THREE.BoxGeometry(1.85, 0.02, 0.12);
  const leftSkirt = new THREE.Mesh(skirtGeo, carbonMat);
  leftSkirt.position.set(0, -0.15, 0.65);
  leftSkirt.castShadow = true;
  group.add(leftSkirt);

  // Right Side Skirt Blade
  const rightSkirt = new THREE.Mesh(skirtGeo, carbonMat);
  rightSkirt.position.set(0, -0.15, -0.65);
  rightSkirt.castShadow = true;
  group.add(rightSkirt);

  return group;
}
