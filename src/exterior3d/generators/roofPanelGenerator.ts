// ===================================================================
// THREE.JS DOUBLE-BUBBLE ROOF PANEL 3D GEOMETRY GENERATOR
// ===================================================================
// Generates aerodynamic double-bubble carbon fiber roof with center air channel,
// integrated engine intake roof scoop, and structural A/B pillar transitions.
// ===================================================================

import * as THREE from "three";

export function generateRoofPanel3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Roof_Panel_Assembly";

  const carbonRoofMat = new THREE.MeshPhysicalMaterial({
    color: 0x090d16,
    roughness: 0.12,
    metalness: 0.90,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    reflectivity: 0.95,
    name: "Exposed_Carbon_Roof",
  });

  // Main Double-Bubble Roof Shell (Curved Surface)
  const roofGeo = new THREE.CylinderGeometry(0.85, 0.92, 0.88, 20, 1, true, -Math.PI * 0.28, Math.PI * 0.56);
  const roofMesh = new THREE.Mesh(roofGeo, carbonRoofMat);
  roofMesh.rotation.x = Math.PI / 2;
  roofMesh.rotation.z = Math.PI;
  roofMesh.scale.set(1.0, 0.35, 1.0);
  roofMesh.castShadow = true;
  group.add(roofMesh);

  // Center Airflow Depressed Channel
  const spineGeo = new THREE.BoxGeometry(0.14, 0.035, 0.86);
  const spineMesh = new THREE.Mesh(spineGeo, carbonRoofMat);
  spineMesh.position.set(0, 0.14, 0);
  group.add(spineMesh);

  // Overhead Ram-Air Engine Induction Scoop
  const scoopGeo = new THREE.BoxGeometry(0.24, 0.065, 0.32);
  const scoop = new THREE.Mesh(scoopGeo, carbonRoofMat);
  scoop.position.set(0, 0.19, -0.15);
  scoop.rotation.x = -0.12;
  group.add(scoop);

  return group;
}
