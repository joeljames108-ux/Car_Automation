// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — FORGED MOTORSPORT WHEEL ASSEMBLY 3D
// ============================================================================
// 100-Phase Master Automotive CAD Architecture — Phase 24: Center-Lock Wheels & 10-Piston Brakes
// - 5 Interchangeable Forged Rim Architectures: Turbofan Aero-Disc, 10-Spoke Monoblock,
//   Classic BBS Cross-Mesh, Twin 5-Spoke Split, and EV Aero Solid Disc
// - Staggered Competition Tires (Front 305/30ZR20, Rear 335/30ZR21) with 3D Tread Channels & Sipes
// - Cross-Drilled Carbon Ceramic Discs with 10 Floating Titanium Bobbins
// - 10-Piston Front & 6-Piston Rear Monobloc Calipers with Braided Stainless Steel Hydraulic Lines
// ============================================================================

import * as THREE from 'three';
import { MaterialGrade } from '../../sim/assemblyTypes';
import { AutomotivePBRMaterialSystem } from '../materials/automotivePBRMaterialSystem';

export type RimArchitectureStyle =
  | 'turbofan'
  | 'multi_spoke'
  | 'mesh_bbs'
  | 'split_5'
  | 'solid_disc';

export interface WheelAssemblyOptions {
  rimStyle?: RimArchitectureStyle;
  rimFinish?: 'silver' | 'gloss_black' | 'satin_bronze' | 'gold' | 'gunmetal' | 'chrome';
  caliperColorHex?: string;
  hasCenterLock?: boolean;
  brakesGlowing?: boolean;
  brakeGlowIntensity?: number;
}

export class ForgedWheelAssembly3D {
  public static buildWheelsAndBrakes(
    wheelbaseMm: number,
    trackWidthFrontMm: number,
    trackWidthRearMm: number,
    tireDiameterMm: number = 680,
    materialGrade: MaterialGrade = 'forged',
    options: WheelAssemblyOptions = {}
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'WheelsBrakes_Assembly';

    const wbM = wheelbaseMm / 1000;
    const halfTfM = (trackWidthFrontMm / 2) / 1000;
    const halfTrM = (trackWidthRearMm / 2) / 1000;
    const tireRadiusM = (tireDiameterMm / 2) / 1000; // ~0.34m
    const frontAxleX = 0.45;
    const rearAxleX = frontAxleX - wbM;

    const rimStyle = options.rimStyle || 'turbofan';
    const caliperColor = options.caliperColorHex ? parseInt(options.caliperColorHex.replace('#', '0x'), 16) : 0xd97706;

    // ── 1. Luxury PBR Materials ──
    const tireRubberMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a1d24,
      roughness: 0.78,
      metalness: 0.02,
      clearcoat: 0.2,
      clearcoatRoughness: 0.5,
      envMapIntensity: 0.18,
      sheen: 0.15,
      sheenColor: new THREE.Color(0x2a2a2a),
      sheenRoughness: 0.8,
    });

    const tireLetteringMat = new THREE.MeshBasicMaterial({
      color: 0xf8fafc, // White Michelin / Pirelli branding
      side: THREE.DoubleSide,
    });

    const treadGrooveMat = new THREE.MeshStandardMaterial({
      color: 0x060810,
      roughness: 0.92,
      metalness: 0.02,
      envMapIntensity: 0.08,
    });

    // Rim Metal Finish
    let rimMetalColor = 0xd8e0e8;
    let rimMetalness = 0.96;
    let rimRoughness = 0.16;

    if (options.rimFinish === 'satin_bronze') {
      rimMetalColor = 0x926644;
      rimRoughness = 0.28;
    } else if (options.rimFinish === 'gloss_black') {
      rimMetalColor = 0x11141a;
      rimRoughness = 0.06;
    } else if (options.rimFinish === 'gold') {
      rimMetalColor = 0xd4af37;
      rimRoughness = 0.14;
    } else if (options.rimFinish === 'gunmetal') {
      rimMetalColor = 0x475569;
      rimRoughness = 0.22;
    } else if (options.rimFinish === 'chrome') {
      rimMetalColor = 0xf1f5f9;
      rimRoughness = 0.02;
    }

    const rimFaceMat = new THREE.MeshPhysicalMaterial({
      color: rimMetalColor,
      metalness: rimMetalness,
      roughness: rimRoughness,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 1.0,
      envMapIntensity: 1.8,
      specularIntensity: 0.9,
    });

    const finVaneMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.18,
      clearcoat: 0.5,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.2,
    });

    const centerLockRedMat = new THREE.MeshPhysicalMaterial({
      color: 0xef4444, // Anodized Racing Red (Left)
      metalness: 0.92,
      roughness: 0.12,
      clearcoat: 0.9,
    });

    const centerLockBlueMat = new THREE.MeshPhysicalMaterial({
      color: 0xd97706, // Anodized Racing Blue (Right)
      metalness: 0.92,
      roughness: 0.12,
      clearcoat: 0.9,
    });

    const lugNutMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Titanium 5-lug wheel nuts
      metalness: 0.98,
      roughness: 0.1,
    });

    const lockPinMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.98,
      roughness: 0.1,
    });

    const isGlowing = options.brakesGlowing || false;
    const glowInt = options.brakeGlowIntensity ?? 0.85;

    const carbonCeramicRotorMat = new THREE.MeshPhysicalMaterial({
      color: isGlowing ? 0x22110c : 0x334155,
      metalness: 0.88,
      roughness: 0.22,
      clearcoat: 0.4,
      clearcoatRoughness: 0.15,
      emissive: isGlowing ? new THREE.Color(0xff3b00) : new THREE.Color(0x000000),
      emissiveIntensity: isGlowing ? glowInt * 2.8 : 0,
      normalMap: typeof document !== 'undefined' ? AutomotivePBRMaterialSystem.getBrakeRotorNormalTexture() : null,
    });

    const rotorBellMat = new THREE.MeshPhysicalMaterial({
      color: 0x475569,
      metalness: 0.94,
      roughness: 0.12,
      clearcoat: 0.7,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.3,
    });

    const titaniumBobbinMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.98,
      roughness: 0.12,
    });

    const brakeCaliperFrontMat = new THREE.MeshPhysicalMaterial({
      color: caliperColor,
      metalness: 0.85,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.4,
    });

    const brakeCaliperRearMat = new THREE.MeshPhysicalMaterial({
      color: caliperColor,
      metalness: 0.88,
      roughness: 0.15,
      clearcoat: 0.95,
    });

    const hydraulicLineMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.96,
      roughness: 0.20,
    });

    const brakeCoolingDuctMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.90,
      roughness: 0.25,
    });

    // ── 2. Four Corners ──
    // Front Left (305/30ZR20, width 0.28m, red centerlock, 10-piston front caliper)
    group.add(this.createWheelCorner(
      frontAxleX,
      tireRadiusM,
      -halfTfM,
      tireRadiusM,
      0.28,
      0.21,
      rimStyle,
      tireRubberMat,
      tireLetteringMat,
      treadGrooveMat,
      rimFaceMat,
      finVaneMat,
      centerLockRedMat,
      lugNutMat,
      lockPinMat,
      carbonCeramicRotorMat,
      rotorBellMat,
      titaniumBobbinMat,
      brakeCaliperFrontMat,
      hydraulicLineMat,
      brakeCoolingDuctMat,
      true,
      true
    ));

    // Front Right (305/30ZR20, width 0.28m, blue centerlock, 10-piston front caliper)
    group.add(this.createWheelCorner(
      frontAxleX,
      tireRadiusM,
      halfTfM,
      tireRadiusM,
      0.28,
      0.21,
      rimStyle,
      tireRubberMat,
      tireLetteringMat,
      treadGrooveMat,
      rimFaceMat,
      finVaneMat,
      centerLockBlueMat,
      lugNutMat,
      lockPinMat,
      carbonCeramicRotorMat,
      rotorBellMat,
      titaniumBobbinMat,
      brakeCaliperFrontMat,
      hydraulicLineMat,
      brakeCoolingDuctMat,
      false,
      true
    ));

    // Rear Left (335/30ZR21, width 0.32m, red centerlock, 6-piston rear caliper)
    group.add(this.createWheelCorner(
      rearAxleX,
      tireRadiusM,
      -halfTrM,
      tireRadiusM * 1.02,
      0.32,
      0.195,
      rimStyle,
      tireRubberMat,
      tireLetteringMat,
      treadGrooveMat,
      rimFaceMat,
      finVaneMat,
      centerLockRedMat,
      lugNutMat,
      lockPinMat,
      carbonCeramicRotorMat,
      rotorBellMat,
      titaniumBobbinMat,
      brakeCaliperRearMat,
      hydraulicLineMat,
      brakeCoolingDuctMat,
      true,
      false
    ));

    // Rear Right (335/30ZR21, width 0.32m, blue centerlock, 6-piston rear caliper)
    group.add(this.createWheelCorner(
      rearAxleX,
      tireRadiusM,
      halfTrM,
      tireRadiusM * 1.02,
      0.32,
      0.195,
      rimStyle,
      tireRubberMat,
      tireLetteringMat,
      treadGrooveMat,
      rimFaceMat,
      finVaneMat,
      centerLockBlueMat,
      lugNutMat,
      lockPinMat,
      carbonCeramicRotorMat,
      rotorBellMat,
      titaniumBobbinMat,
      brakeCaliperRearMat,
      hydraulicLineMat,
      brakeCoolingDuctMat,
      false,
      false
    ));

    return group;
  }

  private static createWheelCorner(
    x: number,
    y: number,
    z: number,
    radius: number,
    tireWidth: number,
    rotorRadius: number,
    rimStyle: RimArchitectureStyle,
    tireMat: THREE.Material,
    tireLetteringMat: THREE.Material,
    treadMat: THREE.Material,
    rimFaceMat: THREE.Material,
    finVaneMat: THREE.Material,
    centerLockMat: THREE.Material,
    lugNutMat: THREE.Material,
    lockPinMat: THREE.Material,
    rotorMat: THREE.Material,
    bellMat: THREE.Material,
    bobbinMat: THREE.Material,
    caliperMat: THREE.Material,
    hoseMat: THREE.Material,
    ductMat: THREE.Material,
    isLeft: boolean,
    isFront: boolean
  ): THREE.Group {
    const wheelGroup = new THREE.Group();
    wheelGroup.name = `WheelCorner_${isLeft ? 'L' : 'R'}_${isFront ? 'Front' : 'Rear'}`;
    wheelGroup.position.set(x, y, z);

    const rimRadius = radius * 0.70;
    const zDir = isLeft ? -1 : 1;

    // 1. Michelin Performance Tire Main Cylinder
    const tireGeo = new THREE.CylinderGeometry(radius, radius, tireWidth, 36);
    tireGeo.rotateX(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.castShadow = true;
    wheelGroup.add(tire);

    // 2. 3 Longitudinal Asymmetric Tread Grooves on Tire Crown
    for (let g = -1; g <= 1; g++) {
      const grooveGeo = new THREE.CylinderGeometry(radius * 1.002, radius * 1.002, 0.012, 36, 1, true);
      grooveGeo.rotateX(Math.PI / 2);
      const groove = new THREE.Mesh(grooveGeo, treadMat);
      groove.position.z = g * (tireWidth * 0.22);
      wheelGroup.add(groove);
    }

    // 3. Lateral Tread Sipes (8 Radial Sipe Pairs for Competition Look)
    for (let s = 0; s < 12; s++) {
      const sAngle = (s / 12) * Math.PI * 2;
      const sipeGeo = new THREE.BoxGeometry(0.008, 0.004, tireWidth * 0.75);
      const sipe = new THREE.Mesh(sipeGeo, treadMat);
      sipe.position.set(Math.cos(sAngle) * (radius * 0.998), Math.sin(sAngle) * (radius * 0.998), 0);
      sipe.rotation.z = sAngle + 0.15;
      wheelGroup.add(sipe);
    }

    // 4. White Tire Sidewall Decal Rings (Michelin Cup 2 R Branding)
    const decalRingGeo = new THREE.RingGeometry(radius * 0.78, radius * 0.86, 32);
    const decalRing = new THREE.Mesh(decalRingGeo, tireLetteringMat);
    decalRing.position.z = zDir * (tireWidth / 2 + 0.002);
    if (!isLeft) decalRing.rotation.y = Math.PI;
    wheelGroup.add(decalRing);

    // 5. Dark Titanium Rim Barrel
    const barrelGeo = new THREE.CylinderGeometry(rimRadius, rimRadius * 0.92, tireWidth * 0.96, 32);
    barrelGeo.rotateX(Math.PI / 2);
    const barrel = new THREE.Mesh(barrelGeo, finVaneMat);
    wheelGroup.add(barrel);

    // 6. Interchangeable Rim Face Assembly
    const faceGroup = this.buildRimFace(rimStyle, rimRadius, tireWidth, zDir, rimFaceMat, finVaneMat, centerLockMat, lugNutMat, lockPinMat);
    wheelGroup.add(faceGroup);

    // 7. Valve Stem with Anodized Cap
    const stemGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.025, 8);
    stemGeo.rotateX(Math.PI / 2);
    const stem = new THREE.Mesh(stemGeo, lugNutMat);
    stem.position.set(rimRadius * 0.78, 0, zDir * (tireWidth / 2 - 0.01));
    stem.rotation.z = 0.35;
    wheelGroup.add(stem);

    // 8. Inboard Cross-Drilled Carbon Ceramic Rotor & Floating Drive Bobbins
    const rotorGeo = new THREE.CylinderGeometry(rotorRadius, rotorRadius, 0.028, 32);
    rotorGeo.rotateX(Math.PI / 2);
    const rotor = new THREE.Mesh(rotorGeo, rotorMat);
    rotor.position.z = -zDir * (tireWidth * 0.24);

    const bellGeo = new THREE.CylinderGeometry(rotorRadius * 0.44, rotorRadius * 0.44, 0.032, 24);
    bellGeo.rotateX(Math.PI / 2);
    const bell = new THREE.Mesh(bellGeo, bellMat);
    bell.position.z = -zDir * (tireWidth * 0.24);

    // 10 Floating Titanium Rotor Mounting Drive Bobbins
    const bobbinGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.034, 12);
    bobbinGeo.rotateX(Math.PI / 2);
    for (let b = 0; b < 10; b++) {
      const angle = (b / 10) * Math.PI * 2;
      const bX = Math.cos(angle) * (rotorRadius * 0.48);
      const bY = Math.sin(angle) * (rotorRadius * 0.48);
      const bobbin = new THREE.Mesh(bobbinGeo, bobbinMat);
      bobbin.position.set(bX, bY, -zDir * (tireWidth * 0.24));
      wheelGroup.add(bobbin);
    }

    // 8b. Internal Directional Rotor Cooling Vanes (16 radial vanes visible in rotor gap)
    const vaneGeo = new THREE.BoxGeometry(rotorRadius * 0.45, 0.008, 0.014);
    for (let v = 0; v < 16; v++) {
      const vAngle = (v / 16) * Math.PI * 2;
      const vane = new THREE.Mesh(vaneGeo, bellMat);
      vane.position.set(
        Math.cos(vAngle) * (rotorRadius * 0.72),
        Math.sin(vAngle) * (rotorRadius * 0.72),
        -zDir * (tireWidth * 0.24)
      );
      vane.rotation.z = vAngle + 0.35;
      wheelGroup.add(vane);
    }

    wheelGroup.add(rotor, bell);

    // 9. High-Performance Monobloc Caliper (10-Piston Front / 6-Piston Rear)
    const caliperLen = isFront ? 0.24 : 0.18;
    const caliperHeight = isFront ? 0.12 : 0.10;
    const caliperGeo = new THREE.BoxGeometry(caliperLen, caliperHeight, 0.072);
    const caliper = new THREE.Mesh(caliperGeo, caliperMat);
    caliper.position.set(0, rotorRadius * 0.70, -zDir * (tireWidth * 0.24));
    caliper.rotation.z = 0.45;

    // Machined Piston Bore Bosses along Caliper Body
    const pistonCount = isFront ? 5 : 3;
    const pistonGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.008, 16);
    pistonGeo.rotateX(Math.PI / 2);
    for (let p = 0; p < pistonCount; p++) {
      const pX = -caliperLen * 0.36 + p * (caliperLen * 0.72 / (pistonCount - 1));
      const pistonOuter = new THREE.Mesh(pistonGeo, bobbinMat);
      pistonOuter.position.set(pX, 0, 0.038);
      caliper.add(pistonOuter);
    }

    // Dual Caliper Bleeder Screws with Rubber Caps
    [-0.04, 0.04].forEach((bX) => {
      const bleederGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.016, 8);
      const bleeder = new THREE.Mesh(bleederGeo, bobbinMat);
      bleeder.position.set(bX, caliperHeight / 2 + 0.008, 0);
      caliper.add(bleeder);
    });

    // Caliper Racing Script Logo Plaque
    const logoPlaqueGeo = new THREE.BoxGeometry(caliperLen * 0.60, caliperHeight * 0.28, 0.004);
    const logoPlaqueMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.8 });
    const logoPlaque = new THREE.Mesh(logoPlaqueGeo, logoPlaqueMat);
    logoPlaque.position.set(0, 0, 0.039);
    caliper.add(logoPlaque);

    // Braided Stainless Steel Hydraulic Line Routing with Banjo Bolt
    const banjoGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.014, 12);
    const banjo = new THREE.Mesh(banjoGeo, bobbinMat);
    banjo.position.set(-caliperLen * 0.42, caliperHeight * 0.38, 0);
    caliper.add(banjo);

    const hoseGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.16, 8);
    const hose = new THREE.Mesh(hoseGeo, hoseMat);
    hose.position.set(-caliperLen * 0.42, caliperHeight * 0.46, 0);
    hose.rotation.z = 0.8;
    caliper.add(hose);

    // ABS Wheel Speed Sensor Wire Loom
    const absWireGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.18, 8);
    const absWireMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9, metalness: 0.1 });
    const absWire = new THREE.Mesh(absWireGeo, absWireMat);
    absWire.position.set(0, rotorRadius * 0.35, -zDir * (tireWidth * 0.28));
    absWire.rotation.x = Math.PI / 4;
    wheelGroup.add(absWire);

    // Carbon Fiber Brake Cooling Inflow Scoop
    const ductGeo = new THREE.BoxGeometry(0.12, 0.06, 0.05);
    const duct = new THREE.Mesh(ductGeo, ductMat);
    duct.position.set(rotorRadius * 0.55, -rotorRadius * 0.2, -zDir * (tireWidth * 0.24));
    duct.rotation.z = -0.35;

    wheelGroup.add(caliper, duct);
    return wheelGroup;
  }

  /**
   * Builds one of the 5 distinct rim face designs
   */
  private static buildRimFace(
    style: RimArchitectureStyle,
    rimRadius: number,
    tireWidth: number,
    zDir: number,
    rimMat: THREE.Material,
    accentMat: THREE.Material,
    centerLockMat: THREE.Material,
    lugNutMat: THREE.Material,
    lockPinMat: THREE.Material
  ): THREE.Group {
    const faceGroup = new THREE.Group();
    faceGroup.position.z = zDir * (tireWidth / 2 - 0.015);

    // Outer Lip Bezel Ring
    const lipGeo = new THREE.TorusGeometry(rimRadius * 0.98, 0.012, 12, 32);
    const lip = new THREE.Mesh(lipGeo, rimMat);
    faceGroup.add(lip);

    switch (style) {
      case 'multi_spoke': {
        // 10 Forged Concave Radial Spokes
        const spokeCount = 10;
        const spokeGeo = new THREE.BoxGeometry(0.018, rimRadius * 0.82, 0.022);
        for (let i = 0; i < spokeCount; i++) {
          const angle = (i / spokeCount) * Math.PI * 2;
          const spoke = new THREE.Mesh(spokeGeo, rimMat);
          const r = rimRadius * 0.46;
          spoke.position.set(Math.cos(angle) * r, Math.sin(angle) * r, -0.005);
          spoke.rotation.z = angle + Math.PI / 2;
          faceGroup.add(spoke);
        }
        this.addLugNuts(faceGroup, rimRadius * 0.22, zDir, lugNutMat);
        break;
      }

      case 'mesh_bbs': {
        // Classic 8-Y Cross-Lace Motorsport Mesh
        const forkCount = 8;
        const forkGeo = new THREE.BoxGeometry(0.012, rimRadius * 0.52, 0.018);
        for (let i = 0; i < forkCount; i++) {
          const baseAngle = (i / forkCount) * Math.PI * 2;
          for (let fork = -1; fork <= 1; fork += 2) {
            const spoke = new THREE.Mesh(forkGeo, rimMat);
            const angle = baseAngle + fork * 0.12;
            const r = rimRadius * 0.52;
            spoke.position.set(Math.cos(angle) * r, Math.sin(angle) * r, -0.008);
            spoke.rotation.z = baseAngle + (fork * 0.28) + Math.PI / 2;
            faceGroup.add(spoke);
          }
        }
        // Stepped deep dish inner barrel ring
        const stepRingGeo = new THREE.TorusGeometry(rimRadius * 0.72, 0.008, 12, 32);
        const stepRing = new THREE.Mesh(stepRingGeo, rimMat);
        stepRing.position.z = -0.012;
        faceGroup.add(stepRing);
        this.addLugNuts(faceGroup, rimRadius * 0.22, zDir, lugNutMat);
        break;
      }

      case 'split_5': {
        // Twin 5-Spoke Split
        const pairCount = 5;
        const spokeGeo = new THREE.BoxGeometry(0.014, rimRadius * 0.84, 0.024);
        for (let i = 0; i < pairCount; i++) {
          const baseAngle = (i / pairCount) * Math.PI * 2;
          for (let p = -1; p <= 1; p += 2) {
            const spoke = new THREE.Mesh(spokeGeo, rimMat);
            const angle = baseAngle + p * 0.08;
            const r = rimRadius * 0.46;
            spoke.position.set(Math.cos(angle) * r, Math.sin(angle) * r, -0.006);
            spoke.rotation.z = angle + Math.PI / 2;
            faceGroup.add(spoke);
          }
        }
        this.addCenterLock(faceGroup, zDir, centerLockMat, lockPinMat);
        break;
      }

      case 'solid_disc': {
        // Aerodynamic Solid EV / Formula Disc with perimeter slots
        const discGeo = new THREE.CylinderGeometry(rimRadius * 0.94, rimRadius * 0.94, 0.018, 36);
        discGeo.rotateX(Math.PI / 2);
        const disc = new THREE.Mesh(discGeo, rimMat);
        faceGroup.add(disc);

        // 6 Outer cooling slots
        const slotGeo = new THREE.BoxGeometry(0.014, rimRadius * 0.18, 0.024);
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const slot = new THREE.Mesh(slotGeo, accentMat);
          const r = rimRadius * 0.82;
          slot.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0.002);
          slot.rotation.z = angle + Math.PI / 2;
          faceGroup.add(slot);
        }
        this.addCenterLock(faceGroup, zDir, centerLockMat, lockPinMat);
        break;
      }

      case 'turbofan':
      default: {
        // Main Brushed Flat Disc Face
        const discGeo = new THREE.CylinderGeometry(rimRadius * 0.82, rimRadius * 0.82, 0.018, 32);
        discGeo.rotateX(Math.PI / 2);
        const disc = new THREE.Mesh(discGeo, rimMat);
        faceGroup.add(disc);

        // Outer Turbine Fin Ring (24 Radial Extraction Vanes)
        const vaneGeo = new THREE.BoxGeometry(0.012, rimRadius * 0.18, 0.024);
        for (let i = 0; i < 24; i++) {
          const angle = (i / 24) * Math.PI * 2;
          const vane = new THREE.Mesh(vaneGeo, accentMat);
          const r = rimRadius * 0.89;
          vane.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0);
          vane.rotation.z = angle + 0.25;
          faceGroup.add(vane);
        }
        this.addCenterLock(faceGroup, zDir, centerLockMat, lockPinMat);
        break;
      }
    }

    return faceGroup;
  }

  private static addCenterLock(parent: THREE.Group, zDir: number, centerLockMat: THREE.Material, lockPinMat: THREE.Material) {
    const hubGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.035, 20);
    hubGeo.rotateX(Math.PI / 2);
    const hub = new THREE.Mesh(hubGeo, centerLockMat);
    hub.position.z = zDir * 0.012;

    const pinGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.065, 8);
    const pin = new THREE.Mesh(pinGeo, lockPinMat);
    pin.position.set(0, 0, zDir * 0.022);
    pin.rotation.z = Math.PI / 4;
    hub.add(pin);

    parent.add(hub);
  }

  private static addLugNuts(parent: THREE.Group, boltCircleRadius: number, zDir: number, lugNutMat: THREE.Material) {
    const centerCapGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.024, 16);
    centerCapGeo.rotateX(Math.PI / 2);
    const centerCap = new THREE.Mesh(centerCapGeo, lugNutMat);
    centerCap.position.z = zDir * 0.006;
    parent.add(centerCap);

    const lugGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.028, 6);
    lugGeo.rotateX(Math.PI / 2);
    for (let l = 0; l < 5; l++) {
      const angle = (l / 5) * Math.PI * 2;
      const lug = new THREE.Mesh(lugGeo, lugNutMat);
      lug.position.set(Math.cos(angle) * boltCircleRadius, Math.sin(angle) * boltCircleRadius, zDir * 0.01);
      parent.add(lug);
    }
  }
}
