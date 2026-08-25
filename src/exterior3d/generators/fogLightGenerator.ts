// ===================================================================
// THREE.JS BUMPER FOG & DRL PROJECTOR LIGHTS 3D GEOMETRY GENERATOR
// ===================================================================
// Generates aerodynamic bumper corner intake DRL light pods with crystal
// projector lenses and carbon fiber bezel housings.
// ===================================================================

import * as THREE from "three";

export function generateFogLights3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Fog_Lights_Assembly";

  const bezelMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.3,
    metalness: 0.85,
  });

  const ledProjectorMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });

  const drlBladeMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
  });

  [-1, 1].forEach((side) => {
    const podGroup = new THREE.Group();
    podGroup.position.set(0, 0, side * 0.42);

    // Carbon Intake Bezel
    const bezelGeo = new THREE.BoxGeometry(0.12, 0.08, 0.16);
    const bezel = new THREE.Mesh(bezelGeo, bezelMat);
    bezel.rotation.y = side * -0.25;
    podGroup.add(bezel);

    // Projector Crystal Lens
    const lensGeo = new THREE.SphereGeometry(0.024, 16, 16);
    const lens = new THREE.Mesh(lensGeo, ledProjectorMat);
    lens.position.set(0.05, 0, 0);
    bezel.add(lens);

    // Ice-Blue Accent DRL Blade
    const bladeGeo = new THREE.BoxGeometry(0.08, 0.008, 0.14);
    const blade = new THREE.Mesh(bladeGeo, drlBladeMat);
    blade.position.set(0.04, -0.025, 0);
    bezel.add(blade);

    group.add(podGroup);
  });

  return group;
}
