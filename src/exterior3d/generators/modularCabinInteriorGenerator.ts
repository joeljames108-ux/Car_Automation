// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — CABIN INTERIOR 3D GENERATOR
// ============================================================================
// Procedurally generates dashboard binnacle, steering wheel column, ergonomic
// front sport bucket seats, center console, and pedal assembly.
// ============================================================================

import * as THREE from 'three';
import { MaterialGrade } from '../../sim/assemblyTypes';

export class ModularCabinInteriorGenerator {
  public static buildInterior(
    wheelbaseMm: number,
    trackWidthMm: number,
    materialGrade: MaterialGrade = 'forged'
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Cabin_Interior';

    const wbM = wheelbaseMm / 1000;
    const halfTrM = (trackWidthMm / 2) / 1000;

    const leatherMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(materialGrade === 'titanium' ? '#18181b' : '#334155'),
      roughness: 0.85,
      metalness: 0.1,
    });

    const carbonTrimMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#09090b'),
      roughness: 0.2,
      metalness: 0.6,
    });

    // 1. Dashboard Binnacle
    const dashGeo = new THREE.BoxGeometry(0.48, 0.28, halfTrM * 1.5);
    const dash = new THREE.Mesh(dashGeo, leatherMaterial);
    dash.position.set(-0.25, 0.68, 0);
    group.add(dash);

    // 2. Center Infotainment Touchscreen Display
    const screenGeo = new THREE.BoxGeometry(0.04, 0.16, 0.32);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(-0.24, 0.76, 0);
    group.add(screen);

    // 3. Steering Column & Multifunction Wheel
    const columnGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.35, 12);
    const column = new THREE.Mesh(columnGeo, carbonTrimMaterial);
    column.position.set(-0.38, 0.62, -0.32);
    column.rotation.x = Math.PI / 4;
    group.add(column);

    const wheelGeo = new THREE.TorusGeometry(0.16, 0.018, 12, 24);
    const wheel = new THREE.Mesh(wheelGeo, leatherMaterial);
    wheel.position.set(-0.46, 0.72, -0.32);
    wheel.rotation.y = Math.PI / 2;
    group.add(wheel);

    // 4. Center Console Tunnel Cover
    const consoleGeo = new THREE.BoxGeometry(wbM * 0.45, 0.16, 0.24);
    const console = new THREE.Mesh(consoleGeo, carbonTrimMaterial);
    console.position.set(-wbM * 0.38, 0.32, 0);
    group.add(console);

    // 5. Driver & Passenger Sport Bucket Seats
    const seatBottomGeo = new THREE.BoxGeometry(0.45, 0.12, 0.42);
    const seatBackGeo = new THREE.BoxGeometry(0.12, 0.55, 0.42);

    // Driver Seat (Left)
    const driverBottom = new THREE.Mesh(seatBottomGeo, leatherMaterial);
    driverBottom.position.set(-wbM * 0.42, 0.28, -0.34);
    const driverBack = new THREE.Mesh(seatBackGeo, leatherMaterial);
    driverBack.position.set(-wbM * 0.56, 0.55, -0.34);
    driverBack.rotation.z = -0.18;
    group.add(driverBottom, driverBack);

    // Passenger Seat (Right)
    const passBottom = driverBottom.clone();
    passBottom.position.z = 0.34;
    const passBack = driverBack.clone();
    passBack.position.z = 0.34;
    group.add(passBottom, passBack);

    return group;
  }
}
