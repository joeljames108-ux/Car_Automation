// ============================================================================
// HIGH-FIDELITY FORGED MOTORSPORT WHEEL RIM 3D GEOMETRY GENERATOR
// ============================================================================
// Constructs authentic forged monoblock and modular motorsport wheels:
// - Deep drop-center barrel with inner/outer bead seats and stepped rim lips
// - 10 tapered Y-spokes with back-milled weight reduction pockets & CNC chamfers
// - Recessed center hub with 5 titanium lug nuts or anodized centerlock nut
// - Safety locking pin, TPMS valve stem with knurled cap
// - Multi-tier PBR metal materials (satin bronze, gloss jet black, titanium, magnesium)
// ============================================================================

import * as THREE from "three";
import type { ExteriorWheelConfig } from "../../sim/types/exterior";

export type WheelVariant = "y_spoke" | "mesh" | "split_5" | "turbofan" | "centerlock_gt";

export function generateWheel3DGeometry(
  config?: Partial<ExteriorWheelConfig>,
  variant: WheelVariant = "y_spoke"
): THREE.Group {
  const group = new THREE.Group();
  group.name = "Wheel_Rim_Assembly_HighDetail";

  const finish = config?.finish || "silver";
  const rimColor =
    finish === "satin_bronze"
      ? 0xc2782b
      : finish === "gloss_jet_black"
      ? 0x0a0b0e
      : finish === "rose_gold"
      ? 0xdf9b76
      : finish === "matte_magnesium"
      ? 0x8b939e
      : 0xd8e0e8;

  const wheelMat = new THREE.MeshPhysicalMaterial({
    color: rimColor,
    roughness: finish === "gloss_jet_black" ? 0.08 : 0.22,
    metalness: 0.94,
    clearcoat: 0.85,
    clearcoatRoughness: 0.06,
    reflectivity: 0.95,
    name: "Forged_Rim_Finish",
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.06,
    metalness: 0.98,
    name: "Machined_Chrome_Hardware",
  });

  const centerlockMat = new THREE.MeshPhysicalMaterial({
    color: 0xdc2626,
    roughness: 0.18,
    metalness: 0.88,
    clearcoat: 0.75,
    name: "Anodized_Centerlock_Nut",
  });

  const barrelInnerMat = new THREE.MeshStandardMaterial({
    color: 0x181a20,
    roughness: 0.55,
    metalness: 0.65,
    name: "Inner_Barrel_Heat_Shield",
  });

  const valveMat = new THREE.MeshStandardMaterial({
    color: 0x2e3440,
    roughness: 0.35,
    metalness: 0.8,
  });

  const rimRadius = 0.245; // 19" diameter (~490mm)
  const rimWidth = 0.29;   // 290mm barrel width
  const SEG = 96;

  // ── 1. Forged Drop-Center Rim Barrel ──
  // Stepped cylinder barrel
  const barrelGeo = new THREE.CylinderGeometry(rimRadius * 0.98, rimRadius * 0.94, rimWidth * 0.92, SEG, 4, true);
  barrelGeo.rotateX(Math.PI / 2);
  group.add(new THREE.Mesh(barrelGeo, barrelInnerMat));

  // Outer polished rim lip
  const outerLip = new THREE.Mesh(new THREE.TorusGeometry(rimRadius, 0.012, 16, SEG), wheelMat);
  outerLip.position.z = rimWidth / 2;
  group.add(outerLip);

  // Inner structural bead flange
  const innerLip = new THREE.Mesh(new THREE.TorusGeometry(rimRadius * 0.97, 0.009, 12, SEG), wheelMat);
  innerLip.position.z = -rimWidth / 2;
  group.add(innerLip);

  // Drop-center safety hump rings
  [-0.35, -0.15, 0.10].forEach((frac) => {
    const hump = new THREE.Mesh(new THREE.TorusGeometry(rimRadius * 0.95, 0.003, 8, SEG), barrelInnerMat);
    hump.position.z = rimWidth * frac;
    group.add(hump);
  });

  // ── 2. Forged 10-Spoke Pocketed Y-Spoke Architecture ──
  const spokeCount = 10;
  const hubZ = rimWidth * 0.22;

  for (let i = 0; i < spokeCount; i++) {
    const angle = (i / spokeCount) * Math.PI * 2;
    const spokeGroup = new THREE.Group();
    spokeGroup.rotation.z = angle;

    // Main tapered arm
    const armShape = new THREE.Shape();
    armShape.moveTo(-0.014, rimRadius * 0.22);
    armShape.lineTo(0.014, rimRadius * 0.22);
    armShape.lineTo(0.019, rimRadius * 0.58);
    armShape.lineTo(-0.019, rimRadius * 0.58);
    armShape.closePath();

    const armGeo = new THREE.ExtrudeGeometry(armShape, {
      depth: 0.018,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.003,
      bevelSegments: 3,
    });
    const armMesh = new THREE.Mesh(armGeo, wheelMat);
    armMesh.position.z = hubZ - 0.009;
    armMesh.castShadow = true;
    spokeGroup.add(armMesh);

    // Split Y-Fork tips reaching out to the rim barrel
    for (const forkSide of [-1, 1]) {
      const forkShape = new THREE.Shape();
      forkShape.moveTo(0, rimRadius * 0.56);
      forkShape.lineTo(forkSide * 0.038, rimRadius * 0.95);
      forkShape.lineTo(forkSide * 0.024, rimRadius * 0.96);
      forkShape.lineTo(0, rimRadius * 0.62);
      forkShape.closePath();

      const forkGeo = new THREE.ExtrudeGeometry(forkShape, {
        depth: 0.015,
        bevelEnabled: true,
        bevelThickness: 0.003,
        bevelSize: 0.002,
        bevelSegments: 2,
      });
      const forkMesh = new THREE.Mesh(forkGeo, wheelMat);
      forkMesh.position.z = hubZ - 0.007;
      forkMesh.castShadow = true;
      spokeGroup.add(forkMesh);
    }

    // Weight reduction pocket cutout
    const pocketGeo = new THREE.CylinderGeometry(0.006, 0.004, 0.014, 8);
    const pocket = new THREE.Mesh(pocketGeo, barrelInnerMat);
    pocket.position.set(0, rimRadius * 0.42, hubZ);
    pocket.rotation.x = Math.PI / 2;
    spokeGroup.add(pocket);

    group.add(spokeGroup);
  }

  // ── 3. Central Mounting Hub Disc & 5 Titanium Lug Studs ──
  const hubGeo = new THREE.CylinderGeometry(rimRadius * 0.26, rimRadius * 0.28, 0.022, 32);
  hubGeo.rotateX(Math.PI / 2);
  const hubMesh = new THREE.Mesh(hubGeo, wheelMat);
  hubMesh.position.z = hubZ;
  group.add(hubMesh);

  // 5 Hexagonal Titanium Lug Nuts
  for (let l = 0; l < 5; l++) {
    const lugAngle = (l / 5) * Math.PI * 2;
    const lugDist = rimRadius * 0.16;
    const lugGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.016, 6);
    lugGeo.rotateX(Math.PI / 2);
    const lugMesh = new THREE.Mesh(lugGeo, chromeMat);
    lugMesh.position.set(
      Math.cos(lugAngle) * lugDist,
      Math.sin(lugAngle) * lugDist,
      hubZ + 0.012
    );
    group.add(lugMesh);
  }

  // ── 4. Motorsport Centerlock Nut with Safety Retaining Wire ──
  const centerlockGeo = new THREE.CylinderGeometry(0.026, 0.028, 0.026, 6);
  centerlockGeo.rotateX(Math.PI / 2);
  const centerlockNut = new THREE.Mesh(centerlockGeo, centerlockMat);
  centerlockNut.position.z = hubZ + 0.018;
  centerlockNut.castShadow = true;
  group.add(centerlockNut);

  // Safety Retaining Clip Ring
  const clipRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.028, 0.002, 6, 24),
    chromeMat
  );
  clipRing.position.z = hubZ + 0.026;
  group.add(clipRing);

  // ── 5. Knurled TPMS Valve Stem ──
  const valveAngle = Math.PI * 0.42;
  const vRadius = rimRadius * 0.88;
  const valveStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.003, 0.003, 0.028, 12),
    valveMat
  );
  valveStem.position.set(
    Math.cos(valveAngle) * vRadius,
    Math.sin(valveAngle) * vRadius,
    hubZ + 0.012
  );
  valveStem.rotation.x = Math.PI / 2;
  valveStem.rotation.z = -valveAngle * 0.2;
  group.add(valveStem);

  // Knurled valve cap
  const valveCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0045, 0.004, 0.01, 12),
    chromeMat
  );
  valveCap.position.set(
    Math.cos(valveAngle) * vRadius,
    Math.sin(valveAngle) * vRadius,
    hubZ + 0.028
  );
  valveCap.rotation.x = Math.PI / 2;
  group.add(valveCap);

  return group;
}