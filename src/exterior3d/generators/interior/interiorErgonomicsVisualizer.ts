/**
 * ============================================================================
 * 3D CABIN ERGONOMICS & SAE J1100 CLEARANCE VISUALIZER OVERLAY
 * ============================================================================
 * Visualizes in the 3D WebGL viewport:
 * 1. 95th Percentile Driver Eyepoint & Translucent Windshield Sightlines
 * 2. Driver H-Point (Hip Pivot) and Arm Reach Spherical Envelope
 * 3. SAE J1100 Millimeter Clearance Markers (Headroom H61, Legroom L34, Shoulder W3)
 * ============================================================================
 */

import * as THREE from "three";
import { MasterModularInteriorState } from "../../../sim/interior/masterInteriorTypes";
import { MasterCabinPackagingEngine } from "../../../sim/interior/masterCabinPackaging";

export class InteriorErgonomicsVisualizer {
  public static buildErgonomicsOverlay(state: MasterModularInteriorState): THREE.Group {
    const group = new THREE.Group();
    group.name = "ErgonomicsOverlay";

    const clearances = MasterCabinPackagingEngine.calculateCabinPackaging(
      state.bodyType,
      state.wheelbaseMm,
      state.trackWidthMm,
      state.hasTransmissionTunnel,
      state.safety.rollCage !== "none_standard_chassis"
    );

    // 1. Driver Eyepoint Sphere (95th Percentile Male)
    const eyepointMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: true });
    const eyeGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const eyeMesh = new THREE.Mesh(eyeGeo, eyepointMat);
    eyeMesh.position.set(-0.72, 0.88, -0.34);
    group.add(eyeMesh);

    // Eyepoint Sightline Ray Cone through Windshield
    const sightMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
    });
    const coneGeo = new THREE.ConeGeometry(0.35, 1.8, 16, 1, true);
    const coneMesh = new THREE.Mesh(coneGeo, sightMat);
    coneMesh.rotation.x = -Math.PI / 2 + 0.1;
    coneMesh.position.set(-0.72, 0.88, -0.34);
    coneMesh.position.x += 0.9;
    coneMesh.position.y -= 0.1;
    group.add(coneMesh);

    // 2. Driver H-Point (Hip Pivot)
    const hPointMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const hPointMesh = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), hPointMat);
    hPointMesh.position.set(-0.68, 0.38, -0.34);
    group.add(hPointMesh);

    // 3. Driver Arm Reach Envelope (Spherical translucent bubble)
    const reachMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.12,
      wireframe: true,
    });
    const reachMesh = new THREE.Mesh(new THREE.SphereGeometry(0.58, 16, 16), reachMat);
    reachMesh.position.set(-0.68, 0.60, -0.34);
    group.add(reachMesh);

    // 4. SAE J1100 Headroom Line (H61)
    const hrMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 });
    const hrGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.68, 0.38, -0.34),
      new THREE.Vector3(-0.68, 0.38 + clearances.driverHeadroomMm / 1000, -0.34),
    ]);
    const hrLine = new THREE.Line(hrGeo, hrMat);
    group.add(hrLine);

    // 5. SAE J1100 Legroom Line (L34)
    const lrMat = new THREE.LineBasicMaterial({ color: 0xd97706, linewidth: 2 });
    const lrGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.68, 0.38, -0.34),
      new THREE.Vector3(-0.68 + clearances.driverLegroomMm / 1000, 0.12, -0.34),
    ]);
    const lrLine = new THREE.Line(lrGeo, lrMat);
    group.add(lrLine);

    // 6. SAE J1100 Shoulder Room Bar (W3)
    const srMat = new THREE.LineBasicMaterial({ color: 0xd97706, linewidth: 2 });
    const halfSr = clearances.shoulderRoomMm / 1000 / 2;
    const srGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.68, 0.62, -halfSr),
      new THREE.Vector3(-0.68, 0.62, halfSr),
    ]);
    const srLine = new THREE.Line(srGeo, srMat);
    group.add(srLine);

    return group;
  }
}
