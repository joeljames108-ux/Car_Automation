// ===================================================================
// THREE.JS HIGH-FIDELITY DOUBLE WISHBONE FRONT SUSPENSION GENERATOR
// ===================================================================
// Production-engineered double wishbone suspension with:
// - Upper & lower aerodynamic A-arms with spherical rod ends & bushings
// - CNC-machined aluminum wheel upright / spindle hub
// - Real helical wound coilover spring over monotube damper
// - Threaded spanner preload adjustment collars & bump stop
// - Piggyback nitrogen reservoir with braided hose
// - Steering rack tie-rods with ribbed accordion rubber dust boots
// - Transverse anti-roll bar with spherical ball joint drop links
// ===================================================================

import * as THREE from "three";

/** Helical path for physical coilover spring */
class SuspensionHelixCurve extends THREE.Curve<THREE.Vector3> {
  constructor(
    public radius: number = 0.038,
    public height: number = 0.26,
    public turns: number = 7.5
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
function createRubberBoot(length: number, maxRadius: number, minRadius: number, rings: number): THREE.BufferGeometry {
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

export function generateFrontSuspension3DGeometry(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Front_Suspension_Assembly";

  // --- High-Grade PBR Materials ---
  const titaniumMat = new THREE.MeshPhysicalMaterial({
    color: 0x94a3b8,
    metalness: 0.9,
    roughness: 0.22,
    clearcoat: 0.3,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.5,
  });

  const billetAlumMat = new THREE.MeshPhysicalMaterial({
    color: 0xc8d0d8,
    metalness: 0.88,
    roughness: 0.15,
    clearcoat: 0.4,
    clearcoatRoughness: 0.02,
    envMapIntensity: 1.8,
  });

  const damperBodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.18,
    clearcoat: 0.6,
  });

  const chromeShaftMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.98,
    roughness: 0.02,
    reflectivity: 1.0,
  });

  const springMat = new THREE.MeshPhysicalMaterial({
    color: 0xfacc15, // Competition Yellow
    metalness: 0.3,
    roughness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.01,
  });

  const collarAnodizedMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7, // Anodized Blue
    metalness: 0.85,
    roughness: 0.25,
  });

  const bumpStopMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // Polyurethane Amber
    roughness: 0.6,
    metalness: 0.0,
  });

  const rubberMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.85,
    metalness: 0.05,
  });

  const antiRollBarMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626, // Competition Red Sway Bar
    metalness: 0.7,
    roughness: 0.25,
  });

  // =========================================================================
  // 1. UPPER A-ARM (TUBULAR WISHBONE WITH SPHERICAL BEARING)
  // =========================================================================
  const upperArmGroup = new THREE.Group();
  upperArmGroup.name = "Upper_Control_A_Arm";
  upperArmGroup.position.set(0, 0.16, 0);

  // Front leg tube
  const legGeo1 = new THREE.CylinderGeometry(0.012, 0.012, 0.32, 16);
  const upperLegFront = new THREE.Mesh(legGeo1, titaniumMat);
  upperLegFront.rotation.z = Math.PI / 3.2;
  upperLegFront.rotation.y = 0.28;
  upperLegFront.position.set(0.12, 0, 0.08);

  // Rear leg tube
  const upperLegRear = new THREE.Mesh(legGeo1, titaniumMat);
  upperLegRear.rotation.z = Math.PI / 3.2;
  upperLegRear.rotation.y = -0.28;
  upperLegRear.position.set(0.12, 0, -0.08);

  // Inboard pivot bushing sleeves
  const bushGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.05, 16);
  const bushFront = new THREE.Mesh(bushGeo, rubberMat);
  bushFront.rotation.x = Math.PI / 2;
  bushFront.position.set(-0.02, 0.08, 0.14);

  const bushRear = new THREE.Mesh(bushGeo, rubberMat);
  bushRear.rotation.x = Math.PI / 2;
  bushRear.position.set(-0.02, 0.08, -0.14);

  // Outboard spherical ball joint apex
  const ballJointApexGeo = new THREE.SphereGeometry(0.022, 16, 16);
  const ballJointApex = new THREE.Mesh(ballJointApexGeo, billetAlumMat);
  ballJointApex.position.set(0.24, -0.08, 0);

  upperArmGroup.add(upperLegFront, upperLegRear, bushFront, bushRear, ballJointApex);
  group.add(upperArmGroup);

  // =========================================================================
  // 2. LOWER A-ARM (HIGH-LOAD TRIANGULAR WISHBONE)
  // =========================================================================
  const lowerArmGroup = new THREE.Group();
  lowerArmGroup.name = "Lower_Control_A_Arm";
  lowerArmGroup.position.set(0, -0.14, 0);

  const lowerLegGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.38, 16);
  const lowerLegFront = new THREE.Mesh(lowerLegGeo, titaniumMat);
  lowerLegFront.rotation.z = Math.PI / 3.0;
  lowerLegFront.rotation.y = 0.35;
  lowerLegFront.position.set(0.14, 0, 0.11);

  const lowerLegRear = new THREE.Mesh(lowerLegGeo, titaniumMat);
  lowerLegRear.rotation.z = Math.PI / 3.0;
  lowerLegRear.rotation.y = -0.35;
  lowerLegRear.position.set(0.14, 0, -0.11);

  // Cross brace gusset plate
  const gussetGeo = new THREE.BoxGeometry(0.12, 0.01, 0.16);
  const gusset = new THREE.Mesh(gussetGeo, titaniumMat);
  gusset.position.set(0.12, 0.02, 0);

  // Lower ball joint carrier
  const lowerBallJoint = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.04, 16), billetAlumMat);
  lowerBallJoint.position.set(0.28, -0.09, 0);

  lowerArmGroup.add(lowerLegFront, lowerLegRear, gusset, lowerBallJoint);
  group.add(lowerArmGroup);

  // =========================================================================
  // 3. CNC BILLET ALUMINUM WHEEL UPRIGHT (STEERING KNUCKLE)
  // =========================================================================
  const uprightGroup = new THREE.Group();
  uprightGroup.name = "CNC_Wheel_Upright";
  uprightGroup.position.set(0.26, 0.01, 0);

  // Main vertical upright column
  const uprightBodyGeo = new THREE.BoxGeometry(0.045, 0.32, 0.065);
  const uprightBody = new THREE.Mesh(uprightBodyGeo, billetAlumMat);

  // Wheel spindle axle hub
  const spindleGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.12, 24);
  const spindle = new THREE.Mesh(spindleGeo, chromeShaftMat);
  spindle.rotation.z = Math.PI / 2;
  spindle.position.set(0.04, 0, 0);

  // Steering arm horn extending rearward
  const steeringHornGeo = new THREE.BoxGeometry(0.02, 0.025, 0.11);
  const steeringHorn = new THREE.Mesh(steeringHornGeo, billetAlumMat);
  steeringHorn.position.set(-0.01, -0.04, -0.08);

  uprightGroup.add(uprightBody, spindle, steeringHorn);
  group.add(uprightGroup);

  // =========================================================================
  // 4. COILOVER DAMPER ASSEMBLY (WOUND SPRING + THREADED COLLARS)
  // =========================================================================
  const coiloverGroup = new THREE.Group();
  coiloverGroup.name = "Coilover_Damper_Assembly";
  coiloverGroup.position.set(0.11, 0.03, 0);
  coiloverGroup.rotation.z = -0.22; // Inward camber angle

  // Monotube main damper body cylinder
  const damperTubeGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.22, 24);
  const damperTube = new THREE.Mesh(damperTubeGeo, damperBodyMat);
  damperTube.position.set(0, -0.06, 0);

  // Threaded sleeve ring texture ridges
  const threadCollarGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.025, 24);
  const threadCollar = new THREE.Mesh(threadCollarGeo, collarAnodizedMat);
  threadCollar.position.set(0, 0.04, 0);

  // Chrome piston rod shaft
  const pistonShaftGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.16, 20);
  const pistonShaft = new THREE.Mesh(pistonShaftGeo, chromeShaftMat);
  pistonShaft.position.set(0, 0.11, 0);

  // Polyurethane bump stop
  const bumpStopGeo = new THREE.ConeGeometry(0.024, 0.045, 16);
  const bumpStop = new THREE.Mesh(bumpStopGeo, bumpStopMat);
  bumpStop.position.set(0, 0.07, 0);

  // Real Helical Wound Coilover Spring
  const helix = new SuspensionHelixCurve(0.039, 0.25, 7.5);
  const springGeo = new THREE.TubeGeometry(helix, 96, 0.0065, 12, false);
  const springMesh = new THREE.Mesh(springGeo, springMat);
  springMesh.position.set(0, 0.01, 0);

  // Remote piggyback reservoir canister
  const reservoirGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.12, 20);
  const reservoir = new THREE.Mesh(reservoirGeo, collarAnodizedMat);
  reservoir.position.set(-0.048, -0.04, 0);

  coiloverGroup.add(damperTube, threadCollar, pistonShaft, bumpStop, springMesh, reservoir);
  group.add(coiloverGroup);

  // =========================================================================
  // 5. STEERING TIE ROD & ACCORDION RUBBER GAITER BOOT
  // =========================================================================
  const steeringGroup = new THREE.Group();
  steeringGroup.name = "Steering_Tie_Rod_Assembly";
  steeringGroup.position.set(0.12, -0.03, -0.08);

  // Tie rod steel shaft
  const tieRodGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.26, 16);
  const tieRod = new THREE.Mesh(tieRodGeo, titaniumMat);
  tieRod.rotation.x = Math.PI / 2;

  // Accordion ribbed rubber gaiter boot
  const bootGeo = createRubberBoot(0.08, 0.018, 0.011, 6);
  const boot = new THREE.Mesh(bootGeo, rubberMat);
  boot.rotation.x = Math.PI / 2;
  boot.position.set(0, 0, 0.08);

  steeringGroup.add(tieRod, boot);
  group.add(steeringGroup);

  // =========================================================================
  // 6. ANTI-ROLL BAR (SWAY BAR) & DROP LINKS
  // =========================================================================
  const arbGroup = new THREE.Group();
  arbGroup.name = "Anti_Roll_Bar_Subsystem";
  arbGroup.position.set(-0.04, -0.10, 0.08);

  // Transverse sway bar section
  const arbBarGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.36, 16);
  const arbBar = new THREE.Mesh(arbBarGeo, antiRollBarMat);
  arbBar.rotation.x = Math.PI / 2;

  // Vertical drop link rod
  const dropLinkGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.12, 12);
  const dropLink = new THREE.Mesh(dropLinkGeo, billetAlumMat);
  dropLink.position.set(0.06, 0.04, 0);

  arbGroup.add(arbBar, dropLink);
  group.add(arbGroup);

  return group;
}
