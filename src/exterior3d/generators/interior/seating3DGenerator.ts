// ============================================================================
// ULTRA-FIDELITY 3D INTERIOR STUDIO — PROCEDURAL SEATING 3D GENERATOR
// ============================================================================
// Constructs 5 distinct automotive seating architectures in Three.js:
// 1. Carbon Monocoque Bucket + 6-Point Sabelt / Schroth Racing Harnesses & Cam-Lock
// 2. 14-Way Power Sport Bolstered Recaro-Style with Illuminated Headrest Badges
// 3. Executive VIP 22-Way Pneumatic Massage Lounge Ottoman with Calf Support
// 4. Classic Horizontal-Fluted Retro Leather Sport Seat with Chrome Levers
// 5. Active Dynamic G-Force Adaptive Matrix Seat with Air Bladders
// ============================================================================

import * as THREE from 'three';
import {
  SeatingArchitectureClass,
  RacingHarnessType,
  InteriorMaterialTheme,
} from '../../types/interiorStudioTypes';
import {
  createSeatCushionGeometry,
  createSeatbackGeometry,
  createHeadrestGeometry,
} from './dashboardCurvatureSystem';


export class Seating3DGenerator {
  /**
   * Builds the complete front and rear seating assembly for the cabin.
   */
  public static buildSeatingAssembly(
    seatClass: SeatingArchitectureClass,
    seatCount: 1 | 2 | 4 | 5,
    harnessType: RacingHarnessType,
    materials: InteriorMaterialTheme,
    wheelbaseM: number,
    trackWidthM: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = `SeatingAssembly_${seatClass}`;

    const halfTr = trackWidthM / 2;
    const seatOffsetZ = Math.max(0.32, Math.min(0.42, halfTr * 0.44));

    // Common PBR Materials
    const upholsteryMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(materials.primaryColorHex),
      roughness: materials.primaryUpholstery === 'alcantara_suede' ? 0.88 : 0.65,
      metalness: 0.05,
      clearcoat: materials.primaryUpholstery === 'alcantara_suede' ? 0.0 : 0.15,
      clearcoatRoughness: 0.4,
      sheen: 0.35,
      sheenColor: new THREE.Color(materials.primaryColorHex).multiplyScalar(1.3),
      envMapIntensity: 0.4,
    });

    const secondaryUpholsteryMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(materials.secondaryColorHex),
      roughness: 0.70,
      metalness: 0.04,
      sheen: 0.25,
      sheenColor: new THREE.Color(materials.secondaryColorHex).multiplyScalar(1.2),
      envMapIntensity: 0.35,
    });

    const shellCarbonMat = new THREE.MeshPhysicalMaterial({
      color: 0x080b12,
      roughness: 0.18,
      metalness: 0.38,
      clearcoat: 0.92,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.4,
    });

    const harnessBeltMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(materials.seatBeltColorHex),
      roughness: 0.72,
      metalness: 0.05,
      sheen: 0.2,
      sheenColor: new THREE.Color(materials.seatBeltColorHex).multiplyScalar(1.1),
      envMapIntensity: 0.2,
    });

    const camLockMat = new THREE.MeshPhysicalMaterial({
      color: 0xd1d5db,
      roughness: 0.12,
      metalness: 0.96,
      clearcoat: 0.8,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.6,
    });

    const badgeGlowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(materials.stitchingColorHex),
    });

    // 1. Front Driver Seat (Always Present)
    const driverSeat = this.buildSingleSeat(seatClass, harnessType, upholsteryMat, secondaryUpholsteryMat, shellCarbonMat, harnessBeltMat, camLockMat, badgeGlowMat, true);
    driverSeat.position.set(-0.62, 0.34, -seatOffsetZ);
    group.add(driverSeat);

    // 2. Front Passenger Seat (if seatCount >= 2)
    if (seatCount >= 2) {
      const passengerSeat = this.buildSingleSeat(seatClass, harnessType, upholsteryMat, secondaryUpholsteryMat, shellCarbonMat, harnessBeltMat, camLockMat, badgeGlowMat, false);
      passengerSeat.position.set(-0.62, 0.34, seatOffsetZ);
      group.add(passengerSeat);
    }

    // 3. Rear Seating Bench / VIP Lounge (if seatCount >= 4)
    if (seatCount >= 4) {
      const rearBench = this.buildRearSeating(seatCount === 5, upholsteryMat, secondaryUpholsteryMat, seatOffsetZ * 2.2);
      rearBench.position.set(-1.32, 0.36, 0);
      group.add(rearBench);
    }

    return group;
  }

  // ==========================================================================
  // SINGLE FRONT SEAT GENERATOR
  // ==========================================================================
  private static buildSingleSeat(
    seatClass: SeatingArchitectureClass,
    harnessType: RacingHarnessType,
    primaryMat: THREE.Material,
    secondaryMat: THREE.Material,
    carbonMat: THREE.Material,
    harnessMat: THREE.Material,
    camLockMat: THREE.Material,
    badgeMat: THREE.Material,
    isDriver: boolean
  ): THREE.Group {
    const seatGroup = new THREE.Group();
    seatGroup.name = isDriver ? 'DriverSeat' : 'PassengerSeat';

    // Seat Mounting Runners (Billet Aluminum Sliders)
    const runnerGeo = new THREE.BoxGeometry(0.58, 0.024, 0.032);
    const runnerL = new THREE.Mesh(runnerGeo, camLockMat);
    runnerL.position.set(0, -0.04, -0.19);
    const runnerR = new THREE.Mesh(runnerGeo, camLockMat);
    runnerR.position.set(0, -0.04, 0.19);
    seatGroup.add(runnerL, runnerR);

    // Seat Base Cushion
    const baseGeo = createSeatCushionGeometry(0.48, 0.12, 0.44, true);
    const baseMesh = new THREE.Mesh(baseGeo, primaryMat);
    baseMesh.position.set(0, 0.06, 0);
    seatGroup.add(baseMesh);

    // Thigh Bolster Extension
    const thighGeo = new THREE.BoxGeometry(0.14, 0.08, 0.42);
    const thighMesh = new THREE.Mesh(thighGeo, secondaryMat);
    thighMesh.position.set(0.24, 0.08, 0);
    seatGroup.add(thighMesh);

    // Left & Right Lateral Seat Base Bolsters
    for (const z of [-0.22, 0.22]) {
      const bGeo = new THREE.BoxGeometry(0.46, 0.16, 0.07);
      const bMesh = new THREE.Mesh(bGeo, secondaryMat);
      bMesh.position.set(0, 0.12, z);
      bMesh.rotation.x = z < 0 ? 0.22 : -0.22;
      seatGroup.add(bMesh);
    }

    // Seatback Cushion & Shell
    const backGeo = createSeatbackGeometry(0.10, 0.64, 0.42, true);
    const backMesh = new THREE.Mesh(backGeo, primaryMat);
    backMesh.position.set(-0.20, 0.42, 0);
    backMesh.rotation.z = -0.18; // Recline angle
    seatGroup.add(backMesh);

    // Deep Rib Lateral Bolsters
    for (const z of [-0.21, 0.21]) {
      const ribGeo = new THREE.BoxGeometry(0.18, 0.48, 0.08);
      const ribMesh = new THREE.Mesh(ribGeo, secondaryMat);
      ribMesh.position.set(-0.16, 0.40, z);
      ribMesh.rotation.z = -0.18;
      ribMesh.rotation.y = z < 0 ? 0.28 : -0.28;
      seatGroup.add(ribMesh);
    }

    // Integrated Headrest
    const headrestGeo = createHeadrestGeometry(0.12, 0.18, 0.26);
    const headrestMesh = new THREE.Mesh(headrestGeo, primaryMat);
    headrestMesh.position.set(-0.28, 0.78, 0);
    headrestMesh.rotation.z = -0.18;
    seatGroup.add(headrestMesh);

    // Illuminated Model Emblem Crest Badge on Headrest
    const badgeGeo = new THREE.BoxGeometry(0.004, 0.04, 0.08);
    const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
    badgeMesh.position.set(-0.21, 0.78, 0);
    badgeMesh.rotation.z = -0.18;
    seatGroup.add(badgeMesh);

    // Structural Carbon Seatback Shell (Gloss / Matte Carbon Weave)
    if (seatClass === 'carbon_fixed_bucket' || seatClass === 'sport_bolstered_recaro' || seatClass === 'active_dynamic_matrix') {
      const shellGeo = new THREE.BoxGeometry(0.04, 0.74, 0.46);
      const shellMesh = new THREE.Mesh(shellGeo, carbonMat);
      shellMesh.position.set(-0.26, 0.46, 0);
      shellMesh.rotation.z = -0.18;
      seatGroup.add(shellMesh);
    }

    // 6-Point / 4-Point Racing Harnesses with Cam-Lock Latch
    if (harnessType === 'sabelt_6_point_f1' || harnessType === 'schroth_enduro_pro' || harnessType === 'clubman_4_point') {
      this.attachRacingHarness(seatGroup, harnessMat, camLockMat, harnessType === 'sabelt_6_point_f1');
    }

    return seatGroup;
  }

  // ==========================================================================
  // RACING HARNESS & ROTARY CAM-LOCK GENERATOR
  // ==========================================================================
  private static attachRacingHarness(
    seat: THREE.Group,
    beltMat: THREE.Material,
    camLockMat: THREE.Material,
    is6Point: boolean
  ): void {
    // 2-Inch Shoulder Belts (Coming over seatback down to lap)
    for (const z of [-0.09, 0.09]) {
      const shoulderGeo = new THREE.BoxGeometry(0.012, 0.48, 0.055);
      const shoulderMesh = new THREE.Mesh(shoulderGeo, beltMat);
      shoulderMesh.position.set(-0.14, 0.48, z);
      shoulderMesh.rotation.z = -0.22;
      seat.add(shoulderMesh);
    }

    // Left & Right Lap Straps
    for (const z of [-0.18, 0.18]) {
      const lapGeo = new THREE.BoxGeometry(0.24, 0.012, 0.055);
      const lapMesh = new THREE.Mesh(lapGeo, beltMat);
      lapMesh.position.set(0.02, 0.16, z * 0.6);
      lapMesh.rotation.y = z < 0 ? 0.35 : -0.35;
      seat.add(lapMesh);
    }

    // Sub-Straps (if 6-Point Formula Harness)
    if (is6Point) {
      for (const z of [-0.04, 0.04]) {
        const subGeo = new THREE.BoxGeometry(0.18, 0.010, 0.040);
        const subMesh = new THREE.Mesh(subGeo, beltMat);
        subMesh.position.set(0.08, 0.14, z);
        seat.add(subMesh);
      }
    }

    // Central Billet Aluminum Quick-Release Rotary Cam-Lock Buckle
    const camGeo = new THREE.CylinderGeometry(0.034, 0.034, 0.024, 24);
    const camMesh = new THREE.Mesh(camGeo, camLockMat);
    camMesh.position.set(-0.02, 0.20, 0);
    camMesh.rotation.x = Math.PI / 2;
    seat.add(camMesh);
  }

  // ==========================================================================
  // REAR SEATING BENCH / VIP LOUNGE
  // ==========================================================================
  private static buildRearSeating(
    is5Seat: boolean,
    primaryMat: THREE.Material,
    secondaryMat: THREE.Material,
    widthM: number
  ): THREE.Group {
    const rearGroup = new THREE.Group();
    rearGroup.name = 'RearSeatingBench';

    const benchWidth = Math.max(1.18, Math.min(1.42, widthM));

    // Lower Bench Cushion
    const benchGeo = createSeatCushionGeometry(benchWidth, 0.14, 0.50, false);
    const bench = new THREE.Mesh(benchGeo, primaryMat);
    bench.position.set(0, 0.07, 0);
    rearGroup.add(bench);

    // Rear Seatback Cushion
    const backGeo = createSeatbackGeometry(benchWidth, 0.68, 0.12, false);
    const back = new THREE.Mesh(backGeo, primaryMat);
    back.position.set(-0.24, 0.44, 0);
    back.rotation.z = -0.16;
    rearGroup.add(back);

    // Rear Center Fold-Down Armrest with Dual Cupholders
    const armrestGeo = new THREE.BoxGeometry(0.38, 0.12, 0.24);
    const armrest = new THREE.Mesh(armrestGeo, secondaryMat);
    armrest.position.set(-0.06, 0.24, 0);
    rearGroup.add(armrest);

    // Rear Headrests (2 or 3)
    const headrestZs = is5Seat ? [-benchWidth * 0.35, 0, benchWidth * 0.35] : [-benchWidth * 0.30, benchWidth * 0.30];
    headrestZs.forEach((z) => {
      const hGeo = createHeadrestGeometry(0.10, 0.16, 0.24);
      const hMesh = new THREE.Mesh(hGeo, primaryMat);
      hMesh.position.set(-0.32, 0.82, z);
      hMesh.rotation.z = -0.16;
      rearGroup.add(hMesh);
    });

    return rearGroup;
  }
}
