// ===================================================================
// THREE.JS CURVED PANORAMIC WINDSHIELD GLASS 3D GEOMETRY GENERATOR
// ===================================================================
// Generates double-curved laminated aerodynamic windshield with:
// - Optical physical glass transmission & IOR 1.52
// - Black ceramic frit dot-matrix border gradient
// - Flush EPDM rubber perimeter cowl gasket
// - Dual articulated motorsport windshield wipers with rubber blades
// ===================================================================

import * as THREE from "three";

export function generateWindshield3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Windshield_Glass_Assembly";

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.94,
    opacity: 0.28,
    transparent: true,
    roughness: 0.015,
    metalness: 0.05,
    ior: 1.52,
    thickness: 0.006,
    clearcoat: 1.0,
    clearcoatRoughness: 0.01,
    name: "Optical_Glass",
  });

  const fritMat = new THREE.MeshStandardMaterial({
    color: 0x0a0c10,
    roughness: 0.85,
    metalness: 0.1,
    name: "Ceramic_Frit_Trim",
  });

  const wiperMetalMat = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.35,
    metalness: 0.85,
  });

  const rubberBladeMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.90,
    metalness: 0.05,
  });

  // 1. Double-Curved Aerodynamic Windshield Glass
  const wsGeo = new THREE.CylinderGeometry(0.95, 1.05, 0.78, 32, 1, true, -Math.PI * 0.28, Math.PI * 0.56);
  const wsMesh = new THREE.Mesh(wsGeo, glassMat);
  wsMesh.rotation.x = Math.PI / 2.75;
  wsMesh.rotation.z = Math.PI;
  wsMesh.castShadow = true;
  group.add(wsMesh);

  // 2. Black Ceramic Frit Border Perimeter Band
  const fritGeo = new THREE.TorusGeometry(0.98, 0.018, 8, 32, Math.PI * 0.56);
  const fritMesh = new THREE.Mesh(fritGeo, fritMat);
  fritMesh.rotation.x = Math.PI / 2.75;
  group.add(fritMesh);

  // 3. Dual Articulated Windshield Wipers Parked at Cowl Base
  const wiperOffsets = [-0.22, 0.14];
  wiperOffsets.forEach((xOff, idx) => {
    const wiperGroup = new THREE.Group();
    wiperGroup.name = `Wiper_Assembly_${idx === 0 ? "Driver" : "Passenger"}`;
    wiperGroup.position.set(xOff, -0.32, 0.34);
    wiperGroup.rotation.x = 0.42;
    wiperGroup.rotation.z = idx === 0 ? 0.22 : 0.28;

    // Pivot mount hub
    const hubGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.02, 16);
    const hubMesh = new THREE.Mesh(hubGeo, wiperMetalMat);
    hubMesh.rotation.x = Math.PI / 2;

    // Stamped articulated metal wiper arm
    const armGeo = new THREE.BoxGeometry(0.008, 0.32, 0.006);
    const armMesh = new THREE.Mesh(armGeo, wiperMetalMat);
    armMesh.position.set(0.08, 0.14, 0.008);
    armMesh.rotation.z = -0.48;

    // Flexible rubber squeegee blade
    const bladeGeo = new THREE.BoxGeometry(0.005, 0.38, 0.012);
    const bladeMesh = new THREE.Mesh(bladeGeo, rubberBladeMat);
    bladeMesh.position.set(0.12, 0.16, 0.014);
    bladeMesh.rotation.z = -0.48;

    wiperGroup.add(hubMesh, armMesh, bladeMesh);
    group.add(wiperGroup);
  });

  return group;
}
