// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — 50-CHASSIS 3D GENERATOR
// ============================================================================
// Procedurally constructs high-detail 3D geometry for any of the 50 chassis
// platforms based on architecture class, wheelbase, track width, and ride height.
// Supports Monocoque, Spaceframe, Ladder Frame, Carbon Monocell, and EV Skateboard.
//
// Standard Datum:
//   Front Axle: X = +0.45m
//   Rear Axle:  X = +0.45m - wbM
// ============================================================================

import * as THREE from 'three';
import { Chassis50Definition, ChassisArchitectureClass } from '../types/vehicleConstructionTypes';
import { MaterialGrade } from '../../sim/assemblyTypes';
import { ChassisStructuralGeometry, StructuralDimensions } from './chassis/chassisStructuralGeometry';
import { ChassisMaterialLibrary } from './chassis/chassisMaterialLibrary';

export class ModularChassisFamilyGenerator {
  public static buildChassisMesh(
    chassis: Chassis50Definition,
    materialGrade: MaterialGrade = 'forged',
    isWireframe: boolean = false
  ): THREE.Group {
    const chassisGroup = new THREE.Group();
    chassisGroup.name = `Chassis_${chassis.id}`;

    const wbM = chassis.wheelbaseMm / 1000;
    const halfTfM = (chassis.trackWidthFrontMm / 2) / 1000;
    const halfTrM = (chassis.trackWidthRearMm / 2) / 1000;
    const rhM = chassis.rideHeightMm / 1000;

    const chassisMaterial = this.getMetallurgyMaterial(chassis.architectureClass, materialGrade, isWireframe);

    switch (chassis.architectureClass) {
      case 'heavy_duty_ladder_frame':
        this.buildLadderFrame(chassisGroup, wbM, halfTfM, halfTrM, rhM, chassisMaterial);
        break;

      case 'tubular_spaceframe':
      case 'hydroformed_spaceframe':
        this.buildSpaceframe(chassisGroup, wbM, halfTfM, halfTrM, rhM, chassisMaterial);
        break;

      case 'carbon_composite_monocell':
      case 'f1_prepreg_monocoque':
        this.buildCarbonMonocell(chassisGroup, wbM, halfTfM, halfTrM, rhM, chassisMaterial);
        break;

      case 'skateboard_ev_platform':
        this.buildSkateboardEV(chassisGroup, wbM, halfTfM, halfTrM, rhM, chassisMaterial);
        break;

      case 'aluminum_monocoque':
      case 'steel_unibody':
      case 'hybrid_cast_extruded':
      case 'transaxle_backbone':
      default:
        this.buildMonocoqueUnibody(chassisGroup, wbM, halfTfM, halfTrM, rhM, chassisMaterial);
        break;
    }

    return chassisGroup;
  }

  // ── 1. MONOCOQUE UNIBODY GENERATOR ──
  private static buildMonocoqueUnibody(
    parent: THREE.Group,
    wbM: number,
    halfTfM: number,
    halfTrM: number,
    rhM: number,
    material: THREE.Material
  ) {
    const frontAxleX = 0.45;
    const rearAxleX = frontAxleX - wbM;
    const centerFloorX = (frontAxleX + rearAxleX) / 2;

    // 1.1 Front Crash Box Rails
    const railGeo = new THREE.BoxGeometry(0.75, 0.12, 0.08);
    const leftRail = new THREE.Mesh(railGeo, material);
    leftRail.position.set(frontAxleX + 0.35, rhM + 0.16, -halfTfM * 0.55);
    const rightRail = leftRail.clone();
    rightRail.position.z = halfTfM * 0.55;
    parent.add(leftRail, rightRail);

    // 1.2 Radiator Crossmember Yoke
    const yokeGeo = new THREE.BoxGeometry(0.08, 0.08, halfTfM * 1.2);
    const yoke = new THREE.Mesh(yokeGeo, material);
    yoke.position.set(frontAxleX + 0.72, rhM + 0.16, 0);
    parent.add(yoke);

    // 1.3 Front Shock Towers (Centered at Front Axle X = +0.45m)
    const towerGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.26, 16);
    const towerLeft = new THREE.Mesh(towerGeo, material);
    towerLeft.position.set(frontAxleX, rhM + 0.28, -halfTfM * 0.72);
    const towerRight = towerLeft.clone();
    towerRight.position.z = halfTfM * 0.72;
    parent.add(towerLeft, towerRight);

    // 1.4 Cowl Diagonal Braces
    const braceGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.45, 12);
    const braceLeft = new THREE.Mesh(braceGeo, material);
    braceLeft.position.set(frontAxleX - 0.18, rhM + 0.35, -halfTfM * 0.45);
    braceLeft.rotation.z = Math.PI / 4;
    braceLeft.rotation.y = Math.PI / 8;
    const braceRight = braceLeft.clone();
    braceRight.position.z = halfTfM * 0.45;
    braceRight.rotation.y = -Math.PI / 8;
    parent.add(braceLeft, braceRight);

    // 1.5 Corrugated Floor Pan
    const floorGeo = new THREE.BoxGeometry(wbM * 0.84, 0.04, halfTfM * 1.55);
    const floor = new THREE.Mesh(floorGeo, material);
    floor.position.set(centerFloorX, rhM + 0.06, 0);
    parent.add(floor);

    // 1.6 Central Driveline Tunnel Arch
    const tunnelGeo = new THREE.CylinderGeometry(0.12, 0.14, wbM * 0.85, 16, 1, false, 0, Math.PI);
    tunnelGeo.rotateZ(Math.PI / 2);
    tunnelGeo.rotateX(Math.PI / 2);
    const tunnel = new THREE.Mesh(tunnelGeo, material);
    tunnel.position.set(centerFloorX, rhM + 0.12, 0);
    parent.add(tunnel);

    // 1.7 Outer Rocker Sills
    const sillGeo = new THREE.BoxGeometry(wbM * 0.88, 0.12, 0.1);
    const sillLeft = new THREE.Mesh(sillGeo, material);
    sillLeft.position.set(centerFloorX, rhM + 0.12, -halfTfM * 0.88);
    const sillRight = sillLeft.clone();
    sillRight.position.z = halfTfM * 0.88;
    parent.add(sillLeft, sillRight);

    // 1.8 Stepped Firewall Bulkhead
    const firewallGeo = new THREE.BoxGeometry(0.06, 0.45, halfTfM * 1.55);
    const firewall = new THREE.Mesh(firewallGeo, material);
    firewall.position.set(frontAxleX - 0.22, rhM + 0.32, 0);
    parent.add(firewall);

    // 1.9 Rear Shock Towers (Centered at Rear Axle X = rearAxleX)
    const rearTowerLeft = towerLeft.clone();
    rearTowerLeft.position.set(rearAxleX, rhM + 0.28, -halfTrM * 0.72);
    const rearTowerRight = towerRight.clone();
    rearTowerRight.position.set(rearAxleX, rhM + 0.28, halfTrM * 0.72);
    parent.add(rearTowerLeft, rearTowerRight);

    // ═══ DETAILED STRUCTURAL COMPONENTS ═══
    const dims: StructuralDimensions = {
      wheelbaseM: wbM, trackFrontM: halfTfM * 2, trackRearM: halfTrM * 2,
      rideHeightM: rhM, chassisWidth: halfTfM * 2,
      frontOverhangM: 0.35, rearOverhangM: 0.35,
    };
    parent.add(ChassisStructuralGeometry.buildCurvedFrameRails(dims, material));
    parent.add(ChassisStructuralGeometry.buildCrossMembers(dims, material));
    parent.add(ChassisStructuralGeometry.buildFloorPan(dims, material));
    parent.add(ChassisStructuralGeometry.buildDrivelineTunnel(dims, material));
    parent.add(ChassisStructuralGeometry.buildRockerSills(dims, material));
    parent.add(ChassisStructuralGeometry.buildFrontSubframe(dims, material));
    parent.add(ChassisStructuralGeometry.buildRearSubframe(dims, material));
    parent.add(ChassisStructuralGeometry.buildCrashStructures(dims, material));
    parent.add(ChassisStructuralGeometry.buildFirewall(dims, material));
    parent.add(ChassisStructuralGeometry.buildFuelCell(dims, material));
    parent.add(ChassisStructuralGeometry.buildAccessoryTrays(dims, material));
    parent.add(ChassisStructuralGeometry.buildHeatShield(dims, material));
    parent.add(ChassisStructuralGeometry.buildWeldBeads(dims, material));
  }

  // ── 2. TUBULAR SPACEFRAME GENERATOR ──
  private static buildSpaceframe(
    parent: THREE.Group,
    wbM: number,
    halfTfM: number,
    halfTrM: number,
    rhM: number,
    material: THREE.Material
  ) {
    const frontAxleX = 0.45;
    const rearAxleX = frontAxleX - wbM;
    const centerFloorX = (frontAxleX + rearAxleX) / 2;
    const tubeRadius = 0.022;

    // Longitudinal Rails
    const bottomRailGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, wbM * 0.95, 12);
    bottomRailGeo.rotateZ(Math.PI / 2);

    const leftBottomRail = new THREE.Mesh(bottomRailGeo, material);
    leftBottomRail.position.set(centerFloorX, rhM + 0.08, -halfTfM * 0.82);
    const rightBottomRail = leftBottomRail.clone();
    rightBottomRail.position.z = halfTfM * 0.82;

    const leftTopRail = leftBottomRail.clone();
    leftTopRail.position.y = rhM + 0.52;
    const rightTopRail = rightBottomRail.clone();
    rightTopRail.position.y = rhM + 0.52;

    parent.add(leftBottomRail, rightBottomRail, leftTopRail, rightTopRail);

    // 4 Vertical Upright Struts
    const vertGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, 0.44, 12);
    const v1 = new THREE.Mesh(vertGeo, material);
    v1.position.set(frontAxleX - 0.15, rhM + 0.3, -halfTfM * 0.82);
    const v2 = v1.clone();
    v2.position.z = halfTfM * 0.82;
    const v3 = new THREE.Mesh(vertGeo, material);
    v3.position.set(rearAxleX + 0.15, rhM + 0.3, -halfTrM * 0.82);
    const v4 = v3.clone();
    v4.position.z = halfTrM * 0.82;
    parent.add(v1, v2, v3, v4);

    // 4 Transverse Cross-Tubes
    const crossGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, halfTfM * 1.6, 12);
    crossGeo.rotateX(Math.PI / 2);
    const c1 = new THREE.Mesh(crossGeo, material);
    c1.position.set(frontAxleX - 0.15, rhM + 0.08, 0);
    const c2 = new THREE.Mesh(crossGeo, material);
    c2.position.set(frontAxleX - 0.15, rhM + 0.52, 0);
    const c3 = new THREE.Mesh(crossGeo, material);
    c3.position.set(rearAxleX + 0.15, rhM + 0.08, 0);
    const c4 = new THREE.Mesh(crossGeo, material);
    c4.position.set(rearAxleX + 0.15, rhM + 0.52, 0);
    parent.add(c1, c2, c3, c4);

    // 2 Diagonal X-Brace Tubes
    const diagGeo = new THREE.CylinderGeometry(tubeRadius * 0.85, tubeRadius * 0.85, wbM * 0.6, 12);
    diagGeo.rotateZ(Math.PI / 4);
    const d1 = new THREE.Mesh(diagGeo, material);
    d1.position.set(centerFloorX, rhM + 0.3, -halfTfM * 0.82);
    const d2 = d1.clone();
    d2.position.z = halfTfM * 0.82;
    parent.add(d1, d2);
  }

  // ── 3. HEAVY DUTY LADDER FRAME GENERATOR ──
  private static buildLadderFrame(
    parent: THREE.Group,
    wbM: number,
    halfTfM: number,
    halfTrM: number,
    rhM: number,
    material: THREE.Material
  ) {
    const frontAxleX = 0.45;
    const rearAxleX = frontAxleX - wbM;
    const centerFloorX = (frontAxleX + rearAxleX) / 2;
    const totalLength = wbM + 1.2;

    const mainBeamGeo = new THREE.BoxGeometry(totalLength, 0.16, 0.09);
    const leftBeam = new THREE.Mesh(mainBeamGeo, material);
    leftBeam.position.set(centerFloorX, rhM + 0.12, -halfTfM * 0.65);

    const rightBeam = leftBeam.clone();
    rightBeam.position.z = halfTfM * 0.65;
    parent.add(leftBeam, rightBeam);

    const numCrossmembers = 6;
    const crossGeo = new THREE.BoxGeometry(0.1, 0.12, halfTfM * 1.3);
    for (let i = 0; i < numCrossmembers; i++) {
      const cross = new THREE.Mesh(crossGeo, material);
      const posX = centerFloorX - totalLength / 2 + (i + 0.5) * (totalLength / numCrossmembers);
      cross.position.set(posX, rhM + 0.12, 0);
      parent.add(cross);
    }
  }

  // ── 4. CARBON MONOCELL GENERATOR ──
  private static buildCarbonMonocell(
    parent: THREE.Group,
    wbM: number,
    halfTfM: number,
    halfTrM: number,
    rhM: number,
    material: THREE.Material
  ) {
    const frontAxleX = 0.45;
    const rearAxleX = frontAxleX - wbM;
    const centerFloorX = (frontAxleX + rearAxleX) / 2;

    const tubGeo = new THREE.BoxGeometry(wbM * 0.72, 0.42, halfTfM * 1.35);
    const tub = new THREE.Mesh(tubGeo, material);
    tub.position.set(centerFloorX, rhM + 0.24, 0);
    parent.add(tub);

    const noseConeGeo = new THREE.ConeGeometry(halfTfM * 0.55, 0.75, 16);
    noseConeGeo.rotateZ(-Math.PI / 2);
    const noseCone = new THREE.Mesh(noseConeGeo, material);
    noseCone.position.set(frontAxleX + 0.45, rhM + 0.22, 0);
    parent.add(noseCone);
  }

  // ── 5. SKATEBOARD EV PLATFORM GENERATOR ──
  private static buildSkateboardEV(
    parent: THREE.Group,
    wbM: number,
    halfTfM: number,
    halfTrM: number,
    rhM: number,
    material: THREE.Material
  ) {
    const frontAxleX = 0.45;
    const rearAxleX = frontAxleX - wbM;
    const centerFloorX = (frontAxleX + rearAxleX) / 2;

    const trayGeo = new THREE.BoxGeometry(wbM * 0.85, 0.14, halfTfM * 1.6);
    const tray = new THREE.Mesh(trayGeo, material);
    tray.position.set(centerFloorX, rhM + 0.12, 0);
    parent.add(tray);
  }

  private static getMetallurgyMaterial(
    archClass: ChassisArchitectureClass,
    grade: MaterialGrade,
    isWireframe: boolean
  ): THREE.Material {
    const isCarbon = archClass === 'carbon_composite_monocell' || archClass === 'f1_prepreg_monocoque';

    if (isCarbon) {
      return new THREE.MeshPhysicalMaterial({
        color: 0x0a0e18,
        metalness: 0.35,
        roughness: 0.18,
        clearcoat: 0.95,
        clearcoatRoughness: 0.03,
        envMapIntensity: 1.3,
        wireframe: isWireframe,
      });
    }

    const baseColor = grade === 'titanium' ? 0x64748b : 0x94a3b8;
    return new THREE.MeshPhysicalMaterial({
      color: baseColor,
      metalness: 0.92,
      roughness: 0.15,
      clearcoat: 0.6,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.4,
      wireframe: isWireframe,
    });
  }
}
