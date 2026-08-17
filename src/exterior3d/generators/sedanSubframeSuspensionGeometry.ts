// ===================================================================
// SEDAN SUBFRAME, DOUBLE WISHBONE & 5-LINK SUSPENSION 3D GEOMETRY
// ===================================================================
// Precision 3D mechanical components mirroring modern executive sedan chassis:
// - Front perimeter aluminum subframe cradle with rack-and-pinion steering
// - Double wishbone front suspension (upper A-arm, split lower control arms)
// - Rear 5-link suspension carrier with differential mounting cage
// - Vented slotted brake rotors with 6-piston / 4-piston calipers & center hubs
// ===================================================================

import * as THREE from "three";
import type { ExteriorEngineeringConfig } from "../../sim/types/exterior";
import { getSedanChassisMaterials } from "../materials/sedanMetallurgyShaders";

export function generateSedanSubframeSuspension3DGeometry(
  type: "front" | "rear",
  config?: Partial<ExteriorEngineeringConfig>
): THREE.Group {
  const group = new THREE.Group();
  group.name = type === "front" ? "Sedan_Front_Subframe_Assembly" : "Sedan_Rear_Subframe_Assembly";

  const materials = getSedanChassisMaterials();
  const track = ((type === "front" ? config?.trackWidthFront : config?.trackWidthRear) || 1620) / 1000;
  const halfTrack = track / 2;

  if (type === "front") {
    // ===============================================================
    // 1. FRONT SUBFRAME PERIMETER CRADLE (DIE-CAST ALUMINUM)
    // ===============================================================
    const cradleGroup = new THREE.Group();
    cradleGroup.name = "Front_Subframe_Cradle";

    // Transverse Main Crossmember
    const crossmemberGeo = new THREE.BoxGeometry(0.32, 0.11, halfTrack * 1.25);
    const crossmember = new THREE.Mesh(crossmemberGeo, materials.machinedAlloy);
    crossmember.position.set(0, 0, 0);
    crossmember.castShadow = true;
    cradleGroup.add(crossmember);

    // Forward Longitudinal Arms (Connecting to Front Crash Rail hardpoints)
    const armGeo = new THREE.BoxGeometry(0.55, 0.08, 0.09);
    
    const leftArm = new THREE.Mesh(armGeo, materials.machinedAlloy);
    leftArm.position.set(0.24, 0.04, halfTrack * 0.52);
    cradleGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, materials.machinedAlloy);
    rightArm.position.set(0.24, 0.04, -halfTrack * 0.52);
    cradleGroup.add(rightArm);

    // Front Subframe Tie Bar (Lower Radiator / Splash Shield Mount)
    const tieBarGeo = new THREE.BoxGeometry(0.06, 0.04, halfTrack * 1.18);
    const tieBar = new THREE.Mesh(tieBarGeo, materials.highStrengthSteel);
    tieBar.position.set(0.51, 0.04, 0);
    cradleGroup.add(tieBar);

    group.add(cradleGroup);

    // ===============================================================
    // 2. RACK-AND-PINION STEERING GEAR & TIE RODS
    // ===============================================================
    const steeringGroup = new THREE.Group();
    steeringGroup.name = "Front_Steering_Rack";

    // Steering Gearbox Housing
    const rackHousingGeo = new THREE.CylinderGeometry(0.04, 0.04, halfTrack * 0.85, 16);
    const rackHousing = new THREE.Mesh(rackHousingGeo, materials.castIronEngine);
    rackHousing.rotation.x = Math.PI / 2;
    rackHousing.position.set(0.08, 0.02, 0);
    steeringGroup.add(rackHousing);

    // Corrugated Rubber Steering Boots (LH & RH)
    const bootGeo = new THREE.CylinderGeometry(0.038, 0.042, 0.14, 12);
    
    const leftBoot = new THREE.Mesh(bootGeo, materials.rubberMatte);
    leftBoot.rotation.x = Math.PI / 2;
    leftBoot.position.set(0.08, 0.02, halfTrack * 0.48);
    steeringGroup.add(leftBoot);

    const rightBoot = new THREE.Mesh(bootGeo, materials.rubberMatte);
    rightBoot.rotation.x = Math.PI / 2;
    rightBoot.position.set(0.08, 0.02, -halfTrack * 0.48);
    steeringGroup.add(rightBoot);

    // Tie Rods with Ball Joint Ends
    const tieRodGeo = new THREE.CylinderGeometry(0.012, 0.012, halfTrack * 0.35, 12);
    
    const leftTieRod = new THREE.Mesh(tieRodGeo, materials.machinedAlloy);
    leftTieRod.rotation.x = Math.PI / 2;
    leftTieRod.position.set(0.08, 0.02, halfTrack * 0.72);
    steeringGroup.add(leftTieRod);

    const rightTieRod = new THREE.Mesh(tieRodGeo, materials.machinedAlloy);
    rightTieRod.rotation.x = Math.PI / 2;
    rightTieRod.position.set(0.08, 0.02, -halfTrack * 0.72);
    steeringGroup.add(rightTieRod);

    group.add(steeringGroup);

    // ===============================================================
    // 3. FRONT DOUBLE WISHBONE SUSPENSION KINEMATICS (LH & RH)
    // ===============================================================
    const suspensionGroup = new THREE.Group();
    suspensionGroup.name = "Front_Double_Wishbone_Suspension";

    // Upper Wishbone A-Arms (Forged Aluminum)
    const upperWishboneShape = new THREE.Shape();
    upperWishboneShape.moveTo(-0.12, 0);
    upperWishboneShape.lineTo(0.12, 0);
    upperWishboneShape.lineTo(0, 0.28);
    upperWishboneShape.closePath();

    const wishboneExtrudeSettings = { steps: 1, depth: 0.025, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008 };
    const upperArmGeo = new THREE.ExtrudeGeometry(upperWishboneShape, wishboneExtrudeSettings);

    const leftUpperArm = new THREE.Mesh(upperArmGeo, materials.machinedAlloy);
    leftUpperArm.rotation.x = -Math.PI / 2;
    leftUpperArm.position.set(0, 0.28, halfTrack * 0.58);
    suspensionGroup.add(leftUpperArm);

    const rightUpperArm = new THREE.Mesh(upperArmGeo, materials.machinedAlloy);
    rightUpperArm.rotation.x = Math.PI / 2;
    rightUpperArm.position.set(0, 0.28, -halfTrack * 0.58);
    suspensionGroup.add(rightUpperArm);

    // Lower Split Control Arms (Front Tension Link & Rear Lateral Link)
    const lowerLinkGeo = new THREE.CylinderGeometry(0.018, 0.022, halfTrack * 0.38, 16);

    const leftLowerLink1 = new THREE.Mesh(lowerLinkGeo, materials.machinedAlloy);
    leftLowerLink1.rotation.x = 1.35;
    leftLowerLink1.position.set(0.14, -0.05, halfTrack * 0.74);
    suspensionGroup.add(leftLowerLink1);

    const leftLowerLink2 = new THREE.Mesh(lowerLinkGeo, materials.machinedAlloy);
    leftLowerLink2.rotation.x = 1.65;
    leftLowerLink2.position.set(-0.14, -0.05, halfTrack * 0.74);
    suspensionGroup.add(leftLowerLink2);

    const rightLowerLink1 = new THREE.Mesh(lowerLinkGeo, materials.machinedAlloy);
    rightLowerLink1.rotation.x = -1.35;
    rightLowerLink1.position.set(0.14, -0.05, -halfTrack * 0.74);
    suspensionGroup.add(rightLowerLink1);

    const rightLowerLink2 = new THREE.Mesh(lowerLinkGeo, materials.machinedAlloy);
    rightLowerLink2.rotation.x = -1.65;
    rightLowerLink2.position.set(-0.14, -0.05, -halfTrack * 0.74);
    suspensionGroup.add(rightLowerLink2);

    // Steering Knuckle Uprights & Wheel Hub Spindles
    const uprightGeo = new THREE.BoxGeometry(0.08, 0.38, 0.06);
    
    const leftUpright = new THREE.Mesh(uprightGeo, materials.machinedAlloy);
    leftUpright.position.set(0, 0.12, halfTrack * 0.92);
    suspensionGroup.add(leftUpright);

    const rightUpright = new THREE.Mesh(uprightGeo, materials.machinedAlloy);
    rightUpright.position.set(0, 0.12, -halfTrack * 0.92);
    suspensionGroup.add(rightUpright);

    // Coilover Damper Struts & Progressive Springs
    const damperBodyGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.42, 16);
    const coilSpringGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.28, 16, 8, true);

    const leftDamper = new THREE.Mesh(damperBodyGeo, materials.machinedAlloy);
    leftDamper.position.set(0, 0.22, halfTrack * 0.76);
    leftDamper.rotation.z = -0.12;
    suspensionGroup.add(leftDamper);

    const leftSpring = new THREE.Mesh(coilSpringGeo, materials.highStrengthSteel);
    leftSpring.position.set(0, 0.22, halfTrack * 0.76);
    leftSpring.rotation.z = -0.12;
    suspensionGroup.add(leftSpring);

    const rightDamper = new THREE.Mesh(damperBodyGeo, materials.machinedAlloy);
    rightDamper.position.set(0, 0.22, -halfTrack * 0.76);
    rightDamper.rotation.z = 0.12;
    suspensionGroup.add(rightDamper);

    const rightSpring = new THREE.Mesh(coilSpringGeo, materials.highStrengthSteel);
    rightSpring.position.set(0, 0.22, -halfTrack * 0.76);
    rightSpring.rotation.z = 0.12;
    suspensionGroup.add(rightSpring);

    group.add(suspensionGroup);

    // ===============================================================
    // 4. FRONT VENTILATED BRAKE ROTORS & MONOBLOC CALIPERS
    // ===============================================================
    const brakesGroup = new THREE.Group();
    brakesGroup.name = "Front_Brakes_Assemblies";

    // 380mm Vented Slotted Rotors
    const rotorGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.034, 32);
    
    const leftRotor = new THREE.Mesh(rotorGeo, materials.brakeRotorSteel);
    leftRotor.rotation.x = Math.PI / 2;
    leftRotor.position.set(0, 0.12, halfTrack * 0.98);
    leftRotor.castShadow = true;
    brakesGroup.add(leftRotor);

    const rightRotor = new THREE.Mesh(rotorGeo, materials.brakeRotorSteel);
    rightRotor.rotation.x = Math.PI / 2;
    rightRotor.position.set(0, 0.12, -halfTrack * 0.98);
    rightRotor.castShadow = true;
    brakesGroup.add(rightRotor);

    // Center Bell Aluminum Hats & 5-Lug Hub Studs
    const hatGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.042, 24);
    
    const leftHat = new THREE.Mesh(hatGeo, materials.machinedAlloy);
    leftHat.rotation.x = Math.PI / 2;
    leftHat.position.set(0, 0.12, halfTrack * 0.99);
    brakesGroup.add(leftHat);

    const rightHat = new THREE.Mesh(hatGeo, materials.machinedAlloy);
    rightHat.rotation.x = Math.PI / 2;
    rightHat.position.set(0, 0.12, -halfTrack * 0.99);
    brakesGroup.add(rightHat);

    // 6-Piston Monobloc Front Calipers
    const caliperGeo = new THREE.BoxGeometry(0.11, 0.24, 0.095);
    
    const leftCaliper = new THREE.Mesh(caliperGeo, materials.caliperCoat);
    leftCaliper.position.set(0.12, 0.16, halfTrack * 0.98);
    leftCaliper.castShadow = true;
    brakesGroup.add(leftCaliper);

    const rightCaliper = new THREE.Mesh(caliperGeo, materials.caliperCoat);
    rightCaliper.position.set(0.12, 0.16, -halfTrack * 0.98);
    rightCaliper.castShadow = true;
    brakesGroup.add(rightCaliper);

    group.add(brakesGroup);

  } else {
    // ===============================================================
    // 5. REAR MULTI-LINK SUBFRAME CARRIER & DIFFERENTIAL CAGE
    // ===============================================================
    const rearCarrierGroup = new THREE.Group();
    rearCarrierGroup.name = "Rear_Subframe_Carrier";

    // Tubular Steel Perimeter Cage
    const rearCrossGeo = new THREE.BoxGeometry(0.48, 0.12, halfTrack * 1.15);
    const rearCross = new THREE.Mesh(rearCrossGeo, materials.highStrengthSteel);
    rearCross.position.set(0, 0.02, 0);
    rearCross.castShadow = true;
    rearCarrierGroup.add(rearCross);

    // Rear Differential Carrier Loop
    const diffLoopGeo = new THREE.TorusGeometry(0.18, 0.035, 12, 24);
    const diffLoop = new THREE.Mesh(diffLoopGeo, materials.machinedAlloy);
    diffLoop.position.set(0, 0.02, 0);
    rearCarrierGroup.add(diffLoop);

    group.add(rearCarrierGroup);

    // ===============================================================
    // 6. REAR 5-LINK SUSPENSION (UPPER CAMBER, TOE, TRAILING ARMS)
    // ===============================================================
    const rearSuspGroup = new THREE.Group();
    rearSuspGroup.name = "Rear_5Link_Suspension";

    for (let side = -1; side <= 1; side += 2) {
      const zOffset = side * halfTrack * 0.72;

      // 5 Links per side
      for (let i = 0; i < 5; i++) {
        const linkGeo = new THREE.CylinderGeometry(0.014, 0.014, halfTrack * 0.28, 12);
        const linkMesh = new THREE.Mesh(linkGeo, materials.machinedAlloy);
        linkMesh.position.set((i - 2) * 0.07, -0.05 + i * 0.04, zOffset);
        linkMesh.rotation.x = (Math.PI / 2) * side;
        linkMesh.rotation.z = (i - 2) * 0.12;
        rearSuspGroup.add(linkMesh);
      }

      // Rear Knuckle Upright
      const rearUprightGeo = new THREE.BoxGeometry(0.08, 0.34, 0.06);
      const rearUpright = new THREE.Mesh(rearUprightGeo, materials.machinedAlloy);
      rearUpright.position.set(0, 0.10, side * halfTrack * 0.92);
      rearSuspGroup.add(rearUpright);

      // Rear Damper & Separate Coil Spring
      const rearDamperGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.38, 16);
      const rearDamper = new THREE.Mesh(rearDamperGeo, materials.machinedAlloy);
      rearDamper.position.set(0.08, 0.20, side * halfTrack * 0.78);
      rearSuspGroup.add(rearDamper);

      const rearSpringGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.24, 16, 6, true);
      const rearSpring = new THREE.Mesh(rearSpringGeo, materials.highStrengthSteel);
      rearSpring.position.set(-0.08, 0.15, side * halfTrack * 0.78);
      rearSuspGroup.add(rearSpring);

      // 360mm Rear Brake Rotor
      const rearRotorGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.028, 32);
      const rearRotor = new THREE.Mesh(rearRotorGeo, materials.brakeRotorSteel);
      rearRotor.rotation.x = Math.PI / 2;
      rearRotor.position.set(0, 0.10, side * halfTrack * 0.98);
      rearRotor.castShadow = true;
      rearSuspGroup.add(rearRotor);

      // 4-Piston Rear Brake Caliper
      const rearCaliperGeo = new THREE.BoxGeometry(0.09, 0.18, 0.08);
      const rearCaliper = new THREE.Mesh(rearCaliperGeo, materials.caliperCoat);
      rearCaliper.position.set(-0.09, 0.14, side * halfTrack * 0.98);
      rearCaliper.castShadow = true;
      rearSuspGroup.add(rearCaliper);
    }

    group.add(rearSuspGroup);
  }

  return group;
}
