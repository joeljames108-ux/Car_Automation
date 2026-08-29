// ============================================================================
// MODULAR glTF VEHICLE CONSTRUCTION SYSTEM — VEHICLE DIAGNOSTIC GIZMO
// ============================================================================
// Real-time 3D diagnostic overlay visualizing:
// - Vehicle longitudinal centerline (Z = 0)
// - 4 Wheel Center Crosshair Markers (FL, FR, RL, RR)
// - Front and rear axle reference lines
// - 3D master bounding box wireframe
// - Ground clearance datum plane (Y = 0.10m)
// - Wheel center height datum line (Y = 0.34m)
// - Beltline shoulder datum line (Y = 0.68m)
// - Roof apex height datum plane (Y = 1.18m)
// - World origin marker (0, 0, 0)
// ============================================================================

import * as THREE from 'three';
import { calculateVehicleBounds } from './vehicleDimensions';

export class VehicleDiagnosticGizmo {
  public static createDiagnosticOverlay(
    wheelbaseMm: number,
    trackWidthFrontMm: number,
    trackWidthRearMm: number
  ): THREE.Group {
    const gizmo = new THREE.Group();
    gizmo.name = 'VehicleDiagnosticOverlay';

    const bounds = calculateVehicleBounds(wheelbaseMm, trackWidthFrontMm, trackWidthRearMm);

    // ── 1. Materials ──
    const lineCenterlineMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, linewidth: 2 }); // Cyan
    const lineAxleMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 }); // Emerald
    const lineBoxMat = new THREE.LineBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.75 }); // Indigo
    const lineDatumMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.5 }); // Purple
    const markerWheelMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b }); // Amber
    const originMat = new THREE.MeshBasicMaterial({ color: 0xef4444 }); // Red

    // ── 2. Longitudinal Centerline (Z = 0, along X) ──
    const centerLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(bounds.frontMostX + 0.3, 0.01, 0),
      new THREE.Vector3(bounds.rearMostX - 0.3, 0.01, 0),
    ]);
    const centerLine = new THREE.Line(centerLineGeo, lineCenterlineMat);
    gizmo.add(centerLine);

    // ── 3. Front Axle Line (X = frontAxleX) ──
    const frontAxleGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(bounds.frontAxleX, bounds.wheelCenterY, bounds.frontLeftWheel.z - 0.2),
      new THREE.Vector3(bounds.frontAxleX, bounds.wheelCenterY, bounds.frontRightWheel.z + 0.2),
    ]);
    const frontAxleLine = new THREE.Line(frontAxleGeo, lineAxleMat);
    gizmo.add(frontAxleLine);

    // ── 4. Rear Axle Line (X = rearAxleX) ──
    const rearAxleGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(bounds.rearAxleX, bounds.wheelCenterY, bounds.rearLeftWheel.z - 0.2),
      new THREE.Vector3(bounds.rearAxleX, bounds.wheelCenterY, bounds.rearRightWheel.z + 0.2),
    ]);
    const rearAxleLine = new THREE.Line(rearAxleGeo, lineAxleMat);
    gizmo.add(rearAxleLine);

    // ── 5. Four Wheel Center Markers ──
    const wheelMarkerGeo = new THREE.SphereGeometry(0.035, 12, 8);
    const wheels = [
      bounds.frontLeftWheel,
      bounds.frontRightWheel,
      bounds.rearLeftWheel,
      bounds.rearRightWheel,
    ];

    wheels.forEach((w, idx) => {
      const marker = new THREE.Mesh(wheelMarkerGeo, markerWheelMat);
      marker.position.set(w.x, w.y, w.z);
      marker.name = `WheelCenterMarker_${idx}`;
      gizmo.add(marker);
    });

    // ── 6. Vertical Stance Height Datum Lines (Phase 4) ──
    // Ground Clearance Datum Plane (Y = 0.10m)
    const gcGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(bounds.frontMostX + 0.15, bounds.lowestY, bounds.leftMostZ * 0.9),
      new THREE.Vector3(bounds.frontMostX + 0.15, bounds.lowestY, bounds.rightMostZ * 0.9),
      new THREE.Vector3(bounds.rearMostX - 0.15, bounds.lowestY, bounds.rightMostZ * 0.9),
      new THREE.Vector3(bounds.rearMostX - 0.15, bounds.lowestY, bounds.leftMostZ * 0.9),
      new THREE.Vector3(bounds.frontMostX + 0.15, bounds.lowestY, bounds.leftMostZ * 0.9),
    ]);
    const gcLine = new THREE.Line(gcGeo, lineDatumMat);
    gizmo.add(gcLine);

    // Beltline Datum Line (Y = 0.68m)
    const beltlineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(bounds.frontAxleX + 0.2, 0.68, 0),
      new THREE.Vector3(bounds.rearAxleX - 0.2, 0.68, 0),
    ]);
    const beltlineLine = new THREE.Line(beltlineGeo, lineDatumMat);
    gizmo.add(beltlineLine);

    // ── 7. 3D Master Bounding Box ──
    const boxLength = bounds.frontMostX - bounds.rearMostX;
    const boxWidth = bounds.rightMostZ - bounds.leftMostZ;
    const boxHeight = bounds.highestY - bounds.groundPlaneY;

    const boxCenterX = (bounds.frontMostX + bounds.rearMostX) / 2;
    const boxCenterY = (bounds.highestY + bounds.groundPlaneY) / 2;
    const boxCenterZ = 0;

    const boxGeo = new THREE.BoxGeometry(boxLength, boxHeight, boxWidth);
    const boxEdges = new THREE.EdgesGeometry(boxGeo);
    const boundingBoxLine = new THREE.LineSegments(boxEdges, lineBoxMat);
    boundingBoxLine.position.set(boxCenterX, boxCenterY, boxCenterZ);
    gizmo.add(boundingBoxLine);

    // ── 8. World Origin Datum Marker (0, 0, 0) ──
    const originMarker = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), originMat);
    originMarker.position.set(0, 0, 0);
    originMarker.name = 'WorldOriginDatum';
    gizmo.add(originMarker);

    return gizmo;
  }
}
