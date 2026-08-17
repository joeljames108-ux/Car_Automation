// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — MODULAR INTERIOR 3D GENERATOR
// ============================================================================
// Procedurally constructs high-detail Three.js meshes for all modular interior
// components: Dashboards 01-05, Clusters, Steering Wheels, Seats, Consoles & Lightstrips.
// ============================================================================

import * as THREE from 'three';
import {
  ModularInteriorConfiguration,
  InteriorTrimGrade,
} from '../types/modularInteriorTypes';
import {
  DASHBOARD_CATALOG,
  INSTRUMENT_CLUSTER_CATALOG,
  STEERING_WHEEL_CATALOG,
  SEATING_CATALOG,
  CENTER_CONSOLE_CATALOG,
} from '../manifests/modularInteriorManifest';

export class ModularInterior3DGenerator {
  /**
   * Constructs the full modular 3D interior Three.js Group based on user selections.
   */
  public static buildModularInterior(
    config: Partial<ModularInteriorConfiguration>,
    wheelbaseMm: number,
    trackWidthMm: number
  ): THREE.Group {
    const interiorRoot = new THREE.Group();
    interiorRoot.name = 'ModularInteriorRoot';

    const wbM = wheelbaseMm / 1000;
    const halfTrM = (trackWidthMm / 2) / 1000;

    const dashId = config.dashboardId || 'DASHBOARD_01_EXECUTIVE';
    const clusterId = config.instrumentClusterId || 'CLUSTER_VIRTUAL_COCKPIT_12_3';
    const wheelId = config.steeringWheelId || 'STEERING_FLAT_BOTTOM_SPORT';
    const seatId = config.frontSeatsId || 'SEATS_SPORT_BOLSTERED';
    const consoleId = config.centerConsoleId || 'CONSOLE_SPORT_GATED';
    const trimGrade = config.primaryTrimGrade || 'nappa_leather';
    const ambientColorHex = config.ambientLightingColorHex || '#06b6d4'; // Cyan

    // 1. Build Modular Dashboard
    const dashboardMesh = this.buildDashboard(dashId, halfTrM, trimGrade);
    interiorRoot.add(dashboardMesh);

    // 2. Build Instrument Cluster (Mounted on Dashboard)
    const clusterMesh = this.buildCluster(clusterId);
    clusterMesh.position.set(-0.35, 0.74, -0.32);
    interiorRoot.add(clusterMesh);

    // 3. Build Steering Column & Wheel
    const wheelMesh = this.buildSteeringWheel(wheelId, trimGrade);
    wheelMesh.position.set(-0.46, 0.7, -0.32);
    interiorRoot.add(wheelMesh);

    // 4. Build Center Console
    const consoleMesh = this.buildCenterConsole(consoleId, wbM, trimGrade);
    consoleMesh.position.set(-wbM * 0.38, 0.32, 0);
    interiorRoot.add(consoleMesh);

    // 5. Build Front Seats (Driver & Passenger)
    const driverSeat = this.buildSeat(seatId, trimGrade);
    driverSeat.position.set(-wbM * 0.42, 0.28, -0.34);
    const passSeat = this.buildSeat(seatId, trimGrade);
    passSeat.position.set(-wbM * 0.42, 0.28, 0.34);
    interiorRoot.add(driverSeat, passSeat);

    // 6. Build Ambient Fiber-Optic Light Strip
    const lightStrip = this.buildAmbientLightstrip(halfTrM, ambientColorHex);
    lightStrip.position.set(-0.24, 0.68, 0);
    interiorRoot.add(lightStrip);

    return interiorRoot;
  }

  // ── 1. DASHBOARD GENERATOR ──
  private static buildDashboard(dashId: string, halfTrM: number, trim: InteriorTrimGrade): THREE.Group {
    const group = new THREE.Group();
    group.name = `Dashboard_${dashId}`;

    const mainMat = this.getTrimMaterial(trim);
    const accentMat = this.getTrimMaterial('forged_carbon');

    // Main Upper Dash Wing
    const upperGeo = new THREE.BoxGeometry(0.46, 0.18, halfTrM * 1.5);
    const upper = new THREE.Mesh(upperGeo, mainMat);
    upper.position.set(-0.25, 0.72, 0);
    group.add(upper);

    // Lower Knee Bolster Sub-frame
    const lowerGeo = new THREE.BoxGeometry(0.38, 0.16, halfTrM * 1.4);
    const lower = new THREE.Mesh(lowerGeo, accentMat);
    lower.position.set(-0.22, 0.58, 0);
    group.add(lower);

    // Center Infotainment Display
    const screenGeo = new THREE.BoxGeometry(0.03, 0.16, 0.32);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(-0.23, 0.76, 0.05);
    group.add(screen);

    return group;
  }

  // ── 2. CLUSTER GENERATOR ──
  private static buildCluster(clusterId: string): THREE.Group {
    const group = new THREE.Group();
    group.name = `Cluster_${clusterId}`;

    if (clusterId === 'CLUSTER_ANALOG_DUAL_DIALS') {
      const dialMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const bezelMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95, roughness: 0.1 });

      const speedo = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 24), dialMat);
      speedo.rotation.z = Math.PI / 2;
      speedo.position.set(0, 0, -0.07);

      const tach = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 24), dialMat);
      tach.rotation.z = Math.PI / 2;
      tach.position.set(0, 0, 0.07);

      group.add(speedo, tach);
    } else {
      // Digital Screen Display
      const screenGeo = new THREE.BoxGeometry(0.02, 0.11, 0.26);
      const screenMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      group.add(screen);
    }

    return group;
  }

  // ── 3. STEERING WHEEL GENERATOR ──
  private static buildSteeringWheel(wheelId: string, trim: InteriorTrimGrade): THREE.Group {
    const group = new THREE.Group();
    group.name = `Steering_${wheelId}`;

    const wheelMat = this.getTrimMaterial(trim);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.2 });

    // Steering Column Shaft
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.28, 12), metalMat);
    col.position.set(0.1, -0.06, 0);
    col.rotation.z = -Math.PI / 6;
    group.add(col);

    if (wheelId === 'STEERING_GT3_YOKE') {
      // Yoke Rectangular Grip Frame
      const yokeGeo = new THREE.BoxGeometry(0.03, 0.18, 0.28);
      const yoke = new THREE.Mesh(yokeGeo, wheelMat);
      group.add(yoke);
    } else {
      // Round or Flat-Bottom Torus Rim
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.016, 12, 24), wheelMat);
      rim.rotation.y = Math.PI / 2;
      group.add(rim);
    }

    // Center Horn Boss
    const center = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 16), metalMat);
    center.rotation.z = Math.PI / 2;
    group.add(center);

    return group;
  }

  // ── 4. CENTER CONSOLE GENERATOR ──
  private static buildCenterConsole(consoleId: string, wbM: number, trim: InteriorTrimGrade): THREE.Group {
    const group = new THREE.Group();
    group.name = `Console_${consoleId}`;

    const mainMat = this.getTrimMaterial('forged_carbon');
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.2 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(wbM * 0.45, 0.16, 0.22), mainMat);
    group.add(base);

    // Shifter Lever / Rotary Dial
    const shifter = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.09, 12), metalMat);
    shifter.position.set(0.08, 0.1, 0);
    group.add(shifter);

    return group;
  }

  // ── 5. SEATING GENERATOR ──
  private static buildSeat(seatId: string, trim: InteriorTrimGrade): THREE.Group {
    const group = new THREE.Group();
    group.name = `Seat_${seatId}`;

    const seatMat = this.getTrimMaterial(trim);
    const shellMat = this.getTrimMaterial('forged_carbon');

    // Seat Bottom Cushion
    const bottom = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.12, 0.42), seatMat);
    bottom.position.y = 0;

    // Seat Backrest Bolster
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.54, 0.42), seatMat);
    back.position.set(-0.16, 0.28, 0);
    back.rotation.z = -0.15;

    // Headrest
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.14, 0.24), seatMat);
    head.position.set(-0.23, 0.62, 0);

    // Structural Back Shell
    const shell = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.58, 0.44), shellMat);
    shell.position.set(-0.21, 0.28, 0);
    shell.rotation.z = -0.15;

    group.add(bottom, back, head, shell);
    return group;
  }

  // ── 6. AMBIENT LIGHTSTRIP GENERATOR ──
  private static buildAmbientLightstrip(halfTrM: number, colorHex: string): THREE.Mesh {
    const lightMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colorHex),
    });

    const stripGeo = new THREE.BoxGeometry(0.015, 0.012, halfTrM * 1.48);
    const strip = new THREE.Mesh(stripGeo, lightMat);
    strip.name = 'AmbientLightstrip';
    return strip;
  }

  // ── PBR MATERIAL FACTORY ──
  private static getTrimMaterial(trim: InteriorTrimGrade): THREE.MeshStandardMaterial {
    switch (trim) {
      case 'forged_carbon':
        return new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.25, metalness: 0.6 });
      case 'open_pore_wood':
        return new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7, metalness: 0.05 });
      case 'alcantara_race':
        return new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.95, metalness: 0.0 });
      case 'brushed_aluminum':
        return new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.25, metalness: 0.95 });
      case 'nappa_leather':
      default:
        return new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.75, metalness: 0.1 });
    }
  }
}
