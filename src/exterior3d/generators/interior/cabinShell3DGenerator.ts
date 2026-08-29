// ============================================================================
// ULTRA-FIDELITY 3D INTERIOR STUDIO — CABIN SHELL, ROOF & ROLL CAGE GENERATOR
// ============================================================================
// Constructs the structural cabin shell elements in Three.js:
// - Carpeted floor tub & dead pedal footrests
// - Floor-mounted CNC billet aluminum pedal box (Throttle, Brake, Clutch)
// - Frameless electrochromic digital rearview mirror & ADAS dual-camera pod
// - Fiber-optic Starlight constellation ceiling / Panoramic electrochromic glass roof
// - FIA-spec 4-point, 6-point, and full welded tubular roll cages
// ============================================================================

import * as THREE from 'three';
import {
  RollCageSpecification,
  InteriorMaterialTheme,
} from '../../types/interiorStudioTypes';

export class CabinShell3DGenerator {
  /**
   * Builds the complete cabin shell, headliner, pedal box, and roll cage.
   */
  public static buildCabinShell(
    materials: InteriorMaterialTheme,
    rollCage: RollCageSpecification,
    wheelbaseM: number,
    trackWidthM: number
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'CabinShellAssembly';

    const cabinLength = Math.max(1.85, Math.min(2.55, wheelbaseM * 0.82));
    const cabinWidth = Math.max(1.48, Math.min(1.72, trackWidthM * 1.04));
    const cabinHeight = 1.28;

    // Common PBR Materials
    const carpetMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(materials.carpetColorHex),
      roughness: 0.95,
      metalness: 0.02,
    });

    const headlinerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(materials.headlinerColorHex),
      roughness: 0.9,
      metalness: 0.05,
    });

    const pedalAluMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.22,
      metalness: 0.96,
      envMapIntensity: 1.5,
    });

    const mirrorGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a101d,
      roughness: 0.02,
      metalness: 0.95,
      clearcoat: 1.0,
      envMapIntensity: 2.0,
    });

    // 1. Carpeted Cabin Floor Tub
    const floorGeo = new THREE.BoxGeometry(cabinLength, 0.04, cabinWidth);
    const floorMesh = new THREE.Mesh(floorGeo, carpetMat);
    floorMesh.position.set(-cabinLength * 0.45, 0.02, 0);
    group.add(floorMesh);

    // 2. Floor-Mounted Billet Aluminum Racing Pedal Box
    const pedalBox = this.buildPedalBox(pedalAluMat);
    pedalBox.position.set(-0.18, 0.14, -0.34);
    group.add(pedalBox);

    // 3. Frameless Digital Rearview Mirror & Forward ADAS Camera Pod
    const mirror = this.buildRearviewMirror(mirrorGlassMat, pedalAluMat);
    mirror.position.set(-0.24, cabinHeight - 0.06, 0);
    group.add(mirror);

    // 4. Roof Headliner (Starlight Fiber-Optic / Panoramic Glass / Alcantara)
    const headliner = this.buildHeadliner(cabinLength, cabinWidth, cabinHeight, materials, headlinerMat);
    headliner.position.set(-cabinLength * 0.45, cabinHeight, 0);
    group.add(headliner);

    // 5. Tubular Roll Cage Safety Cell (if configured)
    if (rollCage && rollCage.type !== 'none') {
      const cageMesh = this.buildRollCage(rollCage, cabinLength, cabinWidth, cabinHeight);
      group.add(cageMesh);
    }

    return group;
  }

  // ==========================================================================
  // BILLET ALUMINUM RACING PEDAL BOX
  // ==========================================================================
  private static buildPedalBox(aluMat: THREE.Material): THREE.Group {
    const box = new THREE.Group();
    box.name = 'PedalBox';

    // Base Mounting Plate
    const basePlateGeo = new THREE.BoxGeometry(0.24, 0.012, 0.28);
    const basePlate = new THREE.Mesh(basePlateGeo, aluMat);
    box.add(basePlate);

    // Dead Pedal Footrest (Left side)
    const deadPedalGeo = new THREE.BoxGeometry(0.18, 0.018, 0.065);
    const deadPedal = new THREE.Mesh(deadPedalGeo, aluMat);
    deadPedal.position.set(0.04, 0.04, -0.10);
    deadPedal.rotation.z = -Math.PI / 4;
    box.add(deadPedal);

    // 3 Pedals: Clutch (-0.03), Brake (0.03), Throttle (0.09)
    const pedalOffsetsZ = [-0.03, 0.03, 0.09];
    pedalOffsetsZ.forEach((z, idx) => {
      const isThrottle = idx === 2;
      const armGeo = new THREE.BoxGeometry(0.014, 0.14, 0.018);
      const arm = new THREE.Mesh(armGeo, aluMat);
      arm.position.set(0.02, 0.08, z);
      arm.rotation.z = -Math.PI / 6;
      box.add(arm);

      // Knurled Pedal Pad
      const padW = isThrottle ? 0.045 : 0.055;
      const padH = isThrottle ? 0.11 : 0.07;
      const padGeo = new THREE.BoxGeometry(0.010, padH, padW);
      const pad = new THREE.Mesh(padGeo, aluMat);
      pad.position.set(0.06, 0.14, z);
      pad.rotation.z = -Math.PI / 6;
      box.add(pad);
    });

    return box;
  }

  // ==========================================================================
  // FRAMELESS DIGITAL REARVIEW MIRROR
  // ==========================================================================
  private static buildRearviewMirror(glassMat: THREE.Material, aluMat: THREE.Material): THREE.Group {
    const mirror = new THREE.Group();
    mirror.name = 'RearviewMirror';

    // Mounting Arm to Windshield Header
    const armGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.06, 12);
    const arm = new THREE.Mesh(armGeo, aluMat);
    arm.position.set(0.02, 0.03, 0);
    arm.rotation.z = -Math.PI / 4;
    mirror.add(arm);

    // Forward ADAS Camera Pod (Housing lane keeping & emergency braking lenses)
    const podGeo = new THREE.BoxGeometry(0.08, 0.04, 0.09);
    const pod = new THREE.Mesh(podGeo, new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5 }));
    pod.position.set(0.04, 0.04, 0);
    mirror.add(pod);

    // Frameless OLED Mirror Glass Face
    const mirrorGeo = new THREE.BoxGeometry(0.012, 0.065, 0.24);
    const mirrorMesh = new THREE.Mesh(mirrorGeo, glassMat);
    mirrorMesh.rotation.y = 0.08; // Angled slightly toward driver
    mirror.add(mirrorMesh);

    return mirror;
  }

  // ==========================================================================
  // ROOF HEADLINER & STARLIGHT CONSTELLATIONS
  // ==========================================================================
  private static buildHeadliner(
    lengthM: number,
    widthM: number,
    heightM: number,
    materials: InteriorMaterialTheme,
    headlinerMat: THREE.Material
  ): THREE.Group {
    const roof = new THREE.Group();
    roof.name = 'RoofHeadliner';

    // Main Roof Headliner Panel
    const roofGeo = new THREE.BoxGeometry(lengthM * 0.94, 0.02, widthM * 0.94);
    const roofMesh = new THREE.Mesh(roofGeo, headlinerMat);
    roof.add(roofMesh);

    // Panoramic Electrochromic Glass Panel (if selected)
    if (materials.headlinerMaterial === 'panoramic_electrochromic_glass') {
      const glassGeo = new THREE.BoxGeometry(lengthM * 0.65, 0.015, widthM * 0.72);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x050a14,
        roughness: 0.02,
        metalness: 0.95,
        transmission: 0.75,
        ior: 1.52,
        thickness: 0.02,
        clearcoat: 1.0,
      });
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.position.set(0, 0.005, 0);
      roof.add(glassMesh);
    }

    // Fiber-Optic "Starlight" Constellation Ceiling (if selected)
    if (materials.headlinerMaterial === 'starlight_fiber_optic') {
      const starCount = 64;
      const starGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(starCount * 3);

      for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * (lengthM * 0.85);
        positions[i * 3 + 1] = -0.012;
        positions[i * 3 + 2] = (Math.random() - 0.5) * (widthM * 0.85);
      }

      starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.012 });
      const stars = new THREE.Points(starGeo, starMat);
      roof.add(stars);
    }

    return roof;
  }

  // ==========================================================================
  // TUBULAR ROLL CAGE SAFETY CELL
  // ==========================================================================
  private static buildRollCage(
    spec: RollCageSpecification,
    lengthM: number,
    widthM: number,
    heightM: number
  ): THREE.Group {
    const cage = new THREE.Group();
    cage.name = `RollCage_${spec.type}`;

    const tubeRadius = (spec.tubeDiameterMm || 45) / 2000;
    const cageMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(spec.colorHex || '#94a3b8'),
      roughness: 0.32,
      metalness: 0.92,
      envMapIntensity: 1.4,
    });

    const halfW = (widthM * 0.88) / 2;
    const midX = -lengthM * 0.45;

    // 1. Main B-Pillar Main Roll Hoop (Inverted U-Shape)
    const hoopTopGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, widthM * 0.86, 16);
    const hoopTop = new THREE.Mesh(hoopTopGeo, cageMat);
    hoopTop.position.set(midX, heightM - 0.06, 0);
    hoopTop.rotation.x = Math.PI / 2;
    cage.add(hoopTop);

    for (const z of [-halfW, halfW]) {
      const legGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, heightM - 0.08, 16);
      const leg = new THREE.Mesh(legGeo, cageMat);
      leg.position.set(midX, (heightM - 0.08) / 2 + 0.02, z);
      cage.add(leg);
    }

    // 2. Rear Diagonal Stays & X-Brace (for 4-Point Half Cage and above)
    if (spec.type === 'rear_4_point_half_cage' || spec.type === 'full_6_point_bolt_in' || spec.type === 'fia_welded_monocell') {
      const rearX = midX - lengthM * 0.38;
      for (const z of [-halfW, halfW]) {
        const stayLength = Math.hypot(lengthM * 0.38, heightM - 0.08);
        const stayGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, stayLength, 16);
        const stay = new THREE.Mesh(stayGeo, cageMat);
        stay.position.set((midX + rearX) / 2, (heightM - 0.08) / 2, z);
        stay.rotation.z = Math.atan2(heightM - 0.08, lengthM * 0.38);
        cage.add(stay);
      }

      // Diagonal Cross-Brace
      const diagLength = Math.hypot(widthM * 0.86, heightM - 0.08);
      const diagGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, diagLength, 16);
      const diag1 = new THREE.Mesh(diagGeo, cageMat);
      diag1.position.set(midX, (heightM - 0.08) / 2, 0);
      diag1.rotation.x = Math.atan2(heightM - 0.08, widthM * 0.86);
      cage.add(diag1);
    }

    // 3. Front A-Pillar Down-Tubes & Door Intrusion Bars (for 6-Point & FIA Welded)
    if (spec.type === 'full_6_point_bolt_in' || spec.type === 'fia_welded_monocell') {
      const frontX = midX + lengthM * 0.38;

      // Front A-Pillar Legs
      for (const z of [-halfW, halfW]) {
        const fLegLength = Math.hypot(lengthM * 0.38, heightM - 0.08);
        const fLegGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, fLegLength, 16);
        const fLeg = new THREE.Mesh(fLegGeo, cageMat);
        fLeg.position.set((midX + frontX) / 2, (heightM - 0.08) / 2, z);
        fLeg.rotation.z = -Math.atan2(heightM - 0.08, lengthM * 0.38);
        cage.add(fLeg);

        // Side-Impact Door Intrusion Bar
        const doorBarGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, lengthM * 0.38, 16);
        const doorBar = new THREE.Mesh(doorBarGeo, cageMat);
        doorBar.position.set((midX + frontX) / 2, 0.28, z);
        doorBar.rotation.z = Math.PI / 2;
        cage.add(doorBar);
      }
    }

    return cage;
  }
}
