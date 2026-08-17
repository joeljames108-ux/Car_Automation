// ===================================================================
// THREE.JS ROTORS & MONOBLOC CALIPERS 3D GEOMETRY GENERATOR
// ===================================================================

import * as THREE from "three";
import type { ExteriorBrakeVisualConfig } from "../../sim/types/exterior";

export function generateBrakes3DGeometry(config?: Partial<ExteriorBrakeVisualConfig>): THREE.Group {
  const group = new THREE.Group();
  group.name = "Brakes_Assembly";

  // Carbon Ceramic Rotor Disc
  const rotorMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.45, metalness: 0.8 });
  const rotorGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.03, 32);
  const rotorMesh = new THREE.Mesh(rotorGeo, rotorMat);
  rotorMesh.rotation.x = Math.PI / 2;
  rotorMesh.castShadow = true;
  group.add(rotorMesh);

  // Monobloc Caliper Body
  const caliperMat = new THREE.MeshStandardMaterial({
    color: config?.caliperColorHex === "#dc2626" ? 0xdc2626 : 0xf59e0b,
    roughness: 0.2,
    metalness: 0.8,
  });
  const caliperGeo = new THREE.BoxGeometry(0.12, 0.22, 0.08);
  const caliperMesh = new THREE.Mesh(caliperGeo, caliperMat);
  caliperMesh.position.set(0.18, 0, 0);
  caliperMesh.castShadow = true;
  group.add(caliperMesh);

  return group;
}
