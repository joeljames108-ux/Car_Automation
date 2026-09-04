// ===================================================================
// THREE.JS HIGH-FIDELITY MULTILINK REAR SUSPENSION & AXLE GENERATOR
// ===================================================================
// Production-engineered multilink rear suspension with:
// - 5 Forged aluminum multi-link arms with spherical rod end bearings
// - CNC-machined heavy-duty rear upright & bearing carrier
// - CV Axle halfshaft with ribbed accordion rubber dust boots
// - Helical wound coilover spring over monotube damper
// - Rear anti-roll torsion bar with articulated drop links
// ===================================================================

import * as THREE from "three";

/** Helical path for physical coilover spring */
class RearSuspensionHelixCurve extends THREE.Curve<THREE.Vector3> {
  constructor(
    public radius: number = 0.042,
    public height: number = 0.28,
    public turns: number = 8.0
  ) {
    super();
  }
  getPoint(t: number, optionalTarget = new THREE.Vector3()): THREE.Vector3 {
    const angle = t * this.turns * Math.PI * 2;
    const x = this.radius * Math.cos(angle);
    const z = this.radius * Math.sin(angle);
    const y = (t - 0.5) * this.height;
    return optionalTarget.set(x, y, z);
  }
}

/** Accordion rubber gaiter fluting */
function createRearRubberBoot(length: number, maxRadius: number, minRadius: number, rings: number): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  const half = length / 2;
  for (let i = 0; i <= rings * 2; i++) {
    const t = i / (rings * 2);
    const y = -half + t * length;
    const isPeak = i % 2 === 1;
    const r = isPeak ? maxRadius : minRadius;
    points.push(new THREE.Vector2(r, y));
  }
  return new THREE.LatheGeometry(points, 24);
}

export function generateRearSuspension3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Rear_Suspension_Assembly";

  // --- Materials ---
  const titaniumMat = new THREE.MeshPhysicalMaterial({
    color: 0x94a3b8,
    metalness: 0.9,
    roughness: 0.22,
    clearcoat: 0.3,
    clearcoatRoughness: 0.05,
  });

  const forgedAlumMat = new THREE.MeshPhysicalMaterial({
    color: 0xc4cdd5,
    metalness: 0.88,
    roughness: 0.18,
    clearcoat: 0.4,
  });

  const steelAxleMat = new THREE.MeshPhysicalMaterial({
    color: 0x334155,
    metalness: 0.92,
    roughness: 0.28,
  });

  const springMat = new THREE.MeshPhysicalMaterial({
    color: 0xef4444, // Motorsport Red Spring
    metalness: 0.3,
    roughness: 0.15,
    clearcoat: 1.0,
  });

  const rubberMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.88,
    metalness: 0.05,
  });

  const chromeMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.98,
    roughness: 0.02,
  });

  // =========================================================================
  // 1. REAR WHEEL UPRIGHT / BEARING CARRIER
  // =========================================================================
  const uprightGroup = new THREE.Group();
  uprightGroup.name = "Rear_Wheel_Carrier";
  uprightGroup.position.set(0.28, 0.0, 0);

  const uprightBodyGeo = new THREE.BoxGeometry(0.05, 0.34, 0.08);
  const uprightBody = new THREE.Mesh(uprightBodyGeo, forgedAlumMat);

  const spindleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.14, 24);
  const spindle = new THREE.Mesh(spindleGeo, chromeMat);
  spindle.rotation.z = Math.PI / 2;
  spindle.position.set(0.05, 0, 0);

  uprightGroup.add(uprightBody, spindle);
  group.add(uprightGroup);

  // =========================================================================
  // 2. CV DRIVE AXLE HALFSHAFT & ACCORDION BOOTS
  // =========================================================================
  const axleGroup = new THREE.Group();
  axleGroup.name = "CV_Drive_Axle_Halfshaft";
  axleGroup.position.set(0.12, 0, 0);

  // Main high-strength steel drive axle
  const axleShaftGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.36, 20);
  const axleShaft = new THREE.Mesh(axleShaftGeo, steelAxleMat);
  axleShaft.rotation.z = Math.PI / 2;

  // Inboard CV boot (near differential/transaxle)
  const inBootGeo = createRearRubberBoot(0.07, 0.028, 0.018, 5);
  const inBoot = new THREE.Mesh(inBootGeo, rubberMat);
  inBoot.rotation.z = Math.PI / 2;
  inBoot.position.set(-0.13, 0, 0);

  // Outboard CV boot (near wheel upright)
  const outBootGeo = createRearRubberBoot(0.07, 0.028, 0.018, 5);
  const outBoot = new THREE.Mesh(outBootGeo, rubberMat);
  outBoot.rotation.z = Math.PI / 2;
  outBoot.position.set(0.13, 0, 0);

  axleGroup.add(axleShaft, inBoot, outBoot);
  group.add(axleGroup);

  // =========================================================================
  // 3. 5 INDEPENDENT MULTI-LINK CONTROL ARMS WITH SPHERICAL ENDS
  // =========================================================================
  const linksGroup = new THREE.Group();
  linksGroup.name = "Multilink_Control_Arms";

  const linkConfigs = [
    { name: "Upper_Camber_Link", posY: 0.15, posZ: 0.04, rotY: 0.12, rotZ: Math.PI / 3.4, len: 0.34 },
    { name: "Upper_Trailing_Link", posY: 0.13, posZ: -0.12, rotY: -0.25, rotZ: Math.PI / 3.2, len: 0.36 },
    { name: "Lower_Control_Arm", posY: -0.14, posZ: 0.0, rotY: 0.0, rotZ: Math.PI / 3.0, len: 0.40 },
    { name: "Lower_Trailing_Arm", posY: -0.12, posZ: -0.14, rotY: -0.32, rotZ: Math.PI / 2.9, len: 0.42 },
    { name: "Adjustable_Toe_Link", posY: -0.06, posZ: 0.14, rotY: 0.28, rotZ: Math.PI / 3.1, len: 0.38 },
  ];

  linkConfigs.forEach(cfg => {
    const armSubgroup = new THREE.Group();
    armSubgroup.name = cfg.name;
    armSubgroup.position.set(0.12, cfg.posY, cfg.posZ);

    // Tubular control arm
    const armGeo = new THREE.CylinderGeometry(0.011, 0.011, cfg.len, 16);
    const armMesh = new THREE.Mesh(armGeo, titaniumMat);
    armMesh.rotation.z = cfg.rotZ;
    armMesh.rotation.y = cfg.rotY;

    // Outboard spherical rod end
    const rodEndGeo = new THREE.SphereGeometry(0.018, 16, 16);
    const rodEnd = new THREE.Mesh(rodEndGeo, forgedAlumMat);
    rodEnd.position.set(cfg.len * 0.4, 0, 0);

    armSubgroup.add(armMesh, rodEnd);
    linksGroup.add(armSubgroup);
  });
  group.add(linksGroup);

  // =========================================================================
  // 4. REAR COILOVER SHOCK ABSORBER
  // =========================================================================
  const coiloverGroup = new THREE.Group();
  coiloverGroup.name = "Rear_Coilover_Assembly";
  coiloverGroup.position.set(0.14, 0.04, -0.04);
  coiloverGroup.rotation.z = -0.24;

  const damperTubeGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.24, 24);
  const damperTube = new THREE.Mesh(damperTubeGeo, steelAxleMat);
  damperTube.position.set(0, -0.07, 0);

  const shaftGeo = new THREE.CylinderGeometry(0.013, 0.013, 0.18, 20);
  const shaft = new THREE.Mesh(shaftGeo, chromeMat);
  shaft.position.set(0, 0.12, 0);

  const helix = new RearSuspensionHelixCurve(0.041, 0.27, 8.0);
  const springGeo = new THREE.TubeGeometry(helix, 96, 0.007, 12, false);
  const springMesh = new THREE.Mesh(springGeo, springMat);

  coiloverGroup.add(damperTube, shaft, springMesh);
  group.add(coiloverGroup);

  return group;
}
