// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — HIGH-FIDELITY SEDAN CHASSIS 01
// ============================================================================
// Constructs a production-grade modular unibody chassis fulfilling the
// ChassisAssetContract with hydroformed box rails, cast shock towers,
// central backbone tunnel, subframes, and visible machined socket bosses.
// ============================================================================

import * as THREE from 'three';
import { ChassisAssetContract } from '../contracts/assetContracts';
import { MasterAttachmentSocketEngine } from '../physics/masterAttachmentSocketEngine';
import { AutomotivePBRMaterialSystem } from '../materials/automotivePBRMaterialSystem';
import { MaterialGrade } from '../../sim/assemblyTypes';

export class HighFidelitySedanChassisGenerator {
  /**
   * Complete ChassisAssetContract for Sedan Chassis 01 (Executive Modular Platform).
   */
  public static getSedanChassis01Contract(): ChassisAssetContract {
    const sockets = Array.from(
      MasterAttachmentSocketEngine.getStandardChassisSockets(2820, 1580, 1600, 140).values()
    );

    return {
      assetId: 'SEDAN_CHASSIS_01',
      name: 'Executive Hydroformed High-Strength Steel Unibody Frame',
      subsystem: 'chassis_platform',
      compatibleBodyTypes: ['sedan', 'wagon'],
      compatibleChassisIds: ['SEDAN_CHASSIS_01'],
      massKg: 345,
      centerOfMassOffsetM: [0, 0.38, 0.05],
      boundingDimensionsM: {
        lengthM: 4.68,
        widthM: 1.84,
        heightM: 1.36,
      },
      torsionalStiffnessContributionNmPerDeg: 34500,
      materialGrade: 'forged',
      parentSocketTargetId: 'VEHICLE_ROOT',
      providedSockets: sockets,
      lodBudget: {
        lodLevel: 'LOD0_HERO',
        maxTriangles: 65000,
        minTriangles: 15000,
        maxDrawCalls: 12,
        requiredTextureMaps: ['normal_tangent', 'metallic', 'roughness', 'ambient_occlusion'],
        maxTextureResolution: 2048,
      },
      requiredMaterialSlots: ['ChassisMetallurgy_forged', 'Chassis_ReinforcementRibs', 'Machined_SocketBosses'],
      homologationStatus: 'passed_quality_gate',
      qualityGateScorePct: 98.5,
      wheelbaseRangeMm: [2650, 3050],
      trackWidthFrontRangeMm: [1500, 1680],
      trackWidthRearRangeMm: [1520, 1700],
      groundClearanceNominalMm: 140,
      engineBayVolumeLiters: 480,
      tunnelWidthMm: 240,
      firewallPositionZM: 0.22,
      frontAxlePositionZM: 1.07,
      rearAxlePositionZM: -1.07,
      hasIntegratedRollCage: false,
      suspensionPickupsType: 'double_wishbone',
    };
  }

  /**
   * Constructs the full 3D procedural Three.js hierarchy for Sedan Chassis 01.
   */
  public static buildChassis3D(
    wheelbaseMm: number = 2820,
    trackWidthFrontMm: number = 1580,
    trackWidthRearMm: number = 1600,
    rideHeightMm: number = 140,
    materialGrade: MaterialGrade = 'forged'
  ): THREE.Group {
    const root = new THREE.Group();
    root.name = 'SedanChassis01_Root';

    const wbM = wheelbaseMm / 1000;
    const halfTfM = (trackWidthFrontMm / 2) / 1000;
    const halfTrM = (trackWidthRearMm / 2) / 1000;
    const rhM = rideHeightMm / 1000;

    const frameMat = AutomotivePBRMaterialSystem.getChassisStructuralMaterial(materialGrade);
    const subframeMat = AutomotivePBRMaterialSystem.getChassisStructuralMaterial('cast');
    const socketMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.95,
      roughness: 0.15,
      name: 'Machined_SocketBosses',
    });

    // ── 1. FRONT LONGITUDINAL HYDROFORMED BOX RAILS & CRUSH CANS ──
    const frontRailGeo = new THREE.BoxGeometry(0.12, 0.14, wbM * 0.42);
    const leftFrontRail = new THREE.Mesh(frontRailGeo, frameMat);
    leftFrontRail.position.set(-0.46, rhM + 0.24, wbM * 0.36);
    leftFrontRail.castShadow = true;
    leftFrontRail.receiveShadow = true;

    const rightFrontRail = new THREE.Mesh(frontRailGeo, frameMat);
    rightFrontRail.position.set(0.46, rhM + 0.24, wbM * 0.36);
    rightFrontRail.castShadow = true;
    rightFrontRail.receiveShadow = true;

    // Front Bumper Core Support Crossmember
    const frontCoreCrossGeo = new THREE.BoxGeometry(1.04, 0.12, 0.1);
    const frontCoreCross = new THREE.Mesh(frontCoreCrossGeo, frameMat);
    frontCoreCross.position.set(0, rhM + 0.26, wbM * 0.57);

    // ── 2. CAST ALUMINUM FRONT SHOCK TOWERS & STRUT BRACE BOSSES ──
    const towerGeo = new THREE.CylinderGeometry(0.14, 0.18, 0.38, 16);
    const leftTower = new THREE.Mesh(towerGeo, subframeMat);
    leftTower.position.set(-halfTfM * 0.68, rhM + 0.42, wbM * 0.38);

    const rightTower = new THREE.Mesh(towerGeo, subframeMat);
    rightTower.position.set(halfTfM * 0.68, rhM + 0.42, wbM * 0.38);

    // Transverse Strut Brace Bar
    const braceGeo = new THREE.CylinderGeometry(0.02, 0.02, halfTfM * 1.36, 12);
    const strutBrace = new THREE.Mesh(braceGeo, frameMat);
    strutBrace.rotation.z = Math.PI / 2;
    strutBrace.position.set(0, rhM + 0.58, wbM * 0.38);

    // ── 3. CABIN STRUCTURAL FIREWALL & TORQUE BOX BULKHEAD ──
    const firewallGeo = new THREE.BoxGeometry(halfTfM * 1.6, 0.52, 0.04);
    const firewall = new THREE.Mesh(firewallGeo, frameMat);
    firewall.position.set(0, rhM + 0.46, wbM * 0.14);

    // ── 4. CENTRAL TRANSMISSION / DRIVESHAFT BACKBONE TUNNEL ──
    const tunnelGeo = new THREE.CylinderGeometry(0.15, 0.18, wbM * 0.72, 16, 1, true, -Math.PI / 2, Math.PI);
    const tunnel = new THREE.Mesh(tunnelGeo, frameMat);
    tunnel.rotation.x = Math.PI / 2;
    tunnel.position.set(0, rhM + 0.22, -wbM * 0.16);

    // Floor Pan Sheet Metal
    const floorGeo = new THREE.BoxGeometry(halfTfM * 1.5, 0.02, wbM * 0.74);
    const floorPan = new THREE.Mesh(floorGeo, frameMat);
    floorPan.position.set(0, rhM + 0.12, -wbM * 0.16);

    // ── 5. REINFORCED OUTER SILLS & ROCKER PANELS ──
    const sillGeo = new THREE.BoxGeometry(0.14, 0.18, wbM * 0.82);
    const leftSill = new THREE.Mesh(sillGeo, frameMat);
    leftSill.position.set(-halfTfM * 0.84, rhM + 0.18, -wbM * 0.16);

    const rightSill = new THREE.Mesh(sillGeo, frameMat);
    rightSill.position.set(halfTfM * 0.84, rhM + 0.18, -wbM * 0.16);

    // ── 6. B-PILLAR & C-PILLAR LOWER STRUCTURAL NODES ──
    const pillarNodeGeo = new THREE.BoxGeometry(0.12, 0.46, 0.14);
    const leftBPillar = new THREE.Mesh(pillarNodeGeo, frameMat);
    leftBPillar.position.set(-halfTfM * 0.84, rhM + 0.42, -wbM * 0.06);

    const rightBPillar = new THREE.Mesh(pillarNodeGeo, frameMat);
    rightBPillar.position.set(halfTfM * 0.84, rhM + 0.42, -wbM * 0.06);

    // ── 7. REAR LONGITUDINAL FRAME RAILS & TRUNK CRADLE ──
    const rearRailGeo = new THREE.BoxGeometry(0.11, 0.13, wbM * 0.46);
    const leftRearRail = new THREE.Mesh(rearRailGeo, frameMat);
    leftRearRail.position.set(-0.48, rhM + 0.28, -wbM * 0.42);

    const rightRearRail = new THREE.Mesh(rearRailGeo, frameMat);
    rightRearRail.position.set(0.48, rhM + 0.28, -wbM * 0.42);

    const rearCrossGeo = new THREE.BoxGeometry(1.02, 0.11, 0.09);
    const rearCross = new THREE.Mesh(rearCrossGeo, frameMat);
    rearCross.position.set(0, rhM + 0.3, -wbM * 0.62);

    // ── 8. FRONT & REAR SUBFRAME CRADLES ──
    const frontSubframe = new THREE.Group();
    frontSubframe.name = 'FrontSubframeAssembly';
    const subframeCrossGeo = new THREE.BoxGeometry(0.88, 0.08, 0.34);
    const subCross = new THREE.Mesh(subframeCrossGeo, subframeMat);
    subCross.position.set(0, rhM + 0.14, wbM * 0.38);
    frontSubframe.add(subCross);

    const rearSubframe = new THREE.Group();
    rearSubframe.name = 'RearSubframeAssembly';
    const rearSubCrossGeo = new THREE.BoxGeometry(0.92, 0.08, 0.36);
    const rearSubCross = new THREE.Mesh(rearSubCrossGeo, subframeMat);
    rearSubCross.position.set(0, rhM + 0.16, -wbM * 0.38);
    rearSubframe.add(rearSubCross);

    // ── 9. VISIBLE MACHINED ATTACHMENT SOCKET BOSSES ──
    const socketGroup = new THREE.Group();
    socketGroup.name = 'ChassisAttachmentSockets';

    const standardSockets = MasterAttachmentSocketEngine.getStandardChassisSockets(
      wheelbaseMm,
      trackWidthFrontMm,
      trackWidthRearMm,
      rideHeightMm
    );

    const bossGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.02, 12);
    standardSockets.forEach((sock) => {
      const boss = new THREE.Mesh(bossGeo, socketMat);
      boss.position.set(...sock.relativePositionM);
      boss.name = sock.socketId;
      socketGroup.add(boss);
    });

    root.add(
      leftFrontRail,
      rightFrontRail,
      frontCoreCross,
      leftTower,
      rightTower,
      strutBrace,
      firewall,
      tunnel,
      floorPan,
      leftSill,
      rightSill,
      leftBPillar,
      rightBPillar,
      leftRearRail,
      rightRearRail,
      rearCross,
      frontSubframe,
      rearSubframe,
      socketGroup
    );

    return root;
  }
}
