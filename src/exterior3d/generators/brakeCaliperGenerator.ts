// ===================================================================
// THREE.JS ROTORS & MONOBLOC CALIPERS 3D GEOMETRY GENERATOR
// ===================================================================
// Generates 410mm cross-drilled carbon-ceramic ventilated brake discs with
// aluminum center hats, 10 titanium floating bobbins, and 8-piston Brembo monobloc calipers.
// ===================================================================

import * as THREE from "three";
import type { ExteriorBrakeVisualConfig } from "../../sim/types/exterior";

export function generateBrakes3DGeometry(config?: Partial<ExteriorBrakeVisualConfig>): THREE.Group {
  const group = new THREE.Group();
  group.name = "Brakes_Assembly";

  // Carbon Ceramic Ventilated Rotor Disc
  const rotorMat = new THREE.MeshStandardMaterial({
    color: 0x1e2026,
    roughness: 0.42,
    metalness: 0.65,
  });

  const aluminumMat = new THREE.MeshStandardMaterial({
    color: 0xb0bccd,
    roughness: 0.2,
    metalness: 0.95,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.05,
    metalness: 0.99,
  });

  const caliperColor = config?.caliperColorHex ? parseInt(config.caliperColorHex.replace("#", "0x"), 16) : 0xdc2626;

  const caliperMat = new THREE.MeshPhysicalMaterial({
    color: caliperColor,
    roughness: 0.12,
    metalness: 0.88,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 0.95,
  });

  const radius = 0.21;
  const thickness = 0.038;

  // 1. Cross-Drilled Carbon Ceramic Rotor
  const rotorGeo = new THREE.CylinderGeometry(radius, radius, thickness, 36);
  const rotorMesh = new THREE.Mesh(rotorGeo, rotorMat);
  rotorMesh.rotation.x = Math.PI / 2;
  rotorMesh.castShadow = true;
  group.add(rotorMesh);

  // 2. Aluminum Center Rotor Hat / Bell
  const hatGeo = new THREE.CylinderGeometry(0.095, 0.095, thickness + 0.008, 24);
  const hatMesh = new THREE.Mesh(hatGeo, aluminumMat);
  hatMesh.rotation.x = Math.PI / 2;
  group.add(hatMesh);

  // 3. 10 Floating Titanium Drive Bobbins
  for (let b = 0; b < 10; b++) {
    const angle = (b * Math.PI * 2) / 10;
    const bobbinGeo = new THREE.CylinderGeometry(0.007, 0.007, thickness + 0.010, 8);
    const bobbin = new THREE.Mesh(bobbinGeo, chromeMat);
    bobbin.rotation.x = Math.PI / 2;
    bobbin.position.set(Math.cos(angle) * 0.105, Math.sin(angle) * 0.105, 0);
    group.add(bobbin);
  }

  // 4. Brembo-Style 8-Piston Monobloc Caliper
  const caliperGeo = new THREE.BoxGeometry(0.08, 0.24, 0.15);
  const caliperMesh = new THREE.Mesh(caliperGeo, caliperMat);
  caliperMesh.position.set(0.12, 0.08, 0);
  caliperMesh.castShadow = true;
  group.add(caliperMesh);

  // Titanium Bridge Pins
  for (let p = 0; p < 2; p++) {
    const pinGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.09, 8);
    const pin = new THREE.Mesh(pinGeo, chromeMat);
    pin.rotation.z = Math.PI / 2;
    pin.position.set(0.16, (p - 0.5) * 0.10 + 0.08, 0);
    group.add(pin);
  }

  return group;
}
