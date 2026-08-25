// ===================================================================
// THREE.JS FORGED MOTORSPORT WHEEL RIMS 3D GEOMETRY GENERATOR
// ===================================================================
// Generates deep-concave forged monoblock racing wheels with 10 tapered
// spokes, machined rim lip, inner barrel, and centerlock nut assembly.
// ===================================================================

import * as THREE from "three";
import type { ExteriorWheelConfig } from "../../sim/types/exterior";

export function generateWheel3DGeometry(config?: Partial<ExteriorWheelConfig>): THREE.Group {
  const group = new THREE.Group();
  group.name = "Wheel_Rim_Assembly";

  const finish = config?.finish || "silver";
  const rimColor =
    finish === "satin_bronze"
      ? 0xd97706
      : finish === "gloss_jet_black"
      ? 0x09090b
      : finish === "rose_gold"
      ? 0xeab308
      : finish === "matte_magnesium"
      ? 0xa1a1aa
      : 0xd4d4d8;

  const wheelMat = new THREE.MeshPhysicalMaterial({
    color: rimColor,
    roughness: finish === "gloss_jet_black" ? 0.05 : 0.12,
    metalness: 0.95,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    reflectivity: 0.98,
    name: "Wheel_Rim_Material",
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.05,
    metalness: 0.99,
  });

  const centerlockMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.2,
    metalness: 0.88,
  });

  const rimRadius = 0.25;
  const rimWidth = 0.28;

  // Outer Rim Barrel
  const rimGeo = new THREE.CylinderGeometry(rimRadius, rimRadius * 0.95, rimWidth, 32, 1, true);
  const rimMesh = new THREE.Mesh(rimGeo, wheelMat);
  rimMesh.rotation.x = Math.PI / 2;
  rimMesh.castShadow = true;
  group.add(rimMesh);

  // Polished Outer Rim Lip
  const lipGeo = new THREE.TorusGeometry(rimRadius, 0.012, 12, 32);
  const lipMesh = new THREE.Mesh(lipGeo, wheelMat);
  lipMesh.position.set(0, 0, rimWidth / 2);
  group.add(lipMesh);

  // 10 Forged Concave Spoke Assembly
  const spokeCount = 10;
  const spokeLength = rimRadius * 0.86;
  for (let i = 0; i < spokeCount; i++) {
    const spokeAngle = (i * Math.PI * 2) / spokeCount;
    const spokeGeo = new THREE.BoxGeometry(0.016, 0.020, spokeLength);
    const spoke = new THREE.Mesh(spokeGeo, wheelMat);
    spoke.rotation.z = spokeAngle;
    spoke.rotation.x = 0.12; // Concave inward slant
    spoke.position.set(
      (Math.sin(spokeAngle) * spokeLength) / 2,
      (Math.cos(spokeAngle) * spokeLength) / 2,
      rimWidth * 0.35
    );
    group.add(spoke);
  }

  // Center Hub & Anodized Centerlock Nut
  const hubGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.04, 16);
  const hubMesh = new THREE.Mesh(hubGeo, wheelMat);
  hubMesh.rotation.x = Math.PI / 2;
  hubMesh.position.set(0, 0, rimWidth * 0.42);
  group.add(hubMesh);

  const nutGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.035, 6);
  const nutMesh = new THREE.Mesh(nutGeo, centerlockMat);
  nutMesh.rotation.x = Math.PI / 2;
  nutMesh.position.set(0, 0, rimWidth * 0.46);
  group.add(nutMesh);

  // Safety Retaining Pin Wire
  const pinGeo = new THREE.TorusGeometry(0.025, 0.003, 8, 16);
  const pinMesh = new THREE.Mesh(pinGeo, chromeMat);
  pinMesh.position.set(0, 0, rimWidth * 0.48);
  group.add(pinMesh);

  return group;
}
