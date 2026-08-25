// ===================================================================
// THREE.JS AERODYNAMIC SIDE SKIRTS 3D GEOMETRY GENERATOR
// ===================================================================
// Generates sculpted carbon fiber side skirts with integrated underbody
// vortex generators, rear wheel arch aerodynamic winglets, and sill extensions.
// ===================================================================

import * as THREE from "three";

export function generateSideSkirts3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Side_Skirts_Assembly";

  const carbonMat = new THREE.MeshPhysicalMaterial({
    color: 0x090d16,
    roughness: 0.15,
    metalness: 0.90,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    reflectivity: 0.95,
    name: "Carbon_Aero_Material",
  });

  const length = 1.95;

  [-1, 1].forEach((side) => {
    const skirtGroup = new THREE.Group();
    skirtGroup.position.set(0, 0, side * 0.65);

    // Main Stepped Carbon Skirt Blade
    const bladeGeo = new THREE.BoxGeometry(length, 0.035, 0.14);
    const blade = new THREE.Mesh(bladeGeo, carbonMat);
    blade.position.set(0, -0.12, 0);
    blade.castShadow = true;
    skirtGroup.add(blade);

    // Rear Wheel Arch Vertical Aero Winglet
    const wingletGeo = new THREE.BoxGeometry(0.22, 0.14, 0.015);
    const winglet = new THREE.Mesh(wingletGeo, carbonMat);
    winglet.position.set(-length * 0.42, -0.05, side * 0.06);
    skirtGroup.add(winglet);

    // Front Wheel Arch Vortex Deflector Fin
    const deflectorGeo = new THREE.BoxGeometry(0.18, 0.08, 0.015);
    const deflector = new THREE.Mesh(deflectorGeo, carbonMat);
    deflector.position.set(length * 0.42, -0.08, side * 0.06);
    skirtGroup.add(deflector);

    group.add(skirtGroup);
  });

  return group;
}
