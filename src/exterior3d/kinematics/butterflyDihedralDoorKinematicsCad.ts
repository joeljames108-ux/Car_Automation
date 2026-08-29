/**
 * ============================================================================
 * BUTTERFLY, GULLWING & DIHEDRAL SYNCHRO-HELIX DOOR KINEMATICS CAD ENGINE
 * ============================================================================
 * Generates 3D CAD door assemblies and computes multi-axis kinematic rotation matrices:
 *
 * 1. 90° Dihedral Synchro-Helix Actuation (Outward 45mm translation + 90° vertical rotation)
 * 2. Top-Hinged Gullwing Doors with Roof Centerline Pivot & Pneumatic Nitrogen Struts
 * 3. Forward-Canted Butterfly Le Mans Doors with Dual A-Pillar / Roof Hinges
 * 4. Frameless Double-Sealed Acoustic Window Drops (12mm indexing drop on open)
 * 5. Carbon-Fiber Door Sills, Integrated Side Mirrors & Latching Strikers
 * 6. Dynamic Real-Time Hinge Matrix Solver & Egress Clearance Verification
 * ============================================================================
 */

import * as THREE from "three";

export type DoorKinematicsType =
  | "DIHEDRAL_SYNCHRO_HELIX_90"
  | "BUTTERFLY_LE_MANS_FORWARD_UP"
  | "GULLWING_ROOF_HINGED"
  | "CONVENTIONAL_FORWARD_SWING";

export interface DoorAssemblySpec {
  doorType: DoorKinematicsType;
  openProgress: number; // 0.0 (Fully Closed & Latched) to 1.0 (Fully Opened)
  doorLengthMm: number; // e.g. 1250mm
  doorHeightMm: number; // e.g. 850mm
  hasCarbonAeroMirror: boolean;
  hasFramelessGlass: boolean;
  hasPneumaticStruts: boolean;
}

export interface DoorKinematicTransform {
  translationM: THREE.Vector3;
  rotationEulerRad: THREE.Euler;
  strutExtensionLengthM: number;
  windowDropOffsetM: number;
  egressWidthClearanceM: number;
}

export class ButterflyDihedralDoorKinematicsCad {
  /**
   * Generates Complete Left & Right 3D Door Assembly Group.
   */
  public static generateDoorAssembly(
    spec: DoorAssemblySpec,
    materials?: {
      bodyOuterPaintMat?: THREE.Material;
      carbonInnerStructureMat?: THREE.Material;
      glassWindowMat?: THREE.Material;
      titaniumHingeMat?: THREE.Material;
    }
  ): THREE.Group {
    const doorsMasterGroup = new THREE.Group();
    doorsMasterGroup.name = "DOOR_KINEMATICS_ASSEMBLY";

    const defaultPaintMat =
      materials?.bodyOuterPaintMat ||
      new THREE.MeshPhysicalMaterial({
        color: 0x00e5ff,
        roughness: 0.15,
        metalness: 0.85,
        clearcoat: 1.0,
      });

    const defaultCarbonMat =
      materials?.carbonInnerStructureMat ||
      new THREE.MeshPhysicalMaterial({
        color: 0x111317,
        roughness: 0.28,
        metalness: 0.9,
      });

    const defaultGlassMat =
      materials?.glassWindowMat ||
      new THREE.MeshPhysicalMaterial({
        color: 0x05070a,
        transmission: 0.9,
        transparent: true,
        roughness: 0.05,
        ior: 1.52,
      });

    const defaultHingeMat =
      materials?.titaniumHingeMat ||
      new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.2,
        metalness: 0.98,
      });

    // ── Build Left & Right Doors with Dynamic Kinematic Transforms ──
    const leftDoor = this.buildSingleDoor(
      spec,
      false,
      defaultPaintMat,
      defaultCarbonMat,
      defaultGlassMat,
      defaultHingeMat
    );
    const rightDoor = this.buildSingleDoor(
      spec,
      true,
      defaultPaintMat,
      defaultCarbonMat,
      defaultGlassMat,
      defaultHingeMat
    );

    doorsMasterGroup.add(leftDoor);
    doorsMasterGroup.add(rightDoor);

    return doorsMasterGroup;
  }

  /**
   * Builds a Single 3D Door Panel and Applies Multi-Axis Kinematic Transforms.
   */
  private static buildSingleDoor(
    spec: DoorAssemblySpec,
    isRightSide: boolean,
    paintMat: THREE.Material,
    carbonMat: THREE.Material,
    glassMat: THREE.Material,
    hingeMat: THREE.Material
  ): THREE.Group {
    const doorPivotGroup = new THREE.Group();
    const sideMult = isRightSide ? 1 : -1;
    doorPivotGroup.name = `DOOR_${isRightSide ? "RIGHT" : "LEFT"}_PIVOT_GROUP`;

    const doorLengthM = spec.doorLengthMm / 1000;
    const doorHeightM = spec.doorHeightMm / 1000;

    // Hinge Origin Pivot (A-Pillar base / Roof edge)
    const hingePivotX = 0.88 * sideMult;
    const hingePivotY = spec.doorType === "GULLWING_ROOF_HINGED" ? 1.05 : 0.52;
    const hingePivotZ = spec.doorType === "GULLWING_ROOF_HINGED" ? -0.1 : -0.65;

    doorPivotGroup.position.set(hingePivotX, hingePivotY, hingePivotZ);

    // ── Inner Door Hierarchy (Relative to Pivot) ──
    const doorContent = new THREE.Group();
    doorContent.name = "DOOR_CONTENT_MESHES";

    // 1. Outer Sculpted Carbon Door Skin
    const doorGeo = new THREE.BoxGeometry(0.045, doorHeightM * 0.65, doorLengthM);
    const doorMesh = new THREE.Mesh(doorGeo, paintMat);
    doorMesh.position.set(0.02 * sideMult, -doorHeightM * 0.15, doorLengthM * 0.45);
    doorMesh.castShadow = true;
    doorMesh.receiveShadow = true;
    doorContent.add(doorMesh);

    // 2. Inner Carbon Monocoque Core & Armrest Pocket
    const innerGeo = new THREE.BoxGeometry(0.065, doorHeightM * 0.58, doorLengthM * 0.92);
    const innerMesh = new THREE.Mesh(innerGeo, carbonMat);
    innerMesh.position.set(-0.02 * sideMult, -doorHeightM * 0.15, doorLengthM * 0.45);
    innerMesh.castShadow = true;
    doorContent.add(innerMesh);

    // 3. Frameless Polycarbonate/Glass Side Window
    if (spec.hasFramelessGlass) {
      const windowTransform = this.computeKinematicTransform(spec, isRightSide);
      const glassGeo = new THREE.BoxGeometry(0.008, doorHeightM * 0.42, doorLengthM * 0.88);
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.position.set(
        0,
        doorHeightM * 0.32 - windowTransform.windowDropOffsetM,
        doorLengthM * 0.45
      );
      glassMesh.castShadow = true;
      doorContent.add(glassMesh);
    }

    // 4. Aerodynamic Carbon Wing Mirror
    if (spec.hasCarbonAeroMirror) {
      const mirrorGeo = new THREE.BoxGeometry(0.18, 0.08, 0.09);
      const mirrorMesh = new THREE.Mesh(mirrorGeo, carbonMat);
      mirrorMesh.position.set(0.12 * sideMult, doorHeightM * 0.15, doorLengthM * 0.12);
      mirrorMesh.castShadow = true;
      doorContent.add(mirrorMesh);

      // Reflective Glass Lens
      const lensGeo = new THREE.PlaneGeometry(0.16, 0.07);
      const mirrorLensMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.98, roughness: 0.05 });
      const lensMesh = new THREE.Mesh(lensGeo, mirrorLensMat);
      lensMesh.position.set(0.12 * sideMult, doorHeightM * 0.15, doorLengthM * 0.12 + 0.046);
      doorContent.add(lensMesh);
    }

    // 5. Pneumatic Nitrogen Strut Actuator
    if (spec.hasPneumaticStruts) {
      const strutGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.32, 12);
      const strutMesh = new THREE.Mesh(strutGeo, hingeMat);
      strutMesh.position.set(-0.04 * sideMult, -0.05, 0.08);
      strutMesh.rotation.x = Math.PI / 4;
      doorContent.add(strutMesh);
    }

    // ── Apply Computed Kinematic Transform to Door Group ──
    const transform = this.computeKinematicTransform(spec, isRightSide);
    doorContent.position.copy(transform.translationM);
    doorContent.rotation.copy(transform.rotationEulerRad);

    doorPivotGroup.add(doorContent);
    return doorPivotGroup;
  }

  /**
   * Computes Multi-Axis Kinematic Matrices Based on Actuation Type and Open Progress.
   */
  public static computeKinematicTransform(
    spec: DoorAssemblySpec,
    isRightSide: boolean
  ): DoorKinematicTransform {
    const t = Math.max(0, Math.min(1, spec.openProgress));
    const sideMult = isRightSide ? 1 : -1;

    let translation = new THREE.Vector3(0, 0, 0);
    let rotationEuler = new THREE.Euler(0, 0, 0, "XYZ");
    let windowDrop = 0;
    let egressWidth = 0.55;

    // Window indexes down by 12mm as door starts unlatching
    if (t > 0.02) {
      windowDrop = Math.min(0.012, t * 0.04);
    }

    switch (spec.doorType) {
      case "DIHEDRAL_SYNCHRO_HELIX_90": {
        // Step 1: Push out laterally 50mm, Step 2: Rotate 90° forward & upward
        const lateralPopOut = Math.min(0.055, t * 0.12) * sideMult;
        translation.set(lateralPopOut, t * 0.08, -t * 0.04);

        // 90° Pitch up, 18° outward yaw
        const rollRad = THREE.MathUtils.degToRad(-t * 90 * sideMult);
        const yawRad = THREE.MathUtils.degToRad(t * 18 * sideMult);
        rotationEuler = new THREE.Euler(0, yawRad, rollRad, "XYZ");
        egressWidth = 0.55 + t * 0.65;
        break;
      }

      case "BUTTERFLY_LE_MANS_FORWARD_UP": {
        // Forward canted A-pillar rotation (65° pitch up, 35° yaw outward)
        const pitchRad = THREE.MathUtils.degToRad(t * 62);
        const yawRad = THREE.MathUtils.degToRad(-t * 38 * sideMult);
        const rollRad = THREE.MathUtils.degToRad(t * 22 * sideMult);

        translation.set(t * 0.06 * sideMult, t * 0.12, -t * 0.08);
        rotationEuler = new THREE.Euler(pitchRad, yawRad, rollRad, "YXZ");
        egressWidth = 0.55 + t * 0.78;
        break;
      }

      case "GULLWING_ROOF_HINGED": {
        // Top roof centerline upward rotation (75° pure roll up)
        const rollRad = THREE.MathUtils.degToRad(-t * 78 * sideMult);
        translation.set(0, t * 0.04, 0);
        rotationEuler = new THREE.Euler(0, 0, rollRad, "XYZ");
        egressWidth = 0.55 + t * 0.85;
        break;
      }

      case "CONVENTIONAL_FORWARD_SWING":
      default: {
        // Standard 65° outward yaw swing
        const yawRad = THREE.MathUtils.degToRad(t * 65 * sideMult);
        rotationEuler = new THREE.Euler(0, yawRad, 0, "XYZ");
        egressWidth = 0.55 + t * 0.60;
        break;
      }
    }

    const strutLength = 0.28 + t * 0.16; // Pneumatic strut extension from 280mm to 440mm

    return {
      translationM: translation,
      rotationEulerRad: rotationEuler,
      strutExtensionLengthM: strutLength,
      windowDropOffsetM: windowDrop,
      egressWidthClearanceM: egressWidth,
    };
  }
}
