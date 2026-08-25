// ===================================================================
// THREE.JS HEATED REAR WINDOW BACKLITE 3D GEOMETRY GENERATOR
// ===================================================================
// Generates curved aerodynamic rear engine view window with privacy tint,
// horizontal copper heating filaments, and black ceramic frit border.
// ===================================================================

import * as THREE from "three";

export function generateRearWindow3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Rear_Window_Assembly";

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e293b,
    transmission: 0.76,
    opacity: 0.58,
    transparent: true,
    roughness: 0.02,
    metalness: 0.05,
    ior: 1.54,
    thickness: 0.006,
    name: "Rear_Backlite_Glass",
  });

  const filamentMat = new THREE.MeshBasicMaterial({
    color: 0xf97316,
  });

  // Curved Rear Engine View Glass Screen
  const rearGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.72, 20, 1, true, -Math.PI * 0.26, Math.PI * 0.52);
  const rearMesh = new THREE.Mesh(rearGeo, glassMat);
  rearMesh.rotation.x = -Math.PI / 3.2;
  rearMesh.castShadow = true;
  group.add(rearMesh);

  // Copper Defroster Heating Filaments
  for (let i = -3; i <= 3; i++) {
    const wireGeo = new THREE.BoxGeometry(0.68, 0.002, 0.002);
    const wire = new THREE.Mesh(wireGeo, filamentMat);
    wire.position.set(0, i * 0.06, 0.01);
    group.add(wire);
  }

  return group;
}
