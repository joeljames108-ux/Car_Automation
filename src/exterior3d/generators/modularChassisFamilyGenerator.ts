// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — 50-CHASSIS 3D GENERATOR
// ============================================================================
// Procedurally constructs high-detail 3D geometry for any of the 50 chassis
// platforms based on architecture class, wheelbase, track width, and ride height.
// Supports Monocoque, Spaceframe, Ladder Frame, Carbon Monocell, and EV Skateboard.
// ============================================================================

import * as THREE from 'three';
import { Chassis50Definition, ChassisArchitectureClass } from '../types/vehicleConstructionTypes';
import { MaterialGrade } from '../../sim/assemblyTypes';

export class ModularChassisFamilyGenerator {
  /**
   * Builds the complete 3D Three.js Group for any selected chassis platform.
   */
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

    // Get PBR Material for the chosen metallurgy grade
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
    // 1.1 Front Crash Box Rails (Left & Right)
    const railGeo = new THREE.BoxGeometry(0.85, 0.12, 0.08);
    const leftRail = new THREE.Mesh(railGeo, material);
    leftRail.position.set(0.42, rhM + 0.16, -halfTfM * 0.55);
    const rightRail = leftRail.clone();
    rightRail.position.z = halfTfM * 0.55;
    parent.add(leftRail, rightRail);

    // 1.2 Radiator Crossmember Yoke
    const yokeGeo = new THREE.BoxGeometry(0.08, 0.08, halfTfM * 1.2);
    const yoke = new THREE.Mesh(yokeGeo, material);
    yoke.position.set(0.82, rhM + 0.16, 0);
    parent.add(yoke);

    // 1.3 Front Shock Towers (Cast Aluminum Domes)
    const towerGeo = new THREE.CylinderGeometry(0.14, 0.18, 0.28, 16);
    const towerLeft = new THREE.Mesh(towerGeo, material);
    towerLeft.position.set(0.05, rhM + 0.28, -halfTfM * 0.75);
    const towerRight = towerLeft.clone();
    towerRight.position.z = halfTfM * 0.75;
    parent.add(towerLeft, towerRight);

    // 1.4 Cowl Diagonal Braces (Strut to Firewall)
    const braceGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.55, 12);
    const braceLeft = new THREE.Mesh(braceGeo, material);
    braceLeft.position.set(-0.15, rhM + 0.35, -halfTfM * 0.45);
    braceLeft.rotation.z = Math.PI / 4;
    braceLeft.rotation.y = Math.PI / 8;
    const braceRight = braceLeft.clone();
    braceRight.position.z = halfTfM * 0.45;
    braceRight.rotation.y = -Math.PI / 8;
    parent.add(braceLeft, braceRight);

    // 1.5 Corrugated Floor Pan Sheet with Swages
    const floorGeo = new THREE.BoxGeometry(wbM * 0.82, 0.04, halfTfM * 1.55);
    const floor = new THREE.Mesh(floorGeo, material);
    floor.position.set(-wbM * 0.45, rhM + 0.06, 0);
    parent.add(floor);

    // 1.6 Central Driveline Tunnel Arch
    const tunnelGeo = new THREE.CylinderGeometry(0.14, 0.16, wbM * 0.85, 16, 1, false, 0, Math.PI);
    const tunnel = new THREE.Mesh(tunnelGeo, material);
    tunnel.position.set(-wbM * 0.45, rhM + 0.12, 0);
    tunnel.rotation.z = Math.PI / 2;
    tunnel.rotation.x = Math.PI / 2;
    parent.add(tunnel);

    // 1.7 Outer Rocker Sills (Left & Right)
    const sillGeo = new THREE.BoxGeometry(wbM * 0.88, 0.14, 0.12);
    const sillLeft = new THREE.Mesh(sillGeo, material);
    sillLeft.position.set(-wbM * 0.45, rhM + 0.12, -halfTfM * 0.88);
    const sillRight = sillLeft.clone();
    sillRight.position.z = halfTfM * 0.88;
    parent.add(sillLeft, sillRight);

    // 1.8 Stepped Firewall Bulkhead
    const firewallGeo = new THREE.BoxGeometry(0.06, 0.48, halfTfM * 1.6);
    const firewall = new THREE.Mesh(firewallGeo, material);
    firewall.position.set(-0.18, rhM + 0.32, 0);
    parent.add(firewall);

    // 1.9 Rear Shock Towers & Subframe Cradle
    const rearTowerLeft = towerLeft.clone();
    rearTowerLeft.position.set(-wbM, rhM + 0.3, -halfTrM * 0.75);
    const rearTowerRight = towerRight.clone();
    rearTowerRight.position.set(-wbM, rhM + 0.3, halfTrM * 0.75);
    parent.add(rearTowerLeft, rearTowerRight);

    // 1.10 Rear Parcel Shelf Diagonal X-Brace
    const xBraceGeo = new THREE.CylinderGeometry(0.02, 0.02, halfTrM * 1.4, 12);
    const x1 = new THREE.Mesh(xBraceGeo, material);
    x1.position.set(-wbM + 0.25, rhM + 0.48, 0);
    x1.rotation.x = Math.PI / 4;
    const x2 = x1.clone();
    x2.rotation.x = -Math.PI / 4;
    parent.add(x1, x2);
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
    const tubeRadius = 0.025;

    // Main Lower Longitudinal Tubes
    const longTubeGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, wbM * 1.3, 12);
    const longLeft = new THREE.Mesh(longTubeGeo, material);
    longLeft.position.set(-wbM * 0.45, rhM + 0.08, -halfTfM * 0.75);
    longLeft.rotation.z = Math.PI / 2;
    const longRight = longLeft.clone();
    longRight.position.z = halfTfM * 0.75;
    parent.add(longLeft, longRight);

    // Upper Shoulder Tubes
    const upperLeft = longLeft.clone();
    upperLeft.position.set(-wbM * 0.45, rhM + 0.45, -halfTfM * 0.65);
    const upperRight = longRight.clone();
    upperRight.position.set(-wbM * 0.45, rhM + 0.45, halfTfM * 0.65);
    parent.add(upperLeft, upperRight);

    // Triangulated Lateral Cross Braces (6 Verticals)
    for (let i = 0; i < 5; i++) {
      const xPos = 0.3 - (wbM * 1.2 * (i / 4));
      const crossGeo = new THREE.CylinderGeometry(tubeRadius * 0.8, tubeRadius * 0.8, halfTfM * 1.3, 12);
      const cross = new THREE.Mesh(crossGeo, material);
      cross.position.set(xPos, rhM + 0.08, 0);
      cross.rotation.x = Math.PI / 2;
      parent.add(cross);

      // Diagonal Upright Truss
      const diagGeo = new THREE.CylinderGeometry(tubeRadius * 0.8, tubeRadius * 0.8, 0.48, 12);
      const diagL = new THREE.Mesh(diagGeo, material);
      diagL.position.set(xPos, rhM + 0.26, -halfTfM * 0.7);
      diagL.rotation.x = Math.PI / 12;
      const diagR = diagL.clone();
      diagR.position.z = halfTfM * 0.7;
      diagR.rotation.x = -Math.PI / 12;
      parent.add(diagL, diagR);
    }
  }

  // ── 3. HEAVY-DUTY LADDER FRAME GENERATOR ──
  private static buildLadderFrame(
    parent: THREE.Group,
    wbM: number,
    halfTfM: number,
    halfTrM: number,
    rhM: number,
    material: THREE.Material
  ) {
    // Massive Boxed Channel Side Rails (Left & Right)
    const channelGeo = new THREE.BoxGeometry(wbM * 1.5, 0.18, 0.1);
    const leftChannel = new THREE.Mesh(channelGeo, material);
    leftChannel.position.set(-wbM * 0.45, rhM + 0.15, -halfTfM * 0.65);
    const rightChannel = leftChannel.clone();
    rightChannel.position.z = halfTfM * 0.65;
    parent.add(leftChannel, rightChannel);

    // Heavy Round Crossmember Tubular Crossbars (5 Rungs)
    for (let i = 0; i < 6; i++) {
      const xPos = 0.5 - (wbM * 1.4 * (i / 5));
      const rungGeo = new THREE.CylinderGeometry(0.045, 0.045, halfTfM * 1.3, 16);
      const rung = new THREE.Mesh(rungGeo, material);
      rung.position.set(xPos, rhM + 0.15, 0);
      rung.rotation.x = Math.PI / 2;
      parent.add(rung);
    }

    // Rear Solid Axle Leaf Spring Perches
    const perchGeo = new THREE.BoxGeometry(0.2, 0.08, 0.12);
    const perchL = new THREE.Mesh(perchGeo, material);
    perchL.position.set(-wbM, rhM + 0.06, -halfTrM * 0.65);
    const perchR = perchL.clone();
    perchR.position.z = halfTrM * 0.65;
    parent.add(perchL, perchR);
  }

  // ── 4. CARBON MONOCELL TUB GENERATOR ──
  private static buildCarbonMonocell(
    parent: THREE.Group,
    wbM: number,
    halfTfM: number,
    halfTrM: number,
    rhM: number,
    material: THREE.Material
  ) {
    // Seamless One-Piece Carbon Passenger Survival Tub
    const tubGeo = new THREE.BoxGeometry(wbM * 0.72, 0.52, halfTfM * 1.45);
    const tub = new THREE.Mesh(tubGeo, material);
    tub.position.set(-wbM * 0.42, rhM + 0.3, 0);
    parent.add(tub);

    // Front Bolt-On Extruded Aluminum Subframe
    const frontSubGeo = new THREE.BoxGeometry(0.65, 0.22, halfTfM * 1.2);
    const frontSub = new THREE.Mesh(frontSubGeo, material);
    frontSub.position.set(0.38, rhM + 0.18, 0);
    parent.add(frontSub);

    // Rear Powertrain Cradle Subframe
    const rearSubGeo = new THREE.BoxGeometry(0.75, 0.26, halfTrM * 1.25);
    const rearSub = new THREE.Mesh(rearSubGeo, material);
    rearSub.position.set(-wbM - 0.2, rhM + 0.18, 0);
    parent.add(rearSub);
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
    // Structural Underfloor Battery Enclosure Tray
    const trayGeo = new THREE.BoxGeometry(wbM * 0.78, 0.12, halfTfM * 1.55);
    const tray = new THREE.Mesh(trayGeo, material);
    tray.position.set(-wbM * 0.45, rhM + 0.1, 0);
    parent.add(tray);

    // Front Electric Drive Unit (EDU) Inverter Housing
    const frontEduGeo = new THREE.BoxGeometry(0.42, 0.28, 0.48);
    const frontEdu = new THREE.Mesh(frontEduGeo, material);
    frontEdu.position.set(0.05, rhM + 0.18, 0);
    parent.add(frontEdu);

    // Rear Electric Drive Unit (EDU) Dual Inverter Housing
    const rearEduGeo = new THREE.BoxGeometry(0.52, 0.3, 0.58);
    const rearEdu = new THREE.Mesh(rearEduGeo, material);
    rearEdu.position.set(-wbM, rhM + 0.18, 0);
    parent.add(rearEdu);
  }

  // ── PBR METALLURGY MATERIAL FACTORY ──
  private static getMetallurgyMaterial(
    architectureClass: ChassisArchitectureClass,
    grade: MaterialGrade,
    isWireframe: boolean
  ): THREE.MeshStandardMaterial {
    let color = '#718096'; // default steel slate
    let metalness = 0.85;
    let roughness = 0.35;

    if (grade === 'cast') {
      color = '#4a5568';
      roughness = 0.65;
      metalness = 0.75;
    } else if (grade === 'forged') {
      color = '#a0aec0'; // bright aluminum
      roughness = 0.25;
      metalness = 0.92;
    } else if (grade === 'billet') {
      color = '#cbd5e0'; // CNC machine turned
      roughness = 0.15;
      metalness = 0.98;
    } else if (grade === 'titanium') {
      if (architectureClass === 'carbon_composite_monocell' || architectureClass === 'f1_prepreg_monocoque') {
        color = '#1a202c'; // deep carbon weave
        roughness = 0.3;
        metalness = 0.4;
      } else {
        color = '#d6bcfa'; // iridescent titanium hue
        roughness = 0.18;
        metalness = 0.95;
      }
    }

    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      metalness,
      roughness,
      wireframe: isWireframe,
    });
  }
}
