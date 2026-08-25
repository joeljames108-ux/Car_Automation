// ===================================================================
// THREE.JS CURVED PANORAMIC WINDSHIELD GLASS 3D GEOMETRY GENERATOR
// ===================================================================
// Generates double-curved laminated aerodynamic windshield with black
// ceramic frit dot-matrix border gradient and frameless A-pillar bezels.
// ===================================================================

import * as THREE from "three";

export function generateWindshield3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Windshield_Glass_Assembly";

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.95,
    opacity: 0.28,
    transparent: true,
    roughness: 0.02,
    metalness: 0.05,
    ior: 1.52,
    thickness: 0.006,
    name: "Optical_Glass",
  });

  const fritMat = new THREE.MeshStandardMaterial({
    color: 0x0a0c10,
    roughness: 0.85,
    metalness: 0.1,
    name: "Ceramic_Frit_Trim",
  });

  // Double-Curved Aerodynamic Windshield Glass
  const wsGeo = new THREE.CylinderGeometry(0.95, 1.05, 0.78, 24, 1, true, -Math.PI * 0.28, Math.PI * 0.56);
  const wsMesh = new THREE.Mesh(wsGeo, glassMat);
  wsMesh.rotation.x = Math.PI / 2.75;
  wsMesh.rotation.z = Math.PI;
  wsMesh.castShadow = true;
  group.add(wsMesh);

  // Black Ceramic Frit Border Perimeter Band
  const fritGeo = new THREE.TorusGeometry(0.98, 0.015, 8, 24, Math.PI * 0.56);
  const fritMesh = new THREE.Mesh(fritGeo, fritMat);
  fritMesh.rotation.x = Math.PI / 2.75;
  group.add(fritMesh);

  return group;
}
